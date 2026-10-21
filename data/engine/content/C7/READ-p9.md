# C7 Speaking cue cards: the read (P9, 15 Oct 2026)

**Ruling.** The owner, 15 Oct 2026: "you check it". An AI read stands in for the native read (spec §3.9) he asked for before the cue
cards go live. Three independent reads, one per language, each told to be as strict as a careful native editor (en: and an IELTS
teacher), of everything the Speaking lessons show: C7-3's twelve cards, C7-10's eighteen cards and eighteen preparation records, the
lesson titles, Part 1 questions, frames, labels and self-check lines in `src/server/lessons/speaking-cards.ts`, the page's words in
`public/runtime/jg-speaking.js` and the Speaking keys of the i18n dictionaries. Read on branch p8-lessons.

| Read | Findings | must | should | nit |
|---|---:|---:|---:|---:|
| en | 33 | 3 | 22 | 8 |
| uz | 31 | 1 | 20 | 10 |
| ru | 56 | 1 | 39 | 16 |

**Result.** Every must and should applied, and nearly every nit (the exceptions are below). Then the thirty cards and eighteen preparation
records were marked served: `status: verified_auto`, `key_check_2: "read:en+uz+ru"` (cards; an open prompt's second check, keycheck.ts),
`reviewer: "ai_native_read 15 Oct 2026 (owner: you check it)"` (cards and preparation). `reviewed`, the teacher look, is still to come.

## What changed, by read

**en.**
- *Musts:* the Part 1 warm-up of c23, c24 and c29 no longer repeats the card's own after-talk question.
- *Part 1 near the card:* c16, c17, c18, c21 and c27 no longer ask for the Part 2 answer itself.
- *Self-check:* every C7-10 self-check now asks "Did I keep talking until the two minutes were up, without long stops?" (15 reworded;
  p21, p23 and p28 gained it).
- *Outline note:* it says each line is a part to fill, not a two-minute answer.
- *Instructions:* all thirty say "speak for 2 minutes: keep going until the timer ends" (uz and ru shortened to the 120-character
  limit).
- *Cards rewritten as our own:* c02 (something an older relative showed you how to do; what you got wrong at first) and c05 (a teacher
  or coach who made you work harder than you expected).
- *Wording:* c06 "hard to live without"; c11's after-talk question; c26 "how you discovered it" and c27 "how you started it" (nothing
  is assumed about the speaker); c30's topic and title; c19 "how you got it or found it"; seven outline sentences.
- *General self-check and frames:* the "clear" line is about pace and being understood, not volume; B1 frames no longer use time words
  for points that are not in time order, and "The main reason is that …".
- *Units:* the Speaking units' goals now say what their card lessons practise (`UNIT_GOAL`); C10's goals asked for recordings and a
  mock.
- *Stock bullets:* c01 and c09 each changed one.
- *Nits:* repeated Part 1 questions varied; the nit wording in outlines, tips and points; the page's en strings.

**uz.**
- *Must:* the warm-up head «Qizib olish: Part 1» (not «Qizishish», "getting heated").
- *Notes and timers:* «Qaydlaringiz» (not «Yozuvlaringiz», recordings) and «qurilma»/«sahifa» (not «telefon», since the same screen runs on
  the laptop); the timer messages.
- *Dictionary:* «kartochkalar».
- *Titles and tips:* titles c02, c10, c30, c16, c25; tips c02, c03, c05, c06, c09, c10, c12, c13, c15, c16, c19, c22, c25, c26, c27, c28
  (calques, «sezgi», «yigʻilish», «odatsiz», «qarama-qarshilik» where «farq» is meant; Part 3 written one way).
- *Preparation:* the plan rows and self-checks of p13, p15, p17, p19, p20, p22, p24, p25, p26, p28, p29 and p30.
- *Self-check line:* «tenses».
- *C10-4:* «imtihon oluvchi» in all four places.

**ru.**
- *Must:* «Заметки остаются только на этом устройстве и никуда не отправляются» (not «Записи … на этом телефоне»).
- *Page strings:* all of them (skipWarn, skipped*, talkGo/planGo, focus, outline head and note, finishNote, part3Note, rowOpen,
  failed/retry, «сек», the coin word agreeing with its number).
- *General self-check:* the six lines as gender-neutral questions.
- *Labels and titles:* «Завершение»; titles c06 and c23.
- *Lesson line:* «1 мин на подготовку» (phone and laptop).
- *Tips:* c01, c03, c06, c07, c09-c13, c15-c19, c22-c24, c26-c28, c30.
- *Plan rows:* the words row of all eighteen («слова, которые хочу использовать»), p16, p17, p20, p25, p27, p28 and p29.
- *Self-checks:* the self-checks of p13-p30 named in the read (no «Было ли X для Y», no inverted passives, «в речи» anchors).

## Taken another way, or not taken

- **en, C10 unit goals.** C10's records were left as they are, because the IELTS plan's Speaking steps read them and there a recording
  is real. The Speaking course shows its own goal per unit instead. The unit titles stay C10's. IESP05's goal now carries the
  pronunciation and word work its title names.
- **en, Part 1 replacements.**
  - c26 "What time do you usually go to bed?" and c27 "What time do you usually get up on school days?" were not used, because with c25's
    sleep question that made three sleep questions in one unit. Used instead: "Do you prefer quiet places or busy ones?" and "Do you
    usually arrive on time, or are you often late?"
  - c29 "Do you usually spend your holidays at home or away?" was not used, because it overlaps the lesson's own Part 3 question 1. Used
    instead: "What do you usually do on the first day of the holidays?"
  - c17 Q2 was also replaced, because it asked for the card's own point. So was c15 Q3, which nearly repeated c07.
  - 'outside' was varied: "out somewhere", "in a café or a park", "indoors or outdoors".
- **en, c18 point.** Used "where you saw photos or videos of it", which matches the topic, rather than "where you saw it (online, on TV or
  in a book)", which would put brackets inside the plan row's brackets.
- **en, c13 B2 outline.** Used "happiest with a book" and "we balance each other out" (same meaning) to stay within the outline's
  120-word limit.
- **en, follow-on changes the read implied.**
  - c02's after-talk is now "Would you like to teach it to someone younger?" (the old one repeated the new explain line).
  - c09's after-talk is now "Do you usually make decisions quickly or slowly?" (same reason).
  - c05's title is in three languages, for its new card.
  - The p26 and p27 outline labels match the new points.
  - p24 B2 also says "bus depot".
- **uz, c15 tip.** «he is very good», as the en tip quotes it, not «he is very good at it».
- **ru, outline note.** Replaced by the en read's new note, in Russian.
- **Not read by a second reader.** The lines this pass wrote new in uz and ru are listed below; they are simple, but no read checked
  them:
  - instructions;
  - outline note;
  - unit goals;
  - titles of c05 and c30;
  - the "clear" line;
  - plan rows for the changed points: c18, c19, c26, c27.
