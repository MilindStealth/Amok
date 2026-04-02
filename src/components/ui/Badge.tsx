import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "outline" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default: "bg-surface-raised text-fg/70 inset-border",
  accent:  "bg-accent/10 text-accent border border-accent/20",
  outline: "bg-transparent text-fg/50 inset-border",
  muted:   "bg-transparent text-muted",
};

/**
 * Badge — a small pill label for categories, tags, and statuses.
 *
 * Usage:
 *   <Badge>Web Design</Badge>
 *   <Badge variant="accent">New</Badge>
 *   <Badge variant="outline">2025</Badge>
 */
export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "text-2xs font-medium tracking-wide uppercase",
        "px-2.5 py-1 rounded-full",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
