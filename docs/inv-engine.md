# Engine inventory and Python port plan (src/engine → Python)

Lane: **engine**. Source read: `C:/Users/PC/jg-plan` (detached at m1-main `ddbf9d81`, read-only; no file in it was changed and none of its code was executed).
Written 21 Oct 2026 for the FastAPI conversion build lanes. Every count below was measured on that tree with read-only scripts
(TypeScript compiler API for exports and regex literals, a Tarjan pass for the import graph). Evidence is cited as `file:line`
relative to `src/engine/` unless another root is named.

Companion file: **`inv-engine-api.md`** (same folder) lists every one of the 1,096 exported values with its type-checked signature
(676 functions, 420 constants/classes), module by module. The build lanes port against that list.

Note on the tree: `C:/Users/PC/jg-p5int` (HEAD `3c09957e`) holds an OLDER engine than jg-plan (it lacks `rules-expiry.ts`,
`data/dated_2026_10_20.json`, and differs in `derive.ts`, `plan.ts`, `rules.ts`, `streak.ts`, `schedule/streak.ts`, `strategy/dated.ts`,
`data/test_calendars.json`). The golden fixtures must be recorded from the commit that is live at cutover, not from jg-p5int.

---

## 1. Counts

| what | count |
|---|---|
| TypeScript files in `src/engine` (excl. `data/`) | **143** |
| lines (all) / code lines (no comments, no blanks) / code characters | 16,964 / **11,354** / ~958 KB (lines are long: avg 84 chars, many 200-400) |
| code lines by area | top-level 3,384 · content 2,563 · strategy 1,861 · schedule 1,379 · admission 737 · cat 536 · lessons 484 · verify 189 · learner 186 · i18n 35 |
| exported functions / exported values (type-checker) | **676 / 420** (+ 381 exported types) |
| runtime import cycles | **0** (type-only cycles exist, e.g. `tasks.ts` ↔ `plan.ts` types; harmless in Python with `TYPE_CHECKING`) |
| dependency layers (longest path from leaves) | 22 (L0-L21, §5) |
| external packages | `zod/v4` (package zod 3.25.76: `content/schema.ts`, `content/catalog.ts`, `content/clips.ts`, `strategy/schema.ts`), `ts-fsrs` 5.4.1 (`learner/srs.ts`), `node:fs`/`node:path` (`content/read.ts` only) |
| `process.env` reads / `Date.now()` / `Math.random()` / `async` in the engine | **0 / 0 / 0 / 0** (pure: the server injects clock, randomness, tokens, switches) |
| JSON data files under `src/engine/data` | 321 files, 19 MB, 424,646 lines |
| content corpus | 6,949 items in batch files (6,851 `verified_auto`, 57 draft, 38 quarantine, 3 retired), **491 math families**, 31 stream folders |
| copy tables | `i18n/{en,uz}.json` 441 keys each, `ru.json` 451 (ru has 21 plural-form keys, en/uz 11); plus inline tables in `admission/copy.ts`, `phase-d-copy.ts`, `schedule/copy.ts`, `strategy/copy.ts`, `verify/words.ts`, `data/unis_uz_copy.json`, `data/teachers.placeholder.json` |
| regex literals | **488** (161 end in `$`, 37 use `\b`, 26 `\w/\W`, 79 `\d`, 81 `\s`, 33 `\p{…}` incl. `\p{Script=Latin/Cyrillic}`, 5 look-behinds, 1 sticky `y`, 70 `i`, 131 `g`, 41 `u`) |
| `Math.round` / `toFixed` / `toPrecision` / `localeCompare` / default `.sort()` | 65 / 19 / 5 / 28 / 27 sites |
| template literals / `String(` / `||` / `??`+`?.` / spreads / `typeof` | 1,209 / 202 / 927 / 1,207 / 783 / 255 |
| unit test files (all of `tests/unit` + `src/**`) | 604 files, 5,594 cases, 78,915 lines |
| test files that import an engine module | **350 files, 3,722 cases** (125 in `tests/unit/engine`, 78 in `engine-server`, 53 in `content`, 21 `ailayer`, 9 `cat`, …); 190 import the barrel `@/engine` |

Who calls the engine (imports from outside `src/engine`): `src/server` 117 imports of the barrel `@/engine` plus ~90 deep imports
(`@/engine/checks` 19, `strategy` 11, `schedule` 7, `phase-d` 7, `lessons/levels` 7, `coins` 7, `cat` 6, `content/*` ~30, …);
`src/app` 20 + 2; `scripts/` and `tools/` (content authoring, rules SQL, admission builders) by relative path.

---

## 2. What the engine is, and its boundary

* **Pure functions over JSON.** Inputs are the stored answers (`Answers = Record<string, any>`, `types.ts:10`), an `EngineCtx`
  `{ today, tz, nowIso, rules, bank, engineVersion, lang }` (`types.ts:13`), stored roadmaps/runs/states, and injected callbacks
  (`random`, `token`, `rate`, `now`). The server builds ctx in `src/server/engine/context.ts:56-58` (zone from the profile, default
  `Asia/Tashkent`; `today = localDateOf(now, tz)`; `nowIso = now.toISOString()`; rules from the `rule_record` rows).
* **Three kinds of module** (column "when" in §3): *runtime* (called per request), *boot* (`content/validate.ts load()`,
  `content/read.ts`, `scan.ts`, `text.ts`, `catalog.ts`: run when `src/server/content/bank.ts:60` builds the served bank at start-up),
  *offline* (content authoring tools used by `scripts/content/*` and tests only: `content/{solver,solve-stem,family-check,reconcile,
  blind,tags,backtranslate,edges}.ts`). `content/validate.ts` imports the offline modules at module level, but `load()` needs only
  `schema`, `catalog` and the file walk.
* **Barrels.** `index.ts` (`@/engine`) re-exports 35 modules; `strategy/index.ts` and `schedule/index.ts` are deliberately kept out
  of the main barrel (`schedule/index.ts:1-5`, `strategy/index.ts:1-5`: "dark by construction", behind PHASE_X / the AI plan step).
* **Module-level state** (must become explicit process state in Python):
  * `tasks.ts:103-104` `setCourseLabels(on)`: a server-set switch that changes `subjectOf()` (task subject badges).
  * `schedule/steps.ts:543-547` `index` cache + `setLessonStepResolver(fn)`: the server injects the lesson step resolver.
  * caches: `rules.ts:127` (`seedSnapshot`), `verify/link.ts:46` (host table), `content/formula.ts:140` (parse-tree cache),
    precomputed maps at import (`schedule/steps.ts:305,501,507`, `strategy/catalogs.ts:96,109`, `i18n/index.ts:34`, `cat/irt.ts:16` GRID,
    `admission/math.ts:41` integration grid, `cat/irt.ts:63-64` quadrature).
* **In-place mutators** (the caller relies on the mutation): `checks.ts` `answer/reopen/resume/stop/hold/finishReading/seeQuiz`
  mutate the `Run` (e.g. `serve()` at `checks.ts:217-223`); `cat/session.ts:256` `record()` pushes onto `s.log`; `streak.ts:35`
  `grantWeekly()` mutates `s`. Everything else returns new values (shallow copies: `streak.ts:20`, `answers.ts:118`).
* **Switches.** The engine reads no env. Feature switches (ENGINE_LIVE, PHASE_D, PHASE_X, LESSONS, …) are applied by the server by
  choosing which engine functions to call and by the two setters above.

---

## 3. Module inventory

Columns: code lines (non-comment); exported functions; when it runs; role; runtime engine imports (type-only imports omitted);
JSON read at import; how many test files import it directly (barrel importers not counted: 190 test files import `@/engine`,
44 `@/engine/strategy`, 30 `@/engine/schedule`, 17 `@/engine/cat`); JS-semantics hot spots (counts of the constructs §10 lists).
Signatures of every export: `inv-engine-api.md`.

