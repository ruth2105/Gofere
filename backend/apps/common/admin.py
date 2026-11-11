"""
Admin configuration for shared common models.
"""

from django.contrib import admin
from .models import Country


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    """Admin interface for managing countries."""

    list_display = (
        'code',
        'name',
        'official_name',
        'alpha3_code',
        'region',
        'is_active',
    )

    list_filter = (
        'region',
        'subregion',
        'is_active',
    )

    search_fields = (
        'code',
        'name',
        'official_name',
        'alpha3_code',
    )

    ordering = ('name',)

    list_per_page = 50

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Country Identification', {
            'fields': (
                'code',
                'name',
                'official_name',
                'alpha3_code',
                'flag_emoji',
            )
        }),
        ('Geographical Information', {
            'fields': (
                'region',
                'subregion',
            )
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )