"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Create the Lenis instance — this takes over scroll behavior
    const lenis = new Lenis({
      duration: 0.85,         // Snappier glide — was 1.2 (felt sluggish)
      easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic ease-out — fast start, smooth stop
      orientation: "vertical",
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Tell GSAP ScrollTrigger to update when Lenis scrolls
    lenis.on("scroll", ScrollTrigger.update);

    // Connect Lenis into GSAP's render loop so they stay in sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // GSAP gives time in seconds, Lenis wants milliseconds
    });

    // Disable GSAP's built-in lag compensation (Lenis handles this)
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
