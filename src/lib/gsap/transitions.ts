/**
 * Page Transition Helpers
 *
 * These functions animate between pages or states.
 * They are called by the transition provider, not by individual components.
 *
 * USAGE PATTERN:
 *   1. User clicks a link
 *   2. transitionOut() plays → page content animates away
 *   3. Next page mounts
 *   4. transitionIn() plays → new content animates in
 */

import { gsap } from "./index";

// ─────────────────────────────────────────────────────────────────
// CURTAIN WIPE
// A full-screen overlay element sweeps in then out.
// The overlay element should be a fixed-position div in your layout.
//
// How to set up the curtain DOM element:
//   <div id="page-curtain" style="
//     position: fixed; inset: 0; z-index: 9000;
//     background: var(--color-accent);
//     transform: scaleY(0); transform-origin: bottom;
//   " />
// ─────────────────────────────────────────────────────────────────

export function curtainEnter(curtain: Element | null): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (!curtain) return tl;

  tl.set(curtain, { transformOrigin: "bottom center", scaleY: 0, display: "block" })
    .to(curtain, {
      scaleY: 1,
      duration: 0.6,
      ease: "power4.inOut",
    });

  return tl;
}

export function curtainExit(curtain: Element | null): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (!curtain) return tl;

  tl.set(curtain, { transformOrigin: "top center" })
    .to(curtain, {
      scaleY: 0,
      duration: 0.6,
      ease: "power4.inOut",
      onComplete: () => { gsap.set(curtain, { display: "none" }); },
    });

  return tl;
}

// ─────────────────────────────────────────────────────────────────
// CONTENT FADE
// Fade the main page content out / in.
// Simpler than curtain — works well for softer transitions.
// ─────────────────────────────────────────────────────────────────

export function contentFadeOut(
  container: Element | null,
  duration = 0.4
): gsap.core.Tween | undefined {
  if (!container) return;
  return gsap.to(container, {
    opacity: 0,
    y: -16,
    duration,
    ease: "power2.in",
  });
}

export function contentFadeIn(
  container: Element | null,
  delay = 0,
  duration = 0.6
): gsap.core.Tween | undefined {
  if (!container) return;
  return gsap.fromTo(
    container,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power3.out",
      clearProps: "y",
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION TRANSITION
// When switching between sections within a page (tabs, sliders, etc).
// ─────────────────────────────────────────────────────────────────

export function sectionSwapOut(
  section: Element | null,
  direction: "left" | "right" = "left"
): gsap.core.Tween | undefined {
  if (!section) return;
  const x = direction === "left" ? -60 : 60;
  return gsap.to(section, { x, opacity: 0, duration: 0.4, ease: "power2.in" });
}

export function sectionSwapIn(
  section: Element | null,
  direction: "left" | "right" = "left",
  delay = 0
): gsap.core.Tween | undefined {
  if (!section) return;
  const x = direction === "left" ? 60 : -60;
  return gsap.fromTo(
    section,
    { x, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.5,
      delay,
      ease: "power3.out",
      clearProps: "x",
    }
  );
}
