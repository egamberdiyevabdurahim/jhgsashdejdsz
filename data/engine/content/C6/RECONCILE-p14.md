# C1, C4, C6, C7, C18, C19, K1-mid and K5: key check 2 of the P14 content lane's version+1 items (18 Oct 2026)

The P14 content lane (branch `p14-content`, worktree `jg-p5content`, commit `01dc97fe`, author `agent:p14-content`) wrote version+1
drafts of the 51 items P13 left open (`.superpowers/p14/V2-LIST.json` in the integration worktree `jg-p5int`, ids only). An item is
served only when two blind solvers outside the author's session agree with its key and none finds a second correct option (spec §5.5
step 4; SPEC-lessons rev. 2, §9.1 step 3); a family is keyed by its 50-instance independent-solver check. P14 blind checkers 1 and 2
(P14s1, P14s2) keyed them. This file is checker 2's record (P14s2, who ran the reconcile).

| Bank | File | Items | Version |
|---|---|---|---|
| C1 | `C1/C1-12.json` | `C1-r3a003` (family, calc, power_rule) | 2 |
| C1 | `C1/C1-13.json` | `C1-r3b015` (family, geom, circles), `C1-r3b019` (family, alg1, probability) | 2 |
| C4 | `C4/C4-5.json` | `C4-b23h05`, `b23h09`, `b24h01`, `b24h08`, `b26h07` (5, all B2) | 2 |
| C6 | `C6/C6-10.json` | `C6-cs1203`, `cs1204`, `cs2206`, `cs2304`, `cs2310` (5) | 2 |
| C6 | `C6/C6-13.json` | `C6-ei1307`, `ei2205`, `ei2304`, `ei2310` (4) | 2 |
| C6 | `C6/C6-15.json` | `C6-ei3216`, `ei3308`, `se3206`, `se3214`, `se3301`, `se3307` (6) | 2 |
| C6 | `C6/C6-16.json` | `C6-ii2611`, `ii2615`, `ii2619` (3) | 2 |
| C6 | `C6/C6-17.json` | `C6-ei1707` (1) | 2 |
| C6 | `C6/C6-6.json` | `C6-eih009`, `eim005` (2) | 2 |
| C7 | `C7/C7-12.json` | `C7-ia1210`, `ia2101`, `ia2102`, `ia2103`, `ia2106`, `ia2108`, `ia2111`, `ia2117` (8) | 2 |
| C7 | `C7/C7-7.json` | `C7-ir2101` (1) | 2 |
| C18 | `C18/C18-10.json` | `C18-bip034`, `bip036` (2) | 2 |
| C18 | `C18/C18-12.json` | `C18-chp036` (1) | 2 |
| C18 | `C18/C18-28.json` | `C18-him022`, `him026` (2) | 2 |
| C18 | `C18/C18-30.json` | `C18-bim016` (1) | 2 |
| C19 | `C19/C19-15.json` | `C19-cs22q3` (1) | 2 |
| C19 | `C19/C19-5.json` | `C19-ii21q1` (1) | 2 |
| K1-mid | `K1-mid/K1-mid-6.json` | `K1-b2r012` (1) | 2 |
| K5 | `K5/K5-6.json` | `K5-enh1q1` (passage `K5-P-enh1`), `K5-enm4q4` (passage `K5-P-enm4`) | 2, 3 |
| K5 | `K5/K5-4.json` | `K5-ruh2q1` (passage `K5-P-ruh2`) | 3 |
| K5 | `K5/K5-1.json` | `K5-uze3q3` (passage `K5-P-uze3`) | 3 |

Before this pass all 51 were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, no `key_check_2_version`, the key still
`options[0]`. The three K5 version 3 items keep their `quarantine_reason` (blind check 1, 7 Oct: `no_passage_needed`) as history.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P14s1 (checker 1) | `.superpowers/p14/blind/<stream>-P14s1.json` for C4 (5), C6 (21), C7 (9), C18 (6), C19 (2), K1-mid (1), K5 (4) | `.superpowers/p14/blind/<stream>-P14s1.answers.json` |
| P14s2 (checker 2, who ran the reconcile and wrote this file) | `.superpowers/p14/blind/<stream>-P14s2.json`, the same 48 ids | `.superpowers/p14/blind/<stream>-P14s2.answers.json` |

