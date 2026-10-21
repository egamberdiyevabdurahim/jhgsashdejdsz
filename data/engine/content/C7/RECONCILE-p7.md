# C7: key check 2 of the P7 IELTS Reading reserve items (P7 blind checkers 3 and 4, 13 Oct 2026)

P7 added 40 reserve items to C7 for two new IELTS Reading lessons in C19, and rewrote one quarantined item (SPEC-lessons rev. 2,
§9.1 step 3, §9.4; `.superpowers/p7/PLAN.md` §7). All of it is commit `5f8e634` by `agent:p7-a7`:

- `C7-9.json` (batch 9), 40 items on 8 new passages `C7-P-rd7` … `rd14` in `passages.json`:
  - `C7-ir3201-3220`, matching information, the reserve of `C19-IERE03-2`: rd7 and rd8 (B1), rd9 and rd10 (B2), five items each.
  - `C7-ir4201-4220`, flow-chart completion, the reserve of `C19-IERE04-2`: rd11 and rd12 (B1), rd13 and rd14 (B2), five items each.
- `C7-7.json`: `C7-ir2214` version 2 (author field `agent:p6b-a4`), in the reserve of `C19-IERE02-2`. Version 1 was quarantined
  `two_defensible` in phase 1b (`RECONCILE-1b.md`). Version 2 replaces "Volunteers from the area …" with a statement the text contradicts ("… without any outside help").

Before this pass all 41 were `status: draft`, `key_check_1: "author"` and `key_check_2: null`. No other C7 record changed. The 39
older drafts in `C7-1` … `C7-3` and the 25 quarantined items in `C7-4` … `C7-6` are not part of this pass.

## Who checked

Two blind solvers checked the items. Each was a separate agent run, and neither was an author's session (D26;
`src/engine/content/keycheck.ts`):

| Solver | Blind copy | Answers |
|---|---|---|
| P7s3 (checker 3) | `.blind/C7-P7s3.json` | `.blind/C7-P7s3.answers.json` |
| P7s4 (checker 4, who ran the reconcile and wrote this file) | `.blind/C7-P7s4.json` | `.blind/C7-P7s4.answers.json` |

Each copy was made by `node scripts/content/blind.mjs C7 <solver>`. A copy holds the bank's 221 items, each with its passage and its
four options shuffled by the solver's own seed and lettered A-D. It has no key and no `why`. Each solver answered the 41 items of this
pass. P7s4 opened neither `.blind/.map-*` nor the C7 records before it wrote its answers, and wrote them before it read P7s3's. Only
`reconcile.ts` read the maps. `agentOf` reads P7s3, P7s4, `p7-a7` and `p6b-a4` as four agents, so
`keyCheckOf("blind:P7s3+P7s4", { author })` is `{ kind: "blind", n: 2 }` for both authors.

## The decision

`npx tsx scripts/content/reconcile.ts C7 P7s3 P7s4 --write` gave **221 items: verified 39, quarantine 2, pending 0, blocked 0,
skipped 180.** The 180 skipped items are the earlier ones: already `verified_auto`, already quarantined, or without an answer in this
pass. No answer was stale. **The two solvers chose the same option on all 41 items.** P7s3 raised no flag. P7s4 flagged two items
`no_passage_needed`, and a flag on a reading item quarantines it whatever the answers say.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **39** | `key_check_2: "blind:P7s3+P7s4"`, `key_check_2_version` = the item's version (1, and 2 for `C7-ir2214`) |
| `quarantine` | **2** | `C7-ir4219`, `C7-ir4220`: `key_check_2: null`, with their `quarantine_reason` |

What the lessons can serve now: `C19-IERE03-2` 20 of its 20 reserve items, `C19-IERE04-2` 18 of 20, `C19-IERE02-2` 20 of 20 (the
rewritten `C7-ir2214` is back). The three lesson records are `verified_auto` after this pass, on their piece questions
(`C19/RECONCILE-p7.md` part 2).

### The two quarantines: answerable without the passage

Both are flow-chart items on `C7-P-rd14` "From milk to cheese" (B2, IERE04-2). Both solvers chose the author's key. The fault is that
the stem alone gives the key away, so the item does not test reading. The fix is a version 2 by the author with distractors that only
the passage can rule out.

