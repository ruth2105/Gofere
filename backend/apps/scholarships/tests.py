from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from .models import Scholarship


class ScholarshipPublicApiTests(APITestCase):
    def create_scholarship(self, name, *, is_published, country='Ethiopia'):
        return Scholarship.objects.create(
            name=name,
            description=f'{name} description',
            short_description=f'{name} summary',
            provider='Gofer test provider',
            country=country,
            type='FULL',
            level='GRADUATE',
            amount=1000,
            amount_type='Full tuition',
            application_deadline=date.today() + timedelta(days=90),
            is_published=is_published,
        )

    def test_public_list_includes_only_published_scholarships(self):
        published = self.create_scholarship('Published award', is_published=True)
        self.create_scholarship('Unpublished draft', is_published=False)

        response = self.client.get('/api/v1/scholarships/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], published.slug)
        self.assertIsNotNone(published.published_at)

    def test_public_detail_hides_unpublished_scholarship(self):
        unpublished = self.create_scholarship('Private draft', is_published=False)

        response = self.client.get(f'/api/v1/scholarships/{unpublished.slug}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_detail_increments_view_count(self):
        scholarship = self.create_scholarship('Published detail', is_published=True)

        response = self.client.get(f'/api/v1/scholarships/{scholarship.slug}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        scholarship.refresh_from_db()
        self.assertEqual(scholarship.view_count, 1)

    def test_search_and_country_filter_apply_to_published_results(self):
        matching = self.create_scholarship(
            'Engineering award',
            is_published=True,
            country='Canada',
        )
        self.create_scholarship('Arts award', is_published=True, country='Canada')
        self.create_scholarship('Hidden engineering award', is_published=False, country='Canada')

        response = self.client.get(
            '/api/v1/scholarships/',
            {'search': 'Engineering', 'country': 'Canada'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], matching.slug)
