"use client";

/**
 * CountUp — animated number counter powered by anime.js.
 *
 * WHY anime.js and not GSAP here?
 * This is a single-element, user-visible-triggered effect.
 * It's a micro-interaction — no scroll syncing, no timeline needed.
 * anime.js handles it in ~5 lines of code.
 *
 * The animation starts when the number scrolls into view (IntersectionObserver).
 */

import { useRef, useEffect } from "react";
import { animateNumber } from "@/lib/anime";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface CountUpProps {
  /** The target number to count up to */
  end: number;
  /** Starting number (default 0) */
  start?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Decimal places */
  decimals?: number;
  /** Text before the number e.g. "$" */
  prefix?: string;
  /** Text after the number e.g. "+" or "%" */
  suffix?: string;
  /** Custom formatter — overrides decimals/prefix/suffix */
  format?: (value: number) => string;
  className?: string;
}

export function CountUp({
  end,
  start = 0,
  duration = 2200,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If user prefers reduced motion, just show the final value immediately
    if (reduced) {
      const final = format ? format(end) : end.toFixed(decimals);
      el.textContent = `${prefix}${final}${suffix}`;
      return;
    }

    // Set initial display
    el.textContent = `${prefix}${start.toFixed(decimals)}${suffix}`;

    let cleanup: (() => void) | undefined;

    // IntersectionObserver fires the animation once the number is visible
    // This is more accurate than ScrollTrigger for a simple "start when visible" case
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect(); // only trigger once

        cleanup = animateNumber(el, {
          from: start,
          to: end,
          duration,
          decimals,
          prefix,
          suffix,
          format,
        });
      },
      { threshold: 0.5 } // fires when 50% of the element is visible
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [end, start, duration, decimals, prefix, suffix, format, reduced]);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={`${prefix}${end}${suffix}`}
    >
      {/* Initial server-rendered value — avoids hydration mismatch */}
      {prefix}{start}{suffix}
    </span>
  );
}
