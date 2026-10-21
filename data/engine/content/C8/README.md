# C8: activity playbooks (practice/task content)

The catalogue of activity playbooks the roadmap can pick by id (`playbook_id`, P5 spec §4.4) and the daily scheduler turns into
floor-3 "build" tasks (§4.5). Each playbook has 6-10 steps with minutes and a verification level (§4.6), one parent step (§4.8, C13 rules),
and an "activity line" outcome sized to the Common App limits. Spec row: §5.3 C8.

State on 2026-10-07: **22 playbooks in 2 files (`C8-1.json` 11, `C8-2.json` 11), 201 steps, all `status: "draft"`, `test_content: true`.**
None is `reviewed`: a counselor review before real families is launch gate LG1. Playbooks are not keyed items, so they are not part of
any assessment pool and share nothing with K1/K2/K4/K4x/K5.

## Record format

Each file is `{ "bank": "C8", "batch": n, "items": [...] }`. One item:

| Field | Meaning |
|---|---|
| `id`, `playbook_id` | `C8-<6 letters>`; the id the AI strategy output uses (`playbook_id`, §4.4) |
| `kind` | always `activity_playbook` |
| `category` | the `m6_activities` category enum in `question_bank.json` (academic_club, research, building_tech, sports, arts, community_service, work, family_responsibility, entrepreneurship, religious_cultural, …) |
| `common_app_type` | suggested Common App activity type; **`needs_verification: true`** (see Sources) |
| `weight` | `major` / `minor`, for V9 (≤ 2 major playbooks at a time). 20 major; `C8-sumapp` and `C8-langex` are minor |
| `stages`, `min_age` | stages the playbook suits; `min_age` only where a sourced rule sets one (13 for `C8-edchan`, 15 for `C8-intern`) |
| `e_ceiling`, `addresses` | the highest extracurricular rating the playbook can support on its own (§3.4: E2 = leading role with output; E3 = solid participation) and the gap codes it addresses. No playbook claims E1, a chance or a result (V15) |
| `title`, `summary` | uz/ru/en |
| `weeks` `{min, typical}`, `minutes_total`, `weekly_minutes.typical` | `minutes_total` = Σ step minutes × repeats, for V12; weekly = total ÷ typical weeks, rounded up to 5 |
| `outside_hours_per_week` | only where the activity itself happens outside app tasks (`C8-intern`, `C8-fambiz`); not counted in `minutes_total` |
| `steps[]` | `n`, `id` (`C8-xxxxxx-s<n>`), `type` (the existing `TaskType`), `minutes`, optional `repeat` + `every_days`, `title`, `instructions` (uz/ru/en), `evidence` |
| `parent_step` | one code-written parent task (uz/ru/en), conversation or logistics only, never "check the homework" (§4.7). `fires: "parent_ok"` when a student step waits for it |
| `activity_line` | `position` (≤ 50), `organization` (≤ 100), `description` (≤ 150) in en/uz/ru with `{placeholders}`; `placeholders` (type, `max_chars`, uz/ru/en label); `max_filled_len` per language with every placeholder at its maximum width; `only_if` where the line is valid only after an event (`C8-sumapp`: after attending) |
| `facts[]` | every factual claim with `url` + `verified_at`, or `needs_verification: true`; `secondary: true` where the source is not the primary one |
| `source`, `author`, `status`, `version`, `review` | `own`, `agent:p5-C8`, `draft`, 1, counselor review at LG1 |

The **last step of every playbook** is the same "Write your activity line" step (L3 artifact): the student fills the template with their own
numbers or writes their own line; the check counts characters (50/100/150) and rejects the unfilled template. English is the Common App
version; the uz and ru lines are for applications and CVs in those languages. The app never fills in numbers.

### Evidence (`steps[].evidence`), mapped to the §4.6 ladder

