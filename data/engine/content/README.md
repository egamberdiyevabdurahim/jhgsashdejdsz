# Content: assessment banks, practice pools and catalogs (P5)

This folder holds three kinds of content (P5 spec §5.2, §5.3):

- **Assessment banks `K*`** (P5b): the item banks for the checks. They are used for assessment only, never for practice.
- **Practice pools** `C1`, `C1x`, `C3`, `C5`, `C6`, `C7` and `C18`: items a student practises on. They share nothing with the K banks.
- **Catalogs** `C2`, `C8` to `C14` and `C16`: explainers, playbooks, olympiads, test-prep units, admin templates, essay tasks, parent tasks,
  reflection prompts and pathway options. They are not quiz items, and none of them has a key.
- **`C15`** (P5e, D26): the diagnostic chunk metadata, made by code (`src/engine/phase-d.ts`); `C15/README.md` is written by
  `tools/p5e-c15.ts` (the rule and the personas' chunks). No items. C13 batch 2 is read by Phase D's parent tasks (`src/server/phase-d/parent.ts`).
- **`C19`** (12 Oct 2026, SPEC-lessons §11.1): lesson bodies for the Lessons part, each with its piece questions as keyed items (the
  section "C19: lesson bodies" below). Phase 1a holds the 12 SAT Math lessons; their 36 piece questions passed both blind key checks
  (`verified_auto`, `blind:A2s1+A2s2`, 12 Oct 2026). Phase 1b (13 Oct 2026) adds 12 SAT Reading and Writing and 5 IELTS Reading lessons,
  fixed-text lessons whose test and homework ask 20 reserved items each, written in `C6-7..9` and `C7-7..8` (16 lessons served; see below).

All of it is server-only data. The key of every item is `options[0]` (or `answer_numeric`), so nothing in this folder may be copied
under `public/` or sent to a page. The server shuffles the options when it serves an item (A4, D23).

**Who reads these files (since the P5 wave-1 integration on `p5-int`, 7 Oct):** P5b's server-only loader `src/server/content/bank.ts`
(no live check or task uses it yet: P5c plugs the CAT in), its validator `scripts/content/validate.ts` and key check 2
(`scripts/content/blind.ts`, which replaces `blind.mjs`, and `reconcile.ts`). The scheduler (P5h) is separate work.

**Taken back to draft at the integration (234 items, the `status` value only; keys, texts and `key_check_2` unchanged):** after the
merge, P5b's validator found 217 items holding `verified_auto` with an error, which `tests/unit/content/committed-content.test.ts`
refuses: the 91 `blind:recheck` items (K1 19, K2 21, K5 51: one solver; the controller's 7 Oct ruling: a second independent solver
before they are served) and 126 C5 items whose passages P5b's loader cannot read (`C5/passages.json` does not fit the passage format,
see "Known issues"; the loader would have served those questions without their passage). The other 17 `verified_auto` C5 items (level
`advanced`, which the format does not have) went back with them, so all of C5 waits for the same fix. Each keeps its `key_check_2`
(`blind:recheck` or `blind:2/2`): a second solver (`reconcile.ts`) or the passage fix can return it to `verified_auto`.

State on 2026-10-07 after the integration (history): 3,308 records and 94 passages in 198 JSON files, 2,169 `verified_auto` and
1,139 `draft`; the loader served checks K1 341, K2 43, K5 69, K4 0 and practice C3 240, C6 120, C18 798, C1/C5/C7 0.

**State on 2026-10-07 after the review of the P5 content-integrity pass (below): 3,651 records and 94 passages in 214 JSON files.
2,924 are `verified_auto`, 690 `draft`, 34 `quarantine` and 3 `retired`. None is `reviewed` or `operational`. The validator finds 0 errors.**

| | Records | `verified_auto` | `draft` | `quarantine` | `retired` | Passages | JSON files |
|---|---:|---:|---:|---:|---:|---:|---:|
| Assessment banks (K1, K2, K4, K4x, K5) | 1,569 | 992 | 574 | 0 | 3 | 46 | 85 |
| Practice pools (C1, C1x, C3, C5, C6, C7, C18) | 1,745 | 1,595 | 116 | 34 | 0 | 48 | 100 |
| Catalogs (C2, C8-C14, C16) | 337 | 337 | 0 | 0 | 0 | 0 | 29 |
| **Total** | **3,651** | **2,924** | **690** | **34** | **3** | **94** | **214** |

What the loader serves now (`pool` + `serve`, every item served once, math in en, uz and ru): checks **K1 360, K2 64, K4 90, K5 117**;
practice **C1 98, C3 240, C5 143, C6 120, C7 0, C18 798** (C1x and K4x are instance banks, never served; catalogs are not items). Before
the review it was K4 337, C5 199, C7 19, C18 800: those counted one session's two passes as two solvers (below). **K4's 90 by rung:**
arith 16, prealg 16, alg1 26, alg2 31, precalc 1, and geom, calc and beyond 0: the solver-keyed families sit in the lower rungs, so a check
drawn from this bank today could not place a student above alg2 until the one-check items get their second solver.

## The P5 content-integrity pass (7 Oct, on `p5-int`; the controller's 7 Oct rulings)

