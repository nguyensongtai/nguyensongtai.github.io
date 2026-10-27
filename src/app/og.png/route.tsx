import { ImageResponse } from "next/og";
import { profile } from "@/content/portfolio";

export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

/** Exported as /og.png so GitHub Pages serves it with an image content type. */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07080c",
          color: "#eef1f7",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: "#878ea1" }}>
          <span>NGUYEN SONG TAI</span>
          <span>HO CHI MINH CITY · UTC+7</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>I build performant</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05 }}>
            web products that&nbsp;<span style={{ color: "#7b93ff" }}>scale.</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26 }}>
          <span>{profile.role} · 5+ years</span>
          <span style={{ color: "#878ea1" }}>React · Next.js · TypeScript · Performance · AI</span>
        </div>
      </div>
    ),
    size,
  );
}
