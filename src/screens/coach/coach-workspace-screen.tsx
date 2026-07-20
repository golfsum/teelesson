import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { MiniBars, Sparkline } from "@/components/charts/Charts";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import type { CoachTabsParamList } from "@/navigation/types";
import { currency, formatDate, formatTime, todayISO } from "@/utils/format";
import { lessonParticipantIds, lessonParticipantLabel } from "@/utils/lessons";
import type { Lesson } from "@/types";

const bg = "#082417";
const appBg = "#080d10";
const panel = "#11181c";
const panelSoft = "#151e23";
const line = "rgba(255,255,255,0.08)";
const text = "#f6fbf8";
const muted = "#95a5a0";
const green = "#12c86f";
const red = "#ff4d57";

type WorkspaceRoute = RouteProp<CoachTabsParamList>;
type WorkspaceName = Exclude<keyof CoachTabsParamList, "Dashboard" | "Players" | "Schedule" | "Profile">;

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

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[{ backgroundColor: panel, borderWidth: 1, borderColor: line, borderRadius: 10, overflow: "hidden" }, style]}>{children}</View>;
}

function Header({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ height: 58, borderBottomWidth: 1, borderBottomColor: line, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 14 }}>
      <View style={{ width: 330, height: 34, borderRadius: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", backgroundColor: "#0b1114", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 }}>
        <Ionicons name="search-outline" size={15} color={muted} />
        <Text style={{ color: "#70807a", fontSize: 12 }}>Search students...</Text>
      </View>
      <View style={{ flex: 1 }} />
      {actionLabel ? (
        <Pressable onPress={onAction} style={{ borderRadius: 8, backgroundColor: green, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ color: text, fontSize: 12, fontWeight: "900" }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function lessonRevenue(lesson: Lesson, hourlyRate: number) {
  return lesson.duration / 60 * hourlyRate;
}

function LessonPlans({ coachId }: { coachId: string }) {
  const navigation = useNavigation<any>();
  const { players } = usePlayers(coachId);
  const { upcoming } = useLessons({ coachId });
  const player = players.find((item) => upcoming.some((lesson) => lessonParticipantIds(lesson).includes(item.id))) ?? players[0];
  const playerUpcoming = player ? upcoming.filter((lesson) => lessonParticipantIds(lesson).includes(player.id)) : [];
  const planItems = [
    player?.goals ?? "Set a current swing focus",
    playerUpcoming[0] ? `Prepare for ${formatDate(playerUpcoming[0].date)} lesson` : "Schedule the next lesson",
    player?.notes ? "Review current coach notes" : "Add coach notes after next lesson",
    "Confirm homework before the next session",
    "Log progress after lesson",
  ];

  return (
    <>
      <Header title="Lesson Plans" actionLabel="Add Lesson" onAction={() => navigation.getParent()?.navigate("AddLesson", player ? { playerId: player.id } : undefined)} />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 760, alignSelf: "center", width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Avatar name={player?.name ?? "Student"} uri={player?.photoURL} size={58} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: text, fontSize: 20, fontWeight: "900" }}>{player?.name ?? "No student selected"}</Text>
              <View style={{ flexDirection: "row", gap: 7, marginTop: 8 }}>
                <Text style={{ color: muted, fontSize: 11, backgroundColor: panelSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 }}>Handicap {player?.handicap ?? "N/A"}</Text>
                <Text style={{ color: muted, fontSize: 11, backgroundColor: panelSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 }}>{player?.goals ?? "Set goal"}</Text>
              </View>
            </View>
          </View>
          <Card style={{ padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ color: text, fontSize: 15, fontWeight: "900" }}>Current Plan • {playerUpcoming.length} upcoming</Text>
              <Text style={{ color: muted, fontSize: 11 }}>{player ? "Connected to student record" : "Add a student to start"}</Text>
            </View>
            {planItems.map((task, index) => {
              const done = index < Math.min(2, playerUpcoming.length);
              return (
                <Pressable key={task} onPress={() => player ? navigation.getParent()?.navigate("PlayerProfile", { playerId: player.id }) : navigation.navigate("Players")} style={{ minHeight: 34, flexDirection: "row", alignItems: "center", gap: 11 }}>
                  <Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={20} color={done ? green : muted} />
                  <Text style={{ color: done ? "#dfe8e5" : muted, fontSize: 12 }}>{task}</Text>
                </Pressable>
              );
            })}
          </Card>
          <Card style={{ padding: 16 }}>
            <Text style={{ color: text, fontSize: 15, fontWeight: "900", marginBottom: 14 }}>Drills This Week</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 128, height: 88, borderRadius: 8, backgroundColor: "#30483e", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="play-circle" size={46} color={text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>{player?.goals ? `${player.goals} drill` : "Practice drill"}</Text>
                <Text style={{ color: muted, fontSize: 11, marginTop: 5 }}>{playerUpcoming[0] ? `${playerUpcoming[0].duration} min • ${formatDate(playerUpcoming[0].date)}` : "Add a lesson to assign drills"}</Text>
                <Pressable onPress={() => navigation.navigate("Messages")} style={{ alignSelf: "flex-start", marginTop: 18, borderRadius: 7, backgroundColor: "#202a30", paddingHorizontal: 12, paddingVertical: 9 }}>
                  <Text style={{ color: text, fontSize: 11, fontWeight: "800" }}>Share with Student</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

function VideoReviews({ coachId }: { coachId: string }) {
  const navigation = useNavigation<any>();
  const { lessons } = useLessons({ coachId });
  const { players } = usePlayers(coachId);
  const playerMap = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.name])), [players]);
  const reviewLessons = lessons
    .filter((lesson) => ["review", "online"].includes(lesson.type) && lesson.status !== "cancelled")
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  const pendingCount = reviewLessons.filter((lesson) => lesson.status !== "completed").length;

  return (
    <>
      <Header title="Video Reviews" actionLabel="Upload Video" onAction={() => navigation.getParent()?.navigate("AddLesson", { date: todayISO() })} />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: text, fontSize: 25, fontWeight: "900", marginBottom: 12 }}>Video Reviews</Text>
        <View style={{ flexDirection: "row", backgroundColor: panel, borderRadius: 8, borderWidth: 1, borderColor: line, padding: 4, marginBottom: 14 }}>
          {[`Pending (${pendingCount})`, "Reviewed", "All"].map((tab, index) => (
            <View key={tab} style={{ flex: 1, borderRadius: 6, backgroundColor: index === 0 ? "#2a343a" : "transparent", paddingVertical: 10, alignItems: "center" }}>
              <Text style={{ color: index === 0 ? text : muted, fontSize: 12, fontWeight: "800" }}>{tab}</Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 10 }}>
          {reviewLessons.length ? reviewLessons.slice(0, 8).map((lesson) => {
            const name = lessonParticipantLabel(lesson, playerMap);
            return (
              <Card key={lesson.id} style={{ padding: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 84, height: 62, borderRadius: 8, backgroundColor: "#425a44", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="play-circle" size={34} color={text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: text, fontSize: 12, fontWeight: "900" }}>{name}</Text>
                    <Text style={{ color: muted, fontSize: 10, marginTop: 4 }}>{lesson.title ?? "Swing review"}</Text>
                    <Text style={{ color: muted, fontSize: 10, marginTop: 2 }}>{formatDate(lesson.date)} at {formatTime(lesson.startTime)}</Text>
                  </View>
                  {lesson.status !== "completed" ? (
                    <View style={{ borderRadius: 6, backgroundColor: red, paddingHorizontal: 8, paddingVertical: 5 }}>
                      <Text style={{ color: text, fontSize: 10, fontWeight: "900" }}>Pending</Text>
                    </View>
                  ) : null}
                  <Pressable onPress={() => lesson.playerId ? navigation.getParent()?.navigate("PlayerProfile", { playerId: lesson.playerId }) : navigation.getParent()?.navigate("AddLesson", { replaceId: lesson.id })} style={{ borderRadius: 7, backgroundColor: "#2a343a", paddingHorizontal: 12, paddingVertical: 9 }}>
                    <Text style={{ color: text, fontSize: 11, fontWeight: "800" }}>Review</Text>
                  </Pressable>
                </View>
              </Card>
            );
          }) : (
            <Card style={{ padding: 18 }}>
              <Text style={{ color: "#dbe6e2", fontSize: 14 }}>No video review sessions yet. Create an online or review lesson to start tracking them here.</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function Analytics({ coachId }: { coachId: string }) {
  const { lessons } = useLessons({ coachId });
  const { user } = useAuth();
  const hourlyRate = user?.hourlyRate ?? 0;
  const month = todayISO().slice(0, 7);
  const completed = lessons.filter((lesson) => lesson.status === "completed").length;
  const revenue = lessons
    .filter((lesson) => lesson.paid && lesson.date.startsWith(month) && lesson.status !== "cancelled")
    .reduce((sum, lesson) => sum + lessonRevenue(lesson, hourlyRate), 0);
  const deliveredBars = Array.from({ length: 8 }, (_, index) => lessons.filter((lesson) => lesson.status === "completed" && Number(lesson.date.slice(-2)) % 8 === index).length);
  const revenueBars = Array.from({ length: 8 }, (_, index) => lessons.filter((lesson) => lesson.paid && Number(lesson.date.slice(-2)) % 8 === index).reduce((sum, lesson) => sum + lessonRevenue(lesson, hourlyRate), 0));

  return (
    <>
      <Header title="Analytics" />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <Text style={{ color: text, fontSize: 25, fontWeight: "900" }}>Analytics</Text>
          <View style={{ flexDirection: "row", backgroundColor: "#11181c", borderRadius: 8, borderWidth: 1, borderColor: line, padding: 4 }}>
            {["7D", "30D", "90D", "1Y"].map((period, index) => (
              <View key={period} style={{ borderRadius: 6, backgroundColor: index === 1 ? "#2a343a" : "transparent", paddingHorizontal: 11, paddingVertical: 8 }}>
                <Text style={{ color: index === 1 ? text : muted, fontSize: 11, fontWeight: "800" }}>{period}</Text>
              </View>
            ))}
          </View>
        </View>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <Text style={{ color: text, fontSize: 14, fontWeight: "900", marginBottom: 16 }}>Student Improvement</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            {[[String(completed), "Completed Lessons"], [`${lessons.filter((lesson) => lesson.paid).length}`, "Paid Lessons"], [`${lessons.filter((lesson) => lesson.status === "requested").length}`, "Open Requests"]].map(([value, label]) => (
              <View key={label}>
                <Text style={{ color: green, fontSize: 22, fontWeight: "900" }}>{value}</Text>
                <Text style={{ color: muted, fontSize: 10 }}>{label}</Text>
              </View>
            ))}
          </View>
          <Sparkline values={deliveredBars.length ? deliveredBars.map((value) => value + 1) : [1, 1, 1]} color={green} width={360} height={110} strokeWidth={2} />
        </Card>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <Card style={{ flex: 1, minWidth: 180, padding: 16 }}>
            <Text style={{ color: muted, fontSize: 12, fontWeight: "800" }}>Revenue</Text>
            <Text style={{ color: text, fontSize: 24, fontWeight: "900", marginTop: 16 }}>{currency(revenue)}</Text>
            <Text style={{ color: green, fontSize: 11, marginTop: 5 }}>Current month paid lessons</Text>
            <MiniBars data={revenueBars.map((value, index) => ({ label: String(index + 1), value }))} color={green} height={76} />
          </Card>
          <Card style={{ flex: 1, minWidth: 180, padding: 16 }}>
            <Text style={{ color: muted, fontSize: 12, fontWeight: "800" }}>Lessons Delivered</Text>
            <Text style={{ color: text, fontSize: 24, fontWeight: "900", marginTop: 16 }}>{completed}</Text>
            <Text style={{ color: green, fontSize: 11, marginTop: 5 }}>Completed lessons</Text>
            <MiniBars data={deliveredBars.map((value, index) => ({ label: String(index + 1), value }))} color={green} height={76} />
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

function Generic({ name }: { name: WorkspaceName }) {
  const navigation = useNavigation<any>();
  const labels: Partial<Record<WorkspaceName, { title: string; body: string; action: string; route: string }>> = {
    Messages: { title: "Communication Center", body: "Student messages and follow-ups are routed through the existing coach workflow.", action: "Open Students", route: "Players" },
    Payments: { title: "Payments", body: "Payment status is tracked on lessons. Use lessons to mark sessions paid or unpaid.", action: "Open Schedule", route: "Schedule" },
    Drills: { title: "Drills Library", body: "Drills connect to lesson plans and can be shared from the Lesson Plans workspace.", action: "Open Plans", route: "Programs" },
    Lessons: { title: "Lessons", body: "Create, prepare, and manage lessons from the schedule workflow.", action: "Add Lesson", route: "AddLesson" },
  };
  const copy = labels[name] ?? { title: name, body: "This workspace keeps TeeLesson data and actions available in the coach interface.", action: "Open Dashboard", route: "Dashboard" };
  return (
    <>
      <Header title={name} actionLabel={copy.action} onAction={() => copy.route === "AddLesson" ? navigation.getParent()?.navigate("AddLesson") : navigation.navigate(copy.route)} />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }}>
        <Text style={{ color: text, fontSize: 25, fontWeight: "900", marginBottom: 14 }}>{copy.title}</Text>
        <Card style={{ padding: 18 }}>
          <Text style={{ color: "#dbe6e2", fontSize: 14 }}>{copy.body}</Text>
        </Card>
      </ScrollView>
    </>
  );
}

export default function CoachWorkspaceScreen() {
  const route = useRoute<WorkspaceRoute>();
  const { user } = useAuth();
  const name = route.name as WorkspaceName;
  const coachId = user?.id ?? "";
  return (
    <Shell>
      {name === "Programs" ? <LessonPlans coachId={coachId} /> : null}
      {name === "Videos" ? <VideoReviews coachId={coachId} /> : null}
      {name === "Reports" ? <Analytics coachId={coachId} /> : null}
      {!["Programs", "Videos", "Reports"].includes(name) ? <Generic name={name} /> : null}
    </Shell>
  );
}
