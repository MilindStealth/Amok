"use client";

import React, { useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageTransition } from "@/providers/TransitionProvider";
import { EVENTS, type Event } from "@/constants";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { ShutterReveal } from "@/components/motion/ShutterReveal";
import { Footer } from "@/components/layout/Footer";
import { GallerySection } from "@/components/sections/GallerySection";
import { SocialsSection } from "@/components/sections/SocialsSection";
import { EventCard } from "@/components/ui/EventCard";
import dynamic from "next/dynamic";
// import { BurnTransitionOverlay } from "@/components/ui/BurnTransitionOverlay"; // commented out

const ModelViewer = dynamic(
  () => import("@/components/sections/ModelViewer").then(m => m.ModelViewer),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger);

// ── Running Stroke Button — conic gradient arc orbits a sharp-cornered button ─
// Matches the Framer "Running Stroke" component: spinning gradient behind a solid
// fill, clipped to 1px padding so only the border area shows the moving arc.
function RunningStrokeButton({
  children,
  forwardedRef,
  onClick,
  style,
}: {
  children: React.ReactNode;
  forwardedRef?: React.Ref<HTMLButtonElement>;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      ref={forwardedRef}
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "1px",          // the visible "border" thickness
        background: "transparent",
        border: "none",
        borderRadius: 0,
        cursor: "pointer",
        ...style,
      }}
    >
      {/* Oversized spinning conic gradient — only the 1px padding reveals it */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          top: "50%",
          left: "50%",
          pointerEvents: "none",
          background: "conic-gradient(from 0deg, transparent 320deg, rgba(255,255,255,0.95) 355deg, transparent 360deg)",
          animation: "rs-spin 2.4s linear infinite",
        }}
      />
      {/* Solid fill — hides the gradient interior, leaving only the border arc */}
      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          padding: "10px 20px",
          zIndex: 1,
          fontSize: "11px",
          letterSpacing: "0.22em",
          fontFamily: "var(--font-saans, sans-serif)",
          fontWeight: 300,
          color: "#fff",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <style>{`@keyframes rs-spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }`}</style>
    </button>
  );
}

// ── MICE images ────────────────────────────────────────────────────────────────
const MICE_IMAGES = [
  { src: "/MICE/micey.png",   alt: "Venue floor" },
  { src: "/MICE/micey 1.png", alt: "Venue bar" },
  { src: "/MICE/micey 2.png", alt: "Venue stage" },
  { src: "/MICE/micey 3.png", alt: "Venue lounge" },
];

// ── Dark-card "BOOK TICKETS" button ────────────────────────────────────────────
// Default: solid white fill, dark icon + text (as per design).
// Hover:   RunningStrokeButton style — spinning conic arc border, black fill.
function CardBookButton({ price }: { price: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "1px",
        cursor: "pointer",
        background: hovered ? "transparent" : "#fff",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Hover only: spinning conic arc border ── */}
      {hovered && (
        <span aria-hidden style={{
          position: "absolute",
          width: "400px", height: "400px",
          top: "50%", left: "50%",
          pointerEvents: "none",
          background: "conic-gradient(from 0deg, transparent 320deg, rgba(255,255,255,0.95) 355deg, transparent 360deg)",
          animation: "rs-spin 2.4s linear infinite",
        }} />
      )}

      {/* Inner content row */}
      <span style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "10px",
        background: hovered ? "#000" : "#fff",
        padding: "11px 14px",
        zIndex: 1,
        fontSize: "10px",
        letterSpacing: hovered ? "0.22em" : "0.13em",
        fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300,
        color: hovered ? "#fff" : "#0a0806",
        whiteSpace: "nowrap",
        transition: "background 0.2s, color 0.2s, letter-spacing 0.3s",
      }}>
        <img
          src="/Logos/AMOK SIGN.svg"
          alt=""
          style={{
            width: "16px", height: "auto", flexShrink: 0,
            filter: hovered ? "none" : "invert(1)",
            transition: "filter 0.2s",
          }}
        />
        BOOK TICKETS FOR {price}
      </span>
    </div>
  );
}

