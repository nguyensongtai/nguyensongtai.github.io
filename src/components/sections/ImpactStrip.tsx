import { impact } from "@/content/portfolio";
import { Reveal } from "@/components/motion/Reveal";
import { AttributionBadge } from "@/components/ui/AttributionBadge";

export function ImpactStrip() {
  return (
    <section aria-label="Impact at a glance" className="border-y border-line bg-paper-2/60">
      <div className="shell">
        <ul className="grid divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {impact.map((item, idx) => (
            <Reveal as="li" key={item.label} delay={idx * 0.06} className="border-b border-line py-8 sm:px-6 lg:border-b-0 lg:first:pl-0">
              <p className="text-[clamp(2.4rem,4vw,3.4rem)] leading-none font-semibold tracking-[-0.05em] tabular-nums">
                {item.value}
              </p>
              <p className="mt-3 text-[0.95rem] font-medium">{item.label}</p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">{item.context}</p>
              <AttributionBadge attribution={item.attribution} className="mt-4" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
