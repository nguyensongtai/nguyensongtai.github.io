import type { CaseStudy, Metric, Principle, Role } from "./types";

/**
 * Single source of truth for the site. Every figure here is taken from the CV
 * (public/NguyenSongTai-CV.pdf) — update both together.
 */
export const profile = {
  name: "Nguyen Song Tai",
  role: "Senior Frontend Engineer",
  years: "5+",
  location: "Ho Chi Minh City, Vietnam",
  timezone: "UTC+7",
  availability: "Open to new opportunities",
  url: "https://nguyensongtai.github.io",
  email: "tainguyen06061999@gmail.com",
  cv: "/NguyenSongTai-CV.pdf",
  focus: ["React", "Next.js", "TypeScript", "Web Performance", "AI Integration"],
  headline: { lead: "I build performant", tail: "web products that", accent: "scale." },
  intro:
    "From frontend architecture and performance optimization to AI-powered experiences, I turn complex product requirements into reliable, user-focused interfaces.",
  links: {
    linkedin: "https://www.linkedin.com/in/tainguyen99/",
    github: "https://github.com/nguyensongtai",
    source: "https://github.com/nguyensongtai/nguyensongtai.github.io",
  },
} as const;

export const navigation = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#ai", label: "AI" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
] as const;

export const impact: Metric[] = [
  {
    value: "~40%",
    label: "lower mobile LCP on moso.vn",
    context: "Streaming SSR, hydration, code splitting, image/font loading and CDN caching.",
    attribution: "personal",
  },
  {
    value: "~30%",
    label: "organic traffic growth in 6 months",
    context: "After the technical SEO foundation shipped across listing and project pages.",
    attribution: "outcome",
  },
  {
    value: "9",
    label: "production repos on my architecture standard",
    context: "New-developer onboarding time cut by ~40%.",
    attribution: "personal",
  },
  {
    value: "10,000+",
    label: "salons using CRM screens I built",
    context: "Data tables, booking calendars and booking forms used daily by salon staff in Korea.",
    attribution: "team",
  },
];

