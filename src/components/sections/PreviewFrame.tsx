"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Spotlight } from "@/components/ui/Spotlight";

const ease = [0.16, 1, 0.3, 1] as const;

/** Dark showcase frame: masked reveal on entry, a few pixels of scroll depth, pointer spotlight. */
export function PreviewFrame({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -18]);

  return (
    <m.figure
      ref={ref}
      data-reveal
      aria-label={label}
      initial={{ clipPath: "inset(6% 3% 6% 3% round 18px)", opacity: 0.5 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 18px)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease }}
      className="overflow-hidden rounded-[18px] bg-night text-night-text"
    >
      <Spotlight className="rounded-[18px] border border-night-line p-4 sm:p-6 lg:p-8">
        <m.div style={{ y }} className="relative z-10">
          {children}
        </m.div>
      </Spotlight>
    </m.figure>
  );
}
