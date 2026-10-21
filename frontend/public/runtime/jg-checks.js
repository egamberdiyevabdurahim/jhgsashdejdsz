/* Jamals Global: the checks and the task quizzes, graded by the server (owner 7 Oct 2026 A4, "let's make a solution": a student who
 * could open the browser's code read the right answers of the diagnostic's checks and of the task quizzes).
 *
 * Loaded on every student page right after jg-runtime.js, before the design scripts (src/server/pages.ts). window.JG_CHECKS drives
 * the page's own screens with items the server serves (POST /api/v1/checks/<english|math|reading|quiz>): an item's id, its prompt
 * and its options under tokens made for that serving, never a key and never an option's place in the bank. The page posts the
 * token picked; the server grades it, stores it, and answers with the next item by the page's own climb and seconds, or the result.
 * - mini(engine, q, P): the English and math checks (M:023:513-548): the page's testFrame, mcq (its timer, "I don't know", the
 *   stop control's hold and its "I don't know" to every question left) and finish; a check left partway resumes on the server.
 * - reading(lang, P): the reading check (M:023:551-562): the passage, "I've finished reading" (timed by the server), 5 questions.
 * - quiz(task, box, P): a task's quiz (M:023:893-897): each answer marked with the right option and the why (owner 4 Oct R9),
 *   "Try again" a new attempt; a pass completes the task with the attempt's id, which the server checks.
 * - hold(on): "Stop the check here?" open or closed (M:023:632): the server holds the question's clock too (a minute at most per
 *   question, three times per check: P5 review).
 * The demo account is one account every visitor shares (P5 review): each visit's check is a run of its own on the server, which
 * this page names in every request and keeps in this browser (jg.checks.demo), as it keeps the demo's draft. A live student's
 * check is one per student and names none.
 * The design's own grading runs only where a page is handed its banks (window.JG_DESIGN_BANKS): /preview, in development.
 * P5c (spec §2.4-§2.7, §6.1): a live student's English and math checks are the CAT's; mini() shows its questions (a number typed: the new
 * numeric-entry screen), set(kind, o) runs a continuation set on its own screen (a reading testlet: the new testlet screen), and
 * line(result) is the result's "B1 · possibly B2 · provisional" for the design's own result line.
 * THE CONTENT OF AN ITEM IS NEVER TRANSLATED (the P5 wave-3 walk, 10 Oct 2026: the page's dictionary held "stay" and rewrote an English
 * item's option to «остаются»): every stem, option list, answer-and-why line and testlet this file draws outside the diagnostic's own view
 * carries data-no-i18n (public/runtime/jg-i18n.js never enters it, nor #dg-view); tests/unit/jg-i18n-items.test.ts draws every pool item
 * the shipped dictionaries hold a key for and reads it back unchanged. */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null;
  if (!BOOT || !BOOT.uid) return;
  /* P14 (the P13 walk's hw-satm-390-uz-1-sheet: the homework sheet's first option in the browser's dark focus ring before any tap): a task
   * sheet puts the focus on its first control when it opens (M:023:928, D:022: ".dg-go:not(:disabled), .dg-opt, input, [data-t=shut]
   * .dg-link"), and a focus a script moves with no tap or click before it is :focus-visible to the browser, so the ring was drawn on a sheet
   * opened from a link or by the page itself. The ring is the keyboard's (:focus-visible, the browser's own ring, as the design draws it):
   * the page marks a navigation key's use (html.jg-kb) until the next tap or click, and a sheet's button draws no ring without it. */
  if (typeof document !== 'undefined' && document.addEventListener && document.documentElement && document.head && document.createElement && document.getElementById && !document.getElementById('jc-kb')) {
    var KB = { Tab: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, Home: 1, End: 1, PageUp: 1, PageDown: 1, Enter: 1, ' ': 1, Escape: 1 }, root = document.documentElement;
    document.addEventListener('keydown', function (e) { if (KB[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey && root.classList) root.classList.add('jg-kb'); }, true);
    document.addEventListener('pointerdown', function () { if (root.classList) root.classList.remove('jg-kb'); }, true);
    var kb = document.createElement('style'); kb.id = 'jc-kb';
    kb.textContent = 'html:not(.jg-kb) .jt-sheet .dg-opt:focus-visible,html:not(.jg-kb) .jt-sheet .dg-go:focus-visible,html:not(.jg-kb) .jt-sheet .dg-link:focus-visible{outline:none}';
    document.head.appendChild(kb);
  }
  var NAMES = { uz: 'Oʻzbekcha', en: 'English', ru: 'Русский' };   // the passages' language names (check_items.json read.*.name)
  var DEMO = !!BOOT.demo, KEPT = 'jg.checks.demo', runs = {};

  /* The demo visit's run of each check (P5 review): named in every request, kept in this browser so a reload comes back to it. */
  function kept() { if (!DEMO) return {}; try { return JSON.parse(window.localStorage.getItem(KEPT) || '{}') || {}; } catch (e) { return {}; } }
  function keep(kind, id) {
    if (!DEMO || !id || runs[kind] === id) return;
    runs[kind] = id;
    try { var k = kept(); k[kind] = id; window.localStorage.setItem(KEPT, JSON.stringify(k)); } catch (e) {}
  }
  function named(kind, body) { var id = DEMO && (runs[kind] || kept()[kind]); if (id) body.run = String(id); return body; }

  /* One request at a time, in order (a hold, then the answer, then a stop); network errors, 429 and 5xx retried with backoff. A 429
   * "attempts" is no rate limit: a task's quiz tried QUIZ_ATTEMPTS times (P5 review), answered at once. */
  var chain = Promise.resolve(), signedOut = false;
  function post(kind, body) {
    return fetch('/api/v1/checks/' + kind, { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid }, body: JSON.stringify(body) }).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; });
    }, function () { return { status: 0, body: {} }; });
  }
  function send(kind, body) {
    var p = chain.then(function () {
      var tries = 0;
      return (function go() {
        return post(kind, body).then(function (r) {
          if ((r.status === 0 || (r.status === 429 && r.body.error !== 'attempts') || r.status >= 500) && tries < 8) { tries++; return new Promise(function (ok) { setTimeout(ok, Math.min(10000, 500 * Math.pow(2, tries))); }).then(go); }
          if (r.status === 401 && !signedOut) { signedOut = true; location.href = '/signin?next=' + encodeURIComponent(location.pathname); }
          else if (r.status === 409 && r.body.error === 'wrong account') location.reload();
          return r;
        });
      })();
    });
    chain = p.then(function () {}, function () {});
    return p;
  }

  var active = null;   // the check whose question is on screen: its kind, for hold()

  /* ---------- P5c (spec §2.4-§2.7, §6.1; owner 7 Oct decision 5): the CAT's questions ----------
   * A live student's English and math checks are the CAT's (src/server/cat/run.ts): a question arrives as { id (an opaque handle),
   * prompt, options | numeric, sec, n, math, set } or, in a continuation set, a reading testlet { testlet, passage, questions }. A
   * multiple-choice question keeps the design's own mcq() in the diagnostic; numeric entry and the testlet are new screens drawn here
   * in the design's own classes (.dg-mod, .dg-q, .dg-opt, .dg-go, .dg-link, .dg-passage, .dg-frac, .dg-result) and its tokens. Each
   * question's time limit is on screen (owner decision 5: 10-15 s for short items, the measured time for long ones). Every word in
   * en / uz (U+02BB) / ru, Uzbek and Russian quoting in « » (the review of 7 Oct); new copy, kept from the dictionaries (data-no-i18n).
   * The result reads "B1 · possibly B2 · provisional" until the check is complete. Stopping a continuation set ends it: the questions
   * left are not counted (src/server/cat/run.ts stopCat), and the dialog says so. */
  var CW = {
    en: { q: 'Question {n}', secs: '{s} s', mins: '{m} min', minSecs: '{m} min {s} s', answer: 'Your answer', frac: 'Fraction', minus: 'Minus', next: 'Next', dunno: "I don't know", hint: 'Type a number. For a fraction, tap “Fraction”; for a negative one, “+/−”.',
      num: 'Numerator', den: 'Denominator', read: 'Read the text, then answer the four questions.', qOf: 'Question {n} of {m}', done: 'Done', doneN: 'Done · {a} of {m} answered',
      setTitle: { english: "English · today's check", math: "Math · today's check" }, stopAsk: 'Stop here? This question will count as not answered. One attempt: when you come back, you go on from the next question.', keep: 'Keep going', stop: 'Stop', sendU: 'Send with {u} unanswered?',
      result: 'Result:', close: 'Close', saved: 'Saved. Your roadmap uses it now.', again: 'One moment, then try again.', tryAgain: 'Try again', notDue: 'Nothing to check today.',
      partDone: 'Part {n} of {m} done · {a} of {b} right', nextPart: 'Next part',
      readScore: '{a} of {m} right', readAll: 'All correct. You read this well.', readGood: 'Good. You understood the text.', readLow: 'This is a start. Read a little every day and it gets easier.', readGo: 'Continue',
      later: 'Later', laterNote: 'No time now? Tap “Later”: the check comes back as a short task in the next days. Until you take it, your roadmap is a draft.',
      right: '{a} of {b} right', partN: 'Part {n}', paid: '✓ Done · 🪙 +{n}', missed: '{a} of {b} right.', almost: '{a} of {b} right. Almost: one more would have done it.',
      retryEasier: 'Try again: the questions are easier now.', retrySame: 'Try once more.', tooHard: 'This is too hard for me',
      enough: 'That is enough for today. Your try counts.', enoughEasier: 'That is enough for today. Tomorrow we start with easier ones.', enoughToday: 'Your try counts. You can still try it again today.',
      enoughNow: 'Your try counts. Easier questions are ready now, if you want one more go.', enoughBoth: 'Your try counts. Easier questions are ready now, if you want one more go. Tomorrow we start with easier ones too.',
      lastGo: 'No more tries today. New questions come tomorrow.', emptyDid: 'Write one line about what you did. Then it counts.', didPh: 'One line: what did you do?',
      tried: 'You tried. Coins come only for right answers.', goEasier: 'Easier questions', fast: 'That was very fast. Read each question first: “I don’t know” is an answer too. Then try once more.',
      back: 'You tried this today. One more go: pass it now and it is done: {n} coins.', quizDunno: "I don't know", dtm: 'State test', qTime: 'Time for this question:', qTimeNote: 'Each question has its own time. Its clock starts when the question appears.', qGo: 'Start', outOfTime: 'Time is up for this question.',
      timeUp: 'Time ran out on the last question.', late1: '1 question ran out of time.', lateN: '{n} questions ran out of time.', tomorrow: 'Try again tomorrow.', comesAgain: 'The check comes again in your tasks in the next days.', nextSet: 'The next short set comes tomorrow.', unsaved: 'Nothing changed in your roadmap.',
      paused: 'You stopped here.', pausedNext: 'One attempt: you go on from the next question. The ones you saw will not come again.', setFast: 'That was very fast. Next time, read each question.', wide: 'We measured from what you answered, so this result is a wider guess.', hardNo: 'Not this time. Read each question, then try once more.',
      memoPay: 'You have seen the answers now, so passing pays {n} coins.', memoNone: 'You have seen the answers now, so passing adds no coins. The task will still be done.',
      reread: 'Read the page once more. You can try again in {s} s.', rereadGo: 'Read the page once more, then try again.',
      paidMemo: '✓ Done · 🪙 +{n} (you had seen the answers)', paidMemo0: '✓ Done · no more coins: you had seen the answers',
      backMemo: 'You tried this today. One more go: pass it now and it is done. You have seen the answers, so it adds no coins.',
      backMemoN: 'You tried this today. One more go: pass it now and it is done. You have seen the answers, so it pays {n} coins.',
      text: 'Text', toText: '↑ Back to the text',
      fixAll: 'The homework is Complete. Corrections give no coins.', fixSome: 'The homework is Complete. The ones still wrong come back in Review. Corrections give no coins.', fixLeft: '{n} left to fix. Corrections give no coins.' },
    uz: { q: '{n}-savol', secs: '{s} soniya', mins: '{m} daqiqa', minSecs: '{m} daqiqa {s} soniya', answer: 'Javobingiz', frac: 'Kasr', minus: 'Minus', next: 'Keyingisi', dunno: 'Bilmayman', hint: 'Sonni yozing. Kasr uchun «Kasr»ni, manfiy son uchun «+/−»ni bosing.',
      num: 'Surat', den: 'Maxraj', read: 'Matnni oʻqing, keyin toʻrtta savolga javob bering.', qOf: '{m} tadan {n}-savol', done: 'Tayyor', doneN: 'Tayyor · {m} tadan {a} ta javob',
      setTitle: { english: 'Ingliz tili · bugungi sinov', math: 'Matematika · bugungi sinov' }, stopAsk: 'Shu yerda toʻxtatasizmi? Bu savol javobsiz hisoblanadi. Urinish bitta: qaytganingizda keyingi savoldan davom etasiz.', keep: 'Davom etish', stop: 'Toʻxtatish', sendU: '{u} ta savol javobsiz. Yuborasizmi?',
      result: 'Natija:', close: 'Yopish', saved: 'Saqlandi. Yoʻl xaritangiz endi shundan foydalanadi.', again: 'Bir lahza, keyin qayta urinib koʻring.', tryAgain: 'Qayta urinish', notDue: 'Bugun sinov yoʻq.',
      partDone: '{m} qismdan {n}-qismi bajarildi · {b} tadan {a} ta toʻgʻri', nextPart: 'Keyingi qism',
      readScore: '{m} tadan {a} ta toʻgʻri', readAll: 'Hammasi toʻgʻri. Zoʻr oʻqidingiz!', readGood: 'Yaxshi. Matnni tushunib oʻqidingiz.', readLow: 'Bu boshlanishi. Har kuni ozgina oʻqing, osonlashib boradi.', readGo: 'Davom etish',
      later: 'Keyinroq', laterNote: 'Hozir vaqtingiz yoʻqmi? «Keyinroq»ni bosing: tekshiruv keyingi kunlarda qisqa vazifa boʻlib qaytadi. Uni topshirmaguningizcha yoʻl xaritangiz qoralama boʻlib turadi.',
      right: '{b} tadan {a} ta toʻgʻri', partN: '{n}-qism', paid: '✓ Bajarildi · 🪙 +{n}', missed: '{b} tadan {a} ta toʻgʻri.', almost: '{b} tadan {a} ta toʻgʻri. Oz qoldi: yana bitta toʻgʻri javob yetardi.',
      retryEasier: 'Yana urinib koʻring: endi savollar osonroq.', retrySame: 'Yana bir marta urinib koʻring.', tooHard: 'Bu men uchun qiyin',
      enough: 'Bugun shu yetarli. Urinishingiz hisobga olindi.', enoughEasier: 'Bugun shu yetarli. Ertaga osonroqdan boshlaymiz.', enoughToday: 'Urinishingiz hisobga olindi. Bugun yana urinib koʻrish mumkin.',
      enoughNow: 'Urinishingiz hisobga olindi. Yana urinib koʻrmoqchi boʻlsangiz, osonroq savollar hozir tayyor.', enoughBoth: 'Urinishingiz hisobga olindi. Yana urinib koʻrmoqchi boʻlsangiz, osonroq savollar hozir tayyor. Ertaga ham osonroqdan boshlaymiz.',
      lastGo: 'Bugun boshqa urinish yoʻq. Ertaga yangi savollar keladi.', emptyDid: 'Nima qilganingiz haqida bir qator yozing. Shunda hisobga olinadi.', didPh: 'Bir qator: nima qildingiz?',
      tried: 'Urinib koʻrdingiz. Tangalar faqat toʻgʻri javoblar uchun beriladi.', goEasier: 'Osonroq savollar', fast: 'Juda tez boʻldi. Avval har bir savolni oʻqing: «Bilmayman» ham javob. Keyin yana bir marta urinib koʻring.',
      back: 'Bugun buni urinib koʻrdingiz. Yana bitta urinish bor: hozir oʻtsangiz, vazifa bajariladi: {n} tanga.', quizDunno: 'Bilmayman', dtm: 'DTM', qTime: 'Bu savolga vaqt:', qTimeNote: 'Har bir savolning oʻz vaqti bor. Vaqt savol chiqqanda boshlanadi.', qGo: 'Boshlash', outOfTime: 'Bu savolga vaqt tugadi.',
      timeUp: 'Oldingi savolga vaqt yetmadi.', late1: '1 ta savolga vaqt yetmadi.', lateN: '{n} ta savolga vaqt yetmadi.', tomorrow: 'Ertaga yana urinib koʻring.', comesAgain: 'Tekshiruv keyingi kunlardagi vazifalaringizda yana keladi.', nextSet: 'Keyingi qisqa toʻplam ertaga keladi.', unsaved: 'Yoʻl xaritangizda hech narsa oʻzgarmadi.',
      paused: 'Shu yerda toʻxtatdingiz.', pausedNext: 'Urinish bitta: keyingi savoldan davom etasiz. Koʻrgan savollaringiz qayta chiqmaydi.', setFast: 'Juda tez javob berdingiz. Keyingi safar har bir savolni oʻqing.', wide: 'Javob bergan savollaringizdan oʻlchadik, shuning uchun bu natija kengroq taxmin.', hardNo: 'Bu safar emas. Har bir savolni oʻqib, yana bir marta urinib koʻring.',
      memoPay: 'Javoblarni koʻrdingiz, shuning uchun endi oʻtsangiz {n} tanga beriladi.', memoNone: 'Javoblarni koʻrdingiz, shuning uchun endi oʻtsangiz tanga qoʻshilmaydi. Vazifa baribir bajariladi.',
      reread: 'Sahifani yana bir marta oʻqing. Qayta urinish {s} soniyadan keyin ochiladi.', rereadGo: 'Sahifani yana bir marta oʻqing, keyin qayta urinib koʻring.',
      paidMemo: '✓ Bajarildi · 🪙 +{n} (javoblarni koʻrgan edingiz)', paidMemo0: '✓ Bajarildi · tanga qoʻshilmadi: javoblarni koʻrgan edingiz',
      backMemo: 'Bugun buni urinib koʻrdingiz. Yana bitta urinish bor: hozir oʻtsangiz, vazifa bajariladi. Javoblarni koʻrgansiz, shuning uchun tanga qoʻshilmaydi.',
      backMemoN: 'Bugun buni urinib koʻrdingiz. Yana bitta urinish bor: hozir oʻtsangiz, vazifa bajariladi. Javoblarni koʻrgansiz, shuning uchun {n} tanga beriladi.',
      text: 'Matn', toText: '↑ Matnga qaytish',
      fixAll: 'Vazifa «Bajarildi». Tuzatishlar uchun tanga berilmaydi.', fixSome: 'Vazifa «Bajarildi». Hali notoʻgʻrilari Takrorlashda qaytadi. Tuzatishlar uchun tanga berilmaydi.', fixLeft: '{n} ta tuzatish qoldi. Tuzatishlar uchun tanga berilmaydi.' },
    ru: { q: 'Вопрос {n}', secs: '{s} с', mins: '{m} мин', minSecs: '{m} мин {s} с', answer: 'Ваш ответ', frac: 'Дробь', minus: 'Минус', next: 'Дальше', dunno: 'Не знаю', hint: 'Введите число. Для дроби нажмите «Дробь», для отрицательного — «+/−».',
      num: 'Числитель', den: 'Знаменатель', read: 'Прочитайте текст и ответьте на четыре вопроса.', qOf: 'Вопрос {n} из {m}', done: 'Готово', doneN: 'Готово · отвечено {a} из {m}',
      setTitle: { english: 'Английский · проверка дня', math: 'Математика · проверка дня' }, stopAsk: 'Остановиться здесь? Этот вопрос засчитается как без ответа. Попытка одна: когда вернётесь, продолжите со следующего вопроса.', keep: 'Продолжить', stop: 'Остановить', sendU: 'Отправить? Без ответа: {u}',
      result: 'Результат:', close: 'Закрыть', saved: 'Сохранено. Ваш план теперь учитывает это.', again: 'Минуту, затем попробуйте снова.', tryAgain: 'Попробовать снова', notDue: 'Сегодня проверки нет.',
      partDone: 'Часть {n} из {m} пройдена · верно {a} из {b}', nextPart: 'Следующая часть',
      readScore: 'Верно {a} из {m}', readAll: 'Всё верно. Вы отлично прочитали текст.', readGood: 'Хорошо. Вы поняли текст.', readLow: 'Это только начало. Читайте понемногу каждый день, и станет легче.', readGo: 'Продолжить',
      later: 'Позже', laterNote: 'Сейчас нет времени? Нажмите «Позже»: проверка вернётся коротким заданием в ближайшие дни. Пока вы её не пройдёте, ваша дорожная карта остаётся черновиком.',
      right: 'Верно {a} из {b}', partN: 'Часть {n}', paid: '✓ Готово · 🪙 +{n}', missed: 'Верно {a} из {b}.', almost: 'Верно {a} из {b}. Почти: не хватило одного ответа.',
      retryEasier: 'Попробуйте ещё раз: теперь вопросы легче.', retrySame: 'Попробуйте ещё раз.', tooHard: 'Это слишком сложно',
      enough: 'На сегодня хватит. Попытка засчитана.', enoughEasier: 'На сегодня хватит. Завтра начнём с более лёгких.', enoughToday: 'Попытка засчитана. Сегодня можно попробовать ещё раз.',
      enoughNow: 'Попытка засчитана. Если хотите попробовать ещё раз, более лёгкие вопросы готовы прямо сейчас.', enoughBoth: 'Попытка засчитана. Если хотите попробовать ещё раз, более лёгкие вопросы готовы прямо сейчас. И завтра начнём с более лёгких.',
      lastGo: 'Сегодня попыток больше нет. Завтра будут новые вопросы.', emptyDid: 'Напишите одну строку о том, что вы сделали. Тогда засчитается.', didPh: 'Одна строка: что вы сделали?',
      tried: 'Вы попробовали. Монеты даются только за верные ответы.', goEasier: 'Вопросы полегче', fast: 'Слишком быстро. Сначала прочитайте каждый вопрос: «Не знаю» тоже ответ. Потом попробуйте ещё раз.',
      back: 'Сегодня вы это уже пробовали. Есть ещё одна попытка: пройдёте сейчас, и задание выполнено: {n} монет.', quizDunno: 'Не знаю', dtm: 'ДТМ', qTime: 'Время на вопрос:', qTimeNote: 'У каждого вопроса своё время. Отсчёт начинается, когда появляется вопрос.', qGo: 'Начать', outOfTime: 'Время на этот вопрос вышло.',
      timeUp: 'На прошлый вопрос не хватило времени.', late1: 'Не успели по времени: 1 вопрос.', lateN: 'Не успели по времени: {n}.', tomorrow: 'Попробуйте ещё раз завтра.', comesAgain: 'Проверка снова будет в заданиях в ближайшие дни.', nextSet: 'Следующий короткий набор будет завтра.', unsaved: 'В вашем плане ничего не изменилось.',
      paused: 'Вы остановились здесь.', pausedNext: 'Попытка одна: вы продолжите со следующего вопроса. Уже показанные вопросы не повторятся.', setFast: 'Слишком быстро. В следующий раз прочитайте каждый вопрос.', wide: 'Мы измерили по тем вопросам, на которые вы ответили, поэтому результат менее точный.', hardNo: 'Не в этот раз. Прочитайте каждый вопрос и попробуйте ещё раз.',
      memoPay: 'Вы уже видели ответы, поэтому теперь за прохождение дадут {n} монет.', memoNone: 'Вы уже видели ответы, поэтому за прохождение монет не добавят. Задание всё равно будет выполнено.',
      reread: 'Прочитайте страницу ещё раз. Повторить можно через {s} с.', rereadGo: 'Прочитайте страницу ещё раз, потом попробуйте снова.',
      paidMemo: '✓ Готово · 🪙 +{n} (ответы вы уже видели)', paidMemo0: '✓ Готово · монет не добавили: ответы вы уже видели',
      backMemo: 'Сегодня вы это уже пробовали. Есть ещё одна попытка: пройдёте сейчас, и задание выполнено. Ответы вы уже видели, поэтому монет не добавят.',
      backMemoN: 'Сегодня вы это уже пробовали. Есть ещё одна попытка: пройдёте сейчас, и задание выполнено. Ответы вы уже видели, поэтому дадут {n} монет.',
      text: 'Текст', toText: '↑ Вернуться к тексту',
      fixAll: 'Задание «Выполнено». За исправления монет нет.', fixSome: 'Задание «Выполнено». Оставшиеся ошибки вернутся в «Повторении». За исправления монет нет.', fixLeft: 'Осталось исправить: {n}. За исправления монет нет.' },
  };
  function lang() { var l = window.JG_I18N && typeof window.JG_I18N.lang === 'function' ? window.JG_I18N.lang() : 'en'; return CW[l] ? l : 'en'; }
  function cw(k, p) { var s = CW[lang()][k]; if (s == null) s = CW.en[k]; return p && typeof s === 'string' ? s.replace(/\{(\w+)\}/g, function (m, x) { return p[x] != null ? String(p[x]) : m; }) : s; }
  /** A quoted word stays on one line with what follows it ("«+/−»ni.", the review of 7 Oct: the hint broke inside "+/−" on a phone). */
  function keepQ(h) { return h.replace(/(«[^»]*»|“[^”]*”)(\S*)/g, '<span class="jc-nw">$1$2</span>'); }
  /** The math check's time cap in minutes, stated on a live student's card (M:023:435; src/engine/cat/config.ts onboarding.capMs: a
   *  question whose limit would pass it is not started) and the English one's; tests/unit/jg-checks.test.ts keeps them equal. */
  var CAP_MIN = { english: 8, math: 8 };
  /** A time limit as the student reads it, in one format (the P5 fix, owner 7 Oct; the wave-2 walk read "75 seconds" beside "1 min 30 s"): "45 s",
   *  "1 min 15 s", "2 min" (uz "1 daqiqa 15 soniya", ru "1 мин 15 с"); the header counts it down. */
  function limitText(sec) { var m = Math.floor(sec / 60), r = sec % 60; return sec < 60 ? cw('secs', { s: sec }) : r ? cw('minSecs', { m: m, s: r }) : cw('mins', { m: m }); }
  /** The seconds a question's countdown starts from: what is left of a clock that began before (a question opened again: an item once shown
   *  counts as seen, src/server/cat/run.ts resumeCat), else its limit. */
  function secsOf(v) { return v && v.left > 0 && v.left < v.sec ? v.left : v.sec; }
  function clock(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function escH(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /** {a/b} drawn stacked, as the design's frac() (M:023:504): never a slash. */
  function fracH(h) { return h.replace(/\{([^{}\/]+)\/([^{}]+)\}/g, function (m, a, b) { return '<span class="dg-frac" role="math" aria-label="' + a + '/' + b + '"><span>' + a + '</span><span>' + b + '</span></span>'; }); }
  var CSS = '.jc-num{margin:4px 0 0}.jc-num-l{display:block;margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}'
    + '.jc-num-box{display:flex;align-items:center;justify-content:center;gap:8px;min-height:84px;padding:12px 16px;border:1.5px solid #e0eae5;border-radius:16px;background:#fff;transition:border-color .15s,box-shadow .15s}'
    + '.jc-num-box:focus-within{border-color:var(--jade-500);box-shadow:0 0 0 3px rgba(67,173,128,.15)}'
    + '.jc-num-in{width:100%;min-width:0;border:0;outline:0;background:none;color:var(--ink);font:800 30px var(--font);font-variant-numeric:lining-nums tabular-nums;text-align:center}.jc-num-in:focus,.jc-num-in:focus-visible{outline:0}.jc-frac .jc-num-in:focus{box-shadow:inset 0 0 0 2px var(--jade-500)}'
    + '.jc-sign{font:800 30px var(--font);color:var(--ink)}.jc-sign[hidden]{display:none}'
    + '.jc-frac{display:inline-flex;flex-direction:column;align-items:center;gap:6px}.jc-frac .jc-num-in{width:6ch;padding:4px 6px;border-radius:10px;background:#f1f7f4;font-size:24px}.jc-frac i{display:block;width:100%;height:3px;border-radius:2px;background:var(--ink)}'
    + '.jc-keys{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.jc-key{height:46px;border:1.5px solid #e0eae5;border-radius:14px;background:#fff;color:var(--jade-800);font:800 16px var(--font);cursor:pointer}'
    + '.jc-key[aria-pressed="true"]{border-color:var(--jade-500);background:var(--accent-soft)}.jc-hint{margin:10px 2px 0;font-size:12.5px;font-weight:600;line-height:1.4;color:var(--muted)}.jc-nw{white-space:nowrap}'
    + '.jc-go{width:100%;margin-top:14px}.jc-tl{display:grid;gap:14px;margin-top:10px}.jc-tl .dg-passage{white-space:pre-line}.jc-tqs{display:grid;gap:12px}'
    + '.jc-tq{padding:14px;border-radius:16px;background:#fff;box-shadow:0 2px 10px rgba(16,39,30,.06)}.jc-tq h3{margin:4px 0 10px;font-size:16px;font-weight:800;line-height:1.3}.jc-tq .dg-opts{gap:6px}.jc-tq .dg-opt{min-height:44px;padding:10px 14px;font-size:14.5px}.jc-idk{display:block;min-height:44px;margin:6px auto 0}.jc-idk[aria-checked="true"]{color:var(--jade-800);font-weight:800;text-decoration:underline}'
    + '.jc-res{margin:14px 0 0;padding:16px;border-radius:16px;background:#fff;box-shadow:0 2px 10px rgba(16,39,30,.06)}.jc-res b{display:block;margin-top:2px;font-size:20px;font-weight:800;line-height:1.3}.jc-res span{display:block;margin-top:6px;font-size:13.5px;font-weight:600;line-height:1.45;color:var(--muted)}'
    + '.dg-result .jc-sub{display:block;margin-top:4px;font-size:13px;font-weight:600;color:var(--muted)}'
    + '.jc-later{display:block;width:100%;margin-top:6px;min-height:44px}.jc-later-n{margin:2px 4px 0;font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted);text-align:center}'
    + '#jc-set.jc-asking .dg-body,#jc-set.jc-asking .dg-foot>:not(.jc-ask){display:none}.jc-ask{display:grid;gap:4px}'
    + '@media (min-width:900px){#jc-set.jc-wide{padding-left:max(0px,calc(50% - 560px));padding-right:max(0px,calc(50% - 560px))}#jc-set.jc-wide .jc-tl{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);align-items:start}#jc-set.jc-wide .jc-tl .dg-passage{position:sticky;top:0;max-height:calc(100vh - 210px);overflow-y:auto}}'
    /* P7: a stem's bulleted notes as a list (promptHtml), and the passage view (framed): above the question in a narrow box (the phone,
     * a sheet), beside it in a wide one (the laptop's lesson page), the passage then scrolling on its own */
    + '.jg-qx p{margin:0 0 8px}.jg-qx p:last-child{margin-bottom:0}.jg-notes{margin:0 0 10px;padding-left:1.3em;list-style:disc}.jg-notes li{margin:3px 0;padding-left:2px}'
    /* P8 integration: a stem's table (promptHtml), in the stem's own colour and a reading size, scrolling sideways in its own box when wide */
    + '.jg-tblw{max-width:100%;overflow-x:auto;margin:2px 0 10px}.jg-tbl{border-collapse:collapse;font-size:15px;font-weight:600;line-height:1.35}.jg-tbl th,.jg-tbl td{padding:7px 12px;border:1.5px solid #e0eae5;text-align:left;white-space:nowrap}.jg-tbl th{background:#f3f8f6;font-weight:800}'
    + '.jg-pvw{container-type:inline-size}.jg-pv{display:grid;gap:14px}.jg-pv-q{display:grid;gap:12px;align-content:start;min-width:0}'
    + '.jg-pv-p{min-width:0;padding:16px 18px;border:1.5px solid #e0eae5;border-radius:16px;background:#fff;scroll-margin-top:12px;outline:0}'
    + '.jg-pv-t{margin:0 0 10px;font-size:16px;font-weight:800;line-height:1.3;color:var(--ink)}.jg-pv-p p{margin:0 0 12px;font-size:15px;font-weight:500;line-height:1.62;color:var(--ink)}.jg-pv-p p:last-child{margin-bottom:0}'
    + '.jg-pv-k{display:inline-grid;place-items:center;min-width:24px;height:24px;margin-right:4px;border-radius:7px;background:var(--accent-soft);color:var(--jade-800);font-size:13px;font-weight:800;vertical-align:1px}'
    + '.jg-pv-back{justify-self:start;padding:6px 0;font-weight:700}'
    /* P14: a heading's stem on more than one line (headHtml): each paragraph a block inside the heading */
    + '.jg-qp{display:block}.jg-qp+.jg-qp{margin-top:10px}'
    + '@container (min-width:640px){.jg-pv{grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);align-items:start}.jg-pv-p{position:sticky;top:0;max-height:calc(100vh - 190px);overflow-y:auto}.jg-pv-back{display:none}}';
  function css() { if (typeof document === 'undefined' || document.getElementById('jc-css')) return; var s = document.createElement('style'); s.id = 'jc-css'; s.textContent = CSS; document.head.appendChild(s); }
  /* P7 (the SAT R&W "notes" stems; the P6 walk's malika-390-sat_rw-11-test: "notes: • Mohira … • Since 2024 …" in one run of text): a
   * prompt whose lines hold a bulleted list (two or more "• …" lines, as the item is stored) is drawn as that list, one line a bullet, and
   * the lines around it as their own paragraphs; any other prompt is the same paragraph as before, byte for byte. Used by quiz() here, the
   * phone's lessons page (public/runtime/jg-lessons.js) and the laptop's (jg-lessons-desktop.js). */
  /* P8 integration (the 14-day walk's malika8-390-p8-rw-2-first-piece: C19-RWII02-3's table "Runner | Week 1 laps | Week 2 laps" ran into
   * one line of the question): a prompt whose lines hold a table as the item stores it (two or more lines of cells split by " | ", the first
   * its head) is drawn as that table, the lines around it as their own paragraphs. A prompt with neither a list nor a table is the same
   * paragraph as before, byte for byte, and a list alone is drawn as before. */
  /* P13 (the round-3 walk's IELTS Reading test shot at 390 in uz, every IELTS Reading test and homework question at 390 and 1440:
   * the text, the instruction and the question ran as ONE paragraph): every prompt on more than one line is drawn as it is stored, a blank
   * line a new paragraph and a line break a new line in it (a flow chart's "↓", "Text 1"), the list and the table as before. Each line is
   * escaped text; the only markup is this function's own (<p>, <br>, the list, the table). A prompt on one line is as before, byte for byte. */
  var BULLET = /^\s*[•●▪]\s+/, ROW = /\S\s\|\s\S/;
  function promptHtml(text, cls, attrs, esc) {
    var e = esc || escH, s = String(text == null ? '' : text), lines = s.replace(/\r\n?/g, '\n').split('\n'), n = 0, t = 0, out = '', para = [], list = [], rows = [];
    for (var i = 0; i < lines.length; i++) { if (BULLET.test(lines[i])) n++; if (ROW.test(lines[i])) t++; }
    if (s.trim().indexOf('\n') < 0) return '<p class="' + cls + '"' + (attrs || '') + '>' + e(s) + '</p>';
    function endP() { if (para.length) out += '<p>' + para.map(function (x) { return e(x); }).join('<br>') + '</p>'; para = []; }
    function endL() { if (list.length) out += '<ul class="jg-notes">' + list.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>'; list = []; }
    function cells(r) { return r.split('|').map(function (c) { return c.trim(); }); }
    function endT() {
      if (rows.length > 1) out += '<div class="jg-tblw"><table class="jg-tbl"><thead><tr>' + cells(rows[0]).map(function (c) { return '<th>' + e(c) + '</th>'; }).join('') + '</tr></thead><tbody>'
        + rows.slice(1).map(function (r) { return '<tr>' + cells(r).map(function (c) { return '<td>' + e(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      else if (rows.length) out += '<p>' + e(rows[0].trim()) + '</p>';
      rows = [];
    }
    lines.forEach(function (l) {
      if (n > 1 && BULLET.test(l)) { endP(); endT(); list.push(l.replace(BULLET, '').trim()); }
      else if (t > 1 && ROW.test(l)) { endP(); endL(); rows.push(l); }
      else if (!l.trim()) { endP(); endL(); endT(); }
      else { endL(); endT(); para.push(l.trim()); }
    });
    endP(); endL(); endT(); css();
    return '<div class="' + cls + ' jg-qx"' + (attrs || '') + '>' + out + '</div>';
  }
  /* P14 item 2 (P13's open item: "the diagnostic CAT's multi-line stems unchecked"; 47 K1 questions are a text and its question on two
   * lines, drawn as one run): a stem drawn inside a heading (the CAT's question <h2>, a testlet question's <h3>; a heading holds phrasing
   * content only, so no <p>) on more than one line is drawn as promptHtml draws a stem: a blank line a new paragraph (a block span,
   * .jg-qp), a line break a new line (<br>), a bullet on its own line. `f` draws one line (escaped; the maths' fractions). A stem on one
   * line is f(text), as before, byte for byte. */
  function headHtml(text, f) {
    var s = String(text == null ? '' : text).replace(/\r\n?/g, '\n');
    if (s.trim().indexOf('\n') < 0) return f(s);
    css();
    return s.trim().split(/\n[ \t]*\n/).map(function (p) { return '<span class="jg-qp">' + p.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(f).join('<br>') + '</span>'; }).join('');
  }
  /* P14 item 1 (P13's open item: an item's instruction, "Choose the linking word or phrase that fits the logic between the ideas", an
   * IELTS word limit "NO MORE THAN TWO WORDS", reached no quiz page): the instruction the server sends with a question (`q.instructions`,
   * in the student's language; none when the item has none or its stem already says it, src/engine/content/instructions.ts) is drawn just
   * above the question in the diagnostic's own hint line, the design's .dg-hint (M:023, "Pick your school's scale, then slide to your
   * average."), as escaped text the page dictionary leaves alone. Every quiz surface draws it with this: the CAT's question and reading
   * testlet and the Today sheet's quiz (homework included) here, the lessons pages (jg-lessons.js, jg-lessons-desktop.js) and the Mock
   * (jg-mock.js) through JG_CHECKS.ins. A number field draws none: its own hint (jc-hint, "Type a number.") is that instruction. */
  function insHtml(q, esc) { var t = q && typeof q.instructions === 'string' ? q.instructions.trim() : ''; return t ? '<p class="dg-hint jg-ins" data-no-i18n>' + (esc || escH)(t) + '</p>' : ''; }
  /* P7 (SPEC-lessons §3.4, §12.5 item 2: IELTS Reading on real passages, with a passage view): a question on a passage (`v.passage`, its
   * title and paragraphs from the server, a paragraph's letter only where the question names one) is drawn with it: the passage first and
   * the question after it, "↑ Matnga qaytish" above the question to go back up (the phone, a narrow sheet); in a wide box the two side by
   * side, the passage scrolling on its own (the laptop). A question without one is `html` as it was. Nothing of the key is in it. */
  function framed(v, html) {
    var p = v && v.passage;
    if (!p || typeof p !== 'object' || !p.paras || !p.paras.length) return html;
    css();
    return '<div class="jg-pvw"><div class="jg-pv"><section class="jg-pv-p" aria-label="' + escH(cw('text')) + '" tabindex="-1" data-no-i18n>' + (p.title ? '<h3 class="jg-pv-t">' + escH(p.title) + '</h3>' : '')
      + p.paras.map(function (x) { return '<p>' + (x.k ? '<b class="jg-pv-k">' + escH(x.k) + '</b> ' : '') + escH(x.text) + '</p>'; }).join('')
      + '</section><div class="jg-pv-q"><button class="dg-link jg-pv-back" type="button" data-no-i18n>' + escH(cw('toText')) + '</button>' + html + '</div></div></div>';
  }
  /* "↑ Matnga qaytish": the passage of this question comes into view (one listener for every page that draws one) */
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.jg-pv-back') : null, f = b && b.closest('.jg-pv'), s = f && f.querySelector('.jg-pv-p');
    if (!s) return;
    e.preventDefault();
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { s.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' }); } catch (x) { s.scrollIntoView(); }
    try { s.focus({ preventScroll: true }); } catch (x) {}
  });
  /** The meta line of a CAT question: its number and its time limit (owner decision 5: shown on screen). */
  function catMeta(v) { return escH(cw('q', { n: v.n })) + ' · ' + escH(limitText(v.sec)); }

  /** A countdown in `el` for `sec` seconds; `view` (the design's) holds it while "Stop the check here?" asks (view._hold / _shift). */
  function countdown(el, sec, onEnd, view) {
    var end = Date.now() + sec * 1000, id = null, held = 0, over = false;
    function paint() {
      if (over) return;
      if (view && view._hold) return; if (view && view._shift) { end += view._shift; view._shift = 0; }
      if (held) return;
      var l = Math.ceil((end - Date.now()) / 1000);
      if (l <= 0) { stop(); if (el) el.textContent = ''; return onEnd(); }
      if (el) el.textContent = clock(l);
    }
    function stop() { over = true; if (id) clearInterval(id); id = null; }
    paint(); id = setInterval(paint, 250);
    return { stop: stop, hold: function (on) { if (on && !held) held = Date.now(); else if (!on && held) { end += Date.now() - held; held = 0; } } };
  }

  /** Numeric entry (spec §2.3: math numeric by default): a typed number, "−", and a stacked fraction; "Next" sends it, "I don't know"
   *  sends nothing; at 0:00 what is typed goes (the server times it). done(value|null, late). */
  function numeric(body, v, timerEl, done, view) {
    css();
    var fracOn = false, neg = false, sent = false;
    body.innerHTML = '<p class="dg-mod" data-no-i18n>' + catMeta(v) + '</p><h2 class="dg-q dg-mathq" id="dg-q" data-no-i18n>' + headHtml(v.prompt, function (x) { return fracH(escH(x)); }) + '</h2>'
      + '<div class="jc-num" data-no-i18n><label class="jc-num-l" for="jc-a">' + escH(cw('answer')) + '</label>'
      + '<div class="jc-num-box"><span class="jc-sign" hidden>−</span><span class="jc-field"></span></div>'
      + '<div class="jc-keys"><button class="jc-key" type="button" data-k="neg" aria-pressed="false" aria-label="' + escH(cw('minus')) + '">+/−</button><button class="jc-key" type="button" data-k="frac" aria-pressed="false">' + escH(cw('frac')) + ' <span class="dg-frac" aria-hidden="true"><span>a</span><span>b</span></span></button></div>'
      + '<p class="jc-hint">' + keepQ(escH(cw('hint'))) + '</p><button class="dg-go jc-go" type="button" data-k="ok" disabled>' + escH(cw('next')) + '</button></div>'
      + '<button class="dg-link" type="button" data-dunno data-no-i18n>' + escH(cw('dunno')) + '</button>';
    var field = body.querySelector('.jc-field'), sign = body.querySelector('.jc-sign'), ok = body.querySelector('[data-k=ok]');
    function draw() {
      field.innerHTML = fracOn
        ? '<span class="jc-frac"><input class="jc-num-in" id="jc-a" inputmode="numeric" autocomplete="off" aria-label="' + escH(cw('num')) + '"><i aria-hidden="true"></i><input class="jc-num-in" id="jc-b" inputmode="numeric" autocomplete="off" aria-label="' + escH(cw('den')) + '"></span>'
        : '<input class="jc-num-in" id="jc-a" inputmode="decimal" autocomplete="off" aria-label="' + escH(cw('answer')) + '">';
      [].forEach.call(field.querySelectorAll('input'), function (i) { i.addEventListener('input', check); i.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !ok.disabled) send(false); }); });
      var first = field.querySelector('input'); if (first && first.focus) try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
      check();
    }
    function value() {
      var a = (body.querySelector('#jc-a') || {}).value || '', b = (body.querySelector('#jc-b') || {}).value || '';
      a = a.replace(/[−–]/g, '-').trim(); b = b.trim();
      if (fracOn) return a && b ? (neg ? '-' : '') + a + '/' + b : '';
      return a ? (neg && a.charAt(0) !== '-' ? '-' : '') + a : '';
    }
    function check() { ok.disabled = !value(); }
    function send(late) { if (sent) return; sent = true; t.stop(); if (view) view._pick = null; done(value() || null, !!late); }
    body.querySelector('.jc-keys').onclick = function (e) {
      var k = e.target.closest('[data-k]'); if (!k) return;
      if (k.dataset.k === 'neg') { neg = !neg; sign.hidden = !neg; k.setAttribute('aria-pressed', String(neg)); check(); }
      if (k.dataset.k === 'frac') { fracOn = !fracOn; k.setAttribute('aria-pressed', String(fracOn)); draw(); }
    };
    ok.onclick = function () { send(false); };
    body.querySelector('[data-dunno]').onclick = function () { if (sent) return; sent = true; t.stop(); if (view) view._pick = null; done(null, false); };
    var t = countdown(timerEl, secsOf(v), function () { send(true); }, view);
    draw();
    return t;
  }

  /** A multiple-choice question drawn as the design's mcq() draws it (continuation sets, outside the diagnostic's own view). */
  function choice(body, v, timerEl, done) {
    var sent = false;
    body.innerHTML = '<p class="dg-mod" data-no-i18n>' + catMeta(v) + '</p>' + insHtml(v) + '<h2 class="dg-q' + (v.math ? ' dg-mathq' : '') + '" id="dg-q" data-no-i18n>' + headHtml(v.prompt, v.math ? function (x) { return fracH(escH(x)); } : escH) + '</h2>'
      + '<div class="dg-opts" role="radiogroup" aria-labelledby="dg-q" data-no-i18n>' + v.options.map(function (o, j) { return '<button type="button" role="radio" class="dg-opt" data-j="' + j + '"><span>' + (v.math ? fracH(escH(o.text)) : escH(o.text)) + '</span></button>'; }).join('') + '</div>'
      + '<button class="dg-link" type="button" data-dunno data-no-i18n>' + escH(cw('dunno')) + '</button>';
    body.onclick = function (e) {
      if (sent) return;
      var b = e.target.closest('[data-j]'), d = e.target.closest('[data-dunno]');
      if (b) { sent = true; t.stop(); done(v.options[+b.dataset.j].t, false); } else if (d) { sent = true; t.stop(); done(null, false); }
    };
    var t = countdown(timerEl, secsOf(v), function () { if (sent) return; sent = true; done(null, true); });
    return t;
  }

  /** A reading testlet (spec §2.5): the passage and its four questions on one screen (side by side on a desktop), one time limit
   *  for the whole; "Done" sends the four choices (an unanswered one is wrong): off until one is picked, and with one left unanswered
   *  it asks once ("Send with 2 unanswered?", the review of 7 Oct); at 0:00 what was picked goes. done(tokens, late). */
  function testlet(body, foot, v, timerEl, done) {
    css();
    var picks = v.questions.map(function () { return null; }), sent = false, m = v.questions.length;
    /* P14: an instruction the four questions share is one line above the text; each question's own, when they differ, above it */
    var ins0 = (v.questions[0] || {}).instructions || '', shared = v.questions.every(function (q) { return (q.instructions || '') === ins0; });
    body.innerHTML = '<p class="dg-mod" data-no-i18n>' + escH(cw('read')) + ' · ' + escH(limitText(v.sec)) + '</p>' + (shared ? insHtml(v.questions[0]) : '')
      + '<div class="jc-tl" data-no-i18n><div class="dg-passage" lang="en" tabindex="0">' + (v.passage && v.passage.title ? '<b>' + escH(v.passage.title) + '</b>\n' : '') + escH(v.passage ? v.passage.text : '') + '</div>'
      + '<div class="jc-tqs">' + v.questions.map(function (q, k) {
        return '<section class="jc-tq" aria-labelledby="jc-q' + k + '"><p class="dg-mod" data-no-i18n>' + escH(cw('qOf', { n: k + 1, m: m })) + '</p>' + (shared ? '' : insHtml(q)) + '<h3 id="jc-q' + k + '">' + headHtml(q.prompt, escH) + '</h3>'
          + '<div class="dg-opts" role="radiogroup" aria-labelledby="jc-q' + k + '">' + q.options.map(function (o, j) { return '<button type="button" role="radio" aria-checked="false" class="dg-opt" data-q="' + k + '" data-j="' + j + '"><span>' + escH(o.text) + '</span></button>'; }).join('') + '</div>'
          + '<button class="dg-link jc-idk" type="button" role="radio" aria-checked="false" data-q="' + k + '" data-j="-1">' + escH(cw('dunno')) + '</button></section>';
      }).join('') + '</div></div>';
    foot.innerHTML = '<button class="dg-go" type="button" data-k="done" data-no-i18n disabled>' + escH(cw('doneN', { a: 0, m: m })) + '</button>';
    /* owner 10 Oct (delegated call, the fourth walk: no «Bilmayman» on the text, a grey «Tayyor» until four guesses): each question of a text
     * has its own «I don't know»; it is an answer the student gave (no token is sent for it), so «Done» counts it and never asks about it. */
    var go = foot.querySelector('[data-k=done]'), asked = false, idk = v.questions.map(function () { return false; });
    function nAns() { return picks.filter(function (x, k) { return x != null || idk[k]; }).length; }
    function count() { var a = nAns(); asked = false; go.disabled = a === 0; go.textContent = a === m ? cw('done') : cw('doneN', { a: a, m: m }); }
    body.onclick = function (e) {
      var b = e.target.closest('[data-q]'); if (!b || sent) return;
      var k = +b.dataset.q, j = +b.dataset.j; idk[k] = j < 0; picks[k] = j < 0 ? null : v.questions[k].options[j].t;
      [].forEach.call(body.querySelectorAll('[data-q="' + k + '"]'), function (o) { o.setAttribute('aria-checked', String(o === b)); });
      count();
    };
    function send(late) { if (sent) return; sent = true; t.stop(); foot.innerHTML = ''; done(picks.slice(), late); }
    go.onclick = function () { var a = nAns(); if (!a) return; if (a < m && !asked) { asked = true; go.textContent = cw('sendU', { u: m - a }); return; } send(false); };
    var t = countdown(timerEl, v.sec, function () { send(true); });
    return t;
  }

  /** Owner 10 Oct (delegated call, the teen walk 3: "no N из 5, no word on time-outs"): what this sitting was, from the server's own counts
   *  (src/engine/cat/report.ts sittingOf): "5 tadan 3 ta toʻgʻri" and, when a clock ran out, "2 ta savolga vaqt yetmadi." */
  function counts(r) {
    var out = [];
    if (r && typeof r.of === 'number' && r.of > 0 && typeof r.right === 'number') out.push(cw('right', { a: r.right, b: r.of }));
    if (r && r.timeouts > 0) out.push(r.timeouts === 1 ? cw('late1') : cw('lateN', { n: r.timeouts }));
    return out;
  }
  /** A time-out is said when it happens: one line over the next question. */
  function lateNote(body) { if (body && body.insertAdjacentHTML && !body.querySelector('.jc-late')) body.insertAdjacentHTML('afterbegin', '<p class="dg-hint jc-late" role="status" data-no-i18n>' + escH(cw('timeUp')) + '</p>'); }
  /** The result's line in the student's language (spec §2.6): "B1 · possibly B2 · provisional", and the IELTS estimate or the SAT
   *  content statement, as the server wrote them in en / uz / ru. Used by the design's own result line (M:023:436, D:022:438). */
  function line(r) {
    if (!r || !r.line) return '';
    var l = lang(), main = r.line[l] || r.line.en, sub = r.detail ? (r.detail[l] || r.detail.en || '') : '', cov = r.covers ? (r.covers[l] || r.covers.en || '') : '';
    var more = counts(r).concat([sub, cov]).filter(Boolean).join(' · ');
    return '<p class="dg-result" data-no-i18n>' + escH(cw('result')) + ' <b>' + escH(main) + '</b>' + (more ? '<span class="jc-sub">' + escH(more) + '</span>' : '') + '</p>';
  }

  /** The CAT inside the diagnostic's own check screen (mini() below): mcq for a choice, numeric() for a number. */
  function catStep(kind, P, v, sendAns, stopping) {
    var body = P.view.querySelector('.dg-body'), timerEl = typeof document !== 'undefined' ? document.getElementById('dg-timer') : null;
    if (v.numeric) {
      P.view._pick = function () { sendAns({ op: 'stop' }); };              // "Stop the check" confirmed (M:023:632 calls view._pick)
      numeric(body, { id: v.id, n: v.n, sec: v.sec, left: v.left, prompt: P.T(v.prompt) }, timerEl, function (value, late) { if (stopping()) return sendAns({ op: 'stop' }); sendAns({ op: 'answer', item: v.id, token: null, value: value, late: late }); }, P.view);
      return;
    }
    var sync = true, prompt = v.math ? P.T(v.prompt) : v.prompt, was = body && body.querySelector ? body.querySelector('#dg-q') : null;
    P.mcq(prompt, v.options.map(function (o) { return v.math ? P.T(o.text) : o.text; }), function (i) { return v.options[i] ? v.options[i].t : null; }, catMeta(v), function (tok, late) {
      if (sync || stopping()) return sendAns({ op: 'stop' });
      sendAns({ op: 'answer', item: v.id, token: typeof tok === 'string' ? tok : null, late: !!late });
    }, secsOf(v), v.math);
    sync = false;
    /* P14: on the question the design just drew (a stop or a resume draws none), its instruction above it and a stem on more than one
     * line drawn line by line (headHtml, the design's own escaping and fractions); no design line changes */
    var q = body && body.querySelector ? body.querySelector('#dg-q') : null;
    if (!q || q === was) return;
    if (prompt.trim().indexOf('\n') >= 0) q.innerHTML = headHtml(prompt, v.math ? function (x) { return fracH(escH(x)); } : escH);
    var ins = insHtml(v); if (ins && q.insertAdjacentHTML) q.insertAdjacentHTML('beforebegin', ins);
  }

  /** A continuation set (spec §2.5): five questions a day (and a reading testlet in English), started by the daily task (P5e) when the
   *  server says one is due; its own screen in the diagnostic's look (.dg-view), the result at the end. o: { done(result), close() }. */
  function set(kind, o) {
    o = o || {};
    if (typeof document === 'undefined') return;
    css();
    var host = document.getElementById('jc-set');
    if (!host) {
      host = document.createElement('div'); host.className = 'dg-view'; host.id = 'jc-set'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true');
      var dv = document.getElementById('dg-view'); ((dv && dv.parentElement) || document.body).appendChild(host);
    }
    host.setAttribute('aria-label', cw('setTitle')[kind] || '');
    host.hidden = false; host.classList.remove('jc-wide');
    host.innerHTML = '<div class="dg-top"><button class="dg-back" type="button" data-k="x" aria-label="' + escH(cw('stop')) + '">×</button><p class="dg-tt" data-no-i18n>' + escH(cw('setTitle')[kind] || '') + '</p><span class="dg-timer" id="jc-timer"></span></div><div class="dg-body"></div><div class="dg-foot"></div>';
    var body = host.querySelector('.dg-body'), foot = host.querySelector('.dg-foot'), timerEl = host.querySelector('#jc-timer'), run = null, cur = null, t = null, answered = 0, over = null;
    /* A CHECK IS NEVER LOST WITHOUT BEING SEEN (owner 11 Oct 2026, delegated call, the teen walk 6; the 13-year-old on slow mobile data tapped
     * × while this screen was still empty: the reply came later, drew the set on this hidden screen, and its countdowns answered every
     * question "late" until the set ended unmeasured, his day locked). Once closed, this screen is done: no reply is drawn, no countdown
     * sends, and a set whose first question never reached his screen is dropped on the server (op "cancel": it was never an attempt). The
     * server starts a question's clock when the page says it is on screen (op "seen"), never when it was sent. */
    var closed = false, shown = false, seenId = null;
    function close(res, fresh) {
      if (closed) return; closed = true;
      if (t) t.stop(); host.hidden = true; host.innerHTML = '';
      if (run && !shown) send(kind, { op: 'cancel', run: run });
      if (res && o.done) o.done(res); if (o.close) o.close();
      if (res && !fresh && window.JG_ENGINE && window.JG_ENGINE.refresh) window.JG_ENGINE.refresh();
    }
    /* "Saqlandi" is true on every screen when he gets them back (the 15-year-old, the sixth walk: the roadmap still said "you have not taken
     * the maths check" a minute after "Saved", until she reloaded): Close waits for the new snapshot (6 s at most) before the set's screen
     * gives way, so Home and the roadmap he opens next already read it. */
    function finish(res) {
      if (closed) return;
      var E = window.JG_ENGINE, b = foot.querySelector('[data-k=close]');
      if (!res || !E || !E.refresh) return close(res);
      if (b) { if (b.disabled) return; b.disabled = true; b.setAttribute('aria-busy', 'true'); }
      var done = false, end = function () { if (done) return; done = true; close(res, true); };
      Promise.resolve(E.refresh()).then(end, end); setTimeout(end, 6000);
    }
    function show(r) {
      if (closed) return;
      var b = r.body || {};
      if (b.run) run = b.run;
      if (r.status === 409 && b.error === 'stale' && b.next) b = { next: b.next, answered: b.answered };   // the question on screen, as the server has it
      // the clock runs on under "Stop here?" (the fifth walk, 11 Oct 2026): when it runs out there, the dialog gives way to what comes next
      host.classList.remove('jc-asking');
      /* ONE ATTEMPT MEANS ONE (the owner's ruling of 3 Oct, "Qayta topshirib boʻlmasin"; owner 10 Oct, delegated call, the fifth walk): a set he
       * stopped is not over and is not replaced by a fresh one. It waits (the server says: paused), and the card says the one true thing. */
      if (b.paused) {
        if (t) t.stop(); timerEl.textContent = ''; host.classList.remove('jc-wide'); over = { res: null };
        body.innerHTML = '<div class="jc-res jc-un" data-no-i18n><b>' + escH(cw('paused')) + '</b><span>' + escH(cw('pausedNext')) + '</span></div>';
        foot.innerHTML = '<button class="dg-go" type="button" data-k="close" data-no-i18n>' + escH(cw('close')) + '</button>';
        foot.querySelector('[data-k=close]').onclick = function () { close(null); };
        return;
      }
      if (b.result) {
        over = { res: b.result };
        if (t) t.stop(); timerEl.textContent = ''; host.classList.remove('jc-wide');
        // owner 10 Oct (delegated call, the teen walk 3): the card says what the sitting was (N of M right, what ran out of time) and when the
        // next set comes; a set that measured nothing (F1) says so, changes nothing and names no level; one tapped through says why
        var R = b.result, un = R.unmeasured === true;
        // the fourth walk (11 Oct 2026): a set that measured nothing can be gone on with today (the server says: b.again); one measured
        // although a clock ran out says that it was measured from what was answered, so its result is a wider guess
        // the teen walk 6 (11 Oct 2026): a set that measured nothing says what the roadmap's note says, that the check comes again in the next days (it said "Try again tomorrow", and the sets take turns)
        var l2 = un ? [R.fast ? cw('setFast') : cw('comesAgain')] : [(R.detail || {})[lang()], (R.covers || {})[lang()], R.timeouts > 0 ? cw('wide') : ''];
        // PROMISES KEPT (the fourth walk, 11 Oct 2026; the 17-year-old: "The maths check ends 'The next short set comes tomorrow.' No maths
        // set came on day 2, 3 or 4"): the card no longer names a day. A day holds one check set at most and the sets take turns with her
        // route's step and the other skill, so "tomorrow" was true only by chance; the page is not told when the next one comes, so it says
        // nothing (the words stay in the tables, unused).
        var l3 = un ? cw('unsaved') : cw('saved');
        body.innerHTML = '<div class="jc-res' + (un ? ' jc-un' : '') + '" data-no-i18n>' + (un ? '' : escH(cw('result'))) + '<b>' + escH((R.line || {})[lang()] || (R.line || {}).en || '') + '</b><span>' + escH(counts(R).concat(l2).filter(Boolean).join(' · ')) + '</span><span>' + escH(l3) + '</span></div>';
        foot.innerHTML = '<button class="dg-go" type="button" data-k="close" data-no-i18n>' + escH(cw('close')) + '</button>';
        foot.querySelector('[data-k=close]').onclick = function () { finish(b.result); };
        return;
      }
      if (!b.next) {
        body.innerHTML = '<p class="dg-result" data-no-i18n>' + escH(b.error === 'not_due' ? cw('notDue') : cw('again')) + '</p>';
        foot.innerHTML = '<button class="dg-go" type="button" data-k="close" data-no-i18n>' + escH(cw('close')) + '</button>';
        foot.querySelector('[data-k=close]').onclick = function () { close(null); };
        return;
      }
      cur = b.next; answered = b.answered || 0; foot.innerHTML = '';
      var saidLate = wasLate; wasLate = false;
      host.classList.toggle('jc-wide', !!cur.testlet);
      if (cur.testlet) t = testlet(body, foot, cur, timerEl, function (tokens, late) { go({ op: 'answer', item: cur.id, token: null, tokens: tokens, late: late }); });
      else if (cur.numeric) t = numeric(body, cur, timerEl, function (value, late) { go({ op: 'answer', item: cur.id, token: null, value: value, late: late }); });
      else t = choice(body, cur, timerEl, function (tok, late) { go({ op: 'answer', item: cur.id, token: tok, late: late }); });
      if (saidLate) lateNote(body);
      if (body.scrollTo) body.scrollTo(0, 0);
      shown = true;
      if (run && seenId !== cur.id) { seenId = cur.id; send(kind, { op: 'seen', item: cur.id, run: run }); }   // on his screen now: its clock starts on the server
    }
    var wasLate = false;
    function go(x) {
      if (closed) return Promise.resolve();                                    // a countdown of a screen he has left sends nothing
      if (run) x.run = run; if (x.op === 'answer') wasLate = !!x.late;
      return send(kind, x).then(function (r) {
        var b = (r && r.body) || {};
        if (closed) { if (x.op === 'start' && b.run && b.next && !shown) send(kind, { op: 'cancel', run: b.run }); return; }   // left before it drew: never an attempt
        show(r);
      });
    }
    /* THE STOP QUESTION IS NOT A PAUSE BUTTON (the fifth walk, 11 Oct 2026; the 13-year-old: he read a question, tapped ×, waited 20 seconds on
     * «Shu yerda toʻxtatasizmi?», tapped «Davom etish»: the same question at 0:14 of 0:15). The dialog held the clock here and on the
     * server; it holds neither now: the countdown in the corner keeps running while it asks, and if it runs out the question is timed
     * out like any other and the next one comes. */
    host.querySelector('[data-k=x]').onclick = function () {
      if (over) return finish(over.res);                                       // a result or a stopped set on screen: × is its Close
      // no question on his screen yet (slow data: the screen still empty): leave, and the set is dropped with nothing counted (close, go).
      // The teen walk 6: once a question is on screen, × asks first, answered or not, and "Stop" makes the set wait (D43's stopped set)
      if (!cur) return close(null);
      if (host.classList.contains('jc-asking')) return;
      var ask = document.createElement('div'); ask.className = 'jc-ask'; ask.setAttribute('data-no-i18n', '');
      ask.innerHTML = '<p class="dg-private">' + escH(cw('stopAsk')) + '</p><button class="dg-go" type="button" data-k="go">' + escH(cw('keep')) + '</button><button class="dg-link" type="button" data-k="stop">' + escH(cw('stop')) + '</button>';
      foot.appendChild(ask); host.classList.add('jc-asking');
      ask.querySelector('[data-k=go]').onclick = function () { host.classList.remove('jc-asking'); if (ask.parentNode === foot) foot.removeChild(ask); };
      ask.querySelector('[data-k=stop]').onclick = function () { host.classList.remove('jc-asking'); if (ask.parentNode === foot) foot.removeChild(ask); if (t) t.stop(); go({ op: 'stop' }); };
    };
    go({ op: 'start', set: 'daily' });
  }

  /** The English or the math check (M:023:513-548). P: { A, view, frame, mcq, T, finish, mark }. */
  function mini(engine, q, P) {
    var kind = engine === 'math_ladder' ? 'math' : 'english', math = kind === 'math', marked = false, last = null;
    P.frame(P.T(math ? 'Math check' : 'English check'), q.id);
    var body = P.view.querySelector('.dg-body');
    active = kind;
    // P5c: a confirmed "Stop the check" (M:023:632) seen before the design acts on it, so a CAT question answers it with one stop
    if (P.view.addEventListener && !P.view._jcStopWatch) { P.view._jcStopWatch = true; P.view.addEventListener('click', function (e) { var a = e.target && e.target.closest && e.target.closest('[data-act]'), k = a && a.getAttribute('data-act'); if (k === 'teststop') P.view._jcStopping = true; else if (k === 'testgo') P.view._jcStopping = false; }, true); }
    P.view._jcStopping = false;
    function stopping() { return !!P.view._jcStopping; }
    var miniLate = false;
    function here() { return P.view.querySelector('.dg-body') === body; }   // the student left the check: a late answer draws nothing
    function show(b) {
      if (!here()) return;
      if (b.result) { active = null; P.view._jcStopping = false; return P.finish(b.result); }
      if (!b.next) return last && show(last);                                  // refused: the same question again
      if (b.answered > 0 && !marked) { marked = true; P.mark(); }             // a check left partway is no result (M:023:515)
      last = b;
      if (b.next.set) { catStep(kind, P, b.next, function (x) { if (x.op === 'answer' && !marked) { marked = true; P.mark(); } miniLate = x.op === 'answer' && !!x.late; send(kind, named(kind, x)).then(done); }, stopping); if (miniLate) { miniLate = false; lateNote(P.view.querySelector('.dg-body')); } return; }   // P5c: the CAT's question
      var v = b.next, sync = true;
      var meta = math ? P.T('Question {n} · step {s} of {m}', { n: v.n, s: v.step, m: v.steps }) : P.T('Question {n} · level {l}', { n: v.n, l: v.level });
      P.mcq(math ? P.T(v.prompt) : v.prompt, v.options.map(function (o) { return math ? P.T(o.text) : o.text; }), function (i) { return v.options[i] ? v.options[i].t : null; }, meta, function (tok, late) {
        if (sync) { send(kind, named(kind, { op: 'stop' })).then(done); return; }       // a confirmed stop answers at once every question left (the page's dgAuto 1)
        if (!marked) { marked = true; P.mark(); }
        send(kind, named(kind, { op: 'answer', item: v.id, token: typeof tok === 'string' ? tok : null, late: !!late })).then(done);
      }, v.sec, math);
      sync = false;
    }
    function done(r) { keep(kind, r.body && r.body.run); show(r.body || {}); }
    send(kind, named(kind, { op: 'start', grade: P.A && P.A.m1_grade != null ? String(P.A.m1_grade).slice(0, 20) : undefined })).then(done);
  }

  /** The reading check (M:023:551-562). P: { view, frame, mcq, T, esc, done }.
   *  Its end (the teenagers' walk, 10 Oct 2026: "After the 5th reading question the screen just jumped back to Home. It never told me how many
   *  I got right"): a live student's check ends on its result, which stays until he taps: "5 tadan 4 ta toʻgʻri" and one kind line, in the
   *  student's language (new copy, kept from the dictionaries); only then is the design told (P.done), which closes the check as before. The
   *  count is the server's own share (comprehension_pct) of the questions asked; a check that was already over when opened, and the demo,
   *  end as the design ends them. */
  function reading(lang, P) {
    var shown = null, body = null, asked = 0;
    function frame(name) { if (shown === name) return; shown = name; P.frame(P.T('Reading check · {name}', { name: name })); body = P.view.querySelector('.dg-body'); }
    function here() { return P.view.querySelector('.dg-body') === body; }
    frame(NAMES[lang] || NAMES.uz);
    active = null;
    function show(b) {
      if (!here()) return;
      if (b.result) return DEMO || !asked ? P.done(b.result) : ended(b.result);
      if (b.passage) {
        frame(b.passage.name);
        body.innerHTML = '<p class="dg-mod">' + P.T('Read at your normal speed. Then 5 short questions.') + '</p><div class="dg-passage" lang="' + P.esc(b.passage.lang) + '">' + P.esc(b.passage.text) + '</div>';
        var foot = P.view.querySelector('.dg-foot');
        foot.innerHTML = '<button class="dg-go" type="button" data-read>' + P.T("I've finished reading") + '</button>';
        P.view.querySelector('[data-read]').onclick = function () { foot.innerHTML = ''; send('reading', named('reading', { op: 'read' })).then(done); };
        return;
      }
      if (!b.next) return;
      if (b.name) frame(b.name);
      var v = b.next; asked = v.of || asked;
      P.mcq(v.prompt, v.options.map(function (o) { return o.text; }), function (i) { return v.options[i] ? v.options[i].t : null; }, P.T('Question {n} of {m}', { n: v.n, m: v.of }), function (tok) {
        send('reading', named('reading', { op: 'answer', item: v.id, token: typeof tok === 'string' ? tok : null })).then(done);
      });
    }
    function ended(res) {
      var right = Math.round((res.comprehension_pct || 0) * asked / 100), foot = P.view.querySelector('.dg-foot');
      css();
      body.innerHTML = '<div class="jc-res" data-no-i18n role="status">' + escH(cw('result')) + '<b>' + escH(cw('readScore', { a: right, m: asked })) + '</b><span>' + escH(cw(right >= asked ? 'readAll' : right * 5 >= asked * 3 ? 'readGood' : 'readLow')) + '</span></div>';
      foot.innerHTML = '<button class="dg-go" type="button" data-read data-no-i18n>' + escH(cw('readGo')) + '</button>';
      var told = false, fin = function () { if (told) return; told = true; foot.innerHTML = ''; P.done(res); };
      P.view.querySelector('[data-read]').onclick = fin;
      // the × at the top of the result means the same as its button: the check is over and graded, so it closes as a finished check
      if (P.view.addEventListener) {
        var x = function (e) {
          var a = e.target && e.target.closest && e.target.closest('[data-act=quittest],[data-act=close]'); if (!a) return;
          P.view.removeEventListener('click', x, true);
          if (!told) { e.stopPropagation(); e.preventDefault(); fin(); }
        };
        P.view.addEventListener('click', x, true);
      }
    }
    function done(r) { keep('reading', r.body && r.body.run); show(r.body || {}); }
    send('reading', named('reading', { op: 'start', lang: lang })).then(done);
  }

  /** A task's quiz (M:023:893-897; owner 4 Oct R9). P: { finish, esc, label, words }.
   *  Its size (the P5 wave-3 walk, 10 Oct 2026): a sheet holds at most ten questions, so a longer practice comes as the same task in two
   *  parts: after a passed part that is not the last the box says so and offers the next part (the server serves it; new copy in en / uz /
   *  ru, kept from the dictionary). A sheet of more than five questions is headed "Quiz", not the design's "Quick quiz". The pass mark is
   *  the server's (src/engine/tasks.ts quizPassMark: two thirds, rounded up).
   *  The teen walk of 10 Oct 2026 (the controller's and the owner's delegated calls; new copy in en / uz / ru, in code, kept from the dictionary):
   *  - a failed quiz is not a dead end: the fail screen says the score, "almost" only one answer short of the pass on a quiz of five or
   *    more, never "review the lesson" (no lesson is linked), whether "Try again" is easier (the server says: result.retry), and offers
   *    "This is too hard for me" (op "hard"); finishing a second failed attempt, or that button, completes the task (result.enough) with
   *    its coins and a kind line that is true ("tomorrow we start with easier ones" only when the learner model sets his practice);
   *  - "See my result" shows the result: "7 of 10 right" and the coins stay on the sheet until the student taps; the task completes on that
   *    tap, or when the sheet or the page is left with the result on it (the design's own finish then runs: its "Done" line, the Dome).
   *  The teenagers' second walk (10 Oct 2026): a requirement's card is a quiz of ONE question whose answer stands in the sheet's own lines
   *  (src/server/facts.ts). While one more try is left the server does not say which option was right (reveal.right and reveal.answer are
   *  empty, its why says "read the lines above once more"): no option is marked right and no "Answer:" is written. */
  function quiz(task, box, P) {
    var E = window.JG_ENGINE, QF = E && E.cache && E.cache.quiz_feedback, W = (QF && QF.words) || P.words;
    var run = null, cur = null, after = null, busy = false, tm = null;   // tm: a timed question's countdown (DTM-format practice)
    /* P8c item 3: a run of the lessons part (the server's start says clock: 'seen') starts each question's clock when it is on her screen: the
     * sheet says so once a question (op seen), so the reveal of the answer before is not counted as reading time */
    var clockSeen = false, seenId = null;
    /* A TRIED task opened again the same day (the third walk, 10 Oct 2026: "Try again: the questions are easier now" was promised, and after
     * "This is too hard for me" the tile was shut). `back`: this sheet is that second chance. A line says so above the questions; a pass
     * turns the task DONE (JG_ENGINE.wonBack, then the design's own finish: its "Done" line, the tick, a step of the building) and pays
     * what is left of the task's coins (task.again: the snapshot's, or what this page kept when it ended the task as tried); a miss is a
     * plain miss with "Try again": no second "You tried", no "too hard" to tap twice. */
    var back = !!(E && E.canAgain && E.canAgain(task));
    /* P7: `own`: the caller's words are in her language (P.head names the head: the laptop's lessons page, whose reader the page dictionary
     * does not touch); then this sheet's own lines are written in her language too, not left to the dictionary. "Try again" on a button: */
    var own = typeof P.head === 'function';
    function tryAgain() { return own ? ' data-no-i18n>' + P.esc(cw('tryAgain')) : '>Try again'; }
    /* "I don't know" under a question (the third walk; deferred twice): an honest answer, counted wrong, never a blind tap at an option. For
     * a live student only: the demo family's quiz is the design's, as drawn. */
    var live = !!(E && window.JG_BOOT && !window.JG_BOOT.demo);
    /* ONE MORE GO (the sixth walk, 11 Oct 2026): the line says it is one; a lesson's (or any) go that adds no coins says that, not "0 more coins" */
    var backN = (typeof task.again === 'number' ? task.again : task.coins) | 0;
    if (back && box.insertAdjacentHTML && !(box.parentNode && box.parentNode.querySelector && box.parentNode.querySelector('.jg-back')))
      box.insertAdjacentHTML('beforebegin', '<p class="jt-adv jg-back" data-no-i18n>' + P.esc(backN > 0 ? cw('back', { n: backN }) : cw('backMemo')) + '</p>');
    /* The P5 fix: the line a missed quiz ends with matches its result: "Almost!" one short of the pass (the design's own line, M:023:896), and
     * not at 0 right, where it said "Almost!" too; in the student's language from the snapshot's words, the design's English without them. */
    function miss(right, of, retry) {
      var almost = of >= 5 && right === Math.ceil(2 * of / 3) - 1;
      return cw(almost ? 'almost' : 'missed', { a: right, b: of }) + (retry === undefined ? '' : ' ' + cw(retry === 'easier' ? 'retryEasier' : 'retrySame'));
    }
    /* The result stays until the student taps (the teen walk: "the button says My result and there is no result"). The task completes on
     * that tap; leaving the sheet (its background, "Study this") or the page with the result on it completes it too, so a pass is never lost. */
    var pending = null, watched = false, goAgain = null;
    function shown(res) {
      /* a task that can still be won back today says so, never "tomorrow" for what Home offers today (the teen walk 6, 11 Oct 2026: "Bugun shu
       * yetarli. Ertaga osonroqdan boshlaymiz. ✓ Urinib koʻrdingiz · +5", then Home "qayta urinish: 1" with the day shut): JG_ENGINE.canAgain's
       * own rule, a quiz task of today ended as tried */
      /* TWO REAL TRIES A DAY (12 Oct 2026; the server's winBackOpen): the one more go follows "too hard" only, never a second finished miss */
      var today = live && E && E.cache && task && task.verification === 'quiz' && task.date === E.cache.local_date && res.enough === 'hard';
      /* THE END LINE TELLS THE TRUTH ABOUT NOW AND TOMORROW (the sixth walk, 11 Oct 2026; the 17-year-old: «Завтра начнём с более лёгких», and
       * the row opened an easier set the same day): `now` says the one more go today is drawn easier, `next` that tomorrow starts easier.
       * JOINED (int7, p5w-checks + p5w-pay): the server's `now` speaks first (enoughNow / enoughBoth); else a quiz of today that can be won
       * back says so (enoughToday, in place of "enough" and "tomorrow easier"); else tomorrow, as before */
      var endKey = res.now === 'easier' ? (res.next === 'easier' ? 'enoughBoth' : 'enoughNow') : today ? 'enoughToday' : res.next === 'easier' ? 'enoughEasier' : 'enough';
      var done = false, kind = res.enough ? '<p class="jt-miss" data-no-i18n>' + P.esc(cw(endKey)) + '</p>' : '';
      cur = null; after = null;
      /* the second walk, 10 Oct 2026 ("giving up pays four times more than doing"): a quiz that ends without a pass is TRIED: the server
       * says what it pays (res.pays: 0 since the owner's 12 Oct 2026 "do man, fix"; it was a tick's 5), the task this sheet holds takes that
       * amount (its quiz reward is for a pass), and `again` keeps what the one more go's pass pays (a lesson's: the server's again_pays). */
      var triedPay = res.enough && typeof res.pays === 'number' ? res.pays | 0 : null;
      if (triedPay !== null) { if (typeof task.again !== 'number') task.again = typeof res.again_pays === 'number' ? res.again_pays | 0 : Math.max(0, (task.coins | 0) - triedPay); task.coins = triedPay; }   // again: what a pass later today still pays (a lesson's: the server's again_pays)
      /* LESSON RETRIES (owner 10 Oct, delegated call, the fifth walk, 11 Oct 2026: "3 tadan 3 ta toʻgʻri · ✓ Bajarildi · +5" 8.7 s after the
       * answers were shown): a pass on questions whose answers she had been shown is DONE and pays a tick's coins in all (the server:
       * res.memo, res.pays = what this pass still pays, 0 when the tick is paid already). The sheet says that amount and why. */
      var memo = !!(res.pass && res.memo && typeof res.pays === 'number');
      if (memo) { task.coins = res.pays | 0; if (back) task.again = res.pays | 0; }
      if (back && res.pass) { if (typeof task.again === 'number') task.coins = task.again; if (E && E.wonBack) E.wonBack(task); }
      /* after a second miss of a lesson: what the next try pays, and that it opens once the page is read again (res.again_pays, res.reread) */
      if (res.enough && typeof res.again_pays === 'number') kind += '<p class="jt-adv jg-memo" data-no-i18n>' + P.esc(cw(res.again_pays > 0 ? 'memoPay' : 'memoNone', { n: res.again_pays | 0 })) + '</p>';
      if (res.enough && res.reread) kind += '<p class="jt-adv jg-reread" data-no-i18n>' + P.esc(cw('reread', { s: res.reread | 0 })) + '</p>';
      /* the second walk of the 15- and the 17-year-old, 10 Oct 2026 ("the row says Готово like a pass and counts for the day and the streak"):
       * a TRIED quiz does not run the design's finish (its "✓ Done" line, its tick, a step of the building): the runtime ends it as tried
       * (JG_ENGINE.endTask: the tick's coins, the tile's own mark) and the sheet closes on the line it already shows */
      /* P16 final [p15#7]: a homework run's end puts its row in the list right at once (handed in, the corrections left: public/runtime/jg-hw.js);
       * a CORRECTIONS run (res.fixing) completes and pays nothing (the server: src/server/checks.ts quizKept), so its end runs no finish (the
       * design's "✓ Done · 🪙 +N"): the sheet just closes */
      var fixing = live && !!res.fixing;
      if (live && res.homework === true && window.JG_HW && typeof window.JG_HW.ended === 'function') window.JG_HW.ended(task.id, res.corrections_left | 0);
      pending = function () {
        if (done) return; done = true; pending = null;
        if (fixing) { var fs = box.closest && box.closest('.jt-sheet'); if (fs && fs.remove) setTimeout(function () { fs.remove(); }, 0); return; }
        /* a lesson's test is no task of the day: the server has ended it, and the lessons page draws its result card from `res` (P6) */
        if (task.mode) { P.finish('quiz ' + res.right + '/' + res.of, { run: run, res: res }); return; }
        if (res.enough && E && E.endTask) { E.endTask(task, 'tried', 'quiz ' + res.right + '/' + res.of, { run: run }); var sh = box.closest && box.closest('.jt-sheet'); if (sh && sh.remove) setTimeout(function () { sh.remove(); }, 0); return; }
        P.finish('quiz ' + res.right + '/' + res.of, { run: run });
      };
      /* NO COINS FOR A FAILED TRY (the owner, 12 Oct 2026, "do man, fix"): a tried ending pays nothing and says that coins come for right
       * answers; after "too hard" it offers the easier set right here (the one more go: a pass pays the task's coins, as any pass). The
       * button ends the task as tried, as Close would, and starts the go in this same sheet (`back`, its line above the questions) */
      var offer = today && triedPay !== null;
      goAgain = !offer ? null : function () {
        if (done) return; done = true; pending = null; goAgain = null;
        if (E && E.endTask) E.endTask(task, 'tried', 'quiz ' + res.right + '/' + res.of, { run: run });
        back = true; backN = typeof task.again === 'number' ? task.again | 0 : 0;
        if (typeof task.again === 'number') { task.paid = task.coins | 0; task.coins = task.again; }   // as JG_ENGINE's openAgain does for a tile
        if (box.insertAdjacentHTML && !(box.parentNode && box.parentNode.querySelector && box.parentNode.querySelector('.jg-back')))
          box.insertAdjacentHTML('beforebegin', '<p class="jt-adv jg-back" data-no-i18n>' + P.esc(backN > 0 ? cw('back', { n: backN }) : cw('backMemo')) + '</p>');
        start();
      };
      /* THE HOMEWORK RESULT CARD (SPEC-lessons §5.3; P6b fix A item 2): a homework set's first try ends on the server's three lines, in her
       * language: the score and the coins ("Birinchi urinishda 6/8 · +20 tanga"), each skill's level and why, the corrections left. They
       * replace the sheet's generic score, its "enough" line and its coins chip, which the first line now says */
      var card = live && res.card && res.card.one && !res.fixing ? res.card : null, L = lang();
      var said = card ? '<p class="jt-q jg-hw1" data-no-i18n>' + P.esc(card.one[L] || card.one.en) + '</p>'
          + (card.skills || []).map(function (s) { return '<p class="jt-adv jg-hwl" data-no-i18n>' + P.esc(s[L] || s.en) + '</p>'; }).join('')
          + '<p class="jt-adv jg-hw3" data-no-i18n>' + P.esc(card.next[L] || card.next.en) + '</p>'
        : fixing ? '<p class="jt-q" data-no-i18n>' + P.esc(cw('right', { a: res.right, b: res.of })) + '</p><p class="jt-adv jg-hwfix" data-no-i18n>'
          + P.esc((res.corrections_left | 0) > 0 ? cw('fixLeft', { n: res.corrections_left | 0 }) : cw(res.right < res.of ? 'fixSome' : 'fixAll')) + '</p>'   // P16 final [p15#7]: the score, the set's state, no coins
        : '<p class="jt-q" data-no-i18n>' + P.esc((res.parts > 1 ? cw('partN', { n: res.part }) + ' · ' : '') + cw('right', { a: res.right, b: res.of })) + '</p>' + kind
          + '<p class="jt-ok" data-no-i18n>' + P.esc(cw(triedPay !== null ? 'tried' : memo ? ((task.coins | 0) > 0 ? 'paidMemo' : 'paidMemo0') : 'paid', { n: task.coins | 0 })) + '</p>';
      box.innerHTML = said
        + (offer ? '<button class="dg-go" type="button" data-t="qeasier" data-no-i18n>' + P.esc(cw(res.now === 'easier' ? 'goEasier' : 'tryAgain')) + '</button><button class="dg-link" type="button" data-t="qdone" data-no-i18n>' : '<button class="dg-go" type="button" data-t="qdone" data-no-i18n>') + P.esc(cw('close')) + '</button>';
      var b = box.querySelector(offer ? '[data-t=qeasier]' : '[data-t=qdone]'), sheet = box.closest && box.closest('.jt-sheet');
      if (b && b.focus) b.focus();
      if (watched) return; watched = true;
      if (sheet && sheet.addEventListener) sheet.addEventListener('click', function (e) { if (pending && e.target.closest && e.target.closest('[data-t=shut],[data-t=study]')) pending(); }, true);
      if (window.addEventListener) window.addEventListener('pagehide', function () { if (pending) pending(); });
      /* A RESULT SHOWN IS A RESULT KEPT (owner 10 Oct, delegated call, the fifth walk, 11 Oct 2026; the 17-year-old: «Верно 2 из 3 ✓ Готово ·
       * +10», he closed the sheet without «Закрыть», the row stayed «Ожидает» and the coins did not come). The server has completed the task
       * in the request that computed this result (src/server/checks.ts quizKept), so nothing is lost whatever the page does. The page keeps up
       * with it: however the sheet leaves the screen (its background, Escape, another sheet opened over it, a tab's own paint), the task is
       * finished here too, so its row, its coins and the day show what the server already holds. */
      if (sheet && sheet.parentNode && typeof window.MutationObserver === 'function') {
        var host = sheet.parentNode, mo = new window.MutationObserver(function () {
          if (sheet.isConnected) return;
          mo.disconnect(); if (pending) pending();
        });
        mo.observe(host, { childList: true });
      }
    }
    function start() {
      busy = true;
      /* a lesson's test or test-out (SPEC-lessons §4.1, §11.3; P6): the task names its mode and its lesson, which the server reads; any other
       * task's body is as it was (undefined keys are not sent) */
      /* (the P6 integration: a lesson's test from the laptop's lessons page is no task of the day, so it names no task: the server serves it by
       * its mode and its lesson, and a task id it does not know would be refused) */
      send('quiz', { op: 'start', task: task.mode ? undefined : String(task.id), quiz: task.quiz === 'math' ? 'math' : 'english', mode: task.mode || undefined, lesson: task.mode ? task.lesson : undefined, unit: task.mode === 'unit_test' ? task.unit : undefined }).then(function (r) {   /* P7f: a unit test names its unit */
        busy = false;
        /* a second chance whose questions she has seen the answers to adds no coins: the line above the questions says so (it said "{n} more
           coins"), while the retry waits too (the server says `memo` with the questions, and with its "reread") */
        var bl = r.body.memo && back && box.parentNode && box.parentNode.querySelector ? box.parentNode.querySelector('.jg-back') : null;
        /* (12 Oct 2026: a tried task paid nothing, so such a pass pays the tick, 5: TASK_COINS.tick, src/server/engine/tasks.ts winBack) */
        if (bl) bl.textContent = backN > 0 ? cw('backMemoN', { n: Math.min(backN, 5) }) : cw('backMemo');
        /* a timed set's first question waits for "Start" (the round-9 re-check, 12 Oct 2026: its clock ran while the card's intro was still
         * being read above it): each question's clock starts when that question is shown (ready) */
        if (r.body.next) { run = r.body.run; clockSeen = r.body.clock === 'seen'; seenId = null; if (r.body.next.limit > 0 && r.body.next.n === 1) ready(r.body.next); else ask(r.body.next); return; }
        cur = null; after = null;   // P5 review: never an empty box. Used up: the design's miss line, nothing to try again; else its "One moment".
        /* LESSON RETRIES: after two misses the next try opens once the page has been read again (the server: 409 "reread", the seconds left) */
        if (r.body.error === 'reread') { box.innerHTML = '<p class="jt-adv jg-reread" data-no-i18n></p><button class="dg-go" type="button" data-t="retry" disabled' + tryAgain() + '</button>'; reread(r.body.wait | 0); return; }
        /* ONE MORE GO, used (the sixth walk): the task stays tried for today; the line says so, with nothing to tap again */
        if (r.body.error === 'again_used') { lastGo(); return; }
        /* P16 final [p15#7]: a set whose corrections were all done elsewhere (the list read before them): the sheet the design draws for a done task */
        if (r.body.error === 'complete') { box.innerHTML = '<p class="jt-ok">✓ Done today</p><button class="dg-link" type="button" data-t="shut">Close</button>'; if (window.JG_HW && window.JG_HW.refresh) window.JG_HW.refresh(); return; }
        if (r.body.error === 'attempts') box.innerHTML = '<p class="jt-miss" data-no-i18n>' + P.esc(miss(r.body.right | 0, (r.body.of | 0) || 3)) + '</p>' + shutBtn();   // every ending has Close (12 Oct 2026)
        else box.innerHTML = own ? '<p class="jt-miss" data-no-i18n>' + P.esc(cw('again')) + '</p><button class="dg-go" type="button" data-t="retry"' + tryAgain() + '</button>'
          : '<p class="jt-miss">One moment, then try again.</p><button class="dg-go" type="button" data-t="retry">Try again</button>';
      });
    }
    /* DTM-FORMAT PRACTICE: before the first timed question, no clock: the set's name, one line on the time, and "Start", which shows the
     * question and starts its clock (the tap goes through qnext, as "Next" does between questions) */
    function ready(v) {
      if (tm) { tm.stop(); tm = null; }
      cur = null; after = { next: v };
      box.innerHTML = '<b class="jr-next-h" data-no-i18n>' + P.esc(cw('dtm')) + '</b><p class="jt-adv jg-tm-note" data-no-i18n>' + P.esc(cw('qTimeNote')) + '</p><button class="dg-go" type="button" data-t="qnext" data-no-i18n>' + P.esc(cw('qGo')) + '</button>';
      var g = box.querySelector('[data-t=qnext]'); if (g && g.focus) g.focus();
    }
    function ask(v) {
      cur = v; after = null;
      /* a practice in two parts says which part this is: "1-qism · 1 / 10" (the second walk: "20 ta savol", then "TEST · 1 / 10") */
      /* P7 (the P6 walk's malika-1440-ielts_r-11-test, timur-1440-sat_rw-11-test: "TEST · 1 OF 3" on uz and ru pages): a caller whose words
       * are hers (the laptop's lessons page, whose reader the page dictionary does not touch) names the head itself, "Test · 1/3" as the
       * phone says it; the task sheet's head is the design's English, which the page dictionary translates, as before */
      var head = v.parts > 1 ? '<b class="jr-next-h" data-no-i18n>' + P.esc(cw('partN', { n: v.part }) + ' · ' + v.n + ' / ' + v.of) + '</b>'
        : own ? '<b class="jr-next-h" data-no-i18n>' + P.esc(P.head(v.n, v.of)) + '</b>' : '<b class="jr-next-h">' + (v.of > 5 ? 'Quiz' : P.label) + ' · ' + v.n + ' of ' + v.of + '</b>';
      if (tm) { tm.stop(); tm = null; }
      /* DTM-FORMAT PRACTICE (owner 12 Oct 2026, "do man"): a state-test question has its own seconds (v.limit, the item's time); they count
       * down under the question's number, and at 0:00 the question goes as not answered in time. Its head names the test, not "Quick quiz" */
      var lim = v.limit > 0 ? v.limit | 0 : 0;
      if (lim && !(v.parts > 1)) head = '<b class="jr-next-h" data-no-i18n>' + P.esc(cw('dtm') + ' · ' + cw('qOf', { n: v.n, m: v.of })) + '</b>';
      /* P7: a stem's bulleted notes drawn as a list (promptHtml); a question on a passage drawn with it (framed) */
      /* P15 (IELTS Listening, public/runtime/jg-listening.js, loaded with LISTENING on): the question's clip above it (its plays: once in a
       * test, one counted replay in homework), and a typed gap in place of options */
      var Lz = window.JG_LISTEN, play = v.audio && Lz ? Lz.player(v.audio, 'q:' + (run || '') + ':' + v.id) : '', typedQ = !!(v.typed && Lz);
      box.innerHTML = framed(v, head + (lim ? '<p class="jt-adv jg-tm" data-no-i18n>' + P.esc(cw('qTime')) + ' <b class="jg-tm-c">' + clock(lim) + '</b></p>' : '') + play + insHtml(v, P.esc) + promptHtml(v.prompt, 'jt-q', ' data-no-i18n', P.esc)
        + (typedQ ? Lz.typed(v, null) : '<div class="dg-opts" data-no-i18n>' + v.options.map(function (o, j) { return '<button type="button" class="dg-opt" data-j="' + j + '"><span>' + P.esc(o.text) + '</span></button>'; }).join('') + '</div>')
        + (live ? '<button class="dg-link" type="button" data-t="dunno" data-no-i18n>' + P.esc(cw('quizDunno')) + '</button>' : ''));
      if (clockSeen && run && seenId !== v.id) { seenId = v.id; send('quiz', { op: 'seen', item: v.id, run: run }); }   // P8c item 3: on her screen now
      if (lim) tm = countdown(box.querySelector('.jg-tm-c'), lim, function () { tm = null; if (cur === v && !after && !busy && box.isConnected !== false) pick(v, null, true); });
    }
    function end(res) {
      if (res.pass && res.parts > 1 && res.part < res.parts) {              // a part of a longer practice: the next part, not the end
        cur = null; after = null;
        /* a passed part pays its half at once (the server has credited res.pays): the line says so, the wallet shows it, and the task this
         * sheet holds keeps what is left for its last part */
        var half = typeof res.pays === 'number' ? res.pays | 0 : 0;
        if (half > 0) { task.coins = Math.max(0, (task.coins | 0) - half); if (window.JIA_coins && window.JIA_coins.add) try { window.JIA_coins.add(half); } catch (e) {} }
        box.innerHTML = '<p class="jt-ok" data-no-i18n>✓ ' + P.esc(cw('partDone', { n: res.part, m: res.parts, a: res.right, b: res.of }) + (half > 0 ? ' · 🪙 +' + half : '')) + '</p><button class="dg-go" type="button" data-t="retry" data-no-i18n>' + P.esc(cw('nextPart')) + '</button>';
        return;
      }
      if (res.pass && res.parts > 1 && typeof res.pays === 'number') task.coins = res.pays | 0;   // the last part pays what is left of the task's coins
      if (res.pass || res.enough) return shown(res);
      cur = null; after = null;
      /* a lesson's test or test-out from the lessons page (P6 integration: on the laptop a failed one stood on this sheet's "Try again" and
       * "too hard", which a lesson run has none of: the server refuses both): its miss goes to the lessons page's own result card, as its pass does */
      if (task.mode) { P.finish('quiz ' + res.right + '/' + res.of, { run: run, res: res }); return; }
      var partHead = res.parts > 1 ? cw('partN', { n: res.part }) + ' · ' : '';
      /* answered faster than a person reads (the server's rule, result.fast): not a pass whatever the score, and the line says why */
      /* too fast is nothing (the 17-year-old's second walk, 10 Oct 2026: three taps in four seconds, then "This is too hard": "✓ You tried ·
       * +5", the row "Done", the streak kept): no score to lean on, no "too hard" to tap, only the kind line and "Try again"; the task stays open */
      /* LESSON RETRIES (the fifth walk, 11 Oct 2026): the miss screen says, before the retry, what a pass on questions she has now seen the
       * answers to will pay (res.again_pays: the lesson holds no other question), and after a second miss that the page is to be read once
       * more: "Try again" opens when the server's seconds are over (res.reread) */
      var memoLine = !res.fast && typeof res.again_pays === 'number' ? '<p class="jt-adv jg-memo" data-no-i18n>' + P.esc(cw(res.again_pays > 0 ? 'memoPay' : 'memoNone', { n: res.again_pays | 0 })) + '</p>' : '';
      var wait = !res.fast && res.reread ? res.reread | 0 : 0;
      /* ONE MORE GO (the sixth walk, 11 Oct 2026): a miss on it keeps the task tried for today: the score, one line, and no "Try again" */
      if (res.last && !res.fast) { box.innerHTML = '<p class="jt-miss" data-no-i18n>' + P.esc(partHead + miss(res.right, res.of)) + '</p>'; return lastGo(true); }
      box.innerHTML = '<p class="jt-miss" data-no-i18n>' + P.esc(partHead + (res.fast ? cw('fast') : miss(res.right, res.of, res.retry || 'same'))) + '</p>' + memoLine + (wait ? '<p class="jt-adv jg-reread" data-no-i18n></p>' : '')
        + '<button class="dg-go" type="button" data-t="retry"' + (wait ? ' disabled' : '') + tryAgain() + '</button>'
        + (res.fast || back ? '' : '<button class="dg-link" type="button" data-t="hard" data-no-i18n>' + P.esc(cw('tooHard')) + '</button>');
      if (wait) reread(wait);
    }
    /* The one more go is used: "No more tries today. New questions come tomorrow." under what the box shows (`keep`), and the page's copy of
     * the task stops offering it (its `again` goes, so its tile opens the tried sheet; the snapshot the refresh brings says the same) */
    /* EVERY ENDING HAS CLOSE (the controller's decision of 12 Oct 2026, on the seventh walk's re-check; the 15- and the 17-year-old: after the
     * one more go failed, «Сегодня попыток больше нет» stood alone, and only a tap on the dimmed Home behind it closed the sheet). The button is
     * the design's own close (data-t="shut": its sheet removes itself on it, as on "✓ Done today · Close") */
    function shutBtn() { return '<button class="dg-go" type="button" data-t="shut" data-no-i18n>' + P.esc(cw('close')) + '</button>'; }
    function lastGo(keep) {
      cur = null; after = null;
      box.innerHTML = (keep ? box.innerHTML : '') + '<p class="jt-adv jg-last" role="status" data-no-i18n>' + P.esc(cw('lastGo')) + '</p>' + shutBtn();
      var sb = box.querySelector('[data-t=shut]'); if (sb && sb.focus) try { sb.focus({ preventScroll: true }); } catch (e) {}
      var bl = box.parentNode && box.parentNode.querySelector ? box.parentNode.querySelector('.jg-back') : null;   // "one more go" above it is used now
      if (bl && bl.remove) bl.remove();
      delete task.again;
      if (E && E.refresh) try { E.refresh(); } catch (e) {}
    }
    /* "Read the page once more": the line counts the seconds down and the retry opens at the end (the server refuses a start before it) */
    function reread(s) {
      var p = box.querySelector('.jg-reread'), b = box.querySelector('[data-t=retry]'), left = Math.max(0, s | 0);
      (function tick() {
        if (!p || !b || p.isConnected === false) return;
        if (left <= 0) { p.textContent = cw('rereadGo'); b.disabled = false; if (b.removeAttribute) b.removeAttribute('disabled'); return; }
        p.textContent = cw('reread', { s: left }); left--; setTimeout(tick, 1000);
      })();
    }
    /* "This is too hard for me": the attempt just failed is enough for today (the server marks it, and the task then completes with it). */
    function hard() {
      busy = true;
      send('quiz', { op: 'hard', run: run }).then(function (r) {
        busy = false; var res = r.body && r.body.result; if (res && res.enough) return shown(res);
        /* NEVER A DEAD END (owner 10 Oct, delegated call, the fifth walk, 11 Oct 2026: after three honest «Не знаю» the button vanished under
         * «Сначала ответьте на вопросы» and nothing else was offered). An attempt that was read is a try whatever was tapped, so the server
         * now takes this button after it; whenever it still refuses (an attempt tapped through, a task already tried today), the button gives
         * way to one kind line that says what to do, and «Try again» stays right under it */
        var h = box.querySelector('[data-t=hard]');
        if (h) h.outerHTML = '<p class="jt-miss jg-first" role="status" data-no-i18n>' + P.esc(cw('hardNo')) + '</p>';
        var again = box.querySelector('[data-t=retry]'); if (again && again.focus) again.focus();
      });
    }
    /* One answer: a tapped option (b), "I don't know" (b null), or a question whose own seconds ran out (late: DTM-format practice, owner 12 Oct
     * 2026; the server takes `late` only for a question that has them). Its countdown stops as the answer goes. */
    /* P15: `text`, a typed gap's answer (an IELTS Listening question): sent as text, never a token; its field becomes her answer, read-only */
    function pick(v, b, late, text) {
        var j = b ? +b.dataset.j : -1; busy = true;
        if (tm) { tm.stop(); tm = null; }
        /* "Bilmayman" says so (P6, SPEC-lessons C-28): on a lesson's test or a homework set the server counts it as a miss that is never too
           fast; on any other quiz it reads the answer as before (no option, the question's own reading time) */
        var body = text != null ? { op: 'answer', run: run, item: v.id, token: null, text: text } : { op: 'answer', run: run, item: v.id, token: b ? v.options[j].t : null, late: late ? true : undefined, dontknow: !b && !late ? true : undefined };
        if (v.audio && window.JG_LISTEN && window.JG_LISTEN.heard) body.played = window.JG_LISTEN.heard('q:' + (run || '') + ':' + v.id);   // P16 [p15#10]: how much of its clip she heard
        send('quiz', body).then(function (r) {
          busy = false;
          var x = r.body.reveal;
          if (!x || cur !== v) return;
          after = r.body;
          var tl = box.querySelector('.jg-tm'); if (tl && late) tl.textContent = cw('outOfTime');
          /* the fourth walk (the 13-year-old: "'Bilmayman' stays under 'Keyingisi' after I have already answered"): once an answer is in,
             by an option or by the button itself, the button goes; there is nothing left to not know */
          var dn = box.querySelector('[data-t=dunno]'); if (dn && dn.remove) dn.remove();
          [].forEach.call(box.querySelectorAll('.dg-opt'), function (o) { o.disabled = true; if (v.options[+o.dataset.j].t === x.right) o.classList.add('ok'); else if (o === b) o.classList.add('bad'); });
          var Lz = window.JG_LISTEN, tq = box.querySelector('.jgli-typed');   // P15: the typed gap shows her answer; the transcript after the why
          if (tq && Lz) tq.outerHTML = Lz.typed(v, { text: text || '', ok: !!x.ok });
          (box.querySelector('.dg-opts') || box.querySelector('.jgli-typed')).insertAdjacentHTML('afterend', '<div class="jd-res ' + (x.ok ? 'ok' : 'bad') + '" role="status"><b>' + P.esc(x.ok ? W.correct : W.wrong) + '</b><p data-no-i18n>' + (x.ok || !x.answer ? '' : P.esc(W.answer.replace('{{answer}}', function () { return x.answer; })) + ' ') + P.esc(x.why || '') + '</p></div>' + (x.script && Lz ? Lz.script(x.script) : '') + '<button class="dg-go" type="button" data-t="qnext">' + P.esc(r.body.result ? W.result : W.next) + '</button>');
          /* P7 (SPEC-lessons §4.6): a miss the server marked `hint` (a lesson's test or a homework set) gets Jamol's one hint under the why */
          if (r.body.hint && !x.ok && window.JG_HW && run) { var res0 = box.querySelector('.jd-res'); if (res0) res0.insertAdjacentHTML('afterend', window.JG_HW.hintBtn(run, v.id)); }
          box.querySelector('[data-t=qnext]').focus();
        });
    }
    box.onclick = function (e) {
      var b = e.target.closest('[data-j]'), dk = !b && live && e.target.closest('[data-t=dunno]');
      if ((b || dk) && !(b && b.disabled) && cur && !after && !busy) pick(cur, b, false);
      var ts = e.target.closest('.jgli-send'), tx = ts && !ts.disabled && window.JG_LISTEN ? window.JG_LISTEN.text(ts.parentNode) : '';   // P15: a typed gap sent
      if (tx && cur && !after && !busy) pick(cur, null, false, tx);
      if (e.target.closest('[data-t=qnext]') && after) { var a = after; after = null; if (a.result) end(a.result); else ask(a.next); if (window.JG_LISTEN) window.JG_LISTEN.sync(); }
      if (e.target.closest('[data-t=retry]') && !busy) start();
      if (e.target.closest('[data-t=hard]') && !busy && run) hard();
      if (e.target.closest('[data-t=qdone]') && pending) pending();
      if (e.target.closest('[data-t=qeasier]') && goAgain && !busy) goAgain();
    };
    start();
  }

  function hold(on) { if (active) send(active, named(active, { op: 'hold', on: !!on })); }

  /* ---------- "Later" on a check's card (the teenagers' walk, 10 Oct 2026; the owner's delegated call) ----------
   * "A maths test with a clock appears in the middle of sign-up and I cannot skip it. I have ten minutes ... one attempt only. Continue is
   * grey." In Phase D (JG_BOOT.phaseD: a live student with PHASE_D on, where the check can come back as a daily task) the card of the
   * English and of the math check gets "Keyinroq / Позже / Later" under its start, with one line saying what happens. It is the design's
   * own skip (data-act="skip": the question is answered "skipped" and the first run goes on, M:023:629); the server then owes the check as
   * daily sets (src/server/cat/continuation.ts) and the roadmap's draft line says it is not taken yet. Not offered on a check left partway
   * (it is finished first), nor once it has a result, nor to the demo family, nor with PHASE_D off (nothing would bring the check back).
   * No design file is edited: the card is the design's, this adds to it when it is drawn. */
  function laterOn() { return !DEMO && !!BOOT.phaseD; }
  function later(root) {
    if (!laterOn() || !root || !root.querySelector) return;
    var b = root.querySelector('#dg-in button.dg-go[data-test]');
    if (!b || !b.parentNode || b.parentNode.querySelector('.jc-later') || b.parentNode.querySelector('.dg-result')) return;
    css();
    b.insertAdjacentHTML('afterend', '<button class="dg-link jc-later" type="button" data-act="skip" data-no-i18n>' + escH(cw('later')) + '</button><p class="jc-later-n" data-no-i18n>' + escH(cw('laterNote')) + '</p>');
  }
  if (typeof document !== 'undefined' && typeof MutationObserver === 'function' && laterOn()) {
    var watch = function () {
      var v = document.getElementById('dg-view'); if (!v || v._jcLater) return;
      v._jcLater = true; later(v);
      new MutationObserver(function () { later(v); }).observe(v, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
    window.addEventListener('load', watch);
  }

  window.JG_CHECKS = { mini: mini, reading: reading, quiz: quiz, hold: hold, set: set, line: line, capMinutes: CAP_MIN, words: CW, later: later,
    prompt: function (text, cls, attrs) { return promptHtml(text, cls, attrs); }, framed: framed,   // P7: the lessons pages draw their prompts and passages with these
    ins: function (q) { return insHtml(q); } };   // P14: and a question's instruction above it
})();
