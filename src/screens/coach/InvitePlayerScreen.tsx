/**
 * InvitePlayerScreen, lets a coach share a sign-up link and (stub) send an
 * email invitation to a prospective player.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, Input, Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the shareable sign-up URL for the coach's invite link. */
function buildInviteLink(coachId: string): string {
  const path = `/signup?coachId=${coachId}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  // On native we don't have a web origin, show the path so coaches can share it manually.
  return path;
}

/**
 * Attempt to copy text to the clipboard using the web Clipboard API.
 * Works on the web dashboard (where coaches share links); on native it returns
 * false so the caller can fall back to a manual "select the text" prompt.
 * (Add `expo-clipboard` and call `Clipboard.setStringAsync` to enable native copy.)
 */
async function tryClipboardCopy(text: string): Promise<boolean> {
  try {
    const nav =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & { clipboard?: { writeText(t: string): Promise<void> } })
        : undefined;
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InvitePlayerScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const coachId = user?.id ?? "";
  const inviteLink = coachId ? buildInviteLink(coachId) : "";

  // On native the link is just a path, show the full web URL as selectable text
  const isWebLink = inviteLink.startsWith("http");

  // -----------------------------------------------------------------------
  // Copy link
  // -----------------------------------------------------------------------
  async function handleCopyLink() {
    if (!inviteLink) return;
    const ok = await tryClipboardCopy(inviteLink);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      Alert.alert(
        "Copy manually",
        "Clipboard unavailable. Select the link text above to copy it.",
      );
    }
  }

  // -----------------------------------------------------------------------
  // Send invite (MVP stub, no backend email yet)
  // -----------------------------------------------------------------------
  function validateEmail(value: string): boolean {
    if (!value.trim()) {
      setEmailError("Please enter an email address.");
      return false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(value.trim())) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleSendInvite() {
    if (!validateEmail(email)) return;
    setSending(true);
    // Simulate a brief async operation for MVP UX realism.
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setSending(false);
    Alert.alert(
      "Invite queued",
      // Keep it transparent that this is a stub.
      `Email sending is not yet connected to a backend.\n\nIn a future release, ${email.trim()} will receive a sign-up link automatically. For now, please share the invite link manually.`,
      [{ text: "Got it", onPress: () => setEmail("") }],
    );
  }

  return (
    <ScreenContainer padded>
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-ink-900 mb-1">
          Invite a Player
        </Text>
        <Text className="text-base text-ink-500">
          Share your personalised sign-up link or send a direct invitation.
        </Text>
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* Section 1, Shareable link                                       */}
      {/* ---------------------------------------------------------------- */}
      <Card className="mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="link-outline" size={20} color={colors.fairway[600]} />
          <Text className="ml-2 text-base font-bold text-ink-900">
            Your invite link
          </Text>
        </View>

        <Text className="text-sm text-ink-500 mb-3">
          Any player who signs up via this link will be automatically linked to
          your coaching account, no extra steps needed.
        </Text>

        {/* Link display, selectable on all platforms */}
        <View className="bg-sand-50 rounded-xl px-4 py-3 mb-4">
          <Text
            selectable
            className="text-sm font-medium text-fairway-700 break-all"
          >
            {inviteLink || "Loading…"}
          </Text>
        </View>

        {/* On native, note that a full URL requires the web app base URL */}
        {!isWebLink && (
          <Text className="text-xs text-ink-400 mb-3">
            Prepend your web app URL (e.g.{" "}
            <Text className="font-semibold">https://teelesson.app</Text>)
            to the path above before sharing.
          </Text>
        )}

        <Button
          title={copied ? "Copied!" : "Copy link"}
          variant={copied ? "secondary" : "primary"}
          onPress={handleCopyLink}
          icon={
            <Ionicons
              name={copied ? "checkmark-outline" : "copy-outline"}
              size={16}
              color={copied ? colors.fairway[600] : "#fff"}
            />
          }
          disabled={!inviteLink}
        />
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Section 2, Email invite (stub)                                  */}
      {/* ---------------------------------------------------------------- */}
      <Card className="mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="mail-outline" size={20} color={colors.fairway[600]} />
          <Text className="ml-2 text-base font-bold text-ink-900">
            Send by email
          </Text>
          {/* Stub badge */}
          <View className="ml-2 bg-sand-100 rounded-full px-2 py-0.5">
            <Text className="text-xs text-ink-400 font-medium">
              Coming soon
            </Text>
          </View>
        </View>

        <Text className="text-sm text-ink-500 mb-4">
          Enter a player's email address and we'll send them a personalised
          invitation. Email delivery requires a backend integration that will be
          available in a future release.
        </Text>

        <Input
          label="Player email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailError) setEmailError(undefined);
          }}
          placeholder="player@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          containerClassName="mb-4"
        />

        <Button
          title="Send invite"
          variant="outline"
          onPress={handleSendInvite}
          loading={sending}
          disabled={!email.trim()}
          icon={
            <Ionicons
              name="send-outline"
              size={16}
              color={colors.fairway[600]}
            />
          }
        />
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Footer hint                                                       */}
      {/* ---------------------------------------------------------------- */}
      <View className="flex-row items-start px-1 mb-4">
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.ink[400]}
          style={{ marginTop: 1 }}
        />
        <Text className="ml-2 text-xs text-ink-400 flex-1">
          Players must sign up with the{" "}
          <Text className="font-semibold">Player</Text> role. Once registered,
          they appear in your Players list automatically.
        </Text>
      </View>
    </ScreenContainer>
  );
}
