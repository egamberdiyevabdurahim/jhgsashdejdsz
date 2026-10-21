# C7 (and C6): key check 2 of content round 3's IELTS Reading reserve items and the three SAT R&W version-2 items (15 Oct 2026)

Content round 3 (the owner's "content x3-5", 15 Oct 2026; SPEC-lessons rev. 2, §4.5, §9.1, §9.4) gives ten IELTS Reading lessons 20 more
C7 reserve items each, so each draws its test-out, test and homework from 40, and rewrites the three SAT Reading and Writing items that round
2's key check quarantined. Three authors wrote them; P12 blind checkers 1 and 2 (P12ies1, P12ies2) keyed them. This file is checker 2's
record (P12ies2, who ran the reconcile). The round's math families (C1-12, C1-13) have their own record, `C1/RECONCILE-p12.md`.

| File | Commit | Author | Items | Lessons (20 each) |
|---|---|---|---|---|
| `C7/C7-12.json` (batch 12) | `0ea39a14` | `agent:p12-iere-a` | `C7-ia1101` … `ia1120`, `ia1201` … `ia1220`, `ia2101` … `ia2120`, `ia2201` … `ia2220`, `ia3101` … `ia3120` | `C19-IERE01-1`, `IERE02-1`, `IERE02-2` (C19-6), `C19-IERE01-2` (C19-22), `C19-IERE03-1` (C19-7) |
| `C7/C7-13.json` (batch 13) and 12 passages in `C7/passages.json` | `94b44c2d` | `agent:p12-iere-b` | `C7-ir3901` … `ir3920`, `ir4801` … `ir4820`, `ir4901` … `ir4920`, `ir5801` … `ir5820`, `ir5901` … `ir5920` | `C19-IERE03-2`, `IERE04-2` (C19-14), `C19-IERE04-1` (C19-7), `C19-IERE05-1`, `IERE05-2` (C19-22) |
| `C6/C6-20.json`, `C6/C6-21.json` | `1d71e5e9` | `agent:p12-fix3` | version 2 of `C6-se1811`, `C6-se2818` (C6-20) and `C6-ei1807` (C6-21) | none: round 2's integration took them out of their reserves (`C19-RWSE01-3`, `RWSE02-3`, `RWEI01-3`) |

Before this pass all 203 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`: the 200 C7 items version 1, the three C6
items version 2 with version 1's `quarantine_reason` kept as history. 160 C7 items carry their text in the stem; the 40 of IERE03-2 and
IERE04-2 sit on the new passages `C7-P-rd15` … `rd26` (`passage_id`), which the blind copy shows with each item.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P12ies1 (checker 1) | `.superpowers/p12/blind-ie/C7-P12ies1.json` (200 items), `C6-P12ies1.json` (3) | `.superpowers/p12/blind-ie/C7-P12ies1.answers.json`, `C6-P12ies1.answers.json` |
| P12ies2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p12/blind-ie/C7-P12ies2.json` (200 items), `C6-P12ies2.json` (3) | `.superpowers/p12/blind-ie/C7-P12ies2.answers.json`, `C6-P12ies2.answers.json` |

P12ies2's copy: `npx tsx scripts/content/blind.ts C7 P12ies2 --pending --blind <staging>` (225 items: these 200 and the 25 older quarantined
`C7-rs*`) and the same for C6 (3 items); `.superpowers/p12/check-ie-2/filter.cjs` kept only the ids of `C7-12.json`, `C7-13.json` and the
three C6 ids (it reads only the ids) and wrote each copy and its map into `.superpowers/p12/blind-ie/`, unprinted; the staging files were
deleted. A copy holds each item's stem, its passage when it has one, its four options shuffled by the solver's own seed and lettered A-D,
and the lesson's instructions; no key, no `why`. Both solvers' copies, answers and maps sit in the one folder `reconcile.ts` reads.

Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads P12ies1,
P12ies2, `p12-iere-a`, `p12-iere-b` and `p12-fix3` as five agents, so `keyCheckOf("blind:P12ies1+P12ies2", { author })` is
`{ kind: "blind", n: 2 }` for each author. P12ies2 opened neither `.map-*` file, nor the C7-12, C7-13, C6-20 and C6-21 records, nor the
authors' ledgers, sources, logs and tests (`.superpowers/p12/author-*.md`, `iere-a/`, `iere-b/`, `fix3/`, `tests/unit/content/p12-*.test.ts`),
nor checker 1's answers, before it wrote its own: it read each item in its copy (`.superpowers/p12/check-ie-2/dump.cjs` prints the copy as
text), chose a letter, worked every sum, date and word limit by hand, and wrote its answers with a one-line reading per item. One thing it
did see first: the first lines of the fix3 commit message (`git show --stat 1d71e5e9`, run to find the files), which name what version 2
changed in `C6-se1811` (the colon option) and `C6-se2818` (the singular "they"). Its answers to those two are read from the sentences
(notes in its answers file) and agree with checker 1's. Only `reconcile.ts` read the maps.

