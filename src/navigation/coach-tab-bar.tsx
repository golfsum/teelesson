import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BrandMark from "@/components/brand-mark";
import GolfLineIcon, { type GolfIconName } from "@/components/GolfLineIcon";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";
import type { CoachTabsParamList } from "./types";

type RouteName = keyof CoachTabsParamList;

const DESKTOP_ITEMS: Array<{
  route: RouteName;
  label: string;
  icon: GolfIconName;
}> = [
  { route: "Dashboard", label: "Dashboard", icon: "dashboard" },
  { route: "Players", label: "Students", icon: "students" },
  { route: "Schedule", label: "Schedule", icon: "schedule" },
  { route: "Programs", label: "Lesson Plans", icon: "lesson-plan" },
  { route: "Videos", label: "Video Reviews", icon: "video-review" },
  { route: "Reports", label: "Analytics", icon: "analytics" },
  { route: "Profile", label: "Settings", icon: "settings" },
];

function DesktopTabBar({ state, navigation }: BottomTabBarProps) {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const active = state.routes[state.index]?.name;
  const railWidth = width >= 1500 ? 190 : 172;

  return (
    <View
      style={{
        width: railWidth,
        backgroundColor: "#081013",
        paddingHorizontal: 16,
        paddingTop: 22,
        paddingBottom: 18,
        borderRightWidth: 1,
        borderRightColor: "rgba(255,255,255,0.08)",
      }}
    >
      <View style={{ paddingHorizontal: 0, paddingBottom: 38 }}>
        <BrandMark compact />
      </View>
      <View style={{ gap: 10 }}>
        {DESKTOP_ITEMS.map((item) => {
          const selected = active === item.route;
          return (
            <Pressable
              key={`${item.route}-${item.label}`}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => navigation.navigate(item.route)}
              style={({ pressed }) => ({
                minHeight: 38,
                borderRadius: 7,
                paddingHorizontal: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 11,
                backgroundColor: selected ? "#067a43" : pressed ? "#121d20" : "transparent",
              })}
            >
              <GolfLineIcon
                name={item.icon}
                size={22}
                color={selected ? colors.white : "#edf6f2"}
                accent={selected ? "#d9ffcc" : "#8ce962"}
                muted={selected ? "rgba(255,255,255,0.74)" : "#8b9a95"}
                strokeWidth={7.2}
                simple
              />
              <Text
                style={{
                  color: selected ? colors.white : "#c7d2cf",
                  fontSize: 13,
                  fontWeight: selected ? "800" : "500",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      {height >= 420 ? (
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingTop: 16 }}
        >
          <Avatar name={user?.name ?? "Coach"} uri={user?.photoURL} size={32} />
          <Text numberOfLines={1} style={{ flex: 1, color: "#dfe8e5", fontSize: 11.5, fontWeight: "700" }}>
            {user?.name ?? "Coach"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MobileItem({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: GolfIconName;
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{ flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", gap: 3 }}
    >
      <GolfLineIcon
        name={icon}
        size={24}
        color={selected ? colors.white : "#d8e1de"}
        accent={selected ? "#a5ff78" : "#8ced62"}
        muted="#9aaba5"
        strokeWidth={6.4}
        simple
      />
      <Text style={{ color: selected ? "#b7ff93" : "#f4f8f6", fontSize: 11, fontWeight: selected ? "800" : "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function MobileTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [moreOpen, setMoreOpen] = useState(false);
  const active = state.routes[state.index]?.name;
  const stack = navigation.getParent<any>();
  const moreItems = DESKTOP_ITEMS.filter((item) => !["Dashboard", "Players", "Messages"].includes(item.route));

  return (
    <View
      style={{
        minHeight: 66 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 7),
        paddingHorizontal: 4,
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#020b08",
        borderTopWidth: 1,
        borderTopColor: "rgba(140,237,98,0.52)",
      }}
    >
      {moreOpen ? (
        <View style={{ position: "absolute", right: 8, bottom: 70 + insets.bottom, width: 270, borderRadius: 12, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.fairway[300], padding: 10, flexDirection: "row", flexWrap: "wrap", gap: 6, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          {moreItems.map((item) => (
            <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => { setMoreOpen(false); navigation.navigate(item.route); }} style={{ width: "48%", minHeight: 42, borderRadius: 8, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: active === item.route ? colors.fairway[50] : colors.white }}>
              <GolfLineIcon name={item.icon} size={19} color={colors.ink[800]} accent={colors.fairway[600]} muted={colors.ink[400]} strokeWidth={6.6} simple />
              <Text style={{ color: colors.ink[900], fontSize: 12, fontWeight: active === item.route ? "800" : "700" }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <MobileItem icon="dashboard" label="Today" selected={active === "Dashboard"} onPress={() => navigation.navigate("Dashboard")} />
      <MobileItem icon="students" label="Students" selected={active === "Players"} onPress={() => navigation.navigate("Players")} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a new lesson"
        onPress={() => stack?.navigate("AddLesson")}
        style={{ flex: 1, alignItems: "center", marginTop: -18 }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.fairway[500],
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 4,
            borderColor: colors.navy,
            boxShadow: "0 5px 14px rgba(0,0,0,0.3)",
          }}
        >
          <Ionicons name="add" size={29} color={colors.navy} />
        </View>
        <Text style={{ color: colors.white, fontSize: 11, fontWeight: "800", marginTop: 1 }}>New</Text>
      </Pressable>
      <MobileItem icon="messages" label="Messages" selected={active === "Messages"} onPress={() => navigation.navigate("Messages")} />
      <MobileItem icon="settings" label="More" selected={moreOpen || active === "Profile"} onPress={() => setMoreOpen((open) => !open)} />
    </View>
  );
}

export default function CoachTabBar(props: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  return width >= 1024 ? <DesktopTabBar {...props} /> : <MobileTabBar {...props} />;
}
