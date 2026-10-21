# C6, C7 and C19: key check 2 of the P13 content quality round's version-2 items (17 Oct 2026)

The P13 content quality round rewrote, as version 2 drafts, every served item that the P13 defect scanner (branch `p13-scan`,
`scripts/content/scan.ts`) or the third-solver audit found wrong, plus the length cues of whole served batches (SPEC-lessons rev. 2,
§9.1 step 3: an item is served only when two blind solvers outside the author's session agree with its key). Two authors wrote them;
P13 blind checkers 1 and 2 (P13s1, P13s2) keyed them. This file is checker 2's record (P13s2, who ran the reconcile).

| File | Commit | Author | Items (version 2) |
|---|---|---|---|
| `C6/C6-10.json` | `95390d19`, `44168c48` | `agent:p13-fix-a` | `C6-cs2201`, `cs2202`, `cs2204`, `cs2207`, `cs2209`, `cs2210`, `cs2215`, `cs2217`, `cs2218`, `cs2219`, `cs2220`, `cs2305`, `cs2306`, `cs2311`, `cs2312`, `cs2318`, `cs2319`, `cs2320` (18) |
| `C6/C6-12.json` | `95390d19` | `agent:p13-fix-a` | `C6-se1309`, `se1316` (2) |
| `C6/C6-13.json` | `95390d19`, `44168c48` | `agent:p13-fix-a` | `C6-ei2208`, `ei2216`, `ei2219`, `ei2303`, `ei2309`, `ei2314`, `ei2315`, `ei2318`, `ei2319`, `ei2320` (10) |
| `C6/C6-15.json` | `95390d19`, `44168c48` | `agent:p13-fix-a` | `C6-se3204`, `se3205`, `se3210`, `se3217`, `se3302`, `se3304`, `se3308`, `se3316`, `ei3301`, `ei3303`, `ei3307`, `ei3309`, `ei3318` (13) |
| `C6/C6-17.json` | `95390d19` | `agent:p13-fix-a` | `C6-se1706`, `se1717`, `se1719`, `se1741`, `se1748`, `ei1722` … `ei1740` (15), `ei1753`, `ei1756`, `ei1758`, `ei1760` (24) |
| `C6/C6-3.json`, `C6-4.json`, `C6-5.json`, `C6-6.json`, `C6-9.json`, `C6-20.json` | `95390d19` | `agent:p13-fix-a` | `C6-iih001`, `sem005`, `eie007`, `eim006`, `eih007`, `ii2n03`, `se3818` (7) |
| `C7/C7-13.json`, `C7/C7-8.json` | `95390d19` | `agent:p13-fix-a` | `C7-ir4807`, `ir4815`, `ir4909`, `ir4110` (4) |
| `C19/C19-21.json` | `ad28034e` | `agent:p13-fix-b` | `C19-se33q3`, the trap question of `C19-RWSE03-3` (1) |

Before this pass all 79 were `version: 2`, `status: draft`, `key_check_1: "author"`, `key_check_2: null`, no `key_check_2_version`, the
key still `options[0]`. 78 were `verified_auto` at version 1; `C7-ir4909` was `quarantine` (round 3: answerable without its passage) and
keeps that reason as history with a version 2 note. Levels: B1 15, B2 25, C1 39. Only `C7-ir4909` has a passage (`C7-P-rd23`).

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P13s1 (checker 1) | `.superpowers/p13/blind/C6-P13s1.json` (74), `C7-P13s1.json` (4), `C19-P13s1.json` (1) | `.superpowers/p13/blind/<stream>-P13s1.answers.json` |
| P13s2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p13/blind/C6-P13s2.json` (74), `C7-P13s2.json` (4), `C19-P13s2.json` (1) | `.superpowers/p13/blind/<stream>-P13s2.answers.json` |

(`.superpowers/` paths are in the integration worktree `jg-p5int`.) P13s2's copy: `npx tsx scripts/content/blind.ts <stream> P13s2 --pending
--blind <staging>` for C6 (74 items without two checks), C7 (29: these 4 and the 25 older quarantined `C7-rs*`) and C19 (1);
`.superpowers/p13/check-2/ids.cjs` listed the ids whose author is a p13 fix agent (it prints ids and record fields only), and `filter.cjs`
kept exactly those 79 ids of each copy and its map and wrote them into `.superpowers/p13/blind/`, unprinted; the staging files were
deleted. A copy holds each item's stem, its passage when it has one, its four options shuffled by the solver's own seed and lettered A-D,
and the instructions; no key, no `why`. Both solvers' copies, answers and maps sit in the one folder `reconcile.ts` reads.

Each solver was a separate agent run, and neither is an author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads P13s1,
P13s2, `p13-fix-a` and `p13-fix-b` as four agents, so `keyCheckOf("blind:P13s1+P13s2", { author })` is `{ kind: "blind", n: 2 }` for
both authors. P13s2 opened neither `.map-*` file, nor the item records, nor the authors' ledgers (`.superpowers/p13/fix-a.md`, `fix-b.md`),
logs and tests, nor checker 1's answers, before it wrote its own: it read each item in its copy (`check-2/dump.cjs` prints the copy as text),
read the sentence with every option in the blank for each fill-in item, chose a letter, and wrote its answers with a one-line reading per
item. One thing it did see first: the brief that started it summarised what version 2 changed and quoted the new keys of `C6-se1706`,
`se1719`, `se1741` ("funny; even", "Tuesday; the", "ago, most"), the replaced distractors of `se1717`/`se1748` and the key "window" of
`C7-ir4909`. Its answers to those items are read from the sentences and the passage (notes in its answers file) and agree with checker
1's. Only `reconcile.ts` read the maps. After its answers were written, P13s2 read the v1/v2 records (`check-2/v1v2.cjs`), the whys and
the ledgers.

## The decision

- `npx tsx scripts/content/reconcile.ts C6 P13s1 P13s2 --blind .superpowers/p13/blind --write`: **1440 items: verified 74, quarantine 0,
  pending 0, blocked 0, skipped 1366** (the other C6 items, all served).
- `… C7 P13s1 P13s2 …`: **499 items: verified 4, quarantine 0, pending 0, blocked 0, skipped 495** (served items, open prompts, and the
  drafts no solver answered, among them the 25 quarantined `C7-rs*`, left as they were).
- `… C19 P13s1 P13s2 …`: **372 items: verified 1, quarantine 0, pending 0, blocked 0, skipped 371**.

**Both solvers chose the key on all 79 items.** No answer was stale, and neither answers file raises `two_defensible`, `unanswerable` or
`no_passage_needed`. The dry runs gave the same decisions. The decisions are kept in `.superpowers/p13/blind/C6-reconcile.json`,
`C7-reconcile.json` and `C19-reconcile.json`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **79** | `key_check_2: "blind:P13s1+P13s2"`, `key_check_2_version: 2`, version 2 (`C7-ir4909` keeps its round 3 `quarantine_reason` as history) |
| `quarantine` | **0** | none |

**Verified: 79. Quarantined: 0.** No item drew a disagreement, a second correct option or a flag from either solver.

## Every fill-in item, every option in the sentence

P13s2 read each of the 22 fill-in items with each option in its blank. In none is a second option correct.

| Item | Key in the sentence | Each other option, and why it is wrong |
|---|---|---|
| C6-se1309 | "must bring three things: a signed permission form, …" | "bring: three things" (a colon between the verb and its object); "bring three things" (no mark before the list: "three things a signed form"); "bring three things;" (a semicolon before a list) |
| C6-se1316 | "moved to the school yard; nevertheless, more than two hundred …" | "yard, nevertheless," (comma splice); "yard nevertheless," (run-on); "yard, nevertheless;" ("nevertheless" then ends the first clause, contradicting its "because") |
| C6-se3204 | "not only washes … but also spins the clothes" | "spinning", "spin" (not parallel with "washes"; "spin" breaks the agreement), "it spins" (a clause after "but also", not parallel) |
| C6-se3205 | "Neither of them has been driven" | "have" ("neither" is singular), "were"/"are" ("were/are been driven" is not English) |
| C6-se3210 | "either buy a ticket … or get one from the driver" | "getting", "got" (not the base form after "can either buy … or"), "they can get" (not parallel) |
| C6-se3217 | "It neither showed the new road … nor mentioned that …" | "mentions" (tense), "did it mention", "it mentioned" (break the "neither … nor" parallel of two past verbs) |
| C6-se3302 | "he checked the car: the oil, the water, and the air …" | "car" ("checked the car the oil"), "car;" (a semicolon before a list), "car, such as:" (a colon after "such as") |
| C6-se3304 | "holds many useful things: a sewing machine, …" | "things;" (a semicolon before a list), "things, including:", "things, such as:" (a colon after "including"/"such as") |
| C6-se3308 | "everything a rider needs on the road, including a pump, …" | "road; including" (a semicolon before a phrase), "road: including", "road, including:" (no colon before or after "including") |
| C6-se3316 | "everything ready for the feast—the rice, the salads, and the bread …" | "feast;" (a semicolon before a list), "feast, including:", "feast: such as" (a colon around "including"/"such as") |
| C6-se1706 | "was very funny; even the grandparents … laughed out loud" | "funny, even" (comma splice), "funny even" (run-on), "funny, and, even" (a comma after "and" with nothing introductory) |
| C6-se1717 | "collapsed on the spinning wheel; when she tried again a week later, she kept …" | "wheel, when", "wheel when" (the "when" clause runs on into the first, leaving "she kept" joined by a comma), "wheel; when," (a comma cuts "when" from its clause) |
| C6-se1719 | "had melted by Tuesday; the one built by Class 6B, however, was still standing" | "Tuesday, the" (comma splice), "Tuesday the" (run-on), "Tuesday, and, the" (a comma after "and") |
| C6-se1741 | "Although the clock … had stopped years ago, most people in the square …" | "ago, but most" ("although … but"), "ago; most" (a semicolon after a dependent clause), "ago most" (no comma after the introductory clause) |
| C6-se1748 | "had to soak for several hours; by noon, three huge pots were steaming" | "hours, by" (comma splice), "hours by" ("by noon" joins the first clause, then a splice), "hours; by," (a comma between "by" and "noon") |
| C6-se3818 | "explained to the class exactly how the town's first builders had lifted …" | "exactly: how", "exactly how:", "exactly how," (a mark inside the object clause) |
| C6-sem005 | "Students who finish the reading early may begin …" | "Students, who" and "Students—who" (a restrictive clause set off, and never closed), "Students who," (a comma between the subject and its verb) |
| C7-ir4807 | "reserve time in the quiet room on the college website" | "booking office", "front desk" (not in the text), "Friday mornings" (the counsellor's time; "on the Friday mornings" does not read) |
| C7-ir4815 | "kept small because of the narrow passages" | "helmet lamps" (the text has one "helmet lamp" each, not the reason), "wooden walkway", "first chamber" (the part outside the tours) |
| C7-ir4909 | "They are left near an open window until dry" (paragraph C) | "fire" (paragraph D's smoking room, the next step; the text never says "open fire"), "door", "hearth" (not in the passage) |
| C7-ir4110 | "rather than selling to shops, they sell them at the farm gate" | "local shops" (contradicts "rather than selling to shops"), "village market" (not in the text), "supermarket shelves" (the other orchards') |
| C19-se33q3 | "Ozoda, who bakes the flatbread; Rustam, who grills the meat; and Gulnora, who makes the sweets" | "meat, and" (a comma at the last break of a semicolon list), "meat and" (Gulnora becomes what Rustam grills), "meat: and" (a colon inside the list) |

**C7-ir4909, no passage.** Before reading paragraph C, P13s2 answered from the flow chart alone: with "cleaned and soaked … hung in
pairs on wooden rods … left near an open ______ until dry", the pick is "fire" (the strongest collocation with "open" for drying fish),
then "hearth"; the key "window" is in the passage only. So the item needs its passage, and no flag was raised. Its stem no longer gives
`C7-ir4908`'s key "salty water", and no sibling on `C7-P-rd23` (`ir4908`, `ir4910`) states "window".

## Every item: version 1's defect, version 2's change, the verdict

Verdict for every row: **verified_auto** (P13s1 and P13s2 both chose the key; `blind:P13s1+P13s2`, `key_check_2_version` 2).
"Lengthened" means one distractor got a detail that keeps it wrong; the reason it stays wrong is in the last column.

**C6-10 text_structure_purpose** (version 1's batch defect: the key uniquely the longest option in 30 of 40 served items, a length cue;
pass 1 cleared `cs2209`, `cs2218`, `cs2220` as single `cue.length` items, pass 2 the rest; now 15 of 40)

| Item | Level | Version 2 change | Why the changed option stays wrong |
|---|---|---|---|
| C6-cs2201 | B1 | lengthened "…who usually come to the chess club each week." | that is sentence 2's job; sentence 3 is the exception |
| C6-cs2202 | B1 | lengthened "…wanted to read more books this year." | the text gives no reason |
| C6-cs2204 | B1 | lengthened "…how Akmal and his sister trained the puppy with small treats." | that is sentence 3 |
| C6-cs2207 | B2 | "It gives an experience that supports the common assumption…" | the experience challenges it |
| C6-cs2209 | B2 | lengthened "…current location, a paved square on a hill above the river." | that is sentence 3; sentence 2 gives the reasons |
| C6-cs2210 | B2 | lengthened "…expectation about the online course turned out to be correct." | it did not |
| C6-cs2215 | C1 | lengthened "…wanted to save money on the old iron bridge." | sentence 3 is the engineer's evidence |
| C6-cs2217 | C1 | lengthened "…first impression of the city as grey, crowded and cold." | that is sentence 1 |
| C6-cs2218 | C1 | lengthened "…the method that finally helped Murod use new words in his conversations." | that is sentence 3 |
| C6-cs2219 | C1 | lengthened "…should ever have left its first room above the bakery." | nothing is questioned |
| C6-cs2220 | C1 | lengthened "…the teacher proposed for why the opening team usually wins." | that is sentence 2; sentence 3 is Kamila's alternative |
| C6-cs2305 | B2 | lengthened "To explain why the whole street now bakes the walnut cake for weddings" | no reason is given |
| C6-cs2306 | B2 | lengthened "…met for every student, young and old alike." | not for the oldest |
| C6-cs2311 | C1 | "…reports a teacher's close reading that confirms that view." | it reveals a second purpose |
| C6-cs2312 | C1 | lengthened "…figures for waiting times at the central stop are false" | "The report is right about the central stop" |
| C6-cs2318 | C1 | "To prove that practice of any kind does not improve typing speed" | "only partly true"; short focused practice works |
| C6-cs2319 | C1 | "…explains why the school finally adopted the proposal." | nothing says it was adopted |
| C6-cs2320 | C1 | "To prove, by means of an old wedding song, that the usual account…" | "Whatever the truth": nothing is proved |

**C6-12, C6-17, C6-20, C6-4 and C19 boundaries: the fill-in errors** (scanner `fill.*` rules; the third-solver audit)

| Item | Level | Version 1's defect | Version 2's change |
|---|---|---|---|
| C6-se1309 | B2 | an option began with a mark, so the sentence read "bring : three things" (a space before a mark) | "bring" moved into every option ("bring three things:", "bring: three things" …); why en/uz/ru updated |
| C6-se1316 | C1 | the stem repeated "nevertheless" after the blank, so every option doubled it | the stem's "nevertheless" removed |
| C6-se1706 | B1 | the stem repeated "even" ("very ______ even even") | the stem's "even" removed; one key "funny; even" |
| C6-se1717 | C1 | the stem repeated "when"; with it gone, "wheel, and, when" read as a second key | the stem's "when" removed; "wheel, and, when" replaced by "wheel; when,"; why en/uz/ru add the comma reason |
| C6-se1719 | C1 | the stem repeated "the" | the stem's "the" removed; one key "Tuesday; the" |
| C6-se1741 | C1 | the stem repeated "most" | the stem's "most" removed; one key "ago, most" |
| C6-se1748 | C1 | the stem repeated "by"; with it gone, "hours, and, by" read as a second key | the stem's "by" removed; "hours, and, by" replaced by "hours; by,"; why en/uz/ru add the "by"/"noon" reason |
| C6-se3818 | C1 | an option began with a mark ("exactly : how") | "exactly" moved into every option |
| C6-sem005 | B2 | an option began with a mark ("Students , who") | "Students" moved into every option |
| C19-se33q3 | C1 | every option ends with "and" and the stem repeated it ("meat; and and Gulnora") | the stem's "and" removed; options, whys and instructions as version 1 |

**C6-15** (pass 1: the fill-in errors and the boundaries and rhetorical_synthesis batches' length cues; pass 2: form_structure_sense, key
uniquely the shortest in 12 of 20, now 8 of 20)

| Item | Level | Version 1's defect | Version 2's change (why the new option is wrong) |
|---|---|---|---|
| C6-se3204 | B2 | key uniquely the shortest | "to spin" → "spin" ("but also spin": the pair needs "spins") |
| C6-se3205 | B2 | key uniquely the shortest | "having" → "are" ("are been driven" is not English; "neither" takes "has") |
| C6-se3210 | B2 | key uniquely the shortest | "to get" → "got" (after "can either buy … or", the base form "get") |
| C6-se3217 | C1 | key uniquely the shortest | "mentioning" → "mentions" ("neither showed … nor" needs "mentioned") |
| C6-se3302 | B1 | the distractor "car. The" doubled the stem's "the" | → "car" ("checked the car the oil") |
| C6-se3304 | B2 | batch length cue (boundaries) | "things; such as" → "things;" (a semicolon before a list) |
| C6-se3308 | B2 | an option began with a mark ("road : including") | "road" moved into every option; why en/uz/ru updated |
| C6-se3316 | C1 | the distractor "feast; the" doubled the stem's "the" | → "feast;" (a semicolon before a list) |
| C6-ei3301 | B1 | key uniquely and much the longest (`cue.length`) | lengthened "Since 1962, … a rope ferry, which can carry up to 6 cars at a time from one bank to the other." (the village's ferry, not what a rope ferry is) |
| C6-ei3303 | B2 | batch length cue | lengthened "…with sets that its crew of 11 builds by hand." (old facts, not the newest addition) |
| C6-ei3307 | B2 | `cue.length` | lengthened "…every weekend she takes the pots she has made this way to a market to sell them." (Gulshan's use, not what pit firing is) |
| C6-ei3309 | C1 | batch length cue | lengthened "…the 80-year-old stone bridge on the farm road…" (the problem unnamed, no fix) |
| C6-ei3318 | C1 | `cue.length` | lengthened "A snow fence, like the 3 kilometers that Bekzod Turgunov's crew puts up…" (what it does, not that it works) |

**C6-13 and C6-17 rhetorical_synthesis, and the single cue items of C6-3, C6-5, C6-6, C6-9** (version 1's defect: a length cue, the
key uniquely and much the longest, `cue.length`, or the batch's rate; C6-17 rhetorical_synthesis 25 of 30 → 6 of 30, C6-13 19 of 40 →
15 of 40)

| Item | Level | Version 2 change | Why the changed option stays wrong |
|---|---|---|---|
| C6-ei2208 | B2 | lengthened "…to buy the new equipment they needed." | a similarity; the goal is a difference |
| C6-ei2216 | C1 | lengthened "Mahbuba, who learned to bake from her own mother, …" | one woman only; the goal is a similarity |
| C6-ei2219 | C1 | lengthened "…three times as long as any other pupil in the whole class." | "any other pupil" is not in the notes |
| C6-ei2303 | B2 | lengthened "The kitchen window was the warmest … at every single reading that he took that week." | the result, not the method |
| C6-ei2309 | B2 | lengthened "…and so far this year every match has had full teams." | the change and its result, not why |
| C6-ei2314 | C1 | lengthened "This year, … ran for two days instead of one, and its best-selling stall sold pumpkin samsa."; why en/uz/ru say "a detail or two" | this year's details, not an overview |
| C6-ei2315 | C1 | lengthened "Shoxrux chose clay soil for his pepper seedlings, which need damp roots, …" | the choice and result, not the method |
| C6-ei2318 | C1 | lengthened "…and since January the school has thrown away half as much rubbish as before." | the bins and the result, not the process |
| C6-ei2319 | C1 | lengthened "…at the canteen door during lunch." | what they did, not the result |
| C6-ei2320 | C1 | key tightened ("from the ground" out); a distractor lengthened "…and now she plays the game with her own friends…" | where the game came from, not how it is played |
| C6-ei1722 | B1 | lengthened "…and this summer they put a net over its strawberry beds." | what, not why |
| C6-ei1723 | B1 | lengthened "…with cakes that the students had baked at home." | the sale, not its result |
| C6-ei1724 | B1 | lengthened "Olim and Botir, two neighbors who grow grapes…, both make raisins…" | a similarity |
| C6-ei1726 | B1 | lengthened "…a new wooden bench, made of pine boards, …" | who built it is missing |
| C6-ei1727 | B1 | lengthened "For the school film day, Class 8A made a film about a lost dog, while…" | a difference |
| C6-ei1729 | B2 | lengthened "…(a towel, a cotton shirt and a wool sock), the cotton square was the first to dry." | the result, not the method |
| C6-ei1730 | B2 | lengthened "…whose paint had cracked and whose hinges had rusted…" | how long is missing |
| C6-ei1731 | B2 | lengthened "…a free glass of milk, which comes from a farm near the school, …" | no numbers, no change |
| C6-ei1732 | B2 | lengthened "…in the park … when the films start at about 9 p.m." | nothing about free |
| C6-ei1734 | B2 | lengthened "…is free to use and is open every weekend, on Saturdays and Sundays." | when, not who may use it |
| C6-ei1735 | C1 | lengthened "…two kinds of melon: large striped ones and small yellow ones." | no harvest, no expectation |
| C6-ei1736 | C1 | lengthened "…by watching videos…, while his cousin Zarina learned from her aunt, who runs a small café." | a difference |
| C6-ei1737 | C1 | lengthened "…which charges the same price as the new indoor one." | last year's number and the price, not why fewer |
| C6-ei1739 | C1 | key tightened ("during group work" out); a distractor lengthened "…so they glued felt pads under all 30 chairs." | the aim and the act, no outcome |
| C6-ei1740 | C1 | lengthened "…the 45-kilometer road, which takes about one hour by car." | no recommendation for small children |
| C6-ei1753 | C1 | key tightened ("for waiting passengers" out); a distractor lengthened "Before the new stops and their request buttons were put up…" | the old problem, not how it works |
| C6-ei1756 | C1 | key tightened; a distractor lengthened "…in whose upper branches birds nest every spring, is the tallest tree…" | neither age nor width |
| C6-ei1758 | C1 | lengthened "This winter, the caretaker laid rubber mats … and the mats keep their grip even when wet." | the solution only, no problem |
| C6-ei1760 | C1 | key tightened ("a game for sunny days" out); a distractor lengthened "Shadow tag is a game for sunny days, and it is best played…" | not how a player becomes "it" |
| C6-iih001 | C1 | lengthened "The Canon was used as a textbook in Europe only after later physicians had rewritten and reordered all five of its volumes." | not in the text |
| C6-eie007 | B1 | lengthened "Ibn Sina, who wrote The Canon…, a medical encyclopedia in five volumes, was born…"; why en/uz/ru no longer name the key by position ("the first choice") | birth and size, not how long |
| C6-eim006 | B2 | lengthened "First cultivated by Turkish and Persian people, tulips later set off…"; why en/uz/ru rewritten (position) | starts at cultivation, no wild origins |
| C6-eih007 | C1 | lengthened "…five meters farther than Design A, which had wide wings."; why en/uz/ru rewritten (position) | one side only (distance) |
| C6-ii2n03 | B1 | lengthened "Rano laughed so loudly … that the people sitting outside the café across the street all turned around to look at her." | loud, not patient |

**C7** (version 1's defect, the scanner's `fill.double_word`: a distractor doubled the stem's "the"; and `C7-ir4909`)

| Item | Level | Version 1's defect | Version 2's change |
|---|---|---|---|
| C7-ir4807 | B1 | "the booking office" read "on the the booking office" | → "booking office" (not in the text) |
| C7-ir4815 | B2 | "the helmet lamps" doubled "the" | → "helmet lamps" (not the reason) |
| C7-ir4110 | B2 | "the farm gate" read "at the the farm gate" and repeated the key's own words | → "local shops" (contradicts "rather than selling to shops"); why en/uz/ru rewritten |
| C7-ir4909 | B1 | quarantined in round 3: "rods called ______" was answerable without the passage (only "speats" names anything), and step 1 gave `ir4908`'s key "salty water" | the blank asks where the fish dry: "near an open ______" with window (key, paragraph C), fire, door, hearth; step 1 "cleaned and soaked"; why en/uz/ru rewritten; round 3's reason kept with a v2 note |

## Lessons

78 of the 79 ids sit in 15 lessons' pieces or reserves (`check-2/lessons.ts`); `C7-ir4909` is in none (round 3's integration took it out
of `C19-IERE04-2`'s reserve, now 39). While these were drafts, `unservedOf` held each of the 15. After this pass none holds an unserved id:

| Lesson | File (C19) | P13 ids | Unserved now |
|---|---|---:|---|
| C19-RWCS02-2 | C19-15.json | 11 | none |
| C19-RWCS02-3 | C19-15.json | 7 | none |
| C19-RWSE01-3 | C19-17.json | 2 | none |
| C19-RWEI02-2 | C19-19.json | 3 | none |
| C19-RWEI02-3 | C19-19.json | 7 | none |
| C19-RWSE03-2 | C19-21.json | 4 | none |
| C19-RWSE03-3 | C19-21.json | 6 (with its trap question `C19-se33q3`) | none |
| C19-RWEI03-3 | C19-21.json | 5 | none |
| C19-RWII01-1 | C19-3.json | 1 | none |
| C19-RWSE01-1 | C19-4.json | 4 | none |
| C19-RWSE03-1 | C19-4.json | 2 | none |
| C19-RWEI02-1 | C19-5.json | 18 | none |
| C19-RWEI03-1 | C19-5.json | 4 | none |
| C19-RWII02-1 | C19-5.json | 1 | none |
| C19-IERE04-1 | C19-7.json | 3 | none |

No lesson record, reserve or piece is touched by this pass.

## Uzbek and Russian

**Checker 1's fixes** (`.superpowers/p13/check-1-uz-ru.json`, sha256 `52eddd87…`): **9 fixes on 7 items**, each an `old` line of one
field and its `new` text: 6 of a `why.uz`, 3 of a `why.ru` (`se1717` and `eim006` both). P13s2 read each against the English `why` and the other
language and applied it only when its `old` is the field exactly once, the escaped string occurs once in the file, the edit changes that
field and nothing else, and the new line passes the lint (`check-2/apply-fixes.cjs`; log `check-2/uz-ru-applied.json`). **Applied: 9**
(8 as written, 1 shortened). **Refused: 0.** A `why` is no part of what a solver sees (the blind copy's signature is the stem and the
options), so the key checks above hold.

| Item | Field | Checker 1's reason (abridged) | Result |
|---|---|---|---|
| C6-se1717 | `why.uz` | «uning gapi» reads "his/her sentence"; the rule is no comma after «when» inside its clause | applied, shortened: checker 1's line is 202 characters, over the 200 the validator and the tests allow; «undan» dropped («when» va keyingi soʻzlar orasiga vergul qoʻyilmaydi) |
| C6-se1717 | `why.ru` | «его предложением» is vague; "between «when» and the rest of the subordinate clause" | applied |
| C6-eie007 | `why.uz` | noun predicate takes a dash (Maqsad — …); «"for centuries" bor javob» lacks its noun: «soʻzlari bor javob» | applied |
| C6-eim006 | `why.uz` | the key's first word is "Tulips"; what starts in the mountains is the history it tells | applied |
| C6-eim006 | `why.ru` | «вариант, начинающийся с гор» says the option's text begins with the mountains | applied |
| C6-eih007 | `why.uz` | «faqat ikkalasini qiyoslagan javob» fits two options (the distance distractor also compares); name B ahead in distance and A in time in the air, as en and ru do | applied |
| C7-ir4909 | `why.ru` | «"fire" — следующий этап» says the fire IS the next stage | applied |
| C6-ei2318 | `why.uz` | the uz drops the en/ru second sentence ("A list of bins is one step") that rules out the lengthened distractor | applied |
| C6-ei1760 | `why.uz` | the uz drops the en/ru clause "another stops halfway" | applied |

**Lint.** After the fixes, `check-2/lint79.cjs` (round 2's rules: any ' ‘ ’ ` ´ in uz, U+02BB after a letter other than o/g, U+02BC
after o/g, Cyrillic in uz, U+02BB/U+02BC in ru, a `why` over 200 characters, double spaces, a missing or short `why`) over the 316 uz and
ru lines (why and instructions) of the 79 items: **0 findings**.

