"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Plays the signature when it scrolls into view and replays it on click.
 * The artwork stays fully visible until this arms it, so it also works without
 * JavaScript and with reduced motion.
 */
export function Signature({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.play = "";
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = () => {
    const el = ref.current;
    if (!el || !("armed" in el.dataset)) return;
    delete el.dataset.play;
    void el.getBoundingClientRect(); // restart the CSS animations
    el.dataset.play = "";
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={replay}
      title="Replay"
      aria-label={`Signature of ${name}. Replay the animation`}
      className="sig -ml-1 block cursor-pointer rounded-md p-1 text-[var(--sig-ink)]"
    >
      {children}
    </button>
  );
}
