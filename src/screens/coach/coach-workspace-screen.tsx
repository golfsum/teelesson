import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "@/components/ui";
import { MiniBars, Sparkline } from "@/components/charts/Charts";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import type { CoachTabsParamList } from "@/navigation/types";
import { currency } from "@/utils/format";

const bg = "#082417";
const appBg = "#080d10";
const panel = "#11181c";
const panelSoft = "#151e23";
const line = "rgba(255,255,255,0.08)";
const text = "#f6fbf8";
const muted = "#95a5a0";
const green = "#12c86f";
const orange = "#f6a12a";
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

function Header({ title, back }: { title: string; back?: boolean }) {
  const navigation = useNavigation<any>();
  return (
    <View style={{ height: 58, borderBottomWidth: 1, borderBottomColor: line, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 14 }}>
      {back ? (
        <Pressable onPress={() => navigation.navigate("Programs")} style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Ionicons name="arrow-back" size={16} color={muted} />
          <Text style={{ color: muted, fontSize: 12 }}>Back</Text>
        </Pressable>
      ) : (
        <View style={{ width: 330, height: 34, borderRadius: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", backgroundColor: "#0b1114", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 }}>
          <Ionicons name="search-outline" size={15} color={muted} />
          <Text style={{ color: "#70807a", fontSize: 12 }}>Search students...</Text>
        </View>
      )}
      <View style={{ flex: 1 }} />
      {title === "Lesson Plans" ? (
        <Pressable style={{ borderRadius: 8, backgroundColor: green, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ color: text, fontSize: 12, fontWeight: "900" }}>Save Plan</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LessonPlans({ coachId }: { coachId: string }) {
  const navigation = useNavigation<any>();
  const { players } = usePlayers(coachId);
  const player = players.find((item) => item.name === "Alex Rivera") ?? players[0];
  const tasks = [
    ["Improve club path consistency", true],
    ["Increase driver distance +10 yards", true],
    ["More consistent iron contact", false],
    ["Lower scores from 90s to mid 80s", false],
    ["Improve course management", false],
  ] as const;
  return (
    <>
      <Header title="Lesson Plans" back />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 760, alignSelf: "center", width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Avatar name={player?.name ?? "Alex Rivera"} uri={player?.photoURL} size={58} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: text, fontSize: 20, fontWeight: "900" }}>{player?.name ?? "Alex Rivera"}</Text>
              <View style={{ flexDirection: "row", gap: 7, marginTop: 8 }}>
                <Text style={{ color: muted, fontSize: 11, backgroundColor: panelSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 }}>Handicap {player?.handicap ?? 12.4}</Text>
                <Text style={{ color: muted, fontSize: 11, backgroundColor: panelSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 }}>{player?.goals ?? "Full Swing"}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", backgroundColor: "#0c1215", borderRadius: 8, padding: 4, marginBottom: 14 }}>
            {["Plan", "Progress", "Notes"].map((tab, index) => (
              <View key={tab} style={{ flex: 1, borderRadius: 6, backgroundColor: index === 0 ? panelSoft : "transparent", paddingVertical: 10, alignItems: "center" }}>
                <Text style={{ color: index === 0 ? text : muted, fontSize: 12, fontWeight: "800" }}>{tab}</Text>
              </View>
            ))}
          </View>
          <Card style={{ padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ color: text, fontSize: 15, fontWeight: "900" }}>Current Plan · 5 Lessons</Text>
              <Text style={{ color: muted, fontSize: 11 }}>Lesson 3 of 5</Text>
            </View>
            {tasks.map(([task, done], index) => (
              <Pressable key={task} onPress={() => navigation.navigate("Players")} style={{ minHeight: 34, flexDirection: "row", alignItems: "center", gap: 11 }}>
                <Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={20} color={done ? green : muted} />
                <Text style={{ color: done ? "#dfe8e5" : muted, fontSize: 12 }}>{task}</Text>
              </Pressable>
            ))}
          </Card>
          <Card style={{ padding: 16 }}>
            <Text style={{ color: text, fontSize: 15, fontWeight: "900", marginBottom: 14 }}>Drills This Week</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 128, height: 88, borderRadius: 8, backgroundColor: "#30483e", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="play-circle" size={46} color={text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Driver Path Drill</Text>
                <Text style={{ color: muted, fontSize: 11, marginTop: 5 }}>3 min · Pro Tip</Text>
                <Pressable style={{ alignSelf: "flex-start", marginTop: 18, borderRadius: 7, backgroundColor: "#202a30", paddingHorizontal: 12, paddingVertical: 9 }}>
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

function VideoReviews() {
  const rows = [
    ["Jordan Kim", "Driver Swing", "Uploaded 2h ago", red],
    ["Taylor Brooks", "Iron Play", "Uploaded 1d ago", muted],
    ["Casey Nguyen", "Putting Stroke", "Uploaded 2d ago", muted],
  ];
  return (
    <>
      <Header title="Video Reviews" />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: text, fontSize: 25, fontWeight: "900", marginBottom: 12 }}>Video Reviews</Text>
        <View style={{ flexDirection: "row", backgroundColor: panel, borderRadius: 8, borderWidth: 1, borderColor: line, padding: 4, marginBottom: 14 }}>
          {["Pending (3)", "Reviewed", "All"].map((tab, index) => (
            <View key={tab} style={{ flex: 1, borderRadius: 6, backgroundColor: index === 0 ? "#2a343a" : "transparent", paddingVertical: 10, alignItems: "center" }}>
              <Text style={{ color: index === 0 ? text : muted, fontSize: 12, fontWeight: "800" }}>{tab}</Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 10 }}>
          {rows.map(([name, detail, uploaded, badge], index) => (
            <Card key={name} style={{ padding: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 84, height: 62, borderRadius: 8, backgroundColor: "#425a44", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="play-circle" size={34} color={text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: text, fontSize: 12, fontWeight: "900" }}>{name}</Text>
                  <Text style={{ color: muted, fontSize: 10, marginTop: 4 }}>{detail}</Text>
                  <Text style={{ color: muted, fontSize: 10, marginTop: 2 }}>{uploaded}</Text>
                </View>
                {index === 0 ? (
                  <View style={{ borderRadius: 6, backgroundColor: red, paddingHorizontal: 8, paddingVertical: 5 }}>
                    <Text style={{ color: text, fontSize: 10, fontWeight: "900" }}>New</Text>
                  </View>
                ) : null}
                <Pressable style={{ borderRadius: 7, backgroundColor: "#2a343a", paddingHorizontal: 12, paddingVertical: 9 }}>
                  <Text style={{ color: text, fontSize: 11, fontWeight: "800" }}>Review</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
        <Card style={{ marginTop: 18, minHeight: 120, borderStyle: "dashed", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="cloud-upload-outline" size={26} color="#dfe8e5" />
          <Text style={{ color: text, fontSize: 12, fontWeight: "800", marginTop: 8 }}>Upload Video</Text>
          <Text style={{ color: muted, fontSize: 10, marginTop: 4 }}>Drag and drop or click to upload</Text>
        </Card>
      </ScrollView>
    </>
  );
}

function Analytics({ coachId }: { coachId: string }) {
  const { lessons } = useLessons({ coachId });
  const completed = lessons.filter((lesson) => lesson.status === "completed").length;
  const revenue = 5240;
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
            {[["+1.2", "Avg Handicap Change"], ["78%", "Students Improving"], ["92%", "Lesson Retention"]].map(([value, label]) => (
              <View key={label}>
                <Text style={{ color: green, fontSize: 22, fontWeight: "900" }}>{value}</Text>
                <Text style={{ color: muted, fontSize: 10 }}>{label}</Text>
              </View>
            ))}
          </View>
          <Sparkline values={[12, 17, 19, 22, 27, 31, 29, 34, 36, 43, 48, 50, 57]} color={green} width={360} height={110} strokeWidth={2} />
        </Card>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <Card style={{ flex: 1, minWidth: 180, padding: 16 }}>
            <Text style={{ color: muted, fontSize: 12, fontWeight: "800" }}>Revenue</Text>
            <Text style={{ color: text, fontSize: 24, fontWeight: "900", marginTop: 16 }}>{currency(revenue)}</Text>
            <Text style={{ color: green, fontSize: 11, marginTop: 5 }}>↑ 22% vs last month</Text>
            <MiniBars data={[2, 4, 3, 5, 4, 6, 8, 10].map((value, index) => ({ label: String(index + 1), value }))} color={green} height={76} />
          </Card>
          <Card style={{ flex: 1, minWidth: 180, padding: 16 }}>
            <Text style={{ color: muted, fontSize: 12, fontWeight: "800" }}>Lessons Delivered</Text>
            <Text style={{ color: text, fontSize: 24, fontWeight: "900", marginTop: 16 }}>{Math.max(36, completed)}</Text>
            <Text style={{ color: green, fontSize: 11, marginTop: 5 }}>↑ 12% vs last month</Text>
            <MiniBars data={[3, 4, 5, 4, 6, 5, 7, 9].map((value, index) => ({ label: String(index + 1), value }))} color={green} height={76} />
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

function Generic({ name }: { name: WorkspaceName }) {
  return (
    <>
      <Header title={name} />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 34 }}>
        <Text style={{ color: text, fontSize: 25, fontWeight: "900", marginBottom: 14 }}>{name}</Text>
        <Card style={{ padding: 18 }}>
          <Text style={{ color: "#dbe6e2", fontSize: 14 }}>This workspace keeps the existing TeeLesson data and actions available in the dark coach interface.</Text>
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
      {name === "Videos" ? <VideoReviews /> : null}
      {name === "Reports" ? <Analytics coachId={coachId} /> : null}
      {!["Programs", "Videos", "Reports"].includes(name) ? <Generic name={name} /> : null}
    </Shell>
  );
}
