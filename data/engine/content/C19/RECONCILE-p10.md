# C19 and C7: key check 2 of content round 1's IELTS Reading and Writing (15 Oct 2026)

Content round 1 (the owner's "content x3-5", 15 Oct 2026; SPEC-lessons rev. 2, §3.4, §4.5, §4.7, §9.1) gave IELTS Reading three new
fixed-text lessons, so the course has 10, and IELTS Writing seven new lessons, so it has 11. Two authors wrote them; P10 blind checkers 1
and 2 keyed them. This file is checker 2's record (P10ies2, who ran the reconcile).

| File | Commit | Author | Lessons | Keyed items |
|---|---|---|---|---|
| `C19/C19-22.json` (batch 22) | `71657d2b` | `agent:p10-iere` | `C19-IERE01-2` (unit C10-IERE01, seq 2, gate B1), `C19-IERE05-1`, `C19-IERE05-2` (C10-IERE05, gate B2) | 9 piece questions `C19-ie12q1-3`, `ie51q1-3`, `ie52q1-3` |
| `C7/C7-11.json` (batch 11) | `71657d2b` | `agent:p10-iere` | the three lessons' reserves, 20 each | 60 items `C7-ir1201-1220`, `ir5101-5120`, `ir5201-5220` |
| `C19/C19-23.json` (batch 23) | `7680b0e7` | `agent:p10-iewr` | `C19-IEWR01-2`, `IEWR02-2`, `IEWR03-2`, `IEWR04-2` (gate B1), `C19-IEWR05-1`, `IEWR05-2`, `IEWR06-1` (gate B2) | 14 piece questions `C19-iw12q1-2` … `iw61q1-2` |

Before this pass the 10 lessons and 83 items were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. Each
reading text is in its item's stem (no `passage_id`); each Writing piece question brings its own data, question or sentences.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P10ies1 (checker 1) | `.superpowers/p10/check-ie-1/C19-P10ies1.json`, `C7-P10ies1.json` | `.superpowers/p10/check-ie-1/C19-P10ies1.answers.json` (23), `C7-P10ies1.answers.json` (60) |
| P10ies2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p10/check-ie-2/C19-P10ies2.json` (`npx tsx scripts/content/blind.ts C19 P10ies2 --pending --blind .superpowers/p10/check-ie-2`: the 23 items without two checks), `C7-P10ies2.json` (the same for C7: 85 items, the 60 of this pass and 25 older `C7-rs*` items in quarantine, which neither solver answered) | `.superpowers/p10/check-ie-2/C19-P10ies2.answers.json` (23), `C7-P10ies2.answers.json` (60) |

A copy holds each item's stem and its four options, shuffled by the solver's own seed and lettered A-D, with its instructions; no key, no
`why`. Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads
P10ies1, P10ies2, `p10-iere` and `p10-iewr` as four agents, so `keyCheckOf("blind:P10ies1+P10ies2", { author })` is
`{ kind: "blind", n: 2 }` for both authors. P10ies2 opened neither `.map-*` file nor the C19-22, C19-23 and C7-11 records, nor the authors'
ledgers, sources, logs and tests (`.superpowers/p10/author-ie*.md`, `iere/`, `iewr/`, `tests/unit/content/p10-ie*.test.ts`), nor checker
1's dry-run logs, before it wrote its answers. It read each item in its copy, chose a letter, and wrote its answers files, with a one-line
reading per item (the tables below), before it read P10ies1's. Only `reconcile.ts` read the maps. For the reconcile, both solvers' copies,
answers and maps were copied unchanged into `.superpowers/p10/check-ie-2/rec/` (P10ies1's six files compared byte for byte with checker
1's folder just before the write), because `reconcile.ts` reads all solvers from one `--blind` folder.

## The decision

- `npx tsx scripts/content/reconcile.ts C19 P10ies1 P10ies2 --blind .superpowers/p10/check-ie-2/rec --write`: **372 items: verified 23,
  quarantine 0, pending 0, blocked 0, skipped 349** (the earlier C19 items, already `verified_auto`).
- `npx tsx scripts/content/reconcile.ts C7 P10ies1 P10ies2 --blind .superpowers/p10/check-ie-2/rec --write`: **299 items: verified 60,
  quarantine 0, pending 0, blocked 0, skipped 239** (the earlier C7 items: served ones, open prompts, and the 25 quarantined `C7-rs*` that
  no solver answered, left as they were).

**Both solvers chose the key on all 83 items.** No answer was stale. Neither answers file raises `two_defensible`, `unanswerable` or
`no_passage_needed`. Answerable without its text: none. Each reading item asks for a detail, a gist or a restatement that only its text
fixes (a time, a name, a figure, which sentence keeps every meaning part); no option is true or false by general knowledge alone.

| Status after this pass | Records | Record |
|---|---:|---|
| `verified_auto` items | **83** | `key_check_2: "blind:P10ies1+P10ies2"`, `key_check_2_version: 1`, version 1 |
| `verified_auto` lessons | **10** | `key_check_2: "blind:P10ies1+P10ies2"` (the lesson shape of §11.1 has no `key_check_2_version`) |
| `quarantine` | **0** | none |

By level: B1 24/24, B2 44/44, C1 15/15. Per lesson:

| Lesson | Piece questions verified | Reserve verified | Quarantined |
|---|---:|---:|---:|
| `C19-IERE01-2` | 3/3 | 20/20 | 0 |
| `C19-IERE05-1` | 3/3 | 20/20 | 0 |
| `C19-IERE05-2` | 3/3 | 20/20 | 0 |
| `C19-IEWR01-2` … `C19-IEWR06-1` (7 lessons) | 2/2 each, 14/14 | no reserve | 0 |

**How the files were written.** `--write` re-serialises each file it touches. Against `HEAD` (`.superpowers/p10/check-ie-2/diffcheck.mjs
--after-fixes`): 83 items changed only `status`, `key_check_2` and the new `key_check_2_version`; 10 lessons only `status` and
`key_check_2`; each file's `note`; and the 84 uz/ru strings of the fixes below. Nothing else: no key, option, stem, English text or
version; LF, no BOM. The decisions are kept in `.superpowers/p10/check-ie-2/C19-decisions.json` and `C7-decisions.json`.

**The lesson records** (`.superpowers/p10/check-ie-2/lessons-write.mjs`, a text edit of the two lines that refuses unless the lesson check
passed and verifies by parsing that nothing else changed). Each of the 10 is `verified_auto` with `blind:P10ies1+P10ies2` because
(`.superpowers/p10/check-ie-2/lessons-kc2.mjs --final`, 0 problems):

- Reading: its pieces are `idea`, `example`, `trap`, checking q1, q2 and q3, each verified 2/2 for its version with `page` naming the
  lesson. Its example quotes every paragraph of q2's text and q2's question line word for word in en, uz and ru (spacing and quotation
  marks aside) and its last line is the blank ("Answer: ?", "Javob: ?", "Ответ: ?"). One note, read by hand: `C19-IERE05-1`'s q2
  (`C19-ie51q2`, short answer) has the stem line "Answer the question. Use NO MORE THAN THREE WORDS from the text."; the example gives the
  same limit as "(NO MORE THAN THREE WORDS)" on its worked question and "within the limit" in the "Now you" steps, the same text and limit.
  Its reserve is 20 C7-11 items, without a `page`, verified 2/2 by this pass: 60 ids, each in exactly one lesson's reserve, none in none.
  `C7/C7-11.json` is in `RESERVE_FILES` (`src/server/content/bank.ts`), so no practice pool draws them.
- Writing: its pieces are `idea`, `model`, `trap`; the idea checks q1 and the trap q2, each verified 2/2 with `page` naming the lesson.
  Its task (`writing`) is an open prompt with no key, so it was not solved; checker 2 read each one for being our own and answerable at
  B1-B2 (next section). A Writing lesson has no reserve (`unservedOf` is empty), so its record decides whether it is served.

## Each piece question, with checker 2's reading

The reading is P10ies2's own blind working, written into its answers before any key was seen.

| Lesson | Piece | Item | Level | P10ies2's reading | Key (options[0]) | P10ies1 | P10ies2 |
|---|---|---|---|---|---|---|---|
| C19-IERE01-2 | idea | C19-ie12q1 | B1 | longest = river to the stone bridge and back, 11 km | 11 kilometres | key | key |
|  | example | C19-ie12q2 | B1 | On Sundays it opens later, at 11 a.m.; 2 p.m. is the tour | 11 a.m. | key | key |
|  | trap | C19-ie12q3 | B2 | since 2015 the trip now takes twenty-five minutes; forty was the old boat | twenty-five minutes | key | key |
| C19-IERE05-1 | idea | C19-ie51q1 | B2 | Friday evening, when people are home from work; stalls and music were added, not the reas… | So that more people could come after work | key | key |
|  | example | C19-ie51q2 | B2 | They always start at sunrise | sunrise | key | key |
|  | trap | C19-ie51q3 | B2 | students fill the room, borrowing has hardly changed | They brought in more people, but not more borrowing. | key | key |
| C19-IERE05-2 | idea | C19-ie52q1 | B2 | widened in several places (not the whole path) because they kept meeting on the narrow be… | Last year parts of the path were made broader, as people on… | key | key |
|  | example | C19-ie52q2 | B2 | most order online and collect on the way to work; A says all and delivered | These days the majority of buyers order on the internet and… | key | key |
|  | trap | C19-ie52q3 | C1 | easier to reach, so more people drove in: more cars at first | At the start, the new road brought more cars into town, bec… | key | key |
| C19-IEWR01-2 | idea | C19-iw12q1 | B1 | hot chocolate 100 to 300 (tripled) and top in 2024 (300 > 250); tea and juice fell; D wro… | Overall, hot chocolate sales tripled and it became the best… | key | key |
|  | trap | C19-iw12q2 | B1 | 400 to 800 doubled, 800 to 700 fell slightly, past tense; A wrong tense, D wrong number, … | The number of visitors doubled between 2015 and 2020 and th… | key | key |
| C19-IEWR02-2 | idea | C19-iw22q1 | B1 | six numbered stages, first to last; C is a list, not an overview; B five stages wrong | Overall, the process has six stages, from collecting used b… | key | key |
|  | trap | C19-iw22q2 | B1 | car park in the centre became a playground; bakery stayed on the north side | The car park in the centre has been replaced by a playgroun… | key | key |
| C19-IEWR03-2 | idea | C19-iw32q1 | B1 | both views and an opinion; B has no opinion, A only one side | While some value music and others prefer sport, I believe t… | key | key |
|  | trap | C19-iw32q2 | B1 | both views plus own opinion throughout; A summary has no opinion, B and C miss a view | Introduction: both views and my opinion. Body 1: why some w… | key | key |
| C19-IEWR04-2 | idea | C19-iw42q1 | B1 | one clear controlling idea that agrees; A a list of too many points, B an anecdote, C a f… | Closing town centres to cars at weekends would make them sa… | key | key |
|  | trap | C19-iw42q2 | B1 | cost of pets is about money, not responsibility | Pets can also be expensive, as food and visits to the vet c… | key | key |
| C19-IEWR05-1 | idea | C19-iw51q1 | B2 | beneficial = good for health; precious, kind, nice do not fit | beneficial | key | key |
|  | trap | C19-iw51q2 | B2 | pay attention to + take responsibility for | Students who pay attention to the teacher and take responsi… | key | key |
| C19-IEWR05-2 | idea | C19-iw52q1 | B2 | A lacks a subject after although, B sleeps, C which for people | Students who sleep well usually concentrate better, althoug… | key | key |
|  | trap | C19-iw52q2 | B2 | A comma splice, B a fragment, C although + but | Because the bus was late, many students missed the first le… | key | key |
| C19-IEWR06-1 | idea | C19-iw61q1 | B2 | Task 2 counts more and is longer: about 20/40 with plan and check time | About 20 minutes on Task 1 and about 40 on Task 2, with a f… | key | key |
|  | trap | C19-iw61q2 | B2 | Visiting a country teach: subject-verb agreement (teaches) | Visiting a country teach you things that no book can. | key | key |

### What P10ies2 weighed (none a flag)

- `C19-iw12q2`: "The number of visitors was higher in 2020." is not false, but it compares with nothing (higher than when?), the comparison
  mistake the instruction names; only the "doubled … then fell slightly" sentence has the right tense, numbers and comparison (800 to 700
  is a fall of an eighth: slight). P10ies1 weighed the same option the same way.
- `C19-iw32q2`, `C19-iw32q1`: "both views and your opinion" has three parts; the plan or sentence with both views but no opinion misses one.
- `C19-iw42q1`: the sentence that lists six effects takes no side and cannot be one paragraph's point.
- `C19-ie52q1`: "widened it in several places" is not "the whole path"; only "parts of the path were made broader" keeps it.
- `C7-ir5116` (short answer, three words): the key "old music room" is the only option without an article, a form cue; the text makes it
  the only answer ("The old music room … has been turned into a silent study room"). P10ies1 weighed the same.
- `C7-ir5213`: "the hotels are now full in both July and September" says more than "now have guests in a month that was once quiet".
- `C7-ir5220`: "screens now take a bigger share than objects" reads "the balance has changed" with the critics' "too few objects and too
  many screens"; the other three are plainly wrong. P10ies1 weighed the same.
- `C7-ir1210`: the shares are consistent (just under a third, a tenth, more than half; a twentieth of the students did not vote).

## The seven Writing prompts (no key: read, not solved)

| Lesson | Task | Prompt (our own) | Answerable at the gate |
|---|---|---|---|
| `C19-IEWR01-2` | Task 1 overview | visitors (thousands) to a museum, a zoo and a water park in an invented town, 2012, 2017, 2022 | B1: three clear trends (water park 30 to 110 and first by 2022, zoo 90 to 70, museum about level) |
| `C19-IEWR02-2` | Task 1 overview | an invented school's 7-stage compost process, from the canteen back to the canteen | B1: seven stages, begins and ends in the canteen, so a cycle; passive verbs given |
| `C19-IEWR03-2` | Task 2 body | shorter summer holidays to learn more, or long holidays to rest and learn other things; discuss both views, give your opinion | B1: an everyday school topic; one body paragraph on the view you agree with less |
| `C19-IEWR04-2` | Task 2 body | a school rule banning phones all day, breaks included; agree or disagree | B1: one topic sentence, then support |
| `C19-IEWR05-1` | Task 2 body | museums and galleries free for everyone under 18; agree or disagree | B2: one point with precise words and collocations |
| `C19-IEWR05-2` | Task 2 body | reading books as still the best free-time activity for young people; agree or disagree | B2: one point in checked complex sentences |
| `C19-IEWR06-1` | Task 2 body | visiting a country, or books, films and the internet, to learn about it; discuss both views, give your opinion | B2: one paragraph in about 10 minutes, then the four checks |

Each prompt is our own wording on a common, everyday theme; the Task 1 data are labelled as invented and name no real place, person or
statistic; none reproduces an IELTS, Cambridge, British Council or IDP prompt that checker 2 knows. Each steer (en/uz/ru) asks for 60-150
words of one paragraph, which a B1 (IEWR01-04) or B2 (IEWR05-06) student can write on these themes.

## The Reading reserves

| Lesson | Reserve | Subskills | Levels | Verified | Quarantined |
|---|---|---|---|---:|---:|
| C19-IERE01-2 | `C7-ir1201` … `C7-ir1220` | scanning 12, skimming 8 | B1 8, B2 12 | 20 | 0 |
| C19-IERE05-1 | `C7-ir5101` … `C7-ir5120` | multiple_choice 11, short_answer 9 | B1 4, B2 11, C1 5 | 20 | 0 |
| C19-IERE05-2 | `C7-ir5201` … `C7-ir5220` | paraphrase 20 | B1 2, B2 9, C1 9 | 20 | 0 |

<details><summary>Each of the 60 reserve items, with checker 2's reading</summary>

| Item | Level | P10ies2's reading | Key | Solvers |
|---|---|---|---|---|
| C7-ir1201 | B1 | on Sunday, the last day, entry is free | nothing | key / key |
| C7-ir1202 | B1 | the top prize went to Sara Lund | Sara Lund | key / key |
| C7-ir1203 | B1 | repaired in 2004, bells ring since then | 2004 | key / key |
| C7-ir1204 | B1 | the tour ends with an open-air concert in Belmar Park | Belmar Park | key / key |
| C7-ir1205 | B1 | no more than forty climbers in each evening session | forty | key / key |
| C7-ir1206 | B2 | must tell the office by 30 April | 30 April | key / key |
| C7-ir1207 | B2 | the new estimate is 210,000 | £210,000 | key / key |
| C7-ir1208 | B2 | the deep tour lasts three hours | three hours | key / key |
| C7-ir1209 | B2 | today run by a committee led by Aziza Nurova | Aziza Nurova | key / key |
| C7-ir1210 | B2 | the clear winner, Ambry, with more than half | more than half | key / key |
| C7-ir1211 | B2 | the path winds to a viewpoint at 900 metres | 900 metres | key / key |
| C7-ir1212 | B2 | blood tests move to Thursday mornings | Thursday | key / key |
| C7-ir1213 | B1 | empty bakery turned into a tea room where people meet | How an empty shop became a meeting place again | key / key |
| C7-ir1214 | B1 | own portion size, waste fell by almost half | Letting pupils choose their portion has cut food … | key / key |
| C7-ir1215 | B1 | the footbridge: ten minutes to school whatever the weather | A footbridge that gave children a short way to sc… | key / key |
| C7-ir1216 | B2 | forced online by losing the room, gained players from three towns | A chess club that had to go online found that it … | key / key |
| C7-ir1217 | B2 | too many visitors' cars; park-and-ride scheme | A plan to deal with the traffic that summer visit… | key / key |
| C7-ir1218 | B2 | words met in stories remembered better than copied lists | Meeting words in stories helped students remember… | key / key |
| C7-ir1219 | B2 | residents bought the cinema, films plus concerts, classes, meetings | How residents saved an old cinema and gave it new… | key / key |
| C7-ir1220 | B2 | dry summers, mix of crops, a poor year for one is no longer for all | Dry years led valley farmers to grow a wider mix … | key / key |
| C7-ir5101 | B1 | tired of clothes thrown away for one small hole | She did not want clothes thrown away when they co… | key / key |
| C7-ir5102 | B1 | opened to visitors who climb the 120 steps | It is a tower that visitors can climb. | key / key |
| C7-ir5103 | B2 | expected walking, guests came for the silence | Most of them came for the quiet, not the walks. | key / key |
| C7-ir5104 | B2 | the company says more people use it now than when it ran all day | More passengers travel on it than on the old one. | key / key |
| C7-ir5105 | B2 | a cold furnace takes two days to heat up again | Heating it up again after it goes cold would cost… | key / key |
| C7-ir5106 | B2 | pupils more awake; hard for some parents who start work early | It has helped pupils, but it is hard for some fam… | key / key |
| C7-ir5107 | B2 | light slowly damages them | Showing them would have let light harm them. | key / key |
| C7-ir5108 | B2 | panels on the side that gets the least sun | The sun panels were on the wrong side of the buil… | key / key |
| C7-ir5109 | C1 | the letters from that time tell a different story | It is not supported by what people wrote at the t… | key / key |
| C7-ir5110 | C1 | boards on short legs, water passes underneath; not cost | They let the water move freely under the paths. | key / key |
| C7-ir5111 | C1 | poor sound, hard chairs, yet ticket sales rose | More tickets were sold, although conditions were … | key / key |
| C7-ir5112 | B1 | buyers leave it in a blue tin under the table | a blue tin | key / key |
| C7-ir5113 | B1 | the tourist trip around the island lasts forty minutes | forty minutes | key / key |
| C7-ir5114 | B2 | moved again, to the top floor | the top floor | key / key |
| C7-ir5115 | B2 | they now use beech | beech | key / key |
| C7-ir5116 | B2 | the old music room has been turned into the study room | old music room | key / key |
| C7-ir5117 | B2 | in April the farm needs extra hands | April | key / key |
| C7-ir5118 | B2 | the oldest pupils of the village school repaint them | the oldest pupils | key / key |
| C7-ir5119 | C1 | neither the flour nor the starter but the water | the water | key / key |
| C7-ir5120 | C1 | a frozen lake outside town | a frozen lake | key / key |
| C7-ir5201 | B1 | in winter it closes on Mondays to clean and check the water | In the cold months it shuts on Mondays for cleani… | key / key |
| C7-ir5202 | B1 | most honey to neighbours, who water his plants when he is away | Most of his honey goes to the people next door, a… | key / key |
| C7-ir5203 | B2 | optional twenty-pound share; volunteers until it can pay a manager | Families may buy a twenty-pound share, and unpaid… | key / key |
| C7-ir5204 | B2 | visitors four times what they had been | The new library has had many more visitors than t… | key / key |
| C7-ir5205 | B2 | faster, but cut old leaves too, which make the tea bitter | Machines pick more quickly, but they also take ol… | key / key |
| C7-ir5206 | B2 | to his surprise, times improved since he ran less | He did not expect it, but he has become faster si… | key / key |
| C7-ir5207 | B2 | a quarter kept back for people who live in the town | Some tickets were saved for people from the town … | key / key |
| C7-ir5208 | B2 | stays open, lorries not allowed | Before the work starts, the bridge can still be u… | key / key |
| C7-ir5209 | B2 | rent half as much, savings bought a better machine | But the side road cost only half the rent, and th… | key / key |
| C7-ir5210 | B2 | it may have been a calendar, but we cannot prove it | The guide thinks the calendar idea is possible bu… | key / key |
| C7-ir5211 | B2 | general rubbish every two weeks, food waste every week | Since the spring, food waste has been taken away … | key / key |
| C7-ir5212 | C1 | valued now for absorbing the force of storm waves, protecting the town | Now the marsh is prized for something no one used… | key / key |
| C7-ir5213 | C1 | hotels full in July anyway now have guests in a once quiet month; A overstates … | Even so, the move has been a success: hotels that… | key / key |
| C7-ir5214 | C1 | steep rocky slopes no plough could reach: survived by accident | The oldest trees probably survived because their … | key / key |
| C7-ir5215 | C1 | in parks, pleasant to ride, rather than where people need to travel | Most stations were put where riding is pleasant i… | key / key |
| C7-ir5216 | C1 | audience of all ages; younger actors join | The group now draws people of every age, not only… | key / key |
| C7-ir5217 | C1 | fishermen blame the dam; the company says the fall began earlier with other cau… | Fishermen blame the dam for their smaller catches… | key / key |
| C7-ir5218 | C1 | they offer advice and repairs the supermarket does not | Some small shops have stayed open by offering ser… | key / key |
| C7-ir5219 | C1 | when the mill closed they feared they would have to cut the trees down | After the mill shut, the owners were afraid that … | key / key |
| C7-ir5220 | C1 | accepts the balance has changed, rejects that it is a loss | The director agrees that screens now take a bigge… | key / key |

</details>

## The uz and ru fixes (checker 1's `.superpowers/p10/check-ie-1/uz-ru-fixes.json`)

Checker 1 proposed **94 fixes** (53 uz, 41 ru; 24 in C19-22, 40 in C19-23, 30 in C7-11). Checker 2 read each one in its line and agreed
with all of them: **94 applied, 0 refused** (`.superpowers/p10/check-ie-2/apply-fixes.mjs`; the list in `applied-fixes.json`). Each `old`
was found exactly once in its string before it was replaced; together they change 84 strings. They touch only uz and ru lines (lesson
bodies, titles, steers and self-check questions, item `instructions` and `why`), never an English line, a stem, an option or a key, so no
item's version or key check changes. After them every `why` is still at most 200 characters, and the Uzbek lint
(`.superpowers/p10/check-ie-2/uz-lint.ts`, P8b's: `uzApostrophes`, `mixedScriptWords`, stray apostrophes, U+02BB/U+02BC placement,
Cyrillic in uz, bare common words) finds **0** in the three files (241 uz strings, 605 U+02BB, 46 U+02BC).

What they fix, in kind: meaning traps (Uzbek «ming marta» "a thousand times" for "in thousands"; «hayvonot bogʻi kamaydi» "the zoo got
smaller"; «qoʻllaydigan» read as "uses" for "agrees with"; Russian «другие ожидания» "other expectations", «не уже» "not already",
«зоопарк упал»); the wrong register of "fairly" (Uzbek «adolatli» and Russian «честно» are moral; «xolis», «объективно»); calques
(«сказана другими словами», «время идёт», «soʻz chegarasi» "word boundary" for the word limit, «koʻp hisoblanadi» for "counts twice");
accuracy against the text («devor» for a fence, "a third" for "just under a third", «пересаживали» for replanted, «не оставляет его себе»
for "keeps most of it"); and grammar («soʻzni maʼnosini», «qismda», «одно из этого»). The instruction fixes are applied to every item of
the subskill in these files, so each subskill keeps one instruction set (the author test pins it).

Left for a later pass (outside this round's files): the same two instruction lines are still in the older IELTS Reading files, ru
«может быть сказана другими словами» and uz «Soʻz chegarasidan oshmang», in `C7/C7-8.json`, `C19/C19-7.json` and `C19/C19-14.json`. A
native read of the uz and ru lines (§9.1 step 5) is still to do; checker 1's read and the lint do not replace it.

<details><summary>The 94 fixes, grouped where one change was made in several records</summary>

| Record(s) | Field | Lang | Change | Checker 1's reason |
|---|---|---|---|---|
| C19-IERE01-2 | pieces[0].body | ru | «Когда время идёт, текст не получится прочитать дважды.» → «Когда время ограничено, прочитать текст дважды не получится.» | calque of "when the clock is running": «время идёт» is always true ("time passes") and does not say the time … |
| C19-IERE01-2 | pieces[0].body | ru | «Если вопрос занимает больше минуты,» → «Если на вопрос уходит больше минуты,» | minor: «вопрос занимает» is a calque of "a question takes"; «на вопрос уходит» is the natural form |
| C19-IERE01-2 | pieces[1].body | uz | «1 tegirmon nima boʻlgan;» → «1 tegirmon tarixi;» | minor: «tegirmon nima boʻlgan» is first read as "what happened (to the mill)"; a paragraph label reads cleane… |
| C19-IERE05-1 | pieces[0].body | uz | «matndagi soʻzlar bilan, soʻz chegarasida, masalan» → «matndagi soʻzlar bilan, belgilangan soʻz soni doirasida, masalan» | «soʻz chegarasi» reads as "word boundary"; the IELTS limit is a number of words (same wording as the fixed in… |
| C19-IERE05-1 | pieces[1].body | uz | «Soʻzni matndan, soʻz chegarasida koʻchiring.» → «Soʻzni matndan, belgilangan soʻz soni doirasida koʻchiring.» | «soʻz chegarasi» reads as "word boundary", not the word limit |
| C19-IERE05-1 | pieces[1].body | uz | «Soʻzlarni matndan, soʻz chegarasida koʻchiring.» → «Soʻzlarni matndan, belgilangan soʻz soni doirasida koʻchiring.» | «soʻz chegarasi» reads as "word boundary", not the word limit |
| C19-IERE05-1 | pieces[2].body | uz | «Boshqa soʻzlar, oʻsha maʼno.» → «Soʻzlar boshqa, maʼno bir xil.» | minor: «oʻsha maʼno» ("that meaning") is a word-for-word calque of "same meaning"; «maʼno bir xil» is the nat… |
| C19-IERE05-1 | pieces[2].body | uz | «Kichik soʻzlar hammasini oʻzgartirishi mumkin:» → «Kichik soʻzlar maʼnoni butunlay oʻzgartirishi mumkin:» | minor: «hammasini oʻzgartirishi» is a calque of "change everything"; say what changes: the meaning |
| C19-IERE05-2 | pieces[0].body | uz | «3. Gapni teskari qurish:» → «3. Gapni majhul nisbatda qurish:» | minor: «teskari qurish» ("build backwards") does not name the change; the example is the passive, «majhul nis… |
| C19-IERE05-2 | pieces[0].body | ru | «3. Предложение наоборот:» → «3. Предложение в пассиве:» | minor: «Предложение наоборот» does not name the change; the example is the passive («пассив», the term the Wr… |
| C19-IERE05-2 | pieces[1].body | uz | «2. Variantni qisma-qism tekshiring:» → «2. Variantni qismlab tekshiring:» | «qisma-qism» is not a standard form; «qismlab» (part by part) is |
| C19-IERE05-2 | pieces[1].body | uz | «2. Har bir variantni qisma-qism tekshiring.» → «2. Har bir variantni qismlab tekshiring.» | «qisma-qism» is not a standard form; «qismlab» (part by part) is |
| C19-ie12q1 … C7-ir1212 (15) | instructions | ru | «В вопросе она может быть сказана другими словами.» → «В вопросе она может быть выражена другими словами.» | «деталь ... сказана» is unidiomatic; a detail is «выражена» in other words |
| C19-ie12q1 | why | uz | «oʻn ikki esa funtdagi aʼzolik toʻlovi.» → «12 esa yillik aʼzolik toʻlovi (funtda).» | minor: «funtdagi aʼzolik toʻlovi» is a calque; the fee is yearly; digits as in the rest of the line and the o… |
| C19-ie12q3 | why | uz | «oʻttiz va oʻn — boshqa kutishlar.» → «oʻttiz va oʻn daqiqa esa kutish vaqtlari.» | «boshqa kutishlar» ("other waitings") is not natural Uzbek; the thirty and ten minutes are waiting times |
| C19-ie12q3 | why | ru | «с новой быстрой лодкой «the trip now takes twenty-five minutes». Сорок минут — прежнее время; тридцать и десять — другие ожидания.» → «с новым, более быстрым паромом «the trip now takes twenty-five minutes». Сорок минут — прежнее время; тридцать и десять минут — время ожидания.» | meaning trap: «другие ожидания» reads as "other expectations"; the thirty and ten minutes are waiting times. … |
| C19-ie51q1 | why | ru | «Совет об этом не просил;» → «Местный совет об этом не просил;» | at the start of a sentence «Совет» is first read as "advice"; «местный совет» names the council |
| C19-ie51q2 … C7-ir5120 (10) | instructions | uz | «Soʻz chegarasidan oshmang.» → «Belgilangan soʻz sonidan oshmang.» | «soʻz chegarasi» reads as "word boundary"; the limit is a number of words |
| C19-ie51q3 | why | uz | «lekin olingan kitoblar soni «hardly changed». U kitob sotib olmagan;» → «lekin oʻqishga olingan kitoblar soni «hardly changed». Yangi kutubxonachi kitob sotib olmagan;» | meaning trap: «olingan kitoblar» can read "books bought", which clashes with the next clause; «U» has no pers… |
| C19-ie51q3 | why | ru | «Книг она не покупала;» → «Новая заведующая книг не покупала;» | «она» has no person to refer to in the why (the head librarian) |
| C19-ie52q1 | why | uz | «Butun yoʻl emas, torroq emas; kelasi bahor — oʻrindiqlar uchun.» → «Butun yoʻlak emas va torroq ham emas; kelasi bahorda esa oʻrindiqlar qoʻyiladi.» | «kelasi bahor — oʻrindiqlar uchun» reads "next spring is for benches"; a footpath is «yoʻlak», «yoʻl» is a ro… |
| C19-ie52q1 | why | ru | «Не вся тропа и не уже; весной — скамейки.» → «Расширили не всю тропу, и её не сужали; весной добавят скамейки.» | meaning trap: «не уже» is first read as "not already" (уже / у́же); «весной — скамейки» is too elliptical |
| C19-IEWR01-2 | pieces[1].body | uz | «tashriflar, ming marta:» → «tashriflar soni, ming hisobida:» | meaning trap: «ming marta» means "a thousand times"; "in thousands" is «ming hisobida» |
| C19-IEWR01-2 | writing.rubric[0].ask | uz | «(akvapark keskin oʻsdi va 2022-yilga kelib birinchi oʻringa chiqdi, hayvonot bogʻi kamaydi, muzey deyarli oʻzgarmadi)» → «(akvaparkka tashriflar keskin oshdi va 2022-yilga kelib u birinchi oʻringa chiqdi, hayvonot bogʻiga tashriflar kamaydi, muzeyniki deyarli oʻzgarmadi)» | meaning trap: «hayvonot bogʻi kamaydi» reads "the zoo got smaller", «akvapark oʻsdi» "the water park grew"; i… |
| C19-IEWR01-2 | writing.rubric[0].ask | ru | «(аквапарк резко вырос и к 2022 году стал первым, зоопарк упал, музей почти не изменился)» → «(посещаемость аквапарка резко выросла, и к 2022 году он стал первым, у зоопарка она упала, у музея почти не изменилась)» | meaning trap: «зоопарк упал» reads "the zoo fell down", «аквапарк вырос» "the park itself grew"; it is the nu… |
| C19-IEWR02-2 | pieces[0].body | uz | «2. U chiziqmi (yangi joyda tugaydi) yoki aylanami (boshiga qaytadi), shuni ayting.» → «2. Jarayon chiziqli (yangi joyda tugaydi) yoki aylanma (boshiga qaytadi) ekanini ayting.» | calque: «chiziqmi / aylanami» asks "is it a line / a circle" (geometry); a process is «chiziqli» or «aylanma» |
| C19-IEWR02-2 | writing.steer | uz | «u chiziqmi yoki aylanami» → «u chiziqli jarayonmi yoki aylanma jarayonmi» | calque: «chiziq / aylana» are a line and a circle (geometry); a process is «chiziqli» or «aylanma» |
| C19-IEWR02-2 | writing.rubric[0].ask | uz | «yaʼni aylana ekanini» → «yaʼni bu aylanma jarayon ekanini» | «aylana» is a circle (geometry); a cycle is «aylanma jarayon» |
| C19-IEWR02-2 | pieces[0].body | ru | «2. Скажите, это линия (заканчивается в новом месте) или цикл (возвращается к началу).» → «2. Скажите, линейный это процесс (заканчивается в новом месте) или цикл (возвращается к началу).» | minor calque: «это линия» ("it is a line"); a process is «линейный» |
| C19-IEWR02-2 | writing.steer | ru | «линия это или цикл» → «линейный это процесс или цикл» | minor calque: «линия» ("a line"); a process is «линейный» |
| C19-IEWR03-2 | pieces[0].body | uz | «siz kamroq qoʻllaydigan qarash» → «siz kamroq qoʻllab-quvvatlaydigan qarash» | meaning trap: «qoʻllamoq» is read today as "to use, to apply" ("the view you use less"); "to support, agree w… |
| C19-IEWR03-2 | pieces[0].body | uz | «siz koʻproq qoʻllaydigan qarash» → «siz koʻproq qoʻllab-quvvatlaydigan qarash» | meaning trap: «qoʻllamoq» is read today as "to use, to apply" ("the view you use less"); "to support, agree w… |
| C19-IEWR03-2 | pieces[1].body | uz | «muallif kamroq qoʻllaydigan qarash» → «muallif kamroq qoʻllab-quvvatlaydigan qarash» | meaning trap: «qoʻllamoq» is read today as "to use, to apply" ("the view you use less"); "to support, agree w… |
| C19-IEWR03-2 | pieces[2].body | uz | «Siz qoʻllamaydigan qarashga» → «Siz qoʻllab-quvvatlamaydigan qarashga» | meaning trap: «qoʻllamoq» is read today as "to use, to apply" ("the view you use less"); "to support, agree w… |
| C19-IEWR03-2 | writing.steer | uz | «siz KAMROQ qoʻllaydigan qarash» → «siz KAMROQ qoʻllab-quvvatlaydigan qarash» | meaning trap: «qoʻllamoq» is read today as "to use, to apply" ("the view you use less"); "to support, agree w… |
| C19-IEWR03-2 | pieces[0].body | uz | «adolatli tushuntirilgan» → «xolis tushuntirilgan» | "fairly" here means without bias: «xolis»; «adolatli» is "just" (moral) |
| C19-IEWR03-2 | pieces[1].body | uz | «xatboshi bu qarashni adolatli tushuntiradi» → «xatboshi bu qarashni xolis tushuntiradi» | "fairly" here means without bias: «xolis»; «adolatli» is "just" (moral) |
| C19-IEWR03-2 | pieces[2].body | uz | «muhokama adolatli boʻlmaydi» → «muhokama bir tomonlama boʻlib qoladi» | "fairly" here means without bias: «xolis»; «adolatli» is "just" (moral); the point is a one-sided discussion |
| C19-IEWR03-2 | writing.steer | uz | «Uni adolatli tushuntiring» → «Uni xolis tushuntiring» | "fairly" here means without bias: «xolis»; «adolatli» is "just" (moral) |
| C19-IEWR03-2 | writing.rubric[0].ask | uz | «adolatli tushuntirdingizmi» → «xolis tushuntirdingizmi» | "fairly" here means without bias: «xolis»; «adolatli» is "just" (moral) |
| C19-IEWR03-2 | pieces[0].body | ru | «объяснённая честно» → «изложенная объективно» | "fairly" here means without bias: «объективно»; «честно» is "honestly", and «нечестное обсуждение» reads as a… |
| C19-IEWR03-2 | pieces[1].body | ru | «абзац честно объясняет эту точку зрения» → «абзац объективно излагает эту точку зрения» | "fairly" here means without bias: «объективно»; «честно» is "honestly", and «нечестное обсуждение» reads as a… |
| C19-IEWR03-2 | pieces[2].body | ru | «обсуждение нечестное» → «обсуждение получается однобоким» | "fairly" here means without bias: «объективно»; «честно» is "honestly", and «нечестное обсуждение» reads as a… |
| C19-IEWR03-2 | writing.steer | ru | «Честно объясните её» → «Объективно изложите её» | "fairly" here means without bias: «объективно»; «честно» is "honestly", and «нечестное обсуждение» reads as a… |
| C19-IEWR03-2 | writing.rubric[0].ask | ru | «Вы честно объяснили» → «Вы объективно изложили» | "fairly" here means without bias: «объективно»; «честно» is "honestly", and «нечестное обсуждение» reads as a… |
| C19-IEWR05-1 | pieces[0].body | uz | «Yangi soʻzni maʼnosini» → «Yangi soʻzning maʼnosini» | grammar: the genitive is needed («soʻzning maʼnosi») |
| C19-IEWR05-1 | pieces[0].body | ru | «Лексика — одна из четырёх вещей, по которым оценивают ваш текст.» → «Лексика — один из четырёх критериев, по которым оценивают ваш текст.» | minor: «вещей» is a calque of "things"; the four are assessment criteria |
| C19-IEWR05-1 | writing.rubric[0].ask | uz | «18 yoshgacha boʻlganlar uchun bepul muzeylar tarafdori yoki qarshisi boʻlgan bitta aniq fikrni» → «18 yoshgacha boʻlganlar uchun muzeylarni bepul qilish foydasiga yoki unga qarshi bitta aniq fikrni» | a point («fikr») cannot be a supporter («tarafdor»); the line reads "a point that is a supporter or opponent … |
| C19-IEWR05-2 | pieces[0].body | uz | «Grammatika ikki narsa bilan birga baholanadi:» → «Grammatika bir vaqtning oʻzida ikki jihatdan baholanadi:» | meaning: «ikki narsa bilan birga baholanadi» reads "is graded together with two things"; grammar is judged on… |
| C19-IEWR05-2 | pieces[0].body | ru | «Грамматику оценивают по двум вещам сразу:» → «Грамматику оценивают сразу по двум критериям:» | minor: «вещам» is a calque of "things"; they are criteria |
| C19-IEWR05-2 | writing.rubric[0].ask | uz | «kitob oʻqish boʻsh vaqtni oʻtkazishning eng yaxshi usuli ekani tarafdori yoki qarshisi boʻlgan bitta aniq fikrni» → ««kitob oʻqish — boʻsh vaqtni oʻtkazishning eng yaxshi usuli» degan fikr foydasiga yoki unga qarshi bitta aniq dalilni» | a point («fikr») cannot be a supporter («tarafdor»); the line reads "a point that is a supporter or opponent … |
| C19-IEWR06-1 | title | uz | «va oʻzini tekshirish» → «va oʻz-oʻzini tekshirish» | «oʻzini tekshirish» reads "checking him/her"; self-check is «oʻz-oʻzini tekshirish» |
| C19-IEWR06-1 | pieces[0].body | uz | «U Task 1 dan ikki baravar koʻp hisoblanadi,» → «Bahoga u Task 1 dan ikki baravar koʻp taʼsir qiladi,» | calque of "counts twice": «koʻp hisoblanadi» reads "is considered much"; the point is its weight in the score |
| C19-IEWR06-1 | pieces[1].body | uz | «Har bir qismda ega va kesim bor» → «Har bir qismida ega va kesim bor» | grammar: the possessive is needed («qismida») |
| C19-IEWR06-1 | pieces[2].body | uz | «U qisqaroq va kamroq hisoblanadi;» → «U qisqaroq va bahoga taʼsiri kamroq;» | calque of "counts twice": «koʻp hisoblanadi» reads "is considered much"; the point is its weight in the score |
| C19-iw61q1 | why | uz | «Task 2 ikki baravar koʻp hisoblanadi,» → «Task 2 bahoga ikki baravar koʻp taʼsir qiladi,» | calque of "counts twice": «koʻp hisoblanadi» reads "is considered much"; the point is its weight in the score |
| C19-iw12q1 | why | uz | «issiq shokolad 100 dan 300 ga oʻsdi» → «issiq shokolad savdosi 100 dan 300 ga oʻsdi» | «issiq shokolad oʻsdi» says the drink grew; it is its sales |
| C19-iw12q1 | why | ru | «горячий шоколад вырос со 100 до 300» → «продажи горячего шоколада выросли со 100 до 300» | «горячий шоколад вырос» says the drink grew; it is its sales |
| C19-iw51q1 | why | uz | ««Beneficial for» velosiped aynan qanday foydali ekanini aytadi: u tanaga yordam beradi.» → ««Beneficial for» velosipedda yurish aynan qanday foydali ekanini aytadi: u tanaga foyda keltiradi.» | «velosiped» is the bicycle itself; the sentence is about cycling («velosipedda yurish») |
| C19-iw51q1 | why | ru | «чем полезен велосипед: он помогает телу.» → «чем полезна езда на велосипеде: она помогает телу.» | «велосипед» is the bicycle itself; the sentence is about cycling |
| C19-iw51q1 | why | ru | ««precious» значит «дорогой» или «редкий»» → ««precious» значит «ценный» или «редкий»» | minor: «дорогой» reads first as "expensive"; precious is «ценный» |
| C19-iw52q1 | why | ru | «В каждом из остальных нарушено одно из этого.» → «В каждом из остальных нарушено одно из этих правил.» | «одно из этого» is ungrammatical; "one of these rules" |
| C7-ir1209 | why | uz | «Omar Said — devor qurgan» → «Omar Said — panjara qurgan» | accuracy: the text says a fence («panjara»); «devor» is a wall |
| C7-ir1210 | why | uz | «Uchdan biri — Wardle» → «Uchdan biridan sal kami — Wardle» | accuracy: the text and the option say just under a third |
| C7-ir1210 | why | ru | «Треть — Wardle» → «Чуть меньше трети — Wardle» | accuracy: the text and the option say just under a third |
| C7-ir5111 | why | ru | «до школы людям было «easier to reach».» → «до школы людям было проще добраться («easier to reach»).» | an English phrase is used as the Russian predicate; the sentence does not read as Russian |
| C7-ir5114 | why | ru | «Подвал — сырая ошибка;» → «Подвал оказался сырым, это была ошибка;» | «сырая ошибка» reads as an odd pun ("a damp / raw mistake") |
| C7-ir5119 | why | uz | «Un va starter — sir emasligi aytilgan;» → «Un va xamirturush (starter) sir emasligi aytilgan;» | English left on the uz line: «starter» is «xamirturush» |
| C7-ir5202 | why | ru | «Он не продаёт мёд и не оставляет его себе.» → «Он не продаёт мёд и не оставляет большую часть себе.» | accuracy: he gives most of it away, so "keeps none" overstates (the uz line says it right) |
| C7-ir5214 | why | ru | «ровные поля пересаживали.» → «ровные поля много раз засаживали заново.» | «пересаживать» is to transplant; the fields were replanted («засаживали заново») |
| C7-ir5217 | why | uz | «ov kamaygan.» → «baliq ovi kamaygan.» | «ov» alone is hunting; the catch is «baliq ovi» |

</details>

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings, 280 notes** (before this pass 0, 858, 278;
  the two more notes are `file.skipped` for the two `RECONCILE-p10.md` files, this one and the SAT R&W checker's in C6), and no finding of
  any severity on any id of this pass or its three files (`.superpowers/p10/check-ie-2/validate-before.log`, `validate-final.log`).
- `node .superpowers/p10/check-ie-2/lessons-kc2.mjs --final`: 10 lessons, 60 reserve items of 60, 0 problems.
- Vitest, one process, `ANTHROPIC_API_KEY` empty: the authors' `tests/unit/content/p10-iere.test.ts` and `p10-iewr.test.ts`, **2 files,
  26 tests passed** (`vitest-authors.log`). `p10-iere` already pinned both states (a status from the ladder; a draft held back, a keyed
  lesson served with nothing unserved). `p10-iewr` pinned the draft state (`key_check_2: null`, `status: 'draft'` on the lessons and
  items, and "the real loader holds the seven back"); checker 2 changed those three pins to what `p10-iere` and the P8b tests assert: a
  status from the ladder, on a served record two blind checks, a draft held back and never served, a keyed lesson served. Nothing else in
  that file changed.
- Vitest, one process: `bank`, `c19-loader`, `committed-content`, `keycheck`, `lessons-course`, `no-content-leak`, `reconcile`,
  `lesson-asks-its-page`, `lesson-teaches`, `lesson-c19-14`, `lesson-c19-5-notes`: **11 files, 94 tests passed** (`vitest-regress.log`).
- **Fails, the integrator's:** pins of the served course that this pass and the SAT R&W round move (`p6b-fixed-text`: 5 of 11 fail;
  `lessons-writing/content`: 1 of 5; `vitest-regress.log`).
  - From this pass (the 10 lessons are now served): `tests/unit/engine-server/p6b-fixed-text.test.ts`, 3 tests (IELTS Reading lessons
    served 7, now 10, at lines 69 and 114; the English turn's list, at line 136: it now holds `C19-IERE01-2`, `IERE05-1`, `IERE05-2`), and
    `tests/unit/lessons-writing/content.test.ts`, 1 test (line 43: the `ielts_w` course has 11 served lessons, not C19-8's four).
  - From the SAT R&W round (not this pass): `p6b-fixed-text.test.ts` line 86 (each reserve 20; RWCS01-1 and the other lesson 1s now have
    40) and line 104 (`pool({ purpose: 'practice', bank: 'C6' })` has 360, not 120). The second is real: **`C6/C6-16.json` and
    `C6-17.json` are not in `RESERVE_FILES`**, so with them `verified_auto` the C6 practice pool draws those 240 reserve items.
  This pass changes no `src/**` code and no test but `p10-iewr.test.ts`.

## Not done here

- The count pins above (`p6b-fixed-text`, `lessons-writing/content`) and `RESERVE_FILES` for C6-16 and C6-17: for the integrator.
- The content `README.md` register rows for C19 batches 22-23 and C7 batch 11.
- The native read of the uz and ru lines (§9.1 step 5), and the two older instruction lines named above.
- The teacher look that makes a record `reviewed`.
