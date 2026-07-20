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

import { Sparkline } from "@/components/charts/Charts";
import GolfLineIcon, { type GolfIconName } from "@/components/GolfLineIcon";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useAvailability } from "@/hooks/useAvailability";
import { useLessons } from "@/hooks/useLessons";
import { usePlayers } from "@/hooks/usePlayers";
import { colors } from "@/theme";
import { currency, formatDate, formatTime, todayISO } from "@/utils/format";
import { lessonParticipantIds, lessonParticipantLabel } from "@/utils/lessons";
import type { AvailabilitySlot, Lesson, LessonType, Player } from "@/types";

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
  newStudentsThisMonth: number;
  lessonsThisWeek: number;
  previousWeekLessons: number;
  bookingRequests: number;
  newBookingRequestsToday: number;
  revenue: number;
  previousMonthRevenue: number;
  unpaidCount: number;
  outstandingAmount: number;
  videoReviewCount: number;
  followUpCount: number;
  availabilityCount: number;
  lessonTypeBreakdown: Array<{ label: string; percent: number }>;
  revenueBars: number[];
  studentProgress: number[];
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

function DarkCard({ children, style }: { children: React.ReactNode; style?: any }) {
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

function TopBar({
  search,
  setSearch,
  notificationCount,
  onNotifications,
  onSearchSubmit,
}: {
  search: string;
  setSearch: (value: string) => void;
  notificationCount: number;
  onNotifications: () => void;
  onSearchSubmit: () => void;
}) {
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
          onSubmitEditing={onSearchSubmit}
          placeholder="Search students, lessons or plans..."
          placeholderTextColor="#70807a"
          style={{ flex: 1, color: text, fontSize: 12, outlineStyle: "none" as any }}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        onPress={onNotifications}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GolfLineIcon name="notifications" size={23} color="#e8f0ed" accent={green} muted="#74847f" strokeWidth={5.4} simple />
        {notificationCount > 0 ? (
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
            <Text style={{ color: text, fontSize: 8, fontWeight: "900" }}>{Math.min(notificationCount, 9)}</Text>
          </View>
        ) : null}
      </Pressable>
      <Avatar name={user?.name ?? "Coach"} uri={user?.photoURL} size={32} />
      <Text numberOfLines={1} style={{ color: "#b8c6c1", fontSize: 12 }}>
        {user?.name ?? "Coach"}
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
      <Text style={{ color, fontSize: 11, marginTop: 2, fontWeight: "700" }}>{trend}</Text>
    </DarkCard>
  );
}

function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ color: text, fontSize: 14, fontWeight: "900" }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} disabled={!onAction}>
          <Text style={{ color: "#d5e1dd", fontSize: 11 }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function lessonTypeLabel(type: LessonType) {
  const labels: Record<LessonType, string> = {
    range: "Range Lesson",
    simulator: "Simulator",
    online: "Online Lesson",
    indoor: "Indoor Lesson",
    group: "Group Clinic",
    review: "Video Review",
  };
  return labels[type] ?? "Lesson";
}

function UpcomingLessons({
  lessons,
  playerMap,
  onPrepare,
  onViewAll,
}: {
  lessons: Lesson[];
  playerMap: Record<string, string>;
  onPrepare: (lesson: Lesson) => void;
  onViewAll: () => void;
}) {
  const rows = lessons.slice(0, 3);
  return (
    <DarkCard style={{ flex: 1.2, padding: 16, minHeight: 234 }}>
      <SectionHead title="Upcoming Lessons" action="View All" onAction={onViewAll} />
      <View style={{ gap: 10 }}>
        {rows.length ? rows.map((lesson, index) => {
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
                  {formatDate(lesson.date)} • {formatTime(lesson.startTime)}
                </Text>
              </View>
              <View style={{ width: 100 }}>
                <Text numberOfLines={1} style={{ color: "#d9e4e0", fontSize: 10 }}>
                  {lesson.title ?? lessonTypeLabel(lesson.type)}
                </Text>
                <Text style={{ color: muted, fontSize: 10, marginTop: 2 }}>{lesson.duration} min • {lesson.status}</Text>
              </View>
              <Pressable
                onPress={() => onPrepare(lesson)}
                style={{ borderRadius: 7, backgroundColor: green, paddingHorizontal: 14, paddingVertical: 9 }}
              >
                <Text style={{ color: text, fontSize: 11, fontWeight: "900" }}>Prepare</Text>
              </Pressable>
            </View>
          );
        }) : (
          <Text style={{ color: muted, fontSize: 12 }}>No upcoming lessons scheduled.</Text>
        )}
      </View>
    </DarkCard>
  );
}

