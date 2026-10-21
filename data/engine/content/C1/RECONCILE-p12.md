# C1: key check 2 of content round 3's math lesson families (P12 blind checkers 1 and 2, 15 Oct 2026)

Content round 3 (the owner's "content x3-5", 15 Oct 2026; SPEC-lessons rev. 2, §9.1 steps 2-3; P8D lane "content" item 3): a template
lesson with two C1 families of its own asked its third test question as one of those families' stories again, on new numbers. Each such
lesson now gets one new family written for its page (the two lessons with one family get two), appended to its `homework.families`;
`course.ts` `testFamilies` draws it as the test's third family. `.superpowers/p12/math-lessons.txt` lists the 42 lessons (40 with two
families, `C19-MAGT01-2` and `C19-MAPS03-2` with one). Two authors wrote 44 families; P12 blind checkers 1 and 2 keyed them. This file is
checker 2's record (P12maths2, who ran the reconcile).

| File | Commit | Author | Families | Pages |
|---|---|---|---|---|
| `C1-12.json` (batch 12) | `cf342f72` | `agent:p12-math-a` | `C1-r3a001` … `r3a020` (20) | the first 20 two-family lessons: 18 AP Calculus AB (`C19-APCA01-1` … `APCA08-3`, `C19-18`/`-11`/`-12`), `C19-DTMC05-1`, `C19-DTMC07-1` |
| `C1-13.json` (batch 13) | `cb545606` | `agent:p12-math-b` | `C1-r3b001` … `r3b024` (24) | the other 20 two-family lessons (DTMC08-10, SAT Math) and the two one-family lessons (two each) |

Before this pass all 44 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. No instance item was written
for them (no `family_ref`); a family is served as instances from a seed.

## How they were keyed

A family has no single item for a blind solver: `scripts/content/blind.ts` leaves a template out. As in P7 and P8 (`RECONCILE-p7.md`,
`RECONCILE-p8.md`), its key check 2 is the validator's 50-instance independent solver on the family's `relation` (`solver:relation@50`,
`keycheck.ts`), and the two blind checkers each solved rendered instances of every family themselves, from the stem a student sees:

| Solver | Blind copy (instances) | Answers |
|---|---|---|
| P12maths1 (checker 1) | `.superpowers/p12/blind-math/C1-P12maths1.json`: 53 per family (50 drawn, 3 parameter-range edges), 2,332 | `C1-P12maths1.answers.json` |
| P12maths2 (checker 2) | `.superpowers/p12/blind-math/C1-P12maths2.json` (`.superpowers/p12/check-math-2/render.ts`): 50 drawn with its own seeds `P12maths2:0` … `:49` (not the check's `check:<n>`, not checker 1's), redrawn as `bank.ts` `instanceFor` does when two options read the same (none was), plus the 3 edge instances of `edges.ts`; 2,332, 2,173 numeric entry and 159 multiple choice (`r3a006`, `r3b023`, `r3b024`) | `C1-P12maths2.answers.json` |

Both solvers' copies, maps and answers sit in ONE folder, `.superpowers/p12/blind-math/`, from the start. Each instance is shown the way the
loader serves it (`format.ts`): a family with `answer_numeric` is numeric entry, and its four options (the task quiz may show them) are
shown too, shuffled and lettered by the solver's own generator; the map holds the letter, or `{value, tolerance}`. No key, no `why`, no
formula. Each solver was a separate agent run, and neither is an author's session (D26; `agentOf` reads P12maths1, P12maths2,
`p12-math-a` and `p12-math-b` as four agents).

