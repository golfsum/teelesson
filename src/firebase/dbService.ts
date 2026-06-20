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
import { USE_DEMO_DATA, demoLessons, demoPlayers } from "./demoData";
import type {
  AppUser,
  AvailabilitySlot,
  Lesson,
  Player,
} from "@/types";

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
  const ref = await addDoc(collection(db, "lessons"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLesson(id: string, patch: Partial<Lesson>) {
  await updateDoc(doc(db, "lessons", id), { ...patch, updatedAt: Date.now() });
}

export async function deleteLesson(id: string) {
  await deleteDoc(doc(db, "lessons", id));
}

export function watchCoachLessons(
  coachId: string,
  cb: (lessons: Lesson[]) => void
): () => void {
  if (USE_DEMO_DATA) {
    cb(demoLessons(coachId));
    return () => {};
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
    cb(demoLessons("demo-coach").filter((l) => l.playerId === playerId));
    return () => {};
  }
  return subscribe<Lesson>(
    "lessons",
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
  const ref = await addDoc(collection(db, "availability"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteAvailability(id: string) {
  await deleteDoc(doc(db, "availability", id));
}

export function watchAvailability(
  coachId: string,
  cb: (slots: AvailabilitySlot[]) => void
): () => void {
  return subscribe<AvailabilitySlot>(
    "availability",
    cb,
    where("coachId", "==", coachId)
  );
}

export { serverTimestamp, setDoc, doc, db };
