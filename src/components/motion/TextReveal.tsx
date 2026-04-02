"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateTextReveal } from "@/lib/gsap/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { TextRevealProps } from "@/types";

/**
 * Splits text into characters or words and reveals them with a stagger.
 * Each char/word slides up from below its clip container.
 *
 * This is the signature animation on Awwwards sites — big headline
 * letters fly in one by one.
 *
 * Usage:
 *   <TextReveal text="Hello World" as="h1" splitBy="chars" />
 */
export function TextReveal({
  text,
  as: Tag = "h2",
  splitBy = "chars",
  delay = 0,
  duration = 0.7,
  stagger = 0.03,
  className,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Split text into an array of characters or words
  const parts = splitBy === "chars"
    ? text.split("")
    : text.split(" ");

  useGSAP(() => {
    if (reduced || !ref.current) return;

    // Get all the inner span elements (the animated pieces)
    const chars = ref.current.querySelectorAll(".char-inner");

    animateTextReveal(chars, {
      delay,
      duration,
      stagger,
      trigger: ref.current,
    });
  }, { scope: ref, dependencies: [reduced] });

  return (
    // @ts-expect-error — dynamic tag is valid
    <Tag ref={ref} className={className} aria-label={text}>
      {parts.map((part, i) => (
        // Outer span clips the inner span — creates the "slide up from under" effect
        <span
          key={i}
          className="char-clip inline-block overflow-hidden"
          aria-hidden="true"
        >
          <span className="char-inner inline-block">
            {/* Preserve spaces — replace " " with non-breaking space */}
            {part === " " ? "\u00A0" : part}
            {/* Add space between words when splitting by words */}
            {splitBy === "words" && i < parts.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
