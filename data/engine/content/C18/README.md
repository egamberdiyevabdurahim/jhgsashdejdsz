# C18 v1: Uzbek state-test (DTM) practice items and mocks

Practice content for the Uzbek state test run by the Bilim va malakalarni baholash agentligi (spec P5 §5.3, row C18; BRIEF-P5-wave1).
Written 2026-10-07 by `agent:c18-v1`, all items `key_check_1: "author"`. Blind key check 1 (same day, see `RECONCILE.md`): 798 items are
`verified_auto` with `key_check_2: "blind:2/2"`; `C18-msp020` and `C18-rtm001` were rewritten as v2 and are `draft` until a fresh blind check.
Nothing here has been back-translated or reviewed by a teacher yet.

**This is practice content (pool `C`). It shares nothing with the assessment banks K1, K2, K4, K4x and K5.** The P5b validator
(`scripts/content/validate.ts` in `jg-p5b`, run on the whole content root on 2026-10-07) reports no error or warning for C18, including no
cross-pool near-duplicate.

## What is here

| File | What it holds |
|---|---|
| `C18-1.json` … `C18-20.json` | **Practice pool**: 400 items, 40 per block. Ids `C18-<block>p<nnn>`. |
| `C18-21.json` … `C18-42.json` | **Mock pool**: 400 items used only by the four mocks. Ids `C18-<block>m<nnn>`. They must never be served as practice. |
| `mocks.json` | Four full mocks (90 questions each), one per subject pair, as lists of item ids in the Agency's block order. Not an item batch: the validator skips it. |
| `fact-check.json` | For every item that cites facts: its claims and URLs, split into `verified` and `needs_verification`. Not an item batch. |

Each batch file holds 15 or 20 items in the BRIEF format: `{bank, batch, items}`, with the key always at `options[0]` (the server shuffles).

## Blocks

| Block code | Skill | Block | Practice | Mock | Stem languages | Notes |
|---|---|---|---:|---:|---|---|
| `ot` | `dtm_native_uz` | Native language, compulsory (Uzbek groups: ona tili) | 40 | 40 | uz (ru stem gives the question in Russian; the Uzbek material stays Uzbek) | phonetics, lexis, morphology, syntax, spelling, punctuation |
| `rt` | `dtm_native_ru` | Native language, compulsory (Russian groups: Russian) | 40 | 40 | ru (uz stem gives the question in Uzbek; the Russian material stays Russian) | stress, spelling rules, morphology, syntax, punctuation |
| `mc` | `dtm_math_core` | Mathematics, compulsory | 40 | 40 | uz, ru | percentages, fractions, equations, progressions, basic geometry, word problems |
| `hi` | `dtm_history` | History of Uzbekistan, compulsory | 40 | 40 | uz, ru | ancient period to independence; every item has a checked source |
| `bi` | `dtm_biology` | Biology (pair Biology + Chemistry) | 40 | 30 | uz, ru | cell, molecular biology, genetics, human body, botany, zoology, ecology |
| `ch` | `dtm_chemistry` | Chemistry (pair Biology + Chemistry) | 40 | 30 | uz, ru | calculations, oxidation states, periodic law, bonding, organic |
| `ms` | `dtm_math` | Mathematics as a subject (pairs Maths + Physics, Maths + Foreign language) | 40 | 60 | uz, ru | logs, exponentials, trigonometry, derivatives, integrals, geometry, combinatorics |
| `ph` | `dtm_physics` | Physics (pair Maths + Physics) | 40 | 30 | uz, ru | mechanics, fluids, oscillations, heat, electricity, optics, nuclear |
| `en` | `dtm_english` | Foreign language: English (pairs Maths + Foreign language, Foreign language + Native language) | 40 | 60 | the item is English; the uz and ru stems carry the instruction in that language | grammar, vocabulary, error spotting, paraphrase, short reading |
| `ol` | `dtm_uz_lang_lit` | Native language and literature (pair Foreign language + Native language), Uzbek groups | 40 | 30 | uz (ru stem in Russian) | classical and modern Uzbek literature, literary terms, advanced grammar |
| | | **Total** | **400** | **400** | | **800 items** |

The validator requires uz and ru stems and options for every `dtm_*` item, so the `ot`, `ol` and `rt` items carry both even though the
material itself is in one language. The English block also carries `en`.

Every item has a one-line `why` in en, uz and ru. Uzbek text uses U+02BB for oʻ/gʻ and U+02BC for the tutuq belgisi (converted by the
builder and checked by the validator). Russian stress marks use U+0301.

