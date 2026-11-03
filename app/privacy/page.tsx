import { PublicPageShell } from '@/components/layout/PublicPageShell';

export default function PrivacyPage() {
  return (
    <PublicPageShell
      title="Privacy Notice"
      description="A plain-language overview of information handled by Gofer Exam."
    >
      <article className="space-y-5 rounded-xl bg-white p-6 leading-7 text-gray-700 shadow-sm sm:p-8">
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          This notice is a preliminary summary, not a substitute for a reviewed privacy policy.
          Gofer Exam should confirm its data practices and obtain legal review before relying on it
          as a production policy.
        </p>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Information you provide</h2>
          <p className="mt-2">
            The registration interface requests your name, email address, and phone number.
            The deployed account service may store account and profile information submitted to it.
            Do not submit sensitive documents unless an approved, secure upload workflow is available.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">How information may be used</h2>
          <p className="mt-2">
            Account information is needed to provide account-related features. This website also
            displays public education and scholarship information. Confirm the full purposes,
            retention periods, and service providers with Gofer Exam before submitting personal data.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
          <p className="mt-2">
            For privacy questions, email <a className="underline" href="mailto:info@goferexam.com">info@goferexam.com</a>.
          </p>
        </section>
      </article>
    </PublicPageShell>
  );
}
