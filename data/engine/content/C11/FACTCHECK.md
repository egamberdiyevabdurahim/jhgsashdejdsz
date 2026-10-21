# C11 fact check (2026-10-07)

This check covers the admin and registration catalog `C11-1.json` to `C11-4.json`: 44 templates for test registrations,
the Uzbek state application, private-university entrance routes in Tashkent, documents, applications abroad and visas.
Every cited URL that answered was opened on 2026-10-07. PDFs were read as text with PyMuPDF. Pages a summarising fetcher
could not render were read raw: the Duolingo help centre through its article API, and the Duolingo price from the page source.
Every changed record carries `verified_at: "2026-10-07"`. The pre-check files are kept outside the repo.

## Totals

| | Count |
|---|---:|
| Templates checked | 44 |
| Fact objects checked | 144 (140 before the check, 4 added) |
| Date windows / SAT sittings / Milliy sertifikat sessions | 42 / 6 / 3 |
| Distinct URLs opened | about 88 (5 did not answer: see below) |
| Templates corrected | 17 |
| Unsupported claims removed or replaced | 5 |
| Facts confirmed on 7 Oct with `needs_verification: false` | 104 |
| Still `needs_verification: true` | 40 facts, 15 windows, 1 sitting, 3 sessions, in 35 templates |
| Templates now fully verified | 9 (2 more than before: `C11-det`, `C11-uzreg`) |
| uz strings with a wrong apostrophe | 1, fixed. No ASCII `'` or U+2018/U+2019 in any uz string |

## Corrected

**Milliy sertifikat (`C11-msreg`).** Source: InfoEdu.uz, 27 Aug 2026 (updated 22 Sep), which copies the Agency's schedule.
- The December session note said that law registration *closes* on 17 Nov. The source says *Huquqshunoslikda 17-noyabrdan*,
  so law registration **opens** early, on 17 Nov. The note was fixed in all three languages.
- The November session (biology, chemistry, maths, physics) had no start date. Registration runs **16-30 Oct**, so
  `registration_from: "2026-10-16"` was added. The window opens 9 days after this check.

**Duolingo English Test (`C11-det`).** Sources: the help-centre articles *Test Policies, Rules, and Requirements* (updated
1 Oct 2026), *Using your phone to record your computer*, *Accepted Identification* (22 Sep 2026), *How do I send my results*.
- A smartphone is now required. Its camera films the keyboard and screen during the test, which runs in the DET desktop
  app. Step 2 and the `requirements` fact now say so.
- For Uzbekistan, the accepted-ID table lists **the passport only**. Step 2 used to say "your ID (a passport is safest)". A new
  fact, `id_uzbekistan`, was added.
- "Unlimited institutions, free" is not on any Duolingo page. Up to 40 institutions can be selected, and more only on
  request. Step 3 no longer says "Sending is free".
- The $70 price, results in 2 days and two-year validity were confirmed. The template is now fully verified.

**IELTS (`C11-ieltsbook`).** British Council Uzbekistan raised its fees in early September 2026. The `bc_fee` fact changed:
Academic or General Training went from UZS 2,664,000 to **2,798,000**, and UKVI from 2,980,000 to **3,119,000**. Source:
Anhor.uz (4 Sep) and Zamin.uz (3 Sep), both reading the BC booking page. The BC page timed out again, so the flag stays.
The `id_doc` fact is now filled in: BC accepts a passport or the national ID card. IDP was not checked.

**TOEFL iBT (`C11-toefl`).** The deadline source was a Taiwan test-centre notice. It is now ETS's own advising page: regular
registration closes 7 days before the test, and late registration closes 2 days before for US$40. ETS's fees page
disagrees on two amounts. It lists "express registration (within 7 days)" at US$49, and extra score reports at US$29, not
US$25. Both conflicts are flagged (`reg_deadlines`, new `extra_report_fee`). Step 2 no longer gives a dollar amount.

**SAT 1200+ state-grant route (`C11-satuzgrant`).** Step 3 told students to "choose up to 5 programmes" during the June
registration. CM Resolution No. 578 cl. 10 puts the choice of university, programme, form and priority in **stage 2**,
within 15 days after the tests. Stage 1 covers only the subject set, the language and the test region. The step now says so.

