"use client";

import { useState } from "react";
import { Check, Copy } from "@/components/ui/icons";

export function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 px-4 text-[0.88rem] transition-colors hover:border-ink"
    >
      {copied ? <Check /> : <Copy />}
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
