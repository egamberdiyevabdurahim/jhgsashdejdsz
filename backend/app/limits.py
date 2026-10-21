"""src/server/limits.ts: fixed windows per bucket, in this process's memory (as the Node server does today)."""
from __future__ import annotations

import os
import time
from dataclasses import dataclass

HOUR = 60 * 60 * 1000
MAX_TRACKED = 100_000


@dataclass
class Rule:
    limit: int
    window_ms: int


@dataclass
class _Window:
    count: int
    reset_at: float


_windows: dict[str, _Window] = {}


def env_int(name: str, fallback: int) -> int:
    try:
        n = float(os.environ.get(name, ""))
    except ValueError:
        return fallback
    return int(n) if n > 0 and n != float("inf") else fallback


class LIMITS:
    @staticmethod
    def engine_read() -> Rule:
        return Rule(env_int("RATE_ENGINE_READ_PER_HOUR", 600), HOUR)


def _current(bucket: str, window_ms: int, now: float) -> _Window:
    w = _windows.get(bucket)
    if w is None or w.reset_at <= now:
        if w is None and len(_windows) >= MAX_TRACKED:
            for k in [k for k, v in _windows.items() if v.reset_at <= now]:
                del _windows[k]
            if len(_windows) >= MAX_TRACKED:
                _windows.clear()
        w = _Window(0, now + window_ms)
        _windows[bucket] = w
    return w


def hit(bucket: str, rule: Rule, now: float | None = None) -> bool:
    """Counts one attempt in `bucket`; False once more than `limit` attempts fell in the current window."""
    w = _current(bucket, rule.window_ms, time.time() * 1000 if now is None else now)
    w.count += 1
    return w.count <= rule.limit


def reset_limits() -> None:
    _windows.clear()
