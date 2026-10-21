/* Jamals Global runtime: the SAT practice test sat in the app, inside Mock Saturday (P15; owner 18 Oct 2026, item 4 "add"; C-17). Loaded by
 * src/server/pages.ts for a live, non-demo student on the phone and the laptop, only with SAT_FULL on (inside the lessons part). Not design
 * code: no design file is edited. It draws in the design's own test layer (.zq-view, .dg-top, .dg-timer, .dg-q, .dg-opts, .dg-go, .dg-link,
 * .zq-goal), as the state test's sitting does (public/runtime/jg-mock.js), and public/runtime/jg-mock.js hands it its place:
 *  1. THE LOBBY BLOCK (JG_SAT.lobby, in Mock Saturday's SAT lobby after the four modules): "Or sit it here": the length, the rule that each
 *     module's clock runs on the server even with the page closed, and Start / Continue / See your result.
 *  2. THE TEST (#jgs-view): one module at a time, as the real test: a question navigator (answered, marked for review, the one on screen),
 *     mark for review, cross out an option, back and forth inside the module, a timer that can be hidden and warns at 5 minutes, the module
 *     ended at 0 by the server. No way back to a module once it has ended. Math: the reference sheet (our own list of the standard formulas),
 *     a typed answer read as an integer, a decimal or a fraction, and one line that her own calculator is allowed. The 10-minute break between
 *     the sections, skippable. Every clock is the server's: the page counts down from the server's seconds left, so a closed tab finds it there.
 *  3. THE RESULT: right answers per section, module and domain, the time each module took, which module 2 she had and what that means in plain
 *     words, and the review of every question with its why in her language. Never a 200-800 score, a 400-1600 total or a percentile (C-17).
 * The questions are in English (the SAT is); every other word in en, uz (U+02BB, U+02BC) and ru, marked data-no-i18n. Options come under
 * tokens: no key reaches the page while she sits it. window.JG_SAT: lobby(m, l), pill(m, l), act(k, el), open(), words(l), state().
 * tests/unit/jg-sat.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_SAT) return;

  var RU_N = function (n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
  var SEC = { rw: 'Reading and Writing', math: 'Math' };
  var T = {
    en: {
      head: 'Or sit it here: the full test in the app', len: function (m, q) { return '2 h 14 min of testing and a 10-minute break · ' + q + ' questions · Reading and Writing, then Math'; },
      rules: 'Each module has its own clock, kept on our server: once you start, it runs even if you close the page, as in the real test. A finished module cannot be opened again.',
      honest: 'You get your right answers by module and by topic, not an SAT score: we do not turn them into 200–800 until our questions are calibrated.',
      easier: 'This practice form is easier than the real SAT: do not compare its count with a Bluebook result.',
      start: 'Start the full test', resume: 'Continue the test', see: 'See your result', busy: 'One moment…', failed: 'It did not go through. Check the internet and try again.',
      when: function (d) { return 'You can start it from ' + d + '.'; }, before: function (d) { return 'You sat this test on ' + d + '. A new form is not in the bank yet.'; },
      pillRun: 'Continue the test →', pillDone: function (r, o) { return '✓ ' + r + '/' + o + ' right'; },
      mod: function (s, k) { return SEC[s] + ' · Module ' + k; }, q: function (n, of) { return 'Question ' + n + ' of ' + of; },
      mark: 'Mark for review', marked: 'Marked for review', cross: 'Cross out', uncross: 'Undo',
      prev: '‹ Back', next: 'Next ›', nav: 'Questions', toEnd: 'Review and end the module', hide: 'Hide', show: 'Show time',
      five: '5 minutes left in this module.', typeH: 'Your answer', typeHint: 'A whole number, a decimal (0.75) or a fraction (3/4); a minus for a negative. At most 5 characters (6 with the minus): a fraction that does not fit goes in as a decimal, and a long decimal is cut off or rounded to fill all 5 (7/9: 0.777 or 0.778, not 0.78).',
      typeSeen: function (v) { return 'Read as: ' + v; }, typeBad: 'This cannot be read as a number.', calc: 'A calculator is allowed: your own, as in the real test.',
      ref: 'Reference sheet', refClose: 'Close the reference sheet', end: 'End this module', sure: function (n) { return (n ? 'Not answered: ' + n + '. ' : '') + 'End the module now? You cannot come back to it.'; },
      yes: 'Yes, end it', no: 'Keep working', legend: ['Answered', 'Marked', 'Not answered'],
      saveErr: 'Your last answer is not saved yet. Check the internet; it is sent again.', wait: 'One moment: your next module is being prepared…',
      out: 'Time is up for this module. On to the next…', brkH: 'Break', brk: 'Stand up, drink some water. Math starts by itself when the break ends.', brkGo: 'Resume testing now',
      close: 'Close', done: 'Your result', total: function (r, o) { return r + ' of ' + o + ' right'; }, secH: 'By section', modH: 'By module', domH: 'By topic',
      took: function (s) { return Math.round(s / 60) + ' min'; }, mod2: { m2e: 'easier module 2', m2h: 'harder module 2' }, revH: 'Every question, with why',
      yours: 'Your answer', right: 'Right answer', blank: 'No answer', ok: 'Right', miss: 'Not right', coins: function (c) { return '+' + c + ' coins for right answers'; },
      noCoins: 'Coins come for a module with two-thirds right or more.', minutes: function (m) { return m + ' min'; } },
    uz: {
      head: 'Yoki shu yerda yeching: ilovadagi toʻliq test', len: function (m, q) { return '2 soat 14 daqiqa test va 10 daqiqa tanaffus · ' + q + ' ta savol · avval Reading and Writing, keyin Math'; },
      rules: 'Har bir modulning oʻz vaqti bor va u bizning serverda yuradi: boshlaganingizdan keyin sahifani yopsangiz ham toʻxtamaydi, haqiqiy testdagidek. Tugagan modulga qaytib boʻlmaydi.',
      honest: 'Natijada modul va mavzular boʻyicha toʻgʻri javoblaringiz soni chiqadi, SAT bali emas: savollarimiz kalibrlanmaguncha ularni 200–800 balga aylantirmaymiz.',
      easier: 'Bu mashq varianti haqiqiy SAT testidan osonroq: uning natijasini Bluebook natijasi bilan solishtirmang.',
      start: 'Toʻliq testni boshlash', resume: 'Testni davom ettirish', see: 'Natijani koʻrish', busy: 'Biroz kuting…', failed: 'Yuborilmadi. Internetni tekshirib, qayta urinib koʻring.',
      when: function (d) { return 'Testni ' + d + 'dan boshlaysiz.'; }, before: function (d) { return 'Bu testni ' + d + 'da yechgansiz. Yangi variant hali bankda yoʻq.'; },
      pillRun: 'Testni davom ettirish →', pillDone: function (r, o) { return '✓ ' + o + ' tadan ' + r + ' tasi toʻgʻri'; },
      mod: function (s, k) { return SEC[s] + ' · ' + k + '-modul'; }, q: function (n, of) { return of + ' tadan ' + n + '-savol'; },
      mark: 'Koʻrib chiqish uchun belgilash', marked: 'Belgilangan', cross: 'Chizib qoʻyish', uncross: 'Qaytarish',
      prev: '‹ Orqaga', next: 'Keyingi ›', nav: 'Savollar', toEnd: 'Koʻrib chiqish va modulni yakunlash', hide: 'Yashirish', show: 'Vaqtni koʻrsatish',
      five: 'Bu modulda 5 daqiqa qoldi.', typeH: 'Javobingiz', typeHint: 'Butun son, oʻnli kasr (0,75) yoki oddiy kasr (3/4); manfiy son uchun minus. Koʻpi bilan 5 ta belgi (minus bilan 6 ta): sigʻmaydigan oddiy kasr oʻnli kasr qilib yoziladi, uzun oʻnli kasr esa 5 ta belgiga kesiladi yoki yaxlitlanadi (7/9: 0,777 yoki 0,778, lekin 0,78 emas). Haqiqiy SATda oʻnli kasr nuqta bilan yoziladi.',
      typeSeen: function (v) { return 'Shunday oʻqildi: ' + v; }, typeBad: 'Buni son sifatida oʻqib boʻlmaydi.', calc: 'Kalkulyatordan foydalanish mumkin: oʻzingiznikidan, haqiqiy testdagidek.',
      ref: 'Formulalar varagʻi', refClose: 'Formulalar varagʻini yopish', end: 'Modulni yakunlash', sure: function (n) { return (n ? 'Javob berilmagan: ' + n + ' ta. ' : '') + 'Modulni hozir yakunlaysizmi? Unga qaytib boʻlmaydi.'; },
      yes: 'Ha, yakunlash', no: 'Davom etish', legend: ['Javob berilgan', 'Belgilangan', 'Javob berilmagan'],
      saveErr: 'Oxirgi javobingiz hali saqlanmadi. Internetni tekshiring; u qayta yuboriladi.', wait: 'Biroz kuting: keyingi modulingiz tayyorlanmoqda…',
      out: 'Bu modul vaqti tugadi. Keyingisiga oʻtamiz…', brkH: 'Tanaffus', brk: 'Turing, suv iching. Tanaffus tugagach, Math oʻzi boshlanadi.', brkGo: 'Testni hozir davom ettirish',
      close: 'Yopish', done: 'Natijangiz', total: function (r, o) { return o + ' tadan ' + r + ' tasi toʻgʻri'; }, secH: 'Boʻlimlar boʻyicha', modH: 'Modullar boʻyicha', domH: 'Mavzular boʻyicha',
      took: function (s) { return Math.round(s / 60) + ' daqiqa'; }, mod2: { m2e: 'osonroq 2-modul', m2h: 'qiyinroq 2-modul' }, revH: 'Har bir savol va izohi',
      yours: 'Sizning javobingiz', right: 'Toʻgʻri javob', blank: 'Javob yoʻq', ok: 'Toʻgʻri', miss: 'Notoʻgʻri', coins: function (c) { return 'Toʻgʻri javoblar uchun +' + c + ' tanga'; },
      noCoins: 'Tanga uchdan ikki qismi yoki undan koʻprogʻi toʻgʻri boʻlgan modul uchun beriladi.', minutes: function (m) { return m + ' daqiqa'; } },
    ru: {
      head: 'Или решите здесь: полный тест в приложении', len: function (m, q) { return '2 ч 14 мин теста и 10 минут перерыва · ' + q + ' ' + RU_N(q, 'вопрос', 'вопроса', 'вопросов') + ' · сначала Reading and Writing, потом Math'; },
      rules: 'У каждого модуля своё время, и оно идёт на нашем сервере: после начала оно не останавливается, даже если закрыть страницу, как на настоящем тесте. К законченному модулю вернуться нельзя.',
      honest: 'В результате — число верных ответов по модулям и темам, а не балл SAT: мы не переводим их в 200–800, пока наши вопросы не откалиброваны.',
      easier: 'Этот тренировочный вариант легче настоящего SAT: не сравнивайте его результат с результатом в Bluebook.',
      start: 'Начать полный тест', resume: 'Продолжить тест', see: 'Посмотреть результат', busy: 'Минуту…', failed: 'Не отправилось. Проверьте интернет и попробуйте ещё раз.',
      when: function (d) { return 'Начать можно с ' + d + '.'; }, before: function (d) { return 'Вы решали этот тест ' + d + '. Нового варианта в банке пока нет.'; },
      pillRun: 'Продолжить тест →', pillDone: function (r, o) { return '✓ Верно ' + r + ' из ' + o; },
      mod: function (s, k) { return SEC[s] + ' · модуль ' + k; }, q: function (n, of) { return 'Вопрос ' + n + ' из ' + of; },
      mark: 'Отметить для проверки', marked: 'Отмечено', cross: 'Зачеркнуть', uncross: 'Вернуть',
      prev: '‹ Назад', next: 'Дальше ›', nav: 'Вопросы', toEnd: 'Проверить и завершить модуль', hide: 'Скрыть', show: 'Показать время',
      five: 'В этом модуле осталось 5 минут.', typeH: 'Ваш ответ', typeHint: 'Целое число, десятичная дробь (0,75) или обычная дробь (3/4); для отрицательного — минус. Не больше 5 символов (с минусом — 6): дробь, которая не помещается, пишут десятичной, а длинную десятичную обрезают или округляют на все 5 символов (7/9: 0,777 или 0,778, но не 0,78). На настоящем SAT десятичную дробь пишут через точку.',
      typeSeen: function (v) { return 'Прочитано как: ' + v; }, typeBad: 'Это нельзя прочитать как число.', calc: 'Калькулятор разрешён: свой, как на настоящем тесте.',
      ref: 'Справочные формулы', refClose: 'Закрыть справочные формулы', end: 'Завершить модуль', sure: function (n) { return (n ? 'Без ответа: ' + n + '. ' : '') + 'Завершить модуль сейчас? Вернуться к нему нельзя.'; },
      yes: 'Да, завершить', no: 'Продолжить', legend: ['Есть ответ', 'Отмечено', 'Без ответа'],
      saveErr: 'Последний ответ ещё не сохранён. Проверьте интернет; он отправится ещё раз.', wait: 'Минуту: готовим следующий модуль…',
      out: 'Время модуля вышло. Переходим к следующему…', brkH: 'Перерыв', brk: 'Встаньте, выпейте воды. Math начнётся сам, когда перерыв закончится.', brkGo: 'Продолжить тест сейчас',
      close: 'Закрыть', done: 'Ваш результат', total: function (r, o) { return 'Верно ' + r + ' из ' + o; }, secH: 'По разделам', modH: 'По модулям', domH: 'По темам',
      took: function (s) { return Math.round(s / 60) + ' мин'; }, mod2: { m2e: 'более лёгкий 2-й модуль', m2h: 'более сложный 2-й модуль' }, revH: 'Каждый вопрос с объяснением',
      yours: 'Ваш ответ', right: 'Верный ответ', blank: 'Нет ответа', ok: 'Верно', miss: 'Неверно', coins: function (c) { return '+' + c + ' монет за верные ответы'; },
      noCoins: 'Монеты даются за модуль, где верно не меньше двух третей.', minutes: function (m) { return m + ' мин'; } }
  };
  /* the reference sheet: our own list of the standard formulas (plain facts), drawn here; its labels in the page's language */
  var REF = {
    en: ['Circle', 'Rectangle', 'Triangle', 'Right triangle', 'Special right triangles', 'Box', 'Cylinder', 'Sphere', 'Cone', 'Pyramid', 'A circle has 360°, or 2π radians. The angles of a triangle add up to 180°.'],
    uz: ['Aylana', 'Toʻgʻri toʻrtburchak', 'Uchburchak', 'Toʻgʻri burchakli uchburchak', 'Maxsus toʻgʻri burchakli uchburchaklar', 'Toʻgʻri burchakli parallelepiped', 'Silindr', 'Shar', 'Konus', 'Piramida', 'Aylana 360° yoki 2π radian. Uchburchak burchaklarining yigʻindisi 180°.'],
    ru: ['Окружность', 'Прямоугольник', 'Треугольник', 'Прямоугольный треугольник', 'Особые прямоугольные треугольники', 'Прямоугольный параллелепипед', 'Цилиндр', 'Шар', 'Конус', 'Пирамида', 'В окружности 360°, или 2π радиан. Сумма углов треугольника — 180°.']
  };
  var FORMULAS = ['A = πr² · C = 2πr', 'A = ℓw', 'A = ½bh', 'c² = a² + b²', '30°-60°-90°: x, x√3, 2x · 45°-45°-90°: s, s, s√2', 'V = ℓwh', 'V = πr²h', 'V = 4⁄3 πr³', 'V = 1⁄3 πr²h', 'V = 1⁄3 ℓwh'];

  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function words(l) { return T[l || lang()] || T.en; }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hms(s) { s = Math.max(0, Math.floor(s)); var h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ':' + (mm < 10 ? '0' : '') : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; }
  /* a typed answer as the server reads it (src/engine/lessons/sat-full.ts parseSpr): an integer, a decimal, a fraction; else null */
  function spr(raw) {
    var s = String(raw == null ? '' : raw).trim().replace(',', '.');
    if (!s || s.length > 12 || !/^-?(\d+(\.\d+)?|\.\d+|\d+\/\d+)$/.test(s)) return null;
    var neg = s.charAt(0) === '-', b = neg ? s.slice(1) : s, v;
    if (b.indexOf('/') >= 0) { var p = b.split('/'); if (!+p[1]) return null; v = +p[0] / +p[1]; } else v = +b;
    return isFinite(v) ? (neg ? -v : v) : null;
  }
  function num(v, l) { var s = String(Math.round(v * 10000) / 10000); return l === 'en' ? s : s.replace('.', ','); }

  var st = { s: null, l: 'en', cur: 0, dirty: {}, marks: null, saving: null, flushT: null, timer: null, endAt: 0, err: '', confirm: false, nav: false, ref: false,
    hidden: false, warned: false, out: {}, busy: false, ending: false, poll: null, rev: null };

  /* ---------- 1. the lobby block (in jg-mock.js's SAT lobby) ---------- */
  function lobby(m, l) {
    var x = words(l), f = m.sat_full; if (!f) return '';
    var s = f.sitting, h = '<b class="jr-next-h jgm-secs-h">' + esc(x.head) + '</b><div class="zq-goal jgs-lobby"><small>' + esc(x.len(f.minutes, f.questions)) + '</small><p>' + esc(x.rules) + '</p><p>' + esc(x.honest) + '</p><p class="jgs-easier">' + esc(x.easier) + '</p></div>';   // P16 final (the audit: an 1180 student read 85/98): the form is easier than the real test
    if (s && s.status === 'running') return h + '<button class="dg-go jgm-start" type="button" data-jgm="sat-open">' + esc(x.resume) + '</button>';
    if (s && s.status === 'done') return h + '<div class="zq-goal jgm-res" role="status"><small>' + esc(x.done) + '</small><b>' + esc(x.total(s.right, s.of)) + '</b></div><button class="dg-go jgm-start" type="button" data-jgm="sat-open">' + esc(x.see) + '</button>';
    if (f.sat_before) return h + '<p class="jgm-when">' + esc(x.before(W.JG_MOCK ? W.JG_MOCK.day(f.sat_before.date, l) : f.sat_before.date)) + '</p>';
    if (!m.open) return h + '<p class="jgm-when">' + esc(x.when(W.JG_MOCK ? W.JG_MOCK.day(m.date, l) : m.date)) + '</p>';
    return h + '<p class="jgm-err" role="alert">' + esc(st.err) + '</p><button class="dg-go jgm-start" type="button" data-jgm="sat-start"' + (st.busy ? ' disabled' : '') + '>' + esc(st.busy ? x.busy : x.start) + '</button>';
  }
  function pill(m, l) { var s = m && m.sat_full && m.sat_full.sitting, x = words(l); return !s ? '' : s.status === 'running' ? x.pillRun : x.pillDone(s.right, s.of); }
  function act(k) { if (k === 'sat-start') start(); else if (k === 'sat-open') open(); }

  function req(method, body) {
    return fetch('/api/v1/mock/sat?lang=' + encodeURIComponent(st.l), { method: method, headers: method === 'POST' ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }
  function start() {
    if (st.busy) return; st.l = lang(); st.busy = true; st.err = ''; repaintLobby();
    req('POST', { op: 'start' }).then(function (r) {
      st.busy = false;
      if (r.status === 200 && r.body.sitting) { show(); took(r.body.sitting); return; }
      st.err = words(st.l).failed; repaintLobby();
    });
  }
  function repaintLobby() { if (W.JG_MOCK && W.JG_MOCK.repaint) W.JG_MOCK.repaint(); }
  function open() { st.l = lang(); show(); paint(); req('GET').then(function (r) { if (r.status === 200 && r.body.sitting) took(r.body.sitting); else { st.err = words(st.l).failed; paint(); } }); }

  /* ---------- 2. the test ---------- */
  function view() {
    var el = $('jgs-view');
    if (!el) {
      el = D.createElement('div'); el.id = 'jgs-view'; el.className = 'zq-view jgm-view jgs-view'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'SAT'); el.setAttribute('data-no-i18n', ''); el.hidden = true;
      var host = ($('dg-view') && $('dg-view').parentElement) || D.body; host.appendChild(el);
      el.addEventListener('click', onClick); el.addEventListener('input', onInput);
      D.addEventListener('keydown', onKey);
    }
    return el;
  }
  function show() { css(); var el = view(), mv = $('jgm-view'); el.style.zIndex = String((W.JIA_z ? W.JIA_z() : 79) + 1); el.hidden = false; if (mv) mv.hidden = true; }
  function hide() { var el = $('jgs-view'); if (el) el.hidden = true; tickOff(); if (W.JG_MOCK && W.JG_MOCK.refresh) W.JG_MOCK.refresh(); }
  function took(s) {
    var prev = st.s && st.s.module && st.s.module.stage, now = s.module && s.module.stage;
    st.s = s; st.endAt = Date.now() + (s.left_s | 0) * 1000;
    if (now && now !== prev) { st.cur = wasOn(s); keepOn(); st.marks = (s.module.marks || []).slice(); st.confirm = false; st.nav = false; st.warned = (s.left_s | 0) <= 300; st.out = {}; st.dirty = {}; }
    if (st.poll) { clearTimeout(st.poll); st.poll = null; }
    if (s.status === 'running' && s.stage !== 'break' && !s.module) st.poll = setTimeout(reload, 3000);   // module 2 is being decided (the server's grace)
    if (s.status === 'running') tickOn(); else tickOff();
    paint(); top();
  }
  function reload() { return req('GET').then(function (r) { if (r.status === 200 && r.body.sitting) took(r.body.sitting); }); }
  function firstOpen() { var m = st.s.module; for (var k = 0; k < m.items.length; k++) if (!m.answers[String(k)]) return k; return 0; }
  /* P16 [p17#9] (a reload reopened a running module on its first unanswered question, not the one she was on): the question she was on, per
   * module of this sitting, kept on this device (one entry per student); else the first unanswered. P16 integration: named onAt, not onKey:
   * the keyboard handler below is also onKey, and the later declaration replaced this one, so every module had the same key (undefined) and
   * module 2 opened on the question she had left module 1 on */
  function onAt(s) { return B.uid + '|' + s.form + '|' + s.started_at + '|' + (s.module ? s.module.stage : ''); }
  function wasOn(s) {
    var k = -1; try { var v = JSON.parse(W.localStorage.getItem('jgs.on') || 'null'); if (v && v.k === onAt(s)) k = v.n; } catch (e) {}
    return typeof k === 'number' && k >= 0 && k < s.module.items.length && k === Math.floor(k) ? k : firstOpen();
  }
  function keepOn() { var s = st.s; if (!s || !s.module) return; try { W.localStorage.setItem('jgs.on', JSON.stringify({ k: onAt(s), n: st.cur })); } catch (e) {} }
  function top() { var b = D.querySelector('#jgs-view .zq-body'); if (b) b.scrollTop = 0; }
  function leftNow() { return Math.max(0, Math.round((st.endAt - Date.now()) / 1000)); }

  function bar(title) {
    var x = words(st.l), left = leftNow(), warn = st.s && st.s.status === 'running' && left <= 300;
    return '<div class="dg-top jgm-stop jgs-top"><button class="dg-back" type="button" data-s="close" aria-label="' + esc(x.close) + '">‹</button><p class="dg-tt">' + esc(title) + '</p>'
      + (st.s && st.s.status === 'running' ? '<span class="jgs-clockw"><span class="dg-timer jgm-clock jgs-clock' + (warn ? ' warn' : '') + '" role="timer"' + (st.hidden && !warn ? ' hidden' : '') + '>' + hms(left) + '</span>'
        + '<button class="dg-link jgs-hide" type="button" data-s="hide">' + esc(st.hidden ? x.show : x.hide) + '</button></span>' : '<span class="dg-timer"></span>') + '</div>';
  }
  function paint() {
    var el = $('jgs-view'), s = st.s, x = words(st.l); if (!el || el.hidden) return;
    if (!s) { el.innerHTML = bar('SAT') + '<div class="zq-body"><p class="jgm-when">' + esc(st.err || x.busy) + '</p></div>'; return; }
    if (s.status === 'done') { el.innerHTML = bar('SAT · ' + x.done) + '<div class="zq-body jgs-res">' + resultHtml(s, x) + '</div>'; return; }
    if (s.stage === 'break') {
      el.innerHTML = bar(x.brkH) + '<div class="zq-body"><div class="zq-goal jgs-brk" role="status"><small>' + esc(x.brkH) + '</small><b class="jgs-brkt">' + hms(leftNow()) + '</b><p>' + esc(x.brk) + '</p></div>'
        + '<button class="dg-go" type="button" data-s="skip"' + (st.ending ? ' disabled' : '') + '>' + esc(x.brkGo) + '</button></div>';
      return;
    }
    if (!s.module) { el.innerHTML = bar('SAT') + '<div class="zq-body"><p class="jgm-out" role="status">' + esc(st.ending ? x.out : x.wait) + '</p></div>'; return; }
    var m = s.module, it = m.items[st.cur], k = s.stage.charAt(s.stage.length - 1), of = m.items.length, marked = st.marks.indexOf(st.cur) >= 0;
    var h = bar(x.mod(m.section, k)) + '<div class="zq-body jgm-sit jgs-sit">';
    if (st.err) h += '<p class="jgm-err" role="alert">' + esc(st.err) + '</p>';
    if (leftNow() <= 300 && leftNow() > 0) h += '<p class="jgs-five" role="status">' + esc(x.five) + '</p>';
    h += '<div class="jgs-qh"><b class="jr-next-h">' + esc(x.q(st.cur + 1, of)) + '</b><button type="button" class="jgs-mark' + (marked ? ' on' : '') + '" data-s="mark" aria-pressed="' + marked + '">'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h11l-2 4 2 4H6"/></svg>' + esc(marked ? x.marked : x.mark) + '</button></div>';
    if (m.section === 'math') h += '<div class="jgs-tools"><button type="button" class="dg-link" data-s="ref">' + esc(x.ref) + '</button><small>' + esc(x.calc) + '</small></div>' + (st.ref ? refHtml(x) : '');
    if (it.passage) h += '<div class="jgm-psg" lang="en">' + (it.passage.title ? '<b>' + esc(it.passage.title) + '</b>' : '') + '<p>' + esc(it.passage.text) + '</p></div>';
    if (it.instructions) h += '<p class="dg-hint" lang="en">' + esc(it.instructions) + '</p>';
    h += '<p class="dg-q jgm-q" lang="en">' + esc(it.prompt) + '</p>';
    var mine = m.answers[String(st.cur)];
    if (it.options) {
      var out = st.out[st.cur] || {};
      h += '<div class="dg-opts jgm-opts jgs-opts" role="radiogroup" lang="en">' + it.options.map(function (o, j) {
        var x2 = !!out[o.t];
        return '<div class="jgs-orow' + (x2 ? ' out' : '') + '"><button type="button" class="dg-opt" role="radio" aria-checked="' + (mine === o.t) + '" data-s="opt" data-tok="' + esc(o.t) + '"><b class="jgm-l">' + 'ABCD'.charAt(j) + '</b><span>' + esc(o.text) + '</span></button>'
          + '<button type="button" class="jgs-x" data-s="cross" data-tok="' + esc(o.t) + '" aria-label="' + esc((x2 ? x.uncross : x.cross) + ' ' + 'ABCD'.charAt(j)) + '">' + (x2 ? '↺' : '<s>' + 'ABCD'.charAt(j) + '</s>') + '</button></div>';
      }).join('') + '</div>';
    } else {
      var v = mine == null ? '' : mine, p = v === '' ? null : spr(v);
      h += '<label class="jgm-f jgs-type"><span>' + esc(x.typeH) + '</span><input class="dg-field" id="jgs-in" type="text" inputmode="text" autocomplete="off" maxlength="12" value="' + esc(v) + '"></label>'
        + '<p class="dg-hint">' + esc(x.typeHint) + '</p><p class="jgs-seen" aria-live="polite">' + (v === '' ? '' : esc(p === null ? x.typeBad : x.typeSeen(num(p, st.l)))) + '</p>';
    }
    h += '<div class="jgm-nav"><button class="dg-link" type="button" data-s="prev"' + (st.cur ? '' : ' disabled') + '>' + esc(x.prev) + '</button>'
      + '<button class="jgs-navb" type="button" data-s="nav" aria-expanded="' + st.nav + '">' + esc(x.q(st.cur + 1, of)) + ' ▾</button>'
      + (st.cur < of - 1 ? '<button class="dg-go" type="button" data-s="next">' + esc(x.next) + '</button>' : '<button class="dg-go" type="button" data-s="toend">' + esc(x.next) + '</button>') + '</div>';
    if (st.nav || st.cur === of - 1 || st.confirm) h += navHtml(x, m);
    el.innerHTML = h + '</div>';
  }
  function navHtml(x, m) {
    var g = '<b class="jr-next-h jgm-secs-h">' + esc(x.nav) + '</b><div class="jgm-grid jgs-grid"><div class="jgm-gb"><div>';
    for (var n = 0; n < m.items.length; n++) {
      var a = !!m.answers[String(n)], mk = st.marks.indexOf(n) >= 0;
      g += '<button type="button" data-s="go" data-n="' + n + '" class="' + (a ? 'on' : '') + (n === st.cur ? ' cur' : '') + (mk ? ' mk' : '') + '"' + (n === st.cur ? ' aria-current="true"' : '') + '>' + (n + 1) + '</button>';
    }
    g += '</div></div><p class="jgs-legend"><i class="on"></i>' + esc(x.legend[0]) + '<i class="mk"></i>' + esc(x.legend[1]) + '<i></i>' + esc(x.legend[2]) + '</p></div>';
    var open = m.items.length - Object.keys(m.answers).length;
    return g + (st.confirm ? '<div class="jgm-sure" role="alertdialog"><p>' + esc(x.sure(open)) + '</p><button class="dg-go" type="button" data-s="end"' + (st.ending ? ' disabled' : '') + '>' + esc(x.yes) + '</button><button class="dg-link" type="button" data-s="stay">' + esc(x.no) + '</button></div>'
      : '<button class="dg-link jgm-finish" type="button" data-s="ask">' + esc(x.end) + '</button>');
  }
  function refHtml(x) {
    var L = REF[st.l] || REF.en;
    return '<div class="jgs-ref" role="region" aria-label="' + esc(x.ref) + '"><button class="dg-link" type="button" data-s="ref">' + esc(x.refClose) + '</button><ul>'
      + FORMULAS.map(function (f, k) { return '<li><b>' + esc(L[k]) + '</b><span lang="en">' + esc(f) + '</span></li>'; }).join('') + '</ul><p>' + esc(L[10]) + '</p></div>';
  }
  function resultHtml(s, x) {
    var r = s.result, h = '<div class="zq-goal jgm-res" role="status"><small>' + esc(x.done) + '</small><b>' + esc(x.total(r.right, r.of)) + '</b><p>' + esc(x.honest) + '</p><p class="jgs-easier">' + esc(x.easier) + '</p></div>';
    h += '<b class="jr-next-h jgm-secs-h">' + esc(x.secH) + '</b><ol class="jgm-secs jgs-rsec">' + r.sections.map(function (c) {
      return '<li><b>' + esc(SEC[c.section]) + '<small>' + esc(x.mod2[c.route]) + '</small></b><em>' + c.right + '/' + c.of + '</em></li>';
    }).join('') + '</ol>';
    h += ['rw', 'math'].map(function (sec) { return '<p class="jgs-route">' + esc(SEC[sec] + ': ' + r.routes[sec].words) + '</p>'; }).join('');
    h += '<b class="jr-next-h jgm-secs-h">' + esc(x.modH) + '</b><ol class="jgm-secs jgs-rmod">' + r.modules.map(function (m) {
      return '<li><b>' + esc(x.mod(m.section, m.stage.charAt(m.stage.length - 1))) + '<small>' + esc(x.took(m.seconds) + ' / ' + x.minutes(s.minutes[m.stage])) + '</small></b><em>' + m.right + '/' + m.of + '</em></li>';
    }).join('') + '</ol>';
    h += '<b class="jr-next-h jgm-secs-h">' + esc(x.domH) + '</b><ol class="jgm-secs jgs-rdom">' + r.domains.map(function (d) {
      return '<li><b>' + esc(d.name) + '</b><em>' + d.right + '/' + d.of + '</em></li>';
    }).join('') + '</ol>';
    h += '<p class="jgm-when">' + esc(r.coins ? x.coins(r.coins) : x.noCoins) + '</p>';
    h += '<b class="jr-next-h jgm-secs-h">' + esc(x.revH) + '</b><div class="jgs-rev">' + (s.review || []).map(function (q, i) {
      var openQ = st.rev === i, head = '<button type="button" class="jgs-rq' + (q.ok ? ' ok' : '') + '" data-s="rev" data-n="' + i + '" aria-expanded="' + openQ + '"><span>' + esc(x.mod(q.stage.indexOf('rw') === 0 ? 'rw' : 'math', q.stage.charAt(q.stage.length - 1)) + ' · ' + (q.n + 1)) + '</span><em>' + esc(q.ok ? x.ok : x.miss) + '</em></button>';
      if (!openQ) return head;
      var mine = q.options ? (q.options.filter(function (o) { return o.mine; })[0] || null) : null, given = q.options ? (mine ? mine.text : '') : (q.typed || '');
      return head + '<div class="jgs-ra">' + (q.passage ? '<div class="jgm-psg" lang="en"><p>' + esc(q.passage.text) + '</p></div>' : '') + '<p class="dg-q" lang="en">' + esc(q.prompt) + '</p>'
        + '<p><small>' + esc(x.yours) + '</small><b lang="en">' + esc(given || x.blank) + '</b></p><p><small>' + esc(x.right) + '</small><b lang="en">' + esc(q.answer) + '</b></p><p class="jgs-why">' + esc(q.why) + '</p></div>';
    }).join('') + '</div>';
    return h;
  }

  /* ---------- her answers, the clocks ---------- */
  function pick(t) {
    var s = st.s; if (!s || !s.module || st.ending || leftNow() <= 0) return;
    var k = String(st.cur); s.module.answers[k] = t; st.dirty[k] = t; paint(); later();
  }
  function later() { if (st.flushT) clearTimeout(st.flushT); st.flushT = setTimeout(function () { st.flushT = null; flush(); }, 400); }
  function flush() {
    if (st.saving) return st.saving.then(function () { return Object.keys(st.dirty).length || st.marksDirty ? flush() : null; });
    var s = st.s; if (!s || !s.module) return Promise.resolve();
    var send = st.dirty, marks = st.marksDirty ? st.marks.slice() : null; if (!Object.keys(send).length && !marks) return Promise.resolve();
    st.dirty = {}; st.marksDirty = false;
    var body = { op: 'save', stage: s.module.stage, answers: send }; if (marks) body.marks = marks;
    st.saving = req('POST', body).then(function (r) {
      st.saving = null;
      if (r.status === 200 && r.body.sitting) { if (typeof r.body.sitting.left_s === 'number' && r.body.sitting.stage === s.stage) st.endAt = Date.now() + r.body.sitting.left_s * 1000; if (st.err) { st.err = ''; paint(); } return; }
      if (r.status === 409) return reload();                                    // the module has ended on the server: where it is now
      for (var k in send) if (!(k in st.dirty)) st.dirty[k] = send[k];
      if (marks) st.marksDirty = true;
      st.err = words(st.l).saveErr; paint();
      setTimeout(function () { if (!st.saving) flush(); }, 3000);
    });
    return st.saving;
  }
  function tickOn() { if (!st.timer) st.timer = setInterval(tick, 1000); }
  function tickOff() { if (st.timer) { clearInterval(st.timer); st.timer = null; } }
  function tick() {
    var left = leftNow(), c = D.querySelector('#jgs-view .jgs-clock'), b = D.querySelector('#jgs-view .jgs-brkt');
    if (c) { c.textContent = hms(left); if (left <= 300 && !c.classList.contains('warn')) { c.classList.add('warn'); c.hidden = false; } }
    if (b) b.textContent = hms(left);
    if (left <= 300 && !st.warned && st.s && st.s.module) { st.warned = true; paint(); }
    if (left <= 0 && st.s && st.s.status === 'running' && !st.ending) {             // the clock's end: the last answers saved, then the server's next stage
      st.ending = true; tickOff(); paint();
      (st.s.module ? flush() : Promise.resolve()).then(function () { return new Promise(function (ok) { setTimeout(ok, 1200); }); }).then(reload).then(function () { st.ending = false; paint(); });
    }
  }
  function endNow(stage) {
    if (st.ending) return; st.ending = true; paint();
    var f = st.s && st.s.module ? flush() : Promise.resolve();
    f.then(function () { return req('POST', { op: 'end', stage: stage }); }).then(function (r) {
      st.ending = false;
      if (r.status === 200 && r.body.sitting) return took(r.body.sitting);
      if (r.status === 409) return reload();
      st.err = words(st.l).failed; paint();
    });
  }
  function onClick(e) {
    var b = e.target.closest ? e.target.closest('[data-s]') : null; if (!b) return;
    var k = b.getAttribute('data-s'), m = st.s && st.s.module;
    if (k === 'close') { if (Object.keys(st.dirty).length) flush(); hide(); }
    else if (k === 'hide') { st.hidden = !st.hidden; paint(); }
    else if (k === 'opt') pick(b.getAttribute('data-tok'));
    else if (k === 'cross') { var o = st.out[st.cur] = st.out[st.cur] || {}, t = b.getAttribute('data-tok'); o[t] = !o[t]; paint(); }
    else if (k === 'mark') { var i = st.marks.indexOf(st.cur); if (i >= 0) st.marks.splice(i, 1); else st.marks.push(st.cur); st.marksDirty = true; paint(); later(); }
    else if (k === 'prev') go(st.cur - 1);
    else if (k === 'next') go(st.cur + 1);
    else if (k === 'toend' || k === 'nav') { st.nav = !st.nav || k === 'toend'; paint(); var g = D.querySelector('#jgs-view .jgs-grid'); if (g && g.scrollIntoView) g.scrollIntoView({ block: 'nearest' }); }
    else if (k === 'go') { st.nav = false; go(+b.getAttribute('data-n')); }
    else if (k === 'ask') { st.confirm = true; paint(); var y = D.querySelector('#jgs-view .jgm-sure .dg-go'); if (y && y.focus) try { y.focus(); } catch (er) {} }
    else if (k === 'stay') { st.confirm = false; paint(); }
    else if (k === 'end' && m) endNow(m.stage);
    else if (k === 'skip') endNow('break');
    else if (k === 'ref') { st.ref = !st.ref; paint(); }
    else if (k === 'rev') {                                                       // P16 [p17#7]: the list stays where it is (paint redraws its scroller)
      var n = +b.getAttribute('data-n'), sb = D.querySelector('#jgs-view .zq-body'), y = sb ? sb.scrollTop : 0;
      st.rev = st.rev === n ? null : n; paint(); sb = D.querySelector('#jgs-view .zq-body'); if (sb) sb.scrollTop = y;
      var ra = sb && D.querySelector('#jgs-view .jgs-ra'), rq = ra && ra.previousElementSibling;   // an answer opened below the fold: up into view, its row still on screen
      if (ra && rq) { var bb = sb.getBoundingClientRect(), over = ra.getBoundingClientRect().bottom - bb.bottom + 12, room = rq.getBoundingClientRect().top - bb.top - 8; if (over > 0 && room > 0) sb.scrollTop += Math.min(over, room); }
    }
  }
  function onInput(e) {
    if (!e.target || e.target.id !== 'jgs-in' || !st.s || !st.s.module) return;
    var v = e.target.value, k = String(st.cur), x = words(st.l), p = v.trim() === '' ? null : spr(v), seen = D.querySelector('#jgs-view .jgs-seen');
    if (seen) seen.textContent = v.trim() === '' ? '' : p === null ? x.typeBad : x.typeSeen(num(p, st.l));
    if (v.trim() === '') { delete st.s.module.answers[k]; st.dirty[k] = null; } else { st.s.module.answers[k] = v.trim(); st.dirty[k] = v.trim(); }
    later();
  }
  function onKey(e) {
    var v = $('jgs-view'); if (!v || v.hidden || !st.s || !st.s.module || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) return;
    var key = String(e.key), it = st.s.module.items[st.cur], j = key.length === 1 ? ('1234'.indexOf(key) >= 0 ? '1234'.indexOf(key) : 'abcd'.indexOf(key.toLowerCase())) : -1;
    if (j >= 0 && it && it.options && it.options[j]) { e.preventDefault(); pick(it.options[j].t); }
    else if (key === 'ArrowRight') { e.preventDefault(); go(st.cur + 1); }
    else if (key === 'ArrowLeft') { e.preventDefault(); go(st.cur - 1); }
  }
  function go(n) { var m = st.s && st.s.module; if (!m || n < 0 || n >= m.items.length) return; st.cur = n; st.confirm = false; st.ref = false; keepOn(); paint(); top(); }

  var cssDone = false;
  function css() {
    if (cssDone || $('jgs-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jgs-css';
    s.textContent = [
      '.jgs-lobby p{font-size:13.5px;font-weight:600;line-height:1.5}',
      '.jgs-top .dg-tt{flex:1;min-width:0;white-space:normal;font-size:15px;line-height:1.2;overflow-wrap:anywhere}',
      '.jgs-sit .jgm-nav .dg-link,.jgs-navb{white-space:nowrap}.jgs-navb{font-size:12.5px}',
      '.jgs-clockw{flex:none;display:flex;align-items:center;gap:6px}.jgs-hide{font-size:12px;padding:4px 6px}',
      '.jgs-clock.warn{color:#a63d36}',
      '.jgs-five{padding:10px 14px;border-radius:14px;background:#fff4ec;color:#6e2410;font-size:13.5px;font-weight:800}',
      '.jgs-qh{display:flex;align-items:center;justify-content:space-between;gap:10px}',
      '.jgs-mark{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:0;border-radius:10px;background:#fff;box-shadow:inset 0 0 0 1.5px #dbe6e0;color:var(--ink);font:700 12.5px var(--font);cursor:pointer}',
      '.jgs-mark svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}.jgs-mark.on{background:#fff4ec;box-shadow:inset 0 0 0 1.5px #d9822b;color:#6e2410}.jgs-mark.on svg{fill:#d9822b;stroke:#d9822b}',
      '.jgs-tools{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.jgs-tools small{font-size:12.5px;font-weight:600;color:var(--muted)}',
      '.jgs-ref{display:grid;gap:8px;padding:12px 14px;border-radius:14px;background:#fff;box-shadow:0 1px 6px rgba(16,39,30,.05)}',
      '.jgs-ref ul{margin:0;padding:0;list-style:none;display:grid;gap:6px}.jgs-ref li{display:flex;justify-content:space-between;gap:10px;font-size:13.5px}.jgs-ref li span{font-weight:800;text-align:right}',
      '.jgs-ref p{font-size:13px;font-weight:600;color:var(--muted)}',
      '.jgs-orow{display:flex;align-items:stretch;gap:6px}.jgs-orow .dg-opt{flex:1;min-width:0}',
      '.jgs-x{flex:none;width:40px;border:0;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1.5px #e0eae5;color:var(--muted);font:800 13px var(--font);cursor:pointer}',
      '.jgs-orow.out .dg-opt{opacity:.45}.jgs-orow.out .dg-opt span{text-decoration:line-through}',
      '.jgs-type input{font-size:18px;font-weight:700;letter-spacing:.02em}.jgs-seen{min-height:18px;font-size:13px;font-weight:700;color:var(--jade-700)}',
      '.jgs-navb{flex:1 1 auto;min-width:0;padding:10px;border:0;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1.5px #dbe6e0;color:var(--ink);font:700 13px var(--font);cursor:pointer}',
      '.jgs-sit .jgm-nav .dg-go{flex:0 1 160px}',
      '.jgs-grid .jgm-gb div{grid-template-columns:repeat(9,minmax(0,1fr))}',
      '.jgs-grid button.mk{position:relative}.jgs-grid button.mk:after{content:"";position:absolute;top:3px;right:3px;width:7px;height:7px;border-radius:50%;background:#d9822b}',
      '.jgs-legend{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;font-size:12px;font-weight:700;color:var(--muted)}',
      '.jgs-legend i{display:inline-block;width:12px;height:12px;margin-right:-6px;border-radius:4px;background:#fff;box-shadow:inset 0 0 0 1.5px #dbe6e0}',
      '.jgs-legend i.on{background:var(--accent-soft,#e3f6ec);box-shadow:inset 0 0 0 1.5px var(--jade-500)}.jgs-legend i.mk{background:#d9822b;box-shadow:none;border-radius:50%}',
      '.jgs-brkt{font-size:44px;font-variant-numeric:tabular-nums}.jgs-brk p{font-size:14px;font-weight:600;line-height:1.5}',
      '.jgs-rsec b small,.jgs-rmod b small{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--muted)}',
      '.jgs-route{font-size:13.5px;font-weight:600;line-height:1.5;color:var(--ink)}',
      '.jgs-res .zq-goal.jgm-res p{font-size:12.5px;font-weight:600;line-height:1.45;opacity:.9}',
      '.jgs-rev{display:grid;gap:6px}.jgs-rq{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:11px 14px;border:0;border-radius:12px;background:#fff;box-shadow:0 1px 6px rgba(16,39,30,.05);color:var(--ink);font:700 13.5px var(--font);text-align:left;cursor:pointer}',
      '.jgs-rq em{font-style:normal;font-weight:800;color:#a63d36}.jgs-rq.ok em{color:var(--jade-700)}',
      '.jgs-ra{display:grid;gap:8px;padding:4px 6px 10px;font-size:14px;line-height:1.5}.jgs-ra p small{display:block;font-size:12px;font-weight:700;color:var(--muted)}',
      '.jgs-why{padding:10px 12px;border-radius:12px;background:#eef4f1;font-weight:600}',
      '@media (min-width:900px){.jgs-view .zq-body{max-width:760px}}'
    ].join('\n');
    D.head.appendChild(s);
  }
  W.JG_SAT = { lobby: lobby, pill: pill, act: act, open: open, words: words, spr: spr,
    state: function () { var s = st.s; return { status: s ? s.status : null, stage: s ? s.stage : null, cur: st.cur, left: leftNow(), marks: st.marks ? st.marks.slice() : [], hidden: st.hidden }; } };
})();
