from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import User


class AuthenticationApiTests(APITestCase):
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
