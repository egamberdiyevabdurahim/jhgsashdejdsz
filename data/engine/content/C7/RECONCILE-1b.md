# C7: key check 2 of the phase 1b IELTS Reading reserve items (lane B3, 13 Oct 2026)

Phase 1b added 100 reserve items to C7 for the IELTS Reading lessons in C19 (SPEC-lessons rev. 2, §9.1 step 3, §9.4; split in
`.superpowers/p6b/PLAN.md` §3):

- `C7-7.json` by `agent:p6b-a4` (commit `6a97d68`). It holds `C7-ir1101-1110` (skimming, IERE01-1), `C7-ir2101-2120` (true, false
  and not given judgements, IERE02-1) and `C7-ir2201-2220` (the Not Given trap, IERE02-2).
- `C7-8.json` by `agent:p6b-a5` (commit `0a6f154`). It holds `C7-ir1111-1120` (scanning, IERE01-1), `C7-ir3101-3120` (matching
  headings, IERE03-1) and `C7-ir4101-4120` (sentence and summary completion, IERE04-1).

Before this pass, all 100 were `draft`, `version: 1`, `key_check_1: "author"` and `key_check_2: null`. The 81 earlier C7 items are
not part of this pass, and none of them changed.

## Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| B3s3 (checker 3) | `.blind/C7-B3s3.json` | `.blind/C7-B3s3.answers.json` |
| B3s4 (checker 4, who ran the reconcile and wrote this file) | `.blind/C7-B3s4.json` | `.blind/C7-B3s4.answers.json` |

Each copy was made by `node scripts/content/blind.mjs C7 <solver>`. A copy holds the bank's 181 items, with each item's four options
shuffled by the solver's own seed and lettered A-D. It has no key and no `why`. Each solver answered the 100 new items. B3s4
opened neither `.blind/.map-*` nor the C7 records before writing its answers file, and the same rule binds B3s3. B3s4 wrote its
answers before it read B3s3's.
Only `reconcile.ts` read the maps. `agentOf` reads B3s3, B3s4, `p6b-a4` and `p6b-a5` as four agents.
`keyCheckOf("blind:B3s3+B3s4", { author })` is `{ kind: "blind", n: 2 }` for both authors.

## The decision

`npx tsx scripts/content/reconcile.ts C7 B3s3 B3s4` gave **181 items: verified 99, quarantine 1, pending 0, blocked 0, skipped 81.**
The 81 skipped items are the earlier ones. This pass has no answer for them, or they are already `verified_auto`. No answer was
stale, because each solver's copy shows the items as they are now. Apart from C7-ir2214, neither answers file raises
`two_defensible`, `unanswerable` or `no_passage_needed`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **99** | `key_check_2: "blind:B3s3+B3s4"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | **1** | `C7-ir2214`, `key_check_2: null`, with its `quarantine_reason` |

### The quarantine: C7-ir2214

This item is in the reserve of C19-IERE02-2. It is `not_given_judgement`, level B2, by a4. **Both solvers flagged it
`two_defensible` on their own.** The question asks which statement is NOT GIVEN. The key, "Counts happen in January because few
people visit then", is NOT GIVEN, because the text never gives a reason. The distractor "Volunteers from the area help the team with
each of the counts" is NOT GIVEN as well. The text says only "Volunteers help with each count", so "from the area" is a detail the
text never states. That is the textbook NOT GIVEN pattern that the lesson itself teaches. The fix is a version 2 by the author: drop
"from the area" (the statement is then TRUE), or make the distractor contradict the text. Until a rewrite is checked, IERE02-2's
reserve has 19 servable items.

### What B3s4 noted but did not flag (for the authors; no status changed)

- **C7-ir2116** (not given, IERE02-1, B2): the distractor "The room is open to young people on weekend afternoons" is read here as
  FALSE against "weekday afternoons". A strict reader could call it NOT GIVEN, so it is a weak distractor, not a second key. B3s3 chose
  the key with no flag.
- **Word-limit twins** (C7-ir4103, ir4105, ir4110): each item offers the key and a three-word copy of it ("text message" / "a text
  message", "front desk" / "library front desk", "farm gate" / "the farm gate"). The twin points a test-wise reader to the key. These
  were not flagged, because the reader still has to use the text to rule out the other candidate ("phone call", "return box",
  "village market"). If a no-passage solver is ever run on C7, these items are where it would score first.

## How the files were written

`reconcile.ts --write` wrote the decisions into `C7-7.json` and `C7-8.json`. Both files are exactly what `JSON.stringify` writes at
their own indent, so the rewrite changed only the decided fields. A parse of each file before and after shows that, for each of the
100 items, only `key_check_2`, `status`, `key_check_2_version` and (for C7-ir2214) `quarantine_reason` changed. Keys, options, `why`
and versions are as the authors wrote them. The decision log is `.blind/C7-reconcile-1b.json`, which stays local because `.blind/`
is gitignored.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all` (after both the C7 and C19 writes): exit 0, **0 errors, 858 warnings, 253
  notes**. That is the phase 1b baseline (0 / 858 / 251) plus one `file.skipped` note for each of the two new `RECONCILE-1b.md`
  files. There is no finding on any `C7-ir`, `C19-ie` or `C19-IERE` id.
