"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ShutterReveal } from "@/components/motion/ShutterReveal";

const CircularGallery = dynamic(
  () => import("@/components/ui/CircularGallery").then((m) => m.CircularGallery),
  { ssr: false }
);

const SOCIALS = [
  { label: "Instagram", icon: "/icons/asset-33.svg", href: "https://www.instagram.com/amokmallorca" },
  { label: "TikTok",    icon: "/icons/asset-34.svg", href: "https://www.tiktok.com/@amokmallorca" },
  { label: "Facebook",  icon: "/icons/asset-35.svg", href: "https://www.facebook.com/amokmallorca" },
];

const GALLERY_ITEMS = [
  { image: "/Socials/social-1.mp4", text: "@amokmallorca" },
  { image: "/Socials/social-2.mp4", text: "@amokmallorca" },
  { image: "/Socials/social-3.mp4", text: "@amokmallorca" },
  { image: "/Socials/social-4.mp4", text: "@amokmallorca" },
  { image: "/Socials/social-5.mp4", text: "@amokmallorca" },
  { image: "/Socials/social-6.mp4", text: "@amokmallorca" },
  { image: "/Socials/social-7.mp4", text: "@amokmallorca" },
];

export function SocialsSection() {
  const galleryWrapRef  = useRef<HTMLDivElement>(null);
  const sectionRef      = useRef<HTMLElement>(null);
  const [galleryMounted, setGalleryMounted] = useState(false);
  const [mountKey, setMountKey] = useState(0);
  // Keep preloaded video elements alive in a ref so the browser memory-cache
  // stays warm. CircularGallery's own video elements hit the cache immediately.
  const preloadedVideos = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    const videos = GALLERY_ITEMS.map(({ image }) => {
      const v = document.createElement("video");
      v.src = image;
      v.preload = "auto";
      v.muted = true;
      v.playsInline = true;
      v.load();
      return v;
    });
    preloadedVideos.current = videos;
    return () => { preloadedVideos.current = []; };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const tryMount = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 400) {
        setGalleryMounted(true);
        cleanup();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setGalleryMounted(true); cleanup(); } },
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

  // Recover from WebGL context loss
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onLost = () => {
      setGalleryMounted(false);
      setTimeout(() => { setGalleryMounted(true); setMountKey(k => k + 1); }, 400);
    };
    el.addEventListener("webglcontextlost", onLost, true);
    return () => el.removeEventListener("webglcontextlost", onLost, true);
  }, []);

  // Animate gallery wrapper in as soon as it mounts (content-driven, not scroll-position-driven).
  // ScrollTrigger was unreliable here because positions were calculated before CircularGallery
  // added its height, causing the trigger to never fire.
  useEffect(() => {
    const el = galleryWrapRef.current;
    if (!el || !galleryMounted) return;

    gsap.fromTo(el,
      { y: 80, rotationX: 14, opacity: 0, transformPerspective: 900, transformOrigin: "center top" },
      { y: 0, rotationX: 0, opacity: 1, duration: 1.1, ease: "expo.out" }
    );
  }, [galleryMounted]);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "#000000",
        position: "relative",
        zIndex: 36,
        paddingTop: "clamp(80px, 10vw, 120px)",
        paddingBottom: "clamp(60px, 8vw, 100px)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", paddingBottom: "clamp(32px, 4vw, 56px)" }}>
        <p style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.35)",
          fontFamily: "var(--font-saans, sans-serif)",
          fontWeight: 300,
          marginBottom: "16px",
          textTransform: "uppercase",
        }}>
          Follow Along
        </p>

        <ShutterReveal
          lines={["The Social", "Paradøx"]}
          style={{
            fontFamily: "var(--font-fenul, Georgia, serif)",
            fontWeight: 500,
            fontSize: "clamp(52px, 9vw, 130px)",
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: "#fff",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        />
      </div>

      {/* ── Social buttons ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(12px, 2vw, 24px)",
        flexWrap: "wrap",
        paddingBottom: "clamp(48px, 6vw, 80px)",
        paddingLeft: "clamp(16px, 4vw, 48px)",
        paddingRight: "clamp(16px, 4vw, 48px)",
      }}>
        {SOCIALS.map(({ label, icon, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 22px",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              fontFamily: "var(--font-saans, sans-serif)",
              fontWeight: 300,
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "border-color 0.25s, color 0.25s, background 0.25s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(255,255,255,0.55)";
              el.style.color = "#fff";
              el.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(255,255,255,0.18)";
              el.style.color = "rgba(255,255,255,0.7)";
              el.style.background = "transparent";
            }}
          >
            <img
              src={icon}
              alt=""
              aria-hidden
              width={13}
              height={13}
              style={{ filter: "invert(1)", opacity: 0.6, display: "block" }}
            />
            {label}
          </a>
        ))}
      </div>

      {/* ── Circular Gallery — animates in on scroll ───────────────────────── */}
      <div
        ref={galleryWrapRef}
        style={{
          width: "100%",
          height: "clamp(360px, 55vw, 620px)",
          willChange: "transform, opacity",
        }}
      >
        {galleryMounted && (
          <CircularGallery
            key={mountKey}
            items={GALLERY_ITEMS}
            bend={3}
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.05}
          />
        )}
      </div>
    </section>
  );
}
