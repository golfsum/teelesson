import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";

export function WorkspaceHeading({
  icon,
  title,
  subtitle,
  action,
  compact = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: compact ? 38 : 42, height: compact ? 38 : 42, borderRadius: 13, backgroundColor: colors.navySoft, alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(3, 29, 24, 0.12)" }}>
          <Ionicons name={icon} size={compact ? 17 : 19} color={colors.fairway[300]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.fairway[700], fontSize: 8, fontWeight: "900", letterSpacing: 1.3 }}>COACH WORKSPACE</Text>
          <Text selectable style={{ color: colors.ink[900], fontSize: compact ? 21 : 25, fontWeight: "900", letterSpacing: -0.7 }}>{title}</Text>
          <Text selectable numberOfLines={compact ? 1 : 2} style={{ color: colors.ink[500], fontSize: compact ? 11 : 12, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
      {action}
    </View>
  );
}

export default WorkspaceHeading;
