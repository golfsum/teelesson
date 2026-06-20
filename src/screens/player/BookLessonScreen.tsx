/**
 * BookLessonScreen — player requests a lesson with their assigned coach.
 *
 * Flow:
 *  1. Pick a date from CalendarStrip.
 *  2. Select an available start time derived from the coach's AvailabilitySlots
 *     for that day (recurring weekday slots OR one-off date slots).
 *  3. Choose duration and lesson type.
 *  4. Submit -> createLesson(..., status:'requested') then navigate back.
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/hooks/useAuth";
import { useAvailability } from "@/hooks/useAvailability";
import { createLesson } from "@/firebase/dbService";
import {
  ScreenContainer,
  Button,
  EmptyState,
} from "@/components/ui";
import CalendarStrip from "@/components/CalendarStrip";
import { colors, LESSON_TYPE_LABELS } from "@/theme";
import { todayISO, formatDate, formatTime } from "@/utils/format";
import type { LessonType, AvailabilitySlot } from "@/types";
import type { PlayerStackParamList } from "@/navigation/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DURATIONS: { label: string; value: number }[] = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

const LESSON_TYPES: LessonType[] = ["range", "simulator", "online", "indoor"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "HH:mm" into total minutes from midnight. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Format total minutes from midnight back to "HH:mm". */
function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Derive selectable start times from all slots that cover the chosen date.
 * Recurring slots match by weekday; one-off slots match by exact date.
 * Returns sorted, deduplicated "HH:mm" strings on 30-min increments.
 */
