"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Shaders ────────────────────────────────────────────────────────────────

const VERT = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG_MAIN = `
  precision mediump float;
  varying vec2 v_uv;
  uniform vec3  u_color;
  uniform vec3  u_transition_color;
  uniform float u_noise_scale;
  uniform float u_noise_intensity;
  uniform float u_scroll_offset;
  uniform float u_edge_softness;
  uniform float u_grain_scale;
  uniform float u_movement_horizontal;
  uniform float u_movement_vertical;
  uniform float u_parallax_offset;
  uniform float u_aspect_ratio;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  float noise(vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i), b = random(i+vec2(1.,0.)),
          c = random(i+vec2(0.,1.)), d = random(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
  }
  float fbm(vec2 st) {
    float v=0., a=0.5;
    for(int i=0;i<4;i++){ v+=a*noise(st); st*=2.; a*=0.5; }
    return v;
  }
  float detailedNoise(vec2 st) {
    float v=0., a=0.5;
    for(int i=0;i<6;i++){ v+=a*noise(st); st*=2.2; a*=0.45; }
    return v;
  }
  void main() {
    float baseLine = 0.5 + u_parallax_offset;
    float hOff = u_scroll_offset * u_movement_horizontal;
    float vOff = u_scroll_offset * u_movement_vertical;
    vec2 nc = vec2(v_uv.x*u_aspect_ratio*u_noise_scale+hOff, v_uv.y*3.+vOff*0.6);
    float mainEdge = baseLine + (fbm(nc)-0.5)*u_noise_intensity;
    vec2 tnc = vec2(v_uv.x*u_aspect_ratio*u_noise_scale*2.3+hOff*0.7, v_uv.y*2.+vOff*0.4+100.);
    float tNoise = fbm(tnc);
    float localT = mix(u_edge_softness*0.1, u_edge_softness, tNoise);
    float lower = mainEdge - localT*0.4;
    float upper = mainEdge + localT*0.6;
    vec2 gc = vec2(v_uv.x*u_aspect_ratio*u_grain_scale*3.+hOff*0.5, v_uv.y*u_grain_scale*3.+vOff*0.3);
    float grain = detailedNoise(gc);
    float fiber = noise(vec2(v_uv.x*u_aspect_ratio*u_grain_scale*8.+hOff*0.3, v_uv.y*u_grain_scale*2.+vOff*0.2));
    float combined = grain*0.6 + fiber*0.4;
    if (v_uv.y < lower) {
      gl_FragColor = vec4(u_color, 1.0);
    } else if (v_uv.y < mainEdge) {
      float t = (v_uv.y-lower)/max(mainEdge-lower, 0.001);
      float thresh = 1.-pow(t,1.5) - tNoise*0.2;
      gl_FragColor = combined > thresh ? vec4(u_transition_color,1.) : vec4(u_color,1.);
    } else if (v_uv.y < upper) {
      float t = (v_uv.y-mainEdge)/max(upper-mainEdge, 0.001);
      float thresh = pow(t,1.2) + tNoise*0.15;
      if (combined > thresh) { gl_FragColor = vec4(u_transition_color,1.); } else { discard; }
    } else {
      discard;
    }
  }
`;

const FRAG_BLOOM_EXTRACT = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec3 u_transition_color;
  uniform vec3 u_base_color;
  void main() {
    vec4 px = texture2D(u_texture, v_uv);
    float dT = length(px.rgb - u_transition_color);
    float dB = length(px.rgb - u_base_color);
    float mask = (1.-smoothstep(0.,0.5,dT)) * smoothstep(0.,0.3,dB) * px.a;
    gl_FragColor = vec4(1.,1.,1., pow(mask,0.8));
  }
`;

const FRAG_BLUR = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_direction;
  uniform vec2 u_resolution;
  uniform float u_radius;
  void main() {
    float sz = u_radius * 12.;
    float alpha = 0., total = 0.;
    for(int i=-6;i<=6;i++){
      float o = float(i);
      float w = exp(-0.5*(o*o)/4.);
      vec2 off = u_direction*(o*sz)/u_resolution;
      alpha += texture2D(u_texture, v_uv+off).a * w;
      total += w;
    }
    gl_FragColor = vec4(1.,1.,1., total>0. ? alpha/total : 0.);
  }
`;

