import Image from "next/image";
import { profile } from "@/content/portfolio";
import { RevealWords, Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail } from "@/components/ui/icons";
import { CopyEmail } from "./CopyEmail";

export function Contact() {
  const links = [
    { href: profile.links.linkedin, label: "LinkedIn", icon: <Linkedin width={18} height={18} />, handle: "in/tainguyen99" },
    { href: profile.links.github, label: "GitHub", icon: <Github width={18} height={18} />, handle: "nguyensongtai" },
  ];
  return (
    <section id="contact" aria-labelledby="contact-heading" className="border-t border-line bg-paper-2/50 py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow text-muted">
            <span className="text-accent">05</span>
            <span className="mx-2">/</span>Contact
          </p>
          <h2 id="contact-heading" aria-label="Let's build something that performs." className="mt-6 text-[clamp(2.6rem,6.4vw,6rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
            <RevealWords text="Let's build something that" />{" "}
            <span aria-hidden className="font-serif font-normal tracking-[-0.02em] text-accent italic">performs.</span>
          </h2>
          <Reveal className="mt-8 max-w-[52ch] text-[1.1rem] leading-relaxed text-ink-2">
            I&apos;m {profile.availability.toLowerCase()}. The fastest way to reach me is email. My CV has the full
            details.
          </Reveal>
          <Reveal className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href={`mailto:${profile.email}`} icon={<Mail />}>
              {profile.email}
            </ButtonLink>
            <CopyEmail email={profile.email} />
            <ButtonLink href={profile.cv} download variant="secondary" icon={<ArrowDown />}>
              Download CV
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-4" delay={0.1}>
          <div className="flex items-center gap-4 lg:block">
            <Image
              src="/images/portrait.jpg"
              alt={`Portrait of ${profile.name}`}
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
