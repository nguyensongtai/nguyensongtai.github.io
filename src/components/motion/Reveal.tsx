"use client";

import { m, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article";
};

/** Fades content up the first time it scrolls into view. */
export function Reveal({ children, delay = 0, y = 18, as = "div", ...rest }: RevealProps) {
  const Component = m[as] as typeof m.div;
  return (
    <Component
      data-reveal
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.75, ease, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Reveals words one after another. The words are aria-hidden, so the parent
 * heading must carry the accessible name via `aria-label`.
 */
export function RevealWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <m.span
      aria-hidden
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: 0.045 }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <m.span
            data-reveal
            className="inline-block"
            variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
            transition={{ duration: 0.8, ease }}
          >
            {word}
            {i < words.length - 1 ? "\u00a0" : ""}
          </m.span>
        </span>
      ))}
    </m.span>
  );
}
