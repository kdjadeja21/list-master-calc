"use client";

import { useState } from "react";

/**
 * Returns ids that have newly appeared during this mount lifetime.
 * The first non-empty observation is treated as a baseline (no animation on
 * page load / initial fetch). Once an id is marked as appearing, it stays
 * marked so entrance CSS is not pulled off mid-animation by later updates.
 */
export function useAppearingIds(ids: string[]): Set<string> {
  const idsKey = ids.join("\0");
  const [prevKey, setPrevKey] = useState(idsKey);
  const [known, setKnown] = useState(() => new Set(ids));
  const [appearing, setAppearing] = useState(() => new Set<string>());
  const [hydrated, setHydrated] = useState(() => ids.length > 0);

  if (idsKey !== prevKey) {
    setPrevKey(idsKey);

    if (!hydrated) {
      setKnown(new Set(ids));
      setAppearing(new Set());
      if (ids.length > 0) setHydrated(true);
    } else {
      const nextAppearing = new Set<string>();
      for (const id of appearing) {
        if (ids.includes(id)) nextAppearing.add(id);
      }
      for (const id of ids) {
        if (!known.has(id)) nextAppearing.add(id);
      }
      setAppearing(nextAppearing);
      setKnown(new Set(ids));
    }
  }

  return appearing;
}
