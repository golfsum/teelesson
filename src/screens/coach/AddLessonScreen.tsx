/**
 * AddLessonScreen, Coach creates a lesson, a group session, or an online
 * review block. Optional route params: { playerId?, date? }
 *
 * The lesson type drives player selection:
 *   • individual types (range/simulator/online/indoor) → one player required
 *   • group → any number of players (or none, for a class)
 *   • review → player optional (block time to review online submissions)
 */
import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenContainer, Input, Button } from "@/components/ui";
import PlayerPickerModal from "@/components/PlayerPickerModal";
import DateField from "@/components/DateField";
import TimeField from "@/components/TimeField";
import { useAuth } from "@/hooks/useAuth";
import { usePlayers } from "@/hooks/usePlayers";
import { useLessons } from "@/hooks/useLessons";
import { requiresPlayer } from "@/utils/lessons";
import { LESSON_TYPE_LABELS, colors } from "@/theme";
import { todayISO, formatDate } from "@/utils/format";
import { addDays, addMonths } from "@/utils/dates";
import type { Lesson, LessonType, Player } from "@/types";
import type { CoachStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;
type Route = RouteProp<CoachStackParamList, "AddLesson">;

const DURATION_OPTIONS = [30, 45, 60, 90] as const;
const LESSON_TYPES = Object.keys(LESSON_TYPE_LABELS) as LessonType[];

type Repeat = "none" | "weekly" | "biweekly" | "monthly" | "custom";
const REPEAT_OPTIONS: { key: Repeat; label: string }[] = [
  { key: "none", label: "Once" },
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Every 2 wks" },
  { key: "monthly", label: "Monthly" },
  { key: "custom", label: "Custom" },
];

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
        selected ? "bg-fairway-600 border-fairway-600" : "bg-white border-ink-200",
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

export default function AddLessonScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuth();

  const coachId = user?.id ?? "";

  const initialPlayerId = route.params?.playerId ?? "";
  const initialDate = route.params?.date ?? todayISO();
  // When booking over an existing block (e.g. a review hour), we delete it once
  // the replacement session is created.
  const replaceId = route.params?.replaceId;

  // ── form state ──────────────────────────────────────────────────────────────
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    initialPlayerId ? [initialPlayerId] : []
  );
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>(route.params?.startTime ?? "");
  const [duration, setDuration] = useState<number>(60);
  const [lessonType, setLessonType] = useState<LessonType>("range");
  const [notes, setNotes] = useState<string>("");

  // Recurrence
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [occurrences, setOccurrences] = useState<string>("6");
  const [customWeeks, setCustomWeeks] = useState<string>("3");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { players } = usePlayers(coachId);
  const { createLesson, deleteLesson } = useLessons({ coachId });

  const isGroup = lessonType === "group";
  const isReview = lessonType === "review";
  const showTitle = isGroup || isReview;

  const selectedPlayers = players.filter((p) => selectedPlayerIds.includes(p.id));
  const pickerSummary =
    selectedPlayerIds.length === 0
      ? isGroup
        ? "Select players"
        : isReview
        ? "Add a player (optional)"
        : "Select a player"
      : isGroup
      ? `${selectedPlayerIds.length} player${selectedPlayerIds.length === 1 ? "" : "s"} selected`
      : selectedPlayers[0]?.name ?? "1 selected";

  // ── handlers ──────────────────────────────────────────────────────────────
  function handleTypeChange(t: LessonType) {
    setLessonType(t);
    setErrors((e) => ({ ...e, player: "" }));
    // Collapse to a single selection when leaving group mode.
    if (t !== "group") setSelectedPlayerIds((prev) => prev.slice(0, 1));
  }

  function togglePlayer(id: string) {
    setErrors((e) => ({ ...e, player: "" }));
    setSelectedPlayerIds((prev) => {
      if (lessonType === "group") {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      }
      // Single-select for individual + review types.
      return prev.includes(id) ? [] : [id];
    });
  }

  const playerHelp = isReview
    ? "Optional, leave empty to block time for reviewing online submissions."
    : isGroup
    ? "Add everyone in the group, or leave empty for a class."
    : "Select the player for this session.";

  // ── recurrence ──────────────────────────────────────────────────────────────
  const occCount = Math.max(1, Math.min(52, parseInt(occurrences, 10) || 1));
  const customWk = Math.max(1, Math.min(12, parseInt(customWeeks, 10) || 1));

  /** All the session dates this submission will create. */
  function buildDates(): string[] {
    if (repeat === "none" || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return [date];
    const dates: string[] = [];
    for (let i = 0; i < occCount; i++) {
      if (repeat === "weekly") dates.push(addDays(date, i * 7));
      else if (repeat === "biweekly") dates.push(addDays(date, i * 14));
      else if (repeat === "monthly") dates.push(addMonths(date, i));
      else dates.push(addDays(date, i * customWk * 7));
    }
    return dates;
  }
  const sessionDates = buildDates();

  // ── validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (requiresPlayer(lessonType) && selectedPlayerIds.length !== 1) {
      errs.player = "Select a player for this session.";
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) errs.date = "Enter a valid date (YYYY-MM-DD).";
    if (!startTime.match(/^\d{2}:\d{2}$/)) errs.startTime = "Enter a valid start time (HH:mm).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const base: Omit<Lesson, "id" | "createdAt" | "updatedAt"> = {
        coachId,
        date,
        startTime,
        duration,
        type: lessonType,
        status: "confirmed",
      };
      if (selectedPlayerIds.length) {
        base.playerId = selectedPlayerIds[0];
        if (isGroup || selectedPlayerIds.length > 1) base.playerIds = selectedPlayerIds;
      }
      if (title.trim()) base.title = title.trim();
      if (notes.trim()) base.notes = notes.trim();
      // Tag a recurring run so the whole series can be managed together.
      if (sessionDates.length > 1) base.seriesId = `s-${Date.now()}`;

      // Create one lesson per occurrence (a single lesson when not recurring).
      for (const d of sessionDates) {
        await createLesson({ ...base, date: d });
      }
      // Booking over an existing block, remove the block it replaces.
      if (replaceId) await deleteLesson(replaceId);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not create the session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer padded>
      <Text className="text-2xl font-extrabold text-ink-900 mb-1">Add Session</Text>
      <Text className="text-ink-500 mb-4">
        Schedule a lesson, a group session, or block time to review online swings.
      </Text>

      {replaceId ? (
        <View className="mb-5 flex-row items-start gap-2 rounded-2xl bg-sand-100 border border-sand-200 px-4 py-3">
          <Text className="text-sm text-fairway-800 flex-1">
            Booking over an existing block, it will be removed once you schedule
            this session.
          </Text>
        </View>
      ) : null}

      {/* ── Session type ───────────────────────────────────────────────────── */}
      <Text className="text-sm font-bold text-ink-700 mb-2 uppercase tracking-wide">
        Session Type
      </Text>
      <View className="flex-row flex-wrap mb-5">
        {LESSON_TYPES.map((t) => (
          <Pill
            key={t}
            label={LESSON_TYPE_LABELS[t]}
            selected={lessonType === t}
            onPress={() => handleTypeChange(t)}
          />
        ))}
      </View>

      {/* ── Title (group / review) ─────────────────────────────────────────── */}
      {showTitle && (
        <Input
          label="Session Label (optional)"
          value={title}
          onChangeText={setTitle}
          placeholder={isGroup ? "e.g. Junior clinic" : "e.g. Online swing review"}
          containerClassName="mb-4"
        />
      )}

      {/* ── Player picker ──────────────────────────────────────────────────── */}
      <Text className="text-sm font-bold text-ink-700 mb-1 uppercase tracking-wide">
        {isGroup ? "Players" : isReview ? "Player (optional)" : "Player"}
      </Text>
      <Text className="text-xs text-ink-400 mb-2">{playerHelp}</Text>

      {players.length === 0 ? (
        <Pressable
          onPress={() => navigation.navigate("InvitePlayer")}
          className="flex-row items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 mb-1"
        >
          <Text className="text-ink-400">No players yet, tap to invite</Text>
          <Ionicons name="add" size={18} color={colors.ink[400]} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 mb-2"
        >
          <Text
            className={selectedPlayerIds.length ? "text-ink-900 font-semibold" : "text-ink-400"}
            numberOfLines={1}
          >
            {pickerSummary}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.ink[400]} />
        </Pressable>
      )}

      {/* Selected chips (group) */}
      {isGroup && selectedPlayers.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {selectedPlayers.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => togglePlayer(p.id)}
              className="flex-row items-center gap-1 rounded-full bg-fairway-100 px-3 py-1"
            >
              <Text className="text-xs font-semibold text-fairway-800">{p.name}</Text>
              <Ionicons name="close" size={12} color={colors.fairway[700]} />
            </Pressable>
          ))}
        </View>
      )}

      {errors.player ? (
        <Text className="text-red-500 text-xs mb-3">{errors.player}</Text>
      ) : (
        <View className="mb-3" />
      )}

      <PlayerPickerModal
        visible={pickerOpen}
        players={players}
        selectedIds={selectedPlayerIds}
        multi={isGroup}
        title={isGroup ? "Select players" : "Select player"}
        onToggle={togglePlayer}
        onClose={() => setPickerOpen(false)}
      />

      {/* ── Date + Start time ──────────────────────────────────────────────── */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <DateField
            label="Date"
            value={date}
            onChange={(v) => {
              setDate(v);
              setErrors((e) => ({ ...e, date: "" }));
            }}
            error={errors.date}
          />
        </View>
        <View className="flex-1">
          <TimeField
            label="Start Time"
            value={startTime}
            onChange={(v) => {
              setStartTime(v);
              setErrors((e) => ({ ...e, startTime: "" }));
            }}
            error={errors.startTime}
          />
        </View>
      </View>

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

      {/* ── Repeat ─────────────────────────────────────────────────────────── */}
      <Text className="text-sm font-bold text-ink-700 mb-2 uppercase tracking-wide">
        Repeat
      </Text>
      <View className="flex-row flex-wrap mb-2">
        {REPEAT_OPTIONS.map((r) => (
          <Pill
            key={r.key}
            label={r.label}
            selected={repeat === r.key}
            onPress={() => setRepeat(r.key)}
          />
        ))}
      </View>

      {repeat !== "none" && (
        <View className="mb-2">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Occurrences"
                value={occurrences}
                onChangeText={setOccurrences}
                keyboardType="number-pad"
                placeholder="e.g. 6"
                containerClassName="mb-0"
              />
            </View>
            {repeat === "custom" && (
              <View className="flex-1">
                <Input
                  label="Every (weeks)"
                  value={customWeeks}
                  onChangeText={setCustomWeeks}
                  keyboardType="number-pad"
                  placeholder="e.g. 3"
                  containerClassName="mb-0"
                />
              </View>
            )}
          </View>
          <Text className="text-xs text-ink-400 mt-1.5">
            Creates {sessionDates.length}{" "}
            {sessionDates.length === 1 ? "session" : "sessions"}
            {sessionDates.length > 1
              ? ` · last on ${formatDate(sessionDates[sessionDates.length - 1])}`
              : ""}
          </Text>
        </View>
      )}

      <View className="mb-4" />

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
        title={
          repeat !== "none" && sessionDates.length > 1
            ? `Schedule ${sessionDates.length} Sessions`
            : "Schedule Session"
        }
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        fullWidth
        loading={submitting}
        disabled={submitting}
      />

      <View className="h-8" />
    </ScreenContainer>
  );
}
