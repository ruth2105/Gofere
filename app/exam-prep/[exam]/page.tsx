import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

const exams = {
  ielts: {
    name: 'IELTS',
    description: 'Prepare for the Listening, Reading, Writing, and Speaking sections. Test format and requirements vary by test type and institution.',
    officialName: 'IELTS official preparation resources',
    officialUrl: 'https://ielts.org/take-a-test/preparation-resources',
    steps: [
      'Check whether your institution requires IELTS Academic or another test format.',
      'Review the official test format, timing, and scoring criteria.',
      'Take a timed practice test to identify sections that need more preparation.',
      'Use official sample questions and review your answers against the published criteria.',
    ],
  },
  toefl: {
    name: 'TOEFL',
    description: 'Build skills across the TOEFL iBT sections and become familiar with the current test format.',
    officialName: 'ETS TOEFL preparation',
    officialUrl: 'https://www.ets.org/toefl/test-takers/ibt/prepare.html',
    steps: [
      'Confirm the TOEFL format and score requirements with each institution.',
      'Review the official section structure and question types.',
      'Practice under timed conditions and track your performance by section.',
      'Use official ETS preparation material to learn current test expectations.',
    ],
  },
  duolingo: {
    name: 'Duolingo English Test',
    description: 'Learn about the test format and prepare for the adaptive English proficiency assessment.',
    officialName: 'Duolingo English Test preparation',
    officialUrl: 'https://englishtest.duolingo.com/prepare',
    steps: [
      'Check whether your target institution accepts the Duolingo English Test.',
      'Review the official test rules, technical requirements, and question formats.',
      'Use the official practice test to become familiar with the experience.',
      'Arrange a quiet, well-lit testing space that meets the provider requirements.',
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(exams).map((exam) => ({ exam }));
}

export default async function ExamPrepDetailPage({
  params,
}: {
  params: Promise<{ exam: string }>;
}) {
  const { exam } = await params;
  const details = Object.entries(exams).find(([key]) => key === exam)?.[1];
  if (!details) notFound();

  return (
    <PublicPageShell
      title={`${details.name} Preparation`}
      description={details.description}
    >
      <article className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-gray-900">A practical preparation checklist</h2>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-gray-700">
          {details.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <a
          href={details.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block font-semibold text-primary-700 underline"
        >
          {details.officialName} (opens in a new tab)
        </a>
        <p className="mt-6 text-sm text-gray-600">
          Gofer Exam is not a test provider. Test formats, fees, dates, and institution requirements
          may change; verify them directly with the test provider and your institution.
        </p>
        <Link href="/exam-prep" className="mt-6 inline-block text-primary-700 underline">
          Back to exam preparation
        </Link>
      </article>
    </PublicPageShell>
  );
}
