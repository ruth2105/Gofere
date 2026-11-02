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
            'total_cost_estimate', 'primary_language', 'view_count'
        )


class DestinationDetailSerializer(serializers.ModelSerializer):
    """Serializer for destination detail view."""
    
    total_cost_estimate = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Destination
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'view_count', 'created_at', 'updated_at')
