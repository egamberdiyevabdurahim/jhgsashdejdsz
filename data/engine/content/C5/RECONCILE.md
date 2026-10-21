# C5: key-check reconciliation (blind check 1, 2026-10-07)

Bank C5 (reading testlets in three languages). There are 11 files, `C5-1.json` … `C5-11.json`, with 210 items on 42 passages (`passages.json`). Each passage has 5 items: q1 and q2 literal, q3 and q4 inferential, q5 vocab_in_context.

| Language | Levels (3 passages each) | Passages | Items |
|---|---|---|---|
| en | A1, A2, B1, B2, C1, C2 | 18 (10 fiction, 5 info, 3 essay) | 90 |
| uz | easy, medium, hard, advanced | 12 (8 fiction, 3 info, 1 essay) | 60 |
| ru | easy, medium, hard, advanced | 12 (8 fiction, 3 info, 1 essay) | 60 |

Inputs: the author key is `options[0]`. `.blind/.map-C5-solverA.json` and `.blind/.map-C5-solverB.json` give the key's letter in each solver's shuffled order. The solvers' answers are in `.blind/C5-solverA.answers.json` and `.blind/C5-solverB.answers.json`. All 210 ids appear in both maps and both answer files, and no other ids appear.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`, either as a field or in the note. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. An item that cannot be fixed is retired. The rewrites are not re-solved by their author, since that check would not be blind. They stay in draft until fresh solvers check them.

## Integrity checks before reconciling

