'use client';

import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  api,
  ConsultationApiRecord,
  ConsultantDirectoryApiRecord,
  PaginatedResponse,
} from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

const CONSULTATION_TYPES: ConsultationApiRecord['type'][] = ['VIDEO', 'PHONE', 'CHAT', 'IN_PERSON'];

function todayForDateInput(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatStatus(value: string): string {
  return value.replaceAll('_', ' ').toLocaleLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export default function StudentConsultationsPage() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<ConsultantDirectoryApiRecord[]>([]);
  const [bookings, setBookings] = useState<PaginatedResponse<ConsultationApiRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [today, setToday] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [consultant, setConsultant] = useState('');
  const [type, setType] = useState<ConsultationApiRecord['type']>('VIDEO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [studentNotes, setStudentNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const localToday = todayForDateInput();
    setToday(localToday);
    setScheduledDate((current) => current || localToday);
    api.auth.getCurrentUser()
      .then(async (user) => {
        if (!active) return;
        if (user.role !== 'STUDENT') {
          router.replace(user.role === 'CONSULTANT' ? '/consultant' : '/admin');
          return;
        }
        const [consultantOptions, bookingPage] = await Promise.all([
          api.consultations.consultants(),
          api.consultations.list({ page }),
        ]);
        if (!active) return;
        setConsultants(consultantOptions);
        setBookings(bookingPage);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
          return;
        }
        setLoadError(getApiErrorMessage(error, 'Consultations could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey, router]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setFormError('');
    try {
      await api.consultations.create({
        consultant,
        type,
        title: title.trim(),
        description: description.trim(),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_minutes: duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        student_notes: studentNotes.trim(),
      });
      setTitle('');
      setDescription('');
      setScheduledTime('');
      setStudentNotes('');
      setPage(1);
      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error, 'Your consultation request could not be sent.'));
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (booking: ConsultationApiRecord) => {
    setBusyId(booking.id);
    setActionErrors((current) => ({ ...current, [booking.id]: '' }));
    try {
      const updated = await api.consultations.cancel(booking.id);
      setBookings((current) => current && ({
        ...current,
        results: current.results.map((item) => item.id === booking.id ? updated : item),
      }));
    } catch (error: unknown) {
      setActionErrors((current) => ({
        ...current,
        [booking.id]: getApiErrorMessage(error, 'This consultation could not be cancelled.'),
      }));
    } finally {
      setBusyId('');
    }
  };

  const handleFeedback = async (booking: ConsultationApiRecord) => {
    setBusyId(booking.id);
    setActionErrors((current) => ({ ...current, [booking.id]: '' }));
    try {
      const updated = await api.consultations.feedback(
        booking.id,
        ratings[booking.id] || 5,
        feedback[booking.id] || ''
      );
      setBookings((current) => current && ({
        ...current,
        results: current.results.map((item) => item.id === booking.id ? updated : item),
      }));
    } catch (error: unknown) {
      setActionErrors((current) => ({
        ...current,
        [booking.id]: getApiErrorMessage(error, 'Your feedback could not be saved.'),
      }));
    } finally {
      setBusyId('');
    }
  };

  let content;
  if (loading) {
    content = <p className="py-16 text-center text-gray-600" role="status">Loading consultation workspace…</p>;
  } else if (loadError) {
    content = (
      <div className="py-16 text-center" role="alert">
        <h1 className="text-2xl font-bold text-gray-900">Consultations unavailable</h1>
        <p className="mt-2 text-gray-600">{loadError}</p>
        <Button className="mt-5" onClick={() => {
          setLoading(true);
          setLoadError('');
          setReloadKey((key) => key + 1);
        }}>Try Again</Button>
      </div>
    );
  } else {
    content = (
      <>
        <header className="mb-8">
          <Link href="/student" className="text-sm font-medium text-primary-700 hover:underline">Student Portal</Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Consultations</h1>
          <p className="mt-2 text-gray-600">Request a session with a verified consultant. Requests remain pending until the consultant confirms.</p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Request a consultation</CardTitle>
            <CardDescription>Choose a time in your local time zone. Availability is confirmed manually, not live calendar availability.</CardDescription>
          </CardHeader>
          <CardContent>
            {consultants.length === 0 ? (
              <p className="rounded-lg bg-amber-50 p-4 text-amber-900">There are no verified consultants available to book right now.</p>
            ) : (
              <form onSubmit={handleCreate} className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="consultant" className="mb-1.5 block text-sm font-medium text-gray-700">Verified consultant</label>
                  <select id="consultant" required value={consultant} onChange={(event) => setConsultant(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                    <option value="">Choose a consultant</option>
                    {consultants.map((option) => (
                      <option key={option.consultant_id} value={option.consultant_id}>
                        {option.name || 'Consultant'}{option.job_title ? ` · ${option.job_title}` : ''}{option.consultation_rate !== '0.00' ? ` · Rate ${option.consultation_rate}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label="Session title" required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Scholarship application planning" />
                <div>
                  <label htmlFor="consultation-type" className="mb-1.5 block text-sm font-medium text-gray-700">Meeting type</label>
                  <select id="consultation-type" value={type} onChange={(event) => setType(event.target.value as ConsultationApiRecord['type'])} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                    {CONSULTATION_TYPES.map((option) => <option key={option} value={option}>{formatStatus(option)}</option>)}
                  </select>
                </div>
                <Input label="Requested date" required type="date" min={today} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
                <Input label="Requested start time" required type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
                <div>
                  <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-gray-700">Duration</label>
                  <select id="duration" value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                    {[30, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                  </select>
                </div>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">What would you like to discuss? (optional)</span>
                  <textarea rows={3} value={studentNotes} onChange={(event) => setStudentNotes(event.target.value)} maxLength={5000} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Additional session details (optional)</span>
                  <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600" />
                </label>
                {formError && <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800" role="alert">{formError}</p>}
                <div className="sm:col-span-2">
                  <Button type="submit" isLoading={creating}>Send Request</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <section aria-labelledby="bookings-heading">
          <h2 id="bookings-heading" className="mb-4 text-xl font-semibold text-gray-900">Your consultation requests</h2>
          {!bookings?.count ? (
            <p className="rounded-lg bg-white p-8 text-center text-gray-600">You have not requested a consultation yet.</p>
          ) : (
            <>
              <div className="space-y-4">
                {bookings.results.map((booking) => (
                  <Card as="article" key={booking.id}>
                    <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{booking.title}</CardTitle>
                        <CardDescription>With {booking.consultant_name || 'your consultant'} · {formatDate(booking.scheduled_date)} at {booking.scheduled_time} ({booking.timezone}) · {booking.duration_minutes} minutes</CardDescription>
                      </div>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800">{formatStatus(booking.status)}</span>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-700">
                      {booking.description && <p>{booking.description}</p>}
                      {booking.student_notes && <p><span className="font-semibold">Your notes:</span> {booking.student_notes}</p>}
                      {booking.meeting_url && <p><span className="font-semibold">Meeting link:</span> <a className="text-primary-700 underline" href={booking.meeting_url} target="_blank" rel="noreferrer">Join session</a></p>}
                      {booking.meeting_id && <p><span className="font-semibold">Meeting ID:</span> {booking.meeting_id}</p>}
                      {booking.meeting_password && <p><span className="font-semibold">Meeting password:</span> {booking.meeting_password}</p>}
                      {booking.status === 'COMPLETED' && booking.student_rating == null && (
                        <div className="grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
                          <div>
                            <label htmlFor={`rating-${booking.id}`} className="mb-1.5 block font-medium">Rate this session</label>
                            <select id={`rating-${booking.id}`} value={ratings[booking.id] ?? 5} onChange={(event) => setRatings((current) => ({ ...current, [booking.id]: Number(event.target.value) }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900">
                              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                            </select>
                          </div>
                          <Input label="Feedback (optional)" value={feedback[booking.id] ?? ''} onChange={(event) => setFeedback((current) => ({ ...current, [booking.id]: event.target.value }))} maxLength={5000} />
                          <Button isLoading={busyId === booking.id} onClick={() => handleFeedback(booking)}>Submit Feedback</Button>
                        </div>
                      )}
                      {booking.student_rating != null && <p>Thank you for rating this session {booking.student_rating}/5.</p>}
                      {actionErrors[booking.id] && <p className="text-red-700" role="alert">{actionErrors[booking.id]}</p>}
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <Button variant="outline" isLoading={busyId === booking.id} onClick={() => handleCancel(booking)}>Cancel Request</Button>
                      )}
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
        </section>
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
