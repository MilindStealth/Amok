"use client";

import { useRef, useCallback, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;  // degrees
  scale?: number;
}

/**
 * Card with 3D perspective tilt on mousemove.
 * Inner content can be wrapped in a div with [data-depth] for parallax layers.
 */
export function TiltCard({ children, className = "", maxTilt = 10, scale = 1.03 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotX = -y * maxTilt;
      const rotY = x * maxTilt;

      el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      el.style.transition = "transform 0.08s linear";

      // Inner parallax layers (elements with data-depth attribute)
      el.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth ?? "0.5");
        const tx = x * depth * 20;
        const ty = y * depth * 20;
        layer.style.transform = `translate(${tx}px, ${ty}px)`;
        layer.style.transition = "transform 0.1s linear";
      });
    },
    [maxTilt, scale]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    el.style.transition = "transform 0.6s cubic-bezier(.16,1,.3,1)";

    el.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
      layer.style.transform = "translate(0,0)";
      layer.style.transition = "transform 0.6s cubic-bezier(.16,1,.3,1)";
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
