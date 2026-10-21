# p12-read: the native uz/ru read, applied (content round 3)

Branch `p12-read` from p8-lessons @ 89042d05 (worktree C:/Users/PC/jg-p5m), 15 Oct 2026. The six readers' fix lists are in
`C:/Users/PC/jg-p5int/.superpowers/p12-read/` (uz-lessons-1, uz-lessons-2, ru-lessons-1, ru-lessons-2, uz-items, ru-items; each with its .md ledger).
A second native reader (uz and ru) went through every fix as a word diff against the current string, with the English beside it for
every meaning fix and wherever a change was not obvious. A fix was applied only when (a) its `old` equals the current string exactly
(all 948 did), (b) it leaves keys, option order, numbers, formulas, params and {slots} alone, and (c) it is better and means what the
English means. One script applied the accepted list: each value replaced at its exact byte span in the file (formatting kept, one
write per file, tmp file then rename), the result re-parsed and compared with the expected object. No key, option order or status changed.

**Partial** = a strict subset of the reader's own edits to that field (nothing of ours added): the part that would change a formula,
mislead, or take a `why` over its 200-character limit is left as it was.

## Counts

| reader | fixes | accepted | partial | refused | accepted by severity (m/g/n/t) | partial (m/g/n/t) | refused (m/g/n/t) |
|---|---|---|---|---|---|---|---|
| uz-lessons-1 | 93 | 88 | 2 | 3 | 25/8/52/3 | 0/0/2/0 | 0/0/3/0 |
| uz-lessons-2 | 94 | 93 | 0 | 1 | 24/7/55/7 | 0/0/0/0 | 0/1/0/0 |
| ru-lessons-1 | 244 | 233 | 5 | 6 | 21/31/179/2 | 1/0/4/0 | 0/1/5/0 |
| ru-lessons-2 | 127 | 123 | 3 | 1 | 14/18/83/8 | 0/0/3/0 | 0/0/1/0 |
| uz-items | 156 | 139 | 7 | 10 | 26/3/105/5 | 3/0/4/0 | 1/8/1/0 |
| ru-items | 234 | 111 | 3 | 120 | 10/28/73/0 | 0/0/3/0 | 0/0/120/0 |
| **all** | **948** | **787** | **20** | **141** | | | |

Applied: 807 of 948 (20 of them in part). Refused: 141, 128 of them shared instruction strings (below).

## Refused, each with its reason

