import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, ChevronDown, Info } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText,
    success = false,
    options, 
    placeholder,
    disabled,
    required,
    id: providedId,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    
    const hasError = !!error;
    const hasSuccess = success && !hasError;
    
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
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              helperText && helperId
            )}
            className={cn(
              'w-full px-4 py-2.5 pr-10 border rounded-lg transition-all duration-200',
              'text-gray-900 bg-white appearance-none cursor-pointer',
              'focus:outline-none focus:ring-4',
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
                'border-gray-300',
                'focus:border-primary-500 focus:ring-primary-100',
                'hover:border-gray-400'
              ],
              disabled && [
                'bg-gray-100 text-gray-500 cursor-not-allowed',
                'hover:border-gray-300'
              ],
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown icon */}
          <div className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors',
            hasError && 'text-red-500',
            hasSuccess && 'text-green-500',
            !hasError && !hasSuccess && 'text-gray-400',
            disabled && 'text-gray-300'
          )}>
            <ChevronDown size={18} aria-hidden="true" />
          </div>
          
          {/* Status icons (error/success) positioned separately */}
          {hasError && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
              <AlertCircle size={16} aria-hidden="true" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
              <CheckCircle2 size={16} aria-hidden="true" />
            </div>
          )}
        </div>
        
        <div className="mt-1.5">
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
      </div>
    );
  }
);

Select.displayName = 'Select';
