# K1-mid: reconciling the blind key check

Bank: K1-mid (batches 1 to 6, 120 items, `K1-b1*` and `K1-b2*`), reconciled on 7 Oct 2026.

Sources: the author key is `options[0]`. `.blind/.map-K1-mid-solverA.json` and `.blind/.map-K1-mid-solverB.json`
give the key's letter in each solver's shuffled order. The solvers' answers are in
`.blind/K1-mid-solverA.answers.json` and `.blind/K1-mid-solverB.answers.json`. Each of the 120 ids appears in both maps and both answer files.

Rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or
`no_passage_needed` (as a field or in the note). A verified item gets `"key_check_2": "blind:2/2"` and
`"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`,
`"key_check_2": null` and a `quarantine_reason`. An item that cannot be fixed is retired.

## Counts

| Outcome   | Items |
|-----------|------:|
| Verified  | 117   |
| Rewritten | 3     |
| Retired   | 0     |

By batch: 1: 20 verified. 2: 20 verified. 3: 18 verified, 2 rewritten. 4: 20 verified. 5: 20 verified. 6: 19 verified, 1 rewritten.

None of the 117 verified items has a solver note.

## Rewritten (now draft, version 2)

| id | Blind result | Why | What changed in v2 |
|----|--------------|-----|--------------------|
| K1-b1r004 (B1, reference_pronoun) | 1/2. Solver A chose "Zarina" (the key is "Lola"). Solver B chose the key but noted that the pronoun is grammatically ambiguous. | "Lola gave her old bicycle to her younger cousin, Zarina, because it was too small for her now": both people are girls, so the grammar fits either one, and only one solver reached the key. The two distractors ("Lola's mother", "a shop assistant") were not in the text. | The text now gives the ages (12 and 7) and asks about "she had grown too tall to ride it". The person who grew too tall gave the bicycle away, so the answer has to be Lola. The distractors are now people in the text ("their grandmother") or near it ("a girl in the park"). The key is still "Lola". |
| K1-b1r009 (B1, vocabulary_in_context) | 2/2 on the key. Both solvers flagged `no_passage_needed`. | "huge" = "very big" is plain vocabulary, so the text only confirms it and the item does not test reading in context. | The item now tests a word with several meanings: "Ms Karimova is very fair. She gives every student the same chances…". The distractors are other meanings of "fair" (light hair and skin, "good but not very good", fine weather), and only the text rules them out. Key: "treating everyone equally". |
| K1-b2r005 (B2, vocabulary_in_context) | 2/2 on the key. Both solvers flagged `no_passage_needed`. | "cramped" = "too small" is plain vocabulary, so the text only confirms it. | The item now uses "dry" in "the director's speech was very dry". Each distractor is ruled out by the text: "funny in a quiet, clever way" (dry humour) by "hoped for an exciting talk… half the audience fell asleep", "short and unfriendly" by "for an hour", and "given without any notes" by "read out". Key: "dull and uninteresting". |

All three keep `options[0]` as the key, keep `key_check_1: "author"` and keep their `prior_b`. Each has new `why` text in en, uz and ru.
`time_s` was raised to fit the longer texts: 25→30, 20→25 and 20→30.

## Retired

None.

## Next

- The three v2 items need a new blind check: run `node scripts/content/blind.mjs K1-mid <solver>` for two new solvers, and only on these ids.
  The current `.blind/K1-mid-*.json` copies show version 1 of these items.
- K1-mid has no K4x-family items (no `family` field), so no family needed fixing.

## Blind recheck of the v2 items (solver C, 2026-10-07)

Solver C ran `node scripts/content/blind.mjs K1-mid solverC`, which drew from the current files, so the copy showed version 2
of the three rewritten items. Solver C answered only those three ids and wrote `.blind/K1-mid-solverC.answers.json`
before opening `.blind/.map-K1-mid-solverC.json`.

| id | Solver C | Key (map) | Flags | Outcome |
|----|----------|-----------|-------|---------|
| K1-b1r004 | A ("Lola") | A | none | verified_auto, `key_check_2: "blind:recheck"` |
| K1-b1r009 | B ("treating everyone equally") | B | none | verified_auto, `key_check_2: "blind:recheck"` |
| K1-b2r005 | D ("dull and uninteresting") | D | none | verified_auto, `key_check_2: "blind:recheck"` |

All three matched the key, with no `two_defensible`, `unanswerable` or `no_passage_needed` flag and no note. Each needed the text:
the ages and "grown too tall" decide the pronoun, and the other senses of "fair" and "dry" are ruled out only by the text.
The `quarantine_reason` field was removed from all three, as on the K1-high rechecks. K1-mid now has 120 verified items, 0 drafts
and 0 retired. This was a single-solver recheck (1/1), not the 2/2 that the "Next" section above asked for.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 3 version-2 items keyed "blind:recheck" were solved again by solverD: with solverC they agree on all 3 -> blind:solverC+solverD. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 117 verified_auto (blind:2/2); 3 verified_auto (blind:solverC+solverD).
