'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LogIn } from 'lucide-react';
import { api } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!resendAvailableAt) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) setResendAvailableAt(0);
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [resendAvailableAt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const { user } = await api.auth.login({ email, password });
      router.replace(
        user.role === 'CONSULTANT'
          ? '/consultant'
          : user.role === 'ADMIN' || user.role === 'SUPERADMIN'
            ? '/admin'
            : '/student'
      );
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Sign in failed. Please check your details and try again.');
      setErrorMessage(message);
      setVerificationRequired(message.toLowerCase().includes('verify your email'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || resending || secondsRemaining > 0) return;
    setResending(true);
    setResendMessage('');
    setResendError('');
    try {
      const result = await api.auth.resendVerificationEmail(email);
      setResendMessage(result.message);
      setResendAvailableAt(Date.now() + result.cooldown_seconds * 1000);
    } catch (error: unknown) {
      setResendError(getApiErrorMessage(error, 'The verification email could not be requested.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" tabIndex={-1} className="flex-1">
      <section className="py-20 bg-gray-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <LogIn className="mx-auto mb-3 text-primary-600" size={48} />
              <CardTitle as="h1" className="text-2xl">Student Sign In</CardTitle>
              <CardDescription>
                Access your Gofer Exam student portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <div className="flex justify-end text-sm">
                  <Link href="/student/forgot-password" className="text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </Link>
                </div>

                {errorMessage && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
                    {errorMessage}
                  </p>
                )}

                {verificationRequired && (
                  <div className="space-y-3 rounded-lg bg-amber-50 p-4">
                    <p className="text-sm text-amber-900">
                      Verify your email before signing in. You can request another verification message below.
                    </p>
                    {resendMessage && (
                      <p className="text-sm text-green-800" role="status">{resendMessage}</p>
                    )}
                    {resendError && (
                      <p className="text-sm text-red-800" role="alert">{resendError}</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleResendVerification}
                      isLoading={resending}
                      disabled={!email || resending || secondsRemaining > 0}
                    >
                      {secondsRemaining > 0
                        ? `Request another email in ${secondsRemaining}s`
                        : resending ? 'Requesting…' : 'Resend verification email'}
                    </Button>
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
                  {submitting ? 'Signing In…' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/student/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Create one now
                  </Link>
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Your session is protected with secure HttpOnly cookies. If you need a password
                  reset, contact Gofer Exam support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