export const caseStudies: CaseStudy[] = [
  {
    id: "moso",
    index: "01",
    title: "MOSO.vn",
    kicker: "PropTech platform",
    company: "MOSO",
    role: "Software Engineer (Frontend)",
    period: "Apr 2025 — Present",
    url: "https://moso.vn",
    stack: ["Next.js 15", "React", "TypeScript", "Mantine", "Tailwind CSS"],
    summary:
      "I lead frontend delivery for a real-estate marketplace: property search, listing posting, the agent directory, map-based project discovery, the admin/CRM console and AI-powered property discovery.",
    challenge:
      "A content-heavy marketplace has to load fast on mobile, make every listing and project page indexable, and stay maintainable while the product keeps adding surfaces such as admin/CRM tools, mobile clients and AI services.",
    decisions: [
      {
        title: "Treat performance as a rendering problem",
        body: "I tuned streaming SSR and hydration, split code by route, reworked image and font loading, and moved cacheable responses to the CDN. Lab scores became targets we track, not a one-off audit.",
      },
      {
        title: "Build SEO into the page model",
        body: "JSON-LD, dynamic sitemaps, metadata and Open Graph are generated for every listing and project page, so new pages are indexable by default.",
      },
      {
        title: "One architecture standard across nine repos",
        body: "Folder structure, API and i18n conventions and a testing strategy, backed by codegen and prompt tooling that scaffolds standard-compliant modules. I guided adoption through code reviews.",
      },
      {
        title: "Model permissions, not buttons",
        body: "I designed multi-tenant RBAC across UI and backend for admin/CRM modules (transaction verification, telesales, HR and analytics), so access rules live in one place.",
      },
    ],
    owned: [
      "Frontend delivery of search, listing posting, the agent directory and map-based project pages",
      "Performance work on streaming SSR, hydration, code splitting, image/font loading and CDN caching",
      "Technical SEO foundation: JSON-LD, dynamic sitemaps, metadata, Open Graph",
      "The frontend architecture standard, plus codegen and prompt tooling",
      "Multi-tenant RBAC design across UI and backend",
      "AI property-finder chat, RAG search, and the LangGraph agent service with an MCP server",
    ],
    teamContext: [
      "Delivered together with Product, Design and Backend.",
      "Platform scale (24,000+ active listings, 26,000+ users) is a company outcome; the frontend work above supports it.",
      "Organic growth was measured in the six months after the SEO foundation shipped.",
    ],
    metrics: [
      {
        value: "~40%",
        label: "lower mobile LCP",
        context: "From streaming SSR, hydration, code splitting, image/font loading and CDN caching.",
        attribution: "personal",
      },
      {
        value: "40 → 70",
        label: "Lighthouse performance (+75%)",
        context: "Lab score, which we track as an ongoing target.",
        attribution: "personal",
      },
      {
        value: "~30%",
        label: "organic traffic growth",
        context: "Within six months of the technical SEO foundation.",
        attribution: "outcome",
      },
      {
        value: "~40%",
        label: "faster developer onboarding",
        context: "Architecture standard adopted by 9 production repositories. Codegen also cut new-module setup by ~50%.",
        attribution: "outcome",
      },
      {
        value: "24,000+",
        label: "active listings · 26,000+ users",
        context: "Platform scale. A team outcome.",
        attribution: "team",
      },
    ],
    details: [
      {
        title: "Rendering & performance",
        items: [
          "Streaming SSR so the page shell paints before data-heavy sections resolve",
          "Hydration tuning to cut main-thread work on mobile",
          "Route-level code splitting and lazy loading of non-critical UI",
          "Image and font loading strategy for listing-heavy pages",
          "CDN caching for cacheable responses",
        ],
      },
      {
        title: "Technical SEO",
        items: [
          "JSON-LD structured data on listing and project pages",
          "Dynamic sitemaps that track the live listing inventory",
          "Per-page metadata and Open Graph for sharing",
        ],
      },
      {
        title: "Architecture & tooling",
        items: [
          "Shared conventions for folder structure, API layer, i18n and testing",
          "Codegen and prompt tooling that generates standard-compliant modules (~50% faster setup)",
          "Adoption guided through code review across 9 production repositories",
        ],
      },
    ],
    preview: "moso",
  },
  {
    id: "salon",
    index: "02",
    title: "Beauty Salon CRM",
    kicker: "B2B SaaS · Korea",
    company: "Ahasoft",
    role: "Frontend Developer",
    period: "Mar 2024 — Mar 2025",
    stack: ["Vue.js 3", "TypeScript"],
    summary:
      "A multi-tenant CRM used daily by staff across 10,000+ salons in Korea. I built its data tables, booking calendars and booking forms from the Korean product team's Figma specs.",
    challenge:
      "Salon staff use these dense, workflow-heavy screens all day. Every tenant's data must stay isolated, and one component library has to serve several tenant themes without regressions.",
    decisions: [
      {
        title: "Interfaces built for daily operations",
        body: "Data tables, booking calendars and booking forms are designed for speed and clarity during a busy salon day, built faithfully from the product team's Figma specs.",
      },
      {
        title: "Permissions with real isolation",
        body: "Role-based permissions with full per-tenant data isolation, so each salon only sees and acts on its own data.",
      },
      {
        title: "One component library, many themes",
        body: "I maintained a shared component library across multiple tenant themes, which reduced UI defects by ~20%.",
      },
    ],
    owned: [
      "Data tables, booking calendars and booking forms",
      "Role-based permissions with per-tenant data isolation",
      "Maintenance of the shared, multi-theme component library",
    ],
    teamContext: [
      "Specs came from the Korean product team; 10,000+ salons reflects product scale.",
    ],
    metrics: [
      {
        value: "~20%",
        label: "fewer UI defects",
        context: "From a shared component library maintained across tenant themes.",
        attribution: "personal",
      },
      {
        value: "10,000+",
        label: "salons in Korea",
        context: "Product scale. The screens I built are used daily by salon staff.",
        attribution: "team",
      },
    ],
    details: [
      {
        title: "What made it hard",
        items: [
          "High-density tables and calendars that must stay readable and fast",
          "Per-tenant isolation enforced in the UI as well as the data layer",
          "Theme variations sharing one set of components without visual regressions",
        ],
      },
    ],
    preview: "salon",
  },
  {
    id: "okxe",
    index: "03",
    title: "OKXE",
    kicker: "Motorcycle marketplace · Vietnam",
    company: "OKXE",
    role: "Frontend Developer",
    period: "Apr 2022 — Mar 2024",
    stack: ["Vue.js", "Vuetify", "JavaScript"],
    summary:
      "A marketplace with 1.5M+ users and 2M+ listings. In an Agile/Scrum team I developed listing creation, search and filters, checkout and the seller dashboard.",
    challenge:
      "On high-traffic listing pages, load time shapes how people browse. The release process also had to keep up with a fast-moving team.",
    decisions: [
      {
        title: "Faster listing pages",
        body: "Lazy loading, image optimization and code splitting on high-traffic listing pages reduced page load time by ~30%.",
      },
      {
        title: "Shared modules, shorter releases",
        body: "I extracted shared logic into a reusable module library and streamlined CI/CD, shortening release cycles by ~30%.",
      },
    ],
    owned: [
      "Listing creation, search and filters, checkout and seller dashboard",
      "Performance work on high-traffic listing pages",
      "The reusable module library and CI/CD streamlining",
    ],
    teamContext: ["Built in an Agile/Scrum team; 1.5M+ users and 2M+ listings reflect marketplace scale."],
    metrics: [
      {
        value: "~30%",
        label: "faster page load",
        context: "Lazy loading, image optimization and code splitting on listing pages.",
        attribution: "personal",
      },
      {
        value: "~30%",
        label: "shorter release cycles",
        context: "From a reusable module library and streamlined CI/CD.",
        attribution: "outcome",
      },
      {
        value: "1.5M+",
        label: "users · 2M+ listings",
        context: "Marketplace scale. A team outcome.",
        attribution: "team",
      },
    ],
    details: [
      {
        title: "Optimization toolkit",
        items: [
          "Lazy loading below-the-fold listing media",
          "Image optimization for listing galleries",
          "Code splitting so routes only ship what they render",
        ],
      },
    ],
    preview: "okxe",
  },
];

