import { ExamQuestion, ExamResource } from '@/types';

export const examQuestions: ExamQuestion[] = [
  // IELTS Listening
  {
    id: 'ielts-l-1',
    examType: 'IELTS',
    section: 'Listening',
    question: 'What time does the library close on weekdays?',
    options: ['5:00 PM', '7:00 PM', '9:00 PM', '10:00 PM'],
    correctAnswer: '9:00 PM',
    explanation: 'The speaker clearly states that the library closes at 9:00 PM during weekdays.',
    difficulty: 'Easy'
  },
  {
    id: 'ielts-r-1',
    examType: 'IELTS',
    section: 'Reading',
    question: 'According to the passage, which factor contributes MOST to climate change?',
    options: [
      'Deforestation',
      'Industrial emissions',
      'Transportation',
      'Agricultural practices'
    ],
    correctAnswer: 'Industrial emissions',
    explanation: 'The passage emphasizes that industrial emissions account for the largest share of greenhouse gases.',
    difficulty: 'Medium'
  },
  {
    id: 'ielts-w-1',
    examType: 'IELTS',
    section: 'Writing',
    question: 'Task 2: Some people believe that universities should focus on practical skills rather than theoretical knowledge. To what extent do you agree or disagree?',
    correctAnswer: 'Essay should present balanced argument with clear position',
    explanation: 'Address both viewpoints, provide specific examples, maintain formal tone, and present clear position in introduction and conclusion.',
    difficulty: 'Hard'
  },
  {
    id: 'ielts-s-1',
    examType: 'IELTS',
    section: 'Speaking',
    question: 'Part 2: Describe a time when you helped someone. You should say: Who you helped, How you helped them, Why you decided to help, and explain how you felt about it.',
    correctAnswer: 'Personal response with structure',
    explanation: 'Should speak for 1-2 minutes, cover all points, use past tense, include descriptive language and personal feelings.',
    difficulty: 'Medium'
  },
  
  // TOEFL Reading
  {
    id: 'toefl-r-1',
    examType: 'TOEFL',
    section: 'Reading',
    question: 'The word "crucial" in paragraph 3 is closest in meaning to:',
    options: ['difficult', 'essential', 'interesting', 'complex'],
    correctAnswer: 'essential',
    explanation: 'In this context, crucial means vitally important or essential.',
    difficulty: 'Easy'
  },
  {
    id: 'toefl-l-1',
    examType: 'TOEFL',
    section: 'Listening',
    question: 'What is the professor\'s main point about photosynthesis?',
    options: [
      'It only occurs in green plants',
      'It is essential for oxygen production',
      'It requires complex equipment to study',
      'It was discovered in the 20th century'
    ],
    correctAnswer: 'It is essential for oxygen production',
    explanation: 'The lecture emphasizes photosynthesis as the primary source of oxygen in Earth\'s atmosphere.',
    difficulty: 'Medium'
  },
  {
    id: 'toefl-s-1',
    examType: 'TOEFL',
    section: 'Speaking',
    question: 'Task 1: Do you agree or disagree with the following statement? Students learn better when they study in groups rather than alone.',
    correctAnswer: 'Clear position with 2-3 supporting reasons',
    explanation: 'Respond within 45 seconds, state clear position, provide specific reasons and brief examples.',
    difficulty: 'Medium'
  },
  {
    id: 'toefl-w-1',
    examType: 'TOEFL',
    section: 'Writing',
    question: 'Integrated Task: Summarize the points made in the lecture, explaining how they cast doubt on the reading passage.',
    correctAnswer: 'Synthesize lecture and reading content',
    explanation: 'Identify 3 main points from lecture that contradict reading, explain relationships clearly, avoid personal opinion.',
    difficulty: 'Hard'
  },
  
  // Duolingo
  {
    id: 'duo-r-1',
    examType: 'Duolingo',
    section: 'Read & Complete',
    question: 'Complete the sentence: The students ___ their homework before going to the party.',
    options: ['finish', 'finished', 'finishing', 'will finish'],
    correctAnswer: 'finished',
    explanation: 'Past tense is required as the action was completed before another past action.',
    difficulty: 'Easy'
  },
  {
    id: 'duo-l-1',
    examType: 'Duolingo',
    section: 'Listen & Type',
    question: 'Type what you hear: [Audio plays]',
    correctAnswer: 'The conference will take place next Wednesday',
    explanation: 'Listen carefully for all words, including articles and prepositions.',
    difficulty: 'Medium'
  },
  {
    id: 'duo-s-1',
    examType: 'Duolingo',
    section: 'Read & Speak',
    question: 'Read the following sentence aloud: "The advancement of technology has revolutionized communication in unprecedented ways."',
    correctAnswer: 'Clear pronunciation and natural intonation',
    explanation: 'Focus on word stress, sentence rhythm, and clear articulation of complex words.',
    difficulty: 'Medium'
  },
  {
    id: 'duo-w-1',
    examType: 'Duolingo',
    section: 'Write About the Photo',
    question: 'Write about what you see in this image for at least 1 minute.',
    correctAnswer: 'Descriptive paragraph with details',
    explanation: 'Describe objects, people, actions, colors, and atmosphere. Use varied vocabulary and complete sentences.',
    difficulty: 'Medium'
  }
];

