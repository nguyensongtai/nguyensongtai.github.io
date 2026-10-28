"use client";

import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LOCALE_PATH, type Content, type Locale } from "@/content";
import Image from "next/image";
import { ArrowDown, Close, Menu } from "@/components/ui/icons";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** Switches to the same section in the other language. */
function LanguageLink({ locale, labels, className }: { locale: Locale; labels: Content["ui"]["header"]; className?: string }) {
  const other: Locale = locale === "en" ? "vi" : "en";
  return (
    <a
      href={LOCALE_PATH[other]}
      hrefLang={other}
      lang={other}
      aria-label={labels.language}
      title={labels.language}
      onClick={(e) => {
        e.currentTarget.href = LOCALE_PATH[other] + window.location.hash;
      }}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-line px-2.5 font-mono text-[0.72rem] font-semibold tracking-wider text-muted transition-colors hover:border-ink/40 hover:text-ink",
        className,
      )}
    >
      {labels.languageShort}
    </a>
  );
}

export function SiteHeader({
  locale,
  profile,
  navigation,
  labels,
}: {
  locale: Locale;
  profile: Content["profile"];
  navigation: Content["navigation"];
  labels: Content["ui"]["header"];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sectionIds = useMemo(() => navigation.map((n) => n.href.slice(1)), [navigation]);
  const active = useActiveSection(sectionIds);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !menuRef.current) return;
      // keep focus inside the open menu
      const focusables = menuRef.current.querySelectorAll<HTMLElement>("a, button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        // over a bright sunrise the nav needs its own backdrop even at the top of the page
        scrolled || open ? "border-b border-line bg-paper/75 backdrop-blur-md" : "border-b border-transparent bg-paper/70 backdrop-blur-sm",
      )}
    >
      <div className="shell flex h-16 items-center gap-6">
        <a href="#top" className="flex items-center gap-2.5">
          <Image src="/images/avatar.jpg" alt="" width={34} height={34} className="rounded-full ring-1 ring-line" />
          <span className="leading-tight">
            <span className="block text-[0.95rem] font-semibold tracking-[-0.02em]">{profile.name}</span>
            <span className="block text-[0.72rem] text-muted">{profile.role}</span>
          </span>
        </a>

        <nav aria-label={labels.primaryNav} className="ml-auto hidden md:block">
          <ul className="flex items-center gap-7">
            {navigation.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative text-[0.88rem] transition-colors",
                      isActive ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-300",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <LanguageLink locale={locale} labels={labels} className="ml-auto md:ml-0" />
        <ThemeToggle labels={labels} className="-ml-3 md:ml-0" />
        <a
          href={profile.cv}
          download
          className="hidden h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[0.82rem] font-medium text-paper transition-colors hover:bg-accent md:inline-flex"
        >
          {labels.downloadCv} <ArrowDown width={14} height={14} />
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? labels.closeMenu : labels.openMenu}
          onClick={() => (open ? close() : setOpen(true))}
        >
          {open ? <Close width={22} height={22} /> : <Menu width={22} height={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-[calc(100dvh-4rem)] overflow-y-auto bg-paper md:hidden"
          >
            <nav aria-label={labels.mobileNav} className="shell flex h-full flex-col pt-8 pb-10">
              <ul className="space-y-1">
                {navigation.map((item, i) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-2 text-[2.4rem] font-semibold tracking-[-0.04em]"
                    >
                      <span className="eyebrow text-accent">0{i + 1}</span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-3 border-t border-line pt-6">
                <a href={profile.cv} download className="flex items-center justify-between text-lg font-medium">
                  {labels.downloadCv} <ArrowDown width={18} height={18} />
                </a>
                <a href={`mailto:${profile.email}`} className="block break-all text-muted">
                  {profile.email}
                </a>
              </div>
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
