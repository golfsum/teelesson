/**
 * InfoScreen: static marketing/legal content pages (Features, For Coaches,
 * Privacy, Terms) linked from the landing-page footer. One screen, selected by
 * the `page` route param.
 */
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";

import type { AuthStackParamList, InfoPage } from "@/navigation/types";

type Route = RouteProp<AuthStackParamList, "Info">;

interface Section {
  heading?: string;
  body?: string;
  bullets?: string[];
}

interface PageContent {
  title: string;
  intro: string;
  sections: Section[];
}

const CONTENT: Record<InfoPage, PageContent> = {
  features: {
    title: "Features",
    intro:
      "TeeLesson gives independent golf coaches everything they need to run the business side of coaching, so they can focus on the lesson tee.",
    sections: [
      {
        heading: "Scheduling & booking",
        body: "Set recurring and one-off availability, take booking requests from players, and approve or decline with one tap. View your day, week, month, or year at a glance.",
      },
      {
        heading: "Session types",
        bullets: [
          "Individual lessons (range, simulator, online, indoor)",
          "Group lessons and junior clinics with multiple players",
          "Online review blocks to review swing videos sent to you",
          "Recurring lessons (weekly, bi-weekly, monthly, or custom)",
        ],
      },
      {
        heading: "Player CRM",
        body: "A searchable roster with each player's contact details, handicap, private notes, lesson history, and a goal checklist.",
      },
      {
        heading: "Progress tracking",
        body: "Log handicap, scoring average, greens in regulation, fairways, putts, driving distance, up-and-down, sand saves, and 3-putts over time, with trend lines that show improvement at a glance.",
      },
      {
        heading: "Public booking page",
        body: "A shareable page at /coach/your-handle that doubles as your booking entry point and your marketing page.",
      },
      {
        heading: "Payment tracking",
        body: "Mark lessons as paid and see what you've earned this month. No payment processing required.",
      },
      {
        heading: "Works everywhere",
        body: "One app across iPhone, Android, and the web.",
      },
    ],
  },
  forCoaches: {
    title: "For Coaches",
    intro:
      "Built for the independent coach and teaching pro who is tired of running their business out of text messages and a paper calendar.",
    sections: [
      {
        heading: "Who it's for",
        body: "PGA professionals, academy instructors, and independent coaches who manage their own roster, schedule, and bookings.",
      },
      {
        heading: "Why coaches switch",
        bullets: [
          "Stop chasing students to confirm times",
          "See every booking request in one place",
          "Keep player history and goals organised",
          "Know at a glance who has paid",
          "Share one link that lets new students find and book you",
        ],
      },
      {
        heading: "Get set up in minutes",
        body: "Create your profile, publish your availability, and share your booking link. Invite existing players with a link so they can book and view their lessons.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "This summary explains what TeeLesson collects and how it is used. It is provided for transparency and is not legal advice.",
    sections: [
      {
        heading: "What we collect",
        bullets: [
          "Account details you provide (name, email, profile information)",
          "Coaching data you enter (players, lessons, availability, notes, progress)",
          "Basic usage and device information needed to run the service",
        ],
      },
      {
        heading: "How we use it",
        body: "Your data is used only to provide the service: to power your dashboard, schedule, roster, and booking page. We do not sell your personal information.",
      },
      {
        heading: "Storage & security",
        body: "Data is stored with our cloud provider (Firebase) and protected by access rules so coaches can only see their own data and players can only see their own.",
      },
      {
        heading: "Your choices",
        body: "You can edit or delete your profile information at any time. To request deletion of your account and associated data, contact support@teelesson.com.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro:
      "These terms summarise the agreement between you and TeeLesson. They are provided for transparency and are not legal advice.",
    sections: [
      {
        heading: "Using TeeLesson",
        body: "You may use TeeLesson to manage your coaching business. You are responsible for the accuracy of the information you enter and for how you communicate with your players.",
      },
      {
        heading: "Accounts",
        body: "Keep your login credentials secure. You are responsible for activity that happens under your account.",
      },
      {
        heading: "Payments",
        body: "TeeLesson currently tracks payment status only; it does not process payments. Any money collected from your players is arranged directly between you and them.",
      },
      {
        heading: "Availability",
        body: "We aim to keep the service running reliably but provide it on an \"as is\" basis without warranties. We may update or change features over time.",
      },
      {
        heading: "Contact",
        body: "Questions about these terms? Email support@teelesson.com.",
      },
    ],
  },
};

export default function InfoScreen() {
  const route = useRoute<Route>();
  const content = CONTENT[route.params?.page] ?? CONTENT.features;

  return (
    <ScrollView
      className="flex-1 bg-[#080b0d]"
      contentContainerStyle={{ paddingBottom: 72 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full self-center px-5 pt-12" style={{ maxWidth: 820 }}>
        <View className="rounded-[28px] border border-[#263038] bg-[#101518] p-6 md:p-10">
          <Text className="text-xs font-black uppercase tracking-[2px] text-[#b7f238]">
            TeeLesson
          </Text>
          <Text className="mt-4 text-4xl font-extrabold tracking-tight text-[#f6f8f2]">
            {content.title}
          </Text>
          <Text className="mt-4 text-base leading-relaxed text-[#cbd4da]">
            {content.intro}
          </Text>

          {content.sections.map((s, i) => (
            <View key={i} className="mt-7 border-t border-[#263038] pt-7">
              {s.heading ? (
                <Text className="mb-2 text-lg font-bold text-[#f6f8f2]">{s.heading}</Text>
              ) : null}
              {s.body ? (
                <Text className="text-base leading-relaxed text-[#cbd4da]">{s.body}</Text>
              ) : null}
              {s.bullets?.map((b, j) => (
                <View key={j} className="mt-2 flex-row gap-3">
                  <Text className="text-[#b7f238]">•</Text>
                  <Text className="flex-1 text-base leading-relaxed text-[#cbd4da]">{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
