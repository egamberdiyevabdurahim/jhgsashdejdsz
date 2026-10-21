# Engine API: every export with its type-checked signature

Companion to `inv-engine.md`. Generated read-only from `C:/Users/PC/jg-plan/src/engine` (m1-main `ddbf9d81`) with the TypeScript
type checker (21 Oct 2026): 676 exported functions and 420 exported values/classes in 137 modules (types and interfaces omitted; barrels
list nothing of their own). `line` is the declaration line in that module. Long types are cut with an ellipsis; read the source for the
full shape. The Python port keeps every export name so the golden harness can map `module.export` one to one.

### admission/copy.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `admT` | 77 | fn | `(lang: "en" \| "uz" \| "ru", key: string, p?: Record<string, string \| number>): string` |
| `ADM_COPY` | 8 | value | `Record<"en" \| "uz" \| "ru", Dict>` |

### admission/display.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `displayOf` | 24 | fn | `(r: AdmResult, lang: "en" \| "uz" \| "ru"): AdmDisplay \| null` |
| `atLeastOne` | 58 | fn | `(ps: number[], seed: number, rho?: number, draws?: number): number` |
| `listLine` | 65 | fn | `(results: AdmResult[], lang: "en" \| "uz" \| "ru", seedKey: string): { p: number; text: string; } \| null` |
| `LIST_RHO` | 55 | value | `0.5` |
| `LIST_DRAWS` | 56 | value | `10000` |

### admission/freeze.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `FROZEN_VERSION` | 12 | value | `"4.3"` |
| `FROZEN_AT` | 13 | value | `"2026-10-11"` |
| `FROZEN_FILES` | 14 | value | `readonly ["src/engine/admission/math.ts", "src/engine/admission/us.ts", "src/engine/admission/uzcut.ts", "src/engine/admission/inputs.ts", "src/engine/admissio…` |
| `FROZEN_HASH` | 19 | value | `"f863c5563dd1ad3100fa1ec9d812352bed767eaf0a2b4a91c34ebb30a2ce48ce"` |

### admission/inputs.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `bandOf` | 34 | fn | `(t: Row): number \| null` |
| `uzCertLevel` | 53 | fn | `(t: Row): "B1" \| "B2" \| null` |
| `inputsOf` | 98 | fn | `(A0: Answers, D: Pick<Derived, "stage">): AdmInputs` |
| `softA` | 165 | fn | `(inp: AdmInputs, t2?: number, t3?: number): number[]` |
| `eLevel` | 183 | fn | `(inp: AdmInputs): number` |
| `softE` | 192 | fn | `(inp: AdmInputs, level?: number): number[]` |
| `CEFR_BAND` | 27 | value | `Readonly<Record<string, number>>` |
| `SAT_FUZZ` | 156 | value | `40` |
| `SAT_MEASURE` | 158 | value | `{ readonly verified: 0; readonly official: 20; readonly practice: 60; }` |
| `NO_SAT_MIX` | 161 | value | `{ readonly top: readonly [0, 0.4425, 0.4243, 0.1333]; readonly good: readonly [0, 0, 0.6, 0.4]; readonly low: readonly [0, 0, 0.2, 0.8]; }` |
| `RUNG_A2` | 163 | value | `Record<string, number>` |
| `E_SPILL` | 191 | value | `0` |

### admission/math.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `PhiInv` | 22 | fn | `(p: number): number` |
| `meanSig` | 45 | fn | `(eta: number, tau: number): number` |
| `bisect` | 52 | fn | `(f: (x: number) => number, lo: number, hi: number, target: number, it?: number): number` |
| `rng` | 57 | fn | `(seed: number): () => number` |
| `normals` | 62 | fn | `(u: () => number): () => number` |
| `seedOf` | 72 | fn | `(s: string): number` |
| `sig` | 9 | fn | `(x: number): number` |
| `logit` | 10 | fn | `(p: number): number` |
| `erfc` | 18 | fn | `(x: number): number` |
| `Phi` | 20 | fn | `(z: number): number` |
| `Z90` | 38 | value | `1.2815515655446004` |

### admission/moves.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `movesOf` | 19 | fn | `(r: Pick<AdmResult, "drivers">): Moves \| null` |
| `MOVES_KEYS` | 16 | value | `readonly ["sat", "english", "activities"]` |

### admission/port.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `specCycleOf` | 21 | fn | `(sp: Spec \| null): number \| null` |
| `predictionFacts` | 28 | fn | `(university: string, programme: string \| null): PredictionFacts` |
| `grantOf` | 38 | fn | `(r: Pick<AdmResult, "detail" \| "shape">): number \| null` |

### admission/predict.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `shownOf` | 69 | fn | `(p: number, lo: number \| null, hi: number \| null, cap: number): { state: AdmState; shown: { n: number; lo: number \| null; hi: number \| null; } \| null; }` |
| `rateOf` | 130 | fn | `(sp: Spec): { r: number; cycle: number; estimated: boolean; } \| null` |
| `admissionFor` | 169 | fn | `(A: Answers, D: Derived, ctx: AdmCtx, uni: string, T: Tfn, inp?: AdmInputs): AdmResult` |
| `blocksOf` | 266 | fn | `(row: UzRow, inp: AdmInputs): B[]` |
| `MODEL_VERSION` | 24 | value | `"4.3"` |
| `MODEL_YEAR` | 40 | value | `number` |
| `SPECS` | 41 | value | `Readonly<Record<string, Spec>>` |
| `SOURCES` | 42 | value | `Readonly<Record<string, Source>>` |
| `INTL_RATIO` | 43 | value | `number` |
| `specOf` | 44 | fn | `(id: string): Spec \| null` |
| `SPEC_VERSION` | 45 | value | `1` |
| `CAP_HOLISTIC` | 47 | value | `70` |
| `CAP_SCORE` | 47 | value | `95` |
| `largeNeed` | 116 | fn | `(inp: AdmInputs): boolean` |

### admission/us.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `poolRate` | 24 | fn | `(s: number, pA?: readonly number[], pE?: readonly number[]): number` |
| `solveShift` | 31 | fn | `(r: number): number` |
| `softP` | 40 | fn | `(pA: readonly number[], pE: readonly number[], s: number, extra?: number): number` |
| `band` | 50 | fn | `(p: number, half: number): { eta: number; lo: number; hi: number; }` |
| `C_A` | 14 | value | `readonly [0.588, -2.968, -4.64, -9.534]` |
| `B_E` | 16 | value | `readonly [4.232, 1.99, 0, -1.301]` |
| `N_A` | 18 | value | `readonly [612, 59731, 57874, 18176]` |
| `PI_A` | 19 | value | `number[]` |
| `PI_E` | 21 | value | `readonly [0.006, 0.234, 0.6, 0.16]` |
| `cellP` | 38 | fn | `(a: number, e: number, s: number, extra?: number): number` |
| `halfWidth` | 48 | fn | `(b: BandParts): number` |

### admission/uzcut.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `forecast` | 50 | fn | `(c2026: number, kind: "grant" \| "contract", T: number): { c: number; sd: number; ceiling: boolean; minimum: boolean; }` |
| `placeChance` | 57 | fn | `(r: UzRow, mu: number, sigmaS: number, T: number): { grant: number \| null; contract: number \| null; place: number \| null; ceiling: boolean; }` |
| `gapOf` | 64 | fn | `(mu: number, sigmaS: number, cut: number): { rel: "above" \| "near" \| "below"; diff: number; }` |
| `subjOf` | 73 | fn | `(name: string): Subj` |
| `UZ_DATA_YEAR` | 20 | value | `number` |
| `UZ_MAX` | 21 | value | `number` |
| `UZ_MIN` | 22 | value | `{ grant: number; contract: number; }` |
| `UZ_SOURCE` | 23 | value | `{ url: string; scraped_at: string; }` |
| `programmeRows` | 31 | fn | `(): readonly UzRow[]` |
| `programmeRow` | 32 | fn | `(uni: string, code: number, lang: string): UzRow \| null` |
| `AGENCY_OF` | 34 | value | `Record<string, string>` |
| `UZ_SIGMA_KNOWN` | 37 | value | `2` |
| `UZ_SIGMA_ESTIMATE` | 39 | value | `12` |
| `stratumOf` | 41 | fn | `(c: number): Stratum` |
| `DRIFT` | 43 | value | `Record<Stratum, { grant: { d: number; s: number; }; contract: { d: number; s: number; }; }>` |
| `SD_FLOOR` | 48 | value | `1.5` |
| `BLOCK_MAX` | 92 | value | `Record<BlockId, number>` |

### answers.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `scaleOf` | 21 | fn | `(A: Answers): "five_point" \| "ten_point" \| "percent_100" \| "gpa_4"` |
| `averageOf` | 30 | fn | `(A: Answers): { value: number; scale: "five_point" \| "ten_point" \| "percent_100" \| "gpa_4"; of: number; five: number; } \| null` |
| `certLevel` | 65 | fn | `(t: { test: unknown; score?: unknown; }): string \| null` |
| `ownCheck` | 85 | fn | `(v: unknown): { level: string; confidence?: unknown; } \| null` |
| `skippedCoreAbsent` | 109 | fn | `(A0: Answers): Answers` |
| `normalizeAnswers` | 116 | fn | `(A0: Answers): Answers` |
| `englishAside` | 182 | fn | `(A: Answers): { level: string; source: string; self: string; } \| null` |
| `typedSource` | 192 | fn | `(A: Answers): string \| null` |
| `withdrawnByTests` | 209 | fn | `(stored: Answers, incoming: Answers): { patch: Answers; gone: string[]; } \| null` |
| `takenBackByOrder` | 233 | fn | `(A: Answers, when: Record<string, number>): { patch: Answers; gone: string[]; } \| null` |
| `heldTests` | 255 | fn | `<T = Row>(A: Answers): T[]` |
| `setAsideTests` | 261 | fn | `<T = Row>(A: Answers): T[]` |
| `withHeldTests` | 267 | fn | `(A: Answers): Answers` |
| `englishClaim` | 283 | fn | `(A: Answers): { level: string; source: string; measured: string; } \| null` |
| `SCALES` | 10 | value | `{ readonly five_point: { readonly of: 5; readonly min: 2; readonly max: 5; readonly step: 0.1; }; readonly ten_point: { readonly of: 10; readonly min: 1; reado…` |
| `isScale` | 15 | fn | `(v: unknown): v is "five_point" \| "ten_point" \| "percent_100" \| "gpa_4"` |
| `testId` | 39 | fn | `(t: unknown): string` |
| `TEST_LABEL` | 41 | value | `Record<string, string>` |
| `TEST_SCORE_RANGE` | 47 | value | `Record<string, [number, number]>` |
| `inScoreRange` | 49 | fn | `(test: string, n: number): boolean` |
| `DET_TO_IELTS` | 59 | value | `readonly [number, number][]` |
| `detBand` | 62 | fn | `(n: number): number \| null` |
| `DTM_POINTS` | 73 | value | `[number, number]` |
| `isPartialCheck` | 80 | fn | `(v: unknown): boolean` |
| `MILLIY_GRADES` | 91 | value | `Record<string, string>` |
| `PARTIAL_CHECKS` | 95 | value | `readonly ["m4_english_screener", "m3_math_test"]` |
| `CORE_SKIPPED_IS_ABSENT` | 104 | value | `readonly string[]` |
| `typedFar` | 241 | fn | `(typed: string, measured: string): boolean` |

### app-check.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `appChecks` | 20 | fn | `(goal: Goal \| null, A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru", roadmap: Pick<Roadmap, "milestones"> \| null): Record<string, AppCheck[]>` |

### bank.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `BANK` | 17 | value | `QuestionBank` |
| `allQuestions` | 18 | fn | `(bank?: QuestionBank): Question[]` |
| `questionById` | 19 | fn | `(id: string, bank?: QuestionBank): Question \| undefined` |
| `moduleOf` | 20 | fn | `(id: string, bank?: QuestionBank): string \| undefined` |

