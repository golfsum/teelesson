import React, { useRef, useEffect } from "react";
import { ScrollView, Pressable, View, Text } from "react-native";
import { todayISO } from "@/utils/format";

const WEEKDAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Converts an ISO "YYYY-MM-DD" string to a JS Date at local midnight. */
function isoToLocalDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** Adds `n` days to a JS Date and returns a new ISO "YYYY-MM-DD" string. */
function addDays(base: Date, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface CalendarStripProps {
  selectedDate: string;
  onSelect: (iso: string) => void;
  markedDates?: string[];
  /** Number of days to show starting from today. Default 14. */
  days?: number;
}

/**
 * Horizontal scrollable strip of day pills.
 * Tapping a pill fires onSelect with its ISO date string.
 * A small dot appears below dates present in markedDates.
 */
export default function CalendarStrip({
  selectedDate,
  onSelect,
  markedDates = [],
  days = 14,
}: CalendarStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const today = todayISO();
  const baseDate = isoToLocalDate(today);

  // Build the array of ISO date strings for the strip.
  const dateList: string[] = Array.from({ length: days }, (_, i) =>
    addDays(baseDate, i)
  );

  const markedSet = new Set(markedDates);

  // Scroll to the selected date on mount / when selectedDate changes.
  useEffect(() => {
    const idx = dateList.indexOf(selectedDate);
    if (idx > 0 && scrollRef.current) {
      // Each pill is ~56px wide + 6px gap; estimate scroll offset.
      scrollRef.current.scrollTo({ x: Math.max(0, (idx - 1) * 62), animated: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 py-2 gap-x-2"
    >
      {dateList.map((iso) => {
        const d = isoToLocalDate(iso);
        const weekday = WEEKDAY_ABBREVS[d.getDay()];
        const dayNum = d.getDate();
        const isSelected = iso === selectedDate;
        const isMarked = markedSet.has(iso);

        return (
          <Pressable
            key={iso}
            onPress={() => onSelect(iso)}
            className={[
              "w-14 items-center justify-center py-2 rounded-2xl border",
              isSelected
                ? "bg-fairway-600 border-fairway-600"
                : "bg-white border-ink-200",
            ].join(" ")}
            accessibilityRole="button"
            accessibilityLabel={`${weekday} ${dayNum}${isSelected ? ", selected" : ""}`}
          >
            {/* Weekday abbreviation */}
            <Text
              className={[
                "text-xs font-medium",
                isSelected ? "text-white/80" : "text-ink-500",
              ].join(" ")}
            >
              {weekday}
            </Text>

            {/* Day number */}
            <Text
              className={[
                "text-base font-bold mt-0.5",
                isSelected ? "text-white" : "text-ink-900",
              ].join(" ")}
            >
              {dayNum}
            </Text>

            {/* Marked-date indicator dot */}
            {isMarked ? (
              <View
                className={[
                  "w-1.5 h-1.5 rounded-full mt-1",
                  isSelected ? "bg-white/70" : "bg-fairway-500",
                ].join(" ")}
              />
            ) : (
              // Reserve the dot space so pill height stays consistent.
              <View className="w-1.5 h-1.5 mt-1" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
