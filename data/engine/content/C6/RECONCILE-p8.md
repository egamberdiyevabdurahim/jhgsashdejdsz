# C6: key check 2 of the P8 reserve items (14 Oct 2026)

P8 (SPEC-lessons rev. 2, §4.5, §9.1 step 3, §9.4; `.superpowers/p8/PLAN.md` §1.2, §2) gave each new SAT Reading and Writing lesson 2 and 3
twenty C6 items of its own: its test and homework draw only on them (`reserve`). P8 blind checkers 1 and 2 keyed them with the lessons'
piece questions; the lessons are in `C19/RECONCILE-p8.md`, part 1.

| File | Commit | Author | Items | Lessons (20 each) |
|---|---|---|---|---|
| `C6-10.json` (batch 10) | `1c8f6014` | `agent:p8-a1` | `C6-cs1201` … `cs1220`, `cs1301` … `cs1320`, `cs2201` … `cs2220`, `cs2301` … `cs2320` | `C19-RWCS01-2`, `-3`, `C19-RWCS02-2`, `-3` |
| `C6-11.json` (batch 11) | `b053f25c` | `agent:p8-a2` | `C6-ii1201` … `ii2320` (the same pattern) | `C19-RWII01-2`, `-3`, `C19-RWII02-2`, `-3` |
| `C6-12.json` (batch 12) | `2a8b43a6` | `agent:p8-a3` | `C6-se1201` … `se2320` (the same pattern) | `C19-RWSE01-2`, `-3`, `C19-RWSE02-2`, `-3` |

Before this pass all 240 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. Each lesson 2 has 5 easy,
9 medium and 6 hard items, each lesson 3 has 2, 8 and 10. `C6-ii2201` … `ii2220` are textual evidence only and `C6-ii2301` … `ii2320`
quantitative only (15 tables and 5 described graphs).

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P8s1 (checker 1) | `.blind/C6-P8s1.json` (the whole bank, 480 items) | `.blind/C6-P8s1.answers.json` |
| P8s2 (checker 2, who ran the reconcile and wrote this file) | `.blind/C6-P8s2.json` (`npx tsx scripts/content/blind.ts C6 P8s2 --pending`: the 240 items without two checks) | `.blind/C6-P8s2.answers.json` |

Each solver was a separate agent run, and neither was an author's session (D26; `keycheck.ts`). P8s2 opened neither `.blind/.map-*` nor
the C6-10, C6-11 and C6-12 records nor the authors' ledgers and sources before it wrote its answers, which it wrote before it read
P8s1's. P8s2 worked every table and graph item by hand from the copy (each rate, difference and average below).

## The decision

