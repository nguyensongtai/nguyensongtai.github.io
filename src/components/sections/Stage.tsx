import type { ReactNode } from "react";
import type { Content } from "@/content";
import type { JourneyStage } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { TechChip } from "@/components/ui/TechChip";

/**
 * One stop on the road. The first screen is the stop itself: a card on the left
 * while the camera frames the scene on the right. Anything passed as children
 * (project case studies, deeper sections) follows below it.
 */
export function Stage({
  stage,
  labels,
  children,
}: {
  stage: JourneyStage;
  labels: Content["ui"]["stage"];
  children?: ReactNode;
}) {
  return (
    <section id={stage.id} aria-labelledby={`${stage.id}-title`} className="relative">
      {/* on phones the top of the screen is left to the scene; the card scrolls in below it */}
      <div className="shell flex min-h-[100svh] items-end pt-[42svh] pb-16 md:items-center md:py-24">
        <Reveal className="glass w-full max-w-[540px] p-7 sm:p-9">
          <p className="eyebrow flex items-center gap-3 text-muted">
            <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-0.5 text-accent">
              {labels.stop} {stage.index}
            </span>
            {stage.era}
          </p>
          <h2 id={`${stage.id}-title`} className="mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1] font-semibold tracking-[-0.04em]">
            {stage.title}
          </h2>
          <p className="mt-3 text-[0.95rem] font-medium text-accent">{stage.place}</p>
          <p className="mt-5 leading-relaxed text-ink-2">{stage.lead}</p>
          <ul className="mt-6 space-y-2.5">
            {stage.points.map((point) => (
              <li key={point} className="flex gap-3 text-[0.95rem] leading-snug">
                <span aria-hidden className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          <ul aria-label={labels.technologies} className="mt-7 flex flex-wrap gap-1.5">
            {stage.tags.map((tag) => (
              <li key={tag}>
                <TechChip name={tag} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      {children}
    </section>
  );
}

/** A solid panel for long reads (case studies, approach), so text never sits on the moving scene. */
export function Panel({ id, label, children }: { id?: string; label?: string; children: ReactNode }) {
  return (
    <div id={id} className="shell pb-24">
      {label ? <p className="eyebrow mb-4 text-muted">{label}</p> : null}
      <div className="glass p-6 sm:p-10 lg:p-14">{children}</div>
    </div>
  );
}
