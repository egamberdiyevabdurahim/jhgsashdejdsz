# C6: key check 2 of content round 2's SAT Reading and Writing reserve items, pair "a" (15 Oct 2026)

Content round 2 (the owner's "content x3-5", 15 Oct 2026; SPEC-lessons rev. 2, §3.3, §4.5, §9.1-§9.4) gives lessons 2 and 3 of each of
the twelve SAT Reading and Writing units 20 more C6 reserve items, so each of those 24 lessons draws its test-out, test and homework from
40 (its first 20 and these 20). Four authors wrote them. This file is pair "a": the 240 items of authors cs and ii, keyed by P11 blind
checkers P11as1 and P11as2. Pair "b" (authors se and ei, `C6-20.json`, `C6-21.json`) is keyed by its own checkers and has its own
record. No piece question, lesson or passage is new in this round: the C19 edits only append the 20 ids to each lesson's `reserve`.

| File | Commit | Author | Items | Lessons (20 each) |
|---|---|---|---|---|
| `C6-18.json` (batch 18) | `62029c49` | `agent:p11-cs` | `C6-cs1701` … `cs1720`, `cs1801` … `cs1820`, `cs2701` … `cs2720`, `cs2801` … `cs2820`, `cs3701` … `cs3720`, `cs3801` … `cs3820` | `C19-RWCS01-2`, `RWCS01-3`, `RWCS02-2`, `RWCS02-3` (C19-15), `C19-RWCS03-2`, `RWCS03-3` (C19-20) |
| `C6-19.json` (batch 19) | `a366a740`, `48e5f70c` | `agent:p11-ii` | `C6-ii1701` … `ii1720`, `ii1801` … `ii1820`, `ii2701` … `ii2720`, `ii2801` … `ii2820`, `ii3701` … `ii3720`, `ii3801` … `ii3820` | `C19-RWII01-2`, `RWII01-3`, `RWII02-2`, `RWII02-3` (C19-16), `C19-RWII03-2`, `RWII03-3` (C19-20) |

Before this pass all 240 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`; none has a `passage_id`
(each text, table or described graph is in its stem). The twelve lessons' reserves hold 480 ids (their first 20 and these 240); each new id
is in exactly one lesson's reserve.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P11as1 (checker 1) | `.superpowers/p11/blind-a/C6-P11as1.json` (240 items) | `.superpowers/p11/blind-a/C6-P11as1.answers.json` |
| P11as2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p11/blind-a/C6-P11as2.json` (240 items) | `.superpowers/p11/blind-a/C6-P11as2.answers.json` |

P11as2's copy: `npx tsx scripts/content/blind.ts C6 P11as2 --pending --blind <staging>` gave the 480 items without two checks (pair a's
240 and pair b's 240; the 960 earlier C6 items were left out as two-checked); `.superpowers/p11/check-a-2/filter.cjs` kept only the ids of
`C6-18.json` and `C6-19.json` (it reads only the ids) and wrote the copy and its map into `blind-a/`, unprinted; the staging files were
deleted. A copy holds each item's stem and its four options, shuffled by the solver's own seed and lettered A-D, with the lesson's
instructions; no key, no `why`. Both solvers' copy, answers and map sit in ONE folder, `.superpowers/p11/blind-a/`, from the start (round 1
found that `reconcile.ts` reads every solver from one `--blind` folder).

Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads
P11as1, P11as2, `p11-cs` and `p11-ii` as four agents, so `keyCheckOf("blind:P11as1+P11as2", { author })` is `{ kind: "blind", n: 2 }` for
both authors. P11as2 opened neither `.map-*` file, nor the C6-18 and C6-19 records, nor the authors' ledgers, sources, logs and tests
(`.superpowers/p11/author-*.md`, `cs/`, `ii/`, `tests/unit/content/p11-*.test.ts`), nor checker 1's answers, before it wrote its own; it
read each item in its copy, chose a letter, worked every table and described graph by hand (the differences, sums and shares in the keys
below), and wrote its answers file, with a one-line reading per item. Only `reconcile.ts` read the maps. After its answers were written,
P11as2 read the items' `why` lines (for the uz/ru fixes) and the authors' tests (for what a fix must keep).

## The decision