## The decision

- `npx tsx scripts/content/reconcile.ts C7 P12ies1 P12ies2 --blind .superpowers/p12/blind-ie --write`: **499 items: verified 199,
  quarantine 1, pending 0, blocked 0, skipped 299** (the earlier C7 items: served ones, open prompts, and drafts no solver answered,
  among them the 25 quarantined `C7-rs*`, left as they were).
- `npx tsx scripts/content/reconcile.ts C6 P12ies1 P12ies2 --blind .superpowers/p12/blind-ie --write`: **1440 items: verified 3,
  quarantine 0, pending 0, blocked 0, skipped 1437** (the earlier C6 items).

**Both solvers chose the key on all 203 items.** No answer was stale. P12ies1 raised no flag. P12ies2 raised one, `no_passage_needed` on
`C7-ir4909`, which quarantines it (below). The decisions are kept in `.superpowers/p12/blind-ie/C7-reconcile.json` and `C6-reconcile.json`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **202** | `key_check_2: "blind:P12ies1+P12ies2"`; `key_check_2_version` 1 (the 199 C7 items) or 2 (the three C6 items, whose version 1 `quarantine_reason` stays as history) |
| `quarantine` | **1** | `C7-ir4909`, `key_check_2: null`, with its `quarantine_reason` |

### Counts per lesson

| Lesson | File (C19) | Reserve | New items (C7) | Subskill of the new 20 | Level (new 20) | Text | Verified | Quarantine |
|---|---|---:|---|---|---|---|---:|---:|
| C19-IERE01-1 | C19-6.json | 40 | `C7-ia1101` … `ia1120` (C7-12) | skimming 10, scanning 10 | B1 13, B2 7 | in the stem | 20 | 0 |
| C19-IERE01-2 | C19-22.json | 40 | `C7-ia1201` … `ia1220` (C7-12) | scanning 12, skimming 8 | B1 8, B2 12 | in the stem | 20 | 0 |
| C19-IERE02-1 | C19-6.json | 40 | `C7-ia2101` … `ia2120` (C7-12) | TRUE 7, FALSE 7, NOT GIVEN 6 | B1 14, B2 6 | in the stem | 20 | 0 |
| C19-IERE02-2 | C19-6.json | 40 | `C7-ia2201` … `ia2220` (C7-12) | NOT GIVEN 12, FALSE 8 | B1 14, B2 6 | in the stem | 20 | 0 |
| C19-IERE03-1 | C19-7.json | 40 | `C7-ia3101` … `ia3120` (C7-12) | matching_headings 20 | B1 12, B2 8 | in the stem | 20 | 0 |
| C19-IERE03-2 | C19-14.json | 40 | `C7-ir3901` … `ir3920` (C7-13) | matching_information 20 | B1 10, B2 10 | `C7-P-rd15` … `rd20` | 20 | 0 |
| C19-IERE04-1 | C19-7.json | 40 | `C7-ir4801` … `ir4820` (C7-13) | sentence_completion 10, summary_completion 10 | B1 11, B2 9 | in the stem | 20 | 0 |
| C19-IERE04-2 | C19-14.json | 40 | `C7-ir4901` … `ir4920` (C7-13) | flow_chart_completion 20 | B1 10, B2 10 | `C7-P-rd21` … `rd26` | **19** | **1** (`ir4909`) |
| C19-IERE05-1 | C19-22.json | 40 | `C7-ir5801` … `ir5820` (C7-13) | multiple_choice 11, short_answer 9 | B1 4, B2 11, C1 5 | in the stem | 20 | 0 |
| C19-IERE05-2 | C19-22.json | 40 | `C7-ir5901` … `ir5920` (C7-13) | paraphrase 20 | B1 2, B2 9, C1 9 | in the stem | 20 | 0 |
| **Total** | | | **200** | | | | **199** | **1** |

