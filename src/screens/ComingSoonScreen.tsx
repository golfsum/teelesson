/**
 * ComingSoonScreen
 *
 * Full-screen holding page shown in production while the app is pre-launch.
 * Gated in App.tsx by the EXPO_PUBLIC_COMING_SOON flag, so it has no auth /
 * navigation / data dependencies — it renders on its own.
 */
import React from "react";
import { Linking, Pressable, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

const CONTACT_EMAIL = "support@teelesson.com";

export default function ComingSoonScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 700;
  const year = new Date().getFullYear();

  const openEmail = () => {
    Linking.openURL(
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Early access to TeeLesson")}`
    ).catch(() => {
      // No mail client available (e.g. some browsers) — fail quietly.
    });
  };

  return (
    <View
      className="flex-1 items-center justify-center bg-fairway-700 px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="w-full items-center" style={{ maxWidth: 560 }}>
        {/* Brand */}
        <View className="mb-8 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-fairway-500">
            <Ionicons name="golf-outline" size={26} color={colors.white} />
          </View>
          <Text className="text-2xl font-extrabold tracking-tight text-white">
            TeeLesson
          </Text>
        </View>

        {/* Pill */}
        <View className="mb-5 rounded-full bg-fairway-600 px-4 py-1.5">
          <Text className="text-xs font-bold uppercase tracking-widest text-sand-200">
            Coming Soon
          </Text>
        </View>

        {/* Headline */}
        <Text
          className="text-center font-extrabold text-white"
          style={{ fontSize: isWide ? 44 : 32, lineHeight: isWide ? 50 : 38 }}
        >
          Coaching, minus the chaos.
        </Text>

        {/* Subtext */}
        <Text className="mt-4 text-center text-base leading-relaxed text-fairway-100">
          A simpler way for golf coaches to manage their roster, take lesson
          booking requests, and share one booking page. We&apos;re putting on the
          finishing touches — launching soon.
        </Text>

        {/* CTA */}
        <Pressable
          onPress={openEmail}
          className="mt-8 flex-row items-center gap-2 rounded-2xl bg-sand-200 px-6 py-3.5 active:opacity-90"
        >
          <Ionicons name="mail-outline" size={18} color={colors.fairway[700]} />
          <Text className="text-base font-bold text-fairway-800">
            Request early access
          </Text>
        </Pressable>

        <Text className="mt-3 text-sm text-fairway-200">
          Or email us at{" "}
          <Text className="font-semibold text-white" onPress={openEmail}>
            {CONTACT_EMAIL}
          </Text>
        </Text>
      </View>

      {/* Footer */}
      <Text className="absolute bottom-6 text-xs text-fairway-300">
        © {year} TeeLesson
      </Text>
    </View>
  );
}
