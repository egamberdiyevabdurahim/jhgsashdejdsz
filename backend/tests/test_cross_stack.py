"""Cross-stack: the RUNNING TypeScript app (JG_TS_URL, e.g. `next dev -p 3107` with GAMES_SERVER=1 and AUTH_URL set to
that origin) mints a real session cookie through its own Auth.js sign-in (/api/auth/csrf -> /api/auth/callback/password),
and FastAPI, in process on the SAME database and AUTH_SECRET, must

  - accept that cookie for the same user (and refuse it tampered, as the TypeScript app does), and
  - answer the ported routes with the same status, the same bytes and the same cache header as the TypeScript routes.

Accounts are throwaway @example.test ones on a local scratch database. Skipped without JG_TS_URL.
"""
from __future__ import annotations

import os
import secrets
import uuid

import httpx
import pytest
from sqlalchemy.dialects.postgresql import insert

from app import db as appdb
from app.main import create_app
from app.models import GameRating
from app.settings import get_settings

TS = os.environ.get("JG_TS_URL")
pytestmark = pytest.mark.skipif(not TS, reason="JG_TS_URL (a running Next.js app on the same DB) is not set")
COOKIE = "authjs.session-token"
PASSWORD = "Kx7-" + secrets.token_urlsafe(12)


def _register(c: httpx.Client, role: str) -> tuple[str, str]:
    email = f"migbe-{role}-{uuid.uuid4().hex[:10]}@example.test"
    r = c.post(f"{TS}/api/v1/register", json={"email": email, "password": PASSWORD, "firstName": "Mig", "lastName": role.title(), "role": role})
    assert r.status_code == 201, r.text
    return email, r.json()["id"]


def _sign_in(email: str) -> str:
    """The TypeScript app's own sign-in: the cookie value it sets is the token under test."""
    with httpx.Client(timeout=90, follow_redirects=False) as c:
        csrf = c.get(f"{TS}/api/auth/csrf").json()["csrfToken"]
        r = c.post(f"{TS}/api/auth/callback/password", data={"email": email, "password": PASSWORD, "csrfToken": csrf, "callbackUrl": f"{TS}/app"})
        assert r.status_code in (302, 303), r.text[:300]
        token = c.cookies.get(COOKIE)
        assert token, f"no {COOKIE} in {list(c.cookies.keys())}"
        return token


def _flip(token: str) -> str:
    p = token.split(".")
    s = p[3]
    p[3] = s[:10] + ("A" if s[10] != "A" else "B") + s[11:]
    return ".".join(p)


@pytest.fixture(scope="module")
def world():
    os.environ["GAMES_SERVER"] = "1"
    os.environ["AUTH_URL"] = TS
    get_settings.cache_clear()
    with httpx.Client(timeout=120) as c:
        s_email, s_id = _register(c, "student")
        p_email, p_id = _register(c, "parent")
    student, parent = _sign_in(s_email), _sign_in(p_email)
    # link the parent through the TypeScript app (the code from its own family route), so `parents` is not empty
    with httpx.Client(timeout=120) as c:
        code = c.get(f"{TS}/api/v1/family", headers={"cookie": f"{COOKIE}={student}", "x-jg-uid": s_id}).json()["code"]
        r = c.post(f"{TS}/api/v1/family/join", json={"code": code}, headers={"cookie": f"{COOKIE}={parent}"})
        assert r.status_code == 200, r.text
    return {"student": (student, s_id), "parent": (parent, p_id)}


async def _both(path: str, headers: dict[str, str]):
    async with httpx.AsyncClient(timeout=120) as ts:
        a = await ts.get(f"{TS}{path}", headers=headers)
    await appdb.dispose()
    transport = httpx.ASGITransport(app=create_app())
    async with httpx.AsyncClient(transport=transport, base_url="http://py") as py:
        b = await py.get(path, headers=headers)
    await appdb.dispose()
    return a, b


def _same(a: httpx.Response, b: httpx.Response):
    print(f"\n  TS {a.status_code} {a.content[:160]!r} cc={a.headers.get('cache-control')}"
          f"\n  PY {b.status_code} {b.content[:160]!r} cc={b.headers.get('cache-control')}")
    assert (a.status_code, a.content) == (b.status_code, b.content), (a.status_code, a.text[:300], b.status_code, b.text[:300])
    for h in ("cache-control", "retry-after", "x-frame-options", "content-security-policy", "x-content-type-options",
              "referrer-policy", "strict-transport-security", "permissions-policy"):
        assert a.headers.get(h) == b.headers.get(h), (h, a.headers.get(h), b.headers.get(h))
    if a.content:
        assert a.headers["content-type"].split(";")[0] == b.headers["content-type"].split(";")[0]


async def test_health_same():
    a, b = await _both("/api/health", {})
    assert a.json() == {"ok": True}
    assert (a.status_code, a.content) == (b.status_code, b.content)


async def test_typescript_cookie_is_the_same_user_in_python(world):
    from starlette.requests import Request
    from app.auth.session import session_uid

    token, uid = world["student"]
    req = Request({"type": "http", "method": "GET", "path": "/", "headers": [(b"cookie", f"{COOKIE}={token}".encode())],
                   "scheme": "http", "query_string": b"", "server": ("py", 80)})
    assert session_uid(req) == uid
    bad = Request({**req.scope, "headers": [(b"cookie", f"{COOKIE}={_flip(token)}".encode())]})
    assert session_uid(bad) is None


@pytest.mark.parametrize("who,claim,name", [
    (None, None, "no cookie: 401"),
    ("student", "someone-else", "another account's page: 409"),
    ("student", "", "empty claim: 409"),
    ("student", "self", "student, own page: 200"),
    ("student", None, "student, no x-jg-uid (optional here): 200"),
    ("parent", "self", "parent: 403 students only"),
    ("tampered", "self", "tampered cookie: 401"),
])
async def test_family_same(world, who, claim, name):
    await _assert_same_for("/api/v1/family", world, who, claim)


@pytest.mark.parametrize("who,claim,name", [
    (None, None, "no cookie: 401"),
    ("student", "someone-else", "another account's page: 409"),
    ("student", None, "no x-jg-uid: 409 (required here)"),
    ("student", "self", "student: 200"),
    ("parent", "self", "parent: 403"),
    ("tampered", "self", "tampered cookie: 401"),
])
async def test_games_me_same(world, who, claim, name):
    await _assert_same_for("/api/v1/games/me", world, who, claim)


async def test_games_me_same_with_ratings(world):
    _, uid = world["student"]
    async with appdb.sessionmaker()() as s:
        await s.execute(insert(GameRating).values(student_id=uid, kind="chess", rating=1093, games=3, wins=1)
                        .on_conflict_do_update(index_elements=["student_id", "kind"], set_={"rating": 1093}))
        await s.commit()
    await appdb.dispose()
    a, b = await _assert_same_for("/api/v1/games/me", world, "student", "self")
    assert a.json() == {"on": True, "ratings": {"chess": 1093, "checkers": 0}, "computer": 1200}


async def _assert_same_for(path, world, who, claim):
    headers: dict[str, str] = {}
    uid = None
    if who:
        token, uid = world["student" if who == "tampered" else who]
        headers["cookie"] = f"{COOKIE}={_flip(token) if who == 'tampered' else token}"
    if claim is not None:
        headers["x-jg-uid"] = uid if claim == "self" else claim
    a, b = await _both(path, headers)
    _same(a, b)
    return a, b
