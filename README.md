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

## 3D scene

- `src/components/scene/` holds a three.js backdrop: one particle system that morphs into a
  formation per section (`formations.ts`), a nebula, a starfield that streaks during the warp
  between sections, and procedurally shaded planets (`planets.ts`, no textures).
- three.js is imported only after the page is idle, so it never delays the first paint. Particle
  count adapts to the device and frame rate; reduced motion renders one still frame.
- Dark is the default theme; the toggle stores the choice in `localStorage` and the scene
  re-colours live. Copy over the scene carries a soft halo in the surface colour (`--halo`)
  for legibility.
- The footer signature is SVG outlines generated from Great Vibes (SIL OFL 1.1), stored in
  `src/components/layout/signature-data.ts`. CSS draws it stroke by stroke, so no signature
  font is downloaded. It stays fully visible without JavaScript or with reduced motion.
- The Open Graph image is generated at build time as `/og.png`; it needs a real `.png` extension,
  because GitHub Pages serves extensionless files as `application/octet-stream`.
