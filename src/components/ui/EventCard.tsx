"use client";

import { useRef } from "react";
import { usePageTransition } from "@/providers/TransitionProvider";
import { type Event } from "@/constants";
import { GlowCard } from "@/components/ui/GlowCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function EventCard({ event, glowColor = "blue", tableOnly = false }: { event: Event; glowColor?: "blue" | "orange"; tableOnly?: boolean }) {
  const { navigateTo } = usePageTransition();
  const priceLabel = event.price.toLowerCase();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        flex: "0 0 auto",
        width: "clamp(220px, 18vw, 286px)",
        cursor: "pointer",
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onClick={() => navigateTo(`/events/${event.slug}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <GlowCard glowColor={glowColor} style={{ height: "100%" }}>
        {/* Artwork */}
        <div style={{
          width: "100%",
          aspectRatio: "1080 / 1350",
          overflow: "hidden",
          borderRadius: 0,
          background: event.gradient,
          position: "relative",
          flexShrink: 0,
        }}>
          {event.artwork && (
            <img
              src={event.artwork}
              alt={event.artist}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{
            fontSize: "14px",
            letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 300,
            textTransform: "uppercase",
            lineHeight: "normal",
          }}>
            {event.date}
          </p>
          <p style={{
            fontSize: "16px",
            letterSpacing: "0.02em",
            color: "#fff",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 400,
            textTransform: "uppercase",
            lineHeight: "normal",
          }}>
            {event.artist}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!tableOnly && (
            <MagneticButton
              style={{ width: "100%" }}
              onClick={e => { e.stopPropagation(); navigateTo("/tickets"); }}
            >
              <div
                style={{
                  background: "#fff",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 0,
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "#000", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, textTransform: "uppercase", lineHeight: 1, margin: 0 }}>
                    BOOK TICKETS
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, textTransform: "uppercase", margin: 0 }}>
                    from {priceLabel}
                  </p>
                </div>
              </div>
            </MagneticButton>
          )}

          <MagneticButton
            style={{ width: "100%" }}
            onClick={e => { e.stopPropagation(); navigateTo("/book-vip"); }}
          >
            <div
              style={{
                background: "#101010",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#fff", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, textTransform: "uppercase", lineHeight: 1, margin: 0 }}>
                  BOOK TABLES
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, textTransform: "uppercase", margin: 0 }}>
                  from {priceLabel}
                </p>
              </div>
            </div>
          </MagneticButton>
        </div>
      </GlowCard>
    </div>
  );
}
