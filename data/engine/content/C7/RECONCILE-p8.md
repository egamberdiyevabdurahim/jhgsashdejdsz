# C7: key check 2 of version 2 of C7-ir4219 and C7-ir4220 (P8 blind checkers 3 and 4, 14 Oct 2026)

`C7-ir4219` and `C7-ir4220` are flow-chart completion items on `C7-P-rd14` "From milk to cheese" (B2), in `C19-IERE04-2`'s reserve.
Version 1 (P7 a7) was quarantined `no_passage_needed` by P7s4 (`C7/RECONCILE-p7.md`). Version 2 was written on 13 Oct by the P7
follow-up content lane (`agent:p7f-content`, merged as `d9e22035`) and solved by that same session's two copies (P7Fs1, P7Fs2), which
`keycheck.ts` reads as one agent and the author's own: no blind check. Both items were `status: draft`, `key_check_2: null`, version 2,
with version 1's `quarantine_reason` kept as history. They were held since phase 2 for a second session that never came; this pass is it.

| Item | Version 2 stem (short) | Key | Paragraph |
|---|---|---|---|
| C7-ir4219 | The whey is drained. ↓ Salt is mixed into the curd to stop the ______ from building up any further. ↓ The curd is pressed overnight. | acid | E: "the salt stops the acid from developing any further" |
| C7-ir4220 | The curd is pressed overnight. ↓ Ripening: … one ripened by mould is often ready within ______. | weeks | F: "cheeses ripened by mould are ready far sooner, often within weeks" |

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P8s3 (checker 3) | `.blind/C7-P8s3.json` (`blind.ts --pending`: 27 items) | `.blind/C7-P8s3.answers.json` (the two items) |
| P8s4 (checker 4, who ran the reconcile and wrote this file) | `.blind/C7-P8s4.json` (`node scripts/content/blind.mjs C7 P8s4`: 239 items, each reading item with its passage) | `.blind/C7-P8s4.answers.json` (the two items, each with a note) |

Neither solver is the author's session; `agentOf` reads P8s3, P8s4 and `p7f-content` as three agents.

**The stem-alone test first.** Because version 1 fell on it, P8s4 answered both items from the stem and the four options alone, and
wrote that down (`.superpowers/p8/k4/C7-nopassage.md`) before it read the passage:

- ir4219: "stop the ___ from building up any further" fits acid, bacteria, mould and lactose. General knowledge of cheese-making leans
  to acid, but bacteria is as natural a reading (salt as a preservative), so two options stay defensible: a guess of about one in two.
- ir4220: "ready within ___" fits weeks, days, months and a year. General knowledge leans to weeks for soft mould-ripened cheeses, but
  months is defensible (blue cheeses), so again two options stay: a guess of about three in five.

Both stem-alone guesses happened to be the key. P8s4 did **not** flag `no_passage_needed`: unlike version 1, where the stem's own
words ruled out every option but the key (a cloth that lines a mould; something longer than months), here nothing in a stem rules out
a rival, and only the passage's sentence settles it. The record carries both notes, so a later reader can weigh it.

**With the passage**, each key is stated outright (E and F above); each distractor is a word of the passage used elsewhere (bacteria
and lactose in B, mould in F; days, months and a year are spans the passage gives other things or none).

## The decision

`npx tsx scripts/content/reconcile.ts C7 P8s3 P8s4 --write` gave **239 items: verified 2, quarantine 0, pending 0, blocked 0, skipped
237** (already `verified_auto`, or open items with nothing to key). Both solvers chose the key on both items; no flag, no stale answer.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **2** | `C7-ir4219`, `C7-ir4220`: `key_check_2: "blind:P8s3+P8s4"`, `key_check_2_version: 2`, version 2 |

Version 1's `quarantine_reason` stays on each record as its history (`applyDecision`); the validator notes it (`status.history`), as
it does for `C7-ir2214` version 2.

**What this serves.** `C19-IERE04-2` (already `verified_auto`) was held by `unservedOf` while 2 of its 20 reserve items were draft. With
both verified, the loader serves it: `lessonBank({ reload: true })` has it in `lessons`, and nothing is held
(`.superpowers/p8/k4/held.ts`).

## How the file was written

`reconcile.ts --write` re-serialises the whole of `C7-9.json`, which turned the author's `"prior_b": 1.0` and `0.0` into `1` and `0` on
other items. `.superpowers/p8/k4/repatch.mjs` rebuilt the file from HEAD with a text edit of the two records only (`key_check_2`,
`status`, and `key_check_2_version` after the record's last line) and checked that it parses deep-equal to the reconcile output. The
diff is 8 lines added and 6 removed; `.superpowers/p8/k4/fielddiff.mjs` shows only those three fields changed, on the two items.

## Checks after the write

- `validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the baseline); on these two ids only the two `status.history`
  notes above. `reconcile.ts C7 P8s3 P8s4 --audit`: 0 of 239 decisions differ from the files.
- The uz and ru lines of `C7-9.json`: `C19/RECONCILE-p8.md` part 2's lint (0 findings).
- Vitest: `lesson-c19-14` passes.

## Not done here

- A native read of the uz and ru lines and the teacher look (`reviewed`).
