import type { CSSProperties } from "react";
import { signature as s } from "./signature-data";

/**
 * Server-rendered signature artwork. Each glyph carries pathLength=1 so CSS can
 * draw it with stroke-dashoffset; the flourish is revealed through a mask that
 * follows its centre line. Animation lives in globals.css (.sig).
 */
export function SignatureArt() {
  return (
    <svg viewBox={s.viewBox} aria-hidden focusable="false" className="block h-auto w-[clamp(17rem,40vw,29rem)] overflow-visible">
      <defs>
        <mask id="sig-swash-mask" maskUnits="userSpaceOnUse" x="-50" y="-50" width="820" height="280">
          <path
            className="sig-swash-mask"
            d={s.swashCentre}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={14}
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <g transform={`rotate(-4 ${s.pivot[0]} ${s.pivot[1]})`} fill="currentColor">
        {s.glyphs.map((d, i) => (
          <path key={i} className="sig-glyph" d={d} pathLength={1} style={{ "--i": i } as CSSProperties} />
        ))}
        <path d={s.swash} mask="url(#sig-swash-mask)" />
        <circle className="sig-dot" cx={s.dot.cx} cy={s.dot.cy} r={s.dot.r} fill="var(--color-accent)" />
      </g>
    </svg>
  );
}
