/**
 * Demo data for previewing the app without a Firebase backend.
 *
 * Served by the dbService watch functions when {@link USE_DEMO_DATA} is true —
 * i.e. when no real Firebase credentials are configured, or when explicitly
 * forced with `EXPO_PUBLIC_DEMO_DATA=1`. With real credentials configured this
 * is inert, so production data is never mixed with demo content.
 */
import { isFirebaseConfigured } from "./config";
import type { Lesson, LessonType, Player } from "@/types";

export const USE_DEMO_DATA =
  process.env.EXPO_PUBLIC_DEMO_DATA === "1" || !isFirebaseConfigured;

const TYPES: LessonType[] = ["range", "simulator", "online", "indoor"];

const pid = (n: number) => `demo-p${n}`;

/** ISO date `n` days from today (negative = past). */
function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const PLAYER_SEED: Array<{
  name: string;
  handicap?: number;
  goals: string;
  phone: string;
}> = [
  { name: "Olivia Bennett", handicap: 8.4, goals: "Tighten up the short game", phone: "(555) 014-2280" },
  { name: "Liam Carter", handicap: 14.2, goals: "Break 90 this season", phone: "(555) 014-2281" },
  { name: "Emma Davis", handicap: 22.0, goals: "More consistent ball striking", phone: "(555) 014-2282" },
  { name: "Noah Evans", handicap: 5.1, goals: "Add 15 yards off the tee", phone: "(555) 014-2283" },
  { name: "Ava Foster", handicap: 18.7, goals: "Fix the slice", phone: "(555) 014-2284" },
  { name: "William Grant", handicap: 11.3, goals: "Lower scoring average", phone: "(555) 014-2285" },
  { name: "Sophia Hayes", goals: "Learn the fundamentals", phone: "(555) 014-2286" },
  { name: "James Irwin", handicap: 3.2, goals: "Sharpen wedge distances", phone: "(555) 014-2287" },
  { name: "Isabella Jones", handicap: 16.0, goals: "Improve putting", phone: "(555) 014-2288" },
  { name: "Benjamin King", handicap: 9.8, goals: "Drive it straighter", phone: "(555) 014-2289" },
  { name: "Mia Lopez", handicap: 30.1, goals: "Get comfortable on the course", phone: "(555) 014-2290" },
  { name: "Lucas Moore", handicap: 12.4, goals: "Tournament prep", phone: "(555) 014-2291" },
];

/** Twelve demo players belonging to the given coach. */
export function demoPlayers(coachId: string): Player[] {
  return PLAYER_SEED.map((p, i) => {
    const [first, last] = p.name.toLowerCase().split(" ");
    return {
      id: pid(i + 1),
      name: p.name,
      email: `${first}.${last}@example.com`,
      role: "player",
      coachId,
      handicap: p.handicap,
      goals: p.goals,
      phone: p.phone,
      createdAt: Date.now() - (i + 1) * 86_400_000,
    };
  });
}

/**
 * A spread of demo lessons: completed sessions across earlier months (for the
 * monthly bar chart), upcoming confirmed lessons, pending requests, and a
 * cancellation — exercising every status and the paid/unpaid toggle.
 */
export function demoLessons(coachId: string): Lesson[] {
  const now = new Date();
  const year = now.getFullYear();
  const curMonth = now.getMonth() + 1; // 1–12
  const lessons: Lesson[] = [];
  let n = 1;
  const push = (l: Omit<Lesson, "id" | "coachId">) =>
    lessons.push({ id: `demo-l${n++}`, coachId, ...l });

  // Completed lessons in the months before the current one (drives the chart).
  for (let m = 1; m < curMonth; m++) {
    const countThisMonth = (m % 3) + 1; // 1–3
    for (let k = 0; k < countThisMonth; k++) {
      const playerNum = ((m + k) % 12) + 1;
      push({
        playerId: pid(playerNum),
        date: `${year}-${String(m).padStart(2, "0")}-${String(5 + k * 7).padStart(2, "0")}`,
        startTime: ["09:00", "11:00", "14:00", "16:00"][k % 4],
        duration: [30, 45, 60, 90][k % 4],
        type: TYPES[(m + k) % 4],
        status: "completed",
        paid: (m + k) % 4 !== 0,
      });
    }
  }

  // Upcoming confirmed lessons → these players show as "Active".
  [
    { p: 1, o: 2 },
    { p: 3, o: 4 },
    { p: 6, o: 6 },
    { p: 8, o: 9 },
    { p: 2, o: 12 },
    { p: 10, o: 15 },
  ].forEach(({ p, o }, i) => {
    push({
      playerId: pid(p),
      date: isoOffset(o),
      startTime: ["08:30", "10:00", "13:00", "15:30"][i % 4],
      duration: [45, 60, 30, 60][i % 4],
      type: TYPES[i % 4],
      status: "confirmed",
      paid: i % 2 === 0,
    });
  });

  // Pending requests awaiting approval.
  [
    { p: 4, o: 3 },
    { p: 7, o: 5 },
    { p: 11, o: 8 },
  ].forEach(({ p, o }, i) => {
    push({
      playerId: pid(p),
      date: isoOffset(o),
      startTime: ["09:00", "12:30", "17:00"][i % 3],
      duration: 60,
      type: TYPES[i % 4],
      status: "requested",
    });
  });

  // A recent cancellation.
  push({
    playerId: pid(5),
    date: isoOffset(-4),
    startTime: "10:00",
    duration: 45,
    type: "range",
    status: "cancelled",
  });

  return lessons;
}
