import type { Attribution } from "@/content/types";
import { cn } from "@/lib/cn";

const copy: Record<Attribution, string> = {
  personal: "My work",
  outcome: "Outcome of my work",
  team: "Product / team scale",
};

export function AttributionBadge({
  attribution,
  tone = "paper",
  className,
}: {
  attribution: Attribution;
  tone?: "paper" | "night";
  className?: string;
}) {
  const strong = attribution !== "team";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-wider uppercase",
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
      {copy[attribution]}
    </span>
  );
}
