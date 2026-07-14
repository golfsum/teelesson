import "./global.css";

import React from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/useAuth";
import RootNavigator from "@/navigation/RootNavigator";
import ComingSoonScreen from "@/screens/ComingSoonScreen";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Pre-launch holding page. Set EXPO_PUBLIC_COMING_SOON=true in the production
 * (Vercel) environment to show the coming-soon page instead of the full app.
 * Leave it unset locally to work on the real app. Remove the var + redeploy to
 * go live.
 */
const comingSoonFlag = process.env.EXPO_PUBLIC_COMING_SOON?.toLowerCase();
const COMING_SOON = comingSoonFlag === "1" || comingSoonFlag === "true";

export default function App() {
  // Preload the icon font so glyphs render correctly on the first frame
  // (native loads fonts lazily, which made icons look off vs. web).
  const [fontsLoaded] = useFonts(Ionicons.font);

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#031d18" }} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ErrorBoundary>
          {COMING_SOON ? (
            <ComingSoonScreen />
          ) : (
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RootNavigator />
              </AuthProvider>
            </QueryClientProvider>
          )}
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
