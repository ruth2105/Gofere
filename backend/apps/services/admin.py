"""
Admin configuration for Service model.
"""

from django.contrib import admin
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin for Service."""
    
    list_display = ('title', 'category', 'price', 'consultant', 'is_active', 'is_featured', 'purchase_count')
    list_filter = ('category', 'is_active', 'is_featured', 'currency')
    search_fields = ('title', 'description', 'consultant__email')
    readonly_fields = ('slug', 'view_count', 'purchase_count', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Basic Information', {'fields': ('title', 'slug', 'description', 'short_description')}),
        ('Category & Pricing', {'fields': ('category', 'price', 'currency', 'duration')}),
        ('Features', {'fields': ('features',)}),
        ('Provider', {'fields': ('consultant',)}),
        ('Status', {'fields': ('is_active', 'is_featured')}),
        ('Media', {'fields': ('image',)}),
        ('Statistics', {'fields': ('view_count', 'purchase_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['mark_as_active', 'mark_as_featured']
    
    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_as_active.short_description = "Mark selected services as active"
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected services as featured"
