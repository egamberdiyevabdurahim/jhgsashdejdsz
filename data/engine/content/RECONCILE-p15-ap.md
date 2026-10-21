# AP Physics 1 (C19, C22, C1): key check 2 of the P15 AP lane's lesson questions, items and families (18 and 19 Oct 2026)

The P15 AP lane wrote AP Physics 1 units 1–8 on branch `p15-content` (worktree `jg-p5content`): author `agent:p15-ap1` units 1–4
(`C19-25.json`, `C22-1.json`, `C1-14.json`), author `agent:p15-ap2` units 5–8 (`C19-26.json`, `C22-2.json`, `C1-15.json`). The ids
are in `.superpowers/p15/ids-ap1.json` and `ids-ap2.json` in the integration worktree `jg-p5int` (ids only, no keys). An item is
served only when two blind solvers outside the author's session choose its key and none finds a second correct option (spec §5.5
step 4; SPEC-lessons rev. 2, §9.1 step 3); a family is keyed by its 50-instance independent-solver check. P15 blind checkers 1 and 2
(P15aps1, P15aps2) keyed them, twice: the first pass on 18 Oct, and a second on 19 Oct after three families were rewritten. This file
is checker 2's record (P15aps2, who ran the reconcile and wrote the statuses). The 19 Oct pass is the current record; the 18 Oct
pass follows it as history.

| Bank | File | Items | Author | Version |
|---|---|---|---|---|
| C19 | `C19/C19-25.json` | 36 lesson questions `C19-ph11q1` … `C19-ph43q3` (and lessons `C19-APPH01-1` … `APPH04-3`) | `agent:p15-ap1` | 1 |
| C19 | `C19/C19-26.json` | 36 lesson questions `C19-ph51q1` … `C19-ph83q3` (and lessons `C19-APPH05-1` … `APPH08-3`) | `agent:p15-ap2` | 1 |
| C22 | `C22/C22-1.json` | 24 conceptual items `C22-ph11c1` … `C22-ph43c2` | `agent:p15-ap1` | 1 |
| C22 | `C22/C22-2.json` | 24 conceptual items `C22-ph51c1` … `C22-ph83c2` | `agent:p15-ap2` | 1 |
| C1 | `C1/C1-14.json` | 24 families `C1-ph1101` … `C1-ph4302` | `agent:p15-ap1` | 1; **2** for `C1-ph2302`, `C1-ph3201`, `C1-ph3202` |
| C1 | `C1/C1-15.json` | 36 families `C1-ph5101` … `C1-ph8303` | `agent:p15-ap2` | 1 |

**Result now: verified 180, quarantined 0.** 120 items `verified_auto` with `key_check_2: "blind:P15aps1+P15aps2"` (version 1), 60
families `verified_auto` with `"solver:relation@50"` (57 at version 1, the three version 2 families at version 2).

## 19 Oct 2026: the second pass

### Why there was one

The first pass (below) quarantined `C1-ph3202`: its stem showed a squeeze of 0.25 m as "0.3 m" (the family's `decimals: 1` renders
every stem number), so on 14 of 50 instances no option was right. Its author wrote version 2 of it and, for the same fault class, of
`C1-ph2302` and `C1-ph3201` (commit `f8c8c271`; `ids-ap1.json` "version2"), all three `draft`, `key_check_2: null`, no
`key_check_2_version`. The workflow then ran key check 2 again with two fresh blind checker runs under the same solver names.
Before this pass the other 177 ids were `verified_auto` from the first pass, unchanged since (`check-ap2r/recs.cjs`).

### Who checked, and what each saw

| Solver | Blind copy | Answers |
|---|---|---|
| P15aps1 (checker 1, a separate agent run) | `blind-ap/C19-P15aps1.json` (72), `C22-P15aps1.json` (48), made 00:54 | `blind-ap/<stream>-P15aps1.answers.json`, 01:06 and 01:07 |
| P15aps2 (checker 2, a separate agent run; ran the reconcile and wrote this file) | `blind-ap/C19-P15aps2.json`, `C22-P15aps2.json`, the same 120 ids | `blind-ap/<stream>-P15aps2.answers.json`, 01:03 |

Both runs reuse the first pass's solver names, so `agentOf` counts the same two agents (P15aps1, P15aps2) as before, neither an
author's session (`p15-ap1`, `p15-ap2`), and the label `blind:P15aps1+P15aps2` names this pass's checks as it named the first's.
Each run moved its first-pass answers aside unread before solving: P15aps2's to `blind-ap/<stream>-P15aps2.answers.prev-18oct.json`,
P15aps1's to `blind-ap/prev-18oct-P15aps1/`.

P15aps2 was told no key: the brief named the id files, the folders and the process. Before its answers were written it opened no
`.map-*` file, no item record (`check-ap2r/recs.cjs` prints only id, kind, version, status, the key-check fields and author), no
author ledger, note, log or commit message (beyond `git log --oneline` subjects), not this file's first-pass text, not the first
pass's answers, and not checker 1's answers. Its working files are in `.superpowers/p15/check-ap2r/`.

- **The copy.** `check-ap2r/mkcopy.ts` runs `blindCopy` (the function `scripts/content/blind.ts` runs) as solver P15aps2 over **every**
  AP item, not `--pending` (all 120 already held two checks, so `--pending` would have left them out), kept to the two id lists:
  C19 72, C22 48, none numeric, none left out. Copy and map came out byte-identical to the first pass's (md5 compared; the map was
  never printed): the same items, and the shuffle is seeded by solver and id.
