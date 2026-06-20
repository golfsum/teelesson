import "./global.css";

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/useAuth";
import RootNavigator from "@/navigation/RootNavigator";
import ComingSoonScreen from "@/screens/ComingSoonScreen";

/**
 * Pre-launch holding page. Set EXPO_PUBLIC_COMING_SOON=1 in the production
 * (Vercel) environment to show the coming-soon page instead of the full app.
 * Leave it unset locally to work on the real app. Remove the var + redeploy to
 * go live.
 */
const COMING_SOON = process.env.EXPO_PUBLIC_COMING_SOON === "1";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {COMING_SOON ? (
          <ComingSoonScreen />
        ) : (
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </QueryClientProvider>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
