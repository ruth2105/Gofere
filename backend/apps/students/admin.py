"""
Admin configuration for StudentProfile model.
"""

from django.contrib import admin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    """Admin for StudentProfile."""
    
    list_display = ('user', 'current_education_level', 'nationality_country', 'residence_country', 'profile_completed', 'reward_points', 'created_at')
    list_filter = ('current_education_level', 'country', 'profile_completed', 'is_active_applicant')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'school_name', 'country')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Personal Information', {'fields': ('date_of_birth', 'gender', 'nationality_country', 'nationality', 'passport_number')}),
        ('Contact', {'fields': ('address', 'city', 'residence_country', 'country', 'postal_code')}),
        ('Emergency Contact', {'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')}),
        ('Education', {'fields': ('current_education_level', 'school_name', 'field_of_study', 'graduation_year', 'gpa')}),
        ('Study Preferences', {'fields': ('target_countries', 'target_degree_level', 'preferred_fields', 'budget_range')}),
        ('Test Scores', {'fields': ('english_test_type', 'english_test_score', 'gre_score', 'gmat_score', 'sat_score')}),
        ('Status', {'fields': ('profile_completed', 'is_active_applicant', 'reward_points')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
