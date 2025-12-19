import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Target,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Play,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getQuizStatistics,
  getQuizResults,
  clearQuizHistory,
  exportQuizHistory,
  importQuizHistory,
} from '@/utils/localStorage';
import { formatDate, formatTimeVerbose, getTopicName, getTopicColor } from '@/utils/questions';
import { quizActions } from '@/stores/quizStore';
import { useQuestions } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { TOPICS, QUIZ_CONFIG } from '@/types';
import type { QuizResult } from '@/types';

export function StatsPage() {
  const navigate = useNavigate();
  const { data: questions } = useQuestions();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  const stats = getQuizStatistics();
  const results = getQuizResults();

  const handleNewQuiz = () => {
    if (questions) {
      quizActions.startQuiz(questions);
      navigate({ to: '/quiz' });
    }
  };

  const handleClearHistory = () => {
    clearQuizHistory();
    quizActions.refreshHistory();
    setShowClearDialog(false);
    window.location.reload();
  };

  const handleExport = () => {
    const data = exportQuizHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civitest-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importQuizHistory(content)) {
        window.location.reload();
      } else {
        alert('Erreur lors de l\'importation des données.');
      }
    };
    reader.readAsText(file);
  };

  const trendData = results.slice(0, 20).reverse().map((r, i) => ({
    name: `Quiz ${i + 1}`,
    score: r.percentage,
    passing: QUIZ_CONFIG.passingScore * 100,
  }));

  const topicPerformanceData = TOPICS.map((topic) => {
    const topicResults = results.flatMap((r) =>
      r.topicPerformance.filter((tp) => tp.topicId === topic.id)
    );
    const avgScore =
      topicResults.length > 0
        ? Math.round(
          topicResults.reduce((sum, tp) => sum + tp.percentage, 0) /
          topicResults.length
        )
        : 0;
    return {
      name: topic.nameShort,
      score: avgScore,
      color: topic.color,
    };
  });

  const passFailData = [
    { name: 'Réussis', value: results.filter((r) => r.passed).length, color: '#22C55E' },
    { name: 'Échoués', value: results.filter((r) => !r.passed).length, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  if (results.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pas encore de statistiques</h1>
          <p className="text-muted-foreground mb-6">
            Complétez votre premier quiz pour voir vos statistiques et suivre
            votre progression.
          </p>
          <Button size="lg" onClick={handleNewQuiz}>
            <Play className="mr-2 h-5 w-5" />
            Commencer un quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-7 w-7 text-primary" />
                Statistiques
              </h1>
              <p className="text-muted-foreground">
                Suivez votre progression et analysez vos performances
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Effacer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Quiz complétés"
            value={stats.totalQuizzes.toString()}
            color="blue"
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label="Taux de réussite"
            value={`${stats.passRate}%`}
            color={stats.passRate >= 80 ? 'green' : 'yellow'}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Score moyen"
            value={`${stats.averageScore}%`}
            color={stats.averageScore >= 80 ? 'green' : 'yellow'}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Temps moyen"
            value={formatTimeVerbose(stats.averageTimePerQuiz)}
            color="purple"
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">Progression</TabsTrigger>
            <TabsTrigger value="topics">Par thème</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Progress tab */}
          <TabsContent value="progress">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          stroke="#94A3B8"
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                          stroke="#94A3B8"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="passing"
                          stroke="#94A3B8"
                          strokeDasharray="5 5"
                          dot={false}
                          name="Seuil (80%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#002654"
                          strokeWidth={2}
                          dot={{ fill: '#002654', strokeWidth: 2 }}
                          name="Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pass/Fail distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition réussite/échec</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-75">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passFailData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {passFailData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Topics tab */}
          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Performance par thème</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        stroke="#94A3B8"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="#94A3B8"
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [
                          `${value ?? 0}%`,
                          'Score moyen',
                        ]}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {topicPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Topic breakdown */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {topicPerformanceData.map((topic) => (
                    <div
                      key={topic.name}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: topic.color }}
                        />
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span
                          className={cn('text-2xl font-bold', {
                            'text-green-600': topic.score >= 80,
                            'text-yellow-600':
                              topic.score >= 60 && topic.score < 80,
                            'text-red-600': topic.score < 60,
                          })}
                        >
                          {topic.score}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {topic.score >= 80 ? 'Excellent' : topic.score >= 60 ? 'À améliorer' : 'Réviser'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            result.passed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          )}
                        >
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {result.score}/{result.totalQuestions} (
                            {result.percentage}%)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(result.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Temps: {formatTimeVerbose(result.timeTaken)}
                          </p>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Clear history dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effacer l'historique ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos statistiques et
              résultats de quiz seront supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleClearHistory}>
              Effacer tout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result detail dialog */}
      <Dialog
        open={!!selectedResult}
        onOpenChange={() => setSelectedResult(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du quiz</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {formatDate(selectedResult.date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="font-medium">
                  {selectedResult.score}/{selectedResult.totalQuestions} (
                  {selectedResult.percentage}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Temps</span>
                <span className="font-medium">
                  {formatTimeVerbose(selectedResult.timeTaken)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Résultat</span>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    selectedResult.passed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {selectedResult.passed ? 'Réussi' : 'Échoué'}
                </span>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Performance par thème</h4>
                <div className="space-y-2">
                  {selectedResult.topicPerformance.map((tp) => (
                    <div key={tp.topicId} className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getTopicColor(tp.topicId) }}
                      />
                      <span className="flex-1 text-sm">
                        {getTopicName(tp.topicId, true)}
                      </span>
                      <span
                        className={cn('text-sm font-medium', {
                          'text-green-600': tp.percentage >= 80,
                          'text-red-600': tp.percentage < 80,
                        })}
                      >
                        {tp.correct}/{tp.total} ({tp.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedResult(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
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
