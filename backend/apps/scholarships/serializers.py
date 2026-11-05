"""
Serializers for Scholarship model.
"""

from rest_framework import serializers
from .models import Scholarship


class ScholarshipListSerializer(serializers.ModelSerializer):
    """Serializer for scholarship list view."""
    
    days_until_deadline = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Scholarship
        fields = (
            'id', 'name', 'slug', 'short_description', 'provider',
            'country', 'type', 'level', 'amount', 'amount_type',
            'application_deadline', 'days_until_deadline', 'status',
            'is_featured', 'is_popular', 'is_open'
        )


class ScholarshipDetailSerializer(serializers.ModelSerializer):
    """Serializer for scholarship detail view."""
    
    days_until_deadline = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Scholarship
        fields = (
            'id', 'name', 'slug', 'description', 'short_description',
            'provider', 'provider_logo', 'country', 'type', 'level',
            'amount', 'amount_type', 'eligibility', 'required_gpa', 'fields',
            'target_countries', 'application_deadline', 'application_url',
            'documents_required', 'status', 'is_featured', 'is_popular',
            'benefits', 'website_url', 'days_until_deadline', 'is_open',
        )
        read_only_fields = ('id', 'slug', 'days_until_deadline', 'is_open')
