"""
Admin configuration for Consultation model.
"""

from django.contrib import admin
from .models import Consultation


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    """Admin for Consultation."""
    
    list_display = ('student', 'consultant', 'scheduled_date', 'scheduled_time', 'status', 'type', 'is_paid')
    list_filter = ('status', 'type', 'is_paid', 'scheduled_date')
    search_fields = ('student__email', 'consultant__email', 'title')
    readonly_fields = ('created_at', 'updated_at', 'completed_at', 'reminder_sent_at')
    date_hierarchy = 'scheduled_date'
    
    fieldsets = (
        ('Participants', {'fields': ('student', 'consultant', 'service')}),
        ('Consultation Details', {'fields': ('type', 'title', 'description')}),
        ('Schedule', {'fields': ('scheduled_date', 'scheduled_time', 'duration_minutes', 'timezone')}),
        ('Meeting', {'fields': ('meeting_url', 'meeting_id', 'meeting_password')}),
        ('Status', {'fields': ('status',)}),
        ('Payment', {'fields': ('is_paid', 'payment_amount')}),
        ('Notes', {'fields': ('student_notes', 'consultant_notes', 'action_items')}),
        ('Feedback', {'fields': ('student_rating', 'student_feedback')}),
        ('Reminders', {'fields': ('reminder_sent', 'reminder_sent_at')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'completed_at')}),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_completed']
    
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='CONFIRMED')
    mark_as_confirmed.short_description = "Mark selected consultations as confirmed"
    
    def mark_as_completed(self, request, queryset):
        for consultation in queryset:
            consultation.mark_completed()
    mark_as_completed.short_description = "Mark selected consultations as completed"
