import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";
import type { PlayerTabsParamList } from "./types";

import PlayerHomeScreen from "@/screens/player/PlayerHomeScreen";
import BookLessonScreen from "@/screens/player/BookLessonScreen";

const Tab = createBottomTabNavigator<PlayerTabsParamList>();

const ICONS: Record<keyof PlayerTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Book: "add-circle-outline",
};

export default function PlayerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        animation: "shift",
        headerShown: false,
        tabBarActiveTintColor: colors.fairway[400],
        tabBarInactiveTintColor: "#d8e1de",
        tabBarStyle: { backgroundColor: colors.navy, borderTopWidth: 0 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={PlayerHomeScreen} options={{ title: "My Lessons" }} />
      <Tab.Screen name="Book" component={BookLessonScreen} options={{ title: "Book" }} />
    </Tab.Navigator>
  );
}
