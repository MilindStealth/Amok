import { cn } from "@/lib/utils";

interface DividerProps {
  /** "horizontal" (default) or "vertical" */
  orientation?: "horizontal" | "vertical";
  /** Stronger = more visible border */
  strong?: boolean;
  className?: string;
}

/**
 * Divider — a styled separator line.
 *
 * Usage:
 *   <Divider />
 *   <Divider strong />
 *   <div className="flex gap-4 items-center">
 *     <span>Label</span>
 *     <Divider orientation="vertical" className="h-4" />
 *     <span>Value</span>
 *   </div>
 */
export function Divider({
  orientation = "horizontal",
  strong = false,
  className,
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <span
        className={cn(
          "inline-block w-px self-stretch",
          strong ? "bg-border-strong" : "bg-border",
          className
        )}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <hr
      className={cn(
        "w-full border-none",
        strong ? "border-t border-border-strong" : "border-t border-border",
        className
      )}
      style={{ borderTopWidth: "1px", borderTopStyle: "solid" }}
    />
  );
}
