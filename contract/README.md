# The /api/v1 HTTP contract: record and replay

The FastAPI backend must answer every `/api/v1` request exactly as the TypeScript backend does (same contract, nobody logged out, no data
change). This folder is the executable form of that contract: **recordings** of real request/response pairs made against the TypeScript
backend, a **seed** they start from, and a **replayer** that re-issues them against any backend and diffs the answers after normalising
what may legitimately differ between two runs (ids, tokens, timestamps).

In this repo (jamals-global-prod) the TypeScript backend is the legacy repo's app, which is not copied here: `tools/contract/env.mjs`
`LEGACY` = `JG_LEGACY_DIR` (default: the sibling folder `Jamals Global`). The tools take `postgres`, `@auth/core`, `next` and `tsx`
from its `node_modules`, `serve.mjs` starts its `next dev`, `record.mjs` runs its `tests/smoke/*.ts` walks, `db.mjs seed` runs its
migrations and seed scripts; recordings, the seed and reports stay here. Run every command below from this repo's root.

```
contract/
  seed/seed.sql          the database every recording starts from (pg_dump of jg_ctr_seed_dev: all 51 migrations of ddbf9d81, 113 tables, the demo family and the ctr-* accounts; `db.mjs restore` rebuilds it, same rows)
  seed/accounts.json     the seeded accounts: alias -> {email, id, role} (password for all: "correct horse battery", localhost only)
  recordings/*.jsonl     one file per session: <profile>-<sweep|walk>.jsonl
  normalise.json         per-route rules: arrays compared as sets, paths ignored (empty until a real need shows up)
  COVERAGE.md            route x method coverage of the corpus (node tools/contract/coverage.mjs)
  .run/                  gitignored: logs, pids, replay reports, walk screenshots
tools/contract/
  env.mjs        ports, scratch DB names (jg_ctr_*_dev only), the dev-only auth secret, the switch profiles, the server env, the clock
  db.mjs         seed | copy <db> | restore <db> | drop <db>
  serve.mjs      start <profile> <db> | wait [url] | stop        (next dev :3461 + the recording proxy :3460, detached, by PID)
  proxy.mjs      the recorder (reverse proxy; /__contract/session and /__contract/end open and close a session file)
  sweep.mjs      every route x method, anonymous and as each seeded account, {} bodies and missing ids, then learned ids
  record.mjs     <profile> <sweep|walk ...>: per session a fresh seed copy + a fresh server, the walk through the proxy, its SQL merged
  sqltap.mjs     preloaded into a walk: its own database writes become {type:"sql"} lines, replayed in place
  clock.cjs      preloaded into the server: Date starts at CONTRACT_CLOCK (2026-10-21T04:00Z, 09:00 Tashkent) and runs on;
                 Math.random, crypto.randomInt, randomBytes and randomUUID draw from a generator per request, seeded with
                 CONTRACT_SEED + method + path (ids folded) + that key's ordinal (same requests in the same order, same questions)
  flows.mjs      the API's happy paths over HTTP: register, diagnostic, CAT checks, tasks, lessons, study, family link, parent; M1 in "all"
  shapes.mjs     writes contract/shapes.json: request/response shapes per route x method x status (a start for Pydantic models)
  normalise.mjs  the comparison rules
  replay.mjs     <recording ...> --base <url> [--db <scratch db>] [--only <path prefix>] [--clock none]
  prove.mjs      replays recordings against the TypeScript backend on a fresh copy each (the 0-diff proof)
  coverage.mjs   writes contract/COVERAGE.md
```

## Recording format (one JSON object per line)

