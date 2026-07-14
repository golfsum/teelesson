import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/hooks/useAuth";
import { usePlayers } from "@/hooks/usePlayers";
import { useLessons } from "@/hooks/useLessons";
import { Input, Button, EmptyState, WorkspaceHeading } from "@/components/ui";
import PlayerGridCard from "@/components/PlayerGridCard";
import LessonCard from "@/components/LessonCard";
import { lessonParticipantLabel } from "@/utils/lessons";
import { colors } from "@/theme";
import type { Player } from "@/types";
import type { CoachStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;

// A row item is either a real player or an invisible spacer that keeps the last
// grid row's cards the same width as the rest.
type GridItem = { kind: "player"; player: Player } | { kind: "spacer"; id: string };

function columnsForWidth(width: number): number {
  if (width >= 1100) return 4;
  if (width >= 820) return 3;
  if (width >= 560) return 2;
  return 1;
}

type StatusFilter = "all" | "active" | "inactive";
type SortBy = "name" | "handicap" | "lessons";

const SORT_LABELS: Record<SortBy, string> = {
  name: "Name",
  handicap: "Handicap",
  lessons: "Lessons",
};

/** A small toggle pill used for the filter + sort controls. */
function SegPill({
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
      className={`rounded-full border px-3 py-1.5 ${
        active ? "border-fairway-600 bg-fairway-600" : "border-ink-200 bg-white"
      }`}
    >
      <Text className={`text-xs font-semibold ${active ? "text-white" : "text-ink-600"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function PlayersListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const coachId = user?.id ?? "";

  const { players, loading } = usePlayers(coachId);
  const { lessons, upcoming, pending, approveLesson, cancelLesson } = useLessons({ coachId });

  // Name lookup for request cards.
  const nameById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    players.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [players]);

  const { width } = useWindowDimensions();
  const columns = columnsForWidth(width);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [hasHandicap, setHasHandicap] = useState(false);
  const [needsLesson, setNeedsLesson] = useState(false);

  // Players with an upcoming lesson are "active"; tally total lessons per player.
  const activeSet = useMemo(() => {
    const s = new Set<string>();
    upcoming.forEach((l) => {
      const ids = l.playerIds?.length ? l.playerIds : l.playerId ? [l.playerId] : [];
      ids.forEach((id) => s.add(id));
    });
    return s;
  }, [upcoming]);
  const lessonCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    lessons.forEach((l) => {
      // Count every participant (single + group members).
      const ids = l.playerIds?.length ? l.playerIds : l.playerId ? [l.playerId] : [];
      ids.forEach((id) => {
        counts[id] = (counts[id] ?? 0) + 1;
      });
    });
    return counts;
  }, [lessons]);

  // Filter by search + active status, then sort.
  const filtered = useMemo<Player[]>(() => {
    const q = query.trim().toLowerCase();
    let list = players.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q)
    );

    if (statusFilter === "active") list = list.filter((p) => activeSet.has(p.id));
    else if (statusFilter === "inactive") list = list.filter((p) => !activeSet.has(p.id));

    // Quick chips.
    if (hasHandicap) list = list.filter((p) => p.handicap !== undefined);
    if (needsLesson) list = list.filter((p) => !activeSet.has(p.id));

    return [...list].sort((a, b) => {
      if (sortBy === "handicap") {
        // Lowest handicap first; players without one sort last.
        return (a.handicap ?? Infinity) - (b.handicap ?? Infinity);
      }
      if (sortBy === "lessons") {
        // Most lessons first.
        return (lessonCounts[b.id] ?? 0) - (lessonCounts[a.id] ?? 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [players, query, statusFilter, sortBy, hasHandicap, needsLesson, activeSet, lessonCounts]);

  // Pad with spacers so the final row keeps consistent card widths in a grid.
  const gridData = useMemo<GridItem[]>(() => {
    const items: GridItem[] = filtered.map((player) => ({ kind: "player", player }));
    if (columns > 1) {
      const remainder = items.length % columns;
      if (remainder !== 0) {
        for (let i = 0; i < columns - remainder; i++) {
          items.push({ kind: "spacer", id: `spacer-${i}` });
        }
      }
    }
    return items;
  }, [filtered, columns]);

  const handleInvite = () => navigation.navigate("InvitePlayer");

  // Pending booking requests, shown above the roster grid.
  const pendingHeader =
    pending.length > 0 ? (
      <View className="mb-3">
        <View className="mb-3 flex-row items-center gap-1.5">
          <Ionicons name="hourglass-outline" size={16} color={colors.warning} />
          <Text className="text-sm font-semibold uppercase tracking-wide text-fairway-800">
            Pending Requests
          </Text>
          <View className="ml-1 rounded-full bg-sand-200 px-2 py-0.5">
            <Text className="text-xs font-bold text-fairway-800">{pending.length}</Text>
          </View>
        </View>
        <View style={{ flexDirection: columns >= 3 ? "row" : "column", flexWrap: "wrap", gap: 10 }}>
          {pending.map((lesson) => (
            <View key={lesson.id} style={{ flex: columns >= 3 ? 1 : undefined, minWidth: columns >= 3 ? 280 : undefined }}>
              <LessonCard
                lesson={lesson}
                title={lessonParticipantLabel(lesson, nameById)}
                rightActions={
                  <View className="flex-row gap-2">
                    <Button title="Approve" variant="primary" size="sm" onPress={() => approveLesson(lesson.id)} />
                    <Button title="Decline" variant="danger" size="sm" onPress={() => cancelLesson(lesson.id)} />
                  </View>
                }
              />
            </View>
          ))}
        </View>
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-ink-50" style={{ paddingBottom: insets.bottom }}>
      <View className="w-full flex-1 self-center" style={{ maxWidth: 1180 }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View className="px-4 pt-5">
        <WorkspaceHeading
          icon="people-outline"
          title="Students"
          subtitle={`${players.length} ${players.length === 1 ? "student" : "students"} on your roster`}
          action={<Button title="+ Invite" variant="primary" size="sm" onPress={handleInvite} />}
          compact={width < 560}
        />

        {/* Search */}
        <View className="mt-4">
          <Input
            placeholder="Search by name or email…"
            value={query}
            onChangeText={setQuery}
            containerClassName="mb-0"
          />
        </View>

        {/* Filter + sort */}
        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          {(["all", "active", "inactive"] as StatusFilter[]).map((f) => (
            <SegPill
              key={f}
              label={f[0].toUpperCase() + f.slice(1)}
              active={statusFilter === f}
              onPress={() => setStatusFilter(f)}
            />
          ))}
        </View>
        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Sort
          </Text>
          {(["name", "handicap", "lessons"] as SortBy[]).map((s) => (
            <SegPill
              key={s}
              label={SORT_LABELS[s]}
              active={sortBy === s}
              onPress={() => setSortBy(s)}
            />
          ))}
        </View>

        {/* Quick chips */}
        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <SegPill
            label="Has handicap"
            active={hasHandicap}
            onPress={() => setHasHandicap((v) => !v)}
          />
          <SegPill
            label="Needs lesson"
            active={needsLesson}
            onPress={() => setNeedsLesson((v) => !v)}
          />
        </View>
      </View>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.fairway[600]} size="large" />
        </View>
      ) : (
        <FlatList<GridItem>
          key={`cols-${columns}`}
          style={{ flex: 1 }}
          data={gridData}
          keyExtractor={(item) =>
            item.kind === "player" ? item.player.id : item.id
          }
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
          ListHeaderComponent={pendingHeader}
          contentContainerStyle={
            filtered.length === 0
              ? { flexGrow: 1, padding: 16 }
              : { padding: 16, gap: 12 }
          }
          renderItem={({ item }) => {
            if (item.kind === "spacer") {
              return <View style={{ flex: 1 }} />;
            }
            const p = item.player;
            return (
              <View style={columns > 1 ? { flex: 1 } : undefined}>
                <PlayerGridCard
                  player={p}
                  active={activeSet.has(p.id)}
                  lessonCount={lessonCounts[p.id] ?? 0}
                  onPress={() => navigation.navigate("PlayerProfile", { playerId: p.id })}
                />
              </View>
            );
          }}
          ListEmptyComponent={
            players.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <EmptyState
                  icon="people-outline"
                  title="No players yet"
                  message="Invite your first player to get started."
                  actionLabel="Invite a player"
                  onAction={handleInvite}
                />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <EmptyState
                  icon="search-outline"
                  title="No matching players found"
                  message="No players match your current search or filters. Invite a new player to this list."
                  actionLabel="Invite a player"
                  onAction={handleInvite}
                />
              </View>
            )
          }
        />
      )}
      </View>
    </View>
  );
}
