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
  CountryApiRecord,
  StudentProfileApiRecord,
  StudentProfileCompletionApiRecord,
} from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

const EDUCATION_LEVELS: StudentProfileApiRecord['current_education_level'][] = [
  'HIGH_SCHOOL',
  'UNDERGRADUATE',
  'GRADUATE',
  'POSTGRADUATE',
];

function labelFor(value: string): string {
  return value.replaceAll('_', ' ').toLocaleLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function parseInteger(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileApiRecord | null>(null);
  const [completion, setCompletion] = useState<StudentProfileCompletionApiRecord | null>(null);
  const [countries, setCountries] = useState<CountryApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser()
      .then(async (user) => {
        if (!active) return;
        if (user.role !== 'STUDENT') {
          router.replace(user.role === 'CONSULTANT' ? '/consultant' : '/admin');
          return;
        }
        const [studentProfile, profileCompletion, countryOptions] = await Promise.all([
          api.students.profile(),
          api.students.profileCompletion(),
          api.countries.list(),
        ]);
        if (!active) return;
        setProfile(studentProfile);
        setCompletion(profileCompletion);
        setCountries(countryOptions);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/student/login');
          return;
        }
        setLoadError(getApiErrorMessage(error, 'Your profile could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey, router]);

  const update = <K extends keyof StudentProfileApiRecord>(
    key: K,
    value: StudentProfileApiRecord[K]
  ) => {
    setProfile((current) => current ? { ...current, [key]: value } : current);
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const updatedProfile = await api.students.updateProfile({
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        nationality_country: profile.nationality_country,
        passport_number: profile.passport_number,
        address: profile.address,
        city: profile.city,
        residence_country: profile.residence_country,
        postal_code: profile.postal_code,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        emergency_contact_relationship: profile.emergency_contact_relationship,
        current_education_level: profile.current_education_level,
        school_name: profile.school_name,
        field_of_study: profile.field_of_study,
        graduation_year: profile.graduation_year,
        gpa: profile.gpa,
        target_countries: profile.target_countries,
        target_degree_level: profile.target_degree_level,
        preferred_fields: profile.preferred_fields,
        budget_range: profile.budget_range,
        english_test_type: profile.english_test_type,
        english_test_score: profile.english_test_score,
        gre_score: profile.gre_score,
        gmat_score: profile.gmat_score,
        sat_score: profile.sat_score,
      });
      setProfile(updatedProfile);
      setCompletion(await api.students.profileCompletion());
      setSaved(true);
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(error, 'Your profile could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  let content;
  if (loading) {
    content = <p className="py-16 text-center text-gray-600" role="status">Loading your profile…</p>;
  } else if (loadError) {
    content = (
      <div className="py-16 text-center" role="alert">
        <h1 className="text-2xl font-bold text-gray-900">Profile unavailable</h1>
        <p className="mt-2 text-gray-600">{loadError}</p>
        <Button
          className="mt-5"
          onClick={() => {
            setLoading(true);
            setLoadError('');
            setRetryKey((key) => key + 1);
          }}
        >
          Try Again
        </Button>
      </div>
    );
  } else if (profile) {
    content = (
      <>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/student" className="text-sm font-medium text-primary-700 hover:underline">Student Portal</Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">My Student Profile</h1>
            <p className="mt-2 text-gray-600">Keep your information current for scholarship matching and application support.</p>
          </div>
          {completion && (
            <div className="min-w-48 rounded-lg bg-white p-4 shadow-sm" aria-live="polite">
              <p className="text-sm font-medium text-gray-700">Profile completion</p>
              <p className="mt-1 text-xl font-bold text-primary-800">{Math.round(completion.percentage)}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-brand-gold" style={{ width: `${completion.percentage}%` }} />
              </div>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Private details used to personalize your account and eligibility results.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Input label="Date of birth" type="date" value={profile.date_of_birth ?? ''} onChange={(event) => update('date_of_birth', event.target.value || null)} />
              <Input label="Gender (optional)" value={profile.gender} onChange={(event) => update('gender', event.target.value)} />
              <div>
                <label htmlFor="nationality-country" className="mb-1.5 block text-sm font-medium text-gray-700">Nationality</label>
                <select id="nationality-country" value={profile.nationality_country ?? ''} onChange={(event) => update('nationality_country', event.target.value || null)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                  <option value="">Select a country</option>
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.flag_emoji} {country.name}</option>)}
                </select>
              </div>
              <Input label="Passport number (optional)" value={profile.passport_number} onChange={(event) => update('passport_number', event.target.value)} autoComplete="off" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact and residence</CardTitle>
              <CardDescription>Your residential country is separate from your nationality.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Input label="City" value={profile.city} onChange={(event) => update('city', event.target.value)} />
              <div>
                <label htmlFor="residence-country" className="mb-1.5 block text-sm font-medium text-gray-700">Country of residence</label>
                <select id="residence-country" value={profile.residence_country ?? ''} onChange={(event) => update('residence_country', event.target.value || null)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                  <option value="">Select a country</option>
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.flag_emoji} {country.name}</option>)}
                </select>
              </div>
              <Input label="Postal code" value={profile.postal_code} onChange={(event) => update('postal_code', event.target.value)} />
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Address</span>
                <textarea value={profile.address} onChange={(event) => update('address', event.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600" />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education and study goals</CardTitle>
              <CardDescription>These structured details inform personalized scholarship matches.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="education-level" className="mb-1.5 block text-sm font-medium text-gray-700">Current education level</label>
                <select id="education-level" value={profile.current_education_level} onChange={(event) => update('current_education_level', event.target.value as StudentProfileApiRecord['current_education_level'])} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                  {EDUCATION_LEVELS.map((level) => <option key={level} value={level}>{labelFor(level)}</option>)}
                </select>
              </div>
              <Input label="School or university" value={profile.school_name} onChange={(event) => update('school_name', event.target.value)} />
              <Input label="Field of study" value={profile.field_of_study} onChange={(event) => update('field_of_study', event.target.value)} />
              <Input label="Graduation year" type="number" min={1950} max={2050} value={profile.graduation_year ?? ''} onChange={(event) => update('graduation_year', parseInteger(event.target.value))} />
              <Input label="GPA (0–4 scale)" type="number" min={0} max={4} step="0.01" value={profile.gpa ?? ''} onChange={(event) => update('gpa', event.target.value || null)} />
              <Input label="Target degree level" value={profile.target_degree_level} onChange={(event) => update('target_degree_level', event.target.value)} />
              <div className="sm:col-span-2">
                <label htmlFor="target-countries" className="mb-1.5 block text-sm font-medium text-gray-700">Countries you are considering</label>
                <select id="target-countries" multiple value={profile.target_countries} onChange={(event) => update('target_countries', Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-36 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.flag_emoji} {country.name}</option>)}
                </select>
                <p className="mt-1 text-sm text-gray-500">Select multiple countries with Ctrl (Windows) or Command (Mac).</p>
              </div>
              <Input label="Preferred fields (comma-separated)" value={profile.preferred_fields.join(', ')} onChange={(event) => update('preferred_fields', event.target.value.split(',').map((field) => field.trim()).filter(Boolean))} />
              <Input label="Budget range (optional)" value={profile.budget_range} onChange={(event) => update('budget_range', event.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test scores and emergency contact</CardTitle>
              <CardDescription>Only provide information you are comfortable storing in your account.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Input label="English test (IELTS, TOEFL, DET…)" value={profile.english_test_type} onChange={(event) => update('english_test_type', event.target.value)} />
              <Input label="English test score" value={profile.english_test_score} onChange={(event) => update('english_test_score', event.target.value)} />
              <Input label="GRE score" type="number" min={0} value={profile.gre_score ?? ''} onChange={(event) => update('gre_score', parseInteger(event.target.value))} />
              <Input label="GMAT score" type="number" min={0} value={profile.gmat_score ?? ''} onChange={(event) => update('gmat_score', parseInteger(event.target.value))} />
              <Input label="SAT score" type="number" min={0} value={profile.sat_score ?? ''} onChange={(event) => update('sat_score', parseInteger(event.target.value))} />
              <Input label="Emergency contact name" value={profile.emergency_contact_name} onChange={(event) => update('emergency_contact_name', event.target.value)} />
              <Input label="Emergency contact phone" type="tel" value={profile.emergency_contact_phone} onChange={(event) => update('emergency_contact_phone', event.target.value)} />
              <Input label="Relationship" value={profile.emergency_contact_relationship} onChange={(event) => update('emergency_contact_relationship', event.target.value)} />
            </CardContent>
          </Card>

          {saveError && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{saveError}</p>}
          {saved && <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800" role="status">Your profile was saved.</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={saving}>Save Profile</Button>
            <Link href="/student"><Button type="button" variant="outline">Back to Student Portal</Button></Link>
          </div>
        </form>
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
