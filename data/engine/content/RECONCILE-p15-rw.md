# C21: key check 2 of the 81 SAT Reading and Writing items of practice form 1 (18 Oct 2026; version 2 of four, 19 Oct)

**Where the 81 stand after both rounds: 80 `verified_auto`, 1 `quarantine`** (`C21-rw1a10` version 2). Round 1 (18 Oct, below
the round 2 section) verified 77 version 1 items and quarantined four; round 2 (19 Oct) keyed the author's version 2 of those four:
**3 verified, 1 quarantined**.

## Round 2 (19 Oct 2026): version 2 of `rw1a10`, `rw1a15`, `rw2e08`, `rw2e10`

The author (`agent:p15-sat-rw`, commit `82311138` on `p15-content`) wrote version 2 of the four round 1 quarantined, as drafts
(`key_check_1: "author"`, `key_check_2: null`, the v1 `quarantine_reason` kept as history, the key `options[0]`). The ids came as
`.superpowers/p15/ids-sat-rw.json` (version 2 of that file: the four ids only; round 1's 81 are `ids-sat-rw.v1.json`). The same two
blind checkers solved them again, as fresh agent runs under the same names: `P15rws1` (checker 1) and `P15rws2` (checker 2, who ran
the reconcile and wrote this section). `agentOf` reads `P15rws1`, `P15rws2` and `p15-sat-rw` as three agents.

**Verified: 3. Quarantined: 1.** Both solvers chose the key on all four and neither found a second correct option; `rw1a10` is
quarantined because checker 1 judged it answerable without its text, and checker 2's guess before reading the text was its key.

### How P15rws2 checked, and what it saw

- Its copy: `npx tsx scripts/content/blind.ts C21 P15rws2 --pending --blind check-rw2/v2/staging` (4 items, nothing else pending in
  C21; 143 left out as already keyed), then round 1's `check-rw2/filter.cjs` kept the four ids, wrote the copy and its map into
  `blind-rw/` unprinted and deleted the staging files. The copy holds each item's stem (text and question, `stem.en`), its instruction
  line and its four options shuffled by the solver's seed and lettered A-D; no key, no `why`.
- Round 1's files of the folder were first copied to `check-rw2/v2/blind-v1/` (P15rws2's copy, map and answers, P15rws1's round 1
  answers and the round 1 decision log; checker 1 had already replaced its own copy and map with version 2 ones and kept its round 1
  files in `blind-rw/v1-P15rws1/`). Only then were P15rws2's round 1 copy, map and answers replaced.
- **A real no-passage step this time.** `check-rw2/v2/dumpq.cjs <copy> q` printed only each item's question line and options, and
  P15rws2 wrote a guess, a confidence and a reason for each into `check-rw2/v2/no-passage-first.json` **before** printing any text
  (`dumpq.cjs <copy> full`). Then it solved each item with its text, read the fill-in item with every option in the blank, and wrote
  `blind-rw/C21-P15rws2.answers.json` (00:57).
