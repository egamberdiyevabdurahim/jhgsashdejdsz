# C8 fact check, 2026-10-07

Scope: `C8-1.json` and `C8-2.json` (22 playbooks, 201 steps). I checked every `facts[]` entry, every `common_app_type` source, and every
step that states a date, deadline, age or other requirement, fee, URL or host, or registration step against its cited page or an
official source. I compared the uz, ru and en texts of all titles, summaries, steps, parent steps and activity lines, and machine-checked
the Uzbek orthography.

C8 stores no dates, deadlines or fees. Programme and olympiad dates come from the student's own official-page check (`C8-sumapp`) or from
the C9 catalogue (`C8-olytrn`). The claims checked here are ages, legal limits, licences, platform rules, character limits and named
institutions.

## Counts

| | Count |
|---|---:|
| `facts[]` entries before the check | 31 |
| confirmed as written (`verified_at` 2026-10-07) | 27 |
| corrected (claim reworded to match the source) | 3 |
| left `needs_verification` (by design: `C8-sumapp` stores no programme facts) | 1 |
| facts added, each with a URL (primary sources and newer items) | 13 |
| `facts[]` entries after the check | 44 (43 with URL + `verified_at`, 1 `needs_verification`) |
| `common_app_type` labels checked (22 records, 14 distinct labels) | 22, all found with exact spelling in a secondary list; still `needs_verification` |
| step texts corrected for facts (uz + ru + en each) | 3 (`C8-codapp` s2, `C8-intern` s1, `C8-newspr` s1) |
| translation fixes (one language brought in line) | 5 (`C8-rdclub` s2 uz, `C8-cmprob` activity line uz, `C8-intern` s2 and parent step uz, `C8-edchan` activity line ru) |
| invented or wrong statements removed | 2 (the "deputy director for youth affairs" post; GitHub via "a parent's or teacher's account") |
| still open, for the content owner or the counselor (LG1) | 9 (list below) |

## Confirmed

