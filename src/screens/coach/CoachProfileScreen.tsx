/**
 * CoachProfileScreen, coach edits their own public profile and navigates to
 * account settings. Photo upload, bio, specialties, slug, hourly rate, etc.
 */
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, Button, Input, ScreenContainer } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useAvailability } from "@/hooks/useAvailability";
import { uploadImage } from "@/firebase/storageService";
import { updateUser } from "@/firebase/dbService";
import { colors } from "@/theme";
import type { CoachStackParamList } from "@/navigation/types";
import { slugify, formatTime, formatDate, todayISO } from "@/utils/format";

type Nav = NativeStackNavigationProp<CoachStackParamList>;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CoachProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refresh } = useAuth();

  // ── Availability preview ──────────────────────────────────────────────────
  const { slots, loading: availLoading } = useAvailability(user?.id);
  const today = todayISO();
  const recurringSlots = slots
    .filter((s) => s.recurring && s.weekday != null)
    .sort((a, b) => (a.weekday! - b.weekday!) || a.startTime.localeCompare(b.startTime));
  const oneOffSlots = slots
    .filter((s) => !s.recurring && s.date && s.date >= today)
    .sort((a, b) => (a.date! + a.startTime).localeCompare(b.date! + b.startTime))
    .slice(0, 5);

  // ── local form state ──────────────────────────────────────────────────────
  const [photoURI, setPhotoURI] = useState<string | undefined>(
    user?.photoURL ?? undefined
  );
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [experienceYears, setExperienceYears] = useState(
    user?.experienceYears != null ? String(user.experienceYears) : ""
  );
  const [hourlyRate, setHourlyRate] = useState(
    user?.hourlyRate != null ? String(user.hourlyRate) : ""
  );
  // specialties stored as a comma-separated string in the input
  const [specialtiesRaw, setSpecialtiesRaw] = useState(
    user?.specialties?.join(", ") ?? ""
  );
  const [publicSlug, setPublicSlug] = useState(
    user?.publicSlug ?? (user?.name ? slugify(user.name) : "")
  );

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Re-seed form if user object arrives after initial render (async auth)
  useEffect(() => {
    if (!user) return;
    setPhotoURI(user.photoURL ?? undefined);
    setName(user.name ?? "");
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    setExperienceYears(
      user.experienceYears != null ? String(user.experienceYears) : ""
    );
    setHourlyRate(user.hourlyRate != null ? String(user.hourlyRate) : "");
    setSpecialtiesRaw(user.specialties?.join(", ") ?? "");
    setPublicSlug(
      user.publicSlug ?? (user.name ? slugify(user.name) : "")
    );
  }, [user?.id]); // only re-seed when the logged-in user changes

  // ── auto-generate slug when name changes (only if slug wasn't manually set)
  const handleNameChange = (text: string) => {
    setName(text);
    // Keep slug in sync unless the user has already customised it
    if (!user?.publicSlug || publicSlug === slugify(user.name ?? "")) {
      setPublicSlug(slugify(text));
    }
  };

  // ── photo picker ──────────────────────────────────────────────────────────
  const handleChangePhoto = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access to change your profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    setUploadingPhoto(true);
    try {
      const { downloadURL } = await uploadImage(user.id, uri, "profiles");
      setPhotoURI(downloadURL);
    } catch (err) {
      Alert.alert("Upload failed", "Unable to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your display name.");
      return;
    }

    const specialties = specialtiesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const patch: Partial<typeof user> = {
      name: trimmedName,
      bio: bio.trim() || undefined,
      location: location.trim() || undefined,
      experienceYears: experienceYears ? Number(experienceYears) : undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      specialties: specialties.length ? specialties : undefined,
      publicSlug: publicSlug.trim() || slugify(trimmedName),
      photoURL: photoURI,
    };

    setSaving(true);
    try {
      await updateUser(user.id, patch);
      await refresh();
      Alert.alert("Profile saved", "Your public profile has been updated.");
    } catch (err) {
      Alert.alert("Save failed", "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── guard: user not yet loaded ────────────────────────────────────────────
  if (!user) {
    return (
      <ScreenContainer padded>
        <ActivityIndicator className="mt-10" color="#5b7040" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded>
      {/* ── Photo ── */}
      <View className="items-center mb-6 mt-2">
        {uploadingPhoto ? (
          <ActivityIndicator size="large" color="#5b7040" className="mb-2" />
        ) : (
          <Avatar uri={photoURI} name={user.name} size={88} className="mb-3" />
        )}
        <Pressable onPress={handleChangePhoto} disabled={uploadingPhoto}>
          <Text className="text-fairway-600 font-semibold text-sm">
            Change photo
          </Text>
        </Pressable>
      </View>

      {/* ── Basic info ── */}
      <Text className="text-ink-900 font-bold text-xl mb-4">
        Edit Profile
      </Text>

      <Input
        label="Display name"
        value={name}
        onChangeText={handleNameChange}
        placeholder="Your full name"
        containerClassName="mb-3"
      />

      <Input
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell players about your coaching philosophy…"
        multiline
        containerClassName="mb-3"
      />

      <Input
        label="Location"
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Austin, TX"
        containerClassName="mb-3"
      />

      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Input
            label="Experience (years)"
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="e.g. 10"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Input
            label="Hourly rate ($)"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="e.g. 120"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Input
        label="Specialties (comma-separated)"
        value={specialtiesRaw}
        onChangeText={setSpecialtiesRaw}
        placeholder="e.g. Short game, Putting, Swing analysis"
        containerClassName="mb-3"
      />

      {/* ── Public slug ── */}
      <Input
        label="Profile handle"
        value={publicSlug}
        onChangeText={setPublicSlug}
        placeholder="e.g. john-miller"
        containerClassName="mb-1"
      />
      <Text className="text-ink-500 text-xs mb-5">
        Shareable link: /coach/{publicSlug || "your-handle"}
      </Text>

      {/* ── View public profile shortcut ── */}
      <Pressable
        className="mb-5"
        onPress={() =>
          navigation.navigate("PublicCoachProfile", {
            slug: publicSlug || slugify(name),
          })
        }
        disabled={!publicSlug && !name}
      >
        <Text className="text-fairway-600 font-semibold text-sm underline">
          View public profile
        </Text>
      </Pressable>

      {/* ── Availability preview ── */}
      <View className="mb-6">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-base font-bold text-ink-900">Your Availability</Text>
          <Pressable onPress={() => navigation.navigate("Availability")}>
            <Text className="text-sm font-semibold text-fairway-600">Edit</Text>
          </Pressable>
        </View>

        {availLoading ? (
          <ActivityIndicator color="#5b7040" className="my-3" />
        ) : recurringSlots.length === 0 && oneOffSlots.length === 0 ? (
          <Pressable
            onPress={() => navigation.navigate("Availability")}
            className="rounded-2xl border border-ink-200 bg-white p-4"
          >
            <Text className="text-sm text-ink-500">
              No open hours yet. Add availability so players can request bookings.
            </Text>
          </Pressable>
        ) : (
          <View className="gap-2 rounded-2xl border border-ink-200 bg-white p-4">
            {recurringSlots.map((s) => (
              <View key={s.id} className="flex-row items-center gap-2">
                <Ionicons name="repeat-outline" size={15} color={colors.fairway[600]} />
                <Text className="text-sm text-ink-700">
                  <Text className="font-semibold">{WEEKDAYS[s.weekday!]}</Text>
                  {`  ${formatTime(s.startTime)} – ${formatTime(s.endTime)}`}
                </Text>
              </View>
            ))}
            {oneOffSlots.map((s) => (
              <View key={s.id} className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={15} color={colors.ink[500]} />
                <Text className="text-sm text-ink-700">
                  <Text className="font-semibold">{formatDate(s.date!)}</Text>
                  {`  ${formatTime(s.startTime)} – ${formatTime(s.endTime)}`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Save ── */}
      <Button
        title="Save Profile"
        onPress={handleSave}
        loading={saving}
        disabled={saving || uploadingPhoto}
        variant="primary"
        size="lg"
        fullWidth
      />

      {/* ── Account settings row ── */}
      <View className="mb-10 mt-8">
        <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">
          More
        </Text>
        <Pressable
          onPress={() => navigation.navigate("Account")}
          className="flex-row items-center rounded-2xl border border-ink-200 bg-white px-4 py-3.5 active:opacity-90"
        >
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-fairway-100">
            <Ionicons name="settings-outline" size={18} color={colors.fairway[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink-900">Account settings</Text>
            <Text className="text-xs text-ink-400">Notifications, privacy, sign out</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
