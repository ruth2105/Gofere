from rest_framework import status
from rest_framework.test import APITestCase

from .models import Destination


class DestinationPublicApiTests(APITestCase):
    def test_public_detail_excludes_internal_statistics(self):
        destination = Destination.objects.create(
            name='Test Destination',
            description='Public destination description',
            primary_language='English',
        )

        response = self.client.get(f'/api/v1/destinations/{destination.slug}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('highlights', response.data)
        self.assertIn('official_education_website', response.data)
        self.assertNotIn('view_count', response.data)
        self.assertNotIn('scholarship_count', response.data)
        self.assertNotIn('created_at', response.data)
        self.assertNotIn('updated_at', response.data)

    def test_public_list_excludes_view_count(self):
        destination = Destination.objects.create(
            name='Listed Destination',
            description='Public destination description',
            primary_language='English',
        )

        response = self.client.get('/api/v1/destinations/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['slug'], destination.slug)
        self.assertNotIn('view_count', response.data['results'][0])
