# K4-high: reconciling the blind key checks

Bank K4, stream K4-high (rungs alg2, precalc, calc, beyond). Reconciled 2026-10-07.

The stream has two parts:

- **K4x-high**: 186 worked instances in `K4x-high-1.json` … `K4x-high-10.json`, two instances (`…a`, `…b`) of each of 93 families. 176 have a numeric key (`answer_numeric`) and carry four options with the key first. The other 10 are multiple choice only, from 5 families (K4-a2h007 powers of i, K4-pch006, K4-pch011, K4-clh017, K4-clh023). The blind check covered only these items.
- **K4-high**: 160 items in `K4-high-1.json` … `K4-high-8.json`, made of 93 families and 67 fixed multiple-choice items:

  | Rung | Families | Fixed items |
  |---|---|---|
  | a2h (alg2) | 30 | 10 |
  | pch (precalc) | 23 | 17 |
  | clh (calc) | 24 | 16 |
  | bch (beyond) | 16 | 24 |

## Sources

- The author key in each solver's order: `.blind/.map-K4x-high-solverA.json` and `.blind/.map-K4x-high-solverB.json`. Every K4x-high item has options, so every map entry is a letter. The options are shuffled per solver, so the two maps differ.
- The solvers' answers: `.blind/K4x-high-solverA.answers.json` and `.blind/K4x-high-solverB.answers.json`.
- Both maps and both answer files cover the same 186 ids as the content files. No id is missing on any side.

## The rule applied

