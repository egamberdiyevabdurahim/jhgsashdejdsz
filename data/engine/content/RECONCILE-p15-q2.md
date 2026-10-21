# P15 q2: key check 2 of the seven re-versioned items, and the P15 lesson records (19 Oct 2026)

The seven items are the ids in `.superpowers/p15/ids-q2.json` of the integration worktree `jg-p5int` (ids only): four SAT Reading
and Writing items (`C21-rw1a10`, `rw1a15`, `rw2e08`, `rw2e10`), two IELTS Listening questions (`C20-li1110`, `C19-li61q1`) and one
AP Physics 1 family (`C1-ph3202`). Content at `p15-content` `1494adab`. Two blind checkers keyed them; this file is checker 2's record
(P15q2s2, who ran the reconcile and the lesson-record check). Checker 2 then checked the 36 lesson records of `C19/C19-24.json`
(IELTS Listening), `C19-25.json` and `C19-26.json` (AP Physics 1), all `draft`, `key_check_2: null`, version 1.

**Items: verified 1 (`C21-rw1a10` v3); confirmed, record unchanged 4 (`rw1a15`, `rw2e08`, `rw2e10` v2, the family `C1-ph3202` v2);
quarantined 0; left draft 2 (`C20-li1110` v2, `C19-li61q1` v2: not two blind checks, below). Lessons: 34 of 36 set `verified_auto`;
2 stay `draft` (`C19-IELI01-1`, `C19-IELI06-1`).**

## Where it started

| Item | Status, version | key_check_2 (version) |
|---|---|---|
| `C21-rw1a10` | draft, v3 | null |
| `C21-rw1a15`, `C21-rw2e08`, `C21-rw2e10` | verified_auto, v2 | `blind:P15rws1+P15rws2` (2) |
| `C20-li1110` | draft, v2 (clip `ieli01-r3.mp3` re-rendered 19 Oct 02:34) | null |
| `C19-li61q1` | draft, v2 (clip `ieli06-p1.mp3` unchanged since 18 Oct 19:14) | null |
| `C1-ph3202` (family) | verified_auto, v2 | `solver:relation@50` (2) |

## Who checked, and how blind

| Solver | Copy | Answers (written) |
|---|---|---|
| P15q2s1 (checker 1) | `.superpowers/p15/blind-q2/<stream>-P15q2s1.json` | `C21-P15q2s1.answers.json` 03:08:00, `C20-` 03:08:15, `C19-` 03:08:33, `C1-P15q2s1.family-answers.json` 03:09:03 |
| P15q2s2 (checker 2) | `blind-q2/C21-P15q2s2.json` (`scripts/content/blind.ts C21 P15q2s2`, all 147 items, so the three served ones are in it too); listening: `blind.ts C19\|C20 P15q2s2 --pending` from `jg-p5int` (its engine reads `audio`, `accept`, `word_limit`) into `blind-q2-s2work/stage/`, `audio_script` dropped before it was read (`blind-q2-s2work/C19-`, `C20-P15q2s2.noscript.json`); the family: `blind-q2-s2work/family-render.ts` (instances by `instantiate`, options shuffled, the letter map in a file opened only by its `score` mode) | `blind-q2/C21-P15q2s2.answers.json` 03:01:27; `blind-q2-s2work/fam/answers.json` 02:58:04; `blind-q2-s2work/listening-answers.P15q2s2.not-blind.json` 03:14:51 (SHA-256 in `blind-q2-s2work/answers-sha256.txt`, 03:15:12) |

- P15q2s1, P15q2s2 and the authors (`agent:p15-sat-rw`, `agent:p15-listen`, `agent:p15-ap1`, `agent:p15-q2`) are separate agents
  (`agentOf`: no `SESSIONS` pattern matches them).
