import { PublicPageShell } from '@/components/layout/PublicPageShell';

export default function AboutPage() {
  return (
    <PublicPageShell
      title="About Gofer Exam"
      description="Learn. Prepare. Apply. Achieve."
    >
      <article className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Guidance for your study-abroad journey</h2>
        <p className="leading-7 text-gray-700">
          Gofer Exam provides educational information and consultancy support for students exploring
          international study. The website brings together scholarship discovery, study destination
          information, English exam preparation guidance, and application support.
        </p>
        <p className="leading-7 text-gray-700">
          Scholarship availability, admission decisions, and visa outcomes are determined by the
          relevant providers and authorities. Students should confirm current requirements and
          deadlines with official sources before applying.
        </p>
        <p className="leading-7 text-gray-700">
          Gofer Exam is based in Addis Ababa, Ethiopia. For questions about the services or website,
          please use the contact options on our contact page.
        </p>
      </article>
    </PublicPageShell>
  );
}