export const principles: Principle[] = [
  {
    id: "architecture",
    title: "Frontend architecture & reusable design systems",
    statement: "I treat conventions as a product for the other engineers who use them.",
    practice: [
      "Defined the architecture standard (structure, API and i18n conventions, testing strategy) adopted by 9 production repos",
      "Built codegen and prompt tooling that generates compliant modules, cutting setup time by ~50%",
      "Maintained a multi-theme component library that reduced UI defects by ~20%",
    ],
    snippet: {
      label: "module layout · illustrative",
      code: `src/modules/listing/
├─ api/          typed request layer
├─ components/   presentational UI
├─ hooks/        data + view state
├─ i18n/         vi.json · en.json
├─ schema.ts     single source of types
└─ listing.test.ts`,
    },
  },
  {
    id: "performance",
    title: "Performance engineering & Core Web Vitals",
    statement: "Measure first, then move the bottleneck. Never optimize from guesses.",
    practice: [
      "Cut mobile LCP by ~40% on moso.vn and raised Lighthouse performance from 40 to 70",
      "Reduced page load time by ~30% on OKXE's high-traffic listing pages",
      "Use lab scores as targets to keep improving, not a finish line",
    ],
    snippet: {
      label: "streaming the slow part · pattern",
      code: `export default function Page({ query }) {
  return (
    <Shell>                       {/* paints first */}
      <Suspense fallback={<ResultsSkeleton />}>
        <Results query={query} /> {/* streams in */}
      </Suspense>
    </Shell>
  );
}`,
    },
  },
  {
    id: "seo",
    title: "Technical SEO, SSR & rendering strategies",
    statement: "On a marketplace, every listing is a landing page.",
    practice: [
      "Built JSON-LD, dynamic sitemaps, metadata and Open Graph across all listing and project pages",
      "Grew organic traffic by ~30% within six months",
      "Choose SSR, streaming or static rendering per page based on its content",
    ],
    snippet: {
      label: "structured data · pattern",
      code: `const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: listing.title,
  url: canonicalUrl(listing),
  datePosted: listing.publishedAt,
};`,
    },
  },
  {
    id: "workflows",
    title: "Complex product workflows & multi-tenant interfaces",
    statement: "Model the permission, not the button.",
    practice: [
      "Designed multi-tenant RBAC across UI and backend for MOSO's admin/CRM modules",
      "Built role-based permissions with full per-tenant isolation for a 10,000+ salon CRM",
      "Built booking calendars, dense data tables and multi-step forms",
    ],
    snippet: {
      label: "one rule, enforced everywhere · pattern",
      code: `can(user, "transaction:verify", { tenantId })
  ? <VerifyButton />
  : <RequestAccessHint />;`,
    },
  },
  {
    id: "ai",
    title: "AI integration, RAG search & streaming experiences",
    statement: "I ship AI features with the same rigor as any other product surface.",
    practice: [
      "Built a streaming AI property-finder chat with clear in-progress states",
      "Built RAG search that shows its sources, so every answer can be checked",
      "Built the LangGraph agent service and an MCP server behind them",
    ],
    snippet: {
      label: "rendering a stream · pattern",
      code: `for await (const chunk of stream) {
  if (chunk.type === "token") append(chunk.text);
  if (chunk.type === "source") addSource(chunk.ref);
}`,
    },
  },
  {
    id: "delivery",
    title: "Cross-functional delivery & code quality",
    statement: "Good frontend work starts in the requirements conversation, before any code.",
    practice: [
      "Work with Product, Design and Backend from requirements to release",
      "Guide teammates through code review instead of only documenting rules",
      "Delivered agency projects on fixed deadlines under strict QA, security and brand review",
    ],
    snippet: {
      label: "review checklist · illustrative",
      code: `[ ] follows the module standard
[ ] loading · empty · error states
[ ] keyboard + screen-reader pass
[ ] no new layout shift (CLS)
[ ] permissions checked server-side`,
    },
  },
];

