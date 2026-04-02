"use client";

import { useState } from "react";
import { GlWaveArtwork } from "@/components/ui/GlWaveArtwork";
import { usePageTransition } from "@/providers/TransitionProvider";
import { type Event } from "@/constants";

// Lazy WebGL artwork — plain img until first hover to respect browser context limit
function EventArtwork({ src, alt }: { src: string; alt: string }) {
  const [activated, setActivated] = useState(false);
  const [hovered,   setHovered]   = useState(false);
  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      onMouseEnter={() => { setActivated(true); setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src} alt={alt}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
      />
      {activated && <GlWaveArtwork src={src} alt={alt} hovered={hovered} />}
    </div>
  );
}

export function EventCard({ event }: { event: Event }) {
  const { navigateTo } = usePageTransition();
  const priceLabel = event.price.toUpperCase();

  return (
    <div
      style={{ flex: "0 0 auto", width: "clamp(200px, 16vw, 250px)", cursor: "pointer" }}
      onClick={() => navigateTo(`/events/${event.slug}`)}
    >
      {/* Artwork */}
      <div style={{ width: "100%", aspectRatio: "4 / 5", overflow: "hidden", background: event.gradient, position: "relative" }}>
        {event.artwork
          ? <EventArtwork src={event.artwork} alt={event.artist} />
          : <div style={{ position: "absolute", inset: 0, background: event.gradient }} />
        }
      </div>

      {/* Info */}
      <div style={{ paddingTop: "12px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: "4px", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300 }}>
          {event.date}
        </p>
        <p style={{ fontSize: "14px", letterSpacing: "0.04em", color: "#fff", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, marginBottom: "12px" }}>
          {event.artist}
        </p>

        {/* Two buttons side by side */}
        <div style={{ display: "flex", gap: "6px" }}>
          {/* Book Tickets */}
          <div style={{ flex: 1, background: "#fff", padding: "8px 10px", cursor: "pointer", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#0a0806", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, letterSpacing: "0.05em", lineHeight: 1, whiteSpace: "nowrap" }}>
              BOOK TICKETS
            </p>
            <p style={{ fontSize: "12px", color: "rgba(10,8,6,0.5)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, letterSpacing: "0.05em", marginTop: "1px" }}>
              {priceLabel}
            </p>
          </div>

          {/* Book Tables */}
          <div style={{ flex: 1, background: "#1c1c1c", padding: "8px 10px", cursor: "pointer", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#fff", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, letterSpacing: "0.05em", lineHeight: 1, whiteSpace: "nowrap" }}>
              BOOK TABLES
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, letterSpacing: "0.05em", marginTop: "1px" }}>
              {priceLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
