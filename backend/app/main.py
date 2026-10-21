"""The FastAPI app: `uvicorn app.main:app` (from backend/). Serves the same /api contract as the Next.js routes it ports."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from . import db, errors
from .routes import family, games, health

# next.config.ts headers(): every route. No other CSP directive (D1: the design is the spec).
SECURITY_HEADERS = [
    (b"x-frame-options", b"DENY"),
    (b"content-security-policy", b"frame-ancestors 'none'"),
    (b"x-content-type-options", b"nosniff"),
    (b"referrer-policy", b"strict-origin-when-cross-origin"),
    (b"strict-transport-security", b"max-age=31536000; includeSubDomains"),
    (b"permissions-policy", b"camera=(self), microphone=(self), geolocation=()"),
]


class SecurityHeaders:
    """Pure ASGI (no BaseHTTPMiddleware: it buffers bodies and costs memory per request)."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_with(m: Message) -> None:
            if m["type"] == "http.response.start":
                have = {k.lower() for k, _ in m.get("headers", [])}
                m["headers"] = list(m.get("headers", [])) + [h for h in SECURITY_HEADERS if h[0] not in have]
            await send(m)

        await self.app(scope, receive, send_with)


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await db.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title="Jamals Global API", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    errors.install(app)
    for r in (health.router, family.router, games.router):
        app.include_router(r)
    app.add_middleware(SecurityHeaders)
    return app


app = create_app()
