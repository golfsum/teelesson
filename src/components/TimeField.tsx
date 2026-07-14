import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";
import { formatTime } from "@/utils/format";

interface TimeFieldProps {
  label: string;
  value: string; // "HH:mm"
  onChange: (hhmm: string) => void;
  error?: string;
  /** Inclusive start/end hours and step (minutes). */
  startHour?: number;
  endHour?: number;
  stepMin?: number;
}

/**
 * Tap-to-pick time field showing a scrollable list of slots, no manual "HH:mm"
 * typing. Cross-platform (web + native), no native module.
 */
export default function TimeField({
  label,
  value,
  onChange,
  error,
  startHour = 6,
  endHour = 21,
  stepMin = 15,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);

  const slots = useMemo(() => {
    const out: string[] = [];
    for (let mins = startHour * 60; mins <= endHour * 60; mins += stepMin) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return out;
  }, [startHour, endHour, stepMin]);

  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-ink-700">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3"
      >
        <Text className={value ? "text-ink-900" : "text-ink-400"}>
          {value ? formatTime(value) : "Select a time"}
        </Text>
        <Ionicons name="time-outline" size={18} color={colors.ink[400]} />
      </Pressable>
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={() => setOpen(false)}>
          <Pressable
            className="w-full max-w-xs rounded-2xl bg-white py-2"
            style={{ maxHeight: "70%" }}
            onPress={() => {}}
          >
            <Text className="px-4 py-2 text-sm font-bold text-ink-900">{label}</Text>
            <ScrollView>
              {slots.map((t) => {
                const selected = t === value;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                    className={`px-4 py-3 ${selected ? "bg-fairway-50" : ""}`}
                  >
                    <Text
                      className={
                        selected ? "text-base font-bold text-fairway-700" : "text-base text-ink-900"
                      }
                    >
                      {formatTime(t)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
