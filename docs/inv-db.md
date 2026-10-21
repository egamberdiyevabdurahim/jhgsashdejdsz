# inv-db — the database, and its Python side (DB lane inventory, 21 Oct 2026)

Lane: **db**. Read-only inventory of the Jamals Global apps database and the plan for mapping it from Python (FastAPI +
SQLAlchemy 2.0 + Alembic) with **no schema change at cutover**. Everything below was read from the read-only copy
`C:/Users/PC/jg-plan` (detached at `ddbf9d81`), from `git show`/`git archive` of the branches `m1-main` (tip `8a1582d9`, schema
commit `8ea0ed07`) and `p8-lessons` (production's line, `3c09957e`), and **verified by building all three migration sets on a
throwaway local PostgreSQL 18.6** (scratchpad, port 55432, never a real database) with the repo's own drizzle migrator, then
diffing the drizzle snapshots against the real catalogs. Production itself was not touched.

Citations: `path:line` is in `jg-plan` unless prefixed `m1-main:`.

---

## 0. The numbers (and a correction to the brief)

The brief says "111 tables, 57 SQL migrations". Neither head has exactly that:

| database state | migrations (journal rows) | `public` tables | columns | where |
|---|---|---|---|---|
| **production today** (release `c6b7372f`) | **39** (0000-0038), last `created_at` 1792328320172 | **66** | 689 | `docs/ai/CURRENT_STATE.md:3-11` ("migrations applied (37 → 39)") |
| `jg-plan` = `ddbf9d81` (the copy given to lanes) | 51 (0000-0050) | 113 | 1083 | `drizzle/meta/_journal.json`, `src/db/*.ts` |
| **`m1-main` tip** (`8ea0ed07`, M1b integrated) | **57** (0000-0056), last 1792475103423 | **118** | **1122** | `m1-main:drizzle/meta/0056_snapshot.json` |

Head (`m1-main`, verified on the catalog of a DB built by the real migrator):

| object | count | note |
|---|---|---|
| tables | 118 | all in `public`; plus `drizzle.__drizzle_migrations` |
| columns | 1122 | text 576, timestamptz 212, integer 129, jsonb 74, date 43, boolean 36, double 22, text[] 11, bigint 11, bytea 3, timestamp(no tz) 3, bigserial 1, enum 1 |
| primary keys | 118 | **48 composite**, 70 single-column; no table without a PK |
| foreign keys | 160 | ON DELETE: **134 CASCADE, 23 SET NULL, 3 RESTRICT**; ON UPDATE all NO ACTION; none deferrable; no multi-column FK; 121 point at `"user"(id)`; 3 self-references (`chat_message.reply_to`, `chat.parent_id`, `community_comment.parent_id`) |
| indexes (non-PK) | 111 | 108 declared indexes (38 unique, **16 partial**) + 3 unique constraints (`user_email_unique`, `study_invite_code_hash_unique`, `chat_dm_key_unique`); all btree, no expression index |
| CHECK constraints | 92 | enumerations-as-text, ranges, `octet_length` caps |
| enum types | 1 | `role` = ('student','parent'), used by `profile.role` only (`src/db/schema.ts:4`) |
| sequences / identity | 5 | identity ALWAYS: `pay_order.number` (start 100001), `pay_txn.seq`, `jia_lead.number`; `chat_message.id` bigserial; `drizzle.__drizzle_migrations_id_seq` |
| functions / triggers | 1 / 1 | `admission_prediction_immutable` (`drizzle/0013_p5d_admission_prediction.sql:30-39`) |
| extensions | none | `gen_random_uuid()` used by data migrations is core since PG13 |
| app-side defaults | 45 tables | `id text` PK with no DB default: TS `$defaultFn(() => crypto.randomUUID())` (`src/db/schema.ts:123`, `schema-pay.ts:22`, `schema-moderation.ts:27`, `schema-community.ts:15`, …) |
| NOT NULL timestamptz with no DB default | 30 | the app passes its own clock (`src/server/engine/clock.ts`), tests freeze it |
| seed rows a fresh DB gets from migrations | 62 | `rule_record` 41 (29 current), `ai_settings` 1, `chat` 20 (prod-38 DB: 36 + 1 + 0) |

Wide tables: `daily_task` 31 cols, `admission_prediction` 29, `engine_state` 25, `admission_outcome` 23, `ai_run` 23.

**The full per-table inventory (every column, type, nullability, default, PK, FK + ON DELETE, index, CHECK, the TS definition
line, the migration that created it and which later ones touched it, whether production has it, and which server modules use it)
is Appendix A, generated from the head snapshot and checked against the real catalog.**

---

## 1. How migrations run today

- **Generation:** `npm run db:generate` = `drizzle-kit generate` (`package.json:15`, drizzle-kit ^0.31.11) diffs the TS schema
  (`src/db/schema.ts` re-exports the other `schema-*.ts` and `chat-schema.ts`) against the last `drizzle/meta/NNNN_snapshot.json`
  and writes `drizzle/NNNN_<tag>.sql` + a snapshot + a journal entry. Many migrations are then hand-edited or hand-written
  (data fixes, DO blocks, the trigger, `IF NOT EXISTS`); M1 lanes write "the integrator renumbers"
  (`m1-main:drizzle/0051_m1b_truth.sql:1`), and the integrator rewrote the journal `when`s for 0039-0056 to a synthetic
  `1792474083423 + n·60000` sequence (`m1-main:drizzle/meta/_journal.json`).
- **Running:** `npm start` = `node scripts/migrate.mjs && next start` (`package.json:12`). `scripts/migrate.mjs:1-11` opens a
  postgres.js connection (`max: 1`) and calls drizzle-orm 0.44.7's `migrate()`; the Docker service runs `npm start`
  (`deploy/servercore/docker-compose.yml`, `deploy/servercore/DEPLOY.md:9`). So **migrations run at every container start,
  before the app listens.** Tests do the same against `TEST_DATABASE_URL` (`tests/setup/global.ts:1-5`, `tests/setup/env.ts`).
- **What the migrator actually does** (`node_modules/drizzle-orm/pg-core/dialect.js:44-70`, `migrator.js:16-23`, v0.44.7):
  1. `CREATE SCHEMA IF NOT EXISTS drizzle; CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id serial PK, hash text NOT
     NULL, created_at bigint)`.
  2. Reads **only the newest row** (`order by created_at desc limit 1`).
  3. In **one transaction** runs every journal entry whose `when` (`folderMillis`) is **greater than that row's `created_at`**,
     splitting each file on `--> statement-breakpoint`, then inserts `(sha256(file text), when)`.
  4. Consequences the port must respect: **no advisory lock** (two migrators started together could both apply); **the hash is
     never checked** (an edited, already-applied file is silently ignored); **ordering is by `when`, not by file number** (a
     migration whose `when` is lower than the DB's newest row is skipped forever, which is why lane DBs that ran a lane's own
     numbering can silently miss integrated migrations; production never did); a failed statement rolls back every pending
     migration of that start, and the container then fails to start (exit before `next start`).
  5. Hashes are of the exact file bytes: a CRLF checkout on Windows yields different hashes from production's `git archive`
     (LF). Never use the hash as identity; use `created_at`.
- **Bookkeeping now:** production `drizzle.__drizzle_migrations` holds 39 rows, newest `created_at = 1792328320172`
  (0038, hash `29c5de80…` from the LF bytes). The `m1-main` head will hold 57 rows, newest `1792475103423`.
- **Verified here:** prod-38 → m1-main upgrade applies 0039-0056 in 0.4 s, and its `pg_dump --schema-only` is byte-identical to a
  DB built from empty at 0056 (only the `\restrict` nonce differs). All 57 journal `when`s are strictly increasing.

### 1.1 The 57 migrations

| # | tag | journal `when` | state | creates | alters | data |
|---|---|---|---|---|---|---|
| 0000 | red_quentin_quire | 1790443581496 | prod | account, ai_usage, family_code, family_link, password, profile, session, user_state, user, verificationToken | - | - |
| 0001 | p1_engine | 1790581457533 | prod | activity_day, brick_entry, coin_entry, daily_task, diagnostic_answer, dream_build, engine_event, engine_result, engine_state, freeze_entry, milestone_report, readiness_snapshot, roadmap, roadmap_change, roadmap_milestone, rule_record, streak_state, study_session, task_batch, task_completion, wallet, xp_entry | - | - |
| 0002 | seed_rules | 1790581465833 | prod | - | - | INSERT rule_record (the rules base v1, 25 KB) |
| 0003 | p4a_ai_layer | 1790930035993 | prod | ai_interpretation, ai_job, ai_run, ai_settings | daily_task, engine_result, roadmap_change | - |
| 0004 | p4a_ai_settings_row | 1790930053056 | prod | - | - | INSERT ai_settings (row id 1) |
| 0005 | p4b_cp_uz_v2 | 1790987562721 | prod | - | - | rule_record new version + old `is_current=false` |
| 0006 | p4b_roadmap_lang | 1790994426769 | prod | - | profile | - |
| 0007 | p4c_title_en | 1791022574262 | prod | - | roadmap_milestone | - |
| 0008 | p4c_ai_languages | 1791040793511 | prod | - | ai_settings | UPDATE ai_settings |
| 0009 | p4c_roadmap_written_lang | 1791051622125 | prod | - | roadmap | - |
| 0010 | p4d_us_v2 | 1791057630414 | prod | - | - | rule_record version |
| 0011 | p4g_profile_photo | 1791117343603 | prod | profile_photo | - | - |
| 0012 | p5_check_runs | 1791337222511 | prod | check_run | - | - |
| 0013 | p5d_admission_prediction | 1791349352121 | prod | admission_prediction | - | **plpgsql function + BEFORE UPDATE trigger** |
| 0014 | p5i_outcomes | 1791357536011 | prod | admission_outcome, outcome_prompt, proof_file, score_report, study_invite, study_pair | - | - |
| 0015 | p5_prediction_port | 1791367511754 | prod | - | admission_prediction | - |
| 0016 | p5e_phase_d | 1791376314251 | prod | - | daily_task, engine_state | - |
| 0017 | p5g_strategy | 1791570347059 | prod | - | roadmap | - |
| 0018 | p5h_schedule | 1791572962925 | prod | schedule_state | - | - |
| 0019 | p5h_learner_proof | 1791573471175 | prod | learner_skill, practice_item, srs_card, staff_checkpoint | proof_file (CHECK replaced) | - |
| 0020 | p5x_sat_calendar | 1791601271589 | prod | - | - | INSERT rule_record |
| 0021 | p5y_study_consent | 1791622012781 | prod | study_consent | - | - |
| 0022-0027 | gks/turkiye v2, v3, us_dated, ielts_tashkent | 1791626586179-1791688540198 | prod | - | - | rule_record versions (6 files) |
| 0028 | lessons | 1791816039232 | prod | homework, homework_turn, lesson_progress, lesson_skill | - | - |
| 0029 | ai_usage_lesson | 1791830166596 | prod | - | ai_usage | - |
| 0030 | mock_saturday | 1791885709647 | prod | mock_result | - | - |
| 0031 | parent_alerts | 1791885710647 | prod | parent_alert | - | - |
| 0032 | writing | 1791885711647 | prod | writing_piece | - | - |
| 0033 | lesson_rises | 1791935416047 | prod | - | lesson_skill | - |
| 0034 | dtm_sitting | 1791939416235 | prod | dtm_sitting | - | - |
| 0035 | speaking | 1791939507644 | prod | speaking_practice | - | - |
| 0036 | wallet_backfill | 1791961250116 | prod | wallet_backfill | - | **coin backfill into wallet** (`drizzle/0036_wallet_backfill.sql:19-32`) |
| 0037 | video_lessons | 1792327965130 | prod | entitlement, video_clip, video_source, video_watch | - | - |
| 0038 | sat_sitting | 1792328320172 | prod | sat_sitting | - | - |
| 0039 | m1_mod_moderation | 1792474083423 | jg-plan | account_suspension, moderation_audit, moderation_item, report, staff_member, user_block | - | - |
| 0040 | m1_chatsrv_chats | 1792474143423 | jg-plan | chat, chat_member, chat_message, chat_reaction, chat_pin, chat_poll, chat_poll_vote | - | INSERT chat (global + 6 clubs + 13 topics) |
| 0041 | m1_socsrv_community | 1792474203423 | jg-plan | community_comment, community_follow, community_like, community_media, community_note, community_poll_vote, community_post, community_profile, community_save, community_story, community_story_view, community_view | - | - |
| 0042 | m1_pay_tables | 1792474263423 | jg-plan | pay_coupon, pay_event, pay_gift, pay_order, pay_txn, plan_usage, subscription | - | - |
| 0043 | m1_games_refund | 1792474323423 | jg-plan | - | - | **coin refunds + wallet** (`drizzle/0043_m1_games_refund.sql:13-30`) |
| 0044 | m1_games_server | 1792474383423 | jg-plan | game_campus_round, game_daily_answer, game_rating, game_result | - | - |
| 0045 | m1_league | 1792474443423 | jg-plan | achievement_award, league_cohort, league_member, league_player, league_week | - | DO block: medals from `user_state` (`drizzle/0045_m1_league.sql:63-84`) |
| 0046 | m1_league_motivation | 1792474503423 | jg-plan | student_motivation | - | DO block from `user_state` (`drizzle/0046_m1_league_motivation.sql:19-41`) |
| 0047 | m1_core_reports | 1792474563423 | jg-plan | core_deletion_request | milestone_report | - |
| 0048 | m1_parent_family | 1792474623423 | jg-plan | jia_lead, parent_note, pledge | - | - |
| 0049 | m1_jamol_ai_meter | 1792474683423 | jg-plan | ai_consent | ai_usage | - |
| 0050 | m1_dates_rules | 1792474743423 | jg-plan | - | - | 5 rule_record versions (63 KB, `$jg$…$jg$` quoting, `drizzle/0050_m1_dates_rules.sql:4-34`) |
| 0051 | m1b_truth | 1792474803423 | m1-main | - | milestone_report | **coin take-back** `fix:diagnostic_paid_twice` + wallet |
| 0052 | m1b_family_requests | 1792474863423 | m1-main | family_request, family_notice | - | - |
| 0053 | m1b_pay_fk | 1792474923423 | m1-main | - | pay_order (FKs RESTRICT→SET NULL, `payer_id` nullable, CHECK rewritten) | - |
| 0054 | m1b_safechat_chat_message_review | 1792474983423 | m1-main | - | moderation_item (kind CHECK + `chat_message`) | - |
| 0055 | m1b_safesocial_private_review | 1792475043423 | m1-main | community_avatar | community_profile, moderation_item | UPDATE user_state (privateProfile→true by regexp), bio → bio_pending, DO block on the kind CHECK |
| 0056 | m1b_games_plays | 1792475103423 | m1-main | game_computer, game_play | - | - |

### 1.2 Where the drizzle snapshot is NOT the database (found by the catalog diff)

Anything generated from `drizzle/meta/*_snapshot.json` alone will be wrong in these places. **Generate Python models from the
catalog of a migrated database, not from the snapshot.**

1. `community_avatar` FK is named **`community_avatar_user_id_fkey`** in the DB (inline `REFERENCES` in
   `m1-main:drizzle/0055_m1b_safesocial_private_review.sql`); the snapshot says `community_avatar_user_id_user_id_fk`.
2. `ai_interpretation` PK: snapshot name is 71 characters; Postgres truncated it to
   **`ai_interpretation_student_id_question_id_answer_hash_prompt_ver`** (63).
3. `moderation_item_kind` CHECK: the DB lists `'profile'` right after `'club'` (0055's DO block `replace`s into the existing
   definition); the snapshot appends it last. Same meaning, different text (matters for dump-equality gates).
4. The `admission_prediction_immutable` function + trigger are in no snapshot (hand-written in 0013).
5. **Physical column order** differs from TS/snapshot order in 3 tables (columns added later by `ALTER … ADD COLUMN` sit last):
   `profile` (`roadmap_lang` last), `roadmap_milestone` (`title_en` last), `lesson_skill` (`rises` after `updated_at`).
6. Name collisions to keep: `score_report_status` and `homework_turn_status` are each **both** an index name and a CHECK name.
7. `moderation_audit.target_user_id` and `wallet_backfill.student_id` deliberately have **no FK** (audit and backfill marker
   outlive the person). Do not "fix" them.

---

## 2. Data that lives in migrations

- **The rules base is versioned DB content shipped by migrations**: 0002 (v1 seed), 0005, 0010, 0020, 0022-0027, 0050 each insert
  a new `rule_record(id, version)` and set the old version's `is_current = false`. The engine reads `rule_record where is_current`
  through a 60 s cache (`src/server/engine/context.ts:32-53`), and staff/engine stubs also write rows at runtime (status
  `proposed`, `created_by`). After the handover, **a rules update is an Alembic data revision with the same two statements**.
- **Fixed rows:** `ai_settings` id 1 (0004; `CHECK id = 1`), read by every process every 10 s and flipped by the operator SQL in
  `deploy/servercore/ai-on.sql`, `ai-off.sql`, `ai-master-off.sql`, `ai-check.sql` (those files must keep working unchanged);
  `chat` rows `global`, `club:*`, `club:*:*` (0040).
- **One-off money/data fixes, all idempotent by unique keys:** 0036 (backfill keyed by `wallet_backfill.coin_entry_id`), 0043
  (refunds keyed by `coin_entry (student_id, idem='refund:<id>')`), 0051 (`idem='fix:diagnostic_paid_twice'`, capped by the
  wallet's `CHECK balance >= 0`), 0045/0046 (DO blocks importing `user_state` blobs with `ON CONFLICT DO NOTHING` and per-row
  `EXCEPTION WHEN others THEN CONTINUE`), 0055 (privacy flip on `user_state.value` by regexp).
- A fresh database built only from DDL would be missing the 62 seed rows above; the Alembic baseline must carry them (§5.4).

---

## 3. Transactions, locks and idempotency: the contract the port must keep

During the strangler period **Node and Python write the same rows at the same time**. Every guarantee below is either a database
object (unique index, CHECK, FK, trigger) that protects both stacks automatically, or a lock taken by **identical SQL**. If the
Python side builds a lock key differently (other hash function, other string), the two stacks stop serialising against each other
and the result is double coins, double payments or a broken global AI cap.

### 3.1 Driver-level facts (Node today)

- One postgres.js pool, `max: 10` (`src/db/client.ts:6`), drizzle on top; `chat/*` uses the raw postgres.js `sql` tag and
  `sql.begin` (`src/server/chat/store.ts:358,419,517,542,587,686,724`, `chat/account.ts:21`, `chat/jamol.ts:81`).
- Isolation: the server default (READ COMMITTED) everywhere; no `isolationLevel`, no `statement_timeout`/`lock_timeout`, no
  NOWAIT anywhere (grep).
- Nested `exec.transaction()` on a transaction = **SAVEPOINT** (drizzle). Used by the pay module, whose functions take
  `exec: Exec` = db or tx: e.g. `claimGift` → `schedule()` (`src/server/pay/gifts.ts:45`, `subscriptions.ts:42`),
  `m1-main:src/server/pay/db-store.ts:92,104,135`.
- **Pool-deadlock rule** (`src/server/engine/context.ts:13-15`, `src/server/ailayer/jobs.ts:57-59` (comment at 58)): code holding a transaction
  must never wait for a second pool connection (caches are warmed before `BEGIN`, or read through the same tx). Ten such waits
  emptied the pool once.
- 81 transaction sites on `m1-main` (68 in `jg-plan`), 55 `withStudent` call sites.

### 3.2 The per-student engine lock (the most important one)

`withStudent` (`src/server/engine/context.ts:12-24`): `BEGIN; INSERT engine_state(student_id) ON CONFLICT DO NOTHING;
select 1 from engine_state where student_id=$1 for update; INSERT wallet / dream_build / streak_state … ON CONFLICT DO NOTHING;
fn(tx); COMMIT`. All engine writes for one student are serialised by that row lock. Also taken raw in
`src/server/core/replan.ts:27`. Callers (jg-plan): `ailayer/{change,draft,interpret,plan,result,tasks}.ts`, `checks.ts:855,865`,
`core/{certs,family-data,refund,release}.ts`, `demo.ts`, `engine/{coins,commit,ledger,migrate-p0,parent,projection,snapshot,study,tasks}.ts`,
`games/{campus,daily,results}.ts`, `league/api.ts`, `motivation/api.ts`, `parent/child.ts`, `phase-d/hooks.ts`, `phase-x/review.ts`,
`scripts/ai-backfill.ts`.

### 3.3 The coin ledger (single writer module)

Only `src/server/engine/ledger.ts` writes `coin_entry` and `wallet` at runtime (migrations aside):
- `credit` (`ledger.ts:13-21`): `INSERT coin_entry … ON CONFLICT (student_id, idem) DO NOTHING RETURNING id`; only if a row came
  back, `INSERT wallet … ON CONFLICT (student_id) DO UPDATE SET balance = wallet.balance + $amt`. Unique index `coin_entry_idem`
  is the idempotency key (`schema.ts:282-286`).
- `debit` (`ledger.ts:32-43`): select-then-insert, **race-safe only because callers hold `withStudent`**; the wallet's
  `CHECK balance >= 0` (`wallet_balance_nonneg`) is the backstop.
- `addXp`/`addBricks` (`ledger.ts:44-58`): `ON CONFLICT (student_id, reason, ref) DO NOTHING` on `xp_entry_once` /
  `brick_entry_once`; bricks capped with `least(target, bricks + n)`.
- Invariant asserted by tests: **`wallet.balance = sum(coin_entry.amount)` per student**
  (`tests/unit/engine-server/lessons-test-out.test.ts:28-31`, `p7-unit-test.test.ts:35-38`).

### 3.4 Advisory locks (all transaction-scoped `pg_advisory_xact_lock`) — copy the expression exactly

Two different key functions are in use; `hashtext(k)` (int4) and `hashtextextended(k, 0)` (int8) give **different locks for the
same string**. The function is part of the key.

| key string | function | site |
|---|---|---|
| `ai-usage:<UTC yyyy-mm-dd>` | hashtextextended(·,0) | `src/server/ai.ts:30` (takeQuota), `src/server/jamol/quota.ts:61` (the same key: one lock for both meters) |
| `ai-layer:<UTC day>` | hashtextextended(·,0) | `src/server/ailayer/budget.ts:72` |
| `telegram:<tg id>` | hashtextextended(·,0) | `src/server/users.ts:76` |
| `family:<student id>` | hashtextextended(·,0) | `src/server/family.ts:39`, `m1-main:src/server/family/requests.ts:57` |
| `proof:<student id>` | hashtextextended(·,0) | `src/server/outcomes/scores.ts:28` |
| `community:<uid>` | hashtext | `src/server/community/posts.ts:54` |
| `league:<week>:<tier>:<stage>` | hashtext | `src/server/league/store.ts:65` |
| `league:rollover` | hashtext | `src/server/league/worker.ts:73` (+ row lock on `league_week`, `worker.ts:49`) |
| `jg-games:<uid>:<day>` | hashtext | `src/server/pay/limits.ts:41` |
| `jg-order:<payer>:<student>:<tier>:<period>` | hashtext | `src/server/pay/orders.ts:41` |
| `jg-sub:<student id>` | hashtext | `src/server/pay/subscriptions.ts:43`, `m1-main:src/server/pay/activate.ts:48` |
| `jg-paytx:<order id>` | hashtext | `m1-main:src/server/pay/db-store.ts:93` |

### 3.5 Row locks (`SELECT … FOR UPDATE`)

`check_run` (`src/server/checks.ts:144,150,158,169,352,465,472,616,649,665,868,879`), `homework_turn`
(`lessons/homework.ts:307,352`), `lesson_skill` (`lessons/levels.ts:68`), `lesson_progress` (`lessons/piece.ts:80`),
`speaking_practice` (`lessons/speaking.ts:114`), `writing_piece` (`lessons/writing.ts:198`), `admission_outcome`
(`outcomes/store.ts:48`), `study_pair` (`outcomes/study.ts:151`), `video_watch` (`video/lesson.ts:88`), `league_week`
(`league/worker.ts:49`), `pay_gift` (`pay/gifts.ts:48`), `m1-main:pay/orders.ts:39`, `engine_state` (§3.2).

### 3.6 The durable AI job queue (works across replicas, so across stacks)

- Claim (`src/server/ailayer/jobs.ts:44-55`): `select id, kind from ai_job where (status='queued' and not_before <= $now) or
  (status='running' and lease_until < $now) order by priority, not_before limit 1 for update skip locked`, then `claim = claim+1`,
  lease = step timeout × calls + 60 s.
- Fence (`jobs.ts:60-63`, `ailayer/plan.ts:292`): every final write first does `select 1 from ai_job where id=$1 and claim=$2 and
  status='running' for update` inside the student's lock.
- Enqueue (`ailayer/queue.ts:26`): `ON CONFLICT (student_id, kind, ref) WHERE status in ('queued','running')` — a **partial**
  unique index as the conflict target (`ai_job_live`).
- Budget (`ailayer/budget.ts:71-92`): reservation row in `ai_run` under the day lock; SQLSTATE `23505` on `ai_run_pending` means
  "already in flight".
- The worker starts in-process only with `AI_LAYER=1` (`src/instrumentation.ts`). **During the strangler exactly one stack runs
  the worker** (both are safe by design, but double workers double the spend rate limits and logs).

### 3.7 Idempotency keys enforced by unique indexes (both stacks get them for free)

`coin_entry_idem (student_id, idem)`; `xp_entry_once`, `brick_entry_once`, `freeze_entry_once`; `engine_event_client`,
`task_completion_client`, `chat_message_client` (partial: `client_id is not null`); `study_session_client` and
`study_session_running` (one running session); `daily_task_live_slot` (partial `status <> 'replaced'`); `readiness_period`;
`task_batch_week`; `check_run_once`; `admission_prediction_once`; `proof_file_once (student, kind, sha256)`; `pay_txn_provider_ref
(provider, provider_ref)` and **`pay_txn_order_paid` (partial: one paid, uncancelled txn per order)** (`m1-main:src/server/pay/db-store.ts:1-9`);
`family_request_open`, `core_deletion_request_open`, `staff_checkpoint_open_task`, `chat_league_ref`, `video_clip_piece`/`_whole`;
`user_email_unique`. The 16 partial ones (Appendix B) need `index_where=` in SQLAlchemy `on_conflict_*`.

### 3.8 Code coupled to SQLSTATE codes, constraint names and the trigger

- `23505` + `constraint_name === 'pay_txn_order_paid'` → outcome `order-paid` (`m1-main:src/server/pay/db-store.ts:19-27`).
- `23505` → `handle_taken` 409 (`src/server/community/social.ts:89`); `23505` → `pending` (`src/server/ailayer/budget.ts:92`).
- The trigger raises `P0001 'admission_prediction is immutable…'` on any UPDATE other than setting `frozen_at` once.
- `deletable()` (`m1-main:src/server/core/family-data.ts:180-183`) deletes the user inside a transaction it always rolls back,
  to learn whether a RESTRICT FK (`pay_txn`/`subscription`/`pay_gift` → `pay_order`) would refuse it. Python: same, catching
  `ForeignKeyViolationError`. **Account deletion relies on the 134 CASCADE FKs** (`m1-main:src/server/core/family-data.ts:204`): the Python models must
  not emulate cascades in the ORM (`passive_deletes=True`, no relationship cascades).
- Constraint, index and column names are therefore part of the API between code and DB: **never rename** during the conversion.

### 3.9 LISTEN/NOTIFY (chat real-time)

`src/server/chat/hub.ts:1-64`: every chat write `select pg_notify('jg_chat', $json)`; every process LISTENs (postgres.js
`sql.listen` holds one extra connection) and fans out to its SSE streams. Payload ≤ 7000 bytes, else a `{ref:{type,chatId,id}}`
reference that the receiver loads (`hub.ts:14,57-63`). Because it goes through Postgres, **a Python process that LISTENs on
`jg_chat` and NOTIFYs the same JSON shape interoperates with Node's hub**: a message written by Python reaches a stream served by
Node and vice versa. SSE ids are per-process (`<boot>.<seq>`), so a reconnect that lands on the other stack gets no replay (the
ring is per process); route all `/api/v1/chats/**` streams to one stack at a time.

### 3.10 Two clocks

Most rows are stamped from the app clock (`src/server/engine/clock.ts`, frozen by `setTestNow` in tests): 30 NOT NULL timestamptz
columns have no DB default. Some writes use the DB clock (`now()`): `chat/store.ts:346,410,438,455,479`,
`moderation/review.ts:67`, `moderation/safety.ts:89,98`, `moderation/staff.ts:91,98`, `state.ts:30`, `engine/unproject.ts:28`,
`core/retention.ts:15`, `phase-x/upload.ts:28`. Keep each site's choice. Explicit zones in SQL: `(created_at at time zone
'Asia/Tashkent')::date` (`pay/orders.ts:47`), migrations 0043/0051. No SQL depends on the session `TimeZone` setting today; keep it
that way (and verify production's `SHOW TimeZone`; a fresh `initdb` on this PC picked `Asia/Tashkent`).

### 3.11 Background loops and ops scripts that touch the DB

- In-process: AI worker (`AI_LAYER=1`), League rollover every 10 min (`LEAGUE=1`, `src/server/league/worker.ts`), chat hub
  LISTEN. Host cron (not installed): `deploy/servercore/league-tick.cron`.
- 18 scripts with DB access (`scripts/`): `ai-backfill`, `ai-eval`, `ai-lesson-cost`, `ai-report`, `ai-revoke`, `ai-switch`,
  `cat/export-calibration`, `coins-adjust`, `engine-unproject`, `family-unlink`, `league-tick`, `migrate.mjs`,
  `outcomes/{export-records,lib,mathcheck-export,staff}`, `rules/expiring`, `seed-demo`. DEPLOY.md tells the operator to run
  `npx tsx scripts/ai-switch.ts --notice …` (`deploy/servercore/DEPLOY.md:35,42`): these stay Node until each has a Python twin.
- Rate-limit counters are **in process memory**, not in the DB (`src/server/limits.ts:8-10`): during the strangler each stack has
  its own counters (limits effectively per stack).

---

## 4. The Python side: stack and models

### 4.1 Stack — agree with FastAPI, for database reasons too

- **FastAPI + SQLAlchemy 2.0 (async, asyncpg) + Alembic. Not Django REST**: 48 of 118 tables have composite primary keys; Django
  only gained `CompositePrimaryKey` in 5.2 and still cannot point a ForeignKey at one, its migrations want to own the schema
  (118 `managed = False` models), and its ORM has no first-class `INSERT … ON CONFLICT (cols) WHERE <partial>` or `FOR UPDATE
  SKIP LOCKED` with the precision §3 needs. SQLAlchemy has all of it (`postgresql.insert().on_conflict_do_nothing(index_elements=,
  index_where=)`, `with_for_update(skip_locked=True)`, `Identity(always=True)`, partial `Index(postgresql_where=)`).
- **Plain SQLAlchemy 2.0 declarative (`Mapped[...]`), not SQLModel.** SQLModel fuses table and API models; here the API models
  mirror zod and the table models mirror the catalog, and they differ (dates as strings, JSONB shapes, hidden columns). Keep
  Pydantic v2 for the API, SQLAlchemy for tables.
- **Driver: asyncpg** (`postgresql+asyncpg`). LISTEN via a dedicated raw asyncpg connection (`add_listener`). No pgbouncer, so
  prepared statements are fine.
- Use the ORM classes in **Core style** (`select(Model)`, `insert(Model)…returning()`, `update()`), mirroring drizzle's
  query-builder style 1:1. No `relationship()` with cascades; if relationships are added for reads, `passive_deletes=True`,
  `lazy="raise"`. Sessions with `expire_on_commit=False`, `autoflush=False`.

### 4.2 Generate the models from the catalog, then gate them

1. Build a reference DB on **postgres:16** (production's major) with the real migrator: `node scripts/migrate.mjs` against an
   empty DB (0.8 s).
2. `tools/gen_models.py` reads `information_schema` + `pg_catalog` (columns in **ordinal order**, `pg_get_constraintdef`,
   `pg_get_indexdef`, identity, defaults, enum labels, trigger) and writes one module per TS schema file
   (`api/db/models/{core,chat,community,core_m1,games,league,parent_m1,family_m1b,safesocial_m1b,moderation,pay}.py`), class names
   = the TS export names in PascalCase (`coinEntries` → `CoinEntry`, keep a mapping table in the module docstring for grep).
   sqlacodegen 3.x is an acceptable starting point but must be post-processed for the rules below.
3. Rules the generator must apply:
   - **Every constraint and index carries its explicit DB name** (`PrimaryKeyConstraint(..., name=)`, `ForeignKeyConstraint(...,
     name=, ondelete=)`, `CheckConstraint(sqltext, name=)`, `Index(name, ..., unique=, postgresql_where=text(...))`); no
     `naming_convention` on the MetaData (it would invent names). Include the 4 drifts of §1.2.
   - `server_default=text(<exact pg default>)` for every DB default (`now()`, `false`, `'{}'::text[]`, `'[]'::jsonb`, the
     `ai_settings.allowances` object, `'Asia/Tashkent'`, …); **Python-side `default=lambda: str(uuid.uuid4())`** for the 45
     `id` columns that TS fills with `crypto.randomUUID()` (lower-case hyphenated, same format).
   - Types: `text`→`Text`, `integer`→`Integer`, `bigint`→`BigInteger`, `bigserial`→`BigInteger` + `server_default` nextval,
     identity → `Identity(always=True, start=100001)` / `start=1` (never supply a value on insert), `double precision`→`Double`,
     `boolean`→`Boolean`, `date`→`Date`, `timestamptz`→`DateTime(timezone=True)`, the 3 Auth.js `timestamp` columns →
     `DateTime(timezone=False)` holding **UTC wall-clock** (drizzle `mode:'date'` writes `toISOString()` and reads back as UTC),
     `jsonb`→`JSONB`, `text[]`→`ARRAY(Text)`, `bytea`→`LargeBinary`, `role`→`ENUM('student','parent', name='role',
     create_type=False)`.
   - Quoted identifiers as they are: table `"user"`, `"verificationToken"`; columns `"userId"`, `"providerAccountId"`,
     `"sessionToken"`, `"emailVerified"` (Auth.js adapter shapes, `src/db/schema.ts:6-36`).
   - The trigger and function as `DDL` attached with `event.listen(AdmissionPrediction.__table__, "after_create", …)` so
     `metadata.create_all()` reproduces the catalog exactly.
4. Gate it (§6, G1): `create_all()` on an empty postgres:16 must give a `pg_dump --schema-only` identical to the reference DB.

### 4.3 Driver parity: what postgres.js/drizzle return vs asyncpg/SQLAlchemy

| value | Node today | Python default | rule for the port |
|---|---|---|---|
| `date` | `'YYYY-MM-DD'` string (`date(..., {mode:'string'})`, `schema.ts:122`) | `datetime.date` | keep `date` inside; serialize as `YYYY-MM-DD` at the API edge; string comparisons in TS (`r.endsOn > s`) equal date comparisons |
| `timestamptz` | JS `Date`, **ms** precision; API emits `toISOString()` `…T..:..:..mmmZ` | aware `datetime`, **µs** | app clock returns ms-truncated UTC; serialize with ms + `Z`; build cursors from ms values |
| `bigint` (mode number), `count(*)`, `sum()` | number / **string** (postgres.js returns int8 as string; code calls `Number()`) | `int` | fine; never emit int8 as JSON string unless the TS route did |
| `double precision` | number; `JSON.stringify(1)` → `1` | `float`; `json.dumps(1.0)` → `1.0` | JS-compatible JSON encoder (integral floats as ints) for API bodies **and** jsonb writes |
| `jsonb` writes | `JSON.stringify` drops `undefined` keys; `Date` → ISO ms Z | `None` → `null`; datetime fails | drop `None` where TS had `undefined`; datetime → ISO ms Z; one shared encoder |
| text holding JSON (`user_state.value`) | stored verbatim from the page | — | **never parse and re-serialize**; store the received string byte for byte (0055 regexps it) |
| stored hashes (`ai_run.input_hash`, `ai_interpretation.answer_hash`, `daily_task.constraints_hash`/`ai_input_hash`, `writing`/`speaking` hashes) | `canon()` = sorted-key JSON via `JSON.stringify` (`src/server/ailayer/canon.ts:4-10`), or plain `JSON.stringify` (`lessons/writing.ts:125`, `lessons/speaking-voice.ts:178`) | — | port `canon`/`js_json` with JS number and string escaping rules; golden-test against TS on fixtures (a mismatch silently misses the AI reuse cache = extra spend, or duplicates a pending run) |
| engine hashes (`src/engine/util.ts:2-4` `hash`, `fnv1a` over UTF-16 `charCodeAt`) | — | — | engine lane: iterate UTF-16 code units (`s.encode('utf-16-le')`), mask to 32 bits |
| `text[]` | JS array | `list` | assign new lists (no in-place mutation tracking) |
| `bytea` | `Buffer` | `bytes` | — |
| errors | `e.code`, `e.constraint_name` | `asyncpg.exceptions.UniqueViolationError` etc. (`.sqlstate`, `.constraint_name`) wrapped in `sqlalchemy.exc.IntegrityError.orig` | one helper `pg_error(e) -> (sqlstate, constraint)` |

### 4.4 Primitives the DB lane ships for the domain lanes (`api/db/`)

- `engine.py`: async engine, `pool_size` per §6 budget, `application_name='jg-api'`, JS-compatible `json_serializer`; no
  `server_settings` that change `TimeZone` or isolation.
- `clock.py`: `now()` (ms-truncated aware UTC), `set_test_now()`, `local_date_of(instant, tz)`; ISO formatter like JS.
- `tx.py`: `transaction(exec)` = `begin()` on a fresh session or `begin_nested()` (SAVEPOINT) when `exec` is already in one —
  the drizzle `Exec` pattern.
- `locks.py`: `xact_lock(s, key, fn: Literal['hashtext','hashtextextended'])` executing exactly
  `select pg_advisory_xact_lock(hashtext(:k))` / `…(hashtextextended(:k, 0))`, plus a typed constant per row of §3.4 so key
  strings are built in one place.
- `student.py`: `with_student(student_id, fn)` reproducing `context.ts:12-24` statement for statement, warming the rules cache
  **before** `BEGIN`.
- `ledger.py`: `credit`, `credit_at`, `debit`, `add_xp`, `add_bricks`, `crack`, `adjust_coins` — `ledger.ts` line for line.
- `ai_jobs.py`: `claim_next`, `still_mine`, `settle`, `defer` with the same SQL text as `ailayer/jobs.ts`.
- `notify.py`: LISTEN/NOTIFY bridge on `jg_chat`, same payload JSON and 7000-byte ref fallback.
- `errors.py`: SQLSTATE/constraint helpers (§3.8).
- `head_guard.py`: at startup, readiness fails unless the DB is at the head the models were generated for (§5.3).

Sketch of the one that matters most:

```python
async def with_student(student_id: str, fn):
    await rules.load_snapshot()                       # context.ts:13-15: warm before taking the tx connection
    async with SessionLocal() as s, s.begin():
        await s.execute(pg_insert(EngineState).values(student_id=student_id).on_conflict_do_nothing())
        await s.execute(text("select 1 from engine_state where student_id = :sid for update"), {"sid": student_id})
        for M in (Wallet, DreamBuild, StreakState):
            await s.execute(pg_insert(M).values(student_id=student_id).on_conflict_do_nothing())
        return await fn(s)
