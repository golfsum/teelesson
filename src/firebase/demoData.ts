/**
 * Demo data for previewing the app without a Firebase backend.
 *
 * Served by the dbService watch functions when {@link USE_DEMO_DATA} is true -
 * i.e. when no real Firebase credentials are configured, when explicitly
 * forced with `EXPO_PUBLIC_DEMO_DATA=1`, or while the development auth bypass
 * is active. Production data is never mixed with demo content.
 */
import { isFirebaseConfigured } from "./config";
import type {
  AppUser,
  AvailabilitySlot,
  Lesson,
  LessonType,
  Player,
  ProgressEntry,
} from "@/types";

/** The demo coach's public profile (matches the dev mock account). */
export function demoCoach(): AppUser {
  return {
    id: "dev-user",
    name: "Demo Coach",
    email: "demo@teelesson.app",
    role: "coach",
    hourlyRate: 125,
    subscriptionPlan: "Pro",
    publicSlug: "demo-coach",
    location: "Austin, TX",
    experienceYears: 12,
    bio: "PGA-certified coach focused on the short game and course management. I help players of every level build a repeatable swing and lower their scores.",
    specialties: ["Short game", "Putting", "Swing analysis"],
    testimonials: [
      { author: "Liam C.", role: "Member", quote: "Knocked 6 strokes off my handicap in a single season." },
      { author: "Ava F.", role: "Junior parent", quote: "Fantastic with kids and adults alike, my daughter loves the lessons." },
    ],
  };
}

export const USE_DEMO_DATA =
  process.env.EXPO_PUBLIC_DEMO_DATA === "1" ||
  !isFirebaseConfigured ||
  (__DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH !== "0");

const TYPES: LessonType[] = ["range", "simulator", "online", "indoor"];

const pid = (n: number) => `demo-p${n}`;

/** ISO date `n` days from today (negative = past). */
function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const PLAYER_SEED: Array<{
  name: string;
  handicap?: number;
  goals: string;
  phone: string;
}> = [
  { name: "Alex Rivera", handicap: 12.4, goals: "Full Swing", phone: "(555) 014-2280" },
  { name: "Jordan Kim", handicap: 4.2, goals: "Driver", phone: "(555) 014-2281" },
  { name: "Taylor Brooks", handicap: 18.7, goals: "Short Game", phone: "(555) 014-2282" },
  { name: "Morgan Lee", handicap: 6.1, goals: "Putting", phone: "(555) 014-2283" },
  { name: "Casey Nguyen", handicap: 14.3, goals: "Irons", phone: "(555) 014-2284" },
  { name: "William Grant", handicap: 11.3, goals: "Lower scoring average", phone: "(555) 014-2285" },
  { name: "Sophia Hayes", goals: "Learn the fundamentals", phone: "(555) 014-2286" },
  { name: "James Irwin", handicap: 3.2, goals: "Sharpen wedge distances", phone: "(555) 014-2287" },
  { name: "Isabella Jones", handicap: 16.0, goals: "Improve putting", phone: "(555) 014-2288" },
  { name: "Benjamin King", handicap: 9.8, goals: "Drive it straighter", phone: "(555) 014-2289" },
  { name: "Mia Lopez", handicap: 30.1, goals: "Get comfortable on the course", phone: "(555) 014-2290" },
  { name: "Lucas Moore", handicap: 12.4, goals: "Tournament prep", phone: "(555) 014-2291" },
];

const EXTRA_PLAYER_NAMES = [
  "Charlotte Nelson", "Henry Owens", "Amelia Parker", "Alexander Quinn",
  "Harper Reed", "Daniel Scott", "Evelyn Turner", "Matthew Underwood",
  "Abigail Vaughn", "Samuel Walker", "Emily Xavier", "Jackson Young",
  "Ella Zimmerman", "Sebastian Adams", "Scarlett Brooks", "David Collins",
  "Grace Diaz", "Joseph Edwards", "Chloe Flores", "Carter Green",
  "Victoria Hall", "Wyatt Ingram", "Riley Johnson", "Luke Kennedy",
  "Lily Lewis", "Gabriel Mitchell", "Zoey Nichols", "Owen Ortiz",
  "Nora Phillips", "Julian Roberts", "Hannah Simmons", "Levi Taylor",
  "Layla Usher", "Isaac Vega", "Aria White", "Anthony Xu",
  "Penelope York", "Dylan Zane", "Camila Archer", "Andrew Bishop",
];

