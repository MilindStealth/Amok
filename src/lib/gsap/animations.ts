/**
 * GSAP Animation Presets
 *
 * Pure functions — no React, no hooks.
 * Each function takes DOM elements and GSAP options, returns a GSAP animation.
 *
 * RULES:
 * 1. Always return the animation/timeline so callers can kill() it on unmount.
 * 2. Use `once: true` on scroll triggers for reveal animations.
 * 3. Use `clearProps` after animations to avoid stale inline styles.
 * 4. Never hardcode values — accept an options object for everything tuneable.
 */

import { gsap, ScrollTrigger } from "./index";
import type { AnimationDirection } from "@/types";

// ─────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────

function directionToOffset(direction: AnimationDirection, distance = 50) {
  return {
    x: direction === "left" ? -distance : direction === "right" ? distance : 0,
    y: direction === "up"   ?  distance : direction === "down"  ? -distance : 0,
  };
}

// ─────────────────────────────────────────────────────────────────
// SCROLL-TRIGGERED FADE IN
// Fades and slides an element in as it enters the viewport.
// Uses expo ease to match the UNVRS aesthetic.
// ─────────────────────────────────────────────────────────────────

export function animateFadeIn(
  element: Element | null,
  options: {
    direction?: AnimationDirection;
    delay?: number;
    duration?: number;
    distance?: number;
    start?: string;
  } = {}
) {
  if (!element) return;

  const {
    direction = "up",
    delay = 0,
    duration = 1.0,
    distance = 36,
    start = "top 88%",
  } = options;

  const { x, y } = directionToOffset(direction, distance);

  return gsap.fromTo(
    element,
    { x, y, opacity: 0, willChange: "transform, opacity" },
    {
      x: 0,
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "expo.out", // cubic-bezier(.16, 1, .3, 1)
      clearProps: "willChange,x,y",
      scrollTrigger: {
        trigger: element,
        start,
        once: true,
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// MASKED REVEAL (UNVRS-style)
// Animates the INNER element of an overflow:hidden container.
// The inner element starts at yPercent:105 (fully below the clip)
// and moves to yPercent:0. Creates the "emerging from beneath" look.
//
// Usage: put this on the INNER div, not the outer overflow:hidden wrapper.
// The outer wrapper in the React component handles the clipping.
// ─────────────────────────────────────────────────────────────────

export function animateMaskedReveal(
  element: Element | null,
  options: {
    delay?: number;
    duration?: number;
    trigger?: Element | null;
    start?: string;
  } = {}
) {
  if (!element) return;

  const {
    delay = 0,
    duration = 1.1,
    trigger,
    start = "top 90%",
  } = options;

  return gsap.fromTo(
    element,
    { yPercent: 105 },
    {
      yPercent: 0,
      duration,
      delay,
      ease: "expo.out",
      clearProps: "yPercent",
      scrollTrigger: {
        trigger: trigger ?? element,
        start,
        once: true,
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// STAGGER FADE IN — multiple elements revealed in sequence
// Pass a NodeList or array of elements. Each one fades in after the previous.
// ─────────────────────────────────────────────────────────────────

export function animateStaggerFadeIn(
  elements: Element[] | NodeListOf<Element>,
  options: {
    direction?: AnimationDirection;
    delay?: number;
    duration?: number;
    stagger?: number;
    distance?: number;
    trigger?: Element | null;
    start?: string;
  } = {}
) {
  if (!elements || elements.length === 0) return;

  const {
    direction = "up",
    delay = 0,
    duration = 0.8,
    stagger = 0.1,
    distance = 40,
    trigger,
    start = "top 88%",
  } = options;

  const { x, y } = directionToOffset(direction, distance);
  const triggerEl = trigger ?? (elements[0] as Element);

  return gsap.fromTo(
    elements,
    { x, y, opacity: 0 },
    {
      x: 0,
      y: 0,
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: "power3.out",
      clearProps: "x,y",
      scrollTrigger: {
        trigger: triggerEl,
        start,
        once: true,
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// TEXT CHARACTER REVEAL
// Each character slides up from below its clip container.
// Used by TextReveal.tsx — the inner span elements are animated.
// ─────────────────────────────────────────────────────────────────

export function animateTextReveal(
  chars: Element[] | NodeListOf<Element>,
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    trigger?: Element | null;
    start?: string;
  } = {}
) {
  if (!chars || chars.length === 0) return;

  const {
    delay = 0,
    duration = 0.75,
    stagger = 0.03,
    trigger,
    start = "top 88%",
  } = options;

  return gsap.fromTo(
    chars,
    { y: "105%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration,
      delay,
      ease: "power4.out",
      stagger,
      scrollTrigger: trigger
        ? { trigger, start, once: true }
        : undefined,
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// CLIP-PATH REVEAL
// An element is "unmasked" using clip-path, revealing from one direction.
// Cinematic effect — great for images and large text blocks.
//
// How it works: clip-path defines the visible area of an element.
// We animate from "fully clipped" (invisible) to "fully revealed".
// ─────────────────────────────────────────────────────────────────

export function animateClipReveal(
  element: Element | null,
  options: {
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    duration?: number;
    trigger?: Element | null;
    start?: string;
  } = {}
) {
  if (!element) return;

  const {
    direction = "up",
    delay = 0,
    duration = 1.1,
    trigger,
    start = "top 85%",
  } = options;

  // Build the start and end clip-path values
  // inset(top right bottom left) — 100% means fully hidden, 0% means fully shown
  const clipStart = {
    up:    "inset(100% 0% 0% 0%)",
    down:  "inset(0% 0% 100% 0%)",
    left:  "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[direction];

  return gsap.fromTo(
    element,
    { clipPath: clipStart },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration,
      delay,
      ease: "power4.inOut",
      clearProps: "clipPath",
      scrollTrigger: {
        trigger: trigger ?? element,
        start,
        once: true,
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// PARALLAX SCROLL
// Element moves at a different speed to the page scroll.
// Speed > 0 = moves slower (floats behind). Speed < 0 = moves faster (foreground).
// Tied to scroll via scrub — no timeline, just math.
// ─────────────────────────────────────────────────────────────────

export function animateParallax(
  element: Element | null,
  options: {
    speed?: number;   // 0.2 = subtle, 0.5 = medium, 1 = strong
    scrub?: number;   // seconds of "lag" behind scroll (0 = instant)
  } = {}
) {
  if (!element) return;

  const { speed = 0.3, scrub = 1 } = options;
  const yPercent = speed * 100;

  return gsap.fromTo(
    element,
    { yPercent: -yPercent },
    {
      yPercent,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub,
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// PINNED SECTION
// Pins an element in place while you scroll through its content.
// Great for scroll-driven storytelling (text changes as user scrolls).
//
// How it works: ScrollTrigger "sticks" the element to the screen
// until the end trigger point is reached.
// ─────────────────────────────────────────────────────────────────

export function createPinnedSection(
  pin: Element | null,
  options: {
    trigger?: Element | null;
    start?: string;
    end?: string;
    scrub?: number | boolean;
    onUpdate?: (progress: number) => void;
  } = {}
) {
  if (!pin) return;

  const {
    trigger,
    start = "top top",
    end = "+=200%",
    scrub = 1,
    onUpdate,
  } = options;

  return ScrollTrigger.create({
    trigger: trigger ?? pin,
    start,
    end,
    scrub,
    pin,
    anticipatePin: 1, // smooths the pin moment
    onUpdate: onUpdate
      ? (self) => onUpdate(self.progress)
      : undefined,
  });
}

// ─────────────────────────────────────────────────────────────────
// PAGE ENTER TIMELINE
// The choreographed sequence that plays on first load.
// Multiple elements animate in a specific order.
// ─────────────────────────────────────────────────────────────────

export function animatePageEnter(elements: {
  nav?: Element | null;
  heroText?: Element[] | null;
  heroSub?: Element | null;
  heroCta?: Element | null;
}) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (elements.nav) {
    tl.fromTo(
      elements.nav,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    );
  }

  if (elements.heroText?.length) {
    tl.fromTo(
      elements.heroText,
      { y: "110%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 1.1, stagger: 0.05 },
      "-=0.4"
    );
  }

  if (elements.heroSub) {
    tl.fromTo(
      elements.heroSub,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      "-=0.6"
    );
  }

  if (elements.heroCta) {
    tl.fromTo(
      elements.heroCta,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      "-=0.4"
    );
  }

  return tl;
}

// ─────────────────────────────────────────────────────────────────
// HORIZONTAL MARQUEE (infinite ticker)
// Animates a track element that contains two identical sets of content.
// When the track moves -50% of its width, it resets seamlessly.
// ─────────────────────────────────────────────────────────────────

export function animateMarquee(
  track: Element | null,
  duration = 25,
  direction: "left" | "right" = "left"
) {
  if (!track) return;

  // scrollWidth / 2 = width of one set of content (track has two identical sets)
  const width = (track as HTMLElement).scrollWidth / 2;
  const fromX = direction === "left" ? 0 : -width;
  const toX   = direction === "left" ? -width : 0;

  return gsap.fromTo(
    track,
    { x: fromX },
    {
      x: toX,
      duration,
      ease: "none",
      repeat: -1,
    }
  );
}
