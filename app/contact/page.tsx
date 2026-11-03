import Link from 'next/link';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

const contactMethods = [
  { label: 'Email', value: 'info@goferexam.com', href: 'mailto:info@goferexam.com', icon: Mail },
  { label: 'Phone', value: '+251-911-GOFER-EXAM', href: null, icon: Phone },
  { label: 'Telegram', value: '@Goferexam_bot', href: 'https://t.me/Goferexam_bot', icon: Send },
];

export default function ContactPage() {
  return (
    <PublicPageShell
      title="Contact Us"
      description="Get in touch with Gofer Exam about study-abroad guidance and the information on this website."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {contactMethods.map(({ label, value, href, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm"
          >
            <Icon className="shrink-0 text-primary-700" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-gray-900">{label}</span>
              {href ? (
                <a
                  href={href}
                  className="text-gray-700 underline"
                  target={label === 'Telegram' ? '_blank' : undefined}
                  rel={label === 'Telegram' ? 'noopener noreferrer' : undefined}
                >
                  {value}
                </a>
              ) : (
                <span className="text-gray-700">{value}</span>
              )}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm sm:col-span-2">
          <MapPin className="shrink-0 text-primary-700" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-gray-900">Location</span>
            <span className="text-gray-700">Addis Ababa, Ethiopia</span>
          </span>
        </div>
      </div>
      <p className="mt-8 text-gray-700">
        For current scholarship or admission requirements, contact the relevant institution directly.
        You can also browse our <Link className="text-primary-700 underline" href="/scholarships">scholarship listings</Link>.
      </p>
    </PublicPageShell>
  );
}
