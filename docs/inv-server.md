# Inventory: the server area (src/server cross-cutting services) for the FastAPI port

Lane: inventory, area **server**. Read-only survey of `C:/Users/PC/jg-plan` at `m1-main ddbf9d81` (20 Oct 2026). Every
citation below is `path:line` in that tree unless it names `node_modules/...`. In that case the path is under
`C:/Users/PC/jg-p5int/node_modules`, because `jg-plan` has no `node_modules`. The installed versions are next-auth
5.0.0-beta.29 and @auth/core 0.41.3. Nothing was run against production. No `.env` or key was read.

Scope (from the brief): auth in depth, the AI layer, payments, the chat SSE hub, media/video, background jobs and crons,
Telegram posting, rate limits, switches, clocks, logging. The domain services that sit on top of these (engine services,
lessons, checks, CAT, phase-d/x, outcomes, parent, boot, pages) and the pure engine (`src/engine`) belong to other lanes.
They are counted here only where they constrain this area.

---

## 0. Counts (measured)

| What | Count | How measured |
|---|---|---|
| `src/server` files / lines (non-test) | 317 files, **31,568 lines** | `find src/server -name '*.ts' ! -name '*.test.ts' \| xargs wc -l` |
| `route.ts` files under `src/app` | **151**: 125 under `/api/v1`, `/api/auth/[...nextauth]`, `/api/health`, and 24 page routes (`/`, `/app`, `/parent`, `/signin`, `/signin/telegram`, `/signout`, `/staff/*`, `/pay/*`, `/gift`, `/join`, `/link`, `/c`, `/preview`, `/study`, `/welcome`, `/privacy`, `/terms`, `/favicon.ico`) | find |
| `/api/v1` method handlers | **127**: GET 43, POST 69, PUT 4, PATCH 1, DELETE 7, HEAD 3 | grep `export (async function\|const) GET…` |
| Files that call `auth()` | 34 | grep `from '@/auth'` |
| Files that use `apiUser()` (session + `x-jg-uid` + role + demo) | 55 | grep |
| `x-jg-uid` checks | 29 | grep |
| Distinct env names read | **about 130** (126 by grep, plus R2_*, AUTH_GOOGLE_SECRET and AUTH_SECRET_1..3, which libraries read) | grep `process.env.X`, `envInt('X')`, `*_ENV = 'X'` |
| Feature switches | 26 (§5) | `*_ENV` constants and `process.env.X === '1'` |
| Postgres advisory-lock sites | 12 (§15.2) | grep `pg_advisory` |
| `for update` / `.for('update')` | 27 (1 `skip locked`) | grep |
| Files that reach Claude | 14 (8 structured kinds, plus streaming Ask Jamol / hints / lesson questions, plus the moderation precheck) | grep `aiClient()\|streamSample(\|callStructured(` |
| zod-validated files (server + app) | 59 | grep `from 'zod'` |
| Tables (`pgTable(`) | **113** (schema.ts 71, community 12, chat 7, pay 7, league 6, moderation 6, m1-parent 3, core 1) | grep |
| SQL migrations | **51** (0000–0050). Production is at **0038**. 0039–0050 are the M1 lanes, merged but **not deployed** | `ls drizzle/*.sql`; `git log -1` subject |
| Tables whose id is generated **in the app** (`$defaultFn(crypto.randomUUID)`) | about 39 (10 definition sites, shared `uuid()` helpers) | grep (§15.3) |
| In-process loops/timers | 4 long-lived (AI worker poll 2 s, AI retention 24 h, league tick 10 min, chat presence/heartbeat) + 2 in-process encode queues | §11 |
| Unit test files | 600 in `tests/unit` + 4 in `src`; 48 files in `tests/smoke` | find |
| Server-area unit tests | ailayer 32, engine-server 122, core 14, chat 11, pay 11, moderation 7, community 4, games 4, league 3, video 3, plus auth/limits/register/photo/telegram/signout | find |
| Route tests that import a route module and mock `@/auth` | 53 files mock auth; 118 route-module imports | grep |
| Ops scripts (`scripts/`) | 49 files, about 2,086 lines (ts/mjs), run with `npx tsx` inside the container | find |

**Production state matters for the cutover.** The live release is `c6b7372f` with migrations at 0038. Switches on in
the container: ENGINE_LIVE, PHASE_D, PHASE_X, AI_LAYER, LESSONS, WRITING, SPEAKING, LESSONS_PARENT
(docs/ai/CURRENT_STATE.md:15). All M1 surfaces (MESSENGER, COMMUNITY, PAYMENTS, LEAGUE, GAMES_SERVER, MODERATION,
CORE_M1, PARENT_M1, JIA_CARD, AI_CONSENT) are in the code but neither deployed nor on. AI_LOCK defaults to **on** in
the M1 code (src/server/jamol/switch.ts:22), but that code is not live yet. So the parity target splits in two:
- **(a) live behaviour:** the pre-M1 surfaces, Auth, AI plan step, writing feedback, lessons.
- **(b) dark M1 code:** must be ported faithfully, but no real user depends on it yet. That makes it the safest place
  to rehearse the Python stack.

---

## 1. FastAPI vs Django REST: I agree with FastAPI

FastAPI is the better choice here. Django REST would cost more and fit less well, for five reasons:
- **Async.** Five things need it: the SSE hub (§9), Claude token streaming (`/api/v1/ai/sample`, §7.8), asyncpg
  `LISTEN`, the 2 s draft wait loop (§7.6), and in-process background loops. Django's async story still routes the ORM
  through threads, and DRF is sync.
- **The schema is not Django's.** It is owned by 51 drizzle migrations. Auth.js tables use camelCase quoted columns
  (`"userId"`, `"providerAccountId"`, `"emailVerified"`) and table names like `user` and `verificationToken`
  (src/db/schema.ts:7-36). The Django ORM and its migrations would fight this from day one, and `managed = False` on
  113 models throws away most of what Django gives.
- **Django's auth/session layer cannot be used.** Sessions must stay Auth.js-compatible (§2), so `django.contrib.auth`
  would be dead weight.
- **Pydantic v2 maps onto the zod request schemas (59 files) directly**, with one caveat: zod semantics differ (§14).
- **Django admin brings nothing.** Staff pages already exist as server-rendered HTML (`src/server/*/staff-page.ts`,
  `moderation/console-page.ts`).

"Python already used for Whisper" is weak support for the choice. `deploy/servercore/whisper/app.py` is a
standard-library `http.server`, it is not deployed, and SPEAKING_VOICE is off. It is not an argument either way.

**Recommended stack:**
- FastAPI on uvicorn: **one worker process** at first (§9 and §4 explain why), `--no-server-header`, access log off or
  query-redacted.
- SQLAlchemy 2 **Core**, not ORM, on asyncpg. Drizzle queries translate 1:1 to Core, `on_conflict_do_update` comes from
  `sqlalchemy.dialects.postgresql`, and `begin_nested()` gives savepoints.
