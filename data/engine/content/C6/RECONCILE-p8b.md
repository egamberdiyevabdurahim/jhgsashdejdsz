# C6: key check 2 of the P8b reserve items (14 Oct 2026)

P8b (SPEC-lessons rev. 2, §4.5, §9.1 step 3, §9.4; `.superpowers/p8b/PLAN.md` §1.1, §1.2, §2) gave each new SAT Reading and Writing
lesson 2 and 3 of the last six units twenty C6 items of its own: its test and homework draw only on them (`reserve`). P8b blind checkers
1 and 2 keyed them with the lessons' piece questions; the lessons are in `C19/RECONCILE-p8b.md`.

| File | Commit | Author | Items | Lessons (20 each) |
|---|---|---|---|---|
| `C6-13.json` (batch 13) | `2f6f0f80` | `agent:p8b-a1` | `C6-ei1201` … `ei1220`, `ei1301` … `ei1320`, `ei2201` … `ei2220`, `ei2301` … `ei2320` | `C19-RWEI01-2`, `-3`, `C19-RWEI02-2`, `-3` |
| `C6-14.json` (batch 14) | `675d8c2d` | `agent:p8b-a2` | `C6-cs3201` … `cs3220`, `cs3301` … `cs3320`, `ii3201` … `ii3220`, `ii3301` … `ii3320` | `C19-RWCS03-2`, `-3`, `C19-RWII03-2`, `-3` |
| `C6-15.json` (batch 15) | `81535990` | `agent:p8b-a3` | `C6-se3201` … `se3220`, `se3301` … `se3320`, `ei3201` … `ei3220`, `ei3301` … `ei3320` | `C19-RWSE03-2`, `-3`, `C19-RWEI03-2`, `-3` |

