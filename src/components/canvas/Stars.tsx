"use client";

import { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  r: number;    // radius
  a: number;    // base alpha
  spd: number;  // twinkle speed
  phi: number;  // phase offset
}

interface StarsProps {
  count?: number;
  /** CSS z-index */
  zIndex?: number;
}

/**
 * Full-page fixed starfield canvas.
 * Stars twinkle at different frequencies.
 */
export function Stars({ count = 220, zIndex = 1 }: StarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.15,
        a: Math.random() * 0.4 + 0.06,
        spd: Math.random() * 0.012 + 0.003,
        phi: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      const t = tRef.current;

      for (const s of starsRef.current) {
        const alpha = s.a * (0.4 + 0.6 * Math.sin(t * s.spd + s.phi));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,235,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Occasional shooting star
      if (t % 420 < 2) {
        const sx = Math.random() * W * 0.6 + W * 0.2;
        const sy = Math.random() * H * 0.4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 80, sy + 20);
        const grad = ctx.createLinearGradient(sx, sy, sx + 80, sy + 20);
        grad.addColorStop(0, "rgba(255,248,235,0.0)");
        grad.addColorStop(0.5, "rgba(255,248,235,0.45)");
        grad.addColorStop(1, "rgba(255,248,235,0.0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      tRef.current++;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        zIndex,
        pointerEvents: "none",
        opacity: 0.9,
      }}
    />
  );
}
