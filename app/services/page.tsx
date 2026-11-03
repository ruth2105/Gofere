import Link from 'next/link';
import { services } from '@/data/services';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

export default function ServicesPage() {
  return (
    <PublicPageShell
      title="Our Services"
      description="Explore the guidance and educational support available through Gofer Exam."
    >
      <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        These descriptions come from the website&apos;s local sample catalogue. Confirm each
        service&apos;s provider, availability, scope, and fees directly with Gofer Exam.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{service.title}</h2>
            <p className="mt-3 leading-6 text-gray-700">{service.description}</p>
            <p className="mt-4 text-sm font-medium text-primary-800">
              {service.isProvidedByGofer
                ? 'Listed as a Gofer Exam service; confirm current availability'
                : 'Referral information; provider services are not provided by Gofer Exam'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
              {service.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-600">
        No admission, scholarship, or visa outcome is guaranteed.
      </p>
      <Link href="/contact" className="mt-6 inline-block font-semibold text-primary-700 hover:underline">
        Contact us about services
      </Link>
    </PublicPageShell>
  );
}