Before this pass all 240 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`, without a `page`. Mix
(easy/medium/hard): the B1 units' lessons 2 (`RWEI01-2`, `RWEI02-2`) 5/9/6 and lessons 3 2/8/10; the B2 units' lessons 2 2/8/10 and
lessons 3 2/6/12. Each lesson asks only its own subskill (the mixed units' lessons 2 and 3 each take one side: `RWSE03-2` Form,
Structure, and Sense, `RWSE03-3` Boundaries, `RWEI03-2` Transitions, `RWEI03-3` Rhetorical Synthesis).

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P8bs1 (checker 1) | `.blind/C6-P8bs1.json` (the whole bank, 720 items) | `.blind/C6-P8bs1.answers.json` (the 240 of this pass) |
| P8bs2 (checker 2, who ran the reconcile and wrote this file) | `.blind/C6-P8bs2.json` (`npx tsx scripts/content/blind.ts C6 P8bs2 --pending`: the 240 items without two checks) | `.blind/C6-P8bs2.answers.json` |

Each solver was a separate agent run, and neither was an author's session (D26; `keycheck.ts`). P8bs2 opened neither `.blind/.map-*`
nor the C6-13, C6-14 and C6-15 records nor the authors' ledgers, sources and tests before it wrote its answers, which it wrote before it
read P8bs1's. P8bs2 worked every number by hand from the copy (each "three times", "half", "fewer" and count below).

## The decision

`npx tsx scripts/content/reconcile.ts C6 P8bs1 P8bs2 --write` gave **720 items: verified 240, quarantine 0, pending 0, blocked 0,
skipped 480.** The skipped are the 480 earlier items, already `verified_auto` (C6-1 … C6-12). **Both solvers chose the key on all 240
items.** No answer was stale, and neither answers file raises `two_defensible`, `unanswerable` or `no_passage_needed` (no item has a
`passage_id`: each text is in its stem).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **240** | `key_check_2: "blind:P8bs1+P8bs2"`, `key_check_2_version: 1`, version 1 |
| `quarantine` | 0 | none |

By lesson: 20/20 in each of the 12. By level: easy 30/30, medium 90/90, hard 120/120. The diff of each item is exactly `status`,
`key_check_2`, the comma after `version` and the new `key_check_2_version`; nothing else in an item changed
(`.superpowers/p8b/kc2/diffcheck.mjs` against `HEAD`, 0 problems; LF, no BOM). The `note` of each file now says the key check is done (a
text edit, checked by parsing: `.superpowers/p8b/kc2/lessons-write.mjs`). The decisions are kept in
`.superpowers/p8b/kc2/C6-decisions.json`.

**Before anything serves them:** `C6/C6-13.json`, `C6-14.json` and `C6-15.json` are not yet in `RESERVE_FILES`
(`src/server/content/bank.ts`; PLAN §5 item 1, the integrator's). Until they are, the C6 practice pool draws these 240 items as practice
items, and `tests/unit/engine-server/p6b-fixed-text.test.ts` fails on it, as it did between P8's key check and P8's integration
(`C6/RECONCILE-p8.md`). The same test's `RW` and `SUB` lists still need the 12 new lessons (PLAN §5 item 2).

## What P8bs2 weighed (none a flag)

| Item | The near option | Why the key is the only one |
|---|---|---|
| C6-ei1217 | "Meanwhile," | the second sentence is a second improvement (drivers wait), not something at the same time: "Moreover," |
| C6-ei1219 | "Similarly," | the first sentence is the general claim (nothing bought from a shop); the socks ball is a case of it: "For instance," |
| C6-ei2206 | "120 cars … 40 more than on Monday" | the days are swapped: Wednesday had 80, 40 fewer than Monday's 120 |
| C6-ei2215 | "360 … 60 fewer than it lent in October" | wrong direction: October's 300 is 60 fewer than September's 360 |
| C6-ei2217 | "two years, twice as long as Akmal" | true, but about how long they have learned, not how they practice |
| C6-ei2219 | "three times as long as any other pupil" | the notes compare only Madina's 3 evenings with Rustam's 9 |
| C6-ei2310 | "quiet music helps pupils remember" | both groups remembered about 14 of 20: the notes say the opposite |
| C6-ei2313 | (the method, the two halves) | 15 against 6 is "more than twice"; the other options give the method or a claim the notes do not hold |
| C6-cs3309 | "frosts now end earlier" | Text 2 says the frosts "have little to do with it" and never grants the earlier end; both grant only the earlier sowing |
| C6-cs3319 | "talks with parents teach more" | Text 1 says a lesson from wasting money teaches what no talk could; both hold that pocket money teaches |
| C6-ii3303 | "washed all the dishes" | he came home at five as usual, so he did not work late, so he cooked, so he did not wash |
| C6-ii3304 | "after about one week" | 6,000 books at 200 a day is 30 days: no earlier than about a month |
| C6-ii3307 | "the roses and the ferns will both flower" | the rule covers plants with more than six hours of sun; it says nothing of the ferns |
| C6-ii3311 | "has won enough games" | six games, four lost, no draws: two wins, three needed |
| C6-ii3315 | "the school is never open on Saturdays" | "sell out only on days when the school is open": a sell-out means the school was open |
| C6-ii3319 | "September of her ninth-grade year" | joined in September of grade 8; two full years end in September of grade 10, when a chair is chosen |
| C6-se3203 | "his grandmother sent him straight to the shower" | "Covered in mud" describes Mansur: only "he was sent … by his grandmother" puts him right after the comma |
| C6-se3217 | "nor did it mention" | "It neither showed … nor mentioned": the two verbs in the same shape |
| C6-se3312 | "are:" | the colon must follow a complete sentence ("The three rules … are simple"), not split "are" from its complement |
| C6-se3316 | "feast; the" | a semicolon needs a sentence after it; the dash after the complete sentence introduces the list |
| C6-ei3203 | "However," | "did not simply patch …"; the second sentence goes further: "In fact," |
| C6-ei3215 | "Specifically," | eight slopes at four days each is a 32-day round, so each slope rests about four weeks: a result, "Thus," |
| C6-ei3219 | "In contrast," | the lost leaves bear out the doubters in part before "however" turns: "Indeed," |
| C6-ei3304, ei3308, ei3311, ei3315, ei3319 | the same facts with the clauses swapped | "emphasize X while acknowledging Y": X in the main clause, Y in the "although/though" clause; the swapped sentence emphasizes Y |

## Uzbek

The uz lint over the six P8b files (`C19/RECONCILE-p8b.md`, "Uzbek") found nothing in Uzbek in these items: 0 findings and nothing to
look at in C6-13, C6-14 and C6-15. The native read of uz and ru (§9.1 step 5) is still to do.

## Checks after the write

`validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings, 275 notes (the P8b baseline), none on these ids or files.
`reconcile.ts C6 P8bs1 P8bs2 --audit`: 600 verified; the 120 it lists as differing are `C6-cse001` … `C6-eih010`, the P5 items whose
`blind:2/2` record carries no `key_check_2_version` (the audit re-decides them with no answer in this pass, as at P8); none is an id
of this pass.

## The 240 keys

Each lesson's 20 items, the key (options[0]), each solver's verdict from the decisions log, and P8bs2's own reading from its answers
file (written blind).

