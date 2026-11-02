'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/study-abroad', label: 'Study Abroad' },
    { href: '/exam-prep', label: 'Exam Prep' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];
  
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center space-x-2 rounded-lg p-1 -ml-1",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200",
              "hover:opacity-90"
            )}
            aria-label="Gofer Exam - Home"
          >
            <div className="bg-primary-600 p-2 rounded-lg transition-transform hover:scale-105">
              <GraduationCap className="text-white" size={24} aria-hidden="true" />
            </div>
            <div>
              <div className="text-xl font-bold text-primary-900">Gofer Exam</div>
              <div className="text-xs text-gray-600">Learn. Prepare. Apply. Achieve.</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1" role="menubar">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200',
                    'relative',
                    active 
                      ? 'text-primary-700 bg-primary-50 font-semibold' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                  {active && (
                    <span 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-primary-600 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/student/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/student/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "md:hidden p-2 rounded-md transition-all duration-200",
              "text-gray-700 hover:bg-gray-100 hover:text-primary-600",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200",
              "active:scale-95"
            )}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden bg-white border-t overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isOpen}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                  'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200',
                  active 
                    ? 'text-primary-700 bg-primary-50 font-semibold border-l-4 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 border-l-4 border-transparent'
                )}
                onClick={() => setIsOpen(false)}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 space-y-2 border-t border-gray-200 mt-4">
            <Link href="/student/login" className="block" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/student/register" className="block" onClick={() => setIsOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
