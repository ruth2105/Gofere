"""
Service model for GOFER EXAM.
Consultant services offered to students.
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.text import slugify


class Service(models.Model):
    """
    Services offered by consultants to students.
    """
    
    CATEGORY_CHOICES = [
        ('CONSULTATION', 'Consultation'),
        ('APPLICATION', 'Application Assistance'),
        ('DOCUMENT', 'Document Preparation'),
        ('VISA', 'Visa Assistance'),
        ('SCHOLARSHIP', 'Scholarship Search'),
        ('ESSAY', 'Essay Writing'),
        ('INTERVIEW', 'Interview Preparation'),
        ('OTHER', 'Other Services'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=350, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    
    # Category
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='USD')
    
    # Duration
    duration = models.CharField(
        max_length=100,
        blank=True,
        help_text='E.g., "1 hour", "2 weeks", "Until visa approval"'
    )
    
    # Features/Deliverables
    features = models.JSONField(
        default=list,
        help_text='List of service features/deliverables'
    )
    
    # Provider (optional - can be specific consultant or platform service)
    consultant = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='services',
        null=True,
        blank=True,
        limit_choices_to={'role': 'CONSULTANT'}
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Media
    image = models.ImageField(
        upload_to='services/',
        null=True,
        blank=True
    )
    
    # Statistics
    view_count = models.IntegerField(default=0)
    purchase_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['-is_featured', 'category', 'title']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['consultant']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Service.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    def increment_view_count(self):
        """Increment view counter."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
