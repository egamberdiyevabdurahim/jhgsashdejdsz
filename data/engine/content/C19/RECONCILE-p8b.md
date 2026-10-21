# C19: key check 2 of the P8b lessons (14 Oct 2026)

P8b (SPEC-lessons rev. 2, §9.1 step 3, §12.5-§12.6; `.superpowers/p8b/PLAN.md`) added lessons 2 and 3 of the last six SAT Reading and
Writing units to C19 in three batch files. After this phase every SAT R&W unit has lessons 1, 2 and 3. One pair of blind checkers keyed
them.

| File | Commit | Author | Lessons | Piece questions | Reserve (in C6) |
|---|---|---|---|---|---|
| `C19-19.json` (batch 19) | `2f6f0f80` | `agent:p8b-a1` | `C19-RWEI01-2`, `-3`, `C19-RWEI02-2`, `-3` (gate B1) | `C19-ei12q1-3`, `ei13q1-3`, `ei22q1-3`, `ei23q1-3` (12) | `C6-13.json` (80) |
| `C19-20.json` (batch 20) | `675d8c2d` | `agent:p8b-a2` | `C19-RWCS03-2`, `-3`, `C19-RWII03-2`, `-3` (gate B2) | `C19-cs32q1-3`, `cs33q1-3`, `ii32q1-3`, `ii33q1-3` (12) | `C6-14.json` (80) |
| `C19-21.json` (batch 21) | `81535990` | `agent:p8b-a3` | `C19-RWSE03-2`, `-3`, `C19-RWEI03-2`, `-3` (gate B2) | `C19-se32q1-3`, `se33q1-3`, `ei32q1-3`, `ei33q1-3` (12) | `C6-15.json` (80) |

Before this pass all 12 lessons, all 36 piece questions and all 240 reserve items were `status: draft`, `key_check_1: "author"`,
`key_check_2: null`, `version: 1`. The reserves are decided in `C6/RECONCILE-p8b.md`.

## Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| P8bs1 (checker 1) | `.blind/C19-P8bs1.json` (the whole bank, 349 items) | `.blind/C19-P8bs1.answers.json` (the 36 of this pass) |
| P8bs2 (checker 2, who ran the reconcile and wrote this file) | `.blind/C19-P8bs2.json` (`npx tsx scripts/content/blind.ts C19 P8bs2 --pending`: the 36 items without two checks) | `.blind/C19-P8bs2.answers.json` |

A copy holds each item's stem and its four options shuffled by the solver's own seed and lettered A-D. It has no key and no `why`.
P8bs2 opened neither `.blind/.map-*` nor the C19-19, C19-20, C19-21, C6-13, C6-14 and C6-15 records, nor the authors' ledgers, sources,
logs and tests (`.superpowers/p8b/author-*.md`, `a1`-`a3`, `tests/unit/content/p8b-a*.test.ts`), before it wrote its answers. It read each
item in its copy, chose a letter, and wrote its answers file (with a one-line reading per item, the table below) before it read
P8bs1's. Only `reconcile.ts` read the maps. `agentOf` reads P8bs1, P8bs2, `p8b-a1`, `p8b-a2` and `p8b-a3` as five agents, so
`keyCheckOf("blind:P8bs1+P8bs2", { author })` is `{ kind: "blind", n: 2 }` for each author.

## The decision

