'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, DollarSign, Globe, MapPin, ExternalLink } from 'lucide-react';
import { getDestination } from '@/lib/api/catalogues';
import { DestinationApiRecord } from '@/lib/api/client';

function formatCost(value: string, period: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Not provided';
  return `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)} ${period}`;
}

export default function DestinationDetail({ id }: { id: string }) {
  const [destination, setDestination] = useState<DestinationApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getDestination(id)
      .then((item) => {
        if (active) setDestination(item);
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
          Loading destination details…
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Destination details could not be loaded</h1>
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

  if (notFound || !destination) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Destination Not Found</h1>
            <Link href="/study-abroad">
              <Button variant="primary">Back to Destinations</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const facts = [
    { label: 'Annual average tuition', value: formatCost(destination.average_tuition_fee, '/ year'), icon: DollarSign },
    { label: 'Average living cost', value: formatCost(destination.average_living_cost, '/ month'), icon: DollarSign },
    { label: 'Primary language', value: destination.primary_language || 'Not provided', icon: Globe },
    { label: 'Listed universities', value: String(destination.total_universities), icon: MapPin },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/study-abroad" className="flex items-center text-sm text-primary-600 hover:text-primary-700">
            <ArrowLeft size={16} className="mr-1" />
            Back to Destinations
          </Link>
        </div>
      </div>

      <section className="bg-gradient-to-r from-primary-900 to-primary-700 py-16 text-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <span className="mr-4 text-6xl" aria-hidden="true">{destination.flag_emoji || '🌍'}</span>
          <div>
            <h1 className="mb-2 text-4xl font-bold">Study in {destination.name}</h1>
            <p className="text-xl text-gray-200">{destination.description}</p>
          </div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Costs and study or visa requirements can change. Confirm current details with official
            education and immigration sources before making decisions.
          </p>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {destination.highlights && destination.highlights.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Destination Highlights</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-2 text-gray-700">
                      {destination.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Study and Work Information</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  {destination.required_tests && destination.required_tests.length > 0 && (
                    <p><strong>Commonly required tests:</strong> {destination.required_tests.join(', ')}</p>
                  )}
                  {destination.work_while_studying !== undefined && (
                    <p>
                      <strong>Work while studying:</strong>{' '}
                      {destination.work_while_studying
                        ? `Yes${destination.work_hours_per_week ? `, up to ${destination.work_hours_per_week} hours per week` : ''}`
                        : 'Not indicated'}
                    </p>
                  )}
                  {destination.post_study_work_visa !== undefined && (
                    <p>
                      <strong>Post-study work visa:</strong>{' '}
                      {destination.post_study_work_visa
                        ? destination.post_study_work_duration || 'Available; confirm current rules'
                        : 'Not indicated'}
                    </p>
                  )}
                  {destination.visa_processing_time && (
                    <p><strong>Visa processing estimate:</strong> {destination.visa_processing_time}</p>
                  )}
                  {destination.scholarship_availability && (
                    <p><strong>Scholarships:</strong> {destination.scholarship_availability}</p>
                  )}
                  {!destination.required_tests?.length
                    && destination.work_while_studying === undefined
                    && destination.post_study_work_visa === undefined
                    && !destination.visa_processing_time
                    && !destination.scholarship_availability && (
                      <p>Additional study and visa information has not been published yet.</p>
                    )}
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Quick Facts</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {facts.map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <p className="mb-1 flex items-center text-sm font-semibold text-gray-700">
                        <Icon size={16} className="mr-2" />
                        {label}
                      </p>
                      <p className="text-gray-600">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {(destination.official_education_website || destination.embassy_website) && (
                <Card>
                  <CardHeader><CardTitle>Official Sources</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {destination.official_education_website && (
                      <a
                        href={destination.official_education_website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-primary-700 hover:underline"
                      >
                        Education website <ExternalLink size={14} className="ml-2" />
                      </a>
                    )}
                    {destination.embassy_website && (
                      <a
                        href={destination.embassy_website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-primary-700 hover:underline"
                      >
                        Embassy website <ExternalLink size={14} className="ml-2" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              <Link href="/contact">
                <Button variant="primary" className="w-full">Get Guidance</Button>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