/** Twelve demo players belonging to the given coach. */
export function demoPlayers(coachId: string): Player[] {
  const seeds = [
    ...PLAYER_SEED,
    ...EXTRA_PLAYER_NAMES.map((name, index) => ({
      name,
      handicap: Number((6.5 + (index % 18) * 1.1).toFixed(1)),
      goals: ["Build a repeatable swing", "Break 90", "Improve course management", "Lower scoring average"][index % 4],
      phone: `(555) 015-${String(2300 + index)}`,
    })),
  ];
  return seeds.map((p, i) => {
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
 * cancellation, exercising every status and the paid/unpaid toggle.
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

  // A realistic current-month book of paid coaching at the demo coach's
  // $125 hourly rate. These records keep the dashboard preview representative
  // without affecting production data or bypassing the normal calculations.
  Array.from({ length: 38 }, (_, index) => {
    const day = (index % Math.max(1, now.getDate())) + 1;
    return {
      p: (index % PLAYER_SEED.length) + 1,
      day,
      duration: index === 30 ? 45 : index === 37 ? 30 : 60,
      time: ["07:00", "08:30", "10:00", "13:00", "15:30"][index % 5],
    };
  }).forEach(({ p, day, duration, time }, index) => {
    push({
      playerId: pid(p),
      date: `${year}-${String(curMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      startTime: time,
      duration,
      type: TYPES[index % TYPES.length],
      status: "completed",
      paid: true,
    });
  });

  // Upcoming confirmed lessons → these players show as "Active".
  push({
    date: isoOffset(0),
    startTime: "07:30",
    duration: 60,
    type: "review",
    status: "confirmed",
    title: "Online swing review",
  });
  [
    { p: 1, time: "08:30", duration: 45, type: "range" as const },
    { p: 4, time: "09:00", duration: 60, type: "range" as const },
    { p: 3, time: "10:00", duration: 60, type: "simulator" as const },
  ].forEach(({ p, time, duration, type }, i) => {
    push({
      playerId: pid(p),
      date: isoOffset(0),
      startTime: time,
      duration,
      type,
      status: "confirmed",
      paid: i % 2 === 0,
    });
  });
  push({
    playerId: pid(2),
    playerIds: [pid(2), pid(6), pid(9), pid(11), pid(13), pid(15)],
    date: isoOffset(0),
    startTime: "11:30",
    duration: 90,
    type: "group",
    status: "confirmed",
    title: "Junior Group Clinic",
  });

  Array.from({ length: 6 }, (_, index) => ({
    p: (index % 47) + 6,
    o: (index % 6) + 1,
    time: ["08:00", "09:30", "11:00", "13:00", "14:30", "16:00"][index % 6],
  })).forEach(({ p, o, time }, i) => {
    push({
      playerId: pid(p),
      date: isoOffset(o),
      startTime: time,
      duration: [30, 45, 60, 60][i % 4],
      type: TYPES[i % TYPES.length],
      status: "confirmed",
      paid: i % 3 !== 0,
    });
  });

  // Pending requests awaiting approval.
  [
    { p: 4, o: 8 },
    { p: 7, o: 10 },
    { p: 11, o: 12 },
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

  // A recent no-show.
  push({
    playerId: pid(9),
    date: isoOffset(-2),
    startTime: "13:00",
    duration: 60,
    type: "range",
    status: "noShow",
  });

  return lessons;
}

/** Weekday 9–5 windows plus a one-off weekend morning. */
export function demoAvailability(coachId: string): AvailabilitySlot[] {
  const recurring: AvailabilitySlot[] = [1, 2, 3, 4, 5].map((weekday) => ({
    id: `demo-av-${weekday}`,
    coachId,
    weekday,
    recurring: true,
    startTime: "09:00",
    endTime: "17:00",
  }));
  return [
    ...recurring,
    {
      id: "demo-av-oneoff",
      coachId,
      date: isoOffset(6),
      recurring: false,
      startTime: "08:00",
      endTime: "12:00",
    },
  ];
}

/**
 * Four dated measurement snapshots per player showing steady improvement over
 * ~6 months, handicap, scoring average, and putts trend down; GIR, fairways,
 * and driving distance trend up.
 */
export function demoProgress(playerId: string): ProgressEntry[] {
  const n = parseInt(playerId.replace("demo-p", ""), 10);
  const seed = PLAYER_SEED[(n - 1 + PLAYER_SEED.length) % PLAYER_SEED.length];
  const baseHandicap = seed?.handicap ?? 26;
  const round = (v: number, d = 0) => Number(v.toFixed(d));

  // Snapshots at ~6, 4, 2, 0 months ago. f = 0 (start) → 1 (latest).
  const offsets = [-180, -120, -60, 0];
  return offsets.map((days, i) => {
    const f = i / (offsets.length - 1);
    const handicap = round(baseHandicap + 4 - 4 * f, 1);
    return {
      id: `demo-pr-${n}-${i}`,
      coachId: "demo-coach",
      playerId,
      date: isoOffset(days),
      handicap,
      scoringAverage: round(72 + handicap * 0.95, 1),
      gir: round(20 + 18 * f),
      fairways: round(40 + 15 * f),
      putts: round(36 - 5 * f, 1),
      drivingDistance: round(225 + 20 * f),
      upDown: round(35 + 20 * f),
      sandSaves: round(20 + 18 * f),
      threePutts: round(3.5 - 2 * f, 1),
      createdAt: Date.now() - (offsets.length - i) * 5_184_000_000,
    };
  });
}
