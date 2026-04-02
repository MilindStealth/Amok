"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Center } from "@react-three/drei";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/3D/amok.gltf");
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export function ModelViewer() {
  const [active, setActive] = useState(false);

  const textBase: React.CSSProperties = {
    fontFamily: "var(--font-fenul, Georgia, serif)",
    fontSize: "clamp(28px, 5vw, 64px)",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    userSelect: "none",
    display: "inline-block",
    transition: "transform 0.7s cubic-bezier(0.19,1,0.22,1), color 0.5s ease, opacity 0.5s ease",
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        background: "#000",
        paddingTop: "clamp(24px, 3vw, 40px)",
        paddingBottom: "clamp(24px, 3vw, 40px)",
      }}
    >
      <div
        style={{ position: "relative", width: "min(600px, 90vw)", height: "min(600px, 90vw)", cursor: active ? "grabbing" : "grab" }}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
        onPointerLeave={() => setActive(false)}
      >
        {/* Background text — each word anchored from centre so spread is perfectly symmetric */}
        {/* NØ AMØK: right edge pinned to 50%, slides left on active */}
        <span style={{
          ...textBase,
          position: "absolute",
          top: "50%",
          left: "50%",
          // right-align from centre: shift left by own width + 12px gap
          transform: active
            ? "translate(calc(-100% - 200px), -50%)"
            : "translate(calc(-100% - 12px), -50%)",
          color: active ? "#ffffff" : "rgba(255,255,255,0.07)",
          zIndex: 0,
        }}>
          NØ AMØK
        </span>

        {/* NØ MALLØRCA: left edge pinned to 50%, slides right on active */}
        <span style={{
          ...textBase,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: active
            ? "translate(200px, -50%)"
            : "translate(12px, -50%)",
          color: active ? "#ffffff" : "rgba(255,255,255,0.07)",
          zIndex: 0,
        }}>
          NØ MALLØRCA
        </span>

        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: "relative", zIndex: 1, background: "transparent" }}
        >
          {/* Base fill */}
          <ambientLight intensity={0.4} />

          {/* Key light — warm front-top */}
          <directionalLight position={[3, 6, 4]} intensity={3.5} color="#ffffff" />

          {/* Rim light — cool blue from behind for edge glow */}
          <directionalLight position={[-4, 2, -6]} intensity={2.5} color="#6ab0ff" />

          {/* Accent spot — warm gold from below-right for drama */}
          <pointLight position={[4, -3, 3]} intensity={6} color="#d4a560" distance={12} decay={2} />

          {/* Fill light — soft from left */}
          <pointLight position={[-5, 3, 2]} intensity={3} color="#ffffff" distance={14} decay={2} />

          {/* Top shine — pure white overhead */}
          <spotLight position={[0, 8, 2]} intensity={8} angle={0.4} penumbra={0.6} color="#ffffff" />

          <Suspense fallback={null}>
            <Model />
            <Environment preset="studio" />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 0.75}
          />
        </Canvas>
      </div>
    </div>
  );
}

useGLTF.preload("/3D/amok.gltf");
