# C6: key check 2 of content round 2's SAT Reading and Writing reserve items, pair b (authors se and ei; 15 Oct 2026)

Content round 2 (the owner's "content x3-5", 15 Oct 2026; SPEC-lessons rev. 2, §3.3, §4.5, §9.1-§9.4) gave lessons 2 and 3 of each SAT
Reading and Writing unit 20 more C6 reserve items, so each of those lessons now draws its test-out, test and homework from 40 (its first
20 and these 20). Four authors wrote them. This file is the key check of pair b's 240 items, by the authors se and ei. Pair a (cs and ii,
C6-18 and C6-19) was keyed separately (commit `5bba2772`). No piece question, lesson or passage is new in this round: the C19 edits only
append the 20 ids to each lesson's `reserve`.

| File | Commit | Author | Items | Lessons (20 each) |
|---|---|---|---|---|
| `C6-20.json` (batch 20) | `1ced8628` | `agent:p11-se` | `C6-se1801` … `se1820`, `se1901` … `se1920`, `se2701` … `se2720`, `se2801` … `se2820`, `se3701` … `se3720`, `se3801` … `se3820` | `C19-RWSE01-2`, `RWSE01-3`, `RWSE02-2`, `RWSE02-3` (C19-17), `C19-RWSE03-2`, `RWSE03-3` (C19-21) |
| `C6-21.json` (batch 21) | `ef424955` | `agent:p11-ei` | `C6-ei1801` … `ei1820`, `ei1901` … `ei1920`, `ei2701` … `ei2720`, `ei2801` … `ei2820`, `ei3701` … `ei3720`, `ei3801` … `ei3820` | `C19-RWEI01-2`, `RWEI01-3`, `RWEI02-2`, `RWEI02-3` (C19-19), `C19-RWEI03-2`, `RWEI03-3` (C19-21) |

Before this pass all 240 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. None has a `passage_id`:
each sentence, notes list or pair of sentences is in its stem, so no item faces a no-passage solver, and neither solver found one
answerable without its text. The twelve lessons' reserves hold the 240 ids, each in exactly one reserve.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P11bs1 (checker 1) | `.superpowers/p11/blind-b/C6-P11bs1.json` (240 items) | `.superpowers/p11/blind-b/C6-P11bs1.answers.json` (sha256 `ffc19aa3…`, recorded by checker 1 before it saw a key) |
| P11bs2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p11/blind-b/C6-P11bs2.json` (240 items) | `.superpowers/p11/blind-b/C6-P11bs2.answers.json` (sha256 `02f41a07…`, recorded at 06:49 in `.superpowers/p11/check-b-2/answers.sha256`) |

P11bs2's copy: `npx tsx scripts/content/blind.ts C6 P11bs2 --pending --blind .superpowers/p11/check-b-2/stage` (the 480 round-2 items
without two checks at that moment; the 960 earlier C6 items were left out as two-checked), then `.superpowers/p11/check-b-2/filter.cjs`
kept only the 240 ids of C6-20 and C6-21 (it reads the ids from the two files and copies their map entries without printing them). A copy
holds each item's stem and its four options, shuffled by the solver's own seed and lettered A-D, with the lesson's instructions; no key,
no `why`. Both solvers' copy, answers and map sit in one folder, `.superpowers/p11/blind-b/`, from the start, because `reconcile.ts`
reads every solver from one `--blind` folder (the lesson of round 1).

Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads
P11bs1, P11bs2, `p11-se` and `p11-ei` as four agents, so `keyCheckOf("blind:P11bs1+P11bs2", { author })` is `{ kind: "blind", n: 2 }`
for both authors. P11bs2 opened neither `.map-*` file nor the C6-20 and C6-21 records, nor the authors' ledgers, sources, logs and tests
(`.superpowers/p11/author-*.md`, `se/`, `ei/`, `tests/unit/content/p11-*.test.ts`), before it wrote its answers; it read each item in its
copy, chose a letter, worked every count by hand (200 x 2 = 400 against 50 x 6 = 300; 1,500 + 600 > 2,000; 84 = 2 x 42; 25 to 40
minutes is not double), and wrote its answers file, with a one-line reading per item, before it read anything of P11bs1's. Only
`reconcile.ts` read the maps.

## The decision

`npx tsx scripts/content/reconcile.ts C6 P11bs1 P11bs2 --blind .superpowers/p11/blind-b --write` gave **1440 items: verified 237,
quarantine 3, pending 0, blocked 0, skipped 1200.** The 1200 skipped are the earlier C6 items, already `verified_auto` (C6-1 … C6-19,
pair a's included). **Both solvers chose the key on all 237 verified items; no solver chose a wrong letter on any of the 240.** The three
quarantines are flags of a second defensible option (two of them raised by both solvers). No answer was stale.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **237** | `key_check_2: "blind:P11bs1+P11bs2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | **3** | `key_check_2: null`, `quarantine_reason` (below), version 1 |

