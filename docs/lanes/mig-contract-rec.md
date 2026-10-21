# mig-contract-rec — HTTP contract record/replay (lane "contract")

Worktree C:/Users/PC/jg-p4g-2, branch mig-contract-rec from ddbf9d81 (21 Oct 2026), head 21459aee. Committed, not pushed. Start at contract/README.md.

RESULT: 18 recordings, 3,636 /api/v1 exchanges + 118 page GETs replayed against the TypeScript backend on fresh seed copies:
3,635 same, 1 differs (prod-p1 #14, a timing race), 118/118 pages same, 21/21 walk SQL fixtures re-run. All 155 route x method pairs
in the corpus, 97 with a 2xx.

## What exists (all in the repo)
- tools/contract/
  - env.mjs: ports (proxy 3460, next dev 3461), scratch DB names (jg_ctr_*_dev only, anything else refused), the dev-only auth secret,
    switch profiles off / prod (as deployed 20 Oct) / all (every switch incl. M1), the server env (fakes on, every external sender blank,
    rate limits raised, the clock and seed).
  - db.mjs: seed | copy | restore | drop. serve.mjs: start/wait/stop by PID.
  - proxy.mjs: the recorder. sweep.mjs, flows.mjs, flows2.mjs: drivers. record.mjs: one session = fresh seed copy + fresh server.
  - sqltap.mjs: a walk's own DB writes become {type:"sql"} lines that the replay re-runs.
  - clock.cjs: server Date from CONTRACT_CLOCK, plus Math.random / randomInt / randomBytes / randomUUID from a per-request seeded stream
    (AsyncLocalStorage).
  - normalise.mjs (+ normalise.test.mjs, 7 tests), replay.mjs, prove.mjs, coverage.mjs, shapes.mjs.
  - authjs_cookie.py: decodes the Auth.js session cookie in Python (HKDF + A256CBC-HS512); checked against an @auth/core-minted cookie.
- contract/: README.md, seed/seed.sql (pg_dump, 327 KB) + accounts.json, recordings/*.jsonl (18, ~6 MB), COVERAGE.md (per route, plus
  the replay table), shapes.json (request/response shapes per route x method x status).

## Corpus
- 18 recordings, 3,636 /api/v1 exchanges, plus 100+ page GETs with their JG_BOOT. All 155 route x method pairs covered (HEAD aside);
  97 of them with a 2xx. Profiles off / prod / all.
- Sessions: off/prod/all sweeps (every route x method, anonymous + 6 seeded accounts), prod/all flows and flows2 (HTTP happy paths),
  walks run, first-run-walk, p5int-walk, study-walk (21 SQL fixtures), chat-walk, core-walk, m1-league-walk, m1-dates-walk (all pass),
  and p1, checks-walk, student-loop (they fail midway on current code; what they recorded is valid).

## Proof (replay against the TypeScript backend, fresh seed copy + fresh server per recording)
- 0 diffs in every recording except prod-p1 (1 of 12: a quiz started 260 ms after an unlock commit draws another item on replay, with
  and without --pace: a race with that commit's background work; the same routes replay exactly in the flows). Pages: all same.
- Table: contract/COVERAGE.md "Replays against the TypeScript backend".
- What it took (what a FastAPI target must do too): the clock and the per-request random stream; SSE streams kept open as long as
  recorded; ids inside percent-encoded paths; page boot data replayed for its writes and ids; "Updated today, 09:01" within 3 min.

## For the FastAPI lanes (copy this)
1. node tools/contract/db.mjs restore jg_ctr_<lane>_dev   (or copy, when jg_ctr_seed_dev exists)
2. Run FastAPI on it with AUTH_SECRET = CONTRACT_AUTH_SECRET (env.mjs), the recording's meta.switches, STAFF_USER_IDS = ctr-staff id,
   JG_QUIZ_READ_MS=0, fakes on, RATE_* high, clock from meta.clock (and the meta.rng stream for checks/quiz/homework/practice).
3. node tools/contract/replay.mjs contract/recordings/<x>.jsonl --base http://localhost:<port> --db jg_ctr_<lane>_dev [--only /api/v1/<router>] [--no-pages]
4. A route is ported when every recording touching it (COVERAGE.md lists them) replays with 0 diffs.
- Session cookie: tools/contract/authjs_cookie.py is the decode to port into FastAPI's auth dependency (then x-jg-uid == uid).
- shapes.json is a start for the Pydantic models; the recordings stay the authority.

## Not done / limits
- SSE event content is not compared (only status + content type; stream lifetimes are kept).
- vitest route tests: 47 files import route handlers directly and 44 of them vi.mock their dependencies: not real-backend contract; not recorded.
- The lessons walk (days step) calls server functions in-process; walks with their own postgres() client (community-walk, mod-walk)
  write fixtures sqltap cannot see: not recorded.
- 58 route x method pairs have only refusals recorded (no 2xx): staff video/billing/moderation/checkpoints writes, AI routes (consent,
  precheck, prepare, sample), lessons writing/speaking/watch/hint, listening/video files, me/photo upload, pay checkout (no FX rate in
  the seed), coupons/gifts, outcomes, proofs, community posts (need a community profile handle first), club topics. See COVERAGE.md.

## Environment notes
- node_modules: this worktree's own was stale (4 Oct, no ts-fsrs): moved to node_modules.stale-oct4 (listed in .git/info/exclude) and
  junctioned to C:/Users/PC/jg-p5i/node_modules (same package-lock as ddbf9d81).
- backend/.venv (py 3.11, cryptography only) exists in this worktree for authjs_cookie.py; gitignored.
- Scratch DBs left on :5433: jg_ctr_seed_dev, jg_ctr_rec_dev, jg_ctr_rep_dev (drop with db.mjs drop).
