import React from "react";
import { Text, View } from "react-native";

import { STATUS_STYLES } from "@/theme";
import type { LessonStatus } from "@/types";

export function Badge({
  label,
  bg = "bg-ink-100",
  text = "text-ink-700",
}: {
  label: string;
  bg?: string;
  text?: string;
}) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}

/** Status pill for a lesson, colored per STATUS_STYLES. */
export function StatusBadge({ status }: { status: LessonStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.completed;
  return <Badge label={s.label} bg={s.bg} text={s.text} />;
}

export default Badge;
