import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  hint?: string;
}

/** Compact metric tile used on the coach dashboard. */
export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl border border-ink-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-ink-500">{label}</Text>
        {icon ? (
          <View className="h-8 w-8 items-center justify-center rounded-full bg-fairway-100">
            <Ionicons name={icon} size={16} color={colors.fairway[600]} />
          </View>
        ) : null}
      </View>
      <Text className="mt-2 text-2xl font-extrabold text-ink-900">{value}</Text>
      {hint ? <Text className="mt-0.5 text-xs text-ink-400">{hint}</Text> : null}
    </View>
  );
}

export default StatCard;
