/**
 * Shared domain types for TeeLesson.
 * These mirror the Firestore collections described in the MVP spec.
 */

export type UserRole = "coach" | "player";

export type LessonType = "range" | "simulator" | "online" | "indoor";

export type LessonStatus =
  | "requested" // player asked, awaiting coach approval
  | "confirmed" // coach approved
  | "completed"
  | "cancelled";

/** A testimonial shown on a coach's public profile. */
export interface Testimonial {
  author: string;
  role?: string;
  quote: string;
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
  goals?: string;
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
  playerId: string;
  date: string; // ISO date "YYYY-MM-DD"
  startTime: string; // "HH:mm" (24h)
  duration: number; // minutes
  type: LessonType;
  status: LessonStatus;
  notes?: string;
  /** Coach's own payment tracking — a simple "mark as paid" flag (no processing). */
  paid?: boolean;
  createdAt?: number;
  updatedAt?: number;
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
