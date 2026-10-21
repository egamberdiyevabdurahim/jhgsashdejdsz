"""Regenerates app/models/*.py from a database migrated to the Drizzle head (drizzle/ in the repo root).

    DATABASE_URL=postgresql://...  .venv/Scripts/python tools/gen_models.py [--out app/models]

sqlacodegen reflects the `public` schema (the Drizzle bookkeeping schema `drizzle` is left out), then the declarative
code is split into one module per domain (DOMAINS below; a table missing from it fails the run, so a new Drizzle table
cannot be forgotten). The URL is read from the environment and never printed.
"""
from __future__ import annotations

import argparse
import ast
import os
import re
import sys
from pathlib import Path

from sqlalchemy import MetaData, create_engine
from sqlacodegen.generators import DeclarativeGenerator

# Domain module -> tables. The Drizzle schema files are the first cut (src/db/schema-*.ts, chat-schema.ts); the 71 tables of
# src/db/schema.ts are split by what they serve.
DOMAINS: dict[str, list[str]] = {
    "accounts": ["user", "account", "session", "verificationToken", "password", "profile", "profile_photo", "user_state"],
    "family": ["family_code", "family_link"],
    "ai": ["ai_usage", "ai_consent", "ai_run", "ai_job", "ai_settings", "ai_interpretation"],
    "engine": ["rule_record", "engine_state", "diagnostic_answer", "engine_event", "engine_result", "readiness_snapshot",
               "roadmap", "roadmap_milestone", "roadmap_change", "task_batch", "daily_task", "task_completion",
               "study_session", "brick_entry", "dream_build", "activity_day", "streak_state", "freeze_entry",
               "coin_entry", "wallet", "wallet_backfill", "xp_entry", "milestone_report", "check_run",
               "admission_prediction", "schedule_state"],
    "proofs": ["proof_file", "score_report", "admission_outcome", "outcome_prompt", "staff_checkpoint"],
    "study_together": ["study_invite", "study_pair", "study_consent"],
    "learning": ["learner_skill", "srs_card", "practice_item", "lesson_progress", "homework", "homework_turn",
                 "lesson_skill", "mock_result", "dtm_sitting", "sat_sitting", "writing_piece", "speaking_practice"],
    "video": ["video_source", "video_clip", "video_watch"],
    "games": ["game_result", "game_rating", "game_daily_answer", "game_campus_round"],
    "pay": ["entitlement", "pay_order", "pay_txn", "subscription", "pay_gift", "pay_coupon", "pay_event", "plan_usage"],
    "parent": ["parent_alert", "pledge", "parent_note", "jia_lead"],
    "chat": ["chat", "chat_member", "chat_message", "chat_reaction", "chat_pin", "chat_poll", "chat_poll_vote"],
    "community": ["community_profile", "community_media", "community_post", "community_poll_vote", "community_comment",
                  "community_like", "community_save", "community_view", "community_story", "community_story_view",
                  "community_follow", "community_note"],
    "league": ["league_week", "league_cohort", "league_member", "league_player", "student_motivation", "achievement_award"],
    "moderation": ["staff_member", "moderation_item", "moderation_audit", "report", "user_block", "account_suspension"],
    "core": ["core_deletion_request"],
}
NL = chr(10)
OPTIONS = ["use_inflect", "keep_dialect_types", "nosyntheticenums", "nojoined", "nobidi"]


def sync_url(url: str) -> str:
    return re.sub(r"^postgres(ql)?(\+\w+)?://", "postgresql+psycopg://", url)


