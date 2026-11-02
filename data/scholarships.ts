import { Scholarship } from '@/types';

export const scholarships: Scholarship[] = [
  {
    id: 'sch-1',
    title: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State',
    country: 'United States',
    amount: 'Full tuition + living stipend',
    type: 'Full',
    eligibility: [
      'International students',
      'Graduate level',
      'Strong academic record',
      'Leadership potential',
      'English proficiency'
    ],
    deadline: '2027-04-15',
    description: 'The Fulbright Program provides funding for international students to pursue master\'s or Ph.D. degrees in the United States.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://foreign.fulbrightonline.org',
    featured: true
  },
  {
    id: 'sch-2',
    title: 'Chevening Scholarships',
    provider: 'UK Government',
    country: 'United Kingdom',
    amount: 'Full tuition + living allowance',
    type: 'Full',
    eligibility: [
      'Citizens of Chevening-eligible countries',
      'At least 2 years work experience',
      'Leadership and networking skills',
      'Return to home country after studies'
    ],
    deadline: '2026-11-07',
    description: 'UK government global scholarship program for future leaders to pursue one-year master\'s degrees.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://www.chevening.org',
    featured: true
  },
  {
    id: 'sch-3',
    title: 'DAAD Scholarships',
    provider: 'German Academic Exchange Service',
    country: 'Germany',
    amount: '€850 - €1,200/month + tuition',
    type: 'Full',
    eligibility: [
      'International students',
      'Completed undergraduate degree',
      'At least 2 years work experience (for some programs)',
      'German or English language proficiency'
    ],
    deadline: '2026-10-31',
    description: 'Wide range of scholarship programs for international students at all academic levels.',
    level: 'All Levels',
    fields: ['All Fields'],
    applicationLink: 'https://www.daad.de',
    featured: true
  },
  {
    id: 'sch-4',
    title: 'Australia Awards Scholarships',
    provider: 'Australian Government',
    country: 'Australia',
    amount: 'Full tuition + living expenses + airfare',
    type: 'Full',
    eligibility: [
      'Citizens of eligible countries',
      'Minimum 2 years work experience',
      'Commitment to return home',
      'Meet university admission requirements'
    ],
    deadline: '2027-04-30',
    description: 'Long-term development awards for study at participating Australian universities.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://australiaawards.gov.au',
    featured: true
  },
  {
    id: 'sch-5',
    title: 'Vanier Canada Graduate Scholarships',
    provider: 'Government of Canada',
    country: 'Canada',
    amount: 'CAD $50,000/year for 3 years',
    type: 'Full',
    eligibility: [
      'Nominated by Canadian institution',
      'Doctoral students',
      'Strong academic excellence',
      'Research potential',
      'Leadership skills'
    ],
    deadline: '2026-11-04',
    description: 'Prestigious scholarship for doctoral students demonstrating leadership skills and high standard of academic achievement.',
    level: 'PhD',
    fields: ['Health Sciences', 'Natural Sciences', 'Engineering', 'Social Sciences', 'Humanities'],
    applicationLink: 'https://vanier.gc.ca',
    featured: false
  },
  {
    id: 'sch-6',
    title: 'Erasmus+ Master Degree Loans',
    provider: 'European Union',
    country: 'European Union',
    amount: 'Up to €18,000',
    type: 'Partial',
    eligibility: [
      'EU nationals or residents',
      'Master\'s degree students',
      'Study in different EU country'
    ],
    deadline: 'Rolling',
    description: 'Student loan guarantee facility for master\'s level studies in Europe.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://erasmus-plus.ec.europa.eu',
    featured: false
  },
  {
    id: 'sch-7',
    title: 'Rhodes Scholarships',
    provider: 'Rhodes Trust',
    country: 'United Kingdom',
    amount: 'Full tuition + stipend',
    type: 'Full',
    eligibility: [
      'Citizens of eligible countries',
      'Age 18-28',
      'Outstanding academic achievement',
      'Leadership qualities',
      'Commitment to service'
    ],
    deadline: '2026-10-01',
    description: 'The world\'s oldest and most prestigious international scholarship program for study at the University of Oxford.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://www.rhodeshouse.ox.ac.uk',
    featured: true
  },
  {
    id: 'sch-8',
    title: 'Gates Cambridge Scholarships',
    provider: 'Bill & Melinda Gates Foundation',
    country: 'United Kingdom',
    amount: 'Full cost of studying at Cambridge',
    type: 'Full',
    eligibility: [
      'International students (non-UK)',
      'Outstanding academic achievement',
      'Social leadership',
      'Commitment to improving lives of others'
    ],
    deadline: '2026-12-02',
    description: 'Highly competitive scholarship for graduate study at the University of Cambridge.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://www.gatescambridge.org',
    featured: true
  },
  {
    id: 'sch-9',
    title: 'Schwarzman Scholars',
    provider: 'Schwarzman Scholars',
    country: 'China',
    amount: 'Full scholarship + stipend',
    type: 'Full',
    eligibility: [
      'Undergraduate degree',
      'Age 18-28',
      'Leadership potential',
      'English proficiency',
      'Interest in China'
    ],
    deadline: '2026-09-15',
    description: 'One-year master\'s program at Tsinghua University designed to build greater understanding between China and the world.',
    level: 'Graduate',
    fields: ['Public Policy', 'Economics & Business', 'International Studies'],
    applicationLink: 'https://www.schwarzmanscholars.org',
    featured: false
  },
  {
    id: 'sch-10',
    title: 'Endeavour Postgraduate Scholarship',
    provider: 'Australian Government',
    country: 'Australia',
    amount: 'Up to AUD $140,500',
    type: 'Partial',
    eligibility: [
      'International students',
      'Postgraduate coursework or research',
      'Not Australian citizens'
    ],
    deadline: '2027-06-30',
    description: 'Merit-based scholarship for international students to undertake postgraduate study in Australia.',
    level: 'Postgraduate',
    fields: ['All Fields'],
    applicationLink: 'https://internationaleducation.gov.au',
    featured: false
  },
  {
    id: 'sch-11',
    title: 'Swiss Government Excellence Scholarships',
    provider: 'Swiss Government',
    country: 'Switzerland',
    amount: 'CHF 1,920/month + tuition + allowances',
    type: 'Full',
    eligibility: [
      'International students',
      'Postgraduate level',
      'Strong academic background',
      'Born after December 31, 1993'
    ],
    deadline: 'Varies by country',
    description: 'Research scholarships for foreign scholars and artists at Swiss universities.',
    level: 'Postgraduate',
    fields: ['All Fields'],
    applicationLink: 'https://www.sbfi.admin.ch',
    featured: false
  },
  {
    id: 'sch-12',
    title: 'Orange Knowledge Programme',
    provider: 'Dutch Ministry of Foreign Affairs',
    country: 'Netherlands',
    amount: 'Full or partial coverage',
    type: 'Partial',
    eligibility: [
      'Professionals from OKP countries',
      'Working in development-related sector',
      'Minimum 2 years work experience',
      'Employer support'
    ],
    deadline: '2027-02-01',
    description: 'Scholarships for short courses and master\'s programs in the Netherlands for professionals from specific countries.',
    level: 'Graduate',
    fields: ['Development-related fields'],
    applicationLink: 'https://www.studyinholland.nl',
    featured: false
  },
  {
    id: 'sch-13',
    title: 'Eiffel Excellence Scholarship',
    provider: 'French Ministry of Europe and Foreign Affairs',
    country: 'France',
    amount: '€1,181 - €1,700/month',
    type: 'Partial',
    eligibility: [
      'International students under 30 (Master\'s) or 35 (PhD)',
      'Nominated by French institution',
      'Master\'s or PhD level'
    ],
    deadline: '2027-01-08',
    description: 'Scholarship program to attract top international students to French institutions of higher education.',
    level: 'Graduate',
    fields: ['Engineering', 'Economics & Management', 'Law & Political Science'],
    applicationLink: 'https://www.campusfrance.org',
    featured: false
  },
  {
    id: 'sch-14',
    title: 'Swedish Institute Scholarships',
    provider: 'Swedish Institute',
    country: 'Sweden',
    amount: 'Full tuition + living expenses',
    type: 'Full',
    eligibility: [
      'Citizens of eligible countries',
      'Demonstrated leadership',
      'Master\'s level',
      'Work/volunteer experience'
    ],
    deadline: '2027-02-20',
    description: 'Fully-funded scholarships for global professionals to pursue master\'s studies in Sweden.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://si.se/en/apply/scholarships',
    featured: false
  },
  {
    id: 'sch-15',
    title: 'Rotary Peace Fellowship',
    provider: 'Rotary Foundation',
    country: 'Multiple Countries',
    amount: 'Full tuition + living expenses',
    type: 'Full',
    eligibility: [
      'Proficiency in English',
      'Relevant work experience',
      'Commitment to peace and conflict resolution'
    ],
    deadline: '2027-05-15',
    description: 'Fellowship for master\'s degree or professional certificate in peace and conflict studies.',
    level: 'Graduate',
    fields: ['Peace Studies', 'Conflict Resolution', 'International Relations'],
    applicationLink: 'https://www.rotary.org/en/our-programs/peace-fellowships',
    featured: false
  },
  {
    id: 'sch-16',
    title: 'Joint Japan World Bank Scholarship',
    provider: 'World Bank',
    country: 'Multiple Countries',
    amount: 'Full tuition + living expenses + airfare',
    type: 'Full',
    eligibility: [
      'Citizens of World Bank member countries',
      '3+ years recent professional experience',
      'Development-related fields',
      'Return to home country'
    ],
    deadline: '2027-04-11',
    description: 'Provides opportunities for developing country nationals to pursue graduate studies in development-related fields.',
    level: 'Graduate',
    fields: ['Development', 'Economics', 'Public Policy', 'Health', 'Education'],
    applicationLink: 'https://www.worldbank.org/en/programs/scholarships',
    featured: false
  },
  {
    id: 'sch-17',
    title: 'MEXT Scholarship (Japanese Government)',
    provider: 'Japanese Government',
    country: 'Japan',
    amount: '¥144,000 - ¥145,000/month + tuition',
    type: 'Full',
    eligibility: [
      'International students',
      'Under 35 years old',
      'Undergraduate, graduate, or research',
      'Good health'
    ],
    deadline: 'Varies (April-June)',
    description: 'Japanese government scholarship for international students to study at Japanese universities.',
    level: 'All Levels',
    fields: ['All Fields'],
    applicationLink: 'https://www.mext.go.jp',
    featured: false
  },
  {
    id: 'sch-18',
    title: 'KGSP Korean Government Scholarship',
    provider: 'Korean Government',
    country: 'South Korea',
    amount: 'Full tuition + monthly allowance',
    type: 'Full',
    eligibility: [
      'International students',
      'Under 25 (Bachelor) or 40 (Graduate)',
      'Good academic record',
      'Good health'
    ],
    deadline: 'Varies',
    description: 'Scholarship for international students to pursue degrees at Korean universities with Korean language training.',
    level: 'All Levels',
    fields: ['All Fields'],
    applicationLink: 'https://www.studyinkorea.go.kr',
    featured: false
  },
  {
    id: 'sch-19',
    title: 'Aga Khan Foundation Scholarship',
    provider: 'Aga Khan Foundation',
    country: 'Multiple Countries',
    amount: '50% grant + 50% loan',
    type: 'Partial',
    eligibility: [
      'Students from select developing countries',
      'Outstanding academic records',
      'No other sources of funding',
      'Postgraduate studies'
    ],
    deadline: '2027-03-31',
    description: 'Limited number of scholarships for postgraduate studies to outstanding students from developing countries.',
    level: 'Postgraduate',
    fields: ['All Fields'],
    applicationLink: 'https://www.akdn.org/our-agencies/aga-khan-foundation/scholarships',
    featured: false
  },
  {
    id: 'sch-20',
    title: 'Clarendon Fund Scholarships',
    provider: 'University of Oxford',
    country: 'United Kingdom',
    amount: 'Full tuition + grant',
    type: 'Full',
    eligibility: [
      'All graduate applicants to Oxford',
      'Outstanding academic merit',
      'Automatic consideration when applying'
    ],
    deadline: 'January (varies by course)',
    description: 'Oxford\'s largest graduate scholarship scheme offering over 140 scholarships annually.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://www.ox.ac.uk/clarendon',
    featured: false
  },
  {
    id: 'sch-21',
    title: 'Commonwealth Scholarships',
    provider: 'Commonwealth Scholarship Commission',
    country: 'United Kingdom',
    amount: 'Full tuition + living expenses',
    type: 'Full',
    eligibility: [
      'Commonwealth citizens',
      'Permanent resident in eligible country',
      'Master\'s or PhD level',
      'Cannot afford UK studies otherwise'
    ],
    deadline: 'Varies',
    description: 'UK government scholarship for students from Commonwealth countries to study in the UK.',
    level: 'Graduate',
    fields: ['All Fields'],
    applicationLink: 'https://cscuk.fcdo.gov.uk',
    featured: false
  },
  {
    id: 'sch-22',
    title: 'Mastercard Foundation Scholars Program',
    provider: 'Mastercard Foundation',
    country: 'Multiple Countries',
    amount: 'Full scholarship + living expenses',
    type: 'Full',
    eligibility: [
      'Academically talented young people from Africa',
      'Demonstrated leadership',
      'Commitment to giving back',
      'Financial need'
    ],
    deadline: 'Varies by partner institution',
    description: 'Comprehensive scholarship program for academically talented yet economically disadvantaged young people from Africa.',
    level: 'All Levels',
    fields: ['All Fields'],
    applicationLink: 'https://mastercardfdn.org/all/scholars',
    featured: false
  }
];
