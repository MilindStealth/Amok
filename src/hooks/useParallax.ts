"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateParallax } from "@/lib/gsap/animations";
import { useReducedMotion } from "./useReducedMotion";

interface ParallaxOptions {
  /** How fast the element moves relative to scroll.
   * 0.2 = subtle drift, 0.5 = noticeable, 1 = dramatic */
  speed?: number;
  /** Seconds of lag behind scroll position. Higher = floatier. */
  scrub?: number;
}

/**
 * Returns a ref that, when attached to a DOM element, gives it
 * a parallax scrolling effect.
 *
 * Use this when you need parallax on an existing element.
 * For a wrapper component, use <ParallaxLayer> instead.
 *
 * Usage:
 *   const ref = useParallax({ speed: 0.3 });
 *   return <div ref={ref} className="hero-image">...</div>
 *
 * IMPORTANT: The element needs overflow: hidden on its parent,
 * otherwise the parallax motion will show outside the container.
 */
export function useParallax(options: ParallaxOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      animateParallax(ref.current, options);
    },
    { scope: ref, dependencies: [reduced, options.speed] }
  );

  return ref;
}
