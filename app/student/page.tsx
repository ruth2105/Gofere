'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Award, Bell, FileText, UserCircle, UserPlus } from 'lucide-react';
import { api, UserApiRecord } from '@/lib/api/client';

export default function StudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then((profile) => {
        if (!active) return;
        if (profile.role === 'CONSULTANT') {
          router.replace('/consultant');
          return;
        }
        if (profile.role === 'ADMIN' || profile.role === 'SUPERADMIN') {
          router.replace('/admin');
          return;
        }
        setUser(profile);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
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
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } finally {
      router.replace('/student/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center">
          <p className="text-gray-600" role="status">Checking your session…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center px-4">
          <div className="text-center" role="alert">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">Your account could not be loaded</h1>
            <p className="mb-5 text-gray-600">Please check your connection and try again.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" tabIndex={-1} className="flex-1 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <UserCircle className="mx-auto mb-4 text-primary-600" size={64} />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Portal</h1>
            <p className="text-lg text-gray-600">
              Signed in as {user.email}
            </p>
            <p className="mt-2 text-sm text-gray-500">Account type: {user.role.toLocaleLowerCase()}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              isLoading={loggingOut}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="text-center">
              <CardHeader>
                <UserCircle className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Account Profile</CardTitle>
                <CardDescription>
                  {user.full_name || user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>{user.email}</p>
                {user.phone_number && <p>{user.phone_number}</p>}
                <Link href="/student/profile" className="inline-block pt-2 font-semibold text-primary-700 hover:underline">
                  Edit student profile
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <UserPlus className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Explore Scholarships</CardTitle>
                <CardDescription>
                  Search the current published opportunities catalogue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/scholarships">
                  <Button variant="secondary" className="w-full">
                    Browse Scholarships
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Bell className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Notifications</CardTitle>
                <CardDescription>See consultation and application updates.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/notifications">
                  <Button variant="secondary" className="w-full">View Notifications</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Scholarships Matched for You</CardTitle>
                <CardDescription>
                  Check scholarship eligibility against your nationality,
                  education level, GPA, and academic interests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/student/scholarships"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-brand-gold px-5 py-2.5 text-base font-medium text-brand-navy transition-colors hover:bg-brand-gold-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40"
                >
                  View My Matches
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Application Tracker</CardTitle>
                <CardDescription>
                  Keep a private record of your university and scholarship applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/student/applications">
                  <Button variant="secondary" className="w-full">
                    Track Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <UserPlus className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Consultant Support</CardTitle>
                <CardDescription>Request a session with a verified consultant and track confirmations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/student/consultations">
                  <Button variant="secondary" className="w-full">Manage Consultations</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Other Student Workflows in Progress
            </h2>
            <p className="text-center text-sm text-amber-800">
              Document uploads and consultation booking are not currently available.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📄 Upload Documents</h3>
                <p className="text-sm text-gray-600">Store transcripts, test scores, and recommendation letters securely</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🎯 Exam Preparation</h3>
                <p className="text-sm text-gray-600">Access IELTS, TOEFL, and Duolingo practice materials</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">💬 Book Consultations</h3>
                <p className="text-sm text-gray-600">Schedule meetings with expert consultants</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
