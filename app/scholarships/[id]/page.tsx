import ScholarshipDetail from './ScholarshipDetail';

export function generateStaticParams() {
  // Cache Components requires a build-time sample; real scholarship slugs resolve on demand.
  return [{ id: '_route-validation' }];
}

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScholarshipDetail id={id} />;
}