// ── Sunset-card "BOOK TICKETS" button ──────────────────────────────────────────
// Default: solid black fill, white icon + text (light bg section).
// Hover:   RunningStrokeButton style — spinning conic arc border, black fill.
function SunsetCardBookButton({ price }: { price: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "1px",
        cursor: "pointer",
        background: "#000",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover only: spinning conic arc border */}
      {hovered && (
        <span aria-hidden style={{
          position: "absolute",
          width: "400px", height: "400px",
          top: "50%", left: "50%",
          pointerEvents: "none",
          background: "conic-gradient(from 0deg, transparent 320deg, rgba(255,255,255,0.95) 355deg, transparent 360deg)",
          animation: "rs-spin 2.4s linear infinite",
        }} />
      )}

      <span style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "10px",
        background: "#000",
        padding: "11px 14px",
        zIndex: 1,
        fontSize: "10px",
        letterSpacing: hovered ? "0.22em" : "0.13em",
        fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300,
        color: "#fff",
        whiteSpace: "nowrap",
        transition: "letter-spacing 0.3s",
      }}>
        <img src="/Logos/AMOK SIGN.svg" alt="" style={{ width: "16px", height: "auto", flexShrink: 0 }} />
        BOOK TICKETS FOR {price}
      </span>
    </div>
  );
}

// ── Apple-style slider prev/next buttons ───────────────────────────────────────
function SliderControls({ onPrev, onNext, dark, prevDisabled = false, nextDisabled = false }: { onPrev: () => void; onNext: () => void; dark: boolean; prevDisabled?: boolean; nextDisabled?: boolean }) {
  const base: React.CSSProperties = {
    width: 56, height: 56, borderRadius: "50%",
    border: `1px solid ${dark ? "rgba(255,255,255,0.55)" : "rgba(10,8,6,0.3)"}`,
    background: dark ? "rgba(255,255,255,0.1)" : "rgba(10,8,6,0.06)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: dark ? "#ffffff" : "rgba(10,8,6,0.8)",
    transition: "border-color 0.25s, color 0.25s, background 0.25s, opacity 0.25s",
    flexShrink: 0,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };
  const hoverIn = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.borderColor = dark ? "#ffffff" : "rgba(10,8,6,0.6)";
    el.style.color = dark ? "#fff" : "#000000";
    el.style.background = dark ? "rgba(255,255,255,0.2)" : "rgba(10,8,6,0.1)";
  };
  const hoverOut = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.borderColor = dark ? "rgba(255,255,255,0.55)" : "rgba(10,8,6,0.3)";
    el.style.color = dark ? "#ffffff" : "rgba(10,8,6,0.8)";
    el.style.background = dark ? "rgba(255,255,255,0.1)" : "rgba(10,8,6,0.06)";
  };
  return (
    <div style={{ display: "flex", gap: "14px", flexShrink: 0 }}>
      <button
        style={{ ...base, opacity: prevDisabled ? 0.28 : 1, cursor: prevDisabled ? "default" : "pointer", pointerEvents: prevDisabled ? "none" : "auto" }}
        onClick={onPrev} onMouseEnter={hoverIn} onMouseLeave={hoverOut} aria-label="Previous" disabled={prevDisabled}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        style={{ ...base, opacity: nextDisabled ? 0.28 : 1, cursor: nextDisabled ? "default" : "pointer", pointerEvents: nextDisabled ? "none" : "auto" }}
        onClick={onNext} onMouseEnter={hoverIn} onMouseLeave={hoverOut} aria-label="Next" disabled={nextDisabled}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}


