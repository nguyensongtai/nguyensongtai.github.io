"use client";

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import type { Content } from "@/content";
import type { Principle } from "@/content/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

function PrincipleBody({ p, inPractice }: { p: Principle; inPractice: string }) {
  return (
    <div>
      <p className="font-serif text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.15] tracking-[-0.01em] italic">
        “{p.statement}”
      </p>
      <h4 className="eyebrow mt-8 text-muted">{inPractice}</h4>
      <ul className="mt-3 space-y-2.5">
        {p.practice.map((item) => (
          <li key={item} className="flex gap-3 leading-snug text-ink-2">
            <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
      <figure className="mt-8 overflow-hidden rounded-xl border border-night-line bg-night">
        <figcaption className="border-b border-night-line px-4 py-2 font-mono text-[0.68rem] tracking-wider text-night-muted uppercase">
          {p.snippet.label}
        </figcaption>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.78rem] leading-relaxed text-night-text">
          <code>{p.snippet.code}</code>
        </pre>
      </figure>
    </div>
  );
}

export function Approach({
  principles,
  toolkit,
  labels,
}: {
  principles: Content["principles"];
  toolkit: Content["toolkit"];
  labels: Content["ui"]["approach"];
}) {
  const [active, setActive] = useState(principles[0].id);
  const current = principles.find((p) => p.id === active)!;

  return (
    <section id="approach" aria-labelledby="approach-heading" className="shell pb-24">
      <div className="glass p-6 sm:p-10 lg:p-14">
        <SectionHeading
          id="approach-heading"
          index="05"
          label={labels.label}
          title={labels.title}
          intro={labels.intro}
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <ol className="lg:col-span-5">
            {principles.map((p, i) => {
              const selected = p.id === active;
              return (
                <li key={p.id} className="border-t border-line last:border-b">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={selected}
                      aria-controls={`principle-${p.id}`}
                      onClick={() => setActive(p.id)}
                      onMouseEnter={() => window.matchMedia("(min-width: 1024px)").matches && setActive(p.id)}
                      className={cn(
                        "group flex w-full items-baseline gap-4 py-5 text-left transition-colors",
                        selected ? "text-ink" : "text-muted hover:text-ink",
                      )}
                    >
                      <span className={cn("font-mono text-[0.72rem]", selected ? "text-accent" : "")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium tracking-[-0.02em]">{p.title}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "ml-auto h-px w-8 shrink-0 self-center bg-accent transition-transform duration-300 origin-right",
                          selected ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </button>
                  </h3>
                  {/* Mobile: content opens inline under the selected item */}
                  <AnimatePresence initial={false}>
                    {selected ? (
                      <m.div
                        key="body"
                        id={`principle-${p.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="pb-8">
                          <PrincipleBody p={p} inPractice={labels.inPractice} />
                        </div>
                      </m.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          <div className="hidden lg:col-span-7 lg:block lg:pl-6">
            <div className="sticky top-28" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <PrincipleBody p={current} inPractice={labels.inPractice} />
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Reveal className="mt-24">
          <div className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h3 className="eyebrow text-muted">{labels.toolkit}</h3>
              <p className="mt-2 text-[0.88rem] text-muted">{labels.toolkitNote}</p>
            </div>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3">
              {toolkit.map((g) => (
                <div key={g.group}>
                  <dt className="font-medium">{g.group}</dt>
                  <dd className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-2">{g.items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
