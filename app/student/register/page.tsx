'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { MailCheck, UserPlus } from 'lucide-react';
import { api } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import axios from 'axios';

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [deliveryNotice, setDeliveryNotice] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
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

  const handleResend = async () => {
    if (!registrationEmail || resending || secondsRemaining > 0) return;
    setResending(true);
    setResendMessage('');
    setDeliveryError('');
    try {
      const result = await api.auth.resendVerificationEmail(registrationEmail);
      setResendMessage(result.message);
      setResendAvailableAt(Date.now() + result.cooldown_seconds * 1000);
    } catch (error: unknown) {
      setDeliveryError(getApiErrorMessage(error, 'The verification email could not be requested.'));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setErrorMessage('Enter both your first name and last name.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.auth.register({
        email: formData.email,
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' '),
        phone_number: formData.phone,
        password: formData.password,
        password2: formData.confirmPassword,
      });
      setRegistrationEmail(result.email);
      setDeliveryNotice(result.message);
      setResendAvailableAt(Date.now() + result.resend_cooldown_seconds * 1000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 503) {
        setRegistrationEmail(formData.email.trim());
        setDeliveryError(getApiErrorMessage(
          error,
          'Your account was created, but the verification email was not accepted. Request another email below.'
        ));
      } else {
        setErrorMessage(getApiErrorMessage(error, 'Account creation failed. Please try again.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" tabIndex={-1} className="flex-1">
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              {registrationEmail
                ? <MailCheck className="mx-auto mb-3 text-primary-600" size={48} />
                : <UserPlus className="mx-auto mb-3 text-primary-600" size={48} />}
              <CardTitle as="h1" className="text-2xl">
                {registrationEmail ? 'Check your email' : 'Create Your Account'}
              </CardTitle>
              <CardDescription>
                {registrationEmail
                  ? `A verification link is needed before you can sign in. Check ${registrationEmail}.`
                  : 'Join Gofer Exam and start your study abroad journey'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationEmail ? (
                <div className="space-y-4">
                  <p className="rounded-lg bg-green-50 p-4 text-sm text-green-900" role="status">
                    {deliveryNotice}
                  </p>
                  <p className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900" role="status">
                    Your account is not active for sign-in until you verify your email. The link is time-limited and can only be used once.
                  </p>
                  {deliveryError && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
                      {deliveryError}
                    </p>
                  )}
                  {resendMessage && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">
                      {resendMessage}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    isLoading={resending}
                    disabled={resending || secondsRemaining > 0}
                  >
                    {secondsRemaining > 0
                      ? `Request another email in ${secondsRemaining}s`
                      : resending ? 'Requesting…' : 'Resend verification email'}
                  </Button>
                  <p className="text-center text-sm text-gray-600">
                    Already verified?{' '}
                    <Link href="/student/login" className="font-medium text-primary-600 hover:text-primary-700">
                      Sign in
                    </Link>
                  </p>
                </div>
              ) : (
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  placeholder="+251-911-234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <div className="flex items-start">
                  <input id="agree-to-policies" type="checkbox" className="mt-1 mr-2" required />
                  <label htmlFor="agree-to-policies" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {errorMessage && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
                    {errorMessage}
                  </p>
                )}

                <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
                  {submitting ? 'Creating Account…' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/student/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Account creation stores your name, email address, and phone number. Verify your email before signing in.
                </p>
              </div>
              </div>
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
