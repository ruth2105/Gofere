'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  MapPin,
} from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { api, OpportunityApiRecord } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

function formatLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .toLocaleLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function formatDeadline(value: string | null): string {
  if (!value) return 'No deadline listed';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Deadline not available';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export default function OpportunityDetail({ slug }: { slug: string }) {
  const [opportunity, setOpportunity] = useState<OpportunityApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    api.opportunities.get(slug)
      .then((record) => {
        if (active) setOpportunity(record);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFound(true);
        } else {
          setErrorMessage(getApiErrorMessage(error, 'Opportunity details could not be loaded.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey, slug]);

  const retry = () => {
    setLoading(true);
    setErrorMessage('');
    setNotFound(false);
    setRetryKey((key) => key + 1);
  };

  let content: ReactNode;
  if (loading) {
    content = (
      <FeedbackState
        variant="loading"
        title="Loading opportunity"
        description="Fetching the published opportunity details."
      />
    );
  } else if (errorMessage) {
    content = (
      <div>
        <FeedbackState
          variant="error"
          title="Opportunity details could not be loaded"
          description={errorMessage}
        />
        <Button className="mt-4" onClick={retry}>Try again</Button>
      </div>
    );
  } else if (notFound || !opportunity) {
    content = (
      <FeedbackState
        variant="empty"
        title="Opportunity not found"
        description="This listing may have expired or is no longer published."
      />
    );
  } else {
    const applicationUrl = opportunity.application_url || opportunity.official_website;
    content = (
      <>
        <Link
          href="/opportunities"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-primary-700 hover:text-primary-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to opportunities
        </Link>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <article>
            <Card>
              <CardHeader>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="info">{formatLabel(opportunity.category)}</Badge>
                  <Badge variant={opportunity.status === 'CLOSED' ? 'default' : 'success'}>
                    {formatLabel(opportunity.status)}
                  </Badge>
                  {opportunity.is_featured && <Badge variant="warning">Featured</Badge>}
                </div>
                <CardTitle as="h1" className="text-3xl">{opportunity.title}</CardTitle>
                <p className="mt-2 text-lg font-medium text-gray-600">
                  {opportunity.organization}
                </p>
              </CardHeader>
              <CardContent className="space-y-7">
                {opportunity.short_description && (
                  <p className="text-lg leading-relaxed text-gray-700">
                    {opportunity.short_description}
                  </p>
                )}
                <section>
                  <h2 className="mb-2 text-xl font-semibold text-gray-900">About this opportunity</h2>
                  <p className="whitespace-pre-line leading-relaxed text-gray-700">
                    {opportunity.description}
                  </p>
                </section>
                {opportunity.eligibility.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Eligibility</h2>
                    <ul className="space-y-2">
                      {opportunity.eligibility.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={18} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {opportunity.benefits.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Benefits</h2>
                    <ul className="space-y-2">
                      {opportunity.benefits.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={18} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </CardContent>
            </Card>
          </article>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle as="h2">Key information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {opportunity.country && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 shrink-0 text-primary-700" size={19} aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-900">Country</p>
                      <p className="text-gray-600">{opportunity.country}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 shrink-0 text-primary-700" size={19} aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900">Application deadline</p>
                    <p className="text-gray-600">{formatDeadline(opportunity.application_deadline)}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Study level</p>
                  <p className="text-gray-600">{formatLabel(opportunity.level)}</p>
                </div>
                {opportunity.status !== 'CLOSED' && applicationUrl ? (
                  <a
                    href={applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-900 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40"
                  >
                    Visit official application site
                    <ExternalLink size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                    {opportunity.status === 'CLOSED'
                      ? 'This opportunity is marked closed. Check the official website for updates.'
                      : 'An official application link is not currently available.'}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-gray-500">
                  Confirm eligibility, deadlines, and application requirements with the official provider before applying.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{content}</div>
      </main>
      <Footer />
    </div>
  );
}
