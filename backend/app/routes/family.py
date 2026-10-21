"""src/app/api/v1/family/route.ts GET + src/server/family.ts (linkedParents, currentFamilyCode).

A student's family link: the parents connected to them and the current invite code (I7). The x-jg-uid header is optional
here (unlike apiUser): absent passes, another account's id is 409.
"""
from __future__ import annotations

import datetime as dt
import secrets

from fastapi import APIRouter, Request
from sqlalchemy import select
from starlette.responses import Response

from ..auth.session import get_profile, session_uid
from ..db import Db
from ..errors import json
from ..jsx import js_iso
from ..models import FamilyCode, FamilyLink, Profile

router = APIRouter()

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
DAY = dt.timedelta(days=1)
CODE_TTL = 3 * DAY


def new_code() -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(8))


async def linked_parents(db, student_id: str) -> list[dict]:
    rows = (await db.execute(
        select(FamilyLink.parent_id, Profile.full_name, Profile.photo_url, FamilyLink.created_at)
        .join(Profile, Profile.user_id == FamilyLink.parent_id)
        .where(FamilyLink.student_id == student_id)
        .order_by(FamilyLink.created_at.asc(), FamilyLink.parent_id.asc())
    )).all()
    return [{"id": r[0], "name": r[1], "photoUrl": r[2], "linkedAt": js_iso(r[3])} for r in rows]


async def current_family_code(db, student_id: str) -> str:
    """One with at least a day left is reused, otherwise a new one valid for three days."""
    now = dt.datetime.now(dt.timezone.utc)
    fresh = (await db.execute(
        select(FamilyCode.code).where(FamilyCode.student_id == student_id, FamilyCode.expires_at > now + DAY)
    )).scalars().first()
    if fresh:
        return fresh
    code = new_code()
    db.add(FamilyCode(code=code, student_id=student_id, expires_at=now + CODE_TTL))
    await db.commit()
    return code


@router.get("/api/v1/family")
async def get_family(request: Request, db: Db) -> Response:
    uid = session_uid(request)
    if not uid:
        return json({"error": "unauthenticated"}, 401, no_store=False)
    claimed = request.headers.get("x-jg-uid")
    if claimed is not None and claimed != uid:
        return json({"error": "wrong account"}, 409)
    p = await get_profile(db, uid)
    if p is None or p.role.value != "student":
        return json({"error": "students only"}, 403, no_store=False)
    parents = await linked_parents(db, uid)
    return json({"parents": parents, "code": await current_family_code(db, uid)})
