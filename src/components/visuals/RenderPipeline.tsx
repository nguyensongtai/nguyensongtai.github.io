"use client";

import { animate, m, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Spotlight } from "@/components/ui/Spotlight";
import { cn } from "@/lib/cn";

type Mode = "before" | "after";

const stages = [
  { id: "cdn", label: "CDN", detail: "CDN caching: cacheable responses are served from the edge instead of the origin." },
  { id: "ssr", label: "SSR", detail: "Streaming SSR: the page shell paints before data-heavy sections resolve." },
  { id: "assets", label: "Assets", detail: "Image and font loading: the LCP image and fonts load first, everything else waits." },
  { id: "split", label: "Split", detail: "Code splitting: each route ships only the JavaScript it renders." },
  { id: "hydrate", label: "Hydrate", detail: "Hydration tuning: less main-thread work before the page becomes interactive." },
] as const;

const score = { before: 40, after: 70 } as const;
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function useCountTo(target: number, reduce: boolean | null) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (reduce) {
      current.current = target;
      return;
    }
    const controls = animate(current.current, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        current.current = v;
        setValue(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [target, reduce]);
  return reduce ? target : value;
}

export function RenderPipeline() {
  const reduce = useReducedMotion();
  const [autoMode, setAutoMode] = useState<Mode>("before");
  const [chosen, setChosen] = useState<Mode | null>(null);
  const [stage, setStage] = useState<(typeof stages)[number]["id"]>("ssr");

  // Opening sequence: show the baseline briefly, then the optimized result.
  // With reduced motion we skip straight to the result.
  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setAutoMode("after"), 1500);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const mode: Mode = chosen ?? (reduce ? "after" : autoMode);
  const choose = (next: Mode) => setChosen(next);

  const shown = useCountTo(score[mode], reduce);
  const after = mode === "after";
  const active = stages.find((s) => s.id === stage)!;

  return (
    <Spotlight className="rounded-[14px] border border-night-line bg-night text-night-text shadow-[0_30px_80px_-30px_rgb(11_13_18/0.55)]">
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 border-b border-night-line px-4 py-3">
          <p className="font-mono text-[0.7rem] text-night-muted">
            render-pipeline<span className="text-electric">.tsx</span> · moso.vn
          </p>
          <div role="group" aria-label="Show metrics" className="flex rounded-full bg-night-3 p-0.5">
            {(["before", "after"] as const).map((m_) => (
              <button
                key={m_}
                type="button"
                aria-pressed={mode === m_}
                onClick={() => choose(m_)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[0.66rem] uppercase tracking-wider transition-colors",
                  mode === m_ ? "bg-night-text text-night" : "text-night-muted hover:text-night-text",
                )}
              >
                {m_}
              </button>
            ))}
          </div>
        </div>

        {/* stage rail */}
        <div className="px-4 pt-6">
          <ol className="flex items-center" aria-label="Rendering stages">
            {stages.map((s, i) => (
              <li key={s.id} className={cn("flex items-center", i < stages.length - 1 && "flex-1")}>
                <button
                  type="button"
                  onClick={() => setStage(s.id)}
                  onMouseEnter={() => setStage(s.id)}
                  onFocus={() => setStage(s.id)}
                  aria-pressed={stage === s.id}
                  className="group flex flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full border font-mono text-[0.62rem] transition-colors duration-300",
                      stage === s.id
                        ? "border-electric bg-electric/15 text-white"
                        : after
                          ? "border-electric/50 text-night-text"
                          : "border-night-line text-night-muted",
                    )}
                  >
                    {after ? "✓" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.62rem] tracking-wide text-night-muted group-hover:text-night-text">
                    {s.label}
                  </span>
                </button>
                {i < stages.length - 1 ? (
                  <span aria-hidden className="relative mx-1 mb-6 h-px flex-1 overflow-hidden bg-night-line">
                    {[0, 1].map((k) => (
                      <span
                        key={k}
                        className="absolute inset-0 flex justify-end"
                        style={{
                          animation: `travel ${after ? 1.4 : 3.2}s linear infinite`,
                          animationDelay: `${(i * 0.35 + k * (after ? 0.7 : 1.6)).toFixed(2)}s`,
                        }}
                      >
                        <span className={cn("h-px w-6", after ? "bg-electric" : "bg-night-muted")} />
                      </span>
                    ))}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p aria-live="polite" className="mt-4 min-h-[3.2em] text-[0.82rem] leading-relaxed text-night-muted">
            <span className="text-night-text">{active.label}:</span> {active.detail.split(": ")[1]}
          </p>
        </div>

        {/* measured outcomes */}
        <div className="grid grid-cols-[auto_1fr] items-center gap-5 border-t border-night-line px-4 py-5">
          <div className="relative h-[84px] w-[84px]">
            <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="42" cy="42" r={RADIUS} fill="none" stroke="currentColor" className="text-night-line" strokeWidth="6" />
              <m.circle
                cx="42"
                cy="42"
                r={RADIUS}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={false}
                animate={{
                  strokeDashoffset: CIRCUMFERENCE * (1 - score[mode] / 100),
                  stroke: after ? "#ffa94d" : "#ff6b5b",
                }}
                transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <span className="text-[1.45rem] leading-none font-semibold tabular-nums">{shown}</span>
            </div>
          </div>
          <div>
            <p className="font-mono text-[0.64rem] uppercase tracking-wider text-night-muted">
              Lighthouse performance · {after ? "after" : "before"}
            </p>
            <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-wider text-night-muted">Mobile LCP · relative</p>
            <div className="relative mt-1.5 h-2 rounded-full border border-dashed border-night-line">
              <m.div
                className={cn("absolute inset-y-0 left-0 rounded-full", after ? "bg-electric" : "bg-night-muted")}
                initial={false}
                animate={{ width: after ? "60%" : "100%" }}
                transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="mt-1.5 text-[0.78rem] text-night-text">{after ? "~40% lower than baseline" : "Baseline"}</p>
          </div>
        </div>
        <p className="border-t border-night-line px-4 py-2.5 font-mono text-[0.6rem] leading-relaxed text-night-muted">
          moso.vn figures as stated on my CV. Lab scores are targets we keep improving.
        </p>
      </div>
    </Spotlight>
  );
}
