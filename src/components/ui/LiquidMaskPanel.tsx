"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface LiquidMaskPanelProps {
  /** Always-visible layer (black bg + text) */
  front: React.ReactNode;
  /** Revealed layer (image + scrim + text + events) */
  back: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  /** Distortion amplitude at the blob edge in px (Swirl) */
  swirl?: number;
  /** Edge detail — higher = more jagged (Strength) */
  edgeDetail?: number;
  /** 0–1 lerp factor per frame for grow (Size speed) */
  growSpeed?: number;
  /** 0–1 lerp factor per frame for shrink (Return time) */
  returnSpeed?: number;
  /** Called when hover state changes */
  onHoverChange?: (hovered: boolean) => void;
}

// ── Builds a polar-noise SVG blob path ────────────────────────────────────────
// Uses a sum-of-sines approach to fake organic displacement without Perlin noise.
function buildBlobPath(
  cx: number,
  cy: number,
  r: number,
  t: number,
  swirl: number,
  detail: number,
  w: number,
  h: number,
): string {
  if (r < 1) return "";
  const STEPS = 90;
  let d = "";
  for (let i = 0; i <= STEPS; i++) {
    const angle = (i / STEPS) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Sum of sines at different frequencies — creates organic, non-repeating edge
    const noise =
      Math.sin(angle * 2.4  + t)          * swirl * 0.42 * detail +
      Math.sin(angle * 5.3  - t * 1.15)   * swirl * 0.26 * detail +
      Math.sin(angle * 8.9  + t * 0.72)   * swirl * 0.18 * detail +
      Math.sin(angle * 14.1 - t * 0.48)   * swirl * 0.10 * detail +
      Math.sin(angle * 21.7 + t * 0.3)    * swirl * 0.04 * detail;
    const nr = Math.max(0, r + noise);
    const x = (cx + cos * nr).toFixed(2);
    const y = (cy + sin * nr).toFixed(2);
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  d += "Z";
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${d}' fill='white'/></svg>`,
  )}`;
}

export function LiquidMaskPanel({
  front,
  back,
  style,
  className,
  swirl = 32,
  edgeDetail = 1,
  growSpeed = 0.09,
  returnSpeed = 0.05,
  onHoverChange,
}: LiquidMaskPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef    = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);

  const stateRef = useRef({
    mx: 0,
    my: 0,
    radius: 0,
    targetRadius: 0,
    time: 0,
    w: 0,
    h: 0,
  });

  const getDiagonal = (w: number, h: number) =>
    Math.sqrt(w * w + h * h) * 1.12;

  const applyMask = useCallback(() => {
    const s = stateRef.current;
    const reveal = revealRef.current;
    if (!reveal) return;

    s.time += 0.022;

    // Lerp radius toward target
    const speed = s.targetRadius > s.radius ? growSpeed : returnSpeed;
    s.radius += (s.targetRadius - s.radius) * speed;

    // Stop RAF once fully collapsed
    if (s.radius < 0.8 && s.targetRadius === 0) {
      s.radius = 0;
      reveal.style.maskImage         = "none";
      reveal.style.webkitMaskImage   = "none";
      return;
    }

    const url = buildBlobPath(
      s.mx, s.my, s.radius, s.time,
      swirl, edgeDetail, s.w, s.h,
    );
    if (url) {
      reveal.style.maskImage       = `url("${url}")`;
      reveal.style.webkitMaskImage = `url("${url}")`;
      reveal.style.maskRepeat      = "no-repeat";
      (reveal.style as React.CSSProperties & { webkitMaskRepeat: string }).webkitMaskRepeat = "no-repeat";
    }

    rafRef.current = requestAnimationFrame(applyMask);
  }, [swirl, edgeDetail, growSpeed, returnSpeed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      stateRef.current.w = rect.width;
      stateRef.current.h = rect.height;
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      stateRef.current.mx = e.clientX - rect.left;
      stateRef.current.my = e.clientY - rect.top;
    };

    const onEnter = () => {
      const s = stateRef.current;
      s.targetRadius = getDiagonal(s.w, s.h);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyMask);
      onHoverChange?.(true);
    };

    const onLeave = () => {
      stateRef.current.targetRadius = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyMask);
      onHoverChange?.(false);
    };

    // Touch: tap anywhere to toggle reveal from the centre
    const onTouchStart = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const t = e.touches[0];
      const s = stateRef.current;
      s.mx = t.clientX - rect.left;
      s.my = t.clientY - rect.top;
      const isRevealed = s.targetRadius > 0;
      s.targetRadius = isRevealed ? 0 : getDiagonal(s.w, s.h);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyMask);
      onHoverChange?.(!isRevealed);
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("touchstart", onTouchStart);
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [applyMask, onHoverChange]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {/* Front — always visible */}
      <div style={{ position: "absolute", inset: 0 }}>{front}</div>

      {/* Back — revealed through liquid blob mask */}
      <div
        ref={revealRef}
        style={{
          position: "absolute",
          inset: 0,
          maskImage: "none",
          WebkitMaskImage: "none",
        }}
      >
        {back}
      </div>
    </div>
  );
}
