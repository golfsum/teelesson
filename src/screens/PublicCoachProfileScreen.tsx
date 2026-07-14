/**
 * PublicCoachProfileScreen
 *
 * Displays a coach's public profile fetched by slug. Accessible from both the
 * AuthStack (unauthenticated visitors) and the CoachStack (logged-in users
 * browsing other coaches). Navigation is typed loosely via `any` because the
 * screen appears in multiple navigators.
 */

import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, ScrollView } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import { Avatar, Badge, Button, EmptyState, ScreenContainer } from "@/components/ui";
import { getCoachBySlug } from "@/firebase/dbService";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";
import type { AppUser, Testimonial } from "@/types";
import type { AuthStackParamList } from "@/navigation/types";
import { currency } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A single star-quote card for a testimonial. */
function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-ink-200">
      {/* Quote mark */}
      <Text className="text-fairway-600 text-2xl font-extrabold leading-none mb-1">"</Text>
      <Text className="text-ink-700 text-sm leading-relaxed mb-3">{item.quote}</Text>
      <View className="flex-row items-center gap-2">
        <Avatar name={item.author} size={32} />
        <View>
          <Text className="text-ink-900 font-bold text-sm">{item.author}</Text>
          {item.role ? (
            <Text className="text-ink-500 text-xs">{item.role}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function PublicCoachProfileScreen() {
  const route = useRoute<RouteProp<AuthStackParamList, "PublicCoachProfile">>();
  // Use `any` for navigation because this screen lives in both AuthStack and CoachStack.
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const { slug } = route.params;

  const [coach, setCoach] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getCoachBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setCoach(result);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenContainer fixed>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.fairway[600]} />
        </View>
      </ScreenContainer>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !coach) {
    return (
      <ScreenContainer fixed>
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            icon="person-circle-outline"
            title="Coach Not Found"
            message="We couldn't find a coach profile at this link. Please check the URL and try again."
          />
        </View>
      </ScreenContainer>
    );
  }

  // ── Book a Lesson handler ─────────────────────────────────────────────────
  function handleBookLesson() {
    if (!user) {
      // Unauthenticated, send to sign-up pre-filled for this coach
      navigation.navigate("Signup", { coachId: coach!.id, role: "player" });
    } else {
      // Signed-in player, go to the booking flow (PlayerStack)
      navigation.navigate("BookLesson");
    }
  }

  const specialties = coach.specialties ?? [];
  const testimonials = coach.testimonials ?? [];

  return (
    <ScreenContainer>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <View className="bg-fairway-700 pt-10 pb-8 px-6 items-center">
        <Avatar
          name={coach.name}
          uri={coach.photoURL}
          size={96}
          className="mb-4 border-4 border-white"
        />
        <Text className="text-white text-2xl font-extrabold text-center">{coach.name}</Text>

        {coach.location ? (
          <View className="flex-row items-center mt-1 gap-1">
            <Ionicons name="location-outline" size={14} color={colors.fairway[200]} />
            <Text className="text-fairway-200 text-sm">{coach.location}</Text>
          </View>
        ) : null}

        {coach.experienceYears != null ? (
          <View className="flex-row items-center mt-1 gap-1">
            <Ionicons name="ribbon-outline" size={14} color={colors.fairway[200]} />
            <Text className="text-fairway-200 text-sm">
              {coach.experienceYears}+ years experience
            </Text>
          </View>
        ) : null}

        {/* Hourly rate pill */}
        {coach.hourlyRate != null ? (
          <View className="mt-3 bg-fairway-600 rounded-full px-4 py-1">
            <Text className="text-white font-bold text-sm">
              {currency(coach.hourlyRate)} / hr
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <View className="px-4 pt-6 pb-10">
        {/* Specialties */}
        {specialties.length > 0 ? (
          <View className="mb-5">
            <Text className="text-ink-900 font-bold text-base mb-2">Specialties</Text>
            <View className="flex-row flex-wrap gap-2">
              {specialties.map((s, i) => (
                <Badge
                  key={`specialty-${i}`}
                  label={s}
                  bg="bg-fairway-100"
                  text="text-fairway-700"
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* Bio */}
        {coach.bio ? (
          <View className="mb-5">
            <Text className="text-ink-900 font-bold text-base mb-2">About</Text>
            <Text className="text-ink-700 text-sm leading-relaxed">{coach.bio}</Text>
          </View>
        ) : null}

        {/* Testimonials */}
        {testimonials.length > 0 ? (
          <View className="mb-6">
            <Text className="text-ink-900 font-bold text-base mb-3">What Students Say</Text>
            {testimonials.map((t, i) => (
              <TestimonialCard key={`testimonial-${i}`} item={t} />
            ))}
          </View>
        ) : null}

        {/* Book a Lesson CTA */}
        <View className="mt-2">
          <Button
            title="Book a Lesson"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleBookLesson}
            icon={<Ionicons name="calendar-outline" size={20} color="white" />}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
