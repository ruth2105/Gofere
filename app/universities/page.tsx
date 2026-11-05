'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GraduationCap, Search } from 'lucide-react';
import { getUniversities } from '@/lib/api/catalogues';
import { UniversityApiRecord } from '@/lib/api/client';

function formatTuition(value: string | null): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Not provided';
  return `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)} / year`;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UniversityApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getUniversities()
      .then((items) => {
        if (active) setUniversities(items);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const filteredUniversities = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return universities;
    return universities.filter((university) =>
      `${university.name} ${university.country} ${university.city} ${university.type}`
        .toLocaleLowerCase()
        .includes(search)
    );
  }, [universities, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-primary-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <GraduationCap className="mx-auto mb-4 text-brand-gold" size={48} aria-hidden="true" />
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">University Directory</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-200">
            Browse university records maintained by Gofer Exam.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <label htmlFor="university-search" className="mb-2 block text-sm font-medium text-gray-700">
            Search universities
          </label>
          <div className="relative mb-8 max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="university-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="University, city, country, or type"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {loading ? (
            <p className="py-12 text-center text-gray-600" role="status">Loading universities…</p>
          ) : loadError ? (
            <div className="py-12 text-center" role="alert">
              <p className="mb-4 text-gray-700">Universities could not be loaded. Please try again.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setLoading(true);
                  setLoadError(false);
                  setRetryCount((count) => count + 1);
                }}
              >
                Try Again
              </Button>
            </div>
          ) : filteredUniversities.length === 0 ? (
            <p className="py-12 text-center text-gray-600">
              {universities.length === 0
                ? 'No universities have been published yet.'
                : 'No universities match your search.'}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredUniversities.map((university) => (
                <Card key={university.id} hover>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle>{university.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {university.city}, {university.country}
                        </CardDescription>
                      </div>
                      {university.is_partner && (
                        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-900">
                          Partner
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Institution type</dt>
                        <dd className="font-medium text-gray-900">
                          {university.type.replaceAll('_', ' ').toLocaleLowerCase()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">World ranking</dt>
                        <dd className="font-medium text-gray-900">
                          {university.world_ranking ? `#${university.world_ranking}` : 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Annual tuition</dt>
                        <dd className="font-medium text-gray-900">{formatTuition(university.tuition_fee)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">International students</dt>
                        <dd className="font-medium text-gray-900">
                          {university.international_students.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                    {university.description && (
                      <p className="line-clamp-3 text-sm text-gray-700">{university.description}</p>
                    )}
                    <Link
                      href={`/universities/${university.slug}`}
                      className="inline-flex font-medium text-primary-700 hover:underline"
                    >
                      View details <span aria-hidden="true" className="ml-1">→</span>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
