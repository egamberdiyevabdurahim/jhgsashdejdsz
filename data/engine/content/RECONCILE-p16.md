# P16: key check 2 of the content lane's five IELTS Listening records, and their lessons (19 Oct 2026)

The ids are `.superpowers/p16/ids-content.json` of the integration worktree `jg-p5int` (ids only): five IELTS Listening questions written
at version+1 by the P16 content lane (`agent:p16-content`): `C20-li1113` v2, `C20-li1115` v2, `C20-li1119` v2, `C20-li5209` v2 and
`C19-li61q1` v3, and the two lesson records held for them, `C19-IELI05-2` and `C19-IELI06-1` (`C19-IELI01-1`, the third, holds
`li1113`, `li1115`, `li1119` in its reserve). Content at `p16-content` `d22a0820`. Two fresh blind checkers keyed them, each from the
audio; this file is checker 2's record (P16cs2, who ran the reconcile and the lesson-record check).

**Items: verified 2 (`C20-li1115` v2, `C20-li1119` v2); quarantined 2 (`C20-li1113` v2, `C20-li5209` v2: the key right by both solvers,
a form one of them accepts refused by the accept list); left draft 1 (`C19-li61q1` v3: one blind check, P16cs2 had seen its key).
Lessons: none changes; `C19-IELI01-1`, `C19-IELI05-2` and `C19-IELI06-1` stay `draft`.**

## Where it started

| Record | Status, version | key_check_2 | Clip |
|---|---|---|---|
| `C20-li1113` ("Collection time: ______ am", THREE WORDS AND/OR A NUMBER) | draft, v2 | null | `ieli01-r4.mp3`, 90 s |
| `C20-li1115` ("Name: Grace ______", ONE WORD ONLY) | draft, v2 | null | `ieli01-r7.mp3` (new in P16), 79 s |
| `C20-li1119` ("Start date: ______ September", ONE WORD AND/OR A NUMBER) | draft, v2 | null | `ieli01-r6.mp3`, 75 s |
| `C20-li5209` ("Jess must also bring some ______ for the security desk.", ONE WORD ONLY) | draft, v2 | null | `ieli05-r3.mp3`, 109 s |
| `C19-li61q1` ("be back on the bus by ______", THREE WORDS AND/OR A NUMBER) | draft, v3 | null | `ieli06-p1.mp3`, 62 s |
| lessons `C19-IELI01-1`, `C19-IELI05-2`, `C19-IELI06-1` | draft, v1 | null | |

## Who checked, and how blind

| Solver | Copy | Answers (written) |
|---|---|---|
| P16cs1 (checker 1) | `jg-p5int/.superpowers/p16/blind-content/C19-P16cs1.json`, `C20-P16cs1.json` (21:53) | `C20-P16cs1.answers.json` 22:02:30, `C19-P16cs1.answers.json` 22:02:40 |
| P16cs2 (checker 2) | `blind-content/C19-P16cs2.json`, `C20-P16cs2.json` (21:49), made by `P16cs2-work/blind-ids.ts`: `blindCopy` (src/engine/content/blind.ts) over the listed ids only, per stream, with each clip's script replaced by its file name, so no transcript was in the copy | `C20-P16cs2.answers.json` 21:57:35; `C19-P16cs2.not-blind.answers.json` (written 21:57:45 as `C19-P16cs2.answers.json`, set aside below); SHA-256 of both in `P16cs2.frozen.sha256` (21:58) |

- Both solved from the audio: P16cs2 with faster-whisper large-v3 (GPU, `D:/tools/whisper/venv-gpu`, nothing installed) on each whole clip,
  and on the answer's span alone at 1.0 and atempo 0.7 with large-v3 and small.en (`P16cs2-work/tx`, `spans-tx`, `spans-tx2`); P16cs1
  with large-v3, large-v3-turbo and small.en, whole clip and spans at 0.7x and 0.5x (its notes). Each wrote the answer a careful candidate
  writes and every other form it expects a fair IELTS marker to accept (P16cs2 `forms`, P16cs1 `also_accept`, with `arguable` and
  `not_accept` lists).
- P16cs1, P16cs2 and the author `agent:p16-content` are separate agents (`agentOf`: no `SESSIONS` pattern matches them).
- P16cs2 opened no `.map-*` file, no RECONCILE file, no `.superpowers/p15/blind-*`, `check-*`, `author-*` or `p16/content-*` file, no
  commit message, and no `clips.json` script, before its answers were written. It read checker 1's answers at about 22:03, after both
  files were frozen and checker 1's were written; then `RECONCILE-p15-q2.md` (for the lesson-record check), the items' accept lists and
  the content README's P16 section.
