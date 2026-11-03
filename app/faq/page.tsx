import { PublicPageShell } from '@/components/layout/PublicPageShell';

const questions = [
  {
    question: 'Is Gofer Exam free to use?',
    answer: 'Browsing the public information on this website is free. Confirm any consultation scope or fees with Gofer Exam before engaging a service.',
  },
  {
    question: 'Can Gofer Exam guarantee admission, a scholarship, or a visa?',
    answer: 'No. Decisions are made by universities, scholarship providers, and government authorities. Gofer Exam does not guarantee outcomes.',
  },
  {
    question: 'Are scholarship deadlines and requirements guaranteed to be current?',
    answer: 'No. Applicants should verify every deadline, eligibility rule, and application requirement on the official provider website before applying.',
  },
  {
    question: 'Which English proficiency tests are covered?',
    answer: 'The exam preparation information covers IELTS, TOEFL, and the Duolingo English Test. Refer to the relevant test provider for official materials and current test rules.',
  },
];

export default function FAQPage() {
  return (
    <PublicPageShell
      title="Frequently Asked Questions"
      description="Answers to common questions about using Gofer Exam."
    >
      <div className="space-y-4">
        {questions.map(({ question, answer }) => (
          <details key={question} className="rounded-xl bg-white p-6 shadow-sm">
            <summary className="cursor-pointer font-semibold text-gray-900">{question}</summary>
            <p className="mt-4 leading-7 text-gray-700">{answer}</p>
          </details>
        ))}
      </div>
    </PublicPageShell>
  );
}
