import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold, useFonts } from "@expo-google-fonts/outfit";
import "@i18n";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import { ErrorBoundary } from "@components/ui/ErrorBoundary";


import { useStore } from "@store/useStore";
import { useColorScheme } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { session, checkSession, initAuthListener, loadSettings, themeMode, hasSeenOnboarding } = useStore();
  const systemColorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await checkSession();
        await loadSettings();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  const effectiveTheme = themeMode === "system" ? systemColorScheme : themeMode;

  useEffect(() => {
    if (isAppReady && fontsLoaded) {
       SplashScreen.hideAsync();
    }
  }, [isAppReady, fontsLoaded]);

  useEffect(() => {
    if (!isAppReady || !fontsLoaded) return;

    if (!hasSeenOnboarding) {
        router.replace("/onboarding");
        return;
    }

    if (!session) return;
    const inAuthGroup = (segments[0] as string) === "(auth)";

    // Redirect authenticated users away from the auth screens (login)
    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, router, isAppReady, fontsLoaded, hasSeenOnboarding]);

  if (!isAppReady || !fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={effectiveTheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <ErrorBoundary>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="deck/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="deck/[id]/cards"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="review/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="community-import/[deckId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="community-person/[userId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{
              title: "Edit Profile",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="change-password"
            options={{
              title: "Change Password",
              headerShown: false,
            }}
          />
        </Stack>
        </ErrorBoundary>
        <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
