from datetime import date

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.scholarships.models import Scholarship
from apps.universities.models import University
from .models import Application


class ApplicationApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='student@example.com',
            password='SecurePassword123!',
            role='STUDENT',
        )
        self.other_student = User.objects.create_user(
            email='other@example.com',
            password='SecurePassword123!',
            role='STUDENT',
        )
        self.university = University.objects.create(
            name='Example University',
            description='A test university.',
            country='Canada',
            city='Toronto',
            type='PUBLIC',
            website_url='https://example.edu',
        )
        self.url = '/api/v1/applications/'
        self.client.force_authenticate(user=self.student)

    def create_application(self, student=None):
        return Application.objects.create(
            student=student or self.student,
            application_type='UNIVERSITY',
            university=self.university,
        )

    def test_students_can_create_and_list_only_their_own_drafts(self):
        response = self.client.post(self.url, {
            'application_type': 'UNIVERSITY',
            'university': str(self.university.id),
            'program_name': 'Computer Science',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        application = Application.objects.get(id=response.data['id'])
        self.assertEqual(application.student, self.student)
        self.assertEqual(application.status, 'DRAFT')
        self.assertEqual(response.data['university_name'], self.university.name)

        self.create_application(student=self.other_student)
        list_response = self.client.get(self.url)

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data['count'], 1)
        self.assertEqual(list_response.data['results'][0]['id'], str(application.id))

    def test_student_cannot_retrieve_another_students_application(self):
        application = self.create_application(student=self.other_student)

        response = self.client.get(f'{self.url}{application.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_students_cannot_set_managed_fields(self):
        response = self.client.post(self.url, {
            'application_type': 'UNIVERSITY',
            'university': str(self.university.id),
            'status': 'ACCEPTED',
            'admin_notes': 'Attempt to set internal notes',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Application.objects.exists())

    def test_application_requires_one_target_matching_its_type(self):
        response = self.client.post(self.url, {
            'application_type': 'UNIVERSITY',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('university', response.data['details'])

    def test_student_can_create_a_scholarship_draft_from_the_published_catalogue(self):
        scholarship = Scholarship.objects.create(
            name='Published Scholarship',
            description='A published test scholarship.',
            provider='Example Foundation',
            country='Canada',
            type='FULL',
            level='GRADUATE',
            amount='1000.00',
            application_deadline=date(2027, 1, 1),
            is_published=True,
        )

        response = self.client.post(self.url, {
            'application_type': 'SCHOLARSHIP',
            'scholarship': str(scholarship.id),
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['scholarship_name'], scholarship.name)
        self.assertEqual(response.data['status'], 'DRAFT')

    def test_scholarship_application_requires_a_published_scholarship(self):
        scholarship = Scholarship.objects.create(
            name='Example Scholarship',
            description='A test scholarship.',
            provider='Example Foundation',
            country='Canada',
            type='FULL',
            level='GRADUATE',
            amount='1000.00',
            application_deadline=date(2027, 1, 1),
            is_published=False,
        )

        response = self.client.post(self.url, {
            'application_type': 'SCHOLARSHIP',
            'scholarship': str(scholarship.id),
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Application.objects.exists())

    def test_student_can_mark_draft_submitted_then_withdraw(self):
        application = self.create_application()

        submit_response = self.client.post(f'{self.url}{application.id}/submit/')

        self.assertEqual(submit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(submit_response.data['status'], 'SUBMITTED')
        self.assertIsNotNone(submit_response.data['submission_date'])
        self.assertEqual(len(submit_response.data['status_updates']), 1)

        withdraw_response = self.client.post(f'{self.url}{application.id}/withdraw/')

        self.assertEqual(withdraw_response.status_code, status.HTTP_200_OK)
        self.assertEqual(withdraw_response.data['status'], 'WITHDRAWN')
        self.assertEqual(len(withdraw_response.data['status_updates']), 2)

    def test_submitted_application_cannot_be_edited_or_submitted_again(self):
        application = self.create_application()
        application.add_status_update('SUBMITTED', 'Submitted for test.')

        update_response = self.client.patch(
            f'{self.url}{application.id}/',
            {'notes': 'Changed after submission'},
        )
        submit_response = self.client.post(f'{self.url}{application.id}/submit/')

        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(submit_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_edit_their_own_draft(self):
        application = self.create_application()

        response = self.client.patch(
            f'{self.url}{application.id}/',
            {'notes': 'Prepare the translated transcript.'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['notes'], 'Prepare the translated transcript.')
        self.assertEqual(response.data['status'], 'DRAFT')

    def test_non_students_cannot_use_application_tracker(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        self.client.force_authenticate(user=consultant)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
