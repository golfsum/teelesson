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
    50: "#ecfdf5",
    100: "#d2f9e4",
    200: "#9bf0c4",
    300: "#5ce39f",
    400: "#22d17b",
    500: "#0aae63",
    600: "#057545",
    700: "#086e42",
    800: "#075737",
    900: "#05452e",
  },
  // Warm cream, anchored on #F9E6BF.
  sand: {
    50: "#fffaf0",
    100: "#fff1d6",
    200: "#ffe4ad",
  },
  // Slate/sage neutrals: #9CACA7 (muted) → #3C505C (text).
  ink: {
    50: "#f5f8f7",
    100: "#edf2f0",
    200: "#d9e3df",
    300: "#bdcbc6",
    400: "#5f716b",
    500: "#5b6d67",
    600: "#455852",
    700: "#30443e",
    800: "#1b302a",
    900: "#0b1f1a",
  },
  white: "#ffffff",
  navy: "#031d18",
  navySoft: "#0a3028",
  forestCanvas: "#f6faf8",
  forestLine: "#d7e5df",
  emerald: "#19d47d",
  blue: "#2455d6",
  orange: "#ee7b16",
  purple: "#9c45e8",
  danger: "#d82c35",
  warning: "#d98a00",
  success: "#159447",
} as const;

export const theme = {
  colors,
  primary: colors.fairway[500],
  primaryDark: colors.fairway[700],
  text: colors.ink[900],
  textMuted: colors.ink[500],
  border: colors.ink[200],
  background: colors.forestCanvas,
  card: colors.white,
  radius: { sm: 7, md: 10, lg: 14, xl: 20 },
  spacing: (n: number) => n * 4,
} as const;

/** Human-readable labels for lesson types. */
export const LESSON_TYPE_LABELS: Record<string, string> = {
  range: "Range",
  simulator: "Simulator",
  online: "Online",
  indoor: "Indoor",
  group: "Group Lesson",
  review: "Online Review",
};

/** Color accents for lesson statuses (tailwind text/bg class fragments). */
export const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  requested: { bg: "bg-sand-100", text: "text-amber-800", label: "Requested" },
  confirmed: { bg: "bg-fairway-100", text: "text-fairway-700", label: "Confirmed" },
  completed: { bg: "bg-ink-100", text: "text-ink-500", label: "Completed" },
  noShow: { bg: "bg-red-100", text: "text-red-700", label: "No-show" },
  cancelled: { bg: "bg-ink-200", text: "text-ink-700", label: "Cancelled" },
};