**Who solved.** Every blind solve in this pass is by one session (the integration's content-integrity builder): the headless Claude
CLI that would have run separate solver agents was not available. Its solvers are named apart: `solverD` (worked by hand), `solverE` (a
second pass by another method: for math, each stem formalised as code and evaluated; for reading, the passage's evidence words named and
checked by script) and `solverNP` (no passage; it answers only when 80 % sure). `solverD` is independent of P5b's solvers A, B and C;
`solverD` and `solverE` are two passes of one session, not two agents, which is weaker than the spec's two separate runs.

**Since the review of this pass (7 Oct, D26 "The review of this pass"): one session is one solver.** `keycheck.ts` counts solvers as
agents (`agentOf`: `solverD`, `solverE`, `solverNP` and every `agent:p5int-*` author are the session `p5int`), and a solver of the key
author's own session does not count. So every item below that rested on `solverD` + `solverE` alone holds ONE check: `reconcile.ts
--records` took it back to `draft` with `key_check_2: "blind:solverD"` (K4 139 fixed items, 313 K4x edge instances, C5 56, C7 19, C18 2),
and the 108 families keyed by those edge instances back to `draft` with no key check 2. One separate solver agent on a `blind.ts
<stream> <solver> --pending` copy makes them two checks: `reconcile.ts <stream> <solver> --write` counts the `blind:solverD` on record
(recorded for that version) as the other agent. Where this section says "served" below, read it as it stood before the review.

- **Key check 2 by a second solver** (`blind.ts --pending` copies only what still needs a check): K1 19, K2 21, K5 51 (`blind:recheck`):
  P5b's `solverC` + `solverD` agree on all 91 (`blind:solverC+solverD`); the no-passage solver found 3 K5 keys (quarantined, then
  rewritten as version 3 drafts for separate solvers). C5's 67 rewrites and C7's 42 reading items: `solverD` and `solverE` agree with
  every key; `solverNP` found 11 C5 and 23 C7 keys without the passage (quarantined: most C7 sets ask facts a reader of the Wikipedia
  topic knows). C18's 2 rewrites and K4's 139 fixed items: D and E agree with every key. C5's 143 version-1 items (`blind:2/2`, set
  back to draft at the integration only for their passages) are served again by `reconcile.ts` now that their passages load.
- **K4 and C1 families (the ruling "blind-instances:3").** 90 K4 families are keyed by the independent solver (`solver:…@50`, 17 of
  them new) and 108 word-problem families by three blind-verified instances drawn from the parameter-range edges (`blind-instances:3`;
  `src/engine/content/edges.ts`, `scripts/content/edges.ts`; 324 edge instances in `K4x-low-13..17` and `K4x-high-11..18`, each solved
  twice). C1's 98 families are all solver-keyed. The 52 families P5b quarantined are version 2 (`scripts/content/fix-k4-families.mjs`):
  constraints that keep the key and distractors apart, the Python `x if c else y` and `pow(a, N, 5)` formulas rewritten, K4-pch025's
  key kept whole. The 17 new families (`K4-sal001-006`, `K4-sam001-004`, `K4-sap001-007`) close the SAT cells the P5b report found
  short. `K4x-clh03a` (an instance of K4-clh003 version 1) is retired. **Since the review:** an edge instance counts only when it meets
  its family's constraints (`instance.constraints`); K4x-pch19x and K4x-clh02x (version 1's a = b = 2, against version 2's `a != b`) are
  retired and K4x-pch19w, K4x-clh02w (`K4x-high-19.json`) are new, unsolved drafts; K4-pch039, K4-clh003 and K4-bch039 version 2 are
  `author: agent:p5int-rewrite` (this session rewrote them), so their 9 edge instances hold no check and need two other agents.
- **Catalogs (the ruling "catalogs after their fact-check").** `src/engine/content/catalog.ts` validates C2 and C8-C16 as catalogs;
  `scripts/content/catalogs.ts` set all 337 records `verified_auto` (every fact has `{url, verified_at}` or is flagged; C2 by its sympy
  check). The 84 `needs_verification` records stay flagged and are "verify" tasks (spec §4.6): `verify_task` is their text, or `true` on
  the 11 that had none (C8-sumapp, 9 in C12, C13-passpt).
- **Passages.** `C5/passages.json` (its `levels` note, `read_s_estimate`, level `advanced`) and the C7 passages (a `verified_at` on each
  fact) now fit the format, by deliberate, tested extensions of `schema.ts`.
- **Tag agreement** (`scripts/content/tags.ts`, spec §2.9 V1 ≥ 80 %): a stratified sample of 196 served items (K1 70, K2 16, K4 80, K5
  30), shuffled under opaque refs: 91 % exact, 98 % within one step (K1 86 %, K4 91 %, K2 and K5 100 %; K4's SAT domain 94 %, difficulty
  75 %). The 17 disagreements are within one step and the author's tags are defensible; none changed. **Not independent for K2, K4 and K5:**
  the tagger had seen those items' levels (the blind copies' headers) and K4 ids (`K4-pch…`) while solving. K1 is the clean measure.
- **Translation check** (`scripts/content/backtranslate.ts`, spec §5.5 step 5): the cross-language invariants over 2,446 math, reading and
  C18 items found 7 issues (K4-clh025's uz "nolga" for 0, and 4 C18 whys opening «Toʻgʻrisi», fixed; K4-ge0024 and K4-ge0036 kept: their
  uz/ru say "up to 90°" and "2 marta" for "complement" and "doubled"). Back-translation of K4's 337 stems (uz: 2 flagged, ru: 6) and K5's
  uz/ru whys (39 + 38: 1 flagged): every flagged text read, all faithful. The back-translator had read many English sources while solving.
- **Engine fixes found on the way.** An option template's `{ANS}` rendered as "{__ANS}" (`family.ts`); an instance item's options are
  now checked against its family's render (`family-check.ts`). A retired instance is not checked against its family.

**Still open:** a separate solver agent on every item holding one check (`blind:solverD`: K4 139, K4x 313, C5 56, C7 19, C18 2) and two
on the items holding none (K4x's 9 self-solved edge instances and 2 new ones, K5's 3 version-3 drafts); C7's 39 writing and speaking
prompts (no key to check; fact-checked) stay `draft` (a ruling is needed: an open prompt's check); the 34 quarantined C5/C7 items need
rewrites; the 17 SAT families' relations were written by this session (solver-keyed, so not changed by the review); C18's Russian-group
block and the Inha/TTPU forms; C4 (NGSL).

The practice-pool and catalog files count includes their sidecar files: `C1/error_rules.json`, `C10/sequences.json`,
`C14/option_sets.json`, `C18/mocks.json` and `C18/fact-check.json`.

## Assessment banks

The sections below describe the banks as the streams wrote them; where a status changed since, the heading says so and "The P5
content-integrity pass" above says why.

| Bank | Folder(s) | What it is | Items | Status |
|---|---|---|---:|---|
| **K1** | `K1-low/`, `K1-mid/`, `K1-high/` | English discrete items, 4 options, one key | 360 | 360 `verified_auto` |
| **K2** | `K2/` (+ `passages.json`) | English reading testlets: 16 passages × 4 items | 64 | 64 `verified_auto` |
| **K4** | `K4-low/`, `K4-high/` | Math: 181 families (templates with parameter ranges) and 139 fixed items | 320 | 320 `draft` |
| **K4x** | `K4x-low/`, `K4x-high/` | Two worked instances (`…a`, `…b`) of each K4 family, with `family_ref` and `params`. They exist for the blind check of the families. | 362 | 362 `verified_auto` |
| **K5** | `K5/` (+ `passages.json`) | Native-language reading: 30 passages × 4 items, 10 passages each in uz, ru and en | 120 | 120 `verified_auto` |
| | | **Total** | **1,226** | 906 `verified_auto`, 320 `draft` |

K3 (yes/no vocabulary) and K6 (Uzbek state-test blocks) are not in v1 (spec §5.2).

Each JSON file is `{ "bank", "batch", "items": [...] }`. The file's `bank` applies to every item in it. K4x items also carry `"bank": "K4x"`
themselves. Passages are `{ "bank", "passages": [...] }`.

## Counts by level or rung, and status

### K1: English discrete items (360, all `verified_auto`)

| Level | Folder | Grammar | Vocabulary | Reading in a sentence | Items |
|---|---|---:|---:|---:|---:|
| pre-A1 | K1-low | 12 | 12 | 6 | 30 |
| A1 | K1-low | 24 | 24 | 12 | 60 |
| A2 | K1-low | 24 | 24 | 12 | 60 |
| B1 | K1-mid | 24 | 24 | 12 | 60 |
| B2 | K1-mid | 24 | 24 | 12 | 60 |
| C1 | K1-high | 24 | 24 | 12 | 60 |
| C2 | K1-high | 12 | 12 | 6 | 30 |

Key check 2: 341 at `blind:2/2`. The other 19 (9 K1-low, 3 K1-mid, 7 K1-high) were rewritten as version 2 and then passed
`blind:recheck`.

### K2: English reading testlets (64, all `verified_auto`)

| Level | Passages | Items | Literal | Inferential |
|---|---:|---:|---:|---:|
| A2 | 4 | 16 | 8 | 8 |
| B1 | 4 | 16 | 8 | 8 |
| B2 | 4 | 16 | 8 | 8 |
| C1 | 4 | 16 | 8 | 8 |

Passages are 126-316 words. Key check 2: 43 at `blind:2/2`, 21 rewritten as version 2 and passed `blind:recheck`.

### K4: math (written as 320; 337 `verified_auto` after the content-integrity pass, 90 since its review) and K4x (688 instance items)

| Rung | Stream | K4 families | K4 fixed items | K4 total | K4x instances |
|---|---|---:|---:|---:|---:|
| arith | low | 22 | 18 (15 numeric, 3 multiple choice) | 40 | 44 |
| prealg | low | 22 | 18 (11 numeric, 7 multiple choice) | 40 | 44 |
| alg1 | low | 22 | 18 (6 numeric, 12 multiple choice) | 40 | 44 |
| geom | low | 22 | 18 (12 numeric, 6 multiple choice) | 40 | 44 |
| alg2 | high | 30 | 10 | 40 | 60 |
| precalc | high | 23 | 17 | 40 | 46 |
| calc | high | 24 | 16 | 40 | 48 |
| beyond | high | 16 | 24 | 40 | 32 |
| **Total** | | **181** | **139** | **320** | **362** |

- The 67 fixed K4-high items have options. 16 of them also carry `answer_numeric` and say "Type the answer as a number".
- Every family has at least 10 valid instances (`family.variants`; the smallest is 10). Families give their options through
  `distractors`, `option_templates` or `option_set`, key first. Numeric families key through the `answer` formula.
- Stems, whys and instructions are in en, uz and ru for every math item.
- SAT tags on K4 items (families and fixed items, counted once each): algebra 14 easy / 17 medium / 4 hard; advanced math 15 / 15 / 6;
  problem solving and data analysis 10 / 5 / 0; geometry and trigonometry 17 / 27 / 7. **Below the §5.2 target:** algebra hard (4 of 10),
  advanced math hard (6 of 10), PSDA medium (5 of 6) and PSDA hard (0 of 6).

**Why K4 is still `draft`:** K4x shows that each family's wording and formula are right at two parameter sets (both solvers 2/2, and every
key recomputed by hand). It does not cover the parameter range. Spec §5.5 step 4 requires an independent solver implementation over 50
random instances per template. That solver has not been written. The 139 fixed items have not been blind-checked at all. See
`K4-low/RECONCILE.md` and `K4-high/RECONCILE.md`.

### K5: native-language reading (120: 117 `verified_auto`, 3 version-3 `draft` since the content-integrity pass)

| Language | Easy | Medium | Hard | Items | Passages (fiction + informational) |
|---|---:|---:|---:|---:|---|
| uz | 12 | 16 | 12 | 40 | 10 (7 + 3) |
| ru | 12 | 16 | 12 | 40 | 10 (7 + 3) |
| en | 12 | 16 | 12 | 40 | 10 (7 + 3) |

Each passage has 2 literal and 2 inferential items. Key check 2: 69 at `blind:2/2`. 51 were rewritten as version 2 because the
`no_passage_needed` check caught them, mostly on the informational passages. They then passed `blind:recheck`.

## Practice pools (keyed items)

These items have a key and go through the same key checks as the K banks (spec §5.5 step 4). Each folder's `RECONCILE.md` (or
`README.md`) has the detail.

| Pool | What it is | Items | `verified_auto` | `draft` | How the key was checked |
|---|---|---:|---:|---:|---|
| **C1** | Math practice families (templates) | 98 | 0 | 98 | Independent solver: every family's `family.relation` agrees with its answer formula on 50 seeded instances (`solver:relation@50`, `C1/README.md`). `key_check_2` is still `null`. |
| **C1x** | Two worked instances (`…a`, `…b`) of each C1 family | 196 | 196 | 0 | Blind 2/2 (`C1x/RECONCILE.md`) |
| **C3** | English grammar, a starter tier and pre-A1 to C1 | 400 | 400 | 0 | Blind 2/2 (`C3/RECONCILE.md`): 240 on 7 Oct, 108 of the 112 beginner items on 10 Oct, the 4 reworded ones (version 2) by two fresh solvers later that day, and the 48 starter-tier items by two more solvers after that. |
| **C5** | Reading testlets in en, uz and ru (+ `passages.json`, 42 passages) | 210 | 143 | 67 | Blind 2/2. The 67 drafts are v2 rewrites (`C5/RECONCILE.md`). |
| **C6** | SAT Reading and Writing | 120 | 120 | 0 | Blind 2/2 (`C6/RECONCILE.md`) |
| **C7** | IELTS: reading sets (+ `passages.json`, 6 passages), writing prompts, speaking cue cards | 81 | 0 | 81 | Not blind-checked yet. Web fact check of its sources (`C7/FACTCHECK.md`). |
| **C18** | Uzbek state test (DTM): practice and mock pools (+ `mocks.json`, `fact-check.json`) | 800 | 798 | 2 | Blind 2/2. The 2 drafts are v2 rewrites (`C18/RECONCILE.md`). |
| | **Total** | **1,905** | **1,657** | **248** | |

### C1 and C1x: math practice (98 families and 196 instances, all `verified_auto` since the content-integrity pass)

| Rung | arith | prealg | alg1 | geom | alg2 | precalc | calc | beyond | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C1 families | 8 | 12 | 16 | 16 | 15 | 10 | 10 | 11 | 98 |
| C1x instances | 16 | 24 | 32 | 32 | 30 | 20 | 20 | 22 | 196 |

- **Since 9 Oct** (owner 9 Oct, the review of the P5 minors; `C1/README.md` "Since 9 Oct"): six families are version 2
  (`C1-a2p004`, `pap003`, `pap004`, `gep009`, `a2p009`: whole distractors for a count or a position; `C1-sat016`: no option below 0),
  keyed again by the solver and `verified_auto`; ten C1x instances that show the new distractors are version 2 and `draft` until blind
  solvers of two agents solve them (C1x is never served). So C1x holds 186 `verified_auto` and 10 `draft`, and the totals above are
  10 fewer `verified_auto` and 10 more `draft`.
- 42 families carry a SAT tag, and 24 of them are SAT-format templates (`C1-sat001` … `C1-sat024`). 94 families are numeric entry and 4
  are multiple choice. `error_rules.json` gives the coded student error behind each distractor: 19 rules in en, uz and ru, listed for all
  98 families.
- **Why C1 is `draft`:** the solver check meets the spec's math bar (§5.5 step 4), but `key_check_2` and `status` were left for the
  integrator (`C1/README.md`). The blind check of C1x covers each family at two parameter sets only.
- The spec's v1 size is 190 + 60 SAT-format templates (§5.3). The test-ready minimum of 6 families per rung (§5.1) is met on every rung.

### C3: English grammar (400, all `verified_auto` since the three blind checks of 10 Oct, below)

48 items at each of A1, A2, B1, B2 and C1, 12 subskills per level. All 240 passed 2/2 with no rewrite. The test-ready minimum is 40 per
level (§5.1); the v1 size is 480 plus 240 form B (§5.3).

- **Since 10 Oct (P5 wave 3; the owner's "you do it man" on content): 112 new items** (`C3-16.json` … `C3-22.json`, 16 a file,
  `author: agent:p5x-r4-content`). **All 112 are `verified_auto` and served** (108 by the first blind check of 10 Oct, the 4
  reworded ones by a second that day: the two "Key check 2" bullets here and `C3/RECONCILE.md`). With the 48 of the starter tier
  (below, a third blind check that day) C3 holds 400 items, all `verified_auto`, none `draft`; the loader serves 400 (level
  pre-A1 112: the starter tier's 48 and pre-A1's 64; A1 96; and 48 each at A2, B1, B2 and C1). The totals at the top of this
  file are of 7 Oct: they are 160 `verified_auto` short for C3.
  - **pre-A1, 64 items** (`C3-16` … `C3-19`, level `preA1`, ids `C3-a0…`), 4 in each of 16 subskills: be_present, be_negative,
    be_questions, subject_pronouns, possessive_adjectives, articles_a_an, demonstratives, plural_nouns, have_got, have_got_questions,
    can_cant, present_simple, there_is_are, prepositions_place, question_words, imperatives. C3 had no level under A1.
  - **A1, 48 more** (`C3-20` … `C3-22`, ids `C3-a1…`), 4 in each of 12 subskills, 9 of them new to C3's A1: present_simple,
    present_continuous, past_simple_regular, and past_be, prepositions_time, object_pronouns, some_any, possessives,
    adverbs_of_frequency, like_ing, how_much_many, imperatives_lets.
  - **A starter tier under pre-A1, 48 items, `verified_auto` and served since their blind check ("Key check 2 for the starter
    tier" below; written `draft` on 10 Oct, later; the owner's delegated call "a beginner … must not fail four times in ten").** `C3-23.json` … `C3-25.json`, 16 a file, ids `C3-s0…`, `author: agent:p5y-starter`, 6 in each of 8
    subskills: be_present (am / is / are with I, he, she, it), articles_a_an, demonstratives (this is / that is),
    possessive_adjectives (my / your), plural_nouns (one / many), colours_numbers (new), can_cant, short_answers (new). **How the
    tier is expressed:** the format has no level under `preA1` (`LEVELS`, `src/engine/content/schema.ts`), so the items are level
    `preA1` with `prior_b` −3.5, the field's own "centre of the tagged band ± judgement": 0.8 under pre-A1's centre, where the A0
    student of the gate (ability −2.90) has 0.73 on a four-option item and the A1 student (−2.20) 0.84. **Served, they are a
    rung of their own, `en_grammar:starter`, under `en_grammar:preA1`** (`unitOf`, `src/server/phase-x/learner.ts`: a preA1 item
    under pre-A1's band, centre − 0.45, is the starter unit): measured in the gate with the 48 read as served, left in pre-A1's
    unit the A0 student stands at 0.638 (he is given that unit's −2.7 items too and his due cards are mostly those), as a rung of
    its own at 0.730, inside the band in every week. The number is a prior: practice answers move an item's difficulty
    (`practice_items.b`), not its unit. Key check 1 the author's; key check 2 by two blind solvers of two other sessions, sheets
    by `blind.ts C3 <solver> --pending` ("Key check 2 for the starter tier" below). Validator: 0 errors, no new finding; no pair at or above
    0.45 against any short English item of any bank (one stem that matched a K1 check item's was replaced before the sheets).
  - `prior_b` is the level's centre, as in the rest of C3: −2.7 for pre-A1 (where K1's pre-A1 items stand), −1.8 for A1. `time_s` 10.
  - Why: the scheduler's English practice track (`en_grammar`) draws only from C3, and its easiest items stood at A1's centre, so an
    A0 or A1 student's quizzes stood under the 0.70-0.85 band (the P5h gate names them). Once served, the track's ladder gets a unit
    `en_grammar:preA1` under `en_grammar:A1`.
  - **Key check 2 (10 Oct).** Two blind solvers of two agent sessions, neither the author's (`solverR4a`, `solverR4b`), each on its
    own shuffled copy of all 112: both chose the key on every item and raised no flag (112 of 112 twice). `reconcile.ts` wrote
    **108 as `verified_auto`** with `key_check_2: "blind:solverR4a+solverR4b"` and `key_check_2_version: 1` (pre-A1 62, A1 46).
    **4 were left `draft`, version 2, not served:** a solver called their English awkward, so the stem was reworded (wording only;
    the options, the key and the why are as they were) and the answers to version 1 no longer count for them: `C3-a063c6`
    ("___ is my pen. It is in my hand."), `C3-a0c400` ("Who are ___ boys over there?"), `C3-a1ad7e` ("… on Sundays."),
    `C3-a18d7d` ("… during the lesson."). Each keeps what was found as its `quarantine_reason` (the format's history field; none
    was quarantined). Nothing was quarantined and no key was changed.
  - **Key check 2 for the four reworded items (10 Oct, later).** Two fresh blind solvers of two more agent sessions (`solverR5a`,
    `solverR5b`; neither saw version 1), each on its own shuffled copy of the four (`blind.ts C3 <solver> --pending`): both chose
    the key on all four, raised no flag and found no stem unnatural. `reconcile.ts C3 solverR5a solverR5b --write` wrote the
    **4 as `verified_auto`** with `key_check_2: "blind:solverR5a+solverR5b"` and `key_check_2_version: 2` (pre-A1 2, A1 2). Their
    `quarantine_reason` stays as history (its last sentence, "Needs a fresh blind check", is what this check met).
  - Validator after each: 0 errors; the only new findings are 4 notes `status.history` on the four version-2 items.
  - **What it does to the scheduler's gate** (`tests/unit/engine-server/phase-x-gate.test.ts`, `phase-x-sim.test.ts`): the A1
    student's English quizzes moved from 0.551 to 0.717 right (inside the band) and he is off the gate's named list; the A0
    student's from 0.437 to 0.588, still under the band and still named: pre-A1 is the scale's lowest level and every item stands
    at its centre (−2.7), so what he needs is a tier of items at about −3.3 or lower. New, and named in `phase-x-sim.test.ts`
    (`EASY_FILL`): a B1 student whose own level's 48 items are used up is now given the unseen beginner items as "new" ones, and
    some of his later weeks stand above the band (0.877-0.919).
  - **Since all 352 are served** (after the composer's too-easy-fill rule of 10 Oct, `src/engine/learner/quiz.ts`, which ended
    `EASY_FILL`): the gate's English rows stand where they stood. The A1 student is at 0.717 (64 items in the band for him, 62
    before), the A0 student at 0.588 and still the one named by content, the student with no English check (P4) at 0.754. Four
    more items move the runs' random streams, so two named lists were read again: in `phase-x-sim.test.ts` run 22 no longer stands
    under the band (weeks 2 to 8 at 0.786-0.822) and `HELD_HIGH` is empty; in `phase-x-gate.test.ts` one math week of P4, who
    practises English and math from one stream, stands at 0.8506 against 0.85 and is named (`HELD_LOW`). No math item changed.
  - **Key check 2 for the starter tier (10 Oct, later).** Two blind solvers of two more agent sessions (`solverY1`, `solverY2`;
    neither the author's), each on its own shuffled sheet of the 48 (`blind.ts C3 <solver> --pending`): both chose the key on
    all 48 and neither flagged an item (no `two_defensible`, no `unanswerable`). `reconcile.ts C3 solverY1 solverY2 --write`
    wrote the **48 as `verified_auto`** with `key_check_2: "blind:solverY1+solverY2"` and `key_check_2_version: 1`; nothing was
    quarantined, left `draft` or reworded, and no key changed. The solvers' remarks were read and left (`C3/RECONCILE.md`,
    "the starter tier (blind check 4)"): five `colours_numbers` items test spelling or a word more than grammar (red / read,
    two / too / to, black / block, three / tree / free, twelve / twelf) under the skill `en_grammar`; "A: ___ you ride a bike?
    B: Yes, I can." is keyed by the reply ("Do" stands in the question alone); "I have a dog. ___ dog is big." repeats the noun.
    Validator after it: 0 errors, 860 warnings, 357 notes, as before; `backtranslate.ts check --banks C3`: 0 issues over 400.
  - **What the starter tier does to the scheduler's gate** (the same two test files; the gate's report before and after the
    write): the A0 student's English quizzes moved from 0.588 right (under the band in 7 of 7 weeks) to **0.730, inside the band
    in 7 of 7** (476 answers after the warm-up, 0.708 of them right; 462 on the starter rung), and **the gate's list of tracks
    named by content is empty**. The A1 student: 0.717 to 0.768, on a laptop 0.748. The pins read again, each to what the run
    printed: the named list (`['P3 en_grammar']` to `[]`), the easiest English item (−2.7 to −3.5), `HELD_LOW` (`['P4 math']`
    to `[]`: the 48 items move the one random stream P4 practises both tracks from, and no math week of his stands over the
    band now: 0.757-0.765), and in `phase-x-sim.test.ts` the English ladder (`starter` first) and the A0 student's start unit
    (`en_grammar:starter`). **Not ended by the tier:** how often a beginner meets the same item. In 8 simulated weeks the A0
    student answers 516 times on 62 different items (708 on 64 before), one item up to 18 times: the rung has 48 items and he
    does not leave it. And the gate's student with no English check (P4) is not the same simulated student as before: the
    test sets him 1.3 over the ladder's first rung (0.9, and his own step of 0.4), so his ability moved with the ladder
    (−1.40 to −2.20); he stands at 0.820, where he stood at 0.754.

### C4: English lesson units (18 units and their 54 questions, all `verified_auto` and served since 11 Oct 2026)

Not in the table above (its totals are the practice pools' as they stood); `C4/units.json` is a sidecar the validator names once
(`file.shape`), read by `src/engine/schedule/english.ts`.

- **What it is.** 18 units, six each at A1, A2 and B1 (`units.json`): a title in en, uz and ru; five words, each with what it means
  in en, uz and ru and one English example; a text of 60 to 90 words that uses all five. Each unit ends in three questions
  (`C4-1.json` A1, `C4-2.json` A2, `C4-3.json` B1; ids `…qm`, `…qt`, `…qu`): what one of the words means, one about the text, one
  that uses a word in a new sentence. Four options, the key first, a one-line why in en, uz and ru. Our own wording throughout
  (`source: own`, `author: agent:p5t-english`); no word list or corpus text is embedded.
- **The questions belong to their unit** (`page`: the unit's id), so no practice task and no learner-model quiz draws them; a
  lesson's three questions are its own unit's three.
- **Key check 2 (11 Oct 2026).** Two blind solvers, run by the controller apart from the author's session (the reconcile step
  was handed their two answer files), answered all 54 without the key (the sheet held the unit's five words and
  text, the question and its four options in a shuffled order; no key, no why, no translation). Both chose the key on 54 of 54
  and neither flagged a question, so none was reworded and none is quarantined:
  `scripts/content/reconcile.ts C4 solverZ5a solverZ5b --write` (54 verified, 0 quarantined, 0 pending, `key_check_2:
  "blind:solverZ5a+solverZ5b"`), then `scripts/content/english-units.ts --write` (18 of 18 units, `key_check_2: "questions:3/3"`:
  a unit is served only when it and all three of its questions hold a served status earned by a second key check).
- **Who gets them** (behind `PHASE_X`): a student whose plan holds an English workstream, from her level upward (the level a check
  measured, else the one she gave, else A1), turn about with her maths lessons, never two lessons on one day. A student at B2 or
  above has no unit at her level and gets none. A unit's text question is never asked again in a review (the text is on the
  lesson's sheet only); its two word questions are.
- **Tests:** `tests/unit/content/english-units.test.ts`, `tests/unit/engine-server/p5s-english-join.test.ts`,
  `tests/unit/engine-server/p5t-english-days.test.ts`; on the page `tests/smoke/english-lesson-walk.ts`.

### C19: lesson bodies (12 SAT Math lessons and their 36 piece questions, all `verified_auto`, 12 Oct 2026)

Register: **C19** is the lesson-body bank of the Lessons part (SPEC-lessons rev. 2, 12 Oct 2026, §11.1; C17 stays free). Not in the
tables above (they are the counts of 7 Oct).

| File | Lessons | Piece questions | Status |
|---|---|---:|---|
| `C19-1.json` | lesson 1 of C10-MAAL01, MAAL02, MAAL03 (Algebra) and MAAM01, MAAM02, MAAM03 (Advanced Math) | 18 | `verified_auto` |
| `C19-2.json` | lesson 1 of C10-MAPS01, MAPS02, MAPS03 (Problem-Solving and Data) and MAGT01, MAGT02, MAGT03 (Geometry and Trigonometry) | 18 | `verified_auto` |
| `C19-3.json` | lesson 1 of C10-RWCS01, RWCS02, RWCS03 (Craft and Structure) and RWII01 (Information and Ideas), fixed-text, reserve 20 each (40 since content round 1, C6-16) (agent:p6b-a1) | 12 | `verified_auto` |
| `C19-4.json` | lesson 1 of C10-RWSE01, RWSE02, RWSE03 (Standard English Conventions) and RWII03 (Inferences), fixed-text, reserve 20 each (40 since content round 1, C6-16/C6-17) (agent:p6b-a2) | 12 | `verified_auto` |
| `C19-5.json` | lesson 1 of C10-RWEI01, RWEI02, RWEI03 (Expression of Ideas) and RWII02 (Command of Evidence), fixed-text, reserve 20 each (40 since content round 1, C6-16/C6-17) (agent:p6b-a3) | 12 | `verified_auto` |
| `C19-6.json` | C10-IERE01 lesson 1, IERE02 lessons 1 and 2 (IELTS Reading), fixed-text, reserve 20 each (40 since content round 3, C7-12) (agent:p6b-a4) | 9 | 7 `verified_auto`, 2 `quarantine` (`ie22q1`, `ie22q2`); lesson `C19-IERE02-2` `draft` |
| `C19-7.json` | C10-IERE03 and IERE04 lesson 1 (IELTS Reading), fixed-text, reserve 20 each (40 since content round 3, C7-12/C7-13) (agent:p6b-a5) | 6 | `verified_auto` |

- **The file shape.** `{ bank: "C19", batch, kind: "lessons", note, lessons: [...], items: [...] }`. `lessons` holds one record per
  lesson in the §11.1 shape (`id` `C19-<C10 unit code>-<seq>`, `course` `sat_m`, `unit`, `seq`, `skill` `sat_m:<code>`, `requires` as
  its C10 unit's, `title`, `minutes`, `format` `text`, three `pieces` (`idea`, `example`, `trap`: a `body` in en, uz and ru, `figure`
  and `video` null, `check` = the id of its question), `test` `{pool: "C1", families, n: 3, first_is_example, test_out}`, `homework`
  `{pool: "C1", families}`, `reserve` null, `extra_link`, `source`, `author`, `key_check_1`, `key_check_2`, `status`, `version`).
  `items` are ordinary items in the P5 format (the key is `options[0]`; the server shuffles), so the validator and the loader read them
  as they read every bank; they ignore `lessons`. An item's `page` is its lesson's id, which keeps it out of every practice task and the
  learner model (`page` now accepts `C19-<code>-<seq>` as well as a C2 or C4 id: `src/engine/content/schema.ts`). Item ids are
  `C19-<unit><seq>q<n>` (6 characters, `ITEM_ID_RE`), e.g. `C19-al11q1`, because §11.1's `C19-MAAL01-1-q1` does not fit the item id
  format.
- **What a lesson asks.** Its test and homework draw only C1 template families it names itself (§3.3: C10's practice filters name
  subskills C1 does not have), each on its unit's topic and taught by its three pieces; the first is the family of the page's own
  worked example (`first_is_example`). A unit where C1 holds fewer than three taught families names two (MAAL03, MAAM02, MAPS03); the
  test then asks one family twice with new numbers. Three lesson titles are narrower than their C10 unit's name, to say what lesson 1
  teaches (§3.3's "Phase-1 lesson" column): MAAL03 "Systems of linear equations", MAAM02 "Nonlinear equations", MAPS02 "Mean, median and
  spread", MAPS03 "Probability".
- **The check so far (12 Oct 2026, the author's session, `author: agent:p6-a1`).** Our own wording throughout (`source: own`): no
  College Board, Khan, OpenStax or IELTS item or text was used or adapted. Every worked line and every key was checked by sympy 1.14.0
  (974 checks: each line stands word for word in the en, uz and ru body and holds; each key is `options[0]`, the four options are four
  values, the blank step of each worked example is its question's key). `scripts/content/validate.ts`: 0 errors and no finding on C19.
  `key_check_1: "author"`. Lane A2's two blind solvers, outside the author's session, agreed with the key on all 36 questions (0
  quarantined; `C19/RECONCILE.md`): `key_check_2: "blind:A2s1+A2s2"`, status `verified_auto` on the 36 items and on the 12 lesson
  records. `reviewed` waits for a teacher's look, and the uz and ru lines need a native read before real families (owner, 12 Oct).
- **Tests:** `tests/unit/engine/lesson-asks-its-page.test.ts` and `tests/unit/engine/lesson-teaches.test.ts` (the C19 blocks: the record
  shape, every family a served C1 template on its unit's topic and reviewed against the page, the piece questions the lesson's own and
  out of practice, U+02BB/U+02BC, the 25 KB payload, the first test question reading like the worked example in en, uz and ru).
- **Phase 1b, the fixed-text lessons (13 Oct 2026; the content plan `.superpowers/p6b/PLAN.md` of `p6b-content`).** `course` `sat_rw` or
  `ielts_r`; `test` and `homework` `{pool: null, families: []}`; `reserve` exactly 20 item ids on the lesson's own subskills, no item in two
  reserves, no piece question in one. SAT R&W reserves are C6 items: the 120 of `C6-1..6` by id (no file edited) and 120 new ones in
  `C6-7..9`; IELTS Reading reserves are the 100 new items of `C7-7..8`. Blind 2/2 by lane B3 (`blind:B3s1+B3s2` SAT, `blind:B3s3+B3s4`
  IELTS; `C19/RECONCILE-1b.md`, `C7/RECONCILE-1b.md`). The server serves a fixed-text lesson only when it, its three piece questions and
  all 20 reserved items are served (`src/server/content/bank.ts unservedOf`): `C19-IERE02-2` is held (two piece questions and `C7-ir2214`
  quarantined). The batches written as reserves are drawn by no practice pool (`RESERVE_FILES`), and with the lessons part on no practice
  draws C6 at all (SPEC §4.5). The uz and ru lines need the same native read before real families.
  Test: `tests/unit/engine-server/p6b-fixed-text.test.ts` (each reserve 20 distinct served items of its bank and subskills, none in two
  reserves, no piece question and no page among them; served only when verified).

### P7 (phase 2, 13 Oct 2026): the new batches and where each is served

SPEC-lessons rev. 2 §12.5 items 1-3; the authors' plan and ledgers are `.superpowers/p7/` of the content worktree (gitignored). Every record
is our own writing (`source: own`). Key check 2 by two blind solvers outside the authors' sessions (D26), or, for a C1 family, the
validator's 50-instance solver; each pass is written up in the `RECONCILE-p7.md` of its bank. A native read of the new uz and ru lines
(spec §3.9) and the teacher look (`reviewed`) are still to come for all of them.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C19-6.json` | `C19-IERE02-2` "The Not Given trap" and its `ie22q1`, `ie22q2` version 2 (agent:p7-a7) | 1 lesson, 2 items | `verified_auto` (`blind:P7s3+P7s4`) | IELTS Reading |
| `C19-8.json` | IELTS Writing lesson 1 of C10-IEWR01 … IEWR04: three pieces and her own paragraph, no piece question (agent:p7-writing) | 4 lessons | `verified_auto` (its content test) | IELTS Writing, only with `WRITING=1` |
| `C19-9.json` | lessons 2 and 3 of C10-MAAL01-03 and MAAM01-03 (agent:p7-a1) | 12 lessons, 36 items | `verified_auto` (`blind:P7s1+P7s2`) | SAT Math |
| `C19-10.json` | lessons 2 and 3 of C10-MAPS01-03 and MAGT01-03 (agent:p7-a2) | 12 lessons, 36 items | `verified_auto` (`blind:P7s1+P7s2`) | SAT Math |
| `C19-11.json` | lessons 1-3 of C10-APCA01, APCA02 (agent:p7-a3) | 6 lessons, 18 items | `verified_auto` (`blind:P7s3+P7s4`) | AP Calculus AB |
| `C19-12.json` | lessons 1-3 of C10-APCA03, APCA04 (agent:p7-a4) | 6 lessons, 18 items | `verified_auto` (`blind:P7s3+P7s4`; `APCA03-1` at the integration, once `C1-ap3001` was) | AP Calculus AB |
| `C19-13.json` | lesson 1 of C10-DTMC01 … DTMC10, a fourth piece `format` (agent:p7-a6) | 10 lessons, 40 items | `verified_auto` (`blind:P7s1+P7s2`) | DTM: Matematika |
| `C19-14.json` | `C19-IERE03-2` (matching information), `C19-IERE04-2` (flow chart), fixed-text (agent:p7-a7); reserves 40 since content round 3 (C7-13); `IERE04-2`'s quarantined `C7-ir4909` was taken out (39) and is back since P13 as a verified version 2 (40) | 2 lessons, 6 items | `verified_auto`; `IERE04-2` is held (18 of its 20 reserve items verified) | IELTS Reading (`IERE03-2`) |
| `C1-7.json` | families `C1-m2a001` … `m2a012`, `page` = their C19-9 lesson (agent:p7-a1) | 12 | `verified_auto` (`solver:relation@50`) | their lessons only |
| `C1-8.json` | families `C1-m2b001` … `m2b012`, `page` = their C19-10 lesson (agent:p7-a2) | 12 | `verified_auto` (`solver:relation@50`) | their lessons only |
| `C1-9.json` | families `C1-ap1001` … `ap1007` (agent:p7-a3) | 7 | `verified_auto` (`solver:relation@50`) | their lessons only |
| `C1-10.json` | families `C1-ap3001` … `ap3010` (agent:p7-a4) | 10 | `verified_auto` (`solver:relation@50`; `ap3001` at the integration) | their lessons only |
| `C4/units.json` | six B2 units `C4-b2u001` … `b2u006` appended (agent:p7-a5) | 6 units | `verified_auto` (`questions:3/3`) | Ingliz tili, B2 |
| `C4-4.json` | the B2 units' questions `C4-b201qm` … `b206qu` | 18 | `verified_auto` (`blind:P7s3+P7s4`) | each unit's test |
| `C4-5.json` | the B2 units' homework items `C4-b21h01` … `b26h10` (ten a unit, each unit's `homework`) | 60 | `verified_auto` (`blind:P7s3+P7s4`) | each unit's homework only (`RESERVE_FILES`) |
| `C7-9.json` | reserves of `C19-IERE03-2` (`ir3201-3220`) and `IERE04-2` (`ir4201-4220`) on passages `C7-P-rd7` … `rd14` (appended to `passages.json`) | 40 | 38 `verified_auto`, `ir4219` and `ir4220` `quarantine` (`no_passage_needed`) | their lessons only (`RESERVE_FILES`) |
| `C7-7.json` | `C7-ir2214` version 2 | 1 | `verified_auto` (`blind:P7s3+P7s4`) | `C19-IERE02-2` |
| `C10-5.json`, `C10-6.json` | AP Calculus AB units `C10-APCA01` … `APCA04` | 4 | `verified_auto` (fact check, below) | read by `src/server/lessons/course.ts` only |
| `C10-7.json` | DTM units `C10-DTMC01` … `DTMC10` (the compulsory mathematics block) | 10 | `verified_auto`, `needs_verification` (below) | read by `course.ts` only |

