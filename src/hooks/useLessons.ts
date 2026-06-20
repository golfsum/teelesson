/**
 * Realtime lessons for the current coach or player, plus booking mutations.
 */
import { useEffect, useMemo, useState } from "react";

import {
  createLesson,
  deleteLesson,
  updateLesson,
  watchCoachLessons,
  watchPlayerLessons,
} from "@/firebase/dbService";
import { todayISO } from "@/utils/format";
import type { Lesson } from "@/types";

export function useLessons(opts: { coachId?: string; playerId?: string }) {
  const { coachId, playerId } = opts;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let unsub = () => {};
    if (coachId) {
      unsub = watchCoachLessons(coachId, (l) => {
        setLessons(l);
        setLoading(false);
      });
    } else if (playerId) {
      unsub = watchPlayerLessons(playerId, (l) => {
        setLessons(l);
        setLoading(false);
      });
    } else {
      setLessons([]);
      setLoading(false);
    }
    return unsub;
  }, [coachId, playerId]);

  const today = todayISO();
  const upcoming = useMemo(
    () =>
      lessons
        .filter((l) => l.date >= today && l.status !== "cancelled")
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [lessons, today]
  );
  const past = useMemo(
    () => lessons.filter((l) => l.date < today || l.status === "completed"),
    [lessons, today]
  );
  const pending = useMemo(
    () => lessons.filter((l) => l.status === "requested"),
    [lessons]
  );

  return {
    lessons,
    upcoming,
    past,
    pending,
    loading,
    createLesson,
    updateLesson,
    deleteLesson,
    approveLesson: (id: string) => updateLesson(id, { status: "confirmed" }),
    cancelLesson: (id: string) => updateLesson(id, { status: "cancelled" }),
    completeLesson: (id: string) => updateLesson(id, { status: "completed" }),
    setPaid: (id: string, paid: boolean) => updateLesson(id, { paid }),
  };
}
