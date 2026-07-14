/**
 * PlayerHomeScreen, "My Lessons"
 * The player's home tab: displays their linked coach, upcoming/past lessons,
 * and a prominent "Book a Lesson" CTA.
 */
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { getUser } from "@/firebase/dbService";
import type { AppUser, Lesson } from "@/types";
import type { PlayerStackParamList } from "@/navigation/types";
import { colors } from "@/theme";

import { Button, Card, ScreenContainer, EmptyState } from "@/components/ui";
import LessonCard from "@/components/LessonCard";

type Nav = NativeStackNavigationProp<PlayerStackParamList>;

export default function PlayerHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const playerId = user?.id ?? "";
  const coachId = user?.coachId;

  const { upcoming, past, loading, cancelLesson } = useLessons({ playerId });

  const [coach, setCoach] = useState<AppUser | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  // Player cancels their own request / booking (coach is notified via status).
  const handleCancel = (lesson: Lesson) => {
    const isRequest = lesson.status === "requested";
    Alert.alert(
      isRequest ? "Cancel request?" : "Cancel lesson?",
      isRequest
        ? "Your coach won't see this request anymore."
        : "Your coach will be notified this lesson was cancelled.",
      [
        { text: "Keep", style: "cancel" },
        { text: "Cancel it", style: "destructive", onPress: () => cancelLesson(lesson.id) },
      ]
    );
  };

  // Fetch the linked coach's profile for display name
  useEffect(() => {
    if (!coachId) return;
    setCoachLoading(true);
    getUser(coachId)
      .then((c) => setCoach(c ?? null))
      .catch(() => setCoach(null))
      .finally(() => setCoachLoading(false));
  }, [coachId]);

  const coachName = coach?.name ?? "Your Coach";

  const isLoading = loading || coachLoading;

  // Renders a single lesson row; upcoming lessons get a Cancel action.
  const renderLesson = (item: Lesson, cancelable: boolean) => (
    <LessonCard
      lesson={item}
      title={coachName}
      rightActions={
        cancelable ? (
          <Button
            title={item.status === "requested" ? "Cancel request" : "Cancel"}
            variant="outline"
            size="sm"
            onPress={() => handleCancel(item)}
          />
        ) : undefined
      }
    />
  );

  // Unified list data: upcoming section header + items, past section header + items
  type ListRow =
    | { kind: "header"; label: string }
    | { kind: "lesson"; data: Lesson; cancelable: boolean }
    | { kind: "bookCta" }
    | { kind: "empty" };

  const buildRows = (): ListRow[] => {
    const rows: ListRow[] = [];

    rows.push({ kind: "bookCta" });

    if (upcoming.length > 0) {
      rows.push({ kind: "header", label: "Upcoming Lessons" });
      upcoming.forEach((l) => rows.push({ kind: "lesson", data: l, cancelable: true }));
    }

    if (past.length > 0) {
      rows.push({ kind: "header", label: "Past Lessons" });
      past.forEach((l) => rows.push({ kind: "lesson", data: l, cancelable: false }));
    }

    if (upcoming.length === 0 && past.length === 0) {
      rows.push({ kind: "empty" });
    }

    return rows;
  };

  const rows = buildRows();

  if (isLoading) {
    return (
      <ScreenContainer fixed padded>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.fairway[600]} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={700}>
      {/* Page heading */}
      <Text className="text-2xl font-extrabold text-ink-900 mt-4 mb-2 px-4">
        My Lessons
      </Text>

      {/* Coach card, shown only when a coachId is linked */}
      {coachId ? (
        <Card className="mx-4 mb-4">
          <Text className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-0.5">
            Your Coach
          </Text>
          <Text className="text-lg font-bold text-ink-900">{coachName}</Text>
        </Card>
      ) : (
        /* Player has no linked coach */
        <Card className="mx-4 mb-4">
          <Text className="text-ink-500 text-sm">
            You&apos;re not linked to a coach yet. Ask your coach to send you an
            invite link.
          </Text>
        </Card>
      )}

      {/* Main list: CTA, upcoming, past, empty state */}
      <FlatList
        data={rows}
        keyExtractor={(item, index) => {
          if (item.kind === "lesson") return item.data.id;
          return `${item.kind}-${index}`;
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          if (item.kind === "bookCta") {
            return (
              <View className="px-4 mb-4">
                <Button
                  title="Book a Lesson"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={
                    <Text style={{ color: "#fff", fontSize: 18, marginRight: 4 }}>
                      ⛳
                    </Text>
                  }
                  onPress={() => navigation.navigate("BookLesson")}
                />
              </View>
            );
          }

          if (item.kind === "header") {
            return (
              <Text className="text-xs font-semibold text-ink-500 uppercase tracking-widest px-4 mb-2 mt-2">
                {item.label}
              </Text>
            );
          }

          if (item.kind === "lesson") {
            return (
              <View className="px-4 mb-2">
                {renderLesson(item.data, item.cancelable)}
              </View>
            );
          }

          // empty state
          return (
            <EmptyState
              icon="golf-outline"
              title="No lessons yet"
              message="Ready to improve your game? Book your first lesson with your coach."
              actionLabel="Book your first lesson"
              onAction={() => navigation.navigate("BookLesson")}
            />
          );
        }}
      />
    </ScreenContainer>
  );
}