- **Fact check of C10-5 … C10-7 (the P7 integration, 13 Oct 2026).** The AP Students course page
  (apstudents.collegeboard.org/courses/ap-calculus-ab) was opened and read as text: its units 1-4 are named as the four records name
  them. The Agency's PDF (uzbmb.uz, Order No. 105, Annex 1) was opened and read with PyMuPDF: the compulsory mathematics block is 10
  questions of 1.1 points (11.0 in all), as the DTM records' first fact says. Their second fact, "each question has 4 options and one
  correct answer", is NOT in that PDF (it gives questions and points only); C18/mocks.json carries `options_per_question: 4` with no
  source of its own. That fact is `needs_verification` (with its `check` note), and so is each DTM record (`verify_task: true`); the
  DTM lessons' study line and format questions that say "4 options" rest on it until an official page is found.
- **Not in any practice pool:** the C1 families above are asked by their own lessons (by id); a C2 unit of the same subskill and rung
  does not draw them (`src/server/phase-d/practice.ts` entriesAt, held by `tests/unit/engine-server/learn-quiz.test.ts` b2). C4-5 and
  C7-9 are in `src/server/content/bank.ts` `RESERVE_FILES`.
- **Tests:** the authors' own blocks are kept as files of their own (`tests/unit/engine/lesson-c19-9.test.ts`, `lesson-p7-a2.test.ts`,
  `lesson-c19-apca12.test.ts`, `lesson-c19-apca34.test.ts`, `lesson-c19-14.test.ts`, `lesson-asks-its-page-dtm.test.ts`, `lesson-teaches-dtm.test.ts`), with
  `tests/unit/content/english-units.test.ts` widened to the B2 units.

