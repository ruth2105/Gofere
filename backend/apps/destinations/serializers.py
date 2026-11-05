"""
Serializers for Destination model.
"""

from rest_framework import serializers
from .models import Destination


class DestinationListSerializer(serializers.ModelSerializer):
    """Serializer for destination list view."""
    
    total_cost_estimate = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Destination
        fields = (
            'id', 'name', 'slug', 'flag_emoji', 'description',
            'total_universities', 'international_students',
            'popularity_rank', 'is_popular', 'is_featured',
            'average_tuition_fee', 'average_living_cost',
            'total_cost_estimate', 'primary_language'
        )


class DestinationDetailSerializer(serializers.ModelSerializer):
    """Serializer for destination detail view."""
    
    total_cost_estimate = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Destination
        fields = (
            'id', 'name', 'slug', 'description', 'flag_emoji', 'image',
            'banner_image', 'total_universities', 'international_students',
            'popularity_rank', 'is_popular', 'is_featured',
            'education_quality_rating', 'average_tuition_fee',
            'average_living_cost', 'total_cost_estimate',
            'work_while_studying', 'work_hours_per_week',
            'post_study_work_visa', 'post_study_work_duration',
            'primary_language', 'english_required', 'required_tests',
            'visa_approval_rate', 'visa_processing_time', 'highlights',
            'scholarship_availability', 'official_education_website',
            'embassy_website',
        )
        read_only_fields = ('id', 'slug', 'total_cost_estimate')
