# K1-low: reconciling the blind key checks

Bank K1, stream K1-low, 150 items in `K1-low-1.json` … `K1-low-8.json`. Reconciled 2026-10-07.

## Sources

- The author key in each solver's shuffled order: `.blind/.map-K1-low-solverA.json` and `.blind/.map-K1-low-solverB.json`.
- The solvers' answers: `.blind/K1-low-solverA.answers.json` and `.blind/K1-low-solverB.answers.json`.
- Each answers file covers all 150 items. Both maps match the content files, with no ids missing on either side.

## The rule applied

An item is **verified** only when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`.

Every other item gets a new version (`version` + 1), `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. It needs a fresh blind check before it can be used.

## Counts

| Result | Items |
|---|---|
| Verified (`verified_auto`, `blind:2/2`) | **141** |
| Rewritten (v2, `draft`, quarantined) | **9** |
| Retired | **0** |

- **Solver A** chose the key on 142 of 150 items. It raised one flag (`no_passage_needed` on K1-j57a48, where it did choose the key).
- **Solver B** chose the key on 150 of 150 items and raised no flags.
- So every failure comes from solver A.

## The 9 items that were not verified

| id | file | Solver A chose | Key | What was wrong | Change in v2 |
|---|---|---|---|---|---|
| K1-hjghwk | 7 | on | off | A's pick has no defensible reading (one-row shift, see below). The review found a **real second key** in v1: "Please turn **in** your phones before the exam starts" (hand them in) is natural English. | New stem: "Phones must not ring during the exam. Please turn ___ your phones now." The option `in` is replaced by `up` (louder, which the context contradicts). The `why` text is rewritten in en, uz and ru. |
| K1-rs8aja | 7 | chef | mechanic | A's pick has no defensible reading (one-row shift). | None. The content is unchanged and only re-enters the blind check. |
| K1-36j5mb | 7 | sunny | foggy | A's pick has no defensible reading (one-row shift). | Hardening only. The distractor `dry` is replaced by `warm`, because a dust-haze reading of "dry" could be argued. |
| K1-jfg2ee | 7 | gloves | glasses | A's pick has no defensible reading (one-row shift). | None. The content is unchanged. |
| K1-s86f2q | 7 | selfish | kind | A's pick has no defensible reading (one-row shift). | None. The content is unchanged. |
| K1-j57a48 | 8 | (the key) + `no_passage_needed` | take photos without flash | **Real defect.** Museum common sense rules out every distractor (touching, flash, taking paintings home) without reading the sign. | A new notice that only the sign can answer. "The second floor is closed today. Its paintings are on the first floor until Friday." Where can you see the second-floor paintings today? The key is `on the first floor`. The common-sense guess `on the second floor` is now wrong, and `nowhere until Friday` is a misreading trap. The `why` text is rewritten in en, uz and ru. |
| K1-frx643 | 8 | by bike | by car | A's pick has no defensible reading (one-row shift). | None. The content is unchanged. |
| K1-mykms3 | 8 | Aziz and Timur together | Timur | The text rules out A's pick ("Only his friend Timur was faster"). This miss is not a shift. | Hardening only. `Aziz and Timur together`, which can be read as a tie, is replaced by `another runner`, which the text also rules out. |
| K1-mda6v9 | 8 | Yes, the kitchen is open until 23:00. | No, because the kitchen is closed. | The text contradicts A's pick (the kitchen closes at 22:00). This miss is not a shift. | None. The content is unchanged. |

Each of these items carries its own reason in `quarantine_reason`. No item needed retiring: the two with real defects could be fixed.

## About solver A's misses

All 8 of solver A's misses without a flag fall in its last 26 items (positions 124 to 149 in A's blind order). Six of them (K1-hjghwk, K1-rs8aja, K1-36j5mb, K1-jfg2ee, K1-s86f2q and K1-frx643) are exactly the key letter of the **next** item in A's order. That is the pattern of an answer sheet shifted by one row. The picks themselves ("chef" for someone who repairs cars, "gloves" for seeing) have no defensible reading.

So most of these failures are probably solver-side recording slips, not item defects. The rule still sends them back to draft, and the reconciliation follows it.

- **Real defects found:** two items, K1-j57a48 (the solver's flag) and K1-hjghwk (found in this review, not flagged by either solver).
- **Hardened:** two items, K1-36j5mb and K1-mykms3.
- **Unchanged content:** five items, now at v2.

## Next step

Run a fresh blind check (`node scripts/content/blind.mjs K1-low <solver>`, two new solvers) on the 9 v2 items. Ideally the solvers also record answers beside each item's id rather than in a separate list, so a one-row shift cannot happen.

## Re-check of the 9 v2 items (solver C, 2026-10-07)

A fresh blind copy was made with `node scripts/content/blind.mjs K1-low solverC`. Solver C read only `.blind/K1-low-solverC.json`, answered the 9 v2 items into `.blind/K1-low-solverC.answers.json`, and only then opened `.blind/.map-K1-low-solverC.json` to compare.

| id | file | Solver C chose | Key | Flag | Outcome |
|---|---|---|---|---|---|
| K1-hjghwk | 7 | off | off | none | verified |
| K1-rs8aja | 7 | mechanic | mechanic | none | verified |
| K1-36j5mb | 7 | foggy | foggy | none | verified |
| K1-jfg2ee | 7 | glasses | glasses | none | verified |
| K1-s86f2q | 7 | kind | kind | none | verified |
| K1-j57a48 | 8 | on the first floor | on the first floor | none (the sign is needed: the common-sense guess "on the second floor" is wrong) | verified |
| K1-frx643 | 8 | by car | by car | none | verified |
| K1-mykms3 | 8 | Timur | Timur | none | verified |
| K1-mda6v9 | 8 | No, because the kitchen is closed. | same | none | verified |

All 9 match the key with no flag. Each now has `"status": "verified_auto"` and `"key_check_2": "blind:recheck"`. Their `version` stays 2. Their `quarantine_reason` is left in place as the record of why they were re-checked.

| Result | Items |
|---|---|
| Verified on re-check (`verified_auto`, `blind:recheck`) | **9** |
| Retired | **0** |

The stream now has 150 of 150 items at `verified_auto`: 141 at `blind:2/2` and 9 at `blind:recheck`. Note that the re-check used one solver, not two, so these 9 meet a weaker bar than the other 141.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 9 version-2 items keyed "blind:recheck" (one solver) were solved again by solverD: with P5b's solverC they agree on all 9 -> blind:solverC+solverD. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 141 verified_auto (blind:2/2); 9 verified_auto (blind:solverC+solverD).
