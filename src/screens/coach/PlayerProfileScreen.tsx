import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Input,
  ScreenContainer,
} from "@/components/ui";
import LessonCard from "@/components/LessonCard";
import MetricTrendCard from "@/components/MetricTrendCard";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import { useProgress } from "@/hooks/useProgress";
import { METRICS } from "@/constants/metrics";
import { lessonParticipantIds } from "@/utils/lessons";
import { uploadImage } from "@/firebase/storageService";
import { colors } from "@/theme";
import { formatDate } from "@/utils/format";
import type { GoalItem, Lesson, Player } from "@/types";
import type { CoachStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;
type Route = RouteProp<CoachStackParamList, "PlayerProfile">;

// ── Editable CRM fields managed in local state ────────────────────────────────
interface CrmDraft {
  handicap: string; // stored as string while editing; parsed on save
  notes: string;
}

function seedDraft(player: Player): CrmDraft {
  return {
    handicap: player.handicap !== undefined ? String(player.handicap) : "",
    notes: player.notes ?? "",
  };
}

/** Migrate a player's goals into checklist items (handles legacy free text). */
function seedGoals(player: Player): GoalItem[] {
  if (player.goalItems?.length) return player.goalItems;
  if (player.goals?.trim()) {
    return [{ id: `g-${player.id}-legacy`, text: player.goals.trim(), done: false }];
  }
  return [];
}

// ── Section header helper ─────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-ink-500">
      {label}
    </Text>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PlayerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { playerId } = route.params;

  const { user } = useAuth();
  const coachId = user?.id ?? "";

  const { players, loading: playersLoading, updatePlayer } = usePlayers(coachId);
  const { lessons, loading: lessonsLoading } = useLessons({ coachId });
  const { entries: progress } = useProgress(playerId);

  // Build a value series (oldest → newest) for each metric that has data.
  const metricSeries = METRICS.map((def) => ({
    def,
    values: progress
      .map((e) => e[def.key])
      .filter((v): v is number => typeof v === "number"),
  })).filter((m) => m.values.length > 0);

  // Find the player once the list is ready
  const player = players.find((p) => p.id === playerId) as Player | undefined;

  // ── CRM local state ───────────────────────────────────────────────────────
  const [draft, setDraft] = useState<CrmDraft>({ handicap: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [photoURI, setPhotoURI] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Goals checklist (persisted immediately on each change).
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [newGoal, setNewGoal] = useState("");

  // Seed draft + photo + goals when player data arrives (or changes externally)
  useEffect(() => {
    if (player) {
      setDraft(seedDraft(player));
      setPhotoURI(player.photoURL);
      setGoals(seedGoals(player));
    }
  }, [player?.id]); // re-seed only if a different player is loaded

  // ── Goals ───────────────────────────────────────────────────────────────────
  function persistGoals(next: GoalItem[]) {
    setGoals(next);
    updatePlayer(playerId, { goalItems: next });
  }
  function addGoal() {
    const text = newGoal.trim();
    if (!text) return;
    persistGoals([...goals, { id: `g-${Date.now()}`, text, done: false }]);
    setNewGoal("");
  }
  function toggleGoal(id: string) {
    persistGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }
  function removeGoal(id: string) {
    persistGoals(goals.filter((g) => g.id !== id));
  }
  const goalsDone = goals.filter((g) => g.done).length;

  // ── Player photo ──────────────────────────────────────────────────────────
  async function handleChangePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access to set a player photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    setUploadingPhoto(true);
    try {
      const { downloadURL } = await uploadImage(playerId, result.assets[0].uri, "profiles");
      setPhotoURI(downloadURL);
      await updatePlayer(playerId, { photoURL: downloadURL });
    } catch {
      Alert.alert("Upload failed", "Unable to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  const contact = (scheme: "mailto" | "sms", value?: string) => {
    if (value) Linking.openURL(`${scheme}:${value}`).catch(() => {});
  };

  // Dirty check, any field differs from the persisted player
  const isDirty =
    player !== undefined &&
    (draft.handicap !== (player.handicap !== undefined ? String(player.handicap) : "") ||
      draft.notes !== (player.notes ?? ""));

  async function handleSave() {
    if (!player || !isDirty) return;
    setSaving(true);
    try {
      const parsedHandicap = draft.handicap.trim() === "" ? undefined : parseFloat(draft.handicap);
      await updatePlayer(playerId, {
        handicap: isNaN(parsedHandicap as number) ? undefined : parsedHandicap,
        notes: draft.notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Lesson filtering ──────────────────────────────────────────────────────
  // Include group sessions where this player is a participant.
  const playerLessons: Lesson[] = lessons.filter((l) =>
    lessonParticipantIds(l).includes(playerId)
  );

  const upcoming = playerLessons.filter(
    (l) => l.status === "confirmed" || l.status === "requested"
  );
  const past = playerLessons.filter(
    (l) =>
      l.status === "completed" ||
      l.status === "cancelled" ||
      l.status === "noShow"
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (playersLoading || !player) {
    return (
      <ScreenContainer fixed padded>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.fairway[600]} />
        </View>
      </ScreenContainer>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <FlatList
      contentContainerClassName="px-4 pb-12"
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <>
          {/* ── Header card: avatar + identity ─────────────────────────── */}
          <Card className="mt-4 items-center gap-y-2 py-6">
            <Pressable onPress={handleChangePhoto} disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <View className="h-[72px] w-[72px] items-center justify-center">
                  <ActivityIndicator color={colors.fairway[600]} />
                </View>
              ) : (
                <View>
                  <Avatar name={player.name} uri={photoURI} size={72} />
                  <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-fairway-600">
                    <Ionicons name="camera" size={12} color="#fff" />
                  </View>
                </View>
              )}
            </Pressable>
            <Text className="text-xl font-extrabold text-ink-900">{player.name}</Text>
            {!!player.email && (
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="mail-outline" size={14} color={colors.ink[500]} />
                <Text className="text-sm text-ink-500">{player.email}</Text>
              </View>
            )}
            {!!player.phone && (
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="call-outline" size={14} color={colors.ink[500]} />
                <Text className="text-sm text-ink-500">{player.phone}</Text>
              </View>
            )}
          </Card>

          {/* ── Quick actions ───────────────────────────────────────────── */}
          <SectionHeader label="Quick Actions" />
          <View className="flex-row flex-wrap gap-3">
            <Button
              title="Book Lesson"
              variant="primary"
              size="md"
              icon={<Ionicons name="calendar-outline" size={16} color="#fff" />}
              onPress={() => navigation.navigate("AddLesson", { playerId })}
              className="flex-1"
            />
            {!!player.email && (
              <Button
                title="Email"
                variant="outline"
                size="md"
                icon={<Ionicons name="mail-outline" size={16} color={colors.fairway[600]} />}
                onPress={() => contact("mailto", player.email)}
                className="flex-1"
              />
            )}
            {!!player.phone && (
              <Button
                title="Text"
                variant="outline"
                size="md"
                icon={<Ionicons name="chatbubble-outline" size={16} color={colors.fairway[600]} />}
                onPress={() => contact("sms", player.phone)}
                className="flex-1"
              />
            )}
          </View>

          {/* ── Editable CRM fields ─────────────────────────────────────── */}
          <SectionHeader label="Player Profile" />
          <Card className="gap-y-3">
            <Input
              label="Handicap Index"
              value={draft.handicap}
              onChangeText={(v) => setDraft((d) => ({ ...d, handicap: v }))}
              keyboardType="decimal-pad"
              placeholder="e.g. 14.2"
              containerClassName="mb-0"
            />
            <Input
              label="Private Notes"
              value={draft.notes}
              onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
              multiline
              numberOfLines={4}
              placeholder="Coaching notes (only visible to you)…"
              containerClassName="mb-0"
            />
            <Button
              title="Save Changes"
              variant="primary"
              size="md"
              loading={saving}
              disabled={!isDirty}
              onPress={handleSave}
            />
          </Card>

          {/* ── Goals checklist ─────────────────────────────────────────── */}
          <View className="mb-2 mt-6 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-widest text-ink-500">
              Goals
            </Text>
            {goals.length > 0 && (
              <Text className="text-xs font-semibold text-fairway-700">
                {goalsDone}/{goals.length} done
              </Text>
            )}
          </View>
          <Card className="gap-y-1">
            {/* Progress bar */}
            {goals.length > 0 && (
              <View className="mb-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <View
                  className="h-full rounded-full bg-fairway-500"
                  style={{ width: `${Math.round((goalsDone / goals.length) * 100)}%` }}
                />
              </View>
            )}

            {goals.length === 0 ? (
              <Text className="text-sm text-ink-400 py-1">
                No goals yet. Add one below.
              </Text>
            ) : (
              goals.map((g) => (
                <View key={g.id} className="flex-row items-center gap-2 py-1.5">
                  <Pressable onPress={() => toggleGoal(g.id)} hitSlop={6}>
                    <Ionicons
                      name={g.done ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={g.done ? colors.fairway[600] : colors.ink[400]}
                    />
                  </Pressable>
                  <Text
                    className={`flex-1 text-sm ${
                      g.done ? "text-ink-400 line-through" : "text-ink-900"
                    }`}
                  >
                    {g.text}
                  </Text>
                  <Pressable onPress={() => removeGoal(g.id)} hitSlop={6}>
                    <Ionicons name="close" size={18} color={colors.ink[400]} />
                  </Pressable>
                </View>
              ))
            )}

            {/* Add goal */}
            <View className="mt-2 flex-row items-center gap-2">
              <View className="flex-1">
                <Input
                  value={newGoal}
                  onChangeText={setNewGoal}
                  placeholder="Add a goal…"
                  onSubmitEditing={addGoal}
                  returnKeyType="done"
                  containerClassName="mb-0"
                />
              </View>
              <Button title="Add" variant="outline" size="md" onPress={addGoal} />
            </View>
          </Card>

          {/* ── Progress ────────────────────────────────────────────────── */}
          <View className="mb-2 mt-6 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-widest text-ink-500">
              Progress
            </Text>
            <Button
              title="+ Log"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate("LogProgress", { playerId })}
            />
          </View>
          {metricSeries.length === 0 ? (
            <EmptyState
              icon="trending-up-outline"
              title="No measurements yet"
              message="Log a measurement to start tracking improvement."
              actionLabel="Log Measurement"
              onAction={() => navigation.navigate("LogProgress", { playerId })}
            />
          ) : (
            <View className="gap-3">
              {metricSeries.map(({ def, values }) => (
                <MetricTrendCard key={def.key} def={def} values={values} />
              ))}
            </View>
          )}

          {/* ── Upcoming lessons ────────────────────────────────────────── */}
          <SectionHeader label="Upcoming Lessons" />
          {lessonsLoading ? (
            <ActivityIndicator color={colors.fairway[600]} className="my-4" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No upcoming lessons"
              message="Book a lesson to get started."
              actionLabel="Book Lesson"
              onAction={() => navigation.navigate("AddLesson", { playerId })}
            />
          ) : (
            upcoming.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onPress={() => {
                  // Navigate to schedule or a lesson detail screen if available
                }}
              />
            ))
          )}

          {/* ── Past lessons ────────────────────────────────────────────── */}
          {past.length > 0 && (
            <>
              <SectionHeader label="Lesson History" />
              {past.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onPress={() => {
                    // Navigate to lesson detail / review
                  }}
                />
              ))}
            </>
          )}
        </>
      }
    />
  );
}
