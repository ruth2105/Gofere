
"""
Serializers for Scholarship model.
Supports global scholarship eligibility and country validation.
"""

from rest_framework import serializers

from apps.common.models import Country
from .models import Scholarship


class ScholarshipCountryValidationMixin:
    """Shared validation for scholarship nationality country codes."""

    def validate_country_codes(self, value, field_name):
        if not isinstance(value, list):
            raise serializers.ValidationError(
                f'{field_name} must be a list of ISO alpha-2 country codes.'
            )

        normalized_codes = []
        seen_codes = set()

        for code in value:
            if not isinstance(code, str):
                raise serializers.ValidationError(
                    f'Every item in {field_name} must be a country code.'
                )

            code = code.strip().upper()

            if len(code) != 2 or not code.isalpha():
                raise serializers.ValidationError(
                    f'"{code}" is not a valid two-letter country code.'
                )

            if code in seen_codes:
                raise serializers.ValidationError(
                    f'Duplicate country code "{code}" in {field_name}.'
                )

            seen_codes.add(code)
            normalized_codes.append(code)

        if normalized_codes:
            active_codes = set(
                Country.objects.filter(
                    code__in=normalized_codes,
                    is_active=True,
                ).values_list('code', flat=True)
            )

            invalid_codes = [
                code for code in normalized_codes
                if code not in active_codes
            ]

            if invalid_codes:
                raise serializers.ValidationError(
                    f'Unknown or inactive country codes in {field_name}: '
                    f'{", ".join(invalid_codes)}.'
                )

        return normalized_codes

    def validate_target_countries(self, value):
        return self.validate_country_codes(
            value,
            'target_countries',
        )

    def validate_excluded_countries(self, value):
        return self.validate_country_codes(
            value,
            'excluded_countries',
        )

    def validate(self, attrs):
        attrs = super().validate(attrs)

        instance = getattr(self, 'instance', None)

        eligibility = attrs.get(
            'nationality_eligibility',
            getattr(instance, 'nationality_eligibility', 'NOT_CONFIRMED'),
        )

        target_countries = attrs.get(
            'target_countries',
            getattr(instance, 'target_countries', []),
        )

        excluded_countries = attrs.get(
            'excluded_countries',
            getattr(instance, 'excluded_countries', []),
        )

        if eligibility == 'SPECIFIC' and not target_countries:
            raise serializers.ValidationError({
                'target_countries': (
                    'At least one eligible nationality is required '
                    'when eligibility is SPECIFIC.'
                )
            })

        conflicting_codes = (
            set(target_countries) & set(excluded_countries)
        )

        if conflicting_codes:
            raise serializers.ValidationError({
                'excluded_countries': (
                    'A country cannot be both eligible and excluded: '
                    f'{", ".join(sorted(conflicting_codes))}.'
                )
            })

        return attrs


class ScholarshipListSerializer(serializers.ModelSerializer):
    """Serializer for scholarship list view."""

    days_until_deadline = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = Scholarship
        fields = (
            'id',
            'name',
            'slug',
            'short_description',
            'provider',
            'country',
            'country_reference',
            'type',
            'level',
            'amount',
            'amount_type',
            'application_deadline',
            'days_until_deadline',
            'status',
            'nationality_eligibility',
            'is_featured',
            'is_popular',
            'is_open',
        )


class ScholarshipDetailSerializer(
    ScholarshipCountryValidationMixin,
    serializers.ModelSerializer,
):
    """Serializer for scholarship detail view."""

    days_until_deadline = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = Scholarship
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'short_description',
            'provider',
            'provider_logo',
            'country',
            'country_reference',
            'type',
            'level',
            'amount',
            'amount_type',
            'eligibility',
            'required_gpa',
            'fields',
            'target_countries',
            'nationality_eligibility',
            'excluded_countries',
            'application_deadline',
            'application_url',
            'documents_required',
            'status',
            'is_featured',
            'is_popular',
            'benefits',
            'website_url',
            'days_until_deadline',
            'is_open',
        )

        read_only_fields = (
            'id',
            'slug',
            'days_until_deadline',
            'is_open',
        )