```

---

## 5. Alembic, the baseline, and one owner of migrations at a time

### 5.1 Recommended order of events

0. **Decide what production's head is before Python reads it.** Today prod is at 0038 (66 tables); every M1/M1b table (52) exists
   only in branches. Recommended: deploy 0039-0056 under Drizzle first (already verified to apply on a prod-shaped DB), so the
   Python models and the baseline are generated once, at 0056. Otherwise generate at 0038 and regenerate later (cheap, but
   every lane must then avoid M1 tables).
1. **Stage A — Drizzle owns, Python reads and writes, never migrates.** Python runs with models generated from a drizzle-built
   DB at head H. Schema changes, if any are unavoidable, go TS schema → `drizzle-kit generate` → regenerate Python models → G1.
   Python's readiness check refuses traffic until `max(created_at)` in `drizzle.__drizzle_migrations` ≥ H's `when`, so a
   Python container started before Node migrated never serves a half-migrated DB.
2. **Handover release (one release, no downtime).** Preconditions: prod at H; owner-approved read-only catalog check of prod equals
   the reference (G3); fresh `pg_dump` taken (DEPLOY.md step 4). In the same release:
   - add Alembic with the baseline revision `b0000_drizzle_<H>` (§5.4) and run `alembic upgrade head` (it detects the drizzle
     bookkeeping at H and only records itself);
   - change Node's `start` to `next start` and make `scripts/migrate.mjs` refuse to run (print "migrations are owned by Alembic
     since <date>, revision b0000"), remove `db:generate`; freeze `drizzle/` and `drizzle/meta/` (history only);
   - point `tests/setup/global.ts` at `alembic upgrade head` for the TS suite.
3. **Stage B — Alembic owns; both stacks still run.** Expand-only migrations: new tables; new columns nullable or with a server
   default; new indexes `CONCURRENTLY` in a non-transactional revision when the table is large; no rename, drop, type change or
   tightened CHECK/NOT NULL on anything Node still reads or writes. Node's TS schema gets a matching hand edit only for tables Node
   still touches (drizzle selects named columns only, so unknown new columns are invisible to it; an INSERT omitting a new NOT NULL
   column without default would fail, hence the rule).
4. **Stage C — Node retired.** Contract migrations allowed. Keep the `drizzle` schema and its table forever (tiny; it is what makes
   an old Node release's `migrate.mjs` a no-op on rollback).

Rollback at every stage stays DEPLOY.md's: point `app` back, restore the dump only if a release ran a non-additive migration.
Because Stage B is additive-only, rolling the Python service back never needs a DB restore.

### 5.2 Alembic configuration

- `alembic/env.py` (async): `connection.run_sync(do_run_migrations)`; `version_table_schema="alembic"` (create the schema in the
  baseline), so the `public` table count that releases check ("pg_restore -l reads it, N tables", `CURRENT_STATE.md:8`) does not
  change; `transaction_per_migration=False` (all pending in one transaction, as drizzle does); take a session lock
  `select pg_advisory_lock(hashtext('jg-migrations'))` around the run (drizzle had none).
- Who runs it: the Python service's entrypoint, `alembic upgrade head && uvicorn …`, mirroring `npm start`. With more than one
  worker process, migrate once in the entrypoint, before workers fork.
- `compare_type=True`, `compare_server_default=True`, `include_object` excluding the `drizzle` and `alembic` schemas, for
  autogenerate (used only to draft revisions; every revision is reviewed SQL).
- Data revisions (rules base versions, fixes) keep the house style: idempotent by a unique key, `RETURNING`-driven wallet moves,
  a `payload` that names the revision.

### 5.3 Head guard (runs in both stages)

```python
EXPECTED_DRIZZLE_WHEN = 1792475103423     # 0056; or 1792328320172 if generated at 0038
async def head_ok(conn) -> bool:
    if await conn.scalar(text("select to_regclass('alembic.alembic_version')")):   # Stage B/C
        return await conn.scalar(text("select version_num from alembic.alembic_version")) in KNOWN_REVISIONS
    last = await conn.scalar(text("select max(created_at) from drizzle.__drizzle_migrations"))
    return last is not None and int(last) >= EXPECTED_DRIZZLE_WHEN
