import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { LOCALE_PATH, content, type Locale } from "@/content";
import "./globals.css";

/**
 * Shared by the two root layouts (English at `/`, Vietnamese at `/vi`), so each
 * language gets its own `<html lang>`, fonts and metadata in the static HTML.
 */
export function buildMetadata(locale: Locale): Metadata {
  const { profile, meta } = content[locale];
  return {
    metadataBase: new URL(profile.url),
    title: { default: meta.title, template: `%s · ${profile.name}` },
    description: meta.description,
    applicationName: profile.name,
    authors: [{ name: profile.name, url: profile.url }],
    creator: profile.name,
    keywords: ["Frontend Developer", "React", "Next.js", "TypeScript", "Web Performance", "Core Web Vitals", "Technical SEO", "AI Integration", "Ho Chi Minh City", "Vietnam"],
    alternates: {
      canonical: LOCALE_PATH[locale],
      languages: { en: LOCALE_PATH.en, vi: LOCALE_PATH.vi, "x-default": LOCALE_PATH.en },
    },
    openGraph: {
      type: "profile",
      url: LOCALE_PATH[locale],
      siteName: profile.name,
      title: meta.title,
      description: meta.description,
      locale: meta.ogLocale,
      alternateLocale: locale === "en" ? "vi_VN" : "en_US",
      firstName: "Tai",
      lastName: "Nguyen Song",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: meta.title }],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: ["/og.png"] },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a1128",
  colorScheme: "dark",
};

export function RootShell({ locale, fontClass, children }: { locale: Locale; fontClass: string; children: ReactNode }) {
  const { profile, ui } = content[locale];
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: `${profile.url}${LOCALE_PATH[locale]}`,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsAbout: ["React", "Next.js", "TypeScript", "Web performance", "Technical SEO", "AI integration"],
  };
  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning className={fontClass}>
      <head>
        {/* Apply the saved theme before first paint so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.dataset.theme="light"}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        {/* Without JavaScript, show scroll-revealed content immediately. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only z-[100] rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {ui.skip}
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
