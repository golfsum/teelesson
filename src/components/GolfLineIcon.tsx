import React from "react";
import Svg, { Circle, G, Line, Path, Polyline, Rect } from "react-native-svg";

export type GolfIconName =
  | "students"
  | "calendar-club"
  | "calendar-availability"
  | "booking"
  | "revenue"
  | "dashboard"
  | "schedule"
  | "lesson-plan"
  | "video-review"
  | "analytics"
  | "settings"
  | "messages"
  | "notifications"
  | "progress-tracking"
  | "payments"
  | "coach-notes"
  | "follow-up";

type GolfLineIconProps = {
  name: GolfIconName;
  size?: number;
  color?: string;
  accent?: string;
  muted?: string;
  strokeWidth?: number;
  simple?: boolean;
};

const white = "#f7fbf8";
const green = "#46d875";
const dim = "#779088";

export default function GolfLineIcon({
  name,
  size = 28,
  color = white,
  accent = green,
  muted = dim,
  strokeWidth = 4.6,
}: GolfLineIconProps) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const accentStroke = { ...common, stroke: accent };
  const mutedStroke = { ...common, stroke: muted, strokeWidth: strokeWidth * 0.75 };

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      {name === "dashboard" ? (
        <G>
          <Rect {...common} x="15" y="18" width="66" height="58" rx="8" />
          <Path fill={accent} opacity="0.88" stroke={accent} strokeWidth={strokeWidth * 0.5} d="M30 44a11 11 0 1 0-11-11h11z" />
          <Path {...mutedStroke} d="M42 28h25M42 40h20" />
          <Rect fill={accent} opacity="0.9" stroke={accent} strokeWidth={strokeWidth * 0.45} x="22" y="55" width="15" height="11" rx="2" />
          <Rect fill={accent} opacity="0.78" stroke={accent} strokeWidth={strokeWidth * 0.45} x="42" y="55" width="15" height="11" rx="2" />
          <Rect fill={accent} opacity="0.68" stroke={accent} strokeWidth={strokeWidth * 0.45} x="62" y="55" width="15" height="11" rx="2" />
        </G>
      ) : null}

      {name === "students" ? (
        <G>
          <Circle {...common} cx="40" cy="27" r="12" />
          <Circle {...common} cx="65" cy="32" r="9" />
          <Path fill={accent} opacity="0.42" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" d="M18 75V62c0-14 10-24 22-24s22 10 22 24v13z" />
          <Path {...common} d="M58 46c10 0 18 8 18 19v10" />
        </G>
      ) : null}

      {(name === "schedule" || name === "calendar-club") ? (
        <G>
          <Rect {...common} x="18" y="20" width="55" height="58" rx="8" />
          <Line {...accentStroke} x1="18" y1="36" x2="73" y2="36" />
          <Line {...common} x1="32" y1="12" x2="32" y2="25" />
          <Line {...common} x1="58" y1="12" x2="58" y2="25" />
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const x = 29 + (index % 3) * 16;
            const y = 47 + Math.floor(index / 3) * 15;
            return <Rect key={index} fill={accent} opacity={index === 5 ? 0.52 : 0.82} stroke={accent} strokeWidth={strokeWidth * 0.4} x={x} y={y} width="8" height="8" rx="1.5" />;
          })}
          <Circle fill="#1d7c44" stroke={color} strokeWidth={strokeWidth * 0.8} cx="73" cy="70" r="14" />
          <Path {...common} d="M66 70l5 5 10-12" />
        </G>
      ) : null}

      {name === "calendar-availability" ? (
        <G>
          <Rect {...common} x="18" y="20" width="55" height="58" rx="8" />
          <Line {...accentStroke} x1="18" y1="36" x2="73" y2="36" />
          <Line {...common} x1="32" y1="12" x2="32" y2="25" />
          <Line {...common} x1="58" y1="12" x2="58" y2="25" />
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const x = 29 + (index % 3) * 16;
            const y = 47 + Math.floor(index / 3) * 15;
            return <Rect key={index} fill={accent} opacity={0.75} stroke={accent} strokeWidth={strokeWidth * 0.4} x={x} y={y} width="8" height="8" rx="1.5" />;
          })}
          <Circle {...accentStroke} cx="73" cy="70" r="14" />
          <Line {...accentStroke} x1="73" y1="61" x2="73" y2="71" />
          <Line {...accentStroke} x1="73" y1="71" x2="80" y2="71" />
        </G>
      ) : null}

      {name === "lesson-plan" ? (
        <G>
          <Rect {...common} x="26" y="16" width="44" height="62" rx="6" />
          <Path {...accentStroke} d="M39 16h18v8H39z" />
          <Circle fill={accent} cx="37" cy="38" r="2.2" />
          <Circle fill={accent} cx="37" cy="52" r="2.2" />
          <Circle fill={accent} cx="37" cy="66" r="2.2" />
          <Line {...accentStroke} x1="46" y1="38" x2="61" y2="38" />
          <Line {...mutedStroke} x1="46" y1="52" x2="61" y2="52" />
          <Line {...mutedStroke} x1="46" y1="66" x2="57" y2="66" />
          <Path fill={accent} stroke={color} strokeWidth={strokeWidth * 0.7} strokeLinejoin="round" d="M70 51l14 7-14 7z" />
          <Path {...accentStroke} d="M67 78c7 3 15 3 22 0" />
        </G>
      ) : null}

      {name === "video-review" ? (
        <G>
          <Rect {...common} x="16" y="24" width="64" height="43" rx="7" />
          <Path fill={accent} opacity="0.9" stroke={color} strokeWidth={strokeWidth * 0.7} strokeLinejoin="round" d="M43 35l18 11-18 11z" />
          <Line {...accentStroke} x1="25" y1="58" x2="45" y2="58" />
          <Circle fill={color} cx="47" cy="58" r="3" />
          <Line {...mutedStroke} x1="53" y1="58" x2="70" y2="58" />
        </G>
      ) : null}

      {name === "analytics" ? (
        <G>
          <Rect fill={accent} opacity="0.9" stroke={accent} strokeWidth={strokeWidth * 0.45} x="20" y="61" width="10" height="18" rx="2" />
          <Rect fill={accent} opacity="0.72" stroke={accent} strokeWidth={strokeWidth * 0.45} x="40" y="50" width="10" height="29" rx="2" />
          <Rect fill={accent} opacity="0.6" stroke={accent} strokeWidth={strokeWidth * 0.45} x="60" y="39" width="10" height="40" rx="2" />
          <Polyline {...common} points="21,48 38,34 54,42 74,22" />
          <Circle fill={color} cx="21" cy="48" r="3" />
          <Circle fill={color} cx="38" cy="34" r="3" />
          <Circle fill={color} cx="54" cy="42" r="3" />
          <Circle fill={color} cx="74" cy="22" r="3" />
        </G>
      ) : null}

      {name === "settings" ? (
        <G>
          <Path {...common} d="M39 16h18l2 10 9-4 11 11-5 9 10 4v16l-10 4 5 9-11 11-9-4-2 10H39l-2-10-9 4-11-11 5-9-10-4V46l10-4-5-9 11-11 9 4z" />
          <Circle {...accentStroke} cx="48" cy="54" r="17" />
          <Circle {...common} cx="48" cy="54" r="10" />
        </G>
      ) : null}

      {name === "messages" ? (
        <G>
          <Path {...common} d="M18 27h48c8 0 13 5 13 12v13c0 8-5 13-13 13H42L29 76v-11H18z" />
          <Path {...mutedStroke} d="M64 42h13c7 0 11 4 11 11v11c0 7-4 11-11 11h-8l-9 8v-8H49" />
          <Circle fill={accent} cx="36" cy="46" r="3.2" />
          <Circle fill={accent} opacity="0.86" cx="48" cy="46" r="3.2" />
          <Circle fill={accent} opacity="0.72" cx="60" cy="46" r="3.2" />
        </G>
      ) : null}

      {name === "notifications" ? (
        <G>
          <Path {...common} d="M28 66h40l-6-9V43c0-13-7-22-18-22s-18 9-18 22v14z" />
          <Path {...common} d="M42 75c1 5 11 5 12 0" />
          <Circle fill={accent} stroke={color} strokeWidth={strokeWidth * 0.65} cx="66" cy="30" r="11" />
          <Path {...common} d="M62 30h8" />
          <Path {...common} d="M66 26v8" />
        </G>
      ) : null}

      {name === "progress-tracking" ? (
        <G>
          <Circle {...common} cx="45" cy="48" r="31" />
          <Path {...accentStroke} d="M45 17a31 31 0 0 1 29 42" />
          <Circle {...common} cx="45" cy="44" r="10" />
          <Path {...common} d="M26 73c3-12 11-19 19-19s16 7 19 19" />
        </G>
      ) : null}

      {name === "payments" ? (
        <G>
          <Rect {...common} x="17" y="24" width="60" height="43" rx="6" />
          <Line {...common} x1="17" y1="38" x2="77" y2="38" />
          <Rect fill={accent} opacity="0.78" stroke={accent} strokeWidth={strokeWidth * 0.45} x="27" y="48" width="13" height="10" rx="2" />
          <Line {...mutedStroke} x1="47" y1="51" x2="65" y2="51" />
          <Line {...mutedStroke} x1="27" y1="62" x2="49" y2="62" />
          <Circle fill="#1d7c44" stroke={color} strokeWidth={strokeWidth * 0.8} cx="73" cy="68" r="14" />
          <Path {...common} d="M66 68l5 5 10-12" />
        </G>
      ) : null}

      {name === "coach-notes" ? (
        <G>
          <Path {...common} d="M27 16h39l9 9v55H27z" />
          <Path {...common} d="M66 16v12h12" />
          <Path {...mutedStroke} d="M38 35h24M38 48h18M38 61h16" />
          <Path fill={accent} stroke={color} strokeWidth={strokeWidth * 0.65} strokeLinejoin="round" d="M64 64l14-14 7 7-14 14-10 3z" />
        </G>
      ) : null}

      {name === "follow-up" ? (
        <G>
          <Path {...common} d="M48 16v57" />
          <Path {...accentStroke} d="M48 72c-10 3-20 3-31 0" />
          <Path {...common} d="M17 76c17 8 45 8 62 0" />
          <Path fill={accent} stroke={color} strokeWidth={strokeWidth * 0.75} strokeLinejoin="round" d="M50 19l24 12-24 12z" />
          <Circle fill="#1d7c44" stroke={color} strokeWidth={strokeWidth * 0.8} cx="73" cy="69" r="14" />
          <Path {...common} d="M66 69l5 5 10-12" />
        </G>
      ) : null}

      {name === "booking" ? (
        <G>
          <Circle {...common} cx="39" cy="30" r="11" />
          <Path fill={accent} opacity="0.4" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" d="M20 76V64c0-13 9-22 19-22s19 9 19 22v12z" />
          <Circle {...accentStroke} cx="67" cy="66" r="15" />
          <Line {...accentStroke} x1="67" y1="57" x2="67" y2="67" />
          <Line {...accentStroke} x1="67" y1="67" x2="75" y2="67" />
        </G>
      ) : null}

      {name === "revenue" ? (
        <G>
          <Path {...accentStroke} d="M23 71l16-18 12 10 22-28" />
          <Path {...common} d="M69 35h12v12" />
          <Circle {...common} cx="38" cy="40" r="24" />
          <TextDollar color={color} accent={accent} strokeWidth={strokeWidth} />
        </G>
      ) : null}
    </Svg>
  );
}

function TextDollar({
  color,
  accent,
  strokeWidth,
}: {
  color: string;
  accent: string;
  strokeWidth: number;
}) {
  return (
    <G>
      <Line x1="38" y1="27" x2="38" y2="54" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <Path d="M47 32c-3-5-18-5-18 3 0 9 18 4 18 13 0 8-15 8-19 2" fill="none" stroke={accent} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}
