# Jamals Global: the conversion plan (FastAPI backend, Next.js/React frontend)

Final plan, written 21 Oct 2026 by the judge lane. It merges three independent plans in this folder (`plan-risk.md`,
`plan-speed.md`, `plan-team.md`) on top of the inventories (`inv-*.md`, `inv-api.json`) and the four started lanes (`mig-*.md`).
Read-only work: nothing in `C:/Users/PC/jg-plan`, any worktree, or on the box was changed.

Citations: `inv-*.md:line`, `mig-*.md:line` and `plan-*.md:line` point into this folder. A bare `path:line` points into
`C:/Users/PC/jg-plan` (m1-main `ddbf9d81`). `jg-p5i:` means `C:/Users/PC/jg-p5i` (m1-main tip `8a1582d9`), read with read-only git.

The companion one-pager for the owner, in Uzbek: `MIGRATION-PLAN-owner-uz.md`.

[critic] A completeness critic read this plan against the inventories and the code on 21 Oct 2026 and edited it in place.
Every addition is marked `[critic]`. `m1-main:` means `git show 8a1582d9:<path>` in `C:/Users/PC/jg-p5i` (read-only git).
The summary is §0.4; what is still open is §14. **The Uzbek one-pager still shows the old dates and the old D1; it must be
regenerated from §0.4 and §12 before the owner reads it.**

---

## 0. Verdict

### 0.1 Scores (0-10)

| Criterion | risk | speed | team | Why the scores differ |
|---|---:|---:|---:|---|
| Production safety | **9** | 7.5 | 7.5 | risk: one group per window, rollback pre-authorised, resting states, per-family engine flips. speed: one B-Day for every live group, auth and pages 30 min apart, Node stopped at F+3, all engine families flipped on one day (`plan-speed.md:571-578`). team: Alembic takes over at W0 while Node still serves everything (`plan-team.md:387-393`) |
| Speed to finish | 5 | **8.5** | 4 | risk: 55 working days, six production waves each with a 24 h canary (`plan-risk.md:869-888`). speed: B-Day ~d18, F-Day ~d22, ~46 calendar days (`plan-speed.md:32-34`). team: 265 agent-days, 50 working days, and says itself it is not faster (`plan-team.md:40-43`) |
| Parity proof strength | **9** | 8 | 8 | risk alone sees that the existing goldens sort keys (`plan-risk.md:284-291`, `mig-engine-golden.md:9-13`), and that 4 users make a calendar shadow worthless (`plan-risk.md:300-304`). It also requires ICU NFKC for passwords (`plan-risk.md:966`). team adds response-schema conformance (`plan-team.md:306-310`) but picks Python 3.13. From 3.12, float `sum()` is compensated and differs from JS (`inv-engine.md:469`) |
| Team maintainability | 6 | 6.5 | **9.5** | team: OpenAPI-generated typed client, import-linter layering, ADRs, CONTRIBUTING guides, readable domain tests, a docs dry run by a fresh agent (`plan-team.md:166-231,696-700`) |
| Fit to the 7 GB box | 8 | **8.5** | 7 | speed: lean mode without blue/green, no ffmpeg in the image, a ~30 MB esbuild engine bundle instead of a 944 MB release, shortest overlap (`plan-speed.md:93-95,393-410`). team adds a `jgrt` container and blue/green for jgweb (`plan-team.md:528-541`) |
| Completeness | **9** | 8.5 | 8.5 | all three cover every area. risk adds a box-facts checklist and 25 ranked risks. speed adds agent operations (§10). team adds a definition of done |
| **Total /60** | 46 | **47.5** | 44.5 | |

### 0.2 Winner and why

**The spine is plan-speed's.** It is the only plan built around the owner's "faster and efficiently", and its speed levers do
not cost safety:
- Contracts are frozen in days 1-5, so about 10 agents can build at once.
- An engine bridge takes the 45-60 agent-day engine port off the backend cutover's path (`inv-engine.md:699-704`).
- Record/replay lets the React lanes run in parallel with the FastAPI lanes.
- An F1 page server stops the Node app being needed for pages.
- Cutovers are batched, and each route group can still be rolled back alone.

**Grafted from plan-risk (safety):**
- the flip gate A-J
- resting states the owner can stop at
- one change per window, with automatic, pre-authorised rollback and set flip windows
- per-family engine flips
- the two golden-fixture gaps (key order, Node 22), and ICU-backed NFKC on the password path
- the real-cookie decode count on the box, and a decode-failure trigger
- the `MEDIA_MIN_FREE_BYTES` disk conflict
- the `app/engine` name clash
- the two M1 endpoints that have no switch

**Grafted from plan-team (maintainability):**
- the repo conventions: one router, schemas file, service and README per domain, enforced by import-linter
- OpenAPI generated from the backend, a typed frontend client, and a drift check
- response-schema conformance against recorded TS answers
- ADRs and runbooks, readable domain tests, a handover proven by a docs dry run
- moving pages early, with a TS page-plan oracle (`plan-team.md:252-257,832-833`)
- a `jgrt` singleton boundary, as a code boundary first (§3.1)
- the CI-runner option

**What I changed in plan-speed, and why:**

| plan-speed says | Final plan | Reason |
|---|---|---|
| B-Day moves every `/api/v1` group in one reload, the dark groups included | Dark (switch-off) groups flip during P2 in three small batches (W1a-c, off the critical path). B-Day then moves only the live groups | Production gets a real rehearsal of the edge, the cookie read and the headers on zero-risk 404 traffic before B-Day, and B-Day does not move later |
| Auth issuance and every page on the same day, 30 min apart (`plan-speed.md:573-574`) | Pages move on **P-Day (~d12)**, before B-Day, from a TS page plan (team W2). Auth issuance moves on its own day (A-Day ~d22) | One change per window (`plan-risk.md:121-122`). F1's byte-equal documents are low risk and deploy every React lane early |
| Node stopped at F+3 (`plan-speed.md:575`) | Node is stopped **7 days after its last route left** (~d29). F+3 is allowed only if the memory budget forces it | Gives a week of zero routed traffic as proof (`plan-risk.md:739`) |
| E-Day flips every engine family at once (`plan-speed.md:578`) | One family at a time, leaves first, each with its own rollback | Attribution, and a smaller blast radius (`plan-risk.md:738`, `plan-team.md:684`) |
| A 7-day production shadow is the main engine proof | Main proof: the box-only dump replay plus compare mode over the walk clock on a staging twin (both 14-day walks, 8 simulated weeks across a year end and Tashkent midnight). The 7-day production compare is a backstop | Production has 4 users (`docs/ai/CURRENT_STATE.md:223,230`). A calendar shadow of 4 users proves almost nothing (`plan-risk.md:300-304`) |
| The edge sets `X-JG-FE` per app, with uid-hash cohorts | Kept the edge header (1 s rollback). Cohorts are canary cookie, then everyone | With 4 users, percentage cohorts mean nothing |

**What I kept from plan-speed against the other two:**
- **The student React port is big-bang per app**, behind the F1 legacy fallback, not islands. Islands hydrate React over a live
  legacy DOM. A text mismatch makes React 19 re-render the root and destroy the design's DOM (`inv-frontend.md:529-538`),
  and the bridge machinery costs about 8 agent-days (`inv-frontend.md:758`). Big-bang has no legacy DOM to hydrate over. Every
  surface lane is still gated offline, shard by shard, against the corpus with replayed API answers. The rollback is a 1 s
  header flip back to F1 legacy.
- **Python 3.11 during the conversion, not 3.13** (team). Since 3.12, `sum()` of floats uses Neumaier summation and differs
  from JS (`inv-engine.md:469`). The skeleton, the golden lane and whisper are already on 3.11 (`mig-engine-golden.md:12`,
  `deploy/servercore/whisper/Dockerfile:6`). Moving to 3.13 is a separate step after the conversion: re-run the goldens; the
  jsx lint already bans bare `sum(` over floats.
