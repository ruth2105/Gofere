"""
Admin configuration for ConsultantProfile model.
"""

from django.contrib import admin
from .models import ConsultantProfile


@admin.register(ConsultantProfile)
class ConsultantProfileAdmin(admin.ModelAdmin):
    """Admin for ConsultantProfile."""
    
    list_display = ('user', 'company_name', 'verification_status', 'is_featured', 'average_rating', 'total_consultations', 'created_at')
    list_filter = ('verification_status', 'is_available', 'is_featured', 'years_of_experience')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'company_name')
    readonly_fields = ('created_at', 'updated_at', 'verified_at', 'total_consultations', 'total_students_helped')
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Professional Info', {'fields': ('company_name', 'job_title', 'years_of_experience', 'bio', 'profile_image')}),
        ('Expertise', {'fields': ('specializations', 'languages', 'expertise_countries', 'expertise_fields')}),
        ('Consultation', {'fields': ('consultation_rate', 'availability_hours', 'timezone')}),
        ('Verification', {'fields': ('verification_status', 'verification_documents', 'verified_at')}),
        ('Status', {'fields': ('is_available', 'is_featured')}),
        ('Statistics', {'fields': ('total_consultations', 'total_students_helped', 'average_rating', 'success_rate')}),
        ('Social', {'fields': ('website_url', 'linkedin_url', 'twitter_url')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['mark_as_verified', 'mark_as_featured']
    
    def mark_as_verified(self, request, queryset):
        from django.utils import timezone
        queryset.update(verification_status='VERIFIED', verified_at=timezone.now())
    mark_as_verified.short_description = "Mark selected consultants as verified"
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected consultants as featured"
