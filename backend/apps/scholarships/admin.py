"""
Admin configuration for Scholarship model.
"""

from django.contrib import admin
from .models import Scholarship


@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    """Admin for Scholarship."""
    
    list_display = ('name', 'provider', 'country', 'type', 'level', 'amount', 'status', 'is_published', 'is_featured', 'application_deadline')
    list_filter = ('is_published', 'status', 'type', 'level', 'country', 'is_featured', 'is_popular')
    search_fields = ('name', 'provider', 'country', 'description')
    readonly_fields = ('slug', 'view_count', 'application_count', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'slug', 'description', 'short_description')}),
        ('Organization', {'fields': ('provider', 'provider_logo', 'country')}),
        ('Details', {'fields': ('type', 'level', 'amount', 'amount_type')}),
        ('Eligibility', {'fields': ('eligibility', 'required_gpa', 'fields', 'target_countries')}),
        ('Application', {'fields': ('application_deadline', 'application_url', 'documents_required')}),
        ('Status', {'fields': ('status', 'is_published', 'is_featured', 'is_popular')}),
        ('Additional', {'fields': ('benefits', 'website_url', 'contact_email')}),
        ('Statistics', {'fields': ('view_count', 'application_count', 'success_rate')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'published_at')}),
    )
    
    actions = ['mark_as_featured', 'mark_as_open', 'mark_as_closed', 'publish_selected', 'unpublish_selected']
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected scholarships as featured"
    
    def mark_as_open(self, request, queryset):
        queryset.update(status='OPEN')
    mark_as_open.short_description = "Mark selected scholarships as open"
    
    def mark_as_closed(self, request, queryset):
        queryset.update(status='CLOSED')
    mark_as_closed.short_description = "Mark selected scholarships as closed"

    def publish_selected(self, request, queryset):
        from django.utils import timezone

        for scholarship in queryset:
            scholarship.is_published = True
            if not scholarship.published_at:
                scholarship.published_at = timezone.now()
            scholarship.save(update_fields=['is_published', 'published_at', 'updated_at'])
    publish_selected.short_description = "Publish selected scholarships"

    def unpublish_selected(self, request, queryset):
        queryset.update(is_published=False)
    unpublish_selected.short_description = "Unpublish selected scholarships"
