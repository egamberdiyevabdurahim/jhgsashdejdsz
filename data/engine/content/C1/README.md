# C1: math practice families (and C1x, their example instances)

Practice pool only (spec §5.3 C1). Nothing here is an assessment item, and no K-bank item is reused or reworded. The P5b validator's
cross-pool check finds no near-duplicate against K4 or K4x.

State on 2026-10-07: **98 families** in `C1-1.json` … `C1-5.json`, all `draft` with `key_check_2: null`. There are also **196 instances**
in `../C1x/C1x-1.json` … `C1x-10.json`, two per family (`…a`, `…b`), each with `family_ref` and `params`.

## What is here

| Rung | Families | Subskills |
|---|---:|---|
| arith | 8 | addition, subtraction, times_table, division_remainder, order_of_operations ×2, gcd_lcm ×2 |
| prealg | 8 + 4 SAT | negative_numbers, fraction, decimals, percent, proportion, square_roots, exponents, mean |
| alg1 | 8 + 8 SAT | linear_equation, linear_inequalities, linear_functions, system_of_equations, expansion, factoring, exponent_rules |
| geom | 10 + 6 SAT | parallel_lines, area_perimeter, circle_area, pythagoras, similarity, coordinate_geometry, volume, transformations, polygon_angles, isosceles_triangle |
| alg2 | 9 + 6 SAT | quadratic, exponential_growth, logarithm, arithmetic_sequence, complex_numbers, rational_equations, radical_functions, inverse_variation, series |
| precalc | 10 | unit_circle, trig_graphs, combinations, probability, vectors, sigma_notation, conic_sections, radians, inverse_function, trig_identity |
| calc | 10 | limits, power_rule, product_rule, chain_rule, average_rate, optimization, definite_integral ×2, related_rates, integral |
| beyond | 11 | determinants, taylor_series, linear_algebra, combinatorics, differential_equations, constrained_optimization, number_theory, graph_theory, partial_derivative, double_integral, integration_by_parts |

- Every rung has at least 8 families, above the wave-1 minimum of 6. The subskill names of arith, prealg, alg1 and geom match the C2
  explainers' `checks[].ref.subskill`.
- **SAT-format templates:** `C1-sat001` … `C1-sat024`, 2 per SAT domain × difficulty cell. In total, 42 families carry a `sat` tag:
  algebra 4 / 5 / 2 (easy / medium / hard), advanced_math 3 / 5 / 2, psda 2 / 2 / 3, geometry_trig 5 / 6 / 3. They are original, written to
  the public domain descriptions. No Bluebook, Question Bank or Khan item was used.
- **Format:**
  - 94 families are numeric entry: `answer_numeric` with tolerance 0, or 0.01 for the three "round to hundredths" families.
  - 4 families are multiple choice through `option_templates`: `pcp004`, `pcp007`, `pcp010` and `sat021`.
  - Every numeric family also has 3 distractor formulas, so it can be served as multiple choice or give feedback on a wrong answer.
