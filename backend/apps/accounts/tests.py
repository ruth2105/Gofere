from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

from unittest import skipUnless
from unittest.mock import Mock, patch

from django.db import IntegrityError
from django.db import close_old_connections, connection
from django.test import TransactionTestCase
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import User
from .serializers import UserRegistrationSerializer


@skipUnless(connection.vendor == 'postgresql', 'Requires PostgreSQL')
class ConcurrentRegistrationTests(TransactionTestCase):
    reset_sequences = True

    def test_simultaneous_registration_creates_only_one_user(self):
        email = 'concurrent.student@example.com'
        barrier = Barrier(2, timeout=15)

        def register(email_input):
            close_old_connections()
            try:
                serializer = UserRegistrationSerializer(data={
                    'email': email_input,
                    'first_name': 'Concurrent',
                    'last_name': 'Student',
                    'password': 'Strong-Test-Password-123!',
                    'password2': 'Strong-Test-Password-123!',
                })

                if not serializer.is_valid():
                    return 'invalid', serializer.errors

                barrier.wait()

                try:
                    serializer.save()
                    return 'created', None
                except serializers.ValidationError as error:
                    return 'duplicate', error.detail
            finally:
                close_old_connections()

        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = [
                executor.submit(register, 'Concurrent.Student@Example.com'),
                executor.submit(register, 'concurrent.student@example.com'),
            ]
            results = [future.result(timeout=30) for future in futures]

        outcomes = [result[0] for result in results]

        self.assertCountEqual(outcomes, ['created', 'duplicate'])
        self.assertEqual(User.objects.filter(email=email).count(), 1)

        duplicate_result = next(
            result for result in results if result[0] == 'duplicate'
        )
        self.assertIn('email', duplicate_result[1])
        self.assertIn(
            'A user with this email already exists.',
            str(duplicate_result[1]['email']),
        )


