import React, { useState } from 'react';
import { View, ScrollView, Switch, Pressable } from 'react-native';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Monitor, Sun, Moon, Heart, ChevronRight } from 'lucide-react-native';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Text';
import { settingsStore, settingsActions, type ThemePreference } from '@/stores/settingsStore';
import { haptics } from '@/services/haptics';
import { useThemeColors } from '@/theme/useTheme';
import DonationSheet from '@/components/DonationSheet';

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
  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';
  const [showDonation, setShowDonation] = useState(false);
  const [supportPressed, setSupportPressed] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >

      {/* Support — featured banner so it stands out from the plain setting cards. */}
      <View className="rounded-2xl shadow-sm shadow-black/10">
        <View className="rounded-2xl overflow-hidden">
          <Pressable
            onPress={() => {
              haptics.selection();
              setShowDonation(true);
            }}
            onPressIn={() => setSupportPressed(true)}
            onPressOut={() => setSupportPressed(false)}
            accessibilityRole="button"
            accessibilityLabel="Soutenir CiviTest"
            // Plain RN Pressable (no NativeWind className) so the style object is kept.
            style={{ backgroundColor: supportPressed ? '#b30f21' : '#ce1126' }}
          >
            <View className="flex-row items-center gap-3.5 p-4">
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Heart size={20} color="#ffffff" fill="#ffffff" />
              </View>
              <View className="flex-1">
                <AppText weight="semibold" size="title" className="text-white">
                  Soutenir CiviTest
                </AppText>
                <AppText size="caption" className="text-white/80">
                  Offrir un café au développeur
                </AppText>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </Pressable>
        </View>
      </View>
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

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>À propos</CardTitle>
        </CardHeader>
        <AppText size="body" color="muted" className="leading-relaxed mb-3">
          CiviTest est une application d'entraînement gratuite et 100 %
          hors-ligne. Vos résultats restent sur votre appareil. Aucune donnée
          n'est collectée ni partagée.
        </AppText>
        <AppText size="caption" color="muted">
          Version {version}
        </AppText>
        <View className="mt-4 pt-4 border-t border-border">
          <AppText size="caption" color="muted" className="leading-relaxed">
            Application indépendante, non officielle et non agréée par le
            gouvernement français. CiviTest n'est affilié à aucune autorité
            publique. Les questions sont fournies à titre d'entraînement
            uniquement et ne constituent pas un document officiel.
          </AppText>
        </View>
      </Card>

      {showDonation && <DonationSheet onClose={() => setShowDonation(false)} />}
    </ScrollView>
  );
}
