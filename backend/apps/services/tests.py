from rest_framework import status
from rest_framework.test import APITestCase

from .models import Service


class ServicePublicApiTests(APITestCase):
    def create_service(self, title, *, is_active=True, category='CONSULTATION'):
        return Service.objects.create(
            title=title,
            description=f'{title} description',
            short_description=f'{title} summary',
            category=category,
            price='50.00',
            currency='USD',
            is_active=is_active,
        )

    def test_public_list_includes_only_active_services(self):
        active = self.create_service('Active counselling')
        self.create_service('Unpublished support', is_active=False)

        response = self.client.get('/api/v1/services/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], active.slug)
        self.assertNotIn('consultant', response.data['results'][0])

    def test_public_detail_hides_inactive_services(self):
        inactive = self.create_service('Private support', is_active=False)

        response = self.client.get(f'/api/v1/services/{inactive.slug}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_detail_returns_active_service(self):
        service = self.create_service('Application support', category='APPLICATION')

        response = self.client.get(f'/api/v1/services/{service.slug}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(service.id))
        self.assertEqual(response.data['category'], 'APPLICATION')

    def test_search_and_category_filters_apply_to_active_services(self):
        matching = self.create_service(
            'University application support',
            category='APPLICATION',
        )
        self.create_service('Visa support', category='VISA')
        self.create_service(
            'Hidden application support',
            is_active=False,
            category='APPLICATION',
        )

        response = self.client.get(
            '/api/v1/services/',
            {'search': 'application', 'category': 'APPLICATION'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], matching.slug)
