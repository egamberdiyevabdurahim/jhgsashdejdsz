"""src/app/api/health/route.ts: the app answers and the database is reachable."""
from fastapi import APIRouter
from sqlalchemy import text
from starlette.responses import JSONResponse

from ..db import sessionmaker

router = APIRouter()


@router.get("/api/health")
async def health() -> JSONResponse:
    try:
        async with sessionmaker()() as s:
            await s.execute(text("select 1"))
        return JSONResponse({"ok": True})
    except Exception:
        return JSONResponse({"ok": False}, status_code=503)
