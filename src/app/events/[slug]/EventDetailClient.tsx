"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageTransition } from "@/providers/TransitionProvider";
import { Footer } from "@/components/layout/Footer";
import type { Event } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

// ── Supplemental per-event data ────────────────────────────────────────────────
const EVENT_EXTRAS: Record<string, {
  description: string;
  lineup: { name: string; time: string; stage?: string }[];
  ticketTiers: { label: string; price: string; perks: string[]; soldOut?: boolean; popular?: boolean }[];
  soldPct: number; // 0-100
  totalSold: string;
}> = {
  bumbum: {
    description:
      "BUMBUM makes his AMOK debut in a night curated by Grupo Icon — the collective reshaping urban music in Spain. Expect pulsing reggaeton, raw trap energy, and a crowd that moves as one. Limited capacity. Doors open 23:00.",
    lineup: [
      { name: "BUMBUM", time: "02:00 – 05:00", stage: "Main Room" },
      { name: "DJ NANDITA", time: "00:30 – 02:00", stage: "Main Room" },
      { name: "JUNIOR FLEX", time: "23:00 – 00:30", stage: "Main Room" },
    ],
    ticketTiers: [
      { label: "Early Bird", price: "€15", perks: ["General access", "Welcome drink"], soldOut: true },
      { label: "General Admission", price: "€20", perks: ["General access", "Priority entry"], popular: true },
      { label: "Premium", price: "€35", perks: ["Front-of-stage area", "Premium bar access", "Coat check"] },
    ],
    soldPct: 88,
    totalSold: "2,847",
  },
  mentiroso: {
    description:
      "Semana Santa meets euphoria. Mentiroso brings his signature Uno No Basta show to AMOK's main stage — a collision of pop instinct and electronic production that leaves no one standing still.",
    lineup: [
      { name: "MENTIROSO", time: "02:00 – 05:00", stage: "Main Stage" },
      { name: "RAISA", time: "00:30 – 02:00", stage: "Main Stage" },
      { name: "CXLVX", time: "23:00 – 00:30", stage: "Main Stage" },
    ],
    ticketTiers: [
      { label: "Early Bird", price: "€10", perks: ["General access"], soldOut: true },
      { label: "General Admission", price: "€15", perks: ["General access", "Priority entry"], popular: true },
      { label: "Premium", price: "€28", perks: ["Elevated viewing area", "Premium bar", "Coat check"] },
    ],
    soldPct: 74,
    totalSold: "1,920",
  },
  "fiesta-primavera": {
    description:
      "Mallorca's finest spring ritual. Los Suruba, Thomas Patrik, and Belucha take over the terrace for an open-air session from dusk until midnight. Organic house, Afro rhythms, and the golden hour you can't get anywhere else.",
    lineup: [
      { name: "LOS SURUBA", time: "21:00 – 23:30", stage: "Terrace" },
      { name: "THOMAS PATRIK", time: "19:30 – 21:00", stage: "Terrace" },
      { name: "BELUCHA", time: "18:30 – 19:30", stage: "Terrace" },
    ],
    ticketTiers: [
      { label: "Early Bird", price: "€15", perks: ["Terrace access"], soldOut: true },
      { label: "General Admission", price: "€20", perks: ["Terrace access", "Welcome cocktail"], popular: true },
      { label: "Sunset VIP", price: "€45", perks: ["Reserved terrace table", "Bottle service", "Sunset priority view"] },
    ],
    soldPct: 61,
    totalSold: "1,340",
  },
  "dj-koze": {
    description:
      "A rare Mallorca appearance from one of electronic music's most revered figures. DJ Koze curates an afternoon of cosmic, unpredictable sounds on the main terrace — sunsets and surprises guaranteed.",
    lineup: [
      { name: "DJ KOZE", time: "19:00 – 23:00", stage: "Main Terrace" },
      { name: "MATHEW JONSON", time: "16:00 – 19:00", stage: "Main Terrace" },
      { name: "SONJA MOONEAR", time: "14:00 – 16:00", stage: "Main Terrace" },
    ],
    ticketTiers: [
      { label: "Early Bird", price: "€40", perks: ["General terrace access"], soldOut: true },
      { label: "General Admission", price: "€55", perks: ["General terrace access", "Programme booklet"], popular: true },
      { label: "Pampa Premium", price: "€90", perks: ["Reserved lounge seat", "Champagne on arrival", "Backstage pass"] },
    ],
    soldPct: 52,
    totalSold: "980",
  },
  adriatique: {
    description:
      "Siamese Presents brings Adriatique to the Poolside Stage for a session of melodic techno and hypnotic house. As night falls over the water, let the Swiss duo take you somewhere else entirely.",
    lineup: [
      { name: "ADRIATIQUE", time: "01:00 – 05:00", stage: "Poolside Stage" },
      { name: "&ME", time: "23:00 – 01:00", stage: "Poolside Stage" },
      { name: "KEINEMUSIK", time: "21:00 – 23:00", stage: "Poolside Stage" },
    ],
    ticketTiers: [
      { label: "Early Bird", price: "€30", perks: ["General access"], soldOut: true },
      { label: "General Admission", price: "€45", perks: ["General access", "Poolside wristband"], popular: true },
      { label: "Pool VIP", price: "€80", perks: ["Private pool cabana", "Bottle service", "Dedicated host"] },
    ],
    soldPct: 43,
    totalSold: "820",
  },
  folamour: {
    description:
      "Watch the sun rise with Folamour as he blends disco gold, deep soul, and euphoric house on the Sunrise Deck. L'Imposteur's signature all-night sets have become the stuff of legend — this one starts before dawn.",
    lineup: [
      { name: "FOLAMOUR", time: "05:00 – 09:00", stage: "Sunrise Deck" },
      { name: "JAYDA G", time: "02:00 – 05:00", stage: "Sunrise Deck" },
      { name: "HONEY DIJON", time: "23:00 – 02:00", stage: "Sunrise Deck" },
    ],
    ticketTiers: [
      { label: "Early Bird", price: "€25", perks: ["General access"], soldOut: true },
      { label: "General Admission", price: "€40", perks: ["General access", "Sunrise programme"], popular: true },
      { label: "Sunrise Premium", price: "€70", perks: ["Deck lounge access", "Breakfast on arrival", "Dedicated bar"] },
    ],
    soldPct: 38,
    totalSold: "710",
  },
};

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(dateStr: string) {
  // Parse date like "SAT 28 MAR" → nearest future occurrence
  const getTarget = useCallback(() => {
    const months: Record<string, number> = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
    };
    const parts = dateStr.split(" ").filter(Boolean);
    const day = parseInt(parts[1], 10);
    const month = months[parts[2]] ?? 0;
    const now = new Date();
    let year = now.getFullYear();
    const d = new Date(year, month, day, 23, 0, 0);
    if (d < now) d.setFullYear(year + 1);
    return d;
  }, [dateStr]);

  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = getTarget().getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [getTarget]);

  return time;
}

