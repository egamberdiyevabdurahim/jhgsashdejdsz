# K1-high: key-check reconciliation (blind check 1, 2026-10-07)

Bank K1, stream K1-high, files `K1-high-1.json` … `K1-high-5.json`, 90 items (K1-hc1001–1060, K1-hc2001–2030).

Inputs: the author key (`.blind/.map-K1-high-solverA.json`, `.blind/.map-K1-high-solverB.json`, the key letter in each solver's own shuffle) against `.blind/K1-high-solverA.answers.json` and `.blind/K1-high-solverB.answers.json`.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`. Otherwise it is rewritten, or retired if it cannot be fixed.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | 83 | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | 7 | `status: "draft"`, `key_check_2: null`, version 2, `quarantine_reason` set |
| Retired | 0 | n/a |

Key agreement was 90/90 for both solvers: no solver chose a wrong option, and nobody flagged `two_defensible` or `unanswerable`. All 7 rewrites come from one flag: solver B marked `no_passage_needed`.

## Rewritten (7)

The same defect appears in all seven, all of them short-text reading items: the key was the only hedged or moderate option ("Not everyone…", "Some residents…", "may cause…", "seemed driven by…"). The three distractors were absolute ("altogether", "completely", "entirely", "from the very start") or contradicted the question itself. That meant a test-wise student could find the key without reading the text. The key was also usually the shortest option.

The fix in v2: the stem (the text) and the key's meaning stay the same. All three distractors are replaced with moderate, plausible options that the text rules out, such as a reversed claim, an unstated cause, or a misplaced detail ("forty minutes" becomes "forty days", peak times become night). All four options are 8–10 words and use the same register. The `why` (en/uz/ru) now also says why the distractors fail.

| id | level / subskill | Solver A | Solver B | What changed in v2 |
|---|---|---|---|---|
| K1-hc1020 | C1 implication_contrasting_views | key, note: "weak cue: A is the only hedged option" | key, no_passage_needed | The key is now specific ("Daily drivers' experience does not match the council's claim"). The distractors are: the council concedes, journeys got slower, drivers switched to the bus. |
| K1-hc1039 | C1 detail_consequence | key | key, no_passage_needed | The extreme distractors (new shop, most bought cars, grow almost all food) are replaced by: a bus to the next town, supermarket delivery, neighbours selling from home. |
| K1-hc1040 | C1 inference_change_over_time | key | key, no_passage_needed | All four options now describe a change in reputation: grew late (key), lost early popularity, critics praised but readers ignored, hailed as a classic soon after. |
| K1-hc1059 | C1 inference_change | key | key, no_passage_needed | The non-change distractor "had already read her" is gone. All options are now changes: became a favourite (key), found poems harder, learned to write in her style, admirers grew tired. |
| K1-hc1060 | C1 detail_paraphrase_warning | key | key, no_passage_needed | Every option now uses "may". The distractors are: close the bridge for forty minutes, delays mainly at night, forty days to finish. |
| K1-hc2014 | C2 inference_motive | key | key, no_passage_needed | Every option is now a plausible reason an apology fails: timing suggested image concern (key), vague rehearsed wording, blamed others, came before the facts were known. |
| K1-hc2028 | C2 writer_view_concession | key | key, no_passage_needed | Every option is now a mixed or balanced view: better as story than history (key), careful history but hard going, gripping but few finish, equally good as both. |

The `quarantine_reason` on each of these items records the flag and the fix. Each v2 needs a fresh blind check: run `node scripts/content/blind.mjs K1-high <solver>` with two new solver names, and only v2 items need solving. A v2 becomes `verified_auto` only after it passes 2/2.

## Retired

None. All 7 items had a sound key and a sound text, so the fix was to the distractors only.

## Notes

- Solver A's note on K1-hc1020 named the same cue as solver B but did not set the flag. The rewrite covers it.
- Solver B's note on K1-hc1028 ("C (has lived) only defensible in very informal usage, contradicted by arrived last week") is not a flag. Both solvers chose the key, so the item is verified unchanged.
- No item in this stream has a `family`. The K4x family rule does not apply here.
- Only K1-high files were edited.

## Blind recheck of the 7 v2 rewrites (solver C, 2026-10-07)

Input: `node scripts/content/blind.mjs K1-high solverC` → `.blind/K1-high-solverC.json`, solved blind. The answers were written to `.blind/K1-high-solverC.answers.json` before `.blind/.map-K1-high-solverC.json` was opened. Only the 7 v2 ids were solved.

| id | Solver C | Key (solver C shuffle) | Flags | Outcome |
|---|---|---|---|---|
| K1-hc1020 | B | B | none | verified |
| K1-hc1039 | A | A | none | verified |
| K1-hc1040 | D | D | none | verified |
| K1-hc1059 | A | A | none | verified |
| K1-hc1060 | D | D | none | verified |
| K1-hc2014 | B | B | none | verified |
| K1-hc2028 | A | A | none | verified |

Counts: 7 verified, 0 retired. Key agreement was 7/7, and nothing was flagged `two_defensible`, `unanswerable` or `no_passage_needed`. The v2 distractors are each ruled out by a specific detail of the text, so none of them can be eliminated from the options alone.

These 7 items now have `status: "verified_auto"`, `key_check_2: "blind:recheck"` and version 2. The stale `quarantine_reason` was removed so they match the shape of the other verified items; the history is kept above. All 90 K1-high items are now `verified_auto`.

Caveat: this recheck used one fresh solver, as the workflow instructed. The earlier rule in this file asked for two fresh solvers (2/2). `key_check_2: "blind:recheck"` marks these items as single-solver rechecks, so they stay distinct from the `blind:2/2` items.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 7 version-2 items keyed "blind:recheck" were solved again by solverD: with solverC they agree on all 7 -> blind:solverC+solverD. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 83 verified_auto (blind:2/2); 7 verified_auto (blind:solverC+solverD).
