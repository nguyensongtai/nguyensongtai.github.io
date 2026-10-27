const nodes = [
  { id: "ui", title: "Next.js UI", body: "Streaming chat + RAG search, with in-progress and error states" },
  { id: "agent", title: "Agent service", body: "LangGraph orchestrates retrieval and tool calls" },
  { id: "mcp", title: "MCP server", body: "Exposes the same tools to other clients" },
  { id: "tools", title: "Tools", body: "Property search · geo lookup · knowledge" },
];

/** Request flow for the AI features. Dashed connectors animate with CSS only. */
export function AgentDiagram() {
  return (
    <figure aria-label="AI feature architecture">
      <ol className="grid gap-3 md:grid-cols-4 md:gap-0">
        {nodes.map((n, i) => (
          <li key={n.id} className="relative md:pr-8">
            <div className="h-full rounded-xl border border-night-line bg-night-2 p-4">
              <p className="font-mono text-[0.68rem] text-electric">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-medium text-white">{n.title}</p>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-night-muted">{n.body}</p>
            </div>
            {i < nodes.length - 1 ? (
              <svg
                aria-hidden
                className="absolute top-1/2 right-0 hidden h-3 w-8 -translate-y-1/2 md:block"
                viewBox="0 0 32 12"
              >
                <line x1="2" y1="6" x2="26" y2="6" stroke="#6b86ff" strokeWidth="1.5" strokeDasharray="3 3" className="animate-[dash_1.2s_linear_infinite]" />
                <path d="M24 2 L30 6 L24 10" fill="none" stroke="#6b86ff" strokeWidth="1.5" />
              </svg>
            ) : null}
          </li>
        ))}
      </ol>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-night-muted">
        <span className="text-night-text">↩ streamed answer + cited sources back to the UI</span>
        <span aria-hidden>·</span>
        <span>conceptual flow</span>
      </figcaption>
    </figure>
  );
}
