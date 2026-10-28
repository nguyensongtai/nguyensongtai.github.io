import { cn } from "@/lib/cn";

/** Brand-coloured badge per technology (colour + short mark), so stacks scan at a glance. */
const MARKS: Record<string, [background: string, foreground: string, mark: string]> = {
  HTML: ["#e34f26", "#fff", "5"],
  CSS: ["#1572b6", "#fff", "3"],
  JavaScript: ["#f7df1e", "#111", "JS"],
  React: ["#61dafb", "#0b1020", "R"],
  SCSS: ["#cc6699", "#fff", "S"],
  "WCAG 2.1": ["#6e56cf", "#fff", "A"],
  "Responsive design": ["#0ea5e9", "#fff", "↔"],
  "Vue.js": ["#42b883", "#fff", "V"],
  "Vue.js 3": ["#42b883", "#fff", "V"],
  Vuetify: ["#1867c0", "#fff", "V"],
  TypeScript: ["#3178c6", "#fff", "TS"],
  "Next.js 15": ["#000", "#fff", "N"],
  Mantine: ["#339af0", "#fff", "M"],
  "Tailwind CSS": ["#38bdf8", "#0b1020", "T"],
  "Core Web Vitals": ["#0f9d58", "#fff", "⚡"],
  "JSON-LD": ["#5b6b8c", "#fff", "{}"],
  LangGraph: ["#1c3c3c", "#fff", "LG"],
  MCP: ["#d97757", "#fff", "M"],
  "Node.js": ["#5fa04e", "#fff", "N"],
  Fastify: ["#222", "#fff", "F"],
  MongoDB: ["#47a248", "#fff", "M"],
  Elasticsearch: ["#fec514", "#111", "E"],
  Docker: ["#2496ed", "#fff", "D"],
};

export function TechChip({ name, className }: { name: string; className?: string }) {
  const [bg, fg, mark] = MARKS[name] ?? ["var(--accent)", "#fff", name[0]];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/40 py-0.5 pr-2.5 pl-1 text-[0.76rem] text-ink-2",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 font-mono text-[0.58rem] leading-none font-bold"
        style={{ background: bg, color: fg }}
      >
        {mark}
      </span>
      {name}
    </span>
  );
}