- Before its answers were written it opened neither `.map-*` file, nor `C21-1.json`, nor the author's ledger, notes, logs, tests or
  commit message (it saw the subject lines of the branch's last three commits; one names the four ids, none a key), nor checker 1's
  answers: checker 1's answers file (00:56) was first listed after P15rws2's own was written, and read only then. Only `reconcile.ts`
  read the maps.
- **One disclosure.** To reuse round 1's helpers P15rws2 read `check-rw2/apply.ts` before solving, and that script carries round 1's
  four quarantine reasons, which describe version 1's topics and the gist of its keys (cuttlefish colour-matching; colder storage
  keeps seeds sprouting longer; silkworms eat only mulberry; Shahlo's signs). No version 2 key can be read from them: `rw1a10` and
  `rw2e10` are new topics, `rw1a15`'s version 2 key is about drying, not cold, and `rw2e08` asks a different question. P15rws2's
  no-passage guesses, written before it read the texts, missed the key on `rw1a15` and `rw2e08`.

### The decision

- `npx tsx scripts/content/reconcile.ts C21 P15rws1 P15rws2 --blind .superpowers/p15/blind-rw --json check-rw2/v2/decisions-dry.json`
  (a dry run): **verified 4**, quarantine 0, pending 0, blocked 0, skipped 143 (the 77 round 1 items and the 66 Math items, all
  already `verified_auto` by two checks). No answer was stale. Solvers: `rw1a10` P15rws1 `no_passage_needed` (on the key), P15rws2
  `key`; the other three both `key`.
- **The no-passage rule**, as in round 1: `reconcile()` applies `no_passage_needed` only to `read_*` / `reading` skills and passage
  items, and these are `sat_rw` with the text in the stem, so the flag reached no decision in the script; the brief (answerable without
  its passage: it must not be) and spec §5.5 step 4 make one solver's flag a quarantine.
- **The write**: `check-rw2/v2/apply-v2.ts` (round 1's `apply.ts` for the four ids; it refuses to run unless there are exactly the
  four, each is version 2, each decision is `verified` with both solvers on the key, and each flag matches a reason) turned the flagged
  `rw1a10` into `quarantine`, applied the decisions with the library's `applyDecision` and wrote `C21-1.json` only, in `reconcile.ts`'s
  form. The decisions are in `.superpowers/p15/blind-rw/C21-reconcile.json` (round 1's: `check-rw2/v2/blind-v1/C21-reconcile.json`).

| Item | Skill | Key (`options[0]`) | P15rws1 | P15rws2 | No passage (rws1) | No passage (rws2: guess before the text) | Decision |
|---|---|---|---|---|---|---|---|
| C21-rw1a10 | II central_ideas_details, medium B2 | Zarina starts beginners on a reed pen because its difficulty teaches a skill that an easier pen would hide. | key | key | **FLAG** (test-wise: the only lesson among the options) | the key, about 40% (the only test-like reason); no flag | **quarantine** |
| C21-rw1a15 | II inferences, hard C1 | drying does more than cold storage to keep them able to sprout. | key | key | no | another option (wrong), about 30% | verified_auto |
| C21-rw2e08 | II central_ideas_details, easy B1 | Their leaves are kept for the last week, when the worms eat the most. | key | key | no (a coin toss with the "newly hatched" twin) | the twin (wrong), about 40% | verified_auto |
| C21-rw2e10 | II command_of_evidence_textual, easy B1 | In the matches Rustam refereed last season, players argued with more of his calls after half time than before it. | key | key | no (the "fewer" twin) | the key, about 45% (a coin toss with the twin) | verified_auto |

| Status after round 2 | Items | Record |
|---|---:|---|
| `verified_auto` | **3** (`rw1a15`, `rw2e08`, `rw2e10`) | `key_check_2: "blind:P15rws1+P15rws2"`, `key_check_2_version: 2`; round 1's `quarantine_reason` stays as history (`applyDecision`) |
| `quarantine` | **1** (`rw1a10`) | `key_check_2: null`, `quarantine_reason` (below); version 2, key and options as written |

### The quarantine, with its reason

| Item | Flagged by | Reason |
|---|---|---|
| `C21-rw1a10` v2 (Zarina's reed pen) | P15rws1 (P15rws2: no flag, but its guess before reading the text was the key) | Answerable without its text by test-wiseness. Of the four options only the key gives a lesson, a reason about learning to write; the other two "starts beginners on a reed pen because" options give bare circumstantial motives that have no anchor in the text (cost; it was her own teacher's pen), and the fourth is a belief in a different form (reed letters are more beautiful). A solver who never sees the text picks the key, well above one in four. Version 2 fixed round 1's fault (cuttlefish general knowledge) but not this one. A version 3 needs distractors that are themselves reasons about learning (ones the text does not give, or misreads of it), so that only the text decides. |

The record's `quarantine_reason` says the same, naming `no_passage_needed`, both solvers on the key (`blind:P15rws1+P15rws2`) and no
second correct option.

### Every item read with its text, and the one fill-in with each option in the blank

- `rw1a10` (key: the reed's difficulty teaches what an easier pen would hide): the reed "punishes every careless angle with a blot", so
  beginners learn to feel the angle, which the steel nib's neat letters from day one would let them skip. Cost and her teacher's pen
  are not in the text; the beauty claim is not made, and the text says the steel nib gives neater letters. One defensible option.
- `rw1a15` (fill-in; key: drying does more than cold storage), every option in the blank of "These results suggest that, for stored
  wheat seeds, ______": the key is true (the two dried groups sprouted almost equally, cold or not, and each far more than either
  undried group); "drying makes little difference to seeds that are kept cold" is false (dried-and-cold far above not-dried-and-cold);
  "dried seeds sprout far more often when they are also kept cold" is false (the dried groups were almost equal); "cold storage does
  more than drying" is the reverse. All four fit the sentence; **only the key is true**. Both checkers read it so.
- `rw2e08` (key: kept for the last week, when the worms eat the most): the text's "his father keeps those leaves for the last week
  before the worms spin their cocoons, when they eat the most". The newly hatched worms are not in the text (the last week, not the
  first); the neighbor and the height of the branches are not in it. One defensible option. Every option is now about the mulberry
  leaves, so round 1's fault (silkworms eat only mulberry) no longer gives the key.
- `rw2e10` (key: more of his calls argued with after half time): the claim is that players argue more in the second half than the
  first, whether winning or losing. The "fewer" twin weakens it; the losing-team finding is about winning or losing, which the claim
  sets aside, and says nothing of halves; fouls against offside bears on no half. One defensible option. Without the claim, the "more"
  and "fewer" twins leave a coin toss.

### Checks after the write

- `check-rw2/diffcheck.cjs` (round 1's, with the four ids): **0 problems**. The four items differ only in `status`, `key_check_2`, the
  new `key_check_2_version` (3) and `rw1a10`'s `quarantine_reason`; no other id and no top-level field changed; 81 items, LF, no BOM,
  final newline. States after: 77 `verified_auto` v1, 3 `verified_auto` v2 (with round 1's reason as history), 1 `quarantine`.
  `form-1.json` is not touched.
- `npx tsx scripts/content/validate.ts --no-families --all` before and after: exit 1 both times with the same **699 errors, 897
  warnings**, notes 298 → 297 (`status.history` 211 → 210: `rw1a10`'s round 1 reason is now its own quarantine's). The outputs differ
  only there and in the two C21 lines (before: 143 `verified_auto`, 4 draft; after: 146 `verified_auto`, 1 quarantine; served 146:
  80 R&W and 66 Math). No finding names a `C21-rw` id; the errors are other lanes' (`schema.unknown_field`, `status.unverified`,
  `format.none` on the IELTS Listening files). Logs: `check-rw2/v2/logs/validate-before.log`, `validate-after.log`.
- `npx tsx scripts/content/scan.ts --out …`: exit 0, **2 findings, 0 errors, 0 on served items**, `findings.json` byte-identical
  before and after (the `cue.length` warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P15's) (`check-rw2/v2/scan-before/`,
  `scan-after/`).
- Tests, with the DB-free config `.superpowers/p13/fixb-scan/vitest.nodb.config.ts` (`ANTHROPIC_API_KEY` empty, `AI_FAKE=1`; logs
  `check-rw2/v2/logs/vitest-related.log`, `vitest-c21.log`): `keycheck`, `reconcile`, `reconcile-cli`, `blind`, `scan`: **65 pass**.
  `p15-sat-rw.test.ts` 7 pass, 2 fail; `p15-sat-math.test.ts` 8 pass, 1 fails; `committed-content.test.ts` 1 fails:
  - **new, from this quarantine**: the author's version 2 test ("version 2 of the four … drafts (until two blind solvers key them
    again)") accepts a draft or `verified_auto` at version 2, so it fails on `C21-rw1a10` (`["quarantine", undefined]`). The record test
    of the same file accepts the quarantine (it names the four ids and wants `no_passage_needed` in the reason) and passes;
  - as in round 1: "no lesson, reserve or practice pool holds a C21 item" in both files (`pool({ purpose: 'practice' })` returns the
    served C21 items, now 80 R&W and 66 Math: the pool code, not the content);
  - `committed-content` "no served item has a validator error": the IELTS Listening lane's served `C19-li*` / `C20` items with errors
    (`status.unverified`, the same 699 errors before and after this write); no C21 item.

### For the integrator (not changed here)

- **The form still cannot be served whole**: `form-1.json` lists `C21-rw1a10` in module 1, and it is quarantined. It needs a version 3
  by its author (above) and two fresh blind solvers; the other 80 R&W items are served.
- Round 1's three other notes stand: `bank.ts` should keep C21 (a form bank) out of `pool()`; `reconcile()` should recognise `sat_rw`
  for the no-passage rule (applied by hand twice now, `apply.ts`, `apply-v2.ts`); the test notes are below.
- The version 2 test in `p15-sat-rw.test.ts` should accept a version 2 quarantined again (`status: "quarantine"` with a
  `quarantine_reason`), as its record test does; it now fails on `C21-rw1a10` only for that.
- `errors` in the validator are the IELTS Listening lane's: `C20/C20-1..6.json` and `C19/C19-24.json` (`schema.unknown_field`,
  `status.unverified`, `format.none`), none of them C21.

