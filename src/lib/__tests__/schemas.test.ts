import {
  validateQuestions,
  validateQuizHistory,
  ResultQuestionSchema,
} from '@/lib/schemas';

const validQuestion = {
  id: 'q1',
  question: 'Quelle est la capitale de la France ?',
  type: 'knowledge',
  topic: 'histoire_geographie_culture',
  choices: [
    { label: 'Paris', isCorrect: true },
    { label: 'Lyon', isCorrect: false },
  ],
  explanation: 'Paris est la capitale.',
  difficulty: 'easy',
};

describe('validateQuestions', () => {
  it('accepts a well-formed question array', () => {
    const parsed = validateQuestions([validQuestion]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('q1');
  });

  it('applies defaults for optional explanation/difficulty', () => {
    const { explanation, difficulty, ...withoutOptionals } = validQuestion;
    const parsed = validateQuestions([withoutOptionals]);
    expect(parsed[0].explanation).toBe('');
    expect(parsed[0].difficulty).toBe('medium');
  });

  it('rejects a question with no correct answer', () => {
    const bad = {
      ...validQuestion,
      choices: [
        { label: 'Paris', isCorrect: false },
        { label: 'Lyon', isCorrect: false },
      ],
    };
    expect(() => validateQuestions([bad])).toThrow();
  });

  it('rejects a question with fewer than two choices', () => {
    const bad = { ...validQuestion, choices: [{ label: 'Paris', isCorrect: true }] };
    expect(() => validateQuestions([bad])).toThrow();
  });

  it('rejects an invalid topic id', () => {
    expect(() => validateQuestions([{ ...validQuestion, topic: 'nope' }])).toThrow();
  });
});

describe('validateQuizHistory', () => {
  it('accepts an empty history shape', () => {
    const history = { results: [], usedQuestionSets: [], lastQuizDate: null };
    expect(validateQuizHistory(history)).toEqual(history);
  });

  it('throws on a malformed payload', () => {
    expect(() => validateQuizHistory({ results: 'nope' })).toThrow();
  });
});

describe('ResultQuestionSchema', () => {
  it('preserves shuffledChoices so historical review keeps the shown order', () => {
    const parsed = ResultQuestionSchema.parse({
      ...validQuestion,
      shuffledChoices: [
        { label: 'Lyon', isCorrect: false },
        { label: 'Paris', isCorrect: true },
      ],
      originalToShuffledMap: [1, 0],
    });
    expect(parsed.shuffledChoices).toHaveLength(2);
    expect(parsed.shuffledChoices?.[1].label).toBe('Paris');
    expect(parsed.originalToShuffledMap).toEqual([1, 0]);
  });

  it('still accepts an older result question without the shuffled fields', () => {
    const parsed = ResultQuestionSchema.parse(validQuestion);
    expect(parsed.shuffledChoices).toBeUndefined();
  });
});
