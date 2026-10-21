"""A small load for the RAM measurement: N requests at concurrency C against a running backend, as a signed-in student.

    DATABASE_URL=... AUTH_SECRET=... .venv/Scripts/python tools/load.py http://127.0.0.1:8107 <student-uid> [N] [C]

The cookie is minted with app.auth.jwe (the secret from the environment, never printed). Prints counts and latency only.
"""
from __future__ import annotations

import asyncio
import statistics
import sys
import time

import httpx

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parents[1]))
from app.auth import jwe  # noqa: E402
from app.auth.session import COOKIE  # noqa: E402
from app.settings import get_settings  # noqa: E402


async def main() -> None:
    base, uid = sys.argv[1], sys.argv[2]
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 2000
    c = int(sys.argv[4]) if len(sys.argv) > 4 else 20
    token = jwe.encode({"uid": uid, "sub": uid}, get_settings().auth_secrets[0], COOKIE)
    paths = sys.argv[5].split(",") if len(sys.argv) > 5 else ["/api/health", "/api/v1/games/me", "/api/v1/family"]
    headers = {"cookie": f"{COOKIE}={token}", "x-jg-uid": uid}
    lat: list[float] = []
    codes: dict[int, int] = {}
    q: asyncio.Queue[int] = asyncio.Queue()
    for i in range(n):
        q.put_nowait(i)

    async def worker(cl: httpx.AsyncClient) -> None:
        while not q.empty():
            i = q.get_nowait()
            t = time.perf_counter()
            r = await cl.get(base + paths[i % len(paths)], headers=headers)
            lat.append((time.perf_counter() - t) * 1000)
            codes[r.status_code] = codes.get(r.status_code, 0) + 1

    t0 = time.perf_counter()
    async with httpx.AsyncClient(timeout=30, limits=httpx.Limits(max_connections=c)) as cl:
        await asyncio.gather(*(worker(cl) for _ in range(c)))
    dt = time.perf_counter() - t0
    lat.sort()
    print(f"{n} requests, concurrency {c}, {dt:.1f}s, {n / dt:.0f} req/s, codes {codes}, "
          f"p50 {statistics.median(lat):.1f} ms, p95 {lat[int(len(lat) * .95)]:.1f} ms")


if __name__ == "__main__":
    asyncio.run(main())
