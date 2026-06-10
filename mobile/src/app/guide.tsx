/**
 * Guide screen — always-available reference: exam overview, the 5 themes, and
 * preparation tips. Reached from the Home hero (and any time via the header).
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Text';
import { TOPICS } from '@/types';

const TIPS = [
  'Lisez attentivement chaque question',
  'Gérez bien votre temps (env. 1 min/question)',
  'Répondez à toutes les questions',
  'Entraînez-vous régulièrement',
];

export default function GuideScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Exam overview */}
      <Card>
        <CardHeader>
          <CardTitle>À propos de l’examen</CardTitle>
        </CardHeader>
        <View className="flex-row">
          <ExamStat value="40" label="questions" />
          <Divider />
          <ExamStat value="45" label="minutes" />
          <Divider />
          <ExamStat value="80%" label="requis" />
        </View>
        <AppText size="body" className="mt-4 leading-relaxed">
          L’examen civique est obligatoire pour la naturalisation française et certains titres de
          séjour. Il évalue votre connaissance des valeurs, principes et institutions de la
          République. Une seule bonne réponse par question ; 32/40 (80 %) minimum pour réussir.
        </AppText>
      </Card>

      {/* The 5 themes */}
      <Card>
        <CardHeader>
          <CardTitle>Les 5 thèmes</CardTitle>
        </CardHeader>
        <View className="gap-3">
          {TOPICS.map((topic) => (
            <View key={topic.id} className="flex-row items-center gap-3">
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: topic.color }} />
              <View className="flex-1">
                <AppText weight="medium">{topic.nameShort}</AppText>
                <AppText size="caption" color="muted">
                  ~{topic.targetCount} questions
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils</CardTitle>
        </CardHeader>
        {TIPS.map((tip) => (
          <View key={tip} className="flex-row gap-2 mb-2">
            <AppText color="primary">•</AppText>
            <AppText size="body" className="flex-1">
              {tip}
            </AppText>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function ExamStat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-3xl font-display text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground mt-1">{label}</Text>
    </View>
  );
}

function Divider() {
  return <View className="w-px self-stretch bg-border my-1" />;
}