#### C19-RWEI01-2 (C6-13.json, transitions; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ei1201 | easy | Finally, | key | key | finally: last step |
| C6-ei1202 | easy | For example, | key | key | for example: brother hides from old cat is a case of fear |
| C6-ei1203 | easy | In addition, | key | key | in addition: samsa a second product |
| C6-ei1204 | easy | Meanwhile, | key | key | meanwhile: same time |
| C6-ei1205 | easy | Later, | key | key | later: March then October |
| C6-ei1206 | medium | Previously, | key | key | previously: had sung before September |
| C6-ei1207 | medium | For example, | key | key | for example: benches case of small jobs |
| C6-ei1208 | medium | Moreover, | key | key | moreover: second good point |
| C6-ei1209 | medium | Meanwhile, | key | key | meanwhile: same moment |
| C6-ei1210 | medium | Afterward, | key | key | afterward: next step |
| C6-ei1211 | medium | For instance, | key | key | for instance: jars are a case of second life |
| C6-ei1212 | medium | Earlier, | key | key | earlier: that afternoon before eight |
| C6-ei1213 | medium | In addition, | key | key | in addition: a second new thing |
| C6-ei1214 | medium | Finally, | key | key | finally: last step |
| C6-ei1215 | hard | For example, | key | key | for example: timetable change case of small change |
| C6-ei1216 | hard | Previously, | key | key | previously: had guessed before |
| C6-ei1217 | hard | Moreover, | key | key | moreover: second improvement |
| C6-ei1218 | hard | Meanwhile, | key | key | meanwhile: same hour |
| C6-ei1219 | hard | For instance, | key | key | for instance: socks ball case of nothing bought |
| C6-ei1220 | hard | In addition, | key | key | in addition: second gain |

#### C19-RWEI01-3 (C6-13.json, transitions; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ei1301 | easy | Similarly, | key | key | similarly: peels dried, same pattern |
| C6-ei1302 | easy | Instead, | key | key | instead: sandwiches in place of soup |
| C6-ei1303 | medium | In contrast, | key | key | in contrast: phone vs paper |
| C6-ei1304 | medium | Nevertheless, | key | key | nevertheless: narrow dark path, still dozens ride |
| C6-ei1305 | medium | Instead, | key | key | instead: zoo in place of poster |
| C6-ei1306 | medium | Likewise, | key | key | likewise: same pattern, music teacher |
| C6-ei1307 | medium | However, | key | key | however: forecast said no rain, shower came |
| C6-ei1308 | medium | In contrast, | key | key | in contrast: five vs eleven |
| C6-ei1309 | medium | Still, | key | key | still: practiced, yet forgot |
| C6-ei1310 | medium | Instead, | key | key | instead: recitation in place of test |
| C6-ei1311 | hard | Similarly, | key | key | similarly: second empty building given new life |
| C6-ei1312 | hard | Still, | key | key | still: refused vegetables yet ate tomatoes |
| C6-ei1313 | hard | Instead, | key | key | instead: filter in place of curtains |
| C6-ei1314 | hard | In contrast, | key | key | in contrast: planner vs improviser |
| C6-ei1315 | hard | Likewise, | key | key | likewise: leftover reuse, second case |
| C6-ei1316 | hard | Nevertheless, | key | key | nevertheless: bad pitch yet daily matches |
| C6-ei1317 | hard | Similarly, | key | key | similarly: home-first, second case |
| C6-ei1318 | hard | In contrast, | key | key | in contrast: saver vs spender |
| C6-ei1319 | hard | However, | key | key | however: expected to lose, won rounds |
| C6-ei1320 | hard | Instead, | key | key | instead: shared shelf in place of buying |

