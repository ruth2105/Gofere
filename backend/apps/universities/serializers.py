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
            'is_featured', 'is_partner'
        )


class UniversityDetailSerializer(serializers.ModelSerializer):
    """Serializer for university detail view."""
    
    international_student_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = University
        fields = (
            'id', 'name', 'slug', 'description', 'country', 'city', 'address',
            'type', 'founded_year', 'image', 'logo', 'world_ranking',
            'national_ranking', 'total_students', 'international_students',
            'international_student_percentage', 'acceptance_rate', 'programs',
            'popular_majors', 'tuition_fee', 'application_fee',
            'required_tests', 'minimum_gpa', 'website_url', 'is_featured',
            'is_partner',
        )
        read_only_fields = ('id', 'slug', 'international_student_percentage')
