# Porting a screen to React: the recipe

The owner's four designs are the product. A port changes **who builds the DOM**, never the DOM: the same elements, classes, ids,
attributes, text and order, the same CSS files, the same fonts, the same words in uz/ru/en. The gate is the pixel test
(`tests/fidelity-react.ts`, the method of `tests/smoke/fidelity.ts`): **0.000 %** against today's page, or the port is not done.

Proved on `mig-frontend-poc` (21 Oct 2026): `/signin` fully in React, the student's phone app (`/app`) as React components with
its first pieces ported (study clock, photo and score arc, tab bar), and the laptop app on the generated shell + bridge. Every case
at 0.000 % in uz and ru, at 390x844 and 1440x900 (the results: the end of this file).

## The pieces (what every lane copies)

| Piece | File | What it does |
|---|---|---|
| App | `frontend/` (Next 15 App Router, React 19, TS) | Its own `package.json`. Port 3235 in dev/test. |
| Strangler | `next.config.ts` rewrites (fallback) + `middleware.ts` | Everything this app does not have yet (every `/api/*`, `/welcome`, `/parent`, `/staff`, …) goes to the current app unchanged. One route at a time moves here. `middleware.ts` picks the phone or laptop app for `/app` as pickView does (`x-jg-app`). |
| Design files | `public/d`, `public/runtime`, `web/` (committed) + `scripts/sync-design.mjs` | The legacy repo's `public/d`, `public/runtime` and `web/`, the same bytes, committed in this repo (taken at ddbf9d81). Until cutover the designs are still edited in the legacy repo: `JG_LEGACY_DIR=… node scripts/sync-design.mjs` brings a change over (byte compare; `--prune` deletes what it no longer has). `/media/*` is not copied: the backend serves it. |
| Boot | `GET /api/v1/boot?app=…` (current app: `src/app/api/v1/boot/route.ts`), `lib/boot.ts` | What GET /app drew from, as JSON: `boot` (window.JG_BOOT), `start` (the `{{…}}` start values), `uiLang`, `htmlLang`, and — **transitional** — `head`: the runtime tags renderPage injects, as data. FastAPI must serve the same shape. |
| Sign-in data | `GET /api/v1/boot/signin?next=` | What GET /signin filled in: signedIn, next, google, telegramUrl. |
| Generator | `scripts/html2jsx.mjs <app>` | `frontend/web/<app>/shell.html` → one component per top-level region in `components/<app>/gen/`, parsed by the browser itself (DOMParser in chrome-headless-shell, so the tree is the browser's), every text node byte for byte, `{{PLACEHOLDERS}}` as props, `{{P_X_ATTR}}` as `hidden={…}`, `{{X_HTML}}` as `dangerouslySetInnerHTML`. Works on all four shells (56 / 43 / 15 / 9 regions). |
| Bridge | `lib/legacy.tsx` | Runs every design script and runtime patch **not ported yet**, once, after hydration, in the old page's order (head scripts, body scripts, deferred head scripts), with `document.readyState` reading `"loading"` meanwhile, then `DOMContentLoaded` and `load`. Sets `html[data-jg-legacy=ready]` when done. |
| Gate | `tests/fidelity-react.ts`, `scripts/rebuild-and-gate.sh` | Old page twice (noise), React page once, settled the same way, pixel diff > 24 per channel; then the same three again after a re-raster of each page from nothing (the second number: see "Paint history" below); plus the DOM (every element as tag#id.class, in order), the page text, `<html lang>` and the title. Cases take an `act` (a tap, a typed value) for a screen's states. |
| Parse-time scripts | `ported/arc-place.tsx` | What the old page placed while it was parsed and that moves a composited layer, placed while the React page is parsed (see Traps). |

## The recipe, screen by screen

0. **Before**: the region's generated file exists (`gen/RNNName.tsx`), the page is at 0.000 % with that region generated (it is today:
   the generated shell + bridge is a 0.000 % baseline for every screen, so every step below starts green).
1. **Find the builder.** Which design script fills the region (`public/d/<app>/js/NNN.js`), and which runtime patches touch it
   (`grep -n '<id>\|<class>' public/runtime/*.js public/d/<app>/js/023.js`). Read its `JG-PROD` comments: each one is a ruling.
2. **Copy the region** to `components/<app>/ported/RNNName.tsx` (the generator then imports it instead and leaves it alone).
3. **Render what the builder built after load.** The `innerHTML` / `createElement` templates become JSX in the same place, with the
   same whitespace text nodes where the template had them (`{'\n      '}`; inside flex and grid containers they draw nothing and may
   go). Static design SVG strings may stay strings (`dangerouslySetInnerHTML` on the `<svg>`): the design's own markup, not data.
4. **Values that were computed after load are computed in render**: 001.js wrote `[data-clock]` texts → `studyClock()` in props.
5. **Runtime patches become props.** A patch that overwrote the builder's output for some accounts (jg-runtime.js §9: a live
   student's score bubbles start as "—", never the demo numbers) is the component's start value for those accounts
   (`live ? '—' : m.value`). Patches gated on `boot.engine`, `boot.demo`, a switch: the same gate, as a prop.
6. **Behaviour stays the design's code, in one `useEffect`, on refs.** Animation loops, drag with inertia, springs: copy the
   function bodies, swap `getElementById` for refs, `return` a cleanup. A frame loop writes `style` directly and never sets
   state (60 setStates a second would re-render, and the bridge's scripts may be writing the same nodes).
7. **Do not re-render what old scripts still write.** Until every script that touches a node is ported, React renders it once.
   No state above it that changes. (Later, when a region and everything that writes it are ported, move to real state: e.g.
   the active tab as a context the views read.)
8. **Drop the script** from the bridge: add it to `PORTED` in `app/(student)/app/page.tsx` (a runtime patch: filter it out of
   `head` there).
9. **Gate**: `npm run build && npm start`, the legacy app's dev server (`JG_LEGACY_DIR`) with `ENGINE_LIVE=1`, `npx tsx tests/fidelity-react.ts`
   → 0.000 % for every case, DOM equal, text equal. Add a case with an `act` for each state the screen has (a tab opened, a
   sheet, an error), as the sign-in cases do.
10. Commit the ported file + the `PORTED` line together.

### Where state lives
- **Server data** (who, what to show): `GET /api/v1/boot` once per page (React `cache()` shares it between layout and page).
  Server components render from it. Never a second source: what the old page read from `JG_BOOT`, the component reads from `boot`.
- **Page state** (tab, open sheet, busy, language picked): client components' `useState`, as the sign-in page does; shared
  between regions through a context once both regions are ported.
- **Browser state** the old scripts read at parse time (localStorage: `jg.auth.lang`, design keys): read in an effect on
  mount; when it changes the first paint, mirror it in a cookie the server can read (the sign-in page's language already is:
  `jg_lang`), so the first paint is right.
- **The runtime's services** (`JG_ENGINE`, `JG_API`, `JG_CHECKS`, sync of design state to `/api/v1/state`): not visual. Until
  their consumers are ported they keep running in the bridge; then they become ES modules (`lib/engine.ts`, …) imported by the
  components, the same functions.

### Traps found here
- **Next's dev badge** sits in screenshots: `devIndicators: false`. Strict mode would run the bridge twice in dev: off (and the
  bridge also guards with `window.__jgLegacy`).
- **Next adds `<div hidden>`** at the top of `<body>` (streamed metadata). Invisible; the DOM check skips it.
- **CSS**: link the design's stylesheet by URL (`/d/<app>/css/00.css`), not through the bundler (no rewriting, same order). The
  auth pages' shared `<style>` is imported as a global CSS file (`app/(auth)/auth.css`) and passed at 0.000 %.
- **Fonts**: the same Google Fonts `<link>`, not `next/font` (it renames the families).
- **Head order matters**: the runtime's `<style>` tags stand before the font link and `00.css`, as in renderPage; the layout
  renders them in that place.
- **Ids in SVG** (`<linearGradient id="g">`) are page-global, as before: two regions with the same id behave as they did.
- **`muted` on `<video>`** is not rendered by React's server renderer (React sets the property on the client). No pixel effect.
- **This worktree's node_modules** was stale (no `ts-fsrs`): the root app needs a complete one (here a junction to another
  worktree's), and its dev DB needed `node scripts/migrate.mjs`.
- **Paint history is visible at the sub-pixel.** A layer with `will-change: transform` (the score bubbles, the roadmap's eye) keeps
  the sub-pixel phase of its first raster. Server-rendered bubbles first painted at the arc's corner and then moved came out a hair
  apart at 1440 px (x = 177.5): 0.010 %. Fix (ported/arc-place.tsx): what the old script placed before the first paint is placed
  before the first paint again — a parse-time `<script>` after the shell (where the old script ran) running the same `placeArc()`
  the effect uses, on the server-rendered nodes (`suppressHydrationWarning` on them). Rule: if the old page did it during parsing and
  it moves a composited layer, do it during parsing. With the bridge still building other parts after the first paint, one case at
  1440 can still differ by ~0.01 % run to run on those layers; the gate's second number (both pages re-rastered from nothing) then
  reads 0.000 % — a difference of paint history, not of the page. It goes as those builders are ported.
- **A shell without a `.device` wrapper** (the laptop's) must not get one: the generator emitted an empty `<div>` there once (fixed;
  the DOM check caught it, the pixels could not).
- **RSC payload**: a server-rendered region is sent twice (HTML + the flight data): the student page's HTML grows. Measure on a
  weak phone before cutover; the regions that are pure markup can later become one static HTML chunk.

## Two stages, and what each app costs

**Stage A — every app on React, nothing ported yet** (the generated shell + the bridge). The page is React from the first byte
(Next.js, server-rendered, the same /api/v1), and it is the old page to the pixel, because the old scripts still draw it. This is
the cutover-ready state: the FastAPI switch does not wait for Stage B.

**Stage B — the builders ported one by one** until `PORTED` holds every script and the bridge is gone. Each step is gated at 0.000 %.

Measured on this lane (one agent, wall clock, including its gate runs):

| Step | Size | Time |
|---|---|---|
| Foundation: frontend app, rewrites, sync, two boot routes, generator, bridge, gate | – | ~25 min |
| `/signin` + `auth.js`, all states (tabs, error, eye), uz/ru, 390/1440 | 30 KB html + 12 KB js | ~10 min |
| 001.js (study clock) + 002.js (photo, score arc, the §9 patch), incl. one raster fix | 8 KB | ~15 min |
| 005.js (tab bar: lens, drag, views) | 8 KB | ~5 min |
| student-desktop Stage A (generator run, view routing) | 87 KB shell, 43 regions | ~10 min |

Rates: a builder that only draws (template → JSX, behaviour copied into an effect) goes at ~1 KB of design JS a minute; a script
dense with `JG-PROD` rulings and engine calls (023.js: 285 rulings in 625 KB) far slower — assumed 0.3 KB/min below. A script
that is a world of its own (016.js: the gift film in an iframe; the AR camera 022.js / desktop 021.js) is wrapped, not rewritten.

| App | Stage A | Stage B: design scripts | Stage B: runtime patches | Stage B total (agent-hours) |
|---|---|---|---|---|
| student-mobile | done (this lane) | 395 KB small/medium (~9 h), 010.js 149 KB (~5 h), 023.js 625 KB (~35 h), 016/022 wrapped (~2 h) | shared with desktop: ~0.7 MB of the 1.4 MB draws UI (~23 h, once for both) | **~50 h + share of 23 h** |
| student-desktop | done (gate below) | the same shape: 022.js 610 KB (~34 h), 014.js 137 KB (~5 h), the rest ~380 KB (~9 h), 016/021 wrapped (~2 h) | (the shared 23 h) | **~50 h** |
| parent-mobile | ~1–2 h: boot route for parents (the `fill` of src/server/parent/view.ts, renderPage's hello / road-title / Oʻzbekcha replacements as props); the generator already turns `{{P_X_ATTR}}` into `hidden` and `{{X_HTML}}` into markup | 000.js 175 KB (~4 h) | jg-parent-m1, jg-parent-tasks, jg-pay-parent, jg-proud, jg-core-parent, jg-family: 82 KB (~3 h) | **~7 h** |
| parent-desktop | ~1–2 h, as above | 000.js 182 KB (~4 h) | (the same files) | **~5 h** |

**The order matters: the engine service first.** Count of runtime-global uses (`JG_ENGINE`, `JG_API`, `JG_BOOT`, `JG_RUNTIME`,
`JG_CHECKS`) per phone design script: 000–002: 0, **003 (roadmap): 60**, 004 (dome): 6, 005: 0, **006 (Today): 31**, 007/008: 0,
009: 16, 010: 57, 011: 8, 012: 23, 013–016: 0, 017: 9, 018–020: 0, 021: 14, 022: 0, **023: 627**. `JG_ENGINE` is built at runtime by
public/runtime/jg-runtime.js (`window.JG_ENGINE = E`) from `boot.engine`. The scripts with 0 port now at the measured rate (002,
005 here). Home's roadmap card and Today (003, 004, 006) render from `JG_ENGINE.cache`, so the first Stage B lane turns E into
`lib/engine.ts` (the same functions, imported; the bridge keeps assigning `window.JG_ENGINE` from it for the scripts not ported),
and only then do 003/004/006/023 port as functions of it. Until then they stay in the bridge, at 0.000 %.

About **160–180 agent-hours** for the whole front end, most of it in the two engine scripts (023 / 022). Regions are independent
enough to run 8–10 lanes in parallel (a lane = a region + its script + its runtime patches + its gate cases): **2–3 days** wall
clock, with Stage A for all four apps first (half a day). The estimate is extrapolated from three small/medium scripts; the first
lane on 023.js should measure its real rate in its first two hours and correct this table.

## Results on this branch (21 Oct 2026, the last gate run, `scripts/rebuild-and-gate.sh`)

Current app: `ENGINE_LIVE=1 next dev -p 3234` on the worktree's dev DB; React app: `next build` + `next start -p 3235`; headless
chrome-headless-shell 154, reduced motion. Live students `mig-fe-{uz,ru}-*@example.test` (registered in uz / ru, diagnostic done and
unlocked as tests/smoke/fidelity.ts does). Every case: pixels by the method, pixels after a re-raster of both pages, noise between
two loads of today's page, the DOM (elements as tag#id.class, in order), the text, `<html lang>`, the title.

| Cases | Pixels (method) | Pixels (re-rastered) | Noise | DOM | Text / lang / title |
|---|---|---|---|---|---|
| /signin: plain, Create account, error, eye × uz, ru × 390x844, 1440x900 (16) | 0.000 % | 0.000 % | 0.000 % | 87 = 87 | equal |
| /app phone: Home, Today tab, Explore tab × uz, ru × 390x844, 1440x900 (12) | 0.000 % | 0.000 % | 0.000 % | 3469 = 3469 | equal |
| /app laptop (generated shell + bridge only): Home × uz, ru × 1440x900 (2) | 0.000 % | 0.000 % | 0.000 % | 3399 = 3399 | equal |

30 of 30 at 0.000 %. Earlier runs of the same build line, for the record: the phone Home at 1440x900 read 0.010 % / 0.001 % (uz / ru)
with server-rendered bubbles, then 0.000 % / 0.014 % after the parse-time placement, then 0.000 % / 0.000 %: the paint-history effect
described in Traps, on the score bubbles and the roadmap's eye only; the re-raster number is the stable one.

Page weight (one live student, phone /app): today 112 KB HTML (27 KB gzip); React 288 KB (56 KB gzip) + ~105 KB first-load JS.
