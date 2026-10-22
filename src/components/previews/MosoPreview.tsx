"use client";

import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { Chip, IllustrativeTag, Segmented, Skel } from "./primitives";

type View = "search" | "admin";

const listings = [
  { id: 1, title: "Riverside apartment", beds: 2, area: 68, type: "sale", photos: true, district: "District 7" },
  { id: 2, title: "Garden townhouse", beds: 4, area: 120, type: "sale", photos: true, district: "Thu Duc" },
  { id: 3, title: "Studio near metro", beds: 1, area: 34, type: "rent", photos: false, district: "District 2" },
  { id: 4, title: "Corner apartment", beds: 3, area: 92, type: "rent", photos: true, district: "District 7" },
  { id: 5, title: "Lakeside villa", beds: 5, area: 210, type: "sale", photos: false, district: "District 9" },
] as const;

const clusters = [
  { id: "a", x: 30, y: 38, pins: [[24, 30], [34, 44], [28, 48]] },
  { id: "b", x: 64, y: 30, pins: [[60, 24], [70, 32], [66, 38], [58, 34]] },
  { id: "c", x: 52, y: 70, pins: [[48, 66], [58, 74]] },
] as const;

function SearchView() {
  const [type, setType] = useState<"sale" | "rent">("sale");
  const [bedsTwoPlus, setBeds] = useState(false);
  const [photos, setPhotos] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const results = useMemo(
    () =>
      listings.filter(
        (l) => l.type === type && (!bedsTwoPlus || l.beds >= 2) && (!photos || l.photos),
      ),
    [type, bedsTwoPlus, photos],
  );

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
      <div className="min-w-0">
        <div className="flex items-center gap-2 rounded-lg border border-night-line bg-night-2 px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-night-muted" aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span className="text-[0.8rem] text-night-text">Apartments in District 7</span>
          <span className="caret ml-[-2px] text-electric" aria-hidden />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip active={type === "sale"} onClick={() => setType("sale")}>For sale</Chip>
          <Chip active={type === "rent"} onClick={() => setType("rent")}>For rent</Chip>
          <Chip active={bedsTwoPlus} onClick={() => setBeds((v) => !v)}>2+ beds</Chip>
          <Chip active={photos} onClick={() => setPhotos((v) => !v)}>Has photos</Chip>
        </div>
        <p className="mt-3 font-mono text-[0.62rem] text-night-muted" aria-live="polite">
          {results.length} result{results.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-2 space-y-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {results.map((l) => (
              <m.li
                key={l.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-3 rounded-lg border border-night-line bg-night-2 p-2"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-11 w-14 shrink-0 rounded-md",
                    l.photos
                      ? "bg-[linear-gradient(135deg,#2a3350,#151a28_60%,#3a4566)]"
                      : "border border-dashed border-night-line",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.78rem] text-night-text">
                    {l.title} · {l.beds}BR · {l.area} m²
                  </p>
                  <p className="text-[0.66rem] text-night-muted">{l.district} · verified agent</p>
                </div>
                <Skel className="h-2 w-10" />
              </m.li>
            ))}
          </AnimatePresence>
          {results.length === 0 ? (
            <li className="rounded-lg border border-dashed border-night-line p-4 text-center text-[0.75rem] text-night-muted">
              No matches. Empty states are designed too.
            </li>
          ) : null}
        </ul>
      </div>

      <div className="relative min-h-[260px] overflow-hidden rounded-lg border border-night-line bg-[#0e1119]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M-5 62 C 20 55, 35 78, 55 62 S 85 40, 105 52" stroke="#1d2a44" strokeWidth="7" fill="none" />
          {[18, 40, 63, 84].map((x) => (
            <path key={x} d={`M${x} 0 L${x - 6} 100`} stroke="#1a1f2b" strokeWidth="0.6" />
          ))}
          {[22, 47, 80].map((y) => (
            <path key={y} d={`M0 ${y} L100 ${y + 4}`} stroke="#1a1f2b" strokeWidth="0.6" />
          ))}
        </svg>
        {clusters.map((c) => {
          const expanded = open === c.id;
          return (
            <div key={c.id}>
              <AnimatePresence>
                {expanded
                  ? c.pins.map(([x, y], i) => (
                      <m.span
                        key={`${c.id}-${i}`}
                        aria-hidden
                        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0e1119] bg-electric"
                        initial={{ left: `${c.x}%`, top: `${c.y}%`, opacity: 0 }}
                        animate={{ left: `${x}%`, top: `${y}%`, opacity: 1 }}
                        exit={{ left: `${c.x}%`, top: `${c.y}%`, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))
                  : null}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : c.id)}
                aria-pressed={expanded}
                aria-label={`${expanded ? "Collapse" : "Expand"} cluster of ${c.pins.length} listings`}
                className={cn(
                  "absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-[0.72rem] transition-all",
                  expanded
                    ? "scale-75 border border-electric bg-transparent text-electric"
                    : "bg-electric text-white shadow-[0_0_0_6px_rgb(107_134_255/0.18)] hover:shadow-[0_0_0_9px_rgb(107_134_255/0.22)]",
                )}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                {c.pins.length}
              </button>
            </div>
          );
        })}
        <p className="absolute bottom-2 left-3 font-mono text-[0.6rem] text-night-muted">
          Map-based discovery · click a cluster
        </p>
      </div>
    </div>
  );
}

