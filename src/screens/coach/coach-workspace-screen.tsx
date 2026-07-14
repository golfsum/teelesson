import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, Button, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { MiniBars } from "@/components/charts/Charts";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import { colors } from "@/theme";
import { currency, formatDate, formatTime, todayISO } from "@/utils/format";
import type { CoachTabsParamList } from "@/navigation/types";

type WorkspaceRoute = RouteProp<CoachTabsParamList>;
type WorkspaceName = Exclude<keyof CoachTabsParamList, "Dashboard" | "Players" | "Schedule" | "Profile">;

const TITLES: Record<WorkspaceName, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Lessons: { title: "Lessons", subtitle: "Review every coaching session and its status.", icon: "time-outline" },
  Messages: { title: "Messages", subtitle: "Keep student follow-ups attached to the coaching relationship.", icon: "chatbox-outline" },
  Programs: { title: "Programs", subtitle: "Package repeatable coaching plans for students and groups.", icon: "book-outline" },
  Payments: { title: "Payments", subtitle: "Track collected and outstanding lesson revenue.", icon: "card-outline" },
  Reports: { title: "Reports", subtitle: "See lesson volume, revenue, and student activity at a glance.", icon: "stats-chart-outline" },
  Videos: { title: "Videos", subtitle: "Organize swing reviews alongside each student record.", icon: "videocam-outline" },
  Drills: { title: "Drills Library", subtitle: "Assign focused practice work after every lesson.", icon: "clipboard-outline" },
};

const PROGRAMS = [
  { name: "Break 90", detail: "6 lessons · 8 practice assignments", students: 8, status: "Active" },
  { name: "Short Game Reset", detail: "4 lessons · 12 drills", students: 5, status: "Active" },
  { name: "Junior Summer Clinic", detail: "8 group sessions", students: 12, status: "Enrollment open" },
];

const DRILLS = [
  { name: "Alignment Stick Gate", category: "Full swing", duration: "12 min", icon: "git-compare-outline" as const },
  { name: "9-Ball Flight Ladder", category: "Ball striking", duration: "20 min", icon: "analytics-outline" as const },
  { name: "3-6-9 Putting Ladder", category: "Putting", duration: "15 min", icon: "ellipse-outline" as const },
  { name: "Landing Zone Wedges", category: "Short game", duration: "18 min", icon: "flag-outline" as const },
];

function PageHeading({ name, action }: { name: WorkspaceName; action?: React.ReactNode }) {
  const info = TITLES[name];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: colors.navySoft, alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(3, 29, 24, 0.12)" }}>
          <Ionicons name={info.icon} size={19} color={colors.fairway[300]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.fairway[700], fontSize: 8, fontWeight: "900", letterSpacing: 1.3 }}>COACH WORKSPACE</Text>
          <Text selectable style={{ color: colors.ink[900], fontSize: 25, fontWeight: "800", letterSpacing: -0.7 }}>
            {info.title}
          </Text>
          <Text selectable style={{ color: colors.ink[500], fontSize: 12, marginTop: 3 }}>{info.subtitle}</Text>
        </View>
      </View>
      {action}
    </View>
  );
}