#### C19-RWEI02-2 (C6-13.json, rhetorical_synthesis; easy/medium/hard 5/9/6)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ei2201 | easy | Both the Karimovs and the Yusupovs give part of their harvest to th… | key | key | similarity: both give harvest |
| C6-ei2202 | easy | Bobur leaves home for school at 7:30, twenty minutes before his sis… | key | key | difference: 7:30 twenty minutes before 7:50 |
| C6-ei2203 | easy | The class collected 60 kilograms of newspapers in November, twice t… | key | key | 60 twice 30 |
| C6-ei2204 | easy | Asal's story and Temur's story were each exactly one page long. | key | key | both one page |
| C6-ei2205 | easy | The small reading room has only 12 seats, while the large one has 40. | key | key | 12 vs 40 |
| C6-ei2206 | medium | In the same morning hour, 80 cars passed the school gate on Wednesd… | key | key | 80, 40 fewer than 120 (a distractor swaps the days) |
| C6-ei2207 | medium | Ozoda and her cousin Diyor each took twelve lessons when they learn… | key | key | each twelve lessons |
| C6-ei2208 | medium | The chess club raised money by selling homemade cakes, but the foot… | key | key | cakes vs car wash |
| C6-ei2209 | medium | Kumush planted 45 tulip bulbs, three times as many as the 15 that R… | key | key | 45 three times 15 |
| C6-ei2210 | medium | Each class planted 18 trees along the road, and each finished in a … | key | key | 18 trees, one Saturday each |
| C6-ei2211 | medium | Hilola finished the 240-page book in 6 days, half the 12 days that … | key | key | 6 half of 12 |
| C6-ei2212 | medium | On a normal day, the canteen sells 150 plates of plov, 60 more than… | key | key | 150, 60 more than 90 |
| C6-ei2213 | medium | After four weeks, both bean plants were 30 centimeters tall. | key | key | both 30 cm |
| C6-ei2214 | medium | Bus 12 reaches the city center in 25 minutes, while Bus 41 takes 40. | key | key | 25 vs 40 |
| C6-ei2215 | hard | The library lent 300 books in October, 60 fewer than the 360 it len… | key | key | 300, 60 fewer than 360 (a distractor has the wrong direction) |
| C6-ei2216 | hard | Saodat and Mahbuba both bake bread in clay ovens, a skill each of t… | key | key | clay ovens, learned from mothers |
| C6-ei2217 | hard | Sardor practices for 20 minutes every day, while Akmal practices fo… | key | key | 20 daily vs 60 weekends (the two-years option is learning time, not practice) |
| C6-ei2218 | hard | The club sold 32 pots of herbs on Sunday, half as many as the 64 it… | key | key | 32 half of 64 |
| C6-ei2219 | hard | Rustam spent 9 evenings building his model house, three times as lo… | key | key | 9 three times 3 ("any other pupil" is not in the notes) |
| C6-ei2220 | hard | Class 9A and Class 9B each won 4 races, and each also won exactly o… | key | key | each 4 wins and one relay |

#### C19-RWEI02-3 (C6-13.json, rhetorical_synthesis; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ei2301 | easy | The club waters at 6 p.m. because water given in the strong midday … | key | key | why: midday water dries |
| C6-ei2302 | easy | After the cooks served smaller portions, the food left on plates fe… | key | key | result: halved |
| C6-ei2303 | medium | Bahrom put the same kind of thermometer on three windowsills and re… | key | key | method |
| C6-ei2304 | medium | The swap shelf in Block 7 is a bookshelf where neighbours leave thi… | key | key | introduce: what it is |
| C6-ei2305 | medium | He hangs each melon in its own net bag from the ceiling of a cool, … | key | key | how: net bags hung |
| C6-ei2306 | medium | More than half of the 28 pupils in Ruxshona's class, 16 of them, wa… | key | key | main finding: 16 of 28 walk |
| C6-ei2307 | medium | Children under 12 can borrow books from the mahalla library for free. | key | key | young children: free under 12 |
| C6-ei2308 | medium | Iroda and her mother wash and cut the apples, cook them with sugar … | key | key | steps |
| C6-ei2309 | medium | The school moved its matches to Friday because many pupils visit th… | key | key | why |
| C6-ei2310 | medium | The next day, the pupils who learned with music and those who learn… | key | key | result: both about 14 ("music helps" is false) |
| C6-ei2311 | hard | The Saturday Fixers is a group of pupils who, every Saturday mornin… | key | key | introduce |
| C6-ei2312 | hard | Ilhom kept the gym warmer by sealing the gaps around its windows wi… | key | key | how |
| C6-ei2313 | hard | The club counted more than twice as many birds a morning when the f… | key | key | finding: 15 vs 6 |
| C6-ei2314 | hard | Every October, the mahalla's autumn fair brings stalls of produce a… | key | key | overview |
| C6-ei2315 | hard | Shoxrux poured 100 milliliters of water into cups of garden soil, s… | key | key | method |
| C6-ei2316 | hard | The canteen stopped selling fizzy drinks because sugary drinks made… | key | key | why ("too expensive" is not in the notes) |
| C6-ei2317 | hard | Painting the picture on the canteen wall took Class 10B 26 afternoo… | key | key | time: 26 afternoons |
| C6-ei2318 | hard | Pupils sort rubbish into blue, yellow and grey bins in each classro… | key | key | how sorted and collected |
| C6-ei2319 | hard | By the last day of the week, 95 of the 120 pupils talked with someo… | key | key | result 40 to 95 |
| C6-ei2320 | hard | In five stones, players toss one stone up, pick up others from the … | key | key | introduce: how played |

