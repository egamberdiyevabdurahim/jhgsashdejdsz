# C19 and C20: key check 2 of the P15 IELTS Listening questions (18 Oct 2026, retried 19 Oct 2026)

The P15 listening content lane (branch `p15-content`, worktree `jg-p5content`, commit `4149818b`, author `agent:p15-listen`) wrote the
IELTS Listening course: 12 lessons in `C19/C19-24.json` with their 36 piece questions, 240 reserve questions in `C20/C20-1.json` …
`C20-6.json`, and 48 clips (`C20/clips.json`, `public/media/listening/*.mp3`). The ids are in `.superpowers/p15/ids-listen.json` of the
integration worktree `jg-p5int` (ids only). An item is served only when two blind solvers outside the author's session agree with its key
and none finds a second correct answer (spec §5.5 step 4; `keycheck.ts`).

Key check 2 ran twice. The first pass (18 Oct, commit `aebf3c20`) is kept below as it was recorded. On 19 Oct the workflow was run again
("Try again"): fresh runs of checker 1 and checker 2, under the same solver names P15listens1 and P15listens2, solved every item again from
their blind copies. This section is checker 2's record of the retry (P15listens2, who ran the reconcile).

## The retry (19 Oct 2026)

**Verified: 273. Quarantined: 3** (`C20-li1110`, `C20-li1115`, `C19-li61q1`).

### Where it started

274 items `verified_auto` (`key_check_2: "blind:P15listens1+P15listens2"`, `key_check_2_version: 1`) and 2 `quarantine` (`C20-li1110`,
`C19-li61q1`), from the first pass. Nothing the solvers see changed after it: `git log` shows no commit on `C19/`, `C20/` or
`public/media/listening/` after `aebf3c20`, so the retry checks the same version 1 of each item and the same 48 MP3 files.

### Who checked, and how blind

| Solver | Blind copy | Answers |
|---|---|---|
| P15listens1 (checker 1, fresh run) | `blind-listen/<stream>-P15listens1.json`, made again at 01:03 | `<stream>-P15listens1.answers.json` (01:33:52, 01:35:38) |
| P15listens2 (checker 2, fresh run, who reconciled and wrote this) | `blind-listen/<stream>-P15listens2.json` (18 Oct 19:35, unchanged) | `<stream>-P15listens2.answers.json` (01:37:48) |

- **The copy.** P15listens2 ran `blind.ts C19|C20 P15listens2` from `jg-p5int` (the integrated code, which reads `audio`, `accept` and
  `word_limit`) with `--root C:/Users/PC/jg-p5content/src/engine/data/content` into a staging folder; `listen-check-2r/filter.cjs` kept the
  276 listed ids, dropped `audio_script` (the clip's transcript) and compared the result with the copy and map already in `blind-listen/` by
  SHA-256, printing only "same" or "differs": **both byte-identical** (the shuffle is seeded by solver and item), so nothing in
  `blind-listen/` was replaced, and the staged map was deleted unread. Each copy holds the stem, instructions, options lettered A-D or a typed
  gap's word limit; no key, no accept list, no `why`, no transcript.
- **Before its answers were written** P15listens2 opened no `.map-*` file, no `C20/clips.json`, no author ledger, notes, test or commit
  message, not this file (the first pass named keys), no item field but `audio` (`clipof.cjs`) and the counts of `status` and
  `key_check_2`, and no answers file: its own first-pass answers were moved, unread, to `blind-listen-prev-P15listens2/` (copies in
  `listen-check-2r/prior/`); checker 1 had moved its own to `blind-listen-prev-P15listens1/`. It was told no key.
- **From the audio only.** All 48 clips heard again with faster-whisper `large-v3-turbo` (MIT, `mobiuslabsgmbh/faster-whisper-large-v3-turbo`,
  already cached; the existing GPU venv `D:/tools/whisper/venv-gpu`, nothing installed), a different model from the first pass, into
  `listen-check-2r/heard-turbo/`, read beside the first pass's `large-v3` hearing of the same files (`listen-check-2/heard/`). Where the
  two hearings differ on a spelled name or a number (Fairclough, Kendal, the seat number, Ruddock, Varga, Lindell, Saltby, "meat"), the
  stretch was heard again on its own by both models, as recorded and slowed to 0.8 (`relisten.py`), and Kendal and Varga also at 0.6 and
  0.5 and letter by letter (`letters.py`, `logs/burst_probe.py`, the loudness envelope). Who says what in the
  Part 3 dialogues (ieli03-r4, r5, r6, ieli05-r5, ieli06-r3) was told by voice pitch (`voices.py`, `turns.py`).
- **Order.** P15listens2's answers (`listen-check-2r/work/*.json` compiled by `compile.cjs`, which checks every letter against its option
  text and every typed answer against its limit) were written at 01:37:48 (`listen-check-2r/answers-sha256.txt`); it first read checker 1's
  answers and notes after that, then the records' accept lists, then (to explain two clip defects) two lines of `clips.json`.
