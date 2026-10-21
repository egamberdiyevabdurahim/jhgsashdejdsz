# C9 fact check (olympiads and competitions), 2026-10-07

Scope: `C9-1.json` (20 records) and `C9-2.json` (13 records). The checker opened every cited URL and read the dated, eligibility,
registration, fee and step claims against it. Where a cited source was secondary, the checker looked for an official one. Every
`source` and `facts[]` entry now has `verified_at: "2026-10-07"`. All 44 cited URLs returned HTTP 200 on 7 Oct 2026.

## Counts

| | Count |
|---|---:|
| Records checked | 33 of 33 |
| Records confirmed as written | 15 |
| Records corrected | 18 |
| Windows | 96 before, 98 after; 38 `needs_verification: true` before and after (IChO next cleared, team round 1 flagged); 13 on a secondary source |
| Facts | 84 before, 100 after (10 secondary) |
| Facts added | 18 (2 of them replace Kangaroo's 2019 facts) |
| Facts reworded | 7, and 1 metadata-only (`published` date) |
| Facts removed | 2 (Kangaroo 2019, replaced) |
| Claims removed or replaced | 4 groups (below) |
| Invented content found | none |
| Records still `needs_verification: true` | 29 (was 30; IChO cleared) |
| Cited URLs | 44, all opened, all HTTP 200 |

## Primary source for the Uzbek records

The Cabinet of Ministers Resolution No. 562 of 9 Sep 2021, Annex 1 (the regulation on subject olympiads), was read on lex.uz in the
revision of 19 Dec 2025. Appendix 2 was last changed by CM Resolution No. 797 of 17 Dec 2025. These claims match its text: arts. 30-46,
46-1 to 46-3 (engineering olympiad, added by No. 578 of 13 Sep 2025), 51-55 (online olympiad), 57-63 (team selection), 70-71 (diploma
benefit), and Appendices 1 (subjects by grade) and 2 (list of international olympiads, by category).

## Confirmed as written (15)

- C9-uzmath, uzphys, uzchem, uzbiol, uzinfo, uznatv, uzengl, uzhist, uzgeog, uzlang and uzlawb. Stages and months, group I and group II,
  round-3 places (18/15/12/12/12), the art. 70 and 71 diploma benefits, and Appendix 1. The three Ta'lim xabarlari reports also match their
  sources: registration until 10 Oct 2026; regional group I tests ended 28 Nov 2025; republic stage on 23-26 Mar 2026 with written and lab
  rounds.
- C9-uzengr: arts. 46-1 and 46-3 match.
- C9-intibo: IBO 2027 in Warsaw, 18-25 Jul 2027; 2028 in the Netherlands, 16-24 Jul; 2029 in Brno (ibo-info.org).
- C9-intioi: IOI 2026 in Uzbekistan. IOI 2027 in Potsdam, 12-19 Sep 2027 (Uni Potsdam / HPI, 15 Sep 2026).
- C9-intgeo: ages 16-19; iGeo 2026 in Istanbul; iGeo 2027 in Jelgava, 2-9 Aug (geoolympiad.org).

These records were also confirmed in the parts that were not changed: IMO (2027 Budapest 16-26 Jul, 2028 KAUST 7-18 Jul, team of up to 6,
Regulations 2.1-2.2), IPhO 2026 (Bucaramanga, 4-12 Jul, up to 5 students), IZhO (22nd, 10-14 Jan 2026, 3+2+2, up to 4 foreign teams,
registration through ministries only), KhIMIO (4th, 1-7 Jun 2026), EGMO (up to 4 per country, 2027 Šibenik 11-17 Apr), IOL 2027
(Bangkok, 21-28 Jul), IJSO (under 16 on 31 Dec, 2026 in Sofia), HSE 2026/27 dates, John Locke 2026 dates and Breakthrough 2026 dates and age rule.

## Corrected (18)

| Record | What was wrong or missing | Now |
|---|---|---|
| C9-khimio, C9-izhokz, C9-uzregi, C9-intjso, C9-integm | `how_to_register` said "the regulation does not say how Uzbekistan's team is chosen". Art. 68 does say it for **regional** international olympiads, and all five are regional (Appendix 2). | Each text cites art. 68: the team comes from the national selection results or from an additional selection by the Ministry. A fact on art. 68 is added to each record and to C9-uzteam. iGeo, IOAA and IOL keep the old wording, because they are not regional and art. 68 does not cover them. |
| C9-intcho | IChO 2027 rested on a secondary source (pw.live), which gave Taipei as the city. | The official IChO Steering Committee site (ichosc.org) gives **19-28 Jul 2027, Chinese Taipei**, and 2028 in Messina. No city is given officially, so "Taipei" was dropped. The window and the record are now `needs_verification: false` and `verify_task` is removed. |
| C9-kangar | The next window rested on a 2019 secondary report (inha.uz). | The official olympia.uz page (`/uz/competition/1`) gives the 2026 edition: 25 Mar 2026; registration to 31 Jan, extended to 10 Feb; fee 120,000-150,000 UZS; questions and time per grade; results within a month. The windows are now `last` (2026-03-25), `last_registration` (2026-02-10) and `next` (2027, March, unverified). The 2019 fact is replaced. The note now also says what the page says: every participant gets a certificate and gift, and medals are possible. Before, it said only "no winners or losers" (from the FAQ). |
| C9-msulom | The note said the 2026/27 rules on foreign citizens, grades and the final venue were not published. They are published. | Polozhenie 1.8: foreign citizens may take part, including students abroad. Polozhenie 2.4: regional final venues may be abroad. 2026/27 Reglament: the qualifying stage is online in one 24-hour session; results by 25 Dec and winners by 30 Dec; the final is in person; age groups are set for each profile. News of 23 Sep 2026: registration opens in the second half of October. The note, steps and verify task are rewritten, and 3 facts are added. Age groups and venues are still unpublished. |
| C9-uzonln | The sign-up link went only to olympiad.uzedu.uz. | That site's "Ishtirok etish" button leads to **oo.uzedu.uz**. The steps, the verify task and `link_hosts` now say so. A fact is added: the page, which is undated, says the olympiad runs every quarter in 5 subjects. |
| C9-uzmain | The steps left out two conditions. | Added: up to 3 school-stage winners per subject and grade go on (art. 33), and the school director must send an application on the platform (Ta'lim xabarlari, 5 Oct 2026). |
| C9-uzteam | The round-1 window said November with no flag. In 2025/26, the round-1 final results came out on 16 Dec 2025. | The round-1 window is now `needs_verification: true`, with a note. The round 2-3 window has a note: the 2025/26 physics round-2 results came out on 18 Feb 2026, with 16 selected where the regulation says 15. Two secondary facts are added. |
| C9-intoaa | The text said the 19th IOAA "runs" from 25 Sep to 5 Oct 2026. It has ended. | The text is in the past tense and window key `current` is now `last`. |
| C9-intiol | — | Added: ioling.org lists Uzbekistan's last IOL as 2019. The verify task is narrowed to match. |
| C9-intjso | — | Added: Uzbekistan's team won 1 silver and 3 bronze at IJSO 2025 (23 Nov-2 Dec 2025), from the Ministry's olympiad.uzedu.uz. The window note says the 2026 dates are not on ijsoweb.org. |
| C9-hseprb | The note said "all 2025/26 final venues were in Russia". The list includes Simferopol (Crimea). | It now says what matters for the reader: no 2025/26 final venue was in Uzbekistan or elsewhere in Central Asia. The registration window notes that the dates block says 22 Sep and a 17 Sep news item said 21 Sep. |
| C9-jlocke | The `en` note did not say the essay must be in English, though `uz` and `ru` did. | The `en` note says "English-language" (the FAQ confirms English only). Added: registration opened 2 Feb 2026, and late registration cost $10 until 30 Apr. |
| C9-brkjun | The steps left out a requirement. | Added: an entry is complete only after you score at least 5 other entries in peer review (by 30 Sep in 2026). |
| C9-intimo | The `uz` age rule said "born after 1 July", where `ru` and `en` say "on or after". | It now says "1-iyulida yoki undan keyin". |
| C9-intpho | Metadata only. | The Arab News source is dated 2026-07-13 (`published`). |

## Removed or replaced

1. pw.live as the source for IChO 2027, and the city "Taipei" (not in any official source).
2. inha.uz (2019) as the Kangaroo source and fact, replaced by the 2026 official page.
3. Five "the regulation does not say" statements, which were wrong for regional olympiads (art. 68).
4. The MSU statement that the rules were "not yet published", which was out of date.

## Still unverified (`needs_verification: true`)

- **District-stage registration deadline, 10 Oct 2026** (12 Uzbek records): only Ta'lim xabarlari reports it. olimpiada.uzedu.uz is a
  login app with no public deadline page.
- **Republic-stage month 2026/27** (12 Uzbek records): the regulation says April-May, but in 2025/26 the natural-science stage was in March.
- **Team selection rounds 1-3** (C9-uzteam): the regulation says November for round 1. In 2025/26 the results came out in December. Rounds 2-3
  have no month in the regulation.
- **Engineering olympiad 2026/27** (C9-uzengr): the August 2026 announcement was not found.
- **Next online olympiad date** (C9-uzonln); **KhIMIO 2027**, **IZhO 2027**, **Al-Farghani / Biruni / Avicenna next editions** (no dates
  published).
- **IPhO 2027**: Saudi Arabia is the host, but the only source is secondary (Arab News, 13 Jul 2026). ipho-new.org does not list it yet, and no dates are known.
- **IOAA 2027** host; **IJSO 2026** dates (Sofia confirmed; dates not on ijsoweb.org).
- **How Uzbekistan's team is chosen** for iGeo, IOAA and IOL. These are not regional olympiads, so art. 68 does not apply.
- **Kangaroo 2027, HSE 2027/28, John Locke 2027, Breakthrough 2027**: the months are inferred from the 2026 pattern.
- **MSU Lomonosov**: age groups per profile and the 2026/27 final-stage venues are not published yet.

## Languages and Uzbek orthography

- Every `uz` / `ru` / `en` triple was compared for numbers and dates. The differences left are spelled-out numerals and ordinals ("round 1"
  / "birinchi bosqich", "three" / "3 nafargacha"). The meaning is the same in all three. One real mismatch was fixed (John Locke `en`).
- In every `uz` string, oʻ/gʻ use U+02BB (447 marks before the edits) and the tutuq belgisi uses U+02BC. There is no ASCII apostrophe,
  U+2018, U+2019 or backtick. No word was found missing its okina. New `uz` text follows the same rule.
