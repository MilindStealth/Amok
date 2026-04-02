import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  /** "line" adds a short horizontal dash before the text — classic editorial detail */
  withLine?: boolean;
  /** Color: muted (default), accent (lime), or inherit */
  color?: "muted" | "accent" | "default";
  className?: string;
}

const colorMap = {
  muted:   "text-muted",
  accent:  "text-accent",
  default: "text-fg",
} as const;

/**
 * Eyebrow — the small label above a headline.
 * Signals to the reader what category or context is coming.
 *
 * Usage:
 *   <Eyebrow>Selected Work</Eyebrow>
 *   <Eyebrow withLine color="accent">New project</Eyebrow>
 */
export function Eyebrow({
  children,
  withLine = false,
  color = "muted",
  className,
}: EyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-3",
        "text-xs font-medium tracking-widest uppercase",
        colorMap[color],
        className
      )}
    >
      {withLine && (
        // Short horizontal line — the eyebrow "dash"
        <span
          className="inline-block h-px w-8 shrink-0"
          style={{ backgroundColor: "currentColor", opacity: 0.5 }}
          aria-hidden="true"
        />
      )}
      {children}
    </p>
  );
}
