"use client";

/**
 * MarqueeTrack — infinite horizontal scrolling ticker.
 *
 * WHY GSAP and not anime.js?
 * This is a continuous animation that loops forever at a consistent rate.
 * GSAP's ticker is more reliable for long-running loops —
 * it handles tab visibility changes (pauses when hidden) and lag smoothing.
 *
 * HOW THE SEAMLESS LOOP WORKS:
 * We render the children TWICE inside the track.
 * The track moves left by exactly 50% of its width (= one full set of content).
 * At that point, GSAP's repeat:-1 resets it to 0 — which looks identical
 * to where it started because the second copy matches the first.
 */

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateMarquee } from "@/lib/gsap/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface MarqueeTrackProps {
  children: React.ReactNode;
  /** Seconds for one full cycle. Higher = slower. */
  speed?: number;
  direction?: "left" | "right";
  /** Gap between repeated items */
  gap?: string;
  className?: string;
  /** Class on each repeated item set */
  itemClassName?: string;
  /** Pause on hover */
  pauseOnHover?: boolean;
}

export function MarqueeTrack({
  children,
  speed = 30,
  direction = "left",
  gap = "4rem",
  className,
  itemClassName,
  pauseOnHover = true,
}: MarqueeTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef  = useRef<gsap.core.Tween | null>(null);
  const reduced  = useReducedMotion();

  useGSAP(() => {
    if (reduced || !trackRef.current) return;

    // Small timeout to ensure DOM is fully measured before calculating width
    const id = setTimeout(() => {
      const anim = animateMarquee(trackRef.current, speed, direction);
      if (anim) animRef.current = anim as gsap.core.Tween;
    }, 50);

    return () => clearTimeout(id);
  }, { scope: trackRef, dependencies: [reduced, speed, direction] });

  const handleMouseEnter = () => animRef.current?.pause();
  const handleMouseLeave = () => animRef.current?.play();

  return (
    <div
      className={cn("overflow-hidden", className)}
      onMouseEnter={pauseOnHover ? handleMouseEnter : undefined}
      onMouseLeave={pauseOnHover ? handleMouseLeave : undefined}
    >
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ gap }}
      >
        {/* Set 1 — the real content */}
        <div
          className={cn("flex shrink-0 items-center", itemClassName)}
          style={{ gap }}
        >
          {children}
        </div>
        {/* Set 2 — identical duplicate for seamless loop */}
        <div
          className={cn("flex shrink-0 items-center", itemClassName)}
          style={{ gap }}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