function NeedsAttention({ facts, onNavigate }: { facts: Facts; onNavigate: (route: string) => void }) {
  const rows = [
    facts.videoReviewCount > 0 ? { icon: "video-review" as const, color: red, label: `${facts.videoReviewCount} video ${facts.videoReviewCount === 1 ? "review" : "reviews"} awaiting review`, route: "Videos" } : null,
    facts.bookingRequests > 0 ? { icon: "booking" as const, color: orange, label: `${facts.bookingRequests} booking ${facts.bookingRequests === 1 ? "request" : "requests"} awaiting approval`, route: "Schedule" } : null,
    facts.outstandingAmount > 0 ? { icon: "revenue" as const, color: orange, label: `${currency(facts.outstandingAmount)} outstanding`, route: "Payments" } : null,
    facts.followUpCount > 0 ? { icon: "students" as const, color: orange, label: `${facts.followUpCount} students need follow-up`, route: "Players" } : null,
  ].filter(Boolean) as Array<{ icon: GolfIconName; color: string; label: string; route: string }>;

  return (
    <DarkCard style={{ padding: 16, minHeight: 128 }}>
      <SectionHead title="Needs Your Attention" action={String(rows.length)} />
      {rows.length ? rows.map((row, index) => (
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
      )) : (
        <Text style={{ color: muted, fontSize: 12 }}>No urgent actions right now.</Text>
      )}
    </DarkCard>
  );
}

