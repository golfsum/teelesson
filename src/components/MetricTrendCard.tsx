import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Sparkline } from "@/components/charts/Charts";
import { colors } from "@/theme";
import { formatMetric, isImprovement, type MetricDef } from "@/constants/metrics";

interface MetricTrendCardProps {
  def: MetricDef;
  /** Numeric values for this metric, oldest → newest. */
  values: number[];
}

const IMPROVED = colors.fairway[600];
const WORSE = colors.danger;
const FLAT = colors.ink[400];

/**
 * One metric's trend: icon + label, latest value, a start → latest delta chip
 * (green when improving, accounting for metrics where lower is better), and a
 * sparkline.
 */
export default function MetricTrendCard({ def, values }: MetricTrendCardProps) {
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const hasTrend = values.length > 1 && delta !== 0;
  const improved = isImprovement(def, delta);

  const trendColor = !hasTrend ? FLAT : improved ? IMPROVED : WORSE;
  const arrow = !hasTrend ? "remove" : delta < 0 ? "arrow-down" : "arrow-up";
  const deltaLabel = `${formatMetric(def, Math.abs(delta))}`;

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3">
      {/* Icon */}
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-fairway-100">
        <Ionicons name={def.icon} size={18} color={colors.fairway[600]} />
      </View>

      {/* Label + values */}
      <View className="flex-1">
        <Text className="text-xs font-medium text-ink-500" numberOfLines={1}>
          {def.label}
        </Text>
        <View className="flex-row items-end gap-2">
          <Text className="text-xl font-extrabold text-ink-900">
            {formatMetric(def, last)}
          </Text>
          {values.length > 1 && (
            <View className="mb-0.5 flex-row items-center gap-0.5">
              <Ionicons name={arrow} size={12} color={trendColor} />
              <Text className="text-xs font-semibold" style={{ color: trendColor }}>
                {deltaLabel}
              </Text>
            </View>
          )}
        </View>
        {values.length > 1 && (
          <Text className="text-[11px] text-ink-400">
            from {formatMetric(def, first)}
          </Text>
        )}
      </View>

      {/* Sparkline */}
      <Sparkline values={values} color={trendColor} width={84} height={34} />
    </View>
  );
}
