from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from .models import Notification


class NotificationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='user@example.com',
            password='SecurePassword123!',
            role='STUDENT',
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='SecurePassword123!',
            role='STUDENT',
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/v1/notifications/'

    def create_notification(self, user=None, **overrides):
        values = {
            'user': user or self.user,
            'type': 'SYSTEM',
            'title': 'Test notification',
            'message': 'A test event occurred.',
        }
        values.update(overrides)
        return Notification.objects.create(**values)

    def test_user_lists_only_their_own_notifications(self):
        own = self.create_notification()
        other = self.create_notification(user=self.other_user, title='Private to another user')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], str(own.id))
        self.assertNotIn(str(other.id), str(response.data))

    def test_user_cannot_retrieve_or_mark_another_users_notification_read(self):
        notification = self.create_notification(user=self.other_user)

        detail_response = self.client.get(f'{self.url}{notification.id}/')
        read_response = self.client.post(f'{self.url}{notification.id}/read/')

        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(read_response.status_code, status.HTTP_404_NOT_FOUND)
        notification.refresh_from_db()
        self.assertFalse(notification.is_read)

    def test_user_can_mark_one_notification_read_and_get_unread_count(self):
        notification = self.create_notification()
        other = self.create_notification(title='Another notification')

        response = self.client.post(f'{self.url}{notification.id}/read/')
        count_response = self.client.get(f'{self.url}unread-count/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_read'])
        self.assertIsNotNone(response.data['read_at'])
        self.assertEqual(count_response.data, {'count': 1})
        other.refresh_from_db()
        self.assertFalse(other.is_read)

    def test_read_all_only_marks_the_authenticated_users_notifications(self):
        self.create_notification()
        self.create_notification(title='Second notification')
        other = self.create_notification(user=self.other_user)

        response = self.client.post(f'{self.url}read-all/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'updated_count': 2})
        self.assertFalse(Notification.objects.filter(user=self.user, is_read=False).exists())
        other.refresh_from_db()
        self.assertFalse(other.is_read)

    def test_unread_filter_validates_boolean_values(self):
        self.create_notification()

        unread_response = self.client.get(self.url, {'unread': 'true'})
        invalid_response = self.client.get(self.url, {'unread': 'sometimes'})

        self.assertEqual(unread_response.status_code, status.HTTP_200_OK)
        self.assertEqual(unread_response.data['count'], 1)
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_notification_api_requires_authentication_and_is_read_only_for_creation(self):
        self.client.force_authenticate(user=None)
        unauthenticated_response = self.client.get(self.url)

        self.client.force_authenticate(user=self.user)
        create_response = self.client.post(self.url, {
            'type': 'SYSTEM',
            'title': 'Forged notification',
            'message': 'Users cannot create their own notifications.',
        })

        self.assertEqual(unauthenticated_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(create_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertFalse(Notification.objects.exists())
