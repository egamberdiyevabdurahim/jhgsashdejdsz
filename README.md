# Jamals Global — new stack (FastAPI + Next.js/React)

The converted Jamals Global apps: a **FastAPI** backend (Python 3.11) and a **Next.js 15 / React 19** frontend, with the
parity harnesses that prove each piece against the current app. This repository holds only the new code. It was assembled
on 21 Oct 2026 from the four foundation lanes of the conversion (cut from the legacy repo's m1-main `ddbf9d81`), without
their history:

| Lane | Legacy branch @ commit | What it brought here |
|---|---|---|
| engine golden | `mig-engine-golden` @ `5a1600f0` | `golden/`, `tools/golden/`, `backend/app/engine/` (the Python engine port), `backend/tests/engine/` |
| contract | `mig-contract-rec` @ `21459aee` | `contract/`, `tools/contract/` |
| backend skeleton | `mig-backend-skel` @ `917e10c2` | the rest of `backend/` (FastAPI app, 113 table models, Alembic baseline `d0050`, Auth.js cookie reader, 3 ported routes) |
| frontend proof | `mig-frontend-poc` @ `b4055178` | `frontend/` |

Plus two copies of legacy content at `ddbf9d81`: `data/engine/` (= `src/engine/data`) and the design files the frontend serves
(`frontend/public/d`, `frontend/public/runtime`, `frontend/web` = `public/d`, `public/runtime`, `web/`).

**The live system is still the legacy app, `jamals-global-apps`** (Next.js + Drizzle, production on ServerCore `/opt/jgapps`,
app.jamals.uz) **until cutover.** Nothing here is deployed. The plan for getting there is `docs/MIGRATION-PLAN.md`.

## Layout (about 80 MB in all; the largest file is 5 MB)

| Path | Size | What |
|---|---:|---|
| `backend/` | 0.3 MB | FastAPI app (`app/`), models generated from the Drizzle schema (`app/models/`, `tools/gen_models.py`), Alembic (`alembic/`, baseline `d0050` = Drizzle 0050), the engine port (`app/engine/`), tests. Start at `backend/README.md`. |
| `frontend/` | 23 MB | Next.js App Router app: `/signin` and the student `/app` shells in React, the legacy bridge, the html2jsx generator, the pixel fidelity gate. Start at `frontend/PORTING.md`. Of the 23 MB, 22.4 MB are the committed design files (`public/d`, `public/runtime`, `web/`). |
| `data/engine/` | 17 MB | The engine's static data (banks, content, rules): the legacy `src/engine/data`, read by `backend/app/engine/data.py`. |
| `golden/` | 31 MB | Engine golden fixtures: 41,504 cases in 12 modules, recorded from the TypeScript engine (`golden/README.md`). |
| `tools/golden/` | 0.1 MB | The TypeScript generators of those fixtures (run against the legacy checkout, below). |
| `contract/` | 7.5 MB | HTTP contract: 18 recordings (3,636 `/api/v1` exchanges), the seed (`seed/seed.sql`), `COVERAGE.md`, `shapes.json` (`contract/README.md`). |
| `tools/contract/` | 0.1 MB | Recorder proxy, drivers, normaliser, replayer, `authjs_cookie.py`. |
| `docs/` | 1.0 MB | `MIGRATION-PLAN.md` (+ the owner's Uzbek one-pager), the inventories `inv-*.md`, `box-facts-P0.2.md`, and `lanes/`: each lane's ledger (what it proved, what it left open) and the frontend gate's per-case results. |

## The legacy checkout (`JG_LEGACY_DIR`)

The TypeScript reference parts need the old app, which is **not** copied here: the golden generators run its engine, the
contract recorder and `prove.mjs` run its server, the frontend falls back to it for every route not ported yet, and the
fidelity gate compares against it. Point them at a checkout of the legacy repo with `JG_LEGACY_DIR` (default everywhere:
a sibling folder named `Jamals Global`, i.e. `C:/Users/PC/Jamals Global` next to this repo). It needs its own
`node_modules` (`npm ci` there) and, for anything that starts its server, its `.env.local` and a local Postgres.

The frontend's two boot routes (`GET /api/v1/boot`, `GET /api/v1/boot/signin`, plus `src/server/head-tags.ts`) were added to the
legacy app on `mig-frontend-poc` (`b4055178`) and are not on m1-main: the legacy server the frontend talks to must include them
(until the FastAPI backend serves them).

## Run

### Backend tests
```
cd backend
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"            # FastAPI stack + the engine's tzdata/regex + pytest
.venv/Scripts/python -m pytest tests/engine -q              # engine golden parity: 104 passed, 4 skipped (unported content fns)
.venv/Scripts/python -m tests.engine.report                 # the parity table per module
.venv/Scripts/python -m pytest -q --ignore=tests/test_models_match_db.py   # everything that needs no database
```
- `tests/test_models_match_db.py` needs `DATABASE_URL` on a Postgres migrated by Drizzle to 0050 (the legacy `npm run db:migrate`).
- `tests/test_cross_stack.py` is skipped unless `JG_TS_URL` names a running legacy app on the same database (`backend/README.md`).
- `tests/test_jwe.py` runs `@auth/core` through node from the legacy checkout's `node_modules` (skipped when it is missing).
- Settings are read from `.env.local` at this repo's root, then `backend/.env`, then the environment (never committed).

### Frontend build
```
cd frontend
npm ci
npx tsc --noEmit
npx next build                  # or: npm run build
npm start                       # next start -p 3235; JG_BACKEND (default http://localhost:3234) = the legacy app for the fallback routes
```
The design files are committed; `JG_LEGACY_DIR=… node scripts/sync-design.mjs` refreshes them after a design change in the
legacy repo (byte compare; `--prune` also deletes what the legacy repo no longer has). Commit what it copies.

### Fidelity gate (frontend vs. today's pages, 0.000 % or the port is not done)
1. Legacy app on 3234: in `$JG_LEGACY_DIR` (with the boot routes above), `ENGINE_LIVE=1 npx next dev -p 3234` on a scratch dev database.
2. This app on 3235: `cd frontend && npm run build && npm start`.
3. `cd frontend && JG_LEGACY_DIR=… npx tsx tests/fidelity-react.ts` (`FID_ONLY=signin|app` for one half; `SMOKE_CHROME` = a
   chrome-headless-shell binary). Report in `frontend/tests/out/fidelity/` (ignored). `scripts/rebuild-and-gate.sh` does 2 and 3.

### Engine fixtures (regenerate after a TS engine change)
```
cd "$JG_LEGACY_DIR"                                   # the legacy checkout at the engine head to record
npx tsx <this repo>/tools/golden/run.ts [module ...]  # writes <this repo>/golden/engine; then git diff golden/ here
```
Run from the legacy checkout so its `tsconfig.json` maps `@/` to its `src/`. Checked on 21 Oct 2026: run from this repo
against the lane's checkout, `dates`, `pipeline` and `homework` came out byte-identical to the committed fixtures.

### HTTP contract (replay a recording against a backend)
```
node tools/contract/db.mjs restore jg_ctr_<name>_dev                   # scratch DB from contract/seed/seed.sql (jg_ctr_*_dev only)
node tools/contract/replay.mjs contract/recordings/<x>.jsonl --base http://localhost:<port> --db jg_ctr_<name>_dev
node --test tools/contract/normalise.test.mjs                          # the normaliser's own tests (no database)
```
`contract/README.md` has the backend environment a replay needs (clock, seed, switches, the dev-only auth secret). The tools
take `postgres`, `@auth/core`, `next` and `tsx` from the legacy checkout's `node_modules`; recording (`record.mjs`, `prove.mjs`)
also starts the legacy server there.

## Rules carried over
- The owner's designs are the product: a port changes who builds the DOM, never the DOM (`frontend/PORTING.md`).
- The engine port is held to the fixtures case by case; a divergence is written down with its reason (`backend/tests/engine/divergences.py`).
- A route is ported when every recording that touches it replays with 0 diffs (`contract/COVERAGE.md` lists them).
- Until cutover Drizzle owns the schema: a Drizzle migration in the legacy repo means regenerating `backend/app/models` and a new Alembic revision.
- No secrets in the repo: `.env*` files are ignored; the only auth secret in it is the contract's public dev-only constant (`tools/contract/env.mjs`).
