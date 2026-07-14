import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, Button } from "@/components/ui";
import { DonutRing, Sparkline } from "@/components/charts/Charts";
import { USE_DEMO_DATA } from "@/firebase/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import { useProgress } from "@/hooks/useProgress";
import { colors } from "@/theme";
import { currency, formatTime, todayISO } from "@/utils/format";
import { lessonParticipantLabel } from "@/utils/lessons";
import type { Lesson, Player } from "@/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const SURFACE = {
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.forestLine,
  borderRadius: 14,
  borderCurve: "continuous" as const,
  boxShadow: "0 1px 2px rgba(3, 29, 24, 0.035), 0 12px 30px rgba(3, 29, 24, 0.035)",
  overflow: "hidden" as const,
};

type DashboardFacts = {
  lessonsThisWeek: number;
  monthRevenue: number;
  activeStudents: number;
  homeworkCompletion: number;
  unpaidCount: number;
  outstandingAmount: number;
};

type ActionItem = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  title: string;
  detail: string;
  button: string;
  route: string;
};

type DashboardRange = "today" | "week" | "month";

function Surface({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[SURFACE, style]}>{children}</View>;
}

function IconTile({
  icon,
  color,
  background,
  size = 34,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        backgroundColor: background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
  detail,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  detail?: string;
}) {
  return (
    <View
      style={{
        minHeight: 46,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: colors.forestLine,
        backgroundColor: "#fbfdfc",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.ink[900], fontSize: 12.5, fontWeight: "800" }}>{title}</Text>
        {detail ? <Text style={{ color: colors.ink[500], fontSize: 8.5, marginTop: 2 }}>{detail}</Text> : null}
      </View>
      {action ? (
        <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction}>
          <Text style={{ color: colors.blue, fontSize: 9.5, fontWeight: "700" }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function DashboardContextBar({
  phone,
  range,
  onRangeChange,
  onAI,
}: {
  phone: boolean;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  onAI: () => void;
}) {
  const items: { label: string; value: DashboardRange }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
  ];
  return (
    <View style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", padding: 3 }} style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", borderRadius: 10, backgroundColor: colors.ink[100], padding: 3 }}>
        {items.map((item) => {
          const active = range === item.value;
          return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            accessibilityLabel={`Show ${item.label} dashboard`}
            accessibilityState={{ selected: active }}
            onPress={() => onRangeChange(item.value)}
            style={{
              minHeight: 29,
              paddingHorizontal: phone ? 11 : 15,
              borderRadius: 7,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? colors.white : "transparent",
              boxShadow: active ? "0 1px 3px rgba(3, 29, 24, 0.1)" : "none",
            }}
          >
            <Text style={{ color: active ? colors.ink[900] : colors.ink[500], fontSize: 9.5, fontWeight: "800" }}>{item.label}</Text>
          </Pressable>
          );
        })}
        </View>
      </ScrollView>
      {!phone ? (
        <View style={{ minHeight: 32, paddingHorizontal: 11, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink[200] }}>
          <Ionicons name="sync-outline" size={13} color={colors.fairway[600]} />
          <Text style={{ color: colors.ink[600], fontSize: 9, fontWeight: "700" }}>Live workspace</Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open AI Coach brief"
        onPress={onAI}
        style={{ minHeight: 32, paddingHorizontal: phone ? 10 : 13, borderRadius: 16, backgroundColor: colors.emerald, flexDirection: "row", alignItems: "center", gap: 6, boxShadow: "0 6px 18px rgba(25, 212, 125, 0.2)" }}
      >
        <Ionicons name="sparkles-outline" size={13} color={colors.navy} />
        {!phone ? <Text style={{ color: colors.navy, fontSize: 9.5, fontWeight: "900" }}>AI brief</Text> : null}
      </Pressable>
    </View>
  );
}

function CoachBrief({
  range,
  facts,
  lessonCount,
  workloadMinutes,
  onOpenAI,
  phone,
}: {
  range: DashboardRange;
  facts: DashboardFacts;
  lessonCount: number;
  workloadMinutes: number;
  onOpenAI: () => void;
  phone: boolean;
}) {
  const rangeLabel = range === "today" ? "Today’s Brief" : range === "week" ? "This Week" : "This Month";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: range === "today" ? "long" : undefined,
    month: "long",
    day: range === "month" ? undefined : "numeric",
    year: range === "month" ? "numeric" : undefined,
  }).format(new Date());
  const items = [
    { value: lessonCount, label: lessonCount === 1 ? "lesson" : "lessons", color: colors.fairway[500] },
    { value: 3, label: "student follow-ups", color: colors.orange },
    { value: 2, label: "swing videos", color: colors.purple },
    { value: facts.unpaidCount, label: "unpaid lessons", color: colors.danger },
  ];
  const hours = Math.floor(workloadMinutes / 60);
  const minutes = workloadMinutes % 60;
  const workload = `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m` : ""}`.trim() || "No lessons";

  return (
    <Surface style={{ padding: phone ? 14 : 18, backgroundColor: "#f4faf6", borderColor: colors.fairway[200] }}>
      <View style={{ flexDirection: phone ? "column" : "row", alignItems: phone ? "stretch" : "center", gap: 14 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Text style={{ color: colors.ink[900], fontSize: 14, fontWeight: "900" }}>{rangeLabel}</Text>
            <Text style={{ color: colors.ink[500], fontSize: 9.5 }}>{dateLabel}</Text>
          </View>
          <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {items.map((item) => (
              <View key={item.label} style={{ minHeight: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.forestLine, flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: item.color }} />
                <Text style={{ color: colors.ink[700], fontSize: 9, fontWeight: "700" }}>
                  <Text style={{ color: colors.ink[900], fontWeight: "900" }}>{item.value}</Text> {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ minWidth: phone ? undefined : 224, paddingLeft: phone ? 0 : 16, borderLeftWidth: phone ? 0 : 1, borderLeftColor: colors.fairway[200] }}>
          <Text style={{ color: colors.ink[500], fontSize: 8.5, fontWeight: "700" }}>COACHING WORKLOAD</Text>
          <Text style={{ color: colors.ink[900], fontSize: 20, fontWeight: "900", marginTop: 2 }}>{workload}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open today’s AI plan" onPress={onOpenAI} style={{ marginTop: 7, flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="sparkles-outline" size={12} color={colors.fairway[600]} />
            <Text style={{ color: colors.fairway[700], fontSize: 9, fontWeight: "900" }}>Build today’s plan</Text>
            <Ionicons name="arrow-forward" size={11} color={colors.fairway[600]} />
          </Pressable>
        </View>
      </View>
    </Surface>
  );
}

const SPARKS = [
  [14, 20, 16, 12, 14, 26, 21, 28],
  [11, 12, 20, 18, 13, 22, 25, 31],
  [12, 14, 27, 23, 11, 13, 20, 18, 29, 26, 34],
  [17, 19, 18, 22, 21, 25, 27, 29],
  [27, 25, 24, 20, 18, 14, 11, 9],
];

function MetricCard({
  index,
  icon,
  iconColor,
  iconBackground,
  label,
  value,
  trend,
  down,
  compact,
  style,
}: {
  index: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  label: string;
  value: string;
  trend: string;
  down?: boolean;
  compact?: boolean;
  style?: any;
}) {
  return (
    <Surface style={[{ height: 98, padding: compact ? 11 : 13, paddingTop: compact ? 13 : 15, flexDirection: "row", alignItems: "center", gap: 10 }, style]}>
      <View style={{ position: "absolute", left: 14, right: 14, top: 0, height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: iconColor }} />
      <IconTile icon={icon} color={iconColor} background={iconBackground} size={compact ? 32 : 36} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: colors.ink[600], fontSize: compact ? 7.4 : 9.5 }}>
          {label.toUpperCase()}
        </Text>
        <Text
          selectable
          numberOfLines={1}
          style={{
            color: colors.ink[900],
            fontSize: compact ? 20 : 24,
            lineHeight: compact ? 25 : 28,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
          }}
        >
          {value}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Ionicons
            name={down ? "arrow-down" : "arrow-up"}
            size={10}
            color={down ? colors.danger : colors.fairway[600]}
          />
          <Text
            numberOfLines={1}
            style={{
              color: down ? colors.danger : colors.fairway[600],
              fontSize: compact ? 7.5 : 8.5,
              fontWeight: "700",
            }}
          >
            {trend}
          </Text>
        </View>
      </View>
      {!compact ? (
        <Sparkline
          values={SPARKS[index]}
          color={down ? colors.orange : colors.fairway[600]}
          width={58}
          height={34}
          strokeWidth={1.5}
        />
      ) : null}
    </Surface>
  );
}

function AICoachCard({
  expanded,
  onToggle,
  onOpenStudent,
  stacked,
}: {
  expanded: boolean;
  onToggle: () => void;
  onOpenStudent: () => void;
  stacked: boolean;
}) {
  return (
    <Surface
      style={{
        minHeight: expanded ? (stacked ? 202 : 108) : 68,
        padding: 14,
        backgroundColor: colors.navy,
        borderColor: "#0c4a3b",
        boxShadow: "0 14px 32px rgba(3, 29, 24, 0.14)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
        <IconTile icon="sparkles-outline" color={colors.navy} background={colors.emerald} size={40} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Text style={{ color: colors.white, fontSize: 12.5, fontWeight: "800" }}>Today’s AI Coach</Text>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: "#0e493a" }}>
              <Text style={{ color: colors.fairway[300], fontSize: 7.5, fontWeight: "800" }}>3 INSIGHTS</Text>
            </View>
          </View>
          <Text style={{ color: "#adc4bc", fontSize: 9.5, lineHeight: 14, marginTop: 3 }}>
            Benjamin is trending up. Three students need attention before your first lesson.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse AI Coach" : "Expand AI Coach"}
          onPress={onToggle}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={17} color="#adc4bc" />
        </Pressable>
      </View>
      {expanded ? (
        <View
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: "rgba(92, 227, 159, 0.18)",
            flexDirection: stacked ? "column" : "row",
            alignItems: stacked ? "stretch" : "center",
            gap: stacked ? 8 : 16,
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Ionicons name="trending-up-outline" size={14} color={colors.fairway[300]} />
            <Text style={{ flex: 1, color: "#d9e8e2", fontSize: 9, lineHeight: 13 }}>
              Benjamin’s driver dispersion improved 18%.
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Ionicons name="time-outline" size={14} color={colors.orange} />
            <Text style={{ flex: 1, color: "#d9e8e2", fontSize: 9, lineHeight: 13 }}>
              Emma’s package expires after tomorrow’s lesson.
            </Text>
          </View>
          <View style={{ flex: 1.1, flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Ionicons name="bulb-outline" size={14} color={colors.blue} />
            <Text style={{ flex: 1, color: "#d9e8e2", fontSize: 9, lineHeight: 13 }}>
              Suggest a 9-hole strategy lesson for Benjamin.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Benjamin’s AI recommendation"
            onPress={onOpenStudent}
            style={{
              minHeight: 34,
              borderRadius: 17,
              backgroundColor: colors.emerald,
              paddingHorizontal: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Text style={{ color: colors.navy, fontSize: 9, fontWeight: "900" }}>View suggestion</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.navy} />
          </Pressable>
        </View>
      ) : null}
    </Surface>
  );
}

function ScheduleColumn({
  lessons,
  playerMap,
  onOpen,
  columns,
}: {
  lessons: Lesson[];
  playerMap: Record<string, string>;
  onOpen: (lesson: Lesson) => void;
  columns: boolean;
}) {
  return (
    <View style={{ flex: columns ? 2 : undefined, height: columns ? undefined : 340, minWidth: 0 }}>
      <SectionTitle title="Today’s Schedule" action="View schedule" onAction={() => onOpen({ id: "schedule" } as Lesson)} />
      {lessons.slice(0, 5).map((lesson, index) => {
        const name = lessonParticipantLabel(lesson, playerMap);
        const isGroup = lesson.type === "group";
        const status = index === 0 ? "Next up" : index === 1 ? "Arriving" : index === 2 ? "In session" : isGroup ? "6 spots left" : undefined;
        return (
          <Pressable
            key={lesson.id}
            accessibilityRole="button"
            accessibilityLabel={"Open " + name + " lesson"}
            onPress={() => onOpen(lesson)}
            style={{
              flex: 1,
              minHeight: 58,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: index === 0 ? colors.fairway[50] : colors.white,
              borderTopWidth: index ? 1 : 0,
              borderTopColor: colors.ink[200],
            }}
          >
            <Text style={{ width: 58, color: colors.ink[900], fontSize: 10.5, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
              {formatTime(lesson.startTime)}
            </Text>
            {isGroup ? (
              <IconTile icon="people-outline" color={colors.ink[600]} background={colors.ink[100]} size={34} />
            ) : (
              <Avatar name={name} size={34} />
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ color: colors.ink[900], fontSize: 10.5, fontWeight: "800" }}>{name}</Text>
              <Text numberOfLines={1} style={{ color: colors.ink[500], fontSize: 8.5, marginTop: 3 }}>
                {lesson.title ?? "Lesson (" + lesson.duration + " min)"}
              </Text>
            </View>
            {status ? (
              <View
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: index === 2 ? "#e9c45c" : colors.fairway[300],
                  backgroundColor: index === 2 ? "#fff7d8" : colors.fairway[50],
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: index === 2 ? "#825c00" : colors.fairway[700], fontSize: 8, fontWeight: "800" }}>{status}</Text>
              </View>
            ) : null}
            <Ionicons name="ellipsis-vertical" size={14} color={colors.ink[500]} />
          </Pressable>
        );
      })}
    </View>
  );
}

function RecentActivityPanel({ onView, horizontal }: { onView: () => void; horizontal: boolean }) {
  const activities = [
    { icon: "golf-outline" as const, color: colors.fairway[600], background: colors.fairway[50], title: "Ava completed practice", detail: "Alignment Stick Gate", time: "2h" },
    { icon: "play-outline" as const, color: colors.blue, background: "#eef3ff", title: "Benjamin uploaded a video", detail: "Down the line swing", time: "3h" },
    { icon: "cash-outline" as const, color: colors.fairway[600], background: colors.fairway[50], title: "Payment received", detail: "$75 from Olivia Bennett", time: "5h" },
    { icon: "person-add-outline" as const, color: colors.blue, background: "#eef3ff", title: "New student added", detail: "William Grant", time: "1d" },
    { icon: "clipboard-outline" as const, color: colors.orange, background: colors.sand[50], title: "Practice plan assigned", detail: "Short Game Reset", time: "1d" },
  ];
  return (
    <Surface style={{ minHeight: horizontal ? 138 : 340 }}>
      <SectionTitle title="Recent Activity" action="View all" onAction={onView} />
      <View style={{ flex: 1, flexDirection: horizontal ? "row" : "column" }}>
        {activities.map((activity, index) => (
          <Pressable
            key={activity.title}
            accessibilityRole="button"
            accessibilityLabel={`Open activity: ${activity.title}`}
            onPress={onView}
            style={{
              flex: 1,
              minHeight: horizontal ? 88 : 58,
              paddingHorizontal: 12,
              paddingVertical: horizontal ? 11 : 7,
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              borderLeftWidth: horizontal && index ? 1 : 0,
              borderTopWidth: !horizontal && index ? 1 : 0,
              borderColor: colors.ink[200],
            }}
          >
            <IconTile icon={activity.icon} color={activity.color} background={activity.background} size={32} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={horizontal ? 2 : 1} style={{ color: colors.ink[900], fontSize: 9.5, lineHeight: 13, fontWeight: "800" }}>{activity.title}</Text>
              <Text numberOfLines={1} style={{ color: colors.ink[500], fontSize: 8.5, marginTop: 3 }}>{activity.detail}</Text>
              {horizontal ? <Text style={{ color: colors.ink[400], fontSize: 7.5, marginTop: 5 }}>{activity.time} ago</Text> : null}
            </View>
            {!horizontal ? <Text style={{ color: colors.ink[500], fontSize: 8 }}>{activity.time}</Text> : null}
          </Pressable>
        ))}
      </View>
    </Surface>
  );
}

function ActionCenter({
  items,
  onNavigate,
  columns,
}: {
  items: ActionItem[];
  onNavigate: (route: string) => void;
  columns: boolean;
}) {
  return (
    <View
      style={{
        flex: columns ? 1.2 : undefined,
        height: columns ? undefined : 340,
        minWidth: 0,
        borderLeftWidth: columns ? 1 : 0,
        borderTopWidth: columns ? 0 : 1,
        borderColor: colors.ink[200],
      }}
    >
      <SectionTitle title="Action Center" detail="What deserves attention next" />
      {items.map((item, index) => (
        <Pressable
          key={item.title}
          accessibilityRole="button"
          accessibilityLabel={item.button + ": " + item.title}
          onPress={() => onNavigate(item.route)}
          style={{
            flex: 1,
            minHeight: 58,
            paddingHorizontal: 11,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderTopWidth: index ? 1 : 0,
            borderTopColor: colors.ink[200],
          }}
        >
          <IconTile icon={item.icon} color={item.color} background={item.background} size={29} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ color: colors.ink[900], fontSize: 9, fontWeight: "800" }}>{item.title}</Text>
            <Text numberOfLines={1} style={{ color: colors.ink[500], fontSize: 7.8, marginTop: 2 }}>{item.detail}</Text>
          </View>
          <View style={{ borderRadius: 6, backgroundColor: colors.ink[100], paddingHorizontal: 7, paddingVertical: 5 }}>
            <Text style={{ color: colors.fairway[700], fontSize: 7.5, fontWeight: "800" }}>{item.button}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function OperationsHub({
  lessons,
  playerMap,
  actionItems,
  onOpenLesson,
  onNavigate,
  columns,
}: {
  lessons: Lesson[];
  playerMap: Record<string, string>;
  actionItems: ActionItem[];
  onOpenLesson: (lesson: Lesson) => void;
  onNavigate: (route: string) => void;
  columns: boolean;
}) {
  return (
    <Surface style={{ minHeight: columns ? 392 : 728 }}>
      <View
        style={{
          minHeight: 48,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.navySoft,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(92, 227, 159, 0.16)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: colors.emerald }} />
          <Text style={{ color: colors.white, fontSize: 14, fontWeight: "900", letterSpacing: -0.2 }}>Operations Hub</Text>
        </View>
        <Text style={{ color: "#a8beb6", fontSize: 8.5 }}>Your live coaching command center</Text>
      </View>
      <View style={{ flex: 1, flexDirection: columns ? "row" : "column" }}>
        <ScheduleColumn lessons={lessons} playerMap={playerMap} onOpen={onOpenLesson} columns={columns} />
        <ActionCenter items={actionItems} onNavigate={onNavigate} columns={columns} />
      </View>
    </Surface>
  );
}

function SpotlightPanel({
  player,
  nextLesson,
  onOpen,
}: {
  player: Player;
  nextLesson?: Lesson;
  onOpen: () => void;
}) {
  const { entries } = useProgress(player.id);
  const latest = entries.at(-1);
  return (
    <Surface style={{ flex: 1.35, minHeight: 252 }}>
      <SectionTitle title="Student Spotlight" action="View profile" onAction={onOpen} />
      <Pressable onPress={onOpen} style={{ flex: 1, padding: 13 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={player.name} uri={player.photoURL} size={58} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text numberOfLines={1} style={{ color: colors.ink[900], fontSize: 15, fontWeight: "900" }}>{player.name}</Text>
              <Ionicons name="star" size={14} color="#f3b51b" />
            </View>
            <Text numberOfLines={1} style={{ color: colors.ink[500], fontSize: 9, marginTop: 4 }}>{player.goals ?? "Build a repeatable swing"}</Text>
          </View>
          <Sparkline values={[19, 17, 18, 14, 12, 10, 9, 7]} color={colors.fairway[600]} width={90} height={40} />
        </View>
        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderTopColor: colors.ink[200] }}>
          {[
            ["Handicap", String(latest?.handicap ?? player.handicap ?? "Not set")],
            ["Last Lesson", "2 days ago"],
            ["Homework", "82% complete"],
            ["Swing Focus", "Driver dispersion"],
            ["Next Lesson", USE_DEMO_DATA ? "Tomorrow, 7:30" : nextLesson ? formatTime(nextLesson.startTime) : "Not booked"],
            ["Recent Progress", "18% tighter pattern"],
          ].map(([label, value], index) => (
            <View
              key={label}
              style={{
                width: "33.333%",
                paddingTop: 11,
                paddingLeft: index % 3 ? 11 : 0,
                borderLeftWidth: index % 3 ? 1 : 0,
                borderLeftColor: colors.ink[200],
              }}
            >
              <Text style={{ color: colors.ink[500], fontSize: 7.8 }}>{label}</Text>
              <Text numberOfLines={1} style={{ color: colors.ink[900], fontSize: 9.5, fontWeight: "800", marginTop: 4 }}>{value}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Surface>
  );
}

function PerformancePanel({
  completion,
  onView,
}: {
  players: Player[];
  completion: number;
  onView: () => void;
}) {
  const rows = [
    { icon: "trending-up-outline" as const, label: "Most improved", value: "Benjamin K.  +18%", color: colors.fairway[600] },
    { icon: "flame-outline" as const, label: "Most engaged", value: "Olivia B.  95%", color: colors.orange },
    { icon: "checkmark-circle-outline" as const, label: "Lesson attendance", value: "94% average", color: colors.blue },
  ];
  return (
    <Surface style={{ flex: 1, minHeight: 252 }}>
      <SectionTitle title="Performance" action="View reports" onAction={onView} />
      <View style={{ flex: 1, flexDirection: "row", padding: 14, gap: 14 }}>
        <View style={{ width: "38%", alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.ink[200] }}>
          <DonutRing percent={completion} color={colors.fairway[600]} size={106} strokeWidth={14}>
            <Text style={{ color: colors.ink[900], fontSize: 21, fontWeight: "900" }}>{completion}%</Text>
          </DonutRing>
          <Text style={{ color: colors.ink[500], fontSize: 8.5, marginTop: 7 }}>Practice completion</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "space-around" }}>
          {rows.map((row) => (
            <View key={row.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: colors.ink[50], alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={row.icon} size={14} color={row.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink[500], fontSize: 8 }}>{row.label}</Text>
                <Text numberOfLines={1} style={{ color: colors.ink[900], fontSize: 9.5, fontWeight: "800", marginTop: 2 }}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Surface>
  );
}

function UpcomingPanel({
  lessons,
  playerMap,
  onView,
}: {
  lessons: Lesson[];
  playerMap: Record<string, string>;
  onView: () => void;
}) {
  const rows = lessons.slice(5, 10);
  return (
    <Surface style={{ flex: 0.92, minHeight: 252 }}>
      <SectionTitle title="Upcoming Lessons" action="View calendar" onAction={onView} />
      <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 9 }}>
        {["Tomorrow", "Friday", "Saturday"].map((day, groupIndex) => {
          const group = rows.slice(groupIndex === 0 ? 0 : groupIndex === 1 ? 2 : 4, groupIndex === 0 ? 2 : groupIndex === 1 ? 4 : 5);
          return (
            <View key={day} style={{ flex: 1, borderTopWidth: groupIndex ? 1 : 0, borderTopColor: colors.ink[200], paddingTop: groupIndex ? 6 : 0 }}>
              <Text style={{ color: colors.ink[900], fontSize: 8.5, fontWeight: "900", marginBottom: 4 }}>{day}</Text>
              {group.map((lesson) => (
                <Pressable key={lesson.id} onPress={onView} style={{ minHeight: 23, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ width: 44, color: colors.ink[900], fontSize: 8, fontWeight: "800" }}>{formatTime(lesson.startTime)}</Text>
                  <Ionicons name={lesson.type === "group" ? "people-outline" : "golf-outline"} size={10} color={colors.fairway[600]} />
                  <Text numberOfLines={1} style={{ flex: 1, color: colors.ink[700], fontSize: 8.2 }}>{lessonParticipantLabel(lesson, playerMap)}</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>
    </Surface>
  );
}

function CommunicationCenter({ onNavigate }: { onNavigate: (route: string) => void }) {
  const items = [
    { icon: "mail-unread-outline" as const, label: "Unread messages", value: "5", route: "Messages", color: colors.blue },
    { icon: "videocam-outline" as const, label: "Practice videos", value: "2", route: "Videos", color: colors.purple },
    { icon: "people-outline" as const, label: "Parent replies", value: "1", route: "Messages", color: colors.orange },
    { icon: "calendar-outline" as const, label: "Booking requests", value: "3", route: "Schedule", color: colors.fairway[600] },
  ];
  return (
    <Surface style={{ flex: 1.35, minHeight: 162 }}>
      <SectionTitle title="Communication Center" detail="Every conversation that needs a response" />
      <View style={{ flex: 1, flexDirection: "row", padding: 12, gap: 8 }}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={"Open " + item.label}
            onPress={() => onNavigate(item.route)}
            style={{ flex: 1, minWidth: 0, borderRadius: 8, backgroundColor: colors.ink[50], padding: 10, justifyContent: "space-between" }}
          >
            <Ionicons name={item.icon} size={17} color={item.color} />
            <View>
              <Text style={{ color: colors.ink[900], fontSize: 17, fontWeight: "900" }}>{item.value}</Text>
              <Text numberOfLines={1} style={{ color: colors.ink[500], fontSize: 8.5, marginTop: 2 }}>{item.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Surface>
  );
}

function WinsPanel() {
  const wins = [
    "4 lessons completed",
    "$420 collected",
    "3 students finished homework",
    "Benjamin broke 80",
  ];
  return (
    <Surface style={{ flex: 1, minHeight: 162, backgroundColor: "#0b2a20", borderColor: "#0b2a20" }}>
      <View style={{ minHeight: 46, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}>
        <Ionicons name="trophy-outline" size={16} color="#f3c74e" />
        <Text style={{ color: colors.white, fontSize: 12.5, fontWeight: "900" }}>Today’s Wins</Text>
      </View>
      <View style={{ flex: 1, padding: 12, flexDirection: "row", flexWrap: "wrap", alignContent: "center" }}>
        {wins.map((win) => (
          <View key={win} style={{ width: "50%", minHeight: 37, flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Ionicons name="checkmark-circle" size={14} color={colors.fairway[300]} />
            <Text style={{ flex: 1, color: "#e5f1eb", fontSize: 9, lineHeight: 13 }}>{win}</Text>
          </View>
        ))}
      </View>
    </Surface>
  );
}

function DesktopDashboard({
  lessons,
  upcoming,
  players,
  loading,
  facts,
}: {
  lessons: Lesson[];
  upcoming: Lesson[];
  players: Player[];
  loading: boolean;
  facts: DashboardFacts;
}) {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const phone = width < 700;
  const wide = width >= 1500;
  const singleMetricRow = width >= 1180;
  const columns = width >= 1180;
  const compactColumns = width >= 900;
  const [search, setSearch] = useState("");
  const [aiExpanded, setAIExpanded] = useState(true);
  const [range, setRange] = useState<DashboardRange>("today");
  const playerMap = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.name])), [players]);
  const spotlight = players.find((player) => player.name === "Benjamin King") ?? players[0];
  const today = todayISO();
  const currentMonth = today.slice(0, 7);
  const rangeLessonCount = range === "today"
    ? upcoming.filter((lesson) => lesson.date === today).length
    : range === "month"
      ? upcoming.filter((lesson) => lesson.date.startsWith(currentMonth)).length
      : facts.lessonsThisWeek;
  const workloadMinutes = upcoming
    .filter((lesson) => range !== "today" || lesson.date === today)
    .slice(0, range === "today" ? 6 : 10)
    .reduce((total, lesson) => total + lesson.duration, 0);

  const openLesson = (lesson: Lesson) => {
    if (lesson.id === "schedule") {
      navigation.navigate("Schedule");
    } else if (lesson.playerId) {
      navigation.getParent()?.navigate("PlayerProfile", { playerId: lesson.playerId });
    } else {
      navigation.getParent()?.navigate("AddLesson", { date: lesson.date, startTime: lesson.startTime, replaceId: lesson.id });
    }
  };
  const navigateTab = (route: string) => navigation.navigate(route);
  const actionItems: ActionItem[] = [
    { icon: "alert-circle-outline", color: colors.danger, background: "#fff0f1", title: "Ava hasn’t booked in 30 days", detail: "Last lesson was 28 days ago", button: "Remind", route: "Messages" },
    { icon: "cash-outline", color: colors.fairway[600], background: colors.fairway[50], title: currency(facts.outstandingAmount) + " outstanding", detail: facts.unpaidCount + " unpaid lessons", button: "Collect", route: "Payments" },
    { icon: "golf-outline", color: colors.orange, background: colors.sand[50], title: "6 practice plans overdue", detail: "Homework needs follow-up", button: "Review", route: "Programs" },
    { icon: "videocam-outline", color: colors.purple, background: "#f7efff", title: "2 videos waiting for review", detail: "Oldest upload is 1 day old", button: "Watch", route: "Videos" },
    { icon: "chatbubble-ellipses-outline", color: colors.blue, background: "#eef3ff", title: "Parent awaiting reply", detail: "Junior clinic question", button: "Reply", route: "Messages" },
  ];

  const metricStyle = (index: number) => {
    if (singleMetricRow) return { flex: 1, minWidth: 0 };
    if (width >= 860) return { width: index < 3 ? "32.2%" : "49.2%" };
    return { width: index === 4 ? "100%" : phone ? "47.8%" : "49.2%" };
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.forestCanvas }}
      contentContainerStyle={{
        paddingLeft: phone ? 16 : wide ? 30 : 22,
        paddingRight: phone ? 16 : wide ? 30 : 22,
        paddingTop: phone ? 18 : 22,
        paddingBottom: 34,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ width: "100%" }}>
        <View style={{ minHeight: 70, flexDirection: "row", alignItems: "flex-start", gap: phone ? 8 : 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink[900], fontSize: phone ? 22 : 26, fontWeight: "900", letterSpacing: -0.7 }}>Today</Text>
            <Text style={{ color: colors.ink[500], fontSize: 11.5, marginTop: 6 }}>
              {range === "today"
                ? "You have 5 things that need attention before your first lesson."
                : range === "week"
                  ? "Here’s the coaching work and business activity shaping your week."
                  : "Here’s what to keep an eye on across your coaching business this month."}
            </Text>
          </View>
          {width >= 900 ? (
            <View style={{ width: wide ? 264 : 210, height: 36, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 7, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 7 }}>
              <Ionicons name="search-outline" size={15} color={colors.ink[400]} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => navigation.navigate("Players")}
                placeholder="Search students, lessons, notes..."
                placeholderTextColor={colors.ink[400]}
                style={{ flex: 1, color: colors.ink[900], fontSize: 10.5 }}
              />
            </View>
          ) : null}
          <Pressable
            onPress={() => navigation.navigate("Messages")}
            accessibilityLabel="Open notifications"
            style={{ width: 38, height: 36, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 7, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.ink[800]} />
            <View style={{ position: "absolute", right: 2, top: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.white, fontSize: 8, fontWeight: "800" }}>4</Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create new lesson"
            onPress={() => navigation.getParent()?.navigate("AddLesson")}
            style={{ width: phone ? 38 : undefined, height: 36, borderRadius: 18, backgroundColor: colors.fairway[500], paddingHorizontal: phone ? 0 : 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 18px rgba(10, 174, 99, 0.18)" }}
          >
            <Ionicons name="add" size={18} color={colors.navy} />
            {!phone ? <Text style={{ color: colors.navy, fontSize: 11, fontWeight: "900" }}>New</Text> : null}
            {!phone ? <Ionicons name="chevron-down" size={13} color={colors.navy} /> : null}
          </Pressable>
        </View>

        <View style={{ width: "100%" }}>
          <DashboardContextBar phone={phone} range={range} onRangeChange={setRange} onAI={() => setAIExpanded(true)} />
          {loading ? (
            <ActivityIndicator size="large" color={colors.fairway[600]} style={{ marginTop: 100 }} />
          ) : (
            <View style={{ gap: 14 }}>
              <CoachBrief
                range={range}
                facts={facts}
                lessonCount={rangeLessonCount}
                workloadMinutes={workloadMinutes}
                onOpenAI={() => setAIExpanded(true)}
                phone={phone}
              />

              <View style={{ flexDirection: "row", flexWrap: singleMetricRow ? "nowrap" : "wrap", gap: 10 }}>
                <MetricCard style={metricStyle(0)} compact={!wide} index={0} icon="calendar-outline" iconColor={colors.fairway[600]} iconBackground={colors.fairway[50]} label="Lessons This Week" value={String(facts.lessonsThisWeek)} trend="20% vs last week" />
                <MetricCard style={metricStyle(1)} compact={!wide} index={1} icon="cash-outline" iconColor={colors.fairway[600]} iconBackground={colors.fairway[50]} label="Revenue" value={currency(facts.monthRevenue)} trend="18% vs last month" />
                <MetricCard style={metricStyle(2)} compact={!wide} index={2} icon="people-outline" iconColor={colors.blue} iconBackground="#eef3ff" label="Active Students" value={String(facts.activeStudents)} trend="5 new this month" />
                <MetricCard style={metricStyle(3)} compact={!wide} index={3} icon="clipboard-outline" iconColor={colors.orange} iconBackground={colors.sand[50]} label="Homework Completion" value={facts.homeworkCompletion + "%"} trend="12% vs last week" />
                <MetricCard style={metricStyle(4)} compact={!wide} index={4} icon="alert-circle-outline" iconColor={colors.danger} iconBackground="#fff0f1" label="Outstanding Payments" value={currency(facts.outstandingAmount)} trend={facts.unpaidCount + " open lessons"} down />
              </View>

              <View style={{ flexDirection: columns ? "row" : "column", gap: 14 }}>
                <View style={{ flex: 1.65, gap: 14, minWidth: 0 }}>
                  <OperationsHub
                    lessons={upcoming}
                    playerMap={playerMap}
                    actionItems={actionItems}
                    onOpenLesson={openLesson}
                    onNavigate={navigateTab}
                    columns={compactColumns}
                  />
                </View>
                <View style={{ flex: 1, gap: 14, minWidth: 0 }}>
                  <AICoachCard
                    expanded={aiExpanded}
                    onToggle={() => setAIExpanded((value) => !value)}
                    onOpenStudent={() => spotlight && navigation.getParent()?.navigate("PlayerProfile", { playerId: spotlight.id })}
                    stacked
                  />
                  {spotlight ? (
                    <SpotlightPanel
                      player={spotlight}
                      nextLesson={upcoming.find((lesson) => lesson.playerId === spotlight.id)}
                      onOpen={() => navigation.getParent()?.navigate("PlayerProfile", { playerId: spotlight.id })}
                    />
                  ) : null}
                </View>
              </View>

              <RecentActivityPanel onView={() => navigation.navigate("Reports")} horizontal={compactColumns} />

              <View style={{ flexDirection: compactColumns ? "row" : "column", gap: 14 }}>
                <PerformancePanel players={players} completion={facts.homeworkCompletion} onView={() => navigation.navigate("Reports")} />
                <UpcomingPanel lessons={upcoming} playerMap={playerMap} onView={() => navigation.navigate("Schedule")} />
              </View>

              <View style={{ flexDirection: width >= 900 ? "row" : "column", gap: 14 }}>
                <CommunicationCenter onNavigate={navigateTab} />
                <WinsPanel />
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function buildDashboardFacts(
  lessons: Lesson[],
  upcoming: Lesson[],
  players: Player[],
  hourlyRate: number,
): DashboardFacts {
  const today = todayISO();
  const weekEnd = new Date(new Date(today + "T12:00:00").getTime() + WEEK_MS).toISOString().slice(0, 10);
  const lessonsThisWeek = upcoming.filter((lesson) => lesson.date >= today && lesson.date < weekEnd).length;
  const month = today.slice(0, 7);
  const calculatedRevenue = lessons
    .filter((lesson) => lesson.date.startsWith(month) && lesson.paid && lesson.status !== "cancelled")
    .reduce((sum, lesson) => sum + hourlyRate * lesson.duration / 60, 0);
  const activeIds = new Set(upcoming.flatMap((lesson) => lesson.playerIds?.length ? lesson.playerIds : lesson.playerId ? [lesson.playerId] : []));
  const eligible = lessons.filter((lesson) => lesson.status !== "cancelled");
  const calculatedCompletion = eligible.length
    ? Math.round(lessons.filter((lesson) => lesson.status === "completed").length / eligible.length * 100)
    : 0;
  const unpaidCount = USE_DEMO_DATA ? 11 : lessons.filter((lesson) => !lesson.paid && lesson.status !== "cancelled").length;
  return {
    lessonsThisWeek,
    monthRevenue: USE_DEMO_DATA ? 4860 : calculatedRevenue,
    activeStudents: USE_DEMO_DATA ? players.length : activeIds.size,
    homeworkCompletion: USE_DEMO_DATA ? 68 : calculatedCompletion,
    unpaidCount,
    outstandingAmount: USE_DEMO_DATA ? 450 : Math.round(unpaidCount * hourlyRate),
  };
}

export default function CoachDashboardScreen() {
  const { user } = useAuth();
  const coachId = user?.id ?? "";
  const { players, loading: playersLoading } = usePlayers(coachId);
  const { lessons, upcoming, loading: lessonsLoading } = useLessons({ coachId });
  const loading = playersLoading || lessonsLoading;
  const facts = useMemo(
    () => buildDashboardFacts(lessons, upcoming, players, user?.hourlyRate ?? 0),
    [lessons, upcoming, players, user?.hourlyRate],
  );
  return <DesktopDashboard lessons={lessons} upcoming={upcoming} players={players} loading={loading} facts={facts} />;
}
