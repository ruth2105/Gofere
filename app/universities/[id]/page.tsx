import UniversityDetail from './UniversityDetail';

export function generateStaticParams() {
  return [{ id: '_route-validation' }];
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UniversityDetail key={id} id={id} />;
}
