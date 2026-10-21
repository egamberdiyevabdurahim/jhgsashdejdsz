# C3: key-check reconciliation (blind check 1, 2026-10-07)

Bank C3 (English grammar, discrete items). There are 15 files, `C3-1.json` … `C3-15.json`, with 16 items each, 240 in all. Each level has 48 items in 3 files, and each file covers 4 subskills with 4 items each:

| Level | Files | Subskills |
|---|---|---|
| A1 | C3-1 … C3-3 | be_present, present_simple, have_got, demonstratives, articles_a_an, plural_nouns, there_is_are, prepositions_place, present_continuous, can_cant, question_words, past_simple_regular |
| A2 | C3-4 … C3-6 | past_simple_irregular, past_simple_neg_questions, past_continuous, comparison, will_vs_going_to, present_perfect_ever_yet, quantifiers, modals_should_have_to, articles_the_zero, first_conditional, relative_who_which_that, adjectives_ed_ing |
| B1 | C3-7 … C3-9 | present_perfect_vs_past, present_perfect_continuous, past_perfect, used_to_would, passive_basic, second_conditional, reported_speech, modals_deduction_present, verb_patterns, relative_clauses_b1, linkers_b1, future_forms |
| B2 | C3-10 … C3-12 | third_conditional, wish_if_only, modals_perfect_deduction, passive_advanced, causative, reporting_verbs, relative_non_defining_b2, gerund_infinitive_meaning, future_continuous_perfect, linkers_contrast, participle_clauses, used_to_get_used_to |
| C1 | C3-13 … C3-15 | inversion_negative_adverbials, cleft_sentences, inverted_conditionals, subjunctive_mandative, passive_reporting, modal_nuance, hypothetical_meaning, discourse_linkers_c1, future_in_the_past, agreement_quantifiers, relative_advanced, ellipsis_substitution |

Inputs: the author key is `options[0]`. `.blind/.map-C3-solverA.json` and `.blind/.map-C3-solverB.json` give the key's letter in each solver's shuffled order. The solvers' answers are in `.blind/C3-solverA.answers.json` and `.blind/C3-solverB.answers.json`. All 240 ids appear in both maps and both answer files, and no other ids appear.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`, either as a field or in the note. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. An item that cannot be fixed is retired.

## Integrity checks before reconciling