#### C19-RWCS03-2 (C6-14.json, cross_text_connections; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-cs3201 | easy | By supporting the idea but warning about a problem that Text 1 does… | key | key | supports, warns of breakage/no sign-out |
| C6-cs3202 | easy | By suggesting that the advice may not suit very young children | key | key | advice may not suit 4-5 year olds |
| C6-cs3203 | medium | By suggesting that a different change may explain why customers sta… | key | key | cushioned chairs, another change |
| C6-cs3204 | medium | By cautioning that a result from one short trial may not last over … | key | key | one week novelty, may not last |
| C6-cs3205 | medium | By noting that the same pattern seems to appear in a different subject | key | key | same pattern in music |
| C6-cs3206 | medium | By pointing out a hardship the plan would create for students who l… | key | key | bus hardship for far students |
| C6-cs3207 | medium | By suggesting that the people she asked were not the ones most like… | key | key | wrong people asked |
| C6-cs3208 | medium | By offering a different possible reason for the poor harvest | key | key | walnut shade, another reason |
| C6-cs3209 | medium | By suggesting that her advice does not suit every older person | key | key | not every older person (hearing) |
| C6-cs3210 | medium | By offering a case from another place that fits the view of the cook | key | key | another case fits the cook's view |
| C6-cs3211 | hard | By agreeing that the second bus helped but doubting that a summer m… | key | key | helped, but July not a test |
| C6-cs3212 | hard | By noting that the beekeeping families differ in another way that c… | key | key | beekeepers also tend best orchards |
| C6-cs3213 | hard | By accepting its benefits but raising a drawback that the plan does… | key | key | grants ease, raises summer heat |
| C6-cs3214 | hard | By suggesting that the finding may hold for adults as well as for c… | key | key | adults too |
| C6-cs3215 | hard | By arguing that a trial with only strong readers cannot show that t… | key | key | strong readers only |
| C6-cs3216 | hard | By suggesting that the calm may be due to the departure of the nois… | key | key | loud stalls left |
| C6-cs3217 | hard | By pointing out that the plan could leave some students unable to s… | key | key | shared phone, homework late |
| C6-cs3218 | hard | By accepting that warmth speeds rising while denying that it is the… | key | key | warmth speeds but not the only road |
| C6-cs3219 | hard | By offering a similar case and suggesting that answering questions … | key | key | similar case; being asked builds it |
| C6-cs3220 | hard | By arguing that his measurements were taken at the wrong time to su… | key | key | measured at breaks, wrong time |

#### C19-RWCS03-3 (C6-14.json, cross_text_connections; easy/medium/hard 2/6/12)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-cs3301 | easy | The museum would not cost the class much. | key | key | both: museum cheap |
| C6-cs3302 | easy | By objecting that the family would lose its one daily time to talk … | key | key | one daily time to talk |
| C6-cs3303 | medium | The river path is cleaner this year than it was before. | key | key | both: path cleaner |
| C6-cs3304 | medium | By arguing that marks a week later come too late to learn from mist… | key | key | marks a week later too late |
| C6-cs3305 | medium | They agree that a lift would help but differ on whether it should c… | key | key | lift helps; differ on order |
| C6-cs3306 | medium | In summer the field becomes too hot for practice later in the morning. | key | key | both: too hot later in the morning |
| C6-cs3307 | medium | By objecting that it would not help people who shop on the way home | key | key | morning hours miss after-work shoppers |
| C6-cs3308 | medium | The choir sounds better this year than it did before. | key | key | both: choir better |
| C6-cs3309 | hard | Farmers in the valley plant their wheat earlier than farmers there … | key | key | both: sown earlier (Text 2 does not grant frosts end earlier) |
| C6-cs3310 | hard | By arguing that a museum should not put its originals at risk for t… | key | key | originals not to be risked |
| C6-cs3311 | hard | They describe the same problems with online lessons but disagree ab… | key | key | same problems, disagree on keeping |
| C6-cs3312 | hard | The bread from the clay oven tastes better than the bread from the … | key | key | both: clay bread better |
| C6-cs3313 | hard | By warning that the extra lanes may soon fill with new traffic | key | key | induced traffic |
| C6-cs3314 | hard | The poplar in its present state puts the children at risk. | key | key | both: danger now |
| C6-cs3315 | hard | By warning that the students may turn their mistakes into habits be… | key | key | wrong method becomes habit |
| C6-cs3316 | hard | They agree that fewer young people learn the craft but give differe… | key | key | agree fewer learn, different reasons |
| C6-cs3317 | hard | Playing games gives young players experience that helps them. | key | key | both: games give experience |
| C6-cs3318 | hard | By arguing that closing the lane could make it emptier and therefor… | key | key | closed lane emptier, less watched |
| C6-cs3319 | hard | Children can learn about handling money from having pocket money of… | key | key | both: pocket money teaches |
| C6-cs3320 | hard | By objecting that the plan would take away a place where students l… | key | key | garden teaches a great deal |