- Raw `asyncpg` for `LISTEN`.
- pydantic v2 in strict mode, sse via a raw `StreamingResponse` (not sse-starlette's own framing, §9), httpx,
  `anthropic` (Python SDK), `cryptography` + `joserfc` (JWE), `authlib` (Google OIDC client only), `regex` (for `\p{L}`),
  PyICU (collation and Intl parity, §14), pyvips or Pillow (photos), `python-chess` (games), `fsrs` (engine lane),
  `tzdata`.

---

## 2. AUTH, in depth

### 2.1 What exists

`src/auth.ts:11-35`: one NextAuth v5 instance.

| Setting | Value | Line |
|---|---|---|
| adapter | `DrizzleAdapter(db, {users: user, accounts: account, sessions: session, verificationTokens: verificationToken})` | auth.ts:12 |
| **session strategy** | **`jwt`**, `maxAge` 30 days | auth.ts:13 |
| trustHost | true | auth.ts:14 |
| pages | `signIn: '/signin'`, `error: '/signin'` | auth.ts:15 |
| providers | Google (only when `AUTH_GOOGLE_ID` is set, `allowDangerousEmailAccountLinking: false`); Credentials `password` (fields `email`, `password`); Credentials `telegram` (field `payload`) | auth.ts:17-29 |
| callbacks | `jwt`: `token.uid = user.id` on sign-in. `session`: `session.user.id = token.uid` | auth.ts:32-33 |

The adapter is used **only** for Google sign-ins (createUser / getUserByAccount / linkAccount). With the JWT strategy
the `session` and `verificationToken` tables are never written. The tables stay, and Python can ignore them.

**Session identity everywhere** is `(await auth())?.user?.id`, which is `token.uid` (also `token.sub`). Nothing reads
`name`, `email` or `image` from the session. Callers re-read `profile` (src/server/api.ts:15-24).

### 2.2 The Auth.js wire contract the pages depend on

The browser runtime posts real HTML forms to Auth.js (public/runtime/auth.js:37-72, web/auth/signin.html:223). Python
must serve **the same paths and behaviour**:

| Endpoint | Used by | Behaviour to reproduce |
|---|---|---|
| `GET /api/auth/csrf` | auth.js:37, jg-runtime.js:163 | `{"csrfToken": t}`. Sets cookie `__Host-authjs.csrf-token` (http dev: `authjs.csrf-token`) = `t + "|" + sha256_hex(t + AUTH_SECRET)`, where `t` = 32 random bytes as hex (node_modules/@auth/core/lib/actions/callback/oauth/csrf-token.js; web.js `randomString`, `createHash`). An existing valid cookie is reused. |
| `POST /api/auth/callback/password` | form fields `csrfToken, email, password, callbackUrl` | CSRF double-submit check. On success the session cookie is set and the response is **302 to callbackUrl** (same-origin rule below). A `null` from `authorize` gives **302 `${AUTH_URL origin}/signin?error=CredentialsSignin&code=credentials`**. Rate-limited gives `…&code=rate_limited` (password-signin.ts:11, 17). Error redirect format: node_modules/@auth/core/index.js:130-141 (absolute URL). |
| `POST /api/auth/callback/telegram` | form `csrfToken, payload (JSON string), callbackUrl` | Same as password. Failure gives `error=CredentialsSignin&code=credentials`. |
| `POST /api/auth/signin/google` | form `csrfToken, callbackUrl` | 302 to Google with state + PKCE (S256). Auth.js sets cookies `__Secure-authjs.pkce.code_verifier` and `__Secure-authjs.callback-url`. Google's default checks are `["pkce"]` (node_modules/@auth/core/lib/utils/providers.js:52). |
| `GET /api/auth/callback/google` | Google redirect URI, **registered as `https://app.jamals.uz/api/auth/callback/google`** (docs/ai/CURRENT_STATE.md:2960) | Exchange the code, validate the id_token, link or create the user (§2.7), set the session cookie, 302 to the callback-url cookie. Linking errors give `/signin?error=OAuthAccountNotLinked`. The page maps that to "exists" (web/auth/signin.html:369). |
| `POST /api/auth/signout` | form `csrfToken, callbackUrl=/signin` (auth.js:72, jg-runtime.js:168) | CSRF check. Expire the session cookie (and its chunks). 302 to callbackUrl. GET `/signout` is a confirmation page and never signs out (src/app/signout/route.ts:12). |
| `GET /api/auth/session`, `/providers`, `/signin`, `/error` | not used by the runtime | Keep for safety. `/signin` and `/error` redirect to `/signin` (pages config). `/session` returns the session JSON or `null`. |

- **callbackUrl rule.** Auth.js's default `redirect` callback: a relative URL becomes `baseUrl + url`; same origin is
  kept; anything else goes to `baseUrl`. The pages already pre-filter with `safeNext` (src/lib/redirect.ts:26,
  public/runtime/auth.js:9-13).
- **Body cap on `/api/auth/*` POSTs is 16 KiB.** The body is read in a stream: a declared length over the cap is
  refused before reading, a chunked body is cut off past the cap, and the answer is 413
  (src/app/api/auth/[...nextauth]/route.ts:14-31). Caddy/HTTP2 sends chunked bodies with no Content-Length, so **never
  answer 411**.
- **CSRF only checks double-submit.** No Origin check exists beyond that and SameSite=Lax.

### 2.3 The session cookie: exact cryptography (the zero-logout contract)

- **Cookie name.** `__Secure-authjs.session-token` when the request URL is https, and `authjs.session-token` otherwise
  (node_modules/@auth/core/lib/utils/cookie.js:44-56; init.js:69 `url.protocol === "https:"`). next-auth rewrites the
  request URL to `AUTH_URL` (node_modules/next-auth/lib/env.js:4-10), so in production the name is decided by
  `AUTH_URL=https://app.jamals.uz` and is `__Secure-authjs.session-token`.
- **Attributes:** `HttpOnly; SameSite=Lax; Path=/; Secure; Expires=now+30d`.
- **Chunking.** A value longer than about 3,936 bytes is split into `<name>.0`, `<name>.1`, … and re-joined in key
  order (cookie.js:30-33, 140-147). Our tokens are small, but the **reader must accept chunks**.
- **Format.** A JWE compact token. The protected header is `{"alg":"dir","enc":"A256CBC-HS512","kid":<thumbprint>}`
  (node_modules/@auth/core/jwt.js:46-61).
  - **Key:** `HKDF-SHA256(ikm = AUTH_SECRET (utf-8), salt = cookie name, info = "Auth.js Generated Encryption Key (" + cookie name + ")", length = 64)` (jwt.js:116-129). The salt is the **cookie name**, so the http and https names produce different keys.
  - **kid:** RFC 7638 JWK thumbprint of `{"k": b64url(key), "kty": "oct"}` with **SHA-512** (`sha${64<<3}`), base64url (jwt.js:53).
  - **Claims:** the default token `{name, email, picture, sub}` + `uid` + `iat`, `exp = iat + 30d`, `jti = uuid4` (jwt.js:55-60).
  - **Decode:** try every secret (`AUTH_SECRET_1..3` are prepended before `AUTH_SECRET`, node_modules/@auth/core/lib/utils/env.js:27-37). Accept a missing `kid` or a matching one. Allowed `enc` values are `A256CBC-HS512` and `A256GCM` (a 32-byte key for GCM). Clock tolerance is 15 s (jwt.js:63-84). Any failure means "no session" (jwt.js:109-114).
- **No sliding expiry in practice.** Route handlers call `auth()` with no arguments. That path runs `getSession` and
  **throws away its Set-Cookie** (node_modules/next-auth/lib/index.js:43-48, 88-90). The runtime never calls
  `/api/auth/session`, and there is no `middleware.ts`. So a session lasts **30 days from sign-in, fixed**. Python
  should keep that (no re-issue on read). If sliding expiry is ever wanted, it is a product change and must be recorded
  as one.

**Python implementation (`jgapi/auth/jwe.py`).**
- `cryptography.hazmat.primitives.kdf.hkdf.HKDF(SHA256(), 64, salt, info)` for the key.
- `joserfc.jwe.encrypt_compact({"alg":"dir","enc":"A256CBC-HS512","kid":kid}, json_bytes, OctKey.import_key(key))`
  and `decrypt_compact`. Then check `exp` with 15 s leeway.
- The thumbprint: `b64url(sha512(b'{"k":"' + b64url(key) + b'","kty":"oct"}'))`.
- **Write a two-way vector test:** Node-issued cookies decode in Python, and Python-issued cookies decode with
  `@auth/core/jwt` `decode`. During coexistence and rollback both runtimes must accept each other's cookies.

### 2.4 Passwords: algorithm and parameters (src/lib/password.ts)

- **Stored format:** `scrypt$<N>$<r>$<p>$<salt b64url>$<key b64url>` (password.ts:8, 57-66).
  - New hashes use **N = 2^15, r = 8, p = 1**, a 16-byte salt and a 64-byte key (:30-33).
  - **maxmem = 2·128·N·r = 64 MiB.** This matters: Node's default ceiling is exactly 32 MiB, and scrypt at exactly
    32 MiB is refused (:18, 34-35). **Python's `hashlib.scrypt` defaults to the same 32 MiB OpenSSL ceiling. Pass
    `maxmem=2*128*N*r`** or every check fails.
- **Input:** `password.normalize('NFKC')` (:47-54) → `unicodedata.normalize('NFKC', pw)`, then utf-8.
- **verify:** parse with bounds (N ≤ 2^20 and a power of two, r ≤ 32, p ≤ 16, salt ≥ 16 bytes, key ≥ 32 bytes)
  (:80-91), recompute with the stored params, compare in constant time (`hmac.compare_digest`) (:94-104).
- **Dummy hash for unknown addresses** (equal-time refusal): one per process, the hash of 32 random bytes (:120-125).
- **Policy:**
  - Length 8–128 **code points after NFKC** (:173-181). Python `len()` counts code points, which matches here; zod's
    `.min/.max` in `register` counts UTF-16 units, which is the trap in §14.
  - `is-email` and a common-password list (:177-228).
- **needsRehash / temporary passwords** exist (:107-111, 240-260). `verifyPasswordSignIn`, named in the comments, does
  **not exist**. No route rehashes or issues temporary passwords today (`hashPassword` is called only from
  users.ts:52 and demo.ts:30). Port the helpers and keep the behaviour unwired.
- **Sign-in path** (src/server/password-signin.ts:13-27):
  - Email is trimmed, lowercased, sliced to 254 characters.
  - Rate limits come **before** scrypt: `signin:<ip>` 60 per 15 min, and `signin-fail:<email>` checked with
    `atLimit`, 10 per 15 min.
  - Exactly one scrypt runs, real or dummy. A failure counts a hit on the email; a success `forget`s it.
- **Registration** (src/app/api/v1/register/route.ts:7-37):
  - Rate `register:<ip>` 30 per hour, body cap 8 KiB.
  - zod `email().max(254)`, `password.min(8).max(128)`, names, role, `lang` in {en, uz, ru}.
  - `passwordProblem` → 400 `{error:'weak', reason, message}`. An existing account → 409 `{error:'exists'}`.
    Success → 201 `{id}`.
  - Creation runs in one transaction with `ON CONFLICT DO NOTHING` on `users.email`, plus `password`, `profile`, and
    for a parent `user_state('jg.parent.lang')` (src/server/users.ts:49-66).
  - The client then signs in with a second form post (public/runtime/auth.js `register`).
  - **zod's `.email()` regex is not pydantic's `EmailStr`.** EmailStr uses email-validator, with IDN and syntax
    differences. Port zod 3.25's email regex verbatim.

### 2.5 Telegram login (the whole security boundary)

- **Flow.** `/signin` builds `https://oauth.telegram.org/auth?bot_id=<token before ':'>&origin=<AUTH_URL origin>&request_access=write&return_to=<AUTH_URL origin>/signin/telegram?next=…`
  (src/lib/telegram-login.ts:85-104; route src/app/signin/route.ts:15). Telegram returns to `/signin/telegram#tgAuthResult=…`.
  The page decodes it and posts `payload` to `/api/auth/callback/telegram`. The bot is `@JamalsGlobalBot` with
  `/setdomain app.jamals.uz` (docs/ai/CURRENT_STATE.md:6826-6829).
- **Shape guard before the HMAC:** `telegramFields` (telegram-login.ts:124). It requires an object of at most 16
  fields, keys matching `[a-z_]{1,32}`, finite numbers, strings of at most 512 characters with no `\r`/`\n`, and `id`,
  `hash` and `auth_date` present.
- **HMAC** (src/lib/telegram.ts:69-123):
  - `data_check_string` = every field except `hash` whose value is not null/undefined, as `k=v` sorted by key and
    joined with `\n`. Values use JS `String(v)`: **a number must print as JS does** (`123`, not `123.0`).
  - `secret = SHA256(bot_token)` (raw digest). `expected = HMAC_SHA256(secret, dcs)` hex.
  - Constant-time compare; `hash` must match `^[0-9a-f]{64}$`i.
  - Freshness: `max_age` = **600 s** (`TELEGRAM_MAX_AGE_SECONDS`, telegram-login.ts:52), clock skew 60 s.
- **User:** `upsertTelegramUser` under `pg_advisory_xact_lock(hashtextextended('telegram:'||tgId, 0))`
  (src/server/users.ts:68-83). A new `user` row has `name` = "first last", or username, or `'Telegram user'`, and
  `image` = photo_url. The `account` row is `{type:'credentials', provider:'telegram', providerAccountId:tgId}`. The
  **name is not updated** on later sign-ins.
- **Port:** pure functions plus vectors. Use `hmac.new(hashlib.sha256(token.encode()).digest(), dcs.encode(), 'sha256').hexdigest()`.

### 2.6 Google OIDC (live: configured in production)

- **Provider:** `type: oidc`, issuer `https://accounts.google.com`, checks PKCE. Env: `AUTH_GOOGLE_ID` /
  `AUTH_GOOGLE_SECRET`, read by Auth.js implicitly.
- **Linking rules** (node_modules/@auth/core/lib/actions/callback/handle-login.js:126-175, OAuth branch):
  1. Account `(google, sub)` exists: sign in as its user. If a session for a *different* user is open, raise
     `OAuthAccountNotLinked`.
  2. No such account but a session is open: **link Google to the signed-in user** (linkAccount).
  3. No account, no session: if `getUserByEmail(profile.email)` exists, refuse with `OAuthAccountNotLinked`, because
     `allowDangerousEmailAccountLinking` is false. Otherwise `createUser({...profile, emailVerified: null})` and link.
- **Profile mapping:** `{id: sub, name, email, image: picture}`. **The email is not lowercased** (password users' emails
  are). Keep it that way.
- **Account row:** `{type:'oidc', provider:'google', providerAccountId:sub, access_token, expires_at, token_type, scope, id_token}`.
  No `refresh_token`, since there is no offline access. Nothing in the app reads these columns. Write them identically
  anyway.
- **After first sign-in** there is no profile yet, so `/` and `/app` redirect to `/welcome` (src/app/route.ts,
  src/app/app/route.ts:12).
- **Python:** use `authlib`'s `AsyncOAuth2Client` (httpx) with PKCE S256 and id_token validation against Google's
  JWKS. **Do not use authlib's Starlette `SessionMiddleware` integration.** It adds a site-wide `session` cookie. Keep
  state/PKCE/callback-url in Auth.js-named, encrypted, short-lived cookies instead.
- **Cutover effect:** a Google sign-in that is in flight at the switch fails once, and the user retries. Acceptable
  (seconds).

### 2.7 Identity checks the routes build on

- **`apiUser(req, role, {demo})`** (src/server/api.ts:15-24):
  - No session → 401 `{error:'unauthenticated'}`.
  - **`x-jg-uid` header ≠ session id → 409 `{error:'wrong account'}`.** The runtime then reloads as the signed-in
    account (P0 I2).
  - No profile → 401. Wrong role → 403 `` `${role}s only` ``. Demo account → 403 `{error:'demo'}` unless `opts.demo`.
- **SSE and EventSource** cannot set headers, so they pass `?uid=` instead (src/server/chat/stream.ts:26).
- **Staff:**
  - `STAFF_USER_IDS` is a comma list of user ids (src/server/phase-x/staff.ts:16). With PHASE_X off, everything staff
    is a 404.
  - With MODERATION on, `staff_member` rows add roles (src/server/moderation/staff.ts:20-41).
  - Staff writes also require `x-jg-uid` (phase-x/staff.ts:23-31).
- **Responses:** `json()` adds `cache-control: no-store` (api.ts:7-8).
- **Other cookies the server reads:**
  - `jg_lang` = uz|ru|en (pages.ts:93): the sign-in page's language, adopted once.
  - `jg_view` = mobile|desktop (pages.ts:83).
  - `jg_child` = a child id (parent/m1-boot.ts:13).
  - The staff pages read `jg_lang` by regex.

### 2.8 Auth port plan and cutover risks

1. **First: Python decodes only.** FastAPI reads the existing cookie (§2.3) and Next/Node remains the issuer. No user
   is logged out, and every Python route can go live behind Caddy one group at a time.
2. **Then: Python issues** (`/api/auth/*`) with byte-compatible JWE. Node can still decode, so rolling back the
   issuer is a Caddy flip.
3. **Never rotate `AUTH_SECRET` during the migration.** It keys four more things besides sessions:
   - media URLs (src/server/media/sign.ts:16)
   - video URLs (src/server/video/sign.ts:19)
   - the **lesson piece HMAC stream** (src/server/lessons/piece.ts:28-34): the questions and option order a student
     sees
   - gift codes (src/server/pay/gifts.ts:18-23) and the sandbox keys (src/server/pay/rails.ts:18)

   Rotating it changes every student's served questions mid-lesson and voids issued gift codes.
4. **Risks:**
   - **Wrong salt.** Using `__Secure-` vs plain names as the HKDF salt silently logs everyone out. Test with a real
     production-shaped cookie produced by Node.
   - **Wrong cookie name in a dev/https mismatch.** The name must come from `AUTH_URL`'s scheme, not from the request
     hitting uvicorn over plain http behind Caddy.
   - **CSRF cookie `__Host-` prefix.** It requires `Path=/`, `Secure` and no `Domain`.
   - **Credentials error redirect.** It must be absolute (`AUTH_URL` origin), because the page parses the `error` and
     `code` params.
   - **Rate limits and the `CLIENT_IP_HEADER` path** (§4). If `/api/auth` is proxied *through* the Next frontend
     instead of routed by Caddy, the last `x-forwarded-for` entry becomes the frontend container. That turns
     per-IP sign-in limits into one global bucket: a self-inflicted outage.

---

## 3. Request plumbing that every route inherits

- **Body caps** (src/server/limits.ts:21-46):
  - `readText`/`readBytes`/`readJson` refuse a declared `content-length > max` before reading and cut off a streamed
    body past `max`. They answer 413 `{error:'too large'}`.
  - `readJson` returns `null` for non-JSON, and the zod parse then gives 400 `{error:'invalid'}` (api.ts:26-31).
  - Starlette has no body limit. Implement `read_capped(request, max)` over `request.stream()`. Caddy's 12 MB
    `request_body` is a ceiling only (deploy/servercore/caddy-block.txt).
- **Security headers on every route** (next.config.ts:17-24):
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy: frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`
  - `poweredByHeader: false`. Uvicorn needs `--no-server-header`.

  Keep them as one middleware.
- **Rewrite:** `/media/listening/:file` → `/api/v1/listening/:file` (next.config.ts:10). This becomes a Caddy rule or a
  FastAPI alias.
- **Redirects** are *relative* `Location` with status 302 by default (src/server/redirect.ts:14-16). The comment
  explains why absolute was wrong under `next start`. Keep them relative.
- **Static auth pages** (`web/auth/*.html`) are filled by `{{NAME}}` replacement, HTML-escaped, single pass,
  `no-store` (src/server/static-page.ts:18-26). This is the frontend lane's job if those pages move to Next. Otherwise
  port it as is.
- **Health:** `GET /api/health` does `select 1` → `{ok:true}` or 503 `{ok:false}` (src/app/api/health/route.ts). The
  container healthcheck polls it every 30 s (deploy/servercore/docker-compose.yml).
- **Framework defaults that differ:**
  - **Errors:** Next answers 405/404 as HTML, FastAPI as JSON `{"detail":…}`.
  - **HEAD:** Starlette auto-adds HEAD to GET.
  - **Trailing slash:** Next sends 308; Starlette's `redirect_slashes` sends 307.

  The smoke gates check `/preview/student-mobile` → 404 and `/app` → 302 (deploy/servercore/DEPLOY.md:23-24). Add
  explicit handlers where the status code is asserted.

---

## 4. Rate limits (in memory, per process)

- **Mechanism** (src/server/limits.ts):
  - A fixed-window counter in a `Map<bucket, {count, resetAt}>`, capped at 100,000 keys. On a flood it sweeps expired
    keys, then clears everything (:100-114).
  - `hit()` counts and returns `count <= limit` (:117-121). `atLimit()` peeks (:124-127). `forget()` deletes (:129).
- **Answer:** 429 `{error:'too many'}` with `retry-after: 600` (:149).
- **Limits are read from env at call time** (:54-98):
  - register 30/h per IP
  - sign-in 60 per 15 min per IP; fails 10 per 15 min per email
  - join 20/h per account and 60/h per IP
  - engine commit 120/h, checks 400/h, engine write 600/h, engine read 600/h
  - game credit 60/h, family check 20/h
  - AI prepare 1 per 2 min, AI react 40/h
  - photo write 30/h, photo read 1,200/h
  - voice 20/h, listen 1,200/h
  - proof upload 20/h; proof store 30 files / 64 MB per student
  - outcome write 60/h
  - chat (src/server/chat/http.ts:16-24): send 30/min, create 20/h, react 120/min, search 30/min, jamol 10/h,
    read 600/min, stream 30/min
  - community `RATE_COMMUNITY_*`, video 3,000/h, reports/safety/staff-write `RATE_*`
- **Client IP** (limits.ts:141-146):
  - If `CLIENT_IP_HEADER` names a header, its first entry is used.
  - Otherwise the **last** `x-forwarded-for` entry is used.
  - Outside production a loopback address returns null, which means "not limited". **Python's equivalent is
    `ENV != production`.**
- **Port:** identical semantics in a module-level dict, with **one uvicorn worker**.
  - With N workers, every limit becomes N times looser, exactly as the comment says about replicas (:8-10). If more
    workers are needed later, move the counters to an `UNLOGGED` Postgres table or Redis. Redis is not on the box
    today.
  - Counters reset on every deploy, as they do now.
- **Behind Caddy:**
  - The `X-Real-IP {remote_host}` header is set (caddy-block.txt).
  - Caddy (v2.5+) ignores client-sent `X-Forwarded-For` unless `trusted_proxies` is configured. Verify with
    `caddy version` on the box.
  - **Route `/api/*` at Caddy directly to FastAPI. Do not proxy it through the Next frontend**, or set
    `CLIENT_IP_HEADER=x-real-ip` explicitly.

---

## 5. Feature switches (read at call time from env; "off" means a 404/503 before anything is read)

| Switch | Reader | Production 20 Oct |
|---|---|---|
| ENGINE_LIVE | src/server/engine/live.ts | on |
| PHASE_D (+ dev-only PHASE_D_DRAFTS, PHASE_D_CAT_STUB) | src/server/phase-d/switch.ts | on |
| PHASE_X | src/server/strategy/switch.ts | on |
| AI_LAYER (deploy master; layer also needs ENGINE_LIVE + key + `ai_settings.layer_on` + `notice_version`) | src/server/ailayer/settings.ts:71-80 | on (plan step only) |
| LESSONS (needs PHASE_X), JIA_CARD, LESSONS_PARENT, WRITING, SPEAKING, LISTENING, VIDEO_LESSONS, AP_PHYSICS, SPEAKING_VOICE (needs SPEAKING + AI_LAYER) | src/server/lessons/switch.ts | LESSONS, WRITING, SPEAKING, LESSONS_PARENT on; the rest off |
| SAT_FULL | src/server/lessons/sat-switch.ts | off |
| MESSENGER | src/server/chat/switch.ts | not deployed |
| COMMUNITY | src/server/community/switch.ts | not deployed |
| PAYMENTS, PAYMENTS_SANDBOX (also needs a DB name containing dev/test/sandbox: pay/switch.ts:25-27), PLAN_LIMITS | src/server/pay/switch.ts | not deployed |
| GAMES_SERVER | src/server/games/switch.ts | not deployed |
| LEAGUE | src/server/league/switch.ts | not deployed |
| MODERATION | src/server/moderation/switch.ts | not deployed |
| CORE_M1 | src/server/core/switch.ts | not deployed |
| PARENT_M1 | src/server/parent/m1-switch.ts | not deployed |
| AI_LOCK (**default ON**; off only for `0/false/off/no`), AI_CONSENT, LEGAL_PAGES | src/server/jamol/switch.ts:19-24 | not deployed |
| Fakes: AI_FAKE, WHISPER_FAKE (refused when NODE_ENV=production) | ailayer/client.ts:30-31, speech/transcribe.ts:58 | off |
| **Runtime switch in the DB:** `ai_settings` row id 1 (`layer_on`, `steps`, `notice_version`, `allowances`, `daily_usd`, …), cached 10 s per process | ailayer/settings.ts:26-48 | plan step on; **`notice_version = NULL` is the master AI off** (deploy/servercore/ai-master-off.sql) |

**Port:**
- One `switches.py` with one function per row, reading `os.environ` at call time, never cached.
- Test overrides must be impossible outside tests, as the TS `setX()` functions throw unless NODE_ENV=test.
- Keep the **exact env names and the exact "=== '1'" test**. `PAYMENTS_SANDBOX=1` here differs from
  `paymentsSandbox()`'s `'on'` in config.ts:69-78, which is a dead helper.

---

## 6. Clocks and time

- **One service clock:** `now()` (src/server/engine/clock.ts:3), overridable only when NODE_ENV=test. Port it as
  `clock.now()` returning an aware UTC datetime, with the same test-only override.
- **The container runs in UTC on purpose** (deploy/servercore/docker-compose.yml comment). Keep `TZ=UTC` for Python.
- **Which "day" each rule uses:**
  - **UTC day:** the Ask Jamol / AI quota day (`now().toISOString().slice(0,10)`, ai.ts:27; jamol/quota.ts:34) and
    the AI layer budget day (ailayer/budget.ts:43-45).
  - **Tashkent day:** order pricing (`orderOpenOn`, pay/store.ts:45-47), the league week (Monday 00:00
    `Asia/Tashkent`), lead timestamps (leads/jia.ts:32), and the staff pages.
  - **The student's own IANA zone:** the engine's day and week (`profile.timezone`, default `Asia/Tashkent`;
    engine/context.ts:56-59, `localDateOf` = `Intl.DateTimeFormat('en-CA', {timeZone})`, src/engine/dates.ts:13).
- **Python:** `zoneinfo` + the `tzdata` package. Debian slim images do not ship /usr/share/zoneinfo reliably.
  Tashkent is fixed UTC+5 with no DST since 1992, but student zones can be anything.
- **Millisecond truncation is load-bearing.** JS `Date` has millisecond precision, so every timestamp the app wrote is
  ms-truncated, and code compares them as integers:
  - `r.createdAt.getTime() === r.updatedAt.getTime()` and the review id `` `${r.id}@${r.updatedAt.getTime()}` ``
    (community/posts.ts:531)
  - ai_job `not_before`, `lease_until`, claims
  - `toISOString()` in 83 places, stored in jsonb and returned in JSON

  **Python must truncate every `now()` to milliseconds and format ISO as `YYYY-MM-DDTHH:MM:SS.mmmZ`.** Otherwise
  equality checks and string keys change.

---

## 7. The AI layer

### 7.1 Map

| Piece | Files | Lines |
|---|---|---|
| Ask Jamol / @Jamol / essay seeds / lesson questions / hints (streamed text) | src/server/ai.ts, jamol/{sample,requests,quota,consent,privacy,switch}.ts, lessons/{jamol,hint}.ts, app/api/v1/ai/sample/route.ts, lessons/hint route | about 1,100 |
| Structured layer (8 kinds: interpret, result, change, tasks, react, plan, writing, speaking) | src/server/ailayer/* (36 files) | **3,786** |
| Notice | src/server/ai-notice.ts | 26 |
| Moderation precheck (one short call) | src/server/moderation/precheck.ts | 58 |
| Writing / speaking feedback (synchronous in-request calls) | lessons/writing.ts:121-141, lessons/speaking-voice.ts | 412 |
| Speech to text (own Whisper over HTTP) | src/server/speech/transcribe.ts | 73 |

### 7.2 Client and calls

- **Clients.** One SDK client per process, constructed lazily from `ANTHROPIC_API_KEY` (ailayer/client.ts:20-36;
  ai.ts:9-10).
  - No key: no client, and the layer is off.
  - `AI_FAKE=1` returns the echo writer, refused in production (client.ts:30-34).
  - Python needs the same fake for smoke runs (ailayer/fake.ts, 157 lines).
- **Structured call** (`callStructured`, ailayer/call.ts:22-31, 46-69):

  ```
  beta.messages.create({ model: AI_MODEL_LAYER || modelFor(), max_tokens: STEPS[kind].maxTokens,
    system: [{type:'text', text: PROMPTS[kind].system, cache_control:{type:'ephemeral'}}],
    messages: [{role:'user', content: JSON.stringify(input)}],
    output_config: { effort: STEPS[kind].effort, format: betaZodOutputFormat(schema) },
    betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }, { timeout: timeoutMs(kind), maxRetries: 0 })
  ```

  - `stop_reason` and usage are read first, then the JSON.
  - `refusal`, `max_tokens` and an empty answer each map to their own status.
  - **Only the text after the last `fallback` block** is parsed (call.ts:57-60).
  - `fallback` = `usage.iterations` contains `fallback_message`.
  - Errors map most-specific first (call.ts:34-44): timeout, aborted, auth, rate, bad_request(200 chars), server,
    api.
- **Python mapping.** `client.beta.messages.create(model=…, max_tokens=…, system=[…], messages=[…], output_config={…}, betas=["server-side-fallback-2026-07-01"], fallbacks="default", timeout=…, max_retries=0)`.
  The Python SDK documents `betas=`, `fallbacks=`, `output_config=`, `stop_details` and `usage.iterations` (claude-api
  skill, python README "Refusal Fallbacks"). Pin an SDK version that types them, or pass the unknown ones via
  `extra_body`.
  - Error classes: `anthropic.APITimeoutError`, `AuthenticationError`, `RateLimitError`, `BadRequestError`,
    `InternalServerError`, `APIStatusError`, `APIConnectionError`.
  - "Aborted" is `asyncio.CancelledError`.
  - **Units:** Python timeouts are in seconds, TS in milliseconds.
- **THE SCHEMA TRAP.** `betaZodOutputFormat` (TS SDK 0.128) *transforms* the zod JSON schema before sending. Enums go
  into field descriptions and are not sent as constraints (comment at ailayer/schemas.ts:44-49), and the local parse
  then enforces them.
  - The plan step was measured and tuned on exactly that wire schema: stage A first-pass 98.6 %
    (docs/ai/SESSION_HANDOFF.md:1).
  - Python's `messages.parse(output_format=PydanticModel)` would send a *different* schema.
  - **Do not regenerate.** Export each kind's exact `output_config.format` object from TS once (record the params with
    a fake `AiClient`, which tests already inject via `setAiClient`) into `jgapi/ai/schemas/<kind>.json` and send it
    verbatim.
  - Then validate locally with ported rules equal to zod's parse: enums enforced, `.strict()` objects (PlanOut
    tradeoffs, schemas.ts:51), `int().min(1).max(5)`, array `.max()`.
  - The plan's `unparsable` path keeps the raw JSON for the repair call (call.ts:61-66).
- **Prompts.** These are frozen strings built from shared blocks (ailayer/prompts/common.ts:1-23 and 8 per-kind files).
  - They must be **byte-identical**: the cache prefix, `PROMPT_VERSION` per kind (prompts/index.ts), the hash pins in
    `prompts.test.ts`, and the measured quality all depend on it.
  - Export them to text files from TS and assert sha256 equality in pytest. Do not retype the Uzbek ʻ/ʼ (U+02BB/U+02BC)
    by hand.
- **Models / effort / timeouts.**
  - Default model `claude-opus-5-5`. Tiers come from `AI_MODEL_QUICK` / `AI_MODEL_DEFAULT` / `AI_MODEL_LAYER`
    (ai.ts:13-16; steps.ts:18).
  - `STEPS` effort and max_tokens per kind (steps.ts:5-12). `MAX_CALLS.plan = 3` (:14).
  - `timeoutMs` = react 6 s, else `15 s + ceil(maxTokens / AI_MIN_OUTPUT_TPS(50))` s (:16).

### 7.3 Runtime switch and notice

- **`ai_settings` row id 1**, 10 s per-process cache with single-flight (settings.ts:26-48).
  - Inside a transaction it is read **through the tx connection** and not cached (pool-deadlock rule, settings.ts:34-38).
  - `layerOn` = `AI_LAYER=1` ∧ `ENGINE_LIVE=1` ∧ a client ∧ `layer_on` ∧ `notice_version` (:71-80). `stepOn` also
    needs `steps` to include the kind.
- **Notice.**
  - `aiNoticeLive()` = key set ∧ `ai_settings.notice_version` (ai-notice.ts:23-26).
  - `shippedNoticeVersion()` regex-reads `version: 'YYYY-MM-DD'` out of `public/runtime/jg-ai-notice.js` (:16-21), a
    **frontend file**. When the frontend moves, give the backend a stable path to this file, or a constant generated
    at build time.
  - The script URL is `AI_NOTICE_SCRIPT = '/runtime/jg-ai-notice.js?v=4'` (:12).

### 7.4 Budgets, quotas and the meter

- **Layer budget** `takeBudget` (ailayer/budget.ts:68-95):
  - Runs under `pg_advisory_xact_lock(hashtextextended('ai-layer:'||utc_day, 0))`.
  - Refusal order: per-student allowance per kind per UTC day; the global dollars against `daily_usd × SHED[kind]`
    (budget.ts:39), counting **ai_run cost + ai_usage.cost_usd**; the new-account pool (accounts under 24 h against
    `new_account_daily_usd`).
  - It inserts a `pending` ai_run reserving `reservationFor(kind)` = `costOf(INPUT_ESTIMATE[kind] in, maxTokens out)`
    (:36-37).
  - A `23505` on `ai_run_pending` (the same input in flight) means `pending` (:91-93; partial unique index
    src/db/schema.ts:321).
  - **Prices** are $ per MTok (budget.ts:16-18): opus-5-5 4/20/0.2, sonnet-5-5 2/10/0.2, fable-5-1 10/50/0.25. An
    unknown model is priced as fable. Cache writes cost 1.25× input.
- **Ask Jamol quota** (pre-M1, live): `takeQuota` (ai.ts:26-40) under `hashtextextended('ai-usage:'||day, 0)`.
  - Per-user `AI_DAILY_LIMIT` (200), or the tier limit with PLAN_LIMITS.
  - `AI_GLOBAL_DAILY_LIMIT` (1000). The lesson cap counts in `lesson`.
  - A refused call counts in neither.
- **M1 meter** (AI_LOCK, dark): `takeJamol` and `settle` (jamol/quota.ts:54-89).
  - Two pools: chat (30 / 600, shed 0.5) and lesson (10 / 3,000, shed 0.9).
  - Reserve the worst-case dollars, then settle to usage. A failure before billing gives the reservation back; a call
    the user cut off keeps it.

**Port:** these three are pure SQL plus arithmetic. Keep the **lock key strings and the hash function exactly**
(§15.2). Node and Python then serialize against each other while both are live.

### 7.5 Durable jobs and the worker

- **Enqueue** (ailayer/queue.ts:19-27) is a raw-SQL upsert on `ai_job` `ON CONFLICT (student_id, kind, ref) WHERE status in ('queued','running')`.
  - It sets `rerun` / payload / `greatest(not_before)`.
  - It runs **inside the committing transaction, in a savepoint whose errors are logged and swallowed** (`aiStep`,
    :30-32). A failing AI step never fails a commit.
  - Priorities (:10): draft 0, result 1, interpret 2, change 3, plan 3, tasks 4, react/writing/speaking 5,
    backfill 9.
- **Claim** (jobs.ts:45-56): `select … where (queued and not_before <= now) or (running and lease_until < now) order by priority, not_before limit 1 for update skip locked`,
  then `status='running', claim=claim+1, lease_until = now + leaseMs(kind)`. `leaseMs` = timeout × MAX_CALLS + 60 s
  (:42).
- **Fence** `stillMine` (jobs.ts:60-63): the claim is unchanged and the step is still on, read through the tx.
- **step()** (jobs.ts:86-130):
  1. Reuse a finished run with the same input hash and prompt version, re-guarded.
  2. Adopt a pending run, or close it as `timeout` if it is older than the lease.
  3. Take the budget, call, guard, record, write.
  4. Retries: rate/server/api while attempts < 2, timeout while attempts < 1. Delays `RETRY_MS = [30 s, 300 s]` (:77).
  5. `settle()` drops the payload, except for loop kinds when a rerun is pending, and re-queues on `rerun` (:64-73).
- **Plan loop** (ailayer/plan.ts:302-345): up to 3 calls (call → `judgePlan` V1–V15 → repair input). It falls back to
  code's strategy with a `reason`, and every write is fenced on the roadmap version.
- **Worker** (ailayer/worker.ts):
  - Started once per process, only with AI_LAYER=1 (src/instrumentation.ts:14-16).
  - Concurrency `AI_WORKER_CONCURRENCY` (4) (:24). It polls every 2 s and is woken by `wakeWorker()` via Next's
    `after()` (:23).
  - **Retention:** `ai_run.input/output` are nulled after 180 days, at start and then every 24 h (:36-38, :49-51).
  - **SIGTERM:** claimed jobs go back to `queued` (:52-55).
- **Python:**
  - An asyncio task started in the FastAPI `lifespan`, with a semaphore for concurrency and an `asyncio.Event` for
    wake.
  - Use `BackgroundTasks` where TS used `after()`.
  - On shutdown, re-queue the jobs this process claimed (`mine`).
  - Raw SQL is copied verbatim.
- **Coexistence rule.** **Only ONE runtime may run the worker at a time.** Set `AI_LAYER` worker-off in Node (or stop
  Node) before the Python worker starts. Claim, fence and skip-locked make two workers *safe*, but they would be two
  different implementations producing different outputs for the same jobs. Enqueueing from either runtime is fine.

### 7.6 The draft wait

`waitForDraft` (ailayer/draft.ts:57-70) polls `ai_run.status` every 200 ms up to `AI_RESULT_WAIT_MS` (2 s), then
races the adoption against the deadline. In Python this is an `asyncio.sleep` loop plus `asyncio.wait_for`, and
cancellation must not leak the transaction.

### 7.7 The guard, a regex-heavy port hazard

- **Size:** guard.ts 246 lines, guard-lang.ts 129, lexicons.ts 108, lexicons-uzru.ts 277, tokens.ts 100, inputs.ts 299,
  plan-eval.ts 331, plan-judge.ts 41. `GUARD_VERSION = 1` (guard.ts:14).
- **Hazards:**
  - JS `\p{L}` / `\p{N}` with the `u` flag (`hasWord`, guard.ts:33) need the **`regex` module**; stdlib `re` has no
    `\p{…}`.
  - **JS regexes without `u` use ASCII `\b`/`\w`/`\d`, while Python 3 `re` defaults to Unicode.** Example:
    `CEFR_G = /\b[ABC][012]\b/g` (guard.ts:51). In Uzbek text, `ʻ` (U+02BB) is category Lm, so it is a word character
    in Python but not in JS: `\b` before "B1" in "ʻB1" matches in JS and does **not** in Python.
  - **Rule:** compile every pattern that lacks `u` in TS with `re.ASCII`, or with `regex` and `ASCII`. Port
    flag-for-flag.
- **Lengths:** caps are in characters as JS counts them, in UTF-16 units (`CAPS`, `CAPS_BY_LANG`,
  ailayer/types.ts:44-76; guard `.length`). Use `js_len()` (§14).
- **Parity:** run `guardAll` over a corpus (the 500 seeded maps that caps.test.ts uses, the eval samples, the
  fake-uzru fixtures) in TS. Store the verdicts and the accepted text. Assert Python is identical.

### 7.8 The streaming Ask Jamol route

- **Route** (src/app/api/v1/ai/sample/route.ts):
  - Session required → 401.
  - Body cap 64 KiB; at most 16 messages of at most 8,000 characters each and 16,000 in total. **These are UTF-16
    counts.**
  - AI_LOCK → `lockedSample` (dark M1).
  - Lesson questions only with LESSONS on.
  - No notice → **503**. Over quota → **429**.
- **Response:** `text/plain; charset=utf-8`, `no-store`, `x-accel-buffering: no`, built from raw text deltas
  (ai.ts:54-77, `stream.on('text')`).
  - **Mid-stream fallback:** the stream keeps the declined hop's partial text and continues (skill:
    model-migration.md "Streaming").
  - The TS `on('text')` emits every delta. Python's `async for text in stream.text_stream` must do the same, and
    `get_final_message()` then gives the usage for the meter.
  - The SDK's own retries (default 2) apply here, unlike the structured layer's `maxRetries: 0`.
- **Python:** a `StreamingResponse` over an async generator.
  - On client disconnect, cancel the SDK stream. The meter's `billed` = aborted, or an error without a status
    (ai.ts:72).
  - Writing feedback (lessons/writing.ts:121-141) and speaking feedback call `callStructured` **inside the request**.
    Keep that synchronous shape.

### 7.9 Speech (Whisper)

- **Request:** `POST WHISPER_URL/transcribe` with the raw audio body and an optional bearer token. Timeout
  `WHISPER_TIMEOUT_MS` (120 s) (speech/transcribe.ts:27-48).
- **Status mapping:** 503 busy, 413 too_long, 400/415 bad_audio.
- **Concurrency:** a per-process cap `WHISPER_CONCURRENCY` (2) refuses with `busy` immediately.
- **Audio is zeroed in `finally`** (:63-73). In Python use a `bytearray` and zero it.
- **Do not keep the bytes in a `bytes` object.** Bytes are immutable copies and cannot be wiped.

### 7.10 Hashing inputs for reuse

- `inputHash = sha256(canon(input))`. `canon` = JSON with sorted keys, undefined dropped, `JSON.stringify` for
  scalars (ailayer/canon.ts:4-10).
- **Python `canon()` must reproduce JS output exactly:**
  - `json.dumps(s, ensure_ascii=False)` for strings. JSON.stringify escapes lone surrogates as `\udxxx`; Python
    behaves the same.
  - Numbers: JS shortest round-trip, **`1` not `1.0`**, `1e+21`, `1e-7`.
  - Key sort by **UTF-16 code units** (JS `.sort()`); Python sorts by code points. These differ only above U+FFFF.
- **Two more hashes use plain `JSON.stringify(input)`** (insertion order, not canonical): writing
  (lessons/writing.ts:125) and speaking (speaking-voice.ts:178). Python dicts must be built in the same key order.
- **A mismatch causes no wrong answer.** It costs a re-call (dollars) and changes reused feedback.
- `fnv1a(JSON.stringify(...))` → `constraints_hash` in the engine (src/engine/tasks.ts:189, schedule/compose.ts:148)
  belongs to the engine lane, but it has the same JSON parity requirement.

---

## 8. Payments (dark: PAYMENTS off, not deployed)

### 8.1 Payme Merchant API

- **Protocol:** JSON-RPC 2.0, always HTTP 200 (src/server/pay/payme.ts, 387 lines; route
  src/app/api/v1/pay/payme/route.ts).
- **Auth:** `Authorization: Basic base64(login:key)`, login default `Paycom`. Constant-time compare of the decoded bytes
  (:146-153). Auth is checked **before** shape (:361-387).
- **Check order:** parse -32700 → auth -32504 → shape -32600 → method -32601.
- **Error codes:**
  - Merchant range -31050..-31053.
  - -31001 amount, -31003 not found, -31007 cannot cancel, -31008 cannot perform, -32400 system.
  - Error messages are localized `{ru, uz, en}` (:78-105).
- **State** is derived from timestamps (`paymeState`, store.ts:145-148): 1, 2, -1, -2.
- **Rules:**
  - 12 h timeout `PAYME_TIMEOUT_MS = 43,200,000` (:51). An expired transaction is cancelled with reason 4 when next
    touched.
  - Only reason 5 refunds a performed transaction (:300-313).
  - Idempotent by Payme `id` through a unique index `pay_txn_provider_ref` (schema-pay.ts:73).
  - At most one paid transaction per order through partial unique index `pay_txn_order_paid` (:74). A `23505` on it
    means `order-paid`, detected by `constraint_name` (db-store.ts:19-27).
- **Parity traps:**
  - `isInt` = `Number.isSafeInteger`. **`5.0` in JSON is an integer in JS.** Python's `json.loads` gives a float, and
    `True` is an `int` subclass. Accept `float` with an integral value and |x| ≤ 2^53−1; reject `bool`.
  - `account.order_id` is a string or a number matching `^[1-9][0-9]{0,15}$` (:184-191). `String(number)` must print
    as JS does.
  - Body over 16 KiB → the `paymeNotPost()` body (route.ts:11). `GET` → `paymeNotPost` with 200 (route.ts:14-17).
  - With no rail → 503 before the body is read (`railOff`).
- **Perform** marks paid **and** activates in one transaction (`perform`, db-store.ts:92-117). An activation refusal
  throws, which rolls back the paid mark, and answers -31008.

### 8.2 Click SHOP API

- **Input:** `application/x-www-form-urlencoded` parsed with `URLSearchParams`, first value per key
  (click/prepare/route.ts:9).
- **Signature:** `md5(click_trans_id + service_id + SECRET + merchant_trans_id + [merchant_prepare_id] + amount + action + sign_time)`
  over the **raw received strings** (click.ts:117-123).
  - Constant-time compare against `sign_string.trim().toLowerCase()`.
  - Amount `^[0-9]{1,15}(\.[0-9]{1,2})?$` → tiyin (:133-137).
- **Errors:** 0 to -9. A negative `error` on Complete cancels only an *unpaid* transaction, because `error` is not
  covered by the signature (header comment :23-31).
- **Python parsing:** `urllib.parse.parse_qs(text, keep_blank_values=True)` with `[0]` per key, which matches
  URLSearchParams for `+` and percent handling. Check the length on the decoded text (`text.length > 8192` counts
  UTF-16 units).

### 8.3 The rest of pay

- **Files:** orders, checkout, activate, subscriptions, entitlement, gifts, coupons, limits, recordings, sandbox, staff
  page, plans (2,152 lines in total).
- **Locks:** `hashtext('jg-order:'…)`, `hashtext('jg-sub:'…)`, `hashtext('jg-games:'…)` (orders.ts:41,
  subscriptions.ts:43, limits.ts:41).
- **Gift code:** `JG-XXXX-XXXX` from `HMAC(AUTH_SECRET, 'jg-gift:'+orderId)[0:8] % 31` over the alphabet. Only the
  sha256 of the code is stored (gifts.ts:17-28).
- **Sandbox keys:** `HMAC(AUTH_SECRET ?? 'jg', 'jg-pay-sandbox:'+what).hex[0:32]` (rails.ts:18).
- **Logging:** `logSystemError` logs only the rail, the method, the error class and the SQLSTATE, never the message
  (rails.ts:30-38).
- **Provider cabinets hold our callback URLs.** Keep `/api/v1/pay/payme`, `/api/v1/pay/click/prepare` and
  `/api/v1/pay/click/complete` byte-identical.
- **Parity harness:** the memory store (pay/memory-store.ts) plus the providers' documented example payloads, already
  used by the TS tests. Export request/response transcripts from TS and replay them in pytest against a Python memory
  store.

---

## 9. Chat: the SSE hub on LISTEN/NOTIFY (dark: MESSENGER off)

- **Hub** (src/server/chat/hub.ts):
  - One per process. `LISTEN jg_chat` on a dedicated connection (postgres.js `sql.listen`, :45-52).
  - Every write calls `select pg_notify('jg_chat', payload)` (:55-64). Payloads over 7,000 bytes go as a `ref` (a
    message or edit id) and are loaded by the receiver (:14, 58-61).
  - Delivery runs on a **serialized promise chain** (`this.chain`, :47), so events stay in NOTIFY order.
  - The member resolver and message loader come from chat/store.ts.
- **Event ids** are `<boot hex8>.<seq>`, with a ring of the last 2,000 events (:13, 77-84).
  - **Replay on `Last-Event-ID`** (or `?lastEventId=`): a different boot, an id older than the ring, or an id ahead of
    the sequence sends `{type:'resync'}` (:106-114).
  - At most 5 streams per user; the oldest is closed (:90-104).
  - A `hello` event is sent on subscribe with `online` and `boot`.
- **Presence** is the number of students with at least one stream **in this process**. It is broadcast at most every
  5 s when it changes (:116-139).
- **Hidden senders** (blocks): messages and typing from them are not sent. The block list is refreshed every 6
  heartbeats (2 min) (stream.ts:51-54).
- **Stream route** (chat/stream.ts:21-72):
  - Checks in order: switch, session, `?uid=` / `x-jg-uid`, a student who is not a demo, rate 30/min, and
    `CHAT_STREAMS_MAX` (3,000) → 503 `busy`.
  - **Exact bytes:** first `retry: 3000\n: ` + 2,048 spaces + `\n\n`. Each event is
    `id: <id>\nevent: chat\ndata: <json>\n\n`. A heartbeat `: hb <ms>\n\n` goes out every 20 s.
  - Headers: `text/event-stream; charset=utf-8`, `cache-control: no-cache, no-transform`,
    `connection: keep-alive`, `x-accel-buffering: no`.
  - **Caddy `encode zstd gzip`** must not buffer it; `no-transform` covers that today. Re-verify with the Python
    response.
- **Python:**
  - `asyncpg.connect()` dedicated to `add_listener('jg_chat', cb)`. The callback pushes to an `asyncio.Queue`
    consumed by one task, which preserves order. Reconnect on connection loss.
  - Each stream is an async generator yielding the exact strings above, ending on `await request.is_disconnected()`.
  - Use a raw `StreamingResponse`. **sse-starlette adds its own ping frames and header changes.** If it is used, set
    `ping` to 20 s with a custom comment and verify the bytes.
  - Chat ids use `nanoid(12|10|8)` (chat/store.ts:516, 541, 723, 769). Use the `nanoid` Python port with the default
    alphabet `A-Za-z0-9_-`.
- **Coexistence:**
  - NOTIFY reaches every process, so a Node write reaches Python streams and vice versa, **as long as the wire JSON is
    identical**.
  - **Presence is per process.** Move the stream route and every chat route **as one group**, and run **one uvicorn
    worker**.
  - Across a deploy, clients get `resync` because the boot id changes. That is the designed behaviour.

---

## 10. Media and video

### 10.1 Signed URLs

- **Media:** `/api/v1/community/media/<id>/<file>?e=<exp>&s=<sig>` (media/sign.ts:10-31).
  - `key = HMAC_SHA256(AUTH_SECRET, 'jg-community-media-v1')`; `sig = b64url(HMAC_SHA256(key, "id|file|uid|exp")[0:18])`.
  - TTL 2 h, `exp` rounded **up** to 600 s.
  - Results: `bad` / `expired` / `ok`.
- **Video:** `/api/v1/video/<clip>/<file>`, the same construction with `'jg-video-url-v1'` and **no rounding**
  (video/sign.ts:13-34).
- **No `AUTH_SECRET` means a random per-process fallback key.** URLs then break across processes and runtimes.
  Production has the secret set (CURRENT_STATE.md:6808), but the Python port should **refuse to start without
  `AUTH_SECRET` in production** rather than fall back.

### 10.2 Range serving

- **`parseRange`** (video/range.ts:6-18): one range, suffix ranges allowed. 416 with `content-range: bytes */size`.
- **Video file route** (src/app/api/v1/video/[clip]/[file]/route.ts):
  - Every refusal except an expired signature is a 404; expired is 403.
  - Rate 3,000/h.
  - Headers: `cache-control: private, no-transform, max-age=min(3600, ttl)`, `x-robots-tag`, `referrer-policy: no-referrer`, nosniff.
  - HEAD is supported.
  - The **first GET of `v.mp4` starts the watch clock** (`servedClip`). HEAD, the poster and captions do not.
- Listening clips are the same pattern behind LISTENING. Profile photos are served from the DB (`profile_photo.bytes`,
  ≤ 100 KiB, src/server/photo.ts:16).
- **Python:** write range handling by hand (`aiofiles` / `anyio` file reads in chunks); do not rely on Starlette
  `FileResponse` range semantics. Send `content-length` explicitly.

### 10.3 Stores and encoding

- **Store:** `MEDIA_DIR` folders `up/ img/ vid/ poster/` with key validation (media/store.ts:53-59).
  - Writes go to `*.part` and are then renamed.
  - `minFreeBytes` defaults to 5 GB (`MEDIA_MIN_FREE_BYTES`, :80). **The box has 5.7 GB free today.**
  - `MEDIA_STORE=r2` uses R2 over a hand-rolled SigV4 (media/r2.ts:23-41), with MEDIA_DIR as scratch. Python: port
    the SigV4 function verbatim, or use `aiobotocore`. The verbatim port is smaller and keeps the vectors.
- **ffmpeg** (video/ffmpeg.ts):
  - `FFMPEG_PATH` / `FFPROBE_PATH`. Clip recipe :29-34 (480p, crf 30, maxrate 160k, AAC mono 48k, faststart). Poster
    :36-37.
  - `runFfmpeg` keeps the last 2,000 characters of stderr and has a SIGKILL timeout (:40-50).
  - `probe` via `ffprobe -of json` with a 60 s timeout (:52-63).
  - Reels (media/video.ts:14-21): 60 s max, short side ≤ 720, crf 26.
  - **Argument strings include `toFixed(3)`.** Use `f"{x:.3f}"`; ties differ (§14), but this is harmless for seeks.
  - **The production Node image has no ffmpeg** (node:22-bookworm-slim). The Python image must install it, which
    matters for the disk budget.
- **Encode queues are in-process.** One promise tail per process: video (video/jobs.ts:20-24) and reels
  (media/jobs.ts:21).
  - A row left `processing` is failed as `interrupted` by sweeps that check **only the local queue**
    (video/staff.ts:203 `!isQueued(c.id)`; community/posts.ts:532-533, older than 1 h).
  - **Coexistence hazard:** if Node is encoding clip X and the Python staff page opens, Python marks X failed.
  - **Video upload, the staff routes, the community upload, the media routes and the sweeps must move as one unit.**
  - Python: an `asyncio.Queue` with one consumer task and `asyncio.create_subprocess_exec`.
- **Photos** (media/image.ts:15-30):
  - sharp: `rotate()` (EXIF orientation), fit inside 1440, flatten on white, JPEG q82 **mozjpeg**, no metadata,
    `limitInputPixels` 40 MP, first page only.
  - **Python:** pyvips is closest to sharp (same libvips: `thumbnail` + `autorot` + `jpegsave(Q=82, strip=True, optimize_coding, trellis…)`).
    Pillow is the alternative (`ImageOps.exif_transpose`, `Image.MAX_IMAGE_PIXELS`).
  - The output bytes will differ, so the parity check is on dimensions, no-EXIF and visual equality, not bytes.
- **Sniffing:** magic bytes only (media/sniff.ts:9-21), a direct port. The profile photo checks are stricter
  (photo.ts: square, 64–512 px, no animation, the format's own end marker).
- **PDF proofs:** `outcomes/pdf-screen.ts` (324 lines) is a hand-written tokenizer with `zlib.inflateSync`, ASCIIHex,
  ASCII85, RunLength and PNG/TIFF predictors.
  - Python's `zlib.decompress` differs from `inflateSync` on trailing garbage and truncated streams. Port it with
    `zlib.decompressobj` and assert identical verdicts on the 239-PDF corpus named in the header (docs/ai/DECISIONS.md
    D25), if that corpus is still on the build machine.

---

## 11. Background jobs, sweeps and crons

| Job | Where it runs today | Cadence | Python |
|---|---|---|---|
| AI worker | in process (instrumentation.ts:14-16) | poll 2 s + wake | lifespan task; one runtime only (§7.5) |
| AI retention (null input/output after 180 d) | in process | at start + every 24 h (worker.ts:36-51) | lifespan task |
| League rollover | in process when LEAGUE=1 (instrumentation.ts:13; league/worker.ts:80-96) + on a student's first request of a new week + optional host cron, **not installed** (deploy/servercore/league-tick.cron: `docker exec jgapps-jgapps-1 npx tsx scripts/league-tick.ts` at Sun 19:05 UTC + hourly Mon) | 10 min | idempotent under `hashtext('league:rollover')` + `for update`; may run in both runtimes. **The cron line must change** to a Python CLI |
| Community sweep (rejected after 30 d, expired stories, unused uploads > 1 d, interrupted transcodes > 1 h, resubmit pending to review) | triggered by community requests, at most every 10 min per process (posts.ts:512-538; route community/[...path]:81) | lazy | `BackgroundTasks` after the response; process-local throttle |
| Task-proof retention (90 d unless an open checkpoint) | on the student's page load (core/retention.ts:14-18; core/boot.ts) | lazy | same |
| Proof orphan rule (24 h) | on upload (phase-x/upload.ts) | lazy | same |
| Video interrupted sweep | when the staff page opens (video/staff.ts:203) | lazy | same; local-queue caveat (§10.3) |
| Lead dispatch to Telegram | fire-and-forget after `POST /api/v1/leads/jia` (route :26) | retries 0, 5 s, 30 s (leads/jia.ts:19, 51-72) | `asyncio.create_task` with a strong reference in a set |
| Daily `pg_dump` (14 days) | **host cron** `/etc/cron.d/jgapps-backup`, 03:30 Tashkent (CURRENT_STATE.md:404) | daily | unchanged: independent of the app runtime |
| Migrations | `npm start` runs `scripts/migrate.mjs` (drizzle migrator, `drizzle.__drizzle_migrations`) before `next start` | every start | schema lane; Python must not run a second migrator against the same table |
| Outcome prompt windows | **not a job**: computed on request (outcomes/windows.ts) | — | pure port |
| Backups before a release | manual step in DEPLOY.md:22 | per release | unchanged |

**No external scheduler exists.** Every recurring job is in process or lazy, so Python only needs `lifespan` tasks.
Next.js `after()` maps to Starlette `BackgroundTasks`. A detached `void promise` maps to `asyncio.create_task` kept
in a module-level set (otherwise the task can be garbage-collected).

---

## 12. Outbound HTTP, including Telegram

| Call | Where | Notes |
|---|---|---|
| Telegram `sendMessage` | leads/jia.ts:57-72 | `POST https://api.telegram.org/bot<JIA_LEADS_TG_TOKEN>/sendMessage`, `{chat_id, message_thread_id, text (HTML), parse_mode:'HTML', disable_web_page_preview}`. 400/403 are final; otherwise retry. **Never log the URL** (it holds the token); log only the status or exception name (:66-68). Inert without all three env vars; the row gets `tg_status 'off'`. The message format is :36-39 (Uzbek, emoji, Tashkent time). |
| Anthropic | ai.ts, ailayer/client.ts | §7 |
| Whisper | speech/transcribe.ts | §7.9 |
| R2 | media/r2.ts:56 | SigV4 |
| Google OIDC | Auth.js | §2.6 |
| mandat.uzbmb.uz scrape | outcomes/uz-mandat.ts | ops script only (`scripts/outcomes/uz-rescrape.ts`), not request-time |

Use httpx for all of these, with one `AsyncClient` per process and explicit timeouts. The Telegram call has no
explicit timeout today, so give it one (10 s) as a harmless improvement.

---

## 13. Logging

- **Volume:** 25 `console.*` call sites (src/server + src/app), going to docker logs. There is no structured logging,
  no request log, and no metrics.
- **Privacy rules in the code:**
  - `logAiError` logs only the class, the SQLSTATE and the driver cause, never the message, the query, the params or
    the stack (ailayer/queue.ts:39-42). Drizzle errors carry every bound parameter.
  - The payment rails log only the rail, the method, the class and the SQLSTATE (pay/rails.ts:30-38).
  - Leads log only the status or exception name.
  - The teacher placeholder warning prints at start (instrumentation.ts:5-11).
- **Python:**
  - stdlib `logging` to stdout with the same message strings.
  - **Turn off uvicorn's access log**, or redact query strings. Signed media/video URLs and `?uid=` in the SSE URL
    would otherwise be logged, and Next logs no access lines today.
  - Use one exception handler that logs an exception's class and SQLSTATE. Do not let FastAPI or uvicorn print
    tracebacks that include SQLAlchemy's statement and params (`hide_parameters=True` on the engine).
  - Auth.js logs every failed sign-in as `[auth][error] CredentialsSignin`. Keeping one line per failure is fine.

---

## 14. JS→Python semantics: cross-cutting traps (counts in src/server + src/engine)

These apply to every lane. They are listed here because the server's parity gates fail on them first.

| Trap | Count | Python rule |
|---|---|---|
| `.length` / zod `.max()` count **UTF-16 units**; `.slice()` may split surrogates | about 200 zod `.max(` in server+app; every guard cap | `js_len(s) = len(s.encode('utf-16-le'))//2`; `js_slice` on UTF-16; zod-equivalent validators |
| `Math.round` rounds half toward +∞ | 103 | `js_round(x) = math.floor(x + 0.5)` (special-case ±0 and 0.49999999999999994) |
| `toFixed` rounds half-up on the exact binary value | 28 | `Decimal(x).quantize(…, ROUND_HALF_UP)`; never `round()` or `f"{:.nf}"` at ties |
| `toISOString()` (ms, `Z`) | 83 | `iso_js(dt)`; ms-truncate on write (§6) |
| `localeCompare` (ICU collation) | 34 | PyICU `Collator` (root or en); **never** Python `sorted()` |
| `Intl.*` / `toLocale*` (uz-Latn, ru, en-GB dates; PluralRules) | 11 (+ engine i18n) | PyICU for parity; Babel CLDR output can differ |
| `\p{…}` regexes | 85 | `regex` module |
| No `u` flag ⇒ ASCII `\b \w \d` | most guard and screen patterns | `re.ASCII` (§7.7) |
| `String.prototype.normalize` | 19 | `unicodedata.normalize` (ICU and Python Unicode versions can differ slightly) |
| JSON numbers: `JSON.stringify(1.0) == "1"`; NaN/Infinity → `null`; `undefined` keys dropped; Dates → ISO | everywhere | a custom `JSResponse` / `js_dumps`: integral floats as ints, NaN → null, `separators=(',',':')`, `ensure_ascii=False`; pydantic models must distinguish absent from `null` (`exclude_unset` per field). Starlette's JSONResponse uses `allow_nan=False` and **raises** on NaN |
| `Number(str)` coercion (`''`→0, `' 12 '`→12, `'0x10'`→16, `'1e3'`→1000) | env parsing helpers in 6 files + routes | `js_number()` |
| Truthiness: `[]` and `{}` are truthy in JS, falsy in Python | code-wide | review each `if (x)` on arrays and objects |
| `Array.prototype.sort()` without a comparator sorts by string, numbers included | grep per lane | port the comparator exactly |
| `Math.random` (homework.ts:47 shuffle) | 1 | fine with `random` (not deterministic in TS either) |
| **Deterministic HMAC stream + Fisher–Yates with `Math.floor(random()*(i+1))`** | lessons/piece.ts:30-34 + content/bank.ts:260 + cat/bank.ts:121 | `random = int.from_bytes(hmac[0:4],'big') / 2**32`; same loop; **must match bit-for-bit**, or a student mid-lesson sees a different question and option order after the switch |
| `randomBytes(9).toString('base64url')` tokens | checks, cat, dtm, sat-full | `secrets.token_urlsafe(9)` gives the same 12-character shape |
| postgres.js returns `bigint`/`numeric`/`sum()` as **strings**; code wraps them in `Number()` | many | asyncpg returns `int`/`Decimal`. Convert `Decimal` to float where TS did `Number()`; never JSON-encode a `Decimal` |

**Mitigation:** a shared `jgapi/jscompat.py` (js_len, js_slice, js_round, js_to_fixed, js_number, js_str_number,
iso_js, js_dumps, canon), unit-tested against vectors exported from Node. **Every lane imports it.** No ad-hoc ports.

---

## 15. Database access layer: what the server code assumes

### 15.1 Driver and pool

- **Today:** postgres.js `max: 10` per process (src/db/client.ts:7), plus one extra LISTEN connection for the chat hub.
- **Postgres is shared with other sites.** During coexistence, Node (10 + 1) and Python (its pool + 1) both connect.
  Check `max_connections` and current usage on `jamals-postgres-1` before starting the Python container.
- **Pool-exhaustion rule** (settings.ts:34-38; engine/context.ts:13-15, 36-51): code inside a transaction must read
  through the transaction's connection, never the pool. Ten concurrent waits empty the pool for good. Python must pass
  `conn` explicitly. **Never use SQLAlchemy `Session` autobegin patterns that grab a second connection.**
- **Per-student serialization:** `withStudent` (engine/context.ts:12-24) inserts the default rows, then
  `select … for update` on `engine_state`, with savepoints (`tx.transaction`) for AI steps. In SQLAlchemy that is
  `async with conn.begin_nested()`.
- **Isolation:** read committed everywhere, which is the default. No `isolationLevel` override exists.

### 15.2 Advisory locks (12 sites). Keys and the hash function must match exactly for cross-runtime safety

| Key | Function | Site |
|---|---|---|
| `ai-usage:<utc day>` | `hashtextextended(…,0)` | ai.ts:30, jamol/quota.ts:61 |
| `ai-layer:<utc day>` | `hashtextextended(…,0)` | ailayer/budget.ts:72 |
| `telegram:<tgId>` | `hashtextextended(…,0)` | users.ts:76 |
| `family:<studentId>` | `hashtextextended(…,0)` | family.ts:39 |
| `proof:<studentId>` | `hashtextextended(…,0)` | outcomes/scores.ts:28 |
| `community:<uid>` | `hashtext(…)` | community/posts.ts:54 |
| `league:<week>:<tier>:<stage>` | `hashtext(…)` | league/store.ts:65 |
| `league:rollover` | `hashtext(…)` | league/worker.ts:73 |
| `jg-games:<uid>:<day>` | `hashtext(…)` | pay/limits.ts:41 |
| `jg-order:<payer>:<student>:<tier>:<period>` | `hashtext(…)` | pay/orders.ts:41 |
| `jg-sub:<studentId>` | `hashtext(…)` | pay/subscriptions.ts:43 |

### 15.3 IDs, timestamps and types

- **App-side UUIDs.** About 39 tables get `id` from `crypto.randomUUID()` in the app, with **no DB default** (`user`
  src/db/schema.ts:8; the `uuid()` helpers at schema.ts:123, schema-pay.ts:22, schema-community.ts:15,
  schema-moderation.ts:27; schema-core.ts:12, schema-league.ts:22, schema-m1-parent.ts:21/37/50). Python inserts must
  supply `str(uuid4())`. Optionally, the schema lane adds `DEFAULT gen_random_uuid()::text`, which is additive and
  safe for both runtimes.
- **Auth.js tables** use `timestamp` **without** time zone (`emailVerified`, `session.expires`,
  `verificationToken.expires`, schema.ts:11, 30, 35). Treat naive values as UTC. Product tables use `timestamptz`.
- **jsonb:** postgres.js returns parsed objects, but asyncpg returns `str` unless a codec is registered.
  `set_type_codec('jsonb', encoder=js_dumps, decoder=json.loads, schema='pg_catalog')` on every connection, including
  the LISTEN one. 43 jsonb columns in schema.ts alone.
- **Raw SQL** with `sql\`…\`` (claims, enqueue, NOTIFY, advisory locks, sweeps) ports verbatim. Drizzle passed ISO
  strings for timestamptz in raw SQL (queue.ts:21-22 comment). With asyncpg, pass aware datetimes.

---

## 16. Coexistence and cutover (production never down for more than seconds; nobody logged out)

**Topology for the transition** (all on jamals-web, network `jamals_default`):
- `jgapps` (Node, today) and `jgapi` (FastAPI, new; one uvicorn worker; same `.env` plus its own additions).
- Caddy routes per path group: `handle /api/v1/<group>* { reverse_proxy jgapi:8000 }`, everything else to
  `jgapps:3000`.
- `caddy reload` is graceful, so a switch or rollback is a config flip that takes seconds.

**Ordering** (each step reversible by a Caddy flip):
1. **Foundation in prod, dark:**
   - `jgapi` serves only `/api/py/health`. Verify DB connectivity, the pool budget, memory, and the disk budget (the
     image plus ffmpeg).
   - Install the vectors and parity harness (§17) in CI.
2. **Read-the-cookie:** Python decodes Auth.js sessions (§2.3). Verify on a real production cookie copied to a scratch
   check (never logged). No user-facing change.
3. **Dark M1 groups first.** Their switches are off in production, so 404s are the "identical behaviour":
   pay, chat + stream, community + media, league, games, moderation, leads, core-m1, parent-m1. Port them, run them
   on a staging DB with the switches on, and route them in production while still off. **This is the low-risk
   rehearsal ground.**
4. **Live, engine-independent groups:**
   - photo (`/api/v1/me/photo`, `/api/v1/photo/*`), `state/[key]`, `me/profile`, `privacy`, `register`, `family/*`.
   - Check which of these touch the engine; the engine lane decides.
5. **Engine-dependent groups** (snapshot, commit, checks, lessons, homework, mock, study, tasks, parent week, boot,
   explore). This is **blocked on the engine port.** 139 of 317 server files import `@/engine`.
6. **AI:** stop Node's worker (remove AI_LAYER from Node's env, recreate), and in the same minute start Python's.
   `ai/sample` streaming and writing/speaking feedback move with the lessons group. Master-off SQL works for both
   runtimes because it lives in the DB.
