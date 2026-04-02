// Generic animation types shared across lib/gsap/animations.ts and components.

export type AnimationDirection = "up" | "down" | "left" | "right";

export interface FadeInProps {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
}

export interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  splitBy?: "chars" | "words";
  delay?: number;
  duration?: number;
  stagger?: number;
  className?: string;
}
