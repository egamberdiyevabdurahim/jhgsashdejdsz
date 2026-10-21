# C19: key check 2 of the P7 lessons (13 Oct 2026)

P7 (SPEC-lessons rev. 2, §9.1 step 3, §12.5 items 1 and 3; `.superpowers/p7/PLAN.md`) added lesson records and their piece questions to
C19 in six batch files. Two pairs of blind checkers key them. This file has one part per pair.

## Part 1: SAT Math lessons 2-3 and the DTM lessons (P7 blind checkers 1 and 2)

| File | Commit | Author | Lessons | Piece questions |
|---|---|---|---|---|
| `C19-9.json` (batch 9) | `9cd827e` | `agent:p7-a1` | `C19-MAAL01-2`, `-3` … `C19-MAAM03-2`, `-3` (12) | `C19-al12q1-3` … `am33q1-3` (36) |
| `C19-10.json` (batch 10) | `c042cb0` | `agent:p7-a2` | `C19-MAPS01-2`, `-3` … `C19-MAGT03-2`, `-3` (12) | `C19-ps12q1-3` … `gt33q1-3` (36) |
| `C19-13.json` (batch 13) | `65717c2` | `agent:p7-a6` | `C19-DTMC01-1` … `C19-DTMC10-1` (10) | `C19-dt01q1-4` … `dt10q1-4` (40) |

Before this pass all 34 lessons and all 112 piece questions were `status: draft`, `key_check_1: "author"`, `key_check_2: null`,
`version: 1`. The lessons' new test families (`C1-m2a001` … `m2a012` in `C1-7.json`, `C1-m2b001` … `m2b012` in `C1-8.json`) are
keyed in `C1/RECONCILE-p7.md`. The other C19 batches of P7 (`C19-11`, `C19-12`, `C19-14`: AP Calculus AB and IELTS Reading) belong
to checkers 3 and 4; this part does not decide them.

### Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| P7s1 (checker 1) | `.blind/C19-P7s1.json` (the whole bank, 241 items) | `.blind/C19-P7s1.answers.json` |
| P7s2 (checker 2, who ran the reconcile and wrote this part) | `.blind/C19-P7s2.json` (`npx tsx scripts/content/blind.ts C19 P7s2 --pending`: the 156 items without two checks) | `.blind/C19-P7s2.answers.json` |

A copy holds each item's stem in en, uz and ru and its four options shuffled by the solver's own seed and lettered A-D. It has no key
and no `why`. Each solver answered the 112 items of this part. P7s2 opened neither `.blind/.map-*` nor the C19-9, C19-10 and C19-13
records before it wrote its answers. It computed every value with sympy (a scratch script outside the repo), matched the value to an
option's text in its copy, and wrote the answers before it read P7s1's. Only `reconcile.ts` read the maps. `agentOf` reads P7s1, P7s2,
`p7-a1`, `p7-a2` and `p7-a6` as five agents, so `keyCheckOf("blind:P7s1+P7s2", { author })` is `{ kind: "blind", n: 2 }` for each author.

### The decision