// ── Subscribe Form ─────────────────────────────────────────────────────────────
function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "11px",
    letterSpacing: "0.22em",
    fontFamily: "var(--font-saans, sans-serif)",
    fontWeight: 300,
    padding: "14px 0",
    outline: "none",
    width: "100%",
  };

  if (submitted) {
    return (
      <p style={{ color: "#c9ff47", fontSize: "12px", letterSpacing: "0.22em", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, textTransform: "uppercase" }}>
        YOU'RE ON THE LIST
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "420px", margin: "0 auto" }}>
      <input type="email" required placeholder="EMAIL ADDRESS" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <input type="tel" placeholder="PHONE NUMBER (OPTIONAL)" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
      <div style={{ marginTop: "8px" }}>
        <RunningStrokeButton style={{ width: "100%" }}>SUBSCRIBE</RunningStrokeButton>
      </div>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { navigateTo } = usePageTransition();
  const videoRef    = useRef<HTMLVideoElement>(null);
  const logoRef     = useRef<HTMLImageElement>(null);
  const bookNowRef  = useRef<HTMLButtonElement>(null);
  const foldRef      = useRef<HTMLDivElement>(null);
  const miceRef      = useRef<HTMLElement>(null);
  const miceGridRef    = useRef<HTMLDivElement>(null);
  const miceArchRef    = useRef<HTMLDivElement>(null);
  const isFirstRun     = useRef(true);

  const miceTextRef        = useRef<HTMLDivElement>(null);
  const nightCardsRef      = useRef<HTMLDivElement>(null);
  const sunsetCardsRef     = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [nightHovered,  setNightHovered]  = useState(false);
  const [sunsetHovered, setSunsetHovered] = useState(false);
  const [cursorPos,     setCursorPos]     = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState<"night" | "sunset" | null>(null);
  const [miceActiveIdx, setMiceActiveIdx] = useState(0);
  const [nightArrows,  setNightArrows]  = useState({ prevDisabled: true,  nextDisabled: false });
  const [sunsetArrows, setSunsetArrows] = useState({ prevDisabled: true,  nextDisabled: false });


  // ── Reset scroll + arrow state when returning to default or switching section ──
  useEffect(() => {
    if (activeSection === null) {
      // Reset both sliders to start when closing
      if (nightCardsRef.current)  { nightCardsRef.current.scrollLeft  = 0; }
      if (sunsetCardsRef.current) { sunsetCardsRef.current.scrollLeft = 0; }
      setNightArrows({ prevDisabled: true, nextDisabled: false });
      setSunsetArrows({ prevDisabled: true, nextDisabled: false });
    } else if (activeSection === "night") {
      // Night is RTL — default scroll is at the rightmost end, so "prev" (go right) is disabled
      const el = nightCardsRef.current;
      if (el) {
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
        setNightArrows({ prevDisabled: el.scrollLeft <= 2, nextDisabled: atEnd });
      }
    } else if (activeSection === "sunset") {
      const el = sunsetCardsRef.current;
      if (el) {
        setNightArrows({ prevDisabled: true, nextDisabled: false });
        setSunsetArrows({ prevDisabled: el.scrollLeft <= 2, nextDisabled: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 });
      }
    }
  }, [activeSection]);

  // ── Preload MICE images + force background-clip repaint on active change ──
  // background-clip:text caches its composited layer; directly patching the
  // style + triggering a reflow is the only reliable cross-browser repaint.
  useEffect(() => {
    MICE_IMAGES.forEach(({ src }) => { const i = new Image(); i.src = src; });
  }, []);


  useEffect(() => {
    const logo    = logoRef.current;
    const bookNow = bookNowRef.current;
    const fold      = foldRef.current;
    const mice      = miceRef.current;
    const miceGrid  = miceGridRef.current;

    if (!logo || !bookNow || !fold || !mice || !miceGrid) return;

    // ── Main init — runs on load and on resize ─────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout>;

    function init() {
      ScrollTrigger.getAll().forEach((st) => st.kill());

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const navLeft  = document.querySelector(".nav-item-left")  as HTMLElement | null;
      const navRight = document.querySelector(".nav-item-right") as HTMLElement | null;

      const initW  = Math.max(76, Math.min(vw * 0.085, 108));
      const initH  = initW * (139 / 135);
      const finalW = 34;
      const finalH = finalW * (139 / 135);
      const videoH = vh * 0.68;

      const firstRun = isFirstRun.current;

      if (firstRun) {
        gsap.set(logo,    { x: vw / 2 - initW / 2, y: videoH / 2 - initH / 2, width: initW, opacity: 0 });
        gsap.set(bookNow, { x: vw - 180, y: 26, opacity: 0 });
        gsap.timeline({ delay: 0.5 })
          .to(logo, { opacity: 1, duration: 1.6, ease: "expo.out" });
        isFirstRun.current = false;
      } else {
        gsap.set(logo,    { x: vw / 2 - initW / 2, y: videoH / 2 - initH / 2, width: initW });
        gsap.set(bookNow, { x: vw - 180, y: 26 });
        if (navLeft)  gsap.set(navLeft,  { x: 0 });
        if (navRight) gsap.set(navRight, { x: 0 });
      }

      // ── Logo + nav scroll ─────────────────────────────────────────────────
      const logoScroll = { trigger: fold, start: "top 68%", end: "top 0%", scrub: 1.2 };
      gsap.to(logo, { x: vw / 2 - finalW / 2, y: 28 - finalH / 2, width: finalW, ease: "none", scrollTrigger: logoScroll });
      if (navLeft)  gsap.to(navLeft,  { x: -30, ease: "none", scrollTrigger: logoScroll });
      if (navRight) gsap.to(navRight, { x:  30, ease: "none", scrollTrigger: logoScroll });

      // ── [BOOK NOW] fades in on scroll, stays at top-right ────────────────
      ScrollTrigger.create({
        trigger: fold, start: "top 10%",
        onEnter:     () => gsap.to(bookNow, { opacity: 1, duration: 0.4, ease: "power2.out" }),
        onLeaveBack: () => gsap.to(bookNow, { opacity: 0, duration: 0.3, ease: "power2.in"  }),
      });

      // ── Section reveals: awwwards-style clip-up ───────────────────────────
      gsap.utils.toArray<HTMLElement>(".reveal-heading").forEach((el) => {
        gsap.fromTo(el,
          { yPercent: 115 },
          { yPercent: 0, duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" } }
        );
      });
      gsap.utils.toArray<HTMLElement>(".reveal-text").forEach((el) => {
        gsap.fromTo(el,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" } }
        );
      });

      // ── MICE: arch scroll-up (uncovering) ────────────────────────────────────
      const miceArchEl = miceArchRef.current;
      if (miceArchEl) {
        gsap.to(miceArchEl, {
          yPercent: -28,
          ease: "none",
          scrollTrigger: {
            trigger: mice,
            start: "top 85%",
            end: "center 30%",
            scrub: 1.8,
          },
        });
      }

      if (!firstRun) ScrollTrigger.refresh();
    }

    init();

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
{/* ── Fixed: AMOK SIGN ────────────────────────────────────────────────── */}
      <img ref={logoRef} src="/Logos/AMOK SIGN.svg" alt="AMOK"
        style={{ position: "fixed", top: 0, left: 0, height: "auto", zIndex: 60, mixBlendMode: "difference", pointerEvents: "none" }}
      />

      {/* ── Fixed: BOOK NOW — running stroke button ──────────────────────────── */}
      <RunningStrokeButton
        forwardedRef={bookNowRef}
        onClick={() => navigateTo("/events")}
        style={{ position: "fixed", top: 0, left: 0, zIndex: 60 }}
      >
        BOOK NOW
      </RunningStrokeButton>

      {/* ── Custom cursor — shown on section hover, hidden when section is active ── */}
      {!activeSection && (nightHovered || sunsetHovered) && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: cursorPos.x,
            top: cursorPos.y,
            transform: "translate(-50%, -50%)",
            width: 128,
            height: 128,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.6)",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "#ffffff", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, textTransform: "uppercase" }}>EXPLORE</span>
          <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "#ffffff", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, textTransform: "uppercase" }}>{nightHovered ? "NIGHT" : "SUNSET"}</span>
          <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "#ffffff", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 400, textTransform: "uppercase" }}>EVENTS</span>
        </div>
      )}


      {/* ── Fixed video — stays in place, content scrolls over it ─────────── */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 1, background: "#000000", overflow: "hidden" }}>
        <video ref={videoRef} autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "115%", objectFit: "cover", objectPosition: "center 30%", top: "-7%" }}
        >
          <source src="/Hero%20video/Amok-Landing-Page.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #000000 100%)", zIndex: 1 }} />
      </div>
      {/* spacer so content starts below the fold */}
      <div style={{ height: "100vh" }} />

      {/* ── Split SUNSET / NIGHT events section ─────────────────────────────── */}
      <div
        ref={foldRef}
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "-32vh",
        }}
      >
        {/* ── Editorial strip — collapses to centred single-col on mobile ── */}
        <div style={{
          background: "#000000",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr",
          alignItems: "center",
          gap: "clamp(16px, 2.5vw, 40px)",
          padding: "clamp(20px, 3vw, 36px) clamp(24px, 5vw, 72px) clamp(32px, 7vw, 96px)",
          textAlign: isMobile ? "center" : undefined,
        }}>
          {!isMobile && (
            <div style={{ alignSelf: "start", paddingTop: "clamp(4px, 0.5vw, 8px)" }}>
              <img src="/Logos/AMOK FULL.svg" alt="AMOK"
                style={{ width: "clamp(64px, 9vw, 130px)", height: "auto", display: "block", opacity: 0.95 }}
              />
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <p className="reveal-text" style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, marginBottom: "clamp(10px, 1.5vw, 18px)" }}>
              Experience
            </p>
            <ShutterReveal
              lines={["Sunset", "\u0026", "Night"]}
              style={{ fontFamily: "var(--font-fenul, Georgia, serif)", fontWeight: 500, fontSize: isMobile ? "clamp(38px, 14vw, 72px)" : "40px", lineHeight: 0.92, letterSpacing: "-0.02em", color: "#fff", textTransform: "uppercase", textAlign: "center" }}
              slats={6}
            />
          </div>
          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignSelf: "start", paddingTop: "clamp(4px, 0.5vw, 8px)" }}>
              <p className="reveal-text" style={{ fontSize: "clamp(11px, 1vw, 14px)", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, maxWidth: "210px" }}>
                Dive into the experience that will change the way{" "}
                <span style={{ color: "#fff", fontWeight: 400 }}>you live music</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Second fold: stacked BG images + CSS vignette + content ── */}
        <div style={{ position: "relative", height: isMobile ? "auto" : "100vh", overflow: "hidden" }}>

          {/* ── Background images (desktop only) ── */}
          {!isMobile && (
            <>
              {/* Layer 1: Iconic Nights bg */}
              <img
                src="/IMAGES/Split/NIGHT.png"
                alt="" aria-hidden
                style={{ position: "absolute", top: 0, left: 0, width: "102%", height: "102%", margin: "-1%", objectFit: "cover", objectPosition: "top center", pointerEvents: "none", filter: "blur(3px)" }}
              />
              {/* Layer 2: Sunset Parties bg — hidden in default state, revealed on hover */}
              <img
                src="/IMAGES/Split/SUNSET.png"
                alt="" aria-hidden
                style={{ position: "absolute", top: 0, left: 0, width: "102%", height: "102%", margin: "-1%", objectFit: "cover", objectPosition: "top center", pointerEvents: "none", filter: "blur(3px)", opacity: sunsetHovered ? 1 : 0, transition: "opacity 0.6s ease" }}
              />
            </>
          )}

          {/* ── CSS vignette — edge gradients (always on) ── */}
          {!isMobile && (
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                background: [
                  "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 65%, #000000 100%)",
                  "linear-gradient(to right,  rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(0,0,0,0.55) 100%)",
                ].join(", "),
              }}
            />
          )}

          {/* ── Dark dim overlay — heavy in default state, lifts on hover ── */}
          {!isMobile && (
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                background: "#000",
                opacity: (nightHovered || sunsetHovered || activeSection) ? 0 : 0.52,
                transition: "opacity 0.55s ease",
              }}
            />
          )}

          {/* ── Content layer ── */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: isMobile ? "column" : "row", height: isMobile ? "auto" : "100%", overflow: "hidden" }}>

            {/* LEFT: Iconic Nights */}
            <div
              onMouseEnter={() => { if (!activeSection) setNightHovered(true); }}
              onMouseLeave={() => setNightHovered(false)}
              onMouseMove={e => setCursorPos({ x: e.clientX, y: e.clientY })}
              onClick={() => { if (!activeSection) { setActiveSection("night"); setNightHovered(false); } }}
              style={{
                width: isMobile ? "100%" : (activeSection === "night" ? "100%" : activeSection === "sunset" ? "0%" : nightHovered ? "74%" : sunsetHovered ? "26%" : "50%"),
                minWidth: 0,
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                paddingTop: isMobile ? "40px" : "clamp(40px, 7vh, 80px)",
                paddingBottom: isMobile ? "80px" : "clamp(60px, 8vh, 80px)",
                paddingLeft: isMobile ? "20px" : 0,
                paddingRight: isMobile ? "20px" : "clamp(24px, 3vw, 48px)",
                height: isMobile ? "auto" : "100%",
                position: "relative",
                opacity: activeSection === "sunset" ? 0 : (!activeSection && sunsetHovered) ? 0.5 : 1,
                cursor: activeSection === "night" ? "default" : "none",
                transition: "width 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease",
              }}
            >
              {isMobile && (
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                  <img src="/IMAGES/Split/NIGHT.png" alt=""
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
                </div>
              )}

              <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: "var(--font-fenul, Georgia, serif)", fontWeight: 500, fontSize: "40px", letterSpacing: "-0.02em", lineHeight: 1, color: "#fff", textTransform: "uppercase", margin: "0 0 clamp(20px, 3vh, 32px)", textAlign: "center", padding: "0 clamp(24px, 3vw, 48px)" }}>
                  ICONIC NIGHTS
                </h2>
                <div ref={nightCardsRef} onScroll={e => { const el = e.currentTarget; setNightArrows({ prevDisabled: el.scrollLeft <= 2, nextDisabled: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 }); }} style={{ display: "flex", direction: "rtl", gap: "clamp(10px, 1.2vw, 16px)", overflowX: "auto", scrollbarWidth: "none" }}>
                  {EVENTS.filter(e => e.category === "night").map(event => (
                    <div key={event.id} style={{ direction: "ltr", flexShrink: 0 }}>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll arrows — visible only when section is active */}
              {activeSection === "night" && !isMobile && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: "clamp(16px, 2.5vh, 28px)", position: "relative", zIndex: 10 }}
                >
                  <SliderControls
                    dark
                    prevDisabled={nightArrows.prevDisabled}
                    nextDisabled={nightArrows.nextDisabled}
                    onPrev={() => { nightCardsRef.current?.scrollBy({ left: -270, behavior: "smooth" }); }}
                    onNext={() => { nightCardsRef.current?.scrollBy({ left:  270, behavior: "smooth" }); }}
                  />
                </div>
              )}

              {/* Close button */}
              {activeSection === "night" && !isMobile && (
                <button
                  onClick={e => { e.stopPropagation(); setActiveSection(null); }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; }}
                  style={{
                    position: "absolute", top: "clamp(20px, 3vh, 36px)", right: "clamp(24px, 3vw, 48px)",
                    width: 48, height: 48, borderRadius: "50%",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.35)",
                    cursor: "pointer", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 10, transition: "border-color 0.2s ease",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Divider */}
            {!isMobile && <div style={{ width: "1px", background: "rgba(255,255,255,0.08)", flexShrink: 0, zIndex: 5, transition: "opacity 0.5s ease", opacity: (activeSection || nightHovered || sunsetHovered) ? 0 : 1 }} />}

            {/* RIGHT: Sunset Parties */}
            <div
              onMouseEnter={() => { if (!activeSection) setSunsetHovered(true); }}
              onMouseLeave={() => setSunsetHovered(false)}
              onMouseMove={e => setCursorPos({ x: e.clientX, y: e.clientY })}
              onClick={() => { if (!activeSection) { setActiveSection("sunset"); setSunsetHovered(false); } }}
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                paddingTop: isMobile ? "40px" : "clamp(40px, 7vh, 80px)",
                paddingBottom: isMobile ? "80px" : "clamp(60px, 8vh, 80px)",
                paddingLeft: isMobile ? "20px" : "clamp(24px, 3vw, 48px)",
                paddingRight: isMobile ? "20px" : 0,
                height: isMobile ? "auto" : "100%",
                position: "relative",
                opacity: activeSection === "night" ? 0 : (!activeSection && nightHovered) ? 0.5 : 1,
                cursor: activeSection === "sunset" ? "default" : "none",
                transition: "opacity 0.6s ease",
              }}
            >
              {isMobile && (
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                  <img src="/IMAGES/Split/SUNSET.png" alt=""
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
                </div>
              )}

              <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: "var(--font-fenul, Georgia, serif)", fontWeight: 500, fontSize: "40px", letterSpacing: "-0.02em", lineHeight: 1, color: "#fff", textTransform: "uppercase", margin: "0 0 clamp(20px, 3vh, 32px)", textAlign: "center", padding: "0 clamp(24px, 3vw, 48px)" }}>
                  SUNSET PARTIES
                </h2>
                <div ref={sunsetCardsRef} onScroll={e => { const el = e.currentTarget; setSunsetArrows({ prevDisabled: el.scrollLeft <= 2, nextDisabled: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 }); }} style={{ display: "flex", gap: "clamp(10px, 1.2vw, 16px)", overflowX: "auto", scrollbarWidth: "none" }}>
                  {EVENTS.filter(e => e.category === "sunset").map(event => <EventCard key={event.id} event={event} />)}
                </div>
              </div>

              {/* Scroll arrows — visible only when section is active */}
              {activeSection === "sunset" && !isMobile && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: "clamp(16px, 2.5vh, 28px)", position: "relative", zIndex: 10 }}
                >
                  <SliderControls
                    dark
                    prevDisabled={sunsetArrows.prevDisabled}
                    nextDisabled={sunsetArrows.nextDisabled}
                    onPrev={() => { sunsetCardsRef.current?.scrollBy({ left: -270, behavior: "smooth" }); }}
                    onNext={() => { sunsetCardsRef.current?.scrollBy({ left:  270, behavior: "smooth" }); }}
                  />
                </div>
              )}

              {/* Close button */}
              {activeSection === "sunset" && !isMobile && (
                <button
                  onClick={e => { e.stopPropagation(); setActiveSection(null); }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; }}
                  style={{
                    position: "absolute", top: "clamp(20px, 3vh, 36px)", right: "clamp(24px, 3vw, 48px)",
                    width: 48, height: 48, borderRadius: "50%",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.35)",
                    cursor: "pointer", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 10, transition: "border-color 0.2s ease",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

          </div>

          {/* VIEW CALENDAR — centred at bottom */}
          {!isMobile && (
            <div style={{ position: "absolute", bottom: "clamp(24px, 4vh, 40px)", left: 0, right: 0, zIndex: 3, textAlign: "center" }}>
              <button
                className="bracket-btn"
                onClick={() => navigateTo("/events")}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "12px", letterSpacing: "0.22em", cursor: "pointer", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300 }}
              >
                [ VIEW CALENDAR ]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Subscribe Form ────────────────────────────────────────────────────── */}
      <section style={{ background: "#000", position: "relative", zIndex: 15, padding: "clamp(80px, 12vw, 140px) clamp(24px, 5vw, 64px)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <p className="reveal-text" style={{ fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, marginBottom: "28px" }}>
            Stay in the loop
          </p>
          <ShutterReveal
            lines={["Join", "AMOK"]}
            style={{ fontFamily: "var(--font-fenul, Georgia, serif)", fontWeight: 500, fontSize: "clamp(40px, 7vw, 96px)", letterSpacing: "-0.02em", lineHeight: 0.92, color: "#fff", textTransform: "uppercase", textAlign: "center" }}
          />
          <p className="reveal-text" style={{ fontSize: "clamp(12px, 1vw, 14px)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300, marginTop: "28px", marginBottom: "44px", lineHeight: 1.65, maxWidth: "360px", margin: "28px auto 44px" }}>
            Be the first to hear about lineups, ticket drops and exclusive events.
          </p>
          <SubscribeForm />
        </div>
      </section>

      {/* ── MICE / The Venue Paradøx ─────────────────────────────────────────── */}
      <section ref={miceRef}
        style={{ background: "#000", position: "relative", zIndex: 30 }}
      >
        {/* ── Black arch — plain white heading, curves down over the photo ─── */}
        <div ref={miceArchRef} style={{
          position: "relative", zIndex: 2,
          background: "#000000",
          textAlign: "center",
          paddingTop: "clamp(60px, 8vw, 100px)",
          paddingBottom: "clamp(110px, 14vw, 180px)",
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingRight: "clamp(24px, 5vw, 64px)",
          borderRadius: "0 0 793px 793px / 0 0 302px 302px",
          willChange: "transform",
        }}>
          <p style={{
            fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)", marginBottom: "clamp(16px, 2vw, 28px)",
            fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300,
          }}>
            MICE
          </p>

          <div
            ref={miceTextRef}
            style={{
              fontFamily: "var(--font-fenul, Georgia, serif)",
              fontWeight: 500,
              fontSize: "clamp(32px, 6vw, 80px)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textTransform: "uppercase",
              textAlign: "center",
              color: "#ffffff",
            }}
          >
            The<br />Venue<br />Parad&#216;x
          </div>
        </div>

        {/* ── Venue image stage — pulled up behind arch curve ──────────────── */}
        <div
          ref={miceGridRef}
          style={{
            position: "relative", zIndex: 1,
            marginTop: "-302px",
            overflow: "hidden",
            height: "100vh",
            willChange: "transform",
          }}
        >
          {/* Crossfading full-bleed images */}
          {MICE_IMAGES.map((img, i) => (
            <img
              key={img.src} src={img.src} alt={img.alt}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                opacity: miceActiveIdx === i ? 1 : 0,
                transition: "opacity 0.85s ease",
              }}
            />
          ))}

          {/* Scrim: readable bottom bar */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 85%, #000 100%)",
            pointerEvents: "none", zIndex: 2,
          }} />

          {/* Bottom overlay — description/CTA left, thumbnails absolutely centred */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
            padding: "clamp(20px, 3vw, 40px) clamp(24px, 4vw, 56px)",
          }}>

            {/* Thumbnails — true horizontal centre via left:50% + translateX(-50%) */}
            <div style={{
              position: "absolute",
              bottom: "clamp(20px, 3vw, 40px)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "clamp(6px, 0.8vw, 10px)",
              whiteSpace: "nowrap",
            }}>
              {MICE_IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  onClick={() => setMiceActiveIdx(i)}
                  style={{
                    width: "clamp(80px, 9vw, 130px)", aspectRatio: "4/3",
                    overflow: "hidden", padding: 0, background: "none", cursor: "pointer",
                    outline: "none",
                    border: i === miceActiveIdx ? "2px solid #fff" : "2px solid rgba(255,255,255,0.22)",
                    transition: "border-color 0.3s", flexShrink: 0,
                  }}
                >
                  <img
                    src={img.src} alt={img.alt}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover", display: "block",
                      filter: i === miceActiveIdx ? "none" : "brightness(0.45)",
                      transition: "filter 0.3s",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Description + CTA — left, vertically aligned with thumbnails */}
            <div style={{ maxWidth: "260px" }}>
              <p style={{
                color: "rgba(255,255,255,0.7)", fontSize: "clamp(11px, 0.95vw, 13px)",
                fontFamily: "var(--font-saans, sans-serif)", fontWeight: 300,
                lineHeight: 1.65, marginBottom: "18px",
              }}>
                The ultimate venue in Palma for corporate events
                with style, technology and a versatile environment
              </p>
              <button
                onClick={() => navigateTo("/contact")}
                className="bracket-btn"
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.35)",
                  color: "rgba(255,255,255,0.8)", fontSize: "11px", letterSpacing: "0.24em",
                  cursor: "pointer", fontFamily: "var(--font-saans, sans-serif)",
                  fontWeight: 300, padding: "12px 28px", transition: "border-color 0.3s, color 0.3s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.8)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
              >
                <ScrambleText text="[ CONTACT US ]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery / Mallorca Soul ─────────────────────────────────────────── */}
      <GallerySection />

      {/* ── 3D Model ─────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 32, background: "#000" }}>
        <ModelViewer />
      </div>

      {/* ── Socials / Social Paradox ─────────────────────────────────────────── */}
      <SocialsSection />

      {/* ── Footer spacer — gives scroll room to reveal the fixed footer ──── */}
      <div style={{ height: isMobile ? "360px" : "75vh", position: "relative", zIndex: 2, pointerEvents: "none" }} />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Footer />
    </>
  );
}