## Round 1 (18 Oct 2026): the 81 version 1 items

The P15 SAT R&W author (`agent:p15-sat-rw`, commit `bdf4a383` on `p15-content`, worktree `jg-p5content`) wrote the 81 Reading and
Writing items of SAT practice form 1 in `C21/C21-1.json` (module 1 `C21-rw1a01..27`, the easier module 2 `rw2e01..27`, the harder
module 2 `rw2h01..27`) as drafts: `key_check_1: "author"`, `key_check_2: null`, version 1, the key `options[0]`. The ids came to the
checkers as `.superpowers/p15/ids-sat-rw.json` in the integration worktree `jg-p5int` (ids only). An item is served only when two blind
solvers outside the author's session choose its key and none finds a second correct option or another flag (spec §5.5 step 4). P15
blind checkers 1 and 2 (`P15rws1`, `P15rws2`) keyed them; this file is checker 2's record (`P15rws2`, who ran the reconcile).

**Verified: 77. Quarantined: 4.** Both solvers chose the key on all 81, and neither found a second correct option in any of them; the
four are quarantined because a solver judged each answerable without its text.

### Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P15rws1 (checker 1) | `.superpowers/p15/blind-rw/C21-P15rws1.json` (81 items) | `blind-rw/C21-P15rws1.answers.json` |
| P15rws2 (checker 2, who ran the reconcile and wrote this file) | `blind-rw/C21-P15rws2.json` (the same 81 ids) | `blind-rw/C21-P15rws2.answers.json` |

