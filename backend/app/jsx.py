"""What a JSON answer looked like coming out of Node, so a ported route answers byte for byte the same."""
from __future__ import annotations

import datetime as dt


def js_iso(v: dt.datetime | None) -> str | None:
    """Date.prototype.toISOString of a timestamp postgres.js read: UTC, milliseconds (truncated, as V8 parses), 'Z'."""
    if v is None:
        return None
    if v.tzinfo is None:
        v = v.replace(tzinfo=dt.timezone.utc)
    u = v.astimezone(dt.timezone.utc)
    return u.strftime("%Y-%m-%dT%H:%M:%S") + f".{u.microsecond // 1000:03d}Z"