def table_of(node: ast.stmt) -> str | None:
    """The table a top-level statement defines: a class with __tablename__, or `t_x = Table('x', ...)`."""
    if isinstance(node, ast.ClassDef):
        for b in node.body:
            if isinstance(b, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "__tablename__" for t in b.targets):
                return ast.literal_eval(b.value)
    if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call) and getattr(node.value.func, "id", "") == "Table":
        return ast.literal_eval(node.value.args[0])
    return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(Path(__file__).resolve().parents[1] / "app" / "models"))
    ap.add_argument("--raw", help="also write sqlacodegen's unsplit output here")
    args = ap.parse_args()
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL is not set")
    engine = create_engine(sync_url(url))
    md = MetaData()
    md.reflect(engine, schema=None)
    code = DeclarativeGenerator(md, engine, OPTIONS).generate()
    engine.dispose()
    if args.raw:
        Path(args.raw).write_text(code, encoding="utf-8", newline=NL)

    tree = ast.parse(code)
    lines = code.splitlines(keepends=True)
    imports: list[str] = []
    base_src = ""
    enums: dict[str, str] = {}
    per_table: dict[str, str] = {}
    for node in tree.body:
        src = "".join(lines[node.lineno - 1: node.end_lineno])
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            imports.append(src)
            continue
        if isinstance(node, ast.ClassDef) and node.name == "Base":
            base_src = src
            continue
        if isinstance(node, ast.ClassDef) and any(ast.unparse(b) == "enum.Enum" for b in node.bases):
            enums[node.name] = src
            continue
        t = table_of(node)
        if t is None:
            sys.exit(f"unrecognised top-level statement at line {node.lineno}")
        per_table[t] = snake_attrs(src)

    where = {t: d for d, ts in DOMAINS.items() for t in ts}
    missing = sorted(set(per_table) - set(where))
    gone = sorted(set(where) - set(per_table))
    if missing or gone:
        sys.exit(f"DOMAINS out of date: not mapped {missing}, not in the database {gone}")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    header = '"""Generated by tools/gen_models.py from the Drizzle-migrated schema; edit the generator, not this file."""\n'
    (out / "base.py").write_text(
        header + "import enum\n\nfrom sqlalchemy.orm import DeclarativeBase\n\n\n" + base_src.rstrip() + "\n\n\n"
        + "\n\n".join(e.rstrip() for e in enums.values()) + "\n", encoding="utf-8", newline=NL)
    for domain, tables in DOMAINS.items():
        body = "\n\n\n".join(per_table[t].rstrip() for t in tables) + "\n"
        used = set(re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", body))
        imps = []
        for i in imports:
            m = re.match(r"from (\S+) import (.+)", i.strip())
            if m:
                names = [n.strip() for n in m.group(2).split(",")]
                keep = [n for n in names if n.split(" as ")[-1] in used and n != "DeclarativeBase"]
                if keep:
                    imps.append(f"from {m.group(1)} import {', '.join(keep)}\n")
            elif i.strip().startswith("import "):
                mod = i.strip().split()[1]
                if mod != "enum" and (mod in used or mod.split(".")[0] in used):
                    imps.append(i if i.endswith("\n") else i + "\n")
        local = ["Base", *sorted(e for e in enums if e in used)]
        imps.append(f"from .base import {', '.join(local)}\n")
        (out / f"{domain}.py").write_text(header + "".join(imps) + "\n\n" + body, encoding="utf-8", newline=NL)
    names = []
    init = [header, f"from .base import Base, {', '.join(enums)}\n" if enums else "from .base import Base\n"]
    for domain in DOMAINS:
        mod = (out / f"{domain}.py").read_text(encoding="utf-8")
        cls = re.findall(r"^class (\w+)\(Base\):", mod, re.M) + re.findall(r"^(t_\w+) = Table\(", mod, re.M)
        names += cls
        init.append(f"from .{domain} import {', '.join(cls)}\n")
    init.append("\n__all__ = " + repr(["Base", *enums, *names]).replace("'", '"') + "\n")
    (out / "__init__.py").write_text("".join(init), encoding="utf-8", newline=NL)
    print(f"{len(per_table)} tables -> {len(DOMAINS)} modules in {out}")


def snake_attrs(src: str) -> str:
    """Auth.js's camelCase columns (userId, emailVerified, ...) as snake_case attributes, the column keeping its real name."""
    for name in sorted(set(re.findall(r"^    ([a-z]+[A-Z]\w*): Mapped\[", src, re.M))):
        snake = re.sub(r"(?<!^)([A-Z])", r"_\1", name).lower()
        src = re.sub(rf"^    {name}: (Mapped\[.*?\]) = mapped_column\(", rf"    {snake}: \1 = mapped_column('{name}', ", src, flags=re.M)
        src = re.sub(rf"(?<!['\"\w]){name}(?![\w'\"])", snake, src)
    return src


if __name__ == "__main__":
    main()
