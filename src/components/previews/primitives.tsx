import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Every preview carries this label so nobody mistakes it for a production screenshot. */
export function IllustrativeTag({ className }: { className?: string }) {
  return (
    <p className={cn("font-mono text-[0.68rem] tracking-wider text-night-muted uppercase", className)}>
      Interactive recreation · sample data · not production UI
    </p>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[0.72rem] transition-colors",
        active
          ? "border-electric bg-electric/15 text-white"
          : "border-night-line text-night-muted hover:border-night-muted hover:text-night-text",
      )}
    >
      {children}
    </button>
  );
}

export function Skel({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block rounded-sm bg-night-line", className)} />;
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="font-mono text-[0.68rem] tracking-wider text-night-muted uppercase">{label}</span>
      <div className="flex rounded-full bg-night-3 p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[0.7rem] transition-colors",
              value === o.id ? "bg-night-text text-night" : "text-night-muted hover:text-night-text",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
