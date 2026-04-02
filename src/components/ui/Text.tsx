import { cn } from "@/lib/utils";

type TextVariant = "lead" | "body" | "small" | "caption" | "label";

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  /** Reduce opacity to ~50% — creates visual hierarchy without changing color */
  muted?: boolean;
  /** Accent color */
  accent?: boolean;
  as?: "p" | "span" | "div" | "li";
  align?: "left" | "center" | "right";
  balance?: boolean;
  className?: string;
}

/*
 * Variant map — what each variant is for:
 *   lead    → opening paragraph, large and airy
 *   body    → standard paragraph text
 *   small   → supporting details, secondary info
 *   caption → image captions, timestamps, metadata
 *   label   → UI labels, form labels (uppercase + tracked)
 */
const variantMap: Record<TextVariant, string> = {
  lead:    "text-lg  leading-relaxed",
  body:    "text-base leading-relaxed",
  small:   "text-sm  leading-normal",
  caption: "text-xs  leading-normal",
  label:   "text-xs  leading-none tracking-widest uppercase font-medium",
};

/**
 * Text — all body copy goes through this component.
 *
 * Usage:
 *   <Text variant="lead">Opening statement</Text>
 *   <Text variant="body" muted>Supporting detail</Text>
 *   <Text variant="label">Category</Text>
 *   <Text variant="caption" muted>Jan 2025</Text>
 */
export function Text({
  children,
  variant = "body",
  muted = false,
  accent = false,
  as: Tag = "p",
  align,
  balance = false,
  className,
}: TextProps) {
  return (
    <Tag
      className={cn(
        "font-body",
        variantMap[variant],
        muted  && "text-muted",
        accent && "text-accent",
        align === "center" && "text-center",
        align === "right"  && "text-right",
        balance && "text-balance",
        className
      )}
    >
      {children}
    </Tag>
  );
}
