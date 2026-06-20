import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card, Avatar } from "@/components/ui";
import { colors } from "@/theme";
import type { Player } from "@/types";

interface PlayerGridCardProps {
  player: Player;
  onPress?: () => void;
  /** Has at least one upcoming lesson. */
  active?: boolean;
  /** Total lessons booked with this player. */
  lessonCount?: number;
}

/** Small metadata row: icon + text. */
function MetaRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icon} size={14} color={colors.ink[400]} />
      <Text className="flex-1 text-sm text-ink-500" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/**
 * Grid tile for a player — avatar + name, an active/inactive status pill, and
 * handicap / lesson-count metadata rows. Themed in fairway green.
 */
export default function PlayerGridCard({
  player,
  onPress,
  active = false,
  lessonCount = 0,
}: PlayerGridCardProps) {
  const handicapText =
    player.handicap !== undefined ? `Handicap ${player.handicap}` : "No handicap set";
  const lessonText = `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`;

  return (
    <Card onPress={onPress} className="relative gap-y-3">
      {/* Status pill — top-right corner */}
      <View
        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 ${
          active ? "bg-fairway-500" : "bg-ink-200"
        }`}
      >
        <Text
          className={`text-[11px] font-semibold ${
            active ? "text-white" : "text-ink-500"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </Text>
      </View>

      {/* Identity */}
      <View className="flex-row items-center gap-x-3 pr-16">
        <Avatar name={player.name} uri={player.photoURL} size={44} />
        <Text className="flex-1 text-base font-bold text-ink-900" numberOfLines={1}>
          {player.name}
        </Text>
      </View>

      {/* Metadata */}
      <View className="gap-y-2">
        <MetaRow icon="golf-outline" text={handicapText} />
        <MetaRow icon="calendar-outline" text={lessonText} />
      </View>
    </Card>
  );
}