7. **Issuance:** `/api/auth/*`, `/signin` posts and `/signout` move to Python. Node can still decode.
8. **Node API off.** Page routes go to the Next.js frontend (frontend lane). The boot payload builder
   (`src/server/boot.ts` + `pages.ts`) becomes a FastAPI endpoint consumed by Next.

**Groups that must move as one unit (single owner at a time):**
- chat (every `/api/v1/chats*` route, the stream, `staff/chats/reported`)
- community + media + its sweep
- video staff + upload + file route + encode queue
- the AI worker
- the lesson piece route **and** its answer route (the same HMAC stream on both sides, §14)
- `/api/auth/*` with `/signin/telegram`

**Fine split across runtimes** while the shared contracts hold:
- payment callbacks (DB idempotency)
- the league tick (idempotent)
- rate limits (counters split, which is the same as a deploy reset)

**Rollback:**
- Flip Caddy back.
- Never deploy a Python-only migration during coexistence. Migrations stay additive and owned by one runner (§11).
- Keep the previous Node release directory, as DEPLOY.md:25-26 does today. **Disk is 85 % used** (5.7 GB free), and a
  Node release is about 944 MB (CURRENT_STATE.md:8), so plan the removal of old `app-*` dirs before adding a Python
  image.

---

## 17. Parity strategy

