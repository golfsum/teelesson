/**
 * CoachProfileScreen — coach edits their own public profile and navigates to
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

import { Avatar, Button, Input, ScreenContainer } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { uploadImage } from "@/firebase/storageService";
import { updateUser } from "@/firebase/dbService";
import type { CoachStackParamList } from "@/navigation/types";
import { slugify } from "@/utils/format";

type Nav = NativeStackNavigationProp<CoachStackParamList>;

export default function CoachProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refresh } = useAuth();

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

      {/* ── Account settings footer ── */}
      <View className="mt-8 border-t border-ink-100 pt-5">
        <Pressable onPress={() => navigation.navigate("Account")}>
          <Text className="text-ink-500 font-semibold text-center text-sm">
            Account settings
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
