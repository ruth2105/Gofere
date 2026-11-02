"""
Admin configuration for University model.
"""

from django.contrib import admin
from .models import University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    """Admin for University."""
    
    list_display = ('name', 'country', 'city', 'type', 'world_ranking', 'is_featured', 'is_partner')
    list_filter = ('country', 'type', 'is_featured', 'is_partner')
    search_fields = ('name', 'country', 'city')
    readonly_fields = ('slug', 'view_count', 'application_count', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'slug', 'description')}),
        ('Location', {'fields': ('country', 'city', 'address')}),
        ('Details', {'fields': ('type', 'founded_year')}),
        ('Media', {'fields': ('image', 'logo')}),
        ('Rankings', {'fields': ('world_ranking', 'national_ranking')}),
        ('Academic', {'fields': ('total_students', 'international_students', 'acceptance_rate', 'programs', 'popular_majors')}),
        ('Costs', {'fields': ('tuition_fee', 'application_fee')}),
        ('Requirements', {'fields': ('required_tests', 'minimum_gpa')}),
        ('Contact', {'fields': ('website_url', 'admissions_email', 'phone_number')}),
        ('Features', {'fields': ('is_featured', 'is_partner')}),
        ('Statistics', {'fields': ('view_count', 'application_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['mark_as_featured', 'mark_as_partner']
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected universities as featured"
    
    def mark_as_partner(self, request, queryset):
        queryset.update(is_partner=True)
    mark_as_partner.short_description = "Mark selected universities as partner"
