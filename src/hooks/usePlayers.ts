/**
 * Realtime list of a coach's players, plus CRM mutations.
 */
import { useEffect, useState } from "react";

import { updateUser, watchPlayers } from "@/firebase/dbService";
import type { Player } from "@/types";

export function usePlayers(coachId?: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = watchPlayers(coachId, (list) => {
      // Sort alphabetically for a stable CRM list.
      setPlayers([...list].sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return unsub;
  }, [coachId]);

  return {
    players,
    loading,
    /** Patch a player's CRM fields (notes, handicap, goals, contact). */
    updatePlayer: (id: string, patch: Partial<Player>) => updateUser(id, patch),
  };
}

export function usePlayer(players: Player[], playerId?: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}
