# C16 fact check (pathway options), 2026-10-07

Scope: `C16-1.json`, 10 `pathway_option` records (UK foundation year, Cambridge A Levels, IB Diploma, AP route, Germany
Studienkolleg, first year at home, Italy foundation course, Türkiye preparatory year, Korea language year, Japan MEXT). Each
record carries dates, deadlines, entry requirements, fees and registration steps, with `facts[]` and per-window `source` objects.

Every cited URL was opened on 7 Oct 2026. Where a site blocks scripted fetches it was **not** bypassed (no bot-check solving); the
fact stays secondary and is listed under "Still unverified". All 289 en/uz/ru triples were read side by side.

## Counts

| | Count |
|---|---:|
| Records checked | 10 of 10 |
| Source URLs opened | 45 cited + 7 found while checking (UCAS deadline, UCAS course data, Cambridge private-candidate registration, NUS test PDF, Türkiye Scholarships programmes page, 2027 GKS-U guideline PDF, Khalifa 2026-27 catalogue) |
| Facts before / after | 69 / 73 (4 added) |
| Facts confirmed as written | 55 of the original 69 |
| Facts corrected | 12 |
| Facts still secondary only | 2 of the original (IB, JoongAng Daily) + 1 added (UCAS data via The Uni Guide) |
| Invented content removed | 1: the Edinburgh "last cycle" closing date (14 Jan 2026), seen only in a search summary; replaced by the next deadline |
| Dated windows | 27: 15 verified (`needs_verification: false`), 12 still `true` (6 of them have no single date by design: set by each school, centre or university) |
| Student-facing triples changed | 23 (20 in all three languages for a fact correction, 3 Uzbek-only translation fixes) |
| Uzbek strings scanned | 289: 702 × U+02BB (oʻ/gʻ), 46 × U+02BC (tutuq), 0 ASCII/curly apostrophes or backticks |

Every fact now has `verified_at: "2026-10-07"` and `check: confirmed | corrected | secondary`, plus a `note` where something changed.
Every record has `factcheck: {verified_at, note}`. `version` and `status: draft` are unchanged (counselor review is still LG1).
Only `C16-ap` moved to `needs_verification: false`; the other 9 keep `true` for the reasons below.

## Corrections

