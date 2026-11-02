// Core entity types for Gofer Exam platform

export type Country = {
  code: string;
  name: string;
  flag: string;
};

export type Destination = {
  id: string;
  country: string;
  flag: string;
  popularCities: string[];
  description: string;
  whyStudyHere: string[];
  topUniversities: number;
  averageTuition: string;
  language: string;
  studentVisaInfo: string;
  livingCost: string;
  intakeSeasons: string[];
  image: string;
};

export type University = {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number;
  logo: string;
  description: string;
  programs: string[];
  tuitionRange: string;
  acceptanceRate: string;
  internationalStudents: number;
  website: string;
};

export type Scholarship = {
  id: string;
  title: string;
  provider: string;
  country: string;
  amount: string;
  type: 'Full' | 'Partial' | 'Merit-Based' | 'Need-Based';
  eligibility: string[];
  deadline: string;
  description: string;
  level: 'Undergraduate' | 'Graduate' | 'Postgraduate' | 'PhD' | 'All Levels';
  fields: string[];
  applicationLink: string;
  featured: boolean;
};

export type ExamType = 'IELTS' | 'TOEFL' | 'Duolingo';

export type ExamQuestion = {
  id: string;
  examType: ExamType;
  section: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export type ExamResource = {
  id: string;
  examType: ExamType;
  title: string;
  type: 'Video' | 'PDF' | 'Practice Test' | 'Tips';
  description: string;
  url: string;
  duration?: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  targetCountries: string[];
  targetLevel: string;
  targetField: string;
  englishProficiency?: string;
  registeredDate: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  assignedConsultant?: string;
};

export type Application = {
  id: string;
  studentId: string;
  studentName: string;
  university: string;
  program: string;
  country: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'Waitlisted';
  submittedDate?: string;
  lastUpdated: string;
  documents: Document[];
  notes?: string;
};

export type Document = {
  id: string;
  name: string;
  type: 'Transcript' | 'SOP' | 'LOR' | 'Resume' | 'Passport' | 'Test Score' | 'Other';
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
  uploadDate?: string;
  url?: string;
};

export type Consultation = {
  id: string;
  studentId: string;
  studentName: string;
  consultantId: string;
  consultantName: string;
  date: string;
  time: string;
  type: 'Initial' | 'Follow-up' | 'Document Review' | 'Interview Prep' | 'Visa Guidance';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  mode: 'Online' | 'In-Person';
  notes?: string;
};

export type Consultant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string[];
  countries: string[];
  studentsManaged: number;
  rating: number;
  avatar?: string;
  bio: string;
  joinedDate: string;
};

export type Reward = {
  id: string;
  studentId: string;
  points: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  earnedFrom: string;
  date: string;
};

export type RewardAction = {
  action: string;
  points: number;
  description: string;
};

export type Testimonial = {
  id: string;
  studentName: string;
  country: string;
  university: string;
  program: string;
  rating: number;
  text: string;
  image?: string;
  date: string;
};

export type ServiceOffered = {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  isProvidedByGofer: boolean;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  publishDate: string;
  readTime: string;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};
