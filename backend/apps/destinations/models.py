"""
Destination model for GOFER EXAM.
Study abroad destination countries with comprehensive information.
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class Destination(models.Model):
    """
    Study destination countries with detailed information.
    Matches Phase 1 TypeScript interface structure.
    """
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    description = models.TextField()
    
    # Media
    flag_emoji = models.CharField(max_length=10, blank=True)
    image = models.ImageField(
        upload_to='destinations/',
        null=True,
        blank=True
    )
    banner_image = models.ImageField(
        upload_to='destinations/banners/',
        null=True,
        blank=True
    )
    
    # Statistics
    total_universities = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    international_students = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Number of international students in the country'
    )
    
    # Popularity & Rankings
    popularity_rank = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        help_text='Ranking based on popularity among students'
    )
    is_popular = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Educational System
    education_quality_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text='Education quality rating out of 5'
    )
    
    # Costs (in USD)
    average_tuition_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text='Average annual tuition in USD'
    )
    average_living_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text='Average monthly living cost in USD'
    )
    
    # Study & Work Opportunities
    work_while_studying = models.BooleanField(
        default=False,
        help_text='Can students work while studying?'
    )
    work_hours_per_week = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(40)],
        help_text='Maximum work hours allowed per week'
    )
    post_study_work_visa = models.BooleanField(
        default=False,
        help_text='Is post-study work visa available?'
    )
    post_study_work_duration = models.CharField(
        max_length=100,
        blank=True,
        help_text='Duration of post-study work visa (e.g., "2-3 years")'
    )
    
    # Language & Requirements
    primary_language = models.CharField(max_length=100)
    english_required = models.BooleanField(default=True)
    required_tests = models.JSONField(
        default=list,
        help_text='List of commonly required tests (IELTS, TOEFL, etc.)'
    )
    
    # Immigration & Visa
    visa_approval_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Student visa approval rate percentage'
    )
    visa_processing_time = models.CharField(
        max_length=100,
        blank=True,
        help_text='Typical visa processing time (e.g., "4-6 weeks")'
    )
    
    # Additional Benefits
    highlights = models.JSONField(
        default=list,
        help_text='List of key highlights/benefits'
    )
    scholarship_availability = models.CharField(
        max_length=200,
        blank=True,
        help_text='Description of scholarship availability'
    )
    
    # Contact & Resources
    official_education_website = models.URLField(blank=True)
    embassy_website = models.URLField(blank=True)
    
    # Statistics
    view_count = models.IntegerField(default=0)
    scholarship_count = models.IntegerField(
        default=0,
        help_text='Number of scholarships available for this destination'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'destinations'
        verbose_name = 'Destination'
        verbose_name_plural = 'Destinations'
        ordering = ['popularity_rank', 'name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_popular']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['popularity_rank']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        
        super().save(*args, **kwargs)
    
    def increment_view_count(self):
        """Increment view counter."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    @property
    def total_cost_estimate(self):
        """Calculate estimated annual total cost."""
        return self.average_tuition_fee + (self.average_living_cost * 12)
