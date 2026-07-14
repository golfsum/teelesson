/**
 * LogProgressScreen, coach records a dated set of performance metrics for a
 * player. Every metric is optional; only filled-in fields are saved.
 */
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenContainer, Input, Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { METRICS } from "@/constants/metrics";
import { todayISO } from "@/utils/format";
import type { ProgressEntry, ProgressMetricKey } from "@/types";
import type { CoachStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CoachStackParamList>;
type Route = RouteProp<CoachStackParamList, "LogProgress">;

export default function LogProgressScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { playerId } = route.params;

  const { user } = useAuth();
  const coachId = user?.id ?? "";
  const { addEntry } = useProgress(playerId);

  const [date, setDate] = useState(todayISO());
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const setValue = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  function validate(): { ok: boolean; metrics: Partial<Record<ProgressMetricKey, number>> } {
    const errs: Record<string, string> = {};
    const metrics: Partial<Record<ProgressMetricKey, number>> = {};

    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) errs.date = "Enter a valid date (YYYY-MM-DD).";

    for (const def of METRICS) {
      const raw = (values[def.key] ?? "").trim();
      if (raw === "") continue;
      const num = parseFloat(raw);
      if (isNaN(num)) {
        errs[def.key] = "Enter a number.";
      } else if (num < def.min || num > def.max) {
        errs[def.key] = `Must be between ${def.min} and ${def.max}.`;
      } else {
        metrics[def.key] = num;
      }
    }

    if (Object.keys(metrics).length === 0 && !errs.date) {
      errs.form = "Enter at least one metric.";
    }

    setErrors(errs);
    return { ok: Object.keys(errs).length === 0, metrics };
  }

  async function handleSave() {
    const { ok, metrics } = validate();
    if (!ok) return;
    setSaving(true);
    try {
      const entry: Omit<ProgressEntry, "id" | "createdAt"> = {
        coachId,
        playerId,
        date,
        ...metrics,
      };
      await addEntry(entry);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save the measurement. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer padded>
      <Text className="text-2xl font-extrabold text-ink-900 mb-1">Log Measurement</Text>
      <Text className="text-ink-500 mb-6">
        Record today&apos;s stats. Leave any field blank if you didn&apos;t measure it.
      </Text>

      <Input
        label="Date"
        value={date}
        onChangeText={(v) => {
          setDate(v);
          setErrors((e) => ({ ...e, date: "" }));
        }}
        placeholder="YYYY-MM-DD"
        error={errors.date}
        containerClassName="mb-4"
      />

      {METRICS.map((def) => (
        <Input
          key={def.key}
          label={`${def.label}${def.unit ? ` (${def.unit.trim()})` : ""}`}
          value={values[def.key] ?? ""}
          onChangeText={(v) => setValue(def.key, v)}
          keyboardType="decimal-pad"
          placeholder={`e.g. ${def.min + Math.round((def.max - def.min) / 3)}`}
          error={errors[def.key]}
          containerClassName="mb-4"
        />
      ))}

      {errors.form ? (
        <Text className="text-red-600 text-sm mb-3">{errors.form}</Text>
      ) : null}

      <Button
        title="Save Measurement"
        onPress={handleSave}
        variant="primary"
        size="lg"
        fullWidth
        loading={saving}
        disabled={saving}
      />
      <View className="h-8" />
    </ScreenContainer>
  );
}
