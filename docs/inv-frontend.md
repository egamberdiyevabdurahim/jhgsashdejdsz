# inv-frontend — the frontend as it is, and the React port plan

Area: frontend (page assembly, shells, the four design artifacts, the runtime layer, i18n, the fidelity gate, the smoke walks).
Source read: `C:/Users/PC/jg-plan` (read-only, detached at m1-main `ddbf9d81`). Citations are `path:line` inside that tree.
Written 21 Oct 2026 by the frontend inventory lane. Nothing in the repo was changed.

---

## 0. Summary for the controller

- **What the frontend is.** Next.js serves no React at all today (D7, `docs/ai/DECISIONS.md:55`: "route handlers only; no React
  pages needed"). Each of the four apps is one HTML document assembled as a string by `src/server/pages.ts` (380 lines). The
  design's static shell markup is filled with `{{...}}` placeholders and then runs its own imperative classic scripts in order.
  Those scripts are the owner's artifacts, split mechanically by `tools/split-design.mjs`. Around ~25 conditional runtime
  scripts and 6 inline style blocks patch the design for live students. They patch through the DOM, MutationObservers,
  `Storage.prototype` and `window.*` seams.
- **Size (measured).** Design JS 22,956 lines in 51 files, 11.5 MB on disk (5.57 MB per student app; most of the bytes are
  embedded data). Design CSS 9,937 lines (1.03 MB). Shells 2,736 lines across 4 files, and auth pages 2,247 lines across 8
  files. Runtime JS is 15,440 lines in 46 files, plus 70 lines of CSS and 10,064 lines of i18n JSON. About 1,750 `JG-PROD`
  production-edit markers carry the owner's rulings into the design code. 152 unit-test files read or drive frontend files:
  76 drive headless Chrome and 65 run runtime/design JS in `node:vm`. There are also 48 smoke files (9,743 lines).
- **Sharing.** Student phone and laptop share about 90 % of their distinct JS lines: 7,797 common, 902 phone-only and 943
  laptop-only. They share about 75 % of shell markup and about 60 % of CSS. The two parent apps' JS differs by 11 hunks, and the
  parent phone CSS is a subset of the laptop's. **One React component set per family (student, parent) with a
  `variant: 'mobile'|'desktop'` prop is the right shape. Keep the CSS files as they are, two per family.**
- **What the gate really checks.** `tests/smoke/fidelity.ts` compares only the **first viewport** of the four landing pages:
  390x844 and 1440x900, demo account against the artifact, threshold 0.05 %, results 0.000 %. It also checks the layout
  boxes of a real account against the demo. Every other screen (about 75 student surfaces per app, about 25 parent ones) has
  no pixel gate today. **The port needs a new per-screen golden corpus before the first component is written (§6).**
- **The plan.**
  - F0: parity harness.
  - F1: a Next.js page server consuming a FastAPI "page plan". The legacy documents stay byte-identical. The backend move
    needs this step anyway.
  - F2: full React for the parent, auth and staff pages, which are small.
  - F2: the student apps by strangler. The legacy body is hosted in an App Router document, and React islands (portals into
    the legacy containers) take over screen by screen behind per-island switches.
  - F3: once nothing legacy remains, a full SSR React document.
  - Record/replay of `/api/v1` keeps frontend parity independent of the backend rewrite.
- **Honest estimate: ~95 agent-days for the full conversion** (range 75–120), with about 55 of them in the student
  surfaces.
  - Deferring the 16 always-cut features (§2.4.6) brings it to about 90.
  - A "fast path" of about 24 agent-days gets Next.js as the page server, full React for parent, auth and staff, React for
    every new or changed student screen, and the cheap load-time wins (§10). The student design stays hosted as it is.
- **My disagreement, for the owner's decision.** `DECISIONS.md:34-43` (D6) rejected exactly this port because of drift risk.
  The conversion re-implements about 25k lines of working, owner-ruled UI and gives users no visible gain. The real user
  gain is load time: 3.63 MB of gzipped JS per student page, 3.06 MB of it one rarely opened gift film (§2.9). A lazy load
  gets that in about 1 day without React. I recommend the fast path now and the full student conversion only if the owner
  wants it after seeing that cost. On the backend choice, I do not disagree with FastAPI. From the frontend's side it must
  keep the requirements in §4.1 (Auth.js-compatible `/api/auth/*`, the raw text stream of `/api/v1/ai/sample`,
  EventSource chat, a page-plan endpoint).

---

## 1. Page routes (24 non-API route handlers)

`src/app/**/route.ts` outside `api/` (132 `/api/v1` routes are the backend's):

| Route | Renderer | What it serves |
|---|---|---|
| `/` | `src/app/route.ts:7-9` | redirect to `/signin`, `/welcome`, `/app` or `/parent` |
| `/app` | `src/app/app/route.ts` → `buildBoot` → `renderPage('student-mobile'|'student-desktop')` | student app |
| `/parent` | `src/app/parent/route.ts` → `renderPage('parent-mobile'|'parent-desktop')`; `/link` when no child (`:16`) | parent app |
| `/preview/[app]` | `src/app/preview/[app]/route.ts` (404 in production) | the design's own family, no boot |
| `/signin`, `/signin/telegram` | `renderStatic('signin.html', {NEXT, ROLE, TELEGRAM, GOOGLE, TELEGRAM_URL})` (`src/app/signin/route.ts:16`) | sign-in / sign-up |
| `/signout` | `renderStatic('signout.html')` | sign-out confirm |
| `/welcome` | `renderStatic('welcome.html', {FIRST, LAST, ROLE, NEXT})` | profile creation |
| `/link`, `/join/[code]` | `renderStatic('link.html', {ERROR, CODE, LANG})` | parent ↔ child link |
| `/c/[kind]/[id]` | `renderStatic('share.html', …)` | shared card |
| `/gift/[code]` | (gift claim) | gift |
| `/study/math/[code]` | `renderStatic('study.html', …)` | Bluebook study consent |
| `/privacy`, `/terms` | `renderStatic('legal.html', {DOC})` | legal |
| `/pay/return`, `/pay/sandbox/[number]` | `pay.html` | payment return / sandbox |
| `/staff`, `/staff/{billing,core,moderation,queue,video}` | server-built HTML strings (`src/server/{moderation/console-page,pay/staff-page,core/staff-page,phase-x/staff-page,video/staff-page}.ts`, 1,026 lines) + `public/runtime/jg-staff*.js` (262 lines) | staff console |
| `/favicon.ico` | route | icon |

Static pages: `src/server/static-page.ts` (26 lines) fills 32 distinct `{{X}}` placeholders in `web/auth/*.html` (8 files: legal
123, link 276, pay 354, share 188, signin 408, signout 243, study 390, welcome 265 lines). Their client is `public/runtime/auth.js`
(204 lines). It posts forms to Auth.js: `/api/auth/csrf` (`auth.js:37`), `/api/auth/callback/password` (`:56`),
`/api/auth/signin/google` (`:60`), `/api/auth/callback/telegram` (`:64`) and `/api/auth/signout` (`:72`). The sign-in form's
action is `/api/auth/callback/password` (`web/auth/signin.html:223`).

View choice: `pickView` (`src/server/pages.ts:80-86`) uses `?view=`, then cookie `jg_view`, then the UA regex
`/Mobi|Android|iPhone|iPod/`. `htmlResponse` (`:375-379`) sends `no-store` and sets `jg_view` when `?view=` was given.
Language cookie: `jg_lang` (`:92-95`). Parent child switch: cookie read by `childCookie` (`src/app/parent/route.ts:6,15`).

Next config (`next.config.ts`): `outputFileTracingIncludes` web/** + content (`:6`). Rewrite `/media/listening/:file` →
gated API (`:9-11`). Security headers on every route (`:18-23`). `/d/:app/media/*` immutable (`:25`). `/d/:app/{js,css}/*` and
`/runtime/*` `no-cache` (`:26-27`), so cache busting is by `?v=` keys only. No `output: 'standalone'`: a release build is 944 MB
(`docs/ai/CURRENT_STATE.md:9`) on a box with 5.7 GB free.

---

## 2. How a page is assembled and run today

### 2.1 Template fill (`src/server/pages.ts:176-373`)

1. `shell(app)` reads `web/<app>/shell.html`, cached in production (`:72-78`).
2. `<!--JG_BOOT-->` (in `<head>`, right after the viewport meta, **before** `<title>`, fonts and the design CSS:
   `web/student-mobile/shell.html:5`, `web/parent-mobile/shell.html:5`) first receives `communityScripts` (`:188`). Later
   (`:370`) the marker is replaced by the whole runtime block, so the community script ends up **after** that block.
3. Parent hello and road title rewrites of the shell text (`:196-202`).
4. `{{ME_FULL}}`, `{{ME_FIRST}}` (`:203`). Student: `{{ME_PHOTO}}`, the 13 `startVars` keys (`:129-160`, `DESIGN_START` =
   Odilov Oqil's numbers when there is no engine), and the "College applicant" line rewrite on the phone (`:211`). Parent:
   `fillParent` with 88 (phone) / 98 (laptop) distinct `{{P_*}}` keys from `boot.child.fill` or `designFill(app)`
   (`:111-117`). Keys ending `_HTML` (row lists built from the design's own markup) and `_ATTR` (`''` or `' hidden'`) are
   inserted raw, everything else escaped. Plus the `O‘zbekcha` → `Oʻzbekcha` swap for a real family (`:216`) and
   `{{ME_INITIALS}}`, `{{CHILD_*}}` (`:218-220`).
5. Every replacement is a function (so `$&` stays literal) and runs **before** the boot JSON goes in, so saved state is
   never rewritten (`:189-192`).
6. `safeJson` escapes `<`, U+2028 and U+2029 (`:97-99`).

### 2.2 Exact emitted order (the marker's replacement, `:185` + `:370`)

Order matters: everything below is in `<head>`, **before** the design CSS link, so the design's `00.css` wins any tie. The
injected styles beat it only by `!important` or id specificity. A port must keep this cascade position.

| # | Item | Condition (boot / env) | Sync? |
|---|---|---|---|
| 1 | `<script>window.JG_BOOT=…</script>` | always | inline |
| 2 | `jg-journal.js?v=1` | student | sync |
| 3 | `jg-runtime.js?v=29` | always | sync |
| 4 | `jg-checks.js?v=36` | student | sync |
| 5 | `jg-phased.js?v=12` | student && `boot.phaseD` | sync |
| 6 | `<script>JG_GAMES_CFG=…</script>` + `jg-games.js?v=1` | student, live, non-demo (`src/server/games/page.ts:16-18`) | sync |
| 7 | `jg-league.js?v=1` | student && engine && !demo | sync |
| 8 | `jg-core.js?v=1` | student && `boot.core` && engine && !demo | sync |
| 9 | `<script>JG_PLANS=…;JG_PAY_BOOT=…</script>` + `jg-pay.js` / `jg-pay-parent.js` | `PAYMENTS` && !demo && (engine | child); **reads DB** (entitlement, coupons: `src/server/pay/boot.ts:21-34`) | sync |
| 10 | `<style id="jg-me-photo">` | parent && !demo | — |
| 11 | uz-marks `<link>` + `<style id="jg-uz-marks">` | parent && child && !demo | — |
| 12 | `<style id="jg-no-codes">` | student && engine | — |
| 13 | `<style id="jg-letter">` | student && engine | — |
| 14 | `<style id="jg-sheet-lines">` | student && engine && !demo | — |
| 15 | `<style id="jg-ends">` (+ rest-day rules when today's tasks are all optional) | student && engine && !demo | — |
| 16 | `jg-diag.js?v=17` | student && engine | sync |
| 17 | `jg-i18n.js?v=18` + uz-marks link (uz) + `jg-i18n.css` (uz/ru); `<html lang>` rewritten | student && engine | sync |
| 18 | `jg-family.js?v=2` | `boot.familyJoins.length` | defer |
| 19 | `jg-unis.js?v=4` | student && engine | defer |
| 20 | `jg-jamol.js?v=6` | student && engine | defer |
| 21 | `jg-ai-notice.js?v=4` | student && `boot.aiNotice` | defer |
| 22 | `jg-photo.js?v=3` | (student && engine) or (parent && child && !demo) | defer |
| 23 | `jg-outcomes.js?v=2` | `boot.outcomePrompt` | defer |
| 24 | `jg-parent-tasks.js?v=2` | parent && (child.phaseD or child.study) && !demo | defer |
| 25 | `jg-proud.js?v=1` | parent && child && !demo | defer |
| 26 | `jg-parent-m1.js` / `jg-parents.js` | `boot.m1` by role | defer |
| 27 | `jg-jia-lead.js?v=1` | student, live, `JIA_CARD` | defer |
| 28 | `jg-roadmap-ready.js?v=3` | `boot.roadmapReady` | defer |
| 29 | `jg-links.js?v=3` | student && `boot.phaseX` | defer |
| 30 | `jg-writing.js?v=2` | live student && `WRITING` | defer |
| 31 | `jg-speaking-voice.js?v=2` | live student && `SPEAKING_VOICE` | defer |
| 32 | `jg-speaking.js?v=4` | live student && `SPEAKING` | defer |
| 33 | `jg-listening.js?v=2` | live student && `LISTENING` | defer |
| 34 | `jg-video.js?v=1` | live student && `VIDEO_LESSONS` | defer |
| 35 | `jg-lessons-desktop.js?v=15` | laptop, live, `LESSONS` | defer |
| 36 | `jg-real.js?v=19` | live student, non-demo | defer |
| 37 | `jg-lessons.js?v=16` | phone, live, `LESSONS` | defer |
| 38 | `jg-hw.js?v=5` | live student && `LESSONS` | defer |
| 39 | `jg-sat.js?v=4` + `jg-chat.js?v=2` | `SAT_FULL` / (`MESSENGER` or `COMMUNITY`) | defer |
| 40 | `jg-mock.js?v=6` | live student && `LESSONS` | defer |
| 41 | `jg-stress.js?v=3` | student | defer |
| 42 | `jg-core-parent.js?v=1` | parent && `core.m1` && child && !demo | defer |
| 43 | `jg-moderation.js?v=1` (`data-on`, `data-app`) | live student (`src/server/moderation/page.ts:10-12`) | defer |
| 44 | `jg-community.js?v=1` | live student && `COMMUNITY` (`src/server/community/page.ts:15-18`) | sync |

Then come `<title>`, Google Fonts and `/d/<app>/css/00.css`. At the end of `<body>` the design scripts run in order:
`web/student-mobile/shell.html:1070-1107`, with `chess.js` 0.10.3 from cdnjs between `012` and `013` (`:1090`);
`web/student-desktop/shell.html:1033-1057`, with chess.js first; `web/parent-*/shell.html` one `000.js`. Execution order is
therefore: inline boot → sync runtime in `<head>` → the design's sync scripts at the end of `<body>` → the deferred
runtime, in tag order, after parsing and before `DOMContentLoaded`. Several runtime files depend on that order. `jg-i18n`,
`jg-diag`, `jg-checks` and `jg-phased` must exist before the design renders. `jg-real` and the lessons files patch what the
design has already drawn. `jg-lessons-desktop` must come before `jg-real`, and `jg-lessons` after it (`pages.ts:336-341`).

### 2.3 Cache keys

Manual `?v=` constants (`src/server/pages.ts:22-69`, plus `chat/page.ts:11`, `community/page.ts:13`, `games/page.ts:6`,
`league/page.ts:10`, `moderation/page.ts:9`, `pay/boot.ts:18`, `ai-notice.ts:12`, `uz-marks.ts:8`). Their comment trails are
the change log of owner rulings: `RUNTIME_VERSION` 29 also versions the page↔server contract (x-jg-uid, events).
In React these become content-hashed chunks. Keep one explicit **frontend contract version**, sent as a header with
every API call, so FastAPI can stay N-1 compatible with tabs left open across a deploy.

### 2.4 The four design artifacts (`public/d/<app>/{js,css,media}`)

#### 2.4.1 Files

| App | JS files | JS lines / bytes | CSS lines / bytes | media |
|---|---|---|---|---|
| student-mobile | 24 (`000`–`023`) | 10,573 / 5,568,983 | 4,348 / 441,338 | 237 files, 4.5 MB |
| student-desktop | 24 | 10,635 / 5,587,996 | 4,094 / 448,254 | 249 files, 4.5 MB |
| parent-mobile | 1 (`000.js`) | 849 / 180,051 | 659 / 60,632 | 20 files, 352 KB |
| parent-desktop | 1 | 899 / 186,853 | 836 / 76,293 | 20 files, 352 KB |

The originals are `design/artifacts/*.html` (24.5 MB). `tools/split-design.mjs` (120 lines) extracts `data:` media to
`/d/<app>/media/<sha16>.<ext>` and keeps classic scripts in document order. D8 (`DECISIONS.md:45`) made the split files the
source of truth.

**Student phone file map, with its laptop twin** (twin found by shared distinct lines):

| Phone | Purpose (its header) | Laptop twin |
|---|---|---|
| 000 | mascots Jamol/Jamola (`window.JIA_MASCOT`) | 000 (own mascot kit) |
| 001 | study clock (`.screen[data-program-days][data-day]`) | 001 (shared helpers `window.JIA`) |
| 002 | Home score arc (bubbles, `#arc`, `#sr`) | 001 |
| 003 | roadmap chart, universities along the way | 001 |
| 004 | Today: the chained MIT Dome (fills by tasks) | 002 |
| 005 | tab bar, liquid-glass lens (Today · Explore · Home · Lessons · Community) | — (rail: 014/022 adapters) |
| 006 | Today page: tasks with status, totals | 003 |
| 007 | IQ battle (45 s, 10 puzzles) | (in 002/004) |
| 008 | Explore wallet + ticket | 011 |
| 009 | Lessons rows + player | 013 |
| 010 | Community: spotlight, messages, direct, events (1,736 lines) | 014 |
| 011 | Settings | 015 |
| 012 | Applications tracker, reminders, calendar | 018 (+ 012 reminders) |
| 013 | Mini games: chess, checkers, IQ, team | 005 |
| 014 | Team games (3 v 3, hosts speak; `VO` audio map) | 007 |
| 015 | pull Home down → Settings | — |
| 016 | PRIZE gift film (one 4,073,964-char `TPL` HTML string run in an iframe) | 016 |
| 017 | Pricing carousel | 017 |
| 018 | Coin shop | 019 |
| 019 | Party games (Mafia host) | 008 (+ 009 Mafia) |
| 020 | scrolled fade under the coin chip | — |
| 021 | Medals ceremony + story picture | 020 |
| 022 | AR "wear your medal" (face-api 1.7.15 + three r128 from CDNs, embedded 260,692-char `W8` weights) | 021 |
| 023 | engine front end, 3,319 lines (below) | 022 |
| — | laptop only: 004 games helpers, 006 game room, 009 Mafia, 010 League, 012 reminders, 023 desktop shell (top bar, search, coins, events, notifications, menu, `data-jia`/`data-jgo`) | |

**023.js sections** (phone line numbers; the laptop's `022.js` is the same 2 lines down, locked by
`tests/unit/design-edits.test.ts:23`):
- 1-14: `JG_CUTS`
- 15-151: canonical data. `QB` question bank (line 411, 55 KB) and `SEED` rules (412, 21 KB) are embedded JSON.
- 152-232: `JG_API` mock (`:157`, exposed `:1662`)
- 233-661: diagnostic screens (start, question, inputs, the three checks 498-563, first picture, honest check, wiring,
  Home's roadmap card)
- 662-816: ROADMAP planner + map
- 817-942: TODAY's four tasks
- 943-1121: parent check, re-diagnosis, counselor reviews
- 1122-1320: STUDY ROOM and dream bricks
- 1321-1466: squad / week / season / class
- 1467-1552: scorecard → player card
- 1553: JG Daily; 1621: Ghost mode; 1665: Mock Saturday; 1737: parent pledge; 1761: School Cup
- 1796-2201: chat & community 1-3 (clubs, help desk, study together, @Jamol, English coach, friend streaks, stickers,
  day one, AI pre-check)
- 2202: passport; 2273: letter to future you; 2326: design pass; 2428: comeback plan; 2506: journal → essay seeds
- 2584: creators; 2620: project lab; 2681: rivals; 2712: almost there; 2744: velvet clubs; 2773: style shop;
  2819: double brick hour; 2844: people notifications; 2877: game night
- 2883: Mafia; 3006: CampusGuessr (`CG_MAP` 29 KB SVG path); 3108: JG Live; 3224: movie night
- 3291: cuts; 3310: clubs icon

#### 2.4.2 Structure and patterns

- **Every file is one IIFE** with `"use strict"`. Files talk only through `window`. The phone assigns 73 distinct globals and
  the laptop 75: `JIA_*` (openers such as `JIA_openShop`, `JIA_openSettings`, `JIA_openPricing`, `JIA_openJamol`; services
  `JIA_coins`, `JIA_notify`, `JIA_z`, `JIA_celebrate`, `JIA_medals`, `JIA_league`, `JIA_cm`, `JIA_chat`; data `JIA_DATA`,
  `JIA_PEOPLE`, `JIA_IMG`, `JIA_UNI`, `JIA_SETTINGS`, …) and `JG_*` (`JG_API`, `JG_CUTS`, `JG_openRoadmap`, `JG_readiness`, …).
  Laptop extras: `JIA` (helpers + `go`), `JG_TAB`, `JIA_APPS`, `JIA_appPct`, `JIA_openDetail`, `JIA_paintApps`. Full list in
  Appendix A.
- **Static containers in the shell, painted by `innerHTML`.** Example: the coin shop `018.js`. `paint()` rebuilds `#cs-chips`,
  `#cs-feat` and `#cs-list` with template strings. `openShop()` sets `view.style.zIndex = JIA_z()` and `view.hidden = false`,
  resets scroll and focuses `#cs-back` in a `setTimeout`.
- Phone pattern counts: `innerHTML` 297, `insertAdjacentHTML` 73, `createElement` 64, `addEventListener` 475, `.onX=` 86,
  query calls 388, `setTimeout` 169, `requestAnimationFrame` 46, `classList` 368, `.style.` 218, canvas `getContext` 15,
  WebGL 5, audio 21, `speechSynthesis` 16. The laptop is similar. Parent: `innerHTML` 22-26 and `addEventListener` 38-41.
- **Surfaces.** The student shell holds 5 tab views (`#tv-today`, `#tv-explore`, the Home `.screen`, `#tv-lessons`,
  `#tv-community`) and 37 view/sheet containers. Together with the ids built in JS there are about 76 distinct
  `*-view` / `*-sheet` / `*-layer` ids on the phone (Appendix C). The runtime adds about 10 more (`jgd-view`, `jgm-view`,
  `jgs-view`, `uz-view`, `data-sheet`, …). Parent: 4 panes (`#p-home`, `#p-progress`, `#p-messages`, `#p-account`,
  `web/parent-desktop/shell.html:57,173,200,224`), 9 folders (`data-folder`: achieve, deadlines, done, homework, lessons,
  road, scores, study, today), 6 sheets (`data-sheet`: family, gift, lang, pledge, renew, vip), and `openSheet`,
  `openFolder`, `go` in `000.js`.
- **Shell ids:** student 477 (phone) / 456 (laptop), parent 62 / 71. No inline `on*=` handlers anywhere (grep: 0).
  Elements used: `<canvas>` 16, `<video>` 16, `input[type=file]` 16, `input[type=range]` 6.
- **Global state** lives in (a) IIFE-local `let`s (filters, open item, step), (b) the shared `window.JIA_*` objects and
  (c) localStorage:
  - synced keys `jia.settings`, `jia.medals`, `jia.gift`, `jg.diag.v1`, `jg.study.v1`, `jg.squad.v1`, `jg.seen.v1` (student)
    and `jg.parent.lang` (parent) (`src/server/boot.ts:27-28`)
  - device-only keys: `jg.journal.v1`, `jg.uid`, `jg.dirty`, `jg.outbox`, `jg.reopen`, `jgs.on`, `jg.pay.renew`,
    `jg.auth.lang`
- **Document-level classes the design toggles:**
  - on `<html>`: `.dark` (193 CSS rules on the phone), `.calm`, `.cut-<flag>`, `.gm-open`, `[data-jg-photo]`, `[lang]`,
    `.jg-kb`
  - on `<body>`: `.desk` (41 parent-laptop rules), `.scrolled`, `.pulling`, `.sy-th-*`, `.sy-bb-on`
- **Demo vs live.** The design's call sites read `window.JG_ENGINE` and fall back to the `JG_API` mock when it is absent:
  386 (phone) / 411 (laptop) `JG_ENGINE` references and 404 `JG_API` references. The demo family (`profile.demo`) and
  `/preview` must render the mock path pixel for pixel. That is the fidelity baseline (D13), so **both paths must be
  ported.**

#### 2.4.3 Embedded data (move to static modules, do not hand-port)

`016.js` `TPL` (4.07 MB), `022.js` `W8` (261 KB), `023.js` `QB` (55 KB), `SEED` (21 KB) and `CG_MAP` (29 KB), `014.js` `VO`
(15 KB), parent `000.js` `DICT`/`PATTERNS` (line 32: one 75 KB line). The design's static product data (D2: prices, people,
universities, shop items, the demo student's numbers) lives in `ITEMS`, `OPPS`, `SUBJECTS` and `PEOPLE` arrays in each file.

#### 2.4.4 CSS

| | rules | `@keyframes` | `@container`/cq* | `@media` | custom props |
|---|---|---|---|---|---|
| student-mobile | ~4,557 | 176 | 58 | 46 | 41 |
| student-desktop | ~4,645 | 161 | 56 | 63 | 52 |
| parent-mobile | ~636 | 16 | 0 | 9 | 27 |
| parent-desktop | ~797 | 16 | 0 | 12 | 27 |

`body` is a centered flex column with `gap` (student `00.css:22-32`, parent `00.css:38-40`), so **any extra element-level
child of `<body>` that is in flow moves the layout.** Next's `next-route-announcer` is `position:absolute`
(`node_modules/next/dist/client/components/app-router-announcer.js:22`, Next 15.5.26), so it is safe. A wrapper `<div>` is
not, unless it is `display:contents`. The letter uses `cqw` units (`pages.ts:279`). The CSS stays as the owner drew it:
**serve the four `00.css` files verbatim as static `<link>`s. Do not route them through Next's CSS pipeline**, whose
minifier/PostCSS could reorder, merge or rewrite them.

#### 2.4.5 Production edits

`JG-PROD` markers:
- design JS: phone 637, laptop 651, parent 75 / 90
- CSS: 6 / 8 / 3 / 5
- shells: 14 / 15 / 77 / 92

They carry D11–D40 (48 decisions, `DECISIONS.md` 3,210 lines) into the design, often as "one line for one line" edits whose
line numbers are locked by tests (`tests/unit/design-edits.test.ts:23-36` `LINE_COUNTS`, `twin`). Hundreds of rulings
cite `M:023:860`-style line numbers. A port loses those anchors, so it needs a mapping (§5, rule 18).

#### 2.4.6 Product cuts

`window.JG_CUTS` (`023.js:3`, laptop `022.js:5`) adds `html.cut-<flag>` (`:4`). These 16 flags are cut **for everyone,
the demo included**: todayDaily, todayMock, todaySquad, classOf, schoolCup, jgLive, passport, projectLab, almostThere,
helpDesk, creatorStudio, satSeason, rival, todayRecap, playerCard, englishCoach. These 5 are cut for a live student only:
lessonsMock, cmStories, ghostMode, studyNow, cmPeople. Code that is cut for everyone is invisible in every account. That
makes it a candidate to defer (§10; it needs the controller's ruling because "built exactly as drawn").

### 2.5 The runtime layer (`public/runtime/`, 46 files, 15,440 lines)

**`jg-runtime.js` (1,410 lines)** is the backbone. Sections are listed in its header `:1-19`:
- **1–2: storage hydration and mirroring.** `Storage.prototype.setItem`, `removeItem` and `clear` are patched (`:129-151`).
  Writes go to `PUT|DELETE /api/v1/state/<key>`, debounced 800 ms, one request in flight per key, exponential backoff, with
  `jg.dirty` keyed by uid and dirty-wins-at-load (`:108-128`). Server-owned fields are merged back (`OWNED`, `:92-106`).
  `x-jg-uid` goes on every write (`:54-59`). Responses: 409 → reload (another account); 401 → `/signin?next=`; flush on
  `pagehide`/`visibilitychange` with `keepalive` (`:152-153`).
- **3: `window.claude`.** `use('sample'|'downloads')` (`:262-266`). `sample` posts `/api/v1/ai/sample` and reads a **raw
  chunked text stream** with `getReader()` (`:267-288`). A 428 dispatches `jg:ai-notice`.
- **4: identity and actions.** `JG_ME`, `JG_CHILD` (`:191-192`), the initials SVG (kept in step with
  `src/server/initials.ts`), `JG_RUNTIME { flush, pending, signOut, initialsSvg, uniFind }` (`:246`), and sign-out through
  the Auth.js CSRF form (`:157-181`).
- **6: `window.JG_ENGINE`** (`:290-1169`), with 41 methods: breakSession, canAgain, canAnswer, chance, coinsAdded, commit,
  completeSession, completeTask, dayLine, dayNumbers, done, endLine, endTask, endWords, ending, gentle, leftWords, level,
  listen, mapTop, meBio, meLine, narration, noTasks, pending, prepare, refresh, report, result, roadmap, roleLine, say,
  session, spend, startSession, state, tasks, teacher, unscaled, wonBack, ymd.
  - Awaited commits go to `/api/v1/engine/commit`, everything else to the `jg.outbox`.
  - The wallet settles 4 s after the last movement (D12, `DECISIONS.md:77`).
  - Events: `jg:snapshot` (26 uses), `jg:goal` (16), `jg:photo` (6), `jg:ai-notice` (3).
- **7–10:** family code (`:1172`), motion `JG_MOTION` (`:1222-1293`), score bubbles start as dashes (`:1305`), the
  100 % letter (`:1329`).

**Other files by role** (lines, the file's MutationObservers, query calls). Where they load is in §2.2.

| Group | Files |
|---|---|
| Grading / quizzes | `jg-checks.js` 970 (4 MO, 72 qs: `JG_CHECKS` drives the design's check/quiz screens with server-served items: `/api/v1/checks/*`) · `jg-phased.js` 303 · `jg-hw.js` 193 · `jg-mock.js` 501 · `jg-sat.js` 394 · `jg-listening.js` 175 |
| "What looks real is real" | `jg-real.js` 1,242 (**32 MO**, 59 qs: replaces the design's sample Explore cards and lesson player, week circles, roadmap opening list, Home circles, streak; `JG_REAL`) · `jg-unis.js` 154 · `jg-links.js` 107 · `jg-roadmap-ready.js` 46 · `jg-core.js` 196 |
| Lessons | `jg-lessons.js` 724 (phone) · `jg-lessons-desktop.js` 630 · `jg-writing.js` 188 · `jg-speaking.js` 283 · `jg-speaking-voice.js` 285 (microphone) · `jg-video.js` 167 |
| Words | `jg-i18n.js` 400 + `jg-i18n.css` 57 + `i18n/{uz,ru}.json` · `jg-diag.js` 1,840 (the diagnostic in uz/ru: a word table) · `jg-stress.js` 120 (Russian stress mark on its vowel) · `jg-uz-marks.css` 13 + `fonts/jg-uz-marks.woff2` · `jg-legal-text.js` 178 |
| People / social | `jg-community.js` 481 · `jg-chat.js` 770 (EventSource `/stream?uid=&lastEventId=`, `:475`) · `jg-moderation.js` 58 · `jg-jamol.js` 603 · `jg-ai-notice.js` 284 · `jg-journal.js` 48 · `jg-family.js` 23 · `jg-parents.js` 125 · `jg-outcomes.js` 264 · `jg-photo.js` 374 |
| Games | `jg-games.js` 256 · `jg-league.js` 216 |
| Pay | `jg-pay.js` 117 · `jg-pay-parent.js` 176 · `jg-jia-lead.js` 66 |
| Parent | `jg-parent-tasks.js` 185 · `jg-parent-m1.js` 194 · `jg-proud.js` 88 · `jg-core-parent.js` 70 |
| Staff / auth | `jg-staff.js` 56 · `jg-staff-core.js` 21 · `jg-staff-console.js` 109 · `jg-staff-video.js` 76 · `auth.js` 204 |

Runtime globals: `JG_AI_NOTICE JG_CHAT JG_CHECKS JG_CHILD JG_CM JG_CORE JG_DIAG JG_ENGINE JG_GAMES JG_HW JG_JAMOL JG_JIA_LEAD
JG_LEAGUE JG_LEGAL JG_LESSONS JG_LESSONS_DATA JG_LESSONS_DESKTOP JG_LINKS JG_LISTEN JG_ME JG_MOCK JG_MOD JG_MOTION JG_OUTCOMES
JG_PARENT_TASKS JG_PAY JG_PAY_PARENT JG_PHASED JG_PHOTO JG_REAL JG_RUNTIME JG_SAT JG_SPEAKING JG_SPEAKING_VOICE JG_STRESS
JG_UNIS JG_VIDEO JG_WRITING claude`. The runtime reads design globals such as `JIA_notify` (20 uses), `JIA_coins`,
`JIA_z`, `JIA_SETTINGS`, `JIA_league`, `JIA_DATA`, `JIA_cm`, `JIA_chat` and `JIA_people`.

**Patching techniques the port must replace:**
- DOM queries after the design painted, and MutationObservers re-applying a patch on every repaint (about 70 observers in
  total)
- `<style>` overrides injected ahead of the design CSS
- `Storage.prototype` interception
- reading and writing design globals
- design-side `JG-PROD` call sites that ask the runtime (`window.JG_ENGINE.x()`, `JG_I18N.text()`, `JG_CHECKS.*`,
  `JG_PHASED`, `JG_DIAG.word`)

**Client API surface.** About 83 distinct `/api/v1/...` path prefixes are referenced by runtime, design and auth pages. The
most used are lessons, reports, family/check, checks/quiz, blocks, proofs, parent/alerts, games/daily, engine/commit,
engine/snapshot, state/*, ai/sample, ai/precheck, ai/react, ai/prepare, pay/*, mock/*, study/*. Every runtime file that
fetches sends `x-jg-uid` (the account the page was rendered for), except `auth.js` and `jg-i18n.js` (its dictionary).

### 2.6 i18n: three separate mechanisms

1. **Student apps: a DOM post-translator** (`jg-i18n.js`; contract in its header `:1-70`). Live students only; the demo stays
   English.
   - The keys are the design's exact English, whitespace collapsed. `uz.json` holds 1,611 exact entries and 693 regex
     patterns; `ru.json` 1,655 and 863. Patterns support `$n` back-references, one level of nested translation, and a
     `keep` list.
   - It translates text nodes plus `placeholder`, `aria-label`, `title`, `alt` and button `value`.
   - Exclusions: `HARD` (`[data-no-i18n]`, `#dg-view`, `#jp-view`, `[lang]:not(html)`, scripts), `NOTEXT`, `USER` (21
     selectors of people's words and names), `UI_IN_USER`, its own output, and served item content (`:72-77`).
   - It runs one walk, then a MutationObserver batched per frame, with direct text writes translated synchronously
     (`:61-66`). `<body>` is hidden up to 1.5 s while the dictionary loads (`WAIT_MS`, `:83`).
   - `jg-i18n.css` holds overflow fixes scoped to `html[lang=uz|ru]`. `JG_I18N.choose(l)` commits `language` and reloads.
     Uzbek Latin uses U+02BB (oʻ, gʻ) and U+02BC; the "JG Uz Marks" font draws them ahead of Raleway.
2. **Parent apps: the design's own `DICT` + `PATTERNS`** (`parent-mobile/js/000.js:32-36`), English → uz/ru. The language
   comes from `?lang`, then `jg.parent.lang`, defaulting to `uz` (`:37-39`). The server prepends the read model's sentence
   patterns from `JG_BOOT.patterns` (`:35`), and `‘` becomes `ʻ` for a real family (`:34`).
3. **Diagnostic words: `jg-diag.js`** (`JG_DIAG.word(lang, s)`), read by the page's `T()` (`023.js:239`). Its English
   checks stay English by rule.

The server also localises: `uiLang` (`pages.ts:167-174`), `<html lang>` (`:248`), and the engine's strings, which arrive
already in the student's language.

### 2.7 Tests that pin the frontend

- **`tests/smoke/fidelity.ts` (169 lines), the 0.000 % gate.**
  - It runs against a live server with the demo family seeded. For each app it shoots the artifact twice (file URL, preview
    bars hidden, `:81-89`), shoots the signed-in demo page, and diffs pixel by pixel. A pixel differs when some channel
    differs by more than 24 (`:97`). Pixels that differ between the two artifact loads are noise and excluded
    (`:101-108`). It fails above `MAX_DIFF_PCT = 0.05` (`:33`).
  - Viewports are 390x844 iPhone UA and 1440x900, both with `reducedMotion: 'reduce'` (`:25-26`). `settle` waits for
    networkidle, then fonts, then 2.5 s, then a forced 3-frame repaint (`:50-65`).
  - **Only the first viewport of the four landing pages is shot** (`demo.screenshot()`, not fullPage, no navigation).
  - Part 2 is a layout probe of a real account (`fidelity-probe.ts`). Structural boxes (`LAYOUT` selectors) must keep the
    demo's left/width/overflow, after the demo's number text is swapped into the `NUMS` regions. **Boxes are keyed by DOM
    path** (tag + same-tag index up to `<body>`), so a port must keep the DOM tree, not just the look.
- **Browser unit tests (76 files).** `tests/unit/support/browser.ts` serves a page as `http://jg.test/page` with `/d/*` and
  `/runtime/*` from disk, `/api/*` answered by the test, every other host empty (so fonts fall back). `real-page.ts` renders
  the page through `renderPage(buildBoot(...))` for a fresh DB student and asserts on DOM, selectors and runtime globals
  (`JG_REAL`, `JG_ENGINE`), e.g. `jg-real-today.test.ts`. These are the most valuable behaviour specs for the port.
- **vm tests (65 files).** `runtime-harness.ts` runs `jg-runtime.js` in `node:vm` with a fake fetch, clock and Storage, and
  the `JgEngine` type lists the API (`:13-22`).
- **Design-source tests.** `design-edits.test.ts` (line counts, `JG-PROD` on edited lines, phone/laptop twins),
  `jg-i18n-dict.test.ts`, `jg-i18n-items.test.ts`, `jg-diag.test.ts` (every string has uz+ru), and `no-content-leak`.
- **Smoke walks (48 files, 9,743 lines).** `run.ts` (sign-in, log-out R12, photo framing R13, known errors), `p1.ts`
  (student loop), `lessons-walk.ts` (2,358 lines), `i18n.ts`, `lang-walk.ts`, `glyph-walk.ts`, `uz-marks-walk.ts`,
  `motion.ts`, `pay-shots.ts`, `longest.ts`, the `p5*` walks, `chat-*`, `community-*`, `mod-walk`, `voice-walk`, and others.
  They drive the UI by the design's own selectors (e.g. `#tb-track button[data-i]`).

### 2.8 Server-side frontend code that moves out of the backend

`pages.ts` (380), `static-page.ts` (26), `initials.ts`, `me-photo.ts`, `uz-marks.ts`, `ai-notice.ts` (26), the seven
`*/page.ts` injectors (~150), the staff page builders (1,026) and `checks-preview.ts`. Word-producing read models stay
backend: `parent/view.ts` (597; `designFill`, `parentView`), `parent/patterns.ts`, and `startVars`' inputs.

### 2.9 Load-time facts (the user-visible cost)

Per student page the design JS is 5.57 MB raw and **3.63 MB gzip**. Of that, `016.js` (the prize gift film, opened rarely)
is **3.06 MB gzip**, loaded as a sync script on every load. The runtime is 1.41 MB raw / 448 KB gzip (all files), the CSS
441 KB, and uz.json / ru.json 49 / 60 KB gzip. Everything is `no-cache`, revalidated by ETag. Lazy-loading 016's `TPL` (and
022's `W8`, plus the face-api/three CDNs, which already load on open) cuts first-load JS by about 85 % with no React. It is
also the biggest single win a React port's code-splitting would bring.

---

## 3. Binding rulings, and what each means for the frontend

| Ruling | Frontend mechanics that must stay identical |
|---|---|
| The four artifacts are the product, as drawn (D1, D2); fidelity 0.000 % | same DOM tree (tags, ids, classes, attributes, text, order), same CSS files and cascade order, same fonts (Google Fonts URLs, not `next/font`), same media, same timing of classes/hidden toggles; demo path pixel-equal to the artifact |
| Every live behaviour, switch state, coin/ledger rule | same `/api/v1` calls (method, path, body, `x-jg-uid`, `client_id`s), same outbox/commit split (D12), same wallet settle, same switch-driven presence of each feature (§2.2 table) |
| Privacy rules | journal stays on device (`jg-journal.js`, `jg.journal.v1` device-only); no user text translated; AI notice/consent (428); nothing personal in URLs |
| No one logged out | same cookies (Auth.js session cookie, `jg_view`, `jg_lang`, `jg_child`), same `/api/auth/*` form flows, same `/signin?next=` redirects |
| No data lost | same localStorage keys and formats (`jg.uid`, `jg.dirty`, `jg.outbox`, synced keys); dirty-wins-at-load; flush on pagehide; tabs open across a deploy keep working (N-1 API compatibility) |
| Seconds of downtime at most | page server blue/green behind Caddy; per-app and per-island switches that roll back without a rebuild |

---

## 4. Target architecture

### 4.1 Topology with FastAPI

```
browser ── Caddy ──┬─ /api/v1/*, /api/auth/*, /media/listening/*  → FastAPI (backend lanes)
                   └─ everything else (/app, /parent, /signin, /staff, /d/*, /runtime/*, /_next/*) → Next.js frontend (Node)
Next.js server ── internal HTTP (cookie forwarded) ──> FastAPI  GET /api/v1/page?app=student|parent&view=mobile|desktop
```

- **The page plan endpoint (new; to agree with the backend lane).** It moves all switch, DB and profile logic out of the
  frontend, so the frontend has no env switches of its own:
  ```
  { redirect?: string, setCookies?: [...],          // /app → /signin?next=/app, /welcome, /parent; /parent → /link
    boot: Boot,                                      // window.JG_BOOT, the same object buildBoot returns today
    fill: { meFull, meFirst, mePhoto?, start?: StartVars, roleLine?, hello?, roadTitle?, parent?: ParentFill,
            meInitials?, child?: {full, first, photo}, uzLangPick?: boolean },
    lang: 'en'|'uz'|'ru',                            // uiLang
    css: { mePhoto?: string, uzMarks: bool, noCodes: bool, letter: bool, sheetLines: bool, ends: bool, restDay: bool, i18nCss: bool },
    features: { checks, phased, core, games: {cfg}|null, league, pay: {plans, payBoot, parent: bool}|null, diag, i18n,
                family, roadmapReady, unis, jamol, aiNotice, photo, outcomes, parentTasks, proud, m1: 'parent'|'student'|null,
                jiaLead, links, writing, speakingVoice, speaking, listening, video, lessons, lessonsDesk, real, hw, mock,
                satFull, chat, stress, coreParent, moderation: {on}|null, community },
    contract: '30' }                                 // RUNTIME_VERSION successor
  ```
  It is the same decision table as §2.2, expressed as data. In F1 the frontend turns it into the same script tags. In F2/F3
  the same flags decide which React components mount. Side effects that live in today's page GETs (`adoptLang`,
  `adoptParentLang`, `migrateP0Blobs`) move with it into the backend.
- **What the frontend needs FastAPI to keep:**
  1. the same `/api/v1` paths, status codes and JSON, plus `x-jg-uid` 409, 401, 428 and 429 semantics
  2. Auth.js-compatible `/api/auth/csrf`, `callback/password`, `callback/telegram`, `signin/google` and `signout`, with the
     same form posts, redirects and session cookie, so no one is signed out
  3. the unbuffered chunked text body of `/api/v1/ai/sample` (Caddy `flush_interval -1`)
  4. EventSource `/…/stream?uid=&lastEventId=` for chat
  5. byte ranges on `/media/listening/*`
  6. the page-plan endpoint

  None of this favours Django REST over FastAPI. I agree with FastAPI.
- **Deploy footprint.** Use `output: 'standalone'` for the frontend. Today one build is 944 MB on a disk with 5.7 GB free.
  The frontend no longer needs `web/**` or the content banks traced (`next.config.ts:6`).

### 4.2 Route map in App Router (end state)

```
app/
  (student)/app/page.tsx         server: fetch page plan → redirect | <StudentDocument plan variant>
  (parent)/parent/page.tsx        same for parent
  (auth)/signin, signin/telegram, signout, welcome, link, join/[code], c/[kind]/[id], gift/[code],
         study/math/[code], privacy, terms, pay/return, pay/sandbox/[number]   → React pages (small)
  (staff)/staff, staff/{billing,core,moderation,queue,video}                    → React pages
  preview/[app]                    dev only, demo family (designStudent/designFamily) without a boot
```

Each route group has its **own root layout** (Next allows multiple root layouts via groups). The student and parent
documents must control `<html lang>`, `<head>` order and `<body>` with nothing shared. Navigation between groups is a full
page load, which is what happens today. Never use `<Link>` to a legacy document: its scripts would not run on a soft
navigation. All four app pages are dynamic (cookies/headers), with HTML at `no-store` as today.

### 4.3 The document in React

- `<head>` is rendered in JSX in exactly the §2.2 order: boot `<script dangerouslySetInnerHTML>` with `safeJson`, runtime
  tags (F1–F2) or nothing (F3), the injected `<style>`s, then `<title>`, the preconnects and the Google Fonts `<link>`
  (same URLs, `web/*/shell.html:7-9`), then `<link rel="stylesheet" href="/d/<app>/css/00.css">`.
- Plain `<link>` tags **without `precedence`**, so React 19 leaves them in place and in order. No CSS imports through the
  bundler for design pages. No `next/font`, no `next/image` (they change markup and font metrics). Turn off ESLint's
  `@next/next/no-img-element` for these routes.
- **Student body in F1/F2:** the legacy shell body as a string. Either set `dangerouslySetInnerHTML` on `<body>` itself, or
  use a wrapper with `style={{display:'contents'}}` and `suppressHydrationWarning`.
  - Verified in `C:/Users/PC/jg-p5int/node_modules/react-dom/cjs/react-dom-client.production.js` 19.3.0 (the plan copy has
    no node_modules): hydration does not inspect the children of an element whose content
    is set by `dangerouslySetInnerHTML` (`popHydrationState` skips elements where `shouldSetTextContent` is true,
    `:3066-3079`).
  - The singletons `<html>`, `<head>` and `<body>` tolerate extra nodes (`:3074`, tags 3 and 27). Nodes the design appends
    to `<body>` therefore do not trigger a client re-render.
  - The legacy scripts run because they are in the streamed HTML. React never re-runs them.
  - To confirm in a spike (F2c day 1): a text mismatch anywhere else under the root makes React 19 throw away and re-render
    the root (`throwOnHydrationMismatch`, `:2966`), which would destroy the design's DOM. So **no React-rendered text may
    depend on anything the legacy scripts change before hydration.**
- **Parent, auth and staff bodies (F2a, F2b), and student in F3:** real JSX, SSR, hydrated.

### 4.4 Components

- **Student family (one tree, `variant` prop):**
  - `StudentApp` with `Frame`: device, notch, status bar, wallet, top scrim; the phone tab bar with its glass lens (005);
    the laptop top bar, rail, search, menu and `data-jia`/`data-jgo` openers (laptop 023); pull-to-settings (015); the
    scrolled fade (020); `ViewStack` (z-order).
  - Tabs: `Home` (arc 002, roadmap chart 003, study clock 001, hero), `Today` (Dome 004, Today page 006, task sheet, letter,
    study room), `Explore` (008), `Lessons` (009 + lessons runtime), `Community` (010 + chat + community).
  - About 70 surface components, listed in Appendix C.
  - `Diagnostic` (023: 233-661, `jg-diag` words, `jg-checks`), `Roadmap` (662-816 + `jg-real` §4 + `jg-links`),
    `ParentCheck`, `ReDiagnosis`, `Jamol` (`jg-jamol`, AI notice, consent), `Journal`, `Outcomes`, `Photo`, `Family`.
  - Leaf surfaces: Shop, Pricing (+pay), Settings, Applications/Calendar, Medals, ARMedal, PrizeFilm, IQBattle, GamesHub
    (chess/checkers), TeamGames, Party/Mafia, CampusGuessr, League.
- **Imperative widgets, kept as wrapped modules** (a React component owns a ref'd root; an effect runs the original
  drawing/animation code nearly verbatim; props feed it). These are the Dome (004), arc carousel physics (002), roadmap
  chart (003), tab-bar lens (005), the chess/checkers boards (013 + chess.js), the team-game stage and voice (014), AR medal
  (022: three r128 + face-api 1.7.15, lazy), medal 3D/confetti (021), dream bricks (023 1148-1172), the parent coach and
  dream canvases (`#coachFx`, `#dreamCv`), and the prize film (016: `TPL` moved to a static file loaded into the same
  iframe on open). Rewriting canvas, WebGL or physics code adds pixel risk for no gain.
- **Parent family:** `ParentApp` (`variant`) with 4 panes, 9 folders and 6 sheets. Its placeholder text comes from
  `plan.fill.parent` (88/98 keys): `_HTML` keys via `dangerouslySetInnerHTML` first, structured later; `_ATTR` as `hidden`.
  `DICT`/`PATTERNS` become a `tp()` translator.
- **Demo vs live:** the design's `JG_API` mock (023:152-232), its seeded constants (D2), and `DESIGN_START` become a
  `designMock` module, used when `!boot.engine` (demo, `/preview`). Live reads the store's engine.

### 4.5 State: one store mirroring today's keys

Use a vanilla (framework-free) store, for example Zustand `createStore`, so non-React legacy code and React share one
source during the strangler. Slices:

1. **boot**: `uid`, `role`, `me`, `children`, `familyCode`, `demo`, `features`, `lang`. Immutable per load.
2. **persisted**: the synced keys (`jia.settings`, `jia.medals`, `jia.gift`, `jg.diag.v1`, `jg.study.v1`, `jg.squad.v1`,
   `jg.seen.v1`; `jg.parent.lang`) as parsed objects. The persistence layer is **`jg-runtime.js` §1–2 ported line for line
   to TS**: the same debounce, per-key queue, `jg.dirty` keyed by uid, dirty-wins-at-load, `OWNED` merge, 401/409/429/5xx
   handling and keepalive flush. Its 65 vm tests become vitest tests of the module.
3. **device**: `jg.journal.v1`, `jg.outbox`, `jg.reopen`, `jgs.on`, `jg.pay.renew`, `jg.auth.lang`, `jg.uid`. localStorage
   only, same formats.
4. **engine**: the snapshot (`JG_ENGINE.cache`), `doneSeen`/`localDone`/`ended`, the running session, the outbox and the
   wallet (shown balance vs settled balance, settle after 4 s idle). The 41 `JG_ENGINE` methods become selectors and actions
   with the same semantics. The events `jg:snapshot`/`jg:goal`/`jg:photo`/`jg:ai-notice` become store subscriptions, and
   are still dispatched while legacy code listens.
5. **ui**: active tab (`JIA.go`/`JG_TAB`), the `JIA_z` counter (each open gets the next z), the open-surface stack, the
   notification centre (`JIA_notify`, bell count), the celebrate/medal queue, document classes (`html.dark/.calm/.cut-*/
   .gm-open/.jg-kb`, `body.scrolled/.pulling/.sy-th-*`, `data-jg-photo`) applied by one effect, and motion
   (`JG_MOTION`, "played today" via `jg.seen.v1`).
6. Per-surface local state stays in components (`useState`), matching the IIFE `let`s.

**Bridge (strangler only):** `bridge.ts` publishes `window.JG_ENGINE`, `window.JIA_coins`/`JIA_notify`/`JIA_z`/`JIA_open*`
and the other globals from the store. Remaining legacy files keep working, and a React island re-exposes the opener the
legacy file used to define (e.g. `JIA_openShop`). Each global is deleted when its last consumer is gone. Inventory: the
Appendix A lists.

### 4.6 Data fetching

- Keep the **exact contract**, with no new client library semantics: `api.ts` wraps `fetch` with `x-jg-uid`,
  `credentials:'same-origin'`, the 401 → `/signin?next=` and 409 → reload rules, and the backoff rules.
- Awaited commits remain promises in the event handlers. The outbox drains as today.
- The AI stream uses the same `getReader()` pump with `onText`. Chat uses the same EventSource and `lastEventId`.
- Do not add a caching layer such as React Query in the port. It changes request timing and counts, which the API-log
  parity (§6) would flag. Add it later, if ever.

### 4.7 i18n in React (render-time, same dictionaries)

- `t(s)` ports `jg-i18n.js`'s translate function: collapse whitespace, look up `exact`, then try `patterns` in order with
  `keep` and one level of nesting. It runs on the server and the client from the same `uz.json`/`ru.json`, with the version
  key kept.
- Text appears translated in the first HTML. This removes the 1.5 s hidden body, and React hydration never sees a mismatch.
- Exclusions become "do not call `t()`": people's words (the `USER` list), `[data-no-i18n]` item content, the `#dg-view`
  diagnostic (which uses `td()` = `jg-diag` words), `#jp-view` (its own switch), and elements with their own `lang`.
- **Granularity rule:** the DOM translator works per text node. Every string the design built as **one** text node (template
  literal, `textContent =`) must be passed to `t()` as **one** string, e.g. `{t(\`${n}% complete\`)}`, never as
  `{n}% complete` (three text nodes). Otherwise patterns stop matching and the probe's `NUMS` text-node layout changes.
- Attributes go through `t()` too: `placeholder`, `aria-label`, `title`, `alt`, button `value`.
- `jg-i18n.css`, the uz-marks font link and the `<html lang>` rule are unchanged. `JG_I18N.choose(l)` becomes
  `i18n.choose(l)` (commit `language`, then reload).
- Russian stress (`jg-stress.js`) becomes a render-time `<Stress>` text transform producing the same spans/marks. Read its
  output to copy it exactly.
- Parent: `tp(s)` = design `DICT`/`PATTERNS` with `boot.patterns` prepended and the U+02BB swap. Its default language `uz`
  stays.

---

## 5. Port rules (how to change no pixels)

1. **DOM identity is the contract.** Same tags, nesting, ids, classes, `data-*`, `aria-*`, `role`, `tabindex`, `hidden`,
   `src`/`href`/`alt`, sibling order, and the same number of elements (the probe keys by DOM path). Never add wrapper
   elements; use fragments.
2. **Whitespace.** HTML whitespace between inline or inline-block siblings renders a space; JSX drops newline-indented
   whitespace. The converter must emit `{" "}` wherever the source had inter-element whitespace, and keep exact text
   inside `white-space: pre*` contexts (`#jt-sheet .jr-why{white-space:pre-line}`, `pages.ts:287`). Template literals
   spanning lines in `innerHTML` strings carry whitespace text nodes too.
3. **Text node granularity**, per §4.7 (one string expression per legacy text node).
4. **Attributes:** `class`→`className`, `for`→`htmlFor`, `tabindex`→`tabIndex`, SVG `stroke-width`→`strokeWidth` and
   similar, `xlink:href`→`xlinkHref`. Inline `style="--c:#…"` → `style={{'--c': '#…'}}`; check the serialized order is
   irrelevant (computed style is what renders). Booleans: React writes `hidden=""` (CSS `[hidden]` is unchanged).
5. **One owner per attribute.** An attribute or style property is either React-controlled or ref-controlled (e.g. `zIndex`
   from `JIA_z`), never both. React overwrites on re-render.
6. **Repaint = remount.** Legacy `innerHTML` repaints destroy and recreate nodes: CSS entry animations replay
   (`.fold-body > * { animation: paneIn }`), focus and scroll reset, `<video>` restarts. React reconciliation preserves
   nodes. Wherever the legacy code repainted, give the subtree a `key` that changes on each repaint to keep that behaviour.
   Remove the key only on an owner ruling.
7. **Open/close sequences.** Reproduce the exact order: `hidden=false`, (forced reflow), add `show` class, `setTimeout`
   focus with `preventScroll`. Use one `useOpenTransition` hook copied from the legacy sequence. Do not "simplify" to
   React transitions.
8. **Read-once environment:** `matchMedia('(prefers-reduced-motion: reduce)')` read once at load as the design does
   (`018.js:9`), not reactively. The same applies to `html.calm`.
9. **Events.** Legacy delegated listeners (`container.addEventListener('click', e => e.target.closest('[data-id]'))`) can be
   ported as one delegated `onClick` on the same container, preserving the order of handling. During the strangler,
   Next hydrates at `document`, so React's delegated listeners sit on the same node as the legacy `document`
   listeners. Which runs first then depends on registration order, and `stopPropagation` does not separate them
   (only `stopImmediatePropagation` would). Walk every interaction where an island's events reach a legacy document
   listener (`data-jia`, closers, `Escape` handlers).
10. **Timers and animation loops** live in effects with cleanup. StrictMode double-invokes effects in development, so
    effects must be idempotent. Production is unaffected.
11. **No `next/image`, `next/font`, `<Link>` to app documents, CSS modules, Tailwind, or CSS-in-JS** on design pages.
    Design CSS files are served verbatim.
12. **Data and copy are the design's.** Move the constants into TS/JSON modules unchanged (D2). Do not reformat copy, not
    even quotes: `escText` keeps the design's apostrophes (`pages.ts:103-104`).
13. **Injected `<style>` blocks** (`jg-ends`, `jg-sheet-lines`, `jg-letter`, `jg-no-codes`, uz-marks, me-photo) become
    static CSS files linked in the same head position, toggled by `plan.css` flags. Do not merge them into `00.css`.
14. **Runtime patches are folded into render**, not re-applied after it. Example: `jg-real` "Explore shows sourced records"
    becomes `Explore` rendering `GET /api/v1/explore` results in the design's card markup when live. The end state must
    equal the legacy page after all observers have run (the golden).
15. **Both paths.** Every component renders the demo (mock) path and the live path. Golden coverage includes both.
16. **Keyboard and focus:** the `html.jg-kb` focus-ring rule, and focus return on close (laptop `006.js`).
17. **Cut features:** `html.cut-*` classes are set at SSR. Whether cut-for-everyone code is ported now or later is a
    controller ruling (§10).
18. **Traceability:** carry each `JG-PROD: <why>` comment to the TSX line that implements it, and keep
    `docs/migration/legacy-map.json` (legacy `file:line` → component/test). `tools/design-diff.mjs` and the line-count
    locks retire with the legacy file they guard.

---

## 6. Parity strategy (the gates every lane must pass)

**F0 builds it before any port. Reuse the contract lane's recorder:** `mig-contract-rec`, tools in `tools/contract/` of
`C:/Users/PC/jg-p4g-2`, record/normalise/replay.

1. **Screen catalogue `screens.json`.** For each surface: app, id, how to open it (JS opener such as `JIA_openShop()`, a
   click path, or a URL), states (empty/filled, steps, results, errors), and which accounts (demo, live), languages (live:
   en/uz/ru; demo: en) and viewports (phone 390x844 iPhone UA, laptop 1440x900; parent the same; auth both; staff
   laptop) apply.
   - Size: about 75 live surfaces × ~2 states × (1 demo + 3 live) × 2 apps ≈ **1,200 student shots**, about **300 parent**,
     about **100 auth** and about **20 staff**. Roughly **1,600 goldens**, about 20 min on 4 workers. Each lane runs its own
     shard; integration runs everything.
2. **Determinism:**
   - Playwright `page.clock` with a fixed Tashkent instant, so Date, timers, rAF and `performance` are controlled.
   - Seeded `Math.random` via `addInitScript`.
   - `reducedMotion: 'reduce'`, plus a motion-on subset for `tests/smoke/motion.ts` parity.
   - Fonts: allow `fonts.googleapis.com`/`gstatic` (or a local cache of those exact files). The unit harness blocks them
     (`support/browser.ts`), and fallback fonts would hide glyph regressions (U+02BB).
   - The fidelity repaint trick (`fidelity.ts:50-59`).
   - The backend clock pinned for seeded accounts.
3. **Record / replay.** Load each screen on the **legacy** page against a seeded backend. Record the boot JSON, every
   `/api/v1` response and localStorage. The **candidate** (React) page gets the identical boot and **replayed** responses.
   This decouples frontend parity from the backend rewrite: frontend lanes can run while FastAPI lanes run.
4. **Pixel gate:** the `compare()` algorithm of `fidelity.ts:91-113` (channel tolerance 24; reference noise = pixels that
   differ between two legacy loads). Required: **0 differing pixels** outside the noise mask, i.e. 0.000 %. Shoot full
   page as well as the viewport for scrolling surfaces, and inner scrollers scrolled to their ends.
5. **DOM structural diff:** for the surface's subtree (or the whole body), legacy vs React after settle.
   - Normalise: attributes as a sorted map; `style` parsed to a property map; adjacent text nodes merged; whitespace runs
     collapsed, but presence kept.
   - Ignore `<script>`, `next-route-announcer` and `nextjs-portal`.
   - Must be equal. This catches what pixels cannot: aria labels, `data-*` the tests use, hidden nodes, ids.
6. **Text parity (i18n):** for live accounts in uz and ru, visible text per element path equals the legacy page after
   `jg-i18n` ran.
7. **Behaviour parity (scripted walks):** for each catalogue walk (open, act, close), the **API call log** must match:
   method, path, normalised body (`client_id`, timestamps masked), `x-jg-uid`, order within awaited/outbox semantics. The
   **localStorage after** (synced keys parsed; `jg.outbox`, `jg.dirty`) must match too. This is the frontend's half of
   "coin/ledger rules identical".
8. **Layout probe:** the existing `fidelity-probe.ts` (real account vs demo, `NUMS` swap) keeps running unchanged on the
   React pages. It passes only if DOM paths are preserved, so it is a free regression check of rule 1.
9. **Re-pointed tests.** The 76 browser unit tests switch from `renderPage(...)` to "render the candidate page with the
   same boot" (a test helper that asks the Next app for HTML with a given plan). DOM assertions stay. Assertions on
   runtime globals (`JG_REAL.exploreState`, `JG_ENGINE.cache`) go through a test-only `window.__jg` hook exposing the
   store, or become DOM assertions. The 48 smoke walks run against the React build unchanged except their base URL. Their
   selectors are the design's own and stay.
10. **The existing gate stays as is:** `npm run fidelity` (demo vs artifact, first viewport, 0.000 %) runs on every
    integration.
11. **Owner-visible check before each app's cutover:** a teen-style walk on a real phone at 390 px in uz and ru, as the
    project has done for every round (CURRENT_STATE).

---

## 7. The frontend strangler

| Phase | What | Switch / rollback | Gate |
|---|---|---|---|
| **F0** harness | §6 catalogue, recorder, comparators, HTML→JSX converter with round-trip test (render to static HTML, then the DOM diff against `shell.html` after placeholder fill) | none | legacy vs legacy run is clean (only noise) |
| **F1** page server | New Next.js frontend (standalone) serving all 24 page routes from the page plan; legacy documents emitted **byte-identical** to `renderPage`/`renderStatic` for the same inputs (snapshot tests per app × plan fixture); `/d/*`, `/runtime/*` served as today; Caddy splits `/api` to FastAPI | Caddy upstream switch; old monolith kept warm | byte-equal HTML; fidelity 0.000 %; smoke `run.ts` green |
| **F2a** parent React | `ParentApp` SSR + hydrate, both variants | `FE_REACT=parent` env (or per-uid cohort cookie for staff/demo first); off → F1 legacy document | §6 all gates, parent shard |
| **F2b** auth + staff React | 8 auth + 6 staff pages | `FE_REACT=auth,staff` | §6, auth/staff shards; sign-in works with the old and new session cookie |
| **F2c** student foundation | App Router document with legacy body (§4.3), store + sync module, bridge, `t()`, island mount (portal into the emptied legacy container; the shell's markup for that container moves into the component) | `FE_ISLANDS=` list in the page plan; each island keeps its legacy code until deleted | full student shard green with zero islands on (the document change alone is a no-op) |
| **F2d** student islands | lanes L1–L7 (§8), one surface group per PR: component + delete legacy JS section + delete runtime patches for it + re-point its tests | per island; rollback = remove from list | §6 for that surface group, plus a full student run at integration |
| **F3** full SSR | when the legacy body is empty: render the frame + tabs in React SSR, hydrate; heavy surfaces `next/dynamic` on open | `FE_REACT=student` | full corpus; weak-phone load check (time to first paint and to interactive at 390 px on a throttled 3G profile, vs legacy) |
| **F4** retire | delete `public/d/*/js`, `public/runtime/*` (except assets), bridge globals, `pages.ts` | — | full corpus + all walks |

Cutover safety:
- Legacy and React documents use the same storage keys, cookies and API, so a user can move between them mid-day with
  nothing lost.
- Deploy order: the backend accepts both frontends (N-1 by contract version) before a frontend flips.
- Frontend containers go blue/green behind Caddy (seconds).
- Roll out by cohort: staff, then demo, then a uid-hash percentage, then all.

---

## 8. Work order and lanes (for the build lanes)

Dependencies: F0 → F1 → (F2a ‖ F2b ‖ F2c) → F2d lanes in parallel → F3 → F4. The backend's FastAPI lanes run alongside on
record/replay. Integration is serial on four shared files: `store`, `bridge`, `Frame`, `t()`.

| Lane | Scope (legacy sources) | Agent-days |
|---|---|---|
| F0 | catalogue, recorder (reuse tools/contract), pixel + DOM + text + API-log + storage comparators, HTML→JSX converter | 6 |
| F1 | Next page server, page-plan client, 24 routes, byte-equal snapshot tests, Caddy, standalone build | 5 |
| F2a | parent apps: `000.js` ×2, shells (88/98 placeholders), `jg-parent-tasks`, `jg-pay-parent`, `jg-proud`, `jg-parent-m1`, `jg-core-parent`, `jg-photo` (parent), `jg-outcomes` (parent), coach/dream canvases | 6 |
| F2b | auth pages ×8 + `auth.js` + `jg-legal-text`; staff pages ×6 + `jg-staff*` | 5 |
| F2c | document host, store + sync port (+65 vm tests → vitest), bridge, `t()`/`tp()`/`td()` + stress + parity, island infra, document classes | 8 |
| L1 leaf | Settings 011, Pricing 017 + `jg-pay`, Shop 018, Applications/Calendar 012, Medals 021, AR 022 (wrapped, lazy), PrizeFilm 016 (static file, lazy), League (laptop 010 + `jg-league`) | 7 |
| L2 games | IQ 007, Games hub/chess/checkers 013, Team games 014, Party/Mafia 019 + 023:2883, CampusGuessr 023:3006, `jg-games` | 6 |
| L3 explore + lessons | Explore 008 + `jg-real` §1 + `jg-unis`; Lessons 009 + `jg-real` §2 + `jg-lessons` + `jg-lessons-desktop` + writing, speaking, voice, listening, video, `jg-mock`, `jg-sat`, `jg-hw`, `jg-jia-lead` | 10 |
| L4 community | Community 010 (1,736 lines), 023:1796-2201 (clubs etc.), `jg-chat`, `jg-community`, `jg-moderation` | 6 |
| L5 today | Dome 004 (wrapped), Today 006, task sheet 023:817-942, `jg-checks` (quiz/CAT screens), `jg-phased`, ends/rest/letter styles, study room 023:1122-1320, comeback 2428, journal 2506 + `jg-journal` | 9 |
| L6 home + frame | Frame (device, wallet, status bar, tab bar 005 wrapped, pull 015, scrolled 020), Home arc 002, roadmap chart 003, study clock 001, mascots 000, notifications, laptop shell 023 + rail | 7 |
| L7 engine UI | Diagnostic 023:233-661 + `jg-diag` + checks screens, first picture, honest check, Roadmap 662-816 + `jg-real` §4 + `jg-links` + `jg-roadmap-ready` + `jg-core`, parent check 943-1121, Jamol + `jg-jamol` + `jg-ai-notice`, outcomes, photo, family/parents | 10 |
| F3 | SSR cutover per student app, code-split, weak-phone budget | 3 |
| Tests | re-point the remaining browser tests and smokes not done inside lanes; retire line-lock tests; CI shards | 4 |
| F4 + integration | integration rounds (serial), production rollout per app, owner walks | 3 |
| **Total** | | **95** |

Lane rules for agents: each PR names its `screens.json` ids, attaches the gate report, deletes the legacy code it replaces,
and touches `store`/`bridge`/`Frame` only through an integration lane.

---

## 9. Hard parts (ranked)

1. **The design and the runtime are one program spread over about 25k lines, coupled through DOM timing.**
   - About 70 MutationObservers and post-paint patches (jg-real alone has 32) define what a live student sees.
   - Folding them into render means re-deriving each rule's end state from the legacy behaviour, not from a spec. About
     1,750 `JG-PROD` markers and D11–D40 are the only documentation, and they cite line numbers that will no longer exist.
2. **Demo and live are two products in one tree.** Every surface has the design's mock path (the pixel baseline) and the
   engine path (386–411 branch points per student app). Both must be golden.
3. **The current gate does not cover the port.** First viewport of 4 pages only. The roughly 1,600-shot corpus with
   deterministic clocks and recorded data is new work, and the legacy app must pass it stably before any port starts.
4. **The pixel traps React adds:**
   - JSX whitespace and text-node splitting (i18n patterns, `NUMS`)
   - remount-vs-reconcile (animations that replayed on `innerHTML` repaint)
   - attribute ownership conflicts
   - extra in-flow `<body>` children in a flex body with `gap`
   - Next's CSS pipeline and `next/font` (forbidden)
   - hydration mismatch, which re-renders the root and destroys the legacy DOM in F2
5. **i18n by DOM post-processing has to become render-time translation with identical output**, including one-level
   nested patterns, `keep` groups, the exclusion lists, Russian stress marks and the U+02BB font stack, for about 4,800
   dictionary entries.
6. **The engine front end (023, 3.3k lines)** mixes diagnostic, roadmap, Today, study room, community and games state in one
   closure with shared `S`/`A`/`D` objects and `save()`. Splitting it into components without changing the order of
   `jg.diag.v1` writes (synced and server-merged) is delicate.
7. **Imperative visual widgets:** the Dome, arc, chart, lens, chess, team stage, AR, medals and dream bricks. Wrapping is safe
   but each needs a careful effect lifecycle (StrictMode, resize, reduced motion, tab hide).
8. **Tests are tied to internals:** `renderPage`, `vm` runs of runtime files, line-count locks and `window.JG_*` probes. 152
   files to re-point or rewrite.
9. **Ops limits:** 5.7 GB free disk, 7 GB RAM shared with Postgres and other sites, two runtimes now (Node + Python).
   Standalone build and blue/green add up; release folders must be pruned.
10. **Two simultaneous rewrites.** If a screen diverges you need to know whether the frontend or the backend caused it.
    Record/replay (§6.3) is what makes running them in parallel tractable. Without it, serialise backend first.

---

## 10. Estimate and the faster alternative

- **Full conversion: ~95 agent-days** (range 75–120; the risk is pixel-drift chasing in the wrapped widgets and the
  i18n/text-node work). With 6–8 lanes in parallel after F2c, wall-clock is about 4–5 weeks, bounded by serial integration
  on store/bridge/frame.
- **Deferring the always-cut features** (JG Daily, squad/season/class, School Cup, passport, project lab, rivals, JG Live,
  creators, English coach, help desk, todayMock/Recap, player card, almost there): about −5 agent-days. They are hidden for
  every account, the demo included. They stay legacy code (behind the bridge) until the owner turns one back on. **Needs a
  controller ruling.**
- **Fast path, ~24 agent-days:** F0-lite (catalogue + pixel/DOM gates for the touched apps, 4) + F1 (5) + F2a (6) + F2b (5)
  + a React island infra for **new** student screens (3) + load-time quick wins (1: lazy-load `016.js` `TPL` and `022.js`
  `W8`, about −3 MB gzip per student page load). Every new or changed screen is then written in React, and the existing
  student design stays as the owner drew it, hosted by Next. D6's reasoning still holds for the 25k lines that work.
- **My recommendation:** do F1 now, in lockstep with the backend (it is needed for FastAPI regardless), plus the quick
  load win and the fast path. Put the full student conversion to the owner as a separate ~70-agent-day decision, with the
  cost stated. If he says "full", the lanes above are ready to run.

---

## 11. Open questions (for the controller / owner)

1. Full student conversion now, or the fast path first? (§10)
2. Port the 16 always-cut features now or leave them legacy until reactivated? (§2.4.6)
3. Page-plan endpoint shape (§4.1): agree with the backend lane. Who owns `adoptLang`'s side effect in a GET?
4. Auth.js cookie compatibility in FastAPI: confirm the backend lane keeps the `authjs` session token readable (JWE with
   `AUTH_SECRET`), or a dual-read window. The frontend only forwards cookies.
5. The goldens' fonts: allow Google Fonts in CI (network) or vendor those exact files for tests only?
6. `?v=` cache keys retire with the legacy files. Is a single `x-jg-fe` contract header acceptable to the backend as the
   N-1 check?

---

## Appendix A — window globals

- **Student phone (73):** JG_API JG_CUTS JG_HUB JG_HUB_GO JG_RMLANG JG_coachOn JG_flex JG_fstreak JG_jamolAv
  JG_openDiagnostic JG_openParent JG_openRoadmap JG_openStudy JG_readiness JIA_AR JIA_AV JIA_BLOCKED JIA_DATA JIA_GIFT
  JIA_HOST JIA_IMG JIA_JAMOLA_FACE JIA_JAMOL_FACE JIA_M JIA_MASCOT JIA_MIMG JIA_MYIMG JIA_PARTY_ART JIA_PEOPLE JIA_SETTINGS
  JIA_STICKERS JIA_UNI JIA_VOICE JIA_ach JIA_addApp JIA_calendar JIA_celebrate JIA_chat JIA_cm JIA_coins JIA_games
  JIA_league JIA_lsOpen JIA_medalStrip JIA_medals JIA_notify JIA_openApps JIA_openBlocked JIA_openGames JIA_openJamol
  JIA_openLeague JIA_openLesson JIA_openOpp JIA_openPricing JIA_openProfile JIA_openSearch JIA_openSettings JIA_openShop
  JIA_openTeacher JIA_openTeam JIA_parseWhen JIA_party JIA_people JIA_pricing JIA_remind JIA_screen JIA_today JIA_z
  MathJax __achOpen __giftUntil __paAudio __prCtx.
- **Laptop adds:** JG_TAB JIA JIA_APPS JIA_appPct JIA_openDetail JIA_paintApps.
- **Read by the design from the runtime:** JG_API JG_BOOT JG_CHECKS JG_CM JG_CUTS JG_DESIGN_BANKS JG_DIAG JG_ENGINE
  JG_FAST JG_GAMES JG_HUB JG_HUB_GO JG_HW JG_I JG_JAMOL JG_LEAGUE JG_MOD JG_MOTION JG_PAY JG_PHASED JG_PLANS JG_RMLANG
  JG_RUNTIME JG_UNIS (+ JG_TAB on the laptop).
- **Parent design reads:** JG_BOOT JG_M JG_PLANS JG_CHILD.

## Appendix B — CDN and external resources

- chess.js 0.10.3, mathjax 3.2.2 tex-svg, three.js r128 (cdnjs); `@vladmandic/face-api@1.7.15` (jsdelivr).
- Google Fonts:
  - student: Raleway 300–700, Cormorant Garamond, Pinyon Script
  - parent: Raleway 400–800, Fraunces, Lora
  - Courier Prime/Fraunces inside the prize film
- Share intents: t.me, wa.me, facebook, twitter, Google/Outlook calendar.

## Appendix C — student surfaces (phone ids; the laptop has the same set plus its shell)

- **Tabs:** `tv-today`, `tv-explore`, Home `.screen`, `tv-lessons`, `tv-community`.
- **Views/sheets/layers:** ach-sheet ap-view ar-view att-sheet bl-sheet cal-sheet cb-view cg-view cm-sheet cmt-sheet
  cr-view crack-layer cs-view cup-view data-layer dg-view dust-layer es-view ev-view fy-view gf-view gh-view gi-sheet
  gm-layer gp-view grp-sheet iq-layer iq-view jd-view jl-view jm-view jn-view jp-view jr-sheet jr-view jt-sheet lab-view
  lg-view lt-layer ly-view md-sheet md-view mf-view mine-sheet mn-view ms-view new-sheet np-view nt-view ob-view pa-view
  pc-view pf-view po-sheet poll-sheet pp-view pr-view pst-view pu-view rl-sheet rl-view rp-sheet rq-sheet set-view
  sh-sheet sr-view st-sheet st-view stk-sheet sy-view tg-view why-view zc-view zq-view zr-view zs-view zw-view.
- **Runtime-created:** jgd-view, jgm-view, jgs-view, uz-view, data-sheet (+ the quiz/CAT/lesson/SAT screens drawn inside
  design containers).
- Several of the above belong to cut features (`cup-view` School Cup, `lab-view` project lab, `pp-view` passport, `jl-view`
  JG Live, `cr-view` creators, …). F0's catalogue marks each one live, cut-for-all, or cut-for-live.
