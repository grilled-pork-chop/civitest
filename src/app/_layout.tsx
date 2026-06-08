import '../global.css';

import React, { useCallback } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { queryClient } from '@/lib/queries';
import { ThemeController, useResolvedScheme, useThemeColors } from '@/theme/useTheme';
import { colors, fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

// Shared header styling for the republican-blue stack screens (fixed across
// themes by design, like the home hero). Kept in one place so the three screens
// that use it never drift.
const republicanHeaderOptions = {
  headerStyle: { backgroundColor: colors.republicanBlue },
  headerTintColor: colors.republicanWhite,
  headerTitleStyle: { fontFamily: fonts.display },
  headerShadowVisible: false,
  statusBarStyle: 'light',
} as const;

// Fallback body font for any not-yet-migrated raw <Text>. Migrated components use
// the explicit families in src/components/ui/Text.tsx.
let defaultsApplied = false;
function applyDefaultFont() {
  if (defaultsApplied) return;
  defaultsApplied = true;
  const components: any[] = [RNText, RNTextInput];
  for (const Comp of components) {
    Comp.defaultProps = Comp.defaultProps || {};
    Comp.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, Comp.defaultProps.style];
    Comp.defaultProps.maxFontSizeMultiplier = 1.6;
  }
}

function AppNavigator() {
  const c = useThemeColors();
  const scheme = useResolvedScheme();
  const dynamicStyle = scheme === 'dark' ? 'light' : 'dark';
  // Status bar style is declared per screen below. A global <StatusBar> here
  // would re-apply on theme resolution and override the focused screen's style.
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: c.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: 'light' }} />
      <Stack.Screen name="quiz" options={{ headerShown: false, gestureEnabled: false, statusBarStyle: dynamicStyle }} />
      <Stack.Screen name="stats" options={{ title: 'Statistiques', ...republicanHeaderOptions }} />
      <Stack.Screen name="settings" options={{ title: 'Réglages', ...republicanHeaderOptions }} />
      <Stack.Screen name="guide" options={{ title: 'Le guide', ...republicanHeaderOptions }} />
      <Stack.Screen name="review" options={{ headerShown: false, statusBarStyle: dynamicStyle }} />
      <Stack.Screen name="review/[quizId]" options={{ headerShown: false, statusBarStyle: dynamicStyle }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (fontsLoaded) applyDefaultFont();

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <ThemeController />
            <AppNavigator />
            <Toast topOffset={60} />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