`npx tsx scripts/content/reconcile.ts C6 P11as1 P11as2 --blind .superpowers/p11/blind-a --write` gave **1440 items: verified 240,
quarantine 0, pending 0, blocked 0, skipped 1200.** The 1200 skipped are the 960 earlier C6 items, already `verified_auto` (C6-1 … C6-17),
and pair b's 240 (C6-20, C6-21: "0 blind solvers answered it"; untouched by this write). **Both solvers chose the key on all 240.** No
answer was stale, and neither answers file raises `two_defensible`, `unanswerable` or `no_passage_needed`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **240** | `key_check_2: "blind:P11as1+P11as2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | **0** | none |

By level (verified/written): easy 36/36, medium 96/96, hard 108/108. The decisions are kept in `.superpowers/p11/blind-a/C6-reconcile.json`.

**Quarantined: none.** No item drew a disagreement, a second defensible option or a flag from either solver, so there is no quarantine
reason to record. No item has a `passage_id`, so no no-passage solver applies; P11as2 found none answerable from its question and options
alone (every key needs the item's own text, table or graph).

### Counts per lesson

| Lesson | File (C19) | Reserve | New items (C6) | Subskill of the new 20 | Easy/medium/hard (new 20) | Verified | Quarantine |
|---|---|---:|---|---|---|---:|---:|
| C19-RWCS01-2 | C19-15.json | 40 | `C6-cs1701` … `cs1720` (20, C6-18.json) | words_in_context 20 | 5/9/6 | 20 | 0 |
| C19-RWCS01-3 | C19-15.json | 40 | `C6-cs1801` … `cs1820` (20, C6-18.json) | words_in_context 20 | 2/8/10 | 20 | 0 |
| C19-RWCS02-2 | C19-15.json | 40 | `C6-cs2701` … `cs2720` (20, C6-18.json) | text_structure_purpose 20 | 5/9/6 | 20 | 0 |
| C19-RWCS02-3 | C19-15.json | 40 | `C6-cs2801` … `cs2820` (20, C6-18.json) | text_structure_purpose 20 | 2/8/10 | 20 | 0 |
| C19-RWCS03-2 | C19-20.json | 40 | `C6-cs3701` … `cs3720` (20, C6-18.json) | cross_text_connections 20 | 2/8/10 | 20 | 0 |
| C19-RWCS03-3 | C19-20.json | 40 | `C6-cs3801` … `cs3820` (20, C6-18.json) | cross_text_connections 20 | 2/6/12 | 20 | 0 |
| C19-RWII01-2 | C19-16.json | 40 | `C6-ii1701` … `ii1720` (20, C6-19.json) | central_ideas_details 20 | 5/9/6 | 20 | 0 |
| C19-RWII01-3 | C19-16.json | 40 | `C6-ii1801` … `ii1820` (20, C6-19.json) | central_ideas_details 20 | 2/8/10 | 20 | 0 |
| C19-RWII02-2 | C19-16.json | 40 | `C6-ii2701` … `ii2720` (20, C6-19.json) | command_of_evidence_textual 20 | 5/9/6 | 20 | 0 |
| C19-RWII02-3 | C19-16.json | 40 | `C6-ii2801` … `ii2820` (20, C6-19.json) | command_of_evidence_quantitative 20 | 2/8/10 | 20 | 0 |
| C19-RWII03-2 | C19-20.json | 40 | `C6-ii3701` … `ii3720` (20, C6-19.json) | inferences 20 | 2/8/10 | 20 | 0 |
| C19-RWII03-3 | C19-20.json | 40 | `C6-ii3801` … `ii3820` (20, C6-19.json) | inferences 20 | 2/6/12 | 20 | 0 |
| **Total** | | | **240** | | | **240** | **0** |

Each lesson's reserve is its first 20 and the 20 new ids, in that order; each new id is in exactly one lesson's reserve. The lessons' own
records are unchanged by this pass (all twelve `verified_auto`; RWCS01-02 and RWII01-02 `blind:P8s1+P8s2`, RWCS03 and RWII03
`blind:P8bs1+P8bs2`); only their `reserve` grew, in the authors' commits.

### What the write changed

`--write` re-serialises each file it touches. Against `HEAD` (`62029c49`), each of the 240 items differs in exactly `status`, `key_check_2`
and the new `key_check_2_version` (and, in 47 of them, the 51 `why.uz` and `why.ru` strings fixed below); its key, options, stem, English
`why` and version are as the author wrote them. The `note` of each file now says the key check is done (a text edit of the note only).
Checked by `.superpowers/p11/check-a-2/diffcheck.cjs`, which diffs every item against `HEAD`: 0 problems; LF, no BOM, the files' own
`JSON.stringify(…, null, 2)` form. Pair b's files (`C6-20.json`, `C6-21.json`) and every C19 file are untouched by this pass.

## What P11as2 weighed (none a flag)

| Item | The near option | Why the key is the only one |
|---|---|---|
| C6-cs1713 | "safe" | "far less ___" after "Thanks to": far less safe would be bad news; only "risky" keeps the good news |
| C6-cs1809 | "unbearable" | the report "did not claim that students hate their homework"; "burdensome" is the measured word, "unbearable" as strong as "hate" |
| C6-cs1814 | "completely hidden" | the views are "partly blocked" and "pleasant enough": unremarkable, not hidden |
| C6-cs2708 | "It reveals the people for whom the loaves are kept." | that is the third sentence; the second ("never sells them, even when …") stresses how firmly she keeps them |
| C6-cs2711 | "It explains why the festival is held in early May." | that is the third sentence ("For this reason …"); the second says what too little or too much wind does |
| C6-cs2718 | "It rejects the visitor figure …" | the sentence says "The number is accurate": it grants the figure and doubts what it shows |
| C6-cs2816 | "To argue that the lunch break should be made longer" | the text argues only against shortening it |
| C6-ii2701 | "Hay spread on the floor … gets trodden on and dirty" | a reason the rabbit might eat more from the rack, not a finding that it does; only the day-by-day comparison supports the claim |
| C6-ii2717 | "a street that got speed bumps but no new lights …" | that would weaken the claim; the street with the same lights and no bumps, where cars stayed fast, is what rules the lights out |
| C6-ii2813 | "it shrank 80 mm per meter in the hot wash, more than either of the other two" | true, but the claim is about the temperature's effect: only the warm-to-hot change (65 against 25 and 20) shows it |
| C6-ii2814 | "Wednesday … sold 5 umbrellas" | the table says 2; Wednesday (rainy) sold fewer than dry Thursday (5) and dry Monday (3) |
| C6-ii2815 | "12 of 20 against 8 of 48" | the numbers are swapped: robotics lost 12 of 48 (25 %), theater 8 of 20 (40 %) |
| C6-ii3803 | "the gas was on as usual" | the bakery bakes "unless the gas supply is cut off", and gas is cut "only when the pipes are being repaired" |
| C6-ii3809 | "will be shown if both judges from her school vote for it" | no judge may vote for a student of his or her own school: one vote is left, two are needed |
| C6-ii3816 | "it must have fallen below zero" | the rule says every freezing night means indoors, not that indoors means a freezing night: the text leaves the temperature open |
| C6-ii3819 | "had earned three badges" | 14 books are two badges (one per five); three badges need 15 |
| C6-ii2804, ii2806 … ii2820 | (the claim or the sentence before the blank) | as on the real test, the claim or the turn word narrows the choice and the table or graph decides it; every number in each key was checked against its table by hand (9, 11, 11, 9; 24 and 6; 220 and 230; 8 cm a month; 180 to 60; 65, 25, 20; 25 % and 40 %; 60 and 60; 8 and 5 per 1,000) |

## Uzbek and Russian

**Lint.** After the reconcile and again after the fixes, a lint over every uz and ru string of C6-18 and C6-19 (each `why` and
`instructions`: any ' ‘ ’ ` ´ in uz, U+02BB after a letter other than o/g, U+02BC after o/g, Cyrillic in uz, Latin outside quotation
marks in ru, a `why` over 200 characters; `.superpowers/p11/check-a-2/lint.cjs`) found nothing in Uzbek script. What it raises is the same
before and after the fixes: in the 40 cross-text items `C6-cs3701` … `cs3820`, the bare labels "Text 1" and "Text 2" on the uz and ru lines
(80 lines), which is the form of these lessons' own first 20 (`C6-14.json`, 39 items; and `C6-7.json`, 14), so it was left as the
lessons write it; and the group and printer letters A and B in four ru lines of `C6-ii2808`, `ii2809`, `ii2820`, `ii3711` (labels from the
table, not English words).

