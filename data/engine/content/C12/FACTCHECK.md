# C12 fact check (essay tasks, essay tracks, brainstorm micro-prompts), 2026-10-07

Scope: all six files, 75 records. `C12-1.json` (13), `C12-2.json` (15), `C12-3.json` (12), `C12-4.json` (5 tracks), `C12-5.json` and
`C12-6.json` (30 brainstorm micro-prompts). C12 has **no real dates, deadlines or fees**. Every deadline is something the student
records from an official page (`C12-motivl`, `C12-supfnd`), and the code anchors the tracks to the planner. So the factual surface is:

- the 13 verbatim quotes: 7 Common App prompts and the 3 UCAS questions, which appear 6 times;
- the 10 distinct `facts[]` claims (53 entries across 29 records) and the student text that relies on them: word and character
  limits, the Additional information and Challenges and circumstances questions, and the Common App and UCAS rules on AI and
  plagiarism;
- registration and submission steps: pasting into the Common App or UCAS, the UCAS declaration, and the supplement and motivation
  letter look-ups;
- internal references in the track notes: planner rule, milestones, `plan.ts`, C11 and `minutes_total`.

Every web source was opened on 7 Oct 2026. All 438 en/uz/ru triples were read side by side.

## Counts

| | Count |
|---|---:|
| Records checked | 75 of 75 |
| Records with fact-bearing content | 33: 29 with `facts[]`, plus `C12-supfnd`, `C12-supwhy`, `C12-motivl` and `C12-motdrf` (look-up steps with no dates of their own) |
| Web sources opened | 13 (list below) |
| Verbatim quotes checked character by character | 13 of 13 exact (7 Common App prompts, 6 UCAS question quotes) |
| Distinct fact claims checked | 10 (8 existing, 2 added) |
| Claims confirmed from an official source | 8 of 10 |
| Claims corrected | 0. All existing claims held up. |
| Student-facing statements corrected | 3 records: `C12-caaddi`, `C12-ucfinl`, `C12-ucrevi` |
| Internal references corrected | 1 record: `C12-tucasp` (wrong catalog named) |
| Translation strings changed | 12: the en/uz/ru of those 4 records. One ru string also gets a label fix. |
| Fact notes refreshed | 9 (the 650/250 claim in 8 records, and the 300-word claim in `C12-caaddi`) |
| Facts added | 2 (`C12-caaddi`) |
| Invented content removed | 0 (none found) |
| Records `needs_verification: true` | 9, unchanged: `C12-rd7prm`, `C12-cadrf1`, `C12-rvcut6`, `C12-cadrf2`, `C12-caaddi`, `C12-cafinl`, `C12-redo4s`, `C12-tcomap`, `C12-tredo4` |
| Uzbek strings scanned for oʻ/gʻ/ʼ | 438: 778 U+02BB and 39 U+02BC, all correctly placed. No ASCII or curly apostrophes, no backticks, no missing marks. |
| Cross-references (`C12-…` ids) resolved | 126 of 126 |

Every `facts[]` entry has `url` and `verified_at: "2026-10-07"`. The four changed records carry
`factcheck: {verified_at, note}`. Every `version` stays 1 and every record stays `draft`, because counselor review is still launch
gate LG1.

## Sources opened

commonapp.org is a Gatsby site, so the plain HTML has no body text. The prompt and policy text was read from the pages' own
`/page-data/<path>/page-data.json`. The appsupport (Salesforce) articles render only with a crawler user agent.