- **Stems, whys and instructions** are in en, uz and ru. Uzbek uses U+02BB in oʻ/gʻ and U+02BC as the tutuq belgisi. A word counted by
  a variable number is written with a counted slot, `{n|one|few|many}` in Russian (1 / 2-4 / 5+: `{a|тетрадь стоит|тетради стоят|тетрадей
  стоят}`) and `{n|one|other}` in English (`{t1|hour|hours}`), never as a label before the number or a count in brackets (see "Since 14
  Oct" below; the first families were phrased "учеников: {n}" and "(5 шт.)", which a native reader does not write).

## Distractors: coded error rules

Each distractor is one coded student error. `error_rules.json` lists 19 rules with a one-line feedback text in en, uz and ru, including
`sign_slip`, `order_of_operations`, `wrong_formula`, `wrong_operation`, `partial_answer`, `inverse_slip`, `place_value`, `carry_slip`,
`borrow_slip`, `additive_reasoning`, `square_slip`, `exponent_slip`, `unit_slip` and `extraneous_root`. `families[<id>]` gives the rule
of each distractor, in order. The same list is repeated at the end of each family's `notation`.

The item schema is strict, so the rules cannot be stored as an item field. That is why they sit in this sidecar file. The loader skips
it, because a JSON file that is not a batch reports only `file.shape` (info).

Some families have constraints written as `round(x, d) != round(y, d)`. These keep the four options different as displayed. The
generator added them after scanning 3,000 draws per family.

## Checks run (7 Oct, against jg-p5b `src/engine/content` at adcf48c)

1. **Schema:** every item and instance passes the zod `Item` schema.
2. **Independent solver:** every family has a `family.relation` that states the problem as an equation in X and does not copy the answer
   formula. Examples: `(X + {a})/{b} = (X - {c})/{d}`, a central-difference derivative, Simpson's rule for an antiderivative, and a
   sawtooth search for the modular inverse. All 98 families are verified at `solver:relation@50`: the formula and solver.ts agree on 50
   seeded instances each, with 0 disagreements.
3. **Deep instance scan:** 300 seeded instances per family, beyond the validator's 50, were checked for:
   - no slot left after rendering;
   - the same numbers in the uz, ru and en stems;
   - whole keys where `integer` is set;
   - typeable keys;
   - 4 distinct options in every language, and no distractor equal to the key;
   - why lines of at most 200 characters.

   No problems were found. The smallest family has 10 variants (`gep003`); most have hundreds or more.
4. **Validator, over K4, K4x, C1 and C1x together:** 0 errors on C1 and C1x. There are 188 `format.both` warnings, one for each numeric
   instance, because the instance carries both its options and `answer_numeric`, as K4x does. There is 1 `file.shape` note for
   `error_rules.json`.
5. **By hand:** about 50 rendered instances were recomputed by hand, and the uz and ru renders were read for sense.

**Not done:**
- `key_check_2` and `status` are left for the integrator. The solver result above is what would go into `key_check_2`.
- No blind solver has seen the C1x instances.
- There is no back-translation check of uz and ru (spec §5.5 step 5).
- There is no teacher review (LG1).

## Since 9 Oct: what four options show (owner 9 Oct, content delegated; the review of the P5 minors, L1 and L3-L5)

Phase D's practice serves these families as four options (`serve(…, { choice: true })`), and nine of them showed what a numeric field
never did. No answer formula, param or derived value changed. `tests/unit/content/choice-wording.test.ts` pins each rule over 200 seeds.

| Family | What changed | Languages | Version, status, key check 2 |
|---|---|---|---|
| `C1-sat016` | uz stem: "Javobni oʻnli kasr koʻrinishida ifodalang." (was the calque "… bering"); new constraint `a + b < N`, so the distractor (N − a − b)/N is never below 0 (11,468 variants, were 11,917) | uz; the constraint is language-free | 1 → **2**; `verified_auto`; `solver:relation@50` run again for version 2 |
| `C1-pcp010` | why: "… so sin x cos x = ({s2}/{c2} − 1) ÷ 2 = {p}/{c2}" (was "({s2} − {c2}) ÷ (2 · {c2})", which showed 5329 inside the fraction and 5,329 beside it). The identity: (s²/c² − 1)/2 = (s² − c²)/(2c²) = ab/c², since s² − c² = 2ab for a triple a² + b² = c² | en, uz, ru | 1; unchanged |
| `C1-sat018` | stem: "Round to the nearest hundredth." / "Yuzdan birlargacha yaxlitlang." / "Ответ округлите до сотых."; why: "≈ {ANS}" (was "="). The key was always the value rounded to hundredths (the instruction line for numeric entry said so; four options do not show that line) | en, uz, ru | 1; unchanged |
| `C1-clp007` | the same sentence in the stem (the Uzbek one without "Javobni", so that this stem renders within the validator's 240 characters: 239 at most); why: "… at ≈ {ANS} m/s" | en, uz, ru | 1; unchanged |
| `C1-a2p004` | distractors n − 1, n + 1 and T − a (were n − 1, T/d and (T + a)/d + 1: 24,11 as a position number); rules `off_by_one`, `off_by_one`, `partial_answer` | language-free | 1 → **2**; `verified_auto`; `solver:relation@50` for version 2 |
| `C1-pap003` | distractors ⌊10mq⌋, max(1, ⌊m/(10q)⌋) and 10m/q (were mq, m/(10q), 10mq: 0,8 of a bag); rules unchanged | language-free | 1 → **2**; as above |
| `C1-pap004` | distractors ⌈kp/100⌉, k + p and round(100k/(100 − p)) (the same three errors, as whole students); rules unchanged | language-free | 1 → **2**; as above |
| `C1-gep009` | distractors ⌈180/e⌉, 360/e − 1 and 180 − e (were 180/e, 360/e − 2: 2,5 sides; n − 1, not n − 2, so that the pentagon's ⌈2,5⌉ = 3 is no second 3); rules unchanged | language-free | 1 → **2**; as above |
| `C1-a2p009` | distractors ⌈S/2⌉, ⌊√S⌋ and n + 1 (was S/2: 10,5 for n); rules unchanged | language-free | 1 → **2**; as above |

**The rules followed** (the content README's pipeline, steps 4 and 7; `validate.ts` `versions()`; D26 (4), a check belongs to its version):
a family whose distractor formulas or constraints change is a new version (version + 1, `draft`, `key_check_2: null`), and
`scripts/content/reconcile.ts C1 --records --write` keyed the six again by the 50-instance solver and recorded the version
(`key_check_2_version: 2`). Their `author` stays `agent:C1`: the answer formulas are that stream's. A family whose stem or why changed
and whose key text did not keeps version 1 and its check (the precedent of `8ce7e40`). `error_rules.json` and each family's
`notation` list the new rules of `C1-a2p004`.

**The C1x instances** repeat their family's render (stem, options, why; pinned by the same test). Ten of them show the new distractors
(`a2p04a/b`, `pap03a/b`, `pap04a/b`, `gep09a/b`, `a2p09a/b`): the two blind solvers of 7 Oct chose among other options, so each is
version 2, `draft`, `key_check_2: null`, and waits for blind solvers of two agents. Their keys are unchanged. The other eight
(`sat16a/b`, `sat18a/b`, `clp07a/b`, `pcp10a/b`) changed only a stem or a why, with the same four options and key: version 1,
`blind:2/2`. C1x is an instance bank and is never served; the six families are keyed by the solver, not by these instances.

**Left as they are:** `≈` stands before the key of `C1-sat018` and `C1-clp007` also where the value is exact (17,28 L; 0,75 m/s): the
why is one template. `C1-bcp005` (tolerance 0.01) has an exact key; only its e-power distractor is rounded. The constraints of
`C1-a2p004` that kept its old decimal distractors apart are kept, so a seed still draws the same sequence.

**Regenerating:** the families were generated from definitions kept outside the repo. The JSON is now the source of truth: edit it
directly, and bump `version` for any key change.

## Since 14 Oct: a counted word takes its number's form (P8d item 1; the P8c re-check's «5 тетради стоят» in DTM lesson 3's test)

**The engine.** `family.ts` reads a counted slot `{n|form|form|form}`: the number, a space and the form that number takes. Three forms
are Russian's 1 / 2-4 / 5+ (`ruPluralClass`: 1, 21, 101 · 2-4, 22-24 · 0, 5-20, 11-14, 25 …; a fraction takes the 2-4 form, «2,5 литра»),
two are English's one / other. A form may carry the words that agree with it (`{a|тетрадь стоит|тетради стоят|тетрадей стоят}`). For every
check the slot is `{n}` (`slotsOf`, `backtranslate.ts`'s `SLOT`): the same slots and numbers in every language.

**The scan.** `npx tsx scripts/content/counted-nouns.ts` renders every C1 family's stem and why in ru, uz and en over 300 instances (the
50 check seeds and 250 more) and flags a plain `{n}` before a Russian word whose form cannot fit every value it takes, a label before one
number («книг: {a}»), a count written to dodge agreement («(5 шт.)», «100 чел.», «7 порц.», «2 сут.»), an Uzbek plural label before a bare
count («qizlar: 19.») and an English plural after a number that can be 1 («1 litres»). C18 has no family (800 fixed items): their ru and
uz stems are scanned for the label and the dodge. Before: 37 flags in 18 families; after: **0** (exit 0).

| Family | ru (or the language named) | was |
|---|---|---|
| `C1-arp001` | В школьной библиотеке {a\|книга\|книги\|книг}. Привезли ещё {b\|новую книгу\|новые книги\|новых книг}. | было книг: {a}. Привезли ещё новых книг: {b}. |
| `C1-arp002` | В школе {a\|ученик\|ученика\|учеников}, из них {b\|мальчик\|мальчика\|мальчиков}. | Всего в школе учеников: {a}, из них мальчиков: {b}. |
| `C1-arp004` | Всего {n\|карандаш\|…}.; why: для {r\|оставшегося карандаша\|оставшихся карандашей\|…}; en why: the {r\|extra pencil needs\|extra pencils need} | Всего карандашей — {n}.; для оставшихся {r} карандашей; the {r} extra pencils need |
| `C1-arp008` | {a\|красный\|красных\|красных} и {b\|белый тюльпан\|белых тюльпана\|белых тюльпанов}; why the same, without «красн.», «бел.» | {a} красных и {b} белых тюльпанов (21 красных) |
| `C1-a1p004` | {a\|тетрадь\|тетради\|тетрадей} и {b\|ручка\|ручки\|ручек} вместе стоят …; why: цена {e\|тетради\|тетрадей\|тетрадей} | Тетради ({a} шт.) и ручки ({b} шт.) …; цена тетрадей ({e} шт.) |
| `C1-a1p008` | en: gets {s\|litre\|litres} more every minute (also `family.template`) | gets 1 litres more |
| `C1-a2p002` | why: то есть {k\|удвоение\|удвоения\|удвоений} | удвоение {k} раз (4 раз) |
| `C1-pcp003` | {n\|одинаковый красный флажок\|одинаковых красных флажка\|одинаковых красных флажков} и … синих …; why: из {s\|места\|мест\|мест} | одинаковые красные флажки ({n} шт.) |
| `C1-bcp004` | раздать {n\|одинаковую конфету\|одинаковые конфеты\|одинаковых конфет} {k\|ребёнку\|детям\|детям}; why: {n\|конфета\|…} и {km\|перегородка\|…} в ряд; en why: {km\|divider\|dividers} | конфеты ({n} шт.) детям ({k} чел.) |
| `C1-sat004` | en: After {t1\|hour\|hours} (also `family.template`) | After 1 hours |
| `C1-sat013` | на каждые {n\|порцию\|порции\|порций} … на {N\|…}; why the same | {n} порц. |
| `C1-sat014` | Из {n\|ученика\|учеников\|учеников}, писавших школьный тест | Из {n} учеников (из 21 учеников, where n allows it) |
| `C1-sat016` | В опросе участвовали {N\|ученик\|ученика\|учеников}: | участвовали ученики, всего {N} чел.: |
| `C1-sat018` | с частотой {d\|капля\|капли\|капель} в минуту … за {D\|сутки\|суток\|суток} | {d} капель/мин (22 капель/мин) … за {D} сут. |
| `C1-pal062` | {a\|тетрадь стоит\|тетради стоят\|тетрадей стоят} {P} сум | {a} тетради стоят (5 тетради стоят) |
| `C1-m2a003` | в баке останется {w\|литр\|литра\|литров} | {w} литров (483 литров) |
| `C1-m2a011` | en why: {r\|unit\|units} right | 1 units right |
| `C1-m2b006` | uz why: Ulardan {g2} nafari qiz. | Ulardan qizlar: {g2}. |

Left as written, by reading: a dash before a number is how a Russian textbook writes it («его возраст — 31», «в шахматы — 15», «через 5 ч —
13 см»); «на 3 вправо» is the subject's own idiom; a list after a colon («Баллы … за тест: 58, 55, …») and an instruction («Вычислите: …»)
read well; the uz two-way table «Qizlar: {g1} nafari maktabga piyoda boradi» describes the table's row as its en and ru stems do (and
C19-MAPS03-2's example and its pin say it so).

**Keys, versions and checks.** No answer formula, param, constraint, distractor or option changed: each family keeps its version and its
`solver:relation@50` (the precedent of `8ce7e40`), and `family-check.ts` verifies all 18 again, 50/50 each, with no problem. Their 33
C1x instance texts are the families' new renders (`checkInstanceItem` clean). The lesson texts that wrote the same way follow:
C19-MAAL03-1's example («5 тетрадей и 2 ручки …», was «Тетради (5 шт.) и ручки (2 шт.)») and C19-MAPS01-3's example and its question
C19-ps13q2 («25 капель в минуту», was «капель/мин»), with `tests/unit/engine/lesson-p7-a2.test.ts`'s pin of that example.
