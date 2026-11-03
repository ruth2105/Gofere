import DestinationDetail from './DestinationDetail';

export function generateStaticParams() {
  return [{ id: '_route-validation' }];
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DestinationDetail key={id} id={id} />;
}
