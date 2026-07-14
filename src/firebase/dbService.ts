/**
 * Firestore data-access layer.
 *
 * Thin, typed helpers over the collections defined in `@/types`. Hooks in
 * `src/hooks` wrap these with TanStack Query for caching + realtime listeners.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "./config";
import {
  USE_DEMO_DATA,
  demoAvailability,
  demoCoach,
  demoLessons,
  demoPlayers,
  demoProgress,
} from "./demoData";
import type {
  AppUser,
  AvailabilitySlot,
  Lesson,
  Player,
  ProgressEntry,
} from "@/types";

type Listener<T> = (items: T[]) => void;

const demoLessonStores = new Map<string, Lesson[]>();
const demoLessonListeners = new Map<string, Set<Listener<Lesson>>>();
const demoProgressStores = new Map<string, ProgressEntry[]>();
const demoProgressListeners = new Map<string, Set<Listener<ProgressEntry>>>();
const demoAvailabilityStores = new Map<string, AvailabilitySlot[]>();
const demoAvailabilityListeners = new Map<string, Set<Listener<AvailabilitySlot>>>();

function demoLessonsFor(coachId: string): Lesson[] {
  if (!demoLessonStores.has(coachId)) demoLessonStores.set(coachId, demoLessons(coachId));
  return demoLessonStores.get(coachId)!;
}

function publishDemoLessons(coachId: string) {
  const items = [...demoLessonsFor(coachId)].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  demoLessonListeners.get(coachId)?.forEach((listener) => listener(items));
}

function listenDemo<T>(map: Map<string, Set<Listener<T>>>, key: string, listener: Listener<T>) {
  const listeners = map.get(key) ?? new Set<Listener<T>>();
  listeners.add(listener);
  map.set(key, listeners);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) map.delete(key);
  };
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function withId<T>(snap: { id: string; data: () => any }): T {
  return { id: snap.id, ...snap.data() } as T;
}

async function getList<T>(
  path: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const snap = await getDocs(query(collection(db, path), ...constraints));
  return snap.docs.map((d) => withId<T>(d));
}

/** Subscribe to a query; returns an unsubscribe fn. */
function subscribe<T>(
  path: string,
  onData: (items: T[]) => void,
  ...constraints: QueryConstraint[]
): () => void {
  return onSnapshot(
    query(collection(db, path), ...constraints),
    (snap) => onData(snap.docs.map((d) => withId<T>(d))),
    (err) => {
      // Permission errors (e.g. not signed in / dev bypass) or transient
      // failures: log and emit an empty result so consumers can stop loading
      // and render their empty state instead of spinning forever.
      console.warn(`[dbService] snapshot error on "${path}":`, err.message);
      onData([]);
    }
  );
}

// ---------------------------------------------------------------------------
// Users / Players (CRM)
// ---------------------------------------------------------------------------

export async function getUser(uid: string): Promise<AppUser | null> {
  if (USE_DEMO_DATA && (uid === "dev-user" || uid === "demo-coach")) {
    return demoCoach();
  }
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? withId<AppUser>(snap) : null;
}

export async function updateUser(uid: string, patch: Partial<AppUser>) {
  await updateDoc(doc(db, "users", uid), { ...patch, updatedAt: Date.now() });
}

/** All players belonging to a coach. */
export function getPlayers(coachId: string): Promise<Player[]> {
  return getList<Player>(
    "users",
    where("role", "==", "player"),
    where("coachId", "==", coachId)
  );
}

export function watchPlayers(
  coachId: string,
  cb: (players: Player[]) => void
): () => void {
  if (USE_DEMO_DATA) {
    cb(demoPlayers(coachId));
    return () => {};
  }
  return subscribe<Player>(
    "users",
    cb,
    where("role", "==", "player"),
    where("coachId", "==", coachId)
  );
}