- **uz-lessons-1#84 (C19-APCA02-1, pieces[0].body.uz, natural)**: Same term as uz-lessons-1#90: the C1 AP families and C19-APCA04-1 keep «holat» for now, so APCA02-1 keeps it too rather than give the course two words for position; one pass later.
- **uz-lessons-1#90 (C19-APCA04-1, pieces[1].body.uz, natural)**: Read-alike: the lesson's first test family (C1-ap3006/C1-ap3007 for C19-APCA04-1, a C1 generator template outside this pass) says «t soniyadan keyin uning holati s(t)»; the worked example must read like it (pinned by tests/unit/engine), so the change goes in with the template in one pass, and this line keeps the lesson's three texts alike. «holat → joylashuv (koordinata)» is right and belongs in one pass over the C19 AP lessons and the C1 ap families.
- **uz-lessons-1#91 (C19-ca41q2, stem.uz, natural)**: Same term as uz-lessons-1#90 (ca41q2 is a piece question of C19-APCA04-1, whose example and C1 test family say «holati»): «holat → joylashuv» in one pass with the families.
- **uz-lessons-2#93 (C19-iw61q1, why.uz, grammar)**: The why limit: the fix takes this why over 200 characters (validator limit.why; tests/unit/content p10-*/p11-* pin every why at 200 or less), and no subset of the reader's own edits both fits and keeps the point. Needs a shorter rewording in a later round. (194 → 208; «ajratiladi» alone gives 205.)
- **ru-lessons-1#68 (C19-MAAL02-1, pieces[2].body.ru, natural)**: Formula notation: turns «пересекает ось y в точке 3» into «при y = 3», adding a formula to the worked line. The old is the usual school phrasing, and «при y = 3» misuses «при» (it marks the argument or a parameter, not the result).
- **ru-lessons-1#69 (C19-al21q3, stem.ru, natural)**: Item stem: «При каком значении y она пересекает ось y?» treats y as the condition (same «при» problem as #68). The old stem is clear (it asks for the point and says the y-value is wanted). A later round could use «Чему равна ордината точки пересечения прямой с осью y?».
- **ru-lessons-1#82 (C19-gt11q2, stem.ru, natural)**: Read-alike: the lesson's first test family (C1 template of C19-MAGT01-1, a C1 generator template outside this pass) says «форму буквы L»; the worked example must read like it (pinned by tests/unit/engine), so the change goes in with the template in one pass, and this line keeps the lesson's three texts alike. «L-образный» is also current Russian, so nothing misleads meanwhile.
- **ru-lessons-1#197 (C19-ps22q2, stem.ru, natural)**: Read-alike: the lesson's first test family (C1-m2b003 for C19-MAPS02-2, a C1 generator template outside this pass) says «К ним присоединился тренер; его возраст — N»; the worked example must read like it (pinned by tests/unit/engine), so the change goes in with the template in one pass, and this line keeps the lesson's three texts alike.
- **ru-lessons-1#199 (C19-ps23q2, stem.ru, grammar)**: Read-alike: the lesson's first test family (C1-m2b005 for C19-MAPS02-3, a C1 generator template outside this pass) says «линия тренда для балла за тест y и часов подготовки x»; the worked example must read like it (pinned by tests/unit/engine), so the change goes in with the template in one pass, and this line keeps the lesson's three texts alike. The line is a verbless heading-like phrase, not wrong in meaning.
- **ru-lessons-1#203 (C19-ps33q2, stem.ru, natural)**: Read-alike: the lesson's first test family (the C1 template of C19-MAPS03-3, a C1 generator template outside this pass) says «число тех, кто читает каждый день, равно N»; the worked example must read like it (pinned by tests/unit/engine), so the change goes in with the template in one pass, and this line keeps the lesson's three texts alike. The survey-answer nuance («N сказали, что…») goes in with the template.
- **ru-lessons-2#66 (C19-ca53q2, stem.ru, natural)**: Read-alike: the lesson's first test family (C1-ap5005/C1-clp005 for C19-APCA05-3, a C1 generator template outside this pass) says «забор закрывает только три стороны. Есть N м забора»; the worked example must read like it (pinned by tests/unit/engine), so the change goes in with the template in one pass, and this line keeps the lesson's three texts alike.
- **uz-items#20 (C6-cs3610, why.uz, meaning)**: The why limit: the fix takes this why over 200 characters (validator limit.why; tests/unit/content p10-*/p11-* pin every why at 200 or less), and no subset of the reader's own edits both fits and keeps the point. Needs a shorter rewording in a later round. (194 → 229; each of the two «yozib olingan dars(lar)» edits alone is over 200.) A later round could write «…, yozuv (video) buni koʻrmaydi».
- **uz-items#22 (C6-cs3613, why.uz, natural)**: The why limit: the fix takes this why over 200 characters (validator limit.why; tests/unit/content p10-*/p11-* pin every why at 200 or less), and no subset of the reader's own edits both fits and keeps the point. Needs a shorter rewording in a later round. (176 → 212; the clause rewrite alone is +35.)
- **8 fixes, uz-items (grammar)**: Shared instruction: the same instructions.uz («…avval birinchi va oxirgi gaplar.») is live on 10 items of C7-7 and on C19-6; the elliptical line after the colon reads clearly. Changing the 8 C7-11 items alone gives one task two instructions; apply corpus-wide in one pass or not at all (follow-up).
  Fixes: 147=ir1213, 148=ir1214, 149=ir1215, 150=ir1216, 151=ir1217, 152=ir1218, 153=ir1219, 154=ir1220.