const FRAG_COMPOSITE = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_scene;
  uniform sampler2D u_bloom;
  uniform float u_bloom_intensity;
  uniform vec3 u_transition_color;
  void main() {
    vec4 scene = texture2D(u_scene, v_uv);
    float bloomStr = texture2D(u_bloom, v_uv).a * u_bloom_intensity;
    if (scene.a < 0.001) {
      gl_FragColor = vec4(u_transition_color, bloomStr*1.5);
    } else {
      gl_FragColor = vec4(min(scene.rgb + u_transition_color*bloomStr*2., vec3(1.)), scene.a);
    }
  }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BurnConfig {
  color: string;
  transitionColor: string;
  noiseScale: number;
  noiseIntensity: number;
  edgeSoftness: number;
  grainScale: number;
  movementH: number;
  movementV: number;
  baseSpeed: number;
  bloomIntensity: number;
  bloomWidth: number;
}

const DEFAULT_CONFIG: BurnConfig = {
  color: "#F5EFE3",
  transitionColor: "#f97316",
  noiseScale: 0.45,
  noiseIntensity: 0.55,
  edgeSoftness: 0.12,
  grainScale: 18,
  movementH: 0.4,
  movementV: 0.15,
  baseSpeed: 0.18,
  bloomIntensity: 1.4,
  bloomWidth: 0.35,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function mkShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function mkProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return p;
}

function mkFB(gl: WebGLRenderingContext, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fb, tex };
}

function drawQuad(gl: WebGLRenderingContext, buf: WebGLBuffer, posLoc: number) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// ─── Control Panel ───────────────────────────────────────────────────────────

