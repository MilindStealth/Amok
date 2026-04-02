"use client";

import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { TransitionProvider } from "./TransitionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <SmoothScrollProvider>
        {children}
      </SmoothScrollProvider>
    </TransitionProvider>
  );
}
