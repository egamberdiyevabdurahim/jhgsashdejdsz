# Engine golden fixtures

The TypeScript engine (`src/engine`, plus the pure homework rules in `src/server/lessons/hw-plan.ts`) is the reference. These fixtures record
what it returns for many deterministic inputs, so the Python port (`backend/app/engine`) can be held to it case by case.

## Regenerate

The reference is the TypeScript engine of the legacy app (repo `Jamals Global`), which this repo does not copy. Run the generators
from a checkout of it (its `node_modules`, and its `tsconfig.json`, which maps `@/` to its `src/`); they write into this repo's
`golden/engine/`. `JG_LEGACY_DIR` names that checkout (default: the working directory).

```
cd "$JG_LEGACY_DIR"                                          # e.g. C:/Users/PC/Jamals Global, at the engine head you want recorded
npx tsx <this repo>/tools/golden/run.ts                      # every module (about 2 minutes; content's validate() is most of it)
npx tsx <this repo>/tools/golden/run.ts dates chances        # some modules
```

Deterministic: a second run on the same head writes byte-identical `.jsonl` files (checked 21 Oct 2026: two full runs, all 41,412 lines identical).
`meta.json` records `engine_head`: the last commit that changed what the fixtures depend on (`src/engine`, `hw-plan.ts`, the persona
fixtures, the test support generators), with `+dirty` when the tree had uncommitted changes there. Regenerating on a later head and
running `git diff golden/` shows exactly which engine outputs a change moved.

