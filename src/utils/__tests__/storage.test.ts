import Storage from 'expo-sqlite/kv-store';
import { saveQuizHistory } from '@/utils/storage';
import { STORAGE_LIMITS } from '@/constants/app';
import type { QuizHistory, QuizResult } from '@/types';

jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: jest.fn(),
    setItemSync: jest.fn(),
  },
}));

jest.mock('@/services/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockStorage = Storage as unknown as {
  getItemSync: jest.Mock;
  setItemSync: jest.Mock;
};

function makeResult(i: number): QuizResult {
  return {
    id: `quiz_${i}`,
    date: new Date(2024, 0, 1 + i).toISOString(),
    score: 30,
    totalQuestions: 40,
    percentage: 75,
    passed: false,
    timeTaken: 500,
    topicPerformance: [],
  };
}

function makeHistory(resultCount: number): QuizHistory {
  return {
    results: Array.from({ length: resultCount }, (_, i) => makeResult(i)),
    usedQuestionSets: [],
    lastQuizDate: null,
  };
}

beforeEach(() => {
  mockStorage.getItemSync.mockReset();
  mockStorage.setItemSync.mockReset();
});

describe('saveQuizHistory', () => {
  it('reports success when the write succeeds', () => {
    mockStorage.setItemSync.mockImplementation(() => undefined);
    const result = saveQuizHistory(makeHistory(3));
    expect(result).toEqual({ success: true });
    expect(mockStorage.setItemSync).toHaveBeenCalledTimes(1);
  });

  it('trims history and retries once when the first write fails', () => {
    mockStorage.setItemSync
      .mockImplementationOnce(() => {
        throw new Error('SQLITE_FULL');
      })
      .mockImplementationOnce(() => undefined);

    const overCount = STORAGE_LIMITS.MAX_QUIZ_RESULTS + 5;
    const result = saveQuizHistory(makeHistory(overCount));

    expect(result).toEqual({ success: true, quotaExceeded: true, trimmed: true });
    expect(mockStorage.setItemSync).toHaveBeenCalledTimes(2);

    // The retry payload keeps only the most-recent MAX_QUIZ_RESULTS results.
    const retryPayload = JSON.parse(mockStorage.setItemSync.mock.calls[1][1]);
    expect(retryPayload.results).toHaveLength(STORAGE_LIMITS.MAX_QUIZ_RESULTS);
    expect(retryPayload.results[0].id).toBe('quiz_5'); // dropped the oldest 5
  });

  it('reports failure when even the trimmed retry fails', () => {
    mockStorage.setItemSync.mockImplementation(() => {
      throw new Error('SQLITE_FULL');
    });

    const result = saveQuizHistory(makeHistory(3));

    expect(result.success).toBe(false);
    expect(result.quotaExceeded).toBe(true);
    expect(mockStorage.setItemSync).toHaveBeenCalledTimes(2);
  });
});
