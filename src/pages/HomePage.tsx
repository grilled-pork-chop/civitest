import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import {
  Play,
  Clock,
  Target,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuestions } from '@/lib/queries';
import { appStore, quizActions } from '@/stores/quizStore';
import { getQuizStatistics, getQuizResults } from '@/utils/localStorage';
import { formatDateShort } from '@/utils/questions';
import { TOPICS } from '@/types';
import { cn } from '@/lib/utils';

export function HomePage() {
  const navigate = useNavigate();
  const { data: questions, isLoading, error } = useQuestions();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const stats = getQuizStatistics();
  const recentResults = getQuizResults().slice(0, 5);

  const handleStartQuiz = () => {
    if (!questions || questions.length === 0) return;
    quizActions.startQuiz(questions);
    navigate({ to: '/quiz' });
  };

  const handleContinueQuiz = () => {
    navigate({ to: '/quiz' });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les questions. Veuillez rafraîchir la page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Rafraîchir
          </Button>
        </div>
      </div>
    );
  }

  const hasActiveQuiz = currentQuiz && !currentQuiz.isCompleted;

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              Préparez votre Examen Civique
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Entraînez-vous dans les conditions réelles de l'examen civique français.
              40 questions, 45 minutes, 80% requis pour réussir.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasActiveQuiz ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleContinueQuiz}
                    className="bg-white text-[#002654] hover:bg-white/90"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Continuer le quiz
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleStartQuiz}
                    className="bg-white text-[#002654] hover:bg-white/90"
                  >
                    Nouveau quiz
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handleStartQuiz}
                  className="bg-white text-[#002654] hover:bg-white/90"
                  disabled={!questions || questions.length === 0}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Commencer un quiz
                </Button>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{questions?.length || 0} questions disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>45 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>80% requis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Stats and recent results */}
          <div className="lg:col-span-2 space-y-8">
            {/* User stats */}
            {stats.totalQuizzes > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Vos performances
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Quiz complétés"
                    value={stats.totalQuizzes.toString()}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    color="blue"
                  />
                  <StatCard
                    label="Taux de réussite"
                    value={`${stats.passRate}%`}
                    icon={<Award className="h-5 w-5" />}
                    color={stats.passRate >= 80 ? 'green' : 'yellow'}
                  />
                  <StatCard
                    label="Score moyen"
                    value={`${stats.averageScore}%`}
                    icon={<Target className="h-5 w-5" />}
                    color={stats.averageScore >= 80 ? 'green' : 'yellow'}
                  />
                  <StatCard
                    label="Meilleur score"
                    value={`${stats.bestScore}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="purple"
                  />
                </div>
              </section>
            )}

            {/* Recent results */}
            {recentResults.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    Résultats récents
                  </h2>
                  <Button variant="ghost" onClick={() => navigate({ to: '/stats' })}>
                    Voir tout
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentResults.map((result) => (
                    <Card
                      key={result.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate({ to: '/stats' })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center',
                                result.passed
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              )}
                            >
                              {result.passed ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <AlertCircle className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {result.score}/{result.totalQuestions} ({result.percentage}%)
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateShort(result.date)}
                              </p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'px-3 py-1 rounded-full text-sm font-medium',
                              result.passed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            )}
                          >
                            {result.passed ? 'Réussi' : 'Échoué'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* First time user */}
            {stats.totalQuizzes === 0 && (
              <section className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Bienvenue sur CiviTest !
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Commencez votre premier quiz pour voir vos statistiques et
                    suivre votre progression.
                  </p>
                  <Button size="lg" onClick={handleStartQuiz}>
                    <Play className="mr-2 h-5 w-5" />
                    Commencer maintenant
                  </Button>
                </div>
              </section>
            )}
          </div>

          {/* Right column - Info */}
          <div className="space-y-6">
            {/* Exam info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">À propos de l'examen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  L'examen civique est obligatoire pour la naturalisation française
                  et certains titres de séjour. Il évalue votre connaissance des
                  valeurs, principes et institutions de la République.
                </p>
                <div className="space-y-2">
                  <InfoItem icon={<BookOpen />} text="40 questions à choix multiples" />
                  <InfoItem icon={<Clock />} text="45 minutes maximum" />
                  <InfoItem icon={<Target />} text="32/40 minimum pour réussir (80%)" />
                  <InfoItem icon={<Award />} text="1 seule bonne réponse par question" />
                </div>
              </CardContent>
            </Card>

            {/* Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Les 5 thèmes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TOPICS.map((topic) => (
                    <div key={topic.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: topic.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{topic.nameShort}</p>
                        <p className="text-xs text-muted-foreground">
                          ~{topic.targetCount} questions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Conseils</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Lisez attentivement chaque question
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Gérez bien votre temps (env. 1 min/question)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Répondez à toutes les questions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Entraînez-vous régulièrement
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn('inline-flex p-2 rounded-lg mb-2', colorClasses[color])}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  text: string;
}

function InfoItem({ icon, text }: InfoItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
