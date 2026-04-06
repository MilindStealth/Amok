"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { TransitionLink } from "./TransitionLink";
import { useIsMobile } from "@/hooks/useIsMobile";

export function Header() {
  const pathname  = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const isMobile  = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: "expo.out", delay: 0.6 }
    );
  }, []);

  // Close when route changes
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const linkStyle: React.CSSProperties = {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#fff",
    textDecoration: "none",
    fontFamily: "var(--font-saans, sans-serif)",
    fontWeight: 300,
    display: "inline-block",
    mixBlendMode: "difference",
  };

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header
          ref={headerRef}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            pointerEvents: "none",
            background: menuOpen
              ? "#000"
              : (pathname === "/events" || pathname === "/book-vip") ? "#000" : "transparent",
            transition: "background 0.3s ease",
          }}
        >
          {/* Logo — hidden on homepage (page animates its own) */}
          <TransitionLink
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              mixBlendMode: "difference",
              visibility: pathname === "/" ? "hidden" : "visible",
              pointerEvents: "auto",
            }}
          >
            <img
              src="/Logos/AMOK SIGN.svg"
              alt="AMOK"
              style={{ height: "28px", width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </TransitionLink>

          {/* Hamburger → X */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
              mixBlendMode: "difference",
            }}
          >
            <span style={{
              display: "block", width: "22px", height: "1.5px", background: "#fff",
              transformOrigin: "center",
              transform: menuOpen ? "rotate(45deg) translate(0px, 3.5px)" : "none",
              transition: "transform 0.3s ease",
            }} />
            <span style={{
              display: "block", width: "22px", height: "1.5px", background: "#fff",
              opacity: menuOpen ? 0 : 1,
              transition: "opacity 0.2s ease",
            }} />
            <span style={{
              display: "block", width: "22px", height: "1.5px", background: "#fff",
              transformOrigin: "center",
              transform: menuOpen ? "rotate(-45deg) translate(0px, -3.5px)" : "none",
              transition: "transform 0.3s ease",
            }} />
          </button>
        </header>

        {/* Full-screen overlay */}
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(32px, 8vh, 56px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}>
          <TransitionLink
            href="/events"
            style={{
              fontSize: "clamp(36px, 10vw, 56px)",
              letterSpacing: "-0.01em",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "var(--font-fenul, Georgia, serif)",
              fontWeight: 500,
              textTransform: "uppercase",
              transform: menuOpen ? "translateY(0)" : "translateY(16px)",
              transition: "transform 0.4s ease 0.05s",
              display: "block",
            }}
          >
            Calendar
          </TransitionLink>
          <TransitionLink
            href="/book-vip"
            style={{
              fontSize: "clamp(36px, 10vw, 56px)",
              letterSpacing: "-0.01em",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "var(--font-fenul, Georgia, serif)",
              fontWeight: 500,
              textTransform: "uppercase",
              transform: menuOpen ? "translateY(0)" : "translateY(16px)",
              transition: "transform 0.4s ease 0.1s",
              display: "block",
            }}
          >
            VIP Tables
          </TransitionLink>
        </div>
      </>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <header
      ref={headerRef}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 40px",
        pointerEvents: "none",
        background: (pathname === "/events" || pathname === "/book-vip") ? "#000" : "transparent",
      }}
    >
      <nav style={{ display: "flex", alignItems: "center", gap: "48px", pointerEvents: "auto" }}>
        <TransitionLink href="/events" className="bracket-btn nav-item-left" style={linkStyle}>
          CALENDAR
        </TransitionLink>

        <TransitionLink href="/" style={{ display: "inline-flex", alignItems: "center", mixBlendMode: "difference", visibility: pathname === "/" ? "hidden" : "visible" }}>
          <img
            src="/Logos/AMOK SIGN.svg"
            alt="AMOK"
            style={{ height: "32px", width: "auto", display: "block", filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
        </TransitionLink>

        <TransitionLink href="/book-vip" className="bracket-btn nav-item-right" style={linkStyle}>
          VIP TABLES
        </TransitionLink>
      </nav>
    </header>
  );
}
