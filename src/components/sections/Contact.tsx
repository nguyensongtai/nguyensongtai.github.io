import Image from "next/image";
import type { Content } from "@/content";
import { RevealWords, Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail } from "@/components/ui/icons";
import { CopyEmail } from "./CopyEmail";

export function Contact({ profile, labels }: { profile: Content["profile"]; labels: Content["ui"]["contact"] }) {
  const links = [
    { href: profile.links.linkedin, label: "LinkedIn", icon: <Linkedin width={18} height={18} />, handle: "in/tainguyen99" },
    { href: profile.links.github, label: "GitHub", icon: <Github width={18} height={18} />, handle: "nguyensongtai" },
  ];
  return (
    <section id="contact" aria-labelledby="contact-heading" className="shell flex min-h-[100svh] items-end py-24 md:items-center">
      <div className="glass grid w-full gap-14 p-7 sm:p-10 lg:grid-cols-12 lg:p-14">
        <div className="lg:col-span-8">
          <p className="eyebrow text-muted">
            <span className="text-accent">{labels.eyebrow}</span>
            <span className="mx-2">/</span>
            {labels.label}
          </p>
          <h2 id="contact-heading" aria-label={`${labels.lead} ${labels.accent}`} className="mt-6 text-[clamp(2.6rem,6.4vw,6rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
            <RevealWords text={labels.lead} />{" "}
            <span aria-hidden className="font-serif font-normal tracking-[-0.02em] text-accent italic">{labels.accent}</span>
          </h2>
          <Reveal className="mt-8 max-w-[52ch] text-[1.1rem] leading-relaxed text-ink-2">
            {labels.body}
          </Reveal>
          <Reveal className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href={`mailto:${profile.email}`} icon={<Mail />}>
              {profile.email}
            </ButtonLink>
            <CopyEmail email={profile.email} label={labels.copy} done={labels.copied} />
            <ButtonLink href={profile.cv} download variant="secondary" icon={<ArrowDown />}>
              {labels.downloadCv}
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-4" delay={0.1}>
          <div className="flex items-center gap-4 lg:block">
            <Image
              src="/images/portrait.jpg"
              alt={labels.portrait}
              width={572}
              height={900}
              sizes="(min-width: 1024px) 280px, 96px"
              className="h-24 w-24 rounded-full object-cover object-[50%_22%] lg:h-[300px] lg:w-full lg:max-w-[280px] lg:rounded-[14px]"
            />
            <div className="lg:mt-5">
              <p className="font-semibold">{profile.name}</p>
              <p className="text-[0.9rem] text-ink-2">{profile.role}</p>
              <p className="mt-1 font-mono text-[0.7rem] text-muted">
                {profile.location} · {profile.timezone}
              </p>
            </div>
          </div>
          <ul className="mt-8 border-t border-line">
            {links.map((l) => (
              <li key={l.label} className="border-b border-line">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 py-4 hover:text-accent"
                >
                  {l.icon}
                  <span className="font-medium">{l.label}</span>
                  <span className="text-[0.85rem] text-muted">{l.handle}</span>
                  <ArrowUpRight className="ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
