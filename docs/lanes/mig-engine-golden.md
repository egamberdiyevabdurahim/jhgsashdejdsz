# mig-engine-golden — engine golden parity (lane "golden")

Worktree C:/Users/PC/jg-p4f, branch `mig-engine-golden` from ddbf9d81. Head 5a1600f0 (10 commits; tools/golden/, golden/, backend/, one
.gitignore block). Nothing pushed, nothing deployed, production untouched, no DB, no dev server, no AI call.

## Works end to end (evidence)
- **Generators** `tools/golden/*.ts` (tsx), one command: `npx tsx tools/golden/run.ts [module ...]` (about 2 min for all; content's
  validate() is 85 s of it). **41,504 cases in 12 modules**, canonical JSONL (`golden/engine/<module>/<fn>.jsonl`, keys sorted, -0/NaN/
  Infinity tagged, throws recorded), each module's seed + fixed clock (2026-09-24, 07:00Z, Asia/Tashkent) + `engine_head` in meta.json.
  **Deterministic: two full regenerations, all 41,412 lines byte-identical** (only meta changed when its head field changed).
  Inputs are round-tripped through the canonical JSON before the engine runs, so key order matches what a port reads.
- **Python port** `backend/app/engine/` (Python 3.11.9, `backend/.venv`, deps `backend/requirements-engine.txt`: tzdata, regex, pytest):
  `js.py` (the JS semantics helpers), `dates.py` (+util hash/fnv1a), `admission/math.py`, `admission/us.py` (the chances model core),
  `cat/irt.py`, `learner/elo.py`, `coins.py` (+too-fast), `endings.py`, `content/typed.py`, `content/text.py`, `content/formula.py`,
  `strategy/field.py`, `lessons/levels.py`, `lessons/hw_plan.py` (src/server/lessons/hw-plan.ts), `lessons/mock.py` (+dtm-mock), `data.py`.
- **Harness** `backend/tests/engine/` (pytest, one test per module.fn; `python -m tests.engine.report` prints the table):
  `cd backend && .venv/Scripts/python -m pytest tests/engine -q` -> **104 passed, 4 skipped (unported content fns), 25 s.**

| module | exact | within 1e-10 rel | fail | recorded divergence | not ported yet |
|---|---:|---:|---:|---:|---:|
| dates | 4,753 | 0 | 0 | 0 | 0 |
| admission_math | 2,199 | 221 | 0 | 0 | 0 |
| admission_us | 1,335 | 124 | 0 | 0 | 0 |
| cat_irt | 2,141 | 680 | 0 | 0 | 0 |
| learner_elo | 2,803 | 57 | 0 | 0 | 0 |
| small_rules | 3,029 | 0 | 0 | 78 | 0 |
| homework | 4,291 | 0 | 0 | 0 | 0 |
| content | 13,964 | 1 | 0 | 0 | 1,633 (instantiate, solve, fillRelation, validate) |
| chances / cat_session / schedule / pipeline | 0 | 0 | 0 | 0 | 2,581 / 942 / 396 / 276 |
| **total** | **34,515** | **1,083** | **0** | **78** | **5,828** |

  Max relative error of the tolerated cases: 2.4e-13 (cat_irt), 1.4e-13 (elo), 1.4e-14 (US model), 1.6e-15 (math). Every boolean,
  string, level, mastery state and branch matched exactly. The harness was shown to fail: Python's round() in coinsFor -> 34 failures;
  a wrong fnv1a -> 268; and the formula edge cases caught two real port bugs (Math.ceil(-0.5) = -0; round() of nothing = NaN), fixed.

## What the build lanes should copy
1. **The JS semantics list** in `golden/README.md` (19 items) and the helpers in `backend/app/engine/js.py`: js_round (Math.round),
   imul/u32, js_exp/js_log/js_div/js_sqrt/js_pow/js_max/js_min (Infinity/NaN, not exceptions), JS_WS_CLASS/js_trim (\s and trim),
   utf16_units/utf16_len/first_unit (UTF-16 strings), truthy. Regex rules: `\Z` not `$`, `[0-9]`/re.ASCII for \d \w \b, re.ASCII|IGNORECASE
   for /i without u, the `regex` module for \p{L}/\p{Script=…}. Python's unicodedata is Unicode 14.0; Node 24's ICU is Unicode 17.0.
2. **The recipe** (README "Porting the next module"): port file for file in TS evaluation order, data via `app/engine/data.py`
   (`load_json`, one copy of src/engine/data until cutover, `JG_ENGINE_DATA` override), one adapter per fixture fn, zero fail in the report,
   divergences only with a written reason.
3. **Regenerate fixtures with any engine change** and commit them together: `git diff golden/` is then the engine's behaviour diff.

## Not done
- Python port of the non-leaf engine: pipeline (derive/score/feasibility/plan/narrate/tasks), schedule (strategy fallback, allocate, compose,
  simulate), chances (predict/readiness, uzcut), CAT session/report/scale, content family/solver/validate, i18n/labels/rules. Their fixtures
  exist (5,828 cases) and are the gate for whoever ports them.
- No fixture for Phase D chunks (phase-d.ts) apart from what generateWeek/simulate produce; no fixtures for the server's DB-bound code.

## Risks
- **Size**: golden/ is 32 MB of text (simulate 4.9 MB, pipeline 4 MB, admissionsOf 3.7 MB, cat_irt 2.8 MB). Fine in packs, but heavy in
  every worktree; option: gzip the five largest (the harness reads .jsonl.gz with two lines of change), or trim the random profiles.
- **Merge with mig-backend-skel**: both add `backend/app/__init__.py` (empty here) and `.gitignore` lines for the venv. My tests use
  package-relative imports under `backend/tests/engine` (rootdir `backend`, default prepend import mode); if the skeleton sets
  `--import-mode=importlib`, give tests/engine a conftest or absolute imports. Install `requirements-engine.txt` into the shared venv.
- **Unicode tables** differ between V8 (17.0) and Python (14.0): the 1,200 real stems all matched, but text added later with newer
  characters could classify differently (NFKC, lower(), \p{L}). The `regex` module (2026.9.29) has newer tables than unicodedata.
- **Object.prototype quirk** (78 cases): `knownField('toString')` is truthy in TS; the port reads own keys only. Harmless while the API
  validates m2_field against the bank; recorded in backend/tests/engine/divergences.py.
