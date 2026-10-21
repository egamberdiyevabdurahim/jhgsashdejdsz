"""Settings from the environment, under the SAME names the Next.js app reads (.env.example in the repo root).

Locally the root .env.local is read too (as `next dev` does), then backend/.env; real environment variables win.
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(ROOT / ".env.local"), str(ROOT / "backend" / ".env")),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    NODE_ENV: str = "development"
    DATABASE_URL: str = "postgresql://unset@127.0.0.1:1/unset"
    TEST_DATABASE_URL: str | None = None
    # Auth.js v5 (src/auth.ts): AUTH_SECRET (or the legacy NEXTAUTH_SECRET) decrypts the session cookie; AUTH_URL decides
    # its name (https -> "__Secure-authjs.session-token"), exactly as @auth/core's createActionURL + defaultCookies do.
    AUTH_SECRET: str | None = None
    NEXTAUTH_SECRET: str | None = None
    AUTH_URL: str | None = None
    NEXTAUTH_URL: str | None = None
    AUTH_TRUST_HOST: str | None = None
    # Pool size: postgres.js in src/db/client.ts uses max 10.
    DB_POOL_SIZE: int = 10
    # Feature switches the ported routes read (src/server/*/switch.ts): "1" is on.
    GAMES_SERVER: str | None = None
    # Rate limits (src/server/limits.ts): same names and defaults.
    RATE_ENGINE_READ_PER_HOUR: int = 600

    @property
    def auth_secrets(self) -> list[str]:
        s = self.AUTH_SECRET or self.NEXTAUTH_SECRET
        return [s] if s else []

    @property
    def auth_url(self) -> str | None:
        return self.AUTH_URL or self.NEXTAUTH_URL

    @property
    def async_database_url(self) -> str:
        return re.sub(r"^postgres(ql)?(\+\w+)?://", "postgresql+asyncpg://", self.DATABASE_URL)


@lru_cache
def get_settings() -> Settings:
    return Settings()