### branch.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `branch` | 24 | fn | `(expr: string, A: Answers, D: Partial<Derived>, rules: RulesSnapshot): boolean` |
| `validateAnswers` | 85 | fn | `(A: Answers, bank: QuestionBank): { ok: boolean; errors: AnswerError[]; skipped: string[]; }` |
| `UnknownBranch` | 21 | class | `typeof UnknownBranch` |
| `visible` | 42 | fn | `(q: Question, A: Answers, D: Partial<Derived>, rules: RulesSnapshot): boolean` |
| `visibleQuestions` | 45 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "rules" \| "bank">): string[]` |
| `deepQs` | 49 | fn | `(id: string, A: Answers, D: Derived, ctx: Pick<EngineCtx, "rules" \| "bank">): Question[]` |
| `EXTRA_ANSWER_KEYS` | 57 | value | `string[]` |

### capacity.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `capacityCheck` | 29 | fn | `(A: Answers, D: Derived, routes: string[], ctx: Pick<EngineCtx, "today" \| "rules">): Capacity` |
| `TRACK_HOURS` | 13 | value | `Record<Track, number>` |
| `TRACK_PRIORITY` | 15 | value | `Track[]` |
| `TRACK_NAME` | 16 | value | `Record<Track, string>` |
| `TESTS_WINDOW_MONTHS` | 17 | value | `18` |
| `APPLY_LEAD_MONTHS` | 19 | value | `8` |
| `TEST_ESSAY_ROUTES` | 21 | value | `string[]` |
| `olympiadTrack` | 28 | fn | `(A: Answers, rung: number): boolean` |

### card.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `playerCard` | 12 | fn | `(a: Answers, d: Derived, sc: Scorecard): PlayerCard` |
| `circlesOf` | 51 | fn | `(a: Answers, d: Derived, sc: Scorecard): Circles` |
| `AXES` | 7 | value | `[AxisKey, string][]` |
| `tierOf` | 10 | fn | `(n: number): "jade" \| "gold" \| "silver" \| "bronze"` |
| `readiness` | 59 | fn | `(c: PlayerCard): number` |

### cat/config.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `RAPID_MS` | 54 | value | `1500` |
| `FIRST_SET` | 62 | value | `Readonly<Record<CatSkill, number>>` |
| `CAT_CONFIG` | 63 | value | `Readonly<Record<CatSkill, CatCfg>>` |
| `kFor` | 80 | fn | `(k: number, candidates: number): number` |

### cat/irt.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `info` | 40 | fn | `(theta: number, b: number, c: number, a?: number): number` |
| `pcmProbs` | 55 | fn | `(theta: number, steps: readonly number[], a?: number): number[]` |
| `testletProbs` | 66 | fn | `(theta: number, b: readonly number[], c: number, a?: number, sd?: number): number[]` |
| `logLik` | 84 | fn | `(r: Resp): number[]` |
| `eap` | 93 | fn | `(lp: readonly number[]): Posterior` |
| `posterior` | 100 | fn | `(prior: { mu: number; sd?: number \| undefined; }, rs: readonly Resp[]): Posterior` |
| `quantile` | 108 | fn | `(w: readonly number[], q: number): number` |
| `GRID_MIN` | 15 | value | `-4.5` |
| `GRID_MAX` | 15 | value | `4.5` |
| `GRID_N` | 15 | value | `181` |
| `GRID` | 16 | value | `readonly number[]` |
| `SLOPE` | 18 | value | `1.25` |
| `marginalSlope` | 25 | fn | `(a: number, sdB: number): number` |
| `PRIOR_SD` | 27 | value | `1.25` |
| `TESTLET_SD` | 29 | value | `0.5` |
| `p3` | 38 | fn | `(theta: number, b: number, c: number, a?: number): number` |
| `maxInfo` | 52 | fn | `(c: number, a?: number): number` |
| `testletCat` | 80 | fn | `(theta: number, r: { b: readonly number[]; c: number; a?: number \| undefined; steps?: readonly number[] \| null \| undefined; }): number[]` |
| `logPrior` | 89 | fn | `(mu: number, sd?: number): number[]` |
| `massBetween` | 106 | fn | `(w: readonly number[], lo: number, hi: number): number` |

### cat/read.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `summaryOf` | 23 | fn | `(skill: CatSkill, v: unknown): CheckSummary \| null` |
| `pAtLeast` | 38 | fn | `(skill: CatSkill, s: CheckSummary, boundary: string): number` |
| `lockFires` | 43 | fn | `(skill: CatSkill, s: CheckSummary \| null, boundary: string, p?: number): boolean` |
| `expectedBand` | 50 | fn | `(v: unknown, table: Readonly<Record<string, number>>): number \| null` |
| `checkLines` | 64 | fn | `(skill: CatSkill, v: unknown, grade?: number \| null \| undefined): { line: Record<"en" \| "uz" \| "ru", string>; detail: Record<"en" \| "uz" \| "ru", string>; provisional: boolean; mode: string; } \| null` |
| `isCatResult` | 20 | fn | `(v: unknown): boolean` |
| `needsRecheck` | 57 | fn | `(s: CheckSummary \| null): boolean` |

### cat/report.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `levelProbs` | 46 | fn | `(skill: CatSkill, w: readonly number[], cutSd?: number): Record<string, number>` |
| `set90Of` | 64 | fn | `(skill: CatSkill, probs: Record<string, number>): string[]` |
| `ieltsOf` | 97 | fn | `(set: readonly string[]): { lo: number \| null; hi: number; } \| null` |
| `ieltsLine` | 104 | fn | `(i: { lo: number \| null; hi: number; }, l: "en" \| "uz" \| "ru"): string` |
| `satOf` | 111 | fn | `(theta: number, cells: readonly SatCell[], a?: number): { domain: string; difficulty: string; } \| null` |
| `reportOf` | 125 | fn | `(skill: CatSkill, p: Posterior, o?: { satCells?: readonly SatCell[] \| undefined; complete?: boolean \| undefined; cap?: number \| null \| undefined; }): CatReport` |
| `sittingOf` | 160 | fn | `(s: CatState, readMs?: number): { asked: number; real: number; of: number; right: number; timeouts: number; fast: boolean; measured: boolean; }` |
| `kindResult` | 183 | fn | `<R extends Record<string, unknown>>(skill: CatSkill, result: R, grade: number \| null \| undefined): R` |
| `unmeasuredResult` | 198 | fn | `(s: CatState, readMs?: number): { unmeasured: true; form: string; stage: "daily"; complete: boolean; provisional: boolean; n_set: number; asked: number; real: number; right: number; of: number; fast: boolean; timeouts: number; stopped: number; extra_next: num…` |
| `gentleLevel` | 211 | fn | `(skill: CatSkill, o: { was: string \| null \| undefined; now: string; complete: boolean; grade?: number \| null \| undefined; }): string` |
| `gentleResult` | 226 | fn | `<R extends Record<string, unknown>>(skill: CatSkill, result: R, o: { was: string \| null \| undefined; grade?: number \| null \| undefined; }): R` |
| `catResult` | 239 | fn | `(s: CatState, o?: { satCells?: readonly SatCell[] \| undefined; readMs?: number \| undefined; }): { covers?: Record<"en" \| "uz" \| "ru", string> \| undefined; line: Record<"en" \| "uz" \| "ru", string>; detail: { en: string; uz: string; ru: string; }; sat?: …` |
| `detailLine` | 264 | fn | `(skill: CatSkill, r: Pick<CatReport, "sat" \| "ielts">, l: "en" \| "uz" \| "ru"): string` |
| `legacyPosterior` | 275 | fn | `(skill: CatSkill, level: string): { probs: Record<string, number>; mode: string; provisional: true; legacy: true; se: number; } \| null` |
| `erf` | 283 | fn | `(x: number): number` |
| `PROVISIONAL_SE` | 25 | value | `0.3` |
| `RUNNER_UP` | 26 | value | `0.2` |
| `possibly` | 91 | fn | `(level: string, skill: CatSkill, l: "en" \| "uz" \| "ru"): string` |
| `provisionalWord` | 92 | fn | `(l: "en" \| "uz" \| "ru"): string` |
| `levelName` | 94 | fn | `(skill: CatSkill, level: string, l: "en" \| "uz" \| "ru"): string` |
| `namedLevels` | 103 | fn | `(mode: string, runnerUp: string \| null \| undefined): string[]` |
| `CHILD_BELOW` | 181 | value | `9` |
| `UNMEASURED` | 192 | value | `Record<"en" \| "uz" \| "ru", string>` |

### cat/scale.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `priorMu` | 42 | fn | `(skill: CatSkill, o: { grade?: number \| null \| undefined; self?: string \| null \| undefined; certificate?: string \| null \| undefined; }): number` |
| `expectedRung` | 55 | fn | `(grade: number \| null \| undefined): number` |
| `gradeMu` | 63 | fn | `(grade: number \| null \| undefined): number` |
| `expectedLevel` | 68 | fn | `(skill: CatSkill, o: { grade?: number \| null \| undefined; self?: string \| null \| undefined; }): number` |
| `practicePrior` | 82 | fn | `(skill: CatSkill, o: { grade?: number \| null \| undefined; self?: string \| null \| undefined; }): number` |
| `LEVELS` | 13 | value | `Readonly<Record<CatSkill, readonly string[]>>` |
| `CENTRES` | 14 | value | `Readonly<Record<CatSkill, readonly number[]>>` |
| `CUTS` | 19 | value | `Readonly<Record<CatSkill, readonly number[]>>` |
| `levelIndex` | 24 | fn | `(skill: CatSkill, theta: number): number` |
| `band` | 26 | fn | `(skill: CatSkill, k: number): [number, number]` |
| `BANK_LEVEL` | 28 | value | `Readonly<Record<string, string>>` |
| `centreOf` | 33 | fn | `(skill: CatSkill, level: string): number \| null` |
| `IELTS_OF` | 89 | value | `Readonly<Record<string, [number, number] \| null>>` |

### cat/session.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `newSession` | 101 | fn | `(skill: CatSkill, o: { stage: "onboarding" \| "daily"; mu: number; sd?: number \| undefined; carried?: CatAnswer[] \| undefined; extra?: number \| undefined; now: number; random: () => number; testletAvailable?: boolean \| undefined; pretestAvailable?: boolea…` |
| `hardestRight` | 118 | fn | `(s: CatState): number \| null` |
| `missedAbove` | 150 | fn | `(s: CatState, over: number): number[]` |
| `isComplete` | 166 | fn | `(s: CatState, p?: Posterior): boolean` |
| `scoredDone` | 169 | fn | `(s: CatState, now: number, p?: Posterior): boolean` |
| `nextItem` | 185 | fn | `(s: CatState, pool: readonly CatItem[], now: number, random: () => number, rate?: ((exposure: string) => number) \| undefined): CatItem \| null` |
| `record` | 256 | fn | `(s: CatState, it: CatItem, x: number, ms: number, late: boolean, now: number, o?: { stopped?: boolean \| undefined; unseen?: boolean \| undefined; scored?: boolean \| undefined; idk?: boolean \| undefined; na?: number \| undefined; }): void` |
| `extraFor` | 269 | fn | `(s: CatState): number` |
| `A4_PREFIX` | 74 | value | `"a4:"` |
| `targeting` | 84 | fn | `(it: CatItem, theta: number, a?: number): number` |
| `cfgOf` | 86 | fn | `(s: Pick<CatState, "skill">): CatCfg` |
| `slopeOf` | 88 | fn | `(skill: CatSkill): number` |
| `respOf` | 91 | fn | `(r: CatAnswer, a?: number): Resp` |
| `postOf` | 95 | fn | `(s: CatState): Posterior` |
| `scoredN` | 97 | fn | `(s: CatState): number` |
| `TEXT_FROM` | 210 | value | `"A2"` |
| `isRapid` | 249 | fn | `(ms: number, sec: number, cfg: CatCfg): boolean` |

### catalog.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `uniAliases` | 78 | fn | `(id: string): string[]` |
| `UNI_NAMES_UZ_RU` | 20 | value | `Record<string, { uz: string; ru: string; src?: string \| undefined; }>` |
| `catalogRows` | 92 | fn | `(): CatalogRow[]` |

### changes.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `whatChanged` | 28 | fn | `(before: Before, after: Before, lead: string, lang?: "en" \| "uz" \| "ru", waiting?: readonly string[]): Changes` |
| `movedLines` | 54 | fn | `(before: Pick<Before, "roadmap">, after: Pick<Before, "roadmap">, lang?: "en" \| "uz" \| "ru"): string[]` |
| `changeLine` | 68 | fn | `(c: Changes): string` |
| `LEADS` | 70 | value | `{ readonly parent_flow_done: (lang?: "en" \| "uz" \| "ru") => string; readonly test_score: (test: string, score: number, lvl: string \| null, lang?: "en" \| "u…` |

### checks.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `newRun` | 164 | fn | `(kind: CheckKind, o: { grade?: unknown; lang?: unknown; quiz?: unknown; now: number; items?: QuizItem[] \| undefined; part?: number \| undefined; parts?: number \| undefined; }): Run` |
| `reopen` | 236 | fn | `(run: Run, d: Deps): void` |
| `answer` | 290 | fn | `(run: Run, a: AnswerIn, d: Deps, lang?: "en" \| "uz" \| "ru", force?: boolean): AnswerOut` |
| `resume` | 327 | fn | `(run: Run, d: Deps): void` |
| `seeQuiz` | 344 | fn | `(run: Run, item: string, now: number): void` |
| `stop` | 351 | fn | `(run: Run, d: Deps): void` |
| `finishReading` | 357 | fn | `(run: Run, d: Deps): void` |
| `hold` | 368 | fn | `(run: Run, on: boolean, now: number): void` |
| `viewOf` | 383 | fn | `(run: Run): RunView` |
| `CHECK_KINDS` | 22 | value | `readonly CheckKind[]` |
| `READ_UPPER_FROM` | 38 | value | `10` |
| `readingSetOf` | 39 | fn | `(grade: unknown): "upper" \| undefined` |
| `CHECK_LEVELS` | 43 | value | `string[]` |
| `EN_SEC` | 45 | value | `Readonly<Record<string, number>>` |
| `READ_EXTRA` | 46 | value | `10` |
| `MATH_SEC` | 47 | value | `readonly number[]` |
| `GRACE_MS` | 49 | value | `5000` |
| `HOLD_MAX_MS` | 52 | value | `60000` |
| `HOLDS_MAX` | 53 | value | `3` |
| `readLangOf` | 56 | fn | `(v: unknown): ReadLang` |
| `readingItems` | 58 | fn | `(lang: unknown): number` |
| `QUIZ_READ_MS` | 112 | value | `2000` |
| `READ_MIN_MS` | 132 | value | `1200` |
| `READ_WORD_MS` | 133 | value | `125` |
| `READ_CAP_MS` | 134 | value | `4000` |
| `wordsOf` | 136 | fn | `(s: string): number` |
| `readFloor` | 140 | fn | `(prompt: string, options: readonly string[], readMs: number): number` |
| `realTry` | 149 | fn | `(run: Pick<Run, "log" \| "status">, result: { of?: number \| undefined; fast?: boolean \| undefined; } \| null \| undefined): boolean` |
| `quizWords` | 396 | fn | `(lang: "en" \| "uz" \| "ru"): { correct: string; wrong: string; answer: string; next: string; result: string; miss: string; missNone: string; }` |
| `PARTIAL_MARK` | 398 | value | `{ readonly partial: true; readonly form: "A"; }` |

### coins.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `coinsFor` | 8 | fn | `(e: EarnEvent): number` |
| `taskCoins` | 29 | fn | `(t: { verification: string; coins: number; deep?: string \| null \| undefined; questions?: number \| null \| undefined; }): number` |
| `COINS` | 2 | value | `{ readonly diagnostic_complete: 50; readonly day_complete: 40; readonly seed_fixture: 120; readonly freeze_price: 100; readonly game_daily_cap: 50; readonly ga…` |
| `FREEZE_ITEM` | 17 | value | `"o1"` |
| `TASK_COINS` | 28 | value | `{ readonly tick: 5; readonly quiz: 10; readonly quiz_long: 20; readonly quiz_long_over: 5; }` |
| `answeredAny` | 35 | fn | `(a: Record<string, unknown>): boolean` |

### content/backtranslate.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `translationIssues` | 29 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `btCopy` | 52 | fn | `(items: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: …` |
| `scoreBT` | 75 | fn | `(map: BtMap, answers: Record<string, string>, min?: number): BtScore[]` |
| `UZ_TRAPS` | 18 | value | `{ re: RegExp; why: string; }[]` |

### content/blind.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `blindCopy` | 42 | fn | `(items: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: …` |

### content/catalog.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `catalogFindings` | 62 | fn | `(raw: unknown, bank: string, where: string): Finding[]` |
| `catalogStatus` | 88 | fn | `(raw: unknown): "draft" \| "verified_auto" \| "reviewed" \| "operational" \| "retired" \| "quarantine"` |
| `CATALOG_BANKS` | 15 | value | `readonly ["C2", "C8", "C9", "C10", "C11", "C12", "C13", "C14", "C16"]` |
| `isCatalogStream` | 17 | fn | `(stream: string): boolean` |
| `CatalogFact` | 21 | value | `ZodObject<{ claim: ZodString; url: ZodOptional<ZodNullable<ZodURL>>; verified_at: ZodOptional<ZodNullable<ZodString>>; needs_verification: ZodOptional<...>; se…` |
| `CatalogRecord` | 30 | value | `ZodObject<{ id: ZodString; title: ZodOptional<ZodObject<{ en: ZodOptional<ZodString>; uz: ZodOptional<ZodString>; ru: ZodOptional<ZodString>; }, $strict>>; ...…` |
| `catalogRecordsOf` | 46 | fn | `(json: unknown): unknown[] \| null` |

### content/clips.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `parseClips` | 31 | fn | `(json: unknown): { clips: Map<string, Clip>; errors: { id: string \| null; msg: string; }[]; }` |
| `corpusClipsOf` | 46 | fn | `(files: readonly { stream: string; name: string; json?: unknown; }[], add: (f: ListenFinding & { where: string; id?: string \| undefined; }) => void): Map<string, Clip> \| null` |
| `listeningFindings` | 58 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `ACCENTS` | 11 | value | `readonly ["British", "American", "Australian", "other"]` |
| `CLIP_FILE_RE` | 13 | value | `RegExp` |
| `CLIP_MAX_BYTES` | 14 | value | `number` |
| `CLIP_MAX_S` | 16 | value | `180` |
| `CLIP_MIN_S` | 16 | value | `60` |
| `clipFileName` | 18 | fn | `(f: string): string` |
| `ClipZ` | 19 | value | `ZodObject<{ id: ZodString; file: ZodPipe<ZodPipe<ZodString, ZodTransform<string, string>>, ZodString>; part: ZodNumber; script: ZodObject<...>; speakers: ZodAr…` |
| `clipRecordsOf` | 29 | fn | `(json: unknown): unknown[]` |

### content/edges.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `edgeChoices` | 18 | fn | `(spec: number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }): Choice[]` |
| `edgeInstances` | 46 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |

### content/family-check.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `sameKey` | 38 | fn | `(a: Key, b: Key, tol?: number): boolean` |
| `numbersIn` | 53 | fn | `(s: string, lang?: "en" \| "uz" \| "ru" \| undefined): string[]` |
| `optionValue` | 62 | fn | `(text: string): number \| null` |
| `checkFamily` | 96 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `fillRelation` | 154 | fn | `(rel: string, v: Values): string` |
| `checkInstanceItem` | 163 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `INSTANCES` | 35 | value | `50` |

### content/family.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `rngFor` | 35 | fn | `(seed: string): () => number` |
| `choices` | 43 | fn | `(spec: number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }): Choice[] \| null` |
| `valuesOf` | 61 | fn | `(f: { template: string; params: Record<string, number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }>; answer: string; template_i18n?: { uz?: string \| undefined; ru…` |
| `meets` | 67 | fn | `(f: { template: string; params: Record<string, number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }>; answer: string; template_i18n?: { uz?: string \| undefined; ru…` |
| `drawValues` | 72 | fn | `(f: { template: string; params: Record<string, number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }>; answer: string; template_i18n?: { uz?: string \| undefined; ru…` |
| `fmtNum` | 86 | fn | `(n: number, lang: "en" \| "uz" \| "ru", decimals?: number \| undefined, group?: boolean): string` |
| `ruPluralClass` | 108 | fn | `(n: number): "one" \| "few" \| "many"` |
| `countedForm` | 117 | fn | `(n: number, forms: string[]): string` |
| `fill` | 143 | fn | `(t: string, v: Values, lang: "en" \| "uz" \| "ru", decimals?: number \| undefined): string` |
| `templatesOf` | 160 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `keyOf` | 172 | fn | `(f: { template: string; params: Record<string, number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }>; answer: string; template_i18n?: { uz?: string \| undefined; ru…` |
| `distractorsOf` | 180 | fn | `(f: { template: string; params: Record<string, number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }>; answer: string; template_i18n?: { uz?: string \| undefined; ru…` |
| `render` | 188 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `instantiate` | 200 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `countVariants` | 206 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `undefinedNames` | 226 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `FamilyError` | 17 | class | `typeof FamilyError` |
| `SUP` | 82 | value | `Readonly<Record<string, string>>` |
| `SUB` | 83 | value | `Readonly<Record<string, string>>` |
| `fillOption` | 95 | fn | `(t: string, v: Values, key: Key, lang: "en" \| "uz" \| "ru", decimals?: number \| undefined): string` |
| `whyOf` | 101 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `SLOT_RE` | 106 | value | `RegExp` |
| `slotsOf` | 122 | fn | `(t: string): string[]` |
| `isRenderedInstance` | 169 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `isChoice` | 185 | fn | `(f: { template: string; params: Record<string, number \| number[] \| { min: number; max: number; step?: number \| undefined; not?: number[] \| undefined; } \| { values: (number \| number[])[]; }>; answer: string; template_i18n?: { uz?: string \| undefined; ru…` |

### content/format.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `formatOf` | 11 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |

### content/formula.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `parse` | 49 | fn | `(src: string): Node` |
| `evaluate` | 143 | fn | `(src: string, env?: Readonly<Record<string, number \| readonly number[]>>): number` |
| `evaluateAny` | 145 | fn | `(src: string, env?: Readonly<Record<string, number \| readonly number[]>>): string \| number` |
| `namesIn` | 151 | fn | `(src: string): string[]` |
| `FUNCTIONS` | 20 | value | `Readonly<Record<string, (...x: number[]) => number>>` |
| `CONSTANTS` | 30 | value | `Readonly<Record<string, number>>` |
| `FormulaError` | 32 | class | `typeof FormulaError` |
| `FormulaSyntaxError` | 34 | class | `typeof FormulaSyntaxError` |

### content/instructions.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `repeatsStem` | 21 | fn | `(stem: string, ins: string): boolean` |
| `shownInstruction` | 37 | fn | `(stem: string, shown: string \| null \| undefined, inStem?: string \| null \| undefined): string \| null` |

### content/keycheck.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `agentOf` | 48 | fn | `(name: string): string` |
| `blindLabel` | 55 | fn | `(solvers: string[]): string` |
| `keyCheckOf` | 68 | fn | `(k: string \| null \| undefined, o?: { author?: string \| undefined; open?: boolean \| undefined; }): KeyCheck` |
| `BLIND_INSTANCES` | 35 | value | `3` |
| `READ_LANGS` | 65 | value | `readonly ["en", "uz", "ru"]` |

### content/numbers.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `showNumber` | 23 | fn | `(plain: string, lang: "en" \| "uz" \| "ru", group?: boolean): string` |
| `ungroup` | 34 | fn | `(text: string, lang: "en" \| "uz" \| "ru"): string` |
| `parseNumeric` | 39 | fn | `(v: string \| number \| null \| undefined, lang?: "en" \| "uz" \| "ru"): number \| null` |
| `GROUP_SPACES` | 10 | value | `" "` |
| `NBSP` | 16 | value | `" "` |

### content/read.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `readCorpus` | 9 | fn | `(root: string): Corpus` |

### content/reconcile.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `parseAnswers` | 44 | fn | `(json: unknown): Record<string, SolverAnswer>` |
| `signature` | 61 | fn | `(stem: Record<string, unknown> \| undefined, options: unknown[] \| undefined): string` |
| `reconcile` | 85 | fn | `(items: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: …` |
| `applyDecision` | 185 | fn | `<T extends Record<string, unknown>>(raw: T, d: Decision): T` |
| `FLAGS` | 25 | value | `readonly ["two_defensible", "unanswerable", "no_passage_needed"]` |
| `RECORD_CODES` | 27 | value | `string[]` |

### content/scan.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `blankOf` | 42 | fn | `(stem: string): { before: string; after: string; } \| null` |
| `fillDefects` | 51 | fn | `(before: string, option: string, after: string): FillDefect[]` |
| `sharedEdge` | 71 | fn | `(before: string, options: string[], after: string): { side: "end" \| "start"; word: string; } \| null` |
| `samePairs` | 87 | fn | `(texts: string[], skip?: (a: string, b: string) => boolean): [number, number][]` |
| `articleCue` | 97 | fn | `(before: string, options: string[]): { article: string; fits: number[]; } \| null` |
| `lengthCue` | 105 | fn | `(texts: string[]): { longest: boolean; shortest: boolean; ratio: number; }` |
| `uzMarkIssues` | 119 | fn | `(s: string): UzMarkIssue[]` |
| `scanItem` | 183 | fn | `(l: ScanItem, add: Add, o?: { families?: boolean \| undefined; }): void` |
| `lessonsOf` | 222 | fn | `(files: { stream: string; name: string; json?: unknown; }[]): ScanLesson[]` |
| `scanBatches` | 243 | fn | `(items: ScanItem[], lessons: ScanLesson[], add: Add): void` |
| `BLANK_RE` | 33 | value | `RegExp` |
| `NO_WORD_RE` | 35 | value | `RegExp` |
| `foldOption` | 82 | fn | `(s: string): string` |
| `SCAN_SEEDS` | 180 | value | `string[]` |
| `uzMarkMsg` | 216 | fn | `(what: string, u: UzMarkIssue): string` |
| `BATCH_MIN` | 240 | value | `10` |
| `CUE_MAX` | 241 | value | `0.4` |

### content/schema.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `contentJsonSchema` | 186 | fn | `(): { $id: string; title: string; description: string; $defs: { passages_file: Record<string, unknown>; }; }` |
| `CONTENT_LANGS` | 21 | value | `readonly ["en", "uz", "ru"]` |
| `LEVELS` | 24 | value | `readonly ["preA1", "A1", "A2", "B1", "B2", "C1", "C2"]` |
| `BANDS` | 26 | value | `readonly ["easy", "medium", "hard"]` |
| `NATIVE_LEVELS` | 29 | value | `readonly ["easy", "medium", "hard", "advanced"]` |
| `RUNGS` | 31 | value | `readonly ["arith", "prealg", "alg1", "geom", "alg2", "precalc", "calc", "beyond"]` |
| `ENGINE_RUNG` | 32 | value | `Readonly<Record<"arith" \| "prealg" \| "alg1" \| "geom" \| "alg2" \| "precalc" \| "calc" \| "beyond", string>>` |
| `STATUSES` | 36 | value | `readonly ["draft", "verified_auto", "reviewed", "operational", "retired", "quarantine"]` |
| `SAT_DIFFICULTIES` | 37 | value | `readonly ["easy", "medium", "hard"]` |
| `SKILL_RE` | 38 | value | `RegExp` |
| `BANK_RE` | 39 | value | `RegExp` |
| `ITEM_ID_RE` | 40 | value | `RegExp` |
| `STREAM_RE` | 42 | value | `RegExp` |
| `PARAM_RE` | 43 | value | `RegExp` |
| `CLIP_ID_RE` | 45 | value | `RegExp` |
| `LangText` | 55 | value | `ZodObject<{ en: ZodOptional<ZodString>; uz: ZodOptional<ZodString>; ru: ZodOptional<ZodString>; }, $strict>` |
| `OptionText` | 58 | value | `ZodObject<{ en: ZodOptional<ZodUnion<readonly [ZodString, ZodNumber]>>; uz: ZodOptional<ZodUnion<readonly [ZodString, ZodNumber]>>; ru: ZodOptional<...>; }, $s…` |
| `Tri` | 61 | value | `ZodObject<{ en: ZodString; uz: ZodString; ru: ZodString; }, $strict>` |
| `Fact` | 66 | value | `ZodObject<{ claim: ZodString; url: ZodURL; verified_at: ZodOptional<ZodString>; note: ZodOptional<ZodString>; }, $strict>` |
| `Source` | 67 | value | `ZodUnion<readonly [ZodLiteral<"own">, ZodObject<{ url: ZodURL; licence: ZodString; attribution: ZodOptional<ZodString>; facts: ZodOptional<ZodArray<ZodObject<{…` |
| `ParamSpec` | 77 | value | `ZodUnion<readonly [ZodNumber, ZodObject<{ min: ZodNumber; max: ZodNumber; step: ZodOptional<ZodNumber>; not: ZodOptional<ZodArray<ZodNumber>>; }, $strict>, Zod…` |
| `Family` | 91 | value | `ZodObject<{ template: ZodString; template_i18n: ZodOptional<ZodObject<{ uz: ZodOptional<ZodString>; ru: ZodOptional<ZodString>; }, $strict>>; ... 13 more ...; …` |
| `Item` | 110 | value | `ZodObject<{ id: ZodString; skill: ZodString; level: ZodOptional<ZodEnum<{ B1: "B1"; B2: "B2"; A1: "A1"; A2: "A2"; C1: "C1"; C2: "C2"; preA1: "preA1"; easy: "ea…` |
| `BankFile` | 149 | value | `ZodObject<{ bank: ZodString; batch: ZodNumber; items: ZodArray<ZodObject<{ id: ZodString; skill: ZodString; level: ZodOptional<ZodEnum<{ B1: "B1"; B2: "B2"; A1…` |
| `Passage` | 155 | value | `ZodObject<{ id: ZodString; lang: ZodEnum<{ en: "en"; uz: "uz"; ru: "ru"; }>; level: ZodEnum<{ B1: "B1"; B2: "B2"; A1: "A1"; A2: "A2"; C1: "C1"; C2: "C2"; preA1…` |
| `PassagesFile` | 171 | value | `ZodUnion<readonly [ZodArray<ZodObject<{ id: ZodString; lang: ZodEnum<{ en: "en"; uz: "uz"; ru: "ru"; }>; level: ZodEnum<{ B1: "B1"; B2: "B2"; A1: "A1"; A2: "A2…` |
| `bankOfId` | 200 | fn | `(id: string): string \| null` |
| `poolOf` | 202 | fn | `(bank: string): "assessment" \| "practice"` |

### content/solve-stem.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `mathOf` | 17 | fn | `(s: string): string` |
| `exprOf` | 29 | fn | `(s: string, unknown?: string): string` |
| `solveStem` | 285 | fn | `(stem: string): StemAnswer` |
| `solveRelation` | 304 | fn | `(rel: string): StemAnswer` |

### content/solver.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `solve` | 208 | fn | `(relation: string): Solution` |
| `value` | 298 | fn | `(expr: string, vars?: Record<string, number>): number` |
| `SolverError` | 37 | class | `typeof SolverError` |

### content/tags.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `sampleForTagging` | 24 | fn | `(items: { bank: string; item: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; ti…` |
| `scoreTags` | 59 | fn | `(map: Record<string, AuthorTags>, answers: Record<string, TaggerAnswer>): TagReport` |
| `TAG_AGREEMENT_GATE` | 11 | value | `0.8` |
| `SAMPLE_PLAN` | 18 | value | `{ readonly K1: 10; readonly K2: 1; readonly K4: 10; readonly K5: 1; }` |

### content/text.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `normalise` | 10 | fn | `(s: string): string` |
| `grams` | 16 | fn | `(s: string, n?: number): Set<string>` |
| `jaccard` | 22 | fn | `(a: Set<string>, b: Set<string>): number` |
| `similarPairs` | 38 | fn | `(texts: string[], threshold: number, n?: number): { i: number; j: number; sim: number; }[]` |
| `uzApostrophes` | 87 | fn | `(s: string): ApostropheIssue[]` |
| `englishWithUzbekMark` | 114 | fn | `(s: string): string[]` |
| `strayUzQuoteMarks` | 118 | fn | `(s: string): string[]` |
| `uzStrayMarks` | 129 | fn | `(s: string): StrayMark[]` |
| `mixedScriptWords` | 141 | fn | `(s: string): string[]` |
| `wordCount` | 64 | fn | `(s: string): number` |
| `codepoint` | 146 | fn | `(c: string): string` |

### content/typed.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `withinLimit` | 27 | fn | `(s: string, lim: WordLimit): boolean` |
| `typedRight` | 37 | fn | `(answer: string \| null \| undefined, accept: readonly string[], lim: WordLimit): boolean` |
| `printedExtra` | 51 | fn | `(answer: string \| null \| undefined, accept: readonly string[], stem: string): string \| null` |
| `TYPED_MAX` | 15 | value | `120` |
| `normTyped` | 21 | fn | `(s: string): string` |
| `NUMBER_TOKEN` | 24 | value | `RegExp` |

### content/validate.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `load` | 109 | fn | `(c: Corpus, add: (f: Finding) => void): { items: Loaded[]; passages: Map<string, { p: { id: string; lang: "en" \| "uz" \| "ru"; level: "B1" \| "B2" \| "A1" \| "A2" \| "C1" \| "C2" \| "preA1" \| "easy" \| "medium" \| "hard" \| "advanced"; title: string; text: …` |
| `stemLangs` | 184 | fn | `(it: { id: string; skill: string; subskill: string; lang: "en" \| "uz" \| "ru"; stem: { en?: string \| undefined; uz?: string \| undefined; ru?: string \| undefined; }; why: { en: string; uz: string; ru: string; }; prior_b: number; time_s: number; source: "ow…` |
| `validate` | 196 | fn | `(c: Corpus, opts?: Options): Report` |
| `LIMITS` | 26 | value | `{ readonly stem: { readonly en_grammar: 160; readonly en_vocab: 160; readonly en_reading: 300; readonly passage: 160; readonly math: 240; readonly read: 160; r…` |
| `BAND_CENTRE` | 37 | value | `Record<string, number>` |
| `SHORT_SECONDS` | 43 | value | `Record<string, number>` |
| `TARGETS` | 46 | value | `{ readonly K1: { readonly total: 360; readonly level: { readonly preA1: 30; readonly A1: 60; readonly A2: 60; readonly B1: 60; readonly B2: 60; readonly C1: 60…` |
| `SAT_DOMAINS` | 56 | value | `{ math: string[]; rw: string[]; }` |
| `SERVED_STATUSES` | 64 | value | `readonly string[]` |
| `isInstanceBank` | 66 | fn | `(bank: string): boolean` |

### copy.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `COPY` | 8 | value | `{ readonly hoursVsGoals: (h: number, track: string) => string; readonly studentVsParent: string; readonly budgetVsList: string; readonly firstDeadlineName: str…` |

### dates.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `localDateOf` | 13 | fn | `(instant: string \| number \| Date, tz: string): string` |
| `zoneOffsetMin` | 17 | fn | `(instant: number, tz: string): number` |
| `zonedInstant` | 23 | fn | `(d: string, hour: number, tz: string): Date` |
| `datesFrom` | 39 | fn | `(a: string, b: string): string[]` |
| `utcMs` | 10 | fn | `(d: string): number` |
| `addDays` | 28 | fn | `(d: string, n: number): string` |
| `addMonths` | 30 | fn | `(d: string, n: number): string` |
| `weekdayOf` | 32 | fn | `(d: string): number` |
| `mondayOf` | 34 | fn | `(d: string): string` |
| `daysBetween` | 35 | fn | `(a: string, b: string): number` |
| `monthsBetween` | 37 | fn | `(a: string, b: string): number` |
| `fmtMonth` | 41 | fn | `(s: string \| null \| undefined): string` |
| `fmtDay` | 43 | fn | `(s: string \| null \| undefined): string` |

### derive.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `firstDeadline` | 31 | fn | `(rules: RulesSnapshot, id: string, gy: number, today?: string \| undefined): Deadline` |
| `baseYear` | 50 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">): number` |
| `targetYear` | 60 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">): number` |
| `graduationOverride` | 71 | fn | `(A: Answers): string \| null` |
| `rulesSetOf` | 80 | fn | `(A: Answers): string[]` |
| `namedUniTeachesInEnglish` | 94 | fn | `(A: Answers, rules: Pick<RulesSnapshot, "scholarships">, routes: readonly string[]): boolean` |
| `derive` | 98 | fn | `(A: Answers, ctx: Pick<EngineCtx, "today" \| "rules">): Derived` |
| `cycleFor` | 18 | fn | `(r: any, gy: number): any` |
| `ownSource` | 23 | fn | `(d: DeadlineRow): boolean` |
| `deadlineUnsure` | 24 | fn | `(d: DeadlineRow, r: { needs_verification?: boolean \| undefined; } \| undefined): boolean` |
| `ageOn` | 86 | fn | `(dob: string, today: string): number` |

### endings.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `realText` | 28 | fn | `(v: unknown): boolean` |
| `realAnswer` | 52 | fn | `(v: unknown, q?: AskedQ \| null \| undefined): boolean` |
| `profilePay` | 78 | fn | `(coins: number, answered: number, asked: number): { ending: Ending; coins: number; }` |
| `dayCount` | 102 | fn | `(tasks: CountedTask[]): DayCount` |
| `ENDINGS` | 22 | value | `readonly Ending[]` |
| `isEnding` | 23 | fn | `(s: unknown): s is Ending` |
| `TRIED_COINS` | 25 | value | `0` |
| `LISTS_SHE_BUILDS` | 51 | value | `readonly string[]` |
| `optionalQ` | 72 | fn | `(q?: AskedQ \| null \| undefined): boolean` |
| `countsAnswered` | 73 | fn | `(v: unknown, q?: AskedQ \| null \| undefined): boolean` |

### feasibility.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `feasibility` | 31 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules" \| "lang">): Feasibility` |
| `minCostUsd` | 17 | fn | `(band: string \| undefined): number \| null` |
| `budgetUsd` | 19 | fn | `(A: Answers): number \| null` |
| `ageCap` | 21 | fn | `(s: string \| undefined): number \| null` |

### flags.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `consistencyFlags` | 13 | fn | `(student: Answers, parent: Answers, D: Derived, cap: Capacity, ctx: Pick<EngineCtx, "rules" \| "lang">): Flag[]` |

### goal.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `goalUntilChosen` | 54 | fn | `(year?: number \| null): GoalStandIn` |
| `goalOf` | 76 | fn | `(A: Answers, fe: Pick<Feasibility, "rows"> \| null, year: number, lang?: "en" \| "uz" \| "ru"): Goal \| null` |
| `UNI_SHORT` | 13 | value | `Record<string, string>` |
| `UNI_PHOTO` | 26 | value | `Record<string, { photo: string; credit: Credit; }>` |
| `DREAM_UNTIL_CHOSEN` | 43 | value | `"MIT"` |
| `dreamUntilChosen` | 45 | fn | `(lang?: "en" \| "uz" \| "ru"): string` |
| `standInNote` | 70 | fn | `(lang: "en" \| "uz" \| "ru", firstRunDone: boolean): GoalNote` |

### guardrails.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `g1Dates` | 21 | fn | `(n: Narration, tasks: DailyTask[], inputs: unknown): string[]` |
| `g2Names` | 26 | fn | `(n: Narration, tasks: DailyTask[], inputs: unknown): string[]` |
| `g3Language` | 32 | fn | `(n: Narration, tasks: DailyTask[], R: Roadmap, flags: Flag[], lang?: "en" \| "uz" \| "ru"): string[]` |
| `g4Tasks` | 39 | fn | `(tasks: DailyTask[], R: Roadmap, D: Derived, A: Answers): string[]` |
| `g5Child` | 56 | fn | `(stage: Stage, n: Narration, tasks: DailyTask[], R: Roadmap, flags: Flag[], lang?: "en" \| "uz" \| "ru"): string[]` |
| `g8Stable` | 65 | fn | `(before: Roadmap, after: Roadmap): string[]` |
| `g9Unlock` | 79 | fn | `(fe: Feasibility): string[]` |
| `SCHOLARSHIPS` | 15 | value | `string[]` |
| `UNI_NAMES` | 16 | fn | `(): any[]` |
| `g7Sources` | 63 | fn | `(R: Roadmap): string[]` |
| `g10Checkpoints` | 88 | fn | `(R: Roadmap): string[]` |

### i18n/index.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `raw` | 20 | fn | `(lang: "en" \| "uz" \| "ru", key: string): string` |
| `trn` | 29 | fn | `(lang: "en" \| "uz" \| "ru", key: string, n: number, p?: Params): string` |
| `LANGS` | 11 | value | `readonly ["en", "uz", "ru"]` |
| `isLang` | 13 | fn | `(v: unknown): v is "en" \| "uz" \| "ru"` |
| `TABLES` | 15 | value | `Record<"en" \| "uz" \| "ru", Readonly<Record<string, string>>>` |
| `hasKey` | 18 | fn | `(key: string): boolean` |
| `tr` | 27 | fn | `(lang: "en" \| "uz" \| "ru", key: string, p?: Params \| undefined): string` |
| `fromEnglish` | 35 | fn | `(lang: "en" \| "uz" \| "ru", english: string): string` |
| `monthYearL` | 39 | fn | `(lang: "en" \| "uz" \| "ru", s: string \| null \| undefined): string` |
| `dayL` | 48 | fn | `(lang: "en" \| "uz" \| "ru", s: string \| null \| undefined): string` |
| `usd` | 54 | fn | `(lang: "en" \| "uz" \| "ru", n: number): string` |

### labels.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `routeName` | 93 | fn | `(id: string, lang?: "en" \| "uz" \| "ru"): string` |
| `L` | 3 | value | `Record<string, string>` |
| `LQ` | 24 | value | `Record<string, Record<string, string>>` |
| `COUNTRY` | 34 | value | `Record<string, { code: string; name: string; }>` |
| `LANG` | 40 | value | `Record<string, string>` |
| `FIELD` | 42 | value | `Record<string, string>` |
| `UNIS` | 45 | value | `[string, string, string][]` |
| `RULES_OF` | 67 | value | `Record<string, string>` |
| `human` | 68 | fn | `(id: unknown): string` |
| `fieldName` | 77 | fn | `(lang: "en" \| "uz" \| "ru", key: unknown): string \| null` |
| `label` | 78 | fn | `(q: string, v: string): string` |
| `FEAS_NAME` | 80 | value | `Record<string, string>` |
| `DEADLINE_PREFIX` | 81 | value | `Record<string, string>` |
| `rungName` | 83 | fn | `(lang: "en" \| "uz" \| "ru", rung: string): string` |
| `examName` | 84 | fn | `(lang: "en" \| "uz" \| "ru", id: string): string` |
| `countryName` | 85 | fn | `(lang: "en" \| "uz" \| "ru", code: string): string` |
| `trackName` | 89 | fn | `(lang: "en" \| "uz" \| "ru", track: string, A?: { m6_activities?: unknown; } \| undefined): string` |
| `axisName` | 91 | fn | `(lang: "en" \| "uz" \| "ru", axis: string): string` |
| `routePrefix` | 100 | fn | `(lang: "en" \| "uz" \| "ru", id: string): string` |
| `isHomeRoute` | 101 | fn | `(id: string): boolean` |

### ladders.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `mathGoalTop` | 28 | fn | `(grade: number \| null \| undefined, shown: number): number` |
| `gapMonths` | 40 | fn | `(rules: RulesSnapshot, from: string, to: string): number` |
| `CEFR` | 4 | value | `string[]` |
| `RUNGS` | 5 | value | `string[]` |
| `engOf` | 8 | fn | `(D: { english_level?: string \| undefined; english_tested?: string \| undefined; }): string \| undefined` |
| `lessonLevel` | 10 | fn | `(D: { english_level?: string \| undefined; english_tested?: string \| undefined; }): string` |
| `classRung` | 12 | fn | `(grade: number): string` |
| `classCefr` | 20 | fn | `(grade: number): string` |
| `classCovers` | 38 | fn | `(grade: number): number` |
| `ENGLISH_HOURS_MIN` | 44 | value | `5` |
| `paceMonths` | 52 | fn | `(months: number, hoursAWeek: number): number` |
| `paceOf` | 55 | fn | `(hoursAWeek: number): "none" \| "own" \| "rule"` |
| `toCefr` | 57 | fn | `(test: string, s: number): "B1" \| "B2" \| "A2" \| "C1" \| "C2" \| null` |

### learner/elo.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `eloUpdate` | 31 | fn | `(skill: { theta: number; answers: number; }, item: { b: number; answers: number; }, ok: boolean, guess?: number): { p: number; theta: number; b: number; }` |
| `masteryOf` | 50 | fn | `(theta: number, answers: number, ref: number): "attempted" \| "familiar" \| "proficient" \| "mastered" \| null` |
| `skillAt` | 68 | fn | `(row: SkillRow, theta: number, o: { answered: boolean; ref: number; at: string; }): SkillRow` |
| `logistic` | 12 | fn | `(x: number): number` |
| `ELO_SKILL_K` | 17 | value | `KRule` |
| `ELO_ITEM_K` | 20 | value | `KRule` |
| `ELO_LIMIT` | 22 | value | `6` |
| `GUESS_MC` | 24 | value | `0.25` |
| `kOf` | 26 | fn | `(answers: number, rule?: KRule): number` |
| `pCorrect` | 27 | fn | `(theta: number, b: number, guess?: number): number` |
| `MASTERY` | 37 | value | `readonly ["attempted", "familiar", "proficient", "mastered"]` |
| `MASTERY_RULES` | 44 | value | `Readonly<Record<"familiar" \| "proficient" \| "mastered", { p: number; answers: number; }>>` |
| `atLeastProficient` | 56 | fn | `(m: "attempted" \| "familiar" \| "proficient" \| "mastered" \| null \| undefined): m is "proficient" \| "mastered"` |
| `credited` | 58 | fn | `(theta: number, ref: number): boolean` |

### learner/quiz.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `sheetsOf` | 47 | fn | `(n: number): number[]` |
| `ladderOf` | 60 | fn | `(pool: readonly Cand[]): Unit[]` |
| `quizSize` | 67 | fn | `(minutes: number, pool: readonly Cand[], unit: string): number` |
| `quizMinutes` | 73 | fn | `(items: number, pool: readonly Cand[], unit: string): number` |
| `startOf` | 89 | fn | `(ladder: readonly Unit[], prior: number \| null \| undefined): Unit \| null` |
| `seedOf` | 97 | fn | `(ladder: readonly Unit[], bel: Belief): { theta: number; from: "cat" \| "default" \| "track"; }` |
| `passed` | 111 | fn | `(u: Unit, ladder: readonly Unit[], bel: Belief): boolean` |
| `frontierOf` | 118 | fn | `(ladder: readonly Unit[], bel: Belief): string \| null` |
| `unlocked` | 123 | fn | `(unit: string, ladder: readonly Unit[], bel: Belief): boolean` |
| `besideOf` | 144 | fn | `(ladder: readonly Unit[], at: number, bel: Belief, levelAt?: (i: number) => number): string \| null \| undefined` |
| `supplyOf` | 224 | fn | `(i: SupplyIn): Supply` |
| `composeQuiz` | 253 | fn | `(i: ComposeIn): Pick[]` |
| `P_BAND` | 18 | value | `readonly [number, number]` |
| `NEW_P_MAX` | 26 | value | `0.9` |
| `NEW_REACH` | 28 | value | `1` |
| `REPEAT_GAP_DAYS` | 34 | value | `7` |
| `REVIEW_SHARE` | 37 | value | `0.4` |
| `CURRENT_SHARE` | 39 | value | `0.6` |
| `QUIZ_MIN` | 41 | value | `3` |
| `QUIZ_MAX` | 42 | value | `20` |
| `SHEET_MAX` | 45 | value | `10` |
| `WHY_SEC` | 52 | value | `15` |
| `DEFAULT_START_P` | 54 | value | `0.7` |
| `thetaOf` | 102 | fn | `(ladder: readonly Unit[], bel: Belief): number` |

### learner/srs.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `reviewCard` | 26 | fn | `(s: SrsState \| null, ok: boolean, now: Date): SrsState` |
| `SRS_RETENTION` | 11 | value | `0.9` |
| `isDue` | 30 | fn | `(s: SrsState \| null \| undefined, now: Date): boolean` |
| `retrievability` | 32 | fn | `(s: SrsState, now: Date): number` |

### lessons/dtm-mock.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `dtmSittingOf` | 40 | fn | `(tracks: readonly string[], group: "uz" \| "ru"): DtmSitting \| null` |
| `dtmScore` | 73 | fn | `(blocks: readonly SitBlock[], rights: readonly number[]): DtmScore` |
| `dtmPassMark` | 83 | fn | `(uni: string, pick: { university_id?: unknown; code?: unknown; lang?: unknown; } \| null \| undefined): DtmPassMark \| null` |
| `DTM_FORMAT` | 28 | value | `{ readonly minutes: number; readonly needs_verification: boolean; readonly minutes_source: string \| null; readonly points: Record<BlockId, number>; readonly m…` |
| `dtmEndsAt` | 67 | fn | `(startedAt: Date, minutes: number): Date` |

### lessons/exam-days.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `examDaysOf` | 21 | fn | `(R: Roadmap, rules: Pick<RulesSnapshot, "destinations" \| "testCalendars">, from: string, to: string): Set<string>` |

### lessons/levels.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `applySitting` | 52 | fn | `(s0: SkillState, sitting: Sitting): SittingResult` |
| `skillLine` | 115 | fn | `(r: Pick<SittingResult, "why" \| "from" \| "to" \| "right" \| "of">, unit: string, lang: "en" \| "uz" \| "ru"): string` |
| `courseLine` | 134 | fn | `(c: { title: string; done: number; of: number; section: { title: string; proficient: number; of: number; } \| null; }, lang: "en" \| "uz" \| "ru"): string` |
| `LEVELS` | 31 | value | `readonly Level[]` |
| `PASS_NUM` | 32 | value | `2` |
| `PASS_DEN` | 32 | value | `3` |
| `PASS_MIN` | 32 | value | `2` |
| `MASTERY_GAP_DAYS` | 32 | value | `3` |
| `MASTERY_RIGHTS` | 32 | value | `2` |
| `FALL_RUN` | 32 | value | `2` |
| `NEW_SKILL` | 40 | value | `SkillState` |
| `passLine` | 46 | fn | `(n: number): number` |
| `isPass` | 47 | fn | `(right: number, of: number): boolean` |
| `levelName` | 101 | fn | `(l: Level \| null, lang: "en" \| "uz" \| "ru"): string` |
| `levelDots` | 103 | fn | `(l: Level \| null): string` |
| `nextHint` | 129 | fn | `(l: Level \| null, lang: "en" \| "uz" \| "ru"): string \| null` |

### lessons/mock.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `mockKindOf` | 33 | fn | `(i: { today: string; sat: { bound: boolean; due: string \| null; }; dtm: { path: boolean; due: string \| null; lastYear: boolean; }; }): MockKind \| null` |
| `mockSaturdays` | 43 | fn | `(from: string, due: string \| null, n: number): string[]` |
| `mockPlanOf` | 83 | fn | `(i: { kind: MockKind; today: string; due: string \| null; lang: "en" \| "uz" \| "ru"; } & Partial<DtmShape>): MockPlan \| null` |
| `satMockResult` | 103 | fn | `(s: SatScores, last: SatScores \| null): { ok: true; total: number; rw: number; math: number; change: number \| null; } \| { ok: false; }` |
| `MOCK_WINDOW_DAYS` | 24 | value | `7` |
| `SAT_STRUCTURE` | 28 | value | `{ readonly source: { readonly url: "https://satsuite.collegeboard.org/sat/whats-on-the-test/structure"; readonly verified_at: "2026-10-13"; }; readonly rw: { r…` |

### lessons/sat-full.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `formProblems` | 68 | fn | `(raw: unknown): string[]` |
| `mixProblems` | 102 | fn | `(form: SatForm, domainOf: (id: string) => string \| null): string[]` |
| `stageMinutes` | 119 | fn | `(form: SatForm): Record<StageId, number>` |
| `timeline` | 125 | fn | `(startedAt: number, minutes: Record<StageId, number>, ended: Partial<Record<StageId, number>>): Span[]` |
| `stageAt` | 137 | fn | `(tl: readonly Span[], now: number): { id: StageId \| null; k: number; left_s: number; start: number; end: number; }` |
| `parseSpr` | 163 | fn | `(raw: unknown): number \| null` |
| `sprRight` | 172 | fn | `(raw: unknown, value: number, tolerance: number): boolean` |
| `answerText` | 179 | fn | `(value: number, lang: "en" \| "uz" \| "ru"): string` |
| `scoreSitting` | 203 | fn | `(items: readonly ScoredItem[], seconds: Partial<Record<StageId, number>>, route: Record<SatSection, "m2e" \| "m2h">): SatResult` |
| `SAT_MODULE_SIZE` | 34 | value | `Readonly<Record<SatSection, number>>` |
| `BREAK_MINUTES` | 35 | value | `10` |
| `SAT_SOURCES` | 36 | value | `{ readonly structure: "https://satsuite.collegeboard.org/sat/whats-on-the-test/structure"; readonly rw: "https://satsuite.collegeboard.org/k12-educators/about/…` |
| `DOMAINS` | 43 | value | `Readonly<Record<SatSection, readonly string[]>>` |
| `DOMAIN_MIX` | 48 | value | `Readonly<Record<SatSection, { m1: readonly number[]; m2: readonly number[]; }>>` |
| `DOMAIN_NAMES` | 53 | value | `Readonly<Record<string, Tri>>` |
| `parseForm` | 100 | fn | `(raw: unknown): SatForm \| null` |
| `STAGES` | 116 | value | `readonly StageId[]` |
| `MODULE_STAGES` | 117 | value | `readonly ("rw1" \| "rw2" \| "math1" \| "math2")[]` |
| `sectionOf` | 118 | fn | `(s: "rw1" \| "rw2" \| "math1" \| "math2"): SatSection` |
| `routeOf` | 144 | fn | `(rightInM1: number, threshold: number): "m2e" \| "m2h"` |
| `ROUTE_WORDS` | 147 | value | `Readonly<Record<"m2e" \| "m2h", Tri>>` |
| `satFullCoins` | 222 | fn | `(modules: readonly { right: number; of: number; }[]): number` |

### lessons/turns.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `mathTurnOf` | 37 | fn | `(i: TurnInput): { course: MathCourse; why: TurnWhy; }` |
| `examsOfRoadmap` | 52 | fn | `(R: { milestones: { id: string; due?: string \| null \| undefined; status?: string \| undefined; }[]; }, A: { m1_status?: unknown; m1_grade?: unknown; }, dtmPath: boolean, today: string): Pick<TurnInput, "sat" \| "dtm">` |
| `satWithRemedy` | 67 | fn | `(sat: { step: PlayStep; rung: string \| null; }[], at: string \| undefined, c2: PlayStep[]): PlayStep[]` |
| `SAT_MILESTONES` | 48 | value | `string[]` |
| `STATE_TEST_MILESTONE` | 48 | value | `"m_UZ_HOME_state_test"` |
| `LAST_GRADE` | 50 | value | `11` |

### lessons/unit-test.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `unitTestOffer` | 36 | fn | `(i: UnitTestInput): UnitTestOffer` |
| `UNIT_TEST_MIN` | 18 | value | `6` |
| `UNIT_TEST_MAX` | 18 | value | `8` |
| `UNIT_TEST_GAP_DAYS` | 18 | value | `3` |
| `unitTestSize` | 21 | fn | `(fresh: number): number` |

### narrate.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `narrateCode` | 15 | fn | `(R: Roadmap, D: Derived, next: string[], lang?: "en" \| "uz" \| "ru", hours?: number \| undefined): Narration` |

### phase-d-copy.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `pdT` | 240 | fn | `(lang: "en" \| "uz" \| "ru", key: string, p?: Record<string, string \| number> \| undefined): string` |
| `PD_COPY` | 9 | value | `Record<string, Record<"en" \| "uz" \| "ru", string>>` |

### phase-d.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `coreQueue` | 119 | fn | `(A: Answers, D: Derived, ctx: Ctx, asked?: readonly string[]): DQ[]` |
| `checksPutOff` | 136 | fn | `(A: Answers, D: Derived, ctx: Ctx): string[]` |
| `deepQueue` | 166 | fn | `(A: Answers, D: Derived, ctx: Ctx, asked?: readonly string[]): DQ[]` |
| `nextChunk` | 194 | fn | `(queue: DQ[], maxQ?: number): Chunk \| null` |
| `chunkPlan` | 230 | fn | `(queue: DQ[]): Chunk[]` |
| `parentQueue` | 238 | fn | `(A: Answers, D: Derived, ctx: Ctx): string[]` |
| `modulesDone` | 249 | fn | `(A: Answers, D: Derived, ctx: Ctx, asked?: readonly string[]): string[]` |
| `parentTasks` | 266 | fn | `(A: Answers, D: Derived, consent: boolean, ctx: Ctx, statuses?: readonly string[]): ParentQuestionTask[]` |
| `composeDay` | 313 | fn | `(inp: DayInput): DayItem[]` |
| `diagnosticComplete` | 365 | fn | `(c: CompleteInput): Completion` |
| `CHUNK_MAX_Q` | 38 | value | `6` |
| `CHUNK_MIN_Q` | 38 | value | `3` |
| `CHUNK_MAX_SEC` | 38 | value | `number` |
| `SEC_BY_TYPE` | 43 | value | `Record<string, number>` |
| `secOf` | 48 | fn | `(type: string): number` |
| `VOI_ORDER` | 51 | value | `Record<Stage, string[]>` |
| `MODEL_INPUTS_FIRST` | 58 | value | `string[]` |
| `FIRST_IN_MODULE` | 60 | value | `Partial<Record<Stage, string[]>>` |
| `NEVER_ASKED` | 62 | value | `readonly ["m11_last_cycle", "m9_why"]` |
| `isParentSource` | 64 | fn | `(q: Pick<Question, "id" \| "audience">): boolean` |
| `FIRST_RUN_MIN` | 87 | value | `readonly ["m1_status", "m1_grade", "m2_destinations", "m2_dream_unis"]` |
| `FIRST_RUN_KEY` | 91 | value | `"first_run"` |
| `shortFirstRun` | 92 | fn | `(A: Answers): boolean` |
| `CHECK_OF` | 94 | value | `Record<Skill, string>` |
| `CORE_NOT_DAILY` | 95 | value | `readonly string[]` |
| `CORE_FIRST` | 113 | value | `readonly string[]` |
| `IDENTITY_LAST` | 115 | value | `readonly string[]` |
| `LIST_SCREENS` | 116 | value | `readonly string[]` |
| `STILL_TO_ASK` | 155 | value | `Record<string, (A: Answers) => boolean>` |
| `settled` | 163 | fn | `(id: string, A: Answers): boolean` |
| `DAY_MAX_Q` | 213 | value | `3` |
| `PLAN_READS` | 221 | value | `readonly string[]` |
| `planQueue` | 228 | fn | `(queue: DQ[]): DQ[]` |
| `PARENT_QUESTION_TASKS` | 261 | value | `ParentQuestionTask[]` |
| `MINUTES` | 302 | value | `{ readonly check: 5; readonly reading: 4; readonly practice: 3; readonly consent: 5; readonly keeper: 5; readonly dated: 10; }` |
| `PRIOR_SE` | 304 | value | `1.25` |
| `checksOwed` | 307 | fn | `(checks: SkillProgress[]): SkillProgress[]` |
| `readingToday` | 310 | fn | `(r: ReadingState, day: number): 1 \| 2 \| null` |
| `practiceSkill` | 340 | fn | `(day: number, english: boolean): Skill` |
| `TIMEOUT_DAYS` | 343 | value | `21` |
| `PARENT_WAIT_DAYS` | 343 | value | `7` |

### pipeline.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `runPipeline` | 28 | fn | `(inp: PipelineInput, ctx: EngineCtx): PipelineResult` |

### plan.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `routeUniLines` | 60 | fn | `(u: RouteUni, l: "en" \| "uz" \| "ru", o?: { today?: string \| undefined; from?: number \| undefined; }): string` |
| `routeStepWords` | 80 | fn | `(rec: Record<string, any>, id: string, step: RouteStep, picked: readonly (string \| undefined)[], l: "en" \| "uz" \| "ru", dated: boolean, o?: { today?: string \| undefined; from?: number \| undefined; }): { titleKey: string; why: string; says: string; menu: …` |
| `plan` | 109 | fn | `(inp: PlanInput, prev: Roadmap \| null, ctx: EngineCtx): PlanResult` |
| `OLY_LEVELS` | 23 | value | `string[]` |
| `TRACK_MILESTONES` | 32 | value | `Record<Track, string[]>` |
| `ROUTE_RECORD` | 35 | value | `Record<string, string>` |
| `ROUTE_KINDS` | 37 | value | `readonly string[]` |
| `ROUTE_STEPS` | 40 | value | `readonly (readonly [RouteStep, string, "p2" \| "p3"])[]` |
| `openIntakes` | 59 | fn | `(u: Pick<RouteUni, "intakes">, o?: { today?: string \| undefined; from?: number \| undefined; }): { kind: string; year: number; opens: string; closes: string; results?: string \| undefined; }[]` |
| `canUnlock` | 107 | fn | `(fe: Feasibility, parallel: string[]): boolean` |

### profile.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `roleLine` | 39 | fn | `(stage: string \| null \| undefined, grade: string \| null \| undefined, sep?: string): string` |
| `profileFacts` | 46 | fn | `(A: Answers \| null \| undefined, goal: Goal \| null \| undefined): ProfileFacts` |

### readiness.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `along` | 88 | fn | `(pts: readonly [number, number][], x: number): number` |
| `ieltsOf` | 127 | fn | `(t: Row): number \| null` |
| `officialSitting` | 145 | fn | `(A0: Answers): { test: "SAT" \| "ACT"; sat: number; } \| null` |
| `testBars` | 156 | fn | `(A0: Answers): { tier: "A" \| "B" \| "C"; sat: number; ielts: number; }` |
| `scaleReadinessFor` | 349 | fn | `(A0: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, uni: string \| null, route: string \| null, ev?: Evidence \| undefined): Readiness` |
| `scaleReadinessOf` | 366 | fn | `(A0: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">): ScaleReadiness` |
| `chanceViewOf` | 407 | fn | `(A0: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules"> & { lang?: "en" \| "uz" \| "ru" \| undefined; }, id: string): ChanceView \| null` |
| `admissionsOf` | 444 | fn | `(A0: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules"> & { lang?: "en" \| "uz" \| "ru" \| undefined; }): { goal: string \| null; chosen: string[]; results: Record<string, AdmResult>; }` |
| `readinessOf` | 455 | fn | `(A0: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules"> & { lang?: "en" \| "uz" \| "ru" \| undefined; }): GoalReadiness` |
| `READINESS_VERSION` | 48 | value | `4` |
| `SCALE_VERSION` | 50 | value | `3` |
| `READINESS_DISPLAY` | 53 | value | `"chance" \| "scale"` |
| `TIERS` | 59 | value | `{ cap: number; bands: Record<"A" \| "B" \| "C", Band>; profile_shares: Record<ProfileKey, number>; uz: { ready: number; top: number; }; unis: Record<string, Un…` |
| `READY_CAP` | 61 | value | `number` |
| `ESTIMATE` | 63 | value | `number` |
| `PARTIAL` | 65 | value | `{ readonly shown: 0.5; readonly self: 0.25; }` |
| `uniTierOf` | 67 | fn | `(id: string): UniTier \| null` |
| `ACT_TO_SAT` | 100 | value | `Readonly<Record<number, number>>` |
| `TOEFL_TO_IELTS` | 109 | value | `readonly [number, number][]` |
| `TOEFL16_TO_IELTS` | 115 | value | `readonly [number, number][]` |
| `CEFR_TO_IELTS` | 118 | value | `Readonly<Record<string, number>>` |
| `officialIelts` | 151 | fn | `(A0: Answers): number \| null` |
| `PROFILE_SOURCES` | 164 | value | `{ readonly olympiads: readonly ["m3_olympiads"]; readonly honors: readonly ["m3_honors", "m6_honors"]; readonly activities: readonly ["m6_activities"]; readonl…` |
| `NAME_ONLY` | 195 | value | `0.1` |
| `NAME_ONLY_MAX` | 195 | value | `0.3` |
| `DEPTH_HOURS` | 202 | value | `500` |
| `chanceNumber` | 414 | fn | `(v: Pick<ChanceView, "value" \| "state"> \| null \| undefined): number \| null` |
| `CHANCE_ANY` | 418 | value | `Record<"en" \| "uz" \| "ru", string>` |
| `CHANCE_AFTER` | 429 | value | `Record<"en" \| "uz" \| "ru", string>` |
| `CHANCE_START` | 437 | value | `Record<"en" \| "uz" \| "ru", string>` |
| `chanceStart` | 439 | fn | `(lang: "en" \| "uz" \| "ru"): ChanceStart` |
| `chanceEarly` | 440 | fn | `(A0: Answers, D: Pick<Derived, "english_tested" \| "math_tested">): boolean` |

### required-tests.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `requiredTests` | 25 | fn | `(A: Answers, D: Pick<Derived, "rules_set">, rules: RulesSnapshot): RequiredTest[]` |
| `uniRouteTests` | 66 | fn | `(uni: string): UniTest[]` |
| `trimRequiredTests` | 78 | fn | `(A: Answers, D: Pick<Derived, "rules_set">, rules: RulesSnapshot): Answers` |
| `RULE_UNI` | 15 | value | `Record<string, string>` |

### rules-expiry.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `expiringDates` | 40 | fn | `(records: RuleRecord[], today: string, days?: number): ExpiryItem[]` |

### rules.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `seedRecords` | 83 | fn | `(): RuleRecord[]` |
| `stubRecord` | 100 | fn | `(id: string): RuleRecord` |
| `snapshotFromRecords` | 106 | fn | `(records: RuleRecord[]): RulesSnapshot` |
| `PLANNER_RULES` | 47 | value | `Record<string, string>` |
| `RECORD_VERSIONS` | 73 | value | `Record<string, number>` |
| `seedSnapshot` | 129 | fn | `(): RulesSnapshot` |
| `countryProfile` | 132 | fn | `(rules: RulesSnapshot, code: string): any` |
| `ruleOf` | 134 | fn | `(rules: RulesSnapshot, id: string): any` |
| `scholarshipOf` | 135 | fn | `(rules: RulesSnapshot, id: string): any` |

### schedule/adapt.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `paceUpdate` | 47 | fn | `(pace: number, actualMin: number, estimateMin: number): number` |
| `c7Of` | 52 | fn | `(days: { rest: boolean; required: number; done: number; }[]): number \| null` |
| `weeklyLoad` | 57 | fn | `(s: SchedState, c7: number \| null, weekStart: string): SchedState` |
| `closeDay` | 74 | fn | `(s: SchedState, d: { date: string; rest: boolean; required: number; done: number; }): SchedState` |
| `skipUpdate` | 82 | fn | `(s: SchedState, kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway", outcome: "done" \| "skipped"): { state: SchedState; checkpoint: boolean; }` |
| `projection` | 93 | fn | `(remainingMin: number, ratePerWeek: number, weeksToDue: number): { weeks: number; laxity: number; slips: boolean; }` |
| `PACE_MIN` | 20 | value | `0.6` |
| `PACE_MAX` | 20 | value | `1.6` |
| `PACE_ALPHA` | 20 | value | `0.3` |
| `C7_LOW` | 21 | value | `0.6` |
| `C7_HIGH` | 21 | value | `0.9` |
| `PACE_FAST` | 21 | value | `0.9` |
| `LOAD_CUT` | 21 | value | `0.85` |
| `LOAD_MORE` | 21 | value | `1.1` |
| `OFFER_WEEKS` | 21 | value | `2` |
| `OFFER_PCT` | 21 | value | `10` |
| `SKIPS_TO_SHORT` | 22 | value | `3` |
| `SKIPS_TO_CHECKPOINT` | 22 | value | `5` |
| `RESTART_TASKS` | 22 | value | `2` |
| `NEW_STATE` | 42 | value | `SchedState` |
| `acceptOffer` | 70 | fn | `(s: SchedState): SchedState` |
| `declineOffer` | 71 | fn | `(s: SchedState): SchedState` |
| `basisChanged` | 104 | fn | `(batchRoadmapId: string \| null, currentRoadmapId: string): boolean` |

### schedule/allocate.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `breaksOf` | 36 | fn | `(rules: Pick<RulesSnapshot, "destinations">): Break[]` |
| `dayBudgetX` | 45 | fn | `(cad: Cadence, weekday: number, stage: string, factor: number): number` |
| `sitFactsOf` | 63 | fn | `(s: Sit): SitFacts \| null` |
| `allocateWeek` | 92 | fn | `(inp: AllocInput): WeekPlan` |
| `LONG_FROM` | 26 | value | `45` |
| `SHORT_MAX` | 26 | value | `40` |
| `LONG_MAX` | 26 | value | `90` |
| `PHONE_MAX` | 26 | value | `20` |
| `LEAD_FROM_DAYS` | 27 | value | `10` |
| `LEAD_TO_DAYS` | 27 | value | `5` |
| `LAST_DAYS` | 27 | value | `3` |
| `FIXED_MIN` | 27 | value | `15` |
| `BREAK_BOOST` | 27 | value | `1.25` |
| `STREAM_FLOOR` | 27 | value | `15` |
| `leadWindow` | 32 | fn | `(due: string): { from: string; to: string; last: string; }` |

### schedule/compose.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `reviewDraft` | 79 | fn | `(lang: "en" \| "uz" \| "ru", o: { floor: 3 \| 4 \| 1 \| 2; quiz: "english" \| "math"; streak: boolean; }): { type: "practice"; short: string; title_i18n: string; instructions_i18n: string; title_en: string; est_minutes: number; verification: "quiz"; quiz: "en…` |
| `tileWords` | 126 | fn | `(day: { short: string; meta: { x: XMeta; }; }[]): string[]` |
| `composeWeek` | 137 | fn | `(inp: ComposeInput, ctx: Pick<EngineCtx, "lang" \| "engineVersion">): XTask[]` |
| `RESTART_MAX` | 40 | value | `readonly [number, number]` |
| `CATCH_UP` | 40 | value | `1.25` |
| `stepMeta` | 72 | fn | `(st: PlayStep): { proof?: StepProofSpec \| undefined; pool?: UnitPool \| undefined; fact?: string \| undefined; }` |

### schedule/copy.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `questionsN` | 248 | fn | `(lang: "en" \| "uz" \| "ru", n: number): string` |
| `xWords` | 278 | fn | `(lang: "en" \| "uz" \| "ru", template: string, seq: number, f?: XFacts): XWords` |
| `X_COPY` | 16 | value | `Record<string, Line>` |
| `xT` | 240 | fn | `(lang: "en" \| "uz" \| "ru", key: string, params?: Record<string, string>): string` |
| `xDate` | 246 | fn | `(lang: "en" \| "uz" \| "ru", d: string): string` |
| `DTM_BLOCKS` | 255 | value | `readonly ["dtm_math", "dtm_physics", "dtm_english", "dtm_biology", "dtm_chemistry", "dtm_history", "dtm_uz_lang_lit", "dtm_math_core", "dtm_native_uz", "dtm_na…` |
| `PRACTICE_KINDS` | 257 | value | `readonly ("english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway")[]` |
| `BUILD_KINDS` | 258 | value | `readonly ("english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway")[]` |
| `STEP_KINDS` | 259 | value | `readonly ("english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway")[]` |
| `QUICK_MAX` | 261 | value | `5` |
| `isPhaseXTemplate` | 275 | fn | `(t: string): boolean` |
| `xTemplates` | 331 | fn | `(): string[]` |
| `xRetiredTemplates` | 333 | fn | `(): string[]` |

### schedule/dtm.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `dtmMockTracksOf` | 57 | fn | `(A: Answers, plan: DtmPlan, lang: "en" \| "uz" \| "ru"): { tracks: string[]; group: "uz" \| "ru"; pick: Picked \| null; } \| null` |
| `dtmPlanOf` | 68 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru"): DtmPlan \| null` |
| `DTM_N` | 24 | value | `5` |
| `PRACTICE_DAY` | 28 | value | `RegExp` |
| `practiceDay` | 36 | fn | `(template: string): boolean` |
| `compulsoryOf` | 44 | fn | `(g: "uz" \| "ru"): string[]` |

### schedule/english.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `servedUnits` | 58 | fn | `(units: readonly EnglishUnit[], questions: readonly UnitQuestion[]): EnglishUnit[]` |
| `englishStep` | 90 | fn | `(u: EnglishUnit, ask: Tri): PlayStep \| null` |
| `englishSteps` | 106 | fn | `(level: string \| undefined, ask: Tri, units?: readonly EnglishUnit[], has?: (pool: UnitPool) => boolean): PlayStep[]` |
| `UNIT_QUESTIONS` | 51 | value | `3` |
| `C4_UNIT_RECORDS` | 63 | value | `EnglishUnit[]` |
| `C4_QUESTIONS` | 64 | value | `UnitQuestion[]` |
| `ENGLISH_UNITS` | 66 | value | `EnglishUnit[]` |
| `TEXT_QUESTIONS` | 72 | value | `ReadonlySet<string>` |
| `UNIT_WORDS` | 74 | value | `5` |
| `ENGLISH_COPY` | 76 | value | `Record<string, Tri>` |
| `lessonOf` | 113 | fn | `(st: Pick<PlayStep, "quiz" \| "pool"> \| null \| undefined): "english" \| "math" \| null` |
| `lessonTurn` | 118 | fn | `(n: number): "english" \| "math"` |

### schedule/facts.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `uzIelts` | 69 | fn | `(r: UzReq): { min: number \| null; named: number[]; }` |
| `factQuestion` | 96 | fn | `(kind: FactKind, value: number, rec: string, ask: Tri, date: (l: "en" \| "uz" \| "ru") => string): FactQuestion \| null` |
| `routeQuestion` | 110 | fn | `(recId: string, step: RouteStepName, uni: string \| null, uniName: string, date: (l: "en" \| "uz" \| "ru") => string): FactQuestion \| null` |
| `uzQuestion` | 122 | fn | `(uni: string, r: UzReq, name: (l: "en" \| "uz" \| "ru") => string, date: (l: "en" \| "uz" \| "ru") => string): FactQuestion \| null` |
| `FACT_COPY` | 26 | value | `Record<string, Tri>` |
| `factWords` | 52 | fn | `(key: string, p?: Record<string, string> \| ((l: "en" \| "uz" \| "ru") => Record<string, string>)): Tri` |
| `FACTS` | 76 | value | `readonly Fact[]` |

### schedule/forward.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `forwardTasks` | 59 | fn | `(inp: ForwardInput, lang: "en" \| "uz" \| "ru"): { lesson: ForwardDraft \| null; route: ForwardDraft \| null; }` |

### schedule/providers.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `QUIZ_OF_KIND` | 29 | value | `Partial<Record<"english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway", "english" \| "math">>` |
| `stubQuiz` | 30 | value | `QuizProvider` |
| `stubProof` | 41 | value | `ProofProvider` |

### schedule/simulate.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `simulate` | 26 | fn | `(inp: SimInput): SimResult` |

### schedule/steps.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `stepsOf` | 150 | fn | `(playbookId: string, stage: string): PlayStep[]` |
| `adminSteps` | 174 | fn | `(stage: string, routes: readonly string[], anchor: string): PlayStep[]` |
| `uzUniSteps` | 269 | fn | `(A: Answers): PlayStep[]` |
| `uzStepsFor` | 280 | fn | `(A: Answers, _rulesSet?: readonly string[] \| undefined): PlayStep[]` |
| `routeSteps` | 321 | fn | `(route: string, A: Answers, R?: Pick<Roadmap, "milestones"> \| undefined): PlayStep[]` |
| `unitSteps` | 375 | fn | `(test: UnitTest, level: string \| undefined, stage?: string, rung?: string \| undefined, order?: readonly string[] \| undefined, lessons?: Readonly<Record<string, PlayStep[]>> \| undefined): PlayStep[]` |
| `mathStart` | 468 | fn | `(rung: string \| undefined, _check?: unknown, from?: string \| null \| undefined): number` |
| `lessonRung` | 483 | fn | `(A: Answers, D: Pick<Derived, "math_tested">): string \| undefined` |
| `mathSteps` | 492 | fn | `(rung: string \| undefined, check?: unknown, from?: string \| null \| undefined): PlayStep[]` |
| `streamSteps` | 518 | fn | `(s: { kind: string; playbook_id?: string \| undefined; anchor: string; }, A: Answers, D: Pick<Derived, "stage" \| "rules_set" \| "english_tested" \| "math_tested"> & Pick<Partial<Derived>, "english_level">, R?: Pick<Roadmap, "milestones"> \| undefined, o?: { …` |
| `stepById` | 549 | fn | `(id: string): PlayStep \| null` |
| `STEP_COPY` | 188 | value | `Record<string, Tri>` |
| `stepDate` | 220 | fn | `(lang: "en" \| "uz" \| "ru", d: string): string` |
| `CARD_MIN` | 234 | value | `5` |
| `UZ_STEP_MIN` | 235 | value | `5` |
| `homeKept` | 294 | fn | `(A: Answers, rulesSet: readonly string[] \| undefined): boolean` |
| `ROUTE_STEP_MIN` | 304 | value | `5` |
| `routeCard` | 320 | fn | `(route: string, step: RouteStep, A: Answers): PlayStep \| null` |
| `sequenceUnits` | 509 | fn | `(playbookId: string): readonly string[]` |
| `setLessonStepResolver` | 547 | fn | `(f: ((id: string) => PlayStep \| null) \| null): void` |

### schedule/streak.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `closeDaysX` | 22 | fn | `(state: StreakState, days: DayOutcome[], repair: Repair \| null, o?: { weekly?: boolean \| undefined; }): { state: StreakState; events: StreakEvent[]; perDay: { date: string; freeze_used: boolean; streak_after: number; }[]; repair: Repair \| null; repaired: {…` |
| `quietHours` | 42 | fn | `(A: Answers): { from: number; to: number; }` |
| `reminderFor` | 48 | fn | `(i: { today: string; rest: boolean; requiredLeft: number; lastReminderOn: string \| null; answers: Answers; }): Reminder \| null` |
| `REPAIR_DAYS` | 16 | value | `2` |
| `dayQualifiesX` | 19 | fn | `(tasks: Pick<DailyTask, "id" \| "optional">[], doneIds: string[], completedSessions: number, rest: boolean): boolean` |

### score.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `score` | 28 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "rules" \| "lang" \| "nowIso">): Scorecard` |
| `archetype` | 91 | fn | `(sc: Scorecard, A: Answers): Archetype` |
| `effectiveAnswers` | 103 | fn | `(student: Answers, parent: Answers): Answers` |
| `THRESHOLDS` | 14 | value | `{ readonly holistic: { readonly avgGreen: 4.5; readonly avgYellow: 3.8; readonly langYellowGapMonths: 6; readonly actsGreen: 3; readonly actsYellow: 1; readonl…` |
| `ENGLISH_HOURS_MAX` | 21 | value | `7` |
| `logicOf` | 23 | fn | `(D: Derived, ctx: Pick<EngineCtx, "rules">): "holistic" \| "exam_driven" \| "hybrid"` |
| `PARENT_OUTRANKS` | 101 | value | `RegExp` |

### strategy/capacity.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `weekCapacity` | 20 | fn | `(D: Derived, A: Answers, skeleton: Roadmap \| null, weekStart: string): number` |
| `hoursOf` | 18 | fn | `(A: Answers): number` |
| `weekZero` | 27 | fn | `(plannedOn: string): string` |
| `weekStartOf` | 29 | fn | `(week0: string, k: number): string` |
| `weekOf` | 31 | fn | `(week0: string, date: string): number` |

### strategy/catalogs.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `sittingsOf` | 131 | fn | `(rules: Pick<RulesSnapshot, "destinations" \| "testCalendars">): Sitting[]` |
| `PLAYBOOK_BANKS` | 39 | value | `Partial<Record<"english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway", readonly ("C8" \| "C1…` |
| `uzProgrammeId` | 93 | fn | `(r: Pick<UzRow, "uni" \| "lang" \| "code">): string` |
| `UZ_PROGRAMME_IDS` | 95 | value | `readonly string[]` |
| `uzProgrammeOf` | 97 | fn | `(id: string): UzRow \| null` |
| `subjectSetOf` | 99 | fn | `(r: Pick<UzRow, "subject_1" \| "subject_2">): string` |
| `isLanguageFirst` | 101 | fn | `(id: string): boolean` |
| `CATALOGS` | 103 | value | `{ readonly playbooks: readonly Playbook[]; readonly olympiads: readonly Olympiad[]; readonly adminTemplates: readonly AdminTemplate[]; readonly unis: readonly …` |
| `playbookOf` | 110 | fn | `(id: string): Playbook \| null` |
| `olympiadOf` | 111 | fn | `(id: string): Olympiad \| null` |
| `playbooksFor` | 113 | fn | `(kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"): Playbook[]` |
| `sittingId` | 129 | fn | `(s: Pick<Sitting, "test" \| "date">): string` |
| `envFor` | 152 | fn | `(skeleton: Pick<Roadmap, "milestones">, over?: Partial<StrategyEnv>): StrategyEnv` |

### strategy/copy.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `RATIONALE` | 9 | value | `Record<"english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway", Record<"en" \| "uz" \| "ru", …` |
| `codeLines` | 66 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/dated.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `uniDeadlines` | 25 | fn | `(rules: Pick<RulesSnapshot, "destinations">, route: string, key: string, year: number): UniDeadline[]` |
| `intakeDays` | 45 | fn | `(rules: Pick<RulesSnapshot, "destinations">, route: string, key: string, year: number): { first: string; last: string; carried: boolean; } \| null` |
| `scoresOn` | 58 | fn | `(rules: Pick<RulesSnapshot, "destinations">, date: string): string \| null` |
| `ieltsDays` | 70 | fn | `(rules: Pick<RulesSnapshot, "testCalendars">, today: string, shown?: number): IeltsDays \| null` |

### strategy/fallback.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `strategyInputOf` | 61 | fn | `(A0: Answers, D: Derived, skeleton: Roadmap, ctx: Pick<EngineCtx, "today" \| "rules" \| "lang">): StrategyInput` |
| `ownAnchor` | 92 | fn | `(kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway", m: Pick<Milestone, "id" \| "kind" \| "route" \| "hard_deadline">): boolean` |
| `fallbackStrategy` | 112 | fn | `(inp: StrategyInput): { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gat…` |
| `DROP_ORDER` | 70 | value | `readonly ("english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway")[]` |
| `DEFAULT_MINUTES` | 72 | value | `Record<"english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway", number>` |
| `OPEN_HORIZON_WEEKS` | 77 | value | `52` |
| `UZ_FIRST_WEEKS` | 77 | value | `8` |
| `PATHWAY_WEEKS` | 77 | value | `12` |
| `TEST_PREP_WEEKS` | 79 | value | `16` |
| `ADMIN_LEAD_WEEKS` | 79 | value | `8` |

### strategy/field.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `FIELD_CATEGORY` | 22 | value | `Readonly<Record<string, readonly string[]>>` |
| `PLAYBOOK_FIELDS` | 31 | value | `Readonly<Record<string, readonly string[]>>` |
| `fieldsOf` | 34 | fn | `(playbookId: string): readonly string[] \| null` |
| `knownField` | 36 | fn | `(field: unknown): string \| null` |
| `fitsField` | 38 | fn | `(playbookId: string, field: unknown): boolean` |

### strategy/fit.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `fitOf` | 43 | fn | `(inp: Pick<StrategyInput, "derived" \| "answers" \| "skeleton" \| "admissions" \| "plannedOn">, rules: RulesSnapshot): FitCtx` |
| `routeOfUni` | 40 | fn | `(uni: string): string \| null` |

### strategy/gaps.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `gapsOf` | 67 | fn | `(results: readonly R[], threshold?: number): Gap[]` |
| `GAP_CODES` | 18 | value | `readonly ["gate.english_min", "gap.english", "gap.sat", "gap.ec_E4", "gap.ec_E3", "gap.ec_E2", "gate.pathway_foundation", "gate.minimum", "funding.need", "uz.p…` |
| `isGapCode` | 33 | fn | `(v: unknown): v is "gate.english_min" \| "gap.english" \| "gap.sat" \| "gap.ec_E4" \| "gap.ec_E3" \| "gap.ec_E2" \| "gate.pathway_foundation" \| "gate.minimum" \| "funding.need" \| "uz.programme" \| "uz.ceiling" \| "uz.block.subject_1" \| "uz.block.subject_2"…` |
| `CATALOG_ONLY_GAPS` | 35 | value | `readonly ("gate.english_min" \| "gap.english" \| "gap.sat" \| "gap.ec_E4" \| "gap.ec_E3" \| "gap.ec_E2" \| "gate.pathway_foundation" \| "gate.minimum" \| "fund…` |
| `KIND_OF_GAP` | 38 | value | `Record<"gate.english_min" \| "gap.english" \| "gap.sat" \| "gap.ec_E4" \| "gap.ec_E3" \| "gap.ec_E2" \| "gate.pathway_foundation" \| "gate.minimum" \| "funding…` |
| `unmappedOf` | 56 | fn | `(r: R): string[]` |
| `GAP_THRESHOLD` | 59 | value | `0.005` |

### strategy/gate.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `placementErrors` | 25 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `strategyGate` | 41 | fn | `(strategy: unknown, ctx: ValidateCtx): { errors: StrategyError[]; placement: Placement \| null; }` |

### strategy/month.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `cutWords` | 218 | fn | `(lang: "en" \| "uz" \| "ru", rows: readonly { grant_cut: number \| null; contract_cut: number \| null; }[]): string` |
| `monthTodos` | 240 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru", steps: readonly StepToday[], o?: { pages?: boolean \| undefined; home?: boolean \| undefined; }): MonthItem[]` |
| `monthDates` | 325 | fn | `(goal: Pick<Goal, "year" \| "unis"> \| null \| undefined, ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru"): MonthItem[]` |
| `satReady` | 357 | fn | `(A: Answers, D: Pick<Derived, "math_tested" \| "english_level" \| "english_basis">): SatReady` |
| `monthView` | 370 | fn | `(steps: readonly StepToday[], tasks: readonly MonthTask[], today: string, lang: "en" \| "uz" \| "ru", todos?: readonly MonthItem[], o?: { sat?: SatReady \| undefined; ahead?: MonthAhead \| null \| undefined; home?: boolean \| undefined; choice?: "open" \| und…` |
| `MONTH_DAYS` | 52 | value | `30` |
| `MONTH_LINES` | 55 | value | `5` |
| `inMonthYears` | 226 | fn | `(D: Pick<Derived, "stage" \| "years_left"> \| null \| undefined): boolean` |

### strategy/place.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `registrationDeadlineOf` | 28 | fn | `(s: Pick<Sitting, "test" \| "date" \| "register_by">): { date: string; official: boolean; }` |
| `placeStrategy` | 62 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `REGISTRATION_LEAD_DAYS` | 21 | value | `Record<"DTM" \| "IELTS" \| "SAT" \| "ACT" \| "MS", number>` |
| `REGISTRATION_TASK_DAYS` | 23 | value | `14` |
| `REGISTRATION_MIN_DAYS` | 25 | value | `3` |

### strategy/route-word.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `routeWords` | 23 | fn | `(goal: Goal \| null, ready: Pick<GoalReadiness, "by_uni_view"> \| null, fe: Pick<Feasibility, "rows">): Record<string, RouteWord>` |
| `ROUTE_REALISTIC` | 20 | value | `50` |
| `ROUTE_POSSIBLE` | 20 | value | `15` |

### strategy/schema.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `STRATEGY_VERSION` | 20 | value | `1` |
| `WS_KEYS` | 21 | value | `readonly ["ws1", "ws2", "ws3", "ws4", "ws5", "ws6", "ws7", "ws8"]` |
| `WS_KINDS` | 23 | value | `readonly ["english", "math", "tests", "olympiad", "activity", "essays", "research", "admin", "uz_unis", "pathway"]` |
| `TRADEOFF_REASONS` | 25 | value | `readonly ["capacity", "deadline", "prerequisite", "low_value"]` |
| `PLAN_TESTS` | 27 | value | `readonly ["SAT", "IELTS", "MS", "ACT", "DTM"]` |
| `MAX_WORKSTREAMS` | 28 | value | `8` |
| `MAX_WEEK` | 28 | value | `156` |
| `MIN_WEEKLY` | 28 | value | `15` |
| `MAX_WEEKLY` | 28 | value | `600` |
| `MAX_UZ_PROGRAMMES` | 28 | value | `5` |
| `MAX_OLYMPIADS` | 28 | value | `2` |
| `MAX_MAJOR_ACTIVITIES` | 28 | value | `2` |
| `MAX_ESSAY_TRACKS` | 28 | value | `1` |
| `UNIVERSITY_KINDS` | 30 | value | `readonly ("english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway")[]` |
| `STATIC_MILESTONE_IDS` | 37 | value | `readonly ["m_read", "m_math", "m_en100", "m_make", "m_recheck", "m_en_A1", "m_en_A2", "m_en_B1", "m_en_B2", "m_math_next", "m_oly_reg", "m_oly_nat", "m_project…` |
| `isMilestoneId` | 45 | fn | `(v: unknown): v is string` |
| `RoadmapStrategyShape` | 75 | value | `ZodObject<{ workstreams: ZodArray<ZodObject<{ key: ZodEnum<{ ws1: "ws1"; ws2: "ws2"; ws3: "ws3"; ws4: "ws4"; ws5: "ws5"; ws6: "ws6"; ws7: "ws7"; ws8: "ws8"; }>…` |
| `strategySchemaFor` | 87 | fn | `(env: StrategyEnv): ZodObject<{ workstreams: ZodArray<ZodObject<{ key: ZodEnum<{ ws1: "ws1"; ws2: "ws2"; ws3: "ws3"; ws4: "ws4"; ws5: "ws5"; ws6: "ws6"; ws7: "ws7"; ws8: "ws8"; }>; kind: ZodEnum<{ english: "english"; math: "math"; olympiad: "olympiad"; tests:…` |
| `StoredStrategyShape` | 93 | value | `ZodObject<{ v: ZodLiteral<1>; planned_on: ZodString; strategy: ZodObject<{ workstreams: ZodArray<ZodObject<{ key: ZodEnum<{ ws1: "ws1"; ws2: "ws2"; ws3: "ws3";…` |

### strategy/step-why.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `stepWhy` | 56 | fn | `<T extends StepToday>(steps: readonly T[], A: Answers, D: Pick<Derived, "english_tested" \| "math_tested">, lang: "en" \| "uz" \| "ru"): T[]` |

### strategy/testplan.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `plannableSittings` | 25 | fn | `(test: "DTM" \| "IELTS" \| "SAT" \| "ACT" \| "MS", sittings: readonly Sitting[], skeleton: Pick<Roadmap, "milestones">, today: string): Sitting[]` |
| `planSitting` | 33 | fn | `(test: "DTM" \| "IELTS" \| "SAT" \| "ACT" \| "MS", sittings: readonly Sitting[], skeleton: Pick<Roadmap, "milestones">, today: string, prepEnds: string \| null): Sitting \| null` |
| `SITTING_NEAR_DAYS` | 22 | value | `60` |

### strategy/today.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `markLate` | 101 | fn | `<T extends StepToday>(steps: readonly T[], id: string, lang: "en" \| "uz" \| "ru"): T[]` |
| `roadmapToday` | 113 | fn | `(R: Roadmap, rules: Pick<RulesSnapshot, "destinations" \| "testCalendars">, today: string, lang: "en" \| "uz" \| "ru", o?: { pages?: boolean \| undefined; }): RoadmapToday` |
| `dayWords` | 63 | fn | `(lang: "en" \| "uz" \| "ru", d: string, year?: boolean): string` |
| `officialLink` | 93 | fn | `(record: string, link: string): string \| null` |

### strategy/truth.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `laterYear` | 119 | fn | `(steps: readonly StepToday[], rules: Pick<RulesSnapshot, "destinations">, target: { key: string; route: string; }, year: number, o?: { englishUnmeasured?: boolean \| undefined; }): { year: number \| null; skipped: number[]; }` |
| `lateTruth` | 135 | fn | `(steps: readonly StepToday[], stored: Pick<Roadmap, "phases">, goal: Goal \| null, rules: RulesSnapshot, lang: "en" \| "uz" \| "ru", o?: { englishUnmeasured?: boolean \| undefined; home?: readonly HomeUni[] \| undefined; }): LateTruth \| null` |
| `CERT_LEAD_DAYS` | 58 | value | `56` |

### strategy/uni-rows.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `uniRows` | 84 | fn | `(A: Answers, D: Derived, goal: Pick<Goal, "year" \| "unis"> \| null \| undefined, phases: readonly Pick<Phase, "id">[], ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru", o?: { waits?: string \| null \| undefined; }): (Milestone & { when_i1…` |
| `UNI_ROW_KIND` | 76 | value | `"uni"` |
| `UNI_ROW_COPY_KEYS` | 77 | fn | `(): string[]` |

### strategy/validators/core.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `prerequisitesOf` | 59 | fn | `(skeleton: Pick<Roadmap, "milestones">, id: string): Set<string>` |
| `languageStepsBefore` | 64 | fn | `(skeleton: Pick<Roadmap, "milestones">, test: "DTM" \| "IELTS" \| "SAT" \| "ACT" \| "MS"): Milestone[]` |
| `v2` | 31 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `TEST_MILESTONES` | 57 | value | `Record<"DTM" \| "IELTS" \| "SAT" \| "ACT" \| "MS", readonly string[]>` |
| `v4` | 70 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `v5` | 105 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `v6` | 116 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `v8` | 132 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `v9` | 147 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |
| `v13` | 156 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/index.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `validateStrategy` | 47 | fn | `(strategy: unknown, ctx: ValidateCtx): StrategyError[]` |
| `validateCtxOf` | 56 | fn | `(inp: StrategyInput, over?: Partial<ValidateCtx>): ValidateCtx` |
| `VALIDATORS` | 45 | value | `Record<"V2" \| "V3" \| "V4" \| "V5" \| "V6" \| "V7" \| "V8" \| "V9" \| "V10" \| "V11" \| "V12" \| "V13" \| "V14" \| "V15" \| "V16", Validator>` |

### strategy/validators/types.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `STRATEGY_ERROR_CODES` | 14 | value | `readonly ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16"]` |
| `REPLAN_TRIGGERS` | 64 | value | `readonly ["milestone_slip", "new_score", "new_destination", "infeasible_deadline", "profile_changed", "student_request"]` |
| `strategyError` | 68 | fn | `(code: "V1" \| "V2" \| "V3" \| "V4" \| "V5" \| "V6" \| "V7" \| "V8" \| "V9" \| "V10" \| "V11" \| "V12" \| "V13" \| "V14" \| "V15" \| "V16", path: string, message: string, detail: { rule: string; } & Record<string, unknown>): StrategyError` |

### strategy/validators/v1.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `v1` | 14 | fn | `(raw: unknown, ctx: ValidateCtx): { errors: StrategyError[]; strategy: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "a…` |
| `MAX_SCHEMA_ERRORS` | 11 | value | `20` |

### strategy/validators/v10.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `STRATEGY_LINE_CAP` | 17 | value | `220` |
| `v10` | 19 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v11.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `LIST_FIELDS` | 19 | value | `readonly ["test_plan", "pathway_choice", "uz_programmes", "olympiad_choice"]` |
| `JUSTIFIES` | 25 | value | `Record<"milestone_slip" \| "new_score" \| "new_destination" \| "infeasible_deadline" \| "profile_changed" \| "student_request", Allowed>` |
| `v11` | 43 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v12.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `minutesOf` | 13 | fn | `(w: Pick<{ key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| "gap.engli…` |
| `v12` | 15 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v14.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `deadlineOfUni` | 23 | fn | `(ctx: Pick<ValidateCtx, "today" \| "skeleton">, uni: string): Milestone \| null` |
| `routesOfUni` | 21 | fn | `(uni: string): string[]` |
| `v14` | 28 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v15.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `claimsIn` | 34 | fn | `(line: string): Claim[]` |
| `v15` | 36 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v16.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `FIT_HORIZON_MIN` | 26 | value | `52` |
| `horizonOf` | 27 | fn | `(s: { workstreams: readonly { end_week: number; }[]; }): number` |
| `v16` | 29 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v3.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `MAY_DROP_A_DEADLINE` | 20 | value | `readonly string[]` |
| `v3` | 22 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/validators/v7.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `SCORE_LEAD_DAYS` | 22 | value | `42` |
| `needsScore` | 25 | fn | `(test: "DTM" \| "IELTS" \| "SAT" \| "ACT" \| "MS", route: string): boolean` |
| `v7` | 28 | fn | `(s: { workstreams: { key: "ws1" \| "ws2" \| "ws3" \| "ws4" \| "ws5" \| "ws6" \| "ws7" \| "ws8"; kind: "english" \| "math" \| "olympiad" \| "tests" \| "essays" \| "activity" \| "research" \| "admin" \| "uz_unis" \| "pathway"; addresses: ("gate.english_min" \| …` |

### strategy/way-view.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `homeReach` | 40 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, steps: readonly StepToday[], lang: "en" \| "uz" \| "ru"): HomeUni[]` |
| `waitingOnChoice` | 57 | fn | `(steps: readonly StepToday[], truth: Pick<LateTruth, "uni"> \| null \| undefined, goal: Pick<Goal, "unis"> \| null \| undefined, lang: "en" \| "uz" \| "ru"): StepWaiting[]` |
| `wayView` | 77 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, goal: Pick<Goal, "unis"> \| null \| undefined, steps: readonly StepToday[], lang: "en" \| "uz" \| "ru"): WayView \| null` |

### strategy/week-goals.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `weekGoalsShown` | 24 | fn | `(goals: readonly WeeklyGoal[], rows: readonly WeekRow[], signup: string \| null): WeeklyGoal[]` |
| `WEEK_TITLES` | 22 | value | `3` |

### streak.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `closeStreakDays` | 19 | fn | `(state: StreakState, days: DayOutcome[], o?: { weekly?: boolean \| undefined; }): { state: { current: number; best: number; best_end: string \| null; freezes: number; closed_through: string \| null; last_grant_week: string \| null; }; events: StreakEvent[]; p…` |
| `grantWeekly` | 35 | fn | `(s: StreakState, date: string, events?: StreakEvent[]): StreakState` |
| `streakView` | 41 | fn | `(s: StreakState, today: { rest: boolean; qualified: boolean; }): { current: number; best: number; if_today: number; freeze_left: number; }` |
| `FREEZE_CAP` | 9 | value | `2` |
| `NEW_STREAK` | 15 | value | `StreakState` |

### study.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `settleSession` | 13 | fn | `(s: { minutes_planned: number; started_at: string; ends_at: string; }, serverNow: string, action: SessionAction): Settled` |
| `levelOf` | 29 | fn | `(xp: number): { level: number; from: number; next: number; }` |
| `dayResult` | 43 | fn | `(tasks: Pick<DailyTask, "id" \| "optional">[], doneIds: string[], sessions: { status: string; minutes_studied: number; bricks: number; }[], rest: boolean): DayResult` |
| `dbhSlots` | 52 | fn | `(weekStart: string, tz: string): { starts_at: string; ends_at: string; }[]` |
| `BRICK_MINUTES` | 7 | value | `25` |
| `XP_PER_BRICK` | 7 | value | `10` |
| `DREAM_TARGET` | 7 | value | `600` |
| `HEAD_START_BRICKS` | 7 | value | `3` |
| `COMPLETE_GRACE_MS` | 8 | value | `60000` |
| `EXPIRE_AFTER_MS` | 8 | value | `number` |
| `isExpired` | 20 | fn | `(s: { ends_at: string; }, serverNow: string): boolean` |
| `LEVEL_STEP` | 28 | value | `100` |
| `inDbh` | 60 | fn | `(slots: { starts_at: string; ends_at: string; }[], instant: string): boolean` |

### tasks.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `gradeQuiz` | 29 | fn | `(quiz: "english" \| "math", answers: number[]): { right: number; of: number; pass: boolean; }` |
| `quizFeedback` | 41 | fn | `(quiz: "english" \| "math", lang: "en" \| "uz" \| "ru"): { why: string[]; words: QuizWords; }` |
| `firstTasks` | 59 | fn | `(A: Answers, D: Derived, parentDone: boolean, ctx: Pick<EngineCtx, "today" \| "lang">): FirstTask[]` |
| `cadence` | 75 | fn | `(D: Derived, A: Answers, weekStart: string, R: Roadmap \| null): Cadence` |
| `taskWords` | 144 | fn | `(lang: "en" \| "uz" \| "ru", template: string, seq: number, f: WordFacts): { title: string; instructions: string; }` |
| `routeCardOf` | 162 | fn | `(template: string, A: Answers): PlayStep \| null` |
| `factsFor` | 167 | fn | `(template: string, A: Answers, D: Derived, R: Roadmap, ctx: Pick<EngineCtx, "rules" \| "bank">): WordFacts` |
| `generateWeek` | 176 | fn | `(inp: WeekInput, ctx: Pick<EngineCtx, "rules" \| "bank" \| "lang" \| "engineVersion">): DailyTask[]` |
| `reflow` | 252 | fn | `(existing: (DailyTask & { status: string; })[], fresh: DailyTask[], today: string, R: Roadmap): { replace: { old: string; by: DailyTask; }[]; }` |
| `QUIZ` | 20 | value | `Record<"english" \| "math", [string, string[], number][]>` |
| `quizPassMark` | 27 | fn | `(of: number): number` |
| `familyShareWords` | 49 | fn | `(lang: "en" \| "uz" \| "ru"): FamilyShareWords` |
| `deepAllowed` | 53 | fn | `(D: Derived, parentConsent: boolean): boolean` |
| `DEEP_ORDER` | 56 | value | `string[]` |
| `MIN_DAY_MIN` | 72 | value | `20` |
| `dayBudget` | 86 | fn | `(cad: Cadence, weekday: number): number` |
| `setCourseLabels` | 104 | fn | `(on: () => boolean): void` |
| `subjectOf` | 105 | fn | `(t: { quiz?: string \| undefined; short: string; type: string; template?: string \| undefined; meta?: unknown; }): Subject` |

### teachers.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `teacherCards` | 53 | fn | `(lang: "en" \| "uz" \| "ru", file?: TeachersFile): TeachersSnapshot` |
| `teachersPlaceholderWarning` | 72 | fn | `(nodeEnv: string \| undefined, placeholder?: boolean): string \| null` |
| `TEACHERS_PLACEHOLDER` | 18 | value | `boolean` |

### too-fast.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `LISTEN_MIN_MS` | 40 | value | `5000` |
| `wasRead` | 48 | fn | `(x: Timed, readMs: number, strict?: boolean): boolean` |
| `tooFast` | 50 | fn | `(log: readonly Timed[], readMs?: number, strict?: boolean): boolean` |

### unis-uz.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `uniVerdict` | 248 | fn | `(rec: UzRecord, A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru", chosen?: boolean, f?: Facts): UniUzView` |
| `fromUzbekistan` | 300 | fn | `(A0: Answers): boolean` |
| `unisUz` | 310 | fn | `(A: Answers, D: Derived, ctx: Pick<EngineCtx, "today" \| "rules">, lang: "en" \| "uz" \| "ru", goalKey?: string \| null): UnisUz` |
| `uzStopWords` | 360 | fn | `(u: UnisUzSlim, lang: "en" \| "uz" \| "ru"): UnisUzSlim` |
| `uzCopy` | 23 | fn | `(lang: "en" \| "uz" \| "ru", key: string, p?: Record<string, string \| number>): string` |
| `UZ_COPY_KEYS` | 28 | fn | `(): string[]` |
| `OWNER_THREE` | 64 | value | `string[]` |
| `MISS_ORDER` | 206 | value | `string[]` |
| `unisUzSlim` | 335 | fn | `(u: UnisUz): UnisUzSlim` |
| `UZ_NOW_PCT` | 346 | value | `50` |
| `uzRequirementWords` | 375 | fn | `(r: UzReq, lang: "en" \| "uz" \| "ru"): string` |
| `uzUniName` | 376 | fn | `(id: string, lang: "en" \| "uz" \| "ru"): string` |

### util.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `fnv1a` | 4 | fn | `(s: string): string` |
| `hash` | 2 | fn | `(s: string, n: number): number` |
| `clone` | 5 | fn | `<T>(v: T): T` |

### uz-records.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `stateTestReg` | 55 | fn | `(year: number): StateTestReg` |
| `UZ_UNIS` | 42 | value | `UzRecord[]` |
| `UZ_GENERAL_SOURCES` | 43 | value | `UzSource[]` |
| `UZ_CHECKED` | 44 | value | `string` |
| `uzRecord` | 45 | fn | `(id: string): UzRecord \| undefined` |
| `STATE_TEST_VERSION` | 61 | value | `number` |
| `uniAdmission` | 63 | fn | `(id: string): "own" \| "state_test" \| null` |

### verify/artifact.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `scriptOf` | 33 | fn | `(s: string): Script` |
| `notWriting` | 64 | fn | `(s: string): "repeated_words" \| "not_words" \| null` |
| `languageOf` | 72 | fn | `(s: string): "en" \| "uz" \| "ru" \| null` |
| `isPromptPasted` | 83 | fn | `(text: string, prompt: string \| undefined): boolean` |
| `checkArtifact` | 95 | fn | `(raw: string, b?: ArtifactBounds): ArtifactCheck` |
| `artifactText` | 27 | fn | `(s: string): string` |
| `wordsOf` | 29 | fn | `(s: string): string[]` |
| `charsOf` | 31 | fn | `(s: string): number` |
| `JUDGE_REPEAT` | 63 | value | `8` |
| `JUDGE_WORDS` | 63 | value | `12` |
| `MIN_DISTINCT` | 63 | value | `0.3` |
| `MIN_FUNCTION_SHARE` | 63 | value | `0.04` |

### verify/link.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `linkHosts` | 51 | fn | `(spec: LinkSpec \| null \| undefined): string[] \| null` |
| `checkLink` | 59 | fn | `(raw: string, hosts: string[] \| null): LinkCheck` |
| `LINK_HOSTS` | 19 | value | `Record<"sat" \| "uz_state", readonly string[]>` |
| `uniHosts` | 48 | fn | `(): Record<string, string[]>` |

### verify/words.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `artifactSentence` | 31 | fn | `(lang: "en" \| "uz" \| "ru", r: ArtifactReason): string` |
| `linkSentence` | 42 | fn | `(lang: "en" \| "uz" \| "ru", r: LinkReason): string` |
| `UPLOAD_REASONS` | 45 | value | `readonly ["file_missing", "file_type", "file_too_large", "file_limit"]` |
| `uploadSentence` | 53 | fn | `(lang: "en" \| "uz" \| "ru", code: "file_missing" \| "file_type" \| "file_too_large" \| "file_limit"): string` |
| `RETURN_REASONS` | 56 | value | `readonly ["not_official", "unreadable", "wrong_document", "incomplete", "needs_changes"]` |
| `isReturnReason` | 69 | fn | `(s: unknown): s is "not_official" \| "unreadable" \| "wrong_document" \| "incomplete" \| "needs_changes"` |
| `checkpointSentence` | 70 | fn | `(lang: "en" \| "uz" \| "ru", status: "open" \| "approved" \| "returned", reason?: string \| null \| undefined): string` |
| `ALL_VERIFY_WORDS` | 74 | value | `L3[]` |

### version.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `ENGINE_VERSION` | 2 | value | `"p1-1.0.0"` |

### way.ts

| export | line | kind | signature / type |
|---|---|---|---|
| `wayOf` | 47 | fn | `(A: Answers, baseYear: number): Way \| null` |
| `listFor` | 62 | fn | `(A: Answers, pick: WayPick \| null, uni: string): Picked[]` |
| `homeWords` | 121 | fn | `(lang: "en" \| "uz" \| "ru", unis: readonly HomeUni[]): { home: string; wait: string; }` |
| `WAY_KEY` | 27 | value | `"m2_way"` |
| `LATER_REACH` | 33 | value | `2` |
| `isHomeUni` | 39 | fn | `(A: Answers, id: string \| undefined): boolean` |
| `isAbroadUni` | 44 | fn | `(A: Answers, id: string \| undefined): boolean` |
| `wayT` | 109 | fn | `(lang: "en" \| "uz" \| "ru", key: string, p?: Record<string, string \| number>): string` |
| `namesL` | 111 | fn | `(lang: "en" \| "uz" \| "ru", names: readonly string[]): string` |
