'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api, ConsultantApplicationApiRecord, PaginatedResponse, UserApiRecord } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

const APPLICATION_STATUSES: ConsultantApplicationApiRecord['status'][] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
  'WAITLISTED',
  'WITHDRAWN',
];

function formatStatus(status: ConsultantApplicationApiRecord['status']): string {
  return status.replaceAll('_', ' ').toLocaleLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not set'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserApiRecord | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [authRetryKey, setAuthRetryKey] = useState(0);
  const [forbidden, setForbidden] = useState(false);
  const [applications, setApplications] = useState<PaginatedResponse<ConsultantApplicationApiRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ConsultantApplicationApiRecord['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then((profile) => {
        if (!active) return;
        if (profile.role !== 'CONSULTANT') {
          setForbidden(true);
          return;
        }
        setUser(profile);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
        } else {
          setAuthError(true);
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authRetryKey, router]);

  useEffect(() => {
    if (!user || user.role !== 'CONSULTANT') return;
    let active = true;
    setLoading(true);
    setErrorMessage('');

    api.consultant.assignedApplications({
      page,
      search: search || undefined,
      status: status || undefined,
    })
      .then((result) => {
        if (active) setApplications(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, 'Assigned applications could not be loaded.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey, search, status, user]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } finally {
      router.replace('/student/login');
    }
  };

  const content = authLoading ? (
    <p className="py-16 text-center text-gray-600" role="status">Checking your session…</p>
  ) : authError ? (
    <div className="py-16 text-center" role="alert">
      <h1 className="text-2xl font-bold text-gray-900">Your account could not be loaded</h1>
      <p className="mt-2 text-gray-600">Please check your connection and try again.</p>
      <Button
        className="mt-5"
        onClick={() => {
          setAuthError(false);
          setAuthLoading(true);
          setAuthRetryKey((key) => key + 1);
        }}
      >
        Try Again
      </Button>
    </div>
  ) : forbidden ? (
    <div className="py-16 text-center" role="alert">
      <h1 className="text-2xl font-bold text-gray-900">Consultant access required</h1>
      <p className="mt-2 text-gray-600">This workspace is available only to consultant accounts.</p>
    </div>
  ) : (
    <>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultant Workspace</h1>
          <p className="mt-2 text-gray-600">Applications assigned to {user?.full_name || user?.email}.</p>
        </div>
        <Button variant="outline" isLoading={loggingOut} onClick={handleLogout}>Sign Out</Button>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assigned applications</CardTitle>
          <CardDescription>
            This list includes only applications assigned to your account. Student notes and internal admin notes are not shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-[1fr_15rem_auto_auto] md:items-end">
            <Input
              label="Search assigned students"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Name or email"
            />
            <div>
              <label htmlFor="application-status" className="mb-1.5 block text-sm font-medium text-gray-700">
                Application status
              </label>
              <select
                id="application-status"
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value as ConsultantApplicationApiRecord['status'] | '');
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">All statuses</option>
                {APPLICATION_STATUSES.map((applicationStatus) => (
                  <option key={applicationStatus} value={applicationStatus}>{formatStatus(applicationStatus)}</option>
                ))}
              </select>
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setStatus('');
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {errorMessage ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          <p>{errorMessage}</p>
          <Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <p className="py-12 text-center text-gray-600" role="status">Loading assigned applications…</p>
      ) : applications?.count === 0 ? (
        <p className="rounded-lg bg-white p-8 text-center text-gray-600">
          No applications are currently assigned to your account.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-600" aria-live="polite">
            {applications?.count ?? 0} assigned application{applications?.count === 1 ? '' : 's'}
          </p>
          <div className="space-y-4">
            {applications?.results.map((application) => (
              <Card as="article" key={application.id}>
                <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{application.target_name}</CardTitle>
                    <CardDescription>
                      {application.application_type === 'UNIVERSITY' ? 'University application' : 'Scholarship application'}
                      {application.program_name ? ` · ${application.program_name}` : ''}
                      {application.degree_level ? ` · ${application.degree_level}` : ''}
                    </CardDescription>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800">
                    {formatStatus(application.status)}
                  </span>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="font-semibold">Student:</span> {application.student_name || 'Name not provided'}</p>
                  <p><span className="font-semibold">Email:</span> {application.student_email}</p>
                  <p><span className="font-semibold">Deadline:</span> {formatDate(application.deadline_date)}</p>
                  <p><span className="font-semibold">Last updated:</span> {formatDate(application.updated_at)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={!applications?.previous}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <Button
              variant="outline"
              disabled={!applications?.next}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">{content}</div>
      </main>
      <Footer />
    </div>
  );
}
