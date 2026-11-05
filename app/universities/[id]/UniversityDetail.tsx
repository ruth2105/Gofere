'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import { getUniversity } from '@/lib/api/catalogues';
import { UniversityApiRecord } from '@/lib/api/client';

function formatUsd(value: string | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Not provided';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function UniversityDetail({ id }: { id: string }) {
  const [university, setUniversity] = useState<UniversityApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getUniversity(id)
      .then((item) => {
        if (active) setUniversity(item);
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
          Loading university details…
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">University details could not be loaded</h1>
            <p className="mb-4 text-gray-600">Please check your connection and try again.</p>
            <Button
              variant="primary"
              onClick={() => {
                setLoading(true);
                setLoadError(false);
                setRetryCount((count) => count + 1);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !university) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">University Not Found</h1>
            <Link href="/universities"><Button variant="primary">Back to Universities</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const facts = [
    ['Institution type', university.type.replaceAll('_', ' ').toLocaleLowerCase()],
    ['World ranking', university.world_ranking ? `#${university.world_ranking}` : 'Not provided'],
    ['National ranking', university.national_ranking ? `#${university.national_ranking}` : 'Not provided'],
    ['Founded', university.founded_year?.toString() || 'Not provided'],
    ['Annual tuition', formatUsd(university.tuition_fee)],
    ['Application fee', formatUsd(university.application_fee)],
    ['Acceptance rate', university.acceptance_rate ? `${university.acceptance_rate}%` : 'Not provided'],
    ['Minimum GPA', university.minimum_gpa || 'Not provided'],
    ['International students', university.international_students.toLocaleString()],
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/universities" className="flex items-center text-sm text-primary-600 hover:text-primary-700">
            <ArrowLeft size={16} className="mr-1" /> Back to Universities
          </Link>
        </div>
      </div>

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-gray-600">
              <MapPin size={18} aria-hidden="true" />
              {university.city}, {university.country}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{university.name}</h1>
            {university.is_partner && (
              <span className="mt-3 inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-900">
                Gofer Exam partner
              </span>
            )}
          </header>

          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Rankings, costs, and admission requirements can change. Confirm current details with the
            university before applying.
          </p>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {university.description && (
                <Card>
                  <CardHeader><CardTitle>About</CardTitle></CardHeader>
                  <CardContent className="text-gray-700">{university.description}</CardContent>
                </Card>
              )}
              {university.programs && university.programs.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Programs</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                      {university.programs.map((program) => <li key={program}>{program}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {university.popular_majors && university.popular_majors.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Popular Majors</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                      {university.popular_majors.map((major) => <li key={major}>{major}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {university.required_tests && university.required_tests.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Commonly Required Tests</CardTitle></CardHeader>
                  <CardContent className="text-gray-700">{university.required_tests.join(', ')}</CardContent>
                </Card>
              )}
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader><CardTitle>University Facts</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {facts.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b pb-2 last:border-b-0">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-right text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              {(university.website_url || university.address) && (
                <Card>
                  <CardHeader><CardTitle>Admissions</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {university.website_url && (
                      <a
                        href={university.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-primary-700 hover:underline"
                      >
                        Official website <ExternalLink size={14} className="ml-2" />
                      </a>
                    )}
                    {university.address && <p className="text-sm text-gray-700">{university.address}</p>}
                  </CardContent>
                </Card>
              )}
              <Link href="/contact">
                <Button variant="primary" className="w-full">
                  <GraduationCap size={18} className="mr-2" /> Ask About Applications
                </Button>
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
