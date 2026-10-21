# C21-2: key check 2 of the SAT practice form 1 Math items (P15, 18 Oct 2026; re-run 19 Oct)

The workflow ran both checkers a second time on 19 Oct; that re-run has its own section at the end ("The 19 Oct re-run"). It changed
no record: both solvers chose the key again on all 66 items.

The P15 SAT lane (branch `p15-content`, worktree `jg-p5content`, author `agent:p15-sat-math`) wrote the 66 Math items of SAT practice
form 1 as drafts in `C21/C21-2.json` (commit `1ce32bc1`; the form's math section in `C21/form-1.json`, `b11cbc7f`). The ids list is
`.superpowers/p15/ids-sat-math.json` in the integration worktree `jg-p5int` (ids only). An item is served only when two blind solvers
outside the author's session agree with its key and none finds a second correct option (spec §5.5 step 4; `keycheck.ts`). P15 blind
checkers 1 and 2 (P15maths1, P15maths2) keyed them. This file is checker 2's record (P15maths2, who ran the reconcile).

| Module | Ids | Items | Multiple choice | Student-produced (numeric entry) | Levels |
|---|---|---:|---:|---:|---|
| Module 1 | `C21-ma1a01` … `ma1a22` | 22 | 16 | 6 | alg1 10, alg2 7, prealg 2, geom 3 |
| Module 2, easier | `C21-ma2e01` … `ma2e22` | 22 | 16 | 6 | the two module 2 forms together: alg1 18, alg2 16, prealg 2, geom 8 |
| Module 2, harder | `C21-ma2h01` … `ma2h22` | 22 | 16 | 6 | (above) |
| **All** | | **66** | **48** | **18** | alg1 28, alg2 23, prealg 4, geom 11 |

Before this pass all 66 were `status: draft`, version 1, `key_check_1: "author"`, `key_check_2: null`, no `key_check_2_version`
(read after both answers files were written). None is a family, so none is keyed by a 50-instance check: `blind.ts` left none out.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P15maths1 (checker 1) | `.superpowers/p15/blind-math/C21-P15maths1.json` (66 items) | `C21-P15maths1.answers.json` (19:38), `C21-P15maths1.forms.json` |
| P15maths2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p15/blind-math/C21-P15maths2.json` (66 items) | `C21-P15maths2.answers.json` (19:37) |

P15maths2's copy: `npx tsx scripts/content/blind.ts C21 P15maths2 --pending --blind <staging>` (147 items: the stream holds the 81
Reading and Writing items of `C21-1.json` too; 18 numeric entry, no family left out), then a filter kept exactly the 66 ids of the ids
file in the copy and its map, wrote them into `.superpowers/p15/blind-math/` without printing the map, and the staging files were
deleted. (A first staging copy, in a scratchpad folder named `stage` that other agents of this run share, was gone before the filter
read it; it was made again in a folder of its own, with the same seeded shuffle. Neither copy's map was opened.) A copy holds each
item's stem in en, uz and ru, its options shuffled by the solver's own seed and lettered A-D, or a numeric-entry field, and the
instructions; no key, no `why`.

Each solver was a separate agent run, neither the author's session (D26; `keycheck.ts`): `agentOf` reads P15maths1, P15maths2 and
`p15-sat-math` as three agents (none matches a `SESSIONS` pattern), so `keyCheckOf("blind:P15maths1+P15maths2", { author:
"agent:p15-sat-math" })` is `{ kind: "blind", n: 2 }`. P15maths2 was told no key: the brief named the ids file, the folder and the
process, no stem, option or key. It opened neither `.map-*` file, nor the item records, nor the authors' ledger, notes, logs, test or
commit messages, nor checker 1's answers, before it wrote its own. It solved every item by hand, then confirmed each with sympy 1.14
(`check-math2/check.py`, system Python): for every multiple-choice item each of the four options is tested against the condition the
stem states, so a second correct option would show as a second hit; **every one of the 48 has exactly one option that meets its stem**.
It then read every stem and option in uz and ru against the English (the same numbers in all three, the same condition: "at most" /
«koʻpi bilan» / «не больше», "actual minus predicted" / «haqiqiy … ayirilsa» / «разность фактического … и предсказанного», and so on).
Only `reconcile.ts` read the maps. P15maths2 first read checker 1's answers after its own file was written.

None of the 66 is a fill-in (no sentence with a blank), so there is no sentence to read with each option in it; the option test above
is the math form of the same check.

## The decision

`npx tsx scripts/content/reconcile.ts C21 P15maths1 P15maths2 --blind .superpowers/p15/blind-math --write` (a dry run first, the same
decisions; logs in `.superpowers/p15/check-math2/logs/`):

| Stream | Items in the stream | Verified | Quarantine | Pending | Blocked | Skipped |
|---|---:|---:|---:|---:|---:|---:|
| C21 | 147 | 66 | 0 | 0 | 0 | 81 (the Reading and Writing items of `C21-1.json`: no answer in this folder, untouched) |

**Both solvers chose the key on all 66 items.** No answer was stale, and neither answers file raises `two_defensible`, `unanswerable`
or `no_passage_needed`; checker 1's notes give the same value as P15maths2's for every item (the letters differ only by each copy's
shuffle). The decisions are kept in `.superpowers/p15/blind-math/C21-reconcile.json`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **66** | `key_check_2: "blind:P15maths1+P15maths2"`, `key_check_2_version: 1` |
| `quarantine` | **0** | none |

**Verified: 66. Quarantined: 0.** No item drew a disagreement, a second correct option or a flag from either solver.

## Every item: the key, and why the others are wrong

The reading is P15maths2's; checker 1's notes give the same value for every item. "Numeric" is a student-produced response.

| Item | Level | Answer | Working | The other options |
|---|---|---|---|---|
| ma1a01 | alg1 | 5 | 3x = 15 | 3, 15 (22 − 7 not divided), 29 (22 + 7) |
| ma1a02 | alg2 | 2x + 12 | 4x + 12 − 2x | 4x + 12 (−2x dropped), 6x + 12 (sign), 2x + 3 (4 not distributed) |
| ma1a03 | prealg | numeric 200 | 250 × 0.8 | |
| ma1a04 | alg1 | 17 | 20 − 3 | 20, 12, 23 |
| ma1a05 | geom | 65° | 180 − 48 − 67 | 55°, 115° (A + B), 75° |
| ma1a06 | alg1 | numeric 5 | (61 − 36) / 5 | |
| ma1a07 | alg2 | 21 | 9 + 12 | 3, −3, −21 (signs) |
| ma1a08 | prealg | numeric 56/3 | 7/75 × 200 | |
| ma1a09 | alg1 | 3 | 3y = 9 | 5 is x; 9, −3 |
| ma1a10 | alg2 | 7 and −2 | (x − 7)(x + 2) | the other three pairs have a wrong sign |
| ma1a11 | geom | 10 cm | 360 / 36 | 90, 20, 40 |
| ma1a12 | alg1 | 7 | x > 6 | 6 is the boundary (strict), −7, 0 |
| ma1a13 | alg2 | numeric −1 | −6x + 5x | |
| ma1a14 | alg1 | 8 | x = 14; (7 + 9)/2 | 9 (the mean), 7, 11 |
| ma1a15 | alg1 | 70 | rate 60; 190 − 120 | 60 (the rate), 95, 130 |
| ma1a16 | alg2 | 17 | a = 4, b = 1 | 13, 9, 16 (b forgotten) |
| ma1a17 | alg1 | numeric 5 | 3/6 = k/10, and 8/5 ≠ 1/2 (no solution, not the same line) | |
| ma1a18 | geom | 12/5 | QR 5, PR 13, PQ 12; tan R = PQ/QR | 5/12 (tan P), 12/13, 13/12 |
| ma1a19 | alg1 | 3/5 | 45 / 75 | 9/40 (45/200), 3/8, 2/5 |
| ma1a20 | alg2 | numeric 3 | (x − 4)² = 0, b = 2·4 − 5 | |
| ma1a21 | alg2 | 5 | (x − 4)² < 9: 1 < x < 7, x = 2 … 6 | 9, 6, 7 (1 and 7 make f(x) = 0, not < 0) |
| ma1a22 | alg1 | 5 | a − 2 = 3 and 4a = 20 | 2, 3, 1 |
| ma2e01 | alg1 | 20 | x/4 = 5 | 11, 44, 32 |
| ma2e02 | alg2 | x⁷ | add exponents | 2x⁷, x³, x¹⁰ |
| ma2e03 | prealg | 12 | 3/2 × 8 | 24, 9, 16 |
| ma2e04 | alg1 | −3 | y = −3x + 4 | 4 (the intercept), 3, 4/3 |
| ma2e05 | geom | numeric 145 | 180 − 35 (adjacent, «qoʻshni», «смежный») | |
| ma2e06 | alg2 | 19 | 2·9 + 1 | 13, 7, 37 |
| ma2e07 | alg1 | (3, 3) | 6 + 3 = 9 | (2, 4) 8, (4, 2) 10, (1, 6) 8 |
| ma2e08 | prealg | numeric 40.5 | 0.15 × 270 | |
| ma2e09 | alg2 | −7 | x < 0 | 7, ±49 |
| ma2e10 | geom | 81 | side 9 | 144, 9, 36 |
| ma2e11 | alg1 | 40 + 2g ≤ 70 | at most 70 | ≥ (wrong direction), 40g + 2 and 2 + 40g (rates swapped) |
| ma2e12 | alg2 | x + 5 | (x + 5)(x − 3) | x − 5, x + 3 (signs), x + 15 |
| ma2e13 | alg1 | numeric 4 | 10a = 220 − 180 | |
| ma2e14 | alg1 | 79 | 27 + 52 | 58, 56.5, 27 |
| ma2e15 | alg2 | V = 12(0.75)^t | keeps 75 % a year | 0.25 (what is lost), 1.25 (growth), linear |
| ma2e16 | geom | 81π | r = 9 | 18π, 36π, 324π |
| ma2e17 | alg1 | numeric −1 | slope 3; 5 − 6 | |
| ma2e18 | alg2 | 4 | (x + 7)(x − 4) | −7 (negative), 28, 14 |
| ma2e19 | alg2 | numeric 24 | 12x + 12x | |
| ma2e20 | geom | 12 | AC = 9; √(225 − 81) | 9 (AC), 15, 25 |
| ma2e21 | alg1 | numeric 24 | P (6, 0), Q (0, 8) | |
| ma2e22 | alg2 | 29 | f(5) = c − 25 = 4 | 4, −21, 21 (sign) |
| ma2h01 | alg1 | 9 | 2x = 18 | 5, 18, −1 |
| ma2h02 | alg2 | 3x² − 12x | | 3x² − 12, x² − 12x, 3x² − 4x |
| ma2h03 | alg2 | (3x − 5y)(3x + 5y) | difference of squares | the two squares, (9x − 5y)(x + 5y) |
| ma2h04 | alg1 | numeric 25 | 20 L a minute | |
| ma2h05 | geom | 5 | (x − 3)² + (y + 4)² = 25 | 25 (r²), 10, 7 |
| ma2h06 | alg1 | 60 % | 62 ± 4: 58 to 66 | 71, 55, 68 are outside |
| ma2h07 | alg2 | −2 | midpoint of 2 and −6 | 2, −6 (the roots), 4 |
| ma2h08 | alg1 | 8 | x = 3, y = 5 | 3 (x), 5 (y), 15 |
| ma2h09 | alg2 | numeric 8 | x = 0 or 8; 0 is extraneous (√9 = 3 ≠ −3) | |
| ma2h10 | geom | numeric 104 | 180 − 2·38 | |
| ma2h11 | alg1 | 5 | the region exists where 2x − 5 ≤ −x + 10: x ≤ 5 (the point (5, 5)) | 2.5, 15, 10 |
| ma2h12 | alg2 | 16 | 3ⁿ = 81, n = 4 periods of 4 h | 81, 12, 20 |
| ma2h13 | alg1 | 12 | predicted 25; 37 − 25 | 25 (predicted), 37 (actual), −12 (reversed) |
| ma2h14 | alg1 | 3 | 18 × 4 = 72 = 24 × d | 16/3, 72, 0.75 |
| ma2h15 | alg2 | 4/(x² − 4) | ((x + 2) − (x − 2))/(x² − 4) | −4/(x² − 4) (sign), 2x/(x² − 4), 4/(x − 2)² |
| ma2h16 | geom | numeric 36 | r² = 9; (1/3)·9·12 | |
| ma2h17 | geom | 17 | both acute: x + y = 90, 5k + 5 = 90 (44°, 46°) | 15 (40°, 40°), 19 (48°, 52°), 35 (y = 100, out of range) |
| ma2h18 | alg1 | 11 | slope 2/5, perpendicular −5/2; 1 + 10 | 13/5, −3/5, −9 |
| ma2h19 | alg2 | 2√2 | discriminant k² − 8 = 0 | √2, 8, 2√8 = 4√2 (not equal to 2√2) |
| ma2h20 | alg1 | All adults in that city | random sample of the city's adults and random assignment | only the tea drinkers (too narrow), no one (random assignment does show cause), any city (not sampled) |
| ma2h21 | alg2 | numeric 27 | a = −3; f(4) = −3·3·(−3) | |
| ma2h22 | alg1 | numeric 101/36 | 9x = 11; y = 19/12 | |

## The 18 student-produced responses: every form a student could type

After its answers were written, P15maths2 ran each form through the served grader's own rule (`check-math2/forms.ts`: `parseNumeric`
in English and `|v − value| ≤ tolerance + 1e-9`, as `src/server/content/bank.ts` `grade()`), printing accept or reject only, never the
key: **every form below that should be accepted is, and every near miss is refused** (`logs/forms.log`).

| Item | Accepted (all graded right) | Refused (all graded wrong) |
|---|---|---|
| ma1a03 | 200, 200.0, 200.00 | 200000 (not in thousands), 50 (the discount) |
| ma1a06 | 5, 5.0 | 25 |
| ma1a08 | 56/3, 18 2/3, 18.667, 18.666 (the field's three places, rounded or cut), 18.67, 18.66 (the SAT's own five characters) | 18.7, 18, 19 |
| ma1a13 | −1 (hyphen or minus sign), −1.0 | 1, −11 |
| ma1a17 | 5, 5.0 | −5, 20 |
| ma1a20 | 3, 3.0 | 4 (a, not b) |
| ma2e05 | 145, 145.0 | 35, 55 |
| ma2e08 | 40.5, 40.50, 81/2 | 40, 41 |
| ma2e13 | 4, 4.0 | 5 |
| ma2e17 | −1, −1.0 | 1, 3 (the slope) |
| ma2e19 | 24, 24.0 | 12, 0 |
| ma2e21 | 24, 24.0 | 48 (no half), 14 |
| ma2h04 | 25, 25.0 | 17, 8 |
| ma2h09 | 8, 8.0 | 0 (extraneous) |
| ma2h10 | 104, 104.0 | 38, 71 |
| ma2h16 | 36, 36.0 | 108 (no third), 12 |
| ma2h21 | 27, 27.0 | −3 (a), 24 |
| ma2h22 | 101/36, 2 29/36, 2.806, 2.805 | 2.8, 2.81 (too short to tell), 11/9 (x alone) |

Checker 1's `C21-P15maths1.forms.json` lists the same forms, and the Uzbek and Russian ones with a decimal comma (18,667); those were
not run here (the test `p15-sat-math.test.ts` runs the server grade in en and uz).

## Checks after the write

- What the write changed (`check-math2/diffcheck.cjs`, every item of `C21-2.json` against `HEAD`): **0 problems**. The 66 items
  differ only in `status` (`draft` → `verified_auto`), `key_check_2` (`null` → `"blind:P15maths1+P15maths2"`) and the new
  `key_check_2_version: 1` after the last field; the text diff holds no other line (462 lines: 66 × 3 out, 66 × 4 in); LF, no BOM,
  the final newline kept, no top-level field changed. Each key, option, stem, `why`, level, version and author is as the author wrote
  it. `C21-1.json` is not written by this pass: the Reading and Writing checkers' own reconcile wrote it at 19:45:58 (77
  `verified_auto` by `blind:P15rws1+P15rws2`, 4 quarantined); this pass's write (19:46:56) touched only `C21-2.json`, and this
  commit holds only `C21-2.json` and this file.
- `npx tsx scripts/content/validate.ts --no-families --all`: **0 findings on any C21 item**, before and after; **0 served items with
  an error**. The run exits 1 on **425 errors that are not this pass's and are the same before and after**: 276
  `schema.unknown_field` and 149 `format.none` on the IELTS Listening items of `C19-24` and `C20` (e.g. `audio.accept.word_limit: not
  in the item format`), another P15 lane's drafts (`logs/validate-before.log`, `validate-after.log`; the counts by code are equal).
  C21 is now 143 `verified_auto` of 147 (66 Math, 77 Reading and Writing) and 4 quarantined Reading and Writing items.
- `npx tsx scripts/content/scan.ts --out …`: exit 0, **2 findings, 0 errors, 0 on served items**, identical before and after
  (`cue.length` warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P15's) (`check-math2/scan-before/`, `scan-after/`).
- `tests/unit/content/p15-sat-math.test.ts` (the DB-free config `.superpowers/p13/fixb-scan/vitest.nodb.config.ts`, Postgres :5433 is
  not running here; `ANTHROPIC_API_KEY` empty, `AI_FAKE=1`): **8 pass, 1 fails**. The record test passes in the verified state
  (`blind:<A>+<B>`, `key_check_2_version` 1), as do the forms test, the three-language test and the validator-and-scanner test. The
  failing one is "no lesson, reserve or practice pool holds a C21 item": `pool({ purpose: 'practice' })` now returns the 143 served
  C21 items, because the pool's C21 exclusion (`MOCK_BANKS = ['C21']` in `src/server/content/bank.ts`) is on branch `p15-sat-test`
  (`4a782720`), not on `p15-content`. It passed before only because every C21 item was a draft (see below).
- Related: `blind`, `keycheck`, `reconcile`, `reconcile-cli`, `scan`, `committed-content`: **66 pass** (6 files); vitest reported one
  worker RPC timeout ("Timeout calling onTaskUpdate") on the 108 s run, an unhandled infrastructure error on a loaded machine with
  no test failing (`logs/vitest-related.log`).

## For the integrator (not changed here)

- **Merge `p15-sat-test` (its `MOCK_BANKS` exclusion in `pool()`) with or before this commit.** On `p15-content` alone the 66 Math items
  and the 77 Reading and Writing items are served, and nothing keeps the practice pool from drawing a practice test's questions
  outside the test; `p15-sat-math.test.ts` fails on exactly that until the exclusion is there.
- The 66 items are `verified_auto` at version 1; no lesson, reserve or homework names a C21 id (the test's C19 part passes).

## Observations (no key affected; for the author)

- The numeric-entry instruction reads "give a decimal that does not end to 3 places (0.667)": it means "round a decimal that does not
  end to 3 places", and as written it can be read as asking for a decimal that does not end. Wording only; the grader accepts the
  rounded, the cut and the SAT's five-character forms alike.

## The 19 Oct re-run (the workflow's "Try again")

`C21-2.json` is as commit `c9aaef9e` left it (`git diff c9aaef9e HEAD` on it is empty), so before the re-run all 66 records were already
`verified_auto`, `key_check_2: "blind:P15maths1+P15maths2"`, `key_check_2_version: 1`. Files of the re-run:
`.superpowers/p15/check-math2/retry-19oct/` in `jg-p5int`.

**Who solved.** Checker 2 was a fresh agent run under the same solver name, P15maths2. Its brief named the ids file, the folder and the
process, no stem, option or key. Before its answers were written (01:04) it opened none of these: the `.map-*` files, the item
records, the authors' ledger, notes or commit messages, this file, run 1's answers, checker 1's answers or the decisions log.
Checker 1 (P15maths1) re-ran too: copy made again at 00:52, answers and forms at 01:11, no flag, and "One correct option" in its notes.

**The copy.** P15maths2 solved the folder's `C21-P15maths2.json` (made 18 Oct, 19:34). It ran `blind.ts C21 P15maths2` again into a
staging folder (147 items) and compared the 66 math items by id: **all 66 deep-equal** to the folder's copy, so the copy shows the
content as it is now. The staging copy and its map were deleted unread.

**The solve.** Every item was solved by hand, then confirmed with sympy 1.14 (`retry-19oct/solve.py`). Where a stem states a condition,
each option was tested against it (`ma1a12`, `ma2e07`, `ma2e09`, `ma2h06`, `ma2h09` and its extraneous root, `ma2h17` over every integer
k in range, `ma2h19` with each option's value). Each answer was chosen by its option's text, and a script lettered it from the copy
(`retry-19oct/answers.cjs`), so no letter could be mistyped. None of the 66 is a fill-in. After writing, P15maths2 compared its answers
with run 1's (kept as `retry-19oct/C21-P15maths2.answers.run1-18oct.json`): **66 of 66 the same answer**, and neither raises a flag.

**The decision.** `reconcile.ts C21 P15maths1 P15maths2 --blind .superpowers/p15/blind-math --audit` (`--audit` decides every item
again and never writes; it was run again after the R&W lane's `92f96e35`, with the same result): **0 of 147 decisions differ from
the files**. Each of the 66 is `verified`, with both solvers on the key (`{"P15maths1":"key","P15maths2":"key"}`), labelled
`blind:P15maths1+P15maths2`, the record already on file. No answer was stale. `--write` was not run because it would change
nothing in `C21-2.json` (it leaves an item verified by two checks alone). Also, the Reading and Writing lane had uncommitted edits to
`C21-1.json` in this worktree at the time. Decisions: `retry-19oct/audit.json`; log `logs/reconcile-audit.log`.

**Numeric entry.** `retry-19oct/forms.ts` (run after the answers) puts every form in the table above through the served grader's
rule (`bank.ts` `grade()`), plus the decimal-comma forms in uz and ru (18,667, 18,666, 18,67; 40,5; 2,806, 2,805) and 18.6667, 40 1/2,
2.8056 and 2.8055. All are accepted, and every near miss is refused (18.6, 2.8, 2.81, 11/9 among them). **No surprise in the 18
items.** `forms1.ts` puts checker 1's `accept` lists (including 10/2 and 40,5) through the same rule in en, uz and ru: **0 refused**.
One grader behaviour is not a key fault: in English, "18,667" reads as 18667 (thousands grouping), so an English-served student who
types a decimal comma there is marked wrong.

**Checks.**
- `validate.ts --no-families --all`: exit 1, **0 findings on any C21-2 item**. All 699 errors are on IELTS Listening items (`C19-li`
  89, `C20-li` 610): 276 `schema.unknown_field` (`audio.accept.word_limit: not in the item format`), 149 `format.none` and 274
  `status.unverified`. The served items with an error went from 0 (18 Oct) to **274** (`C19-li*`, `C20-li*`): another lane's key check
  (`aebf3c20`) made those items `verified_auto`, but this branch's item format does not have their field. This pass did not cause it;
  it is listed for the integrator below.
- `scan.ts`: exit 0, 2 findings, 0 errors, 0 on served items (the same `cue.length` warnings on `C7-rs5q02`, `rs5q05`).
- `p15-sat-math.test.ts` (DB-free config, `ANTHROPIC_API_KEY` empty, `AI_FAKE=1`): **8 pass, 1 fails**. The failure is the same
  `MOCK_BANKS` one as above: the practice pool now holds 146 served C21 items.

**For the integrator.** The 274 served IELTS Listening items with a validator error need the listening lane's item-format change
(`audio.accept`) merged alongside `aebf3c20`. Without it, the loader refuses them and `committed-content.test.ts` fails on them.

**Verified: 66. Quarantined: 0** (unchanged).
