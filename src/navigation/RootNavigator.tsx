import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import {
  NavigationContainer,
  type LinkingOptions,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";
import type {
  AuthStackParamList,
  CoachStackParamList,
  PlayerStackParamList,
} from "./types";

import CoachTabs from "./CoachTabs";
import PlayerTabs from "./PlayerTabs";

// Auth screens
import LandingScreen from "@/screens/LandingScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignupScreen from "@/screens/auth/SignupScreen";
import PublicCoachProfileScreen from "@/screens/PublicCoachProfileScreen";
import InfoScreen from "@/screens/InfoScreen";

// Shared / coach detail screens
import PlayerProfileScreen from "@/screens/coach/PlayerProfileScreen";
import AddLessonScreen from "@/screens/coach/AddLessonScreen";
import LogProgressScreen from "@/screens/coach/LogProgressScreen";
import AvailabilityScreen from "@/screens/coach/AvailabilityScreen";
import InvitePlayerScreen from "@/screens/coach/InvitePlayerScreen";
import AccountScreen from "@/screens/AccountScreen";

// Player detail screens
import PlayerBookLessonScreen from "@/screens/player/BookLessonScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CoachStack = createNativeStackNavigator<CoachStackParamList>();
const PlayerStack = createNativeStackNavigator<PlayerStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.fairway[600],
    background: colors.forestCanvas,
    card: colors.white,
    text: colors.ink[900],
    border: colors.ink[200],
  },
};

/** Web deep-linking so /coach/:slug and /login resolve on Vercel. */
const linking: LinkingOptions<AuthStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Landing: "",
      Login: "login",
      Signup: "signup",
      PublicCoachProfile: "coach/:slug",
      Info: "info/:page",
    },
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.forestCanvas },
  headerTintColor: colors.ink[900],
  headerTitleStyle: { fontWeight: "700" as const },
  headerShadowVisible: false,
  // Clean, consistent back button across every stack screen, the whole
  // chevron + "Back" label is tappable (native-stack default).
  headerBackTitle: "Back",
  headerBackButtonDisplayMode: "default" as const,
};

function AuthNavigator() {
  // The marketing Landing page is a web concept. On native (iOS/Android) the
  // app should open straight to Login; the Landing screen is only registered
  // on web so deep links / the "/" route still resolve there.
  const isWeb = Platform.OS === "web";
  return (
    <AuthStack.Navigator
      initialRouteName={isWeb ? "Landing" : "Login"}
      screenOptions={{ headerShown: false }}
    >
      {isWeb ? (
        <AuthStack.Screen name="Landing" component={LandingScreen} />
      ) : null}
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: !isWeb, title: "Sign In", ...headerOptions }}
      />
      <AuthStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: !isWeb, title: "Create Account", ...headerOptions }}
      />
      <AuthStack.Screen
        name="PublicCoachProfile"
        component={PublicCoachProfileScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Info"
        component={InfoScreen}
        options={{
          headerShown: true,
          title: "TeeLesson",
          headerStyle: { backgroundColor: "#080b0d" },
          headerTintColor: "#f6f8f2",
          headerTitleStyle: { fontWeight: "700" as const },
          headerShadowVisible: false,
        }}
      />
    </AuthStack.Navigator>
  );
}

function CoachNavigator() {
  return (
    <CoachStack.Navigator screenOptions={headerOptions}>
      <CoachStack.Screen
        name="CoachTabs"
        component={CoachTabs}
        options={{ headerShown: false }}
      />
      <CoachStack.Screen name="PlayerProfile" component={PlayerProfileScreen} options={{ title: "Player" }} />
      <CoachStack.Screen name="AddLesson" component={AddLessonScreen} options={{ title: "New Lesson" }} />
      <CoachStack.Screen name="LogProgress" component={LogProgressScreen} options={{ title: "Log Measurement" }} />
      <CoachStack.Screen name="Availability" component={AvailabilityScreen} options={{ title: "Availability" }} />
      <CoachStack.Screen name="InvitePlayer" component={InvitePlayerScreen} options={{ title: "Invite Player" }} />
      <CoachStack.Screen name="Account" component={AccountScreen} options={{ title: "Account" }} />
      <CoachStack.Screen name="PublicCoachProfile" component={PublicCoachProfileScreen} options={{ title: "Public Profile" }} />
    </CoachStack.Navigator>
  );
}

function PlayerNavigator() {
  return (
    <PlayerStack.Navigator screenOptions={headerOptions}>
      <PlayerStack.Screen
        name="PlayerTabs"
        component={PlayerTabs}
        options={{ headerShown: false }}
      />
      <PlayerStack.Screen name="BookLesson" component={PlayerBookLessonScreen} options={{ title: "Book a Lesson" }} />
      <PlayerStack.Screen name="Account" component={AccountScreen} options={{ title: "Account" }} />
    </PlayerStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, initializing, isCoach } = useAuth();

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const ensureMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }
      Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
    };
    ensureMeta('meta[name="description"]', { name: "description", content: "Run your golf coaching business with student CRM, scheduling, practice plans, progress tracking, and payment status in one workspace." });
    ensureMeta('meta[name="robots"]', { name: "robots", content: user ? "noindex,nofollow" : "index,follow,max-image-preview:large" });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: "TeeLesson | Golf coach management software" });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: "Students, lessons, practice, progress, and payments in one focused coaching workspace." });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: "https://teelesson.app/" });
    ensureMeta('meta[property="og:image"]', { property: "og:image", content: "https://teelesson.app/social-card.png" });
    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: "https://teelesson.app/social-card.png" });
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://teelesson.app${window.location.pathname === "/" ? "/" : window.location.pathname}`;
  }, [user]);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-fairway-700">
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking as any}>
      {!user ? <AuthNavigator /> : isCoach ? <CoachNavigator /> : <PlayerNavigator />}
    </NavigationContainer>
  );
}