**State application (`C11-uzreg`, `C11-uzresult`, `C11-uzappeal`, `C11-uztest`).** Clauses were read on lex.uz.
- cl. 10 settles the open `stage1_programmes` question, as above. `C11-uzreg` is now fully verified, and its verify task was
  removed.
- cl. 38: results come out the day after the test, and final results within a week after stage 2. `next_day` is confirmed.
- cl. 30, with the 24-hour appeal and the 3-day review, belongs to the professional (creative) exams, not the Agency's test.
  The `regulation` fact was rewritten. The 2026 appeal window (15-24 Aug) and the `who_how` procedure were confirmed.
- cl. 27, the banned-items list, is in chapter 4 (professional and creative exams). It had been cited for the state test.
  The fact was rewritten and flagged. The Agency's own test rules sit in a separate 2018 regulation (cl. 37), which was
  not found.

**SAT test day (`C11-satday`).** Device lending has to be requested **at least 30 days** before test day (CB device page). The
fact and the verify task now say so. Whether lending applies at centres in Uzbekistan is still unknown.

**Passport (`C11-passport`).** The claim "valid for 10 years" is wrong for this audience. A passport for travel abroad is valid
for 2 years under age 1, **5 years from 1 to 25** and 10 years from 25 (advice.uz, based on PQ-4079). The `procedure` fact is now
filled in. You apply at a migration office, a public services centre or on my.gov.uz. The fee is 1 BHM from age 16 and 80 % of
it under 16. The passport is issued within 10 working days. Step 2 was rewritten in all three languages.

**US visa (`C11-visaus`).** The $250 visa integrity fee was missing. It is paid when the visa is issued, and some posts had
started collecting it by May 2026 (Boston University ISSO). The new fact is flagged as secondary, and the parent note mentions
it as a fee that "may also be charged".

**Smaller fixes.**
- Millat Umidi (`C11-pumillat`): its official pages still answer 404. An aggregator (Mentalaba.uz) now gives an online test
  and a 20 May-30 Sep period. Its listing conflicts with "every Wednesday on campus", so the `exam` fact and the `rolling`
  window are flagged, and the verify task now asks about the exam format.
- KIUT: the 16.9-29.7 million fee range is full-time; evening study starts at 12.8 million.
- WIUT: TOEFL 78 needs writing 17 and a test-centre sitting.
- Brown's ISFAA rule now cites its first-year international page.
- One uz label read `Clearingʻga`, with U+02BB, which turns the "g" into the letter gʻ. It is now `Clearingʼga`, with U+02BC.

## Checked and confirmed (unchanged)

- **SAT.** CB dates page and international calendar PDF. All five 2026-27 dates match, with deadlines, late deadlines and
  score dates (7 Nov / 23 Oct / 27 Oct / 20 Nov ... 5 Jun / 21 May / 25 May / 21 Jun). The Tashkent deadline times are right
  for US daylight and standard time. Fees: $68 + $43, $24 centre fee, late $38, change $34, cancel $34 and $44, 4 free reports
  until day 9, then $15 each. Also confirmed: the under-13 consent rule, the ID rules (passport when travelling to another
  country), Bluebook setup 1-5 days before, and the 2025 Fergana/Namangan and 2023 NewUU centres.
- **SAT for the state grant.** UzA 24 Jun 2026: 1200+, Maths + Foreign language, 50 % of the admission parameter, ranked by
  SAT. Ta'lim xabarlari: 25 Jun deadline, entry at registration. Oliygoh: DI code 35787, about 10 or 4 business days, no
  screenshots.
- **IELTS.** The 10 IDP cities, results in 1-5 days, sharing rules, and the computer-only switch of 11 Jul 2025.
- **TOEFL.** The 1-6 scale from 21 Jan 2026 with two years of 0-120 scores, 4 free reports until 10 p.m. the day before, and
  scores in 3 days.