| Source | Result |
|---|---|
| commonapp.org/apply/essay-prompts | **Confirmed.** Headed "Here is the full set of essay prompts for 2026–2027". All 7 `prompt_quote.text` values match exactly, including the ASCII apostrophe in "you've" and the final full stop of prompt 7. |
| commonapp.org/blog/announcing-2026-2027-common-app-essay-prompts | **Confirmed.** Created 2026-02-27. "the Common App essay prompts will remain the same for 2026–2027". Also says the 2026-2027 application opens on August 1. No catalog text gives that date. |
| commonapp.org/blog/announcing-2025-2026-common-app-essay-prompts | **Confirmed.** Created 2025-02-27. Additional information: "reduced from 650 to 300 words max". Challenges and circumstances: "first-year app 250 words max". It also gives the full Challenges and circumstances question. |
| commonapp.org/fraud-policy | **Confirmed.** "Submitting plagiarized essays … or intentionally misrepresenting as one's own original work: (1) another person's thoughts, language, ideas, expressions, or experiences or (2) the substantive content or output of an artificial intelligence platform, technology, or algorithm". |
| commonapp.org/files/webinar_decks/Whats-New-with-Common-App-First-Year-2026-2027.pdf | Says the "2026–2027 essay prompts remain the same". It lists one change to the "Challenges and circumstances question: 'care-taking' to 'caregiving'". It gives **no word limits**. |
| Resource_FY_Essays_ENG_2025.06.25 (Common App essay handout, linked from the 2026 announcement) | Has the prompts and brainstorming ideas. It gives **no word limits**. |
| commonapp.org/apply/first-year-students | No word limits. |
| appsupport.commonapp.org article `are-there-word-limits-kudeoeos` | **Not about the personal essay.** It is a UChicago supplement article (dated Jun 28, 2023). |
| appsupport.commonapp.org/applicantsupport/s/writing-requirements | The per-college grid's "Min/max word count" cells are empty without a login. |
| collegetransitions.com/blog/common-app-essay-prompts (secondary) | **Confirmed as secondary.** Published 5 Mar 2026, 2026-27 cycle. "The Common App essay word limit remains at 650 words." "There is also a minimum floor of 250 words." |
| ucas.com/personal-statement | **Confirmed.** Title "How to write your personal statement: 2026 entry onwards". The 3 questions match exactly. "Each answer will have a minimum character count of 350 characters". "The 4,000 overall character limit (including spaces)". "use the 4,000 character count limit across all answers in any way you choose". "Admissions staff will still review your personal statement as a whole, so remember not to repeat information". It also mentions an "overall character counter". |
| ucas.com/about-us/news-and-insights/reforming-admissions | **Confirmed.** For 2026 entry, the statement goes "from one longer piece of text to three separate sections, each with a different question", and is "still 4000 characters in total; this includes spaces". |
| ucas.com/…/a-guide-to-using-ai-and-chatgpt-with-your-personal-statement | **Confirmed.** Submitting all or a large part from an AI tool "could be considered cheating by universities and colleges". "When you complete your application, you now have to declare that your personal statement hasn't been copied or provided from another source, including artificial intelligence software." |

## Corrected

1. **`C12-caaddi`, Additional information (student text, en/uz/ru).** The task told students to explain "a period when a family or
   health circumstance affected your grades" in Additional information. Since 1 Aug 2025 the first-year application has had a
   separate optional **Challenges and circumstances** question. Its listed examples include family disruptions (including health and
   the loss of a family member) and physical health and mental well-being. The 2026-2027 deck shows that the question is still
   there. The text now keeps Additional information for things like a change of school or a gap in studies, and points family or
   health circumstances to Challenges and circumstances. Two facts were added: the 2025-2026 announcement and the 2026-2027 deck.
   The ru text said «Не нужно», but the option label is «Не нужен»; it now matches.
2. **`C12-ucfinl`, the UCAS declaration (en/uz/ru).** The old text was "When you submit, UCAS asks you to declare that the statement
   is your own and not copied or generated by AI". It now follows the UCAS source: when you complete your application, you declare
   that the statement "has not been copied or provided from another source, including AI software".
3. **`C12-ucrevi`, the "norepeat" hint (en/uz/ru).** The old text was "UCAS reads the three answers as one statement". UCAS does
   not read it; the universities' admissions staff do, which is what ucas.com says. It now reads "Admissions staff read …" in all
   three languages.
4. **`C12-tucasp`, internal note (en/uz/ru).** The note said code anchors the track to "the UCAS deadline rule (C11)". C11 covers
   test registrations, the Uzbek state application and the Tashkent private universities, and it has no UCAS record. The UCAS
   deadlines are in `src/engine/data/seed_rules.json`, destination UK. Both the early and the main deadline there are still
   `needs_verification: true`, so the note now says so.

## Still unverified (stays `needs_verification: true`)

