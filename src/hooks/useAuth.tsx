/**
 * Auth context. Tracks the Firebase auth session and the matching Firestore
 * profile document, and exposes sign-in / sign-up / sign-out actions.
 *
 * Wrap the app in <AuthProvider>; consume with useAuth().
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/firebase/config";
import {
  fetchUserProfile,
  signInWithEmail,
  signInWithGoogle,
  signOut as svcSignOut,
  signUpWithEmail,
  type SignUpInput,
} from "@/firebase/authService";
import type { AppUser, UserRole } from "@/types";

/**
 * ⚠️ DEV ONLY — bypass the login screen so the app opens straight into the
 * main UI with a mock account. Flip this to `false` (or delete the block) to
 * restore the normal Firebase login flow before shipping.
 *
 * Note: data still comes from Firebase, so lists will be empty until you sign
 * in with a real account — this just lets you click through the screens.
 */
const DEV_SKIP_AUTH = true;

/** Mock account used when DEV_SKIP_AUTH is on. Change role to "player" to
 *  preview the player app instead of the coach app. */
const DEV_MOCK_USER: AppUser = {
  id: "dev-user",
  name: "Demo Coach",
  email: "demo@teelesson.app",
  role: "coach",
};

interface AuthContextValue {
  /** Firestore profile for the signed-in user, or null when signed out. */
  user: AppUser | null;
  /** True while the initial auth state is resolving. */
  initializing: boolean;
  role: UserRole | null;
  isCoach: boolean;
  isPlayer: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInGoogle: (role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-pull the profile doc (after a profile edit). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(
    DEV_SKIP_AUTH ? DEV_MOCK_USER : null
  );
  const [initializing, setInitializing] = useState(!DEV_SKIP_AUTH);

  useEffect(() => {
    // DEV bypass: skip Firebase auth entirely and use the mock account.
    if (DEV_SKIP_AUTH) return;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
    return unsub;
  }, []);

  const refresh = async () => {
    if (auth.currentUser) {
      setUser(await fetchUserProfile(auth.currentUser.uid));
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      role: user?.role ?? null,
      isCoach: user?.role === "coach",
      isPlayer: user?.role === "player",
      signIn: async (email, password) => {
        await signInWithEmail(email, password);
      },
      signUp: async (input) => {
        const profile = await signUpWithEmail(input);
        setUser(profile);
      },
      signInGoogle: async (role) => {
        await signInWithGoogle(role);
      },
      signOut: async () => {
        await svcSignOut();
        setUser(null);
      },
      refresh,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}
