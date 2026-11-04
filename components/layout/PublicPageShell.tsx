import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';

export function PublicPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <header className="bg-primary-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-gray-200">{description}</p>
        </div>
      </header>
      <main className="flex-1 py-12 bg-brand-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