`npx tsx scripts/content/reconcile.ts C6 P8s1 P8s2 --write` gave **480 items: verified 240, quarantine 0, pending 0, blocked 0,
skipped 240.** The skipped are the 240 earlier items, already `verified_auto` (C6-1 … C6-9). **Both solvers chose the key on all 240
items.** No answer was stale, and neither answers file raises `two_defensible`, `unanswerable` or `no_passage_needed` (no item has a
`passage_id`: each text is in its stem).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **240** | `key_check_2: "blind:P8s1+P8s2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | 0 | none |

By lesson: 20/20 in each of the 12. By level: easy 42/42, medium 102/102, hard 96/96 (six lessons 2 at 5/9/6 and six lessons 3 at
2/8/10). The diff of each item is exactly `status`, `key_check_2`, the comma after `version` and the new `key_check_2_version`; no number
literal changed, and nothing else in an item changed. The `note` of each file now says the key check is done (a text edit, checked by
parsing). The decisions are kept in `.superpowers/p8/kc2/C6-decisions.json`.

**Before anything serves them:** `C6/C6-10.json`, `C6-11.json` and `C6-12.json` are not yet in `RESERVE_FILES`
(`src/server/content/bank.ts` line 126; PLAN §8 item 1, the integrator's). Until they are, the C6 practice pool draws these 240 items
(`pool({ purpose: 'practice', bank: 'C6' })` gives 360, not 120), and `tests/unit/engine-server/p6b-fixed-text.test.ts` fails on it.
P6 phase 1b keyed C6-7 … C6-9 the same way before its integration reserved them (`004a141e`, then `f5a53654`).

## What P8s2 weighed (none a flag)

| Item | The near option | Why the key is the only one |
|---|---|---|
| C6-cs1303 | "mildly pleased" | "expected polite words at most, never such high praise": strong surprise, so "astonished" |
| C6-cs1320 | "identical" | the catalogue "leaves open" that the bowl came from elsewhere: "consistent", not "identical" |
| C6-cs2216 | "the director's reason" | that reason is sentence 3; sentence 2 ("The tools are plain …") is why visitors walk past |
| C6-cs2210 | "the problem he later faced" | sentence 2 ("study at any time and in his pajamas") is why he expected it to be easier |
| C6-ii2218 | "the least water, the most mistakes" | that supports the coach; extra water as a reward for good passing reverses the cause |
| C6-ii2310 | "more than 30 fewer" | Monday 40, 46, 38, 30 against Friday 18, 15, 10, 6: fewer than half every hour (18 < 20, 15 < 23, 10 < 19, 6 < 15), but 22 fewer at 14:00 |
| C6-ii2317 | "Zafar 5.0, Anora 5.6" | both average 5.3 (21.2 / 4): no better average |
| C6-ii2312 | "7B, 7 per student" | 150/30 = 5, 168/24 = 7, 140/28 = 5, 160/20 = 8: 7D |
| C6-ii2318 | "rose by 330" | 640 − 210 = 430 and 380 − 330 = 50 |
| C6-se1205 | "village;" | the end of the sentence renames the poem: an appositive after a comma; a semicolon needs a clause after it |
| C6-se1208 / se1216 | the comma pair / no commas | three older brothers: "brother Bahrom" picks one (no commas); only one sister: "sister, Lola," adds her name |
| C6-se1305 | "point that" | "one weak point that it depended …" is no relative clause; the dash introduces the explanation |
| C6-se1315 | "route, and as a result," | "changed its route and, as a result, now stops": one subject, two verbs, the phrase set off by a pair of commas |
| C6-se2318 / se2319 | "its" / "whose" | "it's kept" = it has kept; "who's organized" = who has organized |

The full answers with each solver's verdict are below, from the decisions log.

## Uzbek

The uz lint over the six P8 R&W files (`C19/RECONCILE-p8.md`, "Uzbek") found nothing in Uzbek. In the whys of `C6-se2304`, `se2305`,
`se2308`, `se2315` and `se2319` the quoted English («whoʼs», «teacherʼs», «ʼs») carries U+02BC as its apostrophe, by the authors' rule
for uz strings; read as English, each is right. The native read of uz and ru (§9.1 step 5) is still to do.

## Checks after the write

`validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings, 270 notes (the P8 baseline), none on these ids or files.
`reconcile.ts C6 P8s1 P8s2 --audit`: 360 verified; the 120 it lists as differing are `C6-cse001` … `C6-eih010`, the P5 items whose
`blind:2/2` record carries no `key_check_2_version` (the audit re-decides them with no answer in this pass); none is an id of this pass.

## The 240 keys

