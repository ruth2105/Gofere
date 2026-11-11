from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from threading import Barrier

from unittest import skipUnless
from unittest.mock import Mock, patch

from django.db import IntegrityError
from django.db import close_old_connections, connection
from django.core import mail
from django.core.cache import cache
from django.test import TransactionTestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .email_verification import _token_digest
from .models import EmailVerificationToken, User
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
    def setUp(self):
        cache.clear()

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
            is_verified=True,
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

    def test_registration_creates_unverified_student_and_sends_email(self):
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
        self.assertFalse(response.data['user']['is_verified'])
        self.assertNotIn('tokens', response.data)
        self.assertNotIn('access_token', response.cookies)
        self.assertNotIn('refresh_token', response.cookies)
        self.assertTrue(User.objects.get(email='student@example.com').check_password(
            'Strong-Test-Password-123!'
        ))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['student@example.com'])
        self.assertIn('Verify email address', mail.outbox[0].alternatives[0][0])
        token = self.extract_token(mail.outbox[0].body)
        verification = EmailVerificationToken.objects.get(
            user__email='student@example.com'
        )
        self.assertEqual(verification.token_hash, _token_digest(token))
        self.assertNotEqual(verification.token_hash, token)

    @staticmethod
    def extract_token(body):
        import re

        match = re.search(r'[?&]token=([A-Za-z0-9_-]+)', body)
        if not match:
            raise AssertionError('Verification token was not found in the email body.')
        return match.group(1)

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
            is_verified=True,
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

    def test_login_rejects_unverified_student(self):
        User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )

        response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'student@example.com', 'password': 'Strong-Test-Password-123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('verify your email', str(response.data).lower())
        self.assertNotIn('access_token', response.cookies)

    def test_access_cookie_authenticates_current_user(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
            is_verified=True,
        )
        refresh = RefreshToken.for_user(user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/v1/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], user.email)

    def test_existing_unverified_access_cookie_is_rejected(self):
        user = User.objects.create_user(
            email='unverified@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/v1/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_existing_unverified_refresh_cookie_is_rejected(self):
        user = User.objects.create_user(
            email='unverified@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        self.client.cookies['refresh_token'] = str(refresh)

        response = self.client.post('/api/v1/auth/token/refresh/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.cookies['access_token']['max-age'], 0)
        self.assertEqual(response.cookies['refresh_token']['max-age'], 0)

    def test_cookie_authenticated_mutations_require_valid_csrf_token(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
            is_verified=True,
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
            is_verified=True,
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


class EmailVerificationWorkflowTests(APITestCase):
    def setUp(self):
        cache.clear()

    def register(self, email='verify@example.com'):
        return self.client.post(
            '/api/v1/auth/register/',
            {
                'email': email,
                'first_name': 'Verify',
                'last_name': 'Student',
                'password': 'Strong-Test-Password-123!',
                'password2': 'Strong-Test-Password-123!',
            },
            format='json',
        )

    @staticmethod
    def token_from_email():
        import re

        match = re.search(r'[?&]token=([A-Za-z0-9_-]+)', mail.outbox[0].body)
        if not match:
            raise AssertionError('Verification token was not found in the email body.')
        return match.group(1)

    def test_valid_token_verifies_only_its_account_and_cannot_be_reused(self):
        response = self.register()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        token = self.token_from_email()
        unverified_user = User.objects.get(email='verify@example.com')
        stale_refresh = RefreshToken.for_user(unverified_user)
        self.client.cookies['access_token'] = str(stale_refresh.access_token)
        other_user = User.objects.create_user(
            email='other@example.com',
            password='Strong-Test-Password-123!',
        )

        verified = self.client.post(
            '/api/v1/auth/verify-email/',
            {'token': token},
            format='json',
        )
        self.assertEqual(verified.status_code, status.HTTP_200_OK)
        self.assertEqual(verified.data['status'], 'verified')
        self.assertTrue(User.objects.get(email='verify@example.com').is_verified)
        other_user.refresh_from_db()
        self.assertFalse(other_user.is_verified)

        reused = self.client.post(
            '/api/v1/auth/verify-email/',
            {'token': token},
            format='json',
        )
        self.assertEqual(reused.status_code, status.HTTP_200_OK)
        self.assertEqual(reused.data['status'], 'already_verified')

        login = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'verify@example.com', 'password': 'Strong-Test-Password-123!'},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

    def test_invalid_token_is_rejected(self):
        response = self.client.post(
            '/api/v1/auth/verify-email/',
            {'token': 'not-a-valid-token'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'invalid')

    def test_expired_token_is_rejected_with_expired_state(self):
        self.register()
        verification = EmailVerificationToken.objects.get(
            user__email='verify@example.com'
        )
        verification.expires_at = timezone.now() - timedelta(seconds=1)
        verification.save(update_fields=['expires_at'])

        response = self.client.post(
            '/api/v1/auth/verify-email/',
            {'token': self.token_from_email()},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'expired')
        self.assertFalse(User.objects.get(email='verify@example.com').is_verified)

    def test_resend_cooldown_and_token_rotation(self):
        self.register()
        verification = EmailVerificationToken.objects.get(
            user__email='verify@example.com'
        )
        original_hash = verification.token_hash

        cooled_down = self.client.post(
            '/api/v1/auth/resend-verification/',
            {'email': 'verify@example.com'},
            format='json',
        )
        self.assertEqual(cooled_down.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(len(mail.outbox), 1)
        verification.refresh_from_db()
        self.assertEqual(verification.token_hash, original_hash)

        verification.last_sent_at = timezone.now() - timedelta(
            seconds=60,
        )
        verification.save(update_fields=['last_sent_at'])
        resent = self.client.post(
            '/api/v1/auth/resend-verification/',
            {'email': 'verify@example.com'},
            format='json',
        )

        self.assertEqual(resent.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(len(mail.outbox), 2)
        verification.refresh_from_db()
        self.assertNotEqual(verification.token_hash, original_hash)
        old_token = self.token_from_email()
        invalidated = self.client.post(
            '/api/v1/auth/verify-email/',
            {'token': old_token},
            format='json',
        )
        self.assertEqual(invalidated.data['status'], 'invalid')

    def test_email_provider_failure_does_not_verify_or_expose_token(self):
        with patch(
            'apps.accounts.email_verification.EmailMultiAlternatives.send',
            side_effect=OSError('sensitive provider details'),
        ):
            response = self.register()

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('account was created', response.data['error'])
        self.assertNotIn('sensitive provider details', str(response.data))
        user = User.objects.get(email='verify@example.com')
        self.assertFalse(user.is_verified)
        self.assertFalse(
            EmailVerificationToken.objects.filter(user=user).exists()
        )

    def test_resend_endpoint_is_rate_limited(self):
        responses = [
            self.client.post(
                '/api/v1/auth/resend-verification/',
                {'email': 'unknown@example.com'},
                format='json',
            )
            for _ in range(4)
        ]

        self.assertEqual(
            [response.status_code for response in responses],
            [
                status.HTTP_202_ACCEPTED,
                status.HTTP_202_ACCEPTED,
                status.HTTP_202_ACCEPTED,
                status.HTTP_429_TOO_MANY_REQUESTS,
            ],
        )