```

### 5.4 The baseline revision: detect, or build

`b0000_drizzle_<H>.upgrade()`:
1. If `drizzle.__drizzle_migrations` exists: require `max(created_at) == <H when>` (count as a sanity check, not identity —
   hashes differ between CRLF and LF checkouts), then **do nothing** (production, staging, any drizzle-built DB). This replaces a
   manual `alembic stamp`: one start command everywhere.
2. Else, if `public` has no tables (fresh test/dev DB): execute `baseline/schema.sql` (a normalized `pg_dump --schema-only` of the
   postgres:16 reference DB at H, trigger included), `baseline/seed.sql` (`pg_dump --data-only -t rule_record -t ai_settings -t
   chat`), and **create `drizzle.__drizzle_migrations` with the same H rows** (hash, created_at) so an old Node release's
   `migrate.mjs` sees head and does nothing.
3. Else refuse (a half-built DB).
`downgrade()` raises.

---

## 6. Parity strategy (DB lane gates; all automated, all on postgres:16)

- **G1 schema equality.** Three databases from empty: A = drizzle migrator (until handover) / Alembic (after); B = SQLAlchemy
  `metadata.create_all()` + DDL events; C = `alembic upgrade head`. Normalized `pg_dump --schema-only` (drop comments and the
  `\restrict` nonce) must be identical for A, B, C; plus a catalog fingerprint (ordinal column order, `pg_get_constraintdef`,
  `pg_get_indexdef`, identity, defaults, enum labels, trigger). Runs in CI on every change to models or migrations; ~5 s.
- **G2 seed equality.** `rule_record`, `ai_settings`, `chat` rows identical between A and C (ordered `COPY`).
- **G3 production drift check** (read-only, owner OK each time): restore the release-time `pg_dump` (DEPLOY.md step 4 already makes
  one) into a local postgres:16 and fingerprint it against A at the same head; also read `SHOW TimeZone`, `SHOW max_connections`,
  `select count(*), max(created_at) from drizzle.__drizzle_migrations`. Must pass before the handover release.
- **G4 type round-trip, both directions.** For every table, generate a fixture row from the catalog, insert with Python, read with a
  tiny TS drizzle script, compare field by field (dates as strings, int8, jsonb incl. `undefined`/`null`, `text[]`, `bytea`,
  ms timestamps); then the reverse.
- **G5 invariants** (SQL assertions after every cross-stack test, and on each restored prod dump): `wallet.balance =
  sum(coin_entry.amount)` per student; no duplicate `(student_id, idem)`; ≤ 1 running `study_session` per student; ≤ 1 paid,
  uncancelled `pay_txn` per order; ≤ 1 live `ai_job` per (student, kind, ref); every `wallet` has an `engine_state`; the trigger
  still refuses an UPDATE of a logged prediction.
- **G6 cross-stack races.** Node and Python hitting the same key at once against one test DB: N parallel `credit`s with one `idem`
  split across stacks → exactly one entry and one wallet move; `takeQuota` at the global cap from both stacks → exact cap;
  concurrent password sign-up with one e-mail; concurrent Telegram upsert; gift claimed twice; Payme `perform` twice; two AI
  workers claiming → each job once; League rollover from both → the week closed once.
- **G7 golden write-sets** (harness by this lane, run by the domain lanes): on a test DB, a test-only audit trigger records
  `(table, op, row)` for every write; run each of the 184 DB-using TS test files' scenarios through Node and through Python and
  compare the normalized write-sets (ids and timestamps mapped). Never installed on production.
- Connection budget (verify `max_connections` first; the Postgres is shared with other sites): Node 10 + LISTEN 1 + migrate 1;
  Python pool 8 + LISTEN 1 per process, at most 2 processes → ≤ 31 for jgapps. Distinguish them with `application_name`.

---

## 7. Hard parts

1. **Two stacks, one set of rows, at the same time.** Every serialisation point (one row lock, 12 advisory-lock key shapes at 15 sites over two hash
   functions, 29 `FOR UPDATE` sites on m1-main, one `SKIP LOCKED` queue with a claim fence, savepoints) must be the same SQL on both sides, or
   coins, payments and the global AI cap break silently. The `debit` path is only safe under the student lock.
2. **Migration ownership handover.** Drizzle's migrator has no lock, no hash check, orders by `when`, and runs at every Node start;
   it must be disabled in the same release that baselines Alembic, and the baseline must also seed the drizzle bookkeeping so old
   releases stay harmless.
3. **Three different "current" schemas** (prod 66 tables at 0038, jg-plan 113 at 0050, m1-main 118 at 0056). The baseline head
   is a deploy decision, not a code decision.
4. **The snapshot is not the database** (4 drifts + physical column order in 3 tables): models must come from the catalog and be
   proven by dump equality.
5. **Driver semantics** (dates as strings, ms vs µs, JSON number formatting, `undefined` vs `null`, int8 as string, verbatim
   `user_state.value`, canonical JSON for stored hashes): each is invisible in unit tests and visible in data.
6. **Seeds and money fixes live inside DDL migrations**; a fresh Python-built DB without them has no rules base and no chat rooms.
7. **Names are an API**: SQLSTATE + constraint-name branches and the trigger mean nothing may be renamed.
8. **Real-time across stacks** works only through `jg_chat` with the same payload contract; SSE replay is per process.
9. **Pool discipline**: never wait for a second connection while holding a transaction (an incident already happened once in Node).

---

## 8. Estimate (DB lane only; one agent ≈ 8 focused hours)

| work | agent-days |
|---|---|
| Catalog-driven model generator, 118 models in 11 modules, DDL events, G1 + G2 in CI on postgres:16 | 1.5 |
| Engine/session/clock/JSON/canon/error primitives with golden tests against TS (§4.3, §4.4) | 1.0 |
| Concurrency primitives: `with_student`, ledger, `locks.py`, savepoint helper, quota/budget, AI job claim/fence | 1.5 |
| LISTEN/NOTIFY bridge interoperating with Node's hub | 0.5 |
| Alembic: env.py, baseline detect-or-build with seeds + drizzle bookkeeping, head guard, handover rehearsal on a restored prod dump | 1.5 |
| Cross-stack harness: G4 round-trip, G5 invariants, G6 race tests, G7 audit-trigger write-set recorder | 1.5 |
| 18 DB scripts ported (or wrapped), ops SQL re-checked against the models | 1.0 |
| **Total** | **8.5** (range 7-11) |

Not included: porting the ~29k lines of services that use these primitives (domain lanes), running G7 per domain, and the owner's
production checks (G3), which need his OK and a few minutes of his time.

---

## 9. Open questions for the controller / owner

1. Deploy M1 + M1b (0039-0056, 52 new tables, money fixes 0043/0051, privacy flip 0055) to production **before** the conversion
   starts, so the Python baseline is 0056? (Recommended.)
2. Handover timing: at the first Python production release (recommended: all new schema work is Python-side from then) or at Node
   retirement?
3. OK to run the read-only G3 checks on production (catalog dump from the release backup, `SHOW TimeZone`, `SHOW max_connections`)?
4. In-memory rate limits become per stack during the strangler; accept, or move them to a table first?

---

## Appendix B. The 16 partial indexes (conflict targets need `index_where`)

| table | index | columns | WHERE |
|---|---|---|---|
| ai_job | UNIQUE ai_job_live | student_id, kind, ref | status in ('queued','running') |
| ai_job | ai_job_student_live | student_id | status in ('queued','running') |
| ai_run | UNIQUE ai_run_pending | student_id, kind, input_hash, prompt_version | status = 'pending' |
| chat_message | UNIQUE chat_message_client | sender_id, client_id | client_id is not null |
| chat | UNIQUE chat_league_ref | ref | kind = 'league' |
| core_deletion_request | UNIQUE core_deletion_request_open | student_id | state = 'open' |
| daily_task | UNIQUE daily_task_live_slot | student_id, date, slot | status <> 'replaced' |
| engine_event | UNIQUE engine_event_client | student_id, client_id | client_id is not null |
| pay_txn | UNIQUE pay_txn_order_paid | order_id | paid_at is not null and cancelled_at is null |
| readiness_snapshot | UNIQUE readiness_period | student_id, kind, local_date | kind <> 'rescore' |
| staff_checkpoint | UNIQUE staff_checkpoint_open_task | student_id, task_id | status = 'open' and task_id is not null |
| study_session | UNIQUE study_session_running | student_id | status = 'running' |
| task_completion | UNIQUE task_completion_client | student_id, client_id | client_id is not null |
| video_clip | UNIQUE video_clip_piece | lesson_id, piece_n | kind = 'clip' |
| video_clip | UNIQUE video_clip_whole | lesson_id | kind = 'whole' |
| family_request | UNIQUE family_request_open | student_id, parent_id | state = 'pending' |

## Appendix C. Reproducing this inventory

- Migration sets: `git -C C:/Users/PC/jg-plan archive <m1-main|p8-lessons|HEAD> drizzle | tar -x -C <scratch>`.
- Build: `initdb` a scratch cluster, then the repo's migrator via drizzle-orm 0.44.7 (`migrate(drizzle(sql), {migrationsFolder})`).
- Drift: compare `drizzle/meta/0056_snapshot.json` with `information_schema.columns`, `pg_indexes`, `pg_constraint`; column order
  from `ordinal_position`.
- Appendix A was generated from the 0056 snapshot + `git grep -n "pgTable('"` on `HEAD` and `m1-main` + each migration's
  `CREATE TABLE`/`ALTER TABLE`, with the catalog drifts of §1.2 written in. "Used by" counts non-test files on `m1-main` that import
  the table from `@/db/*` or name it in raw SQL.

---

## Appendix A. Every table (head = m1-main 0056; 118 tables, 1122 columns)

Legend: "created" = first migration that creates it; "touched later by" = later migrations that alter, index, insert into or update
it; "prod ✓" = exists in production today (0038). `*(app: uuid4)*` = no DB default; the app supplies `crypto.randomUUID()`. Column order below is the TS/snapshot order; the physical
order differs in `profile`, `roadmap_milestone` and `lesson_skill` (§1.2 item 5). Constraint texts are drizzle's; the DB stores the
normalized form (`= ANY (ARRAY[...])`).

### Identity and Auth.js (8)

#### `user` — `users` · jg-plan `src/db/schema.ts:7` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| name | text | Text | null |  |
| email | text | Text | null |  |
| emailVerified | timestamp | DateTime (naive, UTC) | null |  |
| image | text | Text | null |  |

- PK: id
- UNIQUE constraint: `user_email_unique` (email)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 7 non-test file(s) on m1-main: src/auth.ts, src/server/core, src/server/family, src/server/moderation, src/server/users.ts, src/server/video

#### `account` — `accounts` · jg-plan `src/db/schema.ts:14` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| userId | text | Text | NOT NULL |  |
| type | text | Text | NOT NULL |  |
| provider | text | Text | NOT NULL |  |
| providerAccountId | text | Text | NOT NULL |  |
| refresh_token | text | Text | null |  |
| access_token | text | Text | null |  |
| expires_at | integer | Integer | null |  |
| token_type | text | Text | null |  |
| scope | text | Text | null |  |
| id_token | text | Text | null |  |
| session_state | text | Text | null |  |

- PK: (provider, providerAccountId) `account_provider_providerAccountId_pk`
- FK: userId → user.id ON DELETE CASCADE (`account_userId_user_id_fk`)
- Used by 2 non-test file(s) on m1-main: src/auth.ts, src/server/users.ts

#### `session` — `sessions` · jg-plan `src/db/schema.ts:27` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **sessionToken** (PK) | text | Text | NOT NULL |  |
| userId | text | Text | NOT NULL |  |
| expires | timestamp | DateTime (naive, UTC) | NOT NULL |  |

- PK: sessionToken
- FK: userId → user.id ON DELETE CASCADE (`session_userId_user_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/auth.ts

#### `verificationToken` — `verificationTokens` · jg-plan `src/db/schema.ts:32` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| identifier | text | Text | NOT NULL |  |
| token | text | Text | NOT NULL |  |
| expires | timestamp | DateTime (naive, UTC) | NOT NULL |  |

- PK: (identifier, token) `verificationToken_identifier_token_pk`
- Used by 1 non-test file(s) on m1-main: src/auth.ts

#### `profile` — `profiles` · jg-plan `src/db/schema.ts:39` · created `0000` · touched later by 0001, 0006 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **user_id** (PK) | text | Text | NOT NULL |  |
| role | role | ENUM role | NOT NULL |  |
| full_name | text | Text | NOT NULL |  |
| first_name | text | Text | NOT NULL |  |
| last_name | text | Text | NOT NULL | '' |
| photo_url | text | Text | null |  |
| locale | text | Text | NOT NULL | 'en' |
| roadmap_lang | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| timezone | text | Text | NOT NULL | 'Asia/Tashkent' |
| demo | boolean | Boolean | NOT NULL | false |

- PK: user_id
- FK: user_id → user.id ON DELETE CASCADE (`profile_user_id_user_id_fk`)
- Used by 67 non-test file(s) on m1-main: src/app/api/v1, src/app/staff/core, src/server/ailayer, src/server/boot.ts, src/server/chat, src/server/checks.ts, src/server/community, src/server/core +21 more

#### `password` — `passwords` · jg-plan `src/db/schema.ts:55` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **user_id** (PK) | text | Text | NOT NULL |  |
| hash | text | Text | NOT NULL |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: user_id
- FK: user_id → user.id ON DELETE CASCADE (`password_user_id_user_id_fk`)
- Used by 2 non-test file(s) on m1-main: src/server/demo.ts, src/server/users.ts

#### `profile_photo` — `profilePhotos` · jg-plan `src/db/schema.ts:66` · created `0011` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **user_id** (PK) | text | Text | NOT NULL |  |
| mime | text | Text | NOT NULL |  |
| bytes | bytea | LargeBinary | NOT NULL |  |
| width | integer | Integer | NOT NULL |  |
| height | integer | Integer | NOT NULL |  |
| version | text | Text | NOT NULL |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: user_id
- FK: user_id → user.id ON DELETE CASCADE (`profile_photo_user_id_user_id_fk`)
- CHECK: `profile_photo_mime`: "mime" in ('image/jpeg', 'image/png', 'image/webp'); `profile_photo_size`: octet_length("bytes") between 1 and 102400
- Used by 5 non-test file(s) on m1-main: src/server/community, src/server/photo.ts

#### `user_state` — `userState` · jg-plan `src/db/schema.ts:80` · created `0000` · touched later by 0055 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| user_id | text | Text | NOT NULL |  |
| key | text | Text | NOT NULL |  |
| value | text | Text | NOT NULL |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (user_id, key) `user_state_user_id_key_pk`
- FK: user_id → user.id ON DELETE CASCADE (`user_state_user_id_user_id_fk`)
- Used by 14 non-test file(s) on m1-main: src/server/achievements, src/server/boot.ts, src/server/chat, src/server/checks.ts, src/server/community, src/server/engine, src/server/games, src/server/league +4 more


### Family and parent (9)

#### `family_code` — `familyCodes` · jg-plan `src/db/schema.ts:86` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **code** (PK) | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| expires_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: code
- FK: student_id → user.id ON DELETE CASCADE (`family_code_student_id_user_id_fk`)
- Indexes: `family_code_student` (student_id)
- Used by 1 non-test file(s) on m1-main: src/server/family.ts

#### `family_link` — `familyLinks` · jg-plan `src/db/schema.ts:92` · created `0000` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| parent_id | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (parent_id, student_id) `family_link_parent_id_student_id_pk`
- FK: parent_id → user.id ON DELETE CASCADE (`family_link_parent_id_user_id_fk`); student_id → user.id ON DELETE CASCADE (`family_link_student_id_user_id_fk`)
- Indexes: `family_link_student` (student_id)
- Used by 15 non-test file(s) on m1-main: src/app/api/v1, src/server/boot.ts, src/server/community, src/server/core, src/server/demo.ts, src/server/engine, src/server/family, src/server/family.ts +5 more

#### `family_request` — `familyRequests` · m1-main `src/db/schema-m1b-family.ts:14` (not in jg-plan) · created `0052` · touched later by - · prod ✗, jg-plan ✗ (m1-main 0051-0056 only)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| parent_id | text | Text | NOT NULL |  |
| state | text | Text | NOT NULL | 'pending' |
| decided_by | text | Text | null |  |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`family_request_student_id_user_id_fk`); parent_id → user.id ON DELETE CASCADE (`family_request_parent_id_user_id_fk`); decided_by → user.id ON DELETE SET NULL (`family_request_decided_by_user_id_fk`)
- Indexes: `family_request_student` (student_id, state); `family_request_parent` (parent_id, state); UNIQUE `family_request_open` (student_id, parent_id) WHERE "state" = 'pending'
- CHECK: `family_request_state`: "state" in ('pending', 'approved', 'refused')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 1 non-test file(s) on m1-main: src/server/family

#### `family_notice` — `familyNotices` · m1-main `src/db/schema-m1b-family.ts:25` (not in jg-plan) · created `0052` · touched later by - · prod ✗, jg-plan ✗ (m1-main 0051-0056 only)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| user_id | text | Text | NOT NULL |  |
| student_id | text | Text | null |  |
| kind | text | Text | NOT NULL |  |
| child_name | text | Text | NOT NULL |  |
| other_name | text | Text | null |  |
| seen_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: user_id → user.id ON DELETE CASCADE (`family_notice_user_id_user_id_fk`); student_id → user.id ON DELETE CASCADE (`family_notice_student_id_user_id_fk`)
- Indexes: `family_notice_user` (user_id, seen_at)
- CHECK: `family_notice_kind`: "kind" in ('removed', 'other_removed')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 1 non-test file(s) on m1-main: src/server/family

#### `core_deletion_request` — `coreDeletionRequests` · jg-plan `src/db/schema-core.ts:11` · created `0047` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| asked_by | text | Text | NOT NULL |  |
| role | text | Text | NOT NULL |  |
| state | text | Text | NOT NULL | 'open' |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| done_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`core_deletion_request_student_id_user_id_fk`)
- Indexes: UNIQUE `core_deletion_request_open` (student_id) WHERE "state" = 'open'
- CHECK: `core_deletion_request_role`: "role" in ('parent', 'student'); `core_deletion_request_state`: "state" in ('open', 'done', 'withdrawn')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 1 non-test file(s) on m1-main: src/server/core

#### `parent_alert` — `parentAlerts` · jg-plan `src/db/schema.ts:627` · created `0031` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| parent_id | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| missed_homework | boolean | Boolean | NOT NULL | true |
| level_drop | boolean | Boolean | NOT NULL | true |
| inactivity | boolean | Boolean | NOT NULL | true |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (parent_id, student_id) `parent_alert_parent_id_student_id_pk`
- FK: parent_id → user.id ON DELETE CASCADE (`parent_alert_parent_id_user_id_fk`); student_id → user.id ON DELETE CASCADE (`parent_alert_student_id_user_id_fk`)
- Used by 2 non-test file(s) on m1-main: src/server/parent

#### `parent_note` — `parentNotes` · jg-plan `src/db/schema-m1-parent.ts:36` · created `0048` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| parent_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL | 'congrats' |
| event | text | Text | NOT NULL |  |
| words | jsonb | JSONB | NOT NULL |  |
| seen_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`parent_note_student_id_user_id_fk`); parent_id → user.id ON DELETE CASCADE (`parent_note_parent_id_user_id_fk`)
- Indexes: UNIQUE `parent_note_once` (parent_id, student_id, event); `parent_note_student` (student_id, seen_at)
- CHECK: `parent_note_kind`: "kind" in ('congrats')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/core, src/server/family, src/server/notes, src/server/parent

#### `pledge` — `pledges` · jg-plan `src/db/schema-m1-parent.ts:20` · created `0048` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| parent_id | text | Text | NOT NULL |  |
| goal | text | Text | NOT NULL |  |
| target | integer | Integer | NOT NULL |  |
| base | integer | Integer | NOT NULL | 0 |
| reward | text | Text | NOT NULL |  |
| due | date | Date | NOT NULL |  |
| status | text | Text | NOT NULL | 'active' |
| reached_at | timestamp with time zone | DateTime(tz) | null |  |
| given_at | timestamp with time zone | DateTime(tz) | null |  |
| seen_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`pledge_student_id_user_id_fk`); parent_id → user.id ON DELETE CASCADE (`pledge_parent_id_user_id_fk`)
- Indexes: `pledge_student` (student_id, status); `pledge_parent` (parent_id)
- CHECK: `pledge_goal`: "goal" in ('bricks', 'tasks', 'streak'); `pledge_status`: "status" in ('active', 'reached', 'given', 'ended'); `pledge_target`: "target" between 1 and 10000; `pledge_reward`: char_length("reward") between 1 and 80
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 3 non-test file(s) on m1-main: src/server/core, src/server/family, src/server/pledges

#### `jia_lead` — `jiaLeads` · jg-plan `src/db/schema-m1-parent.ts:49` · created `0048` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| user_id | text | Text | null |  |
| number | integer | BigInteger, Identity(always=True, start=1) | NOT NULL | identity always start 1 |
| name | text | Text | NOT NULL |  |
| phone | text | Text | NOT NULL |  |
| city | text | Text | NOT NULL |  |
| course | text | Text | NOT NULL |  |
| lang | text | Text | NOT NULL |  |
| tg_status | text | Text | NOT NULL | 'pending' |
| tg_message_id | integer | Integer | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: user_id → user.id ON DELETE SET NULL (`jia_lead_user_id_user_id_fk`)
- Indexes: `jia_lead_user` (user_id, created_at)
- CHECK: `jia_lead_city`: "city" in ('tashkent', 'andijan', 'online'); `jia_lead_course`: "course" in ('sat', 'ielts'); `jia_lead_tg`: "tg_status" in ('pending', 'sent', 'off', 'failed')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 2 non-test file(s) on m1-main: src/server/core, src/server/leads


### AI layer and Jamol (6)

#### `ai_usage` — `aiUsage` · jg-plan `src/db/schema.ts:97` · created `0000` · touched later by 0029, 0049 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| user_id | text | Text | NOT NULL |  |
| day | date | Date | NOT NULL |  |
| count | integer | Integer | NOT NULL | 0 |
| lesson | integer | Integer | NOT NULL | 0 |
| chat | integer | Integer | NOT NULL | 0 |
| input_tokens | integer | Integer | NOT NULL | 0 |
| output_tokens | integer | Integer | NOT NULL | 0 |
| cost_usd | double precision | Double | NOT NULL | 0 |
| errors | integer | Integer | NOT NULL | 0 |

- PK: (user_id, day) `ai_usage_user_id_day_pk`
- FK: user_id → user.id ON DELETE CASCADE (`ai_usage_user_id_user_id_fk`)
- Used by 4 non-test file(s) on m1-main: src/server/ai.ts, src/server/ailayer, src/server/core, src/server/jamol

#### `ai_consent` — `aiConsent` · jg-plan `src/db/schema.ts:112` · created `0049` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| user_id | text | Text | NOT NULL |  |
| notice_version | text | Text | NOT NULL |  |
| accepted_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (user_id, notice_version) `ai_consent_user_id_notice_version_pk`
- FK: user_id → user.id ON DELETE CASCADE (`ai_consent_user_id_user_id_fk`)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 2 non-test file(s) on m1-main: src/server/core, src/server/jamol

#### `ai_run` — `aiRuns` · jg-plan `src/db/schema.ts:313` · created `0003` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| ref | text | Text | NOT NULL |  |
| input_hash | text | Text | NOT NULL |  |
| input | jsonb | JSONB | null |  |
| prompt_version | text | Text | NOT NULL |  |
| guard_version | integer | Integer | null |  |
| language | text | Text | NOT NULL |  |
| model | text | Text | NOT NULL |  |
| effort | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL |  |
| output | jsonb | JSONB | null |  |
| violations | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| stop_reason | text | Text | null |  |
| stop_category | text | Text | null |  |
| fallback_served | boolean | Boolean | NOT NULL | false |
| usage | jsonb | JSONB | null |  |
| cost_usd | double precision | Double | NOT NULL | 0 |
| latency_ms | integer | Integer | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| finished_at | timestamp with time zone | DateTime(tz) | null |  |
| revoked_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`ai_run_student_id_user_id_fk`)
- Indexes: UNIQUE `ai_run_pending` (student_id, kind, input_hash, prompt_version) WHERE "status" = 'pending'; `ai_run_created` (created_at); `ai_run_student_created` (student_id, created_at); `ai_run_input` (student_id, kind, input_hash)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 11 non-test file(s) on m1-main: src/server/ailayer, src/server/jamol, scripts/ai-report.ts

#### `ai_job` — `aiJobs` · jg-plan `src/db/schema.ts:325` · created `0003` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| ref | text | Text | NOT NULL |  |
| priority | integer | Integer | NOT NULL |  |
| status | text | Text | NOT NULL | 'queued' |
| attempts | integer | Integer | NOT NULL | 0 |
| not_before | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| claim | integer | Integer | NOT NULL | 0 |
| lease_until | timestamp with time zone | DateTime(tz) | null |  |
| rerun | boolean | Boolean | NOT NULL | false |
| run_id | text | Text | null |  |
| payload | jsonb | JSONB | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`ai_job_student_id_user_id_fk`)
- Indexes: UNIQUE `ai_job_live` (student_id, kind, ref) WHERE "status" in ('queued', 'running'); `ai_job_student_live` (student_id) WHERE "status" in ('queued', 'running'); `ai_job_claim` (status, priority, not_before)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 7 non-test file(s) on m1-main: src/server/ailayer, src/server/strategy

#### `ai_settings` — `aiSettingsTable` · jg-plan `src/db/schema.ts:336` · created `0003` · touched later by 0004, 0008 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | integer | Integer | NOT NULL | 1 |
| layer_on | boolean | Boolean | NOT NULL | false |
| steps | text[] | ARRAY(Text) | NOT NULL | '{interpret,result,change,tasks,react}'::text[] |
| languages | text[] | ARRAY(Text) | NOT NULL | '{en,uz,ru}'::text[] |
| min_guard_version | integer | Integer | NOT NULL | 1 |
| notice_version | text | Text | null |  |
| allowances | jsonb | JSONB | NOT NULL | '{"react":12,"result":6,"interpret":10,"tasks":4,"change":6}'::jsonb |
| daily_usd | double precision | Double | NOT NULL | 40 |
| new_account_daily_usd | double precision | Double | NOT NULL | 5 |
| draft_wait_after_ms | integer | Integer | NOT NULL | 20000 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_by | text | Text | NOT NULL | 'migration' |

- PK: id
- CHECK: `ai_settings_one_row`: "id" = 1
- Used by 1 non-test file(s) on m1-main: src/server/ailayer

#### `ai_interpretation` — `aiInterpretations` · jg-plan `src/db/schema.ts:348` · created `0003` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| question_id | text | Text | NOT NULL |  |
| answer_hash | text | Text | NOT NULL |  |
| prompt_version | text | Text | NOT NULL |  |
| score_1_5 | integer | Integer | null |  |
| tags | text[] | ARRAY(Text) | NOT NULL | '{}'::text[] |
| rationale_2_lines | text | Text | NOT NULL |  |
| language_detected | text | Text | NOT NULL |  |
| theme | text | Text | null |  |
| run_id | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: (student_id, question_id, answer_hash, prompt_version) `ai_interpretation_student_id_question_id_answer_hash_prompt_version_pk`
- FK: student_id → user.id ON DELETE CASCADE (`ai_interpretation_student_id_user_id_fk`)
- Note: the PK name in the snapshot is 71 chars; Postgres truncated it to `ai_interpretation_student_id_question_id_answer_hash_prompt_ver` (63). Name it that way in SQLAlchemy.
- Used by 1 non-test file(s) on m1-main: src/server/ailayer


### Engine core (diagnostic, roadmap, day) (17)

#### `rule_record` — `ruleRecords` · jg-plan `src/db/schema.ts:127` · created `0001` · touched later by 0002, 0005, 0010, 0020, 0022, 0023, 0024, 0025, 0026, 0027, 0050 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| id | text | Text | NOT NULL |  |
| version | integer | Integer | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL |  |
| body | jsonb | JSONB | NOT NULL |  |
| needs_verification | boolean | Boolean | NOT NULL | true |
| verified_at | text | Text | null |  |
| source_url | text | Text | null |  |
| effective_cycle | text | Text | null |  |
| is_current | boolean | Boolean | NOT NULL | true |
| created_by | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (id, version) `rule_record_id_version_pk`
- Indexes: `rule_record_current` (is_current)
- Used by 3 non-test file(s) on m1-main: src/server/engine, scripts/rules/expiring.ts

#### `engine_state` — `engineState` · jg-plan `src/db/schema.ts:136` · created `0001` · touched later by 0016 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| profile_version | integer | Integer | NOT NULL | 0 |
| diagnostic | text | Text | NOT NULL | 'not_started' |
| diagnostic_done_at | timestamp with time zone | DateTime(tz) | null |  |
| first_done_on | date | Date | null |  |
| unlocked_at | timestamp with time zone | DateTime(tz) | null |  |
| unlocked_on | date | Date | null |  |
| parallel | text[] | ARRAY(Text) | NOT NULL | '{}'::text[] |
| stage | text | Text | null |  |
| archetype | text | Text | null |  |
| lessons | integer | Integer | NOT NULL | 0 |
| deep_done | text[] | ARRAY(Text) | NOT NULL | '{}'::text[] |
| parent_consent_at | timestamp with time zone | DateTime(tz) | null |  |
| parent_flow_done_at | timestamp with time zone | DateTime(tz) | null |  |
| parent_sent_at | timestamp with time zone | DateTime(tz) | null |  |
| parent_lang | text | Text | null |  |
| engine_version | text | Text | null |  |
| rules_version | text | Text | null |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| phase_d_from | date | Date | null |  |
| profile_complete_at | timestamp with time zone | DateTime(tz) | null |  |
| profile_complete_by | text | Text | null |  |
| unknowns | text[] | ARRAY(Text) | NOT NULL | '{}'::text[] |
| replanned_on | date | Date | null |  |
| replan_pending | boolean | Boolean | NOT NULL | false |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`engine_state_student_id_user_id_fk`)
- Used by 35 non-test file(s) on m1-main: src/server/ailayer, src/server/checks.ts, src/server/community, src/server/core, src/server/engine, src/server/jamol, src/server/league, src/server/lessons +5 more

#### `diagnostic_answer` — `diagnosticAnswers` · jg-plan `src/db/schema.ts:156` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| question_id | text | Text | NOT NULL |  |
| source | text | Text | NOT NULL |  |
| value | jsonb | JSONB | NOT NULL |  |
| status | text | Text | NOT NULL | 'answered' |
| answered_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| profile_version | integer | Integer | NOT NULL | 0 |

- PK: (student_id, question_id, source) `diagnostic_answer_student_id_question_id_source_pk`
- FK: student_id → user.id ON DELETE CASCADE (`diagnostic_answer_student_id_user_id_fk`)
- Used by 7 non-test file(s) on m1-main: src/server/checks.ts, src/server/community, src/server/core, src/server/engine, src/server/leads, src/server/parent

#### `engine_event` — `engineEvents` · jg-plan `src/db/schema.ts:163` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| type | text | Text | NOT NULL |  |
| payload | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| local_date | date | Date | NOT NULL |  |
| profile_version_after | integer | Integer | null |  |
| client_id | text | Text | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`engine_event_student_id_user_id_fk`)
- Indexes: `engine_event_student` (student_id, at); UNIQUE `engine_event_client` (student_id, client_id) WHERE "client_id" is not null
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 13 non-test file(s) on m1-main: src/server/ailayer, src/server/community, src/server/core, src/server/engine, src/server/phase-d, src/server/schedule

#### `engine_result` — `engineResults` · jg-plan `src/db/schema.ts:168` · created `0001` · touched later by 0003 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| profile_version | integer | Integer | NOT NULL |  |
| answers | jsonb | JSONB | NOT NULL |  |
| derived | jsonb | JSONB | NOT NULL |  |
| scorecard | jsonb | JSONB | NOT NULL |  |
| flags | jsonb | JSONB | NOT NULL |  |
| feasibility | jsonb | JSONB | NOT NULL |  |
| archetype | text | Text | NOT NULL |  |
| first_tasks | jsonb | JSONB | NOT NULL |  |
| player_card | jsonb | JSONB | NOT NULL |  |
| engine_version | text | Text | NOT NULL |  |
| rules_version | text | Text | NOT NULL |  |
| computed_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| ai | jsonb | JSONB | null |  |

- PK: (student_id, profile_version) `engine_result_student_id_profile_version_pk`
- FK: student_id → user.id ON DELETE CASCADE (`engine_result_student_id_user_id_fk`)
- Used by 6 non-test file(s) on m1-main: src/server/ailayer, src/server/engine, src/server/outcomes, src/server/phase-x, scripts/ai-report.ts

#### `readiness_snapshot` — `readinessSnapshots` · jg-plan `src/db/schema.ts:178` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| taken_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| local_date | date | Date | NOT NULL |  |
| overall | integer | Integer | NOT NULL |  |
| tier | text | Text | NOT NULL |  |
| card | jsonb | JSONB | NOT NULL |  |

- PK: (student_id, taken_at, kind) `readiness_snapshot_student_id_taken_at_kind_pk`
- FK: student_id → user.id ON DELETE CASCADE (`readiness_snapshot_student_id_user_id_fk`)
- Indexes: UNIQUE `readiness_period` (student_id, kind, local_date) WHERE "kind" <> 'rescore'
- Used by 5 non-test file(s) on m1-main: src/server/engine, src/server/parent

#### `roadmap` — `roadmaps` · jg-plan `src/db/schema.ts:183` · created `0001` · touched later by 0009, 0017 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| profile_version | integer | Integer | NOT NULL |  |
| archetype | text | Text | null |  |
| phases | jsonb | JSONB | NOT NULL |  |
| weekly_goals | jsonb | JSONB | NOT NULL |  |
| narration | jsonb | JSONB | NOT NULL |  |
| narration_by | text | Text | NOT NULL | 'code' |
| created_on | date | Date | NOT NULL |  |
| engine_version | text | Text | NOT NULL |  |
| rules_version | text | Text | NOT NULL |  |
| generated_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| is_current | boolean | Boolean | NOT NULL | true |
| lang | text | Text | null |  |
| planned_by | text | Text | NOT NULL | 'code' |
| ai_run_id | text | Text | null |  |
| strategy | jsonb | JSONB | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`roadmap_student_id_user_id_fk`)
- Indexes: `roadmap_student` (student_id, is_current)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 8 non-test file(s) on m1-main: src/server/ailayer, src/server/core, src/server/engine, src/server/lessons.ts, src/server/strategy

#### `roadmap_milestone` — `roadmapMilestones` · jg-plan `src/db/schema.ts:196` · created `0001` · touched later by 0007 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| roadmap_id | text | Text | NOT NULL |  |
| id | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| position | integer | Integer | NOT NULL |  |
| phase_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| route | text | Text | NOT NULL |  |
| title | text | Text | NOT NULL |  |
| title_en | text | Text | null |  |
| why | text | Text | null |  |
| due | date | Date | null |  |
| hard_deadline | boolean | Boolean | NOT NULL |  |
| source_rule_id | text | Text | null |  |
| rule_version | integer | Integer | null |  |
| needs_verification | boolean | Boolean | NOT NULL |  |
| human_checkpoint | boolean | Boolean | NOT NULL |  |
| depends_on | text[] | ARRAY(Text) | NOT NULL | '{}'::text[] |
| status | text | Text | NOT NULL |  |
| locked | boolean | Boolean | NOT NULL | false |
| verified_at | text | Text | null |  |
| source_url | text | Text | null |  |

- PK: (roadmap_id, id) `roadmap_milestone_roadmap_id_id_pk`
- FK: roadmap_id → roadmap.id ON DELETE CASCADE (`roadmap_milestone_roadmap_id_roadmap_id_fk`); student_id → user.id ON DELETE CASCADE (`roadmap_milestone_student_id_user_id_fk`)
- Indexes: `milestone_rule` (source_rule_id); `milestone_student_due` (student_id, due)
- Used by 7 non-test file(s) on m1-main: src/server/ailayer, src/server/core, src/server/engine, src/server/lessons.ts, src/server/strategy

#### `roadmap_change` — `roadmapChanges` · jg-plan `src/db/schema.ts:206` · created `0001` · touched later by 0003 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| roadmap_id | text | Text | NOT NULL |  |
| at | date | Date | NOT NULL |  |
| what_changed | text | Text | NOT NULL |  |
| cause_event_id | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| what_changed_ai | text | Text | null |  |
| ai_language | text | Text | null |  |
| ai_run_id | text | Text | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`roadmap_change_student_id_user_id_fk`); roadmap_id → roadmap.id ON DELETE CASCADE (`roadmap_change_roadmap_id_roadmap_id_fk`)
- Indexes: `roadmap_change_student` (student_id, created_at)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 6 non-test file(s) on m1-main: src/server/ailayer, src/server/engine, src/server/phase-d

#### `task_batch` — `taskBatches` · jg-plan `src/db/schema.ts:213` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| week_start | date | Date | NOT NULL |  |
| roadmap_id | text | Text | null |  |
| cadence | jsonb | JSONB | NOT NULL |  |
| generated_by | text | Text | NOT NULL | 'code' |
| engine_version | text | Text | NOT NULL |  |
| rules_version | text | Text | NOT NULL |  |
| generated_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`task_batch_student_id_user_id_fk`); roadmap_id → roadmap.id ON DELETE SET NULL (`task_batch_roadmap_id_roadmap_id_fk`)
- Indexes: UNIQUE `task_batch_week` (student_id, week_start)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 7 non-test file(s) on m1-main: src/server/ailayer, src/server/engine, src/server/lessons, src/server/phase-d, src/server/schedule

#### `daily_task` — `dailyTasks` · jg-plan `src/db/schema.ts:220` · created `0001` · touched later by 0003, 0016 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| id | text | Text | NOT NULL |  |
| batch_id | text | Text | NOT NULL |  |
| date | date | Date | NOT NULL |  |
| slot | integer | Integer | NOT NULL |  |
| milestone_id | text | Text | null |  |
| weekly_goal_id | text | Text | null |  |
| type | text | Text | NOT NULL |  |
| subject | text | Text | NOT NULL |  |
| short | text | Text | NOT NULL |  |
| title | text | Text | NOT NULL |  |
| instructions | text | Text | NOT NULL |  |
| est_minutes | integer | Integer | NOT NULL |  |
| verification | text | Text | NOT NULL |  |
| coins | integer | Integer | NOT NULL |  |
| quiz | text | Text | null |  |
| deep | text | Text | null |  |
| optional | boolean | Boolean | NOT NULL | false |
| template | text | Text | NOT NULL |  |
| seq | integer | Integer | NOT NULL | 1 |
| language | text | Text | NOT NULL | 'en' |
| generated_by | text | Text | NOT NULL | 'code' |
| constraints_hash | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL | 'scheduled' |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| title_ai | text | Text | null |  |
| instructions_ai | text | Text | null |  |
| ai_input_hash | text | Text | null |  |
| ai_language | text | Text | null |  |
| ai_run_id | text | Text | null |  |
| meta | jsonb | JSONB | null |  |

- PK: (student_id, id) `daily_task_student_id_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`daily_task_student_id_user_id_fk`); batch_id → task_batch.id ON DELETE CASCADE (`daily_task_batch_id_task_batch_id_fk`)
- Indexes: UNIQUE `daily_task_live_slot` (student_id, date, slot) WHERE "status" <> 'replaced'; `daily_task_template` (student_id, template)
- Used by 29 non-test file(s) on m1-main: src/server/ailayer, src/server/checks.ts, src/server/core, src/server/engine, src/server/lessons, src/server/lessons.ts, src/server/parent, src/server/phase-d +2 more

#### `task_completion` — `taskCompletions` · jg-plan `src/db/schema.ts:235` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| task_id | text | Text | NOT NULL |  |
| date | date | Date | NOT NULL |  |
| completed_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| proof_kind | text | Text | NOT NULL |  |
| proof | text | Text | NOT NULL |  |
| result | jsonb | JSONB | null |  |
| review | text | Text | NOT NULL | 'auto' |
| coins_awarded | integer | Integer | NOT NULL |  |
| client_id | text | Text | null |  |

- PK: (student_id, task_id) `task_completion_student_id_task_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`task_completion_student_id_user_id_fk`)
- Indexes: UNIQUE `task_completion_client` (student_id, client_id) WHERE "client_id" is not null
- Used by 12 non-test file(s) on m1-main: src/server/checks.ts, src/server/core, src/server/engine, src/server/lessons, src/server/parent, src/server/phase-d, src/server/phase-x, src/server/pledges

#### `study_session` — `studySessions` · jg-plan `src/db/schema.ts:241` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| client_id | text | Text | NOT NULL |  |
| subject | text | Text | NOT NULL |  |
| task_id | text | Text | null |  |
| minutes_planned | integer | Integer | NOT NULL |  |
| started_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| ends_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| ended_at | timestamp with time zone | DateTime(tz) | null |  |
| status | text | Text | NOT NULL |  |
| break_reason | text | Text | null |  |
| minutes_studied | integer | Integer | NOT NULL | 0 |
| bricks_awarded | integer | Integer | NOT NULL | 0 |
| xp_awarded | integer | Integer | NOT NULL | 0 |
| dbh_bonus | integer | Integer | NOT NULL | 0 |
| local_date | date | Date | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`study_session_student_id_user_id_fk`)
- Indexes: UNIQUE `study_session_client` (student_id, client_id); UNIQUE `study_session_running` (student_id) WHERE "status" = 'running'; `study_session_day` (student_id, local_date)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 7 non-test file(s) on m1-main: src/server/engine, src/server/motivation, src/server/parent, src/server/schedule

#### `milestone_report` — `milestoneReports` · jg-plan `src/db/schema.ts:305` · created `0001` · touched later by 0047, 0051 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| milestone_id | text | Text | NOT NULL |  |
| source_rule_id | text | Text | null |  |
| rule_version | integer | Integer | null |  |
| reported_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| state | text | Text | NOT NULL | 'open' |
| resolved_at | timestamp with time zone | DateTime(tz) | null |  |
| resolved_by | text | Text | null |  |
| note | text | Text | null |  |
| seen_due | date | Date | null |  |
| seen_title | text | Text | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`milestone_report_student_id_user_id_fk`)
- Indexes: UNIQUE `milestone_report_once` (student_id, milestone_id)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/core, src/server/engine, src/server/moderation

#### `check_run` — `checkRuns` · jg-plan `src/db/schema.ts:361` · created `0012` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| ref | text | Text | NOT NULL | '' |
| attempt | integer | Integer | NOT NULL | 1 |
| status | text | Text | NOT NULL |  |
| data | jsonb | JSONB | NOT NULL |  |
| result | jsonb | JSONB | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`check_run_student_id_user_id_fk`)
- Indexes: UNIQUE `check_run_once` (student_id, kind, ref, attempt)
- CHECK: `check_run_kind`: "kind" in ('english', 'math', 'reading', 'quiz'); `check_run_status`: "status" in ('active', 'done')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 20 non-test file(s) on m1-main: src/server/cat, src/server/checks.ts, src/server/demo.ts, src/server/engine, src/server/lessons, src/server/outcomes, src/server/parent, src/server/phase-d +2 more

#### `schedule_state` — `scheduleStates` · jg-plan `src/db/schema.ts:490` · created `0018` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| state | jsonb | JSONB | NOT NULL |  |
| repair | jsonb | JSONB | null |  |
| synced_on | date | Date | null |  |
| reminder_on | date | Date | null |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`schedule_state_student_id_user_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/server/schedule

#### `staff_checkpoint` — `staffCheckpoints` · jg-plan `src/db/schema.ts:540` · created `0019` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| payload | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| task_id | text | Text | null |  |
| proof_id | text | Text | null |  |
| completes | boolean | Boolean | NOT NULL | false |
| status | text | Text | NOT NULL | 'open' |
| decided_by | text | Text | null |  |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |
| reason | text | Text | null |  |
| note | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`staff_checkpoint_student_id_user_id_fk`); proof_id → proof_file.id ON DELETE SET NULL (`staff_checkpoint_proof_id_proof_file_id_fk`); decided_by → user.id ON DELETE SET NULL (`staff_checkpoint_decided_by_user_id_fk`)
- Indexes: `staff_checkpoint_queue` (status, created_at); `staff_checkpoint_student` (student_id); UNIQUE `staff_checkpoint_open_task` (student_id, task_id) WHERE "status" = 'open' and "task_id" is not null
- CHECK: `staff_checkpoint_status`: "status" in ('open', 'approved', 'returned'); `staff_checkpoint_kind`: "kind" in ('link', 'upload', 'artifact', 'final_list', 'essay_final', 'ed_choice', 'other')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 5 non-test file(s) on m1-main: src/server/core, src/server/phase-x


### Ledgers and motivation (coins, XP, bricks, streak) (11)

#### `coin_entry` — `coinEntries` · jg-plan `src/db/schema.ts:282` · created `0001` · touched later by 0043, 0051 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| amount | integer | Integer | NOT NULL |  |
| reason | text | Text | NOT NULL |  |
| ref | text | Text | NOT NULL |  |
| idem | text | Text | NOT NULL |  |
| client_id | text | Text | null |  |
| local_date | date | Date | NOT NULL |  |
| payload | jsonb | JSONB | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`coin_entry_student_id_user_id_fk`)
- Indexes: UNIQUE `coin_entry_idem` (student_id, idem); `coin_entry_student` (student_id, created_at)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 11 non-test file(s) on m1-main: src/server/core, src/server/engine, src/server/games, src/server/lessons, src/server/motivation

#### `wallet` — `wallets` · jg-plan `src/db/schema.ts:287` · created `0001` · touched later by 0036, 0043, 0051 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| balance | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`wallet_student_id_user_id_fk`)
- CHECK: `wallet_balance_nonneg`: "balance" >= 0
- Used by 2 non-test file(s) on m1-main: src/server/engine

#### `wallet_backfill` — `walletBackfill` · jg-plan `src/db/schema.ts:294` · created `0036` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **coin_entry_id** (PK) | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| amount | integer | Integer | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: coin_entry_id
- FK: coin_entry_id → coin_entry.id ON DELETE CASCADE (`wallet_backfill_coin_entry_id_coin_entry_id_fk`)
- Used by 0 non-test file(s) on m1-main

#### `xp_entry` — `xpEntries` · jg-plan `src/db/schema.ts:299` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| amount | integer | Integer | NOT NULL |  |
| reason | text | Text | NOT NULL |  |
| ref | text | Text | NOT NULL |  |
| local_date | date | Date | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`xp_entry_student_id_user_id_fk`)
- Indexes: UNIQUE `xp_entry_once` (student_id, reason, ref)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/engine, src/server/league

#### `brick_entry` — `brickEntries` · jg-plan `src/db/schema.ts:250` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| amount | integer | Integer | NOT NULL |  |
| reason | text | Text | NOT NULL |  |
| ref | text | Text | NOT NULL |  |
| local_date | date | Date | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`brick_entry_student_id_user_id_fk`)
- Indexes: UNIQUE `brick_entry_once` (student_id, reason, ref)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 3 non-test file(s) on m1-main: src/server/engine, src/server/pledges

#### `dream_build` — `dreamBuilds` · jg-plan `src/db/schema.ts:255` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| university | text | Text | NOT NULL | 'MIT' |
| target | integer | Integer | NOT NULL | 600 |
| bricks | integer | Integer | NOT NULL | 0 |
| cracked | text[] | ARRAY(Text) | NOT NULL | '{}'::text[] |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`dream_build_student_id_user_id_fk`)
- Used by 2 non-test file(s) on m1-main: src/server/engine

#### `activity_day` — `activityDays` · jg-plan `src/db/schema.ts:261` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| date | date | Date | NOT NULL |  |
| scheduled | boolean | Boolean | NOT NULL | false |
| rest | boolean | Boolean | NOT NULL | false |
| tasks_done | integer | Integer | NOT NULL | 0 |
| tasks_of | integer | Integer | NOT NULL | 0 |
| minutes | integer | Integer | NOT NULL | 0 |
| bricks | integer | Integer | NOT NULL | 0 |
| sessions | integer | Integer | NOT NULL | 0 |
| xp | integer | Integer | NOT NULL | 0 |
| qualified | boolean | Boolean | NOT NULL | false |
| freeze_used | boolean | Boolean | NOT NULL | false |
| streak_after | integer | Integer | null |  |
| closed | boolean | Boolean | NOT NULL | false |

- PK: (student_id, date) `activity_day_student_id_date_pk`
- FK: student_id → user.id ON DELETE CASCADE (`activity_day_student_id_user_id_fk`)
- Used by 10 non-test file(s) on m1-main: src/server/engine, src/server/league, src/server/lessons, src/server/motivation, src/server/parent, src/server/phase-d, src/server/schedule

#### `streak_state` — `streakStates` · jg-plan `src/db/schema.ts:269` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| current | integer | Integer | NOT NULL | 0 |
| best | integer | Integer | NOT NULL | 0 |
| best_end | date | Date | null |  |
| freezes | integer | Integer | NOT NULL | 0 |
| closed_through | date | Date | null |  |
| last_grant_week | date | Date | null |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`streak_state_student_id_user_id_fk`)
- Used by 6 non-test file(s) on m1-main: src/server/achievements, src/server/engine, src/server/pledges

#### `freeze_entry` — `freezeEntries` · jg-plan `src/db/schema.ts:276` · created `0001` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| date | date | Date | NOT NULL |  |
| ref | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`freeze_entry_student_id_user_id_fk`)
- Indexes: UNIQUE `freeze_entry_once` (student_id, kind, ref)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 2 non-test file(s) on m1-main: src/server/engine

#### `achievement_award` — `achievementAwards` · jg-plan `src/db/schema-league.ts:60` · created `0045` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| achievement | text | Text | NOT NULL |  |
| earned_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| local_date | date | Date | NOT NULL |  |
| serial | integer | Integer | NOT NULL |  |
| ref | text | Text | null |  |
| ceremony_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: (student_id, achievement) `achievement_award_student_id_achievement_pk`
- FK: student_id → user.id ON DELETE CASCADE (`achievement_award_student_id_user_id_fk`)
- Indexes: `achievement_award_id` (achievement)
- Used by 2 non-test file(s) on m1-main: src/server/achievements

#### `student_motivation` — `studentMotivation` · jg-plan `src/db/schema-league.ts:47` · created `0046` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| why | text | Text | null |  |
| why_at | timestamp with time zone | DateTime(tz) | null |  |
| letter_text | text | Text | null |  |
| letter_sealed_at | timestamp with time zone | DateTime(tz) | null |  |
| letter_ps | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| letter_opened_at | timestamp with time zone | DateTime(tz) | null |  |
| comeback | jsonb | JSONB | null |  |
| comebacks | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| style_active | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`student_motivation_student_id_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/motivation


### Outcomes, prediction, proof (8)

#### `admission_prediction` — `admissionPredictions` · jg-plan `src/db/schema.ts:375` · created `0013` · touched later by 0015 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| university | text | Text | NOT NULL |  |
| programme | text | Text | null |  |
| cycle | integer | Integer | NOT NULL |  |
| profile_version | integer | Integer | NOT NULL |  |
| model_version | text | Text | NOT NULL |  |
| spec_version | integer | Integer | NOT NULL |  |
| readiness_version | integer | Integer | NOT NULL |  |
| shape | text | Text | NOT NULL |  |
| state | text | Text | NOT NULL |  |
| inputs | jsonb | JSONB | NOT NULL |  |
| gates | jsonb | JSONB | NOT NULL |  |
| p_mid | double precision | Double | null |  |
| p_lo | double precision | Double | null |  |
| p_hi | double precision | Double | null |  |
| displayed | text | Text | NOT NULL |  |
| displayed_value | integer | Integer | null |  |
| displayed_text | text | Text | null |  |
| other_value | integer | Integer | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| frozen_at | timestamp with time zone | DateTime(tz) | null |  |
| target | text | Text | null |  |
| spec_cycle | integer | Integer | null |  |
| system | text | Text | null |  |
| tier | text | Text | null |  |
| international | boolean | Boolean | null |  |
| form | text | Text | null |  |
| grant_mid | double precision | Double | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`admission_prediction_student_id_user_id_fk`)
- Indexes: UNIQUE `admission_prediction_once` (student_id, university, profile_version, model_version); `admission_prediction_student` (student_id, created_at)
- CHECK: `admission_prediction_displayed`: "displayed" in ('chance', 'scale'); `admission_prediction_form`: "form" is null or "form" in ('grant', 'contract')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- TRIGGER `admission_prediction_immutable` BEFORE UPDATE (plpgsql function of the same name, drizzle/0013:31-39): only `frozen_at` may change, once. Not in any drizzle snapshot.
- Used by 3 non-test file(s) on m1-main: src/server/engine

#### `proof_file` — `proofFiles` · jg-plan `src/db/schema.ts:400` · created `0014` · touched later by 0019 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| uploaded_by | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| mime | text | Text | NOT NULL |  |
| bytes | bytea | LargeBinary | NOT NULL |  |
| sha256 | text | Text | NOT NULL |  |
| size | integer | Integer | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`proof_file_student_id_user_id_fk`); uploaded_by → user.id ON DELETE CASCADE (`proof_file_uploaded_by_user_id_fk`)
- Indexes: `proof_file_student` (student_id); UNIQUE `proof_file_once` (student_id, kind, sha256)
- CHECK: `proof_file_kind`: "kind" in ('score_report', 'decision', 'bluebook', 'task'); `proof_file_mime`: "mime" in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp'); `proof_file_size`: octet_length("bytes") between 1 and 4194304
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 8 non-test file(s) on m1-main: src/server/core, src/server/outcomes, src/server/phase-x

#### `score_report` — `scoreReports` · jg-plan `src/db/schema.ts:413` · created `0014` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| test | text | Text | NOT NULL |  |
| subject | text | Text | null |  |
| scores | jsonb | JSONB | NOT NULL |  |
| test_date | date | Date | null |  |
| proof_id | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL | 'pending' |
| reviewed_by | text | Text | null |  |
| reviewed_at | timestamp with time zone | DateTime(tz) | null |  |
| review_note | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`score_report_student_id_user_id_fk`); proof_id → proof_file.id ON DELETE CASCADE (`score_report_proof_id_proof_file_id_fk`)
- Indexes: `score_report_student` (student_id); `score_report_status` (status)
- CHECK: `score_report_test`: "test" in ('sat', 'psat', 'act', 'ielts', 'toefl', 'det', 'pte', 'cambridge', 'ap', 'ib', 'alevel', 'cefr', 'milliy', 'agency'); `score_report_status`: "status" in ('pending', 'verified', 'rejected')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/core, src/server/outcomes

#### `admission_outcome` — `admissionOutcomes` · jg-plan `src/db/schema.ts:428` · created `0014` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| cycle | integer | Integer | NOT NULL |  |
| target | text | Text | NOT NULL |  |
| university_name | text | Text | null |  |
| round | text | Text | null |  |
| decision | text | Text | NOT NULL |  |
| final | boolean | Boolean | NOT NULL |  |
| aid_offered | text | Text | null |  |
| placement | text | Text | null |  |
| agency_score | double precision | Double | null |  |
| agency_blocks | jsonb | JSONB | null |  |
| proof_id | text | Text | null |  |
| verified | boolean | Boolean | NOT NULL | false |
| verified_by | text | Text | null |  |
| verified_at | timestamp with time zone | DateTime(tz) | null |  |
| prediction_id | text | Text | null |  |
| source | text | Text | NOT NULL |  |
| reported_by | text | Text | null |  |
| window | text | Text | null |  |
| history | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`admission_outcome_student_id_user_id_fk`); proof_id → proof_file.id ON DELETE SET NULL (`admission_outcome_proof_id_proof_file_id_fk`); reported_by → user.id ON DELETE SET NULL (`admission_outcome_reported_by_user_id_fk`)
- Indexes: UNIQUE `admission_outcome_once` (student_id, cycle, target); `admission_outcome_cycle` (cycle)
- CHECK: `admission_outcome_decision`: "decision" in ('admitted', 'rejected', 'waitlisted', 'deferred', 'withdrawn', 'pending', 'not_applied'); `admission_outcome_round`: "round" is null or "round" in ('ed', 'ed2', 'ea', 'rea', 'rd', 'rolling', 'uz_state', 'other'); `admission_outcome_aid`: "aid_offered" is null or "aid_offered" in ('none', 'partial', 'full', 'unknown'); `admission_outcome_placement`: "placement" is null or "placement" in ('grant', 'contract', 'none'); `admission_outcome_source`: "source" in ('student', 'parent', 'staff')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 3 non-test file(s) on m1-main: src/server/motivation, src/server/outcomes

#### `outcome_prompt` — `outcomePrompts` · jg-plan `src/db/schema.ts:445` · created `0014` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| user_id | text | Text | NOT NULL |  |
| window | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| state | text | Text | NOT NULL |  |
| shown_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| closed_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: (user_id, window) `outcome_prompt_user_id_window_pk`
- FK: user_id → user.id ON DELETE CASCADE (`outcome_prompt_user_id_user_id_fk`); student_id → user.id ON DELETE CASCADE (`outcome_prompt_student_id_user_id_fk`)
- Indexes: `outcome_prompt_student` (student_id)
- CHECK: `outcome_prompt_state`: "state" in ('shown', 'answered', 'skipped')
- Used by 1 non-test file(s) on m1-main: src/server/outcomes

#### `study_invite` — `studyInvites` · jg-plan `src/db/schema.ts:455` · created `0014` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| study | text | Text | NOT NULL | 'bluebook_math' |
| code_hash | text | Text | NOT NULL |  |
| label | text | Text | NOT NULL |  |
| created_by | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| expires_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| max_uses | integer | Integer | NOT NULL |  |
| uses | integer | Integer | NOT NULL | 0 |
| revoked_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- UNIQUE constraint: `study_invite_code_hash_unique` (code_hash)
- CHECK: `study_invite_study`: "study" in ('bluebook_math')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 1 non-test file(s) on m1-main: src/server/outcomes

#### `study_pair` — `studyPairs` · jg-plan `src/db/schema.ts:460` · created `0014` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| study | text | Text | NOT NULL | 'bluebook_math' |
| invite_id | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| consent_version | text | Text | NOT NULL |  |
| consent_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| bluebook_kind | text | Text | NOT NULL |  |
| bluebook_date | date | Date | NOT NULL |  |
| bluebook_math | integer | Integer | NOT NULL |  |
| bluebook_total | integer | Integer | null |  |
| proof_id | text | Text | null |  |
| withdrawn_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: invite_id → study_invite.id ON DELETE CASCADE (`study_pair_invite_id_study_invite_id_fk`); student_id → user.id ON DELETE CASCADE (`study_pair_student_id_user_id_fk`); proof_id → proof_file.id ON DELETE SET NULL (`study_pair_proof_id_proof_file_id_fk`)
- Indexes: UNIQUE `study_pair_once` (study, student_id)
- CHECK: `study_pair_kind`: "bluebook_kind" in ('practice', 'official'); `study_pair_math`: "bluebook_math" between 200 and 800 and "bluebook_math" % 10 = 0; `study_pair_total`: "bluebook_total" is null or ("bluebook_total" between 400 and 1600 and "bluebook_total" % 10 = 0)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 1 non-test file(s) on m1-main: src/server/outcomes

#### `study_consent` — `studyConsents` · jg-plan `src/db/schema.ts:475` · created `0021` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| study | text | Text | NOT NULL | 'bluebook_math' |
| student_id | text | Text | NOT NULL |  |
| invite_id | text | Text | NOT NULL |  |
| asked_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| parent_id | text | Text | null |  |
| answer | text | Text | null |  |
| answered_at | timestamp with time zone | DateTime(tz) | null |  |
| version | text | Text | null |  |

- PK: (study, student_id) `study_consent_study_student_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`study_consent_student_id_user_id_fk`); invite_id → study_invite.id ON DELETE CASCADE (`study_consent_invite_id_study_invite_id_fk`); parent_id → user.id ON DELETE SET NULL (`study_consent_parent_id_user_id_fk`)
- CHECK: `study_consent_study`: "study" in ('bluebook_math'); `study_consent_answer`: ("answer" is null and "answered_at" is null) or ("answer" in ('yes', 'no') and "answered_at" is not null)
- Used by 1 non-test file(s) on m1-main: src/server/outcomes


### Learner model (Phase X) (3)

#### `learner_skill` — `learnerSkills` · jg-plan `src/db/schema.ts:511` · created `0019` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| skill | text | Text | NOT NULL |  |
| theta | double precision | Double | NOT NULL |  |
| answers | integer | Integer | NOT NULL | 0 |
| mastery | text | Text | null |  |
| seed | double precision | Double | NOT NULL |  |
| seeded_from | text | Text | NOT NULL |  |
| proficient_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, skill) `learner_skill_student_id_skill_pk`
- FK: student_id → user.id ON DELETE CASCADE (`learner_skill_student_id_user_id_fk`)
- CHECK: `learner_skill_mastery`: "mastery" is null or "mastery" in ('attempted', 'familiar', 'proficient', 'mastered'); `learner_skill_seeded`: "seeded_from" in ('cat', 'track', 'default')
- Used by 1 non-test file(s) on m1-main: src/server/phase-x

#### `srs_card` — `srsCards` · jg-plan `src/db/schema.ts:519` · created `0019` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| item_id | text | Text | NOT NULL |  |
| skill | text | Text | NOT NULL |  |
| due | timestamp with time zone | DateTime(tz) | null |  |
| fsrs | jsonb | JSONB | null |  |
| reviews | integer | Integer | NOT NULL | 0 |
| served | integer | Integer | NOT NULL | 0 |
| last_served_at | timestamp with time zone | DateTime(tz) | null |  |
| seen | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, item_id) `srs_card_student_id_item_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`srs_card_student_id_user_id_fk`)
- Indexes: `srs_card_due` (student_id, due)
- Used by 4 non-test file(s) on m1-main: src/server/lessons, src/server/phase-x, src/server/schedule

#### `practice_item` — `practiceItems` · jg-plan `src/db/schema.ts:525` · created `0019` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **item_id** (PK) | text | Text | NOT NULL |  |
| b | double precision | Double | NOT NULL |  |
| answers | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: item_id
- Used by 1 non-test file(s) on m1-main: src/server/phase-x


### Lessons, homework, mocks, writing, speaking (9)

#### `lesson_progress` — `lessonProgress` · jg-plan `src/db/schema.ts:569` · created `0028` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| lesson_id | text | Text | NOT NULL |  |
| course | text | Text | NOT NULL |  |
| opened_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| pieces | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| test_out | jsonb | JSONB | null |  |
| test_task_id | text | Text | null |  |
| passed_at | timestamp with time zone | DateTime(tz) | null |  |
| minutes_spent | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, lesson_id) `lesson_progress_student_id_lesson_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`lesson_progress_student_id_user_id_fk`)
- Used by 11 non-test file(s) on m1-main: src/server/lessons, src/server/lessons.ts, src/server/parent

#### `homework` — `homework` · jg-plan `src/db/schema.ts:575` · created `0028` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| source | text | Text | NOT NULL | 'course' |
| student_id | text | Text | NOT NULL |  |
| lesson_ids | text[] | ARRAY(Text) | NOT NULL |  |
| courses | text[] | ARRAY(Text) | NOT NULL |  |
| spec | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| minutes | integer | Integer | NOT NULL |  |
| for_day | date | Date | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`homework_student_id_user_id_fk`)
- Indexes: UNIQUE `homework_one_a_day` (student_id, for_day)
- CHECK: `homework_source`: "source" in ('course')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 2 non-test file(s) on m1-main: src/server/lessons, src/server/parent

#### `homework_turn` — `homeworkTurns` · jg-plan `src/db/schema.ts:580` · created `0028` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| homework_id | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL | 'assigned' |
| first_right | integer | Integer | NOT NULL | 0 |
| first_of | integer | Integer | NOT NULL | 0 |
| items | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| task_id | text | Text | null |  |
| shown_at | timestamp with time zone | DateTime(tz) | null |  |
| handed_in_at | timestamp with time zone | DateTime(tz) | null |  |
| completed_at | timestamp with time zone | DateTime(tz) | null |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (homework_id, student_id) `homework_turn_homework_id_student_id_pk`
- FK: homework_id → homework.id ON DELETE CASCADE (`homework_turn_homework_id_homework_id_fk`); student_id → user.id ON DELETE CASCADE (`homework_turn_student_id_user_id_fk`)
- Indexes: `homework_turn_status` (student_id, status)
- CHECK: `homework_turn_status`: "status" in ('assigned', 'handed_in', 'complete', 'missing')
- Used by 6 non-test file(s) on m1-main: src/server/checks.ts, src/server/lessons, src/server/parent

#### `lesson_skill` — `lessonSkills` · jg-plan `src/db/schema.ts:587` · created `0028` · touched later by 0033 · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| skill | text | Text | NOT NULL |  |
| level | text | Text | NOT NULL | 'started' |
| passes | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| miss_run | integer | Integer | NOT NULL | 0 |
| proficient_at | timestamp with time zone | DateTime(tz) | null |  |
| mastered_at | timestamp with time zone | DateTime(tz) | null |  |
| rises | jsonb | JSONB | null |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, skill) `lesson_skill_student_id_skill_pk`
- FK: student_id → user.id ON DELETE CASCADE (`lesson_skill_student_id_user_id_fk`)
- CHECK: `lesson_skill_level`: "level" in ('started', 'familiar', 'proficient', 'mastered')
- Used by 6 non-test file(s) on m1-main: src/server/lessons, src/server/lessons.ts, src/server/parent

#### `mock_result` — `mockResults` · jg-plan `src/db/schema.ts:595` · created `0030` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| mock_date | date | Date | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| scores | jsonb | JSONB | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, mock_date) `mock_result_student_id_mock_date_pk`
- FK: student_id → user.id ON DELETE CASCADE (`mock_result_student_id_user_id_fk`)
- CHECK: `mock_result_kind`: "kind" in ('sat', 'dtm')
- Used by 2 non-test file(s) on m1-main: src/server/lessons

#### `dtm_sitting` — `dtmSittings` · jg-plan `src/db/schema.ts:603` · created `0034` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| mock_date | date | Date | NOT NULL |  |
| mock_id | text | Text | NOT NULL |  |
| started_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| ends_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| finished_at | timestamp with time zone | DateTime(tz) | null |  |
| data | jsonb | JSONB | NOT NULL |  |
| answers | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, mock_date) `dtm_sitting_student_id_mock_date_pk`
- FK: student_id → user.id ON DELETE CASCADE (`dtm_sitting_student_id_user_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/server/lessons

#### `sat_sitting` — `satSittings` · jg-plan `src/db/schema.ts:613` · created `0038` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| form_id | text | Text | NOT NULL |  |
| mock_date | date | Date | NOT NULL |  |
| started_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| finished_at | timestamp with time zone | DateTime(tz) | null |  |
| ended | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| data | jsonb | JSONB | NOT NULL |  |
| answers | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| marks | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| result | jsonb | JSONB | null |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, form_id) `sat_sitting_student_id_form_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`sat_sitting_student_id_user_id_fk`)
- Indexes: `sat_sitting_mock_date` (student_id, mock_date)
- Used by 2 non-test file(s) on m1-main: src/server/lessons, src/server/parent

#### `writing_piece` — `writingPieces` · jg-plan `src/db/schema.ts:640` · created `0032` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| lesson_id | text | Text | NOT NULL |  |
| opened_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| draft | text | Text | null |  |
| draft_words | integer | Integer | null |  |
| draft_at | timestamp with time zone | DateTime(tz) | null |  |
| feedback | jsonb | JSONB | null |  |
| feedback_by | text | Text | null |  |
| ai_run_id | text | Text | null |  |
| revision | text | Text | null |  |
| revision_words | integer | Integer | null |  |
| revision_at | timestamp with time zone | DateTime(tz) | null |  |
| revisions | integer | Integer | NOT NULL | 0 |
| done_at | timestamp with time zone | DateTime(tz) | null |  |
| coins | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, lesson_id) `writing_piece_student_id_lesson_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`writing_piece_student_id_user_id_fk`)
- CHECK: `writing_piece_by`: "feedback_by" is null or "feedback_by" in ('ai', 'self')
- Used by 1 non-test file(s) on m1-main: src/server/lessons

#### `speaking_practice` — `speakingPractice` · jg-plan `src/db/schema.ts:655` · created `0035` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| lesson_id | text | Text | NOT NULL |  |
| opened_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| plan_at | timestamp with time zone | DateTime(tz) | null |  |
| talk_at | timestamp with time zone | DateTime(tz) | null |  |
| plan_s | integer | Integer | null |  |
| talk_s | integer | Integer | null |  |
| ticks | jsonb | JSONB | null |  |
| checked_at | timestamp with time zone | DateTime(tz) | null |  |
| attempts | integer | Integer | NOT NULL | 0 |
| done_at | timestamp with time zone | DateTime(tz) | null |  |
| coins | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, lesson_id) `speaking_practice_student_id_lesson_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`speaking_practice_student_id_user_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/server/lessons


### Video lessons and entitlements (4)

#### `video_source` — `videoSources` · jg-plan `src/db/schema.ts:669` · created `0037` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL |  |
| file_key | text | Text | NOT NULL |  |
| name | text | Text | NOT NULL |  |
| origin | text | Text | NOT NULL |  |
| bytes | double precision | Double | NOT NULL | 0 |
| duration_s | double precision | Double | NOT NULL | 0 |
| teacher_name | text | Text | null |  |
| teacher_consent | boolean | Boolean | NOT NULL | false |
| captions | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| created_by | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| file_removed_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- CHECK: `video_source_origin`: "origin" in ('upload', 'register'); `video_source_teacher`: "teacher_name" is null or "teacher_consent"
- Used by 3 non-test file(s) on m1-main: src/server/video

#### `video_clip` — `videoClips` · jg-plan `src/db/schema.ts:681` · created `0037` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL |  |
| source_id | text | Text | NOT NULL |  |
| lesson_id | text | Text | NOT NULL |  |
| course | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| piece_n | integer | Integer | null |  |
| start_s | double precision | Double | NOT NULL |  |
| end_s | double precision | Double | NOT NULL |  |
| duration_s | double precision | Double | NOT NULL | 0 |
| file_key | text | Text | null |  |
| poster_key | text | Text | null |  |
| bytes | double precision | Double | NOT NULL | 0 |
| status | text | Text | NOT NULL |  |
| error | text | Text | null |  |
| captions | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| created_by | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: source_id → video_source.id ON DELETE CASCADE (`video_clip_source_id_video_source_id_fk`)
- Indexes: `video_clip_lesson` (lesson_id); `video_clip_source` (source_id); UNIQUE `video_clip_piece` (lesson_id, piece_n) WHERE "kind" = 'clip'; UNIQUE `video_clip_whole` (lesson_id) WHERE "kind" = 'whole'
- CHECK: `video_clip_kind`: "kind" in ('clip', 'whole'); `video_clip_status`: "status" in ('processing', 'ready', 'failed'); `video_clip_piece_n`: ("kind" = 'clip') = ("piece_n" is not null); `video_clip_span`: "end_s" > "start_s" and "start_s" >= 0
- Used by 5 non-test file(s) on m1-main: src/app/api/v1, src/server/video

#### `video_watch` — `videoWatches` · jg-plan `src/db/schema.ts:697` · created `0037` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| clip_id | text | Text | NOT NULL |  |
| seen | text | Text | NOT NULL | '' |
| seen_s | integer | Integer | NOT NULL | 0 |
| of_s | integer | Integer | NOT NULL | 0 |
| first_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, clip_id) `video_watch_student_id_clip_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`video_watch_student_id_user_id_fk`); clip_id → video_clip.id ON DELETE CASCADE (`video_watch_clip_id_video_clip_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/server/video

#### `entitlement` — `entitlements` · jg-plan `src/db/schema.ts:706` · created `0037` · touched later by - · prod ✓

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| what | text | Text | NOT NULL |  |
| granted_by | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| revoked_at | timestamp with time zone | DateTime(tz) | null |  |
| revoked_by | text | Text | null |  |

- PK: (student_id, what) `entitlement_student_id_what_pk`
- FK: student_id → user.id ON DELETE CASCADE (`entitlement_student_id_user_id_fk`)
- CHECK: `entitlement_what`: "what" in ('online_premium')
- Used by 3 non-test file(s) on m1-main: src/server/pay, src/server/video


### Games and League (10)

#### `game_result` — `gameResults` · jg-plan `src/db/schema.ts:724` · created `0044` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| result | text | Text | NOT NULL |  |
| why | text | Text | null |  |
| verified | boolean | Boolean | NOT NULL |  |
| moves | jsonb | JSONB | NOT NULL |  |
| rating_before | integer | Integer | null |  |
| rating_after | integer | Integer | null |  |
| coins | integer | Integer | NOT NULL | 0 |
| client_id | text | Text | NOT NULL |  |
| local_date | date | Date | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`game_result_student_id_user_id_fk`)
- Indexes: UNIQUE `game_result_client` (student_id, client_id); `game_result_student` (student_id, at)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 3 non-test file(s) on m1-main: src/server/core, src/server/games

#### `game_rating` — `gameRatings` · jg-plan `src/db/schema.ts:730` · created `0044` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| rating | integer | Integer | NOT NULL |  |
| games | integer | Integer | NOT NULL | 0 |
| wins | integer | Integer | NOT NULL | 0 |
| draws | integer | Integer | NOT NULL | 0 |
| losses | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, kind) `game_rating_student_id_kind_pk`
- FK: student_id → user.id ON DELETE CASCADE (`game_rating_student_id_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/core, src/server/games

#### `game_daily_answer` — `gameDailyAnswers` · jg-plan `src/db/schema.ts:735` · created `0044` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| date | date | Date | NOT NULL |  |
| qid | text | Text | NOT NULL |  |
| choice | integer | Integer | NOT NULL |  |
| correct | boolean | Boolean | NOT NULL |  |
| seconds | integer | Integer | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, date) `game_daily_answer_student_id_date_pk`
- FK: student_id → user.id ON DELETE CASCADE (`game_daily_answer_student_id_user_id_fk`)
- Indexes: `game_daily_answer_date` (date)
- Used by 2 non-test file(s) on m1-main: src/server/core, src/server/games

#### `game_campus_round` — `gameCampusRounds` · jg-plan `src/db/schema.ts:740` · created `0044` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| student_id | text | Text | NOT NULL |  |
| date | date | Date | NOT NULL |  |
| round | integer | Integer | NOT NULL |  |
| campus_id | text | Text | NOT NULL |  |
| lat | double precision | Double | NOT NULL |  |
| lon | double precision | Double | NOT NULL |  |
| km | integer | Integer | NOT NULL |  |
| points | integer | Integer | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (student_id, date, round) `game_campus_round_student_id_date_round_pk`
- FK: student_id → user.id ON DELETE CASCADE (`game_campus_round_student_id_user_id_fk`)
- Indexes: `game_campus_round_date` (date)
- Used by 2 non-test file(s) on m1-main: src/server/core, src/server/games

#### `game_play` — `gamePlays` · m1-main `src/db/schema-games.ts:15` (not in jg-plan) · created `0056` · touched later by - · prod ✗, jg-plan ✗ (m1-main 0051-0056 only)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| moves | jsonb | JSONB | NOT NULL |  |
| state | text | Text | NOT NULL | 'open' |
| her_ms | integer | Integer | NOT NULL | 0 |
| started_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| last_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| local_date | date | Date | NOT NULL |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`game_play_student_id_user_id_fk`)
- Indexes: `game_play_student` (student_id, state)
- Used by 1 non-test file(s) on m1-main: src/server/games

#### `game_computer` — `gameComputer` · m1-main `src/db/schema-games.ts:22` (not in jg-plan) · created `0056` · touched later by - · prod ✗, jg-plan ✗ (m1-main 0051-0056 only)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **kind** (PK) | text | Text | NOT NULL |  |
| rating | integer | Integer | NOT NULL |  |
| games | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: kind
- Used by 1 non-test file(s) on m1-main: src/server/games

#### `league_week` — `leagueWeeks` · jg-plan `src/db/schema-league.ts:14` · created `0045` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **week** (PK) | date | Date | NOT NULL |  |
| state | text | Text | NOT NULL | 'open' |
| opened_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| closed_at | timestamp with time zone | DateTime(tz) | null |  |
| dbh | jsonb | JSONB | NOT NULL |  |
| recap | jsonb | JSONB | null |  |

- PK: week
- Used by 2 non-test file(s) on m1-main: src/server/league

#### `league_cohort` — `leagueCohorts` · jg-plan `src/db/schema-league.ts:21` · created `0045` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| week | date | Date | NOT NULL |  |
| tier | integer | Integer | NOT NULL |  |
| stage | text | Text | NOT NULL |  |
| chat_id | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: week → league_week.week ON DELETE CASCADE (`league_cohort_week_league_week_week_fk`)
- Indexes: `league_cohort_fill` (week, tier, stage)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/chat, src/server/league

#### `league_member` — `leagueMembers` · jg-plan `src/db/schema-league.ts:28` · created `0045` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| week | date | Date | NOT NULL |  |
| student_id | text | Text | NOT NULL |  |
| cohort_id | text | Text | NOT NULL |  |
| tier | integer | Integer | NOT NULL |  |
| joined_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| final_xp | integer | Integer | null |  |
| final_rank | integer | Integer | null |  |
| outcome | text | Text | null |  |

- PK: (week, student_id) `league_member_week_student_id_pk`
- FK: student_id → user.id ON DELETE CASCADE (`league_member_student_id_user_id_fk`); cohort_id → league_cohort.id ON DELETE CASCADE (`league_member_cohort_id_league_cohort_id_fk`)
- Indexes: `league_member_cohort` (cohort_id)
- Used by 4 non-test file(s) on m1-main: src/server/chat, src/server/core, src/server/league

#### `league_player` — `leaguePlayers` · jg-plan `src/db/schema-league.ts:35` · created `0045` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **student_id** (PK) | text | Text | NOT NULL |  |
| tier | integer | Integer | NOT NULL | 0 |
| best_tier | integer | Integer | NOT NULL | 0 |
| weeks | integer | Integer | NOT NULL | 0 |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: student_id
- FK: student_id → user.id ON DELETE CASCADE (`league_player_student_id_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/core, src/server/league


### Chat (raw postgres.js, LISTEN/NOTIFY) (7)

#### `chat` — `chats` · jg-plan `src/db/chat-schema.ts:11` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| name | text | Text | null |  |
| about | text | Text | null |  |
| ref | text | Text | null |  |
| parent_id | text | Text | null |  |
| status | text | Text | NOT NULL | 'active' |
| created_by | text | Text | null |  |
| dm_key | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| last_message_id | bigint | BigInteger | null |  |
| last_message_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: parent_id → chat.id ON DELETE CASCADE (`chat_parent_id_chat_id_fk`); created_by → user.id ON DELETE SET NULL (`chat_created_by_user_id_fk`)
- UNIQUE constraint: `chat_dm_key_unique` (dm_key)
- Indexes: UNIQUE `chat_league_ref` (ref) WHERE "kind" = 'league'; `chat_parent` (parent_id)
- CHECK: `chat_kind`: "kind" in ('dm', 'group', 'club_channel', 'club_topic', 'league', 'global'); `chat_status`: "status" in ('active', 'request', 'declined', 'pending', 'rejected', 'closed')
- Used by 7 non-test file(s) on m1-main: src/server/chat

#### `chat_member` — `chatMembers` · jg-plan `src/db/chat-schema.ts:33` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| chat_id | text | Text | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| role | text | Text | NOT NULL | 'member' |
| muted | boolean | Boolean | NOT NULL | false |
| last_read | bigint | BigInteger | NOT NULL | 0 |
| joined_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (chat_id, user_id) `chat_member_chat_id_user_id_pk`
- FK: chat_id → chat.id ON DELETE CASCADE (`chat_member_chat_id_chat_id_fk`); user_id → user.id ON DELETE CASCADE (`chat_member_user_id_user_id_fk`)
- Indexes: `chat_member_user` (user_id)
- CHECK: `chat_member_role`: "role" in ('owner', 'admin', 'member')
- Used by 4 non-test file(s) on m1-main: src/server/chat

#### `chat_message` — `chatMessages` · jg-plan `src/db/chat-schema.ts:46` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | bigserial | BigInteger (bigserial) | NOT NULL | nextval(chat_message_id_seq) |
| chat_id | text | Text | NOT NULL |  |
| sender_id | text | Text | null |  |
| kind | text | Text | NOT NULL | 'text' |
| text | text | Text | NOT NULL | '' |
| reply_to | bigint | BigInteger | null |  |
| status | text | Text | NOT NULL | 'sent' |
| client_id | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| edited_at | timestamp with time zone | DateTime(tz) | null |  |
| deleted_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: chat_id → chat.id ON DELETE CASCADE (`chat_message_chat_id_chat_id_fk`); sender_id → user.id ON DELETE SET NULL (`chat_message_sender_id_user_id_fk`); reply_to → chat_message.id ON DELETE SET NULL (`chat_message_reply_to_chat_message_id_fk`)
- Indexes: `chat_message_chat` (chat_id, id); UNIQUE `chat_message_client` (sender_id, client_id) WHERE "client_id" is not null
- CHECK: `chat_message_kind`: "kind" in ('text', 'poll', 'system', 'jamol'); `chat_message_status`: "status" in ('sent', 'held'); `chat_message_len`: char_length("text") <= 4000
- Used by 6 non-test file(s) on m1-main: src/server/chat

#### `chat_reaction` — `chatReactions` · jg-plan `src/db/chat-schema.ts:67` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| message_id | bigint | BigInteger | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| emoji | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (message_id, user_id) `chat_reaction_message_id_user_id_pk`
- FK: message_id → chat_message.id ON DELETE CASCADE (`chat_reaction_message_id_chat_message_id_fk`); user_id → user.id ON DELETE CASCADE (`chat_reaction_user_id_user_id_fk`)
- Used by 4 non-test file(s) on m1-main: src/server/chat

#### `chat_pin` — `chatPins` · jg-plan `src/db/chat-schema.ts:74` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| chat_id | text | Text | NOT NULL |  |
| message_id | bigint | BigInteger | NOT NULL |  |
| pinned_by | text | Text | null |  |
| pinned_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (chat_id, message_id) `chat_pin_chat_id_message_id_pk`
- FK: chat_id → chat.id ON DELETE CASCADE (`chat_pin_chat_id_chat_id_fk`); message_id → chat_message.id ON DELETE CASCADE (`chat_pin_message_id_chat_message_id_fk`); pinned_by → user.id ON DELETE SET NULL (`chat_pin_pinned_by_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/chat

#### `chat_poll` — `chatPolls` · jg-plan `src/db/chat-schema.ts:82` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **message_id** (PK) | bigint | BigInteger | NOT NULL |  |
| question | text | Text | NOT NULL |  |
| options | jsonb | JSONB | NOT NULL |  |
| anonymous | boolean | Boolean | NOT NULL | true |
| closed_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: message_id
- FK: message_id → chat_message.id ON DELETE CASCADE (`chat_poll_message_id_chat_message_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/server/chat

#### `chat_poll_vote` — `chatPollVotes` · jg-plan `src/db/chat-schema.ts:89` · created `0040` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| message_id | bigint | BigInteger | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| option | integer | Integer | NOT NULL |  |
| voted_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (message_id, user_id) `chat_poll_vote_message_id_user_id_pk`
- FK: message_id → chat_poll.message_id ON DELETE CASCADE (`chat_poll_vote_message_id_chat_poll_message_id_fk`); user_id → user.id ON DELETE CASCADE (`chat_poll_vote_user_id_user_id_fk`)
- Used by 2 non-test file(s) on m1-main: src/server/chat


### Community (13)

#### `community_profile` — `communityProfiles` · jg-plan `src/db/schema-community.ts:21` · created `0041` · touched later by 0055 · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **user_id** (PK) | text | Text | NOT NULL |  |
| handle | text | Text | NOT NULL |  |
| bio | text | Text | NOT NULL | '' |
| show_photo | boolean | Boolean | NOT NULL | false |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| bio_pending | text | Text | null |  |
| bio_review_id | text | Text | null |  |

- PK: user_id
- FK: user_id → user.id ON DELETE CASCADE (`community_profile_user_id_user_id_fk`)
- Indexes: UNIQUE `community_profile_handle` (handle)
- CHECK: `community_profile_handle_ok`: "handle" ~ '^[a-z0-9_.]{3,20}$'; `community_profile_bio`: char_length("bio") <= 150
- Used by 9 non-test file(s) on m1-main: src/server/community

#### `community_avatar` — `communityAvatars` · m1-main `src/db/schema-m1b-safesocial.ts:12` (not in jg-plan) · created `0055` · touched later by - · prod ✗, jg-plan ✗ (m1-main 0051-0056 only)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **user_id** (PK) | text | Text | NOT NULL |  |
| version | text | Text | NOT NULL |  |
| bytes | bytea | LargeBinary | NOT NULL |  |
| status | text | Text | NOT NULL | 'pending' |
| review_id | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: user_id
- FK: user_id → user.id ON DELETE CASCADE (`community_avatar_user_id_user_id_fk`; **real DB name `community_avatar_user_id_fkey`**)
- CHECK: `community_avatar_status`: "status" in ('pending', 'approved', 'rejected')
- Used by 2 non-test file(s) on m1-main: src/server/community

#### `community_media` — `communityMedia` · jg-plan `src/db/schema-community.ts:30` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| owner_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL |  |
| error | text | Text | null |  |
| file_key | text | Text | null |  |
| poster_key | text | Text | null |  |
| src_key | text | Text | null |  |
| mime | text | Text | null |  |
| bytes | double precision | Double | NOT NULL | 0 |
| width | integer | Integer | null |  |
| height | integer | Integer | null |  |
| duration_s | double precision | Double | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| used_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: owner_id → user.id ON DELETE CASCADE (`community_media_owner_id_user_id_fk`)
- Indexes: `community_media_owner` (owner_id, created_at)
- CHECK: `community_media_kind`: "kind" in ('photo', 'video'); `community_media_status`: "status" in ('processing', 'ready', 'failed')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/community, src/server/media

#### `community_post` — `communityPosts` · jg-plan `src/db/schema-community.ts:39` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| author_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| text | text | Text | NOT NULL | '' |
| media_id | text | Text | null |  |
| poll | text[] | ARRAY(Text) | null |  |
| style | jsonb | JSONB | null |  |
| status | text | Text | NOT NULL | 'pending' |
| review_id | text | Text | null |  |
| reject_reason | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |
| approved_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: author_id → user.id ON DELETE CASCADE (`community_post_author_id_user_id_fk`); media_id → community_media.id ON DELETE SET NULL (`community_post_media_id_community_media_id_fk`)
- Indexes: `community_post_feed` (status, approved_at); `community_post_author` (author_id, created_at)
- CHECK: `community_post_kind`: "kind" in ('post', 'reel'); `community_post_status`: "status" in ('pending', 'approved', 'rejected'); `community_post_poll`: "poll" is null or array_length("poll", 1) between 2 and 4
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 8 non-test file(s) on m1-main: src/server/community

#### `community_poll_vote` — `communityPollVotes` · jg-plan `src/db/schema-community.ts:48` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| post_id | text | Text | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| option | integer | Integer | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (post_id, user_id) `community_poll_vote_post_id_user_id_pk`
- FK: post_id → community_post.id ON DELETE CASCADE (`community_poll_vote_post_id_community_post_id_fk`); user_id → user.id ON DELETE CASCADE (`community_poll_vote_user_id_user_id_fk`)
- CHECK: `community_poll_vote_option`: "option" between 0 and 3
- Used by 3 non-test file(s) on m1-main: src/server/community

#### `community_comment` — `communityComments` · jg-plan `src/db/schema-community.ts:54` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| post_id | text | Text | NOT NULL |  |
| author_id | text | Text | NOT NULL |  |
| parent_id | text | Text | null |  |
| text | text | Text | NOT NULL |  |
| status | text | Text | NOT NULL | 'pending' |
| review_id | text | Text | null |  |
| reject_reason | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: post_id → community_post.id ON DELETE CASCADE (`community_comment_post_id_community_post_id_fk`); author_id → user.id ON DELETE CASCADE (`community_comment_author_id_user_id_fk`); parent_id → community_comment.id ON DELETE CASCADE (`community_comment_parent_id_community_comment_id_fk`)
- Indexes: `community_comment_post` (post_id, created_at); `community_comment_parent` (parent_id)
- CHECK: `community_comment_status`: "status" in ('pending', 'approved', 'rejected'); `community_comment_len`: char_length("text") between 1 and 500
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 6 non-test file(s) on m1-main: src/server/community

#### `community_like` — `communityLikes` · jg-plan `src/db/schema-community.ts:62` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| post_id | text | Text | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (post_id, user_id) `community_like_post_id_user_id_pk`
- FK: post_id → community_post.id ON DELETE CASCADE (`community_like_post_id_community_post_id_fk`); user_id → user.id ON DELETE CASCADE (`community_like_user_id_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/community

#### `community_save` — `communitySaves` · jg-plan `src/db/schema-community.ts:67` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| post_id | text | Text | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (user_id, post_id) `community_save_user_id_post_id_pk`
- FK: post_id → community_post.id ON DELETE CASCADE (`community_save_post_id_community_post_id_fk`); user_id → user.id ON DELETE CASCADE (`community_save_user_id_user_id_fk`)
- Indexes: `community_save_user` (user_id, at)
- Used by 3 non-test file(s) on m1-main: src/server/community

#### `community_view` — `communityViews` · jg-plan `src/db/schema-community.ts:72` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| post_id | text | Text | NOT NULL |  |
| user_id | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (post_id, user_id) `community_view_post_id_user_id_pk`
- FK: post_id → community_post.id ON DELETE CASCADE (`community_view_post_id_community_post_id_fk`); user_id → user.id ON DELETE CASCADE (`community_view_user_id_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/community

#### `community_story` — `communityStories` · jg-plan `src/db/schema-community.ts:77` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| author_id | text | Text | NOT NULL |  |
| text | text | Text | NOT NULL | '' |
| media_id | text | Text | null |  |
| style | jsonb | JSONB | null |  |
| status | text | Text | NOT NULL | 'pending' |
| review_id | text | Text | null |  |
| reject_reason | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |
| expires_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |

- PK: id
- FK: author_id → user.id ON DELETE CASCADE (`community_story_author_id_user_id_fk`); media_id → community_media.id ON DELETE SET NULL (`community_story_media_id_community_media_id_fk`)
- Indexes: `community_story_author` (author_id, expires_at)
- CHECK: `community_story_status`: "status" in ('pending', 'approved', 'rejected')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 6 non-test file(s) on m1-main: src/server/community

#### `community_story_view` — `communityStoryViews` · jg-plan `src/db/schema-community.ts:84` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| story_id | text | Text | NOT NULL |  |
| viewer_id | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (story_id, viewer_id) `community_story_view_story_id_viewer_id_pk`
- FK: story_id → community_story.id ON DELETE CASCADE (`community_story_view_story_id_community_story_id_fk`); viewer_id → user.id ON DELETE CASCADE (`community_story_view_viewer_id_user_id_fk`)
- Used by 3 non-test file(s) on m1-main: src/server/community

#### `community_follow` — `communityFollows` · jg-plan `src/db/schema-community.ts:89` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| follower_id | text | Text | NOT NULL |  |
| followee_id | text | Text | NOT NULL |  |
| state | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (follower_id, followee_id) `community_follow_follower_id_followee_id_pk`
- FK: follower_id → user.id ON DELETE CASCADE (`community_follow_follower_id_user_id_fk`); followee_id → user.id ON DELETE CASCADE (`community_follow_followee_id_user_id_fk`)
- Indexes: `community_follow_followee` (followee_id, state)
- CHECK: `community_follow_state`: "state" in ('following', 'requested'); `community_follow_self`: "follower_id" <> "followee_id"
- Used by 5 non-test file(s) on m1-main: src/server/community

#### `community_note` — `communityNotes` · jg-plan `src/db/schema-community.ts:95` · created `0041` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| user_id | text | Text | NOT NULL |  |
| actor_id | text | Text | null |  |
| kind | text | Text | NOT NULL |  |
| target_kind | text | Text | null |  |
| target_id | text | Text | null |  |
| text | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| read_at | timestamp with time zone | DateTime(tz) | null |  |

- PK: id
- FK: user_id → user.id ON DELETE CASCADE (`community_note_user_id_user_id_fk`); actor_id → user.id ON DELETE CASCADE (`community_note_actor_id_user_id_fk`)
- Indexes: `community_note_user` (user_id, created_at)
- CHECK: `community_note_kind`: "kind" in ('like', 'comment', 'reply', 'follow', 'follow_request', 'follow_accepted', 'approved', 'rejected')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/community


### Moderation and safety (6)

#### `staff_member` — `staffMembers` · jg-plan `src/db/schema-moderation.ts:30` · created `0039` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| user_id | text | Text | NOT NULL |  |
| role | text | Text | NOT NULL |  |
| on_duty | boolean | Boolean | NOT NULL | false |
| added_by | text | Text | NOT NULL |  |
| added_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| removed_at | timestamp with time zone | DateTime(tz) | null |  |
| removed_by | text | Text | null |  |

- PK: (user_id, role) `staff_member_user_id_role_pk`
- FK: user_id → user.id ON DELETE CASCADE (`staff_member_user_id_user_id_fk`)
- CHECK: `staff_member_role`: "role" in ('admin', 'moderator', 'counselor', 'teacher', 'coordinator')
- Used by 4 non-test file(s) on m1-main: src/server/chat, src/server/community, src/server/core, src/server/moderation

#### `moderation_item` — `moderationItems` · jg-plan `src/db/schema-moderation.ts:36` · created `0039` · touched later by 0054, 0055 · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| kind | text | Text | NOT NULL |  |
| ref_id | text | Text | NOT NULL |  |
| author_id | text | Text | NOT NULL |  |
| subject_id | text | Text | null |  |
| text | text | Text | null |  |
| media_ids | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| meta | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| status | text | Text | NOT NULL | 'pending' |
| urgent | boolean | Boolean | NOT NULL | false |
| ai | jsonb | JSONB | null |  |
| one_tap | boolean | Boolean | NOT NULL | false |
| screen | jsonb | JSONB | NOT NULL | '[]'::jsonb |
| decided_by | text | Text | null |  |
| decided_at | timestamp with time zone | DateTime(tz) | null |  |
| reason | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| updated_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: author_id → user.id ON DELETE CASCADE (`moderation_item_author_id_user_id_fk`); subject_id → user.id ON DELETE SET NULL (`moderation_item_subject_id_user_id_fk`); decided_by → user.id ON DELETE SET NULL (`moderation_item_decided_by_user_id_fk`)
- Indexes: UNIQUE `moderation_item_ref` (kind, ref_id); `moderation_item_queue` (status, urgent, created_at); `moderation_item_author` (author_id)
- CHECK: `moderation_item_kind`: "kind" in ('post', 'story', 'reel', 'comment', 'club', 'chat_report', 'user_report', 'milestone_report', 'score_report', 'chat_message', 'profile'); `moderation_item_status`: "status" in ('pending', 'approved', 'rejected', 'taken_down')
- DB text of `moderation_item_kind` lists `'profile'` right after `'club'` (0055 DO block), not last (§1.2 item 3).
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 3 non-test file(s) on m1-main: src/server/chat, src/server/moderation

#### `moderation_audit` — `moderationAudit` · jg-plan `src/db/schema-moderation.ts:49` · created `0039` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| item_id | text | Text | null |  |
| action | text | Text | NOT NULL |  |
| actor_id | text | Text | NOT NULL |  |
| target_user_id | text | Text | null |  |
| reason | text | Text | null |  |
| meta | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: item_id → moderation_item.id ON DELETE SET NULL (`moderation_audit_item_id_moderation_item_id_fk`)
- Indexes: `moderation_audit_item` (item_id); `moderation_audit_at` (at)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 2 non-test file(s) on m1-main: src/server/core, src/server/moderation

#### `report` — `reports` · jg-plan `src/db/schema-moderation.ts:55` · created `0039` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| reporter_id | text | Text | NOT NULL |  |
| target | text | Text | NOT NULL |  |
| target_user_id | text | Text | null |  |
| target_ref | text | Text | null |  |
| label | text | Text | null |  |
| reason | text | Text | NOT NULL |  |
| note | text | Text | null |  |
| urgent | boolean | Boolean | NOT NULL | false |
| surface | text | Text | null |  |
| status | text | Text | NOT NULL | 'open' |
| item_id | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: reporter_id → user.id ON DELETE CASCADE (`report_reporter_id_user_id_fk`); target_user_id → user.id ON DELETE SET NULL (`report_target_user_id_user_id_fk`); item_id → moderation_item.id ON DELETE SET NULL (`report_item_id_moderation_item_id_fk`)
- Indexes: `report_open` (status, urgent, created_at); `report_reporter` (reporter_id)
- CHECK: `report_target`: "target" in ('message', 'profile', 'post', 'story', 'reel', 'comment', 'club', 'member', 'other'); `report_reason`: "reason" in ('spam', 'bullying', 'inappropriate', 'not_educational', 'danger', 'other'); `report_status`: "status" in ('open', 'resolved', 'dismissed')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 5 non-test file(s) on m1-main: src/server/chat, src/server/core, src/server/moderation

#### `user_block` — `userBlocks` · jg-plan `src/db/schema-moderation.ts:66` · created `0039` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| blocker_id | text | Text | NOT NULL |  |
| blocked_id | text | Text | NOT NULL |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: (blocker_id, blocked_id) `user_block_blocker_id_blocked_id_pk`
- FK: blocker_id → user.id ON DELETE CASCADE (`user_block_blocker_id_user_id_fk`); blocked_id → user.id ON DELETE CASCADE (`user_block_blocked_id_user_id_fk`)
- Indexes: `user_block_blocked` (blocked_id)
- CHECK: `user_block_self`: "blocker_id" <> "blocked_id"
- Used by 4 non-test file(s) on m1-main: src/server/community, src/server/core, src/server/moderation

#### `account_suspension` — `accountSuspensions` · jg-plan `src/db/schema-moderation.ts:71` · created `0039` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| user_id | text | Text | NOT NULL |  |
| by | text | Text | NOT NULL |  |
| reason | text | Text | NOT NULL |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| until | timestamp with time zone | DateTime(tz) | null |  |
| lifted_at | timestamp with time zone | DateTime(tz) | null |  |
| lifted_by | text | Text | null |  |

- PK: id
- FK: user_id → user.id ON DELETE CASCADE (`account_suspension_user_id_user_id_fk`)
- Indexes: `account_suspension_user` (user_id)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 3 non-test file(s) on m1-main: src/server/chat, src/server/moderation


### Payments and plans (7)

#### `pay_order` — `payOrders` · jg-plan `src/db/schema-pay.ts:25` · created `0042` · touched later by 0053 · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| number | bigint | BigInteger, Identity(always=True, start=100001) | NOT NULL | identity always start 100001 |
| kind | text | Text | NOT NULL |  |
| student_id | text | Text | null |  |
| payer_id | text | Text | null |  |
| payer_role | text | Text | NOT NULL |  |
| tier | text | Text | NOT NULL |  |
| period | text | Text | NOT NULL |  |
| months | integer | Integer | NOT NULL |  |
| list_usd_cents | integer | Integer | NOT NULL |  |
| price_usd_cents | integer | Integer | NOT NULL |  |
| coupon_id | text | Text | null |  |
| amount_uzs | bigint | BigInteger | NOT NULL |  |
| fx_uzs_per_usd | integer | Integer | NOT NULL |  |
| fx_source | text | Text | NOT NULL |  |
| sandbox | boolean | Boolean | NOT NULL | false |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: student_id → user.id ON DELETE SET NULL (`pay_order_student_id_user_id_fk`); payer_id → user.id ON DELETE SET NULL (`pay_order_payer_id_user_id_fk`)
- On jg-plan (0042) both FKs were ON DELETE RESTRICT, `payer_id` NOT NULL and `pay_order_plan_student` was `(kind = 'plan') = (student_id is not null)`; 0053 changed them to the values above.
- Indexes: UNIQUE `pay_order_number` (number); `pay_order_student` (student_id); `pay_order_payer` (payer_id)
- CHECK: `pay_order_kind`: "kind" in ('plan', 'gift'); `pay_order_tier`: "tier" in ('pro', 'premium', 'vip'); `pay_order_period`: "period" in ('monthly', 'annual', 'months'); `pay_order_payer_role`: "payer_role" in ('student', 'parent'); `pay_order_amount`: "amount_uzs" > 0 and "price_usd_cents" > 0 and "months" between 1 and 12; `pay_order_plan_student`: "kind" <> 'gift' or "student_id" is null
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 9 non-test file(s) on m1-main: src/app/api/v1, src/server/core, src/server/pay

#### `pay_txn` — `payTxns` · jg-plan `src/db/schema-pay.ts:55` · created `0042` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| seq | bigint | BigInteger, Identity(always=True, start=1) | NOT NULL | identity always start 1 |
| provider | text | Text | NOT NULL |  |
| provider_ref | text | Text | NOT NULL |  |
| order_id | text | Text | NOT NULL |  |
| amount_uzs | bigint | BigInteger | NOT NULL |  |
| provider_time | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| paid_at | timestamp with time zone | DateTime(tz) | null |  |
| cancelled_at | timestamp with time zone | DateTime(tz) | null |  |
| cancel_reason | integer | Integer | null |  |
| refunded_at | timestamp with time zone | DateTime(tz) | null |  |
| refunded_by | text | Text | null |  |

- PK: id
- FK: order_id → pay_order.id ON DELETE RESTRICT (`pay_txn_order_id_pay_order_id_fk`)
- Indexes: UNIQUE `pay_txn_seq` (seq); UNIQUE `pay_txn_provider_ref` (provider, provider_ref); `pay_txn_order` (order_id); UNIQUE `pay_txn_order_paid` (order_id) WHERE "paid_at" is not null and "cancelled_at" is null
- CHECK: `pay_txn_provider`: "provider" in ('payme', 'click')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 5 non-test file(s) on m1-main: src/server/pay

#### `subscription` — `subscriptions` · jg-plan `src/db/schema-pay.ts:78` · created `0042` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| tier | text | Text | NOT NULL |  |
| starts_on | date | Date | NOT NULL |  |
| ends_on | date | Date | NOT NULL |  |
| source | text | Text | NOT NULL |  |
| order_id | text | Text | null |  |
| gift_id | text | Text | null |  |
| coupon_id | text | Text | null |  |
| payer_id | text | Text | null |  |
| gifted_by | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| ended_at | timestamp with time zone | DateTime(tz) | null |  |
| ended_reason | text | Text | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`subscription_student_id_user_id_fk`); order_id → pay_order.id ON DELETE RESTRICT (`subscription_order_id_pay_order_id_fk`)
- Indexes: `subscription_student` (student_id, ends_on)
- CHECK: `subscription_tier`: "tier" in ('pro', 'premium', 'vip'); `subscription_source`: "source" in ('payment', 'gift', 'coupon', 'staff'); `subscription_days`: "ends_on" > "starts_on"
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/core, src/server/pay

#### `pay_gift` — `payGifts` · jg-plan `src/db/schema-pay.ts:103` · created `0042` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| code_hash | text | Text | NOT NULL |  |
| order_id | text | Text | NOT NULL |  |
| tier | text | Text | NOT NULL |  |
| months | integer | Integer | NOT NULL |  |
| from_id | text | Text | NOT NULL |  |
| note | text | Text | NOT NULL | '' |
| for_name | text | Text | NOT NULL | '' |
| claimed_by | text | Text | null |  |
| claimed_at | timestamp with time zone | DateTime(tz) | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- FK: order_id → pay_order.id ON DELETE RESTRICT (`pay_gift_order_id_pay_order_id_fk`); claimed_by → user.id ON DELETE SET NULL (`pay_gift_claimed_by_user_id_fk`)
- Indexes: UNIQUE `pay_gift_code` (code_hash); UNIQUE `pay_gift_order` (order_id)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/pay

#### `pay_coupon` — `payCoupons` · jg-plan `src/db/schema-pay.ts:119` · created `0042` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| student_id | text | Text | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| source | text | Text | NOT NULL |  |
| source_ref | text | Text | null |  |
| created_at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |
| expires_at | timestamp with time zone | DateTime(tz) | NOT NULL |  |
| used_at | timestamp with time zone | DateTime(tz) | null |  |
| used_order_id | text | Text | null |  |

- PK: id
- FK: student_id → user.id ON DELETE CASCADE (`pay_coupon_student_id_user_id_fk`)
- Indexes: `pay_coupon_student` (student_id); UNIQUE `pay_coupon_source` (source, source_ref)
- CHECK: `pay_coupon_kind`: "kind" in ('premium_30', 'pro_month')
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 4 non-test file(s) on m1-main: src/server/pay

#### `pay_event` — `payEvents` · jg-plan `src/db/schema-pay.ts:137` · created `0042` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| **id** (PK) | text | Text | NOT NULL | *(app: uuid4)* |
| txn_id | text | Text | null |  |
| order_id | text | Text | null |  |
| action | text | Text | NOT NULL |  |
| meta | jsonb | JSONB | NOT NULL | '{}'::jsonb |
| by | text | Text | null |  |
| at | timestamp with time zone | DateTime(tz) | NOT NULL | now() |

- PK: id
- Indexes: `pay_event_order` (order_id); `pay_event_at` (at)
- App-side default: id = str(uuid4()) (TS $defaultFn crypto.randomUUID)
- Used by 1 non-test file(s) on m1-main: src/server/pay

#### `plan_usage` — `planUsage` · jg-plan `src/db/schema-pay.ts:147` · created `0042` · touched later by - · prod ✗ (jg-plan ✓, needs 0039-0050)

| column | pg type | SQLAlchemy | null | default |
|---|---|---|---|---|
| user_id | text | Text | NOT NULL |  |
| day | date | Date | NOT NULL |  |
| kind | text | Text | NOT NULL |  |
| n | integer | Integer | NOT NULL | 0 |

- PK: (user_id, day, kind) `plan_usage_user_id_day_kind_pk`
- FK: user_id → user.id ON DELETE CASCADE (`plan_usage_user_id_user_id_fk`)
- Used by 1 non-test file(s) on m1-main: src/server/pay