- **30 fixes, ru-items (natural)**: Shared house instruction («Выберите ответ, который верно использует данные»): the same string is live on every data item of C6-2/3/9/11 and C19-5/16, and tests/unit/content/p10-rw1, p11-ii pin each new item's instructions to its lesson-1/first-20 item. The old line is grammatical and clear; applying it to C6-16/C6-19 alone would give one task two instructions. A corpus-wide change is a separate call (follow-up).
  Fixes: 0=ii2611, 1=ii2612, 2=ii2613, 3=ii2614, 4=ii2615, 5=ii2616, 6=ii2617, 7=ii2618, 8=ii2619, 9=ii2620, 111=ii2801, 112=ii2802, 113=ii2803, 114=ii2804, 115=ii2805, 116=ii2806, 117=ii2807, 118=ii2808, 119=ii2809, 120=ii2810, 121=ii2811, 122=ii2812, 123=ii2813, 124=ii2814, 125=ii2815, 126=ii2816, 127=ii2817, 128=ii2818, 129=ii2819, 130=ii2820.
- **90 fixes, ru-items (natural)**: Shared house instruction («…которое соответствует логике между мыслями»): live on every transitions item of C6-5/6/9/13/15 and C19-5/19/21, and tests/unit/content/p10-rw2, p11-ei pin each new item's instructions to its lesson/first-20 item. The old line is understandable Russian; changing C6-17/C6-21 alone would split one instruction. Corpus-wide change is a separate call (follow-up).
  Fixes: 48=ei1701, 49=ei1702, 50=ei1703, 51=ei1704, 52=ei1705, 53=ei1706, 54=ei1707, 55=ei1708, 56=ei1709, 57=ei1710, 58=ei1711, 59=ei1712, 60=ei1713, 61=ei1714, 62=ei1715, 63=ei1716, 64=ei1717, 65=ei1718, 66=ei1719, 67=ei1720, 68=ei1741, 69=ei1742, 70=ei1743, 71=ei1744, 72=ei1745, 73=ei1746, 74=ei1747, 75=ei1748, 76=ei1749, 77=ei1750, 152=ei1901, 153=ei1902, 154=ei1903, 155=ei1904, 156=ei1905, 157=ei1906, 158=ei1907, 159=ei1908, 160=ei1909, 161=ei1910, 162=ei1911, 163=ei1912, 164=ei1913, 165=ei1914, 166=ei1915, 167=ei1916, 168=ei1917, 169=ei1918, 170=ei1919, 171=ei1920, 172=ei1801, 173=ei1802, 174=ei1803, 175=ei1804, 176=ei1805, 177=ei1806, 178=ei1807, 179=ei1808, 180=ei1809, 181=ei1810, 182=ei1811, 183=ei1812, 184=ei1813, 185=ei1814, 186=ei1815, 187=ei1816, 188=ei1817, 189=ei1818, 190=ei1819, 191=ei1820, 192=ei3701, 193=ei3702, 194=ei3703, 195=ei3704, 196=ei3705, 197=ei3706, 198=ei3707, 199=ei3708, 200=ei3709, 201=ei3710, 202=ei3711, 203=ei3712, 204=ei3713, 205=ei3714, 206=ei3715, 207=ei3716, 208=ei3717, 209=ei3718, 210=ei3719, 211=ei3720.

## Applied in part

