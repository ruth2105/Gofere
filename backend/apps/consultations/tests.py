from datetime import date, time, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.consultants.models import ConsultantProfile
from apps.notifications.models import Notification
from .models import Consultation


class ConsultationApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='student@example.com',
            password='SecurePassword123!',
            role='STUDENT',
        )
        self.consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
            first_name='Avery',
            last_name='Consultant',
        )
        ConsultantProfile.objects.create(
            user=self.consultant,
            verification_status='VERIFIED',
            is_available=True,
        )
        self.client.force_authenticate(user=self.student)
        self.base_url = '/api/v1/consultations/'
        self.scheduled_date = date.today() + timedelta(days=2)
        self.scheduled_time = time(10, 0)

    def booking_payload(self, **overrides):
        payload = {
            'consultant': str(self.consultant.id),
            'type': 'VIDEO',
            'title': 'Study planning',
            'description': 'Discuss study options.',
            'scheduled_date': self.scheduled_date.isoformat(),
            'scheduled_time': self.scheduled_time.isoformat(),
            'duration_minutes': 60,
            'timezone': 'UTC',
            'student_notes': 'I am interested in Canada.',
        }
        payload.update(overrides)
        return payload

    def create_booking(self, **overrides):
        values = {
            'student': self.student,
            'consultant': self.consultant,
            'title': 'Study planning',
            'scheduled_date': self.scheduled_date,
            'scheduled_time': self.scheduled_time,
        }
        values.update(overrides)
        return Consultation.objects.create(**values)

    def test_student_can_list_only_verified_available_consultants(self):
        pending = User.objects.create_user(
            email='pending@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        ConsultantProfile.objects.create(user=pending)
        unavailable = User.objects.create_user(
            email='unavailable@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        ConsultantProfile.objects.create(
            user=unavailable,
            verification_status='VERIFIED',
            is_available=False,
        )

        response = self.client.get(f'{self.base_url}consultants/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['consultant_id'], str(self.consultant.id))
        self.assertNotIn('verification_documents', response.data[0])

    def test_student_can_request_a_future_consultation_with_a_verified_consultant(self):
        response = self.client.post(self.base_url, self.booking_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Consultation.objects.get(id=response.data['id'])
        self.assertEqual(booking.student, self.student)
        self.assertEqual(booking.consultant, self.consultant)
        self.assertEqual(booking.status, 'PENDING')
        notification = Notification.objects.get(user=self.consultant)
        self.assertEqual(notification.type, 'CONSULTATION')
        self.assertFalse(notification.send_email)

    def test_student_cannot_request_an_unverified_consultant(self):
        unverified = User.objects.create_user(
            email='unverified@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        ConsultantProfile.objects.create(user=unverified)

        response = self.client.post(
            self.base_url,
            self.booking_payload(consultant=str(unverified.id)),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Consultation.objects.exists())

    def test_student_cannot_request_a_past_or_invalid_timezone_slot(self):
        past_date = (date.today() - timedelta(days=1)).isoformat()
        past_response = self.client.post(
            self.base_url,
            self.booking_payload(scheduled_date=past_date),
            format='json',
        )
        zone_response = self.client.post(
            self.base_url,
            self.booking_payload(timezone='Not/A_Real_Zone'),
            format='json',
        )

        self.assertEqual(past_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(zone_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Consultation.objects.exists())

    def test_overlapping_pending_or_confirmed_requests_are_rejected(self):
        first_response = self.client.post(
            self.base_url,
            self.booking_payload(timezone='Africa/Addis_Ababa'),
            format='json',
        )
        overlapping_response = self.client.post(
            self.base_url,
            self.booking_payload(scheduled_time='07:30:00'),
            format='json',
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(overlapping_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Consultation.objects.count(), 1)

    def test_student_cannot_view_or_cancel_another_students_booking(self):
        booking = self.create_booking(status='PENDING')
        other_student = User.objects.create_user(
            email='other@example.com',
            password='SecurePassword123!',
            role='STUDENT',
        )
        self.client.force_authenticate(user=other_student)

        detail_response = self.client.get(f'{self.base_url}{booking.id}/')
        cancel_response = self.client.post(f'{self.base_url}{booking.id}/cancel/')

        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(cancel_response.status_code, status.HTTP_404_NOT_FOUND)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'PENDING')

    def test_student_can_cancel_their_future_pending_booking(self):
        booking = self.create_booking(status='PENDING')

        response = self.client.post(f'{self.base_url}{booking.id}/cancel/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'CANCELLED')

    def test_assigned_consultant_can_confirm_booking_with_meeting_url(self):
        booking = self.create_booking(status='PENDING')
        self.client.force_authenticate(user=self.consultant)

        response = self.client.post(
            f'{self.base_url}consultant/assigned/{booking.id}/confirm/',
            {'meeting_url': 'https://meet.example.com/consultation'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'CONFIRMED')
        self.assertEqual(booking.meeting_url, 'https://meet.example.com/consultation')
        notification = Notification.objects.get(user=self.student)
        self.assertEqual(notification.title, 'Consultation confirmed')

    def test_consultant_cannot_manage_another_consultants_booking(self):
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        booking = self.create_booking(status='PENDING')
        self.client.force_authenticate(user=other_consultant)

        response = self.client.post(
            f'{self.base_url}consultant/assigned/{booking.id}/confirm/',
            {},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'PENDING')

    def test_consultant_can_complete_past_booking_and_student_can_rate_once(self):
        booking = self.create_booking(
            status='CONFIRMED',
            scheduled_date=date.today() - timedelta(days=1),
            scheduled_time=time(10, 0),
        )
        self.client.force_authenticate(user=self.consultant)
        complete_response = self.client.post(
            f'{self.base_url}consultant/assigned/{booking.id}/complete/',
            {'consultant_notes': 'Discussed available programs.', 'action_items': ['Review requirements']},
            format='json',
        )

        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_response.data['status'], 'COMPLETED')
        self.assertEqual(complete_response.data['action_items'], ['Review requirements'])

        self.client.force_authenticate(user=self.student)
        feedback_response = self.client.post(
            f'{self.base_url}{booking.id}/feedback/',
            {'rating': 5, 'feedback': 'Helpful session.'},
            format='json',
        )
        duplicate_feedback_response = self.client.post(
            f'{self.base_url}{booking.id}/feedback/',
            {'rating': 4},
            format='json',
        )

        self.assertEqual(feedback_response.status_code, status.HTTP_200_OK)
        self.assertEqual(feedback_response.data['student_rating'], 5)
        self.assertNotIn('consultant_notes', feedback_response.data)
        self.assertEqual(duplicate_feedback_response.status_code, status.HTTP_400_BAD_REQUEST)
