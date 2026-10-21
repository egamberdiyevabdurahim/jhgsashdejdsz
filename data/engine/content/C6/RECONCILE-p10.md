# C6: key check 2 of content round 1's SAT Reading and Writing reserve items (15 Oct 2026)

Content round 1 (the owner's "content x3-5", 15 Oct 2026; SPEC-lessons rev. 2, §3.3, §4.5, §9.1-§9.4) gave lesson 1 of each of the
twelve SAT Reading and Writing units 20 more C6 reserve items, so each of those lessons now draws its test-out, test and homework from 40
(its first 20 and these 20). Two authors wrote them; P10 blind checkers 1 and 2 keyed them. No piece question, lesson or passage is new in
this round for SAT R&W: the C19 edits only append the 20 ids to each lesson's `reserve`.

| File | Commit | Author | Items | Lessons (20 each) |
|---|---|---|---|---|
| `C6-16.json` (batch 16) | `6f5c73fa` | `agent:p10-rw1` | `C6-cs1601` … `cs1620`, `cs2601` … `cs2620`, `cs3601` … `cs3620`, `ii1601` … `ii1620`, `ii2601` … `ii2620`, `ii3601` … `ii3620` | `C19-RWCS01-1`, `RWCS02-1`, `RWCS03-1` (C19-3), `C19-RWII01-1` (C19-3), `RWII02-1` (C19-5), `RWII03-1` (C19-4) |
| `C6-17.json` (batch 17) | `481528ea` | `agent:p10-rw2` | `C6-se1701` … `se1760`, `ei1701` … `ei1760` | `C19-RWSE01-1`, `RWSE02-1`, `RWSE03-1` (C19-4), `C19-RWEI01-1`, `RWEI02-1`, `RWEI03-1` (C19-5) |

Before this pass all 240 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`, without a `page`; none has a
`passage_id` (each text, notes list or table is in its stem). The twelve lessons' reserves hold 240 ids, 0 in more than one lesson's reserve, 0 in none.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P10rws1 (checker 1) | `.superpowers/p10/check-rw-1/C6-P10rws1.json` (240 items) | `.superpowers/p10/check-rw-1/C6-P10rws1.answers.json` |
| P10rws2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p10/check-rw-2/C6-P10rws2.json` (`npx tsx scripts/content/blind.ts C6 P10rws2 --pending --blind .superpowers/p10/check-rw-2`: the 240 items without two checks; the 720 earlier C6 items were left out as two-checked) | `.superpowers/p10/check-rw-2/C6-P10rws2.answers.json` |

A copy holds each item's stem and its four options, shuffled by the solver's own seed and lettered A-D, with the lesson's instructions; no
key, no `why`. Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf`
reads P10rws1, P10rws2, `p10-rw1` and `p10-rw2` as four agents, so `keyCheckOf("blind:P10rws1+P10rws2", { author })` is
`{ kind: "blind", n: 2 }` for both authors. P10rws2 opened neither `.map-*` file nor the C6-16 and C6-17 records, nor the authors'
ledgers, sources, logs and tests (`.superpowers/p10/author-rw*.md`, `rw1/`, `rw2/`, `tests/unit/content/p10-rw*.test.ts`), before it wrote
its answers; it read each item in its copy, chose a letter, worked every count and table by hand (the sums, differences and shares in the
table below), and wrote its answers file, with a one-line reading per item, before it read P10rws1's. Only `reconcile.ts` read the maps.
For the reconcile, both solvers' copy, answers and map were copied unchanged into `.superpowers/p10/check-rw-2/rec/` (P10rws1's three files
compared byte for byte with checker 1's folder just before the write), because `reconcile.ts` reads all solvers from one `--blind` folder.

## The decision

`npx tsx scripts/content/reconcile.ts C6 P10rws1 P10rws2 --blind .superpowers/p10/check-rw-2/rec --write` gave **960 items: verified 240,
quarantine 0, pending 0, blocked 0, skipped 720.** The 720 skipped are the earlier C6 items, already `verified_auto` (C6-1 … C6-15).
**Both solvers chose the key on all 240 items.** No answer was stale, and neither answers file raises `two_defensible`, `unanswerable` or
`no_passage_needed`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **240** | `key_check_2: "blind:P10rws1+P10rws2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | **0** | none |

By level (verified/written): easy 61/61, medium 74/74, hard 105/105. The decisions are kept in `.superpowers/p10/check-rw-2/rec/C6-reconcile.json`.

**Quarantined: none.** No item drew a disagreement, a second defensible option or a flag from either solver, so there is no quarantine
reason to record.

### Counts per lesson

| Lesson | File (C19) | Reserve | New items (C6) | Subskill of the new 20 | Easy/medium/hard (new 20) | Verified | Quarantine |
|---|---|---:|---|---|---|---:|---:|
| C19-RWCS01-1 | C19-3.json | 40 | `C6-cs1601` … `cs1620` (20, C6-16.json) | words_in_context 20 | 7/7/6 | 20 | 0 |
| C19-RWCS02-1 | C19-3.json | 40 | `C6-cs2601` … `cs2620` (20, C6-16.json) | text_structure_purpose 20 | 7/7/6 | 20 | 0 |
| C19-RWCS03-1 | C19-3.json | 40 | `C6-cs3601` … `cs3620` (20, C6-16.json) | cross_text_connections 20 | 2/9/9 | 20 | 0 |
| C19-RWEI01-1 | C19-5.json | 40 | `C6-ei1701` … `ei1720` (20, C6-17.json) | transitions 20 | 7/7/6 | 20 | 0 |
| C19-RWEI02-1 | C19-5.json | 40 | `C6-ei1721` … `ei1740` (20, C6-17.json) | rhetorical_synthesis 20 | 7/7/6 | 20 | 0 |
| C19-RWEI03-1 | C19-5.json | 40 | `C6-ei1741` … `ei1760` (20, C6-17.json) | transitions 10, rhetorical_synthesis 10 | 0/0/20 | 20 | 0 |
| C19-RWII01-1 | C19-3.json | 40 | `C6-ii1601` … `ii1620` (20, C6-16.json) | central_ideas_details 20 | 7/7/6 | 20 | 0 |
| C19-RWII02-1 | C19-5.json | 40 | `C6-ii2601` … `ii2620` (20, C6-16.json) | command_of_evidence_textual 10, command_of_evidence_quantitative 10 | 7/7/6 | 20 | 0 |
| C19-RWII03-1 | C19-4.json | 40 | `C6-ii3601` … `ii3620` (20, C6-16.json) | inferences 20 | 3/9/8 | 20 | 0 |
| C19-RWSE01-1 | C19-4.json | 40 | `C6-se1701` … `se1720` (20, C6-17.json) | boundaries 20 | 7/7/6 | 20 | 0 |
| C19-RWSE02-1 | C19-4.json | 40 | `C6-se1721` … `se1740` (20, C6-17.json) | form_structure_sense 20 | 7/7/6 | 20 | 0 |
| C19-RWSE03-1 | C19-4.json | 40 | `C6-se1741` … `se1760` (20, C6-17.json) | boundaries 10, form_structure_sense 10 | 0/0/20 | 20 | 0 |
| **Total** | | | **240** | | | **240** | **0** |

Each lesson's reserve is its first 20 and the 20 new ids, in that order; each new id is in exactly one lesson's reserve. The lessons'
own records are unchanged by this pass (all twelve `verified_auto`, `key_check_2: "blind:B3s1+B3s2"`); only their `reserve` grew, in
the authors' commits.

### What the write changed

`--write` re-serialises each file it touches. Against `HEAD`, each of the 240 items differs in exactly `status`, `key_check_2` and the new
`key_check_2_version` (and, in 51 of them, the 65 `why.uz` and `why.ru` strings fixed below); its key, options, stem, English `why` and version are
as the author wrote them. The `note` of each file now says the key check is done (a text edit of the note only). Checked by a script that
diffs every item against `HEAD`: 0 problems; LF, no BOM, the files' own `JSON.stringify(…, null, 2)` form.

## What P10rws2 weighed (none a flag)

| Item | The near option | Why the key is the only one |
|---|---|---|
| C6-cs1620 | "premature", "inadequate" | the cousin lets her in smiling as if nothing happened: the speech is not too early or too weak, it is no longer needed |
| C6-cs3604 | "Fruit trees are the best choice for busy streets" | Text 2 wants plane trees on the streets and fruit trees in parks; what both hold is only that the streets need trees |
| C6-cs3616 | "were introduced mainly to help customers" | Text 1 says the purpose is to save the shop money; both grant only that the tills are not better for every shopper |
| C6-ii2607 | "the early groups carried more water" | that would be another cause of the early groups' success; only the cool-day result ties it to the heat |
| C6-ii2619 | "differed the most for the paraffin candle, by 2 minutes" | 98-95 = 3, 72-70 = 2, 87-84 = 3: paraffin differs least |
| C6-ii3607 | "the one standing in the warmer spot" | the dishes stood side by side; only the salt differed |
| C6-ii3619 | "a small batch in the small pot with rinsed rice" | that is what she already does; only the large pot with rinsed rice changes the rinsing and keeps the pot (batch size still goes with the pot, but no other option tests the pot at all) |
| C6-se1742 | "bowl, including:" | "including" leads straight into its examples, no colon after it |
| C6-se1746 | "noon, so the" | "Because …" already joins the clauses; "so" adds a second connector |
| C6-se1736, se1753, se1757, se1760 | the sentences that open with "it", "there", people, a possessive or another thing | the opening phrase must sit next to what it describes: the cart, the steps, Gulshan, the baker |
| C6-se1755 | "are" | "neither … nor" agrees with the nearer subject, "the waiter": "is" |
| C6-ei1742 | "Even so," | nothing is set against the daily use; teaching neighbours goes further: "In fact," |
| C6-ei1745 | "In fact," | the second sentence is the time before the library lent machines: "Previously," |
| C6-ei1759 | "twice as many as Madina did" | 18 is three times 6 |
| C6-ii2611 … ii2620, ei1721 … ei1740, ei1751 … ei1760 | (the claim or goal in the question line) | as on the real test, the goal or claim narrows the choice, and the table or notes decide it (the numbers in each option were checked against the table: 127 not 117, 90% and 80%, +430/+180/-20, +4/0/+5, 18 = 3 × 6). No item has a passage, and neither solver found one answerable without its text |

## Uzbek and Russian

**Lint.** Before the fixes, a lint over every uz and ru string of C6-16 and C6-17 (each `why` and `instructions`: any ' ‘ ’ ` ´ in uz,
U+02BB after a letter other than o/g, U+02BC after o/g, Cyrillic in uz, Latin outside quotation marks in ru) found nothing in Uzbek. What
it raised in Russian is English left unquoted: table labels ("Olma Street", "Lake"), the game "Lost River", "-ing", "who", "which",
"First, Then". English quoted inside a uz line is written with U+02BC (the authors' rule: a uz string holds U+02BB/U+02BC only).

**Checker 1's fixes** (`.superpowers/p10/check-rw-1/uz-ru-fixes.json`): 65 fixes, 44 of a `why.uz` and 21 of a `why.ru`, 41 fields of 33 items in C6-16 and 24 fields of 18 items
in C6-17 (no two fixes on the same field). Every fix's `old` matched the current text exactly. P10rws2 read each
against the item and agrees with all 65: they repair meaning traps (Uzbek «kecha» read as "yesterday", «ertangi» as "tomorrow's",
«yangilik» as "news", «bor» for «boʻr», «ikki yuz yuz»; Russian «записи «never» заменят учителя», which said the opposite of Text 1,
and «машинки» for sewing machines), case and verb errors («ogohlantirmoq» + -dan, «oʻzini tutmoq», «chalinadi»), calques, slang and bare
English words. **Applied: 65 (63 as written, 2 shortened). Refused: 0.** Two applied fixes would have put a uz `why` over the validator's
200-character limit (`limit.why`, which the authors' tests pin at no finding on C6-16), so each was applied with one shortening that keeps
checker 1's correction: C6-cs3610 «1-matnning asosiy fikri:» → «1-matnning fikri:» (201 → 194 characters) and C6-cs3617 «savdo qizgʻinligi
hunarmandga» → «qizgʻin savdo hunarmandga» (203 → 199). The script and its log: `.superpowers/p10/check-rw-2/apply-fixes.cjs`,
`uz-ru-applied.json`. A `why` is no part of what a solver sees (the blind copy's signature is the stem and the options), so the key check
recorded for version 1 still holds; no key, stem or option changed. The lint after the fixes: nothing in Uzbek; in Russian only the table
label in brackets after its translation, "-ing" and "Lost River". The native read of uz and ru (§9.1 step 5) is still to do.

| # | Item | Field | Checker 1's reason (abridged) | Result |
|---:|---|---|---|---|
| 0 | C6-cs1605 | `why.uz` | «X deb bilmoq» needs the accusative (bolalarni); «bolalar himoyada deb biladi» is ungrammatical. Plain wording instead. | applied |
| 1 | C6-cs1610 | `why.ru` | A bare «значит это» reads unfinished; «именно это» ties it to the phrase before. | applied |
| 2 | C6-cs1620 | `why.uz` | «tutmoq» means "behave" only with «oʻzini»; without it the verb has no object. | applied |
| 3 | C6-cs2601 | `why.ru` | Meaning trap: «редкие инструменты» reads as "rare tools", not tools needed rarely. | applied |
| 4 | C6-cs2602 | `why.uz` | Garbled subject ("telling about carrots says"); «oʻxshamadi» is colloquial. Passive «deyilgan» and «natija bermadi» read cleanly. | applied |
| 5 | C6-cs2605 | `why.uz` | «chalmoq» is transitive (someone rings the bell); a bell that rings is «chalinadi». | applied |
| 6 | C6-cs2611 | `why.uz` | Meaning trap: «ikki yuz yuz» reads as "two hundred hundred" (yuz = face and hundred). | applied |
| 7 | C6-cs2611 | `why.ru` | «беда» is a calamity; stage fright that stops his hands is «заминка». | applied |
| 8 | C6-cs3606 | `why.uz` | «qochirmoq» also means "abduct" (qiz qochirish); "scared visitors off" is «choʻchitib yubormoq». | applied |
| 9 | C6-cs3608 | `why.uz` | «oʻquvchi» reads first as "pupil"; the letter's reader is its recipient. | applied |
| 10 | C6-cs3608 | `why.ru` | «память, написанную рукой» cannot be said: a memory is not written; a keepsake is «вещь на память». | applied |
| 11 | C6-cs3610 | `why.uz` | Calque of "lost": «adashmoq» is "lose one's way" or "be mistaken"; a pupil lost in a lesson «tushunmay qoladi». Whose place was missing («oʻrnini» … | applied, shortened (194 characters) |
| 12 | C6-cs3610 | `why.ru` | Meaning trap: without «не» the Russian clause reads «записи заменят учителя», the opposite of Text 1. | applied |
| 13 | C6-cs3611 | `why.uz` | Calque ("supervised river swims"); Uzbek says «nazorat ostida daryoda suzish». | applied |
| 14 | C6-cs3612 | `why.uz` | «ogohlantirmoq» takes -dan (warn of), not the accusative. | applied |
| 15 | C6-cs3613 | `why.uz` | As written it says "demanding every detail"; the point is insisting on keeping every original detail. | applied |
| 16 | C6-cs3617 | `why.uz` | The clause has no Uzbek verb: a reader without English loses the point. | applied, shortened (199 characters) |
| 17 | C6-cs3617 | `why.ru` | The clause has no Russian verb: a reader without English loses the point. | applied |
| 18 | C6-cs3619 | `why.ru` | «общество по интересу» is not idiomatic; the set phrase is «по интересам», and the point is company, «общение». | applied |
| 19 | C6-ii1602 | `why.uz` | Calque: «olovni ushlab turadi» is "holds the fire"; keeping it going is «oʻchirmay turadi». Sumalak is stirred with «kavlamoq», the word every Uzbe… | applied |
| 20 | C6-ii1604 | `why.uz` | Meaning trap: «nusxa olmoq» is "make a copy" (of a document); the birds repeat their neighbours' speed and direction. | applied |
| 21 | C6-ii1612 | `why.uz` | The text says she sat "opposite her" (ru already «напротив»); «yoniga» is "beside". | applied |
| 22 | C6-ii2601 | `why.uz` | Meaning trap: with no subject, «shanba kunlari ... bolalarni olib keladi» reads "on Saturdays (someone) brings the children"; «shanba bolalari» is … | applied |
| 23 | C6-ii2601 | `why.ru` | «субботы привели» reads as "brought by the hand"; «субботних детей» is a calque of "Saturday children". | applied |
| 24 | C6-ii2602 | `why.uz` | The «joyida» trap (hammasi joyida = all is fine); the idiom for "never sit still" is «bir joyda (tinch) oʻtira olmaslik». | applied |
| 25 | C6-ii2604 | `why.uz` | Meaning trap: «tushdagi» also reads "in a dream". | applied |
| 26 | C6-ii2605 | `why.ru` | «подходит к выводу» reads as "comes up to / approaches the conclusion". | applied |
| 27 | C6-ii2606 | `why.ru` | «вызов» is a challenge or a summons; volunteering is «вызваться». | applied |
| 28 | C6-ii2607 | `why.uz` | Meaning trap: «ertangi» is "tomorrow's", not "early". | applied |
| 29 | C6-ii2610 | `why.uz` | Meaning trap: «yangilik» is "news" or "novelty", not freshness. | applied |
| 30 | C6-ii2611 | `why.uz` | Garbled: it said "18 jars apricot more than any other fruit" without a verb for the jars. | applied |
| 31 | C6-ii2614 | `why.uz` | English left on a uz line, with Uzbek suffixes on "Street"; the table's label stays once in brackets. | applied |
| 32 | C6-ii2614 | `why.ru` | English left on a ru line; the table's label stays once in brackets. | applied |
| 33 | C6-ii2615 | `why.ru` | «связывает больше всего телефона с меньше всего домашки» is ungrammatical, and «домашка» is slang. | applied |
| 34 | C6-ii2618 | `why.uz` | English names bare on a uz line, and it read as if the entrances themselves grew. | applied |
| 35 | C6-ii2618 | `why.ru` | Latin left bare on a ru line, and «Lake вырос» says the entrance grew, not its count. | applied |
| 36 | C6-ii2619 | `why.uz` | Meaning trap: «soya» alone reads first as "shade"; «mum» alone is any wax. | applied |
| 37 | C6-ii3601 | `why.uz` | With the cat as the topic, «otasi» reads "its (the cat's) father"; Laylo is never named. | applied |
| 38 | C6-ii3607 | `why.uz` | Russianism on a uz line; tap water is «joʻmrak suvi». | applied |
| 39 | C6-ii3614 | `why.uz` | Calque: "did not bring back the second day". | applied |
| 40 | C6-ii3614 | `why.ru` | Calque: "did not bring back the second day". | applied |
| 41 | C6-se1704 | `why.uz` | English word left bare on a uz line; quoted like every other English word in these lines. | applied |
| 42 | C6-se1704 | `why.ru` | English word left bare on a ru line. | applied |
| 43 | C6-se1718 | `why.uz` | English word left bare on a uz line. | applied |
| 44 | C6-se1718 | `why.ru` | English word left bare on a ru line. | applied |
| 45 | C6-se1720 | `why.uz` | Meaning trap: «toʻgʻri» reads "correctly"; "straight into" is «toʻgʻridan-toʻgʻri». | applied |
| 46 | C6-se1721 | `why.uz` | «kimniki» asks whose (a person's); the windows belong to a tea house. | applied |
| 47 | C6-se1725 | `why.ru` | «местоимение-деятель» is no term a Russian teacher uses; the clause also lacked a verb. | applied |
| 48 | C6-se1737 | `why.uz` | English word left bare on a uz line. | applied |
| 49 | C6-se1737 | `why.ru` | English word left bare on a ru line. | applied |
| 50 | C6-ei1705 | `why.uz` | English words left bare on a uz line. | applied |
| 51 | C6-ei1705 | `why.ru` | English words left bare on a ru line. | applied |
| 52 | C6-ei1713 | `why.uz` | «egizak» (twins) does not tell an Uzbek pupil they are synonyms. | applied |
| 53 | C6-ei1713 | `why.ru` | «двойники» is "doubles/look-alikes"; the grammar word is «синонимы». | applied |
| 54 | C6-ei1721 | `why.uz` | Meaning trap: «kecha» alone reads "yesterday": "say what time it started yesterday". | applied |
| 55 | C6-ei1726 | `why.uz` | «javob javob beradi» repeats the word. | applied |
| 56 | C6-ei1732 | `why.uz` | «ochiq kinoteatr» reads "an open (not closed) cinema"; open-air is «ochiq havodagi». | applied |
| 57 | C6-ei1740 | `why.uz` | «oʻquvchi» reads first as "pupil"; the reader here is the family with small children. | applied |
| 58 | C6-ei1743 | `why.uz` | "four or later" (ru: «в четыре или позже»); «toʻrtdan keyin» leaves four out, and the clause had no verb. | applied |
| 59 | C6-ei1745 | `why.uz` | Meaning trap: «mashina» alone is "car". | applied |
| 60 | C6-ei1745 | `why.ru` | «машинки» alone reads as toy cars. | applied |
| 61 | C6-ei1748 | `why.uz` | Calque of "weekday evenings"; Uzbek says «ish kunlari kechqurun». | applied |
| 62 | C6-ei1755 | `why.uz` | Chalk is «boʻr»; «bor» is "there is" (or boron). | applied |
| 63 | C6-ei1757 | `why.uz` | Meaning trap: at a school fair «oʻquvchilar» reads "pupils", the people the fair IS for; these readers are townspeople. | applied |
| 64 | C6-ei1758 | `why.uz` | «ariqchali» (with little ditches) is odd for grooved mats; the mats are rubber. | applied |

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings** (the base's count), 278 notes; no finding
  on C6-16, C6-17 or their ids (`.superpowers/p10/check-rw-2/validate-2.log`).
- The authors' tests `tests/unit/content/p10-rw1.test.ts` and `p10-rw2.test.ts`: **18 of 18 pass** after the reconcile and the fixes
  (`vitest-2.log`). Their "today" test now finds none of the twelve lessons held.
- Related tests, run after the reconcile (`.superpowers/p10/check-rw-2/vitest-related.log`) and again after the fixes (`vitest-related-2.log`; 11 files, 111 tests): `p7-unit-test`, `committed-content`, `no-content-leak`, `keycheck`, `reconcile` and the P8 and P8b R&W lesson tests pass, except these pins. In `p6b-fixed-text.test.ts`, two failures belong to this round: each reserve pinned at 20 items (`C19-RWCS01-1` has 40: the authors' reserve append) and the practice pool's reserve exclusion pinned at 120 items (it is 360: C6-16 and C6-17 are verified now and not yet in `RESERVE_FILES`: this pass). The authors' own logs, before this pass, had six `p6b-fixed-text` failures, one in `p7-unit-test` and one each in `p8b-a1` and `p8b-a3`, mostly from the lessons held for their unverified reserve items; those now pass. In the second run, three more `p6b-fixed-text` failures (10 IELTS Reading lessons where 7 are pinned; the English turn's 57 lessons where 54 are pinned) come from the IELTS checkers' uncommitted edits of `C19/C19-22.json` and `C19-23.json` in the same worktree, not from C6. `p8b-a2-rw-cross-inference-lessons.test.ts` fails its pin of 23 (it is 43; below).

## For the integrator (not changed here)

- `RESERVE_FILES` (`src/server/content/bank.ts`) must gain `C6/C6-16.json` and `C6/C6-17.json`. Until it does, the C6 practice pool
  draws these 240 verified items as practice items, as between P8's and P8b's key checks and their integrations.
- `tests/unit/engine-server/p6b-fixed-text.test.ts` pins each reserve at 20 items and the reserve-file practice exclusion at 120; both
  need the new sizes (40 per lesson-1 reserve; the reserve files above).
- `tests/unit/content/p8b-a2-rw-cross-inference-lessons.test.ts` pins `C19-RWCS03-1`'s pieces and reserve at 23; it is 43 since the
  rw1 commit `6f5c73fa` (reserve 20 → 40), not since this pass.

## The 240 keys

Each lesson's 20 new items, the key (options[0]), each solver's verdict from the decisions log, and P10rws2's own reading from its answers
file (written blind).

#### C19-RWCS01-1 (C6-16.json; words_in_context; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs1601 | easy | generous | key | key | generous: cooks for forty, sends plates to the absent |
| C6-cs1602 | easy | spread | key | key | spread: one small cloud, then the whole glass pale blue |
| C6-cs1603 | easy | sunny and dry | key | key | fair weather: sun hats, no umbrellas, so sunny and dry |
| C6-cs1604 | easy | comfortable | key | key | comfortable: cool in summer, warm in winter |
| C6-cs1605 | easy | safe | key | key | safe: no child crosses until every car stops |
| C6-cs1606 | easy | strict | key | key | strict: will not sell a melon that fails, even in a hurry |
| C6-cs1607 | easy | kept for later use | key | key | saved the battery for one call: kept for later use |
| C6-cs1608 | medium | effective | key | key | effective: nine bins few bothered, three bins almost every class |
| C6-cs1609 | medium | hardy | key | key | hardy: deep roots, tiny leaves, survive a harsh climate |
| C6-cs1610 | medium | bitingly cold | key | key | sharp air that makes eyes water after snow: bitingly cold |
| C6-cs1611 | medium | pride | key | key | far from embarrassing: shown to guests with pride |
| C6-cs1612 | medium | deceptive | key | key | looks thick but thin: appearance deceptive |
| C6-cs1613 | medium | keep up | key | key | sustain that level through the season: keep up |
| C6-cs1614 | medium | sparingly | key | key | only what they truly needed: packed sparingly |
| C6-cs1615 | hard | gradual | key | key | kept most plays, one new a season, little by little: gradual (not drastic, the feared one) |
| C6-cs1616 | hard | mundane | key | key | prices, weather, reminders: mundane, not the hoped-for drama |
| C6-cs1617 | hard | calm and careful | key | key | measured in tone, not furious, named faults plainly: calm and careful |
| C6-cs1618 | hard | fleeting | key | key | one kind year, may vanish in an ordinary summer: fleeting |
| C6-cs1619 | hard | impressive | key | key | weak opponents, collapsed vs the strong one: less impressive than it seemed |
| C6-cs1620 | hard | superfluous | key | key | cousin already lets her in smiling: the apology is unneeded, superfluous |

#### C19-RWCS02-1 (C6-16.json; text_structure_purpose; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs2601 | easy | To describe a neighborhood tool shelf and how it helps residents | key | key | describes the tool shelf and how it helps |
| C6-cs2602 | easy | It shows that her first attempt did not succeed. | key | key | carrots-good-for-eyes did not work: the failed first attempt |
| C6-cs2603 | easy | It describes an object and then explains, step by step, how it is u… | key | key | what a tandir is, then how bread is baked in it step by step |
| C6-cs2604 | easy | To correct a mistaken belief about caring for a cactus | key | key | many believe never needs water; in fact it does: corrects a belief |
| C6-cs2605 | easy | It shows the result of the engineer's work. | key | key | bell rings again: the result of the repair |
| C6-cs2606 | easy | To show the close bond between a grandfather and the birds he cares… | key | key | knows each bird, speaks softly: the bond between grandfather and birds |
| C6-cs2607 | easy | It presents a belief and then describes a test whose result does no… | key | key | belief (silence), test, same height: result does not support it |
| C6-cs2608 | medium | It names an overlooked part of the samsa that the rest of the text … | key | key | few think about the dough: names the overlooked part the rest explains |
| C6-cs2609 | medium | To explain how heat spreads through water in a pot | key | key | warm rises, cool sinks, circling carries heat: how heat spreads |
| C6-cs2610 | medium | It reports an event, gives two readings of it and tells what the vi… | key | key | flood, older and younger readings, village did both |
| C6-cs2611 | medium | It reveals what causes the sudden difficulty in the last sentence. | key | key | two hundred faces: the cause of the frozen hands in the last sentence |
| C6-cs2612 | medium | To describe how one family kept food cool without a refrigerator | key | key | the pit with straw and jars: keeping food cool without a refrigerator |
| C6-cs2613 | medium | It shows that the decision brought a cost as well as a benefit. | key | key | drivers still complain (cost) but shade full of people (benefit) |
| C6-cs2614 | medium | It gives a puzzling observation, a wrong guess about it and the rea… | key | key | puzzling turning, sister guess wrong, flowers follow the sun |
| C6-cs2615 | hard | It grants a point to the view that the text goes on to question. | key | key | they rightly point out: grants a point the text then questions with Yet |
| C6-cs2616 | hard | To suggest that something made in summer keeps the feeling of that … | key | key | empty frosty orchard, but the jam holds summer: keeps the feeling of the season |
| C6-cs2617 | hard | It gives a simple way to judge a program, shows how it can mislead … | key | key | compare scores (simple), many reasons scores rise (misleads), controlled groups (better) |
| C6-cs2618 | hard | It shows his resolve giving way to his feelings, though only quietly. | key | key | told himself not to look back, watches in the mirror: resolve gives way quietly |
| C6-cs2619 | hard | To show that a desert seems empty because of when it is seen, not f… | key | key | empty at midday, full of life at night: seems empty because of when it is seen |
| C6-cs2620 | hard | It reveals the practical reason behind the feature that the first s… | key | key | straight span would block the teahouse view: practical reason for the praised curve |

#### C19-RWCS03-1 (C6-16.json; cross_text_connections; easy/medium/hard 2/9/9)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-cs3601 | easy | Text 1 stresses convenience, while Text 2 stresses personal contact… | key | key | T1 one place, park, card (convenience); T2 sellers known for years, talk (personal contact) |
| C6-cs3602 | easy | By saying that young children can usually learn two languages at once | key | key | T2: young children often learn two at once without trouble |
| C6-cs3603 | medium | By suggesting that lights aimed at the ground could meet the reside… | key | key | T2: downward lamps make streets just as safe: meets the residents' need another way |
| C6-cs3604 | medium | The city should plant trees along its streets. | key | key | T1 fruit trees on streets, T2 shade trees on streets: both want street trees |
| C6-cs3605 | medium | By arguing that this freedom creates problems for people on foot | key | key | T2: left anywhere ends across pavements for older people and prams |
| C6-cs3606 | medium | Text 2 describes an outcome elsewhere that casts doubt on the plan … | key | key | neighboring town's fee emptied the museum: casts doubt on T1's plan |
| C6-cs3607 | medium | By objecting that it ignores what the long summer gives families | key | key | T2: shortening takes time that matters to families, whatever its effect on lessons |
| C6-cs3608 | medium | Text 2 grants that messages are faster but names values that a lett… | key | key | a message is quicker (grants), but time given and kept in hand (values) |
| C6-cs3609 | medium | Text 1 focuses on the litter the bags cause; Text 2, on how a sudde… | key | key | T1 bags into canals and trees (litter); T2 shoppers buy less if sudden (sales) |
| C6-cs3610 | medium | By replying that replaying a lesson still cannot notice when a stud… | key | key | T1's point: no recording can see a student is lost; rewinding does not change that |
| C6-cs3611 | medium | By agreeing on the pool for learning but adding supervised river swims | key | key | T2: pool safest for strokes, but end with supervised river swims |
| C6-cs3612 | hard | By accepting its benefit but warning that it could bring a hidden c… | key | key | T2: indeed keeps water, but stops silt floods: hidden fertilizer cost |
| C6-cs3613 | hard | By arguing that strict restoration may endanger the houses it aims … | key | key | T2: unlivable house stands empty and decays faster: strict restoration endangers it |
| C6-cs3614 | hard | By arguing that the effect of losing depends mainly on how adults t… | key | key | T2: depends less on the contest than on what adults say |
| C6-cs3615 | hard | Text 2 agrees about simple sums but finds calculators useful in har… | key | key | no one should need a calculator for 7x8, but in the field problem it frees attention |
| C6-cs3616 | hard | Self-service tills are not an improvement for every shopper. | key | key | T1 queues no shorter; T2 slow for older and big shops: not an improvement for every shopper |
| C6-cs3617 | hard | By noting that a busy trade in crafts may not mean that local craft… | key | key | T2: caps machine-made far away, real embroiderers giving up: busy trade not local benefit |
| C6-cs3618 | hard | By arguing that a story should come first, since interest makes dat… | key | key | T2: one story gives a reason to care, then dates stick: story first |
| C6-cs3619 | hard | Text 2 grants a limit named in Text 1 but says online friendship of… | key | key | may lack shared afternoons (grants T1's limit) but company in an interest |
| C6-cs3620 | hard | By arguing that some signs track real conditions and should be judg… | key | key | some signs describe the air (swallows, insects, damp air); judge which follow weather |

#### C19-RWEI01-1 (C6-17.json; transitions; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ei1701 | easy | For instance, | key | key | the lamp is one of the things made from rubbish: for instance |
| C6-ei1702 | easy | Moreover, | key | key | second advantage: moreover |
| C6-ei1703 | easy | In contrast, | key | key | loud action vs quiet animal films: in contrast |
| C6-ei1704 | easy | Therefore, | key | key | road blocked, so the doctor could not reach: therefore |
| C6-ei1705 | easy | Finally, | key | key | last step before serving: finally |
| C6-ei1706 | easy | Meanwhile, | key | key | at the same time at the back: meanwhile |
| C6-ei1707 | easy | However, | key | key | sure it was too rusty, but it ran: however |
| C6-ei1708 | medium | Instead, | key | key | picnic replaced by the gym floor: instead |
| C6-ei1709 | medium | As a result, | key | key | subtitles, so older viewers returned: as a result |
| C6-ei1710 | medium | For example, | key | key | the week's repairs are examples: for example |
| C6-ei1711 | medium | Next, | key | key | first scrapes, next sands |
| C6-ei1712 | medium | In addition, | key | key | another feature: in addition |
| C6-ei1713 | medium | However, | key | key | studied all week yet half marks: however |
| C6-ei1714 | medium | In contrast, | key | key | north wheat fields vs south orchards: in contrast |
| C6-ei1715 | hard | Instead, | key | key | not reprinted; cards beside objects in its place: instead |
| C6-ei1716 | hard | As a result, | key | key | second afternoon batch, so six o'clock workers get bread: as a result |
| C6-ei1717 | hard | however, | key | key | hoped the new bridge would take the crowds; they still used the old: however |
| C6-ei1718 | hard | For example, | key | key | Lost River is a case of a game with almost no equipment: for example |
| C6-ei1719 | hard | Meanwhile, | key | key | inside actors dressing, at the same time outside a line: meanwhile |
| C6-ei1720 | hard | Therefore, | key | key | too short a visit, so they chose the garden: therefore |

#### C19-RWEI02-1 (C6-17.json; rhetorical_synthesis; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ei1721 | easy | The board game evening starts at 5 p.m. every Wednesday. | key | key | the only choice with the start time (5 p.m.) |
| C6-ei1722 | easy | Because birds had eaten most of their strawberries the summer befor… | key | key | the only choice with the reason (birds ate the strawberries) |
| C6-ei1723 | easy | Class 9B's cake sale earned enough money to buy 15 new books for th… | key | key | the result: money bought 15 books |
| C6-ei1724 | easy | Olim picked 40 kilograms of grapes this year, 15 more than Botir's 25. | key | key | 40 vs 25, 15 more: the difference |
| C6-ei1725 | easy | Members of the school's new knitting club knit scarves and hats. | key | key | what members make: scarves and hats |
| C6-ei1726 | easy | Ozod and Shirin built the new bench by the bus stop in their woodwo… | key | key | who built it: Ozod and Shirin |
| C6-ei1727 | easy | The films made by Class 8A and Class 8B are exactly the same length… | key | key | similarity: both five minutes |
| C6-ei1728 | medium | On Monday, Route 5 carried 600 passengers, twice as many as Route 9… | key | key | compares both routes: 600, twice 300 |
| C6-ei1729 | medium | Nargiza soaked same-sized squares of towel, cotton and wool in equa… | key | key | the method: same squares, same water, side by side, every half hour |
| C6-ei1730 | medium | Bobur Tursunov spent every weekend from March to October repairing … | key | key | how long: every weekend March to October |
| C6-ei1731 | medium | About 60 students a day ate breakfast at school last year; this yea… | key | key | the change: 60 last year, 110 this year |
| C6-ei1732 | medium | At the open-air cinema in the park, there are no tickets, and nobod… | key | key | free: no tickets, nobody pays |
| C6-ei1733 | medium | The footbridge is called the Swallow Bridge after the swallows that… | key | key | named after the swallows nesting under its arch |
| C6-ei1734 | medium | Anyone aged 10 to 17 may use the free climbing wall, though climber… | key | key | who may use: ages 10 to 17, under 14 with an adult |
| C6-ei1735 | hard | The club expected its striped melons to do best, yet the small yell… | key | key | expected striped to do best, yet yellow 19 to 6 |
| C6-ei1736 | hard | Rustam and Zarina both learned to cook this year so that they could… | key | key | in common: both learned this year to cook for late-working parents |
| C6-ei1737 | hard | About 120 people a day swam outdoors this July, down from 300, beca… | key | key | why fewer: drop 300 to 120 because regulars prefer the indoor pool |
| C6-ei1738 | hard | Behruz's collection holds 600 stamps, and every one of them shows a… | key | key | size 600 and every stamp shows a bird |
| C6-ei1739 | hard | To make their classroom quieter, Class 10A put felt pads under its … | key | key | aim (quieter) and outcome (70 to 58 dB) |
| C6-ei1740 | hard | With small children, take the road: the footpath over the pass is s… | key | key | recommends the road, reasons fit small children |

#### C19-RWEI03-1 (C6-17.json; transitions and rhetorical_synthesis; easy/medium/hard 0/0/20)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ei1741 | hard | Likewise, | key | key | bakers leave bread, tailor leaves buttons: likewise |
| C6-ei1742 | hard | In fact, | key | key | used it daily, indeed even taught neighbors: in fact |
| C6-ei1743 | hard | Specifically, | key | key | planned around lessons; the specific detail: every session at four or later |
| C6-ei1744 | hard | Even so, | key | key | no shade, hot slide, yet the busiest place: even so |
| C6-ei1745 | hard | Previously, | key | key | before the library lent them, only two tailors had machines: previously |
| C6-ei1746 | hard | In the end, | key | key | three failed tries, finally gave up: in the end |
| C6-ei1747 | hard | In other words, | key | key | long rest restated: dough sits three hours: in other words |
| C6-ei1748 | hard | As a result, | key | key | lights and late hours, so weekday evenings full: as a result |
| C6-ei1749 | hard | Nonetheless, | key | key | rainy Monday, no heating, still two hundred came: nonetheless |
| C6-ei1750 | hard | Instead, | key | key | never ground wheat; pumped water: instead |
| C6-ei1751 | hard | At a fix-it evening, volunteers repair broken things for free; the … | key | key | says what a fix-it evening is and where the town's is held |
| C6-ei1752 | hard | Although Oysha uses her roof and Hamida uses racks in her yard, bot… | key | key | one difference (roof vs racks) and what they share |
| C6-ei1753 | hard | Pressing the request button at the new bus stops lights a lamp on t… | key | key | what it is for and how it works: press, lamp, driver stops |
| C6-ei1754 | hard | This spring, 85 volunteers planted 1,200 young trees along the cana… | key | key | size: 85 volunteers, 1,200 trees, two Saturdays |
| C6-ei1755 | hard | Room 12, which used the new chalk, had much less dust, but its wind… | key | key | result plus the doubt (open windows vs closed) |
| C6-ei1756 | hard | Planted in 1890, the plane tree in the old school's courtyard now h… | key | key | age (1890) and width (four children) |
| C6-ei1757 | hard | Everyone in town is welcome at the school's free science fair in th… | key | key | invites everyone in town, not just students and parents, free |
| C6-ei1758 | hard | Because the school's front steps froze and students slipped on them… | key | key | problem (froze, slipped) and solution (grooved mats) |
| C6-ei1759 | hard | On Saturday, Lobar sold 18 jars of jam, three times as many as Madi… | key | key | 18 is three times 6 (twice is wrong) |
| C6-ei1760 | hard | In shadow tag, a game for sunny days, the player who is "it" tries … | key | key | the game and how a player becomes it |

#### C19-RWII01-1 (C6-16.json; central_ideas_details; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii1601 | easy | A teacher and his students gave old computers a new use for village… | key | key | teacher and students set old computers up in the library for village children |
| C6-ii1602 | easy | They drop small stones into the pot for luck. | key | key | children drop small stones into the pot for luck |
| C6-ii1603 | easy | A boy who says he is too old for a game joins it eagerly. | key | key | too old for snowmen, an hour later pushing hardest |
| C6-ii1604 | easy | The flock's shape comes from birds copying their neighbors, not a l… | key | key | no leader; each copies its closest neighbors |
| C6-ii1605 | easy | She was honest about the problem with the brake. | key | key | trusted her because of the honest brake line |
| C6-ii1606 | easy | Travelers on caravan roads relied on knowledge passed from driver t… | key | key | stars, wells, stories passed driver to driver |
| C6-ii1607 | easy | She is anxious to see whether her grandmother will like the gift. | key | key | watched so closely she forgot to breathe: anxious about the gift |
| C6-ii1608 | medium | Bridges have gaps so they can safely grow and shrink as temperature… | key | key | expansion joints let the bridge stretch and shrink without cracking |
| C6-ii1609 | medium | That it was time to light their bread ovens | key | key | when it rang, the bread ovens were lit |
| C6-ii1610 | medium | He gives up a risky chance to win and takes the safe result that hi… | key | key | a draw wins the trophy; a bold attack might lose everything; he shakes hands |
| C6-ii1611 | medium | Careful testing showed that the town itself, not the factory, cause… | key | key | factory closed, smell stayed; students traced it to the town's own market drain |
| C6-ii1612 | medium | A shared interest helps a student make friends with a lonely newcomer. | key | key | both draw horses; Gulshan sits with her and the new girl laughs |
| C6-ii1613 | medium | It crushes fewer cells, so less of the stinging gas escapes. | key | key | a sharp knife crushes fewer cells, so less gas escapes |
| C6-ii1614 | medium | The potter sees the small flaws in his bowls as their real value. | key | key | the wobble is the mark of a hand and why people pick one bowl |
| C6-ii1615 | hard | For residents, a city's character may come more from everyday place… | key | key | residents name a teahouse, bread smell, a courtyard: ordinary places over monuments |
| C6-ii1616 | hard | He holds back from interfering but quietly shows approval of the work. | key | key | corrected nothing, then touched the stitching and nodded |
| C6-ii1617 | hard | In some forests fire has a natural role, and stopping every fire ca… | key | key | fire part of the forest's life; putting out every fire backfires |
| C6-ii1618 | hard | The river once flowed past that spot, so boats could unload there. | key | key | the river ran past that spot; boats unloaded onto the stalls |
| C6-ii1619 | hard | She wants to hold on to her hope a little longer before learning th… | key | key | for one more hour a person who might have been accepted |
| C6-ii1620 | hard | Older learners may start slowly but can match younger ones through … | key | key | slower at first, steadier, many caught up by year's end |

#### C19-RWII02-1 (C6-16.json; command_of_evidence_textual and command_of_evidence_quantitative; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii2601 | easy | Most children who come on Saturdays had never visited the reading c… | key | key | Saturday children had never come on a weekday: new children brought in |
| C6-ii2602 | easy | "Even at dinner, Grandfather would jump up three or four times to f… | key | key | jumps up three or four times at dinner: never sits still |
| C6-ii2603 | easy | The lettuce with compost grew larger, though both beds got the same… | key | key | compost bed larger with the same sun and water |
| C6-ii2604 | easy | "The stalls stand shuttered, half asleep; / a single broom sweeps b… | key | key | stalls shuttered, half asleep, a single broom: quiet and waking |
| C6-ii2605 | medium | In the same week the music began, the canteen also started serving … | key | key | smaller portions the same week: another reason for less food left |
| C6-ii2606 | medium | "When the teacher asked who would read the class letter aloud at th… | key | key | raised his hand at once to read aloud at the assembly |
| C6-ii2607 | medium | On cloudy, cool days, groups that started late finished the trail a… | key | key | on cool cloudy days late groups finish as often: the heat is what matters |
| C6-ii2608 | hard | Over the same months, a new ring road opened, drawing many drivers … | key | key | a new ring road drew drivers off the avenue at the same time |
| C6-ii2609 | hard | "She made them unpick a crooked seam three times, then stayed late … | key | key | unpick three times (strict), then stays late to teach the slowest girl (care) |
| C6-ii2610 | hard | Oven loaves baked at the highest heat grew thicker crusts and staye… | key | key | oven loaves at highest heat grew thicker crusts and stayed fresh as long |
| C6-ii2611 | easy | The family made 18 jars of apricot jam, more than of any other fruit. | key | key | apricot 18, more than 11, 7, 4 |
| C6-ii2612 | easy | had the least rain, with 30 mm. | key | key | April 30 mm, the least of 48, 39, 52, 30 |
| C6-ii2613 | easy | The classes donated 34, 52 and 41 books, 127 in all. | key | key | 34 + 52 + 41 = 127 > 120 (117 is wrong) |
| C6-ii2614 | medium | collections on Olma Street rose each week, from 80 to 140 bottles. | key | key | Olma 80, 110, 140: rose each week |
| C6-ii2615 | medium | Phone time peaked on Friday (110) and Wednesday (95), her two lowes… | key | key | phone 110 Fri, 95 Wed are the top two; homework 55, 60 the bottom two |
| C6-ii2616 | medium | fell in each season after that, down to 610 in winter. | key | key | 1450, 1380, 960, 610: fell each season after spring |
| C6-ii2617 | medium | Friday sold 180 of 200 seats (90%), while Saturday sold 200 of 250 … | key | key | 180/200 = 90%, 200/250 = 80% |
| C6-ii2618 | hard | Lake rose 430 from the lowest weekday count (210); North rose 180 a… | key | key | Lake 640 - 210 = 430; North 520 - 340 = 180; Market 430 - 450 = -20; Lake lowest weekday |
| C6-ii2619 | hard | were close for each candle, differing by no more than 3 minutes. | key | key | differences 3, 2, 3: no more than 3 minutes; beeswax longest both |
| C6-ii2620 | hard | Strings rose 4 and wind stayed at 12, while percussion rose the mos… | key | key | strings +4, wind 0, percussion +5 the most; none fell |

#### C19-RWII03-1 (C6-16.json; inferences; easy/medium/hard 3/9/8)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-ii3601 | easy | has learned to expect food at that time. | key | key | waits at six even when father is late: has learned to expect food then |
| C6-ii3602 | medium | the air sealed inside it pushed out harder than the thinner air out… | key | key | sealed air pushes out harder than the thinner mountain air |
| C6-ii3603 | easy | should go back to the shady corner. | key | key | sand burned only after moving to full sun: back to the shade |
| C6-ii3604 | medium | the cartoon made more students interested in the subject of the book. | key | key | cartoon began the same month: it raised interest in the subject |
| C6-ii3605 | easy | warm and dry. | key | key | bees out only when warm and dry; they are out: warm and dry |
| C6-ii3606 | medium | fewer books will be returned late. | key | key | reminders before the due date: fewer late returns |
| C6-ii3607 | medium | the one with salt stirred into it. | key | key | salt water freezes lower; side by side; the liquid one is salted |
| C6-ii3608 | medium | values the tree because of its link to his granddaughter. | key | key | planted by his granddaughter's class before she moved: he values the link |
| C6-ii3609 | medium | was visited by travelers from several lands. | key | key | coins of three lands, one century, one room: travelers from several lands |
| C6-ii3610 | medium | linked in some way to the river's water level. | key | key | salty only when the river is lowest, gone when it rises: linked to river level |
| C6-ii3611 | medium | by drying up into the air above it. | key | key | open glass lost more than the covered one: evaporated into the air |
| C6-ii3612 | medium | the dish is best learned by cooking it together. | key | key | come and cook it with me: learned by cooking together |
| C6-ii3613 | hard | the later houses were most likely built with bricks made in the tow… | key | key | kilns and overbaked bricks in the later layers: bricks made in the town |
| C6-ii3614 | hard | is unlikely to be the main reason the battery now runs down faster. | key | key | deleted the game, still one day; battery age: game unlikely the main reason |
| C6-ii3615 | hard | the dark ones, which birds will find harder to see on the blackened… | key | key | birds hunt by sight; on blackened bark the dark moths are hidden |
| C6-ii3616 | hard | came from villagers using the road to shop in the center. | key | key | villagers drive to the center's cheaper stores by the new road |
| C6-ii3617 | hard | on Thursday night. | key | key | above the horizon Tue and Thu; Tue cloudy, Thu clear |
| C6-ii3618 | hard | added new sales in spring without taking buyers away from the autum… | key | key | autumn the same, spring tripled: added sales without taking fair buyers |
| C6-ii3619 | hard | cook a large batch in the large pot with rice she has rinsed. | key | key | large pot always with unrinsed rice; rinse and cook in the large pot to separate pot from rinsing |
| C6-ii3620 | hard | the river slowed there and dropped the mud it carried. | key | key | slow water drops mud; it spreads wide and shallow there |

#### C19-RWSE01-1 (C6-17.json; boundaries; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-se1701 | easy | morning, and | key | key | two independent clauses: comma + and |
| C6-se1702 | easy | bus. He | key | key | two sentences: bus. He |
| C6-se1703 | easy | tools: | key | key | complete clause then the list: colon |
| C6-se1704 | easy | gate, | key | key | closing comma of the who-clause before fixed |
| C6-se1705 | easy | stand that | key | key | restrictive that-clause inside the subject, no punctuation |
| C6-se1706 | easy | funny; even | key | key | two independent clauses: semicolon (comma alone splices) |
| C6-se1707 | easy | Thursday, or | key | key | comma + or between two independent clauses |
| C6-se1708 | medium | six; however, | key | key | six; however, it stays |
| C6-se1709 | medium | sprouted: | key | key | the colon introduces the explanation, an independent clause |
| C6-se1710 | medium | rink— | key | key | dash pairs with the dash after skates |
| C6-se1711 | medium | caretaker, | key | key | comma pairs with the one after Karimov (appositive) |
| C6-se1712 | medium | stage are | key | key | no punctuation between the subject (puppets that ...) and are |
| C6-se1713 | medium | dream: | key | key | colon after a complete clause introduces what the dream is |
| C6-se1714 | medium | midnight; after that, | key | key | midnight; after that, the only way: semicolon |
| C6-se1715 | hard | takes: | key | key | colon before the list after the complete clause |
| C6-se1716 | hard | delivery— | key | key | dash pairs with the dash after garage |
| C6-se1717 | hard | wheel; when | key | key | two independent clauses, the second opening with when-clause: semicolon |
| C6-se1718 | hard | lanterns, | key | key | closing comma of the which-clause before fills |
| C6-se1719 | hard | Tuesday; the | key | key | two independent clauses: semicolon |
| C6-se1720 | hard | were | key | key | no punctuation between were and its complement |

#### C19-RWSE02-1 (C6-17.json; form_structure_sense; easy/medium/hard 7/7/6)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-se1721 | easy | are | key | key | windows ... are |
| C6-se1722 | easy | showed | key | key | yesterday: showed |
| C6-se1723 | easy | it's | key | key | it is too quiet: it's |
| C6-se1724 | easy | women's | key | key | plural women + 's |
| C6-se1725 | easy | they | key | key | the twins: they |
| C6-se1726 | easy | play | key | key | the old men ... play |
| C6-se1727 | easy | has | key | key | every desk ... has |
| C6-se1728 | medium | says | key | key | the list ... says |
| C6-se1729 | medium | had already put out | key | key | before the truck reached: had already put out |
| C6-se1730 | medium | whose | key | key | the baker whose oven |
| C6-se1731 | medium | the hikers sat down to rest in the shade of a big rock. | key | key | tired after the climb modifies the hikers |
| C6-se1732 | medium | had closed | key | key | past counterfactual: had closed ... would not have |
| C6-se1733 | medium | washing the family car. | key | key | parallel -ing: feeding, sweeping, washing |
| C6-se1734 | medium | it was | key | key | the pool: it was |
| C6-se1735 | hard | has stood | key | key | the woman ... has stood |
| C6-se1736 | hard | the little cart of the puppet theater can be seen from the far end … | key | key | painted and covered with mirrors modifies the cart |
| C6-se1737 | hard | sprays | key | key | the fountain ... sprays (finite verb) |
| C6-se1738 | hard | its | key | key | the choir: its |
| C6-se1739 | hard | are | key | key | there are two torches and a candle |
| C6-se1740 | hard | not to eat or drink near the maps. | key | key | parallel: not to touch, not to use, not to eat |

#### C19-RWSE03-1 (C6-17.json; boundaries and form_structure_sense; easy/medium/hard 0/0/20)

| Item | Level | Key (options[0]) | P10rws1 | P10rws2 | P10rws2's reading (written blind) |
|---|---|---|---|---|---|
| C6-se1741 | hard | ago, most | key | key | Although-clause, comma, main clause |
| C6-se1742 | hard | bowl, including | key | key | bowl, including an apron ... (no colon after including) |
| C6-se1743 | hard | walk: | key | key | colon before the list whose items hold commas (semicolons between) |
| C6-se1744 | hard | morning depends | key | key | whether-clause subject, no punctuation before depends |
| C6-se1745 | hard | almonds, | key | key | comma closes the such-as phrase |
| C6-se1746 | hard | noon, the | key | key | Because-clause, comma, main clause (not so) |
| C6-se1747 | hard | years, | key | key | comma closes the appositive before knows |
| C6-se1748 | hard | hours; by | key | key | two independent clauses: semicolon |
| C6-se1749 | hard | Sundays— | key | key | dash pairs with the dash after lake |
| C6-se1750 | hard | requires: | key | key | colon after complete clause before the list |
| C6-se1751 | hard | sits | key | key | inverted: next to the cannons sits a small stone lion |
| C6-se1752 | hard | makes | key | key | the potter, together with ..., makes |
| C6-se1753 | hard | the stone steps at its door shine in the evening light. | key | key | worn smooth by feet modifies the steps |
| C6-se1754 | hard | building a new one from a kit. | key | key | fixing ... than building (parallel) |
| C6-se1755 | hard | is | key | key | neither ... nor the waiter: is (nearer subject) |
| C6-se1756 | hard | has carried | key | key | since the spring: has carried |
| C6-se1757 | hard | Gulshan learned to read from her grandfather's old newspapers. | key | key | born in a mountain village modifies Gulshan |
| C6-se1758 | hard | are | key | key | the photographs ... are |
| C6-se1759 | hard | had carried | key | key | by the time the rain reached: had carried |
| C6-se1760 | hard | the baker hums the same old song every Saturday. | key | key | kneading the dough modifies the baker |
