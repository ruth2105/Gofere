'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import axios from 'axios';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

type VerificationState = 'loading' | 'verified' | 'already_verified' | 'expired' | 'invalid' | 'error';

export function VerifyEmailFlow({ token }: { token: string }) {
  const [state, setState] = useState<VerificationState>('loading');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;

    let active = true;
    api.auth.verifyEmail(token)
      .then((result) => {
        if (!active) return;
        setState(result.status);
        window.history.replaceState(window.history.state, '', '/student/verify-email');
      })
      .catch((error: unknown) => {
        if (!active) return;
        const data = axios.isAxiosError(error) ? error.response?.data : null;
        if (data && typeof data === 'object' && 'status' in data) {
          if (data.status === 'expired') {
            setState('expired');
          } else if (data.status === 'invalid') {
            setState('invalid');
          } else {
            setState('error');
            setVerificationError(getApiErrorMessage(error, 'We could not verify this link right now.'));
          }
          window.history.replaceState(window.history.state, '', '/student/verify-email');
        } else {
          setState('error');
          setVerificationError(getApiErrorMessage(error, 'We could not verify this link right now.'));
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, token]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = window.setTimeout(
      () => setSecondsRemaining((remaining) => Math.max(remaining - 1, 0)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResending(true);
    setResendMessage('');
    setResendError('');
    try {
      const result = await api.auth.resendVerificationEmail(email);
      setResendMessage(result.message);
      setSecondsRemaining(result.cooldown_seconds);
    } catch (error: unknown) {
      setResendError(getApiErrorMessage(error, 'The verification email could not be requested.'));
    } finally {
      setResending(false);
    }
  };

  const visibleState = token ? state : 'invalid';
  const isSuccessful = visibleState === 'verified' || visibleState === 'already_verified';
  const title = {
    loading: 'Verifying your email',
    verified: 'Email verified',
    already_verified: 'Already verified',
    expired: 'Verification link expired',
    invalid: 'Unable to verify email',
    error: 'Could not verify email',
  }[visibleState];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="py-20 bg-gray-50">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader className="text-center">
                {visibleState === 'loading'
                  ? <MailCheck className="mx-auto mb-3 animate-pulse text-primary-600" size={48} />
                  : isSuccessful
                    ? <CheckCircle2 className="mx-auto mb-3 text-green-600" size={48} />
                    : <XCircle className="mx-auto mb-3 text-red-600" size={48} />}
                <CardTitle as="h1" className="text-2xl">{title}</CardTitle>
                <CardDescription>
                  {visibleState === 'loading' && 'Please wait while we securely validate your link.'}
                  {visibleState === 'verified' && 'Your student account is ready. You can now sign in.'}
                  {visibleState === 'already_verified' && 'This email address is already verified. You can sign in.'}
                  {visibleState === 'expired' && 'This link is no longer valid. Request a new verification email to continue.'}
                  {visibleState === 'invalid' && 'This link is invalid or has already been used. Request a new email if your account still needs verification.'}
                  {visibleState === 'error' && verificationError}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visibleState === 'loading' ? (
                  <p className="text-center text-sm text-gray-600" role="status">Checking verification link…</p>
                ) : isSuccessful ? (
                  <Link href="/student/login" className="block">
                    <Button className="w-full">Continue to sign in</Button>
                  </Link>
                ) : visibleState === 'error' ? (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setState('loading');
                        setVerificationError('');
                        setAttempt((value) => value + 1);
                      }}
                    >
                      Try verification again
                    </Button>
                    <Link href="/student/login" className="block text-center text-sm text-primary-600 hover:text-primary-700">
                      Back to sign in
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-4">
                    <Input
                      type="email"
                      label="Account email address"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                    {resendMessage && (
                      <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900" role="status">
                        {resendMessage}
                      </p>
                    )}
                    {resendError && (
                      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
                        {resendError}
                      </p>
                    )}
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      isLoading={resending}
                      disabled={resending || secondsRemaining > 0}
                    >
                      {secondsRemaining > 0
                        ? `Request another email in ${secondsRemaining}s`
                        : resending ? 'Requesting…' : 'Resend verification email'}
                    </Button>
                    <Link href="/student/login" className="block text-center text-sm text-primary-600 hover:text-primary-700">
                      Back to sign in
                    </Link>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