- P15q2s2 opened no `.map-*` file, no author ledger or note (`.superpowers/p15/author-*.md`, `q2/`, `listening-audio-check.md`), no answers
  file of checker 1, and no item record field that holds a key, before its answers were written; it read checker 1's answers at 03:15:12.
  Its `git log --oneline` showed the subject line of `1494adab` (which names the three items' new versions, no key).
- **Disclosure (P15q2s2, listening).** Before it solved, P15q2s2 read the opening part of `RECONCILE-p15-listen.md` (the earlier listening
  key check), which names version 1's key and accept list of both listening items. Version 2 has the same keys. Its answers to those two
  items are therefore **not a blind check**, and they are not counted (they are kept, as data, in the `not-blind` file above).
- **Disclosure (P15q2s1, its own note on `C20-li1110`).** "before transcribing I saw the C20-1.json file note, which names the clip's
  spelling". So neither solver is blind on `C20-li1110`; checker 1 reports no such exposure on `C19-li61q1`.

## The decision

`npx tsx scripts/content/reconcile.ts C21 P15q2s1 P15q2s2 --blind .superpowers/p15/blind-q2 --write` (`jg-p5content`): 147 items,
verified 1 (`C21-rw1a10`, `blind:P15q2s1+P15q2s2`, `key_check_2_version: 3`), the 146 others already verified by two checks and left
alone. `--audit` first re-decided every item from this pass's answers: the three served items `rw1a15`, `rw2e08`, `rw2e10` verified again
(both solvers chose the key, no flag), so their records stand. No answer was stale; no flag was raised.

| Item | P15q2s2's reading (its own copy's letters) | Answerable without its text? | P15q2s1 | P15q2s2 |
|---|---|---|---|---|
| `C21-rw1a10` v3 | the reed blots every careless angle, so beginners learn the right angle by feel, which a neater nib would hide; patience, the old masters and gratitude for better pens are not the text's reasons | no: all four "because" clauses are reasons about learning; only the text decides (version 2's fault, a lone "lesson" option, is gone) | key | key |
| `C21-rw1a15` v2 | dried groups sprouted almost equally, cold or not, both far above the undried: drying does more than cold | no: the cold-does-more and drying-does-more options are mirror claims | key | key |
| `C21-rw2e08` v2 | his father keeps those leaves for the last week, when the worms eat the most | no | key | key |
| `C21-rw2e10` v2 | more of his calls argued after half time than before | no: the more-after and fewer-after findings are mirror findings | key | key |