/** Look up a public coach profile by its slug. */
export async function getCoachBySlug(slug: string): Promise<AppUser | null> {
  if (USE_DEMO_DATA) {
    const c = demoCoach();
    return c.publicSlug === slug ? c : null;
  }
  const list = await getList<AppUser>(
    "users",
    where("role", "==", "coach"),
    where("publicSlug", "==", slug)
  );
  return list[0] ?? null;
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function createLesson(
  data: Omit<Lesson, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  if (USE_DEMO_DATA) {
    const id = `demo-created-${Date.now()}`;
    demoLessonsFor(data.coachId).push({ ...data, id, createdAt: Date.now(), updatedAt: Date.now() });
    publishDemoLessons(data.coachId);
    return id;
  }
  const ref = await addDoc(collection(db, "lessons"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLesson(id: string, patch: Partial<Lesson>) {
  if (USE_DEMO_DATA) {
    for (const [coachId, lessons] of demoLessonStores) {
      const index = lessons.findIndex((lesson) => lesson.id === id);
      if (index >= 0) {
        lessons[index] = { ...lessons[index], ...patch, updatedAt: Date.now() };
        publishDemoLessons(coachId);
        return;
      }
    }
    return;
  }
  await updateDoc(doc(db, "lessons", id), { ...patch, updatedAt: Date.now() });
}

export async function deleteLesson(id: string) {
  if (USE_DEMO_DATA) {
    for (const [coachId, lessons] of demoLessonStores) {
      const index = lessons.findIndex((lesson) => lesson.id === id);
      if (index >= 0) {
        lessons.splice(index, 1);
        publishDemoLessons(coachId);
        return;
      }
    }
    return;
  }
  await deleteDoc(doc(db, "lessons", id));
}

export function watchCoachLessons(
  coachId: string,
  cb: (lessons: Lesson[]) => void
): () => void {
  if (USE_DEMO_DATA) {
    cb([...demoLessonsFor(coachId)]);
    return listenDemo(demoLessonListeners, coachId, cb);
  }
  return subscribe<Lesson>(
    "lessons",
    cb,
    where("coachId", "==", coachId),
    orderBy("date", "asc")
  );
}

export function watchPlayerLessons(
  playerId: string,
  cb: (lessons: Lesson[]) => void
): () => void {
  if (USE_DEMO_DATA) {
    const coachId = "demo-coach";
    const emit = (items: Lesson[]) => cb(items.filter((lesson) => lesson.playerId === playerId || lesson.playerIds?.includes(playerId)));
    emit(demoLessonsFor(coachId));
    return listenDemo(demoLessonListeners, coachId, emit);
  }
  return subscribe<Lesson>(
    "lessons",
    cb,
    where("playerId", "==", playerId),
    orderBy("date", "asc")
  );
}

// ---------------------------------------------------------------------------
// Progress (player performance metrics over time)
// ---------------------------------------------------------------------------

export async function createProgressEntry(
  data: Omit<ProgressEntry, "id" | "createdAt">
): Promise<string> {
  if (USE_DEMO_DATA) {
    const id = `demo-progress-${Date.now()}`;
    const store = demoProgressStores.get(data.playerId) ?? demoProgress(data.playerId);
    store.push({ ...data, id, createdAt: Date.now() });
    demoProgressStores.set(data.playerId, store);
    demoProgressListeners.get(data.playerId)?.forEach((listener) => listener([...store].sort((a, b) => a.date.localeCompare(b.date))));
    return id;
  }
  const ref = await addDoc(collection(db, "progress"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteProgressEntry(id: string) {
  if (USE_DEMO_DATA) {
    for (const [playerId, entries] of demoProgressStores) {
      const index = entries.findIndex((entry) => entry.id === id);
      if (index >= 0) {
        entries.splice(index, 1);
        demoProgressListeners.get(playerId)?.forEach((listener) => listener([...entries]));
        return;
      }
    }
    return;
  }
  await deleteDoc(doc(db, "progress", id));
}

/** A player's progress entries, oldest first (for trend lines). */
export function watchPlayerProgress(
  playerId: string,
  cb: (entries: ProgressEntry[]) => void
): () => void {
  if (USE_DEMO_DATA) {
    const store = demoProgressStores.get(playerId) ?? demoProgress(playerId);
    demoProgressStores.set(playerId, store);
    cb([...store]);
    return listenDemo(demoProgressListeners, playerId, cb);
  }
  return subscribe<ProgressEntry>(
    "progress",
    cb,
    where("playerId", "==", playerId),
    orderBy("date", "asc")
  );
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export async function createAvailability(
  data: Omit<AvailabilitySlot, "id" | "createdAt">
): Promise<string> {
  if (USE_DEMO_DATA) {
    const id = `demo-availability-${Date.now()}`;
    const store = demoAvailabilityStores.get(data.coachId) ?? demoAvailability(data.coachId);
    store.push({ ...data, id, createdAt: Date.now() });
    demoAvailabilityStores.set(data.coachId, store);
    demoAvailabilityListeners.get(data.coachId)?.forEach((listener) => listener([...store]));
    return id;
  }
  const ref = await addDoc(collection(db, "availability"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteAvailability(id: string) {
  if (USE_DEMO_DATA) {
    for (const [coachId, slots] of demoAvailabilityStores) {
      const index = slots.findIndex((slot) => slot.id === id);
      if (index >= 0) {
        slots.splice(index, 1);
        demoAvailabilityListeners.get(coachId)?.forEach((listener) => listener([...slots]));
        return;
      }
    }
    return;
  }
  await deleteDoc(doc(db, "availability", id));
}

export function watchAvailability(
  coachId: string,
  cb: (slots: AvailabilitySlot[]) => void
): () => void {
  if (USE_DEMO_DATA) {
    const store = demoAvailabilityStores.get(coachId) ?? demoAvailability(coachId);
    demoAvailabilityStores.set(coachId, store);
    cb([...store]);
    return listenDemo(demoAvailabilityListeners, coachId, cb);
  }
  return subscribe<AvailabilitySlot>(
    "availability",
    cb,
    where("coachId", "==", coachId)
  );
}

export { serverTimestamp, setDoc, doc, db };