function LessonsWorkspace({ coachId }: { coachId: string }) {
  const navigation = useNavigation<any>();
  const { lessons } = useLessons({ coachId });
  const { players } = usePlayers(coachId);
  const names = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p.name])), [players]);
  const sorted = [...lessons].sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  return (
    <>
      <PageHeading name="Lessons" action={<Button title="+ New lesson" size="sm" onPress={() => navigation.getParent()?.navigate("AddLesson")} />} />
      <Card className="p-0 overflow-hidden">
        {sorted.slice(0, 12).map((lesson, index) => (
          <Pressable
            key={lesson.id}
            onPress={() => lesson.playerId && navigation.getParent()?.navigate("PlayerProfile", { playerId: lesson.playerId })}
            style={{
              minHeight: 70,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              borderTopWidth: index ? 1 : 0,
              borderTopColor: colors.ink[200],
            }}
          >
            <View style={{ width: 76 }}>
              <Text style={{ color: colors.ink[900], fontSize: 12, fontWeight: "700" }}>{formatDate(lesson.date)}</Text>
              <Text style={{ color: colors.ink[500], fontSize: 11, marginTop: 2 }}>{formatTime(lesson.startTime)}</Text>
            </View>
            <Avatar name={names[lesson.playerId ?? ""] ?? lesson.title} size={34} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: colors.ink[900], fontSize: 13, fontWeight: "700" }}>
                {names[lesson.playerId ?? ""] ?? lesson.title ?? "Coaching block"}
              </Text>
              <Text style={{ color: colors.ink[500], fontSize: 11, marginTop: 2 }}>{lesson.duration} min · {lesson.type}</Text>
            </View>
            <View style={{ borderRadius: 999, backgroundColor: lesson.status === "requested" ? colors.sand[100] : colors.fairway[50], paddingHorizontal: 9, paddingVertical: 5 }}>
              <Text style={{ color: lesson.status === "requested" ? "#8b5b00" : colors.fairway[700], fontSize: 10.5, fontWeight: "700", textTransform: "capitalize" }}>{lesson.status}</Text>
            </View>
          </Pressable>
        ))}
      </Card>
    </>
  );
}

function MessagesWorkspace({ coachId }: { coachId: string }) {
  const { players } = usePlayers(coachId);
  const [selectedId, setSelectedId] = useState<string | undefined>(players[0]?.id);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Record<string, string[]>>({});
  React.useEffect(() => {
    if (!selectedId && players[0]) setSelectedId(players[0].id);
  }, [players, selectedId]);
  const selected = players.find((p) => p.id === selectedId) ?? players[0];
  const send = () => {
    const message = draft.trim();
    if (!message || !selected) return;
    setSent((current) => ({ ...current, [selected.id]: [...(current[selected.id] ?? []), message] }));
    setDraft("");
  };
  return (
    <>
      <PageHeading name="Messages" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        <Card className="p-0 overflow-hidden">
          <View style={{ width: 260 }}>
            {players.slice(0, 6).map((player, index) => (
              <Pressable key={player.id} onPress={() => setSelectedId(player.id)} style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: selected?.id === player.id ? colors.fairway[50] : colors.white, borderTopWidth: index ? 1 : 0, borderTopColor: colors.ink[200] }}>
                <Avatar name={player.name} uri={player.photoURL} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.ink[900] }}>{player.name}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 10.5, color: colors.ink[500], marginTop: 2 }}>Practice follow-up ready</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Card>
        <Card className="flex-1 min-w-[300px]" >
          {selected ? (
            <View style={{ minHeight: 390 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.ink[200] }}>
                <Avatar name={selected.name} uri={selected.photoURL} size={36} />
                <View><Text style={{ color: colors.ink[900], fontWeight: "700", fontSize: 13 }}>{selected.name}</Text><Text style={{ color: colors.fairway[600], fontSize: 10.5, marginTop: 2 }}>Student</Text></View>
              </View>
              <View style={{ flex: 1, paddingVertical: 18, gap: 10 }}>
                <View style={{ alignSelf: "flex-start", maxWidth: "80%", borderRadius: 10, backgroundColor: colors.ink[100], padding: 11 }}><Text style={{ color: colors.ink[700], fontSize: 12, lineHeight: 18 }}>Thanks for the lesson. I’ll send a swing video after tomorrow’s practice.</Text></View>
                {(sent[selected.id] ?? []).map((message, index) => <View key={`${message}-${index}`} style={{ alignSelf: "flex-end", maxWidth: "80%", borderRadius: 10, backgroundColor: colors.fairway[600], padding: 11 }}><Text style={{ color: colors.white, fontSize: 12, lineHeight: 18 }}>{message}</Text></View>)}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: colors.ink[200], paddingTop: 12 }}>
                <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Write a message…" placeholderTextColor={colors.ink[400]} style={{ flex: 1, minHeight: 40, borderWidth: 1, borderColor: colors.ink[200], borderRadius: 8, paddingHorizontal: 12, color: colors.ink[900], fontSize: 12 }} />
                <Pressable onPress={send} accessibilityRole="button" accessibilityLabel="Send message" style={{ width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.fairway[600] }}><Ionicons name="send" size={16} color={colors.white} /></Pressable>
              </View>
            </View>
          ) : <EmptyState icon="chatbox-outline" title="No students yet" message="Invite a student to start a coaching conversation." />}
        </Card>
      </View>
    </>
  );
}