By level (verified/written): easy (B1) 36/36, medium (B2) 95/96, hard (C1) 106/108. The decisions are kept in
`.superpowers/p11/blind-b/C6-reconcile.json`; the dry run that preceded the write (same counts) in `.superpowers/p11/check-b-2/dryrun.log`.

### Counts per lesson

| Lesson | File (C19) | Reserve | New items (C6) | Subskill of the new 20 | Easy/medium/hard (new 20) | Verified | Quarantine |
|---|---|---:|---|---|---|---:|---:|
| C19-RWSE01-2 | C19-17.json | 40 | `C6-se1901` … `se1920` (20, C6-20.json) | boundaries 20 | 5/9/6 | 20 | 0 |
| C19-RWSE01-3 | C19-17.json | 40 | `C6-se1801` … `se1820` (20, C6-20.json) | boundaries 20 | 2/8/10 | 19 | 1 (`C6-se1811`) |
| C19-RWSE02-2 | C19-17.json | 40 | `C6-se2701` … `se2720` (20, C6-20.json) | form_structure_sense 20 | 5/9/6 | 20 | 0 |
| C19-RWSE02-3 | C19-17.json | 40 | `C6-se2801` … `se2820` (20, C6-20.json) | form_structure_sense 20 | 2/8/10 | 19 | 1 (`C6-se2818`) |
| C19-RWSE03-2 | C19-21.json | 40 | `C6-se3701` … `se3720` (20, C6-20.json) | form_structure_sense 20 | 2/8/10 | 20 | 0 |
| C19-RWSE03-3 | C19-21.json | 40 | `C6-se3801` … `se3820` (20, C6-20.json) | boundaries 20 | 2/6/12 | 20 | 0 |
| C19-RWEI01-2 | C19-19.json | 40 | `C6-ei1901` … `ei1920` (20, C6-21.json) | transitions 20 | 5/9/6 | 20 | 0 |
| C19-RWEI01-3 | C19-19.json | 40 | `C6-ei1801` … `ei1820` (20, C6-21.json) | transitions 20 | 2/8/10 | 19 | 1 (`C6-ei1807`) |
| C19-RWEI02-2 | C19-19.json | 40 | `C6-ei2701` … `ei2720` (20, C6-21.json) | rhetorical_synthesis 20 | 5/9/6 | 20 | 0 |
| C19-RWEI02-3 | C19-19.json | 40 | `C6-ei2801` … `ei2820` (20, C6-21.json) | rhetorical_synthesis 20 | 2/8/10 | 20 | 0 |
| C19-RWEI03-2 | C19-21.json | 40 | `C6-ei3701` … `ei3720` (20, C6-21.json) | transitions 20 | 2/8/10 | 20 | 0 |
| C19-RWEI03-3 | C19-21.json | 40 | `C6-ei3801` … `ei3820` (20, C6-21.json) | rhetorical_synthesis 20 | 2/6/12 | 20 | 0 |
| **Total** | | | **240** | | | **237** | **3** |

