# /api inventory: Jamals Global (Next.js route handlers -> FastAPI)

Source: `C:/Users/PC/jg-plan` at m1-main `ddbf9d81` (read only). Production runs release `c6b7372f` (20 Oct 2026). Machine-readable twin: `inv-api.json` (one object per route).

## Counts

- Route files: 127 under src/app/api (125 under /api/v1, plus /api/auth/[...nextauth] and /api/health). 127 files carry 199 inventoried handlers once the community catch-all is expanded into its 44 real sub-routes (contract src/server/community/contract.ts:16-60).
- Production today: 62 handlers live, 12 deployed but switched off, 124 exist only on m1-main (M1 lanes, not deployed), 1 refused in production by design (dev stubs/sandbox).
- By method: GET 73, POST 98, PUT 5, DELETE 16, HEAD 3, PATCH 4.
- Streaming: 6 handlers (GET /api/v1/listening/{file} [byte ranges]; GET /api/v1/video/{clip}/{file} [byte ranges]; POST /api/v1/ai/sample [chunked text/plain (ReadableStream of deltas)]; POST /api/v1/lessons/hint [chunked text/plain]; GET /api/v1/chats/stream [SSE (cache-control no-cache, no-transform; x-accel-buffering no; connection keep-alive)]; GET /api/v1/community/media/{id}/{file} [byte ranges]).
- GET handlers that WRITE (must stay transactional in the port): 18 (GET /api/v1/engine/snapshot; GET /api/v1/study/sessions/current; GET /api/v1/engine/unis; GET /api/v1/lessons/{id}; GET /api/v1/mock; GET /api/v1/mock/dtm; GET /api/v1/mock/sat; GET /api/v1/lessons/{id}/speaking; GET /api/v1/lessons/{id}/writing; GET /api/v1/video/{clip}/{file}; GET /api/v1/parent/children/{studentId}/week; GET /api/v1/pledges; GET /api/v1/family; GET /api/v1/games/daily; GET /api/v1/games/campus; GET /api/v1/games/me; GET /api/v1/league; GET /api/v1/motivation).

| Domain | Handlers |
|---|---|
| auth | 4 |
| engine/state | 8 |
| diagnostics | 2 |
| roadmap | 4 |
| tasks/proofs | 3 |
| coins | 2 |
| lessons | 4 |
| homework | 1 |
| checks/quiz | 1 |
| SAT | 6 |
| listening | 2 |
| speaking/voice | 4 |
| writing | 2 |
| video | 6 |
| parent | 7 |
| family | 6 |
| staff | 3 |
| moderation | 12 |
| chat | 31 |
| community | 39 |
| media | 8 |
| pay | 15 |
| games | 6 |
| league | 4 |
| jamol/AI | 5 |
| core | 4 |
| leads | 1 |
| outcomes | 8 |
| misc | 1 |

## Cross-cutting rules every lane must copy

- **session**: Auth.js v5 (next-auth 5.0.0-beta.29, @auth/core 0.41.3 per C:/Users/PC/jg-p5int/node_modules) with session strategy "jwt" (src/auth.ts:46). The cookie authjs.session-token (__Secure-authjs.session-token on https) is a JWE: alg "dir", enc "A256CBC-HS512", key = HKDF-SHA256(ikm=AUTH_SECRET, salt=<cookie name>, info="Auth.js Generated Encryption Key (<cookie name>)", 64 bytes), protected header kid = JWK thumbprint of that key, exp = 30 days, clockTolerance 15 s (node_modules/@auth/core/jwt.js:48-128). The account id is token.uid (src/auth.ts:65-66). Large cookies are chunked (.0, .1, ...). No session table is read per request.
- **x_jg_uid**: Every write route (and most reads) compares header x-jg-uid (the account the page was rendered for, JG_BOOT.uid) with the session uid and answers 409 {error:"wrong account"} on a mismatch so the runtime reloads (src/server/api.ts:18). The SSE stream also accepts ?uid=. Tag-fetched files (photo, listening, video, community media/avatar) cannot send it and rely on the cookie (+ signed URL).
- **refusal_order**: Almost every route: switch off -> 404 BEFORE any read; then auth (401 -> 409 -> 401 -> 403 role -> 403 demo); then the rate limit (429); then the body (413 over cap, 400 {error:"invalid"} when JSON or zod fails); then the service. Exceptions are listed per route (checks/[kind] 404 on a bad kind before auth; family/join 429 before the role check; ai/react answers {line:null} instead of 429/400; ai/prepare always 202).
- **errors**: JSON {error: "<code>", ...extra} with cache-control: no-store via json() (src/server/api.ts:7-8). Some legacy routes use Response.json without no-store (family, family/code, family/join, family/parents, me/profile, register, pay callbacks). Empty bodies: state/* (204/401/409/413/400/503), ai/sample refusals (401/400/403/404/429/503 unlocked path), family/parents DELETE 204, auth POST 413. Validation failure is ALWAYS 400 {error:"invalid"} (register and me/profile add issues:[path]); never FastAPI 422 with detail.
- **body_caps**: Bodies are read through a streamed cap before parsing (src/server/limits.ts:21-46): a declared Content-Length over the cap is refused before reading, a chunked body is cut the moment it passes the cap; both 413 {error:"too large"}. Invalid JSON parses to null (then 400 by zod). Raw-byte routes: me/photo 100 KiB, proofs and tasks/{id}/proof 4 MiB, speaking voice 3 MiB, state 512 KiB, captions 512 KiB, community media 10/100 MiB, staff video upload VIDEO_MAX_UPLOAD_MB. Caddy caps every request at 12 MB (deploy/servercore/caddy-block.txt).
- **rate_limits**: In-process fixed windows keyed by bucket strings (src/server/limits.ts:99-121; chat src/server/chat/http.ts:16-24; moderation src/server/moderation/http.ts:8-15; community route.ts:24-28), limits read from env at call time, at most 100k tracked keys, reset on every deploy, per replica. 429 {error:"too many"} with retry-after: 600. Client IP = CLIENT_IP_HEADER else the LAST x-forwarded-for entry; loopback is unlimited outside production (src/server/limits.ts:141-146).
- **switches**: Read from process.env at call time on every request (src/server/*/switch.ts): flipping a switch is an env change + container restart, no code. Production (release c6b7372f, docs/ai/CURRENT_STATE.md:3-15): ON ENGINE_LIVE, PHASE_D, PHASE_X, AI_LAYER, LESSONS, WRITING, SPEAKING, LESSONS_PARENT; OFF LISTENING, AP_PHYSICS, SAT_FULL, SPEAKING_VOICE, VIDEO_LESSONS, JIA_CARD. M1 switches (MODERATION, MESSENGER, COMMUNITY, PAYMENTS, PLAN_LIMITS, GAMES_SERVER, LEAGUE, CORE_M1, PARENT_M1, AI_CONSENT, LEGAL_PAGES) exist only on m1-main; AI_LOCK defaults ON when unset (src/server/jamol/switch.ts:22). Other env knobs: JG_CHECKS_ENGINE=climb (CAT rollback), PHASE_D_CAT_STUB, JG_QUIZ_READ_MS, AI_FAKE, WHISPER_*, STAFF_USER_IDS (bootstrap admins), RATE_* and AI_* limits.
- **transactions**: withStudent(studentId) (src/server/engine/context.ts:12-24): one transaction that inserts-if-missing engine_state, wallet, dream_build, streak_state and takes SELECT 1 FROM engine_state WHERE student_id=$1 FOR UPDATE, so one student writes are serial; ensureDay() runs inside most of them. Other locks: pg_advisory_xact_lock(hashtextextended("ai-usage:<UTC day>",0)) for AI quotas (src/server/ai.ts:30, src/server/jamol/quota.ts:61), FOR UPDATE on pay_gift, admission_outcome, study_pair, check_run rows, family join per student.
- **ledger**: coin_entry is append-only with a unique (student_id, idem) key; credit() inserts ON CONFLICT DO NOTHING and moves wallet.balance in the same transaction; debit() refuses when balance < amount (wallet CHECK >= 0) (src/server/engine/ledger.ts:14-44). Idem keys: spend:<client_id>, game:<client_id>, diagnostic_complete, task and lesson keys, adjust:<ticket>. XP and bricks are their own ledgers (xp_entry, brick_entry unique by reason+ref); bricks capped at dream_build.target (600).
- **clock_and_dates**: Services take time from src/server/engine/clock.ts now() (tests override it). A student local day = profiles.timezone (default Asia/Tashkent); pay uses the Tashkent day (src/server/pay/store.ts:17 tashkentDate); AI quotas use the UTC day.
- **demo**: profiles.demo accounts are refused 403 {error:"demo"} by every engine/pay/outcome/moderation write; allowed on checks/[kind] (per visit runs, rate key adds client IP), state/{key}, family GET, and several GETs (games, lessons GET returns cards).
- **workers**: In-process background work started by src/instrumentation.ts: the AI layer worker (AI_LAYER=1; ai_job queue, src/server/ailayer/worker.ts), the league weekly rollover every 10 min (LEAGUE=1; src/server/league/worker.ts); the community sweep runs inside community requests at most every 10 min (src/server/community/posts.ts:512); jia lead Telegram dispatch is fire-and-forget after the 201.
- **files_and_signing**: Byte-range file routes with private caching: listening (versioned URL + ETag), video (HMAC-signed URL e/s for the signed-in uid, AUTH_SECRET, src/server/video/sign.ts), community media (same scheme, src/server/media/sign.ts), photo (ETag + ?v), proof/certificate files (no-store, CSP sandbox). Stores: profile_photo and proof_file bytes live IN POSTGRES; video under VIDEO_DIR; community media local MEDIA_DIR or Cloudflare R2 (MEDIA_STORE).
- **realtime**: Chat SSE: one in-process hub per process fed by Postgres LISTEN jg_chat; every chat write does pg_notify (payload <7000 B, else a reference re-loaded); SSE ids <boot>.<seq> with a 2000-event ring for Last-Event-ID; presence = students with an open stream in this process (src/server/chat/hub.ts:1-63, src/server/chat/stream.ts).
- **security_headers**: next.config.ts:12-28 adds X-Frame-Options DENY, CSP frame-ancestors none, nosniff, Referrer-Policy, HSTS, Permissions-Policy to every response incl. /api; next.config.ts:10 rewrites /media/listening/:file to /api/v1/listening/:file before public files.

## The framework choice (FastAPI vs Django REST)

- Agree with FastAPI for this surface: 2 streamed text endpoints (ai/sample, lessons/hint), 1 SSE stream (chats/stream), 3 byte-range file routes (GET+HEAD each), 8 raw-body uploads (photo, two proof routes, voice, community media, staff video upload and captions, state), and Pydantic is the closest match to the zod schemas. The schema already exists in SQL (51 drizzle migrations), so Django ORM/migrations would be a second source of truth; use SQLAlchemy Core or plain asyncpg on the existing tables.
- Disagree with the premise that the conversion is the fast path. The routes are thin (2,647 lines); what they call is 31,568 lines of src/server and 16,964 lines of src/engine TypeScript (non-test) plus 427k lines of content JSON. A Python port is a rewrite of that business logic with parity tests, not a framework swap. The cheapest safe order is a strangler: FastAPI takes domains one by one behind Caddy path matchers on the same Postgres, reading the same Auth.js cookie, while Node keeps serving everything not yet moved. Keeping src/engine (pure TS) as an internal Node service until a Python port matches golden tests would cut the critical path by about 9 agent-days.

## Hard parts

1. **Session continuity**: FastAPI must decrypt (and later issue) the Auth.js JWE cookie exactly (dir + A256CBC-HS512, HKDF salt = cookie name, kid thumbprint, chunked cookies, rolling re-issue) or every user is logged out. Google OAuth, Telegram Login Widget HMAC and scrypt$N$r$p$salt$key password hashes (src/lib/password.ts:30-65) must verify unchanged.
2. **Engine parity**: engine/commit, engine/snapshot, tasks/complete, checks/[kind], family/check, parent week and study sessions all run recompute()/ensureDay() over src/engine (CAT placement, roadmap planner, scheduler v2, scoring, chances). Per-serving token shuffles use crypto randomness (src/server/checks.ts:47-51), so golden tests need injectable RNG and clock.
3. **GETs that write**: engine/snapshot, study/sessions/current, parent week, lessons/{id}, writing/speaking GET, mock/dtm + mock/sat GET, pledges GET, league GET and every withStudent read insert rows and take the student row lock. A port that treats GET as read-only silently loses day closing, task issuing and streak rules.
4. **Ledger and idempotency**: coin_entry idem keys, wallet CHECK, freeze cap, game caps, "giving up must not pay more than doing" (src/server/engine/tasks.ts:207-224), lesson pays once, diagnostic_complete once. Any drift is visible money.
5. **Validation semantics**: zod strips unknown keys unless .strict() (then 400); z.number() rejects strings, Pydantic lax mode coerces "1" -> 1 and 1.0 -> 1; zod .max() counts UTF-16 units, Python len() counts code points; FastAPI answers 422 with detail by default. Every model needs strict mode and a 400 {error:"invalid"} handler.
6. **Streaming AI**: text/plain streams with abort propagation, the beta params (server-side-fallback-2026-07-01, fallbacks default, output_config.effort; src/server/ai.ts:54-77), and the meter settle after the stream ends (src/server/jamol/quota.ts:79). Quotas use advisory locks per UTC day.
7. **Chat SSE + hub**: LISTEN/NOTIFY works across both stacks, but Last-Event-ID replay and presence are per-process memory; moving the stream means clients get a resync event once. The stream cap (CHAT_STREAMS_MAX 3000) and heartbeats must be kept for Caddy.
8. **In-memory state**: rate-limit windows, presence counts, the rules cache (60 s), ai_settings and whoCanAct caches assume one process. uvicorn with several workers multiplies every limit; run one async worker or move counters to Postgres.
9. **Payments**: Payme JSON-RPC (always HTTP 200, -31xxx/-32504 codes, 12 h timeout, idempotent by Payme id) and Click SHOP API (md5 over the raw received strings, -1..-9) were ported once already with test vectors (src/server/pay/payme.ts:1-45, click.ts:1-40); port them 1:1 with the same vectors.
10. **Moderation hooks**: decisions notify consumers through a registry filled by side-effect imports (src/server/moderation/hooks.ts, community reviewPort); Python needs an explicit registry with the same "after the write" order.
11. **Media**: ffmpeg/ffprobe child processes, photo re-encode with EXIF/GPS stripping, R2 signed requests, signed expiring URLs that Node mints and Python verifies during the overlap (same HMAC over the same fields).
12. **Background workers**: AI worker, league rollover and community sweep must run in exactly one stack at a time; switch them off in Node the moment Python starts them.

## Port notes for the build lanes

