# C13 fact check (2026-10-07)

C13 is the parent-task catalog: 17 parent tasks in `C13-1.json` and 8 parent question tasks in `C13-2.json`. All 25 are `draft`. This
check covered every record that states a date, a fee, a requirement, a registration step or a research finding, and every cited URL.
Pages were downloaded and read as text. PDFs were read with PyMuPDF. The CDC page refuses scripted downloads (HTTP 403), so it was read
through a fetcher and confirmed by a second, independent search. Every fact entry now has a `url` and `verified_at: "2026-10-07"`. A
changed entry also has a `note` that says what changed and why.

## Counts

| | Count |
|---|---:|
| Records read | 25 (17 + 8) |
| Records with a sourced claim (`facts` or `basis`) | 12 |
| Records with no external claim (product rules, conversations, own question bank) | 13 |
| Fact entries before / after | 23 / 27 (4 added to record what the check found) |
| Basis entries (research) | 6, covering 2 distinct claims, both confirmed |
| Distinct URLs opened and read | 23 (18 cited before the check, 5 new). 5 more gave nothing: two British Council Uzbekistan pages timed out, two ielts.org centre pages returned 404, and the ielts.org booking page states no fee |
| Fact entries confirmed as written | 15 |
| Fact entries corrected (wording, scope or URL) | 8 |
| Records corrected | 5 (`C13-sleepd`, `C13-passpt`, `C13-testbg`, `C13-regpay`, `C13-appfee`) |
| Records whose parent-facing text changed | 3 (`C13-testbg`, `C13-regpay`, `C13-appfee`) |
| Unsupported statements removed from parent-facing text | 2 (IELTS fee "shown when you book"; the SAT base fee dated "through June 2027") |
| Still unverified (`needs_verification: true`) | 2 fact entries, both in `C13-passpt` and neither used in the text |
| uz/ru/en strings checked | 233 triples. 1 English drift fixed. 0 apostrophe errors |

## Checked and confirmed

| Claim (records) | Source opened | Result |
|---|---|---|
| Hill & Tyson (2009): a meta-analysis of more than 50 studies; academic socialisation had the strongest positive link to middle-school achievement; homework help had a negative one (`wkchat`, `future`, `strtgy`, `roadmp`, `unival`) | Harvard GSE, *The Parental Involvement Puzzle* | Confirmed. The page says "more than 50 studies" and that homework help "actually had a negative impact". |
| Dunlosky et al. (2013): practice testing and distributed practice rated highest; rereading and highlighting low (`strtgy`) | APS news release | Confirmed |
| CDC sleep: 6-12 years 9-12 h; 13-17 years 8-10 h (`sleepd`) | cdc.gov *About Sleep* | Figures confirmed. Attribution corrected (below). |
| SAT test day: charged device with Bluebook and exam setup done, admission ticket (printed preferred), physical photo ID, pencils or pens, College Board login, calculator if used (`exmday`) | CB *What to Bring on SAT Test Day* | Confirmed |
| SAT ID: physical, original, full legal name exactly as on the ticket; testing in another country needs a valid passport; country rules exist for Ghana, Hong Kong, Nepal, Nigeria, India, Jordan/Korea/Thailand/UAE/Vietnam and Pakistan, none for Uzbekistan (`exmday`, `passpt`, `regpay`) | CB *SAT ID Requirements* | Confirmed |
| IELTS: bring the same ID used at booking; wrong or forgotten ID means no test (`exmday`, `passpt`) | ielts.org *On test day* | Confirmed (quoted sentence matches) |
| IDP: passport or national ID used at registration, checked again at Speaking (`exmday`) | ielts.idp.com *What to bring* | Confirmed |
| Only the biometric travel passport for leaving Uzbekistan since 1 Jan 2021, under PF-5156 of 16 Aug 2017 (`passpt`) | kun.uz, 17 Dec 2020 | Confirmed |
| my.gov.uz service 418: apply online, then visit in person for fingerprints and photo; 10 working days, up to one month for ages 16-25 in special cases (`passpt`) | my.gov.uz/uz/service/418 | Confirmed. The page also shows a state duty of 396,000 so'm (0.9 BHM); the text states no amount. |
| A parent or legal representative files for a child; the child must be present for biometrics (`passpt`) | kun.uz, 17 Feb 2026 | Confirmed |
| CSS Profile: $25 for the first institution, $16 for each additional (`findoc`) | CSS Profile help centre | Confirmed |
| SAT fee waivers outside the US only for eligible US citizens (`testbg`) | CB help centre | Confirmed |
| SAT payment: AmEx, Discover, JCB, MasterCard, UnionPay, Visa, PayPal (not in Ghana) (`regpay`) | CB *Payment Methods* | Confirmed |
| DTM 2026-2027 admission: 206,000 so'm (0.5 BHM); the six exempt groups (`testbg`) | my.uzbmb.uz/service/42 | Confirmed. The exempt group is "joriy yil bitiruvchilari" (current-year graduates). |
| Common App: fees per college on its College Information page; fee waiver in Profile (answer Yes, sign); counselor asked to confirm (`appfee`) | Common App PDF (© 2023) | Confirmed, and re-checked against the 2026-2027 *What's new* deck: still in Profile, counselor still completes a form. |

## Corrected

