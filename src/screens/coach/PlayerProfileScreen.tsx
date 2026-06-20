import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
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
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import { colors } from "@/theme";
import { formatDate } from "@/utils/format";
import type { Lesson, Player } from "@/types";
import type { CoachStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;
type Route = RouteProp<CoachStackParamList, "PlayerProfile">;

// ── Editable CRM fields managed in local state ────────────────────────────────
interface CrmDraft {
  handicap: string; // stored as string while editing; parsed on save
  goals: string;
  notes: string;
}

function seedDraft(player: Player): CrmDraft {
  return {
    handicap: player.handicap !== undefined ? String(player.handicap) : "",
    goals: player.goals ?? "",
    notes: player.notes ?? "",
  };
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

  // Find the player once the list is ready
  const player = players.find((p) => p.id === playerId) as Player | undefined;

  // ── CRM local state ───────────────────────────────────────────────────────
  const [draft, setDraft] = useState<CrmDraft>({ handicap: "", goals: "", notes: "" });
  const [saving, setSaving] = useState(false);

  // Seed draft when player data arrives (or changes externally)
  useEffect(() => {
    if (player) setDraft(seedDraft(player));
  }, [player?.id]); // re-seed only if a different player is loaded

  // Dirty check — any field differs from the persisted player
  const isDirty =
    player !== undefined &&
    (draft.handicap !== (player.handicap !== undefined ? String(player.handicap) : "") ||
      draft.goals !== (player.goals ?? "") ||
      draft.notes !== (player.notes ?? ""));

  async function handleSave() {
    if (!player || !isDirty) return;
    setSaving(true);
    try {
      const parsedHandicap = draft.handicap.trim() === "" ? undefined : parseFloat(draft.handicap);
      await updatePlayer(playerId, {
        handicap: isNaN(parsedHandicap as number) ? undefined : parsedHandicap,
        goals: draft.goals.trim() || undefined,
        notes: draft.notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Lesson filtering ──────────────────────────────────────────────────────
  const playerLessons: Lesson[] = lessons.filter((l) => l.playerId === playerId);

  const upcoming = playerLessons.filter(
    (l) => l.status === "confirmed" || l.status === "requested"
  );
  const past = playerLessons.filter(
    (l) => l.status === "completed" || l.status === "cancelled"
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
            <Avatar name={player.name} uri={player.photoURL} size={72} />
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
          <View className="flex-row">
            <Button
              title="Book Lesson"
              variant="primary"
              size="md"
              icon={<Ionicons name="calendar-outline" size={16} color="#fff" />}
              onPress={() => navigation.navigate("AddLesson", { playerId })}
              className="flex-1"
            />
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
              label="Goals"
              value={draft.goals}
              onChangeText={(v) => setDraft((d) => ({ ...d, goals: v }))}
              multiline
              numberOfLines={3}
              placeholder="Player's improvement goals…"
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
