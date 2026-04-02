"use client";

import { useRef, useEffect } from "react";

const VERT = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = 0.5 * (a_pos + 1.0);
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2  u_mouse;
  uniform float u_fade;
  uniform float u_aspect;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float sn(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vec2(v_uv.x * u_aspect, v_uv.y);
    vec2 m  = vec2(u_mouse.x * u_aspect, u_mouse.y);
    float d = length(uv - m);

    // Expanding ripple rings from cursor
    float r = fract(d * 5.5 - u_time * 1.6);
    float ring = smoothstep(0.0, 0.22, r) * smoothstep(1.0, 0.78, r);
    ring *= smoothstep(1.0, 0.04, d);

    // Ambient gold shimmer
    float sh = (sn(uv * 6.0 + u_time * 0.35) * 0.6 +
                sn(uv * 13.0 - u_time * 0.2) * 0.4) * smoothstep(0.75, 0.0, d) * 0.45;

    float intensity = (ring * 0.85 + sh) * u_fade;
    vec3  col = mix(vec3(0.831, 0.647, 0.376), vec3(1.0, 0.91, 0.58), ring);

    gl_FragColor = vec4(col * intensity, intensity * 0.88);
  }
`;

interface State {
  fade: number; target: number; time: number;
  mouse: { x: number; y: number };
  raf: number;
  gl: WebGLRenderingContext | null;
  prg: WebGLProgram | null;
  buf: WebGLBuffer | null;
  uTime: WebGLUniformLocation | null;
  uMouse: WebGLUniformLocation | null;
  uFade: WebGLUniformLocation | null;
  uAspect: WebGLUniformLocation | null;
}

export function GlHoverEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef<State>({
    fade: 0, target: 0, time: 0,
    mouse: { x: 0.5, y: 0.5 }, raf: 0,
    gl: null, prg: null, buf: null,
    uTime: null, uMouse: null, uFade: null, uAspect: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const st = stRef.current;

    const glRaw = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!glRaw) return;
    const gl: WebGLRenderingContext = glRaw;
    const cvs: HTMLCanvasElement = canvas;
    st.gl = gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const mk = (t: number, src: string) => {
      const s = gl.createShader(t)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prg = gl.createProgram()!;
    gl.attachShader(prg, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prg, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prg);
    st.prg = prg;

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    st.buf = buf;

    st.uTime   = gl.getUniformLocation(prg, "u_time");
    st.uMouse  = gl.getUniformLocation(prg, "u_mouse");
    st.uFade   = gl.getUniformLocation(prg, "u_fade");
    st.uAspect = gl.getUniformLocation(prg, "u_aspect");

    const parent = canvas.parentElement!;

    function resize() {
      const r = parent.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      cvs.width  = Math.round(r.width  * dpr);
      cvs.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, cvs.width, cvs.height);
    }
    resize();

    let lastT = 0;
    function loop(t: number) {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      st.time += dt;
      st.fade += (st.target - st.fade) * Math.min(4 * dt, 1);

      if (st.fade < 0.005 && st.target === 0) { st.raf = 0; return; }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prg);

      const pos = gl.getAttribLocation(prg, "a_pos");
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(st.uTime!,  st.time);
      gl.uniform2f(st.uMouse!, st.mouse.x, 1.0 - st.mouse.y);
      gl.uniform1f(st.uFade!,  st.fade);
      gl.uniform1f(st.uAspect!, cvs.width > 0 ? cvs.width / cvs.height : 1);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      st.raf = requestAnimationFrame(loop);
    }

    const onEnter = (e: MouseEvent) => {
      st.target = 1;
      const r = parent.getBoundingClientRect();
      st.mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      if (!st.raf) { lastT = performance.now(); st.raf = requestAnimationFrame(loop); }
    };
    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      st.mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    const onLeave = () => { st.target = 0; };

    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mousemove",  onMove);
    parent.addEventListener("mouseleave", onLeave);

    return () => {
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mousemove",  onMove);
      parent.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(st.raf);
      gl.deleteProgram(prg);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: "screen",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
