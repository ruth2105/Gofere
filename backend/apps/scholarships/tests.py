
from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.common.models import Country
from apps.opportunities.models import (
    CollectionRun,
    OpportunitySource,
    OpportunitySourceRecord,
)
from apps.students.models import StudentProfile
from .models import Scholarship
from .serializers import ScholarshipDetailSerializer


class ScholarshipPublicApiTests(APITestCase):
    """Tests for the public scholarship API."""

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
        published = self.create_scholarship(
            'Published award',
            is_published=True,
        )
        self.create_scholarship(
            'Unpublished draft',
            is_published=False,
        )

        response = self.client.get('/api/v1/scholarships/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], published.slug)
        self.assertIsNotNone(published.published_at)

    def test_public_detail_hides_unpublished_scholarship(self):
        unpublished = self.create_scholarship(
            'Private draft',
            is_published=False,
        )

        response = self.client.get(
            f'/api/v1/scholarships/{unpublished.slug}/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_public_detail_increments_view_count(self):
        scholarship = self.create_scholarship(
            'Published detail',
            is_published=True,
        )

        response = self.client.get(
            f'/api/v1/scholarships/{scholarship.slug}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        scholarship.refresh_from_db()
        self.assertEqual(scholarship.view_count, 1)

    def test_public_detail_excludes_internal_fields(self):
        scholarship = self.create_scholarship(
            'Public fields',
            is_published=True,
        )

        response = self.client.get(
            f'/api/v1/scholarships/{scholarship.slug}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('eligibility', response.data)
        self.assertIn('application_url', response.data)
        self.assertNotIn('contact_email', response.data)
        self.assertNotIn('application_count', response.data)
        self.assertNotIn('success_rate', response.data)
        self.assertNotIn('view_count', response.data)
        self.assertNotIn('is_published', response.data)

    def test_search_and_country_filter_apply_to_published_results(self):
        matching = self.create_scholarship(
            'Engineering award',
            is_published=True,
            country='Canada',
        )

        self.create_scholarship(
            'Arts award',
            is_published=True,
            country='Canada',
        )

        self.create_scholarship(
            'Hidden engineering award',
            is_published=False,
            country='Canada',
        )

        response = self.client.get(
            '/api/v1/scholarships/',
            {'search': 'Engineering', 'country': 'Canada'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], matching.slug)

    def test_public_api_hides_scholarships_with_unverified_source_records(self):
        scholarship = self.create_scholarship(
            'Source-backed unpublished scholarship',
            is_published=False,
        )
        source = OpportunitySource.objects.create(
            name='Official scholarship source',
            organization='Example Organization',
            base_url='https://example.org/',
            source_type='OFFICIAL_PROVIDER',
            collection_method='API',
            is_active=True,
        )
        run = CollectionRun.objects.create(source=source)
        OpportunitySourceRecord.objects.create(
            source=source,
            collection_run=run,
            scholarship=scholarship,
            source_record_key='source-backed-scholarship',
            official_source_url='https://example.org/scholarships/award/',
            source_title=scholarship.name,
            normalized_title=scholarship.name.lower(),
            normalized_organization=scholarship.provider.lower(),
            content_hash='a' * 64,
            identity_fingerprint='b' * 64,
        )
        Scholarship.objects.filter(pk=scholarship.pk).update(is_published=True)

        response = self.client.get('/api/v1/scholarships/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)


class ScholarshipNationalityValidationTests(APITestCase):
    """Tests for global scholarship nationality validation."""

    def setUp(self):
        Country.objects.create(
            code='ET',
            name='Ethiopia',
            is_active=True,
        )
        Country.objects.create(
            code='US',
            name='United States',
            is_active=True,
        )
        Country.objects.create(
            code='GB',
            name='United Kingdom',
            is_active=True,
        )
        Country.objects.create(
            code='CA',
            name='Canada',
            is_active=False,
        )

        self.scholarship = Scholarship.objects.create(
            name='Global Test Scholarship',
            description='Test scholarship description',
            provider='Gofer test provider',
            country='United Kingdom',
            type='FULL',
            level='GRADUATE',
            amount=1000,
            application_deadline=date.today() + timedelta(days=90),
        )

    def validate_data(self, data):
        serializer = ScholarshipDetailSerializer(
            instance=self.scholarship,
            data=data,
            partial=True,
        )

        is_valid = serializer.is_valid()

        return serializer, is_valid

    def test_valid_lowercase_country_codes_are_normalized(self):
        serializer, is_valid = self.validate_data({
            'target_countries': ['et', 'us'],
            'nationality_eligibility': 'SPECIFIC',
        })

        self.assertTrue(is_valid, serializer.errors)
        self.assertEqual(
            serializer.validated_data['target_countries'],
            ['ET', 'US'],
        )

    def test_unknown_country_code_is_rejected(self):
        serializer, is_valid = self.validate_data({
            'target_countries': ['ZZ'],
            'nationality_eligibility': 'SPECIFIC',
        })

        self.assertFalse(is_valid)
        self.assertIn('target_countries', serializer.errors)

    def test_inactive_country_code_is_rejected(self):
        serializer, is_valid = self.validate_data({
            'target_countries': ['CA'],
            'nationality_eligibility': 'SPECIFIC',
        })

        self.assertFalse(is_valid)
        self.assertIn('target_countries', serializer.errors)

    def test_duplicate_country_codes_are_rejected(self):
        serializer, is_valid = self.validate_data({
            'target_countries': ['ET', 'ET'],
            'nationality_eligibility': 'SPECIFIC',
        })

        self.assertFalse(is_valid)
        self.assertIn('target_countries', serializer.errors)

    def test_specific_eligibility_requires_at_least_one_country(self):
        serializer, is_valid = self.validate_data({
            'target_countries': [],
            'nationality_eligibility': 'SPECIFIC',
        })

        self.assertFalse(is_valid)
        self.assertIn('target_countries', serializer.errors)

    def test_country_cannot_be_both_eligible_and_excluded(self):
        serializer, is_valid = self.validate_data({
            'target_countries': ['ET'],
            'excluded_countries': ['ET'],
            'nationality_eligibility': 'SPECIFIC',
        })

        self.assertFalse(is_valid)
        self.assertIn('excluded_countries', serializer.errors)

    def test_all_nationalities_can_have_explicit_exclusions(self):
        serializer, is_valid = self.validate_data({
            'target_countries': [],
            'excluded_countries': ['ET'],
            'nationality_eligibility': 'ALL',
        })

        self.assertTrue(is_valid, serializer.errors)
        self.assertEqual(
            serializer.validated_data['nationality_eligibility'],
            'ALL',
        )
        self.assertEqual(
            serializer.validated_data['excluded_countries'],
            ['ET'],
        )

    def test_not_confirmed_does_not_imply_all_nationalities(self):
        serializer, is_valid = self.validate_data({
            'target_countries': [],
            'excluded_countries': [],
            'nationality_eligibility': 'NOT_CONFIRMED',
        })

        self.assertTrue(is_valid, serializer.errors)
        self.assertEqual(
            serializer.validated_data['nationality_eligibility'],
            'NOT_CONFIRMED',
        )


class EligibleScholarshipsApiTests(APITestCase):
    """Tests for personalized matching against confirmed profile data."""

    url = '/api/v1/scholarships/eligible-for-me/'

    def setUp(self):
        self.user = User.objects.create_user(
            email='matching-student@example.com',
            password='TestPassword123!',
            first_name='Matching',
            last_name='Student',
        )
        self.user.role = 'STUDENT'
        self.user.save(update_fields=['role'])
        self.client.force_authenticate(user=self.user)

        self.ethiopia = Country.objects.create(
            code='ET',
            name='Ethiopia',
            is_active=True,
        )
        self.united_states = Country.objects.create(
            code='US',
            name='United States',
            is_active=True,
        )
        self.profile = StudentProfile.objects.create(
            user=self.user,
            nationality_country=self.ethiopia,
            target_degree_level="Master's",
            gpa='3.50',
            field_of_study='Computer Science',
        )

    def create_scholarship(self, name, **overrides):
        fields = {
            'name': name,
            'description': f'{name} description',
            'provider': 'Matching test provider',
            'country': 'United Kingdom',
            'type': 'FULL',
            'level': 'POSTGRADUATE',
            'amount': 1000,
            'application_deadline': date.today() + timedelta(days=30),
            'is_published': True,
            'status': 'OPEN',
            'nationality_eligibility': 'ALL',
        }
        fields.update(overrides)
        return Scholarship.objects.create(**fields)

    def test_endpoint_returns_eligible_not_eligible_and_unverified_results(self):
        eligible = self.create_scholarship(
            'Eligible award',
            required_gpa='3.00',
            fields=['Computer Science'],
        )
        not_eligible = self.create_scholarship(
            'Nationality restricted award',
            nationality_eligibility='SPECIFIC',
            target_countries=['US'],
        )
        needs_verification = self.create_scholarship(
            'Unconfirmed award',
            nationality_eligibility='NOT_CONFIRMED',
            required_gpa='3.00',
            fields=['Computer Science'],
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = {
            result['scholarship']['slug']: result['match']
            for result in response.data['results']
        }
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(results[eligible.slug]['status'], 'ELIGIBLE')
        self.assertEqual(
            results[not_eligible.slug]['status'],
            'NOT_ELIGIBLE',
        )
        self.assertEqual(
            results[needs_verification.slug]['status'],
            'NEEDS_VERIFICATION',
        )
        self.assertIn(
            'nationality_eligibility',
            results[needs_verification.slug]['needs_verification'],
        )

    def test_endpoint_only_includes_published_open_and_not_expired(self):
        published_open = self.create_scholarship('Current award')
        self.create_scholarship(
            'Unpublished award',
            is_published=False,
        )
        self.create_scholarship(
            'Upcoming award',
            status='UPCOMING',
        )
        self.create_scholarship(
            'Expired award',
            application_deadline=date.today() - timedelta(days=1),
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(
            response.data['results'][0]['scholarship']['slug'],
            published_open.slug,
        )

    def test_legacy_nationality_text_is_not_treated_as_verified(self):
        self.profile.nationality_country = None
        self.profile.nationality = 'Ethiopia'
        self.profile.save(update_fields=['nationality_country', 'nationality'])
        scholarship = self.create_scholarship(
            'Specific nationality award',
            nationality_eligibility='SPECIFIC',
            target_countries=['ET'],
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        match = response.data['results'][0]['match']
        self.assertEqual(match['status'], 'NEEDS_VERIFICATION')
        self.assertIn('nationality', match['needs_verification'])
        self.assertEqual(
            response.data['results'][0]['scholarship']['slug'],
            scholarship.slug,
        )

    def test_missing_structured_profile_data_is_reported_for_verification(self):
        self.profile.nationality_country = None
        self.profile.target_degree_level = ''
        self.profile.gpa = None
        self.profile.field_of_study = ''
        self.profile.save(update_fields=[
            'nationality_country',
            'target_degree_level',
            'gpa',
            'field_of_study',
        ])
        scholarship = self.create_scholarship(
            'Complete profile award',
            nationality_eligibility='SPECIFIC',
            target_countries=['ET'],
            required_gpa='3.00',
            fields=['Computer Science'],
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data['results'][0]
        self.assertEqual(result['scholarship']['slug'], scholarship.slug)
        self.assertEqual(
            result['match']['status'],
            'NEEDS_VERIFICATION',
            result['match'],
        )
        self.assertCountEqual(
            result['match']['needs_verification'],
            ['nationality', 'target_degree_level', 'gpa', 'field_of_study'],
        )

    def test_malformed_structured_eligibility_requires_verification(self):
        scholarship = self.create_scholarship(
            'Malformed criteria award',
            nationality_eligibility='SPECIFIC',
            target_countries=['ET', {'invalid': 'country'}],
            fields=['Computer Science', 42],
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data['results'][0]
        self.assertEqual(result['scholarship']['slug'], scholarship.slug)
        self.assertEqual(
            result['match']['status'],
            'NEEDS_VERIFICATION',
        )
        self.assertCountEqual(
            result['match']['needs_verification'],
            ['target_countries', 'fields'],
        )

    def test_endpoint_requires_student_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_endpoint_rejects_non_student_accounts(self):
        self.user.role = 'CONSULTANT'
        self.user.save(update_fields=['role'])

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
