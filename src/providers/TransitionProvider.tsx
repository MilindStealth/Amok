"use client";

import { createContext, useContext, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

interface TransitionContextType {
  navigateTo: (href: string, fromEl?: HTMLElement | null, imageUrl?: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  navigateTo: () => {},
  isTransitioning: false,
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlayRef  = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = useCallback(
    (href: string, fromEl?: HTMLElement | null, imageUrl?: string) => {
      const overlay = overlayRef.current;
      const img     = overlayImgRef.current;
      const bg      = bgRef.current;
      if (!overlay || !bg) { router.push(href); return; }

      setIsTransitioning(true);

      if (fromEl) {
        // Load artwork into overlay
        if (img && imageUrl) {
          img.src = imageUrl;
          img.style.display = "block";
          overlay.style.background = "transparent";
        } else {
          if (img) img.style.display = "none";
          overlay.style.background = "#000000";
        }

        // Calculate target: event detail left-column artwork position
        const pl = Math.min(Math.max(24, window.innerWidth * 0.05), 72);
        const pt = Math.min(Math.max(100, window.innerWidth * 0.12), 140);
        const tw = Math.min(Math.max(240, window.innerWidth * 0.22), 320);
        const th = tw * (4 / 3);

        const rect = fromEl.getBoundingClientRect();
        gsap.set(overlay, {
          display: "block",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: 0,
          opacity: 1,
        });
        gsap.set(bg, { opacity: 0, display: "block" });

        const tl = gsap.timeline();

        // Subtle dark curtain so the page swap is masked
        tl.to(bg, { opacity: 0.75, duration: 0.3, ease: "power2.out" }, 0);

        // Slide artwork to its destination in the event detail page
        tl.to(overlay, {
          top: pt, left: pl, width: tw, height: th,
          duration: 0.7,
          ease: "expo.inOut",
        }, 0);

        // Navigate during the movement
        tl.call(() => { router.push(href); }, [], 0.45);

        // Fade out dark curtain → reveal new page
        tl.to(bg, {
          opacity: 0, duration: 0.5, ease: "power2.out",
          onComplete: () => { gsap.set(bg, { display: "none" }); },
        }, 0.85);

        // Fade out artwork overlay (new page's artwork is now visible underneath)
        tl.to(overlay, {
          opacity: 0, duration: 0.35, ease: "power2.out",
          onComplete: () => {
            gsap.set(overlay, { display: "none" });
            if (img) img.style.display = "none";
            setIsTransitioning(false);
          },
        }, 0.9);
      } else {
        // Simple curtain sweep for nav links
        gsap.set(bg, { display: "block", opacity: 0, top: 0, left: 0, width: "100vw", height: "100vh" });
        gsap.to(bg, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            router.push(href);
            gsap.to(bg, {
              opacity: 0,
              duration: 0.45,
              delay: 0.1,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(bg, { display: "none" });
                setIsTransitioning(false);
              },
            });
          },
        });
      }
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ navigateTo, isTransitioning }}>
      {children}
      {/* Image-expand clone — shows artwork flying to fullscreen */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          display: "none",
          background: "#000000",
          zIndex: 99998,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <img
          ref={overlayImgRef}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "none",
          }}
        />
      </div>
      {/* Dark curtain — used for simple nav transitions */}
      <div
        ref={bgRef}
        style={{
          position: "fixed",
          display: "none",
          inset: 0,
          background: "#000000",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      />
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);
