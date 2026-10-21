# C4: key check 2 of the P7 English B2 unit questions and homework (P7 blind checkers 3 and 4, 13 Oct 2026)

P7 added six English units at B2 and their items (SPEC-lessons rev. 2, §9.1 step 3; `.superpowers/p7/PLAN.md`). All of it is commit
`c5161c8` by `agent:p7-a5`:

- `units.json`: the units `C4-b2u001` … `C4-b2u006` (volunteering, choosing a university, a first part-time job, the school science
  fair, news and social media, a city's green spaces), each with a short text, its words, three `questions` and ten `homework` ids.
- `C4-4.json` (batch 4): the 18 unit questions `C4-b201qm` … `C4-b206qu` (per unit: `qm` a word's meaning, `qt` a question on the
  unit's text, `qu` the word in use).
- `C4-5.json` (batch 5): the 60 homework items `C4-b21h01` … `C4-b26h10`, ten per unit.

Before this pass all 78 items were `status: draft`, `key_check_1: "author"` and `key_check_2: null`. The 54 earlier C4 items
(`C4-1` … `C4-3`) were already `verified_auto` and did not change.

## Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| P7s3 (checker 3) | `.blind/C4-P7s3.json` | `.blind/C4-P7s3.answers.json` |
| P7s4 (checker 4, who ran the reconcile and wrote this file) | `.blind/C4-P7s4.json` | `.blind/C4-P7s4.answers.json` |

Each copy was made by `node scripts/content/blind.mjs C4 <solver>`. A copy holds the bank's 132 items, with each item's four options
shuffled by the solver's own seed and lettered A-D. It has no key and no `why`. Each solver answered the 78 items of this pass. The
six `qt` items ask about the unit's text, which lives in `units.json` and not in a passage, so the blind copy does not carry it. P7s4
read only the six `text` fields of `C4-b2u001` … `006` to answer them (not their word lists, which define the `qm` words). P7s4
opened neither `.blind/.map-*` nor the item records before it wrote its answers, and wrote them before it read P7s3's. Only
`reconcile.ts` read the maps. `agentOf` reads P7s3, P7s4 and `p7-a5` as three agents, so `keyCheckOf("blind:P7s3+P7s4", { author:
"agent:p7-a5" })` is `{ kind: "blind", n: 2 }`.

## The decision

`npx tsx scripts/content/reconcile.ts C4 P7s3 P7s4 --write` gave **132 items: verified 78, quarantine 0, pending 0, blocked 0,
skipped 54.** The 54 skipped items are the earlier ones, already `verified_auto` (`blind:solverZ5a+solverZ5b`). No answer was stale.
**The two solvers chose the author's key on all 78 items, and neither raised `two_defensible` or `unanswerable`.**

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **78** | `key_check_2: "blind:P7s3+P7s4"`, `key_check_2_version: 1`, version 1 |

The six unit records in `units.json` stay `draft` with `key_check_2: null`: a unit is not an item, and `reconcile.ts` does not decide
it. Serving the B2 units is the integrator's step (`.superpowers/p7/PLAN.md` §10 item 2: `english.ts` imports `C4-1` … `C4-3` by name,
the unit's `homework` list is new, and no practice pool may draw `C4-5`).

### What P7s4 noted but did not flag (for the author; no status changed)

- **`qm` and the "Which sentence uses … correctly?" items test the word, not the text,** so a reader who knows the word needs no
  unit. That is their design, and their skill is `en_grammar`, not reading.
- **Two items have a near rival that the context rules out:** `C4-b204qu` "my grandfather likes to ___ which team will win"
  (predict; "investigate" is a verb too, but one does not investigate a result before the match) and `C4-b21h07` "every Sunday for
  three years … His ___ is an example" (commitment; "initiative" is about starting something unasked, which the sentence does not say).
  Both solvers chose the key.

## How the files were written

`reconcile.ts --write` wrote the decisions into `C4-4.json` and `C4-5.json`. Both files were already in `JSON.stringify` form at their
own indent, so the rewrite changed only the decided fields. A parse of each file before (HEAD) and after shows that, for each of the 78
items, only `key_check_2`, `status` and `key_check_2_version` changed. Keys, options, `why` and versions are as the author wrote them.
`units.json` did not change. The decision log is `.blind/C4-reconcile.json`, with a copy in `.superpowers/p7/k4/C4-reconcile-log.json`.
Both stay local, because `.blind/` and `.superpowers/` are gitignored.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all` (after the C4, C7 and C19 writes of this pass): exit 0, **0 errors, 858
  warnings**: the P7 baseline. No finding on any `C4-b2` id.
- `npx tsx scripts/content/reconcile.ts C4 P7s3 P7s4 --audit`: 0 of 132 decisions differ from the status in the files.
- The uz lint (`.superpowers/p7/k4/uz_lint.mjs`: U+02BB only after o/g, U+02BC only after a letter and never after o/g, no ' ‘ ’ or
  backtick inside a word, no Cyrillic in uz, no word that mixes Latin and Cyrillic in uz or ru) covered every uz and ru string of
  `C4-4.json`, `C4-5.json` and `units.json`: **0 findings**.
- **`tests/unit/content/english-units.test.ts` fails 5 of its tests, before and after this pass.** On HEAD `c042cb0`, without this
  pass, the same 5 fail. They are about the B2 units of `c5161c8`, not about key checks. The test still expects 18 units (A1, A2 and
  B1 only), so it finds 24. It expects a unit text of 60 to 90 words, and `C4-b2u001` has 120. It reads the unit questions from
  `C4-1` … `C4-3` only, so it finds none for a B2 unit. Its last test pins the served state of the earlier 18 units (`verified_auto`,
  `questions:3/3`), and the B2 units are `draft`. Whether the B2 units follow those rules or the test widens to B2, and when a B2 unit
  gets its `questions:3/3`, is the integrator's call (`.superpowers/p7/PLAN.md` §10 item 2). This pass did not touch the units. The other English and lesson tests pass (`p5s-english`, `bank`,
  `committed-content`, `lessons-course`).

## Each item

`key` means the solver chose the author's key (`options[0]`). The evidence is P7s4's own blind working. The level and the unit's
subskill are the author's.

| Item | File | Unit | Subskill | Level | Version | Author | P7s3 | P7s4 | Decision | P7s4's evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| C4-b201qm | C4-4.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | reluctant = unwilling |
| C4-b201qt | C4-4.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | unit text: two older pupils noticed the rubbish and planned everything themselves |
| C4-b201qu | C4-4.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | can still contribute by painting; the others are not verbs |
| C4-b202qm | C4-4.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | priority = what matters most |
| C4-b202qt | C4-4.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | unit text: his family cannot pay high fees, so a scholarship is his first priority |
| C4-b202qu | C4-4.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | an adverb is needed: eventually arrived |
| C4-b203qm | C4-4.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | reliable = can be trusted |
| C4-b203qt | C4-4.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | unit text: a small income, which he saved for a laptop |
| C4-b203qu | C4-4.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | negotiate a better salary |
| C4-b204qm | C4-4.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | evidence = facts that show something is true |
| C4-b204qt | C4-4.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | unit text: after four weeks both groups were almost the same height |
| C4-b204qu | C4-4.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | predict which team will win; investigate does not fit a future result |
| C4-b205qm | C4-4.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | rumour = a story that may not be true |
| C4-b205qt | C4-4.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | unit text: on the school's own page there was nothing about the holidays |
| C4-b205qu | C4-4.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | trust it as a source; misleading is an adjective |
| C4-b206qm | C4-4.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | maintain = keep in good condition |
| C4-b206qt | C4-4.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | unit text: every family takes turns to water the trees and maintain the benches |
| C4-b206qu | C4-4.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | sleeps in the shade |
| C4-b21h01 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | commitment = a promise of time and effort |
| C4-b21h02 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | hard work, but very rewarding |
| C4-b21h03 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | a noun after 'made a': commitment |
| C4-b21h04 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | collocation: take the initiative |
| C4-b21h05 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | contribute to |
| C4-b21h06 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | reluctant ~ unwilling; eager is the opposite |
| C4-b21h07 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | three years every Sunday, even in winter: commitment, not initiative |
| C4-b21h08 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | rewarding describes the activity, not the person |
| C4-b21h09 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | initiative = a new plan to deal with a problem |
| C4-b21h10 | C4-5.json | C4-b2u001 | unit_volunteering | B2 | v1 | p7-a5 | key | key | verified_auto | are reluctant to + verb; adjective needed |
| C4-b22h01 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | requirement = something you must have or do |
| C4-b22h02 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | apply for a scholarship because study abroad is expensive |
| C4-b22h03 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | your top priority (noun) |
| C4-b22h04 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | collocation: meet the requirements |
| C4-b22h05 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | eventually ~ finally |
| C4-b22h06 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | she is very ambitious (adjective) |
| C4-b22h07 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | a scholarship to study (infinitive) |
| C4-b22h08 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | eventually as an adverb modifying found |
| C4-b22h09 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | ambitious = wanting very much to be successful |
| C4-b22h10 | C4-5.json | C4-b2u002 | unit_choosing_university | B2 | v1 | p7-a5 | key | key | verified_auto | low cost was his first priority |
| C4-b23h01 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | income = money you get from work |
| C4-b23h02 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | is my responsibility (noun) |
| C4-b23h03 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | gives workers more flexibility (noun) |
| C4-b23h04 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | collocation: take responsibility |
| C4-b23h05 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | negotiate with someone |
| C4-b23h06 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | flexible ~ adaptable; strict is the opposite |
| C4-b23h07 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | did it every day without a reminder: reliable |
| C4-b23h08 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | income is a noun: her income is higher |
| C4-b23h09 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | negotiate = talk in order to agree |
| C4-b23h10 | C4-5.json | C4-b2u003 | unit_part_time_job | B2 | v1 | p7-a5 | key | key | verified_auto | so unreliable that people are late |
| C4-b24h01 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | conclusion = what you decide after the facts |
| C4-b24h02 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | clear evidence that someone had copied |
| C4-b24h03 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | a bold prediction (noun) |
| C4-b24h04 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | collocation: came to the conclusion |
| C4-b24h05 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | the investigation into (noun) |
| C4-b24h06 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | accurate ~ exact |
| C4-b24h07 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | broken thermometer: its reading was not accurate (not inaccurate) |
| C4-b24h08 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | evidence is uncountable |
| C4-b24h09 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | investigate = find out the facts |
| C4-b24h10 | C4-5.json | C4-b2u004 | unit_science_fair | B2 | v1 | p7-a5 | key | key | verified_auto | to find out why, he decided to investigate it |
| C4-b25h01 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | headline = title of a news story |
| C4-b25h02 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | news can spread fast (verb) |
| C4-b25h03 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | to + base form: to mislead readers |
| C4-b25h04 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | collocation: start a rumour |
| C4-b25h05 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | the source of a story |
| C4-b25h06 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | misleading = giving the wrong idea |
| C4-b25h07 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | heard from a friend of a friend, unknown if true: a rumour |
| C4-b25h08 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | spread is irregular: spread / spread / spread |
| C4-b25h09 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | source = where information comes from |
| C4-b25h10 | C4-5.json | C4-b2u005 | unit_news_online | B2 | v1 | p7-a5 | key | key | verified_auto | it was misleading (adjective) |
| C4-b26h01 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | resident = a person who lives in a place |
| C4-b26h02 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | urban areas, where most people live in flats |
| C4-b26h03 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | regular maintenance (noun subject) |
| C4-b26h04 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | benefit from |
| C4-b26h05 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | in the shade |
| C4-b26h06 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | residents ~ inhabitants |
| C4-b26h07 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | nobody waters or repairs: the city must maintain it |
| C4-b26h08 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | the others mean shadow |
| C4-b26h09 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | benefit = a good effect, an advantage |
| C4-b26h10 | C4-5.json | C4-b2u006 | unit_green_spaces | B2 | v1 | p7-a5 | key | key | verified_auto | was beneficial (adjective) |
