/**
 * AddLessonScreen — Coach creates a new lesson.
 * Optional route params: { playerId?, date? }
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenContainer, Input, Button, Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { usePlayers } from "@/hooks/usePlayers";
import { useLessons } from "@/hooks/useLessons";
import { LESSON_TYPE_LABELS, colors } from "@/theme";
import { todayISO } from "@/utils/format";
import type { LessonType, Player } from "@/types";
import type { CoachStackParamList } from "@/navigation/types";

// ─── navigation types ────────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<CoachStackParamList>;
type Route = RouteProp<CoachStackParamList, "AddLesson">;

// ─── constants ────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [30, 45, 60, 90] as const;
const LESSON_TYPES = Object.keys(LESSON_TYPE_LABELS) as LessonType[];

// ─── small helpers ────────────────────────────────────────────────────────────

/** A selectable pill button used for duration and lesson-type pickers. */
function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "px-4 py-2 rounded-full mr-2 mb-2 border",
        selected
          ? "bg-fairway-600 border-fairway-600"
          : "bg-white border-ink-200",
      ].join(" ")}
    >
      <Text
        className={[
          "text-sm font-semibold",
          selected ? "text-white" : "text-ink-700",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** A row representing one player in the picker list. */
function PlayerRow({
  player,
  selected,
  onPress,
}: {
  player: Player;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "flex-row items-center px-4 py-3 rounded-xl mb-2 border",
        selected
          ? "bg-fairway-50 border-fairway-400"
          : "bg-white border-ink-200",
      ].join(" ")}
    >
      <Avatar name={player.name} size={36} />
      <View className="ml-3 flex-1">
        <Text className="text-ink-900 font-semibold text-sm">{player.name}</Text>
        {player.email ? (
          <Text className="text-ink-500 text-xs">{player.email}</Text>
        ) : null}
      </View>
      {selected && (
        <View className="w-5 h-5 rounded-full bg-fairway-600 items-center justify-center">
          <Text className="text-white text-xs font-bold">✓</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── screen ──────────────────────────────────────────────────────────────────

export default function AddLessonScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuth();

  const coachId = user?.id ?? "";

  // pre-filled from route params
  const initialPlayerId = route.params?.playerId ?? "";
  const initialDate = route.params?.date ?? todayISO();

  // ── form state ──────────────────────────────────────────────────────────────
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(initialPlayerId);
  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [lessonType, setLessonType] = useState<LessonType>("range");
  const [notes, setNotes] = useState<string>("");

  // ── validation errors ───────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── data hooks ──────────────────────────────────────────────────────────────
  const { players, loading: playersLoading } = usePlayers(coachId);
  const { createLesson } = useLessons({ coachId });

  const [submitting, setSubmitting] = useState(false);

  // ── validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedPlayerId) errs.player = "Please select a player.";
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/))
      errs.date = "Enter a valid date (YYYY-MM-DD).";
    if (!startTime.match(/^\d{2}:\d{2}$/))
      errs.startTime = "Enter a valid start time (HH:mm).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createLesson({
        coachId,
        playerId: selectedPlayerId,
        date,
        startTime,
        duration,
        type: lessonType,
        status: "confirmed",
        notes: notes.trim() || undefined,
      } as Parameters<typeof createLesson>[0]);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Could not create lesson. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer padded>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Text className="text-2xl font-extrabold text-ink-900 mb-1">
        Add Lesson
      </Text>
      <Text className="text-ink-500 mb-6">
        Schedule a new session for one of your players.
      </Text>

      {/* ── Player picker ──────────────────────────────────────────────────── */}
      <Text className="text-sm font-bold text-ink-700 mb-2 uppercase tracking-wide">
        Player
      </Text>
      {playersLoading ? (
        <ActivityIndicator color={colors.fairway[600]} className="mb-4" />
      ) : players.length === 0 ? (
        <Text className="text-ink-500 text-sm mb-4">
          No players linked to your account yet.
        </Text>
      ) : (
        <View className="mb-1">
          {players.map((p) => (
            <PlayerRow
              key={p.id}
              player={p}
              selected={p.id === selectedPlayerId}
              onPress={() => {
                setSelectedPlayerId(p.id);
                setErrors((e) => ({ ...e, player: "" }));
              }}
            />
          ))}
        </View>
      )}
      {errors.player ? (
        <Text className="text-red-500 text-xs mb-3">{errors.player}</Text>
      ) : (
        <View className="mb-3" />
      )}

      {/* ── Date ───────────────────────────────────────────────────────────── */}
      <Input
        label="Date"
        value={date}
        onChangeText={(v) => {
          setDate(v);
          setErrors((e) => ({ ...e, date: "" }));
        }}
        placeholder="YYYY-MM-DD"
        error={errors.date}
        containerClassName="mb-4"
      />

      {/* ── Start time ─────────────────────────────────────────────────────── */}
      <Input
        label="Start Time"
        value={startTime}
        onChangeText={(v) => {
          setStartTime(v);
          setErrors((e) => ({ ...e, startTime: "" }));
        }}
        placeholder="HH:mm  (e.g. 09:00)"
        error={errors.startTime}
        containerClassName="mb-4"
      />

      {/* ── Duration ───────────────────────────────────────────────────────── */}
      <Text className="text-sm font-bold text-ink-700 mb-2 uppercase tracking-wide">
        Duration (minutes)
      </Text>
      <View className="flex-row flex-wrap mb-4">
        {DURATION_OPTIONS.map((d) => (
          <Pill
            key={d}
            label={`${d} min`}
            selected={duration === d}
            onPress={() => setDuration(d)}
          />
        ))}
      </View>

      {/* ── Lesson type ────────────────────────────────────────────────────── */}
      <Text className="text-sm font-bold text-ink-700 mb-2 uppercase tracking-wide">
        Lesson Type
      </Text>
      <View className="flex-row flex-wrap mb-4">
        {LESSON_TYPES.map((t) => (
          <Pill
            key={t}
            label={LESSON_TYPE_LABELS[t]}
            selected={lessonType === t}
            onPress={() => setLessonType(t)}
          />
        ))}
      </View>

      {/* ── Notes ──────────────────────────────────────────────────────────── */}
      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Focus areas, equipment, reminders…"
        multiline
        containerClassName="mb-6"
      />

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <Button
        title="Schedule Lesson"
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        fullWidth
        loading={submitting}
        disabled={submitting}
      />

      {/* bottom padding so the button isn't flush against the keyboard */}
      <View className="h-8" />
    </ScreenContainer>
  );
}
