"""Reading the cookie as `auth()` does: the name by AUTH_URL's scheme (else x-forwarded-proto, default https), the
chunked form (name.0, name.1, ...), first-occurrence-wins parsing, and uid -> the user id."""
from __future__ import annotations

import pytest
from starlette.requests import Request

from app.auth import jwe
from app.auth.session import COOKIE, SECURE_COOKIE, parse_cookie_header, session_uid
from app.settings import get_settings

SECRET = "test-secret-for-cookie-reading-only"


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("AUTH_SECRET", SECRET)
    monkeypatch.setenv("AUTH_URL", "http://localhost:3000")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def req(cookie: str, headers: dict[str, str] | None = None) -> Request:
    h = [(b"cookie", cookie.encode())] + [(k.encode(), v.encode()) for k, v in (headers or {}).items()]
    return Request({"type": "http", "method": "GET", "path": "/", "headers": h, "scheme": "http", "query_string": b"", "server": ("x", 80)})


def test_plain_and_tampered():
    t = jwe.encode({"uid": "u-1", "sub": "u-1"}, SECRET, COOKIE)
    assert session_uid(req(f"other=1; {COOKIE}={t}")) == "u-1"
    assert session_uid(req(f"{COOKIE}={t[:-3]}abc")) is None
    assert session_uid(req("")) is None


def test_chunked_cookie_reassembles_in_order():
    t = jwe.encode({"uid": "u-2", "pad": "x" * 5000}, SECRET, COOKIE)
    a, b, c = t[:3000], t[3000:6000], t[6000:]
    assert session_uid(req(f"{COOKIE}.2={c}; {COOKIE}.0={a}; {COOKIE}.1={b}")) == "u-2"


def test_secure_name_follows_auth_url(monkeypatch):
    monkeypatch.setenv("AUTH_URL", "https://app.jamals.uz")
    get_settings.cache_clear()
    t = jwe.encode({"uid": "u-3"}, SECRET, SECURE_COOKIE)
    assert session_uid(req(f"{SECURE_COOKIE}={t}")) == "u-3"
    # the http cookie name is not read on https, and a token minted for one name never reads under the other
    plain = jwe.encode({"uid": "u-3"}, SECRET, COOKIE)
    assert session_uid(req(f"{COOKIE}={plain}")) is None
    assert session_uid(req(f"{SECURE_COOKIE}={plain}")) is None


def test_without_auth_url_forwarded_proto_decides(monkeypatch):
    monkeypatch.setenv("AUTH_URL", "")  # (an empty value also hides the root .env.local one)
    monkeypatch.setenv("NEXTAUTH_URL", "")
    get_settings.cache_clear()
    t = jwe.encode({"uid": "u-4"}, SECRET, SECURE_COOKIE)
    assert session_uid(req(f"{SECURE_COOKIE}={t}", {"x-forwarded-proto": "https"})) == "u-4"
    assert session_uid(req(f"{SECURE_COOKIE}={t}", {"x-forwarded-proto": "http"})) is None


def test_no_uid_is_no_session():
    t = jwe.encode({"sub": "u-5"}, SECRET, COOKIE)
    assert session_uid(req(f"{COOKIE}={t}")) is None


def test_cookie_parser_first_wins_and_decodes():
    assert parse_cookie_header("a=1; a=2; b=%41%42; c=\"q\"; d=%E0%A4%A") == {"a": "1", "b": "AB", "c": "q", "d": "%E0%A4%A"}
