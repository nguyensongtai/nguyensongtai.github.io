"use client";

import { useCallback, type HTMLAttributes, type PointerEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * Tracks the pointer with two CSS variables; the glow itself is CSS-only and
 * gated behind `(hover: hover) and (pointer: fine)`, so touch devices skip it.
 */
export function Spotlight({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <div className={cn("spotlight", className)} onPointerMove={onPointerMove} {...rest}>
      {children}
    </div>
  );
}
