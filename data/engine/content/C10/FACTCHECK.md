# C10 fact check (2026-10-07)

This check covers the test-prep catalog: `C10-1.json` to `C10-4.json` (48 units: 24 SAT, 24 IELTS Academic) and `sequences.json`
(2 study plans). Every cited URL was opened on 2026-10-07. Pages were downloaded and read as text. PDFs were read with PyMuPDF. A
summarising fetcher was not trusted: for the SAT spec PDF it returned PSAT numbers that are not in the document. Every changed record
keeps `verified_at: "2026-10-07"`.

## Totals

| | Count |
|---|---:|
| Records checked | 50 (48 units, 2 sequences) |
| Distinct fact claims checked | 33 (165 instances), all confirmed against the cited page |
| Distinct cited URLs opened | 21, all HTTP 200 |
| Official-link objects checked (label, note, `how` step) | 103 (45 distinct `how` steps) |
| Domain-share objects checked | 24, plus the SAT `domain_weights` |
| Records corrected | 35 |
| Invented or unsupported claims removed | 1 |
| Still unverified (`needs_verification: true`) | 2 flags, both on the same item (the IELTS Trial Test) |
| uz/ru/en triples checked | 1,095. 1 translation fixed |

## Checked and confirmed

**SAT.** Sources: *Digital SAT Suite Specifications Overview* (CB PDF, Summer 2022, still hosted), and the CB pages *How the SAT Is
Structured*, *The Reading and Writing Section*, *Full-Length Digital Practice Tests on Bluebook*, *How to Use Khan Academy*, *How to Use the
Student Question Bank* (with its Reading and Writing, Math and Tips sub-pages), *My Practice 101*, *Full-Length SAT and PSAT Paper Practice
Tests*, *Download Bluebook* and the Bluebook help article *How do breaks work in Bluebook?*.

- Reading and Writing has 54 questions in 64 minutes: two 32-minute modules, each with 25 operational and 2 pretest questions. Math
  has 44 questions in 70 minutes: two 35-minute modules, each with 20 operational and 2 pretest questions. The test lasts
  2 h 14 min, with a 10-minute break between the sections. The Bluebook help article says practice tests have the same break.
- Domain shares: Craft and Structure ≈28 % (13-15 questions), Information and Ideas ≈26 % (12-14), Standard English Conventions ≈26 %
  (11-15), Expression of Ideas ≈20 % (8-12). Algebra ≈35 % (13-15), Advanced Math ≈35 % (13-15), Problem-Solving and Data Analysis ≈15 %
  (5-7), Geometry and Trigonometry ≈15 % (5-7). All 24 `domain_share` objects and `domain_weights` match.
- Module order is Craft and Structure, then Information and Ideas, Standard English Conventions and Expression of Ideas. Standard English
  Conventions questions go from easiest to hardest whatever the convention. Informational graphics are tables, bar graphs and line graphs.
  Passages are 25-150 words, and each passage or passage pair has one question.
- Math: about 75 % multiple choice and 25 % student-produced response. The built-in graphing calculator works on the whole section, and
  students may bring their own approved calculator. A reference sheet is provided. Section scores are 200-800 and the total is 400-1600,
  in 10-point steps.
- The pacing numbers in the end-check instructions are right. 64 × 60 / 54 = 71.1 s and 70 × 60 / 44 = 95.5 s. Every `time_limit_s` is n × 71 or
  n × 95.
- **Student Question Bank.** You sign in to My Practice with a College Board student account or a school sign-in ticket. Questions can be
  filtered by assessment, test, domain, skill and difficulty. The difficulty names are Easy, Medium and Hard (Tips page). Every
  domain and skill name in the 24 `how` steps appears on CB's Student Question Bank pages.
- **Bluebook.** It runs on Windows or Mac computers, iPads and school-managed Chromebooks. Scores and question review appear in My Practice.
  Eight SAT practice tests (4-11) are published, so the plan's 4 mocks can each use a test the student has not taken.
- **Khan Academy.** CB's page says the course is free, developed in partnership with College Board, has SAT Reading and Writing and SAT
  Math courses with quizzes and unit tests, and links to `khanacademy.org/digital-sat`.
- **Pass-mark basis.** Khan's "Familiar" level is 70-99 % correct on an exercise. Source: the help-center article "How do Khan Academy's
  Mastery levels work?". The article returns 403 to automated fetches, so its indexed text was read through two separate searches.
