import { useQuery, QueryClient } from '@tanstack/react-query';
import type { Question } from '@/types';

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


async function fetchQuestions(): Promise<Question[]> {
  const files = [
    'pv_questions.json',
    'sip_questions.json',
    'dd_questions.json',
    'hgc_questions.json',
    'vsf_questions.json'
  ];

  try {
    const fetchPromises = files.map(file => 
      fetch(file).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${file}`);
        return res.json();
      })
    );

    const results = await Promise.all(fetchPromises);

    const allQuestions = results.flat();

    if (!Array.isArray(allQuestions)) {
      throw new Error('Invalid questions data: expected an array');
    }

    return allQuestions as Question[];
  } catch (error) {
    console.error("Error loading questions:", error);
    throw error;
  }
}

export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: Infinity,
  });
}

export function useQuestionCountByTopic() {
  const { data: questions } = useQuestions();

  if (!questions) {
    return {};
  }

  return questions.reduce(
    (acc, q) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