| type | fields |
|---|---|
| `meta` | `name`, `profile` (off / prod / all), `switches` (the env switches on), `seed`, `base` (the origin the recording was made on), `clock` (CONTRACT_CLOCK), `rng` (CONTRACT_SEED), `recordedAt`, `code` (git head), `walk` {name, exit, ms, sqlWrites, untrackedDbWrites} |
| `alias` | `alias`, `email`, `uid` (the id in this recording), `seeded` (true: the account is in seed/accounts.json) |
| `http` | `seq`, `at` (real ms), `alias` (null: no session), `method`, `path`, `query`, `headers` (content-type, accept*, range, if-*, origin, referer, x-*), `cookies` (non-auth only), `body` ({json} / {text} / {b64,len,sha256} / {bin} over 2 MB), `status`, `resHeaders`, `setCookies` (names only), `res` (same shapes, or {stream:true} for SSE), `ms` |
| `page` | like `http`, for a page GET (/app, /parent, /join/<code>, /signin): `res` = {boot: the page's JG_BOOT object, len, sha256}; replayed for its writes and its ids, compared on status, redirect and boot |
| `sql` | `seq`, `at`, `query`, `params`: a write the walk made straight in the database (a fixture), replayed at that point with `--db` |
| `stream-end` | `ofSeq`, `afterSeq`: the SSE stream opened at `ofSeq` was closed after request `afterSeq` (the replay closes its own then) |

No cookie value, token or `.env.local` value is written. The session cookie becomes the alias; the replayer mints a fresh one.

## Who is signed in

Auth.js v5 keeps the session in a JWT cookie, `authjs.session-token` on http (`__Secure-authjs.session-token` on https): a JWE, `alg: dir`,
`enc: A256CBC-HS512`, the key HKDF-SHA256(secret = AUTH_SECRET, salt = the cookie name, info = `Auth.js Generated Encryption Key (<cookie name>)`,
64 bytes), `kid` = the key's JWK thumbprint; the payload carries `uid` (the user id), `sub`, `email`, `name`, `iat`, `exp`, `jti`. Routes also
require `x-jg-uid` to equal that id (409 otherwise). The contract runs sign with the public dev constant `CONTRACT_AUTH_SECRET` in env.mjs.
**A FastAPI backend that decodes this cookie with the production AUTH_SECRET keeps every live session at cutover**: tools/contract/authjs_cookie.py
does it in 60 lines of Python (only `cryptography`; checked against a cookie minted by `@auth/core/jwt` itself, and a wrong secret is refused); the replay proves it on the
dev secret, because every replayed request carries a cookie minted by `@auth/core/jwt` itself.

## How a FastAPI lane uses it

1. A scratch database from the seed: `node tools/contract/db.mjs restore jg_ctr_fastapi_dev` (or `copy` when jg_ctr_seed_dev exists). Fresh for
   every recording: replays write.
2. Start the FastAPI server against it with the recording's state:
   - `DATABASE_URL` = that database; `AUTH_SECRET` = `CONTRACT_AUTH_SECRET` (env.mjs);
   - the switches in the recording's `meta.switches` (the same names: ENGINE_LIVE, PHASE_D, LESSONS, MESSENGER, ...), everything else off;
   - `STAFF_USER_IDS` = the `ctr-staff` id from seed/accounts.json; `JG_QUIZ_READ_MS=0`; the AI and Whisper fakes (AI_FAKE=1, WHISPER_FAKE=1)
     and no external sender (no Telegram, Anthropic, Google, R2); every `RATE_*` limit at 100000 (env.mjs `serverEnv` lists all of it);
   - its clock starting at `meta.clock` (CONTRACT_CLOCK) and running on: the TypeScript server's `Date` does, through clock.cjs; in Python, a
     dev-only startup hook (e.g. `time_machine.travel(CONTRACT_CLOCK, tick=True)`) behind an env var. Postgres `now()` stays real on both.
   - its randomness: the TypeScript server draws the CAT's item choice, option shuffles and family instances (numbers in a question) from
     a per-request mulberry32 stream (clock.cjs). A FastAPI port of the checks / quiz / homework / practice routes either reproduces that
     stream (seed string `${meta.rng}|${METHOD} ${path with ids folded to *}|${ordinal}`, same draw order) or the lane accepts diffs on
     those routes and lists them in contract/normalise.json "ignore" with the reason. Ids and tokens need nothing: they are paired.
3. `node tools/contract/replay.mjs contract/recordings/prod-sweep.jsonl --base http://localhost:8000 --db jg_ctr_fastapi_dev`
   (`--only /api/v1/lessons` to look at one router while it is being ported; the report goes to contract/.run/replay-<name>.json with each
   diff's JSON path, the recorded value and the replayed one; exit 1 on any diff).
4. A route is ported when every recording that touches it replays with 0 diffs. Begin with `off-sweep` (the refusals), then `prod-*`, then `all-*`.

Run the TypeScript side the same way to see what "0 diffs" looks like: `node tools/contract/prove.mjs contract/recordings/*.jsonl`.

## The proof on the TypeScript backend

`node tools/contract/prove.mjs contract/recordings/*.jsonl` replays every recording on a fresh copy of the seed and a fresh server under
the recording's profile, clock and seed; `node tools/contract/coverage.mjs --replays` writes the result table into COVERAGE.md. On
21 Oct 2026 every recording but one replayed with 0 diffs (the table there). The one: prod-p1 #14, a quiz started 260 ms after an
unlock commit, draws another item on replay (with and without `--pace`): a race with the background work that commit starts. The
same routes replay exactly in prod-flows / all-flows. What it took to get to 0, and what a FastAPI target must therefore also do:

- the clock (CONTRACT_CLOCK) and the per-request random stream (CONTRACT_SEED): without them the CAT and quizzes draw other questions
  and every later snapshot differs;
- SSE streams kept open exactly as long as the walk kept them (chat presence counts open streams);
- ids percent-encoded in paths (`/chats/dm%3A<id>/messages`) rewritten like any other;
- page boot data (JG_BOOT) replayed for its writes and its ids (the family code a student's /app carries is what the parent joins with);
- a page line naming the time of day ("Updated today, 09:01") within 3 minutes.

## What the normaliser accepts as "the same"

- **Ids and tokens**: any token-like string (uuid, nanoid, hex, base64url) or a field named `*id` / `*code` / `*token` / ... that differs is
  paired, recorded X with replayed Y, and the pair must hold both ways for the whole session (X later answered as Z is a diff). Later
  requests are rewritten through the pairs (a recorded `/chats/X` is sent as `/chats/Y`; a registered account's `x-jg-uid` and cookie follow it).
- **Times**: ISO date-times and epoch numbers in time-named fields are equal, or both made during their own run, or the same distance from
  their own request's "now" (within 3 min); dates (YYYY-MM-DD) compare as day offsets from the request's local day (Asia/Tashkent).
- **Headers** compared: content-type (media type only), cache-control, location, content-disposition, retry-after, content-range,
  accept-ranges, allow, www-authenticate, x-frame-options, x-content-type-options. Not compared: vary, etag, set-cookie values, x-powered-by.
- **Bodies**: JSON field by field (key order free, array order kept unless normalise.json lists the path as a set); text as a string;
  binary by sha256; SSE by status and content type only (the events are not compared).

## What is not in the contract (yet)

- SSE event content (chat stream), and uploads over 2 MB (kept as a hash, not replayable).
- Pages are kept as status + redirect + JG_BOOT only (the HTML around the boot is the design's, pinned by the fidelity gate); /api/auth/*
  (sign-in, sign-out, csrf) is passed through unrecorded: a replay mints its sessions instead of signing in.
- 58 route x method pairs have only refusals recorded so far (COVERAGE.md, column 2xx = no): staff video/billing/moderation writes, the
  AI routes, lessons writing/speaking/watch/hint, listening and video files, photo upload, pay checkout (no FX rate in the seed),
  outcomes, proofs, community posts (a community profile handle first). Add them to flows2.mjs as the lanes reach those routers.
- The vitest route tests call handlers in-process (no HTTP), and the lessons walk's `days` step calls server functions in-process: neither
  passes the proxy. Their behaviour is the engine-golden lane's (mig-engine-golden).
- A walk that opens its own `postgres()` client (community-walk, community-client-walk, mod-walk) writes fixtures sqltap cannot see: those
  recordings carry `meta.walk.untrackedDbWrites: true` and are not in the replayable set.
