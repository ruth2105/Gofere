import { ServiceOffered } from '@/types';

export const services: ServiceOffered[] = [
  {
    id: 'service-1',
    title: 'Study Abroad Counseling',
    description: 'Personalized guidance to help you choose the right country, university, and program based on your goals and profile.',
    icon: 'GraduationCap',
    features: [
      'One-on-one consultation sessions',
      'Country and university selection assistance',
      'Program recommendations based on profile',
      'Career pathway planning',
      'Budget and financial planning guidance'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-2',
    title: 'Scholarship Discovery & Application',
    description: 'Access our comprehensive scholarship database and receive expert assistance in preparing winning scholarship applications.',
    icon: 'Award',
    features: [
      'Curated scholarship database',
      'Eligibility matching',
      'Application strategy planning',
      'Essay and SOP review',
      'Mock interviews for scholarship panels'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-3',
    title: 'English Proficiency Exam Preparation',
    description: 'Comprehensive preparation for IELTS, TOEFL, and Duolingo English Tests with practice materials and expert tips.',
    icon: 'BookOpen',
    features: [
      'IELTS, TOEFL, and Duolingo prep courses',
      'Practice tests and mock exams',
      'Speaking practice sessions',
      'Writing feedback and correction',
      'Score improvement strategies'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-4',
    title: 'University Application Support',
    description: 'End-to-end assistance with university applications, from document preparation to submission tracking.',
    icon: 'FileText',
    features: [
      'Application timeline management',
      'SOP and essay writing guidance',
      'Resume/CV optimization',
      'Letter of recommendation coordination',
      'Application review before submission'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-5',
    title: 'Visa Guidance & Documentation',
    description: 'Expert support for student visa applications, including document preparation and interview preparation.',
    icon: 'Plane',
    features: [
      'Visa requirements checklist',
      'Document preparation assistance',
      'Visa interview preparation',
      'Financial documentation guidance',
      'Post-visa approval support'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-6',
    title: 'Pre-Departure Orientation',
    description: 'Prepare for your journey abroad with practical information about accommodation, culture, and campus life.',
    icon: 'Briefcase',
    features: [
      'Accommodation search tips',
      'Cultural orientation sessions',
      'Banking and insurance guidance',
      'Travel and packing advice',
      'Alumni connect opportunities'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-7',
    title: 'Career Counseling',
    description: 'Explore career paths and understand job market trends in your target country.',
    icon: 'TrendingUp',
    features: [
      'Career assessment and planning',
      'Industry insights and trends',
      'Job market analysis',
      'Professional networking tips',
      'Resume building for international markets'
    ],
    isProvidedByGofer: true
  },
  {
    id: 'service-8',
    title: 'Education Loan Assistance',
    description: 'Information and referrals for education loan options to fund your studies abroad.',
    icon: 'DollarSign',
    features: [
      'Loan provider information',
      'Eligibility requirements overview',
      'Application process guidance',
      'Interest rate comparisons',
      'Referrals to partner banks'
    ],
    isProvidedByGofer: false
  }
];
