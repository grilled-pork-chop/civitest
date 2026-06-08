import {
  shuffleChoices,
  selectQuestions,
  calculatePercentage,
  formatTime,
  formatTimeVerbose,
  aggregateTopicStats,
  getTopicColor,
  getTopicName,
} from '@/utils/questions';
import { TOPICS, type Question, type TopicId, type QuizAnswer } from '@/types';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: overrides.id ?? 'q1',
    question: 'Quelle est la devise de la République ?',
    type: overrides.type ?? 'knowledge',
    topic: overrides.topic ?? 'principes_valeurs',
    choices: overrides.choices ?? [
      { label: 'Liberté, Égalité, Fraternité', isCorrect: true },
      { label: 'Un pour tous', isCorrect: false },
      { label: 'Vivre libre', isCorrect: false },
    ],
    explanation: overrides.explanation ?? '',
    difficulty: overrides.difficulty ?? 'medium',
    ...overrides,
  };
}

/** A pool with enough questions per topic to satisfy every target count. */
function makeFullPool(): Question[] {
  const pool: Question[] = [];
  for (const topic of TOPICS) {
    for (let i = 0; i < topic.targetCount + 10; i++) {
      // Include both knowledge and situational so situational-required topics fill.
      pool.push(
        makeQuestion({
          id: `${topic.id}_${i}`,
          topic: topic.id,
          type: i % 2 === 0 ? 'situational' : 'knowledge',
        })
      );
    }
  }
  return pool;
}

describe('calculatePercentage', () => {
  it('rounds to the nearest whole percent', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
    expect(calculatePercentage(32, 40)).toBe(80);
  });

  it('returns 0 when the total is 0 (no divide-by-zero)', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats seconds as zero-padded MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(45 * 60)).toBe('45:00');
  });
});

describe('formatTimeVerbose', () => {
  it('pluralizes and omits empty units', () => {
    expect(formatTimeVerbose(1)).toBe('1 seconde');
    expect(formatTimeVerbose(5)).toBe('5 secondes');
    expect(formatTimeVerbose(60)).toBe('1 minute');
    expect(formatTimeVerbose(120)).toBe('2 minutes');
    expect(formatTimeVerbose(90)).toBe('1 min 30 sec');
  });
});

describe('shuffleChoices', () => {
  it('keeps every original choice and preserves the correct answer', () => {
    const q = makeQuestion();
    const shuffled = shuffleChoices(q);

    expect(shuffled.shuffledChoices).toHaveLength(q.choices.length);
    // Same set of labels, order may differ.
    expect([...shuffled.shuffledChoices.map((c) => c.label)].sort()).toEqual(
      [...q.choices.map((c) => c.label)].sort()
    );
    // Exactly one correct answer, and it is the originally-correct label.
    const correct = shuffled.shuffledChoices.filter((c) => c.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].label).toBe('Liberté, Égalité, Fraternité');
  });

  it('maps original indices to their shuffled positions', () => {
    const q = makeQuestion();
    const shuffled = shuffleChoices(q);
    shuffled.originalToShuffledMap.forEach((shuffledIndex, originalIndex) => {
      expect(shuffled.shuffledChoices[shuffledIndex].label).toBe(
        q.choices[originalIndex].label
      );
    });
  });
});

describe('selectQuestions', () => {
  it('selects the target count for each topic', () => {
    const selected = selectQuestions(makeFullPool());
    for (const topic of TOPICS) {
      const count = selected.filter((q) => q.topic === topic.id).length;
      expect(count).toBe(topic.targetCount);
    }
  });

  it('prefers fresh questions over recently-used ones', () => {
    const pool = makeFullPool();
    const usedIds = pool.map((q) => q.id).slice(0, 5);
    // Recently-used set only affects ordering/freshness; the pool is large
    // enough that fresh questions should always win.
    const selected = selectQuestions(pool, [usedIds]);
    const selectedIds = new Set(selected.map((q) => q.id));
    usedIds.forEach((id) => expect(selectedIds.has(id)).toBe(false));
  });
});

describe('aggregateTopicStats', () => {
  it('counts correct/total per topic and computes percentage', () => {
    const questions: Pick<Question, 'topic'>[] = [
      { topic: 'principes_valeurs' },
      { topic: 'principes_valeurs' },
      { topic: 'institutions' },
    ];
    const answers: Pick<QuizAnswer, 'isCorrect'>[] = [
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
    ];

    const stats = aggregateTopicStats(questions, answers);

    expect(stats.principes_valeurs).toEqual({ correct: 1, total: 2, percentage: 50 });
    expect(stats.institutions).toEqual({ correct: 1, total: 1, percentage: 100 });
    // Topics not present are absent (so callers only render what was asked).
    expect(stats.droits_devoirs).toBeUndefined();
  });

  it('treats a missing answer as incorrect', () => {
    const stats = aggregateTopicStats([{ topic: 'institutions' }], []);
    expect(stats.institutions).toEqual({ correct: 0, total: 1, percentage: 0 });
  });
});

describe('topic lookups', () => {
  it('resolves known topic colors and names', () => {
    const topic = TOPICS[0];
    expect(getTopicColor(topic.id)).toBe(topic.color);
    expect(getTopicName(topic.id)).toBe(topic.name);
    expect(getTopicName(topic.id, true)).toBe(topic.nameShort);
  });

  it('falls back for an unknown topic id', () => {
    expect(getTopicColor('nope' as TopicId)).toBe('#6B7280');
    expect(getTopicName('nope' as TopicId)).toBe('nope');
  });
});
