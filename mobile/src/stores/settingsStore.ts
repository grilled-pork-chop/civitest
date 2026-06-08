/**
 * User settings — theme preference and haptics toggle.
 * Persisted locally (offline) via expo-sqlite's synchronous kv-store.
 */

import { Store } from '@tanstack/react-store';
import Storage from 'expo-sqlite/kv-store';
import { logger } from '@/services/logger';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  themePreference: ThemePreference;
  hapticsEnabled: boolean;
}

const KEY = 'civitest_settings';

const DEFAULTS: Settings = {
  themePreference: 'system',
  hapticsEnabled: true,
};

function load(): Settings {
  try {
    const raw = Storage.getItemSync(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (error) {
    logger.warn('Failed to read settings', {}, error as Error);
    return DEFAULTS;
  }
}

function persist(settings: Settings): void {
  try {
    Storage.setItemSync(KEY, JSON.stringify(settings));
  } catch (error) {
    logger.warn('Failed to save settings', {}, error as Error);
  }
}

export const settingsStore = new Store<Settings>(load());

export const settingsActions = {
  setThemePreference(themePreference: ThemePreference) {
    settingsStore.setState((s) => {
      const next = { ...s, themePreference };
      persist(next);
      return next;
    });
  },
  setHapticsEnabled(hapticsEnabled: boolean) {
    settingsStore.setState((s) => {
      const next = { ...s, hapticsEnabled };
      persist(next);
      return next;
    });
  },
};
