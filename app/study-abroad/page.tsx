import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { destinations } from '@/data/destinations';

export default function StudyAbroadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Globe className="mx-auto mb-4 text-accent-teal" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Study Abroad Destinations</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Explore top countries for international students and find your perfect study destination
            </p>
          </div>
        </div>
      </section>

      <section className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This page uses local demonstration data. Tuition estimates, institution counts, and
            destination details are not independently verified; confirm current information with
            official sources.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destinations.map((destination) => (
              <Card key={destination.id} hover>
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-5xl">{destination.flag}</span>
                    <Badge variant="info">{destination.topUniversities}+ Universities</Badge>
                  </div>
                  <CardTitle className="text-2xl">{destination.country}</CardTitle>
                  <CardDescription>{destination.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center">
                        <DollarSign size={16} className="mr-1" />
                        Tuition
                      </p>
                      <p className="text-sm text-gray-600">{destination.averageTuition}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin size={16} className="mr-1" />
                        Living Cost
                      </p>
                      <p className="text-sm text-gray-600">{destination.livingCost}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Why Study Here?</p>
                    <ul className="space-y-1">
                      {destination.whyStudyHere.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={`/study-abroad/${destination.id}`}>
                    <Button variant="primary" className="w-full">
                      Learn More <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
