'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api, ConsultationApiRecord, PaginatedResponse } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

function formatStatus(value: string): string {
  return value.replaceAll('_', ' ').toLocaleLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export default function ConsultantConsultationsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<PaginatedResponse<ConsultationApiRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ConsultationApiRecord['status'] | ''>('');
  const [busyId, setBusyId] = useState('');
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [consultantNotes, setConsultantNotes] = useState<Record<string, string>>({});
  const [actionItems, setActionItems] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then(async (user) => {
        if (!active) return;
        if (user.role !== 'CONSULTANT') {
          router.replace(user.role === 'STUDENT' ? '/student' : '/admin');
          return;
        }
        const result = await api.consultations.assigned({
          page,
          status: statusFilter || undefined,
        });
        if (active) setBookings(result);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
          return;
        }
        setErrorMessage(getApiErrorMessage(error, 'Assigned consultations could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, retryKey, router, statusFilter]);

  const performAction = async (
    booking: ConsultationApiRecord,
    action: 'confirm' | 'cancel' | 'complete'
  ) => {
    setBusyId(booking.id);
    setActionErrors((current) => ({ ...current, [booking.id]: '' }));
    try {
      const updated = await api.consultations.consultantAction(booking.id, action, {
        meeting_url: meetingLinks[booking.id] ?? '',
        consultant_notes: consultantNotes[booking.id] ?? '',
        action_items: (actionItems[booking.id] ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setBookings((current) => current && ({
        ...current,
        results: current.results.map((item) => item.id === booking.id ? updated : item),
      }));
    } catch (error: unknown) {
      setActionErrors((current) => ({
        ...current,
        [booking.id]: getApiErrorMessage(error, 'The consultation could not be updated.'),
      }));
    } finally {
      setBusyId('');
    }
  };

  let content;
  if (loading) {
    content = <p className="py-16 text-center text-gray-600" role="status">Loading assigned consultations…</p>;
  } else if (errorMessage) {
    content = (
      <div className="py-16 text-center" role="alert">
        <h1 className="text-2xl font-bold text-gray-900">Consultations unavailable</h1>
        <p className="mt-2 text-gray-600">{errorMessage}</p>
        <Button className="mt-5" onClick={() => {
          setLoading(true);
          setErrorMessage('');
          setRetryKey((key) => key + 1);
        }}>Try Again</Button>
      </div>
    );
  } else {
    content = (
      <>
        <header className="mb-8">
          <Link href="/consultant" className="text-sm font-medium text-primary-700 hover:underline">Consultant Workspace</Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Consultation Requests</h1>
          <p className="mt-2 text-gray-600">Confirm, cancel, or record outcomes for consultations assigned to you.</p>
        </header>

        <div className="mb-6 max-w-xs">
          <label htmlFor="consultation-status" className="mb-1.5 block text-sm font-medium text-gray-700">Filter by status</label>
          <select
            id="consultation-status"
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setLoading(true);
              setStatusFilter(event.target.value as ConsultationApiRecord['status'] | '');
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="">All statuses</option>
            {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((value) => <option key={value} value={value}>{formatStatus(value)}</option>)}
          </select>
        </div>

        {!bookings?.count ? (
          <p className="rounded-lg bg-white p-8 text-center text-gray-600">No consultations are assigned to your account.</p>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.results.map((booking) => (
                <Card as="article" key={booking.id}>
                  <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{booking.title}</CardTitle>
                      <CardDescription>{booking.student_name || 'Student'} · {formatDate(booking.scheduled_date)} at {booking.scheduled_time} ({booking.timezone}) · {booking.duration_minutes} minutes</CardDescription>
                    </div>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800">{formatStatus(booking.status)}</span>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-gray-700">
                    <p><span className="font-semibold">Student email:</span> {booking.student_email}</p>
                    <p><span className="font-semibold">Meeting type:</span> {formatStatus(booking.type)}</p>
                    {booking.student_notes && <p><span className="font-semibold">Student notes:</span> {booking.student_notes}</p>}
                    {booking.meeting_url && <p><span className="font-semibold">Meeting URL:</span> <a className="text-primary-700 underline" href={booking.meeting_url} target="_blank" rel="noreferrer">{booking.meeting_url}</a></p>}
                    {booking.consultant_notes && <p><span className="font-semibold">Your notes:</span> {booking.consultant_notes}</p>}
                    {booking.action_items?.length ? <div><p className="font-semibold">Action items</p><ul className="list-disc pl-5">{booking.action_items.map((item, index) => <li key={`${booking.id}-${index}`}>{item}</li>)}</ul></div> : null}
                    {booking.status === 'PENDING' && (
                      <div className="grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <Input label="Meeting URL (optional)" type="url" value={meetingLinks[booking.id] ?? ''} onChange={(event) => setMeetingLinks((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="https://…" />
                        <Button isLoading={busyId === booking.id} onClick={() => performAction(booking, 'confirm')}>Confirm Request</Button>
                      </div>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <label className="block">
                          <span className="mb-1.5 block font-medium">Consultant notes (private to staff)</span>
                          <textarea rows={2} value={consultantNotes[booking.id] ?? ''} onChange={(event) => setConsultantNotes((current) => ({ ...current, [booking.id]: event.target.value }))} maxLength={10000} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600" />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block font-medium">Action items (one per line)</span>
                          <textarea rows={2} value={actionItems[booking.id] ?? ''} onChange={(event) => setActionItems((current) => ({ ...current, [booking.id]: event.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600" />
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <Button isLoading={busyId === booking.id} onClick={() => performAction(booking, 'complete')}>Record Completed Session</Button>
                          <Button variant="outline" isLoading={busyId === booking.id} onClick={() => performAction(booking, 'cancel')}>Cancel</Button>
                        </div>
                      </div>
                    )}
                    {actionErrors[booking.id] && <p className="text-red-700" role="alert">{actionErrors[booking.id]}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" disabled={!bookings.previous} onClick={() => { setPage((current) => Math.max(1, current - 1)); setLoading(true); }}>Previous</Button>
              <span className="text-sm text-gray-600">Page {page}</span>
              <Button variant="outline" disabled={!bookings.next} onClick={() => { setPage((current) => current + 1); setLoading(true); }}>Next</Button>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">{content}</div>
      </main>
      <Footer />
    </div>
  );
}
