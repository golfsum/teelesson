import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, Input } from "@/components/ui";
import { colors } from "@/theme";
import type { Player } from "@/types";

interface PlayerPickerModalProps {
  visible: boolean;
  players: Player[];
  selectedIds: string[];
  /** Multi-select (group) keeps the sheet open and shows checkmarks. */
  multi?: boolean;
  title?: string;
  onToggle: (id: string) => void;
  onClose: () => void;
}

/**
 * Bottom-sheet player picker with search, replaces the long inline list so the
 * Add Session form stays compact. Single-select closes on pick; multi stays open.
 */
export default function PlayerPickerModal({
  visible,
  players,
  selectedIds,
  multi = false,
  title = "Select player",
  onToggle,
  onClose,
}: PlayerPickerModalProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q)
    );
  }, [players, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

        {/* Sheet */}
        <View className="rounded-t-3xl bg-white pt-3" style={{ height: "72%" }}>
          <View className="items-center pb-2">
            <View className="h-1 w-10 rounded-full bg-ink-200" />
          </View>

          <View className="mb-2 flex-row items-center justify-between px-4">
            <Text className="text-base font-bold text-ink-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className="text-sm font-semibold text-fairway-600">Done</Text>
            </Pressable>
          </View>

          <View className="mb-1 px-4">
            <Input
              placeholder="Search players…"
              value={query}
              onChangeText={setQuery}
              autoFocus
              containerClassName="mb-0"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(p) => p.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item.id);
              return (
                <Pressable
                  onPress={() => {
                    onToggle(item.id);
                    if (!multi) onClose();
                  }}
                  className={[
                    "mb-2 flex-row items-center rounded-xl border px-3 py-2.5",
                    selected ? "border-fairway-400 bg-fairway-50" : "border-ink-200 bg-white",
                  ].join(" ")}
                >
                  <Avatar name={item.name} uri={item.photoURL} size={36} />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-ink-900">{item.name}</Text>
                    {!!item.email && (
                      <Text className="text-xs text-ink-500">{item.email}</Text>
                    )}
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.fairway[600]} />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text className="px-1 py-6 text-center text-sm text-ink-400">
                No players match “{query}”.
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}
