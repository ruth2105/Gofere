'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Briefcase, Search } from 'lucide-react';
import { getServices } from '@/lib/api/catalogues';
import { ServiceApiRecord } from '@/lib/api/client';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getServices()
      .then((items) => {
        if (active) setServices(items);
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

  const filteredServices = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return services;
    return services.filter((service) =>
      `${service.title} ${service.short_description} ${service.description} ${service.category}`
        .toLocaleLowerCase()
        .includes(search)
    );
  }, [services, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-primary-900 to-primary-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Briefcase className="mx-auto mb-4 text-accent-teal" size={48} aria-hidden="true" />
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Our Services</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-200">
            Explore currently published support services from Gofer Exam.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <label htmlFor="service-search" className="mb-2 block text-sm font-medium text-gray-700">
            Search services
          </label>
          <div className="relative mb-8 max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Service, category, or description"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {loading ? (
            <p className="py-12 text-center text-gray-600" role="status">Loading services…</p>
          ) : loadError ? (
            <div className="py-12 text-center" role="alert">
              <p className="mb-4 text-gray-700">Services could not be loaded. Please try again.</p>
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
          ) : filteredServices.length === 0 ? (
            <p className="py-12 text-center text-gray-600">
              {services.length === 0
                ? 'No services have been published yet.'
                : 'No services match your search.'}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredServices.map((service) => (
                <Card key={service.id} hover>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {service.category.replaceAll('_', ' ').toLocaleLowerCase()}
                        </CardDescription>
                      </div>
                      {service.is_featured && (
                        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-900">
                          Featured
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-gray-700">
                      {service.short_description || service.description}
                    </p>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Price</dt>
                        <dd className="font-medium text-gray-900">
                          {service.currency} {Number(service.price).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </dd>
                      </div>
                      {service.duration && (
                        <div>
                          <dt className="text-gray-500">Duration</dt>
                          <dd className="font-medium text-gray-900">{service.duration}</dd>
                        </div>
                      )}
                    </dl>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex font-medium text-primary-700 hover:underline"
                    >
                      View details <span aria-hidden="true" className="ml-1">→</span>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="mt-8 text-sm text-gray-600">
            Confirm availability and terms before purchasing. No admission, scholarship, or visa outcome is guaranteed.
          </p>
          <Link href="/contact" className="mt-6 inline-block font-semibold text-primary-700 hover:underline">
            Contact us about services
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