### P8 (phase 3a, 14 Oct 2026): the new batches and where each is served

SPEC-lessons rev. 2 §12.5 item 1 and §12.6 item 2; the authors' plan and ledgers are `.superpowers/p8/` of the content worktree
(gitignored). Every record is our own writing (`source: own`), with no real statistics. Key check 2 by two blind solvers outside the
authors' sessions (D26), or, for a C1 family, the validator's 50-instance solver; each pass is written up in the `RECONCILE-p8.md` of its
bank. A native read of the new uz and ru lines (spec §3.9) and the teacher look (`reviewed`) are still to come for all of them.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C19-15.json` | lessons 2 and 3 of C10-RWCS01 (signal words and charge; the precise shade of a word) and RWCS02 (the job of one sentence; texts that turn), fixed-text, reserve 20 each (40 since content round 2, C6-18) (agent:p8-a1) | 4 lessons, 12 items | `verified_auto` (`blind:P8s1+P8s2`) | SAT Reading and Writing |
| `C19-16.json` | lessons 2 and 3 of C10-RWII01 (finding the detail; the point after the turn) and RWII02 (findings that support or weaken; tables and graphs with two variables), fixed-text, reserve 20 each (40 since content round 2, C6-19) (agent:p8-a2) | 4 lessons, 12 items | `verified_auto` (`blind:P8s1+P8s2`) | SAT Reading and Writing |
| `C19-17.json` | lessons 2 and 3 of C10-RWSE01 (extra information in pairs; joining words, colons and dashes) and RWSE02 (verb form and tense; pronouns and possessives), fixed-text, reserve 20 each (40 since content round 2, C6-20; 39 for RWSE01-3 and RWSE02-3, whose quarantined item was taken out, and 40 again since content round 3, whose verified version 2 went back in) (agent:p8-a3) | 4 lessons, 12 items | `verified_auto` (`blind:P8s1+P8s2`) | SAT Reading and Writing |
| `C6-10.json` | reserve items for C19-RWCS01-2 (`cs1201-20`), RWCS01-3 (`cs1301-20`), RWCS02-2 (`cs2201-20`), RWCS02-3 (`cs2301-20`); agent:p8-a1 | 80 | `verified_auto` (`blind:P8s1+P8s2`) | their lessons only (`RESERVE_FILES`) |
| `C6-11.json` | reserve items for C19-RWII01-2 (`ii1201-20`), RWII01-3 (`ii1301-20`), RWII02-2 (`ii2201-20`, textual), RWII02-3 (`ii2301-20`, quantitative); agent:p8-a2 | 80 | `verified_auto` (`blind:P8s1+P8s2`) | their lessons only (`RESERVE_FILES`) |
| `C6-12.json` | reserve items for C19-RWSE01-2 (`se1201-1220`), RWSE01-3 (`se1301-1320`), RWSE02-2 (`se2201-2220`), RWSE02-3 (`se2301-2320`); agent:p8-a3 | 80 | `verified_auto` (`blind:P8s1+P8s2`) | their lessons only (`RESERVE_FILES`) |
| `C19-18.json` | lessons 1-3 of C10-APCA05 … APCA08 (AP Calculus AB units 5-8), template lessons on C1 (agent:p8-a4) | 12 lessons, 36 items | `verified_auto` (`blind:P8s3+P8s4`) | AP Calculus AB |
| `C1-11.json` | families `C1-ap5001` … `ap5023` (`ap5024` unused), `page` = their C19-18 lesson (agent:p8-a4) | 23 | `verified_auto` (`solver:relation@50`) | their lessons only |
| `C10-8.json` | AP Calculus AB units `C10-APCA05` … `APCA08` | 4 | `verified_auto` (fact check, `C10/FACTCHECK.md` "P8") | read by `src/server/lessons/course.ts` only |
| `C4/units.json` | `homework` (ten ids) added to the 18 A1-B1 units `C4-a1u001` … `b1u006` (agent:p8-a5); nothing else changed | 18 units | unchanged (`verified_auto`, `questions:3/3`) | Ingliz tili, A1-B1 |
| `C4-6.json` | the A1-B1 units' homework items `C4-a11h01` … `b16h10` (ten a unit, each unit's `homework`) | 180 | `verified_auto` (`blind:P8s3+P8s4`) | each unit's homework only (`RESERVE_FILES`) |
| `C7-9.json` | `C7-ir4219` and `ir4220` version 2 (P7f content) | 2 | `verified_auto` (`blind:P8s3+P8s4`), so `C19-IERE04-2`'s 20 reserve items are all verified | `C19-IERE04-2` |
| `C7-10.json` | IELTS Speaking Part 2 cue cards `C7-sp2c13` … `sp2c30` (`items`, three for each of six preparation lessons; B1 concrete, B2 abstract) and their preparation `C7-sp2p13` … `sp2p30` (`prep`: a one-minute plan in en/uz/ru, B1 and B2 model-answer outlines, five self-check questions; agent:p8-a6) | 18 + 18 | `verified_auto` since P9 (`read:en+uz+ru`, reviewer "ai_native_read 15 Oct 2026 (owner: you check it)"; `C7/READ-p9.md`) | the IELTS Speaking course (`SPEAKING`) |

- **Phase 3b** (the content plan's §1.1) took C19 batches 19-21 and C6 batches 13-15: the P8b register below.
- **Not in any practice pool:** C6-10 … C6-12 and C4-6 are in `src/server/content/bank.ts` `RESERVE_FILES`; the C1-11 families are asked
  by their own lessons (by id). The cue cards are read only by the IELTS Speaking course (`src/server/lessons/speaking-cards.ts`, served
  statuses only, behind `SPEAKING`); since P9 all thirty cards are served (`C7/READ-p9.md`), so that course shows thirty lessons.
- **Tests:** the authors' own blocks are kept as files of their own (`tests/unit/content/p8-a1-rw-craft-lessons.test.ts`,
  `p8-a2-rw-ideas-lessons.test.ts`, `p8-a5-english-homework.test.ts`, `c7-10-speaking-prep.test.ts`,
  `tests/unit/engine/lesson-c19-apca58.test.ts`).

### P8b (phase 3b, 14 Oct 2026): the new batches and where each is served

SPEC-lessons rev. 2 §12.5 item 1; the authors' plan and ledgers are `.superpowers/p8b/` of the content worktree (gitignored). Every record
is our own writing (`source: own`), with no real statistics. Key check 2 by two blind solvers outside the authors' sessions (D26), `P8bs1`
and `P8bs2`: both chose the key on all 36 piece questions and all 240 reserve items, 0 quarantined (`C19/RECONCILE-p8b.md`,
`C6/RECONCILE-p8b.md`). A native read of the new uz and ru lines (spec §3.9) and the teacher look (`reviewed`) are still to come. With
these every SAT R&W unit has its lessons 1, 2 and 3 (36 lessons).

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C19-19.json` | lessons 2 and 3 of C10-RWEI01 (Transitions: time order, examples and added points; comparison, surprise, replacement and similarity) and RWEI02 (Rhetorical Synthesis: comparison goals; introduce, explain, present, describe), fixed-text, B1 gate, reserve 20 each (40 since content round 2, C6-21; 39 for RWEI01-3, whose quarantined item was taken out, and 40 again since content round 3, whose verified version 2 went back in) (agent:p8b-a1) | 4 lessons, 12 items | `verified_auto` (`blind:P8bs1+P8bs2`) | SAT Reading and Writing |
| `C19-20.json` | lessons 2 and 3 of C10-RWCS03 (the point of contact; agreement and the other direction) and RWII03 (what a comparison shows; chains, conditions and causes ruled out), fixed-text, B2 gate, reserve 20 each (40 since content round 2, C6-18/C6-19) (agent:p8b-a2) | 4 lessons, 12 items | `verified_auto` (`blind:P8bs1+P8bs2`) | SAT Reading and Writing |
| `C19-21.json` | lessons 2 and 3 of C10-RWSE03 (opening phrases, paired words and agreement; long subjects, colons and semicolons in lists) and RWEI03 (Transitions, the precise link; Rhetorical Synthesis, hard goals), fixed-text, B2 gate, reserve 20 each (40 since content round 2, C6-20/C6-21) (agent:p8b-a3) | 4 lessons, 12 items | `verified_auto` (`blind:P8bs1+P8bs2`) | SAT Reading and Writing |
| `C6-13.json` | reserve items for C19-RWEI01-2 (`ei1201-20`), RWEI01-3 (`ei1301-20`), RWEI02-2 (`ei2201-20`), RWEI02-3 (`ei2301-20`); agent:p8b-a1 | 80 | `verified_auto` (`blind:P8bs1+P8bs2`) | their lessons only (`RESERVE_FILES`) |
| `C6-14.json` | reserve items for C19-RWCS03-2 (`cs3201-20`), RWCS03-3 (`cs3301-20`), RWII03-2 (`ii3201-20`), RWII03-3 (`ii3301-20`); agent:p8b-a2 | 80 | `verified_auto` (`blind:P8bs1+P8bs2`) | their lessons only (`RESERVE_FILES`) |
| `C6-15.json` | reserve items for C19-RWSE03-2 (`se3201-20`, form_structure_sense), RWSE03-3 (`se3301-20`, boundaries), RWEI03-2 (`ei3201-20`, transitions), RWEI03-3 (`ei3301-20`, rhetorical_synthesis); agent:p8b-a3 | 80 | `verified_auto` (`blind:P8bs1+P8bs2`) | their lessons only (`RESERVE_FILES`) |

- **Not in any practice pool:** C6-13 … C6-15 are in `src/server/content/bank.ts` `RESERVE_FILES`.
- **Mixes (easy/medium/hard) of each lesson's 20:** RWEI01-2 and RWEI02-2 5/9/6, RWEI01-3 and RWEI02-3 2/8/10 (the B1 units, as P8's);
  each lesson 2 of a B2 unit 2/8/10, each lesson 3 2/6/12. Each lesson's reserve asks only that lesson's subskill.
- **Tests:** the authors' own blocks are files of their own (`tests/unit/content/p8b-a1-rw-ei-lessons.test.ts`,
  `p8b-a2-rw-cross-inference-lessons.test.ts`, `p8b-a3-rw-mixed-lessons.test.ts`); `tests/unit/engine-server/p6b-fixed-text.test.ts`
  pins the 36 lessons, their reserves' subskills and the 980 reserve-file items.
- **Speaking (code, P8b):** `src/server/lessons/speaking-cards.ts` now reads C7-10's `prep` by `card`; a card with a preparation record
  is served only when both are. C7-10 stayed `draft` until P9 (below).

### P9 (15 Oct 2026): the Speaking cue cards served by the read

The owner's ruling on 15 Oct, "you check it": an AI read stands in for the native read (spec §3.9) he asked for before the cue cards go
live. Three independent reads (en: a native editor and an IELTS teacher; uz; ru) of C7-3's twelve cards, C7-10's eighteen cards and
eighteen preparation records, and the Speaking screens' words; every finding applied or answered in `C7/READ-p9.md`. Then:

- **An open prompt's second check is its read.** A cue card has no key, so no blind solver can check it. `key_check_2: "read:en+uz+ru"`
  (src/engine/content/keycheck.ts) is accepted only for an open prompt (formatOf 'open') and only with a `reviewer` naming the reader
  (validate.ts, bank.ts `unearned`); reconcile.ts leaves such an item alone and a pending blind copy leaves it out. The 30 cards and the 18 preparation records carry
  `reviewer: "ai_native_read 15 Oct 2026 (owner: you check it)"` and status `verified_auto`, the status every served item holds.
  `reviewed` (the teacher look, LG1) is still to come for them as for every other item.