- **Study points.** The maths rules were checked by hand: exponent rules, quadratic formula and discriminant, percent change, growth and
  decay factor, the exterior angle, sin x° = cos(90° − x°), arc length, π rad = 180°, and the circle equation. So were the grammar rules:
  its/it's and the modifier rule. All are correct.

**IELTS Academic.** Sources: ielts.org pages for the Academic test overview, Listening, Reading, Writing and Speaking formats, sample test
questions, the Trial Test, Writing test preparation resources, and the four PDFs (Writing band descriptors, updated May 2023; Writing key
assessment criteria; Speaking band descriptors; Speaking sample tasks 2023).

- The test takes 2 h 45 min: Listening about 30 minutes, Reading 60 (including transfer time), Writing 60, Speaking 11-14.
- Listening has 4 parts of 10 questions (40 in all) and each recording is heard once. Parts 1-2 are everyday and social: a conversation,
  then one speaker. Parts 3-4 are educational: a discussion, then a talk on an academic subject. Going over the word limit loses the mark.
  Accents include British, Australian, New Zealand and North American.
- Reading has 3 sections, 2,150-2,750 words in all, and 40 questions. The 11 question types listed match the page.
- Writing: Task 1 is at least 150 words in about 20 minutes. Task 2 is at least 250 words in about 40 minutes. Task 2 counts twice as much.
  The four criteria are task achievement or task response, coherence and cohesion, lexical resource, and grammatical range and accuracy.
- Speaking: a face-to-face interview with an examiner, recorded, in three parts. Part 1 is 4-5 minutes, Part 2 is 3-4 minutes with 1 minute to prepare and 2 minutes
  of talk, and Part 3 is 4-5 minutes. It has four criteria.
- **Sample-task names in the `how` steps.** All exist on the sample page. Listening has exactly **eight** tasks, so "all eight Listening
  sample tasks" in IELI06 is right. They are Multiple Choice (one answer), Multiple Choice (more than one answer), Plan/Map/Diagram
  Labelling, Note Completion, Table Completion, Flow-chart Completion, Sentence Completion and Short Answer Questions. The Reading samples
  named are Multiple Choice (one and more than one answer), Identifying Information (True/False/Not Given), Matching Features, Matching
  Sentence Endings, Summary Completion and Table Completion. Writing has the Part 1 and Part 2 samples, the on-paper samples, and example
  responses with band scores and examiner comments.
- **Trial Test content.** It is free, covers Listening, Reading and Writing, is on paper, and runs at participating locations under timed
  conditions. An official examiner marks it. The scores cannot be used for academic, immigration or work purposes.

## Corrected

| What | Records | Change |
|---|---:|---|
| Khan Academy link label | 24 SAT units | "Official Digital SAT Prep" → **"Official SAT Prep"**, the name CB's Khan and Bluebook pages use now. uz and ru changed to match. |
| Pass-mark basis (Khan "Familiar" 70-99 %) | 24 SAT units | The claim was confirmed. Added `basis_url` (Khan help center) and `basis_verified_at`. |
| Reading timing fact | 6 IELTS Reading units | "60 minutes including transfer time" was cited to the Reading page, which does not say it. The fact is now two facts: the format (Reading page) and "the 60 minutes include transfer time" (Academic test overview page). |
| IEWR06 study point | 1 | **Removed an unsupported claim**, "you may start with Task 2 because it counts more". No IELTS, British Council or IDP page found says the tasks may be done in either order. It now says: do not let Task 1 run over, because Task 2 counts twice as much. That is supported by the Writing page. en, uz and ru were changed. |
| IELI05 study point, uz and ru | 1 | en says "a multiple-choice question that asks for two answers". uz and ru had dropped "multiple-choice". Both now say it (*variantli savol*, *вопрос с выбором ответа*). |
| SAT mock "after" step | 4 mock steps (SAT sequence) | "Sort the questions you missed by domain in My Practice" described a sorting feature that CB does not document. It now uses what *My Practice 101* documents: Score Details lists every question with the correct and the chosen answer, and the practice score report shows each domain. A sourced fact was added to each mock. |
| SAT plan `design_basis` | 1 (SAT sequence) | Confirmed that Magoosh's three-month SAT schedule exists and starts with a baseline test. Added `design_basis_url` and `design_basis_verified_at`. |
| IELTS Trial Test `verify_note` | 2 (IELI06, IELTS sequence) | The note now records the new evidence (below). It stays unverified. |

