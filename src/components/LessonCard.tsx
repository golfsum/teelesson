import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card, StatusBadge } from "@/components/ui";
import { LESSON_TYPE_LABELS, colors } from "@/theme";
import { formatDate, formatTime } from "@/utils/format";
import type { Lesson } from "@/types";

interface LessonCardProps {
  lesson: Lesson;
  /** Display name shown in the middle row — typically the player or coach name. */
  title?: string;
  onPress?: () => void;
  rightActions?: React.ReactNode;
}

/**
 * Summarises a single lesson: date/time + status badge, title + meta row,
 * optional truncated notes, and optional bottom-right actions.
 */
export default function LessonCard({
  lesson,
  title,
  onPress,
  rightActions,
}: LessonCardProps) {
  return (
    <Card onPress={onPress} className="gap-y-2">
      {/* ── Top row: date/time block + status badge ── */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-base font-bold text-ink-900">
            {formatDate(lesson.date)}
          </Text>
          <Text className="text-sm text-ink-500">
            {formatTime(lesson.startTime)}
          </Text>
        </View>
        <View className="items-end gap-y-1">
          <StatusBadge status={lesson.status} />
          {lesson.paid && (
            <View className="flex-row items-center gap-x-1 rounded-full bg-fairway-100 px-2 py-0.5">
              <Ionicons name="cash-outline" size={12} color={colors.fairway[600]} />
              <Text className="text-xs font-semibold text-fairway-700">Paid</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Middle: name + type/duration meta row ── */}
      {!!title && (
        <Text className="text-base font-semibold text-ink-900">{title}</Text>
      )}

      <View className="flex-row items-center gap-x-1.5">
        <Ionicons
          name="calendar-outline"
          size={14}
          color={colors.ink[500]}
        />
        <Text className="text-sm text-ink-500">
          {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}
          {"  ·  "}
          {lesson.duration} min
        </Text>
      </View>

      {/* ── Optional notes (truncated) ── */}
      {!!lesson.notes && (
        <Text
          className="text-sm text-ink-500"
          numberOfLines={2}
        >
          {lesson.notes}
        </Text>
      )}

      {/* ── Bottom-right actions ── */}
      {!!rightActions && (
        <View className="mt-1 flex-row justify-end">{rightActions}</View>
      )}
    </Card>
  );
}
