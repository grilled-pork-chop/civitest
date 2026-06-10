/**
 * Theme access. NativeWind drives the active color scheme (so className tokens
 * like `bg-card` switch via CSS variables); these hooks expose the matching
 * inline-style palette and keep NativeWind in sync with the user's preference.
 */

import { useEffect } from 'react';
import { useColorScheme, colorScheme } from 'nativewind';
import { useStore } from '@tanstack/react-store';
import { lightColors, darkColors, type ThemeColors } from './tokens';
import { settingsStore } from '@/stores/settingsStore';

/** Resolved scheme ('light' | 'dark'). */
export function useResolvedScheme(): 'light' | 'dark' {
  const { colorScheme: scheme } = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

/** Active inline-style color palette for the current scheme. */
export function useThemeColors(): ThemeColors {
  return useResolvedScheme() === 'dark' ? darkColors : lightColors;
}

/**
 * Keeps NativeWind's color scheme in sync with the persisted user preference.
 * Render once near the app root.
 */
export function ThemeController() {
  const pref = useStore(settingsStore, (s) => s.themePreference);
  useEffect(() => {
    colorScheme.set(pref);
  }, [pref]);
  return null;
}
