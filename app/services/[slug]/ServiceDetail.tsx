'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { getService } from '@/lib/api/catalogues';
import { ServiceApiRecord } from '@/lib/api/client';

export default function ServiceDetail({ slug }: { slug: string }) {
  const [service, setService] = useState<ServiceApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getService(slug)
      .then((item) => {
        if (active) setService(item);
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
  }, [slug, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <p className="flex-1 flex items-center justify-center text-gray-600" role="status">
          Loading service details…
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Service details could not be loaded</h1>
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

  if (notFound || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Service Not Found</h1>
            <Link href="/services">
              <Button variant="primary">Back to Services</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Services
          </Link>
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Briefcase className="mt-1 text-primary-700" size={28} aria-hidden="true" />
                <div>
                  <CardTitle>{service.title}</CardTitle>
                  <p className="mt-2 text-sm text-gray-600">
                    {service.category.replaceAll('_', ' ').toLocaleLowerCase()}
                    {service.duration ? ` · ${service.duration}` : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="leading-7 text-gray-700">{service.description}</p>
              <p className="text-lg font-semibold text-gray-900">
                {service.currency} {Number(service.price).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {service.features.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900">What is included</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                    {service.features.map((feature, index) => <li key={`${feature}-${index}`}>{feature}</li>)}
                  </ul>
                </section>
              )}
              <p className="text-sm text-gray-600">
                Confirm availability and terms directly with Gofer Exam before purchasing. Outcomes are not guaranteed.
              </p>
              <Link href="/contact" className="inline-flex font-medium text-primary-700 hover:underline">
                Contact us about this service
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
