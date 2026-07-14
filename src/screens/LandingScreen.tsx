/**
 * LandingScreen, Marketing landing page for TeeLesson.
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
import BrandMark from "@/components/brand-mark";
import type { AuthStackParamList, InfoPage } from "@/navigation/types";
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
    desc: "Players request, you approve or decline with one tap, no more phone tag.",
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
    desc: "Every booking request lands in one place, approve or decline instantly and the player is notified.",
  },
  {
    icon: "cash-outline" as const,
    title: "Payment Tracking",
    desc: "A simple paid/unpaid toggle per lesson so collecting from students never slips through the cracks.",
  },
  {
    icon: "person-circle-outline" as const,
    title: "Public Booking Page",
    desc: "A polished page with your bio, credentials, and booking link, your digital first impression and SEO front door.",
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
      "Up to 20 active players",
      "Lesson scheduling & booking",
      "Player CRM & lesson history",
      "Payment tracking (mark as paid)",
    ],
    cta: "Start Free Trial",
  },
  {
    tier: "Pro",
    price: "$49.99",
    period: "/mo",
    highlights: [
      "Everything in Basic, plus:",
      "Unlimited players",
      "Public booking page",
      "Group lessons & online review blocks",
      "Player progress tracking",
      "Recurring availability & priority support",
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

function PreviewMetric({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, minWidth: 130, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 9, padding: 11, flexDirection: "row", alignItems: "center", gap: 9 }}>
      <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: `${color}12`, alignItems: "center", justifyContent: "center" }}><Ionicons name={icon} size={16} color={color} /></View>
      <View><Text style={{ color: colors.ink[500], fontSize: 8.5 }}>{label}</Text><Text style={{ color: colors.ink[900], fontSize: 18, fontWeight: "800", marginTop: 2 }}>{value}</Text></View>
    </View>
  );
}

function ProductPreview() {
  return (
    <View style={{ flex: 1, minWidth: 0, borderRadius: 14, backgroundColor: colors.white, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.28)" }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><Text style={{ color: colors.ink[900], fontSize: 18, fontWeight: "800" }}>Dashboard</Text><View style={{ width: 150, height: 28, borderRadius: 6, borderWidth: 1, borderColor: colors.ink[200], flexDirection: "row", alignItems: "center", paddingHorizontal: 8, gap: 5 }}><Ionicons name="search-outline" size={11} color={colors.ink[400]} /><Text style={{ color: colors.ink[400], fontSize: 8 }}>Search students…</Text></View></View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <PreviewMetric icon="calendar-outline" label="Lessons this week" value="28" color={colors.fairway[600]} />
          <PreviewMetric icon="cash-outline" label="Revenue this month" value="$7,650" color={colors.fairway[600]} />
          <PreviewMetric icon="people-outline" label="Active students" value="42" color={colors.blue} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, borderRadius: 9, borderWidth: 1, borderColor: colors.ink[200], overflow: "hidden" }}>
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.ink[200] }}><Text style={{ color: colors.ink[900], fontSize: 10, fontWeight: "800" }}>Today’s Schedule</Text></View>
            {["Ethan Thompson", "Sophia Martinez", "Jackson Lee"].map((name, index) => <View key={name} style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: index === 0 ? colors.fairway[50] : colors.white, borderTopWidth: index ? 1 : 0, borderTopColor: colors.ink[200] }}><Text style={{ width: 38, color: colors.ink[900], fontSize: 8.5, fontWeight: "700" }}>{["10:30", "12:00", "1:30"][index]}</Text><View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.fairway[100], alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.fairway[700], fontSize: 8, fontWeight: "800" }}>{name.split(" ").map((part) => part[0]).join("")}</Text></View><View style={{ flex: 1 }}><Text style={{ color: colors.ink[900], fontSize: 8.5, fontWeight: "700" }}>{name}</Text><Text style={{ color: colors.ink[500], fontSize: 7.5, marginTop: 2 }}>Lesson (45 min)</Text></View></View>)}
          </View>
          <View style={{ width: "34%", borderRadius: 9, borderWidth: 1, borderColor: colors.ink[200], padding: 10 }}><Text style={{ color: colors.ink[900], fontSize: 10, fontWeight: "800", marginBottom: 12 }}>Recent Activity</Text>{["Practice complete", "Video uploaded", "Payment received"].map((item, index) => <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 11 }}><Ionicons name={["golf-outline", "play-outline", "cash-outline"][index] as keyof typeof Ionicons.glyphMap} size={12} color={index === 1 ? colors.blue : colors.fairway[600]} /><Text style={{ color: colors.ink[700], fontSize: 7.5 }}>{item}</Text></View>)}</View>
        </View>
      </View>
    </View>
  );
}

function HeroSection({ onGetStarted, onDemo, onSignIn }: { onGetStarted: () => void; onDemo: () => void; onSignIn: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <View style={{ width: "100%", backgroundColor: "#001b0d", paddingHorizontal: 24, paddingTop: 20, paddingBottom: desktop ? 58 : 44 }}>
      <View style={{ width: "100%", maxWidth: 1200, alignSelf: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: desktop ? 54 : 42 }}>
          <BrandMark />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {desktop ? <Pressable onPress={onSignIn} style={{ paddingHorizontal: 14, paddingVertical: 9 }}><Text style={{ color: colors.white, fontSize: 12, fontWeight: "700" }}>Sign in</Text></Pressable> : null}
            <Pressable onPress={onGetStarted} style={{ borderRadius: 7, backgroundColor: colors.fairway[500], paddingHorizontal: 15, paddingVertical: 10 }}><Text style={{ color: colors.navy, fontSize: 12, fontWeight: "900" }}>Start free</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection: desktop ? "row" : "column", alignItems: "center", gap: desktop ? 54 : 38 }}>
          <View style={{ width: desktop ? "37%" : "100%", alignItems: desktop ? "flex-start" : "center" }}>
            <Text style={{ color: colors.white, fontSize: desktop ? 48 : 38, lineHeight: desktop ? 54 : 44, fontWeight: "800", letterSpacing: -1.7, textAlign: desktop ? "left" : "center" }}>Run your coaching.{"\n"}Grow your impact.</Text>
            <Text style={{ color: "#c8d8cf", fontSize: desktop ? 16 : 15, lineHeight: 24, marginTop: 22, textAlign: desktop ? "left" : "center", maxWidth: 440 }}>Students, lessons, practice, progress, and payments in one focused workspace built for golf coaches.</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 28, justifyContent: desktop ? "flex-start" : "center" }}>
              <Button title="Start coaching free" size="lg" onPress={onGetStarted} />
              <Button title="View a coach profile" size="lg" variant="outline" onPress={onDemo} />
            </View>
            <Text style={{ color: "#8fa79a", fontSize: 10.5, marginTop: 14 }}>14 days free · No credit card required</Text>
          </View>
          <View style={{ width: desktop ? "63%" : "100%", maxWidth: 720 }}><ProductPreview /></View>
        </View>
      </View>
    </View>
  );
}

function ProblemSection() {
  return (
    <View className="w-full px-6 py-14 items-center bg-ink-50">
      <SectionLabel text="Why TeeLesson" />
      <SectionHeading text="Tired of chaotic coaching schedules and lost student progress?" />
      <SectionSubtext text="You got into golf coaching to teach, not to manage admin. TeeLesson handles the business side so you can focus on the lesson tee." />

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
      <SectionSubtext text="Everything you need to run a professional coaching business, nothing you don't." />

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

              {p.highlights.map((h, i) =>
                h.endsWith(":") ? (
                  <Text key={i} className="text-ink-900 text-sm font-bold mb-2 mt-1">
                    {h}
                  </Text>
                ) : (
                  <View key={i} className="flex-row items-start gap-2 mb-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.fairway[600]}
                      style={{ marginTop: 1 }}
                    />
                    <Text className="text-ink-700 text-sm flex-1">{h}</Text>
                  </View>
                )
              )}

              <View className="mt-auto pt-6">
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
        textClassName="text-fairway-700"
      />
    </View>
  );
}

function FooterSection() {
  const navigation = useNavigation<NavProp>();
  const links: { label: string; page: InfoPage }[] = [
    { label: "Features", page: "features" },
    { label: "For Coaches", page: "forCoaches" },
    { label: "Privacy", page: "privacy" },
    { label: "Terms", page: "terms" },
  ];
  const year = new Date().getFullYear();

  return (
    <View className="w-full bg-fairway-700 px-6 py-8 items-center">
      <View className="flex-row flex-wrap gap-6 justify-center mb-5">
        {links.map((l) => (
          <Pressable key={l.page} onPress={() => navigation.navigate("Info", { page: l.page })}>
            <Text className="text-fairway-200 text-sm font-medium">{l.label}</Text>
          </Pressable>
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
  const goDemo = () => navigation.navigate("PublicCoachProfile", { slug: "demo-coach" });
  const goSignIn = () => navigation.navigate("Login");

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Each section fills the viewport width; inner content is capped at 1100 */}
      <View style={{ width: "100%", alignSelf: "center" }}>

        {/* 1, HERO */}
        <HeroSection onGetStarted={goSignup} onDemo={goDemo} onSignIn={goSignIn} />

        {/* 2, PROBLEM / BENEFITS */}
        <ProblemSection />

        {/* 3, FEATURES */}
        <FeaturesSection columns={featureColumns} />

        {/* TESTIMONIALS hidden for now */}

        {/* 5, PRICING */}
        <PricingSection onGetStarted={goSignup} />

        {/* 6, CTA BAND */}
        <CtaBand onGetStarted={goSignup} />

        {/* 7, FOOTER */}
        <FooterSection />
      </View>
    </ScrollView>
  );
}