P15rws2's copy: `npx tsx scripts/content/blind.ts C21 P15rws2 --pending --blind <scratch staging>` (147 items: the stream also holds
the 66 Math items of `C21-2.json`; no family, nothing left out), then `.superpowers/p15/check-rw2/filter.cjs` kept exactly the 81 ids of
the copy and its map, wrote them into `blind-rw/` unprinted and deleted the staging files. A copy holds each item's stem (these items
carry their text, table or notes in `stem.en`, as C6 does; none has a `passage_id`), its instruction line, and its four options shuffled
by the solver's own seed and lettered A-D; no key, no `why`.

Each solver was a separate agent run, and neither is the author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads
`P15rws1`, `P15rws2` and `p15-sat-rw` as three agents, so `keyCheckOf("blind:P15rws1+P15rws2", { author: "agent:p15-sat-rw" })` is
`{ kind: "blind", n: 2 }`. P15rws2 was told no key: its brief named the ids file, the folders and the process, no stem, option or key.
Before its answers were written it opened neither `.map-*` file, nor `C21-1.json`, nor the author's ledger, notes, logs or tests, nor
checker 1's files; it saw only the subject lines of the branch's last five commits (no key in them). It read each item in its copy
(`check-rw2/dump.cjs`), read the sentence with every option in the blank for each fill-in item, chose a letter and wrote its answers
with a one-line reading and a no-passage view per item. When P15rws2 first listed the folder only checker 1's copy was there; checker 1's
answers file (written 19:37) was first listed at 19:40, after P15rws2's own (19:40), and read only then. Only `reconcile.ts` read the maps.

One step that is no blind no-passage solve: to see how the items carry their texts, P15rws2 first made a `--no-passage` copy (solver name
`P15rws2np`, deleted unused). Since the texts are in the stems, that copy showed every text, so P15rws2's no-passage views below are
judgments made with the texts read, not a solve without them.

### The decision

- `npx tsx scripts/content/reconcile.ts C21 P15rws1 P15rws2 --blind .superpowers/p15/blind-rw --json check-rw2/decisions-dry.json`
  (a dry run): **verified 81**, quarantine 0, pending 0, blocked 0, skipped 66 (the Math items, which these solvers did not answer).
  No answer was stale, and neither answers file raises `two_defensible` or `unanswerable`.
- **The no-passage rule.** `reconcile.ts` quarantines on a `no_passage_needed` flag only for an item with a `passage_id` or a skill
  `read_*` / `*reading*` (spec §5.5 step 4: "Reading items also face a no-passage solver"). These items are `sat_rw` with the text in
  the stem, so the four flags below reached no decision in the script. The P15 brief asks of every item whether it is answerable without
  its passage and says it must not be, and the Information and Ideas items are reading items, so the flags are applied here: any one
  solver's `no_passage_needed` quarantines, as `reconcile()` does for a reading item.
- **The write.** `reconcile.ts --write` re-serialises every file of the stream that holds a decided item, and `C21-2.json` belongs to the
  Math checkers (who wrote and committed it during this pass, `c9aaef9e`). So `.superpowers/p15/check-rw2/apply.ts` took the dry run's
  decisions for the 81 ids, turned the four flagged ones into `quarantine` with their reasons (it refuses to run if a flag and a reason
  do not match, or if any decision is not `verified` with both solvers on the key), applied them with the library's own `applyDecision`
  and wrote `C21-1.json` only, in `reconcile.ts`'s form (the file's indent, its final newline). The decisions are kept in
  `.superpowers/p15/blind-rw/C21-reconcile.json`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **77** | `key_check_2: "blind:P15rws1+P15rws2"`, `key_check_2_version: 1` |
| `quarantine` | **4** | `key_check_2: null`, `quarantine_reason` (below); version, key and options as written |

| Module | Items | Verified | Quarantined |
|---|---:|---:|---:|
| m1 (`rw1a`) | 27 | 25 | 2 (`rw1a10`, `rw1a15`) |
| m2e (`rw2e`) | 27 | 25 | 2 (`rw2e08`, `rw2e10`) |
| m2h (`rw2h`) | 27 | 27 | 0 |