export const examResources: ExamResource[] = [
  // IELTS Resources
  {
    id: 'res-ielts-1',
    examType: 'IELTS',
    title: 'IELTS Listening Practice Test 1',
    type: 'Practice Test',
    description: 'Full-length listening test with 40 questions across 4 sections.',
    url: '/resources/ielts-listening-1',
    duration: '30 minutes'
  },
  {
    id: 'res-ielts-2',
    examType: 'IELTS',
    title: 'IELTS Writing Task 2 - Complete Guide',
    type: 'PDF',
    description: 'Comprehensive guide covering essay types, structure, and band 9 samples.',
    url: '/resources/ielts-writing-guide.pdf'
  },
  {
    id: 'res-ielts-3',
    examType: 'IELTS',
    title: 'Speaking Part 2 - Top 50 Topics',
    type: 'Video',
    description: 'Model answers for the most common IELTS speaking topics.',
    url: '/resources/ielts-speaking-video',
    duration: '45 minutes'
  },
  {
    id: 'res-ielts-4',
    examType: 'IELTS',
    title: 'Reading Strategies for Band 8+',
    type: 'Tips',
    description: 'Proven techniques to improve reading speed and accuracy.',
    url: '/resources/ielts-reading-tips'
  },
  
  // TOEFL Resources
  {
    id: 'res-toefl-1',
    examType: 'TOEFL',
    title: 'TOEFL iBT Complete Practice Test',
    type: 'Practice Test',
    description: 'Full 4-hour practice test simulating actual TOEFL iBT experience.',
    url: '/resources/toefl-practice-test',
    duration: '240 minutes'
  },
  {
    id: 'res-toefl-2',
    examType: 'TOEFL',
    title: 'Integrated Writing Masterclass',
    type: 'Video',
    description: 'Step-by-step approach to ace the TOEFL integrated writing task.',
    url: '/resources/toefl-writing-video',
    duration: '60 minutes'
  },
  {
    id: 'res-toefl-3',
    examType: 'TOEFL',
    title: 'TOEFL Vocabulary Builder - 500 Essential Words',
    type: 'PDF',
    description: 'High-frequency academic vocabulary with example sentences.',
    url: '/resources/toefl-vocabulary.pdf'
  },
  {
    id: 'res-toefl-4',
    examType: 'TOEFL',
    title: 'Note-taking Skills for Listening Section',
    type: 'Tips',
    description: 'Effective note-taking strategies for lectures and conversations.',
    url: '/resources/toefl-listening-tips'
  },
  
  // Duolingo Resources
  {
    id: 'res-duo-1',
    examType: 'Duolingo',
    title: 'Duolingo English Test - Full Mock Exam',
    type: 'Practice Test',
    description: 'Complete practice test with adaptive difficulty.',
    url: '/resources/duolingo-practice-test',
    duration: '60 minutes'
  },
  {
    id: 'res-duo-2',
    examType: 'Duolingo',
    title: 'Mastering the Video Interview Section',
    type: 'Video',
    description: 'Tips and sample responses for speaking and interview tasks.',
    url: '/resources/duolingo-interview-video',
    duration: '30 minutes'
  },
  {
    id: 'res-duo-3',
    examType: 'Duolingo',
    title: 'Complete Question Types Guide',
    type: 'PDF',
    description: 'Overview of all Duolingo question types with strategies.',
    url: '/resources/duolingo-guide.pdf'
  },
  {
    id: 'res-duo-4',
    examType: 'Duolingo',
    title: 'Quick Tips for 130+ Score',
    type: 'Tips',
    description: 'Essential strategies to maximize your Duolingo English Test score.',
    url: '/resources/duolingo-tips'
  }
];
