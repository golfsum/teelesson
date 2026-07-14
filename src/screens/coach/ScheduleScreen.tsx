/**
 * ScheduleScreen, coach daily agenda.
 *
 * Layout:
 *   1. CalendarStrip, swipe/tap to pick a date; dots mark days with lessons.
 *   2. "Pending Requests" section, any lessons whose status is 'requested',
 *      regardless of date, with inline Approve / Decline actions.
 *   3. Lessons for the selected date, confirmed/completed/cancelled rows with
 *      context-appropriate actions.
 *   4. Header buttons: "Availability" and "+ New".
 */
import React, { useLayoutEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { Button, EmptyState, ScreenContainer, WorkspaceHeading } from "@/components/ui";
import LessonCard from "@/components/LessonCard";
import CalendarStrip from "@/components/CalendarStrip";
import WeekGrid from "@/components/WeekGrid";

import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";

import { colors } from "@/theme";
import { todayISO, formatDate } from "@/utils/format";
import { lessonParticipantLabel } from "@/utils/lessons";
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  monthYearLabel,
  startOfMonth,
  startOfWeek,
  yearOf,
  MONTHS_FULL,
} from "@/utils/dates";

import type { CoachStackParamList } from "@/navigation/types";
import type { Lesson } from "@/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;

type SchedulePeriod = "day" | "week" | "month" | "year";
const PERIODS: SchedulePeriod[] = ["day", "week", "month", "year"];