- **The maps match the current files.** I recomputed each map from the files with `blind.mjs`'s seeded shuffle (`<solver>:<id>`). Neither solver's map has a mismatch.
- **The blind copies match the current files.** In `.blind/C3-solverA.json` and `.blind/C3-solverB.json`, every stem and option set matches the current `C3-*.json`. Both solvers therefore saw the version that is being verified.
- **Starting state.** All 240 items were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`. All ids are unique, and no item has duplicate options.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **240** | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | **0** | n/a |
| Retired | **0** | n/a |

Both solvers chose the key on all 240 items. Neither answer file has a flag field, and no note contains `two_defensible`, `unanswerable` or `no_passage_needed`. By level: A1 48/48, A2 48/48, B1 48/48, B2 48/48, C1 48/48.

## Solver notes (read, none blocking)

Solver B wrote a one-line rule for all 240 items, for example "third conditional -> had told". None of these notes expresses doubt. Solver A wrote "sure: <key text>" on 229 items and added a comment on 11. I read each of the 11 against its item. None of them defeats the rule:

| id | Solver A's comment | Reading |
|---|---|---|
| C3-b2c35e (B2, gerund_infinitive_meaning) | "try to push" not offered | Only "pushing" is grammatical among pushing / to pushing / push / pushed. |
| C3-b2ae40 (B2, linkers_contrast) | however would need a semicolon | "…loves maths, ___ I prefer languages": "however" after a comma is a comma splice, and despite / in spite of cannot take a clause. Only "whereas" works. This punctuation contrast is what the item tests. |
| C3-c1c23d (C1, cleft_sentences) | that/who both fine, only who offered | "that" is not an option, so "who" is the only possible answer. |
| C3-c13851 (C1, inverted_conditionals) | "Was he to" is non-standard | Inverted conditionals take "Were", and "Was he to quit…" is the standard learner error. Neither solver chose it. |
| C3-c18740 (C1, modal_nuance) | needn't have would need a past participle | "needn't have to buy" is ungrammatical, so "didn't need" is the only answer. |
| C3-c154eb (C1, modal_nuance) | be bound to = certain to | Only "bound" fits before "to call". "sure that" and "likely that" cannot be followed by "to". |
| C3-c19162 (C1, future_in_the_past) | was to have started = planned, did not happen | Matches the `why`. |
| C3-a1cbc1 (A1, plural_nouns) | assumes male speaker | "There are three ___ in my family: my father, my brother and me." The answer is unique: men / mans / man / mens. The comment is about the fictional speaker's gender, not about the key. **Not a flag, but a candidate for a wording change** (see Next). |
| C3-b1ca1c (B1, used_to_would) | would not offered | Only "used to" is grammatical in the affirmative (use to / was used to / am used to). |
| C3-b1074e (B1, modals_deduction_present) | must would be stronger but is not offered | "can't" contradicts the colour clue, and "cans" and "is" are ungrammatical. |
| C3-b1f188 (B1, future_forms) | Shall I = offer | Will / Do / Am do not make a standard offer with "I". |

## Rewritten

None.

## Retired

None.

## Next

- **C3-a1cbc1 (optional).** A future edit could make the speaker's gender explicit or remove it, for example "my father and my two brothers". That edit would be version 2, back to `draft`, and would need a blind recheck. It was left as it is because the key is unambiguous and the rule does not call for a change.
- **The bank README.** `src/engine/data/content/README.md` still lists only the K banks. The C banks, including C3 (240 `verified_auto`), still need to be added when the C-bank pass is written up.

# C3: the 112 beginner items (blind check 2, 2026-10-10)

Seven more files, `C3-16.json` … `C3-22.json`, 16 items each, 112 in all, `author: agent:p5x-r4-content`: 64 at pre-A1 (`C3-16` … `C3-19`, ids `C3-a0…`, `prior_b` −2.7) and 48 more at A1 (`C3-20` … `C3-22`, ids `C3-a1…`, `prior_b` −1.8). The 240 items above were not touched (`reconcile.ts` skips them: already `verified_auto`, `blind:2/2`).

Inputs: the sheets `C3-solverR4a.json` and `C3-solverR4b.json` made by `scripts/content/blind.ts C3 <solver> --pending` (112 items each, each solver's own shuffle), their maps, and the answers `C3-<solver>.answers.json`, all under `.superpowers/p5x2/r4/blind/` in the worktree (git-ignored, like `.blind/`). The two solvers ran as two agent sessions, neither the author's (so the workflow that launched them reports; each left its own notes file in that folder); this pass was run by a third session, which solved nothing. The rule is `scripts/content/reconcile.ts` (`src/engine/content/reconcile.ts`): verified when both chose the key and neither raised a flag; an answer counts only for the version of the item its sheet shows.

## Integrity checks before reconciling

- **Starting state.** All 112 were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`.
- **Both answer files are complete.** 112 ids in each map, each sheet and each answer file, none missing, none extra; every answer is a plain letter, no flag, no note field.
- **Counted apart from the script:** each answer letter against its map letter: `solverR4a` 112 of 112, `solverR4b` 112 of 112. Key letters by solver: A 26, B 22, C 35, D 29 and A 32, B 28, C 24, D 28.
- **The sheets match the files** (the script's signature check): for the 108 unchanged items, stem and options are what both solvers saw.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **108** | `status: "verified_auto"`, `key_check_2: "blind:solverR4a+solverR4b"`, `key_check_2_version: 1`, version 1 |
| Reworded, waiting for a fresh check | **4** | `status: "draft"`, `key_check_2: null`, version 2, the finding in `quarantine_reason` |
| Quarantined | **0** | n/a |
| Retired | **0** | n/a |

By level: pre-A1 62 verified and 2 draft, A1 46 verified and 2 draft. So C3 serves 348 items: pre-A1 62, A1 94, and 48 at each of A2, B1, B2 and C1.

## Reworded (version 2, draft)

Both solvers chose the key on these four as well. A solver's note called the English awkward, and the fix was a few words, so the stem was reworded **before** `--write`; the script then found both answers stale for them and left them `draft`. The options, the key and the `why` are unchanged. `quarantine_reason` holds the finding as the record's history (the format has no other field for it); none was quarantined.

| id | Version 1 | Version 2 | Who said what |
|---|---|---|---|
| C3-a063c6 (pre-A1, demonstratives) | "___ is my pen here in my hand." | "___ is my pen. It is in my hand." | Both: the word order is awkward. |
| C3-a0c400 (pre-A1, demonstratives) | "Who are ___ boys near the door over there?" | "Who are ___ boys over there?" | B: two place markers in a row, padded. |
| C3-a1ad7e (A1, like_ing) | "I don't like ___ up early on Sunday." | "I don't like ___ up early on Sundays." | A: a habit reads better with "on Sundays". |
| C3-a18d7d (A1, imperatives_lets) | "Please ___ your phone in the lesson." | "Please ___ your phone during the lesson." | A: "during" is more natural. B: British usage, no change needed. |

## Solver notes read and left as they are (verified)

| id | Note | Reading |
|---|---|---|
| C3-a020d3 (pre-A1, imperatives) | "Open your books at page ten" is British; American English says "to page ten" (both solvers). | Correct English in the variety the bank writes (it teaches "have got"). Not unnatural, so no change. |
| C3-a108a6 (A1, some_any) | "Have you got ___ pets at home? — Yes, a cat.": "some" is a distractor and can stand in a question that expects yes or offers something (both solvers; neither flagged it). | A neutral question takes "any", which is what the item teaches. Both keyed "any" and neither called it a second answer. |
| C3-a1fe67 (A1, adverbs_of_frequency) | "I ___ late for school. I always come on time.": "never am" exists as an emphatic order (B; not flagged). | The neutral order is "am never"; "don't never" and "am not never" are wrong. |

## Next

- **The four drafts** need two fresh blind solvers of two agent sessions: `npx tsx scripts/content/blind.ts C3 <solver> --pending --blind <dir>` copies only these four; then `reconcile.ts C3 <solverA> <solverB> --blind <dir> --write`.
- **The scheduler's gate** was read again with the 108 served: `tests/unit/engine-server/phase-x-gate.test.ts` (the A1 student is inside the band and off the named list; the A0 student is still under it) and `phase-x-sim.test.ts` (a new named list, `EASY_FILL`).

# C3: the four reworded items (blind check 3, 2026-10-10)

The first item of "Next" above. The four version-2 drafts (`C3-a063c6` and `C3-a0c400` in `C3-17.json`, `C3-a1ad7e` and `C3-a18d7d` in `C3-22.json`) were solved by two fresh blind solvers and are `verified_auto`. No other item was touched: the script skipped the other 348 (already `verified_auto` with two checks on record).

Inputs: the sheets `C3-solverR5a.json` and `C3-solverR5b.json` made by `scripts/content/blind.ts C3 <solver> --pending` (4 items each, each solver's own shuffle), their maps and the answers `C3-<solver>.answers.json`, all under `.superpowers/p5x2/r4/blind2/` in the worktree (git-ignored), with the brief `SOLVER.md` the solvers were given. The two solvers ran as two agent sessions, neither the author's, neither the session that reworded the items, and neither a solver of version 1 (so the workflow that launched them reports; each took one sheet, `solverR5a` the first and `solverR5b` the second). This pass was run by another session, which solved nothing and opened no key or map before the script's dry run.

## Integrity checks

- **Starting state.** All four were `draft`, `version: 2`, `key_check_1: "author"`, `key_check_2: null`, with the first check's finding in `quarantine_reason`.
- **Both answer files are complete.** 4 ids in each map, each sheet and each answer file, the same four, none extra. `solverR5a` wrote plain letters; `solverR5b` wrote `{ answer, note }` on each, no flag field.
- **The sheets match the files** (the script's signature check, and compared apart from it): stem and option set of version 2 are what both solvers saw.
- **Counted apart from the script,** after its dry run: each answer letter against its map letter, and the text of the chosen option against `options[0]`: `solverR5a` 4 of 4, `solverR5b` 4 of 4.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **4** | `status: "verified_auto"`, `key_check_2: "blind:solverR5a+solverR5b"`, `key_check_2_version: 2`, version 2 |
| Quarantined | **0** | n/a |
| Left draft | **0** | n/a |

Dry run and `--write` gave the same: verified 4, quarantine 0, pending 0, blocked 0, skipped 348. So C3 holds 352 items, all `verified_auto`, and serves all of them: pre-A1 64, A1 96, and 48 at each of A2, B1, B2 and C1.

| id | Stem (version 2) | `solverR5a` | `solverR5b` | Solver's note |
|---|---|---|---|---|
| C3-a063c6 (pre-A1, demonstratives) | "___ is my pen. It is in my hand." | C: the key | C: the key | The plural options clash with "is"; the stem reads natural. |
| C3-a0c400 (pre-A1, demonstratives) | "Who are ___ boys over there?" | C: the key | D: the key | Plural and far: only "those" fits; the stem reads natural. |
| C3-a1ad7e (A1, like_ing) | "I don't like ___ up early on Sundays." | C: the key | C: the key | "like" + -ing; "to get" is not offered and "to getting" is wrong; the stem reads natural. |
| C3-a18d7d (A1, imperatives_lets) | "Please ___ your phone during the lesson." | D: the key | D: the key | A negative imperative; "not use" without "do" is not standard; the stem reads natural. |

The letters are each solver's own shuffle. Neither solver flagged `two_defensible` or `unanswerable`, and neither called a stem unnatural.

## What stays on the records

`quarantine_reason` is kept by the script as the item's history (the format has no other field for it; the validator notes it as `status.history`, 4 notes, no error). Its last sentence, "Needs a fresh blind check", is what this pass met. The four were never quarantined.

## Next

- Nothing is open in C3's key checks: no draft, no quarantined item. The human review (`reviewed`, launch gate LG1) is still to come, as for every bank.
- **The scheduler's gate** was read again with all 352 served (`tests/unit/engine-server/phase-x-gate.test.ts`, `phase-x-sim.test.ts`): the English rows stand where they stood (the A1 student 0.717, the A0 student 0.588 and still named). Four more items move the simulated runs' random streams: run 22 of the simulation no longer stands under the band and its list (`HELD_HIGH`) is empty; one math week of the gate's P4 stands at 0.8506 against 0.85 and is named (`HELD_LOW`). No math item changed.

# C3: the starter tier, 48 items (blind check 4, 2026-10-10)

Three more files, `C3-23.json` … `C3-25.json`, 16 items each, 48 in all, ids `C3-s0…`, `author: agent:p5y-starter`: level `preA1` with `prior_b` −3.5 (the format has no level under pre-A1; the scheduler reads them as a rung of their own, `en_grammar:starter`), 6 in each of 8 subskills: be_present, articles_a_an, demonstratives, possessive_adjectives, plural_nouns, colours_numbers, can_cant, short_answers. The 352 items above were not touched (`reconcile.ts` skips them: already `verified_auto` with two checks on record).

Inputs: the sheets `C3-solverY1.json` and `C3-solverY2.json` made by `scripts/content/blind.ts C3 <solver> --pending` (48 items each, each solver's own shuffle, made after the last content change), their maps and the answers `C3-<solver>.answers.json`, all under `.superpowers/p5x2/y/blind/` in the worktree (git-ignored), with the brief `SOLVER.md` the solvers were given. The two solvers ran as two agent sessions, neither the author's (so the workflow that launched them reports; each took one sheet). This pass was run by another session, which solved nothing and opened no key, map or item file before the script had compared: the dry run, then `--write`, then the counts below.

    npx tsx scripts/content/reconcile.ts C3 solverY1 solverY2 --blind .superpowers/p5x2/y/blind [--write]

## Integrity checks

- **Starting state.** All 48 were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`.
- **Both answer files are complete.** 48 ids in each sheet and each answer file, the same 48, none outside the sheet. `solverY1`: 47 plain letters and one `{ answer, note }`. `solverY2`: 40 plain letters and eight `{ answer, note }`. No flag field in either.
- **The sheets match the files** (the script's signature check; and each sheet's stems compared with the bank's apart from it: none differs).
- **Counted apart from the script,** after it had written: each answer letter against its map letter, and the text of the chosen option on the sheet against `options[0]`: `solverY1` 48 of 48, `solverY2` 48 of 48. Key letters by solver: A 9, B 16, C 10, D 13 and A 13, B 7, C 14, D 14.
- **What the write changed**, compared with the commit before it: on each of the 48, `status`, `key_check_2` and `key_check_2_version`; nothing else in the three files.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **48** | `status: "verified_auto"`, `key_check_2: "blind:solverY1+solverY2"`, `key_check_2_version: 1`, version 1 |
| Quarantined | **0** | n/a |
| Left draft | **0** | n/a |
| Reworded | **0** | n/a |

Dry run and `--write` gave the same: verified 48, quarantine 0, pending 0, blocked 0, skipped 352. So C3 holds 400 items, all `verified_auto`, and serves all of them: level pre-A1 112 (the starter tier's 48 at −3.5 and pre-A1's 64 at −2.7), A1 96, and 48 at each of A2, B1, B2 and C1.

## Solver remarks read and left as they are (verified)

Neither solver flagged `two_defensible` or `unanswerable` on any item, and none of these remarks says a key is wrong or a second option stands. Nothing was reworded in this pass: a rewording is the author's, makes version 2 and needs two fresh solvers. They are listed for the human review (`reviewed`, LG1).

| id | Stem (key first) | Remark | Reading |
|---|---|---|---|
| C3-s0a4bc (can_cant) | "A: ___ you ride a bike? B: Yes, I can." (Can / Are / Is / Do) | Both, in their answer files: "Do you ride a bike?" is grammatical in A's line alone; B's reply "Yes, I can" is what makes "Can" the only match. | One key, and both chose it. The item asks the learner to read the reply, which is what a short-answer pair teaches. |
| C3-s00541, C3-s0b8ff, C3-s07294, C3-s0a3f6, C3-s0bd00 (colours_numbers) | "I have a ___ ball." (red / read / run / is); "I have ___ pens." (two / too / to / a); "My cat is ___." (black / block / blacks / book); "One, two, ___, four." (three / tree / free / thirty); "I am ___ years old." (twelve / twelf / twelfe / ten-two) | Both: these test spelling or a word more than grammar (a homophone, a look-alike, non-words as distractors), filed under the skill `en_grammar`. Keys clear. | The subskill is `colours_numbers`, new with this tier; the practice track has one English skill, `en_grammar`, and C3 is its only pool. The tag is the owner's or the reviewer's call; no key depends on it. |
| C3-s0a558, C3-s068a1 (possessive_adjectives) | "I have a dog. ___ dog is big." (My / I / Me / You); "You have a bike. ___ bike is new." (Your / You / Me / I) | `solverY1`, in its report (not in its answer file): the noun is repeated where a speaker would say "It is big"; acceptable for a first-rung item, slightly stilted. | Correct English; the repeated noun is what shows the possessive. Left. |
| C3-s07709 (short_answers) | "A: Are you ten? B: No, I ___." (am not / isn't / aren't / not) | `solverY1`, in its report: "No, I am not." is correct; "No, I'm not" is the more natural spoken form. No change needed. | Left: the gap needs the two words. |
| C3-s07127 (demonstratives) | "Here you are. ___ is your pencil." (This / These / Those / We) | `solverY2`: "Here you are" is a set phrase a first-week beginner may not know; the answer does not depend on it. | Left. |
| C3-s0c4c8 (plural_nouns) | "How many balls? Look: four ___." (balls / ball / a ball / one ball) | `solverY2`: the stem is telegraphic but clear; one key. | Left. |
| C3-s09252 (can_cant) | "We can ___ chess." (play / plays / played / are play) | `solverY1`'s report on this item reached this pass cut short ("'chess' is t…"). Its answer file holds a plain letter for it, the key, and no note. | Nothing to act on; what the remark went on to say is not known. |

`solverY2`'s report did not reach this pass at all; its answer file was read instead (48 answers, the eight notes above, no flag).

## Next

- Nothing is open in C3's key checks: no draft, no quarantined item. The human review (`reviewed`, launch gate LG1) is still to come, as for every bank.
- **The scheduler's gate** was read before and after the write (`tests/unit/engine-server/phase-x-gate.test.ts` with `GATE_REPORT`, `phase-x-sim.test.ts`). The A0 student (P3, ability −2.90): 0.588 and under the band in 7 of 7 weeks before, **0.730 and inside it in 7 of 7** after (476 answers after the warm-up, 462 of them on the starter rung), so the gate's list of tracks named by content is empty. The A1 student: 0.717 to 0.768, on a laptop 0.748. Pins read again, each to the value the run printed: the named list (`['P3 en_grammar']` to `[]`), the easiest English item (−2.7 to −3.5), `HELD_LOW` (`['P4 math']` to `[]`: the test itself said the exception was no longer needed), and in the simulation the English ladder (`starter` first) and the A0 student's start unit (`en_grammar:starter`).
- **Not ended by the tier: repetition.** In the gate's 8 weeks the A0 student answers 516 times on 62 different items (708 on 64 before), one item up to 18 times. The rung holds 48 items and, at his ability, he does not leave it. More items on the rung, or shorter practice for a beginner, would end it; neither is a key check's to decide.
- **A student well above the tier is not given it.** The simulation's B1 student (run 15) met 10 pre-A1 items in his first week in the one random stream that test draws since the write (none before; that week stands at 0.861, and the test does not read a run's first week: it is the warm-up). Over 200 random streams the tier changes nothing for him: pre-A1 items are 0.1 % of what he is served with the tier and without it, starter items none, and 6 of 200 streams hold any such item either way.
