import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  dot = false,
  interactive = false,
  onClick,
  className 
}) => {
  const isInteractive = interactive || !!onClick;
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-brand-gold/20 text-primary-900 border-brand-gold/40',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-primary-50 text-primary-800 border-primary-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
  };
  
  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-brand-gold',
    danger: 'bg-red-500',
    info: 'bg-primary-600',
    primary: 'bg-primary-600',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  const Component = isInteractive ? 'button' : 'span';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border transition-all duration-200',
        variants[variant],
        sizes[size],
        isInteractive && [
          'cursor-pointer select-none',
          'hover:opacity-80 hover:shadow-sm',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40',
          'active:scale-95'
        ],
        className
      )}
      type={isInteractive ? 'button' : undefined}
    >
      {dot && (
        <span 
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  );
};
