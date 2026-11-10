
"""
Opportunity models for Gofer Exam.

Includes:
- External source configuration
- Collection run history
- Source-specific collected records
- Public general opportunities
"""

import json
import re
import uuid
from urllib.parse import urlsplit, urlunsplit

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, URLValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


MAX_PAYLOAD_BYTES = 512 * 1024
MAX_PAYLOAD_ITEMS = 200


def normalize_url(value):
    """Normalize an absolute URL for consistent source identity checks."""
    if not value:
        return value

    value = value.strip()
    parts = urlsplit(value)
    scheme = parts.scheme.lower()
    hostname = (parts.hostname or '').lower()

    if not scheme or not hostname:
        return value

    if parts.port:
        default_port = (
            (scheme == 'http' and parts.port == 80)
            or (scheme == 'https' and parts.port == 443)
        )
        host = hostname if default_port else f'{hostname}:{parts.port}'
    else:
        host = hostname

    path = parts.path or '/'

    if path != '/' and path.endswith('/'):
        path = path.rstrip('/')

    return urlunsplit((scheme, host, path, parts.query, ''))


def validate_payload(value):
    """Keep stored source metadata bounded and structured."""
    if not isinstance(value, dict):
        raise ValidationError('Payload must be a JSON object.')

    if len(value) > MAX_PAYLOAD_ITEMS:
        raise ValidationError(
            f'Payload cannot contain more than {MAX_PAYLOAD_ITEMS} top-level items.'
        )

    try:
        payload_size = len(
            json.dumps(value, ensure_ascii=False).encode('utf-8')
        )
    except (TypeError, ValueError) as error:
        raise ValidationError(
            'Payload must contain JSON-serializable values.'
        ) from error

    if payload_size > MAX_PAYLOAD_BYTES:
        raise ValidationError(
            'Payload exceeds the maximum permitted size.'
        )


def validate_fingerprint(value):
    """Validate hexadecimal content fingerprints."""
    if value and not re.fullmatch(r'[0-9a-fA-F]{32,128}', value):
        raise ValidationError(
            'Fingerprint must be a hexadecimal digest.'
        )


def validate_nationality_codes(value):
    """Validate ISO alpha-2 nationality codes."""
    if not isinstance(value, list):
        raise ValidationError(
            'Nationality codes must be a JSON array.'
        )

    if any(
        not isinstance(code, str)
        or not re.fullmatch(r'[A-Z]{2}', code)
        for code in value
    ):
        raise ValidationError(
            'Nationality codes must be uppercase ISO 3166-1 alpha-2 codes.'
        )


