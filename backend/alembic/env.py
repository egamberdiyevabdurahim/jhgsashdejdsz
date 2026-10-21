"""Alembic environment (async, asyncpg). Run from backend/: `.venv/Scripts/alembic upgrade head`."""
from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.models import Base
from app.settings import get_settings

VERSION_SCHEMA = "drizzle"   # beside drizzle.__drizzle_migrations: the public schema stays exactly Drizzle's

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata


def _include(obj, name, type_, reflected, compare_to):
    return not (type_ == "table" and name == "alembic_version")


def _configure(connection=None, url=None) -> None:
    context.configure(
        connection=connection, url=url, target_metadata=target_metadata,
        version_table_schema=VERSION_SCHEMA, include_object=_include,
        compare_type=True, compare_server_default=True,
    )


def run_migrations_offline() -> None:
    _configure(url=get_settings().async_database_url)
    with context.begin_transaction():
        context.run_migrations()


def _run(connection) -> None:
    _configure(connection=connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(get_settings().async_database_url)
    async with engine.connect() as conn:
        await conn.run_sync(_run)
        await conn.commit()
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
