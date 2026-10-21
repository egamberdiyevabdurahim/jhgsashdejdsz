# C1x: key-check reconciliation (blind check 1, 2026-10-07)

Bank C1x: the worked instances of the C1 math practice families. There are 10 files, `C1x-1.json` … `C1x-9.json` with 20 items each and `C1x-10.json` with 16, 196 in all. Every one of the 98 families in `../C1/` has two instances (`…a`, `…b`), each with `family_ref` and `params`. 188 items are numeric entry (`answer_numeric`, with the key also as `options[0]`). The other 8 (`sat21`, `pcp04`, `pcp07`, `pcp10`, a and b) are multiple choice only.

| Rung | Items | Id prefixes |
|---|---:|---|
| arith | 16 | `arp` 16 |
| prealg | 24 | `pap` 16, `sat` 8 |
| alg1 | 32 | `a1p` 16, `sat` 16 |
| geom | 32 | `gep` 20, `sat` 12 |
| alg2 | 30 | `a2p` 18, `sat` 12 |
| precalc | 20 | `pcp` 20 |
| calc | 20 | `clp` 20 |
| beyond | 22 | `bcp` 22 |
| **Total** | **196** | 48 of them SAT-format (`sat`) |

Inputs: the author key is `options[0]`. `.blind/.map-C1x-solverA.json` and `.blind/.map-C1x-solverB.json` give the key's letter in each solver's shuffled order. The solvers' answers are in `.blind/C1x-solverA.answers.json` and `.blind/C1x-solverB.answers.json`. All 196 ids appear in both maps and both answer files, and no other ids appear.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`, either as a field or in the note. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. An item that cannot be fixed is retired.

## Integrity checks before reconciling

- **The maps match the current files.** I recomputed each map from the files with `scripts/content/blind.mjs`'s seeded shuffle (`<solver>:<id>`). Neither solver's map has a mismatch (0/196 for A, 0/196 for B).
- **The blind copies match the current files.** In `.blind/C1x-solverA.json` and `.blind/C1x-solverB.json`, every stem (en, uz, ru) and every shuffled option set matches the current `C1x-*.json`. Both solvers therefore saw the version that is being verified.
- **The two keys agree.** On all 188 numeric items, `options[0]` equals `answer_numeric.value` within its tolerance. Six items have tolerance 0.01 (`sat18a/b`, `clp07a/b`, `bcp05a/b`, the "round to hundredths" families), and their `options[0]` is the rounded value.
- **Starting state.** All 196 items were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`. All ids are unique, no item has duplicate options, and each of the 98 `family_ref`s has exactly two instances.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **196** | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | **0** | n/a |
| Retired | **0** | n/a |

Both solvers chose the key on all 196 items. Neither answer file has any field besides `answer` and `note`, so there is no flag field, and no note contains `two_defensible`, `unanswerable` or `no_passage_needed`. By rung: arith 16/16, prealg 24/24, alg1 32/32, geom 32/32, alg2 30/30, precalc 20/20, calc 20/20, beyond 22/22.

The change was made as a text replacement of the two lines in each item, so the files keep their formatting. Parsing each file before and after showed that no other field changed.

## Solver notes (read, none blocking)

Solver A wrote "computed <value>" on every item, and solver B wrote the working (for example "427+244", "lcm(12,16)"). I searched both sets of notes for words of doubt (ambiguous, either, both, unclear, defensible, assume, approximately, round, not offered). The only hits are below.

| id | Note | Reading |
|---|---|---|
| C1x-arp04a (arith, division_remainder) | B: "139/7=19.86, round up" | The stem asks for the smallest number of boxes of 7 that holds 139 pencils, so rounding up to 20 is the method being tested. The key is 20, and 19 (round down) is a coded distractor. |
| C1x-arp04b (arith, division_remainder) | B: "99/8=12.375, round up" | Same family: 13 boxes, with 12 as the round-down distractor. |

## Rewritten

None.

## Retired

None.

## Limits of this pass

- **The blind copies showed options.** Each solver picked a letter from four options, including on the 188 numeric items, whose instructions say "Type your answer as a number". So this pass confirms that the key is the right one of the four. It does not test typed-answer grading, for example the 0.01 tolerance on the six rounding items, or how a typed "5.333" or "16/3" would be read for `clp07a`.
- **Only the keys were checked.** This pass does not re-check the `why` text in uz and ru, or the distractors' error-rule codes.
- **The C1 families stay `draft`.** C1x shows that each family's wording and formula give the right key at two parameter sets. It does not cover each family's parameter range. The families in `../C1/` were not changed here.

## Since 9 Oct 2026: ten instances are version 2 and wait for a blind check

Six C1 families got whole distractors or a constraint (`../C1/README.md` "Since 9 Oct"), and an instance is its family's render. Ten
instances show other options than the two solvers above chose among: `a2p04a/b`, `pap03a/b`, `pap04a/b`, `gep09a/b`, `a2p09a/b`.
Each is `version: 2`, `status: "draft"`, `key_check_2: null` (a check belongs to its version, D26); its key (`options[0]`,
`answer_numeric.value`) is the one verified above. They need blind solvers of two agents (`scripts/content/blind.ts C1x <solver>
--pending`, then `reconcile.ts`). Eight more follow a reworded stem or why with the same options and key and keep version 1 and
`blind:2/2`: `sat16a/b` (uz "… ifodalang"), `sat18a/b` and `clp07a/b` (the stem now says to round to hundredths, as their
instruction line did; "≈" in the why), `pcp10a/b` (the why's step). So C1x holds 186 `verified_auto` and 10 `draft`.

## Next

- All 196 C1x items are now `verified_auto` with 2/2 blind agreement. No item is in quarantine. (Until 9 Oct: see the section above.)
- The bank README (`../README.md`) still lists only the K banks. C1x (196 `verified_auto`) needs to be added when the C-bank pass is written up.
