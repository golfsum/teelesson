/**
 * CoachDashboardScreen
 * Clean admin-style dashboard — donut stat rings, a monthly bar chart, a
 * booking-status breakdown donut, upcoming lessons, and quick actions.
 *
 * Responsive: >=900px = multi-column grid; mobile = single stacked column with
 * full-width cards (the horizontal donut-stat layout reads well at any width).
 */
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/hooks/useAuth";
import { usePlayers } from "@/hooks/usePlayers";
import { useLessons } from "@/hooks/useLessons";

import { ScreenContainer, Button, EmptyState, Card } from "@/components/ui";
import LessonCard from "@/components/LessonCard";
import {
  DonutRing,
  SegmentDonut,
  MiniBars,
  type DonutSegment,
} from "@/components/charts/Charts";

import { colors } from "@/theme";
import { formatDateLong, todayISO } from "@/utils/format";

import type { CoachStackParamList } from "@/navigation/types";
import type { Player } from "@/types";

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

const WIDE_BREAKPOINT = 900;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Accent palette — drawn from the app's earthy brand colors.
const ACCENT = {
  blue: "#3C505C", // slate
  green: "#6C844C", // olive
  amber: "#5F5933", // dark olive
  slate: "#9CACA7", // sage
};

interface StatRing {
  key: string;
  title: string;
  value: number;
  percent: number;
  caption: string;
  color: string;
}