## What the write changed

`reconcile.ts --write` re-serialises each file it touches. Eleven of the fourteen files are in their own `JSON.stringify(…, null, 2)` form
and `C7-8.json` in the one-space form it detects, so nothing else in them moved. `C6-4.json` and `C6-5.json` write ten `prior_b` values as
`0.0`, which the re-serialisation printed as `0`; P13s2 put the ten `0.0` back in each (the only `.0` numbers in those files), so their
diff is the record of one item each. Against `HEAD`, the 79 items differ in `status`, `key_check_2` and the new `key_check_2_version`;
seven of them also in the nine uz and ru lines above. Each key, option, stem, passage, English `why`, level and version is as the authors
wrote it. `check-2/diffcheck.cjs` diffs every item of the fourteen files against `HEAD`: **0 problems**; LF, no BOM; no top-level field
(note, lessons) changed. No C19 lesson, passage or reserve is touched.

The authors' tests pinned the as-written state (draft, no key check 2, the lesson held) and now read both states, the precedent of
`p12-fix3.test.ts`: `p13-fix-a.test.ts` (a draft with no key check 2, or `verified_auto` with `blind:P13s1+P13s2` and
`key_check_2_version` 2; `blind.ts --pending` takes every one still a draft and leaves out only the keyed ones) and `p13-fix-b.test.ts`
(the same record rule; `C19-RWSE03-3` is held by `C19-se33q3` only while it is a draft).

