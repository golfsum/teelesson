/**
 * AvailabilityScreen — Coach sets recurring weekly availability windows.
 *
 * Section 1: Add a recurring slot — pick weekday, start/end time, lesson type.
 * Section 2: View all slots grouped into Recurring and One-off, with delete.
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button, EmptyState, Input, ScreenContainer } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useAvailability } from "@/hooks/useAvailability";
import { colors, LESSON_TYPE_LABELS } from "@/theme";
import type { AvailabilitySlot, LessonType } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const LESSON_TYPES: LessonType[] = ["range", "simulator", "online", "indoor"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weekdayLabel(index: number): string {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][index] ?? String(index);
}

function slotSummary(slot: AvailabilitySlot): string {
  const typeLabel = slot.type ? LESSON_TYPE_LABELS[slot.type] : "";
  if (slot.recurring && slot.weekday !== undefined) {
    return `${weekdayLabel(slot.weekday)}  ${slot.startTime} – ${slot.endTime}${typeLabel ? `  ·  ${typeLabel}` : ""}`;
  }
  return `${slot.date ?? ""}  ${slot.startTime} – ${slot.endTime}${typeLabel ? `  ·  ${typeLabel}` : ""}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SlotRowProps {
  slot: AvailabilitySlot;
  onDelete: () => void;
}

function SlotRow({ slot, onDelete }: SlotRowProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-ink-100">
      <View className="flex-1 mr-3">
        <Text className="text-ink-900 font-medium text-sm">
          {slotSummary(slot)}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={8}
        accessibilityLabel="Delete slot"
        className="p-1"
      >
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </Pressable>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AvailabilityScreen() {
  const { user } = useAuth();
  const { slots, loading, addSlot, removeSlot } = useAvailability(
    user?.id,
  );

  // Form state
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1); // Mon default
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [lessonType, setLessonType] = useState<LessonType>("range");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Validation ────────────────────────────────────────────────────────────

  function validateTime(value: string): boolean {
    return /^\d{2}:\d{2}$/.test(value);
  }

  async function handleAddSlot() {
    if (!user) return;

    if (!validateTime(startTime) || !validateTime(endTime)) {
      setFormError("Enter times in HH:mm format (e.g. 09:00).");
      return;
    }
    if (startTime >= endTime) {
      setFormError("Start time must be before end time.");
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      await addSlot({
        coachId: user.id,
        recurring: true,
        weekday: selectedWeekday,
        startTime,
        endTime,
        type: lessonType,
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Section data ──────────────────────────────────────────────────────────

  const recurring = slots.filter((s) => s.recurring);
  const oneOff = slots.filter((s) => !s.recurring);

  type SectionData = { title: string; data: AvailabilitySlot[] };
  const sections: SectionData[] = [];
  if (recurring.length > 0) sections.push({ title: "Recurring", data: recurring });
  if (oneOff.length > 0) sections.push({ title: "One-off", data: oneOff });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer padded>
      {/* ── Add Recurring Slot ── */}
      <Text className="text-ink-900 text-xl font-bold mt-2 mb-1">
        Add Recurring Window
      </Text>
      <Text className="text-ink-500 text-sm mb-4">
        Set the weekday, hours, and default lesson type for a weekly availability block.
      </Text>

      {/* Weekday toggles */}
      <Text className="text-ink-700 font-semibold text-sm mb-2">Weekday</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {WEEKDAYS.map((label, index) => {
          const active = selectedWeekday === index;
          return (
            <Pressable
              key={label}
              onPress={() => setSelectedWeekday(index)}
              className={`px-3 py-1.5 rounded-full border ${
                active
                  ? "bg-fairway-600 border-fairway-600"
                  : "bg-white border-ink-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? "text-white" : "text-ink-700"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Time inputs */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Input
            label="Start time"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="09:00"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View className="flex-1">
          <Input
            label="End time"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="10:00"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      {/* Lesson type picker */}
      <Text className="text-ink-700 font-semibold text-sm mb-2">
        Default Lesson Type
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {LESSON_TYPES.map((t) => {
          const active = lessonType === t;
          return (
            <Pressable
              key={t}
              onPress={() => setLessonType(t)}
              className={`px-3 py-1.5 rounded-full border ${
                active
                  ? "bg-fairway-600 border-fairway-600"
                  : "bg-white border-ink-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? "text-white" : "text-ink-700"
                }`}
              >
                {LESSON_TYPE_LABELS[t]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Validation error */}
      {formError ? (
        <Text className="text-red-600 text-sm mb-3">{formError}</Text>
      ) : null}

      <Button
        title="Add Availability Window"
        onPress={handleAddSlot}
        loading={saving}
        variant="primary"
        icon={<Ionicons name="add-circle-outline" size={18} color="#fff" />}
        fullWidth
      />

      {/* ── Existing Slots ── */}
      <Text className="text-ink-900 text-xl font-bold mt-8 mb-3">
        Your Availability
      </Text>

      {loading ? (
        <ActivityIndicator
          color={colors.fairway[600]}
          className="mt-6"
        />
      ) : slots.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No availability set"
          message="Add your first recurring window above so players can book lessons."
        />
      ) : (
        <SectionList<AvailabilitySlot, SectionData>
          sections={sections}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderSectionHeader={({ section }) => (
            <View className="bg-ink-100 px-4 py-1.5">
              <Text className="text-ink-500 text-xs font-semibold uppercase tracking-wide">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SlotRow
              slot={item}
              onDelete={() => removeSlot(item.id)}
            />
          )}
          className="rounded-2xl overflow-hidden border border-ink-200 bg-white mb-8"
        />
      )}
    </ScreenContainer>
  );
}
