import OpportunityDetail from './OpportunityDetail';

export function generateStaticParams() {
  return [{ slug: '_route-validation' }];
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OpportunityDetail key={slug} slug={slug} />;
}
