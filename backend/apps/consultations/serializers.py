from datetime import datetime, timedelta, timezone as datetime_timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.services.models import Service
from apps.consultants.models import ConsultantProfile
from .models import Consultation

User = get_user_model()


class ConsultantDirectorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    consultant_id = serializers.UUIDField(source='user_id', read_only=True)

    class Meta:
        model = ConsultantProfile
        fields = (
            'consultant_id',
            'name',
            'company_name',
            'job_title',
            'years_of_experience',
            'bio',
            'specializations',
            'languages',
            'expertise_countries',
            'expertise_fields',
            'consultation_rate',
            'availability_hours',
            'timezone',
        )
        read_only_fields = fields


class StudentConsultationSerializer(serializers.ModelSerializer):
    consultant_name = serializers.CharField(source='consultant.get_full_name', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True, default='')
    consultant = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            role='CONSULTANT',
            is_active=True,
            consultant_profile__verification_status='VERIFIED',
            consultant_profile__is_available=True,
        )
    )
    service = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Consultation
        fields = (
            'id',
            'consultant',
            'consultant_name',
            'service',
            'service_title',
            'type',
            'title',
            'description',
            'scheduled_date',
            'scheduled_time',
            'duration_minutes',
            'timezone',
            'meeting_url',
            'meeting_id',
            'meeting_password',
            'status',
            'student_notes',
            'student_rating',
            'student_feedback',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'consultant_name',
            'service_title',
            'meeting_url',
            'meeting_id',
            'meeting_password',
            'status',
            'student_rating',
            'student_feedback',
            'created_at',
            'updated_at',
        )

    def validate_timezone(self, value):
        try:
            ZoneInfo(value)
        except (TypeError, ValueError, ZoneInfoNotFoundError) as error:
            raise serializers.ValidationError('Use a valid IANA time zone, such as Africa/Addis_Ababa.') from error
        return value

    def validate(self, attrs):
        if self.instance:
            return attrs

        scheduled_date = attrs.get('scheduled_date')
        scheduled_time = attrs.get('scheduled_time')
        time_zone = attrs.get('timezone', 'UTC')
        try:
            requested_start = datetime.combine(
                scheduled_date,
                scheduled_time,
                tzinfo=ZoneInfo(time_zone),
            )
        except (TypeError, ValueError, ZoneInfoNotFoundError) as error:
            raise serializers.ValidationError({
                'timezone': 'Use a valid IANA time zone.',
            }) from error

        if requested_start <= timezone.now():
            raise serializers.ValidationError({
                'scheduled_date': 'Consultation requests must be for a future date and time.',
            })

        attrs['_requested_start_utc'] = requested_start.astimezone(datetime_timezone.utc)
        return attrs

    def create(self, validated_data):
        requested_start_utc = validated_data.pop('_requested_start_utc')
        consultant = validated_data['consultant']
        duration_minutes = validated_data.get('duration_minutes', 60)
        requested_end_utc = requested_start_utc + timedelta(minutes=duration_minutes)
        candidate_date = requested_start_utc.date()

        with transaction.atomic():
            User.objects.select_for_update().get(pk=consultant.pk)
            existing = Consultation.objects.filter(
                consultant=consultant,
                status__in=('PENDING', 'CONFIRMED'),
                scheduled_date__range=(
                    candidate_date - timedelta(days=2),
                    candidate_date + timedelta(days=2),
                ),
            )
            for booking in existing:
                try:
                    booking_start = datetime.combine(
                        booking.scheduled_date,
                        booking.scheduled_time,
                        tzinfo=ZoneInfo(booking.timezone),
                    ).astimezone(datetime_timezone.utc)
                except (TypeError, ValueError, ZoneInfoNotFoundError) as error:
                    raise serializers.ValidationError({
                        'scheduled_time': 'An existing booking has invalid time-zone data; contact support.',
                    }) from error
                booking_end = booking_start + timedelta(minutes=booking.duration_minutes)
                if requested_start_utc < booking_end and requested_end_utc > booking_start:
                    raise serializers.ValidationError({
                        'scheduled_time': 'This consultant already has a pending or confirmed booking at that time.',
                    })

            return super().create(validated_data)


class ConsultantConsultationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True, default='')

    class Meta:
        model = Consultation
        fields = (
            'id',
            'student_name',
            'student_email',
            'service_title',
            'type',
            'title',
            'description',
            'scheduled_date',
            'scheduled_time',
            'duration_minutes',
            'timezone',
            'meeting_url',
            'meeting_id',
            'meeting_password',
            'status',
            'student_notes',
            'consultant_notes',
            'action_items',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class ConsultationConfirmationSerializer(serializers.Serializer):
    meeting_url = serializers.URLField(required=False, allow_blank=True, max_length=200)


class ConsultationCompletionSerializer(serializers.Serializer):
    consultant_notes = serializers.CharField(required=False, allow_blank=True, max_length=10000)
    action_items = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        allow_empty=True,
        max_length=50,
    )


class ConsultationFeedbackSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    feedback = serializers.CharField(required=False, allow_blank=True, max_length=5000)
