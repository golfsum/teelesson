/**
 * LandingScreen, Marketing landing page for TeeLesson.
 * Restyled to follow the AppsResolve public-site structure while preserving
 * TeeLesson content, navigation, and CTAs.
 */
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import BrandMark from "@/components/brand-mark";
import GolfLineIcon, { type GolfIconName } from "@/components/GolfLineIcon";
import { Button } from "@/components/ui";
import type { AuthStackParamList, InfoPage } from "@/navigation/types";
import { colors } from "@/theme";

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

const siteBg = "#080b0d";
const sectionAlt = "#0d1113";
const panel = "#101518";
const line = "#263038";
const muted = "#9ba8b2";
const soft = "#cbd4da";
const lime = "#b7f238";
const ink = "#101500";
const white = "#f6f8f2";

const BENEFITS = [
  {
    icon: "schedule" as const,
    title: "Smart Scheduling",
    desc: "Set availability, accept bookings, and eliminate double-ups in seconds.",
  },
  {
    icon: "students" as const,
    title: "Player CRM",
    desc: "Track every student's history, goals, and progress in one place.",
  },
  {
    icon: "booking" as const,
    title: "Booking Requests",
    desc: "Players request, you approve or decline with one tap, no more phone tag.",
  },
  {
    icon: "payments" as const,
    title: "Payment Tracking",
    desc: "Mark lessons paid as you go so you always know who still owes you.",
  },
  {
    icon: "follow-up" as const,
    title: "Public Booking Page",
    desc: "A shareable coaching page that lets new students find and book you online.",
  },
];

const FEATURES = [
  {
    icon: "schedule" as const,
    title: "Lesson Booking System",
    desc: "Real-time availability calendar and one-tap approvals keep your schedule full without the back-and-forth.",
  },
  {
    icon: "students" as const,
    title: "Player Management",
    desc: "Detailed profiles, progress notes, lesson history, and goal tracking for every student on your roster.",
  },
  {
    icon: "booking" as const,
    title: "Approve in One Tap",
    desc: "Every booking request lands in one place, approve or decline instantly and the player is notified.",
  },
  {
    icon: "payments" as const,
    title: "Payment Tracking",
    desc: "A simple paid/unpaid toggle per lesson so collecting from students never slips through the cracks.",
  },
  {
    icon: "follow-up" as const,
    title: "Public Booking Page",
    desc: "A polished page with your bio, credentials, and booking link, your digital first impression and SEO front door.",
  },
  {
    icon: "dashboard" as const,
    title: "Works Everywhere",
    desc: "One responsive web app that runs on phone, tablet, and desktop. Coach from the range or the office.",
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

function Wrap({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ width: "100%", maxWidth: 1180, alignSelf: "center", paddingHorizontal: 20 }, style]}>
      {children}
    </View>
  );
}

