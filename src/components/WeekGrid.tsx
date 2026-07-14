/**
 * WeekGrid: a visual weekly calendar (time rows × day columns) with lessons
 * rendered as colour-coded blocks. Horizontally scrollable so it works on phone
 * and web. Themed in the app's olive/slate palette.
 */
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { addDays, parseISO } from "@/utils/dates";
import { lessonParticipantLabel } from "@/utils/lessons";
import { formatTime, todayISO } from "@/utils/format";
import type { Lesson } from "@/types";

const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_H = 56;
const DAY_W = 124;
const TIME_W = 52;
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatHour(h: number): string {
  const ampm = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

/** Block colour by session type / status, all from the brand palette. */
function blockColor(l: Lesson): string {
  if (l.status === "requested") return "#5F5933"; // pending, dark olive
  if (l.type === "group") return "#3C505C"; // slate
  if (l.type === "review") return "#687a76"; // sage
  if (l.status === "completed") return "#9CACA7"; // light sage
  return "#087c34"; // confirmed, accessible fairway green
}

interface WeekGridProps {
  weekStart: string; // ISO of the first day (Sunday)
  lessons: Lesson[]; // lessons within the week
  nameById: Record<string, string>;
  onPressLesson: (lesson: Lesson) => void;
}

export default function WeekGrid({ weekStart, lessons, nameById, onPressLesson }: WeekGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_H;
  const today = todayISO();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="rounded-2xl border border-ink-200 bg-white"
    >
      <View>
        {/* Day header row */}
        <View className="flex-row border-b border-ink-200">
          <View style={{ width: TIME_W }} />
          {days.map((d) => {
            const dt = parseISO(d);
            const isToday = d === today;
            return (
              <View
                key={d}
                style={{ width: DAY_W }}
                className={`items-center border-l border-ink-100 py-2 ${
                  isToday ? "bg-fairway-50" : ""
                }`}
              >
                <Text className="text-[11px] text-ink-400">{WD[dt.getDay()]}</Text>
                <Text
                  className={`text-sm font-bold ${isToday ? "text-fairway-700" : "text-ink-900"}`}
                >
                  {dt.getDate()}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Grid body */}
        <View className="flex-row" style={{ height: gridHeight }}>
          {/* Time axis */}
          <View style={{ width: TIME_W }}>
            {hours.map((h) => (
              <View key={h} style={{ height: HOUR_H }} className="items-end pr-1">
                <Text className="text-[10px] text-ink-400" style={{ marginTop: -6 }}>
                  {formatHour(h)}
                </Text>
              </View>
            ))}
          </View>

          {/* Day columns */}
          {days.map((d) => {
            const dayLessons = lessons.filter(
              (l) => l.date === d && l.status !== "cancelled" && l.status !== "noShow"
            );
            return (
              <View
                key={d}
                style={{ width: DAY_W, height: gridHeight }}
                className={`border-l border-ink-100 ${d === today ? "bg-fairway-50/40" : ""}`}
              >
                {/* Hour gridlines */}
                {hours.map((h) => (
                  <View key={h} style={{ height: HOUR_H }} className="border-b border-ink-100" />
                ))}

                {/* Lesson blocks */}
                {dayLessons.map((l) => {
                  const top = ((toMinutes(l.startTime) - START_HOUR * 60) / 60) * HOUR_H;
                  if (top < 0 || top >= gridHeight) return null;
                  const height = Math.max((l.duration / 60) * HOUR_H - 2, 22);
                  return (
                    <Pressable
                      key={l.id}
                      onPress={() => onPressLesson(l)}
                      style={{
                        position: "absolute",
                        top,
                        height,
                        left: 2,
                        right: 2,
                        backgroundColor: blockColor(l),
                        borderRadius: 6,
                        paddingHorizontal: 5,
                        paddingVertical: 3,
                        overflow: "hidden",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }} numberOfLines={1}>
                        {formatTime(l.startTime)}
                      </Text>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }} numberOfLines={2}>
                        {lessonParticipantLabel(l, nameById)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
