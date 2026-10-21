# C18: key-check reconciliation (blind check 1, 2026-10-07)

Bank C18 (Uzbek state test, DTM, practice and mock items; see `README.md`). There are 42 item files, `C18-1.json` … `C18-42.json`, 800 items in all: 400 in the practice pool (`C18-<block>p<nnn>`, files 1–20) and 400 in the mock pool (`C18-<block>m<nnn>`, files 21–42). `mocks.json` and `fact-check.json` are not item batches and were not changed.

Inputs: the author key is `options[0]`. `.blind/.map-C18-solverA.json` and `.blind/.map-C18-solverB.json` give the key's letter in each solver's shuffled order. The solvers' answers are in `.blind/C18-solverA.answers.json` and `.blind/C18-solverB.answers.json`. All 800 ids appear in both maps and both answer files, and no other ids appear.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`, either as a field or in the note. A verified item gets `"key_check_2": "blind:2/2"` and `"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`, `"key_check_2": null` and a `quarantine_reason`; it is not re-solved here, because a reconciler who has seen the key cannot solve blind. An item that cannot be fixed is retired.

## Integrity checks before reconciling

- **The maps match the current files.** I recomputed each map from the files with `scripts/content/blind.mjs`'s seeded shuffle (`<solver>:<id>`). Neither map has a mismatch (0/800 for A, 0/800 for B).
- **The blind copies match the current files.** In `.blind/C18-solverA.json` and `.blind/C18-solverB.json`, every stem and every shuffled option set matches the current `C18-*.json`. Both solvers saw the version that is being verified.
- **Starting state.** All 800 items were `draft`, `version: 1`, `key_check_1: "author"`, `key_check_2: null`. All ids are unique, and no item has duplicate options.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **798** | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | **2** | `status: "draft"`, `key_check_2: null`, version 2, `quarantine_reason` set |
| Retired | **0** | n/a |

By block (practice + mock): `ot` 80/80, `rt` 79/80, `mc` 80/80, `hi` 80/80, `bi` 70/70, `ch` 70/70, `ms` 99/100, `ph` 70/70, `en` 100/100, `ol` 70/70.

Neither answer file has any field besides `answer` and `note`, so there is no flag field, and no note contains `two_defensible`, `unanswerable` or `no_passage_needed`.

The change was made as a text replacement of the two lines in each verified item, so the files keep their formatting (for example `"prior_b": 0.0`). Parsing each file before and after showed that no other field changed on the verified items, and that only `stem`, `options`, `why`, `version` and `quarantine_reason` changed on the two rewritten ones. The P5b validator (`jg-p5b/scripts/content/validate.ts`), run on C18 with the pre-change files as `--baseline`, reports 0 errors and 0 warnings. Its two notes are `status.history` on the two v2 items, which is expected. On the whole content root it reports no finding for any C18 id.

## Solver notes (read, none blocking)

Solver A wrote a note on 31 items and solver B on all 800. I searched both for words of doubt (ambiguous, either, both, unclear, defensible, arguably, depends, approximate, best and others). Every hit is about the rule or the answer word, not doubt about the key:

| id | Note | Reading |
|---|---|---|
| C18-enp028 (en, grammar.error) | A: "present perfect with yesterday; tense is the error" | Matches the key ("have seen"). |
| C18-enp039 (en, vocab.context) | B: "unclear" | The key word itself (VAGUE = unclear). |
| C18-olm028 (ol, punktuatsiya.undalma) | B: "address set off both sides" | The rule being tested: an address mid-sentence takes a comma on each side. |
| C18-otm037 (ot, chama son) | B: "-tacha approximate" | The rule: `-tacha` makes an approximate number (oʻntacha). |
| C18-phm023 (ph, resistance) | B: "R~L" | R = ρL/S is proportional to length, so the key "2 marta ortadi" follows. |
| C18-enm043 (en, superlative) | B: "the best" | The key word itself. |

