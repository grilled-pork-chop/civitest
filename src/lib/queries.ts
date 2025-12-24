import { useEffect } from 'react';
import { useQuery, QueryClient } from '@tanstack/react-query';
import type { Question } from '@/types';
import { validateQuestions } from './schemas';
import { getQuestionFileUrl } from '@/config/env';
import { logger } from '@/services/logger';
import { toast } from '@/services/toast';
import { QUESTION_FILES, ERROR_MESSAGES } from '@/constants/app';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Fetch all question files from the server
 * Uses Promise.allSettled for resilience - continues even if some files fail
 *
 * @returns Array of validated questions
 * @throws Error if no questions could be loaded or validation fails
 */
async function fetchQuestions(): Promise<Question[]> {
  const files = QUESTION_FILES.map(getQuestionFileUrl);

  const fetchPromises = files.map(async (file) => {
    try {
      const res = await fetch(file);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${file}: ${res.status} ${res.statusText}`);
      }
      return { file, data: await res.json(), success: true as const };
    } catch (error) {
      logger.error(`Error loading ${file}`, { file }, error as Error);
      return { file, error, success: false as const };
    }
  });

  const results = await Promise.allSettled(fetchPromises);

  const loadedFiles: unknown[] = [];
  const failedFiles: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      loadedFiles.push(result.value.data);
    } else if (result.status === 'fulfilled' && !result.value.success) {
      failedFiles.push(result.value.file);
    } else if (result.status === 'rejected') {
      failedFiles.push('unknown file');
    }
  }

  if (loadedFiles.length === 0) {
    throw new Error('Failed to load any question files');
  }

  if (failedFiles.length > 0) {
    logger.warn(`Failed to load ${failedFiles.length} file(s)`, {
      failedFiles,
      loadedCount: loadedFiles.length
    });
  }

  const allQuestions = loadedFiles.flat();

  try {
    return validateQuestions(allQuestions);
  } catch (error) {
    logger.error('Question validation failed', { questionCount: allQuestions.length }, error as Error);
    throw new Error('Invalid question data format. Please check the question files.');
  }
}

/**
 * React Query hook to fetch and cache questions
 * Questions are cached indefinitely once loaded
 *
 * @returns Query result with questions data, loading state, and error
 *
 * @example
 * ```typescript
 * const { data: questions, isLoading, error } = useQuestions();
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 * return <QuizList questions={questions} />;
 * ```
 */

export function useQuestions() {
  const query = useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: Infinity,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message?.includes('Invalid question data format')) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
  });

  // Show toast notification on error using useEffect
  useEffect(() => {
    if (query.error && query.isError) {
      const errorMessage = (query.error as Error).message?.includes('Invalid question data format')
        ? ERROR_MESSAGES.QUESTIONS_LOAD_FAILED
        : 'Erreur de chargement des questions. Veuillez réessayer.';

      toast.error(errorMessage, { duration: 5000 });
      logger.error('Failed to fetch questions in useQuestions hook', {}, query.error as Error);
    }
  }, [query.error, query.isError]);

  return query;
}

export function useQuestionCountByTopic(): Record<string, number> {
  const { data: questions } = useQuestions();

  if (!questions) {
    return {};
  }

  return questions.reduce(
    (acc: Record<string, number>, q: Question) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
