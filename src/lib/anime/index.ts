/**
 * anime.js Micro-interaction Presets
 *
 * WHEN TO USE THIS FILE vs GSAP:
 *   ✅ anime.js: hover, click, focus — single element, triggered by user action
 *   ✅ anime.js: icon motion, count-ups, letter emphasis
 *   ❌ anime.js: scroll-based animations (use GSAP ScrollTrigger)
 *   ❌ anime.js: multi-element timelines (use GSAP timeline)
 *
 * MEMORY LEAK PREVENTION:
 *   Each function returns the animation instance.
 *   Callers must call .pause() in their cleanup:
 *     const anim = hoverLift(el);
 *     return () => anim?.pause();
 */

import { animate, spring } from "animejs";
import type { JSAnimation } from "animejs";

// Re-export what components need — they import from here, not from animejs directly
export { animate, spring };

// ─────────────────────────────────────────────────────────────────
// HOVER EFFECTS
// ─────────────────────────────────────────────────────────────────

/**
 * Lifts an element up slightly on hover. Use for cards, images, links.
 * Call again with restore=true on mouseleave to return to origin.
 */
export function hoverLift(
  element: HTMLElement | null,
  options: { amount?: number; duration?: number; restore?: boolean } = {}
): JSAnimation | undefined {
  if (!element) return;
  const { amount = -6, duration = 300, restore = false } = options;

  return animate(element, {
    translateY: restore ? 0 : amount,
    duration,
    easing: restore ? "outExpo" : "outBack",
  });
}

/**
 * Scales an element up slightly on hover. Use for buttons and icons.
 */
export function hoverScale(
  element: HTMLElement | null,
  options: { scale?: number; duration?: number; restore?: boolean } = {}
): JSAnimation | undefined {
  if (!element) return;
  const { scale = 1.05, duration = 250, restore = false } = options;

  return animate(element, {
    scale: restore ? 1 : scale,
    duration,
    easing: restore ? "outExpo" : "outBack",
  });
}

/**
 * Magnetic attraction toward cursor.
 * Call this on mousemove, pass the dx/dy distance from element center.
 */
export function magneticMove(
  element: HTMLElement | null,
  dx: number,
  dy: number,
  strength = 0.3
): JSAnimation | undefined {
  if (!element) return;

  return animate(element, {
    translateX: dx * strength,
    translateY: dy * strength,
    duration: 400,
    easing: "outExpo",
  });
}

/**
 * Returns element to origin after magnetic hover ends.
 */
export function magneticReturn(element: HTMLElement | null): JSAnimation | undefined {
  if (!element) return;

  return animate(element, {
    translateX: 0,
    translateY: 0,
    duration: 700,
    easing: "outElastic(1, 0.4)",
  });
}

// ─────────────────────────────────────────────────────────────────
// CLICK / TAP FEEDBACK
// ─────────────────────────────────────────────────────────────────

/**
 * Quick scale-down then spring back. Use for buttons and interactive elements.
 * Gives tactile "press" feedback.
 */
export function tapPulse(element: HTMLElement | null): JSAnimation | undefined {
  if (!element) return;

  return animate(element, {
    scale: [1, 0.93, 1],
    duration: 350,
    easing: "outElastic(1, 0.5)",
  });
}

/**
 * Brief flash of the accent color on click. Use for links and icon buttons.
 */
export function tapFlash(
  element: HTMLElement | null,
  color = "var(--color-accent)"
): void {
  if (!element) return;

  const original = element.style.color;
  animate(element, {
    color: [original, color, original],
    duration: 500,
    easing: "outExpo",
  });
}

// ─────────────────────────────────────────────────────────────────
// ICON MOTION
// ─────────────────────────────────────────────────────────────────

/**
 * Rotate an icon 360°. Use for refresh, loading, or decorative icons.
 */
export function iconSpin(
  element: HTMLElement | null,
  options: { duration?: number; loops?: number } = {}
): JSAnimation | undefined {
  if (!element) return;
  const { duration = 600, loops = 1 } = options;

  return animate(element, {
    rotate: 360 * loops,
    duration,
    easing: "outExpo",
    onComplete: () => animate(element, { rotate: 0, duration: 0 }),
  });
}

/**
 * Arrow or chevron nudge — shows direction of navigation.
 * Use on hover for links with arrows.
 */
export function arrowNudge(
  element: HTMLElement | null,
  direction: "right" | "up" | "down" = "right",
  restore = false
): JSAnimation | undefined {
  if (!element) return;

  const x = direction === "right" ? (restore ? 0 : 6) : 0;
  const y = direction === "up" ? (restore ? 0 : -6) : direction === "down" ? (restore ? 0 : 6) : 0;

  return animate(element, {
    translateX: x,
    translateY: y,
    duration: restore ? 300 : 250,
    easing: restore ? "outExpo" : "outBack",
  });
}

// ─────────────────────────────────────────────────────────────────
// NUMBER / TEXT EFFECTS
// ─────────────────────────────────────────────────────────────────

/**
 * Animates a number from `from` to `to`.
 * The element's textContent is updated each frame.
 *
 * Returns a cleanup function — call it on unmount to avoid memory leaks.
 */
export function animateNumber(
  element: HTMLElement | null,
  options: {
    from?: number;
    to: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    format?: (value: number) => string;
  }
): (() => void) | undefined {
  if (!element) return;

  const {
    from = 0,
    to,
    duration = 2000,
    decimals = 0,
    prefix = "",
    suffix = "",
    format,
  } = options;

  const obj = { value: from };

  const anim = animate(obj, {
    value: to,
    duration,
    easing: "outExpo",
    onUpdate: () => {
      if (!element) return;
      const formatted = format
        ? format(obj.value)
        : obj.value.toFixed(decimals);
      element.textContent = `${prefix}${formatted}${suffix}`;
    },
    onComplete: () => {
      // Ensure final value is exact (floating point safety)
      const final = format ? format(to) : to.toFixed(decimals);
      if (element) element.textContent = `${prefix}${final}${suffix}`;
    },
  });

  // Return cleanup — caller calls this on unmount
  return () => anim.pause();
}

// ─────────────────────────────────────────────────────────────────
// STAGGER REVEAL — multiple children animate in sequence
// Use for lists, grids, nav items.
// ─────────────────────────────────────────────────────────────────

export function staggerIn(
  elements: HTMLElement[] | NodeListOf<HTMLElement>,
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    y?: number;
  } = {}
): JSAnimation | undefined {
  if (!elements || !elements.length) return;

  const { delay = 0, duration = 500, stagger = 80, y = 20 } = options;

  return animate(elements, {
    translateY: [y, 0],
    opacity: [0, 1],
    duration,
    delay: (_, i) => delay + i * stagger,
    easing: "outExpo",
  });
}
