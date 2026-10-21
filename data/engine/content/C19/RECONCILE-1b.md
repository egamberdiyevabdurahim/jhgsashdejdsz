# C19: key check 2 of the phase 1b lesson bodies (lane B3, 13 Oct 2026)

Phase 1b added five C19 files (`.superpowers/p6b/PLAN.md` §1). Two pairs of blind solvers check them. Checkers 1 and 2 (B3s1,
B3s2) check the SAT R&W files `C19-3.json`, `C19-4.json` and `C19-5.json`. Checkers 3 and 4 (B3s3, B3s4) check the IELTS Reading
files `C19-6.json` and `C19-7.json`. Each pair reconciles only the pieces it answered, because a pair's `reconcile.ts` run skips an
item that none of its solvers answered. Each pair writes its own section of this file. The phase 1a pass is in `RECONCILE.md`.

## SAT R&W: C19-3, C19-4 and C19-5 (checkers 1 and 2)

This section is for checker 2. When the IELTS section below was committed, B3s1 had no answers file in `.blind/` and checker 2 had
not committed, after a 30-minute wait. So the IELTS pair committed first, by explicit path. The 36 SAT R&W pieces are still
`draft` with `key_check_2: null` here.

## IELTS Reading: C19-6 and C19-7 (checkers 3 and 4, 13 Oct 2026)

This section covers the IELTS Reading lesson bodies of phase 1b (`.superpowers/p6b/PLAN.md` §1, §3):

- `C19-6.json` by `agent:p6b-a4` (commit `6a97d68`). It holds the lessons C19-IERE01-1, C19-IERE02-1 and C19-IERE02-2, and their
  piece questions `C19-ie11q1-3`, `ie21q1-3` and `ie22q1-3`.
- `C19-7.json` by `agent:p6b-a5` (commit `0a6f154`). It holds the lessons C19-IERE03-1 and C19-IERE04-1, and their piece questions
  `C19-ie31q1-3` and `ie41q1-3`.

That is 5 lesson records and 15 piece questions. Before this pass, all of them were `draft`, `version: 1`,
`key_check_1: "author"` and `key_check_2: null`. Their reserve items (100, in C7) are reconciled in `C7/RECONCILE-1b.md`.

### Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| B3s3 (checker 3) | `.blind/C19-B3s3.json` | `.blind/C19-B3s3.answers.json` |
| B3s4 (checker 4, who ran this reconcile and wrote this section) | `.blind/C19-B3s4.json` | `.blind/C19-B3s4.answers.json` |

Each copy was made by `node scripts/content/blind.mjs C19 <solver>`. It holds the bank's 87 items (shuffled per solver, no key,
no `why`), and this pair answered only the 15 IELTS pieces. B3s4 opened neither `.blind/.map-*` nor the C19 records before writing
its answers file, and the same rule binds B3s3. B3s4 wrote its answers before it read B3s3's. B3s3, B3s4, `p6b-a4` and `p6b-a5` are
four agents to `agentOf`.

### The decision

`npx tsx scripts/content/reconcile.ts C19 B3s3 B3s4` gave **87 items: verified 13, quarantine 2, pending 0, blocked 0, skipped
72.** The 72 skipped items are the 36 phase 1a maths pieces, already `verified_auto` (`blind:A2s1+A2s2`), and the 36 SAT R&W
pieces, which this pair did not answer. Among the 15 IELTS pieces, **13 are verified and 2 are
quarantined.** No answer was stale. B3s3 chose the key on all 15. B3s4 chose the key on all 15 and flagged two of them.

