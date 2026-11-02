import { Destination } from '@/types';

export const destinations: Destination[] = [
  {
    id: 'usa',
    country: 'United States',
    flag: '🇺🇸',
    popularCities: ['New York', 'Boston', 'Los Angeles', 'Chicago', 'San Francisco'],
    description: 'Home to world-leading universities and diverse academic programs across all fields.',
    whyStudyHere: [
      'World\'s top-ranked universities',
      'Cutting-edge research facilities',
      'Diverse cultural experience',
      'Optional Practical Training (OPT) opportunities',
      'Strong industry connections'
    ],
    topUniversities: 150,
    averageTuition: '$30,000 - $60,000/year',
    language: 'English',
    studentVisaInfo: 'F-1 Student Visa required. Processing time: 3-5 weeks.',
    livingCost: '$15,000 - $25,000/year',
    intakeSeasons: ['Fall (September)', 'Spring (January)', 'Summer (May)'],
    image: '/images/destinations/usa.jpg'
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    flag: '🇬🇧',
    popularCities: ['London', 'Oxford', 'Cambridge', 'Edinburgh', 'Manchester'],
    description: 'Rich academic tradition with prestigious institutions and shorter program durations.',
    whyStudyHere: [
      'Historic universities with global reputation',
      'Shorter degree programs (3-year undergrad, 1-year masters)',
      'Post-study work visa (2-3 years)',
      'Gateway to Europe',
      'English language advantage'
    ],
    topUniversities: 80,
    averageTuition: '£15,000 - £35,000/year',
    language: 'English',
    studentVisaInfo: 'Tier 4 Student Visa required. Processing time: 3 weeks.',
    livingCost: '£12,000 - £18,000/year',
    intakeSeasons: ['September', 'January (limited programs)'],
    image: '/images/destinations/uk.jpg'
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    popularCities: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'],
    description: 'High-quality education with excellent post-graduation work opportunities and immigration pathways.',
    whyStudyHere: [
      'Affordable tuition compared to US/UK',
      'Post-Graduation Work Permit (PGWP) up to 3 years',
      'Pathway to permanent residence',
      'Safe and welcoming environment',
      'Bilingual opportunities (English/French)'
    ],
    topUniversities: 45,
    averageTuition: 'CAD $15,000 - $35,000/year',
    language: 'English, French',
    studentVisaInfo: 'Study Permit required. Processing time: 4-8 weeks.',
    livingCost: 'CAD $12,000 - $20,000/year',
    intakeSeasons: ['Fall (September)', 'Winter (January)', 'Summer (May)'],
    image: '/images/destinations/canada.jpg'
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    popularCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    description: 'World-class education in a vibrant, multicultural setting with beautiful landscapes.',
    whyStudyHere: [
      'High standard of living',
      'Post-study work rights (2-4 years)',
      'Strong research focus',
      'Work while studying (up to 48 hours/fortnight)',
      'Outdoor lifestyle and great weather'
    ],
    topUniversities: 40,
    averageTuition: 'AUD $25,000 - $45,000/year',
    language: 'English',
    studentVisaInfo: 'Subclass 500 Student Visa required. Processing time: 4-6 weeks.',
    livingCost: 'AUD $21,000 - $30,000/year',
    intakeSeasons: ['February', 'July'],
    image: '/images/destinations/australia.jpg'
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    popularCities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'],
    description: 'Tuition-free or low-cost education at public universities with strong engineering programs.',
    whyStudyHere: [
      'No tuition fees at public universities',
      'Strong economy and job market',
      'Excellence in engineering and technology',
      '18-month job-seeking visa after graduation',
      'Central location in Europe'
    ],
    topUniversities: 50,
    averageTuition: '€0 - €3,000/semester (public), €20,000+/year (private)',
    language: 'German, English (for many programs)',
    studentVisaInfo: 'National Visa (Type D) required. Processing time: 6-12 weeks.',
    livingCost: '€10,000 - €15,000/year',
    intakeSeasons: ['Winter Semester (October)', 'Summer Semester (April)'],
    image: '/images/destinations/germany.jpg'
  },
  {
    id: 'france',
    country: 'France',
    flag: '🇫🇷',
    popularCities: ['Paris', 'Lyon', 'Toulouse', 'Marseille', 'Bordeaux'],
    description: 'Rich cultural heritage with affordable public universities and excellent business schools.',
    whyStudyHere: [
      'Low tuition at public universities',
      'Cultural and artistic excellence',
      'Strong in arts, fashion, culinary, and business',
      '2-year post-study work permit',
      'Learn French language'
    ],
    topUniversities: 35,
    averageTuition: '€200 - €15,000/year',
    language: 'French, English (for some programs)',
    studentVisaInfo: 'Long-stay student visa required. Processing time: 4-6 weeks.',
    livingCost: '€9,000 - €15,000/year',
    intakeSeasons: ['September', 'January (limited)'],
    image: '/images/destinations/france.jpg'
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    popularCities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven'],
    description: 'English-taught programs, innovative teaching methods, and a bike-friendly student life.',
    whyStudyHere: [
      'Over 2,100 English-taught programs',
      'Interactive and student-centered learning',
      'One-year search visa after graduation',
      'Internationally oriented society',
      'High quality of life'
    ],
    topUniversities: 13,
    averageTuition: '€8,000 - €20,000/year',
    language: 'English, Dutch',
    studentVisaInfo: 'MVV (entry visa) and residence permit required. Processing time: 4-6 weeks.',
    livingCost: '€10,000 - €15,000/year',
    intakeSeasons: ['September', 'February'],
    image: '/images/destinations/netherlands.jpg'
  },
  {
    id: 'ireland',
    country: 'Ireland',
    flag: '🇮🇪',
    popularCities: ['Dublin', 'Cork', 'Galway', 'Limerick'],
    description: 'English-speaking EU country with friendly people and growing tech industry.',
    whyStudyHere: [
      'English-speaking country',
      'Part of the European Union',
      'Growing tech hub (Google, Facebook, Apple)',
      '2-year stay-back option',
      'Friendly and welcoming culture'
    ],
    topUniversities: 8,
    averageTuition: '€10,000 - €25,000/year',
    language: 'English, Irish',
    studentVisaInfo: 'Study visa required for non-EU students. Processing time: 8 weeks.',
    livingCost: '€10,000 - €15,000/year',
    intakeSeasons: ['September', 'January (limited)'],
    image: '/images/destinations/ireland.jpg'
  },
  {
    id: 'new-zealand',
    country: 'New Zealand',
    flag: '🇳🇿',
    popularCities: ['Auckland', 'Wellington', 'Christchurch', 'Dunedin'],
    description: 'Stunning natural beauty with excellent education and work-life balance.',
    whyStudyHere: [
      'High-quality education system',
      'Safe and peaceful environment',
      'Post-study work visa (up to 3 years)',
      'Amazing outdoor lifestyle',
      'Smaller class sizes and personalized attention'
    ],
    topUniversities: 8,
    averageTuition: 'NZD $22,000 - $35,000/year',
    language: 'English',
    studentVisaInfo: 'Student Visa required. Processing time: 4-6 weeks.',
    livingCost: 'NZD $15,000 - $20,000/year',
    intakeSeasons: ['February', 'July'],
    image: '/images/destinations/new-zealand.jpg'
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    popularCities: ['Singapore'],
    description: 'Asia\'s education hub with world-class universities and a strategic location.',
    whyStudyHere: [
      'Top-ranked Asian universities',
      'Strategic location in Southeast Asia',
      'Multicultural society',
      'Strong in business, technology, and engineering',
      'Safe and clean environment'
    ],
    topUniversities: 6,
    averageTuition: 'SGD $20,000 - $40,000/year',
    language: 'English, Mandarin, Malay, Tamil',
    studentVisaInfo: 'Student\'s Pass required. Processing time: 2-4 weeks.',
    livingCost: 'SGD $12,000 - $18,000/year',
    intakeSeasons: ['August', 'January'],
    image: '/images/destinations/singapore.jpg'
  }
];