- **C7-ir4219** "It is pressed in moulds lined with ______." Options: cheesecloth, clean cotton cloth, whey, salt. Only a cloth can
  line a mould. The only other cloth, "clean cotton cloth", is three words, so the stem's own "NO MORE THAN TWO WORDS" rules it out.
  Whey (a liquid) and salt line nothing. Two cloths that each fit the word limit, of which the passage names one, would need the text.
- **C7-ir4220** "Ripening: a hard cheese takes months or even ______." Options: years, weeks, a few days, overnight. "Months or even
  ___" needs a span longer than months, and "years" is the only one. Distractors that are all longer than months (for example
  "decades", "a full year") would need the text.

### What P7s4 noted but did not flag (for the authors; no status changed)

- **Knowledge of the process.** Several flow-chart keys are words that a reader who already knows the process could pick without the
  passage: `ir4204` sericin, `ir4205` reeling, `ir4208` nib, `ir4209` liquor, `ir4210` conching, `ir4212` water, `ir4214`
  chlorophyll, `ir4215` completely, `ir4216` lactic acid ("lactose" in the stem points to it), `ir4217` rennet. A B1-B2 student mostly
  does not know these, so they were not flagged. If a no-passage solver is ever run on C7, these are where it would score first.
- **Paraphrase distractors.** `ir4201` (fresh leaves / mulberry leaves), `ir4206` (sharp knife / machete) and `ir4218` (pieces /
  cubes) each offer a word that fits the gap but is not the passage's. That tests the "words from the passage" rule, as intended.
- **Three passages miss a space after a full stop:** `C7-P-rd8` "…find the same star again.He also…", `C7-P-rd13` "…goes
  faster.Often this is done…", `C7-P-rd14` "…more acidic.The salted curd…". No key depends on it. It is a one-character fix for the
  author or the integrator.

## How the files were written

