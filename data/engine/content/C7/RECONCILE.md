# C7: key check 2 of the IELTS reading items

## P5 content-integrity pass (7 Oct 2026, on p5-int)

The 42 reading items had no blind check before this pass. solverD (worked by hand) and solverE (a second pass naming the passage's evidence words, checked by script; for a paragraph question, in that paragraph) agree with every key (5 numeric). The no-passage solver solverNP (it answers only when 80 % sure) found 23 keys without the passage, mostly facts a reader of the Wikipedia topic knows (the bicycle, the urban heat island, paper, tardigrades, qanats, Ebbinghaus): they are quarantined for rewriting (spec 5.5 step 4). Its answer to C7-rs4q02 (1.5) was wrong: the passage says 1.3. 19 are verified_auto. Every solve in this pass is by one session (see the content README, "The P5 content-integrity pass"); solverD and solverE are two passes of that session, not two agents.

The 39 writing and speaking prompts have no key to check (their sources were fact-checked, FACTCHECK.md) and stay draft until the controller rules how an open prompt is checked.

Status and key check 2 now: 39 draft; 19 verified_auto (blind:solverD+solverE); 23 quarantine.

### The review of the pass (7 Oct 2026, after `e7becdd`)

solverD and solverE were two passes of one session, so together they are one check: `keycheck.ts` now counts solvers as agents, and
`blind:solverD+solverE` met ruling 1's "second independent solver" only on paper (see D26, "The review of this pass", finding 1).
`scripts/content/reconcile.ts <stream> --records --write` decided every item again from its record (the blind copies on disk had been
overwritten by later `--pending` copies, so the answers were not re-read) and took back to `draft`, with `key_check_2: "blind:solverD"`
(one agent) and `key_check_2_version`, the 19 reading items solverD and solverE agreed on. One separate solver agent on a `scripts/content/blind.ts <stream> <solver> --pending` copy makes them two checks; `reconcile.ts`
then serves them again.

Status and key check 2 now: 58 draft (19 reading items with blind:solverD; 39 open prompts); 23 quarantine. C7 serves nothing until then.
