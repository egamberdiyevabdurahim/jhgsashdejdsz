# C19: key-check reconciliation (lane A2, 12 Oct 2026)

Bank C19 holds the lesson bodies of the Lessons part (SPEC-lessons rev. 2, §11.1, §12.2 lane A2; see the content `README.md`).
Phase 1a has two files, `C19-1.json` (MAAL01-03, MAAM01-03) and `C19-2.json` (MAPS01-03, MAGT01-03): 12 lesson records and 36
piece questions, written in the author's session `agent:p6-a1` at `12b2784`. All of them were `draft`, `version: 1`,
`key_check_1: "author"`, `key_check_2: null` before this pass.

## Who checked

Two blind solvers, each a separate agent run, neither of them the author's session (D26; `src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| A2s1 (checker 1) | `.blind/C19-A2s1.json` | `.blind/C19-A2s1.answers.json` |
| A2s2 (checker 2, who ran the reconcile and wrote this file) | `.blind/C19-A2s2.json` | `.blind/C19-A2s2.answers.json` |

Each copy was made by `node scripts/content/blind.mjs C19 <solver>`. It holds the 36 items with their four options shuffled by the
solver's own seed and lettered A-D, and no key and no `why`. Neither solver opened `.blind/.map-*` or the item records in the C19
files before writing the answers file. Only `reconcile.ts` read the maps. `agentOf` reads A2s1, A2s2 and the author `p6-a1` as
three agents, so a decision both solvers agree on is two independent checks.

## The decision