1. **Golden vectors from TS (pure functions).**
   - A one-off exporter in the build worktree (not in jg-plan) writes JSONL vectors.
   - Cover: password hash/verify both ways, the Telegram dcs + HMAC, JWE encode/decode both ways (plus the CSRF hash),
     media/video signatures, gift codes, sandbox keys, **the piece HMAC stream (tokens + random sequence) and the
     bank shuffle orders**, `canon`/`hashOf` over tricky inputs (Uzbek ʻ/ʼ, Cyrillic, emoji, floats, nested, undefined),
     `clickSign` / `clickAmountTiyin`, payme/click transcripts over the memory store, `parseRange`,
     `clipArgs`/`reelArgs`, `sniff`, `safeMediaKey`, `costOf` / `reservationFor` / `timeoutMs`, `outcomes()` (league),
     `windowsFor` / `duePrompt`, `normPhone` / `leadMessage`, `purposeOf`, the screen() verdicts, `guardAll` verdicts
     over a corpus, the token phrases, and the jscompat helpers.
   - pytest consumes the vectors. Expect most server parity to be proven here, cheaply.
2. **Frozen AI wire format.** Export the system prompts and the exact request bodies (with the fake AiClient) per kind.
   Python must build **byte-equal JSON** for the same inputs. Check prompt sha256 pins.
