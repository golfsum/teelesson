import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";
import { formatDate, todayISO } from "@/utils/format";
import { parseISO, toISO, addMonths, startOfMonth, MONTHS_FULL } from "@/utils/dates";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface DateFieldProps {
  label: string;
  value: string; // ISO "YYYY-MM-DD"
  onChange: (iso: string) => void;
  error?: string;
}

/**
 * Tap-to-pick date field with a month-grid popover. Cross-platform (web +
 * native) with no native module, so the value sent to Firestore is always a
 * clean ISO string, no manual typing.
 */
export default function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(value || todayISO()));

  const today = todayISO();
  const d0 = parseISO(month);
  const y = d0.getFullYear();
  const m = d0.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = d0.getDay();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const openPicker = () => {
    setMonth(startOfMonth(value || todayISO()));
    setOpen(true);
  };

  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-ink-700">{label}</Text>
      <Pressable
        onPress={openPicker}
        className="flex-row items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3"
      >
        <Text className={value ? "text-ink-900" : "text-ink-400"}>
          {value ? formatDate(value) : "Select a date"}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.ink[400]} />
      </Pressable>
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={() => setOpen(false)}>
          <Pressable className="w-full max-w-sm rounded-2xl bg-white p-4" onPress={() => {}}>
            {/* Month header */}
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable onPress={() => setMonth((mo) => addMonths(mo, -1))} hitSlop={8} className="p-1.5">
                <Ionicons name="chevron-back" size={20} color={colors.fairway[600]} />
              </Pressable>
              <Text className="text-sm font-bold text-ink-900">
                {MONTHS_FULL[m]} {y}
              </Text>
              <Pressable onPress={() => setMonth((mo) => addMonths(mo, 1))} hitSlop={8} className="p-1.5">
                <Ionicons name="chevron-forward" size={20} color={colors.fairway[600]} />
              </Pressable>
            </View>

            {/* Weekday header */}
            <View className="flex-row">
              {WEEKDAYS.map((w, i) => (
                <View key={i} style={{ width: `${100 / 7}%` }} className="items-center py-1">
                  <Text className="text-[11px] font-semibold text-ink-400">{w}</Text>
                </View>
              ))}
            </View>

            {/* Days */}
            <View className="flex-row flex-wrap">
              {cells.map((day, i) => {
                if (day === null) {
                  return <View key={`b-${i}`} style={{ width: `${100 / 7}%` }} className="py-1" />;
                }
                const iso = toISO(new Date(y, m, day));
                const selected = iso === value;
                const isToday = iso === today;
                return (
                  <Pressable
                    key={iso}
                    onPress={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    style={{ width: `${100 / 7}%` }}
                    className="items-center py-1"
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        selected ? "bg-fairway-600" : isToday ? "bg-fairway-100" : ""
                      }`}
                    >
                      <Text className={selected ? "font-bold text-white" : "text-ink-900"}>
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
