import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { Sparkline } from "@/components/charts/Charts";
import { Avatar, EmptyState } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import type { CoachStackParamList } from "@/navigation/types";
import { formatDate, formatTime, todayISO } from "@/utils/format";
import { lessonParticipantIds } from "@/utils/lessons";
import type { Lesson, Player } from "@/types";

const bg = "#082417";
const appBg = "#080d10";
const panel = "#11181c";
const line = "rgba(255,255,255,0.08)";
const text = "#f6fbf8";
const muted = "#95a5a0";
const green = "#12c86f";

type Nav = NativeStackNavigationProp<CoachStackParamList>;

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

function TopSearch({
  value,
  onChange,
  coachName,
  coachPhoto,
}: {
  value: string;
  onChange: (value: string) => void;
  coachName: string;
  coachPhoto?: string;
}) {
  return (
    <View style={{ height: 58, borderBottomWidth: 1, borderBottomColor: line, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 16 }}>
      <View style={{ width: 330, height: 34, borderRadius: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", backgroundColor: "#0b1114", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 }}>
        <Ionicons name="search-outline" size={15} color={muted} />
        <TextInput value={value} onChangeText={onChange} placeholder="Search students..." placeholderTextColor="#70807a" style={{ flex: 1, color: text, fontSize: 12, outlineStyle: "none" as any }} />
      </View>
      <View style={{ flex: 1 }} />
      <Ionicons name="notifications-outline" size={20} color="#e8f0ed" />
      <Avatar name={coachName} uri={coachPhoto} size={32} />
      <Text numberOfLines={1} style={{ color: "#b8c6c1", fontSize: 12 }}>{coachName}</Text>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 7, backgroundColor: active ? "#202a30" : "#12191d", borderWidth: 1, borderColor: line, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ color: active ? text : "#a8b6b1", fontSize: 11, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

function playerLessons(player: Player, lessons: Lesson[]) {
  return lessons
    .filter((lesson) => lessonParticipantIds(lesson).includes(player.id))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

function StudentRow({ player, index, lessons, onPress }: { player: Player; index: number; lessons: Lesson[]; onPress: () => void }) {
  const today = todayISO();
  const rows = playerLessons(player, lessons);
  const past = rows.filter((lesson) => lesson.date < today || lesson.status === "completed" || lesson.status === "noShow");
  const nextLesson = rows.find((lesson) => lesson.date >= today && lesson.status !== "cancelled" && lesson.status !== "noShow");
  const lastLesson = past[past.length - 1];
  const focus = player.goals ?? "Set goal";
  const progress = player.handicap != null ? Math.max(0.1, Number((36 - player.handicap).toFixed(1))) : 0;
  const sparkValues = rows.slice(-5).map((lesson, lessonIndex) => Math.max(1, lesson.duration / 15 + lessonIndex));
  return (
    <Pressable onPress={onPress} style={{ minHeight: 68, flexDirection: "row", alignItems: "center", borderTopWidth: index ? 1 : 0, borderTopColor: line, paddingHorizontal: 16 }}>
      <View style={{ flex: 1.55, flexDirection: "row", alignItems: "center", gap: 11, minWidth: 0 }}>
        <Avatar name={player.name} uri={player.photoURL} size={38} />
        <Text numberOfLines={1} style={{ color: text, fontSize: 12, fontWeight: "800" }}>{player.name}</Text>
      </View>
      <Text style={{ flex: 0.7, color: "#d7e2de", fontSize: 12 }}>{player.handicap ?? "N/A"}</Text>
      <Text numberOfLines={1} style={{ flex: 1, color: "#d7e2de", fontSize: 12 }}>{focus}</Text>
      <Text style={{ flex: 0.9, color: "#d7e2de", fontSize: 12 }}>{lastLesson ? formatDate(lastLesson.date) : "No lessons"}</Text>
      <View style={{ flex: 0.9, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: green, fontSize: 12, fontWeight: "900" }}>{progress ? `+${progress}` : "N/A"}</Text>
        <Sparkline values={sparkValues.length ? sparkValues : [1, 1, 1]} color={green} width={48} height={24} strokeWidth={1.6} />
      </View>
      <Text style={{ flex: 0.8, color: "#d7e2de", fontSize: 11, lineHeight: 16 }}>
        {nextLesson ? `${formatDate(nextLesson.date)}\n${formatTime(nextLesson.startTime)}` : "No upcoming\nlesson"}
      </Text>
      <Ionicons name="chevron-forward" size={17} color={muted} />
    </Pressable>
  );
}

export default function PlayersListScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const coachId = user?.id ?? "";
  const { players, loading } = usePlayers(coachId);
  const { lessons, upcoming } = useLessons({ coachId });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const desktop = width >= 760;

  const upcomingIds = useMemo(() => new Set(upcoming.flatMap(lessonParticipantIds)), [upcoming]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players
      .filter((player) => !q || player.name.toLowerCase().includes(q) || player.email?.toLowerCase().includes(q))
      .filter((player) => {
        if (filter === "Juniors") return /junior|parent|kid|youth/i.test(`${player.notes ?? ""} ${player.goals ?? ""}`);
        if (filter === "Competitive") return player.handicap != null && player.handicap <= 10;
        if (filter === "Needs Follow-up") return !upcomingIds.has(player.id);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filter, players, query, upcomingIds]);

  const newThisMonth = useMemo(() => {
    const month = todayISO().slice(0, 7);
    return players.filter((player) => player.createdAt && new Date(player.createdAt).toISOString().startsWith(month)).length;
  }, [players]);

  return (
    <Shell>
      <TopSearch value={query} onChange={setQuery} coachName={user?.name ?? "Coach"} coachPhoto={user?.photoURL} />
      <ScrollView contentContainerStyle={{ padding: width >= 1024 ? 22 : 16, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: desktop ? "row" : "column", alignItems: desktop ? "center" : "stretch", justifyContent: "space-between", gap: 14, marginBottom: 22 }}>
          <View>
            <Text style={{ color: text, fontSize: 28, fontWeight: "900", letterSpacing: -0.6 }}>My Students</Text>
            <Text style={{ color: "#b9c6c1", fontSize: 14, marginTop: 6 }}>
              {players.length} active • {newThisMonth} new this month
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate("InvitePlayer")} style={{ alignSelf: desktop ? "auto" : "flex-start", borderRadius: 8, backgroundColor: green, paddingHorizontal: 17, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="add" size={16} color={text} />
            <Text style={{ color: text, fontSize: 12, fontWeight: "900" }}>Add Student</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 8, justifyContent: desktop ? "flex-end" : "flex-start", marginBottom: 14, flexWrap: "wrap" }}>
          {["All", "Juniors", "Competitive", "Needs Follow-up"].map((item) => (
            <Chip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={green} size="large" style={{ marginTop: 120 }} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="No matching students" message="Try a different search or add a new student." />
        ) : (
          <View style={{ backgroundColor: panel, borderWidth: 1, borderColor: line, borderRadius: 10, overflow: "hidden" }}>
            {desktop ? (
              <View style={{ height: 48, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, backgroundColor: "#10161a" }}>
                {["Student", "Handicap", "Focus Area", "Last Lesson", "Progress", "Next Lesson"].map((heading, index) => (
                  <Text key={heading} style={{ flex: [1.55, 0.7, 1, 0.9, 0.9, 0.8][index], color: "#dfe8e5", fontSize: 11, fontWeight: "900" }}>
                    {heading}
                  </Text>
                ))}
                <View style={{ width: 17 }} />
              </View>
            ) : null}
            {filtered.slice(0, desktop ? 12 : 30).map((player, index) => (
              desktop ? (
                <StudentRow key={player.id} player={player} index={index} lessons={lessons} onPress={() => navigation.navigate("PlayerProfile", { playerId: player.id })} />
              ) : (
                <Pressable key={player.id} onPress={() => navigation.navigate("PlayerProfile", { playerId: player.id })} style={{ padding: 14, borderTopWidth: index ? 1 : 0, borderTopColor: line, flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Avatar name={player.name} uri={player.photoURL} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: text, fontSize: 14, fontWeight: "900" }}>{player.name}</Text>
                    <Text style={{ color: muted, fontSize: 11, marginTop: 3 }}>Handicap {player.handicap ?? "N/A"} • {player.goals ?? "Set goal"}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={muted} />
                </Pressable>
              )
            ))}
          </View>
        )}
      </ScrollView>
    </Shell>
  );
}
