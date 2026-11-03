"""
Serializers for the public service catalogue.
"""

from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    """Expose only active service catalogue data to public visitors."""

    class Meta:
        model = Service
        fields = (
            'id',
            'slug',
            'title',
            'description',
            'short_description',
            'category',
            'price',
            'currency',
            'duration',
            'features',
            'is_featured',
            'image',
        )
        read_only_fields = fields