#### C19-RWCS01-2 (C6-10.json, words_in_context; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-cs1201 | easy | clear | key | key |
| C6-cs1202 | easy | dried out | key | key |
| C6-cs1203 | easy | friendly | key | key |
| C6-cs1204 | easy | convenient | key | key |
| C6-cs1205 | easy | reliable | key | key |
| C6-cs1206 | medium | memorable | key | key |
| C6-cs1207 | medium | restless | key | key |
| C6-cs1208 | medium | safe | key | key |
| C6-cs1209 | medium | modest | key | key |
| C6-cs1210 | medium | trustworthy | key | key |
| C6-cs1211 | medium | fast-paced | key | key |
| C6-cs1212 | medium | confusing | key | key |
| C6-cs1213 | medium | discouraged | key | key |
| C6-cs1214 | medium | relief | key | key |
| C6-cs1215 | hard | lightweight | key | key |
| C6-cs1216 | hard | well preserved | key | key |
| C6-cs1217 | hard | cautious | key | key |
| C6-cs1218 | hard | precarious | key | key |
| C6-cs1219 | hard | conservative | key | key |
| C6-cs1220 | hard | dismayed | key | key |

#### C19-RWCS01-3 (C6-10.json, words_in_context; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-cs1301 | easy | damp | key | key |
| C6-cs1302 | easy | resourceful | key | key |
| C6-cs1303 | medium | astonished | key | key |
| C6-cs1304 | medium | concerned | key | key |
| C6-cs1305 | medium | lively | key | key |
| C6-cs1306 | medium | thunderous | key | key |
| C6-cs1307 | medium | softened | key | key |
| C6-cs1308 | medium | unsatisfactory | key | key |
| C6-cs1309 | medium | reluctant | key | key |
| C6-cs1310 | medium | constructive | key | key |
| C6-cs1311 | hard | measured | key | key |
| C6-cs1312 | hard | concise | key | key |
| C6-cs1313 | hard | skeptical | key | key |
| C6-cs1314 | hard | understated | key | key |
| C6-cs1315 | hard | sparse | key | key |
| C6-cs1316 | hard | tentative | key | key |
| C6-cs1317 | hard | discourage | key | key |
| C6-cs1318 | hard | meager | key | key |
| C6-cs1319 | hard | candid | key | key |
| C6-cs1320 | hard | consistent | key | key |

#### C19-RWCS02-2 (C6-10.json, text_structure_purpose; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-cs2201 | easy | It describes an exception to the usual pattern described before it. | key | key |
| C6-cs2202 | easy | It describes the plan Laylo made to reach her goal. | key | key |
| C6-cs2203 | easy | It describes a recent change in the building's story. | key | key |
| C6-cs2204 | easy | It presents the problem that the family later solved. | key | key |
| C6-cs2205 | easy | It gives details that support the claim made in the second sentence. | key | key |
| C6-cs2206 | medium | It presents the response to the situation described in the first sentence. | key | key |
| C6-cs2207 | medium | It gives an experience that challenges the assumption described in the first sentence. | key | key |
| C6-cs2208 | medium | It presents the turning point of the match. | key | key |
| C6-cs2209 | medium | It gives the reasons behind the moves mentioned in the first sentence. | key | key |
| C6-cs2210 | medium | It gives a reason for the expectation stated in the first sentence. | key | key |
| C6-cs2211 | medium | It adds a limitation to the achievement described in the second sentence. | key | key |
| C6-cs2212 | medium | It confirms that the bridge has achieved part of its purpose. | key | key |
| C6-cs2213 | medium | It describes the advice that led to the change shown in the third sentence. | key | key |
| C6-cs2214 | medium | It gives an example that supports the grandmother's view. | key | key |
| C6-cs2215 | hard | It provides the evidence behind the engineer's disagreement. | key | key |
| C6-cs2216 | hard | It suggests why visitors might overlook the display mentioned in the first sentence. | key | key |
| C6-cs2217 | hard | It marks the start of a shift in the narrator's feelings toward the city. | key | key |
| C6-cs2218 | hard | It describes a personal experience that runs counter to a common recommendation. | key | key |
| C6-cs2219 | hard | It shows that the library's origin is still remembered despite its growth. | key | key |
| C6-cs2220 | hard | It offers an alternative explanation for the pattern described in the first sentence. | key | key |