- **`C13-testbg`, SAT fee date.** The text said "$68 plus a $43 international fee (College Board fees through June 2027)". On the international
  fees page, "Fees Through June 2027" is the `<caption>` of the *additional*-fees table only. The $68 + $43 sentence above it has no end date.
  The text now says "College Board prices as of October 2026" in en, uz and ru, and the fact entry says where the caption belongs.
- **`C13-testbg`, DTM fee.** The BHM has risen to 440,000 so'm. my.gov.uz on 2026-10-07 lists 396,000 so'm as 0.9 BHM (service 418) and
  594,000 so'm as 1.35 BHM (service 891). So 206,000 so'm was 0.5 BHM at the old 412,000 so'm and cannot be shown as the fee for the
  next cycle. The line now reads "for the 2026-2027 admission the fee was 206,000 so'm (0.5 BHM at the BHM of that time)" and tells the
  parent to check the fee and the rule on my.uzbmb.uz. The English said "current-year *school* graduates", but the source and the uz/ru
  say "current-year graduates", so the English was fixed. A fact entry records the BHM evidence. Secondary sources (buxgalter.uz) date the
  rise to 1 September 2026. That date is not used.
- **`C13-testbg`, IELTS fee.** The earlier entry had no URL and was flagged. IDP Uzbekistan says to see each test centre's page "for
  updated fees and pricing". The text said the fee is "shown when you book", and no source opened here says that. It now says "the
  fee depends on the test centre; check the centre's current price before booking". The flag was cleared and the record's
  `needs_verification` is now `false`. The British Council Uzbekistan booking page still did not respond.
- **`C13-testbg`, other entries.** The late-fee URL moved from the US test-fees page to the international fees page. Both say $38, and the
  international page says additional fees are the same everywhere. The Milliy sertifikat source moved from the 2 Dec 2024 announcement
  to UzBMB's 26 Aug 2026 announcement, which also says registration is online on my.gov.uz. The same change was made to the matching
  entry in `C13-regpay`. Two entries were added: the $24 test-centre
  fee, whose August 2026-June 2027 list has no centre in Uzbekistan, and the current Milliy sertifikat fee on my.gov.uz service 891
  (594,000 so'm, 1.35 BHM). The parents' text still states no amount for the Milliy sertifikat.
- **`C13-regpay`, name check.** "Check that the name is spelt exactly as in the passport" became "exactly as on the ID document your
  child will bring on test day (passport or ID card)" in all three languages, and the field label changed to match. The SAT rule ties
  the name to the ID shown at the door, and that ID can be a national ID card. IELTS ties it to the ID used at booking.
- **`C13-appfee`, 2026-2027 waiver rule.** The *What's new 2026-2027* deck says each college that charges a fee now shows whether it accepts
  the Common App fee waiver from all students, from US students only or from no students. This matters for applicants from Uzbekistan,
  so one sentence was added in en, uz and ru, with a new fact entry. The 2023 PDF entry now has a note saying it was re-checked.
- **`C13-sleepd`, attribution.** The entry credited the child and teen ranges to "the American Academy of Sleep Medicine and the Sleep Research
  Society". The CDC table cites the AASM paediatric consensus statement (Paruthi et al. 2016), and the SRS co-wrote only the adult
  statement. Only the entry changed. The parents' text was already right.
- **`C13-passpt`, flagged entries.** These were re-read from the page text, not a summary. They are narrowed but still flagged (see the next section).

## Still unverified

Both are in `C13-passpt`. The record keeps `needs_verification: true`. Neither statement appears in the text parents see.

1. **Notarised consent for a minor's travel passport.** my.gov.uz service 418 lists two documents "for minors": the parents' or guardians'
   notarised consent and a notarised undertaking from the person accompanying the child. The page does not say when they apply.
   Kun.uz (17 Feb 2026, a secondary source) says the other parent's consent is needed only in some cases. An official source for that
   scope is still needed.
2. **Uzbek national ID card for the SAT in Uzbekistan.** In general the SAT accepts a "government-issued military or national
   identification card", and it has no rule specific to Uzbekistan. The checklist also requires "clearly legible English language
   text". Whether the Uzbek ID card meets that was not checked. The text only says a passport is needed when testing in another country.

## Language check

- All 233 uz strings were scanned. There is no ASCII apostrophe, U+2018, U+2019 or backtick. All 325 oʻ/gʻ marks are U+02BB, and every one
  follows o or g. The 31 tutuq marks (maʼlumot, taʼlim, baʼzi, sunʼiy, eʼtibor and so on) are U+02BC.
- Every uz/ru/en triple that states a fact was compared clause by clause. The only drift was the English "school graduates" in the DTM
  line, which is now fixed. The new and changed uz and ru sentences follow the same rules.

## Not fact-checked here (out of scope)

`C13-2.json` makes no external claims. Its statements are product rules: consent under 14, the 7-day fallback, "never sent to the AI", and
the bank ids and values. Their engineering notes point to code (`commit.ts`, `score.ts`, `flags.ts`). These belong to the integrator's
review, not this check. One open blocker is in `C13-qcontc`: `applyParentFlow` rejects `m0_parent_contact`.

## Re-check each cycle

SAT fees (the table caption runs to June 2027), the DTM fee and exempt groups (a new my.uzbmb.uz service each admission year), the BHM,
the Milliy sertifikat fee, the CSS Profile fees, and the Common App fee-waiver policy (the 2023 PDF is still hosted, but each season's
changes come in the *What's new* deck).
