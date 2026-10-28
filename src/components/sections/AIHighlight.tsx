import type { Content } from "@/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { AgentDiagram } from "@/components/visuals/AgentDiagram";
import { StreamingChatDemo } from "@/components/visuals/StreamingChatDemo";

export function AIHighlight({ ai, label }: { ai: Content["ai"]; label: string }) {
  return (
    <section id="ai" aria-labelledby="ai-heading" className="shell pb-24">
      <div className="rounded-[24px] border border-night-line bg-night/95 p-6 text-night-text sm:p-10 lg:p-14">
        <SectionHeading id="ai-heading" tone="night" index="04" label={label} title={ai.title} intro={ai.intro} />

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <ol className="space-y-8 lg:col-span-5">
            {ai.pillars.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.06} className="border-t border-night-line pt-5">
                <p className="font-mono text-[0.7rem] text-electric">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.02em] text-white">{p.label}</h3>
                <p className="mt-2 leading-relaxed text-night-muted">{p.body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <StreamingChatDemo />
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <AgentDiagram />
        </Reveal>
      </div>
    </section>
  );
}
