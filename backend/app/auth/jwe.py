"""Auth.js v5 session JWTs (@auth/core 0.41 jwt.js), byte-compatible both ways.

The session cookie is a compact JWE: alg "dir", enc "A256CBC-HS512" (A256GCM is accepted on decode, as @auth/core does),
the key derived with HKDF-SHA256 from AUTH_SECRET, salt = the cookie name, info = "Auth.js Generated Encryption Key (<salt>)",
and the protected header's `kid` = the RFC 7638 thumbprint of that key (sha512 for the 64-byte key). Claims are checked as
jose's jwtDecrypt does with clockTolerance 15 s: exp and nbf, iat a number.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
import uuid
from typing import Any

from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.hashes import SHA256
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

ALG = "dir"
ENC = "A256CBC-HS512"
CLOCK_TOLERANCE = 15
DEFAULT_MAX_AGE = 30 * 24 * 60 * 60
_KEY_LEN = {"A256CBC-HS512": 64, "A256GCM": 32}


class JWEError(Exception):
    """Any reason a token is not accepted; callers treat it as "no session" (getToken returns null)."""


def b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def unb64url(s: str) -> bytes:
    if any(c not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_" for c in s):
        raise JWEError("not base64url")
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def derived_key(enc: str, secret: str | bytes, salt: str) -> bytes:
    """@auth/core getDerivedEncryptionKey: hkdf("sha256", secret, salt, `Auth.js Generated Encryption Key (${salt})`, len)."""
    if enc not in _KEY_LEN:
        raise JWEError("Unsupported JWT Content Encryption Algorithm")
    ikm = secret.encode("utf-8") if isinstance(secret, str) else secret
    return HKDF(algorithm=SHA256(), length=_KEY_LEN[enc], salt=salt.encode("utf-8"),
                info=f"Auth.js Generated Encryption Key ({salt})".encode("utf-8")).derive(ikm)


def thumbprint(key: bytes) -> str:
    """jose calculateJwkThumbprint({kty: "oct", k}, `sha${bits}`): RFC 7638, members in lexicographic order."""
    canonical = json.dumps({"k": b64url(key), "kty": "oct"}, separators=(",", ":")).encode("ascii")
    h = {256: hashlib.sha256, 384: hashlib.sha384, 512: hashlib.sha512}[len(key) * 8]
    return b64url(h(canonical).digest())


def _cbc_hs512_decrypt(key: bytes, iv: bytes, ct: bytes, tag: bytes, aad: bytes) -> bytes:
    mac_key, enc_key = key[:32], key[32:]
    al = (len(aad) * 8).to_bytes(8, "big")
    want = hmac.new(mac_key, aad + iv + ct + al, hashlib.sha512).digest()[:32]
    if len(iv) != 16 or not hmac.compare_digest(want, tag):
        raise JWEError("decryption failed")
    d = Cipher(algorithms.AES(enc_key), modes.CBC(iv)).decryptor()
    padded = d.update(ct) + d.finalize()
    u = padding.PKCS7(128).unpadder()
    try:
        return u.update(padded) + u.finalize()
    except ValueError as e:
        raise JWEError("decryption failed") from e


def _cbc_hs512_encrypt(key: bytes, iv: bytes, plaintext: bytes, aad: bytes) -> tuple[bytes, bytes]:
    mac_key, enc_key = key[:32], key[32:]
    p = padding.PKCS7(128).padder()
    e = Cipher(algorithms.AES(enc_key), modes.CBC(iv)).encryptor()
    ct = e.update(p.update(plaintext) + p.finalize()) + e.finalize()
    al = (len(aad) * 8).to_bytes(8, "big")
    tag = hmac.new(mac_key, aad + iv + ct + al, hashlib.sha512).digest()[:32]
    return ct, tag


def decode(token: str, secrets: list[str] | str, salt: str, now: float | None = None) -> dict[str, Any]:
    """@auth/core jwt.decode. Raises JWEError for anything jose would refuse."""
    secrets = [secrets] if isinstance(secrets, str) else list(secrets)
    if not token or not secrets:
        raise JWEError("no token")
    parts = token.split(".")
    if len(parts) != 5:
        raise JWEError("Invalid Compact JWE")
    p_header, p_key, p_iv, p_ct, p_tag = parts
    try:
        header = json.loads(unb64url(p_header))
    except (ValueError, UnicodeDecodeError) as e:
        raise JWEError("bad header") from e
    if not isinstance(header, dict):
        raise JWEError("bad header")
    alg, enc, kid = header.get("alg"), header.get("enc"), header.get("kid")
    if alg != ALG or enc not in _KEY_LEN or "zip" in header or "crit" in header:
        raise JWEError("algorithm not allowed")
    if p_key != "":
        raise JWEError("dir takes no encrypted key")
    key = None
    for s in secrets:
        k = derived_key(enc, s, salt)
        if kid is None or kid == thumbprint(k):
            key = k
            break
    if key is None:
        raise JWEError("no matching decryption secret")
    iv, ct, tag, aad = unb64url(p_iv), unb64url(p_ct), unb64url(p_tag), p_header.encode("ascii")
    if enc == "A256CBC-HS512":
        plaintext = _cbc_hs512_decrypt(key, iv, ct, tag, aad)
    else:
        try:
            plaintext = AESGCM(key).decrypt(iv, ct + tag, aad)
        except Exception as e:  # InvalidTag
            raise JWEError("decryption failed") from e
    try:
        payload = json.loads(plaintext)
    except (ValueError, UnicodeDecodeError) as e:
        raise JWEError("payload is not JSON") from e
    if not isinstance(payload, dict):
        raise JWEError("payload is not an object")
    _check_claims(payload, time.time() if now is None else now)
    return payload


def _num(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _check_claims(p: dict[str, Any], now: float) -> None:
    t = int(now)  # jose epoch(): Math.floor(Date.now() / 1000)
    if "iat" in p and not _num(p["iat"]):
        raise JWEError('"iat" claim must be a number')
    if "nbf" in p:
        if not _num(p["nbf"]):
            raise JWEError('"nbf" claim must be a number')
        if p["nbf"] > t + CLOCK_TOLERANCE:
            raise JWEError('"nbf" claim timestamp check failed')
    if "exp" in p:
        if not _num(p["exp"]):
            raise JWEError('"exp" claim must be a number')
        if p["exp"] <= t - CLOCK_TOLERANCE:
            raise JWEError('"exp" claim timestamp check failed')


def encode(token: dict[str, Any], secret: str, salt: str, max_age: int = DEFAULT_MAX_AGE, now: float | None = None) -> str:
    """@auth/core jwt.encode: EncryptJWT(token).setProtectedHeader({alg, enc, kid}).setIssuedAt().setExpirationTime(now + maxAge).setJti(uuid)."""
    t = int(time.time() if now is None else now)
    key = derived_key(ENC, secret, salt)
    header = {"alg": ALG, "enc": ENC, "kid": thumbprint(key)}
    payload = {**token, "iat": t, "exp": t + max_age, "jti": str(uuid.uuid4())}
    p_header = b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    iv = os.urandom(16)
    ct, tag = _cbc_hs512_encrypt(key, iv, json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8"),
                                 p_header.encode("ascii"))
    return ".".join([p_header, "", b64url(iv), b64url(ct), b64url(tag)])
