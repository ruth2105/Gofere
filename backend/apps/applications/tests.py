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

    def test_students_cannot_set_application_ownership(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )

        response = self.client.post(self.url, {
            'application_type': 'UNIVERSITY',
            'university': str(self.university.id),
            'student': str(self.other_student.id),
            'consultant': str(consultant.id),
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('student', response.data['details'])
        self.assertIn('consultant', response.data['details'])
        self.assertFalse(Application.objects.exists())

    def test_students_cannot_change_application_ownership(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        application = self.create_application()

        response = self.client.patch(
            f'{self.url}{application.id}/',
            {
                'student': str(self.other_student.id),
                'consultant': str(consultant.id),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        application.refresh_from_db()
        self.assertEqual(application.student, self.student)
        self.assertIsNone(application.consultant)

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

    def test_consultant_sees_only_applications_assigned_to_them(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        assigned = self.create_application()
        assigned.consultant = consultant
        assigned.save(update_fields=['consultant'])
        other_assigned = self.create_application(student=self.other_student)
        other_assigned.consultant = other_consultant
        other_assigned.save(update_fields=['consultant'])
        self.client.force_authenticate(user=consultant)

        response = self.client.get('/api/v1/applications/consultant/assigned/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], str(assigned.id))
        self.assertEqual(response.data['results'][0]['student_email'], self.student.email)
        self.assertNotIn('notes', response.data['results'][0])
        self.assertNotIn('admin_notes', response.data['results'][0])

    def test_consultant_list_excludes_unassigned_applications(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        unassigned = self.create_application()
        self.client.force_authenticate(user=consultant)

        response = self.client.get('/api/v1/applications/consultant/assigned/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertNotIn(str(unassigned.id), str(response.data))

    def test_consultant_can_filter_assigned_applications_by_status(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        draft = self.create_application()
        draft.consultant = consultant
        draft.save(update_fields=['consultant'])
        submitted = self.create_application(student=self.other_student)
        submitted.consultant = consultant
        submitted.status = 'SUBMITTED'
        submitted.save(update_fields=['consultant', 'status'])
        other_submitted = self.create_application()
        other_submitted.consultant = other_consultant
        other_submitted.status = 'SUBMITTED'
        other_submitted.save(update_fields=['consultant', 'status'])
        self.client.force_authenticate(user=consultant)

        response = self.client.get(
            '/api/v1/applications/consultant/assigned/',
            {'status': 'SUBMITTED'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], str(submitted.id))
        self.assertNotIn(str(other_submitted.id), str(response.data))

    def test_consultant_status_filter_rejects_unknown_status(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        self.client.force_authenticate(user=consultant)

        response = self.client.get(
            '/api/v1/applications/consultant/assigned/',
            {'status': 'NOT_A_STATUS'},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data['details'])

    def test_consultant_search_remains_scoped_to_assigned_applications(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        assigned = self.create_application()
        assigned.consultant = consultant
        assigned.save(update_fields=['consultant'])
        unassigned_match = self.create_application(student=self.other_student)
        unassigned_match.consultant = other_consultant
        unassigned_match.save(update_fields=['consultant'])
        self.client.force_authenticate(user=consultant)

        response = self.client.get(
            '/api/v1/applications/consultant/assigned/',
            {'search': self.other_student.email},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertNotIn(str(unassigned_match.id), str(response.data))
        self.assertNotIn(str(assigned.id), str(response.data))

    def test_consultant_search_finds_assigned_student_by_name_and_email(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        self.student.first_name = 'Maya'
        self.student.last_name = 'Student'
        self.student.save(update_fields=['first_name', 'last_name'])
        assigned = self.create_application()
        assigned.consultant = consultant
        assigned.save(update_fields=['consultant'])
        self.client.force_authenticate(user=consultant)

        for search_term in ('Maya', self.student.email):
            with self.subTest(search=search_term):
                response = self.client.get(
                    '/api/v1/applications/consultant/assigned/',
                    {'search': search_term},
                )

                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response.data['count'], 1)
                self.assertEqual(response.data['results'][0]['id'], str(assigned.id))

    def test_consultant_pagination_preserves_assignment_scope(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        assigned_ids = []
        for _ in range(21):
            application = self.create_application()
            application.consultant = consultant
            application.save(update_fields=['consultant'])
            assigned_ids.append(str(application.id))

        other_application = self.create_application(student=self.other_student)
        other_application.consultant = other_consultant
        other_application.save(update_fields=['consultant'])
        self.client.force_authenticate(user=consultant)

        response = self.client.get(
            '/api/v1/applications/consultant/assigned/',
            {'page': 2},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 21)
        self.assertEqual(len(response.data['results']), 1)
        self.assertIn(response.data['results'][0]['id'], assigned_ids)
        self.assertNotIn(str(other_application.id), assigned_ids)
        self.assertNotIn(str(other_application.id), str(response.data))

    def test_invalid_ordering_does_not_expand_assigned_results(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        assigned = self.create_application()
        assigned.consultant = consultant
        assigned.save(update_fields=['consultant'])
        other_application = self.create_application(student=self.other_student)
        other_application.consultant = other_consultant
        other_application.save(update_fields=['consultant'])
        self.client.force_authenticate(user=consultant)

        response = self.client.get(
            '/api/v1/applications/consultant/assigned/',
            {'ordering': 'student__email'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], str(assigned.id))
        self.assertNotIn(str(other_application.id), str(response.data))

    def test_consultant_cannot_retrieve_application_assigned_to_another_consultant(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        other_consultant = User.objects.create_user(
            email='other-consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        application = self.create_application()
        application.consultant = other_consultant
        application.save(update_fields=['consultant'])
        self.client.force_authenticate(user=consultant)

        response = self.client.get(f'{self.url}{application.id}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_consultant_cannot_retrieve_unassigned_application(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        application = self.create_application()
        self.client.force_authenticate(user=consultant)

        response = self.client.get(f'{self.url}{application.id}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_consultant_cannot_access_another_consultants_application(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        assigned = self.create_application()
        self.client.force_authenticate(user=consultant)

        response = self.client.get('/api/v1/applications/consultant/assigned/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertNotIn(str(assigned.id), str(response.data))

    def test_students_cannot_access_consultant_application_list(self):
        response = self.client.get('/api/v1/applications/consultant/assigned/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_overview_requires_an_administrator(self):
        response = self.client.get('/api/v1/applications/admin/overview/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_consultant_cannot_access_admin_overview(self):
        consultant = User.objects.create_user(
            email='consultant@example.com',
            password='SecurePassword123!',
            role='CONSULTANT',
        )
        self.client.force_authenticate(user=consultant)

        response = self.client.get('/api/v1/applications/admin/overview/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_consultant_and_admin_endpoints_require_authentication(self):
        self.client.force_authenticate(user=None)

        consultant_response = self.client.get(
            '/api/v1/applications/consultant/assigned/'
        )
        admin_response = self.client.get('/api/v1/applications/admin/overview/')

        self.assertEqual(consultant_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(admin_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_view_aggregate_overview_without_student_records(self):
        administrator = User.objects.create_user(
            email='admin@example.com',
            password='SecurePassword123!',
            role='ADMIN',
        )
        self.create_application()
        self.client.force_authenticate(user=administrator)

        response = self.client.get('/api/v1/applications/admin/overview/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['users']['students'], 2)
        self.assertEqual(response.data['users']['administrators'], 1)
        self.assertEqual(response.data['catalogues']['universities'], 1)
        self.assertEqual(response.data['applications']['total'], 1)
        self.assertEqual(response.data['applications']['by_status'], {'DRAFT': 1})
        self.assertNotIn('results', response.data)
        self.assertNotIn('email', response.data)

    def test_admin_overview_returns_zero_counts_for_empty_workflows(self):
        administrator = User.objects.create_user(
            email='admin@example.com',
            password='SecurePassword123!',
            role='ADMIN',
        )
        self.client.force_authenticate(user=administrator)

        response = self.client.get('/api/v1/applications/admin/overview/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['applications'], {
            'total': 0,
            'by_status': {},
        })
        self.assertEqual(response.data['consultations'], {
            'total': 0,
            'by_status': {},
        })
