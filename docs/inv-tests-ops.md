# inv-tests-ops — tests and operations: inventory and plan for the FastAPI + Next.js conversion

Lane: tests-ops. Written 21 Oct 2026. Read-only survey; nothing in any repo or on the box was changed.

Heads read (numbers below say which one they come from):

| Name | Where | Commit | What it is |
|---|---|---|---|
| PLAN | `C:/Users/PC/jg-plan` | `ddbf9d81` (m1-main) | the brief's read-only copy |
| HEAD | `C:/Users/PC/jg-p5i` | `8a1582d9` (M1b integration, 21 Oct 10:18) | the newest code on disk; the brief's 132 routes / 57 migrations match THIS head, not PLAN |
| PROD | `git ls-tree c6b7372f` (read-only) | `c6b7372f` | what runs on app.jamals.uz since 20 Oct 13:37 (`docs/ai/CURRENT_STATE.md:3-18`) |

The build lanes should port HEAD (M1b), and parity must be measured against HEAD's TypeScript.

---

## 1. Headline numbers

| | PROD c6b7372f | PLAN ddbf9d81 | HEAD 8a1582d9 |
|---|---|---|---|
| `/api/v1` groups | 25 | 40 | 40 |
| `/api/v1/**/route.ts` | 59 | 125 | 130 |
| + `/api/auth/[...nextauth]` + `/api/health` | 2 | 2 | 2 |
| page/other route handlers (`src/app/**/route.ts` outside `api/`) | 14 | 24 | 24 |
| SQL migrations (`drizzle/*.sql`) | 39 (0000-0038) | 51 (0000-0050) | 57 (0000-0056) |
| `*.test.ts` (vitest include set) | 539 | 604 | 625 (621 `tests/unit` + 4 `src/lib`) |
| `tests/smoke/*.ts` | n/a | 47 | 49 |
| all `tests/**/*.ts` | n/a | 677 files / 88,631 lines | 700 files / 91,998 lines (786 files incl. json/mjs/fixtures) |
| last full suite | 543 files, 5,534 passed, 0 failed, 13 todo (`CURRENT_STATE.md:41`, P16 on `e3fc097b`) | | M1 run `300-full` on `a15c89ec`: 603 files, 6,114 tests, 6,094 passed, 3 failed (fixed later in `3cc7df87`), 4 skipped; 4 parts, about 42 min of vitest time |

The brief's "~740 test files / ~96k lines" is close to the HEAD total of everything under `tests/` (786 files / 92k lines of .ts).

Production lacks 15 groups that HEAD has: achievements, blocks, chats, community, core, games, leads, league,
motivation, notes, pay, plans, pledges, privacy, reports (all M1/M1b, each behind a switch that is OFF by default), and
migrations 0039-0056. **M1 and M1b have never run in production.** See section 8 for what that means for the cutover order.

---

## 2. The test layout

### 2.1 Runner and configuration

- `vitest.config.ts:6-8` (PLAN): `include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts']`, `testTimeout: 30_000`,
  `setupFiles: ['tests/setup/env.ts']`, `globalSetup: ['tests/setup/global.ts']`, **`fileParallelism: false`** (one file at a
  time: the files share one database), `server.deps.inline: ['next-auth']`, alias `@ -> src`.
- `tests/setup/env.ts:1-7`: loads `.env.local`, refuses to run without `TEST_DATABASE_URL`, sets `DATABASE_URL = TEST_DATABASE_URL`,
  a fixed `AUTH_SECRET`, and `JG_QUIZ_READ_MS=0` (the "too fast to be a pass" rule off for the suite).
- `tests/setup/global.ts:2-5`: runs `node scripts/migrate.mjs` against the test database once per run.
- Smoke walks are plain `tsx` scripts with `playwright-core`, against `SMOKE_BASE` (default `http://localhost:3000`, `tests/smoke/run.ts:4`),
  with `SMOKE_CHROME` = chrome-headless-shell (`D:/tools/chs/...`; IDM hooks chrome.exe on this PC).
- `package.json` scripts (PLAN): `test` = `vitest run` (line 14), `smoke` = `tsx tests/smoke/run.ts` (21), `fidelity` =
  `tsx tests/smoke/fidelity.ts` (25), `start` = `node scripts/migrate.mjs && next start` (12).

### 2.2 Every test file, classified by what it needs (HEAD, 625 files)

Method: a script parsed every test file's static and dynamic imports, then followed `src/` imports transitively to see whether
the file can reach `src/db/client.ts` (the Postgres client). Test counts are the exact per-file counts from the M1 run's JSON
reports (`.superpowers/m1/int/300-full-{1..4}.json`; 22 newer files counted by regex). Seconds are that run's per-file wall time.
Caveat: "reaches the DB client" is an import fact, not proof a query runs; the D/E split is right to within a few files.

| Bucket | Meaning | Files | Tests | Lines | Secs |
|---|---|---|---|---|---|
| **E** pure | engine, lib, content checks, tools; plus `src/server` modules that never reach the DB (e.g. `@/server/content/bank` serve/grade, `@/server/lessons/hw-plan`) | 207 | 2,513 | 24,463 | 191 |
| **D** service + DB | calls `src/server/**` functions in-process against the test DB (`engine-server/helpers.ts` `newStudent()` etc.) | 188 | 1,295 | 22,757 | 477 |
| **R** route handler | imports `@/app/api/**/route` and calls `GET(req)` / `POST(req)` with a `Request` | 66 | 563 | 9,900 | 85 |
| **F** frontend JS, no browser | runs `public/runtime/*.js` or slices of `public/d/*/js/*.js` in a `node:vm` stub (`tests/unit/support/runtime-harness.ts`, `check-page.ts`) | 68 | 817 | 9,211 | 28 |
| **FD** frontend + server | as F, but also builds the boot / page on the server side (`buildBoot`, `renderPage`) | 45 | 608 | 7,152 | 60 |
| **B** browser, mocked API | headless Chrome on a page served from `public/` with `/api/*` answered by the test (`tests/unit/support/browser.ts`) | 6 | 56 | 989 | 52 |
| **BD** browser + real page | headless Chrome on the page the server renders for a real test-DB student (`tests/unit/support/real-page.ts:10-11,32`) | 45 | 404 | 7,580 | 1,091 |
| total | | 625 | ~6,256 | 82,052 | 1,984 |

Per area (files): E / D / R / F / FD / B / BD

| Area | E | D | R | F | FD | B | BD | total |
|---|---|---|---|---|---|---|---|---|
| tests/unit (top level) | 5 | 11 | 21 | 45 | 18 | 6 | 36 | 142 |
| ailayer | 13 | 16 | 2 | 1 | 0 | 0 | 0 | 32 |
| cat | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 9 |
| chat | 3 | 5 | 4 | 0 | 0 | 0 | 0 | 12 |
| community | 1 | 0 | 5 | 0 | 0 | 0 | 0 | 6 |
| content | 41 | 17 | 0 | 0 | 0 | 0 | 0 | 58 |
| core | 0 | 3 | 1 | 0 | 4 | 0 | 0 | 8 |
| engine | 114 | 1 | 0 | 11 | 2 | 0 | 0 | 128 |
| engine-server | 1 | 97 | 12 | 1 | 13 | 0 | 0 | 124 |
| family | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| lessons | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 2 |
| lessons-speaking | 0 | 3 | 3 | 2 | 1 | 0 | 0 | 9 |
| lessons-writing | 0 | 3 | 1 | 0 | 1 | 0 | 1 | 6 |
| listening | 3 | 4 | 2 | 1 | 1 | 0 | 0 | 11 |
| moderation | 0 | 2 | 2 | 1 | 0 | 0 | 0 | 5 |
| outcomes | 8 | 6 | 1 | 2 | 2 | 0 | 0 | 19 |
| parent | 0 | 10 | 4 | 2 | 1 | 0 | 8 | 25 |
| pay | 3 | 4 | 3 | 2 | 0 | 0 | 0 | 12 |
| phase-x | 1 | 4 | 2 | 0 | 1 | 0 | 0 | 8 |
| src/lib | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| video | 0 | 1 | 1 | 0 | 1 | 0 | 0 | 3 |

