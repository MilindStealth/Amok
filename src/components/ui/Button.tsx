import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  /** Renders as <a> instead of <button> */
  href?: string;
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon placed after the label */
  iconRight?: React.ReactNode;
  /** Icon placed before the label */
  iconLeft?: React.ReactNode;
}

type ButtonProps = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;

/* ── Style maps ──────────────────────────────────────────── */

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-accent text-bg font-semibold",
    "hover:bg-accent-dim",
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "active:scale-[0.97]",
  ),
  secondary: cn(
    "border border-border-strong text-fg",
    "hover:bg-white/5 hover:border-border-strong",
    "focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "active:scale-[0.97]",
  ),
  ghost: cn(
    "text-fg/60",
    "hover:text-fg",
    "focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "active:scale-[0.97]",
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8  px-4  text-xs  gap-1.5 rounded-full",
  md: "h-11 px-6  text-sm  gap-2   rounded-full",
  lg: "h-14 px-8  text-base gap-2.5 rounded-full",
};

/* ── Base class applied to every button ─────────────────── */
const base = cn(
  "inline-flex items-center justify-center",
  "font-medium tracking-wide",
  "transition-all",
  "duration-normal",
  "ease-out-expo",
  "cursor-pointer",
  "select-none",
  "outline-none",
  "disabled:opacity-40 disabled:pointer-events-none",
  "whitespace-nowrap",
);

/**
 * Button — the primary interactive element.
 *
 * Renders as <button> by default, or <a> when `href` is provided.
 *
 * Usage:
 *   <Button>Click me</Button>
 *   <Button variant="secondary" size="lg">See work</Button>
 *   <Button href="#contact" variant="primary">Let's talk</Button>
 *   <Button variant="ghost" iconRight={<ArrowRight />}>Read more</Button>
 */
export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  href,
  external,
  disabled,
  iconLeft,
  iconRight,
  ...props
}: ButtonProps) {
  const classes = cn(base, variantStyles[variant], sizeStyles[size], className);

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-disabled={disabled}
      >
        {iconLeft && <span className="shrink-0">{iconLeft}</span>}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
