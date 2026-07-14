/**
 * Shared domain types for TeeLesson.
 * These mirror the Firestore collections described in the MVP spec.
 */

export type UserRole = "coach" | "player";

export type LessonType =
  | "range"
  | "simulator"
  | "online"
  | "indoor"
  | "group" // two or more players / a class
  | "review"; // coach blocks time to review online swing submissions

export type LessonStatus =
  | "requested" // player asked, awaiting coach approval
  | "confirmed" // coach approved
  | "completed"
  | "noShow" // player didn't turn up
  | "cancelled";

/** A testimonial shown on a coach's public profile. */
export interface Testimonial {
  author: string;
  role?: string;
  quote: string;
}

/** A single goal in a player's goal checklist. */
export interface GoalItem {
  id: string;
  text: string;
  done: boolean;
}

/**
 * users/{uid}
 * One document per account. `coachId` is only set for players (single coach
 * per player in the MVP). Coach-only fields (bio, specialties, …) are optional.
 */
export interface AppUser {
  id: string; // === auth uid, === Firestore doc id
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;

  // Player-only
  coachId?: string;
  handicap?: number;
  goals?: string; // legacy free-text goals (superseded by goalItems)
  goalItems?: GoalItem[]; // structured goal checklist
  notes?: string; // private coach notes about the player
  phone?: string;

  // Coach-only (public profile)
  bio?: string;
  specialties?: string[];
  experienceYears?: number;
  location?: string;
  hourlyRate?: number;
  testimonials?: Testimonial[];
  /** URL-friendly handle for the public profile, e.g. /coach/john-miller */
  publicSlug?: string;
  subscriptionPlan?: "Starter" | "Pro" | "Academy";

  createdAt?: number; // epoch ms
  updatedAt?: number;
}

/** Convenience aliases used around the codebase. */
export type Coach = AppUser & { role: "coach" };
export type Player = AppUser & { role: "player" };

/**
 * lessons/{id}
 */
export interface Lesson {
  id: string;
  coachId: string;
  /**
   * Single participant, set for individual lessons (and to the first member of
   * a group for convenience). Omitted for player-less blocks like online review.
   */
  playerId?: string;
  /** All participants for a group lesson / class. */
  playerIds?: string[];
  /** Label for sessions without a single named player (review block, class). */
  title?: string;
  /** Shared id linking the occurrences of a recurring series. */
  seriesId?: string;
  date: string; // ISO date "YYYY-MM-DD"
  startTime: string; // "HH:mm" (24h)
  duration: number; // minutes
  type: LessonType;
  status: LessonStatus;
  notes?: string;
  /** Coach's own payment tracking, a simple "mark as paid" flag (no processing). */
  paid?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** The numeric performance metrics a coach can track over time. */
export type ProgressMetricKey =
  | "handicap"
  | "scoringAverage"
  | "gir"
  | "fairways"
  | "putts"
  | "drivingDistance"
  | "upDown"
  | "sandSaves"
  | "threePutts";

/**
 * progress/{id}
 * A dated snapshot of a player's stats, logged by the coach. Each metric is
 * optional so a coach can record only what they measured that session.
 */
export interface ProgressEntry {
  id: string;
  coachId: string;
  playerId: string;
  date: string; // ISO date "YYYY-MM-DD"
  handicap?: number;
  scoringAverage?: number; // strokes per round
  gir?: number; // greens in regulation, %
  fairways?: number; // fairways hit, %
  putts?: number; // putts per round
  drivingDistance?: number; // yards
  upDown?: number; // up-and-down / scrambling, %
  sandSaves?: number; // sand saves, %
  threePutts?: number; // 3-putts per round
  notes?: string;
  createdAt?: number;
}

/**
 * availability/{id}
 * A bookable slot or recurring availability window for a coach.
 */
export interface AvailabilitySlot {
  id: string;
  coachId: string;
  /** Specific date for one-off slots ("YYYY-MM-DD"). */
  date?: string;
  /** 0 (Sun) – 6 (Sat) for recurring weekly availability. */
  weekday?: number;
  recurring: boolean;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  /** Default lesson type offered in this window. */
  type?: LessonType;
  createdAt?: number;
}
