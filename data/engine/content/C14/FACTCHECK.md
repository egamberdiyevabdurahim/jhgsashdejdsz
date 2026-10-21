# C14 fact check (reflection and MCII prompts), 2026-10-07

Scope: `C14-1.json` (16 records), `C14-2.json` (16 records) and `option_sets.json` (14 chip sets and the if-then template). C14 is a
catalog of prompts, not quiz items. Its student-facing text has **no real dates, deadlines, fees, registration steps or links**. Dates
and titles arrive through code tokens (`{due}`, `{title}`, `{test}`) from rule records. So the factual surface is:

- the evidence `sources` (shared by both files);
- the CDC sleep line, which appears in two records as `facts[]` and as a student-facing hint;
- the internal spec, R5 and code references in `basis_note`, `trigger`, `engine_hints` and `tone_rules`.

Every web source was opened on 7 Oct 2026. All 471 en/uz/ru triples were read side by side.

## Counts

| | Count |
|---|---:|
| Records checked | 32 of 32, plus 14 chip sets and the if-then template |
| Web sources opened | 6. The 5 cited sources, plus ICO Standard 13, which a basis note cited without a source record. |
| Web claims checked | 14: DUCK2011 3, GOLL2006 2, WOOP 4, CDC 4, ICO13 1 |
| Student-facing CDC hints checked against the source | 2 records × 3 languages |
| Internal references checked (spec, R5, code) | 22 |
| Claims confirmed | 36 of 36. None was false; the changes below are a better URL, missing details and a missing source record. |
| Source records corrected or completed | 4 (GOLL2006, DUCK2011, SPEC, plus ICO13 added) |
| Translation strings corrected | 6, in 3 records and 2 chip sets |
| Invented content removed | 0 (none found) |
| Records set `needs_verification: true` | 0 |
| Uzbek strings scanned for oʻ/gʻ/ʼ | 471: no ASCII or curly apostrophes and no missing modifier letters |

Every `source` now has `verified_at: "2026-10-07"`. The changed or fact-bearing records carry `factcheck: {verified_at, note}`:

- `C14-mcii-final-weeks`
- `C14-mcii-gap`
- `C14-ref-week-kid`
- `C14-ref-energy`
- `C14-evt-setback`

`option_sets.json` has a top-level `factcheck`. Every `version` stays 1 and every record stays `draft`, because counselor review is
still launch gate LG1.

## Sources

| Source | Opened | Result |
|---|---|---|
| DUCK2011, Duckworth et al. 2011, *Educational Psychology* 31(1), 17-26 | KOPS record | **Confirmed.** The abstract reads "Sixty-six 2nd-year high school students preparing to take a high-stakes exam"; the intervention group "completed more than 60% more practice questions". `used_for` now says "second-year", and `doi` 10.1080/01443410.2010.506003 was added. |
| GOLL2006, Gollwitzer & Sheeran 2006, *Adv. Exp. Soc. Psych.* 38 | socmot page (no abstract), then the KOPS record | **URL corrected.** `url` now points to the KOPS record, which shows the abstract; the socmot page is kept as `alt_url`. Pages 69-119 and `doi` 10.1016/S0065-2601(06)38002-1 were added. The abstract confirms "94 independent tests" and "d= .65". The old note said d was not re-read; it now says it was. d is still not used in any student-facing text. |
| WOOP-PRACTICE, woopmylife.org/en/practice | page | **Confirmed.** The order is Wish, Outcome, Obstacle, Plan. The wish is "somewhat challenging, but you should be able to fulfill it". The obstacle is inner ("an emotion, a belief, or a habit"). The plan is "If [obstacle], then I will [action]", "short, concrete". |
| CDC-SLEEP, cdc.gov/sleep/about | page | **Confirmed.** Last reviewed May 15, 2024. School age 6-12 years: 9-12 h. Teen 13-17 years: 8-10 h. Adult 18-60 years: 7 or more h. The page says 13-17, not 13-18. Note that plain `curl` gets HTTP 403 (bot block), but the page loads in a browser fetch. |
| ICO13, ICO Children's Code Standard 13 (added) | page | **Confirmed.** The code says "Nudge towards wellbeing enhancing behaviours (such as taking breaks)". The `C14-ref-energy` basis note cited it with no source record, so `ICO13` was added to both files' `sources` and to that record's `basis`. |
| SPEC, P5 spec v2 and R5 (internal) | local files in `jg-p4d/.superpowers/sdd/2026-10-07-p5/` | **Confirmed.** `verified_at` was `null` and is now set; `url` stays `null` because there is no public URL, and a `path` and `note` were added. |

