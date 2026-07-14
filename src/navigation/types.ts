/**
 * Central navigation param lists. Screens import these for typed `route.params`
 * and `navigation.navigate(...)` calls.
 *
 * Structure:
 *   RootNavigator switches between AuthStack / CoachStack / PlayerStack based on
 *   the signed-in user's role.
 */
import type { UserRole } from "@/types";

/** Static content pages linked from the marketing footer. */
export type InfoPage = "features" | "forCoaches" | "privacy" | "terms";

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: { coachId?: string; role?: UserRole } | undefined;
  PublicCoachProfile: { slug: string };
  Info: { page: InfoPage };
};

export type CoachTabsParamList = {
  Dashboard: undefined;
  Players: undefined;
  Schedule: undefined;
  Lessons: undefined;
  Messages: undefined;
  Programs: undefined;
  Payments: undefined;
  Reports: undefined;
  Videos: undefined;
  Drills: undefined;
  Profile: undefined;
};

export type CoachStackParamList = {
  CoachTabs: undefined;
  PlayerProfile: { playerId: string };
  AddLesson:
    | { playerId?: string; date?: string; startTime?: string; replaceId?: string }
    | undefined;
  LogProgress: { playerId: string };
  Availability: undefined;
  InvitePlayer: undefined;
  Account: undefined;
  PublicCoachProfile: { slug: string };
};

export type PlayerTabsParamList = {
  Home: undefined;
  Book: undefined;
};

export type PlayerStackParamList = {
  PlayerTabs: undefined;
  BookLesson: undefined;
  Account: undefined;
};
