"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "./TransitionLink";
import { usePageTransition } from "@/providers/TransitionProvider";


gsap.registerPlugin(ScrollTrigger);

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

// ── Shutter hover text ─────────────────────────────────────────────────────────
function ShutterText({
  text, href, navigateTo, slats = 10,
}: {
  text: string; href: string; navigateTo: (href: string) => void; slats?: number;
}) {
  const spacerRef = useRef<HTMLSpanElement>(null);
  const [h, setH]           = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const measure = () => { if (spacerRef.current) setH(spacerRef.current.offsetHeight); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const textStyle: React.CSSProperties = {
    fontFamily: "var(--font-fenul, Georgia, serif)",
    fontWeight: 500,
    fontSize: "clamp(28px, 9vw, 140px)",
    letterSpacing: "-0.03em",
    lineHeight: 1,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
  const slatH = h / slats;

  return (
    <div
      style={{ position: "relative", cursor: "pointer", display: "inline-block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigateTo(href)}
    >
      <span ref={spacerRef} style={{ ...textStyle, visibility: "hidden", display: "block" }}>{text} →</span>
      {h > 0 && Array.from({ length: slats }, (_, i) => {
        const top   = i * slatH;
        const dir   = i % 2 === 0 ? "-110%" : "110%";
        const delay = `${i * 28}ms`;
        return (
          <div key={i} style={{ position: "absolute", top, left: 0, right: 0, height: slatH, overflow: "hidden" }}>
            <span style={{ ...textStyle, position: "absolute", top: -top, left: 0, color: "#fff",
              transform: hovered ? `translateY(${dir})` : "translateY(0)",
              transition: `transform 0.45s cubic-bezier(0.77,0,0.175,1) ${delay}` }}>{text} →</span>
            <span style={{ ...textStyle, position: "absolute", top: -top, left: 0, color: "#F5EFE3",
              transform: hovered ? "translateY(0)" : `translateY(${dir === "-110%" ? "110%" : "-110%"})`,
              transition: `transform 0.45s cubic-bezier(0.77,0,0.175,1) ${delay}` }}>{text} →</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const NAV_COL1 = [
  { label: "Calendar",     href: "/events"    },
  { label: "VIP",          href: "/book-vip"  },
  { label: "MICE",         href: "/mice"      },
];
const NAV_COL2 = [
  { label: "About Us",     href: "/about"        },
  { label: "Contact",      href: "/contact"      },
  { label: "Work With Us", href: "/work-with-us" },
];

// Easter egg sequences
const KONAMI        = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","KeyB","KeyA"];
const MALLORCA_SEQ  = ["KeyM","KeyA","KeyL","KeyL","KeyO","KeyR","KeyC","KeyA"];

const linkStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.16em",
  textDecoration: "none",
  color: "rgba(255,255,255,0.45)",
  fontFamily: "var(--font-saans, sans-serif)",
  fontWeight: 300,
  textTransform: "uppercase",
  transition: "color 0.25s",
  display: "inline-block",
};

// ── Footer ─────────────────────────────────────────────────────────────────────
export function Footer({ sentinelRef }: { sentinelRef?: React.RefObject<HTMLElement | null> } = {}) {
  const ref          = useRef<HTMLElement>(null);
  const splineWrap   = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const seq          = useRef<string[]>([]);
  const mallorcaSeq  = useRef<string[]>([]);
  const logoClicks   = useRef(0);
  const logoTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [egg,         setEgg]         = useState(false);   // Konami
  const [raveEgg,     setRaveEgg]     = useState(false);   // 7× logo clicks
  const [gpsEgg,      setGpsEgg]      = useState(false);   // type MALLORCA
  const [splineActive, setSplineActive] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const { navigateTo } = usePageTransition();
  const isMobile = useIsMobile();

  // ── Keyboard easter eggs ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Konami code
      seq.current = [...seq.current, e.code].slice(-KONAMI.length);
      if (seq.current.join() === KONAMI.join()) {
        setEgg(true);
        setTimeout(() => setEgg(false), 4500);
      }
      // Type "MALLORCA"
      mallorcaSeq.current = [...mallorcaSeq.current, e.code].slice(-MALLORCA_SEQ.length);
      if (mallorcaSeq.current.join() === MALLORCA_SEQ.join()) {
        setGpsEgg(true);
        setTimeout(() => setGpsEgg(false), 5000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Click logo 7× easter egg ──────────────────────────────────────────────
  const handleLogoClick = useCallback(() => {
    logoClicks.current += 1;
    clearTimeout(logoTimer.current);
    if (logoClicks.current >= 7) {
      logoClicks.current = 0;
      setRaveEgg(true);
      setTimeout(() => setRaveEgg(false), 4000);
    } else {
      logoTimer.current = setTimeout(() => { logoClicks.current = 0; }, 2500);
    }
  }, []);

  // ── Spline lazy mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = splineWrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSplineActive(true); io.disconnect(); } },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── Entrance animation: text rises in when footer is revealed ────────────
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const topGroup = content.querySelector<HTMLElement>(".ft-top");
    const bottomBar = content.querySelector<HTMLElement>(".ft-bottom");
    if (!topGroup || !bottomBar) return;

    gsap.set(ref.current,             { opacity: 0 });
    gsap.set([topGroup, bottomBar], { opacity: 0, y: 32 });

    const animate = () => {
      gsap.to(ref.current, { opacity: 1, duration: 0.5, ease: "power2.out" });
      const rule = content.querySelector<HTMLElement>(".ft-rule");
      if (rule) {
        gsap.set(rule, { scaleX: 0 });
        gsap.to(rule, { scaleX: 1, duration: 1.4, ease: "expo.out", transformOrigin: "left" });
      }
      gsap.to(topGroup,  { opacity: 1, y: 0, duration: 1.05, ease: "expo.out", delay: 0.12 });
      gsap.to(bottomBar, { opacity: 1, y: 0, duration: 0.9,  ease: "expo.out", delay: 0.3  });
    };

    // When a sentinel element is provided, use IntersectionObserver on it
    if (sentinelRef?.current) {
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { animate(); io.disconnect(); } },
        { threshold: 0.1 }
      );
      io.observe(sentinelRef.current);
      return () => io.disconnect();
    }

    // Fallback: scroll-position check (homepage — long page)
    // Bidirectional: reveals when near the bottom, hides when the user
    // scrolls significantly back up so it never overlaps the hero video.
    let triggered = false;
    let animatedIn = false;

    const check = () => {
      const fromBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);

      // Reveal: within 200 px of the page bottom
      if (fromBottom <= 200 && !triggered) {
        triggered = true;
        animatedIn = true;
        animate();
      }

      // Hide: user scrolled more than 600 px away from the bottom
      // (generous threshold prevents flickering at the boundary)
      if (fromBottom > 600 && triggered) {
        triggered = false;
        if (animatedIn) {
          gsap.to(ref.current, { opacity: 0, duration: 0.45, ease: "power2.in" });
        }
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [sentinelRef]);

  const hover = useCallback((color: string) => (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.color = color;
  }, []);

  return (
    <footer
      ref={ref}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: isMobile ? "auto" : "75vh",
        minHeight: isMobile ? "320px" : undefined,
        zIndex: 2,
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* ── Layer 0: Spline 3D scene ──────────────────────────────────────────── */}
      <div ref={splineWrap} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {splineActive && (
          <Spline
            scene="https://prod.spline.design/aees-oR2WPcVtFQ1/scene.splinecode"
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>

      {/* ── Layer 1: AMOK wordmark — height-capped so it never clashes with text ─ */}
      <div
        onClick={handleLogoClick}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
          pointerEvents: "auto",
          cursor: "default",
        }}
      >
        <img
          src="/Logos/AMOK FULL.svg"
          alt=""
          aria-hidden
          style={{
            height: "clamp(120px, 38vh, 380px)",
            width: "auto",
            maxWidth: "100vw",
            display: "block",
            opacity: logoHovered ? 0.14 : 0.08,
            filter: "brightness(0) invert(1)",
            transition: "opacity 0.6s ease",
          }}
        />
      </div>

      {/* ── Layer 2: Content — fades in on scroll ────────────────────────────── */}
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(32px, 5vw, 60px) clamp(24px, 5vw, 72px) clamp(20px, 3vw, 36px)",
        }}
      >
        {/* Top group: rule + BOOK TICKETS + NAVIGATE nav */}
        <div className="ft-top">
          <div className="ft-rule" style={{
            height: "1px",
            background: "rgba(255,255,255,0.12)",
            marginBottom: "clamp(28px, 4vw, 48px)",
          }} />

          {/* BOOK TICKETS row */}
          <div style={{ marginBottom: "clamp(28px, 4vw, 48px)" }}>
            <ShutterText text="Book Tickets" href="/events" navigateTo={navigateTo} />
          </div>

          {/* NAVIGATE + nav */}
          <div>
            <p style={{ ...linkStyle, color: "rgba(255,255,255,0.2)", marginBottom: "14px", fontSize: "9px", letterSpacing: "0.3em" }}>
              Navigate
            </p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? "10px 24px" : "10px 52px",
            }}>
              {[...NAV_COL1, ...NAV_COL2].map(({ label, href }) => (
                <TransitionLink key={label} href={href} style={linkStyle}
                  onMouseEnter={hover("rgba(255,255,255,0.9)")}
                  onMouseLeave={hover("rgba(255,255,255,0.45)")}>
                  {label}
                </TransitionLink>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="ft-bottom"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "clamp(16px, 3vw, 32px)",
            flexWrap: "wrap",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "clamp(14px, 2vw, 22px)",
          }}
        >
          <TransitionLink href="/terms" style={{ ...linkStyle, fontSize: "10px" }}
            onMouseEnter={hover("rgba(255,255,255,0.8)")} onMouseLeave={hover("rgba(255,255,255,0.45)")}>
            Terms
          </TransitionLink>
          <TransitionLink href="/privacy" style={{ ...linkStyle, fontSize: "10px" }}
            onMouseEnter={hover("rgba(255,255,255,0.8)")} onMouseLeave={hover("rgba(255,255,255,0.45)")}>
            Privacy
          </TransitionLink>
          <span style={{ ...linkStyle, fontSize: "10px", color: "rgba(255,255,255,0.2)", cursor: "default" }}>
            © {new Date().getFullYear()} AMOK Mallorca
          </span>
        </div>
      </div>

      {/* ── Easter egg overlays ───────────────────────────────────────────────── */}

      {/* 1. Konami code → "The party never ends" */}
      {egg && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.92)", animation: "ftFadeIn 0.3s ease",
        }}>
          <p style={{
            fontFamily: "var(--font-fenul, Georgia, serif)",
            fontSize: "clamp(28px, 5vw, 64px)",
            letterSpacing: "-0.02em", color: "#fff",
            textTransform: "uppercase", marginBottom: "16px",
          }}>
            The party never ends.
          </p>
          <p style={{
            fontSize: "11px", letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-saans, sans-serif)",
          }}>
            AMOK · MALLORCA · 39°34′N 2°39′E
          </p>
        </div>
      )}

      {/* 2. Click AMOK logo 7× → rave mode */}
      {raveEgg && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          animation: "ftRave 0.18s steps(1) infinite",
        }}>
          <p style={{
            fontFamily: "var(--font-fenul, Georgia, serif)",
            fontSize: "clamp(24px, 4.5vw, 60px)",
            letterSpacing: "-0.02em", color: "#fff",
            textTransform: "uppercase", marginBottom: "14px",
          }}>
            You found it.
          </p>
          <p style={{
            fontSize: "10px", letterSpacing: "0.35em",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-saans, sans-serif)",
            textTransform: "uppercase",
          }}>
            The music never stops.
          </p>
        </div>
      )}

      {/* 3. Type "MALLORCA" → GPS coordinates */}
      {gpsEgg && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.93)", animation: "ftFadeIn 0.3s ease",
        }}>
          <p style={{
            fontSize: "9px", letterSpacing: "0.45em",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "var(--font-saans, sans-serif)",
            textTransform: "uppercase", marginBottom: "22px",
          }}>
            You know where to find us.
          </p>
          <p style={{
            fontFamily: "var(--font-fenul, Georgia, serif)",
            fontSize: "clamp(22px, 4vw, 52px)",
            letterSpacing: "0.04em", color: "#fff",
            textTransform: "uppercase",
          }}>
            39°34′N 2°39′E
          </p>
          <p style={{
            fontSize: "9px", letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-saans, sans-serif)",
            textTransform: "uppercase", marginTop: "14px",
          }}>
            Palma de Mallorca
          </p>
        </div>
      )}

      <style>{`
        @keyframes ftFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ftRave {
          0%   { background: rgba(0,0,0,0.90); }
          20%  { background: rgba(18,0,36,0.92); }
          40%  { background: rgba(36,0,12,0.92); }
          60%  { background: rgba(0,12,36,0.92); }
          80%  { background: rgba(24,12,0,0.92); }
          100% { background: rgba(0,0,0,0.90); }
        }
      `}</style>
    </footer>
  );
}