## Checks after the write and the fixes

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 858 warnings, 289 notes** after the write and the fixes,
  the counts of fix-a's and fix-b's runs, and 290 notes with this file (one more `file.skipped`); no finding on any of the 79 items. C6 is
  now 1440 `verified_auto`, C19 372 `verified_auto` (`check-2/logs/validate.log`, `validate-2.log`).
- `tests/unit/content/p13-fix-a.test.ts` and `p13-fix-b.test.ts`: **12 pass** (7 and 5) (`check-2/logs/vitest-p13.log`). Run, as the
  authors did, with the DB-free config `.superpowers/p13/fixb-scan/vitest.nodb.config.ts` (Postgres :5433 is not running here and the
  repo's global setup migrates it first), `ANTHROPIC_API_KEY` empty.
- Related tests (`check-2/logs/vitest-related.log`, 6 files, 55 tests pass): `blind`, `c19-loader`, `committed-content`, `keycheck`,
  `reconcile`, `reconcile-cli`.
- The older rounds' tests that pin these records (`check-2/logs/vitest-pins.log`): fix-a's run left 12 files with 27 failing tests; after
  this pass 6 files pass (`p8-a2`, `p10-rw1`, `p10-iere`, `p11-cs`, `p11-ei`, `p12-fix3`) and **8 tests in 6 files still fail, all on
  version 1's record**: the author pins (`p10-rw2`: `C6-se1706` "agent:p10-rw2"; `p11-se`: `C6-se3818`; `p8b-a3`: `C19-se33q3`), the
  version-and-author pins of `p8-a1` and `p8b-a1`, and `p12-iere-b`'s three (`C7-ir4909` pinned `quarantine` and out of every reserve,
  its version-1 record, and "no validator note on C7-13", which now has `ir4909`'s `status.history` note: a served item keeping its
  version 1 `quarantine_reason`).

## For the integrator (not changed here)

- The 79 items are `verified_auto` at version 2 and every lesson that holds one is served again (none held by `unservedOf`).
- `C7-ir4909` (version 2, `verified_auto`) is in no reserve: put it back into `C19-IERE04-2`'s reserve (39 → 40) if that lesson should
  draw from 40 again.
- The 8 failing tests above pin version 1's authors, versions and statuses; they need the version 2 records (as `p12-fix3.test.ts` reads
  both states).
