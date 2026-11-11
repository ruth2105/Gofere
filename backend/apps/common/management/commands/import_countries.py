"""Import the ISO 3166-1 country registry into GOFER EXAM.

Usage:
    python manage.py import_countries
"""

import pycountry
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.common.models import Country


def country_flag_emoji(alpha2_code: str | None) -> str:
    """Convert an ISO alpha-2 country code into a flag emoji."""
    if not alpha2_code or len(alpha2_code) != 2:
        return ''

    return ''.join(
        chr(ord(character) + 127397)
        for character in alpha2_code.upper()
    )


class Command(BaseCommand):
    help = 'Import or update countries from the ISO 3166-1 registry.'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for item in pycountry.countries:
                _, created = Country.objects.update_or_create(
                    code=item.alpha_2,
                    defaults={
                        'name': item.name,
                        'official_name': getattr(item, 'official_name', ''),
                        'alpha3_code': item.alpha_3,
                        'flag_emoji': country_flag_emoji(item.alpha_2),
                    },
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Country import complete: {created_count} created, '
            f'{updated_count} updated.'
        ))
