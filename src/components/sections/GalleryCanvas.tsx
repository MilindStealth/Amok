"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ParticleSphere } from "@/components/ui/ParticleSphere";

export default function GalleryCanvas() {
  const [mountKey, setMountKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Context-loss recovery
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setTimeout(() => setMountKey((k) => k + 1), 300);
    };
    el.addEventListener("webglcontextlost", handleContextLost, true);
    return () => el.removeEventListener("webglcontextlost", handleContextLost, true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedImage(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedImage]);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  return (
    <>
      <div ref={wrapperRef} style={{ width: "100%", height: "100vh", background: "#000" }}>
        <Canvas
          key={mountKey}
          camera={{ position: [0, 0, 19], fov: 60 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ background: "#000" }}
          frameloop="always"
        >
          <ambientLight intensity={0.5} />
          <ParticleSphere onImageClick={handleImageClick} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(3 * Math.PI) / 4}
          />
        </Canvas>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "lbFadeIn 0.25s ease",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: "clamp(20px, 3vw, 36px)",
              right: "clamp(20px, 3vw, 36px)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 201,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Image */}
          <img
            src={selectedImage}
            alt="Gallery"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(90vw, 1200px)",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "4px",
              animation: "lbScaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              display: "block",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes lbFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbScaleIn { from { transform: scale(0.88); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </>
  );
}
