'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  api,
  type PersonalizedScholarshipResult,
  type ScholarshipMatchStatus,
  type UserApiRecord,
} from '@/lib/api/client';

type StatusFilter = 'ALL' | ScholarshipMatchStatus;

const statusLabels: Record<ScholarshipMatchStatus, string> = {
  ELIGIBLE: 'Eligible',
  NOT_ELIGIBLE: 'Not eligible',
  NEEDS_VERIFICATION: 'Needs verification',
};

function formatDeadline(value: string): string {
  if (!value) return 'Not specified';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRequirement(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }: { status: ScholarshipMatchStatus }) {
  const styles: Record<ScholarshipMatchStatus, string> = {
    ELIGIBLE: 'bg-green-100 text-green-800',
    NOT_ELIGIBLE: 'bg-red-100 text-red-800',
    NEEDS_VERIFICATION: 'bg-amber-100 text-amber-800',
  };

  const icons = {
    ELIGIBLE: <CheckCircle2 size={16} />,
    NOT_ELIGIBLE: <ShieldAlert size={16} />,
    NEEDS_VERIFICATION: <AlertCircle size={16} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {statusLabels[status]}
    </span>
  );
}

export default function PersonalizedScholarshipsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserApiRecord | null>(null);
  const [results, setResults] = useState<PersonalizedScholarshipResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      setError('');

      try {
        const currentUser = await api.auth.getCurrentUser();

        if (!active) return;

        if (currentUser.role !== 'STUDENT') {
          if (currentUser.role === 'CONSULTANT') {
            router.replace('/consultant');
          } else {
            router.replace('/admin');
          }
          return;
        }

        setUser(currentUser);

        const response = await api.scholarships.eligibleForMe();

        if (!active) return;

        setResults(response.results);
      } catch (err: unknown) {
        if (!active) return;

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.replace('/student/login');
          return;
        }

        setError(
          'We could not load your personalized scholarships. Please try again.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [router, retryCount]);

  const counts = useMemo(() => ({
    ALL: results.length,
    ELIGIBLE: results.filter(
      (item) => item.match.status === 'ELIGIBLE'
    ).length,
    NOT_ELIGIBLE: results.filter(
      (item) => item.match.status === 'NOT_ELIGIBLE'
    ).length,
    NEEDS_VERIFICATION: results.filter(
      (item) => item.match.status === 'NEEDS_VERIFICATION'
    ).length,
  }), [results]);

  const filteredResults = useMemo(() => {
    if (filter === 'ALL') return results;
    return results.filter((item) => item.match.status === filter);
  }, [results, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-primary-900 py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-brand-gold">
                <Award size={36} />
                <span className="font-semibold uppercase tracking-wider text-sm">
                  Personalized scholarship matching
                </span>
              </div>

              <h1 className="text-3xl font-bold md:text-5xl">
                Scholarships Matched for You
              </h1>

              <p className="max-w-2xl text-gray-200">
                Explore current scholarships and understand how their
                eligibility requirements compare with your student profile.
              </p>

              {user && (
                <p className="text-sm text-gray-300">
                  Signed in as {user.full_name || user.email}
                </p>
              )}

              <div className="mt-2">
                <Link
                  href="/student"
                  className="inline-flex items-center gap-2 text-sm text-white underline underline-offset-4 hover:text-brand-gold"
                >
                  Back to student dashboard
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div
              className="flex min-h-64 items-center justify-center"
              role="status"
            >
              <div className="text-center">
                <RefreshCw
                  className="mx-auto mb-4 animate-spin text-primary-700"
                  size={32}
                />
                <p className="text-gray-600">
                  Checking scholarships against your profile...
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              className="rounded-xl border border-red-200 bg-white p-8 text-center"
              role="alert"
            >
              <AlertCircle className="mx-auto mb-3 text-red-600" size={36} />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Unable to load your matches
              </h2>
              <p className="mb-5 text-gray-600">{error}</p>
              <Button
                variant="primary"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {([
                  ['ALL', 'All scholarships', 'bg-primary-50'],
                  ['ELIGIBLE', 'Eligible', 'bg-green-50'],
                  ['NOT_ELIGIBLE', 'Not eligible', 'bg-red-50'],
                  ['NEEDS_VERIFICATION', 'Needs verification', 'bg-amber-50'],
                ] as const).map(([key, label, background]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={filter === key}
                    className={`rounded-xl border p-5 text-left transition ${
                      filter === key
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-400'
                    } ${background}`}
                  >
                    <p className="text-sm font-medium text-gray-600">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {counts[key]}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your scholarship results
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Showing {filteredResults.length} of {results.length} scholarships
                  </p>
                </div>

                <Link
                  href="/scholarships"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary-600 px-5 py-2.5 text-base font-medium text-primary-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40"
                >
                  Browse all scholarships
                </Link>
              </div>

              {filteredResults.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                  <Award className="mx-auto mb-4 text-gray-400" size={42} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {results.length === 0
                      ? 'No current scholarships available'
                      : 'No scholarships in this category'}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {results.length === 0
                      ? 'Check back when new scholarships are published.'
                      : 'Try another eligibility filter to see more results.'}
                  </p>
                  {results.length > 0 && (
                    <Button
                      variant="outline"
                      className="mt-5"
                      onClick={() => setFilter('ALL')}
                    >
                      Show all results
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredResults.map(({ scholarship, match }) => (
                    <article
                      key={scholarship.id}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3">
                            <StatusBadge status={match.status} />
                          </div>

                          <h3 className="text-xl font-bold text-gray-900">
                            {scholarship.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-600">
                            Offered by {scholarship.provider}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={16} />
                              {scholarship.country}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={16} />
                              Deadline: {formatDeadline(
                                scholarship.application_deadline
                              )}
                            </span>
                          </div>

                          <p className="mt-4 text-sm text-gray-700">
                            {scholarship.short_description ||
                              scholarship.description ||
                              'View the scholarship details for full information.'}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 md:w-44">
                          <Link
                            href={`/scholarships/${scholarship.slug}`}
                            className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-brand-gold px-5 py-2.5 text-base font-medium text-brand-navy transition-colors hover:bg-brand-gold-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40"
                          >
                            View Details
                          </Link>

                          {scholarship.application_url && (
                            <a
                              href={scholarship.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-center text-sm font-medium text-primary-700 underline underline-offset-4"
                            >
                              Official application
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 border-t border-gray-100 pt-5">
                        <h4 className="mb-3 font-semibold text-gray-900">
                          Eligibility assessment
                        </h4>

                        {match.reasons.length > 0 && (
                          <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                            {match.reasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        )}

                        {match.needs_verification.length > 0 && (
                          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                            <p className="font-semibold">
                              Information to verify
                            </p>
                            <ul className="mt-1 list-inside list-disc">
                              {match.needs_verification.map((requirement) => (
                                <li key={requirement}>
                                  {formatRequirement(requirement)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {match.status === 'NEEDS_VERIFICATION' && (
                          <p className="mt-4 text-sm text-gray-600">
                            Update your student profile or confirm requirements
                            with the scholarship provider before applying.
                          </p>
                        )}

                        {match.status === 'ELIGIBLE' && (
                          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">
                            Your available profile information meets the
                            structured requirements checked. Confirm all
                            official requirements before applying.
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
