'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the close button or first focusable element
    const focusModal = () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = Array.from(focusableElements ?? []).find(
          (element) => element.tabIndex >= 0 && element.getClientRects().length > 0
        );
        (firstFocusable ?? modalRef.current)?.focus();
      }
    };

    // Small delay to ensure modal is rendered
    const timer = setTimeout(focusModal, 10);

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    // Handle focus trap
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const visibleFocusableElements = Array.from(focusableElements).filter(
        (element) => element.tabIndex >= 0 && element.getClientRects().length > 0
      );
      if (visibleFocusableElements.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const firstElement = visibleFocusableElements[0];
      const lastElement = visibleFocusableElements[visibleFocusableElements.length - 1];
      if (!modalRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300 ease-out",
          "animate-in fade-in"
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        className="flex min-h-full items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-white rounded-xl shadow-2xl',
            'transform transition-all duration-300 ease-out',
            'animate-in zoom-in-95 slide-in-from-bottom-4',
            sizes[size]
          )}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex-1">
                {title && (
                  <h2 
                    id="modal-title"
                    className="text-xl font-bold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p 
                    id="modal-description"
                    className="mt-1 text-sm text-gray-600"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className={cn(
                    "ml-4 p-1.5 rounded-lg transition-all duration-200",
                    "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200",
                    "active:scale-95"
                  )}
                  aria-label="Close modal"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
