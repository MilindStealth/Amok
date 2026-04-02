"use client";

import { useEffect, useState } from "react";

/**
 * Reads the OS-level "Reduce Motion" accessibility preference.
 * If the user has enabled it, we skip or simplify animations.
 *
 * Usage:
 *   const reduced = useReducedMotion();
 *   if (reduced) return; // skip the animation
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
