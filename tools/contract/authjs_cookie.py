"""tools/contract/authjs_cookie.py — reads an Auth.js v5 session cookie in Python, the way a FastAPI backend must so that nobody is logged out
at cutover. The cookie (authjs.session-token on http, __Secure-authjs.session-token on https) is a compact JWE:
  alg "dir", enc "A256CBC-HS512", kid = the key's JWK thumbprint (not needed to decrypt);
  key = HKDF-SHA256(ikm=AUTH_SECRET, salt=<cookie name>, info="Auth.js Generated Encryption Key (<cookie name>)", length=64);
  A256CBC-HS512 (RFC 7518 5.2): MAC key = key[:32], AES-256-CBC key = key[32:], tag = HMAC-SHA512(MAC key, AAD || IV || ciphertext ||
  64-bit big-endian bit length of AAD)[:32], AAD = the protected header exactly as sent (base64url).
The payload is the JWT claims: uid (the user id the routes use), sub, email, name, iat, exp, jti. A route then also checks x-jg-uid == uid.
Only `cryptography` is needed. Usage: python authjs_cookie.py <secret> <cookie value> [cookie name]   (prints the claims; exit 1 if invalid)
"""
import base64
import hashlib
import hmac
import json
import sys
import time

from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def derive_key(secret: str, cookie_name: str) -> bytes:
    return HKDF(algorithm=hashes.SHA256(), length=64, salt=cookie_name.encode(),
                info=f"Auth.js Generated Encryption Key ({cookie_name})".encode()).derive(secret.encode())


def decode_session(token: str, secret: str, cookie_name: str = "authjs.session-token", leeway: int = 15) -> dict:
    """The claims of a valid, unexpired session cookie; ValueError otherwise."""
    parts = token.split(".")
    if len(parts) != 5:
        raise ValueError("not a compact JWE")
    h64, ek64, iv64, ct64, tag64 = parts
    header = json.loads(_b64d(h64))
    if header.get("alg") != "dir" or header.get("enc") != "A256CBC-HS512" or ek64:
        raise ValueError(f"unexpected JWE header {header}")
    key = derive_key(secret, cookie_name)
    mac_key, enc_key = key[:32], key[32:]
    aad, iv, ct, tag = h64.encode("ascii"), _b64d(iv64), _b64d(ct64), _b64d(tag64)
    al = (len(aad) * 8).to_bytes(8, "big")
    expect = hmac.new(mac_key, aad + iv + ct + al, hashlib.sha512).digest()[:32]
    if not hmac.compare_digest(expect, tag):
        raise ValueError("bad tag (wrong secret or cookie name)")
    dec = Cipher(algorithms.AES(enc_key), modes.CBC(iv)).decryptor()
    padded = dec.update(ct) + dec.finalize()
    unpad = padding.PKCS7(128).unpadder()
    claims = json.loads(unpad.update(padded) + unpad.finalize())
    if "exp" in claims and claims["exp"] + leeway < time.time():
        raise ValueError("expired")
    return claims


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    try:
        print(json.dumps(decode_session(sys.argv[2], sys.argv[1], sys.argv[3] if len(sys.argv) > 3 else "authjs.session-token")))
    except ValueError as e:
        print(f"invalid: {e}")
        sys.exit(1)