function deriveStartTimes(
  slots: AvailabilitySlot[],
  isoDate: string
): string[] {
  const d = new Date(`${isoDate}T00:00:00`);
  const weekday = d.getDay(); // 0 (Sun) – 6 (Sat)

  const times = new Set<string>();

  for (const slot of slots) {
    const matches =
      (slot.recurring && slot.weekday === weekday) ||
      (!slot.recurring && slot.date === isoDate);

    if (!matches) continue;

    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    // Enumerate 30-min increments within the window
    for (let t = start; t < end; t += 30) {
      times.add(fromMinutes(t));
    }
  }

  return Array.from(times).sort();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookLessonScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PlayerStackParamList>>();
  const { user } = useAuth();

  const coachId = user?.coachId;

  const { slots, loading } = useAvailability(coachId);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedType, setSelectedType] = useState<LessonType>("range");
  const [submitting, setSubmitting] = useState(false);

  // Dates that have at least one available slot (for marking on the strip)
  const markedDates = useMemo<string[]>(() => {
    if (!slots.length) return [];
    const today = new Date(`${todayISO()}T00:00:00`);
    const result: string[] = [];

    // Check the next 60 days for marked availability
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (deriveStartTimes(slots, iso).length > 0) {
        result.push(iso);
      }
    }
    return result;
  }, [slots]);

  // Available start times for the currently selected date
  const availableTimes = useMemo(
    () => deriveStartTimes(slots, selectedDate),
    [slots, selectedDate]
  );

  // Reset time selection whenever the date changes
  const handleDateSelect = useCallback(
    (iso: string) => {
      setSelectedDate(iso);
      setSelectedTime(null);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!user || !coachId || !selectedTime) return;

    setSubmitting(true);
    try {
      await createLesson({
        coachId,
        playerId: user.id,
        date: selectedDate,
        startTime: selectedTime,
        duration: selectedDuration,
        type: selectedType,
        status: "requested",
        notes: "",
      });

      Alert.alert(
        "Lesson Requested",
        `Your ${LESSON_TYPE_LABELS[selectedType]} lesson on ${formatDate(selectedDate)} at ${formatTime(selectedTime)} has been sent to your coach for approval.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert(
        "Request Failed",
        "Unable to submit your lesson request. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    user,
    coachId,
    selectedDate,
    selectedTime,
    selectedDuration,
    selectedType,
    navigation,
  ]);

  // ---------------------------------------------------------------------------
  // Guard: player must have a coach assigned
  // ---------------------------------------------------------------------------

  if (!coachId) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="person-remove-outline"
          title="No Coach Assigned"
          message="You haven't been linked to a coach yet. Ask your coach to send you an invitation."
        />
      </ScreenContainer>
    );
  }

  // ---------------------------------------------------------------------------
  // Guard: loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <ScreenContainer fixed>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.fairway[600]} />
        </View>
      </ScreenContainer>
    );
  }

  // ---------------------------------------------------------------------------
  // Guard: no availability at all
  // ---------------------------------------------------------------------------

  if (!loading && slots.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="calendar-outline"
          title="No Availability Yet"
          message="Your coach hasn't published any open slots. Check back soon or message them directly."
        />
      </ScreenContainer>
    );
  }

  const canSubmit = !!selectedTime && !submitting;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View className="px-5 pt-6 pb-4 bg-fairway-700">
        <Text className="text-2xl font-extrabold text-white">Book a Lesson</Text>
        <Text className="text-sm text-white/70 mt-1">
          Select a date and time to request a lesson with your coach.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Date picker ── */}
        <View className="pt-5 pb-2">
          <Text className="px-5 text-xs font-semibold text-ink-500 uppercase tracking-widest mb-3">
            Select Date
          </Text>
          <CalendarStrip
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            markedDates={markedDates}
            days={30}
          />
        </View>

        {/* ── Time slots ── */}
        <View className="px-5 mt-4">
          <Text className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-3">
            Available Times — {formatDate(selectedDate)}
          </Text>

          {availableTimes.length === 0 ? (
            <View className="bg-ink-100 rounded-2xl px-4 py-6 items-center">
              <Text className="text-ink-500 text-sm text-center">
                No open slots on this day. Try another date (look for the green
                dots).
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {availableTimes.map((time) => {
                const isSelected = time === selectedTime;
                return (
                  <Pressable
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    className={[
                      "px-4 py-2 rounded-2xl border",
                      isSelected
                        ? "bg-fairway-600 border-fairway-600"
                        : "bg-white border-ink-200",
                    ].join(" ")}
                    accessibilityRole="button"
                    accessibilityLabel={`${formatTime(time)}${isSelected ? ", selected" : ""}`}
                  >
                    <Text
                      className={[
                        "text-sm font-semibold",
                        isSelected ? "text-white" : "text-ink-900",
                      ].join(" ")}
                    >
                      {formatTime(time)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Duration ── */}
        <View className="px-5 mt-6">
          <Text className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-3">
            Duration
          </Text>
          <View className="flex-row gap-2">
            {DURATIONS.map(({ label, value }) => {
              const isSelected = value === selectedDuration;
              return (
                <Pressable
                  key={value}
                  onPress={() => setSelectedDuration(value)}
                  className={[
                    "flex-1 items-center py-3 rounded-2xl border",
                    isSelected
                      ? "bg-fairway-600 border-fairway-600"
                      : "bg-white border-ink-200",
                  ].join(" ")}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}${isSelected ? ", selected" : ""}`}
                >
                  <Text
                    className={[
                      "text-sm font-semibold",
                      isSelected ? "text-white" : "text-ink-900",
                    ].join(" ")}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Lesson type ── */}
        <View className="px-5 mt-6">
          <Text className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-3">
            Lesson Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {LESSON_TYPES.map((type) => {
              const isSelected = type === selectedType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  className={[
                    "px-4 py-2 rounded-2xl border",
                    isSelected
                      ? "bg-fairway-600 border-fairway-600"
                      : "bg-white border-ink-200",
                  ].join(" ")}
                  accessibilityRole="button"
                  accessibilityLabel={`${LESSON_TYPE_LABELS[type]}${isSelected ? ", selected" : ""}`}
                >
                  <Text
                    className={[
                      "text-sm font-semibold",
                      isSelected ? "text-white" : "text-ink-900",
                    ].join(" ")}
                  >
                    {LESSON_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Summary card ── */}
        {selectedTime && (
          <View className="mx-5 mt-6 bg-fairway-50 border border-fairway-200 rounded-2xl px-5 py-4">
            <Text className="text-sm font-bold text-fairway-700 mb-2">
              Lesson Summary
            </Text>
            <View className="gap-y-1">
              <SummaryRow label="Date" value={formatDate(selectedDate)} />
              <SummaryRow label="Time" value={formatTime(selectedTime)} />
              <SummaryRow
                label="Duration"
                value={`${selectedDuration} minutes`}
              />
              <SummaryRow
                label="Type"
                value={LESSON_TYPE_LABELS[selectedType]}
              />
              <SummaryRow label="Status" value="Pending Coach Approval" />
            </View>
          </View>
        )}

        {/* ── Submit ── */}
        <View className="px-5 mt-6">
          <Button
            title={submitting ? "Requesting…" : "Request Lesson"}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!canSubmit}
          />
          {!selectedTime && (
            <Text className="text-xs text-ink-500 text-center mt-2">
              Please select a date and available time slot above.
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Small helper component
// ---------------------------------------------------------------------------

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-ink-500">{label}</Text>
      <Text className="text-sm font-semibold text-ink-900">{value}</Text>
    </View>
  );
}