P14s2's copy: `npx tsx scripts/content/blind.ts <stream> P14s2 --pending --blind <staging>` for each bank (C1 gave 0 items: a family is
left out of a blind copy; K1's stream is `K1-mid`), then `.superpowers/p14/check-2/filter.cjs` kept exactly the V2-LIST ids of each copy
and its map and wrote them into `.superpowers/p14/blind/`, unprinted (dropped: C7's 25 older quarantined `C7-rs*` and K5's
`uzh2q3`, `ruh3q3`, `ruh3q4`, none of them P14's); the staging files were deleted. A copy holds each item's stem, its passage when it
has one, its options shuffled by the solver's own seed and lettered A-D, and the instructions; no key, no `why`. Both solvers' copies,
answers and maps sit in the one folder `reconcile.ts` reads.

Each solver was a separate agent run, and neither is the author's session (D26; `src/engine/content/keycheck.ts`): `agentOf` reads
P14s1, P14s2 and `p14-content` as three agents (none matches a `SESSIONS` pattern), so `keyCheckOf("blind:P14s1+P14s2", { author:
"agent:p14-content" })` is `{ kind: "blind", n: 2 }`. P14s2 was told no key: the brief that started it named the ids file, the folders
and the process, no stem, option or key. It opened neither `.map-*` file, nor the item records, nor the author's ledger, notes, logs,
tests or commit message, nor checker 1's answers, before it wrote its own: it read each item in its copy
(`.superpowers/p14/check-2/dump.cjs` prints the copy as text), read the sentence with every option in the blank for each fill-in item,
chose a letter, and wrote its answers with a one-line reading per item. P14s2 first listed checker 1's files in the folder after its
own seven answers files were written, and read them only then. Only `reconcile.ts` read the maps. After its answers were written, P14s2 read checker 1's answers and notes and the 51 records' key-check fields
(`check-2/recs.cjs`: file, author, version, status, key checks; no stem, option or why).

## The families (C1)

A family is left out of every blind copy; it is keyed by its formula against the independent solver on 50 seeded instances
(`family-check.ts`, `checkFamily`). P14s2 ran it (`check-2/fam.ts`, which prints verdicts and counts only):

| Family | Variants | `checkFamily` | Independent | P14s2's own blind instances |
|---|---:|---|---|---|
| `C1-r3a003` (f′(x) of a√x + bx) | 192 | verified, 50/50, no disagreement, no problem | relation | 6/6 |
| `C1-r3b015` (arc of a minute hand, kπ) | 47 | verified, 50/50, no disagreement, no problem | relation | 6/6 |
| `C1-r3b019` (green apples from P(red)) | 21 | verified, 50/50, no disagreement, no problem | relation | 6/6 |

Beyond what the process requires, P14s2 drew 6 instances of each family with its own seeds (`P14s2:0` … `P14s2:5`), shuffled each
instance's options and lettered them, kept the key's letter in a map it did not print (`check-2/fam/`), solved all 18 by hand
(f′(x) = a/(2√x) + b; k = 2rt/60; g = r(1 − p)/p) and compared (`check-2/famcmp.cjs`): **18 of 18 agree with the family's key**, and
no instance shows two equal options or a second correct one. The record is `key_check_2: "solver:relation@50"`, written by
`reconcile.ts C1 --records --write` from the validator's family check.

## The decision

- `npx tsx scripts/content/reconcile.ts <stream> P14s1 P14s2 --blind .superpowers/p14/blind --write` for each stream with items
  (dry runs first, the same decisions):

| Stream | Items in the stream | Verified | Quarantine | Pending | Blocked | Skipped |
|---|---:|---:|---:|---:|---:|---:|
| C6 | 1440 | 21 | 0 | 0 | 0 | 1419 |
| C7 | 499 | 9 | 0 | 0 | 0 | 490 |
| C18 | 800 | 6 | 0 | 0 | 0 | 794 |
| C19 | 372 | 2 | 0 | 0 | 0 | 370 |
| C4 | 312 | 5 | 0 | 0 | 0 | 307 |
| K1-mid | 120 | 1 | 0 | 0 | 0 | 119 |
| K5 | 120 | 4 | 0 | 0 | 0 | 116 |
| C1 (`--records`: the families from the validator's 50-instance check) | 233 | 3 | 0 | 0 | 0 | 230 |

**Both solvers chose the key on all 48 non-family items**, and the three families hold 50/50. No answer was stale, and neither answers
file raises `two_defensible`, `unanswerable` or `no_passage_needed`; checker 1's notes say "One correct option" for every fill-in item,
as P14s2's do. The decisions are kept in `.superpowers/p14/blind/<stream>-reconcile.json` (C1: `C1-reconcile-records.json`).

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **51** | 48 with `key_check_2: "blind:P14s1+P14s2"`, 3 families with `"solver:relation@50"`; `key_check_2_version` = the item's version (2, or 3 for `K5-enm4q4`, `K5-ruh2q1`, `K5-uze3q3`) |
| `quarantine` | **0** | none |

**Verified: 51. Quarantined: 0.** No item drew a disagreement, a second correct option or a flag from either solver.

## Every fill-in item, every option in the sentence

P14s2 read each of the 13 fill-in items with each option in its blank. In none is a second option correct.

| Item | Key in the sentence | Each other option, and why it is wrong |
|---|---|---|
| C4-b23h05 | "The workers negotiated with the owner for two more days off." | "negotiated by", "to", "from the owner" (not how English says bargaining with someone) |
| C4-b26h07 | "If the city does not maintain it, the park will soon be lost." | "benefit it" (grammatical, but it is not looking after the park, which is what "nobody waters … or repairs" asks), "shade it" (no sense), "complain it" (no object without "about") |
| C6-cs1203 | "by Friday he was friendly with almost everyone, laughing with them at break and sharing his lunch" | "bored with", "impatient with", "angry with" (grammatical; they contradict the laughing and sharing) |
| C6-cs1204 | "now find the reading room convenient for their work" | "noisy" (the canteen was the noisy place), "uncomfortable" (twenty new chairs), "expensive" (nothing about cost) |
| C6-ei1307 | "… left her umbrella at home every day. However, on Wednesday afternoon a sudden shower soaked her" | "Similarly,", "For example,", "Also," (no contrast with the forecast) |
| C6-ei1707 | "… too rusty to ride. However, after a little oil on the chain … it ran perfectly" | "Also,", "Therefore,", "For example," (no contrast) |
| C6-eim005 | "he first cut every sentence that repeated an earlier point. Next, he replaced long examples" | "In contrast,", "Yet,", "Nevertheless," (the second step does not oppose the first) |
| C6-ei3216 | "Most … come for its farm tools. In particular, the wooden plow in the first room … draws a crowd" | "Nevertheless,", "On the other hand," (contrast), "Admittedly," (concession): none fits one tool singled out |
| C6-se3206 | "visitors can both walk past the sleeping animals … and watch a short film" | "to watch", "watching" (not parallel with "walk" after "can"), "sees" (not a base form; disagrees) |
| C6-se3214 | "only one of the two ferries, both built by the same family …, is still carrying passengers" | "are", "were" (plural; the subject is "one"), "be" (no finite verb) |
| C6-se3301 | "The jars of apricot jam on the top shelf of the kitchen were made by our neighbor last summer" | "kitchen; were", "kitchen, were" (a mark between the subject and its verb), "kitchen was" (disagrees with "jars") |
| C6-se3307 | "The narrow path along the edge of the high cliffs above the sea leads to a small stone hut" | "sea, leads", "sea; leads" (a mark between the subject and its verb), "sea lead" (disagrees with "path") |
| C6-ii2619 | "the results of her two tests were close for each candle, differing by no more than 3 minutes" (beeswax 3, paraffin 2, soy 3) | "were exactly the same" (they differ), "differed the most for the paraffin candle" (it differed least), "showed the soy candle burning the longest" (beeswax did) |

## Every other item: the key, and why the others are wrong

Verdict for every row: **verified_auto** (P14s1 and P14s2 both chose the key; `blind:P14s1+P14s2`, `key_check_2_version` = version).
The reading is P14s2's; checker 1's notes give the same reading for every item.

| Item | Level | Key | Why the others are wrong |
|---|---|---|---|
| C6-cs2206 | B2 | "It presents the response to the situation described in the first sentence." | sentence 2 is no example of the problem, says nothing about needing books, and does not describe the bus-stop evenings |
| C6-cs2304 | B2 | "To explain the reason for a feature of the village's houses" | no belief is challenged, nothing argues for rebuilding, the busy road is the past one |
| C6-cs2310 | B2 | "It presents a common view of the cats, then gives one person's reason to see them more positively." | the fishmonger's evidence goes against the common view; no removal is argued; the cats' origin is not given |
| C6-ei2205 | B1 | "The small reading room has only 12 seats, while the large one has 40." | the others give a similarity (both open until 5) or one room only |
| C6-ei2304 | B2 | "The swap shelf in Block 7 is a bookshelf where neighbours leave things they no longer need, free for anyone to take." | the others give who started it, what is popular, or how popular it is, never what it is |
| C6-ei2310 | B2 | "The next day, the pupils who learned with music and those who learned in silence both remembered about 14 of the 20 words." | "music helps" contradicts the result; the others are the aim and the method |
| C6-ei3308 | B2 | "Though the 50-minute ferry is slower than the 30-minute drive around the bay, a ticket costs only a third of the fuel for the drive." | the reversed sentence puts the slowness in the main clause (it emphasizes the wrong point); the cost-only one does not acknowledge the speed; the birds one is off the goal |
| C6-eih009 | C1 | "Because the trip north takes several generations, the monarchs that fly south are not the ones that flew north." | "to Mexico and back" suggests the same butterflies return; the other two give only the winter sites |
| C6-ii2611 | B1 | "The family made 18 jars of apricot jam, more than of any other fruit." | the others compare other fruits and do not show apricot is the most |
| C6-ii2615 | B2 | "Phone time peaked on Friday (110) and Wednesday (95), her two lowest homework days (55, 60)." | "highest on Monday (40) and Tuesday (45)" misreads the table; the others name one day |
| C7-ia1210 | B2 | "Wednesday" | Tuesday is the term-time day, Thursday the public-holiday move, Monday is not in the text |
| C7-ia2101 | B1 | "The whole trip takes much longer than the flight itself." | sunrise, not evening; eight passengers, not twelve; visitors from abroad not given |
| C7-ia2102 | B1 | "Passengers walk back to the field after landing." (FALSE) | a minibus brings them back; "breakfast is included in the price" is not given (it is served; no price is named), so it is not the FALSE one; the other two agree with the text |
| C7-ia2103 | B1 | "Each pair of pupils works with one learner." | at the Day Centre, not the school; afternoons, not mornings; pay not given |
| C7-ia2106 | B1 | "In summer, people can drive over the pass at night." | chains go on at a lay-by halfway up; carried December to March only; "the best view" not given |
| C7-ia2108 | B2 | "This year over twice as many pupils entered." | the poem's author not given; framed for a year, not for good; by post "for the first time" |
| C7-ia2111 | B1 | "Visitors pay according to how much fruit they pick." | sweetest not given; no ladders; three weeks in June |
| C7-ia2117 | B1 | "The ice for the sculptures is taken from the lake." | visitors vote, not judges; teams' countries not given; three days, not one |
| C7-ir2101 | B1 | "The market has more stalls now than when it began." | musicians' pay not given; May to September only; "most sell hot food" not given |
| C18-bip034 | medium | "anofeles chivinining urgʻochisi" / «самка комара анофелес» | the male Anopheles does not bite; house fly and rat flea do not carry malaria |
| C18-bip036 | medium | "zamburugʻ va suvoʻt" / «гриба и водоросли» | moss, fern, bacterium and virus are not a lichen's partners |
| C18-chp036 | easy | "reaksiyani tezlashtiradi va oʻzi sarflanmaydi" / «ускоряет реакцию и сам не расходуется» | a catalyst does not become product, change the heat effect or shift the equilibrium |
| C18-him022 | medium | "Samarqand yaqinidagi Xartangda" / «в Хартанге близ Самарканда» | not Mecca, Gʻijduvon or Baghdad |
| C18-him026 | medium | "chigʻatoy tilida" / «на чагатайском» | Persian is its later translation; not Arabic or Ottoman Turkish |
| C18-bim016 | medium | "plazmatik hujayralar" / «плазматические клетки» | erythrocytes, nerve cells and platelets make no antibodies |
| C19-cs22q3 | B2 | "It describes what the grandfather records in his notebook." | the teacher's use is sentence 3; no argument; no single day's temperature |
| C19-ii21q1 | B1 | "During the same hot week, soil under dry leaves stayed wet for four days, while bare soil dried out after one day." | colour, storing leaves and plants' leaf size say nothing of soil moisture |
| C4-b23h09 | B2 | "to talk in order to agree on something" | refuse to listen, work longer, leave a job are other meanings |
| C4-b24h01 | B2 | "what you decide after studying the facts" | a question, a mistake, the first page (a report's conclusion is at its end) |
| C4-b24h08 | B2 | "We need more evidence before we decide." | "evidence" is uncountable: no "three evidences", "An evidence", "The evidences shows" |
| K1-b2r012 | B2 | "buy something he has long wanted" | nothing points to a review, a shop of his own, or saving again |
| K5-uze3q3 | easy | "Ochiq qolgan garaj eshigidan kirib olgan" | Father's «Bundan keyin garaj eshigini yopib yuramiz» points to the open door; no roof hole, window, or carrying of the box is in the text |
| K5-ruh2q1 | hard | «Картофель и макароны» | «например картофель или макароны»; beans, eggs and lentils are not in the text |
| K5-enm4q4 | medium | "How do bees show what kind of flower they found?" (NOT answered) | the text answers what a straight-up run means, where they dance (the vertical comb) and how distance is shown (the waggle's length) |
| K5-enh1q1 | hard | "Begin the essay with the swimming lesson" | "Begin there" (page two, the swimming lesson); she asks for less river at the start, not more; no topic change; the grandfather part is what she wants first |

## The four K5 passage items: no formal no-passage solver

Spec §5.5 step 4 has reading items also face a no-passage solver, and version 1 of `K5-enm4q4`, `K5-ruh2q1` and `K5-uze3q3` was
quarantined for exactly that (`no_passage_needed`, 7 Oct). **Neither checker ran as a no-passage solver in this pass** (no
`--no-passage` copy; `reconcile.ts` applies that rule only to a solver named with `--no-passage`). What there is:

- Checker 1's notes: `K5-uze3q3` "Needs the passage: without it D is only a guess among four plausible ways"; `K5-ruh2q1` "Every option
  has potato, so the title alone does not give it". No note on `K5-enm4q4` or `K5-enh1q1`.
- P14s2 read every passage with its question (its copy holds the passage), so its own view is no blind no-passage solve. It still
  judges `K5-enm4q4` the one at risk: a solver who knows the waggle dance (it carries direction and distance, not the kind of flower)
  could guess the NOT-answered question without the text, though a text on the dance could well have named the flower's scent, so the
  text is still what decides. `K5-enh1q1`'s key ("swimming lesson") cannot be reached from its title "Page Two"; `K5-ruh2q1`'s second
  food and `K5-uze3q3`'s open door are guesses among plausible options without the text.

None of this is a flag either solver raised, so the four are verified by the rule above. A no-passage solve by a fresh agent
(`blind.ts K5 <name> --no-passage`, then `reconcile.ts K5 … --no-passage <name> --audit`) would settle `K5-enm4q4`.

## Lessons

35 of the 51 ids sit in 18 C19 lessons (`check-2/lessons.ts`, which reads every bank's lesson records): 32 in 15 lessons' pieces or
reserves, and each C1 family in one lesson's homework `families` (`C1-r3a003` in `C19-APCA02-2`, `C1-r3b015` in `C19-MAGT03-3`,
`C1-r3b019` in `C19-MAPS03-1`). After this pass `unservedOf` holds no unserved id in any of the 18:

| Lesson | File (C19) | P14 ids | Unserved now |
|---|---|---|---|
| C19-RWCS01-2 | C19-15.json | `C6-cs1203`, `cs1204` | none |
| C19-RWCS02-2 | C19-15.json | `C19-cs22q3`, `C6-cs2206` | none |
| C19-RWCS02-3 | C19-15.json | `C6-cs2304`, `cs2310` | none |
| C19-RWEI01-1 | C19-5.json | `C6-eim005`, `ei1707` | none |
| C19-RWEI01-3 | C19-19.json | `C6-ei1307` | none |
| C19-RWEI02-1 | C19-5.json | `C6-eih009` | none |
| C19-RWEI02-2 | C19-19.json | `C6-ei2205` | none |
| C19-RWEI02-3 | C19-19.json | `C6-ei2304`, `ei2310` | none |
| C19-RWEI03-2 | C19-21.json | `C6-ei3216` | none |
| C19-RWEI03-3 | C19-21.json | `C6-ei3308` | none |
| C19-RWII02-1 | C19-5.json | `C19-ii21q1`, `C6-ii2611`, `ii2615`, `ii2619` | none |
| C19-RWSE03-2 | C19-21.json | `C6-se3206`, `se3214` | none |
| C19-RWSE03-3 | C19-21.json | `C6-se3301`, `se3307` | none |
| C19-IERE01-2 | C19-22.json | `C7-ia1210` | none |
| C19-IERE02-1 | C19-6.json | `C7-ir2101`, `ia2101`, `ia2102`, `ia2103`, `ia2106`, `ia2108`, `ia2111`, `ia2117` | none |
| C19-APCA02-2 | C19-11.json | `C1-r3a003` (homework family) | none |
| C19-MAGT03-3 | C19-10.json | `C1-r3b015` (homework family) | none |
| C19-MAPS03-1 | C19-2.json | `C1-r3b019` (homework family) | none |

The C18, C4, K1 and K5 ids are in no lesson (the six C18 ones are named in `C18/fact-check.json`, three of them also in `C18/mocks.json`;
the five C4 ones in `C4/units.json`; the three families also in `C1/error_rules.json`; none of those files is touched). No lesson record, reserve or piece is touched.

## What the write changed

`reconcile.ts --write` re-serialises each file it touches. The 17 files other than C18's were already in their own
`JSON.stringify` form, so nothing else in them moved. The four C18 files (`C18-10`, `C18-12`, `C18-28`, `C18-30`) write 33 `prior_b`
values as `0.0`, which the re-serialisation printed as `0` (the P13 precedent, `C6-4`/`C6-5`). `check-2/restore.cjs` rebuilt each
changed file from its `HEAD` text with only the record edits of the 51 ids (`key_check_2`, `status`, and `key_check_2_version`
appended after the item's last field, as `applyDecision` does) and wrote it only when its parse is deep-equal to what `reconcile.ts`
wrote: for the 17 other files the rebuild is byte-identical to the written text (which checks the method), and the four C18 files
were rewritten, their `0.0` back. `check-2/diffcheck.cjs` diffs every item of the 21 files against `HEAD`: **0 problems**; the 51 items
differ only in `status`, `key_check_2` and the new `key_check_2_version`, and the text diff holds no other line (a last field gains
its comma); LF, no BOM, no top-level field changed. Each key, option, stem, passage, `why`, level, version and author is as the author
wrote it.

## Checks after the write

- `npx tsx scripts/content/validate.ts --no-families --all`: exit 0, **0 errors, 860 warnings, 292 notes**: the same errors and
  warnings as before the pass, and one more note (`file.skipped` 51 → 52, this file). C1 is now 233 `verified_auto` of 233, C4 312 of 312, C6 1440 of
  1440, C18 800 of 800, C19 372 of 372, K1-mid 120 of 120; C7 447 of 499 and K5 117 of 120, the rest older drafts and quarantines that are not P14's
  (`check-2/logs/validate-before.log`, `validate-after.log`).
- `npx tsx scripts/content/scan.ts --out …`: exit 0, **2 findings, 0 errors, 0 on served items**, the same two as before the pass
  (`cue.length` warnings on the quarantined `C7-rs5q02`, `rs5q05`, not P14's) (`check-2/scan-before/`, `scan-after/`).
- `tests/unit/content/p14-content.test.ts`: **5 pass** (it reads both states: a draft with no key check 2, or `verified_auto` with the
  version's record and `keyCheckOf` "blind", "solver" for a family). Run with the DB-free config
  `.superpowers/p13/fixb-scan/vitest.nodb.config.ts` (Postgres :5433 is not running here and the repo's global setup migrates it),
  `ANTHROPIC_API_KEY` empty.
- Related: `blind`, `keycheck`, `reconcile`, `reconcile-cli`, `scan` (65 pass); `committed-content`, `c19-loader` (9 pass); the lesson
  tests that name these ids, `lesson-asks-its-page`, `lesson-c19-apca12`, `lesson-p7-a2` (20 pass).
- The older rounds' tests that name these ids (`check-2/logs/vitest-pins1.log`): `choice-wording` passes; **4 tests in 3 files fail,
  all on version 1's record, which the author's version+1 changed and this pass does not touch**: `p12-math-a` and `p12-math-b` pin
  `C1-r3a003`/`C1-r3b015` at `version: 1` and their round-3 authors; `p8-a1-rw-craft-lessons` pins every C19-15 and C6-10 item at version 1 by
  `agent:p8-a1` unless it is one of P13's version 2 records (P14's `C19-cs22q3`, `C6-cs1203` … `cs2310` are version 2 by
  `agent:p14-content`), and expects the `cue.length` warning on C19-15/C6-10 that version 2 removed.

## For the integrator (not changed here)

- The 51 items are `verified_auto` at their version, and no lesson that holds one is held by `unservedOf`.
- The 4 failing pins above need the version+1 records (as `p14-content.test.ts` and `p12-fix3.test.ts` read both states).
- The four K5 passage items had no formal no-passage solver (above); a fresh agent's `--no-passage` solve would settle `K5-enm4q4`.
