from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import User


class AuthenticationApiTests(APITestCase):
    def test_registration_creates_student_and_returns_tokens(self):
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
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
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

    def test_logout_requires_a_refresh_token(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        self.client.force_authenticate(user=user)

        response = self.client.post('/api/v1/auth/logout/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'A refresh token is required.')

    def test_logout_does_not_expose_invalid_token_details(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            '/api/v1/auth/logout/',
            {'refresh': 'not-a-refresh-token'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'The refresh token is invalid or expired.')
        self.assertNotIn('not-a-refresh-token', str(response.data))

    def test_logout_blacklists_the_refresh_token(self):
        user = User.objects.create_user(
            email='student@example.com',
            password='Strong-Test-Password-123!',
        )
        refresh = RefreshToken.for_user(user)
        self.client.force_authenticate(user=user)

        response = self.client.post(
            '/api/v1/auth/logout/',
            {'refresh': str(refresh)},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()
        )
