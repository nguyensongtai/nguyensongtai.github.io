import type { MetadataRoute } from "next";
import { profile } from "@/content/portfolio";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${profile.url}/`, changeFrequency: "monthly", priority: 1 }];
}
