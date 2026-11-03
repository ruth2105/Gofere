'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MapPin, Award, CheckCircle2, ExternalLink, ArrowLeft, Clock } from 'lucide-react';
import { formatDate, calculateDaysUntil } from '@/lib/utils';
import { getScholarship } from '@/lib/api/scholarships';
import { Scholarship } from '@/types';

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ScholarshipDetail({ id }: { id: string }) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    setNotFound(false);
    getScholarship(id)
      .then((item) => {
        if (active) setScholarship(item);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <p className="flex-1 flex items-center justify-center text-gray-600" role="status">
          Loading scholarship details…
        </p>
        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" role="alert">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Scholarship details could not be loaded</h1>
            <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
            <Button variant="primary" onClick={() => setRetryCount((count) => count + 1)}>
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !scholarship) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Not Found</h1>
            <Link href="/scholarships">
              <Button variant="primary">Back to Scholarships</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const daysLeft = mounted ? calculateDaysUntil(scholarship.deadline) : 0;
  const isUrgent = daysLeft > 0 && daysLeft <= 30;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/scholarships" className="text-primary-600 hover:text-primary-700 flex items-center text-sm">
            <ArrowLeft size={16} className="mr-1" />
            Back to Scholarships
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={scholarship.type === 'Full' ? 'success' : 'info'}>
                      {scholarship.type} Scholarship
                    </Badge>
                    {scholarship.featured && (
                      <Badge variant="warning">⭐ Featured</Badge>
                    )}
                    {mounted && daysLeft > 0 && (
                      <Badge variant={isUrgent ? 'danger' : 'warning'}>
                        {daysLeft} days left
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl mb-2">{scholarship.title}</CardTitle>
                  <CardDescription className="text-lg">{scholarship.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overview */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Overview</h3>
                      <p className="text-gray-700">{scholarship.description}</p>
                    </div>

                    {/* Key Information */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <MapPin className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-semibold text-gray-900">Country</p>
                            <p className="text-gray-600">{scholarship.country}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Award className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-semibold text-gray-900">Amount</p>
                            <p className="text-gray-600">{scholarship.amount}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-semibold text-gray-900">Deadline</p>
                            <p className="text-gray-600">{formatDate(scholarship.deadline)}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle2 className="text-primary-600 mr-2 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-semibold text-gray-900">Level</p>
                            <p className="text-gray-600">{scholarship.level}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligibility Requirements</h3>
                      <ul className="space-y-2">
                        {scholarship.eligibility.map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle2 size={20} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Fields of Study */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Fields of Study</h3>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.fields.map((field, idx) => (
                          <Badge key={idx} variant="default">{field}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Application CTA */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ready to Apply?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scholarship.applicationLink && (
                      <a
                        href={scholarship.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="primary" className="w-full" size="lg">
                          <ExternalLink size={20} className="mr-2" />
                          Apply Now
                        </Button>
                      </a>
                    )}
                    <Link href="/contact" className="block">
                      <Button variant="outline" className="w-full">
                        Get Application Help
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Deadline Reminder */}
                <Card className={daysLeft > 0 && isUrgent ? 'border-2 border-orange-500' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Clock size={20} className="mr-2 text-primary-600" />
                      Application Deadline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {formatDate(scholarship.deadline)}
                    </p>
                    {mounted && daysLeft > 0 ? (
                      <p className={`text-sm ${isUrgent ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                        {daysLeft} days remaining
                      </p>
                    ) : mounted ? (
                      <p className="text-sm text-red-600 font-semibold">Application closed</p>
                    ) : (
                      <p className="text-sm text-gray-600">Loading...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="bg-primary-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Need Assistance?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Our expert consultants can help you with:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-start">
                        <CheckCircle2 size={16} className="text-primary-600 mr-2 mt-0.5" />
                        Application strategy
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 size={16} className="text-primary-600 mr-2 mt-0.5" />
                        Essay writing and review
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 size={16} className="text-primary-600 mr-2 mt-0.5" />
                        Document preparation
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 size={16} className="text-primary-600 mr-2 mt-0.5" />
                        Interview preparation
                      </li>
                    </ul>
                    <Link href="/contact" className="block mt-4">
                      <Button variant="primary" className="w-full" size="sm">
                        Book Consultation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
