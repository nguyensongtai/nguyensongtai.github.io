import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRight } from "@/components/ui/icons";
import "./globals.css";

// The site has a root layout per language, so the 404 page brings its own document.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  preload: false,
});

export const metadata: Metadata = {
  title: "404 · Nguyen Song Tai",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">
        <main
          id="main"
          className="shell flex min-h-dvh flex-col justify-center py-24"
        >
          <p className="eyebrow text-muted">404 · page not found</p>
          <h1 className="mt-6 max-w-[16ch] text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
            This route didn&apos;t{" "}
            <span className="font-serif font-normal text-accent italic">
              render.
            </span>
          </h1>
          <div className="mt-10">
            <ButtonLink href="/" icon={<ArrowRight />}>
              Back to the portfolio
            </ButtonLink>
          </div>
        </main>
      </body>
    </html>
  );
}
