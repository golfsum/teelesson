import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";
import Button from "./Button";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly placeholder for empty lists. */
export function EmptyState({
  icon = "golf-outline",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-fairway-100">
        <Ionicons name={icon} size={30} color={colors.fairway[600]} />
      </View>
      <Text className="text-center text-lg font-bold text-ink-900">{title}</Text>
      {message ? (
        <Text className="mt-1 text-center text-sm text-ink-500">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-5">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export default EmptyState;
