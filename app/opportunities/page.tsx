'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ExternalLink, MapPin } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  api,
  CountryApiRecord,
  OpportunityApiRecord,
  PaginatedResponse,
} from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';

const CATEGORY_OPTIONS: Array<{
  value: OpportunityApiRecord['category'];
  label: string;
}> = [
  { value: 'INTERNSHIP', label: 'Internships' },
  { value: 'FELLOWSHIP', label: 'Fellowships' },
  { value: 'EXCHANGE', label: 'Exchange programs' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'COMPETITION', label: 'Competitions' },
  { value: 'GRANT', label: 'Grants' },
  { value: 'OTHER', label: 'Other opportunities' },
];

type OpportunityFilters = {
  search: string;
  country: string;
  category: OpportunityApiRecord['category'] | '';
};

function formatLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .toLocaleLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
}

function formatDeadline(value: string | null): string {
  if (!value) return 'No deadline listed';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Deadline not available';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export default function OpportunitiesPage() {
  const [results, setResults] = useState<PaginatedResponse<OpportunityApiRecord> | null>(null);
  const [countries, setCountries] = useState<CountryApiRecord[]>([]);
  const [countryError, setCountryError] = useState('');
  const [filters, setFilters] = useState<OpportunityFilters>({
    search: '',
    country: '',
    category: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<OpportunityFilters['category']>('');
  const [page, setPage] = useState(1);
  const [requestKey, setRequestKey] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    api.countries.list()
      .then((records) => {
        if (active) setCountries(records);
      })
      .catch((error: unknown) => {
        if (active) {
          setCountryError(getApiErrorMessage(error, 'Country suggestions could not be loaded.'));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api.opportunities.list({
      page,
      search: filters.search || undefined,
      country: filters.country || undefined,
      category: filters.category || undefined,
    })
      .then((response) => {
        if (active) setResults(response);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, 'Opportunities could not be loaded.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, page, requestKey, retryKey]);

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({
      search: searchInput.trim(),
      country: countryInput.trim(),
      category: categoryInput,
    });
    setPage(1);
    setLoading(true);
    setErrorMessage('');
    setRequestKey((key) => key + 1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setCountryInput('');
    setCategoryInput('');
    setFilters({ search: '', country: '', category: '' });
    setPage(1);
    setLoading(true);
    setErrorMessage('');
    setRequestKey((key) => key + 1);
  };

  const retry = () => {
    setLoading(true);
    setErrorMessage('');
    setRetryKey((key) => key + 1);
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    setLoading(true);
    setErrorMessage('');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50">
        <section className="bg-primary-900 py-14 text-white sm:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-gold">
              Learn. Prepare. Apply. Achieve.
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Opportunities
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-200">
              Explore published internships, fellowships, exchange programs, grants, and more.
              Listings are reviewed before they are made public.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 bg-white py-6" aria-label="Opportunity filters">
          <form
            onSubmit={submitFilters}
            className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:items-end lg:px-8"
          >
            <Input
              label="Search opportunities"
              type="search"
              placeholder="Title, organization, or keyword"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <div className="lg:col-span-1">
              <label htmlFor="opportunity-country" className="mb-1.5 block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                id="opportunity-country"
                list="opportunity-countries"
                value={countryInput}
                onChange={(event) => setCountryInput(event.target.value)}
                placeholder="Any country"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-brand-gold/20"
              />
              <datalist id="opportunity-countries">
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.flag_emoji} {country.code}
                  </option>
                ))}
              </datalist>
              {countryError && (
                <p className="mt-1 text-sm text-red-700" role="status">
                  {countryError}
                </p>
              )}
            </div>
            <Select
              label="Category"
              value={categoryInput}
              onChange={(event) => setCategoryInput(event.target.value as OpportunityFilters['category'])}
              options={[
                { value: '', label: 'All categories' },
                ...CATEGORY_OPTIONS,
              ]}
            />
            <Button type="submit" className="w-full lg:w-auto">
              Apply filters
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
              Clear
            </Button>
          </form>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <FeedbackState
              variant="loading"
              title="Loading opportunities"
              description="Fetching current published listings."
            />
          ) : errorMessage ? (
            <div>
              <FeedbackState
                variant="error"
                title="Opportunities could not be loaded"
                description={errorMessage}
              />
              <Button className="mt-4" onClick={retry}>Try again</Button>
            </div>
          ) : !results?.count ? (
            <FeedbackState
              variant="empty"
              title="No opportunities found"
              description="There are no published listings matching your filters. Try a different search or check back later."
            />
          ) : (
            <>
              <p className="mb-5 text-sm text-gray-600" aria-live="polite">
                Showing {results.results.length} of {results.count} published opportunities
              </p>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.results.map((opportunity) => (
                  <Card key={opportunity.id} as="article" className="flex h-full flex-col">
                    <CardHeader>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant="info">{formatLabel(opportunity.category)}</Badge>
                        <Badge variant={opportunity.status === 'CLOSED' ? 'default' : 'success'}>
                          {formatLabel(opportunity.status)}
                        </Badge>
                        {opportunity.is_featured && <Badge variant="warning">Featured</Badge>}
                      </div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {opportunity.organization}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-700">
                        {opportunity.short_description || opportunity.description}
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        {opportunity.country && (
                          <p className="flex items-center gap-2">
                            <MapPin size={16} aria-hidden="true" />
                            {opportunity.country}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <CalendarDays size={16} aria-hidden="true" />
                          Deadline: {formatDeadline(opportunity.application_deadline)}
                        </p>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                        <Link
                          href={`/opportunities/${encodeURIComponent(opportunity.slug)}`}
                          className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
                        >
                          View details <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        {(opportunity.application_url || opportunity.official_website) && (
                          <a
                            href={opportunity.application_url || opportunity.official_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-gray-700 underline decoration-gray-400 underline-offset-2 hover:text-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
                          >
                            Official site <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {(results.next || results.previous) && (
                <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Opportunity pages">
                  <Button
                    variant="outline"
                    disabled={!results.previous || loading}
                    onClick={() => changePage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page {page}</span>
                  <Button
                    variant="outline"
                    disabled={!results.next || loading}
                    onClick={() => changePage(page + 1)}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