- **Disclosure (P16cs2, `C19-li61q1`).** Before it solved, P16cs2 grepped this folder's README for its register and saw the P15 row of
  `C19-24.json`, which says `C19-li61q1` v2's accept list "holds 2.15 pm, 14:15 and the like". Version 3 has the same key. Its answer
  to that item (2.15, from the audio: "Please be back on the bus by a quarter past two", 18.5-21.3 s, both models, whole clip and span)
  is therefore **not a blind check** and is not counted, as `RECONCILE-p15-q2.md` ruled for P15q2s2: the file is set aside as
  `C19-P16cs2.not-blind.answers.json`. The same grep showed the P15 row of `C20-1.json`, which names version 1's key of `C20-li1115`
  ("Varga", on clip `ieli01-r5`); version 2 is a different name on a new clip (Malloy, `ieli01-r7`), so that line names nothing of the key
  P16cs2 checked. It showed no key of `li1113`, `li1119` or `li5209`.
- **Disclosure (P16cs2, after the write).** Checking the write's diff (`git diff -U0`), P16cs2 saw the first part of the earlier
  `quarantine_reason` (history) of `C19-li61q1` and `C20-li1115`: after every answer was written and read; it changed nothing.

## The decision

`npx tsx scripts/content/reconcile.ts C20 P16cs1 P16cs2 --blind jg-p5int/.superpowers/p16/blind-content --json …` (`jg-p5content`, a dry
run): 240 items, the four P16 items `verified` (both solvers chose the key: `typedRight` against each accept list and word limit), the
other 236 already verified by two checks and left alone; no answer stale, no flag. `reconcile.ts` grades the one answer each solver
gives; the brief's second rule, that every form either solver gives as one a fair marker accepts is in the accept list, is graded by
`P16cs2-work/forms-check.ts` (every form of both solvers through `typedRight`; `forms-check.out`):

