"use client";

import { useRef, useCallback, type ReactNode } from "react";
import gsap from "gsap";

const STRIPS = 7;

interface ShutterCardProps {
  /** The base image/background content */
  children: ReactNode;
  /** Content revealed on hover (sits behind the strips) */
  hoverContent?: ReactNode;
  className?: string;
  overlayColor?: string;
}

/**
 * Card with a venetian-blind / shutter hover reveal.
 * Inspired by the Framer ShutterHoverEffect component.
 *
 * Usage:
 *   <ShutterCard hoverContent={<p>More info</p>}>
 *     <img src="..." />
 *   </ShutterCard>
 */
export function ShutterCard({
  children,
  hoverContent,
  className = "",
  overlayColor = "rgba(8,8,8,0.92)",
}: ShutterCardProps) {
  const stripsRef = useRef<(HTMLDivElement | null)[]>([]);

  const enter = useCallback(() => {
    gsap.killTweensOf(stripsRef.current);
    gsap.to(stripsRef.current, {
      scaleY: 1,
      duration: 0.45,
      ease: "power3.out",
      stagger: { each: 0.05, from: "start" },
    });
  }, []);

  const leave = useCallback(() => {
    gsap.killTweensOf(stripsRef.current);
    gsap.to(stripsRef.current, {
      scaleY: 0,
      duration: 0.35,
      ease: "power3.in",
      stagger: { each: 0.04, from: "end" },
    });
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      {/* Base layer */}
      {children}

      {/* Venetian blind strips */}
      {Array.from({ length: STRIPS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { stripsRef.current[i] = el; }}
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(i / STRIPS) * 100}%`,
            height: `${100 / STRIPS}%`,
            background: overlayColor,
            transform: "scaleY(0)",
            transformOrigin: "top",
            zIndex: 2,
          }}
        />
      ))}

      {/* Hover reveal content (sits above strips) */}
      {hoverContent && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "1.5rem",
          }}
        >
          {hoverContent}
        </div>
      )}
    </div>
  );
}