`npx tsx scripts/content/reconcile.ts C19 P7s1 P7s2 --write` gave **241 items: verified 112, quarantine 0, pending 0, blocked 0,
skipped 129.** The 129 skipped are the 85 earlier items (already `verified_auto`) and the 44 AP and IELTS items of checkers 3 and 4,
which have no answer from this pair. **Both solvers chose the key on all 112 items.** No answer was stale. Neither answers file raises
`two_defensible`, `unanswerable` or `no_passage_needed` (no item of this part has a passage).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **112** | `key_check_2: "blind:P7s1+P7s2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | 0 | none |

**How the files were written.** `--write` re-serialises each file it touches. Here that changed only the three key-check lines of each
item and 12 number literals of `prior_b` (`0.0` to `0`, `-1.0` to `-1`, the same values). I put those 12 back by a text edit, so the
diff of an item is exactly `status`, `key_check_2`, the comma after `version` and the new `key_check_2_version`. Nothing else in an
item changed: its key, options, `why` and version are as the author wrote them.

**The lesson records.** `reconcile.ts` reads only `items`. Each of the 34 lessons now has `key_check_2: "blind:P7s1+P7s2"` and
`status: "verified_auto"` (a text edit of its two lines; no `key_check_2_version`, which §11.1's lesson shape does not have), because:

- every one of its piece questions (three, four for DTM) is verified 2/2, and
- its worked example ends on its own blank step ("= ?"), whose value is its q2's key, which both solvers solved blind. I checked each
  blank against my q2 answer after the reconcile: 34 of 34 agree.

Every family a test or homework names is served: the 82 family references of the 34 lessons are all `verified_auto` (the 24 new ones
by this pass, `C1/RECONCILE-p7.md`). The `note` of each of the three files now says the key check is done.

### Each item, with checker 2's working

Both solvers chose the key on all 112 items. The value is checker 2's own blind working (sympy). P7s1's notes reach the same value on
every item.

| Lesson | Piece | Item | Working | Value |
|---|---|---|---|---|
| C19-MAAL01-2 | idea | C19-al12q1 | x/3 − x/5 = 2 → 2x/15 = 2 | 15 |
|  | example | C19-al12q2 | 7x − 12 = kx + 1: no solution when k = 7 (−12 ≠ 1) | 7 |
|  | trap | C19-al12q3 | 2x + 6 = 2x + 5 → 6 = 5, false | 2(x + 3) = 2x + 5 |
| C19-MAAL01-3 | idea | C19-al13q1 | 3 L juice: 3 = 0.2(10 + w) | 5 |
|  | example | C19-al13q2 | 70 + 25n ≤ 750 → n ≤ 27.2, round down | 27 |
|  | trap | C19-al13q3 | 25,000 + 12,000w ≥ 160,000 → w ≥ 11.25, round up | 12 |
| C19-MAAL02-2 | idea | C19-al22q1 | (17 − 5) ÷ (6 − 2) | 3 |
|  | example | C19-al22q2 | slope 3; 4 = 9 + b | −5 |
|  | trap | C19-al22q3 | y = 2x − 3: slope 2 | y = 2x + 5 |
| C19-MAAL02-3 | idea | C19-al23q1 | 1,500 × 12 + 20,000 | 38,000 |
|  | example | C19-al23q2 | 800 − 20t = 340 | 23 |
|  | trap | C19-al23q3 | t = 90 min: 6,000 − 4,500 | 1,500 |
| C19-MAAL03-2 | idea | C19-al32q1 | 6x − 2y = 2 is y = 3x − 1: the same line | Infinitely many |
|  | example | C19-al32q2 | 6 = 3 × 2 → k = 3 × 5; 9 ≠ 3 × 4 | 15 |
|  | trap | C19-al32q3 | 3 × (x − 4y = 3) | 9 |
| C19-MAAL03-3 | idea | C19-al33q1 | c + s = 40, 2c + 4s = 110 → 2s = 30 | 15 |
|  | example | C19-al33q2 | 4(90 − a) + 7a = 510 | 50 |
|  | trap | C19-al33q3 | 0 > −1 true; (2, 2) on the line; the others false | (1, 0) |
| C19-MAAM01-2 | idea | C19-am12q1 | 3(x² − 25) | 5 |
|  | example | C19-am12q2 | 2(x + 10)(x + 3), m > n | 10 |
|  | trap | C19-am12q3 | (x − 7)(x + 4), p < q | −7 |
| C19-MAAM01-3 | idea | C19-am13q1 | 3⁶ · 3³ = 3⁹ | 9 |
|  | example | C19-am13q2 | (⁴√16)³ = 2³ | 8 |
|  | trap | C19-am13q3 | (1/8) × 32 | 4 |
| C19-MAAM02-2 | idea | C19-am22q1 | (2x + 1)(x − 3): 3 and −1/2 | 3 |
|  | example | C19-am22q2 | 144 − 8k = 0 | 18 |
|  | trap | C19-am22q3 | 64 − 4c < 0 → c > 16; only 20 offered | 20 |
| C19-MAAM02-3 | idea | C19-am23q1 | 1/4 + 1/12 = 1/3 a hour | 3 |
|  | example | C19-am23q2 | x² − 5x − 6 = 0: 6 or −1; −1 gives 3 = −3 | 6 |
|  | trap | C19-am23q3 | x² − 2x − 3 = 0: x = 3, −1 → y = 9, 1 | 9 |
| C19-MAAM03-2 | idea | C19-am32q1 | 8,000,000 × 0.75² | 4,500,000 |
|  | example | C19-am32q2 | 0.9⁴ = 0.656, 0.9⁵ = 0.590 | 5 |
|  | trap | C19-am32q3 | 50,000 × 1.2 × 0.8 | 48,000 |
| C19-MAAM03-3 | idea | C19-am33q1 | vertex x = 6: 4 × (−4) | −16 |
|  | example | C19-am33q2 | (x − 5)² + 7 | 7 |
|  | trap | C19-am33q3 | (x + 2)² − 4: vertex (−2, −4) | −6 |
| C19-MAPS01-2 | idea | C19-ps12q1 | 1.5 × 0.8 = 1.2 | 20 |
|  | example | C19-ps12q2 | 300,000 × 1.2 × 0.9 | 324,000 |
|  | trap | C19-ps12q3 | 75,000 ÷ 1.25 | 60,000 |
| C19-MAPS01-3 | idea | C19-ps13q1 | 450 × 8 ÷ 100 | 36 |
|  | example | C19-ps13q2 | 25 × 1,440 × 4 = 144,000 drops = 7,200 mL | 7.2 |
|  | trap | C19-ps13q3 | 960 ÷ 40 × 250 g = 6,000 g | 6 |
| C19-MAPS02-2 | idea | C19-ps22q1 | 5 × 17 − 4 × 15 | 25 |
|  | example | C19-ps22q2 | (135 + 35) ÷ 10 | 17 |
|  | trap | C19-ps22q3 | (24 + 26) ÷ 2 | 25 |
| C19-MAPS02-3 | idea | C19-ps23q1 | both means 50; Q is spread wider | Q has the larger SD |
|  | example | C19-ps23q2 | 4 × 7 + 55 | 83 |
|  | trap | C19-ps23q3 | 2.5 × (10 − 4) | 15 |
| C19-MAPS03-2 | idea | C19-ps32q1 | girls: 10 ÷ (10 + 20) | 1/3 |
|  | example | C19-ps32q2 | bus: 9 ÷ (9 + 21) | 3/10 |
|  | trap | C19-ps32q3 | girls: 4 ÷ 20 | 1/5 |
| C19-MAPS03-3 | idea | C19-ps33q1 | 62 ± 4 | 58% to 66% |
|  | example | C19-ps33q2 | 16/50 × 900 | 288 |
|  | trap | C19-ps33q3 | 48 + 5 | 53 |
| C19-MAGT01-2 | idea | C19-gt12q1 | 12 × 4² | 192 |
|  | example | C19-gt12q2 | k = 3: 40 × 27 | 1,080 |
|  | trap | C19-gt12q3 | 20 × 2.5² | 125 |
| C19-MAGT01-3 | idea | C19-gt13q1 | (4/3) × 6³ | 288 |
|  | example | C19-gt13q2 | (1/3) × 3² × 10 | 30 |
|  | trap | C19-gt13q3 | 6² − 4² | 20 |
| C19-MAGT02-2 | idea | C19-gt22q1 | 9 × 8/6 | 12 |
|  | example | C19-gt22q2 | 3 × 10 ÷ 2 | 15 |
|  | trap | C19-gt22q3 | PQ = 12: 4 × 12 ÷ 3 | 16 |
| C19-MAGT02-3 | idea | C19-gt23q1 | 540 − 425 | 115 |
|  | example | C19-gt23q2 | 1,800 ÷ 12 | 150 |
|  | trap | C19-gt23q3 | exterior 24°: 360 ÷ 24 | 15 |
| C19-MAGT03-2 | idea | C19-gt32q1 | 15 × 4/3 | 20 |
|  | example | C19-gt32q2 | 39 × 5/13 | 15 |
|  | trap | C19-gt32q3 | √(10² − 5²) = 5√3 | 5 |
| C19-MAGT03-3 | idea | C19-gt33q1 | 150/360 × 24 | 10 |
|  | example | C19-gt33q2 | (1/2) × 10 × 7 | 35 |
|  | trap | C19-gt33q3 | (x + 4)² + (y − 5)² = 49 | 7 |
| C19-DTMC01-1 | idea | C19-dt01q1 | 640,000 × 0.35 | 224,000 |
|  | example | C19-dt01q2 | 2,500,000 × 1.08 | 2,700,000 |
|  | trap | C19-dt01q3 | 100% + 12% | 1.12 |
|  | format | C19-dt01q4 | 7/10 | 70% |
| C19-DTMC02-1 | idea | C19-dt02q1 | 9/24 + 4/24 | 13/24 |
|  | example | C19-dt02q2 | 8/18 + 15/18 | 23 |
|  | trap | C19-dt02q3 | 0.25 × 1.6 | 0.4 |
|  | format | C19-dt02q4 | 6 × 1.1 | 6.6 |
| C19-DTMC03-1 | idea | C19-dt03q1 | 8 × 15 ÷ 12 | 10 |
|  | example | C19-dt03q2 | 15,000 × 7 | 105,000 |
|  | trap | C19-dt03q3 | notebooks over soʻm on both sides: x = 45,000 | 6/27000 = 10/x |
|  | format | C19-dt03q4 | 9 × 1.1 | 9.9 |
| C19-DTMC04-1 | idea | C19-dt04q1 | −25 + (−8) | −33 |
|  | example | C19-dt04q2 | 32 − 9 + 16 | 39 |
|  | trap | C19-dt04q3 | 3 × 16 | 48 |
|  | format | C19-dt04q4 | 4³ | 64 |
| C19-DTMC05-1 | idea | C19-dt05q1 | 28 = 2²·7, 42 = 2·3·7 | 14 |
|  | example | C19-dt05q2 | LCM(10, 15) | 30 |
|  | trap | C19-dt05q3 | GCD(36, 48) | 12 |
|  | format | C19-dt05q4 | LCM(40, 60) | 120 |
| C19-DTMC06-1 | idea | C19-dt06q1 | 3x − 1 = x + 9 | 5 |
|  | example | C19-dt06q2 | 3x + 21 = 5x − 5 | 13 |
|  | trap | C19-dt06q3 | 20 > 5x | x < 4 |
|  | format | C19-dt06q4 | 8.8 ÷ 1.1 | 8 |
| C19-DTMC07-1 | idea | C19-dt07q1 | 2x = 16 | 8 |
|  | example | C19-dt07q2 | 17x = 34, x = 2; 6 − y = 3 | 3 |
|  | trap | C19-dt07q3 | 3 × (2x − y = 4) | 6x − 3y = 12 |
|  | format | C19-dt07q4 | m + h = 15, m − h = 3 | 9 |
| C19-DTMC08-1 | idea | C19-dt08q1 | 9 + 16 | 25 |
|  | example | C19-dt08q2 | (4 ± 8) ÷ 6: 2 and −2/3 | 2 |
|  | trap | C19-dt08q3 | t² − 2t − 3 = 0, t > 0 | 3 |
|  | format | C19-dt08q4 | (x − 3)(x − 4) | 3 |
| C19-DTMC09-1 | idea | C19-dt09q1 | 20 × 21 ÷ 2 | 210 |
|  | example | C19-dt09q2 | 5 + 3(n − 1) = 50 | 16 |
|  | trap | C19-dt09q3 | 6 + 14 × 4 | 62 |
|  | format | C19-dt09q4 | 1.1n = 7.7 | 7 |
| C19-DTMC10-1 | idea | C19-dt10q1 | √(64 + 225) | 17 |
|  | example | C19-dt10q2 | √(289 − 64) | 15 |
|  | trap | C19-dt10q3 | √(625 − 49) | 24 |
|  | format | C19-dt10q4 | the format piece: 4 options, one right | 4 options, 1 right |

### Notes raised, none a flag

- `C19-ps33q1` (P7s2): "Which range is plausible …?" The intended range, 62 ± 4 = 58% to 66%, is the only option built as estimate ±
  margin, and the distractors are the usual slips (one side only, half, double). A wider option (54% to 70%) also contains the true
  percent, so a later version could ask "the range of plausible values". Not flagged.
- `C19-am32q1` (P7s1): "loses 25% of its value each year" is read as compound decay (25% of the current value); the linear reading gives
  the distractor 4,000,000. The lesson teaches b = 1 − r, and the SAT reads it the same way. Not flagged.
- `C19-dt10q4` (both): its key is a format fact, "4 options, 1 right". C18 carries it with a URL: `C18/mocks.json` `format`
  (`options_per_question: 4`, source Order No. 105 Annex 1, https://uzbmb.uz/upload/file/pdf/qabul2026/Baholash%20mezoni.pdf, as R3
  §1.2 extracted it on 2026-10-07; C18 did not re-fetch the PDF, and neither did this pass). "One right" is the plain reading of a
  single-key multiple-choice block, not a separate sourced figure. The `format` pieces state nothing else beyond 10 × 1.1 and our own
  practice timer, and never the unverified 180 minutes.

### The bodies

I read every `idea`, `example`, `trap` and DTM `format` body in en after the reconcile. Each worked number holds, for example: x = 36 in
x/4 − 2 = x/6 + 1; 80 + 30 × 17 = 590; the candle's −2 cm an hour and 30 cm start; 3x + 2y = 2.5 against 7; 2x² − 3x − 5 roots 2.5 and
−1; √(x + 7) = x − 5 gives 9 only; 40,000 × 1.05² = 44,100; 0.8⁴ = 0.4096; (x − 1)(x − 7) vertex (4, −9); 600,000 × 1.1 × 0.7 =
462,000; 86,400 drops = 4.32 L; (31 + 40) ÷ 6 ≈ 11.8 and the median 7; 15/23; 1,200 × 0.35 = 420; the path 24π; BC = 12.5;
3² + (3√3)² = 36; (x − 3)² + (y + 2)² = 25; 1,840,000; 0.6 × 0.07 = 0.042; 2.5 × 0.32 = 0.8; GCD × LCM = 864; 2 · 5 + 4 = 14;
x = 2, y = 5 in 3x + 2y = 16; 2 · 9 − 15 − 3 = 0; 10 · (2 + 29) ÷ 2 = 155; 13² + 5² = 194.

The numbers of every stem and option are the same in en, uz and ru (a script compared them, reading the uz/ru decimal comma and spaced
thousands; its one finding, "1,500g" against "1500g", is the same number).

### Uzbek: the U+02BB / U+02BC lint

I linted every uz string of `C19-9.json`, `C19-10.json`, `C19-13.json`, `C1-7.json`, `C1-8.json` and `C10-7.json`: 718 strings, 73,688
characters, 985 U+02BB and 20 U+02BC. The lint ran `uzApostrophes` and `mixedScriptWords` (`src/engine/content/text.ts`) and three
stricter checks: any ' ‘ ’ ` ´ at all; U+02BC after o or g, or U+02BB after any other letter; a list of common words written without
their mark. **0 findings.** The U+02BC are all tutuq: aʼzo, eʼtibor, maʼlum (-ot, -otlar), maʼnoli, nomaʼlum (-li, -ni), qatʼi, yaʼni.
A native read of the uz and ru lines (§9.1 step 5) is still to do; the lint does not replace it.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings** (the P7 baseline), and no finding of any
  severity on any id of this part or on `C1-m2a*` / `C1-m2b*`. The full run with families: exit 0, 0 errors.