- P15listens1, P15listens2 and `p15-listen` are three agents (`agentOf`; no `SESSIONS` pattern), as in the first pass.

### The decision

A plain `reconcile.ts --write` leaves an item already `verified_auto` by two checks alone, so it cannot apply a disagreement found by a
second pass. The retry therefore decided every item with `--audit`, which re-decides each one from this pass's answers and never writes:
`npx tsx scripts/content/reconcile.ts <stream> P15listens1 P15listens2 --root <p15-content content> --blind .superpowers/p15/blind-listen
--audit --json …` (from `jg-p5int`; `listen-check-2r/audit-C19.json`, `audit-C20.json`, logs in `listen-check-2r/logs/`). No answer was
stale; neither file raises `unanswerable` or `no_passage_needed`.

| Stream | Listening items | Both solvers chose the key, no flag | A solver chose another answer | A solver flagged it |
|---|---:|---:|---:|---:|
| C20 | 240 | 238 | 1 (`C20-li1115`) | 1 (`C20-li1110`, P15listens2: `two_defensible`) |
| C19 | 36 | 36 | 0 | 0 |

The audit's verdicts: 274 verified, 2 quarantined. The reconciler then ruled on the three items that are not served, each written with the
engine's own `applyDecision` (`listen-check-2r/override.ts`: status `quarantine`, `key_check_2` null, no `key_check_2_version`, the reason in
`quarantine_reason`; the file written as `reconcile.ts` writes it). The 273 others keep their first-pass record, which this pass confirms:
both solvers chose the key again, with no flag. The decisions and rulings are in `blind-listen/reconcile-19oct.json`.

| Status after the retry | Items | Record |
|---|---:|---|
| `verified_auto` | **273** | `key_check_2: "blind:P15listens1+P15listens2"`, `key_check_2_version: 1` (unchanged) |
| `quarantine` | **3** | `C20-li1110`, `C20-li1115` (new), `C19-li61q1` |

### The three quarantines

