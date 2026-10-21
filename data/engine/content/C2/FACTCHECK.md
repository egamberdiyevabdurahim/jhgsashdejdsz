# C2 fact check (2026-10-07)

C2 is the math explainer catalog: 48 study cards in `C2-1.json` to `C2-4.json`, 12 per file, 6 per rung (arith, prealg, alg1, geom,
alg2, precalc, calc, beyond). Each card has a title, an idea, one worked example with a sympy `solver` list, a `watch_out` and four
`checks` that point at C1. Every card is `draft`, `version` 1, `source: "own"`.

**C2 has no record with a date, deadline, admission requirement, fee, URL or registration step.** Nothing in it cites a source, so no
`{url, verified_at}` pair needed updating and no record needed `needs_verification`. The check therefore covered what C2 does state: the
math, two non-math claims, the agreement of the three languages, and the Uzbek apostrophes.

## Counts

| | Count |
|---|---:|
| Records checked | 48 |
| Records with a date, deadline, requirement, fee, URL or registration step | 0 |
| Worked examples re-run (sympy 1.14.0) | 48 |
| Solver asserts re-run / passed | 183 / 183 |
| Trilingual text fields compared (en, uz, ru) | 404 |
| Claims corrected | 2 (in 2 records, all three languages each) |
| Claims removed as invented | 0 |
| Translation-only fixes | 0 |
| Uzbek apostrophe fixes | 0 |
| Records set `needs_verification` | 0 |
| Items flagged for the owner (not facts, not changed) | 3 groups, below |

## Math

- Every `example.solver` line was evaluated again with sympy 1.14.0: 183 of 183 are true. Each record's `example_check` (`asserts`,
  `passed`) and `key_check_2` (`sympy-1.14.0:n/n`) match the re-run.
- Every `idea` and `watch_out` was read for correctness. All are right except `C2-ca0001` (below). The usual scope limits are
  acceptable for school level: the remainder is smaller than the divisor for positive whole numbers; the power rule holds for x > 0; the
  one-vertex triangulation in `C2-ge0002` assumes a convex polygon, though the angle-sum formula holds for any simple polygon.
- The wrong answers named in `watch_out` fields (566, 216, 13, 8/14, 3142 L, x > 3, 21/2, −11 and others) were recomputed. Each is what
  the named mistake actually gives.

## Corrected

| Record | Field | Was | Now | Why |
|---|---|---|---|---|
| `C2-ar0001` | `watch_out` | forgetting the carry is "the most common slip" (uz "eng koʻp uchraydigan xato", ru "самая частая ошибка") | "a common slip" (uz "koʻp uchraydigan xato", ru "частая ошибка") | Unsupported superlative. Raghubar et al. 2009 (J. Learning Disabilities, 291 children in grades 3-4, [PMC2788949](https://pmc.ncbi.nlm.nih.gov/articles/PMC2788949/)) found addition procedural bugs "a relatively rare occurrence (5% overall)"; math-fact errors were more frequent. |
| `C2-ca0001` | `idea` | "If you get 0/0, the numerator and the denominator share a factor (x − a)" | "If a fraction of two polynomials gives 0/0, …" (uz "ikki koʻphadning nisbati", ru "дробь из двух многочленов") | False in general. It holds for polynomials by the factor theorem, but not, for example, for sin(kx)/x, which this card's own `checks[3]` targets. |

Both records now carry `factcheck: {verified_at: "2026-10-07", note}`; `C2-ar0001` also has the `url`. The worked examples and their
asserts were not touched, so `version` stays 1.

## Other claims confirmed

- "1 m³ = 1000 litres" (`C2-ge0006`): the SI litre is 1 dm³, so this is true by definition.
- "Newton–Leibniz formula" (`C2-ca0006`): standard name for F(b) − F(a), used in uz and ru schooling.
- Prices in soʻm (a 2,400,000 soʻm phone in `C2-pa0003`; 4 kg of apples for 36,000 soʻm in `C2-pa0006`) are word-problem numbers,
  not claims about real prices. They are plausible and were left as they are.

## Languages

- Numbers were compared field by field across en, uz and ru in all 404 trilingual fields. That covers digit grouping (en 1,486; uz/ru
  1486 or 2 400 000) and the decimal comma in uz and ru. Three fields differ, and only in wording: ru writes "пять" for 5
  (`C2-a20003` step 1), ru says "в первом ряду" for "Row 1" (`C2-a20004`), and uz/ru title `C2-pa0003` "a hundredth part" for "a part
  out of 100".
- Every field was read in all three languages for meaning. They say the same thing. These are local school conventions, not errors:
  - uz/ru write area as S = πr² where en has A.
  - uz says "proporsiyaning asosiy xossasi" where en says "cross-multiply" (`C2-pa0006` title and step 2).
  - uz/ru add "rectangular parallelepiped" next to "box" (`C2-ge0006`).
  - Tangent is written `tan` in all three languages.

## Uzbek orthography

- 438 oʻ/gʻ marks, all U+02BB. 7 tutuq marks, all U+02BC: nomaʼlum ×3, yaʼni, eʼtibor, maʼlum and taʼsir.
- No ASCII apostrophes, U+2018, U+2019 or backticks in any `uz` field.
- A scan of all 916 distinct Uzbek words found no unmarked oʻ/gʻ form, and no word that is written both with and without the mark.
  "surat" (numerator) and "jami" are correctly unmarked.

## Still open (not facts; left for the owner or the author)

1. **Six cards point at C1 subskills that C1 does not have** (C1 as written at 11:14 today, still in progress):

   | Card | Subskill C2 points at | C1 has |
   |---|---|---|
   | `C2-a20005` | `alg2/exponential_equation` | `exponential_functions` / `exponential_growth` |
   | `C2-a20006` | `alg2/rational_exponents` | none |
   | `C2-pc0005` | `precalc/function_composition` | none |
   | `C2-pc0006` | `precalc/trig_equations` | none |
   | `C2-by0004` | `beyond/separable_ode` | `differential_equations` |
   | `C2-by0006` | `beyond/determinant` | `determinants` (K4 also uses the plural) |

   All of these except `determinant` exist in K4's taxonomy. They were not renamed here.
2. **`C2-ca0001` lists checks the card does not teach.** `checks[2]` (the limit of a rational function at infinity) and `checks[3]`
   (sin(kx)/x as x → 0) need methods other than factor and cancel.
3. **`back_translation` is null on all 48 cards.** The language comparison above is one reader's check, not a native-speaker review or
   back-translation.
