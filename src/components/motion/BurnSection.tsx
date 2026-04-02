"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Config ───────────────────────────────────────────────────────
const CELL        = 5;    // px per burn cell (larger = more pixelated / faster)
const FIRE_RANGE  = 0.14; // how wide the fire band is in progress units

// ── Burn map ─────────────────────────────────────────────────────
// Pre-computes a noise-based threshold per cell.
// When scroll progress >= threshold, the cell is "burned" (transparent).
// Bottom cells have lower thresholds → burn first as you scroll down into the section.
function buildBurnMap(cols: number, rows: number): Float32Array {
  const map = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n =
        Math.sin(c * 0.17 + r * 0.06) * 0.22 +
        Math.sin(c * 0.06 + r * 0.22 + 2.1) * 0.17 +
        Math.sin(c * 0.34 + r * 0.09 + 1.4) * 0.13 +
        Math.sin(c * 0.10 + r * 0.38 + 3.2) * 0.10 +
        Math.sin(c * 0.53 + r * 0.05 + 0.8) * 0.07;

      // yBias: 1 at top, 0 at bottom → bottom rows burn first (lower threshold)
      const yBias = 1 - r / (rows - 1);
      map[r * cols + c] = 0.08 + (n * 0.5 + 0.5) * 0.30 + yBias * 0.62;
    }
  }
  return map;
}

// ── Fire colour ───────────────────────────────────────────────────
// heat 0 = cold edge of fire (dark), heat 1 = hottest (fades to transparent)
const FIRE_STOPS: [number, [number, number, number, number]][] = [
  [0.00, [8,   8,   8,   255]],
  [0.15, [55,  4,   0,   255]],
  [0.35, [155, 22,  0,   255]],
  [0.55, [228, 75,  0,   255]],
  [0.72, [255, 155, 0,   210]],
  [0.88, [255, 215, 60,  110]],
  [1.00, [255, 240, 180, 0  ]],
];

function fireColor(heat: number): [number, number, number, number] {
  const h = Math.max(0, Math.min(1, heat));
  for (let i = 1; i < FIRE_STOPS.length; i++) {
    if (h <= FIRE_STOPS[i][0]) {
      const t  = (h - FIRE_STOPS[i - 1][0]) / (FIRE_STOPS[i][0] - FIRE_STOPS[i - 1][0]);
      const lo = FIRE_STOPS[i - 1][1];
      const hi = FIRE_STOPS[i][1];
      return [
        Math.round(lo[0] + (hi[0] - lo[0]) * t),
        Math.round(lo[1] + (hi[1] - lo[1]) * t),
        Math.round(lo[2] + (hi[2] - lo[2]) * t),
        Math.round(lo[3] + (hi[3] - lo[3]) * t),
      ];
    }
  }
  return [255, 240, 180, 0];
}

// ── Render ────────────────────────────────────────────────────────
function renderBurn(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  burnMap: Float32Array,
  cols: number, rows: number,
  progress: number,
) {
  const imgData = ctx.createImageData(w, h);
  const px      = imgData.data;

  // Subtle time-based flicker so fire animates even between scroll events
  const flicker = Math.sin(Date.now() * 0.009) * 0.018;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const threshold = burnMap[r * cols + c];
      const diff      = threshold - progress + flicker;

      let pr: number, pg: number, pb: number, pa: number;

      if (diff <= 0) {
        // Fully burned → transparent (reveals white content behind canvas)
        pr = pg = pb = pa = 0;
      } else if (diff < FIRE_RANGE) {
        // Fire zone
        [pr, pg, pb, pa] = fireColor(1 - diff / FIRE_RANGE);
      } else {
        // Unburned → solid dark overlay
        pr = pg = pb = 8; pa = 255;
      }

      const x0 = c * CELL, y0 = r * CELL;
      const x1 = Math.min(x0 + CELL, w);
      const y1 = Math.min(y0 + CELL, h);

      for (let py = y0; py < y1; py++) {
        for (let qx = x0; qx < x1; qx++) {
          const i = (py * w + qx) * 4;
          px[i]     = pr;
          px[i + 1] = pg;
          px[i + 2] = pb;
          px[i + 3] = pa;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// ── Component ─────────────────────────────────────────────────────
interface BurnSectionProps {
  children: ReactNode;
  bgColor?: string;
}

export function BurnSection({ children, bgColor = "#f0ece4" }: BurnSectionProps) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const burnMapRef  = useRef<Float32Array | null>(null);
  const colsRef     = useRef(0);
  const rowsRef     = useRef(0);
  const rafRef      = useRef<number>(0);

  const redraw = useCallback(() => {
    const canvas  = canvasRef.current;
    const burnMap = burnMapRef.current;
    if (!canvas || !burnMap || !colsRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderBurn(ctx, canvas.width, canvas.height, burnMap, colsRef.current, rowsRef.current, progressRef.current);
  }, []);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    // Resize handler — rebuilds burn map when section dimensions change
    const setup = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width  = w;
      canvas.height = h;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;

      colsRef.current    = Math.ceil(w / CELL);
      rowsRef.current    = Math.ceil(h / CELL);
      burnMapRef.current = buildBurnMap(colsRef.current, rowsRef.current);
      redraw();
    };

    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(wrap);

    // Fire flicker loop — runs during the burn (between 0 and 1 progress)
    const flicker = () => {
      const p = progressRef.current;
      if (p > 0.01 && p < 0.99) redraw();
      rafRef.current = requestAnimationFrame(flicker);
    };
    rafRef.current = requestAnimationFrame(flicker);

    // Scroll-driven burn progress
    ScrollTrigger.create({
      trigger: wrap,
      start: "top 90%",
      end:   "top 5%",
      scrub: 1.8,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        redraw();
      },
    });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, { scope: wrapRef });

  return (
    <div ref={wrapRef} style={{ position: "relative", background: bgColor }}>
      {/* White content sits below the canvas */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>

      {/* Canvas overlay — dark until burned away, fire colors at boundary */}
      <canvas
        ref={canvasRef}
        style={{
          position:      "absolute",
          top:           0,
          left:          0,
          zIndex:        2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