3. **Route-test transplant (HTTP).**
   - A vitest alias maps `@/app/api/**/route` imports (118 of them across the route tests) to a generated proxy module
     whose `GET/POST/...` forward the `Request` to FastAPI.
   - The `@/auth` mock becomes a test-only header `x-jg-test-uid`, honoured **only** when FastAPI runs with
     `JG_TEST=1`. The app must refuse to start with that flag when `ENV=production`.
   - Test-only controls: `setTestNow` → `x-jg-test-now`, and `setX()` switches → `POST /__test__/switches`, both
     test-mode only.
   - The tests' DB seeding and assertions keep using drizzle against the same `TEST_DATABASE_URL`.
   - **Limit:** tests that inject in-process fakes (AI client, transcriber, faults) need Python-side equivalents
     driven by the test control endpoint. Budget them per file.
4. **Black-box gates unchanged:** the headless-Chrome smoke walks (48 files), the 14-day walks, and the fidelity gate
   (0.000 %) run against the Caddy-fronted mixed stack at every routing step.
5. **Snapshot replay.**
   - Restore a production `pg_dump` into a scratch DB (named `*_test`, so sandbox rules apply).
   - Replay the smoke-walk request corpus against Node-only and against the mixed stack.
   - Diff JSON after normalization (key order; numbers via JS semantics).
   - Do **not** mirror live production traffic: cookies and children's data would be duplicated into a second path.
