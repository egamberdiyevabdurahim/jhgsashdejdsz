"""The SQLAlchemy models map the Drizzle-migrated schema exactly: Alembic's autogenerate compare finds no difference
(tables, columns, types, nullability, server defaults, primary keys, foreign keys with ON DELETE, indexes, uniques).
Runs against DATABASE_URL, a database migrated by `npm run db:migrate` (scripts/migrate.mjs) to the Drizzle head."""
from __future__ import annotations

import re

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect

import app.models as models
from app.settings import get_settings


def _sync_url() -> str:
    return re.sub(r"^postgres(ql)?(\+\w+)?://", "postgresql+psycopg://", get_settings().DATABASE_URL)


def _include(obj, name, type_, reflected, compare_to):
    # Drizzle's bookkeeping lives in its own schema (drizzle.__drizzle_migrations); Alembic's own table is ours.
    return not (type_ == "table" and name == "alembic_version")


def test_models_match_the_migrated_schema():
    eng = create_engine(_sync_url())
    try:
        with eng.connect() as conn:
            ctx = MigrationContext.configure(conn, opts={
                "compare_type": True, "compare_server_default": True, "include_object": _include,
            })
            diff = compare_metadata(ctx, models.Base.metadata)
            tables = set(inspect(conn).get_table_names()) - {"alembic_version"}
    finally:
        eng.dispose()
    assert diff == [], "\n".join(map(str, diff[:40]))
    assert tables == set(models.Base.metadata.tables), tables ^ set(models.Base.metadata.tables)


def test_foreign_keys_keep_on_delete():
    fks = [fk for t in models.Base.metadata.tables.values() for fk in t.foreign_key_constraints]
    assert len(fks) > 100
    assert models.Profile.__table__.foreign_key_constraints.pop().ondelete == "CASCADE"