- **The Common App personal essay is 250-650 words.** It is used by 8 records: `C12-rd7prm`, `C12-cadrf1`, `C12-rvcut6`,
  `C12-cadrf2`, `C12-cafinl`, `C12-redo4s`, `C12-tcomap` and `C12-tredo4`. The code checks it in `max_words: 650` and
  `min_words: 250`. No commonapp.org page that opens without signing in states it (see the sources table), and only a secondary
  source confirms it for 2026-27. The note in each entry now says this. Close it by reading the Writing section inside a 2026-2027
  application.
  `C12-rd7prm` and `C12-cafinl` carry this fact but do not state the limit in their own text. The flag is kept because they belong to
  the same essay pipeline.
- **The Additional information limit is 300 words, and Challenges and circumstances is 250 (`C12-caaddi`).** Both are confirmed for
  2025-2026 from Common App's announcement. For 2026-2027, neither the announcement nor the deck restates them, though neither
  changes them. `C12-caaddi` checks the 300-word limit (`then_if.check.max_words: 300`).

## Confirmed without change

- **`C12-ownwrd`, `C12-rvvoic`, `C12-tredo4`, `C12-tmotiv`, `C12-tcomap`:** the Common App fraud policy line and the UCAS AI line.
  The paraphrases in the student text match the sources in all three languages.
- **`C12-sbank3`, `C12-ucintr`, `C12-ucevid`, `C12-ucq1dr`-`C12-ucq3dr`, `C12-ucrevi`, `C12-ucfinl`, `C12-tucasp`:** the UCAS
  numbers (350 per answer, 4,000 in total including spaces, shared freely, read as a whole). The code checks
  (`min_chars: 350`, `max_chars_total: 4000`, per-answer `max_chars: 3300` = 4,000 - 2 × 350) agree. The "about 1,000-1,500
  characters" in `C12-ucq1dr` is presented as our advice, not as a UCAS rule.
- **`C12-capr01`-`C12-capr07`:** all quotes are exact, with attribution "first-year essay prompts 2026-2027". The uz and ru glosses
  are labelled as unofficial and say the same as the English.
- **`C12-supfnd`, `C12-supwhy`, `C12-motivl`, `C12-motdrf`:** they state no limits or dates. The student records them from the
  official page, and `C12-motivl`'s note says code never adds a date of its own.
- **Micro-prompts `C12-bmp001`-`C12-bmp030`:** no factual claims. `maps_to` was checked against the prompt and question numbers
  above. `C12-bmp019` names Navruz, a wedding and a hashar; the English explains hashar and the uz/ru do not need to.

## Internal references (all confirmed except the C11 one above)

- `planner.essays_before_deadline` = "essays drafted at least 12 weeks before the first deadline" (`src/engine/rules.ts:36`,
  `drizzle/0002_seed_rules.sql`). `m_essays` is `back(84)`, route US (`src/engine/plan.ts:107`). This matches the `C12-tcomap` note.
- `plan.ts` has no UK personal-statement milestone; its only UK milestone is `m_verify_UCAT` (`plan.ts:153`). This matches the
  `C12-tucasp` note.
- `minutes_total` recomputed from the tasks' own minutes, with optional steps left out and the chosen micro-prompts counted at
  5 minutes: `C12-tcomap` 463, `C12-tucasp` 233, `C12-tstory` 100, `C12-tredo4` 248, `C12-tmotiv` 143. All five match.
- All 126 `C12-…` references (steps, `shows`, `variant_5min`, `is_variant_of`, `rubric_ref`, `lang_from_field`) resolve to records.

## Language check

- All 438 en/uz/ru triples were compared. Apart from the four corrected records, the three languages say the same thing. Naming
  differs but is not wrong: ru uses «мотивационное письмо» and "personal statement" for the UCAS statement.
- Uzbek: every oʻ and gʻ uses U+02BB (778). Every tutuq belgisi uses U+02BC (39: baʼzi, taʼsir, eʼtiqod, maʼlumot, anʼana,
  isteʼdod, masʼuliyat, …). There are no ASCII apostrophes, U+2018, U+2019 or backticks. No word appears both with and without its
  mark.
