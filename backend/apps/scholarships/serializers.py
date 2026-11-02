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
            'is_featured', 'is_popular', 'is_open', 'view_count'
        )


class ScholarshipDetailSerializer(serializers.ModelSerializer):
    """Serializer for scholarship detail view."""
    
    days_until_deadline = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Scholarship
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'view_count', 'application_count', 'created_at', 'updated_at')
