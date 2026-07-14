/**
 * Performance metrics a coach tracks per player. Drives the progress UI and
 * the "is this an improvement?" logic (some metrics are better when lower).
 */
import { Ionicons } from "@expo/vector-icons";
import type { ProgressMetricKey } from "@/types";

export interface MetricDef {
  key: ProgressMetricKey;
  label: string; // full name
  short: string; // compact label
  unit: string; // suffix, e.g. "%", " yds"
  lowerIsBetter: boolean;
  decimals: number;
  icon: keyof typeof Ionicons.glyphMap;
  /** Sensible numeric bounds for input validation. */
  min: number;
  max: number;
}

export const METRICS: MetricDef[] = [
  { key: "handicap", label: "Handicap Index", short: "Handicap", unit: "", lowerIsBetter: true, decimals: 1, icon: "trophy-outline", min: -10, max: 54 },
  { key: "scoringAverage", label: "Scoring Average", short: "Scoring Avg", unit: "", lowerIsBetter: true, decimals: 1, icon: "golf-outline", min: 50, max: 130 },
  { key: "gir", label: "Greens in Regulation", short: "GIR", unit: "%", lowerIsBetter: false, decimals: 0, icon: "flag-outline", min: 0, max: 100 },
  { key: "fairways", label: "Fairways Hit", short: "Fairways", unit: "%", lowerIsBetter: false, decimals: 0, icon: "navigate-outline", min: 0, max: 100 },
  { key: "putts", label: "Putts per Round", short: "Putts/Rd", unit: "", lowerIsBetter: true, decimals: 1, icon: "ellipse-outline", min: 15, max: 50 },
  { key: "drivingDistance", label: "Driving Distance", short: "Driving", unit: " yds", lowerIsBetter: false, decimals: 0, icon: "speedometer-outline", min: 100, max: 400 },
  { key: "upDown", label: "Up & Down %", short: "Up & Down", unit: "%", lowerIsBetter: false, decimals: 0, icon: "trending-up-outline", min: 0, max: 100 },
  { key: "sandSaves", label: "Sand Saves %", short: "Sand Saves", unit: "%", lowerIsBetter: false, decimals: 0, icon: "sunny-outline", min: 0, max: 100 },
  { key: "threePutts", label: "3-Putts per Round", short: "3-Putts", unit: "", lowerIsBetter: true, decimals: 1, icon: "warning-outline", min: 0, max: 18 },
];

/** Format a metric value with its decimals + unit, e.g. 18 → "18.0", 42 → "42%". */
export function formatMetric(def: MetricDef, value: number): string {
  return `${value.toFixed(def.decimals)}${def.unit}`;
}

/** True when a change in the given direction counts as improvement. */
export function isImprovement(def: MetricDef, delta: number): boolean {
  return def.lowerIsBetter ? delta < 0 : delta > 0;
}
