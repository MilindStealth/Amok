"use client";

import { useEffect, useState } from "react";

export interface WebGLCapabilities {
  /** WebGL is available at all */
  supported: boolean;
  /** WebGL 2.0 available (better precision, more features) */
  webgl2: boolean;
  /** Running on a mobile device */
  mobile: boolean;
  /**
   * Should we use reduced quality?
   * True on: mobile devices, devices without WebGL 2, devices with low DPR.
   * Used to choose between 6-octave FBM (high) vs 3-octave (low).
   */
  lowPower: boolean;
  /**
   * Capped device pixel ratio.
   * Desktop: up to 2.0 | Mobile: up to 1.5
   * Prevents over-rendering on high-DPI screens.
   */
  dpr: [number, number];
}

const DEFAULT: WebGLCapabilities = {
  supported: true,   // optimistic default avoids layout shift
  webgl2: true,
  mobile: false,
  lowPower: false,
  dpr: [1, 2],
};

/**
 * Detects WebGL capabilities and returns performance recommendations.
 *
 * Usage:
 *   const { supported, lowPower, dpr } = useWebGL();
 *   if (!supported) return <CSSFallback />;
 *   return <Canvas dpr={dpr}><Scene quality={lowPower ? "low" : "high"} /></Canvas>
 */
export function useWebGL(): WebGLCapabilities {
  const [caps, setCaps] = useState<WebGLCapabilities>(DEFAULT);

  useEffect(() => {
    // Create a temporary canvas to test WebGL context
    const testCanvas = document.createElement("canvas");
    const gl2 = testCanvas.getContext("webgl2");
    const gl1 = testCanvas.getContext("webgl");

    const supported = !!(gl2 || gl1);
    const webgl2    = !!gl2;

    // Release the test contexts immediately — don't waste GPU memory
    (gl2 as WebGL2RenderingContext | null)
      ?.getExtension("WEBGL_lose_context")?.loseContext();
    (gl1 as WebGLRenderingContext | null)
      ?.getExtension("WEBGL_lose_context")?.loseContext();

    const mobile   = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const lowPower = mobile || !webgl2 || window.devicePixelRatio < 1;

    setCaps({
      supported,
      webgl2,
      mobile,
      lowPower,
      // Cap DPR: mobile gets 1–1.5, desktop gets 1–2
      // This is the single biggest mobile performance win
      dpr: mobile ? [1, 1.5] : [1, 2],
    });
  }, []);

  return caps;
}
