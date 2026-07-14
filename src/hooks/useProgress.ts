/**
 * Realtime progress entries for a player, plus the create mutation.
 */
import { useEffect, useState } from "react";

import { createProgressEntry, watchPlayerProgress } from "@/firebase/dbService";
import type { ProgressEntry } from "@/types";

export function useProgress(playerId?: string) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = watchPlayerProgress(playerId, (list) => {
      setEntries(list);
      setLoading(false);
    });
    return unsub;
  }, [playerId]);

  return {
    entries,
    loading,
    addEntry: createProgressEntry,
  };
}
