/**
 * AccountScreen
 *
 * Account settings for both coaches and players. Shows profile summary,
 * an editable name field, preference rows, and a sign-out action.
 */

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, Badge, Button, Input, ScreenContainer } from "@/components/ui";
import { updateUser } from "@/firebase/dbService";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single settings row with a label, optional right element, and a bottom border. */
function SettingsRow({
  icon,
  label,
  right,
  onPress,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center px-4 py-4 bg-white active:bg-ink-50"
      accessibilityRole={onPress ? "button" : "none"}
    >
      <View className="w-8 items-center mr-3">
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.danger : colors.ink[500]}
        />
      </View>
      <Text
        className={`flex-1 text-base font-medium ${
          destructive ? "text-red-600" : "text-ink-900"
        }`}
      >
        {label}
      </Text>
      {right ?? (
        onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.ink[400]} />
        ) : null
      )}
    </Pressable>
  );
}

/** Thin horizontal rule used between settings rows. */
function Divider() {
  return <View className="h-px bg-ink-100 ml-14" />;
}

/** Section header label above a group of rows. */
function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-bold text-ink-500 uppercase tracking-widest px-4 pt-6 pb-2">
      {title}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function AccountScreen() {
  const { user, signOut, refresh } = useAuth();

  // ── Editable name state ───────────────────────────────────────────────────
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [nameDirty, setNameDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  // Keep local value in sync if user object changes (e.g. after refresh).
  useEffect(() => {
    if (user?.name && !nameDirty) {
      setNameValue(user.name);
    }
  }, [user?.name]);

  // ── Stub preference state ─────────────────────────────────────────────────
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleNameChange(text: string) {
    setNameValue(text);
    setNameDirty(true);
    setSaveError(undefined);
  }

  async function handleSaveName() {
    if (!user || !nameValue.trim()) {
      setSaveError("Name cannot be blank.");
      return;
    }
    setSaving(true);
    setSaveError(undefined);
    try {
      await updateUser(user.id, { name: nameValue.trim() });
      await refresh();
      setNameDirty(false);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ScreenContainer fixed>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.fairway[600]} />
        </View>
      </ScreenContainer>
    );
  }

  const roleLabel = user.role === "coach" ? "Coach" : "Player";

  return (
    <ScreenContainer>
      {/* ── Profile hero ──────────────────────────────────────────────────── */}
      <View className="bg-fairway-700 pt-10 pb-8 px-6 items-center">
        <Avatar
          name={user.name}
          uri={user.photoURL}
          size={88}
          className="mb-3 border-4 border-white"
        />
        <Text className="text-white text-xl font-extrabold text-center mb-1">
          {user.name}
        </Text>
        <Text className="text-fairway-200 text-sm mb-3">{user.email}</Text>
        <Badge
          label={roleLabel}
          bg="bg-fairway-600"
          text="text-white"
        />
      </View>

      {/* ── Edit name ─────────────────────────────────────────────────────── */}
      <SectionHeader title="Profile" />
      <View className="bg-white rounded-2xl mx-4 px-4 pt-4 pb-2">
        <Input
          label="Display Name"
          value={nameValue}
          onChangeText={handleNameChange}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={nameDirty ? handleSaveName : undefined}
          error={saveError}
        />
        {nameDirty && (
          <View className="mt-2 mb-2">
            <Button
              title="Save Name"
              variant="primary"
              size="sm"
              loading={saving}
              onPress={handleSaveName}
            />
          </View>
        )}
      </View>

      {/* ── Preferences ───────────────────────────────────────────────────── */}
      <SectionHeader title="Preferences" />
      <View className="bg-white rounded-2xl mx-4 overflow-hidden">
        <SettingsRow
          icon="notifications-outline"
          label="Notifications"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.ink[200], true: colors.fairway[500] }}
              thumbColor={colors.white}
            />
          }
        />
      </View>

      {/* ── Legal ─────────────────────────────────────────────────────────── */}
      <SectionHeader title="Legal" />
      <View className="bg-white rounded-2xl mx-4 overflow-hidden">
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => {
            // stub, open privacy policy URL
          }}
        />
        <Divider />
        <SettingsRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => {
            // stub, open terms of service URL
          }}
        />
      </View>

      {/* ── Sign out ──────────────────────────────────────────────────────── */}
      <View className="mx-4 mt-8 mb-4">
        <Button
          title="Sign Out"
          variant="danger"
          size="md"
          fullWidth
          onPress={handleSignOut}
          icon={<Ionicons name="log-out-outline" size={18} color="white" />}
        />
      </View>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <View className="items-center pb-10">
        <Text className="text-ink-400 text-xs">TeeLesson v1.0.0</Text>
      </View>
    </ScreenContainer>
  );
}