- **Writing prompts** (C7's 27 Task 1 and Task 2 drafts) are not read and stay `draft`.

### Content round 1 (15 Oct 2026): SAT R&W lesson-1 reserves of 40, IELTS Reading 10 lessons, IELTS Writing 11

The owner's "content x3-5". Our own texts, everyday or plainly fictional, no real statistics or named people's claims; key at
`options[0]`. Key check 2 by two blind solvers outside the authors' sessions: `P10rws1` and `P10rws2` for C6-16 and C6-17 (240 of 240
verified, 0 quarantined, `C6/RECONCILE-p10.md`), `P10ies1` and `P10ies2` for C19-22, C19-23 and C7-11 (23 piece questions and 60 reserve
items verified, 0 quarantined, the seven Writing prompts read; `C19/RECONCILE-p10.md`). A native read of the new uz and ru lines (spec
§3.9) and the teacher look (`reviewed`) are still to come.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C6-16.json` | 20 more reserve items for lesson 1 of RWCS01 (`cs1601-20`), RWCS02 (`cs2601-20`), RWCS03 (`cs3601-20`), RWII01 (`ii1601-20`), RWII02 (`ii2601-20`: 10 textual, 10 quantitative), RWII03 (`ii3601-20`); agent:p10-rw1 | 120 | `verified_auto` (`blind:P10rws1+P10rws2`) | their lessons only (`RESERVE_FILES`) |
| `C6-17.json` | 20 more reserve items for lesson 1 of RWSE01 (`se1701-1720`), RWSE02 (`se1721-1740`), RWSE03 (`se1741-1760`, all hard), RWEI01 (`ei1701-1720`), RWEI02 (`ei1721-1740`), RWEI03 (`ei1741-1760`, all hard); agent:p10-rw2 | 120 | `verified_auto` (`blind:P10rws1+P10rws2`) | their lessons only (`RESERVE_FILES`) |
| `C19-22.json` | `C19-IERE01-2` (skimming and scanning against the clock), `IERE05-1` (multiple choice and short answers), `IERE05-2` (paraphrase), fixed-text (agent:p10-iere); reserves 40 since content round 3 (C7-12, C7-13) | 3 lessons, 9 items | `verified_auto` (`blind:P10ies1+P10ies2`) | IELTS Reading |
| `C7-11.json` | reserves of `C19-IERE01-2` (`ir1201-1220`: scanning 12, skimming 8), `IERE05-1` (`ir5101-5120`: multiple_choice 11, short_answer 9), `IERE05-2` (`ir5201-5220`: paraphrase 20); texts in the stem | 60 | `verified_auto` (`blind:P10ies1+P10ies2`) | their lessons only (`RESERVE_FILES`) |
| `C19-23.json` | IELTS Writing `C19-IEWR01-2`, `IEWR02-2`, `IEWR03-2`, `IEWR04-2` (B1), `IEWR05-1`, `IEWR05-2`, `IEWR06-1` (B2): three pieces, a recognition question on the idea and the trap, her own paragraph (agent:p10-iewr) | 7 lessons, 14 items | `verified_auto` (`blind:P10ies1+P10ies2`) | IELTS Writing (`WRITING`) |

- **Reserves:** the twelve SAT R&W lesson-1 records in C19-3, C19-4 and C19-5 now name 40 reserve ids each (their first 20 and the 20
  above); every other fixed-text lesson keeps 20. `RESERVE_MIN` (bank.ts) is a minimum, not a cap. C6-16, C6-17 and C7-11 are in
  `src/server/content/bank.ts` `RESERVE_FILES` (1280 reserve-file items), so no practice pool draws them.
- **Tests:** the authors' blocks `tests/unit/content/p10-rw1.test.ts`, `p10-rw2.test.ts`, `p10-iere.test.ts`, `p10-iewr.test.ts`;
  `tests/unit/engine-server/p6b-fixed-text.test.ts` pins the 36 SAT R&W and 10 IELTS Reading lessons, the reserves of 40 and 20 and the
  1280 reserve-file items.

### Content round 2 (15 Oct 2026): SAT R&W lesson-2 and lesson-3 reserves of 40

The owner's "content x3-5", second round: 20 more C6 reserve items for lessons 2 and 3 of each of the twelve SAT R&W units (480 items).
Our own texts, everyday or plainly fictional, no real statistics or named people's claims; key at `options[0]`; no lesson, piece or
passage is new (the C19 files only gained reserve ids). Key check 2 by two blind solvers outside the authors' sessions: `P11as1` and
`P11as2` for C6-18 and C6-19 (240 of 240 verified, 0 quarantined, `C6/RECONCILE-p11-a.md`, 51 uz/ru why fixes), `P11bs1` and `P11bs2`
for C6-20 and C6-21 (237 verified, 3 quarantined for a second defensible option, `C6/RECONCILE-p11-b.md`, 75 uz/ru why fixes). A native
read of the new uz and ru lines (spec §3.9) and the teacher look (`reviewed`) are still to come.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C6-18.json` | 20 more reserve items for lessons 2 and 3 of RWCS01 (`cs1701-20`, `cs1801-20`), RWCS02 (`cs2701-20`, `cs2801-20`), RWCS03 (`cs3701-20`, `cs3801-20`); agent:p11-cs | 120 | `verified_auto` (`blind:P11as1+P11as2`) | their lessons only (`RESERVE_FILES`) |
| `C6-19.json` | 20 more reserve items for lessons 2 and 3 of RWII01 (`ii1701-20`, `ii1801-20`), RWII02 (`ii2701-20` textual, `ii2801-20` quantitative), RWII03 (`ii3701-20`, `ii3801-20`); agent:p11-ii | 120 | `verified_auto` (`blind:P11as1+P11as2`) | their lessons only (`RESERVE_FILES`) |
| `C6-20.json` | 20 more reserve items for lessons 2 and 3 of RWSE01 (`se1901-20`, `se1801-20`), RWSE02 (`se2701-20`, `se2801-20`), RWSE03 (`se3701-20`, `se3801-20`); agent:p11-se | 120 | 118 `verified_auto` (`blind:P11bs1+P11bs2`), 2 `quarantine` (`se1811`, `se2818`); since content round 3 all 120, the two as version 2 (`blind:P12ies1+P12ies2`) | their lessons only (`RESERVE_FILES`) |
| `C6-21.json` | 20 more reserve items for lessons 2 and 3 of RWEI01 (`ei1901-20`, `ei1801-20`), RWEI02 (`ei2701-20`, `ei2801-20`), RWEI03 (`ei3701-20`, `ei3801-20`); agent:p11-ei | 120 | 119 `verified_auto` (`blind:P11bs1+P11bs2`), 1 `quarantine` (`ei1807`); since content round 3 all 120, `ei1807` as version 2 (`blind:P12ies1+P12ies2`) | their lessons only (`RESERVE_FILES`) |

