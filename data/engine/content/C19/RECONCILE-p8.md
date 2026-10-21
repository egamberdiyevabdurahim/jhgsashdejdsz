# C19: key check 2 of the P8 lessons (14 Oct 2026)

P8 (SPEC-lessons rev. 2, §9.1 step 3, §12.5 item 1; `.superpowers/p8/PLAN.md`) added lesson records and their piece questions to C19 in
four batch files. Two pairs of blind checkers key them. This file has one part per pair.

## Part 1: SAT Reading and Writing lessons 2-3 (P8 blind checkers 1 and 2)

| File | Commit | Author | Lessons | Piece questions | Reserve (in C6) |
|---|---|---|---|---|---|
| `C19-15.json` (batch 15) | `1c8f6014` | `agent:p8-a1` | `C19-RWCS01-2`, `-3`, `C19-RWCS02-2`, `-3` | `C19-cs12q1-3` … `cs23q1-3` (12) | `C6-10.json` (80) |
| `C19-16.json` (batch 16) | `b053f25c` | `agent:p8-a2` | `C19-RWII01-2`, `-3`, `C19-RWII02-2`, `-3` | `C19-ii12q1-3` … `ii23q1-3` (12) | `C6-11.json` (80) |
| `C19-17.json` (batch 17) | `2a8b43a6` | `agent:p8-a3` | `C19-RWSE01-2`, `-3`, `C19-RWSE02-2`, `-3` | `C19-se12q1-3` … `se23q1-3` (12) | `C6-12.json` (80) |

Before this pass all 12 lessons, all 36 piece questions and all 240 reserve items were `status: draft`, `key_check_1: "author"`,
`key_check_2: null`, `version: 1`. The reserves are decided in `C6/RECONCILE-p8.md`. `C19-18.json` (AP Calculus AB units 5-8) belongs to
checkers 3 and 4; this part does not decide it.

### Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| P8s1 (checker 1) | `.blind/C19-P8s1.json` (the whole bank, 313 items) | `.blind/C19-P8s1.answers.json` |
| P8s2 (checker 2, who ran the reconcile and wrote this part) | `.blind/C19-P8s2.json` (`npx tsx scripts/content/blind.ts C19 P8s2 --pending`: the 72 items without two checks) | `.blind/C19-P8s2.answers.json` |