`npx tsx scripts/content/reconcile.ts C19 P8bs1 P8bs2 --write` gave **349 items: verified 36, quarantine 0, pending 0, blocked 0,
skipped 313.** The 313 skipped are the earlier items, already `verified_auto`. **Both solvers chose the key on all 36 items.** No answer
was stale. Neither answers file raises `two_defensible`, `unanswerable` or `no_passage_needed`; no item of this pass has a `passage_id`
(each text is in its stem).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **36** | `key_check_2: "blind:P8bs1+P8bs2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | 0 | none |

By level: B1 2/2, B2 20/20, C1 14/14. **How the files were written.** `--write` re-serialises each file it touches. The diff of each of
the 36 items is exactly `status`, `key_check_2`, the comma after `version` and the new `key_check_2_version`; nothing else in an item
changed (`.superpowers/p8b/kc2/diffcheck.mjs` against `HEAD`: 276 items, 12 lessons, 0 problems; LF, no BOM). Its key, options, `why`
and version are as the author wrote them. The decisions are kept in `.superpowers/p8b/kc2/C19-decisions.json` (`.blind/C19-reconcile.json`
is rewritten by every reconcile of the bank).

**The lesson records.** `reconcile.ts` reads only `items`. Each of the 12 lessons now has `key_check_2: "blind:P8bs1+P8bs2"` and
`status: "verified_auto"` (a text edit of its two lines; no `key_check_2_version`, which §11.1's lesson shape does not have;
`.superpowers/p8b/kc2/lessons-write.mjs`, which refuses unless the lesson check passed and verifies by parsing that nothing else
changed), because (`.superpowers/p8b/kc2/lessons-kc2.mjs`, 0 problems):

- its pieces are `idea`, `example`, `trap`, checking q1, q2 and q3; each of the three is verified 2/2 for its version, with `page`
  naming the lesson;
- its example's "Now you" part holds q2's text word for word in en, uz and ru (quotation marks and the apostrophe's code point aside),
  and its last line is the open step that q2's key fills. For ten lessons every paragraph of q2's stem but the question line is there
  verbatim. `C19-RWEI02-2` and `C19-RWEI02-3` (notes questions) quote the four notes verbatim but write the header as "Notes:" and the
  goal as "Goal: to …" for "The student wants to …", lesson 1's own form (`C19-RWEI02-1`); I read both against q2: the same notes, the
  same goal, and the blank is q2's key. No example carries q2's question line; each ends on its own question or "The answer: ?";
- each of its 20 reserve items (`reserve`) is in C6-13, C6-14 or C6-15, without a `page`, verified 2/2 by this pass, and in no other
  lesson's reserve (240 ids, 240 owners).

The `note` of each of the three files now says the key check is done (the same script).

## Each piece question, with checker 2's reading

The reading is P8bs2's own blind working, written into its answers before any key was seen.

| Lesson | Piece | Item | Level | P8bs2's reading | Key (options[0]) | P8bs1 | P8bs2 |
|---|---|---|---|---|---|---|---|
| C19-RWEI01-2 | idea | C19-ei12q1 | B1 | first weed, then water: next step in time | Then, | key | key |
|  | example | C19-ei12q2 | B2 | quiet + long tables: a second point of the same kind | In addition, | key | key |
|  | trap | C19-ei12q3 | B2 | had sold / had stayed: before today | Previously, | key | key |
| C19-RWEI01-3 | idea | C19-ei13q1 | B2 | sun-loving tomato vs shade-loving mint: two things compared | In contrast, | key | key |
|  | example | C19-ei13q2 | B2 | bad cold, no voice, yet every answer right: expectation fails | Nevertheless, | key | key |
|  | trap | C19-ei13q3 | C1 | bread in cloth, apricots in cloth: same pattern, second case | Similarly, | key | key |
| C19-RWEI02-2 | idea | C19-ei22q1 | B1 | the only option with what both trips share (six hours) | Each of the two class trips in May lasted six hours, including the … | key | key |
|  | example | C19-ei22q2 | B2 | 150 vs 50, three times as many: both kinds and the right relation | Every morning, the bakery bakes 150 round loaves, three times as ma… | key | key |
|  | trap | C19-ei22q3 | B2 | 12 vs 4 is three times (a distractor says twice) | Saida keeps 12 hens, three times as many as the 4 that Bahodir keeps. | key | key |
| C19-RWEI02-3 | idea | C19-ei23q1 | B2 | the method: ten minutes, four places, phone app | During the lunch break, the pupils measured the sound for ten minut… | key | key |
|  | example | C19-ei23q2 | B2 | the why: drivers could not see the children | The stop was moved because drivers coming round the sharp bend coul… | key | key |
|  | trap | C19-ei23q3 | C1 | introduce = what and when, for readers new to it | On the last Friday of each month, the school library holds a night … | key | key |
| C19-RWCS03-2 | idea | C19-cs32q1 | B2 | novelty: two weeks too short | By arguing that a count from the first weeks is too short to suppor… | key | key |
|  | example | C19-cs32q2 | B2 | the reading contest at the same time | By pointing out that another change at the same time may explain th… | key | key |
|  | trap | C19-cs32q3 | C1 | grants shop gain, warns children into the road | By granting that it would help the shops but warning that it would … | key | key |
| C19-RWCS03-3 | idea | C19-cs33q1 | B2 | Text 1: skill can be taught, attendance first | By arguing that coming to practice matters more than talent alone | key | key |
|  | example | C19-cs33q2 | C1 | both grant fewer bags; differ on the reason | Shoppers in the district use fewer plastic bags than they did in th… | key | key |
|  | trap | C19-cs33q3 | C1 | Text 1: repair costs push demolition; owners alone would lose houses | By warning that leaving the whole cost to owners would lead to more… | key | key |
| C19-RWII03-2 | idea | C19-ii32q1 | B2 | only flour differed, no one could tell: cheap as good, for this cake | the cheaper flour worked as well as the expensive one. | key | key |
|  | example | C19-ii32q2 | B2 | only difference: quiet garden vs busy gate | that was farther from people passing by. | key | key |
|  | trap | C19-ii32q3 | C1 | training frequency equal, so it cannot explain the gap | cannot be explained by how often they trained. | key | key |
| C19-RWII03-3 | idea | C19-ii33q1 | B2 | not until twenty clean hours; he drove the main road | had driven twenty hours on the quiet roads without a mistake. | key | key |
|  | example | C19-ii33q2 | C1 | bulb and socket ruled out: the lamp itself | lies somewhere in the desk lamp itself, such as its cable or switch. | key | key |
|  | trap | C19-ii33q3 | C1 | only such baker closed: no baker in town meets the rule | cannot buy its bread from any baker in the town. | key | key |
| C19-RWSE03-2 | idea | C19-se32q1 | B2 | unlike bakeries: the shop is the subject | the small shop by the bus station still bakes its bread in a clay o… | key | key |
|  | example | C19-se32q2 | B2 | neither … nor: nearer subject the waiter, singular | is | key | key |
|  | trap | C19-se32q3 | C1 | trained as a carpenter: Feruza right after the comma | Feruza builds every one of them herself, using wood from old houses. | key | key |
| C19-RWSE03-3 | idea | C19-se33q1 | B2 | complete clause, then colon before the list | plug: | key | key |
|  | example | C19-se33q2 | C1 | long subject, no mark before the verb | weekend received | key | key |
|  | trap | C19-se33q3 | C1 | list parts hold commas: semicolons | meat; and | key | key |
| C19-RWEI03-2 | idea | C19-ei32q1 | B2 | did not just fix: goes further | In fact, | key | key |
|  | example | C19-ei32q2 | B2 | restates the saying | In other words, | key | key |
|  | trap | C19-ei32q3 | C1 | grants the cost, then Still insists | Admittedly, | key | key |
| C19-RWEI03-3 | idea | C19-ei33q1 | B2 | two-part goal: why + one result | Dilfuza moves her 60 hives to follow the flowers as they bloom, and… | key | key |
|  | example | C19-ei33q2 | C1 | newest work, readers know the station: skip the background | Since 2025, the Tepalik station has also measured frost on the grou… | key | key |
|  | trap | C19-ei33q3 | C1 | main clause the possibility, the cost conceded | Although it cost 3 times as much as the old fixed stage, the new re… | key | key |

### What P8bs2 weighed (none a flag)

- `C19-ei13q3`: "For example," would need a general claim before it; the general line ("almost no plastic") comes last, and the
  second sentence repeats the first one's pattern (cloth, not plastic) for the apricots. Only "Similarly,".
- `C19-ii33q3`: the canteen's rule plus "the only baker in the town who uses such flour" is closed: no baker in the town meets the rule.
  "Buys from another baker in the town" and "bread from distant mills" break the rule; "closed its kitchen" goes beyond the text.
- `C19-cs33q2`: Text 2 denies Text 1's reason (the fee) but grants its fact ("There is no doubt that fewer plastic bags leave the
  shops"); the fact is the only statement both hold.
- `C19-ei33q3`: two options hold the same two facts; the goal ("emphasize what the stage made possible while acknowledging its cost")
  puts the possibility in the main clause and the cost in the "although" clause. The reversed sentence emphasizes the cost.

## Uzbek: the U+02BB / U+02BC lint

I linted every uz string of `C19-19.json`, `C19-20.json`, `C19-21.json`, `C6-13.json`, `C6-14.json` and `C6-15.json`: 600 strings,
89,835 characters, 1,547 U+02BB and 76 U+02BC (`.superpowers/p8b/kc2/uz-lint.ts`, P8's lint: `uzApostrophes` and `mixedScriptWords`
from `src/engine/content/text.ts`, then any ' ‘ ’ ` ´ at all, U+02BB after a letter other than o/g, U+02BC after o/g or not after a
letter, Cyrillic in uz, and a list of common words written without their mark; log `.superpowers/p8b/kc2/uz-lint.log`). **No finding in
Uzbek.** The lint raised one line, a false positive: `C19-RWII03-2`'s uz example has «sugʻorgani» (how often she watered), and the
bare-word pattern `organ\w*` matched its tail because a JavaScript `\b` without the `u` flag treats U+02BB as a word boundary; the
word is written right. Nothing was raised to look at. A native read of the uz and ru lines (§9.1 step 5) is still to do; the lint
does not replace it.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings, 275 notes** (the P8b baseline,
  `.superpowers/p8b/validate-base.log`), and no finding of any severity on any id of this pass, its reserves or its files
  (`.superpowers/p8b/kc2/validate.log`).
