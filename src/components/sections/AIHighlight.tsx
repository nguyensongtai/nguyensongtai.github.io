import { ai } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { AgentDiagram } from "@/components/visuals/AgentDiagram";
import { StreamingChatDemo } from "@/components/visuals/StreamingChatDemo";

export function AIHighlight() {
  return (
    <section id="ai" aria-labelledby="ai-heading" className="halo-night border-y border-line bg-night/40 py-24 text-night-text light:bg-night lg:py-32">
      <div className="shell">
        <SectionHeading id="ai-heading" tone="night" index="03" label="AI engineering" title={ai.title} intro={ai.intro} />

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
