import { PublicPageShell } from '@/components/layout/PublicPageShell';

export default function DisclaimerPage() {
  return (
    <PublicPageShell
      title="Disclaimer"
      description="Please verify important information with official sources."
    >
      <article className="space-y-5 rounded-xl bg-white p-6 leading-7 text-gray-700 shadow-sm sm:p-8">
        <p>
          Gofer Exam provides educational information and consultancy support. Website information
          is general and may not reflect the latest requirements, deadlines, fees, or policies.
        </p>
        <p>
          Always confirm scholarship details with the official provider, admissions criteria with
          the relevant institution, test rules with the test provider, and immigration requirements
          with the appropriate government authority.
        </p>
        <p>
          Gofer Exam does not guarantee admission, scholarships, examination results, employment, or
          visa approvals. Final decisions are made by the responsible institutions and authorities.
        </p>
      </article>
    </PublicPageShell>
  );
}
