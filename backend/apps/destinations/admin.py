"""
Admin configuration for Destination model.
"""

from django.contrib import admin
from .models import Destination


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    """Admin for Destination."""
    
    list_display = ('name', 'popularity_rank', 'is_popular', 'is_featured', 'total_universities', 'international_students')
    list_filter = ('is_popular', 'is_featured', 'english_required', 'work_while_studying', 'post_study_work_visa')
    search_fields = ('name', 'description', 'primary_language')
    readonly_fields = ('slug', 'view_count', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'slug', 'description', 'flag_emoji')}),
        ('Media', {'fields': ('image', 'banner_image')}),
        ('Statistics', {'fields': ('total_universities', 'international_students', 'popularity_rank', 'education_quality_rating')}),
        ('Costs', {'fields': ('average_tuition_fee', 'average_living_cost')}),
        ('Work & Study', {'fields': ('work_while_studying', 'work_hours_per_week', 'post_study_work_visa', 'post_study_work_duration')}),
        ('Language & Tests', {'fields': ('primary_language', 'english_required', 'required_tests')}),
        ('Immigration', {'fields': ('visa_approval_rate', 'visa_processing_time')}),
        ('Additional', {'fields': ('highlights', 'scholarship_availability')}),
        ('Resources', {'fields': ('official_education_website', 'embassy_website')}),
        ('Features', {'fields': ('is_popular', 'is_featured', 'view_count', 'scholarship_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['mark_as_featured', 'mark_as_popular']
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected destinations as featured"
    
    def mark_as_popular(self, request, queryset):
        queryset.update(is_popular=True)
    mark_as_popular.short_description = "Mark selected destinations as popular"
