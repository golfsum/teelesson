/**
 * LandingScreen — Marketing landing page for TeeLesson.
 * Web-first (maxWidth 1100), but renders cleanly on iOS / Android too.
 * AuthStack navigation -> Login | Signup
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "@/components/ui";
import type { AuthStackParamList } from "@/navigation/types";
import { colors } from "@/theme";

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

// ---------- data -------------------------------------------------------

const BENEFITS = [
  {
    icon: "calendar-outline" as const,
    title: "Smart Scheduling",
    desc: "Set availability, accept bookings, and eliminate double-ups in seconds.",
  },
  {
    icon: "people-outline" as const,
    title: "Player CRM",
    desc: "Track every student's history, goals, and progress in one place.",
  },
  {
    icon: "checkmark-done-outline" as const,
    title: "Booking Requests",
    desc: "Players request, you approve or decline with one tap — no more phone tag.",
  },
  {
    icon: "cash-outline" as const,
    title: "Payment Tracking",
    desc: "Mark lessons paid as you go so you always know who still owes you.",
  },
  {
    icon: "globe-outline" as const,
    title: "Public Booking Page",
    desc: "A shareable coaching page that lets new students find and book you online.",
  },
];

const FEATURES = [
  {
    icon: "calendar-outline" as const,
    title: "Lesson Booking System",
    desc: "Real-time availability calendar and one-tap approvals keep your schedule full without the back-and-forth.",
  },
  {
    icon: "people-outline" as const,
    title: "Player Management",
    desc: "Detailed profiles, progress notes, lesson history, and goal tracking for every student on your roster.",
  },
  {
    icon: "checkmark-done-outline" as const,
    title: "Approve in One Tap",
    desc: "Every booking request lands in one place — approve or decline instantly and the player is notified.",
  },
  {
    icon: "cash-outline" as const,
    title: "Payment Tracking",
    desc: "A simple paid/unpaid toggle per lesson so collecting from students never slips through the cracks.",
  },
  {
    icon: "person-circle-outline" as const,
    title: "Public Booking Page",
    desc: "A polished page with your bio, credentials, and booking link — your digital first impression and SEO front door.",
  },
  {
    icon: "phone-portrait-outline" as const,
    title: "Works Everywhere",
    desc: "One responsive web app that runs on phone, tablet, and desktop. Coach from the range or the office.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "TeeLesson completely transformed how I run my coaching business. I used to live in text messages and a paper calendar, chasing students to confirm times and remember who'd paid. Now bookings come in, I approve them in a tap, and I can see at a glance who still owes me.",
    name: "John M.",
    title: "PGA Teaching Professional",
    location: "Phoenix, AZ",
  },
  {
    quote:
      "As an independent coach I was drowning in admin. This app gave me back my afternoons. Players book through my page, I approve the slots that work, and the roster keeps every student's goals and history in one place.",
    name: "Sarah K.",
    title: "Independent Golf Coach",
    location: "",
  },
];

const PRICING = [
  {
    tier: "Basic",
    price: "$29",
    period: "/mo",
    highlights: [
      "Up to 20 active students",
      "Lesson scheduling & booking",
      "Player CRM & lesson history",
      "Payment tracking",
    ],
    cta: "Start Free Trial",
  },
  {
    tier: "Pro",
    price: "$79",
    period: "/mo",
    highlights: [
      "Unlimited students",
      "Public booking page",
      "Recurring & one-off availability",
      "Priority support",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
];

// ---------- small shared atoms -----------------------------------------

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="text-fairway-600 font-bold text-sm uppercase tracking-widest mb-2 text-center">
      {text}
    </Text>
  );
}

function SectionHeading({ text, light }: { text: string; light?: boolean }) {
  return (
    <Text
      className={`text-2xl font-extrabold text-center mb-4 ${
        light ? "text-white" : "text-ink-900"
      }`}
    >
      {text}
    </Text>
  );
}

function SectionSubtext({ text, light }: { text: string; light?: boolean }) {
  return (
    <Text
      className={`text-base text-center max-w-xl self-center mb-10 ${
        light ? "text-fairway-100" : "text-ink-500"
      }`}
    >
      {text}
    </Text>
  );
}

// ---------- section components -----------------------------------------

function HeroSection({ onGetStarted, onDemo }: { onGetStarted: () => void; onDemo: () => void }) {
  return (
    <View className="bg-fairway-700 w-full px-6 py-16 items-center">
      {/* Brand wordmark */}
      <View className="flex-row items-center mb-6 gap-2">
        <Ionicons name="golf-outline" size={32} color={colors.fairway[300]} />
        <Text className="text-fairway-300 font-extrabold text-xl tracking-tight">
          TeeLesson
        </Text>
      </View>

      <Text className="text-white font-extrabold text-3xl text-center leading-tight mb-5 max-w-2xl">
        The All-in-One Platform for Serious Golf Coaches
      </Text>

      <Text className="text-fairway-100 text-base text-center max-w-xl mb-10 leading-relaxed">
        Stop juggling text messages and a paper calendar. Manage your roster,
        take booking requests, and track who's paid — all in one simple,
        easy-to-use app built for golf professionals.
      </Text>

      <View className="flex-row flex-wrap gap-3 justify-center">
        <Button
          title="Get Started Free – 14 Days"
          variant="primary"
          size="lg"
          onPress={onGetStarted}
          className="bg-white"
        />
        <Button
          title="Watch 2-Min Demo"
          variant="outline"
          size="lg"
          onPress={onDemo}
          className="border-white"
        />
      </View>
    </View>
  );
}

