import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium 
      transition-all duration-200 rounded-lg 
      focus:outline-none focus-visible:ring-4 
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-95 select-none
    `;
    
    const variants = {
      primary: `
        bg-primary-600 text-white 
        hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5
        focus-visible:ring-primary-200 
        active:bg-primary-800 active:shadow-md active:translate-y-0
        shadow-md
      `,
      secondary: `
        bg-accent-teal text-white 
        hover:bg-accent-teal/90 hover:shadow-lg hover:-translate-y-0.5
        focus-visible:ring-teal-200
        active:bg-accent-teal active:shadow-md active:translate-y-0
        shadow-md
      `,
      outline: `
        border-2 border-primary-600 text-primary-600 bg-transparent
        hover:bg-primary-50 hover:border-primary-700 hover:shadow-md
        focus-visible:ring-primary-200
        active:bg-primary-100
      `,
      ghost: `
        text-primary-600 bg-transparent
        hover:bg-primary-50 hover:text-primary-700
        focus-visible:ring-primary-200
        active:bg-primary-100
      `,
      danger: `
        bg-red-600 text-white 
        hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5
        focus-visible:ring-red-200
        active:bg-red-800 active:shadow-md active:translate-y-0
        shadow-md
      `
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-5 py-2.5 text-base min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]'
    };
    
    const isDisabled = disabled || isLoading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <Loader2 
            className="animate-spin" 
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