- **The solve.** P15aps2 read every item (`check-ap2r/dump.cjs`), solved it and wrote a letter and a one-line reading for each of
  the 120. It raised no flag. The one fill-in item, `C19-ph83q1` ("in the narrow part the water's …"), read with each option in the
  blank: only "speed is higher and pressure is lower" is right (continuity, then Bernoulli in a level pipe); "both stay the same",
  "higher and higher", "lower and higher" each contradict one of the two.
- **Checker 1's answers**, read after P15aps2's were written: no flag, and every note ends "One correct option."

### The families (C1)

1. **`checkFamily`, 50 instances** (`check-ap2r/fam.ts`, verdicts and counts only; `check-ap2r/fam/checkFamily.txt`): **all 60
   verified 50/50 by their `relation`, no disagreement, no problem.** Version 2: `C1-ph2302` 30 variants, `C1-ph3201` 11, `C1-ph3202` 76.
2. **Blind instances, solved by hand: 132.** For each family the most extreme edge instance (`edges.ts`) and one draw with this
   solver's own seed (`P15aps2:0`); for the three version 2 families two edges and four seeds (6 each). The en stem with its options
   shuffled and lettered; the key's letter in a map never printed (`check-ap2r/fam/`). P15aps2 solved each from the numbers as the
   stem shows them and wrote its letters (`fam/C1-fam-P15aps2.answers.json`) before comparing (`famcmp.cjs`): **132 of 132 agree with
   the key; all 60 families agree on every instance**; no instance with two equal options or a second correct one. The version 2
   instances: `C1-ph2302` 6/6 (x = mg/k in cm: 20, 12, 16, 5, 20, 10), `C1-ph3201` 6/6 (v = √(2gh): 19.6, 4.2, 9.8, 12.6, 19.6, 12.6),
   `C1-ph3202` 6/6 (v = x√(k/m): 5, 4, 2, 20, 15, 4).
3. **The first pass's fault class, over every family** (`check-ap2r/exact.ts`, after the answers): over 600 seeded draws and 8 edge
   instances per family (11 to 555 distinct value sets each), whether any stem number is rounded by the family's `decimals` (the
   stem filled with and without them), whether the key is a rounding of its formula's own value, whether the `why` shows a rounded
   number, and whether the key is ≤ 0: **0 findings in 60.** Only `C1-ph7202` and `C1-ph7203` have rounded keys (on 16 and 7 of their
   values), and both stems say "Round to the nearest hundredth" with `tolerance: 0.02`. This matters because the families carry
   `answer_numeric` (`tolerance: 0`) and so are served as numeric entry (`formatOf`): the student's exact number must be the key.
   The three version 2 families now draw their numbers so that every one is exact: `C1-ph2302` k ∈ {49, 98, 196, 245, 490} (x = 20m,
   10m, 5m, 4m, 2m cm), `C1-ph3201` h = 0.1n² (v = 1.4n), `C1-ph3202` k = m s² and x ∈ {0.1 … 0.5} (v = xs).