#### C19-RWCS02-3 (C6-10.json, text_structure_purpose; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-cs2301 | easy | To show how students' expectations about a rule turned out to be wrong | key | key |
| C6-cs2302 | easy | It describes a girl's belief about herself, then shows how a new method changed her res… | key | key |
| C6-cs2303 | medium | It describes a limit on the club's training, then explains how the club used the time t… | key | key |
| C6-cs2304 | medium | To explain the reason for a feature of the village's houses | key | key |
| C6-cs2305 | medium | To present evidence that casts doubt on a family story | key | key |
| C6-cs2306 | medium | It states a program's promise, then reports that the promise was met for some students … | key | key |
| C6-cs2307 | medium | To describe a monthly custom on one street | key | key |
| C6-cs2308 | medium | It presents a problem, describes an attempt that failed, and then describes a solution … | key | key |
| C6-cs2309 | medium | To argue for a change in the library's opening hours | key | key |
| C6-cs2310 | medium | It presents a common view of the cats, then gives one person's reason to see them more … | key | key |
| C6-cs2311 | hard | It states how a document was long understood, then reports a discovery that reveals a s… | key | key |
| C6-cs2312 | hard | To point out that a report's claim, though accurate, gives an incomplete picture | key | key |
| C6-cs2313 | hard | It shows a character's first refusal, then his quiet watching, and finally a change in … | key | key |
| C6-cs2314 | hard | To show that a method that looks informal follows a careful logic | key | key |
| C6-cs2315 | hard | It introduces a disagreement, presents each side's view, and then describes a compromise. | key | key |
| C6-cs2316 | hard | To show that finding a problem's real cause led to a better fix than the obvious one | key | key |
| C6-cs2317 | hard | It explains why a narrator seems trustworthy, then reveals that he is not. | key | key |
| C6-cs2318 | hard | To show that a common view of practice needs a qualification | key | key |
| C6-cs2319 | hard | It describes a situation, presents a proposal to address it, and then reports an object… | key | key |
| C6-cs2320 | hard | To present a folk version of a village's origin that differs from the usual account | key | key |

#### C19-RWII01-2 (C6-11.json, central_ideas_details; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-ii1201 | easy | The family's hens lay fewer eggs in the winter months. | key | key |
| C6-ii1202 | easy | A neighbor drives her back in a delivery van. | key | key |
| C6-ii1203 | easy | The club has its own sets, so members do not need to bring one. | key | key |
| C6-ii1204 | easy | On Sundays, when he rereads what he wrote that week | key | key |
| C6-ii1205 | easy | The children now use more parts of the playground than before. | key | key |
| C6-ii1206 | medium | Most of them came from places other than her own city. | key | key |
| C6-ii1207 | medium | The cases are now lit from inside, and the labels are easier to read. | key | key |
| C6-ii1208 | medium | His bicycle chain broke, so he had to walk. | key | key |
| C6-ii1209 | medium | Their stems leaned toward the window. | key | key |
| C6-ii1210 | medium | He saw college students pass his shop after their evening classes. | key | key |
| C6-ii1211 | medium | She lays out the needles and threads as her grandmother did, then puts them back unused. | key | key |
| C6-ii1212 | medium | They were taken out of the fountain and planted beside the river. | key | key |
| C6-ii1213 | medium | Let the glue dry for a full day before painting a model | key | key |
| C6-ii1214 | medium | A strong wind during the rehearsal made the courtyard unsuitable. | key | key |
| C6-ii1215 | hard | The town owned the building, but the land around it had not been sold. | key | key |
| C6-ii1216 | hard | He records each owner's name, as if the radios might still be collected. | key | key |
| C6-ii1217 | hard | Drying lets the farmers sell a large harvest slowly, not all at once. | key | key |
| C6-ii1218 | hard | The games borrowed most were long strategy games that children rarely picked. | key | key |
| C6-ii1219 | hard | Waste that was not paper went into them because the bins looked alike. | key | key |
| C6-ii1220 | hard | She had noticed where her aunt put them when the holiday began. | key | key |

