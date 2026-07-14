import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { EmptyState } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import type { CoachStackParamList } from "@/navigation/types";
import type { Lesson } from "@/types";
import { addDays, startOfWeek } from "@/utils/dates";
import { formatTime, todayISO } from "@/utils/format";
import { lessonParticipantLabel } from "@/utils/lessons";

const bg = "#082417";
const appBg = "#080d10";
const panel = "#11181c";
const line = "rgba(255,255,255,0.08)";
const text = "#f6fbf8";
const muted = "#95a5a0";
const green = "#12c86f";

type Nav = NativeStackNavigationProp<CoachStackParamList>;
type ViewMode = "month" | "week" | "list";

function Shell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1, backgroundColor: bg, padding: width >= 1024 ? 18 : 0 }}>
      <View style={{ flex: 1, overflow: "hidden", backgroundColor: appBg, borderRadius: width >= 1024 ? 16 : 0, borderWidth: width >= 1024 ? 1 : 0, borderColor: "rgba(255,255,255,0.1)" }}>
        {children}
      </View>
    </View>
  );
}

function Toggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 7, backgroundColor: active ? "#202a30" : "transparent", paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ color: active ? text : muted, fontSize: 11, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

function lessonColor(index: number) {
  return ["#2089e6", "#15b86d", "#17b978", "#8058df", "#f29a25"][index % 5];
}

function CalendarBlock({
  lesson,
  index,
  name,
  onPress,
}: {
  lesson: Lesson;
  index: number;
  name: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        left: 5,
        right: 5,
        top: 12 + index * 86,
        height: index === 0 ? 74 : 64,
        borderRadius: 6,
        backgroundColor: lessonColor(index),
        padding: 9,
        justifyContent: "space-between",
      }}
    >
      <Text numberOfLines={1} style={{ color: text, fontSize: 11, fontWeight: "900" }}>{name.split(" ")[0]}</Text>
      <Text numberOfLines={1} style={{ color: "rgba(255,255,255,0.85)", fontSize: 10 }}>{lesson.title ?? lesson.type}</Text>
    </Pressable>
  );
}

export default function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const coachId = user?.id ?? "";
  const { lessons, upcoming, loading } = useLessons({ coachId });
  const { players } = usePlayers(coachId);
  const [mode, setMode] = useState<ViewMode>("week");
  const today = todayISO();
  const weekStart = startOfWeek(today);
  const desktop = width >= 860;

  const playerMap = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.name])), [players]);
  const weekDays = useMemo(() => Array.from({ length: 6 }, (_, index) => addDays(weekStart, index + 1)), [weekStart]);
  const weekLessons = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays.at(-1) ?? start;
    return lessons.filter((lesson) => lesson.date >= start && lesson.date <= end);
  }, [lessons, weekDays]);
  const byDay = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    weekLessons.forEach((lesson) => {
      (map[lesson.date] ??= []).push(lesson);
    });
    Object.values(map).forEach((items) => items.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [weekLessons]);

  const openLesson = (lesson: Lesson) => {
    if (lesson.playerId) {
      navigation.navigate("PlayerProfile", { playerId: lesson.playerId });
      return;
    }
    navigation.navigate("AddLesson", { date: lesson.date, startTime: lesson.startTime });
  };

  return (
    <Shell>
      <ScrollView contentContainerStyle={{ padding: width >= 1024 ? 22 : 16, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: desktop ? "row" : "column", alignItems: desktop ? "center" : "stretch", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
          <Text style={{ color: text, fontSize: 27, fontWeight: "900", letterSpacing: -0.5 }}>Schedule</Text>
          <Pressable onPress={() => navigation.navigate("AddLesson", { date: today })} style={{ alignSelf: desktop ? "auto" : "flex-start", borderRadius: 8, backgroundColor: green, paddingHorizontal: 17, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="add" size={16} color={text} />
            <Text style={{ color: text, fontSize: 12, fontWeight: "900" }}>New Lesson</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", borderRadius: 8, backgroundColor: "#11181c", borderWidth: 1, borderColor: line, padding: 3 }}>
            {(["month", "week", "list"] as ViewMode[]).map((item) => (
              <Toggle key={item} label={item[0].toUpperCase() + item.slice(1)} active={mode === item} onPress={() => setMode(item)} />
            ))}
          </View>
          <Text style={{ color: "#c3cfca", fontSize: 12 }}>Jul 13 - Jul 19, 2026</Text>
          <Pressable style={{ width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: line, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-forward" size={16} color={muted} />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={green} size="large" style={{ marginTop: 120 }} />
        ) : mode === "list" ? (
          <View style={{ backgroundColor: panel, borderWidth: 1, borderColor: line, borderRadius: 10, overflow: "hidden" }}>
            {upcoming.slice(0, 14).map((lesson, index) => (
              <Pressable key={lesson.id} onPress={() => openLesson(lesson)} style={{ minHeight: 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: index ? 1 : 0, borderTopColor: line }}>
                <Text style={{ width: 78, color: text, fontSize: 12, fontWeight: "800" }}>{formatTime(lesson.startTime)}</Text>
                <Text style={{ flex: 1, color: "#dbe6e2", fontSize: 12 }}>{lessonParticipantLabel(lesson, playerMap)}</Text>
                <Text style={{ color: muted, fontSize: 11 }}>{lesson.date}</Text>
              </Pressable>
            ))}
          </View>
        ) : weekLessons.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No lessons this week" message="Add a lesson to start filling the schedule." actionLabel="New Lesson" onAction={() => navigation.navigate("AddLesson", { date: today })} />
        ) : (
          <View style={{ backgroundColor: panel, borderWidth: 1, borderColor: line, borderRadius: 10, overflow: "hidden", minHeight: desktop ? 600 : 740 }}>
            <View style={{ height: 48, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: line }}>
              <View style={{ width: desktop ? 56 : 42 }} />
              {weekDays.map((day) => (
                <View key={day} style={{ flex: 1, alignItems: "center", justifyContent: "center", borderLeftWidth: 1, borderLeftColor: line }}>
                  <Text style={{ color: "#dbe6e2", fontSize: 11, fontWeight: "900" }}>
                    {new Date(day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <Text style={{ color: muted, fontSize: 10, marginTop: 2 }}>{Number(day.slice(-2))}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", minHeight: desktop ? 552 : 690 }}>
              <View style={{ width: desktop ? 56 : 42, borderRightWidth: 1, borderRightColor: line }}>
                {["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"].map((hour) => (
                  <View key={hour} style={{ height: 54, alignItems: "center", paddingTop: 6 }}>
                    <Text style={{ color: muted, fontSize: 10 }}>{hour}</Text>
                  </View>
                ))}
              </View>
              {weekDays.map((day) => (
                <View key={day} style={{ flex: 1, position: "relative", borderLeftWidth: 1, borderLeftColor: line }}>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <View key={index} style={{ height: 54, borderTopWidth: index ? 1 : 0, borderTopColor: "rgba(255,255,255,0.055)" }} />
                  ))}
                  {(byDay[day] ?? []).slice(0, 4).map((lesson, index) => (
                    <CalendarBlock key={lesson.id} lesson={lesson} index={index} name={lessonParticipantLabel(lesson, playerMap)} onPress={() => openLesson(lesson)} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Shell>
  );
}
