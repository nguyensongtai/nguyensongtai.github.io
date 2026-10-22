import { caseStudies } from "@/content/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CaseStudy } from "./CaseStudy";

export function FeaturedWork() {
  return (
    <section id="work" aria-labelledby="work-heading" className="pt-24 lg:pt-32">
      <div className="shell">
        <SectionHeading
            id="work-heading"
          index="01"
          label="Selected work"
            title="Three products, measured by what changed."
            intro="Each case study separates what I built myself from what the team achieved. The previews are interactive recreations of the UI patterns, with sample data. They are not production screenshots."
        />
        <div className="mt-16">
          {caseStudies.map((study) => (
            <CaseStudy key={study.id} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
