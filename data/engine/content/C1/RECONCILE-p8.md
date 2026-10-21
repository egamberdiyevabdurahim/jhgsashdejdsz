# C1: key check 2 of the P8 AP Calculus AB lesson families (P8 blind checkers 3 and 4, 14 Oct 2026)

P8 (SPEC-lessons rev. 2, §9.1 steps 2-3; `.superpowers/p8/PLAN.md` §3) added the lesson families of AP Calculus AB units 5-8:

| File | Commit | Author | Families | Pages |
|---|---|---|---|---|
| `C1-11.json` (batch 11) | `b57d27b5` | `agent:p8-a4` | `C1-ap5001` … `ap5023` (23) | `C19-APCA05-1` … `C19-APCA08-3` (`C19-18.json`) |

Before this pass all 23 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. The plan's ceiling was 24
(`ap5024` unused, as allowed).

## How they were keyed

A family has no single item for a blind solver: its blind copy shows the template and the raw parameter ranges, not the derived values
that fill the stem. As in P7 (`C1/RECONCILE-p7.md`), its key check 2 is the validator's 50-instance independent solver, which reads the
family's `relation`, and the two checkers each did their own working on rendered instances besides:

- **The 50-instance check.** `npx tsx .superpowers/p7/family-check.ts C1/C1-11.json` (dry; the check of
  `scripts/content/lesson-families-check.ts`, plus a look for twin options): **23 of 23 verified, `solver:relation@50`, agree 50/50
  each, no twin options** (`.superpowers/p8/k4/family-check.log`).
- **P8s4's own working (checker 4).** `.superpowers/p8/k4/render.ts` renders 50 instances of each family with P8s4's own seeds
  (`p8s4:0` … `p8s4:49`, not the check's `check:<n>`) and writes the English stems apart from the keys. `.superpowers/p8/k4/fam_solve.py`
  reads only a stem's text, parses its numbers and solves it with sympy (the closed-interval test, the MVT's c, the sign of f′, f″ = 0,
  the fence and box optimisations, left and trapezoidal sums from the stated values, the FTC, substitution, separation of variables,
  doubling and half-life, average value, total distance with |v|, the area between the curves at their meeting points, discs and square
  cross sections), then compares with the family's own key: **1,150 instances, 1,150 agree, every value a whole number**
  (`.superpowers/p8/k4/fam_solve.log`).
- **P8s3's own working (checker 3).** `.superpowers/p8/k3/solve.py` over every instance of every family (6,570 in all): 6,570 agree,
  all whole, no twin options, the same numbers in en, uz and ru (`.superpowers/p8/k3/solve-all.log`, "problems: 0").

`npx tsx scripts/content/reconcile.ts C1 P8s3 P8s4 --write` (both answers files are empty: a family is not answered as an item) decided
**189 items: verified 23**, the other 166 skipped (already `verified_auto`).

| Status after this pass | Families | Record |
|---|---:|---|
| `verified_auto` | **23** | `C1-ap5001` … `ap5023`: `key_check_2: "solver:relation@50"`, `key_check_2_version: 1`, version 1 |

A served family is drawn where its page draws it: each is written for one `C19-APCA0x-y` page (`page`), so no C2 explainer or practice
task draws it (`src/server/phase-d/practice.ts` entriesAt since the P7 integration; `lesson-c19-apca58.test.ts` "the families written
for these pages belong to them"), and `lesson-asks-its-page` passes with all 23 served.

| Family | Page | Template (short) |
|---|---|---|
| C1-ap5001 | C19-APCA05-1 | absolute maximum of x³ − qx on [−A, B] |
| C1-ap5002 | C19-APCA05-1 | the MVT's c for ax² + bx on [p, q] |
| C1-ap5003 | C19-APCA05-2 | x of the local minimum of a cubic |
| C1-ap5004 | C19-APCA05-2 | x of the point of inflection of a cubic |
| C1-ap5005 | C19-APCA05-3 | the largest pen along a wall from L m of fence |
| C1-ap5006 | C19-APCA06-1 | left Riemann sum of a runner's speeds |
| C1-ap5007 | C19-APCA06-1 | trapezoidal sum of a rain rate |
| C1-ap5008 | C19-APCA06-2 | ∫ₐᵇ (c₃x² + c₂x) dx |
| C1-ap5009 | C19-APCA06-2 | g′(c) for g(x) = ∫ₐˣ (pt² − qt + r) dt |
| C1-ap5010 | C19-APCA06-3 | ∫₀ᵇ 6x(x² + c)² dx by substitution |
| C1-ap5011 | C19-APCA06-3 | ∫₀^(ln n) k eˣ dx |
| C1-ap5012 | C19-APCA07-1 | the slope of dy/dx = ax² − by at a point |
| C1-ap5013 | C19-APCA07-1 | the positive k with y = e^(kx) solving y″ + By′ = Cy |
| C1-ap5014 | C19-APCA07-2 | y(T) for dy/dt = k√y, y(0) given |
| C1-ap5015 | C19-APCA07-2 | y(p) for dy/dx = x/y, y(0) = c |
| C1-ap5016 | C19-APCA07-3 | bacteria after T hours, doubling every d |
| C1-ap5017 | C19-APCA07-3 | years until 1/f remains, half-life h |
| C1-ap5018 | C19-APCA08-1 | average value of ax² + b on [0, c] |
| C1-ap5019 | C19-APCA08-1 | total distance for v(t) = at − b |
| C1-ap5020 | C19-APCA08-2 | area between y = a − kx² and y = b |
| C1-ap5021 | C19-APCA08-2 | area between y = mx² and y = nx |
| C1-ap5022 | C19-APCA08-3 | the k of the disc volume kπ under y = mx |
| C1-ap5023 | C19-APCA08-3 | square cross sections on a triangle under y = a − bx |

## How the file was written

`C1-11.json` is in `JSON.stringify` form at its own indent, so `--write` changed only the decided fields: for each of the 23 families
`status`, `key_check_2`, the comma after `version` and the new `key_check_2_version` (`.superpowers/p8/k4/fielddiff.mjs`). The template,
params, derived values, answer, distractors and `why` are the author's. The decision log is `.blind/C1-reconcile.json`, kept as
`.superpowers/p8/k4/C1-reconcile-log.json` (local).

## Checks after the write

- `validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the baseline), no finding on any `C1-ap50` id.
  `reconcile.ts C1 P8s3 P8s4 --audit`: 0 of 189 decisions differ from the files.
- The uz and ru lines: `C19/RECONCILE-p8.md` part 2's lint (0 findings).
- `lesson-c19-apca58.test.ts` pinned the families at `draft` with `key_check_2: null`; that line now asserts a status from the ladder
  and, on a served family, a `solver` key check (`keyCheckOf`). The file passes, as do `lesson-asks-its-page` and `lesson-teaches`.

## Not done here

- A native read of the uz and ru stems and `why` lines, and the teacher look (`reviewed`).
- The content `README.md` register row for C1 batch 11 (the integrator; `.superpowers/p8/author-4.md`).
