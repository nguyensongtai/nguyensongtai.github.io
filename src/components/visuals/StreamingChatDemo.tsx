"use client";

import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface Script {
  prompt: string;
  tool: string;
  found: string;
  answer: string;
  sources: string[];
}

// Canned replays. No model is called and the listings are placeholders.
const scripts: Script[] = [
  {
    prompt: "2-bedroom apartment in District 7, close to schools",
    tool: 'search_listings({ district: "District 7", beds: 2 })',
    found: "3 listings matched · ranked by distance to schools",
    answer:
      "I found three 2-bedroom apartments in District 7 within walking distance of a school. The closest is the riverside unit, about 400 m from the nearest school. Want me to compare prices per m²?",
    sources: ["Listing A · District 7", "Listing B · District 7", "Listing C · District 7"],
  },
  {
    prompt: "Townhouses for rent near a metro station",
    tool: 'search_listings({ type: "townhouse", intent: "rent" }) → geo_lookup("metro")',
    found: "2 listings matched · within 1 km of a station",
    answer:
      "Two townhouses for rent sit within 1 km of a metro station. Both are in Thu Duc. One has a garage, the other a small garden. I can show them on the map.",
    sources: ["Listing D · Thu Duc", "Listing E · Thu Duc"],
  },
];

type Phase = "idle" | "tool" | "streaming" | "done" | "stopped";

export function StreamingChatDemo() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Script | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [words, setWords] = useState(0);
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  const run = (s: Script) => {
    clear();
    setActive(s);
    setWords(0);
    const total = s.answer.split(" ").length;
    if (reduce) {
      setWords(total);
      setPhase("done");
      return;
    }
    setPhase("tool");
    window.setTimeout(() => {
      setPhase("streaming");
      timer.current = window.setInterval(() => {
        setWords((w) => {
          if (w + 1 >= total) {
            clear();
            setPhase("done");
            return total;
          }
          return w + 1;
        });
      }, 55);
    }, 900);
  };

  // Replay the first question once, the first time the demo scrolls into view.
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "0px 0px -25% 0px" });
  const autoPlayed = useRef(false);
  useEffect(() => {
    if (!inView || autoPlayed.current) return;
    autoPlayed.current = true;
    const t = window.setTimeout(() => run(scripts[0]), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const stop = () => {
    clear();
    setPhase("stopped");
  };

  const text = active ? active.answer.split(" ").slice(0, words).join(" ") : "";
  const streaming = phase === "streaming" || phase === "tool";

  return (
    <div ref={rootRef} className="flex h-full flex-col rounded-[14px] border border-night-line bg-night-2">
      <div className="flex items-center justify-between border-b border-night-line px-4 py-3">
        <p className="font-mono text-[0.68rem] text-night-muted">property-finder · streaming</p>
        <p className="font-mono text-[0.68rem] tracking-wider text-night-muted uppercase">Simulated replay</p>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        {!active ? (
          <p className="text-[0.85rem] text-night-muted">Pick a question to replay how the chat streams an answer and cites its sources.</p>
        ) : (
          <>
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-electric/20 px-3 py-2 text-[0.85rem] text-white">
              {active.prompt}
            </p>
            <div className="rounded-lg border border-night-line bg-night px-3 py-2 font-mono text-[0.68rem] text-night-muted">
              <span className="text-electric">tool</span> {active.tool}
              <AnimatePresence>
                {phase !== "tool" ? (
                  <m.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 block text-night-text">
                    ✓ {active.found}
                  </m.span>
                ) : (
                  <span className="mt-1 block animate-pulse">searching…</span>
                )}
              </AnimatePresence>
            </div>
            <div aria-live="polite" aria-busy={streaming} className="min-h-[5.5rem] text-[0.9rem] leading-relaxed text-night-text">
              {text}
              {phase === "streaming" ? <span className="caret text-electric" aria-hidden /> : null}
              {phase === "stopped" ? <span className="ml-1 text-night-muted">(stopped)</span> : null}
            </div>
            <AnimatePresence>
              {phase === "done" ? (
                <m.ul
                  initial="hidden"
                  animate="shown"
                  transition={{ staggerChildren: 0.08 }}
                  className="flex flex-wrap gap-1.5"
                  aria-label="Sources"
                >
                  {active.sources.map((s, i) => (
                    <m.li
                      key={s}
                      variants={{ hidden: { opacity: 0, y: 4 }, shown: { opacity: 1, y: 0 } }}
                      className="rounded-md border border-night-line px-2 py-1 font-mono text-[0.64rem] text-night-text"
                    >
                      <span className="text-electric">[{i + 1}]</span> {s}
                    </m.li>
                  ))}
                </m.ul>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-night-line px-4 py-3">
        {scripts.map((s) => (
          <button
            key={s.prompt}
            type="button"
            onClick={() => run(s)}
            disabled={streaming}
            className={cn(
              "rounded-full border px-3 py-1.5 text-left text-[0.74rem] transition-colors disabled:opacity-40",
              active === s ? "border-electric text-white" : "border-night-line text-night-muted hover:text-night-text",
            )}
          >
            {s.prompt}
          </button>
        ))}
        {streaming ? (
          <button type="button" onClick={stop} className="ml-auto rounded-full bg-night-text px-3 py-1.5 text-[0.74rem] text-night">
            Stop
          </button>
        ) : null}
      </div>
      <p className="px-4 pb-3 font-mono text-[0.58rem] text-night-muted">
        No model is called here. Listings are placeholders. The production version streams real results.
      </p>
    </div>
  );
}