| Level | Method | Shape used here | Steps |
|---|---|---|---:|
| L1 | `self_report` + fields | `fields: [{key, type: int\|date\|text_short, min/max or max_chars, label}]` | 48 |
| L2 | `quiz` | `pool: "C1"`, `items: 6`, `only_if_subject: "math"`, `fallback` (L1) — `C8-olytrn` only | 1 |
| L3 | `artifact` | `check: {min_words, max_words, min_links?, not_prompt}`; the activity-line step uses `check.activity_line` | 101 |
| L4 | `link` | `hosts: [allow-list]` or `hosts: "official_domain"` (`C8-sumapp`: the programme's own site); some carry `or: L5` and one carries `fields` | 22 |
| L5 | `upload` | `accept: image\|pdf\|spreadsheet\|audio\|video` | 22 |
| L6 | `auto_event` | `event: "parent_ok"`, fired by the playbook's parent step | 6 |
| L7 | `checkpoint` | `stages: ["S3"]`, `else: L0` — `C8-sumapp` final check only | 1 |

No step uses bare L0. **Engineering needs to add** (none exists in code today, `types.ts:55` has `self_report | quiz | upload | auto_event | link`):
`artifact` and `checkpoint` (spec §4.6), the `parent_ok` event, upload types beyond image/PDF, the `official_domain` host rule, and the L2
`only_if_subject` fallback.

Upload steps tell the student to cover phone numbers and personal details and never to show faces without consent, or the faces of
people receiving help. The six L6 playbooks are the ones with travel, money, strangers or public posting: `C8-intern`, `C8-volngo`,
`C8-startp`, `C8-culsrv`, `C8-edchan` and `C8-langex`.

## The 22 playbooks

| id | Title (en) | Category | CA type (unverified) | Weight | Stages | Steps | Min | Evidence by step | File |
|---|---|---|---|---|---|---:|---:|---|---|
| `C8-rdclub` | Start a reading club | academic_club | Academic | major | S1 S2 S3 | 9 | 500 | L3 L1 L1 L3 L1 L3 L4 L3 L3 | C8-1 |
| `C8-cmprob` | Solve a problem in your community | community_service | Community Service (Volunteer) | major | S2 S3 S4 | 10 | 485 | L3 L3 L1 L3 L1 L5 L1 L4 L3 L3 | C8-1 |
| `C8-resrch` | Do a research mini-project | research | Research | major | S2 S3 S4 | 10 | 550 | L3 L3 L1 L3 L4 L5 L3 L3 L4 L3 | C8-1 |
| `C8-codapp` | Build an app or a bot people use | building_tech | Computer/Technology | major | S1-S4 | 9 | 560 | L3 L4 L5 L4 L3 L4 L4 L1 L3 | C8-1 |
| `C8-tutorg` | Tutor younger students | community_service | Community Service (Volunteer) | major | S1-S4 | 9 | 550 | L1 L1 L3 L3 L1 L1 L5 L3 L3 | C8-1 |
| `C8-writpb` | Write and publish a series | arts | Journalism/Publication | major | S1-S4 | 9 | 570 | L3 L3 L3 L3 L3 L5 L4 L1 L3 | C8-1 |
| `C8-artpfl` | Build an arts portfolio | arts | Art | major | S1-S4 | 9 | 645 | L5 L3 L3 L5 L3 L3 L4 L5 L3 | C8-1 |
| `C8-sportl` | Lead in sport | sports | Athletics: Club | major | S1-S4 | 9 | 565 | L3 L1 L3 L1 L1 L5 L1 L3 L3 | C8-1 |
| `C8-olytrn` | Run an olympiad training group | academic_club | Science/Math | major | S1 S2 S3 | 10 | 910 | L1 L1 L3 L1 L2 L3 L1 L1 L3 L3 | C8-1 |
| `C8-sumapp` | Apply to a summer programme | academic_club | Academic | minor | S2 S3 | 10 | 380 | L3 L4 L3 L1 L3 L1 L7 L5 L1 L3 | C8-1 |
| `C8-intern` | Do an internship and keep a work log | work | Career-Oriented | major | S2 S3 S4, age 15+ | 9 | 320 | L3 L6 L3 L1 L1 L3 L3 L5 L3 | C8-1 |
| `C8-volngo` | Volunteer with an organisation | community_service | Community Service (Volunteer) | major | S1-S4 | 9 | 1,255 | L3 L6 L1 L3 L1 L3 L1 L5 L3 | C8-2 |
| `C8-newspr` | Start a school newspaper | academic_club | Journalism/Publication | major | S1-S4 | 9 | 570 | L1 L1 L3 L3 L3 L4 L1 L3 L3 | C8-2 |
| `C8-debmun` | Debate or Model UN | academic_club | Debate/Speech | major | S1-S4 | 9 | 545 | L3 L3 L5 L3 L3 L5 L3 L1 L3 | C8-2 |
| `C8-startp` | Test a small business idea | entrepreneurship | Career-Oriented | major | S2 S3 S4 | 10 | 535 | L3 L3 L3 L6 L5 L1 L3 L5 L4 L3 | C8-2 |
| `C8-fambiz` | Take a real role in the family business | family_responsibility | Family Responsibilities | major | S1-S4 | 9 | 425 | L3 L5 L1 L3 L4 L1 L5 L3 L3 | C8-2 |
| `C8-culsrv` | Serve your cultural or faith community | religious_cultural | Cultural | major | S1-S4 | 9 | 820 | L3 L6 L1 L1 L3 L1 L4 L3 L3 | C8-2 |
| `C8-envprj` | Run an environmental project | community_service | Environmental | major | S1-S4 | 9 | 630 | L3 L1 L3 L1 L5 L1 L1 L4 L3 | C8-2 |
| `C8-transl` | Translate open knowledge into your language | academic_club | Academic | major | S2 S3 S4 | 8 | 560 | L3 L3 L3 L4 L3 L4 L1 L3 | C8-2 |
| `C8-edchan` | Run an educational video channel | arts | Journalism/Publication | major | S1-S4, age 13+ | 9 | 890 | L3 L6 L3 L4 L3 L3 L1 L3 L3 | C8-2 |
| `C8-makerb` | Build a device or robot | building_tech | Robotics | major | S1-S4 | 9 | 555 | L3 L3 L5 L5 L4 L1 L4 L5 L3 | C8-2 |
| `C8-langex` | Run a language exchange | academic_club | Cultural | minor | S1-S4 | 8 | 585 | L3 L6 L3 L3 L4 L1 L3 L3 | C8-2 |

Every activity line fits its limits in all three languages with every placeholder at full width (largest: position 50/50,
organisation 95/100, description 149/150).

## Sources (facts carried in `facts[]`)

| Claim | Source | Used in |
|---|---|---|
| Up to 10 activities; position 50, organisation 100, description 150 characters; hours/week and weeks/year asked separately; the section asks about family responsibilities, jobs, internships and volunteering | [Common App, "Approaching the Activities section" (2025)](https://www.commonapp.org/static/a5d59a915bdc2031e62c468ad35e0de9/Resource_FY_Activities_ENG_2025.06.25_0.pdf), read 2026-10-07 | all; `C8-fambiz` |
| GitHub: age 13 or older, no users under 13, a login may not be shared | [GitHub Terms of Service B.3](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service) (effective 27 Apr 2026) | `C8-codapp` |
| Scratch accounts for young people: set up with a parent, or created by a teacher | [Code Club, accounts for creators](https://codeclub.org/en/resources/accounts-for-children) (secondary) | `C8-codapp` |
| Own Google Account: 13 where the country is not listed; Uzbekistan is not listed | [Google Account Help](https://support.google.com/accounts/answer/1350409?hl=en) | `C8-edchan` |
| YouTube: sign-in needs a Google Account of the country's minimum age; 13+, younger only if a parent enables it; under 18 with a parent's permission; every creator sets "made for kids", which turns comments off | [YouTube Help](https://support.google.com/youtube/answer/2802272?hl=en), [YouTube Terms](https://www.youtube.com/t/terms), [made for kids](https://support.google.com/youtube/answer/9528076?hl=en) | `C8-edchan` |
| Uzbekistan: employment from 16; students from 15 light work in free time with one parent's written consent; under 15 only creative work in culture, media or sport with both parents' consent and the guardianship authority's permission; 15-16 at most 24 h/week, 16-18 at most 36, half of that while studying | [Labour Code, art. 118 and 415](https://lex.uz/docs/6257288); summary in [gov.uz news, 1 Jun 2026](https://gov.uz/oz/bv/news/view/171400) (secondary) | `C8-intern`, `C8-edchan` |
| Wikipedia text is CC BY-SA 4.0; reusers attribute, keep the licence and share alike; a translation credits its source in the edit summary | [Wikipedia:Copyrights](https://en.wikipedia.org/wiki/Wikipedia:Copyrights), [Wikipedia:Translation](https://en.wikipedia.org/wiki/Wikipedia:Translation) | `C8-transl` |
| "Yashil makon" national planting project with autumn and spring seasons; autumn 2026 season confirmed | [gov.uz, 10 Nov 2025](https://gov.uz/oz/eco/news/view/100889), [gov.uz, 26 Sep 2026](https://gov.uz/oz/eco/news/view/224703) | `C8-envprj` |
| Red Crescent Society of Uzbekistan: school, lyceum and college students take part in its actions; 15 branches and 212 local units | [redcrescent.uz](https://redcrescent.uz/uz/activities/working-with-youth-and-volunteers/), [IFRC country plan 2026](https://go-api.ifrc.org/api/DownloadFile/93045/Uzbekistan_INP_2026); [yuz.uz, 2021](https://yuz.uz/uz/news/672-nafar-oquvchi-volontyorlikka-qabul-qilindi) (secondary: 672 technical-college students, not school students) | `C8-volngo` |
| Schools have a deputy director for spiritual and educational work and a school adviser for student initiatives | [PQ-277, 8 Sep 2025](https://lex.uz/uz/docs/-7730550) | `C8-newspr` |
| soliq.uz opens the State Tax Committee's page on gov.uz; stat.uz is the state statistics body | [gov.uz/oz/soliq](https://gov.uz/oz/soliq), [stat.uz](https://stat.uz/uz/) | `C8-startp`, `C8-resrch` |

- **Common App activity type labels are `needs_verification`.** The official list sits inside the logged-in application. All 14
  labels used here appear with this spelling in a secondary text list ([InGenius Prep template, Jul 2026](https://ingeniusprep.com/wp-content/uploads/2026/07/Common-App-Activities-List-Template.pdf));
  the earlier source (collegeapplicationguy) shows the list only as an image. A counselor confirms them at LG1.
- **Fact check of 2026-10-07:** what was checked, corrected and left open is in [FACTCHECK.md](FACTCHECK.md).
- **No dates are stored in C8.** `C8-olytrn` takes stage dates from the C9 catalogue. In `C8-sumapp` the student checks each programme's
  deadline, rules and cost on its official site, as an L4 link step. That playbook is the one item with `needs_verification: true`.
- The spec's `[CA-ACT]` URL (`…/f133e7d8…/Resource_FY_Activities_ENG_2025.06.25.pdf`) now returns 404; the live file is the
  `…/a5d59a91…/…_0.pdf` above. Spec §9 should be updated.
- Grounding for "depth over breadth" in the summaries: [MIT Admissions, What we look for](https://mitadmissions.org/apply/process/what-we-look-for/)
  `[MIT-LOOK]`. The summaries state it as advice, not as a statistic.
- No real person is named. No result, statistic or testimonial is invented. Numbers appear only as the student's own entries through
  placeholders and fields.

## Differences from the spec's C8 row (for the controller)

The workflow's list of 22, which these files follow, differs from spec §5.3 C8:
- **No family-responsibility log.** `C8-fambiz` covers family businesses. Caring for siblings or relatives and household duties
  (`m6_responsibilities`) have no playbook.
- **No S4 gap-year playbooks.** The spec asks for two: a documented work or volunteer gap year, and a state-test retake plan. Without them,
  the S4 persona has only the general playbooks that list S4 (19 of 22).
- Added beyond the spec's named examples: school newspaper, debate/MUN, religious/cultural service, environmental project, translation,
  educational channel, maker/robotics, language exchange.

## Validation run (2026-10-07)

A build script checks every file before it is written:
- the schema of each field above;
- 6-10 steps per playbook;
- `TaskType` values, and minutes from 5 to 180;
- repeats carry `every_days`;
- each evidence level is paired with its method, and each method has its required fields;
- every L6 `parent_ok` step has a parent step that fires it;
- en/uz/ru are present for every title, instruction, summary, label and line;
- uz has no Cyrillic, every oʻ/gʻ is U+02BB (no ASCII or typographic apostrophes, no U+02BC after o or g), and a list of common
  tutuq-belgisi words is checked;
- ru contains Cyrillic and no Uzbek apostrophes;
- placeholders appear only in activity lines, are defined, are used, and are the same in all three languages;
- filled lengths are within 50/100/150;
- ids are unique;
- every fact has a URL and `verified_at`, or `needs_verification`.

All 22 pass. Not done: back-translation of uz/ru by a separate agent (§5.5 step 5), and counselor review (LG1).
