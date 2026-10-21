/* Jamals Global runtime: Mock Saturday on a real student's Lessons tab, phone and laptop (P7f; SPEC-lessons §10.1 "Mock Saturday card",
 * §12.5 item 8, C-15; the owner's design, student-mobile.code.html:14368 and its design pass :15052, the Lessons card #ms-lcard after the
 * Live row). Loaded by src/server/pages.ts for a live, non-demo student, on the phone and on the laptop, only with the lessons part on
 * (LESSONS and the scheduler's switch). Not design code: no design file is edited. The design's own card stays cut for a real student
 * (JG_CUTS.lessonsMock, its invented "2,379 registered"); this draws hers beside it, in the design's own classes and markup:
 *  1. THE CARD (.dz-card.dz-mock, as the design pass draws #ms-lcard, its books picture cloned from it): his title "Mock Saturday" in every
 *     language (D1, C-15: his name, never translated), the language's short description under it, her date (or "open until") as the kicker,
 *     and one pill: see the plan, send your score, or her score. No "registered", no start time for everyone: nothing here is invented.
 *  2. THE LOBBY (the design's layer: .zq-view, .dg-top, .zq-goal.ms-lobby): her Saturday and its week, the days left, the description
 *     (the only place Bluebook is named, C-15), the timed sections with their minutes as the server gives them (College Board's structure,
 *     read 13 Oct 2026), and her last result. On the phone one line says Bluebook does not run on phones: a laptop or an iPad.
 *  3. THE SCORE (POST /api/v1/mock {rw, math}): the two section scores of her practice test, 200-800 in tens, only while her week is open;
 *     correctable inside it. THE RESULT CARD: the total, the two sections, the change since her last one. Never a percentile, a count of
 *     others or a leaderboard (the design's are its demo's).
 * The SAT is sat in Bluebook, which times each module itself: no clock runs here (a second clock would disagree with it). A mock that cannot
 * be sat (`ready: false`) draws nothing. Every word in en, uz (U+02BB) and ru, marked data-no-i18n; every number is the server's.
 *  4. THE STATE TEST (P8, GET/POST /api/v1/mock/dtm; src/server/lessons/dtm-mock.ts): sat here, laptop first (on the phone one line says
 *     it is long and a laptop is easier; the phone may sit it). The lobby lists the record's five blocks with their questions and points,
 *     says the record's minutes are not yet confirmed while they are flagged, and his programme's 2026 pass marks when the server has them.
 *     "Start" starts ONE clock on the server for the whole sitting (the design's .dg-timer in its .dg-top; its .dg-prog, one bar a block):
 *     the page counts down from the server's seconds left, so a closed tab finds the clock where the server has it. One question at a
 *     time in the design's .dg-q and .dg-opts (aria-checked), back and forth freely, a number grid; answers saved as she goes. "Finish"
 *     (or the clock's end) has the server grade it: the result card gives her points by block and the total out of 189, never a percentile.
 *     The options come under tokens: no key reaches the page.
 * window.JG_MOCK: words(lang), day(date, lang), range(a, b, lang), state(), refresh(). tests/unit/jg-mock.test.ts, jg-mock-dtm.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_MOCK) return;

  var RU_N = function (n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
  var MON = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  };
  var WD = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  };
  var sign = function (c) { return c > 0 ? '+' + c : c < 0 ? '−' + Math.abs(c) : '±0'; };
  var T = {
    en: { sub: 'A full timed mock', minutes: function (n) { return n + ' min'; }, openUntil: function (d) { return 'Open · until ' + d; },
      pillPlan: 'See the plan →', pillSend: 'Send your score →', pillDone: function (t) { return '✓ Your score · ' + t; },
      week: function (r) { return 'Open all week: ' + r; }, left: function (n) { return n <= 0 ? 'Today' : n === 1 ? 'Tomorrow' : 'In ' + n + ' days'; },
      sendBy: function (d) { return 'Send your score by ' + d; },
      laptop: 'Bluebook does not run on phones. Take the test on a laptop or an iPad, then send your score here.',
      secsH: function (q, m) { return 'Sections · ' + q + ' questions · ' + m + ' min'; }, secMin: function (m) { return m + ' min'; },
      yourScore: 'Your score', each: 'Each section 200–800, in tens.', err: 'Each section from 200 to 800, in tens.',
      send: 'Send your score', fix: 'Correct your score', busy: 'Sending…', failed: 'It did not go through. Check the internet and try again.',
      when: function (d) { return 'You can send your score from ' + d + '.'; }, last: function (d, t) { return 'Your last score: ' + d + ' · ' + t; },
      first: 'This will be your first Mock Saturday score.', change: function (d, t, c) { return 'Since your last one (' + d + ', ' + t + '): ' + sign(c); },
      firstRes: 'Your first Mock Saturday score', close: 'Close', self: 'self-reported',
      /* P16 [p17#3]: once she has sat the full test here */ bbH: 'Bluebook result (if you took one)', bbRes: 'Your Bluebook score',
      satDone: 'You sat the full test here: your result is below.', satAdd: 'If you also took a practice test in Bluebook, you can add its score at the end.' },
    uz: { sub: 'Vaqt bilan toʻliq mashq testi', minutes: function (n) { return n + ' daqiqa'; }, openUntil: function (d) { return 'Ochiq · ' + d + 'gacha'; },
      pillPlan: 'Rejani koʻrish →', pillSend: 'Natijani yuborish →', pillDone: function (t) { return '✓ Natijangiz · ' + t; },
      week: function (r) { return 'Hafta davomida ochiq: ' + r; }, left: function (n) { return n <= 0 ? 'Bugun' : n === 1 ? 'Ertaga' : n + ' kun qoldi'; },
      sendBy: function (d) { return 'Natijani ' + d + 'gacha yuboring'; },
      laptop: 'Bluebook telefonda ishlamaydi. Testni noutbuk yoki iPadda yeching, keyin natijani shu yerga yuboring.',
      secsH: function (q, m) { return 'Boʻlimlar · ' + q + ' savol · ' + m + ' daqiqa'; }, secMin: function (m) { return m + ' daq'; },
      yourScore: 'Natijangiz', each: 'Har boʻlim 200–800, 10 ga karrali.', err: 'Har boʻlim 200 dan 800 gacha, 10 ga karrali boʻlsin.',
      send: 'Natijani yuborish', fix: 'Natijani tuzatish', busy: 'Yuborilmoqda…', failed: 'Yuborilmadi. Internetni tekshirib, qayta urinib koʻring.',
      when: function (d) { return 'Natijani ' + d + 'dan yuborasiz.'; }, last: function (d, t) { return 'Oldingi natija: ' + d + ' · ' + t; },
      first: 'Bu birinchi Mock Saturday natijangiz boʻladi.', change: function (d, t, c) { return 'Oldingisidan (' + d + ', ' + t + '): ' + sign(c); },
      firstRes: 'Birinchi Mock Saturday natijangiz', close: 'Yopish', self: 'oʻzingiz kiritgan',
      bbH: 'Bluebook natijasi (agar yechgan boʻlsangiz)', bbRes: 'Bluebook natijangiz',
      satDone: 'Toʻliq testni shu yerda yechdingiz: natijangiz pastda.', satAdd: 'Bluebookda ham mashq testi yechgan boʻlsangiz, uning natijasini oxirida qoʻshishingiz mumkin.' },
    ru: { sub: 'Полный пробный тест на время', minutes: function (n) { return n + ' ' + RU_N(n, 'минута', 'минуты', 'минут'); }, openUntil: function (d) { return 'Открыт · до ' + d; },
      pillPlan: 'Посмотреть план →', pillSend: 'Отправить результат →', pillDone: function (t) { return '✓ Ваш результат · ' + t; },
      week: function (r) { return 'Открыт всю неделю: ' + r; }, left: function (n) { return n <= 0 ? 'Сегодня' : n === 1 ? 'Завтра' : 'Через ' + n + ' ' + RU_N(n, 'день', 'дня', 'дней'); },
      sendBy: function (d) { return 'Отправьте результат до ' + d; },
      laptop: 'Bluebook не работает на телефоне. Решайте тест на ноутбуке или iPad, потом отправьте результат сюда.',
      secsH: function (q, m) { return 'Разделы · ' + q + ' ' + RU_N(q, 'вопрос', 'вопроса', 'вопросов') + ' · ' + m + ' ' + RU_N(m, 'минута', 'минуты', 'минут'); }, secMin: function (m) { return m + ' мин'; },
      yourScore: 'Ваш результат', each: 'Каждый раздел 200–800, кратно 10.', err: 'Каждый раздел — от 200 до 800, кратно 10.',
      send: 'Отправить результат', fix: 'Исправить результат', busy: 'Отправляем…', failed: 'Не отправилось. Проверьте интернет и попробуйте ещё раз.',
      when: function (d) { return 'Результат можно отправить с ' + d + '.'; }, last: function (d, t) { return 'Прошлый результат: ' + d + ' · ' + t; },
      first: 'Это будет ваш первый результат Mock Saturday.', change: function (d, t, c) { return 'По сравнению с прошлым (' + d + ', ' + t + '): ' + sign(c); },
      firstRes: 'Ваш первый результат Mock Saturday', close: 'Закрыть', self: 'по вашим словам',
      bbH: 'Результат Bluebook (если решали)', bbRes: 'Ваш результат Bluebook',
      satDone: 'Вы решили полный тест здесь: результат ниже.', satAdd: 'Если вы решали и пробный тест в Bluebook, его результат можно добавить в конце.' }
  };
  /* P8: the state test's words (its own name: DTM, ДТМ on a Russian page, as the DTM practice sets say it, jg-checks.js) */
  var RU_PTS = function (n) { return n % 1 ? 'балла' : RU_N(n, 'балл', 'балла', 'баллов'); };
  var TD = {
    en: { kind: 'DTM', pillStart: 'Start the test →', pillResume: 'Continue the test →',
      blocksH: function (q, m) { return 'Blocks · ' + q + ' questions · ' + m + ' min'; }, blockLine: function (q, p) { return q + ' questions · ' + num(p, 'en') + ' points each'; },
      unverified: function (m) { return 'The ' + m + ' minutes come from an unofficial source; the official length is not confirmed yet.'; },
      phone: 'The test is long. It is easier on a laptop; on a phone it works too: check the battery and the internet first.',
      rules: function (m) { return 'One clock for the whole test: ' + m + ' minutes. Once you start it keeps running, even if you close the page.'; },
      start: 'Start the test', resume: 'Continue the test', busy: 'One moment…', left: function (t) { return 'Time left: ' + t; },
      when: function (d) { return 'You can start it from ' + d + '.'; }, satBefore: function (d, t) { return 'You sat this set on ' + d + (t == null ? '' : ' (' + t + ' points)') + '. A new set is not in the bank yet.'; },
      pass: function (p) { return 'Pass mark in 2026 for your programme (' + p.uni + ', «' + p.programme + '», ' + (p.lang === 'ru' ? 'Russian' : 'Uzbek') + ' group): ' + [p.grant != null ? 'grant ' + num(p.grant, 'en') : '', p.contract != null ? 'contract ' + num(p.contract, 'en') : ''].filter(Boolean).join(' · '); },
      block: function (b, name, k, q) { return 'Block ' + b + ' · ' + name + ' · ' + k + '/' + q; }, prev: '‹ Previous', next: 'Next ›', list: 'All questions',
      finish: 'Finish the test', sure: function (n) { return (n ? 'Not answered: ' + n + '. ' : '') + 'Finish now? After that the answers cannot be changed.'; }, yes: 'Yes, finish', no: 'Keep going',
      saveErr: 'Your last answer is not saved yet. Check the internet; it is sent again.', clock: 'Time left', out: 'Time is up. Your answers are being marked…',
      total: function (t, m) { return num(t, 'en') + ' / ' + m; }, pts: function (n) { return num(n, 'en') + ' points'; }, resH: 'Your points by block',
      right: function (r, q) { return r + '/' + q; }, done: 'Your result', failed: 'It did not go through. Check the internet and try again.' },
    uz: { kind: 'DTM', pillStart: 'Testni boshlash →', pillResume: 'Testni davom ettirish →',
      blocksH: function (q, m) { return 'Bloklar · ' + q + ' savol · ' + m + ' daqiqa'; }, blockLine: function (q, p) { return q + ' ta savol · har biri ' + num(p, 'uz') + ' ball'; },
      unverified: function (m) { return m + ' daqiqa norasmiy manbadan olingan; rasmiy vaqt hali tasdiqlanmagan.'; },
      phone: 'Test uzoq davom etadi. Noutbukda yechish qulayroq; telefonda ham boʻladi: avval zaryad va internetni tekshiring.',
      rules: function (m) { return 'Butun test uchun bitta vaqt: ' + m + ' daqiqa. Boshlaganingizdan keyin vaqt toʻxtamaydi, sahifani yopsangiz ham.'; },
      start: 'Testni boshlash', resume: 'Testni davom ettirish', busy: 'Biroz kuting…', left: function (t) { return 'Qolgan vaqt: ' + t; },
      when: function (d) { return 'Testni ' + d + 'dan boshlaysiz.'; }, satBefore: function (d, t) { return 'Bu toʻplamni ' + d + 'da yechgansiz' + (t == null ? '' : ' (' + num(t, 'uz') + ' ball)') + '. Yangi toʻplam hali bankda yoʻq.'; },
      pass: function (p) { return 'Yoʻnalishingizning 2026-yilgi oʻtish bali (' + p.uni + ', «' + p.programme + '», ' + (p.lang === 'ru' ? 'rus' : 'oʻzbek') + ' guruhi): ' + [p.grant != null ? 'grant ' + num(p.grant, 'uz') : '', p.contract != null ? 'kontrakt ' + num(p.contract, 'uz') : ''].filter(Boolean).join(' · '); },
      block: function (b, name, k, q) { return b + '-blok · ' + name + ' · ' + k + '/' + q; }, prev: '‹ Oldingi', next: 'Keyingi ›', list: 'Barcha savollar',
      finish: 'Testni yakunlash', sure: function (n) { return (n ? 'Javob berilmagan: ' + n + ' ta savol. ' : '') + 'Yakunlaysizmi? Keyin javoblarni oʻzgartirib boʻlmaydi.'; }, yes: 'Ha, yakunlash', no: 'Davom etish',
      saveErr: 'Oxirgi javobingiz hali saqlanmadi. Internetni tekshiring; u qayta yuboriladi.', clock: 'Qolgan vaqt', out: 'Vaqt tugadi. Javoblaringiz tekshirilmoqda…',
      total: function (t, m) { return num(t, 'uz') + ' / ' + m; }, pts: function (n) { return num(n, 'uz') + ' ball'; }, resH: 'Bloklar boʻyicha ballaringiz',
      right: function (r, q) { return r + '/' + q; }, done: 'Natijangiz', failed: 'Yuborilmadi. Internetni tekshirib, qayta urinib koʻring.' },
    ru: { kind: 'ДТМ', pillStart: 'Начать тест →', pillResume: 'Продолжить тест →',
      blocksH: function (q, m) { return 'Блоки · ' + q + ' ' + RU_N(q, 'вопрос', 'вопроса', 'вопросов') + ' · ' + m + ' ' + RU_N(m, 'минута', 'минуты', 'минут'); },
      blockLine: function (q, p) { return q + ' ' + RU_N(q, 'вопрос', 'вопроса', 'вопросов') + ' · по ' + num(p, 'ru') + ' ' + RU_PTS(p); },
      unverified: function (m) { return m + ' ' + RU_N(m, 'минута', 'минуты', 'минут') + ' — из неофициального источника; официальное время ещё не подтверждено.'; },
      phone: 'Тест длинный. На ноутбуке удобнее; на телефоне тоже можно: сначала проверьте заряд и интернет.',
      rules: function (m) { return 'Одно общее время на весь тест: ' + m + ' ' + RU_N(m, 'минута', 'минуты', 'минут') + '. После начала оно идёт, даже если закрыть страницу.'; },
      start: 'Начать тест', resume: 'Продолжить тест', busy: 'Минуту…', left: function (t) { return 'Осталось: ' + t; },
      when: function (d) { return 'Начать можно с ' + d + '.'; }, satBefore: function (d, t) { return 'Этот вариант вы решали ' + d + (t == null ? '' : ' (' + num(t, 'ru') + ' ' + RU_PTS(t) + ')') + '. Нового варианта в банке пока нет.'; },
      pass: function (p) { return 'Проходной балл вашего направления в 2026 году (' + p.uni + ', «' + p.programme + '», ' + (p.lang === 'ru' ? 'русская' : 'узбекская') + ' группа): ' + [p.grant != null ? 'грант ' + num(p.grant, 'ru') : '', p.contract != null ? 'контракт ' + num(p.contract, 'ru') : ''].filter(Boolean).join(' · '); },
      block: function (b, name, k, q) { return 'Блок ' + b + ' · ' + name + ' · ' + k + '/' + q; }, prev: '‹ Назад', next: 'Дальше ›', list: 'Все вопросы',
      finish: 'Завершить тест', sure: function (n) { return (n ? 'Без ответа: ' + n + ' ' + RU_N(n, 'вопрос', 'вопроса', 'вопросов') + '. ' : '') + 'Завершить? Потом ответы изменить нельзя.'; }, yes: 'Да, завершить', no: 'Продолжить',
      saveErr: 'Последний ответ ещё не сохранён. Проверьте интернет; он отправится ещё раз.', clock: 'Осталось', out: 'Время вышло. Ответы проверяются…',
      total: function (t, m) { return num(t, 'ru') + ' / ' + m; }, pts: function (n) { return num(n, 'ru') + ' ' + RU_PTS(n); }, resH: 'Ваши баллы по блокам',
      right: function (r, q) { return r + '/' + q; }, done: 'Ваш результат', failed: 'Не отправилось. Проверьте интернет и попробуйте ещё раз.' }
  };
  /* a number the language's way: 112.3 in English, 112,3 in Uzbek and Russian */
  function num(n, l) { var s = String(Math.round(n * 10) / 10); return l === 'en' ? s : s.replace('.', ','); }
  function dw(l) { return TD[l || lang()] || TD.en; }
  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function words(l) { return T[l || lang()] || T.en; }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* P14: a question's instruction just above it, in the diagnostic's hint line (JG_CHECKS.ins), when the server sends one (no C18 item has one today) */
  function ins(q) { var C = W.JG_CHECKS; return C && typeof C.ins === 'function' ? C.ins(q) : ''; }
  function parts(d) { return { y: +d.slice(0, 4), m: +d.slice(5, 7), d: +d.slice(8, 10) }; }
  /* a day in the page's words: "24 October", "24-oktabr", "24 октября" (with its weekday: "Saturday, 24 October") */
  function dayOnly(d, l) { var p = parts(d); return l === 'uz' ? p.d + '-' + MON.uz[p.m - 1] : p.d + ' ' + MON[l][p.m - 1]; }
  function day(d, l) { l = T[l] ? l : lang(); var p = parts(d), wd = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); return WD[l][wd] + ', ' + dayOnly(d, l); }
  /* a week: one month, "24–30 October", "24–30-oktabr", "24–30 октября"; two, each day in full */
  function range(a, b, l) {
    l = T[l] ? l : lang();
    var pa = parts(a), pb = parts(b);
    return pa.m === pb.m && pa.y === pb.y ? pa.d + '–' + dayOnly(b, l) : dayOnly(a, l) + ' – ' + dayOnly(b, l);
  }
  /* her local day: the engine's, else Tashkent's (the product's clock), else the device's */
  function today() {
    var E = W.JG_ENGINE, c = E && E.cache;
    if (c && typeof c.local_date === 'string') return c.local_date;
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function daysTo(d) { return Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse(today() + 'T00:00:00Z')) / 864e5); }
  function score(v) { var s = String(v == null ? '' : v).trim(), n = +s; return /^\d{3}$/.test(s) && n >= 200 && n <= 800 && n % 10 === 0 ? n : null; }
  function phone() { return !!$('tv-lessons'); }

  var st = { m: null, state: 'loading', lang: null, form: false, busy: false, err: '' };

  /* ---------- 1. the card ---------- */
  function cardHtml(m, l) {
    var x = words(l), kicker = m.open ? x.openUntil(dayOnly(m.until, l)) : day(m.date, l);
    /* P8c item 7 (the 17-year-old's walk, 14 Oct 2026: 800 + 800 saved 30 s after opening the card): the SAT score is her own entry, with no
     * proof, and says so wherever it shows (x.self: "self-reported", "oʻzingiz kiritgan", "по вашим словам"); the state test's is the server's grade */
    /* (the pill keeps the design's one line at 390: the total and the mark, "✓ 1340 · oʻzingiz kiritgan") */
    var pill = m.result ? (m.kind === 'dtm' ? x.pillDone(num(m.result.total, l)) : '✓ ' + m.result.total + ' · ' + x.self) : m.open ? x.pillSend : x.pillPlan;
    if (m.kind === 'dtm' && !m.result) pill = running(m) ? dw(l).pillResume : m.open && !(m.dtm && m.dtm.sat_before) ? dw(l).pillStart : x.pillPlan;   // P8: sat here
    /* P15: the full test sat here (jg-sat.js); P16 [p17#4]: her measured count stays, her own entry (if any) beside it, never instead of it */
    var own = '', sp = m.kind === 'sat' && W.JG_SAT && m.sat_full && m.sat_full.sitting ? W.JG_SAT.pill(m, l) : '';
    if (sp) { if (m.result) own = m.result.total + ' · ' + x.self; pill = sp; }
    var art = D.querySelector('#ms-lcard .dz-3d');
    return '<span class="dz-txt"><small class="dz-kicker">' + esc(kicker) + '</small><b>Mock Saturday</b><span class="dz-sub">' + esc(x.sub + ' · ' + (m.kind === 'sat' ? 'SAT' : dw(l).kind) + ' · ' + x.minutes(m.minutes)) + '</span>'
      + '<span class="dz-pill">' + esc(pill) + '</span>' + (own ? '<span class="dz-pill jgm-own">' + esc(own) + '</span>' : '') + '</span>' + (art ? art.outerHTML : '');
  }
  function anchor() {
    var ms = $('ms-lcard'); if (ms && ms.parentNode) return ms;
    var live = $('ls-live-row'); return live ? (live.closest && live.closest('section')) || live : null;
  }
  function paintCard() {
    var c = $('jgm-card'), m = st.m, a = anchor();
    if (!m || !a) { if (c) c.parentNode.removeChild(c); return; }
    css();
    if (!c) {
      c = D.createElement('button'); c.type = 'button'; c.id = 'jgm-card'; c.className = 'dz-card dz-mock'; c.setAttribute('data-no-i18n', '');
      c.addEventListener('click', openLobby);
    }
    if (a.nextSibling !== c) a.parentNode.insertBefore(c, a.nextSibling);
    c.innerHTML = cardHtml(m, st.lang);
    c.setAttribute('aria-label', 'Mock Saturday, ' + c.querySelector('.dz-kicker').textContent);
  }

  /* ---------- 2. the lobby, 3. the score and the result card ---------- */
  function view() {
    var el = $('jgm-view');
    if (!el) {
      el = D.createElement('div'); el.id = 'jgm-view'; el.className = 'zq-view jgm-view'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Mock Saturday'); el.setAttribute('data-no-i18n', ''); el.hidden = true;
      var host = ($('dg-view') && $('dg-view').parentElement) || D.body; host.appendChild(el);
      el.addEventListener('click', onView);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); send(); }
      });
      /* P8, on a laptop: 1-4 (or A-D) picks an option, the arrows move between questions (on the document: a repaint drops the focus) */
      D.addEventListener('keydown', function (e) {
        var v = $('jgm-view');
        if (!v || v.hidden || dt.mode !== 'sit' || !dt.s || dt.s.status !== 'running' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) return;
        var key = String(e.key), j = key.length === 1 ? ('1234'.indexOf(key) >= 0 ? '1234'.indexOf(key) : 'abcd'.indexOf(key.toLowerCase())) : -1, q = dt.s.items[dt.cur];
        if (j >= 0 && q && q.options[j]) { e.preventDefault(); pick(q.options[j].t); }
        else if (key === 'ArrowRight') { e.preventDefault(); go(dt.cur + 1); }
        else if (key === 'ArrowLeft') { e.preventDefault(); go(dt.cur - 1); }
      });
    }
    return el;
  }
  function lobbyHtml(m, l) {
    if (m.kind === 'dtm') return dtmLobbyHtml(m, l);
    /* P16 [p17#3]: once she has sat the full test here, nothing says she has no result yet: no "send it by", no "this will be your first",
     * no "then enter your score here"; the score form is her Bluebook result, if she took one */
    var x = words(l), h = '', d = daysTo(m.date), sat = !!(W.JG_SAT && m.sat_full && m.sat_full.sitting && m.sat_full.sitting.status === 'done');
    h += '<div class="zq-goal ms-lobby"><b>' + esc(day(m.date, l) + ' · ' + (m.kind === 'sat' ? 'SAT' : 'DTM')) + '</b><small>' + esc(x.week(range(m.date, m.until, l))) + '</small>'
      + (m.result || sat ? '' : '<p>' + esc(m.open ? x.sendBy(dayOnly(m.until, l)) : x.left(d)) + '</p>') + '</div>';
    if (m.result) {
      var r = m.result, lt = m.last;
      h += '<div class="zq-goal jgm-res" role="status"><b>' + esc(r.total) + '</b><small>' + esc('Reading and Writing ' + r.rw + ' · Math ' + r.math + ' · ' + x.self) + '</small>'   // P8c item 7
        + '<p>' + esc(lt && typeof r.change === 'number' ? x.change(dayOnly(lt.date, l), lt.total, r.change) : sat ? x.bbRes : x.firstRes) + '</p></div>';
    }
    h += '<p class="jgm-note">' + esc(sat ? x.satDone + (m.result ? '' : ' ' + x.satAdd) : m.description) + '</p>';
    if (m.laptop && phone() && !sat) h += '<p class="jgm-laptop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v9.5H4zM2 18.5h20"/></svg><span>' + esc(x.laptop) + '</span></p>';
    var n = 0;
    h += '<b class="jr-next-h jgm-secs-h">' + esc(x.secsH(m.questions, m.minutes)) + '</b><ol class="jgm-secs">' + m.sections.map(function (s) {
      return '<li' + (s.break ? ' class="jgm-brk"' : '') + '><span>' + (s.break ? '' : ++n) + '</span><b>' + esc(s.name) + '</b><em>' + esc(typeof s.minutes === 'number' ? x.secMin(s.minutes) : s.questions ? s.questions : '') + '</em></li>';
    }).join('') + '</ol>';
    if (m.kind !== 'sat') return h;
    if (m.sat_full && W.JG_SAT) h += W.JG_SAT.lobby(m, l);                     // P15: or sit the full test here (SAT_FULL, jg-sat.js)
    if (!m.open) return h + '<p class="jgm-when">' + esc(x.when(dayOnly(m.date, l))) + '</p>';
    if (m.result && !st.form) return h + '<button class="dg-link jgm-fix" type="button" data-jgm="fix">' + esc(x.fix) + '</button>';
    if (!m.result) h += m.last ? '<p class="jgm-last">' + esc(x.last(dayOnly(m.last.date, l), m.last.total + ' · ' + x.self)) + '</p>' : sat ? '' : '<p class="jgm-first">' + esc(x.first) + '</p>';
    var v = m.result || {};
    return h + '<b class="jr-next-h jgm-form-h">' + esc(sat ? x.bbH : x.yourScore) + '</b><div class="jgm-form">'
      + '<label class="jgm-f"><span>Reading and Writing</span><input class="dg-field" id="jgm-rw" type="number" inputmode="numeric" min="200" max="800" step="10" placeholder="200–800" value="' + esc(v.rw || '') + '"></label>'
      + '<label class="jgm-f"><span>Math</span><input class="dg-field" id="jgm-math" type="number" inputmode="numeric" min="200" max="800" step="10" placeholder="200–800" value="' + esc(v.math || '') + '"></label></div>'
      + '<p class="dg-hint jgm-each">' + esc(x.each) + '</p><p class="jgm-err" role="alert">' + esc(st.err) + '</p>'
      + '<button class="dg-go jgm-send" type="button" data-jgm="send"' + (st.busy ? ' disabled' : '') + '>' + esc(st.busy ? x.busy : x.send) + '</button>';
  }
  /* ---------- 4. the state test, sat here (P8) ---------- */
  var LAPTOP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v9.5H4zM2 18.5h20"/></svg>';
  function running(m) { return !!(m && m.dtm && m.dtm.sitting && m.dtm.sitting.status === 'running'); }
  function hms(s) { s = Math.max(0, Math.floor(s)); var h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return h + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; }
  /* the seconds left by the server's clock: the page counts down from the server's last word (never its own start) */
  function leftNow() { return st.endAt ? Math.max(0, Math.round((st.endAt - Date.now()) / 1000)) : 0; }
  function resultHtml(r, l) {
    var y = dw(l);
    return '<div class="zq-goal jgm-res" role="status"><small>' + esc(y.done) + '</small><b>' + esc(y.total(r.total, r.max)) + '</b></div>'
      + '<b class="jr-next-h jgm-secs-h">' + esc(y.resH) + '</b><ol class="jgm-secs jgm-rblocks">' + r.blocks.map(function (b, k) {
        return '<li><span>' + (k + 1) + '</span><b>' + esc(b.name) + '</b><em>' + esc(y.right(b.right, b.questions) + ' · ' + y.pts(b.points)) + '</em></li>';
      }).join('') + '</ol>';
  }
  function dtmLobbyHtml(m, l) {
    var x = words(l), y = dw(l), h = '', t = m.dtm || {}, run = running(m);
    h += '<div class="zq-goal ms-lobby"><b>' + esc(day(m.date, l) + ' · ' + y.kind) + '</b><small>' + esc(x.week(range(m.date, m.until, l))) + '</small>'
      + (m.result || run || m.open ? '' : '<p>' + esc(x.left(daysTo(m.date))) + '</p>') + '</div>';
    /* graded: her points by block and her programme's pass marks; the plan's own list would only repeat the blocks */
    if (m.result) return h + resultHtml(m.result, l) + (t.pass ? '<p class="jgm-pass">' + esc(y.pass(t.pass)) + '</p>' : '');
    h += '<p class="jgm-note">' + esc(m.description) + '</p>';
    if (phone()) h += '<p class="jgm-laptop">' + LAPTOP_SVG + '<span>' + esc(y.phone) + '</span></p>';
    h += '<b class="jr-next-h jgm-secs-h">' + esc(y.blocksH(m.questions, m.minutes)) + '</b><ol class="jgm-secs jgm-blocks">' + (t.blocks || []).map(function (b, k) {
      return '<li><span>' + (k + 1) + '</span><b>' + esc(b.name) + '</b><em>' + esc(y.blockLine(b.questions, b.points_each)) + '</em></li>';
    }).join('') + '</ol>';
    if (m.needs_verification) h += '<p class="jgm-unv">' + esc(y.unverified(m.minutes)) + '</p>';
    if (t.pass) h += '<p class="jgm-pass">' + esc(y.pass(t.pass)) + '</p>';
    if (run) return h + '<p class="jgm-when">' + esc(y.left(hms(st.endAt ? leftNow() : t.sitting.left_s))) + '</p><p class="jgm-err" role="alert">' + esc(st.err) + '</p>'
      + '<button class="dg-go jgm-start" type="button" data-jgm="resume"' + (st.busy ? ' disabled' : '') + '>' + esc(st.busy ? y.busy : y.resume) + '</button>';
    if (t.sat_before) return h + '<p class="jgm-when">' + esc(y.satBefore(dayOnly(t.sat_before.date, l), t.sat_before.total)) + '</p>';
    if (!m.open) return h + '<p class="jgm-when">' + esc(y.when(dayOnly(m.date, l))) + '</p>';
    return h + '<p class="jgm-first">' + esc(y.rules(m.minutes)) + '</p><p class="jgm-err" role="alert">' + esc(st.err) + '</p>'
      + '<button class="dg-go jgm-start" type="button" data-jgm="start"' + (st.busy ? ' disabled' : '') + '>' + esc(st.busy ? y.busy : y.start) + '</button>';
  }

  var dt = { s: null, mode: 'lobby', cur: 0, dirty: {}, saving: null, flushT: null, timer: null, confirm: false, err: '', finishing: null };
  function dtmApi(body) { return req(body ? 'POST' : 'GET', '/api/v1/mock/dtm?lang=' + encodeURIComponent(st.lang), body); }
  function took(s) { dt.s = s; if (s && s.status === 'running') { st.endAt = Date.now() + (s.left_s | 0) * 1000; if (st.m && st.m.dtm) st.m.dtm.sitting = { status: 'running', ends_at: s.ends_at, left_s: s.left_s }; } }
  function firstOpen() { var s = dt.s; for (var k = 0; k < s.items.length; k++) if (!s.answers[String(k)]) return k; return 0; }
  /* "Start" starts the one clock on the server; "Continue" reads the sitting where the server has it (the same questions, the clock run on) */
  function startSit(op) {
    var y = dw(st.lang); if (st.busy) return;
    st.busy = true; st.err = ''; paintLobby();
    dtmApi(op === 'start' ? { op: 'start' } : null).then(function (r) {
      st.busy = false;
      var s = r.status === 200 && r.body ? r.body.sitting : null;
      if (s && s.status === 'running' && Array.isArray(s.items)) { took(s); dt.mode = 'sit'; dt.cur = firstOpen(); dt.confirm = false; dt.err = ''; paintCard(); paintSitting(); tickOn(); top(); return; }
      if (s && s.status === 'done') { dt.s = s; return reloadAfter(); }
      st.err = y.failed; paintLobby();
    });
  }
  function top() { var b = D.querySelector('#jgm-view .zq-body'); if (b) b.scrollTop = 0; }
  function paintSitting() {
    var el = $('jgm-view'), s = dt.s; if (!el || el.hidden || !s || s.status !== 'running' || !s.items) return;
    var y = dw(st.lang), q = s.items[dt.cur], b = s.blocks[q.b], from = [], n0 = 0;
    s.blocks.forEach(function (bl) { from.push(n0); n0 += bl.questions; });
    var has = function (n) { return !!s.answers[String(n)]; };
    var prog = s.blocks.map(function (bl, bi) {
      var a = 0; for (var n = from[bi]; n < from[bi] + bl.questions; n++) if (has(n)) a++;
      return '<i style="flex:' + bl.questions + ' 1 0"><b style="width:' + Math.round((a / bl.questions) * 100) + '%"></b></i>';
    }).join('');
    var h = '<div class="dg-top jgm-stop"><button class="dg-back" type="button" data-jgm="lobby" aria-label="' + esc(words(st.lang).close) + '">‹</button><div class="dg-prog" aria-hidden="true">' + prog + '</div>'
      + '<span class="dg-timer jgm-clock" role="timer" aria-label="' + esc(y.clock) + '">' + hms(leftNow()) + '</span></div><div class="zq-body jgm-sit">';
    if (dt.err) h += '<p class="jgm-err" role="alert">' + esc(dt.err) + '</p>';
    h += '<b class="jr-next-h jgm-bh">' + esc(y.block(q.b + 1, b.name, dt.cur - from[q.b] + 1, b.questions)) + '</b>';
    if (q.passage) h += '<div class="jgm-psg">' + (q.passage.title ? '<b>' + esc(q.passage.title) + '</b>' : '') + '<p>' + esc(q.passage.text) + '</p></div>';
    h += ins(q) + '<p class="dg-q jgm-q">' + esc(q.prompt) + '</p><div class="dg-opts jgm-opts" role="radiogroup">' + q.options.map(function (o, j) {
      return '<button type="button" class="dg-opt" role="radio" aria-checked="' + (s.answers[String(q.n)] === o.t) + '" data-jgm="opt" data-tok="' + esc(o.t) + '"><b class="jgm-l">' + 'ABCD'.charAt(j) + '</b><span>' + esc(o.text) + '</span></button>';
    }).join('') + '</div>';
    h += '<div class="jgm-nav"><button class="dg-link" type="button" data-jgm="prev"' + (dt.cur ? '' : ' disabled') + '>' + esc(y.prev) + '</button>'
      + '<button class="dg-go" type="button" data-jgm="next"' + (dt.cur < s.items.length - 1 ? '' : ' disabled') + '>' + esc(y.next) + '</button></div>';
    h += '<b class="jr-next-h jgm-secs-h">' + esc(y.list) + '</b><div class="jgm-grid">' + s.blocks.map(function (bl, bi) {
      var g = '<div class="jgm-gb"><small>' + (bi + 1) + '</small><div>';
      for (var n = from[bi]; n < from[bi] + bl.questions; n++) g += '<button type="button" data-jgm="go" data-n="' + n + '" class="' + (has(n) ? 'on' : '') + (n === dt.cur ? ' cur' : '') + '"' + (n === dt.cur ? ' aria-current="true"' : '') + '>' + (n + 1) + '</button>';
      return g + '</div></div>';
    }).join('') + '</div>';
    var open = s.items.length - Object.keys(s.answers).length;
    h += dt.confirm ? '<div class="jgm-sure" role="alertdialog"><p>' + esc(y.sure(open)) + '</p><button class="dg-go" type="button" data-jgm="end">' + esc(y.yes) + '</button><button class="dg-link" type="button" data-jgm="stay">' + esc(y.no) + '</button></div>'
      : '<button class="dg-link jgm-finish" type="button" data-jgm="finish">' + esc(y.finish) + '</button>';
    el.innerHTML = h + '</div>';
  }
  function go(n) { var s = dt.s; if (!s || n < 0 || n >= s.items.length) return; dt.cur = n; dt.confirm = false; paintSitting(); top(); }
  function pick(t) {
    var s = dt.s; if (!s || s.status !== 'running' || dt.finishing || leftNow() <= 0) return;
    var k = String(s.items[dt.cur].n); s.answers[k] = t; dt.dirty[k] = t;
    paintSitting(); if (dt.flushT) clearTimeout(dt.flushT); dt.flushT = setTimeout(function () { dt.flushT = null; flush(); }, 300);
  }
  /* her picks go to the server as she goes; a pick not saved is kept and sent again (and said so); the server's answer resets the clock */
  function flush() {
    if (dt.saving) return dt.saving.then(function () { return Object.keys(dt.dirty).length ? flush() : null; });
    var send = dt.dirty; if (!Object.keys(send).length) return Promise.resolve();
    dt.dirty = {};
    dt.saving = dtmApi({ op: 'save', answers: send }).then(function (r) {
      dt.saving = null;
      if (r.status === 200 && r.body && r.body.sitting) { if (typeof r.body.sitting.left_s === 'number') st.endAt = Date.now() + r.body.sitting.left_s * 1000; if (dt.err) { dt.err = ''; paintSitting(); } return; }
      if (r.status === 409) { if (!dt.finishing) finishNow(); return; }         // the server's clock has ended (or it is graded): its result
      for (var k in send) if (!(k in dt.dirty)) dt.dirty[k] = send[k];
      dt.err = dw(st.lang).saveErr; paintSitting();
      setTimeout(function () { if (Object.keys(dt.dirty).length && !dt.saving) flush(); }, 3000);
    });
    return dt.saving;
  }
  function tickOn() { if (!dt.timer) dt.timer = setInterval(tick, 1000); }
  function tickOff() { if (dt.timer) { clearInterval(dt.timer); dt.timer = null; } }
  function tick() {
    var left = leftNow(), c = D.querySelector('#jgm-view .jgm-clock'); if (c) c.textContent = hms(left);
    if (left <= 0 && dt.s && dt.s.status === 'running' && !dt.finishing) {
      var el = $('jgm-view'), b = el && D.querySelector('#jgm-view .jgm-sit');
      if (b) b.innerHTML = '<p class="jgm-out" role="status">' + esc(dw(st.lang).out) + '</p>';
      finishNow();
    }
  }
  /* "Finish" (or the clock's end): the last picks saved, then the server grades the sitting; the card and the lobby show her result */
  function finishNow() {
    if (dt.finishing) return dt.finishing;
    tickOff();
    dt.finishing = (Object.keys(dt.dirty).length ? flush() : Promise.resolve()).then(function () { return dtmApi({ op: 'finish' }); }).then(function (r) {
      dt.finishing = null;
      var s = r.status === 200 && r.body ? r.body.sitting : null;
      if (s && s.status === 'done') { dt.s = s; dt.confirm = false; return reloadAfter(); }
      dt.err = dw(st.lang).failed; tickOn(); paintSitting();
    });
    return dt.finishing;
  }
  function reloadAfter() { dt.mode = 'lobby'; st.endAt = 0; return load().then(top); }

  function paintLobby() {
    var el = $('jgm-view'), m = st.m; if (!el || el.hidden) return;
    if (dt.mode === 'sit' && dt.s && dt.s.status === 'running') return paintSitting();
    if (!m) return close();
    el.innerHTML = '<div class="dg-top"><button class="dg-back" type="button" data-jgm="close" aria-label="' + esc(words(st.lang).close) + '">‹</button><p class="dg-tt">Mock Saturday</p><span class="dg-timer"></span></div>'
      + '<div class="zq-body">' + lobbyHtml(m, st.lang) + '</div>';
  }
  function openLobby() {
    if (!st.m) return;
    css();
    var el = view(); st.form = false; st.err = '';
    el.style.zIndex = String(W.JIA_z ? W.JIA_z() : 78); el.hidden = false;
    dt.mode = 'lobby';
    paintLobby();
    if (running(st.m)) startSit('resume');                                    // P8: a sitting running goes straight back to its questions
    else if (W.JG_SAT && st.m.sat_full && st.m.sat_full.sitting && st.m.sat_full.sitting.status === 'running') W.JG_SAT.open();   // P15: so does the full SAT test
    var b = el.querySelector('.dg-back'); if (b && b.focus) try { b.focus({ preventScroll: true }); } catch (e) {}
  }
  function close() { var el = $('jgm-view'); if (el) el.hidden = true; var c = $('jgm-card'); if (c && c.focus) try { c.focus({ preventScroll: true }); } catch (e) {} }
  function onView(e) {
    var b = e.target.closest ? e.target.closest('[data-jgm]') : null; if (!b) return;
    var k = b.getAttribute('data-jgm');
    if (k === 'close') close();
    else if (k === 'fix') { st.form = true; paintLobby(); var i = $('jgm-rw'); if (i && i.focus) try { i.focus(); } catch (er) {} }
    else if (k === 'send') send();
    else if (k === 'start' || k === 'resume') startSit(k);                   // P8: the state test
    else if (k === 'lobby') { dt.mode = 'lobby'; dt.confirm = false; paintLobby(); }   // the clock keeps running on the server
    else if (k === 'opt') pick(b.getAttribute('data-tok'));
    else if (k === 'prev') go(dt.cur - 1);
    else if (k === 'next') go(dt.cur + 1);
    else if (k === 'go') go(+b.getAttribute('data-n'));
    else if (k === 'finish') { dt.confirm = true; paintSitting(); var e2 = D.querySelector('#jgm-view .jgm-sure .dg-go'); if (e2 && e2.focus) try { e2.focus(); } catch (er) {} }
    else if (k === 'stay') { dt.confirm = false; paintSitting(); }
    else if (k === 'end') finishNow();
    else if (k.indexOf('sat-') === 0 && W.JG_SAT) W.JG_SAT.act(k, b);           // P15: the full SAT test (jg-sat.js)
  }
  function send() {
    var m = st.m, x = words(st.lang); if (!m || st.busy || !m.open) return;
    var rw = score(($('jgm-rw') || {}).value), math = score(($('jgm-math') || {}).value);
    var keep = { rw: ($('jgm-rw') || {}).value, math: ($('jgm-math') || {}).value };
    if (rw === null || math === null) { st.err = x.err; var e1 = D.querySelector('#jgm-view .jgm-err'); if (e1) e1.textContent = st.err; return; }
    st.busy = true; st.err = ''; paintLobby(); refill(keep);
    req('POST', '/api/v1/mock?lang=' + encodeURIComponent(st.lang), { rw: rw, math: math }).then(function (r) {
      st.busy = false;
      if (r.status === 200 && r.body && r.body.mock) { st.m = r.body.mock; st.form = false; paintCard(); paintLobby(); return; }
      st.err = r.status === 400 ? x.err : x.failed; paintLobby(); refill(keep);
    });
  }
  function refill(v) { var a = $('jgm-rw'), b = $('jgm-math'); if (a) a.value = v.rw || ''; if (b) b.value = v.math || ''; }

  function req(method, url, body) {
    return fetch(url, { method: method, headers: method === 'POST' ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }
  /* P16 [p17#6] (onboarding made her SAT-bound and no card came until a reload): which mock is hers follows her profile and her roadmap, so a
   * snapshot that changes either (or her day) asks again; any other snapshot (every answer's commit) asks nothing. Not while the lobby is open */
  function sig() { var c = W.JG_ENGINE && W.JG_ENGINE.cache; return c ? [c.profile_version, c.roadmap && c.roadmap.id, c.local_date].join('|') : ''; }
  function onSnapshot() { var v = $('jgm-view'); if (sig() === st.sig || (v && !v.hidden)) return; load(); }
  function load() {
    var l = lang(); st.lang = l; st.sig = sig();
    return req('GET', '/api/v1/mock?lang=' + encodeURIComponent(l)).then(function (r) {
      var m = r.status === 200 && r.body ? r.body.mock : null;
      /* a mock she can sit: the SAT's plan with its sections; the state test's in-app sitting is not built yet (ready: false): nothing drawn */
      st.m = m && m.ready === true && typeof m.date === 'string' && Array.isArray(m.sections) ? m : null;
      st.state = r.status === 200 ? 'ready' : 'failed';
      paintCard(); paintLobby();
    });
  }

  var cssDone = false;
  function css() {
    if (cssDone || $('jgm-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jgm-css';
    s.textContent = [
      '#jgm-card{width:calc(100% - 32px);margin:16px 16px 4px}',                                   /* the design's #ms-lcard rule */
      '#jgm-card .dz-kicker{overflow-wrap:anywhere}',
      '#jgm-card .jgm-own{margin-top:0}',                                                          /* P16 [p17#4]: her own entry, under the measured count */
      '.jgm-view .zq-body{max-width:640px;width:100%;margin:0 auto}',
      '.jgm-note{font-size:13.5px;font-weight:600;line-height:1.5;color:var(--ink)}',
      '.jgm-laptop{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:16px;background:#fff4ec;color:#6e2410;font-size:13.5px;font-weight:700;line-height:1.45}',
      '.jgm-laptop svg{flex:none;width:22px;height:22px;margin-top:1px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}',
      '.jgm-view .jr-next-h{color:var(--muted);opacity:1}',
      '.jgm-secs{display:grid;gap:6px;margin:0;padding:0;list-style:none}',
      '.jgm-secs li{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:#fff;box-shadow:0 1px 6px rgba(16,39,30,.05);font-size:14px}',
      '.jgm-secs span{flex:none;width:22px;font-weight:800;color:var(--muted)}.jgm-secs b{flex:1;min-width:0;font-weight:700;overflow-wrap:anywhere}',
      '.jgm-secs em{flex:none;font-style:normal;font-weight:800;color:var(--jade-700)}',
      '.jgm-secs li.jgm-brk{background:transparent;box-shadow:inset 0 0 0 1.5px #e0eae5}.jgm-secs li.jgm-brk b,.jgm-secs li.jgm-brk em{color:var(--muted)}',
      '.jgm-last,.jgm-first,.jgm-when{font-size:13px;font-weight:700;line-height:1.45;color:var(--muted)}',
      '.jgm-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.jgm-f{display:grid;gap:6px;min-width:0}.jgm-f span{font-size:12.5px;font-weight:800;color:var(--ink2,var(--ink))}',
      '.jgm-each{margin-top:0}.jgm-err{min-height:0;font-size:13px;font-weight:700;color:#a63d36}.jgm-err:empty{display:none}',
      '.jgm-view .dg-go{width:100%}.jgm-view .dg-link{justify-self:center}',
      '.zq-goal.jgm-res b{font-size:34px;line-height:1.1;font-variant-numeric:tabular-nums}',
      '@media (max-width:360px){.jgm-form{grid-template-columns:1fr}}',
      /* P8: the state test's lobby and sitting, in the design's test layer (.dg-top, .dg-prog, .dg-timer, .dg-q, .dg-opts) */
      '.jgm-blocks em,.jgm-rblocks em{font-size:12.5px;text-align:right;white-space:normal;max-width:52%}',
      '.jgm-unv{font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '.jgm-pass{padding:12px 14px;border-radius:14px;background:#fff;box-shadow:0 1px 6px rgba(16,39,30,.05);font-size:13.5px;font-weight:700;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.zq-goal.jgm-res small{font-size:12.5px;opacity:.85}',
      '.jgm-stop .dg-prog{min-width:0}.jgm-stop .dg-prog i{display:block;min-width:0}',
      '.jgm-clock{width:auto;min-width:74px;flex:none;text-align:right;font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--jade-700)}',
      '.jgm-sit .dg-q{margin:2px 0 4px;white-space:pre-line;overflow-wrap:anywhere}',
      '.jgm-opts .dg-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left}',
      '.jgm-opts .dg-opt span{min-width:0;overflow-wrap:anywhere;white-space:pre-line}',
      '.jgm-l{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#eef4f1;color:var(--jade-800,var(--ink));font-size:13px;font-weight:800}',
      '.jgm-opts .dg-opt[aria-checked="true"] .jgm-l{background:var(--jade-500);color:#fff}',
      '.jgm-psg{display:grid;gap:6px;padding:12px 14px;border-radius:14px;background:#fff;font-size:14.5px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere}',
      '.jgm-nav{display:flex;align-items:center;justify-content:space-between;gap:10px}.jgm-nav .dg-go{flex:0 1 220px}.jgm-nav .dg-link:disabled{opacity:.35;cursor:default}',
      '.jgm-grid{display:grid;gap:8px}.jgm-gb{display:flex;align-items:flex-start;gap:8px}',
      '.jgm-gb small{flex:none;width:14px;padding-top:7px;font-size:12px;font-weight:800;color:var(--muted)}',
      '.jgm-gb div{flex:1;min-width:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px}',
      '.jgm-gb button{height:30px;min-width:0;padding:0;border:0;border-radius:8px;background:#fff;box-shadow:inset 0 0 0 1.5px #dbe6e0;color:var(--ink);font:700 12px var(--font);cursor:pointer}',
      '.jgm-gb button.on{background:var(--accent-soft,#e3f6ec);box-shadow:inset 0 0 0 1.5px var(--jade-500)}',
      '.jgm-gb button.cur{box-shadow:inset 0 0 0 2.5px var(--jade-700)}',
      '.jgm-finish{justify-self:center}.jgm-start{width:100%}',
      '.jgm-sure{display:grid;gap:8px;padding:14px;border-radius:16px;background:#fff4ec;color:#6e2410;font-size:14px;font-weight:700;line-height:1.45}',
      '.jgm-out{font-size:15px;font-weight:800;color:var(--ink)}'
    ].join('\n');
    D.head.appendChild(s);
  }

  /* the card is kept where the design draws its own when the tab is drawn again (the design's own paint, the lessons rows) */
  function watch() {
    var page = $('tv-lessons') || $('v-lessons'); if (!page || page._jgm) return; page._jgm = true;
    new MutationObserver(function () { if (!st.m) return; var c = $('jgm-card'), a = anchor(); if (!c || (a && a.nextSibling !== c)) paintCard(); }).observe(page, { childList: true, subtree: true });
  }
  function start() { watch(); load(); D.addEventListener('jg:snapshot', function () { setTimeout(onSnapshot, 0); }); }
  W.JG_MOCK = { words: words, day: day, range: range, refresh: load, repaint: function () { paintLobby(); },
    state: function () { return { state: st.state, mock: st.m ? { kind: st.m.kind, date: st.m.date, open: st.m.open } : null, dtm: { mode: dt.mode, cur: dt.cur, left: leftNow(), status: dt.s ? dt.s.status : null } }; } };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
