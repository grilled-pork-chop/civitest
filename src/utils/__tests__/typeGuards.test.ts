import { hasReviewData, isTopicId } from '@/utils/typeGuards';
import type { QuizResult } from '@/types';

function makeResult(overrides: Partial<QuizResult> = {}): QuizResult {
  return {
    id: 'quiz_1',
    date: new Date().toISOString(),
    score: 32,
    totalQuestions: 40,
    percentage: 80,
    passed: true,
    timeTaken: 600,
    topicPerformance: [],
    ...overrides,
  };
}

describe('hasReviewData', () => {
  it('is true only when questions and answers are both non-empty', () => {
    const result = makeResult({
      questions: [
        {
          id: 'q1',
          question: 'Q?',
          type: 'knowledge',
          topic: 'institutions',
          choices: [
            { label: 'a', isCorrect: true },
            { label: 'b', isCorrect: false },
          ],
          explanation: '',
          difficulty: 'easy',
        },
      ],
      answers: [
        { questionId: 'q1', selectedChoiceIndex: 0, isCorrect: true, timeTaken: 5 },
      ],
    });
    expect(hasReviewData(result)).toBe(true);
  });

  it('is false when review data is missing or empty', () => {
    expect(hasReviewData(makeResult())).toBe(false);
    expect(hasReviewData(makeResult({ questions: [], answers: [] }))).toBe(false);
  });
});

describe('isTopicId', () => {
  it('accepts every valid topic id', () => {
    [
      'principes_valeurs',
      'institutions',
      'droits_devoirs',
      'histoire_geographie_culture',
      'vivre_france',
    ].forEach((id) => expect(isTopicId(id)).toBe(true));
  });

  it('rejects unknown strings and non-strings', () => {
    expect(isTopicId('unknown')).toBe(false);
    expect(isTopicId(42)).toBe(false);
    expect(isTopicId(null)).toBe(false);
    expect(isTopicId(undefined)).toBe(false);
  });
});