type Role = "admin" | "agent" | "telesales";

const transactions = [
  { id: "TX-1042", status: "Pending", agent: "Agent A", own: true, commission: "2.0%" },
  { id: "TX-1043", status: "Verified", agent: "Agent B", own: false, commission: "1.5%" },
  { id: "TX-1044", status: "Pending", agent: "Agent A", own: true, commission: "2.0%" },
  { id: "TX-1045", status: "Rejected", agent: "Agent C", own: false, commission: "1.0%" },
] as const;

const permissions: Record<Role, { scope: "all" | "own"; commission: boolean; verify: boolean }> = {
  admin: { scope: "all", commission: true, verify: true },
  agent: { scope: "own", commission: true, verify: false },
  telesales: { scope: "all", commission: false, verify: false },
};

const statusTone: Record<string, string> = {
  Pending: "text-amber-300 bg-amber-300/10",
  Verified: "text-emerald-300 bg-emerald-300/10",
  Rejected: "text-rose-300 bg-rose-300/10",
};

function AdminView() {
  const [role, setRole] = useState<Role>("admin");
  const p = permissions[role];
  const rows = transactions.filter((t) => p.scope === "all" || t.own);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Viewing as"
          value={role}
          onChange={setRole}
          options={[
            { id: "admin", label: "Admin" },
            { id: "agent", label: "Agent" },
            { id: "telesales", label: "Telesales" },
          ]}
        />
        <p className="font-mono text-[0.62rem] text-night-muted">
          scope: {p.scope} · commission: {p.commission ? "visible" : "hidden"} · verify: {p.verify ? "allowed" : "denied"}
        </p>
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-night-line">
        <table className="w-full min-w-[460px] text-left text-[0.75rem]">
          <caption className="sr-only">Transaction verification, filtered by role</caption>
          <thead className="bg-night-2 font-mono text-[0.6rem] tracking-wider text-night-muted uppercase">
            <tr>
              <th scope="col" className="px-3 py-2 font-normal">Transaction</th>
              <th scope="col" className="px-3 py-2 font-normal">Status</th>
              <th scope="col" className="px-3 py-2 font-normal">Agent</th>
              {p.commission ? <th scope="col" className="px-3 py-2 font-normal">Commission</th> : null}
              <th scope="col" className="px-3 py-2 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-night-line">
                <td className="px-3 py-2.5 font-mono text-night-text">{t.id}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("rounded px-1.5 py-0.5 text-[0.66rem]", statusTone[t.status])}>{t.status}</span>
                </td>
                <td className="px-3 py-2.5 text-night-muted">{t.agent}</td>
                {p.commission ? <td className="px-3 py-2.5 text-night-muted">{t.commission}</td> : null}
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    disabled={!p.verify || t.status !== "Pending"}
                    className="rounded border border-night-line px-2 py-1 text-[0.66rem] text-night-text transition-colors enabled:hover:border-electric enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[0.74rem] text-night-muted">
        One permission model decides rows, columns and actions, and the backend enforces the same rules.
      </p>
    </div>
  );
}

export function MosoPreview() {
  const [view, setView] = useState<View>("search");
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <IllustrativeTag />
      </div>
      <Tabs
        label="MOSO preview"
        value={view}
        onChange={setView}
        items={[
          { id: "search", label: "Search & map" },
          { id: "admin", label: "Admin · RBAC" },
        ]}
        renderPanel={(v) => (v === "search" ? <SearchView /> : <AdminView />)}
      />
    </div>
  );
}
