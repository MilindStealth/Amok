import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingSize  = "display" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl" | "xl" | "lg";

interface HeadingProps {
  children: React.ReactNode;
  /** Semantic HTML level — important for accessibility and SEO */
  as?: HeadingLevel;
  /**
   * Visual size — independent of semantic level.
   * h2 can look like a display size, h1 can look like 2xl.
   */
  size?: HeadingSize;
  /** Display font (Syne) or body font (Geist) */
  font?: "display" | "body";
  /** Center, left, or right align */
  align?: "left" | "center" | "right";
  /**
   * text-wrap: balance — prevents awkward single-word last lines.
   * Always use on short headings (3–7 words).
   */
  balance?: boolean;
  className?: string;
}

/* ── Size → class mapping ────────────────────────────────── */

const sizeMap: Record<HeadingSize, string> = {
  display: "text-display leading-[0.92] tracking-[-0.04em]",
  "6xl":   "text-6xl     leading-[0.95] tracking-[-0.035em]",
  "5xl":   "text-5xl     leading-[1]    tracking-[-0.03em]",
  "4xl":   "text-4xl     leading-[1.05] tracking-[-0.025em]",
  "3xl":   "text-3xl     leading-[1.1]  tracking-[-0.02em]",
  "2xl":   "text-2xl     leading-[1.15] tracking-[-0.015em]",
  "xl":    "text-xl      leading-[1.25] tracking-[-0.01em]",
  "lg":    "text-lg      leading-[1.35] tracking-[0em]",
};

const fontMap = {
  display: "font-display",
  body:    "font-body",
} as const;

const alignMap = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
} as const;

/**
 * Heading — all headings on the site go through this component.
 *
 * Usage:
 *   <Heading as="h1" size="display" balance>
 *     We craft digital experiences
 *   </Heading>
 *
 *   <Heading as="h2" size="4xl" align="center">
 *     Selected Work
 *   </Heading>
 *
 *   <Heading as="h3" size="xl" font="body">
 *     Project title
 *   </Heading>
 */
export function Heading({
  children,
  as: Tag = "h2",
  size = "3xl",
  font = "display",
  align = "left",
  balance = false,
  className,
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        "font-bold text-fg",
        fontMap[font],
        sizeMap[size],
        alignMap[align],
        balance && "text-balance",
        className
      )}
    >
      {children}
    </Tag>
  );
}
