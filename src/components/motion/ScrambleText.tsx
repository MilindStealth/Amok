"use client";

import { useRef, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

/**
 * Text that scrambles letter-by-letter on hover, then resolves back.
 * Inspired by the Framer Scramble-Glitch-Hover component.
 */
export function ScrambleText({ text, className, style, as: Tag = "span" }: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback(() => {
    if (!ref.current) return;
    const original = text.split("");
    let iterations = 0;

    if (frameRef.current) clearInterval(frameRef.current);

    frameRef.current = setInterval(() => {
      if (!ref.current) return;
      ref.current.textContent = original
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < iterations) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      iterations += 1 / 2.5;
      if (iterations >= original.length) {
        clearInterval(frameRef.current!);
        ref.current.textContent = text;
      }
    }, 40);
  }, [text]);

  const reset = useCallback(() => {
    if (frameRef.current) clearInterval(frameRef.current);
    if (ref.current) ref.current.textContent = text;
  }, [text]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AnyTag = Tag as any;
  return (
    <AnyTag
      ref={ref}
      className={className}
      style={style}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      {text}
    </AnyTag>
  );
}