4. **Every physics statement**, read after the answers: each family's en template, formula, distractors, relation and why
   (`famread.cjs`), and the uz and ru stems and whys of the three version 2 families. Units, signs and g = 9.8 m/s² are right
   throughout; the constraints keep each instance possible (`C1-ph1201` the stone still in the air, H − 4.9t² ≥ 5; `C1-ph2201` the
   push beats friction, q − 9.8μ ≥ 0.5; `C1-ph8203` the stone sinks; the scan's key > 0 on every value set).

### The lessons

The 24 lessons (72 pieces) were read again in English after the answers (`check-ap2r/lessons.cjs`) and every number recomputed: all
right (e.g. 36/(2π) ≈ 5.7 turns; 4π × 0.5 ≈ 6.3 m/s; K 18 J → 36 J for the skater; P₂ = 200,000 + 500 × (4 − 36) = 184,000 Pa). One
idealization, not blocking: `C19-APPH02-3`'s trap says of "a stone whirled on a string in a horizontal circle" that "the string's
pull is the force toward the centre"; held in the air, the string sags below the horizontal and only the pull's horizontal part is
centripetal (exactly the whole pull on a frictionless table). The lessons stay `draft`, untouched.

### The decision

| Stream | Command | Result |
|---|---|---|
| C19 | `reconcile.ts C19 P15aps1 P15aps2 --blind .superpowers/p15/blind-ap` (dry run) | 480 items, 480 skipped; the 72 AP ones "already verified_auto (blind:P15aps1+P15aps2)" |
| C19 | the same with `--audit --json` (decides every verified item again from this pass's answers) | no AP id differs from its record: **all 72 verified, solvers {P15aps1: key, P15aps2: key}** (`check-ap2r/logs/audit-C19.json`); the audit's 35 differing decisions are all `C19-li*` listening items blocked by validator errors, another lane's |
| C22 | dry run, then `--audit --json` | 48 skipped; audit **0 of 48 differ, all 48 verified, {key, key}** (`audit-C22.json`) |
| C1 | `reconcile.ts C1 --records --blind .superpowers/p15/blind-ap --write` (dry run first, the same) | **verified 3** (the version 2 families, from their `checkFamily`), 290 skipped "already verified_auto"; log `blind-ap/C1-reconcile-records.json` |

C19 and C22 were not written: no AP decision differs from its record, so a write would change nothing (their first-pass logs
`blind-ap/C19-reconcile.json`, `C22-reconcile.json` stand; this pass's are the two audit files).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **180** | 120 items `blind:P15aps1+P15aps2`, `key_check_2_version: 1` (re-solved 2/2 in this pass); 57 families `solver:relation@50`, version 1 (50/50 again); 3 version 2 families `solver:relation@50`, `key_check_2_version: 2` (written now) |
| `quarantine` | **0** | none |

**Verified: 180 (3 newly, 177 confirmed). Quarantined: 0.** No item drew a disagreement, a second correct option or a flag from
either solver, and no family a disagreement or a problem.

### What the write changed

Only `C1/C1-14.json`: the three version 2 families gain `key_check_2: "solver:relation@50"`, `status: "verified_auto"` and
`key_check_2_version: 2` (appended after `version`, as `applyDecision` does). The write's re-serialisation also printed one
`"prior_b": 1.0` (`C1-ph3301`) as `1`; that line was put back, so the text diff is the three records only (12 insertions, 9
deletions). An item-by-item compare with `HEAD`: 24 items, only those three ids differ, and only in those three fields; no
top-level field changed; LF, no BOM. Keys, options, stems, whys, params, versions and authors are as the author wrote them.

### Checks after the write

- `npx tsx scripts/content/validate.ts --all` (with the 50-instance family checks; `check-ap2r/logs/validate-after.log`), and the
  same on a `git archive` copy of `HEAD`'s content (`validate-before-head.log`): **the same 699 errors, 899 warnings and 405 notes
  before and after** (the finding lists diff empty), exit 1 both times; **no finding on any AP id**. Every error is on the listening
  lane's `C19-li*` and `C20-li*` records (`schema.unknown_field`, `status.unverified`, `format.none`), not P15 AP's. The only change:
  C1 from 290 `verified_auto` + 3 `draft` to **293 `verified_auto` of 293** (families keyed by the solver: 293). C22 48 of 48; C19
  479 `verified_auto` + 1 quarantine (a `C19-li*` item).
- `npx tsx scripts/content/scan.ts --out .superpowers/p15/check-ap2r/scan-after`: exit 0, **2 findings, 0 errors, 0 on served
  items**: `cue.length` warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P15's (the first pass's two).
- Tests, DB-free config `.superpowers/p13/fixb-scan/vitest.nodb.config.ts` (Postgres :5433 is not running here), `ANTHROPIC_API_KEY`
  empty, `AI_FAKE=1` (`check-ap2r/logs/vitest-p15ap.log`): `p15-ap1`, `p15-ap2`, `keycheck`, `reconcile`, `blind`, `reconcile-cli`:
  **6 files, 71 tests pass** (`p15-ap1` reads the three version 2 families in either state; it no longer fails as on 18 Oct).

### For the integrator (not changed here)

- All 180 are `verified_auto` at their version; no AP id holds a validator finding. The first pass's open item (`C1-ph3202`'s
  version 2, and `p15-ap1.test.ts` failing on its quarantine) is closed.
- The lessons stay `draft`; serving them is the AP lane's switch (`AP_PHYSICS`), not this pass.
- Optional, for the author: the `C19-APPH02-3` trap wording above; and the first pass's uz/ru note on «средняя скорость» below.
- The 699 validator errors are the listening lane's (`C19-li*`, `C20-li*`), there before this pass.

## 18 Oct 2026: the first pass (history)

What follows is the first pass's record as written on 18 Oct. Where it says `C1-ph3202` is quarantined, that is superseded by the
version 2 and the second pass above; the rest stands.

### Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P15aps1 (checker 1) | `.superpowers/p15/blind-ap/C19-P15aps1.json` (72), `C22-P15aps1.json` (48) | `blind-ap/<stream>-P15aps1.answers.json` |
| P15aps2 (checker 2, who ran the reconcile and wrote this file) | `blind-ap/C19-P15aps2.json`, `C22-P15aps2.json`, the same 120 ids | `blind-ap/<stream>-P15aps2.answers.json` |

P15aps2's copy: `npx tsx scripts/content/blind.ts <stream> P15aps2 --pending --blind <staging>` for C19 and C22 (a family is left out
of a blind copy, so C1 gives none), then `.superpowers/p15/check-ap2/filter.cjs` kept exactly the ids of the two id lists in each copy
and its map and wrote them into `blind-ap/`, unprinted (dropped from C19: 18 older `C19-li*` listening drafts, not AP); the staging
files were deleted. A copy holds each item's stem in en, uz and ru and its options shuffled by the solver's own seed and lettered
A–D; no key, no `why`. Both solvers' copies, answers and maps sit in the one folder `reconcile.ts` reads.

Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads
P15aps1, P15aps2, `p15-ap1` and `p15-ap2` as four agents (none matches a `SESSIONS` pattern), so `keyCheckOf("blind:P15aps1+P15aps2",
{ author: "agent:p15-ap1" })` (and `p15-ap2`) is `{ kind: "blind", n: 2 }`. P15aps2 was told no key: the brief named the id files,
the folders and the process, no stem, option or key. It opened neither `.map-*` file of the blind copies, nor the item records,
nor the authors' ledgers (`author-ap1.md`, `author-ap2.md`), notes, logs or commit messages, nor checker 1's answers, before it wrote
its own: it read every item in its copy in all three languages (`check-ap2/dump.cjs`; `check-ap2/langnums.cjs` compares the numbers
of the uz and ru stems and options with the en ones: the only differences are "twice"/"a third" written as 2/3), solved it, and
wrote a letter and a one-line reading per item. Checker 1's answers were already in the folder when P15aps2 finished; P15aps2 read
them only after its own were final, and only `reconcile.ts` read the maps.

#### Two flags first written, then withdrawn (before any key or checker 1's answer was seen)