**Level, `prior_b`, `time_s`.** `level` is easy, medium or hard (easy 377, medium 360, hard 63). `prior_b` is −0.8, 0.0 or 0.9 by level.
These are tag priors only; the validator has no band for easy/medium/hard. `time_s` is 15 s for short recall items (owner decision 5).
Calculation items carry an estimate from 20 s to 90 s.

## The mocks (`mocks.json`)

The format comes from Order No. 105 Annex 1, as R3 §1.2 extracted it from the official PDF
(https://uzbmb.uz/upload/file/pdf/qabul2026/Baholash%20mezoni.pdf). This stream did not re-fetch the PDF. Each mock has 90 questions:

1. native language, 10 × 1.1;
2. mathematics, 10 × 1.1;
3. history of Uzbekistan, 10 × 1.1;
4. first subject, 30 × 3.1;
5. second subject, 30 × 2.1.

The maximum is 189 points.

| Mock id | First subject (3.1) | Second subject (2.1) | Groups |
|---|---|---|---|
| `C18-mock-bio-chem` | Biology `bim001-030` | Chemistry `chm001-030` | uz, ru |
| `C18-mock-math-phys` | Mathematics `msm001-030` | Physics `phm001-030` | uz, ru |
| `C18-mock-math-eng` | Mathematics `msm031-060` | English `enm001-030` | uz, ru |
| `C18-mock-eng-uzlit` | English `enm031-060` | Native language and literature `olm001-030` | uz only (see gaps) |

Each mock has its own compulsory items: mock *k* uses `otm`, `rtm`, `mcm` and `him` numbers 10k+1 to 10k+10. Uzbek groups get the `ot`
native block and Russian groups get the `rt` block. No item appears in two mocks, and every mock-pool item is used exactly once (checked
by the generator). The duration is given as 180 minutes and marked `needs_verification`. That figure comes from a third-party site, not
an official page.

## Keys and facts

- **Keys (key check 1).** The author keyed every item. For 262 numeric items (maths, physics, chemistry and genetics calculations), the
  builder also recomputed the key from a Python expression. It failed the batch if `options[0]` differed or a distractor
  equalled the key. This is not key check 2: key check 2 still needs two independent blind solvers (spec §5.5 step 4).
- **Facts.** 321 items cite facts:
  - all 290 history, biology, chemistry and physics items, either as a fact or as the law or formula the calculation uses;
  - 31 native-language-and-literature items (authors, works and dates, and two verse-form definitions).

  Each source lists its claims as `{claim, url}`. Every cited claim was
  read on the cited page on 2026-10-07 (`verified_at`), so `fact-check.json` lists 0 items under `needs_verification`.
  - The sources are English Wikipedia articles plus one official UN list (UN admission dates).
  - The wording of every item is our own; only facts are taken.
  - No Agency (DTM) test item was copied or paraphrased. The Agency's licence is unknown (spec §5.3).
- **Own items.** The other 479 items are language, maths and English items with `source: "own"`.
- **Historical figures.** The only real people named are public historical and literary figures, with facts from the cited pages. No
  invented statistics or results appear.
- **Two places where Wikipedia differs from Uzbek school textbooks were avoided:**
  - Timur's birth year: Wikipedia gives the 1320s, the dynastic histories 1336.
  - The size of Ulugh Beg's star catalogue: Wikipedia gives 994 stars.

  The K5 Ulugh Beg passage topics were also avoided.

## Gaps and next steps

1. **Key check 2:** done for 798 items (`RECONCILE.md`); the two v2 items still need a blind 2/2. After that, back-translate uz↔ru (§5.5 step 5) and apply the Uzbek meaning-trap
   list. Teacher review (LG1) comes after both.
2. **Russian-group native language and literature:** the pair Foreign language + Native language uses "Russian language and literature"
   as its second subject for Russian groups. That block is not written yet, so `C18-mock-eng-uzlit` is for Uzbek groups only.
3. **Sizes:** v1 is 40 items per block, which meets the brief. The spec's steady state is about 120 per compulsory block and 100 per
   subject block (§5.3), plus the Inha and TTPU entrance-format forms. Those forms are not in v1.
4. **Mock duration:** confirm the test length on an official Agency page.
5. **Items are the source of truth.** The compact authoring scripts were session scratch files and are not in the repo. Change an item
   in its JSON, and never change a key in place: write a new `version`.