function AppButton({ label, onPress, ghost = false }: { label: string; onPress: () => void; ghost?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 44,
        borderRadius: 10,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: ghost ? line : lime,
        backgroundColor: ghost ? panel : lime,
      }}
    >
      <Text style={{ color: ghost ? white : ink, fontSize: 14, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ color: lime, fontSize: 12, fontWeight: "900", letterSpacing: 1.8, textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

function SectionHead({ eyebrow, title, description, center = false }: { eyebrow: string; title: string; description: string; center?: boolean }) {
  return (
    <View style={{ maxWidth: 760, marginBottom: 38, alignSelf: center ? "center" : "auto", alignItems: center ? "center" : "flex-start" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text style={{ color: white, fontSize: 38, lineHeight: 42, letterSpacing: -1.2, fontWeight: "900", marginTop: 12, textAlign: center ? "center" : "left" }}>
        {title}
      </Text>
      <Text style={{ color: muted, fontSize: 17, lineHeight: 26, marginTop: 12, textAlign: center ? "center" : "left" }}>
        {description}
      </Text>
    </View>
  );
}

function DarkCard({ children, featured = false, style }: { children: React.ReactNode; featured?: boolean; style?: any }) {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: featured ? "rgba(183,242,56,0.55)" : line,
          borderRadius: 16,
          backgroundColor: panel,
          padding: 24,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function IconTile({ name }: { name: GolfIconName }) {
  return (
    <View style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: "#0b0f11", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: line }}>
      <GolfLineIcon name={name} size={27} color={white} accent={lime} muted="#6d7780" strokeWidth={4.8} />
    </View>
  );
}

function DashboardScreenshot({ mobile = false }: { mobile?: boolean }) {
  return (
    <View style={{ flex: mobile ? undefined : 1.18, width: mobile ? "100%" : undefined, minWidth: 0, aspectRatio: 16 / 9, borderWidth: 1, borderColor: "rgba(183,242,56,0.32)", borderRadius: mobile ? 14 : 18, backgroundColor: panel, overflow: "hidden", boxShadow: "0 32px 70px rgba(0,0,0,0.38)" }}>
      <Image
        source={require("../../assets/coach-dashboard.png")}
        accessibilityLabel="TeeLesson coach dashboard showing students, lessons, booking requests, revenue, and upcoming work"
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}

function Header({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 760;
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(8,11,13,0.96)" }}>
      <Wrap style={{ minHeight: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <BrandMark />
        {desktop ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <Text style={{ color: soft, fontSize: 14, fontWeight: "700" }}>Features</Text>
            <Text style={{ color: soft, fontSize: 14, fontWeight: "700" }}>Pricing</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {desktop ? (
            <Pressable onPress={onSignIn} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}>
              <Text style={{ color: soft, fontSize: 14, fontWeight: "800" }}>Sign in</Text>
            </Pressable>
          ) : null}
          <AppButton label="Start free" onPress={onGetStarted} />
        </View>
      </Wrap>
    </View>
  );
}

function HeroSection({ onGetStarted, onDemo, onSignIn }: { onGetStarted: () => void; onDemo: () => void; onSignIn: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <View style={{ paddingTop: 0 }}>
      <Header onGetStarted={onGetStarted} onSignIn={onSignIn} />
      <View style={{ paddingVertical: desktop ? 76 : 54, backgroundColor: siteBg }}>
        <Wrap style={{ flexDirection: desktop ? "row" : "column", gap: desktop ? 58 : 36, alignItems: "center" }}>
          <View style={{ flex: 1.03 }}>
            <Eyebrow>Golf coaching operations</Eyebrow>
            <Text style={{ color: white, fontSize: desktop ? 66 : 43, lineHeight: desktop ? 68 : 46, letterSpacing: desktop ? -3.3 : -1.8, fontWeight: "900", marginTop: 18 }}>
              Run your coaching.{"\n"}Grow your impact.
            </Text>
            <Text style={{ color: soft, fontSize: desktop ? 20 : 17, lineHeight: desktop ? 30 : 26, marginTop: 22, maxWidth: 670 }}>
              Students, lessons, practice, progress, and payments in one focused workspace built for golf coaches.
            </Text>
            <Text style={{ color: white, fontWeight: "800", marginTop: 20 }}>
              14 days free. No credit card required.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
              <AppButton label="Start coaching free" onPress={onGetStarted} />
              <AppButton label="View a coach profile" onPress={onDemo} ghost />
            </View>
          </View>
          <DashboardScreenshot />
        </Wrap>
      </View>
    </View>
  );
}

function TrustStrip() {
  const items = [
    [BENEFITS[0].title, BENEFITS[0].icon],
    [BENEFITS[1].title, BENEFITS[1].icon],
    [BENEFITS[2].title, BENEFITS[2].icon],
    [BENEFITS[3].title, BENEFITS[3].icon],
  ];
  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: line, backgroundColor: sectionAlt }}>
      <Wrap style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {items.map(([label, icon], index) => (
          <View key={label} style={{ width: "25%", minWidth: 240, paddingVertical: 20, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 10, borderLeftWidth: index ? 1 : 0, borderLeftColor: line }}>
            <GolfLineIcon name={icon as GolfIconName} size={20} color={white} accent={lime} muted="#6d7780" strokeWidth={5.2} />
            <Text style={{ color: soft, fontSize: 14, fontWeight: "800" }}>{label}</Text>
          </View>
        ))}
      </Wrap>
    </View>
  );
}

function ProblemSection() {
  return (
    <View style={{ paddingVertical: 88, backgroundColor: sectionAlt, borderBottomWidth: 1, borderBottomColor: line }}>
      <Wrap>
        <SectionHead
          eyebrow="Why TeeLesson"
          title="Tired of chaotic coaching schedules and lost student progress?"
          description="You got into golf coaching to teach, not to manage admin. TeeLesson handles the business side so you can focus on the lesson tee."
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {BENEFITS.map((benefit) => (
            <DarkCard key={benefit.title} style={{ flex: 1, minWidth: 210 }}>
              <IconTile name={benefit.icon} />
              <Text style={{ color: white, fontSize: 19, fontWeight: "900", marginTop: 14 }}>{benefit.title}</Text>
              <Text style={{ color: muted, fontSize: 15, lineHeight: 23, marginTop: 8 }}>{benefit.desc}</Text>
            </DarkCard>
          ))}
        </View>
      </Wrap>
    </View>
  );
}

function FeaturesSection() {
  return (
    <View style={{ paddingVertical: 88, backgroundColor: siteBg }}>
      <Wrap>
        <SectionHead
          eyebrow="Features"
          title="Built for Golf Coaches"
          description="Everything you need to run a professional coaching business, nothing you don't."
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {FEATURES.map((feature) => (
            <DarkCard key={feature.title} style={{ width: "31.5%", minWidth: 280 }}>
              <IconTile name={feature.icon} />
              <Text style={{ color: white, fontSize: 19, fontWeight: "900", marginTop: 14 }}>{feature.title}</Text>
              <Text style={{ color: muted, fontSize: 15, lineHeight: 23, marginTop: 8 }}>{feature.desc}</Text>
            </DarkCard>
          ))}
        </View>
      </Wrap>
    </View>
  );
}

function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <View style={{ paddingVertical: 88, backgroundColor: sectionAlt, borderTopWidth: 1, borderBottomWidth: 1, borderColor: line }}>
      <Wrap>
        <SectionHead
          eyebrow="Pricing"
          title="Start Free. Grow with Confidence."
          description="14-day free trial on every plan. No credit card required."
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {PRICING.map((plan) => (
            <DarkCard key={plan.tier} featured={plan.featured} style={{ flex: 1, minWidth: 280, minHeight: 410 }}>
              <View style={{ flex: 1 }}>
                <View style={{ minHeight: 18 }}>
                  {plan.featured ? <Text style={{ alignSelf: "flex-end", color: lime, fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" }}>Most Popular</Text> : null}
                </View>
                <Text style={{ color: white, fontSize: 20, fontWeight: "900" }}>{plan.tier}</Text>
                <View style={{ flexDirection: "row", alignItems: "flex-end", marginVertical: 12 }}>
                  <Text style={{ color: plan.featured ? lime : white, fontSize: 39, fontWeight: "900", letterSpacing: -1.6 }}>{plan.price}</Text>
                  <Text style={{ color: muted, fontSize: 13, marginBottom: 8 }}> {plan.period}</Text>
                </View>
                <View style={{ gap: 9, marginBottom: 22 }}>
                  {plan.highlights.map((highlight) => (
                    <View key={highlight} style={{ flexDirection: "row", gap: 9, alignItems: "flex-start" }}>
                      {!highlight.endsWith(":") ? <Text style={{ color: lime, fontWeight: "900" }}>✓</Text> : null}
                      <Text style={{ flex: 1, color: highlight.endsWith(":") ? white : muted, fontSize: 15, fontWeight: highlight.endsWith(":") ? "800" : "500" }}>{highlight}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <AppButton label={plan.cta} onPress={onGetStarted} ghost={!plan.featured} />
            </DarkCard>
          ))}
        </View>
      </Wrap>
    </View>
  );
}

function CtaBand({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <View style={{ paddingVertical: 72, backgroundColor: siteBg }}>
      <Wrap>
        <View style={{ borderWidth: 1, borderColor: line, borderRadius: 20, backgroundColor: panel, padding: 42, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 30 }}>
          <View style={{ flex: 1, minWidth: 260 }}>
            <Text style={{ color: white, fontSize: 38, lineHeight: 42, fontWeight: "900", letterSpacing: -1.4 }}>
              Ready to bring structure to your golf coaching business?
            </Text>
            <Text style={{ color: muted, fontSize: 17, lineHeight: 26, marginTop: 12 }}>
              Join hundreds of coaches who've already simplified their admin and elevated their student experience.
            </Text>
          </View>
          <AppButton label="Start Your Free Trial" onPress={onGetStarted} />
        </View>
      </Wrap>
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
    <View style={{ borderTopWidth: 1, borderTopColor: line, backgroundColor: "#07090a", paddingVertical: 42 }}>
      <Wrap>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 28 }}>
          <View style={{ maxWidth: 320 }}>
            <BrandMark />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
            {links.map((link) => (
              <Pressable key={link.page} onPress={() => navigation.navigate("Info", { page: link.page })}>
                <Text style={{ color: soft, fontSize: 14, fontWeight: "700" }}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: line, marginTop: 34, paddingTop: 22 }}>
          <Text style={{ color: muted, fontSize: 12 }}>© {year} TeeLesson. All rights reserved.</Text>
        </View>
      </Wrap>
    </View>
  );
}

function MobileFooterSection() {
  const navigation = useNavigation<NavProp>();
  const links: { label: string; page: InfoPage }[] = [
    { label: "Features", page: "features" },
    { label: "For Coaches", page: "forCoaches" },
    { label: "Privacy", page: "privacy" },
    { label: "Terms", page: "terms" },
  ];
  const year = new Date().getFullYear();

  return (
    <View style={{ width: "100%", backgroundColor: colors.fairway[700], paddingHorizontal: 24, paddingVertical: 34, alignItems: "center" }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 22, marginBottom: 20 }}>
        {links.map((link) => (
          <Pressable key={link.page} onPress={() => navigation.navigate("Info", { page: link.page })}>
            <Text style={{ color: colors.fairway[100], fontSize: 13, fontWeight: "800" }}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: colors.fairway[300], fontSize: 12, textAlign: "center" }}>© {year} TeeLesson. All rights reserved.</Text>
    </View>
  );
}

function MobileSectionLabel({ text }: { text: string }) {
  return (
    <Text style={{ color: colors.fairway[600], fontSize: 13, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
      {text}
    </Text>
  );
}

function MobileSectionHeading({ text }: { text: string }) {
  return (
    <Text style={{ color: colors.ink[900], fontSize: 25, lineHeight: 31, fontWeight: "900", textAlign: "center", marginBottom: 14 }}>
      {text}
    </Text>
  );
}

function MobileSectionSubtext({ text }: { text: string }) {
  return (
    <Text style={{ color: colors.ink[500], fontSize: 15, lineHeight: 23, textAlign: "center", marginBottom: 30 }}>
      {text}
    </Text>
  );
}

function MobileCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: "100%", borderRadius: 18, borderWidth: 1, borderColor: colors.ink[200], backgroundColor: colors.white, padding: 20 }}>
      {children}
    </View>
  );
}

function MobileProductPreview() {
  return <DashboardScreenshot mobile />;
}

function MobileLanding({
  onGetStarted,
  onDemo,
  onSignIn,
}: {
  onGetStarted: () => void;
  onDemo: () => void;
  onSignIn: () => void;
}) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: "100%", backgroundColor: "#001b0d", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 44 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 42 }}>
          <BrandMark />
          <Pressable onPress={onGetStarted} style={{ borderRadius: 7, backgroundColor: colors.fairway[500], paddingHorizontal: 15, paddingVertical: 10 }}>
            <Text style={{ color: colors.navy, fontSize: 12, fontWeight: "900" }}>Start free</Text>
          </Pressable>
        </View>
        <View style={{ alignItems: "center", gap: 38 }}>
          <View style={{ width: "100%", alignItems: "center" }}>
            <Text style={{ color: colors.white, fontSize: 38, lineHeight: 44, fontWeight: "900", letterSpacing: -1.7, textAlign: "center" }}>Run your coaching.{"\n"}Grow your impact.</Text>
            <Text style={{ color: "#c8d8cf", fontSize: 15, lineHeight: 24, marginTop: 22, textAlign: "center", maxWidth: 440 }}>Students, lessons, practice, progress, and payments in one focused workspace built for golf coaches.</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 28, justifyContent: "center" }}>
              <Button title="Start coaching free" size="lg" onPress={onGetStarted} />
              <Button title="View a coach profile" size="lg" variant="outline" onPress={onDemo} />
            </View>
            <Pressable onPress={onSignIn} style={{ marginTop: 14 }}>
              <Text style={{ color: "#8fa79a", fontSize: 12, fontWeight: "800" }}>Already have an account? Sign in</Text>
            </Pressable>
            <Text style={{ color: "#8fa79a", fontSize: 10.5, marginTop: 10 }}>14 days free • No credit card required</Text>
          </View>
          <MobileProductPreview />
        </View>
      </View>

      <View style={{ width: "100%", paddingHorizontal: 24, paddingVertical: 56, alignItems: "center", backgroundColor: colors.ink[50] }}>
        <MobileSectionLabel text="Why TeeLesson" />
        <MobileSectionHeading text="Tired of chaotic coaching schedules and lost student progress?" />
        <MobileSectionSubtext text="You got into golf coaching to teach, not to manage admin. TeeLesson handles the business side so you can focus on the lesson tee." />
        <View style={{ width: "100%", gap: 14 }}>
          {BENEFITS.map((benefit) => (
            <MobileCard key={benefit.title}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.fairway[100], alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <GolfLineIcon name={benefit.icon} size={28} color={colors.ink[900]} accent={colors.fairway[600]} muted={colors.ink[400]} strokeWidth={4.8} />
              </View>
              <Text style={{ color: colors.ink[900], fontSize: 16, fontWeight: "900", marginBottom: 6 }}>{benefit.title}</Text>
              <Text style={{ color: colors.ink[500], fontSize: 14, lineHeight: 21 }}>{benefit.desc}</Text>
            </MobileCard>
          ))}
        </View>
      </View>

      <View style={{ width: "100%", paddingHorizontal: 24, paddingVertical: 56, alignItems: "center", backgroundColor: colors.white }}>
        <MobileSectionLabel text="Features" />
        <MobileSectionHeading text="Built for Golf Coaches" />
        <MobileSectionSubtext text="Everything you need to run a professional coaching business, nothing you don't." />
        <View style={{ width: "100%", gap: 14 }}>
          {FEATURES.map((feature) => (
            <MobileCard key={feature.title}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.fairway[50], alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <GolfLineIcon name={feature.icon} size={26} color={colors.ink[900]} accent={colors.fairway[600]} muted={colors.ink[400]} strokeWidth={4.8} />
              </View>
              <Text style={{ color: colors.ink[900], fontSize: 16, fontWeight: "900", marginBottom: 7 }}>{feature.title}</Text>
              <Text style={{ color: colors.ink[500], fontSize: 14, lineHeight: 21 }}>{feature.desc}</Text>
            </MobileCard>
          ))}
        </View>
      </View>

      <View style={{ width: "100%", paddingHorizontal: 24, paddingVertical: 56, alignItems: "center", backgroundColor: colors.white }}>
        <MobileSectionLabel text="Pricing" />
        <MobileSectionHeading text="Start Free. Grow with Confidence." />
        <MobileSectionSubtext text="14-day free trial on every plan. No credit card required." />
        <View style={{ width: "100%", gap: 16 }}>
          {PRICING.map((plan) => (
            <MobileCard key={plan.tier}>
              {plan.featured ? (
                <View style={{ backgroundColor: colors.fairway[600], borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 12 }}>
                  <Text style={{ color: colors.white, fontSize: 11, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" }}>Most Popular</Text>
                </View>
              ) : null}
              <Text style={{ color: colors.ink[900], fontSize: 20, fontWeight: "900" }}>{plan.tier}</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", marginVertical: 16 }}>
                <Text style={{ color: plan.featured ? colors.fairway[600] : colors.ink[900], fontSize: 40, fontWeight: "900" }}>{plan.price}</Text>
                <Text style={{ color: colors.ink[500], fontSize: 16, marginBottom: 7 }}> {plan.period}</Text>
              </View>
              {plan.highlights.map((highlight) => (
                <View key={highlight} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 9 }}>
                  {!highlight.endsWith(":") ? <Ionicons name="checkmark-circle" size={18} color={colors.fairway[600]} style={{ marginTop: 1 }} /> : null}
                  <Text style={{ flex: 1, color: highlight.endsWith(":") ? colors.ink[900] : colors.ink[700], fontSize: 14, lineHeight: 20, fontWeight: highlight.endsWith(":") ? "900" : "500" }}>{highlight}</Text>
                </View>
              ))}
              <View style={{ marginTop: 14 }}>
                <Button title={plan.cta} variant={plan.featured ? "primary" : "outline"} fullWidth onPress={onGetStarted} />
              </View>
            </MobileCard>
          ))}
        </View>
      </View>

      <View style={{ width: "100%", backgroundColor: colors.fairway[600], paddingHorizontal: 24, paddingVertical: 56, alignItems: "center" }}>
        <Text style={{ color: colors.white, fontSize: 25, lineHeight: 31, fontWeight: "900", textAlign: "center", marginBottom: 14, maxWidth: 520 }}>Ready to bring structure to your golf coaching business?</Text>
        <Text style={{ color: colors.fairway[100], fontSize: 15, lineHeight: 23, textAlign: "center", marginBottom: 28, maxWidth: 420 }}>Join hundreds of coaches who've already simplified their admin and elevated their student experience.</Text>
        <Button title="Start Your Free Trial" variant="primary" size="lg" onPress={onGetStarted} className="bg-white" textClassName="text-fairway-700" />
      </View>

      <MobileFooterSection />
    </ScrollView>
  );
}

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();
  const { width } = useWindowDimensions();

  const goSignup = () => navigation.navigate("Signup");
  const goDemo = () => navigation.navigate("PublicCoachProfile", { slug: "demo-coach" });
  const goSignIn = () => navigation.navigate("Login");

  if (width < 760) {
    return <MobileLanding onGetStarted={goSignup} onDemo={goDemo} onSignIn={goSignIn} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: siteBg }}
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: "100%", alignSelf: "center" }}>
        <HeroSection onGetStarted={goSignup} onDemo={goDemo} onSignIn={goSignIn} />
        <TrustStrip />
        <ProblemSection />
        <FeaturesSection />
        <PricingSection onGetStarted={goSignup} />
        <CtaBand onGetStarted={goSignup} />
        <FooterSection />
      </View>
    </ScrollView>
  );
}