## Still unverified

- **IELTS Trial Test for students in Uzbekistan** (`C10-IELI06.official_links[ielts_trial]`, `C10-SEQIEL` mock-week `optional_extra`). Both
  keep `needs_verification: true`. The Trial Test is offered **only for IELTS on paper**. kun.uz (9 July 2025) reported an IDP Edu-Action notice:
  paper-based IELTS in Uzbekistan stopped from **11 July 2025** after answer leaks, described as temporary. The British Council Uzbekistan site says it currently offers
  only IELTS on Computer. No participating Trial Test location in Uzbekistan was found. **Do not show this link to students in Uzbekistan**
  until British Council or IDP Uzbekistan confirms a location.

Verified, with these caveats:

- The **Student Question Bank `how` steps** were checked against CB's public Question Bank pages. The signed-in tool at
  `mypractice.collegeboard.org/questionbank/search` was not opened, because it needs a login. One naming difference: CB's Student Question Bank Math page
  calls the skill "Linear functions in one variable", but the spec PDF and MAAL02's `how` say "Linear functions". The step still finds it, because the
  words are the start of both names.
- **`khanacademy.org/digital-sat`** returns HTTP 200 behind a bot check, so its own text could not be read. It is confirmed as the official link
  because CB's Khan and Bluebook pages link to it.

## The sequences, checked again and promoted (2026-10-10)

`sequences.json` held one `status: "draft"` for both plans. Every address it cites was opened again on 2026-10-10 (WebFetch for each
page; the College Board dates page, the Bluebook page and the IELTS Trial Test page were also read as the headless browser's own DOM text;
the spec PDF was read as text with `pdftotext`, not through a summarising fetcher). Each sequence now carries its own `status`,
`version` 2 and `verified_at`, and every cited address carries `verified_at: "2026-10-10"` (26 stamps). The 48 units were **not**
re-checked today and keep 2026-10-07.

| Sequence | Claim | Address | Read on 2026-10-10 |
|---|---|---|---|
| C10-SEQSAT | The SAT takes 2 hours 14 minutes, with a 10-minute break between the sections | `satsuite.collegeboard.org/sat/whats-on-the-test/structure` | Holds: "64 minutes … Reading and Writing … 70 minutes … Math … a total of 2 hours and 14 minutes", "a 10-minute break between the Reading and Writing section and the Math section" |
| C10-SEQSAT | Section scores 200-800, total 400-1600, 10-point intervals; the eight domain shares | `satsuite.collegeboard.org/media/pdf/digital-sat-test-spec-overview.pdf` (Summer 2022) | Holds: Table 4, SAT "400-1600, in 10-point intervals" and "200-800, in 10-point intervals"; 28 % / 26 % / 26 % / 20 % and 35 % / 35 % / 15 % / 15 % |
| C10-SEQSAT | After a Bluebook practice test, scores and question review appear in My Practice | `satsuite.collegeboard.org/practice/practice-tests/bluebook` | Holds: "After you complete a digital practice test in Bluebook, you can view and download your scores in My Practice, review questions, analyze your performance" |
| C10-SEQSAT | The link's source: official full-length practice tests on Bluebook | `satsuite.collegeboard.org/practice/practice-tests` | Holds: "Find a test preview and official full-length practice tests on the Bluebook app." |
| C10-SEQSAT | Bluebook runs on Windows or Mac computers, iPads and school-managed Chromebooks | `bluebook.collegeboard.org/students/download-bluebook` | Holds: "a Windows or Mac device, an iPad, or a school-managed Chromebook" |
| C10-SEQSAT | Score Details lists every question with the correct and the selected answer; the report shows the content domains | `satsuite.collegeboard.org/practice/my-practice-101` | Holds: "The Score Details page lists every question on your practice test, including the correct answer, the answer you selected" |
| C10-SEQSAT | Design basis: a three-month schedule with a baseline test first (a secondary design reference, not an outcome claim) | `magoosh.com/sat/three-month-sat-study-schedule/` | Holds: "Before Day 1, get a baseline"; the schedule "includes eight full-length practice tests" |
| C10-SEQSAT | **Added:** eight full-length SAT practice tests (4 to 11), the same ones free in Bluebook, so four distinct mocks exist | `satsuite.collegeboard.org/practice/practice-tests/paper` | Holds: SAT Practice Test 4 to 11 listed; "you can take the same practice tests for free in Bluebook". **The Bluebook page itself no longer says how many tests there are.** |
| C10-SEQIEL | **Added:** four sections (Listening, Reading, Writing, Speaking), 2 hours 45 minutes | `ielts.org/take-a-test/test-types/ielts-academic-test` | Holds: "In IELTS, there are four sections: Listening, Reading, Writing and Speaking."; "The test time is 2 hours and 45 minutes" |
| C10-SEQIEL | **Removed:** the mock week's `optional_extra`, the IELTS Trial Test link (the one `needs_verification` flag of the file) | `ielts.org/take-a-test/preparation-resources/ielts-trial-test` | The page opens, and says the Trial Test is free, covers Listening, Reading and Writing, is held "at a participating official Trial Testing location" and is marked by an examiner. It names no country and no location. **It does not say "on paper"** (the 7 Oct note said it did; the page's text today has the word only in a menu item). The British Council Uzbekistan pages (`britishcouncil.uz/en/exam/ielts`, `…/dates-fees-locations`) did not answer (two timeouts each, by fetch and by browser). No official page confirms a Trial Test location in Uzbekistan, so the link is removed from the sequence, not promoted. |

