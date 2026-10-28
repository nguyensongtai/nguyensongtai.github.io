import type { MetadataRoute } from "next";
import { profile } from "@/content/portfolio";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${profile.url}/`, vi: `${profile.url}/vi` };
  return [
    { url: languages.en, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: languages.vi, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
