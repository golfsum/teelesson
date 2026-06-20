/**
 * Realtime coach availability slots (recurring + one-off) and mutations.
 */
import { useEffect, useState } from "react";

import {
  createAvailability,
  deleteAvailability,
  watchAvailability,
} from "@/firebase/dbService";
import type { AvailabilitySlot } from "@/types";

export function useAvailability(coachId?: string) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = watchAvailability(coachId, (s) => {
      setSlots(s);
      setLoading(false);
    });
    return unsub;
  }, [coachId]);

  return {
    slots,
    loading,
    addSlot: createAvailability,
    removeSlot: deleteAvailability,
  };
}
