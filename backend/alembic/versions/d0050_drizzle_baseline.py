"""Baseline: the schema as Drizzle migration 0050_m1_dates_rules left it (drizzle/meta/_journal.json idx 50).

No schema change. upgrade() only checks that the database really is at that Drizzle head (the last applied Drizzle
migration's `created_at` = the journal's `when`), so Alembic is never stamped onto a database the models do not match.
A later Drizzle migration (before cutover) needs: regenerate app/models (tools/gen_models.py) and a new revision here
that records it, with the same check against its journal entry.

Revision ID: d0050
Revises:
Create Date: 2026-10-21
"""
from alembic import op
import sqlalchemy as sa

revision = "d0050"
down_revision = None
branch_labels = None
depends_on = None

DRIZZLE_HEAD_WHEN = 1792474743423   # drizzle/meta/_journal.json: "0050_m1_dates_rules"
DRIZZLE_COUNT = 51


def upgrade() -> None:
    row = op.get_bind().execute(sa.text(
        "select count(*)::int as n, max(created_at)::bigint as last from drizzle.__drizzle_migrations")).one()
    if (row.n, row.last) != (DRIZZLE_COUNT, DRIZZLE_HEAD_WHEN):
        raise RuntimeError(
            f"database is not at Drizzle 0050 (applied {row.n}, last {row.last}); run `npm run db:migrate` at the matching commit first")


def downgrade() -> None:
    pass
