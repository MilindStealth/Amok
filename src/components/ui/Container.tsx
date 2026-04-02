import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  /**
   * "default"  → max-w 1440px, responsive horizontal padding
   * "narrow"   → max-w 860px  (for text-heavy content like articles)
   * "wide"     → max-w 1600px (for edge-to-edge gallery layouts)
   * "full"     → no max-width, only padding
   */
  size?: "default" | "narrow" | "wide" | "full";
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "header" | "footer";
}

const sizeMap = {
  default: "max-w-[1440px]",
  narrow:  "max-w-[860px]",
  wide:    "max-w-[1600px]",
  full:    "max-w-none",
} as const;

/**
 * Layout container — centers content with consistent horizontal padding.
 *
 * Usage:
 *   <Container>                    ← default width
 *   <Container size="narrow">      ← article width
 *   <Container size="wide">        ← gallery width
 */
export function Container({
  children,
  size = "default",
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full container-x", // centered, full width, responsive padding
        sizeMap[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}
