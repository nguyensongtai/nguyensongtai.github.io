"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type Theme = "dark" | "light";

const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // private mode: the choice just won't persist
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f7f6f2" : "#07080c");
}

/** Dark (immersive 3D) ↔ light (editorial). The 3D scene listens for the change. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-ink/40 hover:text-ink",
        className,
      )}
    >
      {theme === "dark" ? <Sun width={16} height={16} /> : <Moon width={16} height={16} />}
    </button>
  );
}