#### C19-RWII01-3 (C6-11.json, central_ideas_details; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-ii1301 | easy | Unlike what many people expect of cats, Momo enjoys water. | key | key |
| C6-ii1302 | easy | The small shop does well because it offers what the supermarket does not. | key | key |
| C6-ii1303 | medium | Morning training, once thought too tiring, worked well for the team. | key | key |
| C6-ii1304 | medium | Quiet students may have much to say when they get another way to share it. | key | key |
| C6-ii1305 | medium | Ilhom freezes before the guests, but his sister's familiar nod helps him begin. | key | key |
| C6-ii1306 | medium | The village is worth a visit in itself, not only as a stop before the climb. | key | key |
| C6-ii1307 | medium | The class drew beginners, not just experienced cooks, and they wanted more. | key | key |
| C6-ii1308 | medium | Saida finds that she misses the old man she used to hurry away from. | key | key |
| C6-ii1309 | medium | Even a small space can hold a garden that produces a lot of food. | key | key |
| C6-ii1310 | medium | The students' own play showed that audiences would come to something new. | key | key |
| C6-ii1311 | hard | The mud-brick houses last because they are made to be repaired again and again. | key | key |
| C6-ii1312 | hard | Although Javlon says he does not care, leaving the village is hard for him. | key | key |
| C6-ii1313 | hard | In the class's test, step counters raised walking only for a short time. | key | key |
| C6-ii1314 | hard | Umida's job is much broader than the usual picture of a librarian. | key | key |
| C6-ii1315 | hard | Nodira's method, doubted at first, proved better over time and spread. | key | key |
| C6-ii1316 | hard | Zebo is nervous about the letter but finally finds the courage to open it. | key | key |
| C6-ii1317 | hard | Buses come less often now, but they keep to time, so passengers wait less. | key | key |
| C6-ii1318 | hard | Bahrom carves by hand because spoons cut along the grain last much longer. | key | key |
| C6-ii1319 | hard | Nargiza acts as if she dislikes the homework, but she is eager to do it. | key | key |
| C6-ii1320 | hard | The trees were planted for shade, and people now walk there at noon again. | key | key |

#### C19-RWII02-2 (C6-11.json, command_of_evidence_textual; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-ii2201 | easy | New books displayed covers out were borrowed twice as often as the same titles shelved … | key | key |
| C6-ii2202 | easy | After three weeks, seedlings watered a little each day were taller than seedlings given… | key | key |
| C6-ii2203 | easy | When students were given random seats for a month, those moved to the front row did no … | key | key |
| C6-ii2204 | easy | "He left his keys in the door again, and his lunch was still on the kitchen table when … | key | key |
| C6-ii2205 | easy | On hot days with the bowl outside, more customers with dogs came in than on hot days wi… | key | key |
| C6-ii2206 | medium | In the same year, the town's schools began giving every pupil a weekly swimming lesson … | key | key |
| C6-ii2207 | medium | "The clouds were edged with gold, / dark and heavy at their hearts, and moving toward us." | key | key |
| C6-ii2208 | medium | On afternoons when no one came to feed them at the north end, the ducks spread out acro… | key | key |
| C6-ii2209 | medium | Students carrying the same weight of books had as much back pain with the new backpack … | key | key |
| C6-ii2210 | medium | "She made me rewrite every page that had a blot on it, then sat beside me until midnigh… | key | key |
| C6-ii2211 | medium | After the stickers went up, lights were left on in empty classrooms half as often as be… | key | key |
| C6-ii2212 | medium | Hardly any books were borrowed on Sundays; the rise came on weekdays, after a large del… | key | key |
| C6-ii2213 | medium | Dough from the same recipe rose highest on the warmest days and least on the coldest days. | key | key |
| C6-ii2214 | medium | "When the list went up without his name, Aziz read it twice, then turned to us and joke… | key | key |
| C6-ii2215 | hard | Classmates given a plant they never watered or touched felt just as calm as those who l… | key | key |
| C6-ii2216 | hard | "Its stones are rounded smooth by a hundred years of carts, / and still each morning it… | key | key |
| C6-ii2217 | hard | With the courtyard lights on, more stars were counted from the roof; with them off, the… | key | key |
| C6-ii2218 | hard | Players who passed accurately were given extra water breaks as a reward during training. | key | key |
| C6-ii2219 | hard | "In September I ate my lunch alone on the steps; by summer, the woman at the bakery was… | key | key |
| C6-ii2220 | hard | After a term with the app, slow readers read much faster, while fast readers' speed har… | key | key |

