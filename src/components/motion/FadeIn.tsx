"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateFadeIn } from "@/lib/gsap/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { FadeInProps } from "@/types";

/**
 * Wraps any content and fades it in when it enters the viewport.
 *
 * Usage:
 *   <FadeIn direction="up" delay={0.2}>
 *     <p>I fade in from below</p>
 *   </FadeIn>
 */
export function FadeIn({
  children,
  direction = "up",
  delay = 0.2,
  duration = 0.9,
  className,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    // Skip animation entirely if the user prefers reduced motion
    if (reduced) return;

    animateFadeIn(ref.current, { direction, delay, duration });
  }, { scope: ref, dependencies: [reduced] });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