function ProblemSection() {
  return (
    <View className="w-full px-6 py-14 items-center bg-ink-50">
      <SectionLabel text="Why TeeLesson" />
      <SectionHeading text="Tired of chaotic coaching schedules and lost student progress?" />
      <SectionSubtext text="You got into golf coaching to teach — not to manage admin. TeeLesson handles the business side so you can focus on the lesson tee." />

      <View className="flex-row flex-wrap gap-4 justify-center w-full">
        {BENEFITS.map((b) => (
          <Card key={b.title} className="p-5 items-center w-64 flex-grow-0">
            <View className="w-12 h-12 rounded-2xl bg-fairway-100 items-center justify-center mb-3">
              <Ionicons name={b.icon} size={24} color={colors.fairway[600]} />
            </View>
            <Text className="text-ink-900 font-bold text-base mb-1 text-center">
              {b.title}
            </Text>
            <Text className="text-ink-500 text-sm text-center leading-relaxed">
              {b.desc}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

function FeaturesSection({ columns }: { columns: number }) {
  return (
    <View className="w-full px-6 py-14 items-center bg-white">
      <SectionLabel text="Features" />
      <SectionHeading text="Built for Golf Coaches" />
      <SectionSubtext text="Everything you need to run a professional coaching business — nothing you don't." />

      {/* Responsive grid: wrap into rows of `columns` */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
          width: "100%",
        }}
      >
        {FEATURES.map((f) => (
          <View
            key={f.title}
            style={{ width: columns === 3 ? "30%" : "100%", minWidth: 260 }}
          >
            <Card className="p-5 h-full">
              <View className="w-11 h-11 rounded-xl bg-fairway-50 items-center justify-center mb-3">
                <Ionicons name={f.icon} size={22} color={colors.fairway[600]} />
              </View>
              <Text className="text-ink-900 font-bold text-base mb-2">
                {f.title}
              </Text>
              <Text className="text-ink-500 text-sm leading-relaxed">
                {f.desc}
              </Text>
            </Card>
          </View>
        ))}
      </View>
    </View>
  );
}

function TestimonialsSection() {
  return (
    <View className="w-full px-6 py-14 items-center bg-fairway-50">
      <SectionLabel text="Testimonials" />
      <SectionHeading text="Coaches are loving it" />

      <View className="flex-row flex-wrap gap-5 justify-center w-full">
        {TESTIMONIALS.map((t) => (
          <View key={t.name} style={{ flex: 1, minWidth: 280, maxWidth: 500 }}>
            <Card className="p-6 h-full">
              {/* Open-quote decoration */}
              <Text className="text-fairway-300 text-5xl font-extrabold leading-none mb-2">
                "
              </Text>
              <Text className="text-ink-700 text-sm leading-relaxed mb-5 italic">
                {t.quote}
              </Text>
              <View className="flex-row items-center gap-3 mt-auto">
                <View className="w-10 h-10 rounded-full bg-fairway-600 items-center justify-center">
                  <Text className="text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text className="text-ink-900 font-bold text-sm">{t.name}</Text>
                  <Text className="text-ink-500 text-xs">
                    {t.title}
                    {t.location ? ` · ${t.location}` : ""}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ))}
      </View>
    </View>
  );
}

function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <View className="w-full px-6 py-14 items-center bg-white">
      <SectionLabel text="Pricing" />
      <SectionHeading text="Start Free. Grow with Confidence." />
      <SectionSubtext text="14-day free trial on every plan. No credit card required." />

      <View className="flex-row flex-wrap gap-5 justify-center w-full">
        {PRICING.map((p) => (
          <View key={p.tier} style={{ flex: 1, minWidth: 260, maxWidth: 380 }}>
            <Card
              className={`p-7 h-full ${
                p.featured
                  ? "border-2 border-fairway-600"
                  : "border border-ink-200"
              }`}
            >
              {p.featured && (
                <View className="bg-fairway-600 rounded-full px-3 py-1 self-start mb-3">
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </Text>
                </View>
              )}
              <Text className="text-ink-900 font-extrabold text-xl mb-1">
                {p.tier}
              </Text>
              <View className="flex-row items-end gap-1 mb-5">
                <Text
                  className={`font-extrabold text-4xl ${
                    p.featured ? "text-fairway-600" : "text-ink-900"
                  }`}
                >
                  {p.price}
                </Text>
                <Text className="text-ink-500 text-base mb-1">{p.period}</Text>
              </View>

              {p.highlights.map((h, i) => (
                <View key={i} className="flex-row items-start gap-2 mb-2">
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.fairway[600]}
                    style={{ marginTop: 1 }}
                  />
                  <Text className="text-ink-700 text-sm flex-1">{h}</Text>
                </View>
              ))}

              <View className="mt-6">
                <Button
                  title={p.cta}
                  variant={p.featured ? "primary" : "outline"}
                  fullWidth
                  onPress={onGetStarted}
                />
              </View>
            </Card>
          </View>
        ))}
      </View>
    </View>
  );
}

function CtaBand({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <View className="bg-fairway-600 w-full px-6 py-14 items-center">
      <Text className="text-white font-extrabold text-2xl text-center mb-4 max-w-lg">
        Ready to bring structure to your golf coaching business?
      </Text>
      <Text className="text-fairway-100 text-base text-center mb-8 max-w-md">
        Join hundreds of coaches who've already simplified their admin and
        elevated their student experience.
      </Text>
      <Button
        title="Start Your Free Trial"
        variant="primary"
        size="lg"
        onPress={onGetStarted}
        className="bg-white"
      />
    </View>
  );
}

function FooterSection() {
  const links = ["Features", "For Coaches", "Privacy", "Terms"];
  const year = new Date().getFullYear();

  return (
    <View className="w-full bg-fairway-700 px-6 py-8 items-center">
      <View className="flex-row flex-wrap gap-6 justify-center mb-5">
        {links.map((l) => (
          <Text key={l} className="text-fairway-200 text-sm font-medium">
            {l}
          </Text>
        ))}
      </View>
      <Text className="text-fairway-400 text-xs text-center">
        © {year} TeeLesson. All rights reserved.
      </Text>
    </View>
  );
}

// ---------- main component ---------------------------------------------

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();
  const { width } = useWindowDimensions();

  const featureColumns = width >= 900 ? 3 : 1;

  const goSignup = () => navigation.navigate("Signup");
  // Demo navigates to Signup for now — replace with modal/video link when available
  const goDemo = () => navigation.navigate("Signup");

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Each section fills the viewport width; inner content is capped at 1100 */}
      <View style={{ width: "100%", maxWidth: 1100, alignSelf: "center" }}>

        {/* 1 — HERO */}
        <HeroSection onGetStarted={goSignup} onDemo={goDemo} />

        {/* 2 — PROBLEM / BENEFITS */}
        <ProblemSection />

        {/* 3 — FEATURES */}
        <FeaturesSection columns={featureColumns} />

        {/* 4 — TESTIMONIALS */}
        <TestimonialsSection />

        {/* 5 — PRICING */}
        <PricingSection onGetStarted={goSignup} />

        {/* 6 — CTA BAND */}
        <CtaBand onGetStarted={goSignup} />

        {/* 7 — FOOTER */}
        <FooterSection />
      </View>
    </ScrollView>
  );
}