P15aps2 first marked `C19-ph11q3` (a dog's round trip; en "average velocity", key 0 m/s) and `C22-ph11c2` (x = 7 m to x = −5 m in
4 s; key −3 m/s) `two_defensible`: their uz and ru stems ask for «oʻrtacha tezlik» / «средняя скорость», which in Russian and Uzbek
school physics (Перышкин) is often the path speed, and the path speed (5 m/s; 3 m/s) is among the options. It then read lesson
`C19-APPH01-1`, whose trap piece checks `C19-ph11q3` and whose homework holds `C22-ph11c2`: in uz and ru it defines «Средняя скорость
= Δx ÷ Δt; средняя путевая скорость = путь ÷ Δt» («Oʻrtacha tezlik = Δx ÷ Δt; oʻrtacha yoʻl tezligi = yoʻl ÷ Δt») and works a round
trip as «средняя скорость 0» (the Мякишев convention). In the course's own terms each item has one correct option, so P15aps2
withdrew both flags and kept its answers. Not blocking, for the author: «средняя скорость перемещения» (`C19-ph11q3`) and «проекция
средней скорости на ось x» (`C22-ph11c2`) would make the two uz/ru stems stand alone.

### The families (C1)

A family is left out of every blind copy; it is keyed by its formula against the independent solver on 50 seeded instances
(`family-check.ts`, `checkFamily`). P15aps2 ran it (`check-ap2/fam.ts`, which prints verdicts and counts only): **all 60 verified
50/50 by their `relation`, no disagreement, no problem**, no instance item names any of them. Because a family's `relation` is the
author's own statement of the physics and is filled with the drawn values, P15aps2 also solved rendered instances itself:

1. **By hand, 4 instances per family (240)**: seeds `P15aps2:0` … `3`, the en stem and its options shuffled and lettered, the key's
   letter in a map not printed (`check-ap2/fam/`); P15aps2 read every stem, solved it and wrote its letters before comparing
   (`check-ap2/famcmp.cjs`): **240 of 240 agree with the family's key**, no instance with two equal options or a second correct one.
   It also read the uz and ru stem of each family's first instance (the validator already checks that their numbers match the en).
2. **By its own formulas, 50 more instances per family (3,000)**: `check-ap2/famsolve.ts` reads the numbers of each rendered en stem
   in order and applies P15aps2's own physics (the "my formula" column; written from reading the stems, not from the families'
   formulas, relations or distractors, which it never reads), picks the option whose value matches and checks the instance is
   physically possible (the stone has not landed, the push beats friction, no kinetic energy created in a collision, x inside the
   amplitude, the stone sinks, …). **2,986 of 3,000 agree with the key; no plausibility problem.** The 14 others are all `C1-ph3202`.

| Family | My formula | Variants | `checkFamily` | Hand (4) | Own formula (50) | Decision |
|---|---|---:|---|---|---|---|
| C1-ph1101 | a = (v₁ − v₀)/t | 117 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph1102 | |d₁ − d₂|/t | 60 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph1201 | H − ½gt² (still in the air) | 31 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph1202 | v²/(2a) | 18 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph1301 | v√(2h/g) | 32 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph1302 | d/(v₁ + v₂) | 266 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph2101 | (F₁ − F₂)/m | 157 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph2102 | m(v₁ − v₀)/t | 413 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph2201 | (F − μmg)/m (F > μmg) | 323 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph2202 | m(g + a) | 54 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph2301 | mv²/r | 101 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph2302 | mg/k, in cm | 30 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph3101 | √(2Fd/m) | 60 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph3102 | (F − f)d | 3097 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph3201 | √(2gh) | 11 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph3202 | x√(k/m) | 60 | verified, 50/50, no problem | 4/4 | 36/50 (14: no option right) | **quarantine** |
| C1-ph3301 | Fv | 119 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph3302 | mv²/(2d) | 324 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph4101 | mv/t | 263 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph4102 | m(v₁ + v₂) | 192 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph4201 | m₁v/(m₁ + m₂) | 35 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph4202 | m_ball v/M_skater | 230 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph4301 | ½m₁m₂v²/(m₁ + m₂) | 23 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph4302 | m₁(v₁ − v₁′)/m₂ (no K created) | 94 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5101 | ½αt² | 38 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5102 | ω₀ + αt | 255 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5103 | v r₂/r₁ | 16 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5201 | m₁d₁/m₂ | 36 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5202 | rF sin 30° | 54 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5203 | W d₁/d₂ | 54 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5301 | τ/(2mr²) | 55 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5302 | FR/(½MR²) = 2F/(MR) | 209 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph5303 | m₁r₁² + m₂r₂² | 221 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6101 | ½Iω² | 73 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6102 | √(2τθ/I) | 106 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6103 | ½I(ω² − ω₀²) | 240 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6201 | I₁ω₁/I₂ | 52 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6202 | τt/I | 149 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6203 | I₁ω₁/(I₁ + I₂) | 52 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6301 | ¾mv² | 37 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6302 | ½mgh (hoop: half of mgh) | 56 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph6303 | r_far v_far/r_near | 192 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7101 | kx/m | 58 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7102 | n/t | 307 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7103 | mg/x | 48 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7201 | T√n | 38 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7202 | 2π√(L/g), π = 3.14, to 0.01 | 16 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7203 | 2π√(m/k), π = 3.14, to 0.01 | 15 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7301 | A√(k/m) | 51 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7302 | ½k(A² − x²) | 35 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph7303 | E(A₂/A₁)² | 130 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8101 | m/V | 64 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8102 | W/A | 138 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8103 | F/(A × 10⁻⁴ m²/cm²) | 31 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8201 | ρVg | 16 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8202 | ρgh | 39 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8203 | mg − ρVg | 14 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8301 | v₁A₁/A₂ | 58 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8302 | P₁ + ½ρ(v₁² − v₂²) | 264 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |
| C1-ph8303 | √(2gh) | 12 | verified, 50/50, no problem | 4/4 | 50/50 | verified_auto |