function ProgramsWorkspace() {
  const navigation = useNavigation<any>();
  return <><PageHeading name="Programs" action={<Button title="+ New program" size="sm" onPress={() => navigation.getParent()?.navigate("AddLesson")} />} /><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{PROGRAMS.map((program, index) => <Card key={program.name} className="min-w-[240px] flex-1"><View style={{ width: 38, height: 38, borderRadius: 9, backgroundColor: [colors.fairway[50], "#f0f4ff", colors.sand[50]][index], alignItems: "center", justifyContent: "center", marginBottom: 20 }}><Ionicons name={["golf-outline", "flag-outline", "people-outline"][index] as keyof typeof Ionicons.glyphMap} size={19} color={[colors.fairway[600], colors.blue, colors.orange][index]} /></View><Text style={{ fontSize: 16, fontWeight: "800", color: colors.ink[900] }}>{program.name}</Text><Text style={{ fontSize: 11.5, color: colors.ink[500], marginTop: 6 }}>{program.detail}</Text><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}><Text style={{ color: colors.ink[700], fontSize: 11, fontWeight: "600" }}>{program.students} students</Text><Text style={{ color: colors.fairway[600], fontSize: 10.5, fontWeight: "700" }}>{program.status}</Text></View></Card>)}</View></>;
}

function PaymentsWorkspace({ coachId }: { coachId: string }) {
  const { user } = useAuth();
  const { lessons, setPaid } = useLessons({ coachId });
  const { players } = usePlayers(coachId);
  const names = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p.name])), [players]);
  const rate = user?.hourlyRate ?? 0;
  const total = lessons.filter((l) => l.paid).reduce((sum, l) => sum + rate * l.duration / 60, 0);
  const outstanding = lessons.filter((l) => !l.paid && l.status !== "cancelled");
  return <><PageHeading name="Payments" /><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 }}><Card className="flex-1 min-w-[200px]"><Text style={{ color: colors.ink[500], fontSize: 11 }}>Collected</Text><Text style={{ color: colors.ink[900], fontSize: 26, fontWeight: "800", marginTop: 7, fontVariant: ["tabular-nums"] }}>{currency(total)}</Text></Card><Card className="flex-1 min-w-[200px]"><Text style={{ color: colors.ink[500], fontSize: 11 }}>Outstanding lessons</Text><Text style={{ color: colors.ink[900], fontSize: 26, fontWeight: "800", marginTop: 7, fontVariant: ["tabular-nums"] }}>{outstanding.length}</Text></Card></View><Card className="p-0 overflow-hidden">{outstanding.slice(0, 10).map((lesson, index) => <View key={lesson.id} style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: index ? 1 : 0, borderTopColor: colors.ink[200] }}><Avatar name={names[lesson.playerId ?? ""] ?? lesson.title} size={34} /><View style={{ flex: 1 }}><Text style={{ color: colors.ink[900], fontWeight: "700", fontSize: 12.5 }}>{names[lesson.playerId ?? ""] ?? lesson.title ?? "Coaching block"}</Text><Text style={{ color: colors.ink[500], fontSize: 10.5, marginTop: 3 }}>{formatDate(lesson.date)} · {lesson.duration} min</Text></View><Text style={{ color: colors.ink[900], fontSize: 12, fontWeight: "700" }}>{currency(rate * lesson.duration / 60)}</Text><Button title="Mark paid" size="sm" variant="outline" onPress={() => setPaid(lesson.id, true)} /></View>)}</Card></>;
}

