import { Geist, Newsreader } from "next/font/google";
import { RootShell, buildMetadata } from "../shell";

// Same faces as the English site, with the Vietnamese subset.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "vietnamese"], display: "optional", preload: false });
// Instrument Serif has no Vietnamese glyphs, so the italic accent uses Newsreader here.
const accentSerif = Newsreader({
  variable: "--font-instrument-serif",
  subsets: ["latin", "vietnamese"],
  weight: "400",
  style: "italic",
  preload: false,
});

export const metadata = buildMetadata("vi");
export { viewport } from "../shell";

export default function VietnameseLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell locale="vi" fontClass={`${geistSans.variable} ${accentSerif.variable}`}>
      {children}
    </RootShell>
  );
}