| Status after this pass | Pieces | Record |
|---|---:|---|
| `verified_auto` | **13** | `key_check_2: "blind:B3s3+B3s4"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | **2** | `C19-ie22q1`, `C19-ie22q2`: `key_check_2: null`, with their `quarantine_reason` |

**The quarantines: C19-ie22q1 and C19-ie22q2** (the idea and example pieces of C19-IERE02-2, "The Not Given trap"). B3s4 flagged
both `no_passage_needed`. Each is a "TRUE, FALSE or NOT GIVEN, with the right reason" question, and three of its four reasons fail
**whatever the text says**, so the key can be found from the options alone:

- **ie22q1**, "The shop opens early in the morning". "FALSE: buses leave every thirty minutes" and "FALSE: the shop sells only
  drinks" cannot bear on opening hours. "TRUE: a shop at a bus station must open before the first bus" argues from outside the text.
  Only the NOT GIVEN reason is left.
- **ie22q2**, "The café is open all year". "FALSE: the café is small, so it closes in winter" is an inference. "TRUE: the park has a
  café" cannot prove "all year". "FALSE: the café was added last summer" cannot decide it either. Only the NOT GIVEN reason is left.

Spec §5.5 step 4 says that a reading item a solver answers without its passage is quarantined, and `reconcile.ts` does that on one
solver's flag for a reading skill. B3s3 chose the key on both items without a flag. The fix is a version 2 by a4. It should give
the three distractors reasons that only the text can refute, as `C19-ie21q2` in the same file already does (all four of its reasons
are claims about the text). For example, ie22q1 could offer "FALSE: the text says the shop opens at nine". **For the controller:** a
piece question teaches rather than measures, and ie22q2 is the worked example's own blank step. If a ruling exempts piece questions
from the no-passage test, both items can be verified on these same answers with the flag dropped, because both solvers chose the key.

### The lesson records

`reconcile.ts` reads only `items`. This pass follows the A2 precedent above ("The lesson records"): a lesson gets
`key_check_2: "blind:B3s3+B3s4"` and `status: "verified_auto"` when all three of its piece questions are verified 2/2 by this pair
at the lesson's version. Its `example` question q2, which is the worked example's own blank step, is among them.

| Lesson | Pieces | Lesson after this pass | Reserve (C7) after this pass |
|---|---|---|---|
| C19-IERE01-1 | ie11q1-3 verified | `verified_auto` | 20 of 20 `verified_auto` (ir1101-1120) |
| C19-IERE02-1 | ie21q1-3 verified | `verified_auto` | 20 of 20 `verified_auto` (ir2101-2120) |
| C19-IERE02-2 | ie22q1, q2 quarantined; q3 verified | **stays `draft`**, `key_check_2: null` | 19 of 20 (`C7-ir2214` quarantined) |
| C19-IERE03-1 | ie31q1-3 verified | `verified_auto` | 20 of 20 `verified_auto` (ir3101-3120) |
| C19-IERE04-1 | ie41q1-3 verified | `verified_auto` | 20 of 20 `verified_auto` (ir4101-4120) |

Nothing else in a lesson record changed. The `note` of each file now says that the key check is done, in place of "Draft until B3's
blind 2/2 key check." (`C19-6.json`) and "All draft until the blind key check (B3)." (`C19-7.json`).

**How the files were written.** `reconcile.ts --write` wrote the 15 decisions into `C19-6.json` and `C19-7.json`. Both files
round-trip through `JSON.stringify` at their own indent, so the rewrite changed only the decided fields. A small script then set the
four lesson records and the two notes, changing values in place. A parse of each file before and after shows that only these fields
changed: `key_check_2`, `status`, `key_check_2_version` and `quarantine_reason` on the 15 items, `key_check_2` and `status` on the four
lessons, and the `note`. The decision log is `.blind/C19-reconcile-1b-ielts.json` (local). The bank's own `.blind/C19-reconcile.json`
was left as it was. B3s4's first `--write` stored notes that named options by B3s4's shuffled letters, which mean nothing in the
record. So B3s4 reworded those two notes to name the options by their text, restored the two files from `HEAD` and wrote the
decisions again. No answer and no flag changed.

**Noted, not flagged:** C19-ie41q1 ("fallen rocks" next to "large fallen rocks") and ie41q3 ("willow sticks" next to "thin willow
sticks") have the word-limit twin described in `C7/RECONCILE-1b.md`. That twin is the lesson's own trap, and the reader still needs
the text for the other options.

**Checks after the write:** `npx tsx scripts/content/validate.ts --no-families --all` gave exit 0, **0 errors, 858 warnings, 253
notes**. That is the phase 1b baseline of 251 notes plus one `file.skipped` note for each new `RECONCILE-1b.md`, and there is no
finding on any `C19-ie` or `C19-IERE` id. The uz lint of `C19-6.json` and `C19-7.json` (and of C7-7/8) gave 0 findings. The rules
are in `C7/RECONCILE-1b.md`.

### Each piece question

`key` means the solver chose the author's key (`options[0]`). The evidence is B3s4's blind working. Any letter in it is a letter of
B3s4's shuffled copy.

| Item | File | Lesson, piece | Subskill | Level | Author | B3s3 | B3s4 | Decision | B3s4's evidence |
|---|---|---|---|---|---|---|---|---|---|
| C19-ie11q1 | C19-6.json | C19-IERE01-1 idea | skimming | B1 | a4 | key | key | verified_auto | the stem: writing the answers is part of the 60 minutes, so no extra 10 minutes; 3 passages x about 20 min |
| C19-ie11q2 | C19-6.json | C19-IERE01-1 example | skimming | B1 | a4 | key | key | verified_auto | first and last sentences: an empty roof, pupils plant it, other schools will copy: the roof garden |
| C19-ie11q3 | C19-6.json | C19-IERE01-1 trap | scanning | B1 | a4 | key | key | verified_auto | visitors under sixteen pay nothing; a 12-year-old is under sixteen |
| C19-ie21q1 | C19-6.json | C19-IERE02-1 idea | true_judgement | B1 | a4 | key | key | verified_auto | lessons for children on Tuesday and Thursday evenings = twice a week; D false (closed Sundays) |
| C19-ie21q2 | C19-6.json | C19-IERE02-1 example | true_judgement | B1 | a4 | key | key | verified_auto | lends books for three weeks |
| C19-ie21q3 | C19-6.json | C19-IERE02-1 trap | not_given_judgement | B1 | a4 | key | key | verified_auto | material not stated (the name only); B true, C false (summer weekends), D false (lamp is gone) |
| C19-ie22q1 | C19-6.json | C19-IERE02-2 idea | not_given_judgement | B1 | a4 | key | no_passage_needed | quarantine | the NOT GIVEN option is the only one whose reason can be right whatever the text says: 'buses leave every thirty minutes' and 'sells only drinks' cannot bear on opening hours, and 'a shop at a bus station must open before the first bus' argues from outside the text. Fix: reasons only the text can refute (e.g. 'FALSE: the text says the shop opens at nine') |
| C19-ie22q2 | C19-6.json | C19-IERE02-2 example | not_given_judgement | B1 | a4 | key | no_passage_needed | quarantine | same pattern: 'small, so it closes in winter' is an inference, and 'the park has a café' and 'added last summer' cannot decide 'open all year' whatever the text says; only the NOT GIVEN reason can be right, so the key is found without the text |
| C19-ie22q3 | C19-6.json | C19-IERE02-2 trap | not_given_judgement | B1 | a4 | key | key | verified_auto | the number rose, not by how much; B false (Mondays only), C false (some join two), A true |
| C19-ie31q1 | C19-7.json | C19-IERE03-1 idea | matching_headings | B1 | a5 | key | key | verified_auto | crowded square -> moved to the bus station, three times larger |
| C19-ie31q2 | C19-7.json | C19-IERE03-1 example | matching_headings | B1 | a5 | key | key | verified_auto | unsold bread, stale loaves, sacks: nothing wasted; A-C are single details |
| C19-ie31q3 | C19-7.json | C19-IERE03-1 trap | matching_headings | B1 | a5 | key | key | verified_auto | the toy-repair table is the point; A is the opening detail |
| C19-ie41q1 | C19-7.json | C19-IERE04-1 idea | sentence_completion | B1 | a5 | key | key | verified_auto | 'clear away fallen rocks'; C is three words |
| C19-ie41q2 | C19-7.json | C19-IERE04-1 example | sentence_completion | B1 | a5 | key | key | verified_auto | 'Warm clothes are recommended' |
| C19-ie41q3 | C19-7.json | C19-IERE04-1 trap | sentence_completion | B1 | a5 | key | key | verified_auto | 'paper and thin willow sticks': two words = willow sticks; B is three |
