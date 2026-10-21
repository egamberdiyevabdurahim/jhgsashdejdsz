# backend/ — the FastAPI port of the /api contract

Python 3.11, FastAPI, SQLAlchemy 2.0 async + asyncpg, Alembic. The Next.js root app stays live until cutover; this
answers the same `/api/...` routes, byte for byte, on the same database and the same session cookie.

## Run
```
py -3.11 -m venv .venv && .venv/Scripts/python -m pip install -e ".[dev]"     # once (the venv is never committed)
.venv/Scripts/uvicorn app.main:app --port 8107                                 # settings: root .env.local, then backend/.env, then the environment
.venv/Scripts/python -m pytest -q                                              # needs DATABASE_URL at the Drizzle head
```
Environment names are the Next.js app's own (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, feature switches such as
`GAMES_SERVER`, `RATE_*`): see `app/settings.py`.

## What a ported route copies (the pattern)
- `app/routes/<area>.py`, one `APIRouter`, registered in `app/main.py`. The TypeScript route's file in the docstring.
- Who is asking: `api_user(request, db, "student")` (= `apiUser` in src/server/api.ts: 401, 409 on `x-jg-uid`, 403 role/demo)
  or `session_uid(request)` for routes that do their own checks (= `(await auth())?.user?.id`).
- Answers: `errors.json(body, status, no_store=...)`: `no_store=True` where the TS route used `json()` from
  src/server/api.ts, `False` where it used a bare `Response.json`. Raise `ApiError(status, {"error": ...})` to refuse.
- Dates leave as `jsx.js_iso(dt)` (Date.toISOString: UTC, milliseconds, Z). Keys keep the TS camelCase.
- Engine writes go through `engine.context.with_student(db, id)` (withStudent: the row lock and the ensured rows).
- Rate limits: `limits.hit(bucket, LIMITS.x())` then `errors.too_many()`; per process, as in Node (one worker).
- Prove it: add the route's cases to `tests/test_cross_stack.py` (same status, bytes and headers as the running TS app).

## Models and migrations
`app/models/*` is generated (`tools/gen_models.py`, sqlacodegen, one module per domain) from a database migrated by
Drizzle; `tests/test_models_match_db.py` and `alembic check` prove it equals that schema. Until cutover Drizzle owns
the schema: after a new Drizzle migration, regenerate the models and add an Alembic revision recording it (see
`alembic/versions/d0050_drizzle_baseline.py`). `alembic upgrade head` on a Drizzle-0050 database only records the
baseline (version table in the `drizzle` schema; `public` is untouched).

## The session cookie (auth continuity)
`app/auth/jwe.py` reads and writes Auth.js v5 session JWTs exactly as @auth/core does (dir + A256CBC-HS512, HKDF-SHA256
of AUTH_SECRET with salt = cookie name, kid = JWK thumbprint, 15 s clock tolerance). The cookie name follows AUTH_URL
(`__Secure-authjs.session-token` on https). Same AUTH_SECRET + same AUTH_URL scheme = nobody signed out.

## Cross-stack test
Start the TS app on a scratch DB at the same Drizzle head (`GAMES_SERVER=1 AUTH_URL=http://localhost:3107 next dev -p 3107`),
then `JG_TS_URL=http://localhost:3107 pytest tests/test_cross_stack.py` with the same DATABASE_URL and AUTH_SECRET.
It registers throwaway `@example.test` accounts there and signs in through Auth.js itself.
