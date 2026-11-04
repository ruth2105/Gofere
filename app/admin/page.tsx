'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminOverviewApiRecord, api, UserApiRecord } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

const APPLICATION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
  'WAITLISTED',
  'WITHDRAWN',
] as const;

const CONSULTATION_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ').toLocaleLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function MetricCard({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <Card as="article">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="mt-2 text-3xl">{value.toLocaleString()}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm font-medium text-gray-700">{label}</CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserApiRecord | null>(null);
  const [overview, setOverview] = useState<AdminOverviewApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then(async (profile) => {
        if (!active) return;
        if (profile.role !== 'ADMIN' && profile.role !== 'SUPERADMIN') {
          setForbidden(true);
          setLoading(false);
          return;
        }
        setUser(profile);
        const data = await api.admin.overview();
        if (active) setOverview(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
          return;
        }
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setForbidden(true);
          return;
        }
        setErrorMessage(getApiErrorMessage(error, 'The admin overview could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } finally {
      router.replace('/student/login');
    }
  };

  const content = loading ? (
    <p className="py-16 text-center text-gray-600" role="status">Loading administrator overview…</p>
  ) : forbidden ? (
    <div className="py-16 text-center" role="alert">
      <h1 className="text-2xl font-bold text-gray-900">Administrator access required</h1>
      <p className="mt-2 text-gray-600">This overview is available only to administrator accounts.</p>
    </div>
  ) : errorMessage ? (
    <div className="py-16 text-center" role="alert">
      <h1 className="text-2xl font-bold text-gray-900">Overview unavailable</h1>
      <p className="mt-2 text-gray-700">{errorMessage}</p>
      <Button
        className="mt-5"
        onClick={() => {
          setErrorMessage('');
          setLoading(true);
          setRetryKey((key) => key + 1);
        }}
      >
        Try Again
      </Button>
    </div>
  ) : overview ? (
    <>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="mt-2 text-gray-600">Platform totals for {user?.full_name || user?.email}.</p>
        </div>
        <Button variant="outline" isLoading={loggingOut} onClick={handleLogout}>Sign Out</Button>
      </header>

      <section aria-labelledby="accounts-heading" className="mb-8">
        <h2 id="accounts-heading" className="mb-4 text-xl font-semibold text-gray-900">Accounts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Students" value={overview.users.students} description="Registered student accounts" />
          <MetricCard label="Consultants" value={overview.users.consultants} description="Consultant accounts" />
          <MetricCard label="Administrators" value={overview.users.administrators} description="Administrator accounts" />
        </div>
      </section>

      <section aria-labelledby="catalogues-heading" className="mb-8">
        <h2 id="catalogues-heading" className="mb-4 text-xl font-semibold text-gray-900">Published catalogues</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Scholarships" value={overview.catalogues.published_scholarships} description="Published scholarship records" />
          <MetricCard label="Universities" value={overview.catalogues.universities} description="University records" />
          <MetricCard label="Destinations" value={overview.catalogues.destinations} description="Destination records" />
          <MetricCard label="Services" value={overview.catalogues.active_services} description="Active service listings" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="Workflow totals">
        <Card as="section">
          <CardHeader>
            <CardTitle as="h2">Applications</CardTitle>
            <CardDescription>{overview.applications.total.toLocaleString()} total applications</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100">
              {APPLICATION_STATUSES.map((status) => (
                <div key={status} className="flex justify-between gap-4 py-2">
                  <dt className="text-gray-700">{formatLabel(status)}</dt>
                  <dd className="font-semibold text-gray-900">{(overview.applications.by_status[status] ?? 0).toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card as="section">
          <CardHeader>
            <CardTitle as="h2">Consultations</CardTitle>
            <CardDescription>{overview.consultations.total.toLocaleString()} total consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100">
              {CONSULTATION_STATUSES.map((status) => (
                <div key={status} className="flex justify-between gap-4 py-2">
                  <dt className="text-gray-700">{formatLabel(status)}</dt>
                  <dd className="font-semibold text-gray-900">{(overview.consultations.by_status[status] ?? 0).toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>
    </>
  ) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">{content}</div>
      </main>
      <Footer />
    </div>
  );
}
