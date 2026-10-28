import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { JourneyRail } from "@/components/layout/JourneyRail";
import { JourneyCanvas } from "@/components/journey/JourneyCanvas";
import { AIHighlight } from "@/components/sections/AIHighlight";
import { Approach } from "@/components/sections/Approach";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Panel, Stage } from "@/components/sections/Stage";
import { content, type Locale } from "@/content";

/** The page is the road: a hero at the start, five stops, then contact at the summit. */
export function Home({ locale }: { locale: Locale }) {
  const t = content[locale];
  const study = (id: string) => t.caseStudies.find((s) => s.id === id)!;
  const caseStudy = (id: string) => (
    <CaseStudy bare study={study(id)} labels={t.ui.caseStudy} attribution={t.ui.attribution} />
  );
  const [first, industry, products, modern, horizon] = t.journey;
  return (
    <>
      <JourneyCanvas labels={t.ui.canvas} />
      <SiteHeader locale={locale} profile={t.profile} navigation={t.navigation} labels={t.ui.header} />
      <JourneyRail journey={t.journey} labels={t.ui.rail} />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <div id="top" />
        <Hero profile={t.profile} labels={t.ui.hero} />
        <Stage stage={first} labels={t.ui.stage} />
        <Stage stage={industry} labels={t.ui.stage} />
        <Stage stage={products} labels={t.ui.stage}>
          <Panel id="projects" label={t.ui.previewNote}>
            {caseStudy("okxe")}
          </Panel>
          <Panel label={t.ui.previewNote}>{caseStudy("salon")}</Panel>
        </Stage>
        <Stage stage={modern} labels={t.ui.stage}>
          <Panel label={t.ui.previewNote}>{caseStudy("moso")}</Panel>
          <AIHighlight ai={t.ai} label={t.ui.ai.label} />
        </Stage>
        <Stage stage={horizon} labels={t.ui.stage}>
          <Approach principles={t.principles} toolkit={t.toolkit} labels={t.ui.approach} />
        </Stage>
        <Contact profile={t.profile} labels={t.ui.contact} />
      </main>
      <SiteFooter profile={t.profile} labels={t.ui.footer} />
    </>
  );
}
