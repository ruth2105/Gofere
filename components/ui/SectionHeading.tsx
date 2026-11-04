import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  eyebrow,
  centered = false,
  className
}) => (
  <div className={cn('mb-8 max-w-3xl', centered && 'mx-auto text-center', className)}>
    {eyebrow && (
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
        {eyebrow}
      </p>
    )}
    <h2 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
      {title}
    </h2>
    {description && (
      <p className="mt-3 text-base leading-relaxed text-gray-600 md:text-lg">
        {description}
      </p>
    )}
  </div>
);
