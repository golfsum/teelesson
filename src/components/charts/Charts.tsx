/**
 * Lightweight dashboard charts built on react-native-svg (donuts) and plain
 * Views (bars). No external charting dependency, keeps the bundle small and
 * renders identically on web, iOS, and Android.
 */
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

const TRACK = "#e3e9e6";

// ---------------------------------------------------------------------------
// DonutRing, a single-value progress ring with arbitrary centered content.
// ---------------------------------------------------------------------------

interface DonutRingProps {
  /** 0–100. Values outside the range are clamped. */
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  children?: React.ReactNode;
}

export function DonutRing({
  percent,
  color,
  size = 72,
  strokeWidth = 9,
  trackColor = TRACK,
  children,
}: DonutRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - clamped / 100);
  const c = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// SegmentDonut, multi-segment donut (e.g. lessons by status) + centered total.
// ---------------------------------------------------------------------------

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface SegmentDonutProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function SegmentDonut({
  segments,
  size = 160,
  strokeWidth = 22,
  children,
}: SegmentDonutProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const c = size / 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let acc = 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* Track, also the fallback when there's no data yet. */}
        <Circle cx={c} cy={c} r={r} stroke={TRACK} strokeWidth={strokeWidth} fill="none" />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s, i) => {
              const frac = s.value / total;
              const dash = circumference * frac;
              const rotation = -90 + (acc / total) * 360;
              acc += s.value;
              return (
                <Circle
                  key={`${s.label}-${i}`}
                  cx={c}
                  cy={c}
                  r={r}
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  transform={`rotate(${rotation} ${c} ${c})`}
                />
              );
            })}
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sparkline, tiny trend line for a short numeric series.
// ---------------------------------------------------------------------------

interface SparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export function Sparkline({
  values,
  color = "#3C505C",
  width = 110,
  height = 36,
  strokeWidth = 2,
}: SparklineProps) {
  if (values.length < 2) {
    // Single point, render a flat baseline so the slot isn't empty.
    const y = height / 2;
    return (
      <Svg width={width} height={height}>
        <Polyline
          points={`0,${y} ${width},${y}`}
          fill="none"
          stroke={TRACK}
          strokeWidth={strokeWidth}
        />
      </Svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = strokeWidth;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// MiniBars, compact monthly bar chart drawn with Views (no SVG needed).
// ---------------------------------------------------------------------------

export interface BarDatum {
  label: string;
  value: number;
}

interface MiniBarsProps {
  data: BarDatum[];
  color?: string;
  height?: number;
}

export function MiniBars({ data, color = "#3C505C", height = 150 }: MiniBarsProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View>
      <View style={{ height, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
        {data.map((d, i) => {
          const barHeight = Math.max(2, (d.value / max) * height);
          return (
            <View key={`${d.label}-${i}`} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  width: "62%",
                  height: barHeight,
                  backgroundColor: d.value === 0 ? TRACK : color,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", marginTop: 6, gap: 4 }}>
        {data.map((d, i) => (
          <Text
            key={`${d.label}-label-${i}`}
            style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9CACA7" }}
            numberOfLines={1}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