function ControlPanel({
  config,
  onChange,
  onClose,
}: {
  config: BurnConfig;
  onChange: (k: keyof BurnConfig, v: number | string) => void;
  onClose: () => void;
}) {
  const row = (label: string, key: keyof BurnConfig, min: number, max: number, step = 0.01) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
      <span style={{ width: 120, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-saans, sans-serif)", textTransform: "uppercase", flexShrink: 0 }}>
        {label}
      </span>
      <input type="range" min={min} max={max} step={step}
        value={config[key] as number}
        onChange={(e) => onChange(key, parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "#f97316" }}
      />
      <span style={{ width: 38, fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", textAlign: "right" }}>
        {(config[key] as number).toFixed(2)}
      </span>
    </div>
  );

  const colorRow = (label: string, key: keyof BurnConfig) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
      <span style={{ width: 120, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-saans, sans-serif)", textTransform: "uppercase", flexShrink: 0 }}>
        {label}
      </span>
      <input type="color" value={config[key] as string}
        onChange={(e) => onChange(key, e.target.value)}
        style={{ width: 36, height: 24, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, background: "none", cursor: "pointer", padding: 1 }}
      />
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{config[key] as string}</span>
    </div>
  );

  return (
    <div style={{
      position: "fixed", bottom: 80, left: 24, zIndex: 300,
      background: "rgba(8,8,8,0.96)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "20px 24px", width: 360,
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      animation: "panelIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-saans, sans-serif)", textTransform: "uppercase", marginBottom: 4 }}>Burn Transition</p>
          <p style={{ fontSize: 13, color: "#fff", fontFamily: "var(--font-fenul, Georgia, serif)", letterSpacing: "-0.01em" }}>Control Panel</p>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14, marginBottom: 14 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-saans,sans-serif)", textTransform: "uppercase", marginBottom: 12 }}>Colors</p>
        {colorRow("Fill Color", "color")}
        {colorRow("Burn Edge", "transitionColor")}
      </div>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14, marginBottom: 14 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-saans,sans-serif)", textTransform: "uppercase", marginBottom: 12 }}>Edge Shape</p>
        {row("Noise Scale", "noiseScale", 0.05, 1)}
        {row("Noise Intensity", "noiseIntensity", 0.05, 1)}
        {row("Edge Softness", "edgeSoftness", 0.02, 0.4)}
        {row("Grain Scale", "grainScale", 4, 40, 0.5)}
      </div>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14, marginBottom: 14 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-saans,sans-serif)", textTransform: "uppercase", marginBottom: 12 }}>Motion</p>
        {row("H Movement", "movementH", -1, 1)}
        {row("V Movement", "movementV", -1, 1)}
        {row("Base Speed", "baseSpeed", 0, 1)}
      </div>

      <div>
        <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-saans,sans-serif)", textTransform: "uppercase", marginBottom: 12 }}>Bloom</p>
        {row("Intensity", "bloomIntensity", 0, 3)}
        {row("Width", "bloomWidth", 0.05, 1)}
      </div>

      <style>{`@keyframes panelIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function BurnTransitionOverlay({ triggerRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const configRef = useRef<BurnConfig>(DEFAULT_CONFIG);
  const stateRef  = useRef({ parallaxOffset: 0.5, scrollOffset: 0, active: false, raf: 0, time: 0 });

  const [panelOpen, setPanelOpen] = useState(false);
  const [config, setConfig] = useState<BurnConfig>(DEFAULT_CONFIG);

  const handleChange = useCallback((k: keyof BurnConfig, v: number | string) => {
    setConfig((prev) => {
      const next = { ...prev, [k]: v };
      configRef.current = next;
      return next;
    });
  }, []);

  // WebGL init
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const glRaw = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!glRaw) return;
    const gl = glRaw as WebGLRenderingContext;
    const cvs = canvas as HTMLCanvasElement;

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const pMain      = mkProgram(gl, VERT, FRAG_MAIN);
    const pExtract   = mkProgram(gl, VERT, FRAG_BLOOM_EXTRACT);
    const pBlur      = mkProgram(gl, VERT, FRAG_BLUR);
    const pComposite = mkProgram(gl, VERT, FRAG_COMPOSITE);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    let W = 0, H = 0;
    let mainFB:   ReturnType<typeof mkFB> | null = null;
    let bloomFB:  ReturnType<typeof mkFB> | null = null;
    let blurHFB:  ReturnType<typeof mkFB> | null = null;
    let blurVFB:  ReturnType<typeof mkFB> | null = null;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      cvs.width  = W;
      cvs.height = H;
      gl.viewport(0, 0, W, H);
      mainFB  = mkFB(gl, W, H);
      bloomFB = mkFB(gl, W, H);
      blurHFB = mkFB(gl, W, H);
      blurVFB = mkFB(gl, W, H);
    }
    resize();
    window.addEventListener("resize", resize);

    function renderFrame(dt: number) {
      if (!mainFB || !bloomFB || !blurHFB || !blurVFB) return;
      const cfg = configRef.current;
      const s   = stateRef.current;
      s.time += dt * cfg.baseSpeed;

      const col  = hexToRgb(cfg.color);
      const burn = hexToRgb(cfg.transitionColor);
      const ns   = 1 + cfg.noiseScale * 19;
      const ni   = cfg.noiseIntensity * 0.5;
      const es   = 0.01 + cfg.edgeSoftness * 0.29;
      const bw   = cfg.bloomWidth;

      // ── Pass 1: main burn effect → mainFB ──────────────────────────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, mainFB.fb);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pMain);
      gl.uniform3fv(gl.getUniformLocation(pMain, "u_color"), col);
      gl.uniform3fv(gl.getUniformLocation(pMain, "u_transition_color"), burn);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_noise_scale"), ns);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_noise_intensity"), ni);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_scroll_offset"), s.scrollOffset);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_edge_softness"), es);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_grain_scale"), cfg.grainScale);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_movement_horizontal"), cfg.movementH);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_movement_vertical"), cfg.movementV);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_parallax_offset"), s.parallaxOffset);
      gl.uniform1f(gl.getUniformLocation(pMain, "u_aspect_ratio"), W / H);
      drawQuad(gl, buf, gl.getAttribLocation(pMain, "a_position"));

      // ── Pass 2: bloom extract ───────────────────────────────────────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFB.fb);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pExtract);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, mainFB.tex);
      gl.uniform1i(gl.getUniformLocation(pExtract, "u_texture"), 0);
      gl.uniform3fv(gl.getUniformLocation(pExtract, "u_transition_color"), burn);
      gl.uniform3fv(gl.getUniformLocation(pExtract, "u_base_color"), col);
      drawQuad(gl, buf, gl.getAttribLocation(pExtract, "a_position"));

      // ── Pass 3: horizontal blur ─────────────────────────────────────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, blurHFB.fb);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pBlur);
      gl.bindTexture(gl.TEXTURE_2D, bloomFB.tex);
      gl.uniform1i(gl.getUniformLocation(pBlur, "u_texture"), 0);
      gl.uniform2f(gl.getUniformLocation(pBlur, "u_direction"), 1, 0);
      gl.uniform2f(gl.getUniformLocation(pBlur, "u_resolution"), W, H);
      gl.uniform1f(gl.getUniformLocation(pBlur, "u_radius"), bw);
      drawQuad(gl, buf, gl.getAttribLocation(pBlur, "a_position"));

      // ── Pass 4: vertical blur ───────────────────────────────────────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, blurVFB.fb);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, blurHFB.tex);
      gl.uniform2f(gl.getUniformLocation(pBlur, "u_direction"), 0, 1);
      drawQuad(gl, buf, gl.getAttribLocation(pBlur, "a_position"));

      // ── Pass 5: composite to screen ─────────────────────────────────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pComposite);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, mainFB.tex);
      gl.uniform1i(gl.getUniformLocation(pComposite, "u_scene"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, blurVFB.tex);
      gl.uniform1i(gl.getUniformLocation(pComposite, "u_bloom"), 1);
      gl.uniform1f(gl.getUniformLocation(pComposite, "u_bloom_intensity"), cfg.bloomIntensity);
      gl.uniform3fv(gl.getUniformLocation(pComposite, "u_transition_color"), burn);
      drawQuad(gl, buf, gl.getAttribLocation(pComposite, "a_position"));
    }

    let lastT = 0;
    function loop(t: number) {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      stateRef.current.scrollOffset += dt;
      renderFrame(dt);
      stateRef.current.raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!stateRef.current.raf) {
        lastT = performance.now();
        stateRef.current.raf = requestAnimationFrame(loop);
      }
    }
    function stopLoop() {
      cancelAnimationFrame(stateRef.current.raf);
      stateRef.current.raf = 0;
    }

    // ── GSAP ScrollTrigger ────────────────────────────────────────────────────
    let st: ScrollTrigger | null = null;

    function setupST() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      st = ScrollTrigger.create({
        trigger,
        start: "top bottom",
        end:   "top top",
        scrub: 0.6,
        onEnter() {
          wrap!.style.opacity = "1";
          stateRef.current.parallaxOffset = 0.5;
          stateRef.current.active = true;
          startLoop();
        },
        onLeaveBack() {
          wrap!.style.opacity = "0";
          stateRef.current.active = false;
          stopLoop();
        },
        onUpdate({ progress: p }) {
          stateRef.current.parallaxOffset = 0.5 - p;
        },
        onEnterBack() {
          wrap!.style.opacity = "1";
          stateRef.current.active = true;
          startLoop();
        },
        onLeave() {
          wrap!.style.opacity = "0";
          stateRef.current.active = false;
          stopLoop();
        },
      });
    }

    // Wait one tick for triggerRef to be populated
    const tid = setTimeout(setupST, 100);

    return () => {
      clearTimeout(tid);
      st?.kill();
      stopLoop();
      window.removeEventListener("resize", resize);
      [mainFB, bloomFB, blurHFB, blurVFB].forEach((f) => {
        if (f) { gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.tex); }
      });
      gl.deleteProgram(pMain); gl.deleteProgram(pExtract);
      gl.deleteProgram(pBlur); gl.deleteProgram(pComposite);
      gl.deleteBuffer(buf);
    };
  }, [triggerRef]);

  return (
    <>
      <div
        ref={wrapRef}
        style={{ position: "fixed", inset: 0, zIndex: 99, opacity: 0, pointerEvents: "none" }}
      >
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>

      {/* Settings toggle button */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        title="Burn Transition settings"
        style={{
          position: "fixed", bottom: 28, left: 24, zIndex: 301,
          width: 40, height: 40, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(8,8,8,0.8)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          color: panelOpen ? "#f97316" : "rgba(255,255,255,0.6)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "color 0.2s, border-color 0.2s",
        }}
      >
        {/* Sliders icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="5" cy="4" r="1.5" fill="currentColor"/>
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="11" cy="8" r="1.5" fill="currentColor"/>
          <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      </button>

      {panelOpen && (
        <ControlPanel config={config} onChange={handleChange} onClose={() => setPanelOpen(false)} />
      )}
    </>
  );
}
