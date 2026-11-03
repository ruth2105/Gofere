import ScholarshipDetail from './ScholarshipDetail';
import { scholarships } from '@/data/scholarships';

export function generateStaticParams() {
  return scholarships.map(({ id }) => ({ id }));
}

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScholarshipDetail id={id} />;
}