| Claim | Where | Source read 2026-10-07 |
|---|---|---|
| Up to ten activities; position 50, organisation 100, details 150 characters; hours/week and weeks/year asked separately; the guide asks about family responsibilities, a job, internship or volunteer work | all 22 (`facts[0]`); `C8-fambiz` | [Common App PDF](https://www.commonapp.org/static/a5d59a915bdc2031e62c468ad35e0de9/Resource_FY_Activities_ENG_2025.06.25_0.pdf), text extracted and read. The spec's older `…f133e7d8…` URL still returns 404. |
| GitHub: age 13 or older | `C8-codapp` | [GitHub ToS B.3](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service), effective 27 Apr 2026 |
| Own Google Account at 13 where the country is not listed; Uzbekistan is not listed | `C8-edchan` | [Google Account Help](https://support.google.com/accounts/answer/1350409?hl=en) |
| The numbers in the intern labour fact: employment age 16; ages 15-16 at most 24 h/week, at most 12 while studying; after classes or in holidays. Its consent wording was corrected (Corrected, item 2). | `C8-intern` | gov.uz news of 1 Jun 2026, checked against Labour Code art. 118 and 415 on [lex.uz](https://lex.uz/docs/6257288) |
| Wikipedia text under CC BY-SA 4.0 (attribute, licence notice, share-alike) | `C8-transl` | [Wikipedia:Copyrights](https://en.wikipedia.org/wiki/Wikipedia:Copyrights); uz.wikipedia.org footer also links CC BY-SA 4.0 |
| "Yashil makon" has autumn and spring planting seasons | `C8-envprj` | [gov.uz, 10 Nov 2025](https://gov.uz/oz/eco/news/view/100889) (125 million saplings for autumn 2025, 75 million for spring 2026) |
| "Depth over breadth" stated as advice | summaries | [MIT Admissions](https://mitadmissions.org/apply/process/what-we-look-for/): "Choose quality over quantity." |
| Step texts that matched their sources without change | `C8-edchan` s2 and parent step (Google 13+), `C8-transl` s1-s2 (licence, edit summary), `C8-envprj` s3 (Yashil makon seasons), `C8-volngo` s1 (district branch: 212 local units), `C8-resrch` s2 (stat.uz, Google Scholar, CORE), `C8-startp` s9 (soliq.uz and the host list), `C8-olytrn` s8 (school stage runs in the school, Sept) | as listed in `facts[]` |

## Corrected

1. **`C8-codapp` step 2 (en/uz/ru).** It said under-13s could use "a parent's or teacher's account" on GitHub. GitHub's terms do not
   permit any user under 13 and do not allow a login to be shared. The step now sends under-13s to Scratch, with an account set up with a
   parent or made by a teacher. The GitHub fact now quotes both rules, and a Scratch fact was added. Scratch's own FAQ is a JavaScript page
   the checker could not read, so that fact is from Code Club and marked `secondary`.
2. **`C8-intern` step 1 (en/uz/ru).** "With a parent's consent" became "with a parent's written consent". Labour Code art. 118 part 2,
   as amended on 13 Feb 2025, requires written consent of one parent for 15-year-old students. The facts now cite the Code as the primary
   source. The gov.uz summary is kept as `secondary`, reworded and with a note that for under-15s the Code also requires both parents'
   consent and the guardianship authority's permission.
3. **`C8-edchan` labour fact.** It said under-15s may do light work "with a parent's or guardian's consent". Art. 118 part 3 allows an
   under-15 employment contract only for creative work in culture, media or professional sport, with both parents' consent and the
   guardianship authority's permission. The gov.uz item that lists digital content and children's blogs is kept as `secondary`.
4. **`C8-volngo` Red Crescent fact.** It said a 2021 event admitted "672 school students". The yuz.uz article says they were first-year
   students of the Tashkent railway technical college (texnikum). Corrected and kept as `secondary`. Two primary facts were added:
   redcrescent.uz says school, lyceum, college and university students take part in its actions (15 youth centres, more than 38,000
   volunteers, no minimum volunteer age published), and the IFRC 2026 country plan gives 15 branches and 212 local units.
5. **`C8-newspr` step 1 (en/uz/ru).** "The deputy director for youth affairs" is not a school post in PQ-277 of 8 Sep 2025. The step
   now names "the director, the deputy director for spiritual and educational work (maʼnaviy-maʼrifiy ishlar boʻyicha direktor
   oʻrinbosari) or the school adviser for student initiatives (oʻquvchilar tashabbuslarini qoʻllab-quvvatlash boʻyicha maktab
   maslahatchisi)". The resolution was added as a fact.
6. **`common_app_type` source (22 records).** The old source now redirects to collegeapplicationguy.com and shows the list only as an
   image, so the labels could not be read there. The source is now a text list, the InGenius Prep template of July 2026 (28 types). All 14
   labels used in C8 appear there with this exact spelling. The labels stay `needs_verification` because the official list is only
   inside the logged-in Common App.

Facts added only to tie a claim to a source:
- YouTube sign-in and ToS (13+, younger only if a parent enables it, under 18 with a parent's permission).
- The YouTube "made for kids" rule.
- The 26 Sep 2026 Yashil makon item: the autumn 2026 season starts by region in November 2026; it also adds micro-forests in school courtyards.
- Wikipedia:Translation (the edit summary credits the source).
- soliq.uz now redirects to gov.uz/oz/soliq, the State Tax Committee's page.
- stat.uz is the state statistics body's site.

## Translation and orthography

- Uzbek: all oʻ/gʻ use U+02BB. The tutuq belgisi uses U+02BC (for example maʼlumot, taʼlim, GitHubʼda). There are no ASCII, typographic
  or backtick apostrophes, no U+02BC after o or g, and no Cyrillic in any uz string. Russian has no Uzbek apostrophes. These checks were
  run on every uz/ru string and on the new facts.
- Numbers agree in all three languages wherever they appear. In some places Russian writes a number as a word (тремя, троих, за неделю),
  and the meaning is the same.
- Fixed:
  - `C8-rdclub` s2: the uz text now says a Telegram group *call*, as en and ru do.
  - `C8-cmprob` activity line: uz now says "led" the volunteers (`boshqardim`), as en and ru do; filled length 145/150.
  - `C8-intern` s2 and parent step uz: "ish haq" corrected to "ish haqi" (wages).
  - `C8-edchan` activity line ru: added "проверено учителем" (teacher-checked), which en and uz had; the template is shortened to 146/150.
  - Both `max_filled_len` values were recomputed. All activity lines still fit 50/100/150 in every language, and their placeholders match.
- Left as is (small differences, no fact at stake): `C8-tutorg` activity line uz/ru lack "weekly"; `C8-olytrn` activity line uz lacks
  "on past problems" and ru lacks "weekly".

## Still unverified or open

1. **Common App activity-type labels (22 records).** They can only be confirmed inside the logged-in application, by the counselor at
   LG1. Possible better fits to check there:
   - `C8-culsrv` (faith communities): "Religious" exists as a type.
   - `C8-intern` (paid work): "Work (Paid)" exists as a type.
   - The current list has no "Internship" or "Foreign Language" type.
2. **`C8-sumapp` programme facts.** By design, the student checks every programme's facts on its official page in step 2. This is the
   one `needs_verification` fact.
3. **Instagram is 13+.** That is the help-centre wording found by search; the page itself is JavaScript-only. S1 students can be 13 or
   younger, but Instagram is offered as an option in:
   - `C8-rdclub` s7
   - `C8-cmprob` s8
   - `C8-artpfl` s7
   - `C8-envprj` s8
   - `C8-fambiz` s4-s5
   - `C8-startp` s6

   No step states Instagram's age rule. Telegram's terms set no minimum age for users in Uzbekistan (18 only in the EU, UK and
   Australia), so its use needs no change.
4. **YouTube "made for kids".** Every creator must set it, and comments are off on made-for-kids videos. `C8-edchan` step 6 assumes
   comments are on. A channel for younger children would have to collect questions another way. This is noted in the fact, but the steps
   are unchanged.
5. **`C8-edchan` age rules.** `min_age` is 13, yet step 2 and the parent step still give an under-13 route (a parent's account). The
   route matches YouTube's terms, but it never applies at this `min_age`.
6. **The Cabinet of Ministers list of work for under-15s.** Its mention of digital content and children's blogs comes only from the
   gov.uz news item. The resolution itself was not located.
7. **`C8-olytrn`.** The Ministry's main olympiad is for grades 9-11 (school stage in September, district stage in October). This playbook
   lists S1, where students may be younger. Eligibility depends on the olympiad picked from the C9 list.
8. **Behance and ArtStation** (`C8-artpfl` hosts) returned 403 to the checker, which looks like bot blocking. Their sign-up age rules
   were not checked.
9. **Back-translation and counselor review** (README: §5.5 step 5, LG1) are still not done. This check compared meaning and facts, not
   style.

## Sources consulted (all read on 2026-10-07)

Common App activities PDF; InGenius Prep activity-type template (Jul 2026); collegeapplicationguy (redirect, image only); GitHub Terms of
Service; Code Club accounts page; Google Account age page; YouTube Help 2802272, 9528076, 9706180; YouTube Terms; Telegram ToS and
privacy policy (as served in Uzbekistan) and the EU ToS; Uzbekistan Labour Code (lex.uz 6257288, art. 20, 118, 415, 416); gov.uz
bv 171400; PQ-277 (lex.uz -7730550); talimxabarlari.uz 58081 and 45599 (secondary, leading to PQ-277); redcrescent.uz; IFRC Uzbekistan
2026 country plan; yuz.uz 2021; gov.uz eco 100889 and 224703; Wikipedia:Copyrights; Wikipedia:Translation; uz.wikipedia.org footer;
MIT Admissions; stat.uz; soliq.uz (redirect); infoedu.uz (olympiad stages, secondary).
