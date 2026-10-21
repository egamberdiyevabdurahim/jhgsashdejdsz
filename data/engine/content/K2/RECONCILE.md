# K2: reconciling the blind key check

Bank: K2 (English reading, batches 1 to 4, 64 items on 16 passages, `K2-a2*`, `K2-b1*`, `K2-b2*`, `K2-c1*`), reconciled on 7 Oct 2026.

Sources: the author key is `options[0]`. `.blind/.map-K2-solverA.json` and `.blind/.map-K2-solverB.json` give the key's
letter in each solver's shuffled order. The solvers' answers are in `.blind/K2-solverA.answers.json` and
`.blind/K2-solverB.answers.json`. Each of the 64 ids appears in both maps and both answer files.

Rule: an item is verified when both solvers chose the key and neither flagged `two_defensible`, `unanswerable` or
`no_passage_needed` (as a field or in the note). A verified item gets `"key_check_2": "blind:2/2"` and
`"status": "verified_auto"`. Any other item is rewritten as `version + 1`, with `"status": "draft"`,
`"key_check_2": null` and a `quarantine_reason`. An item that cannot be fixed is retired.

## Counts

| Outcome   | Items |
|-----------|------:|
| Verified  | 43    |
| Rewritten | 21    |
| Retired   | 0     |

By file: K2-1 (A2): 10 verified, 6 rewritten. K2-2 (B1): 12 verified, 4 rewritten. K2-3 (B2): 11 verified, 5 rewritten.
K2-4 (C1): 10 verified, 6 rewritten.

Both solvers chose the key on all 64 items (64/64 each), and nobody flagged `two_defensible` or `unanswerable`. Every
failure is a `no_passage_needed` flag: solver A flagged 21 items (9 of them marked "weak") and solver B flagged 1
(K2-c1p4q4, also flagged by A). None of the 43 verified items has a solver note.

## Why the 21 failed

Two causes, often together:

1. **Cueing inside a passage set.** The four items on a passage are shown together, and a sibling's stem or option gave
   the answer away. Examples: q2's stem "Who showed Bekzod where to wait for the *right* bus?" answers "Why was Bekzod
   late?"; q3's stem "Why was the photograph strong evidence?" answers "What did the students bring?"; q2's "unsure about
   the idea *at first*" answers "What can we infer from what the uncle did on Sunday?".
2. **Test-wise keys.** The key was the only measured, constructive or on-theme option, and the distractors were extreme,
   negative or off-topic (K2-c1p1q4, K2-c1p4q4, K2-b2p1q4, K2-a2p1q3).

The fix in every v2: the distractors are as plausible, measured and on-theme as the key, and they use the same story
elements the siblings reveal, so that a sibling's cue no longer picks out one option; each is ruled out by a specific
line in the text. Where a verified sibling's stem gives the v1 answer away (and that sibling cannot change), the v2 item
tests a different point in the text.

## Rewritten (now draft, version 2)

