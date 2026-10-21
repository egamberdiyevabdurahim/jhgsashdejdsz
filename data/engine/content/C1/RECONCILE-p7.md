# C1: key check 2 of the P7 lesson families (13 Oct 2026)

P7 (SPEC-lessons rev. 2, §9.1 steps 2-3; `.superpowers/p7/PLAN.md` §3) added C1 template families written for its new C19 lessons. This
file has one part per pair of blind checkers.

## Part 1: the SAT Math lesson families (P7 blind checkers 1 and 2)

| File | Commit | Author | Families | Pages |
|---|---|---|---|---|
| `C1-7.json` (batch 7) | `9cd827e` | `agent:p7-a1` | `C1-m2a001` … `m2a012` (12) | `C19-MAAL01-2` … `C19-MAAM03-3` |
| `C1-8.json` (batch 8) | `c042cb0` | `agent:p7-a2` | `C1-m2b001` … `m2b012` (12) | `C19-MAPS01-2` … `C19-MAGT03-3` |

Before this pass all 24 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. The AP families of
`C1-9.json` and `C1-10.json` belong to checkers 3 and 4; this part does not decide them.

### How a family is keyed

A family is served as instances, so it has no single item for a blind solver; `scripts/content/blind.ts C1 P7s2 --pending` leaves
templates out ("nothing to solve"). Its key check 2 is the 50-instance independent solver of the validator (`keycheck.ts`:
`solver:<how>@<n>`, n ≥ 50), which reads the family's `relation`. `npx tsx scripts/content/reconcile.ts C1 P7s2` (dry run) gave
**166 items: verified 41, quarantine 0, pending 0, blocked 0, skipped 125**. The 41 are these 24 and the 17 AP families; I applied only
the 24, to `C1-7.json` and `C1-8.json`, by a text edit of each family's last lines that writes exactly what `applyDecision` writes for a
verified family:

