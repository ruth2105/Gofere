from django.utils import timezone
from django.db.models import Count
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from apps.accounts.models import User
from apps.common.permissions import IsAdminUser, IsConsultant, IsStudent
from apps.consultations.models import Consultation
from apps.destinations.models import Destination
from apps.scholarships.models import Scholarship
from apps.services.models import Service
from apps.universities.models import University
from .models import Application
from .serializers import ApplicationSerializer, ConsultantApplicationSerializer


class AdminOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        application_status_counts = Application.objects.values('status').annotate(
            count=Count('id')
        )
        consultation_status_counts = Consultation.objects.values('status').annotate(
            count=Count('id')
        )

        return Response({
            'users': {
                'students': User.objects.filter(role='STUDENT').count(),
                'consultants': User.objects.filter(role='CONSULTANT').count(),
                'administrators': User.objects.filter(role__in=['ADMIN', 'SUPERADMIN']).count(),
            },
            'catalogues': {
                'published_scholarships': Scholarship.objects.filter(is_published=True).count(),
                'universities': University.objects.count(),
                'destinations': Destination.objects.count(),
                'active_services': Service.objects.filter(is_active=True).count(),
            },
            'applications': {
                'total': Application.objects.count(),
                'by_status': {
                    item['status']: item['count']
                    for item in application_status_counts
                },
            },
            'consultations': {
                'total': Consultation.objects.count(),
                'by_status': {
                    item['status']: item['count']
                    for item in consultation_status_counts
                },
            },
        })


class ConsultantAssignedApplicationsView(ListAPIView):
    serializer_class = ConsultantApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsConsultant]
    search_fields = ['student__first_name', 'student__last_name', 'student__email']
    ordering_fields = ['updated_at', 'deadline_date', 'status']
    ordering = ['-updated_at']

    def get_queryset(self):
        queryset = (
            Application.objects
            .filter(consultant=self.request.user)
            .select_related('student', 'university', 'scholarship')
        )
        status_filter = self.request.query_params.get('status')
        valid_statuses = dict(Application.STATUS_CHOICES)
        if status_filter:
            if status_filter not in valid_statuses:
                raise ValidationError({'status': 'Choose a valid application status.'})
            queryset = queryset.filter(status=status_filter)
        return queryset


class ApplicationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return (
            Application.objects
            .filter(student=self.request.user)
            .select_related('university', 'scholarship')
        )

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.status != 'DRAFT':
            raise PermissionDenied('Only draft applications can be edited.')
        serializer.save()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        application = self.get_object()
        if application.status != 'DRAFT':
            raise ValidationError({'status': 'Only draft applications can be marked as submitted.'})

        application.submission_date = timezone.now()
        application.add_status_update('SUBMITTED', 'Marked as submitted by the student.')
        return Response(self.get_serializer(application).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if application.status != 'SUBMITTED':
            raise ValidationError({'status': 'Only submitted applications can be withdrawn.'})

        application.add_status_update('WITHDRAWN', 'Withdrawn by the student.')
        return Response(self.get_serializer(application).data, status=status.HTTP_200_OK)
