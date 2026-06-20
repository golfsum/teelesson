import React from "react";
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

// Shared / coach detail screens
import PlayerProfileScreen from "@/screens/coach/PlayerProfileScreen";
import AddLessonScreen from "@/screens/coach/AddLessonScreen";
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
    background: colors.ink[50],
    card: colors.fairway[500],
    text: colors.white,
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
    },
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.fairway[500] },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: "700" as const },
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
        options={{ headerShown: true, title: "Create Account", ...headerOptions }}
      />
      <AuthStack.Screen
        name="PublicCoachProfile"
        component={PublicCoachProfileScreen}
        options={{ headerShown: false }}
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