P12maths2 opened neither `.map-*` file, nor C1-12 / C1-13's keys, formulas, relations, distractors or `why` lines, nor the authors'
ledgers, builders, logs and tests (`.superpowers/p12/author-math-*.md`, `math-a/`, `math-b/`, `tests/unit/content/p12-math-*.test.ts`), nor
checker 1's answers, before its own answers were written. It read the English stems and options of its copy (and one uz and ru stem per
family, for the same question), worked each family out by hand, and wrote `.superpowers/p12/check-math-2/solve.py`: it reads only the
numbers of each instance's English stem and solves it from first principles in exact fractions (the limit a·c + b, not g(c); V′(T) =
2aT + b; a/(2√p) + b; the chain rule f′(g(c))·g′(c); x = −m·y on the circle, checked on the curve; g′(f(a)) = 1/f′(a); 3s²·ds/dt;
a³ + 3a²(x − a); the MVT's average speed; the cubic's local maximum at the smaller root of h′ with h″ < 0 and t > 0; R(x) = (P − x)(Q + kx);
the right Riemann sum; k·n for ∫ k/t from 1 to eⁿ; (T − Tₐ)/k; 2√h₀/k; N/2^(T/d); the area between the parabolas at their meeting
points; washers π(p² − q²)c³/3; ⌊D/lcm⌋; (L − 2H)/2; the positive root of w(w + d) = A; the arithmetic series; √(L² − d²); the whole
from the part left; the line through two (months, cost) points; the break-even km; kS/(k + 1); M/t for a dependent system; C/p with
p + k = B checked; the exponents in base 2; n(n − 1)/2 = G; 1/(1/T − 1/f); P²/8; d·tan; r·m/30; 100 − (100 − a)(100 − b)/100;
(n + 1)M₂ − nM₁; (a − Y)/b; r/p − r; (p + e)% of H; area × (L₂/L₁)²; V/k³; green/first orchard; evening cash/all). 87 instances it had
solved by hand (two of each family, before the script) agree with the script. For every instance, exactly one shown option equals its
solved value. Only `compare.ts` (a script) read the maps, after both answers files were written.