- **uz-lessons-1#83** (C19-gt32q1, why.uz, natural): kept «soya esa yondosh katet, shuning uchun»; dropped «olinadi»: «tan olinadi» reads as the idiom «tan olmoq» (to admit).
- **uz-lessons-1#89** (C19-APCA04-1, pieces[0].body.uz, natural): kept «funksiya qiymatining birligi argument birligiga»; left «holat → joylashuv» out (read-alike: C19-APCA04-1's example and its C1 test family say «holati»).
- **ru-lessons-1#9** (C19-MAGT01-1, pieces[1].body.ru, natural): kept «Теперь попробуйте сами»; left «буквы L → Г» out (read-alike: the C1 template the first test serves says «буквы L»; tests/unit/engine/lesson-teaches pins it).
- **ru-lessons-1#37** (C19-MAPS02-2, pieces[1].body.ru, natural): kept «Теперь попробуйте сами»; left «их N-летний тренер» out (read-alike with C1-m2b003; tests/unit/engine/lesson-p7-a2 pins it).
- **ru-lessons-1#38** (C19-MAPS02-3, pieces[1].body.ru, meaning): kept «каждый дополнительный час» (the meaning fix: «лишний» = superfluous) and «Теперь попробуйте сами»; left the trend-line sentence out (read-alike with C1-m2b005; tests/unit/engine/lesson-p7-a2 pins it).
- **ru-lessons-1#40** (C19-MAPS03-3, pieces[1].body.ru, natural): kept «Теперь попробуйте сами»; left «N сказали, что читают» out (read-alike with its C1 template; tests/unit/engine/lesson-p7-a2 pins «число тех, кто читает каждый день, равно N»).
- **ru-lessons-1#141** (C19-ie22q3, why.ru, natural): kept the meaning fix (the number of members rose, not the club) and «ученики»; left the last clause as it was (why limit: the full fix is over 200 characters): 221 → 174.
- **ru-lessons-2#57** (C19-APCA05-3, pieces[1].body.ru, natural): kept «Пусть x — длина каждой из сторон, примыкающих к стене»; left the fence sentence out (read-alike with C1-ap5005/clp005; tests/unit/engine/lesson-c19-apca58 pins it).
- **ru-lessons-2#63** (C19-APCA08-1, pieces[2].body.ru, natural): kept «промежуток времени в точках» and the inserted «скорость»; dropped «При t < 2» for «До t = 2»: it changes a formula (= to <). «До t = 2 скорость v < 0» no longer runs the two formulas together.
- **ru-lessons-2#72** (C19-ca81q3, why.ru, natural): kept the inserted «скорость»; dropped «При t < 1» for «До t = 1»: it changes a formula (= to <).
- **uz-items#19** (C6-cs3609, why.uz, meaning): kept «bepul paketlar» in the first sentence (the meaning fix); left «tarqatishni» and the second «bepul» out (why limit: the full fix is over 200 characters): 217 → 199.
- **uz-items#27** (C6-ii1611, why.uz, natural): kept the drain rewrite; left «sinovi → tekshiruvi» out (why limit: the full fix is over 200 characters): 201 → 197.
- **uz-items#29** (C6-ii2609, why.uz, meaning): kept «ishdan keyin» (staying after work, the care); left «qolib, yolgʻiz oʻzi qayta» out (why limit: the full fix is over 200 characters): 212 → 186.
- **uz-items#99** (C6-cs2808, why.uz, meaning): kept both meaning fixes (the bus stopped running; rarely empty); left «shu yerda» out (why limit: the full fix is over 200 characters): 208 → 198.
- **uz-items#107** (C6-cs3811, why.uz, natural): kept «ham» and «2-matn»; left «oʻquvchini» out (why limit: the full fix is over 200 characters): 209 → 198.
- **uz-items#108** (C6-cs3812, why.uz, natural): kept «1-matn/2-matn» and «markazimi yoki uy-joymi»; left the «Ularning fikri … masalasida» rewrite out (why limit: the full fix is over 200 characters): 224 → 191.
- **uz-items#110** (C6-cs3817, why.uz, natural): kept «1-matn/2-matn»; left the «Ularning fikri … masalasida» rewrite and «uning oʻrniga» out (why limit: the full fix is over 200 characters): 225 → 192.
- **ru-items#30** (C6-cs3614, why.ru, natural): kept «призов всем в тексте нет» (for «лишнее»); left the first-clause rewrite out (why limit: the full fix is over 200 characters): 230 → 165.
- **ru-items#41** (C6-ii2615, why.ru, natural): kept «когда она дольше всего сидела в телефоне»; left the other two rewrites out (why limit: the full fix is over 200 characters): 237 → 197.
- **ru-items#110** (C6-cs3817, why.ru, natural): kept the meaning fix («вместо этого ходить в школу пешком группами», not leisure walks); left «в том, закрывать ли ворота» out (why limit: the full fix is over 200 characters): 208 → 198.

## Integrator extension (not a reader fix)

ru-lessons-1 replaced the calque «Теперь вы:» / «Теперь вы.» (from "Now you:") with «Теперь попробуйте сами:» in C19-1..12 (65 places);
ru-lessons-2 agreed the line is a calque but left C19-13..23 alone only so as not to split the house style. Applying one reader and
not the other would split it inside one course, so the same rule was applied to the ru lesson bodies of C19-13..22: 51 fields,
51 replacements (C19-13, C19-14, C19-15, C19-16, C19-17, C19-18, C19-19, C19-20, C19-21, C19-22). No «Теперь вы» is left in the corpus.

## Tests

- `scripts/content/validate.ts`: 0 errors before and after; the only new findings came from fixes that lengthened a `why` past 200
  characters, and those fixes are now refused or applied in part, so the findings match the base again.
