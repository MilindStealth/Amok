"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface Props {
  onComplete: () => void;
}

/**
 * First-load curtain loader.
 *
 * The editorial text (wordmark, headline, dive-into) is placed at the
 * EXACT SAME pixel coordinates as the real hero editorial zone in page.tsx:
 *   → foldRef top = 100vh spacer − 32vh marginTop = 68vh from viewport top
 *   → same gridTemplateColumns / padding / gap
 *
 * Because the loader text lives on top of the real text (same spot), when
 * the black curtain fades both the loader text and the real text crossfade
 * in place — zero jump, zero position shift.
 *
 * The black bg and loader editorial fade together so the user sees:
 * text stays constant, background transitions black → video.
 *
 * On return visits (sessionStorage flag) the overlay immediately hides
 * and onComplete() fires before the first paint.
 */
export function PageLoader({ onComplete }: Props) {
  const rootRef      = useRef<HTMLDivElement>(null);
  const bgRef        = useRef<HTMLDivElement>(null);
  const symbolRef    = useRef<HTMLImageElement>(null);
  const editorialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root      = rootRef.current!;
    const bg        = bgRef.current!;
    const symbol    = symbolRef.current!;
    const editorial = editorialRef.current!;

    // ── Return visit: skip instantly ─────────────────────────────────────────
    if (sessionStorage.getItem("amok-loader-done")) {
      root.style.display = "none";
      onComplete();
      return;
    }
    sessionStorage.setItem("amok-loader-done", "1");

    // ── Initial hidden states ─────────────────────────────────────────────────
    // xPercent handles the 50% horizontal centering so GSAP owns the full matrix
    gsap.set(symbol,    { autoAlpha: 0, y: -20, xPercent: -50 });
    gsap.set(editorial, { autoAlpha: 0 });

    const tl = gsap.timeline();

    tl
      // === Phase 1: Reveal (0 → ~1.5 s) ======================================
      .to(symbol,    { autoAlpha: 1, y: 0,  duration: 0.9, ease: "expo.out" }, 0.35)
      .to(editorial, { autoAlpha: 1,        duration: 0.8, ease: "expo.out" }, 0.55)

      // === Phase 2: Hold ======================================================
      .to({}, { duration: 1.4 })

      // === Phase 3: Symbol rises and fades ====================================
      .to(symbol, { autoAlpha: 0, y: -32, duration: 0.5, ease: "power2.in" })

      // === Phase 4: Curtain lifts — bg + loader editorial fade together =======
      // onComplete fires FIRST so the real editorial snaps to opacity:1 behind
      // the still-opaque loader. Then both loader layers fade over 1.2 s,
      // gradually revealing the real text (already at full opacity).
      // Because loader text & real text are on the same pixels the crossfade
      // looks like the background is changing, not the text.
      .addLabel("exit")
      .call(onComplete, [], "exit")
      .to(bg,        { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" }, "exit")
      .to(editorial, { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" }, "exit")

      // === Clean up ===========================================================
      .call(() => { root.style.display = "none"; });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}
    >
      {/* ── Black curtain ──────────────────────────────────────────────────── */}
      <div ref={bgRef} style={{ position: "absolute", inset: 0, background: "#000000" }} />

      {/* ── AMOK symbol — top-centre ───────────────────────────────────────── */}
      <img
        ref={symbolRef}
        src="/Logos/AMOK SIGN.svg"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          top: "clamp(36px, 5.5vh, 64px)",
          left: "50%",
          /* horizontal centering via GSAP xPercent: -50, not CSS transform */
          width: "clamp(60px, 6.5vh, 80px)",
          height: "auto",
          zIndex: 2,
          mixBlendMode: "difference",
        }}
      />

      {/* ── Editorial grid ─────────────────────────────────────────────────────
          Sits at exactly the same coordinates as the real hero editorial zone:
            foldRef top = 100 vh spacer − 32 vh marginTop = 68 vh from viewport top
          Same gridTemplateColumns, padding, gap as the real div in page.tsx.
          ─────────────────────────────────────────────────────────────────── */}
      <div
        ref={editorialRef}
        style={{
          position: "absolute",
          top: "68vh",
          left: 0,
          right: 0,
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          alignItems: "start",
          gap: "clamp(16px, 2.5vw, 40px)",
          padding: "clamp(20px, 3vw, 36px) clamp(32px, 5vw, 72px) 0",
        }}
      >
        {/* Left — AMØK full wordmark */}
        <div style={{ alignSelf: "start" }}>
          <img
            src="/Logos/AMOK FULL.svg"
            alt="AMOK"
            style={{ width: "clamp(64px, 9vw, 130px)", height: "auto", display: "block", opacity: 0.95 }}
          />
        </div>

        {/* Centre — THE ISLAND PARADØX */}
        <div style={{ alignSelf: "start", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-fenul, Georgia, serif)",
              fontWeight: 500,
              fontSize: "clamp(38px, 7vw, 100px)",
              lineHeight: 0.92,
              letterSpacing: "-0.02em",
              color: "#fff",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            The
            <br />
            Island
            <br />
            Parad&#216;x
          </div>
          <p
            style={{
              fontSize: "clamp(9px, 0.8vw, 11px)",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 300,
              letterSpacing: "0.04em",
              marginTop: "14px",
            }}
          >
            The origin of clubbing in Mallorca.
          </p>
        </div>

        {/* Right — Dive into */}
        <div style={{ alignSelf: "start" }}>
          <p
            style={{
              fontSize: "clamp(11px, 1vw, 14px)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 300,
              maxWidth: "210px",
            }}
          >
            Dive into the experience that will change the way{" "}
            <span style={{ color: "#fff", fontWeight: 400 }}>you live music</span>
          </p>
        </div>
      </div>
    </div>
  );
}