function ReportsWorkspace({ coachId }: { coachId: string }) {
  const { lessons } = useLessons({ coachId });
  const { players } = usePlayers(coachId);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = new Date().getFullYear();
  const values = months.map((label, index) => ({ label, value: lessons.filter((l) => l.date.startsWith(`${year}-${String(index + 1).padStart(2, "0")}`)).length }));
  const completion = lessons.length ? Math.round(lessons.filter((l) => l.status === "completed").length / lessons.length * 100) : 0;
  return <><PageHeading name="Reports" /><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>{[[players.length,"Active students"],[lessons.length,"Total lessons"],[`${completion}%`,"Completion rate"]].map(([value,label]) => <Card key={label} className="flex-1 min-w-[180px]"><Text style={{ fontSize: 25, fontWeight: "800", color: colors.ink[900] }}>{value}</Text><Text style={{ fontSize: 11, color: colors.ink[500], marginTop: 5 }}>{label}</Text></Card>)}</View><Card><Text style={{ fontSize: 14, fontWeight: "800", color: colors.ink[900], marginBottom: 18 }}>Lesson volume</Text><MiniBars data={values} color={colors.fairway[500]} height={190} /></Card></>;
}

function LibraryWorkspace({ name }: { name: "Videos" | "Drills" }) {
  const navigation = useNavigation<any>();
  return <><PageHeading name={name} action={<Button title={name === "Videos" ? "+ Add review" : "+ New drill"} size="sm" onPress={() => navigation.navigate("Players")} />} /><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{DRILLS.map((drill, index) => <Card key={drill.name} className="min-w-[220px] flex-1"><View style={{ height: name === "Videos" ? 118 : 46, borderRadius: 8, backgroundColor: index % 2 ? "#eaf5ef" : "#eef2f7", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Ionicons name={name === "Videos" ? "play-circle" : drill.icon} size={name === "Videos" ? 38 : 21} color={colors.fairway[600]} /></View><Text style={{ color: colors.ink[900], fontSize: 13.5, fontWeight: "800" }}>{name === "Videos" ? `${drill.name} review` : drill.name}</Text><Text style={{ color: colors.ink[500], fontSize: 10.5, marginTop: 5 }}>{drill.category} · {drill.duration}</Text><Pressable onPress={() => navigation.navigate("Players")} style={{ marginTop: 16 }}><Text style={{ color: colors.fairway[600], fontSize: 11, fontWeight: "700" }}>Assign to student</Text></Pressable></Card>)}</View></>;
}

export default function CoachWorkspaceScreen() {
  const route = useRoute<WorkspaceRoute>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const name = route.name as WorkspaceName;
  const coachId = user?.id ?? "";
  return (
    <ScreenContainer maxWidth={1240} contentContainerStyle={{ backgroundColor: colors.forestCanvas }}>
      <View style={{ paddingHorizontal: width >= 1024 ? 8 : 0, paddingTop: width >= 1024 ? 8 : 0 }}>
        {name === "Lessons" ? <LessonsWorkspace coachId={coachId} /> : null}
        {name === "Messages" ? <MessagesWorkspace coachId={coachId} /> : null}
        {name === "Programs" ? <ProgramsWorkspace /> : null}
        {name === "Payments" ? <PaymentsWorkspace coachId={coachId} /> : null}
        {name === "Reports" ? <ReportsWorkspace coachId={coachId} /> : null}
        {name === "Videos" || name === "Drills" ? <LibraryWorkspace name={name} /> : null}
      </View>
    </ScreenContainer>
  );
}