| module | code lines | exported fns | when | role | runtime deps (engine) | data read at import | test files importing it directly | JS-semantics hot spots |
|---|---|---|---|---|---|---|---|---|
| admission/copy.ts | 75 | 1 | runtime | admission display tokens en/uz/ru (ADM_COPY, admT) | — | — | 1 | regex×1 |
| admission/display.ts | 53 | 3 | runtime | one number + words per university result; list P(≥1 admit) by seeded Gaussian-copula Monte Carlo (10,000 draws) | admission/copy, admission/math, admission/predict | — | 0 | — |
| admission/freeze.ts | 7 | 0 | runtime | model v4.3 freeze: sha256 over TS source+data files | — | — | 0 | — |
| admission/index.ts | 8 | 0 | runtime | barrel | admission/copy, admission/display, admission/freeze, admission/inputs, admission/math, admission/predict, admission/us, admission/uzcut | — | 8 | — |
| admission/inputs.ts | 156 | 6 | runtime | answers → AdmInputs (CEFR bands, soft SAT/English, Uzbek cert levels) | admission/math, admission/uzcut, answers, cat/read | — | 1 | round×1 regex×8 |
| admission/math.ts | 52 | 9 | runtime | sig/logit, erfc (NR), Phi/PhiInv (Acklam+Halley), meanSig (401-pt trapezoid), bisect, mulberry32 rng, Box-Muller, FNV seedOf | — | — | 1 | — |
| admission/moves.ts | 7 | 1 | runtime | the biggest driver Δp as a "what moves it" key | — | — | 1 | round×1 |
| admission/port.ts | 16 | 3 | runtime | facts of an admission_prediction row for calibration scripts | admission/predict | — | 1 | — |
| admission/predict.ts | 268 | 6 | runtime | admission model v4: per (student, university) p, band, gates, blockers, drivers, display state; reads specs.json | admission/inputs, admission/math, admission/us, admission/uzcut, labels, unis-uz, uz-records | admission/specs.json | 1 | round×2 regex×2 |
| admission/us.ts | 31 | 7 | runtime | US holistic shape: pool rates, solveShift (bisect), cell/soft probabilities, bands | admission/math | — | 1 | round×1 |
| admission/uzcut.ts | 64 | 7 | runtime | Uzbek state universities: programme rows, cut-off forecast, placeChance, subject blocks | admission/math | admission/uz_programmes_2026.json | 3 | round×1 regex×10 |
| answers.ts | 164 | 20 | runtime | stored answers → planning answers: scales, test ids, certificates, partial checks, typed-score claim/aside rules, take-backs | ladders | — | 1 | round×1 regex×3 |
| app-check.ts | 19 | 1 | runtime | per-university checklist rows the engine knows (Applications page) | unis-uz, uz-records | — | 0 | — |
| bank.ts | 14 | 3 | runtime | question bank accessors (question_bank.json) | — | question_bank.json | 1 | — |
| branch.ts | 76 | 5 | runtime | question-bank branch mini-language (loose ==, <, in, includes, len) + answer shape validation | bank, ladders, rules | — | 1 | regex×14 |
| capacity.ts | 37 | 2 | runtime | weekly-hours capacity check, track list, drop lowest-priority track | dates, derive, ladders | — | 0 | sort()×1 |
| card.ts | 38 | 4 | runtime | player card stats (hash jitter), tiers, Home circles | answers, ladders, util | — | 0 | round×4 |
| cat/config.ts | 33 | 1 | runtime | per-skill CAT launch config (lengths, stops, exposure) | — | — | 0 | — |
| cat/index.ts | 6 | 0 | runtime | barrel | cat/config, cat/irt, cat/read, cat/report, cat/scale, cat/session | — | 17 | — |
| cat/irt.ts | 64 | 14 | runtime | 3PL/PCM/testlet IRT on a 181-point θ grid; EAP posterior, quantiles | — | — | 0 | — |
| cat/read.ts | 52 | 7 | runtime | how engines read a check result (legacy and CAT posteriors), lock rules | cat/report, ladders | — | 0 | round×1 |
| cat/report.ts | 181 | 19 | runtime | CAT report: level probs, 90% set, IELTS/SAT tables, gentle/unmeasured results, erf | cat/config, cat/irt, cat/scale, cat/session, labels, too-fast | — | 0 | round×2 toFixed/Prec×1 regex×1 |
| cat/scale.ts | 44 | 8 | runtime | levels, cut scores, priors per skill and grade | ladders | — | 6 | — |
| cat/session.ts | 156 | 15 | runtime | CAT state machine: newSession, nextItem (targeting, exposure, random ties), record, completion (state stored in check_run.data) | cat/config, cat/irt, cat/scale | — | 0 | round×1 |
| catalog.ts | 61 | 2 | runtime | dream-university search catalog rows + Uzbek/Russian aliases | goal, labels, required-tests, uz-records | — | 0 | — |
| changes.ts | 51 | 3 | runtime | "what changed" sentences between two roadmaps/scorecards; leads | card, dates, i18n/index, labels | — | 0 | round×2 Date/Intl×2 regex×2 |
| checks.ts | 231 | 16 | runtime | server-graded checks (English, math, reading) + task quizzes: run state machine, shuffles under tokens, holds, too-fast rule | content/typed, i18n/index, ladders, tasks, too-fast | check_items.json, reading_upper.json | 33 | round×4 regex×3 |
| coins.ts | 22 | 3 | runtime | coin earn table (ledger amounts): coinsFor, taskCoins, freeze price | — | — | 6 | round×2 |
| content/backtranslate.ts | 60 | 3 | offline | OFFLINE: back-translation invariants + seeded translator copy | content/family, content/family-check | — | 3 | round×1 sort()×1 regex×15 |
| content/blind.ts | 54 | 1 | offline | OFFLINE: blind-solver copies (seeded option shuffle) | content/family, content/format, content/keycheck | — | 5 | — |
| content/catalog.ts | 79 | 4 | boot | catalog record schema (zod) + findings + status; used by validate.load at server boot | content/schema, content/text | — | 1 | regex×4 |
| content/clips.ts | 59 | 5 | runtime | listening clip records schema (zod); server listening loader | content/schema, content/typed | — | 2 | regex×2 |
| content/edges.ts | 73 | 2 | offline | OFFLINE: edge instances for blind keying (seeded) | content/family, content/formula, content/numbers | — | 1 | toFixed/Prec×1 localeCompare×1 regex×1 |
| content/family-check.ts | 148 | 6 | offline | OFFLINE (imported by validate): family key vs independent solver | content/family, content/formula, content/numbers, content/schema, content/solve-stem, content/solver | — | 10 | round×1 toFixed/Prec×2 sort()×2 regex×13 |
| content/family.ts | 177 | 21 | runtime | RUNTIME: math family engine: seeded params (mulberry32/FNV), derived values, constraints, rendered uz/ru/en stems/options/keys | content/formula, content/numbers, content/schema | — | 11 | toFixed/Prec×6 regex×7 |
| content/format.ts | 4 | 1 | runtime | how an item is answered (choice/numeric/typed) | content/family | — | 2 | — |
| content/formula.ts | 138 | 4 | runtime | RUNTIME: family formula language: tokenizer, recursive-descent parser, float evaluator | — | — | 2 | round×2 regex×4 |
| content/instructions.ts | 21 | 2 | runtime | which item instructions a page draws | — | — | 1 | regex×5 |
| content/keycheck.ts | 56 | 3 | runtime | key_check_2 status of an item (served or not) | content/family-check | — | 18 | regex×11 |
| content/numbers.ts | 29 | 3 | runtime | number display/parsing per language (grouping, decimal comma, U+2212) | — | — | 3 | regex×10 |
| content/read.ts | 18 | 1 | boot | reads a content folder from disk (node:fs) as a corpus | — | — | 29 | sort()×2 |
| content/reconcile.ts | 132 | 4 | offline | OFFLINE: author key vs blind solvers decisions | content/family-check, content/format, content/keycheck, content/numbers, content/typed | — | 4 | sort()×1 regex×7 |
| content/scan.ts | 211 | 12 | boot | item defect scanner (blank fill, cues, Uzbek marks); called by validate | content/family, content/formula, content/schema, content/text | — | 7 | round×1 toFixed/Prec×1 regex×40 |
| content/schema.ts | 147 | 3 | runtime | item/bank/passage file format (zod v4) + JSON Schema export + constants/regexes | — | — | 51 | regex×12 |
| content/solve-stem.ts | 252 | 4 | offline | OFFLINE: reads a rendered English stem into solver input | content/solver | — | 1 | round×1 toFixed/Prec×2 regex×69 |
| content/solver.ts | 267 | 2 | offline | OFFLINE: independent exact-rational (BigInt) math solver | — | — | 1 | round×4 regex×7 |
| content/tags.ts | 60 | 2 | offline | OFFLINE: tag-agreement sampling (seeded) and scoring | content/family, content/schema | — | 1 | round×1 localeCompare×1 |
| content/text.ts | 95 | 11 | boot | text normalisation, n-gram Jaccard, word counts, Uzbek apostrophe and mixed-script checks | — | — | 44 | regex×36 |
| content/typed.ts | 43 | 4 | runtime | typed answers (accept list, word limit) checked server-side | — | — | 3 | regex×16 |
| content/validate.ts | 440 | 4 | boot | content validator; load() runs at server boot to build the served bank; SERVED_STATUSES | content/catalog, content/clips, content/family-check, content/format, content/keycheck, content/numbers, content/scan, content/schema, content/text | — | 30 | round×5 toFixed/Prec×1 sort()×4 regex×29 |
| copy.ts | 39 | 0 | runtime | COPY: English sentences read from the copy tables | i18n/index | — | 0 | — |
| dates.ts | 26 | 13 | runtime | LocalDate arithmetic on UTC midnights; Intl zone date/offset; fmtMonth/fmtDay | — | — | 7 | round×2 Date/Intl×15 |
| derive.ts | 92 | 11 | runtime | derived facts: age, graduation, rules_set, english/maths basis, first deadline, stage S1-S4 | answers, dates, labels, ladders, rules, way | — | 2 | localeCompare×1 Date/Intl×3 regex×3 |
| endings.ts | 52 | 7 | runtime | how a task ends and what it is worth; day counts; real-text/real-answer rules | — | — | 3 | round×1 regex×3 |
| feasibility.ts | 71 | 4 | runtime | feasibility matrix: blockers, language tracks, suggestions, reality gap | dates, derive, i18n/index, labels, ladders, required-tests, rules, uz-records | — | 0 | regex×3 |
| flags.ts | 27 | 1 | runtime | consistency flags | i18n/index, labels, ladders, rules, score | — | 0 | regex×1 |
| goal.ts | 60 | 4 | runtime | the goal: dream universities until chosen, stand-in notes, photos | i18n/index, labels, uz-records, way | — | 1 | — |
| guardrails.ts | 60 | 10 | runtime | G1-G10 guardrail checks over a pipeline run and tasks | dates, labels, plan, rules, tasks | — | 0 | regex×22 |
| i18n/index.ts | 35 | 9 | runtime | copy tables en/uz/ru (JSON), {{param}} fill, CLDR plurals (Intl.PluralRules), month/day words, usd() | dates | i18n/en.json, i18n/ru.json, i18n/uz.json | 2 | round×1 Date/Intl×2 regex×2 |
| index.ts | 36 | 0 | runtime | barrel @/engine | answers, app-check, bank, branch, capacity, card, catalog, changes, coins, copy, dates, derive, feasibility, flags, goal, guardrails, i18n/index, labels, ladders, narrate, pipeline, plan, profile, readiness, required-tests, rules, score, streak, study, tasks, teachers, types, unis-uz, util, uz-records, version | — | 190 | — |
| labels.ts | 85 | 11 | runtime | labels/names: L, LQ, COUNTRY, UNIS table, route/exam/rung/track names | i18n/index | — | 5 | regex×4 |
| ladders.ts | 21 | 10 | runtime | CEFR and maths rungs, class levels, gap months, pace | — | — | 2 | — |
| learner/elo.ts | 33 | 8 | runtime | Elo skill/item update, mastery states | — | — | 8 | — |
| learner/quiz.ts | 136 | 13 | runtime | adaptive practice quiz composition (FSRS due first, P-band new items, interleave; injected random shuffle) | learner/elo | — | 12 | round×1 |
| learner/srs.ts | 17 | 3 | runtime | FSRS card review via ts-fsrs 5.4.1 (no fuzz, retention 0.9) | — | — | 3 | Date/Intl×3 |
| lessons/dtm-mock.ts | 58 | 4 | runtime | DTM mock sitting: blocks from C18 mocks, end time, score, pass mark | admission/uzcut | content/C18/* | 1 | round×1 Date/Intl×1 |
| lessons/exam-days.ts | 19 | 1 | runtime | official exam days (and day after) for streak protection | dates, strategy/catalogs, strategy/place, strategy/today | — | 1 | — |
| lessons/levels.ts | 91 | 8 | runtime | lesson skill levels: apply a sitting, level names/dots, hints | dates | — | 2 | — |
| lessons/mock.ts | 78 | 4 | runtime | Mock Saturday kind, Saturdays, section plan, SAT mock result | dates | — | 1 | regex×1 |
| lessons/sat-full.ts | 175 | 13 | runtime | full SAT practice: forms, module routing, timeline, SPR parsing, scoring, coins | coins, lessons/levels | — | 2 | round×2 toFixed/Prec×1 regex×2 |
| lessons/turns.ts | 41 | 3 | runtime | which maths course a lesson turn serves | ladders | — | 2 | sort()×1 |
| lessons/unit-test.ts | 22 | 2 | runtime | when a unit test is offered and its size | dates | — | 1 | sort()×1 |
| narrate.ts | 27 | 1 | runtime | code narrator intro and next actions | dates, i18n/index, ladders | — | 0 | regex×1 |
| phase-d-copy.ts | 200 | 1 | runtime | Phase D words en/uz/ru | — | — | 2 | regex×1 |
| phase-d.ts | 200 | 18 | runtime | Phase D: diagnostic as daily tasks: queues, chunks, day composition, completion | answers, branch, content/validate, dates, tasks | content/C13/* | 9 | regex×1 |
| pipeline.ts | 31 | 1 | runtime | runPipeline: normalize → derive → score → flags → feasibility → archetype → plan → narrate → card | answers, capacity, card, derive, feasibility, flags, narrate, plan, required-tests, score, tasks | — | 0 | — |
| plan.ts | 272 | 5 | runtime | the planner: phases, milestones (ids, dues, locks, rules), weekly goals, change log, notes | capacity, cat/read, dates, derive, i18n/index, labels, ladders, readiness, rules, uz-records, way | — | 1 | toFixed/Prec×2 localeCompare×3 sort()×1 regex×2 |
| profile.ts | 30 | 2 | runtime | profile facts and role line | labels | — | 1 | regex×3 |
| readiness.ts | 311 | 14 | runtime | "% ready" v3, scale readiness, chance views, test bars, official sittings | admission/index, admission/moves, answers, cat/read, derive, goal, labels, ladders, unis-uz, uz-records | uni_tiers.json | 2 | round×1 regex×11 |
| required-tests.ts | 53 | 3 | runtime | tests the student's destinations need; trim required-tests answer | labels, rules, uz-records | route_records.json | 1 | regex×2 |
| rules-expiry.ts | 79 | 1 | runtime | rules-base dates running out within N days (staff/scripts) | dates | — | 1 | localeCompare×1 sort()×1 regex×3 |
| rules.ts | 89 | 7 | runtime | rule records → RulesSnapshot; seed records; rules version = r1-fnv1a(sorted ids) | util | dated_2026_10_20.json, route_records.json, seed_rules.json, test_calendars.json, us_dated.json | 1 | sort()×1 regex×1 |
| schedule/adapt.ts | 64 | 9 | runtime | Phase X adaptation rows: pace, C7, weekly load, offers, skips, projection | dates | — | 0 | round×1 |
| schedule/allocate.ts | 111 | 5 | runtime | weekly allocation of a strategy into a week plan (streams, sittings, breaks) | dates, schedule/adapt, schedule/copy, strategy/capacity, strategy/schema, tasks | — | 2 | round×2 localeCompare×1 sort()×1 regex×1 |
| schedule/compose.ts | 245 | 4 | runtime | daily composition on four floors; task ids t_<date>_<slot>_<fnv6>; constraints hash | dates, ladders, learner/quiz, schedule/adapt, schedule/allocate, schedule/copy, schedule/dtm, schedule/english, schedule/providers, schedule/steps, strategy/fallback, tasks, util | — | 0 | round×3 |
| schedule/copy.ts | 270 | 7 | runtime | Phase X task words en/uz/ru (X_COPY) + templates | learner/quiz, schedule/steps, strategy/schema | — | 4 | regex×1 |
| schedule/dtm.ts | 47 | 4 | runtime | DTM-format practice plan for state-test students | admission/uzcut, derive, uz-records, way | — | 5 | regex×1 |
| schedule/english.ts | 53 | 7 | runtime | English lesson units from C4 content; lesson turn | content/keycheck, content/validate, ladders | content/C4/* | 0 | regex×1 |
| schedule/facts.ts | 82 | 5 | runtime | route fact cards and fact questions from route records | i18n/index, uz-records | route_records.json | 1 | toFixed/Prec×1 regex×1 |
| schedule/forward.ts | 42 | 1 | runtime | scheduler material brought forward during Phase D | schedule/compose, schedule/copy, schedule/english, schedule/steps, strategy/fallback | — | 2 | regex×1 |
| schedule/index.ts | 9 | 0 | runtime | barrel @/engine/schedule | schedule/adapt, schedule/allocate, schedule/compose, schedule/copy, schedule/english, schedule/providers, schedule/simulate, schedule/steps, schedule/streak | — | 30 | — |
| schedule/providers.ts | 21 | 0 | runtime | quiz/proof provider ports + stubs | — | — | 0 | — |
| schedule/simulate.ts | 58 | 1 | runtime | day-by-day simulation of the scheduler (golden personas gate) | dates, schedule/adapt, schedule/allocate, schedule/compose | — | 0 | — |
| schedule/steps.ts | 341 | 16 | runtime | playbook steps from content (C1/C2/C8/C10/C11/C12/C16), route cards, unit/lesson steps; module-level caches and an injected lesson resolver | content/family, content/format, content/keycheck, content/schema, content/validate, dates, goal, i18n/index, ladders, plan, schedule/english, schedule/facts, unis-uz, uz-records | content/C1/*, content/C10/*, content/C11/*, content/C12/*, content/C16/*, content/C2/*, content/C8/*, route_records.json | 5 | round×1 regex×13 |
| schedule/streak.ts | 36 | 4 | runtime | Phase X streak (DC5), 48h repair, reminders | dates, streak | — | 1 | round×1 localeCompare×1 |
| score.ts | 69 | 4 | runtime | scorecard (10 axes RAG + sentences) and archetype; effectiveAnswers | answers, feasibility, i18n/index, labels, ladders, rules | — | 0 | regex×1 |
| strategy/capacity.ts | 14 | 5 | runtime | weekly capacity minutes, week offsets → dates | dates, strategy/schema, tasks | — | 0 | round×1 |
| strategy/catalogs.ts | 109 | 10 | runtime | catalogs a strategy picks ids from (C8-C16, UZ programmes, test sittings) | admission/uzcut, capacity, content/validate, labels, strategy/schema | content/C10/*, content/C11/*, content/C12/*, content/C16/*, content/C8/*, content/C9/* | 4 | localeCompare×1 regex×1 |
| strategy/copy.ts | 55 | 1 | runtime | order-rationale lines en/uz/ru | — | — | 0 | — |
| strategy/dated.ts | 40 | 4 | runtime | dated facts: university deadlines, intake days, scores-on days, IELTS days | — | — | 3 | localeCompare×1 sort()×2 regex×4 |
| strategy/fallback.ts | 190 | 3 | runtime | code fallback roadmap strategy (what production runs) | admission/copy, admission/inputs, admission/predict, admission/uzcut, answers, capacity, derive, goal, labels, ladders, readiness, strategy/capacity, strategy/catalogs, strategy/copy, strategy/field, strategy/gaps, strategy/schema, strategy/testplan, strategy/validators/v14 | — | 0 | round×1 localeCompare×1 regex×8 |
| strategy/field.ts | 11 | 3 | runtime | student field vs activity catalog | — | — | 0 | — |
| strategy/fit.ts | 42 | 2 | runtime | fit context for V16 (deadlines, languages, field) | derive, labels, strategy/catalogs, strategy/dated, strategy/field, strategy/gaps | — | 0 | localeCompare×1 |
| strategy/gaps.ts | 50 | 3 | runtime | closed list of gap codes and gapsOf(admission results) | — | — | 0 | — |
| strategy/gate.ts | 25 | 2 | runtime | validate + place a strategy before storing | strategy/place, strategy/validators/index, strategy/validators/types | — | 0 | — |
| strategy/index.ts | 12 | 0 | runtime | barrel @/engine/strategy | strategy/capacity, strategy/catalogs, strategy/copy, strategy/fallback, strategy/field, strategy/fit, strategy/gaps, strategy/gate, strategy/place, strategy/schema, strategy/testplan, strategy/validators/index | — | 44 | — |
| strategy/month.ts | 280 | 6 | runtime | 30-day month view: todos, dates, SAT readiness, ahead | admission/copy, admission/uzcut, dates, i18n/index, labels, ladders, strategy/dated, strategy/today, unis-uz, uz-records | — | 6 | round×2 localeCompare×3 sort()×1 regex×7 |
| strategy/place.ts | 54 | 2 | runtime | date placement: registrations, week offsets → calendar dates | dates, strategy/capacity | — | 0 | localeCompare×1 |
| strategy/route-word.ts | 17 | 1 | runtime | route chip word by chance number | — | — | 1 | — |
| strategy/schema.ts | 61 | 2 | runtime | RoadmapStrategy zod schema (closed-id variant per student) + constants | strategy/gaps | — | 0 | regex×8 |
| strategy/step-why.ts | 49 | 1 | runtime | per-step "why" lines | labels | — | 1 | — |
| strategy/testplan.ts | 20 | 2 | runtime | plannable test sittings and the planned one | dates, strategy/place, strategy/validators/core, strategy/validators/v7 | — | 0 | localeCompare×3 |
| strategy/today.ts | 121 | 4 | runtime | roadmap as of today: steps, late marks, official links, phases | content/validate, dates, i18n/index, labels, strategy/catalogs, strategy/dated, strategy/place, strategy/testplan | content/C11/* | 10 | localeCompare×2 sort()×2 regex×3 |
| strategy/truth.ts | 98 | 2 | runtime | late truth: target year that does not fit, later year | dates, derive, i18n/index, labels, rules, strategy/dated, way | — | 5 | localeCompare×1 sort()×1 regex×1 |
| strategy/uni-rows.ts | 87 | 2 | runtime | a roadmap row per named university | derive, labels, plan, rules, strategy/dated, strategy/today, unis-uz, uz-records, way | — | 1 | regex×2 |
| strategy/validators/core.ts | 127 | 9 | runtime | validators V2 V4 V5 V6 V8 V9 V13 + prerequisites | strategy/capacity, strategy/catalogs, strategy/gaps, strategy/schema, strategy/validators/types | — | 0 | localeCompare×1 |
| strategy/validators/index.ts | 44 | 2 | runtime | validateStrategy entry, validateCtxOf | admission/inputs, strategy/capacity, strategy/gaps, strategy/validators/core, strategy/validators/types, strategy/validators/v1, strategy/validators/v10, strategy/validators/v11, strategy/validators/v12, strategy/validators/v14, strategy/validators/v15, strategy/validators/v16, strategy/validators/v3, strategy/validators/v7 | — | 0 | round×1 |
| strategy/validators/types.ts | 33 | 1 | runtime | error codes, replan triggers, strategyError | — | — | 0 | — |
| strategy/validators/v1.ts | 24 | 1 | runtime | V1 schema validity (zod) | strategy/catalogs, strategy/schema, strategy/validators/types | — | 0 | — |
| strategy/validators/v10.ts | 18 | 1 | runtime | V10 text guard on rationale lines | strategy/copy, strategy/validators/types | — | 0 | — |
| strategy/validators/v11.ts | 40 | 1 | runtime | V11 re-plan diff limits | strategy/schema, strategy/validators/types | — | 0 | sort()×1 |
| strategy/validators/v12.ts | 13 | 2 | runtime | V12 minimum playbook minutes | strategy/catalogs, strategy/validators/types | — | 0 | — |
| strategy/validators/v14.ts | 27 | 3 | runtime | V14 gate-blocked destinations need a pathway step | labels, strategy/capacity, strategy/catalogs, strategy/validators/types | — | 0 | localeCompare×1 |
| strategy/validators/v15.ts | 29 | 2 | runtime | V15 no chance/rank claims in rationale (en/uz/ru regexes, lookbehind) | strategy/validators/types | — | 0 | regex×10 |
| strategy/validators/v16.ts | 41 | 2 | runtime | V16 fit to the student | dates, strategy/field, strategy/validators/types, strategy/validators/v7 | — | 0 | — |
| strategy/validators/v3.ts | 25 | 1 | runtime | V3 no hard deadline moved or dropped | strategy/capacity, strategy/validators/types | — | 0 | — |
| strategy/validators/v7.ts | 31 | 2 | runtime | V7 test sitting timing | dates, labels, strategy/place, strategy/validators/core, strategy/validators/types | — | 0 | localeCompare×1 |
| strategy/way-view.ts | 57 | 3 | runtime | the "two honest ways" view | derive, goal, i18n/index, labels, strategy/today, unis-uz, uz-records, way | — | 4 | sort()×1 |
| strategy/week-goals.ts | 17 | 1 | runtime | which weekly goals a step sheet shows | dates | — | 1 | round×1 localeCompare×1 |
| streak.ts | 31 | 3 | runtime | streak close days, weekly freeze grant (cap 2), view | dates | — | 2 | localeCompare×1 |
| study.ts | 40 | 6 | runtime | study sessions settle (bricks, XP), levels, day result, Double Brick Hour slots (hash + zone) | dates, util | — | 0 | round×1 Date/Intl×3 |
| tasks.ts | 186 | 15 | runtime | code task writer: first tasks, cadence, day budget, generateWeek (ids t_<date>_<slot>_<fnv6>), quizzes, reflow; injected course-labels switch | branch, coins, dates, i18n/index, ladders, rules, schedule/steps, util | — | 4 | round×2 regex×2 |
| teachers.ts | 52 | 2 | runtime | placeholder teacher cards | — | teachers.placeholder.json | 0 | — |
| too-fast.ts | 5 | 2 | runtime | too-fast-to-be-an-attempt rule | — | — | 2 | — |
| types.ts | 63 | 0 | runtime | engine types (no runtime) | — | — | 0 | — |
| unis-uz.ts | 260 | 9 | runtime | Uzbek universities view: verdicts, items, windows, slim view | admission/uzcut, answers, catalog, derive, goal, i18n/index, labels, ladders, uz-records | unis_uz_copy.json | 2 | toFixed/Prec×6 sort()×1 Date/Intl×1 regex×5 |
| util.ts | 3 | 3 | runtime | design hash (×31), fnv1a (8 hex), JSON clone | — | — | 0 | — |
| uz-records.ts | 33 | 3 | runtime | sourced records of 14 Uzbek universities; state-test registration window | — | universities_uz.json | 3 | regex×1 |
| verify/artifact.ts | 80 | 8 | runtime | proof text checks (counts, script, language, prompt pasted) | — | — | 1 | regex×9 |
| verify/link.ts | 48 | 3 | runtime | proof link host allow-list | — | admission/specs.json, universities_uz.json | 1 | sort()×1 regex×7 |
| verify/words.ts | 61 | 6 | runtime | verification sentences en/uz/ru | — | — | 3 | regex×1 |
| version.ts | 1 | 0 | runtime | ENGINE_VERSION p1-1.0.0 | — | — | 0 | — |
| way.ts | 67 | 7 | runtime | the student's chosen way (home / later / abroad), home words | labels | — | 5 | regex×1 |


---

## 4. Entry points the server calls (inputs → outputs, and where the output is kept)

The port's public surface. Everything else is internal and is reached through these. "Kept" = persisted by `src/server`
(so the Python output is read back later by the other runtime during a mixed period, and by the frontend).

| entry point (file:line) | signature (abridged) | output kept in |
|---|---|---|
| `runPipeline` pipeline.ts:28 | `(PipelineInput{student,parent,parallel,prev,changeLog,profileVersion,createdOn,parentDone,weekTitles}, EngineCtx) → PipelineResult{answers,derived,scorecard,flags,feasibility,archetype,first_tasks,capacity,roadmap,narration,card,notes,note_forms,stubs}` | engine result + roadmap rows (`src/server/engine/recompute.ts:65-84`, `src/db/schema.ts:170-193`) |
| `derive` derive.ts:98, `score` score.ts:28, `feasibility` feasibility.ts:31, `plan` plan.ts:109, `narrateCode` narrate.ts:15, `playerCard` card.ts:12, `circlesOf` card.ts:51 | parts of the pipeline, also called alone by snapshot/pages | same |
| `normalizeAnswers` answers.ts:116, `validateAnswers` branch.ts:85, `visibleQuestions` branch.ts:45, `withdrawnByTests` answers.ts:209, `takenBackByOrder` answers.ts:233 | answers in → answers/errors out | answers store (`src/server/engine/store.ts`) |
| `generateWeek` tasks.ts:176, `firstTasks` tasks.ts:59, `cadence` tasks.ts:75, `reflow` tasks.ts:252 | `(WeekInput, ctx) → DailyTask[]` (ids `t_<date>_<slot>_<fnv6>`, `constraints_hash`) | `task_batches` + daily tasks (`src/server/engine/week.ts:19-74`) |
| `whatChanged` changes.ts:28, `movedLines` changes.ts:54, `LEADS` changes.ts:70 | two `Before`s → `{lead, list}` | change log |
| `readinessOf` readiness.ts:455, `scaleReadinessOf` :366, `chanceViewOf` :407 | answers+derived+ctx → readiness/chance views | snapshot (rendered), `admission_prediction.inputs` |
| `admissionFor` admission/predict.ts:169, `displayOf` admission/display.ts:24, `listLine` :65, `predictionFacts` admission/port.ts:28 | per university result `AdmResult`, display, list P(≥1) | `admission_prediction` (`src/server/engine/predictions.ts:27`, model v4.3 frozen) |
| `unisUz` unis-uz.ts:310, `unisUzSlim` :335, `goalOf` goal.ts:76, `appChecks` app-check.ts:20, `profileFacts` profile.ts:46, `catalogRows` catalog.ts:92, `teacherCards` teachers.ts:53 | views for Home / universities / profile | rendered only |
| checks: `newRun` checks.ts:164, `answer` :290, `reopen` :236, `resume` :327, `stop` :351, `hold` :368, `finishReading` :357, `viewOf` :383 | `Run` state machine; `Deps{now, token(), random(), readMs}` | `check_run.data` / `result` (`src/db/schema.ts:361-364`) |
| CAT: `newSession` cat/session.ts:101, `nextItem` :185, `record` :256, `isComplete` :166, `catResult` cat/report.ts:239, `summaryOf` cat/read.ts:23 | `CatState` JSON state machine; `random`, `rate(exposure)` injected | `check_run.data` |
| Phase D: `composeDay` phase-d.ts:313, `nextChunk` :194, `diagnosticComplete` :365, `parentTasks` :266 | daily diagnostic tasks, completion | task rows, events |
| Phase X: `allocateWeek` schedule/allocate.ts:92, `composeWeek` schedule/compose.ts:137, `forwardTasks` schedule/forward.ts:59, `closeDaysX` schedule/streak.ts:22, adapt rows schedule/adapt.ts:47-104, `dtmPlanOf` schedule/dtm.ts:68 | week plan → `XTask[]` (ids `t_<date>_<slot>_<fnv6>`) | tasks, `sched_state`-like rows (`src/db/schema.ts:492`) |
| strategy: `strategyInputOf` strategy/fallback.ts:61, `fallbackStrategy` :112, `validateStrategy` strategy/validators/index.ts:47, `strategyGate` strategy/gate.ts:41, `placeStrategy` strategy/place.ts:62 | `RoadmapStrategy` (zod shape) + errors + placement | `roadmaps.strategy` (`src/db/schema.ts:193`) |
| roadmap views: `roadmapToday` strategy/today.ts:113, `monthView` strategy/month.ts:370, `lateTruth` strategy/truth.ts:135, `wayView` strategy/way-view.ts:77, `uniRows` strategy/uni-rows.ts:84, `stepWhy` strategy/step-why.ts:56, `weekGoalsShown` strategy/week-goals.ts:24, `routeWords` strategy/route-word.ts:23 | rendered roadmap | rendered only |
| learner: `composeQuiz` learner/quiz.ts:253, `supplyOf` :224, `eloUpdate` learner/elo.ts:31, `reviewCard` learner/srs.ts:26, `isDue` :30, `retrievability` :32 | practice quiz picks, Elo θ/b, FSRS card | `learner_skill`, card rows (`src/db/schema.ts:511`) |
| lessons: `applySitting` lessons/levels.ts:52, `mathTurnOf` lessons/turns.ts:37, `unitTestOffer` lessons/unit-test.ts:36, `mockPlanOf` lessons/mock.ts:83, `scoreSitting` lessons/sat-full.ts:203, `dtmScore` lessons/dtm-mock.ts:73, `examDaysOf` lessons/exam-days.ts:21 | lesson levels, mock plans, scores | `lesson_skill` (`src/db/schema.ts:587`), sittings (`:606-617`) |
| coins/streak/study: `coinsFor` coins.ts:8, `taskCoins` :29, `closeStreakDays` streak.ts:19, `grantWeekly` :35, `settleSession` study.ts:13, `levelOf` :29, `dayResult` :43, `dbhSlots` :52, `dayCount` endings.ts:102 | **coin amounts written to the ledger**, streak state | ledger, `streak_state` (`src/db/schema.ts:269`) |
| content (server boot + serving): `load` content/validate.ts:109, `instantiate` content/family.ts:200, `whyOf` :101, `fmtNum` :86, `formatOf` content/format.ts:11, `keyCheckOf` content/keycheck.ts:68, `parseNumeric` content/numbers.ts:39, `typedRight` content/typed.ts:37, `shownInstruction` content/instructions.ts:37, `parseClips` content/clips.ts:31 | served bank; a family instance per seed; grading of typed/numeric answers | the seed and option map live in the run state (`src/server/content/bank.ts:193` `ServedKey`) |
| verify: `checkArtifact` verify/artifact.ts:95, `checkLink` verify/link.ts:59, sentences verify/words.ts | proof checks | proof result rows |
| rules: `snapshotFromRecords` rules.ts:106, `seedRecords` :83, `expiringDates` rules-expiry.ts:40 | `RulesSnapshot` with `version = r1-<fnv1a>` | `rules_version` stamped on every result, roadmap and batch |

---

## 5. Dependency graph (runtime imports; leaves first)

No runtime cycles. Layer = longest path to a leaf. A module can be ported once every module in lower layers that it imports is done.

* **L0 (38, no engine imports):** admission/copy, admission/freeze, admission/math, admission/moves, bank, cat/config, cat/irt, coins, content/formula,
  content/instructions, content/numbers, content/read, content/schema, content/solver, content/text, content/typed, dates, endings, ladders,
  learner/elo, learner/srs, phase-d-copy, schedule/providers, strategy/copy, strategy/dated, strategy/field, strategy/gaps, strategy/route-word,
  strategy/validators/types, teachers, too-fast, types, util, uz-records, verify/artifact, verify/link, verify/words, version
* **L1:** admission/us, admission/uzcut, answers, cat/scale, content/catalog, content/clips, content/family, content/solve-stem, i18n/index,
  learner/quiz, lessons/levels, lessons/mock, lessons/turns, lessons/unit-test, rules-expiry, rules, schedule/adapt, strategy/schema,
  strategy/validators/v10, strategy/validators/v15, strategy/week-goals, streak, study
* **L2:** branch, card, cat/session, content/edges, content/family-check, content/format, content/scan, content/tags, copy, labels,
  lessons/dtm-mock, lessons/sat-full, narrate, schedule/facts, schedule/streak, strategy/validators/v11
* **L3:** cat/report, changes, content/backtranslate, content/keycheck, profile, required-tests, strategy/step-why, way
* **L4:** cat/read, content/blind, content/reconcile, content/validate, derive, goal
* **L5:** admission/inputs, capacity, cat/index, catalog, feasibility, schedule/dtm, schedule/english, strategy/truth
* **L6:** score, strategy/catalogs, unis-uz
* **L7:** admission/predict, app-check, flags, strategy/fit, strategy/validators/v1, strategy/validators/v12
* **L8:** admission/display, admission/port · **L9:** admission/index · **L10:** readiness · **L11:** plan · **L12:** schedule/steps
* **L13:** schedule/copy, tasks · **L14:** checks, guardrails, phase-d, pipeline, strategy/capacity
* **L15:** index, schedule/allocate, strategy/place, strategy/validators/{core,v14,v3} · **L16:** strategy/validators/v7
* **L17:** strategy/testplan, strategy/validators/v16 · **L18:** strategy/fallback, strategy/today, strategy/validators/index
* **L19:** lessons/exam-days, schedule/compose, strategy/gate, strategy/month, strategy/uni-rows, strategy/way-view
* **L20:** schedule/forward, schedule/simulate, strategy/index · **L21:** schedule/index

Highest fan-in (runtime importers): dates 33, labels 28, ladders 23, i18n 19, uz-records 16, derive 13, rules 12, validators/types 12,
answers 10, admission/uzcut 9, strategy/catalogs 9, strategy/schema 9. Note the long spine `readiness → plan → schedule/steps → tasks →
checks/phase-d/pipeline`: `checks.ts` imports `tasks.ts` (QUIZ) which imports `schedule/steps.ts` (route cards) which imports `plan.ts`
which imports `readiness.ts` which imports the whole admission model. A port of `checks` therefore waits for most of the core unless
the shared constants are split out first (recommended: move `QUIZ`, `quizPassMark` into a leaf module in the Python layout).

---

## 6. Data the engine reads

All are plain JSON, so Python reads the **same files** (no conversion; keep them where they are and load by path). Sizes in bytes.

| file | size | read by (import time) | notes |
|---|---|---|---|
| `data/question_bank.json` | 75,651 | bank.ts | the design's QB; branch expressions (`branch.ts`) |
| `data/seed_rules.json` | 26,691 | rules.ts | the design's SEED, byte-equal to the design; v1 of the rule records |
| `data/test_calendars.json` | 21,346 | rules.ts | TC_SAT, TC_IELTS_UZ (v2) |
| `data/route_records.json` | 19,850 | rules.ts, required-tests.ts, schedule/facts.ts, schedule/steps.ts | GKS / Türkiye Bursları sourced records |
| `data/us_dated.json` | 5,859 | rules.ts | US v3 dated facts |
| `data/dated_2026_10_20.json` | 34,155 | rules.ts | US v4, UK v2, DE v2 (m1 dates lane) |
| `data/check_items.json` | 26,394 | checks.ts | A4 check items (two astral emoji: U+1F34E, U+1F431) |
| `data/reading_upper.json` | 8,272 | checks.ts | upper reading set |
| `data/uni_tiers.json` | 3,345 | readiness.ts | |
| `data/universities_uz.json` | 40,658 | uz-records.ts, verify/link.ts | 14 Uzbek universities, sourced |
| `data/unis_uz_copy.json` | 24,107 | unis-uz.ts | uz-universities copy en/uz/ru |
| `data/teachers.placeholder.json` | 6,988 | teachers.ts | placeholder teachers (D19) |
| `data/admission/specs.json` | 27,749 | admission/predict.ts, verify/link.ts | **frozen** (FROZEN_FILES) |
| `data/admission/uz_programmes_2026.json` | 47,774 | admission/uzcut.ts | **frozen**; has integer-like keys `"2025"`, `"2026"` |
| `data/cat/calibration.json` | 423 | server only (`src/server/cat/calibration.ts`) | |
| `i18n/{en,uz,ru}.json` | 443/443/453 lines | i18n/index.ts | copy tables; uz in Latin with U+02BB/U+02BC |
| `data/content/C1/C1-1..6.json`, `C2/C2-1..4`, `C8/C8-1..2`, `C10/C10-1..4` + `sequences.json`, `C11/C11-1..4`, `C12/C12-1..6`, `C16/C16-1` | — | schedule/steps.ts | playbooks, explainers, sequences, essay tracks, pathway options |
| `C8`, `C9/C9-1..2`, `C10/*`, `C11/*`, `C12/C12-4`, `C16/C16-1` | — | strategy/catalogs.ts | catalogs a strategy picks ids from |
| `C11/C11-1..4` | — | strategy/today.ts | admin templates (official links) |
| `C4/units.json`, `C4/C4-1..4` | — | schedule/english.ts | English learn units |
| `C13/C13-2.json` | — | phase-d.ts | parent question tasks |
| `C18/mocks.json` | — | lessons/dtm-mock.ts | DTM mock forms |
| **whole `data/content/` tree** (321 files, 19 MB) | — | `content/read.ts` → `content/validate.ts load()` at server boot (`src/server/content/bank.ts:60`); `src/server/listening/clips.ts` | the served item banks (C1-C22, K1-K5): 6,949 items, 491 families |
| `content/item.schema.json` | 1,006 lines | generated from zod (`content/schema.ts:186-188`) | committed JSON Schema of the item format |

Integer-like object keys exist in `admission/uz_programmes_2026.json` (`"2025"`, `"2026"`), `content/C12/C12-2.json`, `C12-3.json`
(`"0"`,`"1"`,`"2"`), `C14/C14-1.json`, `C14/option_sets.json` (`"1"`,`"3"`,`"5"`): JS iterates such keys first in ascending order
(§10 item 9). In the current files they already stand in ascending order, so the loader rule below changes nothing today; it must
still exist because answers from Postgres `jsonb` come back in jsonb's own key order.

Memory: the served bank (19 MB of JSON) parsed into Python dicts is several times its size (assumption: 100-200 MB RSS; not
measured). On the 7 GB shared VM, load it once per process and do not run several worker processes that each hold a copy
(or load banks lazily / use `msgspec` structs). Measure in lane 0.

---

## 7. Determinism: clocks, seeds, hashes

**Clocks.** The engine never reads the clock. Time arrives as `ctx.today` (a `'YYYY-MM-DD'` local date), `ctx.nowIso`, `ctx.tz`, or a
`now` argument (ms epoch or `Date`). Date arithmetic is on UTC midnights (`dates.ts:8-39`), so the process zone never matters,
EXCEPT where `Date.parse` meets a date-time string with no zone (ECMAScript reads it as process-local time): `derive.ts:86` (`ageOn`,
`Date.parse(dob)`), `study.ts:14,20`, `changes.ts:30,62`, `unis-uz.ts:183`. Production runs with `TZ` unset = UTC
(`deploy/servercore/docker-compose.yml:8`), so the Python port must parse zone-less date-times as UTC and accept exactly what V8's
`Date.parse` accepts for the shapes that reach it (`YYYY-MM-DD` → UTC midnight; `YYYY-MM-DDTHH:mm[:ss[.sss]]` → local=UTC;
with `Z`/offset → that instant; anything else → NaN, which then flows on as NaN, e.g. `D.age = NaN`).
Zone work uses `Intl` (`dates.ts:13-27`): `localDateOf` (en-CA → `YYYY-MM-DD`), `zoneOffsetMin` (formatToParts, h23),
`zonedInstant` (two-pass offset fix, used by Double Brick Hour `study.ts:56`). Python: `zoneinfo` (+ the `tzdata` wheel pinned).
Asia/Tashkent is fixed +05:00 with no DST, so the risk sits only with other profile zones.

**Seeded generators (five, all must be bit-exact):**

| generator | where | used for | exactness needed |
|---|---|---|---|
| `hash(s, n)`: h=7; h=(h·31+c)>>>0 over **code points**, taking `charCodeAt(0)` of each (first UTF-16 unit) | util.ts:2 | player-card jitter `card.ts:26`; Double Brick Hour days/hours `study.ts:55-56` | card values shown; DBH slots stored |
| `fnv1a(s)`: FNV-1a 32-bit over **UTF-16 code units**, `Math.imul`, 8 hex | util.ts:4 | task ids (`tasks.ts:228`, `schedule/compose.ts:387`), constraints hash (`tasks.ts:189`, `compose.ts:148`), rules version (`rules.ts:123`) | **ids stored in the DB** |
| `rngFor(seed)`: FNV-1a (signed `Math.imul`, `>>>0` at the end) seeding **mulberry32, signed `\|0` variant** | content/family.ts:33-38 | math family instances: `instantiate(it, seed)` renders `drawValues(family, rngFor(it.id + "\|" + seed))` (`family.ts:200-203`); offline: blind/tags/backtranslate/edges | an in-flight run keeps only the seed (`src/server/content/bank.ts:193,213-215`) and re-renders on resume and on grading: **values, stems, options and key must be identical** |
| `rng(seed)`: mulberry32, **unsigned `>>>0` variant**, + Box-Muller `normals()` | admission/math.ts:57-70 | `atLeastOne` (10,000 draws, Gaussian copula) `admission/display.ts:58-63`, seeded by `seedOf(seedKey)` (FNV-1a, `math.ts:72`) | the list probability shown (and logged) |
| `rng(seed)` with `Math.round(seed*1000)` | tests/unit/engine/support/rng.ts, random-answers.ts | tests only | the fabricated corpus generator (§12) |

**Injected randomness** (production uses `crypto.randomInt`, `src/server/checks.ts:47`; `src/server/lessons/piece.ts:33` a seeded
byte stream): `checks.ts:210-214` option shuffle, `learner/quiz.ts:175-178,263,279` quiz shuffle, `cat/session.ts:108` pretest slot,
`:229,239,245` CAT tie-breaks and top-k pick. Not reproducible against production, but the Python port must **consume the callback the
same number of times in the same order** so a recorded tape replays (§12).

**Tokens** (`Deps.token`, `checks.ts:221` dedup loop): injected; tape-replayed.

**Stable sort.** V8's `Array.prototype.sort` is a stable TimSort (port of CPython's listsort); Python `sorted` is stable TimSort, so
consistent comparators give identical orders. Comparators that can return NaN (`a.d - b.d` with NaN, none found in date paths) are the
only place the two could diverge.

---

## 8. What must be byte-identical (or the cutover changes what students see or what the DB holds)

1. **Task ids** `t_<date>_<slot>_<first 6 hex of fnv1a(template + "|" + title_en)>` (`tasks.ts:228`, `schedule/compose.ts:387`) and
   **`constraints_hash`** = `fnv1a(JSON.stringify([cad, phone, stage, engineVersion]))` (`tasks.ts:189`) /
   `fnv1a(JSON.stringify([cad, phone, stage, engineVersion, 'x', plan.factor, plan.pace, state.split]))` (`compose.ts:148`): the
   JSON text is hashed, so key order of `cad` (`{activeDays, restDays, dailyCapMin, load, examBlock}`, built at `tasks.ts:83`, type `types.ts:83`), number
   formatting (`1` not `1.0`, `0.6`), `true/false`, no spaces must match V8's `JSON.stringify` exactly.
2. **`rules_version`** = `r1-` + fnv1a of the sorted `id@version` list (`rules.ts:107-123`), stamped on every result/roadmap/batch.
3. **Version constants** stored with every row: `ENGINE_VERSION = 'p1-1.0.0'` (`version.ts:2`; "a new version re-plans at the
   student's next commit": changing it at cutover would re-plan everyone), `MODEL_VERSION`/`SPEC_VERSION` (`admission/predict.ts:24,45`),
   `READINESS_VERSION`/`SCALE_VERSION` (`readiness.ts:48,50`), `STRATEGY_VERSION = 1` (`strategy/schema.ts:20`), `STATE_TEST_VERSION`
   (`uz-records.ts:61`), `FROZEN_VERSION = '4.3'` (`admission/freeze.ts:12`). Keep every one unchanged.
4. **Milestone ids**, incl. those made from deadline names: `m_${id}_${d.name.replace(/\W+/g, '_').slice(0, 24)}` (`plan.ts:294`;
   JS `\W` is ASCII-only), `rm_${profileVersion}` (`plan.ts:149`), `m_en_${level}`, route step ids `m_${id}_${step}` (`plan.ts:317`).
5. **Family instances** (values, key, distractors, rendered stems/options/whys in en/uz/ru) for a given `(item.id, seed)`
   (`content/family.ts:33-203`), including `fmtNum` (`toPrecision(12)` / `toFixed(decimals)` → `String(Number(..))`, `family.ts:86-92`),
   `showNumber` grouping and U+2212 minus (`content/numbers.ts`), Russian counted forms (`family.ts:108-121`).
6. **Coin amounts** (ledger): `coinsFor`/`taskCoins` (`coins.ts:8-33`) use `Math.round` (half toward +∞); `study.ts:16` bricks;
   `lessons/sat-full.ts:222` `satFullCoins`; endings' coin rules (`endings.ts:25-78`).
7. **State JSON the engine writes and later reads back**: `Run` (`checks.ts:101`), `CatState`/`CatAnswer` (`cat/session.ts:25-70`),
   `SrsState` (`learner/srs.ts:15-19`, ts-fsrs field names, `state` 0-3 incl. New=0), `StreakState` (`streak.ts:10`), `SchedState`
   (`schedule/adapt.ts:25`), `SkillState` (`lessons/levels.ts:39`), `StoredStrategy` (`strategy/schema.ts:93`), roadmap/scorecard/
   feasibility/derived/card (`types.ts`). A run started on Node must finish on Python and vice versa: same field names, same
   optional-field omission (JS omits `undefined` keys; Python must omit, never write `null`).
8. **The admission model's numbers** (frozen v4.3): `p_mid`, bands, `shown`, the `atLeastOne` list number, `predictionFacts`.
   `FROZEN_HASH` (`admission/freeze.ts:19`) is a sha256 over the **TypeScript** files; the Python port needs its own freeze record
   (hash of the Python model files + the same two JSON files) plus a recorded parity proof against v4.3 (§13).
9. **Every student-facing string** (titles, `why`, sentences, numbers inside them) in en/uz/ru: the design fidelity gate compares
   rendered pages, so a `6` that becomes `6.0`, a `$12,000` that becomes `$12000`, or a plural form that changes is a visible change.


---

## 9. Existing tests per module

Totals: 350 test files / 3,722 cases import an engine module (of 604 / 5,594 unit files/cases). Direct importers per module are in
the §3 table; barrel importers: `@/engine` 190 files, `@/engine/strategy` 44, `@/engine/schedule` 30, `@/engine/cat` 17,
`@/engine/admission` 8. Modules no test imports directly (covered only through a barrel or a caller): admission/display, app-check,
capacity, card, cat/{config,irt,read,report,session} (via `@/engine/cat`), catalog, changes, feasibility, flags, guardrails, narrate,
pipeline, schedule/{adapt,compose,english,providers,simulate} (via `@/engine/schedule`), score, strategy/{capacity,copy,fallback,field,
fit,gaps,gate,place,schema,testplan,validators/*} (via `@/engine/strategy`), study, teachers, util, version.

Suites that are already parity or golden tests, to reuse as fixture sources:

| suite | what it pins | fixtures |
|---|---|---|
| `tests/unit/engine/parity.test.ts` | `runPipeline`, `generateWeek`, `playerCard` vs the design mock, with an owner-approved allow-list | `tests/fixtures/engine/design-mock/{design-mock.json,allow-list.json}` |
| `tests/unit/engine/personas.test.ts` (208 lines) | persona P1-P6 + teen walks through the pipeline | `tests/fixtures/personas/{P1..P6,teen}` |
| `tests/unit/engine/checks-parity.test.ts` (218 lines) | the server's `checks.ts` against the page's own check code, same answers → same questions, seconds, results | `data/check_items.json` |
| `tests/unit/engine/admission-freeze.test.ts` | sha256 of the frozen model files = `FROZEN_HASH` | `admission/freeze.ts:14-19` |
| `tests/unit/phase-x/phase-x-sim.test.ts`, `phase-x-gate.test.ts` | golden personas S1-S4 over 8 simulated weeks (`schedule/simulate.ts`) | in-test |
| `tests/unit/engine/quiz-order-stable.test.ts` | one run shows one option order for its life | in-test |
| property tests with `randomAnswers(seed)` (`tests/unit/engine/support/random-answers.ts`, mulberry32): `guardrails`, `readiness`, `admission-model`, ailayer `caps`, `inputs`, `plan-input` … | invariants over seeded random answer maps | generator |
| `tests/unit/content/*` (58 files) | content corpus: schema, keys, families, numbers, typed answers, no-content-leak | the corpus itself |
| `strategy-v1` … `strategy-v16`, `strategy-gate`, `strategy-fallback` | every validator | `tests/unit/engine/support/strategy-kit.ts` |

Test context helper: `ctxAt(today, nowIso = today+'T07:00:00.000Z')` with the seed snapshot, tz Asia/Tashkent
(`tests/unit/engine/support/fixtures.ts:22-26`); personas assume today = 2026-09-24.

---

## 10. JavaScript semantics that bite in Python (each with evidence and the rule for the port)

All rules below go into one small library, **`jsrt`** (lane 0), and a CI lint forbids the raw Python constructs they replace.

1. **`Math.round`** (65 sites) rounds half toward +∞ (`Math.round(2.5)=3`, `Math.round(-2.5)=-2`, `Math.round(0.49999999999999994)=0`);
   Python `round()` is banker's (`round(2.5)=2`) and `math.floor(x+0.5)` is wrong at 0.49999999999999994. `jsrt.round(x)`:
   non-finite → x; `r = floor(x)`; `r+1 if x-r >= 0.5 else r` (the subtraction is exact), returned as a float, `-0` kept.
   Money/ledger and stored values ride on it: `coins.ts:11,13` (coin credits), `study.ts:16` (bricks), `tasks.ts:82,86`
   (`dailyCapMin`, `dayBudget` → est. minutes and the constraints hash), `card.ts:23-33`, `i18n/index.ts:54` (`usd`),
   `content/formula.ts:18,23` (`gcd`, `round(x,d)` with `+sign·1e-9`), `cat/report.ts:40,244`, `admission/predict.ts:68,318`,
   `admission/us.ts:32`, `admission/uzcut.ts:65`, `dates.ts:20,35`, `changes.ts:30,62`, `checks.ts:249,252,309,362`.
2. **Number → string** (1,209 template literals, 202 `String(`, `i18n/index.ts:25` fill `String(p[k])`, `content/family.ts:40`
   `decimalsOf(String(x))`): JS prints `6` (Python `6.0`), `1e-7` (Python `1e-07`), `1e+21` and switches to exponent only at ≥1e21 or
   <1e-6 (Python repr at 1e16 / 1e-4), `-0` → `0`, `NaN`, `Infinity`. Shortest round-trip digits are the same in both, so
   `jsrt.num_str(x)` re-lays-out `repr(x)` per ECMA-262 Number::toString. Every number that reaches a string goes through it
   (a `hours * 0.9` or a `Math.round` result is a float in Python).
3. **`toFixed`** (19) / **`toPrecision`** (5): JS takes the larger candidate on an exact tie of the exact binary value (half away
   from zero), `String(x)` at |x| ≥ 1e21; `toPrecision` goes exponential when e < -6 or e ≥ p. Python `format(x,'.1f')` is half-even
   (`format(0.5,'.0f')='0'` vs `(0.5).toFixed(0)='1'`; `2.5`→`2` vs `3`; `1.25`→`1.2` vs `1.3`; `-2.5`→`-2` vs `-3`).
   `jsrt.to_fixed` = `Decimal(x).quantize(…, ROUND_HALF_UP)` on the exact binary value. Sites: `plan.ts:95,269` (IELTS "6.0"),
   `unis-uz.ts:93,170,190,197,200,241`, `cat/report.ts:89`, `content/family.ts:51,57` (**family parameter values**), `:88` (`fmtNum`:
   `toPrecision(12)`), `schedule/facts.ts:89`, `lessons/sat-full.ts:191`.
4. **`Intl`**: `usd()` en uses `toLocaleString('en-US')` (`i18n/index.ts:54`): `,` grouping, ≤3 fraction digits, ICU half-expand on the
   *shortest* decimal (not the exact binary: unlike item 3). `Intl.PluralRules` en/uz/ru (`i18n/index.ts:16,29-31`): implement CLDR
   (en one: i=1 ∧ v=0; uz one: n=1; ru one/few/many/other on i, v) over the JS decimal string of n. `fmtMonth`/`fmtDay`
   (`dates.ts:41,43`): "Nov 2028", "Nov 1, 2028" (en-US short months, UTC). `localDateOf`/`zoneOffsetMin` (`dates.ts:13-21`): zoneinfo.
5. **Python raises where JS yields a value**: `x/0` (JS ±Infinity/NaN), `math.floor/ceil(inf|nan)`, `int(nan)`, `math.log(0)`
   (JS -Infinity), `math.sqrt(-1)` (JS NaN), `(-8)**(1/3)` (Python returns a **complex**, JS NaN; `content/formula.ts:127` `a ** b`),
   `max([])` (JS `Math.max()` = -Infinity; `plan.ts:214` `Math.max(-1, ...olympiads)`), `min/max` with NaN (JS NaN, Python order-
   dependent; `feasibility.ts:73` `Math.min(...tracks.map(...))`). JS `%` is the truncated remainder = `math.fmod`, Python `%` is
   floored (`content/formula.ts:126` `((a % b) + b) % b`, `dates.ts:34`, `content/family.ts:110-111`, `util.ts:2`). `Math.floor(a/b)`
   must stay `floor(a/b)`, never `a//b` (`1//0.1 == 9.0` but `Math.floor(1/0.1) == 10`). `jsrt.math` wraps every `Math.*`.
6. **Transcendental functions.** V8 computes `Math.exp/log/sin/cos/tan/atan/asin/acos/log2/log10/cbrt/…` with its own fdlibm-derived
   code; CPython calls glibc's libm. Results may differ by an ulp for some inputs. Used in `cat/irt.ts` (logistic and log-likelihood on
   a 181-point grid, EAP), `admission/math.ts` (`sig`, erfc, `PhiInv`, Box-Muller over 10,000 draws), `content/formula.ts:20-28`
   (`sqrt cbrt exp ln log10 log2 sin cos tan asin acos atan hypot **`; degrees via `D = Math.PI/180`, `:17`), `learner/elo.ts`,
   ts-fsrs. `+ − × ÷ sqrt` are correctly rounded in both (bit-equal). Policy: the harness counts ulp drift per path; a flipped
   *discrete* outcome (argmax item, a `<` in the copula, a rounding boundary, a family constraint) triggers porting that one V8
   routine (`v8/src/base/ieee754.cc`) to pure Python. Budgeted in lane H.
7. **Summation order.** `reduce((n, v) => n + v, 0)` is plain left-to-right (`cat/irt.ts:58,64,94-96`, `admission/math.ts:42,48`).
   **CPython ≥ 3.12 `sum()` of floats uses Neumaier compensated summation**, so `sum(xs)` ≠ JS. Use an explicit loop; never `math.fsum`,
   numpy reductions (pairwise) or numpy ufuncs (own SIMD exp/log).
8. **Strings are UTF-16 in JS.** `.length`, `.slice`, `charCodeAt`, `.at()` count code units; Python counts code points: differs for
   astral characters (emoji; `data/check_items.json` has two, and any student-typed text can). Sites that measure or cut text:
   `verify/artifact.ts:29-33`, `checks.ts:136`, `branch.ts:93` (`v.length > 5000`), `answers.ts:137` (`.slice(0, 60)`),
   `content/typed.ts`. `fnv1a` hashes UTF-16 units (`s.encode('utf-16-le')`), `hash` takes the first unit of each code point.
   * `trim()` (73 sites): JS strips U+FEFF, NBSP, U+1680, U+2000-200A, U+2028/2029, U+202F, U+205F, U+3000 but not U+001C-001F or
     U+0085; Python `strip()` is the reverse on those. `jsrt.trim`.
   * `replace(string, string)` replaces only the **first** occurrence (23 sites: `admission/inputs.ts:31,109`, `answers.ts:69,122,168`,
     `cat/report.ts:89`, `cat/scale.ts:85`, `content/numbers.ts:44`, `derive.ts:117`, `flags.ts:14`, `lessons/sat-full.ts:164,183`,
     `readiness.ts:125,220,267`, `schedule/steps.ts:452`, `score.ts:31`, `strategy/month.ts:216`, `strategy/step-why.ts:61`,
     `teachers.ts:62`, `unis-uz.ts:79,242,244`) → `s.replace(a, b, 1)`. `$&`/`$1`/`$$` in a JS replacement string are special.
   * Default `.sort()` (27 sites) compares UTF-16 units (key `s.encode('utf-16-be')`), stringifies numbers, puts `undefined` last;
     `a < b` on strings is UTF-16 order too (`learner/quiz.ts:259,276`, date strings everywhere). ASCII: same as Python.
   * `localeCompare` (28 sites) is ICU collation (tertiary, punctuation not ignored, lowercase before uppercase, `_` < `-` < `,` <
     `.` < digits < letters), not ordinal. 20 sites compare `YYYY-MM-DD` (= ordinal). Non-date: `schedule/allocate.ts:115`,
     `strategy/catalogs.ts:148`, `strategy/place.ts:85` (ids), `strategy/fit.ts:71` (route codes), `rules-expiry.ts:107` (sentences),
     `plan.ts:385` (date or `'9999'`), offline `content/edges.ts:78`, `content/tags.ts:34`. `jsrt.locale_compare`: an exact ICU-root
     table for ASCII, PyICU (or a hard error) for anything else; fuzzed against Node.
   * `toUpperCase/toLowerCase/normalize` (`content/instructions.ts:15`, `content/scan.ts:82,85`, `content/text.ts:11`,
     `content/typed.ts:22-61`, `content/validate.ts:192`): same algorithms; Unicode 15.0 (Python 3.12) vs 15.1 (Node 22 ICU 74).
9. **Objects.** JS iterates integer-like keys first (ascending), then insertion order; Python dicts keep insertion order only.
   Matters for `Object.keys/values/entries`, spreads and `JSON.stringify` over data with such keys (§6) and over Postgres `jsonb`
   (jsonb orders keys by length then bytes; node-postgres hands JS objects that JS then reorders). `jsrt.load_json` reorders on load
   (`object_pairs_hook`), `jsrt.obj()` for objects built from data keys.
   * `undefined` ≠ missing ≠ `null`: `effectiveAnswers` (`score.ts:103-107`) lets a parent answer of `null` override (`v !== undefined`);
     `JSON.stringify` drops `undefined` members; `{...o, k: undefined}` keeps `k` until serialised. Python: absence = no key, never
     `None`; a `jsrt.UNDEF` sentinel only for value slots; `x ?? y` treats `None`/UNDEF/absent alike; `=== undefined` reads ⇒ `k in d`.
   * `util.clone` (`util.ts:5`) = JSON round-trip (drops undefined, NaN→null): copy via `jsrt.json`, not `copy.deepcopy`.
10. **Truthiness and coercion** over loosely typed JSON answers (927 `||`, 1,207 `??`/`?.`, 255 `typeof`):
    * falsy = `false 0 -0 NaN "" null undefined`; **`[]` and `{}` are truthy in JS, falsy in Python**; NaN is falsy in JS, truthy in
      Python. `jsrt.truthy` / `jsrt.or_` for every `if (x)`, `x || d`, `!!x`, `x && y` on JSON data (e.g. `derive.ts:112`,
      `card.ts:22,32`, `cat/session.ts:259` `...(it.a ? { a } : {})`).
    * `typeof v === 'number'` ⇔ `isinstance(v,(int,float)) and not isinstance(v,bool)`; `True == 1` in Python, `true !== 1` in JS;
      `[1].includes(true)` false vs `True in [1]` true → `jsrt.same_value_zero` for `includes/indexOf/Set` on mixed values
      (`answers.ts:145` `t.official === true || t.official === 'true'`, `verified === true` throughout `answers.ts`).
    * `Number(x)`/unary `+`: `+""`=0, `+" 12 "`=12, `+"0x1A"`=26, `+"12abc"`=NaN, `+null`=0, `+true`=1, `+[5]`=5, `+[]`=0,
      `+undefined`=NaN. `parseFloat`: longest numeric prefix, accepts "Infinity". `parseInt(x,10)`: `String(x)` first (9.7→9,
      1e21→1). Hot path: answers are typed loosely by the pages (`"m1_grade": "9"`, `"m9_hours_per_week": "10"`):
      `derive.ts:102` `parseInt(A.m1_grade, 10)`, `capacity.ts:30` `+A.m9_hours_per_week || 6`, `score.ts:32`.
    * `String(x)` of non-strings: arrays `a,b` (nested flattened), objects `[object Object]`, `null`, `undefined`.
    * The bank's branch language uses loose `==` and `<` on mixed types (`branch.ts:14-18,37`): `"9" == 9` true, `"10" < "9"` true,
      `"10" < 9` false. `jsrt.loose_eq` / `jsrt.lt` per ECMA-262 IsLooselyEqual / IsLessThan.
11. **Regex** (488 literals) → a transpiler `jsrt.re` targeting the `regex` package (`\p{L}`, `\p{Script=Cyrillic}`, variable look-behind):
    `\d`→`[0-9]`, `\w`→`[A-Za-z0-9_]`, `\W`→`[^A-Za-z0-9_]`, `\b`/`\B` on ASCII word chars (JS stays ASCII even with `u`; Python is
    Unicode) — `plan.ts:294` makes stored milestone ids with `\W+`; `\s` → JS whitespace class; `$` (no `m`) → `\Z` (Python `$` also
    matches before a final `\n`: the date shape check `branch.ts:60` would accept `"2026-10-21\n"`); `.` → `[^\n\r  ]`;
    sticky `y` (`content/formula.ts:37`) → `pattern.match(src, pos)`. Verified: no module-level `/g` regex is reused with
    `.test()/.exec()` (no `lastIndex` state to emulate). Replace callbacks get `undefined` for unmatched groups (stringifies as
    `"undefined"` in a template).
12. **Dates.** `toISOString()` is always `YYYY-MM-DDTHH:mm:ss.sssZ` (Python `isoformat()` is not). `Date.UTC` normalises overflow
    (`derive.ts:75` day 0 = last day of the previous month; `dates.ts:28-30` `addDays`/`addMonths` roll over: 31 Jan + 1 month =
    3 Mar, or 2 Mar in a leap year) while Python `date()` raises: implement on day ordinals. `getUTCDay()` 0 = Sunday (Python
    `weekday()` 0 = Monday). Constants stay: month = 2,629,800,000 ms (`changes.ts:30,62`), year = 31,557,600,000 ms (`derive.ts:86`).
13. **`JSON.stringify`** (hash inputs, `clone`): no spaces, JS number text, raw non-ASCII, `undefined`/functions dropped,
    NaN/±Infinity → `null`, `-0` → `0`, lone surrogates as `\udXXX`, keys in JS order. `jsrt.json_stringify`; Python `json.dumps`
    defaults differ on all of spaces, `NaN`, `1.0`.
14. **zod v4.** `safeParse` decides which items the server serves (`content/validate.ts:155-167`: `.strict()`, unknown keys stripped and
    re-parsed, refinements) and produces strategy V1 errors whose `path`, `code` and `message` reach the AI repair prompt
    (`strategy/validators/v1.ts:9-20`). Pydantic's messages and issue order differ. Content: hand-port the schema as explicit checks
    and gate on the identical accepted-id set and parsed values. Strategy: a ~200-line zod-v4-compatible checker for this one fixed
    shape reproducing `code/path/message` for the issue kinds it can raise, golden-tested with invalid strategies.
15. **ts-fsrs 5.4.1** (`learner/srs.ts:8-33`, `package-lock.json:3349-3350`; `request_retention 0.9`, `enable_fuzz false`, Good/Again,
    `get_retrievability(card, now, false)`): py-fsrs is not a drop-in (no `New` state, `step` not `learning_steps`, other defaults).
    Port the ts-fsrs 5.4.1 code path (FSRS-6 default weights, short-term steps, interval rounding, due-date math) and keep the stored
    field names (`elapsed_days`, `scheduled_days`, `learning_steps`, `state` 0-3).
16. **Exceptions are control flow**: `FamilyError`, `FormulaError` ⊃ `FormulaSyntaxError` (`content/family.ts:67-69` swallows the parent,
    rethrows the subclass), `UnknownBranch` (`branch.ts:20`), `copy: no "key"` (`i18n/index.ts:22`); the server maps them
    (`src/server/content/bank.ts:243`). Keep classes and messages.
17. **Integers and bits.** One JS number type vs Python int/float: `>>>`, `|0`, `Math.imul` need explicit u32/i32/imul helpers
    (`util.ts:2-4`, `content/family.ts:33-37`, `admission/math.ts:57-72`); the two mulberry32 variants differ in where they wrap.
    `Number.isInteger(2.0)` ⇔ `float.is_integer()`; output JSON must print `2`, not `2.0`.

---

## 11. Port plan

**Target layout.** The backend skeleton lane already exists (worktree `C:/Users/PC/jg-p4g-3`, branch `mig-backend-skel`, see
`mig-backend-skel.md`): CPython 3.11 (as the Whisper image, `deploy/servercore/whisper/Dockerfile:6`), `backend/app/`, a JS-compat
module `backend/app/jsx.py` (today only `js_iso`, line 7) and `backend/app/engine/context.py` (request context). There
`app/engine/` mirrors the server glue `src/server/engine`; the pure engine (`src/engine`) goes in a separate package
`app/jg_engine/` so the two never mix, and **its JS kit is `jsx` grown into a package** (one JS-compat library for routes and
engine, not two).
Extra wheels: `regex`, `tzdata`; no numpy on the parity path. (On 3.11 the builtin `sum()` is still naive, but §10 item 7 applies
anyway: a later Python upgrade would silently change results.)

```
backend/app/jsx/          (grown from backend/app/jsx.py; "jsrt" below means this package)
backend/app/jg_engine/
  jsrt/ = app/jsx/  num.py (num_str, to_fixed, to_precision, round, to_number, parse_float, parse_int, truthy, loose_eq, lt, same_value_zero)
               text.py (u16 len/slice, trim, replace_first, to_str) · re.py (JS→regex transpiler + cache) · sort.py (default, cmp, locale_compare)
               jsjson.py (load_json with JS key order, json_stringify, UNDEF) · dates.py (Date.UTC, Date.parse subset, toISOString)
               intl.py (plural rules en/uz/ru, en-US toLocaleString, fmtMonth/fmtDay) · mathjs.py (Math.* edge semantics, fdlibm fallbacks)
               bits.py (u32/i32/imul, fnv1a, hash, mulberry32 unsigned + signed, Box-Muller)
  data.py      one loader for src/engine/data/** and i18n/*.json (shared files, not copies), cached per process
  <one .py per TS module, same relative path, same export names>
tests/golden/  parity runner (pytest) + fixture index
```

Rules: mirror the TS 1:1 (file per module, function per export, same names, so the harness maps `module.export` automatically);
values stay plain `dict`/`list` (JSON-shaped; keeps key order and absent-vs-null; stored JSON round-trips) with TypedDicts for
documentation only; Pydantic only at the FastAPI boundary; callbacks (`random`, `token`, `now`, `rate`) stay parameters; the two
module setters (`tasks.ts:103-104`, `schedule/steps.ts:546-547`) become an explicit context the server passes (async-safe); inline copy
tables (`admission/copy.ts`, `phase-d-copy.ts`, `schedule/copy.ts`, `strategy/copy.ts`, `verify/words.ts`, `copy.ts`) are exported once
to JSON by a Node script and then loaded by both runtimes, so copy cannot drift during the mixed period; a CI lint bans bare `round(`,
`str(<float>)`, f-strings with numbers, `re.`, `sorted(` without a jsrt key, `sum(` over floats, `json.dumps` in `jg_engine/`.

Move `QUIZ`/`quizPassMark` (`tasks.ts:20-27`) into a leaf module in the Python layout so `checks` does not wait for the whole planner
spine (`checks → tasks → schedule/steps → plan → readiness → admission`).

**Lanes** (leaves first; agent-day = one agent, ~8 focused hours; estimates include the module's golden suite going green):

| lane | modules | depends on | agent-days |
|---|---|---|---|
| 0 kit + harness (start first, 2 agents) | `jsrt/*`, `data.py`, TS recorder, tagged-JSON format, Python runner, fabricated-corpus driver, CI | — | 6 |
| A1 core leaves | util, version, dates, i18n, ladders, labels, bank, rules (+version hash), rules-expiry, answers, branch, uz-records, coins, streak, study, endings, too-fast, teachers, copy, verify/* | 0 | 4 |
| A2 pipeline core | derive, way, goal, profile, catalog, required-tests, score, flags, capacity, feasibility, unis-uz, app-check, card, changes, narrate, guardrails | A1, B (types only) | 5 |
| A3 planner spine | readiness, plan, schedule/steps (+facts, english, providers), tasks, pipeline | A2, B, D (keycheck, format, family.isChoice, schema) | 5 |
| B admission v4.3 | admission/math, us, uzcut, inputs, predict, display, copy, moves, port, Python freeze record | A1 (answers, labels, i18n), C (cat/read) | 3 |
| C CAT + checks | cat/irt, config, scale, session, report, read; checks (QUIZ split out) | A1 | 4 |
| D content runtime | content/schema (explicit validators), catalog, clips, read, numbers, formula, family, format, typed, instructions, keycheck, text (subset), validate.`load` + `SERVED_STATUSES` | 0 | 4 |
| E learner, lessons, Phase D | learner/elo, quiz, srs (ts-fsrs 5.4.1 port); lessons/levels, turns, unit-test, mock, sat-full, dtm-mock; phase-d, phase-d-copy | A1, D; phase-d needs A3 (tasks) | 5 |
| F schedule (Phase X) | adapt, streak, dtm, copy, allocate, compose, forward, simulate, lessons/exam-days | A3, D, G (strategy/schema, capacity, fallback) | 5 |
| G strategy | schema (+ zod-compatible V1 checker), gaps, field, copy, dated, catalogs, capacity, place, testplan, fallback, fit, validators v1-v16 + core, gate, today, month, truth, way-view, uni-rows, step-why, week-goals, route-word | A3, B, D | 7 |
| H numerics | V8 fdlibm routines where the harness shows a discrete flip; profiling (CAT, copula, bank boot memory) | B, C, D | 2 |
| I shadow + cutover | production shadow comparison, diff triage, version/freeze records, rollback drill | all | 3 |
| **total** | | | **53** (range 45-60) |

Not in the 53: the offline content tools (`content/{solver,solve-stem,family-check,reconcile,blind,tags,backtranslate,edges}.ts` and the
full `validate()` report) stay in TypeScript, run by `scripts/content/*` with Node in CI only (+6 agent-days if they must move later);
porting the 3,722 vitest cases to pytest (the golden corpus replaces them as the parity gate; each lane writes targeted pytest for the
invariants the owner has ruled on, inside its estimate).

Critical path: 0 → A1 → A2 → A3 → G → F → I. With six agents in parallel after lane 0, about 3-4 calendar weeks including a
production shadow of at least 7 days (one full Monday-Sunday task week plus a Phase D day boundary in Tashkent).

---

## 12. Golden-parity harness

**Principle:** the TypeScript engine is the oracle. Every exported function is called on recorded and fabricated inputs, inputs and
outputs are stored as fixtures, and the Python function must reproduce every output **exactly**: same JSON structure, same key order,
same strings byte for byte, same booleans, same absent-vs-null, same numbers bit for bit, except on paths explicitly allow-listed as
transcendental-derived floats (§12.5).

### 12.1 Recorder (TypeScript side)

* Runs on **Node 22 in `node:22-bookworm-slim`**, the production image (`deploy/servercore/docker-compose.yml:11`). This PC has Node 24
  and no Docker (`mig-backend-skel.md:28`), so record either with a portable Node 22 build here or in that image on the ServerCore box.
  Math routines are stable across V8 versions but ICU (plurals, `toLocale*`, collation) is pinned by the image.
* A Vite/vitest transform (`RECORD=1`) rewrites every `src/engine/**/*.ts` export: `export function f(...)` keeps its body as `f__impl`
  and gains a hoisted wrapper `export function f(...a) { return __rec('module', 'f', f__impl, a) }`; `export const f = (…) =>` likewise.
  The source tree is copied to a scratch dir first; jg-plan is never touched.
* `__rec` stores: module, export, call depth, the args **deep-cloned before the call**, the return value (or thrown class + message),
  the args **after** the call when they changed (in-place mutators §2), the module-state context (`courseLabels()`, whether a lesson
  resolver is set), and a **tape** per callback arg: every function-typed argument (`random`, `token`, `now`, `rate`, `f` of `bisect`)
  is wrapped to log the values it returned, in order.
* **Tagged JSON** (lossless JS values): plain objects keep JS key order; `{"$u":1}` undefined; `{"$n":"NaN"|"Infinity"|"-Infinity"|"-0"}`;
  `{"$d":"<ISO>"}` Date; `{"$set":[…]}`, `{"$map":[[k,v],…]}`; `{"$fn":"tape:<i>"}`; `{"$err":{"name","message"}}`; numbers printed
  with JS `String(n)` (shortest round trip, so the Python side parses the identical double).
* Dedup by sha256 of `(module, export, args)`; cap per export (5,000 for entry points §4, 500 for leaves), keep depth-0 calls always
  and nested calls sampled (they localise a divergence to the inner function).

### 12.2 Fixture sources

| source | how | volume (planned) | PII |
|---|---|---|---|
| a. existing suites | run the 350 engine-touching vitest files under the recorder (DB-backed `engine-server` tests against the test DB as today) | every call those 3,722 cases make | none (fabricated) |
| b. fabricated pipeline corpus | `randomAnswers(seed)` (`tests/unit/engine/support/random-answers.ts`) widened to every bank question/option, "skipped", strings-vs-numbers, `5,5` commas, empty arrays/objects, junk strings, astral/Cyrillic/U+02BB text; × `today` across year ends, 29 Feb 2028, Monday/Sunday, 00:00-04:59 Tashkent; × lang en/uz/ru; then the server's call sequences: `runPipeline` → `generateWeek` (8 weeks) → strategy (`strategyInputOf` → `fallbackStrategy` → `strategyGate`) → `allocateWeek`/`composeWeek`/`simulate` (8 weeks) → roadmap views → `readinessOf`/`admissionFor`/`displayOf`/`listLine` → `unisUz` → Phase D days → `whatChanged` between consecutive recomputes | 20,000 seeds × 3 langs × 4 dates (assumption: 2-5 ms per pipeline on Node → under an hour; run in the background in chunks) | none |
| c. state machines with simulated students | checks runs (English/math/reading/quizzes) and CAT sessions to completion with a simulated θ, scripted `random`/`token`/`now`, holds, stops, reopen/resume, too-fast timings; learner quizzes + Elo + FSRS review sequences over 120 simulated days; lesson sittings, SAT full, DTM mock scoring | 50,000 runs | none |
| d. content | every family (491) × 200 seeds × en/uz/ru: `instantiate`, `whyOf`, `fillOption`, grading of typed/numeric answers; `load()` over the real corpus (accepted ids, parsed items, findings codes); `keyCheckOf`, `formatOf`, `shownInstruction` for all 6,949 items | ~300,000 instances | none |
| e. jsrt fuzz | 10⁶ random doubles (incl. ties like k+0.5, k/10, subnormals, ±0, 1e±21 edges) through `String`, `toFixed(0..3)`, `toPrecision(12)`, `Math.round`, `JSON.stringify`, `toLocaleString`; random strings (ASCII ids, Uzbek with U+02BB/U+02BC, Cyrillic, NBSP, ZWJ, emoji) through `trim`, case, `normalize`, `localeCompare`, default sort, `fnv1a`, `hash`, every engine regex literal's `test/exec/replace` | 10⁶ cases | none |
| f. production (recorded) | **on the server box only**: restore the daily `pg_dump` into a sandbox DB, replay every student's stored answers + ctx (as of the stored `computed_at`, stored rules version) through both engines, and every in-flight `check_run.data` / CAT state through `resume`/`nextItem` with a fixed tape; only diff summaries (module, path, hash) leave the box | all students | stays on the box; never committed, never copied to a PC |
| g. production shadow | the Python engine deployed dark next to Node; the Node server sends each entry-point call's (input, output) to it on the box network; Python recomputes and logs diffs only | ≥ 7 days | logs contain paths and hashes, no values |

Fixtures from a-e are committed (zstd JSONL under `tests/golden/fixtures/<module>/<export>.jsonl.zst`, or LFS if large); f and g
never leave the server.

### 12.3 Python runner

pytest parametrised per fixture line: rebuild args from tagged JSON, replace `{"$fn":"tape:i"}` with a replayer that returns the recorded
values in order and **fails if the Python code calls it more or fewer times**, set the module-state context, call `jg_engine.<module>.<export>`,
serialise the result (and mutated args) back to tagged JSON in JS key order, compare. Each lane runs only its modules' fixtures; CI runs all.
Report: per export, fixtures passed / failed / skipped, first diff path with both values.

### 12.4 Must be byte-identical (no tolerance)

All of §8; plus every string (UTF-8 bytes, no normalisation applied by either side), ids, hashes, dates, booleans, absent-vs-null,
array order (incl. seeded shuffles given the same tape), key order, integers and every float that is (a) stored, (b) turned into a
string, (c) compared or rounded downstream, unless listed in 12.5. Thrown errors: same class and message.

### 12.5 Tolerances (allow-list, reviewed)

Only internal floats derived from `exp/log/sin/cos/tan/atan/pow/cbrt/hypot` may differ, by ≤ 4 ulp (or relative 1e-13), and only on
paths named in `tests/golden/tolerance.yml` (expected: CAT posterior weights `w`, `theta`, `se` before rounding; `p3`/`info` values;
admission `p` before `shown`; FSRS stability/difficulty before rounding). For each such path the derived discrete outputs (chosen item,
`shown`, level, due date, `p` rounded as displayed) must still be identical. Any discrete flip is a failure and is fixed by porting the
V8 routine (lane H), never by widening a tolerance.

### 12.6 Gates

* Per lane: 100 % of its exports' fixtures pass; no export without fixtures (the recorder's coverage report lists exports never called:
  those get fabricated calls).
* Before any production traffic: all of a-e green; f run on the latest dump with 0 diffs on discrete outputs.
* Cutover: g ≥ 7 days with 0 discrete diffs; tolerance-path drift reported.
* After cutover: the TS engine and its recorder stay runnable in CI until Python owns every module for a month (oracle for regressions).

---

## 13. Engine-specific cutover notes

* Keep every version constant (§8.3). `ENGINE_VERSION` must not change at cutover (a change re-plans every student at the next commit).
* `rules_version` must hash to the same `r1-…` from the same `rule_record` rows (fixture: `snapshotFromRecords` over the production rows).
* In-flight state written by Node is read by Python and the reverse: `check_run.data` (`Run`, `CatState`, `ServedKey` seeds), `SrsState`,
  `streak_state`, schedule state, `roadmaps.strategy`. Fixture source f replays every live row; during a mixed period both runtimes
  must accept each other's JSON (omit `undefined`, never write `null` for an absent field, keep numbers JS-printed).
* A served family item is re-rendered from its seed on resume and grading (`src/server/content/bank.ts:213-215,302-304`): an instance
  that differs by one digit grades a right answer wrong. Content fixture d is a hard gate before any check traffic moves.
* The admission model is frozen (v4.3): record a Python freeze (sha256 over the Python model files + `specs.json` +
  `uz_programmes_2026.json`) beside the TS one, and log in `docs/ai/DECISIONS.md` that v4.3-py = v4.3 by the recorded parity, so no
  prediction logged after cutover counts as a new model version.
* The server's switches stay where they are: the engine reads no env; the FastAPI layer decides which engine functions to call
  (ENGINE_LIVE, PHASE_D, PHASE_X, LESSONS …), exactly as `src/server` does now.
* Process time zone: run the Python service with `TZ` unset/UTC, as Node runs (`docker-compose.yml:8`), and treat zone-less
  date-times as UTC in `jsrt.dates`.

---

## 14. Where I disagree, or would sequence it differently

1. **Do not put the engine port on the backend's critical path.** The engine has no I/O: it is JSON in, JSON out. The fastest safe
   route to "backend on FastAPI" is to run the existing TypeScript engine as a small **Node worker** (long-lived process on the box,
   JSON over a local socket or stdin; ~3-4 agent-days including a typed client), call it from FastAPI, and port the engine to Python
   lane by lane behind the golden harness, switching module families over one at a time once their fixtures and a shadow week are
   green. Zero parity risk on day one, the backend lanes are unblocked, and the 45-60 agent-day engine port stops gating the cutover.
   Cost: one more container (~100-150 MB, assumption) and Node stays on the box a while longer (it already does today).
2. **FastAPI over Django REST: agree** (async SSE chat, Pydantic at the API edge, Python already in use for Whisper). For the engine it
   does not matter: the engine must not use Pydantic models internally (§11), only plain JSON values.
3. **Keep the offline content tools in TypeScript** until there is a reason to move them; they never run per request.

---

## 15. Hard parts and risks (ranked)

1. **JS value semantics over loosely typed answers** (truthiness of `[]`/`{}`, `+x`/`parseInt`, loose `==`, undefined vs null) across
   ~3,000 expressions: the most likely source of silent differences. Mitigation: jsrt + lint + fabricated junk-answer corpus.
2. **Byte-identical ids and hashes** (task ids, constraints hash over `JSON.stringify`, rules version, milestone ids via ASCII `\W`).
3. **Family instances** (seeded mulberry32 signed variant, `toFixed`/`toPrecision(12)`, formula floats, ru plural forms): a mismatch
   mis-grades answers in flight.
4. **Number formatting everywhere** (1,209 template literals): `6.0` vs `6` would show on screens and break the fidelity gate.
5. **Transcendental ulp drift** in CAT, the admission copula and FSRS turning into discrete flips (rare; measured, fixed by fdlibm ports).
6. **zod parity** for the served-item set and V1 error texts.
7. **ts-fsrs port** (field names and the short-term scheduler path).
8. **Performance and memory in Python** (assumptions, to measure in lane 0): pipeline recompute and CAT steps tens of ms; `atLeastOne`
   (10,000 draws × universities) the slowest pure loop; the 19 MB bank as Python objects 100-200 MB per process.
9. **Copy drift** while two runtimes coexist: solved by exporting the inline TS copy tables to JSON once and loading the same files.

---

## 16. Open questions for the controller

1. Sidecar first (§14.1) or straight port? The estimate in §11 assumes a straight port; the sidecar adds ~3-4 agent-days and removes
   the engine from the cutover's critical path.
2. Is diverging zod *message text* in strategy V1 errors acceptable (codes and paths identical), or must the AI repair prompt see
   byte-identical messages? The plan assumes identical (zod-compatible checker).
3. Where may golden fixtures from sources a-e live: in the repo (zstd, a few hundred MB?) or LFS/an artifact store? Source f/g data
   never leaves the server box (privacy rule for students 10-19).
4. Docker is not installed on this PC (`mig-backend-skel.md:28`). Should lane 0 record with a portable Node 22 here, or in the production
   image on the ServerCore box in a sandbox directory (~5.7 GB disk free there)? Source f has to run on the box either way.
