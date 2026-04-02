"use client";

import { useEffect, useState } from "react";

/**
 * Returns a number from 0 to 1 representing how far the user has scrolled.
 * 0 = top of page, 1 = bottom of page.
 *
 * Useful for:
 *  - Progress bars
 *  - Parallax effects
 *  - Triggering events at a certain scroll depth
 *
 * Usage:
 *   const progress = useScrollProgress();
 *   // progress === 0.5 means user is halfway down the page
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const value = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // set initial value

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}