- Keep every path, method, status code and JSON key byte-identical: public/runtime/*.js and the four design artifacts call these routes and the pixel gate depends on their answers. inv-api.json is the contract; generate Pydantic models and route stubs from it.
- One FastAPI dependency per auth helper, preserving the refusal order: StudentUser(demo=False|True), ParentUser, AskingUser (moderation), OutcomeUser, PayUser(write), StaffUser (Phase X list), RequireStaff(roles, write), SessionOnly, StateWho. Switch checks go BEFORE the dependency resolves the session (a dependency that reads the cookie first changes 404 into 401).
- A body reader with streamed caps per route (not a global middleware cap): JSON routes parse after the cap; raw routes get bytes. Map JSONDecodeError and ValidationError to 400 {error:"invalid"}; register and me/profile add issues.
- A json() helper that sets cache-control: no-store, and the security headers of next.config.ts:12-28 (or set them in Caddy for the API host path).
- A with_student(student_id) context manager reproducing src/server/engine/context.ts:12-24 (4 inserts ON CONFLICT DO NOTHING + FOR UPDATE), plus ensure_day(); and an injectable clock and RNG.
- Settings read env per request (not at import) so switches still flip with an env change; keep env names (RATE_*, AI_*, WHISPER_*, VIDEO_*, MEDIA_*, PAYMENTS_SANDBOX, STAFF_USER_IDS, CLIENT_IP_HEADER).
- DB: no schema change for the port. Keep drizzle/*.sql as the migration history; when Node is gone, baseline Alembic at the last migration. Note production is at 0038; M1 migrations 0039-0050 ship with M1, independent of the port.
- The page boot payload (src/server/boot.ts, window.JG_BOOT) and the /app, /parent, /staff/* page handlers are server-side API too (not under /api); see the appendix. The React frontend will need them as JSON endpoints (e.g. GET /api/v1/boot) with the same shape.
- Whisper is already a Python service (deploy/servercore/whisper): call it over HTTP as today (src/server/speech/transcribe.ts:27-54).
- Memory budget on the VM (7 GB shared, ~5.7 GB disk free): a second app stack (Python + Node during the overlap) must fit; one uvicorn process with asyncpg pool sized like Node pool.

## Parity strategy

1. **Contract tests from inv-api.json**: for every route, switch off -> 404 before reading (assert no DB query), each auth refusal in order, rate limit, body cap 413, invalid 400, and the happy path shape. Run the same suite against Node and FastAPI.
2. **Golden replay**: capture request/response pairs and per-table row diffs from the existing vitest suites (~740 files) and the headless smoke walks on a restored DB snapshot; replay against FastAPI on the same snapshot with frozen clock and seeded RNG; diff JSON (normalising ids and timestamps) and the tables each route lists here.
3. **Invariants after every replay**: sum(coin_entry.amount) = wallet.balance per student; no duplicate idem keys; xp/bricks equal their ledgers; streak and activity_day unchanged versus Node.
4. **Unchanged frontend gates**: run the four artifacts smoke walks and the 0.000 % pixel fidelity gate against the FastAPI-backed stack with the runtime JS untouched.
5. **Strangler cutover**: Caddy handle blocks per path prefix send a domain to FastAPI (same Postgres, same cookie); rollback is removing the matcher and `caddy reload` (graceful, seconds). Order: read-only and low-risk first (health, plans, explore, privacy, milestones/reports), then outcomes/family/parent, pay with sandbox, games/league, lessons family, chat (stream + writes together), community + media, and engine/state/checks/tasks/coins last. Auth.js sign-in moves last, issuing the same cookie.
6. **Shadow reads** where safe: for GETs without writes, a small Caddy-side or script-driven double-fetch and diff for a day before switching.

## Estimate (one agent, ~8 focused hours a day)

| Work | Agent-days |
|---|---|
| Platform: cookie decode/encode, auth deps, body caps, errors, rate limits, settings, DB layer, with_student, clock/RNG, contract-test and golden-replay harness, Caddy routing | 6 |
| engine/state, diagnostics, roadmap, tasks/proofs, coins, checks/quiz (src/server/engine 2.6k, checks 0.9k, cat 0.55k, phase-d 1.4k, phase-x 1k, schedule 0.6k, content 0.7k + src/engine 17k) | 18 (about 9 if src/engine stays a Node service behind an internal call) |
| lessons, homework, SAT/mock, listening, speaking/voice, writing, video (lessons 3.8k + 1k video + listening/speech) | 8 |
| jamol/AI incl. AI layer worker (ailayer 3.8k, jamol 0.4k, ai.ts) | 5 |
| parent, family, outcomes, core, pledges, notes (parent 1.7k, outcomes 1.9k, core 0.8k, rest 0.5k) | 5 |
| moderation, chat (SSE hub), community, media | 8 |
| pay (Payme, Click, checkout, gifts, coupons, entitlements) with its test vectors | 4 |
| games, league + worker, motivation, achievements | 3 |
| auth flows (Google, Telegram, password, register, welcome) + boot/page JSON | 3 |
| Cutover, shadowing, ops, rollback drills | 3 |
| **Total** | **~63 (range 55-70)** |

With 5-6 lanes in parallel after the platform, wall-clock is about 3-4 weeks; the engine lane is the critical path (~3.5 weeks alone). The route layer by itself (handlers, schemas, deps) is ~8 of those days; it is worthless without the services behind it.

## Appendix: non-API route handlers (server code outside /api)

Served by Next today as route handlers (src/app/*/route.ts, 24 files). Whoever owns pages must keep them or re-home them; several are API-like.
- `GET /app`, `GET /parent` (src/app/app/route.ts, src/app/parent/route.ts): the apps HTML shell + the boot JSON (src/server/boot.ts:95-145, keysFor, bootEngine projection, parent view). Static reach writes the whole engine set (the student boot runs ensureDay through the projection) and family_code, pledge status, proof/checkpoint reads.
- `GET /` (src/app/route.ts), `GET /signin`, `GET /signin/telegram` (re-export of /signin, receives #tgAuthResult), `GET /signout` (confirmation page; POST goes to Auth.js), `GET /welcome` (first-time role + name, posts /api/v1/me/profile).
- `GET /join/{code}` (invite link: sign in or up, then /link with the code; writes user_state), `GET /link` (the family code form, posts /api/v1/family/join; writes user_state).
- `GET /preview/{app}` (design preview, 404 in production), `GET /privacy`, `GET /terms` (LEGAL_PAGES=1 only), `GET /favicon.ico`.
- `GET /c/{kind}/{id}` (community share link: signed in -> /app?c=..., signed out -> sign-in card; COMMUNITY), `GET /gift/{code}`, `GET /pay/return`, `GET /pay/sandbox/{number}` (PAYMENTS).
- `GET /study/math/{code}` (Bluebook study invite page).
- Staff pages: `GET /staff` and `/staff/moderation` (MODERATION; the moderation page enqueues nothing but reads the queue), `/staff/queue` (PHASE_X counselors), `/staff/core` (CORE_M1), `/staff/billing` (PAYMENTS), `/staff/video` (VIDEO_LESSONS).

## Routes by domain

### auth (4)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/auth/{...nextauth}` | none (public) / n/a | - (live) | none | user + account on first Google sign-in (DrizzleAdapter createUser/linkAccount) |
| POST | `/api/auth/{...nextauth}` | none (public) / n/a | - (live) | signin:<ip> 60/15min (RATE_SIGNIN_PER_IP_15MIN); signin-fail:<email> 10 fails/15min (RATE_SIGNIN_FAILS_PER_EMAIL_15MIN); a correct password resets it | telegram: user + account(provider telegram, type credentials) on first sign-in (src/server/users.ts upsertTelegramUser) |
| POST | `/api/v1/register` | none (public) / n/a | - (live) | register:<client ip> 30/h (RATE_REGISTER_PER_IP_HOUR); loopback outside production is not limited (src/server/limits.ts:141) | user; password; profile; user_state (parent with lang: key jg.parent.lang) |
| POST | `/api/v1/me/profile` | any signed-in account (first-time Google/Telegram user on /welcome) / not checked | - (live) | none | profile (insert, or update names+locale) |

#### GET /api/auth/{...nextauth}
- Evidence: `src/app/api/auth/[...nextauth]/route.ts:16`; service: src/auth.ts:44 NextAuth handlers (Auth.js v5)
- Auth: -; demo n/a; refusals in order: -
- Gate: none; off: n/a (always on). Prod: live
- Request: params Auth.js action path: session | csrf | providers | signin/<provider> | callback/<provider> | signout | error
- 200: Auth.js responses: GET /api/auth/session -> {user:{id,name,email,image},expires} | {}; /csrf -> {csrfToken}; /providers; /callback/google -> 302 + Set-Cookie session JWT
- Other answers: 302 redirects (pages.signIn=/signin, pages.error=/signin)
- Writes: user + account on first Google sign-in (DrizzleAdapter createUser/linkAccount) (static reach: none)
- Side effects: OAuth round-trip with Google (AUTH_GOOGLE_ID/SECRET) when configured; sets the session cookie: a JWE (A256CBC-HS512, key HKDF(AUTH_SECRET, salt=cookie name)), maxAge 30 days, callbacks put token.uid -> session.user.id (src/auth.ts:64-67)
- Notes: session strategy "jwt" (src/auth.ts:46): no session table read per request. Google allowDangerousEmailAccountLinking:false. trustHost:true.

#### POST /api/auth/{...nextauth}
- Evidence: `src/app/api/auth/[...nextauth]/route.ts:17`; service: src/auth.ts:44 handlers.POST; providers src/server/password-signin.ts:13 authorizePassword, src/server/telegram-signin.ts:25 authorizeTelegram
- Auth: -; demo n/a; refusals in order: -
- Gate: none; off: n/a (always on). Prod: live
- Request: body form-encoded Auth.js POSTs: callback/password {email,password,csrfToken}; callback/telegram {payload (base64url JSON of the Telegram Login Widget), csrfToken}; signout {csrfToken}; cap 16 KiB, streamed cap (chunked bodies too) then re-wrapped as a fresh NextRequest (route.ts:17-29)
- 200: Auth.js redirect/JSON; sets/clears the session cookie
- Other answers: 413 (empty) body over 16 KiB; password: RateLimited -> Auth.js error redirect
- Writes: telegram: user + account(provider telegram, type credentials) on first sign-in (src/server/users.ts upsertTelegramUser) (static reach: none)
- Side effects: password: one scrypt N=2^15,r=8,p=1 run per attempt (a dummy hash when no account) (src/lib/password.ts:30-65); hash format scrypt$N$r$p$salt$key (base64url); telegram: HMAC-SHA256 check of the widget payload with the bot token, max age TELEGRAM_MAX_AGE_SECONDS (src/lib/telegram.ts)
- Notes: Credentials providers "password" and "telegram" (src/auth.ts:51-62). The FastAPI port must read AND issue this exact cookie or every user is logged out at cutover.

#### POST /api/v1/register
- Evidence: `src/app/api/v1/register/route.ts:19`; service: src/server/users.ts:49 createPasswordUser
- Auth: -; demo n/a; refusals in order: -
- Gate: none; off: n/a (always on). Prod: live
- Request: body { email (trim, email, <=254), password (PASSWORD_MIN_LENGTH..PASSWORD_MAX_LENGTH), NameFields (first/last name; requireName superRefine, src/lib/name.ts), role: student|parent, lang?: en|uz|ru }; cap 8 KiB
- 200: 201 {id}
- Other answers: 429 {error:"too many"} retry-after 600; 413 {error:"too large"}; 400 {error:"invalid", issues:[path]}; 400 {error:"weak", reason, message} (passwordProblem, src/lib/password.ts:177); 409 {error:"exists"}
- Writes: user; password; profile; user_state (parent with lang: key jg.parent.lang) (static reach: password, profile, user, user_state)
- Side effects: one scrypt hash
- Notes: Does not sign in: the page then POSTs Auth.js credentials.

#### POST /api/v1/me/profile
- Evidence: `src/app/api/v1/me/profile/route.ts:10`; service: src/server/users.ts:90 upsertProfile
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: -
- Gate: none; off: n/a (always on). Prod: live
- Request: body { role: student|parent, NameFields, locale?: en|uz|ru } (requireName); cap 4 KiB
- 200: 200 the profile row (drizzle Profile: userId, role, fullName, firstName, lastName, locale, photoUrl, demo, roadmapLang, timezone, ...)
- Other answers: 401 {error:"unauthenticated"}; 413; 400 {error:"invalid", issues}; 409 {error:"role is fixed"} (existing profile with another role)
- Writes: profile (insert, or update names+locale) (static reach: profile)
- Notes: No x-jg-uid (the account may have no page yet). Role can be set once.

### engine/state (8)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/engine/snapshot` | student / required | - (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | GET WRITES: withStudent() inserts-if-missing engine_state, wallet, dream_build, streak_state and takes SELECT ... FOR UPDATE on engine_state (src/server/engine/context.ts:12-24); ensureDay(): expires sessions, closes past days (activity_day, streak), relanguage, healTakenBack, Phase D replan/complete, issues today/this week tasks (daily_task, task_batch), homework set (LESSONS), leftover chunk, weekly readiness_snapshot (src/server/engine/snapshot.ts:235-247); homework hwShown() marks the set shown (LESSONS) |
| PUT | `/api/v1/state/{key}` | student or parent (any profile) / required | - (live) | none | user_state upsert (user_id,key); student + ENGINE_LIVE + key jg.diag.v1\|jg.study.v1: migrateP0Blobs() (engine records) then stripServerOwned() (src/server/engine/projection.ts) |
| POST | `/api/v1/state/{key}` | student or parent (any profile) / required | - (live) | none | as PUT |
| DELETE | `/api/v1/state/{key}` | student or parent (any profile) / required | - (live) | none | user_state delete |
| POST | `/api/v1/study/sessions` | student / required | - (live) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | study_session insert (server clock: ends_at = now + minutes); withStudent ensure-rows + ensureDay writes |
| GET | `/api/v1/study/sessions/current` | student / required | - (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | withStudent + ensureDay writes (expires overdue sessions) |
| POST | `/api/v1/study/sessions/{id}/break` | student / required | - (live) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | study_session settle (minutes clamped to server time); dream_build.cracked (+date) on a break; activity_day refreshDay |
| POST | `/api/v1/study/sessions/{id}/complete` | student / required | - (live) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | study_session settle (complete only from ends_at-60s, else stopped with 0 bricks); brick_entry (+dbh_bonus during the double-brick hour) and dream_build.bricks (capped at target 600); xp_entry; engine_event session_completed; activity_day refreshDay |

#### GET /api/v1/engine/snapshot
- Evidence: `src/app/api/v1/engine/snapshot/route.ts:6`; service: src/server/engine/snapshot.ts:493 snapshot
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 EngineSnapshot (type src/server/engine/snapshot.ts:104-200+: v, engine_version, rules_version, profile_version, tz, local_date, diagnostic, unlocked, lang, derived, result, roadmap, narration, month?, truth?, way?, tasks{date:SnapshotTask[]}, done, week, wallet{coins}, streak, study, goal, profile, unis_uz, apps_check, apps_submitted, league, card, circles, ready, program, ...)
- Other answers: 403 {error:"demo"} only via apiUser
- Writes: GET WRITES: withStudent() inserts-if-missing engine_state, wallet, dream_build, streak_state and takes SELECT ... FOR UPDATE on engine_state (src/server/engine/context.ts:12-24); ensureDay(): expires sessions, closes past days (activity_day, streak), relanguage, healTakenBack, Phase D replan/complete, issues today/this week tasks (daily_task, task_batch), homework set (LESSONS), leftover chunk, weekly readiness_snapshot (src/server/engine/snapshot.ts:235-247); homework hwShown() marks the set shown (LESSONS) (static reach: achievement_award, activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, league_cohort, league_member, league_player, league_week, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, wallet)
- Side effects: may enqueue AI narration via refreshNarration (ai_job) when AI_LAYER on; static markers: anthropic-call
- Notes: Refreshed by the runtime on visibility, local midnight and after a commit. The heaviest read in the app; one transaction per call.

#### PUT /api/v1/state/{key}
- Evidence: `src/app/api/v1/state/[key]/route.ts:30`; service: src/server/state.ts:15 putState
- Auth: who() src/app/api/v1/state/[key]/route.ts:14; demo ALLOWED (no demo check); refusals in order: 401 (empty body) no session -> 409 (empty body) x-jg-uid mismatch -> 401 (empty body) no profile
- Gate: none; off: n/a (always on). Prod: live
- Request: params key (URL-decoded) in keysFor(role): student jia.settings|jia.medals|jia.gift|jg.diag.v1|jg.study.v1|jg.squad.v1|jg.seen.v1; parent jg.parent.lang (src/server/boot.ts:27-29); body raw text (the design localStorage value); cap 512 KiB (MAX_STATE_BYTES), streamed cap
- 200: 204 (empty)
- Other answers: 401/409 (empty); 413 (empty) over 512 KiB; 400 (empty) key not allowed; 503 (empty) P0 blob migration failed (StateError unavailable)
- Writes: user_state upsert (user_id,key); student + ENGINE_LIVE + key jg.diag.v1|jg.study.v1: migrateP0Blobs() (engine records) then stripServerOwned() (src/server/engine/projection.ts) (static reach: admission_prediction, ai_job, ai_run, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, task_batch, user_state, wallet)
- Side effects: jg.diag.v1: withoutCaptions() strips pre-check captions (src/server/jamol/privacy.ts); static markers: anthropic-call
- Notes: The design localStorage sync seam (public/runtime/jg-runtime.js). Demo accounts CAN write here (no demo check).

#### POST /api/v1/state/{key}
- Evidence: `src/app/api/v1/state/[key]/route.ts:31`; service: src/server/state.ts:15 putState (same handler as PUT)
- Auth: who() src/app/api/v1/state/[key]/route.ts:14; demo ALLOWED (no demo check); refusals in order: 401 (empty body) no session -> 409 (empty body) x-jg-uid mismatch -> 401 (empty body) no profile
- Gate: none; off: n/a (always on). Prod: live
- Request: params as PUT; body as PUT; cap 512 KiB
- 200: 204
- Other answers: as PUT
- Writes: as PUT (static reach: admission_prediction, ai_job, ai_run, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, task_batch, user_state, wallet)
- Side effects: static markers: anthropic-call
- Notes: keepalive/navigator.sendBeacon on page hide (route.ts:31).

#### DELETE /api/v1/state/{key}
- Evidence: `src/app/api/v1/state/[key]/route.ts:32`; service: src/server/state.ts:33 deleteState
- Auth: who() src/app/api/v1/state/[key]/route.ts:14; demo ALLOWED (no demo check); refusals in order: 401 (empty body) no session -> 409 (empty body) x-jg-uid mismatch -> 401 (empty body) no profile
- Gate: none; off: n/a (always on). Prod: live
- Request: params key in keysFor(role), or (student) a DEVICE_ONLY_KEYS key (src/server/jamol/privacy.ts)
- 200: 204
- Other answers: 401/409 (empty); 400 (empty) key
- Writes: user_state delete (static reach: user_state)

#### POST /api/v1/study/sessions
- Evidence: `src/app/api/v1/study/sessions/route.ts:9`; service: src/server/engine/study.ts:21 startSession
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { client_id (1..80), subject (1..40), task_id?: string<=80|null, minutes: int (25|50 else 400) }; cap 1 KiB
- 200: 201 {session: SessionView, dream} (new) | 200 {session, dream} (same client_id replay)
- Other answers: 409 {error:"running", session} another session running; 400 {error:"minutes"}; 403 {error:"demo"}; 404
- Writes: study_session insert (server clock: ends_at = now + minutes); withStudent ensure-rows + ensureDay writes (static reach: activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, wallet)
- Side effects: static markers: anthropic-call
- Notes: Task-linked: stores the task English code title, echoes the posted title (src/server/engine/study.ts:33-42).

#### GET /api/v1/study/sessions/current
- Evidence: `src/app/api/v1/study/sessions/current/route.ts:6`; service: src/server/engine/study.ts:89 currentSession
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {session: SessionView|null}
- Writes: withStudent + ensureDay writes (expires overdue sessions) (static reach: activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, wallet)
- Side effects: static markers: anthropic-call

#### POST /api/v1/study/sessions/{id}/break
- Evidence: `src/app/api/v1/study/sessions/[id]/break/route.ts:9`; service: src/server/engine/study.ts:72 breakSession
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: params id = the session client_id; body { reason (1..40): "stopped" = stop, anything else (e.g. left_app) = break }; cap 1 KiB
- 200: 200 {session, dream}
- Other answers: 404 {error:"session"}; 403 {error:"demo"}
- Writes: study_session settle (minutes clamped to server time); dream_build.cracked (+date) on a break; activity_day refreshDay (static reach: activity_day, dream_build, engine_state, streak_state, study_session, wallet)

#### POST /api/v1/study/sessions/{id}/complete
- Evidence: `src/app/api/v1/study/sessions/[id]/complete/route.ts:6`; service: src/server/engine/study.ts:46 completeSession
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: params id = the session client_id; body none read
- 200: 200 {session, dream}
- Other answers: 404 {error:"session"}; 403 {error:"demo"}
- Writes: study_session settle (complete only from ends_at-60s, else stopped with 0 bricks); brick_entry (+dbh_bonus during the double-brick hour) and dream_build.bricks (capped at target 600); xp_entry; engine_event session_completed; activity_day refreshDay (static reach: activity_day, brick_entry, dream_build, engine_event, engine_state, streak_state, study_session, wallet, xp_entry)

### diagnostics (2)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/engine/commit` | student / required | - (live) | engine-commit:<uid> 120/h (env RATE_ENGINE_COMMIT_PER_HOUR) | withStudent row lock; idempotent by engine_event.client_id (a repeat returns the first answer); diagnostic_done: diagnostic_answer (replace), profile.roadmap_lang, engine_state, recompute() -> engine_result, roadmap, roadmap_milestone, roadmap_change, admission_prediction, readiness_snapshot, rule_record reads, daily_task/task_batch, coin_entry +diagnostic_complete once (idem) + wallet; unlock: engine_state.unlocked_*, week tasks; way: diagnostic_answer WAY_KEY; app_submitted: admission_prediction.frozen_at; every kind: engine_event |
| POST | `/api/v1/phase-d/stub` | student / required | stubAllowed() = PHASE_D_CAT_STUB=1 && NODE_ENV!=production && no CAT in force (refused in production) | none | Phase D continuation stub: engine rows for a check set taken |

#### POST /api/v1/engine/commit
- Evidence: `src/app/api/v1/engine/commit/route.ts:13`; service: src/server/engine/commit.ts:50 commit; src/server/ailayer/draft.ts:57 waitForDraft; src/server/ailayer/worker.ts:23 wakeWorker
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { kind: COMMIT_KINDS (diagnostic_done|parallel|unlock|parent_flow_done|test_score|report_card|budget_changed|deep_done|diagnostic_restart|language|uz_programme|app_submitted|way, src/server/engine/commit.ts:34), base_version: int>=0, payload: object, client_id (1..80) }; cap 96 KiB
- 200: 200 {snapshot: EngineSnapshot, changes: Changes|null}
- Other answers: 409 {snapshot} base_version stale (fresh snapshot); 400|403|422 {error, detail} per kind: answers, parallel, not_done, reality_gap, lang, score, one_attempt, no_check, average, budget, programme, way, no_way, no_home, university, module, parent_consent_required, kind, demo
- Writes: withStudent row lock; idempotent by engine_event.client_id (a repeat returns the first answer); diagnostic_done: diagnostic_answer (replace), profile.roadmap_lang, engine_state, recompute() -> engine_result, roadmap, roadmap_milestone, roadmap_change, admission_prediction, readiness_snapshot, rule_record reads, daily_task/task_batch, coin_entry +diagnostic_complete once (idem) + wallet; unlock: engine_state.unlocked_*, week tasks; way: diagnostic_answer WAY_KEY; app_submitted: admission_prediction.frozen_at; every kind: engine_event (static reach: achievement_award, activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, league_cohort, league_member, league_player, league_week, profile, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, task_completion, wallet)
- Side effects: AI layer: may enqueue ai_job (narration/result draft) and wait up to draftWaitAfterMs for the first picture (waitForDraft), then wakeWorker(); static markers: anthropic-call
- Notes: Payload rules per kind: src/server/engine/commit.ts:62-230. Checks are taken only as the server graded them (verifyChecks/gradedChecks). The biggest single port: recompute + engine (src/engine, pure TS).

#### POST /api/v1/phase-d/stub
- Evidence: `src/app/api/v1/phase-d/stub/route.ts:10`; service: src/server/phase-d/hooks.ts:29 stubSet
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: stubAllowed() = PHASE_D_CAT_STUB=1 && NODE_ENV!=production && no CAT in force (src/server/phase-d/hooks.ts:28); off: 404 {error:"not found"}. Prod: refused in production
- Request: body { task (1..120) }; cap 512 B
- 200: 200 {snapshot}
- Other answers: {error} with service status
- Writes: Phase D continuation stub: engine rows for a check set taken (static reach: achievement_award, activity_day, coin_entry, dream_build, engine_state, league_cohort, league_member, league_player, league_week, streak_state, wallet)
- Side effects: static markers: anthropic-call
- Notes: Development only: refused in production. Port only if the walks need it.

### roadmap (4)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/engine/unis` | student / required | - (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | withStudent ensure-rows only |
| GET | `/api/v1/explore` | student / required | - (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |
| POST | `/api/v1/milestones/{id}/report` | student / required | - (live (core queue part M1)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | milestone_report (insert, on conflict nothing); moderation_item via queueMilestoneReport (src/server/core/review-items.ts) for the staff queue |
| GET | `/api/v1/milestones/reports` | student / required | - (not deployed (M1)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |

#### GET /api/v1/engine/unis
- Evidence: `src/app/api/v1/engine/unis/route.ts:6`; service: src/server/engine/snapshot.ts:502 unisUzOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {unis: UnisUz|null} (every Uzbek university record with this student verdict; null before a result)
- Writes: withStudent ensure-rows only (static reach: dream_build, engine_state, streak_state, wallet)

#### GET /api/v1/explore
- Evidence: `src/app/api/v1/explore/route.ts:17`; service: src/server/explore.ts:142 exploreCards, :115 whoOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, cards} (sourced Explore records, ordered/filtered by his own answers)
- Writes: none (static reach: none)
- Notes: Reads profile tz + diagnostic answers; writes nothing.

#### POST /api/v1/milestones/{id}/report
- Evidence: `src/app/api/v1/milestones/[id]/report/route.ts:6`; service: src/server/engine/coins.ts:75 reportMilestone
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live (core queue part M1)
- Request: params id = roadmap milestone id; body none read
- 200: 201 {reported:true} (new) | 200 {reported:true} (already reported)
- Other answers: 404 {error:"milestone"} not in current roadmap or undated; 403 {error:"demo"}
- Writes: milestone_report (insert, on conflict nothing); moderation_item via queueMilestoneReport (src/server/core/review-items.ts) for the staff queue (static reach: dream_build, engine_state, milestone_report, moderation_item, streak_state, wallet)
- Side effects: moderation submit may run the AI pre-check; static markers: anthropic-call

#### GET /api/v1/milestones/reports
- Evidence: `src/app/api/v1/milestones/reports/route.ts:10`; service: src/server/core/reports.ts:31 reportsOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: not deployed (M1)
- Request: none
- 200: 200 {reports:[{milestone_id, state, text (in her language), at}]}
- Writes: none (static reach: none)
- Notes: No switch (M1 core 6).

### tasks/proofs (3)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/tasks/{id}/complete` | student / required | PHASE_X selects the body schema (live) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | task_completion; daily_task status; coin_entry + wallet (the task coins once; tried quiz pays TRIED_COINS; lesson paid in the Lessons tab pays 0); activity_day/streak via markTaskDone; staff_checkpoint (PHASE_X L7); league XP/medals when LEAGUE on; withStudent + ensureDay writes |
| POST | `/api/v1/tasks/{id}/proof` | student / required | phaseXOn() = PHASE_X=1 (live) | proof:<uid> 20/h (env RATE_PROOF_UPLOAD_PER_HOUR) | proof_file (bytes in Postgres, sha256 dedupe) |
| GET | `/api/v1/checkpoints` | student / required | phaseXOn() = PHASE_X=1 (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |

#### POST /api/v1/tasks/{id}/complete
- Evidence: `src/app/api/v1/tasks/[id]/complete/route.ts:27`; service: src/server/engine/tasks.ts:167 completeTask
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: PHASE_X selects the body schema (BodyX, 40 KiB) vs P1 Body (4 KiB); off: P1 body: proof kinds quiz|link|upload|self_report only. Prod: live
- Request: params id = daily_task id; body P1: { proof: {kind:"quiz",run}|{kind:"link",url<=2000}|{kind:"upload",name<=300}|{kind:"self_report",text?<=2000}, client_id }; PHASE_X: + upload.file uuid?, {kind:"artifact",text<=ARTIFACT_MAX_CHARS}, {kind:"checkpoint",text?,url?,file?}; cap 4 KiB (P1) / 40 KiB (PHASE_X)
- 200: 200 {task_id, coins, day_complete, replay, balance, snapshot} | PHASE_X counselor step: 200 {..., coins:0, pending:true, checkpoint, pending_text}
- Other answers: 404 {error:"task"}; 409 {error:"client_id"|<status>|"not_today"}; 422 {error:"auto_event"|"deep"|"proof_kind"|proof check error, reasons?[]}; 403 {error:"demo"}
- Writes: task_completion; daily_task status; coin_entry + wallet (the task coins once; tried quiz pays TRIED_COINS; lesson paid in the Lessons tab pays 0); activity_day/streak via markTaskDone; staff_checkpoint (PHASE_X L7); league XP/medals when LEAGUE on; withStudent + ensureDay writes (static reach: achievement_award, activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, league_cohort, league_member, league_player, league_week, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, staff_checkpoint, streak_state, study_session, task_batch, task_completion, wallet)
- Side effects: static markers: anthropic-call
- Notes: Coin rules: src/server/engine/tasks.ts:207-224 ("giving up must not pay more than doing").

#### POST /api/v1/tasks/{id}/proof
- Evidence: `src/app/api/v1/tasks/[id]/proof/route.ts:15`; service: src/server/phase-x/upload.ts:33 saveTaskProof
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: phaseXOn() = PHASE_X=1 (src/server/strategy/switch.ts:19); off: 404 {error:"not found"} before auth. Prod: live
- Request: params id = daily_task id; body raw file (application/pdf | image/jpeg | image/png | image/webp), byte-checked; cap 4 MiB (PROOF_MAX_BYTES)
- 200: 200 {id}
- Other answers: 413 {error:"too large", reasons:[{code:"file_too_large", text}]}; 404 {error:"task"}; 409 {error:"proof_kind"|<task status>}; 415/422 {error, reasons:[{code,text}]}; 429 {error:"proof limit"} (PROOF_MAX_FILES_PER_STUDENT 30 / PROOF_MAX_MB_PER_STUDENT 64)
- Writes: proof_file (bytes in Postgres, sha256 dedupe) (static reach: proof_file)

#### GET /api/v1/checkpoints
- Evidence: `src/app/api/v1/checkpoints/route.ts:11`; service: src/server/phase-x/checkpoints.ts:68 checkpointsOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: phaseXOn() = PHASE_X=1 (src/server/strategy/switch.ts:19); off: 404 {error:"not found"} before auth. Prod: live
- Request: none
- 200: 200 {checkpoints:[{id, task_id, kind, status, text, note, at}]} (last 30 days, sentence in her language)
- Writes: none (static reach: none)

### coins (2)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/coins/spend` | student / required | - (live (coupon part M1)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | coin_entry (negative, idem spend:<client_id>) + wallet (CHECK >= 0); streak_state.freezes +1 and freeze_entry (o1); pay_coupon (d1 premium_30 / d3 pro_month) when PAYMENTS coupons open |
| POST | `/api/v1/coins/game` | student / required | - (live) | game-credit:<uid> 60/h (env RATE_GAME_CREDIT_PER_HOUR) | coin_entry reason game_result (capped per day by coinsFor) + wallet; idem game:<client_id> |

#### POST /api/v1/coins/spend
- Evidence: `src/app/api/v1/coins/spend/route.ts:9`; service: src/server/engine/coins.ts:23 spend
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live (coupon part M1)
- Request: body { amount: int, reason: shop|style|review|game_wager, ref (1..64), client_id (1..80) }; cap 1 KiB
- 200: 200 {balance, replay} (+ freezes for the streak freeze o1)
- Other answers: 400 {error:"amount"} (1..60000; freeze must equal COINS.freeze_price); 409 {error:"unavailable", balance} reason review; 409 {error:"freeze_cap", balance}; 409 {error:"insufficient", balance}; checkSpend refusals (src/server/games/shop.ts) incl. soon (+balance); 403 {error:"demo"}
- Writes: coin_entry (negative, idem spend:<client_id>) + wallet (CHECK >= 0); streak_state.freezes +1 and freeze_entry (o1); pay_coupon (d1 premium_30 / d3 pro_month) when PAYMENTS coupons open (static reach: coin_entry, dream_build, engine_state, freeze_entry, pay_coupon, streak_state, wallet)
- Notes: Ledger: src/server/engine/ledger.ts:36 debit. Idempotent per client_id.

#### POST /api/v1/coins/game
- Evidence: `src/app/api/v1/coins/game/route.ts:9`; service: src/server/engine/coins.ts:56 gameCredit
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { game (1..40), result: {coins:number, outcome?<=40}, client_id (1..80) }; cap 1 KiB
- 200: 200 {balance, replay, credited}
- Other answers: 400 {error:"result"}; 403 {error:"demo"}
- Writes: coin_entry reason game_result (capped per day by coinsFor) + wallet; idem game:<client_id> (static reach: coin_entry, dream_build, engine_state, streak_state, wallet)
- Notes: With GAMES_SERVER on it pays nothing (credited 0): only /games/result pays.

### lessons (4)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/lessons` | student / required | none for the route; lessonsOn() decides the shape (live (LESSONS on)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |
| GET | `/api/v1/lessons/{id}` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | lesson_progress insert opened_at (on conflict nothing) |
| POST | `/api/v1/lessons/{id}/piece` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | lesson_progress.pieces append (first answer stands) |
| GET | `/api/v1/lessons/week` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |

#### GET /api/v1/lessons
- Evidence: `src/app/api/v1/lessons/route.ts:21`; service: src/server/lessons.ts:62 lessonsFor, :147 coursesFor
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none for the route; lessonsOn() decides the shape; off: {lang, lessons} only, nothing of the lessons part read. Prod: live (LESSONS on)
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, lessons: LessonCard[]} | lessons on: {lang, lessons, courses: CourseView[] (src/server/lessons.ts:117), jia_card: boolean}
- Writes: none (static reach: none)

#### GET /api/v1/lessons/{id}
- Evidence: `src/app/api/v1/lessons/[id]/route.ts:18`; service: src/server/lessons.ts:213 lessonView
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: params id (URL-decoded lesson id); query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, lesson:{id,course,course_title,section,unit,skill,title,minutes,format,source,pieces:PieceView[],test,extra,next,writing?,speaking?,recording?}, progress:{opened_at,answered,of,test_out,passed,passed_at,missed}, level}
- Other answers: 404 {error:"not found"}
- Writes: lesson_progress insert opened_at (on conflict nothing) (static reach: lesson_progress)
- Notes: Piece questions as prompt + options under tokens; never a key or a why before she answers.

#### POST /api/v1/lessons/{id}/piece
- Evidence: `src/app/api/v1/lessons/[id]/piece/route.ts:19`; service: src/server/lessons/piece.ts:71 answerPiece
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: params id; query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body { n: 1..6, token?: string<=64|null, dontknow?: bool, text?: string<=120|null } strict; one of token/dontknow/text; cap 1 KiB
- 200: 200 PieceResult {ok, right:{t,text}, why, script?, text?} (+ again:true on a second answer)
- Other answers: 400 {error:"invalid"}; 404 {error:"not found"}
- Writes: lesson_progress.pieces append (first answer stands) (static reach: lesson_progress)
- Notes: Pays nothing, blocks nothing (C-5).

#### GET /api/v1/lessons/week
- Evidence: `src/app/api/v1/lessons/week/route.ts:17`; service: src/server/lessons/week.ts:124 weekSummary
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: none
- 200: 200 {week: WeekSummary {today, first_day, this_week, last_week}} (lessons finished, levels risen, homework handed in, minutes)
- Writes: none (static reach: none)

### homework (1)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/homework` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |

#### GET /api/v1/homework
- Evidence: `src/app/api/v1/homework/route.ts:18`; service: src/server/lessons/homework.ts:501 homeworkFor, src/server/lessons/hw-list.ts:12 listRow
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {today, homework: HwListRow[] (HwRow src/server/lessons/homework.ts:490 + titles, group today|missed|done)}
- Writes: none (static reach: none)
- Notes: Never an item or a key. Homework sets are created by ensureDay (snapshot) and played through /checks/quiz mode homework.

### checks/quiz (1)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/checks/{kind}` | student (demo allowed) / required | kind must be english\|math\|reading\|quiz (live) | checks:<uid> (demo: checks:<uid>:<client ip>) 400/h (env RATE_CHECKS_PER_HOUR) | check_run (one row per run, locked while grading); quiz that ends its task completes it in the same request: task_completion, coin_entry, wallet, activity_day (quizKept -> completeTask); CAT continuation sets -> engine rows (applyCheckSet); learner_skill/lesson_progress/homework_turn for lesson runs; demo runs pruned after 6 h |

#### POST /api/v1/checks/{kind}
- Evidence: `src/app/api/v1/checks/[kind]/route.ts:30`; service: src/server/checks.ts:130 diagnosticCheck (english|math|reading), :688 quizKept (quiz)
- Auth: apiUser(req,"student",{demo:true}) src/server/api.ts:15; demo allowed; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"students only"}
- Gate: kind must be english|math|reading|quiz; off: 404 {error:"kind"} BEFORE auth. Prod: live
- Request: params kind; body discriminated on op: start{grade?,lang?,task?,quiz?:english|math,run?,set?:"daily",mode?:test_out|test|homework|unit_test,lesson?,homework_id?,unit?} | answer{item,token?,value?,tokens?[<=6],late?,run?,dontknow?:true,text?,played?} | stop | hold{on} | read | hard | seen{item} | cancel (route.ts:7-20); cap 2 KiB
- 200: 200 the run view: next item {id, prompt, options under per-serving tokens, passage?, audio?} or the result; quiz answers also say the right option and its why; never a key (src/engine/checks.ts viewOf, src/server/cat/run.ts)
- Other answers: 400 {error:"token"|"task"|"op"|"set"}; 404 {error:"run"|"task"|"not_started"|"mode"}; 409 {error:"busy"|"too_fast"|"reread"|"not_failed"|"no_question"|"again_used"|"watch"|"tried"|"not_due"} (+ where the run stands); 429 {error:"attempts"} (QUIZ_ATTEMPTS 100)
- Writes: check_run (one row per run, locked while grading); quiz that ends its task completes it in the same request: task_completion, coin_entry, wallet, activity_day (quizKept -> completeTask); CAT continuation sets -> engine rows (applyCheckSet); learner_skill/lesson_progress/homework_turn for lesson runs; demo runs pruned after 6 h (static reach: activity_day, admission_prediction, ai_job, ai_run, check_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, wallet)
- Side effects: static markers: anthropic-call
- Notes: Graded on the server (owner 7 Oct A4). CAT engine src/server/cat/*, rollback switch JG_CHECKS_ENGINE=climb. JG_QUIZ_READ_MS tunes the too-fast rule. Hard parity target: per-serving token shuffle + timing rules.

### SAT (6)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/mock` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | may finalize an ended DTM/SAT sitting on read (mock_result, coin_entry) - static reach |
| POST | `/api/v1/mock` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | mock_result insert (kind sat) |
| GET | `/api/v1/mock/dtm` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | may finalize a timed-out sitting (dtm_sitting, mock_result) |
| POST | `/api/v1/mock/dtm` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live) | dtm-mock:<uid> 400/h (env RATE_CHECKS_PER_HOUR) | dtm_sitting; mock_result on finish |
| GET | `/api/v1/mock/sat` | student / required | satFullOn() = lessonsOn() && SAT_FULL=1 (off in prod (SAT_FULL)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | current() advances the stage chain on read (sat_sitting; coin_entry/lesson_skill at the end) |
| POST | `/api/v1/mock/sat` | student / required | satFullOn() = lessonsOn() && SAT_FULL=1 (off in prod (SAT_FULL)) | sat-mock:<uid> 400/h (env RATE_CHECKS_PER_HOUR) | sat_sitting; coin_entry + wallet and lesson_skill at the end |

#### GET /api/v1/mock
- Evidence: `src/app/api/v1/mock/route.ts:26`; service: src/server/lessons/mock.ts:50 mockFor
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, mock: MockView|null} (src/server/lessons/mock.ts:47; demo gets null)
- Writes: may finalize an ended DTM/SAT sitting on read (mock_result, coin_entry) - static reach (static reach: coin_entry, dtm_sitting, lesson_skill, mock_result, sat_sitting, wallet)

#### POST /api/v1/mock
- Evidence: `src/app/api/v1/mock/route.ts:34`; service: src/server/lessons/mock.ts:73 sendSatMock
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body { rw: int, math: int } (Bluebook section scores); cap 256 B
- 200: 200 {lang, mock}
- Other answers: 404 {error:"no_mock"}; 409 {error:"not_open"}; 400 {error:"scores"}
- Writes: mock_result insert (kind sat) (static reach: coin_entry, dtm_sitting, lesson_skill, mock_result, sat_sitting, wallet)

#### GET /api/v1/mock/dtm
- Evidence: `src/app/api/v1/mock/dtm/route.ts:30`; service: src/server/lessons/dtm-mock.ts:90 dtmSitting
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, sitting: DtmSittingView|null} (running: questions without keys, her answers, server now, seconds left; done: points by block)
- Writes: may finalize a timed-out sitting (dtm_sitting, mock_result) (static reach: dtm_sitting, mock_result)

#### POST /api/v1/mock/dtm
- Evidence: `src/app/api/v1/mock/dtm/route.ts:38`; service: src/server/lessons/dtm-mock.ts:109 startDtm, :134 saveDtm, :156 finishDtm
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body {op:"start"} | {op:"save", answers:{"<n>": token|null}} | {op:"finish"}; cap 8 KiB
- 200: 200 {lang, sitting}
- Other answers: 400 {error:"answer"}; 404 {error:"no_mock"|"no_sitting"}; 409 {error:"not_open"|"done"|"time_up"|"sat_before"}
- Writes: dtm_sitting; mock_result on finish (static reach: dtm_sitting, mock_result)
- Notes: One clock per sitting, server-graded.

#### GET /api/v1/mock/sat
- Evidence: `src/app/api/v1/mock/sat/route.ts:33`; service: src/server/lessons/sat-full.ts:243 satSitting
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: satFullOn() = lessonsOn() && SAT_FULL=1 (src/server/lessons/sat-switch.ts:15); off: 404 {error:"not found"} before auth. Prod: off in prod (SAT_FULL)
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, sitting: SatSittingView|null} (src/server/lessons/sat-full.ts:114)
- Writes: current() advances the stage chain on read (sat_sitting; coin_entry/lesson_skill at the end) (static reach: coin_entry, lesson_skill, sat_sitting, wallet)

#### POST /api/v1/mock/sat
- Evidence: `src/app/api/v1/mock/sat/route.ts:41`; service: src/server/lessons/mock-plan.ts:41 herMock; src/server/lessons/sat-full.ts:251 startSat, :282 saveSat, :311 endStage
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: satFullOn() = lessonsOn() && SAT_FULL=1 (src/server/lessons/sat-switch.ts:15); off: 404 {error:"not found"} before auth. Prod: off in prod (SAT_FULL)
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body {op:"start"} | {op:"save", stage: rw1|rw2|break|math1|math2, answers?:{"<n>": token|typed|null}, marks?: int[<=30]} | {op:"end", stage}; cap 8 KiB
- 200: 200 {lang, sitting}
- Other answers: 400 {error:"answer"}; 404 {error:"no_sitting"|"no_test"}; 409 {error:"not_open"|"done"|"stage"|"sat_before"}
- Writes: sat_sitting; coin_entry + wallet and lesson_skill at the end (static reach: coin_entry, lesson_skill, sat_sitting, wallet)

### listening (2)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/listening/{file}` | student, non-demo (by cookie: an <audio> sends no header) / not sent | listeningOn() = lessonsOn() && LISTENING=1 (off in prod (LISTENING)) | listen-read:<uid> 1200/h (RATE_LISTEN_READ_PER_HOUR) | - |
| HEAD | `/api/v1/listening/{file}` | student, non-demo / not sent | listeningOn() = lessonsOn() && LISTENING=1 (off in prod (LISTENING)) | listen-read:<uid> 1200/h | - |

#### GET /api/v1/listening/{file}
- Evidence: `src/app/api/v1/listening/[file]/route.ts:24`; service: src/server/listening/audio.ts clipResponse
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: -
- Gate: listeningOn() = lessonsOn() && LISTENING=1 (src/server/lessons/switch.ts:76); off: 404 {error:"not found"} before auth. Prod: off in prod (LISTENING)
- Request: params file (URL-decoded; must be a valid clip of the bank); query ?v=<version hash>; headers Range bytes=a-b | a- | -n; If-Range; If-None-Match
- 200: 200/206 audio bytes (content-type from the clip), ETag, cache private immutable when ?v is current else no-cache revalidate; nosniff; CSP none
- Other answers: 401 {error:"unauthenticated"}; 404 {error:"not found"} parent, demo, not a clip; 304; 416
- Writes: none (static reach: none)
- Streaming: byte ranges
- Notes: Also reached as /media/listening/<file> via next.config.ts:10 rewrite (beforeFiles), so public/media/listening files are never served ungated. Files on disk: JG_LISTENING_DIR / public/media/listening.

#### HEAD /api/v1/listening/{file}
- Evidence: `src/app/api/v1/listening/[file]/route.ts:25`; service: as GET (head:true)
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: -
- Gate: listeningOn() = lessonsOn() && LISTENING=1 (src/server/lessons/switch.ts:76); off: 404 {error:"not found"} before auth. Prod: off in prod (LISTENING)
- Request: params file
- 200: headers only
- Other answers: as GET
- Writes: none (static reach: none)

### speaking/voice (4)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/lessons/{id}/speaking` | student / required | speakingOn() = lessonsOn() && SPEAKING=1 (live (SPEAKING on)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | speaking_practice (attempt row on first open) - static reach |
| POST | `/api/v1/lessons/{id}/speaking` | student / required | speakingOn() = lessonsOn() && SPEAKING=1 (live (SPEAKING on)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | speaking_practice (timers on the server clock); check: lesson_progress, coin_entry + wallet (self-report rate, once, only when no timer was cut short) |
| GET | `/api/v1/lessons/{id}/speaking/voice` | student / required | speakingVoiceOn() = speakingOn() && AI_LAYER=1 && SPEAKING_VOICE=1 (off in prod (SPEAKING_VOICE)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |
| POST | `/api/v1/lessons/{id}/speaking/voice` | student / required | speakingVoiceOn() = speakingOn() && AI_LAYER=1 && SPEAKING_VOICE=1 (off in prod (SPEAKING_VOICE)) | voice:<uid> 20/h (RATE_VOICE_WRITE_PER_HOUR) | ai_run (feedback, keeps up to 3 phrases) |

#### GET /api/v1/lessons/{id}/speaking
- Evidence: `src/app/api/v1/lessons/[id]/speaking/route.ts:28`; service: src/server/lessons/speaking.ts:90 speakingView
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: speakingOn() = lessonsOn() && SPEAKING=1 (src/server/lessons/switch.ts:69); off: 404 {error:"not found"} before auth. Prod: live (SPEAKING on)
- Request: params id; query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, speaking: SpeakingView (src/server/lessons/speaking.ts:41: card, warm-up lists, timers, outline, self-check lines, attempt state, seconds left)}
- Other answers: 404 {error:"not found"}
- Writes: speaking_practice (attempt row on first open) - static reach (static reach: speaking_practice)
- Notes: No audio, no text of her talk.

#### POST /api/v1/lessons/{id}/speaking
- Evidence: `src/app/api/v1/lessons/[id]/speaking/route.ts:38`; service: src/server/lessons/speaking.ts:106 stepSpeaking
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: speakingOn() = lessonsOn() && SPEAKING=1 (src/server/lessons/switch.ts:69); off: 404 {error:"not found"} before auth. Prod: live (SPEAKING on)
- Request: params id; query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body { step: plan|talk|end|check, ticks?: {<line<=40>: bool} } strict; cap 4 KiB
- 200: 200 {lang, speaking, pays}
- Other answers: 404 {error:"not_found"}; 409 {error:"no_plan"|"no_talk"} step out of order; 422 {error:"ticks"}
- Writes: speaking_practice (timers on the server clock); check: lesson_progress, coin_entry + wallet (self-report rate, once, only when no timer was cut short) (static reach: coin_entry, lesson_progress, speaking_practice, wallet)

#### GET /api/v1/lessons/{id}/speaking/voice
- Evidence: `src/app/api/v1/lessons/[id]/speaking/voice/route.ts:28`; service: src/server/lessons/speaking-voice.ts:137 voiceStatus
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: speakingVoiceOn() = speakingOn() && AI_LAYER=1 && SPEAKING_VOICE=1 (src/server/lessons/switch.ts:93); off: 404 {error:"not found"} before auth. Prod: off in prod (SPEAKING_VOICE)
- Request: params id
- 200: 200 {voice: VoiceStatus {on, left, parts, min_s, max_s}} (on:false when the AI layer is off or no notice in force)
- Other answers: 404
- Writes: none (static reach: none)
- Side effects: static markers: anthropic-call

#### POST /api/v1/lessons/{id}/speaking/voice
- Evidence: `src/app/api/v1/lessons/[id]/speaking/voice/route.ts:37`; service: src/server/lessons/speaking-voice.ts:158 voiceFeedback, :144 voiceType
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: speakingVoiceOn() = speakingOn() && AI_LAYER=1 && SPEAKING_VOICE=1 (src/server/lessons/switch.ts:93); off: 404 {error:"not found"} before auth. Prod: off in prod (SPEAKING_VOICE)
- Request: params id; query ?part=1|2|3&seconds=<n>&consent=1&lang=; body raw audio (audio/webm | audio/ogg | audio/mp4, sniffed); cap 3 MiB (VOICE_MAX_BYTES)
- 200: 200 {lang, voice: VoiceView {part, seconds, transcript, feedback|null, why, left}}
- Other answers: 422 {error:"consent"} (checked before the body is read); 413 {error:"too large"}; 415 {error:"type"} (bytes zeroed); 404 not_found; 422 part|too_short|too_long|too_little|bad_audio; 403 off; 429 limit; 503 unavailable|busy
- Writes: ai_run (feedback, keeps up to 3 phrases) (static reach: ai_run)
- Side effects: POST audio to the self-hosted Whisper service WHISPER_URL/transcribe (Bearer WHISPER_TOKEN, timeout WHISPER_TIMEOUT_MS 120 s) (src/server/speech/transcribe.ts:27-54); one Claude call for feedback through the AI layer; audio never stored; buffer wiped after transcript; static markers: anthropic-call, fetch, whisper
- Notes: No coins ever.

### writing (2)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/lessons/{id}/writing` | student / required | writingOn() = lessonsOn() && WRITING=1 (live (WRITING on)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | writing_piece opened_at on first GET (C-19 4-minute clock starts) |
| POST | `/api/v1/lessons/{id}/writing` | student / required | writingOn() = lessonsOn() && WRITING=1 (live (WRITING on)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | writing_piece; ai_run (feedback when the AI layer is on); revision: lesson_progress + coin_entry + wallet once |

#### GET /api/v1/lessons/{id}/writing
- Evidence: `src/app/api/v1/lessons/[id]/writing/route.ts:26`; service: src/server/lessons/writing.ts:164 writingView
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: writingOn() = lessonsOn() && WRITING=1 (src/server/lessons/switch.ts:62); off: 404 {error:"not found"} before auth. Prod: live (WRITING on)
- Request: params id; query ?lang=uz|ru|en (else profile.roadmap_lang, else en)
- 200: 200 {lang, writing: WritingView (src/server/lessons/writing.ts:144: question/data, what to write, criteria names, draft, feedback, revision, done)}
- Other answers: 404 {error:"not found"}
- Writes: writing_piece opened_at on first GET (C-19 4-minute clock starts) (static reach: writing_piece)

#### POST /api/v1/lessons/{id}/writing
- Evidence: `src/app/api/v1/lessons/[id]/writing/route.ts:36`; service: src/server/lessons/writing.ts:178 sendWriting
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: writingOn() = lessonsOn() && WRITING=1 (src/server/lessons/switch.ts:62); off: 404 {error:"not found"} before auth. Prod: live (WRITING on)
- Request: params id; query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body { stage: draft|revision, text <=4000 } strict; cap 16 KiB
- 200: 200 {lang, writing, pays}
- Other answers: 404 {error:"not_found"}; 409 {error:"draft_sent"|"no_draft"}; 422 {error:"too_short"|"too_long"|"too_soon" (+wait_s)|"same"}
- Writes: writing_piece; ai_run (feedback when the AI layer is on); revision: lesson_progress + coin_entry + wallet once (static reach: ai_run, coin_entry, lesson_progress, wallet, writing_piece)
- Side effects: draft feedback: one Claude call through the AI layer when layerOn(), else the lesson self-check; never a band; static markers: anthropic-call

### video (6)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/lessons/{id}/watch` | student / required | videoOn() = lessonsOn() && VIDEO_LESSONS=1 (off in prod (VIDEO_LESSONS)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | video_watch (seconds counted once, never faster than the clock from the first served byte) |
| GET | `/api/v1/video/{clip}/{file}` | the signed-in account the URL was signed for, while it may watch the lesson / not sent (<video>) | videoOn() = lessonsOn() && VIDEO_LESSONS=1 (off in prod (VIDEO_LESSONS)) | video:<uid> 3000/h (RATE_VIDEO_PER_HOUR) | video_watch first served byte of v.mp4 (servedClip) - starts her watch clock |
| HEAD | `/api/v1/video/{clip}/{file}` | as GET / not sent | videoOn() = lessonsOn() && VIDEO_LESSONS=1 (off in prod (VIDEO_LESSONS)) | video:<uid> 3000/h | - |
| POST | `/api/v1/staff/video` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / required | videoOn() = lessonsOn() && VIDEO_LESSONS=1 (off in prod (VIDEO_LESSONS)) | staff-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | video_source; video_clip; entitlement (grant/revoke Online Premium) |
| PUT | `/api/v1/staff/video/upload` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / required | videoOn() = lessonsOn() && VIDEO_LESSONS=1 (off in prod (VIDEO_LESSONS)) | staff-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | video_source |
| PUT | `/api/v1/staff/video/captions` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / required | videoOn() = lessonsOn() && VIDEO_LESSONS=1 (off in prod (VIDEO_LESSONS)) | staff-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | video_clip / video_source captions |

#### POST /api/v1/lessons/{id}/watch
- Evidence: `src/app/api/v1/lessons/[id]/watch/route.ts:17`; service: src/server/video/lesson.ts:84 recordWatch
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: videoOn() = lessonsOn() && VIDEO_LESSONS=1 (src/server/lessons/switch.ts:83); off: 404 {error:"not found"} before auth. Prod: off in prod (VIDEO_LESSONS)
- Request: params id; body { clip <=64, played: [[start,end] number pairs] <=200 }; cap 8 KiB
- 200: 200 {clip, watched (fraction), open (the lesson test opens at 80 %)}
- Other answers: 404 {error:"not found"} clip of another lesson / not ready / may not watch
- Writes: video_watch (seconds counted once, never faster than the clock from the first served byte) (static reach: video_watch)

#### GET /api/v1/video/{clip}/{file}
- Evidence: `src/app/api/v1/video/[clip]/[file]/route.ts:57`; service: src/app/api/v1/video/[clip]/[file]/route.ts:26 serve; src/server/video/access.ts:36 mayWatch; src/server/video/lesson.ts:78 servedClip
- Auth: auth() + verifySig HMAC (src/server/video/sign.ts, AUTH_SECRET); demo n/a; refusals in order: 404 everything (switch off, bad file, bad sig, no store, clip not ready, may not watch) -> 403 {error:"expired"}
- Gate: videoOn() = lessonsOn() && VIDEO_LESSONS=1 (src/server/lessons/switch.ts:83); off: 404 {error:"not found"} before auth. Prod: off in prod (VIDEO_LESSONS)
- Request: params clip uuid, file v.mp4|p.jpg|uz.vtt|ru.vtt|en.vtt; query ?e=<expiry s>&s=<sig>; headers Range
- 200: 200/206 bytes, cache private max-age<=ttl, nosniff, noindex
- Other answers: 416
- Writes: video_watch first served byte of v.mp4 (servedClip) - starts her watch clock (static reach: video_watch)
- Side effects: static markers: fs-write
- Streaming: byte ranges
- Notes: Store: VIDEO_DIR local disk (src/server/video/store.ts).

#### HEAD /api/v1/video/{clip}/{file}
- Evidence: `src/app/api/v1/video/[clip]/[file]/route.ts:58`; service: as GET (head:true; never starts the clock)
- Auth: as GET; demo n/a; refusals in order: -
- Gate: videoOn() = lessonsOn() && VIDEO_LESSONS=1 (src/server/lessons/switch.ts:83); off: 404 {error:"not found"} before auth. Prod: off in prod (VIDEO_LESSONS)
- Request: params as GET
- 200: headers only
- Writes: none (static reach: video_watch)
- Side effects: static markers: fs-write

#### POST /api/v1/staff/video
- Evidence: `src/app/api/v1/staff/video/route.ts:13`; service: src/server/video/staff.ts:44 registerInbox, :72 setTeacher, :115 cutClips, :141 attachWhole, :154 removeClip, :164 dropOriginal, :175 grant, :187 revoke
- Auth: staffUser(req,{write:true}) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: videoOn() = lessonsOn() && VIDEO_LESSONS=1 (src/server/lessons/switch.ts:83); off: 404 {error:"not found"} before auth. Prod: off in prod (VIDEO_LESSONS)
- Request: body { op: register|teacher|cut|whole|remove|drop_original|grant|revoke, ...passthrough (name, source, consent, lesson, clips, clip, who, student) }; cap 16 KiB
- 200: per op {body} with its status (src/server/video/staff.ts Out)
- Writes: video_source; video_clip; entitlement (grant/revoke Online Premium) (static reach: entitlement, video_clip, video_source)
- Side effects: ffmpeg/ffprobe child processes cut clips and posters (FFMPEG_PATH/FFPROBE_PATH, src/server/video/ffmpeg.ts:52); files under VIDEO_DIR; static markers: child-process, fs-write

#### PUT /api/v1/staff/video/upload
- Evidence: `src/app/api/v1/staff/video/upload/route.ts:13`; service: src/server/video/staff.ts:56 uploadSource
- Auth: staffUser(req,{write:true}) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: videoOn() = lessonsOn() && VIDEO_LESSONS=1 (src/server/lessons/switch.ts:83); off: 404 {error:"not found"} before auth. Prod: off in prod (VIDEO_LESSONS)
- Request: query ?name=<file name>; body raw video stream (never held in memory); cap VIDEO_MAX_UPLOAD_MB; refused when the disk would keep < 1 GB free
- 200: {body} with status
- Writes: video_source (static reach: video_source)
- Side effects: streams to disk, probes with ffprobe; static markers: child-process, fs-write
- Notes: export const maxDuration = 3600. Caddy request_body max_size 12MB (deploy/servercore/caddy-block.txt) would cut real uploads.

#### PUT /api/v1/staff/video/captions
- Evidence: `src/app/api/v1/staff/video/captions/route.ts:12`; service: src/server/video/staff.ts:79 putCaptions
- Auth: staffUser(req,{write:true}) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: videoOn() = lessonsOn() && VIDEO_LESSONS=1 (src/server/lessons/switch.ts:83); off: 404 {error:"not found"} before auth. Prod: off in prod (VIDEO_LESSONS)
- Request: query ?target=source|clip&id=..&lang=uz|ru|en; body raw WebVTT; cap 512 KiB (MAX_VTT_BYTES; Content-Length checked first)
- 200: {body} with status
- Other answers: 400 {error:"vtt"}
- Writes: video_clip / video_source captions (static reach: video_clip, video_source)
- Side effects: writes .vtt files (whole recording cut per clip); static markers: fs-write

### parent (7)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/parent/children/{studentId}/week` | parent / required | - (live) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | runs the CHILD engine under her lock: withStudent + ensureDay + refreshDay writes (a parent read writes the child rows) |
| POST | `/api/v1/parent/alerts` | parent / required | parentLessonsOn() = lessonsOn() && LESSONS_PARENT=1 (live (LESSONS_PARENT on)) | parent-alerts:<uid> 20/h (env RATE_FAMILY_CHECK_PER_HOUR) | parent_alert upsert |
| POST | `/api/v1/parent/notes` | parent / required | parentM1On() = PARENT_M1=1 (not deployed (M1)) | congrats:<uid> 20/h (env RATE_FAMILY_CHECK_PER_HOUR) | parent_note (insert, once per event; words written by rule); parentChild() builds the child view: runs the child engine (withStudent/ensureDay writes, static reach) |
| POST | `/api/v1/notes/seen` | student / required | parentM1On() = PARENT_M1=1 (not deployed (M1)) | none | parent_note.seen_at |
| GET | `/api/v1/pledges` | student (own) or linked parent (?student_id=) / required (409) | parentM1On() = PARENT_M1=1 (not deployed (M1)) | none | GET WRITES: pledge.status active->reached / ended as dates and counts pass (src/server/pledges/store.ts:78-81) |
| POST | `/api/v1/pledges` | parent / required | parentM1On() = PARENT_M1=1 (not deployed (M1)) | pledge:<uid> 20/h (env RATE_FAMILY_CHECK_PER_HOUR) | pledge |
| POST | `/api/v1/pledges/{id}` | student (seen) or the parent who made it (give\|end) / required (409) | parentM1On() = PARENT_M1=1 (not deployed (M1)) | none | pledge status/given_at/seen_at |

#### GET /api/v1/parent/children/{studentId}/week
- Evidence: `src/app/api/v1/parent/children/[studentId]/week/route.ts:6`; service: src/server/engine/parent.ts:102 parentWeek
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: params studentId (URL-decoded); query ?start=YYYY-MM-DD (another 7-day window)
- 200: 200 ParentWeek {student_id, tz, local_date, start, end, computed_at, streak{current,best,best_end,days_active_pct,calendar[35]}, study{bricks,minutes,minutes_prev_week,per_day}, tasks{done,of,missed,missed_by_weekday}, deadlines[<=5], readiness{overall,week_from,goal,chance}, dream} (src/server/engine/parent.ts:134-146)
- Other answers: 400 {error:"invalid"} bad start; 403 {error:"not linked"}
- Writes: runs the CHILD engine under her lock: withStudent + ensureDay + refreshDay writes (a parent read writes the child rows) (static reach: activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, wallet)
- Side effects: static markers: anthropic-call

#### POST /api/v1/parent/alerts
- Evidence: `src/app/api/v1/parent/alerts/route.ts:13`; service: src/server/parent/alert-pref.ts:12 saveAlerts
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: parentLessonsOn() = lessonsOn() && LESSONS_PARENT=1 (src/server/lessons/switch.ts:55); off: 404 {error:"not found"} before auth. Prod: live (LESSONS_PARENT on)
- Request: body { student_id (1..80), missed_homework?: bool, level_drop?: bool, inactivity?: bool } strict (absent = unchanged); cap 256 B
- 200: 200 {ok:true, alerts:{missed_homework, level_drop, inactivity}}
- Other answers: 403 {error:"not linked"}; 404
- Writes: parent_alert upsert (static reach: parent_alert)
- Notes: Sends nothing to anyone: in-app alerts only.

#### POST /api/v1/parent/notes
- Evidence: `src/app/api/v1/parent/notes/route.ts:14`; service: src/server/parent/child.ts:182 parentChild; src/server/notes/store.ts:44 congratulate, :22 eventsOf
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: parentM1On() = PARENT_M1=1 (src/server/parent/m1-switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { student_id (1..80), event (1..160) } strict; cap 512 B
- 200: 200 {ok:true, again} (again: the event was congratulated before)
- Other answers: 403 {error:"not linked"}; 404 {error:"no such event"}
- Writes: parent_note (insert, once per event; words written by rule); parentChild() builds the child view: runs the child engine (withStudent/ensureDay writes, static reach) (static reach: activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, parent_note, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, wallet)
- Side effects: static markers: anthropic-call

#### POST /api/v1/notes/seen
- Evidence: `src/app/api/v1/notes/seen/route.ts:8`; service: src/server/notes/store.ts:58 seenNotes
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: parentM1On() = PARENT_M1=1 (src/server/parent/m1-switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { ids: string(1..80)[] <=20 } strict; cap 2 KiB
- 200: 200 {ok:true}
- Writes: parent_note.seen_at (static reach: parent_note)

#### GET /api/v1/pledges
- Evidence: `src/app/api/v1/pledges/route.ts:14`; service: src/server/pledges/store.ts:68 pledgesFor, :34 linked
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 403 {error:"demo"} (also when no profile) -> 403 {error:"not linked"} parent
- Gate: parentM1On() = PARENT_M1=1 (src/server/parent/m1-switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: query parent: ?student_id=
- 200: 200 {pledges:[...]}
- Writes: GET WRITES: pledge.status active->reached / ended as dates and counts pass (src/server/pledges/store.ts:78-81) (static reach: pledge)

#### POST /api/v1/pledges
- Evidence: `src/app/api/v1/pledges/route.ts:28`; service: src/server/pledges/store.ts:53 createPledge
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: parentM1On() = PARENT_M1=1 (src/server/parent/m1-switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { student_id, goal: bricks|tasks|streak, target: int 1..10000, reward (1..200), due: month|next } strict; cap 1 KiB
- 200: 201 {id, pledges}
- Other answers: 403 {error:"not linked"}; 409 {error:"too many"} (>3 open); 400 {error:"invalid"}
- Writes: pledge (static reach: pledge)

#### POST /api/v1/pledges/{id}
- Evidence: `src/app/api/v1/pledges/[id]/route.ts:13`; service: src/server/pledges/store.ts:92 actOnPledge, :99 seenPledges
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: 401 -> 409 {error:"wrong account"} -> 403 {error:"demo"} -> 403 {error:"students only"|"parents only"}
- Gate: parentM1On() = PARENT_M1=1 (src/server/parent/m1-switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { action: give|end|seen } strict; cap 256 B
- 200: 200 {ok:true}
- Other answers: 409 {error:"not yours or not in that state"}
- Writes: pledge status/given_at/seen_at (static reach: pledge)

### family (6)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/family` | student / checked only when present (409 when it differs) | - (live) | none | family_code insert when no fresh code (TTL 3 days) |
| POST | `/api/v1/family/code` | student / not checked | - (live) | none | family_code (old codes retired, new one) |
| POST | `/api/v1/family/join` | parent / not checked | - (live) | join:<uid> 20/h (RATE_JOIN_PER_ACCOUNT_HOUR); join-ip:<ip> 60/h (RATE_JOIN_PER_IP_HOUR) | family_link; family_code expires_at=now (used) |
| DELETE | `/api/v1/family/parents/{parentId}` | student / not checked | - (live) | none | family_link delete; that parent family_code retired |
| POST | `/api/v1/family/check` | parent / required | - (live) | family-check:<uid> 20/h (env RATE_FAMILY_CHECK_PER_HOUR) | child engine under her lock: diagnostic_answer (source parent), engine_state.parent_flow_done_at / parent_consent_at, recompute (roadmap etc.), engine_event (idem parent:<pid>:<client_id>) |
| POST | `/api/v1/family/study` | parent / required | - (live) | family-check:<uid> 20/h (env RATE_FAMILY_CHECK_PER_HOUR) | study_consent (parent_id, answer, answered_at, version) |

#### GET /api/v1/family
- Evidence: `src/app/api/v1/family/route.ts:10`; service: src/server/family.ts:59 linkedParents, :21 currentFamilyCode
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} only if the header is sent and differs -> 403 {error:"students only"}
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {parents:[...], code}
- Writes: family_code insert when no fresh code (TTL 3 days) (static reach: family_code)
- Notes: Demo not refused here.

#### POST /api/v1/family/code
- Evidence: `src/app/api/v1/family/code/route.ts:6`; service: src/server/family.ts:72 rotateFamilyCode
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: 401 -> 403 {error:"students only"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body none
- 200: 200 {code}
- Writes: family_code (old codes retired, new one) (static reach: family_code)
- Notes: No x-jg-uid and no body: relies on SameSite=Lax cookies against CSRF.

#### POST /api/v1/family/join
- Evidence: `src/app/api/v1/family/join/route.ts:12`; service: src/server/family.ts:33 joinFamily
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: 401 -> 429 {error:"too many"} (before the role check) -> 403 {error:"parents only"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { code <=200 }; cap 1 KiB
- 200: 200 {studentId}
- Other answers: 413; 400 {error:"invalid"}; 410 {error:"expired"}; 409 {error:"full"} (MAX_PARENTS 2)
- Writes: family_link; family_code expires_at=now (used) (static reach: family_code, family_link)
- Notes: Per-student lock: one join at a time.

#### DELETE /api/v1/family/parents/{parentId}
- Evidence: `src/app/api/v1/family/parents/[parentId]/route.ts:6`; service: src/server/family.ts:81 unlinkParent
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: 401 -> 403 {error:"students only"}
- Gate: none; off: n/a (always on). Prod: live
- Request: params parentId
- 200: 204 (empty)
- Other answers: 404 {error:"not linked"}
- Writes: family_link delete; that parent family_code retired (static reach: family_code, family_link)

#### POST /api/v1/family/check
- Evidence: `src/app/api/v1/family/check/route.ts:9`; service: src/server/engine/parent.ts:85 familyCheck
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { student_id?<=80, answers: object (money/family questions M7, M8 + m0_parent_contact only), consent: bool, language <=8, client_id (1..80) }; cap 16 KiB
- 200: 200 {changes}
- Other answers: 403 {error:"not linked"|"demo"}; 400|422 {error:"answers", detail}
- Writes: child engine under her lock: diagnostic_answer (source parent), engine_state.parent_flow_done_at / parent_consent_at, recompute (roadmap etc.), engine_event (idem parent:<pid>:<client_id>) (static reach: activity_day, admission_prediction, ai_job, ai_run, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, study_session, task_batch, task_completion, wallet)
- Side effects: may enqueue AI narration; static markers: anthropic-call

#### POST /api/v1/family/study
- Evidence: `src/app/api/v1/family/study/route.ts:12`; service: src/server/outcomes/study.ts:86 answerStudy
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { student_id (1..80), answer: yes|no } strict; cap 256 B
- 200: 200 {ok:true}
- Other answers: 403 {error:"not linked"}; 404 {error:"not asked"}
- Writes: study_consent (parent_id, answer, answered_at, version) (static reach: study_consent)

### staff (3)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/staff/checkpoints` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / not checked (read) | phaseXOn() = PHASE_X=1 (live (STAFF_USER_IDS gates)) | staff-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |
| POST | `/api/v1/staff/checkpoints/{id}` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / required | phaseXOn() = PHASE_X=1 (live (STAFF_USER_IDS gates)) | staff-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | staff_checkpoint decision; approve of a waiting task: task_completion, daily_task, coin_entry + wallet, activity_day (student lock) |
| GET | `/api/v1/staff/proofs/{id}` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / not checked (read) | phaseXOn() = PHASE_X=1 (live (STAFF_USER_IDS gates)) | staff-file:<uid> 1200/h (env RATE_PHOTO_READ_PER_HOUR) | - |

#### GET /api/v1/staff/checkpoints
- Evidence: `src/app/api/v1/staff/checkpoints/route.ts:10`; service: src/server/phase-x/checkpoints.ts:49 listCheckpoints
- Auth: staffUser(req) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 404 demo or no profile
- Gate: phaseXOn() = PHASE_X=1 (src/server/strategy/switch.ts:19); off: 404 {error:"not found"} before auth. Prod: live (STAFF_USER_IDS gates)
- Request: query ?status=open|approved|returned (default open)&student=<id>
- 200: 200 {checkpoints:[{id, kind, status, completes, payload, createdAt, student name/lang ...}]}
- Other answers: 400 {error:"status"}
- Writes: none (static reach: none)

#### POST /api/v1/staff/checkpoints/{id}
- Evidence: `src/app/api/v1/staff/checkpoints/[id]/route.ts:19`; service: src/server/phase-x/review.ts:48 approveCheckpoint, :49 returnCheckpoint
- Auth: staffUser(req,{write:true}) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: phaseXOn() = PHASE_X=1 (src/server/strategy/switch.ts:19); off: 404 {error:"not found"} before auth. Prod: live (STAFF_USER_IDS gates)
- Request: params id; body {action:"approve"} strict | {action:"return", reason: not_official|unreadable|wrong_document|incomplete|needs_changes, note?<=NOTE_MAX} strict; cap 2 KiB
- 200: 200 {status, completed}
- Other answers: 404 {error:"off"|"missing"}; 409 {error:"decided"}; 400 {error:"reason"}
- Writes: staff_checkpoint decision; approve of a waiting task: task_completion, daily_task, coin_entry + wallet, activity_day (student lock) (static reach: activity_day, coin_entry, daily_task, dream_build, engine_event, engine_state, staff_checkpoint, streak_state, task_completion, wallet)

#### GET /api/v1/staff/proofs/{id}
- Evidence: `src/app/api/v1/staff/proofs/[id]/route.ts:12`; service: src/server/phase-x/upload.ts:48 checkpointFile
- Auth: staffUser(req) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 404 demo or no profile
- Gate: phaseXOn() = PHASE_X=1 (src/server/strategy/switch.ts:19); off: 404 {error:"not found"} before auth. Prod: live (STAFF_USER_IDS gates)
- Request: params id = proof_file id on a checkpoint
- 200: 200 bytes, private no-store, nosniff, CSP sandbox
- Other answers: 404
- Writes: none (static reach: none)

### moderation (12)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/blocks` | student or parent / required | moderationOn() = MODERATION=1 (not deployed (M1)) | safety:<uid> 300/h (env RATE_SAFETY_PER_HOUR) | - |
| POST | `/api/v1/blocks` | student or parent / required | moderationOn() = MODERATION=1 (not deployed (M1)) | safety:<uid> 300/h (env RATE_SAFETY_PER_HOUR) | user_block |
| DELETE | `/api/v1/blocks` | student or parent / required | moderationOn() = MODERATION=1 (not deployed (M1)) | safety:<uid> 300/h (env RATE_SAFETY_PER_HOUR) | user_block delete |
| GET | `/api/v1/privacy` | student or parent / required | moderationOn() = MODERATION=1 (not deployed (M1)) | safety:<uid> 300/h (env RATE_SAFETY_PER_HOUR) | - |
| POST | `/api/v1/reports` | student or parent / required | none: live with MODERATION on and off (not deployed (M1)) | report:<uid> 30/h (RATE_REPORTS_PER_HOUR) | report; moderation_item (submitForReview, urgent when danger) |
| POST | `/api/v1/ai/precheck` | student or parent / required | moderationOn() = MODERATION=1 (not deployed (M1)) | safety:<uid> 300/h (env RATE_SAFETY_PER_HOUR) | - |
| GET | `/api/v1/staff/alarm` | staff role moderator (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / not checked (read) | moderationOn() = MODERATION=1 (not deployed (M1)) | staff-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |
| POST | `/api/v1/staff/moderation/{id}` | staff role moderator (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / required | moderationOn() = MODERATION=1 (not deployed (M1)) | staff-write:<uid> 1200/h (env RATE_STAFF_WRITE_PER_HOUR) | moderation_item; moderation_audit; report; consumer hooks after the write: chat (club opened/turned down), community (item approved/rejected + note), core (milestone_report, score_report) |
| POST | `/api/v1/staff/suspend` | staff role moderator (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / required | moderationOn() = MODERATION=1 (not deployed (M1)) | staff-write:<uid> 1200/h (env RATE_STAFF_WRITE_PER_HOUR) | account_suspension; moderation_audit |
| POST | `/api/v1/staff/duty` | staff role moderator (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / required | moderationOn() = MODERATION=1 (not deployed (M1)) | staff-write:<uid> 1200/h (env RATE_STAFF_WRITE_PER_HOUR) | staff_member.on_duty; moderation_audit |
| POST | `/api/v1/staff/members` | staff role admin (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / required | moderationOn() = MODERATION=1 (not deployed (M1)) | staff-write:<uid> 1200/h (env RATE_STAFF_WRITE_PER_HOUR) | staff_member upsert; moderation_audit |
| DELETE | `/api/v1/staff/members` | staff role admin (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / required | moderationOn() = MODERATION=1 (not deployed (M1)) | staff-write:<uid> 1200/h (env RATE_STAFF_WRITE_PER_HOUR) | staff_member.removed_at; moderation_audit |

#### GET /api/v1/blocks
- Evidence: `src/app/api/v1/blocks/route.ts:17`; service: src/server/moderation/safety.ts:41 blockedBy
- Auth: askingUser(req) src/server/moderation/http.ts:17; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {blocked:[userId]}
- Writes: none (static reach: none)

#### POST /api/v1/blocks
- Evidence: `src/app/api/v1/blocks/route.ts:21`; service: src/server/moderation/safety.ts:26 block
- Auth: askingUser(req) src/server/moderation/http.ts:17; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { userId (1..80) }; cap 1 KiB
- 200: 200 {blocked:true}
- Other answers: 400 {error:"invalid"} self; 404 {error:"not found"} no such account (FK)
- Writes: user_block (static reach: user_block)
- Notes: A block hides each from the other everywhere (chat, community).

#### DELETE /api/v1/blocks
- Evidence: `src/app/api/v1/blocks/route.ts:28`; service: src/server/moderation/safety.ts:31 unblock
- Auth: askingUser(req) src/server/moderation/http.ts:17; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { userId }; cap 1 KiB
- 200: 200 {blocked:false}
- Writes: user_block delete (static reach: user_block)

#### GET /api/v1/privacy
- Evidence: `src/app/api/v1/privacy/route.ts:11`; service: src/server/moderation/safety.ts:51 privacyOf
- Auth: askingUser(req) src/server/moderation/http.ts:17; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {dmFrom, privateProfile, hideScores} (read from user_state jia.settings, defaults)
- Writes: none (static reach: none)

#### POST /api/v1/reports
- Evidence: `src/app/api/v1/reports/route.ts:20`; service: src/server/moderation/reports.ts:15 fileReport
- Auth: askingUser(req) src/server/moderation/http.ts:17; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: none: live with MODERATION on and off; off: n/a (reviewed:false when off). Prod: not deployed (M1)
- Request: body { target: message|profile|post|story|reel|comment|club|member|other, reason (<=60: spam|bullying|inappropriate|not_educational|danger|other or the design English reason via REASON_OF), targetUserId?, targetRef?<=400, label?<=400, note?<=1000, surface?<=40 }; cap 4 KiB
- 200: 201 {id, urgent, saved:true, reviewed}
- Other answers: 400 {error:"invalid"} unknown reason
- Writes: report; moderation_item (submitForReview, urgent when danger) (static reach: moderation_item, report)
- Side effects: moderation submit runs the AI pre-check when the AI layer is deployed; static markers: anthropic-call

#### POST /api/v1/ai/precheck
- Evidence: `src/app/api/v1/ai/precheck/route.ts:14`; service: src/server/moderation/precheck.ts:45 precheck
- Auth: askingUser(req) src/server/moderation/http.ts:17; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { kind: post|story|reel|comment|club|chat_report|user_report|milestone_report|score_report|caption, text <=2000 (default "") }; cap 8 KiB
- 200: 200 {status: clean|flagged, reason, engine: filter|fake|ai, one_tap_approve, checked_at}
- Writes: none (static reach: none)
- Side effects: text screen; then (AI_LAYER=1 and notice live) one Claude call, quick model, max_tokens 200, timeout 8 s; AI_FAKE=1 rule in dev; static markers: anthropic-call
- Notes: Advisory only.

#### GET /api/v1/staff/alarm
- Evidence: `src/app/api/v1/staff/alarm/route.ts:9`; service: src/server/moderation/review.ts:99 urgentPending, :104 pendingCount
- Auth: requireStaff(req,"moderator") src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 404 demo or no profile
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {urgent, oldest: ISO|null, pending}
- Writes: none (static reach: none)
- Notes: Polled by the console every 30 s.

#### POST /api/v1/staff/moderation/{id}
- Evidence: `src/app/api/v1/staff/moderation/[id]/route.ts:16`; service: src/server/moderation/review.ts:62 decide (+ hooks src/server/moderation/hooks.ts: chat, community, core; src/server/moderation/sync.ts)
- Auth: requireStaff(req,"moderator",{write:true}) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id (URL-decoded moderation_item id); body { decision: approve|reject|take_down, reason?<=500 (required for reject/take_down) }; cap 4 KiB
- 200: 200 {ok:true, status}
- Other answers: 404; 409 {error:"decided"}; 400 {error}
- Writes: moderation_item; moderation_audit; report; consumer hooks after the write: chat (club opened/turned down), community (item approved/rejected + note), core (milestone_report, score_report) (static reach: moderation_audit, moderation_item, report)
- Side effects: chat hook publishes via NOTIFY jg_chat

#### POST /api/v1/staff/suspend
- Evidence: `src/app/api/v1/staff/suspend/route.ts:13`; service: src/server/moderation/safety.ts:92 suspend, :97 liftSuspension, :87 isSuspended; src/server/moderation/staff.ts:36 hasRole
- Auth: requireStaff(req,"moderator",{write:true}) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { userId (1..80), reason? (trim <=500), lift?: bool }; cap 2 KiB
- 200: 200 {ok:true} | {ok:true, already:true} | lift: {ok:bool}
- Other answers: 400 {error:"reason required"}; 422 {error:"staff"}; 404 no such account
- Writes: account_suspension; moderation_audit (static reach: account_suspension, moderation_audit)

#### POST /api/v1/staff/duty
- Evidence: `src/app/api/v1/staff/duty/route.ts:9`; service: src/server/moderation/staff.ts:107 setOnDuty
- Auth: requireStaff(req,"moderator",{write:true}) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { on: bool }; cap 256 B
- 200: 200 {ok:true, on}
- Other answers: 422 {error:"not a moderator"}
- Writes: staff_member.on_duty; moderation_audit (static reach: moderation_audit, staff_member)

#### POST /api/v1/staff/members
- Evidence: `src/app/api/v1/staff/members/route.ts:20`; service: src/server/moderation/staff.ts:82 addStaff
- Auth: requireStaff(req,"admin",{write:true}) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { email (trim 3..320), role: admin|moderator|counselor|teacher|coordinator }; cap 2 KiB
- 200: 200 {ok:true, userId}
- Other answers: 422 {error:"no account"|"demo"|"student"|"bad role"}
- Writes: staff_member upsert; moderation_audit (static reach: moderation_audit, staff_member)

#### DELETE /api/v1/staff/members
- Evidence: `src/app/api/v1/staff/members/route.ts:26`; service: src/server/moderation/staff.ts:97 removeStaff
- Auth: requireStaff(req,"admin",{write:true}) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: moderationOn() = MODERATION=1 (src/server/moderation/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { userId, role }; cap 1 KiB
- 200: 200 {ok:true}
- Other answers: 404
- Writes: staff_member.removed_at; moderation_audit (static reach: moderation_audit, staff_member)
- Notes: Bootstrap admins (STAFF_USER_IDS) change only on the server.

### chat (31)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/chats` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | chat_member (joins the global room on first list) |
| POST | `/api/v1/chats` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat; chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/{id}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | chat_member (global room join) |
| PATCH | `/api/v1/chats/{id}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat; chat_member.muted; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/{id}/leave` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat_member delete; system message; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/{id}/members` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat_member; chat_message (system); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| PATCH | `/api/v1/chats/{id}/members/{uid}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat_member.role; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| DELETE | `/api/v1/chats/{id}/members/{uid}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat_member delete; chat_pin; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/{id}/messages` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | - |
| POST | `/api/v1/chats/{id}/messages` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-send:<uid> 30/min (RATE_CHAT_MSG_PER_MIN) | chat_message; chat_poll; chat (DM request status); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| PATCH | `/api/v1/chats/{id}/messages/{mid}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-send:<uid> 30/min (RATE_CHAT_MSG_PER_MIN) | chat_message.text/edited_at; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| DELETE | `/api/v1/chats/{id}/messages/{mid}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-send:<uid> 30/min (RATE_CHAT_MSG_PER_MIN) | chat_message.deleted; chat_reaction; chat_pin; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| PUT | `/api/v1/chats/{id}/messages/{mid}/reaction` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-react:<uid> 120/min (RATE_CHAT_REACT_PER_MIN) | chat_reaction (one per person); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/{id}/messages/{mid}/vote` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-react:<uid> 120/min (RATE_CHAT_REACT_PER_MIN) | chat_poll_vote; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/{id}/read` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | chat_member.last_read (event only to her own other tabs); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/{id}/pin` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-react:<uid> 120/min (RATE_CHAT_REACT_PER_MIN) | chat_pin; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/{id}/typing` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-react:<uid> 120/min (RATE_CHAT_REACT_PER_MIN) | - |
| POST | `/api/v1/chats/{id}/jamol` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-jamol:<uid> 10/h (RATE_CHAT_JAMOL_PER_HOUR) | chat_message (question + Jamol answer); ai_usage; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/search` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-search:<uid> 30/min (RATE_CHAT_SEARCH_PER_MIN) | - |
| GET | `/api/v1/chats/requests` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | - |
| POST | `/api/v1/chats/requests/{id}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat.status active\|declined; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/presence` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | - |
| POST | `/api/v1/chats/league/{leagueId}` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat; chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/clubs` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | - |
| POST | `/api/v1/chats/clubs` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat (club_channel pending); chat_member owner; moderation_item (club); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/clubs/{id}/join` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| POST | `/api/v1/chats/clubs/{id}/leave` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat_member delete; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/clubs/{id}/topics` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-read:<uid> 600/min (RATE_CHAT_READ_PER_MIN) | - |
| POST | `/api/v1/chats/clubs/{id}/topics` | student / required | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-create:<uid> 20/h (RATE_CHAT_CREATE_PER_HOUR) | chat (club_topic); chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE |
| GET | `/api/v1/chats/stream` | student, non-demo / x-jg-uid header OR ?uid= (EventSource cannot set headers); mismatch 409 | messengerOn() = MESSENGER=1 (not deployed (M1)) | chat-stream:<uid> 30/min (RATE_CHAT_STREAM_PER_MIN) | - |
| GET | `/api/v1/staff/chats/reported` | staff role moderator (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / not checked (read) | messengerOn() = MESSENGER=1 (not deployed (M1)) | none | - |

#### GET /api/v1/chats
- Evidence: `src/app/api/v1/chats/route.ts -> src/server/chat/handlers.ts listGET:21`; service: src/server/chat/handlers.ts:21; src/server/chat/store.ts:183 listChats
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {chats: ChatSummary[], requests, online} (src/server/chat/types.ts:25)
- Writes: chat_member (joins the global room on first list) (static reach: chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats
- Evidence: `src/app/api/v1/chats/route.ts -> src/server/chat/handlers.ts createPOST:22`; service: src/server/chat/handlers.ts:22; src/server/chat/store.ts:499 openDm, 537 createGroup
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body {kind:"dm", with: userId} | {kind:"group", name 1..200, members: userId[] <=200}
- 200: 200 {chat: ChatSummary, request: bool} (a DM to someone privacy does not allow becomes a request)
- Other answers: 422 refused blocked|request_limit|...; 404
- Writes: chat; chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat, chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### GET /api/v1/chats/{id}
- Evidence: `src/app/api/v1/chats/[id]/route.ts -> src/server/chat/handlers.ts chatGET:27`; service: src/server/chat/handlers.ts:27; src/server/chat/store.ts:191 chatDetail
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id [A-Za-z0-9_:.-]{1,96} (may be encoded; "global" = the global room)
- 200: 200 {chat: ChatDetail} (people capped 200, pinned, here)
- Other answers: 404
- Writes: chat_member (global room join) (static reach: chat_member, chat_pin)
- Side effects: static markers: pg_listen, pg_notify

#### PATCH /api/v1/chats/{id}
- Evidence: `src/app/api/v1/chats/[id]/route.ts -> src/server/chat/handlers.ts chatPATCH:31`; service: src/server/chat/handlers.ts:31; src/server/chat/store.ts:560 updateChat
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { name?<=200, about?<=1000, muted?: bool }
- 200: 200 {chat: ChatSummary}
- Other answers: 403; 400 {error:"name"}
- Writes: chat; chat_member.muted; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat, chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/leave
- Evidence: `src/app/api/v1/chats/[id]/leave/route.ts -> src/server/chat/handlers.ts leavePOST:35`; service: src/server/chat/handlers.ts:35; src/server/chat/store.ts:582 leave
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id
- 200: 200 {ok:true}
- Writes: chat_member delete; system message; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/members
- Evidence: `src/app/api/v1/chats/[id]/members/route.ts -> src/server/chat/handlers.ts membersPOST:43`; service: src/server/chat/handlers.ts:43; src/server/chat/store.ts:599 addMembers
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { add: userId[] 1..200 }
- 200: 200 {chat: ChatDetail} (admins; groups and clubs)
- Other answers: 403
- Writes: chat_member; chat_message (system); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_pin)
- Side effects: static markers: pg_listen, pg_notify

#### PATCH /api/v1/chats/{id}/members/{uid}
- Evidence: `src/app/api/v1/chats/[id]/members/[uid]/route.ts -> src/server/chat/handlers.ts memberPATCH:47`; service: src/server/chat/handlers.ts:47; src/server/chat/store.ts:609 setRole
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id, uid [A-Za-z0-9_-]{1,64}; body { role: admin|member }
- 200: 200 {chat: ChatDetail}
- Other answers: 403
- Writes: chat_member.role; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_pin)
- Side effects: static markers: pg_listen, pg_notify

#### DELETE /api/v1/chats/{id}/members/{uid}
- Evidence: `src/app/api/v1/chats/[id]/members/[uid]/route.ts -> src/server/chat/handlers.ts memberDELETE:51`; service: src/server/chat/handlers.ts:51; src/server/chat/store.ts:619 removeMember
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id, uid
- 200: 200 {chat: ChatDetail} (admins remove; a member removes self)
- Other answers: 403
- Writes: chat_member delete; chat_pin; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_pin)
- Side effects: static markers: pg_listen, pg_notify

#### GET /api/v1/chats/{id}/messages
- Evidence: `src/app/api/v1/chats/[id]/messages/route.ts -> src/server/chat/handlers.ts messagesGET:62`; service: src/server/chat/handlers.ts:62; src/server/chat/store.ts:249 listMessages
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; query ?before=<message id>&limit=1..100 (default 50)
- 200: 200 {messages: ChatMessage[] (oldest first), more}
- Other answers: 403 {error:"not_member"}; 404
- Writes: none (static reach: chat_member)

#### POST /api/v1/chats/{id}/messages
- Evidence: `src/app/api/v1/chats/[id]/messages/route.ts -> src/server/chat/handlers.ts messagesPOST:68`; service: src/server/chat/handlers.ts:68; src/server/chat/store.ts:311 sendMessage
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { text?<=4000 (2x textMax; trimmed to 2000), replyTo?: int|null, clientId?: [A-Za-z0-9_.:-]<=64|null, poll?: {question, options[<=12], anonymous?}|null }
- 200: 200 {message: ChatMessage}
- Other answers: 422 {error:"refused", reason: contact|link|abuse|blocked|not_member|read_only|request_limit|declined|too_long|empty|slow} (a suspended sender is refused as blocked; the text screen refuses, nothing is held today: src/server/chat/moderation-wire.ts:4-8); 400 {error:"client id"}
- Writes: chat_message; chat_poll; chat (DM request status); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat, chat_member, chat_message, chat_poll)
- Side effects: static markers: pg_listen, pg_notify
- Notes: Idempotent by clientId. Global room slow mode CHAT_GLOBAL_SLOW_S (default 10 s, 0 off; src/server/chat/store.ts:343).

#### PATCH /api/v1/chats/{id}/messages/{mid}
- Evidence: `src/app/api/v1/chats/[id]/messages/[mid]/route.ts -> src/server/chat/handlers.ts messagePATCH:74`; service: src/server/chat/handlers.ts:74; src/server/chat/store.ts:401 editMessage
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id, mid (positive int); body { text <=4000 }
- 200: 200 {message} (own, within 48 h)
- Other answers: 403 {error:"too_old"}; 422 refused
- Writes: chat_message.text/edited_at; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_message)
- Side effects: static markers: pg_listen, pg_notify

#### DELETE /api/v1/chats/{id}/messages/{mid}
- Evidence: `src/app/api/v1/chats/[id]/messages/[mid]/route.ts -> src/server/chat/handlers.ts messageDELETE:78`; service: src/server/chat/handlers.ts:78; src/server/chat/store.ts:417 deleteMessage
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id, mid
- 200: 200 {ok:true} (own; admins any)
- Other answers: 403
- Writes: chat_message.deleted; chat_reaction; chat_pin; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_message, chat_pin, chat_reaction)
- Side effects: static markers: pg_listen, pg_notify

#### PUT /api/v1/chats/{id}/messages/{mid}/reaction
- Evidence: `src/app/api/v1/chats/[id]/messages/[mid]/reaction/route.ts -> src/server/chat/handlers.ts reactionPUT:83`; service: src/server/chat/handlers.ts:83; src/server/chat/store.ts:430 react
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id, mid; body { emoji: 1..16 chars | null }
- 200: 200 {rx: {emoji: userId[]}}
- Writes: chat_reaction (one per person); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_reaction)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/messages/{mid}/vote
- Evidence: `src/app/api/v1/chats/[id]/messages/[mid]/vote/route.ts -> src/server/chat/handlers.ts votePOST:88`; service: src/server/chat/handlers.ts:88; src/server/chat/store.ts:447 vote
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id, mid; body { option: int 0..20 }
- 200: 200 {poll: PollView}
- Writes: chat_poll_vote; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_poll_vote)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/read
- Evidence: `src/app/api/v1/chats/[id]/read/route.ts -> src/server/chat/handlers.ts readPOST:93`; service: src/server/chat/handlers.ts:93; src/server/chat/store.ts:462 markRead
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { upTo: int>=0 }
- 200: 200 {unread}
- Writes: chat_member.last_read (event only to her own other tabs); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/pin
- Evidence: `src/app/api/v1/chats/[id]/pin/route.ts -> src/server/chat/handlers.ts pinPOST:98`; service: src/server/chat/handlers.ts:98; src/server/chat/store.ts:472 pin
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { messageId: int|null }
- 200: 200 {pinned: ChatMessage|null} (admins; DMs both)
- Other answers: 403
- Writes: chat_pin; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member, chat_pin)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/typing
- Evidence: `src/app/api/v1/chats/[id]/typing/route.ts -> src/server/chat/handlers.ts typingPOST:102`; service: src/server/chat/handlers.ts:102; src/server/chat/store.ts:488 typing
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id
- 200: 200 {ok:true}
- Writes: none (static reach: chat_member)
- Side effects: typing event via NOTIFY (not stored; not in the global room); static markers: pg_listen, pg_notify

#### POST /api/v1/chats/{id}/jamol
- Evidence: `src/app/api/v1/chats/[id]/jamol/route.ts -> src/server/chat/handlers.ts jamolPOST:107`; service: src/server/chat/handlers.ts:107; src/server/chat/jamol.ts:60 askJamol
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { question 1..1000, lang?: uz|ru|en (else profile locale) }
- 200: 200 {message: ChatMessage} (Jamol answers in the chat)
- Other answers: 400 {error:"invalid"}; 422 refused read_only|abuse (pre-check); 503 {error:"ai_off"}; 429 {error:"quota"}
- Writes: chat_message (question + Jamol answer); ai_usage; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: ai_usage, chat, chat_member, chat_message, chat_poll)
- Side effects: one Claude call (AI notice + quota); static markers: anthropic-call, pg_listen, pg_notify

#### GET /api/v1/chats/search
- Evidence: `src/app/api/v1/chats/search/route.ts -> src/server/chat/handlers.ts searchGET:113`; service: src/server/chat/handlers.ts:113; src/server/chat/store.ts:658 search
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: query ?q=
- 200: 200 {results:[{chat, message}]}
- Writes: none (static reach: none)

#### GET /api/v1/chats/requests
- Evidence: `src/app/api/v1/chats/requests/route.ts -> src/server/chat/handlers.ts requestsGET:114`; service: src/server/chat/handlers.ts:114; src/server/chat/store.ts:634 listRequests
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {requests: ChatRequest[]}
- Writes: none (static reach: none)

#### POST /api/v1/chats/requests/{id}
- Evidence: `src/app/api/v1/chats/requests/[id]/route.ts -> src/server/chat/handlers.ts requestPOST:116`; service: src/server/chat/handlers.ts:116; src/server/chat/store.ts:646 answerRequest
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { accept: bool }
- 200: 200 {chat: ChatSummary}
- Writes: chat.status active|declined; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat)
- Side effects: static markers: pg_listen, pg_notify

#### GET /api/v1/chats/presence
- Evidence: `src/app/api/v1/chats/presence/route.ts -> src/server/chat/handlers.ts presenceGET:120`; service: src/server/chat/handlers.ts:120; src/server/chat/hub.ts:160 hub.online()
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {online} (students with an open stream, in-process hub count)
- Writes: none (static reach: none)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/league/{leagueId}
- Evidence: `src/app/api/v1/chats/league/[leagueId]/route.ts -> src/server/chat/handlers.ts leaguePOST:123`; service: src/server/chat/handlers.ts:123; src/server/chat/store.ts:698 leagueChat
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params leagueId [A-Za-z0-9_.:-]{1,64}
- 200: 200 {chat: ChatSummary} (created on demand; that league members only)
- Other answers: 403; 404
- Writes: chat; chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat, chat_member)

#### GET /api/v1/chats/clubs
- Evidence: `src/app/api/v1/chats/clubs/route.ts -> src/server/chat/handlers.ts clubsGET:129`; service: src/server/chat/handlers.ts:129; src/server/chat/store.ts:712 listClubs
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {clubs: ChatSummary[]} (active + my pending)
- Writes: none (static reach: none)

#### POST /api/v1/chats/clubs
- Evidence: `src/app/api/v1/chats/clubs/route.ts -> src/server/chat/handlers.ts clubsPOST:130`; service: src/server/chat/handlers.ts:130; src/server/chat/store.ts:717 foundClub
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { name 1..200, about?<=1000 }
- 200: 200 {club: ChatSummary} (status pending until a moderator approves)
- Other answers: 429 {error:"too many pending clubs"}
- Writes: chat (club_channel pending); chat_member owner; moderation_item (club); NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat, chat_member)

#### POST /api/v1/chats/clubs/{id}/join
- Evidence: `src/app/api/v1/chats/clubs/[id]/join/route.ts -> src/server/chat/handlers.ts clubJoinPOST:131`; service: src/server/chat/handlers.ts:131; src/server/chat/store.ts:741 joinClub
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id
- 200: 200 {club: ChatSummary}
- Writes: chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### POST /api/v1/chats/clubs/{id}/leave
- Evidence: `src/app/api/v1/chats/clubs/[id]/leave/route.ts -> src/server/chat/handlers.ts clubLeavePOST:135`; service: src/server/chat/handlers.ts:135; src/server/chat/store.ts:748 leaveClub
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id
- 200: 200 {club: ChatSummary}
- Writes: chat_member delete; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### GET /api/v1/chats/clubs/{id}/topics
- Evidence: `src/app/api/v1/chats/clubs/[id]/topics/route.ts -> src/server/chat/handlers.ts topicsGET:139`; service: src/server/chat/handlers.ts:139; src/server/chat/store.ts:754 listTopics
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id
- 200: 200 {topics: ChatSummary[]}
- Writes: none (static reach: none)

#### POST /api/v1/chats/clubs/{id}/topics
- Evidence: `src/app/api/v1/chats/clubs/[id]/topics/route.ts -> src/server/chat/handlers.ts topicsPOST:143`; service: src/server/chat/handlers.ts:143; src/server/chat/store.ts:761 createTopic
- Auth: chatRoute/chatBodyRoute src/server/chat/http.ts:38,46 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} MESSENGER off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} retry-after 600 -> 413/400 body (16 KiB cap, zod) -> ChatError -> {error, reason?} with its status (src/server/chat/store.ts:18-24)
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id; body { name 1..200 }
- 200: 200 {topic: ChatSummary} (club members)
- Other answers: 429 {error:"too many topics"}
- Writes: chat (club_topic); chat_member; NOTIFY jg_chat (pg_notify) -> every LISTENing process hub -> SSE (static reach: chat, chat_member)
- Side effects: static markers: pg_listen, pg_notify

#### GET /api/v1/chats/stream
- Evidence: `src/app/api/v1/chats/stream/route.ts -> src/server/chat/stream.ts streamGET:21`; service: src/server/chat/stream.ts:21 streamGET; src/server/chat/hub.ts:28 Hub (LISTEN jg_chat)
- Auth: auth() + getProfile (src/server/chat/stream.ts:21-30); demo refused 403; refusals in order: 404 MESSENGER off -> 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 403 {error:"students only"|"demo"} -> 429 too many -> 503 {error:"busy"} over CHAT_STREAMS_MAX (3000) open streams
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: query ?uid=<uid>&lastEventId=; headers Last-Event-ID (replay from the in-memory ring of 2000)
- 200: 200 text/event-stream: first chunk "retry: 3000" + 2 KiB padding comment; events `id: <boot>.<seq>\nevent: chat\ndata: <ChatEvent JSON>`; heartbeat comment every 20 s; blocked users filtered (hiddenFor refreshed every 2 min)
- Writes: none (static reach: none)
- Side effects: in-process hub; LISTEN on Postgres channel jg_chat; presence counted per process; static markers: pg_listen, pg_notify
- Streaming: SSE (cache-control no-cache, no-transform; x-accel-buffering no; connection keep-alive)
- Notes: export const dynamic=force-dynamic, runtime=nodejs. ChatEvent union: src/server/chat/types.ts:92-105. One replica assumed; NOTIFY payload <7000 bytes else sent as a reference and re-loaded.

#### GET /api/v1/staff/chats/reported
- Evidence: `src/app/api/v1/staff/chats/reported/route.ts -> src/server/chat/staff.ts reportedGET:10`; service: src/server/chat/staff.ts:10 reportedGET; src/server/chat/reports.ts:19 reportedContext
- Auth: requireStaff(req,["moderator"]) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 404 demo or no profile
- Gate: messengerOn() = MESSENGER=1 (src/server/chat/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: query ?ref=chat_message:<id>
- 200: 200 the reported message with its context
- Other answers: 404
- Writes: none (static reach: none)

### community (39)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/community/me` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| PUT | `/api/v1/community/me` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_profile; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/me` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_profile, posts, comments, stories, likes, follows, notes, media rows + files; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/export` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/online` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/feed` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/u/{handle}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/u/{handle}/followers` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/u/{handle}/following` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/u/{handle}/follow` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_follow; community_note; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/u/{handle}/follow` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_follow; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/follow-requests` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/follow-requests/{handle}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_follow; community_note; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/u/{handle}/block` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | user_block (moderation module); community_follow; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/u/{handle}/block` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | user_block; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/blocks` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/posts` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_post; community_media.used_at; moderation_item via reviewPort().submitForReview; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/posts/{id}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| PATCH | `/api/v1/community/posts/{id}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_post; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/posts/{id}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_post (+ likes, saves, comments cascade); community_media + file; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/posts/{id}/like` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_like; community_note; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/posts/{id}/like` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_like; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/posts/{id}/save` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_save; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/posts/{id}/save` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_save; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/posts/{id}/vote` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_poll_vote; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/posts/{id}/view` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_view; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/posts/{id}/comments` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/posts/{id}/comments` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_comment; community_note; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/comments/{id}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_comment; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/saved` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/stories` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/stories` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_story (expires 24 h); community_media.used_at; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/stories/{id}/view` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_story_view; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/stories/{id}/viewers` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| DELETE | `/api/v1/community/stories/{id}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_story; community_media + file; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/report` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | report; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/search` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read 600/min + community-search:<uid> 60/min | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/notifications` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| POST | `/api/v1/community/notifications/read` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-write:<uid> 60/min (RATE_COMMUNITY_WRITES_PER_MIN) | community_note.read; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |

#### GET /api/v1/community/me
- Evidence: `src/app/api/v1/community/[...path]/route.ts:85`; service: src/app/api/v1/community/[...path]/route.ts:85 -> src/server/community/social.ts:35 me
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 MeAnswer {profile|null, media_allowed, media_reason, caps, used, unread, suspended}
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### PUT /api/v1/community/me
- Evidence: `src/app/api/v1/community/[...path]/route.ts:121`; service: src/app/api/v1/community/[...path]/route.ts:121 -> src/server/community/social.ts:52 editMe
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body ProfileEdit {handle? ^[a-z0-9_.]{3,20}$, bio?<=150, show_photo?}; cap 8 KiB
- 200: 200 MeAnswer
- Other answers: 409 {error:"handle_taken"}; 400 {error:"handle"}
- Writes: community_profile; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_profile)

#### DELETE /api/v1/community/me
- Evidence: `src/app/api/v1/community/[...path]/route.ts:105`; service: src/app/api/v1/community/[...path]/route.ts:105 -> src/server/community/mine.ts:40 leave
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {confirm: <her handle>}
- 200: 200 {left:true}
- Other answers: 400 {error:"confirm"}
- Writes: community_profile, posts, comments, stories, likes, follows, notes, media rows + files; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_comment, community_follow, community_media, community_note, community_post, community_profile, community_story, community_story_view)
- Side effects: deletes media files (local disk or R2); static markers: fetch, fs-write

#### GET /api/v1/community/export
- Evidence: `src/app/api/v1/community/[...path]/route.ts:87`; service: src/app/api/v1/community/[...path]/route.ts:87 -> src/server/community/mine.ts:17 exportMine
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 JSON attachment (everything of hers)
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### GET /api/v1/community/online
- Evidence: `src/app/api/v1/community/[...path]/route.ts:86`; service: src/app/api/v1/community/[...path]/route.ts:86 -> src/server/community/presence.ts:14 onlineCount
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {online} (students active in the last 5 min, this process)
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence

#### GET /api/v1/community/feed
- Evidence: `src/app/api/v1/community/[...path]/route.ts:88`; service: src/app/api/v1/community/[...path]/route.ts:88 -> src/server/community/posts.ts:202 feed
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: query ?kind=post|reel&cursor=
- 200: 200 Page<Item> {items, next}
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### GET /api/v1/community/u/{handle}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:89`; service: src/app/api/v1/community/[...path]/route.ts:89 -> src/server/community/social.ts:83 profile
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: query ?kind=&cursor=
- 200: 200 ProfileAnswer {profile, visible, items, next}
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### GET /api/v1/community/u/{handle}/followers
- Evidence: `src/app/api/v1/community/[...path]/route.ts:90`; service: src/app/api/v1/community/[...path]/route.ts:90 -> src/server/community/social.ts:105 followList
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: params followers|following; query ?cursor=
- 200: 200 Page<Person>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)
- Notes: /u/{handle}/following is the same dispatch.

#### GET /api/v1/community/u/{handle}/following
- Evidence: `src/app/api/v1/community/[...path]/route.ts:90`; service: src/app/api/v1/community/[...path]/route.ts:90 -> src/server/community/social.ts:105 followList
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 Page<Person>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### POST /api/v1/community/u/{handle}/follow
- Evidence: `src/app/api/v1/community/[...path]/route.ts:131`; service: src/app/api/v1/community/[...path]/route.ts:131 -> src/server/community/social.ts:116 follow(on)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {state: none|requested|following}
- Writes: community_follow; community_note; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_follow, community_note)

#### DELETE /api/v1/community/u/{handle}/follow
- Evidence: `src/app/api/v1/community/[...path]/route.ts:106`; service: src/app/api/v1/community/[...path]/route.ts:106 -> src/server/community/social.ts:116 follow(off)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {state:"none"} (also cancels a request)
- Writes: community_follow; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_follow, community_note)

#### GET /api/v1/community/follow-requests
- Evidence: `src/app/api/v1/community/[...path]/route.ts:91`; service: src/app/api/v1/community/[...path]/route.ts:91 -> src/server/community/social.ts:133 requests
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 Page<Person>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### POST /api/v1/community/follow-requests/{handle}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:133`; service: src/app/api/v1/community/[...path]/route.ts:133 -> src/server/community/social.ts:142 answerRequest
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {accept: bool}
- 200: 200 {ok:true}
- Writes: community_follow; community_note; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_follow, community_note)

#### POST /api/v1/community/u/{handle}/block
- Evidence: `src/app/api/v1/community/[...path]/route.ts:132`; service: src/app/api/v1/community/[...path]/route.ts:132 -> src/server/community/social.ts:159 block(on)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {blocked:true} (also ends both follows)
- Writes: user_block (moderation module); community_follow; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_follow, community_note, user_block)

#### DELETE /api/v1/community/u/{handle}/block
- Evidence: `src/app/api/v1/community/[...path]/route.ts:107`; service: src/app/api/v1/community/[...path]/route.ts:107 -> src/server/community/social.ts:159 block(off)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {blocked:false}
- Writes: user_block; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_follow, community_note, user_block)

#### GET /api/v1/community/blocks
- Evidence: `src/app/api/v1/community/[...path]/route.ts:92`; service: src/app/api/v1/community/[...path]/route.ts:92 -> src/server/community/social.ts:172 blocks
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 Page<Person>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### POST /api/v1/community/posts
- Evidence: `src/app/api/v1/community/[...path]/route.ts:124`; service: src/app/api/v1/community/[...path]/route.ts:124 -> src/server/community/posts.ts:97 createPost
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body NewPost {kind: post|reel, text<=2200, media_id?, poll?: string[2..4]<=40, style?}; cap 8 KiB
- 200: 201 {item: Item} (status pending)
- Other answers: 403 {error:"parent_consent_required"} media under 14; 429 {error:"daily_cap", cap} (posts 10, reels 3 per 24 h); 422 {error:"unsafe", reasons}; 403 {error:"suspended"}
- Writes: community_post; community_media.used_at; moderation_item via reviewPort().submitForReview; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_comment, community_media, community_note, community_post, community_story)
- Side effects: AI pre-check inside submitForReview when the AI layer is deployed

#### GET /api/v1/community/posts/{id}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:93`; service: src/app/api/v1/community/[...path]/route.ts:93 -> src/server/community/posts.ts:151 getPost
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {item, comments: Page<Comment>}
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### PATCH /api/v1/community/posts/{id}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:122`; service: src/app/api/v1/community/[...path]/route.ts:122 -> src/server/community/posts.ts:159 editPost
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {text}
- 200: 200 {item} (author only; back to pending)
- Writes: community_post; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_comment, community_note, community_post, community_story)

#### DELETE /api/v1/community/posts/{id}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:108`; service: src/app/api/v1/community/[...path]/route.ts:108 -> src/server/community/posts.ts:184 deletePost
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {deleted:true}
- Writes: community_post (+ likes, saves, comments cascade); community_media + file; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_media, community_note, community_post)
- Side effects: media file delete (disk/R2); static markers: fetch, fs-write

#### POST /api/v1/community/posts/{id}/like
- Evidence: `src/app/api/v1/community/[...path]/route.ts:125`; service: src/app/api/v1/community/[...path]/route.ts:125 -> src/server/community/posts.ts:237 like(on)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {liked, likes}
- Writes: community_like; community_note; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_like, community_note)

#### DELETE /api/v1/community/posts/{id}/like
- Evidence: `src/app/api/v1/community/[...path]/route.ts:109`; service: src/app/api/v1/community/[...path]/route.ts:109 -> src/server/community/posts.ts:237 like(off)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {liked, likes}
- Writes: community_like; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_like, community_note)

#### POST /api/v1/community/posts/{id}/save
- Evidence: `src/app/api/v1/community/[...path]/route.ts:126`; service: src/app/api/v1/community/[...path]/route.ts:126 -> src/server/community/posts.ts:254 save(on)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {saved}
- Writes: community_save; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_save)

#### DELETE /api/v1/community/posts/{id}/save
- Evidence: `src/app/api/v1/community/[...path]/route.ts:110`; service: src/app/api/v1/community/[...path]/route.ts:110 -> src/server/community/posts.ts:254 save(off)
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {saved}
- Writes: community_save; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_save)

#### POST /api/v1/community/posts/{id}/vote
- Evidence: `src/app/api/v1/community/[...path]/route.ts:127`; service: src/app/api/v1/community/[...path]/route.ts:127 -> src/server/community/posts.ts:262 vote
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {option}
- 200: 200 {poll: Poll} (one final vote)
- Writes: community_poll_vote; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_poll_vote)

#### POST /api/v1/community/posts/{id}/view
- Evidence: `src/app/api/v1/community/[...path]/route.ts:128`; service: src/app/api/v1/community/[...path]/route.ts:128 -> src/server/community/posts.ts:276 view
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {views} (reels: one per student)
- Writes: community_view; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_view)

#### GET /api/v1/community/posts/{id}/comments
- Evidence: `src/app/api/v1/community/[...path]/route.ts:94`; service: src/app/api/v1/community/[...path]/route.ts:94 -> src/server/community/posts.ts:299 comments
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: query ?cursor=
- 200: 200 Page<Comment>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### POST /api/v1/community/posts/{id}/comments
- Evidence: `src/app/api/v1/community/[...path]/route.ts:129`; service: src/app/api/v1/community/[...path]/route.ts:129 -> src/server/community/posts.ts:305 addComment
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {text<=500, parent_id? (top-level only)}
- 200: 201 {comment: Comment}
- Other answers: 429 daily_cap (comments 100); 422 unsafe
- Writes: community_comment; community_note; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_comment, community_note, community_post, community_story)

#### DELETE /api/v1/community/comments/{id}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:111`; service: src/app/api/v1/community/[...path]/route.ts:111 -> src/server/community/posts.ts:335 deleteComment
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {deleted:true} (comment or post author)
- Writes: community_comment; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_comment, community_note)

#### GET /api/v1/community/saved
- Evidence: `src/app/api/v1/community/[...path]/route.ts:95`; service: src/app/api/v1/community/[...path]/route.ts:95 -> src/server/community/posts.ts:226 saved
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: query ?cursor=
- 200: 200 Page<Item>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### GET /api/v1/community/stories
- Evidence: `src/app/api/v1/community/[...path]/route.ts:96`; service: src/app/api/v1/community/[...path]/route.ts:96 -> src/server/community/posts.ts:351 stories
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 StoriesAnswer {mine, people[]}
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### POST /api/v1/community/stories
- Evidence: `src/app/api/v1/community/[...path]/route.ts:134`; service: src/app/api/v1/community/[...path]/route.ts:134 -> src/server/community/posts.ts:365 addStory
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body NewStory {text, media_id?, style?}
- 200: 201 {story: Story}
- Other answers: 429 daily_cap (stories 10); 403 parent_consent_required
- Writes: community_story (expires 24 h); community_media.used_at; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_comment, community_media, community_note, community_post, community_story)

#### POST /api/v1/community/stories/{id}/view
- Evidence: `src/app/api/v1/community/[...path]/route.ts:135`; service: src/app/api/v1/community/[...path]/route.ts:135 -> src/server/community/posts.ts:406 viewStory
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {seen:true}
- Writes: community_story_view; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_story_view)

#### GET /api/v1/community/stories/{id}/viewers
- Evidence: `src/app/api/v1/community/[...path]/route.ts:97`; service: src/app/api/v1/community/[...path]/route.ts:97 -> src/server/community/posts.ts:413 storyViewers
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 Page<Person> (author only)
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### DELETE /api/v1/community/stories/{id}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:112`; service: src/app/api/v1/community/[...path]/route.ts:112 -> src/server/community/posts.ts:421 deleteStory
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {deleted:true}
- Writes: community_story; community_media + file; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_media, community_note, community_story)
- Side effects: static markers: fetch, fs-write

#### POST /api/v1/community/report
- Evidence: `src/app/api/v1/community/[...path]/route.ts:130`; service: src/app/api/v1/community/[...path]/route.ts:130 -> src/server/community/report.ts:18 report
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {target: post|reel|comment|story|profile, id|handle, reason (code or design English), note?}
- 200: 201 {saved:true, urgent}
- Writes: report; moderation_item; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: moderation_item, report)
- Side effects: moderation submit (AI pre-check possible); static markers: anthropic-call

#### GET /api/v1/community/search
- Evidence: `src/app/api/v1/community/[...path]/route.ts:98`; service: src/app/api/v1/community/[...path]/route.ts:98 -> src/server/community/social.ts:180 search
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: query ?q=&type=people|posts|reels&cursor=
- 200: 200 Page<Person|Item>
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### GET /api/v1/community/notifications
- Evidence: `src/app/api/v1/community/[...path]/route.ts:99`; service: src/app/api/v1/community/[...path]/route.ts:99 -> src/server/community/social.ts:201 notes
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 Page<Note> & {unread}
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### POST /api/v1/community/notifications/read
- Evidence: `src/app/api/v1/community/[...path]/route.ts:136`; service: src/app/api/v1/community/[...path]/route.ts:136 -> src/server/community/social.ts:215 readNotes
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body {upto?: ISO}
- 200: 200 {unread:0}
- Writes: community_note.read; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_note)

### media (8)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/community/media` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-upload:<uid> 30/h (RATE_COMMUNITY_UPLOADS_PER_HOUR) | community_media; every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/media/{id}` | student / required | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-read:<uid> 600/min (RATE_COMMUNITY_READS_PER_MIN) | every call: community sweep (rejected >30 d, expired stories, stale media) + presence |
| GET | `/api/v1/community/media/{id}/{file}` | any signed-in account whose uid the URL was signed for / not sent (an <img>/<video> tag) | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-files:<uid> 5000/h (RATE_COMMUNITY_FILES_PER_HOUR) | - |
| HEAD | `/api/v1/community/media/{id}/{file}` | any signed-in account whose uid the URL was signed for / not sent (an <img>/<video> tag) | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-files 5000/h | - |
| GET | `/api/v1/community/avatar/{handle}` | any signed-in account whose uid the URL was signed for / not sent (an <img>/<video> tag) | communityOn() = COMMUNITY=1 (not deployed (M1)) | community-files:<uid> 5000/h | - |
| POST | `/api/v1/me/photo` | student or parent / required | - (live) | photo:<uid> 30/h (RATE_PHOTO_WRITE_PER_HOUR) | profile_photo upsert (bytes in Postgres); profile.photo_url |
| DELETE | `/api/v1/me/photo` | student or parent / required | - (live) | photo:<uid> 30/h | profile_photo delete; profile.photo_url=null |
| GET | `/api/v1/photo/{userId}` | any signed-in viewer: the account itself or its linked family (maySeePhoto) / not sent (<img>) | - (live) | photo-read:<viewer> 1200/h (RATE_PHOTO_READ_PER_HOUR) | - |

#### POST /api/v1/community/media
- Evidence: `src/app/api/v1/community/[...path]/route.ts:103`; service: src/app/api/v1/community/[...path]/route.ts:103 -> src/server/community/posts.ts:438 upload
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: body raw bytes; content-type image/jpeg|png|webp | video/mp4|quicktime|webm; cap photo 10 MiB, video 100 MiB / 60 s / 720 lines (src/server/community/contract.ts:216)
- 200: 201 {media: Media} (photo ready at once: re-encoded, EXIF/GPS stripped; video processing until ffmpeg finishes)
- Other answers: 413; 415; 422
- Writes: community_media; every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: community_media)
- Side effects: image re-encode; ffmpeg/ffprobe child process for video (src/server/media/jobs.ts:25); store: MEDIA_STORE local (MEDIA_DIR) or Cloudflare R2 via signed S3 fetch (src/server/media/r2.ts:48); static markers: child-process, fetch, fs-write
- Notes: Caddy request_body max_size 12MB cuts videos over 12 MB at the proxy today.

#### GET /api/v1/community/media/{id}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:100`; service: src/app/api/v1/community/[...path]/route.ts:100 -> src/server/community/posts.ts:492 mediaInfo
- Auth: community handle() src/app/api/v1/community/[...path]/route.ts:69 (apiUser student); demo refused; refusals in order: 404 {error:"not found"} COMMUNITY off (before anything) -> 401/409/401/403 as apiUser(student) -> 429 {error:"too many"} (reads 600/min, writes 60/min) -> 413/400 body (8 KiB cap)
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: none
- 200: 200 {media: Media} (poll while processing)
- Writes: every call: community sweep (rejected >30 d, expired stories, stale media) + presence (static reach: none)

#### GET /api/v1/community/media/{id}/{file}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:32`; service: src/app/api/v1/community/[...path]/route.ts:30 files(); src/server/media/sign.ts verifyMediaSig; src/server/community/posts.ts:498 mediaFor
- Auth: auth() session cookie only + HMAC-signed URL (src/server/media/sign.ts verifyMediaSig); demo n/a; refusals in order: 404 COMMUNITY off -> 404 no session / bad file name / bad signature -> 403 {error:"expired"} signature expired -> 429 community-files 5000/h
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: params id uuid, file i.jpg|v.mp4|p.jpg; query ?e=<expiry>&s=<sig>; headers Range
- 200: 200/206 bytes, private no-transform max-age<=ttl(<=3600), noindex, no-referrer, nosniff, inline
- Other answers: 404; 403 {error:"expired"}; 416
- Writes: none (static reach: none)
- Streaming: byte ranges

#### HEAD /api/v1/community/media/{id}/{file}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:32`; service: as GET (head)
- Auth: auth() session cookie only + HMAC-signed URL (src/server/media/sign.ts verifyMediaSig); demo n/a; refusals in order: 404 COMMUNITY off -> 404 no session / bad file name / bad signature -> 403 {error:"expired"} signature expired -> 429 community-files 5000/h
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: params as GET
- 200: headers only
- Writes: none
- Notes: Any other HEAD under /community answers 404.

#### GET /api/v1/community/avatar/{handle}
- Evidence: `src/app/api/v1/community/[...path]/route.ts:59`; service: src/server/community/social.ts:222 avatar
- Auth: auth() session only; demo n/a; refusals in order: 404 COMMUNITY off -> 404 no session / bad file name / bad signature -> 403 {error:"expired"} signature expired -> 429 community-files 5000/h
- Gate: communityOn() = COMMUNITY=1 (src/server/community/switch.ts:13); off: 404 {error:"not found"} before auth (every method incl. HEAD). Prod: not deployed (M1)
- Request: params handle
- 200: the avatar image (or redirect/404 per avatar())
- Writes: none (static reach: none)

#### POST /api/v1/me/photo
- Evidence: `src/app/api/v1/me/photo/route.ts:25`; service: src/server/photo.ts:88 checkPhoto, :102 savePhoto
- Auth: owner() src/app/api/v1/me/photo/route.ts:13; demo refused; refusals in order: 401 -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body raw image/jpeg|png|webp (page crops/sizes first); cap 100 KiB (PHOTO_MAX_BYTES)
- 200: 200 {photoUrl} (/api/v1/photo/<uid>?v=<version>)
- Other answers: 413; 400 {error:"empty"}; 415 {error:"unsupported type"|"not an image"|"type mismatch"|"animated"}; 422 {error:"bad size"}
- Writes: profile_photo upsert (bytes in Postgres); profile.photo_url (static reach: profile, profile_photo)

#### DELETE /api/v1/me/photo
- Evidence: `src/app/api/v1/me/photo/route.ts:37`; service: src/server/photo.ts:113 deletePhoto
- Auth: owner(); demo refused; refusals in order: 401 -> 409 -> 403 demo
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {photoUrl:null}
- Writes: profile_photo delete; profile.photo_url=null (static reach: profile, profile_photo)

#### GET /api/v1/photo/{userId}
- Evidence: `src/app/api/v1/photo/[userId]/route.ts:12`; service: src/server/photo.ts:131 maySeePhoto, :121 readPhoto
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: -
- Gate: none; off: n/a (always on). Prod: live
- Request: params userId; query ?v=<version>; headers If-None-Match
- 200: 200 image bytes (mime from its bytes), ETag "<version>", vary Cookie, cache private immutable 1y when ?v is current else no-cache; nosniff; CSP sandbox
- Other answers: 401; 404 (also for a stranger); 304
- Writes: none (static reach: none)

### pay (15)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/plans` | none (public) / n/a | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | - |
| GET | `/api/v1/me/subscription` | student or parent / not checked (read) | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | - |
| POST | `/api/v1/pay/checkout` | student or parent / required | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | pay-checkout:<uid> 600/h (engineWrite rule) | pay_order (price fixed now, soum at the configured rate); pay_gift for a gift |
| GET | `/api/v1/pay/orders/{number}` | student or parent / not checked (read) | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | - |
| GET | `/api/v1/pay/billing` | student or parent / not checked (read) | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | - |
| GET | `/api/v1/pay/coupons` | student or parent / not checked (read) | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | - |
| POST | `/api/v1/pay/coupons/{id}/redeem` | student or parent / required | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | pay_coupon.used_at; subscription (schedule, stacking rule) |
| GET | `/api/v1/pay/gifts` | student or parent / not checked (read) | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | none | - |
| POST | `/api/v1/pay/gifts/claim` | student or parent / required | paymentsOn() = PAYMENTS=1 (not deployed (M1)) | pay-claim:<uid> 10/h | pay_gift.claimed_by/at (row lock); subscription |
| POST | `/api/v1/pay/payme` | Payme server-to-server callback (no session) / n/a | paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (not deployed (M1)) | none | pay_txn (idempotent by Payme id); pay_event audit; subscription / pay_gift activation on perform; pay_coupon used; refund on cancel reason 5 |
| GET | `/api/v1/pay/payme` | none (public) / n/a | paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (not deployed (M1)) | none | - |
| POST | `/api/v1/pay/click/prepare` | Click server-to-server callback (no session) / n/a | paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (not deployed (M1)) | none | pay_txn; pay_event |
| POST | `/api/v1/pay/click/complete` | Click server-to-server callback (no session) / n/a | paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (not deployed (M1)) | none | pay_txn paid/cancelled; pay_event; subscription/pay_gift activation; pay_coupon used |
| POST | `/api/v1/pay/sandbox/{number}` | student or parent / required | sandboxOn() = PAYMENTS on && PAYMENTS_SANDBOX=1 && DATABASE_URL names a dev\|test\|sandbox DB (not deployed (M1; sandboxOn() refuses a production database)) | none | through our own Payme/Click handlers: pay_txn, pay_event, subscription |
| POST | `/api/v1/staff/billing` | staff (STAFF_USER_IDS; with MODERATION on also staff_member counselor\|teacher\|admin) / required | PAYMENTS (not deployed (M1)) | staff-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | pay_txn cancelled/refunded; subscription ended now (refundOrder); pay_event payment.refunded |

#### GET /api/v1/plans
- Evidence: `src/app/api/v1/plans/route.ts:6`; service: src/server/pay/plans.ts:57 planTable
- Auth: -; demo n/a; refusals in order: -
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: none
- 200: 200 {currency:"USD", charge_currency:"UZS", fx:{uzs_per_usd,source,rounding}|null, auto_renewal:false, plans:[{key,name,tag,monthly{usd_cents,uzs},annual{usd_cents_per_month,usd_cents,uzs}}], gift:{surcharge_pct, months}}
- Writes: none (static reach: none)
- Notes: Public (no session).

#### GET /api/v1/me/subscription
- Evidence: `src/app/api/v1/me/subscription/route.ts:12`; service: src/server/pay/entitlement.ts:48 entitlementOf; src/server/pay/http.ts:28 studentFor
- Auth: payUser(req) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: query parent: ?student=<id> (else first linked child)
- 200: 200 {student, tier, period, starts_on, ends_on, last_day, days_left, source, online_premium, limits...}
- Other answers: 404 {error:"no linked child"}
- Writes: none (static reach: none)

#### POST /api/v1/pay/checkout
- Evidence: `src/app/api/v1/pay/checkout/route.ts:17`; service: src/server/pay/checkout.ts:31 startCheckout
- Auth: payUser(req,{write:true}) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: body { kind: plan|gift, tier: pro|premium|vip, period?: monthly|annual, months?: int (gift 1|3|6|12), provider: payme|click, student?<=80|null, coupon?<=80|null, note?<=200, for_name?<=80, lang?<=4 }; cap 4 KiB
- 200: 200 {order:{number,kind,tier,months,usd_cents,list_usd_cents,uzs}, redirect (Payme/Click checkout URL with return /pay/return?order=N, or /pay/sandbox/N), sandbox}
- Other answers: 400 {error:"invalid"}; 403 {error:"not your child"}; 409 {error:"coupon"|<OrderRefused reason>}; 503 {error:"provider-off"|"no-rate"}
- Writes: pay_order (price fixed now, soum at the configured rate); pay_gift for a gift (static reach: pay_gift, pay_order)
- Notes: Return URL base: AUTH_URL else request origin.

#### GET /api/v1/pay/orders/{number}
- Evidence: `src/app/api/v1/pay/orders/[number]/route.ts:6`; service: src/server/pay/checkout.ts:60 orderView
- Auth: payUser(req) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: params number ^[1-9][0-9]{0,15}$
- 200: 200 {number,kind,tier,period,months,usd_cents,list_usd_cents,uzs,status: pending|paid|cancelled|refunded,sandbox,created_at, gift?:{code,opened}, plan?: entitlement}
- Other answers: 404 {error:"not found"} (not payer nor student)
- Writes: none (static reach: none)

#### GET /api/v1/pay/billing
- Evidence: `src/app/api/v1/pay/billing/route.ts:6`; service: src/server/pay/checkout.ts:77 billing
- Auth: payUser(req) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: query ?student=
- 200: 200 {rows:[{number,kind,tier,period,months,usd_cents,uzs,paid_on,provider,refunded,sandbox}]} (<=50, newest first)
- Writes: none (static reach: none)

#### GET /api/v1/pay/coupons
- Evidence: `src/app/api/v1/pay/coupons/route.ts:8`; service: src/server/pay/coupons.ts:30 openCoupons
- Auth: payUser(req) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: none
- 200: 200 {coupons:[{id,kind,expires_at}]} (parents get [])
- Writes: none (static reach: none)

#### POST /api/v1/pay/coupons/{id}/redeem
- Evidence: `src/app/api/v1/pay/coupons/[id]/redeem/route.ts:8`; service: src/server/pay/coupons.ts:41 redeemProMonth
- Auth: payUser(req,{write:true}) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: params id
- 200: 200 {ok:true, tier, starts_on, ends_on}
- Other answers: 403 {error:"students only"}; 409 {error:"used or expired"}
- Writes: pay_coupon.used_at; subscription (schedule, stacking rule) (static reach: pay_coupon, subscription)

#### GET /api/v1/pay/gifts
- Evidence: `src/app/api/v1/pay/gifts/route.ts:7`; service: src/server/pay/gifts.ts:60 giftsSent
- Auth: payUser(req) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: none
- 200: 200 {gifts:[{number,tier,months,for_name,usd_cents,uzs,sent_at,refunded,opened,code}]}
- Writes: none (static reach: none)

#### POST /api/v1/pay/gifts/claim
- Evidence: `src/app/api/v1/pay/gifts/claim/route.ts:10`; service: src/server/pay/gifts.ts:44 claimGift
- Auth: payUser(req,{write:true}) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: paymentsOn() = PAYMENTS=1 (src/server/pay/switch.ts:18); off: 404 {error:"not found"} inside payUser, before session read. Prod: not deployed (M1)
- Request: body { code 4..40 }; cap 1 KiB
- 200: 200 {ok:true, tier, months, startsOn, endsOn, lastDay, fromName}
- Other answers: 404 {ok:false,error:"not-found"}; 409 {ok:false,error:"not-a-student"|"not-paid"|"claimed"}
- Writes: pay_gift.claimed_by/at (row lock); subscription (static reach: pay_gift, subscription)

#### POST /api/v1/pay/payme
- Evidence: `src/app/api/v1/pay/payme/route.ts:8`; service: src/server/pay/payme.ts:361 handlePayme; src/server/pay/rails.ts:40 paymeRail
- Auth: Basic auth base64(login:key) checked in handlePayme (src/server/pay/payme.ts); demo n/a; refusals in order: -
- Gate: paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (or PAYMENTS_SANDBOX on a scratch DB) (src/server/pay/rails.ts:40,44); off: 503 {error:"payments are not enabled"} before the body is read. Prod: not deployed (M1)
- Request: headers Authorization: Basic base64(Paycom:<key>); body JSON-RPC 2.0: CheckPerformTransaction | CreateTransaction | PerformTransaction | CancelTransaction | CheckTransaction | GetStatement (account.order_id = our order number; amounts in tiyin); cap 16 KiB (else answered as a not-POST error)
- 200: ALWAYS HTTP 200 with a JSON-RPC result or error (-32504 auth, -31001 amount, -31003 not found, -31007 cannot cancel, -31008 cannot perform/timeout 12 h, -31050..-31053 account)
- Writes: pay_txn (idempotent by Payme id); pay_event audit; subscription / pay_gift activation on perform; pay_coupon used; refund on cancel reason 5 (static reach: pay_coupon, pay_event, pay_txn, subscription)
- Notes: Ported unchanged from the earlier JamalsGlobal payments lane with its tests (src/server/pay/payme.ts:1-45, docs/ai/PAYMENTS.md). Port 1:1 with the same test vectors.

#### GET /api/v1/pay/payme
- Evidence: `src/app/api/v1/pay/payme/route.ts:14`; service: src/server/pay/payme.ts:141 paymeNotPost
- Auth: -; demo n/a; refusals in order: -
- Gate: paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (or PAYMENTS_SANDBOX on a scratch DB) (src/server/pay/rails.ts:40,44); off: 503 {error:"payments are not enabled"} before the body is read. Prod: not deployed (M1)
- Request: none
- 200: 200 JSON-RPC error (not a POST)
- Writes: none (static reach: pay_coupon, pay_event, pay_txn, subscription)

#### POST /api/v1/pay/click/prepare
- Evidence: `src/app/api/v1/pay/click/prepare/route.ts:5`; service: src/server/pay/click.ts:175 handleClickPrepare
- Auth: md5 sign_string checked in src/server/pay/click.ts; demo n/a; refusals in order: -
- Gate: paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (or PAYMENTS_SANDBOX on a scratch DB) (src/server/pay/rails.ts:40,44); off: 503 {error:"payments are not enabled"} before the body is read. Prod: not deployed (M1)
- Request: body application/x-www-form-urlencoded Click SHOP API action 0 (click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string, error...); cap 8 KiB (else {error:-8})
- 200: 200 JSON {click_trans_id, merchant_trans_id, merchant_prepare_id, error, error_note} (0 ok, -1 sign, -2 amount, -3 action, -4 already paid, -5 not found, -6 txn, -7 update, -8 request, -9 cancelled)
- Writes: pay_txn; pay_event (static reach: pay_coupon, pay_event, pay_txn, subscription, user)
- Notes: md5(click_trans_id+service_id+SECRET_KEY+merchant_trans_id+amount+action+sign_time) over the raw strings (src/server/pay/click.ts:14-17).

#### POST /api/v1/pay/click/complete
- Evidence: `src/app/api/v1/pay/click/complete/route.ts:5`; service: src/server/pay/click.ts:210 handleClickComplete
- Auth: md5 sign_string checked in src/server/pay/click.ts; demo n/a; refusals in order: -
- Gate: paymeRail()/clickRail() non-null = PAYMENTS on AND provider keys set (or PAYMENTS_SANDBOX on a scratch DB) (src/server/pay/rails.ts:40,44); off: 503 {error:"payments are not enabled"} before the body is read. Prod: not deployed (M1)
- Request: body form-encoded action 1 (+ merchant_prepare_id); cap 8 KiB
- 200: 200 JSON as prepare (+ merchant_confirm_id); negative `error` from Click cancels an UNPAID txn (-9); a confirmed one stays -4
- Writes: pay_txn paid/cancelled; pay_event; subscription/pay_gift activation; pay_coupon used (static reach: pay_coupon, pay_event, pay_txn, subscription, user)

#### POST /api/v1/pay/sandbox/{number}
- Evidence: `src/app/api/v1/pay/sandbox/[number]/route.ts:13`; service: src/server/pay/sandbox.ts:13 simulate; src/server/pay/db-store.ts:50 dbStore
- Auth: payUser(req,{write:true}) src/server/pay/http.ts:16; demo refused; refusals in order: 404 {error:"not found"} PAYMENTS off (before anything) -> 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: sandboxOn() = PAYMENTS on && PAYMENTS_SANDBOX=1 && DATABASE_URL names a dev|test|sandbox DB (src/server/pay/switch.ts:27); off: 404 {error:"not found"}. Prod: not deployed (M1; sandboxOn() refuses a production database)
- Request: params number; body { provider: payme|click, outcome: paid|failed }; cap 512 B
- 200: 200 {ok:true} | 409 {ok:false}
- Other answers: 404 {error:"not found"} not the payer; 409 {error:"not a sandbox order"}
- Writes: through our own Payme/Click handlers: pay_txn, pay_event, subscription (static reach: pay_coupon, pay_event, pay_txn, subscription, user)
- Notes: Scratch databases only.

#### POST /api/v1/staff/billing
- Evidence: `src/app/api/v1/staff/billing/route.ts:11`; service: src/server/pay/staff.ts:32 markRefunded
- Auth: staffUser(req,{write:true}) src/server/phase-x/staff.ts:23; demo refused (404); refusals in order: 404 {error:"not found"} PHASE_X off -> 404 not staff / no session -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: PAYMENTS (checked first) then staffUser (PHASE_X + STAFF_USER_IDS); off: 404 {error:"not found"}. Prod: not deployed (M1)
- Request: body { op:"refund", txn (1..80), note <=300 (default "") }; cap 2 KiB
- 200: 200 {ok:true} | 409 {ok:false, error:"not a paid payment"}
- Writes: pay_txn cancelled/refunded; subscription ended now (refundOrder); pay_event payment.refunded (static reach: pay_event, pay_txn, subscription)

### games (6)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/games/daily` | student / required | gamesServerOn() = GAMES_SERVER=1 (not deployed (M1)) | none | withStudent ensure-rows only |
| POST | `/api/v1/games/daily` | student / required | gamesServerOn() = GAMES_SERVER=1 (not deployed (M1)) | game-daily:<uid> 60/h (env RATE_GAME_CREDIT_PER_HOUR) | game_daily_answer (one per day) |
| GET | `/api/v1/games/campus` | student / required | gamesServerOn() = GAMES_SERVER=1 (not deployed (M1)) | none | withStudent ensure-rows only |
| POST | `/api/v1/games/campus/guess` | student / required | gamesServerOn() = GAMES_SERVER=1 (not deployed (M1)) | game-campus:<uid> 60/h (env RATE_GAME_CREDIT_PER_HOUR) | game_campus_round (scored once) |
| GET | `/api/v1/games/me` | student / required | gamesServerOn() = GAMES_SERVER=1 (not deployed (M1)) | none | withStudent ensure-rows only |
| POST | `/api/v1/games/result` | student / required | gamesServerOn() = GAMES_SERVER=1 (not deployed (M1)) | game-result:<uid> 60/h (env RATE_GAME_CREDIT_PER_HOUR) | game_result; game_rating upsert (Elo K=32, start 1000); coin_entry + wallet only for a result the server replayed and judged (idem game:<client_id>) |

#### GET /api/v1/games/daily
- Evidence: `src/app/api/v1/games/daily/route.ts:10`; service: src/server/games/daily.ts:59 dailyOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: gamesServerOn() = GAMES_SERVER=1 (src/server/games/switch.ts:9); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {date, number, qid, subject, question, options, answer|null}
- Writes: withStudent ensure-rows only (static reach: dream_build, engine_state, streak_state, wallet)

#### POST /api/v1/games/daily
- Evidence: `src/app/api/v1/games/daily/route.ts:16`; service: src/server/games/daily.ts:66 answerDaily
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: gamesServerOn() = GAMES_SERVER=1 (src/server/games/switch.ts:9); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: body { date YYYY-MM-DD, choice int 0..9, seconds 0..86400 }; cap 512 B
- 200: 200 {answer} (right option, why, today real share of right answers)
- Other answers: 409 {error:"date"} not her local today; 400 {error:"choice"}; 403 demo
- Writes: game_daily_answer (one per day) (static reach: dream_build, engine_state, game_daily_answer, streak_state, wallet)

#### GET /api/v1/games/campus
- Evidence: `src/app/api/v1/games/campus/route.ts:6`; service: src/server/games/campus.ts:44 campusOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: gamesServerOn() = GAMES_SERVER=1 (src/server/games/switch.ts:9); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 today CampusGuessr: five campuses, her score, the day leaderboard
- Writes: withStudent ensure-rows only (static reach: dream_build, engine_state, streak_state, wallet)

#### POST /api/v1/games/campus/guess
- Evidence: `src/app/api/v1/games/campus/guess/route.ts:10`; service: src/server/games/campus.ts:48 campusGuess
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: gamesServerOn() = GAMES_SERVER=1 (src/server/games/switch.ts:9); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: body { date, round int 0..4, lat |<=90|, lon |<=180| }; cap 512 B
- 200: 200 {km, points, ...campus view}
- Other answers: 409 {error:"date"}; 400 {error:"round"|"pin"}; 403 demo
- Writes: game_campus_round (scored once) (static reach: dream_build, engine_state, game_campus_round, streak_state, wallet)

#### GET /api/v1/games/me
- Evidence: `src/app/api/v1/games/me/route.ts:6`; service: src/server/games/results.ts:73 ratingsOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: gamesServerOn() = GAMES_SERVER=1 (src/server/games/switch.ts:9); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {on:true, ratings:{chess, checkers} (0 = not rated), computer: 1200}
- Writes: withStudent ensure-rows only (static reach: dream_build, engine_state, streak_state, wallet)

#### POST /api/v1/games/result
- Evidence: `src/app/api/v1/games/result/route.ts:10`; service: src/server/games/results.ts:84 saveResult
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: gamesServerOn() = GAMES_SERVER=1 (src/server/games/switch.ts:9); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: body { kind: chess|checkers, moves: string(2..40)[] <=400, result: win|lose|draw, why <=40, client_id }; cap 16 KiB
- 200: 200 {verified, result, rating:{before,after,delta}|null, credited, balance, replay}
- Other answers: 400 {error:"moves"}; 403 demo
- Writes: game_result; game_rating upsert (Elo K=32, start 1000); coin_entry + wallet only for a result the server replayed and judged (idem game:<client_id>) (static reach: coin_entry, dream_build, engine_state, game_rating, game_result, streak_state, wallet)
- Notes: The server replays the moves (src/server/games/*) and pays only a checked win.

### league (4)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/league` | student / required | leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (not deployed (M1)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | league placement on demand (league_week, league_cohort, league_member, league_player); achievement_award (syncStreakAwards) |
| POST | `/api/v1/achievements/seen` | student / required | leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (not deployed (M1)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | achievement_award.ceremony_at |
| GET | `/api/v1/motivation` | student / required | leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (not deployed (M1)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | withStudent ensure-rows |
| POST | `/api/v1/motivation` | student / required | leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (not deployed (M1)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | student_motivation |

#### GET /api/v1/league
- Evidence: `src/app/api/v1/league/route.ts:7`; service: src/server/league/api.ts:14 leagueOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (src/server/league/switch.ts:18); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {board: LeagueBoard|null, medals: AwardView[]}
- Other answers: 403 {error:"demo"}
- Writes: league placement on demand (league_week, league_cohort, league_member, league_player); achievement_award (syncStreakAwards) (static reach: achievement_award, dream_build, engine_state, league_cohort, league_member, league_player, league_week, streak_state, wallet)
- Side effects: weekly rollover also runs in-process every 10 min (src/server/league/worker.ts, started by src/instrumentation.ts:13)

#### POST /api/v1/achievements/seen
- Evidence: `src/app/api/v1/achievements/seen/route.ts:10`; service: src/server/league/api.ts:26 ceremonyPlayed
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (src/server/league/switch.ts:18); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: body { ids: string(1..16)[] 1..40 }; cap 2 KiB
- 200: 200 {marked, medals}
- Writes: achievement_award.ceremony_at (static reach: achievement_award, dream_build, engine_state, streak_state, wallet)

#### GET /api/v1/motivation
- Evidence: `src/app/api/v1/motivation/route.ts:7`; service: src/server/motivation/api.ts:18 motivationOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (src/server/league/switch.ts:18); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: none
- 200: 200 {motivation} (her why, sealed letter without text while sealed, comeback plan, style looks)
- Writes: withStudent ensure-rows (static reach: dream_build, engine_state, streak_state, student_motivation, wallet)

#### POST /api/v1/motivation
- Evidence: `src/app/api/v1/motivation/route.ts:16`; service: src/server/motivation/api.ts:27 motivationOp
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: leagueOn() = ENGINE_LIVE=1 && LEAGUE=1 (src/server/league/switch.ts:18); off: 404 {error:"off"} before auth. Prod: not deployed (M1)
- Request: body {op:"why",text<=2000} | {op:"seal",text<=8000} | {op:"ps",text<=8000} | {op:"comeback"} | {op:"comeback_step",day 1..3,kind session|task} | {op:"style",active:{<=16:<=32}} (src/server/motivation/api.ts:9-16); cap 16 KiB
- 200: {body} with status (src/server/motivation/store.ts applyOp)
- Writes: student_motivation (static reach: dream_build, engine_state, streak_state, student_motivation, wallet)

### jamol/AI (5)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/ai/sample` | any signed-in (AI_LOCK: students only) / not checked | AI_LOCK (live (AI_LOCK path is M1)) | takeQuota: per user per UTC day AI_DAILY_LIMIT 200 (or the plan Ask-Jamol limit with PLAN_LIMITS), global AI_GLOBAL_DAILY_LIMIT 1000, lesson cap AI_LESSON_DAILY_LIMIT 10; locked: takeJamol pools chat/lesson + dollar meter (src/server/jamol/quota.ts:54) | ai_usage (count, chat/lesson, cost_usd, tokens; settled after the stream ends); reads ai_settings |
| POST | `/api/v1/lessons/hint` | student / required | lessonsOn() = PHASE_X=1 && LESSONS=1 (live (LESSONS on)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | check_run (hint claimed once per item); ai_usage |
| POST | `/api/v1/ai/prepare` | student / required | AI layer step "result" on (live (AI_LAYER on)) | ai-prepare:<uid> 1 per 2 min (RATE_AI_PREPARE_PER_2MIN); over it: no work, still 202 | ai_job (result draft) while a diagnostic runs, within the result allowance |
| POST | `/api/v1/ai/react` | student / required | AI layer step "react" (live (AI_LAYER on)) | ai-react:<uid> 40/h (RATE_AI_REACT_PER_HOUR); over it {line:null} | ai_run |
| POST | `/api/v1/ai/consent` | student / required | aiConsentOn() = AI_CONSENT=1 (not deployed (M1)) | none | ai_consent (insert, on conflict nothing) |

#### POST /api/v1/ai/sample
- Evidence: `src/app/api/v1/ai/sample/route.ts:36`; service: AI_LOCK on: src/server/jamol/sample.ts:46 lockedSample; off: src/server/ai.ts:26 takeQuota + :54 streamSample (+ src/server/lessons/jamol.ts:110 lessonAsk)
- Auth: auth() session only (src/auth.ts) + getProfile; demo see notes; refusals in order: -
- Gate: AI_LOCK (on unless 0|false|off|no, src/server/jamol/switch.ts:22) picks the locked path; LESSONS decides whether lesson_id is read; AI notice must be live (ANTHROPIC_API_KEY + ai_settings.notice_version); off: no 404: 503 (empty) while no notice is live. Prod: live (AI_LOCK path is M1)
- Request: body { messages: [{role:user|assistant, content 1..8000}] 1..16, total <=16000 chars; modelTier?<=20; lesson_id?: [A-Za-z0-9_.:-]<=80; lang?<=5 }; cap 64 KiB
- 200: 200 text/plain; charset=utf-8 STREAM of the model text (no JSON); headers no-store, x-accel-buffering:no
- Other answers: 401 (empty); 413; 400 (empty); 403 (empty) lesson question from non-student/demo; 404 (empty) unknown lesson; 503 (empty) AI notice not live; 429 (empty) over quota; locked path: refuse(status, code) JSON 400 coach|precheck|empty, 403 students_only|consent, 404 lesson, 428 notice, 429 quota|budget
- Writes: ai_usage (count, chat/lesson, cost_usd, tokens; settled after the stream ends); reads ai_settings (static reach: ai_usage)
- Side effects: Anthropic beta messages.stream (model AI_MODEL_QUICK/AI_MODEL_DEFAULT, betas server-side-fallback-2026-07-01, fallbacks default, output_config.effort) (src/server/ai.ts:54-77); static markers: anthropic-call
- Streaming: chunked text/plain (ReadableStream of deltas)
- Notes: Locked path builds the server own prompts by purpose (seeds|mention|ask|lesson) so the endpoint is never a general Claude proxy. The page AbortSignal cancels the upstream call.

#### POST /api/v1/lessons/hint
- Evidence: `src/app/api/v1/lessons/hint/route.ts:28`; service: src/server/lessons/hint.ts:150 hintAsk, :161 claimHint, :167 releaseHint; src/server/jamol/quota.ts:54 takeJamol; src/server/ai.ts:54 streamSample
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: lessonsOn() = PHASE_X=1 && LESSONS=1 (src/server/lessons/switch.ts:49); off: 404 {error:"not found"} before auth. Prod: live (LESSONS on)
- Request: query ?lang=uz|ru|en (else profile.roadmap_lang, else en); body { run <=64, item [A-Za-z0-9_.:~-]<=64 } strict; cap 1 KiB
- 200: 200 text/plain stream: Jamol one hint (key never sent; built from the lesson text + the why with the right option cut)
- Other answers: 404 {error:"run"|"item"|"lesson"}; 409 {error:"not_missed"}; 503 {error:"ai_off"}; 409 {error:"used"}; 429 {error:"quota"} (hint released again)
- Writes: check_run (hint claimed once per item); ai_usage (static reach: ai_usage, check_run)
- Side effects: Anthropic stream, HINT_MAX_TOKENS; static markers: anthropic-call
- Streaming: chunked text/plain

#### POST /api/v1/ai/prepare
- Evidence: `src/app/api/v1/ai/prepare/route.ts:13`; service: src/server/ailayer/draft.ts:29 prepareDraft; src/server/ailayer/worker.ts:23 wakeWorker
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: AI layer step "result" on (stepOn) + allowance; off: still 202. Prod: live (AI_LAYER on)
- Request: body { answers: object }; cap 96 KiB
- 200: 202 {accepted:true} always (after auth/body)
- Other answers: 400/413 body
- Writes: ai_job (result draft) while a diagnostic runs, within the result allowance (static reach: ai_job, dream_build, engine_state, streak_state, wallet)
- Side effects: in-process AI worker picks the job (src/server/ailayer/worker.ts, started by src/instrumentation.ts:14-16 when AI_LAYER=1); static markers: anthropic-call

#### POST /api/v1/ai/react
- Evidence: `src/app/api/v1/ai/react/route.ts:10`; service: src/server/ailayer/react.ts:27 reactLine
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: AI layer step "react"; off: {line:null}. Prod: live (AI_LAYER on)
- Request: body { module: M<digits>, answers: object }; cap 96 KiB (a bad body also answers {line:null})
- 200: 200 {line: string|null} (never an error the page must handle)
- Writes: ai_run (static reach: ai_run)
- Side effects: one Claude call (guarded output) unless one is cached or in flight; aborts with the request signal; static markers: anthropic-call

#### POST /api/v1/ai/consent
- Evidence: `src/app/api/v1/ai/consent/route.ts:14`; service: src/server/jamol/consent.ts:40 accept; src/server/ai-notice.ts:23 aiNoticeLive
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: aiConsentOn() = AI_CONSENT=1 (src/server/jamol/switch.ts:24); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { version: YYYY-MM-DD } strict; cap 256 B
- 200: 200 {ok:true, version}
- Other answers: 503 {error:"ai_off"}; 409 {error:"version", version} not the one in force
- Writes: ai_consent (insert, on conflict nothing) (static reach: ai_consent)

### core (4)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/v1/core/family` | parent / required | coreM1On() = CORE_M1=1 (not deployed (M1)) | engine-read:<uid> 600/h (env RATE_ENGINE_READ_PER_HOUR) | - |
| POST | `/api/v1/core/family` | parent / required | coreM1On() = CORE_M1=1 (not deployed (M1)) | engine-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | delete_answers: diagnostic_answer (source parent) delete, engine_state.parent_flow_done_at=null, engine_event, recompute; delete_child_text: diagnostic_answer free-text delete, engine_event; request_deletion: core_deletion_request |
| POST | `/api/v1/staff/core/{kind}/{id}` | staff role admin,moderator,counselor (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / required | coreM1On() = CORE_M1=1 (not deployed (M1)) | staff-write:<uid> 600/h (env RATE_ENGINE_WRITE_PER_HOUR) | score_report status (+ verified score written into the engine answers: diagnostic_answer, recompute); milestone_report state; deletion (admins only, child full name typed): moderation_audit, forgetChatUser, purgeCommunity (files), DELETE user (FK cascades) |
| GET | `/api/v1/staff/core/file/{id}` | staff role admin,moderator,counselor (admin passes every role; roles = STAFF_USER_IDS bootstrap admins + staff_member rows when MODERATION on) / not checked (read) | coreM1On() = CORE_M1=1 (not deployed (M1)) | staff-file:<uid> 1200/h (env RATE_PHOTO_READ_PER_HOUR) | - |

#### GET /api/v1/core/family
- Evidence: `src/app/api/v1/core/family/route.ts:18`; service: src/server/core/family-data.ts:28 familyState, :36 exportFamily
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: coreM1On() = CORE_M1=1 (src/server/core/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: query ?student=<id> (else first linked child); ?export=1
- 200: 200 {student_id, parent_answers, child_texts, request:{at}|null} | export=1: 200 application/json attachment jamals-global-family-data-<date>.json
- Other answers: 403 {error:"not linked"}
- Writes: none (static reach: none)

#### POST /api/v1/core/family
- Evidence: `src/app/api/v1/core/family/route.ts:32`; service: src/server/core/family-data.ts:54 deleteParentAnswers, :74 deleteChildText, :88 requestDeletion; src/server/core/reviewers.ts:21 whoCanAct
- Auth: apiUser(req,"parent") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"parents only"} -> 403 {error:"demo"}
- Gate: coreM1On() = CORE_M1=1 (src/server/core/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: body { action: delete_answers|delete_child_text|request_deletion, student_id?<=64 } strict; cap 512 B
- 200: 200 {deleted:n} | 200 {request:{at}}
- Other answers: 403 {error:"not linked"}; 409 {error:"unavailable"} no admin on staff
- Writes: delete_answers: diagnostic_answer (source parent) delete, engine_state.parent_flow_done_at=null, engine_event, recompute; delete_child_text: diagnostic_answer free-text delete, engine_event; request_deletion: core_deletion_request (static reach: admission_prediction, ai_job, ai_run, core_deletion_request, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, streak_state, task_batch, wallet)
- Side effects: static markers: anthropic-call

#### POST /api/v1/staff/core/{kind}/{id}
- Evidence: `src/app/api/v1/staff/core/[kind]/[id]/route.ts:18`; service: src/server/core/certs.ts:37 reviewCertificate; src/server/core/reports.ts:57 resolveMilestoneReport; src/server/core/family-data.ts:109 carryOutDeletion
- Auth: requireStaff(req,["admin","moderator","counselor"],{write:true}) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 409 {error:"wrong account"} -> 404 demo or no profile
- Gate: coreM1On() = CORE_M1=1 (src/server/core/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params kind score_report|milestone_report|deletion, id; body { decision: verified|rejected|confirmed|fixed|delete, note?<=500 (trim), confirm?<=200 } strict; cap 2 KiB
- 200: 200 {ok:true, marked?}
- Other answers: 400 {error:"decision"|"reason required"}; 404 {error:"missing"|"not found"}; 409 decided; 422 {error:"confirm"} deletion name mismatch
- Writes: score_report status (+ verified score written into the engine answers: diagnostic_answer, recompute); milestone_report state; deletion (admins only, child full name typed): moderation_audit, forgetChatUser, purgeCommunity (files), DELETE user (FK cascades) (static reach: admission_prediction, ai_job, ai_run, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, milestone_report, moderation_audit, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, schedule_state, score_report, streak_state, task_batch, user, wallet)
- Side effects: static markers: anthropic-call

#### GET /api/v1/staff/core/file/{id}
- Evidence: `src/app/api/v1/staff/core/file/[id]/route.ts:11`; service: src/server/core/certs.ts:64 certificateFile
- Auth: requireStaff(req,["admin","moderator","counselor"]) src/server/moderation/staff.ts:53; demo refused (404); refusals in order: 404 {error:"not found"} no session -> 404 no staff role -> 404 lacks role -> 404 demo or no profile
- Gate: coreM1On() = CORE_M1=1 (src/server/core/switch.ts:14); off: 404 {error:"not found"} before auth. Prod: not deployed (M1)
- Request: params id = score_report id
- 200: 200 bytes (stored mime) private no-store, nosniff, CSP sandbox, inline, no-referrer
- Other answers: 404
- Writes: none (static reach: none)

### leads (1)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/leads/jia` | any signed-in non-demo account (student or parent) / required | jiaCardOn() = lessonsOn() && JIA_CARD=1 (not deployed (M1; route file absent from release c6b7372f; JIA_CARD off)) | jia-lead:<uid> 3/h | jia_lead (tg_status sent\|off\|failed, tg_message_id) |

#### POST /api/v1/leads/jia
- Evidence: `src/app/api/v1/leads/jia/route.ts:14`; service: src/server/leads/jia.ts:45 saveLead, :51 dispatchLead
- Auth: inline auth() + getProfile (route.ts:16-20); demo refused; refusals in order: 401 -> 409 {error:"wrong account"} -> 403 {error:"demo"} (also no profile)
- Gate: jiaCardOn() = lessonsOn() && JIA_CARD=1 (src/server/lessons/switch.ts:53); off: 404 {error:"not found"} before auth. Prod: not deployed (M1; route file absent from release c6b7372f; JIA_CARD off)
- Request: body { name 1..120, phone 5..40, city: tashkent|andijan|online, course: sat|ielts, lang: uz|ru|en } strict; cap 1 KiB
- 200: 201 {ok:true, number}
- Other answers: 400 {error:"invalid"} name <2 chars or phone not normalisable
- Writes: jia_lead (tg_status sent|off|failed, tg_message_id) (static reach: jia_lead)
- Side effects: fire-and-forget Telegram Bot API sendMessage to the staff leads topic (chat_id, message_thread_id, HTML) with retries; 400/403 stop retrying (src/server/leads/jia.ts:51-71); static markers: fetch, telegram

### outcomes (8)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| POST | `/api/v1/outcomes` | student or parent / required | - (live) | outcome:<uid> 60/h (env RATE_OUTCOME_WRITE_PER_HOUR) | admission_outcome (row lock, history appended); outcome_prompt answered for the window |
| POST | `/api/v1/outcomes/prompt` | student or parent / required | - (live) | outcome:<uid> 60/h (env RATE_OUTCOME_WRITE_PER_HOUR) | outcome_prompt |
| POST | `/api/v1/score-reports` | student / required | - (live (core queue part M1)) | outcome:<uid> 60/h (env RATE_OUTCOME_WRITE_PER_HOUR) | score_report (pending; never trusted until staff check the file); moderation_item score_report (M1 core queue) |
| GET | `/api/v1/score-reports` | student / required | - (live) | outcome-read:<uid> 600/h | - |
| POST | `/api/v1/proofs` | student or parent / required | - (live) | proof:<uid> 20/h (env RATE_PROOF_UPLOAD_PER_HOUR) | proof_file (bytes in Postgres, sha256 dedupe) |
| POST | `/api/v1/study/math` | student / required | - (live) | outcome:<uid> 60/h (env RATE_OUTCOME_WRITE_PER_HOUR) | study_pair; study_invite.uses |
| DELETE | `/api/v1/study/math` | student / required | - (live) | none | study_pair.withdrawn_at |
| POST | `/api/v1/study/math/ask` | student / required | - (live) | outcome:<uid> 60/h (env RATE_OUTCOME_WRITE_PER_HOUR) | study_consent (asked_at) when under 18 |

#### POST /api/v1/outcomes
- Evidence: `src/app/api/v1/outcomes/route.ts:13`; service: src/server/outcomes/store.ts:35 reportOutcomes; src/server/outcomes/api.ts:19 studentOf
- Auth: outcomeUser(req) src/server/outcomes/api.ts:9; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body OutcomeReport strict {student?, cycle 2024..2040, window? ^\d{4}-(dec|mar|apr|may|aug)$, items[1..20]: {target uni:|uz:|other:, name?, decision, round?, aid?, placement?, agencyScore? 0..189, proof? uuid}} (src/server/outcomes/input.ts:17-35); cap 8 KiB
- 200: 200 {ok:true, rows}
- Other answers: 403 {error:"not linked"}; 422 {error:"target"|"name"|"uz_only"|"proof"}; 400 a body naming verified or any extra field
- Writes: admission_outcome (row lock, history appended); outcome_prompt answered for the window (static reach: admission_outcome, outcome_prompt)

#### POST /api/v1/outcomes/prompt
- Evidence: `src/app/api/v1/outcomes/prompt/route.ts:11`; service: src/server/outcomes/store.ts:81 markPrompt
- Auth: outcomeUser(req) src/server/outcomes/api.ts:9; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { window, state: shown|skipped } strict; cap 512 B
- 200: 200 {ok:true}
- Other answers: 409 {error:"no child"}
- Writes: outcome_prompt (static reach: outcome_prompt)

#### POST /api/v1/score-reports
- Evidence: `src/app/api/v1/score-reports/route.ts:11`; service: src/server/outcomes/scores.ts:44 reportScore
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live (core queue part M1)
- Request: body ScoreReportIn strict {test: sat|psat|act|ielts|toefl|det|pte|cambridge|ap|ib|alevel|cefr|milliy|agency, subject?, scores:{total?,level?,sections?}, testDate?, proof uuid}; cap 2 KiB
- 200: 200 {id, status:"pending"}
- Other answers: 422 {error:"scores"|"proof"}
- Writes: score_report (pending; never trusted until staff check the file); moderation_item score_report (M1 core queue) (static reach: moderation_item, score_report)
- Side effects: static markers: anthropic-call

#### GET /api/v1/score-reports
- Evidence: `src/app/api/v1/score-reports/route.ts:21`; service: src/server/outcomes/scores.ts:54 scoreReportsOf
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {reports:[...]}
- Writes: none (static reach: none)

#### POST /api/v1/proofs
- Evidence: `src/app/api/v1/proofs/route.ts:14`; service: src/server/outcomes/proof.ts:29 checkProof; src/server/outcomes/scores.ts:24 saveProof
- Auth: outcomeUser(req) src/server/outcomes/api.ts:9; demo refused; refusals in order: 401 {error:"unauthenticated"} -> 409 {error:"wrong account"} -> 401 no profile -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: query ?kind=score_report|decision|bluebook&student=<id>; body raw file application/pdf | image/jpeg|png|webp (byte-checked); cap 4 MiB
- 200: 200 {id}
- Other answers: 400 {error:"kind"}; 403 {error:"students only"} parent with kind != decision; 403 {error:"not linked"}; 413; 415; 422 {error:"active content"}; 429 {error:"proof limit"}
- Writes: proof_file (bytes in Postgres, sha256 dedupe) (static reach: proof_file)
- Notes: Never served back to a page.

#### POST /api/v1/study/math
- Evidence: `src/app/api/v1/study/math/route.ts:14`; service: src/server/outcomes/study.ts:139 joinStudy
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body StudyJoin strict {code ^[A-Za-z0-9]{12,40}$, consent:true, consentVersion, kind: practice|official, date, math 200..800 step 10, total? 400..1600 step 10, proof?}; cap 1 KiB
- 200: 200 {ok:true}
- Other answers: 404 invalid; 410 revoked|expired|used up; 409 consent; 422 date|proof; 403 parent (under 18 without a linked parent yes)
- Writes: study_pair; study_invite.uses (static reach: study_invite, study_pair)

#### DELETE /api/v1/study/math
- Evidence: `src/app/api/v1/study/math/route.ts:24`; service: src/server/outcomes/study.ts:160 withdrawStudy
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {ok:true}
- Writes: study_pair.withdrawn_at (static reach: study_pair)

#### POST /api/v1/study/math/ask
- Evidence: `src/app/api/v1/study/math/ask/route.ts:13`; service: src/server/outcomes/study.ts:77 askParent
- Auth: apiUser(req,"student") src/server/api.ts:15; demo refused; refusals in order: 401 {error:"unauthenticated"} no session -> 409 {error:"wrong account"} x-jg-uid != session uid -> 401 {error:"unauthenticated"} no profile row -> 403 {error:"students only"} -> 403 {error:"demo"}
- Gate: none; off: n/a (always on). Prod: live
- Request: body { code ^[A-Za-z0-9]{12,40}$ } strict; cap 256 B
- 200: 200 {ok:true, needed, linked}
- Other answers: 404 invalid; 410 revoked|expired|used up
- Writes: study_consent (asked_at) when under 18 (static reach: study_consent)

### misc (1)

| Method | Path | Who / x-jg-uid | Switch (prod) | Rate | Writes |
|---|---|---|---|---|---|
| GET | `/api/health` | none (public) / n/a | - (live) | none | - |

#### GET /api/health
- Evidence: `src/app/api/health/route.ts:6`; service: src/app/api/health/route.ts:6 (select 1)
- Auth: -; demo n/a; refusals in order: -
- Gate: none; off: n/a (always on). Prod: live
- Request: none
- 200: 200 {ok:true} | 503 {ok:false}
- Writes: none (static reach: none)
- Notes: Docker/compose health check (force-dynamic).
