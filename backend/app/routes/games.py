"""src/app/api/v1/games/me/route.ts + src/server/games/results.ts ratingsOf: her chess and checkers ratings against the
computer (0: not rated yet). 404 with GAMES_SERVER off, before anything is read."""
from __future__ import annotations

from fastapi import APIRouter, Request
from sqlalchemy import select
from starlette.responses import Response

from ..auth.session import api_user
from ..db import Db
from ..engine.context import with_student
from ..errors import json
from ..models import GameRating
from ..settings import get_settings

router = APIRouter()

COMPUTER = 1200


def games_server_on() -> bool:
    return get_settings().GAMES_SERVER == "1"


async def ratings_of(db, student_id: str) -> dict[str, int]:
    async with with_student(db, student_id):
        rows = (await db.execute(select(GameRating.kind, GameRating.rating).where(GameRating.student_id == student_id))).all()
    by = {k: r for k, r in rows}
    return {"chess": by.get("chess", 0), "checkers": by.get("checkers", 0)}


@router.get("/api/v1/games/me")
async def games_me(request: Request, db: Db) -> Response:
    if not games_server_on():
        return json({"error": "off"}, 404)
    p = await api_user(request, db, "student")
    return json({"on": True, "ratings": await ratings_of(db, p.user_id), "computer": COMPUTER})
