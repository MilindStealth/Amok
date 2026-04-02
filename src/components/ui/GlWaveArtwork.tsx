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
  uniform sampler2D u_tex;
  uniform float u_time;
  uniform float u_strength;

  void main() {
    vec2 uv = v_uv;
    float s = u_strength;
    uv.x += sin(uv.y * 11.0 + u_time * 2.1) * 0.024 * s;
    uv.y += cos(uv.x *  9.0 + u_time * 1.7) * 0.018 * s;
    uv.x += sin(uv.y *  5.5 - u_time * 1.0 + 1.8) * 0.012 * s;
    gl_FragColor = texture2D(u_tex, clamp(uv, 0.001, 0.999));
  }
`;

interface Props {
  src: string;
  alt: string;
  /** Controlled hover state — parent sets this so first-mount hover fires correctly */
  hovered?: boolean;
}

export function GlWaveArtwork({ src, alt, hovered }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;

    const glRaw = canvas.getContext("webgl", { alpha: true });
    if (!glRaw) return;
    const gl  = glRaw as WebGLRenderingContext;
    const cvs = canvas as HTMLCanvasElement;

    const mkShader = (type: number, s: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      return sh;
    };
    const prg = gl.createProgram()!;
    gl.attachShader(prg, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prg, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prg);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prg, "a_pos");
    const uTex   = gl.getUniformLocation(prg, "u_tex");
    const uTime  = gl.getUniformLocation(prg, "u_time");
    const uStr   = gl.getUniformLocation(prg, "u_strength");

    let strength = 0, target = 0, time = 0, raf = 0, lastT = 0;
    let tex: WebGLTexture | null = null;
    let loaded = false;
    let visible = false;

    // Cached decoded image — browser keeps it in memory, re-uploading is instant
    let cachedImage: HTMLImageElement | null = null;

    function sizeCanvas() {
      const r   = parent.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      cvs.width  = Math.round(r.width  * dpr);
      cvs.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, cvs.width, cvs.height);
    }
    sizeCanvas();

    function uploadTexture(img: HTMLImageElement) {
      if (tex) gl.deleteTexture(tex);
      tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      loaded = true;
      sizeCanvas();
    }

    function draw() {
      if (!loaded || !tex) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prg);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uTex, 0);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uStr, strength);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function loop(t: number) {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      time += dt;
      strength += (target - strength) * Math.min(6 * dt, 1);
      draw();
      if (strength > 0.005 || target > 0) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    }

    // Load image once; re-upload texture on re-enter if needed
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      cachedImage = img;
      if (visible) {
        uploadTexture(img);
        draw();
      }
    };
    img.src = src;

    // IntersectionObserver: upload/free GPU texture without touching the context
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          // Re-upload texture if it was freed (or first entry)
          if (!loaded && cachedImage) {
            uploadTexture(cachedImage);
            draw();
          } else if (!loaded && !cachedImage) {
            // Image not yet decoded — onload will handle it
          } else {
            // Already loaded, just redraw
            draw();
          }
        } else {
          // Free GPU texture memory when off-screen; keep the context slot
          cancelAnimationFrame(raf);
          raf = 0;
          if (tex) {
            gl.deleteTexture(tex);
            tex = null;
          }
          loaded = false;
          strength = 0;
          target = 0;
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onEnter = () => {
      target = 1;
      if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); }
    };
    const onLeave = () => {
      target = 0;
      if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); }
    };
    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(parent);

    return () => {
      io.disconnect();
      ro.disconnect();
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      if (tex) gl.deleteTexture(tex);
      gl.deleteProgram(prg);
      gl.deleteBuffer(buf);
    };
  }, [src]);

  // Dispatch synthetic mouse events so the internal listeners fire even when
  // the component mounts while the cursor is already inside (first-hover case).
  useEffect(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;
    parent.dispatchEvent(new MouseEvent(hovered ? "mouseenter" : "mouseleave", { bubbles: false }));
  }, [hovered]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