class AuthenticationApiTests(APITestCase):
    def registration_data(self, email='student@example.com'):
        return {
            'email': email,
            'first_name': 'Test',
            'last_name': 'Student',
            'password': 'Strong-Test-Password-123!',
            'password2': 'Strong-Test-Password-123!',
        }

    def test_registration_handles_creation_race_as_duplicate_validation(self):
        serializer = UserRegistrationSerializer(data=self.registration_data())
        self.assertTrue(serializer.is_valid())

        with patch(
            'apps.accounts.serializers.User.objects.create_user',
            side_effect=IntegrityError('unique constraint'),
        ), patch(
            'apps.accounts.serializers.User.objects.filter',
            return_value=Mock(exists=Mock(return_value=True)),
        ):
            with self.assertRaises(serializers.ValidationError) as error:
                serializer.save()

        self.assertEqual(
            str(error.exception.detail['email']),
            'A user with this email already exists.',
        )

    def test_registration_reraises_unrelated_integrity_error(self):
        serializer = UserRegistrationSerializer(data=self.registration_data())
        self.assertTrue(serializer.is_valid())

        with patch(
            'apps.accounts.serializers.User.objects.create_user',
            side_effect=IntegrityError('unrelated database failure'),
        ), patch(
            'apps.accounts.serializers.User.objects.filter',
            return_value=Mock(exists=Mock(return_value=False)),
        ):
            with self.assertRaises(IntegrityError):
                serializer.save()

    def test_registration_normalizes_mixed_case_email(self):
        response = self.client.post(
            '/api/v1/auth/register/',
            {
                'email': '  Student@Example.COM ',
                'first_name': 'Test',
                'last_name': 'Student',
                'password': 'Strong-Test-Password-123!',
                'password2': 'Strong-Test-Password-123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='student@example.com').exists())

    def test_mixed_case_login_uses_canonical_email(self):
        User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )

        response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'Student@EXAMPLE.com', 'password': 'Strong-Test-Password-123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'student@example.com')
        self.assertTrue(response.cookies['access_token']['httponly'])

    def test_registration_rejects_duplicate_email_with_different_casing(self):
        User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )

        response = self.client.post(
            '/api/v1/auth/register/',
            {
                'email': 'STUDENT@EXAMPLE.COM',
                'first_name': 'Duplicate',
                'last_name': 'Student',
                'password': 'Strong-Test-Password-123!',
                'password2': 'Strong-Test-Password-123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['details'])

    def test_login_rejects_inactive_account(self):
        User.objects.create_user(
            email='inactive@example.com',
            password='Strong-Test-Password-123!',
            is_active=False,
        )

        response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'INACTIVE@example.com', 'password': 'Strong-Test-Password-123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_creates_student_and_sets_httponly_session_cookies(self):
        response = self.client.post(
            '/api/v1/auth/register/',
            {
                'email': 'student@example.com',
                'first_name': 'Test',
                'last_name': 'Student',
                'phone_number': '+251900000000',
                'password': 'Strong-Test-Password-123!',
                'password2': 'Strong-Test-Password-123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'STUDENT')
        self.assertNotIn('tokens', response.data)
        self.assertTrue(response.cookies['access_token']['httponly'])
        self.assertTrue(response.cookies['refresh_token']['httponly'])
        self.assertEqual(response.cookies['access_token']['path'], '/api/v1/')
        self.assertEqual(response.cookies['refresh_token']['path'], '/api/v1/auth/')
        self.assertTrue(User.objects.get(email='student@example.com').check_password(
            'Strong-Test-Password-123!'
        ))

    def test_login_rejects_invalid_password(self):
        User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )

        response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'student@example.com', 'password': 'wrong-password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_requires_authentication_and_returns_authenticated_user(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        anonymous_response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(anonymous_response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=user)
        response = self.client.get('/api/v1/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], user.email)

    def test_logout_does_not_expose_invalid_token_details(self):
        self.client.cookies['refresh_token'] = 'not-a-refresh-token'
        response = self.client.post('/api/v1/auth/logout/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['error'],
            'The session was cleared, but its refresh token was invalid or expired.',
        )
        self.assertNotIn('not-a-refresh-token', str(response.data))

    def test_logout_blacklists_the_refresh_token(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        self.client.cookies['refresh_token'] = str(refresh)

        response = self.client.post('/api/v1/auth/logout/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()
        )
        self.assertEqual(response.cookies['access_token']['max-age'], 0)
        self.assertEqual(response.cookies['refresh_token']['max-age'], 0)

    def test_login_sets_session_cookies_without_returning_tokens(self):
        User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )

        response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'student@example.com', 'password': 'Strong-Test-Password-123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('tokens', response.data)
        self.assertTrue(response.cookies['access_token']['httponly'])
        self.assertTrue(response.cookies['refresh_token']['httponly'])

    def test_access_cookie_authenticates_current_user(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/v1/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], user.email)

    def test_cookie_authenticated_mutations_require_valid_csrf_token(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        client = APIClient(enforce_csrf_checks=True)
        client.cookies['access_token'] = str(refresh.access_token)

        rejected = client.patch(
            '/api/v1/auth/me/',
            {'first_name': 'Updated'},
            format='json',
        )
        self.assertEqual(rejected.status_code, status.HTTP_403_FORBIDDEN)

        csrf_response = client.get('/api/v1/auth/csrf/')
        csrf_token = csrf_response.data['csrfToken']
        accepted = client.patch(
            '/api/v1/auth/me/',
            {'first_name': 'Updated'},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(accepted.status_code, status.HTTP_200_OK)
        self.assertEqual(accepted.data['first_name'], 'Updated')

    def test_refresh_uses_httponly_cookie_without_returning_token(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        self.client.cookies['refresh_token'] = str(refresh)

        response = self.client.post('/api/v1/auth/token/refresh/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)
        self.assertTrue(response.cookies['access_token']['httponly'])
        self.assertTrue(response.cookies['refresh_token']['httponly'])

    def test_registration_requires_csrf_token_for_browser_flow(self):
        client = APIClient(enforce_csrf_checks=True)
        registration_data = {
            'email': 'csrf-student@example.com',
            'first_name': 'CSRF',
            'last_name': 'Student',
            'password': 'Strong-Test-Password-123!',
            'password2': 'Strong-Test-Password-123!',
        }

        rejected = client.post(
            '/api/v1/auth/register/',
            registration_data,
            format='json',
        )
        self.assertEqual(rejected.status_code, status.HTTP_403_FORBIDDEN)

        csrf_response = client.get('/api/v1/auth/csrf/')
        accepted = client.post(
            '/api/v1/auth/register/',
            registration_data,
            format='json',
            HTTP_X_CSRFTOKEN=csrf_response.data['csrfToken'],
        )

        self.assertEqual(accepted.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('tokens', accepted.data)