`npx tsx scripts/content/reconcile.ts C19 A2s1 A2s2`: **36 items; verified 36, quarantine 0, pending 0, blocked 0, skipped 0.**
For every item, both solvers chose the key (`options[0]`). No answer was stale: each solver's copy shows the item as it is now.
Neither answers file raises `two_defensible`, `unanswerable` or `no_passage_needed`. The decision log is
`.blind/C19-reconcile.json`, which stays local because `.blind/` is gitignored.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **36** | `key_check_2: "blind:A2s1+A2s2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | 0 | none |

`keyCheckOf("blind:A2s1+A2s2", { author: "agent:p6-a1" })` is `{ kind: "blind", n: 2 }`, so this is two checks under keycheck.ts.

**How the files were written.** `reconcile.ts --write` re-indents the whole file and folds every compact item line out, which made
a diff of about 1,500 lines. So I restored the files and wrote the same decision as a text edit of each item's status line. Then I
parsed the result and compared it with the files `--write` had produced: the 36 items are identical. Nothing else in an item
changed. Its key, options, `why` and version are as the author wrote them.

**The lesson records.** `reconcile.ts` reads only `items`. A lesson record has its own `key_check_2` and `status` (§11.1), and
`lesson-asks-its-page` requires a non-null `key_check_2` on any served status. Each of the 12 lessons now has
`key_check_2: "blind:A2s1+A2s2"` and `status: "verified_auto"`, because:

- all three of its piece questions are verified 2/2, and
- its worked example's final answer is its own blank step ("= ?"). That blank step is the lesson's `example` question (q2), which
  both solvers solved blind and keyed.

Nothing else in a lesson record changed. A lesson record has no `key_check_2_version`, because §11.1's shape has none. Its version
is 1, the same version its three items were checked at.

The `note` of each file now says that the key check is done, instead of "Draft until two blind solvers … (lane A2)".

## Each item, with checker 2's working

Both solvers chose the key on all 36 items. The value is checker 2's own blind working. Checker 1's notes reach the same value on
every item.

| Lesson | Piece | Item | Working | Value |
|---|---|---|---|---|
| C19-MAAL01-1 | idea | C19-al11q1 | 2(x + 4) = 3(x − 2) → 2x + 8 = 3x − 6 | x = 14 |
| | example | C19-al11q2 | 15 + 6t = 45 + t → 5t = 30 | 6 |
| | trap | C19-al11q3 | −3x ≥ −15 → x ≤ 5 (the sign turns) | 5 |
| C19-MAAL02-1 | idea | C19-al21q1 | rate (52 − 76) ÷ 4 = −6 an hour; 76 + 2 × 6 | 88 |
| | example | C19-al21q2 | 4 + (−2)(5 − 1) | −4 |
| | trap | C19-al21q3 | perpendicular slope −1/2; 3 = −2 + b | 5 |
| C19-MAAL03-1 | idea | C19-al31q1 | add: 2x = 14 | 7 |
| | example | C19-al31q2 | 3 pies = 18,000 | 6,000 |
| | trap | C19-al31q3 | add: 8x = 16, x = 2, y = 5; asks x + y | 7 |
| C19-MAAM01-1 | idea | C19-am11q1 | x² + 3x − 10 | b = 3 |
| | example | C19-am11q2 | 6x² − 13x − 5, or the value at x = 1: 4 × (−3) | −12 |
| | trap | C19-am11q3 | (x + 6)² = x² + 12x + 36 | 12 |
| C19-MAAM02-1 | idea | C19-am21q1 | (x − 5)(x + 3) | 5 |
| | example | C19-am21q2 | t² − 3t − 10 = (t − 5)(t + 2); time ≥ 0 | 5 |
| | trap | C19-am21q3 | roots −1/4 and 2; only −1/4 is offered | −1/4 |
| C19-MAAM03-1 | idea | C19-am31q1 | 4,000 ÷ 500 = 8 = 2³: 3 doublings × 3 h | 9 |
| | example | C19-am31q2 | 150 × 3⁴ = 150 × 81 | 12,150 |
| | trap | C19-am31q3 | 2 × (−3)² − 7 | 11 |
| C19-MAPS01-1 | idea | C19-ps11q1 | 15% of 60 | 9 |
| | example | C19-ps11q2 | 360,000 × 0.75 | 270,000 |
| | trap | C19-ps11q3 | 18 ÷ 0.45 (the club is the whole) | 40 |
| C19-MAPS02-1 | idea | C19-ps21q1 | (20 × 70 + 30 × 80) ÷ 50 = 3,800 ÷ 50 | 76 |
| | example | C19-ps21q2 | 4 × 72 − (62 + 80 + 71) = 288 − 213 | 75 |
| | trap | C19-ps21q3 | sorted 2, 3, 4, 7, 9, 12: (4 + 7) ÷ 2 | 5.5 |
| C19-MAPS03-1 | idea | C19-ps31q1 | (3 + 1) ÷ 10 | 2/5 |
| | example | C19-ps31q2 | 16 + 14 − 4 = 26; 40 − 26 = 14; 14 ÷ 40 | 0.35 |
| | trap | C19-ps31q3 | 4/6 × 3/5 (no return) | 2/5 |
| C19-MAGT01-1 | idea | C19-gt11q1 | π × 3² × 4 = 36π | 36 |
| | example | C19-gt11q2 | 10 × 8 − 3 × 2 | 74 |
| | trap | C19-gt11q3 | 20 × 15 × (12 − 10) | 600 |
| C19-MAGT02-1 | idea | C19-gt21q1 | 180 − 48 − 67 | 65 |
| | example | C19-gt21q2 | 3b + 24 = 180 (top angle 76) | 52 |
| | trap | C19-gt21q3 | same-side interior angles add to 180 | 65 |
| C19-MAGT03-1 | idea | C19-gt31q1 | √(13² − 5²) | 12 |
| | example | C19-gt31q2 | (4 − (−1))² + (4 − 2)² = 25 + 4 | 29 |
| | trap | C19-gt31q3 | A + B = 90°, so cos B = sin A | 5/13 |

I read every stem in uz and ru against the en. Each one asks the same question with the same numbers (I also ran a number-by-number
comparison over the three languages). The uz/ru option texts match their en values; only the number format changes (6000, 18 000,
1,5).

## The worked examples (checker 2)

Checker 2 re-solved each `example` piece in full: the solved model and the blank step it ends on. Every line holds, and every blank
step equals the key of the lesson's q2 above.

| Lesson | Solved model in the body | Its answer, checked | Blank step ("Now you") |
|---|---|---|---|
| C19-MAAL01-1 | 20 + 7t = 50 + 4t | t = 10 (90 = 90) | t = 6 |
| C19-MAAL02-1 | slope 3 through (2, 5), x = 6 | y = 17 | y = −4 |
| C19-MAAL03-1 | 5n + 2p = 31,000; 3n + 2p = 21,000 | 5,000 | 6,000 |
| C19-MAAM01-1 | (2x + 3)(x − 4) = 2x² − 5x − 12 | A + B + C = −15 | −12 |
| C19-MAAM02-1 | −5t² + 10t + 40 = 0 → (t − 4)(t + 2) | 4 s | 5 |
| C19-MAAM03-1 | 300 · 2⁵ | 9,600 | 12,150 |
| C19-MAPS01-1 | 2,500,000 × 1.2 | 3,000,000 | 270,000 |
| C19-MAPS02-1 | 4 × 80 − (75 + 90 + 70) | 85 | 75 |
| C19-MAPS03-1 | 50 − (20 + 15 − 5) = 20; 20 ÷ 50 | 0.4 | 0.35 |
| C19-MAGT01-1 | 12 × 9 − 4 × 3 | 96 m² | 74 |
| C19-MAGT02-1 | x + x + (x + 30) = 180 | 50°, top 80° | 52 |
| C19-MAGT03-1 | 3² + 4² | r² = 25 | 29 |

I also read every `idea` and `trap` body in en. Each worked number in them holds, for example:

- x = −9 in (x + 1)/2 = (x − 3)/3
- the taxi line y = 4,000x + 6,000
- the perpendicular intercept 3
- 52² − 48² = 400
- 3x² − 5x − 2 = (3x + 1)(x − 2), roots 2 and −1/3 by both methods
- f(−4) = 43
- the class of 40
- the mean of 75 over 40 students
- the median 9.5, and the unsorted 11
- 3/28
- the stone of 1,800 cm³
- the height 8
- cos P = sin Q

None of the en, uz and ru bodies differs in its numbers.

## Uzbek: the U+02BB / U+02BC lint

I linted every uz string in the two files: the 12 titles, the 36 piece bodies, the 36 stems, the 36 `why` texts and every uz option
text. That is 142 lines and 21,342 characters, with 334 U+02BB and 7 U+02BC. The lint ran `uzApostrophes` and `mixedScriptWords`
(`src/engine/content/text.ts`) and three stricter checks:

- any ' ‘ ’ ` ´ at all
- U+02BC after o or g, or U+02BB after any other letter
- a list of common words written without their mark (oquvchi, togri, bol-, kop, ortacha …)

