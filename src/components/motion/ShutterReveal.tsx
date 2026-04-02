"use client";

import { useRef, useEffect, useState } from "react";

interface ShutterLineProps {
  text: string;
  style: React.CSSProperties;
  slats: number;
  revealed: boolean;
  lineDelay: number;
}

function ShutterLine({ text, style, slats, revealed, lineDelay }: ShutterLineProps) {
  const spacerRef = useRef<HTMLSpanElement>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (spacerRef.current) setH(spacerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const slatH = h / slats;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Invisible spacer — holds layout space */}
      <span
        ref={spacerRef}
        style={{ ...style, visibility: "hidden", display: "block", width: "100%" }}
      >
        {text}
      </span>

      {/* Slat strips — each clips a horizontal band of the text */}
      {h > 0 &&
        Array.from({ length: slats }, (_, i) => {
          const top = i * slatH;
          // Alternating start directions (blind effect)
          const from = i % 2 === 0 ? "110%" : "-110%";
          const delay = `${lineDelay + i * 30}ms`;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top,
                left: 0,
                right: 0,
                height: slatH,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  ...style,
                  position: "absolute",
                  top: -top,
                  left: 0,
                  right: 0,
                  display: "block",
                  width: "100%",
                  transform: revealed ? "translateY(0)" : `translateY(${from})`,
                  transition: `transform 0.7s cubic-bezier(0.77,0,0.175,1) ${delay}`,
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
    </div>
  );
}

interface ShutterRevealProps {
  lines: string[];
  style?: React.CSSProperties;
  slats?: number;
  /** Extra delay before animation starts (ms) */
  delay?: number;
}

/**
 * Reveals text with a shutter/blind effect when it enters the viewport.
 * Pass each visual line separately so slats align to rendered line heights.
 */
export function ShutterReveal({ lines, style = {}, slats = 8, delay = 0 }: ShutterRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {lines.map((text, i) => (
        <ShutterLine
          key={i}
          text={text}
          style={style}
          slats={slats}
          revealed={revealed}
          lineDelay={delay + i * 90}
        />
      ))}
    </div>
  );
}
