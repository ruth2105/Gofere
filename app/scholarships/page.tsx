'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Award, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { getScholarships } from '@/lib/api/scholarships';
import { formatDate, calculateDaysUntil } from '@/lib/utils';
import { Scholarship } from '@/types';

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    let active = true;
    getScholarships()
      .then((items) => {
        if (active) setScholarships(items);
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

  const countries = ['all', ...Array.from(new Set(scholarships.map(s => s.country)))];
  const types = ['all', ...Array.from(new Set(scholarships.map(s => s.type)))];
  const levels = ['all', ...Array.from(new Set(scholarships.map(s => s.level)))];

  // Filter scholarships
  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || scholarship.country === countryFilter;
    const matchesType = typeFilter === 'all' || scholarship.type === typeFilter;
    const matchesLevel = levelFilter === 'all' || scholarship.level === levelFilter;
    
    return matchesSearch && matchesCountry && matchesType && matchesLevel;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Award className="mx-auto mb-4 text-accent-teal" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scholarship Database
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Discover scholarships from around the world to fund your education
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white shadow-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search scholarships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              options={countries.map(c => ({ value: c, label: c === 'all' ? 'All Countries' : c }))}
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={types.map(t => ({ value: t, label: t === 'all' ? 'All Types' : t + ' Scholarship' }))}
            />
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              options={levels.map(l => ({ value: l, label: l === 'all' ? 'All Levels' : l }))}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {loading ? 'Loading scholarships…' : `Showing ${filteredScholarships.length} of ${scholarships.length} scholarships`}
          </div>
        </div>
      </section>

      {/* Scholarships Grid */}
      <section className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadError ? (
            <div className="text-center py-12" role="alert">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Scholarships could not be loaded</h3>
              <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
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
          ) : loading ? (
            <p className="text-center py-12 text-gray-600" role="status">Loading scholarships…</p>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No scholarships published yet</h3>
              <p className="text-gray-600">Please check back later for current opportunities.</p>
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No scholarships found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScholarships.map((scholarship) => {
                const daysLeft = mounted ? calculateDaysUntil(scholarship.deadline) : 0;
                const isUrgent = daysLeft > 0 && daysLeft <= 30;
                
                return (
                  <Card key={scholarship.id} hover className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={scholarship.type === 'Full' ? 'success' : 'info'}>
                          {scholarship.type} Scholarship
                        </Badge>
                        {scholarship.featured && (
                          <Badge variant="warning" className="ml-2">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                      <CardDescription>{scholarship.provider}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-2 text-primary-600 flex-shrink-0" />
                          {scholarship.country}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Coverage:</p>
                          <p className="text-sm text-gray-600">{scholarship.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Level:</p>
                          <p className="text-sm text-gray-600">{scholarship.level}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Deadline:</p>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {formatDate(scholarship.deadline)}
                            </p>
                          </div>
                          {mounted && daysLeft > 0 && (
                            <Badge variant={isUrgent ? 'danger' : 'warning'} className="mt-1">
                              {daysLeft} days left
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/scholarships/${scholarship.id}`} className="flex-1">
                        <Button variant="primary" className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <a 
                        href={scholarship.applicationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink size={16} />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Need Help with Scholarship Applications?
          </h2>
          <p className="text-lg text-gray-200 mb-6">
            Our expert consultants can guide you through the application process and help you craft winning essays
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Contact Us About a Consultation
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