An item is **verified** only when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item would get a new version, `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. A K4x item's family in K4-high would be fixed along with it, and an item that could not be fixed would be `retired`.

## Counts

| Result | Items |
|---|---|
| Verified (`verified_auto`, `blind:2/2`) | **186** |
| Rewritten (new version, `draft`, quarantined) | **0** |
| Retired | **0** |

- **Solver A** chose the key on 186 of 186 items and raised no flags or notes.
- **Solver B** chose the key on 186 of 186 items and raised no flags or notes.
- The 186 verified items keep `version: 1`. No `quarantine_reason` was added. Only `key_check_2` and `status` changed, and the files keep their bytes and CRLF line endings otherwise.

No item was rewritten or retired, so there are no reasons to list.

## Extra checks in this pass

The rule only compares answers, so three further checks were run.

1. **Every key was recomputed by hand: 186 of 186 are correct.** For each of the 93 families, the `answer` formula was checked against what the stem asks, and both instances were then worked out. Items where a student could misread what is asked were checked against the stem's wording:
   - displacement, not distance, on a velocity that changes sign (K4x-clh26a: v = 3t² − 4t on [0, 3] gives 9);
   - the strict inequality (K4x-a2h26: |x − 4| < 3 has 5 integers);
   - the domain cut on a log equation (K4x-pch23: x = 4 or −2, and only 4 is valid);
   - "no solution" versus "infinitely many" on the linear systems (K4x-a2h27: the constants are not in the ratio);
   - the local maximum of a cubic at x = −a (K4x-clh18);
   - the remainder of a power modulo 5 (K4x-bch39: 7⁴⁶ gives 4, 3³¹ gives 2).

   None of them is ambiguous.
2. **Every K4x item was checked against its K4-high family, by script.** For each item:
   - the base parameters are inside the family's ranges, steps or value lists;
   - the `derived` values and the `constraints` hold;
   - the en, uz and ru `stem`, `why` and `instructions` are the family's text with the parameters filled in. The only differences are the decimal comma in the uz and ru `why` (3,5 for 3.5), which is deliberate localisation;
   - the options are exactly the family's `[answer] + distractors`, `option_templates` or `option_set`, key first;
   - `answer_numeric.value` equals option 1 and the family's `answer` formula, and the tolerance matches the family.

   The result is 186 of 186 consistent, two instances for each of the 93 families.
3. **No item has two options of equal value**, including fractions against decimals ('4/6' against 1.5, '2/4' against 0.375). Every item with a non-integer key (18 items) says "a decimal is fine". The 10 multiple-choice-only items say "Choose the correct answer".

One limit on how independent the check was: both solvers scored 186 of 186 with no notes at all, and both answer files were written about a minute after the blind copies (10:02 to 10:03). The answer files differ, as the shuffles differ, but the files cannot show whether the two runs were independent. The hand recomputation in check 1 is a third check that does not depend on the solvers.

## Observation, not a key defect

In 9 numeric-entry items the key is the only decimal among options written as fractions, so a test-wise student could pick it by its form if these items were ever served as multiple choice:

- K4x-pch19a and b
- K4x-clh02a and b
- K4x-clh03b
- K4x-bch28a
- K4x-bch32b
- K4x-bch37a and b

The cause is in the families' `option_templates`: `{ANS}` renders as a decimal while the distractors are fractions. This affects K4-pch019, K4-clh002, K4-clh003, K4-bch028, K4-bch032 and K4-bch037.

These items carry "Type the answer as a number; a decimal is fine." and are meant for numeric entry, where the options are not shown. So nothing was rewritten. If the engine ever shows their options, write the key as a fraction in those templates (or all options as decimals) and re-check them. Five distractors are also unreduced fractions ('4/6', '4/2', '16/6', '2/4', '6/8'); these are cosmetic.

## What this does not verify (K4-high itself)

**No K4-high file was changed.** All 160 K4-high items stay `draft` with `key_check_2: null`, for the same reasons as in K4-low:

- **The 93 families.** Two instances each, both checked 2/2 and recomputed by hand, show that each template's wording and formula are right at those values. They do not cover the whole parameter range. Under the P5 spec §5.5 step 4, key check 2 for a math family is an independent solver implementation over 50 random instances per template. That solver is P5b's engineering work, and it has not run yet. The families should become `verified_auto` only after it passes.
- **The 67 fixed multiple-choice items** (5 in `K4-high-1`, 5 in `-2`, 11 in `-3`, 6 in `-4`, 8 in `-5`, 8 in `-6`, 13 in `-7`, 11 in `-8`) were not in any blind copy. Only K4x-high was blinded, so no key check 2 of any kind has run on them.

## Next steps

1. Blind-check the 67 fixed K4-high items with two solvers (`node scripts/content/blind.mjs K4-high <solver>`). The blind copy will also contain the 93 family items with unfilled `{param}` stems. Solvers should skip those, or the families should be filtered out of the copy.
2. Run P5b's independent math solver over 50 random instances of each of the 93 families. Then set the families to `verified_auto`.
3. Decide how the 176 numeric-key K4x-high items are served. If they are ever served as multiple choice, fix the decimal-key cue above first.
4. Back-translation of the uz and ru math stems (§5.5 step 5) is separate. It has not been done for this stream.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 67 fixed items: solverD and solverE agree with every key. The 52 families P5b quarantined are version 2 (scripts/content/fix-k4-families.mjs): 15 keyed by the solver, 37 by edge instances (K4x-high-11..18). The other families: 13 solver, 25 edge instances; the 4 new SAT families (K4-sam) by the solver. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 67 verified_auto (blind:solverD+solverE); 65 verified_auto (blind-instances:3); 28 verified_auto (solver:stem@50); 4 verified_auto (solver:relation@50).

### The review of the pass (7 Oct 2026, after `e7becdd`)

solverD and solverE were two passes of one session, so together they are one check: `keycheck.ts` now counts solvers as agents, and
`blind:solverD+solverE` met ruling 1's "second independent solver" only on paper (see D26, "The review of this pass", finding 1).
`scripts/content/reconcile.ts <stream> --records --write` decided every item again from its record (the blind copies on disk had been
overwritten by later `--pending` copies, so the answers were not re-read) and took back to `draft`, with `key_check_2: "blind:solverD"`
(one agent) and `key_check_2_version`, the 67 fixed items. The 65 families keyed by their edge instances (K4x-high-11..18) went back to `draft` with
`key_check_2: null`. Two edge instances broke their family's version-2 constraint `a != b` (K4x-pch19x and K4x-clh02x, a = b = 2: options "1"
and "2/2") and are `retired`; K4x-pch19w and K4x-clh02w (a = 2, b = 5, in `K4x-high-19.json`) replace them, drafts no one has solved yet.
K4-pch039, K4-clh003 and K4-bch039 version 2 were rewritten by this session (`author: agent:p5int-rewrite`): a solver of that session does
not count for their instances, so their 9 edge instances (K4x-high-18) hold no key check 2 at all and need two other agents. One separate solver agent on a `scripts/content/blind.ts <stream> <solver> --pending` copy makes them two checks; `reconcile.ts`
then serves them again.

Status and key check 2 now: 28 verified_auto (solver:stem@50); 4 verified_auto (solver:relation@50); 67 draft (blind:solverD); 65 draft
(no key check 2, the families waiting for their edge instances).