| C6 item | File | Version | Subskill, level | Result |
|---|---|---:|---|---|
| `C6-se1811` | C6-20.json | 2 | boundaries, C1 | verified_auto, `blind:P12ies1+P12ies2`, `key_check_2_version` 2 |
| `C6-se2818` | C6-20.json | 2 | form_structure_sense, C1 | verified_auto, `blind:P12ies1+P12ies2`, `key_check_2_version` 2 |
| `C6-ei1807` | C6-21.json | 2 | transitions, B2 | verified_auto, `blind:P12ies1+P12ies2`, `key_check_2_version` 2 |

The ten lessons keep their own records (`verified_auto`, unchanged here); only their `reserve` grew, in the authors' commits. With this pass
nine of them hold only served reserve items; `C19-IERE04-2` is held by `unservedOf` for its one quarantined item until the integrator
takes it out of the reserve (39 items) or its author's version 2 is keyed.

### Quarantined: one item

| Item | Lesson | Reason (its `quarantine_reason`) |
|---|---|---|
| `C7-ir4909` | C19-IERE04-2 (flow chart on `C7-P-rd23`, the smokehouse) | **Answerable without its passage.** The step reads "The fish are hung in pairs on rods called ______." with the options speats, sticks, hooks, mackerel. "Rods called ___" asks for a name, and only "speats" is one: mackerel is the fish, hooks are not rods, and "rods called sticks" names nothing, so a test-wise reader picks the key without reading paragraph C. Both solvers chose the key; P12ies2 flagged `no_passage_needed`, and `reconcile.ts` quarantines any flag. A version 2 needs distractors that are names of the same kind (other words the passage or the trade could call rods) or a step that asks for something the stem cannot point to. |

P12ies2 ran the same stem-alone test on every other completion and flow-chart item and found none answerable unread: each blank leaves at
least two options a reader without the text would weigh (custard or honey, steel or copper pot, blanket or towel, salty water or sea water,
frames or moulds, gaps or spaces, wheat starch or rice flour, hemp or linen thread, soft brush or damp cloth), and on `C7-ir4912` the
general-knowledge pick (soap) is not the passage's word (whey).

## What P12ies2 weighed (none a flag)

