import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";
import type { CoachTabsParamList } from "./types";

import CoachDashboardScreen from "@/screens/coach/CoachDashboardScreen";
import PlayersListScreen from "@/screens/coach/PlayersListScreen";
import ScheduleScreen from "@/screens/coach/ScheduleScreen";
import CoachProfileScreen from "@/screens/coach/CoachProfileScreen";

const Tab = createBottomTabNavigator<CoachTabsParamList>();

const ICONS: Record<keyof CoachTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "grid-outline",
  Players: "people-outline",
  Schedule: "calendar-outline",
  Profile: "person-circle-outline",
};

export default function CoachTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.fairway[500] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
        tabBarStyle: { backgroundColor: colors.fairway[500], borderTopWidth: 0 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={CoachDashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Players"
        component={PlayersListScreen}
        options={{ title: "Players" }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Schedule" }}
      />
      <Tab.Screen
        name="Profile"
        component={CoachProfileScreen}
        options={{ title: "My Profile" }}
      />
    </Tab.Navigator>
  );
}
