"""
Admin configuration for Document model.
"""

from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin for Document."""
    
    list_display = ('title', 'user', 'document_type', 'status', 'file_size_mb', 'created_at')
    list_filter = ('document_type', 'status', 'is_confidential', 'created_at')
    search_fields = ('title', 'user__email', 'description')
    readonly_fields = ('file_size', 'file_extension', 'created_at', 'updated_at', 'verified_at')
    
    fieldsets = (
        ('Owner', {'fields': ('user',)}),
        ('Document Details', {'fields': ('document_type', 'title', 'description')}),
        ('File', {'fields': ('file', 'file_size', 'file_extension')}),
        ('Related Objects', {'fields': ('application', 'consultation')}),
        ('Status & Verification', {'fields': ('status', 'verified_by', 'verification_notes', 'verified_at')}),
        ('Expiry', {'fields': ('expiry_date',)}),
        ('Security', {'fields': ('is_confidential',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['mark_as_approved', 'mark_as_rejected']
    
    def mark_as_approved(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='APPROVED', verified_by=request.user, verified_at=timezone.now())
    mark_as_approved.short_description = "Mark selected documents as approved"
    
    def mark_as_rejected(self, request, queryset):
        queryset.update(status='REJECTED')
    mark_as_rejected.short_description = "Mark selected documents as rejected"