#### C19-RWII02-3 (C6-11.json, command_of_evidence_quantitative; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-ii2301 | easy | Lola went from 3 to 5, Sardor from 4 to 6 and Yulduz from 2 to 4. | key | key |
| C6-ii2302 | easy | most of the tits came to the fat-ball feeder, 11 of the 14. | key | key |
| C6-ii2303 | medium | in the warm week salad was, with 150 plates sold against 70 bowls of soup. | key | key |
| C6-ii2304 | medium | Plant A grew 5, 6 and 7 cm in the three weeks, while plant B grew 3, 2 and 1 cm. | key | key |
| C6-ii2305 | medium | bus 2 has more empty seats on an average trip: 12, compared with 4 on bus 1. | key | key |
| C6-ii2306 | medium | Volleyball rose from 18 to 27 members, and table tennis fell from 12 to 9. | key | key |
| C6-ii2307 | medium | chess was chosen more often, by 26 students against 12 for football. | key | key |
| C6-ii2308 | medium | more than doubled, from 5 to 12, while the grade 11 number rose only from 9 to 13. | key | key |
| C6-ii2309 | medium | In January it used 180 kWh at night and 120 in the day; in June, 90 at night and 150 in… | key | key |
| C6-ii2310 | medium | there were fewer than half as many students on Friday as on Monday. | key | key |
| C6-ii2311 | hard | even the highest day of week 2, at 270 liters, was below the lowest day of week 1, at 3… | key | key |
| C6-ii2312 | hard | 7D, with 8 bottles per student, compared with 7 for 7B. | key | key |
| C6-ii2313 | hard | 70 minutes at room temperature and 52 in the sun, longer than glass or plastic in each … | key | key |
| C6-ii2314 | hard | On Friday, at 34 °C, the café sold 40 ice creams, fewer than the 65 sold on Wednesday a… | key | key |
| C6-ii2315 | hard | a larger share of grade 10 students said yes: half, compared with a quarter in grade 7. | key | key |
| C6-ii2316 | hard | January was the first month in which 8A read more books than 8B, 31 against 27. | key | key |
| C6-ii2317 | hard | had a better average time: both averaged 5.3 minutes over the four days. | key | key |
| C6-ii2318 | hard | River Park's average rose by 430 visitors a day at weekends, but Hill Park's rose by on… | key | key |
| C6-ii2319 | hard | it rose from 14 to 21 members, while robotics fell from 25 to 22 and music from 18 to 16. | key | key |
| C6-ii2320 | hard | Diyora sold 24 cups an hour, while Shoxrux sold 20 cups an hour. | key | key |

#### C19-RWSE01-2 (C6-12.json, boundaries; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-se1201 | easy | oven— | key | key |
| C6-se1202 | easy | house, | key | key |
| C6-se1203 | easy | committee) | key | key |
| C6-se1204 | easy | students who | key | key |
| C6-se1205 | easy | village, | key | key |
| C6-se1206 | medium | railings— | key | key |
| C6-se1207 | medium | new coach Gulnora Aminova | key | key |
| C6-se1208 | medium | brother Bahrom | key | key |
| C6-se1209 | medium | butter ( | key | key |
| C6-se1210 | medium | spring, | key | key |
| C6-se1211 | medium | runner, | key | key |
| C6-se1212 | medium | one that | key | key |
| C6-se1213 | medium | year— | key | key |
| C6-se1214 | medium | month) | key | key |
| C6-se1215 | hard | free— | key | key |
| C6-se1216 | hard | sister, Lola, | key | key |
| C6-se1217 | hard | mind— | key | key |
| C6-se1218 | hard | mill, which | key | key |
| C6-se1219 | hard | years— | key | key |
| C6-se1220 | hard | years, | key | key |

