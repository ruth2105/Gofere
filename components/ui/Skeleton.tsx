import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'bg-gray-200',
        variants[variant],
        animations[animation],
        variant === 'text' && !height && 'h-4',
        className
      )}
      style={style}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton Card Component
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-xl shadow-md p-6 border border-gray-100', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} />
          </div>
          <Skeleton variant="circular" width={40} height={40} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton width="100%" height={12} />
          <Skeleton width="95%" height={12} />
          <Skeleton width="85%" height={12} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton width={80} height={32} className="rounded-full" />
          <Skeleton width={100} height={36} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Skeleton List Component
export const SkeletonList: React.FC<{ 
  count?: number; 
  className?: string;
}> = ({ 
  count = 3,
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton width="70%" height={16} />
              <Skeleton width="50%" height={14} />
            </div>
            <Skeleton width={80} height={32} className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton Table Component
export const SkeletonTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5,
  columns = 4,
  className 
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Table Header */}
      <div className="grid gap-4 p-4 border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} width="80%" height={16} />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="grid gap-4 p-4 border-b border-gray-100 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="90%" height={14} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Skeleton Profile Component
export const SkeletonProfile: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-xl shadow-md p-6 border border-gray-100', className)}>
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <Skeleton variant="circular" width={100} height={100} />

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton width="60%" height={28} />
            <Skeleton width="40%" height={20} />
          </div>

          <div className="space-y-2">
            <Skeleton width="100%" height={14} />
            <Skeleton width="95%" height={14} />
            <Skeleton width="80%" height={14} />
          </div>

          <div className="flex gap-2">
            <Skeleton width={100} height={36} className="rounded-lg" />
            <Skeleton width={100} height={36} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