**Both sequences are `verified_auto`.** What "served" means today is written in the file's `serving` note: the rounds are served in
the record's order; the four full-length mock steps (`opt_in`, 144 minutes) and the order "weakest domain first" inside a round are
not, and the sentences that describe them (the SAT plan's `how`, a mock's `after`) are shown on no screen. `C10-IELI06` keeps its own
flagged Trial Test link (a unit, not re-checked today); the step reader skips a flagged link.

## Language

- **Uzbek:** 1,095 uz strings. Every oʻ and gʻ uses U+02BB (1,794 marks). The tutuq belgisi uses U+02BC (203 marks). No oʻ or gʻ has a
  wrong mark, and there is no Cyrillic. Twenty ASCII apostrophes remain, in four uz strings. All are English quoted inside Uzbek text, such as
  *it's*, *'I'm not sure about that'*, *'firstly'* and *'It depends on…'*. They were left as they are, the same way as in the K banks.
- **Parity:** every numeral in en matches uz and ru, except 2,150 and 2 150, which is the same number in local formatting. Reading the
  factual triples found one meaning gap, IELI05, which is now fixed.

## Notes for the integrator (not fact errors; not changed)

- `C10-IELI06.end_check.content` is `official:ielts_samples`, but IELI06's own `official_links` lists only `ielts_trial`. The
  samples link has to come from another unit, or be added here.
- Some IELTS Listening units practise a task type with an official sample recorded in a different Part. IELI01 (Part 1) uses
  *Table Completion*, which is a Part 4 extract. IELI04 (Part 4) uses *Flow-chart Completion* and *Sentence Completion*, which are Part 3 extracts.
  The task types fit the units, but the Parts do not.
- The IEWR03 Task 2 "question types" (opinion, discussion, problem and solution, two-part) are a common teaching grouping, not an official
  IELTS taxonomy. The official Writing page lists the skills tested differently.

# P7 (the P7 integration, 13 Oct 2026): C10-5, C10-6 and C10-7

The P7 authors wrote 14 new test-prep units as `draft`: `C10-APCA01` … `APCA04` (AP Calculus AB, `C10-5.json` and `C10-6.json`) and
`C10-DTMC01` … `DTMC10` (the state test's compulsory mathematics block, `C10-7.json`). They are read by `src/server/lessons/course.ts`
only, as the units of the AP Calculus AB and DTM: Matematika courses. Each cited page was opened on 13 Oct 2026 and read as text.

- **AP Students, "AP Calculus AB" course page** (apstudents.collegeboard.org/courses/ap-calculus-ab, HTTP 200, read as text): its course
  content lists Unit 1 "Limits and Continuity", Unit 2 "Differentiation: Definition and Fundamental Properties", Unit 3 "Differentiation:
  Composite, Implicit, and Inverse Functions" and Unit 4 "Contextual Applications of Differentiation". The four records' titles and
  their one fact each match word for word. Their official link is the same page. **Confirmed.**
- **The Agency's PDF** (uzbmb.uz/upload/file/pdf/qabul2026/Baholash mezoni.pdf, Order No. 105 of 13 March 2026, Annex 1; HTTP 200, read
  with PyMuPDF): "Matematika · 10 · 1,1 · 11,0" among the three compulsory subjects. The DTM records' first fact (10 questions, 1.1 points
  each) is **confirmed**. Their second fact, "Each question has 4 options and one correct answer", is **not in this PDF**: it gives the
  number of questions and the points only. `C18/mocks.json` carries `options_per_question: 4` with no source of its own. The fact is
  marked `needs_verification` (with its `check` note), and so is each DTM record (`verify_task: true`), as the validator requires
  (`catalog.flag`). The DTM lessons' study line and "format" piece that say "4 options" rest on it until an official page is found.