Lines per area (HEAD-like, PLAN measure): engine-server 16,452; engine 14,239; top level 20,398; content 9,535; ailayer 3,500;
parent 3,152; outcomes 1,868; pay 1,303; lessons-speaking 1,192; phase-x 1,121; cat 1,013; community 909; listening 899;
chat 784; moderation 557; core 487; video 479; lessons-writing 470; lessons 187; support 331.

### 2.3 How each bucket ports

| Bucket | Fate | Why / how |
|---|---|---|
| **E** (207) | **Golden fixtures**, ported as data, not as code | The TS functions stay the oracle. An exporter runs them and writes (input, output) JSONL; pytest loads the same files against the Python port. See 5.11.2. |
| **D** (188) | **Stay as TS oracle tests** of the TS backend while it lives; their *guarantees* transfer through HTTP parity + DB-state diff. Business-rule cases (coins, ledger, quotas, privacy, switches, one-attempt rules) are re-written as pytest by the lane that ports that service. | They call TS functions in-process; nothing about them can hit FastAPI. Rewriting 22.7k lines 1:1 is the slow path; the parity harness covers the same behaviour through the routes that call those functions. |
| **R** (66) | **Reused as HTTP contract tests, nearly unchanged**, against both stacks | A small adapter turns `mod.GET(req)` into a real `fetch` to `CONTRACT_TARGET`, mints the session cookie for `session.id`, and turns switch setters into a test-only switch call. See 5.11.1. |
| **F** (68) | **Unchanged**, if the Next.js frontend keeps the design's JS files at their paths (`public/d/**`, `public/runtime/**`) | 55 test files read `public/d/`, 120 read `public/runtime/`, 38 slice design JS by line number (`M:023:498-562` in `tests/unit/support/check-page.ts`). If the frontend lane rewrites those files into React, these tests die and only browser tests can replace them. They belong to the frontend repo/package either way, not to FastAPI. |
| **FD** (45) | Frontend half unchanged; server half re-pointed | They import `buildBoot`/`renderPage` (59 files use one of them). Replace with "boot JSON from FastAPI" (a fixture recorded from the TS `buildBoot`, compared by parity). |
| **B** (6) | **Unchanged** | They mock `/api` themselves (`support/browser.ts`); they test only frontend code. |
| **BD** (45) | **Re-pointed by changing one support file** | All 45 go through `tests/unit/support/real-page.ts` (54 lines): change it to fetch the page HTML from a running frontend + FastAPI (or boot from FastAPI + the frontend's shell) instead of `renderPage(buildBoot(...))`. Their DB setup (`newStudent()` via TS) keeps working because the schema is shared. |

Mechanics a naive port trips over (HEAD, `tests/unit`):
- `vi.mock('@/auth', ...)` in **62** files (the session is faked in-process; `tests/unit/chat/routes.test.ts:3-4`).
- switch setters (`setMessenger`, `setPayments`, `setLessons`, ... 20 setters in 11 `switch.ts` files, e.g. `src/server/pay/switch.ts:62-68`
  are `testsOnly`) used in **141** files; `process.env.X = ...` writes in **109** files. Over HTTP these need a test-only switch endpoint.
- `x-jg-uid` header in **57** files (the page's own account; wrong account = 409; `src/app/api/v1/family/route.ts:8-13`).
- `vi.mock('@anthropic-ai/sdk')` in 5 files, AI fakes in 13; fake timers / `setSystemTime` in 3.
- **38** test files read `src/**` source text (21 read `src/server` or `src/app` source) to assert structure ("nothing imports X",
  "every route caps its body", "dark by construction" scans such as `tests/unit/engine-server/strategy-read.test.ts`,
  `tests/unit/engine/p5y-score.test.ts`). These cannot port; each becomes a Python-side static scan or is retired with a reason.

### 2.4 Smoke and walk scripts (HEAD `tests/smoke`, 49 files, 9,994 lines)

All drive real pages over HTTP via `SMOKE_BASE`, so they are **reusable against the new stack unchanged**, with these exceptions:

| Kind | Files | What to do |
|---|---|---|
| Drive pages + `fetch(SMOKE_BASE/api/v1/register)` only | run, p1, motion, i18n, first-run-walk, lang-walk, notice, photo, parent-photo, teachers, outcomes-walk, p5d-walk, p5d-review-walk, p5f2-map-copy, p5int-walk, core-walk, glyph-walk, chat-walk, chat-client-walk, m1-dates-walk, m1b-dates-walk, mod-walk, fidelity (+ fidelity-probe), jamol, student-loop, p5-wave2-walk, p5c-walk, p5e-walk, p5-fix-walk, checks-walk, check-slow-data, english-lesson-walk, jamol-m1-walk, voice-walk, community-walk, community-client-walk, m1-league-walk | **unchanged**; point `SMOKE_BASE` at the edge proxy. Several read the DB directly with Drizzle or `postgres` (keys, ids: checks-walk, p5c-walk, check-slow-data, english-lesson-walk, mod-walk, community-*, m1-league-walk, voice-walk); that keeps working because the schema is shared. |
| Import `src/engine` for answer keys / fixtures | checks-walk, p1, student-loop, p5-fix-walk, p5e-walk, caps-wrap | unchanged (engine stays TS as the oracle in the test tree) |
| Call TS server functions in-process | **lessons-walk.ts** (2,358 lines; `WALK_STEP=days` runs 14 days through `commit`, `snapshot`, `quizKept`, `lessonView`, `answerPiece`, `coursesFor`, `parentChild`, ... `tests/smoke/lessons-walk.ts:93-107,137,275,351-352`), study-walk (`src/server/outcomes/study`), chat-load (hub load, no HTTP), uz-marks-walk (staff page render), caps-wrap and p4a (`src/server/ailayer/fake`), pay-accounts (account setup) | lessons-walk needs an **HTTP mode**: an adapter mapping each function to its route (about 300 lines); its `WALK_STEP=shots` half is already HTTP. study-walk and uz-marks-walk: same treatment. chat-load: rewrite as a load test of FastAPI's hub. caps-wrap/p4a: fake via `ANTHROPIC_BASE_URL`. pay-accounts: keep as a TS fixture builder (writes DB rows). |
| No server | leak.ts (word list), longest.ts (string table) | unchanged |

The gate walks kept outside the repo (`.superpowers/m1/intb/`): `m1-switch.ts` (153 lines: every M1 switch, routes 404 when off,
Payme/Click 503, page script tags only when on), `m1-honesty.ts` (157), `m1-feature.ts` (506), `m1b-games-walk.ts` (199) are page/HTTP
driven and reusable unchanged against the edge.

The 14-day walk depends on a **walk clock**: `.superpowers/teen/p6-walk-clock.cjs` is preloaded with `NODE_OPTIONS=--require`, replaces
`Date`, and follows `JG_WALK_AT` / `JG_WALK_AT_FILE` (re-read every 300 ms) so a running dev server can be moved to any day. FastAPI needs
the same seam (port note P6).

### 2.5 Fixtures

`tests/fixtures/`: content (C3, K1, K4, K4x, K5; 25 KB), engine (`design-mock`, `question-ids-v1.json`; 56 KB), lessons-c19 (12 KB),
listening (content + media + `build-fixture.mjs`, `make-audio.ps1`; 444 KB), **personas P1-P6 + teen** (52 KB: the natural input set
for engine golden runs), photo (152 KB), proof (48 KB). `tests/unit/identity-allowlist.json` (real-name allowlist for `identity.test.ts`).

---

## 3. The 4-part suite runner and the CI-like gate kit (`.superpowers/m1/intb`, gitignored)

The newest kit (M1b) lives in `C:/Users/PC/jg-p5int/.superpowers/m1/intb` and runs against the worktree `C:/Users/PC/jg-p5i`
(`env.sh: W=C:/Users/PC/jg-p5i`). Every script writes `<name>.log` + `<name>.exit` and returns at once when detached, which is what keeps
each tool call under the ~2-3 minute agent watchdog.

| Script | What it does |
|---|---|
| `env.sh` (20 lines, sourced) | derives `DATABASE_URL`/`TEST_DATABASE_URL`/`M1_ADMIN_URL` from `.env.local` by renaming the database (`jg_p5i_dev -> jg_p5i_m1_dev`, `jg_p5i_m1_test`, `postgres`), refuses if `.env.local` is not `jg_p5i_dev`; `AUTH_URL`/`SMOKE_BASE=http://localhost:3300`; `SMOKE_CHROME`; `PSQL`. URLs never printed. |
| `vars.sh` | switch sets: `PRE` (ENGINE_LIVE PHASE_D PHASE_X AI_LAYER), `ALL` (the 8 production switches), `M1` (every M1 switch + `PAYMENTS_SANDBOX`, `PLAN_LIMITS`, `FX_UZS_PER_USD=12800`, `MEDIA_DIR`), `CLK` (the walk-clock preload). |
| `dev.sh <log> [VAR=v...]` | `next dev -p 3300` with **every** switch unset first, then exactly the given ones; `ANTHROPIC_API_KEY` empty. |
| `up.sh` / `stop.sh` | wait for `:3300/signin` 200; kill only the PID listening on :3300. |
| `gate.sh <name> <cmd...>` | one gate, log + exit file + seconds, `WALK_OUT`/`SMOKE_SHOTS` under `shots/<name>`. `go.sh` = gate detached + `wait.sh` (cap 100 s). |
| `mkdb.sh` | creates `jg_p5i_m1_dev` / `_test` if absent (never drops), migrates both, prints migration counts. |
| `migr-twice.sh` | migrations twice on 3 fresh copies (empty; `TEMPLATE jg_p5i_m1_dev`; `TEMPLATE jg_p5int_dev` = a pre-M1 DB with rows, like production), then `schema-diff.mts` (migrated schema == drizzle-kit's model); drops only its own copies. |
| `static.sh <prefix>` | the no-server gates: `tools/design-diff.mjs`, `scripts/content/validate.ts --all`, `scripts/content/scan.ts`, `scripts/content/counted-nouns.ts`, `npm run build`. |
| **`full4.sh <prefix>`** (the 4-part runner) | `lists.mjs 4` splits every included test file round-robin into 4 lists (`lists.mjs:7-10`: sorted, `i % n`, so long files spread), then 4 sequential `npx vitest run --config .superpowers/m1int/vitest-list.config.ts` runs (`LIST=<file>`; same setup/globalSetup/timeout/alias as `vitest.config.ts`), each with its own log, JSON report, exit file; ends with `<prefix>-all.done` (`full4.sh:9-17`). `sum.mjs` totals the 4 JSON reports and lists every failure. Why four: one 600-file run outlives a tool call and one crash loses everything. |
| `vt.sh <name> <files...>` | one targeted vitest run with JSON report. |
| `chain-a..g.sh` | the walk chains: a = the three 14-day lessons walks (baseline, production state, production + all M1 on); c/d/e/g = dev server per switch state, then the walks; **each M1 switch off alone** (270-280); the League weekly rollover twice (idempotence) and its DB check. |
| `schema-diff.mts`, `snap.mts`/`snapb.mts`, `journal.mjs`, `union.mjs`, `rename-refs*.mjs`, `res-*.mjs` | integration tooling: drizzle snapshot re-chaining, journal rebuild, merge-hunk resolution. Not needed by the conversion except schema-diff (reuse it as the "schema unchanged" gate). |
| `reg.sh`, `pay-walk.sh`, `appendres.mjs`, `reach.mjs` | account creation (only `@example.test`), pay page walk (generated password, never printed), results appending, the dark-by-construction reach list. |

The M1 run's gates and their wall times (`.superpowers/m1/int/*.log`, END lines): 64 gates, **7,301 s (about 2 h)** of walks + static gates,
plus about 42 min for the 4-part suite. Biggest: switch-off walks 180-568 s each; m1f-pledge 456 s; m1f-social 360 s; fidelity
175-185 s per switch state; static gates 2.5 min (build 46-62 s, validate 52-56 s).

`p16/final/final-gates.sh` (P16, 59 lines) is the same pattern for the lessons half: build; fidelity with lessons off / production /
every P15 switch on; smoke; the two 14-day walks; `full4.sh`. The fidelity gate is `tests/smoke/fidelity.ts`: demo family pixel-compared
with the four artifacts at 390x844 and 1440x900 (`APPS`, `fidelity.ts:27`), threshold `MAX_DIFF_PCT = 0.05` (`fidelity.ts:33`); the
recorded results are 0.000 %.

---

## 4. Operations today

### 4.1 The live stack (`deploy/servercore/`)

- `docker-compose.yml:9-32`: one service `jgapps`, image `node:22-bookworm-slim`, `command: npm start` (= migrations, then `next start`),
  `env_file: .env`, `volumes: ./app:/app` (a symlink to `app-<sha>`), `expose: 3000`, healthcheck `fetch('/api/health')` every 30 s,
  `start_period: 60s`, network `jamals_default` (external). **No memory or CPU limit.** TZ left UTC on purpose (lines 7-8).
- Caddy (`caddy-block.txt:7-15`, appended to `/opt/jamals/Caddyfile`): `app.jamals.uz { encode zstd gzip; request_body { max_size 12MB };
  reverse_proxy jgapps:3000 { header_up X-Real-IP {remote_host} } }`. DNS: Cloudflare A `app -> 157.22.129.112`, DNS only.
- Release in place (`DEPLOY.md:16-26`): `git archive` -> scp -> `app-<sha>`; build in a one-off `node:22-bookworm-slim` container with
  `npm ci --include=dev --foreground-scripts && npm run build` (without `--foreground-scripts` esbuild hits ETXTBSY on this box);
  `pg_dump -Fc` to `/opt/jgapps-backups/`; `ln -sfn app-<sha> app && docker compose up -d --force-recreate`; check health, `/signin`,
  `/app` 302, `/parent` 302, `/preview/student-mobile` 404. Rollback = symlink back + recreate (+ restore the dump if a migration ran).
  **The recreate is downtime**: last deploy "healthy in 9 s" (`CURRENT_STATE.md:10`), i.e. several seconds of 502 per release today.
- Backups: daily `pg_dump` from `/etc/cron.d/jgapps-backup`, 14 days kept (`DEPLOY.md:14`); a dump before every release.
- AI switches are DB rows, not deploys: `ai-on.sql`, `ai-off.sql`, `ai-master-off.sql` (sets `notice_version = null`; read within 10 s,
  no restart), `ai-check.sql` (read-only daily alert line). `scripts/ai-switch.ts` run via `docker exec` (`DEPLOY.md:28-45`).
- `league-tick.cron` (not installed): `docker exec jgapps-jgapps-1 npx tsx scripts/league-tick.ts` Sunday 19:05 UTC + hourly Monday
  (`league-tick.cron:6-7`).
- `whisper/` (not deployed): Python 3.11 slim, faster-whisper 1.2.1, stdlib HTTP server, `read_only`, tmpfs, `cpus: 2.0`,
  `mem_limit: 2g`, no published port, `WHISPER_TOKEN` (whisper `docker-compose.yml:21-50`). It is the only Python on the box for this app,
  and a good template for the new container's hardening.

### 4.2 The box (`jamals-web`, 157.22.129.112) and its traps

- 4 CPU, 7 GB RAM, Postgres 16 (`jamals-postgres-1`) shared with jamals.uz, exam (a FastAPI app), sales, sotuv, admissions, kuzatuv,
  ariza, lcms; JamalsInBot has its own DB. Disk **85 %, 5.7 GB free** (`CURRENT_STATE.md:18`); **one Next release = 944 MB**
  (`CURRENT_STATE.md:8`), and two are kept (live + rollback).
- `/opt/jamals/Caddyfile` is a **single-file bind mount**: anything that saves via temp-file + rename (`sed -i`, most editors) swaps the
  inode and the container keeps the old file; edit in place (`>>` or a truncating write), `caddy validate` inside the container, then
  `caddy reload`. One file fronts every site on the box.
- Docker uses the **containerd image store**: a `docker compose build` re-points `:latest` and the old image is gone; tag the rollback
  image *before* building. (The current jgapps flow dodges this by using stock images + bind-mounted releases.)
- The provider has powered the VM off (12 and 13 Oct); every site down until started from the panel.
- No Docker on the build PC (checked: `docker: command not found`), so images and venvs are built on the box, as the Node release is today.
- SSH only in the exact allow-listed form, from a `D:\Claude` session.

### 4.3 Runtime facts that decide how the backend can be split

| Fact | Evidence | Consequence |
|---|---|---|
| Sessions are Auth.js **JWT** (JWE cookie), 30 days | `src/auth.ts:13` | FastAPI can read the same cookie with `AUTH_SECRET` (no session table): nobody is logged out at cutover if the decrypt is exact. `/api/auth/*` stays on the TS app until its own late wave. |
| Every route checks `x-jg-uid` against the session (409) | `src/app/api/v1/family/route.ts:8-13`, `pledges/route.ts:18` | part of the contract; the auth-matrix probes (5.10) test it on every route |
| Background work runs **inside** the Next process | `src/instrumentation.ts:13` (League worker when `LEAGUE=1`), `:14-16` (AI job worker when `AI_LAYER=1`) | while both backends run, workers stay in the TS container; AI jobs are claimed `for update skip locked` (`src/server/ailayer/jobs.ts:49`) and the League worker is idempotent, so a second worker in FastAPI is safe but needs its own on/off env (port note P12) |
| Chat delivery: one in-process hub fed by Postgres `LISTEN/NOTIFY jg_chat`; SSE id `<boot>.<seq>`; ring of 2,000; unknown boot -> `resync` | `src/server/chat/hub.ts:2-14`, `stream.ts:35`, `types.ts:105` | the NOTIFY wire format must be byte-identical while TS scripts/staff tools still publish; presence is per process (keep the stream on **one** process); moving `/api/v1/chats*` makes open pages reconnect and resync, no message lost |
| DB-level locks: `pg_advisory_xact_lock(hashtextextended('ai-usage:<day>',0))`, `('ai-layer:<date>',0)`, `hashtext('community:<uid>')`; `engine_state ... for update` | `src/server/ai.ts:30`, `ailayer/budget.ts:72`, `community/posts.ts:55`, `engine/context.ts:18`, `core/replan.ts:27` | the two stacks exclude each other **only if** FastAPI takes the same keys with the same SQL. Mandatory. |
| Rate limits, body caps: in-process counters, reset on deploy; per-route body caps before reading | `src/server/limits.ts:1-12` | FastAPI keeps its own counters (acceptable: limits are per action and each action lives on one stack at a time); body caps must answer 413 exactly like `readText()` |
| Client IP = `CLIENT_IP_HEADER` if set, else the **last** `X-Forwarded-For` entry | `src/server/limits.ts:141-145` | adding an edge proxy hop makes the last XFF entry the main Caddy's container IP: everyone would share one register/sign-in bucket. Set `CLIENT_IP_HEADER=x-real-ip` (Caddy already sends it) before adding a hop; verify by name only. |
| Pool `max: 10` (postgres.js); migrations `max: 1` | `src/db/client.ts:7`, `scripts/migrate.mjs` | add FastAPI's pool + LISTEN connection(s) + blue/green overlap to the shared instance's budget (measure `max_connections` first) |
| Security headers come from `next.config.ts` `headers()` on every route; `/media/listening/:file` is a rewrite to the API route | HEAD `next.config.ts:9-12,18-23` | FastAPI responses must carry the same headers (or the edge adds them for FastAPI-served paths); the rewrite must exist in the new routing |
| File-backed stores: `MEDIA_DIR` (community media, sharp + ffmpeg), `VIDEO_DIR` (lesson video); photos and proofs are `bytea` in Postgres | `src/server/media/store.ts:82-84`, `video/store.ts`, `src/db/schema.ts:60-69` | media/video folders must be a shared host volume outside `app-<sha>`, mounted by both backends (both features are OFF in production today) |
| Streaming bodies: SSE (chats), text streams (`/api/v1/ai/sample`, `/api/v1/lessons/hint`), byte ranges (listening, video, community media) | `src/server/chat/stream.ts`, `src/server/ai.ts:54`, `src/server/video/range.ts`, `src/server/listening/audio.ts` | the recorder and differ must handle all three (5.4) |
| Pages are route handlers that read `web/*.html` and inject a boot; script tags depend on switches | `src/app/app/route.ts`, `src/server/pages.ts:1-22` (`RUNTIME_VERSION = '29'`) | no React page and no `/_next` asset exists today, so `/_next/*` is free for the new frontend; page parity = script-tag list + boot JSON per switch state |

---

## 5. The contract-parity harness (plan)

### 5.1 What "parity" means here (four comparisons, all must be clean for a group to flip)

1. **Responses**: status, the contract-relevant headers, and body, request by request, after normalisation.
2. **Database state**: every table's rows after each trace, after normalisation. This is where the coin/ledger rules live; a 200 with the
   right body that wrote one wrong row is a FAIL.
3. **Outbound calls**: what the backend sends to Anthropic, Telegram, R2/S3, Whisper (prompt text, model, max_tokens, payload) through
   recording fakes.
4. **Page shell** (frontend track): for `/app`, `/parent`, `/signin`, ... the ordered list of script/link tags, `window.JG_BOOT` (parsed),
   and the HTML with volatile parts masked, per switch state.

### 5.2 Shape

```
                           +-------------------+   ts twin DB  (CREATE DATABASE jg_par_ts_<run>  TEMPLATE jg_par_base)
 walks / route tests  -->  |  parity proxy     |--> TS dev server :3300  ---------------------------+
 (SMOKE_BASE=:3400)        |  (record | tee)   |                                                     |  same JG_WALK_AT_FILE
                           |  :3400            |--> FastAPI :8300 (shadow in tee mode) ---> py twin DB (TEMPLATE jg_par_base)
                           +---------+---------+                                                     |
                                     |  traces/<run>/<walk>.jsonl  (+ blobs/)                        |
                                     v                                                               v
   replay.py (offline: fresh py twin from the same template, the recorded clock per request) --> differ --> report.{json,md}
   fakes on 127.0.0.1: anthropic :9101 (stream + JSON), telegram :9102, s3/r2 :9103, whisper :9104   (both stacks point at them)
   dbdiff.py: normalised row dumps of both twins after each trace
```

Two modes, same differ:
- **record + offline replay** (the lanes' inner loop, minutes): walks run once against TS through the proxy; FastAPI is replayed
  against a fresh twin as often as wanted, no browser.
- **tee / shadow** (the gate): each request goes to TS (answer returned to the client) and, at the same instant, to FastAPI on its twin.
  Same clock, same moment, so SQL `now()` and JS time line up the same way in both; this mode is the authority for a flip.

### 5.3 Proposed layout (new folder in the repo, e.g. `parity/`)

```
parity/
  manifest/build-manifest.mjs     # parses src/app/api/**/route.ts + src/app/**/route.ts -> manifest.json (method, path pattern, file, group, ported:false)
  proxy/                          # record/tee reverse proxy (Python aiohttp or Node; Python keeps it next to the port)
  replay/replay.py                # offline replayer with id binding + cookie minting + clock setting
  diff/differ.py, normalize.yaml  # JSON/headers/SSE/binary differ and the rules table
  db/twins.sh, dbdump.py, dbdiff.py
  fakes/anthropic.py telegram.py s3.py whisper.py payme_click.py
  probes/auth_matrix.py           # generated probes from the manifest (5.10)
  golden/export-engine.ts, golden/test_golden.py   # E bucket (5.11.2)
  adapters/route-http.ts          # R bucket over HTTP (5.11.1)
  gates/                          # gate.sh-style scripts for the new stack (5.13)
  traces/                         # gitignored
```

### 5.4 Recording format (one JSON line per exchange)

```
{ "run": "...", "walk": "lessons-walk:shots", "seq": 412, "at": "2026-10-26T04:12:09.114Z",   // the walk clock instant
  "actor": "u3",                                                // session label (uid mapped), never the cookie
  "req":  { "method": "POST", "path": "/api/v1/lessons/L-123/piece", "query": "",
            "headers": { "content-type": "...", "x-jg-uid": "<uid>", "last-event-id": null, "range": null },
            "body": { "json": {...} } | { "sha256": "...", "bytes": 81234, "blob": "blobs/..." } },
  "res":  { "status": 200, "headers": { allow-listed, see below }, 
            "body": { "json": {...} } | { "text": "..." } | { "sse": [ {"id","event","data"} ... ], "closed": "client|server|timeout" }
                  | { "sha256": "...", "bytes": ..., "range": "bytes 0-65535/1048576" },
            "ms": 37 },
  "outbound": [ {"to":"anthropic","body":{...}} ... ] }
```

Header allow-list (compared): `content-type`, `cache-control`, `location`, `retry-after`, `content-range`, `accept-ranges`,
`content-disposition`, `x-accel-buffering`, set-cookie (name + attributes, value masked), and the six security headers of
`next.config.ts`. Dropped: `date`, `etag`, `content-length`, `vary`, `x-powered-by`, `transfer-encoding`, `connection`, `keep-alive`.
Binary bodies are compared by hash where the bytes are the backend's own (PDF proof echo, ranges of a stored file); by properties where
they are re-encoded (images from sharp vs Pillow: format, dimensions, EXIF/GPS absent, size bound).

SSE: the proxy keeps the stream open for a bounded window, records events (`id`, `event`, `data` parsed), drops heartbeat comments
(every 20 s), and compares the event sequence per recipient; `id` normalised (`<boot>.<seq>` -> `sse:N`).

### 5.5 Twins and the clock

- Base: `jg_par_base` = a migrated dev DB with the demo family (`npm run db:seed-demo`) and nothing else; each run makes
  `CREATE DATABASE jg_par_ts_<run> TEMPLATE jg_par_base` and `jg_par_py_<run> TEMPLATE jg_par_base` (the gate kit already does exactly this
  in `migr-twice.sh:16-17`; a TEMPLATE copy needs no other connection to the base). Dropped at the end; only `jg_par_*` names are ever dropped.
- Serial and identity columns (chat messages `bigserial`, pay order `number` from 100001, `seq`; `src/db/chat-schema.ts:47`,
  `schema-pay.ts:29,60`) then line up exactly when the same inserts happen in the same order; random ids (12 `crypto.randomUUID()`
  defaults in the schema, `randomBytes` in 17 server files) are bound, not compared.
- Clock: TS runs with the existing preload (`p6-walk-clock.cjs`, `JG_WALK_AT_FILE`); FastAPI must expose the same seam (one `now()`
  function that, only when `JG_WALK_AT_FILE` is set and `NODE_ENV != production` equivalent, follows that file). The proxy writes the
  instant before each request in replay mode. SQL `now()` (126 uses in `src/server`) is NOT moved by either; tee mode makes that equal.

### 5.6 Normalisation and id binding (`normalize.yaml`)

| Rule | Applies to | Effect |
|---|---|---|
| **Bind ids** | strings matching uuid v4, base64url/hex random >= 8 chars, task ids `t_YYYY-MM-DD_n_xxxxxxxx`, `<boot>.<seq>`, values under keys `id`, `*Id`, `*_id`, `claim`, `code` (family/gift codes) | walking the two JSON trees in parallel, the first sighting binds recorded->actual; later sightings must agree; every later request (path, query, body, `x-jg-uid`, cookie identity) is rewritten through the map before it is sent |
| **Timestamps** | ISO strings, epoch ms/s near the clock | replaced by `<ts>`; the Tashkent calendar date (`YYYY-MM-DD` in Asia/Tashkent) and the order between timestamps in one body are still compared |
| **Numbers** | all | JS-equal numbers are equal (`1` vs `1.0` is a NOTE, because `JSON.parse` makes them the same value), floats within 1e-9 relative; integers exact; any difference in a coin, count, price, level or score is a FAIL |
| **Key order** | objects | compared as ordered; a different order is class ORDER (fails unless whitelisted), because the design's JS iterates `Object.keys` |
| **Strings** | all | exact, byte for byte (Uzbek U+02BB/U+02BC, Cyrillic, no Unicode normalisation) |
| **Errors** | 4xx/5xx | status and body exact (`{error:'wrong account'}`, `{error:'too large'}`, `{error:'too many'}` + `retry-after: 600`, empty 401/403/404 bodies) |
| **Whitelist** | per route, per path in the body | only with a written reason (e.g. AI text from the fake is deterministic, so nothing there is whitelisted) |

Classes: FAIL (blocks the group), ORDER (blocks unless whitelisted), NOTE (reported, never blocks).

### 5.7 JS-vs-Python traps the differ is there to catch (counted in HEAD `src/server` + `src/engine`)

- `Math.round` (108 uses) rounds .5 up; Python `round()` is banker's: coins and percentages flip at x.5. Port must use `floor(x + 0.5)`.
- `toISOString()` (89 uses) is `YYYY-MM-DDTHH:MM:SS.mmmZ`; Python `isoformat()` gives `+00:00` and microseconds.
- `localeCompare` (39) and `Intl.*` (7) use ICU collation; Python's default sort is by code point.
- `toFixed` (32), `String(number)` (`100` not `100.0`), `JSON.stringify` dropping `undefined` keys vs Pydantic emitting `null`.
- Object key order (insertion order in TS; field order in Pydantic models).
- Zod parse failures answer the route's own 400 body; FastAPI's automatic 422 `{"detail":[...]}` must never answer.
- Next answers `/x/` with **308** to `/x`; Starlette's `redirect_slashes` answers **307**. Next answers OPTIONS (and HEAD) on its own;
  FastAPI answers 405 with a JSON body. Next's unknown path is an HTML 404. All visible to the differ; decide each explicitly.
- Time zones: `Asia/Tashkent` (25 uses), `timeZone` (9). Python slim images need the `tzdata` package for `zoneinfo`.
- Password hashes: `scrypt$<N>$<r>$<p>$<salt>$<key>`, N = 2^15, password canonicalised first (`src/lib/password.ts:8,30,52-63`);
  Python `hashlib.scrypt` can verify them, but only with the same `canonical()`. Vectors from `src/lib/password.test.ts`.
- JWE session cookie (Auth.js v5): decrypt with a key derived from `AUTH_SECRET` and the cookie name as salt; cookie name differs
  between http (`authjs.session-token`) and https (`__Secure-authjs.session-token`). A cookie minted by TS must open in FastAPI: one
  interop test per environment.

### 5.8 DB-state diff

After each trace: for every table in `public` (and `drizzle.__drizzle_migrations` unchanged), `SELECT * ORDER BY <pk>`, map ids through the
bind map, mask timestamps (keep Tashkent dates), then compare twin vs twin. Strict tables (no whitelist): the coin/ledger and money tables
(coins, engine events, pay orders/ledger, game plays, league), quotas (`ai_usage`, `ai_run` costs), consent/notice rows, family links,
moderation decisions. `ai_job`/`ai_run` rows are compared on status and payload with latency masked.

### 5.9 Fakes for outbound calls

Both stacks already accept base URLs for most upstreams: `ANTHROPIC_BASE_URL` (used by the gate kit: `chain-e.sh:22` points it at a dead
address), `WHISPER_URL`, `R2_ENDPOINT`. Telegram (JIA leads, `JIA_LEADS_TG_*`) needs a base-URL seam if it has none (port note P14).
Each fake answers deterministically (Anthropic: fixed completions and a fixed streamed chunk sequence per prompt hash, including a 429 and
an over-budget case) and logs the request; the differ compares the two stacks' outbound bodies field by field (prompt text exact).
Payme/Click are inbound: a `payme_click.py` client sends the providers' JSON-RPC / form callbacks (sandbox shapes) to both stacks.

### 5.10 Coverage: the route manifest and the auth matrix

- `build-manifest.mjs` lists every route file and exported method (HEAD: 130 v1 route files; methods per group e.g. lessons 6 GET /
  6 POST, staff 4 GET / 8 POST / 2 PUT / 1 DELETE, pay 5 GET / 7 POST, family 2 GET / 6 POST / 1 DELETE). The same manifest drives the
  Caddy route list and the lanes' "ported" tracking.
- Coverage today without new work: direct route tests exist for every group except **achievements, explore, league, motivation,
  phase-d** (no `@/app/api/v1/<group>` import in any test); walks reach league, motivation, explore through the pages
  (`public/runtime` calls: lessons 32 references, family 28, staff 20, games 15, ai 11, pay 10, checks 8, ...).
- `auth_matrix.py` generates, per route x method: no session -> 401; another account's `x-jg-uid` -> 409; parent -> 403 where the route
  is student-only; demo -> 403 where refused; switch off -> 404 (Payme/Click callbacks 503: `m1-switch.ts` header); body over the cap ->
  413; malformed JSON -> the route's 400. About 130 x 6 probes, seconds to run, both stacks.
- The report prints route x method x (recorded / probed / R-test) and fails a group whose rows are not all covered.

### 5.11 Reusing what exists

1. **R tests over HTTP** (`parity/adapters/route-http.ts`): under `CONTRACT_TARGET=http://...`, a vitest setup file replaces the
   imported route modules (`vi.mock('@/app/api/v1/...', ...)`, generated from the manifest) with stubs whose `GET/POST/...` send the
   `Request` to the target, carrying a cookie minted for `session.id` (the existing `vi.mock('@/auth')` state); the switch setters
   become `POST /__test/switch` (both stacks; mounted only when `JG_TEST_ENDPOINTS=1` and bound to 127.0.0.1; never in production).
   First make all 66 files pass against the **TS** dev server over HTTP (proves the adapter), then run them against FastAPI.
   Tests that also call TS functions for setup (`createPasswordUser`) keep working: same database.
2. **Golden corpus for E** (`parity/golden/`): (a) run the vitest E files with a setup that wraps every export of `src/engine/**` and of
   the DB-free `src/server/**` modules and writes (module, function, args, result) JSONL; (b) persona runs (`tests/fixtures/personas`
   P1-P6 + teen) through the engine pipeline (snapshot, roadmap, schedule, CAT sessions, chances) at fixed clocks; (c) property-generated
   inputs for the scorers. pytest replays all of it against the Python port: decisions exact, floats 1e-9. Corpus size target:
   >= 50k records, regenerated whenever the TS engine changes during the transition.
3. **Content validator parity**: `npx tsx scripts/content/validate.ts --all` (6,634 items, 0 served errors at P16, `CURRENT_STATE.md:41`)
   and `scan.ts` produce reports; the Python validator must produce the same report on the same `src/engine/data/content` (19 MB).
4. **BD/FD retarget**: change `tests/unit/support/real-page.ts` to take the boot from FastAPI and the 45 BD files follow; the FD files that call `buildBoot`/`renderPage` directly (59 test files use one of them) swap that import for a recorded/fetched boot.
5. **Walks**: unchanged against the edge, plus the lessons-walk HTTP mode (2.4).
6. **Fidelity**: unchanged (`npm run fidelity` with `SMOKE_BASE` at the edge); it is the frontend's gate and stays 0.000 %.

### 5.12 Production-snapshot GET sweep (on the box only)

Dev data is narrower than real data. Before a group with reads flips: restore the latest daily dump into a temporary `jgapps_parsweep`
database on the same instance, start a TS container and the FastAPI candidate against it on an internal network with no outbound route,
mint a session per real user with `AUTH_SECRET`, call every GET of the group for every user on both, and print only counts and
differing JSON paths (never values). Drop the database at the end. Nothing leaves the box; no real person's data is printed. Check free
disk first (the dump's restored size). Needs the owner's OK like any production action.

### 5.13 Definition of done for one route group (the flip gate)

1. Manifest rows of the group: all methods ported; auth matrix clean.
2. R tests of the group green over HTTP against FastAPI (and still green against TS).
3. Tee-mode walks that touch the group: zero FAIL/ORDER in responses, DB state and outbound calls, in every switch state the gate kit
   uses (`PRE`, `ALL`, `ALL+M1`, each M1 switch off alone).
4. For groups with writes to ledger/coin/money tables: the two 14-day lessons walks (production state; every P15 switch on) in tee mode,
   DB-state diff zero.
5. Production-snapshot GET sweep clean (groups with GETs).
6. Golden corpus of the engine functions the group calls: 100 %.
7. Rehearsed flip and rollback on the box (6.4), latency p95 of the group within 1.5x of TS on the same data.

### 5.14 Cost of running it

On this PC a full TS gate pass is about 2 h of walks + 42 min suite + 2.5 min static (section 3). Tee mode runs both backends side by side,
roughly 1.5x the walk time; offline replay of a recorded run takes minutes. Every long run must be detached with exit files (the
`gate.sh`/`go.sh`/`wait.sh` pattern), because agents' tool calls are killed after about 2-3 minutes.

---

## 6. Deploying the two new services next to the current one

### 6.1 Target topology during the transition

```
Internet -> jamals-caddy-1 (box-wide, TLS)  app.jamals.uz -> jgedge:8080
            jgedge (caddy:2-alpine, owned by /opt/jgapps, its own Caddyfile in a directory mount)
              /api/v1/<group moved>  -> jgapi-blue:8000, jgapi-green:8000   (lb_policy first + active health checks)
              /api/v1/chats*         -> jgapi-rt:8000   (single process: one hub, one presence count)    [when chats moves]
              /<pages>, /_next/*     -> jgweb:3000      (Next.js frontend)                               [frontend wave]
              everything else        -> jgapps:3000     (today's TS app: pages, /api/auth/*, unmoved groups, /api/health)
            all on network jamals_default; Postgres jamals-postgres-1 db jgapps (shared, unchanged schema)
```

Why a jgapps-owned edge instead of path routing in the box's Caddyfile: every flip and rollback becomes a reload of a proxy that fronts
only this app, from a file in a directory mount (no inode trap), with no risk to the other eight sites. The main Caddyfile changes once.

### 6.2 Compose additions (sketch for `/opt/jgapps/docker-compose.yml`)

```yaml
  jgedge:
    image: caddy:2.8-alpine            # pin; needs >= 2.7 for stream_close_delay
    restart: unless-stopped
    volumes: [ "./edge:/etc/caddy:ro" ]  # Caddyfile + routes.caddy (directory mount: in-place edits are safe)
    expose: [ "8080" ]
    mem_limit: 128m
  jgapi-blue:                          # and jgapi-green, identical except the symlink
    image: python:3.11-slim-bookworm   # same minor as whisper/ and the PC's py 3.11; pin one minor everywhere
    working_dir: /app
    command: [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*", "--timeout-graceful-shutdown", "20"]
    env_file: .env                     # the SAME switches and secrets as jgapps
    environment: { JG_WORKERS: "0" }   # no AI/League worker until that wave (port note P12)
    volumes: [ "./api-blue:/app:ro", "./media:/media", "./video:/video" ]
    expose: [ "8000" ]
    read_only: true
    tmpfs: [ "/tmp:size=64m" ]
    mem_limit: 768m                    # measure in rehearsal; content banks load into memory
    healthcheck: { test: ["CMD", "python", "-c", "import urllib.request,sys;sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health',timeout=4).status==200 else 1)"], interval: 15s, timeout: 5s, retries: 3, start_period: 30s }
  jgweb:
    image: node:22-bookworm-slim
    working_dir: /app
    command: ["node", "server.js"]     # next build with output: 'standalone'
    env_file: .env
    volumes: [ "./web:/app:ro" ]
    expose: [ "3000" ]
    mem_limit: 512m
```

### 6.3 Releases without downtime

- Same model as today (stock image + bind-mounted release folder + symlink), so the containerd tag trap never applies:
  `api-<sha>` = `git archive` of the API package; venv built in a one-off `python:3.11-slim-bookworm` container
  (`python -m venv .venv && .venv/bin/pip install --no-cache-dir --require-hashes -r requirements.lock`); frontend `web-<sha>` built in a
  one-off node container (`npm ci --foreground-scripts && next build`, standalone output copied out).
- **Blue/green for jgapi**: point the idle colour's symlink at the new release, `docker compose up -d jgapi-green`, wait `healthy`,
  then `docker compose stop jgapi-blue`. The edge lists blue then green with `lb_policy first`, `health_uri /api/health`,
  `health_interval 2s`, `lb_try_duration 5s`, so traffic moves within a health interval and dial failures are retried (Caddy docs:
  `first` needs health checks for failover; `lb_try_duration` is off by default). Rollback = start blue, stop green. Seconds, no 502.
  Run both only for the switch (RAM).
- jgweb: same blue/green when it carries traffic.
- The existing `jgapps` keeps its current flow (and its 5-10 s recreate gap) until it is retired; once the edge exists, it can also go
  blue/green the same way.

### 6.4 Route flips and instant rollback

`/opt/jgapps/edge/Caddyfile` (sketch):

```
{
	admin localhost:2019
	servers { trusted_proxies static private_ranges }
}
:8080 {
	import routes.caddy
	handle { reverse_proxy jgapps:3000 }
}
```

`routes.caddy`, one block per moved group, written by a script, e.g. for `games`:

```
@g_games path /api/v1/games /api/v1/games/*
handle @g_games {
	reverse_proxy jgapi-blue:8000 jgapi-green:8000 {
		lb_policy first
		health_uri /api/health
		health_interval 2s
		lb_try_duration 5s
		stream_close_delay 5m
	}
}
```

- Match `path /api/v1/<g> /api/v1/<g>/*`, never `/api/v1/<g>*` (that would also catch `/api/v1/<g>x`).
- `jg-route.sh <group> fastapi|ts|canary` rewrites `routes.caddy` from a list file, runs `caddy validate` then `caddy reload` in jgedge,
  then probes the group's health paths and prints status codes. **Rollback = `jg-route.sh <group> ts`: one reload, about a second.**
- `canary` mode adds `header_regexp Cookie jg_be=py` to the matcher so only a browser carrying that cookie (the owner's or staff's
  test device) reaches FastAPI for that group first.
- Reloads close open streams unless `stream_close_delay` is set (Caddy docs: default no delay); with it, SSE and media streams survive
  a flip of another group. Streams of the flipped group reconnect (`retry: 3000`) and get `resync`.
- Special paths: `/media/listening/*` (rewrite to `/api/v1/listening/:file`, HEAD `next.config.ts:9-11`) moves with `listening`;
  `/api/v1/pay/payme` and `/api/v1/pay/click/{prepare,complete}` paths are registered with the providers and must not change;
  `/api/auth/*` (Google callback URL registered at Google) moves last or never (see 7).

Main Caddyfile, once (owner's OK, quiet hour): back up `/opt/jamals/Caddyfile`; replace `reverse_proxy jgapps:3000` with
`reverse_proxy jgedge:8080` keeping `header_up X-Real-IP {remote_host}`, `encode`, `request_body`; write in place (no temp+rename);
`docker exec jamals-caddy-1 caddy validate --config /etc/caddy/Caddyfile` and check it reports the new upstream; `caddy reload`.
Rollback of that step = the old line + reload. Do it only after `CLIENT_IP_HEADER=x-real-ip` is in `.env` and live (4.3).

### 6.5 Resource budget (measure first; nothing here was measured on the box)

| Item | Today | Added | Notes |
|---|---|---|---|
| Disk | 85 % used, 5.7 GB free; a Next release 944 MB x2 | venv 250-400 MB per release x2; standalone frontend 150-300 MB + `public/` 48 MB x2; caddy image ~50 MB; python image ~50 MB compressed | prune build cache; keep one rollback per service; reuse the venv when `requirements.lock` is unchanged; check the backup folder's size |
| RAM | unknown free; jgapps has no limit | jgapi 768 MB x1 (x2 during a switch), jgapi-rt ~256 MB, jgweb 512 MB, jgedge 128 MB | `free -m` and `docker stats --no-stream` first; whisper (2 GB limit) is a separate future decision |
| DB connections | jgapps pool 10 + 1 migrate + chat LISTEN | FastAPI pool (asyncpg) 5-10 per process + 1 LISTEN per process; doubled during blue/green | `SHOW max_connections` and `pg_stat_activity` per database first |
| CPU | 4 cores shared | Python engine code is CPU-bound (CAT, scheduler, scoring); one async worker blocks on it | measure p95 per group in rehearsal; push heavy engine calls to a thread/process pool |

Read-only commands to run first (owner's OK for the SSH session): `df -h /`, `docker system df`, `du -sh /opt/jgapps/* /opt/jgapps-backups`,
`free -m`, `docker stats --no-stream`, `docker exec jamals-caddy-1 caddy version`, `docker inspect jamals-caddy-1` (mounts),
`psql -c 'show max_connections'`, `select datname,count(*) from pg_stat_activity group by 1`, `grep -c '^CLIENT_IP_HEADER=' /opt/jgapps/.env`
(the name only, never the value).

### 6.6 Workers, cron, ops scripts

- League worker and AI worker stay in jgapps until the `league` / `ai` waves; then FastAPI starts them behind its own env flag and the TS
  side's are turned off (port note P12). Skip-locked claims and idempotent rollover make an overlap safe.
- `league-tick.cron` (not installed) and every `docker exec jgapps-jgapps-1 npx tsx scripts/...` in `DEPLOY.md` (ai-switch, coins-adjust,
  family-unlink, ai-revoke, engine-unproject, league-tick, seed-demo) keep working while jgapps exists. Before jgapps is retired, each
  needs a Python twin or a one-off node container that runs it against the same DB. The SQL switches (`ai-*.sql`) are stack-agnostic.

### 6.7 Backups and rollback

- Route flips change no schema and no data; the daily dump stays as is. Take an extra dump before each wave that moves a write group
  (cheap insurance, the same command as a release).
- A rollback leaves the rows FastAPI wrote; TS must read them as its own (guaranteed by the DB-state parity in 5.8). A wrong ledger row
  found after a flip is fixed by a compensating write (`scripts/coins-adjust.ts` exists), not by restoring a dump.

### 6.8 Watching a flip

jgedge logs JSON access lines (path, status, upstream, duration) to stdout with `json-file` rotation (1 MB x3, as whisper). A `jg-watch.sh
<group> <minutes>` prints per-upstream 5xx count and p50/p95 for the group, before and after. Roll back at once on any new 5xx class, a
p95 over 2x the TS baseline, or any client error the walks never saw.

---

## 7. Sharing the database during the transition

1. **One database, one schema, one migration owner.** `drizzle/` + `scripts/migrate.mjs` stay the only way the schema changes until the
   TS backend is retired (the TS container runs it at `npm start`, `package.json:12`). FastAPI never migrates, never runs Alembic
   autogenerate against `jgapps`; its table models are generated from the live schema and checked by a test that compares them with
   `information_schema` (reuse `schema-diff.mts`'s idea).
2. Any schema change during the port lands in TS first (drizzle migration, additive, both stacks compatible), then in the Python models.
   Prefer a schema freeze while groups are moving.
3. After TS retirement: keep running `node scripts/migrate.mjs` in a one-off `node:22-bookworm-slim` container as a deploy step
   (zero-risk, keeps `drizzle.__drizzle_migrations` history), or port the runner with the same hash/journal bookkeeping. Do not start a
   second history table.
4. Same locks, same keys (4.3). Same transaction boundaries for the writes that make up a ledger entry.
5. Same "now" source per place: where TS uses JS time, Python uses its clock seam; where TS uses SQL `now()`, Python uses SQL `now()`.
   Moving a timestamp from one source to the other changes walks and day boundaries.
6. Same NOTIFY payloads on `jg_chat` (the wire type in `hub.ts`, max 7,000 bytes then a reference) while both stacks run.
7. Same JSONB shapes, enum values, and nullability on write; the DB-state diff is the check.
8. Shared host folders for `MEDIA_DIR` and `VIDEO_DIR`, mounted into both backends.
9. Separate databases for the two test suites: `vitest` keeps `TEST_DATABASE_URL`, pytest gets its own, the harness uses `jg_par_*`
   twins (the walks and tests already collide on a shared dev DB today).

---

## 8. Proposed flip order (the controller decides; rationale for each)

| Wave | Groups | Why here |
|---|---|---|
| 0 | none; jgedge in front of jgapps, everything to jgapps; jgapi deployed dark | proves the edge, client IP, headers, SSE through two hops, blue/green, with zero behaviour change |
| 1 | groups whose switch is OFF in production and whose surface answers 404 there: `listening`, `video` (+ `/media/listening/*`) | no real student reaches them; a full rehearsal of flip + rollback on live traffic shape |
| 2 | read-mostly, no coins: `explore`, `checkpoints`, `homework` (GET), `milestones`, `photo` (GET), `score-reports` | small, GET-heavy; the production-snapshot sweep is meaningful |
| 3 | `me`, `state` (the JIA state round trip the smoke checks: `tests/smoke/run.ts`, "state did not come back from the server"), `parent`, `family` | many users, simple writes; family codes are bound ids |
| 4 | the engine core and anything that writes coins/ledger: `engine`, `tasks`, `coins`, `checks`, `phase-d`, `proofs`, `outcomes`, `study`, `mock` | only after both 14-day walks are DB-state clean in tee mode |
| 5 | `lessons` (incl. the `hint` stream), `ai` (streams, Anthropic outbound parity), then the AI worker | most code and money-adjacent quotas |
| 6 | `staff`, `register` (scrypt + rate limits) | low traffic but security-relevant |
| 7 | frontend: all page paths + `/d/*` + `/runtime/*` + `/_next/*` + `/media/*` together, canary first | pages and their assets must come from one server: old and new pages load the same asset paths, so they cannot be split by path |
| 8 | `/api/auth/*` and `/api/health`; retire jgapps | auth last: Google/Telegram callback URLs are registered externally; cookies must stay byte-compatible |

**M1/M1b groups** (achievements, blocks, chats, community, core, games, leads, league, motivation, notes, pay, plans, pledges, privacy,
reports) are not in production at all. Two options for the owner/controller: (a) deploy M1 on TS first (as built and gated), then convert;
(b) never ship M1 on TS and launch it directly on FastAPI, with the TS code as the parity oracle on dev. (b) saves a TS deploy cycle but
couples the M1 launch to the conversion's risk; the switches would still be off at launch either way. `chats` needs its own single-process
service (`jgapi-rt`) because of the in-process hub and presence.

---

## 9. Port notes for the build lanes

- P1. Port HEAD `8a1582d9` (M1b), not PLAN `ddbf9d81`; production is `c6b7372f` at migration 0038.
- P2. Never let FastAPI's default validation (422) or `redirect_slashes` (307) answer; reproduce the routes' own 400/413 bodies and Next's
  308. Decide OPTIONS/HEAD behaviour against the recorder's evidence.
- P3. Body caps before reading (413), as `src/server/limits.ts` `readText`/`readBytes`; client IP via `CLIENT_IP_HEADER`, else last XFF.
- P4. `js_round()` instead of `round()`; JS-compatible `toISOString`, `toFixed`, `String(number)`; ICU collation where TS uses
  `localeCompare`; preserve object key order; omit keys TS leaves `undefined` instead of emitting `null`.
- P5. Same advisory-lock keys and `for update` / `skip locked` statements, same transaction scope.
- P6. One `now()` seam honouring `JG_WALK_AT` / `JG_WALK_AT_FILE` outside production; SQL `now()` where TS uses SQL `now()`.
- P7. Test-only switch endpoint `POST /__test/switch` (and the same on TS for the R-test adapter), mounted only with `JG_TEST_ENDPOINTS=1`
  and on 127.0.0.1; a test asserts it is absent in the production build.
- P8. Read Auth.js JWE cookies (both cookie names) with `AUTH_SECRET`; a mint function for tests only.
- P9. scrypt verify with the same `canonical()`; rehash rules unchanged (`src/lib/password.ts:11`).
- P10. Security headers of `next.config.ts` `headers()` on every FastAPI response (or added by jgedge for FastAPI paths; pick one, test it).
- P11. Chat: identical NOTIFY wire, `<boot>.<seq>` ids, ring 2,000, `resync`, heartbeat 20 s, `retry: 3000`, `x-accel-buffering: no`;
  one process serves streams.
- P12. Workers behind a FastAPI env flag; a TS env flag to turn its own workers off without turning the layer off
  (today `AI_LAYER=1` both enables the routes and starts the worker, `src/instrumentation.ts:14-16`).
- P13. Images: sharp vs Pillow/pyvips output differs by bytes; keep EXIF/GPS stripping and size bounds, compare by properties.
  ffmpeg in the image if community video moves.
- P14. Base-URL seams for every upstream (Anthropic, Telegram, R2, Whisper) so the fakes can sit under both stacks.
- P15. Content JSON stays the shared data (19 MB); load once per process; memory is measured, not guessed.
- P16. `tzdata` in requirements; containers stay UTC.
- P17. No schema change in Python; models checked against `information_schema` in CI.
- P18. The 38 source-scan tests become Python static scans or are retired with a written reason.

---

## 10. Hard parts

1. **ID binding across replay**: later requests carry ids minted earlier (users, tasks, chats, family codes, orders). The binder must be
   right or every diff after the first id is noise. Tee mode plus a strict "bind once, then agree" rule is the defence.
2. **Time**: two clock sources (63 JS `new Date()`/`Date.now()`, 126 SQL `now()` in `src/server`), a walk clock that only moves JS time,
   and day boundaries in Asia/Tashkent. Offline replay cannot reproduce SQL `now()`; only tee mode is authoritative.
3. **JS numeric and string semantics** in coin/score code (section 5.7). One `round()` in the wrong place changes balances silently.
4. **Key order and number shape** in JSON the design's imperative JS consumes; a Pydantic default can reorder what a screen lists.
5. **Streams**: SSE with per-recipient fan-out and reconnect; AI text streams; byte ranges; all through two Caddy hops.
6. **The in-process TS tests (D, 188 files, 22.7k lines)** have no HTTP surface; their value transfers only through parity, so parity
   coverage per group must be proven, not assumed.
7. **The 14-day lessons walk** is the strongest behavioural test and calls TS functions in-process; its HTTP mode is real work.
8. **The box**: 5.7 GB disk, unmeasured RAM, a shared Postgres, a single-file Caddyfile mount, VM power-offs, no Docker on the PC.
9. **Client IP through a new hop**: without `CLIENT_IP_HEADER`, sign-in/register rate limits collapse into one bucket (mass 429).
10. **Auth**: the JWE decrypt must be exact or every user is logged out at the moment `/api/v1/*` moves; test with a cookie minted by the
    live TS code path, not only by our own mint.
11. **Frontend assets cannot be split by path** between old and new pages; the frontend flips as one unit.
12. **M1 never ran in production**: parity proves FastAPI == TS on dev, not that M1 is right with real users.

---

## 11. Estimate (one agent, ~8 focused hours per day)

| Work | Agent-days |
|---|---|
| Route manifest + coverage report | 0.5 |
| Record/tee proxy (JSON, SSE, text streams, ranges, binary blobs) | 1.5 |
| Normaliser, id binder, differ (FAIL/ORDER/NOTE), report | 2.0 |
| Twins + DB dump/diff | 1.0 |
| Outbound fakes (Anthropic incl. streaming, Telegram, S3/R2, Whisper) + Payme/Click callers | 1.5 |
| Clock + test-switch endpoint integration (the seams themselves are the backend lanes') | 0.5 |
| R-test HTTP adapter, all 66 files green against TS over HTTP | 2.0 |
| Golden corpus exporter + pytest loader for E | 2.0 |
| Content validator parity | 0.5 |
| `real-page.ts` / boot retarget for FD + BD | 1.0 |
| lessons-walk HTTP mode + study-walk, uz-marks-walk, caps-wrap/p4a fakes, chat-load on FastAPI | 2.0 |
| Production-snapshot GET sweep (box-only, privacy-safe) | 1.0 |
| Gate kit for the new stack (pytest in parts, typecheck/lint, both builds, fidelity, walks, parity chains) | 1.5 |
| Ops: jgedge, compose, release-in-place for Python and frontend, blue/green, `jg-route.sh` + canary, main Caddy change, watch script, rehearsal on the box, DEPLOY.md v2 | 3.0 |
| Executing the waves (flip, watch, roll back if needed), spread over the transition | 2.0 |
| TS retirement: ops scripts, migration runner decision, cleanup | 1.0 |
| **Total for this lane** | **about 23 (range 18-30)** |

Not included: porting the D-bucket business-rule cases to pytest (inside each backend lane, roughly 0.3 agent-day per 1,000 lines of TS
test ported; doing all 22.7k lines would be about 7 agent-days, a selective port about 3). Calendar time is longer than agent time:
every production step needs the owner's word, and a full gate pass on this PC takes 3-4 hours of machine time.

---

## 12. Unknowns (could not be checked read-only)

- Box: free RAM, `max_connections` and current connections, Caddy version and the caddy container's mounts, whether Caddy writes access
  logs, size of `/opt/jgapps-backups`, whether `CLIENT_IP_HEADER` is set in `/opt/jgapps/.env`.
- Whether Next answers HEAD for every GET route in this setup (the recorder will show it).
- The Auth.js cookie name actually set in production (expected `__Secure-authjs.session-token` behind https).
- Python CPU cost of the engine on the box (rehearsal measures it).

## 13. On FastAPI vs Django REST

From this lane's side the choice is right: async SSE and `LISTEN/NOTIFY` (asyncpg), streaming responses, Pydantic for the zod shapes,
and the box already runs a FastAPI app (exam) and a Python service (whisper). Two cautions rather than a disagreement: (1) Pydantic and
Starlette defaults (422, 307, field order, `null`, float repr) work against byte-level parity and must be switched off deliberately;
(2) the engine is CPU-bound, so one async worker per container will queue under load; plan thread/process offload and measure. Django REST
would not remove either problem and would add a second ORM's opinions on a schema that Drizzle owns.
