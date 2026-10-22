import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AIHighlight } from "@/components/sections/AIHighlight";
import { Approach } from "@/components/sections/Approach";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { ImpactStrip } from "@/components/sections/ImpactStrip";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <div id="top" />
        <Hero />
        <ImpactStrip />
        <FeaturedWork />
        <Approach />
        <AIHighlight />
        <Experience />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
