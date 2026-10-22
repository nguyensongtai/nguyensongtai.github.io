"use client";

import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { navigation, profile } from "@/content/portfolio";
import { ArrowDown, Close, Menu } from "@/components/ui/icons";
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

const sectionIds = navigation.map((n) => n.href.slice(1));

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dark = document.getElementById("ai");
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // Switch to the dark header while it sits over the dark AI band.
      const r = dark?.getBoundingClientRect();
      setOverDark(!!r && r.top <= 64 && r.bottom >= 64);
    };
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
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-300",
        overDark && !open
          ? "dark-header border-b border-night-line bg-night/80 text-white backdrop-blur-md"
          : scrolled || open
            ? "border-b border-line bg-paper/85 backdrop-blur-md"
            : "border-b border-transparent",
      )}
    >
      <div className="shell flex h-16 items-center gap-6">
        <a href="#top" className="flex items-baseline gap-2 text-[0.95rem] font-semibold tracking-[-0.02em]">
          {profile.name}
          <span className={cn("eyebrow hidden md:inline", overDark && !open ? "text-night-muted" : "text-muted")}>Frontend</span>
        </a>

        <nav aria-label="Primary" className="ml-auto hidden md:block">
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
                      overDark && !open
                        ? isActive ? "text-white" : "text-night-muted hover:text-white"
                        : isActive ? "text-ink" : "text-muted hover:text-ink",
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

        <a
          href={profile.cv}
          download
          className={cn(
            "hidden h-9 items-center gap-1.5 rounded-full px-4 text-[0.82rem] font-medium transition-colors hover:bg-accent hover:text-white md:inline-flex",
            overDark && !open ? "bg-white text-night" : "bg-ink text-paper",
          )}
        >
          Download CV <ArrowDown width={14} height={14} />
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
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
            aria-label="Site menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-[calc(100dvh-4rem)] overflow-y-auto bg-paper md:hidden"
          >
            <nav aria-label="Mobile" className="shell flex h-full flex-col pt-8 pb-10">
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
                  Download CV <ArrowDown width={18} height={18} />
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