**`C1-ph3202` (a squeezed spring launches a block; v = x√(k/m)) is wrong on 14 of 50 instances.** Its squeeze x can be drawn as
0.25 m, and the family's `decimals: 1` renders every number of the stem to one decimal, so the stem says
"squeezed 0.3 m" (uz «0,3 m ga», ru «на 0,3 м») while the key is computed with 0.25 m: on such an instance none of the four options
is the right answer for the stem the student reads, e.g. "a spring with spring constant 200 N/m is squeezed 0.3 m and then launches
a 2 kg block": 0.3 × √(200/2) = 3 m/s, and the options are 1.8, 6.3, 25 and 2.5 (the key, 0.25 × 10). `checkFamily` agrees 50/50
only because its relation is filled with the unrounded values (`check-ap2/vals.ts` prints the drawn values beside the rendered
stem: `{"m":2,"s":10,"x":0.25}` → "squeezed 0.3 m"). A disagreement with a blind solver quarantines (spec §5.5 step 4), so the family
is decided as a quarantine. Fix for the author (a new version): draw x with at most one decimal, or render it with two.

### The decision

- C19 and C22: `npx tsx scripts/content/reconcile.ts <stream> P15aps1 P15aps2 --blind .superpowers/p15/blind-ap --write` (dry runs
  first, the same decisions).
- C1: `check-ap2/famwrite.ts --write`, which is `reconcile.ts C1 --records --write` restricted to the 60 AP families (that command
  decides every C1 record): `reconcile()` decides from each family's `checkFamily` verdict, except that `C1-ph3202`'s verdict is the
  quarantine above, and `applyDecision()` writes the record; the decision log is `blind-ap/C1-reconcile-records.json`. The
  validator's item errors for these 60 ids are none (`check-ap2/logs/validate-before.log`).

| Stream | Items in the stream | Verified | Quarantine | Pending | Blocked | Skipped |
|---|---:|---:|---:|---:|---:|---:|
| C19 | 480 | 72 | 0 | 0 | 0 | 408 (372 served before, 36 `C19-li*` listening drafts with no answer here) |
| C22 | 48 | 48 | 0 | 0 | 0 | 0 |
| C1 (the 60 AP families) | 60 of 293 | 59 | 1 | 0 | 0 | 0 |

**Both solvers chose the key on all 120 items.** No answer was stale, and neither answers file raises `two_defensible`,
`unanswerable` or `no_passage_needed`; checker 1's notes end "One correct." on all 120. The decisions are kept in
`blind-ap/C19-reconcile.json`, `C22-reconcile.json` and `C1-reconcile-records.json`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **179** | 120 items with `key_check_2: "blind:P15aps1+P15aps2"`, 59 families with `"solver:relation@50"`; `key_check_2_version: 1` |
| `quarantine` | **1** | `C1-ph3202`: `key_check_2: null`, `quarantine_reason` as above |

**Verified: 179. Quarantined: 1** (`C1-ph3202`, the stem shows a rounded squeeze; every option is wrong on 14 of 50 instances).

### The fill-in item, every option in the sentence

One item completes a sentence: `C19-ph83q1`, "Compared with the wide part, in the narrow part the water's …". Key: "… speed is
higher and pressure is lower" (continuity, then Bernoulli in a level pipe). "speed and pressure both stay the same" (the area
changes), "speed is higher and pressure is higher" (Bernoulli: faster is lower pressure), "speed is lower and pressure is higher"
(continuity: narrower is faster): no second correct option.

### Every item: the key, and P15aps2's reading

Verdict for every row: **verified_auto** (P15aps1 and P15aps2 both chose the key; `blind:P15aps1+P15aps2`, `key_check_2_version` 1).
The key is the option text in English; checker 1's notes give the same reading for every item.

