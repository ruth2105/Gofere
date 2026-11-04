'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const questions = [
  {
    prompt: 'Choose the grammatically correct sentence.',
    options: [
      'She have studied English for three years.',
      'She has studied English for three years.',
      'She is study English for three years.',
      'She studied English since three years.',
    ],
    answer: 1,
    explanation: 'Use “has” with “she” and the present perfect to describe an action that began in the past and continues now.',
  },
  {
    prompt: 'In the sentence “The instructions were concise,” what does “concise” mean?',
    options: ['Brief and clear', 'Difficult to follow', 'Very informal', 'Repeated several times'],
    answer: 0,
    explanation: '“Concise” means expressed clearly using few words.',
  },
  {
    prompt: 'Complete the sentence: “If the library ___ open, we will study there.”',
    options: ['was', 'were', 'is', 'be'],
    answer: 2,
    explanation: 'For a real future possibility, use the present simple in the if-clause: “If the library is open…”',
  },
  {
    prompt: 'Choose the best connector: “The train was delayed; ___, we arrived before the meeting began.”',
    options: ['therefore', 'however', 'because', 'for example'],
    answer: 1,
    explanation: '“However” signals a contrast between the delay and arriving before the meeting.',
  },
  {
    prompt: 'Which word is closest in meaning to “reliable”?',
    options: ['Trustworthy', 'Unusual', 'Temporary', 'Expensive'],
    answer: 0,
    explanation: 'A reliable person or source can be trusted or depended on.',
  },
  {
    prompt: 'Choose the correct reported speech: Lina said, “I am preparing for my exam.”',
    options: [
      'Lina said that I am preparing for my exam.',
      'Lina said that she was preparing for her exam.',
      'Lina said that she prepares for my exam.',
      'Lina said that she has prepare for her exam.',
    ],
    answer: 1,
    explanation: 'In reported speech, “I” changes to “she,” “my” changes to “her,” and “am preparing” usually shifts to “was preparing.”',
  },
  {
    prompt: 'Read: “Marta checked the bus schedule the night before her interview. In the morning, she left early because rain had slowed traffic.” Why did Marta leave early?',
    options: [
      'She had forgotten the interview time.',
      'She expected the weather to affect her journey.',
      'The bus schedule changed overnight.',
      'Her interview was moved to the morning.',
    ],
    answer: 1,
    explanation: 'The passage says she left early because rain had slowed traffic.',
  },
  {
    prompt: 'Choose the best completion: “The research team repeated the experiment ___ confirm the result.”',
    options: ['so that', 'in order to', 'despite', 'unless'],
    answer: 1,
    explanation: '“In order to” introduces the purpose of an action and is followed by a base verb.',
  },
] as const;

export default function PracticeTestPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  const question = questions[questionIndex];
  const isCorrect = submittedAnswer === question?.answer;

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || submittedAnswer !== null) return;
    setSubmittedAnswer(selectedAnswer);
    if (selectedAnswer === question.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex === questions.length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((currentIndex) => currentIndex + 1);
    setSelectedAnswer(null);
    setSubmittedAnswer(null);
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setSubmittedAnswer(null);
    setScore(0);
    setComplete(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/exam-prep"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Exam preparation
          </Link>

          <Card className="mt-6">
            {complete ? (
              <>
                <CardHeader>
                  <CardTitle as="h1" className="text-2xl">Practice session complete</CardTitle>
                  <CardDescription>
                    You answered {score} of {questions.length} questions correctly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    This is an original general-English practice exercise, not an IELTS, TOEFL,
                    or Duolingo English Test simulation. The result is not an official score or
                    a prediction of test performance.
                  </p>
                  <Button className="mt-6" onClick={handleRestart} leftIcon={<RotateCcw size={16} />}>
                    Try Again
                  </Button>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <p className="text-sm font-medium text-primary-700" aria-live="polite">
                    Question {questionIndex + 1} of {questions.length}
                  </p>
                  <CardTitle as="h1" className="text-2xl">General English Practice</CardTitle>
                  <CardDescription>
                    Original grammar, vocabulary, and reading questions. This is not an official
                    test or a provider-format simulation.
                  </CardDescription>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"
                    role="progressbar"
                    aria-label="Quiz progress"
                    aria-valuemin={0}
                    aria-valuemax={questions.length}
                    aria-valuenow={questionIndex + 1}
                  >
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all"
                      style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <fieldset>
                    <legend className="text-lg font-semibold text-gray-900">
                      {question.prompt}
                    </legend>
                    <div className="mt-5 space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const selected = selectedAnswer === optionIndex;
                        const revealed = submittedAnswer !== null;
                        const correctOption = revealed && question.answer === optionIndex;
                        const incorrectSelection = revealed && selected && !correctOption;

                        return (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                              correctOption
                                ? 'border-green-600 bg-green-50'
                                : incorrectSelection
                                  ? 'border-red-600 bg-red-50'
                                  : selected
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-300 bg-white hover:border-primary-400'
                            } ${revealed ? 'cursor-default' : ''}`}
                          >
                            <input
                              className="mt-1 h-4 w-4 accent-primary-700"
                              type="radio"
                              name="practice-answer"
                              value={optionIndex}
                              checked={selected}
                              disabled={revealed}
                              onChange={() => setSelectedAnswer(optionIndex)}
                            />
                            <span className="text-gray-800">{option}</span>
                            {correctOption && <span className="sr-only">Correct answer.</span>}
                            {incorrectSelection && <span className="sr-only">Your answer.</span>}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {submittedAnswer !== null && (
                    <div
                      className={`mt-5 rounded-lg p-4 ${
                        isCorrect ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      <p className="font-semibold">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
                      <p className="mt-1 text-sm">{question.explanation}</p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-600" aria-live="polite">
                      Correct answers: {score}
                    </p>
                    {submittedAnswer === null ? (
                      <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                        Check Answer
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} rightIcon={<ArrowRight size={16} />}>
                        {questionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          <p className="mt-5 text-sm text-gray-600">
            For current test formats, official sample material, and scoring guidance, visit the
            test provider&apos;s preparation resources.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
