# C7 fact check (2026-10-07)

C7 is the IELTS practice catalog: 81 items in `C7-1.json` to `C7-6.json` and 6 reading passages in `passages.json`.

- 15 Writing Task 1 items
- 12 Writing Task 2 items
- 12 Speaking Part 2 cue cards
- 42 Academic Reading items

Every item and passage is `draft`. This check covered every record that states a test-format rule, a date, a number or a URL. Each
cited page was opened and read on 2026-10-07.

## Counts

| | Count |
|---|---:|
| Records checked (81 items + 6 passages) | 87 |
| Distinct factual claims checked (9 test-format + 44 passage) | 53 |
| Fact entries checked (120 in items + 44 in passages) | 164 |
| Claims confirmed as written | 46 |
| Claims corrected (wording or URL) | 7 |
| Passage sentences corrected | 4, in 3 passages |
| Items changed to match a corrected passage | 2 |
| Items with a uz/ru translation fix | 5 |
| Claims removed as invented | 0 |
| Records left `needs_verification` | 0 |

Every fact entry now carries `verified_at: "2026-10-07"`, and so does every `source` object. A corrected entry also has a `note` that says
what changed and why. The 42 reading items keep `source: "own"`. Their facts come from their passage, and each key was re-read against
the corrected passage text.

## Test-format claims (39 writing and speaking items, 9 distinct claims)

| Claim | Source opened | Result |
|---|---|---|
| Task 1 shows graphs, charts or tables, or a diagram of an object, device, process or event; at least 150 words, about 20 minutes | ielts.org "Academic test format in detail" | **URL corrected** in 15 items. The cited writing page only says "a graph, table, chart or diagram". The exact wording is on the format-in-detail page. |
| Answers in full sentences, not notes or bullet points (27 items) | ielts.org Academic Writing format page | Confirmed |
| Task 1 band 5: "recounting of detail is mainly mechanical"; band 6: "a relevant overview is attempted"; band 7: "a clear overview… main trends or differences are identified" | IELTS Writing Band Descriptors PDF (updated May 2023) | Confirmed |
| Maps are a common Academic Task 1 task (IDP) | ielts.idp.com Vietnam article | Confirmed. The page says map description is "a common task in IELTS Writing Task 1". |
| Task 2 gives a point of view, argument or problem; at least 250 words, about 40 minutes | ielts.org Academic Writing format page | Confirmed |
| Task 2 counts twice as much as Task 1 | same page | Confirmed |
| Task 2 band 5: main parts "incompletely addressed", paragraphing "inadequate or missing"; band 6: a position "directly relevant to the prompt"; band 7: "a clear and developed position" | Band Descriptors PDF | Confirmed |
| Speaking Part 2: task card, 1 minute to prepare, up to 2 minutes, then one or two questions; 3-4 minutes in all | ielts.org format-in-detail page | Confirmed |
| Speaking Part 3: 4-5 minutes, issues linked to the Part 2 topic | same page | Confirmed |

The item timings agree with the same pages:

- Task 1 `time_s` 1200 (20 minutes).
- Task 2 2400 (40 minutes).
- Speaking 480, which is Part 2 (3-4 minutes) plus Part 3 (4-5 minutes).
- Reading 90 s per item, from 40 questions in 60 minutes.

The writing prompts use invented places and figures, and every prompt says so. The table and bar totals were re-added and match. The
overview each `why` describes matches its data, for example wind overtaking coal between 2015 and 2020 in `C7-w1ln07`.

## Passage claims (6 passages, 44 claims, English Wikipedia)

| Passage | Claims | Result |
|---|---:|---|
| `C7-P-rd1` History of the bicycle | 6 | All confirmed: Drais, 12 June 1817, 13 km in under an hour; 1816 crop failure; Michaux and Lallement; high-wheeler wrists; Rover 1885; Dunlop 1888. |
| `C7-P-rd2` Urban heat island | 6 | 5 confirmed. **Claim 1 reworded:** the article's lead no longer says "due to human activities". Its Definition section still attributes the warmth to land use, the built environment, materials, less greenery and heat from human activities, so the passage text is unchanged. |
| `C7-P-rd3` History of paper | 8 | 7 confirmed. **Claim 6 corrected:** the article says the human- or animal-powered mills in Baghdad (794-795) "have been identified", not "recorded". Paragraph D now reads "scholars have identified paper mills worked by people or animals in the city in the 790s". |
| `C7-P-rd4` Tardigrade | 7 | 6 confirmed. **Claim 7 corrected:** the article says they are not adapted to exploit "many", not "most", of the extreme conditions. Paragraph F changed from "most" to "many". |
| `C7-P-rd5` Qanat | 9 | 7 confirmed, including about 3,000 years, the Kerman lengths of about 70 km and UNESCO "The Persian Qanat" (2016, eleven qanats). The UNESCO claim was also checked against the UNESCO decision listing. **Claims 7 and 8 corrected**, see below. |
| `C7-P-rd6` Ebbinghaus | 8 | 7 confirmed. **Claim 4 URL corrected:** the shape of the curve (sharpest decline first, then levelling off) is on the Hermann Ebbinghaus page, not on the Forgetting curve page. |

