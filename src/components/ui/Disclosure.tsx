"use client";

import { AnimatePresence, m } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { Plus } from "./icons";
import { cn } from "@/lib/cn";

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn("border-t border-line", className)}>
      <h4>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 py-4 text-left text-[0.95rem] font-medium tracking-[-0.01em] hover:text-accent"
        >
          {title}
          <Plus
            className={cn("shrink-0 transition-transform duration-300", open && "rotate-45")}
            width={18}
            height={18}
          />
        </button>
      </h4>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={id}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