- Pins of the old text, moved to the new text (no test weakened):
  - `tests/unit/content/p10-iewr.test.ts`: the ru writing steer now sets the range with an en dash, «60–150»; the pin asks for it (en/uz keep `60(-| to )150`).
  - `tests/unit/content/p8b-a1-rw-ei-lessons.test.ts`: the ru worked example labels the goal «Цель: «to …».»; the pin asks for that exact line in ru, `Goal: to …` in en/uz.
  - `tests/unit/engine/lesson-c19-5-notes.test.ts`: C19-RWEI02-1/03-1 label notes and goal «Qaydlar (notes):» / «Maqsad (goal): » in uz and
    «Заметки (notes):» / «Цель (goal): » in ru; the pin asks for exactly those (en keeps Notes:/Goal:).
- Every other string literal in tests/ was checked against every changed value (old contains it, new does not): no other pin.
- The read-alike tests (`tests/unit/engine/lesson-teaches`, `lesson-p7-a2`, `lesson-c19-apca34`, `lesson-c19-apca58`) pin a phrase that a
  lesson's worked example shares with its first test family (a C1 generator template). Four fixes changed that phrase in the lesson only;
  those parts are refused or left out (above), since moving the pin would let the lesson and its test drift apart.
- Run: validate.ts; all of tests/unit/content; the content-reading tests of tests/unit/engine (lesson-*, p6*, phase-d-c15, read-floor,
  ready-records, strategy-schema/-v16) and tests/unit/ai-sample-lesson; tsc. The suite ran without its global setup: the shared test
  database on :5433 is migrated by another branch (`parent_alert` exists under another migration number), so `scripts/migrate.mjs`
  fails before any test; these tests read only the JSON. The DB-backed engine-server tests were not run; none of them holds a changed string.

## Left for a later round (seen, outside this pass)

- The shared instruction strings (ru data and transitions lines, uz skim line): apply corpus-wide in one pass with the pinned reference items, or keep.
- uz `Notes:` / `Goal:` labels are still English in C19-19 (RWEI02-2/3) and C19-21 (RWEI03-3); C19-5 and every ru line now use the language's own label.
- uz «umumiy koʻrinish» (overview calque) is still in C19-23 (11), C19-19 (2) and C10-4 (7); C19-8 and C6 say «umumiy tavsif».
- `60-150` with a hyphen in ru of C19-8 (4 steers); C19-23 ru now has «60–150».
- «Text 1 / Text 2» on uz lines in C6-7, C6-14, C19-3, C19-20, C10-1; C6-16 and now C6-18 say «1-matn / 2-matn». ru lines say «Text 1» in
  C6-7/14/18 and C19-3/20, «Текст 1» in C6-16. One house style per language is the owner's call.
- The why-limit refusals above need a shorter rewording (uz-lessons-2#93 iw61q1, uz-items#20 cs3610, uz-items#22 cs3613).
- Read-alike wording to change together with the C1 templates, in one pass: ru «форму буквы L» → «Г» (C19-MAGT01-1, gt11q2, C1 template),
  ru «тренер; его возраст — N» → «их N-летний тренер» (C19-MAPS02-2, ps22q2, C1-m2b003), ru «забор закрывает только три стороны» →
  «забор ставят только с трёх сторон» (C19-APCA05-3, ca53q2, C1-ap5005/clp005), ru «линия тренда для балла за тест y и часов
  подготовки x» → «построена линия тренда, связывающая…» (C19-MAPS02-3, ps23q2, C1-m2b005), ru «число тех, кто читает каждый день,
  равно N» → «N сказали, что читают каждый день» (C19-MAPS03-3, ps33q2, its C1 template), uz «holat» → «joylashuv (koordinata)» for position
  (C19-APCA02-1, APCA04-1, ca41q2, the C1 ap families).
- Readers' notes not acted on here: «tan» in C19-10 formulas vs «tg» in C19-2; «форма буквы L» in the generator templates C1-2 and C1x-3;
  «настоящее подлежащее» in C10-1; «Равносильные выражения» and «Отношения, скорости…» unit names in C10; the spaced suffix after a
  closing quote («and» dan) across the uz banks.
