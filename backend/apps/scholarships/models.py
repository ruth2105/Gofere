
"""
Scholarship model for GOFER EXAM.
Supports global scholarship listings and nationality-based eligibility.
"""

import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class Scholarship(models.Model):
    """Scholarship listings with global eligibility support."""

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

    NATIONALITY_ELIGIBILITY_CHOICES = [
        ('ALL', 'All Nationalities'),
        ('SPECIFIC', 'Specific Nationalities'),
        ('NOT_CONFIRMED', 'Eligibility Not Confirmed'),
    ]

    # Primary key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # Basic Information
    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=350, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)

    # Organization and destination
    provider = models.CharField(
        max_length=200,
        help_text='University, government, or organization offering the scholarship',
    )
    provider_logo = models.ImageField(
        upload_to='scholarships/providers/',
        null=True,
        blank=True,
    )
    country = models.CharField(max_length=100)

    country_reference = models.ForeignKey(
        'common.Country',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hosted_scholarships',
        help_text='Structured country reference for the scholarship destination.',
    )

    # Scholarship Details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Scholarship amount in USD',
    )
    amount_type = models.CharField(
        max_length=50,
        default='Full Tuition',
        help_text='E.g., Full Tuition, $50,000/year, 100% Coverage',
    )

    # Eligibility
    eligibility = models.JSONField(
        default=list,
        help_text='List of eligibility criteria',
    )
    required_gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(4.0)],
    )

    # Fields of Study
    fields = models.JSONField(
        default=list,
        help_text='List of eligible fields of study',
    )

    # Applicant nationality eligibility
    target_countries = models.JSONField(
        default=list,
        blank=True,
        help_text='ISO alpha-2 nationality codes eligible to apply.',
    )

    nationality_eligibility = models.CharField(
        max_length=20,
        choices=NATIONALITY_ELIGIBILITY_CHOICES,
        default='NOT_CONFIRMED',
        help_text='Whether applicant nationality eligibility is confirmed.',
    )

    excluded_countries = models.JSONField(
        default=list,
        blank=True,
        help_text='ISO alpha-2 nationality codes explicitly excluded.',
    )

    # Application Details
    application_deadline = models.DateField()
    application_url = models.URLField(blank=True)
    documents_required = models.JSONField(
        default=list,
        help_text='List of required documents',
    )

    # Status and Features
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN',
    )
    is_published = models.BooleanField(
        default=False,
        help_text='Only published scholarships are visible through the public API.',
    )
    is_featured = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)

    # Additional Information
    benefits = models.JSONField(
        default=list,
        help_text='List of scholarship benefits beyond tuition',
    )
    website_url = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)

    # Statistics and Tracking
    view_count = models.IntegerField(default=0)
    application_count = models.IntegerField(default=0)
    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'scholarships'
        verbose_name = 'Scholarship'
        verbose_name_plural = 'Scholarships'
        ordering = [
            '-is_featured',
            '-is_popular',
            'application_deadline',
            '-created_at',
        ]
        indexes = [
            models.Index(fields=['country']),
            models.Index(fields=['country_reference']),
            models.Index(fields=['type']),
            models.Index(fields=['level']),
            models.Index(fields=['status']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['application_deadline']),
            models.Index(fields=['slug']),
            models.Index(fields=['nationality_eligibility']),
        ]

    def __str__(self):
        return f"{self.name} - {self.provider}"

    def source_records_are_verified(self):
        """Return whether every linked external source is currently valid."""
        if not self.pk:
            return True

        return not self.source_records.exclude(
            verification_status='VERIFIED',
            source_status='AVAILABLE',
            verified_at__isnull=False,
            verified_by__role__in=('ADMIN', 'SUPERADMIN'),
            source__is_active=True,
        ).exists()

    def clean(self):
        super().clean()

        if self.is_published and not self.source_records_are_verified():
            raise ValidationError({
                'is_published': (
                    'A scholarship with external source records can only be '
                    'published when every source is verified, available, '
                    'active, and attributed to an administrator.'
                )
            })

    def save(self, *args, **kwargs):
        """Auto-generate slug and publication timestamp when needed."""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Scholarship.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()

        update_fields = kwargs.get('update_fields')
        if self.is_published and (
            update_fields is None or 'is_published' in update_fields
        ):
            self.clean()

        super().save(*args, **kwargs)

    @property
    def is_open(self):
        """Check whether scholarship status is open."""
        return self.status == 'OPEN'

    @property
    def days_until_deadline(self):
        """Calculate days remaining until deadline."""
        from datetime import date

        if self.application_deadline:
            return (self.application_deadline - date.today()).days

        return None

    def increment_view_count(self):
        """Increment view counter."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
