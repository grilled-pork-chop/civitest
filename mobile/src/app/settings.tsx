/**
 * Settings / About — appearance, haptics, data management, and app info.
 */

import React, { useState } from 'react';
import { View, ScrollView, Switch, Pressable, Linking } from 'react-native';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Download, Upload, Trash2, Monitor, Sun, Moon, ExternalLink } from 'lucide-react-native';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AppText } from '@/components/ui/Text';
import { settingsStore, settingsActions, type ThemePreference } from '@/stores/settingsStore';
import { clearQuizHistory } from '@/utils/storage';
import { exportQuizHistoryFile, importQuizHistoryFile } from '@/services/quizExport';
import { quizActions } from '@/stores/quizStore';
import { queryClient } from '@/lib/queries';
import { toast, SUCCESS_MESSAGES } from '@/services/toast';
import { haptics } from '@/services/haptics';
import { useThemeColors } from '@/theme/useTheme';

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'Système', Icon: Monitor },
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'dark', label: 'Sombre', Icon: Moon },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const theme = useStore(settingsStore, (s) => s.themePreference);
  const hapticsEnabled = useStore(settingsStore, (s) => s.hapticsEnabled);
  const [showClear, setShowClear] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
    quizActions.refreshHistory();
  };

  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <View className="flex-row gap-2">
          {THEME_OPTIONS.map(({ value, label, Icon }) => {
            const active = theme === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  haptics.selection();
                  settingsActions.setThemePreference(value);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Thème ${label}`}
                className={`flex-1 items-center gap-1.5 rounded-xl border py-3 ${
                  active ? 'border-primary bg-primary/10' : 'border-border bg-background'
                }`}
              >
                <Icon size={20} color={active ? c.primary : c.mutedForeground} />
                <AppText
                  size="caption"
                  weight={active ? 'semibold' : 'regular'}
                  className={active ? 'text-primary' : 'text-muted-foreground'}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
        </CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <AppText weight="medium" size="title">
              Retour haptique
            </AppText>
            <AppText size="caption" color="muted">
              Vibrations légères lors des interactions
            </AppText>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={(v) => {
              settingsActions.setHapticsEnabled(v);
              if (v) haptics.selection();
            }}
            trackColor={{ true: c.primary, false: c.border }}
            thumbColor="#ffffff"
          />
        </View>
        <AppText size="caption" color="muted" className="mt-3">
          Les animations respectent automatiquement le réglage « Réduire les
          animations » de votre appareil.
        </AppText>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Données</CardTitle>
        </CardHeader>
        <AppText size="caption" color="muted" className="mb-3">
          Votre historique est stocké uniquement sur cet appareil.
        </AppText>
        <View className="gap-2">
          <Button
            title="Exporter l'historique"
            variant="outline"
            fullWidth
            onPress={exportQuizHistoryFile}
            icon={<Download size={18} color={c.foreground} />}
          />
          <Button
            title="Importer l'historique"
            variant="outline"
            fullWidth
            onPress={() => importQuizHistoryFile(refresh)}
            icon={<Upload size={18} color={c.foreground} />}
          />
          <Button
            title="Effacer l'historique"
            variant="destructive"
            fullWidth
            onPress={() => setShowClear(true)}
            icon={<Trash2 size={18} color={c.destructiveForeground} />}
          />
        </View>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>À propos</CardTitle>
        </CardHeader>
        <AppText size="body" color="muted" className="leading-relaxed mb-3">
          CiviTest vous entraîne à l'examen civique français dans les conditions
          réelles : 40 questions, 45 minutes, 80 % requis. Application 100 %
          hors-ligne.
        </AppText>
        <Pressable
          accessibilityRole="link"
          className="flex-row items-center gap-2 py-1"
          onPress={() =>
            Linking.openURL('https://www.service-public.fr').catch(() => {})
          }
        >
          <ExternalLink size={16} color={c.primary} />
          <AppText weight="medium" className="text-primary">
            service-public.fr
          </AppText>
        </Pressable>
        <AppText size="caption" color="muted" className="mt-3">
          Version {version}
        </AppText>
      </Card>

      <ConfirmDialog
        visible={showClear}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est irréversible."
        confirmLabel="Effacer"
        confirmVariant="destructive"
        onConfirm={() => {
          clearQuizHistory();
          refresh();
          setShowClear(false);
          toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_CLEARED);
        }}
        onCancel={() => setShowClear(false)}
      />
    </ScrollView>
  );
}
