'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Users,
  Globe,
  ArrowRight,
  Check,
  Calendar,
  Clock
} from 'lucide-react';
import { formatDate, calculateDaysUntil } from '@/lib/utils';
import { getScholarships } from '@/lib/api/scholarships';
import { getDestinations } from '@/lib/api/catalogues';
import { DestinationApiRecord } from '@/lib/api/client';
import { Scholarship } from '@/types';

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function HomePage() {
  const [featuredScholarships, setFeaturedScholarships] = useState<Scholarship[]>([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(true);
  const [scholarshipsError, setScholarshipsError] = useState(false);
  const [destinations, setDestinations] = useState<DestinationApiRecord[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );
  
  useEffect(() => {
    let active = true;
    getScholarships()
      .then((items) => {
        if (active) setFeaturedScholarships(items.filter((item) => item.featured).slice(0, 4));
      })
      .catch(() => {
        if (active) setScholarshipsError(true);
      })
      .finally(() => {
        if (active) setScholarshipsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getDestinations()
      .then((items) => {
        if (active) setDestinations(items.slice(0, 4));
      })
      .catch(() => {
        if (active) setDestinationsError(true);
      })
      .finally(() => {
        if (active) setDestinationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1">
      
      <section className="bg-brand-light">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-3 py-1.5 text-sm font-semibold text-primary-900">
              <span className="h-2 w-2 rounded-full bg-brand-gold" aria-hidden="true" />
              LEARN. PREPARE. APPLY. ACHIEVE.
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-primary-900 md:text-5xl lg:text-6xl">
              Your Next Opportunity Starts Here.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-700 md:text-xl">
              Prepare for your English exams, discover international opportunities, and get expert guidance for your study-abroad journey.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/scholarships">
                <Button size="lg" className="w-full sm:w-auto" leftIcon={<Award size={20} />}>
                  Explore Opportunities
                </Button>
              </Link>
              <Link href="/exam-prep">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" leftIcon={<BookOpen size={20} />}>
                  Start Exam Preparation
                </Button>
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 border-b border-gray-200 pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
                Your journey
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-primary-900">
                A clearer path forward.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Bring preparation, opportunity discovery, and application guidance together in one place.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/exam-prep"
                className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-brand-light focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-gold/20 text-sm font-bold text-primary-900">01</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-primary-900">Prepare with purpose</span>
                  <span className="mt-0.5 block text-sm text-gray-600">IELTS, TOEFL, and Duolingo test guidance</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-primary-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/scholarships"
                className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-brand-light focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-gold/20 text-sm font-bold text-primary-900">02</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-primary-900">Discover opportunities</span>
                  <span className="mt-0.5 block text-sm text-gray-600">Explore scholarships and study destinations</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-primary-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-brand-light focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-gold/20 text-sm font-bold text-primary-900">03</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-primary-900">Apply with guidance</span>
                  <span className="mt-0.5 block text-sm text-gray-600">Find support for your application journey</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-primary-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Clear & Practical */}
      <section className="border-y border-gray-200 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-gold/20">
                <Award className="text-primary-700" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Scholarship Search</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Discover fully funded and partial scholarship opportunities from destinations around the world.
              </p>
            </div>
            
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-gold/20">
                <BookOpen className="text-primary-700" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Exam Preparation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Practice materials and guidance for IELTS, TOEFL, and Duolingo English Test.
              </p>
            </div>
            
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-gold/20">
                <GraduationCap className="text-primary-700" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Published Services</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Browse services currently published in the Gofer Exam catalogue. Availability and terms should be confirmed before purchase.
              </p>
            </div>
            
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-gold/20">
                <Users className="text-primary-700" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Consultation Enquiries</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Contact Gofer Exam to ask about currently available consultation options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships - Real Data Focus */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <SectionHeading
              eyebrow="Scholarships"
              title="Scholarships Open Now"
              description="Explore current opportunities and keep application deadlines in view."
              className="mb-0"
            />
            <Link href="/scholarships" className="hidden md:block">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                View All
              </Button>
            </Link>
          </div>
          
          {scholarshipsError ? (
            <FeedbackState
              variant="error"
              title="Featured scholarships could not be loaded."
              description="Please try the scholarship search later."
            />
          ) : scholarshipsLoading ? (
            <FeedbackState
              variant="loading"
              title="Loading scholarship opportunities"
            />
          ) : featuredScholarships.length === 0 ? (
            <FeedbackState
              variant="empty"
              title="No featured scholarships are published right now."
              description="Browse all opportunities to see what is currently available."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredScholarships.map((scholarship) => {
              const daysLeft = mounted ? calculateDaysUntil(scholarship.deadline) : 0;
              
              return (
                <Link key={scholarship.id} href={`/scholarships/${scholarship.id}`}>
                  <Card hover interactive className="h-full border-l-4 border-l-brand-gold">
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
          )}
          
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
      <section className="bg-brand-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Exam preparation"
            title="Choose Your English Exam Path"
            description="Review preparation guidance and use official provider resources. This site does not currently offer interactive practice tests or score predictions."
          />
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/exam-prep/ielts">
              <Card hover interactive className="h-full bg-white" as="article">
                <CardHeader>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">IELTS</p>
                  <CardTitle>IELTS Preparation</CardTitle>
                  <CardDescription>Academic & General Training modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Overview of all four test skills
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Preparation checklist
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Official preparation resources
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/exam-prep/toefl">
              <Card hover interactive className="h-full bg-white" as="article">
                <CardHeader>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">TOEFL iBT</p>
                  <CardTitle>TOEFL iBT</CardTitle>
                  <CardDescription>Internet-based test format</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Reading, listening, speaking, writing
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Preparation checklist
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Official preparation resources
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/exam-prep/duolingo">
              <Card hover interactive className="h-full bg-white" as="article">
                <CardHeader>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">Duolingo English Test</p>
                  <CardTitle>Duolingo English Test</CardTitle>
                  <CardDescription>Convenient online assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Adaptive question formats
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Video interview prep
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-gold" />
                      Official preparation resources
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
          <SectionHeading
            eyebrow="Study abroad"
            title="Where Students Choose to Study"
            description="Compare popular destinations for international students."
          />
          
          {destinationsLoading ? (
            <FeedbackState variant="loading" title="Loading study destinations" />
          ) : destinationsError ? (
            <FeedbackState
              variant="error"
              title="Destinations could not be loaded."
              description="Please try the destination directory later."
            />
          ) : destinations.length === 0 ? (
            <FeedbackState
              variant="empty"
              title="No destinations have been published yet."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
            {destinations.map((destination) => (
              <Link key={destination.id} href={`/study-abroad/${destination.slug}`}>
                <Card hover interactive className="h-full" as="article">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl" aria-hidden="true">{destination.flag_emoji || '🌍'}</span>
                          <CardTitle className="text-2xl">{destination.name}</CardTitle>
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
                        <GraduationCap size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Listed universities</p>
                          <p className="text-gray-900 font-medium">{destination.total_universities}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Globe size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Primary language</p>
                          <p className="text-gray-900 font-medium">{destination.primary_language || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            </div>
          )}
          
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
      <section className="border-y border-gray-200 bg-brand-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <SectionHeading
              eyebrow="The process"
              title="Your Study Abroad Journey"
              description="A step-by-step path to studying abroad."
              centered
              className="mb-12"
            />
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-900 text-lg font-bold text-brand-gold">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-900 text-lg font-bold text-brand-gold">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-900 text-lg font-bold text-brand-gold">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-900 text-lg font-bold text-brand-gold">
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
                  <Check size={20} className="mr-3 mt-0.5 flex-shrink-0 text-brand-gold" />
                  <span className="text-gray-700">One-on-one consultation sessions</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-3 mt-0.5 flex-shrink-0 text-brand-gold" />
                  <span className="text-gray-700">Application review and feedback</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-3 mt-0.5 flex-shrink-0 text-brand-gold" />
                  <span className="text-gray-700">Visa process guidance</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="mr-3 mt-0.5 flex-shrink-0 text-brand-gold" />
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
            
            <div className="rounded-lg border border-gray-200 bg-brand-light p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Clock className="text-primary-700 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Flexible Scheduling</p>
                    <p className="text-sm text-gray-600">Book sessions at times that work for your timezone</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="text-primary-700 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Experienced Consultants</p>
                    <p className="text-sm text-gray-600">Work with advisors familiar with international admissions</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Award className="text-primary-700 flex-shrink-0" size={24} />
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
      <section className="bg-brand-light py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Frequently Asked Questions"
            centered
            className="mb-8"
          />
          
          <div className="space-y-6">
            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 focus-within:ring-4 focus-within:ring-brand-gold/25">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Is Gofer Exam free to use?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes, searching for scholarships, browsing universities, and accessing exam preparation materials is completely free. Consultation services are available for a fee.
              </p>
            </details>
            
            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 focus-within:ring-4 focus-within:ring-brand-gold/25">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Which countries can I study in?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We feature opportunities in the United States, United Kingdom, Canada, Australia, Germany, and many other countries across Europe, Asia, and beyond.
              </p>
            </details>
            
            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 focus-within:ring-4 focus-within:ring-brand-gold/25">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                Do I need to take IELTS or TOEFL?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Most universities require an English proficiency test if English is not your first language. Check the specific requirements of your target universities. Some accept IELTS, TOEFL, or Duolingo English Test.
              </p>
            </details>
            
            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 focus-within:ring-4 focus-within:ring-brand-gold/25">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center focus:outline-none">
                How do I apply for scholarships?
                <ArrowRight className="group-open:rotate-90 transition-transform text-primary-600" size={20} aria-hidden="true" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Each scholarship has its own application process. We provide links to official application portals and list requirements. Some scholarships require a separate application, while others consider all admitted students automatically.
              </p>
            </details>
            
            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 focus-within:ring-4 focus-within:ring-brand-gold/25">
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
              <Button size="lg" className="w-full sm:w-auto">
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

      </main>
      <Footer />
    </div>
  );
}
