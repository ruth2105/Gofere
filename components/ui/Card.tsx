import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false,
  interactive = false,
  onClick,
  as: Component = 'div'
}) => {
  const isInteractive = hover || interactive || onClick;
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl shadow-md p-6 transition-all duration-300',
        'border border-gray-100',
        isInteractive && [
          'cursor-pointer',
          'hover:shadow-xl hover:shadow-primary-100/50 hover:-translate-y-1 hover:border-primary-200',
          'focus-within:ring-4 focus-within:ring-primary-100 focus-within:border-primary-300',
          'active:scale-[0.99] active:shadow-lg'
        ],
        className
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  actions?: React.ReactNode;
}> = ({ 
  children, 
  className,
  actions
}) => {
  return (
    <div className={cn('mb-4', actions && 'flex items-start justify-between', className)}>
      <div className="flex-1">{children}</div>
      {actions && <div className="ml-4">{actions}</div>}
    </div>
  );
};

export const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}> = ({ 
  children, 
  className,
  as: Component = 'h3'
}) => {
  return (
    <Component className={cn('text-xl font-bold text-gray-900', className)}>
      {children}
    </Component>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return <p className={cn('text-sm text-gray-600', className)}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return <div className={cn(className)}>{children}</div>;
};

export const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}> = ({ 
  children, 
  className,
  justify = 'start'
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };
  
  return (
    <div className={cn('mt-4 flex items-center gap-2', justifyClasses[justify], className)}>
      {children}
    </div>
  );
};