| Item | Clip | The two solvers | Why it is quarantined (`quarantine_reason`, shortened) | The fix |
|---|---|---|---|---|
| `C20-li1115` (form: "Student: Leo ______", one word) | ieli01-r5 | P15listens1 **Vargas**, P15listens2 Varga (the key) | **A disagreement (new).** P15listens2 hears "Leo Varga" (no s), then the spelling V-A-R-G-A and silence until the next turn (no S burst), which the script confirms ("Leo Varga. Varga is V-A-R-G-A."). But the scripted "Varga is" is spoken so fast it sounds like "Vargas" (one of P15listens2's two Whisper models also wrote "Vargas" there), and P15listens1 heard "Leo Vargas, V-A-R-G-A-S". Both solvers chose Varga in the first pass. | Re-render the line so it cannot be heard as Vargas (e.g. "That's V-A-R-G-A"), then a new blind check. |
| `C20-li1110` (form: "Journey: from Leeds to ______", one word) | ieli01-r3 | both Kendal (the key); P15listens2 flagged `two_defensible` | **The audio does not settle the key's spelling** (as in the first pass, found again from the audio alone). Asked to spell it, the passenger gives "Sure, K-E-N-D-A" and the clip is silent until the next turn (about 46.8-49.6 s): both models at 1.0, 0.8, 0.6 and 0.5 speed, and each letter burst alone (the last one heard as "A" every time); the script's "K-E-N-D-A-L" lost its L in the rendering. Said twice as "Kendal", so Kendal and Kendall both fit what a candidate hears; accept holds only Kendal. (P15listens1's note this time: "spelled K-E-N-D-A-L … the envelope shows a sixth letter-syllable"; P15listens2's envelope and letter-by-letter hearing find five letters.) | Re-render the clip with the whole spelling (or accept Kendall), then a new blind check. |
| `C19-li61q1` (piece question: "be back on the bus by ______", three words and/or a number) | ieli06-p1 | P15listens1 2:15, P15listens2 2.15 (both accepted) | **A second correct answer is refused** (the first pass's ruling, kept). The audit alone would verify it, but the item is unchanged: the accept list (2.15, 2:15, quarter past two) still refuses 2.15 pm, 2:15 pm, 2.15pm, 14.15 and 14:15, correct ways to write "a quarter past two" within the limit (the stem has no am/pm). | A version 2 that adds them, then a new blind check. |

### Against the first pass

- P15listens2's fresh answers match its first-pass answers on 270 of 276; 5 differ only in the written form of a number or date, each
  accepted both ways (`C19-li11q3` 5 / 5th, `C20-li1104` 19 / 19th, `C20-li1109` 3 / 3rd, `C20-li1119` 22 / 22nd, `C20-li3214` 1500 /
  1,500); the sixth is the Kendal flag, which the first pass raised at the reconcile instead.
- Checker 1 changed one answer: `C20-li1115` Varga (18 Oct) → Vargas (19 Oct).

### Every item read with each option; every typed gap's other forms

- None of the 127 chosen items is a sentence with a blank that its options fill: they are questions, matching rows with one shared set of
  four, and plan labelling with plan letters. P15listens2 read each option against the clip and wrote, for each item, the line that decides
  it and why the others fail (a distractor said and corrected, the other speaker's view, the other corner of the plan); none has a second
  correct option. On every plan "on your left as you come in" is the bottom-left letter.
- The voice-decided items, each settled by pitch and by what the dialogue says: ieli03-r4 the woman opens "So, Owen", the man (Owen) takes
  the museum photos, the woman (Priya) the newspapers, both the interview; ieli03-r5 Sara (female) enjoyed the bird watching, Jack (male)
  found the water testing harder and the warden's talk "quite dull"; ieli03-r6 the student who fears the statistics is the one the tutor
  helps with "Luke, you check her numbers" (Zara), so Luke fears the discussion and Zara writes it; ieli05-r5 Polly (second voice) "was glad
  to hear" it is not laziness; ieli06-r3 the man who says "Imogen found a cafe" (Kai) gets the quotes, the woman (Imogen) talks to the cafe
  manager.
- The 149 typed gaps' accept lists, read after the answers (`listen-check-2r/typed-accept.txt`): both solvers' answers are accepted on all
  but `C20-li1115`; the dates, numbers, times, postcodes and British/American spellings accept their usual forms (19 / 19th / nineteenth,
  grey/gray, kerb/curb, licence/license, photos/photographs, 1500/1,500). Besides `C19-li61q1` (above), nothing a candidate would write from
  the audio is refused; the rarer forms of `C20-li1113`'s time ("quarter to 9", "08.45") are not accepted and are noted here, not quarantined.

### Lessons

`unservedOf` of the integrated code (`jg-p5int`, with its clip check; `JG_LISTENING_DIR` = this branch's `public/media/listening`),
`listen-check-2r/lessons.ts`:

| Lesson | Unserved now |
|---|---|
| C19-IELI01-1 | `C20-li1110`, `C20-li1115` (quarantined) |
| C19-IELI06-1 | `C19-li61q1` (quarantined) |
| the other ten | none |

The 12 lesson records stay `draft` with `key_check_2: null`, as written; no lesson record, piece, reserve or clip is touched.

### What the write changed

Two files, three items, only their key-check record: `C20/C20-1.json` `C20-li1115` (`status` verified_auto → quarantine, `key_check_2` →
null, `key_check_2_version` removed, `quarantine_reason` added) and `C20-li1110` (`quarantine_reason` extended with the retry's finding);
`C19/C19-24.json` `C19-li61q1` (`quarantine_reason` extended). A field-by-field diff against `HEAD` finds no other change: no key, accept
list, word limit, option, stem, clip, `why`, level, version or author; no top-level field; LF, no BOM, the final newline kept.

### Checks after the write

- `validate.ts <root> --no-families --all` (the integrated code's): exit 0, **0 errors, 897 warnings, 297 notes**, the same findings as
  before the write (the lists compared line by line); "served with an error: 0". C20 is 238 `verified_auto` + 2 quarantine of 240; C19
  479 + 1 of 480 (`listen-check-2r/logs/validate-before.log`, `validate-after.log`).
- `scan.ts <root> --out …`: exit 0, **2 findings, 0 errors, 0 on served items**, `findings.json` identical before and after (the two
  `cue.length` warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P15's) (`scan-before/`, `scan-after/`).
- `p15-listen.test.ts` of `jg-p5int` (the integrated pins) run against this folder (`listen-check-2r/vitest.listen.config.ts`, DB-free,
  `ANTHROPIC_API_KEY` empty, `AI_FAKE=1`): **6 of 7 pass; 1 fails as expected**: it pins the quarantines to exactly `C19-li61q1` and
  `C20-li1110`, and `C20-li1115` is now the third.

### For the integrator (not changed here)

- `jg-p5int`'s `tests/unit/content/p15-listen.test.ts` lists the quarantines as `['C19-li61q1', 'C20-li1110']`: add `C20-li1115` when this
  commit is merged.
- The author's fixes: re-render ieli01-r3 with the whole spelling of Kendal and ieli01-r5 so "Varga is V-A-R-G-A" cannot be heard as
  Vargas, and write a version 2 of `C19-li61q1` with the time forms added; each then a new blind check. Until then `C19-IELI01-1` and
  `C19-IELI06-1` are held.

## The first pass (18 Oct 2026), as recorded then

Superseded where the retry above differs: the status after it is 273 verified and 3 quarantined, not 274 and 2.

The P15 listening content lane (branch `p15-content`, worktree `jg-p5content`, commit `4149818b`, author `agent:p15-listen`) wrote the
IELTS Listening course: 12 lessons in `C19/C19-24.json` with their 36 piece questions, 240 reserve questions in `C20/C20-1.json` …
`C20-6.json` (40 a unit), and 48 clips (`C20/clips.json`, `public/media/listening/*.mp3`). The ids are in
`.superpowers/p15/ids-listen.json` of the integration worktree `jg-p5int` (ids only). An item is served only when two blind solvers outside
the author's session agree with its key and none finds a second correct answer (spec §5.5 step 4; `keycheck.ts`). P15 listening checkers 1
and 2 (P15listens1, P15listens2) keyed them. This file is checker 2's record (P15listens2, who ran the reconcile).

| Bank | File | Items | Typed / chosen | Version |
|---|---|---:|---|---|
| C19 | `C19/C19-24.json` | 36 piece questions `C19-li11q1` … `C19-li62q3` | 18 / 18 | 1 |
| C20 | `C20/C20-1.json` … `C20-6.json` | 240 (`C20-li1101` … `C20-li6220`) | 131 / 109 | 1 |

Before this pass all 276 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, no `key_check_2_version`.

### Who checked, and how blind

| Solver | Blind copy | Answers |
|---|---|---|
| P15listens1 (checker 1) | `.superpowers/p15/blind-listen/<stream>-P15listens1.json` | `<stream>-P15listens1.answers.json` (20:07) |
| P15listens2 (checker 2, who ran the reconcile and wrote this file) | `<stream>-P15listens2.json` | `<stream>-P15listens2.answers.json` (20:00) |

- **Tools.** This branch's code does not read the listening fields yet (`audio`, `accept`, `word_limit`: the code lane is branch
  `p15-listening`, worktree `jg-p5h2`, commit `cf52a886`). Every script of this pass therefore ran from `jg-p5h2` with
  `--root C:/Users/PC/jg-p5content/src/engine/data/content`: `blind.ts`, `reconcile.ts`, `validate.ts` and `scan.ts` (the format is the code
  lane's `.superpowers/p15/listening-format.md` §2 and §6). No code file of this branch was changed.
- **The copy.** `blind.ts C20|C19 P15listens2 --pending --blind <staging>`, then `listen-check-2/filter.cjs` kept exactly the 240 + 36 listed
  ids of each copy and its map, **and dropped `audio_script`** (the clip's transcript, which the code lane's copy carries), and wrote both
  into `blind-listen/`, unprinted; the staging files were deleted (C19's copy held 108 items: the 72 others are not P15 listening). A copy
  holds each question's stem, instructions, its options shuffled by the solver's own seed and lettered A-D or, for a typed gap, its word
  limit; no key, no accept list, no `why`, no transcript. The clip each question is played from (its `audio`, which the student's player
  plays) was read from the records by `clipof.cjs`, the only field read.
- **From the audio only.** P15listens2 never opened `C20/clips.json`, either `.map-*` file, the author's ledger, notes or test, the
  `D:/tools/whisper/work/` outputs (the author's audio check), nor checker 1's copy or answers before its own were written. It heard the 48
  MP3 files with faster-whisper (MIT; model `Systran/faster-whisper-large-v3`, MIT, already cached; the GPU venv `D:/tools/whisper/venv-gpu`)
  into `listen-check-2/heard/<clip>.txt` with timings (`transcribe.py`), then:
  - **who says what** in the 2-3 voice dialogues (Part 3; the Owen/Priya, Sara/Jack, Zara/Luke, Kai/Imogen and Polly questions):
    `turns.py` cuts a clip at its silences, hears each piece alone (small.en) and measures its voice pitch, so each turn has a voice
    (e.g. ieli03-r5: tutor ~90 Hz, Jack ~130 Hz, Sara ~200 Hz); `voices.py` the same by word timings;
  - **spelled names and numbers heard again** (`relisten.py`: the stretch alone, three decodes) and the loudness of a spelling counted letter
    by letter (`bursts.py`): `Fairclough`, `Thwaite`, `Delgado`, `Ruddock`, `Varga` (said "Varga", spelled V-A-R-G-A), `Jonah`, `Lindell`,
    `Saltby`, `Hale` are spelled in full; 16, 14, 50/10/30, 15, 12, 17, £260, 300/900 hold in every decode. The one spelling that does not is
    `Kendal` (below).
  - Then it read each question with its clip, chose a letter or wrote the words it heard (within the limit), and wrote one line of evidence
    per item. Its answers were written at 20:00:14 (`listen-check-2/answers-sha256.txt`) and not changed after.
- **Order.** At 20:06/20:08 `reconcile.ts` was dry-run with P15listens2 alone (only `reconcile.ts` reads the maps): 0 disagreements with the
  key in either stream. Checker 1's answers appeared at 20:07:05; P15listens2 read them, and their notes, after the dry runs with both.
- Each solver was a separate agent run, and neither is the author's session: `agentOf` reads P15listens1, P15listens2 and `p15-listen` as
  three agents (no `SESSIONS` pattern), so `keyCheckOf("blind:P15listens1+P15listens2", { author: "agent:p15-listen" })` is `{ kind: "blind",
  n: 2 }`.

### The decision

`npx tsx scripts/content/reconcile.ts <stream> P15listens1 P15listens2 --root <p15-content content> --blind .superpowers/p15/blind-listen
--write` (from `jg-p5h2`; dry runs first, the same decisions). **Both solvers chose the key on all 276 items**; no answer was stale, and
neither answers file raises `two_defensible`, `unanswerable` or `no_passage_needed`.

| Stream | Items in the stream | `reconcile.ts` verified | Quarantine | Pending | Blocked | Skipped |
|---|---:|---:|---:|---:|---:|---:|
| C20 | 240 | 240 | 0 | 0 | 0 | 0 |
| C19 | 480 | 36 | 0 | 0 | 0 | 444 (already served, none of them P15 listening) |

Then the reconciler quarantined two of them (the brief: "2/2 with the key and no second correct option → verified_auto; otherwise
quarantine with a note"), each with the engine's own `applyDecision` (`listen-check-2/override.ts`: status `quarantine`, `key_check_2`
null, no `key_check_2_version`, the reason in `quarantine_reason`; the file written as `reconcile.ts` writes it):

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **274** | `key_check_2: "blind:P15listens1+P15listens2"`, `key_check_2_version: 1` |
| `quarantine` | **2** | `C20-li1110`, `C19-li61q1` (below) |

**Verified: 274. Quarantined: 2.**

#### The two quarantines

| Item | Clip | Both solvers | Why it is quarantined | The fix |
|---|---|---|---|---|
| `C20-li1110` (form: "Journey: from Leeds to ______", one word) | ieli01-r3 | Kendal (the key) | **The audio does not settle the key's spelling.** The town is said twice ("from Leeds up to Kendal", "the bus station in Kendal"), but the spelling after "Could you spell that for me?" is cut short: "Sure, K-E-N-D-A", no L, then silence (about 46.8-48.9 s; heard so in every decode, and checker 1 noted the same defect on its own: "the spelling does not settle Kendal/Kendall"). From the audio a candidate may write Kendall (or Kenda); the accept list holds only Kendal. | Re-render the clip with the whole spelling (or accept Kendall), then a new blind check. |
| `C19-li61q1` (piece question, "be back on the bus by ______", three words and/or a number) | ieli06-p1 | 2.15 (the key) | **A second correct answer is refused.** The clip: "be back on the bus by a quarter past two"; the accept list (2.15, 2:15, quarter past two) refuses 2.15 pm, 2:15 pm, 2.15pm, 14.15 and 14:15, all correct ways to write that time within the limit (the stem has no am/pm), graded by the code lane's `typedRight`. | A version 2 that adds them, then a new blind check. |

### Every typed gap: the other ways to write what is heard

The analogue of reading each option in the blank: for each of the 149 typed gaps, `listen-check-2/variants.ts` (after the answers) graded the
other correct ways to write the answer heard, as the server grades them (`typed.ts`): a number in words, a date with and without "th" and
in words (19 / 19th / nineteenth), British and American spellings (grey/gray, kerb/curb, licence/license), the times 8.45 / 8:45 / quarter
to nine, 1,500 / 1500 / fifteen hundred, the postcodes with and without the space, photos/photographs. **146 accept every one.** The other
three:

| Item | Refused | Verdict |
|---|---|---|
| `C19-li61q1` | 2.15 pm, 2:15 pm (and 2.15pm, 14.15, 14:15) | a second correct answer: **quarantined** (above) |
| `C20-li1212` | driver's license | not what is said ("a driving licence"); "driving licence" and "driving license" are accepted: verified |
| `C20-li6201` | two hundred and sixty | over the limit (one word and/or a number), as IELTS marks it: verified |

Two names are not spelled in their clip and both solvers wrote them the same way, accepted: `C20-li4218` Eastbrook ("I'll call it
Eastbrook") and `C20-li5208` Mercer ("the Mercer Building"). Both are written as they sound; they are verified, and noted here.

### Every chosen item

109 C20 and 18 C19 items are chosen (multiple choice, matching with one shared set of four, plan labelling with plan letters as options).
For each, P15listens2's answers file holds the line of the clip that decides it and why the others are wrong (a distractor said and then
corrected, the other person's opinion, the other corner of the plan); checker 1 chose the same letter on every one, each with its own
quoted line. On the plans the student
stands at the bottom row facing the top, and "on your left as you come in" is the bottom-left letter in every clip. In the matching
dialogues the person was told by voice (`turns.py`), and the dialogue confirms it each time: ieli03-r4 the woman opens "So, Owen" and the
man takes the photographs; ieli03-r5 the tutor asks "And the talk from the warden?" and Jack (the male student) says "quite dull"; ieli03-r6
"Zara, you write the discussion, and Luke, you check her numbers" makes the statistics Zara's worry; ieli06-r3 the man says "Imogen found a
cafe", so he is Kai, and the woman is the one who will talk to the cafe manager.

### Every clip

| Clip | File | Questions (`C20-` / `C19-`) | Typed / chosen | After this pass |
|---|---|---|---|---|
| ieli01-r1 | C20-1.json | li1101 li1102 li1103 li1104 li1201 li1202 li1203 li1204 | 7 / 1 | 8 verified |
| ieli01-r2 | C20-1.json | li1105 li1106 li1107 li1205 li1206 li1207 | 5 / 1 | 6 verified |
| ieli01-r3 | C20-1.json | li1108 li1109 li1110 li1111 li1208 li1209 li1210 | 6 / 1 | 6 verified, **C20-li1110 quarantined** |
| ieli01-r4 | C20-1.json | li1112 li1113 li1114 li1211 li1212 li1213 | 5 / 1 | 6 verified |
| ieli01-r5 | C20-1.json | li1115 li1116 li1117 li1214 li1215 li1216 li1217 | 6 / 1 | 7 verified |
| ieli01-r6 | C20-1.json | li1118 li1119 li1120 li1218 li1219 li1220 | 5 / 1 | 6 verified |
| ieli01-p1 | C19-24.json | li11q1 li11q2 li11q3 | 3 / 0 | 3 verified |
| ieli01-p2 | C19-24.json | li12q1 li12q2 li12q3 | 2 / 1 | 3 verified |
| ieli02-r1 | C20-2.json | li2101 li2102 li2103 li2104 li2201 li2202 li2203 | 0 / 7 | 7 verified |
| ieli02-r2 | C20-2.json | li2105 li2106 li2107 li2108 li2204 li2205 li2206 | 0 / 7 | 7 verified |
| ieli02-r3 | C20-2.json | li2109 li2110 li2111 li2207 li2208 li2209 li2210 | 0 / 7 | 7 verified |
| ieli02-r4 | C20-2.json | li2112 li2113 li2114 li2211 li2212 li2213 | 0 / 6 | 6 verified |
| ieli02-r5 | C20-2.json | li2115 li2116 li2117 li2214 li2215 li2216 | 0 / 6 | 6 verified |
| ieli02-r6 | C20-2.json | li2118 li2119 li2120 li2217 li2218 li2219 li2220 | 0 / 7 | 7 verified |
| ieli02-p1 | C19-24.json | li21q1 li21q2 li21q3 | 0 / 3 | 3 verified |
| ieli02-p2 | C19-24.json | li22q1 li22q2 li22q3 | 0 / 3 | 3 verified |
| ieli03-r1 | C20-3.json | li3101 li3102 li3103 li3104 li3201 li3202 li3203 | 1 / 6 | 7 verified |
| ieli03-r2 | C20-3.json | li3105 li3106 li3107 li3108 li3204 li3205 li3206 | 1 / 6 | 7 verified |
| ieli03-r3 | C20-3.json | li3109 li3110 li3111 li3112 li3207 li3208 li3209 | 1 / 6 | 7 verified |
| ieli03-r4 | C20-3.json | li3113 li3114 li3115 li3210 li3211 li3212 | 1 / 5 | 6 verified |
| ieli03-r5 | C20-3.json | li3116 li3117 li3118 li3213 li3214 li3215 li3216 | 3 / 4 | 7 verified |
| ieli03-r6 | C20-3.json | li3119 li3120 li3217 li3218 li3219 li3220 | 1 / 5 | 6 verified |
| ieli03-p1 | C19-24.json | li31q1 li31q2 li31q3 | 0 / 3 | 3 verified |
| ieli03-p2 | C19-24.json | li32q1 li32q2 li32q3 | 0 / 3 | 3 verified |
| ieli04-r1 | C20-4.json | li4101 li4102 li4103 li4104 li4201 li4202 li4203 li4204 | 8 / 0 | 8 verified |
| ieli04-r2 | C20-4.json | li4105 li4106 li4107 li4108 li4205 li4206 li4207 | 7 / 0 | 7 verified |
| ieli04-r3 | C20-4.json | li4109 li4110 li4111 li4208 li4209 li4210 | 6 / 0 | 6 verified |
| ieli04-r4 | C20-4.json | li4112 li4113 li4114 li4211 li4212 li4213 | 6 / 0 | 6 verified |
| ieli04-r5 | C20-4.json | li4115 li4116 li4117 li4214 li4215 li4216 | 6 / 0 | 6 verified |
| ieli04-r6 | C20-4.json | li4118 li4119 li4120 li4217 li4218 li4219 li4220 | 7 / 0 | 7 verified |
| ieli04-p1 | C19-24.json | li41q1 li41q2 li41q3 | 3 / 0 | 3 verified |
| ieli04-p2 | C19-24.json | li42q1 li42q2 li42q3 | 2 / 1 | 3 verified |
| ieli05-r1 | C20-5.json | li5101 li5102 li5103 li5104 li5201 li5202 li5203 | 3 / 4 | 7 verified |
| ieli05-r2 | C20-5.json | li5105 li5106 li5107 li5204 li5205 li5206 | 3 / 3 | 6 verified |
| ieli05-r3 | C20-5.json | li5108 li5109 li5110 li5207 li5208 li5209 li5210 | 4 / 3 | 7 verified |
| ieli05-r4 | C20-5.json | li5111 li5112 li5113 li5211 li5212 li5213 | 3 / 3 | 6 verified |
| ieli05-r5 | C20-5.json | li5114 li5115 li5116 li5214 li5215 li5216 li5217 | 4 / 3 | 7 verified |
| ieli05-r6 | C20-5.json | li5117 li5118 li5119 li5120 li5218 li5219 li5220 | 3 / 4 | 7 verified |
| ieli05-p1 | C19-24.json | li51q1 li51q2 li51q3 | 0 / 3 | 3 verified |
| ieli05-p2 | C19-24.json | li52q1 li52q2 li52q3 | 3 / 0 | 3 verified |
| ieli06-r1 | C20-6.json | li6101 li6102 li6103 li6104 li6201 li6202 li6203 | 6 / 1 | 7 verified |
| ieli06-r2 | C20-6.json | li6105 li6106 li6107 li6204 li6205 li6206 | 3 / 3 | 6 verified |
| ieli06-r3 | C20-6.json | li6108 li6109 li6110 li6207 li6208 li6209 li6210 | 2 / 5 | 7 verified |
| ieli06-r4 | C20-6.json | li6111 li6112 li6113 li6211 li6212 li6213 li6214 | 7 / 0 | 7 verified |
| ieli06-r5 | C20-6.json | li6114 li6115 li6116 li6117 li6215 li6216 li6217 | 5 / 2 | 7 verified |
| ieli06-r6 | C20-6.json | li6118 li6119 li6120 li6218 li6219 li6220 | 6 / 0 | 6 verified |
| ieli06-p1 | C19-24.json | li61q1 li61q2 li61q3 | 2 / 1 | 2 verified, **C19-li61q1 quarantined** |
| ieli06-p2 | C19-24.json | li62q1 li62q2 li62q3 | 3 / 0 | 3 verified |

One clip defect touches no question: in ieli05-p2 the spelling of Ashbury is heard as "S-H-B-U-R-Y" in every decode (the first A swallowed);
no item asks for it, so nothing is held, but a re-render of ieli01-r3 is a good moment for it too.

### Lessons

`unservedOf` of the code lane (with its clip check; `JG_LISTENING_DIR` set to this branch's `public/media/listening`, every clip valid),
`listen-check-2/lessons.ts`:

| Lesson | Unserved now |
|---|---|
| C19-IELI01-1 | `C20-li1110` (quarantined) |
| C19-IELI06-1 | `C19-li61q1` (quarantined) |
| the other ten (IELI01-2, IELI02-1, IELI02-2, IELI03-1, IELI03-2, IELI04-1, IELI04-2, IELI05-1, IELI05-2, IELI06-2) | none |

The 12 lesson records themselves are still `draft` with `key_check_2: null`, as written: a lesson record's own check is not part of this
pass (the IELTS Reading lessons hold one, e.g. `C19-IERE03-1` `blind:B3s3+B3s4`), and the loader shows only a lesson of a served status. No
lesson record, piece, reserve or clip is touched.

### What the write changed

`reconcile.ts --write` re-serialises each file it touches with the file's own indent; the seven files were already in that form.
`listen-check-2/diffcheck.cjs` compares every item of the 7 changed files with `HEAD`: **0 problems**; 276 items changed, each a draft
with no key check before, the 274 verified differing only in `status`, `key_check_2` and the new `key_check_2_version`, the 2 quarantined
only in `status` and the new `quarantine_reason` (`key_check_2` stays null); no other text line (a last field gains its comma), no
top-level field, LF, no BOM. Each key, accept list, word limit, option, stem, clip, `why`, level, version and author is as the author wrote it.

### Checks after the write

- `validate.ts <root> --no-families --all` (the code lane's): exit 0, **0 errors, 897 warnings, 294 notes**, the same findings as before
  the pass, with this file in place too (`listen-check-2/logs/validate-before.log`, `validate-after.log`, `validate-after-md.log`); "served
  with an error: 0".
  C20 is 239 `verified_auto` + 1 quarantine of 240; C19 479 + 1 of 480. The 37 warnings on these items are `dup.near` between the matching
  questions of one set (one shared option set by design).
- `scan.ts <root> --out …`: exit 0, **2 findings, 0 errors, 0 on served items**, the same two as before (`cue.length` on the quarantined
  `C7-rs5q02`, `rs5q05`, not P15's) (`scan-before/`, `scan-after/`).
- Tests, DB-free (`.superpowers/p13/fixb-scan/vitest.nodb.config.ts`, `ANTHROPIC_API_KEY` empty, `AI_FAKE=1`), on this branch's own code:
  `p15-listen.test.ts` 6 of 7 pass; **1 fails as expected**: "the C20 files … (as written: drafts)" pins `status: "draft"` and
  `key_check_2: null`, which this pass changes. `committed-content.test.ts` **fails on this branch alone**: "no served item has a validator
  error" lists the 274 now-served listening items with `schema.unknown_field`, `format.none` and `status.unverified`, because this branch's
  schema has no `audio` / `accept` / `word_limit` (the code lane adds them). With the code lane's validator the same content has 0 errors and
  0 served with an error (above).

### For the integrator (not changed here)

- **Merge `p15-listening` (the code) with or before this commit.** On `p15-content` alone, the 274 served listening items fail
  `committed-content.test.ts` (unknown fields); with the code lane they are clean.
- `p15-listen.test.ts` pins the draft state (its describe says "as written: drafts"): it needs to read both states, as `p14-content.test.ts`
  does (a draft with no key check 2, or `verified_auto` with the version's record and `keyCheckOf` kind "blind").
- The two quarantines need their author: re-render ieli01-r3 with the whole spelling of Kendal (and ieli05-p2's Ashbury), and a version 2
  of `C19-li61q1` with the time forms added; each then a new blind check. Until then `C19-IELI01-1` and `C19-IELI06-1` are held.
- The 12 lesson records are `draft`; they are served only when their own record is checked.
