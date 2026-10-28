import type { Content } from "@/content";
import type { CaseStudy as Study } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { AttributionBadge } from "@/components/ui/AttributionBadge";
import { Disclosure } from "@/components/ui/Disclosure";
import { TechChip } from "@/components/ui/TechChip";
import { ArrowUpRight } from "@/components/ui/icons";
import { MosoPreview } from "@/components/previews/MosoPreview";
import { OkxePreview } from "@/components/previews/OkxePreview";
import { SalonPreview } from "@/components/previews/SalonPreview";
import { cn } from "@/lib/cn";
import { PreviewFrame } from "./PreviewFrame";

const previews = { moso: MosoPreview, salon: SalonPreview, okxe: OkxePreview };

/** `bare` drops the section rule and padding when the study sits inside its own panel. */
export function CaseStudy({
  study,
  labels,
  attribution,
  bare = false,
}: {
  study: Study;
  labels: Content["ui"]["caseStudy"];
  attribution: Content["ui"]["attribution"];
  bare?: boolean;
}) {
  const Preview = previews[study.preview];
  return (
    <article id={study.id} aria-labelledby={`${study.id}-title`} className={cn(!bare && "border-t border-line py-16 lg:py-24")}>
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="flex items-start gap-5">
            <span aria-hidden className="font-serif text-[clamp(4.5rem,8vw,7.5rem)] leading-[0.78] text-accent italic">
              {study.index}
            </span>
            <div className="pt-1">
              <p className="eyebrow text-muted">{study.kicker}</p>
              <h3 id={`${study.id}-title`} className="mt-2 text-[clamp(2rem,3.4vw,3.1rem)] leading-none font-semibold tracking-[-0.045em]">
                {study.title}
              </h3>
            </div>
          </div>
          <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 text-[0.92rem]">
            <div>
              <dt className="eyebrow text-muted">{labels.role}</dt>
              <dd className="mt-1">{study.role}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">{labels.period}</dt>
              <dd className="mt-1">{study.period}</dd>
            </div>
            <div className="col-span-2">
              <dt className="eyebrow text-muted">{labels.stack}</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {study.stack.map((s) => (
                  <TechChip key={s} name={s} />
                ))}
              </dd>
            </div>
          </dl>
          {study.url ? (
            <a
              href={study.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-[0.92rem] font-medium hover:border-accent hover:text-accent"
            >
              {labels.visit} {study.url.replace("https://", "")} <ArrowUpRight width={15} height={15} />
            </a>
          ) : null}
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.08}>
          <p className="text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.35] tracking-[-0.02em]">{study.summary}</p>
          <p className="eyebrow mt-8 text-muted">{labels.challenge}</p>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-ink-2">{study.challenge}</p>
        </Reveal>
      </div>

      <div className="mt-12">
        <PreviewFrame label={`${study.title} ${labels.interface}`}>
          {study.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={study.image.src}
              alt={study.image.alt}
              width={study.image.width}
              height={study.image.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full rounded-lg"
            />
          ) : (
            <Preview />
          )}
        </PreviewFrame>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-10 lg:col-span-5">
          <Reveal>
            <h4 className="eyebrow text-accent">{labels.owned}</h4>
            <ul className="mt-4 space-y-3">
              {study.owned.map((item) => (
                <li key={item} className="flex gap-3 leading-snug">
                  <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <h4 className="eyebrow text-muted">{labels.team}</h4>
            <ul className="mt-4 space-y-2.5 text-[0.92rem] text-ink-2">
              {study.teamContext.map((item) => (
                <li key={item} className="flex gap-3 leading-snug">
                  <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full border border-muted" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <h4 className="eyebrow text-muted">{labels.decisions}</h4>
          <ol className="mt-4 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {study.decisions.map((d, i) => (
              <Reveal as="li" key={d.title} delay={i * 0.05}>
                <p className="font-mono text-[0.72rem] text-accent">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.02em]">{d.title}</p>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">{d.body}</p>
              </Reveal>
            ))}
          </ol>

          <h4 className="eyebrow mt-14 text-muted">{labels.outcomes}</h4>
          <ul className="mt-4 grid border-t border-line sm:grid-cols-2">
            {study.metrics.map((metric, i) => (
              <Reveal
                as="li"
                key={metric.label}
                delay={i * 0.04}
                className="border-b border-line py-5 sm:odd:pr-6 sm:even:border-l sm:even:pl-6"
              >
                <p className="text-[2rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">{metric.value}</p>
                <p className="mt-2 font-medium">{metric.label}</p>
                <p className="mt-1.5 text-[0.86rem] leading-relaxed text-muted">{metric.context}</p>
                <AttributionBadge attribution={metric.attribution} label={attribution[metric.attribution]} className="mt-3" />
              </Reveal>
            ))}
          </ul>

          <div className="mt-10">
            {study.details.map((group) => (
              <Disclosure key={group.title} title={`${labels.details} · ${group.title}`}>
                <ul className="space-y-2 text-[0.92rem] text-ink-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className="font-mono text-accent">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
