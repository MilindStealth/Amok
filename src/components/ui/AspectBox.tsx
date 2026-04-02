import Image from "next/image";
import { cn } from "@/lib/utils";

type AspectRatio = "1/1" | "4/3" | "3/4" | "16/9" | "9/16" | "21/9" | "3/2" | "2/3";

interface AspectBoxProps {
  src: string;
  alt: string;
  /** Aspect ratio of the box — e.g. "16/9", "3/4", "1/1" */
  ratio?: AspectRatio;
  /** Use priority for above-the-fold images (hero, first screen) */
  priority?: boolean;
  /** object-fit mode */
  fit?: "cover" | "contain";
  /** Fade-in animation class — add "group" to parent and animate with CSS */
  className?: string;
  imageClassName?: string;
}

/**
 * AspectBox — a responsive image container that preserves aspect ratio.
 * Prevents layout shift (CLS) by reserving space before the image loads.
 *
 * Usage:
 *   <AspectBox src="/project.jpg" alt="Project" ratio="16/9" />
 *   <AspectBox src="/portrait.jpg" alt="Person" ratio="3/4" priority />
 *
 * For a media placeholder (no image yet):
 *   <AspectBox src="" alt="" ratio="16/9" />  ← renders a surface-colored box
 */
export function AspectBox({
  src,
  alt,
  ratio = "16/9",
  priority = false,
  fit = "cover",
  className,
  imageClassName,
}: AspectBoxProps) {
  return (
    <div
      className={cn("relative overflow-hidden bg-surface", className)}
      style={{ aspectRatio: ratio.replace("/", " / ") }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={cn(
            "transition-transform duration-cinematic ease-out-expo",
            fit === "cover"   && "object-cover",
            fit === "contain" && "object-contain",
            // Scale on parent hover — add "group" class to the parent
            "group-hover:scale-[1.04]",
            imageClassName
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      )}
    </div>
  );
}