**Checker 1's fixes** (`.superpowers/p11/check-a-1/uz-ru-fixes.json`): 51 fixes, 33 of a `why.uz` and 18 of a `why.ru`, 28 fields of 26
items in C6-18 and 23 fields of 21 items in C6-19 (no two fixes on the same field). Every fix's `old` matched the current text exactly.
P11as2 read each against its item and agrees with all 51: they repair meaning traps (Uzbek «mashina» alone read as "car", «qoʻl
siltamoq» a dismissive wave, «shoshilinch» "urgent" for "premature", «sanalab» "counting" for "dated", «muzlatgich» the everyday word for the
fridge where the freezer is meant, «yassi non» a kind of flatbread, «yoqqan» "liked/lit" for rain that fell, «taʼmirlangan» "had been
repaired" where the key turns on "were being repaired"; Russian «Прогноз, опровергающий его итог», which reversed the relation, «Предложение»
read as "sentence" in a lesson that numbers its sentences), verbless clauses, wrong cases and bare English verb phrases. Before reading
checker 1's file, P11as2 had marked seven of these in its own read (cs1716, cs1802, cs1815, cs2717, cs2813 ru, cs3702 ru, ii1819); all seven
are in it. **Applied: 51 (47 as written, 4 with one change). Refused: 0.** Three applied fixes would have put a uz `why` over the
200-character limit (`limit.why`; the authors' tests pin at most 200 and no finding on C6-18 and C6-19), so each was applied with one
change that keeps checker 1's correction: `C6-cs3717` without the English «racks» after its new Uzbek gloss (204 → 194 characters),
`C6-cs3720` with the added verb as «…, deydi» (215 → 198), `C6-ii1716` without the English «tipped them back into the box» after its new
Uzbek verb (215 → 181). The fourth, `C6-ii1819`, quotes checker 1's added English word as «freezer», as every English word on a uz line is
quoted (175). The script and its log: `.superpowers/p11/check-a-2/apply-fixes.cjs`, `uz-ru-applied.json`. A `why` is no part of what a
solver sees (the blind copy's signature is the stem and the options), so the key check recorded for version 1 still holds; no key, stem or
option changed. The native read of uz and ru (§9.1 step 5) is still to do.

| # | Item | Field | Checker 1's reason | Result |
|---:|---|---|---|---|
| 0 | C6-cs1704 | `why.uz` | «mashina» on its own reads as "car"; a washing machine is «kir (yuvish) mashinasi». | applied |
| 1 | C6-cs1716 | `why.uz` | «matnni» reads as "the text" (the passage itself); the narration of a film is «diktor matni». | applied |
| 2 | C6-cs1802 | `why.uz` | «qoʻl siltamoq» is a dismissive wave (to give up on someone); waving goodbye is «qoʻl silkitmoq». Meaning trap. | applied |
| 3 | C6-cs1806 | `why.uz` | «yaxshi» (good) overstates the mild verdict the item turns on (not a triumph, not a failure); «durust» is the modest word (ru already has «неплохое начало»). | applied |
| 4 | C6-cs1809 | `why.uz` | «oʻlchovli» means "metered, having a measure": a calque of "measured". The sense is a word of moderate strength. | applied |
| 5 | C6-cs1813 | `why.uz` | «qismni soʻraydi» reads "asks for the part/portion"; she asks the orchestra to play the passage again. | applied |
| 6 | C6-cs1815 | `why.uz` | «shoshilinch» means "urgent", not "premature". Meaning trap on the gloss of the key. | applied |
| 7 | C6-cs2716 | `why.ru` | «улика» is evidence against a suspect (criminal); evidence from a dig is «свидетельство». | applied |
| 8 | C6-cs2717 | `why.uz` | «sanalab» (from «sanamoq») reads "counting"; dated drawings are «sana qoʻyilgan». Meaning trap. | applied |
| 9 | C6-cs2801 | `why.ru` | Dative «кошкам» with «о хозяевах» is a mixed, ungrammatical construction. | applied |
| 10 | C6-cs2812 | `why.uz` | The locative is missing («yakshanbada»); as written it is ungrammatical. | applied |
| 11 | C6-cs2813 | `why.ru` | As written the PREDICTION refutes the outcome: the relation is reversed. The outcome went against the prediction. | applied |
| 12 | C6-cs2816 | `why.ru` | In this lesson «Предложение» is "sentence" (Предложение 1, 2, 3), so "proposal" reads as "sentence"; and «утверждении» is the wrong case after "rests on" (на + accusative). | applied |
| 13 | C6-cs2819 | `why.uz` | «muzlagan havo» is "frozen air"; freezing, frosty air is «ayozli havo». | applied |
| 14 | C6-cs3702 | `why.uz` | «ignabarglar» are conifers (the trees), not the needles they drop. | applied |
| 15 | C6-cs3702 | `why.ru` | «упущенная цена» reads "a missed/lost price"; the sense is a cost Text 1 left out. | applied |
| 16 | C6-cs3703 | `why.uz` | «belgi» is a mark, symbol or symptom; a shop sign is «peshlavha». «mumkin sababi» is not idiomatic: «ehtimoliy sababi». | applied |
| 17 | C6-cs3704 | `why.uz` | The reported clause has no verb. | applied |
| 18 | C6-cs3705 | `why.ru` | «голос дала группа» is not idiomatic. | applied |
| 19 | C6-cs3706 | `why.ru` | «упущенная цена» reads "a missed/lost price"; the sense is a cost Text 1 ignores. | applied |
| 20 | C6-cs3709 | `why.uz` | «bir haftalik termometr» reads "a one-week thermometer"; the text means a week of measuring. | applied |
| 21 | C6-cs3711 | `why.uz` | «qabul joyi» alone is "a reception place"; the recycling yard is «chiqindi qabul punkti». | applied |
| 22 | C6-cs3717 | `why.uz` | A bare English «racks» as the subject, with no gloss (ru has «сушилки»). | applied, changed: shortened to the limit: the Uzbek words for the racks stand without the English «racks» |
| 23 | C6-cs3720 | `why.uz` | The clause has no verb. | applied, changed: shortened to the limit: the added verb as «…, deydi» instead of «kelib chiqishini aytadi» |
| 24 | C6-cs3802 | `why.ru` | «возразить в этом» is ungrammatical. | applied |
| 25 | C6-cs3805 | `why.ru` | The clause has no verb. | applied |
| 26 | C6-cs3811 | `why.uz` | Drops "as much": the key turns on HOW MUCH one exam should count, not on whether year marks count at all. | applied |
| 27 | C6-cs3811 | `why.ru` | Drops "as much": the key turns on HOW MUCH one exam should count, not on whether year marks count at all. | applied |
| 28 | C6-ii1714 | `why.ru` | «время не поменялось местами» is not idiomatic; what did not swap is opening and closing times (morning and evening). | applied |
| 29 | C6-ii1715 | `why.uz` | «past kanal» reads "a low (short) canal"; the canal's water runs lower. | applied |
| 30 | C6-ii1715 | `why.ru` | «низкий канал» reads as a canal that is low in height; the water in it is low. | applied |
| 31 | C6-ii1716 | `why.uz` | The first clause has no Uzbek verb (an English verb phrase stands in for it), and the second quote has no gloss. | applied, changed: shortened to the limit: the Uzbek verb stands without the English «tipped them back into the box» |
| 32 | C6-ii1716 | `why.ru` | The first clause has no Russian verb (an English verb phrase stands in for it). | applied |
| 33 | C6-ii1720 | `why.uz` | «Boʻyoq tomchilayotgan» reads "dripping paint"; it is water dripping from the gutter. | applied |
| 34 | C6-ii1818 | `why.uz` | «urugʻ» alone is seed for sowing; roasted sunflower seeds sold at a bus stop are «pista». | applied |
| 35 | C6-ii1819 | `why.uz` | «muzlatgich» is the everyday word for the refrigerator itself, so the line reads "the fridge is for longer keeping": the opposite of the item. The freezer is «muzlatish kamerasi». | applied, changed: the English word quoted «freezer», as on every uz line |
| 36 | C6-ii2701 | `why.uz` | «tokcha» is a wall niche or small shelf; a hay rack is «oxur» (one hung above the floor: «osma oxur»). | applied |
| 37 | C6-ii2705 | `why.uz` | The last clause has no verb. | applied |
| 38 | C6-ii2710 | `why.uz` | «mashina» reads as "car"; "machines" (the tractor) is «texnika». | applied |
| 39 | C6-ii2720 | `why.ru` | «сходится с заморозком» is not idiomatic; it fits the frost explanation. | applied |
| 40 | C6-ii2805 | `why.uz` | «almashinuv» is an exchange or alternation, not a reversal. | applied |
| 41 | C6-ii2809 | `why.uz` | «burchaksiz sinf» reads "a classroom without corners"; it is the class without the reading corner. | applied |
| 42 | C6-ii2814 | `why.uz` | «yomgʻir yogʻib 2 ta sotilgan» ("having rained, 2 were sold") loses the contrast the item turns on. | applied |
| 43 | C6-ii2820 | `why.ru` | «считают на страницы» is not idiomatic. | applied |
| 44 | C6-ii3711 | `why.ru` | Before «всех» the preposition is «обо». | applied |
| 45 | C6-ii3713 | `why.ru` | Before «всех» the preposition is «обо». | applied |
| 46 | C6-ii3802 | `why.uz` | «yoqqan» is from «yoqmoq» (to like / to light): rain is «yogʻgan». And the first clause had two subjects («yomgʻir … suv bosadi»). | applied |
| 47 | C6-ii3803 | `why.uz` | «taʼmirlangan» is "had been repaired"; the key is that the pipes were BEING repaired that morning. «pishmagan» is "did not get cooked"; no samsa was baked: «pishirilmagan». | applied |
| 48 | C6-ii3812 | `why.uz` | «koʻylakni oʻzi tikkan» says she sewed the whole dress; the text only shows new stitches on the hem. | applied |
| 49 | C6-ii3813 | `why.ru` | The fragment is incomplete («— слишком»). | applied |
| 50 | C6-ii3820 | `why.uz` | «yassi non» is a kind of flatbread; the loaves failed to rise. | applied |

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings, 280 notes**, no finding on C6-18, C6-19 or
  their ids, after the reconcile (`.superpowers/p11/check-a-2/validate-1.log`) and again after the fixes (`validate-2.log`).
- The authors' tests `tests/unit/content/p11-cs.test.ts` and `p11-ii.test.ts`: **18 of 18 pass** after the reconcile (`vitest-1.log`) and
  after the fixes (`vitest-2.log`). Their "today" test now finds none of the twelve lessons held.
- Related tests, run after the reconcile (`vitest-related.log`; 11 files, 108 tests): `committed-content`, `no-content-leak`, `keycheck`,
  `reconcile`, `blind`, `p10-rw1` and `p7-unit-test` pass. 13 fail in four files, all pins that predate this pass, none from it: in
  `p8-a1-rw-craft-lessons` (2), `p8-a2-rw-ideas-lessons` (2) and `p8b-a2-rw-cross-inference-lessons` (4), each lesson 2 and 3 reserve is
  pinned at exactly its first 20 C6 ids and looked up only there (the authors' reserve appends, 20 → 40); in `p6b-fixed-text` (5), each
  reserve is pinned at 20 (40 only for a lesson 1), the practice pool's reserve exclusion at C6-7..17, and the 36 SAT R&W lessons served
  and in the catalogue and the English turn: the twelve lessons the diffs still show held or missing are pair b's (`C19-RWSE01-2` … `RWSE03-3`, `C19-RWEI01-2` … `RWEI03-3`), whose 240 items
  are not yet keyed; none of pair a's twelve is held now.

## For the integrator (not changed here)

- `RESERVE_FILES` (`src/server/content/bank.ts`) must gain `C6/C6-18.json` and `C6/C6-19.json` (and pair b's `C6-20.json`,
  `C6-21.json` once keyed). Until it does, the C6 practice pool draws these 240 verified items as practice items, as between P8's and
  P8b's key checks and their integrations.
- `tests/unit/engine-server/p6b-fixed-text.test.ts` pins each lesson 2 and 3 reserve at 20 items and the reserve-file practice
  exclusion at C6-7..17; both need the new sizes (40 per lesson 2 and 3 reserve; the reserve files above).
- `tests/unit/content/p8-a1-rw-craft-lessons.test.ts`, `p8-a2-rw-ideas-lessons.test.ts` and `p8b-a2-rw-cross-inference-lessons.test.ts`
  pin each lesson 2 and 3 reserve at exactly its first 20 ids; they are 40 since the authors' commits (`62029c49`, `a366a740`), not since
  this pass.
- The native read of uz and ru (§9.1 step 5) for these 240 items, including whether the cross-text items keep the bare "Text 1" and
  "Text 2" on their uz and ru lines, as their lessons' first 20 do.

## The 240 keys

Each lesson's 20 new items, the key (options[0]), each solver's verdict from the decisions log, and P11as2's own reading from its answers
file (written blind).

#### C19-RWCS01-2 (C6-18.json; words_in_context; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs1701 | easy | easy | key | key | large clear color areas, done in under an hour: easy |
| C6-cs1702 | easy | early | key | key | sold out before nine, no second batch: arrive early |
| C6-cs1703 | easy | active | key | key | ninety yet walks to the bazaar and gardens: active |
| C6-cs1704 | easy | noisy | key | key | shook the bathroom, heard from the street: noisy |
| C6-cs1705 | easy | canceled | key | key | every road closed, students stayed home: bus canceled |
| C6-cs1706 | medium | flawless | key | key | nevertheless, no late entry, every note in tune: flawless |
| C6-cs1707 | medium | poorly built | key | key | cheap, fast, doors stick, walls crack: poorly built |
| C6-cs1708 | medium | improvise | key | key | unlike the rehearsing sister, makes it up as he goes: improvise |
| C6-cs1709 | medium | illegible | key | key | usually neat, this one scribbled in a hurry: illegible |
| C6-cs1710 | medium | good-natured | key | key | even so, never raise voices, tea by evening: good-natured |
| C6-cs1711 | medium | grueling | key | key | however, scramble over loose rocks: grueling |
| C6-cs1712 | medium | hesitant | key | key | never built anything, then could talk of nothing else: at first hesitant |
| C6-cs1713 | medium | risky | key | key | the light removed the speeding-car danger: far less risky |
| C6-cs1714 | medium | wary | key | key | seemed strict at first, later found her warm: wary of her |
| C6-cs1715 | hard | arbitrary | key | key | taken for a whim, yet the slope feeds a tank: hardly arbitrary |
| C6-cs1716 | hard | heavy-handed | key | key | explains every scene, tells viewers what to feel: heavy-handed |
| C6-cs1717 | hard | persistent | key | key | dozens of failures per success, not luck: persistent effort |
| C6-cs1718 | hard | unyielding | key | key | polite but final, no appeal considered: unyielding |
| C6-cs1719 | hard | admiration | key | key | whistled last season, now reliable saves: admiration |
| C6-cs1720 | hard | guarded | key | key | not outright praise, promising but with faults: guarded |

#### C19-RWCS01-3 (C6-18.json; words_in_context; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs1801 | easy | starving | key | key | not just hungry, ate three bowls: starving |
| C6-cs1802 | easy | timid | key | key | quiet with strangers, not unfriendly, smiles from behind mother: timid |
| C6-cs1803 | medium | decent | key | key | not bad, not memorable, honest but kind: decent |
| C6-cs1804 | medium | startled | key | key | looked up, not frightened, went back to work: startled |
| C6-cs1805 | medium | urged | key | key | did not order, explained the reason: urged |
| C6-cs1806 | medium | a fair start | key | key | not a disaster, nobody wanted seconds, grandmother kind: a fair start |
| C6-cs1807 | medium | exhausted | key | key | others merely tired; he lay down and did not move for an hour: exhausted |
| C6-cs1808 | medium | sturdy | key | key | not luxurious, thick planks on iron, last for years: sturdy |
| C6-cs1809 | medium | burdensome | key | key | not hate; tasks take most of Sunday: burdensome (unbearable too strong) |
| C6-cs1810 | medium | firm | key | key | not rude, but at once, a voice that left no room: firm |
| C6-cs1811 | hard | promising | key | key | not a masterpiece, vivid chapters hint at later books: promising |
| C6-cs1812 | hard | unverified | key | key | interesting but impossible to confirm: unverified |
| C6-cs1813 | hard | insistence | key | key | asks for the passage again and again, quietly: insistence |
| C6-cs1814 | hard | unremarkable | key | key | cooler than breathtaking, pleasant enough but partly blocked: unremarkable |
| C6-cs1815 | hard | premature | key | key | does not dispute the result, too few seedlings and one measurement: premature |
| C6-cs1816 | hard | frosty | key | key | never a real quarrel, a few cool words: frosty |
| C6-cs1817 | hard | reserved | key | key | speaks little, rarely smiles, yet kind to a child: reserved |
| C6-cs1818 | hard | marginal | key | key | absences fell slightly, too little to be sure: marginal |
| C6-cs1819 | hard | one-sided | key | key | admiration for builders, passes over the prison years: one-sided |
| C6-cs1820 | hard | imprecise | key | key | a handful, enough salt; she weighs to the gram: imprecise |

#### C19-RWCS02-2 (C6-18.json; text_structure_purpose; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs2701 | easy | It explains why making the jam takes so long. | key | key | hard and sour, so cooked slowly for hours: why it takes so long |
| C6-cs2702 | easy | It describes how the class kept its diary. | key | key | each morning one student wrote the temperature and drew the sky: how the diary was kept |
| C6-cs2703 | easy | It explains what the object discussed in the rest of the text is. | key | key | first sentence defines a samovar, the object of the rest |
| C6-cs2704 | easy | It presents a goal and an obstacle to reaching it. | key | key | wanted to join (goal), shortest boy (obstacle) |
| C6-cs2705 | easy | It explains how the sparrows get through the winter. | key | key | seeds at the bazaar, shelter under bakery roofs: how sparrows get through winter |
| C6-cs2706 | medium | It gives examples of the custom introduced in the first sentence. | key | key | one cup, five cups: examples of the custom |
| C6-cs2707 | medium | It describes a step to test a suspicion before acting on it. | key | key | camera before accusing anyone: a step to test a suspicion |
| C6-cs2708 | medium | It stresses how firmly she keeps the loaves aside. | key | key | never sells them even with a long line and the rest gone: how firmly she keeps them |
| C6-cs2709 | medium | It singles out the letter that the rest of the text is about. | key | key | the oldest, from a pen pal: the letter the rest is about |
| C6-cs2710 | medium | It states an expectation that the results do not support. | key | key | expected most drive; in fact more than half walked or bused |
| C6-cs2711 | medium | It explains why the strength of the wind matters. | key | key | too little wind, too much wind: why wind strength matters (May is sentence 3) |
| C6-cs2712 | medium | It explains the practical purpose mentioned in the second sentence. | key | key | red or yellow boat seen in fog: the practical purpose of sentence 2 |
| C6-cs2713 | medium | It describes how the custom might look to someone from outside. | key | key | to visitors it looks as if the street is asleep: how it looks from outside |
| C6-cs2714 | medium | It shows the effect of the teacher's method on the class. | key | key | by the time she explains everyone wants to hear: the method's effect |
| C6-cs2715 | hard | It explains how the problem introduced in the first sentence develops. | key | key | walkers fall into step, sway, more walkers match: how the problem develops |
| C6-cs2716 | hard | It presents the evidence that led to a new view of the building's pu… | key | key | horseshoes, no merchant goods: evidence leading to the new view |
| C6-cs2717 | hard | It reveals evidence of a feeling that the father never says aloud. | key | key | folder of her drawings, each dated by him: evidence of an unspoken feeling |
| C6-cs2718 | hard | It grants a fact behind an argument but doubts what it shows. | key | key | the number is accurate but measures the wrong thing: grants the fact, doubts what it shows |
| C6-cs2719 | hard | It specifies the principle by which the water was divided. | key | key | hours by size, not wealth: the principle of the division |
| C6-cs2720 | hard | It supports the claim that the plain style was chosen on purpose. | key | key | her essay says she wanted a neighbor's voice: supports that plainness is deliberate |

#### C19-RWCS02-3 (C6-18.json; text_structure_purpose; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs2801 | easy | It states a common belief, then gives an example that goes against it. | key | key | belief cats do not care, then a cat waiting at the door: against it |
| C6-cs2802 | easy | To describe how a neglected playground was improved | key | key | dirt and one swing, families build, now full: improving a neglected playground |
| C6-cs2803 | medium | It describes a long-held wish, then reports an unexpected result whe… | key | key | wanted a stadium, got it, attendance fell: unexpected result |
| C6-cs2804 | medium | To illustrate a general claim with examples from one family | key | key | general claim about tools, then one family's board: illustrate |
| C6-cs2805 | medium | It describes the decline of a craft, then reports a recent revival o… | key | key | craft faded, now an evening class with a waiting list: decline then revival |
| C6-cs2806 | medium | It describes a trait that seemed to be a weakness, then shows that i… | key | key | slowness looked like a weakness, checking every move took him to the top |
| C6-cs2807 | medium | To show that two opposite habits each suit a different dish | key | key | washed for plov, unwashed for pudding: neither is wrong |
| C6-cs2808 | medium | It explains the original purpose of an object, then describes the ne… | key | key | built for the bus, bus gone, bench used for backgammon: new use |
| C6-cs2809 | medium | To support a proposal while naming a condition for its success | key | key | allow the courtyard, works only if racks are put in: proposal plus condition |
| C6-cs2810 | medium | It shows how a character's action looked to others, then reveals a r… | key | key | seemed rude to passengers, then the hospital stop they did not know |
| C6-cs2811 | hard | To present two competing explanations for a puzzle that remains unso… | key | key | fields or calendar, neither shown wrong: two explanations, unsolved |
| C6-cs2812 | hard | It states a position, gives reasons for it, and then grants and play… | key | key | keep the square, reasons, grants the roof but rain is rare |
| C6-cs2813 | hard | It reports a prediction, describes an outcome that went against it, … | key | key | expected smaller audience, it doubled, booked the park |
| C6-cs2814 | hard | To contrast two meanings of a word and show a surprising result of one | key | key | everyday vs geographers' desert; icy deserts follow from the second |
| C6-cs2815 | hard | It describes a public success, then reveals a hidden contribution be… | key | key | masterpiece praised; the sister made the roses at 3 a.m. |
| C6-cs2816 | hard | To argue against a proposal by challenging the claim it depends on | key | key | proposal rests on wasted time; the yard shows otherwise |
| C6-cs2817 | hard | It describes a careful plan, shows how it went wrong, and then shows… | key | key | planned surprise, lights never switched on, class laughs and sings at his door |
| C6-cs2818 | hard | To suggest that the answer to a long debate may differ from one lear… | key | key | rules or talk: the answer may depend on the learner |
| C6-cs2819 | hard | To explain the real cause of a sight that suggests something else | key | key | lake seems to boil; really warmer than the air: real cause of a misleading sight |
| C6-cs2820 | hard | It reports a finding and a first suspicion, then describes measureme… | key | key | stuffiest room, suspected windows, then only the double lesson: more specific cause |

#### C19-RWCS03-2 (C6-18.json; cross_text_connections; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs3701 | easy | By noting that a similar result appeared with much younger children | key | key | kindergarten pictures did the same: similar result with younger children |
| C6-cs3702 | easy | By welcoming the shade but pointing out work the plan would bring | key | key | shade welcome but needles need weekly sweeping |
| C6-cs3703 | medium | By pointing to a new bus stop as another possible reason for the rise | key | key | a bus stop opened at the door in March: another possible reason |
| C6-cs3704 | medium | By suggesting that the rule may not suit every student | key | key | helps many, not Bahor: may not suit every student |
| C6-cs3705 | medium | By arguing that the voters were not typical of the students who will… | key | key | only players just after practice voted; the rest never asked: unrepresentative voters |
| C6-cs3706 | medium | By agreeing with its aim but warning of a side effect the plan overl… | key | key | saving water wise, but dust through open windows: overlooked side effect |
| C6-cs3707 | medium | By pointing out a price change that could also explain the larger cr… | key | key | half price started with the early hours: price change as another explanation |
| C6-cs3708 | medium | By describing a similar effect in a very different setting | key | key | reading orders aloud in a print shop: similar effect elsewhere |
| C6-cs3709 | medium | By arguing that measuring temperatures would be more reliable than a… | key | key | a vote measures feelings; thermometers would answer better |
| C6-cs3710 | medium | By sharing the plan's goal but arguing that it misses the real cause… | key | key | aim good, but the bus arrives ten minutes before the bell: misses the real cause |
| C6-cs3711 | hard | By arguing that conditions behind one block's success may be missing… | key | key | caretaker and nearby yard, most districts have neither |
| C6-cs3712 | hard | By accepting that the internet draws students while doubting that it… | key | key | fuller is not busier: grants the students, doubts the earnings |
| C6-cs3713 | hard | By arguing that the comparison ignores how many cyclists use each ro… | key | key | thousands on the road, hundreds on the lane: ignores ridership |
| C6-cs3714 | hard | By suggesting that a pattern seen in birds may also appear in people | key | key | shoppers linger at sheltered stalls: the birds' pattern in people |
| C6-cs3715 | hard | By agreeing that video teaches some skills well while arguing that p… | key | key | video for seen skills, print for planning and checking |
| C6-cs3716 | hard | By suggesting that the link may run the other way from the one she a… | key | key | keen students choose the front: marks may explain seats |
| C6-cs3717 | hard | By pointing to a change in how the fruit reached buyers that could a… | key | key | a weekly city buyer replaced carrying to a far market |
| C6-cs3718 | hard | By arguing that his test could not separate the effect of the fertil… | key | key | best rains in a decade; a half-field control would separate the effects |
| C6-cs3719 | hard | By granting the wish but warning that it would push the traffic towa… | key | key | wish understandable, traffic moves to the school lane |
| C6-cs3720 | hard | By accepting the result in PE lessons while denying that it extends … | key | key | worked for PE pulls, not for football collisions |

#### C19-RWCS03-3 (C6-18.json; cross_text_connections; easy/medium/hard 2/6/12)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs3801 | easy | A free-dress Friday would put students in a better mood. | key | key | Text 2: 'would lift everyone's mood, I agree' |
| C6-cs3802 | easy | By objecting that the café room would cost money while the hall is f… | key | key | Text 1 values the free hall; the café room costs money |
| C6-cs3803 | medium | Students have been more alert in their afternoon lessons this term. | key | key | both: afternoon lessons livelier this term; they differ on the cause |
| C6-cs3804 | medium | By warning that children who did not choose their instrument may soo… | key | key | Text 1: a child made to play an instrument will quit |
| C6-cs3805 | medium | Both value family weekends, but they differ on whether any homework … | key | key | both value family weekends; Text 1 no homework, Text 2 short homework fits |
| C6-cs3806 | medium | Last year's festival was too crowded for the old square. | key | key | both: last year too crowded for the old square |
| C6-cs3807 | medium | By warning that students facing each other may start chatting | key | key | Text 1: nobody tempted to chat with a classmate opposite |
| C6-cs3808 | medium | Fresh bread sold near home would help older neighbors. | key | key | both: bread near home helps the older neighbors |
| C6-cs3809 | hard | Only a few library visitors read the printed newspapers. | key | key | both: few read the printed papers |
| C6-cs3810 | hard | By objecting that the district would lose a past that new blocks can… | key | key | Text 1: old buildings are memory no new one can give back |
| C6-cs3811 | hard | They agree that exams make students review but differ on how much on… | key | key | both: exams make students review; differ on one exam's weight |
| C6-cs3812 | hard | The area around the mill needs something to bring people back. | key | key | both: the empty riverside needs something to bring life back |
| C6-cs3813 | hard | By arguing that the girl missed a safe way of learning that sadness … | key | key | Text 1: sad endings teach safely that sadness can be lived through |
| C6-cs3814 | hard | Travelers who land at night lack a good way into town. | key | key | both: night arrivals are badly served |
| C6-cs3815 | hard | By warning that the label may make the winner less willing to try di… | key | key | Text 1: children labeled gifted avoid hard challenges |
| C6-cs3816 | hard | Both value names that record history but differ on whether any old s… | key | key | both value story names; Text 1 never rename, Text 2 some may be |
| C6-cs3817 | hard | Children gain something from walking to school. | key | key | both: walking to school is good for children |
| C6-cs3818 | hard | By warning that the decision may in time drive local growers out of … | key | key | Text 1: cheap far fruit drives local growers out in a few years |
| C6-cs3819 | hard | The river freezes far less often than it once did. | key | key | both: the river seldom freezes now |
| C6-cs3820 | hard | By arguing that visitors on the bus would miss what gives the city i… | key | key | Text 1: from a vehicle one sees only main roads, not the city's character |

#### C19-RWII01-2 (C6-19.json; central_ideas_details; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii1701 | easy | A chart on the classroom door lists the pair for each week. | key | key | a chart on the classroom door shows the names for every week |
| C6-ii1702 | easy | Workers were checking its steel ropes. | key | key | air calm; closed so workers could check the steel ropes |
| C6-ii1703 | easy | He keeps that melon for his family and offers another. | key | key | keeps that melon for his family, offers another |
| C6-ii1704 | easy | Adults who swim lengths before going to work | key | key | seven to eight kept for adults swimming lengths before work |
| C6-ii1705 | easy | The youngest pupils grew hungry and restless before lunch. | key | key | youngest pupils hungry and restless in the last morning lesson |
| C6-ii1706 | medium | It goes to an old people's home and is toasted the next morning. | key | key | taken to the old people's home, toasted next morning |
| C6-ii1707 | medium | Write the date and the tool's name in the cupboard notebook | key | key | writes the date and tool's name in the notebook |
| C6-ii1708 | medium | It shrinks as the camel's body uses up the fat inside it. | key | key | body uses up the fat, the hump shrinks |
| C6-ii1709 | medium | On it, he can sleep early without others sitting on his bed. | key | key | no one sits on his bed in the evening, so he sleeps early |
| C6-ii1710 | medium | She plays slow exercises that need only a light touch. | key | key | switches to slow light-touch exercises |
| C6-ii1711 | medium | They can order it, and it comes on the van's next visit. | key | key | order titles the van does not carry; they come on the next visit |
| C6-ii1712 | medium | A pavement on one side of the street between the bus stop and the sc… | key | key | pavement on one side only, bus stop to school gate |
| C6-ii1713 | medium | The evening breeze there keeps them cool. | key | key | players like the outdoor court for the evening breeze |
| C6-ii1714 | medium | They kept opening and closing at about the usual times, but more wea… | key | key | still opened and closed at about usual hours, more weakly |
| C6-ii1715 | hard | It is in the afternoon and lasts an hour longer than in the spring. | key | key | June: afternoon, an hour longer |
| C6-ii1716 | hard | He mixes them up again and asks for a sort by the watch each came fr… | key | key | tipped them back, sort again by the watch they came from |
| C6-ii1717 | hard | Salt stops melting ice in very hard frost, but sand still gives tire… | key | key | salt stops melting in hard frost; sand gives grip |
| C6-ii1718 | hard | Each household gave them a sack of grain after the harvest. | key | key | near-bank households gave a sack of grain after the harvest |
| C6-ii1719 | hard | She beat the rugs in place of her brother. | key | key | Sardor hurt his wrist, Dilbar beat the rugs |
| C6-ii1720 | hard | Rainwater dripping from a broken joint in the gutter | key | key | worst under the dripping gutter joint; frost-exposed walls fine |

#### C19-RWII01-3 (C6-19.json; central_ideas_details; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii1801 | easy | For Laziz's grandfather, winter is a busy time of getting ready for … | key | key | not dull for him: sorting, mending, planning for spring |
| C6-ii1802 | easy | Unlike most neighbors, Mrs. Qodirova takes the stairs, which she thi… | key | key | unlike most, she takes the stairs and credits them for her knees |
| C6-ii1803 | medium | With glass walls and a stove, the teahouse became popular even in wi… | key | key | glass walls and stove made the winter terrace full |
| C6-ii1804 | medium | Bobur, who at first resisted the move, has begun to accept his new h… | key | key | refused to unpack, then books and trophy on the shelf: accepting the new home |
| C6-ii1805 | medium | At one camp, a building game was used to teach children how to plan. | key | key | games said to teach nothing; a camp used one to teach planning |
| C6-ii1806 | medium | A fruit's bright color is not the best sign that it is ripe. | key | key | bright color is not the best sign of ripeness |
| C6-ii1807 | medium | Grandfather does not praise the stool, but where he puts it shows hi… | key | key | no praise, but the stool by the front door shows his pride |
| C6-ii1808 | medium | Used to film experiments, phones helped students notice more in scie… | key | key | phones banned, then used to film experiments and see more |
| C6-ii1809 | medium | The tower most visitors skip shows why the fortress was built where … | key | key | the skipped north tower shows why the fortress stands where it does |
| C6-ii1810 | medium | The path showed that many people would cycle once they felt safe doi… | key | key | riders owned bikes but felt unsafe on the road |
| C6-ii1811 | hard | A forest that seems silent at night may be full of sounds people can… | key | key | silent night full of sounds too high or faint for us |
| C6-ii1812 | hard | Gulchehra comes to rely on the lists that she used to complain about. | key | key | complained about the lists, then carried them all day |
| C6-ii1813 | hard | The desert, often seen as lifeless, blooms briefly each spring and w… | key | key | desert thought lifeless blooms briefly each spring, seeds wait |
| C6-ii1814 | hard | In this family, a weaver proves herself by improving an old pattern,… | key | key | a weaver only after improving an old pattern |
| C6-ii1815 | hard | Once Ravshan stops using gloves that do not fit him, he plays far be… | key | key | two goals in oversized gloves, none bare-handed |
| C6-ii1816 | hard | Spiders use their silk for far more than catching their prey. | key | key | silk used for travel, egg cases, safety lines too |
| C6-ii1817 | hard | The younger team won by answering the arguments actually made, not p… | key | key | eighth graders listened and answered the argument actually made |
| C6-ii1818 | hard | A small kindness turns a woman Malika ignored into part of her morni… | key | key | the umbrella kindness turned an ignored seller into a morning companion |
| C6-ii1819 | hard | Though cold keeps most food fresh, the refrigerator makes bread go s… | key | key | cold keeps food fresh but bread goes stale faster |
| C6-ii1820 | hard | The lanes that look badly planned actually keep the old center cool. | key | key | lanes that look badly planned keep the old center cool |

#### C19-RWII02-2 (C6-19.json; command_of_evidence_textual; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii2701 | easy | The rabbit ate more hay on days when it was in the rack than on days… | key | key | ate more on rack days than floor days: the direct comparison |
| C6-ii2702 | easy | On evenings when the television was off for that hour, his brother f… | key | key | TV-off evenings, fell asleep sooner |
| C6-ii2703 | easy | When the canteen was closed for a week, the students who usually ate… | key | key | canteen closed a week, still on time as often: breakfast not the cause |
| C6-ii2704 | easy | "She wanted to know why the bread rose, where the river went and wha… | key | key | why the bread rose, where the river went, every closed box |
| C6-ii2705 | easy | Tomatoes in the rows with basil had far fewer insects than tomatoes … | key | key | rows with basil far fewer insects than rows without |
| C6-ii2706 | medium | In those months a college opened nearby, and most new customers were… | key | key | a college opened; its students seldom went online |
| C6-ii2707 | medium | "The streets are empty under the lamps, / and yet each lit window se… | key | key | empty streets (lonely) yet lit windows keep me company (comforting) |
| C6-ii2708 | medium | When the pipe was moved behind the science shelves, the cat began sl… | key | key | pipe moved, the cat followed it |
| C6-ii2709 | medium | In a cycling club's test, a member cut through the lock with an ordi… | key | key | cut with an ordinary hand saw in four minutes |
| C6-ii2710 | medium | "He kicked the stalled tractor and swore at it, then knelt to free t… | key | key | kicked the tractor (impatient), freed the lamb gently |
| C6-ii2711 | medium | Since the warm-ups began, half as many singers have lost their voice… | key | key | half as many lost their voices since the warm-ups |
| C6-ii2712 | medium | The number of headache visits had begun to fall two months before th… | key | key | headache visits began falling two months before the painting |
| C6-ii2713 | medium | In a summer when the cow ate only dry hay in the barn, its milk tast… | key | key | summer on dry hay, milk tasted like winter |
| C6-ii2714 | medium | "He packed three spare tires, a tent in case we got stranded and a w… | key | key | three spare tires, a tent, a week of bread for two hours |
| C6-ii2715 | hard | Tomatoes in a nearby greenhouse with no music grew just as much fast… | key | key | no-music greenhouse grew as much faster in a warmer month |
| C6-ii2716 | hard | "All morning we carried water to the rows, / and at noon we slept in… | key | key | carried water all morning (work), slept in the shade at noon (rest) |
| C6-ii2717 | hard | On a nearby street that got the same new lights but no speed bumps, … | key | key | same lights, no bumps: cars as fast as before, so the lights did not slow them |
| C6-ii2718 | hard | Trees were planted mostly on streets that had few broken windows eve… | key | key | trees went to streets already low in broken windows: reverse selection |
| C6-ii2719 | hard | "He said the puppy was a nuisance, but every night I heard him creep… | key | key | calls it a nuisance but creeps down at night to check the water |
| C6-ii2720 | hard | The old trees in the orchard lost as large a share of their apples a… | key | key | old trees lost as large a share as new ones: not the variety |

#### C19-RWII02-3 (C6-19.json; command_of_evidence_quantitative; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii2801 | easy | Potatoes rose from 35 to 48 kilograms, and onions rose from 22 to 30… | key | key | potatoes 35 to 48, onions 22 to 30: both rose |
| C6-ii2802 | easy | most came by bus, 22 of the 30. | key | key | rainy day: bus 22 of 30 |
| C6-ii2803 | medium | Temur read slightly less, 5 hours compared with 6. | key | key | Temur 6 to 5: slightly less |
| C6-ii2804 | medium | The greenhouse was 9, 11, 11 and 9 degrees warmer at the four times … | key | key | 14-5=9, 26-15=11, 24-13=11, 17-8=9: at least 9 every time |
| C6-ii2805 | medium | in the spring grade 6 borrowed more, 210 books against 120. | key | key | spring: grade 6 210, grade 9 120 |
| C6-ii2806 | medium | In 2024, 200 bought at the canteen against 300 bringing lunch; in 20… | key | key | 2024 200 vs 300 (less common), 2025 330 vs 220 (more common) |
| C6-ii2807 | medium | more rye loaves were left unsold: 24, compared with 6 white loaves. | key | key | unsold: white 120-114=6, rye 60-36=24 |
| C6-ii2808 | medium | group A was faster, taking 220 minutes in all against group B's 230. | key | key | A 150+70=220, B 130+100=230: A faster overall |
| C6-ii2809 | medium | 8A's reading time rose from 12 to 25 minutes, while 8B's rose only f… | key | key | 8A 12 to 25, 8B (no corner) 13 to 14: not just time |
| C6-ii2810 | medium | Nodir's distance rose every week, while Mohira's fell every week. | key | key | Nodir 20,22,25,28 up; Mohira 30,26,22,18 down |
| C6-ii2811 | hard | fell by the same 8 cm every month. | key | key | north 120,112,104,96,88: 8 cm each month |
| C6-ii2812 | hard | it cut the number left uneaten to a third, from 180 to 60. | key | key | uneaten 180 to 60: a third |
| C6-ii2813 | hard | its shrinking grew by 65 mm per meter from warm to hot, against 25 f… | key | key | wool 80-15=65, cotton 45-20=25, linen 30-10=20 |
| C6-ii2814 | hard | On Wednesday, with 4 mm of rain, the shop sold 2 umbrellas, fewer th… | key | key | Wednesday rain 4 mm, 2 sold; dry Thursday 5 |
| C6-ii2815 | hard | the theater club lost a larger share of its members, 40 percent agai… | key | key | robotics lost 12/48=25%, theater 8/20=40% |
| C6-ii2816 | hard | it was the only day on which the last bus carried more passengers th… | key | key | Friday: last 26 > first 18, the only such day |
| C6-ii2817 | hard | Sevara used it every day for 9 to 15 minutes, while Jamol used it on… | key | key | Sevara 10+15+12+14+9=60 every day 9-15; Jamol 30+0+0+25+5=60 on three days |
| C6-ii2818 | hard | Towels took 6 hours against 14, shirts 3 against 8 and sheets 5 agai… | key | key | 6<7, 3<4, 5<5.5: every load under half |
| C6-ii2819 | hard | it had lost 6 members, while basketball had gained 12. | key | key | football 60 to 54 (-6), basketball 30 to 42 (+12) |
| C6-ii2820 | hard | Printer B jammed 8 times per 1,000 pages, while printer A jammed onl… | key | key | B 16/2,000 = 8 per 1,000; A 30/6,000 = 5 per 1,000 |

#### C19-RWII03-2 (C6-19.json; inferences; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii3701 | easy | the kind of water made little difference to its growth. | key | key | same height in both trays: the water made little difference |
| C6-ii3702 | easy | helped Komil's plane fly straight and far. | key | key | only the clip differed; his flew straight and far |
| C6-ii3703 | medium | the number of people who passed each window. | key | key | same price card and light; busy vs quiet street: passers-by |
| C6-ii3704 | medium | spreading practice into short sessions worked better. | key | key | same hours; short spread sessions scored more |
| C6-ii3705 | medium | sheltered the wheat behind it from the west wind. | key | key | west winds, trees on the west edge: shelter |
| C6-ii3706 | medium | sugar dissolves faster in hot water than in cold water. | key | key | same stirring; hot dissolved at once |
| C6-ii3707 | medium | the tins protected the biscuits better than the boxes did. | key | key | same van and days; boxes 1 in 10 broken, tins almost none |
| C6-ii3708 | medium | helped that group find more of the litter. | key | key | same hours; the map showed where litter gathers |
| C6-ii3709 | medium | cutting back the vines each winter. | key | key | same frames, kind, year, street; only the winter pruning differs |
| C6-ii3710 | medium | kept out more of the noise from the road. | key | key | same traffic, windows shut; double glass read lower |
| C6-ii3711 | hard | the sprints and jumps may have protected them better than stretching. | key | key | same coach, pitch, league; sprints team 2 injuries vs 8: may have protected better |
| C6-ii3712 | hard | showing drivers their own speed may slow them more than a fixed sign… | key | key | same limit and traffic; the speed-showing sign slowed cars |
| C6-ii3713 | hard | did little to make the hives stronger. | key | key | same bees by May, same honey: feeding did little |
| C6-ii3714 | hard | held visitors' attention longer but did not help them remember more. | key | key | stopped twice as long, same facts remembered |
| C6-ii3715 | hard | kept dust from the storms out of the water. | key | key | after dust storms the open wells clouded, covered stayed clear |
| C6-ii3716 | hard | drew new visitors mainly at the times when they were given. | key | key | weekday mornings rose, weekends flat: visitors at lesson times |
| C6-ii3717 | hard | may lead them to choose the dearer teas. | key | key | same total; smelling sold more costly teas |
| C6-ii3718 | hard | helped the seeds to sprout sooner. | key | key | soaked sprouted two days earlier |
| C6-ii3719 | hard | has to do with how the residents pay for their heating. | key | key | identical blocks, equal winter; metered block used a quarter less |
| C6-ii3720 | hard | the fresh apricots used in that pie. | key | key | only the apricots differed; the fresh ones ran with juice |

#### C19-RWII03-3 (C6-19.json; inferences; easy/medium/hard 2/6/12)

| Item | Level | Key (options[0]) | P11as1 | P11as2 | P11as2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii3801 | easy | left his student card at the library desk. | key | key | borrowing requires leaving the card: he left it |
| C6-ii3802 | easy | left at the house next door. | key | key | hard rain floods the path; flood days letters next door |
| C6-ii3803 | medium | the pipes were being repaired. | key | key | no samsa means gas cut, and gas is cut only for pipe repairs |
| C6-ii3804 | medium | too little light reaching the seedlings. | key | key | water and pot ruled out; far from the only window: too little light |
| C6-ii3805 | medium | had not yet opened. | key | key | filled 2 June, needs a week full before testing: not open on the 5th |
| C6-ii3806 | medium | did not come to the teahouse at his usual time. | key | key | seat empty, owner watching the door: he did not come at the usual time |
| C6-ii3807 | medium | cannot win a prize at the fair. | key | key | prize needs an experiment; hers has none |
| C6-ii3808 | medium | went to market by the long road over the hill. | key | key | high river, ford too deep, cheese goes by the hill road |
| C6-ii3809 | hard | cannot be shown in the final exhibition. | key | key | two judges cannot vote for her; one vote is short of two |
| C6-ii3810 | hard | there was no water left in it to freeze. | key | key | only change: tap moved so the pipe could be emptied, and it was |
| C6-ii3811 | hard | Kamola must lock the back door. | key | key | Wednesday: Jasur leaves early, Kamola leaves last and locks |
| C6-ii3812 | hard | may have mended the dress herself during the night. | key | key | key string gone, new perfect stitches overnight |
| C6-ii3813 | hard | does not sell meat. | key | key | meat stalls all have cabinets; no cabinet means no meat |
| C6-ii3814 | hard | some other animal that came into the yard. | key | key | still night, dog shut in, five-toed prints: another animal |
| C6-ii3815 | hard | no earlier than the middle of April. | key | key | pipes 1 March, then six weeks of watering: mid-April at the earliest |
| C6-ii3816 | hard | it may or may not have fallen below zero. | key | key | indoors on every freezing night does not mean only on freezing nights |
| C6-ii3817 | hard | the sunlight falling on the tank. | key | key | food and water ruled out; only the sunny window differs |
| C6-ii3818 | hard | may have had some trouble with the bicycle that day. | key | key | always clean and oiled, now muddy and broken light, avoids his eyes |
| C6-ii3819 | hard | could not yet choose a book for the class library. | key | key | 14 books = 2 badges; 3 needed |
| C6-ii3820 | hard | may be due to the very cold water from the new jug. | key | key | flour and yeast ruled out; cold water from the fridge jug since Monday |