- **The maps match the current files.** I recomputed each map from the files with the seeded shuffle in `scripts/content/blind.mjs` (`<solver>:<id>`). Neither map has a mismatch (0/210 for A, 0/210 for B).
- **The blind copies match the current files.** In `.blind/C5-solverA.json` and `.blind/C5-solverB.json`, every stem and every shuffled option set matches the current `C5-*.json`. Both solvers therefore saw the version being verified.
- **Starting state.** All 210 items were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`. All ids are unique, every `passage_id` resolves, and no item has duplicate options.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **143** | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | **67** | `status: "draft"`, `key_check_2: null`, version 2, `quarantine_reason` set |
| Retired | **0** | n/a |

**Both solvers chose the key on all 210 items.** Neither flagged `two_defensible` or `unanswerable`. **All 67 rewrites come from one flag, `no_passage_needed`.** Both solvers flagged 55 of them, solver B alone flagged 12, and solver A alone flagged none. No key was wrong, so no key was changed in place.

| Subskill | Flagged | Language | Flagged |
|---|---|---|---|
| vocab_in_context | 41 of 42 | en | 30 of 90 |
| literal | 14 of 84 | uz | 16 of 60 |
| inferential | 12 of 84 | ru | 21 of 60 |

**How the flags were recorded.** Solver B set a `no_passage_needed: true` field on all 67 items and repeated it in the note. Solver A had no flag field and recorded the flag in two ways:

- on 42 items, in the note (for example "answerable from stem alone", "quoted sentence alone suffices", "World knowledge suffices");
- on 13 items, by writing the string `no_passage_needed` in the `answer` field and the letter in the note ("letter C. …"). Those 13 are C5-c1p1q2, c1p1q3, c1p1q4, c2p1q1, uzm1q1, uza1q1, uza1q2, rum1q1, rum1q4, ruh1q1, ruh1q4, rua1q1 and rua2q1. I took the letter from the note, and all 13 match the key.

## Three causes

**1. The vocabulary items quoted the sentence (41 items).** Every q5 except C5-a1p1q5 quoted the sentence or phrase around the target word, and that context alone fixed the sense. Many targets were also fixed idioms whose meaning does not depend on any text, for example "Well done", "made a face", "collecting dust", "biting my tongue", «ovozini koʻtarmoq», «gapini kesmoq», «dasturxon yozmoq», «рыба не клевала» and «ей выпало». The one q5 that passed, C5-a1p1q5, asks who "she" refers to. The fixes:

- **Same word, without the quote (19 items).** The word has several real senses. The stem now names only the word and, where needed, the paragraph, and all four options are real senses of the word, so only the passage decides. Examples: "state", "settled", «turdi», «обходили». In C5-c2p3q5 the text uses "return" in two senses, so the stem points to the last paragraph.
- **New target word from the same passage (20 items).** The old target was an idiom or had only one sense («bunyod etilgan»). The new word has several real senses, for example "window", "forms", "joint", «ogʻir», «oʻynagan», «amal», «бросил», «связали», «устроился».
- **Reference item (2 items).** C5-a1p3q5 and C5-a2p1q5 now ask who "she" is, in the same format as the verified C5-a1p1q5.
- **The usual sense as a distractor.** In several items the common sense is a distractor, so a reader who guesses without the text picks a wrong option: "found" (a lost thing), "saw the light" (the idiom), «поднялась» (dough rising in a pie story), «клевала» (a bird pecking).

**2. Informational passages on textbook facts (15 items).** These passages are on well-known topics: octopus, Svalbard, the Gregorian calendar, the Voynich manuscript, Registan, al-Xorazmiy, Baikal, penicillin and the metre. Any question that asks for one of their facts can be answered from general knowledge. The flagged items are C5-a2p2q1, b2p1q2, c1p1q1–q4, c2p1q1, uzm1q1, uzm1q2, uza1q1, uza1q2, rum1q1, ruh1q1, rua1q1 and rua1q3. As in K5, the v2 items ask about the text itself, not the facts in it:

- **Which topic or detail does the text give?** All four options are true or plausible, and only one is in the text (a2p2q1, c1p1q1, c2p1q1, uzm1q1, uza1q1, rum1q1, rua1q1).
- **Which statement does the text not make?** All four statements are true in the world, and three are in the text (c1p1q2, uzm1q2, uza1q2).
- **Which question does the text leave unanswered?** (c1p1q3, rua1q3)
- **How is the text organised?** (c1p1q4)
- **Four plausible reasons for siting an Arctic vault**, of which the text gives one (b2p1q2).
- **A detail of the penicillin story that general knowledge does not give**: Fleming was sorting the dishes with a former student (ruh1q1).

**3. Test-wise cues (11 items).**

- The key was the only moderate or balanced option among extreme or labelled ones: a2p2q4, b2p3q4, c1p3q4, ruh1q4, rua1q4, rua2q4.
- The stem itself gave both numbers: rum1q4.
- Common sense picked the only mundane texts: rua2q1.
- The name "water bear" explained itself: b1p2q3.
- Tool outlines on a workshop wall are a known convention: c2p2q1.
- The quoted idiom ("the voice people use for dentists and taxes") carried the answer: c2p2q3.

The fixes follow the K5 pattern:

- All four options are in the same category (four moderate positions, four plausible main ideas, four true pieces of the metre's history), and one detail of the text rules out each distractor: a2p2q4, b2p3q4, c1p3q4, rua1q4, rua2q4.
- The item becomes "which question is unanswered": b1p2q3, rum1q4, ruh1q4.
- A new detail or question on the same paragraph: rua2q1, c2p2q1, c2p2q3.

## Rewritten (67)

Flag column: AB = both solvers flagged `no_passage_needed`, B = solver B only.

| id | level | subskill | flag | v2 |
|---|---|---|---|---|
| C5-a1p2q5 | en A1 | vocab_in_context | AB | new word “window” (key: the windowsill) |
| C5-a1p3q5 | en A1 | vocab_in_context | AB | reference: “she” in “On Monday, she comes to my school” = Zarina |
| C5-a2p1q5 | en A2 | vocab_in_context | AB | reference: “she” who was joking = the mother, not the sister |
| C5-a2p2q1 | en A2 | literal | B | which fact is in the text: lifespan of four years (all four facts true of octopuses) |
| C5-a2p2q4 | en A2 | inferential | B | main idea with four plausible main ideas (safety, cleverness, arms) |
| C5-a2p2q5 | en A2 | vocab_in_context | AB | new word “carries” (key: transports; trap: holds in its arms) |
| C5-a2p3q5 | en A2 | vocab_in_context | AB | new word “found” (key: spotted the hat in the hall) |
| C5-b1p1q5 | en B1 | vocab_in_context | AB | new word “stands” (key: is kept there) |
| C5-b1p2q3 | en B1 | inferential | B | which question is unanswered: what tardigrades eat |
| C5-b1p2q5 | en B1 | vocab_in_context | AB | same word “state”, stem no longer quotes the sentence |
| C5-b1p3q5 | en B1 | vocab_in_context | AB | new phrase “saw the light” (literal; the idiom is a distractor) |
| C5-b2p1q2 | en B2 | literal | B | all four are plausible Arctic-vault reasons; only “no tectonic activity” is in the text |
| C5-b2p1q5 | en B2 | vocab_in_context | AB | new word “withdrew” (key: took back stored seeds) |
| C5-b2p2q5 | en B2 | vocab_in_context | AB | new word “forms” (key: papers to fill in) |
| C5-b2p3q4 | en B2 | inferential | B | four moderate fitness views; each distractor contradicted by a detail |
| C5-b2p3q5 | en B2 | vocab_in_context | AB | new word “push” (key: encouragement) |
| C5-c1p1q1 | en C1 | literal | AB | which topic is covered: the weekday after 4 October 1582 |
| C5-c1p1q2 | en C1 | literal | AB | which true statement is not made: July named after Caesar |
| C5-c1p1q3 | en C1 | inferential | AB | which question is unanswered: when Britain switched |
| C5-c1p1q4 | en C1 | inferential | AB | how the text is organised: problem → flawed fix → better fix and repair |
| C5-c1p1q5 | en C1 | vocab_in_context | AB | same word “wander”, stem no longer quotes the clause |
| C5-c1p2q5 | en C1 | vocab_in_context | AB | same word “cut”, stem no longer quotes the phrase |
| C5-c1p3q4 | en C1 | inferential | B | four moderate positions on boredom; each ruled out by a sentence |
| C5-c1p3q5 | en C1 | vocab_in_context | AB | same word “drifts”, stem no longer quotes the phrase |
| C5-c2p1q1 | en C2 | literal | AB | which detail is given: about 240 pages |
| C5-c2p1q5 | en C2 | vocab_in_context | AB | same word “settled”, stem no longer quotes the sentence |
| C5-c2p2q1 | en C2 | literal | B | why outlines were empty: tools lent and forgotten |
| C5-c2p2q3 | en C2 | inferential | AB | new question: what the mother not looking at the bench suggests |
| C5-c2p2q5 | en C2 | vocab_in_context | AB | new word “joint” (key: woodworking joint) |
| C5-c2p3q5 | en C2 | vocab_in_context | AB | same word “return”, last paragraph only (the text also uses the verb) |
| C5-uze1q5 | uz easy | vocab_in_context | AB | same word «uzib», unquoted; four senses of «uzmoq» |
| C5-uze2q5 | uz easy | vocab_in_context | AB | same word «qopladi», unquoted |
| C5-uze3q5 | uz easy | vocab_in_context | AB | same word «tugadi», unquoted |
| C5-uzm1q1 | uz medium | literal | AB | which topic is covered: UNESCO year |
| C5-uzm1q2 | uz medium | literal | B | which true statement is not made: 20th-century restoration |
| C5-uzm1q5 | uz medium | vocab_in_context | AB | new phrase «xizmat qilgan» (key: was used as) |
| C5-uzm2q5 | uz medium | vocab_in_context | AB | new word «ogʻir» (key: hard, demanding) |
| C5-uzm3q5 | uz medium | vocab_in_context | AB | same word «turdi», unquoted |
| C5-uzh1q5 | uz hard | vocab_in_context | B | same word «agʻdarildi», unquoted |
| C5-uzh2q5 | uz hard | vocab_in_context | AB | new word «oʻynagan» (key: played in a team) |
| C5-uzh3q5 | uz hard | vocab_in_context | AB | same phrase «qoʻyib yuborsang», unquoted |
| C5-uza1q1 | uz advanced | literal | AB | which topic is covered: the 12th-century Latin translation |
| C5-uza1q2 | uz advanced | literal | AB | which true statement is not made: astronomical tables |
| C5-uza1q5 | uz advanced | vocab_in_context | AB | new word «amal» (key: mathematical operation) |
| C5-uza2q5 | uz advanced | vocab_in_context | AB | new phrase «qoʻl koʻtarmaslik» (key: not raising a hand in class) |
| C5-uza3q5 | uz advanced | vocab_in_context | AB | same word «yozadi», unquoted; four senses of «yozmoq» |
| C5-rue1q5 | ru easy | vocab_in_context | AB | same word «поднялась», unquoted (dough sense as a trap) |
| C5-rue2q5 | ru easy | vocab_in_context | AB | new word «бросил» (key: threw) |
| C5-rue3q5 | ru easy | vocab_in_context | AB | new word «взял» (key: took along); «рыба не клевала» is also in q2’s stem |
| C5-rum1q1 | ru medium | literal | AB | which topic is covered: the lake’s age |
| C5-rum1q4 | ru medium | inferential | AB | which question is unanswered: why the water is so clear |
| C5-rum1q5 | ru medium | vocab_in_context | AB | same word «впадает», unquoted |
| C5-rum2q5 | ru medium | vocab_in_context | AB | same word «пятно», unquoted |
| C5-rum3q5 | ru medium | vocab_in_context | AB | same word «обходили», unquoted |
| C5-ruh1q1 | ru hard | literal | AB | detail general knowledge does not give: sorted the dishes with a former student |
| C5-ruh1q4 | ru hard | inferential | AB | which question is unanswered: why the substance could not be isolated |
| C5-ruh1q5 | ru hard | vocab_in_context | AB | new word «разделили» (key: shared the prize) |
| C5-ruh2q5 | ru hard | vocab_in_context | AB | same word «выпало», unquoted |
| C5-ruh3q5 | ru hard | vocab_in_context | AB | new word «ушёл» (key: the train left) |
| C5-rua1q1 | ru advanced | literal | AB | which topic is covered: the 0.2 mm discrepancy |
| C5-rua1q3 | ru advanced | inferential | B | which question is unanswered: why krypton-86 |
| C5-rua1q4 | ru advanced | inferential | B | four moderate reasons; the three distractors are true history not in the text |
| C5-rua1q5 | ru advanced | vocab_in_context | AB | new word «связали» (key: defined through) |
| C5-rua2q1 | ru advanced | literal | AB | detail: finishes a page and cannot recall its first paragraph |
| C5-rua2q4 | ru advanced | inferential | B | four moderate positions on reading; only the key is in the text |
| C5-rua2q5 | ru advanced | vocab_in_context | AB | same word «передачу», unquoted |
| C5-rua3q5 | ru advanced | vocab_in_context | AB | new word «устроился» (key: got a job) |

Every v2 item has the following:

- a new stem and new options, with the key at `options[0]`;
- a new `why` in en, uz and ru that also says why each distractor fails;
- `version: 2`, `status: "draft"` and `key_check_2: null`;
- a `quarantine_reason` that records the flag, the solver's reason and the fix.

`prior_b`, `time_s`, `instructions`, `source`, `author` and `key_check_1` are unchanged.

Uzbek text uses U+02BB for oʻ/gʻ and U+02BC for the tutuq belgisi. I checked every uz field of the 67 items, and no uz string contains an ASCII apostrophe, U+2018 or U+2019.

**Option length.** In my first draft the key was the single longest option in 28 of the 67 items, which is a cue a no-passage solver could use. After I lengthened distractors or shortened keys, the key is the longest option in none of the 67 and the single shortest in 11.

## Retired

None. Both solvers chose the key on all 210 items, and no item had two defensible answers. Every defect was in the question or the options, never in the passage, so every item could be rewritten. Each passage still carries its five items.

## Solver notes on verified items (read, none blocking)

On these 8 items a solver chose the key and did not set the flag, but wrote that general knowledge might help. By the rule they are verified. They are the first candidates if a stricter recheck is run.

| id | Note | Reading |
|---|---|---|
| C5-b1p1q4 (B1, inferential) | B: "guessable but B/C/D need some text context" | "not to expect much" is an idiom. Ruling out the distractors (not wanting him at the club, the cost, anger) needs the text. |
| C5-b1p2q1 (B1, literal) | A: "also known as 'moss piglet' by world knowledge" | The key ("In a piece of wet moss") is in the first sentence. World knowledge helps but is not needed. |
| C5-b2p1q1 (B2, literal) | B: "also knowable from background on Svalbard" | Who owns the seeds: a reader who knows how the vault works knows the answer. |
| C5-c2p1q3 (C2, inferential) | B: "also guessable from general reasoning" | "A pattern in the shape of a text is not the same thing as a meaning." The distractors are weak. |
| C5-uzh1q1 (uz hard, literal) | B: "also known trivia" | The year 1742. The other options are years from the same text. |
| C5-uza1q4 (uz advanced, inferential) | B: "also knowable from background" | Name → algorithm, title → algebra. |
| C5-ruh1q2 (ru hard, literal) | B: "a historically informed reader could also know this, but not typical students" | Chain drew Florey's attention to the paper. |
| C5-rua3q4 (ru advanced, inferential) | B: "arguably guessable from the quoted phrase alone" | «похвала не всегда звучит вслух»: the key is the only option about praise without words. |

## Notes and limits

- **No passage was changed.** `passages.json` is untouched. The stems and options of the 143 verified items are exactly what the solvers saw; I checked them against `.blind/C5-solverA.json`. On verified items only `key_check_2` and `status` changed.
- **Files edited:** `C5-1.json` … `C5-11.json` and this report. The formatting is kept: 1-space indent, CRLF line endings, and `prior_b` written as `x.0`.
- **The v1 text of the 67 rewritten items is not kept.** The C5 folder has not been committed yet, so git has no copy. The v1 stems and options survive only in the gitignored `.blind/C5-solverA.json` and `.blind/C5-solverB.json`. The v1 `why` texts are gone.
- **`prior_b` and `time_s` were carried over from v1.** Several v2 items are probably harder or slower than the items they replace: the "not made" and "unanswered" questions, and the C1/C2 vocabulary items without a quote. Recalibrate them after the recheck or from response data.
- **Residual risks for the recheck:**
  - Sibling items can give context away:
    - the distractor «подниматься на третий этаж» in C5-rue1q4 shows the climbing sense of «поднялась»;
    - C5-uzh1q2–q4 describe the reversed scale, which points to «agʻdarildi»;
    - C5-rue2q1 ("Куда упал мяч?") hints at «бросил».
  - **C5-c1p1 now carries four text-scope items** (topic, a statement not made, an unanswered question, organisation) on the Julian and Gregorian calendars. If the recheck flags them again, the fix is at the passage level: a less familiar fact or the author's own example, as the K5 report also concluded.
  - **Local dependence from v1 remains:** C5-a2p2q4 (main idea) and the verified C5-a2p2q3 ("First, Second, Third" lists the unusual features) point to the same answer.
- **Shuffle bias in `scripts/content/blind.mjs`** (not changed; it is outside this stream): the key falls on A or D in 156 of 210 items in solver A's copy (A 78, D 78) and in 147 of 210 in solver B's (A 93, D 54). K5 reported the same issue. A Fisher–Yates shuffle before the recheck would remove position as a cue.
- **Back-translation** of the uz and ru items (§5.5 step 5) has not been done.

## Next step

The 67 v2 items need a blind recheck:

1. Make fresh copies with a new option order: `node scripts/content/blind.mjs C5 solverC` and `… solverD`.
2. Solve only the 67 v2 ids, and write the answers before opening the maps.
3. Ask the solvers to apply the no-passage test explicitly, using the stem and options alone, without the passage or the sibling items.

A v2 that passes 2/2 becomes `verified_auto` with `key_check_2: "blind:2/2"`. A v2 that is flagged again should be retired, or its passage replaced. The bank README (`src/engine/data/content/README.md`) still lists only the K banks, so C5 (143 `verified_auto`, 67 `draft`) still needs to be added there.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 67 version-2 items: solverD and solverE (a second pass naming the passage's evidence words, checked by script) agree with every key; solverNP found 11 keys without the passage (quarantine). The 143 version-1 items (blind:2/2) were served again by reconcile.ts once the passages loaded. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 143 verified_auto (blind:2/2); 56 verified_auto (blind:solverD+solverE); 11 quarantine.

### The review of the pass (7 Oct 2026, after `e7becdd`)

solverD and solverE were two passes of one session, so together they are one check: `keycheck.ts` now counts solvers as agents, and
`blind:solverD+solverE` met ruling 1's "second independent solver" only on paper (see D26, "The review of this pass", finding 1).
`scripts/content/reconcile.ts <stream> --records --write` decided every item again from its record (the blind copies on disk had been
overwritten by later `--pending` copies, so the answers were not re-read) and took back to `draft`, with `key_check_2: "blind:solverD"`
(one agent) and `key_check_2_version`, the 56 version-2 items solverD and solverE agreed on (the 11 solverNP answered without the passage stay
quarantined). One separate solver agent on a `scripts/content/blind.ts <stream> <solver> --pending` copy makes them two checks; `reconcile.ts`
then serves them again.

Status and key check 2 now: 143 verified_auto (blind:2/2); 56 draft (blind:solverD); 11 quarantine.
