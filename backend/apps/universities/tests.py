from rest_framework import status
from rest_framework.test import APITestCase

from .models import University


class UniversityPublicApiTests(APITestCase):
    def test_public_detail_excludes_private_contact_and_internal_statistics(self):
        university = University.objects.create(
            name='Public University',
            description='Public university description',
            country='Ethiopia',
            city='Addis Ababa',
            type='PUBLIC',
            website_url='https://example.com',
            admissions_email='private@example.com',
            phone_number='+251900000000',
        )

        response = self.client.get(f'/api/v1/universities/{university.slug}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('website_url', response.data)
        self.assertIn('address', response.data)
        self.assertNotIn('admissions_email', response.data)
        self.assertNotIn('phone_number', response.data)
        self.assertNotIn('view_count', response.data)
        self.assertNotIn('application_count', response.data)

    def test_public_list_excludes_view_count(self):
        university = University.objects.create(
            name='Listed University',
            description='Public university description',
            country='Ethiopia',
            city='Addis Ababa',
            type='PUBLIC',
            website_url='https://example.com',
        )

        response = self.client.get('/api/v1/universities/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['slug'], university.slug)
        self.assertNotIn('view_count', response.data['results'][0])
