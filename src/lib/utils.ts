import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names intelligently.
 * - clsx handles conditionals: cn("base", isActive && "active")
 * - twMerge resolves Tailwind conflicts: cn("px-4", "px-6") → "px-6"
 *
 * Usage:
 *   cn("text-sm font-bold", variant === "primary" && "bg-accent", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