class OpportunitySource(models.Model):
    """An approved external source for opportunity collection."""

    SOURCE_TYPE_CHOICES = [
        ('OFFICIAL_PROVIDER', 'Official provider'),
        ('UNIVERSITY', 'University'),
        ('GOVERNMENT', 'Government'),
        ('ORGANIZATION', 'Organization'),
        ('RSS', 'RSS feed'),
        ('API', 'API'),
    ]

    COLLECTION_METHOD_CHOICES = [
        ('API', 'API'),
        ('RSS', 'RSS'),
        ('STRUCTURED_DATA', 'Structured data'),
        ('PERMITTED_HTML', 'Permitted HTML'),
    ]

    RELIABILITY_STATUS_CHOICES = [
        ('UNKNOWN', 'Unknown'),
        ('HEALTHY', 'Healthy'),
        ('DEGRADED', 'Degraded'),
        ('FAILING', 'Failing'),
        ('DISABLED', 'Disabled'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)

    base_url = models.URLField(
        unique=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    source_type = models.CharField(
        max_length=30,
        choices=SOURCE_TYPE_CHOICES,
    )

    collection_method = models.CharField(
        max_length=20,
        choices=COLLECTION_METHOD_CHOICES,
    )

    terms_url = models.URLField(
        blank=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    robots_url = models.URLField(
        blank=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    is_active = models.BooleanField(default=False)

    collection_interval_hours = models.PositiveIntegerField(
        default=24,
        validators=[MinValueValidator(1)],
    )

    last_success_at = models.DateTimeField(null=True, blank=True)
    last_failure_at = models.DateTimeField(null=True, blank=True)

    last_error_code = models.CharField(max_length=100, blank=True)
    last_error_message = models.TextField(blank=True)

    reliability_status = models.CharField(
        max_length=20,
        choices=RELIABILITY_STATUS_CHOICES,
        default='UNKNOWN',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_active', 'reliability_status']),
            models.Index(fields=['source_type']),
            models.Index(fields=['last_success_at']),
        ]

    def clean(self):
        self.base_url = normalize_url(self.base_url)
        self.terms_url = normalize_url(self.terms_url)
        self.robots_url = normalize_url(self.robots_url)

        super().clean()

        if self.last_success_at and self.last_failure_at:
            if self.last_failure_at < self.last_success_at:
                raise ValidationError({
                    'last_failure_at': (
                        'Failure time cannot precede the last success time.'
                    )
                })

        if self.reliability_status == 'DISABLED' and self.is_active:
            raise ValidationError({
                'is_active': 'A disabled source cannot be active.'
            })

    def save(self, *args, **kwargs):
        self.base_url = normalize_url(self.base_url)
        self.terms_url = normalize_url(self.terms_url)
        self.robots_url = normalize_url(self.robots_url)

        self.full_clean()

        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.organization})'


class CollectionRun(models.Model):
    """One collection attempt for a configured source."""

    TRIGGER_TYPE_CHOICES = [
        ('MANUAL', 'Manual'),
        ('SCHEDULED', 'Scheduled'),
        ('RETRY', 'Retry'),
    ]

    STATUS_CHOICES = [
        ('RUNNING', 'Running'),
        ('SUCCEEDED', 'Succeeded'),
        ('PARTIAL', 'Partial'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    source = models.ForeignKey(
        OpportunitySource,
        on_delete=models.PROTECT,
        related_name='collection_runs',
    )

    trigger_type = models.CharField(
        max_length=20,
        choices=TRIGGER_TYPE_CHOICES,
        default='MANUAL',
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='RUNNING',
    )

    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)

    records_seen = models.PositiveIntegerField(default=0)
    records_created = models.PositiveIntegerField(default=0)
    records_updated = models.PositiveIntegerField(default=0)
    records_unchanged = models.PositiveIntegerField(default=0)
    records_flagged_duplicate = models.PositiveIntegerField(default=0)
    records_rejected = models.PositiveIntegerField(default=0)
    error_count = models.PositiveIntegerField(default=0)

    error_summary = models.JSONField(
        default=dict,
        blank=True,
        validators=[validate_payload],
    )

    collector_version = models.CharField(max_length=100, blank=True)

    request_metadata = models.JSONField(
        default=dict,
        blank=True,
        validators=[validate_payload],
    )

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['source', 'started_at']),
            models.Index(fields=['status', 'started_at']),
        ]

    def clean(self):
        super().clean()

        if self.finished_at and self.finished_at < self.started_at:
            raise ValidationError({
                'finished_at': (
                    'Completion time cannot precede the start time.'
                )
            })

        if self.status == 'RUNNING' and self.finished_at:
            raise ValidationError({
                'finished_at': (
                    'A running collection cannot have a completion time.'
                )
            })

        if self.status != 'RUNNING' and not self.finished_at:
            raise ValidationError({
                'finished_at': (
                    'Completed collection runs require a completion time.'
                )
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return (
            f'{self.source.name} - {self.status} '
            f'({self.started_at:%Y-%m-%d %H:%M})'
        )


class Opportunity(models.Model):
    """Public-facing non-scholarship opportunities."""

    CATEGORY_CHOICES = [
        ('INTERNSHIP', 'Internship'),
        ('FELLOWSHIP', 'Fellowship'),
        ('EXCHANGE', 'Exchange Program'),
        ('TRAINING', 'Training'),
        ('RESEARCH', 'Research'),
        ('COMPETITION', 'Competition'),
        ('GRANT', 'Grant'),
        ('OTHER', 'Other'),
    ]

    LEVEL_CHOICES = [
        ('HIGH_SCHOOL', 'High School'),
        ('UNDERGRADUATE', 'Undergraduate'),
        ('GRADUATE', 'Graduate'),
        ('POSTGRADUATE', 'Postgraduate'),
        ('DOCTORATE', 'Doctorate'),
        ('ALL_LEVELS', 'All Levels'),
    ]

    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    title = models.CharField(max_length=300)
    slug = models.SlugField(
        max_length=350,
        unique=True,
        blank=True,
    )

    short_description = models.CharField(
        max_length=500,
        blank=True,
    )

    description = models.TextField()

    organization = models.CharField(max_length=300)
    country = models.CharField(max_length=150, blank=True)

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
    )

    level = models.CharField(
        max_length=30,
        choices=LEVEL_CHOICES,
        default='ALL_LEVELS',
    )

    eligibility = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)

    application_deadline = models.DateField(
        null=True,
        blank=True,
    )

    application_url = models.URLField(
        blank=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    official_website = models.URLField(
        blank=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN',
    )

    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'opportunities'
        ordering = ['application_deadline', '-created_at']
        indexes = [
            models.Index(fields=['category', 'status']),
            models.Index(fields=['is_published', 'application_deadline']),
            models.Index(fields=['country']),
        ]

    def clean(self):
        super().clean()

        duplicates = Opportunity.objects.filter(
            title__iexact=self.title.strip(),
            organization__iexact=self.organization.strip(),
        ).exclude(pk=self.pk)
        if self.title and self.organization and duplicates.exists():
            raise ValidationError({
                'title': 'An opportunity with this title and organization already exists.'
            })

        if self.is_published:
            if not (self.application_url or self.official_website):
                raise ValidationError({
                    'application_url': (
                        'A published opportunity must include an official application '
                        'or organization website.'
                    )
                })

            if self.pk and self.source_records.exclude(
                verification_status='VERIFIED',
                source_status='AVAILABLE',
                verified_at__isnull=False,
                verified_by__isnull=False,
            ).exists():
                raise ValidationError({
                    'is_published': (
                        'An opportunity linked to collected records can only be '
                        'published when every linked record is verified and available.'
                    )
                })

    def save(self, *args, **kwargs):
        self.full_clean()

        if not self.slug:
            base_slug = slugify(self.title) or 'opportunity'
            candidate = base_slug
            counter = 1

            while Opportunity.objects.filter(
                slug=candidate
            ).exclude(pk=self.pk).exists():
                candidate = f'{base_slug}-{counter}'
                counter += 1

            self.slug = candidate

        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class OpportunitySourceRecord(models.Model):
    """A source-specific observation that is not itself publicly visible."""

    SOURCE_STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('UNAVAILABLE', 'Unavailable'),
        ('REMOVED', 'Removed'),
        ('INCOMPLETE', 'Incomplete'),
    ]

    VERIFICATION_STATUS_CHOICES = [
        ('DISCOVERED', 'Discovered'),
        ('NEEDS_REVIEW', 'Needs review'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
        ('SOURCE_UNAVAILABLE', 'Source unavailable'),
    ]

    ELIGIBILITY_SCOPE_CHOICES = [
        ('UNSPECIFIED', 'Unspecified'),
        ('ETHIOPIA_ONLY', 'Ethiopia only'),
        ('ETHIOPIA_AND_OTHERS', 'Ethiopia and others'),
        ('OTHER_NATIONALITIES', 'Other nationalities'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    source = models.ForeignKey(
        OpportunitySource,
        on_delete=models.PROTECT,
        related_name='source_records',
    )

    collection_run = models.ForeignKey(
        CollectionRun,
        on_delete=models.PROTECT,
        related_name='source_records',
    )

    scholarship = models.ForeignKey(
        'scholarships.Scholarship',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_records',
    )

    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_records',
    )

    source_record_key = models.CharField(max_length=500)

    official_source_url = models.URLField(
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    official_application_url = models.URLField(
        blank=True,
        validators=[URLValidator(schemes=['http', 'https'])],
    )

    source_title = models.CharField(max_length=500)
    normalized_title = models.CharField(max_length=500)
    normalized_organization = models.CharField(max_length=300)

    normalized_deadline = models.DateField(
        null=True,
        blank=True,
    )

    eligibility_scope = models.CharField(
        max_length=30,
        choices=ELIGIBILITY_SCOPE_CHOICES,
        default='UNSPECIFIED',
    )

    eligible_nationalities = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_nationality_codes],
    )

    excluded_nationalities = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_nationality_codes],
    )

    eligibility_notes = models.TextField(blank=True)

    source_payload = models.JSONField(
        default=dict,
        blank=True,
        validators=[validate_payload],
    )

    content_hash = models.CharField(
        max_length=128,
        validators=[validate_fingerprint],
    )

    identity_fingerprint = models.CharField(
        max_length=128,
        validators=[validate_fingerprint],
    )

    similarity_fingerprint = models.CharField(
        max_length=128,
        blank=True,
        validators=[validate_fingerprint],
    )

    source_status = models.CharField(
        max_length=20,
        choices=SOURCE_STATUS_CHOICES,
        default='AVAILABLE',
    )

    verification_status = models.CharField(
        max_length=25,
        choices=VERIFICATION_STATUS_CHOICES,
        default='DISCOVERED',
    )

    last_seen_at = models.DateTimeField(default=timezone.now)
    last_changed_at = models.DateTimeField(null=True, blank=True)

    verified_at = models.DateTimeField(null=True, blank=True)

    verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_opportunity_source_records',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_seen_at']

        constraints = [
            models.UniqueConstraint(
                fields=['source', 'source_record_key'],
                name='opportunity_source_record_unique_key',
            ),
            models.CheckConstraint(
                check=(
                    models.Q(scholarship__isnull=True)
                    | models.Q(opportunity__isnull=True)
                ),
                name='source_record_one_public_target',
            ),
        ]

        indexes = [
            models.Index(fields=['source', 'source_record_key']),
            models.Index(fields=['verification_status', 'last_seen_at']),
            models.Index(fields=['scholarship', 'verification_status']),
            models.Index(fields=['opportunity', 'verification_status']),
            models.Index(fields=['official_source_url']),
            models.Index(fields=['identity_fingerprint']),
        ]

    def clean(self):
        self.official_source_url = normalize_url(
            self.official_source_url
        )
        self.official_application_url = normalize_url(
            self.official_application_url
        )

        super().clean()

        if self.collection_run_id and self.source_id:
            if self.collection_run.source_id != self.source_id:
                raise ValidationError({
                    'collection_run': (
                        'Collection run must belong to the selected source.'
                    )
                })

        if self.scholarship_id and self.opportunity_id:
            raise ValidationError(
                'A source record cannot link to both a scholarship and an opportunity.'
            )

        if self.pk:
            previous = OpportunitySourceRecord.objects.filter(
                pk=self.pk,
            ).values(
                'scholarship_id',
                'opportunity_id',
                'verification_status',
            ).first()
            if (
                previous
                and previous['verification_status'] == 'VERIFIED'
                and (
                    previous['scholarship_id'] != self.scholarship_id
                    or previous['opportunity_id'] != self.opportunity_id
                )
            ):
                raise ValidationError({
                    'opportunity': (
                        'Mark this source record as needing review before changing '
                        'its linked public target.'
                    )
                })

        if self.verification_status == 'VERIFIED':
            if not self.verified_at or not self.verified_by_id:
                raise ValidationError(
                    'Verified records require a verification time and verifying user.'
                )

            if not self.scholarship_id and not self.opportunity_id:
                raise ValidationError(
                    'Verified records must be linked to a scholarship or opportunity.'
                )

            if self.source_status != 'AVAILABLE':
                raise ValidationError({
                    'source_status': 'Only available source records can be verified.'
                })

            if self.verified_by and not self.verified_by.is_admin:
                raise ValidationError({
                    'verified_by': 'Only an administrator can verify source records.'
                })

        if (
            self.opportunity_id
            and self.opportunity.is_published
            and (
                self.verification_status != 'VERIFIED'
                or self.source_status != 'AVAILABLE'
            )
        ):
            raise ValidationError({
                'opportunity': (
                    'An unverified or unavailable source record cannot be linked '
                    'to a published opportunity.'
                )
            })

        if self.verified_status_is_unverified and (
            self.verified_at or self.verified_by_id
        ):
            raise ValidationError(
                'Unverified records cannot contain verifier metadata.'
            )

        overlapping_codes = set(
            self.eligible_nationalities or []
        ).intersection(
            self.excluded_nationalities or []
        )

        if overlapping_codes:
            raise ValidationError({
                'excluded_nationalities': (
                    'A nationality cannot be both eligible and excluded.'
                )
            })

        if (
            self.eligibility_scope == 'ETHIOPIA_ONLY'
            and set(self.eligible_nationalities or []) != {'ET'}
        ):
            raise ValidationError({
                'eligible_nationalities': (
                    'Ethiopia-only eligibility must contain only ET.'
                )
            })

    @property
    def verified_status_is_unverified(self):
        return self.verification_status != 'VERIFIED'

    def save(self, *args, **kwargs):
        self.official_source_url = normalize_url(
            self.official_source_url
        )
        self.official_application_url = normalize_url(
            self.official_application_url
        )

        self.full_clean()

        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.source_title} ({self.source.name})'