`reconcile.ts --write` wrote the decisions into `C7-9.json` and `C7-7.json`. It writes a whole file with `JSON.stringify`, which also
wrote `C7-9.json`'s nine `prior_b` values of `0.0` and `1.0` as `0` and `1`. `.superpowers/p7/k4/renum.mjs` put those nine back in the
author's form, and it checks that the file still parses deep-equal to what `reconcile.ts` wrote. A parse of both files before (HEAD)
and after shows that, for each of the 41 items, only `key_check_2`, `status`, `key_check_2_version` and (for the two quarantines)
`quarantine_reason` changed. Keys, options, `why`, passages and versions are as the authors wrote them. The decision log is
`.blind/C7-reconcile.json`, with a copy in `.superpowers/p7/k4/C7-reconcile-log.json`. Both stay local, because `.blind/` and
`.superpowers/` are gitignored.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all` (after the C4, C7 and C19 writes of this pass and checker 2's C19 writes):
  exit 0, **0 errors, 858 warnings**: the P7 baseline. No finding on any `C7-ir32`, `C7-ir42`, `C7-ir2214` or `C7-P-rd` id.
- `npx tsx scripts/content/reconcile.ts C7 P7s3 P7s4 --audit`: 0 of 221 decisions differ from the status in the files.
- The uz lint (`.superpowers/p7/k4/uz_lint.mjs`: U+02BB only after o/g, U+02BC only after a letter and never after o/g, no ' ‘ ’ or
  backtick inside a word, no Cyrillic in uz, no word that mixes Latin and Cyrillic in uz or ru) covered every uz and ru string of
  `C7-9.json` and `C7-7.json`, together with the other files of this pass: **0 findings**.

## Each item

`key` means the solver chose the author's key (`options[0]`). The evidence is P7s4's own blind working. Any paragraph letter in it is
the passage's, not a position in a copy. The level and subskill are the author's.

| Item | File | Lesson (reserve) | Subskill | Level | Version | Author | P7s3 | P7s4 | Decision | P7s4's evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| C7-ir2214 | C7-7.json | C19-IERE02-2 | not_given_judgement | B2 | v2 | p6b-a4 | key | key | verified_auto | v2: A true (since 2018), B false (volunteers help), C false (shallow pools); why January is never given. One NOT GIVEN statement now |
| C7-ir3201 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph C: rooms kept at minus 18 degrees |
| C7-ir3202 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph D: only the bank that sent the seeds may take them out |
| C7-ir3203 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph A: a flood, a fire or a war could destroy them |
| C7-ir3204 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph E: planted in fields in Lebanon and Morocco |
| C7-ir3205 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: 130 metres inside a sandstone mountain |
| C7-ir3206 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: 46 m across, 30-33 m high |
| C7-ir3207 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph C: a bigger curve has room for finer marks |
| C7-ir3208 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph D: 365 days 5 h 49 min 15 s |
| C7-ir3209 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph E: destroyed around his assassination by his own son |
| C7-ir3210 | C7-9.json | C19-IERE03-2 | matching_information | B1 | v1 | p7-a7 | key | key | verified_auto | Paragraph F: today the foundations and the buried part of the instrument can be seen |
| C7-ir3211 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: in the dark they use gravity instead of the Sun |
| C7-ir3212 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph C: the round dance for food within about ten metres |
| C7-ir3213 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph D: the scent of the flowers the dancer carries |
| C7-ir3214 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph E: more than 50 runs and fail vs only five and succeed |
| C7-ir3215 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph F: 93 per cent went back to areas they already knew |
| C7-ir3216 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph B: the bacteria around the mould had not grown |
| C7-ir3217 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph C: not a chemist, colleagues could not isolate it, the work stalled |
| C7-ir3218 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph E: not enough penicillin for a full recovery |
| C7-ir3219 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph D: Sir William Dunn School, Oxford: extracting, purifying, storing |
| C7-ir3220 | C7-9.json | C19-IERE03-2 | matching_information | B2 | v1 | p7-a7 | key | key | verified_auto | Paragraph F: a cantaloupe melon from a market in Peoria |
| C7-ir4201 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | fed with mulberry leaves; 'fresh leaves' is not the passage's wording |
| C7-ir4202 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | after the fourth moult |
| C7-ir4203 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | one continuous filament about 1.6 km long |
| C7-ir4204 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | heat softens and removes the sericin |
| C7-ir4205 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | unwinding is called reeling |
| C7-ir4206 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | cut with a machete or knocked down with a stick |
| C7-ir4207 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | fermentation takes up to seven days; five to seven is drying and three words |
| C7-ir4208 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | the shell is removed to leave the nib; 'inside of the bean' breaks the limit |
| C7-ir4209 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | the nibs are ground into chocolate liquor |
| C7-ir4210 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B1 | v1 | p7-a7 | key | key | verified_auto | conching makes particles smaller than the tongue can detect |
| C7-ir4211 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | spread out along troughs for 8-14 hours |
| C7-ir4212 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | withering removes excess water |
| C7-ir4213 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | sap, essential oils and juices ooze out |
| C7-ir4214 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | enzymes break down its chlorophyll |
| C7-ir4215 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | for black tea the leaves oxidise completely |
| C7-ir4216 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | bacteria turn lactose into lactic acid |
| C7-ir4217 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | rennet is added and the milk sets into a curd |
| C7-ir4218 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key | verified_auto | cut into small cubes; 'pieces' is not the passage's word |
| C7-ir4219 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key, flagged no passage needed | quarantine | answerable from the stem alone: only a cloth can line a mould, and the only other cloth, 'clean cotton cloth', breaks the stem's own two-word limit; whey and salt line nothing |
| C7-ir4220 | C7-9.json | C19-IERE04-2 | flow_chart_completion | B2 | v1 | p7-a7 | key | key, flagged no passage needed | quarantine | answerable from the stem alone: 'months or even ___' needs something longer than months, and years is the only option longer than months |

## Version 2 of `C7-ir4219` and `C7-ir4220` (P7 follow-up content lane, 13 Oct 2026): written, solved by its own session, still draft

One session (branch `p7f-content` from `p7-lessons` @ `0c35e99`, author `agent:p7f-content`) wrote version 2 of the two quarantined
items so that each needs the passage, in our own wording. Both stay on `C7-P-rd14` "From milk to cheese" (B2), flow-chart completion,
in `C19-IERE04-2`'s reserve; level, `prior_b`, `time_s` and the instructions are unchanged.

| Item | Version 1 | Version 2 (key first) | Paragraph |
|---|---|---|---|
| C7-ir4219 | "It is pressed in moulds lined with ______." cheesecloth / whey / salt / clean cotton cloth | "The whey is drained. ↓ Salt is mixed into the curd to stop the ______ from building up any further. ↓ The curd is pressed overnight." **acid** / bacteria / mould / lactose | E: "the salt stops the acid from developing any further" |
| C7-ir4220 | "Ripening: a hard cheese takes months or even ______." years / weeks / overnight / a few days | "The curd is pressed overnight. ↓ Ripening: the time depends on the kind of cheese; one ripened by mould is often ready within ______." **weeks** / days / months / a year | F: "cheeses ripened by mould are ready far sooner, often within weeks" |

**Why the stem alone no longer decides.** ir4219: all four options are one word, fit "stop the ___ from building up any further"
grammatically (singular or plural) and are things a reader could expect salt to hold back; what most people know about salt
(a preservative against germs) points to "bacteria", away from the key. "bacteria" and "lactose" (B) and "mould" (F) are the passage's
own words, used elsewhere in it, so the reader has to find the salt sentence. ir4220: the stem no longer quotes the hard cheese's
"months or even years", so no option is ruled out by the stem's own words; all four fit "ready within ___" and the two-word limit, and
cheeses ripened by mould take from weeks (soft white rinds) to months (blues), so knowledge does not settle it either; only F's "often
within weeks" does. Neither new stem names another rd14 item's key (`lactic acid`, `Rennet`, `cubes`). Stems are 158 and 159 characters
(limit 160); each `why` names the key and quotes its sentence, in en, uz and ru. Each item's `quarantine_reason` keeps version 1's reason
as history, with a "v2: …" note, as `C7-ir2214`'s does.

### The blind solve, and why it does not verify them

`node scripts/content/blind.mjs C7 P7Fs1` and `… C7 P7Fs2` made two copies (221 items each, each with the passage and its own
shuffle). The session solved the two items in P7Fs1's copy and wrote `.blind/C7-P7Fs1.answers.json`, then in P7Fs2's copy and wrote
`.blind/C7-P7Fs2.answers.json`, both before any reconcile, without opening `.blind/.map-*`. Both passes chose the key on both items
(acid: E; weeks: F) and raised no flag.

That is no key check. The author of version 2 and both passes are one session: two passes of one session are one check (D26 (1)), and
a solver of the author's own session does not count at all (D26 (3)); this session also wrote the keys, so its "blind" answers and any
no-passage judgement of its own are not independent. Before this lane `keycheck.ts` read `P7Fs1`, `P7Fs2` and `p7f-content` as three
agents, and the dry run `reconcile.ts C7 P7Fs1 P7Fs2` would have written `verified_auto` with `blind:P7Fs1+P7Fs2` (kept in
`.superpowers/p7f/C7-dry-before-sessions.json`). `SESSIONS` in `src/engine/content/keycheck.ts` now maps `P7Fs<n>` and `agent:p7f-*`
to one agent, `p7f` (tested in `tests/unit/content/keycheck.test.ts`), and the same reconcile gives **pending 2**: "2 solvers agree, 2
of the author's own session (p7f), no independent one". Pending with no check leaves an item `draft` with `key_check_2: null`, which
is the record as written, so `--write` was not run (it would only have re-serialised the file). `reconcile.ts C7 P7Fs1 P7Fs2 --audit`:
0 of 221 decisions differ from the files.

| Item | Version | Author | P7Fs1 | P7Fs2 | Status | key_check_2 |
|---|---|---|---|---|---|---|
| C7-ir4219 | v2 | p7f-content | key | key | draft | null |
| C7-ir4220 | v2 | p7f-content | key | key | draft | null |

**`C19-IERE04-2` stays held**: 18 of its 20 reserve items are verified, and these two are draft. What serves it: two solver agents
other than this session, each on its own copy (`node scripts/content/blind.mjs C7 <name>`, or `npx tsx scripts/content/blind.ts C7
<name> --pending`), then `npx tsx scripts/content/reconcile.ts C7 <a> <b> --write`. Since the defect was the passage, one of them
should be a no-passage solver as well (`blind.ts C7 <name> --no-passage`, passed to reconcile with `--no-passage <name>`): a no-passage
solver that finds the key quarantines the item again.

**Checks.** `validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the P7 baseline), 270 notes against 268 on
`p7-lessons`: the two new ones are `status.history` (a draft v2 keeps its quarantine reason as history). No warning on either id. The uz lint (`.superpowers/p7/k4/uz_lint.mjs`)
over `C7-9.json`: 0 findings. Still open from P7s4's notes, not touched here because it edits a passage other verified items stand on:
`C7-P-rd8`, `rd13` and `rd14` each miss a space after one full stop (rd14: "…more acidic.The salted curd…").
