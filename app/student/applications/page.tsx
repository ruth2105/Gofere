'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, FileText } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api, ApplicationApiRecord, PaginatedResponse, ScholarshipApiRecord, UniversityApiRecord } from '@/lib/api/client';
import { getScholarships, getUniversities } from '@/lib/api/catalogues';
import { getApiErrorMessage } from '@/lib/api/errors';

type ApplicationType = 'UNIVERSITY' | 'SCHOLARSHIP';

const PAGE_SIZE = 20;

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [applications, setApplications] = useState<PaginatedResponse<ApplicationApiRecord> | null>(null);
  const [universities, setUniversities] = useState<UniversityApiRecord[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipApiRecord[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [workflowError, setWorkflowError] = useState('');
  const [page, setPage] = useState(1);
  const [applicationType, setApplicationType] = useState<ApplicationType>('UNIVERSITY');
  const [targetId, setTargetId] = useState('');
  const [programName, setProgramName] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then((profile) => {
        if (active) setUser(profile);
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
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'STUDENT') return;

    let active = true;

    Promise.all([
      api.applications.list({ page }),
      getUniversities(),
      getScholarships(),
    ])
      .then(([applicationPage, universityOptions, scholarshipOptions]) => {
        if (!active) return;
        setWorkflowError('');
        setApplications(applicationPage);
        setUniversities(universityOptions);
        setScholarships(scholarshipOptions);
      })
      .catch((error: unknown) => {
        if (active) {
          setWorkflowError(getApiErrorMessage(error, 'Your applications could not be loaded.'));
        }
      })
      .finally(() => {
        if (active) setWorkflowLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, user]);

  const targets = applicationType === 'UNIVERSITY' ? universities : scholarships;
  const selectedTarget = targets.find((target) => target.id === targetId);
  const hasTargets = targets.length > 0;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setCreating(true);

    try {
      const application = await api.applications.create({
        application_type: applicationType,
        university: applicationType === 'UNIVERSITY' ? targetId : null,
        scholarship: applicationType === 'SCHOLARSHIP' ? targetId : null,
        program_name: programName,
        degree_level: degreeLevel,
        deadline_date: deadlineDate || null,
        application_url: applicationUrl,
        notes,
      });
      setApplications((current) => current
        ? { ...current, count: current.count + 1, results: [application, ...current.results].slice(0, PAGE_SIZE) }
        : current);
      setPage(1);
      setTargetId('');
      setProgramName('');
      setDegreeLevel('');
      setDeadlineDate('');
      setApplicationUrl('');
      setNotes('');
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error, 'The application could not be saved.'));
    } finally {
      setCreating(false);
    }
  };

  const updateApplication = async (
    application: ApplicationApiRecord,
    action: 'submit' | 'withdraw',
  ) => {
    const confirmation = action === 'submit'
      ? 'Mark this application as submitted? This only updates your tracker; it does not submit anything to the institution.'
      : 'Mark this application as withdrawn?';
    if (!window.confirm(confirmation)) return;

    setUpdatingApplicationId(application.id);
    setWorkflowError('');
    try {
      const updated = action === 'submit'
        ? await api.applications.submit(application.id)
        : await api.applications.withdraw(application.id);
      setApplications((current) => current
        ? {
          ...current,
          results: current.results.map((item) => item.id === updated.id ? updated : item),
        }
        : current);
    } catch (error: unknown) {
      setWorkflowError(getApiErrorMessage(error, 'The application status could not be updated.'));
    } finally {
      setUpdatingApplicationId('');
    }
  };

  const changePage = (nextPage: number) => {
    setWorkflowLoading(true);
    setWorkflowError('');
    setPage(nextPage);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <p className="flex-1 flex items-center justify-center text-gray-600" role="status">
          Checking your session…
        </p>
        <Footer />
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center" role="alert">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">Your account could not be loaded</h1>
            <p className="mb-5 text-gray-600">Please check your connection and try again.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user.role !== 'STUDENT') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Student account required</h1>
          <p className="mt-3 text-gray-600">Application tracking is available to student accounts only.</p>
          <Link href="/student" className="mt-5 inline-block font-medium text-primary-700 hover:text-primary-800">
            Return to the portal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <header>
            <Link href="/student" className="text-sm font-medium text-primary-700 hover:text-primary-800">
              ← Student Portal
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Application Tracker</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Keep a private record of applications linked to published Gofer Exam catalogues.
              You submit applications directly to the university or scholarship provider.
            </p>
          </header>

          {workflowError && (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
              {workflowError}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Start an application record</CardTitle>
                <CardDescription>
                  Add an application you are preparing or already submitted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label htmlFor="application-type" className="mb-1 block text-sm font-medium text-gray-700">
                      Application type
                    </label>
                    <select
                      id="application-type"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      value={applicationType}
                      onChange={(event) => {
                        setApplicationType(event.target.value as ApplicationType);
                        setTargetId('');
                      }}
                    >
                      <option value="UNIVERSITY">University</option>
                      <option value="SCHOLARSHIP">Scholarship</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="application-target" className="mb-1 block text-sm font-medium text-gray-700">
                      {applicationType === 'UNIVERSITY' ? 'University' : 'Published scholarship'}
                    </label>
                    <select
                      id="application-target"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-gray-100"
                      value={targetId}
                      onChange={(event) => setTargetId(event.target.value)}
                      required
                      disabled={!hasTargets || workflowLoading}
                    >
                      <option value="">Select an option</option>
                      {targets.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name} — {target.country}
                        </option>
                      ))}
                    </select>
                    {!hasTargets && !workflowLoading && (
                      <p className="mt-1 text-sm text-gray-600">
                        No {applicationType === 'UNIVERSITY' ? 'universities' : 'published scholarships'} are available yet.
                      </p>
                    )}
                  </div>

                  {applicationType === 'UNIVERSITY' && (
                    <>
                      <Input
                        label="Program"
                        value={programName}
                        onChange={(event) => setProgramName(event.target.value)}
                      />
                      <Input
                        label="Degree level"
                        value={degreeLevel}
                        onChange={(event) => setDegreeLevel(event.target.value)}
                      />
                    </>
                  )}

                  {selectedTarget && applicationType === 'SCHOLARSHIP' && (
                    <p className="text-sm text-gray-600">
                      Provider: {scholarships.find((scholarship) => scholarship.id === targetId)?.provider}
                    </p>
                  )}

                  <Input
                    label="Your application deadline (optional)"
                    type="date"
                    value={deadlineDate}
                    onChange={(event) => setDeadlineDate(event.target.value)}
                  />
                  <Input
                    label="Provider application URL (optional)"
                    type="url"
                    placeholder="https://"
                    value={applicationUrl}
                    onChange={(event) => setApplicationUrl(event.target.value)}
                  />
                  <div>
                    <label htmlFor="application-notes" className="mb-1 block text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <textarea
                      id="application-notes"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>

                  {formError && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
                      {formError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={creating}
                    disabled={!targetId || workflowLoading || !hasTargets}
                  >
                    Save Draft
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your applications</CardTitle>
                <CardDescription>
                  Only you can access the records in your tracker.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflowLoading ? (
                  <p className="py-8 text-center text-gray-600" role="status">Loading your applications…</p>
                ) : applications?.results.length ? (
                  <div className="space-y-4">
                    {applications.results.map((application) => {
                      const title = application.university_name || application.scholarship_name || 'Application';
                      return (
                        <article key={application.id} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h2 className="font-semibold text-gray-900">{title}</h2>
                              <p className="mt-1 text-sm text-gray-600">
                                {application.application_type === 'UNIVERSITY' ? 'University' : 'Scholarship'}
                                {application.program_name ? ` · ${application.program_name}` : ''}
                                {application.degree_level ? ` · ${application.degree_level}` : ''}
                              </p>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                              {application.status.replaceAll('_', ' ')}
                            </span>
                          </div>
                          {application.deadline_date && (
                            <p className="mt-3 text-sm text-gray-600">
                              Deadline: {new Date(`${application.deadline_date}T00:00:00`).toLocaleDateString()}
                            </p>
                          )}
                          {application.submission_date && (
                            <p className="mt-1 text-sm text-gray-600">
                              Marked submitted: {new Date(application.submission_date).toLocaleDateString()}
                            </p>
                          )}
                          {application.notes && (
                            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{application.notes}</p>
                          )}
                          {application.application_url && (
                            <a
                              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
                              href={application.application_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open provider application <ExternalLink size={14} aria-hidden="true" />
                            </a>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {application.status === 'DRAFT' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                isLoading={updatingApplicationId === application.id}
                                disabled={Boolean(updatingApplicationId)}
                                onClick={() => updateApplication(application, 'submit')}
                              >
                                Mark as submitted
                              </Button>
                            )}
                            {application.status === 'SUBMITTED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                isLoading={updatingApplicationId === application.id}
                                disabled={Boolean(updatingApplicationId)}
                                onClick={() => updateApplication(application, 'withdraw')}
                              >
                                Mark as withdrawn
                              </Button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => changePage(page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {page} of {Math.max(1, Math.ceil(applications.count / PAGE_SIZE))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!applications.next}
                        onClick={() => changePage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <FileText className="mx-auto mb-3 text-gray-400" size={40} aria-hidden="true" />
                    <h2 className="font-semibold text-gray-900">No applications tracked yet</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Create a draft record to keep your deadlines and provider links together.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
