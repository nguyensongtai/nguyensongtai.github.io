import type { CSSProperties } from "react";
import type { Content } from "@/content";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const i = (n: number) => ({ "--i": n }) as CSSProperties;

/**
 * The start of the road. Copy sits on the left over a scrim; the 3D scene
 * (the road, the mountains and the city on the horizon) fills the right.
 */
export function Hero({ profile, labels }: { profile: Content["profile"]; labels: Content["ui"]["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col pt-24 pb-8 md:pt-28">
      <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0" />
      <div className="shell relative flex flex-1 flex-col">
        <div
          className="fade-up eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-4 text-muted"
          style={d(0)}
        >
          <span>
            {labels.eyebrow} · 2017 — {new Date().getFullYear()}
          </span>
          <span className="flex items-center gap-2 text-ink">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {profile.availability}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-end py-12 md:justify-center md:py-14">
          <h1 id="hero-title" className="fade-up flex flex-wrap items-baseline gap-x-3 gap-y-1" style={d(40)}>
            <span className="text-[1.05rem] font-semibold tracking-[0.08em] uppercase">{profile.name}</span>
            <span className="sr-only">, </span>
            <span className="font-serif text-[1.3rem] text-ink-2 italic">{profile.role}</span>
          </h1>

          <p className="hero-quote mt-6 max-w-[15ch] text-[clamp(2.7rem,6.4vw,6.6rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-ink">
            <span className="line-mask">
              <span style={i(0)}>“{profile.quote.lead}</span>{" "}
            </span>
            <span className="line-mask">
              <span style={i(1)} className="pr-2 font-serif font-normal tracking-[-0.02em] text-accent italic">
                {profile.quote.accent}”
              </span>
            </span>
          </p>

          <p className="fade-up mt-7 max-w-[48ch] text-[1.08rem] leading-relaxed text-ink-2" style={d(380)}>
            {profile.intro}
          </p>

          <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={d(480)}>
            <ButtonLink href="#stage-1" icon={<ArrowDown />}>
              {labels.explore}
            </ButtonLink>
            <ButtonLink href="#projects" variant="secondary" icon={<ArrowRight />}>
              {labels.projects}
            </ButtonLink>
            <ButtonLink href={profile.cv} download variant="ghost" icon={<ArrowDown />} className="ml-1">
              {labels.downloadCv}
            </ButtonLink>
          </div>
        </div>

        <div className="fade-up flex flex-wrap items-end justify-between gap-6 border-t border-line pt-5" style={d(600)}>
          <dl className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-10">
            <div>
              <dt className="eyebrow text-muted">{labels.experience}</dt>
              <dd className="mt-1 text-[1.05rem] font-medium">{profile.years} {labels.years}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">{labels.focus}</dt>
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
          <a href="#stage-1" className="eyebrow hidden items-center gap-3 text-muted hover:text-ink md:flex">
            {labels.scroll}
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue absolute inset-x-0 top-0 h-4 bg-accent" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