Each lesson's reserve is its first 20 and the 20 new ids, in that order. The lessons' own records and reserves are unchanged by this pass
(only the authors' commits grew the reserves).

### The three quarantines

`reconcile.ts` writes the note of the first solver that raised a flag, here P11bs1's for all three. **The letters in a
`quarantine_reason` are P11bs1's own shuffled letters**, not positions in the file (the key is `options[0]`); the quoted text says which
option is meant.

| Item | Lesson | Level | Flagged by | Reason |
|---|---|---|---|---|
| `C6-se1811` | RWSE01-3 | C1, boundaries | P11bs1 and P11bs2 | The key "sand; the smallest one built by three friends from Class 7B, however, held" is right, but the option "sand; the smallest, one built by …" is grammatical too: "the smallest" (the smallest bridge) with the appositive "one built by three friends from Class 7B", its closing comma shared with ", however,". Both solvers found this on their own. |
| `C6-se2818` | RWSE02-3 | C1, form_structure_sense | P11bs1 (P11bs2 chose the key) | The key "hikers'" fits a plural "they", but singular "they" for one hiker is standard current usage, so "The hiker's boots, which they had left by the stove" is correct too; nothing else in the sentence makes the owner plural ("the group" leaves it open). P11bs2 chose the key without a flag and, on reading P11bs1's note, agrees it is defensible. |
| `C6-ei1807` | RWEI01-3 | B2, transitions | P11bs1 and P11bs2 | The key "However," is best, but "Instead," also reads as idiomatic: the recipe said the dough would double in an hour; instead, after two hours, it had hardly grown (an outcome in place of the expected one, as in "the forecast said rain; instead it was sunny"). Both solvers found this on their own. |

A rewrite is the author's, as a new version (spec §5.5 step 7: an item never changes its key in place): for se1811, an option that
cannot be read as an appositive; for se2818, a sentence that fixes the owner as plural (for example by naming two hikers) or a different
near option; for ei1807, a near option other than "Instead,".

**Until then three lessons are held** (`unservedOf` holds a fixed-text lesson while any reserve item is not served): `C19-RWSE01-3`,
`C19-RWSE02-3` and `C19-RWEI01-3`. The other nine of pair b's lessons are served with all 40 reserve items. The authors' "today" tests
(`p11-se`, `p11-ei`) compute exactly this from the records and pass.

## What P11bs2 weighed (none a flag)

| Item | The near option | Why the key is the only one |
|---|---|---|
| C6-se1818 | "clouds: even so," | a colon introduces what explains the first clause; "even so" sets the second against it: a semicolon |
| C6-se1916 | the title in commas, dashes or brackets | Gulnora has written four books, so the title says which one: restrictive, no marks |
| C6-se1914 | "a local carpenter, Bobur Nazarov" | the appositive is never closed before "repaired"; a title-like descriptor before the name takes no commas |
| C6-se2803 | "their weekly" | a club is one group: "its", the bank's rule for a collective noun |
| C6-se2711, se2710, se2717 | "are running", "were allowed", "have been working" | "for three years now" and "ever since" run up to now (present perfect); "by the time … opens next spring" is future perfect |
| C6-ei1820 | "In contrast," | the gardener's word and the tree's leaves are not two things compared; the leaves came despite it: "Nevertheless," |
| C6-ei1815 | "In contrast," | the spares they planned to keep and the programs gone by noon: an expectation that failed, "However," |
| C6-ei3703, ei3711 | "In fact," | the ramps, rails and lift (the bins, the ice, the washing) are the particulars of the claim: "Specifically," |
| C6-ei2719 | "watered in the same way" | the goal is a similarity in the results; watering is the method, 4 kg of grain the result |
| C6-ei2707, ei2709, ei2712, ei2715, ei2718, ei2703, ei2706 | the option with the numbers swapped or the ratio wrong | each number checked against the notes (9 > 2 x 4; 84 = 2 x 42, not 4 x; 45 this January, 70 last; 1,100 in May, 1,600 in June; 200 x 2 = 400 vs 50 x 6 = 300; 300 = 900 - 600; 900 = 2 x 450 in July) |
| C6-ei3816, ei3819, ei3812 | "doubling the size doubled the time"; "most used more than 15 hours"; the pear-only sentence | 25 to 40 is not double; only 2 of 5 are over 15; the goal is a general statement about lemon juice |
| C6-ei3803, ei3807, ei3809, ei3814, ei3817 | the same two facts with the clauses reversed | the goal's emphasis goes in the main clause, the acknowledged point in the "although" part |

## Uzbek and Russian

**Lint.** A lint over every uz and ru string of C6-20 and C6-21 (each `why` and `instructions`: any ' ‘ ’ ` ´ in uz, U+02BB after a letter
other than o/g, U+02BC after o/g, Cyrillic in uz, Latin outside quotation marks in ru, a why over 200 characters;
`.superpowers/p11/check-b-2/lint.cjs`) raised 62 findings before the fixes, nearly all English grammar words left bare ("which-qism",
часть с which, either … or, it is). After the fixes it raises 27, none a fault: formula notation in ru ("have + past participle",
"was + -ing", the letter "s"), the class names 5A and 5B, the variables X and Y of the although-items, and «Whoʼs» inside quotes in uz
(English quoted inside a uz line is written with U+02BC, the authors' rule).

**Checker 1's fixes** (`.superpowers/p11/check-b-1/uz-ru-fixes.json`, sha256 `13c94b98…`, unchanged from 06:57 to the write): **75 fixes,
46 of a `why.uz` and 29 of a `why.ru`, on 49 items: 54 fields in C6-20 and 21 in C6-21**, no two on the same field. Every fix's `old`
matched the current text exactly. P11bs2 read each fix against its item (its English `why` and the other language;
`.superpowers/p11/check-b-2/show-new.cjs`, verdicts in `reviewed.json`) and agrees with all 75. **Applied: 75 (as written). Refused: 0.**
None puts a `why` over 200 characters (the longest new one is 184). The script and its log: `.superpowers/p11/check-b-2/apply-fixes.cjs`,
`uz-ru-applied.json`. A `why` is no part of what a solver sees (the blind copy's signature is the stem and the options), so the key check
recorded for version 1 holds; no key, stem or option changed. The native read of uz and ru (§9.1 step 5) is still to do.

45 of the 75 put a bare English word in quotation marks, as round 1 did (C6-17: «which» qismi, часть с «which»): «which» / «that» /
«whose» / «who» / «how» qismi for the glued "which-qism" in uz, and «which», «that», «whose», «who», «how», «to», «either … or»,
«neither … nor», «it is», «they are», «who is» in uz and ru. They are on C6-se1819, se1906, se1908, se1911, se1912, se1917, se1918,
se1919 (uz and ru each), se2801, se2803, se2807, se2808, se2810, se2812, se2813 (uz), se3702, se3705, se3708, se3709, se3713, se3716,
se3718, se3809, se3813, se3818, se3820 (uz and ru each); se3813's two also turn "does not split" into "cannot split" («ajrata olmaydi»,
«не могут отделять»). The other 30 repair meaning traps, calques and wrong words:

| Item | Field | Checker 1's reason (abridged) | Result |
|---|---|---|---|
| C6-se1901 | `why.uz` | «belgisizlik» is a coinage no reader uses; «belgi qoʻymaslik» (leaving out the mark) | applied |
| C6-se1905 | `why.uz` | Wrong voice: «tasvirlangan» is "the described"; the phrase describes the café: «oʻzi tasvirlaydigan» | applied |
| C6-se2806 | `why.uz` | Meaning trap: «s siz» reads "s you" (siz = you); «s harfisiz» is "without the letter s" | applied |
| C6-se2811 | `why.uz` | «kim» is for people only; for keys Uzbek asks «Nimaning yorliqlari?» | applied |
| C6-se2711 | `why.ru` | «уводит слишком далеко» alone reads "goes too far"; the English means too far back: «… в прошлое» | applied |
| C6-se3802 | `why.uz`, `why.ru` | Calque of "what it names": a verb names nothing; what may not be split off is its object (toʻldiruvchi, дополнение) | applied (2) |
| C6-se3805 | `why.uz`, `why.ru` | The same calque; in ru the dash pair was also broken («…, — перечень, не разделяются») | applied (2) |
| C6-ei1901 | `why.uz` | Meaning trap: «oldinga qoʻymoq» reads "put it forward", the opposite of "would put it before" | applied |
| C6-ei1919 | `why.uz` | «nayxon» is not a word (-xon is for singers); a flute player is «nay ijrochisi» | applied |
| C6-ei1802, ei1806, ei1810, ei1817 | `why.uz`, `why.ru` | Calque of "pattern": «naqsh» is a decorative pattern, «образец» a sample to copy; «ikkinchi holatda ham xuddi shunday» / «та же схема» (the bank's own wording in C6-13) | applied (8) |
| C6-ei1814 | `why.ru` | «образец» as above: «та же схема» | applied |
| C6-ei1818 | `why.uz` | «ayrilgan» is "parted from, lost"; marks taken off are «olib tashlangan» | applied |
| C6-ei2707 | `why.ru` | «больше чем вдвое от 4» is not Russian; «более чем вдвое больше 4» | applied |
| C6-ei2803 | `why.uz` | Meaning trap: «notanish oʻquvchilar» reads "unknown pupils"; and a numeral takes a singular: «ikki katta kishi» | applied |
| C6-ei2805 | `why.uz` | Meaning trap: «lenta» alone is a ribbon and «suratga olish» is taking photos; filmed beside a measuring tape: «ruletka yonida videoga olish» | applied |
| C6-ei2807 | `why.uz` | Calque of "overview": «umumiy koʻrinish» is "general appearance"; «umumiy tavsif» | applied |
| C6-ei3716 | `why.uz` | Meaning trap: «shahar oxirida» is "at the edge of the town"; "in the end" is «oxir-oqibat» | applied |
| C6-ei3720 | `why.uz` | Meaning shift: «qurib qolgan» is "dried up"; the stream only shrank to a trickle | applied |
| C6-ei3803 | `why.uz`, `why.ru` | Calque of "carries the weight" (a physical load); the point is emphasis, «urgʻu» / «акцент»; and «долгие часы» is "long hours", not the longer opening hours («продлённые часы») | applied (2) |
| C6-ei3815 | `why.uz` | Meaning trap: «notanish oʻquvchilar» reads "unknown pupils" | applied |

Checker 1 notes, outside this round, five older uses of the «naqsh» calque in C6-13; nothing there was changed here.

## What the write changed

`--write` re-serialises each file it touches. Against `HEAD`, each of the 240 items differs only in `status` and the key-check record:
the 237 verified in `status`, `key_check_2` and the new `key_check_2_version`; the 3 quarantined in `status` and the new
`quarantine_reason` (`key_check_2` stays null). 49 of them also differ in the 75 `why.uz` and `why.ru` strings above. Each key, option,
stem, English `why`, level and version is as the author wrote it. The `note` of each file now says the key check is done and names the
quarantines (a text edit of the note only, `.superpowers/p11/check-b-2/notes.cjs`). Checked by a script that diffs every item against
`HEAD`: no other field changed; LF, no BOM, the files' own `JSON.stringify(…, null, 2)` form. No C19 file is touched by this pass.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings** (the base's count), 281 notes; no
  finding on C6-20, C6-21 or their ids (`.superpowers/p11/check-b-2/validate-2.log`).
- The authors' tests `tests/unit/content/p11-se.test.ts` and `p11-ei.test.ts`: **19 of 19 pass** after the reconcile and the fixes
  (`vitest-1.log`). Their "today" tests now find exactly RWSE01-3, RWSE02-3 and RWEI01-3 held, each for its one quarantined item.
- Related tests (`vitest-related-1.log`, `vitest-related-2.log`): `committed-content`, `no-content-leak`, `keycheck`, `reconcile`,
  `p7-unit-test`, `p11-cs` and `p11-ii` pass. These fail, each a pin this round's reserve appends or verified files break, as the authors'
  own logs had them before this pass (`.superpowers/p11/se/vitest-affected.log`, `ei/vitest-affected.log`):
  `p8b-a1-rw-ei-lessons` (6) and `p8b-a3-rw-mixed-lessons` (4) pin each reserve at 20 (now 40), `p8-a1-rw-craft-lessons` (2) and
  `p8b-a2-rw-cross-inference-lessons` (4) the same for pair a's lessons; `p6b-fixed-text` (5) pins 20-item reserves, the 36 SAT R&W
  lessons all served (33 are: the three held above), the catalogue and English-turn lists that go with them, and the C6 practice pool at
  120 items (it is 597: C6-18 … C6-21 are verified and not yet in `RESERVE_FILES`).

## For the integrator (not changed here)

- `RESERVE_FILES` (`src/server/content/bank.ts`) must gain `C6/C6-20.json` and `C6/C6-21.json` (and pair a's `C6-18.json`, `C6-19.json`).
  Until it does, the C6 practice pool draws these 237 verified items as practice items.
- `C19-RWSE01-3`, `C19-RWSE02-3` and `C19-RWEI01-3` stay held until `C6-se1811`, `C6-se2818` and `C6-ei1807` are rewritten by their
  authors (version 2) and keyed again by two blind solvers outside the author's session (`blind.ts --pending` picks up exactly those).
- `tests/unit/engine-server/p6b-fixed-text.test.ts` and the P8/P8b lesson tests pin each lesson-2 and lesson-3 reserve at 20 items and
  the reserve-file practice exclusion at 120; both need the new sizes (40 per reserve; the reserve files above) and, until the rewrites,
  the three held lessons.
