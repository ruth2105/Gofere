import { Consultant } from '@/types';

export const consultants: Consultant[] = [
  {
    id: 'cons-1',
    name: 'Dr. Abebe Wolde',
    email: 'abebe.w@goferexam.com',
    phone: '+251-911-111111',
    expertise: ['Computer Science', 'Engineering', 'STEM Fields'],
    countries: ['United States', 'Canada', 'Australia'],
    studentsManaged: 45,
    rating: 4.9,
    bio: 'PhD graduate from Stanford with 8 years of experience in educational consultancy. Specialized in STEM applications to top US universities.',
    joinedDate: '2020-03-15'
  },
  {
    id: 'cons-2',
    name: 'Meron Desta',
    email: 'meron.d@goferexam.com',
    phone: '+251-911-222222',
    expertise: ['Business', 'MBA', 'Social Sciences'],
    countries: ['United Kingdom', 'Germany', 'Netherlands'],
    studentsManaged: 38,
    rating: 4.8,
    bio: 'MBA from London Business School. Expert in European university applications and scholarship guidance.',
    joinedDate: '2020-07-20'
  },
  {
    id: 'cons-3',
    name: 'Dr. Solomon Bekele',
    email: 'solomon.b@goferexam.com',
    phone: '+251-911-333333',
    expertise: ['Medicine', 'Public Health', 'Life Sciences'],
    countries: ['Canada', 'Australia', 'New Zealand'],
    studentsManaged: 32,
    rating: 4.9,
    bio: 'Medical doctor with PhD in Public Health from University of Toronto. Specializes in health sciences applications.',
    joinedDate: '2021-01-10'
  },
  {
    id: 'cons-4',
    name: 'Hiwot Tesfaye',
    email: 'hiwot.t@goferexam.com',
    phone: '+251-911-444444',
    expertise: ['Arts', 'Humanities', 'Design'],
    countries: ['United Kingdom', 'France', 'Italy'],
    studentsManaged: 28,
    rating: 4.7,
    bio: 'Master\'s in Fine Arts from Oxford. Passionate about helping students pursue creative fields in Europe.',
    joinedDate: '2021-06-01'
  }
];
