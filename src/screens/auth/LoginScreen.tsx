import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { Button, Input, ScreenContainer } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/firebase/config";
import { colors } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { signIn, signInGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Navigation is handled by the root navigator once auth state updates.
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInGoogle();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message.includes("unsupported") || err.message.includes("native")
            ? "Google sign-in is not available on this device. Please use email and password."
            : err.message
          : "Google sign-in failed. Please try again.";
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <ScreenContainer maxWidth={440} padded>
      {/* Brand mark */}
      <View className="items-center mt-10 mb-8">
        <View className="w-16 h-16 rounded-2xl bg-fairway-600 items-center justify-center mb-4">
          <Ionicons name="golf" size={32} color={colors.white} />
        </View>
        <Text className="text-3xl font-extrabold text-ink-900 tracking-tight">
          Welcome back
        </Text>
        <Text className="text-base text-ink-500 mt-1">
          Sign in to your TeeLesson account
        </Text>
      </View>

      {/* Firebase not configured notice */}
      {!isFirebaseConfigured && (
        <View className="flex-row items-start gap-2 bg-sand-100 border border-sand-200 rounded-2xl px-4 py-3 mb-4">
          <Ionicons name="warning-outline" size={16} color="#5F5933" style={{ marginTop: 2 }} />
          <Text className="text-sm text-fairway-800 flex-1">
            Add your Firebase config in <Text className="font-semibold">.env</Text> to enable
            sign-in.
          </Text>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      )}

      {/* Form */}
      <View className="gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          returnKeyType="next"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
        />

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          disabled={googleLoading}
          fullWidth
          size="lg"
          className="mt-2"
        />

        <Button
          title="Continue with Google"
          variant="outline"
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
          fullWidth
          size="lg"
          icon={<Ionicons name="logo-google" size={18} color={colors.ink[700]} />}
        />
      </View>

      {/* Sign up link */}
      <View className="flex-row justify-center items-center mt-8 mb-4">
        <Text className="text-sm text-ink-500">Don't have an account?</Text>
        <Pressable
          onPress={() => navigation.navigate("Signup")}
          className="ml-1"
          accessibilityRole="link"
        >
          <Text className="text-sm font-semibold text-fairway-600">Sign up</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
