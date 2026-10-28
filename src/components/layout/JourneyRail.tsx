"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Content } from "@/content";
import { cn } from "@/lib/cn";


/**
 * Where you are on the road. A rail of stops on desktop (each one a link), a
 * thin progress bar on phones. Progress is written to a CSS variable, so
 * scrolling never re-renders React.
 */
export function JourneyRail({ journey, labels }: { journey: Content["journey"]; labels: Content["ui"]["rail"] }) {
  const STOPS = useMemo(
    () => [
      { id: "hero", label: labels.start, year: "" },
      ...journey.map((s) => ({ id: s.id, label: s.title, year: s.era.split(" ")[0] })),
      { id: "contact", label: labels.contact, year: "" },
    ],
    [journey, labels],
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      rootRef.current?.style.setProperty("--p", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const s of STOPS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [STOPS]);

  return (
    <div ref={rootRef} style={{ "--p": 0 } as React.CSSProperties}>
      <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left scale-x-[var(--p)] bg-accent lg:hidden" />
      <nav aria-label={labels.label} className="fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 lg:block">
        <div className="relative">
          <span aria-hidden className="absolute top-2 right-[7px] bottom-2 w-px bg-line" />
          <span
            aria-hidden
            className="absolute top-2 right-[7px] bottom-2 w-px origin-top scale-y-[var(--p)] bg-accent"
          />
          <ol className="relative space-y-4">
            {STOPS.map((s) => {
              const current = s.id === active;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={current ? "step" : undefined}
                    className="group flex flex-row-reverse items-center gap-3 outline-none"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid h-[15px] w-[15px] place-items-center rounded-full border transition-colors",
                        current ? "border-accent bg-accent" : "border-line bg-paper group-hover:border-accent",
                      )}
                    >
                      <span className={cn("h-1 w-1 rounded-full", current ? "bg-paper" : "bg-transparent")} />
                    </span>
                    <span
                      className={cn(
                        "rail-label eyebrow rounded-full px-2.5 py-1 whitespace-nowrap transition-all duration-300",
                        // labels show on hover or keyboard focus; the filled dot marks where you are
                        "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                      )}
                    >
                      {s.year ? <span className="text-accent">{s.year} · </span> : null}
                      {s.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </div>
  );
}