// ── VIP Floorplan ─────────────────────────────────────────────────────────────
function VIPFloorplan() {
  const { navigateTo } = usePageTransition();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        position: "relative",
      }}>
        <img
          src="/VIP/VIP MAP.webp"
          alt="VIP table map"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.1em", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300 }}>
          Bottle service · Dedicated host · Priority access
        </p>
        <button
          onClick={() => navigateTo("/book-vip")}
          style={{
            background: "#D4A560",
            color: "#000",
            border: "none",
            padding: "10px 22px",
            fontSize: "9px",
            letterSpacing: "0.2em",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 400,
            textTransform: "uppercase",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Reserve a Table
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function extractEventTime(venue: string): string {
  const range = venue.match(/(\d{1,2}[:.]?\d{2})\s*[–\-]\s*(\d{1,2}[:.]?\d{2})/);
  if (range) return `${range[1].replace(".", ":")} – ${range[2].replace(".", ":")}`;
  const from = venue.match(/[Ff]rom\s+(\d{1,2}[:.]?\d{2})/);
  if (from) return `From ${from[1].replace(".", ":")}`;
  return "Doors 23:00";
}

export function EventDetailClient({ event }: { event: Event }) {
  const extras = EVENT_EXTRAS[event.slug] ?? EVENT_EXTRAS["bumbum"];
  const { navigateTo } = usePageTransition();
  const isMobile = useIsMobile();

  const stickyRef         = useRef<HTMLDivElement>(null);
  const mainRef           = useRef<HTMLDivElement>(null);
  const footerSentinelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!mainRef.current || !stickyRef.current) return;
    ScrollTrigger.create({
      trigger: mainRef.current,
      start: "top -120px",
      onEnter: () => gsap.to(stickyRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }),
      onLeaveBack: () => gsap.to(stickyRef.current, { y: -80, opacity: 0, duration: 0.3, ease: "power2.in" }),
    });
  }, []);

  const time = extractEventTime(event.venue);

  return (
    <>
    <div style={{ background: "#000000", minHeight: "100vh", color: "#fff", position: "relative", zIndex: 10 }}>

      {/* ── Sticky booking bar ─────────────────────────────────────────── */}
      <div
        ref={stickyRef}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 200,
          transform: "translateY(-80px)",
          opacity: 0,
          background: "rgba(8,8,8,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 clamp(24px, 5vw, 72px)",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", minWidth: 0, overflow: "hidden" }}>
          <span style={{ fontSize: isMobile ? "13px" : "15px", letterSpacing: "0.08em", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.artist}</span>
          {!isMobile && <><span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", letterSpacing: "0.06em", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300 }}>{event.date}</span></>}
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {!isMobile && (
            <button
              onClick={() => navigateTo("/book-vip")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.7)",
                padding: "9px 18px",
                fontSize: "9px",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Book Tables
            </button>
          )}
          <button
            onClick={() => navigateTo("/tickets")}
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#000",
              border: "none",
              padding: "9px 18px",
              fontSize: "9px",
              letterSpacing: "0.18em",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 400,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Buy Tickets
          </button>
        </div>
      </div>

      {/* ── Main two-column layout ─────────────────────────────────────── */}
      <div
        ref={mainRef}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "clamp(240px, 22vw, 320px) 1fr",
          gap: "clamp(32px, 4vw, 64px)",
          padding: "clamp(100px, 12vw, 140px) clamp(24px, 5vw, 72px) clamp(60px, 8vw, 100px)",
          alignItems: "start",
        }}
      >
        {/* ── Left column: artwork + event info ───────────────────────── */}
        <div>
          {/* Artwork portrait */}
          <div style={{
            width: isMobile ? "60%" : "100%",
            aspectRatio: "3 / 4",
            overflow: "hidden",
            marginBottom: "28px",
            background: event.gradient,
          }}>
            {event.artwork && (
              <img
                src={event.artwork}
                alt={event.artist}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                }}
              />
            )}
          </div>

          {/* Date */}
          <p style={{
            fontSize: "10px",
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 300,
            textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            {event.date}
          </p>

          {/* Artist name */}
          <h1 style={{
            fontFamily: "var(--font-fenul, Georgia, serif)",
            fontSize: "clamp(22px, 2.8vw, 38px)",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            color: "#fff",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}>
            {event.artist}
          </h1>

          {/* Time */}
          <p style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 300,
            marginBottom: "20px",
          }}>
            {time}
          </p>

          {/* Description */}
          <p style={{
            fontSize: "13px",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 300,
          }}>
            {extras.description}
          </p>
        </div>

        {/* ── Right column: tickets + VIP floorplan ───────────────────── */}
        <div>
          {/* Ticket options */}
          <div style={{ marginBottom: "clamp(48px, 6vw, 80px)" }}>
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 300,
              textTransform: "uppercase",
              marginBottom: "10px",
            }}>
              Ticket Options
            </p>
            <h2 style={{
              fontFamily: "var(--font-fenul, Georgia, serif)",
              fontSize: "clamp(24px, 3vw, 40px)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#fff",
              textTransform: "uppercase",
              margin: "0 0 32px",
            }}>
              Choose Your Experience
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "1px",
            }}>
              {extras.ticketTiers.map((tier) => (
                <div
                  key={tier.label}
                  style={{
                    position: "relative",
                    background: tier.popular ? "rgba(212,165,96,0.06)" : "#0c0c0c",
                    border: tier.popular
                      ? "1px solid rgba(212,165,96,0.35)"
                      : "1px solid rgba(255,255,255,0.06)",
                    padding: "28px 22px 22px",
                    opacity: tier.soldOut ? 0.55 : 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {tier.popular && (
                    <div style={{
                      position: "absolute",
                      top: "-1px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#D4A560",
                      color: "#000",
                      fontSize: "8px",
                      letterSpacing: "0.18em",
                      fontFamily: "var(--font-saans, sans-serif)",
                      fontWeight: 400,
                      padding: "3px 12px",
                      textTransform: "uppercase",
                    }}>
                      Most Popular
                    </div>
                  )}

                  <p style={{
                    fontSize: "9px",
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-saans, sans-serif)",
                    fontWeight: 300,
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}>
                    {tier.label}
                    {tier.soldOut && (
                      <span style={{ marginLeft: "8px", color: "rgba(255,255,255,0.25)" }}>— Sold Out</span>
                    )}
                  </p>

                  <p style={{
                    fontSize: "clamp(24px, 2.5vw, 32px)",
                    fontWeight: 300,
                    letterSpacing: "-0.02em",
                    color: tier.popular ? "#D4A560" : "#fff",
                    fontFamily: "var(--font-fenul, Georgia, serif)",
                    marginBottom: "20px",
                  }}>
                    {tier.price}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                    {tier.perks.map((perk) => (
                      <li key={perk} style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "11px",
                        letterSpacing: "0.04em",
                        fontFamily: "var(--font-saans, sans-serif)",
                        fontWeight: 300,
                        padding: "5px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        <span style={{ color: tier.popular ? "#D4A560" : "rgba(255,255,255,0.3)", fontSize: "8px" }}>✓</span>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !tier.soldOut && navigateTo("/tickets")}
                    disabled={tier.soldOut}
                    style={{
                      width: "100%",
                      padding: "10px 8px",
                      background: tier.soldOut
                        ? "transparent"
                        : tier.popular
                        ? "rgba(212,165,96,0.9)"
                        : "rgba(255,255,255,0.92)",
                      color: tier.soldOut
                        ? "rgba(255,255,255,0.2)"
                        : "#000",
                      border: tier.soldOut ? "1px solid rgba(255,255,255,0.1)" : "none",
                      fontSize: "9px",
                      letterSpacing: "0.18em",
                      fontFamily: "var(--font-saans, sans-serif)",
                      fontWeight: 400,
                      textTransform: "uppercase",
                      cursor: tier.soldOut ? "default" : "pointer",
                    }}
                  >
                    {tier.soldOut ? "Sold Out" : "Select →"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* VIP Floorplan */}
          {event.hasVIP && (
            <div>
              <p style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                color: "rgba(212,165,96,0.6)",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                textTransform: "uppercase",
                marginBottom: "10px",
              }}>
                VIP Experience
              </p>
              <h2 style={{
                fontFamily: "var(--font-fenul, Georgia, serif)",
                fontSize: "clamp(24px, 3vw, 40px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#fff",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}>
                Reserve Your Table
              </h2>
              <p style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                marginBottom: "28px",
              }}>
                Select your preferred table — our team confirms within the hour.
              </p>
              <VIPFloorplan />
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "0 clamp(24px, 5vw, 72px)" }} />

      {/* ── Lineup ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 72px)" }}>
        <p style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "var(--font-saans, sans-serif)",
          fontWeight: 300,
          textTransform: "uppercase",
          marginBottom: "10px",
        }}>
          Lineup
        </p>
        <h2 style={{
          fontFamily: "var(--font-fenul, Georgia, serif)",
          fontSize: "clamp(24px, 3vw, 40px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "#fff",
          textTransform: "uppercase",
          margin: "0 0 32px",
        }}>
          Artists
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {extras.lineup.map((artist, i) => (
            <div key={artist.name} style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "28px 1fr auto" : "36px 1fr auto auto",
              alignItems: "center",
              gap: isMobile ? "12px" : "24px",
              padding: "20px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.1em",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{
                fontSize: "clamp(16px, 2vw, 26px)",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}>
                {artist.name}
              </span>
              {artist.stage && !isMobile && (
                <span style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em",
                  fontFamily: "var(--font-saans, sans-serif)",
                  fontWeight: 300,
                  background: "rgba(255,255,255,0.05)",
                  padding: "3px 10px",
                  textTransform: "uppercase",
                }}>
                  {artist.stage}
                </span>
              )}
              <span style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                letterSpacing: "0.04em",
              }}>
                {artist.time}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <section style={{
        padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 72px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.25)",
          fontFamily: "var(--font-saans, sans-serif)",
          fontWeight: 300,
          textTransform: "uppercase",
        }}>
          Don&apos;t Miss Out
        </p>
        <h2 style={{
          fontFamily: "var(--font-fenul, Georgia, serif)",
          fontSize: "clamp(32px, 5vw, 72px)",
          fontWeight: 500,
          letterSpacing: "-0.03em",
          lineHeight: 0.95,
          color: "#fff",
          textTransform: "uppercase",
          margin: 0,
        }}>
          {event.artist}
          <br />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.55em", letterSpacing: "0.02em" }}>{event.date} · AMOK</span>
        </h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigateTo("/tickets")}
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#000",
              border: "none",
              padding: "12px 32px",
              fontSize: "9px",
              letterSpacing: "0.18em",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 400,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Buy Tickets
          </button>
          {event.hasVIP && (
            <button
              onClick={() => navigateTo("/book-vip")}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "12px 32px",
                fontSize: "9px",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Book Tables
            </button>
          )}
        </div>
      </section>

    </div>
    {/* Sentinel + transparent spacer — outside the black-bg div so footer shows through */}
    <div ref={footerSentinelRef} style={{ height: "1px", position: "relative", zIndex: 10 }} />
    <div style={{ height: isMobile ? "360px" : "76vh", position: "relative", zIndex: 10 }} />
    <Footer sentinelRef={footerSentinelRef} />
    </>
  );
}