- `npx tsx scripts/content/reconcile.ts C19 P8bs1 P8bs2 --audit`: 0 of 349 decisions differ from the status in the files.
- Vitest, one process, with `ANTHROPIC_API_KEY` empty: the three authors' tests (`tests/unit/content/p8b-a1-rw-ei-lessons`,
  `p8b-a2-rw-cross-inference-lessons`, `p8b-a3-rw-mixed-lessons`) and `tests/unit/engine/lesson-c19-5-notes`: **4 files, 37 tests
  passed** (`.superpowers/p8b/kc2/vitest-authors.log`). The authors wrote their pins for both states (a status from the ladder; a draft
  lesson held back, a keyed one served with nothing unserved), so none needed a change.
- Vitest, one process: `tests/unit/content/` `bank`, `c19-loader`, `committed-content`, `keycheck`, `lessons-course`,
  `no-content-leak`, `reconcile`, `reconcile-cli` and `tests/unit/engine/` `lesson-asks-its-page`, `lesson-c19-9`, `lesson-teaches`:
  **11 files, 96 tests passed** (`.superpowers/p8b/kc2/vitest-regress.log`).
- **Fails, the integrator's (PLAN §5 items 1-2):** `tests/unit/engine-server/p6b-fixed-text.test.ts`, 4 of its 11 tests
  (`.superpowers/p8b/kc2/vitest-p6b.log`), the same four as after P8's key check. Three pin the served SAT R&W lessons at 24 (36 are
  served now, and the English turn's list, 55 against 43). The fourth is real: **`C6/C6-13.json`, `C6-14.json` and `C6-15.json` are not in
  `RESERVE_FILES`** (`src/server/content/bank.ts`), so with them `verified_auto` the C6 practice pool draws the 240 reserve items
  (`pool({ purpose: 'practice', bank: 'C6' })`: 360, not 120). The reserves must be added to `RESERVE_FILES` before this content is
  served. This pass changes no `src/**` code and no test.
