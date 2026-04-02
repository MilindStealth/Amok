"use client";

import { useState, useMemo, useRef } from "react";
import { EVENTS, type Event } from "@/constants";
import { Footer } from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/useIsMobile";
import { EventCard } from "@/components/ui/EventCard";

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function parseDate(dateStr: string): Date {
  const parts = dateStr.trim().split(/\s+/);
  const day   = parseInt(parts[1]);
  const month = MONTH_MAP[parts[2]];
  return new Date(2026, month, day);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekMonday(date: Date): string {
  const d    = new Date(date);
  const day  = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toDateKey(d);
}

function getMonthAbbr(date: Date): string {
  return ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][date.getMonth()];
}

function formatCardDate(date: Date): string {
  const days   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

// ── Empty date slot ───────────────────────────────────────────────────────────
function EmptyCard({ date }: { date: Date }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "22px 20px 20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "320px",
      position: "relative",
      background: "rgba(255,255,255,0.02)",
    }}>
      <p style={{
        fontSize: "10px",
        letterSpacing: "0.16em",
        color: "rgba(255,255,255,0.4)",
        fontFamily: "var(--font-saans, sans-serif)",
        fontWeight: 300,
        textTransform: "uppercase",
      }}>
        {formatCardDate(date)}
      </p>
      {/* Centred dash — no event indicator */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{
          width: "24px",
          height: "1px",
          background: "rgba(255,255,255,0.2)",
          display: "block",
        }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const isMobile = useIsMobile();
  const footerSentinelRef = useRef<HTMLDivElement>(null);

  const [activeMonth,    setActiveMonth]    = useState<string>("ALL");
  const [calendarMode,   setCalendarMode]   = useState<"live" | "full">("live");
  const [activeCategory, setActiveCategory] = useState<"all" | "night" | "sunset">("all");

  // Derive available months
  const months = useMemo(() => {
    const seen = new Set<string>();
    EVENTS.forEach(e => seen.add(getMonthAbbr(parseDate(e.date))));
    return Array.from(seen);
  }, []);

  // Build an event lookup by date key (respects category filter)
  const eventsByDate = useMemo(() => {
    const source = activeCategory === "all" ? EVENTS : EVENTS.filter(e => e.category === activeCategory);
    const map = new Map<string, Event[]>();
    source.forEach(e => {
      const k = toDateKey(parseDate(e.date));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return map;
  }, [activeCategory]);

  // Build weeks — either "live" (only event dates) or "full" (every date in range)
  const weeks = useMemo(() => {
    // Apply category + month filters
    const categoryFiltered = activeCategory === "all"
      ? EVENTS
      : EVENTS.filter(e => e.category === activeCategory);
    const filteredEvents = activeMonth === "ALL"
      ? categoryFiltered
      : categoryFiltered.filter(e => getMonthAbbr(parseDate(e.date)) === activeMonth);

    if (filteredEvents.length === 0) return [];

    const sorted = [...filteredEvents].sort((a, b) =>
      parseDate(a.date).getTime() - parseDate(b.date).getTime()
    );

    if (calendarMode === "live") {
      // ── LIVE: only event dates (original behaviour) ──────────────────────
      const weekMap = new Map<string, Event[]>();
      sorted.forEach(e => {
        const key = getWeekMonday(parseDate(e.date));
        if (!weekMap.has(key)) weekMap.set(key, []);
        weekMap.get(key)!.push(e);
      });

      return Array.from(weekMap.entries()).map(([key, events], i) => ({
        key,
        label: `Week ${i + 1}`,
        // Each slot: { date, events } — events always present in live mode
        slots: events.map(ev => ({ date: parseDate(ev.date), events: [ev] })),
      }));
    }

    // ── FULL: every calendar day from first to last event date in range ──────
    const firstDate = parseDate(sorted[0].date);
    const lastDate  = parseDate(sorted[sorted.length - 1].date);

    // Walk day-by-day
    const allDates: Date[] = [];
    const cursor = new Date(firstDate);
    while (cursor <= lastDate) {
      allDates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    // Filter by active month if not ALL
    const visibleDates = activeMonth === "ALL"
      ? allDates
      : allDates.filter(d => getMonthAbbr(d) === activeMonth);

    if (visibleDates.length === 0) return [];

    // Group by week
    const weekMap = new Map<string, Date[]>();
    visibleDates.forEach(d => {
      const key = getWeekMonday(d);
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(d);
    });

    return Array.from(weekMap.entries()).map(([key, dates], i) => ({
      key,
      label: `Week ${i + 1}`,
      slots: dates.map(d => ({
        date: d,
        events: eventsByDate.get(toDateKey(d)) ?? [],
      })),
    }));
  }, [activeMonth, calendarMode, activeCategory, eventsByDate]);

  return (
    <>
    <div style={{
      minHeight: "100vh",
      background: "#000",
      paddingTop: "clamp(90px, 10vw, 120px)",
      paddingBottom: "clamp(60px, 8vw, 120px)",
      paddingLeft: "clamp(24px, 5vw, 72px)",
      paddingRight: "clamp(24px, 5vw, 72px)",
      position: "relative",
      zIndex: 10,
    }}>

      {/* ── Title + filters — all centred ─────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(20px, 2.5vw, 32px)",
        marginBottom: "clamp(24px, 3vw, 40px)",
      }}>
        <h1 style={{
          fontFamily: "var(--font-fenul, Georgia, serif)",
          fontSize: "clamp(28px, 4vw, 56px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "#fff",
          textTransform: "uppercase",
          textAlign: "center",
          margin: 0,
        }}>
          Calendar
        </h1>

        {/* ── All filters in one row ──────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "100%",
        }}>

          {/* Calendar mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px" }}>
            {(["live", "full"] as const).map(mode => (
              <button
                key={mode}
                className="filter-btn"
                onClick={() => setCalendarMode(mode)}
                style={{
                  padding: "7px 14px",
                  background: calendarMode === mode ? "rgba(255,255,255,0.95)" : "transparent",
                  color: calendarMode === mode ? "#000" : "rgba(255,255,255,0.4)",
                  border: "none",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-saans, sans-serif)",
                  fontWeight: calendarMode === mode ? 400 : 300,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {mode === "live" ? "Live Dates" : "Full Calendar"}
              </button>
            ))}
          </div>

          {/* Category */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px" }}>
            {([
              { value: "all",    label: "All Events" },
              { value: "night",  label: "Iconic Nights" },
              { value: "sunset", label: "Sunset Parties" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                className="filter-btn"
                onClick={() => setActiveCategory(value)}
                style={{
                  padding: "7px 14px",
                  background: activeCategory === value ? "rgba(255,255,255,0.95)" : "transparent",
                  color: activeCategory === value ? "#000" : "rgba(255,255,255,0.4)",
                  border: "none",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-saans, sans-serif)",
                  fontWeight: activeCategory === value ? 400 : 300,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Month tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px", flexWrap: "wrap", justifyContent: "center" }}>
            {["ALL", ...months].map(m => (
              <button
                key={m}
                className="filter-btn"
                onClick={() => setActiveMonth(m)}
                style={{
                  padding: "7px 12px",
                  background: activeMonth === m ? "rgba(255,255,255,0.95)" : "transparent",
                  color: activeMonth === m ? "#000" : "rgba(255,255,255,0.45)",
                  border: "none",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-saans, sans-serif)",
                  fontWeight: activeMonth === m ? 400 : 300,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(activeMonth !== "ALL" || activeCategory !== "all" || calendarMode !== "live") && (
            <button
              className="filter-btn"
              onClick={() => { setActiveMonth("ALL"); setActiveCategory("all"); setCalendarMode("live"); }}
              style={{
                padding: "7px 14px",
                background: "transparent",
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "9px",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-saans, sans-serif)",
                fontWeight: 300,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "color 0.2s, border-color 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              × Clear
            </button>
          )}

        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "clamp(32px, 4vw, 56px)" }} />

      {/* ── Week groups ───────────────────────────────────────────────────── */}
      <div>
        {weeks.length === 0 && (
          <p style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "13px",
            letterSpacing: "0.15em",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 300,
            textTransform: "uppercase",
          }}>
            No events this month
          </p>
        )}

        {weeks.map(({ key, label, slots }) => (
          <div key={key} style={{ marginBottom: "clamp(40px, 5vw, 64px)" }}>
            {/* Week label */}
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 300,
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              {label}
            </p>

            {/* Cards grid */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(12px, 1.5vw, 20px)",
            }}>
              {slots.map(({ date, events }) =>
                events.length > 0
                  ? events.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))
                  : <EmptyCard key={toDateKey(date)} date={date} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div ref={footerSentinelRef} style={{ height: "1px", position: "relative", zIndex: 10 }} />
    <div style={{ height: isMobile ? "360px" : "76vh", position: "relative", zIndex: 10 }} />
    <Footer sentinelRef={footerSentinelRef} />
    </>
  );
}