| Item | The near option | Why the key is the only one |
|---|---|---|
| C7-ia1116 | "twenty minutes" / "about fifty minutes" | the question asks what the tunnel SAVES: about 50 minus 20, about thirty |
| C7-ia1120 | "twenty-four pounds" | eight for the first hour only, five for each after: 8 + 5 + 5 = 18 |
| C7-ia1207 | "140" | 140 at the start of the season, "twenty more have joined since then": 160 now |
| C7-ia1211 | "fifteen kilometres" | 22 minus the 9 of towpath and the 6 of wood: 7 km of farmland |
| C7-ia1212 | "the 7.50" | it also arrives before nine (8.50), but the 8.20 (motorway, 8.55) is the LAST that does |
| C7-ia2102 | "Breakfast is included in the price" | breakfast is served, the price is never given: NOT GIVEN; the minibus makes "walk back" FALSE |
| C7-ia2112 | "The farm's jam is sold in other countries" | "shops across the region" does not rule out abroad: NOT GIVEN; "the farm's own workers pick the rest" makes the higher-branch statement FALSE |
| C7-ia2214 | "closed for about two years" (FALSE) | the key: she came back "for a year", but whether she has left again is not said |
| C7-ia2215 | "Every family is given a free smoke alarm" | alarms are tested free, not given: NOT GIVEN; "Entry is free" makes the paying statement FALSE |
| C7-ir4809 | "empty medicine boxes" | the text's words, but three: over NO MORE THAN TWO WORDS; "medicine boxes" keeps to the limit |
| C7-ir4813 | "noisy cafés" | not a phrase of the text; "all-night cafés" (a hyphenated word is one word) is |
| C7-ir4919 | "linen thread" | the passage says "waxed hemp thread"; "hemp thread" within two words |
| C7-ir5816 | "steam engine drivers" | not the text's words; "retired engine drivers" is, in three words |
| C6-se2818 | "hiker's" | "which all four of them had left": four owners, the plural possessive "hikers'" |

## Uzbek and Russian

