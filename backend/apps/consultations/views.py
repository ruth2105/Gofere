from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsConsultant, IsStudent
from apps.notifications.models import Notification
from .models import Consultation
from .serializers import (
    ConsultantConsultationSerializer,
    ConsultantDirectorySerializer,
    ConsultationCompletionSerializer,
    ConsultationConfirmationSerializer,
    ConsultationFeedbackSerializer,
    StudentConsultationSerializer,
)


class ConsultantDirectoryView(generics.ListAPIView):
    serializer_class = ConsultantDirectorySerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = None

    def get_queryset(self):
        from apps.consultants.models import ConsultantProfile

        return (
            ConsultantProfile.objects
            .filter(
                user__is_active=True,
                verification_status='VERIFIED',
                is_available=True,
            )
            .select_related('user')
        )


class StudentConsultationViewSet(viewsets.ModelViewSet):
    serializer_class = StudentConsultationSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return (
            Consultation.objects
            .filter(student=self.request.user)
            .select_related('consultant', 'service')
        )

    def perform_create(self, serializer):
        with transaction.atomic():
            consultation = serializer.save(student=self.request.user)
            Notification.create_notification(
                user=consultation.consultant,
                type='CONSULTATION',
                title='New consultation request',
                message=f'{consultation.student.get_full_name() or consultation.student.email} requested "{consultation.title}".',
                action_url='/consultant/consultations',
                action_text='Review request',
                consultation=consultation,
            )

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel(self, request, pk=None):
        consultation = self.get_object()
        if consultation.status not in ('PENDING', 'CONFIRMED'):
            raise ValidationError({'status': 'Only pending or confirmed consultations can be cancelled.'})
        if _consultation_start(consultation) <= timezone.now():
            raise ValidationError({'scheduled_time': 'A consultation cannot be cancelled after it has started.'})
        consultation.status = 'CANCELLED'
        consultation.save(update_fields=['status', 'updated_at'])
        Notification.create_notification(
            user=consultation.consultant,
            type='CONSULTATION',
            title='Consultation request cancelled',
            message=f'{consultation.student.get_full_name() or consultation.student.email} cancelled "{consultation.title}".',
            action_url='/consultant/consultations',
            action_text='View consultations',
            consultation=consultation,
        )
        return Response(self.get_serializer(consultation).data)

    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        consultation = self.get_object()
        if consultation.status != 'COMPLETED':
            raise ValidationError({'status': 'Feedback is available after a consultation is completed.'})
        if consultation.student_rating is not None:
            raise ValidationError({'rating': 'Feedback has already been submitted.'})
        serializer = ConsultationFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultation.student_rating = serializer.validated_data['rating']
        consultation.student_feedback = serializer.validated_data.get('feedback', '')
        consultation.save(update_fields=['student_rating', 'student_feedback', 'updated_at'])
        return Response(self.get_serializer(consultation).data)


class ConsultantAssignedConsultationsView(generics.ListAPIView):
    serializer_class = ConsultantConsultationSerializer
    permission_classes = [permissions.IsAuthenticated, IsConsultant]
    search_fields = ['student__first_name', 'student__last_name', 'student__email', 'title']
    ordering_fields = ['scheduled_date', 'scheduled_time', 'status', 'updated_at']
    ordering = ['scheduled_date', 'scheduled_time']

    def get_queryset(self):
        queryset = (
            Consultation.objects
            .filter(consultant=self.request.user)
            .select_related('student', 'service')
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            valid_statuses = dict(Consultation.STATUS_CHOICES)
            if status_filter not in valid_statuses:
                raise ValidationError({'status': 'Choose a valid consultation status.'})
            queryset = queryset.filter(status=status_filter)
        return queryset


class ConsultantConsultationActionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsConsultant]

    @transaction.atomic
    def post(self, request, consultation_id, action_name):
        consultation = get_object_or_404(
            Consultation.objects.filter(consultant=request.user).select_related('student', 'service'),
            id=consultation_id,
        )
        now = timezone.now()
        start = _consultation_start(consultation)
        if action_name == 'confirm':
            if consultation.status != 'PENDING':
                raise ValidationError({'status': 'Only pending consultations can be confirmed.'})
            if start <= now:
                raise ValidationError({'scheduled_time': 'Past consultation requests cannot be confirmed.'})
            serializer = ConsultationConfirmationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            consultation.status = 'CONFIRMED'
            consultation.meeting_url = serializer.validated_data.get('meeting_url', '')
            consultation.save(update_fields=['status', 'meeting_url', 'updated_at'])
            Notification.create_notification(
                user=consultation.student,
                type='CONSULTATION',
                title='Consultation confirmed',
                message=f'Your consultation "{consultation.title}" has been confirmed.',
                action_url='/student/consultations',
                action_text='View consultation',
                consultation=consultation,
            )
        elif action_name == 'cancel':
            if consultation.status not in ('PENDING', 'CONFIRMED'):
                raise ValidationError({'status': 'Only pending or confirmed consultations can be cancelled.'})
            if start <= now:
                raise ValidationError({'scheduled_time': 'A consultation cannot be cancelled after it has started.'})
            consultation.status = 'CANCELLED'
            consultation.save(update_fields=['status', 'updated_at'])
            Notification.create_notification(
                user=consultation.student,
                type='CONSULTATION',
                title='Consultation cancelled',
                message=f'Your consultation "{consultation.title}" was cancelled by the consultant.',
                action_url='/student/consultations',
                action_text='View consultations',
                consultation=consultation,
            )
        elif action_name == 'complete':
            if consultation.status != 'CONFIRMED':
                raise ValidationError({'status': 'Only confirmed consultations can be completed.'})
            end = start + timedelta(minutes=consultation.duration_minutes)
            if end > now:
                raise ValidationError({'scheduled_time': 'A consultation can be completed after its scheduled end time.'})
            serializer = ConsultationCompletionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            consultation.status = 'COMPLETED'
            consultation.completed_at = now
            consultation.consultant_notes = serializer.validated_data.get('consultant_notes', '')
            consultation.action_items = serializer.validated_data.get('action_items', [])
            consultation.save(update_fields=[
                'status',
                'completed_at',
                'consultant_notes',
                'action_items',
                'updated_at',
            ])
            Notification.create_notification(
                user=consultation.student,
                type='CONSULTATION',
                title='Consultation completed',
                message=f'Your consultation "{consultation.title}" has been marked complete.',
                action_url='/student/consultations',
                action_text='Rate session',
                consultation=consultation,
            )
        else:
            raise ValidationError({'action': 'Choose confirm, cancel, or complete.'})

        return Response(ConsultantConsultationSerializer(consultation).data, status=status.HTTP_200_OK)


def _consultation_start(consultation):
    try:
        return datetime.combine(
            consultation.scheduled_date,
            consultation.scheduled_time,
            tzinfo=ZoneInfo(consultation.timezone),
        )
    except (TypeError, ValueError, ZoneInfoNotFoundError) as error:
        raise ValidationError({
            'timezone': 'This consultation has invalid time-zone data; contact support.',
        }) from error