| Status after this pass | Families | Record |
|---|---:|---|
| `verified_auto` | **24** | `key_check_2: "solver:relation@50"`, `key_check_2_version: 1`, version 1 (the record of `C1-6.json`'s families) |

### An independent check of my own

The solver reads the author's `relation`, so a key and a relation written with the same slip would pass it. As checker 2, I also drew
**40 instances of each family** (960 in all) from its `params` and `constraints`, solved each instance from the numbers the student sees
with my own sympy working (never the family's `answer` or `relation`), and compared: **960 of 960 agree**, and every family marked
`integer` gave a whole number every time.

| Family | Page | What my working solves |
|---|---|---|
| `C1-m2a001` | MAAL01-2 | a(x − b) + cx = kx + d has no solution: k is the x-coefficient, and the constants differ |
| `C1-m2a002` | MAAL02-2 | slope from the two points, then b = q − slope × p |
| `C1-m2a003` | MAAL02-3 | b − rt = w for t |
| `C1-m2a004` | MAAL03-2 | no solution: k = b × d ÷ a, with e × a ≠ c × d |
| `C1-m2a005` | MAAL03-2 | infinitely many: k = c × d ÷ a |
| `C1-m2a006` | MAAL03-3 | the two-equation ticket system, solved for the adult tickets |
| `C1-m2a007` | MAAL03-3 | the least whole k with k > mp − c |
| `C1-m2a008` | MAAM01-3 | N^(p/q) evaluated |
| `C1-m2a009` | MAAM02-2 | b² − 4ak = 0 for k |
| `C1-m2a010` | MAAM02-3 | squares √(x + a) = x − b and keeps only the root with x − b ≥ 0 (exactly one each time) |
| `C1-m2a011` | MAAM03-3 | the shifted vertex (h + r, k + u), summed |
| `C1-m2a012` | MAAM03-3 | completes the square of x² − bx + c |
| `C1-m2b001` | MAPS01-2 | P × (1 + a/100) × (1 − b/100) |
| `C1-m2b002` | MAPS01-2 | N ÷ (1 + r/100) |
| `C1-m2b003` | MAPS02-2 | (n × m + coach) ÷ (n + 1) |
| `C1-m2b004` | MAPS02-3 | the largest of the six scores minus the smallest |
| `C1-m2b005` | MAPS02-3 | the line at x = h |
| `C1-m2b006` | MAPS03-2 | girls who ride the bus ÷ all who ride the bus |
| `C1-m2b007` | MAPS03-3 | the sample fraction × the school |
| `C1-m2b008` | MAPS03-3 | the estimate minus the margin |
| `C1-m2b009` | MAGT01-2 | V × (b/a)³ |
| `C1-m2b010` | MAGT03-2 | L × sin x° |
| `C1-m2b011` | MAGT03-2 | (√3/4)s² ÷ √3 |
| `C1-m2b012` | MAGT03-3 | completes both squares; the radius is √(C + (A/2)² + (B/2)²) |

Each family's page is the C19 lesson it was written for, and each lesson that names it is now `verified_auto`
(`C19/RECONCILE-p7.md`). The 82 family references of P7's 34 SAT Math and DTM lessons are all served families after this pass.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the P7 baseline), no finding on any
  `C1-m2a*` or `C1-m2b*` id. With families: exit 0, 0 errors.
- The uz lines of both files are in `C19/RECONCILE-p7.md`'s lint (0 findings).
- Vitest: `lesson-c19-9`, `lesson-p7-a2`, `lesson-teaches`, `committed-content` pass (see `C19/RECONCILE-p7.md`).

### Not done here

- A native read of the uz and ru stems and `why` lines, and the teacher look (`reviewed`).
- The content `README.md` register rows for C1 batches 7 and 8 (the integrator).

## Part 2: the AP Calculus AB lesson families (P7 blind checkers 3 and 4)

| File | Commit | Author | Families | Pages |
|---|---|---|---|---|
| `C1-9.json` (batch 9) | `917b75b` | `agent:p7-a3` | `C1-ap1001` … `ap1007` (7) | `C19-APCA01-1` … `C19-APCA02-3` |
| `C1-10.json` (batch 10) | `b8c2e63` | `agent:p7-a4` | `C1-ap3001` … `ap3010` (10) | `C19-APCA03-1` … `C19-APCA04-3` |

Before this pass all 17 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`.

### How they were keyed

As in part 1: a family has no single item for a blind solver (`scripts/content/blind.ts C1 P7s4 --pending` gives "nothing to solve"),
and its key check 2 is the validator's 50-instance independent solver, which reads the family's `relation`.
`npx tsx .superpowers/p7/family-check.ts` on each file gives `verified solver:relation@50, agree 50/50` for all 17, and
`npx tsx scripts/content/reconcile.ts C1 P7s4` (with an empty answers file) decides **166 items: verified 17**, the rest skipped
(already `verified_auto`). A served family is also drawn by C1 practice at its rung (`calc`), as part 1's are at theirs.

| Status after this pass | Families | Record |
|---|---:|---|
| `verified_auto` | **16** | `C1-ap1001` … `ap1007`, `C1-ap3002` … `ap3010`: `key_check_2: "solver:relation@50"`, `key_check_2_version: 1`, version 1 |
| `draft` (held back) | **1** | `C1-ap3001`, `key_check_2: null`: its check passes, see below |

### Why C1-ap3001 is held in draft

With all 17 written `verified_auto`, `tests/unit/engine/lesson-asks-its-page.test.ts` failed on
"C2-ca0004 «The chain rule: outside, then inside» draws C1-ap3001" (part 1 saw it too). The C2 explainer `C2-ca0004` names no
`families`, so its quiz draws every served C1 family of its subskill and rung (`chain_rule`, `calc`). `C1-ap3001` is one: "f(x) =
{a}e^({k}x) + {b} sin({m}x). What is f′(0)?". The test's rule is that such a draw must be read against the page and listed in
`REVIEWED`. P7s4 read it: `C2-ca0004` teaches the chain rule on √(x² + 9), not the derivatives of eˣ and sin x, so `C1-ap3001` does not
ask only what that page teaches, and listing it as reviewed would be wrong. The other 16 are drawn by no C2 explainer of their
subskill and rung, and the test passes with them served.

The fix is the integrator's (`.superpowers/p7/PLAN.md` §10 item 8): give `C2-ca0004`'s pool its own `families` (for example
`["C1-clp009"]`, the one family `REVIEWED` lists for it), or keep families written for a C19 page out of the C2 draws. Then
`npx tsx scripts/content/reconcile.ts C1 P7s4 --write` verifies `C1-ap3001` (the blind files are on disk), and `C19-APCA03-1`, whose
example family it is, can follow (`C19/RECONCILE-p7.md` part 2).

### How the files were written

`reconcile.ts --write` re-serialises a file, which reflowed `C1-10.json` (a4 writes nested objects on one line) and wrote `1.0` as
`1` in `C1-9.json`. `.superpowers/p7/k4/repatch.mjs` rebuilt both from HEAD with a text edit of each family's last lines (the same
fields `applyDecision` writes), and checks that the result parses deep-equal to the reconcile output with `C1-ap3001` put back. A
parse before and after shows that only `key_check_2`, `status` and `key_check_2_version` changed, on the 16 families. The decision log
is `.blind/C1-reconcile.json`, with a copy in `.superpowers/p7/k4/C1-reconcile-log.json` (local).

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the P7 baseline), no finding on any
  `C1-ap` id. `reconcile.ts C1 P7s4 --audit`: 1 of 166 decisions differs from the files, `C1-ap3001` (draft, would verify): the one held back on purpose.
- The uz lines of both files are in `C19/RECONCILE-p7.md` part 2's lint (0 findings).
- Vitest: `lesson-asks-its-page`, `lesson-teaches`, `lesson-c19-apca34`, `committed-content` pass (`C19/RECONCILE-p7.md` part 2).

### Not done here

- `C1-ap3001` (above). A native read of the uz and ru stems and `why` lines, and the teacher look (`reviewed`).
- The content `README.md` register rows for C1 batches 9 and 10 (the integrator).

## The P7 integration (13 Oct 2026): `C1-ap3001`

The integrator took the fix this part names: a family written for a C19 lesson's page (`page` C19-…) is no C2 unit's question any more
(`src/server/phase-d/practice.ts` entriesAt; `tests/unit/engine-server/learn-quiz.test.ts` b2, which failed first on "C2-ca0004 drew
C1-ap3001"), and `lesson-asks-its-page` reads the same rule. The family check was run again on `C1-10.json`
(`.superpowers/p7/int/family-check.ts`, the dry check of this part): `C1-ap3001 verified solver:relation@50 agree 50/50`. Its record now
holds exactly what `applyDecision` writes for a verified family (`key_check_2: "solver:relation@50"`, `status: "verified_auto"`,
`key_check_2_version: 1`, a text edit of its last lines). `C19-APCA03-1`, whose example family it is, follows (`C19/RECONCILE-p7.md`).