**The family `C1-ph3202` v2** (spring launch, v = x·√(k/m)) is keyed by its 50-instance solver check (`solver:relation@50`), which this
pass leaves as it is. Its rendered instances were solved blind: P15q2s2 6 of 6 (`fam/`, scored by its own map), P15q2s1 16 of 16 (its
seeds re-rendered by `family-score-s1.ts`: each chose the family's key, and the k, x, m it reports are the rendered ones). Each instance
has one correct option; the uz and ru stems carry the en stem's numbers in every instance (`numbersIn`). One wording note, not a key
fault: the ru stem says the spring pushes the block «на пол без трения» (onto the floor), where «по полу без трения» (along the floor)
would match en and uz.

**The two listening items stay `draft`, `key_check_2: null`** (no write: `reconcile.ts C20|C19 P15q2s1` alone gives "1 blind solver
answered it (2 needed)"). Their content checks out:

| Item | What the audio says (P15q2s2: faster-whisper large-v3 and large-v3-turbo, `D:/tools/whisper/venv-gpu`, nothing installed) | The accept list against the correct forms (`typed-forms.ts`, graded by `typedRight`) | Both solvers |
|---|---|---|---|
| `C20-li1110` v2 ("Journey: from Leeds to ______", ONE WORD) | "From Leeds up to Kendal" (40.0 s); asked to spell it, "Sure, that's K-E-N-D-A-L" (46.3-49.5 s): six letters, the L at 49.2 s, by both models on the whole clip and on 46.0-50.6 s alone (`rehear.py`, with and without a spelling prompt). Version 1's lost L is back. | `Kendal` in any case accepted; `Kendall`, `Leeds`, `Kendal station` refused | Kendal (the key) |
| `C19-li61q1` v2 ("be back on the bus by ______", THREE WORDS AND/OR A NUMBER) | "Please be back on the bus by a quarter past two." (18.5-21.3 s), both models; "20 minutes" (13.8 s) is the trap | 2.15, 2:15, quarter past two, quarter past 2, two fifteen, 2.15 pm, 2:15 pm, 2.15pm, 2:15pm, 2.15 p.m., 2:15 p.m., 2:15 PM, 14.15, 14:15 all accepted (version 1's refused pm and 24-hour forms are in); "a quarter past two" (four words), 2:00, 1:15, 20 minutes refused | 2:15 (the key) |

Counted, both items would verify: `reconcile.ts … --blind blind-q2-s2work/cf` (checker 1's files and P15q2s2's not-blind answers, a dry run,
`C20-counterfactual.json`, `C19-counterfactual.json`) gives `verified` for each. That is not done: a solver who has seen the key is no blind
check (spec §5.5 step 4). What each needs: `C19-li61q1` one fresh blind solver (P15q2s1's answers stay in `blind-q2/`, so
`reconcile.ts C19 P15q2s1 <fresh>` completes it); `C20-li1110` two fresh blind solvers, or the controller's ruling on the audio evidence above.

## The lesson records

`.superpowers/p15/blind-q2-s2work/lessons-kc2.ts` (from `jg-p5int`, reading the `p15-content` content), the P8b/P10 check:

- its pieces are `idea`, `example`, `trap`, checking q1, q2 and q3; each is `verified_auto` by two independent checks (`keyCheckOf`)
  recorded for its current version (`key_check_2_version`), with `page` naming the lesson; every clip a piece or question names is in
  `C20/clips.json` with its file in `public/media/listening/`;
- the example's "Now you" part ends on the blank (its last line ends "?", in en, uz and ru) and does not state q2's key. By hand
  (`example-match.ts`, 39 of 108 lesson-languages not verbatim): each "Now you" restates q2 with q2's own numbers, gap and word limit, and
  its blank is what q2's key fills; where it is not word for word it is a shortening (AP: the question sentence becomes "a = ?"; listening:
  the gap line without its table header or place name, e.g. `C19-IELI05-2` "With the change, the journey takes ______ minutes." for q2's
  "With the change at Ashbury, …", Ashbury being the worked half's own answer);
- a listening lesson's 20 reserve items are each served (two checks for their version, a valid clip), in exactly one lesson's reserve, with
  no `page`; an AP lesson (a template lesson, no reserve) names in `test.families` and `homework.families` only served families and items;
- the pieces' facts, read by hand in en (every number recomputed: the 72 AP pieces' kinematics, forces, energy, momentum, rotation,
  oscillation and fluids; the 36 listening pieces' test facts, word counts and plan directions), and their numbers in uz and ru against en
  (by script; the 8 differences found are the script's decimal-comma parsing and two numbers written as words, read by hand): none wrong.

**34 lessons pass** and are now `verified_auto`, by a text edit of their two lines (`status`, `key_check_2`) that refuses unless the check
passed and verifies by parsing that nothing else in the file changed. A lesson's `key_check_2` is its pieces' blind check, as before:

| Lessons | key_check_2 |
|---|---|
| `C19-IELI01-2`, `IELI02-1`, `IELI02-2`, `IELI03-1`, `IELI03-2`, `IELI04-1`, `IELI04-2`, `IELI05-1`, `IELI05-2`, `IELI06-2` (10) | `blind:P15listens1+P15listens2` |
| `C19-APPH01-1` … `C19-APPH08-3` (24) | `blind:P15aps1+P15aps2` |

**2 stay `draft`:** `C19-IELI01-1` (its reserve holds `C20-li1110`, draft, and `C20-li1115`, quarantined) and `C19-IELI06-1` (its q1
`C19-li61q1` is draft). The integrated loader (`lessonBank`, `jg-p5int`) now serves the 34 and holds these 2 (`loader-check.ts`).

Notes for the authors, none a fault in a record:
- `C19-APPH01-1`: the worked example's answer (3 m/s²) is also the "Now you" answer ((18 − 6) ÷ 4 = 3), so the number can be copied.
- `C19-IELI05-2`: the "Now you" asks "Fifteen or fifty?", which names the key among two; the idea piece's "five-oh" cue is the same hint.
- `C19-IELI03-2` and `C19-IELI06-1`: the example's worked half states q1's answer (the centre is closed that day; 2.15). The lesson asks
  q1 after the idea piece, before the example, so it is told only once answered.

## What the write changed

Four files, against `HEAD` (field by field): `C21/C21-1.json` one item, `C21-rw1a10` (`status`, `key_check_2`, the new
`key_check_2_version`; its `quarantine_reason` stays as history, as `applyDecision` keeps it); `C19/C19-24.json` 10 lessons,
`C19-25.json` 12, `C19-26.json` 12, each only `status` and `key_check_2`. No key, option, stem, accept list, clip, version, item of C19,
`note` or other field changed; LF, no BOM. The reconcile's decisions: `.superpowers/p15/blind-q2/C21-reconcile.json`; the lesson check:
`blind-q2-s2work/lessons-kc2-before.json` and `lessons-kc2-write.json`.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`, `jg-p5content`, on a `git archive HEAD` copy and on the result: **698 errors,
  897 warnings, 300 notes both times, the same lines**; every error is on a `C19-li*` or `C20-li*` record (`schema.unknown_field`,
  `format.none`, `status.unverified`: this branch's validator does not know the listening fields), none on a record this pass touched.
- The same from `jg-p5int` (the integrated validator) on the `p15-content` content: **0 errors, 897 warnings, 300 notes**, before and after.
- `npx tsx scripts/content/scan.ts --out …`: 2 findings, 0 errors, 0 on served items (`cue.length` on the quarantined `C7-rs5q02`,
  `C7-rs5q05`), before and after.

## Not done here

- `C20-li1110` and `C19-li61q1` need fresh blind solvers (above); then `C19-IELI06-1` can be checked, and `C19-IELI01-1` once
  `C20-li1115` is rewritten and keyed.
- The ru wording of `C1-ph3202`'s stem is left to the author (a new version; a key check is not an edit).
