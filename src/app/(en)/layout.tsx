import { Geist, Instrument_Serif } from "next/font/google";
import { RootShell, buildMetadata } from "../shell";

// "optional": fast connections still get Geist (it arrives within the block period);
// slow ones keep the metric-matched fallback instead of swapping late, which
// otherwise shifts the oversized headline and re-registers it as the LCP.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "optional" });
// Every serif use is italic, so only that file is shipped. Not preloaded: it is
// an accent face, and Geist (the LCP text) should get the bandwidth first.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  preload: false,
});

export const metadata = buildMetadata("en");
export { viewport } from "../shell";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell locale="en" fontClass={`${geistSans.variable} ${instrumentSerif.variable}`}>
      {children}
    </RootShell>
  );
}
