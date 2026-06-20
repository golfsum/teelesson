/**
 * Authentication + user-document helpers.
 *
 * On sign-up we create the matching `users/{uid}` document so the rest of the
 * app can rely on a profile existing for every authenticated account.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "./config";
import type { AppUser, UserRole } from "@/types";

const googleProvider = new GoogleAuthProvider();

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** When a player signs up via an invite link, the inviting coach's uid. */
  coachId?: string;
}

/** Create the `users/{uid}` profile document (idempotent). */
async function ensureUserDoc(
  fbUser: FirebaseUser,
  data: Partial<AppUser> & { role: UserRole }
): Promise<AppUser> {
  const ref = doc(db, "users", fbUser.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { id: fbUser.uid, ...(existing.data() as Omit<AppUser, "id">) };
  }
  const profile: Omit<AppUser, "id"> = {
    name: data.name ?? fbUser.displayName ?? "New User",
    email: data.email ?? fbUser.email ?? "",
    role: data.role,
    photoURL: data.photoURL ?? fbUser.photoURL ?? undefined,
    ...(data.coachId ? { coachId: data.coachId } : {}),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() }, { merge: true });
  return { id: fbUser.uid, ...profile };
}

export async function signUpWithEmail(input: SignUpInput): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );
  await updateProfile(cred.user, { displayName: input.name });
  return ensureUserDoc(cred.user, {
    name: input.name,
    email: input.email.trim(),
    role: input.role,
    coachId: input.coachId,
  });
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

/**
 * Google sign-in. Uses popup on web; on native this requires expo-auth-session
 * wiring (left as a Phase-2 enhancement). New Google users default to "coach".
 */
export async function signInWithGoogle(role: UserRole = "coach") {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(cred.user, {
    name: cred.user.displayName ?? "Coach",
    email: cred.user.email ?? "",
    role,
  });
  return cred.user;
}

export async function signOut() {
  await fbSignOut(auth);
}

/** Fetch the Firestore profile for a uid, or null if it doesn't exist yet. */
export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<AppUser, "id">) };
}
