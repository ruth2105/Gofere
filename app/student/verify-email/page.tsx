import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailFlow } from './VerifyEmailFlow';

export const metadata: Metadata = {
  title: 'Verify your email | GOFER EXAM',
  robots: { index: false, follow: false },
};

async function VerifyEmailPageContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return <VerifyEmailFlow token={token ?? ''} />;
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center" role="status">
        Loading verification link…
      </main>
    }>
      <VerifyEmailPageContent searchParams={searchParams} />
    </Suspense>
  );
}
