from rest_framework import serializers

from apps.scholarships.models import Scholarship
from apps.universities.models import University
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    university = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        required=False,
        allow_null=True,
    )
    university_name = serializers.CharField(source='university.name', read_only=True)
    scholarship = serializers.PrimaryKeyRelatedField(
        queryset=Scholarship.objects.filter(is_published=True),
        required=False,
        allow_null=True,
    )
    scholarship_name = serializers.CharField(source='scholarship.name', read_only=True)

    managed_fields = {
        'student',
        'consultant',
        'admin_notes',
        'status',
        'submission_date',
        'decision_date',
        'status_updates',
    }

    class Meta:
        model = Application
        fields = (
            'id',
            'application_type',
            'university',
            'university_name',
            'program_name',
            'degree_level',
            'scholarship',
            'scholarship_name',
            'status',
            'submission_date',
            'deadline_date',
            'decision_date',
            'application_id',
            'application_url',
            'notes',
            'status_updates',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'status',
            'submission_date',
            'decision_date',
            'status_updates',
            'created_at',
            'updated_at',
        )

    def validate(self, attrs):
        forbidden_fields = self.managed_fields.intersection(self.initial_data)
        if forbidden_fields:
            raise serializers.ValidationError({
                field: 'This field is managed by the application workflow.'
                for field in sorted(forbidden_fields)
            })

        application_type = attrs.get(
            'application_type',
            self.instance.application_type if self.instance else None,
        )
        university = attrs.get(
            'university',
            self.instance.university if self.instance else None,
        )
        scholarship = attrs.get(
            'scholarship',
            self.instance.scholarship if self.instance else None,
        )

        if application_type == 'UNIVERSITY':
            if university is None or scholarship is not None:
                raise serializers.ValidationError({
                    'university': 'Choose exactly one university for a university application.'
                })
        elif application_type == 'SCHOLARSHIP':
            if scholarship is None or university is not None:
                raise serializers.ValidationError({
                    'scholarship': 'Choose exactly one published scholarship for a scholarship application.'
                })
        else:
            raise serializers.ValidationError({
                'application_type': 'Choose a university or scholarship application.'
            })

        return attrs


class ConsultantApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    target_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = (
            'id',
            'student_name',
            'student_email',
            'application_type',
            'target_name',
            'program_name',
            'degree_level',
            'status',
            'deadline_date',
            'submission_date',
            'updated_at',
        )
        read_only_fields = fields

    def get_target_name(self, application):
        target = application.university or application.scholarship
        return target.name if target else 'Target unavailable'
