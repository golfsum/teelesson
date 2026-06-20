/**
 * ScheduleScreen — coach daily agenda.
 *
 * Layout:
 *   1. CalendarStrip — swipe/tap to pick a date; dots mark days with lessons.
 *   2. "Pending Requests" section — any lessons whose status is 'requested',
 *      regardless of date, with inline Approve / Decline actions.
 *   3. Lessons for the selected date — confirmed/completed/cancelled rows with
 *      context-appropriate actions.
 *   4. Header buttons: "Availability" and "+ New".
 */
import React, { useLayoutEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { Button, EmptyState, ScreenContainer } from "@/components/ui";
import LessonCard from "@/components/LessonCard";
import CalendarStrip from "@/components/CalendarStrip";

import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";

import { colors } from "@/theme";
import { todayISO } from "@/utils/format";

import type { CoachStackParamList } from "@/navigation/types";
import type { Lesson } from "@/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;

// ─────────────────────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const coachId = user?.id ?? "";

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const { lessons, pending, loading, approveLesson, cancelLesson, completeLesson, setPaid } =
    useLessons({ coachId });

  const { players } = usePlayers(coachId);

  // O(1) name lookup
  const nameById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const p of players) map[p.id] = p.name;
    return map;
  }, [players]);

  // Dates that carry at least one lesson — used to dot the strip
  const markedDates = useMemo(
    () => [...new Set(lessons.map((l) => l.date))],
    [lessons],
  );

  // All lessons for the selected date (includes 'requested' so the card shows)
  const dayLessons = useMemo(
    () => lessons.filter((l) => l.date === selectedDate),
    [lessons, selectedDate],
  );

  // ── Header buttons ────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center gap-2 mr-2">
          <Button
            title="Availability"
            variant="ghost"
            size="sm"
            icon={<Ionicons name="calendar-outline" size={15} color={colors.fairway[600]} />}
            onPress={() => navigation.navigate("Availability")}
          />
          <Button
            title="+ New"
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate("AddLesson", { date: selectedDate })}
          />
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
            onPress={() => cancelLesson(lesson.id)}
          />
        </View>
      );
    }

    if (lesson.status === "confirmed") {
      return (
        <View className="flex-row gap-2">
          <Button
            title={lesson.paid ? "Paid ✓" : "Mark Paid"}
            variant={lesson.paid ? "outline" : "secondary"}
            size="sm"
            onPress={() => setPaid(lesson.id, !lesson.paid)}
          />
          <Button
            title="Complete"
            variant="secondary"
            size="sm"
            onPress={() => completeLesson(lesson.id)}
          />
          <Button
            title="Cancel"
            variant="outline"
            size="sm"
            onPress={() => cancelLesson(lesson.id)}
          />
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

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer padded>
      {/* ── Calendar ─────────────────────────────────────────────────── */}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        markedDates={markedDates}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator color={colors.fairway[600]} size="large" />
        </View>
      ) : (
        <>
          {/* ── Pending Requests ─────────────────────────────────────── */}
          {pending.length > 0 && (
            <View className="mt-6 mb-2">
              {/* Section header */}
              <View className="flex-row items-center gap-1.5 mb-3">
                <Ionicons name="hourglass-outline" size={16} color={colors.warning} />
                <Text className="text-sm font-semibold text-fairway-800 uppercase tracking-wide">
                  Pending Requests
                </Text>
                <View className="ml-1 bg-sand-200 rounded-full px-2 py-0.5">
                  <Text className="text-xs font-bold text-fairway-800">{pending.length}</Text>
                </View>
              </View>

              {pending.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  title={nameById[lesson.playerId] ?? "Player"}
                  rightActions={
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
                        onPress={() => cancelLesson(lesson.id)}
                      />
                    </View>
                  }
                />
              ))}
            </View>
          )}

          {/* ── Day Schedule ─────────────────────────────────────────── */}
          <View className="mt-6">
            <View className="flex-row items-center gap-1.5 mb-3">
              <Ionicons name="time-outline" size={16} color={colors.fairway[600]} />
              <Text className="text-sm font-semibold text-fairway-700 uppercase tracking-wide">
                Today's Tee Sheet
              </Text>
            </View>

            {dayLessons.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No lessons on this day"
                message="Your schedule is open — add a lesson or check another date."
                actionLabel="+ Schedule Lesson"
                onAction={() => navigation.navigate("AddLesson", { date: selectedDate })}
              />
            ) : (
              dayLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  title={nameById[lesson.playerId] ?? "Player"}
                  rightActions={lessonActions(lesson)}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
