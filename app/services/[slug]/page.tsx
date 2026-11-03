import { notFound } from 'next/navigation';
import { services } from '@/data/services';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

const serviceSlugs: Record<string, string> = {
  counseling: 'service-1',
  applications: 'service-4',
  visa: 'service-5',
};

export function generateStaticParams() {
  return Object.keys(serviceSlugs).map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const serviceId = serviceSlugs[slug];
  const service = services.find((item) => item.id === serviceId);

  if (!service) notFound();

  return (
    <PublicPageShell title={service.title} description={service.description}>
      <article className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <p className="font-medium text-primary-800">
          {service.isProvidedByGofer
            ? 'Listed as a Gofer Exam service; confirm current availability'
            : 'Referral information; provider services are not provided by Gofer Exam'}
        </p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Support may include</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
          {service.features.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
        <p className="mt-6 text-sm text-gray-600">
          Confirm service availability and fees directly with Gofer Exam. Outcomes are not guaranteed.
        </p>
      </article>
    </PublicPageShell>
  );
}