## The CDC line in student text (2 records, en/uz/ru)

- `C14-mcii-final-weeks` step 5 hint, ages 13-17 and 18+: matches the CDC table in all three languages.
- `C14-ref-energy` step 2 hint, ages 6-12, 13-17 and 18+: matches in all three languages.

The `sleep_hours` chips (less than 6, 6-7, 7-8, 8-10, more than 10) are answer bands, not guidance, so they need no source.

## Internal references (22, all confirmed)

**P5 spec:**
- §2.6: a check result is labelled "provisional".
- §4.1: a new destination goes back from [X] to [R].
- §4.4 and D14: dates come from code, never from AI.
- §4.5:
  - floor 4 is the weekly MCII plan, ≤ 5 min;
  - "never in the last 48 h" (marked [inference]);
  - c7 < 0.6 cuts the load by 15 %, and +10 % is only offered;
  - "never miss twice" gives a 2-task restart day;
  - 48 h streak repair.
- §4.6: L0, L1, L6 (auto_event) and L4-L7.
- §4.7: rest days neutral, at most one reminder a day from the mentor's name, never in sleep hours.
- §5.3 C14 row: about 30 prompts, uz/ru/en.
- D14 (5): no free-text, family or sensitive answer reaches the AI.

**R5:**
- §3 rows:
  - habit formation (stable time and place; a missed day is not a failure);
  - streak repair ("never shame a broken streak");
  - rewards (Deci; no coins for what a student enjoys);
  - wellbeing (sleep; ICO 13);
  - MCII ("Each heavy task carries a 'when and where' choice", quoted verbatim).
- §5.2 reflect row: grade 10 "plus an error-log review", grade 11 "plus this week's deadline check".
- §5.7: no loss-framed messages; celebrate real progress.

**Code (`src/engine/tasks.ts`):**
- the exam block is the last 28 days before a hard deadline, S2 and up;
- no verbatim repeat within 14 days;
- the `reflect_week` template exists.

## Translation fixes (en/uz/ru now say the same thing)

| Record | Field | Was | Now |
|---|---|---|---|
| `C14-mcii-gap` | `no_structure.if_form.uz` | "kun yarmi boʻlib…" (midday) | "ertalab ancha vaqt oʻtib…" (en and ru say mid-morning) |
| `C14-ref-week-kid` | scale label 2, uz | "Yaxshi" (good) | "Yomon emas" (en "Okay", ru "Нормально") |
| `C14-ref-week-kid` | step 2 prompt, ru | "самое интересное" (most interesting) | "Что было лучшим из того…" (en "the best") |
| `C14-evt-setback` | step 2 hint, ru | "уже несколько дней" (for several days already) | "дольше нескольких дней" (en "more than a few days") |
| `option_sets` `mistake_type.didnt_know` | ru | "Не знаю…" (present tense) | "Не знал(а) правила или идеи" (en and uz are past tense) |
| `option_sets` `talk_to.not_now` | en | "Not now" | "No one for now" (uz "Hozircha hech kim", ru "Пока ни с кем"; the id stays `not_now`) |

The other 465 triples match in meaning. Small register differences were left alone, for example ru "Хорошего вам отдыха" for "Enjoy
the rest of your day" on a rest day, and generic-masculine "он" in `C14-rest-thanks`.

## Still unverified or open

1. **Helpline.** `C14-ref-energy` shows no helpline number. A repeat search on 7 Oct found no official page for a national child or
   youth helpline in Uzbekistan. 1146 appears only in secondary summaries, as a helpline for violence against women with a child
   pathway being set up. The `safety_note` records the recheck. Add a number only from an official page.
2. **Streak repair is not built.** `src/engine/streak.ts` has freezes only. The `C14-evt-restart` line "your streak is repaired" is
   gated by `closing_if: streak repair available`, so it stays hidden until the repair rule exists.
3. **SPEC has no public URL.** It was checked against the local files only.
4. **Native-speaker review** of the uz and ru copy is still owed under LG1 (counselor review). This check covered meaning and the
   U+02BB/U+02BC characters, not style.
5. **Outside C14 (for the spec owner):** spec §4.5 and R5 say the Duckworth students prepared for the "PSAT", but the KOPS abstract
   says only "a high-stakes exam". C14 does not repeat the PSAT claim.
6. **Content note, not a fact:** `C14-mcii-busy` opens with "School is heavy this week" (uz "maktab ishlari"), but its stages
   include S4 (gap year or university). Rewording or limiting it to S1-S3 is a content decision, so it was not changed.