- **State test.** The `Baholash mezoni` PDF, Order 105 of 13 Mar 2026: 90 questions, 189 points. Also confirmed: cl. 10, 12,
  15, 42 and 45, the tests on 14-23 Jul in 64 centres, choices from 25 Jul to 8 Aug, minimums of 68.0 and 56.7 (17 Aug), ticket
  and ID rules, 1,452 grants for non-state universities, the 2025 grant registration from 29 Sep to 5 Oct, and Milliy
  sertifikat registration on my.gov.uz with regional caps (496,303 seats).
- **Private universities**, re-read: WIUT (deadlines of 15 Jul and 12 Aug, UZS 300,000, pass 50, 30 scholarships), Inha (all
  three rounds; round 2 exam 27-28 Jun, not 29), CAU (exams, exemptions, olympiad), TTPU (2026/27 regulations), MDIS, NewUU
  (30 Jan-19 Jun, 27 Jun, 13 Jul), BMU and Amity.
- **Documents.** Notary actions (gov.uz), apostille service (fee 20 % of BHM, 2 business days), the school-document authority
  (advice.uz), the HCCH entry, and the Common App transcript and recommender PDFs.
- **Abroad.** UCAS: £34.50, opens 12 May 2026, sending from 1 Sep, 15 Oct and 13 Jan at 18:00, 30 Jun, and the 350/4,000
  statement rules. CSS Profile: $25 and $16, start two weeks early. Common App deck: 1 Aug launch, rollover, fee-waiver
  display, Activities rename. Also confirmed: Dartmouth ISFAA, SEVIS $350, Uzbekistan not on Proclamation 10998, and UK
  £558, £776 IHS, £1,529 and £1,171, 28 days, TB test for Uzbekistan, 6-month certificate.

## Still unverified (`needs_verification: true`)

- **Not published yet (future cycles).** These are the 2027 and 2028 windows: state test results, choices, appeals and final
  lists, non-state grants 2026, WIUT, Inha, CAU, MDIS, NewUU, UCAS 2028, SAT 2027-28, and Milliy sertifikat 2027. The
  2027 subject list and the 2027 SAT-route deadline are also unpublished.
- **Official page unreachable on 7 Oct.**
  - Webster Tashkent: 504, and webster.uz does not resolve.
  - Millat Umidi: 404, with a conflicting aggregator.
  - British Council booking page: timed out.
  - travel.state.gov: 403, so the $185 visa fee comes from search results only.
- **Secondary source only.**
  - The DI code 35787, which no Agency page shows.
  - The Milliy sertifikat dates and the 594,000 soʻm fee, copied by news sites from the Agency's schedule image.
  - Certificate validity of 3 years (Oliygoh, 2025, no legal act cited).
  - Computer-only IELTS, which was announced as temporary.
  - The 2020 passport rule (Kun.uz).
  - The US social-media rule and the proclamation lists.
  - The visa integrity fee rollout.
- **Conflicting official sources.**
  - The TOEFL late fee ($40 or $49) and extra-report fee ($25 or $29).
  - The apostille authority for school certificates: the Ministry of Preschool and School Education (advice.uz) against
    the State Testing Center (HCCH, 2024).
  - Millat Umidi's English rule.
- **Not collected.**
  - The TOEFL fee for Uzbekistan, which ETS shows only after a location is picked.
  - IDP's ID rule.
  - The IELTS/TOEFL-to-CEFR table the Agency uses.
  - The state-test banned-items rule: the 2018 regulation was not found, and the web-search budget ran out before it was.
  - CAU's subject exams per programme, Amity's 11-year question and dates, BMU's SAT Math threshold, Webster's GPA
    conversion, and MDIS's 2025 EET fee.
  - Translation and notary fees, enrolment documents, how the Uzbek grading scale is converted, and CSS waivers for
    international students.
  - Student visas outside the US and UK (`C11-visaother`).
- **Design default.** The passport's "6 months after study end" trigger.

## uz/ru/en

- All 602 uz/ru/en triples were scanned. Every uz string uses U+02BB for oʻ/gʻ and U+02BC for the apostrophe. The one
  misuse found is fixed above.
- A digit-parity check across the three languages flags only formatting differences: "11:59 p.m." against 23:59, "five"
  against 5, and "year 1" against первый курс. No language states a different number.
- Every new or rewritten text was written in all three languages with the same numbers.
