"use client";

import { useParallax } from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

interface ParallaxLayerProps {
  children: React.ReactNode;
  /** 0.2 = subtle, 0.5 = medium, 1 = strong */
  speed?: number;
  /** Smoothing — how many seconds the animation lags behind scroll */
  scrub?: number;
  className?: string;
}

/**
 * Wraps children with a parallax scroll effect.
 *
 * IMPORTANT: Put this inside a container with overflow:hidden
 * so the movement doesn't spill outside the section.
 *
 * Usage:
 *   <div className="overflow-hidden h-[500px]">
 *     <ParallaxLayer speed={0.3}>
 *       <Image src="/hero.jpg" alt="Hero" fill />
 *     </ParallaxLayer>
 *   </div>
 *
 * Negative speed makes the element move faster than scroll (foreground effect).
 * Positive speed makes it move slower (background drift).
 */
export function ParallaxLayer({ children, speed = 0.3, scrub = 1, className }: ParallaxLayerProps) {
  // Extra vertical height compensates for the parallax movement
  // so the element doesn't show empty space at start/end of travel
  const overflow = Math.abs(speed) * 100;

  const ref = useParallax({ speed, scrub });

  return (
    <div
      // @ts-expect-error — useParallax returns HTMLElement ref, works fine on div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        // Make the element taller than its container to hide parallax overflow
        marginTop: `-${overflow}px`,
        marginBottom: `-${overflow}px`,
        height: `calc(100% + ${overflow * 2}px)`,
      }}
    >
      {children}
    </div>
  );
}
