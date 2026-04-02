"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { TransitionLink } from "./TransitionLink";

export function Header() {
  const pathname  = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: "expo.out", delay: 0.6 }
    );
  }, []);

  const linkStyle: React.CSSProperties = {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    fontFamily: "var(--font-saans, sans-serif)",
    fontWeight: 300,
    display: "inline-block",
    mixBlendMode: "difference",
  };

  return (
    <header
      ref={headerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 40px",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "48px",
          pointerEvents: "auto",
        }}
      >
        <TransitionLink
          href="/events"
          className="bracket-btn nav-item-left"
          style={linkStyle}
        >
          CALENDAR
        </TransitionLink>

        {/* AMOK logo — centred, only on non-homepage */}
        <TransitionLink href="/" style={{ display: "inline-flex", alignItems: "center", mixBlendMode: "difference", visibility: pathname === "/" ? "hidden" : "visible" }}>
          <img
            src="/Logos/AMOK SIGN.svg"
            alt="AMOK"
            style={{
              height: "32px",
              width: "auto",
              display: "block",
              filter: "brightness(0) invert(1)",
              opacity: 0.9,
            }}
          />
        </TransitionLink>

        <TransitionLink
          href="/book-vip"
          className="bracket-btn nav-item-right"
          style={linkStyle}
        >
          VIP TABLES
        </TransitionLink>
      </nav>
    </header>
  );
}