| Item | What the audio says | Both answers | Forms a solver accepts that the list refuses | Decision |
|---|---|---|---|---|
| `C20-li1113` v2 | "Is nine o'clock all right?" / "We open at nine, but Saturdays are very busy. If you come at a quarter to nine, I'll have them ready for you." / "A quarter to nine, then." (22-34 s) | 8.45, 8.45 (key) | P16cs1: 8.45 am, 8:45 am, 8.45am, 8:45am, 8.45 a.m. (P16cs2: "8.45 am" borderline, not required) | **quarantine** |
| `C20-li1115` v2 | "Grace Malloy." / "Could you spell your surname for me?" / "Of course, it's M-A-double-L-O-Y." / "M-A-double-L-O-Y, thank you." (15-29 s) | Malloy, Malloy (key) | none (accepted: Malloy; refused: Maloy, Mallow, Malley, Grace Malloy) | **verified** |
| `C20-li1119` v2 | "Portuguese for beginners. The new course starts on the 22nd of September." / "September. The 22nd." (21-28 s) | 22nd, 22 (key) | none (22, 22nd, twenty-second accepted; P16cs1's "arguable" the 22nd is over `withinLimit`, which counts 22nd as a word, and no solver accepts it) | **verified** |
| `C20-li5209` v2 | "Your portfolio, of course, but please don't bring printed copies … just bring it on a laptop or a tablet. Oh, and some ID for the security desk." (61-73.5 s) | ID, ID (key) | P16cs2: identification (P16cs1: arguable) | **quarantine** |
| `C19-li61q1` v3 | "Our first stop is the Old Harbour, where you'll have 20 minutes. Please be back on the bus by a quarter past two." (13.8-21.3 s) | P16cs1 2.15 (key); P16cs2 not counted | none: all 13 of P16cs1's forms and all 11 of P16cs2's are accepted; "by 2.15" (P16cs1, arguable) refused | **left draft**: `reconcile.ts C19 P16cs1` gives "1 blind solver answered it (2 needed)" |

**The two quarantines are not key faults.** Each is a form the P16 sweep refused by rule (README, P16 section: "a word or sign already
printed next to the gap ('8.45 am' in '______ am' …)" and "a different word from the one heard (identification for 'ID' …)", the second
from `C19-IELI04-1`'s trap piece, "write what you hear, not a word you think means the same"), which one independent solver judged a fair
marker would accept and the other did not refuse. Two solvers who disagree on an accepted answer quarantine the item (spec §5.5 step 4),
and both classes reach past these two items (every gap with a printed word beside it; every abbreviation), so they are the controller's
to rule on:

- **Printed word beside the gap** (`li1113`): a candidate who writes "8.45 am" into "______ am" has the time right and stays within the
  limit. `p16-content.test.ts` holds the sweep's rule (no accepted form repeats the printed word), and the format allows 12 accepted
  answers, so the item cannot simply list them all; the general fix would be the grader's (drop a printed word the answer repeats), as it
  already ignores the currency sign.
- **The full form of the word heard** (`li5209`): "identification" for "ID". Keys commonly accept an abbreviation and its full form;
  the course teaches the opposite.

If the controller rules that both rules stand, `npx tsx scripts/content/reconcile.ts C20 P16cs1 P16cs2 --blind
jg-p5int/.superpowers/p16/blind-content --write` decides the two again on the same answers and verifies them (version 2, no rewrite). If
it rules for the forms, each needs a version 3 that adds them, and a new blind check.

Written (`P16cs2-work/apply-decisions.ts`: the reconcile's decisions for the listed ids only, by `applyDecision` as `reconcile.ts --write`
writes them, the two quarantines in place of "verified"; it refuses any decision on another item): `C20-li1115` and `C20-li1119`
`verified_auto`, `key_check_2: blind:P16cs1+P16cs2`, `key_check_2_version: 2`; `C20-li1113` and `C20-li5209` `quarantine`,
`key_check_2: null`, `quarantine_reason` beginning "P16 key check 2". The decisions: `blind-content/C20-reconcile.json`,
`C19-reconcile.json`; the quarantine reasons as written: `blind-content/P16cs2.overrides.json`.

## The lesson records

`P16cs2-work/lessons-check.ts`, the check `RECONCILE-p15-q2.md` ran ("The lesson records"): the record parses (`LessonRecordZ`); its
pieces are idea, example, trap, checking q1, q2, q3, each `verified_auto` by two independent checks recorded for its version, with `page`
naming the lesson; every clip a piece or question names is in `C20/clips.json` with its file in `public/media/listening/`; the example's
last line ends "?" in en, uz and ru and its "Now you" does not state q2's key; the reserve is 20 items, each served at its version with a
valid clip, in exactly one lesson's reserve, with no `page`; the pieces' numbers in uz and ru are en's. Then by hand: the pieces' facts in
en against the clips. As a control, the served `C19-IELI01-2` passes it.

| Lesson | Result | Status |
|---|---|---|
| `C19-IELI01-1` | its reserve holds `C20-li1113` (quarantine); everything else holds (q1-q3 served; the other 19 reserve items served, `li1115` and `li1119` now included) | `draft` (not checked further: its reserve is not all verified) |
| `C19-IELI05-2` | its reserve holds `C20-li5209` (quarantine); everything else holds. The "Now you" names q2's key among two ("Fifteen or fifty?"), the note `RECONCILE-p15-q2.md` made, not a fault | `draft` |
| `C19-IELI06-1` | its q1 `C19-li61q1` is `draft`; every other part passes, by script and by hand: the idea piece (each recording heard once, read the next question ahead, let a missed answer go) is right for the test; the example's worked half (2.15) is the clip's "a quarter past two" and q1's key; its "Now you" restates q2 ("Where are photographs not allowed?", signpost "Our second stop is the cathedral", 22.3 s in the clip) and ends "Answer: ?" in en, uz and ru without q2's key; q3's gap is the clip's "again tomorrow for free"; uz and ru carry en's numbers | `draft` (complete when `li61q1` is keyed: one fresh solver, `reconcile.ts C19 P16cs1 <fresh> --blind …/blind-content`, then this check) |

No lesson record changed. The loader (`lessonBank`, `P16cs2-work/loader-check.ts`) serves the other nine listening lessons and holds
these three (`draft`), as before.

## What the write changed

`C20/C20-1.json` (`li1113`, `li1115`, `li1119`) and `C20/C20-5.json` (`li5209`): only `status`, `key_check_2`, `key_check_2_version`
and (the two quarantines) a new `quarantine_reason`; the earlier `quarantine_reason` of `li1115` stays as history, as `applyDecision`
keeps it. No key, accept list, word limit, stem, clip, version or note changed; LF, no BOM. `C19/C19-24.json` is unchanged (`li61q1`
was written `verified_auto` with P16cs2's answer counted, then restored byte for byte from `HEAD` once the disclosure above was weighed).
The tests read the third state: `p16-content.test.ts` and `p15-listen.test.ts` take a P16 record that is `quarantine`, with no key check
2 and a reason that begins "P16 key check 2".

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`, on a `git archive HEAD` copy and with `--baseline` that copy on the result:
  **0 errors, 897 warnings, 301 notes both times**, 0 items blocked; no key changed in place. C20: 238 `verified_auto`, 2 `quarantine`;
  C19: 479 `verified_auto`, 1 `draft`.
- `npx tsx scripts/content/scan.ts --out …`: **2 findings, 0 errors, 0 on served items** (`cue.length` on the quarantined `C7-rs5q02`,
  `C7-rs5q05`), before and after, the same findings.
- `npx vitest run tests/unit/content/p16-content.test.ts tests/unit/content/p15-listen.test.ts`: 2 files, 17 tests passed.

## Not done here

- `C19-li61q1` v3 needs one fresh blind solver (P16cs1's answers stay in `blind-content/`); then `C19-IELI06-1`'s lesson-record check.
- The controller's ruling on the two accept-list classes above; then `C20-li1113` and `C20-li5209` are decided again, and `C19-IELI01-1`
  and `C19-IELI05-2` get their lesson-record check.