function RecentActivity({ items }: { items: Array<{ id: string; label: string; detail: string; time: string }> }) {
  return (
    <DarkCard style={{ padding: 16, minHeight: 92 }}>
      <SectionHead title="Recent Activity" />
      <View style={{ gap: 10 }}>
        {items.length ? items.map((item) => (
          <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: green, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark" size={15} color={text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#d8e3df", fontSize: 12 }}>{item.label}</Text>
              <Text style={{ color: muted, fontSize: 10, marginTop: 2 }}>{item.detail}</Text>
            </View>
            <Text style={{ color: muted, fontSize: 10 }}>{item.time}</Text>
          </View>
        )) : (
          <Text style={{ color: muted, fontSize: 12 }}>Activity will appear as lessons and bookings change.</Text>
        )}
      </View>
    </DarkCard>
  );
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthKey(offset = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function trend(current: number, previous: number, suffix: string) {
  if (previous <= 0 && current > 0) return `↑ ${current} ${suffix}`;
  if (previous <= 0) return `0 ${suffix}`;
  const delta = Math.round((current - previous) / previous * 100);
  if (delta > 0) return `↑ ${delta}% ${suffix}`;
  if (delta < 0) return `↓ ${Math.abs(delta)}% ${suffix}`;
  return `No change ${suffix}`;
}

function estimateLessonRevenue(lesson: Lesson, hourlyRate: number) {
  return lesson.duration / 60 * hourlyRate;
}

function buildFacts(lessons: Lesson[], upcoming: Lesson[], players: Player[], slots: AvailabilitySlot[], hourlyRate: number): Facts {
  const today = todayISO();
  const weekEnd = addDays(today, 7);
  const previousWeekStart = addDays(today, -7);
  const month = monthKey();
  const previousMonth = monthKey(-1);
  const lessonsThisWeek = upcoming.filter((lesson) => lesson.date >= today && lesson.date < weekEnd).length;
  const previousWeekLessons = lessons.filter((lesson) => lesson.date >= previousWeekStart && lesson.date < today && lesson.status !== "cancelled").length;
  const upcomingPlayerIds = new Set(upcoming.flatMap(lessonParticipantIds));
  const unpaidLessons = lessons.filter((lesson) => !lesson.paid && lesson.status !== "cancelled" && lesson.status !== "requested");
  const revenue = lessons
    .filter((lesson) => lesson.paid && lesson.date.startsWith(month) && lesson.status !== "cancelled")
    .reduce((sum, lesson) => sum + estimateLessonRevenue(lesson, hourlyRate), 0);
  const previousMonthRevenue = lessons
    .filter((lesson) => lesson.paid && lesson.date.startsWith(previousMonth) && lesson.status !== "cancelled")
    .reduce((sum, lesson) => sum + estimateLessonRevenue(lesson, hourlyRate), 0);
  const typeCounts = lessons
    .filter((lesson) => lesson.status !== "cancelled")
    .reduce<Record<string, number>>((acc, lesson) => {
      const label = lessonTypeLabel(lesson.type);
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
  const totalTypes = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
  const lessonTypeBreakdown = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, percent: totalTypes ? Math.round(count / totalTypes * 100) : 0 }));
  const revenueBars = Array.from({ length: 8 }, (_, index) => {
    const start = addDays(today, -(7 - index) * 4);
    const end = addDays(start, 4);
    return lessons
      .filter((lesson) => lesson.paid && lesson.date >= start && lesson.date < end && lesson.status !== "cancelled")
      .reduce((sum, lesson) => sum + estimateLessonRevenue(lesson, hourlyRate), 0);
  });

  return {
    activeStudents: players.length,
    newStudentsThisMonth: players.filter((player) => player.createdAt && new Date(player.createdAt).toISOString().startsWith(month)).length,
    lessonsThisWeek,
    previousWeekLessons,
    bookingRequests: lessons.filter((lesson) => lesson.status === "requested").length,
    newBookingRequestsToday: lessons.filter((lesson) => lesson.status === "requested" && lesson.createdAt && new Date(lesson.createdAt).toISOString().slice(0, 10) === today).length,
    revenue,
    previousMonthRevenue,
    unpaidCount: unpaidLessons.length,
    outstandingAmount: unpaidLessons.reduce((sum, lesson) => sum + estimateLessonRevenue(lesson, hourlyRate), 0),
    videoReviewCount: lessons.filter((lesson) => ["review", "online"].includes(lesson.type) && lesson.status !== "completed" && lesson.status !== "cancelled").length,
    followUpCount: players.filter((player) => !upcomingPlayerIds.has(player.id)).length,
    availabilityCount: slots.length,
    lessonTypeBreakdown,
    revenueBars,
    studentProgress: players.slice(0, 10).map((player, index) => Number((player.handicap ?? 18) + index * 0.4)).reverse(),
  };
}

function buildRecentActivity(lessons: Lesson[], playerMap: Record<string, string>) {
  return [...lessons]
    .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
    .slice(0, 3)
    .map((lesson) => {
      const name = lessonParticipantLabel(lesson, playerMap);
      const action =
        lesson.status === "requested"
          ? "requested a lesson"
          : lesson.status === "completed"
            ? "completed a lesson"
            : lesson.status === "cancelled"
              ? "cancelled a lesson"
              : "has an upcoming lesson";
      return {
        id: lesson.id,
        label: `${name} ${action}`,
        detail: `${lessonTypeLabel(lesson.type)} • ${formatDate(lesson.date)} at ${formatTime(lesson.startTime)}`,
        time: lesson.updatedAt || lesson.createdAt ? "recent" : formatDate(lesson.date),
      };
    });
}

function currentDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CoachDashboardScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const coachId = user?.id ?? "";
  const { players, loading: playersLoading } = usePlayers(coachId);
  const { lessons, upcoming, loading: lessonsLoading } = useLessons({ coachId });
  const { slots, loading: availabilityLoading } = useAvailability(coachId);
  const [search, setSearch] = useState("");
  const loading = playersLoading || lessonsLoading || availabilityLoading;
  const hourlyRate = user?.hourlyRate ?? 0;
  const facts = useMemo(() => buildFacts(lessons, upcoming, players, slots, hourlyRate), [lessons, upcoming, players, slots, hourlyRate]);
  const playerMap = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.name])), [players]);
  const recentActivity = useMemo(() => buildRecentActivity(lessons, playerMap), [lessons, playerMap]);
  const columns = width >= 1120;
  const maxRevenue = Math.max(...facts.revenueBars, 1);
  const progressValues = facts.studentProgress.length ? facts.studentProgress : [0, 0, 0, 0];
  const progressChange = progressValues.length > 1 ? Math.round((progressValues[progressValues.length - 1] - progressValues[0]) * 10) / 10 : 0;

  const openLesson = (lesson: Lesson) => {
    if (lesson.playerId) {
      navigation.getParent()?.navigate("PlayerProfile", { playerId: lesson.playerId });
      return;
    }
    navigation.getParent()?.navigate("AddLesson", { date: lesson.date, startTime: lesson.startTime });
  };

  return (
    <Shell>
      <TopBar
        search={search}
        setSearch={setSearch}
        notificationCount={facts.bookingRequests + facts.videoReviewCount + facts.unpaidCount}
        onNotifications={() => navigation.navigate("Messages")}
        onSearchSubmit={() => navigation.navigate("Players")}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: width >= 1024 ? 22 : 16, paddingBottom: 34 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          <View>
            <Text style={{ color: text, fontSize: width >= 900 ? 27 : 23, fontWeight: "900", letterSpacing: -0.6 }}>
              Good morning, {user?.name?.split(" ")[0] ?? "Coach"}!
            </Text>
            <Text style={{ color: "#bcc9c4", fontSize: 14, marginTop: 7 }}>
              Focus on coaching. We'll make the rest easier.
            </Text>
          </View>
          <Text style={{ color: "#b9c6c1", fontSize: 12, marginTop: 4 }}>{currentDateLabel()}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={green} size="large" style={{ marginTop: 120 }} />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: columns ? "row" : "column", gap: 14 }}>
              <Metric icon="students" label="Active Students" value={String(facts.activeStudents)} trend={`↑ ${facts.newStudentsThisMonth} new this month`} style={{ flex: 1 }} />
              <Metric icon="calendar-club" label="Lessons This Week" value={String(facts.lessonsThisWeek)} trend={trend(facts.lessonsThisWeek, facts.previousWeekLessons, "vs last week")} style={{ flex: 1 }} />
              <Metric icon="booking" label="Booking Requests" value={String(facts.bookingRequests)} trend={`↑ ${facts.newBookingRequestsToday} new today`} style={{ flex: 1 }} />
              <Metric icon="revenue" label="Revenue This Month" value={currency(facts.revenue)} trend={trend(facts.revenue, facts.previousMonthRevenue, "vs last month")} style={{ flex: 1 }} />
            </View>

            <View style={{ flexDirection: columns ? "row" : "column", gap: 16 }}>
              <UpcomingLessons lessons={upcoming} playerMap={playerMap} onPrepare={openLesson} onViewAll={() => navigation.navigate("Schedule")} />
              <View style={{ flex: 1, gap: 16 }}>
                <NeedsAttention facts={facts} onNavigate={(route) => navigation.navigate(route)} />
                <RecentActivity items={recentActivity} />
              </View>
            </View>

            <DarkCard style={{ padding: 16, minHeight: columns ? 224 : 392 }}>
              <SectionHead title="Coaching Snapshot" />
              <View style={{ flexDirection: columns ? "row" : "column", gap: 14, alignItems: "stretch" }}>
                <View style={{ flex: 1.25, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 13, minHeight: 160 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <View>
                      <Text style={{ color: text, fontSize: 14, fontWeight: "900" }}>Student progress</Text>
                      <Text style={{ color: muted, fontSize: 10, marginTop: 4 }}>Handicap trend from current roster</Text>
                    </View>
                    <Text style={{ color: progressChange <= 0 ? green : orange, fontSize: 18, fontWeight: "900" }}>
                      {progressChange > 0 ? "+" : ""}{progressChange}
                    </Text>
                  </View>
                  <Sparkline values={progressValues} color={green} width={columns ? 315 : 320} height={62} strokeWidth={2.4} />
                  <View style={{ marginTop: 9, flexDirection: "row", gap: 8 }}>
                    {players.slice(0, 2).map((player) => (
                      <Pressable key={player.id} onPress={() => navigation.getParent()?.navigate("PlayerProfile", { playerId: player.id })} style={{ flex: 1, borderRadius: 8, backgroundColor: "#0d1417", padding: 11, borderWidth: 1, borderColor: line }}>
                        <Text numberOfLines={2} style={{ color: "#dce8e4", fontSize: 11, lineHeight: 15, fontWeight: "800" }}>{player.name}: {player.goals ?? "Set next goal"}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1, gap: 12 }}>
                  <View style={{ flex: 1, minHeight: 80, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 12 }}>
                    <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Revenue trend</Text>
                    <Text style={{ color: green, fontSize: 20, fontWeight: "900", marginTop: 10 }}>{currency(facts.revenue)}</Text>
                    <Text style={{ color: green, fontSize: 11, marginTop: 4, fontWeight: "800" }}>{trend(facts.revenue, facts.previousMonthRevenue, "vs last month")}</Text>
                    <View style={{ marginTop: 7, flexDirection: "row", alignItems: "flex-end", gap: 6, height: 30 }}>
                      {facts.revenueBars.map((value, index) => (
                        <View key={index} style={{ flex: 1, height: Math.max(5, value / maxRevenue * 68), borderRadius: 3, backgroundColor: green, opacity: 0.55 + index * 0.05 }} />
                      ))}
                    </View>
                  </View>

                  <View style={{ flex: 1, minHeight: 80, flexDirection: columns ? "row" : "column", gap: 12 }}>
                    <View style={{ flex: 1, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 12 }}>
                      <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Upcoming availability</Text>
                      <Text style={{ color: "#dce8e4", fontSize: 21, fontWeight: "900", marginTop: 10 }}>{facts.availabilityCount} slots</Text>
                      <Text style={{ color: muted, fontSize: 10, marginTop: 5 }}>Configured booking windows</Text>
                      <Pressable onPress={() => navigation.getParent()?.navigate("Availability")} style={{ marginTop: 7, alignSelf: "flex-start", borderRadius: 7, backgroundColor: "#223039", paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ color: text, fontSize: 10, fontWeight: "900" }}>Edit availability</Text>
                      </Pressable>
                    </View>

                    <View style={{ flex: 1, borderRadius: 9, backgroundColor: panelSoft, borderWidth: 1, borderColor: line, padding: 12 }}>
                      <Text style={{ color: text, fontSize: 13, fontWeight: "900" }}>Lesson types</Text>
                      {(facts.lessonTypeBreakdown.length ? facts.lessonTypeBreakdown : [{ label: "No lessons yet", percent: 0 }]).map(({ label, percent }) => (
                        <View key={label} style={{ marginTop: 6 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: "#dce8e4", fontSize: 10, fontWeight: "800" }}>{label}</Text>
                            <Text style={{ color: muted, fontSize: 10 }}>{percent}%</Text>
                          </View>
                          <View style={{ height: 5, borderRadius: 999, backgroundColor: "#0a1013", marginTop: 5, overflow: "hidden" }}>
                            <View style={{ width: `${percent}%`, height: "100%", borderRadius: 999, backgroundColor: green }} />
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
