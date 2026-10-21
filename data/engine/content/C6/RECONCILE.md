# C6: key-check reconciliation (blind check 1, 2026-10-07)

Bank C6 (SAT Reading and Writing, discrete items, English only). There are 6 files, `C6-1.json` … `C6-6.json`, with 20 items each, 120 in all: 40 at B1 (SAT easy), 40 at B2 (medium) and 40 at C1 (hard). The four SAT domains have 30 items each, and every domain has 10 items per level. In the ids, `cs` = craft_structure, `ii` = information_ideas, `se` = standard_english_conventions, `ei` = expression_ideas; `e` / `m` / `h` = easy / medium / hard.

| Domain | Ids | Subskills (items per level) |
|---|---|---|
| craft_structure | `C6-cse*`, `C6-csm*`, `C6-csh*` | words_in_context 5, text_structure_purpose 3, cross_text_connections 2 |
| information_ideas | `C6-iie*`, `C6-iim*`, `C6-iih*` | central_ideas_details 3, command_of_evidence_textual 2, command_of_evidence_quantitative 2, inferences 3 |
| standard_english_conventions | `C6-see*`, `C6-sem*`, `C6-seh*` | boundaries 5, form_structure_sense 5 |
| expression_ideas | `C6-eie*`, `C6-eim*`, `C6-eih*` | transitions 5, rhetorical_synthesis 5 |

Inputs: the author key is `options[0]`. `.blind/.map-C6-solverA.json` and `.blind/.map-C6-solverB.json` give the key's letter in each solver's shuffled order. The solvers' answers are in `.blind/C6-solverA.answers.json` and `.blind/C6-solverB.answers.json`. All 120 ids appear in both maps and both answer files, and no other ids appear.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`, either as a field or in the note. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`. An item that cannot be fixed is retired.

## Integrity checks before reconciling

- **The maps match the current files.** I recomputed each map from the files with `scripts/content/blind.mjs`'s seeded shuffle (`<solver>:<id>`). Neither solver's map has a mismatch (0/120 for A, 0/120 for B).
- **The blind copies match the current files.** In `.blind/C6-solverA.json` and `.blind/C6-solverB.json`, every stem and every shuffled option set matches the current `C6-*.json`. Both solvers therefore saw the version that is being verified.
- **Starting state.** All 120 items were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`. All ids are unique, and no item has duplicate options.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **120** | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | **0** | n/a |
| Retired | **0** | n/a |

Both solvers chose the key on all 120 items. Neither answer file has any field besides `answer` and `note`, so there is no flag field, and no note contains `two_defensible`, `unanswerable` or `no_passage_needed`. By level: B1 40/40, B2 40/40, C1 40/40. By domain: craft_structure 30/30, information_ideas 30/30, standard_english_conventions 30/30, expression_ideas 30/30.

The change was made as a text replacement of the two lines in each item, so the files keep their formatting (for example `"prior_b": 0.0`). Parsing each file before and after showed that no other field changed.

## Solver notes (read, none blocking)

Both solvers wrote a one-line reason for every item. I also searched the notes for words of doubt (ambiguous, either, both, unclear, defensible). Every hit is about the passage, not about the key. The notes that comment on more than the key are below. I read each one against its item.

| id | Note | Reading |
|---|---|---|
| C6-cse001 (B1, words_in_context) | A: "sudden contradicts gradual" | Matches the `why`: the gain took weeks of steady practice, so "sudden" fails and "remarkable" fits. |
| C6-csh002 (C1, words_in_context) | A: "unclear clauses -> equivocal" | "unclear clauses" quotes the passage. It is the clue for "equivocal", not doubt about the key. |
| C6-iie010 (B1, inferences) | A and B: "algebra and algorithm both…" | "both" refers to the two words named in the passage. |
| C6-sem007 (B2, form_structure_sense) | A: "neither/nor agrees with nearer 'players'" | "neither/nor" is the rule being tested. |
| C6-iih005 (C1, command_of_evidence_textual) | A and B name the replication option as the distractor ("only replicates") | Re-running the sunlight test repeats the result but does not rule out other differences between the cups. The dark-room control does, so the key is unique. |
| C6-iih010 (C1, inferences) | B: "suspect not conclude" | The stem says "might reasonably suspect, though not conclude". The key (the blood also carries oxygen with a copper-rich protein) is hedged in the same way. The "must have exactly three hearts" option over-concludes. |
| C6-eih003 (C1, transitions) | B: "contrast with printed maps, mid-sentence though" | The blank sits after "The map on the visitor center's sign," and the option is "though,". The pair of commas around "though" is correct, and therefore / for instance / likewise do not fit the contrast. The note describes where the word sits. It does not doubt the key. |

## Rewritten

None.

## Retired

None.

## Next

- All 120 C6 items are now `verified_auto` with 2/2 blind agreement. No item is in quarantine.
- This pass checks only the keys. It does not re-check the `why` text in uz/ru, or the `source.facts` on the information_ideas items that cite an outside article.
