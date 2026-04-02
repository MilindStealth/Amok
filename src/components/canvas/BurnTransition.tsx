"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Vertex shader ─────────────────────────────────────────────────────────────
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Fragment shader ───────────────────────────────────────────────────────────
// Adapted from akella/webGLImageTransitions Demo 1.
// Replaces 4D Perlin noise with 2D simplex noise (same visual; no w/time dependency).
const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float progress;  // 0 → 1
  uniform float width;     // band thickness at peak
  uniform float scaleX;    // noise x scale
  uniform float scaleY;    // noise y scale

  // ── 2D Simplex noise (Stefan Gustavson / Ian McEwan) ─────────────────────
  vec3 _mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 _mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 _permute(vec3 x) { return _mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy  -= i1;
    i = _mod289(i);
    vec3 p = _permute(_permute(i.y + vec3(0.0, i1.y, 1.0))
                              + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h   = abs(x_) - 0.5;
    vec3 ox  = floor(x_ + 0.5);
    vec3 a0  = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x   + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  float parabola(float x, float k) {
    return pow(4.0 * x * (1.0 - x), k);
  }

  void main() {
    float dt        = parabola(progress, 1.0);
    float realnoise = 0.5 * (snoise(vec2(vUv.x * scaleX, vUv.y * scaleY)) + 1.0);

    float w         = width * dt;
    float maskvalue = smoothstep(1.0 - w, 1.0,
                        vUv.x + mix(-w / 2.0, 1.0 - w / 2.0, progress));
    float mask      = maskvalue + maskvalue * realnoise;
    float burned    = smoothstep(1.0, 1.01, mask);

    // ── Fire edge (orange → yellow glow at the noise boundary) ───────────
    float edgeMask  = smoothstep(0.65, 1.0, mask) * (1.0 - burned);
    vec3  fireDeep  = vec3(1.0, 0.12, 0.0);   // deep red-orange
    vec3  fireBright = vec3(1.0, 0.80, 0.10);  // bright yellow
    vec3  fireColor  = mix(fireDeep, fireBright, edgeMask);

    vec3 dark  = vec3(0.031, 0.031, 0.031);  // #080808
    vec3 light = vec3(1.0);                   // white

    vec3 col = mix(dark, light, burned);
    col      = mix(col, fireColor, edgeMask * 0.95);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function BurnTransition({ triggerRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const triggerEl = triggerRef.current;
    if (!wrap || !triggerEl) return;

    // ── Three.js scene ───────────────────────────────────────────────────────
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    wrap.appendChild(renderer.domElement);

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    camera.position.z = 0.5;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0 },
        width:    { value: 0.5 },
        scaleX:   { value: 30 },
        scaleY:   { value: 30 },
      },
      vertexShader:   VERT,
      fragmentShader: FRAG,
    });

    const geo  = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    function render() {
      renderer.render(scene, camera);
    }
    render(); // paint one frame so it's not blank when it fades in

    // ── ScrollTrigger ────────────────────────────────────────────────────────
    // "top bottom" → "top top" = exactly 100vh of scroll travel.
    // First 50%: canvas burns in (dark → white via noise wipe).
    // Last  50%: canvas fades out, revealing the Sunset Parties section.
    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start:   "top bottom",
      end:     "top top",
      scrub:   1,
      onUpdate({ progress: p }) {
        if (p < 0.5) {
          wrap.style.opacity              = String(p * 2);
          material.uniforms.progress.value = p * 2;
        } else {
          wrap.style.opacity              = String(2 - p * 2);
          material.uniforms.progress.value = 1;
        }
        render();
      },
    });

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    };
    window.addEventListener("resize", onResize);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
      geo.dispose();
      material.dispose();
      renderer.dispose();
      if (wrap.contains(renderer.domElement)) wrap.removeChild(renderer.domElement);
    };
  }, [triggerRef]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "fixed", inset: 0, zIndex: 98, opacity: 0, pointerEvents: "none" }}
    />
  );
}
