'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Target, Video, FileText, ArrowRight } from 'lucide-react';

export default function ExamPrepPage() {
  const exams = [
    {
      id: 'ielts',
      name: 'IELTS',
      fullName: 'International English Language Testing System',
      icon: '📚',
      description: 'Prepare for IELTS Academic and General Training with comprehensive materials and practice tests.',
      features: [
        'Full-length practice tests',
        'Section-wise practice (Listening, Reading, Writing, Speaking)',
        'Band score prediction',
        'Expert tips and strategies',
        'Speaking practice sessions'
      ],
      acceptedBy: 'UK, Australia, Canada, and 140+ countries'
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      fullName: 'Test of English as a Foreign Language',
      icon: '🎯',
      description: 'Master TOEFL iBT with practice materials covering all four sections of the exam.',
      features: [
        'Complete mock tests',
        'Reading and listening comprehension',
        'Integrated and independent writing tasks',
        'Speaking response practice',
        'Note-taking strategies'
      ],
      acceptedBy: 'USA, Canada, and 150+ countries'
    },
    {
      id: 'duolingo',
      name: 'Duolingo English Test',
      fullName: 'Duolingo English Test',
      icon: '🦉',
      description: 'Get ready for the adaptive Duolingo English Test with our practice resources.',
      features: [
        'Adaptive practice tests',
        'All question types covered',
        'Video interview preparation',
        'Quick results in 48 hours',
        'Affordable test option'
      ],
      acceptedBy: 'Growing acceptance worldwide including USA, UK, Canada'
    }
  ];

  const resources = [
    { icon: Video, title: 'Video Lessons', description: 'Expert-led video tutorials' },
    { icon: FileText, title: 'Practice Tests', description: 'Full-length mock exams' },
    { icon: BookOpen, title: 'Study Guides', description: 'Comprehensive PDF guides' },
    { icon: Target, title: 'Tips & Strategies', description: 'Score improvement techniques' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 text-accent-teal" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">English Proficiency Exam Preparation</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Ace your IELTS, TOEFL, or Duolingo English Test with our comprehensive preparation resources
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Exam</h2>
            <p className="text-lg text-gray-600">Select the test that best fits your study abroad goals</p>
          </div>

          <div className="space-y-8">
            {exams.map((exam) => (
              <Card key={exam.id} hover>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-4xl mr-3">{exam.icon}</span>
                        <div>
                          <CardTitle className="text-2xl">{exam.name}</CardTitle>
                          <p className="text-sm text-gray-600">{exam.fullName}</p>
                        </div>
                      </div>
                      <CardDescription className="mt-2">{exam.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What&apos;s Included:</h4>
                      <ul className="space-y-1">
                        {exam.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Accepted By:</h4>
                      <p className="text-sm text-gray-700">{exam.acceptedBy}</p>
                      <Link href={`/exam-prep/${exam.id}`} className="mt-4 block">
                        <Button variant="primary" className="w-full">
                          Start Preparing <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Study Resources</h2>
            <p className="text-lg text-gray-600">Everything you need to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, idx) => {
              const Icon = resource.icon;
              return (
                <Card key={idx} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-primary-600" size={32} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
