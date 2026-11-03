import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, MapPin, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { destinations } from '@/data/destinations';
import { universities } from '@/data/universities';

export function generateStaticParams() {
  return destinations.map(({ id }) => ({ id }));
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Destination Not Found</h1>
            <Link href="/study-abroad">
              <Button variant="primary">Back to Destinations</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const countryUniversities = universities.filter(u => u.country === destination.country).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/study-abroad" className="text-primary-600 hover:text-primary-700 flex items-center text-sm">
            <ArrowLeft size={16} className="mr-1" />
            Back to Destinations
          </Link>
        </div>
      </div>

      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <span className="text-6xl mr-4">{destination.flag}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Study in {destination.country}</h1>
              <p className="text-xl text-gray-200">{destination.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This guide uses local demonstration data. Verify current tuition, visa rules, and
            institution details with official sources.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Why Study in {destination.country}?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {destination.whyStudyHere.map((reason, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
                        <span className="text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Cities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {destination.popularCities.map((city, idx) => (
                      <Badge key={idx} variant="default">{city}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {countryUniversities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Universities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {countryUniversities.map((uni) => (
                        <div key={uni.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{uni.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{uni.city}</p>
                          <p className="text-sm text-gray-700">{uni.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                        <DollarSign size={16} className="mr-2" />
                        Average Tuition
                      </p>
                      <p className="text-gray-600">{destination.averageTuition}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                        <DollarSign size={16} className="mr-2" />
                        Living Cost
                      </p>
                      <p className="text-gray-600">{destination.livingCost}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                        <Calendar size={16} className="mr-2" />
                        Intake Seasons
                      </p>
                      <p className="text-gray-600">{destination.intakeSeasons.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                        <MapPin size={16} className="mr-2" />
                        Language
                      </p>
                      <p className="text-gray-600">{destination.language}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Student Visa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{destination.studentVisaInfo}</p>
                    <Link href="/contact" className="block mt-4">
                      <Button variant="primary" className="w-full">Get Visa Guidance</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