| Item | Key | P15aps2's reading |
|---|---|---|
| C19-ph11q1 | 2 m/s | displacement 600 − 200 = 400 m north in 200 s: 2 m/s (4 m/s is distance ÷ time); uz/ru ask for the modulus of the average velocity («модуль средней скорости») |
| C19-ph11q2 | 3 m/s² | (18-6)/4 = 3 m/s² |
| C19-ph11q3 | 0 m/s | a round trip: displacement 0, average velocity 0 (5 m/s is the average speed). uz/ru «средняя скорость»: see "Two flags first written, then withdrawn" |
| C19-ph12q1 | 24 m | ½·3·4² = 24 m |
| C19-ph12q2 | 45.9 m | falls ½·9.8·9 = 44.1 m; height 90-44.1 = 45.9 m (44.1 is the distance fallen) |
| C19-ph12q3 | v = 0, a = 9.8 m/s² down | at the top v = 0, a = g = 9.8 m/s² down |
| C19-ph13q1 | 4 s | t = sqrt(2·78.4/9.8) = 4 s; horizontal speed irrelevant |
| C19-ph13q2 | 12 m | t = sqrt(2·44.1/9.8) = 3 s; x = 4·3 = 12 m |
| C19-ph13q3 | Both at the same time | same vertical motion: both land together |
| C19-ph21q1 | 4 m/s² | (30-10)/5 = 4 m/s² |
| C19-ph21q2 | 7 m/s² | (60-4)/8 = 7 m/s² |
| C19-ph21q3 | They are equal in size | Newton's third law: equal in size |
| C19-ph22q1 | 49 N | 0.25·20·9.8 = 49 N |
| C19-ph22q2 | 2.08 m/s² | friction 0.4·5·9.8 = 19.6 N; (30-19.6)/5 = 2.08 m/s² |
| C19-ph22q3 | 50 N | static friction matches the 50 N push (max 117.6 N is not reached) |
| C19-ph23q1 | 20 N | kx = 400·0.05 = 20 N |
| C19-ph23q2 | 24 N | mv²/r = 3·16/2 = 24 N |
| C19-ph23q3 | Friction from the road | on a level curve static friction from the road is the centripetal force |
| C19-ph31q1 | 50 J | ½·4·25 = 50 J |
| C19-ph31q2 | 4 m/s | W = 4·6 = 24 J = ½·3·v², v = 4 m/s |
| C19-ph31q3 | 9 times | (12/4)² = 9 |
| C19-ph32q1 | 58.8 J | mgh = 3·9.8·2 = 58.8 J |
| C19-ph32q2 | 7 m/s | sqrt(2·9.8·2.5) = 7 m/s |
| C19-ph32q3 | Equal: the height is the same | frictionless, same drop: same speed |
| C19-ph33q1 | 294 W | 60·9.8·4/8 = 294 W |
| C19-ph33q2 | 3,000 W | Fv = 750·4 = 3000 W |
| C19-ph33q3 | Same work; A has twice the power | same mgh; A takes half the time: twice the power |
| C19-ph41q1 | 6 kg·m/s | 0.4·15 = 6 kg·m/s |
| C19-ph41q2 | 40 N | Δp = 2 kg·m/s over 0.05 s: 40 N |
| C19-ph41q3 | 2 kg·m/s | 0.2·(5+5) = 2 kg·m/s |
| C19-ph42q1 | 2 m/s | 50·3 = 75·v, v = 2 m/s |
| C19-ph42q2 | 6 m/s | 18/3 = 6 m/s |
| C19-ph42q3 | 1 m/s right | (12-6)/6 = 1 m/s right |
| C19-ph43q1 | Yes: total K stays 9 J | K before 9 J, after 1+8 = 9 J (p 6 = 2+4): elastic |
| C19-ph43q2 | 12 J | 36 J before; v = 12/3 = 4, 24 J after; 12 J lost |
| C19-ph43q3 | Inelastic: K is lost | K lost, they did not stick: inelastic (not perfectly) |
| C19-ph51q1 | 19 rad/s | 4 + 3·5 = 19 rad/s |
| C19-ph51q2 | 50 | ½·4·25 = 50 rad |
| C19-ph51q3 | about 12.6 m/s | 2π·0.2·10 = 12.56 m/s |
| C19-ph52q1 | 18 N·m | 0.6·30 = 18 N·m |
| C19-ph52q2 | 2 | 20·3 = 30·d, d = 2 m |
| C19-ph52q3 | 10 N·m | rF sin30 = 0.25·80·0.5 = 10 N·m (17 is the cos error) |
| C19-ph53q1 | 14 kg·m² | 2·1² + 3·2² = 14 kg·m² |
| C19-ph53q2 | 2 rad/s² | I = 2·3·1² = 6; 12/6 = 2 rad/s² |
| C19-ph53q3 | 3 rad/s² | I ×4 at twice the distance: 12/4 = 3 rad/s² |
| C19-ph61q1 | 80 J | W = 4·15 = 60 J; 20+60 = 80 J |
| C19-ph61q2 | 18 J | ½·4·9 = 18 J |
| C19-ph61q3 | about 94 J | θ = 5·2π = 31.4 rad; 3·31.4 = 94.2 J |
| C19-ph62q1 | 8 rad/s | α = 6/3 = 2; ω = 8 rad/s |
| C19-ph62q2 | 4 rad/s | L = 12; 12/3 = 4 rad/s |
| C19-ph62q3 | It becomes 3 times as large | K = L²/2I: 12 J -> 36 J, 3 times |
| C19-ph63q1 | 1/3 | rot ¼mv² of total ¾mv²: 1/3 |
| C19-ph63q2 | 27 J | ¾·4·9 = 27 J |
| C19-ph63q3 | 3 km/s | angular momentum at the apsides: 9000·2 = 6000·v, v = 3 km/s |
| C19-ph71q1 | 2.5 Hz | 30/12 = 2.5 Hz |
| C19-ph71q2 | 10 m/s² | kx/m = 200·0.2/4 = 10 m/s² |
| C19-ph71q3 | 0.5 s | T = 5/10 = 0.5 s, independent of amplitude |
| C19-ph72q1 | Using a longer string | T = 2π sqrt(L/g): longer string |
| C19-ph72q2 | 1.5 s | T ∝ sqrt(m): 3·0.5 = 1.5 s |
| C19-ph72q3 | A string 4 times as long | T ∝ sqrt(L): 4 times the length doubles T |
| C19-ph73q1 | At x = +A and at x = −A | \|a\| = kx/m is largest at the turning points |
| C19-ph73q2 | 5 m/s | A sqrt(k/m) = 0.5·10 = 5 m/s |
| C19-ph73q3 | 54 J | E ∝ A²: 6·9 = 54 J |
| C19-ph81q1 | 6,000 Pa | 3000/0.5 = 6000 Pa |
| C19-ph81q2 | 7,800 kg/m³ | 7.8/0.001 = 7800 kg/m³ |
| C19-ph81q3 | 200,000 Pa | 3 cm² = 3e-4 m²: 60/3e-4 = 200,000 Pa |
| C19-ph82q1 | 49,000 Pa | ρgh = 1000·9.8·5 = 49,000 Pa |
| C19-ph82q2 | 49 N | ρVg = 1000·0.005·9.8 = 49 N |
| C19-ph82q3 | A: 9.8 N, B: 9.8 N | same displaced volume: 9.8 N each |
| C19-ph83q1 | speed is higher and pressure is lower | continuity: faster; Bernoulli: lower pressure |
| C19-ph83q2 | 12 m/s | 3·0.04/0.01 = 12 m/s |
| C19-ph83q3 | 142,500 Pa | 150,000 + ½·1000·(1-16) = 142,500 Pa |
| C22-ph11c1 | Positive | moving in -x and slowing: a opposite to v, positive |
| C22-ph11c2 | −3 m/s | Δx/Δt = (−5 − 7)/4 = −3 m/s (3 m/s drops the sign). uz/ru «средняя скорость»: see "Two flags first written, then withdrawn" |
| C22-ph12c1 | 24.6 m/s | 5 + 9.8·2 = 24.6 m/s |
| C22-ph12c2 | a = 2 m/s² | slope of v-t = (10-2)/4 = 2 m/s² = a (24 m is the area) |
| C22-ph13c1 | Its horizontal velocity | no horizontal force: horizontal velocity constant |
| C22-ph13c2 | 18 m/s east | 20 - 2 = 18 m/s east |
| C22-ph21c1 | 0 N | constant velocity: net force 0 |
| C22-ph21c2 | The lamp’s pull on the Earth | third-law partner of Earth-on-lamp is lamp-on-Earth |
| C22-ph22c1 | Your weight | a = 0: N = mg |
| C22-ph22c2 | Static friction from the wall | static friction (vertical) balances weight; the normal force is horizontal |
| C22-ph23c1 | Its acceleration points inward | uniform circular motion: centripetal acceleration inward; velocity direction changes |
| C22-ph23c2 | A stretches 3 times as far as B | x = mg/k: A stretches 3 times as far |
| C22-ph31c1 | 0 J | upward force ⊥ horizontal displacement: 0 J |
| C22-ph31c2 | Negative | friction opposite the displacement: negative work |
| C22-ph32c1 | At the lowest point | lowest point: least U, greatest K |
| C22-ph32c2 | 32 J | U ∝ x²: 4·8 = 32 J |
| C22-ph33c1 | J/s | W = J/s |
| C22-ph33c2 | It decreases | K constant, U falls: K+U decreases (friction) |
| C22-ph41c1 | It makes the stop last longer | same Δp over longer Δt: smaller F |
| C22-ph41c2 | Equal: 6 kg·m/s each | 2·3 = 3·2 = 6 kg·m/s |
| C22-ph42c1 | It moves backward | momentum 0: boat recoils backward |
| C22-ph42c2 | When no net outside force acts | conserved when the net external force is zero |
| C22-ph43c1 | They stick together and both stop | total p = 0: sticking and stopping loses all K |
| C22-ph43c2 | The first stops; the second moves on | equal masses, elastic, head-on: velocities exchange |
| C22-ph51c1 | Same ω; Q moves twice as fast | rigid body: same ω; v = ωr, Q twice as fast |
| C22-ph51c2 | ω positive, α negative | ω positive (CCW), slowing: α negative |
| C22-ph52c1 | At the handle | τ = rF: largest r at the handle |
| C22-ph52c2 | Net force zero and net torque zero | static equilibrium: net force 0 and net torque 0 |
| C22-ph53c1 | Wheel B | solid disk has smaller I (½MR² vs ~MR²): larger α |
| C22-ph53c2 | It doubles | α = τ/I doubles |
| C22-ph61c1 | 9 times as large | K = ½Iω²: 9 times |
| C22-ph61c2 | Doubling the angle it turns through | W = τθ: double θ |
| C22-ph62c1 | L stays the same, ω increases | no external torque: L constant; I smaller, ω larger |
| C22-ph62c2 | ω of A is half of ω of B | ω = L/I: A's is half |
| C22-ph63c1 | The solid cylinder | cylinder ½MR² < hoop MR²: more K translational, arrives first |
| C22-ph63c2 | At the point nearest the planet | rv constant at the apsides (Kepler 2): fastest nearest |
| C22-ph71c1 | F = −kx | SHM: restoring force proportional to displacement, F = -kx |
| C22-ph71c2 | 25 Hz | 1/0.04 = 25 Hz |
| C22-ph72c1 | It becomes half as long | T ∝ 1/sqrt(g): half |
| C22-ph72c2 | It does not change | T ∝ sqrt(m/k): unchanged |
| C22-ph73c1 | Speed largest, acceleration zero | at x = 0: speed max, a = 0 |
| C22-ph73c2 | x ≈ 0.71A | ½kx² = ½·½kA²: x = A/√2 ≈ 0.71A |
| C22-ph81c1 | Equal to the smaller piece’s | density is a material property: equal |
| C22-ph81c2 | Pressure up; the force stays the same | same weight, smaller area: pressure up, force same |
| C22-ph82c1 | It becomes 3 times as large | ρgh ∝ h: 6/2 = 3 times |
| C22-ph82c2 | It is equal to the weight | floating at rest: buoyant force = weight |
| C22-ph83c1 | It becomes 3 times as large | Av constant: a third of the area, 3 times the speed |
| C22-ph83c2 | Lower above the roof than inside | faster air above: lower pressure than inside |

