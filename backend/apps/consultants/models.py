"""
Consultant profile model for GOFER EXAM.
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class ConsultantProfile(models.Model):
    """
    Extended profile for consultants.
    One-to-one relationship with User model.
    """
    
    VERIFICATION_STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # One-to-one with User
    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='consultant_profile'
    )
    
    # Professional Information
    company_name = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=200, blank=True)
    years_of_experience = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(50)]
    )
    
    # Profile & Bio
    bio = models.TextField(blank=True, help_text='Professional biography')
    profile_image = models.ImageField(
        upload_to='consultants/profiles/',
        null=True,
        blank=True
    )
    
    # Specializations (from Phase 1 data)
    specializations = models.JSONField(
        default=list,
        blank=True,
        help_text='List of specialization areas (e.g., ["USA", "UK", "Scholarships"])'
    )
    
    # Languages Spoken
    languages = models.JSONField(
        default=list,
        blank=True,
        help_text='List of languages (e.g., ["English", "Spanish"])'
    )
    
    # Expertise Areas
    expertise_countries = models.JSONField(
        default=list,
        blank=True,
        help_text='Countries of expertise'
    )
    expertise_fields = models.JSONField(
        default=list,
        blank=True,
        help_text='Fields of study expertise'
    )
    
    # Contact & Availability
    consultation_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]
    )
    availability_hours = models.CharField(
        max_length=200,
        blank=True,
        help_text='E.g., "Mon-Fri 9AM-5PM EST"'
    )
    timezone = models.CharField(max_length=100, default='UTC')
    
    # Verification & Status
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='PENDING'
    )
    verification_documents = models.JSONField(
        default=list,
        blank=True,
        help_text='List of verification document URLs'
    )
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Statistics
    total_consultations = models.IntegerField(default=0)
    total_students_helped = models.IntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Percentage of successful placements'
    )
    
    # Social Media & Website
    website_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'consultant_profiles'
        verbose_name = 'Consultant Profile'
        verbose_name_plural = 'Consultant Profiles'
        ordering = ['-is_featured', '-average_rating', '-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['is_available']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['average_rating']),
        ]
    
    def __str__(self):
        return f"Consultant: {self.user.get_full_name()}"
    
    @property
    def is_verified(self):
        """Check if consultant is verified."""
        return self.verification_status == 'VERIFIED'
    
    def update_statistics(self):
        """Update consultant statistics from related consultations."""
        from apps.consultations.models import Consultation
        
        consultations = Consultation.objects.filter(consultant=self.user)
        self.total_consultations = consultations.count()
        
        # Calculate average rating (would need review/rating model)
        # For now, keep existing value
        
        self.save()