export default function CoachDashboardScreen() {
  const navigation = useNavigation<CoachNav>();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const { user } = useAuth();
  const coachId = user?.id ?? "";

  const { players, loading: playersLoading } = usePlayers(coachId);
  const { upcoming, pending, lessons, loading: lessonsLoading } = useLessons({ coachId });

  const loading = playersLoading || lessonsLoading;
  const firstName = user?.name?.split(" ")[0] ?? "Coach";

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const playersWithUpcoming = new Set(upcoming.map((l) => l.playerId)).size;
  const engagementPct = players.length
    ? Math.round((playersWithUpcoming / players.length) * 100)
    : 0;

  const confirmedUpcoming = upcoming.filter((l) => l.status === "confirmed").length;
  const confirmedPct = upcoming.length
    ? Math.round((confirmedUpcoming / upcoming.length) * 100)
    : 0;

  const scheduledTotal = upcoming.length + pending.length;
  const pendingPct = scheduledTotal ? Math.round((pending.length / scheduledTotal) * 100) : 0;

  const stats: StatRing[] = [
    {
      key: "players",
      title: "Active Players",
      value: players.length,
      percent: engagementPct,
      caption: `${playersWithUpcoming} with upcoming lessons`,
      color: ACCENT.blue,
    },
    {
      key: "month",
      title: "Lessons This Month",
      value: upcoming.length,
      percent: confirmedPct,
      caption: `${confirmedUpcoming} confirmed`,
      color: ACCENT.green,
    },
    {
      key: "pending",
      title: "Pending Requests",
      value: pending.length,
      percent: pendingPct,
      caption: "awaiting your reply",
      color: ACCENT.amber,
    },
  ];

  // ── Booking-status breakdown (multi-segment donut) ──────────────────────────
  const count = (s: string) => lessons.filter((l) => l.status === s).length;
  const statusSegments: DonutSegment[] = [
    { label: "Confirmed", value: count("confirmed"), color: ACCENT.blue },
    { label: "Pending", value: count("requested"), color: ACCENT.amber },
    { label: "Completed", value: count("completed"), color: ACCENT.green },
    { label: "Cancelled", value: count("cancelled"), color: ACCENT.slate },
  ];
  const totalLessons = lessons.length;

  // ── Monthly bar data (lessons booked per month) ─────────────────────────────
  const monthlyCounts = new Array(12).fill(0);
  lessons.forEach((l) => {
    const m = parseInt(l.date.slice(5, 7), 10) - 1;
    if (m >= 0 && m < 12) monthlyCounts[m] += 1;
  });
  const barData = MONTHS.map((label, i) => ({ label, value: monthlyCounts[i] }));

  // Next 5 upcoming lessons
  const nextFive = upcoming.slice(0, 5);

  // Player lookup for lesson card names
  const playerMap = React.useMemo(() => {
    const map: Record<string, Player> = {};
    players.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [players]);

  // ── Quick actions ───────────────────────────────────────────────────────────
  const quickActions: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: keyof CoachStackParamList;
  }[] = [
    { title: "Add Player", icon: "person-add-outline", route: "InvitePlayer" },
    { title: "Create Lesson", icon: "add-circle-outline", route: "AddLesson" },
    { title: "Availability", icon: "calendar-clear-outline", route: "Availability" },
  ];

  // ── Sub-renders ─────────────────────────────────────────────────────────────
  const StatCard = ({ stat }: { stat: StatRing }) => (
    <Card className="flex-1">
      <View className="flex-row items-center gap-4">
        <DonutRing percent={stat.percent} color={stat.color} size={64} strokeWidth={8}>
          <Text className="text-sm font-extrabold text-ink-900">{stat.percent}%</Text>
        </DonutRing>
        <View className="flex-1">
          <Text className="text-xs font-medium text-ink-500" numberOfLines={1}>
            {stat.title}
          </Text>
          <Text className="mt-0.5 text-2xl font-extrabold text-ink-900">{stat.value}</Text>
          <Text className="mt-0.5 text-xs text-ink-400" numberOfLines={1}>
            {stat.caption}
          </Text>
        </View>
      </View>
    </Card>
  );

  const BarChartCard = (
    <Card className={isWide ? "flex-1" : ""}>
      <Text className="text-base font-bold text-ink-900">Lessons Booked Per Month</Text>
      <Text className="mb-4 text-xs text-ink-400">This year</Text>
      <MiniBars data={barData} color={ACCENT.blue} height={150} />
    </Card>
  );

  const StatusDonutCard = (
    <Card className={isWide ? "flex-1" : ""}>
      <Text className="mb-3 text-base font-bold text-ink-900">Booking Breakdown</Text>
      <View className="items-center">
        <SegmentDonut segments={statusSegments} size={150} strokeWidth={20}>
          <Text className="text-2xl font-extrabold text-ink-900">{totalLessons}</Text>
          <Text className="text-xs text-ink-400">lessons</Text>
        </SegmentDonut>
      </View>
      <View className="mt-4 gap-2">
        {statusSegments.map((s) => (
          <View key={s.label} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
              <Text className="text-sm text-ink-700">{s.label}</Text>
            </View>
            <Text className="text-sm font-semibold text-ink-900">{s.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );

  const UpcomingCard = (
    <Card className={isWide ? "flex-1" : ""}>
      <Text className="mb-3 text-base font-bold text-ink-900">Upcoming Lessons</Text>
      {nextFive.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No upcoming lessons"
          message="Schedule a lesson or wait for player requests."
          actionLabel="Create Lesson"
          onAction={() => navigation.navigate("AddLesson")}
        />
      ) : (
        <View className="gap-3">
          {nextFive.map((lesson) => {
            const player = playerMap[lesson.playerId];
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                title={player?.name ?? "Unknown Player"}
                onPress={() =>
                  navigation.navigate("PlayerProfile", { playerId: lesson.playerId })
                }
              />
            );
          })}
        </View>
      )}
    </Card>
  );

  const QuickActionsCard = (
    <Card className={isWide ? "flex-1" : ""}>
      <Text className="mb-3 text-base font-bold text-ink-900">Quick Actions</Text>
      <View className="gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.title}
            title={action.title}
            variant="outline"
            size="md"
            fullWidth
            icon={<Ionicons name={action.icon} size={18} color={colors.fairway[600]} />}
            onPress={() => navigation.navigate(action.route as any)}
          />
        ))}
      </View>
    </Card>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer padded maxWidth={1180}>
      {/* Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-ink-900">
            Good to see you, {firstName}
          </Text>
          <Text className="mt-1 text-sm text-ink-500">{formatDateLong(todayISO())}</Text>
        </View>
        {isWide && (
          <Button
            title="New Lesson"
            variant="primary"
            size="md"
            icon={<Ionicons name="add" size={18} color="#fff" />}
            onPress={() => navigation.navigate("AddLesson")}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.fairway[600]} size="large" className="mt-12" />
      ) : (
        <>
          {/* Stat rings */}
          <View className={isWide ? "mb-4 flex-row gap-4" : "mb-4 flex-col gap-4"}>
            {stats.map((stat) => (
              <StatCard key={stat.key} stat={stat} />
            ))}
          </View>

          {/* Main grid — two height-matched rows on wide (cards flex-1 so each
              pair shares the taller card's height); single stack on mobile. */}
          {isWide ? (
            <>
              {/* Row 1 — Upcoming Lessons + Booking Breakdown */}
              <View className="mb-4 flex-row items-stretch gap-4">
                <View className="flex-row" style={{ flex: 3 }}>{UpcomingCard}</View>
                <View className="flex-row" style={{ flex: 2 }}>{StatusDonutCard}</View>
              </View>
              {/* Row 2 — Lessons Booked Per Month + Quick Actions */}
              <View className="flex-row items-stretch gap-4">
                <View className="flex-row" style={{ flex: 3 }}>{BarChartCard}</View>
                <View className="flex-row" style={{ flex: 2 }}>{QuickActionsCard}</View>
              </View>
            </>
          ) : (
            <View className="flex-col gap-4">
              {UpcomingCard}
              {StatusDonutCard}
              {BarChartCard}
              {QuickActionsCard}
            </View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