| id (level, subskill) | Cue in v1 | What changed in v2 |
|----|----|----|
| K2-a2p1q2 (A2, literal) | q3's option "Her mug held more water…" showed what she used as a cup. | Asks where Malika found the recipe. Key: "In an old notebook". No other item names the notebook, the mug or the cup. |
| K2-a2p1q3 (A2, inferential) | "Wet dough = too much water"; the key was the only water option. | Asks why Malika called her grandmother. Key: "To find out what had gone wrong with the dough"; lures: how long to bake, come home and help, bread ready. |
| K2-a2p1q4 (A2, inferential) | "Malika had used the wrong cup" followed from q2's stem and q3's option. | Asks why the recipe caused a problem. Key: "two cups" did not say how big a cup was; no scale, no "warm" and no yeast are each ruled out by the text. |
| K2-a2p2q4 (A2, inferential) | q1's "arrive now" signals news; v1's key was the only generic purpose. | Same stem. Every option is news about the visit: moved to another weekend, Dad meets him, tickets to buy. Key: a change to his journey and what to bring. |
| K2-a2p4q3 (A2, inferential) | q2's stem ("the right bus") made "Worried, he did not know where he was" obvious. | Takes the wrong bus as given and asks why it happened. Key: "He did not know which bus went to his school"; lures: a full bus, the driver, not looking at the number. |
| K2-a2p4q4 (A2, inferential) | q2's stem answered "Why was he late?". | Asks how he felt after telling his teacher. Key: "Relieved, because she was not angry with him"; no other item shows her reaction. |
| K2-b1p1q3 (B1, inferential) | q2's "at first" and q4's option showed the uncle came round. | Every option accepts that he came round; the text decides between them ("didn't say much"). Key: "He now believed in the idea, though he did not say so." |
| K2-b1p1q4 (B1, inferential) | q2/q3 stems pointed to the key; distractors were other topics. | Every option is about Kamola at the market: cheaper prices, "customers prefer to choose" (the uncle's worry), her own stall. Key: she saw what customers needed and found a way to sell to them. |
| K2-b1p2q3 (B1, inferential, weak) | q1 plus the balanced wording made the key obvious. | Every option fits leaving the phone out at night; "fine for messages", "uses one less in the day" and "fine before sleep for messages" are ruled out by the text. |
| K2-b1p3q4 (B1, inferential, weak) | q1/q3 options signal a group-size complaint. | Every option is a complaint-style request: a new teacher, leave with a full refund, a Saturday lesson to finish sooner. Key: divide the group or some money back. |
| K2-b2p1q4 (B2, inferential, weak) | Choir options in q2/q3 point to "no pressure"; distractors were off-theme. | Every option is about learning, practice or music; "practise until good" is ruled out by "I am still a weak singer". Key now names the maths transfer. |
| K2-b2p2q4 (B2, inferential, weak) | q3's option (repeating his teacher's gift) implies quiet support. | Two supportive and two cautious options; "tells him how proud he is" and "warns him he is making a mistake" (a misread of the father's own past) are the lures. Key unchanged. |
| K2-b2p3q3 (B2, inferential) | q4's stem (two views) and q2's option (14 March) gave the key. | Every option involves the two views and the vote: reports the result, most agree with Nilufar, asks every student to vote. Key: present two students' views before a vote. |
| K2-b2p4q3 (B2, inferential, weak) | q2's option (promise to granddaughter) made the key the obvious narrative answer. | Distractors use the same story elements: a promise to play quietly, the concert "a week away", the granddaughter practising with him. Key unchanged. |
| K2-b2p4q4 (B2, inferential, weak) | The story arc made "her feelings had changed" the natural ending. | Asks what "the piece went past the difficult place for the first time" suggests. Key: "Madina's help was making a difference"; no other item says she offered to help. |
| K2-c1p1q3 (C1, inferential, weak) | The writer's stance shows in q2/q4 options; distractors were easy to drop. | Two distractors fit the sceptical stance ("the lists are inaccurate", "an English word with no translation") and are ruled out only by the text. |
| K2-c1p1q4 (C1, inferential) | Distractors were negative or extreme; the key was the only constructive one. | All four options are constructive; "proof that its speakers see the world differently" is the romantic message the writer doubts. Key: a window into what its speakers care about. |
| K2-c1p2q4 (C1, inferential, weak) | q2's options (ladders, harvest help) hint nobody knew the practical side. | Every option is about knowing or working the orchard: only Dilbar knew the trees, more workers needed, the neighbour could run it. Key unchanged. |
| K2-c1p4q1 (C1, literal) | q3's stem revealed that the students brought a photograph. | Asks how much longer the planned paths were. Key: "About ninety metres". The item no longer mentions the photo or the snow. |
| K2-c1p4q3 (C1, inferential, weak) | q1's option "photo after a light snowfall" implied footprints along a route. | q1 v2 no longer shows the photo; the distractors are all things a photo of the lot could show (a narrow path, wet ground, a small lot). Key unchanged. |
| K2-c1p4q4 (C1, inferential; both solvers) | Distractors were absolute or overgeneralised; the key was the only hedged one. | Every option is hedged or specific ("usually", "tend to", the planners' name); each is ruled out by the final paragraph. |

All 21 keep `options[0]` as the key, keep their `subskill`, `prior_b`, `instructions` and `key_check_1: "author"`, and
have new `why` text in en, uz and ru. `time_s` was set to fit the new item: up for 14 (by 5 or 10 s), down for 4
(K2-a2p1q2, K2-a2p1q3, K2-a2p4q3, K2-a2p4q4), unchanged for 3. Each item's `quarantine_reason` gives its blind result,
the cue and the change.

## Retired

None. Every flagged item could be fixed within its passage; no passage text was changed.

## Next

- The 21 v2 items need a fresh blind check. Run `node scripts/content/blind.mjs K2 <solver>` for new solvers and have
  them answer only these ids, reading each passage set as a whole (the v2 items were written against the set, and the
  verified siblings are unchanged). The current `.blind/K2-*.json` copies show version 1 of these items.
- The 43 verified items were checked next to the v1 siblings. Their own text did not change, but the solvers saw the
  v1 options of the rewritten items beside them; the recheck should also note any new cue a v2 item gives a verified
  sibling.
- K2 has no K4x-family items (no `family` field), so no family needed fixing.

## Re-check of the 21 v2 items (solver C, 7 Oct 2026)

A fresh blind copy was made with `node scripts/content/blind.mjs K2 solverC` (it shows the v2 text of the 21 items next
to the 43 unchanged siblings). Solver C read only `.blind/K2-solverC.json`, answered the 21 v2 ids into
`.blind/K2-solverC.answers.json` (the 43 verified siblings were read as context but not answered), and only then opened
`.blind/.map-K2-solverC.json` to compare.

| id | file | Solver C chose | Key | Flag | Outcome |
|---|---|---|---|---|---|
| K2-a2p1q2 | 1 | In an old notebook | same | none | verified |
| K2-a2p1q3 | 1 | To find out what had gone wrong with the dough | same | none | verified |
| K2-a2p1q4 | 1 | It said 'two cups' of water but not how big a cup was. | same | none | verified |
| K2-a2p2q4 | 1 | To tell Sardor about a change to his journey and what to bring | same | none | verified |
| K2-a2p4q3 | 1 | He did not know which bus went to his school. | same | none | verified |
| K2-a2p4q4 | 1 | Relieved, because she was not angry with him | same | none | verified |
| K2-b1p1q3 | 2 | He now believed in the idea, though he did not say so. | same | none | verified |
| K2-b1p1q4 | 2 | How Kamola saw what some customers needed and found a way to sell to them | same | none | verified |
| K2-b1p2q3 | 2 | They are useful in the day, but not in the hour before sleep. | same | none | verified |
| K2-b1p3q4 | 2 | To ask for the group to be divided, or for some money back | same | none | verified |
| K2-b2p1q4 | 3 | Doing something with no pressure to succeed can change how we approach our strengths. | same | none | verified |
| K2-b2p2q4 | 3 | He supports it, although he does not say so directly. | same | none | verified |
| K2-b2p3q3 | 3 | To present two students' different views before a vote | same | none | verified |
| K2-b2p4q3 | 3 | She understood why the practice mattered so much to him. | same | none | verified |
| K2-b2p4q4 | 3 | Madina's help was making a difference. | same | none | verified |
| K2-c1p1q3 | 4 | To show that a missing word does not mean a missing idea | same | none | verified |
| K2-c1p1q4 | 4 | Treat it as a window into what its speakers care about | same | none | verified |
| K2-c1p2q4 | 4 | It showed that none of them knew the orchard as a working place. | same | none | verified |
| K2-c1p4q1 | 4 | About ninety metres | same | none | verified |
| K2-c1p4q3 | 4 | It showed that people already used one particular route. | same | none | verified |
| K2-c1p4q4 | 4 | How a place is really used is useful knowledge that is easy to overlook. | same | none | verified |

All 21 match the key with no flag (`two_defensible`, `unanswerable` and `no_passage_needed` were all considered; none
applied: each v2 item needed the passage to rule out at least one sibling-consistent lure). Each now has
`"status": "verified_auto"` and `"key_check_2": "blind:recheck"`. Their `version` stays 2. Their `quarantine_reason` is
left in place as the record of why they were re-checked (same convention as K1-low).

| Result | Items |
|---|---|
| Verified on re-check (`verified_auto`, `blind:recheck`) | **21** |
| Retired | **0** |

K2 now has 64 of 64 items at `verified_auto`: 43 at `blind:2/2` and 21 at `blind:recheck`. The re-check used one
solver, not two, so these 21 meet a weaker bar than the other 43.

### Residual sibling links (noted, not acted on)

Reading the sets as a whole, solver C saw a few places where a v2 option now hints at a *verified sibling's* key. None
made a v2 item answerable without the passage, and none was flagged, but a later review may want to look at them:

- K2-c1p2q4's lures mention the harvest and the neighbour's help, which points to K2-c1p2q2's key ("whether the family
  would need his help with the harvest") over "where the ladders were kept".
- K2-b1p1q4's lure "customers prefer to choose their own fruit" names the idea that is K2-b1p1q2's key.
- K2-b2p4q3 and K2-b2p4q4 both have lures about the granddaughter practising with Mr Hamidov, which signals the
  granddaughter link that K2-b2p4q2 tests.
- K2-b1p3q4's key ("divide the group") still points to K2-b1p3q3's key ("good but has too many students"); v1 q4 did the
  same, so this is not new.


## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 21 version-2 items keyed "blind:recheck" were solved again by solverD, and by a no-passage solver (solverNP, answering only when 80 % sure: it answered none): with solverC they agree on all 21 -> blind:solverC+solverD. Every solve in this pass is by one session (solverD, solverE, solverNP: see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

Status and key check 2 now: 43 verified_auto (blind:2/2); 21 verified_auto (blind:solverC+solverD).