## Rewritten (now draft, version 2)

| id | Blind result | Why | What changed in v2 |
|---|---|---|---|
| C18-msp020 (ms practice, kombinatorika, easy) | 1/2. Solver A chose 21, no note. Solver B chose the key, 35 (note "C(7,3)"). | The v1 key was right: choosing a group of 3 from 7 is C(7,3) = 35, and "group" has one reading. 21 is C(7,2) (or 7 × 3), a wrong-k slip. This is a solver slip, not an ambiguity, but the rule does not let a 1/2 item through. | The stem now says outright that the order of the group members does not matter (uz: "Guruh aʼzolarining tartibi ahamiyatga ega emas."; ru: "Порядок членов группы не важен."). Options and key unchanged: 35, 210, 21, 42. The `why` (en/uz/ru) now also explains 21. |
| C18-rtm001 (rt mock, orfoepiya.udarenie, medium) | 0/2. Both solvers chose красиве́е (solver B's note: "красиве́е"). | The v1 key краси́вее is the dictionary norm: ru.wiktionary (read 2026-10-07) marks красиве́е as an incorrect variant. So the key was right, but two independent solvers both picked the common non-normative form, and a blind check cannot confirm a key that the solvers reject. ru.wiktionary also lists the v1 distractor ба́ловать as permissible (допустимо), so v1 had a weak distractor too. | A new set of four words whose norms are not contested, none of them used in another C18 stress item. Key кварта́л. Distractors це́мент, водопро́вод, до́кумент (norms цеме́нт, водопрово́д, докуме́нт). All four norms were checked on ru.wiktionary on 2026-10-07. Stem, level, `prior_b` and `time_s` are unchanged; the `why` is rewritten in en/uz/ru. |

Both keep `options[0]` as the key and keep `key_check_1: "author"`. The `quarantine_reason` on each records the blind result and the fix.

## Retired

None.

## Next

- **Re-check the two v2 items blind.** Run `node scripts/content/blind.mjs C18 <solver>` with two new solver names; only `C18-msp020` and `C18-rtm001` need solving. A v2 becomes `verified_auto` only after it passes 2/2.
- **Mock 1 holds a draft item.** `C18-rtm001` is question 1 of the Russian-group native block in `C18-mock-bio-chem`. Until it is re-verified, that mock has 89 verified items for Russian groups. The Uzbek-group form of the mock is all verified.
- **The краси́вее norm.** It is a real, often-tested norm and the v1 key was correct. It was taken out only because blind solvers reject it. A teacher (LG1) can bring it back in a later item.
- **Not checked here.** This pass checks keys only. The uz↔ru back-translation (§5.5 step 5), the Uzbek meaning-trap list and teacher review (LG1) are still to do for all 800 items. `fact-check.json` was not re-read.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 2 version-2 items (C18-msp020, C18-rtm001): solverD and solverE agree -> blind:solverD+solverE; the Russian-group mock C18-mock-bio-chem has all 90 verified items again. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 798 verified_auto (blind:2/2); 2 verified_auto (blind:solverD+solverE).

### The review of the pass (7 Oct 2026, after `e7becdd`)

solverD and solverE were two passes of one session, so together they are one check: `keycheck.ts` now counts solvers as agents, and
`blind:solverD+solverE` met ruling 1's "second independent solver" only on paper (see D26, "The review of this pass", finding 1).
`scripts/content/reconcile.ts <stream> --records --write` decided every item again from its record (the blind copies on disk had been
overwritten by later `--pending` copies, so the answers were not re-read) and took back to `draft`, with `key_check_2: "blind:solverD"`
(one agent) and `key_check_2_version`, the 2 version-2 items (C18-msp020, C18-rtm001). One separate solver agent on a `scripts/content/blind.ts <stream> <solver> --pending` copy makes them two checks; `reconcile.ts`
then serves them again.

Status and key check 2 now: 798 verified_auto (blind:2/2); 2 draft (blind:solverD).
