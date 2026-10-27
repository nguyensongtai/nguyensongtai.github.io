"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { IllustrativeTag, Segmented } from "./primitives";

const themes = {
  rose: { label: "Rosé", accent: "#ff7aa8" },
  sage: { label: "Sage", accent: "#5fd3a7" },
  amber: { label: "Amber", accent: "#ffb547" },
} as const;
type Theme = keyof typeof themes;
type Role = "owner" | "staff";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const bookings = [
  { id: 1, client: "Ji-woo", service: "Cut & style", stylist: "Stylist A", day: 0, start: 0, span: 1, status: "Confirmed", revenue: 45 },
  { id: 2, client: "Min-seo", service: "Color", stylist: "Stylist B", day: 1, start: 1, span: 2, status: "Confirmed", revenue: 120 },
  { id: 3, client: "Hana", service: "Treatment", stylist: "Stylist A", day: 2, start: 3, span: 1, status: "Pending", revenue: 60 },
  { id: 4, client: "Seo-yeon", service: "Perm", stylist: "Stylist C", day: 3, start: 0, span: 3, status: "Confirmed", revenue: 150 },
  { id: 5, client: "Yuna", service: "Cut & style", stylist: "Stylist B", day: 4, start: 4, span: 1, status: "Pending", revenue: 45 },
] as const;

type SortKey = "client" | "day" | "status";

