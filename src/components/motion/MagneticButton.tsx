"use client";

import { useRef, useCallback } from "react";
import { magneticMove, magneticReturn } from "@/lib/anime";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;   // how much the button moves (0–1), default 0.3
  className?: string;
  onClick?: () => void;
}

/**
 * Wraps any element and makes it magnetically attracted to the cursor.
 * When the mouse is near the button, it gently moves toward the cursor.
 * When the mouse leaves, it springs back to its original position.
 *
 * Powered by anime.js for the springy feel.
 *
 * Usage:
 *   <MagneticButton>
 *     <button>Click me</button>
 *   </MagneticButton>
 */
export function MagneticButton({
  children,
  strength = 0.3,
  className,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      // Distance from cursor to button center
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);

      magneticMove(ref.current, dx, dy, strength);
    },
    [strength, reduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;

    magneticReturn(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ display: "inline-block" }}
    >
      {children}
    </div>
  );
}