A copy holds each item's stem and its four options shuffled by the solver's own seed and lettered A-D. It has no key and no `why`.
Each solver answered the 36 items of this part (P8s2's copy also held the 36 AP items of checkers 3 and 4, which it left alone). P8s2
opened neither `.blind/.map-*` nor the C19-15, C19-16, C19-17, C6-10, C6-11 and C6-12 records, nor the authors' ledgers and sources
(`.superpowers/p8/author-*.md`, `a1`-`a3`), before it wrote its answers. It read each item in its copy, chose a letter, and wrote its
answers file before it read P8s1's. Only `reconcile.ts` read the maps. `agentOf` reads P8s1, P8s2, `p8-a1`, `p8-a2` and `p8-a3` as five
agents, so `keyCheckOf("blind:P8s1+P8s2", { author })` is `{ kind: "blind", n: 2 }` for each author.

### The decision

`npx tsx scripts/content/reconcile.ts C19 P8s1 P8s2 --write` gave **313 items: verified 36, quarantine 0, pending 0, blocked 0,
skipped 277.** The 277 skipped are the 241 earlier items (already `verified_auto`) and the 36 AP items of checkers 3 and 4 (`C19-ca51q1`
… `ca83q3`), which have no answer from this pair. **Both solvers chose the key on all 36 items.** No answer was stale. Neither answers
file raises `two_defensible`, `unanswerable` or `no_passage_needed`; no item of this part has a `passage_id` (each text is in its stem).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **36** | `key_check_2: "blind:P8s1+P8s2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | 0 | none |

**How the files were written.** `--write` re-serialises each file it touches. Here the diff of each of the 36 items is exactly `status`,
`key_check_2`, the comma after `version` and the new `key_check_2_version`; no number literal changed. Nothing else in an item changed:
its key, options, `why` and version are as the author wrote them. The decisions are kept in `.superpowers/p8/kc2/C19-decisions.json`
(`.blind/C19-reconcile.json` is rewritten by every reconcile of the bank, and checkers 3 and 4 reconcile C19 too).

**The lesson records.** `reconcile.ts` reads only `items`. Each of the 12 lessons now has `key_check_2: "blind:P8s1+P8s2"` and
`status: "verified_auto"` (a text edit of its two lines; no `key_check_2_version`, which §11.1's lesson shape does not have), because
(`.superpowers/p8/kc2/lessons-kc2.mjs`, 0 problems):

- each of its three piece questions is verified 2/2, with `page` naming the lesson;
- its example piece names q2 as its `check`, ends on its own blank step, and its "Now you" part is q2's problem. For ten lessons the
  "Now you" text holds q2's text word for word in en, uz and ru (quotation marks and the apostrophe's code point aside). `C19-RWII02-2` and `C19-RWII02-3` restate it (the claim "The new sign at the
  school gate made more students wear helmets …"; the same fair table, 18/30, 22/25, 35/15, and the same sentence); I read both against
  q2: the same problem, and the blank is q2's key;
- each of its 20 reserve items (`reserve`) is in C6-10, C6-11 or C6-12, verified 2/2 by this pass, and in no other lesson's reserve
  (240 ids, 240 owners).

The `note` of each of the three files now says the key check is done (a text edit, checked by parsing: nothing else changed;
`.superpowers/p8/kc2/lessons-write.mjs`).

### Each piece question, with checker 2's reading

Both solvers chose the key on all 36 items. The reading is checker 2's own blind working.

| Lesson | Piece | Item | Reading | Key |
|---|---|---|---|---|
| C19-RWCS01-2 | idea | C19-cs12q1 | "however" turns from "difficult"; he finished with time to spare | straightforward |
|  | example | C19-cs12q2 | "however" turns from "bright, spacious"; two beds fill the room | cramped |
|  | trap | C19-cs12q3 | "hardly ___": weeks of practice, smiling, no mistake | nervous |
| C19-RWCS01-3 | idea | C19-cs13q1 | a short delay that "would make no real difference": mild | slightly disappointed |
|  | example | C19-cs13q2 | "complete calm and certainty", praised: positive, not arrogant | assured |
|  | trap | C19-cs13q3 | six pots, one month, "more … needed": not prove or guarantee | suggest |
| C19-RWCS02-2 | idea | C19-cs22q1 | one late morning backs "often late in winter" | an example that supports the first sentence |
|  | example | C19-cs22q2 | the rack is what emptied the hall | the action that solved the first sentence's problem |
|  | trap | C19-cs22q3 | temperature and rain, every morning | what the grandfather records in the notebook |
| C19-RWCS02-3 | idea | C19-cs23q1 | "believed … useless", "however, found a use" | a common opinion, then a student shows the room's value |
|  | example | C19-cs23q2 | "a waste of space"; counts "tell a different story" | to challenge a view with new counts |
|  | trap | C19-cs23q3 | held for reading, "almost no difference" for maths | a claim that holds only for some tasks |
| C19-RWII01-2 | idea | C19-ii12q1 | "Odil's job is to keep the flowers fresh" | he looks after the flowers |
|  | example | C19-ii12q2 | "so that she can order more before it runs out" | to know what to order |
|  | trap | C19-ii12q3 | "carried the younger children's bags on its rack" | he carried the bags on his bicycle |
| C19-RWII01-3 | idea | C19-ii13q1 | "however": the wall's shade, then twice as tall in the sun | the shade, not the soil |
|  | example | C19-ii13q2 | "Yet": fixes scenery, learns every part | Davron cares more than people think |
|  | trap | C19-ii13q3 | three refusals, then a second piece of walnut and silence | he now quietly lets her keep trying |
| C19-RWII02-2 | idea | C19-ii22q1 | same loaf, 4 days against 2 | the cloth-bag finding |
|  | example | C19-ii22q2 | as many helmets before the sign as after: no effect | the before-and-after finding |
|  | trap | C19-ii22q3 | shaking hands (nervous) and every poster read (curious) | the quotation with both |
| C19-RWII02-3 | idea | C19-ii23q1 | Temur 28 then 26: the other direction | Temur fewer in week 2 (26 < 28) |
|  | example | C19-ii23q2 | plant stall 30, 25, 15 | falling 30 → 25 → 15 |
|  | trap | C19-ii23q3 | 30/6 = 5, 40/10 = 4, 48/16 = 3 | 5 each, 4 hiking, 3 ecology |
| C19-RWSE01-2 | idea | C19-se12q1 | a dash opened the extra part, so a dash closes it | August— |
|  | example | C19-se12q2 | the comma after "room" opened it, so a comma closes it | tables, |
|  | trap | C19-se12q3 | a title before the name: no commas, none between subject and verb | potter Malika Tosheva |
| C19-RWSE01-3 | idea | C19-se13q1 | two sentences; "as a result" begins the second | school; as a result, |
|  | example | C19-se13q2 | two sentences; "instead" begins the second | home; instead, |
|  | trap | C19-se13q3 | "however" inside the second sentence, after its subject | concert; Jasur and his sister, |
| C19-RWSE02-2 | idea | C19-se22q1 | the subject "students" needs a finite verb, past | sat |
|  | example | C19-se22q2 | "for twenty years" to now, plural subject | have lived |
|  | trap | C19-se22q3 | the patterns received the drawing: passive, past, plural | were drawn |
| C19-RWSE02-3 | idea | C19-se23q1 | "they are looking forward" | they're |
|  | example | C19-se23q2 | three cousins own the paintings | cousins' |
|  | trap | C19-se23q3 | "the collection" (singular) owns the room | its |

### Notes raised, none a flag

- `C19-se12q3` (P8s2): "Last spring, potter Malika Tosheva opened …" uses "potter" as a title before the name, with no article; the
  options with commas either split the subject from its verb or set off a name that the sentence needs. One reading only.
- `C19-ii22q3` (P8s2): one distractor shows nervousness only, one curiosity only; the key is the only quotation with both, as the claim
  asks.

### Uzbek: the U+02BB / U+02BC lint

I linted every uz string of `C19-15.json`, `C19-16.json`, `C19-17.json`, `C6-10.json`, `C6-11.json` and `C6-12.json`: 600 strings,
85,910 characters, 1,280 U+02BB and 242 U+02BC (`.superpowers/p8/kc2/uz-lint.ts`: `uzApostrophes` and `mixedScriptWords` from
`src/engine/content/text.ts`, then any ' ‘ ’ ` ´ at all, U+02BB after a letter other than o/g, U+02BC after o/g, Cyrillic in uz, and
a list of common words written without their mark; also `.superpowers/p7/k4/uz_lint.mjs`, 1,200 uz and ru strings). **No finding in
Uzbek.** What the stricter checks raised is English quoted inside an Uzbek explanation, where the authors wrote the English apostrophe
as U+02BC (their rule: a uz string holds U+02BB/U+02BC only): «whoʼs», «teacherʼs», the suffix «ʼs», and the English word «organized»
(`C19-RWSE02-3` idea body; `C6-se2304`, `se2305`, `se2308`, `se2315`, `se2319` why). Read as English, each is right. One effect for the
native read: in `C19-RWSE01-2` the uz example quotes q2 as «The libraryʼs reading room …» (U+02BC), while q2's stem, in English, has
"library's" (U+0027); the words are the same. A native read of the uz and ru lines (§9.1 step 5) is still to do; the lint does not
replace it.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings, 270 notes** (the P8 baseline,
  `.superpowers/p8/validate-base.log`), and no finding of any severity on any id of this part, its reserves or its files.
