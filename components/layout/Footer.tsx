'use client';

import React from 'react';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';

const subscribeToNothing = () => () => {};
const getCurrentYear = () => new Date().getFullYear();
const getServerYear = () => 2026;

const linkClass =
  'text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded';

export const Footer: React.FC = () => {
  const currentYear = useSyncExternalStore(
    subscribeToNothing,
    getCurrentYear,
    getServerYear
  );

  return (
    <footer className="bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              aria-label="Gofer Exam - Home"
              className="mb-4 inline-flex rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40"
            >
              <BrandLogo variant="dark" />
            </Link>
            <p className="mb-4 text-sm text-gray-300">
              Educational information and consultancy support for students exploring study abroad.
            </p>
            <a
              href="https://t.me/Goferexam_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded p-1 text-gray-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label="Telegram"
            >
              <Send size={20} aria-hidden="true" />
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {[
                ['/scholarships', 'Scholarships'],
                ['/study-abroad', 'Study Abroad'],
                ['/exam-prep', 'Exam Preparation'],
                ['/services', 'Our Services'],
                ['/about', 'About Us'],
                ['/faq', 'FAQ'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className={linkClass}>Browse Services</Link></li>
              <li><Link href="/exam-prep/ielts" className={linkClass}>IELTS Preparation</Link></li>
              <li><Link href="/exam-prep/toefl" className={linkClass}>TOEFL Preparation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="mt-1 shrink-0 text-brand-gold" aria-hidden="true" />
                <span className="text-gray-300">Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={16} className="shrink-0 text-brand-gold" aria-hidden="true" />
                <span className="text-gray-300">+251-911-GOFER-EXAM</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail size={16} className="shrink-0 text-brand-gold" aria-hidden="true" />
                <a className="text-gray-300 underline" href="mailto:info@goferexam.com">info@goferexam.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">© {currentYear} Gofer Exam. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
              <Link href="/terms" className={linkClass}>Terms of Service</Link>
              <Link href="/disclaimer" className={linkClass}>Disclaimer</Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-300">
            Gofer Exam is an independent educational consultancy and is not affiliated with TOEFL, IELTS, or Duolingo English Test.
            We do not guarantee admission, scholarships, or visa approvals. All outcomes are subject to institution and government decisions.
          </p>
        </div>
      </div>
    </footer>
  );
};
