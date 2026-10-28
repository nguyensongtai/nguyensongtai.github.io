"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { JourneyHandle, JourneyTheme } from "./world";

/** Page sections, in the order the camera visits them. */
export const JOURNEY_ANCHORS = ["hero", "stage-1", "stage-2", "stage-3", "stage-4", "stage-5", "contact"] as const;

// Milestone years over the beacons (seen from the start), and the stack around the stage-four city.
const BEACON_YEARS = ["2017", "2020", "2022", "2025"];
const TAG_LABELS = ["React", "Next.js 15", "TypeScript", "SSR · SEO", "Core Web Vitals", "AI · RAG · MCP"];

/**
 * Scroll position → camera progress. Each section holds its shot while you
 * read, then the camera travels to the next stop over the last stretch.
 */
function progressFor(y: number, anchors: number[]) {
  if (y <= anchors[0]) return 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (y > b) continue;
    const travel = Math.min((b - a) * 0.6, window.innerHeight * 1.1);
    const start = b - travel;
    const hold = start > a ? Math.min(1, Math.max(0, (y - a) / (start - a))) : 1;
    const move = Math.min(1, Math.max(0, (y - start) / travel));
    return i + hold * 0.06 + move * 0.94;
  }
  return anchors.length - 1;
}

export function JourneyCanvas({ labels }: { labels: { loading: string; next: string } }) {
  const beaconLabels = [...BEACON_YEARS, labels.next];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");

  useEffect(() => {
    let cancelled = false;
    let handle: JourneyHandle | null = null;
    let anchors: number[] = [];
    const cleanups: (() => void)[] = [];
    const theme = (): JourneyTheme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

    const measure = () => {
      // the camera arrives just before a section fills the screen
      const offset = window.innerHeight * 0.15;
      anchors = JOURNEY_ANCHORS.map((id, i) => {
        const el = document.getElementById(id);
        if (!el) return Infinity;
        return i === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY - offset;
      });
    };
    const onScroll = () => handle?.setProgress(progressFor(window.scrollY, anchors));

    const start = async () => {
      setState("loading");
      const { createJourney } = await import("./world");
      if (cancelled || !canvasRef.current) return;
      const labels = [...(labelsRef.current?.querySelectorAll<HTMLElement>("[data-label]") ?? [])].map((el) => ({
        key: el.dataset.label!,
        el,
      }));
      handle = await createJourney(canvasRef.current, {
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        theme: theme(),
        labels,
        onReady: () => setState("ready"),
      });
      if (cancelled) {
        handle?.dispose();
        return;
      }
      if (!handle) {
        setState("fallback");
        return;
      }
      measure();
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      const ro = new ResizeObserver(() => {
        measure();
        onScroll();
      });
      ro.observe(document.body);
      const mo = new MutationObserver(() => handle?.setTheme(theme()));
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      cleanups.push(() => window.removeEventListener("scroll", onScroll), () => ro.disconnect(), () => mo.disconnect());
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
      for (const c of cleanups) c();
      handle?.dispose();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <JourneyFallback />
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-[1400ms] ease-out",
          state === "ready" ? "opacity-100" : "opacity-0",
        )}
      />
      <div ref={labelsRef} className={cn("absolute inset-0", state === "ready" ? "" : "hidden")}>
        {beaconLabels.map((text, i) => (
          <span key={text} data-label={`beacon-${i}`} className="journey-label journey-label--year">
            {text}
          </span>
        ))}
        {TAG_LABELS.map((text, i) => (
          <span key={text} data-label={`tag-${i}`} className="journey-label">
            {text}
          </span>
        ))}
      </div>
      <div
        className={cn(
          "absolute bottom-5 left-5 flex items-center gap-3 rounded-full border border-white/10 bg-[#0b1020]/70 px-3.5 py-2 font-mono text-[0.7rem] tracking-wider text-white/80 uppercase backdrop-blur transition-opacity duration-500",
          state === "loading" ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="journey-loader" />
        {labels.loading}
      </div>
    </div>
  );
}

/**
 * A light illustrated stand-in: shown while three.js loads, and as the whole
 * experience when WebGL is unavailable. Pure SVG, so it costs no request.
 */
function JourneyFallback() {
  return (
    <div className="journey-fallback absolute inset-0">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="jf-sun" cx="0.7" cy="0.56" r="0.35">
            <stop offset="0" stopColor="var(--jf-glow)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--jf-glow)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#jf-sun)" />
        <g fill="var(--jf-city)">
          {Array.from({ length: 34 }, (_, i) => {
            const h = 14 + ((i * 37) % 11) * 7 + (i > 12 && i < 22 ? 40 : 0);
            return <rect key={i} x={860 + i * 12} y={505 - h} width="9" height={h} />;
          })}
        </g>
        <path d="M0 560 L180 430 L330 520 L520 380 L700 500 L860 420 L1030 520 L1240 400 L1440 500 L1440 900 L0 900Z" fill="var(--jf-far)" />
        <path d="M0 650 L240 540 L420 620 L640 520 L860 640 L1080 560 L1300 640 L1440 590 L1440 900 L0 900Z" fill="var(--jf-mid)" />
        <path d="M0 760 L300 680 L560 740 L820 690 L1100 760 L1440 700 L1440 900 L0 900Z" fill="var(--jf-near)" />
        <path
          d="M1060 900 C 1010 820, 1150 780, 1040 730 C 960 692, 1080 660, 1010 610 C 980 590, 1000 560, 1000 545"
          fill="none"
          stroke="var(--jf-road)"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
