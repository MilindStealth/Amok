"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateFadeIn } from "@/lib/gsap/animations";
import { useReducedMotion } from "./useReducedMotion";
import type { AnimationDirection } from "@/types";

interface ScrollRevealOptions {
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  start?: string;
}

/**
 * Returns a ref that, when attached to a DOM element, animates it
 * in when it scrolls into view.
 *
 * Use this when you need the animation directly on an existing element
 * without adding a wrapper div (which FadeIn.tsx always adds).
 *
 * Usage:
 *   const ref = useScrollReveal({ direction: "up", delay: 0.2 });
 *   return <article ref={ref}>...</article>
 *
 * Cleanup: handled automatically — useGSAP kills the animation on unmount.
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      animateFadeIn(ref.current, options);
    },
    // Re-run if reduced-motion preference changes (user toggles setting at OS level)
    { scope: ref, dependencies: [reduced] }
  );

  return ref;
}
