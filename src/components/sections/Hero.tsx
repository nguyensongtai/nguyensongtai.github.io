import type { CSSProperties } from "react";
import { profile } from "@/content/portfolio";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** Full-height intro. The right half is left open for the WebGL network behind it. */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col pt-24 pb-8 md:pt-28">
      <div className="shell flex flex-1 flex-col">
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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {profile.availability}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-14">
          <h1 id="hero-title" className="fade-up flex flex-wrap items-baseline gap-x-3 gap-y-1" style={d(40)}>
            <span className="text-[1.05rem] font-semibold tracking-[0.08em] uppercase">{profile.name}</span>
            <span className="sr-only">, </span>
            <span className="font-serif text-[1.3rem] text-ink-2 italic">{profile.role}</span>
          </h1>

          <p className="mt-7 max-w-[13ch] text-[clamp(3.1rem,7.6vw,8rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-ink">
            <span className="line-mask"><span style={i(0)}>{profile.headline.lead}</span> </span>
            <span className="line-mask"><span style={i(1)}>{profile.headline.tail}</span> </span>
            <span className="line-mask">
              <span style={i(2)} className="pr-2 font-serif font-normal tracking-[-0.02em] text-accent italic">
                {profile.headline.accent}
              </span>
            </span>
          </p>

          <p className="fade-up mt-8 max-w-[46ch] text-[1.1rem] leading-relaxed text-ink-2" style={d(420)}>
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

        <div
          className="fade-up flex flex-wrap items-end justify-between gap-6 border-t border-line pt-5"
          style={d(640)}
        >
          <dl className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-10">
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
          <a href="#work" className="eyebrow hidden items-center gap-3 text-muted hover:text-ink md:flex">
            Scroll
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue absolute inset-x-0 top-0 h-4 bg-accent" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
