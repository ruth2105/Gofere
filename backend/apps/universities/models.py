"""
University model for GOFER EXAM.
Based on Phase 1 demo data structure with 12 fields.
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class University(models.Model):
    """
    University listings with comprehensive information.
    Matches Phase 1 TypeScript interface structure.
    """
    
    TYPE_CHOICES = [
        ('PUBLIC', 'Public University'),
        ('PRIVATE', 'Private University'),
        ('RESEARCH', 'Research University'),
        ('LIBERAL_ARTS', 'Liberal Arts College'),
        ('TECHNICAL', 'Technical Institute'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=350, unique=True, blank=True)
    description = models.TextField()
    
    # Location
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    
    # University Details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    founded_year = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1000), MaxValueValidator(2100)]
    )
    
    # Media
    image = models.ImageField(
        upload_to='universities/',
        null=True,
        blank=True
    )
    logo = models.ImageField(
        upload_to='universities/logos/',
        null=True,
        blank=True
    )
    
    # Rankings & Reputation
    world_ranking = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)]
    )
    national_ranking = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)]
    )
    
    # Academic Information
    total_students = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    international_students = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    acceptance_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Acceptance rate percentage'
    )
    
    # Programs (JSON array for flexibility)
    programs = models.JSONField(
        default=list,
        help_text='List of available programs/degrees'
    )
    popular_majors = models.JSONField(
        default=list,
        help_text='List of most popular majors'
    )
    
    # Costs (in USD)
    tuition_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Annual tuition fee in USD'
    )
    application_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text='Application fee in USD'
    )
    
    # Requirements
    required_tests = models.JSONField(
        default=list,
        help_text='List of required tests (IELTS, TOEFL, SAT, GRE, etc.)'
    )
    minimum_gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(4.0)]
    )
    
    # Contact & Links
    website_url = models.URLField()
    admissions_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Features & Status
    is_featured = models.BooleanField(default=False)
    is_partner = models.BooleanField(
        default=False,
        help_text='Partner university with direct admission support'
    )
    
    # Statistics
    view_count = models.IntegerField(default=0)
    application_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'universities'
        verbose_name = 'University'
        verbose_name_plural = 'Universities'
        ordering = ['world_ranking', 'name']
        indexes = [
            models.Index(fields=['country']),
            models.Index(fields=['city']),
            models.Index(fields=['type']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['world_ranking']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.country})"
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while University.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    @property
    def international_student_percentage(self):
        """Calculate percentage of international students."""
        if self.total_students > 0:
            return round((self.international_students / self.total_students) * 100, 2)
        return 0
    
    def increment_view_count(self):
        """Increment view counter."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
