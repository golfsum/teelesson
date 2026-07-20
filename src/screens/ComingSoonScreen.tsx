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

import BrandMark from "@/components/brand-mark";
import GolfLineIcon, { type GolfIconName } from "@/components/GolfLineIcon";
import { colors } from "@/theme";

const CONTACT_EMAIL = "support@teelesson.com";

const features = [
  {
    icon: "dashboard",
    title: "One beautiful booking page",
    body: "Your own custom link. Students see your photo, bio, lesson types, and real-time availability on any device.",
    note: "teelesson.com/mike-reynolds",
  },
  {
    icon: "schedule",
    title: "Smart booking requests",
    body: "Students request lessons that fit your schedule. Approve, decline, or suggest new times in seconds.",
  },
  {
    icon: "students",
    title: "Player roster & CRM",
    body: "Keep lesson history, notes, goals, handicaps, and contact info in one clean place.",
  },
  {
    icon: "analytics",
    title: "Simple dashboard",
    body: "See your week at a glance, track upcoming lessons, and manage student progress between lessons.",
  },
] as const satisfies Array<{
  icon: GolfIconName;
  title: string;
  body: string;
  note?: string;
}>;

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

function UpdatingScreensPreview({ wide }: { wide: boolean }) {
  const cards = [
    { icon: "dashboard" as const, title: "Dashboard", value: "42", label: "Active students" },
    { icon: "video-review" as const, title: "Video Reviews", value: "3", label: "Awaiting review" },
    { icon: "schedule" as const, title: "Schedule", value: "9", label: "Lessons this week" },
  ];

  return (
    <View
      style={{
        width: "100%",
        maxWidth: wide ? 560 : 420,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "rgba(112, 255, 163, 0.2)",
        backgroundColor: "#080d10",
        padding: wide ? 18 : 14,
        shadowColor: "#000",
        shadowOpacity: 0.34,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 16 },
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <View className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
          <View className="h-2.5 w-2.5 rounded-full bg-[#b7f238]" />
        </View>
        <View className="rounded-full border border-[#b7f238]/30 bg-[#b7f238]/10 px-3 py-1">
          <Text className="text-[10px] font-extrabold uppercase tracking-widest text-[#b7f238]">
            Screens updating
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#b7f238]/15">
          <GolfLineIcon name="dashboard" size={30} color="#f6fbf8" accent="#b7f238" muted="#7c918a" strokeWidth={4.8} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-white">Coach workspace</Text>
          <Text className="mt-1 text-xs text-zinc-400">Matching the new TeeLesson dashboard style.</Text>
        </View>
      </View>

      <View className={wide ? "mt-6 flex-row gap-3" : "mt-6 gap-3"}>
        {cards.map((card) => (
          <View
            key={card.title}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
            style={{ flex: 1 }}
          >
            <GolfLineIcon name={card.icon} size={28} color="#f6fbf8" accent="#b7f238" muted="#70817b" strokeWidth={4.8} />
            <Text className="mt-4 text-[11px] font-bold text-zinc-300">{card.title}</Text>
            <Text className="mt-1 text-3xl font-black text-white">{card.value}</Text>
            <Text className="mt-1 text-[10px] font-semibold text-[#b7f238]">↑ {card.label}</Text>
          </View>
        ))}
      </View>

      <View className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-extrabold text-white">Launch checklist</Text>
          <Text className="text-xs font-bold text-[#b7f238]">72%</Text>
        </View>
        {["New logo applied", "Dashboard restyle in progress", "Mobile screens being polished"].map((item, index) => (
          <View key={item} className="mt-3 flex-row items-center gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-[#b7f238]/15">
              <Ionicons name={index === 2 ? "sync" : "checkmark"} size={14} color="#b7f238" />
            </View>
            <Text className="flex-1 text-xs font-semibold text-zinc-300">{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
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
      className="flex-1 bg-[#080b0d]"
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="border-b border-white/10 bg-[#0d1113]"
        style={{ paddingTop: insets.top }}
      >
        <View
          className="mx-auto w-full flex-row items-center justify-between py-5"
          style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
        >
          <BrandMark />

          {isTablet ? (
            <View className="flex-row items-center gap-8">
              <Text className="text-sm font-semibold text-zinc-300">Features</Text>
              <Text className="text-sm font-semibold text-zinc-300">
                How it works
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={scrollToFeatures}
            className="rounded-2xl bg-[#b7f238] px-5 py-3 active:bg-[#92c928]"
          >
            <Text className="text-sm font-bold text-[#080b0d]">Find out more</Text>
          </Pressable>
        </View>
      </View>

      <View className="border-b border-white/10 bg-[#0d1113]">
        <View
          className={isWide ? "mx-auto w-full flex-row items-center gap-12 py-16" : "mx-auto w-full items-center gap-10 py-14"}
          style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
        >
          <View className={isWide ? "flex-1" : "w-full items-center"}>
            <View className="self-start rounded-full border border-[#b7f238]/30 bg-[#b7f238]/10 px-4 py-2">
              <Text className="text-xs font-extrabold uppercase tracking-widest text-[#b7f238]">
                New TeeLesson experience in progress
              </Text>
            </View>
            <Text
              className={isWide ? "mt-6 max-w-4xl font-extrabold tracking-tight text-white" : "mt-6 max-w-4xl text-center font-extrabold tracking-tight text-white"}
              style={{
                fontSize: isWide ? 68 : isTablet ? 54 : 40,
                lineHeight: isWide ? 72 : isTablet ? 60 : 46,
              }}
            >
              Focus on coaching.{"\n"}
              <Text className="text-[#b7f238]">
                We&apos;ll make the rest easier.
              </Text>
            </Text>

            <Text
              className={isWide ? "mt-6 max-w-2xl text-zinc-300" : "mt-6 max-w-2xl text-center text-zinc-300"}
              style={{
                fontSize: isTablet ? 22 : 18,
                lineHeight: isTablet ? 30 : 26,
              }}
            >
              We&apos;re updating TeeLesson with the new forest green dashboard,
              stronger icons, and coach-first screens.
            </Text>

            <View
              className="mt-10 w-full"
              style={{ maxWidth: isTablet ? 560 : undefined }}
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
                  placeholderTextColor="#7f918a"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-base text-white"
                  style={{ flex: isTablet ? 1 : undefined, outlineStyle: "none" as any }}
                />
                <Pressable
                  onPress={() => submitWaitlist("hero-form")}
                  className="items-center justify-center rounded-2xl bg-[#b7f238] px-8 py-4 active:bg-[#92c928]"
                >
                  <Text className="text-base font-bold text-[#080b0d]">Find out more</Text>
                </Pressable>
              </View>
              {error ? (
                <Text className="mt-3 text-center text-sm font-semibold text-red-400">
                  {error}
                </Text>
              ) : (
                <Text className="mt-3 text-center text-xs text-zinc-400">
                  No spam. Email goes to {CONTACT_EMAIL}.
                </Text>
              )}

              {submitted ? (
                <View className="mt-4 rounded-2xl border border-[#b7f238]/25 bg-[#b7f238]/10 p-4">
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.fairway[300]}
                    />
                    <Text className="font-bold text-[#b7f238]">
                      Email draft opened
                    </Text>
                  </View>
                  <Text className="mt-1 text-center text-xs text-[#d8ff8c]">
                    Send it to request early access.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <UpdatingScreensPreview wide={isWide} />
        </View>
      </View>

      <View
        className="mx-auto w-full py-16"
        style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
      >
        <View className="mx-auto max-w-3xl items-center">
          <View className="rounded-full border border-[#b7f238]/30 bg-[#b7f238]/10 px-4 py-1.5">
            <Text className="text-xs font-extrabold uppercase tracking-widest text-[#b7f238]">
              For Golf Coaches
            </Text>
          </View>
          <Text
            className="mt-4 text-center font-extrabold tracking-tight text-white"
            style={{ fontSize: isTablet ? 40 : 30, lineHeight: isTablet ? 46 : 36 }}
          >
            Everything you need.{"\n"}Nothing you don&apos;t.
          </Text>
          <Text className="mt-4 max-w-2xl text-center text-lg leading-7 text-zinc-300">
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
              className="rounded-3xl border border-white/10 bg-white/[0.045] p-7"
              style={{
                width: isWide ? "23.7%" : isTablet ? "47%" : "100%",
                minWidth: isWide ? 250 : undefined,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-[#b7f238]/15">
                <GolfLineIcon
                  name={feature.icon}
                  size={30}
                  color="#f6fbf8"
                  accent="#b7f238"
                  muted="#74847f"
                  strokeWidth={4.8}
                />
              </View>
              <Text className="text-xl font-bold tracking-tight text-white">
                {feature.title}
              </Text>
              <Text className="mt-3 leading-6 text-zinc-300">{feature.body}</Text>
              {"note" in feature ? (
                <Text className="mt-5 text-xs font-semibold text-[#b7f238]">
                  {feature.note}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View className="border-y border-white/10 bg-[#0d1113] py-16">
        <View
          className="mx-auto w-full"
          style={{ maxWidth: 1200, paddingHorizontal: contentPadding }}
        >
          <Text
            className="text-center font-extrabold tracking-tight text-white"
            style={{ fontSize: isTablet ? 40 : 30, lineHeight: isTablet ? 46 : 36 }}
          >
            Get started in minutes.{"\n"}Not weeks.
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-center text-lg leading-7 text-zinc-300">
            Three simple steps to a professional booking experience your students
            will love.
          </Text>

          <View className={isTablet ? "mt-12 flex-row gap-6" : "mt-10 gap-6"}>
            {steps.map((step, index) => (
              <View
                key={step.title}
                className="rounded-3xl border border-white/10 bg-white/[0.045] p-8"
                style={{ flex: 1 }}
              >
                <View className="-mt-12 mb-4 h-9 w-9 items-center justify-center rounded-2xl bg-[#b7f238]">
                  <Text className="text-sm font-extrabold text-[#080b0d]">
                    {index + 1}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-white">{step.title}</Text>
                <Text className="mt-3 leading-6 text-zinc-300">{step.body}</Text>
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
          className="text-center font-extrabold tracking-tight text-white"
          style={{ fontSize: isTablet ? 46 : 34, lineHeight: isTablet ? 52 : 40 }}
        >
          Ready to spend more time teaching?
        </Text>
        <Text className="mt-4 text-center text-xl leading-7 text-zinc-300">
          Be among the first to launch your professional TeeLesson page.
        </Text>
        <Pressable
          onPress={() => openEmail("footer-cta")}
          className="mt-8 rounded-2xl bg-[#b7f238] px-9 py-4 active:bg-[#92c928]"
        >
          <Text className="text-base font-bold text-[#080b0d]">Email TeeLesson</Text>
        </Pressable>
      </View>

      <View className="border-t border-white/10 bg-[#0d1113]">
        <View
          className={isTablet ? "mx-auto w-full flex-row items-center justify-between gap-6 py-10" : "mx-auto w-full gap-6 py-10"}
          style={{ maxWidth: 1480, paddingHorizontal: contentPadding }}
        >
          <BrandMark compact />

          <View className={isTablet ? "flex-row items-center gap-6" : "gap-3"}>
            <Text className="text-sm text-zinc-400">Privacy</Text>
            <Text className="text-sm text-zinc-400">Terms</Text>
            <Text
              className="text-sm font-semibold text-zinc-300"
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
