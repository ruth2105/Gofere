'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { api, NotificationApiRecord, PaginatedResponse } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ').toLocaleLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function isInternalUrl(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<PaginatedResponse<NotificationApiRecord> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then(async () => {
        const [notificationPage, count] = await Promise.all([
          api.notifications.list({ page, unread: unreadOnly ? true : undefined }),
          api.notifications.unreadCount(),
        ]);
        if (!active) return;
        setNotifications(notificationPage);
        setUnreadCount(count);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
          return;
        }
        setErrorMessage(getApiErrorMessage(error, 'Notifications could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, retryKey, router, unreadOnly]);

  const markRead = async (notification: NotificationApiRecord) => {
    setBusyId(notification.id);
    setErrorMessage('');
    try {
      const updated = await api.notifications.markRead(notification.id);
      setNotifications((current) => current && ({
        ...current,
        results: current.results.map((item) => item.id === notification.id ? updated : item),
      }));
      if (!notification.is_read) setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'This notification could not be marked as read.'));
    } finally {
      setBusyId('');
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setErrorMessage('');
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      if (notifications) {
        setNotifications({
          ...notifications,
          results: notifications.results.map((item) => ({ ...item, is_read: true })),
        });
      }
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Notifications could not be marked as read.'));
    } finally {
      setMarkingAll(false);
    }
  };

  let content;
  if (loading) {
    content = <p className="py-16 text-center text-gray-600" role="status">Loading notifications…</p>;
  } else if (errorMessage && !notifications) {
    content = (
      <div className="py-16 text-center" role="alert">
        <h1 className="text-2xl font-bold text-gray-900">Notifications unavailable</h1>
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
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}.</p>
          </div>
          <Button variant="outline" isLoading={markingAll} disabled={unreadCount === 0} onClick={markAllRead}>Mark All Read</Button>
        </header>

        {errorMessage && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800" role="alert">{errorMessage}</p>}
        <div className="mb-5 max-w-xs">
          <label htmlFor="notification-filter" className="mb-1.5 block text-sm font-medium text-gray-700">Show</label>
          <select id="notification-filter" value={unreadOnly ? 'unread' : 'all'} onChange={(event) => {
            setPage(1);
            setLoading(true);
            setUnreadOnly(event.target.value === 'unread');
          }} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
            <option value="all">All notifications</option>
            <option value="unread">Unread only</option>
          </select>
        </div>

        {!notifications?.count ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">
              {unreadOnly ? 'No unread notifications.' : 'You have no notifications yet.'}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {notifications.results.map((notification) => (
                <Card as="article" key={notification.id} className={notification.is_read ? 'opacity-80' : 'border-l-4 border-l-brand-gold'}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle>{notification.title}</CardTitle>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatLabel(notification.type)} · {formatLabel(notification.priority)}
                      </span>
                    </div>
                    <CardDescription>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.created_at))}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{notification.message}</p>
                    <div className="flex flex-wrap gap-3">
                      {!notification.is_read && <Button variant="outline" isLoading={busyId === notification.id} onClick={() => markRead(notification)}>Mark Read</Button>}
                      {notification.action_text && isInternalUrl(notification.action_url) && (
                        <Link href={notification.action_url}><Button variant="secondary">{notification.action_text}</Button></Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" disabled={!notifications.previous} onClick={() => { setPage((current) => Math.max(1, current - 1)); setLoading(true); }}>Previous</Button>
              <span className="text-sm text-gray-600">Page {page}</span>
              <Button variant="outline" disabled={!notifications.next} onClick={() => { setPage((current) => current + 1); setLoading(true); }}>Next</Button>
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
        <div className="mx-auto max-w-4xl">{content}</div>
      </main>
      <Footer />
    </div>
  );
}
