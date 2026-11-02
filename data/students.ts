import { Student, Application, Consultation } from '@/types';

export const students: Student[] = [
  {
    id: 'std-1',
    name: 'Amare Tadesse',
    email: 'amare.t@email.com',
    phone: '+251-911-234567',
    country: 'Ethiopia',
    targetCountries: ['United States', 'Canada'],
    targetLevel: 'Master\'s',
    targetField: 'Computer Science',
    englishProficiency: 'IELTS 7.0',
    registeredDate: '2026-09-15',
    status: 'Active',
    assignedConsultant: 'cons-1'
  },
  {
    id: 'std-2',
    name: 'Fatima Hassan',
    email: 'fatima.h@email.com',
    phone: '+251-911-345678',
    country: 'Ethiopia',
    targetCountries: ['United Kingdom', 'Germany'],
    targetLevel: 'Master\'s',
    targetField: 'Business Administration',
    englishProficiency: 'TOEFL 95',
    registeredDate: '2026-08-20',
    status: 'Active',
    assignedConsultant: 'cons-2'
  },
  {
    id: 'std-3',
    name: 'Daniel Kebede',
    email: 'daniel.k@email.com',
    phone: '+251-911-456789',
    country: 'Ethiopia',
    targetCountries: ['Australia', 'New Zealand'],
    targetLevel: 'Bachelor\'s',
    targetField: 'Engineering',
    registeredDate: '2026-10-01',
    status: 'Active',
    assignedConsultant: 'cons-1'
  },
  {
    id: 'std-4',
    name: 'Sara Mohammed',
    email: 'sara.m@email.com',
    phone: '+251-911-567890',
    country: 'Ethiopia',
    targetCountries: ['Canada', 'Netherlands'],
    targetLevel: 'PhD',
    targetField: 'Public Health',
    englishProficiency: 'IELTS 8.0',
    registeredDate: '2026-07-10',
    status: 'Active',
    assignedConsultant: 'cons-3'
  },
  {
    id: 'std-5',
    name: 'Michael Tesfaye',
    email: 'michael.t@email.com',
    phone: '+251-911-678901',
    country: 'Ethiopia',
    targetCountries: ['United States', 'United Kingdom'],
    targetLevel: 'Master\'s',
    targetField: 'Data Science',
    englishProficiency: 'Duolingo 125',
    registeredDate: '2026-09-25',
    status: 'Active',
    assignedConsultant: 'cons-2'
  }
];

export const applications: Application[] = [
  {
    id: 'app-1',
    studentId: 'std-1',
    studentName: 'Amare Tadesse',
    university: 'University of Toronto',
    program: 'M.Sc. Computer Science',
    country: 'Canada',
    status: 'Under Review',
    submittedDate: '2026-10-15',
    lastUpdated: '2026-10-20',
    documents: [
      { id: 'doc-1', name: 'Transcripts', type: 'Transcript', status: 'Verified', uploadDate: '2026-10-10' },
      { id: 'doc-2', name: 'Statement of Purpose', type: 'SOP', status: 'Verified', uploadDate: '2026-10-12' },
      { id: 'doc-3', name: 'Letters of Recommendation', type: 'LOR', status: 'Verified', uploadDate: '2026-10-13' },
      { id: 'doc-4', name: 'IELTS Score Report', type: 'Test Score', status: 'Verified', uploadDate: '2026-10-08' }
    ]
  },
  {
    id: 'app-2',
    studentId: 'std-1',
    studentName: 'Amare Tadesse',
    university: 'MIT',
    program: 'M.S. Computer Science',
    country: 'United States',
    status: 'Draft',
    lastUpdated: '2026-10-28',
    documents: [
      { id: 'doc-5', name: 'Transcripts', type: 'Transcript', status: 'Uploaded', uploadDate: '2026-10-10' },
      { id: 'doc-6', name: 'Statement of Purpose', type: 'SOP', status: 'Pending' }
    ]
  },
  {
    id: 'app-3',
    studentId: 'std-2',
    studentName: 'Fatima Hassan',
    university: 'London School of Economics',
    program: 'MBA',
    country: 'United Kingdom',
    status: 'Accepted',
    submittedDate: '2026-09-01',
    lastUpdated: '2026-10-25',
    documents: [
      { id: 'doc-7', name: 'Transcripts', type: 'Transcript', status: 'Verified' },
      { id: 'doc-8', name: 'Work Experience Letter', type: 'Other', status: 'Verified' },
      { id: 'doc-9', name: 'TOEFL Score', type: 'Test Score', status: 'Verified' }
    ],
    notes: 'Congratulations! Offer letter received with 20% scholarship.'
  },
  {
    id: 'app-4',
    studentId: 'std-3',
    studentName: 'Daniel Kebede',
    university: 'University of Melbourne',
    program: 'B.Eng. Civil Engineering',
    country: 'Australia',
    status: 'Submitted',
    submittedDate: '2026-10-18',
    lastUpdated: '2026-10-18',
    documents: [
      { id: 'doc-10', name: 'High School Transcripts', type: 'Transcript', status: 'Verified' },
      { id: 'doc-11', name: 'Personal Statement', type: 'SOP', status: 'Verified' }
    ]
  },
  {
    id: 'app-5',
    studentId: 'std-4',
    studentName: 'Sara Mohammed',
    university: 'McGill University',
    program: 'PhD in Public Health',
    country: 'Canada',
    status: 'Waitlisted',
    submittedDate: '2026-08-15',
    lastUpdated: '2026-10-10',
    documents: [
      { id: 'doc-12', name: 'Transcripts', type: 'Transcript', status: 'Verified' },
      { id: 'doc-13', name: 'Research Proposal', type: 'Other', status: 'Verified' },
      { id: 'doc-14', name: 'IELTS Score', type: 'Test Score', status: 'Verified' }
    ],
    notes: 'On waitlist. Potential funding available if accepted.'
  }
];

export const consultations: Consultation[] = [
  {
    id: 'con-1',
    studentId: 'std-1',
    studentName: 'Amare Tadesse',
    consultantId: 'cons-1',
    consultantName: 'Dr. Abebe Wolde',
    date: '2026-11-05',
    time: '14:00',
    type: 'Document Review',
    status: 'Scheduled',
    mode: 'Online'
  },
  {
    id: 'con-2',
    studentId: 'std-2',
    studentName: 'Fatima Hassan',
    consultantId: 'cons-2',
    consultantName: 'Meron Desta',
    date: '2026-10-28',
    time: '10:00',
    type: 'Visa Guidance',
    status: 'Completed',
    mode: 'In-Person',
    notes: 'Reviewed UK visa requirements and prepared document checklist.'
  },
  {
    id: 'con-3',
    studentId: 'std-3',
    studentName: 'Daniel Kebede',
    consultantId: 'cons-1',
    consultantName: 'Dr. Abebe Wolde',
    date: '2026-11-03',
    time: '15:30',
    type: 'Initial',
    status: 'Scheduled',
    mode: 'Online'
  },
  {
    id: 'con-4',
    studentId: 'std-5',
    studentName: 'Michael Tesfaye',
    consultantId: 'cons-2',
    consultantName: 'Meron Desta',
    date: '2026-11-06',
    time: '11:00',
    type: 'Interview Prep',
    status: 'Scheduled',
    mode: 'Online'
  }
];
