"""
Admin configuration for Application model.
"""

from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Admin for Application."""
    
    list_display = ('student', 'application_type', 'get_target', 'status', 'deadline_date', 'created_at')
    list_filter = ('application_type', 'status', 'deadline_date')
    search_fields = ('student__email', 'student__first_name', 'student__last_name', 'program_name', 'application_id')
    readonly_fields = ('created_at', 'updated_at', 'submission_date')
    date_hierarchy = 'deadline_date'
    
    fieldsets = (
        ('Student', {'fields': ('student', 'consultant')}),
        ('Application Type', {'fields': ('application_type',)}),
        ('University Application', {'fields': ('university', 'program_name', 'degree_level')}),
        ('Scholarship Application', {'fields': ('scholarship',)}),
        ('Status', {'fields': ('status', 'status_updates')}),
        ('Dates', {'fields': ('submission_date', 'deadline_date', 'decision_date')}),
        ('Application Details', {'fields': ('application_id', 'application_url')}),
        ('Notes', {'fields': ('notes', 'admin_notes')}),
        ('Notifications', {'fields': ('email_notifications',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def get_target(self, obj):
        """Display the target (university or scholarship)."""
        return obj.university or obj.scholarship
    get_target.short_description = 'Target'
    
    actions = ['mark_as_submitted', 'mark_as_under_review']
    
    def mark_as_submitted(self, request, queryset):
        for app in queryset:
            app.add_status_update('SUBMITTED', 'Marked as submitted by admin')
    mark_as_submitted.short_description = "Mark selected applications as submitted"
    
    def mark_as_under_review(self, request, queryset):
        for app in queryset:
            app.add_status_update('UNDER_REVIEW', 'Marked as under review by admin')
    mark_as_under_review.short_description = "Mark selected applications as under review"
