import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const spinnerSize = sizes[size];

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2
        size={spinnerSize}
        className="animate-spin text-primary-600"
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      {content}
    </div>
  );
};

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 20, className }) => {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-primary-600', className)}
      aria-hidden="true"
    />
  );
};