- `node .superpowers/p8b/check.mjs a1|a2|a3` now reports each `status: verified_auto` and `key_check_2` as an error (it pins the
  authors' draft state, PLAN §3) and nothing else for a1 and a2. For a3 it also reports "two options are the same" on the 22 Boundaries
  items `C19-se33q1-3`, `C6-se3301` … `se3320` (not `se3316`): its option check strips punctuation, so "plug;", "plug:" and "plug," are
  one option to it. The author's own run before this pass shows the same 22 (`.superpowers/p8b/a3/check-mjs-a3.log`); the options do
  differ (I solved each from its four marks), and the validator's own duplicate check passes them.

## Not done here

- `RESERVE_FILES` (`src/server/content/bank.ts`) does not yet hold `C6-13.json`, `C6-14.json` and `C6-15.json`, and
  `tests/unit/engine-server/p6b-fixed-text.test.ts` does not yet know the 12 lessons (PLAN §5 items 1-2, the integrator's). See
  `C6/RECONCILE-p8b.md`, "Before anything serves them".
- The content `README.md` register rows (C19 batches 19-21; C6 batches 13-15) replacing the "Reserved for phase 3b" line: for the
  integrator, with this file and the authors' ledgers (`.superpowers/p8b/author-1.md` … `author-3.md`).
- The native read of the uz and ru bodies and whys (§9.1 step 5).