#### C19-RWII03-2 (C6-14.json, inferences; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ii3201 | easy | kept the soil under it from drying out. | key | key | straw kept soil damp |
| C6-ii3202 | easy | spelling the words aloud in pairs was the more helpful way to pract… | key | key | pairs aloud helped these students |
| C6-ii3203 | medium | were drawn by the look of the painted lids. | key | key | look of painted lids (places swapped) |
| C6-ii3204 | medium | how he spent that half hour made little difference to falling asleep. | key | key | made little difference for him |
| C6-ii3205 | medium | keeps the middle of the bread from rising. | key | key | stamp keeps middle flat |
| C6-ii3206 | medium | picked the fish for the food itself, not for its place. | key | key | sides switched: the food itself |
| C6-ii3207 | medium | paper or tablet made little difference to the scores. | key | key | paper or tablet little difference |
| C6-ii3208 | medium | the greater warmth of the sunny spot. | key | key | sun warmth |
| C6-ii3209 | medium | many of the morning cars on his street are linked to the school day. | key | key | traffic linked to school days |
| C6-ii3210 | medium | kept the chain of Aziz from rusting and slipping. | key | key | care kept chain from rusting |
| C6-ii3211 | hard | most likely lies in something about the two kinds of plant themselves. | key | key | something in the kinds themselves |
| C6-ii3212 | hard | did not make its runners noticeably faster. | key | key | not noticeably faster on this route |
| C6-ii3213 | hard | added new readers rather than moving Saturday readers to Sunday. | key | key | new readers, Saturday did not fall |
| C6-ii3214 | hard | cooling quickly made cracking more likely. | key | key | quick cooling, cracks |
| C6-ii3215 | hard | cannot be explained by what the hens were fed. | key | key | cannot be explained by feed |
| C6-ii3216 | hard | knowing what would be played mattered more than seeing the earlier … | key | key | knowing the songs mattered more |
| C6-ii3217 | hard | made her easier to see on a dark street even without the lamp. | key | key | sticker alone visible |
| C6-ii3218 | hard | may persuade residents more than a printed leaflet does. | key | key | visit may persuade more |
| C6-ii3219 | hard | did little to bring in customers in those two weeks. | key | key | little effect those weeks |
| C6-ii3220 | hard | may have helped members follow the plot but made the book less enjo… | key | key | helped plot, less enjoyment |

#### C19-RWII03-3 (C6-14.json, inferences; easy/medium/hard 2/6/12)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ii3301 | easy | an adult was in the water with her. | key | key | adult in the water |
| C6-ii3302 | easy | in the pocket of his sports jacket. | key | key | sports jacket pocket |
| C6-ii3303 | medium | did not have to wash the dishes. | key | key | came at five, so cooked, so no dishes |
| C6-ii3304 | medium | no earlier than about a month after the work begins. | key | key | 6000/200 = 30 days |
| C6-ii3305 | medium | the heat rising from the radiator below. | key | key | radiator heat |
| C6-ii3306 | medium | it was snowing that morning. | key | key | snowing (left 7:45) |
| C6-ii3307 | medium | will flower along the south wall. | key | key | roses flower (ferns unknown) |
| C6-ii3308 | medium | had chosen to make a change. | key | key | chose a change |
| C6-ii3309 | hard | must have passed the weight test before the machine broke. | key | key | tested before ten |
| C6-ii3310 | hard | the constant movement of the water from the new fountain. | key | key | fountain moves water |
| C6-ii3311 | hard | cannot play in this season's town tournament. | key | key | won 2 of 6, needs 3 |
| C6-ii3312 | hard | has not made his jam for the last three autumns. | key | key | no jam three autumns |
| C6-ii3313 | hard | could not yet have been approved by the fire inspector. | key | key | staircase unfinished, no inspection |
| C6-ii3314 | hard | the bent mudguard had worn through it. | key | key | mudguard wore through |
| C6-ii3315 | hard | the school by the gate was open for the day. | key | key | school open that Saturday |
| C6-ii3316 | hard | come back down before the first snow. | key | key | down before first snow |
| C6-ii3317 | hard | the textile room had a sign at its door that Timur missed. | key | key | a sign he missed |
| C6-ii3318 | hard | may have had kittens under the woodshed. | key | key | kittens |
| C6-ii3319 | hard | in September of her tenth-grade year. | key | key | September of tenth grade |
| C6-ii3320 | hard | may have been caused by the greater heat of the black board. | key | key | heat of black board |