6. **AI dual-run (fake client):** the same queued jobs on both runtimes on scratch DBs. Compare `ai_run` rows (status,
   violations, stored output, cost).

---

## 18. Ops scripts that assume Node in the container

- DEPLOY.md and the SQL comments tell the owner to run `npx tsx scripts/ai-switch.ts --notice 2026-10-20`
  (DEPLOY.md:35-43; ai-master-off.sql). The league cron runs `docker exec … npx tsx scripts/league-tick.ts`.
- **Scripts that touch state:** ai-switch, ai-revoke, ai-backfill, coins-adjust, family-unlink, engine-unproject,
  league-tick, seed-demo, migrate. The content, CAT and outcomes tooling is offline analysis.
- **Choices:**
  - (a) Port the state-touching ones to a Python CLI (`python -m jgapi.cli ai-switch …`) and update DEPLOY.md and the
    SQL comments. **Recommended for ai-switch, league-tick, coins-adjust and family-unlink.**
  - (b) Keep a small Node toolbox image for the offline content tooling only.
- **Never leave two implementations of a coin or ledger adjustment.**

---

## 19. Hard parts (ranked)

1. **Zero-logout auth.** JWE `dir`/A256CBC-HS512 with an HKDF key salted by the cookie name, a SHA-512 kid, the CSRF
   double-submit hash, the error-redirect shapes, the Google linking rules. Everything must be byte-compatible in both
   directions so either runtime can issue and read during coexistence and rollback.
