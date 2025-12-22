import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  List,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { appStore, quizActions } from '@/stores/quizStore';
import { useQuestions } from '@/lib/queries';
import { useKeyboardNavigation } from '@/hooks';
import { getTopicName, getTopicColor, getQuestionTypeColor } from '@/utils/questions';
import { cn } from '@/lib/utils';
import type { QuestionType, TopicId } from '@/types';

type FilterType = 'all' | 'correct' | 'incorrect';

export function ReviewPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const quizId = (params as { quizId?: string }).quizId;

  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const { data: questions } = useQuestions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (quizId) {
      const loaded = quizActions.loadQuizForReview(quizId);
      if (!loaded) {
        setLoadError(true);
      }
    }
  }, [quizId]);

  useEffect(() => {
    if (!quizId && (!currentQuiz || !currentQuiz.isCompleted)) {
      navigate({ to: '/' });
    }
  }, [currentQuiz, navigate, quizId]);

  useEffect(() => {
    if (filteredIndices.length > 0) {
      setCurrentIndex(filteredIndices[0]);
    }
  }, [filter, topicFilter, typeFilter]);

  const filteredIndices = currentQuiz
    ? currentQuiz.answers
      .map((answer, index) => ({ answer, index }))
      .filter(({ answer, index }) => {
        const question = currentQuiz.questions[index];

        if (filter === 'correct' && !answer.isCorrect) return false;
        if (filter === 'incorrect' && answer.isCorrect) return false;

        if (topicFilter !== 'all' && question.topic !== topicFilter) return false;
        if (typeFilter !== 'all' && question.type !== typeFilter) return false;

        return true;
      })
      .map(({ index }) => index)
    : [];

  const currentFilteredPosition = filteredIndices.indexOf(currentIndex);
  const currentQuestion = currentQuiz?.questions[currentIndex];
  const currentAnswer = currentQuiz?.answers[currentIndex];

  const goToPrev = () => {
    if (currentFilteredPosition > 0) {
      setCurrentIndex(filteredIndices[currentFilteredPosition - 1]);
    }
  };

  const goToNext = () => {
    if (currentFilteredPosition < filteredIndices.length - 1) {
      setCurrentIndex(filteredIndices[currentFilteredPosition + 1]);
    }
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  useKeyboardNavigation(true, {
    onNext: goToNext,
    onPrev: goToPrev,
  });

  const handleNewQuiz = () => {
    if (questions) {
      quizActions.startQuiz(questions);
      navigate({ to: '/quiz' });
    }
  };

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Quiz non disponible</h2>
          <p className="text-muted-foreground mb-6">
            Ce quiz n'est plus disponible pour révision. Les anciens quiz sans données complètes ne peuvent pas être révisés.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate({ to: '/stats' })}>
              Voir les statistiques
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuiz || !currentQuiz.isCompleted || !currentQuestion || !currentAnswer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const correctCount = currentQuiz.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = currentQuiz.answers.filter((a) => !a.isCorrect).length;

  const knowledgeCount = currentQuiz.questions.filter((q) => q.type === 'knowledge').length;
  const situationalCount = currentQuiz.questions.filter((q) => q.type === 'situational').length;


  const topicStats = currentQuiz.questions.reduce(
    (acc, question, index) => {
      const answer = currentQuiz.answers[index];
      if (!acc[question.topic]) {
        acc[question.topic] = { correct: 0, total: 0 };
      }
      acc[question.topic].total++;
      if (answer.isCorrect) {
        acc[question.topic].correct++;
      }
      return acc;
    },
    {} as Record<TopicId, { correct: number; total: number }>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">Révision</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {correctCount}/{currentQuiz.questions.length} bonnes réponses (
                {Math.round((correctCount / currentQuiz.questions.length) * 100)}%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/' })} className="flex-1 sm:flex-none">
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <Button onClick={handleNewQuiz}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Nouveau quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Question area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {/* Filters */}
            <div className="mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <div className="flex rounded-lg border overflow-hidden bg-white">
                  <FilterButton
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                  >
                    <List className="h-4 w-4 mr-1" />
                    Toutes ({currentQuiz.questions.length})
                  </FilterButton>
                  <FilterButton
                    active={filter === 'correct'}
                    onClick={() => setFilter('correct')}
                    className="border-l"
                  >
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Correctes ({correctCount})
                  </FilterButton>
                  <FilterButton
                    active={filter === 'incorrect'}
                    onClick={() => setFilter('incorrect')}
                    className="border-l"
                  >
                    <XCircle className="h-4 w-4 mr-1 text-red-600" />
                    Incorrectes ({incorrectCount})
                  </FilterButton>

                </div>
              </div>
            </div>
            <div className="mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <div className="flex rounded-lg border overflow-hidden bg-white">
                  <FilterButton
                    active={typeFilter === 'all'}
                    onClick={() => setTypeFilter('all')}
                  >
                    <Layers className="h-4 w-4 mr-1" />
                    Tous ({currentQuiz.questions.length})
                  </FilterButton>
                  <FilterButton
                    active={typeFilter === 'knowledge'}
                    onClick={() => setTypeFilter('knowledge')}
                    className="border-l"
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: getQuestionTypeColor('knowledge') }}
                    />
                    Connaissance ({knowledgeCount})
                  </FilterButton>
                  <FilterButton
                    active={typeFilter === 'situational'}
                    onClick={() => setTypeFilter('situational')}
                    className="border-l"
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: getQuestionTypeColor('situational') }}
                    />
                    Situation ({situationalCount})
                  </FilterButton>
                </div>
              </div>
            </div>
            {/* Topic filter */}
            <div className="mb-6">
              <Tabs
                value={topicFilter}
                onValueChange={(v) => setTopicFilter(v as TopicId | 'all')}
              >
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="all" className="text-xs">
                    Tous les thèmes
                  </TabsTrigger>
                  {Object.entries(topicStats).map(([topicId, stats]) => (
                    <TabsTrigger
                      key={topicId}
                      value={topicId}
                      className="text-xs"
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: getTopicColor(topicId as TopicId) }}
                      />
                      {getTopicName(topicId as TopicId, true)} ({stats.correct}/{stats.total})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Current question */}
            {filteredIndices.length > 0 ? (
              <>
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={currentQuiz.questions.length}
                  selectedChoiceIndex={currentAnswer.selectedChoiceIndex}
                  onSelectChoice={() => { }}
                  isReviewMode={true}
                  showExplanation={true}
                />

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPrev}
                    disabled={currentFilteredPosition <= 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {currentFilteredPosition + 1} / {filteredIndices.length}
                    {filter !== 'all' && ` (filtrées)`}
                  </span>

                  <Button
                    onClick={goToNext}
                    disabled={currentFilteredPosition >= filteredIndices.length - 1}
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Aucune question ne correspond aux filtres sélectionnés.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setFilter('all');
                      setTopicFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Progress grid */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Toutes les questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuizProgress
                    answers={currentQuiz.answers}
                    currentIndex={currentIndex}
                    onNavigate={goToIndex}
                    isReviewMode={true}
                  />
                </CardContent>
              </Card>

              {/* Topic summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Résumé par thème</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(topicStats).map(([topicId, stats]) => {
                      const percentage = Math.round(
                        (stats.correct / stats.total) * 100
                      );
                      const isPassing = percentage >= 80;

                      return (
                        <div key={topicId}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getTopicColor(topicId as TopicId),
                                }}
                              />
                              {getTopicName(topicId as TopicId, true)}
                            </span>
                            <span
                              className={cn('font-medium', {
                                'text-green-600': isPassing,
                                'text-red-600': !isPassing,
                              })}
                            >
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', {
                                'bg-green-500': isPassing,
                                'bg-red-500': !isPassing,
                              })}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function FilterButton({ active, onClick, children, className }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-background hover:bg-secondary text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}