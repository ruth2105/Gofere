"""
Serializers for University model.
"""

from rest_framework import serializers
from .models import University


class UniversityListSerializer(serializers.ModelSerializer):
    """Serializer for university list view."""
    
    international_student_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = University
        fields = (
            'id', 'name', 'slug', 'country', 'city', 'type',
            'world_ranking', 'total_students', 'international_students',
            'international_student_percentage', 'tuition_fee',
            'is_featured', 'is_partner', 'view_count'
        )


class UniversityDetailSerializer(serializers.ModelSerializer):
    """Serializer for university detail view."""
    
    international_student_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = University
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'view_count', 'application_count', 'created_at', 'updated_at')
