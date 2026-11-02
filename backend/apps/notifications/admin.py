"""
Admin configuration for Notification model.
"""

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin for Notification."""
    
    list_display = ('title', 'user', 'type', 'priority', 'is_read', 'email_sent', 'created_at')
    list_filter = ('type', 'priority', 'is_read', 'email_sent', 'send_email', 'created_at')
    search_fields = ('title', 'message', 'user__email')
    readonly_fields = ('read_at', 'email_sent_at', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Recipient', {'fields': ('user',)}),
        ('Notification Details', {'fields': ('type', 'priority', 'title', 'message')}),
        ('Action', {'fields': ('action_url', 'action_text')}),
        ('Status', {'fields': ('is_read', 'read_at')}),
        ('Email', {'fields': ('send_email', 'email_sent', 'email_sent_at')}),
        ('Related Objects', {'fields': ('application', 'consultation')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    actions = ['mark_as_read']
    
    def mark_as_read(self, request, queryset):
        for notification in queryset:
            notification.mark_as_read()
    mark_as_read.short_description = "Mark selected notifications as read"
