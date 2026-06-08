import '../global.css';

import React, { useCallback } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

SplashScreen.preventAutoHideAsync();

// React Native text does not inherit fonts, so set Inter as the global default
// once. Headings opt into the Playfair display serif explicitly.
let defaultsApplied = false;
function applyDefaultFont() {
  if (defaultsApplied) return;
  defaultsApplied = true;
  const components: any[] = [RNText, RNTextInput];
  for (const Comp of components) {
    Comp.defaultProps = Comp.defaultProps || {};
    Comp.defaultProps.style = [
      { fontFamily: 'Inter_400Regular' },
      Comp.defaultProps.style,
    ];
    Comp.defaultProps.allowFontScaling = true;
    Comp.defaultProps.maxFontSizeMultiplier = 1.6;
  }
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
            <StatusBar style="dark" />
            <Stack screenOptions={{ contentStyle: { backgroundColor: '#ffffff' } }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="quiz"
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="stats"
                options={{
                  title: 'Statistiques',
                  headerStyle: { backgroundColor: '#002654' },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: { fontFamily: 'PlayfairDisplay_700Bold' },
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen name="review" options={{ headerShown: false }} />
              <Stack.Screen name="review/[quizId]" options={{ headerShown: false }} />
            </Stack>
            <Toast topOffset={60} />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