2. **Deterministic serving parity.** The lesson piece HMAC stream feeding JS-float Fisher–Yates (piece.ts:30-34,
   content/bank.ts:260). Plus `canon`/`hashOf` JSON, ms timestamps and JS number formatting. Any drift changes what a
   student sees mid-lesson, or what the server considers the right answer.
3. **AI layer fidelity.** Send the TS-SDK-transformed output schemas verbatim. Keep prompts byte-identical. Port the
   guard's regexes flag-for-flag (ASCII `\b` vs Unicode, `\p{L}`, UTF-16 lengths). Exactly one worker owner. Budget
   and meter locks shared across runtimes. Mid-stream fallback text in streaming.
4. **Chat SSE hub.** asyncpg LISTEN with ordered delivery, exact SSE bytes, the ring and Last-Event-ID, per-process
   presence, so it needs a single worker process.
5. **Single-runtime assumptions in in-process queues and sweeps** (video/reel encode, "interrupted" sweeps). These
   force unit-moves.
6. **Payments exactness** (dark, but money): JSON-RPC integer typing, raw-string md5 signing, the partial-index race
   semantics, perform+activate atomicity.
7. **JS semantics across about 14.6k lines of this area** (§14 table). Silent divergences pass type checks and most
   tests.
8. **Critical-path dependency on the engine port.** 139/317 server files import `@/engine`. Until the engine is in
   Python, every engine-dependent route stays on Node, or calls a transitional Node engine sidecar (a pure-function
   JSON RPC). The sidecar is worth considering if the engine lane slips.
