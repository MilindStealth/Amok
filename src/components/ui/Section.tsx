import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  id?: string;                                    // anchor link target e.g. "work"
  background?: "default" | "surface" | "accent" | "none";
  /** Remove top or bottom padding — useful when sections flow into each other */
  noPaddingTop?: boolean;
  noPaddingBottom?: boolean;
  className?: string;
}

const bgMap = {
  default: "bg-bg",
  surface: "bg-surface",
  accent:  "bg-accent",
  none:    "",
} as const;

/**
 * Section wrapper — provides consistent vertical rhythm between page sections.
 *
 * Usage:
 *   <Section id="work">
 *     <Container>...</Container>
 *   </Section>
 *
 *   <Section id="about" background="surface" noPaddingTop>
 *     ...
 *   </Section>
 */
export function Section({
  children,
  id,
  background = "default",
  noPaddingTop = false,
  noPaddingBottom = false,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full",
        bgMap[background],
        !noPaddingTop    && "pt-[var(--space-section)]",
        !noPaddingBottom && "pb-[var(--space-section)]",
        className
      )}
    >
      {children}
    </section>
  );
}
