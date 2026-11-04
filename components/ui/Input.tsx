import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText,
    success = false,
    leftIcon,
    rightIcon,
    showCharCount = false,
    maxLength,
    disabled,
    required,
    id: providedId,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const [charCount, setCharCount] = React.useState(0);
    
    const hasError = !!error;
    const hasSuccess = success && !hasError;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id}
            className={cn(
              'block text-sm font-medium mb-1.5 transition-colors',
              hasError ? 'text-red-700' : 'text-gray-700',
              disabled && 'text-gray-400 cursor-not-allowed'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              helperText && helperId
            )}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg transition-all duration-200',
              'text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-4',
              leftIcon && 'pl-10',
              (rightIcon || hasError || hasSuccess) && 'pr-10',
              hasError && [
                'border-red-300 bg-red-50/50',
                'focus:border-red-500 focus:ring-red-100',
                'hover:border-red-400'
              ],
              hasSuccess && [
                'border-green-300 bg-green-50/50',
                'focus:border-green-500 focus:ring-green-100',
                'hover:border-green-400'
              ],
              !hasError && !hasSuccess && [
                'border-gray-300 bg-white',
                'focus:border-primary-600 focus:ring-brand-gold/25',
                'hover:border-gray-400'
              ],
              disabled && [
                'bg-gray-100 text-gray-500 cursor-not-allowed',
                'hover:border-gray-300'
              ],
              className
            )}
            onChange={handleChange}
            {...props}
          />
          
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
              <AlertCircle size={18} aria-hidden="true" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
              <CheckCircle2 size={18} aria-hidden="true" />
            </div>
          )}
          
          {!hasError && !hasSuccess && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        <div className="mt-1.5 flex items-start justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p 
                id={errorId}
                className="text-sm text-red-600 flex items-start gap-1"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
            
            {!error && helperText && (
              <p 
                id={helperId}
                className={cn(
                  'text-sm flex items-start gap-1',
                  disabled ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                <Info size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{helperText}</span>
              </p>
            )}
          </div>
          
          {showCharCount && maxLength && (
            <p 
              className={cn(
                'text-xs font-medium tabular-nums',
                charCount > maxLength ? 'text-red-600' : 'text-gray-500'
              )}
              aria-live="polite"
              aria-atomic="true"
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
