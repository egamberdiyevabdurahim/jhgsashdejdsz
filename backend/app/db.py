"""The async engine and the per-request session (FastAPI dependency `get_db`)."""
from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from .settings import get_settings

_engine: AsyncEngine | None = None
_sessions: async_sessionmaker[AsyncSession] | None = None


def engine() -> AsyncEngine:
    global _engine, _sessions
    if _engine is None:
        s = get_settings()
        # postgres.js (src/db/client.ts) holds up to 10 connections and connects lazily; the same here.
        _engine = create_async_engine(s.async_database_url, pool_size=s.DB_POOL_SIZE, max_overflow=0, pool_pre_ping=False,
                                      pool_recycle=1800)
        _sessions = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


def sessionmaker() -> async_sessionmaker[AsyncSession]:
    engine()
    assert _sessions is not None
    return _sessions


async def dispose() -> None:
    global _engine, _sessions
    if _engine is not None:
        await _engine.dispose()
    _engine = _sessions = None


async def get_db() -> AsyncIterator[AsyncSession]:
    """One session per request; the route commits what it writes (a request that raises is rolled back)."""
    async with sessionmaker()() as s:
        try:
            yield s
        except Exception:
            await s.rollback()
            raise


Db = Annotated[AsyncSession, Depends(get_db)]