#### C19-RWSE03-2 (C6-15.json, form_structure_sense; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-se3201 | easy | has | key | key | each of these rooms has |
| C6-se3202 | easy | brings | key | key | either ... or: nearer subject father, singular |
| C6-se3203 | medium | he was sent straight to the shower by his grandmother. | key | key | covered in mud: he (Mansur) after the comma |
| C6-se3204 | medium | spins | key | key | not only washes ... but also spins |
| C6-se3205 | medium | has | key | key | neither of them has |
| C6-se3206 | medium | watch | key | key | both walk ... and watch |
| C6-se3207 | medium | Shahnoza learned to sew from their grandmother at the age of ten. | key | key | like her sister: Shahnoza |
| C6-se3208 | medium | carry | key | key | either ... or: nearer subject the two trucks, plural |
| C6-se3209 | medium | has | key | key | every house has |
| C6-se3210 | medium | get | key | key | either buy ... or get |
| C6-se3211 | hard | Ilhom can tell what is wrong with most of them just by listening to… | key | key | having repaired clocks: Ilhom |
| C6-se3212 | hard | have | key | key | neither ... nor: nearer subject the engineers, plural |
| C6-se3213 | hard | to fill | key | key | both to replace ... and to fill |
| C6-se3214 | hard | is | key | key | only one ... is |
| C6-se3215 | hard | is | key | key | either ... or: nearer subject the designer, singular |
| C6-se3216 | hard | Odil waits until early spring to sow his fields, when the ground is… | key | key | unlike these farmers: Odil |
| C6-se3217 | hard | mentioned | key | key | neither showed ... nor mentioned |
| C6-se3218 | hard | has | key | key | every coin, letter, and photograph has |
| C6-se3219 | hard | large enough | key | key | both cheap enough ... and large enough |
| C6-se3220 | hard | the carpet took its weaver almost two years to finish, the family s… | key | key | woven by hand: the carpet |

#### C19-RWSE03-3 (C6-15.json, boundaries; easy/medium/hard 2/6/12)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-se3301 | easy | kitchen were | key | key | long subject, no mark before were |
| C6-se3302 | easy | car: | key | key | complete clause, colon before the list |
| C6-se3303 | medium | winter is | key | key | long subject, no mark before is |
| C6-se3304 | medium | things: | key | key | colon after a complete clause, none with such as/including |
| C6-se3305 | medium | workers that | key | key | no mark between verb phrase and its object clause |
| C6-se3306 | medium | dawn; | key | key | list with inner commas: semicolon |
| C6-se3307 | medium | sea leads | key | key | long subject, no mark before leads |
| C6-se3308 | medium | including | key | key | no colon after including |
| C6-se3309 | hard | it supply | key | key | compound subject, no mark before supply |
| C6-se3310 | hard | found deep | key | key | no mark between verb and object |
| C6-se3311 | hard | doctor; | key | key | list with inner commas: semicolon |
| C6-se3312 | hard | are simple: | key | key | complete clause (are simple) then colon |
| C6-se3313 | hard | roads costs | key | key | long subject, no mark before costs |
| C6-se3314 | hard | as apricots | key | key | no mark after such as |
| C6-se3315 | hard | is; | key | key | list with inner commas: semicolon |
| C6-se3316 | hard | feast— | key | key | dash after complete clause before the list |
| C6-se3317 | hard | tour is | key | key | long subject clause, no mark before is |
| C6-se3318 | hard | learn that | key | key | no mark between verb and object clause |
| C6-se3319 | hard | hill; | key | key | list with inner commas: semicolon |
| C6-se3320 | hard | arguing was | key | key | long subject, no mark before was |

