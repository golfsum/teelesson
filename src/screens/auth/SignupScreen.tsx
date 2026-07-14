import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";
import type { UserRole } from "@/types";
import type { AuthStackParamList } from "@/navigation/types";

type SignupNavProp = NativeStackNavigationProp<AuthStackParamList, "Signup">;
type SignupRouteProp = RouteProp<AuthStackParamList, "Signup">;

export default function SignupScreen() {
  const navigation = useNavigation<SignupNavProp>();
  const route = useRoute<SignupRouteProp>();

  const { coachId: inviteCoachId, role: paramRole } = route.params ?? {};

  // If a coachId was passed the user is a player joining via invite link.
  const forcedPlayer = Boolean(inviteCoachId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(
    forcedPlayer ? "player" : paramRole ?? "coach"
  );
  const [error, setError] = useState<string | null>(null);

  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        coachId: forcedPlayer ? inviteCoachId : undefined,
      });
      // Navigation after sign-up is handled by the root navigator reacting to
      // auth state changes; no explicit navigate needed here.
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-up failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full self-center" style={{ maxWidth: 520 }}>
        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-extrabold text-fairway-700 tracking-tight">
            TeeLesson
          </Text>
          <Text className="mt-2 text-base text-ink-500">
            Create your account
          </Text>
        </View>

        {/* Invite banner, shown only when joining via coach invite */}
        {forcedPlayer && (
          <View className="mb-6 rounded-2xl bg-fairway-100 border border-fairway-300 px-4 py-3">
            <Text className="text-sm font-semibold text-fairway-700 text-center">
              You've been invited by your coach
            </Text>
            <Text className="mt-1 text-xs text-fairway-600 text-center">
              Your account will be linked to your coach automatically.
            </Text>
          </View>
        )}

        {/* Role selector, hidden when role is forced */}
        {!forcedPlayer && (
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-ink-700">
              I am a…
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setRole("coach")}
                className={[
                  "flex-1 rounded-lg border py-3 items-center",
                  role === "coach"
                    ? "bg-fairway-600 border-fairway-600"
                    : "bg-white border-ink-200",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-sm font-semibold",
                    role === "coach" ? "text-white" : "text-ink-600",
                  ].join(" ")}
                >
                  I'm a Coach
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRole("player")}
                className={[
                  "flex-1 rounded-lg border py-3 items-center",
                  role === "player"
                    ? "bg-fairway-600 border-fairway-600"
                    : "bg-white border-ink-200",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-sm font-semibold",
                    role === "player" ? "text-white" : "text-ink-600",
                  ].join(" ")}
                >
                  I'm a Player
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Form fields */}
        <View className="gap-4">
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            autoCapitalize="words"
            autoCorrect={false}
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="jane@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Inline error */}
        {error ? (
          <Text className="mt-4 text-sm text-red-500 text-center">{error}</Text>
        ) : null}

        {/* Submit */}
        <View className="mt-6">
          {loading ? (
            <ActivityIndicator color={colors.fairway[600]} />
          ) : (
            <Button
              title="Create Account"
              onPress={handleSignUp}
              variant="primary"
              size="lg"
              fullWidth
            />
          )}
        </View>

        {/* Back to login */}
        <View className="mt-6 flex-row justify-center items-center">
          <Text className="text-sm text-ink-500">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text className="text-sm font-semibold text-fairway-600">
              Log in
            </Text>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