Fixed clock: today `2026-09-24`, now `2026-09-24T07:00:00.000Z` (12:00 Tashkent), zone `Asia/Tashkent`. A case on another day carries its
own `ctx.today` / `ctx.nowIso`. Rules: `seedSnapshot()`; bank: `BANK` (each case's `ctx` names them and the rules version). Each module's
seed is in its `meta.json`; the random streams are mulberry32 (`tools/golden/lib.ts rng`, the engine's own).

## Format

`golden/engine/<module>/<fn>.jsonl`, one case per line: `{"fn","id","in","out"}` in canonical JSON (keys sorted at every depth, no spaces).

- `in` is what the port receives. The generator computes `out` from the **round-tripped** `in` (canonical JSON, keys sorted), so a
  function that iterates an object's keys (`Object.values`, `Object.entries`) sees the same order the port sees.
- Numbers JSON cannot hold are tagged: `{"$num": "NaN" | "Infinity" | "-Infinity" | "-0"}`; an input `undefined` is `{"$undef": true}`.
- A JS exception is a case too: `out = {"$throws": message}`; the port must raise (the message is not compared).
- A JS function value in an output is `{"$fn": name}` (only the recorded prototype-chain divergence produces one).
- Items, banks and data are referenced, not copied: content cases name `file` + `id` under `src/engine/data/content` (in this repo:
  `data/engine/content`, the same files); the CAT banks are
  the `bank` cases of `cat_session`; rules/bank are `seedSnapshot()` / `BANK`.

## Modules

| module | cases | what | generator |
|---|---:|---|---|
| dates | 4,753 | `dates.ts` + `util.ts`: UTC-midnight arithmetic, Tashkent/DST zone helpers, `hash`, `fnv1a` | `leaf.ts dates` |
| admission_math | 2,420 | sig, logit, erfc, Phi, PhiInv, meanSig, bisect, mulberry32, Box-Muller, seedOf | `leaf.ts admissionMath` |
| admission_us | 1,459 | the US chances shape: poolRate, solveShift, cellP, softP, halfWidth, band | `leaf.ts admissionUs` |
| cat_irt | 2,821 | 3PL/PCM/testlet probabilities, information, EAP posterior on the 181-point grid | `leaf.ts catIrt` |
| learner_elo | 2,860 | Elo update, K decay, mastery states, 50-answer runs | `leaf.ts learnerElo` |
| small_rules | 3,107 | coins, too-fast, endings, typed IELTS answers, field fit | `leaf.ts smallRules` |
| homework | 4,291 | hw-plan (plan, first try, pay, status, words, card), lesson levels (sitting chains), DTM and SAT mocks | `homework.ts` |
| content | 15,598 | family instances, formula language (incl. 92 edge cases), solver, text checks over 1,200 real stems, `validate()` per stream | `content.ts` |
| chances | 2,581 | admission model x every `specs.json` university, readiness, inputs, Uzbek cut model, list line, scorecard/feasibility/card | `chances.ts` |
| cat_session | 942 | whole CAT checks (onboarding + daily sets) by seeded simulees on two synthetic banks; reportOf; the scale | `cat.ts` |
| schedule | 396 | Phase X `simulate` (fallback strategy), P1 `generateWeek` x2, `cadence` (rest days), `dtmPlanOf` | `schedule.ts` |
| pipeline | 276 | `runPipeline` on 6 personas, 3 teen projects, 4 readiness personas, 120 seeded profiles x days x en/uz/ru; re-plans | `pipeline.ts` |

Profiles shared by pipeline/schedule/chances: `tests/fixtures/personas/P1-P6`, `teen/p13,p15,p17`, `READY_PERSONAS`
(`tests/unit/engine/support/readiness-personas.ts`) and `randomAnswers(seed)` (`tests/unit/engine/support/random-answers.ts`).

## Replay in Python

```
cd backend
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"                    # the backend's deps incl. tzdata, regex, pytest
.venv/Scripts/python -m pytest tests/engine -q                     # one test per (module, fn); unported fns are skipped
.venv/Scripts/python -m tests.engine.report                        # the parity table
```

Comparison (`backend/tests/engine/compare.py`): strings, booleans, null exact (a bool never equals a number); integers exact (3 == 3.0:
JS has one number type); floats bit-exact or within `REL_TOL = 1e-10` relative (`ABS_TOL = 1e-12` near zero); the sign of zero, NaN and
Infinity exact; objects by key set (a missing key and `undefined` are one thing); arrays by length and order. Deliberate divergences are
listed with their reason in `backend/tests/engine/divergences.py` and counted as skipped, never as passed.

## JS semantics a port must keep (found while porting; `backend/app/engine/js.py` holds the helpers)

1. **Math.round** rounds half toward +Infinity (2.5 -> 3, -2.5 -> -2, -0.4 -> -0); Python `round()` is banker's. Use `js_round`.
2. **32-bit integer ops**: `Math.imul`, `>>> 0`, `|`, `^` wrap at 32 bits; Python ints never do (`imul`, `u32`, `to_uint32`).
3. **Exceptions vs Infinity/NaN**: `Math.exp(1000)`, `Math.log(0)`, `x / 0`, `Math.sqrt(-1)`, `Math.asin(2)`, `Math.floor(Infinity)` return
   values in JS; Python's `math` raises. Use `js_exp`, `js_log`, `js_div`, `js_sqrt`, `js_floor`.
4. **`%`** is a truncated remainder (sign of the dividend, `math.fmod`); Python's `%` floors. `x % 0` is NaN.
5. **`**` / Math.pow**: `1 ** Infinity` is NaN (Python 1.0); `x ** 2` is `x * x` in V8's fdlibm.
6. **Transcendentals** (`exp`, `log`, `sin`, `pow`, `hypot`) can differ from V8 in the last bit: 1,082 of 17,342 leaf cases differ, by at
   most 2.4e-13 relative (cat_irt, through log-likelihood sums); every decision taken on them still matched. Keep sums in the TS order.
7. **Strings are UTF-16 in JS**: `length`, `charCodeAt`, `slice` and regex `index` count code units; `for (const c of s)` walks code points
   but `c.charCodeAt(0)` of an astral one is its high surrogate (`util.hash`). `fnv1a`/`seedOf` hash UTF-16 units. Use `utf16_units`,
   `utf16_len`, `first_unit`. (The content corpus has no astral character today; text positions are equal there.)
8. **`\s`, `trim()`** are JS's fixed whitespace set (includes U+FEFF, excludes U+001C-U+001F and U+0085). Use `JS_WS_CLASS`, `js_trim`.
9. **`\d`, `\w`, `\b`** are ASCII in JS; Unicode in Python's `re`. Write `[0-9]` or pass `re.ASCII`.
10. **`$`** without the m flag is end of input; Python's `$` also matches before a final `\n`. Write `\Z`.
11. **`/i`** without the u flag folds ASCII only (`re.ASCII | re.IGNORECASE`); `/iu` folds simply (ſ = s): `regex.IGNORECASE`.
12. **`\p{L}`, `\p{Script=Latin}`**: Python's `re` has neither; use the `regex` module. Unicode versions differ: V8 (Node 24, ICU 78) is on
    Unicode 17, Python 3.11's `unicodedata` (NFKC, `lower()`, categories) on 14.0. Characters added after 14.0 can classify differently.
13. **`s[i]` outside the string** is `undefined` in JS; Python's `s[-1]` is the last character.
14. **Truthiness**: `[]` and `{}` are true, `NaN` and `''` false (`js.truthy`); `x ?? d` is only null/undefined (not `or`).
15. **`k in obj` / `obj[k]`** on a plain object also find `Object.prototype`'s names (`toString`, `__proto__`, `constructor`):
    `knownField('toString')` is `'toString'` in JS. The port reads own keys only (recorded divergence, 78 cases).
16. **Key order**: object keys iterate in insertion order (integer-like keys first); a Python dict keeps insertion order too, so build dicts
    in the TS order. A JS `Set`/`Map` iterates in insertion order (use a dict, not a `set`, when the order reaches an output).
17. **Sorting**: `Array.prototype.sort` is stable (as Python's); with no comparator it compares UTF-16 strings (even numbers as strings).
18. **Dates**: `Date.UTC` rolls days/months over (and maps years 0-99 to 1900+); a date-only ISO string is UTC but a date-time without an
    offset is the HOST's local time (the port refuses it); `toLocaleDateString('en-US', {timeZone: 'UTC'})` is "Nov 1, 2028". Zones: the
    IANA database via `zoneinfo` + the `tzdata` package on Windows.
19. **Numbers**: `Number('12')` and `12.0` are one value; `-0` survives arithmetic (`-a` of 0), so the port keeps floats where JS can
    produce `-0` (formula variables are read as floats). `Math.max(0, -0)` is `+0`; `Math.max()` is `-Infinity`. A factorial past 2^53
    must be computed in doubles, not Python ints. `Math.floor`/`Math.ceil` return doubles and keep -0 (`Math.ceil(-0.5)` is -0; Python's
    `math.ceil` returns the int 0). A function called with fewer arguments sees `undefined` (NaN), never a missing-argument error. The
    formula edge cases caught both in the first port.

## Port status (21 Oct 2026)

`backend/tests/engine/report.py` prints it. Ported and at parity: dates, admission_math, admission_us, cat_irt, learner_elo, small_rules,
homework, and in content the text checks and the formula language. Fixtures waiting for a port: pipeline, schedule, chances (except the
pieces above), cat_session, content's instantiate / solve / fillRelation / validate.

## Porting the next module (the recipe)

1. Pick a module whose engine imports are already ported (`grep "^import" src/engine/<m>.ts`); port it file for file into
   `backend/app/engine/<same path>.py`, keeping the TS evaluation order and every helper from `js.py` the TS operation needs.
2. Static data: `app/engine/data.py load_json('<path under data/engine>')` (`data/engine/` = the legacy `src/engine/data`; `JG_ENGINE_DATA` overrides).
3. Add one adapter per fixture function in `backend/tests/engine/adapters.py` (fixture `in` -> the port's output, shaped as the TS output).
4. `python -m tests.engine.report`: zero `fail`; anything you decide not to reproduce goes in `divergences.py` with its reason.
5. If the TS module changes later, regenerate (from the legacy checkout: `npx tsx <this repo>/tools/golden/run.ts <module>`), commit the
   fixtures with the change, and re-run.
