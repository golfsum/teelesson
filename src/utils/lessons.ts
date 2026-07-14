import { LESSON_TYPE_LABELS } from "@/theme";
import type { Lesson, LessonType } from "@/types";

/** Lesson types that require a single, specific player. */
const INDIVIDUAL_TYPES: LessonType[] = ["range", "simulator", "online", "indoor"];

export function requiresPlayer(type: LessonType): boolean {
  return INDIVIDUAL_TYPES.includes(type);
}

/** The participant ids on a lesson (handles single + group + none). */
export function lessonParticipantIds(lesson: Lesson): string[] {
  if (lesson.playerIds?.length) return lesson.playerIds;
  return lesson.playerId ? [lesson.playerId] : [];
}

/**
 * A human label for a lesson's "who", an explicit title, the player's name,
 * a group summary, or the session type for player-less blocks.
 */
export function lessonParticipantLabel(
  lesson: Lesson,
  nameById?: Record<string, string>
): string {
  if (lesson.title) return lesson.title;

  const ids = lessonParticipantIds(lesson);
  if (ids.length > 1) return `Group · ${ids.length} players`;
  if (ids.length === 1) return nameById?.[ids[0]] ?? "Player";

  return LESSON_TYPE_LABELS[lesson.type] ?? "Session";
}
