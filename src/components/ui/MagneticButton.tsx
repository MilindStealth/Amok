"use client";

import { useRef, ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number; // 0–1, how far the button moves towards cursor (default 0.1)
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function MagneticButton({ children, strength = 0.05, style, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        display: "inline-block",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
