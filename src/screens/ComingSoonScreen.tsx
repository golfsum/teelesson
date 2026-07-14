/**
 * ComingSoonScreen
 *
 * Full-screen holding page shown when EXPO_PUBLIC_COMING_SOON is true.
 * It intentionally has no auth, navigation, or data dependencies.
 */
import React, { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

const CONTACT_EMAIL = "support@teelesson.com";

const features = [
  {
    icon: "link-outline",
    title: "One beautiful booking page",
    body: "Your own custom link. Students see your photo, bio, lesson types, and real-time availability on any device.",
    note: "teelesson.com/mike-reynolds",
  },
  {
    icon: "calendar-outline",
    title: "Smart booking requests",
    body: "Students request lessons that fit your schedule. Approve, decline, or suggest new times in seconds.",
  },
  {
    icon: "people-outline",
    title: "Player roster & CRM",
    body: "Keep lesson history, notes, goals, handicaps, and contact info in one clean place.",
  },
  {
    icon: "trending-up-outline",
    title: "Simple dashboard",
    body: "See your week at a glance, track upcoming lessons, and manage student progress between lessons.",
  },
] as const;

const steps = [
  {
    title: "Create your profile",
    body: "Add your photo, bio, lesson offerings, pricing, and availability.",
  },
  {
    title: "Share your link",
    body: "Put your TeeLesson page on your website, email signature, and social profiles.",
  },
  {
    title: "Manage and grow",
    body: "Approve requests from your phone, build your roster, and keep your week organized.",
  },
] as const;

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export default function ComingSoonScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isWide = width >= 900;
  const isTablet = width >= 700;
  const contentPadding = isWide ? 48 : isTablet ? 32 : 20;
  const year = useMemo(() => new Date().getFullYear(), []);

  const openEmail = (source: string) => {
    const trimmedEmail = email.trim();
    const subject = "Early access to TeeLesson";
    const body = trimmedEmail
      ? `Hi TeeLesson,\n\nI'd like to learn more about early access.\n\nMy email: ${trimmedEmail}\n\nSource: ${source}`
      : `Hi TeeLesson,\n\nI'd like to learn more about early access.\n\nSource: ${source}`;

    Linking.openURL(
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    ).catch(() => {
      // Some browsers and simulators do not have a configured mail client.
    });
  };

  const submitWaitlist = (source: string) => {
    if (!isEmail(email)) {
      setSubmitted(false);
      setError("Enter a valid email so we know where to reply.");
      return;
    }

    setError("");
    setSubmitted(true);
    openEmail(source);
  };

  const scrollToFeatures = () => {
    // On native, anchor scrolling is not available without a ref per section.
    // The button still keeps the same CTA behavior by moving to email contact.
    openEmail("nav-find-out-more");
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="border-b border-zinc-200 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <View
          className="mx-auto w-full flex-row items-center justify-between py-5"
          style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600">
              <Ionicons name="golf-outline" size={23} color={colors.white} />
            </View>
            <Text className="text-2xl font-extrabold tracking-tight text-zinc-950">
              TeeLesson
            </Text>
          </View>

          {isTablet ? (
            <View className="flex-row items-center gap-8">
              <Text className="text-sm font-semibold text-zinc-600">Features</Text>
              <Text className="text-sm font-semibold text-zinc-600">
                How it works
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={scrollToFeatures}
            className="rounded-2xl bg-emerald-600 px-5 py-3 active:bg-emerald-800"
          >
            <Text className="text-sm font-bold text-white">Find out more</Text>
          </Pressable>
        </View>
      </View>

      <View className="border-b border-zinc-100 bg-zinc-50/40">
        <View
          className="mx-auto w-full items-center py-16"
          style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
        >
          <Text
            className="max-w-4xl text-center font-extrabold tracking-tight text-zinc-950"
            style={{
              fontSize: isWide ? 68 : isTablet ? 54 : 40,
              lineHeight: isWide ? 72 : isTablet ? 60 : 46,
            }}
          >
            Focus on coaching.{"\n"}
            <Text className="text-emerald-600">
              We&apos;ll make the rest easier.
            </Text>
          </Text>

          <Text
            className="mt-6 max-w-2xl text-center text-zinc-600"
            style={{
              fontSize: isTablet ? 22 : 18,
              lineHeight: isTablet ? 30 : 26,
            }}
          >
            One beautiful booking page. Smart scheduling and roster tools. So you
            can spend more time teaching.
          </Text>

          <View
            className="mt-10 w-full"
            style={{ maxWidth: isTablet ? 520 : undefined }}
          >
            <View className={isTablet ? "flex-row gap-3" : "gap-3"}>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="your@coach.com"
                placeholderTextColor="#a1a1aa"
                className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-950"
                style={{ flex: isTablet ? 1 : undefined }}
              />
              <Pressable
                onPress={() => submitWaitlist("hero-form")}
                className="items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 active:bg-emerald-800"
              >
                <Text className="text-base font-bold text-white">Find out more</Text>
              </Pressable>
            </View>
            {error ? (
              <Text className="mt-3 text-center text-sm font-semibold text-red-600">
                {error}
              </Text>
            ) : (
              <Text className="mt-3 text-center text-xs text-zinc-500">
                No spam. Email goes to {CONTACT_EMAIL}.
              </Text>
            )}

            {submitted ? (
              <View className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.fairway[600]}
                  />
                  <Text className="font-bold text-emerald-700">
                    Email draft opened
                  </Text>
                </View>
                <Text className="mt-1 text-center text-xs text-emerald-700">
                  Send it to request early access.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View
        className="mx-auto w-full py-16"
        style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
      >
        <View className="mx-auto max-w-3xl items-center">
          <View className="rounded-full bg-emerald-100 px-4 py-1.5">
            <Text className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              For Golf Coaches
            </Text>
          </View>
          <Text
            className="mt-4 text-center font-extrabold tracking-tight text-zinc-950"
            style={{ fontSize: isTablet ? 40 : 30, lineHeight: isTablet ? 46 : 36 }}
          >
            Everything you need.{"\n"}Nothing you don&apos;t.
          </Text>
          <Text className="mt-4 max-w-2xl text-center text-lg leading-7 text-zinc-600">
            Purpose-built tools that help independent golf instructors spend less
            time on admin and more time on the range.
          </Text>
        </View>

        <View
          className="mt-12 flex-row flex-wrap justify-center gap-5"
          style={{ rowGap: 20 }}
        >
          {features.map((feature) => (
            <View
              key={feature.title}
              className="rounded-3xl border border-zinc-200 bg-white p-7"
              style={{
                width: isWide ? "23.7%" : isTablet ? "47%" : "100%",
                minWidth: isWide ? 250 : undefined,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Ionicons
                  name={feature.icon}
                  size={25}
                  color={colors.fairway[600]}
                />
              </View>
              <Text className="text-xl font-bold tracking-tight text-zinc-950">
                {feature.title}
              </Text>
              <Text className="mt-3 leading-6 text-zinc-600">{feature.body}</Text>
              {"note" in feature ? (
                <Text className="mt-5 text-xs font-semibold text-emerald-600">
                  {feature.note}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View className="border-y border-zinc-100 bg-zinc-50 py-16">
        <View
          className="mx-auto w-full"
          style={{ maxWidth: 1200, paddingHorizontal: contentPadding }}
        >
          <Text
            className="text-center font-extrabold tracking-tight text-zinc-950"
            style={{ fontSize: isTablet ? 40 : 30, lineHeight: isTablet ? 46 : 36 }}
          >
            Get started in minutes.{"\n"}Not weeks.
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-center text-lg leading-7 text-zinc-600">
            Three simple steps to a professional booking experience your students
            will love.
          </Text>

          <View className={isTablet ? "mt-12 flex-row gap-6" : "mt-10 gap-6"}>
            {steps.map((step, index) => (
              <View
                key={step.title}
                className="rounded-3xl border border-zinc-200 bg-white p-8"
                style={{ flex: 1 }}
              >
                <View className="-mt-12 mb-4 h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600">
                  <Text className="text-sm font-extrabold text-white">
                    {index + 1}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-zinc-950">{step.title}</Text>
                <Text className="mt-3 leading-6 text-zinc-600">{step.body}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View
        className="mx-auto w-full items-center py-16"
        style={{ maxWidth: 900, paddingHorizontal: contentPadding }}
      >
        <Text
          className="text-center font-extrabold tracking-tight text-zinc-950"
          style={{ fontSize: isTablet ? 46 : 34, lineHeight: isTablet ? 52 : 40 }}
        >
          Ready to spend more time teaching?
        </Text>
        <Text className="mt-4 text-center text-xl leading-7 text-zinc-600">
          Be among the first to launch your professional TeeLesson page.
        </Text>
        <Pressable
          onPress={() => openEmail("footer-cta")}
          className="mt-8 rounded-2xl bg-emerald-600 px-9 py-4 active:bg-emerald-800"
        >
          <Text className="text-base font-bold text-white">Email TeeLesson</Text>
        </Pressable>
      </View>

      <View className="border-t border-zinc-100 bg-white">
        <View
          className={isTablet ? "mx-auto w-full flex-row items-center justify-between gap-6 py-10" : "mx-auto w-full gap-6 py-10"}
          style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="golf-outline" size={22} color={colors.fairway[600]} />
            <Text className="text-lg font-extrabold text-zinc-950">TeeLesson</Text>
          </View>

          <View className={isTablet ? "flex-row items-center gap-6" : "gap-3"}>
            <Text className="text-sm text-zinc-500">Privacy</Text>
            <Text className="text-sm text-zinc-500">Terms</Text>
            <Text
              className="text-sm font-semibold text-zinc-600"
              onPress={() => openEmail("footer-email")}
            >
              {CONTACT_EMAIL}
            </Text>
          </View>

          <Text className="text-xs text-zinc-500">
            Copyright {year} TeeLesson. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