### Every quarantine, with its reason

All four: both solvers chose the key, and neither found a second correct option. Each needs a version 2 by its author (spec §5.5 step 7:
a key never changes in place) and a fresh blind check.

| Item | Skill | Flagged by | Reason |
|---|---|---|---|
| `C21-rw1a10` | central idea (cuttlefish colour-matching) | P15rws2 (P15rws1: "risk, not flagged") | Answerable by general knowledge: cuttlefish hide by matching their surroundings although their eyes have one kind of light-detecting cell, a well-known puzzle, and the key is the only option true of real cuttlefish. A rewrite needs distractors as true of cuttlefish in general, so that only the text decides. |
| `C21-rw1a15` | inference (wheat seeds stored at three temperatures) | P15rws2 (P15rws1: "no") | That colder storage keeps seeds able to sprout longer is common knowledge (seed banks freeze them), and the other three completions are each false as a general claim, so the key is reachable without the results. A rewrite needs completions each plausible in general. |
| `C21-rw2e08` | key detail (why Behruz cuts mulberry branches) | P15rws1 and P15rws2 | The question names the mulberry branches cut each morning, and that silkworms eat only mulberry leaves is common knowledge (above all in Uzbekistan); the other three options are arbitrary. |
| `C21-rw2e10` | textual evidence (Shahlo's airport signs) | P15rws1 (P15rws2: "guessable", weak distractors) | By elimination: the key is the only option that names Shahlo and reports a before/after change; the other three bear on no claim. A rewrite needs distractors that are findings about the signs and the desk too. |

### Fill-in items: every option in the blank

Both solvers read each of the 50 fill-in items (13 words in context, 2 data completions, 6 logical completions, 21 conventions, 8
transitions) with each option in its blank. **In none is a second option correct.** The conventions items each have exactly one option
that is standard: the others are a comma splice, a run-on, a stray comma after a conjunction, an unclosed dash or comma pair, a mark
between a subject and its verb, a fragment, a verb or pronoun that disagrees, a dangling modifier or a broken parallel. Two near
misses that are wrong as offered: `rw2e20` "kingfisher's" ("the three" cannot stand before a singular possessive) and `rw1a17`
"are resting" (`flock ... its long flight` keeps the subject singular). The words-in-context distractors are grammatical but contradict the
text's clue (for example `rw2h04` "costly" is no opposite of "designed around it").

### Answerable without the passage?

Each checker covered the text above the question line (the passage, the table, the notes and their goal, or the claim) and asked whether
the question line and the options alone give the key. The views per item are in the table below.

| View (P15rws1 / P15rws2) | Items | Outcome |
|---|---:|---|
| needs the text / needs the text | 67 | verified |
| a test-wise guess at most, by either checker (the key is the moderate or most specific option, or fits outside knowledge loosely) | 10 | verified; listed for the authors: `rw1a08`, `rw1a09`, `rw2e07`, `rw2e09`, `rw2e13`, `rw2e14`, `rw2h08`, `rw2h09`, `rw2h10`, `rw2h13` |
| answerable (a flag by at least one checker) | 4 | quarantined (above) |

Every words-in-context, conventions, transitions and rhetorical-synthesis item needs its text (the goal of a notes item sits with the
notes).

### Every item

Key is the author's `options[0]` (read after both answers files were written). Solvers: `key` = chose the key; `no_passage_needed` = chose
the key and flagged it. No-passage views: **FLAG**, risk (named, not flagged), guessable, no.

| Item | Domain, skill | Difficulty | Key | P15rws1 | P15rws2 | Decision | No passage (rws1) | No passage (rws2) |
|---|---|---|---|---|---|---|---|---|
| C21-rw1a01 | CS words_in_context | easy B1 | quickly | key | key | verified_auto | no | no |
| C21-rw1a02 | CS words_in_context | easy B1 | impassable | key | key | verified_auto | no | no |
| C21-rw1a03 | CS words_in_context | medium B2 | ingenious | key | key | verified_auto | no | no |
| C21-rw1a04 | CS words_in_context | hard C1 | reticence | key | key | verified_auto | no | no |
| C21-rw1a05 | CS words_in_context | hard C1 | underestimate | key | key | verified_auto | no | no |
| C21-rw1a06 | CS text_structure_purpose | easy B1 | It gives the rule that explains how the teams behave in the rest of t… | key | key | verified_auto | no | no |
| C21-rw1a07 | CS text_structure_purpose | medium B2 | It presents a common belief about a job and then describes what the j… | key | key | verified_auto | no | no |
| C21-rw1a08 | CS cross_text_connections | hard C1 | By agreeing that beaver ponds have benefits while warning that they c… | key | key | verified_auto | guessable | guessable |
| C21-rw1a09 | II central_ideas_details | easy B1 | Through patient, careful work, Nodira succeeds at a repair that is ne… | key | key | verified_auto | guessable | guessable |
| C21-rw1a10 | II central_ideas_details | medium B2 | Cuttlefish match their surroundings well, though how they do so while… | key | no_passage_needed | **quarantine** | risk | **FLAG** |
| C21-rw1a11 | II command_of_evidence_quantitative | easy B1 | the morning was busier, with 410 visitors against 290. | key | key | verified_auto | no | no |
| C21-rw1a12 | II command_of_evidence_quantitative | medium B2 | On cloudy Tuesday the panel produced 160 watt-hours, less than half o… | key | key | verified_auto | no | no |
| C21-rw1a13 | II command_of_evidence_textual | hard C1 | In another park, where the busy road runs along the east side, the bi… | key | key | verified_auto | no | no |
| C21-rw1a14 | II inferences | medium B2 | much of the kiosks' business depends on which way passengers leave th… | key | key | verified_auto | no | no |
| C21-rw1a15 | II inferences | hard C1 | colder storage better preserves the seeds' ability to sprout. | key | no_passage_needed | **quarantine** | no | **FLAG** |
| C21-rw1a16 | SEC boundaries | easy B1 | century. Its | key | key | verified_auto | no | no |
| C21-rw1a17 | SEC form_structure_sense | easy B1 | rests | key | key | verified_auto | no | no |
| C21-rw1a18 | SEC boundaries | medium B2 | mornings; however, | key | key | verified_auto | no | no |
| C21-rw1a19 | SEC form_structure_sense | medium B2 | had already buried | key | key | verified_auto | no | no |
| C21-rw1a20 | SEC boundaries | hard C1 | strings—took | key | key | verified_auto | no | no |
| C21-rw1a21 | SEC form_structure_sense | hard C1 | the restorers could finally see the true colors of the old painting. | key | key | verified_auto | no | no |
| C21-rw1a22 | SEC boundaries | hard C1 | others: keeping | key | key | verified_auto | no | no |
| C21-rw1a23 | EOI transitions | easy B1 | However, | key | key | verified_auto | no | no |
| C21-rw1a24 | EOI transitions | medium B2 | Accordingly, | key | key | verified_auto | no | no |
| C21-rw1a25 | EOI rhetorical_synthesis | easy B1 | From June to September, the shuttle leaves the train station every 30… | key | key | verified_auto | no | no |
| C21-rw1a26 | EOI rhetorical_synthesis | medium B2 | The second edition, with 52,000 entries, is far larger than the first… | key | key | verified_auto | no | no |
| C21-rw1a27 | EOI rhetorical_synthesis | hard C1 | Because moths pollinate many night-blooming flowers, light that keeps… | key | key | verified_auto | no | no |
| C21-rw2e01 | CS words_in_context | easy B1 | inviting | key | key | verified_auto | no | no |
| C21-rw2e02 | CS words_in_context | easy B1 | checked | key | key | verified_auto | no | no |
| C21-rw2e03 | CS words_in_context | easy B1 | steep | key | key | verified_auto | no | no |
| C21-rw2e04 | CS words_in_context | medium B2 | unmistakable | key | key | verified_auto | no | no |
| C21-rw2e05 | CS text_structure_purpose | easy B1 | It describes a habit and then shows how the neighbors' feelings about… | key | key | verified_auto | no | no |
| C21-rw2e06 | CS text_structure_purpose | medium B2 | It presents a common picture that the rest of the text shows to be in… | key | key | verified_auto | no | no |
| C21-rw2e07 | CS cross_text_connections | medium B2 | By suggesting that walls set aside for artists may reduce graffiti mo… | key | key | verified_auto | guessable | guessable |
| C21-rw2e08 | II central_ideas_details | easy B1 | The family's silkworms eat nothing but mulberry leaves. | no_passage_needed | no_passage_needed | **quarantine** | **FLAG** | **FLAG** |
| C21-rw2e09 | II central_ideas_details | easy B1 | Island children reach the only school by boat, and on stormy days the… | key | key | verified_auto | guessable | guessable |
| C21-rw2e10 | II command_of_evidence_textual | easy B1 | After the signs went up, half as many travelers a month asked Shahlo … | no_passage_needed | key | **quarantine** | **FLAG** | guessable |
| C21-rw2e11 | II command_of_evidence_quantitative | easy B1 | rising from 40 bookings to 95. | key | key | verified_auto | no | no |
| C21-rw2e12 | II command_of_evidence_textual | medium B2 | "Under the ice I hear the water run, / already whispering of the Apri… | key | key | verified_auto | no | no |
| C21-rw2e13 | II inferences | medium B2 | the gardeners will spend even fewer hours mowing than they do now. | key | key | verified_auto | no | guessable |
| C21-rw2e14 | II inferences | hard C1 | by eating water fleas, the fish leave more of the algae uneaten. | key | key | verified_auto | no | guessable |
| C21-rw2e15 | SEC form_structure_sense | easy B1 | was | key | key | verified_auto | no | no |
| C21-rw2e16 | SEC boundaries | easy B1 | bring: a | key | key | verified_auto | no | no |
| C21-rw2e17 | SEC form_structure_sense | easy B1 | their | key | key | verified_auto | no | no |
| C21-rw2e18 | SEC boundaries | medium B2 | week; otherwise, | key | key | verified_auto | no | no |
| C21-rw2e19 | SEC form_structure_sense | medium B2 | when the park gates close each evening. | key | key | verified_auto | no | no |
| C21-rw2e20 | SEC form_structure_sense | medium B2 | kingfishers' | key | key | verified_auto | no | no |
| C21-rw2e21 | SEC boundaries | hard C1 | ago, | key | key | verified_auto | no | no |
| C21-rw2e22 | EOI transitions | easy B1 | However, | key | key | verified_auto | no | no |
| C21-rw2e23 | EOI transitions | easy B1 | Instead, | key | key | verified_auto | no | no |
| C21-rw2e24 | EOI transitions | medium B2 | In reality, | key | key | verified_auto | no | no |
| C21-rw2e25 | EOI rhetorical_synthesis | easy B1 | The Quince Fair takes place each October in a small hill town. | key | key | verified_auto | no | no |
| C21-rw2e26 | EOI rhetorical_synthesis | medium B2 | Both springs stay warm through the winter, and at each the water smel… | key | key | verified_auto | no | no |
| C21-rw2e27 | EOI rhetorical_synthesis | hard C1 | Birch bark caught fire in 8 seconds on average, far sooner than pine … | key | key | verified_auto | no | no |
| C21-rw2h01 | CS words_in_context | medium B2 | exhaustive | key | key | verified_auto | no | no |
| C21-rw2h02 | CS words_in_context | medium B2 | baffling | key | key | verified_auto | no | no |
| C21-rw2h03 | CS words_in_context | hard C1 | formulaic | key | key | verified_auto | no | no |
| C21-rw2h04 | CS words_in_context | hard C1 | jarring | key | key | verified_auto | no | no |
| C21-rw2h05 | CS text_structure_purpose | medium B2 | It presents an explanation, describes a test of it, and reports that … | key | key | verified_auto | no | no |
| C21-rw2h06 | CS text_structure_purpose | hard C1 | It reveals a change that undercuts the sense of sameness built up in … | key | key | verified_auto | no | no |
| C21-rw2h07 | CS cross_text_connections | hard C1 | By arguing that the dig's finds are just what a fort guarding a trade… | key | key | verified_auto | no | no |
| C21-rw2h08 | II central_ideas_details | easy B1 | Each household clears the stretch of canal in front of its own land. | key | key | verified_auto | no | guessable |
| C21-rw2h09 | II central_ideas_details | hard C1 | For this city's potential riders, how often buses came mattered more … | key | key | verified_auto | guessable | guessable |
| C21-rw2h10 | II command_of_evidence_textual | medium B2 | In the year after the signs went up, collisions with deer on the road… | key | key | verified_auto | risk | guessable |
| C21-rw2h11 | II command_of_evidence_textual | hard C1 | As adults, the foxes born to city parents and those born to country p… | key | key | verified_auto | no | no |
| C21-rw2h12 | II command_of_evidence_quantitative | hard C1 | Lentils and chickpeas did best at 5 cm, but peas did best at 3 cm, 66… | key | key | verified_auto | no | no |
| C21-rw2h13 | II inferences | medium B2 | moved some buyers from online to the box office without reducing tota… | key | key | verified_auto | no | guessable |
| C21-rw2h14 | II inferences | hard C1 | people began farming near the lake at about that time, clearing much … | key | key | verified_auto | no | no |
| C21-rw2h15 | SEC form_structure_sense | easy B1 | opened | key | key | verified_auto | no | no |
| C21-rw2h16 | SEC boundaries | medium B2 | air; steadily | key | key | verified_auto | no | no |
| C21-rw2h17 | SEC form_structure_sense | medium B2 | lulls | key | key | verified_auto | no | no |
| C21-rw2h18 | SEC boundaries | medium B2 | domes; | key | key | verified_auto | no | no |
| C21-rw2h19 | SEC boundaries | hard C1 | shipwreck | key | key | verified_auto | no | no |
| C21-rw2h20 | SEC form_structure_sense | hard C1 | that | key | key | verified_auto | no | no |
| C21-rw2h21 | SEC boundaries | hard C1 | grapes; the | key | key | verified_auto | no | no |
| C21-rw2h22 | EOI transitions | medium B2 | However, | key | key | verified_auto | no | no |
| C21-rw2h23 | EOI transitions | hard C1 | Thus, | key | key | verified_auto | no | no |
| C21-rw2h24 | EOI transitions | hard C1 | As a result, | key | key | verified_auto | no | no |
| C21-rw2h25 | EOI rhetorical_synthesis | easy B1 | The hospital's kitchen uses the vegetables from the rooftop garden. | key | key | verified_auto | no | no |
| C21-rw2h26 | EOI rhetorical_synthesis | medium B2 | Unlike nylon strings, gut strings go out of tune quickly when the air… | key | key | verified_auto | no | no |
| C21-rw2h27 | EOI rhetorical_synthesis | hard C1 | The cooler relies on evaporation, so it works well in dry heat but po… | key | key | verified_auto | no | no |

### What the write changed

`check-rw2/diffcheck.cjs` compares every item of `C21-1.json` with `HEAD`: **0 problems**. The 81 items differ only in `status`,
`key_check_2`, the new `key_check_2_version` (77) or `quarantine_reason` (4); no other id and no top-level field changed; the file
round-trips through `JSON.stringify(doc, null, 2)` exactly, so no other line moved (a last field gains its comma); LF, no BOM. Each key,
option, stem, `why`, level, difficulty, version and author is as the author wrote it. `form-1.json` is not touched.

### Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all` before and after: exit 1 both times with the same **425 errors, 897
  warnings, 294 notes**; the outputs differ only in the two C21 coverage lines (written: 77 `verified_auto`, 4 `quarantine`, 66 draft;
  served: 77 R&W). The errors are none of C21's: 276 `schema.unknown_field` and 149 `format.none` on the IELTS Listening lane's
  `C19/C19-24.json` and `C20` (commit `4149818b`); 0 served items with an error. Run again with this file in place (and the Math
  checkers' commit): the same counts, `file.skipped` still 52, no finding on a `C21-rw` id.
- `npx tsx scripts/content/scan.ts`: exit 0, **2 findings, 0 errors, 0 on served items**, the same two before and after (`cue.length`
  warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P15's).
- Tests, with the DB-free config `.superpowers/p13/fixb-scan/vitest.nodb.config.ts` (`ANTHROPIC_API_KEY` empty, `AI_FAKE=1`):
  `keycheck`, `reconcile`, `reconcile-cli`, `blind`, `scan`: **65 pass**; `committed-content`: 1 pass.
- `p15-sat-rw.test.ts`: 7 pass, **2 fail**; `p15-sat-math.test.ts`: 8 pass, **1 fails**:
  - the record test ("each our own draft (or verified by two blind solvers)") expects a draft or `verified_auto`; a quarantine is the
    third state reconcile writes, so it fails on `C21-rw1a10` (the first of the four);
  - "no lesson, reserve or practice pool holds a C21 item", in both files: `pool({ purpose: 'practice' })` now returns the 77 verified
    R&W items (and, after the Math checkers' `c9aaef9e`, the 66 Math ones). `src/server/content/bank.ts` keeps no bank out of the pools
    for being a form bank, so served C21 items reach general practice, which the P15 format rules out ("C21 is served only by id from
    the form"). This is the pool code, not the content; it was hidden while every C21 item was a draft.

### For the integrator (not changed here)

- **The form cannot be served whole yet**: `form-1.json` lists the four quarantined items (module 1 `rw1a10`, `rw1a15`; the easier
  module 2 `rw2e08`, `rw2e10`). Each needs a version 2 by its author and two fresh blind solvers.
- **C21 in the practice pool**: `bank.ts` should keep C21 (a form bank) out of `pool()` for practice and checks, as the two P15 tests
  expect; until then the served C21 items are drawn into general practice.
- **The no-passage rule for `sat_rw`**: `reconcile()` applies a `no_passage_needed` flag only to `read_*` / `reading` skills and passage
  items. SAT R&W items carry their text in the stem under the one skill `sat_rw`, so the rule misses them (applied here by hand,
  `check-rw2/apply.ts`). Recognising `sat_rw` (at least its Information and Ideas and Craft and Structure domains) in that test would make
  the script decide it.
- The record test in `p15-sat-rw.test.ts` should accept `quarantine` with a `quarantine_reason` (as `p14-content.test.ts` reads both
  states); the ten "guessable" items above are verified, listed for the author's next revision of the form.
