import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserCircle, LogIn, UserPlus } from 'lucide-react';

export default function StudentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <section className="flex-1 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <UserCircle className="mx-auto mb-4 text-primary-600" size={64} />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Portal</h1>
            <p className="text-lg text-gray-600">
              Student sign-in and registration screens are available, but account features are not yet connected to the backend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <LogIn className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  The sign-in screen is available, but authentication is not yet connected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/student/login">
                  <Button variant="primary" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <UserPlus className="mx-auto mb-3 text-primary-600" size={48} />
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  The registration form is available as a preview; it does not yet create an account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/student/register">
                  <Button variant="secondary" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Planned Account Features
            </h2>
            <p className="text-center text-sm text-amber-800">
              These workflows are not currently available in the student portal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📚 Manage Applications</h3>
                <p className="text-sm text-gray-600">Track your university and scholarship applications in one place</p>
              </div>
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
      </section>

      <Footer />
    </div>
  );
}
