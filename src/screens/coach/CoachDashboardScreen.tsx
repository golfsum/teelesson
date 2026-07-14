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
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "@/components/ui";
import { Sparkline } from "@/components/charts/Charts";
import GolfLineIcon, { type GolfIconName } from "@/components/GolfLineIcon";
import { USE_DEMO_DATA } from "@/firebase/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import { colors } from "@/theme";
import { currency, formatTime, todayISO } from "@/utils/format";
import { lessonParticipantLabel } from "@/utils/lessons";
import type { Lesson, Player } from "@/types";

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

type Facts = {
  activeStudents: number;
  lessonsThisWeek: number;
  bookingRequests: number;
  revenue: number;
  unpaidCount: number;
};

function Shell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1, backgroundColor: bg, padding: width >= 1024 ? 18 : 0 }}>
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          backgroundColor: appBg,
          borderRadius: width >= 1024 ? 16 : 0,
          borderWidth: width >= 1024 ? 1 : 0,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function DarkCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: panel,
          borderWidth: 1,
          borderColor: line,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 20px 48px rgba(0,0,0,0.28)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function TopBar({ search, setSearch }: { search: string; setSearch: (value: string) => void }) {
  const { user } = useAuth();
  return (
    <View
      style={{
        height: 58,
        borderBottomWidth: 1,
        borderBottomColor: line,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 22,
        gap: 18,
      }}
    >
      <View
        style={{
          width: 330,
          maxWidth: "48%",
          height: 34,
          borderRadius: 7,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          backgroundColor: "#0b1114",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        <Ionicons name="search-outline" size={15} color={muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search students, lessons or plans..."
          placeholderTextColor="#70807a"
          style={{ flex: 1, color: text, fontSize: 12, outlineStyle: "none" as any }}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GolfLineIcon name="notifications" size={23} color="#e8f0ed" accent={green} muted="#74847f" strokeWidth={5.4} simple />
        <View
          style={{
            position: "absolute",
            right: 2,
            top: 1,
            minWidth: 15,
            height: 15,
            borderRadius: 8,
            backgroundColor: red,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: text, fontSize: 8, fontWeight: "900" }}>3</Text>
        </View>
      </Pressable>
      <Avatar name={user?.name ?? "Coach Thompson"} uri={user?.photoURL} size={32} />
      <Text numberOfLines={1} style={{ color: "#b8c6c1", fontSize: 12 }}>
        {user?.name ?? "Coach Thompson"}
      </Text>
      <Ionicons name="chevron-down" size={14} color={muted} />
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
  trend,
  color = green,
  style,
}: {
  icon: GolfIconName;
  label: string;
  value: string;
  trend: string;
  color?: string;
  style?: any;
}) {
  return (
    <DarkCard style={[{ height: 124, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            backgroundColor: "rgba(18,200,111,0.13)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GolfLineIcon name={icon} size={32} color={text} accent={color} muted="#4e5b57" strokeWidth={4.5} />
        </View>
        <Text style={{ color: "#dce8e4", fontSize: 12, fontWeight: "700" }}>{label}</Text>
      </View>
      <Text style={{ color: text, fontSize: 27, fontWeight: "900", marginTop: 7, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ color, fontSize: 11, marginTop: 2, fontWeight: "700" }}>↑ {trend}</Text>
    </DarkCard>
  );
}

function SectionHead({ title, action }: { title: string; action?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ color: text, fontSize: 14, fontWeight: "900" }}>{title}</Text>
      {action ? <Text style={{ color: "#d5e1dd", fontSize: 11 }}>{action}</Text> : null}
    </View>
  );
}

function UpcomingLessons({
  lessons,
  playerMap,
  onPrepare,
}: {
  lessons: Lesson[];
  playerMap: Record<string, string>;
  onPrepare: (lesson: Lesson) => void;
}) {
  const rows = lessons.slice(0, 3);
  return (
    <DarkCard style={{ flex: 1.2, padding: 16, minHeight: 234 }}>
      <SectionHead title="Upcoming Lessons" action="View All" />
      <View style={{ gap: 10 }}>
        {rows.map((lesson, index) => {
          const name = lessonParticipantLabel(lesson, playerMap);
          return (
            <View
              key={lesson.id}
              style={{
                minHeight: 54,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderTopWidth: index ? 1 : 0,
                borderTopColor: line,
                paddingTop: index ? 10 : 0,
              }}
            >
              <Avatar name={name} size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ color: text, fontSize: 12, fontWeight: "800" }}>
                  {name}
                </Text>
                <Text numberOfLines={1} style={{ color: muted, fontSize: 10, marginTop: 3 }}>
                  {index === 2 ? "Tomorrow" : "Today"} • {formatTime(lesson.startTime)}
                </Text>
              </View>
              <View style={{ width: 90 }}>
                <Text numberOfLines={1} style={{ color: "#d9e4e0", fontSize: 10 }}>
                  {lesson.title ?? (lesson.type === "group" ? "Short Game" : "Full Swing")}
                </Text>
                <Text style={{ color: muted, fontSize: 10, marginTop: 2 }}>Lesson {index + 2}/5</Text>
              </View>
              <Pressable
                onPress={() => onPrepare(lesson)}
                style={{ borderRadius: 7, backgroundColor: green, paddingHorizontal: 14, paddingVertical: 9 }}
              >
                <Text style={{ color: text, fontSize: 11, fontWeight: "900" }}>Prepare</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </DarkCard>
  );
}

function NeedsAttention({ facts, onNavigate }: { facts: Facts; onNavigate: (route: string) => void }) {
  const rows = [
    { icon: "video-review" as const, color: red, label: "3 videos awaiting review", route: "Videos" },
    { icon: "booking" as const, color: orange, label: `${facts.bookingRequests} new booking requests`, route: "Schedule" },
    { icon: "students" as const, color: orange, label: "4 students need follow-up", route: "Players" },
  ];
  return (
    <DarkCard style={{ padding: 16, minHeight: 128 }}>
      <SectionHead title="Needs Your Attention" action="3" />
      {rows.map((row, index) => (
        <Pressable
          key={row.label}
          onPress={() => onNavigate(row.route)}
          style={{
            minHeight: 36,
            flexDirection: "row",
            alignItems: "center",
            gap: 11,
            borderTopWidth: index ? 1 : 0,
            borderTopColor: line,
          }}
        >
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: `${row.color}40`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${row.color}66` }}>
            <GolfLineIcon name={row.icon} size={21} color={text} accent={row.color} muted="#a4b0ab" strokeWidth={6.3} simple />
          </View>
          <Text style={{ flex: 1, color: "#d8e3df", fontSize: 12 }}>{row.label}</Text>
          <Ionicons name="chevron-forward" size={14} color={muted} />
        </Pressable>
      ))}
    </DarkCard>
  );
}

function RecentActivity() {
  return (
    <DarkCard style={{ padding: 16, minHeight: 92 }}>
      <SectionHead title="Recent Activity" />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: green, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="checkmark" size={15} color={text} />
        </View>
        <Text style={{ flex: 1, color: "#d8e3df", fontSize: 12 }}>Jordan Kim booked a follow-up lesson</Text>
        <Text style={{ color: muted, fontSize: 10 }}>2h ago</Text>
      </View>
    </DarkCard>
  );
}

function buildFacts(lessons: Lesson[], upcoming: Lesson[], players: Player[], hourlyRate: number): Facts {
  const today = todayISO();
  const weekEnd = new Date(new Date(today + "T12:00:00").getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
  const lessonsThisWeek = upcoming.filter((lesson) => lesson.date >= today && lesson.date < weekEnd).length;
  const activeIds = new Set(upcoming.flatMap((lesson) => lesson.playerIds?.length ? lesson.playerIds : lesson.playerId ? [lesson.playerId] : []));
  const unpaid = lessons.filter((lesson) => !lesson.paid && lesson.status !== "cancelled").length;
  const month = today.slice(0, 7);
  const revenue = lessons
    .filter((lesson) => lesson.paid && lesson.date.startsWith(month))
    .reduce((sum, lesson) => sum + lesson.duration / 60 * hourlyRate, 0);
  return {
    activeStudents: USE_DEMO_DATA ? 42 : activeIds.size,
    lessonsThisWeek: USE_DEMO_DATA ? 9 : lessonsThisWeek,
    bookingRequests: USE_DEMO_DATA ? 3 : lessons.filter((lesson) => lesson.status === "requested").length,
    revenue: USE_DEMO_DATA ? 5240 : revenue,
    unpaidCount: unpaid,
  };
}

export default function CoachDashboardScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const coachId = user?.id ?? "";
  const { players, loading: playersLoading } = usePlayers(coachId);
  const { lessons, upcoming, loading: lessonsLoading } = useLessons({ coachId });
  const [search, setSearch] = useState("");
  const loading = playersLoading || lessonsLoading;
  const facts = useMemo(() => buildFacts(lessons, upcoming, players, user?.hourlyRate ?? 0), [lessons, upcoming, players, user?.hourlyRate]);
  const playerMap = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.name])), [players]);
  const columns = width >= 1120;

  const openLesson = (lesson: Lesson) => {
    if (lesson.playerId) {
      navigation.getParent()?.navigate("PlayerProfile", { playerId: lesson.playerId });
      return;
    }
    navigation.getParent()?.navigate("AddLesson", { date: lesson.date, startTime: lesson.startTime });
  };

  return (
    <Shell>
      <TopBar search={search} setSearch={setSearch} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: width >= 1024 ? 22 : 16, paddingBottom: 34 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          <View>
            <Text style={{ color: text, fontSize: width >= 900 ? 27 : 23, fontWeight: "900", letterSpacing: -0.6 }}>
              Good morning, Coach!
            </Text>
            <Text style={{ color: "#bcc9c4", fontSize: 14, marginTop: 7 }}>
              Focus on coaching. We'll make the rest easier.
            </Text>
          </View>
          <Text style={{ color: "#b9c6c1", fontSize: 12, marginTop: 4 }}>Mon, Jul 13, 2026</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={green} size="large" style={{ marginTop: 120 }} />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: columns ? "row" : "column", gap: 14 }}>
              <Metric icon="students" label="Active Students" value={String(facts.activeStudents)} trend="14% vs last month" style={{ flex: 1 }} />
              <Metric icon="calendar-club" label="Lessons This Week" value={String(facts.lessonsThisWeek)} trend="2 vs last week" style={{ flex: 1 }} />
              <Metric icon="booking" label="Booking Requests" value={String(facts.bookingRequests)} trend="2 new today" style={{ flex: 1 }} />
              <Metric icon="revenue" label="Revenue This Month" value={currency(facts.revenue)} trend="22% vs last month" style={{ flex: 1 }} />
            </View>

            <View style={{ flexDirection: columns ? "row" : "column", gap: 16 }}>
              <UpcomingLessons lessons={upcoming} playerMap={playerMap} onPrepare={openLesson} />
              <View style={{ flex: 1, gap: 16 }}>
                <NeedsAttention facts={facts} onNavigate={(route) => navigation.navigate(route)} />
                <RecentActivity />
              </View>
            </View>

            <DarkCard style={{ padding: 16, minHeight: columns ? 224 : 392 }}>
              <SectionHead title="Coaching Snapshot" />
              <View style={{ flexDirection: columns ? "row" : "column", gap: 14, alignItems: "stretch" }}>
                <View style={{ flex: 1.25, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 13, minHeight: 160 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <View>
                      <Text style={{ color: text, fontSize: 14, fontWeight: "900" }}>Student progress</Text>
                      <Text style={{ color: muted, fontSize: 10, marginTop: 4 }}>Handicap and practice trend</Text>
                    </View>
                    <Text style={{ color: green, fontSize: 18, fontWeight: "900" }}>+18%</Text>
                  </View>
                  <Sparkline values={[12, 18, 16, 24, 28, 25, 34, 41, 48, 52]} color={green} width={columns ? 315 : 320} height={62} strokeWidth={2.4} />
                  <View style={{ marginTop: 9, flexDirection: "row", gap: 8 }}>
                    {["Alex is ready for driver work", "Morgan putting improved"].map((item) => (
                      <View key={item} style={{ flex: 1, borderRadius: 8, backgroundColor: "#0d1417", padding: 11, borderWidth: 1, borderColor: line }}>
                        <Text numberOfLines={2} style={{ color: "#dce8e4", fontSize: 11, lineHeight: 15, fontWeight: "800" }}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1, gap: 12 }}>
                  <View style={{ flex: 1, minHeight: 80, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 12 }}>
                    <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Revenue trend</Text>
                    <Text style={{ color: green, fontSize: 20, fontWeight: "900", marginTop: 10 }}>{currency(facts.revenue)}</Text>
                    <Text style={{ color: green, fontSize: 11, marginTop: 4, fontWeight: "800" }}>↑ 22% vs last month</Text>
                    <View style={{ marginTop: 7, flexDirection: "row", alignItems: "flex-end", gap: 6, height: 30 }}>
                      {[22, 30, 26, 38, 34, 48, 57, 68].map((height, index) => (
                        <View key={index} style={{ flex: 1, height, borderRadius: 3, backgroundColor: green, opacity: 0.55 + index * 0.05 }} />
                      ))}
                    </View>
                  </View>

                  <View style={{ flex: 1, minHeight: 80, flexDirection: columns ? "row" : "column", gap: 12 }}>
                    <View style={{ flex: 1, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 12 }}>
                      <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Upcoming availability</Text>
                      <Text style={{ color: "#dce8e4", fontSize: 21, fontWeight: "900", marginTop: 10 }}>6 slots</Text>
                      <Text style={{ color: muted, fontSize: 10, marginTop: 5 }}>Open before Friday</Text>
                      <Pressable onPress={() => navigation.navigate("Schedule")} style={{ marginTop: 7, alignSelf: "flex-start", borderRadius: 7, backgroundColor: "#223039", paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ color: text, fontSize: 10, fontWeight: "900" }}>View calendar</Text>
                      </Pressable>
                    </View>

                    <View style={{ flex: 1, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 12 }}>
                      <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Lesson types</Text>
                      {[
                        ["Full Swing", "44%"],
                        ["Short Game", "31%"],
                        ["Video Review", "25%"],
                      ].map(([label, value]) => (
                        <View key={label} style={{ marginTop: 6 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: "#dce8e4", fontSize: 10, fontWeight: "800" }}>{label}</Text>
                            <Text style={{ color: muted, fontSize: 10 }}>{value}</Text>
                          </View>
                          <View style={{ height: 5, borderRadius: 999, backgroundColor: "#0a1013", marginTop: 5, overflow: "hidden" }}>
                            <View style={{ width: value as any, height: "100%", borderRadius: 999, backgroundColor: green }} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </DarkCard>
          </View>
        )}
      </ScrollView>
    </Shell>
  );
}