function Calendar({ role }: { role: Role }) {
  const [selected, setSelected] = useState<number>(2);
  const b = bookings.find((x) => x.id === selected)!;
  return (
    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
      <div className="self-start overflow-x-auto rounded-lg border border-night-line">
        <div className="grid min-w-[420px] grid-cols-[44px_repeat(5,1fr)] text-[0.7rem]">
          <span />
          {days.map((d) => (
            <span key={d} className="border-l border-night-line px-2 py-1.5 font-mono text-night-muted">{d}</span>
          ))}
          {hours.map((h, r) => (
            <div key={h} className="contents">
              <span className="border-t border-night-line px-1.5 py-2 font-mono text-[0.58rem] text-night-muted">{h}</span>
              {days.map((d, c) => {
                const booking = bookings.find((x) => x.day === c && x.start === r);
                const covered = bookings.some((x) => x.day === c && r > x.start && r < x.start + x.span);
                return (
                  <div key={d} className="relative h-9 border-t border-l border-night-line">
                    {booking && !covered ? (
                      <button
                        type="button"
                        onClick={() => setSelected(booking.id)}
                        aria-pressed={selected === booking.id}
                        className={cn(
                          "absolute inset-x-1 top-1 z-10 rounded-md px-1.5 py-1 text-left text-[0.68rem] leading-tight text-night transition-[box-shadow,transform] hover:-translate-y-px",
                          selected === booking.id && "ring-2 ring-white/80",
                        )}
                        style={{
                          height: `calc(${booking.span * 2.25}rem - 0.5rem)`,
                          background: "var(--tenant)",
                          opacity: booking.status === "Pending" ? 0.7 : 1,
                        }}
                      >
                        <span className="block font-medium">{booking.client}</span>
                        <span className="block opacity-75">{booking.service}</span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <form
        className="space-y-2.5 rounded-lg border border-night-line bg-night-2 p-3"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Booking details"
      >
        <p className="font-mono text-[0.68rem] tracking-wider text-night-muted uppercase">Booking #{b.id}</p>
        {[
          ["Client", b.client],
          ["Service", b.service],
          ["Stylist", b.stylist],
          ["Time", `${days[b.day]} · ${hours[b.start]}`],
        ].map(([label, value]) => (
          <label key={label} className="block">
            <span className="text-[0.68rem] text-night-muted">{label}</span>
            <input
              readOnly
              value={value}
              className="mt-0.5 w-full rounded-md border border-night-line bg-night px-2 py-1.5 text-[0.75rem] text-night-text outline-none focus:border-[var(--tenant)]"
            />
          </label>
        ))}
        <div className="flex gap-2 pt-1">
          <button type="submit" className="flex-1 rounded-md py-1.5 text-[0.72rem] font-medium text-night" style={{ background: "var(--tenant)" }}>
            Save
          </button>
          {role === "owner" ? (
            <button type="button" className="rounded-md border border-night-line px-2.5 text-[0.72rem] text-night-muted hover:text-night-text">
              Cancel
            </button>
          ) : null}
        </div>
        {role === "staff" ? <p className="text-[0.68rem] text-night-muted">Staff can edit but not cancel bookings.</p> : null}
      </form>
    </div>
  );
}

function BookingsTable({ role }: { role: Role }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "day", dir: 1 });
  const rows = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        const va = sort.key === "day" ? a.day * 10 + a.start : a[sort.key];
        const vb = sort.key === "day" ? b.day * 10 + b.start : b[sort.key];
        return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
      }),
    [sort],
  );
  const header = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className="px-3 py-2 font-normal">
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}
        className="inline-flex items-center gap-1 uppercase hover:text-night-text"
      >
        {label}
        <span aria-hidden className={cn(sort.key !== key && "opacity-30")}>{sort.key === key && sort.dir === -1 ? "↓" : "↑"}</span>
      </button>
    </th>
  );
  return (
    <div className="overflow-x-auto rounded-lg border border-night-line">
      <table className="w-full min-w-[440px] text-left text-[0.75rem]">
        <caption className="sr-only">Bookings this week, sortable</caption>
        <thead className="bg-night-2 font-mono text-[0.68rem] tracking-wider text-night-muted">
          <tr>
            {header("client", "Client")}
            {header("day", "When")}
            <th scope="col" className="px-3 py-2 font-normal uppercase">Service</th>
            {header("status", "Status")}
            {role === "owner" ? <th scope="col" className="px-3 py-2 text-right font-normal uppercase">Revenue</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-night-line">
              <td className="px-3 py-2.5 text-night-text">{b.client}</td>
              <td className="px-3 py-2.5 font-mono text-night-muted">{days[b.day]} {hours[b.start]}</td>
              <td className="px-3 py-2.5 text-night-muted">{b.service}</td>
              <td className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-night-text">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: b.status === "Confirmed" ? "var(--tenant)" : "#8e94a4" }} />
                  {b.status}
                </span>
              </td>
              {role === "owner" ? <td className="px-3 py-2.5 text-right font-mono text-night-muted">₩{(b.revenue * 1000).toLocaleString("en-US")}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SalonPreview() {
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const [theme, setTheme] = useState<Theme>("rose");
  const [role, setRole] = useState<Role>("owner");

  return (
    <div style={{ "--tenant": themes[theme].accent } as CSSProperties}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <IllustrativeTag />
        <div className="flex flex-wrap items-center gap-4">
          <div role="group" aria-label="Tenant theme" className="flex items-center gap-2">
            <span className="font-mono text-[0.68rem] tracking-wider text-night-muted uppercase">Tenant theme</span>
            {(Object.keys(themes) as Theme[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={theme === t}
                aria-label={themes[t].label}
                onClick={() => setTheme(t)}
                className={cn("h-5 w-5 rounded-full transition-transform", theme === t ? "ring-2 ring-white ring-offset-2 ring-offset-night" : "hover:scale-110")}
                style={{ background: themes[t].accent }}
              />
            ))}
          </div>
          <Segmented
            label="Role"
            value={role}
            onChange={setRole}
            options={[
              { id: "owner", label: "Owner" },
              { id: "staff", label: "Staff" },
            ]}
          />
        </div>
      </div>
      <Tabs
        label="Salon CRM preview"
        value={view}
        onChange={setView}
        items={[
          { id: "calendar", label: "Booking calendar" },
          { id: "table", label: "Bookings table" },
        ]}
        renderPanel={(v) => (v === "calendar" ? <Calendar role={role} /> : <BookingsTable role={role} />)}
      />
      <p className="mt-3 text-[0.74rem] text-night-muted">
        The same components re-theme per tenant, and role decides which columns and actions appear.
      </p>
    </div>
  );
}
