"""The session JWE against @auth/core's own encode/decode (run through node, @auth/core from the legacy checkout's node_modules:
JG_LEGACY_DIR, default the sibling "Jamals Global" folder; this repo has no root node_modules): a cookie the
TypeScript app mints is read by Python for the same user, one Python mints is read by the TypeScript app, and anything
tampered, expired, for another cookie name or under another secret is refused by both."""
from __future__ import annotations

import json
import os
import secrets
import shutil
import subprocess
import time
from pathlib import Path

import pytest

from app.auth import jwe

HERE = Path(__file__).resolve().parent
NODE = shutil.which("node")
SECRET = secrets.token_urlsafe(32)  # a throwaway secret: never the app's AUTH_SECRET
SALT = "authjs.session-token"

NODE_ROOT = Path(os.environ.get("JG_LEGACY_DIR") or HERE.parents[2] / "Jamals Global")
needs_node = pytest.mark.skipif(NODE is None or not (NODE_ROOT / "node_modules" / "@auth" / "core").exists(),
                                reason="node and the legacy checkout's node_modules (JG_LEGACY_DIR) are needed")


def node(*args: str, secret: str = SECRET) -> str:
    r = subprocess.run([NODE, str(HERE / "node" / "authjs_jwt.mjs"), *args], capture_output=True, text=True, encoding="utf-8", timeout=60,
                       env={**os.environ, "JG_TEST_AUTH_SECRET": secret}, cwd=str(NODE_ROOT))
    assert r.returncode == 0, r.stderr[-500:]
    return r.stdout


def flip(token: str, part: int, at: int = 5) -> str:
    p = token.split(".")
    s = p[part]
    c = "A" if s[at] != "A" else "B"
    p[part] = s[:at] + c + s[at + 1:]
    return ".".join(p)


def test_python_roundtrip_and_claims():
    t = jwe.encode({"uid": "u1", "sub": "u1", "email": "a@example.test"}, SECRET, SALT)
    p = jwe.decode(t, [SECRET], SALT)
    assert p["uid"] == "u1" and p["exp"] - p["iat"] == jwe.DEFAULT_MAX_AGE and len(p["jti"]) == 36
    with pytest.raises(jwe.JWEError):
        jwe.decode(t, ["another-secret"], SALT)
    with pytest.raises(jwe.JWEError):
        jwe.decode(t, [SECRET], "__Secure-authjs.session-token")
    for part in (0, 2, 3, 4):
        with pytest.raises(jwe.JWEError):
            jwe.decode(flip(t, part), [SECRET], SALT)
    old = jwe.encode({"uid": "u1"}, SECRET, SALT, max_age=60, now=time.time() - 3600)
    with pytest.raises(jwe.JWEError):
        jwe.decode(old, [SECRET], SALT)
    # within jose's 15 s clock tolerance it still reads
    edge = jwe.encode({"uid": "u1"}, SECRET, SALT, max_age=60, now=time.time() - 70)
    assert jwe.decode(edge, [SECRET], SALT)["uid"] == "u1"


@needs_node
def test_typescript_minted_token_reads_in_python():
    token = {"name": "Oqil", "email": "o@example.test", "sub": "user-123", "uid": "user-123"}
    t = node("encode", SALT, json.dumps(token))
    p = jwe.decode(t, [SECRET], SALT)
    assert {k: p[k] for k in token} == token
    for part in (0, 2, 3, 4):
        with pytest.raises(jwe.JWEError):
            jwe.decode(flip(t, part), [SECRET], SALT)
    # minted for the https cookie: only that name reads it
    ts = node("encode", "__Secure-authjs.session-token", json.dumps(token))
    assert jwe.decode(ts, [SECRET], "__Secure-authjs.session-token")["uid"] == "user-123"
    with pytest.raises(jwe.JWEError):
        jwe.decode(ts, [SECRET], SALT)
    # an expired TypeScript token
    expired = node("encode", SALT, json.dumps(token), "-100")
    with pytest.raises(jwe.JWEError):
        jwe.decode(expired, [SECRET], SALT)


@needs_node
def test_python_minted_token_reads_in_typescript():
    t = jwe.encode({"uid": "user-456", "sub": "user-456", "name": "Rustam Ğ"}, SECRET, SALT)
    p = json.loads(node("decode", SALT, t))
    assert p["uid"] == "user-456" and p["name"] == "Rustam Ğ"
    assert json.loads(node("decode", SALT, flip(t, 3))) is None
    assert json.loads(node("decode", SALT, t, secret="another-secret")) is None