**0 findings.** The seven U+02BC are all tutuq: yaʼni, nomaʼlum (-li, -ni), eʼtibor, taʼsir. A native read of the uz and ru lines
before real families (owner, 12 Oct; §9.1 step 5) is still to do. The lint does not replace it.

## Checks after the write

- `npx tsx scripts/content/validate.ts`, whole content root: 0 errors. C19 has 36 items, all `verified_auto`, and no finding for
  any C19 id.
- `npx tsx scripts/content/reconcile.ts C19 --records`: all 36 are skipped as "already verified_auto (blind:A2s1+A2s2)", and none
  goes back to draft.
- `npx tsx scripts/content/reconcile.ts C19 A2s1 A2s2 --audit`: 0 of 36 decisions differ from the status in the files.
- Vitest, one process at a time:
  - `tests/unit/engine/lesson-asks-its-page.test.ts` and `lesson-teaches.test.ts`: 13 passed.
  - `tests/unit/content/`, 20 files including `committed-content`, `keycheck`, `reconcile` and `validate`: 279 passed.
  - The 8 corpus-reading server and i18n files (`learn-quiz`, `phase-d`, `phase-x-gate`, `phase-x-learner`, `phase-x-off`,
    `p5r-review`, `jg-i18n-items`, `cat/check-seconds`): 86 passed.

## Not done here

- **The native read of uz and ru** (§9.1 step 5) and the **teacher look** that takes `verified_auto` to `reviewed`.
- **The content `README.md` still lists C19 as `draft`** (its register row, its table and "The check so far"). This lane's commit
  holds only the C19 files and this file. The integrator should update the README row: 36 `verified_auto`, `blind:A2s1+A2s2`.
- **The lessons' test and homework families.** They are C1 templates with their own key checks; this pass keys only the 36 piece
  questions and the worked examples.