### The lessons and every physics statement

The 24 lessons (`C19-APPH01-1` … `C19-APPH08-3`, 3 pieces each: idea, example, trap) are not keyed here and stay as written (`draft`,
`key_check_2: null`); each piece's `check` is one of the 72 C19 questions, and their tests and homework draw the C1 families and the
C22 items. P15aps2 read every piece in English after its answers were written (`check-ap2/lessons.cjs`) and recomputed every
number in it: all 72 pieces are right (units, signs, g = 9.8 m/s², π ≈ 3.14 where stated; e.g. 2 turns/s = 4π rad/s; T = 2π√(1/100)
≈ 0.63 s; P₂ = 200,000 + 500 × (4 − 36) = 184,000 Pa). The uz and ru bodies carry the same numbers as the en ones (two pieces differ
only by wording: `APPH02-1` trap in ru does not repeat "30 kg"; `APPH03-1` trap in uz writes "twice" as «2 marta»). Every physics
statement in the 120 items, the 60 families' stems and the 72 pieces was checked for its unit, sign and g: none is wrong. The one
fault found is the rendering of `C1-ph3202` above. The lesson records hold the C22 conceptual items in `homework.families` beside the
C1 families: the authors' layout, not changed here.

### What the write changed

`reconcile.ts --write` (and `famwrite.ts`, which writes the same way) re-serialises each file it touches with `JSON.stringify`,
which prints the files' `prior_b` values `1.0` and `0.0` as `1` and `0` (the P13/P14 precedent). `check-ap2/rebuild.cjs` rebuilt each
of the six files from its text before the write (`check-ap2/snap/`) with only the record edits of the decided items (a changed value
in place; `key_check_2_version` or `quarantine_reason` appended after the item's last field, as `applyDecision` does) and wrote it
only when its parse is deep-equal to what the write produced. All six were rebuilt (`check-ap2/logs/rebuild.log`; `C22-2.json` was already in its
`JSON.stringify` form, so its rebuild is byte-identical to the written text, which checks the method). `check-ap2/diffcheck.cjs`
compares every item of the six files with `HEAD`: **180 items changed, 0 problems**: only the 180 AP ids differ, and only in `status`,
`key_check_2`, the new `key_check_2_version` (179) or the new `quarantine_reason` (1); the text diff holds no other line (a last
field gains its comma); LF, no BOM, no top-level field, lesson or other item changed. Each key, option, stem, `why`, level, version
and author is as the authors wrote it. No lesson record is touched.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all` before and after (`check-ap2/logs/validate-before.log`,
  `validate-after.log`): **the same 425 errors, 897 warnings and 294 notes**, none on an AP id; every error is on the listening lane's
  `C19-li*` (C19-24) and `C20-li*` records (`schema.unknown_field`, `format.none`), there before this pass, so the exit is 1 both
  times. After: C1 292 `verified_auto` + 1 `quarantine` of 293, C19 444 `verified_auto` of 480 (the 36 others the `C19-li*` drafts),
  C22 48 of 48.
- `npx tsx scripts/content/validate.ts --all` after, with the 50-instance family checks (`check-ap2/logs/validate-after-families.log`):
  the same 425 errors, and 899 warnings (the 897 plus two `family.variants_claim` on K4 families, not P15's); no error, warning or
  record finding on any of the 180 AP ids: the 59 `solver:relation@50` records hold, and C1 is 292 `verified_auto` + 1 `quarantine`.
  The validator's own family check still passes `C1-ph3202` (its relation reads the unrounded values): its quarantine is this pass's
  record, from the blind solves above.
- `npx tsx scripts/content/scan.ts --out …` before and after (`check-ap2/scan-before/`, `scan-after/`): exit 0, **2 findings, 0
  errors, 0 on served items**, the same two both times (`cue.length` warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P15's).
- Tests, with the DB-free config `.superpowers/p13/fixb-scan/vitest.nodb.config.ts` (Postgres :5433 is not running here),
  `ANTHROPIC_API_KEY` empty, `AI_FAKE=1` (`check-ap2/logs/vitest.log`): `p15-ap1`, `p15-ap2`, `blind`, `keycheck`, `reconcile`,
  `reconcile-cli`, `scan`, `family`, `committed-content`, `c19-loader`: **145 pass, 1 fails**: `p15-ap1` > "every family is a C1
  template … keyed by the 50-instance solver with no problem", on `C1-ph3202`'s new `quarantine` status (below). `p15-ap2` passes
  whole (its pieces, items and families in both states). Vitest also reported one worker RPC timeout ("Timeout calling
  onTaskUpdate") while `committed-content` ran for 95 s on this machine: a runner timeout, no test failed by it.

### For the integrator (not changed here)

- 179 of the 180 are `verified_auto` at version 1; `C1-ph3202` (`C1/C1-14.json`) is quarantined and needs a version 2 from its author (`agent:p15-ap1`):
  draw x with at most one decimal, or render it with two decimals. It sits in lesson `C19-APPH03-2`'s test and homework `families`.
- The lessons stay `draft`; serving them is the AP lane's switch (`AP_PHYSICS`), not this pass.
- One author test pins the old state: `tests/unit/content/p15-ap1.test.ts` > "every family is a C1 template … keyed by the 50-instance
  solver with no problem" fails on `C1-ph3202` (its `statusOk` accepts draft, verified_auto, reviewed or operational, not quarantine).
  It needs the family's version 2, or to accept a quarantined record; not changed here (tests are the authors').
- The 36 `C19-li*` drafts and the C20 listening records carry the 425 validator errors that were there before this pass (another lane's).
