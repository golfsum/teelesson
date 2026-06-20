/**
 * Central navigation param lists. Screens import these for typed `route.params`
 * and `navigation.navigate(...)` calls.
 *
 * Structure:
 *   RootNavigator switches between AuthStack / CoachStack / PlayerStack based on
 *   the signed-in user's role.
 */
import type { UserRole } from "@/types";

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: { coachId?: string; role?: UserRole } | undefined;
  PublicCoachProfile: { slug: string };
};

export type CoachTabsParamList = {
  Dashboard: undefined;
  Players: undefined;
  Schedule: undefined;
  Profile: undefined; // edit own coach profile + settings
};

export type CoachStackParamList = {
  CoachTabs: undefined;
  PlayerProfile: { playerId: string };
  AddLesson: { playerId?: string; date?: string } | undefined;
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
