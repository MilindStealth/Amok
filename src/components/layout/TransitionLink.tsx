"use client";

import { useRef, type ReactNode, type CSSProperties, type MouseEventHandler } from "react";
import { usePageTransition } from "@/providers/TransitionProvider";

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  /** Pass the image/card element ref to trigger the expand-from-element effect */
  expandRef?: React.RefObject<HTMLElement | null>;
}

export function TransitionLink({ href, children, className, style, onMouseEnter, onMouseLeave, expandRef }: TransitionLinkProps) {
  const { navigateTo } = usePageTransition();

  return (
    <a
      href={href}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.preventDefault();
        navigateTo(href, expandRef?.current ?? null);
      }}
    >
      {children}
    </a>
  );
}