#### C19-RWSE01-3 (C6-12.json, boundaries; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-se1301 | easy | morning; therefore, | key | key |
| C6-se1302 | easy | missing: | key | key |
| C6-se1303 | medium | however, | key | key |
| C6-se1304 | medium | meeting; for example, | key | key |
| C6-se1305 | medium | point— | key | key |
| C6-se1306 | medium | shirts; instead, | key | key |
| C6-se1307 | medium | careful; the | key | key |
| C6-se1308 | medium | December; as a result, | key | key |
| C6-se1309 | medium | three things: | key | key |
| C6-se1310 | medium | stone; in fact, | key | key |
| C6-se1311 | hard | term; a few students, | key | key |
| C6-se1312 | hard | table; by contrast, | key | key |
| C6-se1313 | hard | conclusion: | key | key |
| C6-se1314 | hard | expected— | key | key |
| C6-se1315 | hard | route and, | key | key |
| C6-se1316 | hard | yard; nevertheless, | key | key |
| C6-se1317 | hard | July— | key | key |
| C6-se1318 | hard | morning; the younger ones, | key | key |
| C6-se1319 | hard | things: | key | key |
| C6-se1320 | hard | lake; however, | key | key |

#### C19-RWSE02-2 (C6-12.json, form_structure_sense; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-se2201 | easy | feeds | key | key |
| C6-se2202 | easy | has played | key | key |
| C6-se2203 | easy | was making | key | key |
| C6-se2204 | easy | were repaired | key | key |
| C6-se2205 | easy | reminded | key | key |
| C6-se2206 | medium | will have finished | key | key |
| C6-se2207 | medium | had been | key | key |
| C6-se2208 | medium | opens | key | key |
| C6-se2209 | medium | painted | key | key |
| C6-se2210 | medium | were written | key | key |
| C6-se2211 | medium | plant | key | key |
| C6-se2212 | medium | has begun | key | key |
| C6-se2213 | medium | were playing | key | key |
| C6-se2214 | medium | climbed | key | key |
| C6-se2215 | hard | has been | key | key |
| C6-se2216 | hard | will have decorated | key | key |
| C6-se2217 | hard | is being used | key | key |
| C6-se2218 | hard | had been | key | key |
| C6-se2219 | hard | were thanked | key | key |
| C6-se2220 | hard | has been kept | key | key |

#### C19-RWSE02-3 (C6-12.json, form_structure_sense; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8s1 | P8s2 |
|---|---|---|---|---|
| C6-se2301 | easy | there | key | key |
| C6-se2302 | easy | students | key | key |
| C6-se2303 | medium | its | key | key |
| C6-se2304 | medium | children's | key | key |
| C6-se2305 | medium | whose | key | key |
| C6-se2306 | medium | there | key | key |
| C6-se2307 | medium | its | key | key |
| C6-se2308 | medium | teacher's | key | key |
| C6-se2309 | medium | it's | key | key |
| C6-se2310 | medium | brothers' | key | key |
| C6-se2311 | hard | it | key | key |
| C6-se2312 | hard | its | key | key |
| C6-se2313 | hard | students' | key | key |
| C6-se2314 | hard | their | key | key |
| C6-se2315 | hard | whose | key | key |
| C6-se2316 | hard | it is | key | key |
| C6-se2317 | hard | residents' | key | key |
| C6-se2318 | hard | it's | key | key |
| C6-se2319 | hard | who's | key | key |
| C6-se2320 | hard | theirs | key | key |
