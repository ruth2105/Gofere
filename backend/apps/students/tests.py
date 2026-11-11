
"""
Tests for GOFER EXAM student profile API.
"""

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.common.models import Country
from apps.students.models import StudentProfile


class StudentProfileAPITests(APITestCase):
    """Tests for authenticated student profile endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='student@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='Student',
        )

        self.user.role = 'STUDENT'
        self.user.save(update_fields=['role'])

        self.client.force_authenticate(user=self.user)

        self.profile_url = '/api/v1/students/me/'
        self.completion_url = '/api/v1/students/me/completion/'

        # Create test countries in the test database.
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

    # --------------------------------------------------
    # Profile retrieval and updates
    # --------------------------------------------------

    def test_get_student_profile(self):
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(
            StudentProfile.objects.filter(user=self.user).exists()
        )

    def test_update_student_profile(self):
        payload = {
            'nationality': 'Ethiopian',
            'school_name': 'Test University',
            'field_of_study': 'Computer Science',
            'emergency_contact_name': 'Test Contact',
            'emergency_contact_phone': '+251900000000',
        }

        response = self.client.patch(
            self.profile_url,
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = StudentProfile.objects.get(user=self.user)

        self.assertEqual(profile.school_name, 'Test University')
        self.assertEqual(profile.field_of_study, 'Computer Science')
        self.assertEqual(
            profile.emergency_contact_name,
            'Test Contact',
        )

    def test_country_registry_references_use_iso_codes_and_sync_legacy_names(self):
        response = self.client.patch(
            self.profile_url,
            {
                'nationality_country': 'ET',
                'residence_country': 'GB',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nationality_country'], 'ET')
        self.assertEqual(response.data['residence_country'], 'GB')

        profile = StudentProfile.objects.get(user=self.user)
        self.assertEqual(profile.nationality_country_id, 'ET')
        self.assertEqual(profile.residence_country_id, 'GB')
        self.assertEqual(profile.nationality, 'Ethiopia')
        self.assertEqual(profile.country, 'United Kingdom')

    def test_inactive_country_cannot_be_set_as_nationality_or_residence(self):
        for field in ('nationality_country', 'residence_country'):
            with self.subTest(field=field):
                response = self.client.patch(
                    self.profile_url,
                    {field: 'CA'},
                    format='json',
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_400_BAD_REQUEST,
                )

    def test_legacy_country_text_remains_when_registry_reference_is_unset(self):
        response = self.client.patch(
            self.profile_url,
            {'nationality': 'Legacy nationality', 'country': 'Legacy residence'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile = StudentProfile.objects.get(user=self.user)
        self.assertEqual(profile.nationality, 'Legacy nationality')
        self.assertEqual(profile.country, 'Legacy residence')
        self.assertIsNone(profile.nationality_country_id)
        self.assertIsNone(profile.residence_country_id)

    def test_legacy_country_text_update_clears_stale_registry_reference(self):
        self.client.patch(
            self.profile_url,
            {
                'nationality_country': 'ET',
                'residence_country': 'GB',
            },
            format='json',
        )

        response = self.client.patch(
            self.profile_url,
            {
                'nationality': 'Legacy nationality',
                'country': 'Legacy residence',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile = StudentProfile.objects.get(user=self.user)
        self.assertEqual(profile.nationality, 'Legacy nationality')
        self.assertEqual(profile.country, 'Legacy residence')
        self.assertIsNone(profile.nationality_country_id)
        self.assertIsNone(profile.residence_country_id)

    # --------------------------------------------------
    # Profile completion
    # --------------------------------------------------

    def test_profile_completion_endpoint(self):
        response = self.client.get(self.completion_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('percentage', response.data)
        self.assertIn('missing_fields', response.data)
        self.assertIn('is_completed', response.data)

    def test_profile_completion_updates_after_profile_update(self):
        payload = {
            'date_of_birth': '2002-05-15',
            'nationality': 'Ethiopian',
            'school_name': 'Test University',
            'field_of_study': 'Computer Science',
            'target_countries': ['US'],
            'target_degree_level': 'MASTER',
            'preferred_fields': ['Computer Science'],
        }

        response = self.client.patch(
            self.profile_url,
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = StudentProfile.objects.get(user=self.user)

        self.assertTrue(profile.profile_completed)

    # --------------------------------------------------
    # Country validation
    # --------------------------------------------------

    def test_valid_target_country_codes(self):
        response = self.client.patch(
            self.profile_url,
            {'target_countries': ['ET', 'US', 'GB']},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = StudentProfile.objects.get(user=self.user)

        self.assertEqual(
            profile.target_countries,
            ['ET', 'US', 'GB'],
        )

    def test_lowercase_country_codes_are_normalized(self):
        response = self.client.patch(
            self.profile_url,
            {'target_countries': ['us', 'et']},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = StudentProfile.objects.get(user=self.user)

        self.assertEqual(
            profile.target_countries,
            ['US', 'ET'],
        )

    def test_duplicate_country_codes_are_removed(self):
        response = self.client.patch(
            self.profile_url,
            {'target_countries': ['US', 'ET', 'US', 'ET']},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = StudentProfile.objects.get(user=self.user)

        self.assertEqual(
            profile.target_countries,
            ['US', 'ET'],
        )

    def test_unknown_country_code_is_rejected(self):
        response = self.client.patch(
            self.profile_url,
            {'target_countries': ['ZZ']},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_country_code_is_rejected(self):
        response = self.client.patch(
            self.profile_url,
            {'target_countries': ['CA']},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_country_code_must_have_two_letters(self):
        response = self.client.patch(
            self.profile_url,
            {'target_countries': ['USA']},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------
    # Permissions
    # --------------------------------------------------

    def test_non_student_cannot_access_profile(self):
        self.user.role = 'CONSULTANT'
        self.user.save(update_fields=['role'])

        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_access_profile(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
