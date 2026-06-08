/**
 * Centralized haptics — respects the user's "haptics" setting so feedback can be
 * silenced app-wide. All call sites should use this instead of expo-haptics
 * directly.
 */

import * as Haptics from 'expo-haptics';
import { settingsStore } from '@/stores/settingsStore';

function enabled(): boolean {
  return settingsStore.state.hapticsEnabled;
}

const impactStyle = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
} as const;

const notifyType = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
} as const;

export const haptics = {
  selection() {
    if (enabled()) Haptics.selectionAsync().catch(() => {});
  },
  impact(style: keyof typeof impactStyle = 'light') {
    if (enabled()) Haptics.impactAsync(impactStyle[style]).catch(() => {});
  },
  notify(type: keyof typeof notifyType) {
    if (enabled()) Haptics.notificationAsync(notifyType[type]).catch(() => {});
  },
};