| Check | Result |
|---|---|
| The 50-instance check (`checkFamily`, the validator's and reconcile's) | **44 of 44 verified, `solver:relation@50`, agree 50/50 each**, no problem found |
| P12maths2 on its 2,332 instances (`compare.ts P12maths2`) | **2,332 agree**, 0 disagree, 0 flags; every numeric-entry key a whole number except `r3a008`'s one-decimal estimates |
| P12maths1 on its 2,332 instances (`compare.ts P12maths1`, read after P12maths2's answers were written) | **2,332 agree**, 0 disagree, 0 flags |

Neither solver raised `two_defensible` or `unanswerable` on any instance. "Answerable without its text" does not apply (a computation on
the stem's own numbers).

## The decision

`npx tsx scripts/content/reconcile.ts C1 P12maths1 P12maths2 --blind .superpowers/p12/blind-math --write` gave **233 items: verified 44,
quarantine 0, pending 0, blocked 0, skipped 189** (the earlier C1 families, already `verified_auto`). Both instance answers files are in
reconcile's format (`{id: letter | number}`); their ids (`C1-r3a001#0` …) are instances, not stream items, so the families were decided
by their 50-instance check, and by the rule of this pass (2/2 blind solvers agree on every instance) both solves are recorded above.
`--audit` afterwards: 0 of 233 decisions differ from the files.

| Status after this pass | Families | Record |
|---|---:|---|
| `verified_auto` | **44** | `key_check_2: "solver:relation@50"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | **0** | none |

**Quarantined: none.** No family drew a disagreement, a second defensible answer or a flag from either solver or the 50-instance check, so
there is no quarantine reason to record.

`--write` re-serialises the two files; they round-trip byte for byte through `JSON.stringify(…, null, 2)`, so the write changed only each
family's `key_check_2`, `status` and the new `key_check_2_version` (with the comma after `version`). The decision log is
`.superpowers/p12/blind-math/C1-reconcile.json`, kept as `.superpowers/p12/check-math-2/C1-reconcile-log.json` (local).

### Counts per lesson

Each lesson's new family, verified / written; every family 53/53 for each solver and 50/50 in the solver check.

| Lesson | Family | Rung, subskill | Verified | Quarantine |
|---|---|---|---:|---:|
| C19-APCA01-1 | C1-r3a001 g = ax + b with one point moved: the limit, not g(c) | calc, limits | 1/1 | 0 |
| C19-APCA02-1 | C1-r3a002 water into a pool: the rate at a moment | calc, derivative_definition | 1/1 | 0 |
| C19-APCA02-2 | C1-r3a003 f = a√x + bx: f′(p) | calc, power_rule | 1/1 | 0 |
| C19-APCA03-1 | C1-r3a004 h = f(g(x)) from given values, decoy f′(c) | calc, chain_rule | 1/1 | 0 |
| C19-APCA03-2 | C1-r3a005 a circle worked backwards: slope and y given, x | calc, implicit_differentiation | 1/1 | 0 |
| C19-APCA03-3 | C1-r3a006 g′(b) for the inverse, decoy f′(b) (multiple choice) | calc, inverse_derivative | 1/1 | 0 |
| C19-APCA04-2 | C1-r3a007 a melting ice cube | calc, related_rates | 1/1 | 0 |
| C19-APCA04-3 | C1-r3a008 a gift box: tangent-line estimate of x³ | calc, linear_approximation | 1/1 | 0 |
| C19-APCA05-1 | C1-r3a009 a bus odometer: the MVT speed | calc, mean_value_theorem | 1/1 | 0 |
| C19-APCA05-2 | C1-r3a010 a toy drone's height at its local maximum | calc, increasing_decreasing | 1/1 | 0 |
| C19-APCA05-3 | C1-r3a011 melons at the bazaar: the best price | calc, optimization | 1/1 | 0 |
| C19-APCA06-1 | C1-r3a012 a house's power use: right Riemann sum | calc, riemann_sums | 1/1 | 0 |
| C19-APCA06-3 | C1-r3a013 a sled's distance, ∫ k/t dt | calc, integral_rules | 1/1 | 0 |
| C19-APCA07-1 | C1-r3a014 tea cooling: the rate at a temperature | calc, differential_equations | 1/1 | 0 |
| C19-APCA07-2 | C1-r3a015 a roof tank draining: time until empty | calc, separation_of_variables | 1/1 | 0 |
| C19-APCA07-3 | C1-r3a016 news doubling at a school, worked backwards | calc, exponential_models | 1/1 | 0 |
| C19-APCA08-2 | C1-r3a017 a park lawn between two parabolas | calc, area_between_curves | 1/1 | 0 |
| C19-APCA08-3 | C1-r3a018 a lampshade on a lathe: washers | calc, volume | 1/1 | 0 |
| C19-DTMC05-1 | C1-r3a019 football and chess days: common days (LCM) | arith, gcd_lcm | 1/1 | 0 |
| C19-DTMC07-1 | C1-r3a020 chickens and rabbits, heads and legs | alg1, system_of_equations | 1/1 | 0 |
| C19-DTMC08-1 | C1-r3b001 a carpet's width from its area | alg2, quadratic | 1/1 | 0 |
| C19-DTMC09-1 | C1-r3b002 stadium rows: an arithmetic series | alg2, series | 1/1 | 0 |
| C19-DTMC10-1 | C1-r3b003 a fire ladder against a wall | geom, pythagoras | 1/1 | 0 |
| C19-MAAL01-2 | C1-r3b004 a family budget: the whole from what is left | alg1, linear_equation | 1/1 | 0 |
| C19-MAAL02-2 | C1-r3b005 a sports club: fee + monthly, from two totals | alg1, linear_functions | 1/1 | 0 |
| C19-MAAL02-3 | C1-r3b006 two taxis: the break-even distance | alg1, linear_functions | 1/1 | 0 |
| C19-MAAL03-1 | C1-r3b007 father and son: the father's age | alg1, system_of_equations | 1/1 | 0 |
| C19-MAAL03-2 | C1-r3b008 bozor receipts: N for infinitely many solutions | alg2, system_of_equations | 1/1 | 0 |
| C19-MAAM01-2 | C1-r3b009 a vegetable plot: the other factor | alg1, factoring | 1/1 | 0 |
| C19-MAAM01-3 | C1-r3b010 phone photos: 2ˣ KB | alg2, exponent_rules | 1/1 | 0 |
| C19-MAAM02-1 | C1-r3b011 a tournament: teams from games | alg2, quadratic | 1/1 | 0 |
| C19-MAAM02-3 | C1-r3b012 sweeping the yard: the son alone | alg2, rational_equations | 1/1 | 0 |
| C19-MAAM03-3 | C1-r3b013 a school flower bed: the greatest area | alg2, functions | 1/1 | 0 |
| C19-MAGT03-2 | C1-r3b014 a cable car: rise from tan | geom, right_triangle_trig | 1/1 | 0 |
| C19-MAGT03-3 | C1-r3b015 a wall clock's minute hand: kπ | geom, circles | 1/1 | 0 |
| C19-MAPS01-2 | C1-r3b016 a sports shop: one discount for two | prealg, percent | 1/1 | 0 |
| C19-MAPS02-2 | C1-r3b017 test scores: the next score for a new mean | prealg, mean | 1/1 | 0 |
| C19-MAPS02-3 | C1-r3b018 used bicycles: the age for a price | alg1, statistics | 1/1 | 0 |
| C19-MAPS03-1 | C1-r3b019 a fruit basket: green apples from P(red) | alg1, probability | 1/1 | 0 |
| C19-MAPS03-3 | C1-r3b020 households with a car: the top of the margin | alg1, statistics | 1/1 | 0 |
| C19-MAGT01-2 | C1-r3b021 carpets of one shape: the area | geom, area_perimeter | 2/2 | 0 |
|  | C1-r3b022 exercise balls of one shape: the volume | geom, volume | | |
| C19-MAPS03-2 | C1-r3b023 two orchards: P(green \| first) (multiple choice) | alg1, probability | 2/2 | 0 |
|  | C1-r3b024 bus passengers: P(evening and cash) (multiple choice) | alg1, probability | | |

By author: math-a 20/20, math-b 24/24. By rung: calc 18, arith 1, prealg 2, alg1 11, alg2 7, geom 5 (all verified).

### What P12maths2 weighed (none a flag)

- `C1-r3a014`: "How fast … is the tea cooling" is the positive rate (T − Tₐ)/k; dT/dt itself is negative. The uz («daqiqasiga necha
  gradusdan sovimoqda») and ru («с какой скоростью … остывает») ask the same; no shown option is the negative value.
- `C1-r3a019`: in every instance (53 of 53) D is a multiple of the LCM, so the last coincidence falls on day D itself. "In the D days after
  today" (ru «за D дней, начиная с завтрашнего», uz «bugundan keyingi D kun ichida») includes day D, so ⌊D/L⌋ is the only reading; D/L − 1
  is not among the options either.
- `C1-r3a011`: the best price is always below the starting price and positive (the stem's "takes off" holds in every instance).
- `C1-r3a010`: the local maximum is always at a t > 0, after take-off.
- `C1-r3b017`: the needed score is at most 100 in every instance.
- `C1-r3b020`: "largest plausible number" means the top of the margin, (p + e)% of the town; the uz «ehtimoliy» and ru «правдоподобное»
  read as "likeliest" (the estimate itself), which checker 1's fixes below change.
- `C1-r3b007` has few distinct instances (20 different stems in 53 draws); not a key matter.

## The uz and ru text: checker 1's fixes

**Lint.** `.superpowers/p12/check-math-2/lint.ts` puts every uz and ru string of the 44 families (raw, and rendered at 20 seeds: stems,
`why`, options) through `uzApostrophes` (U+02BB in oʻ/gʻ, U+02BC for the tutuq) and `mixedScriptWords`: 10,824 strings, **0 findings**,
before and after the fixes. `scripts/content/counted-nouns.ts`: 233 C1 families over 300 instances each, **0 flagged**, before and after.

**Checker 1's fixes** (`.superpowers/p12/check-math-1/uz-ru-fixes.json`): 29 fixes, 12 in C1-12 and 17 in C1-13, on 29 different fields
(18 stems, 11 `why` lines; 15 uz, 14 ru). Every fix's `old` occurred exactly once in the current text. **Applied: 29 (28 as written, 1
with one change). Refused: 0.** None changes a number, a slot or the English. The script and its log:
`.superpowers/p12/check-math-2/apply-fixes.mjs`, `uz-ru-applied.json`.

| Family | Field | The fix | Checker 2 |
|---|---|---|---|
| r3a001 | why.ru | «Около x = {c} g(x) = …» → «Вблизи x = {c} функция g(x) = …» (two formulas run together) | applied |
| r3a002 | stem.uz | «t = {c} paytda» → «t = {c} boʻlgan paytda» | applied |
| r3a006 | why.ru | «f′({b}) = {e} не нужна» → «значение f′({b}) = {e} не нужно» (agreement) | applied |
| r3a009 | stem.ru | «в какой-то момент между этими моментами» → «… этого промежутка времени» | applied |
| r3a010 | stem.ru | «Через t с» → «Через t секунд» («с» read as the preposition) | applied |
| r3a011 | stem.uz | «Narxni har ming soʻmga tushirganda» → «Narxni har ming soʻm arzonlashtirganda» («…ga tushirmoq» reads as lowering TO) | applied |
| r3a011 | stem.ru | «С каждой тысячей сумов скидки» → «За каждую тысячу сумов, на которую она снижает цену,» (calque) | applied |
| r3a013 | stem.uz | «necha metr yuradi» (walks) → «necha metr yoʻl bosadi» | applied |
| r3a014 | stem.ru | «в комнате, где {R} °C» → «… где температура {R} °C» | applied |
| r3a016 | stem.uz | «… oʻquvchi eshitgan.» → «… eshitgan boʻladi.» (the state at that moment) | applied |
| r3a017 | why.uz | the sentence had no subject: «Egri chiziqlar … kesishadi» | applied |
| r3a018 | stem.ru | «область …, повёрнутая вокруг оси x» (a flat region) → «тело, полученное вращением вокруг оси x области …» (meaning) | applied |
| r3b002 | why.ru | «Первый и последний ряды в паре:» → «Складываем ряды парами (первый с последним и т. д.):» | applied |
| r3b002 | why.uz | «Birinchi va oxirgi qatorni juftlang:» → «Qatorlarni juft-juft qoʻshing (birinchisini oxirgisi bilan va h.k.):» | applied |
| r3b004 | stem.uz | «Unda {r} soʻm qoldi.» → «Oilada {r} soʻm qoldi.» («Unda» first reads as "then") | applied |
| r3b006 | why.uz | «har bir chiziqning b si» → «har bir toʻgʻri chiziqning ozod hadi (b)» | applied |
| r3b008 | stem.uz | «… = {f} sistema cheksiz» → «… = {f} tenglamalar sistemasi cheksiz» (izofa) | applied |
| r3b011 | stem.ru | «с каждой другой» → «с каждой из остальных» | applied |
| r3b013 | stem.uz | «(devordan chiqadigan tomoni)» → «(devorga perpendikulyar tomoni)» (read as coming out of the wall) | applied |
| r3b013 | stem.ru | «Школа делает … клумбу» → «Школа разбивает … клумбу» | applied |
| r3b014 | why.uz | «balandligi x° qarshisida» → «balandligi — x° burchak qarshisidagi katet, gorizontal masofa — unga yopishgan katet» | applied |
| r3b016 | stem.ru | «Какая одна скидка» → proposed «Какая разовая скидка»; applied as **«Какая единая скидка»** | applied with one change: «разовая» also reads as a one-off (one-time) discount; «единая» is the one discount in place of the two |
| r3b018 | stem.uz | «eng mos chiziq» → «eng mos keladigan toʻgʻri chiziq» | applied |
| r3b020 | stem.ru | «наибольшее правдоподобное число» → «наибольшее возможное с учётом погрешности число» (meaning: «правдоподобное» points at the estimate) | applied |
| r3b020 | why.ru | «Правдоподобные значения» → «Возможные значения» | applied |
| r3b020 | stem.uz | «ehtimoliy eng katta qiymati» → «mumkin boʻlgan eng katta qiymati» (meaning, as ru) | applied |
| r3b020 | why.uz | «Ehtimoliy qiymatlar» → «Mumkin boʻlgan qiymatlar» | applied |
| r3b023 | why.uz | «faqat uning qatori qoladi» (a table the stem never shows) → «faqat birinchi bogʻ olmalari qoladi» | applied |
| r3b023 | why.ru | «остаётся только его строка» → «остаются только яблоки первого сада» | applied |

The fixes came after both solves: the instances were solved from their English stems, which no fix touches, and the 50-instance check
(which also checks that the uz and ru stems show the English numbers) still verifies all 44 after them (`validate.ts`, below). A text fix
of uz/ru is not a new version (as in `C19/RECONCILE-p10.md`): the key and the English are unchanged, so `key_check_2_version: 1` stands.

## Checks after the write and the fixes

- `npx tsx scripts/content/validate.ts --all`: exit 0, **0 errors, 860 warnings** (the baseline), no finding of any severity on any
  `C1-r3a*` or `C1-r3b*` id; families: 431 checked, 323 verified by the independent solver, 0 to quarantine
  (`.superpowers/p12/check-math-2/validate-1.log`). `reconcile.ts C1 P12maths1 P12maths2 --audit`: 0 of 233 decisions differ.
- Vitest: `tests/unit/content/p12-math-a.test.ts` (8), `p12-math-b.test.ts` (8), `choice-wording.test.ts`: 49 tests pass
  (`vitest-2.log`); `lesson-asks-its-page`, `lesson-asks-its-page-dtm`, `lesson-c19-9`, `lesson-c19-apca12`, `-apca34`, `-apca58`,
  `lesson-p7-a2`, `p8d-lesson-test-distinct`: 52 tests pass (`vitest-3.log`). `npx tsc --noEmit -p .`: exit 0 (`tsc-1.log`).
- `p12-math-b.test.ts` pinned the families at `draft` with `key_check_2: null` in two tests (math-a's file already allowed either). Those two
  now assert a status from the ladder (a draft has no key check 2; a served family holds `solver:relation@50` for version 1) and "a draft
  is served nowhere; once checked, it is" (the served pool and `serve()` follow the status; a lesson's test draws a new family only when it
  is served). Nothing else in the authors' tests changed.

## Not done here

- A native read of the uz and ru stems and `why` lines (checker 1's fixes are an AI read), and the teacher look (`reviewed`).
- The content `README.md` register rows for C1 batches 12 and 13 (the integrator).