| Record | What was wrong | Now | Source |
|---|---|---|---|
| ukfdn | Edinburgh IFP window was last cycle's closing date (14 Jan 2026), read only from a search summary | Next deadline: apply through UCAS by **13 Jan 2027** (2027/28 entry, start 13 Sep 2027). Still `needs_verification` because the date comes from UCAS course data on The Uni Guide; UCAS's own 2027-entry deadline (13 Jan 2027, 18:00 UK) is primary | ucas.com events page; theuniguide.co.uk |
| ukfdn | Wolverhampton fee labelled "2026/27" | The page prints no year; £17,600 sits next to the Jan/May/Sep **2027** starts. Added "subject to regulatory approval" and that the page is run with Malvern International. `cost.range.year` set to `null` (the two examples are from different years) | isc.wlv.ac.uk/?p=32381 |
| ukfdn | Birmingham Foundation Pathways "delivered with Kaplan" | Kaplan handles admissions; enrolment is a one-year or a four-year programme | birmingham.ac.uk |
| alevel | Step 3 told students to filter "Find a Cambridge school" for centres that accept private candidates; no such filter is described | Use «Find a centre» on the "How to register as a private candidate" page, then ask each centre. Added: some syllabuses are closed to private candidates | cambridgeinternational.org |
| alevel, ibdp, ap | Khalifa University cited from the 2025-26 catalogue | 2026-27 catalogue. The British route is now **3** AS/A subjects (was 4); AP and IB rules unchanged | ku-ae.smartcatalogiq.com |
| ibdp | "Open to students aged 16 to 19" | "Designed for students aged 16 to 19" (the IB's wording is an age range, not an eligibility rule) | ibo.org via search |
| ap | Oxford and NUS AP rules were "reported" from secondary sources | Read on the universities' own pages. Oxford: 4 APs at 5, or 3 at 5 + SAT 1480 / ACT 33 (A*A*A courses); its page lists the Uzbek Attestat as "Not accepted". NUS (PDF, Dec 2025): 5 APs, or SAT/ACT + 3 APs, **score 3 in each**, **Calculus BC compulsory** except Law, ACT Writing 8 | ox.ac.uk; nus.edu.sg PDF |
| stkol | Munich: "B2 or higher, for example an intensive-course certificate" | Proof of a **completed intensive course** (20 h/week) at B2+, no more than 12 months before the deadline, at a Goethe-certified school if abroad; an enrolment confirmation is not enough. Step 2 and its field label changed to "B2 proof" | lmu.de Studienkolleg guide |
| trprep | Türkiye Scholarships: 70%, "90% for medicine", source an old London embassy notice (still pointing to the retired .org site) | Official programmes page: 70% for bachelor's, 90% for **medicine, dentistry and pharmacy**, and applicants must be **under 21** (requirement and step 4) | turkiyeburslari.gov.tr/scholarshipsprograms |
| trprep | Boğaziçi SAT "for example 1300" | Per-programme minimums: 1300 most, 1350 + Math 700 engineering, 1300 + Math 700 sciences, 1200 education | intl.bogazici.edu.tr |
| krprep | Built on a third-party copy of the **2026** GKS guideline: "TOPIK 3+ adds 10% of the points"; "scholarship cancelled if you cannot enrol"; age line 2001 | Official **2027** guideline (attached to the MOFA notice): TOPIK bonus **3% / 4% / 5%** for level 3 / 4 / 5+; the 2027 text says only that a scholar who misses a department's level cannot enter that programme; under 25, born after 1 Mar 2002; grade rule gains the CGPA option (3.23/5.0 or 2.64/4.0). Uzbekistan quota still 3 (1+1+1). Application window 15-30 Sep 2026 KST confirmed as set by NIIED for all embassies, so both Korea windows are now verified | mofa.go.kr (Kenya notice + 2027 PDF) |
| mext | Monthly stipend "242,000 yen" | **117,000 yen** (242,000 is the Young Leaders Program column of the JASSO table); the 2027 guideline confirms 117,000 + 2,000-3,000 in some regions | studyinjapan.go.jp page and 2027 guideline |

Uzbek-only translation fixes (meaning, not marks):

- `C16-mext` age: "2-apreldan keyin" (after) → "2-aprelda yoki undan keyin" (on or after), as in en/ru.
- `C16-itfdn` who_needs_it and gate rule: "oʻrta maxsus" (secondary specialised, the Uzbek college level) mistranslated MUR's
  post-secondary non-university qualification. Now "maktabdan keyingi … rasmiy malaka" / "universitet boʻlmagan oliy muassasada
  olingan".

## Confirmed as written (selection)

Birmingham, Aberdeen, Edinburgh and Cambridge pages on the Uzbek certificate; Edinburgh IFP English (IELTS for UKVI 5.5 / PTE 54),
recency, fee £29,600 (2026/27) and "2027/28 opens in autumn 2026"; Wolverhampton start dates, IELTS and age rule; Cambridge 9709
syllabus (June/November, 180/360 GLH, private candidates allowed); AP 2027 dates 3-7 and 10-14 May, $129 outside the US, 13 Nov 2026
ordering deadline, 12 Mar late-fee waiver; anabin UZB-BV10 (read from the anabin public API record of the certificate: FSP route,
FZG after 1 year at a state or state-recognised university); TUM; DAAD (via WebFetch; daad.de returns 403 to curl); uni-assist
Studienkolleg and Uzbekistan pages; MUR circular and Annex 1 (11-year rule, foundation course, B1, visa 30 Nov 2026 / 31 Oct 2027,
Universitaly only and free); Politecnico 12-year rule (2025/26 brochure); Türkiye Scholarships calendar and TÖMER year; İTÜ
directive article 12; Boğaziçi English and €100 fee; Study in Korea institute fees and TOPIK 3; MEXT 2027 eligibility, period,
exams, age, results and arrival dates.

## Still unverified

| Record | Item | Why |
|---|---|---|
| ukfdn | Edinburgh IFP deadline 13 Jan 2027 | Only in UCAS course data on a third-party site; ucas.com course pages return 403, and the university's IFP pages do not print it |
| ukfdn | "Opens in autumn" read as months 9-11 | Our reading of "autumn 2026" |
| alevel | Entry deadline and fee for a series | Set by each centre; no centre in Uzbekistan was contacted |
| ibdp | 16-19 age range, authorised schools, May/November sessions | ibo.org returns 403 or a bot-check page; read from ibo.org text in two web searches |
| ibdp | School intake dates and fees | Set by each IB school |
| stkol | Other Studienkollegs' deadlines | Each sets its own; only Munich was read |
| uni1y | Uzbek admission dates; German application window | Come from catalog C11 and from each target university |
| itfdn | Foundation start dates, deadlines, fees | In each university's call (bando); none was chosen |
| trprep | 2027 Türkiye Scholarships dates | The calendar page gives the yearly pattern without a year |
| krprep | Uzbekistan embassy's own GKS notice; "next round in September 2027" | Notice not read; the next round is a projection |
| mext | Embassy of Japan in Uzbekistan: deadline, exam date, quota, treatment of the 11-year certificate | emb-japan.go.jp sites (Uzbekistan, UAE) return 403; other embassies' spring 2026 deadlines were seen only in search results |

## Noticed, not added (for the counselor review)

- Studienkolleg München exmatriculates students who fail a semester twice, and the page says they then cannot attend another
  Studienkolleg or study at a German university.
- uni-assist: Brandenburg and North Rhine-Westphalia generally have no state Studienkollegs.
- Uzbekistan is not on Cambridge's list of British Council offices that take private candidates (recorded in `C16-alevel` fact 9,
  not in student text).
- The Edinburgh IFP is applied for through UCAS (code IFP5 for the sciences pathway); step 5 already says "direct or through UCAS".
