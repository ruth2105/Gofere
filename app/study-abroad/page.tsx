'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { getDestinations } from '@/lib/api/catalogues';
import { DestinationApiRecord } from '@/lib/api/client';
import { FeedbackState } from '@/components/ui/FeedbackState';

function formatAnnualCost(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Not provided';
  return `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)} / year`;
}

export default function StudyAbroadPage() {
  const [destinations, setDestinations] = useState<DestinationApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getDestinations()
      .then((items) => {
        if (active) setDestinations(items);
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

  const filteredDestinations = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return destinations;
    return destinations.filter((destination) =>
      `${destination.name} ${destination.description} ${destination.primary_language}`
        .toLocaleLowerCase()
        .includes(search)
    );
  }, [destinations, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1}>

      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Globe className="mx-auto mb-4 text-brand-gold" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Study Abroad Destinations</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Explore destinations with information maintained by Gofer Exam.
            </p>
          </div>
        </div>
      </section>

      <section className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Costs and study or visa requirements can change. Confirm current details with official
            education and immigration sources before making decisions.
          </p>

          <div className="mb-8 max-w-xl">
            <label htmlFor="destination-search" className="mb-2 block text-sm font-medium text-gray-700">
              Search destinations
            </label>
            <input
              id="destination-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Country, language, or keyword"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {loading ? (
            <p className="py-12 text-center text-gray-600" role="status">Loading destinations…</p>
          ) : loadError ? (
            <div className="py-12 text-center" role="alert">
              <p className="mb-4 text-gray-700">Destinations could not be loaded. Please try again.</p>
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
          ) : filteredDestinations.length === 0 ? (
            <FeedbackState
              variant="empty"
              title={destinations.length === 0 ? 'No destinations are published yet' : 'No destinations match your search'}
              description={destinations.length === 0
                ? 'The destination catalogue is connected, but no current records are available. Check back later for updated listings.'
                : 'Try a different country, language, or keyword.'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredDestinations.map((destination) => (
                <Card key={destination.id} hover>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-5xl" aria-hidden="true">{destination.flag_emoji || '🌍'}</span>
                      <Badge variant="info">
                        {destination.total_universities} listed universities
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{destination.name}</CardTitle>
                    <CardDescription>{destination.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 flex items-center">
                          <DollarSign size={16} className="mr-1" />
                          Average tuition
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatAnnualCost(destination.average_tuition_fee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 flex items-center">
                          <MapPin size={16} className="mr-1" />
                          Main language
                        </p>
                        <p className="text-sm text-gray-600">
                          {destination.primary_language || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {destination.highlights && destination.highlights.length > 0 && (
                      <ul className="space-y-1">
                        {destination.highlights.slice(0, 3).map((highlight) => (
                          <li key={highlight} className="text-sm text-gray-600">
                            <span aria-hidden="true" className="mr-2 text-green-600">✓</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/study-abroad/${destination.slug}`}>
                      <Button variant="primary" className="w-full">
                        Learn More <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
