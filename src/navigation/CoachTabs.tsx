import React from "react";
import { useWindowDimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import type { CoachTabsParamList } from "./types";
import CoachTabBar from "./coach-tab-bar";

import CoachDashboardScreen from "@/screens/coach/CoachDashboardScreen";
import PlayersListScreen from "@/screens/coach/PlayersListScreen";
import ScheduleScreen from "@/screens/coach/ScheduleScreen";
import CoachProfileScreen from "@/screens/coach/CoachProfileScreen";
import CoachWorkspaceScreen from "@/screens/coach/coach-workspace-screen";

const Tab = createBottomTabNavigator<CoachTabsParamList>();

export default function CoachTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  return (
    <Tab.Navigator
      tabBar={(props) => <CoachTabBar {...props} />}
      screenOptions={{
        animation: isDesktop ? "none" : "shift",
        headerShown: false,
        tabBarPosition: isDesktop ? "left" : "bottom",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={CoachDashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Players"
        component={PlayersListScreen}
        options={{ title: "Students" }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Schedule" }}
      />
      <Tab.Screen name="Lessons" component={CoachWorkspaceScreen} />
      <Tab.Screen name="Messages" component={CoachWorkspaceScreen} />
      <Tab.Screen name="Programs" component={CoachWorkspaceScreen} />
      <Tab.Screen name="Payments" component={CoachWorkspaceScreen} />
      <Tab.Screen name="Reports" component={CoachWorkspaceScreen} />
      <Tab.Screen name="Videos" component={CoachWorkspaceScreen} />
      <Tab.Screen name="Drills" component={CoachWorkspaceScreen} options={{ title: "Drills Library" }} />
      <Tab.Screen
        name="Profile"
        component={CoachProfileScreen}
        options={{ title: "My Profile" }}
      />
    </Tab.Navigator>
  );
}