**Lint.** After the reconcile and again after the fixes, `.superpowers/p12/check-ie-2/lint.cjs` (round 2's lint: any ' ‘ ’ ` ´ in uz,
U+02BB after a letter other than o/g, U+02BC after o/g, Cyrillic in uz, U+02BB/U+02BC in ru, a `why` over 200 characters, double spaces)
found nothing in either script. What it lists for a reader to judge is the labels the lessons write in English on every uz and ru line:
TRUE / FALSE / NOT GIVEN (the instructions and whys of IERE02-1 and 02-2, as their first 20 have them), the paragraph letters A-E, and
the English words quoted from the text.

**Checker 1's fixes** (`.superpowers/p12/check-ie-1/uz-ru-fixes.json`, sha256 `04be86a5…`, unchanged from its read to the write): **51
fixes on 43 items** (33 of this pass and ten C7-8 companions), each an `old` fragment of one field and its `new` text, no two on the
same field: 22 of a `why.uz`, 9 of a `why.ru`, 20 of an `instructions.ru`. P12ies2 read each against its item (the English `why` and the other language) and applied a fix only when its
`old` occurs in the field exactly once. **Applied: 49** (48 as written, 1 shortened). **Refused: 2.** Script and log:
`.superpowers/p12/check-ie-2/apply-fixes.cjs`, `uz-ru-applied.json`. A `why` and the instructions are no part of what a solver sees (the
blind copy's signature is the stem and the options), so the key checks above hold; no key, stem or option changed.

| Item | Field | Checker 1's reason (abridged) | Result |
|---|---|---|---|
| C7-ia1105 | `why.uz` | «yolgʻiz ishlash» reads "working lonely"; each family on its own is «alohida» | applied |
| C7-ia1108 | `why.uz`, `why.ru` | «jinoyat oʻzgarmadi» is one crime, and «toʻlov» does not say which bill; «звездочёт» is archaic and comic | applied (2) |
| C7-ia1115 | `why.uz` | «Ellik — qoʻshib qoʻyilgan» does not say what was added: fifty adds the eight instead of taking it away | applied |
| C7-ia1119 | `why.uz` | «almashiladi» does not say what is changed; «toʻgʻri poyezd» first reads "the right train" | applied |
| C7-ia1208 | `why.uz` | the sentence had no predicate before the English quote | applied, shortened: checker 1's line is 201 characters, over the 200 the validator and the tests allow; the age as a digit («faqat 8 yosh va undan katta»), as this batch writes ages elsewhere |
| C7-ia1214 | `why.uz`, `why.ru` | «oʻynatmoq» is to amuse a child, a coach puts a player in: «oʻyinga qoʻymoq»; «выпускали всех детей» needs «на поле» | applied (2) |
| C7-ia2106 | `why.uz` | «taqmoq» is for jewellery; chains go on the wheels: «gʻildirakka kiydiriladi» | applied |
| C7-ia2108 | `why.uz` | «osiladi» alone also reads "is hanged"; a framed poem «osib qoʻyiladi» | applied |
| C7-ia2110 | `why.uz` | «Sayr va yangi uy bogʻliq» is too clipped to carry the statement | applied |
| C7-ia2119 | `why.uz` | meaning trap: in a school paper «oʻquvchilar» reads "pupils"; readers are «oʻqirmanlar» | applied |
| C7-ia2202 | `why.uz` | spelling: the case suffix joins the closing quotation mark («by half»ni) | applied |
| C7-ia2203 | `why.uz` | calque of "every second Sunday": «ikki haftada bir» | applied |
| C7-ia2206 | `why.uz` | English left as the subject of an Uzbek sentence: «uning amakisi («her uncle»)» | applied |
| C7-ia2207 | `why.uz` | «vazifani bajarmaydi» reads "do not do their task"; they do not do the homework FOR the younger pupils | applied |
| C7-ia3103 | `why.uz` | «bekat qurgan» says the company built the stop; it built a shelter at it | applied |
| C7-ia3106 | `why.uz`, `why.ru` | meaning trap: «baliq chiqarmoq» reads "take fish out"; «дело» reads "a matter"; stocking rivers is «зарыблять» | applied (2) |
| C7-ir3901 | `why.ru` | register: «канатка», «встаёт» are slang | applied |
| C7-ir3908 | `why.ru` | the two halves did not match, and «старое» is vaguer than "out of date" | applied |
| C7-ir4803 | `why.uz` | no predicate: «mijozlardan» left hanging before the quote | applied |
| C7-ir4817 | `why.uz`, `why.ru` | "tone-deaf" left unquoted and untranslated | applied (2) |
| C7-ir4909 | `why.uz`, `why.ru` | "mackerel" left unquoted | **refused (2)**: the item is quarantined in this pass; its author's version 2 rewrites its why lines with it (checker 1: "apply only if it is kept") |
| C7-ir5806 | `why.uz` | an English verb phrase as the object of «qilmoq» | applied |
| C7-ir5912 | `why.uz`, `why.ru` | the text says "without serious accident", not "no accident" | applied (2) |
| C7-ir5916 | `why.ru` | the collective «двое» is for people, not shops | applied |
| C6-se2818 | `why.uz` | the v2 uz line dropped the sentence on "hiker's" (one owner) that the en and ru lines carry | applied |
| C7-ia1111 … ia1120 | `instructions.ru` | «деталь … сказана» is unidiomatic: «выражена» (the line P10ies1 fixed on C7-11 in round 1) | applied (10) |
| C7-ir1111 … ir1120 (C7-8) | `instructions.ru` | not new lines: the first-20 companions of ia1111 … ia1120, whose instructions `p12-iere-a.test.ts` pins equal to theirs | applied (10) |

The last row touches the one file outside this pass, `C7/C7-8.json`: ten served items of `C19-IERE01-1`, the ru instructions line only.
C7-8 is not in the `JSON.stringify(…, null, 2)` form (its numbers), so it got a text edit of that one JSON string, ten times, checked to
parse to exactly the edited document (`git diff --numstat`: 10 lines in, 10 out). Their key checks and statuses are untouched.

Left for the author (not uz or ru, so not changed here): `C7-ir5912`'s English `why` says "There were no accidents"; the text says
"without serious accident", which the fixed uz and ru lines now say.

## What the write changed

`reconcile.ts --write` re-serialises each file it touches; C7-12, C7-13, C6-20 and C6-21 are in their own `JSON.stringify(…, null, 2)`
form, so nothing else in them moved. Against `HEAD`, the 202 verified items differ in `status`, `key_check_2` and the new
`key_check_2_version`; `C7-ir4909` in `status` and the new `quarantine_reason` (`key_check_2` stays null). 32 items of this pass (and the
ten C7-8 companions) also differ in the 49 uz and ru strings above. Each key, option, stem, passage, English `why`, level and version is as the
author wrote it. The `note` of each of the four files now says what key check 2 found (a text edit of the note only,
`.superpowers/p12/check-ie-2/notes.cjs`). Checked by `.superpowers/p12/check-ie-2/diffcheck.cjs`, which diffs every item of the five files
against `HEAD`: 0 problems; LF, no BOM. No C19 file and no passage is touched by this pass.

## Checks after the write and the fixes

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings** (the base's count), 287 notes (the base's
  285 and two more `file.skipped`: the math checkers' `C1/RECONCILE-p12.md` and this file); no finding on C7-12, C7-13, the new passages,
  C6-se1811, se2818, ei1807 or the ten C7-8 items (`.superpowers/p12/check-ie-2/logs/validate-2.log`, `validate-3.log`).
- `npx tsx scripts/content/counted-nouns.ts`: exit 0, 233 C1 families and 800 C18 items, 0 flagged (`counted-nouns-2.log`).
- The authors' tests, one process, `ANTHROPIC_API_KEY` empty (`vitest-2.log`): `p12-iere-a` 11 pass, 1 skipped (its practice-pool test,
  until C7-12 is in `RESERVE_FILES`); `p12-fix3` 8 pass; `p12-math-a` 8 and `p12-math-b` 8 pass; `p12-iere-b` 10 pass, **1 fails by
  design**: its guard "no practice pool draws them; none is verified before C7-13 is a reserve file" now finds the C7 practice pool
  drawing the 99 verified C7-13 items, because `C7/C7-13.json` is not yet in `RESERVE_FILES` (the same holds for C7-12's 100, which
  iere-a's skipped test would catch). Before this pass the three authors' files passed 30 tests, 1 skipped (`vitest-base.log`).
- Two authors' tests pinned the as-written state and were made to read both states (the precedent of `p10-iewr.test.ts` and, this round,
  `p12-math-b.test.ts`): `p12-fix3.test.ts` (a draft with no key check 2, or `verified_auto` with a blind check of two agents and
  `key_check_2_version` 2; `blind.ts --pending` takes every one still a draft and leaves out the keyed ones) and `p12-iere-b.test.ts`
  (a quarantined item holds no key check 2 and a reason).
- Related tests (`vitest-related.log`, 11 files): `blind`, `c19-loader`, `committed-content`, `keycheck`, `lessons-course`,
  `no-content-leak`, `reconcile`, `p6-subject`, `p7-quiz-view`, `p7-quiz-view-pages` pass. `p6b-fixed-text` fails 4, as it did before
  this pass on the authors' reserve appends (`.superpowers/p12/iere-a/logs/vitest-p6b.log`: 4 failed): it pins 20-item IELTS reserves
  and all ten IELTS Reading lessons served (now 9: IERE04-2 is held for `C7-ir4909`), the catalogue and English-turn lists that go
  with them, and the three C6 items as `quarantine` or `draft` out of every reserve (now `verified_auto`).

## For the integrator (not changed here)

- `RESERVE_FILES` (`src/server/content/bank.ts`) must gain `C7/C7-12.json` and `C7/C7-13.json`. Until it does, the C7 practice pool draws
  these 199 verified items as practice items (`p12-iere-b`'s guard fails on it; `p12-iere-a`'s practice-pool test runs once C7-12 is listed).
- `C7-ir4909`: take it out of `C19-IERE04-2`'s reserve (39 items, as round 2 did with its three) so the lesson is not held, or have
  `agent:p12-iere-b` write a version 2 for a fresh key check 2.
- `C6-se1811`, `C6-se2818` and `C6-ei1807` (version 2) are `verified_auto` and in no reserve: put each back into its lesson's reserve
  (`C19-RWSE01-3`, `RWSE02-3`, `RWEI01-3`, now 39 each) if those lessons should draw from 40 again.
- `tests/unit/engine-server/p6b-fixed-text.test.ts` needs the new sizes and states: 40-item IELTS Reading reserves (39 for IERE04-2 if
  ir4909 is taken out), the served lesson lists, and the three C6 items keyed.