- **Drizzle owns migrations until Node stops** (not team's W0 handover). Under the freeze no migration is pending, so Node's
  lock-less migrator is idle. An early handover would need one more Node release, and two migration tools while Node can
  still be rolled back.

### 0.3 The numbers

**Size:** about **253 agent-days** (range 220-300). **Duration:** about **47 calendar days** to the last Node backend process
removed (range 40-62), with about 10 agent slots.

The four dates users could notice, in calendar days from the owner's go:

| Day | Date | What moves |
|---|---|---|
| ~d12 | P-Day | pages |
| ~d18 | B-Day | API |
| ~d22 | A-Day | sign-in |
| ~d31 | S-Day | student React |

[critic] These dates overcommit the machine (§0.4 item 3). The levelled ones are P-Day ~d14, B-Day ~d24, A-Day ~d28,
S-Day ~d42, and the end (R6) ~d56, range 50-72. The size grows to ~260 a-d with K0, the P0.3 rehearsal and the K1/B4 re-sizing.

**The honest part:**
- Users will not feel the backend change. Python is slower than V8 on CPU-heavy engine code, which is why the engine stays on the
  bridge until each family is proven.
- The one large speed gain users would feel needs no conversion. Of the 3.63 MB of gzipped JS on every student page load,
  3.06 MB is the rarely opened gift film `016.js`. Lazy-loading it is 1 agent-day (`inv-frontend.md:438-444`). It ships in
  Node release N2 (§8), whatever happens to the rest.
- "Faster" is true for the team afterwards, not for users, and not during the conversion: a freeze is needed (§12, D2).

**FastAPI over Django REST: I agree**, and so do all three plans and all four inventories:
- Async is needed for the SSE hub on `LISTEN/NOTIFY`, for Claude token streams and for the draft-wait loop.
- Django's ORM would fight a schema owned by SQL migrations: 118 tables, Auth.js camelCase columns, 48 composite primary keys,
  partial-index conflict targets (`inv-db.md:23-31`, `plan-team.md:813-818`).
- A FastAPI app already runs on the box (exam).

**One correction to the brief:** Pydantic does *not* mirror zod by default. Its defaults coerce types loosely, answer 422,
count lengths in code points instead of UTF-16 units, and emit `null`. Pydantic is used only at the request edge: strict mode,
generated from the zod schemas, with a 400 handler (`plan-speed.md:12-16`, `inv-api.md:74`). Responses are written by a
JS-exact `js_dumps`.

### 0.4 [critic] What the completeness review changed

Five findings change a date or a decision. The rest are inline fixes marked `[critic]`.

1. **N1 is a product release, not a dark one.** BASE ships live, switchless behaviour and changes live data:
   - The family rules p40 U5/U6 are "live, not behind a switch": a second adult's join waits for the linked parent's yes, and
     `POST /family/join` can answer `{pending:true}` (`m1-main:src/server/family/requests.ts:2`,
     `m1-main:src/app/api/v1/family/join/route.ts:26`, `m1-main:public/runtime/jg-family-parent.js:1`).
   - `POST /api/v1/reports` is "live with MODERATION on and off" (`m1-main:src/app/api/v1/reports/route.ts:10-11`).
     `GET /api/v1/milestones/reports` is "live with no switch" (`m1-main:src/app/api/v1/milestones/reports/route.ts:8`).
     These are the two "switchless" handlers. The old P0.3 check ("not reachable from any UI") was wrong: they are meant to be
     reached.
   - Migrations write to live rows:
     - 0043 refunds shop, style and wager coins (`m1-main:drizzle/0043_m1_games_refund.sql`).
     - 0051 claws back a double diagnostic payment (`m1-main:drizzle/0051_m1b_truth.sql:6-20`).
     - 0045 and 0046 backfill awards and motivation.
     - 0050 replaces the US/UK/DE/TC rule records, so the served `rules_version` changes.
     - 0055 flips every student's `privateProfile` to true inside `user_state`.
   - The AI notice moves to version 2026-10-20 (`src/server/ai-notice.ts:12`), and DEPLOY.md requires
     `ai-switch --notice 2026-10-20` right after that release (`deploy/servercore/DEPLOY.md:40-43`). The old plan left this step out.

   → D1 is rewritten (§12), and P0.3 gains a rehearsal on a restored dump plus the notice step. The parity oracle is
   production **after** N1.
2. **The inventories describe `ddbf9d81`, not BASE.** `git diff --shortstat ddbf9d81 8a1582d9`: 244 files, +88,816 lines.
   BASE has 156 route files against 151 inventoried. New since then: `family/notices`, `family/requests`,
   `family/requests/[id]`, `games/move`, `games/campus/photo`. Changed: 14 design JS files and `jg-family-parent.js`. Every
   count in this plan that comes from `inv-*.md` (199 handlers, 62 live, the W1 batches, the lane scopes) is a `ddbf9d81` count.
   → New lane **K0** in P0.4 re-derives `inv-api.json` and the live/dark classification at BASE from the switch checks in the
   code, before K1 freezes anything.
3. **The calendar overcommits the machine.** Spreading each lane's agent-days evenly over its own day range gives:
   - d6-d15: 138 a-d, which is 13.8 a-d per day
   - the peak: 17.2 a-d on d10, 16.9 on d11
   - the plan's own capacity: about 7.5 a-d per day (§8)

   (Computed from the §8 lane tables by `critic-load.py` in this folder.) The point dates for B-Day (d18) and S-Day
   (d31) cannot be met.
   **Levelled calendar** (the B-Day chain gets slots first; P7 and the L-lanes backfill):

   | Day | Step |
   |---|---|
   | ~d14 | P-Day |
   | ~d24 | B-Day |
   | ~d28 | A-Day |
   | ~d29 | AIW |
   | ~d36 | N-stop |
   | ~d42 | S-Day |
   | ~d56 | R6 (range 50-72) |

   The total grows to about 260 a-d (§8 totals). With the CI runner (D4b), about 10 a-d per day are possible, and B-Day moves to about d20.
4. **`AI_LOCK=0` is not a neutral setting.** The lock is the M1 jamol lane's answer to the owner's 19 Oct concern ("the general
   chat route is open to abuse"). It is **on by default on purpose** (`src/server/jamol/switch.ts:2,6`). Writing `AI_LOCK=0`
   keeps that abuse hole open in production; leaving it on changes Ask Jamol. This is the owner's call (D1b, §12), not a
   technical default.
5. **`reports` is not a dark group.** It moves on B-Day with the live groups, not in W1b (§9).

---

## 1. Ground truth the plan rests on

| Fact | Evidence | What it forces |
|---|---|---|
| Production: release `c6b7372f` (code `e3fc097b`), Drizzle 0038, 66 tables. On: ENGINE_LIVE, PHASE_D, PHASE_X, AI_LAYER, LESSONS, WRITING, SPEAKING, LESSONS_PARENT | `docs/ai/CURRENT_STATE.md:3-18`, `inv-db.md:18` | Every switch state stays identical through every step |
| The port target is the m1-main tip `8a1582d9`. Its parent `8ea0ed07` is the schema commit, so the "two conflicting head ids" in `plan-team.md:64-66` are one line. The tip **contains production** (`3c09957e` is an ancestor, 206 commits ahead) | `jg-p5i: git merge-base --is-ancestor 3c09957e 8a1582d9` → true; `inv-db.md:4-5` | BASE = the M1b release commit (N1, §8 P0). The started lanes (from `ddbf9d81`) are rebased onto it |
| 199 handlers: 62 live, 12 deployed but off, 124 M1-only. 18 GETs write | `inv-api.md:7-10` | A GET is not safe to shadow or retry; GETs move under the same gates as writes |
| Code behind the routes: `src/server` 31,568 lines; `src/engine` 16,964 lines + 19 MB content; design JS 22,956 + runtime 15,440 lines | `inv-api.md:66`, `inv-engine.md:22-29`, `inv-frontend.md:17-21` | A rewrite of business logic behind parity gates, not a framework swap |
| Sessions: an Auth.js JWT in a JWE cookie, a fixed 30 days, no session table | `src/auth.ts:13`, `mig-backend-skel.md:14-23` | FastAPI reads sessions with no data migration. Never re-issue a cookie on read |
| Workers start inside the Node process | `src/instrumentation.ts:13-16` | A TS flag to turn a worker off ships before any worker moves |
| The client IP is `CLIENT_IP_HEADER`, else the **last** X-Forwarded-For entry | `src/server/limits.ts:141-146` | Set `CLIENT_IP_HEADER=x-real-ip` before the edge adds a hop, or everyone shares one sign-in rate bucket |
| `AI_LOCK` is **on unless it is set to 0** in the M1 code | `src/server/jamol/switch.ts:22` | The M1b release must write `AI_LOCK=0`, or Ask Jamol changes for live students |
| Two M1 handlers have no switch: `GET /api/v1/milestones/reports`, `POST /api/v1/reports` | `inv-api.json` routes[17], routes[78] | Check them in the M1b release (§8 P0.3) |
| [critic] Both are **live on purpose**, and so is the m1b-family flow (`family/requests`, `family/requests/[id]`, `family/notices`, the `{pending:true}` join) | `m1-main:src/app/api/v1/reports/route.ts:10-11`; `m1-main:src/app/api/v1/milestones/reports/route.ts:8`; `m1-main:src/server/family/requests.ts:2` | N1 is a product release; they move with the live groups on B-Day |
| [critic] M1b migrations write live data: coin refunds (0043), a claw-back (0051), award and motivation backfills (0045/0046), rule records (0050), the `privateProfile` flip in `user_state` (0055) | `m1-main:drizzle/0043_m1_games_refund.sql`, `0050_m1_dates_rules.sql`, `0051_m1b_truth.sql:6-20`, `0055_m1b_safesocial_private_review.sql` | Rehearse on a restored dump on the box and print counts per change; the owner approves the user-visible effects; the rules hash baseline is post-N1 |
| [critic] The inventories were taken at `ddbf9d81`; BASE is 244 files / +88,816 lines further on (156 vs 151 route files) | `git diff --shortstat ddbf9d81 8a1582d9` | K0 re-inventories at BASE before K1 freezes contracts |
| [critic] `user_state` PUT is last-writer-wins, with no version check | `src/server/state.ts:15-33` | An open tab can write back a blob a migration or the server changed (0055's privacy flip, `migrateP0Blobs`); count after N1 and after every flip that touches `state/*` |
| [critic] The PC has only PostgreSQL 18 and Node 24 (checked: `C:/Program Files/PostgreSQL/18`, `node --version` v24.20.0) | — | Install portable PostgreSQL 16 and Node 22 (the production minor) for the twins and the recorder in P0.4 (§4.1, §4.3 assume them) |
| The Drizzle migrator has no lock, orders by `when`, and runs at every container start | `inv-db.md:58-74` | One migrator at a time; never two Node colours migrating |
| 0039→0056 applies to a prod-shaped DB in 0.4 s; the dump is byte-identical to one built from empty | `inv-db.md:77-78` | Release M1b first; the Python models are generated once, at 0056 |
| Today's 0.000 % gate shoots only the first viewport of 4 landing pages | `inv-frontend.md:26-29`, `tests/smoke/fidelity.ts:33,91-113` | A ~1,600-shot corpus must exist before the first component is written |
| The box: 4 CPU, 7 GB RAM (free unmeasured), 5.7 GB disk free (85 %), Postgres shared with 8 sites, no memory limit on jgapps, a single-file Caddyfile bind mount, the containerd tag trap, two provider power-offs, no Docker on the PC | `inv-tests-ops.md:188-219`, `deploy/servercore/docker-compose.yml:9-27` | Measure first. A memory limit on every container. Release-in-place. Blue/green only behind our own edge |
| 4 users (last count, 14 Oct) | `docs/ai/CURRENT_STATE.md:223,230` | Proof comes from synthetic walks, fixtures and box-only dump replays, not from live traffic. This is the cheapest moment to convert |
| Already built | skeleton: 113 models with an empty diff, the JWE proven both ways with 16 cross-stack tests, 3 routes byte-identical, 80-93 MB RSS (`mig-backend-skel.md:7-31`). Goldens: 41,504 cases, 0 failures, 12 leaf modules ported (`mig-engine-golden.md:9-36`). HTTP recorder tools in progress (`mig-contract-rec.md:1-8`) | Do not redo; rebase and extend |

---

## 2. Rules for every lane (non-negotiable)

1. **Behaviour identical, no improvements while converting.**
   - Same paths, status codes, bytes, key order, refusal order, switch semantics, coin, ledger and privacy rules.
   - A bug found in TS is fixed in TS first (the oracle), then ported. Or it is kept bug for bug, with a note.
2. **One owner at a time** for: a route group, a worker, the migrator, the chat stream, an encode queue, an engine family's
   serving mode.
3. **Identical SQL at every serialisation point:**
   - the `engine_state` row lock (`src/server/engine/context.ts:12-24`)
   - the 12 advisory-lock key shapes, each with its own hash function (`hashtext` vs `hashtextextended(…,0)` are different
     locks)
   - the 29 `FOR UPDATE` sites
   - the `SKIP LOCKED` claim and fence
   - savepoints, and the 23505 + constraint-name branches (`inv-db.md:174-279`)
   - All of it lives in `app/db/{locks,student,ledger,ai_jobs}.py` only.
4. **One change per production window.** Never two groups, a group and a frontend flip, or a flip and a feature switch together.
   The rollback is built and rehearsed on the box before the forward step.
5. **Student data never leaves the box.**
   - No live traffic is mirrored.
   - Dump replays and GET sweeps run on the box and print counts, paths and hashes only.
   - No access log records query strings (signed URLs, `?uid=`).
   - The users are 10-19.
6. **Pinned versions:** Python 3.11, Node 22 (the production image), Next 15.5 + React 19 as installed, Caddy 2.8. No framework
   upgrade rides along.
7. **One `.env` feeds both stacks.** `AUTH_SECRET` is never rotated: it also keys media and video URLs, the lesson-piece
   question order and gift codes (`inv-server.md:261-271`). `AUTH_URL` never changes.
8. **The TS code is the oracle until it is retired.** It stays runnable in CI for 30 days after the last engine family flips.
9. **Agent operations.** These are hard-won rules from earlier runs:
   - one worktree per lane, checked against BASE by a script before the lane starts
   - scratch DBs `jg_<lane>_*`
   - every run over 2 minutes is detached, with `.log` and `.exit` files
   - never `git add -A`
   - at most 10 concurrent lanes
   - workflows staggered
   - a lane restarted after a crash gets its finished results passed in, not a mid-list edit (the workflow resume trap)
   - every headless browser uses `chrome-headless-shell` at `D:/tools/chs`, never `chrome.exe` (IDM hooks it)
10. [critic] **One box, many sites.** Other sessions deploy jamals.uz, ariza, the bots and the rest to the same VM and edit the
    same main Caddyfile.
    - No flip window overlaps another site's deploy, a Postgres restart or a main-Caddy edit.
    - Each window starts with `jg-route.sh --verify`, which checks that the main Caddyfile still names `jgedge` and that the
      inode is the mounted one.
    - A dated line in `/opt/jgapps/WINDOW` tells other sessions a window is open.
11. [critic] **Bearer codes in paths are secrets.** These carry codes in the path itself:
    - `/join/<code>` (family invite)
    - `/study/math/<code>` (a study invite, stored only as a hash on purpose, `scripts/outcomes/staff.ts:12`)
    - `/gift/<code>` (worth money)
    - `/pay/sandbox/<n>`
    - `/c/u/<handle>`

    The edge log, uvicorn, jgweb and every harness log write these paths with the code segment replaced by `*`. Rule 5's "no
    query strings" is not enough on its own.
12. [critic] **The repo's hard rule says deploys need the owner's explicit OK each time** (`CLAUDE.md`, Hard rules). D3 is a
    standing exception to that rule. It is written into `docs/ai/DECISIONS.md` with its exact scope before any step runs under it.

---

## 3. Target architecture

### 3.1 End state

```
Internet ─ jamals-caddy-1 (box TLS, encode, 12 MB cap, X-Real-IP) ─ app.jamals.uz ─> jgedge (Caddy 2.8, owned by /opt/jgapps)
  /api/*  and  /media/listening/*                       ─> jgapi  (FastAPI, Python 3.11, ONE uvicorn worker, blue|green)
  pages, /_next/*, /d/* (CSS, media), fonts             ─> jgweb  (Next.js 15 standalone, React 19, blue|green)
jgweb ─ internal GET /internal/page-plan (cookie + X-Real-IP forwarded; not routed by the edge) ─> jgapi
jgapi ─> Postgres 16 (db jgapps, shared instance, unchanged schema), MEDIA_DIR/VIDEO_DIR host folders,
         Anthropic, Telegram, R2, Whisper (optional, already Python)
jgrt  (same image, `python -m app.rt`): created only when MESSENGER, COMMUNITY or VIDEO_LESSONS is switched on
```

**Why one uvicorn worker.** Rate limits, chat presence, the 2,000-event SSE ring and several caches are per process by design
(`src/server/limits.ts:1-12`). N workers would loosen every limit N-fold.
- CPU work runs via `asyncio.to_thread`: scrypt, the guard regexes, the PDF screen, and native engine families that turn out
  heavy.
- `hashlib.scrypt` releases the GIL.

**Why `jgrt` is a code boundary first (team's idea, deferred as a container).** The singleton jobs live in `app/rt/` from day 1:
- the chat hub
- the video and media encode queues, with their "interrupted" sweeps
- the community sweep

They stay dark because their switches are off. When the first of those switches goes on, they move to a `jgrt` container. A
blue/green swap of jgapi would otherwise start a second colour whose "interrupted" sweep marks the old colour's running
encodes as failed (`inv-server.md:779-784`). Until then the container is not needed, which saves ~150-200 MB.

### 3.2 During the transition

```
Internet ─ jamals-caddy-1 ─ (one upstream line changed once, W0) ─> jgedge:8080
jgedge routes.caddy (rendered from routes.list by jg-route.sh; reload ≈ 1 s; stream_close_delay 5m; flush_interval -1 on streams):
  /api/v1/<moved group> /api/v1/<moved group>/*  ─> jgapi-blue | jgapi-green :8000   (lb_policy first, health 2 s, try 15 s)
  /api/auth/*, /api/v1/register                  ─> jgapps until A-Day, then jgapi
  pages + /d/* + /runtime/* + /_next/* + /media/* (ONE unit)  ─> jgapps until P-Day, then jgweb
                                                    (edge header X-JG-FE: student=legacy|react;parent=…;auth=…;staff=…)
  default                                        ─> jgapps:3000 (today's Node app; shrinks to nothing; lb_try_duration 15s covers its recreate)
jgweb ─ page plan ─> jgapps /internal/page-plan (TS, from N2) until d19, then jgapi (PAGE_PLAN_SOURCE=ts|py)
jgapi ─ POST /call (tagged JSON, batch) ─> jgengine:7070 (Node 22 esbuild bundle of src/engine + DB-free src/server modules; no DB)
        per family: JG_ENGINE_MODE_<F> = bridge | compare | native   (mode file re-read every 10 s; no restart)
jgapps and jgapi share: db jgapps, MEDIA_DIR, VIDEO_DIR, .env, the Auth.js cookie, every lock key
```

**Edge rules:**
- Matchers are `path /api/v1/<g> /api/v1/<g>/*`, never `/api/v1/<g>*` (`inv-tests-ops.md:525`).
- The edge passes the main Caddy's `X-Real-IP` through unchanged.
- It strips any client-sent `X-JG-FE` and `x-jg-test-*` headers.
- It logs JSON lines (path, status, upstream, duration), never the query string.
- [critic] **Retries only on dial errors.** With `lb_try_duration` set, Caddy also retries a **GET** whose round trip failed
  after the connection was made (its `lb_retry_match` default). 18 GETs write, and the first GET of `v.mp4` starts the watch
  clock. Set `lb_retry_match` so that it matches no request: only refused dials are retried.
- [critic] **Keep-alive race.** uvicorn closes idle keep-alive connections after 5 s by default. Caddy keeps idle upstream
  connections for 2 min. A request sent on a connection uvicorn is closing gives a sporadic 502, which would fire the
  "new 5xx class" rollback trigger. Run uvicorn with `--timeout-keep-alive 75`, or give the jgapi upstream
  `transport http { keepalive 4s }`. Check that jgweb (Node) has the same setting as today.
- [critic] **The listening rule comes first.** `/media/listening/*` is matched before the `/media/*` page unit.
  - jgweb's `public/` must **not** contain `media/listening`: the clips are served only through the gated route
    (`next.config.ts:7-10`).
  - jgapi reads the clips from `JG_LISTENING_DIR` (`src/server/listening/clips.ts:24`), mounted read-only from the release.
  - Probe: with LISTENING off, `GET /media/listening/<a real file>` through the edge answers the JSON 404 and never the bytes.
- [critic] **Response headers are part of the contract.** jgweb carries `next.config.ts:12-28` verbatim:
  - the six security headers on every path
  - `public, max-age=31536000, immutable` on `/d/:app/media/*`
  - `no-cache` on `/d/:app/(js|css)/*` and `/runtime/*`

  A design media file is cached for a year on students' phones, so its bytes **never change under the same URL** (a changed
  image gets a new name).
- [critic] **Internal network.** jgapi, jgweb, jgengine, jgrt and jgapps join a private `jgapps_internal` network. jgapps is
  there for jgweb's TS page plan until PP. Only jgedge, jgapi and jgapps (both for Postgres) join `jamals_default`, which the
  eight sibling sites share. jgengine answers RPCs with no
  authentication, and `/internal/page-plan` trusts the forwarded `X-Real-IP`, so neither may be reachable from a sibling
  container.
  - jgapi itself must sit on `jamals_default` to reach Postgres. So `/internal/page-plan` also requires an
    `X-JG-Internal: <PAGE_PLAN_TOKEN>` header from jgweb (a new env key, compared in constant time), on both the TS and the
    Python plan source.
  - The edge strips `X-JG-Internal` from client requests.

### 3.3 Resting states (each phase ends in one; the owner can stop at any of them for months)

| State | What runs | Reached |
|---|---|---|
| R0 | today: jgapps only | — |
| R1 | jgedge in front of jgapps; jgapi, jgengine and jgweb deployed dark | ~d4 |
| R2 | pages served by jgweb (legacy documents, byte-identical); dark groups on jgapi | ~d12 |
| R3 | every `/api/v1` group on jgapi; auth on Node; engine via the bridge | ~d18 |
| **R4** | Node app stopped. jgapi serves all `/api/*`. Parent, auth and staff are React. The student design is hosted by Next as drawn. Alembic owns migrations. The engine runs via the bridge | ~d29 |
| R5 | R4 + student apps fully React; legacy JS deleted after 14 days | ~d31 |
| R6 (end) | R5 + every engine family native; jgengine retired; the TS engine kept only as a CI oracle for 30 days | ~d45-47 |

[critic] On the levelled calendar (§0.4 item 3): R1 ~d5, R2 ~d14, R3 ~d24, R4 ~d36, R5 ~d42, R6 ~d56.

### 3.4 Repo layout

The repo is the existing private repo, JamalsAcademy org (`C:\Users\PC\Jamals Global`). The legacy app stays at the root as the
oracle until R6 + 30 days. Moving it earlier would break every path in its gates, deploy scripts and the 7k-line
`CURRENT_STATE.md` citations (`plan-team.md:163-164`).

```
src/ web/ public/ drizzle/ tests/   legacy Next app: frozen except urgent fixes; the parity ORACLE; deleted at R6+30 days
contracts/                FROZEN in P1; changed only by the integrator
  api.json                199 handlers: method, path, refusal order, switch, rate limit, body cap, request/response shapes
  openapi.json            GENERATED from backend schemas; drift-checked in CI on both sides (team)
  validators/*.json       zod → JSON Schema + zod-semantics flags (UTF-16 lengths, strict vs strip)
  engine-api.json         676 engine functions + bridged DB-free server exports, tagged-JSON value format, mutators
  page-plan.schema.json   page plan + JG_BOOT shape + x-jg-fe contract version
  ai-wire/<kind>.json     exact output_config.format as TS SDK 0.128 sends it; prompts/<kind>.txt + sha256 pins
  vectors/                auth (JWE both ways, CSRF, scrypt, Telegram), signatures (media, video, gift, Click md5),
                          jscompat (1e6), canon/hashOf, piece HMAC stream + shuffles
  db/                     lock-key registry, constraint names code branches on, NOTIFY wire
backend/                  FastAPI (grown from mig-backend-skel, jg-p4g-3)
  app/main.py             create_app(); auto-registers app/domains/*/router.py (no shared edit point)
  app/core/               settings + switches (read per call), errors (400 {error:'invalid'}, never 422), JSResponse,
                          headers, limits, client_ip, body caps, logging/redaction, clock seam, ids, test seams
  app/auth/               authjs_compat: jwe (done), session (done), csrf, password (PyICU NFKC), telegram, google; deps
  app/jsx/                THE one JS-compat kit for routes AND engine (num, text, re, sort, jsjson, dates, intl, mathjs, bits, canon)
  app/db/                 models (GENERATED at 0056), engine, tx, locks, student (with_student), ledger, ai_jobs, notify,
                          errors, head_guard
  app/domains/<group>/    router.py (HTTP only) · schemas.py (the contract) · service.py (logic) · README.md (team)
  app/services/           ai/, pay/, media/, video/, speech/, telegram/ (shared by several domains)
  app/rt/                 singleton jobs: chat hub, encode queues, sweeps (in jgapi while dark; jgrt container later)
  app/workers/            ai.py, league.py (lifespan tasks behind JG_PY_WORKERS)
  app/page_plan/          /internal/page-plan (buildBoot + the pages.ts decision table as data)
  app/jg_engine/          pure Python engine, one module per TS module, same export names (golden lane's app/engine RENAMED)
  app/engine_client/      TRANSITIONAL: bridge client + per-family mode + compare logger (deleted at R6)
  app/cli.py              Typer `jg`: ai-switch, coins-adjust, family-unlink, ai-revoke, engine-unproject, league-tick, seed-demo
  alembic/                added at the handover release (§6)
  tests/{unit,domain,golden,contract,cross_stack,db}/      tools/{gen_models,lint_jsx,export_openapi}.py
  .importlinter           api → services → db | jg_engine;  jg_engine imports only jsx + content;  rt never imports jg_engine
engine-worker/            TRANSITIONAL Node 22 bridge: worker.ts + esbuild config (deleted at R6)
frontend/                 Next.js 15 App Router, React 19, TS strict, output standalone
  app/(student)/app, (parent)/parent, (auth)/…, (staff)/staff/…   separate root layouts; every app-to-app nav is a full load
  src/apps/{student,parent,auth,staff}/   one component set per family with variant 'mobile'|'desktop'
  src/widgets/            wrapped imperative widgets (Dome, arc, roadmap chart, tab lens, chess, checkers, team stage,
                          AR medal (lazy), medals, dream bricks, prize film (lazy), parent coach/dream canvases)
  src/design/             the design's static data + designMock (the JG_API mock path), moved, never retyped
  src/lib/api/            schema.d.ts (GENERATED from contracts/openapi.json) · client.ts (openapi-fetch + JG rules) · stream.ts
  src/lib/{store,sync,i18n,page-plan,legacy-page}.ts   legacy-page = F1 document assembly (deleted after S-Day)
  public/d/<app>/css/00.css VERBATIM · public/d/<app>/media · public/fonts/jg-uz-marks.woff2
  eslint.config.mjs       bans next/font, next/image, CSS imports, <Link> into app documents on design routes
parity/                   http (record/tee proxy, normaliser, differ, twins, dbdiff, fakes, auth matrix, R adapter),
                          engine (recorder, runner), frontend (screens.json, capture, comparators), gates/
deploy/servercore/        compose v2, edge/{Caddyfile,routes.list}, jg-route.sh, jg-watch.sh, BUDGET.md, DEPLOY.md v2
docs/                     architecture.md, adr/001-008, runbooks/, migration/{status.md, legacy-map.json, box-facts.md}, ai/
```

**The eight ADRs** (team, `plan-team.md:213-230`): 001 FastAPI; 002 Auth.js cookie forever; 003 the jsx kit; 004 verbatim CSS +
DOM identity; 005 the jgrt singleton; 006 one migration owner; 007 frozen AI wire; 008 the engine mirrors TS until the oracle
retires. The unusual code is isolated and named, and the reason is written down once.

### 3.5 Technical choices (mine, as delegated; not the owner's)

- **Libraries:**
  - FastAPI + Starlette (`redirect_slashes=False`, custom 404/405/400 handlers)
  - uvicorn (`--no-server-header --proxy-headers`, access log off)
  - SQLAlchemy 2 **Core** on generated tables: no ORM unit of work, no relationship cascades (the DB's 134 CASCADE foreign keys
    do that, `inv-db.md:31`)
  - asyncpg with a `js_dumps` jsonb codec; pool 8 + 1 LISTEN
  - Pydantic v2 strict at the request edge only
  - httpx; the pinned `anthropic` SDK (beta fields via `extra_body`); `cryptography` + `joserfc`; `authlib` (OAuth client only)
  - `regex` for `\p{…}`; `tzdata`
  - PyICU on the password/identity NFKC path only. Python 3.11's `unicodedata` is Unicode 14; the production ICU is newer
    (`inv-engine.md:489`, `plan-risk.md:966`)
  - [critic] **"Password path only" is too narrow, and PyICU is not version-pinned.**
    - `localeCompare` is ICU collation at 38 sites (28 engine + 10 server). Some sort non-ASCII text (`rules-expiry.ts:107`).
      `inv-engine.md:483-486` already prescribes `jsx.locale_compare`: an exact ICU-root table for ASCII, PyICU for anything
      else. So PyICU belongs to the jsx kit (collation, NFKC, case mapping), not only to the password path.
    - Debian bookworm's `libicu72` is Unicode 15.0. Node 22's bundled ICU is 74-76 (Unicode 15.1-16), depending on the minor.
    - P0.2 reads `node -p "process.versions"` in the live container (icu, unicode, tz). Then jsx links PyICU against that same
      ICU major (built in the base image, or the matching `PyICU-binary` wheel). The `regex` module release is chosen so its
      Unicode version matches. `tzdata` is pinned to the `tz` version the same Node reports.
    - The jsx fuzz (source e) adds every assigned code point to NFKC, case mapping and collation.
    - **Hard error, never a silent fallback**, if ICU is missing at start.
  - Pillow (photo parity by properties, not bytes)
  - **No ffmpeg in the image** until VIDEO_LESSONS or COMMUNITY goes on (saves ~300 MB of disk)
- **Response models.** Pydantic response models exist for OpenAPI and for conformance tests: every recorded TS answer must
  validate with `extra='forbid'` and re-serialise byte-equal through `JSResponse`. At runtime, responses go through `js_dumps`,
  never through `response_model` serialisation.
- **Golden fixtures:**
  - sources a-c as zstd JSONL packs in the repo
  - d-e regenerated in CI, not committed
  - f-g never leave the box
  - the exact Google Fonts files vendored for tests only
- **Python 3.11 now; 3.13 after R6** (§0.2).

---

## 4. Parity harnesses

### 4.1 Engine: golden fixtures (the TS engine is the oracle)

**Recorder.** A transform wraps every engine export and every bridged DB-free server export. For each call it stores:
- the args (cloned before the call)
- the return value, or the thrown class and message
- the mutated args
- the module-state context
- a **tape** per callback (`random`, `token`, `now`, `rate`)

It uses order-preserving tagged JSON (undefined, NaN, -0, Date, Map and Set tagged; numbers printed with JS `String(n)`)
(`inv-engine.md:626-628`). It records on **Node 22**, the production image, not the PC's Node 24 (`plan-risk.md:101,290`).

**Two gaps in today's goldens, closed in lane K3 before they count as a gate:**
1. **Key order.** The 41,504 existing cases sort keys, inputs included (`mig-engine-golden.md:9-13`). The design iterates
   `Object.keys`, so output key order is part of the contract. Inputs are fed in the order Postgres jsonb really returns them.
   [critic] What TS code sees is jsonb's order (shorter keys first, then by bytes) **after `JSON.parse` has moved integer-like
   keys to the front in ascending order**. Example: jsonb `{"b":1,"10":2}` arrives in JS as `10, b`. So the asyncpg jsonb
   decoder uses the same `object_pairs_hook` reorder as `jsrt.load_json` (`inv-engine.md:490-493`), not plain `json.loads`
   (`inv-server.md:931`), on every connection, the LISTEN one included.
2. **Runtime.** The cases were recorded on Node 24 (ICU 78 / Unicode 17). They are re-recorded on Node 22.

**Fixture sources** (`inv-engine.md:632-645`):

| Source | What | Where it lives |
|---|---|---|
| a | the 350 engine-touching vitest files, run under the recorder | repo |
| b | 20,000 fabricated students × en/uz/ru × awkward dates (year ends, 29 Feb, Tashkent 00:00-04:59), through the server's own call sequences | repo |
| c | simulated-student state machines: checks, CAT, Elo + FSRS over 120 days, lesson sittings | repo |
| d | 491 math families × 200 seeds × 3 languages, plus `load()` over the real corpus | CI, regenerated |
| e | 10⁶ jsx fuzz vectors: number formatting, rounding, UTF-16 strings, regexes, hashes | CI, regenerated |
| f | box only: every stored answer and every in-flight `check_run`/CAT/FSRS/streak state from the restored daily dump, replayed through bridge and native. Only diff paths and hashes are printed | box |
| g | compare mode: jgapi calls bridge and native on the same input, serves the bridge, and logs `(module, export, first differing path, hash)` | in process |

**Tolerance.** Only reviewed transcendental intermediates may differ, by ≤ 4 ulp. Every discrete output must match exactly: the
chosen item, a shown percentage, a level, a due date, an id, a hash. A discrete flip is fixed by porting the V8 fdlibm
routine, never by widening a tolerance (`inv-engine.md:660-666`).

**Gate per family, in order:**
1. **Fixtures.** 100 % of the family's fixtures a-e pass, and no export is left without fixtures (coverage report).
2. **Dump replay.** The box-only replay (f) shows 0 discrete diffs.
3. **Walk-clock compare** (the main proof, because production has 4 users). On a staging twin on the PC, in compare mode,
   with 0 discrete diffs over:
   - both 14-day lessons walks
   - persona runs P1-P6 + teen through 8 simulated weeks, crossing a year end and Tashkent midnight
4. **Production compare.** The family has run in compare mode in production for ≥ 7 days with 0 discrete diffs, covering one
   Monday-Sunday task week and a Phase-D day boundary. This is a backstop: the families' compare windows overlap, so it adds
   about one week in total, not one per family.
5. **Flip:** `JG_ENGINE_MODE_<F>=native`. Rollback: the mode file back to `bridge` (≤ 10 s).
6. **Versions.** `ENGINE_VERSION`, the rules hash `r1-<fnv>` and admission v4.3 never change. A Python freeze record for v4.3
   goes into DECISIONS (`inv-engine.md:680-689`).
   [critic] They never change **after N1**. N1's migration 0050 replaces the US, UK, DE, TC_SAT and TC_IELTS_UZ rule records,
   so the served `rules_version` changes on N1 day (`m1-main:drizzle/0050_m1_dates_rules.sql`; the hash is built over the
   current ids and versions, `src/engine/rules.ts:107-123`). The golden baseline is recorded at post-N1 rules.

**Before B-Day, the bridge proves the transport:** fixtures a-e replayed *through the bridge* must equal the in-process TS
results byte for byte. This proves the tagged JSON, the tapes and the mutators. The logic is the same TS code.

### 4.2 API domains: HTTP contract record/replay (the flip gate)

**The harness** is built in K2 on `tools/contract` from `mig-contract-rec`, following `inv-tests-ops.md:240-430`:
- **record/tee proxy:** JSON, SSE, text streams, byte ranges, blobs; one JSON line per exchange
- **normaliser:** `normalize.yaml`, with an **id binder** (ids generated on either side are bound, not masked)
- **differ:** FAIL / ORDER / NOTE classes
- **TEMPLATE twin DBs** with a per-table DB-state diff
- **outbound fakes:** Anthropic (stream + JSON, a 429, an over-budget case), Telegram, R2, Whisper, and Payme/Click callers
- **an auth-matrix generator**
- **an R-test HTTP adapter:** the 66 route-test files run over HTTP against either stack
- **`lessons-walk` in HTTP mode**
- **the box-only GET-sweep script**

Test seams (`JG_TEST_ENDPOINTS=1`, bound to 127.0.0.1): `POST /__test/switch`, `x-jg-test-now`, and the `JG_WALK_AT_FILE` clock.
A test asserts they are absent from the production build.

**A group flips only when all of these pass:**

| Gate | Check |
|---|---|
| A Coverage + auth matrix | Every method ported. Probes give identical answers on both stacks: switch off → 404 **before any SQL** (asserted with a SQL tap); 401 → 409 → 401 → 403 role → 403 demo, in order; 429 + `retry-after: 600`; 413; 400 `{error:'invalid'}` (never 422); Next's 308 on trailing slashes; HEAD/OPTIONS as recorded. [critic] "Never 422" means the framework never answers 422. About 24 route files answer their own 422s on purpose (voice consent/part/too_short, task proofs, writing, staff; `inv-api.md:294,369,629,656`), and those stay byte-identical |
| B Route tests | The group's R-tests are green over HTTP against both stacks |
| C Tee walks | Every walk that touches the group, in every switch state of the gate kit (PRE, ALL, ALL+M1, each M1 switch off alone): 0 FAIL / 0 un-whitelisted ORDER in responses, per-table DB state and outbound calls |
| D Ledger | Groups that write coins or money: both 14-day walks in tee mode with a zero DB diff. Then G5: wallet = Σ coin_entry, unique idem, ≤ 1 running study session, ≤ 1 paid txn per order, ≤ 1 live ai_job |
| E Races | G6 on the group's lock keys: same idem credited from both stacks, quota at the global cap, duplicate sign-up, gift claimed twice, Payme perform twice, two AI workers, league rollover |
| F Write-sets | G7: audit-trigger write-sets of the group's DB-using TS test scenarios are equal |
| G Snapshot sweep | Production-snapshot GET sweep on the box: dump restored to `jgapps_parsweep`, both stacks on a network with no outbound route, a session minted per real user. Counts and differing paths only; DB dropped after. [critic] Both sweep stacks run with a **throwaway `AUTH_SECRET`** generated for the run and never written to disk, so a minted cookie for a child's account is worthless in production; parity holds because both sides share it. The restore runs outside 16:00-22:00 and 03:00-04:00, because it loads the Postgres instance shared by nine sites. The no-outbound network needs `jamals-postgres-1` attached to it (`docker network connect`, no restart), detached afterwards |
| H Engine | Golden 100 % for every engine family the group runs natively. Trivially met while the family runs on the bridge |
| I Rehearsal | Flip and rollback rehearsed on the box. p95 within 1.5× of TS on the same data. Event-loop lag p99 < 100 ms under walk load |
| J Frontend unchanged | Through the edge: `run.ts` smoke, `fidelity` 0.000 %, and the walks that touch the group |
| K Conformance (team) | Every recorded TS response validates against its Pydantic response model (`extra='forbid'`) and re-serialises byte-equal through `JSResponse`, so OpenAPI and the typed client tell the truth |

**B-Day needs more than every group green:** one **global** tee pass with all groups on FastAPI against all on TS, in every
switch state.

### 4.3 Database gates (`inv-db.md:476-501`; run in CI on postgres:16)

| Gate | Check |
|---|---|
| G1 | Schema equality. The drizzle-built DB, the models' `create_all` and `alembic upgrade head` give the same normalised `pg_dump --schema-only` and catalog fingerprint |
| G2 | Seed rows equal: 41 `rule_record`, 1 `ai_settings`, 20 `chat` |
| G3 | Production drift check on the release dump (box only) |
| G4 | Type round trip in both directions |
| G5 | Invariants (as gate D above) |
| G6 | Cross-stack races |
| G7 | Golden write-sets |

The skeleton's empty diff at 0050 (`mig-backend-skel.md:7-11`) is regenerated at 0056.

[critic] **"CI on postgres:16" does not exist yet.** The PC has no Docker and only PostgreSQL 18. The 0.4 s 0039→0056
rehearsal and the byte-identical dump were measured on a local PostgreSQL 18.6 (`inv-db.md:6-7`), not on 16.
- Until the CI runner (D4b) exists, P0.4 installs the PostgreSQL 16 binaries (portable zip) on the PC. G1, G4, G6 and every
  twin run on 16.
- N1's migration is rehearsed on a restored production dump in the box's own instance (as was done for P8,
  `docs/ai/CURRENT_STATE.md:223`), printing counts only.

### 4.4 Frontend: corpus, pixels, DOM, text, behaviour

**The corpus: ~1,600 goldens** (`inv-frontend.md:674-721`):
- about 1,200 student, 300 parent, 100 auth and 20 staff shots
- each surface × state × account kind (demo; live in en, uz and ru) × 390x844 (iPhone UA) and 1440x900
- a fixed Tashkent clock, seeded `Math.random`, reduced motion (plus a motion subset), vendored fonts

**Recording.** Each screen is recorded on the legacy page: the boot JSON, every `/api/v1` answer, and localStorage. The React
candidate gets the identical boot and the **replayed** answers. Frontend parity is therefore independent of the backend rewrite.

**Gates:**
- **Pixels:** 0 differing pixels outside the legacy-vs-legacy noise mask (`fidelity.ts` compare). Full page and viewport; inner
  scrollers scrolled to their ends.
- **DOM:** a structural diff that is equal (tags, ids, classes, `data-*`, aria, hidden, sibling order, element count).
- **Text:** text per element path equal in uz and ru, after `jg-i18n` has run on the legacy page.
- **Behaviour:** the API call log (method, path, normalised body, `x-jg-uid`) and localStorage after each walk are equal.
- **Existing gates:** the layout probe; `npm run fidelity` stays 0.000 %; the 49 smoke walks run unchanged through the edge.
- **F1:** byte equality of the HTML for every plan fixture: `renderPage(buildBoot(x)) == legacyPage(plan(x))`.
- **Owner walk:** on a real 390 px phone in uz and ru, before each app flips.
- [critic] **F1 compares whole responses, not only HTML bytes:** status, every header except `Date`, and the body. Headers
  include:
  - `Set-Cookie: jg_view=…` (`src/server/pages.ts:377`)
  - `jg_staff_lang` with `Path=/staff` (`src/app/staff/queue/route.ts:26`, `staff/video/route.ts:24`)
  - `x-robots-tag` and `referrer-policy: no-referrer` on `/c/*` and the staff pages (`src/app/c/[kind]/[id]/route.ts:27-28`)
  - `cache-control: no-store` and the content type with its charset
  - the 302s with a relative `Location`
- [critic] **The page plan covers every page route's own logic, not only `buildBoot`.** Several routes do work outside
  `pages.ts`, and the plan contract must carry all of it:
  - `/study/math/<code>`: the under-18 parent gate (`studyGate`, `inviteStatus`, `CONSENT_VERSION`)
  - `/c/<kind>/<id>`: the share card, plus its `share:<ip>` limit of 120 per minute
  - `/gift/<code>`, `/pay/return`, `/pay/sandbox/<n>`
  - `/link`: its error whitelist (grown in M1b, `m1-main:src/app/link/route.ts:8`)
  - `/join/<code>`, `/welcome`, `/signout`
  - `/privacy` and `/terms` behind `LEGAL_PAGES`
  - the staff pages
  - The DB writes some of them make (`adoptParentLang`, `adoptLang`)
- [critic] **A console gate.** Every corpus capture fails on any `console.error` and on any React hydration warning (React 19
  recovers from a mismatch by re-rendering the root, which destroys the design's DOM, `inv-frontend.md:529-538`).
- [critic] **The "live" corpus accounts are synthetic accounts on twins.** No real student's data is captured into the
  committed goldens.

The corpus must pass **legacy against legacy** (noise only) twice before any component is written.

### 4.5 The ~740 test files

| Bucket (`inv-tests-ops.md:61-112`) | Fate |
|---|---|
| E pure (207) | Become golden fixtures; the TS stays the oracle |
| D service + DB (188) | Stay as TS oracle tests. Their guarantees transfer through gates C, D and F. The owner-ruled cases (coins, quotas, privacy, one-attempt, "giving up must not pay more than doing") get **readable** pytest in `tests/domain/` (team), written by the lane that ports the service |
| R route (66) | Run over HTTP against both stacks |
| F vm (68), B browser (6) | Unchanged while `public/runtime` exists. The 65 runtime vm tests become vitest with the sync port. The rest die at S-Day + 14 |
| FD (45), BD (45) | Re-pointed through `real-page.ts` and a boot fetched from the page plan |
| 49 smoke walks | Unchanged against the edge |
| 38 source-scan tests | Become Python static scans, or are retired with a written reason |

---

## 5. Auth continuity (nobody is logged out)

1. **Reading (proven).** jgapi decodes the Auth.js JWE (`mig-backend-skel.md:14-23`):
   - dir + A256CBC-HS512; HKDF-SHA256 over `AUTH_SECRET`, salted with the cookie name
   - a SHA-512 thumbprint kid; 15 s leeway; chunked cookies
   - the cookie name taken from `AUTH_URL`'s scheme, never from the plain-http hop
   - The fixed 30 days are kept: nothing re-issues a cookie on read (`src/auth.ts:13`).
   - [critic] **This holds only for the read dependency.** Auth.js's own `GET /api/auth/session` **does** slide the session.
     It re-encodes the JWT with a fresh 30-day `exp` and sets the cookie again, and on a token it cannot decode it **clears**
     the cookie (`node_modules/@auth/core/lib/actions/session.js:21-63`, @auth/core 0.41.3).
     - No page calls it today (grep of `public/`, `web/`, `src/`), so in practice sessions are fixed.
     - The A-Day port of `/session` reproduces the slide and the clearing exactly. It is not "simplified" to read-only.
   - [critic] **Decode order.** Decoding tries `AUTH_SECRET_1..3` before `AUTH_SECRET`, and accepts `A256GCM` as well as
     `A256CBC-HS512` (`inv-server.md:142`). P0.2 confirms the numbered keys are absent. If any exists, the Python decoder
     uses the same order.
2. **On the box, before the first live group (W1):** a box-only script decodes, with the Python decoder, cookies Node actually
   issued: the owner's own sign-ins, one per method (password, Telegram, Google). It prints ok/fail counts only.
3. **Issuing (A-Day ~d22).** These routes move to jgapi as **one unit**: `/api/auth/{csrf, callback/password, callback/telegram,
   signin/google, callback/google, signout, session, providers}` and `/api/v1/register`.
   [critic] The edge matcher is `/api/auth/*` as a whole, so the unit also includes:
   - `GET /api/auth/signin` and `GET /api/auth/error`, which redirect to `/signin` because of the `pages` config
     (`src/auth.ts:15`, `inv-server.md:117`)
   - every other Auth.js action path, which keeps answering as Auth.js does (a probe of the unknown paths is recorded on TS
     first)

   The 16 KiB streamed cap applies to every `/api/auth/*` POST. What each part must reproduce
   (`inv-server.md:104-189`):

| Part | Must match |
|---|---|
| CSRF | `__Host-authjs.csrf-token` = `token|sha256(token+secret)` |
| Credential errors | Absolute redirects: `?error=CredentialsSignin&code=credentials|rate_limited`, `OAuthAccountNotLinked` |
| Passwords | scrypt with `maxmem = 2·128·N·r` (`src/lib/password.ts:101`); NFKC through PyICU |
| Telegram | HMAC with the 600 s window; numbers printed as JS prints them |
| Registration | zod 3.25's email regex verbatim, not `EmailStr` |
| Google OIDC | PKCE S256; state, pkce and callback-url cookies named as Auth.js names them (same JWE scheme, so a sign-in started on Node finishes on Python); Auth.js linking rules (no email linking, link to an open session, `emailVerified` null) |
| Body | 16 KiB streamed cap; never answer 411 |

4. **Rollback.** Node decodes Python-minted cookies (two-way vectors, including one cookie minted by the live TS path). Routing
   auth back to Node is a 1 s reload that costs no session.
5. **Monitoring.** After every flip, jgapi logs a count of cookie-decode failures (never a value). Any failure on a request that
   carried a cookie triggers the automatic rollback.
6. **Unchanged:** `AUTH_SECRET` (never rotated until R6 + 30 days), `AUTH_URL`, the Google redirect URI, the Telegram
   `/setdomain`, and the `jg_view`, `jg_lang` and `jg_child` cookies. jgweb never sets an auth cookie; it only forwards them.
   [critic] The full non-auth cookie list:
   - `jg_view`: **set by the server** on pages (`src/server/pages.ts:377`), so jgweb does emit this Set-Cookie
   - `jg_lang`: set by `public/runtime/auth.js:167`
   - `jg_child`: set by `public/runtime/jg-parent-m1.js:150`
   - `jg_staff_lang`: `Path=/staff`, set by `/staff/queue` and `/staff/video` (`src/app/staff/queue/route.ts:26`). The staff
     queue is **live** (PHASE_X on, `STAFF_USER_IDS`)

   The React ports read and write them with identical names, paths, Max-Age, SameSite and `Secure` behaviour.
7. [critic] **The parent join link crosses every auth path.** The chain is:
   1. `/join/<code>`
   2. `/signin?role=parent&next=/join/<code>`
   3. a sign-in by any method: Google keeps `next` in the `callback-url` cookie, Telegram in `return_to`
   4. `/welcome?role=parent&next=…` when there is no profile
   5. `/join/<code>`, and the `/link` page
   6. `POST /api/v1/family/join`, which at BASE may answer `{pending:true}` (`src/app/join/[code]/route.ts:13-21`,
      `src/app/welcome/route.ts`)

   The auth smoke walks this chain for each sign-in method:
   - with the parent new and the parent existing
   - with the second-adult case
   - with each hop on each stack: after P-Day, after B-Day, after A-Day, and after RA, when `/link` and `/welcome` are React

   The same applies to the study invite (`/study/math/<code>`, student role).

---

## 6. DB and migration ownership

| Stage | When | Owner | Rules |
|---|---|---|---|
| Pre | N1 (d1) | Drizzle | M1b release applies 0039-0056 with every M1 switch off: 0.4 s, schema byte-identical (`inv-db.md:77-78`). Python models and the baseline are generated once, at 0056 |
| A | d1 → Node stop (~d29) | Drizzle only, at Node start, as today | jgapi never migrates. Its head guard refuses readiness unless `max(created_at)` reaches 0056's `when`. **Schema frozen.** An unavoidable change is additive: TS → drizzle → regenerate models → G1. Node never runs two colours, so one migrator is guaranteed |
| Handover | the Node-stop release (~d29) | Alembic | Baseline `b0000_drizzle_0056`: it detects the drizzle bookkeeping and records itself only, or it builds a fresh DB from `baseline/schema.sql` + seeds + the drizzle bookkeeping rows. The version table lives in schema `alembic`. It runs as a one-off step under `pg_advisory_lock(hashtext('jg-migrations'))`. `scripts/migrate.mjs` refuses to run. The `drizzle` schema is kept forever, so an old Node release's migrate is a no-op on rollback. [critic] "`migrate.mjs` refuses" is a code change to the Node app, and §9 forbids Node releases after N2. So the refusal (`JG_DRIZZLE_MIGRATE=off` → exit 0 without connecting) ships **in N2**, and the N-stop release only sets the env key. Without it, the rollback path is still safe: drizzle's migrator applies nothing whose `when` is not newer than the DB's newest row (`inv-db.md:58-74`), and Alembic writes no drizzle rows |
| B | Node stop → R6 (jgengine and the Node release still startable) | Alembic | Expand-only: nullable or defaulted columns, new tables, `CONCURRENTLY` indexes. No rename, drop, type change or tightened constraint |
| C | R6 + 14 days | Alembic | Contract migrations allowed |

**Driver rules** (`inv-db.md:358-372`):
- timestamps truncated to ms and printed `…mmmZ`; dates as `YYYY-MM-DD`
- integral floats printed as ints; `undefined` keys dropped, not written as `null`
- `user_state.value` stored byte for byte
- app-side `uuid4()` ids for the 45 tables without a DB default
- Auth.js `timestamp` without tz read as UTC
- every constraint name kept (code branches on `pay_txn_order_paid`, `ai_run_pending`)
- the same clock source per write site: JS clock vs SQL `now()`
- [critic] there are **three** clock sources, not two: the seam `now()` (`src/server/engine/clock.ts:3`), a raw
  `Date.now()`/`new Date()` (for example `src/server/family.ts:22-25,43`, invite-code expiry), and SQL `now()`. Only the seam
  moves under `x-jg-test-now`/`JG_WALK_AT_FILE`. A port that "tidies" a raw `Date.now()` onto the seam changes what a
  walk-clock tee sees. Each site keeps its own source, and the K2 normaliser knows which fields follow the real clock.
- [critic] a lone UTF-16 surrogate (a JS `.slice()` through an emoji) reaches Postgres as U+FFFD, because postgres.js encodes
  through `Buffer`. `js_dumps` escapes it as `\udXXX` in JSON (`inv-engine.md:524`), and the DB write path replaces it with
  U+FFFD. Python's strict UTF-8 encode would raise a 500 instead.
- code holding a transaction never waits for a second pool connection
- [critic] **code holding a transaction or a row lock never waits on the engine bridge without a deadline.** The `engine_state
  … FOR UPDATE` lock is held across `engine_client` calls.
  - Each RPC has a timeout below the route's budget.
  - jgapi sets `idle_in_transaction_session_timeout` on its pool.
  - Gate I adds a drill: kill jgengine mid-walk. The routes fail cleanly, no lock outlives the request, and the next request
    succeeds after the restart.

**Connections** (shared instance; check `max_connections` and each site's usage in P0):

| Holder | Connections |
|---|---|
| jgapps | 10 + 1 LISTEN + 1 migrate |
| jgapi | 8 + 1 LISTEN per colour (×2 during a swap) |
| jgengine, jgweb | 0 |
| **Peak for this app** | **≤ 30** |

Every pool sets `application_name`.

---

## 7. Cross-cutting designs (short form; detail in the cited plan sections)

| Area | Design | Detail |
|---|---|---|
| **Background jobs** | **AI worker:** stays in Node through B-Day. At **AIW (~d23)** the Node worker goes off (`JG_TS_WORKERS=league`, shipped in N2) and the jgapi worker comes on (`JG_PY_WORKERS=ai`). The skip-locked claim + fence make the seconds between safe; jobs wait durably in `ai_job`. **League:** idempotent under `hashtext('league:rollover')`; the cron line becomes `python -m app.cli league-tick`. **Encode queues and sweeps:** in `app/rt`, dark; they move to `jgrt` before VIDEO_LESSONS/COMMUNITY go on. **Lead dispatch:** a kept `asyncio.create_task`. **Ops scripts:** Python CLI twins exist before Node stops; never two live implementations of a coin adjustment | `plan-risk.md:451-462`, `plan-speed.md:282-291` |
| **SSE chat** (dark) | Moves as **one unit**: 31 handlers + `/stream` + `staff/chats/reported`. A dedicated asyncpg `LISTEN jg_chat` feeds one ordered queue. Identical NOTIFY payload (≤ 7,000 B, else a ref). Exact bytes: `retry: 3000`, a 2,048-space comment, `id: <boot>.<seq>`, a 2,000-event ring, `resync`, heartbeat `: hb <ms>` every 20 s, `text/event-stream; charset=utf-8`, `no-cache, no-transform`, `x-accel-buffering: no`. A raw `StreamingResponse`. Proven on staging with `MESSENGER=1`; `chat-load` rewritten for the FastAPI hub | `plan-risk.md:464-482` |
| **Files and media** | `MEDIA_DIR`/`VIDEO_DIR` become host folders outside the release dirs, mounted into both stacks. Same HMAC signed URLs, so URLs minted by either stack verify on the other. Python **refuses to start in production without `AUTH_SECRET`**. Byte ranges written by hand (suffix ranges, 416, HEAD, explicit length); the first GET of `v.mp4` starts the watch clock. Photos and proofs stay `bytea`. The PDF screen stays on the bridge until it matches every verdict of the PDF corpus. **Disk conflict:** `MEDIA_MIN_FREE_BYTES` defaults to 5 GB and the box has 5.7 GB free. Before COMMUNITY goes on: R2 (`MEDIA_STORE=r2`) or a bigger disk | `plan-risk.md:484-505`, `inv-server.md:767` |
| **AI** | **Frozen wire:** each kind's `output_config.format` exactly as TS SDK 0.128 sends it, and the prompts, exported once via the fake client and sent verbatim (sha256-pinned; never regenerated from Pydantic, never hand-retyped U+02BB/U+02BC). Local validation reproduces zod's rules. `betas=['server-side-fallback-2026-07-01']`, `fallbacks='default'`, `maxRetries 0` for structured calls. Budgets and quotas use the same SQL and advisory keys. Guard, `canon`/`hashOf` and plan-eval stay **on the bridge** until natively ported with a verdict corpus. Outbound request JSON per kind is byte-equal against the fake. `shippedNoticeVersion()` becomes a build-time constant. A small real-API spot run of the plan step before AIW (D3) | `plan-speed.md:319-333`, `inv-server.md:460-494` |
| **Payments** (dark) | The paths in the provider cabinets stay byte-identical: `/api/v1/pay/payme`, `/api/v1/pay/click/{prepare,complete}`. **Payme:** always HTTP 200; check order parse → auth → shape → method; `isSafeInteger` semantics; 12 h timeout. **Click:** md5 over the raw received strings. Perform + activate in one transaction; the `pay_txn_order_paid` 23505 branch. Proven on `PAYMENTS_SANDBOX`. The pay group moves while PAYMENTS is **off**; payments go live only on FastAPI (D6) | `plan-risk.md:531-548` |
| **i18n** | The same `uz.json`/`ru.json`. Student `t()` = `jg-i18n.js`'s algorithm at render time (one legacy text node = one `t()` call). Parent `tp()` = `DICT`/`PATTERNS` + `boot.patterns` + the ʻ swap. `td()` for diagnostic words. `<Stress>` reproduces `jg-stress.js`. `jg-i18n.css`, the uz-marks font and `<html lang>` unchanged. The inline TS copy tables are exported to JSON once and loaded by both runtimes. The `glyph-walk` and `uz-marks-walk` gates run on every frontend shard. One visible change: the up-to-1.5 s hidden body on uz/ru pages disappears (D5) | `plan-risk.md:586-601` |
| **React port rules** | DOM identity is the contract: no wrapper elements; the `<body>` is a flex column with `gap`. The four `00.css` files are served verbatim as plain `<link>` tags without `precedence`, in legacy head order; no Next CSS pipeline, `next/font`, `next/image` or Tailwind. JSX whitespace as `{" "}`. `innerHTML` repaints become keyed remounts. Each attribute has one owner. Open/close sequences copied verbatim. Canvas, WebGL and physics widgets are wrapped, not rewritten. Both data paths are built: demo/mock (the pixel baseline) and live. One vanilla Zustand store with the same localStorage keys; `jg-runtime.js` §1-2 sync ported line for line. No React Query. Every `JG-PROD` comment moves to its TSX line, with `docs/migration/legacy-map.json` | `inv-frontend.md:623-670`, `plan-speed.md:360-379` |
| **Request plumbing** | One shared kit, so no lane writes its own: refusal order as in `inv-api.json` (switch checks before the session dependency); errors; the six security headers (`next.config.ts:12-28`); streamed body caps (413 before reading); rate limits as a module-level dict; `JSResponse`. **`lint_jsx` in CI** bans bare `round(`, `sorted(` without a JS key, `re.` without the ported flags, `json.dumps`, `str(<float>)`, and `sum(` over floats in ported code | `plan-risk.md:603-617`, `plan-team.md:218-222` |
| [critic] **AI notice: one version across three places** | Today the server reads the version out of the very script it serves (`shippedNoticeVersion()` regex over `public/runtime/jg-ai-notice.js`, `src/server/ai-notice.ts:12-20`), so the words on screen and the version the server accepts cannot drift. After the split, the script is served by jgweb and the constant lives in jgapi. These three must always be equal: the version in the served script, jgapi's constant, and `ai_settings.notice_version`. Otherwise, with `AI_CONSENT=1`, an "I agree" is refused, or it is recorded against words the student never saw. **The fix:** the version is generated into both builds from the one file at build time. Every jgweb and jgapi deploy runs a probe that fetches the served script, compares the versions, and refuses readiness on a mismatch. S-Day ports the notice text byte-identically (it is privacy text shown to minors) | `DEPLOY.md:40-43` |
| [critic] **Process caches** (TTL is part of behaviour) | Each one is ported with the same lifetime and the same invalidation: `ai_settings` 10 s (`src/server/ailayer/settings.ts:24`; `ai-off.sql` relies on "within 10 s"), CAT exposure rates 10 min (`src/server/cat/exposure.ts:12-15`), the CAT bank (`cat/bank.ts:61`), the content index (`content/bank.ts:53`), the listening clips (`listening/clips.ts:28`), page templates (`pages.ts:70`), the rules seed (`src/engine/rules.ts:127`), the formula parse cache (`content/formula.ts:140`), and the notice version (above). After a flip, the new process starts cold while the old one was warm. The tee normaliser declares which fields may differ for one TTL | — |
| [critic] **Content rounds during coexistence** | D2 allows content rounds, and §9 forbids Node releases after N2. Those two contradict each other while Node serves content: until B-Day, every content-reading route runs from the Node release dir. Content also lives in jgengine's bundle and, later, in jgapi's native families. A content mismatch between the piece route and its answer route mis-grades a lesson in flight. **Rule:** content ships as one artifact `content-<sha>`, mounted read-only into jgengine and jgapi (and into Node through `JG_CONTENT_DIR` from N2 on, a small N2 change). Every process logs the content hash at start, and compare mode refuses mismatched hashes. Between N2 and B-Day a content round is one window. The i18n JSON goes to jgweb in the same window | — |
| [critic] **Privacy rules register** (each gets a named pytest in `tests/domain/privacy_*` and a line in gate C/F) | (1) **C-21: speaking audio is never stored** (`CURRENT_STATE.md:31`). The voice route reads the raw body (`readBytes`, no multipart) and zeroes it after use (`audio.fill(0)` in `finally`: `src/server/lessons/speaking-voice.ts:7,194`, `src/server/speech/transcribe.ts:71`; on a type refusal, `src/app/api/v1/lessons/[id]/speaking/voice/route.ts:44-46`). Python reads it into a `bytearray` with `read_capped`, zeroes it, never uses `UploadFile` (Starlette spools parts over 1 MB to a disk temp file), and never logs it. (2) The task-proof retention of 90 days runs on boot (`src/server/core/retention.ts:13-14`, `core/boot.ts:25`). (3) The AI retention nulls `ai_run.input/output` after 180 days, at start and every 24 h (`src/server/ailayer/worker.ts:35-51`); it moves with AIW. (4) `stripServerOwned`, `withoutCaptions` (the pre-check's captions never stored) and `DEVICE_ONLY_KEYS` (the journal never stored) on `state/*` (`src/server/state.ts:26,28,34`, `src/server/jamol/privacy.ts:16-19`). (5) Under 14: no community media without a parent's consent (`src/server/community/posts.ts:126`), and a child's own consent tick is not recorded (`src/server/core/consent.ts:4`). With `AI_CONSENT=1`: the age rule (`src/server/jamol/consent.ts:44-47`). (6) Under 18: the outcomes study needs a linked parent's yes (`src/app/study/math/[code]/route.ts:21-23`). (7) The share card never shows a full name, a photo or the post's words (`src/app/c/[kind]/[id]/route.ts:8-12`). (8) Community photos are re-encoded with **no metadata** (EXIF/GPS) and auto-rotated, with the 40 MP bomb cap (`src/server/media/image.ts:19-21`). The Pillow port does `exif_transpose`, saves without `exif`/`icc_profile`, and sets `MAX_IMAGE_PIXELS`; its test checks that the output has no EXIF. (9) Logs: the lead URL holding the bot token is never logged (`src/server/leads/jia.ts:8`); `logAiError` logs class and SQLSTATE only. (10) Bearer codes in paths are redacted (§2 rule 11). Every age rule uses the same day function as TS (§6, clock sources) | — |
| [critic] **Every script in `scripts/` has a fate** (the old list had seven) | Python CLI twins before N-stop: `ai-switch`, `ai-revoke`, `ai-backfill`, `coins-adjust`, `family-unlink`, `engine-unproject`, `league-tick`, `seed-demo`, and **`outcomes/staff.ts`** (pending, proof, verify-score, reject-score, verify-outcome, invite, invites, revoke: the live staff workflow for students' score reports and the 4c invite links, `scripts/outcomes/staff.ts:1-12`). Read-only reports become SQL files or CLI read commands: `ai-report`, `rules/expiring` (its `--fail` mode is meant for the deploy checklist), `ai-check.sql`. Offline content, CAT and outcomes tooling (`scripts/content`, `scripts/cat`, `outcomes/{backfill-import,recalibrate,uz-forecast-2027,uz-rescrape,…}`) keeps running from the TS oracle tree on the PC until R6 + 30 days, then gets a decision. DEPLOY.md and the SQL comments that say `npx tsx scripts/…` are rewritten in the N-stop release | `inv-server.md:1027-1040` |

---

## 8. Build phases and parallel lanes

Units:
- An **agent-day (a-d)** is one agent for about 8 focused hours.
- **Days** are calendar days from the owner's go (d0).
- About 10 agent slots. Effective throughput is ~7.5 a-d per day, because heavy gates share the machine.
- The heavy jobs run through **one gate queue**: full vitest in 4 parts, the Chrome corpus, the tee walks. 2-3 concurrent slots,
  FIFO, results as files. Each lane's inner loop is offline replay (minutes) plus its own shard.

### P0: Pin, measure, release M1b dark (d0-d2; 3 a-d)

| Lane | Scope | Contract / inputs | Done when | a-d | Days |
|---|---|---|---|---|---|
| P0.1 Rulings | Owner answers D1-D6 (§12) | this plan + the Uzbek page | answers in `docs/ai/DECISIONS.md` and the vault | 0.25 | d0 |
| P0.2 Box facts | Read-only SSH: `free -m`, `docker stats --no-stream`, `df -h /`, `docker system df`, `du -sh /opt/jgapps/* /opt/jgapps-backups`, caddy version, mounts and `trusted_proxies`, `SHOW max_connections`, `pg_stat_activity` per DB, env key **names** only (`CLIENT_IP_HEADER`, `AUTH_URL` prefix, `AUTH_SECRET_1..3` absent), user/profile counts, `session`/`verificationToken` counts | `plan-risk.md:998-1008` | `deploy/servercore/BUDGET.md` written; full or lean mode decided (§10). [critic] Also, all read-only: **`memory.peak`** of the jgapps container's cgroup (the true peak since the 20 Oct start; a `docker stats --no-stream` snapshot is not a peak); `docker exec jgapps-jgapps-1 node -p "JSON.stringify(process.versions)"` (node, icu, unicode, tz: these pin Node 22 for the recorder and jgengine, and the ICU for PyICU, §3.5); the digest of the `node:22-bookworm-slim` image in use; whether `/etc/cron.d/jgapps-backup` covers anything besides the DB; the size of one dump; the last 24 h of 5xx in the Caddy log, if one exists | 0.5 | d0-1 |
| P0.3 Release N1 (Node) | Deploy the M1b head (`8a1582d9` or its green successor) via DEPLOY.md: every M1 switch off; `AI_LOCK=0` written explicitly; `CLIENT_IP_HEADER=x-real-ip`. Delete `app-267c1a13` first, so rollback becomes `c6b7372f`. Confirm the two switchless M1 handlers are not reachable from any UI with switches off | the M1b integration gate kit (`inv-tests-ops.md:151-180`) | prod at 0056 (57 journal rows); smoke as DEPLOY.md; every switch-off M1 route answers 404; fidelity 0.000 %; dump taken. **This commit is BASE** | 1.25 | d1 |
| [critic] P0.3 corrections | N1 is a **product release** (§0.4 item 1). Before it: (1) the owner gets the list of live effects, and his "ha" for this release is separate from the conversion's D1. The live effects are the m1b-family second-adult flow; the Report sheet saving reports; the milestone report status; coin refunds and the claw-back; award and motivation backfills; new rule records (a changed `rules_version`); every `privateProfile` set to true; AI notice 2026-10-20; and AI_LOCK on or off (D1b). (2) A rehearsal on the restored production dump in the box's own Postgres 16 that prints **counts only**: refund rows and coins, claw-back rows and coins, awards, motivation rows, privacy flips, the rule records changed, and G5 (wallet = Σ coin_entry) after. The rehearsal also covers the rollback: c6b7372f code against the migrated copy (snapshot and boot for each test account). (3) Right after the switch: `ai-switch --notice 2026-10-20` (`DEPLOY.md:40-43`); this is a pre-N2 Node script, run through `docker exec` as today. (4) The P0.3 line "confirm the two switchless M1 handlers are not reachable" is **dropped**: they are meant to be reached. Smoke adds `GET /api/v1/family/requests` (parent) and `POST /api/v1/reports` (student). (5) After 24 h: count non-demo `user_state` blobs whose `privateProfile` went back to false (an open tab can write it back, `src/server/state.ts:15-33`). (6) N1's recreate is still the ~9 s outage of today (no edge yet, `CURRENT_STATE.md:10`). It runs inside the window | the M1b gate kit plus the family walk p40 U5/U6 | owner "ha" on the listed effects; counts reviewed; notice in force | +1 | d1-2 |
| P0.4 Lanes | `conv/main` from BASE. Rebase `mig-backend-skel` (jg-p4g-3), `mig-engine-golden` (jg-p4f; rename `app/engine` → `app/jg_engine`), `mig-contract-rec` (jg-p4g-2) and `mig-frontend-poc` (jg-p4g-4) onto it. Worktrees with a base-check script, `node_modules` junctions, one shared venv, `jg_<lane>_*` DBs, port blocks, the gate queue | memory rule "check the base branch before fanning out" | every worktree's `git log -1` = BASE (checked by script); the four lane branches merged on `conv/main` | 1 | d1-2 |
| [critic] K0 Re-inventory at BASE | The inventories describe `ddbf9d81` (§0.4 item 2). Regenerate `inv-api.json` at BASE: routes, methods, refusal order, and the **switch each handler really checks**, read from code and not from comments. Diff it against the old one. Re-derive the live/dark classes and the W1 batches. List the new or changed runtime and design files for the F/L lanes (`jg-family-parent.js`, 14 design JS files, `jg-chance-why.js`, …) and the changed engine and server modules for the B/P7 lanes. **Provision the PC:** portable Node 22 at the production minor (P0.2), the PostgreSQL 16 binaries, Python 3.11 (present) | `git diff --name-status ddbf9d81 BASE` | `contracts/api.json` input regenerated; lane scopes updated in `docs/migration/status.md`; `node --version` in the recorder equals the box's | 1.5 | d1-3 |

### P1: Freeze contracts, record goldens, lay foundations, edge live (d2-d7; 41 a-d; 10 slots)

| Lane | Scope | Contract it produces | Done when | a-d | Days |
|---|---|---|---|---|---|
| K1 API contract | `contracts/api.json` (199 handlers at BASE); zod → JSON Schema → strict validators with zod semantics (`U16Str`); Pydantic request/response schemas per domain; generated route stubs (`JG_STUBS=1`); manifest; auth-matrix probe generator; `export_openapi.py` → `openapi.json`; `openapi-typescript` client + drift check | C1 API + OpenAPI | stubs give TS-identical answers in the auth-matrix probes for every route; 199/199 operations in OpenAPI; recorded answers validate (gate K) | 4 | d2-6 |
| K2 HTTP harness (2 agents) | §4.2 in full | C5-http (recordings, normalise rules) | a TS-vs-TS tee run of every walk is clean outside declared noise; all 66 R-test files green over HTTP against TS; the 14-day walk runs in HTTP mode | 6 | d2-6 |
| K3 JS kit + golden (2 agents) | `app/jsx` (merging golden `js.py` + skeleton `jsx.py`); Node-22 vectors; the order-preserving recorder for engine + bridged server exports; pytest runner; sources a-e in background chunks; inline copy tables → JSON; AI wire + prompt export with sha256 | C3 engine, C6 AI wire, C8 jscompat | jsx vectors 100 %; every export has fixtures (coverage report); fixtures regenerate deterministically; AI wire pins match | 6 | d2-7 |
| K4 Backend foundation (2 agents) | from the skeleton: models regenerated at 0056 (118 tables); `app/core` (settings and switches per call, `js_dumps`/JSResponse, body caps, headers, errors, rate limiter, client IP, logging and redaction, clock seam, test seams); `app/db` primitives; head guard; import-linter; `lint_jsx`; Alembic baseline in detect mode (not deployed) | C2 DB | G1, G2, G4 green; G6 races pass with Node on one side and Python on the other; the 3 skeleton routes are byte-identical at 0056 | 7 | d2-7 |
| K5 Engine bridge | `engine-worker/` esbuild bundle (src/engine + content bank serve/grade, lessons piece shuffle, ailayer guard/canon/plan-eval, pdf-screen, parent patterns); tagged-JSON RPC with batch calls; tapes; mutated args returned; `app/engine_client` with per-family modes and the compare logger; health + restart | C3 transport | fixtures a-e replay 100 % through the bridge; per-call overhead p95 < 5 ms locally | 3.5 | d3-6 |
| K6 Frontend corpus (2 agents) | `screens.json`; deterministic capture with chrome-headless-shell; ~1,600 legacy goldens; pixel/DOM/text/API-log/storage comparators; HTML→JSX converter with a round-trip test; vendored fonts | C5-fe | legacy-vs-legacy clean twice; the converter round-trips the 4 shells | 6 | d2-7 |
| K7 Ops edge + **W0** | jgedge compose with a directory-mounted Caddyfile; `routes.list` → `routes.caddy`; `jg-route.sh <group\|all-live\|pages\|auth> ts\|py\|canary` with validate + reload + probe; `jg-watch.sh`; release-in-place for jgapi/jgweb/jgengine; blue/green; `jg-py-base:<date>` image (python 3.11 slim + tzdata + PyICU; rollback image tagged before building); memory and CPU limits; `restart: unless-stopped`; DEPLOY.md v2 draft. **W0 live** | C9 ops | W0 live 24 h: health, `/signin` 200, `/app` 302, a two-IP rate-limit probe shows two buckets, SSE and the `ai/sample` stream through two hops, fidelity 0.000 % through the edge; W0 rollback rehearsed; jgapi dark answering `/api/health` | 3 | d3-5 |
| K8 Auth | §5 in full: read path hardened; CSRF, credentials, Telegram, Google with linking, signout/session/providers, register; two-way vectors | C7 auth | vectors pass both ways, including a cookie minted by the live TS path; the Auth.js form flows pass the auth smoke against FastAPI on dev | 4 | d2-8 |
| INT Integrator | merges onto `conv/main`; nightly re-record if TS changed; gate queue | — | `conv/main` green nightly | 1.5 | d2-7 |

**Phase done when:** resting state R1. Every harness proves TS == TS. The bridge == in-process TS. Contracts C1-C9 are frozen.

[critic] Corrections to P1:
- **K1 is under-sized at 4 a-d.** Most of the ~200 handlers have no zod **response** schema. The response models for gate K
  must be inferred from recordings across every switch state, then reviewed. Budget 7 a-d (range 6-9).
- **K5 "done when" adds memory.** Measure jgengine's heap and RSS after loading every bank and after both 14-day walks through
  the bridge. `--max-old-space-size=256` and the 384m limit (§10) are assumptions. An OOM in jgengine is a 5xx on every engine
  route, which rolls back all of B-Day.
- **K7 adds the edge settings** of §3.2: `lb_retry_match`, keep-alive, the internal network, the `X-JG-Internal` strip, the
  listening order, and the path redaction in logs.

### P2: Backend domains, every domain in parallel (d6-d15; 53 a-d; 6-7 slots)

**Same rules for every lane:**
- Port the services file for file into `app/domains/<group>` and `app/services`, against C1-C3 and C6-C8.
- The engine and the JS-heavy pure server code are called through `engine_client`, in bridge mode.
- A lane is **done** when its flip-gate report (§4.2 A-K) is green on staging twins, and it has written its README row, readable
  domain tests for the owner-ruled behaviour, and its `docs/migration/status.md` line. Compiling code is not done.

| Lane | Scope (TS source) | Moves as one unit | a-d | Days |
|---|---|---|---|---|
| B1a Engine core | engine/state (snapshot, `state/{key}`, study sessions), diagnostics/commit, roadmap/unis/explore/milestones, boot projection, `ensureDay`, recompute; GETs that write stay transactional | — | 3.5 | d6-10 |
| B1b Checks | checks/[kind], CAT glue, quiz, Phase D, per-serving token shuffles (bridge), the too-fast rule | — | 3.5 | d6-10 |
| B1c Tasks + coins | tasks/complete + proofs, coins/spend + game, Phase X schedule glue, checkpoints, every ledger idem key, the freeze cap, game caps | the ledger groups go together | 3 | d7-10 |
| B2 Lessons family (2 agents) | lessons; piece (HMAC stream + JS-float Fisher-Yates via the bridge, `inv-server.md:881`); hint stream; homework; SAT/mock/DTM; writing; speaking + voice (Whisper client) | the piece route **with** its answer route | 6 | d6-10 |
| B3 AI (2 agents) | client, frozen wire, settings cache, budgets/quota/meter, jobs/queue/worker (behind `JG_PY_WORKERS`), runs, interpret/result/change/tasks/react/draft, the plan loop, the `ai/sample` stream, precheck, jamol, consent/lock, the fake | the AI worker | 5 | d6-10 |
| B4 People | parent (week GET writes, alerts, notes), family (join/check/code/parents), outcomes, core, pledges, privacy, me/profile, photo, register glue. [critic] Plus BASE's live m1b-family routes `family/requests`, `family/requests/[id]`, `family/notices` and the `{pending:true}` join; the live `POST /api/v1/reports` and `GET /api/v1/milestones/reports`; and the outcomes staff actions behind `scripts/outcomes/staff.ts`. About 5k long lines: budget 6.5 a-d | — | 5 → 6.5 | d7-12 |
| B5 Pay | Payme, Click, orders, checkout, activate, subscriptions, entitlement, gifts, coupons, limits, sandbox, staff billing | the pay group | 4 | d7-11 |
| B6 Chat | hub (`app/rt`), SSE, store, moderation wire, reports | all `/chats*` + stream | 4 | d8-12 |
| B7 Community + moderation + media | posts, social, people, items, media routes, signed URLs, R2 SigV4, sweep, moderation queue/decisions, an explicit hook registry (the decision written first, then consumers told) | community + media + moderation | 5 | d8-13 |
| B8 Files | video (serve, upload, captions, watch clock), listening + the `/media/listening` edge rule, proof upload (PDF screen via the bridge) | video upload + staff video + file + encode queue | 2 | d8-10 |
| B9 Games/league/leads | games (python-chess parity for the chess rating), league + worker, motivation, achievements, leads + Telegram. [critic] Plus BASE's new `games/move` and `games/campus/photo` | league + worker | 3.5 | d9-13 |
| B10 Page plan (Python) + staff data | `/internal/page-plan` = `buildBoot` + the `pages.ts` decision table as data (`adoptLang`, `adoptParentLang`, `migrateP0Blobs`, parent `designFill`/`parentView`, `startVars`, pay boot); the staff page data endpoints | — | 3 | d9-13 |
| B11 Ops CLI | the Typer `jg` CLI twins; the cron line; DEPLOY.md v2 sections | never two live coin adjusters | 1.5 | d12-14 |
| W1 | Flip the **dark** groups in three batches (W1a-c) as their lanes go green (§9) | — | 1 | d10-15 |
| INT | merges, nightly re-record, gate queue | — | 3 | d6-15 |

### P3: Frontend (d4-d31, parallel with P2; 85 a-d; 3-7 slots)

| Lane | Scope | Done when | a-d | Days |
|---|---|---|---|---|
| F1 Page server + TS plan | **(a)** a small TS `/internal/page-plan` in the legacy app (wraps `buildBoot` + `pages.ts`), shipped in Node release **N2 (~d7)**, together with `JG_TS_WORKERS` and the gift-film lazy-load (D5); **(b)** jgweb: 24 page routes from the plan, legacy documents byte-identical, `/d/*` and `/runtime/*` verbatim, standalone build, edge `X-JG-FE` handling | byte-equal HTML for every plan fixture × switch state; fidelity 0.000 %; `run.ts` + `p1.ts` green through edge → jgweb; **P-Day ~d12** | 7 | d4-12 |
| FX Foundation | root layouts per group in legacy head order; store + sync port (the 65 vm tests → vitest); `lib/api` on the generated client; `t()`/`tp()`/`td()` + `<Stress>` + text parity; the `Frame` skeleton; opener registry (`JIA_open*`); document classes; `designMock`. **Its API is frozen for the L-lanes on ~d11** | an empty-tab student app renders Frame pixel-equal for demo and live, both variants | 7 | d6-11 |
| F2a Parent | `ParentApp` (variant), 4 panes, 9 folders, 6 sheets, `tp()`, the parent runtime files folded in, coach/dream canvases wrapped. [critic] Includes BASE's live `jg-family-parent.js` (the m1b-family asks and notices), which the inventory never saw | parent shard green (pixels, DOM, text, API log); owner walk; live ~d20 | 6 | d8-16 |
| F2b Auth + staff | 8 auth pages + `auth.js` + legal; 6 staff pages on FastAPI data | shards green; sign-in works with old and new cookies; live ~d21 | 5 | d8-16 |
| L1 Leaf | Settings, Pricing + pay, Shop, Applications/Calendar, Medals, AR (wrapped, lazy), PrizeFilm (lazy), League | shard green | 7 | d11-19 |
| L2 Games | IQ, games hub/chess/checkers, team games, party/Mafia, CampusGuessr | shard green | 6 | d11-18 |
| L3 Explore + lessons (2 agents) | Explore + `jg-real` §1 + unis; Lessons + `jg-real` §2 + lessons (phone and desktop), writing, speaking, voice, listening, video, mock, SAT, homework, JIA lead | shard green | 10 | d11-19 |
| L4 Community | Community 010, 023:1796-2201, chat, community, moderation | shard green | 6 | d11-18 |
| L5 Today (2 agents) | Dome (wrapped), Today, task sheet, checks/quiz/CAT screens, Phase D, ends/rest/letter, study room, comeback, journal | shard green | 9 | d11-19 |
| L6 Home + frame | device frame, wallet, status bar, tab lens (wrapped), pull, scrolled fade, Home arc, roadmap chart, study clock, mascots, notifications, laptop shell + rail | shard green | 7 | d11-19 |
| L7 Engine UI (2 agents) | Diagnostic + `jg-diag`, first picture, honest check, Roadmap + `jg-real` §4 + links + roadmap-ready + core, parent check, Jamol + AI notice/consent, outcomes, photo, family | shard green | 10 | d11-20 |
| Cut features | the 16 features hidden for everyone are **not** ported (D5): they stay as the design spec | — | −5 | — |
| F3 + tests + integration (2-3 agents) | [critic] **"Full SSR" is replaced** for the student apps. The design paints from localStorage before first paint: dirty-wins-at-load, `jg.seen.v1`, the journal, the outbox, the shown balance (`inv-frontend.md:566-591`). A server cannot render that state, and React 19 answers any text mismatch by re-rendering the root. So: SSR renders only the storage-independent document (head in legacy order, the static shell), and the app mounts with `createRoot` on the client, as the legacy scripts build their DOM today. No `hydrateRoot` over text that depends on storage or the clock. Parent, auth and staff stay SSR plus hydration only where their text does not depend on storage, and the console gate (§4.4) proves it. The rest of the original scope: serial integration of store/Frame/`t()`; `next/dynamic` on open for heavy surfaces; weak-phone budget (throttled 3G at 390 px: first paint and interactive not worse than legacy); re-point 76 browser tests and BD/FD via `real-page.ts`; retire line-lock tests with a written reason | full corpus green on both apps × both viewports × demo/live × en/uz/ru; owner phone walk; **S-Day ~d31** | 10 | d20-29 |

### P4: B-Day gate (d15-d18; 6 a-d)

Steps, in order:
1. The global tee pass: all live groups on FastAPI against all on TS, in every switch state.
2. The production snapshot GET sweep on the box.
3. Both 14-day walks with a clean DB diff, then G5 and G6.
4. The p95 check.
5. The real-cookie decode count on the box (§5.2).
6. A 48 h canary with the `jg_be=py` cookie on the owner's and test devices, including a real-phone walk in uz and ru.
7. **B-Day ~d18.**

### P5: Plan source, React parent/auth/staff, A-Day, workers, Node stop (d19-d29; 5 a-d)

These run as separate windows (§9): PP d19, RP d20, RA d21, **A-Day d22**, AIW d23. Then a 6-day watch with zero routes on
jgapps, then **N-stop ~d29**. The N-stop release does three things together:
- stops jgapps, keeping its release dir for 14 days
- runs the Alembic handover
- puts the Python ops CLI live

### P6: S-Day (d29-d31; 3 a-d)

- The full student corpus green.
- The weak-phone check.
- A 48 h canary (`jg_fe=react` cookie).
- The owner's own phone walk in uz and ru.
- Then `X-JG-FE student=react`.
- Legacy JS is deleted at S-Day + 14 (F4).
- [critic] **No device data is lost.**
  - `jg.journal.v1` exists only on the phone (`DEVICE_ONLY_KEYS`).
  - `jg.outbox` can hold writes queued offline for days.
  - Gate: a legacy phone profile carrying a journal, a dirty `jg.dirty` and a non-empty outbox (old body shapes) opens
    the React app, keeps the journal byte for byte, and drains the outbox through FastAPI with the same API log as legacy.

### P7: Engine native, family by family (d6-d45; 50 a-d; 1-6 slots, backfilling)

The golden lane has already ported dates, admission math/us, cat/irt, elo, coins, endings, content typed/text/formula,
strategy/field, and lessons levels/hw_plan/mock (`mig-engine-golden.md:12-15`). Those leaves are counted as done.

| Lane | Modules | Depends | a-d | Days |
|---|---|---|---|---|
| A1 Core leaves (rest) | util, version, i18n, ladders, labels, bank, rules (+ hash), rules-expiry, answers, branch, uz-records, streak, study, teachers, copy (from JSON), verify/* | K3 | 3 | d7-10 |
| D Content runtime (rest) | schema (zod-compatible checks), catalog, clips, read, numbers, family (signed mulberry32, `toFixed`/`toPrecision(12)`, ru plurals), format, instructions, keycheck, `load` | K3 | 3 | d7-10 |
| C CAT + checks | cat/config, scale, session, report, read; checks (`QUIZ` split into a leaf) | A1 | 3.5 | d10-14 |
| B Admission (rest) | uzcut, inputs, predict, display, copy, moves, port, the v4.3 freeze record | A1, C | 2 | d14-16 |
| A2 Pipeline core (2 agents) | derive … guardrails | A1 | 5 | d10-13 |
| A3 Planner spine | readiness, plan, schedule/steps, tasks, pipeline | A2, B, D | 5 | d16-21 |
| E Learner, lessons, Phase D | srs (ts-fsrs 5.4.1 port), quiz, turns, unit-test, sat-full, dtm-mock, phase-d | A1, D, A3 | 4 | d21-25 |
| G Strategy (2 agents) | schema + V1 checker (zod-identical messages), validators v1-v16, gate, views | A3, B, D | 7 | d21-25 |
| F Schedule (Phase X) | adapt, streak, dtm, allocate, compose, forward, simulate, exam-days | A3, D, G | 5 | d25-30 |
| H Numerics | V8 fdlibm routines where a discrete flip shows; CPU/memory profile; a 1-2 process pool for a family whose p95 > 50 ms | B, C, D | 2 | d14-30 |
| S Server-pure | guard + lexicons + tokens + plan-eval/judge, canon, bank serve/grade, piece shuffle, pdf-screen (`zlib.decompressobj`, PDF corpus verdicts) | K3 | 6 | d10-20 |
| I Compare + flips | box-only replay (f); walk-clock compare on a twin; production compare; per-family flips E1-E8; jgengine retirement | all | 4 | d20-45 |

**Families flip leaves first** (§9). Critical chain: K3 → A1 → A2 → A3 → G → F → compare → E8 (~d38) → 7 days warm →
jgengine removed (~d45).

### P8: Handover (d40-d47; 7 a-d)

| Lane | Scope | Done when | a-d |
|---|---|---|---|
| H1 Docs | `architecture.md`, ADR-001..008 final, runbooks (deploy, rollback, route flip, AI switch, coins adjust, restore from dump, power-off recovery, secret handling), both CONTRIBUTING guides, onboarding, glossary, `legacy-map.json`, vault notes, `CURRENT_STATE` | a fresh agent adds a toy route (schema → OpenAPI → typed client → screen) and ships it through the documented path, from docs alone | 4 |
| H2 Readable tests | the rest of the owner-ruled D-bucket cases as named pytest | every owner ruling on coins, streaks, tasks and privacy has a named test | 2 |
| H3 Final gate + owner | full gate on the final tree; the owner's teen-style walk at 390 px in uz and ru | the owner signs off | 1 |

After R6 + 30 days: delete the root legacy app, move content to `/content`, trim `parity/` to the CI-kept suites, and move to
Python 3.13 behind the goldens. This is outside the 47 days.

### Totals and calendar

| Phase | a-d | Days |
|---|---:|---|
| P0 | 3 | d0-2 |
| P1 | 41 | d2-7 |
| P2 | 53 | d6-15 |
| P3 | 85 | d4-31 |
| P4 | 6 | d15-18 |
| P5 | 5 | d19-29 |
| P6 | 3 | d29-31 |
| P7 | 50 | d6-45 |
| P8 | 7 | d40-47 |
| **Total** | **253** (range 220-300) | **~47 calendar days** (range 40-62) |
| [critic] **Corrected** | **~260**: +1.5 K0, +1 P0.3, +3 K1, +1.5 B4 (range 230-310) | **~56 calendar days** (range 50-72), levelled to ~7.5 a-d per day (§0.4 item 3) |

```
day  0    4    8   12   16   20   24   28   32   36   40   44 47
P0   ██N1
P1    ███W0████
P2            ██████W1████
P3 F1/FX/F2   ███████████P██████ RP RA
P3 L-lanes            ████████████
P3 F3/tests                       ██████████S
P4                           ████B
P5                               PP RP RA A AIW ── watch ──N-stop
P7 engine       ░░░░░░░░░░░░░░░░░░E1░░░E2░E3E4░░E5░░E6E8░E7══warm══X
P8                                                    ███████
```

What sets the pace:
- the engine chain (the long pole: it does not gate B, P, A or S)
- serial frontend integration
- gate machine time: a full pass takes 3-4 h on the PC
- the owner's "ha" on the four big days

**The CI runner VM (D4) shortens the gate queue. It does not shorten the engine chain.**

---

## 9. Cutover sequence and rollback

**Windows and triggers:**
- **Flip windows:** Tashkent 09:00-12:00. Never 03:00-04:00 (the daily backup). Never 16:00-22:00 (students after school).
  Never on a day with another flip or a release.
- **Before every write-group flip:** an extra `pg_dump`, the same command as a release.
- **Watch:** `jg-watch.sh <group> <minutes>` from jgedge's JSON log: per-upstream 5xx, p50/p95, new status classes, 429 counts,
  `docker stats`.
- **Automatic rollback triggers** (pre-authorised, D3):
  - any new 5xx class
  - p95 above 2× the TS baseline
  - a client error the walks never produced
  - any cookie-decode failure
  - a G5 breach on the post-flip read-only check
  - any compare-mode discrete diff on a native family
  - a sign-in failure rate above the previous day's
- **A ledger mistake found later** is fixed by a compensating `coins-adjust`, never by restoring a dump (`inv-tests-ops.md:567-568`).

| # | Day | Step | What moves | Gate before | Canary | Rollback (time) | After a rollback |
|---|---|---|---|---|---|---|---|
| N1 | d1 | Node release M1b | 0039-0056, switches off, `AI_LOCK=0`, `CLIENT_IP_HEADER` | M1b gate kit; dump | — | symlink back + recreate (~10 s); the migrations are additive, so no restore | none |
| [critic] N1 (corrected) | d1-2 | **Product release** M1b | as above, plus: live m1b-family, reports and milestone-report routes; data migrations (refunds, claw-back, backfills, rule records, `privateProfile`); notice 2026-10-20 put in force right after the switch; `AI_LOCK` as D1b decides | owner "ha" on the listed effects; dump rehearsal with counts + the rollback rehearsed on the copy (P0.3 corrections) | — | symlink back + recreate. The schema is additive, but **the data changes stay**: refunds, the claw-back, the flips and the rule records are not undone by a code rollback. A wrong one is fixed by a compensating write, as for any ledger mistake. The notice goes back with `ai-switch --notice 2026-10-09` | the counts from the rehearsal are the expected values |
| W0 | ~d4 | Edge in front | main Caddyfile upstream → jgedge (in-place write, validate, inode check, reload); everything still to jgapps | K7 rehearsal; two-IP probe | — | old line + reload (~1 s; ~2 s if the caddy container must restart) | none |
| N2 | ~d7 | Node release | TS `/internal/page-plan`, `JG_TS_WORKERS`, gift-film lazy-load. [critic] Also, so that no later Node release is needed: the `X-JG-Internal` token check on the page plan; `JG_DRIZZLE_MIGRATE=off`, a migrate refusal that is inert until it is set; `JG_CONTENT_DIR`, a content read path that defaults to today's; and the AI-retention tick behind `JG_TS_WORKERS` with the AI worker | TS gate kit; fidelity 0.000 % | — | symlink back; the edge's `lb_try_duration 15s` hides the recreate | none |
| W1a-c | d10-15 | Dark groups, three batches (each batch one window; both stacks answer 404, so a batch is one change) | **a** listening (+`/media/listening/*`), video (+ staff video), mock/sat; **b** pay, games, league, leads, notes, pledges, plans, privacy, ~~reports~~, blocks, achievements, motivation, and the M1-only sub-paths of core and parent (exact-path matchers; their live siblings move on B-Day). [critic] `reports` is **live** (`POST /api/v1/reports` is a live write with MODERATION off), so it moves on B-Day with the live groups, as do `family/requests*`, `family/notices` and `milestones/reports`. K0 re-derives these batches at BASE; **c** chats, community+media+moderation | §4.2 A-I with switches **on** (staging); in prod both stacks answer 404 | `jg_be=py` for 1 h | `jg-route.sh <g> ts` (~1 s) | none (404s) |
| P-Day | ~d12 | Pages (F1) | pages + `/d` + `/runtime` + `/_next` + `/media` → jgweb, all `legacy`; plan from TS | byte-equal HTML; fidelity 0.000 %; smoke + walks through the edge | `jg_fe=canary` 24 h | pages back to jgapps (~1 s) | none (same storage keys) |
| C-B | d16-17 | B-Day canary | all live groups for `jg_be=py` devices | P4 gate | 48 h | `jg-route.sh all-live ts` (~1 s) | none |
| **B-Day** | ~d18 | Live API | every live `/api/v1` group → jgapi (one reload); engine via the bridge; AI worker in Node; auth on Node | P4 | done | per group or all (~1 s) | rows FastAPI wrote are TS-readable (G4 + tee DB diffs); no schema change |
| PP | ~d19 | Plan source | jgweb `PAGE_PLAN_SOURCE=py` (jgweb blue/green) | B10 plan == TS plan on every fixture | — | `=ts` (~10 s) | none |
| RP | ~d20 | React parent | `X-JG-FE parent=react` | parent shard + owner walk | cookie 24 h | header back (~1 s) | same localStorage keys |
| RA | ~d21 | React auth + staff | `X-JG-FE auth=react;staff=react` | shards; sign-in with old and new cookies | cookie 24 h | header back (~1 s) | none |
| **A-Day** | ~d22 | Auth issuance | `/api/auth/*` + `/api/v1/register` → jgapi | two-way JWE/CSRF/pkce vectors; scrypt/Telegram vectors; Google linking cases; G6 sign-up races; owner signs in with each method on the canary | canary 24 h | `jg-route.sh auth ts` (~1 s) | Python-issued sessions stay valid on Node |
| AIW | ~d23 | Workers | Node `JG_TS_WORKERS=` (none); jgapi `JG_PY_WORKERS=ai,league` | AI dual-run on fakes; real-API spot run (D3) | — | flags back (two restarts, seconds) | queued jobs continue on Node |
| **N-stop** | ~d29 | Node retired | stop jgapps (7 days with nothing routed to it); Alembic baseline release; `migrate.mjs` refuses; Python CLI live. F+3 instead if the memory budget forces it | edge logs show 0 requests to jgapps for 7 days | — | `compose start jgapps` + routes back (~30 s); the release dir is kept 14 days | none (the baseline is detect-only; expand-only after) |
| **S-Day** | ~d31 | Student React | `X-JG-FE student=react` | full corpus; weak-phone check; owner walk | cookie 48 h | `student=legacy` (~1 s; F1 documents still served) | same store keys and API calls |
| E1-E8 | d20-38 | Engine families → native, one per window, leaves first: E1 content runtime ~d20 · E2 CAT + checks ~d24 · E3 learner/lessons/Phase D ~d28 · E4 admission ~d28 · E5 pipeline + planner ~d32 · E6 server-pure ~d34 · E7 strategy ~d35 · E8 schedule ~d38 | `JG_ENGINE_MODE_<F>=native` | §4.1 gates 1-4 | — | mode file → `bridge` (≤ 10 s) | outputs equal by gate |
| X | ~d45 | Bridge retired | stop jgengine; delete `engine-worker/` and `engine_client`; delete the Node releases (if not done at N-stop + 14) | every family native for ≥ 7 days | — | redeploy the bundle (minutes) | — |
| F4 | ~d45 | Legacy JS | delete `public/d/*/js`, `public/runtime/*` (except assets), `legacy-page.ts` | S-Day + 14 days clean | — | git revert + redeploy | — |

**For the whole conversion, never:**
- rotate `AUTH_SECRET`
- run a non-additive migration before R6 + 14 days
- run two different AI workers
- mirror live traffic
- deploy the legacy app after N2, except an emergency fix with a parity test on both stacks

**After a provider power-off** (it happened on 12 and 13 Oct):
- Every container is `restart: unless-stopped`.
- `routes.list` on disk is the truth.
- Every step above ends in a resting state.
- The runbook: start the VM from the panel, `docker compose ps`, `jg-route.sh --verify`.

---

## 10. Memory, disk and CPU budget on the box

**Measure first (P0.2). Nothing below except the jgapi baseline has been measured on the box.**

| Container | Lives | mem_limit | cpus | Expected RSS (basis) |
|---|---|---|---|---|
| jgapps (today's Node) | now → ~d29 | **set**: max(1g, measured peak × 1.5) | 2.0 | unmeasured; 0.5-0.9 GB assumed (`inv-tests-ops.md:190`) |
| jgedge | d4 → end | 128m | 0.25 | 20-40 MB (assumption) |
| jgapi (live colour) | d4 dark → end | 768m | 2.0 | 80-93 MB measured with 113 models (`mig-backend-skel.md:28-31`); 150-450 MB under traffic; +100-200 MB once native families load the bank (`inv-engine.md:326,723`) |
| jgapi (second colour) | ~60 s per deploy | 768m | — | transient |
| jgengine | d4 → ~d45 | 384m (`--max-old-space-size=256`) | 1.0 | 150-250 MB (assumption) |
| jgweb (live colour) | d12 → end | 512m | 1.0 | 150-300 MB (assumption) |
| jgweb (second colour) | ~60 s per deploy | 512m | — | transient |
| jgrt | only when MESSENGER/COMMUNITY/VIDEO_LESSONS go on | 384m | 1.0 | 120-200 MB |
| whisper | off throughout (SPEAKING_VOICE off) | 2g if switched on | 2.0 | 0 |

| Period | Expected RSS (this app) | Sum of limits | Note |
|---|---|---|---|
| today | 0.5-0.9 GB | unlimited | jgapps alone |
| d4-d12 (edge, dark jgapi, jgengine) | 0.8-1.4 GB | 2.3 GB | |
| **d12-d29 (overlap peak)** | 1.0-1.9 GB steady; up to ~2.6 GB during a swap | 2.8 GB steady; 3.6 GB in a swap | only one blue/green swap at a time on the box |
| d29-d45 (Node gone) | 0.4-1.0 GB | 1.8 GB | |
| end (R6) | 0.3-0.8 GB | 1.4 GB | likely below today |

**Gate on the P0 measurement** (MemAvailable under normal load, every site running):
- **≥ 3.6 GB:** full mode (blue/green for jgapi and jgweb).
- **2.5-3.6 GB:** **lean mode** (`plan-speed.md:407-409`). No second colour. A restart takes 2-5 s; the edge's `lb_try_duration 15s`
  retries refused dials, so users see a pause, not a 502. jgapps stops at the end of its watch or earlier.
- **< 2.5 GB:** a VM upgrade (+4 GB RAM) before W0 (D4).

A memory limit on every container keeps an OOM kill inside our container, away from the shared Postgres and the 8 other sites.

[critic] **Three things the budget left out:**
- **Builds.** Every release builds on the box in a one-off container while the live stack runs: today's `npm ci && next
  build` (DEPLOY.md step 3), the jgweb Next build (a larger React tree), the esbuild engine bundle, and the venv (PyICU
  compiles against ICU unless a wheel is used). None of them is in the tables. A Next build commonly peaks at 1.5-3 GB.
  During the d12-d36 overlap, add that peak to the steady 1.0-1.9 GB and it exceeds the lean-mode floor.
  - Every build container gets `--memory 2g --cpus 2`.
  - Builds never run in 16:00-22:00, and never while a swap is in progress.
  - The jgweb build moves to the CI runner if D4b is bought.
  - The P0 gate becomes: MemAvailable ≥ steady + one build + one swap.
- **jgapps' limit comes from `memory.peak`** (P0.2), not from a snapshot. Adding `mem_limit` and `cpus` to the live Node app
  is a recreate, so it rides on N1. The TS p95 baseline for gate I is measured **after** the CPU limit, or the comparison is
  unfair to Python.
- **Box-only replays** restore a whole dump into the shared instance: shared buffers, WAL and disk on the Postgres serving
  nine sites. Same windows as gate G.

**Disk** (5.7 GB free, 85 %):

| Item | Size | Rule |
|---|---|---|
| Node releases | 944 MB each, 2 kept | before N1 delete `app-267c1a13`; before N2 delete `c6b7372f`; both deleted at N-stop + 14 (−1.9 GB) |
| `jg-py-base` image | ~200-250 MB (3.11 slim + tzdata + PyICU; no ffmpeg) | tagged by date, rollback tag first |
| venv | 150-300 MB × 2 | reused while `requirements.lock` is unchanged; built in a one-off container on the box |
| jgapi release | ~40 MB × 2 | `git archive` → `api-<sha>`, symlink |
| jgweb standalone + `public/` | 200-350 MB × 2 | `web-<sha>` |
| jgengine bundle + data | ~30-50 MB × 2 | `engine-<sha>` |
| caddy image | ~50 MB | |
| **Peak added** | **~1.2-1.8 GB** | net negative after N-stop + 14 |

- **Before W0:** `docker builder prune`, json-file log rotation (1 MB × 3), measure `/opt/jgapps-backups`.
- **Gate:** never start a build with < 2 GB free.
- Golden fixtures and traces stay on the PC. Box-only replays restore one dump at a time, and only when ≥ 1.5 GB of RAM and
  ≥ 2 GB of disk are free.

**CPU (4 shared cores):**
- The limits above protect Postgres.
- Engine compute stays in V8 (jgengine) until a family proves its p95. A family above 50 ms p95 natively gets a 1-2 process pool,
  or stays on the bridge. That is my call, recorded as delegated.

---

## 11. Risks (ranked) and mitigations

| # | Risk | L | I | Detected by | Mitigation |
|---|---|---|---|---|---|
| 1 | Silent JS→Python drift in money, ids, text: `Math.round` half-up, `toFixed`, `String(n)`, key order, UTF-16 lengths, undefined vs null, ASCII `\b` next to U+02BB, float `sum` | M | H | golden byte-equality, tee DB diffs, G5 after every walk, `lint_jsx` | one jsx kit with 10⁶ vectors; the riskiest pure code stays on the bridge until proven; `ledger.py` line for line; Python 3.11; compensating writes, never dump restores |
| 2 | Engine drift changes what a student sees mid-lesson (family seeds, HMAC Fisher-Yates, task ids, `constraints_hash`) | M | H | fixtures d, box replay of every in-flight state, walk-clock compare | bridge first (parity by construction); per-family flips with a ≤ 10 s rollback; version constants unchanged |
| 3 | Everyone logged out (salt, cookie name, `AUTH_URL` scheme, secret rotation, NFKC drift on passwords) | L | H | two-way vectors, the real-cookie decode count, a decode-failure trigger | read-only for 3 weeks before issuance; same `.env`; never rotate; PyICU NFKC; Node decodes Python cookies |
| 4 | Cross-stack locks diverge (`hashtext` vs `hashtextextended`, key strings) → double credit, double payment, AI over-spend | M | H | G6 per key | one `locks.py`; identical SQL text; ledger groups move together on B-Day; unique indexes as the backstop |
| 5 | OOM or a full disk on the shared box takes nine sites down | M | H | P0 measurements, `docker stats` in jg-watch, the disk gate | memory limit on every container; one swap at a time; lean mode; prune first; VM upgrade (D4) |
| 6 | Client-IP collapse through the new hop → mass 429 on sign-in | H if missed | H | two-IP probe at W0; 429 counts | `CLIENT_IP_HEADER=x-real-ip` in N1, before W0; the edge passes `X-Real-IP` through unchanged |
| 7 | Student React pixel drift (whitespace, text-node splits, remount vs reconcile, wrapped widgets) | H without the corpus | H (binding ruling) | 1,600-shot corpus + DOM/text/API-log parity | corpus before any component; big-bang behind the F1 fallback (1 s header rollback); owner phone walk |
| 8 | Parity blind spots: 188 in-process test files have no HTTP surface; M1 never ran with real users; dev data is narrower than prod | M | M | tee walks in every switch state; the snapshot sweep | M1 deployed dark on Node first (N1); M1 features switched on only on the new stack, each as its own step after the owner's walk |
| 9 | Hidden cost: the conversion runs over 47 days and the owner keeps shipping rounds | H | M | `git diff golden/` + nightly re-record | freeze (D2); content rounds allowed (re-recorded nightly); urgent fixes TS first, ≈ +30 % each |
| 10 | Gate machine time: the PC as the bottleneck (CPU 87 % seen; 3-4 h per full pass) | H | M | gate-queue wait times | one gate queue; offline replay as the inner loop; sharded goldens; optional CI runner (D4) |
| 11 | Agent-ops failures: the 3-min watchdog, the resume-prefix trap, a stale base, shared-DB collisions, `git add -A` | H | M (time) | exit files, base-check script | §2 rule 9 |
| 12 | Worker double-run or gap; an encode sweep on a second colour fails a running encode | M | M | `ai_job` claim counts | worker flags (N2); AIW as its own window; encode work only in `jgrt`, created before its switch goes on |
| 13 | Python CPU stalls the event loop (SSE heartbeats, p95) | M | M | loop-lag metric, p95 gate | `to_thread`; the bridge until each family's p95 is proven; a process pool or a bridge-kept family |
| 14 | Privacy breach through test machinery (fixtures with children's data, logs with signed URLs or `?uid=`) | L | H | review of every gate script | no live tee; box-only replays print paths and hashes only; no query strings in logs; test endpoints refused in production |
| 15 | Provider power-off mid-step | M | M | health checks | every step ends in a resting state; `routes.list` on disk; the power-off runbook |
| 16 | The engine port stalls and the bridge becomes permanent | M | L | P7 progress | acceptable as resting state R5; reviewed at d30 |
| 17 | [critic] N1 treated as dark while it changes live wallets, rules, privacy flags and the family flow | H (as written) | H | the P0.3 rehearsal counts | N1 is a product release with its own owner "ha" and a rehearsal (§0.4 item 1) |
| 18 | [critic] Contracts frozen from a stale inventory (`ddbf9d81` ≠ BASE): live routes batched as dark, new routes unported | H (as written) | H | K0 diff | K0 before K1 |
| 18b | [critic] The calendar overcommits (13.8 a-d/day needed d6-d15 against 7.5) and the dates slip silently | H | M | gate-queue waits; status.md | the levelled calendar (§0.4 item 3); D4b |
| 19 | [critic] A writing GET runs twice (edge retry after a broken round trip), or keep-alive 502s fire the rollback trigger | M | M | edge log: retries and 502s per upstream | `lb_retry_match` matches nothing; uvicorn keep-alive above Caddy's idle (§3.2) |
| 20 | [critic] The AI notice version drifts between jgweb, jgapi and the DB | M | H (consent for minors) | the deploy probe | one generated constant; readiness refused on a mismatch (§7) |
| 21 | [critic] Bearer codes (family invite, study invite, gift) written into edge or app logs | M | H | log review in gate scripts | path redaction (§2 rule 11) |
| 22 | [critic] A build on the box OOMs a sibling site | M | H | `docker stats` during builds | build containers capped; build windows (§10) |

---

## 12. The owner's decisions (six; everything else is a delegated technical call)

| # | Decision | My recommendation | Cost of the other choice |
|---|---|---|---|
| **D1** | Release the M1b code to production now on the current stack (N1), every M1 switch off. In the same release: `AI_LOCK=0` written explicitly (otherwise Ask Jamol's lock turns on for live students, `src/server/jamol/switch.ts:22`) and `CLIENT_IP_HEADER=x-real-ip` | **Yes** | Three schema heads, and every lane must avoid M1 tables. Python would port code that never ran |
| **D1 [critic, replaces the row above]** | Release M1b (N1) as a **product release**. The owner sees and approves its live effects: the second-adult family rule; the Report sheet saving reports; the milestone report status; the coin refunds and the claw-back (counts from the rehearsal); award and motivation backfills; new admission rule records; every profile set to private; AI notice 2026-10-20 put in force. M1 switches stay off, and `CLIENT_IP_HEADER=x-real-ip` | **Yes**, after the rehearsal counts | as above |
| **D1b [critic]** | `AI_LOCK`. **On** (the M1 lane's default): his own 19 Oct concern, "the general chat route is open to abuse", closed. Ask Jamol then answers signed-in students only, with the server's prompt, the quick tier, capped tokens and daily pools, grounded in her own courses (`src/server/jamol/switch.ts:2-15`). **Off** (`AI_LOCK=0`): Ask Jamol stays exactly as it is today, abuse hole included | **On** (it is his own concern; this critic's recommendation, his call) | Off keeps the hole open for the whole conversion. On changes Jamol's answers on N1 day, so the parity baseline is "N1 with AI_LOCK on" |
| **D2** | A feature freeze on the old code from N1 to S-Day (~31 days). Allowed: content rounds (item banks), copy fixes, urgent fixes (TS first, then ported). M1 launches (games, league, tariffs/pay, chat, community) happen on the new stack after B-Day | **Yes** | Every change is done twice and re-recorded; the dates slip about one-for-one |
| D2 [critic] | Same, with the levelled dates: the freeze runs N1 → S-Day **~d42**, about six weeks. A content round is one deploy window that ships the single `content-<sha>` artifact (§7) | **Yes** | as above |
| **D3** | Standing permission for production work: the read-only box checks; the one main-Caddyfile change; box-only checks on restored dumps (data never leaves the box); the step calendar of §9 with **automatic, pre-authorised rollback**; a one-word "ha" on the day for B-Day, A-Day, the Node stop and S-Day; a few dollars of real Claude API for the AI spot run before the AI worker moves | **Yes** | Each step waits for a separate approval |
| D3 [critic] | D3 amends the repo's hard rule "deploying … needs the owner's explicit OK each time" (`CLAUDE.md`). It is written into `DECISIONS.md` with its exact list of steps. **N1 is outside it** (D1, its own "ha"), and so is every M1 switch turned on later. The box-only sweeps mint sessions only with a throwaway secret (gate G) | **Yes** | — |
| **D4** | Money: (a) if P0 shows < 3.6 GB free RAM: a VM upgrade (+4 GB RAM), or accept lean mode (2-5 s pauses on deploys, no outage); (b) optional: a CI runner VM (8 CPU / 16 GB, synthetic data only) for the ~7 weeks, kept afterwards as the team's CI | (a) decide after the measurement; (b) **yes if affordable** | (b): the PC stays the bottleneck for gates |
| **D5** | Small product effects: (a) the 16 features already hidden for everyone are not ported now; the design stays their spec (−5 agent-days); (b) uz/ru pages stop hiding for up to 1.5 s while translating (settled pixels identical); (c) the gift film loads only when opened (−3 MB per student page load), shipped in N2 | **Yes to all three** | (a) +5 agent-days for code nobody sees; (b) emulating the wait is extra work for a worse experience |
| **D6** | Payments go live only on the new stack, after B-Day, with the providers' sandbox suites run first | **Yes** | Real money on two implementations |

**Delegated technical calls (mine, recorded as such, not his rulings):**
- FastAPI; Python 3.11 now and 3.13 after R6; one uvicorn worker
- SQLAlchemy Core; Pydantic at the request edge only
- the bridge first, then per-family native
- big-bang student React behind the F1 fallback
- Drizzle until the Node stop
- PyICU on the password path; no ffmpeg until video or community goes on
- where fixtures live; vendored test fonts
- the jgrt timing; process pools for slow families
- byte-identical zod messages in strategy V1, assumed yes (`inv-engine.md:732-733`)

---

## 13. What came from where

| Element | Source |
|---|---|
| Frozen contracts C1-C9, engine bridge, record/replay, F1 page server, batched cutover with per-group rollback, lean mode, no ffmpeg, the esbuild bundle, agent-ops rules, Python 3.11 reasoning | plan-speed |
| Flip gate A-J, resting states, one change per window, pre-authorised rollback triggers, flip windows, the golden key-order and Node-22 gaps, ICU NFKC, real-cookie decode count, decode-failure trigger, `MEDIA_MIN_FREE_BYTES`, the `app/jg_engine` rename, the two switchless M1 handlers, the 4-users insight | plan-risk |
| Repo conventions + import-linter, OpenAPI + typed client + drift check, gate K conformance, ADRs, readable domain tests, docs dry run, pages early with a TS plan oracle, `jgrt` boundary, CI runner option | plan-team |
| Changed from all three | dark groups flipped during P2 instead of on B-Day or in 6 waves; Node stopped 7 days after its last route; per-family engine flips with the walk clock as the main proof; `jgrt` as a container only when its switches go on; `X-JG-FE` cohorts by canary cookie only |

**Where I disagree with the brief:**
- "Pydantic mirrors the zod schemas" holds only with a generated strict layer.
- "Faster" is true for future development, not for users. The one user-visible speed win needs no conversion and ships in N2.
- The full student React port reverses D6's reasoning (`docs/ai/DECISIONS.md:34-43`). It is done because the owner asked for it.
  It is safe only because the 1,600-shot corpus now makes drift measurable. If the corpus cannot be made stable
  (legacy-vs-legacy twice), the student port stops at R4, and that is reported to the owner, not worked around.

---

## 14. [critic] Still open after the completeness review

These could not be closed by editing the plan. Each needs a measurement, a spike or the owner.

| # | Open item | Who or what closes it | Blocks |
|---|---|---|---|
| O1 | D1: the owner's "ha" on N1's **listed live effects** (family second-adult rule, reports, refunds and claw-back counts, backfills, rule records, private-by-default, notice 2026-10-20) | owner, after the P0.3 rehearsal counts | N1, and so everything |
| O2 | D1b: `AI_LOCK` on or off | owner | N1 |
| O3 | `MIGRATION-PLAN-owner-uz.md` still shows the old dates (d12/d18/d22/d31, 47 days), the old D1 and no D1b | the judge lane regenerates it from §0.4 and §12; a native Uzbek check (memory: "Uzbek copy meaning traps") | showing the plan to the owner |
| O4 | Box numbers: `memory.peak` of jgapps, MemAvailable with every site up, `max_connections`, the production Node minor and its ICU, Unicode and tz versions, the Caddy version, the size of one dump | P0.2 (read-only) | full vs lean mode; PyICU and tzdata pins; jgapps `mem_limit` |
| O5 | K0's re-inventory can move routes between W1 and B-Day, and can resize the B and F lanes beyond the +7 a-d already added | K0 | K1 freeze |
| O6 | Does an open tab write 0055's `privateProfile:false` back? `user_state` is last-writer-wins. If it happens, the owner decides: re-run the flip, or accept it while COMMUNITY is off | count 24 h after N1 | the community launch |
| O7 | Student first paint with `createRoot` (§8 F3): legacy paints its static shell, then the scripts build the DOM. A React bundle mounts later on a weak phone. A spike measures first paint and interactive under throttled 3G at 390 px against legacy before the L-lanes freeze FX | FX spike (~0.5 a-d) | S-Day |
| O8 | Real memory of jgengine with every bank loaded, and of the jgweb build on the box | K5; the first jgweb build in a capped container | B-Day; P-Day |
| O9 | Whether a `PyICU` binary exists for the production ICU major on python:3.11-slim-bookworm, or whether it must compile in the base image (size and time unknown) | K7 base-image build | jsx kit, password path, A-Day |
| O10 | The frontend estimate keeps the inventory's own risk: 75-120 a-d for the full student port (`inv-frontend.md:812`), against 85 here. If legacy-vs-legacy is not clean twice, the student port stops at R4 (§13) | K6 result | S-Day |
| O11 | The user count was 4 on 14 Oct (`CURRENT_STATE.md:223`). If real families join during the conversion, the "proof from synthetic walks" premise weakens, and the canary and production compare windows gain weight | re-count at each big day | the gate weights in §4.1 and §4.2 |
| O12 | D4b, the CI runner, decides between ~10 and ~7.5 a-d per day, roughly B-Day ~d20 vs ~d24 | owner (money) | the calendar |
| O13 | Uvicorn keep-alive and Caddy idle values are taken from the documented defaults (uvicorn 5 s, Caddy 2 min). Confirm on the K7 rehearsal with a 30-minute idle-then-burst probe | K7 | W0, W1 |
