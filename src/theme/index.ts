/**
 * Design tokens for TeeLesson.
 *
 * NativeWind / Tailwind classes (see `tailwind.config.js`) are the primary
 * styling mechanism. This object exposes the same palette to plain JS where a
 * raw color string is needed (status bars, chart libs, navigation theme,
 * tab-bar tint, etc.).
 */
export const colors = {
  // Brand olive-green, anchored on #6C844C (primary) and #5F5933 (deep).
  fairway: {
    50: "#f4f6ee",
    100: "#e7ecd7",
    200: "#cfd9b4",
    300: "#b2c189",
    400: "#8ea862",
    500: "#6C844C",
    600: "#5b7040",
    700: "#5F5933",
    800: "#474328",
    900: "#33311d",
  },
  // Warm cream, anchored on #F9E6BF.
  sand: {
    50: "#fefcf6",
    100: "#fdf3dd",
    200: "#F9E6BF",
  },
  // Slate/sage neutrals: #9CACA7 (muted) → #3C505C (text).
  ink: {
    50: "#f5f7f6",
    100: "#e9edec",
    200: "#d4dbd9",
    400: "#9CACA7",
    500: "#687a76",
    700: "#3C505C",
    900: "#26333b",
  },
  white: "#ffffff",
  // Red retained for genuine error/destructive states (no red in the palette).
  danger: "#c0492f",
  warning: "#5F5933",
  success: "#6C844C",
} as const;

export const theme = {
  colors,
  primary: colors.fairway[500],
  primaryDark: colors.fairway[700],
  text: colors.ink[900],
  textMuted: colors.ink[500],
  border: colors.ink[200],
  background: colors.ink[50],
  card: colors.white,
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  spacing: (n: number) => n * 4,
} as const;

/** Human-readable labels for lesson types. */
export const LESSON_TYPE_LABELS: Record<string, string> = {
  range: "Range",
  simulator: "Simulator",
  online: "Online",
  indoor: "Indoor",
};

/** Color accents for lesson statuses (tailwind text/bg class fragments). */
export const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  requested: { bg: "bg-sand-200", text: "text-fairway-800", label: "Requested" },
  confirmed: { bg: "bg-fairway-100", text: "text-fairway-700", label: "Confirmed" },
  completed: { bg: "bg-ink-100", text: "text-ink-500", label: "Completed" },
  cancelled: { bg: "bg-ink-200", text: "text-ink-700", label: "Cancelled" },
};
