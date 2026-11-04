import React from 'react';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackVariant = 'loading' | 'empty' | 'error';

interface FeedbackStateProps {
  variant: FeedbackVariant;
  title: string;
  description?: string;
  className?: string;
}

const variantStyles: Record<FeedbackVariant, { container: string; icon: string }> = {
  loading: {
    container: 'border-gray-200 bg-white',
    icon: 'text-primary-700',
  },
  empty: {
    container: 'border-gray-200 bg-white',
    icon: 'text-primary-700',
  },
  error: {
    container: 'border-red-200 bg-red-50',
    icon: 'text-red-700',
  },
};

export const FeedbackState: React.FC<FeedbackStateProps> = ({
  variant,
  title,
  description,
  className
}) => {
  const Icon = variant === 'loading'
    ? Loader2
    : variant === 'error'
      ? AlertCircle
      : Info;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        variantStyles[variant].container,
        className
      )}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-busy={variant === 'loading'}
    >
      <Icon
        className={cn('mt-0.5 shrink-0', variantStyles[variant].icon, variant === 'loading' && 'animate-spin')}
        size={18}
        aria-hidden="true"
      />
      <div>
        <p className="font-semibold text-primary-900">{title}</p>
        {description && <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>}
      </div>
    </div>
  );
};
