"use client";

import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* --------------------------------
 * Types
 --------------------------------- */
export interface GalleryItem {
  image: string;
  text: string;
}

interface CircularGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: GalleryItem[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  fontClassName?: string;
}

/* --------------------------------
 * Helpers
 --------------------------------- */
function debounce(func: (...args: unknown[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: object) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof (instance as Record<string, unknown>)[key] === "function") {
      (instance as Record<string, unknown>)[key] = ((instance as Record<string, unknown>)[key] as (...a: unknown[]) => unknown).bind(instance);
    }
  });
}

function createTextTexture(gl: OGLRenderingContext, text: string, font: string, color: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const tw = Math.ceil(metrics.width);
  const th = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = tw + 20;
  canvas.height = th + 20;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

/* --------------------------------
 * OGL Classes
 --------------------------------- */
class Title {
  mesh!: Mesh;
  constructor({ gl, plane, renderer, text, textColor, font }: {
    gl: OGLRenderingContext; plane: Mesh; renderer: Renderer;
    text: string; textColor: string; font: string;
  }) {
    autoBind(this);
    void renderer;
    const { texture, width, height } = createTextTexture(gl, text, font, textColor);
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragment: `precision highp float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 c=texture2D(tMap,vUv);if(c.a<0.1)discard;gl_FragColor=c;}`,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(gl, { geometry, program });
    const aspect = width / height;
    const textHeight = plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(plane);
  }
}

class Media {
  gl: OGLRenderingContext;
  geometry: Plane;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: { width: number; height: number };
  text: string;
  viewport: { width: number; height: number };
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  extra = 0;
  widthTotal = 0;
  width = 0;
  x = 0;
  padding = 2;
  speed = 0;
  isBefore = false;
  isAfter = false;
  videoEl?: HTMLVideoElement;
  tex?: Texture;

  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font }: {
    geometry: Plane; gl: OGLRenderingContext; image: string; index: number; length: number;
    renderer: Renderer; scene: Transform; screen: { width: number; height: number };
    text: string; viewport: { width: number; height: number }; bend: number;
    textColor: string; borderRadius: number; font: string;
  }) {
    this.geometry = geometry; this.gl = gl; this.image = image;
    this.index = index; this.length = length; this.renderer = renderer;
    this.scene = scene; this.screen = screen; this.text = text;
    this.viewport = viewport; this.bend = bend; this.textColor = textColor;
    this.borderRadius = borderRadius; this.font = font;
    this.createShader(); this.createMesh(); this.createTitle(); this.onResize();
  }

  createShader() {
    const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(this.image);
    const texture = new Texture(this.gl, { generateMipmaps: !isVideo });
    this.tex = texture;
    this.program = new Program(this.gl, {
      depthTest: false, depthWrite: false,
      vertex: `precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform float uTime;uniform float uSpeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
      fragment: `precision highp float;uniform vec2 uImageSizes;uniform vec2 uPlaneSizes;uniform sampler2D tMap;uniform float uBorderRadius;varying vec2 vUv;float roundedBoxSDF(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}void main(){vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);vec4 color=texture2D(tMap,uv);float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);float alpha=1.0-smoothstep(-0.002,0.002,d);gl_FragColor=vec4(color.rgb,alpha);}`,
      uniforms: {
        tMap: { value: texture }, uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] }, uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() }, uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });

    if (isVideo) {
      const video = document.createElement("video");
      video.src = this.image;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.addEventListener("canplay", () => {
        texture.image = video as unknown as HTMLImageElement;
        texture.needsUpdate = true;
        this.program.uniforms.uImageSizes.value = [
          video.videoWidth  || 1080,
          video.videoHeight || 1920,
        ];
        video.play().catch(() => {});
      }, { once: true });
      video.load();
      this.videoEl = video;
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = this.image;
      img.onload = () => {
        texture.image = img;
        this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
      };
    }
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({ gl: this.gl, plane: this.plane, renderer: this.renderer, text: this.text, textColor: this.textColor, font: this.font });
  }

  update(scroll: { current: number; last: number }, direction: "left" | "right") {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) {
      this.plane.position.y = 0; this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }
    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter  = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) { this.extra -= this.widthTotal; this.isBefore = this.isAfter = false; }
    if (direction === "left"  && this.isAfter)  { this.extra += this.widthTotal; this.isBefore = this.isAfter = false; }

    // Keep video texture in sync with current frame
    if (this.videoEl && !this.videoEl.paused && this.tex) {
      this.tex.needsUpdate = true;
    }
  }

  destroyVideo() {
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.src = "";
      this.videoEl.load();
      this.videoEl = undefined;
    }
  }

  onResize({ screen, viewport }: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } } = {}) {
    if (screen)   this.screen = screen;
    if (viewport) this.viewport = viewport;
    this.plane.scale.y = (this.viewport.height * (900 * (this.screen.height / 1500))) / this.screen.height;
    this.plane.scale.x = (this.viewport.width  * (700 * (this.screen.height / 1500))) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: { ease: number; current: number; target: number; last: number; position?: number };
  onCheckDebounce: () => void;
  renderer!: Renderer;
  gl!: OGLRenderingContext;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  mediasImages!: GalleryItem[];
  medias!: Media[];
  isDown = false;
  start = 0;
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf!: number;

  constructor(container: HTMLElement, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase }: {
    items?: GalleryItem[]; bend: number; textColor: string; borderRadius: number;
    font: string; scrollSpeed: number; scrollEase: number;
  }) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    autoBind(this);
    this.createRenderer(); this.createCamera(); this.createScene();
    this.onResize(); this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update(); this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() { this.scene = new Transform(); }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }

  createMedias(items: GalleryItem[] | undefined, bend: number, textColor: string, borderRadius: number, font: string) {
    const defaults: GalleryItem[] = [
      { image: "https://picsum.photos/seed/1/800/600?grayscale", text: "Bridge" },
      { image: "https://picsum.photos/seed/2/800/600?grayscale", text: "Desk Setup" },
      { image: "https://picsum.photos/seed/3/800/600?grayscale", text: "Waterfall" },
    ];
    const galleryItems = items && items.length > 0 ? items : defaults;
    this.mediasImages = [...galleryItems, ...galleryItems];
    this.medias = this.mediasImages.map((data, index) => new Media({
      geometry: this.planeGeometry, gl: this.gl, image: data.image,
      index, length: this.mediasImages.length, renderer: this.renderer,
      scene: this.scene, screen: this.screen, text: data.text,
      viewport: this.viewport, bend, textColor, borderRadius, font,
    }));
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    this.scroll.target = (this.scroll.position ?? 0) + (this.start - x) * (this.scrollSpeed * 0.025);
  }

  onTouchUp() { this.isDown = false; this.onCheck(); }

  onWheel(e: WheelEvent) {
    const delta = e.deltaY || (e as unknown as { wheelDelta: number }).wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias?.[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
    this.medias?.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias?.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("wheel", this.onWheel as EventListener);
    this.container.addEventListener("mousedown", this.onTouchDown as EventListener);
    window.addEventListener("mousemove", this.onTouchMove as EventListener);
    window.addEventListener("mouseup", this.onTouchUp);
    this.container.addEventListener("touchstart", this.onTouchDown as EventListener);
    window.addEventListener("touchmove", this.onTouchMove as EventListener);
    window.addEventListener("touchend", this.onTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    this.medias?.forEach(m => m.destroyVideo());
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("wheel", this.onWheel as EventListener);
    this.container.removeEventListener("mousedown", this.onTouchDown as EventListener);
    window.removeEventListener("mousemove", this.onTouchMove as EventListener);
    window.removeEventListener("mouseup", this.onTouchUp);
    this.container.removeEventListener("touchstart", this.onTouchDown as EventListener);
    window.removeEventListener("touchmove", this.onTouchMove as EventListener);
    window.removeEventListener("touchend", this.onTouchUp);
    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

/* --------------------------------
 * React Component
 --------------------------------- */
const CircularGallery = ({
  items, bend = 3, borderRadius = 0.05,
  scrollSpeed = 2, scrollEase = 0.05,
  className, fontClassName, ...props
}: CircularGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const computed = getComputedStyle(el);
    const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    const app = new App(el, {
      items, bend, textColor: computed.color || "#ffffff",
      borderRadius, font, scrollSpeed, scrollEase,
    });
    return () => app.destroy();
  }, [items, bend, borderRadius, scrollSpeed, scrollEase, fontClassName]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden cursor-grab active:cursor-grabbing",
        "text-white font-bold text-[30px]",
        fontClassName, className,
      )}
      {...props}
    />
  );
};

export { CircularGallery };
