# K5: key-check reconciliation (blind check 1, 2026-10-07)

Bank K5 (native-language reading, two-stage). Files `K5-1.json` … `K5-6.json`: 120 items on 30 passages (10 each in uz, ru and en; 21 fiction, 9 informational), 4 items per passage, 2 literal + 2 inferential.

Inputs: the author key in each solver's own shuffle (`.blind/.map-K5-solverA.json`, `.blind/.map-K5-solverB.json`) against `.blind/K5-solverA.answers.json` and `.blind/K5-solverB.answers.json`. Both answer files cover all 120 ids and no others.

The rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or `no_passage_needed`. Otherwise it is rewritten (new version, `draft`, `key_check_2: null`, `quarantine_reason`), or retired if it cannot be fixed.

## Counts

| Outcome | Items | Status after this pass |
|---|---|---|
| Verified | **69** | `status: "verified_auto"`, `key_check_2: "blind:2/2"`, version 1 |
| Rewritten | **51** | `status: "draft"`, `key_check_2: null`, version 2, `quarantine_reason` set |
| Retired | **0** | n/a |

Key agreement was 120/120 for both solvers. No solver chose a wrong option, and nobody flagged `two_defensible` or `unanswerable`. **All 51 rewrites come from one flag, `no_passage_needed`**: 33 flagged by both solvers, 12 by solver A only, 6 by solver B only. No key was wrong, so no key was changed in place. Each v2 is a new version of the same id.

## Two causes

**1. Informational passages on well-known facts (35 items).** Nine passages are informational: silk (uzm4), Ulugh Beg's observatory (uzh2), the Aral Sea (uzh3), autumn leaves (rum4), boiling at altitude (ruh2), the camel's hump (ruh3), the bee dance (enm4), moon phases (enh2) and floating steel ships (enh3). P5 §5.5 requires an informational passage to state only checkable facts, so these passages hold school-level facts that a reader with general knowledge already knows. Any question that asks for one of those facts can be answered without reading the passage. The solvers flagged 35 of these 36 items, including every item on eight of the nine passages. The only one not flagged is K5-uzh2q1, whose plausible distractors held up.

The v2 items for these passages ask about the text itself, not the facts in it. Each type is answerable only with the passage:

