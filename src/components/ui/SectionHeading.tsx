import { RevealWords } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  id,
  index,
  label,
  title,
  intro,
  tone = "paper",
  className,
}: {
  id?: string;
  index: string;
  label: string;
  title: string;
  intro?: string;
  tone?: "paper" | "night";
  className?: string;
}) {
  const night = tone === "night";
  return (
    <header className={cn("grid gap-6 lg:grid-cols-12 lg:gap-10", className)}>
      <p className={cn("eyebrow lg:col-span-3", night ? "text-night-muted" : "text-muted")}>
        <span className={night ? "text-electric" : "text-accent"}>{index}</span>
        <span className="mx-2">/</span>
        {label}
      </p>
      <div className="lg:col-span-9">
        <h2
          id={id}
          aria-label={title}
          className={cn(
            "max-w-[18ch] text-[clamp(2.1rem,4.6vw,4rem)] leading-[0.98] font-semibold tracking-[-0.04em]",
            night ? "text-white" : "text-ink",
          )}
        >
          <RevealWords text={title} />
        </h2>
        {intro ? (
          <p className={cn("mt-6 max-w-[58ch] text-[1.05rem] leading-relaxed", night ? "text-night-muted" : "text-ink-2")}>
            {intro}
          </p>
        ) : null}
      </div>
    </header>
  );
}
