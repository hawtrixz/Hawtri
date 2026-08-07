import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "@/context/AppContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ai" options={{ presentation: "modal" }} />
      <Stack.Screen name="development" />
      <Stack.Screen name="map" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="network/index" />
      <Stack.Screen name="network/tree" />
      <Stack.Screen name="messages/index" />
      <Stack.Screen name="messages/[id]" />
      <Stack.Screen name="providers/[id]" />
      <Stack.Screen name="training/[id]" />
      <Stack.Screen name="training/lesson" />
      <Stack.Screen name="opportunities/[id]" />
      <Stack.Screen name="tools/index" />
      <Stack.Screen name="tools/cv" />
      <Stack.Screen name="tools/devis" />
      <Stack.Screen name="tools/facture" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