- **Reserves:** the 24 SAT R&W lesson-2 and lesson-3 records in C19-15, C19-16, C19-17, C19-19, C19-20 and C19-21 name their first 20
  and the 20 above, so every SAT R&W lesson draws from 40, except three: the integration took the quarantined `C6-se1811` out of
  `C19-RWSE01-3`, `C6-se2818` out of `C19-RWSE02-3` and `C6-ei1807` out of `C19-RWEI01-3` (a lesson with an unserved reserve item is held,
  `unservedOf`), so those three draw from 39, still above `RESERVE_MIN`, and no live lesson is held. The three items stay in their files as
  `quarantine` until their author's version 2 is keyed again; a verified version 2 goes back into its lesson's reserve. C6-18 … C6-21 are
  in `src/server/content/bank.ts` `RESERVE_FILES` (1760 reserve-file items), so no practice pool draws them (the C6 practice pool stays
  C6-1..6's 120).
- **Tests:** the authors' blocks `tests/unit/content/p11-cs.test.ts`, `p11-ii.test.ts`, `p11-se.test.ts`, `p11-ei.test.ts`; the P8 and
  P8b lane tests check their own first 20 of each reserve; `tests/unit/engine-server/p6b-fixed-text.test.ts` pins the 36 SAT R&W lessons,
  the reserves of 40 (39 for the three above) and the 1760 reserve-file items.

### Content round 3 (15 Oct 2026): IELTS Reading reserves of 40, a new math family for 42 lessons, the native uz/ru read

The owner's "content x3-5", third round. Our own texts, everyday or plainly fictional, no real statistics or named people's claims; key
at `options[0]`; every new record began as `draft`. Key check 2 outside the authors' sessions: `P12ies1` and `P12ies2` (blind) for C7-12,
C7-13 and the three round-2 version 2 items (202 verified, `C7-ir4909` quarantined: answerable without its passage; `C7/RECONCILE-p12.md`,
49 uz/ru fixes), `P12maths1` and `P12maths2` for the 44 C1 families (2,332 of 2,332 instances agree for each; the 50-instance solver
check `solver:relation@50`; `C1/RECONCILE-p12.md`, 29 uz/ru fixes). The native uz/ru read of the lesson bodies (C19-1 … C19-23) and of
rounds 1 and 2's items (C6-16 … C6-21, C7-11): 948 fixes filed, 807 applied (20 in part), 141 refused with reasons (`C19/READ-p12.md`).
Round 3's own new items (C7-12, C7-13, C1-12, C1-13) have had only their checker's uz/ru pass, not a native read; the teacher look
(`reviewed`) is still to come for all of them.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C7-12.json` | 20 more reserve items for `C19-IERE01-1` (`ia1101-20`: skimming 10, scanning 10), `IERE01-2` (`ia1201-20`), `IERE02-1` (`ia2101-20`: TRUE / FALSE / NOT GIVEN), `IERE02-2` (`ia2201-20`), `IERE03-1` (`ia3101-20`: matching headings); texts in the stem; agent:p12-iere-a | 100 | `verified_auto` (`blind:P12ies1+P12ies2`) | their lessons only (`RESERVE_FILES`) |
| `C7-13.json` | 20 more reserve items for `C19-IERE03-2` (`ir3901-20`), `IERE04-1` (`ir4801-20`), `IERE04-2` (`ir4901-20`), `IERE05-1` (`ir5801-20`), `IERE05-2` (`ir5901-20`); agent:p12-iere-b | 100 | 99 `verified_auto` (`blind:P12ies1+P12ies2`), 1 `quarantine` (`ir4909`, `no_passage_needed`); since P13 all 100, `ir4807`, `ir4815` and `ir4909` as version 2 (`blind:P13s1+P13s2`) | their lessons only (`RESERVE_FILES`) |
| `C7/passages.json` | passages `C7-P-rd15` … `rd26` appended (fiction, our own, paragraphs A-E), for IERE03-2 and IERE04-2 | 12 passages | read with their items | their items |
| `C1-12.json` | families `C1-r3a001` … `r3a020`, one new story each for 18 AP Calculus AB lessons, `C19-DTMC05-1` and `DTMC07-1`; `page` = the lesson (agent:p12-math-a) | 20 | `verified_auto` (`solver:relation@50`) | their lessons only |
| `C1-13.json` | families `C1-r3b001` … `r3b024`, one new story each for 17 SAT Math lessons and `C19-DTMC08-1` … `DTMC10-1`, two each for `C19-MAGT01-2` and `MAPS03-2`; `page` = the lesson (agent:p12-math-b) | 24 | `verified_auto` (`solver:relation@50`) | their lessons only |
| `C1/error_rules.json` | the 44 families' named errors (their distractors) | 44 entries | (rules) | the families |
| `C6-20.json`, `C6-21.json` | version 2 of round 2's three quarantines, `C6-se1811`, `se2818` and `ei1807` (agent:p12-fix3) | 3 | `verified_auto` (`blind:P12ies1+P12ies2`, `key_check_2_version` 2) | back in their lessons' reserves |

- **Reserves:** the ten IELTS Reading lessons (C19-6, C19-7, C19-14, C19-22) name their first 20 and the 20 above, so each draws from 40,
  except `C19-IERE04-2`: the integration took the quarantined `C7-ir4909` out of its reserve, so it draws from 39, above `RESERVE_MIN`,
  and no live lesson is held (since P13 its version 2 is verified and back: 40, below). The three round-2 version 2 items are back in `C19-RWSE01-3`, `RWSE02-3` and `RWEI01-3`, so every SAT R&W
  lesson draws from 40 again. C7-12 and C7-13 are in `src/server/content/bank.ts` `RESERVE_FILES` (1960 reserve-file items), so no
  practice pool draws them (the C7 practice pool stays at its 47).
- **Homework and tests:** each new family is appended to its lesson's `homework.families` (C19-1, -2, -9, -10, -11, -12, -13, -18), and
  `course.ts testFamilies` draws it as the lesson test's third family. 42 lessons now hold three served homework families where they held
  two (one for `MAGT01-2` and `MAPS03-2`): SAT Math 93 → 114 served homework families, AP Calculus AB 55 → 73, DTM 27 → 32.
- **Tests:** the authors' blocks `tests/unit/content/p12-iere-a.test.ts`, `p12-iere-b.test.ts`, `p12-math-a.test.ts`,
  `p12-math-b.test.ts`, `p12-fix3.test.ts`; `tests/unit/engine-server/p6b-fixed-text.test.ts` pins the 36 SAT R&W lessons and the 10
  IELTS Reading lessons, the reserves of 40 (39 for `IERE04-2` until P13, 40 since) and the 1960 reserve-file items.

### P13, the content quality round (17 Oct 2026): 79 version 2 items, the defect scanner, the uz/ru text pass

The third solver's audit of 15 Oct (195 of 195 agreed with the key) found what two blind solvers had passed, live: five C6-17 boundaries
items (`se1706`, `se1717`, `se1719`, `se1741`, `se1748`) repeated after the blank the word every option ends with ("wheel; when when"),
and with that word removed `se1717`'s "wheel, and, when" and `se1748`'s "hours, and, by" were second keys; C6-17's rhetorical_synthesis
key was uniquely the longest option in 25 of 30 items; `C7-ir4909` was quarantined (answerable without its passage). So that such defects
cannot be served again, `src/engine/content/scan.ts` (run by `validate.ts` on every item, family instance at 5 seeds, uz passage and C19
lesson) makes an option that doubles a word or a mark in its blank, puts a space before a mark, or ends on the word the stem repeats after
the blank an ERROR, and a served item with an error fails `tests/unit/content/committed-content.test.ts`; a key that is uniquely the
longest or shortest in over 40 % of a reserve or batch is a warning (`key.cue_batch`). On the content before this round it found 16
served items with an error (C6 12, C7 3, C19 1); on this content 0. Every changed item is version 2, began as `draft` and was keyed again
by two blind solvers of separate agents (`P13s1`, `P13s2`; `C6/RECONCILE-p13.md`): 79 of 79 `verified_auto`, `key_check_2_version` 2,
none quarantined. The uz/ru text pass (`C19/READ-p13.md`): round 3's native read (148 fixes, 141 as written), the shared instruction lines
decided once for every item that carries them (455 fields), the C1 read-alikes with every lesson line that quotes them, and 93
apostrophes inside English words in Uzbek strings written U+2019 (not the Uzbek U+02BC), which the validator now holds as an error
(`uz.english-apostrophe`).

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C6-17.json` | the five audit items (the repeated word out of the stem; `se1717`'s and `se1748`'s second keys replaced) and 19 rhetorical_synthesis items (key uniquely the longest 25/30 → 6/30) (agent:p13-fix-a) | 24 | `verified_auto` (`blind:P13s1+P13s2`, version 2) | `C19-RWSE01-1`, `RWSE03-1`, `RWEI02-1`, `RWEI03-1` |
| `C6-10.json` | text_structure_purpose: one distractor lengthened in each (key uniquely the longest 30/40 → 15/40) | 18 | as above | `C19-RWCS02-2`, `RWCS02-3` |
| `C6-12.json`, `C6-20.json`, `C6-4.json` | the boundaries items the scanner found (`se1309`, `se1316`, `se3818`, `sem005`) | 4 | as above | `C19-RWSE01-1`, `RWSE01-3`, `RWSE03-3` |
| `C6-13.json` | rhetorical_synthesis (19/40 → 15/40) | 10 | as above | `C19-RWEI02-2`, `RWEI02-3` |
| `C6-15.json` | `se3302`, `se3308`, `se3316` (scanner errors), `se3304` (the boundaries batch's length cue), four form_structure_sense items (key uniquely the shortest 12/20 → 8/20), five rhetorical_synthesis items | 13 | as above | `C19-RWSE03-2`, `RWSE03-3`, `RWEI03-3` |
| `C6-3.json`, `C6-5.json`, `C6-6.json`, `C6-9.json` | length cues (`iih001`, `eie007`, `eim006`, `eih007`, `ii2n03`) | 5 | as above | their lessons' reserves and the C6 practice pool |
| `C7-13.json`, `C7-8.json` | `ir4807`, `ir4815`, `ir4110` (a distractor that read "the the"); `ir4909` (the flow chart now needs its passage) | 4 | as above | `C19-IERE04-1`, `IERE04-2` |
| `C19-21.json` | `C19-se33q3`, `C19-RWSE03-3`'s trap piece question ("meat; and and Gulnora") (agent:p13-fix-b) | 1 | as above | its piece |

- **Reserves:** `C7-ir4909` is back at its place in `C19-IERE04-2`'s reserve (C19-14), so every IELTS Reading lesson draws from 40 again;
  no other reserve changed, no item is out of one, and no lesson is held.
- **Left as warnings:** nine served `cue.length` warnings outside C6/C7 (six C18 items, `C19-cs22q3`, pinned in
  `p8-a1-rw-craft-lessons.test.ts`, `C19-ii21q1`, `K1-b2r012`) and two `key.cue_batch` in C4-5; no `uz.english_mark` is left.
- **Tests:** `tests/unit/content/scan.test.ts`, `p13-fix-a.test.ts`, `p13-fix-b.test.ts`, `p13-read.test.ts`, `text.test.ts`; the earlier
  rounds' tests read the 79 records' author and version from `tests/unit/content/p13-v2.ts`; `p6b-fixed-text.test.ts` pins every reserve
  at 40.

### P14, the follow-up round (18 Oct 2026): 51 version+1 items, every batch and reserve at or under 30 %

P13 left warnings, not errors: nine served items whose key is given by its length (`cue.length`), two C4-5 batches whose key is uniquely
the longest in half the items (`key.cue_batch`), 22 batches or reserves above 30 % that way, two loose English whys in C7-12 (`ia1210`,
`ia2102`) and seven where "(FALSE)" followed a true fact, and three C1 families whose instances could read "+ 1x", "÷ 1" or "k = 1". The
content lane (agent:p14-content) rewrote 51 items at version+1, each keeping its id, subskill, level, difficulty, prior_b, time_s and key
(still options[0], the same answer); each began as `draft` and was keyed again (`C6/RECONCILE-p14.md`): the 48 fixed items by two blind
solvers of separate agents (`P14s1`, `P14s2`: both chose the key on all 48, no second key, no flag), the three families by the solver
(`solver:relation@50`, 50/50, 0 of 400 instances showing the problem); 51 of 51 `verified_auto`, `key_check_2_version` their new version,
none quarantined. Of 155 batches and reserves of ten or more choice items, none is above 30 % now (22 before).

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C6-10.json` | `cs1203`, `cs1204`, `cs2206`, `cs2304`, `cs2310` (the batches' length cue) | 5 | `verified_auto` (`blind:P14s1+P14s2`, version 2) | `C19-RWCS01-2`, `RWCS02-2`, `RWCS02-3` |
| `C6-13.json` | `ei1307`, `ei2205`, `ei2304`, `ei2310` | 4 | as above | `C19-RWEI01-3`, `RWEI02-2`, `RWEI02-3` |
| `C6-15.json` | `ei3216`, `ei3308`, `se3206`, `se3214`, `se3301`, `se3307` | 6 | as above | `C19-RWEI03-2`, `RWEI03-3`, `RWSE03-2`, `RWSE03-3` |
| `C6-16.json` | `ii2611`, `ii2615`, `ii2619` (`C19-RWII02-1`'s reserve 15/40 → 12/40) | 3 | as above | `C19-RWII02-1` |
| `C6-17.json`, `C6-6.json` | `ei1707`; `eih009`, `eim005` | 3 | as above | `C19-RWEI01-1`, `RWEI02-1`; the C6 practice pool |
| `C7-12.json`, `C7-7.json` | `ia1210`, `ia2102` (the loose whys, uz/ru matched); `ia2101`, `ia2103`, `ia2106`, `ia2108`, `ia2111`, `ia2117`, `ir2101` (each why names the false statements) | 9 | as above | `C19-IERE01-2`, `IERE02-1` |
| `C19-15.json`, `C19-5.json` | `C19-cs22q3`, `C19-ii21q1` (served `cue.length`) | 2 | as above | their pieces in `C19-RWCS02-2`, `RWII02-1` |
| `C18-10.json`, `C18-12.json`, `C18-28.json`, `C18-30.json` | `bip034`, `bip036`, `chp036`, `him022`, `him026`, `bim016` (served `cue.length`, uz and ru together) | 6 | as above | the C18 (DTM) practice pool |
| `C4-5.json` | `b23h05`, `b23h09`, `b24h01`, `b24h08`, `b26h07` (both `key.cue_batch`) | 5 | as above | the homework of `C4-b2u003`, `b2u004`, `b2u006` |
| `K1-mid-6.json`, `K5-1.json`, `K5-4.json`, `K5-6.json` | `K1-b2r012` (served `cue.length`); `K5-uze3q3`, `ruh2q1`, `enm4q4` (version 3), `enh1q1` | 5 | as above | the diagnostic |
| `C1-12.json`, `C1-13.json` | families `r3a003` (b from 2), `r3b015` (r·mm ≠ 30), `r3b019` (no k = 1 pair) | 3 | `verified_auto` (`solver:relation@50`, version 2) | `C19-APCA02-2`, `MAGT03-3`, `MAPS03-1` |

- **Reserves:** no reserve changed and no item left one; every reserve the 51 sit in still draws from 40, and no lesson is held.
- **Left as warnings:** the scanner (`scripts/content/scan.ts`) finds 0 errors and two `cue.length` warnings, both on quarantined items
  (`C7-rs5q02`, `rs5q05`) that are not served; no served item has a scanner finding.
- **Tests:** `tests/unit/content/p14-content.test.ts`; the earlier rounds' tests read the 51 records' author and version from
  `tests/unit/content/p14-v2.ts` (pinned to the corpus by `p14-v2.test.ts`); `p8-a1-rw-craft-lessons.test.ts` now finds nothing on
  C19-15 or C6-10.

### P15, the owner's four "add"s (18 Oct 2026): IELTS Listening, the SAT practice test's form 1, AP Physics 1

The owner's 18 Oct answers asked for IELTS Listening, a full timed SAT practice test and AP beyond Calculus. Every item was written as
`draft` by its own author agent and keyed by two blind solvers of separate agents (the families by the solver, `solver:relation@50`); the
reconciliations are `RECONCILE-p15-listen.md`, `RECONCILE-p15-rw.md`, `RECONCILE-p15-math.md` and `RECONCILE-p15-ap.md` (each with its
19 Oct retry), `RECONCILE-p15-q2.md` (version+1 of key check 2's seven quarantines, and the 36 lesson records' own check) and
`RECONCILE-p15-q3.md` (the blind check of `C20-li1110` v2 and `C19-li61q1` v2, and lesson `C19-IELI06-1`'s record check). Our own
texts, scripts and invented data throughout: no question is copied from the College Board, British Council, IDP, Cambridge or ETS. Each
new course and the test is behind its own switch, off by default (`src/server/lessons/switch.ts` LISTENING, AP_PHYSICS;
`src/server/lessons/sat-switch.ts` SAT_FULL). **35 of the 36 new lesson records are `verified_auto`; `C19-IELI01-1` stays `draft`** (a
reserve item of its is quarantined, below), so the loader holds that one, switch on or off.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C19-24.json` | IELTS Listening: 12 lessons `C19-IELI01-1` … `IELI06-2` (course `ielts_l`, units C10-IELI01..06) and their 36 piece questions `C19-li11q1` … `li62q3` | 12 + 36 | lessons 11 `verified_auto` (10 by `RECONCILE-p15-q2.md`, `C19-IELI06-1` by `RECONCILE-p15-q3.md`), 1 `draft` (`C19-IELI01-1`); questions 36 `verified_auto` (`blind:P15listens1+P15listens2`; `C19-li61q1` v2, whose accept list holds 2.15 pm, 14:15 and the like, `blind:P15q3s1+P15q3s2`) | 11 lessons, LISTENING on |
| `C20-1.json` … `C20-6.json` | IELTS Listening reserves: 20 per lesson, each answered from a clip (choice or a typed gap with its word limit) | 240 | 239 `verified_auto` (as above; `C20-li1110` v2, its clip `ieli01-r3` re-rendered with the whole spelling of Kendal, `blind:P15q3s1+P15q3s2`), 1 `quarantine` (`C20-li1115`: in clip `ieli01-r5` "Varga is" can be heard as "Vargas") | each its own lesson's reserve; RESERVE_BANKS: no pool draws them |
| `C20/clips.json`, `public/media/listening/*.mp3` | the 48 clips (`ieli01-p1` … `ieli06-r6`) of our own scripts, mono MP3, each hashed into its version | 48 | clip records | through `/api/v1/listening/<file>` only, LISTENING on |
| `C21-1.json` | SAT practice form 1, Reading and Writing: module 1, module 2 easier, module 2 harder, 27 each | 81 | 81 `verified_auto` (`blind:P15rws1+P15rws2`; the four first quarantined for being answerable without the passage, `C21-rw1a10` v3 and `rw1a15`, `rw2e08`, `rw2e10` v2, by their own blind checks) | the form only (MOCK_BANKS: no pool draws them) |
| `C21-2.json` | SAT practice form 1, Math: module 1, module 2 easier, module 2 harder, 22 each | 66 | 66 `verified_auto` (`blind:P15maths1+P15maths2`) | as above |
| `C21/form-1.json` | the form: rw then math, the route thresholds (16 of 27, 13 of 22), every slot by id; no score scale (C-17) | 1 | form | `src/server/lessons/sat-full.ts`, SAT_FULL on. Every one of its 147 slots holds a `verified_auto` item keyed at its version (the P15 integration's check, 19 Oct 2026) |
| `C10-9.json` | AP Physics 1 units `C10-APPH01` … `APPH08` (the eight unit names and their order match AP Students' course page, checked by the P15 integration on 18 Oct 2026) | 8 | `verified_auto` (the integration's fact check, `C10/FACTCHECK.md`) | `ap_physics_1`'s units (AP_PHYSICS) |
| `C19-25.json`, `C19-26.json` | AP Physics 1 units 1-4 and 5-8: 24 lessons `C19-APPH01-1` … `APPH08-3` (course `ap_physics_1`) and their 72 piece questions | 24 + 72 | lessons 24 `verified_auto` (`RECONCILE-p15-q2.md`); questions 72 `verified_auto` (`blind:P15aps1+P15aps2`) | 24 lessons, AP_PHYSICS on |
| `C1-14.json`, `C1-15.json` | AP Physics 1 families `C1-ph1101` … `ph8303` (each lesson's test and homework) | 24 + 36 | 60 `verified_auto` (`solver:relation@50`; `C1-ph3202` at version 2, whose stem no longer rounds x to 0.3 m while the key uses 0.25 m) | the AP Physics lessons only (`page` = the lesson) |
| `C22-1.json`, `C22-2.json` | AP Physics 1 conceptual items, two a lesson, `C22-ph11c1` … `ph83c2` | 24 + 24 | 48 `verified_auto` (`blind:P15aps1+P15aps2`) | each lesson's homework, by id; RESERVE_BANKS: no pool draws them |

- **Reserves:** every listening lesson's reserve is exactly 20 (RESERVE_MIN) and no C20 item is outside a reserve, so `C20-li1115`
  (quarantine) was not taken out of `C19-IELI01-1`'s (it would leave 19): that lesson waits for a version 2 of `li1115` with its own blind
  check, and then its own lesson-record check. Its piece questions are verified; its unit keeps its other lesson, `C19-IELI01-2`.
- **Tests:** `tests/unit/content/p15-listen.test.ts`, `p15-sat-rw.test.ts`, `p15-sat-math.test.ts`, `p15-ap1.test.ts`, `p15-ap2.test.ts`
  (each reads both states, a draft or its key check 2), and `tests/unit/content/p15-int-banks.test.ts` (no pool draws C20, C21 or C22).
- **P16 (AP lane, 19 Oct 2026):** `C1/C1-14.json` `C1-ph3202`'s ru stem «на пол без трения» → «по полу без трения». A Russian wording
  fix under READ-p12/READ-p13's rule: no version bump, no status change, still `verified_auto` v2. `checkFamily` 50/50 re-run as a guard;
  `tests/unit/content/p16-ap-ru.test.ts`.
- **P16 (AP lane, 19 Oct 2026):** AP Physics 1's `C1-14`/`C1-15` families keep skill `math`, rung `alg2` as written. The learner model
  does not read them as maths (`src/server/phase-x/learner.ts` NOT_MATHS, by the page lesson's course), so no record was re-tagged.

### P16, the content lane after the P15 walks (19 Oct 2026): C20-li1115 on a clip of its own, the typed accept-list sweep

The content lane (agent:p16-content) wrote five IELTS Listening records at version+1, each `draft`, `key_check_2: null` until two
fresh blind solvers of separate agents key it (none of the P15 solvers, who have seen these items), and then the lesson records it holds
get their own check again. Evidence (the TTS and Whisper jobs and outputs): `jg-p5int/.superpowers/p16/content/`; the ledger
`jg-p5int/.superpowers/p16/content-author.md`.

| File | What | Count | Status | Served where |
|---|---|---:|---|---|
| `C20-1.json`, `C20/clips.json`, `public/media/listening/ieli01-r7.mp3` | `C20-li1115` v2: in `ieli01-r5` "Leo Varga. Varga is V-A-R-G-A" ran "Varga is" together as "Vargas" (quarantined). Version 2 is answered from a **new clip of its own, `ieli01-r7`** (Greenway Tennis Club; the name said in one turn, spelled in its own turn, "It's M-A-double L-O-Y", repeated by the other voice; key Malloy), not from a re-voiced `ieli01-r5`: that clip carries six other verified items (`li1116`, `li1117`; `li1214`-`li1217` of the served `C19-IELI01-2`), which a re-voicing would have sent back to the blind solvers. `ieli01-r5` is unchanged byte for byte. The clip: Kokoro-82M (`D:/tools/tts/venv`, `render_nosplit.py`, speed 0.95, as the unit 1 Part 1 clips), mono MP3 24 kHz CBR 40 kbit/s, 79.1 s, 396,072 bytes; faster-whisper `check.py` small.en and large-v3 (GPU) WER 0.0 %, small.en and large-v3-turbo (CPU int8) 0.0 % and 1.8 %, the key heard in all four; the spelling stretches M-A-L-L-O-Y in 36 of 36 decodes (three models, plain and prompted, 1.0 and atempo 0.6) | 1 + 1 clip | `verified_auto` (`blind:P16cs1+P16cs2`, `RECONCILE-p16.md`) | `C19-IELI01-1`'s reserve |
| `C20-1.json` | `C20-li1113` v2 (a quarter to nine, "Collection time: ______ am", three words and/or a number): adds 08.45, 08:45, quarter to 9, a quarter to 9, eight forty-five; `C20-li1119` v2 ("Start date: ______ September"): adds twenty-two, as its sibling dates before a month (`li1104`, `li1109`, `C19-li11q3`) take the number in words | 2 | `li1119` `verified_auto` (`blind:P16cs1+P16cs2`); `li1113` `quarantine` (key right 2/2; a printed-word form P16cs1 accepts is refused: `RECONCILE-p16.md`) | `C19-IELI01-1`'s reserve |
| `C20-5.json` | `C20-li5209` v2: adds I.D. (the letters heard, "some ID") | 1 | `quarantine` (key right 2/2; "identification", which P16cs2 accepts, is refused: `RECONCILE-p16.md`) | `C19-IELI05-2`'s reserve |
| `C19-24.json` | `C19-li61q1` v3: adds "a quarter past 2" (three words and a number, within the limit); its 12th accepted answer, the format's most (`schema.ts` accept max 12), so the rarer forms within the limit (two fifteen pm, quarter past 2 pm, 2.15 in the afternoon) stay refused | 1 | `draft` (one blind check, P16cs1: P16cs2 had seen the key; one fresh solver completes it) | `C19-IELI06-1`'s question 1 |

- **The sweep** (149 typed questions, 36 in C19-24 and 113 in C20), every accept list read against its clip and the P15 solvers' notes
  (`blind-listen/`, `blind-q2/`, `blind-q3/`). Every other list already takes the digits and the words of its number, the date in digits,
  with its suffix and in words, both spellings where the clip allows both (grey/gray, kerb/curb, licence/license), and joined or spaced
  forms (the grader ignores spaces and hyphens). **Not added, by rule:** a word or sign already printed next to the gap ("8.45 am" in
  "______ am", "14 pounds" in "£______": the P15 check [p15#3]; the currency sign itself is the grader's, [p15#4]); a different word from
  the one heard (identification for "ID", quotations for "quotes", driver's license for "driving licence": `C19-IELI04-1`'s trap piece,
  "write what you hear, not a word you think means the same"; `C20-li3202`'s photographs, written by its author and verified, stays); a
  singular for the plural heard (peanut, dog: the same trap piece); anything over the word limit ("a quarter to nine", "a quarter past two").
- **Reserves:** no reserve changed in size: `C20-li1115` stays in `C19-IELI01-1`'s 20 (now on `ieli01-r7`: that reserve sits on 7 clips).
  Held until their P16 items are keyed: `C19-IELI01-1` (`li1113`, `li1115`, `li1119`), `C19-IELI05-2` (`li5209`) and `C19-IELI06-1`
  (`li61q1`); the two that were served are `draft` again with `key_check_2: null` (`status` and `key_check_2` only). The other nine
  listening lessons are served as before.
- **Checks:** `validate.ts --baseline` (a `git archive HEAD` copy): 0 errors, 897 warnings, 301 notes (one more: `C20-li1115`'s
  `status.history`), 0 served with an error, no key changed in place; `scan.ts`: 2 findings, 0 errors, 0 on served items, as before.
- **Tests:** `tests/unit/content/p16-content.test.ts` (both states; the clip, the untouched `ieli01-r5` and its six items, the accept
  forms graded by `typedRight`, the sweep's rules over all 149); `p15-listen.test.ts` reads the five records' author and version from
  `tests/unit/content/p16-v.ts`.
- **Key check 2** (`RECONCILE-p16.md`, 19 Oct 2026; solvers P16cs1 and P16cs2, two fresh agents, each from the audio): **verified 2**
  (`C20-li1115` v2, `C20-li1119` v2: `blind:P16cs1+P16cs2`, `key_check_2_version: 2`); **quarantined 2**, each with the key chosen by
  both solvers and a form one solver lists as accepted that the accept list refuses: `C20-li1113` v2 (8.45 am and the like in
  "______ am", P16cs1) and `C20-li5209` v2 (identification for "ID", P16cs2), the two classes the sweep refused by rule, for the controller
  to rule on (if the rule stands, `reconcile.ts C20 P16cs1 P16cs2 --blind jg-p5int/.superpowers/p16/blind-content` decides them again on the
  same answers); **left draft 1** (`C19-li61q1` v3: P16cs1 alone counts, P16cs2 had read this README's P15 row naming its accept list
  before it solved). Lessons: none changes. `C19-IELI01-1` (reserve `li1113`) and `C19-IELI05-2` (reserve `li5209`) stay held; `C19-IELI06-1`
  passes every part of the P15 q2 lesson-record check but its q1 (`li61q1`, draft) and stays `draft`. The tests read the third state
  (`quarantine`, a reason that begins "P16 key check 2").

### C5: reading testlets (210 items: 199 `verified_auto`, 11 `quarantine` since the content-integrity pass)

| Language | Levels (3 passages each) | Passages | Items | `verified_auto` | `draft` |
|---|---|---:|---:|---:|---:|
| en | A1, A2, B1, B2, C1, C2 | 18 | 90 | 60 | 30 |
| uz | easy, medium, hard, advanced | 12 | 60 | 44 | 16 |
| ru | easy, medium, hard, advanced | 12 | 60 | 39 | 21 |

- Each passage has 5 items: 2 literal, 2 inferential and 1 vocabulary in context.
- Both blind solvers chose the key on all 210 items. **The 67 drafts were all flagged `no_passage_needed`**: 41 of the 42 vocabulary
  items, 14 literal and 12 inferential. They were rewritten as version 2 with the key unchanged. They need a fresh blind 2/2 before they
  are verified.
- Because of that, only 1 of the 42 passages has all 5 items verified today. 27 have 4 verified items, 5 have 3, 7 have 2, 1 has 1 and
  1 (an en C1 passage) has none.
- 11 passages are informational. Each one's `source` lists its claims with Wikipedia URLs and `verified_at: 2026-10-07`, as the author
  recorded them. No separate fact-check pass has re-read them.
- The spec's v1 size is 108 passages (§5.3). The test-ready minimum of 3 passages per level per language (§5.1) is met in the files, but
  not yet in verified items.

### C6: SAT Reading and Writing (120, all `verified_auto`; 240 with the lesson reserves of 13 Oct 2026; 480 with those of 14 Oct, P8; 720 with P8b's)

10 items in each of the 12 cells: 4 domains × B1 (SAT easy), B2 (medium) and C1 (hard). This meets the test-ready minimum of 10 per domain ×
difficulty (§5.1); the v1 size is 200. 20 items (8 information and ideas, 8 expression of ideas, 4 craft and structure) cite an outside
article in `source.facts`, recorded by the author with `verified_at`; the reconcile pass did not re-check those facts.

| File | Items | What | Status |
|---|---:|---|---|
| `C6-7.json` | 41 | reserve items for C19-RWCS01-1 (`cs1n01-05`), RWCS02-1 (`cs2n01-11`), RWCS03-1 (`cs3n01-14`), RWII01-1 (`ii1n01-11`); agent:p6b-a1 | `verified_auto` |
| `C6-8.json` | 41 | reserve items for C19-RWSE01-1 (`se1n01-05`), RWSE02-1 (`se2n01-05`), RWSE03-1 (`se3n01-20`, all hard), RWII03-1 (`ii3n01-11`); agent:p6b-a2 | `verified_auto` |
| `C6-9.json` | 38 | reserve items for C19-RWEI01-1 (`ei1n01-05`), RWEI02-1 (`ei2n01-05`), RWEI03-1 (`ei3n01-20`, all hard), RWII02-1 (`ii2n01-08`); agent:p6b-a3 | `verified_auto` |

P8 (14 Oct 2026) adds `C6-10.json`, `C6-11.json` and `C6-12.json`, 80 each, the reserves of lessons 2 and 3 of RWCS01-02, RWII01-02 and
RWSE01-02, 20 of each lesson's own (the P8 register above). P8b (14 Oct 2026) adds `C6-13.json`, `C6-14.json` and `C6-15.json`, 80 each,
the reserves of lessons 2 and 3 of RWEI01-02, RWCS03, RWII03, RWSE03 and RWEI03 (the P8b register above). Every reserve item (C6-7 …
C6-15, 600) stands in exactly one SAT R&W lesson's reserve (`tests/unit/engine-server/p6b-fixed-text.test.ts`). Our own texts of 25-150
words, everyday or plainly fictional scenes.

### C7: IELTS practice (81: 19 reading items `verified_auto`, 23 `quarantine`, 39 prompts `draft`, since the content-integrity pass)

| Part | Items | Format |
|---|---:|---|
| Reading | 42 | 6 passages (2 each at B1, B2, C1) × 7 items; 37 with options, 5 numeric |
| Writing Task 1 | 15 | 5 task types (line graph, bar chart, table, process, map) × bands 5, 6, 7 |
| Writing Task 2 | 12 | 4 essay types (opinion, discussion, problem-solution, two-part) × bands 5, 6, 7 |
| Speaking Part 2 cue cards | 12 | 4 per level (B1, B2, C1) |

- **Why `draft`:** the 42 reading items have not been through the blind 2/2 yet (`key_check_2: null`). The 39 writing and speaking
  prompts have no key, so they cannot be blind-checked. Their text and test-format facts were fact-checked (`C7/FACTCHECK.md`).
- The test-ready minimum (§5.1) is one writing prompt per task type per band and 12 cue cards. That is met. The v1 size is 20 + 20 prompts,
  12 reading sets and 40 cue cards (§5.3).
- **The IELTS Reading lesson reserves (13 Oct 2026, phase 1b):** `C7-7.json` (50: `ir1101-1110` skimming for C19-IERE01-1, `ir2101-2120`
  for IERE02-1, `ir2201-2220` for IERE02-2; agent:p6b-a4; 49 `verified_auto`, `C7-ir2214` `quarantine`) and `C7-8.json` (50: `ir1111-1120`
  scanning for IERE01-1, `ir3101-3120` for IERE03-1, `ir4101-4120` for IERE04-1; agent:p6b-a5; all `verified_auto`). Our own texts of
  60-150 words in the stem; four options with the key first (a True/False/Not Given question asks which of four statements is true, false
  or not given). Served only inside their lessons, never by a practice pool.

### C18: Uzbek state test (800 items, all `verified_auto` since the content-integrity pass)

- 10 blocks, each with 40 practice items (`C18-<block>p<nnn>`, files 1-20) and 30-60 mock items (`C18-<block>m<nnn>`, files 21-42),
  400 + 400. Levels: easy 377, medium 360, hard 63. The blocks are in `C18/README.md`.
- `mocks.json`: 4 mocks of 90 questions, one per subject pair, in the Order No. 105 format. File status `draft`. Every mock-pool item is
  used exactly once, and no practice item appears in a mock.
- The 2 drafts are v2 rewrites: `C18-msp020` (blind 1/2, a solver slip) and `C18-rtm001` (0/2: both solvers chose the common non-normative
  stress). **`C18-rtm001` is question 1 of the Russian-group native block in `C18-mock-bio-chem`**, so that mock has 89 verified items for
  Russian groups until it is rechecked.
- 321 items cite facts in `source.facts`; `fact-check.json` lists all 321 as verified on 2026-10-07 and 0 under `needs_verification`.
  The other 479 are `source: "own"`.
- Not written yet: the Russian-group "Russian language and literature" block, and the Inha and TTPU entrance-format forms.
  The mock duration (180 minutes) is marked `needs_verification`.

## Catalogs

Catalogs are task and reference content, not quiz items. **All 337 records are `draft` by design:** the spec gates the catalogs on a
human review before real families see them (LG1; most records name the reviewer in `review`). Their check is a fact check instead of a
key check. Every
date, deadline, requirement, fee, URL and registration step either carries a `url` and `verified_at`, or the record says
`needs_verification: true` (spec §5.5 step 6). Each folder's `FACTCHECK.md` has the detail.

| Catalog | What it is | Records | `needs_verification: true` | Facts (with URL + `verified_at`) | Review gate |
|---|---|---:|---:|---|---|
| **C2** | Math explainers: one idea, one worked example, 4 checks; 6 per rung | 48 | 0 (no dated facts) | none; the math is checked by sympy 1.14.0 (`key_check_2: sympy-1.14.0:n/n`) | — |
| **C8** | Activity playbooks | 22 | 1 (`C8-sumapp`, by design) | 44 (43, plus 1 `needs_verification`) | counselor |
| **C9** | Olympiads and competitions, with stage windows | 33 | 29 | 100 (100; 10 secondary). 38 of 98 windows unverified | — |
| **C10** | Test-prep units: 24 SAT + 24 IELTS Academic (+ `sequences.json`, 2 plans, each on its own status: both `verified_auto` since the 2026-10-10 re-check, `C10/FACTCHECK.md`) | 48 | 0 records; the IELTS Trial Test link is flagged in `C10-IELI06` (removed from the IELTS sequence on 2026-10-10: no official page confirms a location in Uzbekistan) | 159 (159) | tutor |
| **C11** | Admin and registration templates, incl. the Uzbek state application and private-university entrance routes | 44 | 35 | 144 (132; 21 secondary; 40 `needs_verification`; 1 planner rule). 15 of 42 windows unverified | — |
| **C12** | Essay tasks (40), essay tracks (5), brainstorm micro-prompts (30) | 75 | 9 | 53 (53; 9 `needs_verification`) | counselor |
| **C13** | Parent tasks (17) and parent question tasks (8) | 25 | 1 (`C13-passpt`) | 27 (27; 2 `needs_verification`) | owner |
| **C14** | Reflection and MCII prompts (+ `option_sets.json`, 14 chip sets) | 32 | 0 | 2 (2) | counselor |
| **C16** | Pathway options (UK foundation, A Levels, IB, AP, Studienkolleg, first year at home, Italy, Türkiye, Korea, MEXT) | 10 | 9 | 73 (73; 3 secondary). 12 of 27 windows unverified | counselor |
| | **Total** | **337** | **84 records** | | |

- **`verified_at` / `needs_verification`.** Every fact the web fact check could confirm on 2026-10-07 has a URL and
  `verified_at: "2026-10-07"`. A record stays `needs_verification: true` when one of its windows or facts could not be confirmed on an
  official page, or has no fixed date by design (set by each school or centre). Those records carry a `verify_task` in en, uz and ru,
  which tells the student what to confirm and where.
- **What the fact checks changed** (all on 2026-10-07): C2 corrected 2 claims; C7 corrected 7 claims; C8 corrected 3 facts and removed 2
  wrong statements; C9 corrected 18 records; C10 corrected 35 records and removed 1 unsupported claim; C11 corrected 17 templates and
  removed or replaced 5 unsupported claims; C12 corrected 3 student-facing statements; C13 corrected 5 records; C14 completed 4 source
  records; C16 corrected 12 facts and removed 1 invented date. No catalog record was found to be invented as a whole.
- **Test-ready check (§5.1):** C8-C12 and C16 exist, C11 includes the Uzbek state application steps, and C13 has the parent tasks. C2 has
  explainers for every rung. **Not in this folder:** C15 (diagnostic chunks, a code task) and C17 (a code fix). C4 was not in it
  either until 11 Oct 2026; it now holds the English lesson units (five words, a text, three questions; "C4" above), not word cards.

## Pipeline used (spec §5.5)

1. **Generation:** Claude agents in workflow streams (`author` is `agent:<stream>`), in batches of up to 20 items per file. The author's key
   is `options[0]`, and the `why` is written in en, uz and ru. That is key check 1 (`key_check_1: "author"`).
2. **Blind copy:** `node scripts/content/blind.mjs <folder> <solverName>` writes `.blind/<folder>-<solver>.json`. This holds the items with
   options shuffled and lettered per solver, the passage text, and no key or why. The key letters go in `.blind/.map-<folder>-<solver>.json`,
   which the solver does not open. `.blind/` is git-ignored.
3. **Key check 2:** two independent blind solvers (A and B) answer every item into `.blind/<folder>-<solver>.answers.json`. They also flag
   `two_defensible`, `unanswerable` and `no_passage_needed`. An item is verified only when both chose the key and neither flagged it. It
   then gets `key_check_2: "blind:2/2"` and `status: "verified_auto"`.
4. **Quarantine:** any other item gets a new version (`version + 1`), `status: "draft"`, `key_check_2: null` and a `quarantine_reason`. Keys
   are never changed in place. Each folder's `RECONCILE.md` records the counts, the reasons and the rewrites.
5. **Recheck:** the rewritten version-2 K items got a fresh blind copy and a third solver, C. All 91 passed (19 in K1, 21 in K2, 51 in K5).
   They are marked `key_check_2: "blind:recheck"`. **This bar is weaker than 2/2: one solver, not two.** The 69 version-2 practice items
   (67 in C5, 2 in C18) have not been rechecked yet and stay `draft`.
6. **Math:** only the K4x instances were blinded. Each K4x item was also checked by script against its K4 family: parameters in range,
   derived values, filled stems in all three languages, options and key. Every key was recomputed by hand. The C1 families were also
   checked by an independent solver (50 instances each), and C1x was blinded. The C2 examples and checks were re-run in sympy.
7. **Facts (catalogs and C7):** a separate agent per catalog opened the cited URLs on 2026-10-07, read each claim against its page and
   corrected, removed or flagged it (`FACTCHECK.md` in each folder). Most of these passes also compared the en, uz and ru texts.
8. **Code validation (this README, 2026-10-07):** see below.

## Code validation, 2026-10-07

Run over all 198 JSON files (the K banks and the C folders together, never `.blind/`):

1. **Parsing:** all 198 files parse.
2. **Ids:** all 3,308 record ids, 94 passage ids, 4 mock ids and 2 sequence ids (3,408 in all) are unique across every bank and catalog.
   Each id's prefix matches its folder. The catalogs' secondary ids (`olympiad_id`, `template_id`, `option_id`, `playbook_id`, `slug`) are
   unique within their catalog.
3. **References:** every string that looks like a content id resolves to a record, passage, mock or sequence. That covers 1,733
   references: `passage_id`, `family_ref`, the mocks' item lists and catalog cross-links. The 321 entries of C18 `fact-check.json` also
   resolve. Every `error_rules.json` family is a C1 family. Each mock block has its stated number of questions.
4. **Required fields:**
   - Every record has `id`, `status` (one of the five), `version` (an integer from 1), `source` (`"own"` or an object with a URL) and
     `author`.
   - Every keyed item also has `skill`, `level` or `rung`, `subskill`, `lang`, `stem`, a `why` in en, uz and ru, `prior_b`, `time_s`,
     `key_check_1` and `key_check_2`.
   - Every keyed item has a key: options (C3, C5 and C6 have exactly 4, all in the item's language; C18 has 4, each in uz and ru),
     `answer_numeric`, family options, or an open-response skill (C7 writing and speaking).
   - No `verified_auto` item lacks `key_check_2`, and no `draft` item carries a blind result. C1 and C1x stems are in en, uz and ru.
   - Every catalog record has a title in en, uz and ru (C13: uz and ru at least; C9: `name`). Every fact has a claim, plus a URL and
     `verified_at`, or `needs_verification: true`. The one exception is a planner rule in `C11-transcript`, which is marked `is_policy`
     with its `rule_id`.
   - No en/uz/ru text object has an empty language.
5. **Options and duplicates:** no item has two options that read the same, and no two items in any pool share both stem and options.
6. **Uzbek apostrophes:** every `uz` string, and every string of a record or passage whose `lang` is `uz`, was scanned. The scan covered
   25,168 strings with 16,506 U+02BB (oʻ/gʻ) and 1,120 U+02BC (tutuq). All other strings were also scanned for Uzbek words.
   **Fixed mechanically: 61 words in 30 strings** where an ASCII apostrophe stood in an oʻ/gʻ position:
   - `C18-enm012` uz why: «boʻlmasa»;
   - the English fact claims of `C18-olp009`, `olp010`, `olp012`-`olp016` and `olm006`-`olm009`, with the same claims in
     `C18/fact-check.json`: the Uzbek titles and names Oʻtgan kunlar, Choʻlpon, oʻgʻli, Gʻafur Gʻulom, Qoʻshchinor chiroqlari, Shohi soʻzana
     and Oʻgʻri. `fact-check.json` still matches the items' claims.
   - `C13-testbg` (en text, three fact claims, a note and the engineering note) and `C13-qbudgt` (an option label): soʻm, as the rest of the
     content spells it.

   The fix was a text replacement of those words only. Each file was parsed before and after, and nothing else changed. No key, stem,
   option or version changed.

   **Left as they are, on purpose:**
   - English inside Uzbek text: contractions and possessives ("don't", "Who's", "Ulugh Beg's"), and the ASCII single quotes around
     English phrases in the uz `study` text of C10.
   - `Clearingʼga` (C11): the tutuq U+02BC correctly separates a foreign word from its suffix. U+02BB there would read as gʻ.
   - The anabin record quoted verbatim in a `C16-stkol` fact claim ('Umumiy o'rta ta'lim to'g'risida attestat'): it is the source's own
     spelling.
   - The prime ′ in math notation (f′(x)).
   - A check for common Uzbek words written with no mark at all (togri, boladi, korsat and others) found none.
7. **The P5b validator**, run read-only on this folder (`npx tsx scripts/content/validate.ts <this folder>` in `jg-p5b` at `adcf48c`, a
   branch not merged here). For the C folders it reports:
   - C1: no error, and all 98 families keyed by its independent solver. C1x: 188 `format.both` warnings, as in K4x.
   - C3, C6 and C18: no error. It finds no cross-pool near-duplicate between the C pools and the K banks.
   - The schema gaps listed under "Known issues".

   It also reports K-bank errors that belong to the P5b review and were not changed here: it no longer accepts the 91 `blind:recheck`
   items as verified, it finds option clashes in some K4-high families, and 6 K4x instances use `pow()`.

**Not done yet:**

- the K4 family solver (50 instances per template) and a blind check of the 139 fixed K4 items;
- the blind recheck of the 69 version-2 practice items (67 in C5, 2 in C18), and a first blind check of the 42 C7 reading items;
- back-translation of the uz and ru items and catalog texts (§5.5 step 5): C2's `back_translation` is `null` on all 48 cards;
- teacher, tutor, counselor and owner review (`reviewed`, launch gate LG1).

Testers may see `verified_auto` items. Real families see only `reviewed` items (spec §5.5 step 7).

**Known issues, not fixed here:**

- The 81 version-2 items in K1-low (9), K2 (21) and K5 (51) are verified but still carry their `quarantine_reason` as history. K1-mid and
  K1-high removed it. A loader that filters on that field will drop them.
- `blind.mjs` shuffles with `sort(() => r() - 0.5)`, which is not uniform. Key letters cluster on A and D (`K5/RECONCILE.md`). Use
  Fisher-Yates before the next blind run.
- In 9 K4x-high numeric items, the key is the only decimal among options written as fractions. This only matters if they are ever served as
  multiple choice (`K4-high/RECONCILE.md`).
- **The C formats do not all fit the P5b schema** (`jg-p5b` at `adcf48c`):
  - `C5/passages.json` has a top-level `levels` key, a `read_s_estimate` on each passage and the level `advanced`. P5b's loader therefore
    reads none of its 42 passages. The 30 uz and ru items at `advanced` are outside its level list.
  - `C7/passages.json` and the 39 C7 writing and speaking items keep a `verified_at` on each source fact. P5b's fact object allows only
    `{claim, url}`, so it reads none of the 6 passages and rejects the 39 sources.
  - P5b reads every `{bank, batch, items}` file as an item batch. The catalogs C8-C14 and C16 use that shape for records that are not
    items, so it reports every catalog record as a schema error. They need a catalog schema, or a skip as P5b already does for C2.
  - 70 catalog ids do not fit P5b's item-id pattern (prefix plus 6 letters or digits), for example `C14-mcii-core` and `C16-ukfdn`. They
    are unique and every reference to them resolves. The rule is only a problem if catalogs are read as items.
- 6 C2 explainers point their checks at C1 subskills that C1 does not have: `C2-a20005`, `a20006`, `pc0005`, `pc0006`, `by0004`, and
  `by0006` (`determinant`, where C1 says `determinants`).
- 144 why texts in C5 (one language each) are longer than P5b's 200-character limit (a warning). 18 C3 A1 items have `time_s` 13, not
  10.

## Licences and sources

- **Every K item and passage is original** (`source: "own"`), written by Claude agents for Jamals Global. No SAT, Bluebook, College Board
  Question Bank, IELTS, Khan Academy or OpenStax item or passage was copied or adapted. Khan and OpenStax are CC BY-NC-SA, so they cannot
  be reused in a paid product. The Question Bank's commercial-reuse licence was never checked. Spec §5.5 forbids copying from all of them.
- **Fiction passages** (K2 and K5) were written as clearly fictional everyday stories with generic names, under the spec's rule: no
  invented statistics, studies, historical facts, testimonials or admissions results. This validation did not re-read them for that.
- **The 9 informational K5 passages** were written to state only checkable facts. Each `source` object lists its factual claims, each with a URL, and
  `verified_at: 2026-10-07`. The wording is our own: only facts are taken, not text. All of the sources are English Wikipedia articles:
  - silk: Bombyx mori, Sericulture;
  - Ulugh Beg Observatory;
  - Aral Sea;
  - autumn leaves: Chlorophyll, Autumn leaf color;
  - cooking at altitude: Boiling point, High-altitude cooking;
  - Camel;
  - Waggle dance;
  - moon phases: Lunar phase, Full moon;
  - floating ships: Archimedes' principle, Buoyancy, Load line.

  The only real people named are Ulugh Beg and Archimedes, both public historical figures, as the spec allows.
- **The practice pools and catalogs** follow the same rule: the wording is our own, and only facts are taken. Where an item or passage
  rests on facts, its `source` lists them with URLs:
  - 11 informational C5 passages and 20 C6 items (English Wikipedia);
  - the 6 C7 reading passages (Wikipedia) and the 39 C7 writing and speaking prompts (IELTS format facts from ielts.org and one IDP
    page); the Task 1 figures are invented for practice, and the prompts say so;
  - 321 C18 items (English Wikipedia and one UN list). No Agency (DTM) test item was copied; the Agency's licence is unknown.

  The catalogs cite mostly official pages (College Board, IELTS, Common App, UCAS, lex.uz, universities, olympiad sites) and mark a
  secondary source `secondary: true`. The only verbatim quotes are the 7 Common App prompts and the 3 UCAS questions in C12, each with
  its attribution and URL. The C14 prompts rest on published research (implementation intentions, MCII/WOOP), cited in its `sources`.
- No third-party word list or corpus text is embedded. If NGSL (CC BY-SA) or Tatoeba (CC BY 2.0 FR) is used later, attribute it here.
