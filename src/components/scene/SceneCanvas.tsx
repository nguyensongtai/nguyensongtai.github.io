"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { SceneHandle, SceneTheme } from "./engine";

// Kept here (not imported from formations) so the generators stay out of the main bundle.
const SECTIONS = ["hero", "moso", "salon", "okxe", "approach", "ai", "experience", "contact"] as const;

/**
 * Fixed WebGL backdrop behind the whole page. three.js is fetched only after the
 * page is idle, so it never competes with the first paint; until then (and
 * without WebGL) a CSS glow stands in.
 */
export function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let handle: SceneHandle | null = null;
    let observer: IntersectionObserver | null = null;
    let themeObserver: MutationObserver | null = null;
    const theme = (): SceneTheme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

    const start = async () => {
      const { createScene } = await import("./engine");
      if (cancelled || !canvasRef.current) return;
      handle = createScene(canvasRef.current, {
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        theme: theme(),
        onReady: () => setReady(true),
      });
      if (!handle) return;
      themeObserver = new MutationObserver(() => handle?.setTheme(theme()));
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) handle?.setSection(e.target.id as (typeof SECTIONS)[number]);
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    };

    // Safari has no requestIdleCallback, despite what the DOM typings say.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 2500 })
      : window.setTimeout(() => void start(), 400);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      observer?.disconnect();
      themeObserver?.disconnect();
      handle?.dispose();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="scene-fallback absolute inset-0" />
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-[1800ms] ease-out",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="scene-vignette absolute inset-0" />
    </div>
  );
}
