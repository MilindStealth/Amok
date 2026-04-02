"use client";

/**
 * ScrollProgress — a thin bar at the top of the screen that fills
 * as the user scrolls down the page.
 *
 * Mount this once in layout.tsx (or add it to the Header).
 *
 * Uses transform: scaleX() instead of width because:
 * - scaleX is GPU-composited (doesn't trigger layout recalculation)
 * - width changes force the browser to recalculate surrounding layout
 * - Result: 60fps smooth even on complex pages
 */

import { useScrollProgress } from "@/hooks/useScrollProgress";

interface ScrollProgressProps {
  /** Height of the bar in pixels */
  height?: number;
  /** Color — defaults to the accent color */
  color?: string;
  /** Position: top (default) or bottom of viewport */
  position?: "top" | "bottom";
}

export function ScrollProgress({
  height = 2,
  color = "var(--color-accent)",
  position = "top",
}: ScrollProgressProps) {
  const progress = useScrollProgress();

  return (
    <div
      aria-hidden="true"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: "fixed",
        [position]: 0,
        left: 0,
        width: "100%",
        height: `${height}px`,
        backgroundColor: color,
        transform: `scaleX(${progress})`,
        transformOrigin: "left center",
        zIndex: 9999,
        // No transition here — the useScrollProgress hook fires on every scroll event
        // which is already smooth enough. Transition would add perceived lag.
      }}
    />
  );
}