- `npx tsx scripts/content/reconcile.ts C19 P8s1 P8s2 --audit`: 0 of 313 decisions differ from the status in the files.
- Vitest, one process at a time, with `ANTHROPIC_API_KEY` empty:
  - The two authors' files in `tests/unit/content` pinned the draft state (`status: 'draft'`, `key_check_2: null` on the lessons and
    items, and "the real loader holds all four back as drafts"). They now assert what `lesson-c19-9.test.ts` and
    `lesson-asks-its-page.test.ts` already do: a status from the ladder, and on a served record a `key_check_2` of two blind checks of
    agents other than its author; the loader holds a draft lesson back and serves a keyed one with nothing unserved.
  - `p8-a1-rw-craft-lessons`, `p8-a2-rw-ideas-lessons`, `c19-loader`, `committed-content`, `keycheck`, `reconcile`, `no-content-leak`,
    `bank`, `lessons-course`: **95 passed** (9 files). `lesson-asks-its-page`, `lesson-teaches`: pass.
  - `tsc --noEmit`: the two edited test files are clean (the one error is in `p8-a5-english-homework.test.ts`, as before this pass).
  - **Fails, the integrator's (PLAN §8 item 1):** `tests/unit/engine-server/p6b-fixed-text.test.ts`, 4 of its tests. Three pin the
    served R&W lessons at lesson 1 only (12 lessons; 24 are served now; and the English turn's list, 30 against 42). The fourth is real:
    **`C6/C6-10.json`, `C6-11.json` and `C6-12.json` are not in `RESERVE_FILES`** (`src/server/content/bank.ts` line 126), so with them
    `verified_auto` the C6 practice pool draws the 240 reserve items (`pool({ purpose: 'practice', bank: 'C6' })`: 360, not 120). The
    reserves must be added to `RESERVE_FILES` before this content is served; P6 phase 1b keyed C6-7..9 the same way before its
    integration added them (`004a141e`, then `f5a53654`). This pass changes no `src/**` code.
  - a3's own test (`.superpowers/p8/a3/c19-rwse.test.ts`, gitignored, outside the suite): 4 of 8 fail, three on its draft pins and one
    on the same practice pool.

### Not done here

- `RESERVE_FILES` and the p6b-fixed-text pins (above): for the integrator.
- The native read of uz and ru (§9.1 step 5) and the teacher look that takes `verified_auto` to `reviewed`.
- The content `README.md` register rows (C19 batches 15-17; C6 batches 10-12): for the integrator, with this file and the authors'
  ledgers (`.superpowers/p8/author-1.md` … `author-3.md`).

## Part 2: AP Calculus AB units 5-8 (P8 blind checkers 3 and 4)

| File | Commit | Author | Lessons | Piece questions | Families (in C1) |
|---|---|---|---|---|---|
| `C19-18.json` (batch 18) | `b57d27b5` | `agent:p8-a4` | `C19-APCA05-1` … `C19-APCA08-3` (12) | `C19-ca51q1` … `ca83q3` (36) | `C1-11.json`: `C1-ap5001` … `ap5023` (23) |

Before this pass the 12 lessons and 36 piece questions were `status: draft`, `key_check_1: "author"`, `key_check_2: null`,
`version: 1`. The families are decided in `C1/RECONCILE-p8.md`; the unit records `C10-APCA05` … `APCA08` (`C10-8.json`) are not items
and stay as written.

### Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P8s3 (checker 3) | `.blind/C19-P8s3.json` (`blind.ts --pending`: the 72 items without two checks) | `.blind/C19-P8s3.answers.json` (36) |
| P8s4 (checker 4, who ran the reconcile and wrote this part) | `.blind/C19-P8s4.json` (`node scripts/content/blind.mjs C19 P8s4`: the whole bank, 313 items) | `.blind/C19-P8s4.answers.json` (36) |

Each solver answered the 36 AP items only (both copies also held part 1's 36 R&W items, which they left to checkers 1 and 2). P8s4
opened neither `.blind/.map-*` nor `C19-18.json`, `C1-11.json`, the author's ledger (`.superpowers/p8/author-4.md`) or sources
(`.superpowers/p8/a4/`) before it wrote its answers. It solved each item by hand from its copy, then ran its own sympy working
(`.superpowers/p8/k4/ap_solve.py`, which computes each value and matches it to the option text in P8s4's copy: 36 solved, 0 against
the hand answers), and wrote its answers file before it read P8s3's. Only `reconcile.ts` read the maps. `agentOf` reads P8s3, P8s4 and
`p8-a4` as three agents, so `keyCheckOf("blind:P8s3+P8s4", { author: "agent:p8-a4" })` is `{ kind: "blind", n: 2 }`.

### The decision

`npx tsx scripts/content/reconcile.ts C19 P8s3 P8s4 --write` gave **313 items: verified 36, quarantine 0, pending 0, blocked 0,
skipped 277** (the 241 earlier items and part 1's 36, already `verified_auto`). **Both solvers chose the key on all 36.** No answer
was stale, and neither answers file raises `two_defensible` or `unanswerable` (no item has a passage).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **36** | `key_check_2: "blind:P8s3+P8s4"`, `key_check_2_version: 1`, version 1 |

**How the file was written.** `C19-18.json` is in `JSON.stringify` form at its own indent, so `--write` changed only the decided
fields: for each of the 36 items `status`, `key_check_2`, the comma after `version` and the new `key_check_2_version`
(`.superpowers/p8/k4/fielddiff.mjs`, HEAD against the file, field by field). Key, options, `why` and version are the author's. The
decision log is `.blind/C19-reconcile.json`, kept as `.superpowers/p8/k4/C19-reconcile-log.json` (local).

**The lesson records.** Each of the 12 lessons now has `key_check_2: "blind:P8s3+P8s4"` and `status: "verified_auto"` (a text edit of
its two lines; `.superpowers/p8/k4/lessons.mjs`, which checks that nothing else in the file changed but the note), because:

- its three piece questions are verified 2/2, each with `page` naming the lesson;
- its example piece (the second) names q2 as its `check` and ends on its blank: a "Now you:" line that sets q2's problem with q2's
  numbers and stops at "= ?" or "→ … = ?". P8s4 read each against q2: the blank is q2's key in all 12 (128, 9, 578, 100, 240, 217, 19,
  36, 480, 59, 500, 216), the same value P8s4 found blind;
- every family its test and homework name is served: the 23 new `C1-ap50xx` (verified by this pass) and `C1-clp005`, `clp006`,
  `clp008`, `clp010` (already `verified_auto`).

The file's `note` said "Everything is draft until the blind key checks."; that sentence now says this pass keyed it.

### Each piece question, with P8s4's working

| Lesson | Piece | Item | Working | Key |
|---|---|---|---|---|
| C19-APCA05-1 | idea | C19-ca51q1 | f′ = 3x² − 12 = 0 at x = 2; f(0) = 0, f(2) = −16, f(3) = −9 | −16 |
|  | example | C19-ca51q2 | f′ = 0 at ±4; f(−5) = 115, f(−4) = 128, f(4) = −128, f(6) = −72 | 128 |
|  | trap | C19-ca51q3 | secant slope (152 − 2)/6 = 25; f′(c) = 6c − 5 = 25 | 5 |
| C19-APCA05-2 | idea | C19-ca52q1 | f′ = 3(x − 3)(x + 1): + to − at x = −1 | −1 |
|  | example | C19-ca52q2 | f′ = 3(x − 1)(x − 9): − to + at x = 9 | 9 |
|  | trap | C19-ca52q3 | f″ = 12x − 36 = 0 | 3 |
| C19-APCA05-3 | idea | C19-ca53q1 | P = x(30 − x), x = 15 | 225 |
|  | example | C19-ca53q2 | A = x(68 − 2x), A′ = 0 at x = 17: 17 · 34 | 578 |
|  | trap | C19-ca53q3 | V′ = 0 at 14 and 42; x = 42 leaves no box | 14 |
| C19-APCA06-1 | idea | C19-ca61q1 | right ends: 3(7 + 9 + 10) | 78 |
|  | example | C19-ca61q2 | left ends: 10(2 + 3 + 5) | 100 |
|  | trap | C19-ca61q3 | (2/2)(6 + 2 · 8 + 2 · 11 + 7) | 51 |
| C19-APCA06-2 | idea | C19-ca62q1 | 12x³ → 3x⁴, −4x → −2x² | 3x⁴ − 2x² |
|  | example | C19-ca62q2 | [x³ + x²] from 2 to 6: 252 − 12 | 240 |
|  | trap | C19-ca62q3 | g′(3) = 3³ − 2 · 3 | 21 |
| C19-APCA06-3 | idea | C19-ca63q1 | 2 ln x from 1 to e³ | 6 |
|  | example | C19-ca63q2 | u = x² + 8 from 8 to 9: 9³ − 8³ | 217 |
|  | trap | C19-ca63q3 | 4(−cos x) from 0 to π/2 | 4 |
| C19-APCA07-1 | idea | C19-ca71q1 | (4e^(3x))′ = 12e^(3x) = 3y; e^(3x) + 1 fails by 3 | y = 4e^(3x) |
|  | example | C19-ca71q2 | 6 · 3² − 7 · 5 | 19 |
|  | trap | C19-ca71q3 | k² + 2k − 8 = 0: k = 2 or −4 | 2 |
| C19-APCA07-2 | idea | C19-ca72q1 | y² = x³ + 1, y > 0: y(2) = √9 | 3 |
|  | example | C19-ca72q2 | 2√y = 10t + 2: √y = 5t + 1 | 36 |
|  | trap | C19-ca72q3 | y² = x² + 64: √289 | 17 |
| C19-APCA07-3 | idea | C19-ca73q1 | × 4 in 4 units of time, again from 4 to 8: 48 · 4 | 192 |
|  | example | C19-ca73q2 | 30/6 = 5 doublings: 15 · 2⁵ | 480 |
|  | trap | C19-ca73q3 | 1/8 = (1/2)³: three half-lives of 9 | 27 |
| C19-APCA08-1 | idea | C19-ca81q1 | (1/2)∫₀² 4t³ dt = 16/2 | 8 |
|  | example | C19-ca81q2 | (486 + 45)/9 | 59 |
|  | trap | C19-ca81q3 | v < 0 on [0, 1): 4 back, then 36 forward | 40 |
| C19-APCA08-2 | idea | C19-ca82q1 | x² = x + 2 at x = −1 and 2; the line on top | ∫₋₁² (x + 2 − x²) dx |
|  | example | C19-ca82q2 | they meet at x = ±5; ∫₋₅⁵ (75 − 3x²) dx | 500 |
|  | trap | C19-ca82q3 | they meet at x = 0 and 6; 756 − 504 | 252 |
| C19-APCA08-3 | idea | C19-ca83q1 | square side √x: ∫₀⁴ x dx | 8 |
|  | example | C19-ca83q2 | discs: π∫₀² 81x² dx = 216π | 216 |
|  | trap | C19-ca83q3 | washers: π∫₀³ (9x² − x²) dx = 72π | 72 |

No note was raised and nothing was flagged: each item has one value, and each distractor is a different number (a wrong end, a
critical point that is not the answer, the slope instead of c, the integrand instead of its antiderivative, a sign slip).

### Uzbek: the U+02BB / U+02BC lint

`.superpowers/p7/k4/uz_lint.mjs` on `C19-18.json`, `C1-11.json`, `C4-6.json`, `C7-9.json` and `C10-8.json`: 954 uz and ru strings,
577 U+02BB and 86 U+02BC, **0 findings and 0 to look at**. `lesson-c19-apca58.test.ts` runs `uzApostrophes` and `mixedScriptWords` over
the lessons, items, families and units: pass. A native read of the uz and ru lines (§9.1 step 5) is still to do.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings** (the baseline); no warning on any id
  of this part. The notes are the baseline's 270 plus `status.history` on `C7-ir4219` and `C7-ir4220` (a verified version 2 keeps its
  quarantine reason as history, by design; `C7/RECONCILE-p8.md`).
- `reconcile.ts C19 P8s3 P8s4 --audit`: 0 of 313 decisions differ from the status in the files (C1 0 of 189, C4 0 of 312, C7 0 of 239).
- Vitest, one process at a time, `ANTHROPIC_API_KEY` empty: `lesson-c19-apca58` (its families' draft pin now asserts the ladder and,
  on a served family, its solver check), `lesson-c19-apca12`, `lesson-c19-apca34`, `lesson-c19-14`, `lesson-asks-its-page`,
  `lesson-teaches`, `c19-loader`, `committed-content`: pass. The English failures this pass causes are in `C4/RECONCILE-p8.md`.

### Not done here

- The native read of uz and ru (§9.1 step 5) and the teacher look (`reviewed`).
- The integrator's steps of `.superpowers/p8/PLAN.md` §8 item 2 (`C10-8.json` in `src/server/lessons/course.ts`) and the content
  `README.md` register rows for C19 batch 18, C1 batch 11 and C10 batch 8 (`.superpowers/p8/author-4.md`).
