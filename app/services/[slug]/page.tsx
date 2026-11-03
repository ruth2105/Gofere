import ServiceDetail from './ServiceDetail';

export function generateStaticParams() {
  return [{ slug: '_route-validation' }];
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServiceDetail key={slug} slug={slug} />;
}
