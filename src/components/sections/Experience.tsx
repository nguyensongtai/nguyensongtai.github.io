import { experience } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function Experience() {
  // Oldest → newest, so the progression reads left to right.
  const roles = [...experience].reverse();
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-24 lg:py-32">
      <div className="shell">
        <SectionHeading
          id="experience-heading"
          index="04"
          label="Experience"
          title="Craft, then scale, then complexity, then ownership."
          intro="Four roles, each with a bigger scope than the one before: from agency work, to a high-traffic marketplace, to multi-tenant B2B, to owning frontend architecture."
        />

        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute top-[0.45rem] right-0 left-0 hidden h-px bg-line md:block" />
          {roles.map((r, i) => {
            const current = i === roles.length - 1;
            return (
              <Reveal as="li" key={r.company} delay={i * 0.08} className="relative border-l border-line pl-5 md:border-l-0 md:pl-0">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[0.2rem] -left-[5px] h-2.5 w-2.5 rounded-full md:left-0",
                    current ? "bg-accent ring-4 ring-accent-soft" : "border border-ink bg-paper",
                  )}
                />
                <p className="font-mono text-[0.72rem] text-muted md:pt-8">
                  {r.start}
                  {current ? <span className="ml-2 text-accent">Now</span> : null}
                </p>
                <p className={cn("mt-2 font-serif text-[2.4rem] leading-none italic", current ? "text-accent" : "text-ink")}>
                  {r.theme}
                </p>
                <h3 className="mt-4 font-semibold tracking-[-0.02em]">{r.company}</h3>
                <p className="text-[0.88rem] text-ink-2">{r.title}</p>
                <p className="mt-0.5 font-mono text-[0.68rem] text-muted">{r.period}</p>
                <p className="mt-4 text-[0.9rem] leading-relaxed text-ink-2">{r.summary}</p>
                <ul className="mt-3 space-y-1.5 text-[0.86rem]">
                  {r.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span aria-hidden className="text-accent">+</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
