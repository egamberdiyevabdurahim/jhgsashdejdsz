# RECONCILE p15-q3: key check 2 of C20-li1110 and C19-li61q1 (version 2), and lesson C19-IELI06-1

19 Oct 2026, branch `p15-content`. Two IELTS Listening typed-answer items that `agent:p15-q2` rewrote as version 2 (both `draft`,
`key_check_2: null`) got a fresh blind key check from two solvers of separate agents, neither the key author's session (`author:
agent:p15-listen`; the v2 by `agent:p15-q2`):

| Solver | Agent | How it answered |
|---|---|---|
| `P15q3s1` | blind key checker 1 of 2 (its own session) | its blind copy |
| `P15q3s2` | blind key checker 2 of 2 (this session) | its blind copy, **from the audio**: no clip script was read before answering |

P15q3s2 saw no key, `why`, `quarantine_reason`, `key_check_1`, commit message, earlier RECONCILE file, clip script or other solver's file
before its answers were written (P15q3s1 reports for itself). Both blind copies and answer files are in `.superpowers/p15/blind-q3/` of the `p5-int` worktree
(`<stream>-<solver>.json`, `.answers.json`, `.map-…`), and the decision logs `C20-reconcile.json` and `C19-reconcile.json` beside them.

## Result: 2 of 2 verified, 0 quarantined

| Item | Gap (typed, word limit) | Clip | P15q3s1 | P15q3s2 wrote | Decision |
|---|---|---|---|---|---|
| `C20-li1110` v2 | NORTHWAY COACHES lost property report, "Journey: from Leeds to ______" (ONE WORD ONLY) | `ieli01-r3` (107 s) | key | `Kendal` | **`verified_auto`**, `key_check_2: "blind:P15q3s1+P15q3s2"`, `key_check_2_version: 2` |
| `C19-li61q1` v2 | Harbour City bus tour, "First stop: the old harbour; be back on the bus by ______" (NO MORE THAN THREE WORDS AND/OR A NUMBER) | `ieli06-p1` (62 s) | key | `2.15` | **`verified_auto`**, `key_check_2: "blind:P15q3s1+P15q3s2"`, `key_check_2_version: 2` |

`reconcile.ts` graded both answers of both solvers as the key (`{"P15q3s1": "key", "P15q3s2": "key"}`), no flag raised, no stale copy, no
validator error on either item. Only `key_check_2`, `status` and `key_check_2_version` changed (`applyDecision`); the key, the stem,
the version and the `quarantine_reason` (v1's history) are as `agent:p15-q2` left them.

### How P15q3s2 heard them

`faster-whisper` 1.2.1 (`D:/tools/whisper/venv`, already installed; models `Systran/faster-whisper-small.en` and
`mobiuslabsgmbh/faster-whisper-large-v3-turbo`, both cached), each clip in full, beam 5, English, on CPU:

- `ieli01-r3`: "Where were you travelling from?" / "From Leeds up to Kendal." / "Could you spell that for me?" / large-v3-turbo
  "Sure, that's K. E-N-D-A-L." (46.7-49.8 s; small.en heard the second letter as D, the six letters ending in L in both); the town is
  said again at the end ("our office at the bus station in Kendal"). Answer `Kendal`: the spelled form, one word.
- `ieli06-p1`: "Our first stop is the Old Harbour, where you'll have 20 minutes. Please be back on the bus by a quarter past two."
  (13.9-21.5 s, both models word for word). Answer `2.15`; `2:15` and `quarter past two` were noted as equally right, and "a quarter
  past two" as four words, over the limit.

### After the decision (the key read only now): the accept lists against other right and wrong forms

`typedRight` (`src/engine/content/typed.ts` of `p8-lessons`), the grader the server uses:

- `C19-li61q1` accept `2.15, 2:15, quarter past two, 2.15 pm, 2:15 pm, 2.15 p.m., 2:15 p.m., 14.15, 14:15, quarter past 2, two fifteen`:
  right `2.15`, `2:15`, `quarter past two`, `2.15pm`, `2:15 p.m.`, `14:15`, `two fifteen`, `quarter past 2`; wrong `a quarter past two`
  (four words, over the limit, as in IELTS) and `2.30`. One form within the limit is refused: `2.15 in the afternoon` (a number and three
  words). It is a rare way to write a time in a gap and IELTS keys do not list it; noted, not a reason to quarantine.
- `C20-li1110` accept `Kendal`: right `Kendal`, `KENDAL`, `kendal.`; wrong `Kendall`, `Kenda`, `Leeds`. With the name spelled out in
  the clip, only the spelled form is right, as in IELTS.

## The lesson record C19-IELI06-1: its own lesson-record check

`C19-li61q1` is the `idea` piece's question of lesson `C19-IELI06-1` ("IELTS Listening: One play only"), which was `draft` with
`key_check_2: null` only because that question was. Checked by P15q3s2 after the decision above, with the `p8-lessons` server code over
this branch's content folder and audio (`JG_LISTENING_DIR`):

1. **Shape:** the record parses as `LessonRecordZ` (`src/server/content/bank.ts`); 3 pieces (`idea`, `example`, `trap`), 20 reserve ids.
2. **Everything it names is served:** `unservedOf` returns `[]`: its three piece questions `C19-li61q1` (now), `li61q2`, `li61q3` are
   `verified_auto`; its 20 reserve items (`C20-li6101`-`li6120`, 20 distinct, 6 different clips) are all `verified_auto`; every clip they
   and the pieces name (`ieli06-p1` for all three pieces) is in `C20/clips.json` with its file on disk.
3. **Its text agrees with the clip and the verified keys:** the `example` piece works question 1 of the same clip ("Please be back on
   the bus by a quarter past two." Answer: 2.15), which is `li61q1`'s key (`accept[0]`), and what P15q3s2 heard; it then names the
   cathedral as the signpost for "Where are photographs not allowed?" and "Tickets can be used again ______ for free", both as the clip
   says them ("Photographs are allowed outside, but not inside"; "you can use it again tomorrow for free"). The example calls the guide
   "she": the clip's voice has a median pitch of 219 Hz (186-254 Hz interquartile), a woman's voice. `idea` and `trap` are test advice
   (one play only, keep one question ahead, let a missed answer go) and name no key. en, uz and ru say the same in each piece. The
   example, which shows `li61q1`'s answer, comes after the `idea` piece, whose question `li61q1` is.
4. **Validators:** no finding on the lesson or its three questions (below).

So the record is set to **`status: "verified_auto"`, `key_check_2: "blind:P15q3s1+P15q3s2"`**, only those two fields, as the ten IELI
lessons verified before it carry the label of the blind pass that checked their questions, and as `C19-IERE02-2` took
`blind:P7s3+P7s4`, the pass that verified its rewritten piece questions (content README, the P7 table). The record check itself was
P15q3s2's. The `p8-lessons` lesson bank now serves 11 of the 12 IELI lessons.

**Not changed: `C19-IELI01-1`** (`draft`). `C20-li1110` is in its reserve and is now verified, but the lesson is still held by
`C20-li1115` (`quarantine`): `unservedOf` = `["C20-li1115"]`. It needs that item's rewrite and blind check first, then its own
lesson-record check.

## Validators and scanner

Each run on this worktree's content after the change, and again on a copy of the content at `HEAD` (`git archive`, before the change),
`--baseline` the `HEAD` copy:

- **`scripts/content/validate.ts` of `p8-lessons`** (the engine that knows typed answers): **0 errors** after, as before (899 warnings,
  408 notes, the same); 0 items blocked; 0 served with an error; no key changed in place. The only difference: `status.history` (info)
  on the two items now says "a verified_auto item (v2) keeps its quarantine reason as history" where it said "a draft item".
- **`scripts/content/validate.ts` of `p15-content`** (this branch's own): 700 errors after, 698 before. Every one is the engine gap
  below, already on `HEAD`: `schema.unknown_field` 276 (`audio`, `accept`, `word_limit`: "not in the item format"), `format.none` 149 and
  `status.unverified` 273 on `HEAD` (every served listening question). The two new errors are `status.unverified` on `C20-li1110` and
  `C19-li61q1`, now served, for that same reason; nothing else differs.
- **`scripts/content/scan.ts`** (both engines): 2 findings, 0 errors, 0 on served items: `cue.length` warnings on `C7-rs5q02` and
  `C7-rs5q05`, nothing on C19 or C20.
- **The lesson bank** (`lessonBank` of `p8-lessons` over this content and audio): no record error; the IELI lessons served are 11 of 12
  (`C19-IELI06-1` now among them); held: `C19-IELI01-1` (`draft`, see above).

## Engine note

This branch's own content engine predates IELTS Listening's typed answers: on `p15-content`, `formatOf` reads an item with `accept` and no
`options` as an open prompt, so `scripts/content/blind.ts` leaves every typed listening question out ("an open prompt: nothing to key")
and `reconcile.ts` cannot grade one. The typed-answer engine (`src/engine/content/typed.ts`, `clips.ts`, and `format.ts`, `blind.ts`,
`reconcile.ts`, `schema.ts`, `validate.ts` changes) is on `p8-lessons` (the `jg-p5int` worktree), which contains every commit of
`p15-content`. So the blind copies, `reconcile.ts --write` and the lesson check ran with `p8-lessons` code (from `jg-p5int`, with
`--root` on this worktree's `src/engine/data/content`); nothing in `jg-p5int` was changed. P15q3s2's blind copy was made by that
`blindCopy` with the clip script left out (its no-passage switch, for the copy only; both solvers are scored as ordinary solvers), so the
copy shows the stem, the instructions and the word limit only. Until `p15-content` takes the typed-answer engine, its own `validate.ts`
reports every IELTS Listening question as an error (see "Validators and scanner"), already so on `HEAD`.

## Files

- `C20/C20-1.json`: `C20-li1110` (`key_check_2`, `status`, `key_check_2_version`).
- `C19/C19-24.json`: `C19-li61q1` (the same three fields) and the lesson record `C19-IELI06-1` (`key_check_2`, `status`).
- this file.
