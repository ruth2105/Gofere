"""
Scholarship model for GOFER EXAM.
Based on Phase 1 demo data structure with 22 fields.
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class Scholarship(models.Model):
    """
    Scholarship listings with comprehensive filtering capabilities.
    Matches Phase 1 TypeScript interface structure.
    """
    
    TYPE_CHOICES = [
        ('FULL', 'Full Scholarship'),
        ('PARTIAL', 'Partial Scholarship'),
        ('MERIT', 'Merit-Based'),
        ('NEED', 'Need-Based'),
        ('RESEARCH', 'Research Grant'),
        ('ATHLETIC', 'Athletic Scholarship'),
    ]
    
    LEVEL_CHOICES = [
        ('UNDERGRADUATE', 'Undergraduate'),
        ('GRADUATE', 'Graduate'),
        ('POSTGRADUATE', 'Postgraduate'),
        ('DOCTORATE', 'Doctorate'),
        ('ALL', 'All Levels'),
    ]
    
    STATUS_CHOICES = [
        ('OPEN', 'Open for Applications'),
        ('UPCOMING', 'Upcoming'),
        ('CLOSED', 'Closed'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=350, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    
    # Organization
    provider = models.CharField(
        max_length=200,
        help_text='University, government, or organization offering the scholarship'
    )
    provider_logo = models.ImageField(
        upload_to='scholarships/providers/',
        null=True,
        blank=True
    )
    country = models.CharField(max_length=100)
    
    # Scholarship Details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Scholarship amount in USD'
    )
    amount_type = models.CharField(
        max_length=50,
        default='Full Tuition',
        help_text='E.g., "Full Tuition", "$50,000/year", "100% Coverage"'
    )
    
    # Eligibility (stored as JSON arrays for flexibility)
    eligibility = models.JSONField(
        default=list,
        help_text='List of eligibility criteria'
    )
    required_gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(4.0)]
    )
    
    # Fields of Study (JSON array)
    fields = models.JSONField(
        default=list,
        help_text='List of eligible fields of study'
    )
    
    # Target Countries (JSON array for students from specific countries)
    target_countries = models.JSONField(
        default=list,
        blank=True,
        help_text='Countries from which students can apply'
    )
    
    # Application Details
    application_deadline = models.DateField()
    application_url = models.URLField(blank=True)
    documents_required = models.JSONField(
        default=list,
        help_text='List of required documents'
    )
    
    # Status & Features
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN'
    )
    is_featured = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    
    # Additional Information
    benefits = models.JSONField(
        default=list,
        help_text='List of scholarship benefits beyond tuition'
    )
    website_url = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    
    # Statistics & Tracking
    view_count = models.IntegerField(default=0)
    application_count = models.IntegerField(default=0)
    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'scholarships'
        verbose_name = 'Scholarship'
        verbose_name_plural = 'Scholarships'
        ordering = ['-is_featured', '-is_popular', 'application_deadline', '-created_at']
        indexes = [
            models.Index(fields=['country']),
            models.Index(fields=['type']),
            models.Index(fields=['level']),
            models.Index(fields=['status']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['application_deadline']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.provider}"
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Scholarship.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    @property
    def is_open(self):
        """Check if scholarship is currently open for applications."""
        return self.status == 'OPEN'
    
    @property
    def days_until_deadline(self):
        """Calculate days remaining until deadline."""
        from datetime import date
        if self.application_deadline:
            delta = self.application_deadline - date.today()
            return delta.days
        return None
    
    def increment_view_count(self):
        """Increment view counter."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