- The uz lint (U+02BB only after o/g, U+02BC only as the tutuq after a letter, no ' ‘ ’ or backtick inside a word, no Cyrillic in uz,
  no mixed-script word in uz or ru) covered every uz string of `C7-7.json`, `C7-8.json`, `C19-6.json` and `C19-7.json`: 250 strings,
  **0 findings**. Those files hold U+02BB 520 times and U+02BC 18 times. Every o or g followed by an ASCII apostrophe in them is
  English ("o'clock").

## Each item

`key` means the solver chose the author's key (`options[0]`). The evidence is B3s4's own blind working. Any letter in it is a letter
of B3s4's shuffled copy, not a position in the record. The level and subskill are the author's.

| Item | File | Lesson (reserve) | Subskill | Level | Author | B3s3 | B3s4 | Decision | B3s4's evidence |
|---|---|---|---|---|---|---|---|---|---|
| C7-ir1101 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | old station -> Saturday market that pays for the roof |
| C7-ir1102 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | a 30-minute library tour for first-year students |
| C7-ir1103 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | monthly repair cafe, volunteers show people how to fix things |
| C7-ir1104 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | start moved to nine plus breakfast club; pupils pay more attention |
| C7-ir1105 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | two a.m. to half past five: the hours of work before opening |
| C7-ir1106 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | 'The opposite happened': the bypass helped the main street |
| C7-ir1107 | C7-7.json | C19-IERE01-1 | skimming | B1 | a4 | key | key | verified_auto | pupils interview older relatives about life fifty years ago |
| C7-ir1108 | C7-7.json | C19-IERE01-1 | skimming | B2 | a4 | key | key | verified_auto | dirty river cleaned, fish returned, swimming race |
| C7-ir1109 | C7-7.json | C19-IERE01-1 | skimming | B2 | a4 | key | key | verified_auto | 'the park ... does work that a building cannot do' |
| C7-ir1110 | C7-7.json | C19-IERE01-1 | skimming | B2 | a4 | key | key | verified_auto | few riders, but they could not reach work without it |
| C7-ir2101 | C7-7.json | C19-IERE02-1 | true_judgement | B1 | a4 | key | key | verified_auto | 8 stalls at the start, about 40 now |
| C7-ir2102 | C7-7.json | C19-IERE02-1 | false_judgement | B1 | a4 | key | key | verified_auto | closes at eleven, not midnight; C is not given |
| C7-ir2103 | C7-7.json | C19-IERE02-1 | true_judgement | B1 | a4 | key | key | verified_auto | a reminder letter, not a fine |
| C7-ir2104 | C7-7.json | C19-IERE02-1 | not_given_judgement | B1 | a4 | key | key | verified_auto | whether people like the bins is not stated; A false, B and C true |
| C7-ir2105 | C7-7.json | C19-IERE02-1 | false_judgement | B1 | a4 | key | key | verified_auto | borrowing is free; B not given |
| C7-ir2106 | C7-7.json | C19-IERE02-1 | true_judgement | B1 | a4 | key | key | verified_auto | plans to buy twenty more; A not given, B and C false |
| C7-ir2107 | C7-7.json | C19-IERE02-1 | not_given_judgement | B1 | a4 | key | key | verified_auto | earlier repairs not mentioned; C false (without pay), D false (8 a.m. to 10 p.m.) |
| C7-ir2108 | C7-7.json | C19-IERE02-1 | true_judgement | B2 | a4 | key | key | verified_auto | strikes 8 a.m. to 10 p.m. so it does not wake people; B false (8 months), C false (made by hand) |
| C7-ir2109 | C7-7.json | C19-IERE02-1 | false_judgement | B1 | a4 | key | key | verified_auto | the idea came from the pupils' council, not the teachers; A not given |
| C7-ir2110 | C7-7.json | C19-IERE02-1 | not_given_judgement | B2 | a4 | key | key | verified_auto | marks not mentioned; C false (phones stay in bags), D false |
| C7-ir2111 | C7-7.json | C19-IERE02-1 | true_judgement | B1 | a4 | key | key | verified_auto | 12 minutes by ferry vs 40 by road |
| C7-ir2112 | C7-7.json | C19-IERE02-1 | false_judgement | B2 | a4 | key | key | verified_auto | an electric ferry; D not given |
| C7-ir2113 | C7-7.json | C19-IERE02-1 | not_given_judgement | B1 | a4 | key | key | verified_auto | the field's earlier owner is not stated; C false (first Saturday), D false (apple and pear) |
| C7-ir2114 | C7-7.json | C19-IERE02-1 | true_judgement | B2 | a4 | key | key | verified_auto | free, as long as they take only what they need |
| C7-ir2115 | C7-7.json | C19-IERE02-1 | false_judgement | B1 | a4 | key | key | verified_auto | at no cost; C not given |
| C7-ir2116 | C7-7.json | C19-IERE02-1 | not_given_judgement | B2 | a4 | key | key | verified_auto | which groups book it is not stated; A false. C (weekend afternoons) I read as FALSE against 'weekday afternoons'; a strict reader might call it NOT GIVEN, so it is a weaker distractor, not a second key |
| C7-ir2117 | C7-7.json | C19-IERE02-1 | true_judgement | B1 | a4 | key | key | verified_auto | skates can be hired at the gate |
| C7-ir2118 | C7-7.json | C19-IERE02-1 | false_judgement | B2 | a4 | key | key | verified_auto | last winter only eleven days; D not given |
| C7-ir2119 | C7-7.json | C19-IERE02-1 | not_given_judgement | B1 | a4 | key | key | verified_auto | their subject is not stated; C false (volunteers), D false (moved) |
| C7-ir2120 | C7-7.json | C19-IERE02-1 | false_judgement | B1 | a4 | key | key | verified_auto | music chosen by listeners; A not given |
| C7-ir2201 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | cost not stated; C false (low wall), D false (March) |
| C7-ir2202 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | rose, by how much not given |
| C7-ir2203 | C7-7.json | C19-IERE02-2 | false_judgement | B1 | a4 | key | key | verified_auto | the school pays, no family asked; D not given |
| C7-ir2204 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | other schools not mentioned; A false, C true, D false (three days) |
| C7-ir2205 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | where the keeper lives now is not stated; C false, D false |
| C7-ir2206 | C7-7.json | C19-IERE02-2 | false_judgement | B2 | a4 | key | key | verified_auto | run by machines since the last keeper left; B and C not given |
| C7-ir2207 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | who comes is not stated; A false (no booking) |
| C7-ir2208 | C7-7.json | C19-IERE02-2 | false_judgement | B1 | a4 | key | key | verified_auto | two tables at the start, six now |
| C7-ir2209 | C7-7.json | C19-IERE02-2 | false_judgement | B1 | a4 | key | key | verified_auto | visitors and staff may use it too; D not given |
| C7-ir2210 | C7-7.json | C19-IERE02-2 | not_given_judgement | B2 | a4 | key | key | verified_auto | first designed WITH PATIENTS' HELP, not the first garden; A false, D false (every day) |
| C7-ir2211 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | the owner's shopping not stated; A false (sales rose), D false (bought instead of closing) |
| C7-ir2212 | C7-7.json | C19-IERE02-2 | false_judgement | B2 | a4 | key | key | verified_auto | six paid, about twenty unpaid: most are not paid |
| C7-ir2213 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | trend in bird numbers not stated; A false (two days), D false (anyone can use them) |
| C7-ir2214 | C7-7.json | C19-IERE02-2 | not_given_judgement | B2 | a4 | two_defensible | two_defensible | quarantine | C (why January) is NOT GIVEN, but so is A: the text says 'Volunteers help with each count' and never where they come from, so 'Volunteers from the area' adds an unsupported detail (the classic NOT GIVEN pattern). B false (shallow), D true. Two NOT GIVEN statements |
| C7-ir2215 | C7-7.json | C19-IERE02-2 | false_judgement | B1 | a4 | key | key | verified_auto | calculators are not allowed; C not given |
| C7-ir2216 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | this year's winner not stated; C false (teams of three), D false (first time this year) |
| C7-ir2217 | C7-7.json | C19-IERE02-2 | false_judgement | B1 | a4 | key | key | verified_auto | only some of the trains |
| C7-ir2218 | C7-7.json | C19-IERE02-2 | not_given_judgement | B2 | a4 | key | key | verified_auto | decision in October; B false (prices stay the same) |
| C7-ir2219 | C7-7.json | C19-IERE02-2 | not_given_judgement | B1 | a4 | key | key | verified_auto | sold in the mill shop, other shops not mentioned; D false (first Sunday each month) |
| C7-ir2220 | C7-7.json | C19-IERE02-2 | false_judgement | B2 | a4 | key | key | verified_auto | grinds again since 2010; C and D not given |
| C7-ir1111 | C7-8.json | C19-IERE01-1 | scanning | B1 | a5 | key | key | verified_auto | reaches the jetty 55 minutes later |
| C7-ir1112 | C7-8.json | C19-IERE01-1 | scanning | B1 | a5 | key | key | verified_auto | they stage three plays a year (each performed twice) |
| C7-ir1113 | C7-8.json | C19-IERE01-1 | scanning | B1 | a5 | key | key | verified_auto | room for 5,500 people this year |
| C7-ir1114 | C7-8.json | C19-IERE01-1 | scanning | B1 | a5 | key | key | verified_auto | asked to bring a plastic box with a lid |
| C7-ir1115 | C7-8.json | C19-IERE01-1 | scanning | B1 | a5 | key | key | verified_auto | last winter 640 people joined in |
| C7-ir1116 | C7-8.json | C19-IERE01-1 | scanning | B1 | a5 | key | key | verified_auto | a 3-kilometre detour |
| C7-ir1117 | C7-8.json | C19-IERE01-1 | scanning | B2 | a5 | key | key | verified_auto | fee paid when the collection is booked |
| C7-ir1118 | C7-8.json | C19-IERE01-1 | scanning | B2 | a5 | key | key | verified_auto | first Wednesday of each month; the teen group is the second group |
| C7-ir1119 | C7-8.json | C19-IERE01-1 | scanning | B2 | a5 | key | key | verified_auto | lifeboat, nearly two hours |
| C7-ir1120 | C7-8.json | C19-IERE01-1 | scanning | B2 | a5 | key | key | verified_auto | students pay half of seven pounds; the 4-pound rate is last-Friday evenings only |
| C7-ir3101 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | complaints expected, the playground grew louder, the rule kept |
| C7-ir3102 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | night bus for late-shift workers |
| C7-ir3103 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | photographed and online within a day, items back within a week |
| C7-ir3104 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | people swap help in each other's languages |
| C7-ir3105 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | bring food and fuel, leave it clean, sign the book |
| C7-ir3106 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | car park -> garden, each class grows a vegetable |
| C7-ir3107 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | teenagers plan, record and present |
| C7-ir3108 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | the flood took the bridge, which led to the stone bridge |
| C7-ir3109 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | deliberately quiet, one thing at a time |
| C7-ir3110 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | farmers ask for the school's rainfall figures |
| C7-ir3111 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | the cart stood idle after two; evening dishes doubled takings |
| C7-ir3112 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | everything within ten minutes' walk; cars rarely used |
| C7-ir3113 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | weak signals and cold batteries: paper maps still help |
| C7-ir3114 | C7-8.json | C19-IERE03-1 | matching_headings | B1 | a5 | key | key | verified_auto | a library of tools |
| C7-ir3115 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | crews take orders before sailing; the auction shrinks |
| C7-ir3116 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | a boardwalk instead of closing; birds return |
| C7-ir3117 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | the council asked residents first; C is the result only |
| C7-ir3118 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | meant for patients, used most by staff |
| C7-ir3119 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | cheap tickets, half the audience at their first live show |
| C7-ir3120 | C7-8.json | C19-IERE03-1 | matching_headings | B2 | a5 | key | key | verified_auto | paragraph A: too big to sell, too costly to pull down; B and D are paragraph B |
| C7-ir4101 | C7-8.json | C19-IERE04-1 | sentence_completion | B1 | a5 | key | key | verified_auto | the lifeguards give free lessons |
| C7-ir4102 | C7-8.json | C19-IERE04-1 | summary_completion | B1 | a5 | key | key | verified_auto | buy a jar of the family's honey |
| C7-ir4103 | C7-8.json | C19-IERE04-1 | sentence_completion | B1 | a5 | key | key | verified_auto | 'order by text message'; C is three words |
| C7-ir4104 | C7-8.json | C19-IERE04-1 | summary_completion | B1 | a5 | key | key | verified_auto | books that have been damaged by rain |
| C7-ir4105 | C7-8.json | C19-IERE04-1 | sentence_completion | B1 | a5 | key | key | verified_auto | returned to the front desk, not the return box |
| C7-ir4106 | C7-8.json | C19-IERE04-1 | summary_completion | B1 | a5 | key | key | verified_auto | asked to leave a donation |
| C7-ir4107 | C7-8.json | C19-IERE04-1 | sentence_completion | B1 | a5 | key | key | verified_auto | follow the inland road |
| C7-ir4108 | C7-8.json | C19-IERE04-1 | summary_completion | B1 | a5 | key | key | verified_auto | afraid of being stung |
| C7-ir4109 | C7-8.json | C19-IERE04-1 | sentence_completion | B2 | a5 | key | key | verified_auto | replaced the brick walls with glass |
| C7-ir4110 | C7-8.json | C19-IERE04-1 | summary_completion | B2 | a5 | key | key | verified_auto | 'at the farm gate'; C would repeat 'the' |
| C7-ir4111 | C7-8.json | C19-IERE04-1 | sentence_completion | B2 | a5 | key | key | verified_auto | far less nervous |
| C7-ir4112 | C7-8.json | C19-IERE04-1 | summary_completion | B2 | a5 | key | key | verified_auto | print them on the school's 3D printer |
| C7-ir4113 | C7-8.json | C19-IERE04-1 | sentence_completion | B2 | a5 | key | key | verified_auto | ticket is for the glasshouses; return within seven days |
| C7-ir4114 | C7-8.json | C19-IERE04-1 | summary_completion | B2 | a5 | key | key | verified_auto | 'while they ripen'; mature is not the text's word |
| C7-ir4115 | C7-8.json | C19-IERE04-1 | sentence_completion | B2 | a5 | key | key | verified_auto | the walk alone paid for new heating |
| C7-ir4116 | C7-8.json | C19-IERE04-1 | summary_completion | B2 | a5 | key | key | verified_auto | a colony of grey seals in the eastern bay |
| C7-ir4117 | C7-8.json | C19-IERE04-1 | sentence_completion | B2 | a5 | key | key | verified_auto | 'once they know what has arrived' |
| C7-ir4118 | C7-8.json | C19-IERE04-1 | summary_completion | B1 | a5 | key | key | verified_auto | candles in glass jars |
| C7-ir4119 | C7-8.json | C19-IERE04-1 | sentence_completion | B1 | a5 | key | key | verified_auto | signals sent from the buses |
| C7-ir4120 | C7-8.json | C19-IERE04-1 | summary_completion | B1 | a5 | key | key | verified_auto | wins a silver crook, kept for a year |
