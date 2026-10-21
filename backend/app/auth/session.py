"""Who is asking: the Auth.js session cookie read exactly as `auth()` reads it in the Next.js routes (src/auth.ts, JWT
strategy), and the routes' plumbing of src/server/api.ts (apiUser: session, x-jg-uid, role, demo).

`auth()` in a route handler (next-auth 5.0.0-beta.29 lib/index.js getSession) builds the session URL with createActionURL:
AUTH_URL when set, else x-forwarded-host/host with x-forwarded-proto (default https). An https URL means the
"__Secure-" cookie prefix (@auth/core defaultCookies). The cookie may be chunked (name.0, name.1, ...; SessionStore).
The decoded token's `uid` is the user id (src/auth.ts callbacks.jwt/session: session.user.id = String(token.uid)).
"""
from __future__ import annotations

import re
from typing import Any
from urllib.parse import unquote, urlparse

from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..errors import ApiError
from ..models import Profile
from ..settings import get_settings
from . import jwe

COOKIE = "authjs.session-token"
SECURE_COOKIE = "__Secure-authjs.session-token"


def parse_cookie_header(header: str) -> dict[str, str]:
    """@auth/core lib/vendored/cookie.js parse: first occurrence of a name wins; a value with % is URI-decoded (left as is if that fails)."""
    out: dict[str, str] = {}
    for part in header.split(";"):
        if "=" not in part:
            continue
        k, v = part.split("=", 1)
        k, v = k.strip(" \t"), v.strip(" \t")
        if k in out:
            continue
        if v.startswith('"') and v.endswith('"') and len(v) >= 2:
            v = v[1:-1]
        if "%" in v:
            try:
                v = unquote(v, errors="strict")
            except UnicodeDecodeError:
                pass
        out[k] = v
    return out


def uses_secure_cookie(headers: dict[str, str] | Any, scheme: str) -> bool:
    url = get_settings().auth_url
    if url:
        return urlparse(url).scheme == "https"
    proto = headers.get("x-forwarded-proto") or scheme or "https"
    return proto.rstrip(":") == "https"


def session_cookie_value(cookies: dict[str, str], name: str) -> str | None:
    """SessionStore.value: every cookie named `name` or `name.<n>` with a value, joined in chunk order."""
    chunks = [(k, v) for k, v in cookies.items() if k.startswith(name) and v]
    if not chunks:
        return None

    def order(kv: tuple[str, str]) -> int:
        m = re.search(r"\.(\d+)$", kv[0])
        return int(m.group(1)) if m and kv[0] != name else -1

    return "".join(v for _, v in sorted(chunks, key=order))


def token_of(request: Request) -> dict[str, Any] | None:
    """The decoded session token, or None (no cookie, tampered, expired, wrong secret): getToken's null."""
    name = SECURE_COOKIE if uses_secure_cookie(request.headers, request.url.scheme) else COOKIE
    raw = session_cookie_value(parse_cookie_header(request.headers.get("cookie", "")), name)
    if not raw:
        return None
    try:
        return jwe.decode(raw, get_settings().auth_secrets, salt=name)
    except jwe.JWEError:
        return None


def session_uid(request: Request) -> str | None:
    """`(await auth())?.user?.id`."""
    t = token_of(request)
    uid = t.get("uid") if t else None
    if uid is None or uid == "" or uid is False or uid == 0:
        return None
    return uid if isinstance(uid, str) else _js_string(uid)


def _js_string(v: Any) -> str:
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


async def get_profile(db: AsyncSession, user_id: str) -> Profile | None:
    return (await db.execute(select(Profile).where(Profile.user_id == user_id))).scalar_one_or_none()


async def api_user(request: Request, db: AsyncSession, role: str, demo: bool = False) -> Profile:
    """src/server/api.ts apiUser: 401 without a session; 409 when the page was rendered for another account (x-jg-uid,
    P0 I2); 401 without a profile; 403 for the wrong role or a demo account (unless the route takes one)."""
    uid = session_uid(request)
    if not uid:
        raise ApiError(401, {"error": "unauthenticated"})
    if request.headers.get("x-jg-uid") != uid:
        raise ApiError(409, {"error": "wrong account"})
    p = await get_profile(db, uid)
    if p is None:
        raise ApiError(401, {"error": "unauthenticated"})
    if p.role.value != role:
        raise ApiError(403, {"error": f"{role}s only"})
    if p.demo and not demo:
        raise ApiError(403, {"error": "demo"})
    return p
