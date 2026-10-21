# C4: key check 2 of the P8 homework for the A1-B1 English units (P8 blind checkers 3 and 4, 14 Oct 2026)

P8 (SPEC-lessons rev. 2, §3.6, §4.5, §9.1 step 3; `.superpowers/p8/PLAN.md` §4) wrote ten homework items for each of the 18 A1, A2 and
B1 units, as the six B2 units have had since P7 (`C4/RECONCILE-p7.md`). All of it is commit `c5f09626` by `agent:p8-a5`:

- `C4-6.json` (batch 6): the 180 items `C4-a11h01` … `C4-a16h10` (A1), `C4-a21h01` … `C4-a26h10` (A2), `C4-b11h01` … `C4-b16h10` (B1).
  Each stands on its own (no unit text): a word's meaning, the word in a new sentence, its collocation or its form.
- `units.json`: each of the 18 records `C4-a1u001` … `C4-b1u006` gained its `homework` list (its ten ids). The unit records are not
  items; this pass does not change them.

Before this pass all 180 items were `status: draft`, `key_check_1: "author"`, `key_check_2: null`, `version: 1`. The 132 earlier C4
items were already `verified_auto` and did not change.

## Who checked

| Solver | Blind copy | Answers |
|---|---|---|
| P8s3 (checker 3) | `.blind/C4-P8s3.json` (`blind.ts --pending`: the 180 items without two checks) | `.blind/C4-P8s3.answers.json` (180) |
| P8s4 (checker 4, who ran the reconcile and wrote this file) | `.blind/C4-P8s4.json` (`node scripts/content/blind.mjs C4 P8s4`: the whole bank, 312 items) | `.blind/C4-P8s4.answers.json` (180) |

A copy holds each item's stem and its four options shuffled by the solver's own seed and lettered A-D, with no key and no `why`.
No item asks about a unit's text, so neither solver needed `units.json`; P8s4 did not open it, nor `C4-6.json`, the author's ledger or
sources, nor `.blind/.map-*`. It answered the 180 items in three sittings of 60 (`.superpowers/p8/k4/ans-C4-1.txt` … `-3.txt`) and
wrote its answers file before it read P8s3's. Only `reconcile.ts` read the maps. `agentOf` reads P8s3, P8s4 and `p8-a5` as three
agents, so `keyCheckOf("blind:P8s3+P8s4", { author: "agent:p8-a5" })` is `{ kind: "blind", n: 2 }`.

## The decision

`npx tsx scripts/content/reconcile.ts C4 P8s3 P8s4 --write` gave **312 items: verified 180, quarantine 0, pending 0, blocked 0,
skipped 132.** **The two solvers chose the author's key on all 180 items**, no answer was stale, and neither raised `two_defensible` or
`unanswerable`.

| Status after this pass | Items | Record |
|---|---:|---|
| `verified_auto` | **180** | `key_check_2: "blind:P8s3+P8s4"`, `key_check_2_version: 1`, version 1 |

Per unit: ten of ten for each of the 18 (A1 60, A2 60, B1 60).

### What P8s4 looked at twice (no flag; no status changed)

- **"Which sentence uses … correctly?"** (one per unit, e.g. `C4-a11h08` homework, `C4-b14h08` shortage): each has one well-formed
  sentence and three that break the word's grammar (a count noun made of "homework", "shortage" as a road, "commute" with an object).
- **Form items** (`C4-a23h08` "When I ___ my homework, I will help you": the present after "when" for the future, so "finish", not
  "will finish" or "finishes"; `C4-b13h06` "a big ___ in traffic": the noun "reduction"; `C4-b16h07` "a bad ___ on your sleep": the noun
  "effect", against the verb "affect"): one form fits the slot each time.
- **Context that rules out a near rival:** `C4-a12h04` (ten and seven: "younger", not "older"), `C4-a14h06` (the person who tells the
  team to run: "coach"), `C4-a16h09` ("I like it more than all other games": "favourite", not "different"), `C4-a21h02` (the one who
  "told us its story": "guide", not "map").

## How the file was written

`C4-6.json` is in `JSON.stringify` form at its own indent, so `--write` changed only the decided fields: for each of the 180 items
`status`, `key_check_2`, the comma after `version` and the new `key_check_2_version` (`.superpowers/p8/k4/fielddiff.mjs`). Keys,
options, `why` and versions are the author's. The decision log is `.blind/C4-reconcile.json`, kept as
`.superpowers/p8/k4/C4-reconcile-log.json` (local).

## Checks after the write

- `validate.ts --no-families --all`: exit 0, 0 errors, 858 warnings (the baseline), no finding on any of the 180 ids.
  `reconcile.ts C4 P8s3 P8s4 --audit`: 0 of 312 decisions differ from the files.
- The uz and ru lines of `C4-6.json`: `C19/RECONCILE-p8.md` part 2's lint (0 findings).
- `p8-a5-english-homework.test.ts` pinned every item at `draft` with `key_check_2: null`; that line now asserts a status from the ladder
  and, on a served item, two blind checks (`keyCheckOf`). Its header says so.

## Open for the integrator: three tests fail until C4-6 is wired (PLAN.md §8 item 1)

With the 180 items `verified_auto`, three tests fail. None is a fault in an item; each is the wiring the plan and the author left open:

1. **`english-units.test.ts`** "nothing unverified is served: a unit is a lesson only when it and its three questions …": `C4-a1u001`'s
   test (`poolQuizItems` of its step's pool) drew a homework item (`C4-a11h06`) in place of its `qm`. **`C4/C4-6.json` is not in `RESERVE_FILES`**
   (`src/server/content/bank.ts` line 126), so `practice.ts unitItems`, which picks a unit's items by subskill, draws the homework into
   the unit's own test and the C4 practice pool. This one is real: the unit test must stay its own three questions. P7 wired `C4-5.json`
   the same way (it is in `RESERVE_FILES`).
2. **`p8-a5-english-homework.test.ts`** "as drafts nothing serves them": the same pool, and the A1-B1 lessons now set their homework.
   The author wrote it for the draft state and left `it.todo('with C4/C4-6.json in RESERVE_FILES …')` beside it; its keyed-copy test
   ("each A1-B1 lesson sets its own ten as next-day homework") passes.
3. **`lessons-course.test.ts`** "Ingliz tili: … homework only where the unit has its own items (B2)" (line 63): an A1-B1 lesson now
   has its homework, which is what the keyed-copy test asks for; the pin is the draft state's.

This pass changes no `src/**` code (`.superpowers/p8/PLAN.md` §7), as checkers 1 and 2 did not for `C6-10` … `C6-12`. Before this
content is served: add `C4/C4-6.json` to `RESERVE_FILES`, then rewrite tests 2 and 3 for the keyed state.

## Not done here

- The wiring above. A native read of the uz and ru `why` lines (§9.1 step 5) and the teacher look (`reviewed`).
- The content `README.md` register row for C4 batch 6 (the integrator; `.superpowers/p8/author-5.md`).