#### C19-RWEI03-2 (C6-15.json, transitions; easy/medium/hard 2/8/10)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ei3201 | easy | Specifically, | key | key | specifically: the drip tubes detail the water saving |
| C6-ei3202 | easy | In other words, | key | key | in other words: restates the rule |
| C6-ei3203 | medium | In fact, | key | key | in fact: goes further than patching |
| C6-ei3204 | medium | Specifically, | key | key | specifically: names the one service |
| C6-ei3205 | medium | Thus, | key | key | thus: full by seven, so arrive before dawn |
| C6-ei3206 | medium | Admittedly, | key | key | admittedly: grants the noise, then Still |
| C6-ei3207 | medium | That is, | key | key | that is: explains the name |
| C6-ei3208 | medium | Ultimately, | key | key | ultimately: after the delays, the end |
| C6-ei3209 | medium | Indeed, | key | key | indeed: confirms and strengthens easier |
| C6-ei3210 | medium | In particular, | key | key | in particular: one room singled out |
| C6-ei3211 | hard | In other words, | key | key | in other words: restates the saying |
| C6-ei3212 | hard | Specifically, | key | key | specifically: the timing detail |
| C6-ei3213 | hard | Admittedly, | key | key | admittedly: grants the cheaper machine, then Even so |
| C6-ei3214 | hard | Ultimately, | key | key | ultimately: after all the fixes failed |
| C6-ei3215 | hard | Thus, | key | key | thus: eight slopes x four days, so a month of rest |
| C6-ei3216 | hard | In particular, | key | key | in particular: the plow singled out of the farm tools |
| C6-ei3217 | hard | That is, | key | key | that is: defines false spring |
| C6-ei3218 | hard | Granted, | key | key | granted: concedes narrow road, then Still |
| C6-ei3219 | hard | Indeed, | key | key | indeed: confirms the doubters in part, then however |
| C6-ei3220 | hard | Thus, | key | key | thus: fewer scrapings, so more days in service |

#### C19-RWEI03-3 (C6-15.json, rhetorical_synthesis; easy/medium/hard 2/6/12)

| Item | Level | Key (options[0]) | P8bs1 | P8bs2 | P8bs2's reading |
|---|---|---|---|---|---|
| C6-ei3301 | easy | A rope ferry is a flat boat with no engine that the current of a ri… | key | key | introduce: what a rope ferry is |
| C6-ei3302 | easy | Behruz makes walnut chairs, and most of them are bought by cafés in… | key | key | what he makes and who buys most |
| C6-ei3303 | medium | This season, the Old Mill Theater opened a 60-seat basement stage, … | key | key | familiar audience: the newest addition only |
| C6-ei3304 | medium | Although setting up drip watering took 2 months, Anvar's farm now u… | key | key | main clause the water saved, the 2 months conceded |
| C6-ei3305 | medium | At the Ustalar workshop, one family repairs old machines of many ki… | key | key | general statement: one family repairs machines of many kinds |
| C6-ei3306 | medium | Saida stored half her potatoes in a 4°C cellar and half in a 12°C s… | key | key | method and result |
| C6-ei3307 | medium | Pit firing bakes clay pots in a hole in the ground under sawdust an… | key | key | introduce: what pit firing is |
| C6-ei3308 | medium | Though the 50-minute ferry is slower than the 30-minute drive aroun… | key | key | main clause the low cost, the slowness conceded |
| C6-ei3309 | hard | Water had washed away the soil under the bridge's east pier, so Jav… | key | key | problem and solution |
| C6-ei3310 | hard | In Rano Ergasheva's 2025 test, bees in the glass-walled hives made … | key | key | familiar audience: the results only |
| C6-ei3311 | hard | Although it opens only on Sundays, Murod Haydarov's one-room farm m… | key | key | main clause the 2,400 visitors, the Sundays conceded |
| C6-ei3312 | hard | In the valley, the higher a village stood, the earlier its first fr… | key | key | general: higher, earlier frost |
| C6-ei3313 | hard | Lola Rahimova's dogs live with the sheep from 8 weeks old so that t… | key | key | why + result |
| C6-ei3314 | hard | In 2025, the Blue Line cable car replaced its 24 cabins, which held… | key | key | familiar audience: the 2025 change |
| C6-ei3315 | hard | Although they cost twice as much to buy, the LED lamps weigh 3 kilo… | key | key | main clause the advantages, the price conceded |
| C6-ei3316 | hard | All three lake ferries, built between 1978 and 1991, still run on t… | key | key | general: ages and first engines of all three |
| C6-ei3317 | hard | Sevara fires her pots at 1,250°C in a wood kiln, hotter than Akmal'… | key | key | difference + why it matters |
| C6-ei3318 | hard | Snow fences, lines of wooden boards beside a road, slow the wind so… | key | key | what they do + that they work |
| C6-ei3319 | hard | Although its stove burns 2 tons of wood each winter, Ibrohim Sobiro… | key | key | main clause the harvest, the wood conceded |
| C6-ei3320 | hard | All 5 of the museum's weekend craft classes filled their 12 places … | key | key | general: all five filled within 4 days |
