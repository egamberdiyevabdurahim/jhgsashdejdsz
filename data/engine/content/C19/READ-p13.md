# p13-read: the uz/ru text pass (content round 3's read, shared lines, read-alikes, English apostrophes)

Branch `p13-read` from p8-lessons @ e8066718 (worktree C:/Users/PC/jg-p5m), 17 Oct 2026. Lane: the native uz/ru editor of a teenagers'
app. Four parts, one applier: `p13v2.cjs` (in `C:/Users/PC/jg-p5int/.superpowers/p13/text-tools/` with its ledger
`p13-decisions-v2.json` (every changed field, old and new, and every decision), `verify.cjs`, `tests-quote.cjs`, `overlap.cjs`, the
inventory; a copy of the interrupted run's `p13.cjs`, changed as below). Every change is a uz or ru string replaced at its exact byte span in the JSON (formatting kept), composed per field, one write
per file (temp file, then rename), re-parsed and compared with the expected object. No key, option, option order, number, formula,
param, {slot}, status, version or English string changed. Uzbek/Russian wording fixes are not content changes (as in p12-read): no
version bump, no status change, no key check.

## The resumed run (the 15 Oct attempt was stopped before it committed)

The 15 Oct run left 55 uncommitted files on p13-read: its applier had written parts A-D, using the round-3 reads as they were then
(uz 56 rows, ru 72). Since then the readers finished (uz 70, ru 78; the ru list was rebuilt, so row numbers moved). This run:
1. made the applier read every file from e8066718 (not the working tree), keyed its A decisions by `id|field_path`, and added a
   `--compare` mode. Run from the base with the final reads, it matched the stopped run's tree in **288 of 288 files except 27
   fields**, each one explained: 14 new uz rows, 6 new and 2 corrected ru rows, the re-decided ir5912 partial, the part C line the
   stopped run had missed (survey, 3 fields) and the part D word it had missed («caféʼs», 1 field). Then it wrote the whole pass
   again; after that the tree equals the applier's output in 288/288 files.
2. found two broken test pins the stopped run had written (a space lost before `\d` in `s\(t\) =\dt³` in lesson-c19-apca34 and
   `y =\d+x` in lesson-p7-a2; both would never match) and fixed them.
3. replaced the blanket "no ’ in an Uzbek string" test line by the exact rule, and added the guard (part D below).

Independent check (`verify.cjs`): 51 content files changed, 692 fields, every one a uz/ru string, all files re-parse; same {slots},
same digits (bar the two time formats below), every why at 200 characters or less, no Cyrillic into uz, no Uzbek mark into ru, no new
' ‘ `; the changed set equals the applier's own list.

## (A) Round 3's native read: 148 fixes, 141 applied whole, 5 in part, 2 refused

| list | fixes | accepted | partial | refused |
|---|---|---|---|---|
| read-uz-r3.json | 70 | 68 (meaning 16, grammar 5, natural 43, typography 4) | 1 | 1 |
| read-ru-r3.json | 78 | 73 (meaning 5, grammar 10, natural 58) | 4 | 1 |

Every `old` matched the file at e8066718 exactly. Each fix was read as a word diff beside the English (stem tail, options, en why).
The two time-format rows (C7-ia1117 «17» → «soat 17:00», C7-ia1201 «4 p.m.» → «16:00») change how a number is written, not its value;
Uzbek has no a.m./p.m. They are the only digit changes.

Refused:
- **uz #40, ru #37 (C7-ir4909 why, typography)**: the item is quarantined (answerable without its passage) and the content lane
  (p13-content, fix-a) rewrites its stem, options and whys as version 2; the bare «Mackerel» goes with that rewrite.

In part (a strict subset of the reader's edits unless said):
- **uz #16 (C7-ia2108)**: kept the label fix («for good» va «earlier years» — FALSE) and «bu yil»; left «osib qoʻyiladi → osiladi»
  out: «osiladi» also reads as clinging to something; the poem is put up for a year. 199 characters.
- **ru #12 (C7-ia2108)**: kept «по почте работы принимают впервые» for the telegraphic «почта — впервые»; the full fix is 201 characters
  (why limit), so «Работа победителя … в библиотеке» and «стихотворения» stay out; the FALSE label moves onto the two wrong statements'
  words, as in the uz line (editor). 196.
- **ru #49 (C7-ir5905)**: «В других изменено, с кем живёт, как долго или зачем»: «щенок» left out (205 → 199; the subject is clear).
- **ru #53 (C7-ir5912)**: kept the meaning fix «не в одном лишь возрасте» (age alone is not the cause). The full fix is 215 characters;
  «тяжёлых» stays out (the English why says only "e-bikes shake the bolts loose") and the editor wrote that clause the short way,
  «электровелосипеды расшатывают болты», which keeps «Серьёзных аварий» (the passage: "without serious accident"). 197.
- **ru #55 (C7-ir5919)**: kept the point («меняют направление» reads as travel; the referral is reversed). The full fix is 218 characters,
  so the editor wrote «В других перепутано, кто кого направляет, или изменены условия» (as ir5905's «В других изменено»).

C1 families changed by A (and C): checkFamily 50/50 on all 29 (C1-ap3006, ap5005, gep002, clp004, m2b003, m2b005, m2b007, r3a007, r3a009,
r3a010, r3a012, r3a013, r3a015, r3a017, r3a018, r3a020, r3b004, r3b005, r3b006, r3b008, r3b010, r3b012, r3b013, r3b014, r3b016, r3b018,
r3b019, r3b022, r3b024): every one verified, agree 50/50. `scripts/content/counted-nouns.ts`: 233 families × 300 instances and 800 C18
items, 0 flagged.

**Extension (editor, the uz reader's note 1)**: the label trap («Flights leave at sunrise (FALSE)» marks the text's own fact FALSE in a
TRUE item) fixed by the uz reader in six C7-12 TRUE items is fixed the same way in their ru whys (C7-ia2101, ia2103, ia2106, ia2111,
ia2117; ia2108 is in the reader's list) and in the one live item with the pattern, C7-ir2101 (uz and ru): «…: «all year round» —
FALSE». 7 fields. The English whys keep the pattern (outside a uz/ru lane): a follow-up for the en side.

## (B) Shared instruction strings: decided once, applied to every item that carries them

The p12-read applier refused 128 fixes because the strings are shared corpus-wide (8 uz skim, 30 ru data, 90 ru transitions). The
round-3 readers named five more shared lines "for a corpus-wide pass only". Each was decided once; the decided string is now the only
one for that instruction in that language, in every bank, old and new items alike (455 instruction fields):

| instruction (en) | lang | new string | items |
|---|---|---|---|
| Skim the text: its first and last sentences first… | uz | «…avval birinchi va oxirgi gaplarni oʻqing. …» (the verbless line gets its verb; reader's fix) | 37 (C7-7, C7-11, C7-12, C19-6) |
| Read the text and the table / the description of the graph. Choose the answer that uses the data correctly. | ru | «Выберите ответ, в котором данные использованы верно.» (reader's fix) | 55 + 10 (C6-2/3/9/11/16/19, C19-5/16) |
| Choose the linking word or phrase that fits the logic between the ideas. | ru | «…которое передаёт логическую связь между мыслями.» (the reader's fix without «точно»: the English has no "exactly", and the line is read 194 times) | 194 (C6-5/6/9/13/15/17/21, C19-5/19/21) |
| Complete the flow chart. Use NO MORE THAN TWO WORDS from the passage. | uz | «Matndan koʻpi bilan ikki soʻz oling (NO MORE THAN TWO WORDS).» («ikki soʻzdan oshmagan soʻz» = a word of at most two words) | 40 (C7-9, C7-13) |
| Complete the flow chart / sentence / summary … Keep to the word limit. | uz | «Belgilangan soʻz sonidan oshmang.» (the calque «Soʻz chegarasidan» out; IERE05-1 already says this) | 3 + 23 + 20 (C7-8, C7-13, C19-7, C19-14) |
| Read the text. Choose the statement that agrees with the text (TRUE). | ru | «…которое соответствует тексту (TRUE).» («совпадает» suggests a word-for-word match, the IELTS trap) | 15 |
| Choose the best heading for the paragraph. / Read both paragraphs… | ru | «Выберите наиболее подходящий заголовок…» («лучший» is a calque) | 41 + 6 |
| Read the text and the statement. Choose the right answer with the right reason. | ru | «…с верным обоснованием.» | 11 |

Refused: the uz NOT GIVEN line «Matnda bu haqda hech narsa aytilmagan fikrni tanlang (NOT GIVEN).» → «u haqda» (reader: minor). The
line reads clearly as it is; one string, 36 copies, not worth a corpus-wide change.

No old form is left anywhere (an exact field or inside another text); `tests/unit/content/p13-read.test.ts` pins one string per
language for each of the twelve instructions and the absence of every old form. The round tests that pin a reserve item's instructions
to its first-20 item's (p10-rw1, p11-ii, p10-rw2, p11-ei, p12-iere-a/-b) hold, since every copy changed together.

## (C) The 8 read-alike refusals: the C1 template and every lesson/piece line that quotes it, together (30 edits, 6 rules)

| rule | p12 refusal | template | lesson lines |
|---|---|---|---|
| ru «форму буквы L» → «Г» (an L-shaped floor is Г-образный) | ru-lessons-1#82 (gt11q2) | C1-gep002, C1x-gep02a/b | C19-gt11q2, C19-MAGT01-1 (2) |
| ru «тренер; его возраст — N» → «их N-летний тренер» | #197 (ps22q2) | C1-m2b003 | C19-ps22q2, C19-MAPS02-2 (2) |
| ru «линия тренда для балла … и часов» → «построена линия тренда, связывающая балл … и часы» | #199 (ps23q2) | C1-m2b005, C1-r3b018 (round 3's sibling, written to match) | C19-ps23q2, C19-MAPS02-3 |
| ru «забор закрывает только три стороны. Есть N м» → «забор ставят только с трёх сторон. Всего есть N м» | ru-lessons-2#66 (ca53q2) | C1-ap5005 | C19-ca53q2, C19-APCA05-3 |
| uz «holat» → «joylashuv (koordinata)» for a moving body's position | uz-lessons-1#84, #90, #91 | C1-ap3006 (stem, why), C1-clp004, C1x-clp04a/b, K4-clh025 | C19-APCA02-1, C19-APCA04-1 (2), C19-ca41q2 |
| ru «число тех, кто читает каждый день, равно N» → «число тех, кто сказал, что читает каждый день, равно N» | #203 (ps33q2) | C1-m2b007 | C19-ps33q2, C19-MAPS03-3 (2) |

The survey line (the stopped run had missed it) adds "said" (en: "{k} said they read every day"; uz: «…oʻqishini aytdi»), but not in the
reader's words «N сказали, что читают»: k runs 4–36, and at 21 and 31 «21 сказали» is a numeral-agreement slip; «число тех, кто сказал»
holds for every k. checkFamily 50/50 and counted-nouns 0 on every changed template (above). Pins moved to the new form, same strength:
lesson-teaches (MAGT01-1 ru), lesson-p7-a2 (MAPS02-2, MAPS02-3, MAPS03-3 ru), lesson-c19-apca34 (APCA04-1 uz), lesson-c19-apca58
(APCA05-3 ru).

## (D) English words inside uz strings: U+02BC → U+2019 (93 marks, 56 fields, 50 records, 11 files)

Found by script over every uz string of the corpus (items, lessons, passages): each word that carries U+02BC/U+02BB and is English by
its apostrophe (the mark followed by s, t, d, re, ve, ll or m to the end of the word, or closing a plural possessive: it’s, don’t,
they’re, Anvar’s, students’), less the one Uzbek tutuq word that ends that way (taʼm). The full inventory of marked words in uz strings
(373 distinct) was read by eye; the English ones are exactly these: donʼt, mustnʼt, canʼt, itʼs/Itʼs, theyʼre/Theyʼre, whoʼs/Whoʼs,
thereʼs, and the possessives (schoolʼs, studentsʼ, childrenʼs, neighborsʼ, caféʼs, Yulduzʼs, Azizaʼs …), plus the deliberate wrong
forms the apostrophe lessons quote (itsʼ, theirʼs, whichʼs) and «ʼs» alone; and C6-se3n16's lone mark «faqat ʼ qoʻshiladi», which names
the English apostrophe. Files: C6-8/12/15/17/20, C19-4/17/21 (the RWSE apostrophe lessons, RWII03-1), C18-18/38/40 (whys only).

Left, on purpose: an Uzbek case suffix after an English name or abbreviation (SATʼga, IELTSʼga, Bankʼda, Bluebookʼda, Tashkentʼda,
YouTubeʼda …): the mark there is Uzbek orthography (the tutuq as a separator), not part of the English word. And the C18 spelling
items' misspelt distractors (maʼlummot, maʼlumod, shiʼr) are the test.

So it cannot ship again: `englishWithUzbekMark` and `strayUzQuoteMarks` in src/engine/content/text.ts; the validator reports
`uz.english-apostrophe` as an **error** on items and passages (on e8066718 it finds 61, which also make 44 served items
status.unverified; on this branch 0); `tests/unit/content/p13-read.test.ts` holds every uz string of the corpus, lessons included, to
it (on e8066718 the helper finds 92 such words). The 15 content tests that banned ' ‘ ’ ` outright now ban ' ‘ ` outright and ’ outside
an English word, and also ban an English word written with ʼ/ʻ (strictly more than before for the Uzbek marks; ’ is allowed only where
the ruling wants it).

## Checks

- validate.ts --no-families --all: exit 0, 0 errors. Against the same validator on e8066718: the only differences are
  uz.english-apostrophe 61 → 0 and status.unverified 44 → 0; no finding is new.
- checkFamily 50/50 on the 29 changed families; counted-nouns 0 flagged.
- tests/unit/content: 43 files, 503 tests, all pass (incl. the new p13-read, 4 tests). The four engine pin files (lesson-teaches,
  lesson-p7-a2, lesson-c19-apca34, lesson-c19-apca58): 28 tests pass. The other 21 unit files that read the corpus without a
  database (lesson-asks-its-page(-dtm), lesson-c19-14/-5-notes/-9/-apca12, lesson-teaches-dtm, phase-d-c15, read-floor,
  ready-records, strategy-schema/-v16, lessons-speaking cards/p9-read/prep, lessons-writing content, p7-quiz-view, smoke-leak,
  phase-x starter-rung, content/text, content/validate): 186 tests pass.
- tsc --noEmit: exit 0.
- Tests ran without the database (the Postgres on :5433 is not running here): a config with no migrate step; these tests read JSON only.

## For the integrator: items this branch and p13-content (fix-a, HEAD ad28034e) both change

C7-ir4807 (here: why.ru, instructions.uz), C7-ir4815, C7-ir4909, C7-ir4110 (here: instructions.uz): p13-content rewrites their options
(and ir4909/ir4110 whys) as version 2. Take theirs for every field they change and this branch's instructions.uz (and ir4807's why.ru
if their en why is unchanged; it is). Their uncommitted work in C6-10/12/13/15 and C19-21 may also touch lines next to this branch's
instruction and why.uz lines.