export const ai = {
  title: "AI features, engineered like any other product surface",
  intro:
    "At MOSO I built AI property discovery end to end: the streaming chat interface, RAG search that shows its sources, and the LangGraph agent service behind both, with an MCP server that exposes its tools.",
  pillars: [
    {
      id: "chat",
      label: "Streaming property-finder chat",
      body: "Answers stream in as they are generated, with clear in-progress, partial and error states. Users see progress right away instead of watching a spinner.",
    },
    {
      id: "rag",
      label: "Source-backed RAG search",
      body: "Results are grounded in retrieved listings and shown with their sources, so users can check an answer and open the listing directly.",
    },
    {
      id: "agent",
      label: "LangGraph agent + MCP server",
      body: "A LangGraph agent service orchestrates the tools (property search, geo lookup, knowledge). An MCP server exposes those tools to other clients through one standard interface.",
    },
  ],
};

export const experience: Role[] = [
  {
    company: "MOSO",
    title: "Software Engineer (Frontend)",
    period: "Apr 2025 — Present",
    start: "2025",
    theme: "Ownership",
    summary: "Leading frontend delivery of moso.vn, from architecture to AI features in production.",
    highlights: [
      "Architecture standard across 9 production repositories",
      "~40% lower mobile LCP · ~30% organic growth",
      "Streaming AI chat, RAG search, LangGraph + MCP",
    ],
  },
  {
    company: "Ahasoft",
    title: "Frontend Developer",
    period: "Mar 2024 — Mar 2025",
    start: "2024",
    theme: "Complexity",
    summary: "Multi-tenant B2B CRM used by staff across 10,000+ salons in Korea.",
    highlights: ["RBAC with per-tenant isolation", "Multi-theme component library, ~20% fewer UI defects"],
  },
  {
    company: "OKXE",
    title: "Frontend Developer",
    period: "Apr 2022 — Mar 2024",
    start: "2022",
    theme: "Scale",
    summary: "Marketplace with 1.5M+ users and 2M+ listings.",
    highlights: ["~30% faster listing page loads", "~30% shorter release cycles"],
  },
  {
    company: "Sutrix Solutions",
    title: "Frontend Developer",
    period: "Nov 2020 — Mar 2022",
    start: "2020",
    theme: "Craft",
    summary: "Agency work for enterprise clients, including Nissan and Philippine Airlines.",
    highlights: [
      "Responsive, WCAG-compliant React interfaces",
      "Fixed deadlines under strict QA, security and brand review",
    ],
  },
];

export const toolkit: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React", "Next.js 15", "React Server Components", "TypeScript", "JavaScript (ES6+)", "Vue.js 3", "Nuxt.js", "HTML5", "CSS3"] },
  { group: "UI & styling", items: ["Tailwind CSS", "Mantine", "SCSS", "Storybook", "Design systems", "Figma"] },
  { group: "State & data", items: ["Zustand", "Redux Toolkit", "Pinia", "REST API"] },
  { group: "Performance & SEO", items: ["Core Web Vitals", "Lighthouse", "Code splitting", "SSR", "JSON-LD"] },
  { group: "AI", items: ["OpenAI API", "Anthropic API", "MCP", "LangGraph"] },
  { group: "Backend & DevOps", items: ["Node.js", "Fastify", "MongoDB", "Elasticsearch", "Docker", "GitHub Actions"] },
];
