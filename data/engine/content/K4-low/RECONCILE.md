# K4-low: reconciling the blind key checks

Bank K4, stream K4-low (rungs arith, prealg, alg1, geom). Reconciled 2026-10-07.

The stream has two parts:

- **K4x-low**: 176 worked instances in `K4x-low-1.json` … `K4x-low-12.json`. These are two instances (`…a`, `…b`) of each of 88 families, all numeric entry. The blind check covered only these items.
- **K4-low**: 160 items in `K4-low-1.json` … `K4-low-8.json`. There are 88 families (K4-ar0001–0022, K4-pa0001–0022, K4-a10001–0022, K4-ge0001–0022) and 72 fixed items (K4-ar0023–0040, K4-pa0023–0040, K4-a10023–0040, K4-ge0023–0040). The fixed items are 44 numeric and 28 multiple choice.

## Sources

- The author key in each solver's order: `.blind/.map-K4x-low-solverA.json` and `.blind/.map-K4x-low-solverB.json`. Every K4x-low item is numeric, so each map entry is `{value, tolerance}` rather than a letter. Every tolerance is 0.
- The solvers' answers: `.blind/K4x-low-solverA.answers.json` and `.blind/K4x-low-solverB.answers.json`.
- Both answer files cover all 176 items. The maps match the content files, with no id missing on either side.

## The rule applied

An item is **verified** only when both solvers gave the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item would get a new version, `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. A K4x item's family in K4-low would be fixed along with it.

## Counts

| Result | Items |
|---|---|
| Verified (`verified_auto`, `blind:2/2`) | **176** |
| Rewritten (new version, `draft`, quarantined) | **0** |
| Retired | **0** |

- **Solver A** gave the key on 176 of 176 items and raised no flags.
- **Solver B** gave the key on 176 of 176 items and raised no flags.
- Every answer is a plain integer string such as `"100"` or `"-1"`, and matches the key exactly (tolerance 0).
- The 176 verified items keep `version: 1`. No `quarantine_reason` was added.

## Extra checks in this pass

The rule only compares answers, so two further checks were run.

1. **Every key was recomputed by hand:** 176 of 176 are correct. Answers that a student could misread were checked against the stem's wording:
   - order of operations (K4x-ar007, ar009);
   - the greatest integer under a strict inequality (K4x-a1010a: 2x + 9 < 26 gives x < 8.5, so x = 8);
   - "price increase in percent" (K4x-pa007);
   - the side opposite 30° (K4x-ge022).

   None of them is ambiguous.
2. **Every K4x item was checked against its K4-low family.** For each item:
   - the base parameters are inside the family's ranges or lists;
   - the derived parameters equal the family's `derived` formulas;
   - the `constraints` hold;
   - the en, uz and ru stems are exactly the family's stems with the parameters filled in (negatives written with U+2212);
   - `answer_numeric.value` equals the family's `answer` formula, and the tolerance matches.

   The result is 176 of 176 consistent, two instances for each of the 88 families.

One limit on how independent the check was: the numeric items are not shuffled, so the two blind copies are byte-identical and so are the two maps. The two answer files are also byte-identical, which is expected when both solvers get everything right. The files cannot show whether the solver runs were independent. The hand recomputation in check 1 is a third check that does not depend on the solvers.

## What this does not verify (K4-low itself)

**No K4-low file was changed.** All 160 K4-low items stay `draft` with `key_check_2: null`, for two reasons:

- **The 88 families.** Two instances each, both checked 2/2, show that each template's wording and formula are right at those values. They do not cover the whole parameter range. Under the P5 spec §5.5 step 4, key check 2 for a math family is an independent solver implementation over 50 random instances per template. That solver is P5b's engineering work, and it has not run yet. The families should become `verified_auto` only after it passes.
- **The 72 fixed items** (18 in each of `K4-low-2`, `-4`, `-6`, `-8`) were not in any blind copy. Only K4x-low was blinded, so no key check 2 of any kind has run on them.

## Next steps

1. Blind-check the 72 fixed K4-low items with two solvers (`node scripts/content/blind.mjs K4-low <solver>`). The blind copy will also contain the 88 family items with unfilled `{param}` stems. Solvers should skip those, or the families should be filtered out of the copy. The 28 multiple-choice items are shuffled per solver, so their maps will differ.
2. Run P5b's independent math solver over 50 random instances of each of the 88 families. Then set the families to `verified_auto`.
3. Back-translation of the uz and ru math stems (§5.5 step 5) is separate. It has not been done for this stream.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 72 fixed items: solverD (by hand) and solverE (each stem formalised as code) agree with every key. 45 families keyed by the independent solver, 43 word-problem families by three blind-verified edge instances each (K4x-low-13..17, blind-instances:3), 13 new SAT families (K4-sal, K4-sap) by the solver with family.relation. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 72 verified_auto (blind:solverD+solverE); 45 verified_auto (solver:stem@50); 43 verified_auto (blind-instances:3); 13 verified_auto (solver:relation@50).

### The review of the pass (7 Oct 2026, after `e7becdd`)

solverD and solverE were two passes of one session, so together they are one check: `keycheck.ts` now counts solvers as agents, and
`blind:solverD+solverE` met ruling 1's "second independent solver" only on paper (see D26, "The review of this pass", finding 1).
`scripts/content/reconcile.ts <stream> --records --write` decided every item again from its record (the blind copies on disk had been
overwritten by later `--pending` copies, so the answers were not re-read) and took back to `draft`, with `key_check_2: "blind:solverD"`
(one agent) and `key_check_2_version`, the 72 fixed items. The 43 families keyed by their edge instances (K4x-low-13..17, also solved by that one session)
went back to `draft` with `key_check_2: null`: the validator now checks a `blind-instances` family's three edge instances instead of the label. One separate solver agent on a `scripts/content/blind.ts <stream> <solver> --pending` copy makes them two checks; `reconcile.ts`
then serves them again.

Status and key check 2 now: 45 verified_auto (solver:stem@50); 13 verified_auto (solver:relation@50); 72 draft (blind:solverD); 43 draft
(no key check 2, the families waiting for their edge instances).
