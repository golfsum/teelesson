import React, { useState } from "react";
import { Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BrandMark from "@/components/brand-mark";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";
import type { CoachTabsParamList } from "./types";

type RouteName = keyof CoachTabsParamList;

const DESKTOP_ITEMS: Array<{
  route: RouteName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { route: "Dashboard", label: "Dashboard", icon: "home-outline" },
  { route: "Players", label: "Students", icon: "people-outline" },
  { route: "Schedule", label: "Schedule", icon: "calendar-outline" },
  { route: "Lessons", label: "Lessons", icon: "time-outline" },
  { route: "Messages", label: "Messages", icon: "mail-outline" },
  { route: "Programs", label: "Programs", icon: "book-outline" },
  { route: "Payments", label: "Payments", icon: "card-outline" },
  { route: "Reports", label: "Reports", icon: "stats-chart-outline" },
  { route: "Videos", label: "Videos", icon: "videocam-outline" },
  { route: "Drills", label: "Drills Library", icon: "clipboard-outline" },
  { route: "Profile", label: "Settings", icon: "settings-outline" },
];

function DesktopTabBar({ state, navigation }: BottomTabBarProps) {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const active = state.routes[state.index]?.name;
  const railWidth = width >= 1500 ? 224 : 204;
  const showPromo = height >= 820;

  return (
    <View
      style={{
        width: railWidth,
        backgroundColor: colors.navy,
        paddingHorizontal: 14,
        paddingTop: 18,
        paddingBottom: 16,
        borderRightWidth: 1,
        borderRightColor: "rgba(92, 227, 159, 0.12)",
      }}
    >
      <View style={{ paddingHorizontal: 10, paddingBottom: 14 }}>
        <BrandMark compact tagline />
      </View>
      <View style={{ marginHorizontal: 10, marginBottom: 13, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald }} />
        <Text style={{ color: "#87a49a", fontSize: 8, fontWeight: "800", letterSpacing: 1.25 }}>LIVE WORKSPACE</Text>
      </View>
      <View style={{ gap: 3 }}>
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
                minHeight: 37,
                borderRadius: 10,
                paddingHorizontal: 11,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: selected ? "#0b4535" : pressed ? colors.navySoft : "transparent",
                borderWidth: selected ? 1 : 0,
                borderColor: selected ? "rgba(92, 227, 159, 0.22)" : "transparent",
              })}
            >
              <Ionicons
                name={item.icon}
                size={17}
                color={selected ? colors.fairway[300] : "#c8d6d1"}
              />
              <Text
                style={{
                  color: selected ? colors.white : "#e6ecea",
                  fontSize: 11.5,
                  fontWeight: selected ? "700" : "500",
                }}
              >
                {item.label}
              </Text>
              {item.route === "Messages" ? (
                <View style={{ marginLeft: "auto", minWidth: 22, height: 20, paddingHorizontal: 6, borderRadius: 10, backgroundColor: colors.fairway[600], alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.white, fontSize: 10, fontWeight: "800" }}>3</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <Pressable
        onPress={() => navigation.navigate("Profile")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
          paddingHorizontal: 0,
          paddingVertical: 13,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Avatar name={user?.name} uri={user?.photoURL} size={38} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: colors.white, fontSize: 11.5, fontWeight: "700" }}>
            {user?.name ?? "Coach"}
          </Text>
          <Text style={{ color: colors.fairway[300], fontSize: 10.5, marginTop: 2 }}>{user?.subscriptionPlan ?? "Pro"} Plan</Text>
        </View>
        <Ionicons name="chevron-down" size={14} color="#9eaeaa" />
      </Pressable>
      {showPromo ? (
        <View style={{ height: 242, marginTop: 8, borderRadius: 14, overflow: "hidden", backgroundColor: "#082a23", padding: 14, borderWidth: 1, borderColor: "rgba(92,227,159,0.13)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800" }}>Mobile command</Text>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.emerald }} />
          </View>
          <Text style={{ color: "#a9beb7", fontSize: 9.5, marginTop: 6 }}>Your coaching day, synced.</Text>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1, gap: 7, alignSelf: "center" }}>
              <View style={{ height: 34, borderRadius: 5, borderWidth: 1, borderColor: "#667570", backgroundColor: "#050807", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons name="logo-apple" size={15} color={colors.white} />
                <View><Text style={{ color: colors.white, fontSize: 6.5 }}>Download on the</Text><Text style={{ color: colors.white, fontSize: 10, fontWeight: "700" }}>App Store</Text></View>
              </View>
              <View style={{ height: 34, borderRadius: 5, borderWidth: 1, borderColor: "#667570", backgroundColor: "#050807", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons name="logo-google-playstore" size={15} color="#7ad6a0" />
                <View><Text style={{ color: colors.white, fontSize: 6.5 }}>GET IT ON</Text><Text style={{ color: colors.white, fontSize: 9, fontWeight: "700" }}>Google Play</Text></View>
              </View>
            </View>
            <View style={{ width: 72, height: 142, borderWidth: 2, borderColor: "#8b9692", borderRadius: 14, backgroundColor: "#050807", overflow: "hidden", padding: 3 }}>
              <Image source={require("../../assets/mobile-app-preview.png")} resizeMode="cover" style={{ width: "100%", height: "100%", borderRadius: 10 }} />
            </View>
          </View>
        </View>
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
  icon: keyof typeof Ionicons.glyphMap;
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
      style={{ flex: 1, minHeight: 52, alignItems: "center", justifyContent: "center", gap: 2 }}
    >
      <Ionicons name={icon} size={20} color={selected ? colors.fairway[400] : "#d8e1de"} />
      <Text style={{ color: selected ? colors.fairway[300] : colors.white, fontSize: 9.5, fontWeight: "600" }}>
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
        minHeight: 58 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 5),
        paddingHorizontal: 4,
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: colors.navy,
        borderTopWidth: 1,
        borderTopColor: "rgba(92,227,159,0.18)",
      }}
    >
      {moreOpen ? (
        <View style={{ position: "absolute", right: 8, bottom: 62 + insets.bottom, width: 270, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink[200], padding: 10, flexDirection: "row", flexWrap: "wrap", gap: 6, boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}>
          {moreItems.map((item) => (
            <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => { setMoreOpen(false); navigation.navigate(item.route); }} style={{ width: "48%", minHeight: 42, borderRadius: 8, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: active === item.route ? colors.fairway[50] : colors.white }}>
              <Ionicons name={item.icon} size={17} color={active === item.route ? colors.fairway[600] : colors.ink[600]} />
              <Text style={{ color: colors.ink[800], fontSize: 11, fontWeight: active === item.route ? "700" : "600" }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <MobileItem icon="calendar-outline" label="Today" selected={active === "Dashboard"} onPress={() => navigation.navigate("Dashboard")} />
      <MobileItem icon="people-outline" label="Students" selected={active === "Players"} onPress={() => navigation.navigate("Players")} />
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
        <Text style={{ color: colors.white, fontSize: 9.5, fontWeight: "600", marginTop: 1 }}>New</Text>
      </Pressable>
      <MobileItem icon="chatbox-outline" label="Messages" selected={active === "Messages"} onPress={() => navigation.navigate("Messages")} />
      <MobileItem icon={moreOpen ? "close-outline" : "menu-outline"} label="More" selected={moreOpen || active === "Profile"} onPress={() => setMoreOpen((open) => !open)} />
    </View>
  );
}

export default function CoachTabBar(props: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  return width >= 1024 ? <DesktopTabBar {...props} /> : <MobileTabBar {...props} />;
}
