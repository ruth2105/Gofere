from io import StringIO

import pycountry
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Country


class ImportCountriesCommandTests(TestCase):
    def test_import_creates_and_updates_iso_countries(self):
        output = StringIO()

        call_command('import_countries', stdout=output)

        ethiopia = Country.objects.get(code='ET')
        self.assertEqual(ethiopia.name, 'Ethiopia')
        self.assertEqual(ethiopia.official_name, 'Federal Democratic Republic of Ethiopia')
        self.assertEqual(ethiopia.alpha3_code, 'ETH')
        self.assertEqual(ethiopia.flag_emoji, '\U0001F1EA\U0001F1F9')
        self.assertEqual(ethiopia.region, '')
        self.assertEqual(ethiopia.subregion, '')
        self.assertEqual(Country.objects.count(), len(pycountry.countries))
        self.assertIn('249 created, 0 updated', output.getvalue())

        ethiopia.region = 'Verified Region'
        ethiopia.subregion = 'Verified Subregion'
        ethiopia.save()

        output = StringIO()
        call_command('import_countries', stdout=output)

        ethiopia.refresh_from_db()
        self.assertEqual(Country.objects.count(), len(pycountry.countries))
        self.assertEqual(ethiopia.region, 'Verified Region')
        self.assertEqual(ethiopia.subregion, 'Verified Subregion')
        self.assertIn('0 created, 249 updated', output.getvalue())


class CountryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Country.objects.create(
            code='ET',
            name='Ethiopia',
            official_name='Federal Democratic Republic of Ethiopia',
            alpha3_code='ETH',
            flag_emoji='\U0001F1EA\U0001F1F9',
        )
        Country.objects.create(
            code='ZZ',
            name='Inactive Example',
            is_active=False,
        )

    def test_public_country_list_contains_active_registry_fields(self):
        response = self.client.get('/api/v1/countries/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['code'], 'ET')
        self.assertEqual(response.data[0]['alpha3_code'], 'ETH')
        self.assertEqual(response.data[0]['flag_emoji'], '\U0001F1EA\U0001F1F9')
        self.assertEqual(response.data[0]['region'], '')
        self.assertEqual(response.data[0]['subregion'], '')

    def test_country_registry_api_is_read_only(self):
        response = self.client.post(
            '/api/v1/countries/',
            {'code': 'US', 'name': 'United States'},
            format='json',
        )

        self.assertEqual(response.status_code, 405)
        self.assertFalse(Country.objects.filter(code='US').exists())