### The two qanat corrections

1. **Spain under the Romans (claim 7).**
   - The passage said channels were "built first under the Romans and later in the period of Muslim rule" in Spain.
   - The article says qanat-style systems reached parts of Europe under the Roman Empire and were later built on a larger scale in
     Muslim-ruled Spain. Its Spain section says they were "most likely brought to the area by the Moors".
   - Paragraph D now says this.
   - Item `C7-rs5q07` asked for "a country where such channels were built in two different historical periods", so it no longer had an
     answer. It now asks for the paragraph that mentions when qanat-style channels first appeared in Europe. The key (Paragraph D) and
     the options did not change, and its `why` was rewritten in en, uz and ru.
2. **Why qanats were abandoned (claim 8).**
   - The passage said "deep wells equipped with diesel pumps… have lowered water tables". The article never says this.
   - In the article, diesel pumps appear only as what Afghan farmers moved to. What it does say: groundwater pumps lowered the water table
     and qanats went dry and were abandoned (Syria), and "excessive pumping from wells" is a cause of their decline (Iraq).
   - Paragraph E now reads "wells fitted with pumps, together with heavy pumping of groundwater, have lowered water tables, and many
     qanats have dried up and been abandoned".
   - In item `C7-rs5q04`, the key option changed from "deep wells and heavy pumping…" to "wells with pumps and heavy pumping…", and its
     `why` was rewritten in en, uz and ru. The keyed answer is the same.

`words` and `chars` were recomputed for the edited passages:

- `C7-P-rd3`: 417 words, 2423 characters.
- `C7-P-rd4`: no change.
- `C7-P-rd5`: 394 words, 2367 characters.

Words are counted without the paragraph letters. The author's counts for `C7-P-rd2` (261) and `C7-P-rd6` (392) are one or two words
lower than this method gives. They were not changed.

## Translations (uz, ru, en) and Uzbek characters

Every `why` and `instructions` field has all three languages, and they say the same thing except for the 5 items below. These were
fixed:

- `C7-w1pr07` uz: the en text says to vary passives and linkers, but uz only said linkers. Passive voice (majhul nisbat) was added.
- `C7-w1mp05` uz: "kichraydi" (present tense) is now "kichrayib qoldi", because the car park shrank.
- `C7-w2tp06` uz and ru: these said band 6 conclusions are "often" unclear, while en and the descriptor say they "can"/"may be" unclear.
  Both now say "may be".
- `C7-rs1q01` and `C7-rs1q06` uz: "haydovchi" (driver) is now "velosipedchi" (cyclist).

Uzbek marks:

- All 256 oʻ/gʻ marks are U+02BB.
- All 22 tutuq belgisi marks (maʼlumot, daʼvo, masʼul, taʼsir and others) are U+02BC.
- No uz field has an ASCII apostrophe, U+2018, U+2019 or a backtick in an oʻ/gʻ position, and none has U+02BB anywhere else.
- Quoted English inside uz text ("good", "will be") is deliberate.

## Still unverified

Nothing is marked `needs_verification`. Two points were left as they are:

- **The qanat passage dates the invention flatly.** Paragraph A says the ancient Iranians developed the qanat about 3,000 years ago. The
  article's lead says the same, but its Origins section writes "according to most sources" and mentions another theory of a Southeast
  Arabian origin.
- **The maps claim rests on a secondary page.** It comes from an IDP regional article, not from the official format page. The official
  page lists only graphs, charts, tables and diagrams.

Neither is wrong as written. A teacher reviewer may want to hedge the first.

A backup of the files as they were before this check is outside the repo, in the session scratchpad. It is not needed to undo anything:
every change is listed above.
