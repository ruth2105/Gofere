'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

export default function ExamPrepPage() {
  const exams = [
    {
      id: 'ielts',
      name: 'IELTS',
      fullName: 'International English Language Testing System',
      icon: '📚',
      description: 'Review IELTS formats and use the preparation checklist and official provider resources.',
      features: [
        'Overview of Listening, Reading, Writing, and Speaking',
        'Preparation checklist',
        'Link to official IELTS preparation material',
        'Reminder to confirm the required test format and score with each institution'
      ]
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      fullName: 'Test of English as a Foreign Language',
      icon: '🎯',
      description: 'Review TOEFL iBT preparation guidance and use the official ETS resources.',
      features: [
        'Overview of TOEFL iBT sections',
        'Timed preparation checklist',
        'Link to official ETS preparation material',
        'Reminder to confirm requirements with each institution'
      ]
    },
    {
      id: 'duolingo',
      name: 'Duolingo English Test',
      fullName: 'Duolingo English Test',
      icon: '🦉',
      description: 'Learn about the Duolingo English Test and review official test preparation guidance.',
      features: [
        'Overview of test preparation steps',
        'Reminder to check test rules and technical requirements',
        'Link to official Duolingo English Test preparation material',
        'Reminder to confirm acceptance with each institution'
      ]
    }
  ];

  const officialResources = [
    { title: 'IELTS', url: 'https://ielts.org/take-a-test/preparation-resources' },
    { title: 'TOEFL iBT', url: 'https://www.ets.org/toefl/test-takers/ibt/prepare.html' },
    { title: 'Duolingo English Test', url: 'https://englishtest.duolingo.com/prepare' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1}>
      
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 text-brand-gold" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">English Exam Preparation Guides</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Review practical checklists and continue to official test-provider preparation resources.
            </p>
            <Link href="/exam-prep/practice-test" className="mt-6 inline-block">
              <Button variant="secondary">
                Try General English Practice <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
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
                      <h4 className="font-semibold text-gray-900 mb-2">This guide covers:</h4>
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
                      <h4 className="font-semibold text-gray-900 mb-2">Important:</h4>
                      <p className="text-sm text-gray-700">
                        Test acceptance and required scores vary by institution. Check directly with your target institution.
                      </p>
                      <Link href={`/exam-prep/${exam.id}`} className="mt-4 block">
                        <Button variant="primary" className="w-full">
                          View Preparation Guide <ArrowRight size={16} className="ml-2" />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Official Test-Provider Resources</h2>
            <p className="text-lg text-gray-600">
              Test providers maintain the authoritative guidance and current practice materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {officialResources.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white p-6 text-center shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              >
                <BookOpen className="mx-auto mb-4 text-primary-600" size={32} aria-hidden="true" />
                <span className="font-semibold text-gray-900">{resource.title}</span>
                <span className="mt-2 flex items-center justify-center gap-2 text-sm text-primary-700">
                  Official preparation resources <ExternalLink size={14} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
