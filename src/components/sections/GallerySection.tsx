"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ShutterReveal } from "@/components/motion/ShutterReveal";

const GalleryCanvas = dynamic(() => import("./GalleryCanvas"), { ssr: false });

export function GallerySection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  // Mount the canvas only when the section nears the viewport.
  // IO handles the normal case; scroll listener is a fallback for when Lenis
  // smooth-scroll causes the IO to miss the entry event.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const tryMount = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 400) {
        setMounted(true);
        cleanup();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMounted(true); cleanup(); } },
      { rootMargin: "400px" }
    );
    io.observe(el);
    window.addEventListener("scroll", tryMount, { passive: true });

    function cleanup() {
      io.disconnect();
      window.removeEventListener("scroll", tryMount);
    }

    return cleanup;
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onLost = () => {
      setMounted(false);
      setTimeout(() => { setMounted(true); setMountKey(k => k + 1); }, 400);
    };
    el.addEventListener("webglcontextlost", onLost, true);
    return () => el.removeEventListener("webglcontextlost", onLost, true);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "#000",
        position: "relative",
        zIndex: 35,
        overflow: "hidden",
        // minHeight prevents the section collapsing to 0 before the lazy
        // canvas mounts — a collapsed section sits on top of MICE and
        // breaks the scroll flow.
        minHeight: "100vh",
      }}
    >
      {/* Top-fade: blends MICE's bottom gradient into Gallery seamlessly.
          Sits above the canvas (zIndex 3) so it's always visible. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "180px",
          background: "linear-gradient(to bottom, #000000 0%, transparent 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Heading — above the top-fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "clamp(48px, 7vw, 80px)",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "20px",
            fontFamily: "var(--font-saans, sans-serif)",
            fontWeight: 300,
          }}
        >
          Gallery
        </p>
        <ShutterReveal
          lines={["Mallørca", "Søul"]}
          style={{
            fontFamily: "var(--font-fenul, Georgia, serif)",
            fontWeight: 500,
            fontSize: "clamp(52px, 10vw, 140px)",
            letterSpacing: "-0.03em",
            lineHeight: 0.92,
            color: "#fff",
            textTransform: "uppercase",
            textAlign: "center",
          }}
          slats={8}
        />
      </div>

      {/* Three.js sphere canvas — only mounted when section is near viewport */}
      {mounted && <GalleryCanvas key={mountKey} />}
    </section>
  );
}
