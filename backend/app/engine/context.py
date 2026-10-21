"""src/server/engine/context.ts withStudent: one transaction per student, serialised on the engine_state row, with the
student's engine rows ensured (engine_state, wallet, dream_build, streak_state: insert ... on conflict do nothing)."""
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import DreamBuild, EngineState, StreakState, Wallet


@asynccontextmanager
async def with_student(db: AsyncSession, student_id: str) -> AsyncIterator[AsyncSession]:
    # loadRulesSnapshot() (the rules cache warm-up before the transaction) is not ported yet: no ported route reads rules.
    if db.in_transaction():  # the reads before it (the profile) ran outside the transaction in Node: end that implicit one
        await db.commit()
    async with db.begin():
        await db.execute(insert(EngineState).values(student_id=student_id).on_conflict_do_nothing())
        await db.execute(select(EngineState.student_id).where(EngineState.student_id == student_id).with_for_update())
        await db.execute(insert(Wallet).values(student_id=student_id).on_conflict_do_nothing())
        await db.execute(insert(DreamBuild).values(student_id=student_id).on_conflict_do_nothing())
        await db.execute(insert(StreakState).values(student_id=student_id).on_conflict_do_nothing())
        yield db
