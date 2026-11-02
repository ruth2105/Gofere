'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Plane, 
  Users,
  Globe,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { scholarships } from '@/data/scholarships';
import { destinations } from '@/data/destinations';
import { formatDate, calculateDaysUntil } from '@/lib/utils';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const featuredScholarships = scholarships.filter(s => s.featured).slice(0, 4);
  const topDestinations = destinations.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      {/* Hero Section - Authentic & Focused */}
      <section className="relative bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Find scholarships. Prepare for exams. <span className="text-blue-300">Study abroad.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              We help students navigate university applications, discover funding opportunities, and prepare for English proficiency tests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/scholarships">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary-900 hover:bg-white/90" leftIcon={<Award size={20} />}>
                  Explore Scholarships
                </Button>
              </Link>
              <Link href="/exam-prep">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10" leftIcon={<BookOpen size={20} />}>
                  Exam Preparation
                </Button>
              </Link>
            </div>
            
            {/* Inline Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-300">
              <div className="flex items-center">
                <Check size={16} className="mr-2 text-blue-300" />
                Free scholarship search
              </div>
              <div className="flex items-center">
                <Check size={16} className="mr-2 text-blue-300" />
                IELTS, TOEFL & Duolingo prep
              </div>
              <div className="flex items-center">
                <Check size={16} className="mr-2 text-blue-300" />
                Expert consultation available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Clear & Practical */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Scholarship Search</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Discover fully-funded and partial scholarships matched to your profile across 50+ countries.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Exam Preparation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Practice materials and guidance for IELTS, TOEFL, and Duolingo English Test.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Application Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Expert guidance on university applications, document preparation, and visa processes.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Consultation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with experienced consultants who understand your study abroad goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships - Real Data Focus */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Scholarships Open Now
              </h2>
              <p className="text-gray-600">
                Applications currently accepted — deadlines approaching
              </p>
            </div>
            <Link href="/scholarships" className="hidden md:block">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredScholarships.map((scholarship) => {
              const daysLeft = mounted ? calculateDaysUntil(scholarship.deadline) : 0;
              
              return (
                <Link key={scholarship.id} href={`/scholarships/${scholarship.id}`}>
                  <Card hover interactive className="h-full border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge variant={scholarship.type === 'Full' ? 'success' : 'info'} className="mb-2" size="sm">
                            {scholarship.type} Funding
                          </Badge>
                          <CardTitle className="text-xl mb-1">{scholarship.title}</CardTitle>
                          <CardDescription className="text-base">{scholarship.provider}</CardDescription>
                        </div>
                        <span className="text-3xl ml-4" aria-hidden="true">{scholarship.country === 'United States' ? '🇺🇸' : 
                                                         scholarship.country === 'United Kingdom' ? '🇬🇧' : 
                                                         scholarship.country === 'Germany' ? '🇩🇪' : 
                                                         scholarship.country === 'Australia' ? '🇦🇺' : 
                                                         scholarship.country === 'Canada' ? '🇨🇦' : '🌍'}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Coverage</p>
                          <p className="font-semibold text-gray-900">{scholarship.amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Level</p>
                          <p className="font-semibold text-gray-900">{scholarship.level}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500 mb-1">Application Deadline</p>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2 text-gray-400" />
                            <p className="font-semibold text-gray-900">
                              {formatDate(scholarship.deadline)}
                            </p>
                            {mounted && daysLeft > 0 && daysLeft <= 60 && (
                              <Badge variant="warning" className="ml-2" size="sm" dot>
                                {daysLeft} days left
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Link href="/scholarships">
              <Button variant="outline" className="w-full" rightIcon={<ArrowRight size={16} />}>
                View All Scholarships
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Exam Preparation - Practical & Specific */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              English Proficiency Test Preparation
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Most universities require IELTS, TOEFL, or Duolingo English Test scores. We provide practice materials to help you prepare.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/exam-prep/ielts">
              <Card hover interactive className="h-full bg-white" as="article">
                <CardHeader>
                  <div className="text-4xl mb-3" aria-hidden="true">📚</div>
                  <CardTitle>IELTS Preparation</CardTitle>
                  <CardDescription>Academic & General Training modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Practice tests for all four skills
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Band score calculator
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Writing task samples
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/exam-prep/toefl">
              <Card hover interactive className="h-full bg-white" as="article">
                <CardHeader>
                  <div className="text-4xl mb-3" aria-hidden="true">🎯</div>
                  <CardTitle>TOEFL iBT</CardTitle>
                  <CardDescription>Internet-based test format</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Reading, listening, speaking, writing
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Score interpretation guide
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Timed practice sections
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/exam-prep/duolingo">
              <Card hover interactive className="h-full bg-white" as="article">
                <CardHeader>
                  <div className="text-4xl mb-3" aria-hidden="true">🦉</div>
                  <CardTitle>Duolingo English Test</CardTitle>
                  <CardDescription>Convenient online assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Adaptive question formats
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Video interview prep
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      Sample test experience
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Study Destinations - Authentic Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Where Students Choose to Study
            </h2>
            <p className="text-gray-600">
              Compare popular destinations for international students
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {topDestinations.map((destination) => (
              <Link key={destination.id} href={`/study-abroad/${destination.id}`}>
                <Card hover interactive className="h-full" as="article">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl">{destination.flag}</span>
                          <CardTitle className="text-2xl">{destination.country}</CardTitle>
                        </div>
                        <CardDescription className="text-base line-clamp-2">
                          {destination.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start">
                        <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Popular Cities</p>
                          <p className="text-gray-900 font-medium">
                            {destination.popularCities.slice(0, 3).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <GraduationCap size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Universities</p>
                          <p className="text-gray-900 font-medium">{destination.topUniversities}+ institutions</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Globe size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Average Tuition</p>
                          <p className="text-gray-900 font-medium">{destination.averageTuition}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/study-abroad">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                Compare All Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Clear Student Journey */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              Your Study Abroad Journey
            </h2>
            <p className="text-gray-600 mb-12 text-center">
              A step-by-step path to studying abroad
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Opportunities</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse scholarships, universities, and study destinations. Filter by country, field of study, and funding type to find matches.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Prepare for Tests</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Practice IELTS, TOEFL, or Duolingo English Test. Most universities require proof of English proficiency for admission.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Apply & Get Guidance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Submit applications before deadlines. Connect with consultants for support with documents, essays, or visa processes.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Begin Your Studies</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive admission offers, secure your visa, arrange accommodation, and start your academic journey abroad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Services - Clear Value */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Need Personalized Guidance?
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our consultants can help you navigate university applications, scholarship essays, document preparation, and visa requirements.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">One-on-one consultation sessions</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Application review and feedback</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Visa process guidance</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Document preparation support</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    View Services
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Clock className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Flexible Scheduling</p>
                    <p className="text-sm text-gray-600">Book sessions at times that work for your timezone</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Experienced Consultants</p>
                    <p className="text-sm text-gray-600">Work with advisors familiar with international admissions</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Award className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Clear Guidance</p>
                    <p className="text-sm text-gray-600">Get actionable advice for your specific situation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Address Common Questions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <details className="bg-white rounded-lg border border-gray-200 p-6 group hover:border-primary-200 transition-colors focus-within:ring-4 focus-within:ring-primary-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Is Gofer Exam free to use?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes, searching for scholarships, browsing universities, and accessing exam preparation materials is completely free. Consultation services are available for a fee.
              </p>
            </details>
            
            <details className="bg-white rounded-lg border border-gray-200 p-6 group hover:border-primary-200 transition-colors focus-within:ring-4 focus-within:ring-primary-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Which countries can I study in?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We feature opportunities in the United States, United Kingdom, Canada, Australia, Germany, and many other countries across Europe, Asia, and beyond.
              </p>
            </details>
            
            <details className="bg-white rounded-lg border border-gray-200 p-6 group hover:border-primary-200 transition-colors focus-within:ring-4 focus-within:ring-primary-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Do I need to take IELTS or TOEFL?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Most universities require an English proficiency test if English is not your first language. Check the specific requirements of your target universities. Some accept IELTS, TOEFL, or Duolingo English Test.
              </p>
            </details>
            
            <details className="bg-white rounded-lg border border-gray-200 p-6 group hover:border-primary-200 transition-colors focus-within:ring-4 focus-within:ring-primary-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                How do I apply for scholarships?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Each scholarship has its own application process. We provide links to official application portals and list requirements. Some scholarships require a separate application, while others consider all admitted students automatically.
              </p>
            </details>
            
            <details className="bg-white rounded-lg border border-gray-200 p-6 group hover:border-primary-200 transition-colors focus-within:ring-4 focus-within:ring-primary-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Can consultants guarantee admission?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                No. Admission decisions are made by universities based on your qualifications. Our consultants provide guidance to strengthen your application, but cannot guarantee outcomes.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA - Simple & Direct */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create a free account to save scholarships, track deadlines, and access exam preparation materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/student/register">
              <Button size="lg" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white">
                Create Free Account
              </Button>
            </Link>
            <Link href="/scholarships">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Scholarships
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
