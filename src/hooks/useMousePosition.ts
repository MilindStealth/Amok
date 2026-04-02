"use client";

import { useEffect, useState } from "react";

interface MousePosition {
  x: number;   // raw pixels from left
  y: number;   // raw pixels from top
  nx: number;  // normalized 0–1 (left to right)
  ny: number;  // normalized 0–1 (top to bottom)
}

/**
 * Tracks the cursor position across the entire page.
 * Provides both raw pixel values and normalized 0–1 values.
 *
 * The normalized values are useful for shader uniforms (uMouse).
 *
 * Usage:
 *   const { x, y, nx, ny } = useMousePosition();
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    nx: 0.5, // start at center
    ny: 0.5,
  });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
        nx: e.clientX / window.innerWidth,
        ny: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return position;
}
