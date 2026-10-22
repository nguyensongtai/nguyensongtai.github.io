import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "night";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-accent",
  secondary: "border border-ink/15 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink underline-offset-4 hover:underline px-0",
  night: "border border-night-line text-night-text hover:border-electric hover:text-white",
};

export function ButtonLink({
  variant = "primary",
  icon,
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; icon?: ReactNode }) {
  return (
    <a
      className={cn(
        "group inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.92rem] font-medium tracking-[-0.01em] transition-colors duration-200",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
      {icon ? (
        <span aria-hidden className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5">
          {icon}
        </span>
      ) : null}
    </a>
  );
}
