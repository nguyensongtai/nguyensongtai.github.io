import type { Attribution } from "@/content/types";
import { cn } from "@/lib/cn";

export function AttributionBadge({
  attribution,
  label,
  tone = "paper",
  className,
}: {
  attribution: Attribution;
  /** "My work" / "Outcome of my work" / "Product / team scale", in the page's language */
  label: string;
  tone?: "paper" | "night";
  className?: string;
}) {
  const strong = attribution !== "team";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-wider uppercase",
        tone === "night" ? "text-night-muted" : "text-muted",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          strong ? (tone === "night" ? "bg-electric" : "bg-accent") : "border border-current",
        )}
      />
      {label}
    </span>
  );
}
