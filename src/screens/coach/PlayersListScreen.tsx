import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import { usePlayers } from "@/hooks/usePlayers";
import { useLessons } from "@/hooks/useLessons";
import { Input, Button, EmptyState } from "@/components/ui";
import PlayerGridCard from "@/components/PlayerGridCard";
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

export default function PlayersListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const coachId = user?.id ?? "";

  const { players, loading } = usePlayers(coachId);
  const { lessons, upcoming } = useLessons({ coachId });

  const { width } = useWindowDimensions();
  const columns = columnsForWidth(width);

  const [query, setQuery] = useState("");

  // Players with an upcoming lesson are "active"; tally total lessons per player.
  const activeSet = useMemo(
    () => new Set(upcoming.map((l) => l.playerId)),
    [upcoming]
  );
  const lessonCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    lessons.forEach((l) => {
      counts[l.playerId] = (counts[l.playerId] ?? 0) + 1;
    });
    return counts;
  }, [lessons]);

  // Filter players locally by name or email.
  const filtered = useMemo<Player[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q)
    );
  }, [players, query]);

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

  return (
    <View className="flex-1 bg-ink-50" style={{ paddingBottom: insets.bottom }}>
      <View className="w-full flex-1 self-center" style={{ maxWidth: 1180 }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View className="px-4 pt-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-2xl font-extrabold text-ink-900">Players</Text>
            <Text className="mt-0.5 text-sm text-ink-500">
              {players.length} {players.length === 1 ? "player" : "players"} on your roster
            </Text>
          </View>
          <Button title="+ Invite" variant="primary" size="sm" onPress={handleInvite} />
        </View>

        {/* Search */}
        <View className="mt-4">
          <Input
            placeholder="Search by name or email…"
            value={query}
            onChangeText={setQuery}
            containerClassName="mb-0"
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
          contentContainerStyle={
            filtered.length === 0
              ? { flexGrow: 1 }
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
            query.trim() ? (
              <View className="flex-1 items-center justify-center">
                <EmptyState
                  icon="search-outline"
                  title="No matches"
                  message={`No players found for "${query.trim()}".`}
                />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <EmptyState
                  icon="people-outline"
                  title="No players yet"
                  message="Invite your first player to get started."
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
