import { PublicPageShell } from '@/components/layout/PublicPageShell';

export default function TermsPage() {
  return (
    <PublicPageShell
      title="Terms of Use"
      description="Important information about using the Gofer Exam website."
    >
      <article className="space-y-5 rounded-xl bg-white p-6 leading-7 text-gray-700 shadow-sm sm:p-8">
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          These terms are a preliminary summary and require review and approval by Gofer Exam before
          they are treated as binding production terms.
        </p>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Educational information</h2>
          <p className="mt-2">
            Website content is provided for general informational purposes. Requirements and
            deadlines can change; confirm them with the relevant university, scholarship provider,
            testing organization, or government authority.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">No guaranteed outcomes</h2>
          <p className="mt-2">
            Gofer Exam does not guarantee admission, scholarships, test scores, or visa approvals.
            Final decisions rest with the organizations and authorities responsible for them.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to <a className="underline" href="mailto:info@goferexam.com">info@goferexam.com</a>.
          </p>
        </section>
      </article>
    </PublicPageShell>
  );
}
