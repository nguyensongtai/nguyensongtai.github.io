"use client";

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { Chip, IllustrativeTag, Skel } from "./primitives";

type Kind = "Scooter" | "Manual" | "Sport";
const bikes: { id: number; kind: Kind; year: number; area: string; video: boolean }[] = [
  { id: 1, kind: "Scooter", year: 2021, area: "District 1", video: true },
  { id: 2, kind: "Manual", year: 2019, area: "Thu Duc", video: false },
  { id: 3, kind: "Sport", year: 2022, area: "District 3", video: true },
  { id: 4, kind: "Scooter", year: 2018, area: "Binh Thanh", video: false },
  { id: 5, kind: "Manual", year: 2021, area: "District 10", video: true },
  { id: 6, kind: "Scooter", year: 2023, area: "Go Vap", video: false },
];

function LazyMedia({ seed }: { seed: number }) {
  // Placeholder → "loaded" when scrolled into view, the way listing media was deferred.
  return (
    <m.span
      aria-hidden
      className="grid aspect-[4/3] w-full place-items-center rounded-md text-white/25"
      style={{
        background: `linear-gradient(${120 + seed * 25}deg, #1b2236, #2b3654 55%, #141a29)`,
      }}
      initial={{ filter: "blur(10px)", opacity: 0.35 }}
      whileInView={{ filter: "blur(0px)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.6, delay: seed * 0.05 }}
    >
      <svg width="44" height="26" viewBox="0 0 44 26" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="18" r="6" />
        <circle cx="35" cy="18" r="6" />
        <path d="M9 18 17 8h9l5 10M17 8l-3-4h-4M26 8l3-3h5" />
      </svg>
    </m.span>
  );
}

function SearchView() {
  const [kind, setKind] = useState<Kind | "All">("All");
  const [recent, setRecent] = useState(false);
  const [video, setVideo] = useState(false);
  const results = bikes.filter(
    (b) => (kind === "All" || b.kind === kind) && (!recent || b.year >= 2020) && (!video || b.video),
  );
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {(["All", "Scooter", "Manual", "Sport"] as const).map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>{k}</Chip>
        ))}
        <span className="mx-1 w-px self-stretch bg-night-line" aria-hidden />
        <Chip active={recent} onClick={() => setRecent((v) => !v)}>2020 or newer</Chip>
        <Chip active={video} onClick={() => setVideo((v) => !v)}>Has video</Chip>
      </div>
      <p className="mt-3 font-mono text-[0.68rem] text-night-muted" aria-live="polite">
        {results.length} listing{results.length === 1 ? "" : "s"} · media lazy-loads on scroll
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((b) => (
            <m.li
              key={b.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="rounded-lg border border-night-line bg-night-2 p-2"
            >
              <LazyMedia seed={b.id} />
              <p className="mt-2 text-[0.74rem] text-night-text">{b.kind} · {b.year}</p>
              <p className="text-[0.64rem] text-night-muted">{b.area}{b.video ? " · video" : ""}</p>
              <Skel className="mt-2 h-1.5 w-12" />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

const sellerListings = [
  { id: "Scooter · 2021", status: "Active", trend: [3, 5, 4, 7, 6, 9, 8] },
  { id: "Manual · 2019", status: "In review", trend: [2, 2, 3, 2, 4, 3, 4] },
  { id: "Sport · 2022", status: "Sold", trend: [6, 8, 9, 7, 5, 3, 2] },
];

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 60},${18 - (p / max) * 16}`).join(" ");
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" aria-hidden className="overflow-visible">
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric" />
    </svg>
  );
}

function SellerView() {
  const [items, setItems] = useState(sellerListings);
  const markSold = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "Sold" } : x)));
  return (
    <div className="overflow-x-auto rounded-lg border border-night-line">
      <table className="w-full min-w-[420px] text-left text-[0.75rem]">
        <caption className="sr-only">Seller dashboard listings</caption>
        <thead className="bg-night-2 font-mono text-[0.68rem] tracking-wider text-night-muted uppercase">
          <tr>
            <th scope="col" className="px-3 py-2 font-normal">Listing</th>
            <th scope="col" className="px-3 py-2 font-normal">Status</th>
            <th scope="col" className="px-3 py-2 font-normal">Interest · 7d</th>
            <th scope="col" className="px-3 py-2 text-right font-normal">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={x.id} className="border-t border-night-line">
              <td className="px-3 py-2.5 text-night-text">{x.id}</td>
              <td className="px-3 py-2.5">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[0.7rem]",
                    x.status === "Active" && "bg-emerald-300/10 text-emerald-300",
                    x.status === "In review" && "bg-amber-300/10 text-amber-300",
                    x.status === "Sold" && "bg-night-3 text-night-muted",
                  )}
                >
                  {x.status}
                </span>
              </td>
              <td className="px-3 py-2.5"><Sparkline points={x.trend} /></td>
              <td className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  disabled={x.status !== "Active"}
                  onClick={() => markSold(x.id)}
                  className="rounded border border-night-line px-2 py-1 text-[0.7rem] text-night-text enabled:hover:border-electric disabled:opacity-35"
                >
                  Mark sold
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OkxePreview() {
  const [view, setView] = useState<"search" | "seller">("search");
  return (
    <div>
      <div className="mb-4">
        <IllustrativeTag />
      </div>
      <Tabs
        label="OKXE preview"
        value={view}
        onChange={setView}
        items={[
          { id: "search", label: "Search & filters" },
          { id: "seller", label: "Seller dashboard" },
        ]}
        renderPanel={(v) => (v === "search" ? <SearchView /> : <SellerView />)}
      />
    </div>
  );
}