9. **Performance and capacity.** Python is slower than V8 on CPU-bound guard, engine and PDF work. One asyncio process
   on a shared 4-CPU / 7 GB box has to keep SSE responsive: offload scrypt, the guard, the PDF screen and the engine
   with `asyncio.to_thread` or a small process pool. Disk is 85 % full.
10. **Ops surface:** the migrations runner ownership, the scripts, the cron line, DEPLOY.md.

---

## 20. Estimate (agent-days; one agent ≈ 8 focused hours)

For **this area only** (the infrastructure services above, with their parity tests). Not included: the engine, the
domain services (lessons, checks, CAT, phase-d/x, outcomes, parent, boot/pages, engine services, about 17k lines of
`src/server`), and the frontend.

| Work | Agent-days |
|---|---|
| FastAPI foundation: settings/switches, SQLAlchemy Core models for 113 tables (generated from drizzle, then hand-checked), clock, `jscompat` + `JSResponse`, body caps, security headers, rate limiter, logging, error handling, compose service | 4 |
| Auth: JWE read/issue, CSRF, password + Telegram credentials, Google OIDC with Auth.js linking semantics, register, signout, `apiUser`/`staffUser`, two-way vectors | 4 |
| AI layer: client, structured call with frozen schemas and prompts, settings cache, budget, quota and M1 meter, jobs/queue/worker, runs, guard + lexicons + tokens + inputs, interpret/result/change/tasks/react/draft, plan loop + plan-eval/judge, streaming sample, writing/speaking feedback, precheck, Whisper client, fake client | 8 |
| Payments (Payme, Click, store, activate, subscriptions, gifts, coupons, orders, checkout, limits, sandbox, staff billing) | 4 |
| Chat (hub, SSE, store 776 lines, moderation wire, reports) | 4 |
| Community + media + moderation (posts, social, people, items, sweep, R2, photo re-encode, staff/console pages) | 5 |
| Video + listening serve + profile photo + proof upload + PDF screen | 3 |
| League + games (python-chess parity) | 2 |
| Jobs/sweeps/leads/ops CLI (ai-switch, league-tick, coins-adjust, family-unlink) | 1.5 |
| Parity harness: TS vector exporter, route-test transplant shim + test-mode controls, snapshot replay diff | 4 |
| Cutover engineering: Caddy route groups, coexistence drills, rollback drills, DEPLOY.md rewrite | 2 |
| **Total** | **41.5** (realistic range 34–50) |

With 4–6 agents in parallel after the foundation and auth (about 8 agent-days, mostly sequential), calendar time is
about 2–3 weeks for this area. The cutover of live engine-dependent routes is gated by the engine lane, not by this
one.

---

## 21. To verify on the box before building (read-only checks, no secrets printed)

- The Caddy version and its `trusted_proxies` behaviour for `X-Forwarded-For` (§4).
- Postgres `max_connections` and the connections in use on `jamals-postgres-1` (§15.1).
- That `AUTH_URL` in `/opt/jgapps/.env` is `https://app.jamals.uz`, by checking that the key exists and comparing the
  value's prefix only (§2.3).
- That `AUTH_SECRET_1..3` are absent; otherwise the decode order matters (§2.3).
- Whether `session` / `verificationToken` hold any rows (expected 0).
- Free disk after removing old `app-*` releases; the Python image size with ffmpeg + libvips + ICU (§10.3, §16).