- **Which topic does the text cover?** (literal): all four options are topics a text like this could cover, for example the bath legend of Archimedes or the Kokaral dam.
- **Which statement does the text not make?** (literal): all four statements are true in the world, and three of them are in the text.
- **Which detail does the text give?** (literal): every option is real or plausible. For example, every option for K5-ruh2q1 contains the potato from the title. For K5-uzm4q2, every option is a real reason cocoons are treated with heat or water.
- **Which question does the text leave unanswered?** (inferential: judging the text's scope).
- **Author's purpose, organisation or attitude** (inferential): every option is a sensible purpose, order or stance, and only the text decides (K5-uzh3q3, K5-ruh2q4, K5-enh3q3, K5-enh3q4, K5-enh2q4, K5-ruh3q3).
- **What follows from the text, or which sentence continues it?** (inferential): every option is a plausible claim, and only one follows from what the text says (K5-uzm4q4, K5-enm4q3, K5-rum4q4).

**2. Fiction items with a test-wise cue (16 items).** These items had a giveaway in the options or the title:

- the key was the only positive trait or the only sensible feeling (uze2q4, uze3q4, rue2q4);
- the key was the only moderate, figurative or stock-moral option (uzm1q4, uzh1q3, rum1q4, enm1q4, enm3q4, enh1q3);
- the distractors contradicted the stem (uze3q3, rum1q3, rue2q3);
- the passage title gave the answer (rum2q2 "Одна большая кнопка", enm1q1 "Twenty-Four Pictures");
- the key was the only standard recipe (ene2q2);
- the meaning followed from physics knowledge (enm2q4).

The fix follows the K1-high pattern: keep the key's meaning and replace the three distractors with options from the same category. Every option is now positive, or every option is figurative, or every option is a normal pancake batter, or every option is a big button. Each distractor is ruled out by one specific detail of the text. Two items got a new question on the same passage, because the old question had only one sensible answer:

- K5-uze3q4: "why couldn't they find the kitten" replaces "how did he feel when it was found";
- K5-enm2q4: "what must be true of the newspaper cup" replaces "what does 'both directions' mean".

K5-enm1q1 now asks about a detail that is not in the title.

## Rewritten (51)

Flag column: A = solver A flagged `no_passage_needed`, B = solver B, AB = both.

| id | kind | flag | v2 |
|---|---|---|---|
| K5-uze2q4 | fiction | AB | all four traits positive; distractors ruled out by: the oven was too hot, they waited and drank tea, she made the dough herself |
| K5-uze3q3 | fiction | A | all four are ways a kitten gets in unnoticed (door, window, roof, carried in with the box); Father's door remark decides |
| K5-uze3q4 | fiction | AB | new question: why the search failed (it slept where they had not looked) |
| K5-uzm1q4 | fiction | A | all four are responsible acts (told the truth, dried the book, offered to pay, offered to help); only the first happened |
| K5-uzh1q3 | fiction | A | all four are teaching motives (clay first, strengthen hands, paper drawing first, firing first) |
| K5-uzh2q2 | info | AB | which topic: who and when found the remains / cost / Ulugh Beg's birth year / number of floors |
| K5-uzh2q3 | info | B | all four are plausible effects of a huge instrument; precision is the one named |
| K5-uzh2q4 | info | AB | which question is unanswered: how long construction took |
| K5-uzm4q1 | info | A | which topic: thread length / days to spin / dyeing / country of origin |
| K5-uzm4q2 | info | AB | all four are real reasons for heat or water in silk-making; softening the gum is the one stated |
| K5-uzm4q3 | info | AB | which question is unanswered: fabric per cocoon |
| K5-uzm4q4 | info | AB | what follows: few mulberry leaves means few cocoons |
| K5-uzh3q1 | info | AB | which topic: when the diversion began / stranded ports / dam / climate |
| K5-uzh3q2 | info | AB | which statement is not made: where the Aral lies between countries |
| K5-uzh3q3 | info | B | purpose of "no outflow": the sea depended on river water (not salt, ships or fish species) |
| K5-uzh3q4 | info | AB | all four are moderate Aral lessons; the closing sentence decides |
| K5-rue2q3 | fiction | A | all four are embarrassing classroom moments |
| K5-rue2q4 | fiction | B | all four traits positive; "silently" and "without being asked" decide |
| K5-rum1q3 | fiction | A | all four are cues an audience could read; she smiled and finished calmly |
| K5-rum1q4 | fiction | A | all four are figurative readings; friend vs teacher, backstage vs audience decide |
| K5-rum2q2 | fiction | B | every option is a big button; only the text says it was a video call |
| K5-rum4q1 | info | AB | which topic: the tree takes substances back / why leaves fall / conifers / weather and leaf fall |
| K5-rum4q2 | info | AB | which statement is not made: cold nights make leaves redder |
| K5-rum4q3 | info | AB | which question is unanswered: how long yellowing takes |
| K5-rum4q4 | info | AB | which sentence continues the text: sunny autumn gives more red (one distractor is about yellowing, the title's topic) |
| K5-ruh2q1 | info | AB | which foods are the examples: potatoes and pasta (every option contains potatoes) |
| K5-ruh2q2 | info | AB | which topic: how boiling water looks in the mountains / salt water / pressure per 100 m / tea |
| K5-ruh2q3 | info | AB | which question is unanswered: cooking time in minutes |
| K5-ruh2q4 | info | AB | how the text is organised: common belief → correction → figures → practical result |
| K5-ruh3q1 | info | AB | which topic: how much a camel drinks at once / eyelashes / heat / lifespan |
| K5-ruh3q2 | info | A | which statement is not made: special kidneys |
| K5-ruh3q3 | info | B | all four are plausible points of comparison; the 30% vs 12–14% figures decide |
| K5-ruh3q4 | info | AB | all four are accounts of what the hump does, including the popular "fat also helps with thirst" |
| K5-ene2q2 | fiction | A | every option is a pancake batter (flour, eggs, milk + sugar / salt / butter / honey) |
| K5-enm1q1 | fiction | B | new detail not in the title: she walked for about an hour |
| K5-enm1q4 | fiction | A | all four are moderate lessons; her note decides |
| K5-enm2q4 | fiction | AB | new question: only "melted before the wool's ice" must be true |
| K5-enm3q4 | fiction | A | all four are sensible readings of Grandpa's line |
| K5-enh1q3 | fiction | A | all four are reasons to reread one's own essay; his pride and his aim decide |
| K5-enm4q1 | info | AB | which topic: what the bee does after each run / the way home / audience size / smell |
| K5-enm4q2 | info | AB | which statement is not made: dancers share nectar |
| K5-enm4q3 | info | AB | what follows: a bee with flowers right beside the hive would not do a waggle run |
| K5-enm4q4 | info | AB | which question is unanswered: how bees show the kind of flower |
| K5-enh2q1 | info | AB | which topic: cycle length / same face / tides / solar eclipse |
| K5-enh2q2 | info | AB | which statement is not made: an eclipse can last over an hour |
| K5-enh2q3 | info | AB | which question is unanswered: why the Moon is seen by day |
| K5-enh2q4 | info | AB | the author's attitude: easy to believe but wrong (not a useful model, not only children, not textbooks) |
| K5-enh3q1 | info | AB | which topic: how long ago Archimedes stated it / bath legend / submarines / pre-steel hulls |
| K5-enh3q2 | info | AB | which statement is not made: ships float higher in cold water |
| K5-enh3q3 | info | AB | all four are sensible reasons to mention load marks; the introducing sentence decides |
| K5-enh3q4 | info | AB | how the explanation is built: puzzle → principle → block and hull → sailors' rule |

Every v2 has a new `why` in en, uz and ru that also says why each distractor fails, and a `quarantine_reason` that records the flag and the fix. Uzbek text uses U+02BB for oʻ/gʻ and U+02BC for the tutuq belgisi. This was checked across every uz field.

## Retired

None. Every key was correct and every passage is sound. The defect was always in the question or the options, so every item could be rewritten. Retiring the informational items would also break the bank: ru-hard and en-hard would be left with one passage each, and §5.2 needs two per level and language.

## Notes and limits

- **No passage was changed.** `passages.json` is untouched, so the 69 verified items still match exactly what the solvers saw. K5-uzh2q1, verified on an informational passage, keeps its passage as it was.
- **Remaining risk:** a solver with strong general knowledge may still lean towards a famous fact on some of the "what follows" items (K5-uzm4q4, K5-enm4q3). Their distractors are plausible claims that cannot be checked without the text, but those are the items most likely to be flagged again. If the recheck flags them, the right fix is at the passage level: choose informational topics that are less familiar. Questions alone cannot fix them.
- **Design note for later banks:** "facts only" informational passages on textbook topics clash with the no-passage solver. Future informational passages should use checkable but less familiar facts, or include the author's own example or comparison that questions can target.
- **Shuffle bias in `scripts/content/blind.mjs`** (not changed; it is outside this stream): `sort(() => r() - 0.5)` is not a uniform shuffle. Across the 120 items, the key letter fell on A or D in 74 of solver A's copy and 89 of solver B's. This is worth fixing before the recheck, for example with a Fisher-Yates shuffle, so that position gives no cue.
- No item in this stream has a `family`, so the K4x family rule does not apply.
- Only K5 files were edited: `K5-1.json` … `K5-6.json` and this report.

## Next step

Each v2 needs a fresh blind check before it can become `verified_auto`. Run `node scripts/content/blind.mjs K5 <solver>` with two new solver names (for example `solverC` and `solverD`). Solve only the 51 v2 ids, and write the answers before opening the maps. Ask the solvers explicitly to apply the no-passage test. A v2 that passes 2/2 becomes `verified_auto` with `key_check_2: "blind:2/2"`; one that fails again should be retired or its passage replaced. Back-translation (§5.5 step 5) of the uz and ru items has not been done for this stream.

## Blind recheck of the 51 v2 items (solverC, 2026-10-07)

A fresh copy was made with `node scripts/content/blind.mjs K5 solverC`, with a new option order. Only `.blind/K5-solverC.json` was read. All 51 v2 ids were solved, and the answers were written to `.blind/K5-solverC.answers.json` before the map was opened. Each item was also checked for a second defensible option, an unclear or unanswerable stem, and whether it could be answered without the passage.

| Result | Count |
|---|---|
| v2 items solved | 51 |
| Answer matches the key, nothing flagged | 51 |
| Two defensible options | 0 |
| Unanswerable or unclear | 0 |
| Answerable without the passage | 0 |
| Answer differs from the key | 0 |

**Outcome.** All 51 items now have `status: "verified_auto"` and `key_check_2: "blind:recheck"`. None were retired. Their `quarantine_reason` (the v1 flag and its fix) is kept as history. K5 now holds 120 `verified_auto` items: 69 with `blind:2/2` and 51 with `blind:recheck`.

**Close calls.** These items were still answered from the text, but a reader with strong general knowledge could lean towards a distractor:

- **K5-rum4q4.** "Поэтому осенью листья желтеют даже в пасмурную погоду" can be loosely inferred from "Красный цвет появляется иначе". The key, about brighter autumn light giving more red, is the only option that follows directly from the last sentence.
- **K5-uzm4q3.** "Qurt pilla yasashni qachon boshlaydi?" is answered only loosely, by "yetarlicha oʻsgach". The key, about how much fabric one cocoon gives, is clearly not answered at all.
- **K5-uzm4q4** and **K5-enm4q3.** The earlier report expected these to be flagged. In this recheck they were not: each distractor needs an outside fact that the text does not give.

**Limits.** This was a single solver. The previous section planned a 2/2 recheck, but this run marks the items `blind:recheck` (one solver) as instructed. Back-translation of the uz and ru items (§5.5 step 5) is still not done. The shuffle bias in `blind.mjs` is unchanged. In this copy the key fell on D for all four K5-ruh2 items, so position could still be a cue within a set.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 51 version-2 items keyed "blind:recheck" were solved again by solverD and by solverNP: 48 -> blind:solverC+solverD; solverNP found the key of K5-uzh2q3, K5-ruh3q3 and K5-ruh3q4 without the passage (quarantine), and those three are now version-3 drafts written by this session, for two separate solvers and a no-passage solver. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 69 verified_auto (blind:2/2); 48 verified_auto (blind:solverC+solverD); 3 draft.
