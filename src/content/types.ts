/** Who a number belongs to — lets case studies separate personal work from team outcomes. */
export type Attribution = "personal" | "outcome" | "team";

export interface Metric {
  value: string;
  label: string;
  context: string;
  attribution: Attribution;
}

export interface Decision {
  title: string;
  body: string;
}

export interface DetailGroup {
  title: string;
  items: string[];
}

export type PreviewKind = "moso" | "salon" | "okxe";

export interface CaseStudy {
  id: string;
  index: string;
  title: string;
  kicker: string;
  company: string;
  role: string;
  period: string;
  url?: string;
  stack: string[];
  summary: string;
  challenge: string;
  decisions: Decision[];
  owned: string[];
  teamContext: string[];
  metrics: Metric[];
  details: DetailGroup[];
  preview: PreviewKind;
  /** Drop an approved product screenshot here to show it instead of the interactive recreation. */
  image?: { src: string; alt: string; width: number; height: number };
}

export interface Principle {
  id: string;
  title: string;
  statement: string;
  practice: string[];
  snippet: { label: string; code: string };
}

export interface JourneyStage {
  id: string;
  index: string;
  era: string;
  title: string;
  place: string;
  lead: string;
  points: string[];
  tags: string[];
}
