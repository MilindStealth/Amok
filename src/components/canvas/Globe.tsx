"use client";

import { useRef, useEffect, useCallback } from "react";

const LAT_LINES = [-70, -50, -30, -10, 10, 30, 50, 70];
const LON_LINES = [0, 30, 60, 90, 120, 150]; // 6 great circles = 12 meridians
const SEGMENTS = 90;

interface GlobeProps {
  size?: number;
  lineColor?: string; // CSS rgb triplet e.g. "255,255,255"
  speed?: number;
  className?: string;
}

/**
 * Canvas 3D wireframe globe.
 * Each segment rendered with depth-based opacity (front bright, back dim).
 * Inspired by the Framer DepthGlobe component.
 */
export function Globe({
  size = 420,
  lineColor = "255,255,255",
  speed = 0.0018,
  className = "",
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(0);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const R = Math.min(w, h) * 0.43;
    const cx = w / 2;
    const cy = h / 2;
    const theta = rotRef.current;

    ctx.clearRect(0, 0, w, h);

    // Draw one segment between two 3D points, with depth-based opacity
    const seg = (
      x0: number, y0: number, z0: number,
      x1: number, y1: number, z1: number,
    ) => {
      // Y-axis rotation
      const rx0 = x0 * Math.cos(theta) + z0 * Math.sin(theta);
      const rz0 = -x0 * Math.sin(theta) + z0 * Math.cos(theta);
      const rx1 = x1 * Math.cos(theta) + z1 * Math.sin(theta);
      const rz1 = -x1 * Math.sin(theta) + z1 * Math.cos(theta);

      // Depth → opacity (front hemisphere visible, back very dim)
      const zNorm = (rz0 + R) / (2 * R); // 0 (back) → 1 (front)
      const opacity = Math.max(0.02, zNorm * zNorm * 0.65);

      ctx.beginPath();
      ctx.moveTo(cx + rx0, cy + y0);
      ctx.lineTo(cx + rx1, cy + y1);
      ctx.strokeStyle = `rgba(${lineColor},${opacity.toFixed(3)})`;
      ctx.lineWidth = 0.65;
      ctx.stroke();

      // Glow dots at vertices of front hemisphere
      if (rz0 > R * 0.5 && Math.random() < 0.003) {
        ctx.beginPath();
        ctx.arc(cx + rx0, cy + y0, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${lineColor},${(opacity * 1.4).toFixed(3)})`;
        ctx.fill();
      }
    };

    // Latitude rings
    for (const lat of LAT_LINES) {
      const lr = (lat * Math.PI) / 180;
      const r = R * Math.cos(lr);
      const y = R * Math.sin(lr);
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = (i / SEGMENTS) * Math.PI * 2;
        const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2;
        seg(r * Math.sin(a0), y, r * Math.cos(a0), r * Math.sin(a1), y, r * Math.cos(a1));
      }
    }

    // Longitude great circles
    for (const lon of LON_LINES) {
      const lr = (lon * Math.PI) / 180;
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = (i / SEGMENTS) * Math.PI - Math.PI / 2;
        const a1 = ((i + 1) / SEGMENTS) * Math.PI - Math.PI / 2;
        seg(
          R * Math.cos(a0) * Math.sin(lr), R * Math.sin(a0), R * Math.cos(a0) * Math.cos(lr),
          R * Math.cos(a1) * Math.sin(lr), R * Math.sin(a1), R * Math.cos(a1) * Math.cos(lr),
        );
      }
    }

    rotRef.current += speed;
    rafRef.current = requestAnimationFrame(draw);
  }, [lineColor, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, draw]);

  return <canvas ref={canvasRef} className={className} style={{ width: size, height: size }} />;
}
