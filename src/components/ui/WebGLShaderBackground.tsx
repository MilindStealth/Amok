"use client";

import { useEffect, useRef } from "react";

interface Props {
  theme: "sunset" | "night";
}

const VERT = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_theme;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 sunsetPalette(float t) {
    vec3 deep = vec3(0.14, 0.03, 0.01);
    vec3 mid  = vec3(0.52, 0.14, 0.02);
    vec3 glow = vec3(1.00, 0.42, 0.06);
    return mix(mix(deep, mid, smoothstep(0.1, 0.75, t)), glow, smoothstep(0.55, 1.0, t));
  }

  vec3 nightPalette(float t) {
    vec3 deep = vec3(0.00, 0.02, 0.07);
    vec3 mid  = vec3(0.02, 0.12, 0.32);
    vec3 glow = vec3(0.28, 0.56, 1.00);
    return mix(mix(deep, mid, smoothstep(0.1, 0.75, t)), glow, smoothstep(0.65, 1.0, t));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    float time  = u_time * 0.14;
    vec2  mouse = (u_mouse / u_resolution.xy) - 0.5;

    float beamCore = 1.0 - smoothstep(0.0, 0.42, abs(p.x + mouse.x * 0.15));
    float beamSoft = 1.0 - smoothstep(0.15, 0.95, abs(p.x + mouse.x * 0.18));
    float beam     = pow(beamCore, 2.8) * 0.85 + beamSoft * 0.18;

    float mist       = fbm(vec2(p.x * 1.8,  p.y * 1.2 + time));
    float drift      = fbm(vec2(p.x * 3.5 - time * 0.7, p.y * 2.2 + time * 0.4));
    float atmosphere = smoothstep(0.18, 1.0, mist * 0.7 + drift * 0.35);

    float verticalGlow = smoothstep(-1.15, 0.85, p.y);
    float pulse        = 0.92 + 0.08 * sin(u_time * 1.2);
    float mainLight    = beam * atmosphere * verticalGlow * pulse;

    vec2  particleField = uv * vec2(u_resolution.x / min(u_resolution.x, u_resolution.y), 1.0);
    float particleNoise = noise(particleField * 180.0 + vec2(0.0, time * 6.0));
    float particles     = smoothstep(0.992, 1.0, particleNoise) * (0.35 + beamSoft * 0.75);

    float sparkleNoise = noise(particleField * 90.0 - vec2(time * 2.5, 0.0));
    float sparkles     = smoothstep(0.985, 1.0, sparkleNoise) * 0.45;

    float grad   = pow(1.0 - uv.y, 1.8) * 0.85 + beamSoft * 0.25;
    vec3  sunset = sunsetPalette(grad + mainLight * 0.55);
    vec3  night  = nightPalette (grad + mainLight * 0.55);
    vec3  color  = mix(sunset, night, u_theme);

    vec3 beamTint = mix(vec3(1.0, 0.45, 0.08), vec3(0.35, 0.62, 1.0), u_theme);
    color += beamTint * mainLight * 0.9;
    color += beamTint * particles * 1.25;
    color += vec3(1.0) * sparkles * 0.25;

    float vignette = smoothstep(1.35, 0.25, length(p * vec2(0.9, 0.72)));
    color *= vignette;

    color  = pow(color, vec3(0.9));
    color  = color / (1.0 + color);
    color *= 1.2;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function WebGLShaderBackground({ theme }: Props) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const currentTheme   = useRef(theme === "sunset" ? 0.0 : 1.0);
  const targetTheme    = useRef(currentTheme.current);

  // Keep target in sync with prop changes
  useEffect(() => {
    targetTheme.current = theme === "sunset" ? 0.0 : 1.0;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function makeShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, makeShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, makeShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW
    );

    const aPos   = gl.getAttribLocation(program, "a_position");
    const uRes   = gl.getUniformLocation(program, "u_resolution");
    const uTime  = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTheme = gl.getUniformLocation(program, "u_theme");

    let mouseX = window.innerWidth  * 0.5;
    let mouseY = window.innerHeight * 0.5;
    let rafId: number;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width  = Math.floor(canvas!.offsetWidth  * dpr);
      canvas!.height = Math.floor(canvas!.offsetHeight * dpr);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = window.innerHeight - e.clientY;
    };

    window.addEventListener("resize",    resize);
    window.addEventListener("mousemove", onMouse);
    resize();

    function render(now: number) {
      // Smooth lerp toward target theme
      currentTheme.current += (targetTheme.current - currentTheme.current) * 0.05;

      gl!.useProgram(program);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.enableVertexAttribArray(aPos);
      gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);

      gl!.uniform2f(uRes,   canvas!.width, canvas!.height);
      gl!.uniform1f(uTime,  now * 0.001);
      gl!.uniform2f(uMouse, mouseX, mouseY);
      gl!.uniform1f(uTheme, currentTheme.current);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
