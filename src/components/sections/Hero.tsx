import type { CSSProperties } from "react";
import { profile } from "@/content/portfolio";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";
import { RenderPipeline } from "@/components/visuals/RenderPipeline";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative pt-24 pb-14 md:pt-28 lg:pb-20">
      <div className="shell">
        <div
          className="fade-up eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-4 text-muted"
          style={d(0)}
        >
          <span>Portfolio · 2020 — {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">
            {profile.location.split(",")[0]} · {profile.timezone}
          </span>
          <span className="flex items-center gap-2 text-ink">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {profile.availability}
          </span>
        </div>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h1 id="hero-title" className="fade-up flex flex-wrap items-baseline gap-x-3 gap-y-1" style={d(40)}>
              <span className="text-[1.05rem] font-semibold tracking-[0.08em] uppercase">{profile.name}</span>
              <span className="sr-only">, </span>
              <span className="font-serif text-[1.25rem] text-ink-2 italic">{profile.role}</span>
            </h1>

            <p className="mt-7 text-[clamp(2.9rem,5.9vw,6.1rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-ink">
              <span className="line-mask"><span style={i(0)}>{profile.headline.lead}</span> </span>
              <span className="line-mask"><span style={i(1)}>{profile.headline.tail}</span> </span>
              <span className="line-mask">
                <span style={i(2)} className="pr-2 font-serif font-normal tracking-[-0.02em] text-accent italic">
                  {profile.headline.accent}
                </span>
              </span>
            </p>

            <p className="fade-up mt-8 max-w-[48ch] text-[1.1rem] leading-relaxed text-ink-2" style={d(420)}>
              {profile.intro}
            </p>

            <div className="fade-up mt-9 flex flex-wrap items-center gap-3" style={d(520)}>
              <ButtonLink href="#work" icon={<ArrowRight />}>
                Explore my work
              </ButtonLink>
              <ButtonLink href={profile.cv} download variant="secondary" icon={<ArrowDown />}>
                Download CV
              </ButtonLink>
              <ButtonLink href="#contact" variant="ghost" className="ml-2">
                Contact me
              </ButtonLink>
            </div>
          </div>

          <div className="fade-up lg:col-span-5 lg:self-center" style={d(300)}>
            <RenderPipeline />
          </div>
        </div>

        <dl
          className="fade-up mt-14 grid gap-4 border-t border-line pt-5 sm:grid-cols-[auto_1fr] sm:gap-10"
          style={d(640)}
        >
          <div>
            <dt className="eyebrow text-muted">Experience</dt>
            <dd className="mt-1 text-[1.05rem] font-medium">{profile.years} years · frontend</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted">Focus</dt>
            <dd className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[1.05rem] font-medium">
              {profile.focus.map((f, idx) => (
                <span key={f}>
                  {f}
                  {idx < profile.focus.length - 1 ? <span className="pl-2 text-accent">·</span> : null}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
