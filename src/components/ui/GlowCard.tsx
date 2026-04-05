"use client";

import { useRef, ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  glowColor?: "blue" | "orange";
  style?: React.CSSProperties;
}

const glowColorMap = {
  blue:   { base: 220, spread: 200 },
  orange: { base: 30,  spread: 200 },
};

// Injected once — uses element-relative --x/--y and --active to isolate each card.
const css = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-size: 100% 100%;
    background-position: 0 0;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    -webkit-mask-clip: padding-box, border-box;
    -webkit-mask-composite: destination-in;
    transition: opacity 0.25s ease;
    opacity: var(--active, 0);
  }
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, -999) * 1px) calc(var(--y, -999) * 1px),
      hsl(var(--hue, 210) 100% 50% / 0.9),
      transparent 100%
    );
    filter: brightness(2);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, -999) * 1px) calc(var(--y, -999) * 1px),
      hsl(0 100% 100% / 0.25),
      transparent 100%
    );
  }
`;

export function GlowCard({ children, glowColor = "blue", style }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { base, spread } = glowColorMap[glowColor];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width } = el.getBoundingClientRect();
    el.style.setProperty("--x",  (e.clientX - left).toFixed(1));
    el.style.setProperty("--y",  (e.clientY - top).toFixed(1));
    el.style.setProperty("--xp", ((e.clientX - left) / width).toFixed(3));
  };

  const handleMouseEnter = () => cardRef.current?.style.setProperty("--active", "1");
  const handleMouseLeave = () => cardRef.current?.style.setProperty("--active", "0");

  const cardStyle: React.CSSProperties & Record<string, unknown> = {
    "--base":           base,
    "--spread":         spread,
    "--radius":         "0",
    "--border":         "3",
    "--size":           "200",
    "--active":         "0",
    "--border-size":    "calc(var(--border, 3) * 1px)",
    "--spotlight-size": "calc(var(--size, 200) * 1px)",
    "--hue":            `calc(${base} + (var(--xp, 0) * ${spread}))`,
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, -999) * 1px) calc(var(--y, -999) * 1px),
      hsl(var(--hue) 100% 70% / calc(0.12 * var(--active, 0))),
      transparent
    )`,
    backgroundColor:    "transparent",
    backgroundSize:     "100% 100%",
    backgroundPosition: "0 0",
    border:             "var(--border-size) solid rgba(255,255,255,0.08)",
    borderRadius:       "calc(var(--radius) * 1px)",
    position:           "relative",
    touchAction:        "none",
    display:            "flex",
    flexDirection:      "column",
    gap:                "20px",
    padding:            "10px",
    boxShadow:          "0 1rem 2rem -1rem black",
    backdropFilter:     "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    ...style,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={cardRef}
        data-glow
        style={cardStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </>
  );
}