- `npx tsx scripts/content/reconcile.ts C19 P7s1 P7s2 --audit`: 0 of 241 decisions differ from the status in the files.
- Vitest, one process at a time:
  - `lesson-c19-9`, `lesson-p7-a2`, `lesson-asks-its-page-dtm`, `lesson-teaches-dtm`, `lesson-teaches`: pass.
  - Two of the authors' files pinned the draft state (`status: 'draft'`, `key_check_2: null` on the lessons and piece questions of
    `lesson-p7-a2.test.ts` and on the DTM piece questions of `lesson-asks-its-page-dtm.test.ts`). They now assert what
    `lesson-c19-9.test.ts` and `lesson-asks-its-page.test.ts` already do: a status from the ladder, and a non-null `key_check_2` on a
    served one.
  - `tests/unit/content/` `committed-content`, `c19-loader`, `lessons-course`, `keycheck`, `reconcile`, `no-content-leak`, `bank`, and
    `engine-server/lessons-schema`: 77 passed.
  - `lesson-asks-its-page.test.ts` passed at 15:54 with this part written, and passes at 16:00 on the commit of this part (with
    `lesson-p7-a2`, `lesson-asks-its-page-dtm`, `lesson-c19-9`: 25 passed). **Seen, not this part's:** at 15:56, while the working tree
    held `C1-10.json` with its AP families set `verified_auto` (uncommitted, the other pair's), it failed on "C2-ca0004 «The chain rule:
    outside, then inside» draws C1-ap3001": a served `C1-ap3001` becomes drawable by that C2 explainer. Whoever keys `C1-10` must
    settle it (checkers 3 and 4, or the integrator).

### Not done here

- The native read of uz and ru (§9.1 step 5) and the teacher look that takes `verified_auto` to `reviewed`.
- The content `README.md` register rows (C19 batches 9, 10 and 13; C1 batches 7 and 8): for the integrator, with this file.

## Part 2: AP Calculus AB and IELTS Reading (P7 blind checkers 3 and 4)

| File | Commit | Author | Lessons | Piece questions |
|---|---|---|---|---|
| `C19-11.json` (batch 11) | `917b75b` | `agent:p7-a3` | `C19-APCA01-1` … `C19-APCA02-3` (6) | `C19-ca11q1-3` … `ca23q1-3` (18) |
| `C19-12.json` (batch 12) | `b8c2e63` | `agent:p7-a4` | `C19-APCA03-1` … `C19-APCA04-3` (6) | `C19-ca31q1-3` … `ca43q1-3` (18) |
| `C19-14.json` (batch 14) | `5f8e634` | `agent:p7-a7` | `C19-IERE03-2`, `C19-IERE04-2` (2) | `C19-ie32q1-3`, `ie42q1-3` (6) |
| `C19-6.json` (batch 6) | `5f8e634` | `agent:p6b-a4` (version 2 by p7-a7) | `C19-IERE02-2` (1) | `C19-ie22q1`, `ie22q2`, version 2 (2) |

The AP lessons cover limits, 0/0 and limits at infinity, continuity and the IVT, the derivative as a limit, the power rule and the
tangent line, the product and quotient rules (APCA01-02), and the chain rule, implicit differentiation, inverse functions and second
derivatives, motion, related rates, linear approximation and L'Hôpital (APCA03-04). `C19-ie22q1` and `ie22q2` were quarantined
`no_passage_needed` in phase 1b (`RECONCILE-1b.md`). In version 2 each wrong option's reason is a claim that only the text can refute.

Before this pass all 44 piece questions and the 14 new lessons were `status: draft`, `key_check_1: "author"`, `key_check_2: null`.
`C19-IERE02-2` was `draft` too: it stayed so in phase 1b because of those two quarantines. The lessons' AP families
(`C1-ap1001` … `ap1007`, `C1-ap3001` … `ap3010`) are keyed in `C1/RECONCILE-p7.md` part 2, and the IELTS lessons' reserves
(`C7-ir3201-3220`, `C7-ir4201-4220`, `C7-ir2214` version 2) in `C7/RECONCILE-p7.md`.

### Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| P7s3 (checker 3) | `.blind/C19-P7s3.json` | `.blind/C19-P7s3.answers.json` |
| P7s4 (checker 4, who ran this reconcile and wrote this part) | `.blind/C19-P7s4.json` | `.blind/C19-P7s4.answers.json` |

Each copy was made by `node scripts/content/blind.mjs C19 <solver>`: the bank's 241 items, each item's four options shuffled by the
solver's own seed and lettered A-D, no key, no `why`. A piece question carries its short text inside the stem, as in phase 1b. Each
solver answered the 44 items of this part. P7s4 solved every maths item by hand and then with sympy (`.superpowers/p7/k4/ap_solve.py`,
36 results, each equal to the option chosen), and checked that each uz and ru stem holds the same numbers as the en one (0
differences). P7s4 opened neither `.blind/.map-*` nor the C19 records before it wrote its answers, and wrote them before it read
P7s3's. Only `reconcile.ts` read the maps. `agentOf` reads P7s3, P7s4, `p7-a3`, `p7-a4` and `p6b-a4` as five agents, so
`keyCheckOf("blind:P7s3+P7s4", { author })` is `{ kind: "blind", n: 2 }` for every author here.

### The decision

`npx tsx scripts/content/reconcile.ts C19 P7s3 P7s4 --write` gave **241 items: verified 44, quarantine 0, pending 0, blocked 0,
skipped 197.** The 197 skipped are part 1's 112 (already `verified_auto` by P7s1 and P7s2) and the 85 earlier items. No answer was
stale. **The two solvers chose the author's key on all 44 items, and neither raised `two_defensible`, `unanswerable` or
`no_passage_needed`.**

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **44** | `key_check_2: "blind:P7s3+P7s4"`, `key_check_2_version` = the item's version (1; 2 for `C19-ie22q1`, `ie22q2`) |

**The lesson records.** `reconcile.ts` reads only `items`. This part follows the precedent of part 1 and of `RECONCILE-1b.md`: a
lesson gets `key_check_2: "blind:P7s3+P7s4"` and `status: "verified_auto"` (a text edit of its two lines; no `key_check_2_version`,
which §11.1's lesson shape does not have) when every one of its piece questions is verified 2/2, its worked example ends on its own
blank step whose value is its q2's key (checked after the reconcile against P7s4's q2 answer: 15 of 15 agree), and every family its
`test` and `homework` name is served.

| Lessons | After this pass | Why |
|---|---|---|
| `C19-APCA01-1` … `APCA02-3` (6), `C19-APCA03-2` … `APCA04-3` (5) | `verified_auto` | pieces 2/2; blanks 12, 7, 8, 14, −8, 10, −2, 1/7, 48, 40, 8.125 = each q2's key; families served |
| `C19-APCA03-1` "The chain rule" | **stays `draft`** | its pieces are verified, but its example family `C1-ap3001` (the first in its `test`) is held in draft: `C1/RECONCILE-p7.md` part 2 |
| `C19-IERE03-2`, `C19-IERE04-2` | `verified_auto` | pieces 2/2; blanks "Paragraph B" and "wire screen" = q2's key; no families (fixed-text lessons on `reserve`) |
| `C19-IERE02-2` "The Not Given trap" | `verified_auto` | `ie22q1` and `ie22q2` (version 2) verified here, `ie22q3` by B3s3 and B3s4 in phase 1b; the example's café statement is `ie22q2`'s, blank NOT GIVEN = its key |

The reserves: `C19-IERE03-2` 20 of 20, `C19-IERE04-2` 18 of 20 (two no-passage quarantines), `C19-IERE02-2` 20 of 20
(`C7/RECONCILE-p7.md`). The `note` of each of the four files now says what this pass verified, in place of its "draft until the key
check" sentence. Serving the AP lessons still needs the course catalogue entry (`.superpowers/p7/PLAN.md` §10 item 1).

### What P7s4 noted but did not flag (for the authors; no status changed)

- **All three `C19-IERE03-2` piece questions have the key "Paragraph B"** (`ie32q1-3`). Each is right on its own text, but a student
  who notices the pattern stops reading. A version 2 could move one answer to another paragraph.
- **`C19-ca42q3`** asks how fast the top of the ladder slides down, and the key is 4 (m/s). The derivative of its height is −4. The
  wording asks for a speed, so 4 is right, and no option is −4.

### How the files were written

`reconcile.ts --write` wrote the 44 decisions into `C19-11.json`, `C19-12.json`, `C19-14.json` and `C19-6.json`, each as a whole file
with `JSON.stringify`. That reflowed `C19-12.json` (a4 writes each piece question's fields on a few long lines and the lessons'
`test`, `homework` and `requires` on one line), and wrote two `prior_b` values of `1.0` in `C19-11.json` as `1`.
`.superpowers/p7/k4/repatch.mjs` and `renum.mjs` put both files back in their authors' layout. Each checks that its result parses
deep-equal to what `reconcile.ts` wrote. `.superpowers/p7/k4/lessons.mjs` then set the 14 lesson records and the four notes, and
checks that nothing else in a file changed. A parse of the four files before (HEAD) and after shows that only these fields changed:
`key_check_2`, `status` and `key_check_2_version` on the 44 items, `key_check_2` and `status` on the 14 lessons, and the `note`.
Keys, options, `why`, pieces and versions are as the authors wrote them. The decision log is `.blind/C19-reconcile.json`, with a copy in
`.superpowers/p7/k4/C19-reconcile-log.json`. Both stay local, because `.blind/` and `.superpowers/` are gitignored.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all` (with the C1, C4, C7 and C19 writes of this part): exit 0, **0 errors,
  858 warnings**: the P7 baseline. No finding on any `C19-ca`, `C19-ie`, `C19-APCA`, `C19-IERE`, `C1-ap`, `C4-b2` or `C7-ir` id.
- `reconcile.ts C19 P7s3 P7s4 --audit`: 0 of 241 decisions differ from the status in the files.
- The uz lint (`.superpowers/p7/k4/uz_lint.mjs`: U+02BB only after o/g, U+02BC only after a letter and never after o/g, no ' ‘ ’ or
  backtick inside a word, no Cyrillic in uz, no word that mixes Latin and Cyrillic in uz or ru) covered every uz and ru string of
  `C19-11.json`, `C19-12.json`, `C19-14.json`, `C19-6.json`, `C1-9.json`, `C1-10.json`, `C10-5.json` and `C10-6.json`, with the C4 and
  C7 files of this pass: **1,332 strings, 0 findings** (U+02BB 799 times, U+02BC 88 times).
- Vitest, one process, with every write of this part in place: `lesson-c19-apca34`, `lesson-asks-its-page`, `lesson-teaches`,
  `p6b-lesson-floor`, `p5s-english`, `c19-loader`, `lessons-course`, `bank`, `keycheck`, `reconcile`, `engine-server/lessons-schema`:
  **104 of 104 pass**. `committed-content` passes too. `english-units.test.ts` fails 5 tests, and the same 5 fail on HEAD `c042cb0`
  without this pass: they come from the B2 units of `c5161c8` (`C4/RECONCILE-p7.md`).

### Not done here

- The native read of uz and ru (§9.1 step 5) and the teacher look that takes `verified_auto` to `reviewed`.
- `C1-ap3001`, and with it `C19-APCA03-1`: the integrator's call (`C1/RECONCILE-p7.md` part 2).
- The content `README.md` register rows (C19 batches 11, 12 and 14; C1 batches 9 and 10; C4 batches 4 and 5; C7 batch 9).

### Each item

`key` means the solver chose the author's key (`options[0]`). The evidence is P7s4's own blind working. A paragraph letter in it is
the text's own, not a position in a copy. The level (rung) and subskill are the author's.

| Item | File | Lesson | Subskill | Level | Version | Author | P7s3 | P7s4 | Decision | P7s4's evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| C19-ca11q1 | C19-11.json | C19-APCA01-1 | limits | calc | v1 | p7-a3 | key | key | verified_auto | 7.8, 7.98 from the left and 8.02, 8.2 from the right both close in on 8 |
| C19-ca11q2 | C19-11.json | C19-APCA01-1 | limits | calc | v1 | p7-a3 | key | key | verified_auto | a polynomial: substitute, 9 + 9 - 6 = 12 (sympy) |
| C19-ca11q3 | C19-11.json | C19-APCA01-1 | limits | calc | v1 | p7-a3 | key | key | verified_auto | from the right g = 3x + 4, so 3*2 + 4 = 10; 7 is the left-hand limit |
| C19-ca12q1 | C19-11.json | C19-APCA01-2 | limits | calc | v1 | p7-a3 | key | key | verified_auto | multiply by the conjugate: 1/(sqrt(x+16) + 4) -> 1/8 (sympy) |
| C19-ca12q2 | C19-11.json | C19-APCA01-2 | limits | calc | v1 | p7-a3 | key | key | verified_auto | (x + 5)(x - 2)/(x - 2) = x + 5 -> 7 (sympy) |
| C19-ca12q3 | C19-11.json | C19-APCA01-2 | limits | calc | v1 | p7-a3 | key | key | verified_auto | equal degrees: leading coefficients 8/2 = 4 (sympy) |
| C19-ca13q1 | C19-11.json | C19-APCA01-3 | continuity | calc | v1 | p7-a3 | key | key | verified_auto | g = x + 4 for x != 4, limit 8, so g(4) = 8 |
| C19-ca13q2 | C19-11.json | C19-APCA01-3 | continuity | calc | v1 | p7-a3 | key | key | verified_auto | 9 + 5 = 14 = 6 + k, k = 8 (sympy) |
| C19-ca13q3 | C19-11.json | C19-APCA01-3 | continuity | calc | v1 | p7-a3 | key | key | verified_auto | IVT: every k between -4 and 3; of 7, -5, 4, 2 only 2 |
| C19-ca21q1 | C19-11.json | C19-APCA02-1 | average_rate | calc | v1 | p7-a3 | key | key | verified_auto | (29 - 5)/(5 - 1) = 6 |
| C19-ca21q2 | C19-11.json | C19-APCA02-1 | derivative_definition | calc | v1 | p7-a3 | key | key | verified_auto | f'(x) = 6x + 2, the limit of the difference quotient is 14 (sympy) |
| C19-ca21q3 | C19-11.json | C19-APCA02-1 | derivative_definition | calc | v1 | p7-a3 | key | key | verified_auto | v = 2t + 2 = 8 at t = 3 |
| C19-ca22q1 | C19-11.json | C19-APCA02-2 | power_rule | calc | v1 | p7-a3 | key | key | verified_auto | 8x^3 - 6x at 2: 64 - 12 = 52 |
| C19-ca22q2 | C19-11.json | C19-APCA02-2 | tangent_line | calc | v1 | p7-a3 | key | key | verified_auto | f(2) = 20, f'(2) = 14, y = 14(x - 2) + 20 = 14x - 8, k = -8 |
| C19-ca22q3 | C19-11.json | C19-APCA02-2 | power_rule | calc | v1 | p7-a3 | key | key | verified_auto | 6x^-2 -> -12x^-3 = -12 at 1 |
| C19-ca23q1 | C19-11.json | C19-APCA02-3 | product_rule | calc | v1 | p7-a3 | key | key | verified_auto | product rule: e^x + (x + 3)e^x = 1 + 3 = 4 at 0 |
| C19-ca23q2 | C19-11.json | C19-APCA02-3 | quotient_rule | calc | v1 | p7-a3 | key | key | verified_auto | quotient rule: 10/(x + 3)^2 = 10 at -2 (sympy) |
| C19-ca23q3 | C19-11.json | C19-APCA02-3 | trig_exp_derivatives | calc | v1 | p7-a3 | key | key | verified_auto | 5cos x - 2sin x + 3 at pi/2: 0 - 2 + 3 = 1 |
| C19-ca31q1 | C19-12.json | C19-APCA03-1 | chain_rule | calc | v1 | p7-a4 | key | key | verified_auto | chain rule: 4(x^3 + 2)^3 * 3x^2 = 4*27*3 = 324 |
| C19-ca31q2 | C19-12.json | C19-APCA03-1 | chain_rule | calc | v1 | p7-a4 | key | key | verified_auto | 14e^(2x) + 15cos(5x) at 0 = 29 |
| C19-ca31q3 | C19-12.json | C19-APCA03-1 | chain_rule | calc | v1 | p7-a4 | key | key | verified_auto | chain rule: e^(x^2) * 2x |
| C19-ca32q1 | C19-12.json | C19-APCA03-2 | implicit_differentiation | calc | v1 | p7-a4 | key | key | verified_auto | dy/dx = -x/y = -6/8 = -3/4 |
| C19-ca32q2 | C19-12.json | C19-APCA03-2 | implicit_differentiation | calc | v1 | p7-a4 | key | key | verified_auto | 6x + 2y y' = 0, y' = -3x/y = -6/3 = -2 |
| C19-ca32q3 | C19-12.json | C19-APCA03-2 | implicit_differentiation | calc | v1 | p7-a4 | key | key | verified_auto | 2xy + x^2 y' = 0, y' = -2y/x = -5 |
| C19-ca33q1 | C19-12.json | C19-APCA03-3 | inverse_derivative | calc | v1 | p7-a4 | key | key | verified_auto | g'(7) = 1/f'(2) = 1/4 |
| C19-ca33q2 | C19-12.json | C19-APCA03-3 | inverse_derivative | calc | v1 | p7-a4 | key | key | verified_auto | f'(x) = 3x^2 + 4 = 7 at 1, g'(15) = 1/7 |
| C19-ca33q3 | C19-12.json | C19-APCA03-3 | second_derivative | calc | v1 | p7-a4 | key | key | verified_auto | f'' = 24x^2 - 10 = 14 at 1 |
| C19-ca41q1 | C19-12.json | C19-APCA04-1 | motion | calc | v1 | p7-a4 | key | key | verified_auto | a derivative is an instantaneous rate: at m = 4 the temperature falls 2 degC per minute |
| C19-ca41q2 | C19-12.json | C19-APCA04-1 | motion | calc | v1 | p7-a4 | key | key | verified_auto | v = 6t^2 - 6t + 12 = 54 - 18 + 12 = 48 |
| C19-ca41q3 | C19-12.json | C19-APCA04-1 | average_rate | calc | v1 | p7-a4 | key | key | verified_auto | (s(3) - s(1))/2 = (27 - 7)/2 = 10 |
| C19-ca42q1 | C19-12.json | C19-APCA04-2 | related_rates | calc | v1 | p7-a4 | key | key | verified_auto | dV/dt = 3s^2 ds/dt = 3*25*2 = 150 |
| C19-ca42q2 | C19-12.json | C19-APCA04-2 | related_rates | calc | v1 | p7-a4 | key | key | verified_auto | dA/dt = 2 pi r dr/dt = 2*4*5 pi = 40 pi |
| C19-ca42q3 | C19-12.json | C19-APCA04-2 | related_rates | calc | v1 | p7-a4 | key | key | verified_auto | top at 9 m; 12*3 + 9y' = 0, y' = -4: slides down at 4 m/s |
| C19-ca43q1 | C19-12.json | C19-APCA04-3 | linear_approximation | calc | v1 | p7-a4 | key | key | verified_auto | L(2.1) = 5 + 3*0.1 = 5.3 |
| C19-ca43q2 | C19-12.json | C19-APCA04-3 | linear_approximation | calc | v1 | p7-a4 | key | key | verified_auto | 8 + (1/16)*2 = 8.125 |
| C19-ca43q3 | C19-12.json | C19-APCA04-3 | lhopital | calc | v1 | p7-a4 | key | key | verified_auto | ~ 6x/(2x) = 3 (sympy) |
| C19-ie32q1 | C19-14.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: closed six months because the roof leaked and the heating used too much gas |
| C19-ie32q2 | C19-14.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: the 2019 late frost, half the apples lost |
| C19-ie32q3 | C19-14.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: fragile maps shown three months then rested a year |
| C19-ie42q1 | C19-14.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | 'pressed between heavy cloths'; heavy metal plates is three words and not in the text |
| C19-ie42q2 | C19-14.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | 'spread the pulp thinly on a wire screen' |
| C19-ie42q3 | C19-14.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | before the first firing the new bowls are dried on wooden racks; the others come later |
| C19-ie22q1 | C19-6.json | C19-IERE02-2 | not_given_judgement | B1 | v2 | p6b-a4 | key | key | verified_auto | v2: the text names the shop and what it sells, never its hours; each other reason claims a time the text does not state |
| C19-ie22q2 | C19-6.json | C19-IERE02-2 | not_given_judgement | B1 | v2 | p6b-a4 | key | key | verified_auto | v2: the café is only mentioned; the text says nothing about when it is open |

## The P7 integration (13 Oct 2026): `C19-APCA03-1`

With `C1-ap3001` verified (`C1/RECONCILE-p7.md`, "The P7 integration"), `C19-APCA03-1` "The chain rule" meets part 2's rule: its three
piece questions are verified 2/2 (`C19-ca31q1` … `q3`, above), its worked example ends on its blank step, "f′(x) = 14e^(2x) + 15 cos(5x)
→ f′(0) = 14 + 15 = ?", whose value 29 is `C19-ca31q2`'s key, and both families its test and homework name (`C1-ap3001`, `C1-clp009`)
are served. Its record now reads `key_check_2: "blind:P7s3+P7s4"`, `status: "verified_auto"` (a text edit of its two lines). All 12 AP
Calculus AB lessons are served. `C19-IERE04-2` stays held: 18 of its 20 reserve items are verified (`C7/RECONCILE-p7.md`).

## Part 3: version 2 of `C19-RWEI02-1` and `C19-RWEI03-1`, the bullet rule (P7 follow-up content lane, 13 Oct 2026)

The P7 integration left one C19 item open: the worked examples of these two SAT R&W lessons (`C19-5.json`, author `agent:p6b-a3`)
held their notes inline, "Notes: • a. • b. • c. Goal: …", against the bullet rule (one bullet per line, `.superpowers/p7/PLAN.md`).
This lane (branch `p7f-content` from `p7-lessons` @ `0c35e99`, one session) made version 2 of both.

### What changed

- In each lesson's `example` piece, in en, uz and ru, both notes lists (the worked one and the "Now you" one) are now "Notes:", one
  line per note, then "Goal: …" on its own line. A field-by-field diff of `C19-5.json` against `p7-lessons` shows exactly six changed
  strings, each different only in whitespace (a space became a newline), and `version` 1 → 2 on the two records. No key, no piece
  question, no reserve item and no other lesson changed. The phone and laptop pages draw a piece body with `white-space: pre-line`
  (`.jgl-body` in `public/runtime/jg-lessons.js`, `.jg-body` in `jg-lessons-desktop.js`), so each note is now its own line.
- A scan of every string of every C19 batch, lessons and items, finds no line with two bullets now (it found exactly these six before).
  `tests/unit/engine/lesson-c19-5-notes.test.ts` keeps it so.

### Why the two lessons stay `verified_auto` with `blind:B3s1+B3s2`

A lesson record's check is its piece questions' (part 1, "The lesson records"): every piece question verified 2/2, and the worked
example ends on its blank step, whose answer is q2's key. Neither moved. The six piece questions (`C19-ei21q1` … `q3`, `C19-ei31q1` …
`q3`) are untouched, `verified_auto` with `key_check_2: "blind:B3s1+B3s2"` for version 1 (`RECONCILE-1b.md`), and the loader serves
both lessons (`unservedOf` is empty). The record's `key_check_2` is left as it was; nothing new is claimed on it.

### The fresh blind solve, and what it is worth

`node scripts/content/blind.mjs C19 P7Fs1` and `… C19 P7Fs2` made two copies (241 items each, each shuffled by its own seed). This
session solved the six piece questions in P7Fs1's copy and wrote `.blind/C19-P7Fs1.answers.json`, then solved them again in P7Fs2's
copy, from its own letters, and wrote `.blind/C19-P7Fs2.answers.json`, both before any reconcile. It never opened `.blind/.map-*`.
`reconcile.ts C19 P7Fs1 P7Fs2 --audit` reads both as the key on all six (P7Fs1 `key`, P7Fs2 `key`); the normal run skips all 241
(the six are already verified by two other agents), so nothing was written. Two limits, stated plainly:

- P7Fs1 and P7Fs2 are two passes of one session, so together they are one check (D26 (1)). `keycheck.ts` now says so: `SESSIONS`
  maps `P7Fs<n>` and `agent:p7f-*` to the one agent `p7f`.
- Before the copies existed, this session had printed the records of `C19-ei21q1` … `q3` (options with the key first) while reading the
  lessons. Its answers to those three are not blind. `C19-ei31q1` … `q3` were not seen before the copies.

The example's blank against q2, checked on the solved options: RWEI02-1's "Now you" notes are `C19-ei21q2`'s, and the steps (both
numbers and a comparing word) lead to "During the reading week, children read 1,200 books, far more than the 700 read by adults.", the
option both passes chose. RWEI03-1's are `C19-ei31q2`'s, and "say what it is and what it is for" leads to "The school's new silent
room is a phone-free space with soft chairs where students rest for ten minutes between exams.", the option both passes chose.

### Checks

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the P7 baseline); no finding on any
  `C19-5` id.
- The uz lint (`.superpowers/p7/k4/uz_lint.mjs`) over `C19-5.json`: 0 findings.
- Payloads: `C19-RWEI02-1` 7,580 bytes, `C19-RWEI03-1` 7,873 bytes (limit 25 KB).
- `npx tsx scripts/content/reconcile.ts C19 P7Fs1 P7Fs2 --audit`: 0 of 241 decisions differ from the files.
