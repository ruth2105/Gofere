'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserPlus } from 'lucide-react';
import { api } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      await api.auth.register({
        email: formData.email,
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' '),
        phone_number: formData.phone,
        password: formData.password,
        password2: formData.confirmPassword,
      });
      router.replace('/student');
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Account creation failed. Please try again.'));
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
      
      <section className="flex-1 py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <UserPlus className="mx-auto mb-3 text-primary-600" size={48} />
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Join Gofer Exam and start your study abroad journey
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <input type="checkbox" className="mt-1 mr-2" required />
                  <label className="text-sm text-gray-600">
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
                  Your session is protected with secure HttpOnly cookies. Account creation stores
                  your name, email address, and phone number.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
