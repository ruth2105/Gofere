
"""
Shared reference models for GOFER EXAM.

Country records are reusable across scholarships, opportunities,
universities, applicant profiles, and other platform features.
"""

from django.core.validators import RegexValidator
from django.db import models


class Country(models.Model):
    """
    Standard country registry using ISO 3166-1 alpha-2 codes.

    Examples:
        ET = Ethiopia
        US = United States
        GB = United Kingdom
        CA = Canada
    """

    code = models.CharField(
        primary_key=True,
        max_length=2,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{2}$',
                message='Enter a valid uppercase ISO alpha-2 country code.',
            )
        ],
        help_text='ISO 3166-1 alpha-2 code, for example ET, US, or GB.',
    )

    name = models.CharField(
        max_length=150,
        unique=True,
        help_text='Common English country name.',
    )

    official_name = models.CharField(
        max_length=200,
        blank=True,
        help_text='Official country name, if different from the common name.',
    )

    alpha3_code = models.CharField(
        max_length=3,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{3}$',
                message='Enter a valid uppercase ISO alpha-3 code.',
            )
        ],
        help_text='Optional ISO alpha-3 code, for example ETH or USA.',
    )

    flag_emoji = models.CharField(
        max_length=10,
        blank=True,
    )

    region = models.CharField(
        max_length=100,
        blank=True,
        help_text='Geographical region, for example Africa or Europe.',
    )

    subregion = models.CharField(
        max_length=100,
        blank=True,
        help_text='Geographical subregion, if applicable.',
    )

    is_active = models.BooleanField(
        default=True,
        help_text='Inactive countries are excluded from normal public selection.',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'common_countries'
        verbose_name = 'Country'
        verbose_name_plural = 'Countries'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['region']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f'{self.name} ({self.code})'

    def save(self, *args, **kwargs):
        """Normalize country codes before saving."""
        if self.code:
            self.code = self.code.strip().upper()

        if self.alpha3_code:
            self.alpha3_code = self.alpha3_code.strip().upper()

        super().save(*args, **kwargs)
