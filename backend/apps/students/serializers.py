
"""
Serializers for GOFER EXAM student profiles.
"""

from rest_framework import serializers

from apps.common.models import Country
from .models import StudentProfile


class ActiveCountryCodeField(serializers.SlugRelatedField):
    """Represent a registered active country using its ISO alpha-2 code."""

    def __init__(self, **kwargs):
        super().__init__(
            slug_field='code',
            queryset=Country.objects.filter(is_active=True),
            allow_null=True,
            required=False,
            **kwargs,
        )


class StudentProfileSerializer(serializers.ModelSerializer):
    """Read and update the authenticated student's profile."""

    nationality_country = ActiveCountryCodeField()
    residence_country = ActiveCountryCodeField()

    class Meta:
        model = StudentProfile

        fields = (
            'id',

            # Personal information
            'date_of_birth',
            'gender',
            'nationality',
            'nationality_country',
            'passport_number',

            # Contact information
            'address',
            'city',
            'country',
            'residence_country',
            'postal_code',

            # Emergency contact
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',

            # Educational background
            'current_education_level',
            'school_name',
            'field_of_study',
            'graduation_year',
            'gpa',

            # Study preferences
            'target_countries',
            'target_degree_level',
            'preferred_fields',
            'budget_range',

            # Test scores
            'english_test_type',
            'english_test_score',
            'gre_score',
            'gmat_score',
            'sat_score',

            # Profile status
            'profile_completed',
            'is_active_applicant',
            'reward_points',

            # Timestamps
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'profile_completed',
            'is_active_applicant',
            'reward_points',
            'created_at',
            'updated_at',
        )

    def validate_target_countries(self, value):
        """
        Normalize and validate target countries
        against the registered country database.
        """

        if not isinstance(value, list):
            raise serializers.ValidationError(
                'Target countries must be a list.'
            )

        normalized_codes = []

        for code in value:
            if not isinstance(code, str) or len(code.strip()) != 2:
                raise serializers.ValidationError(
                    'Each country must use a two-letter ISO country code.'
                )

            normalized_codes.append(code.strip().upper())

        # Remove duplicate country codes while preserving order.
        normalized_codes = list(dict.fromkeys(normalized_codes))

        # Retrieve registered and active country codes.
        active_codes = set(
            Country.objects.filter(
                code__in=normalized_codes,
                is_active=True,
            ).values_list('code', flat=True)
        )

        # Reject unknown or inactive country codes.
        unknown_codes = set(normalized_codes) - active_codes

        if unknown_codes:
            raise serializers.ValidationError(
                'Unknown or inactive country codes: '
                + ', '.join(sorted(unknown_codes))
            )

        return normalized_codes

    def update(self, instance, validated_data):
        """
        Update the student profile and recalculate
        profile completion status.
        """

        country_fields = (
            ('nationality_country', 'nationality'),
            ('residence_country', 'country'),
        )
        for country_field, legacy_field in country_fields:
            if country_field in validated_data:
                country = validated_data[country_field]
                validated_data[legacy_field] = country.name if country else ''
            elif legacy_field in validated_data:
                validated_data[country_field] = None

        for attribute, value in validated_data.items():
            setattr(instance, attribute, value)

        instance.calculate_profile_completion()

        instance.save()

        return instance


class StudentProfileCompletionSerializer(serializers.Serializer):
    """Serializer for student profile completion information."""

    percentage = serializers.FloatField()

    is_completed = serializers.BooleanField()

    missing_fields = serializers.ListField(
        child=serializers.CharField()
    )
