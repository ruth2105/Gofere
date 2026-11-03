import Link from 'next/link';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

export default function ForgotPasswordPage() {
  return (
    <PublicPageShell
      title="Password assistance"
      description="Password reset is not available yet."
    >
      <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <p className="leading-7 text-gray-700">
          Gofer Exam does not currently provide a password-reset workflow. Contact
          {' '}<a className="underline" href="mailto:info@goferexam.com">info@goferexam.com</a>
          {' '}for assistance with your account.
        </p>
        <Link href="/student/login" className="mt-6 inline-block font-semibold text-primary-700 underline">
          Return to sign in
        </Link>
      </section>
    </PublicPageShell>
  );
}