/** Small segmented toggle for the Day / Upcoming view switch. */
function TogglePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-xl py-2 ${
        active ? "bg-fairway-600" : "bg-white border border-ink-200"
      }`}
    >
      <Text className={`text-sm font-semibold ${active ? "text-white" : "text-ink-600"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const coachId = user?.id ?? "";

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [period, setPeriod] = useState<SchedulePeriod>("week");

  const {
    lessons,
    upcoming,
    loading,
    approveLesson,
    cancelLesson,
    completeLesson,
    noShowLesson,
    setPaid,
    cancelSeries,
  } = useLessons({ coachId });

  // Cancelling a recurring session asks whether to drop just this one or all.
  const confirmCancel = (lesson: Lesson) => {
    if (!lesson.seriesId) {
      cancelLesson(lesson.id);
      return;
    }
    Alert.alert("Cancel session", "This session is part of a repeating series.", [
      { text: "Cancel this one", onPress: () => cancelLesson(lesson.id) },
      {
        text: "Cancel whole series",
        style: "destructive",
        onPress: () => cancelSeries(lesson.seriesId!),
      },
      { text: "Keep", style: "cancel" },
    ]);
  };

  // Navigate to Add Session prefilled to reuse a freed-up slot.
  const bookOver = (lesson: Lesson, replace = false) =>
    navigation.navigate("AddLesson", {
      date: lesson.date,
      startTime: lesson.startTime,
      ...(replace ? { replaceId: lesson.id } : {}),
    });

  const { players } = usePlayers(coachId);

  // O(1) name lookup
  const nameById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const p of players) map[p.id] = p.name;
    return map;
  }, [players]);

  // Lessons booked per date, drives the calendar's colour-coded load badges
  // (cancellations / no-shows don't count as booked time).
  const loadByDate = useMemo(() => {
    const map: Record<string, number> = {};
    lessons.forEach((l) => {
      if (l.status === "cancelled" || l.status === "noShow") return;
      map[l.date] = (map[l.date] ?? 0) + 1;
    });
    return map;
  }, [lessons]);

  // Active date range for the current period.
  const range = useMemo(() => {
    if (period === "week") {
      const start = startOfWeek(selectedDate);
      return { start, end: addDays(start, 6) };
    }
    if (period === "month") {
      return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
    }
    if (period === "year") {
      const y = yearOf(selectedDate);
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }
    return { start: selectedDate, end: selectedDate };
  }, [period, selectedDate]);

  // Lessons within the range, chronological.
  const rangeLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.date >= range.start && l.date <= range.end)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [lessons, range],
  );

  // Grouped by date for the week / month agenda.
  const groupedByDate = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    rangeLessons.forEach((l) => {
      (map[l.date] ??= []).push(l);
    });
    return Object.keys(map)
      .sort()
      .map((date) => ({ date, items: map[date] }));
  }, [rangeLessons]);

  // Per-month counts for the year overview.
  const yearMonthCounts = useMemo(() => {
    const y = String(yearOf(selectedDate));
    const counts = new Array(12).fill(0);
    lessons.forEach((l) => {
      if (l.status === "cancelled" || l.status === "noShow") return;
      if (l.date.startsWith(y)) {
        const m = parseInt(l.date.slice(5, 7), 10) - 1;
        if (m >= 0 && m < 12) counts[m] += 1;
      }
    });
    return counts;
  }, [lessons, selectedDate]);

  // Move the anchor date by one period in the given direction.
  const step = (dir: 1 | -1) => {
    setSelectedDate((d) => {
      if (period === "week") return addDays(d, dir * 7);
      if (period === "month") return addMonths(d, dir);
      if (period === "year") return addYears(d, dir);
      return addDays(d, dir);
    });
  };

  const periodLabel =
    period === "week"
      ? `${formatDate(range.start)} – ${formatDate(range.end)}`
      : period === "month"
      ? monthYearLabel(selectedDate)
      : String(yearOf(selectedDate));

  // ── Header buttons ────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center gap-1 mr-2">
          <Pressable
            onPress={() => navigation.navigate("Availability")}
            className="flex-row items-center gap-1 px-2 py-1.5"
            hitSlop={6}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.white} />
            <Text className="text-sm font-semibold text-white">Availability</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("AddLesson", { date: selectedDate })}
            className="flex-row items-center gap-1 rounded-full bg-white px-3 py-1.5"
          >
            <Ionicons name="add" size={16} color={colors.fairway[700]} />
            <Text className="text-sm font-bold text-fairway-700">New</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, selectedDate]);

  // ── Inline right-actions for a lesson card ────────────────────────────────
  function lessonActions(lesson: Lesson): React.ReactNode {
    if (lesson.status === "requested") {
      return (
        <View className="flex-row gap-2">
          <Button
            title="Approve"
            variant="primary"
            size="sm"
            onPress={() => approveLesson(lesson.id)}
          />
          <Button
            title="Decline"
            variant="danger"
            size="sm"
            onPress={() => confirmCancel(lesson)}
          />
        </View>
      );
    }

    if (lesson.status === "confirmed") {
      // Review blocks are placeholder admin time, let the pro book a last-minute
      // lesson over them instead of the usual paid/complete actions.
      if (lesson.type === "review") {
        return (
          <View className="flex-row flex-wrap justify-end gap-2">
            <Button title="Book over" variant="primary" size="sm" onPress={() => bookOver(lesson, true)} />
            <Button title="Cancel" variant="outline" size="sm" onPress={() => confirmCancel(lesson)} />
          </View>
        );
      }

      return (
        <View className="flex-row flex-wrap justify-end gap-2">
          <Button
            title={lesson.paid ? "Paid ✓" : "Mark Paid"}
            variant={lesson.paid ? "outline" : "secondary"}
            size="sm"
            onPress={() => setPaid(lesson.id, !lesson.paid)}
          />
          <Button title="Complete" variant="secondary" size="sm" onPress={() => completeLesson(lesson.id)} />
          <Button title="No-show" variant="outline" size="sm" onPress={() => noShowLesson(lesson.id)} />
          <Button title="Cancel" variant="outline" size="sm" onPress={() => confirmCancel(lesson)} />
        </View>
      );
    }

    if (lesson.status === "completed") {
      return (
        <Button
          title={lesson.paid ? "Paid ✓" : "Mark Paid"}
          variant={lesson.paid ? "outline" : "secondary"}
          size="sm"
          onPress={() => setPaid(lesson.id, !lesson.paid)}
        />
      );
    }

    // No-show or cancelled, the slot is free, so offer to book over it (keeps
    // the original record for history; a no-show can still be charged).
    if (lesson.status === "noShow") {
      return (
        <View className="flex-row flex-wrap justify-end gap-2">
          <Button
            title={lesson.paid ? "Paid ✓" : "Mark Paid"}
            variant={lesson.paid ? "outline" : "secondary"}
            size="sm"
            onPress={() => setPaid(lesson.id, !lesson.paid)}
          />
          <Button title="Book over" variant="primary" size="sm" onPress={() => bookOver(lesson)} />
        </View>
      );
    }

    if (lesson.status === "cancelled") {
      return <Button title="Book over" variant="primary" size="sm" onPress={() => bookOver(lesson)} />;
    }

    return null;
  }

  const teeSheetLabel =
    selectedDate === todayISO() ? "Today's Tee Sheet" : formatDate(selectedDate);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer padded>
      <View className="mb-5">
        <WorkspaceHeading
          icon="calendar-outline"
          title="Schedule"
          subtitle="Your live lesson calendar, booking load, and availability."
          compact={width < 560}
        />
      </View>
      {/* ── Period selector ──────────────────────────────────────────── */}
      <View className="flex-row gap-2 mb-3">
        {PERIODS.map((p) => (
          <TogglePill
            key={p}
            label={p[0].toUpperCase() + p.slice(1)}
            active={period === p}
            onPress={() => setPeriod(p)}
          />
        ))}
      </View>

      {/* ── Date navigator ───────────────────────────────────────────── */}
      {period === "day" ? (
        <CalendarStrip
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          loadByDate={loadByDate}
        />
      ) : (
        <View className="flex-row items-center justify-between rounded-2xl border border-ink-200 bg-white px-2">
          <Pressable onPress={() => step(-1)} hitSlop={8} className="p-2.5">
            <Ionicons name="chevron-back" size={20} color={colors.fairway[600]} />
          </Pressable>
          <Text className="text-sm font-bold text-ink-900">{periodLabel}</Text>
          <Pressable onPress={() => step(1)} hitSlop={8} className="p-2.5">
            <Ionicons name="chevron-forward" size={20} color={colors.fairway[600]} />
          </Pressable>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator color={colors.fairway[600]} size="large" />
        </View>
      ) : period === "year" ? (
        /* ── Year overview, months with counts ── */
        <View className="mt-5">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-fairway-700">
            {yearOf(selectedDate)} Overview
          </Text>
          <View className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
            {MONTHS_FULL.map((mName, i) => {
              const c = yearMonthCounts[i];
              return (
                <Pressable
                  key={mName}
                  onPress={() => {
                    setSelectedDate(
                      `${yearOf(selectedDate)}-${String(i + 1).padStart(2, "0")}-01`
                    );
                    setPeriod("month");
                  }}
                  className="flex-row items-center justify-between border-b border-ink-100 px-4 py-3 active:bg-ink-50"
                >
                  <Text className="text-sm text-ink-900">{mName}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-ink-400">
                      {c} {c === 1 ? "lesson" : "lessons"}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.ink[400]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <>
          {period === "day" ? (
            /* ── Day tee sheet ── */
            <View className="mt-6">
              <View className="flex-row items-center gap-1.5 mb-3">
                <Ionicons name="time-outline" size={16} color={colors.fairway[600]} />
                <Text className="text-sm font-semibold text-fairway-700 uppercase tracking-wide">
                  {teeSheetLabel}
                </Text>
              </View>
              {rangeLessons.length === 0 ? (
                <EmptyState
                  icon="calendar-outline"
                  title="No lessons on this day"
                  message="Your schedule is open, add a lesson or check another date."
                  actionLabel="+ Schedule Lesson"
                  onAction={() => navigation.navigate("AddLesson", { date: selectedDate })}
                />
              ) : (
                rangeLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    title={lessonParticipantLabel(lesson, nameById)}
                    rightActions={lessonActions(lesson)}
                  />
                ))
              )}
            </View>
          ) : period === "week" ? (
            /* ── Visual weekly grid + upcoming schedules ── */
            <>
              <View className="mt-3">
                <WeekGrid
                  weekStart={range.start}
                  lessons={rangeLessons}
                  nameById={nameById}
                  onPressLesson={(l) => {
                    if (l.playerId)
                      navigation.navigate("PlayerProfile", { playerId: l.playerId });
                  }}
                />
              </View>

              <View className="mt-6">
                <View className="flex-row items-center gap-1.5 mb-3">
                  <Ionicons name="list-outline" size={16} color={colors.fairway[600]} />
                  <Text className="text-sm font-semibold text-fairway-700 uppercase tracking-wide">
                    Upcoming Schedules
                  </Text>
                </View>
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon="calendar-outline"
                    title="Nothing upcoming"
                    message="Approved and requested sessions appear here."
                    actionLabel="+ Schedule Lesson"
                    onAction={() => navigation.navigate("AddLesson", { date: selectedDate })}
                  />
                ) : (
                  upcoming.slice(0, 6).map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      title={lessonParticipantLabel(lesson, nameById)}
                      rightActions={lessonActions(lesson)}
                    />
                  ))
                )}
              </View>
            </>
          ) : (
            /* ── Month agenda, grouped by day ── */
            <View className="mt-5">
              {groupedByDate.length === 0 ? (
                <EmptyState
                  icon="calendar-outline"
                  title="No sessions"
                  message={`Nothing booked for this ${period}.`}
                  actionLabel="+ Schedule Lesson"
                  onAction={() => navigation.navigate("AddLesson", { date: selectedDate })}
                />
              ) : (
                groupedByDate.map((group) => (
                  <View key={group.date} className="mb-4">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">
                      {formatDate(group.date)}
                    </Text>
                    {group.items.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        title={lessonParticipantLabel(lesson, nameById)}
                        rightActions={lessonActions(lesson)}
                      />
                    ))}
                  </View>
                ))
              )}
            </View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
