"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VERT = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = 0.5 * (a_pos + 1.0);
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

// u_res: low = blocky (state 1), high = crisp (state 2)
const FRAG = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform float u_res;

  void main() {
    vec2 uv = floor(v_uv * u_res) / u_res + 0.5 / u_res;
    gl_FragColor = texture2D(u_tex, clamp(uv, 0.0, 1.0));
  }
`;

interface Props {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}

export function GlPixelateImage({ src, alt, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;

    const glRaw = canvas.getContext("webgl", { alpha: false });
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
    const uRes   = gl.getUniformLocation(prg, "u_res");

    let tex: WebGLTexture | null = null;
    let loaded = false;
    // progress 0 = fully pixelated (state 1), 1 = fully crisp (state 2)
    const state = { progress: 0 };
    let raf = 0;

    function sizeCanvas() {
      const r   = parent.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      cvs.width  = Math.round(r.width  * dpr);
      cvs.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, cvs.width, cvs.height);
    }
    sizeCanvas();

    function draw() {
      if (!loaded || !tex) return;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prg);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uTex, 0);
      // progress 0 → u_res 8 (blocky), progress 1 → u_res 512 (crisp)
      const res = Math.round(8 + state.progress * 504);
      gl.uniform1f(uRes, res);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }

    // Load image texture
    const img = new Image();
    img.onload = () => {
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
      raf = requestAnimationFrame(loop);
    };
    img.src = src;

    // ScrollTrigger drives pixelation: state 1 (blocky) → state 2 (crisp)
    // Starts when the image enters the bottom of the viewport,
    // completes when it reaches 20% from the top.
    const st = ScrollTrigger.create({
      trigger: canvas,
      start: "top 95%",
      end: "top 20%",
      scrub: 1.2,
      onUpdate: (self) => {
        state.progress = self.progress;
      },
    });

    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(parent);

    return () => {
      st.kill();
      ro.disconnect();
      cancelAnimationFrame(raf);
      if (tex) gl.deleteTexture(tex);
      gl.deleteProgram(prg);
      gl.deleteBuffer(buf);
    };
  }, [src]);

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
        ...style,
      }}
    />
  );
}
