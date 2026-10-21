"""Today's error shapes (src/server/api.ts, src/server/limits.ts): a JSON body `{"error": "<words>"}` with the status, and
`cache-control: no-store` where the TypeScript route used `json()` (src/server/api.ts) rather than a bare `Response.json`.

    raise ApiError(409, {"error": "wrong account"})            # json(): no-store
    raise ApiError(401, {"error": "unauthenticated"}, no_store=False)   # Response.json(): no cache header
    raise ApiError(401, None)                                    # new Response(null, { status: 401 }): empty body
"""
from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse, Response

NO_STORE = {"cache-control": "no-store"}


class ApiError(Exception):
    def __init__(self, status: int, body: Any = None, *, no_store: bool = True, headers: dict[str, str] | None = None):
        super().__init__(status, body)
        self.status, self.body, self.no_store, self.headers = status, body, no_store, headers or {}


def json(body: Any, status: int = 200, *, no_store: bool = True, headers: dict[str, str] | None = None) -> Response:
    """src/server/api.ts json(): JSON.stringify's compact form (Starlette's JSONResponse is the same: no spaces, UTF-8)."""
    return JSONResponse(body, status_code=status, headers={**(NO_STORE if no_store else {}), **(headers or {})})


def too_many() -> Response:
    """src/server/limits.ts tooMany()."""
    return json({"error": "too many"}, 429, no_store=False, headers={"retry-after": "600"})


def too_large() -> Response:
    return json({"error": "too large"}, 413, no_store=False)


def install(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api(_: Request, e: ApiError) -> Response:
        h = {**(NO_STORE if e.no_store else {}), **e.headers}
        if e.body is None:
            return Response(status_code=e.status, headers=h)
        return JSONResponse(e.body, status_code=e.status, headers=h)

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, e: StarletteHTTPException) -> Response:
        words = {404: "not found", 405: "method not allowed"}.get(e.status_code, "error")
        return JSONResponse({"error": words}, status_code=e.status_code, headers=getattr(e, "headers", None))

    @app.exception_handler(RequestValidationError)
    async def _invalid(_: Request, e: RequestValidationError) -> Response:
        # bodyOf() in src/server/api.ts: a body that does not parse is 400 { error: 'invalid' }
        return JSONResponse({"error": "invalid"}, status_code=400, headers=NO_STORE)

    @app.exception_handler(Exception)
    async def _crash(_: Request, e: Exception) -> Response:
        return JSONResponse({"error": "internal"}, status_code=500)
