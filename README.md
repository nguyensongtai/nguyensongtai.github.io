# nguyensongtai.github.io

Personal portfolio of Nguyen Song Tai, Senior Frontend Engineer.
Next.js (App Router, static export) · React · TypeScript · Tailwind CSS · Motion.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
npm run lint
```

Pushing to `master` runs `.github/workflows/static.yml`, which lints, builds and deploys `./out` to GitHub Pages.
Pull requests run the same install, lint and build without deploying.

When dependencies change, update the lockfile with the npm version CI uses (Node 24, npm 11.19):
`npx npm@11.19.0 install --package-lock-only`. Older npm 11 releases drop optional `@emnapi/*`
entries, and `npm ci` then fails on CI.

## Languages

The site is static in two languages: English at `/` (`src/content/portfolio.ts`) and Vietnamese at
`/vi` (`src/content/vi.ts`). The Vietnamese file reuses the English figures, stacks and code
snippets and only replaces the text, so update both together. Each language has its own root
layout (`src/app/(en)`, `src/app/(vi)`) for a correct `<html lang>`, metadata and hreflang links.
Instrument Serif has no Vietnamese glyphs, so `/vi` uses Newsreader italic for the accent face.

## Updating content

All copy, metrics, case studies, principles and the timeline live in
[`src/content/portfolio.ts`](src/content/portfolio.ts). Every figure there comes from the CV in
`public/NguyenSongTai-CV.pdf`, so update both together.

- **Metrics** carry an `attribution`: `personal` (my work), `outcome` (result of my work), or `team`
  (product / company scale). Keep that distinction honest.
- **Screenshots**: case-study previews are interactive recreations with sample data. To show an
  approved product screenshot instead, put it in `public/images/` and set `image` on the case study.
- **CV**: replace `public/NguyenSongTai-CV.pdf`. A copy also lives at `public/images/NguyenSongTai.pdf`
  so the old site's CV link keeps working.

## Performance notes

- Hero copy reveals with CSS keyframes, so the first paint never waits on JavaScript.
- Motion is loaded via `LazyMotion` + `domAnimation`; all motion respects `prefers-reduced-motion`.
- Only Geist is preloaded. The serif accent is italic-only and not preloaded, and labels use the
  system monospace stack. Removing Geist Mono took median mobile LCP from ~2.7s to ~2.4s
  (Lighthouse, simulated slow 4G, gzip).
- `experimental.inlineCss` was tested and made LCP worse on this page, so CSS stays external.
- Geist uses `display: "optional"`: on a slow first visit the fallback face stays rather than
  swapping late, which keeps LCP stable.

## 3D journey

The page is a road: the hero at the start, five career stops, then contact at the summit.
`src/components/journey/` holds the scene (vanilla three.js, no models or texture files):

- `path.ts`: the road as a function of depth, the stop positions, terrain height.
- `landscape.ts`: terrain, road, street lamps, milestone lights, clouds, the city on the horizon.
- `stages.ts` + `character.ts`: one diorama per stop, with the same figure in a more grown-up
  outfit at each one. `textures.ts` draws every screen and window on a canvas at runtime.
- `sky.ts`: time of day carries the story, from night in the first room to sunrise at the summit.
- `world.ts`: camera shots per section, render-on-demand loop, adaptive resolution.
- `JourneyCanvas.tsx`: loads three.js when the page is idle and maps scroll to the camera; an
  inline SVG illustration stands in before it loads and when WebGL is unavailable.

Stop content lives in `journey` in `src/content/portfolio.ts`; every fact comes from the CV.

Performance notes for the scene:

- three.js is imported only after the page is idle, and the world is built in small slices that
  yield to the main thread, with shaders compiled through `compileAsync`. Mobile Lighthouse:
  TBT ~65ms, CLS 0.
- Frames are drawn only while the camera or pointer moves (plus light ambient animation on
  desktop). Phones render at most 1.25× pixel ratio with lighter terrain and no ambient frames.
  Reduced motion snaps the camera and draws nothing while idle.
- Long copy sits in `.glass` panels, so readability never depends on the scene behind it.
- Dark is the default theme; the toggle stores the choice in `localStorage` and the scene
  re-lights live (light mode shifts the story toward morning).
- The footer signature is SVG outlines generated from Great Vibes (SIL OFL 1.1), stored in
  `src/components/layout/signature-data.ts`. CSS draws it stroke by stroke, so no signature
  font is downloaded. It stays fully visible without JavaScript or with reduced motion.
- The Open Graph image is generated at build time as `/og.png`; it needs a real `.png` extension,
  because GitHub Pages serves extensionless files as `application/octet-stream`.
