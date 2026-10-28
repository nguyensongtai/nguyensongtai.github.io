import * as en from "./portfolio";
import * as vi from "./vi";

/** Two static versions of the site: English at `/`, Vietnamese at `/vi`. */
export type Locale = "en" | "vi";
export type Content = typeof en;

export const content: Record<Locale, Content> = { en, vi };
// no trailing slash: the static export writes vi.html, which GitHub Pages serves at /vi
export const LOCALE_PATH: Record<Locale, string> = { en: "/", vi: "/vi" };