All 14 records are now `verified_auto`. `scripts/content/validate.ts --no-families --all`: 0 errors, 858 warnings (the P7 baseline).

# P8 (the P8 integration, 14 Oct 2026): C10-8

The P8 author a4 wrote four test-prep units as `draft`: `C10-APCA05` … `APCA08` (AP Calculus AB units 5-8, `C10-8.json`). They are read by
`src/server/lessons/course.ts` only, as more units of the AP Calculus AB course (not by `steps.ts` or `strategy/catalogs.ts`).

- **AP Students, "AP Calculus AB" course page** (apstudents.collegeboard.org/courses/ap-calculus-ab, opened on 14 Oct 2026 and read as
  text): its course content lists Unit 5 "Analytical Applications of Differentiation", Unit 6 "Integration and Accumulation of Change",
  Unit 7 "Differential Equations" and Unit 8 "Applications of Integration". The four records' titles and their one fact each match word for
  word. Their official link is the same page. **Confirmed.**

All 4 records are now `verified_auto`.

# P15 (the P15 integration, 18 Oct 2026): C10-9

The P15 author ap1 wrote eight test-prep units as `draft`: `C10-APPH01` … `APPH08` (AP Physics 1 units 1-8, `C10-9.json`), for the
owner's 18 Oct "add" (AP beyond Calculus). They are read by `src/server/lessons/course.ts` only, as the units of the AP Physics 1 course
`ap_physics_1`, behind AP_PHYSICS (off by default).

- **AP Students, "AP Physics 1: Algebra-Based" course page** (apstudents.collegeboard.org/courses/ap-physics-1-algebra-based, downloaded
  on 18 Oct 2026 with a plain GET and read as text, not through a summarising fetcher): its course content lists Unit 1 "Kinematics",
  Unit 2 "Force and Translational Dynamics", Unit 3 "Work, Energy, and Power", Unit 4 "Linear Momentum", Unit 5 "Torque and Rotational
  Dynamics", Unit 6 "Energy and Momentum of Rotating Systems", Unit 7 "Oscillations" and Unit 8 "Fluids". The eight records' titles, their
  unit numbers and their one fact each ("AP Physics 1 unit N is …") match word for word. Their official link is the same page. **Confirmed.**
- The records' goals and study lines are our own wording (no College Board text): each formula and statement in their English lines was
  read and is right (Δx = v₀t + ½at², v² = v₀² + 2aΔx, g = 9.8 m/s² also at the top of the path; ΣF = ma, the third law's pair on two
  objects, mg, μN, kx, mv²/r; K = ½mv², W = Fd and the work-energy theorem, mgh, ½kx², P = W ÷ t = Fv; p = mv, J = FΔt = Δp, momentum
  kept in every collision and kinetic energy only in an elastic one; v = rω, τ = rF at a right angle, α = Στ ÷ I; ½Iω², W = τθ, L = Iω;
  T = 2π√(m/k), T = 2π√(L/g) for small swings, f = 1 ÷ T; ρ = m ÷ V, P = F ÷ A, P = P₀ + ρgh, F = ρVg, A₁v₁ = A₂v₂).

All 8 records are now `verified_auto`. Their 24 lessons (`C19-25.json`, `C19-26.json`) were checked as lesson records by the content
lane's q2 pass (`RECONCILE-p15-q2.md`, 19 Oct 2026) and are `verified_auto` too; the course serves them with AP_PHYSICS on. The unit
list was read again on AP Students by the integration on 19 Oct 2026 (plain GET): the same eight units in the same order.
