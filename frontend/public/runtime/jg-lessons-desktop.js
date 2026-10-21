/* Jamals Global runtime: the lessons part on the laptop (P6 lane A5; SPEC-lessons §4.1, §5.2-§5.4, §8.3, §9.3, §10; the owner, 12 Oct 2026:
 * "lessons va lesson h/w qism. IELTS/SAT/AP/ETC... dunyodagi eng mashxur tizimlardan ilhomlanishimiz kerak").
 * Loaded by src/server/pages.ts on a live, non-demo student's LAPTOP page only while the lessons part is on (the scheduler's switch and LESSONS), deferred,
 * after the design scripts and before jg-real.js (whose shelf, part 2b, then draws nothing: these rows hold its lessons). The phone's twin is
 * public/runtime/jg-lessons.js; the words and the rules below are the same, the drawing is the laptop design's (web/student-desktop,
 * public/d/student-desktop/js/013.js). Not design code: it works in the design's own markup and classes.
 * 1. THE TAB. One row a course (GET /api/v1/lessons `courses`), in the design's own row and card grid, above its live row and its cards:
 *    the course's title and "1/3 dars"; one line with each section's units at Bilaman or above ("Algebra · 1/2 Bilaman"); a card a lesson
 *    (its number, the minutes with a page icon for a text lesson, never the play triangle; done, next or open; the unit's level as four
 *    dots). The design's SAT and IELTS sample rows fold for a student with a real course of that exam; AP and Psychology stay (D19, C-11).
 *    The JIA card only with its switch on (D-3); the non-affiliation line at the foot of the tab (C-35). Home's "Continue" names her lesson.
 * 2. A LESSON. It opens out of its card into the design's own lesson page (window.JIA_openDetail, D:013:212), the player's place holding
 *    the reader (no player without a video, R13): the first screen ("Darsni boshlash", and under it as plain text "Bilaman — testni hozir
 *    yechaman" when the server offers the test-out), one piece a screen with one question graded by the server (POST
 *    /api/v1/lessons/<id>/piece; no key on the page), the right option green in place and its why under it, "Bilmayman"; then the test.
 *    Beside it the run list: each lesson of the course as "its title" and "Test", done, open or this one.
 * 3. THE TEST and THE RESULT CARD. The test runs in the lesson page through the server's quiz (public/runtime/jg-checks.js quiz(), a task
 *    that names its mode, test or test_out, and its lesson); today's scheduled lesson opens the design's task sheet as before. Its ending
 *    draws three lines (score and coins; the skill's level and why; what comes next) and "Keyingi dars" / "Bugunga yetarli".
 * Every word is in English, Uzbek (U+02BB, U+02BC) and Russian; what this file writes is marked data-no-i18n. window.JG_LESSONS_DESKTOP:
 * words(lang), state(), paint(), open(id), result(r). tests/unit/jg-lessons-desktop.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_LESSONS_DESKTOP) return;

  /* ---------- words ---------- */
  var RU_N = function (n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
  var T = {
    en: {
      count: function (a, b) { return a + '/' + b + ' lessons'; }, min: function (m) { return m + ' min'; },
      lv: { started: 'Started', familiar: 'Familiar', proficient: 'Proficient', mastered: 'Mastered' },
      secLine: function (t, k, n) { return t + ': ' + k + ' of ' + n + (n === 1 ? ' topic' : ' topics') + ' at Proficient'; },
      done: '✓ Done', current: 'Up next', today: 'Today’s task',
      start: 'Start the lesson', testout: 'I know this — take the test now',
      plan: function (p, q) { return p + ' short parts · a ' + q + '-question test'; },
      role: { idea: 'The idea', example: 'Example', trap: 'The trap', words: 'Words', read: 'Read', model: 'Model paragraph', format: 'On the test' },
      toWrite: 'Write your paragraph', writeRow: 'Write', wplan: function (p) { return p + ' short parts · your own paragraph'; },
      toSpeak: 'Start speaking practice', speakRow: 'Speak', splan: 'The card · 1 min to plan · 2 min to talk',   // P8: a Speaking lesson
      dunno: 'I don’t know', right: '✓ Right', rightIs: function (t) { return 'Right answer: ' + t; }, why: 'Why',
      next: 'Next', toTest: function (n) { return 'Start the test · ' + n + ' questions'; }, test: 'Test',
      testLine: 'After each answer you see the right one and why.', back: 'Back to the lesson', toRun: 'Back to the test',
      qs: function (n) { return n + ' questions'; }, upTo: function (n) { return 'up to ' + n + ' questions'; },
      score: function (a, b, pass, c, fast) { return 'Test: ' + a + '/' + b + (fast ? ' · too fast: not counted' : pass ? ' ✓ · ' + (c > 0 ? '+' + c + ' coins' : 'coins for this lesson already paid') : ' · no coins · streak kept'); },   /* P8c item 3: too fast says so, as the phone's card does */   /* P8: a lesson pays once; its retaken test says so, never "+0" */
      moved: function (u, f, t) { return u + ': ' + f + ' → ' + t; }, kept: function (u, l) { return u + ': still ' + l; }, same: 'Skills unchanged',
      hw: 'Tomorrow: homework on this topic', hw0: 'Tomorrow: homework', again: 'Go back to the lesson and try again.', allDone: 'You have done every lesson of this course.',
      nextLesson: 'Next lesson', enough: 'Enough for today', read: 'Read the lesson',
      loading: 'Loading…', failed: 'The lesson did not open. Try again in a moment.', retry: 'Try again',
      all: function (n) { return 'Show all · ' + n; }, fewer: 'Show fewer', team: 'Jamals Global team',
      /* P7f: the unit test (SPEC-lessons §5.2, §12.5 item 1) */
      utRow: 'Unit test', utHead: function (t) { return 'Unit test: ' + t; }, utNot: 'This unit test is not open right now.',
      utPlan: function (n, k) { return n + ' questions · only the first try counts · pass at ' + k + '/' + n; }, utPaid: 'coins for this unit already paid', utCoins: function (c) { return '+' + c + ' coins'; },
      utNoCoins: function (k) { return 'no coins (' + k + ' needed)'; }, utAgain: 'You can try again tomorrow.', utNext: function (t) { return 'Next lesson: ' + t; },
      utWhy: { lessons: 'After the lessons', mastered: 'Mastered ✓', today: 'Again tomorrow', items: 'No new questions yet' }, utFrom: function (d) { return 'from ' + d; },
      jia: 'Learn SAT with a JIA teacher: in Tashkent, in Andijan, or online with Online Premium. The first lesson is free.', jiaGo: 'Sign up', jiaNo: 'Close',
      foot: 'SAT, AP and Bluebook are trademarks of College Board. IELTS is jointly owned by the British Council, IDP IELTS and Cambridge University Press & Assessment. Jamals Global is not affiliated with or endorsed by them.',
      quiz: { correct: 'Correct', wrong: 'Not this time', answer: 'Right answer: {{answer}}.', next: 'Next', result: 'See my result' }
    },
    uz: {
      count: function (a, b) { return a + '/' + b + ' dars'; }, min: function (m) { return m + ' daq'; },
      lv: { started: 'Boshlandi', familiar: 'Tanish', proficient: 'Bilaman', mastered: 'Puxta' },
      secLine: function (t, k, n) { return t + ': ' + n + ' mavzudan ' + k + ' tasi Bilaman darajasida'; },
      done: '✓ Bajarildi', current: 'Navbatdagi', today: 'Bugungi vazifa',
      start: 'Darsni boshlash', testout: 'Bilaman — testni hozir yechaman',
      plan: function (p, q) { return p + ' ta qisqa qism · ' + q + ' savolli test'; },
      role: { idea: 'Gʻoya', example: 'Misol', trap: 'Tuzoq', words: 'Soʻzlar', read: 'Oʻqing', model: 'Namuna', format: 'Testda' },
      toWrite: 'Xatboshingizni yozing', writeRow: 'Yozish', wplan: function (p) { return p + ' ta qisqa qism · oʻz xatboshingiz'; },
      toSpeak: 'Gapirish mashqini boshlash', speakRow: 'Gapirish', splan: 'Kartochka · 1 daqiqa reja · 2 daqiqa gapirish',
      dunno: 'Bilmayman', right: '✓ Toʻgʻri', rightIs: function (t) { return 'Toʻgʻri javob: ' + t; }, why: 'Izoh',
      next: 'Keyingisi', toTest: function (n) { return 'Testni boshlash · ' + n + ' savol'; }, test: 'Test',
      testLine: 'Har javobdan keyin toʻgʻri javob va izohi chiqadi.', back: 'Darsga qaytish', toRun: 'Testga qaytish',
      qs: function (n) { return n + ' savol'; }, upTo: function (n) { return n + ' tagacha savol'; },
      score: function (a, b, pass, c, fast) { return 'Test: ' + a + '/' + b + (fast ? ' · juda tez: hisoblanmadi' : pass ? ' ✓ · ' + (c > 0 ? '+' + c + ' tanga' : 'bu dars uchun tanga avval berilgan') : ' · tanga yoʻq · seriya saqlandi'); },
      moved: function (u, f, t) { return u + ': ' + f + ' → ' + t; }, kept: function (u, l) { return u + ': ' + l + ' qoldi'; }, same: 'Koʻnikmalar oʻzgarmadi',
      hw: 'Ertaga: shu mavzudan uy vazifasi', hw0: 'Ertaga: uy vazifasi', again: 'Darsga qaytib, yana urinib koʻring.', allDone: 'Bu kursning hamma darsini oʻtdingiz.',
      nextLesson: 'Keyingi dars', enough: 'Bugunga yetarli', read: 'Darsni oʻqish',
      loading: 'Yuklanmoqda…', failed: 'Dars ochilmadi. Birozdan keyin yana urinib koʻring.', retry: 'Qayta urinish',
      all: function (n) { return 'Hammasi · ' + n; }, fewer: 'Kamroq', team: 'Jamals Global jamoasi',
      utRow: 'Mavzu testi', utHead: function (t) { return 'Mavzu testi: ' + t; }, utNot: 'Bu mavzu testi hozir ochiq emas.',
      utPlan: function (n, k) { return n + ' ta savol · faqat birinchi urinish hisoblanadi · ' + k + '/' + n + ' dan oʻtiladi'; }, utPaid: 'bu mavzu uchun tanga avval berilgan', utCoins: function (c) { return '+' + c + ' tanga'; },
      utNoCoins: function (k) { return 'tanga yoʻq (' + k + ' ta kerak edi)'; }, utAgain: 'Ertaga yana urinib koʻrishingiz mumkin.', utNext: function (t) { return 'Keyingi dars: ' + t; },
      utWhy: { lessons: 'Darslardan keyin', mastered: 'Puxta ✓', today: 'Ertaga yana', items: 'Hozircha yangi savol yoʻq' }, utFrom: function (d) { return d + 'dan'; },
      jia: 'SATni JIA oʻqituvchisi bilan oʻrganing: Toshkentda, Andijonda yoki Online Premiumda. Birinchi dars bepul.', jiaGo: 'Yozilish', jiaNo: 'Yopish',
      foot: 'SAT, AP va Bluebook — College Board savdo belgilari. IELTS British Council, IDP IELTS va Cambridge University Press & Assessment tashkilotlariga tegishli. Jamals Global ular bilan bogʻliq emas va ular tomonidan tasdiqlanmagan.',
      quiz: { correct: 'Toʻgʻri', wrong: 'Bu safar emas', answer: 'Toʻgʻri javob: {{answer}}.', next: 'Keyingisi', result: 'Natijam' }
    },
    ru: {
      count: function (a, b) { return a + ' из ' + b + ' ' + RU_N(b, 'урока', 'уроков', 'уроков'); }, min: function (m) { return m + ' мин'; },
      lv: { started: 'Начато', familiar: 'Знакомо', proficient: 'Умею', mastered: 'Освоено' },
      secLine: function (t, k, n) { return t + ': ' + k + ' из ' + n + RU_N(n, ' темы', ' тем', ' тем') + ' на уровне «Умею»'; },
      done: '✓ Готово', current: 'Следующий', today: 'Задание на сегодня',
      start: 'Начать урок', testout: 'Я это знаю — сразу к тесту',
      plan: function (p, q) { return p + ' ' + RU_N(p, 'короткая часть', 'короткие части', 'коротких частей') + ' · тест из ' + q + ' ' + RU_N(q, 'вопроса', 'вопросов', 'вопросов'); },
      role: { idea: 'Идея', example: 'Пример', trap: 'Ловушка', words: 'Слова', read: 'Читаем', model: 'Образец', format: 'На тесте' },
      toSpeak: 'Начать практику говорения', speakRow: 'Говорение', splan: 'Карточка · 1 мин на подготовку · 2 мин речи',
      toWrite: 'Написать свой абзац', writeRow: 'Письмо', wplan: function (p) { return p + ' ' + RU_N(p, 'короткая часть', 'короткие части', 'коротких частей') + ' · ваш собственный абзац'; },
      dunno: 'Не знаю', right: '✓ Верно', rightIs: function (t) { return 'Правильный ответ: ' + t; }, why: 'Почему',
      next: 'Дальше', toTest: function (n) { return 'Начать тест · ' + n + ' ' + RU_N(n, 'вопрос', 'вопроса', 'вопросов'); }, test: 'Тест',
      testLine: 'После каждого ответа видно правильный ответ и почему.', back: 'Вернуться к уроку', toRun: 'Вернуться к тесту',
      qs: function (n) { return n + ' ' + RU_N(n, 'вопрос', 'вопроса', 'вопросов'); }, upTo: function (n) { return 'до ' + n + ' ' + RU_N(n, 'вопроса', 'вопросов', 'вопросов'); },
      score: function (a, b, pass, c, fast) { return 'Тест: ' + a + '/' + b + (fast ? ' · слишком быстро: не засчитано' : pass ? ' ✓ · ' + (c > 0 ? '+' + c + ' ' + RU_N(c, 'монета', 'монеты', 'монет') : 'монеты за этот урок уже начислены') : ' · без монет · серия сохранена'); },
      moved: function (u, f, t) { return u + ': ' + f + ' → ' + t; }, kept: function (u, l) { return u + ': по-прежнему ' + l; }, same: 'Навыки не изменились',
      hw: 'Завтра: домашнее задание по этой теме', hw0: 'Завтра: домашнее задание', again: 'Вернитесь к уроку и попробуйте ещё раз.', allDone: 'Вы прошли все уроки этого курса.',
      nextLesson: 'Следующий урок', enough: 'На сегодня хватит', read: 'Читать урок',
      loading: 'Загрузка…', failed: 'Урок не открылся. Попробуйте ещё раз чуть позже.', retry: 'Ещё раз',
      all: function (n) { return 'Все · ' + n; }, fewer: 'Меньше', team: 'Команда Jamals Global',
      utRow: 'Тест по теме', utHead: function (t) { return 'Тест по теме: ' + t; }, utNot: 'Тест по этой теме сейчас закрыт.',
      utPlan: function (n, k) { return n + ' ' + RU_N(n, 'вопрос', 'вопроса', 'вопросов') + ' · засчитывается только первая попытка · проходной ' + k + '/' + n; }, utPaid: 'монеты за эту тему уже начислены', utCoins: function (c) { return '+' + c + ' ' + RU_N(c, 'монета', 'монеты', 'монет'); },
      utNoCoins: function (k) { return 'без монет (нужно ' + k + ')'; }, utAgain: 'Завтра можно попробовать ещё раз.', utNext: function (t) { return 'Следующий урок: ' + t; },
      utWhy: { lessons: 'После уроков', mastered: 'Освоено ✓', today: 'Завтра снова', items: 'Пока нет новых вопросов' }, utFrom: function (d) { return 'с ' + d; },
      jia: 'Изучайте SAT с преподавателем JIA: в Ташкенте, в Андижане или онлайн в Online Premium. Первый урок бесплатный.', jiaGo: 'Записаться', jiaNo: 'Закрыть',
      foot: 'SAT, AP и Bluebook — товарные знаки College Board. IELTS совместно принадлежит British Council, IDP IELTS и Cambridge University Press & Assessment. Jamals Global не связан с ними и не одобрен ими.',
      quiz: { correct: 'Верно', wrong: 'В этот раз нет', answer: 'Правильный ответ: {{answer}}.', next: 'Дальше', result: 'Мой результат' }
    }
  };
  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function w() { return T[lang()]; }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var LV = ['started', 'familiar', 'proficient', 'mastered'];
  /* P7f: a day in the page's words (the unit test's "from 16 October"): "16 October", "16-oktabr", "16 октября" */
  var MON = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'], ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'] };
  function dayText(d) { var l = lang(), m = +String(d).slice(5, 7), n = +String(d).slice(8, 10); if (!m || !n) return String(d); return l === 'uz' ? n + '-' + MON.uz[m - 1] : n + ' ' + MON[l][m - 1]; }
  /* a level as four dots, ●○○○ to ●●●●, with its name for a screen reader */
  function dots(level) { var k = LV.indexOf(level); return k < 0 ? '' : '<span class="jg-dots" role="img" aria-label="' + esc(w().lv[level]) + '">' + '●●●●'.slice(0, k + 1) + '○○○○'.slice(0, 3 - k) + '</span>'; }
  var PAGE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 12h5M10 15.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  var TESTIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h3M5 12h3M5 17h3M11 7h8M11 12h8M11 17h8"/></svg>';
  /* each course's colours and picture, from the design's own four (013.js SUBJECTS; new pictures for Matematika and Ingliz tili are to come) */
  var LOOK = {
    sat_m: { img: 'sat', g: ['#e0ecfa', '#c3daf4'], ink: '#214269', sh: 'rgba(33, 66, 105, .14)', teacher: ['sat', 0], quiz: 'math' },
    sat_rw: { img: 'sat', g: ['#e0ecfa', '#c3daf4'], ink: '#214269', sh: 'rgba(33, 66, 105, .14)', teacher: ['sat', 2], quiz: 'english' },
    ielts_r: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)', teacher: ['ielts', 0], quiz: 'english' },
    ielts_w: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)', teacher: ['ielts', 0], quiz: 'english' },   // P7: IELTS Writing
    ielts_s: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)', teacher: ['ielts', 0], quiz: 'english' },   // P8: IELTS Speaking
    ielts_l: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)', teacher: ['ielts', 0], quiz: 'english' },   // P15: IELTS Listening
    math: { img: 'backpack', g: ['#e6f5eb', '#cde9da'], ink: '#1e684a', sh: 'rgba(30, 104, 74, .14)', teacher: null, quiz: 'math' },
    eng: { img: 'backpack', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)', teacher: null, quiz: 'english' }
  };
  function look(id) { return LOOK[id] || LOOK.math; }
  function imgOf(k) { return (W.JIA_IMG && W.JIA_IMG[k]) || ''; }
  function vars(c) { return '--g1:' + c.g[0] + ';--g2:' + c.g[1] + ';--ink2:' + c.ink + ';--sh:' + c.sh; }

  /* ---------- the stylesheet (in the design's tokens: Raleway, its jade, its radii) ---------- */
  function css() {
    if ($('jg-lessons-desktop-css')) return;
    var s = D.createElement('style'); s.id = 'jg-lessons-desktop-css';
    s.textContent = ''
      + '.jg-course .ls-head{margin-bottom:6px}.jg-secs{margin:0 0 14px;font-size:13px;font-weight:700;color:var(--muted)}'
      + '.jg-course .ls-card.jg-cur{box-shadow:0 0 0 2px var(--ink2),0 14px 28px var(--sh)}.jg-course .ls-meta.jg-now{color:var(--ink2)}'
      + '.jg-course .ls-dur svg{width:11px;height:11px}.jg-course .ls-dur[data-jg-format=text] svg{fill:none}'
      + '.jg-dots{display:block;margin-top:6px;font-size:11px;letter-spacing:2px;color:var(--ink2)}'
      + '.jg-more{margin-top:10px}'
      + '#jg-jia{display:flex;align-items:center;gap:14px;margin-top:22px;padding:14px 18px;border-radius:18px;background:#fff;border:1px solid var(--line)}'
      + '#jg-jia p{flex:1;margin:0;font-size:14px;font-weight:600;line-height:1.45;color:var(--ink)}#jg-jia a{flex:none;padding:10px 16px;border-radius:12px;background:var(--jade-950);color:#fff;font:800 13.5px var(--font);text-decoration:none}'
      + '.jg-foot{margin:40px 0 8px;max-width:90ch;font-size:12px;line-height:1.5;color:var(--muted)}'
      + '#ls-detail.jg-lx .ls-player{aspect-ratio:auto;overflow:visible;background:#fff;border:1px solid var(--line);box-shadow:0 14px 30px rgba(18,58,40,.06)}'
      + '#ls-detail.jg-lx #ls-obj,#ls-detail.jg-lx #ls-big,#ls-detail.jg-lx #ls-ctrl,#ls-detail.jg-lx #jg-novideo,#ls-detail.jg-lx #ls-livepill,#ls-detail.jg-lx #ls-viewers{display:none!important}'
      + '.jg-rd{display:grid;gap:14px;padding:30px 34px 32px;min-height:280px;align-content:start}'
      + '.jg-rd .dg-go{justify-self:start;min-width:240px;padding:0 26px}.jg-rd .dg-link{justify-self:start;padding:6px 0;text-decoration:underline;text-underline-offset:3px}'
      + '.jg-seg{display:flex;align-items:center;gap:6px}.jg-seg i{flex:1;height:6px;border-radius:3px;background:#e3ece7}.jg-seg i.done{background:var(--accent)}.jg-seg i.on{background:var(--ink2)}'
      + '.jg-seg-n{margin-left:8px;font-size:12.5px;font-weight:800;color:var(--muted)}'
      + '.jg-role{margin:0;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}'
      + '.jg-body{max-width:68ch;font-size:17px;line-height:1.62;color:var(--ink);white-space:pre-line}'
      + '.jg-sub{margin:0;font-size:14.5px;line-height:1.5;color:#4e5f54}.jg-lvl{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:var(--ink)}.jg-lvl .jg-dots{margin:0}'
      + '.jg-q{display:grid;gap:10px;margin-top:6px;padding-top:16px;border-top:1px solid var(--line)}.jg-q .dg-opts{max-width:560px}'
      + '.jg-q .dg-opt[disabled]{cursor:default}.jg-q .jd-res{max-width:560px;animation:jgGrow .32s cubic-bezier(.2,.8,.2,1)}'
      + '.jd-res.jg-bad{background:#fff3e6}@keyframes jgGrow{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}'
      + '.jg-res{gap:10px}.jg-res-l{margin:0;font-size:16px;line-height:1.45;color:var(--ink)}.jg-res-l:first-of-type{font-size:22px;font-weight:800}'
      + '.jg-res-l.jg-why{font-weight:700}.jg-res .dg-go{margin-top:10px;background:var(--jade-950)}'
      + '.jg-qbox{display:grid;gap:12px;max-width:620px}'
      + '.jg-qbox:has(.jg-pvw){max-width:none}'   /* P7: a question on a passage takes the reader's width, the passage beside it */
      + '.ls-item.jg-utoff{cursor:default}.ls-item.jg-utoff:not(.done) .ls-itt{color:var(--muted)}'   /* P7f: a unit test not offered yet */
      + '#ls-detail.jg-ut-on .ls-teacher,#ls-detail.jg-ut-on #ls-askl{display:none!important}'   /* P8 item 1: a unit test's page has no lesson teacher and no "about this lesson" */
      + '@media (prefers-reduced-motion: reduce){.jg-q .jd-res{animation:none}}';
    D.head.appendChild(s);
  }

  /* ---------- 1. the tab ---------- */
  var st = { state: 'loading', lang: null, courses: [], jia: false, jiaUrl: null, busy: false, more: {} };
  function cards(c) {
    var all = []; c.sections.forEach(function (s) { s.units.forEach(function (u) { u.lessons.forEach(function (l) { all.push({ l: l, u: u }); }); }); });
    return all;
  }
  function cardHtml(it, c) {
    var l = it.l, x = w(), meta = l.state === 'done' ? '<span class="ls-meta done">' + esc(x.done) + '</span>' : l.task_id ? '<span class="ls-meta jg-now">' + esc(x.today) + '</span>'
      : l.state === 'current' ? '<span class="ls-meta jg-now">' + esc(x.current) + '</span>' : '';
    return '<button class="ls-card' + (l.state === 'current' ? ' jg-cur' : '') + '" type="button" data-jg-id="' + esc(l.id) + '" data-jg-course="' + esc(c.id) + '" aria-label="' + esc(c.title + ', ' + l.n + ': ' + l.title + ', ' + x.min(l.minutes) + (l.state === 'done' ? ', ' + x.done.replace('✓ ', '') : '')) + '">'
      + '<span class="ls-cover"><span class="ls-num" aria-hidden="true">' + (l.n < 10 ? '0' : '') + l.n + '</span>' + (imgOf(look(c.id).img) ? '<img src="' + esc(imgOf(look(c.id).img)) + '" alt="">' : '')
      + '<span class="ls-dur" data-jg-format="' + (l.format === 'video' ? 'video' : 'text') + '">' + (l.format === 'video' ? PLAY : PAGE) + esc(x.min(l.minutes)) + '</span></span>'
      + '<span class="ls-body"><span class="ls-ttl">' + esc(l.title) + '</span>' + meta + dots(it.u.level) + '</span></button>';
  }
  var CAP = 8;
  function paintTab() {
    var page = $('v-lessons'), live = page && page.querySelector('.ls-live'), subs = $('ls-subjects'), x = w();
    if (!page || !live || !subs) return;
    css();
    var C = st.courses, prev = null;
    [].forEach.call(page.querySelectorAll('.jg-course'), function (r) { if (!C.some(function (c) { return 'jg-c-' + c.id === r.id; })) r.remove(); });
    C.forEach(function (c) {
      var id = 'jg-c-' + c.id, row = $(id), lk = look(c.id);
      if (!row) {
        row = D.createElement('section'); row.id = id; row.className = 'ls-sub jg-course'; row.setAttribute('data-no-i18n', '');
        row.addEventListener('click', function (e) {
          var b = e.target.closest ? e.target.closest('[data-jg-id]') : null;
          if (b) { openLesson(b.getAttribute('data-jg-id'), b); return; }
          if (e.target.closest && e.target.closest('.jg-more')) { st.more[c.id] = !st.more[c.id]; paintTab(); }
        });
      }
      page.insertBefore(row, prev ? prev.nextSibling : live);
      row.setAttribute('style', vars(lk));
      var all = cards(c), at = Math.max(0, all.findIndex(function (it) { return it.l.state === 'current'; })), from = all.length > CAP ? Math.max(0, Math.min(at - 2, all.length - CAP)) : 0;
      var shown = st.more[c.id] || all.length <= CAP ? all : all.slice(from, from + CAP);
      row.innerHTML = '<div class="ls-head ls-pad"><span class="ls-ic" aria-hidden="true">' + (imgOf(lk.img) ? '<img src="' + esc(imgOf(lk.img)) + '" alt="">' : '') + '</span><h2>' + esc(c.title) + '</h2><span class="ls-n">' + esc(x.count(c.done, c.of)) + '</span></div>'
        + '<p class="jg-secs">' + c.sections.map(function (s) { return esc(x.secLine(s.title, s.proficient | 0, s.of | 0)); }).join(' · ') + '</p>'   // P8c item 3: a count of topics at that level
        + '<div class="ls-row">' + shown.map(function (it) { return cardHtml(it, c); }).join('') + '</div>'
        + (all.length > CAP ? '<button class="dc-link jg-more" type="button">' + esc(st.more[c.id] ? x.fewer : x.all(all.length)) + '</button>' : '');
      prev = row;
    });
    /* the design's sample rows of an exam she has a real course of fold (C-11). P8d (the teen re-check of 14 Oct: their English lesson lines
     * on uz/ru pages): AP's and Psychology's samples are hidden for a real student, Psychology parked (C-23), AP's place taken by her real AP
     * course where she has one; the placeholder teachers stay on her real lessons (D19) */
    var exams = {}; C.forEach(function (c) { if (c.exam) exams[c.exam] = true; });
    [['ls-h-sat', 'SAT'], ['ls-h-ielts', 'IELTS'], ['ls-h-ap', null], ['ls-h-psy', null]].forEach(function (p) { var r = subs.querySelector('.ls-sub[aria-labelledby="' + p[0] + '"]'); if (r) r.style.display = !p[1] || exams[p[1]] ? 'none' : ''; });
    paintJia(page); paintFoot(page); paintContinue();
  }
  /* The JIA card (C-34): only with its switch on (D-3: where it leads is his to decide); dismissible for 30 days; no name or phone in any link */
  var JIA_KEY = 'jg.jia.hide', DAY = 864e5;
  function jiaHidden() { try { var t = +W.localStorage.getItem(JIA_KEY) || 0; return t > 0 && Date.now() - t < 30 * DAY; } catch (e) { return false; } }
  function paintJia(page) {
    var card = $('jg-jia'), sat = $('jg-c-sat_m') || $('jg-c-sat_rw'), x = w();
    if (!st.jia || !sat || jiaHidden()) { if (card) card.remove(); return; }
    if (!card) {
      card = D.createElement('aside'); card.id = 'jg-jia'; card.setAttribute('data-no-i18n', '');
      card.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-jg=jiano]')) { try { W.localStorage.setItem(JIA_KEY, String(Date.now())); } catch (er) {} card.remove(); } });
    }
    var url = /^https:\/\//.test(st.jiaUrl || '') ? st.jiaUrl : null;
    card.innerHTML = '<p>' + esc(x.jia) + '</p>' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(x.jiaGo) + '</a>' : '') + '<button class="dg-link" type="button" data-jg="jiano">' + esc(x.jiaNo) + '</button>';
    page.insertBefore(card, sat);
  }
  /* the non-affiliation line (C-35, §9.3) at the foot of the tab */
  function paintFoot(page) {
    var f = $('jg-lx-foot');
    if (!f) { f = D.createElement('p'); f.id = 'jg-lx-foot'; f.className = 'jg-foot'; f.setAttribute('data-no-i18n', ''); page.appendChild(f); }
    f.textContent = w().foot;
  }
  /* Home's "Continue": today's lesson, else the first course's next lesson; the design's sample stays when she has none */
  function nextUp() {
    var found = null;
    st.courses.forEach(function (c) { cards(c).forEach(function (it) { if (!found && it.l.task_id && it.l.state !== 'done') found = { id: it.l.id, title: it.l.title }; }); });
    if (found) return found;
    var c0 = null;                                                          // P16 [p15#8]: the course she last worked in (last_at), else the first
    for (var i = 0; i < st.courses.length; i++) { var c = st.courses[i], t = c.current && c.last_at ? Date.parse(c.last_at) : NaN; if (c.current && (!c0 || (t === t && !(c0.last_at && Date.parse(c0.last_at) >= t)))) c0 = c; }
    return c0 ? c0.current : null;
  }
  function paintContinue() {
    var b = $('dash-cta'), n = nextUp(), t = b && b.querySelector('b');
    if (!t || !n) return;
    t.setAttribute('data-no-i18n', ''); if (t.textContent !== n.title) t.textContent = n.title;
  }
  function load(force) {
    var l = lang();
    if (st.busy || (!force && st.lang === l && st.state === 'ready')) { paintTab(); return st.p || Promise.resolve(); }   // P7f: a caller can wait for it
    st.busy = true;
    return (st.p = fetch('/api/v1/lessons?lang=' + encodeURIComponent(l), { headers: { 'x-jg-uid': B.uid }, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) {
        st.busy = false;
        if (!j || !Array.isArray(j.courses)) { st.state = 'failed'; st.courses = []; paintTab(); return; }
        st.state = 'ready'; st.lang = l; st.jia = j.jia_card === true; st.jiaUrl = typeof j.jia_url === 'string' ? j.jia_url : null;
        st.courses = j.courses.filter(function (c) { return c && typeof c.id === 'string' && Array.isArray(c.sections); });
        paintTab();
      }));
  }

  /* ---------- 2. a lesson ---------- */
  var ls = { id: null, view: null, step: 0, lvl: null, run: null, loading: false, utOn: false };
  function courseOf(id) { for (var i = 0; i < st.courses.length; i++) if (cards(st.courses[i]).some(function (it) { return it.l.id === id; })) return st.courses[i]; return null; }
  function player() { return $('ls-player'); }
  function rd() {
    var p = player(), r = p && p.querySelector('.jg-rd-host');
    if (p && !r) { r = D.createElement('div'); r.className = 'jg-rd-host'; r.setAttribute('data-no-i18n', ''); p.appendChild(r); }
    return r;
  }
  function openLesson(id, card) {
    var c = courseOf(id), detail = $('ls-detail');
    if (!detail) return;
    var lk = look(c ? c.id : 'math'), all = c ? cards(c) : [], at = all.findIndex(function (it) { return it.l.id === id; }), l = at >= 0 ? all[at].l : { title: '', minutes: 0 };
    var ti = lk.teacher ? lk.teacher[1] : 0, ls0 = []; for (var k = 0; k <= ti; k++) ls0.push({ t: l.title, m: l.minutes, p: 0, about: '' });
    /* the design's own page, out of the card (D:013:212); without it (an older design file) the page is shown as it is */
    if (detail.hidden && typeof W.JIA_openDetail === 'function' && card) W.JIA_openDetail(card, { key: lk.teacher ? lk.teacher[0] : (c ? c.id : 'math'), course: c ? c.title : '', img: lk.img, g: lk.g, ink: lk.ink, sh: lk.sh, lessons: ls0 }, ti);
    else if (detail.hidden) detail.hidden = false;
    detail.classList.add('jg-lx'); css(); unitMode(false);
    ls.id = id; ls.view = null; ls.step = 0; ls.run = null; ls.lvl = null;
    paintHead(c, l, null);
    var host = rd(); if (host) host.innerHTML = '<div class="jg-rd"><p class="jg-sub">' + esc(w().loading) + '</p></div>';
    fetchLesson(id).then(function (v) {
      if (ls.id !== id) return;
      if (!v) { if (host) host.innerHTML = '<div class="jg-rd"><p class="jg-sub">' + esc(w().failed) + '</p><button class="dg-go" type="button" data-jg="reopen">' + esc(w().retry) + '</button></div>'; return; }
      ls.view = v; ls.lvl = v.level || null;
      if (touched(c, v.progress && v.progress.opened_at)) paintContinue();    // P16 [p15#8]: a lesson opened the first time is her latest
      paintHead(c, l, v); paintRun(); paintStep();
    });
  }
  /* P16 [p15#8] (the integration's walk: right after a Listening lesson was opened and passed, Home's Continue still named SAT Math lesson 1
   * until a reload): the server moves a course's last_at when she opens one of its lessons the first time (its opened_at), answers a piece
   * or first passes it (lesson_progress.updated_at); the page moves its copy the same way (a pass reads the list again). `at` true: now,
   * after every last_at it knows. True when it moved (the caller repaints Continue) */
  function touched(c, at) {
    var t = at === true ? Date.now() : at ? Date.parse(at) : NaN; if (!c || t !== t) return false;
    if (at === true) st.courses.forEach(function (o) { var u = o !== c && o.last_at ? Date.parse(o.last_at) : NaN; if (u === u && u >= t) t = u + 1; });
    if (c.last_at && Date.parse(c.last_at) >= t) return false;
    c.last_at = new Date(t).toISOString(); return true;
  }
  function fetchLesson(id) {
    return fetch('/api/v1/lessons/' + encodeURIComponent(id) + '?lang=' + encodeURIComponent(lang()), { headers: { 'x-jg-uid': B.uid }, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) { return j && j.lesson && Array.isArray(j.lesson.pieces) ? j : null; });
  }
  /* the page's own lines: its title, the course and section, the unit's goal and the level; the teacher row (D19 placeholder, else the team) */
  function paintHead(c, l, v) {
    var x = w(), L = v && v.lesson, lt = $('ls-lt'), desc = $('ls-desc'), course = $('ls-course'), h3 = $('ls-h3');
    if (lt) { lt.setAttribute('data-no-i18n', ''); lt.textContent = L ? L.title : l.title; }
    /* P16: an AP course's one section is named as the course ("AP Physics 1 · AP Physics 1"): the section only when it is not the course's name */
    if (course) { course.setAttribute('data-no-i18n', ''); course.textContent = (L ? L.course_title + (L.section.title && L.section.title !== L.course_title ? ' · ' + L.section.title : '') : c ? c.title : ''); }
    if (h3) { h3.setAttribute('data-no-i18n', ''); h3.textContent = L ? L.course_title : c ? c.title : ''; }
    if (desc) { desc.setAttribute('data-no-i18n', ''); desc.innerHTML = L ? esc(L.unit.goal || L.unit.title) + (v.level ? '<span class="jg-lvl" style="margin-top:12px">' + esc(L.unit.title) + ' · ' + esc(x.lv[v.level]) + dots(v.level) + '</span>' : '') : ''; }
    var av = $('ls-av'), row = av && av.parentElement, lk = look(c ? c.id : 'math');
    if (row && !lk.teacher) {   /* no placeholder teacher for this subject: the lesson is the team's own (R6), never an invented name */
      row.style.display = ''; av.style.display = ''; av.textContent = 'JG'; $('ls-tname').parentElement.style.display = ''; $('ls-tname').textContent = x.team; $('ls-trole').textContent = '';
      row.style.cursor = ''; ['role', 'tabindex', 'aria-label'].forEach(function (a) { row.removeAttribute(a); });
    }
  }
  function paintRun() {
    var list = $('ls-list'), c = ls.view && courseOf(ls.id), x = w();
    if (!list || !c) return;
    var n = ls.view.lesson.test.n;
    list.setAttribute('data-no-i18n', '');
    var all = cards(c);
    list.innerHTML = all.map(function (it, i) {
      var l = it.l, done = l.state === 'done' || (l.id === ls.id && ls.view.progress.passed), open = l.id === ls.id, on = open && !ls.utOn;   // P8 item 4: a unit test open is its own row's
      return '<li class="ls-item' + (done ? ' done' : '') + (on ? ' on' : '') + '" data-jg-id="' + esc(l.id) + '" data-jg-row="lesson" tabindex="0" role="button"><span class="ls-ino">' + (done ? CHECK : l.n) + '</span><span class="ls-itt">' + esc(l.title) + '</span><span class="ls-itd">' + esc(x.min(l.minutes)) + '</span></li>'
        + '<li class="ls-item' + (done ? ' done' : '') + '" data-jg-id="' + esc(l.id) + '" data-jg-row="test" tabindex="0" role="button"><span class="ls-ino">' + (done ? CHECK : TESTIC) + '</span><span class="ls-itt">' + esc(l.writing ? x.writeRow : l.speaking ? x.speakRow : x.test) + '</span><span class="ls-itd">' + esc(l.writing || l.speaking ? '' : open ? x.qs(n) : l.test_n ? x.qs(l.test_n) : '') + '</span></li>'   // P7: a Writing lesson's row is her paragraph; P8: a Speaking lesson's is her practice
        + unitRow(it, all[i + 1]);                                             // P7f: the unit's test after its last lesson
    }).join('');
  }
  /* P7f (SPEC-lessons §5.2, §12.5 item 1): the unit test's row after the unit's last lesson, from GET /api/v1/lessons units[].unit_test:
   * offered, its true count (the server's n); not yet, why in her words (after the lessons, from <day>, again tomorrow, Puxta), not a button */
  var UT_IC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.5h6v3H9zM6.5 5h11v15.5h-11zM9.5 11h5M9.5 15h5"/></svg>';
  function unitRow(it, nx) {
    var u = it.u, o = u && u.unit_test, x = w(); if (!o || (nx && nx.u === u)) return '';
    var done = !o.offer && o.why === 'mastered', meta = o.offer ? x.qs(o.n | 0) : o.why === 'wait' && o.on ? x.utFrom(dayText(o.on)) : x.utWhy[o.why] || '';
    var on = ls.utOn && ls.ut && ls.ut.id === u.id;                          // P8 item 4: the open unit test's row is the highlighted one
    return '<li class="ls-item jg-ut' + (done ? ' done' : '') + (o.offer ? '' : ' jg-utoff') + (on ? ' on' : '') + '" data-jg-unit="' + esc(u.id) + '"' + (o.offer ? ' tabindex="0" role="button"' : ' aria-disabled="true"') + '><span class="ls-ino">' + (done ? CHECK : UT_IC) + '</span><span class="ls-itt">' + esc(x.utRow) + '</span><span class="ls-itd">' + esc(meta) + '</span></li>';
  }
  function openUnit(id) {
    var c = ls.view && courseOf(ls.id), all = c ? cards(c) : [], u = null, next = null, seen = false;
    all.forEach(function (it) { if (it.u && it.u.id === id) { u = it.u; seen = true; } else if (seen && !next) next = it.l; });
    var o = u && u.unit_test; if (!o || !o.offer) return;
    ls.ut = { id: u.id, title: u.title, n: o.n | 0, next: next }; ls.step = 'ut'; ls.run = null;
    unitMode(true); paintUnitHead(u.id); paintRun(); paintStep();
  }
  /* P8 items 1 and 4: while a unit test's first screen, run or result is open the page is the unit test's: its own title, the unit's section,
   * goal and level; no teacher row and no "Ask Jamol about this lesson" (they belong to the lesson); its row highlighted in the run list.
   * The lesson's page comes back with the lesson (its row in the run list, another lesson, the next lesson). */
  function unitMode(on) { var d = $('ls-detail'); ls.utOn = !!on; if (d) d.classList.toggle('jg-ut-on', !!on); }
  function unitById(id) {
    for (var i = 0; i < st.courses.length; i++) for (var j = 0; j < st.courses[i].sections.length; j++) {
      var s = st.courses[i].sections[j], us = s.units || [];
      for (var k = 0; k < us.length; k++) if (us[k].id === id) return { c: st.courses[i], s: s, u: us[k] };
    }
    return null;
  }
  function paintUnitHead(id) {
    var f = unitById(id), x = w(), lt = $('ls-lt'), desc = $('ls-desc'), course = $('ls-course'); if (!f) return;
    if (lt) { lt.setAttribute('data-no-i18n', ''); lt.textContent = x.utHead(f.u.title); }
    if (course) { course.setAttribute('data-no-i18n', ''); course.textContent = f.c.title + ' · ' + f.s.title; }
    if (desc) { desc.setAttribute('data-no-i18n', ''); desc.innerHTML = esc(f.u.goal || f.u.title) + (f.u.level ? '<span class="jg-lvl" style="margin-top:12px">' + esc(f.u.title) + ' · ' + esc(x.lv[f.u.level]) + dots(f.u.level) + '</span>' : ''); }
  }
  function leaveUnit() {
    if (!ls.utOn) return;
    unitMode(false);
    var c = courseOf(ls.id), it = c ? cards(c).filter(function (a) { return a.l.id === ls.id; })[0] : null;
    paintHead(c, it ? it.l : { title: '', minutes: 0 }, ls.view); paintRun();
  }
  /* the unit test runs through the server's quiz (public/runtime/jg-checks.js quiz(): mode unit_test and its unit; keys never here) */
  function startUnitTest() {
    var v = ls.view, ut = ls.ut, x = w(), host = rd(); if (!v || !ut || !host || !W.JG_CHECKS || typeof W.JG_CHECKS.quiz !== 'function') return;
    var c = courseOf(ls.id), lk = look(c ? c.id : v.lesson.course), id = ls.id;
    host.innerHTML = '<div class="jg-rd jg-run"><p class="jg-role">' + esc(x.utHead(ut.title)) + '</p><div class="jg-qbox"></div></div>';
    var box = host.firstChild.querySelector('.jg-qbox'); ls.step = 'utrun'; ls.run = null;
    var task = { id: 'unit:' + ut.id, mode: 'unit_test', unit: ut.id, quiz: lk.quiz, verification: 'quiz', coins: 20, title: ut.title };
    W.JG_CHECKS.quiz(task, box, { esc: esc, label: x.utRow, head: function (n, m) { return x.utRow + ' · ' + n + '/' + m; }, words: x.quiz, finish: function (proof, o) {
      var res = (o && o.res) || {}, E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {}
      load(true).then(function () { if (ls.id !== id || ls.ut !== ut) return; if (ls.utOn) paintUnitHead(ut.id); paintRun(); unitResult(res); });   // the list read again: its row says why it is closed now (P8: and the unit's level as it is now)
    } });
  }
  /* its result card (SPEC-lessons §5.3): the score and the coins the server paid (none for a fail; a second pass, none again), the skill line
   * the server wrote with the level's dots, what comes next; a fail says when it opens again (once a day) */
  function unitResult(r) {
    var host = rd(), x = w(), ut = ls.ut; if (!host || !ut) return;
    var right = r.right | 0, of = r.of | 0, pays = typeof r.pays === 'number' ? r.pays | 0 : 0, head = x.utRow + ': ' + right + '/' + of;
    var one = r.pass ? head + ' ✓ · ' + (pays > 0 ? x.utCoins(pays) : x.utPaid) : head + ' · ' + x.utNoCoins(Math.ceil(2 * of / 3));
    var third = !r.pass ? x.utAgain : ut.next ? x.utNext(ut.next.title) : x.allDone;
    ls.step = 'res';
    host.innerHTML = '<div class="jg-rd jg-res"><p class="jg-res-l">' + esc(one) + '</p><p class="jg-res-l jg-why">' + esc(r.line || x.same) + dots(r.level || '') + '</p><p class="jg-res-l">' + esc(third) + '</p>'
      + (r.pass && ut.next ? '<button class="dg-go" type="button" data-jg="utnext">' + esc(x.nextLesson) + '</button>' : '') + '<button class="dg-link" type="button" data-jg="enough">' + esc(x.enough) + '</button></div>';
  }
  function onList(e) {
    var ur = e.target.closest ? e.target.closest('.ls-item[data-jg-unit]') : null;   // P7f: the unit test's row
    if (ur && ls.id) { e.stopPropagation(); openUnit(ur.getAttribute('data-jg-unit')); var s0 = $('ls-scroll'); if (s0 && s0.scrollTo) s0.scrollTo({ top: 0 }); return; }
    var li = e.target.closest ? e.target.closest('.ls-item[data-jg-id]') : null;
    if (!li || !ls.id) return;
    e.stopPropagation();
    var id = li.getAttribute('data-jg-id');
    // P8d (the teen re-check of 14 Oct): after a miss (the server's progress.missed) the Test row goes back to the lesson first, its first part
    if (id === ls.id) { leaveUnit(); var miss = !!(ls.view && ls.view.progress && ls.view.progress.missed); ls.step = li.getAttribute('data-jg-row') === 'test' ? (miss ? 1 : qPieces().length + 1) : 0; paintStep(); }   // P8: the lesson's page again
    else openLesson(id, null);
    var sc = $('ls-scroll'); if (sc && sc.scrollTo) sc.scrollTo({ top: 0 });
  }
  function qPieces() { return ls.view ? ls.view.lesson.pieces : []; }
  function seg(k) {
    var P = qPieces(); if (!P.length) return '';
    return '<div class="jg-seg" aria-hidden="true">' + P.map(function (p, i) { return '<i class="' + (i + 1 < k ? 'done' : i + 1 === k ? 'on' : '') + '"></i>'; }).join('') + '<span class="jg-seg-n">' + Math.min(k, P.length) + '/' + P.length + '</span></div>';
  }
  /* step 0: the first screen; 1..n: piece n; n+1: the test's screen; 'run': the test running; 'res': the result card */
  /* P15 (VIDEO_LESSONS): after each step is drawn, the clips are mounted in it (jg-video.js keeps a playing one playing) */
  function paintStep() { paintStep0(); if (W.JG_VIDEO && ls.view) W.JG_VIDEO.mount(rd(), ls.view.lesson, ls.id); }
  function paintStep0() {
    var host = rd(), v = ls.view, x = w();
    if (W.JG_LISTEN) setTimeout(W.JG_LISTEN.sync, 0);                      // P15: a clip whose player left the screen stops
    if (!host || !v) return;
    var L = v.lesson, P = L.pieces, s = ls.step;
    if (s === 'ut' && ls.ut) {                                                 // P7f: the unit test's first screen
      host.innerHTML = '<div class="jg-rd jg-test"><p class="jg-role">' + esc(x.utHead(ls.ut.title)) + '</p><p class="jg-sub">' + esc(x.utPlan(ls.ut.n, Math.ceil(2 * ls.ut.n / 3))) + '</p>'
        + '<button class="dg-go" type="button" data-jg="unittest">' + esc(x.toTest(ls.ut.n)) + '</button></div>';
      return;
    }
    if (s === 0) {
      host.innerHTML = '<div class="jg-rd jg-first"><p class="jg-role">' + esc(L.section.title + ' · ' + L.unit.title) + '</p>'
        + '<p class="jg-sub">' + esc(x.min(L.minutes) + ' · ' + (L.writing ? x.wplan(P.length) : L.speaking ? x.splan : x.plan(P.length, L.test.n))) + '</p>'
        + (v.progress.passed ? '<p class="jg-lvl">' + esc(x.done) + '</p>' : '')
        + '<button class="dg-go" type="button" data-jg="start">' + esc(v.progress.passed ? x.read : x.start) + '</button>'
        + (L.test.test_out && L.format !== 'video' ? '<button class="dg-link" type="button" data-jg="testout">' + esc(x.testout) + '</button>' : '')
        + (L.recording && W.JG_VIDEO ? W.JG_VIDEO.slot(L.recording, ls.id) : '') + '</div>';   // P15: the full recording under the first screen, optional
      return;
    }
    if (s >= 1 && s <= P.length) {
      var p = P[s - 1], q = p.question, a = p.answered, Lz = W.JG_LISTEN;
      /* P15 (IELTS Listening, public/runtime/jg-listening.js, loaded with LISTENING on): the piece's clip under its text (one counted replay),
       * a typed gap in place of options, the transcript after the answer */
      host.innerHTML = '<div class="jg-rd jg-piece">' + seg(s) + '<p class="jg-role">' + esc(x.role[p.role] || '') + '</p><div class="jg-body">' + esc(p.body) + '</div>'
        + (p.video && W.JG_VIDEO ? W.JG_VIDEO.slot(p.video, ls.id) : '')   // P15: the piece's clip under its text; the text reads without it
        + (p.audio && Lz ? Lz.player(p.audio, 'p:' + ls.id + ':' + s) : '')
        + (q ? '<div class="jg-q">' + ins(q) + prompt(q.prompt) + (q.typed && Lz ? Lz.typed(q, a ? { text: a.text || '', ok: !!a.ok } : null) : '<div class="dg-opts">' + q.options.map(function (o) {
          var cls = a ? (o.t === a.right.t ? ' ok' : o.t === a.picked ? ' bad' : '') : '';
          return '<button class="dg-opt' + cls + '" type="button" data-t="' + esc(o.t) + '"' + (a ? ' disabled' : '') + '>' + esc(o.text) + '</button>';
        }).join('') + '</div>') + (a ? resHtml(a) + (a.script && Lz ? Lz.script(a.script) : '') : '<button class="dg-link" type="button" data-jg="dunno">' + esc(x.dunno) + '</button>') + '</div>' : '')
        + (!q || a ? '<button class="dg-go" type="button" data-jg="next">' + esc(ls.run && s === P.length ? x.toRun : L.writing && s === P.length ? x.toWrite : L.speaking && s === P.length ? x.toSpeak : x.next) + '</button>' : '') + '</div>';
      return;
    }
    if (s === P.length + 1 && L.writing) return write(host);   // P7: no test: her paragraph (public/runtime/jg-writing.js)
    if (s === P.length + 1 && L.speaking) return speak(host);   // P8: no test: the speaking practice (public/runtime/jg-speaking.js)
    if (s === P.length + 1) {
      var vw = W.JG_VIDEO && !W.JG_VIDEO.open(L);                                // P15 (C-14): the test waits for 80 % of each clip
      host.innerHTML = '<div class="jg-rd jg-test">' + seg(P.length + 1) + '<p class="jg-role">' + esc(x.test) + '</p><p class="jg-sub">' + esc(x.testLine) + '</p>'
        + (vw ? '<p class="jgv-wait" role="status">' + esc(W.JG_VIDEO.gate(L, lang())) + '</p>' : '')
        + '<button class="dg-go" type="button" data-jg="test"' + (W.JG_VIDEO ? ' data-jgv-gate' : '') + (vw ? ' disabled aria-disabled="true"' : '') + '>' + esc(x.toTest(L.test.n)) + '</button></div>';
    }
  }
  /* P7: a question's prompt, its bulleted notes as a list (public/runtime/jg-checks.js JG_CHECKS.prompt); as before without that file */
  function prompt(t) { return W.JG_CHECKS && typeof W.JG_CHECKS.prompt === 'function' ? W.JG_CHECKS.prompt(t, 'jt-q') : '<p class="jt-q">' + esc(t) + '</p>'; }
  /* P14: a piece's question's instruction just above it, in the diagnostic's hint line (JG_CHECKS.ins; the test is JG_CHECKS.quiz's own) */
  function ins(q) { var C = W.JG_CHECKS; return C && typeof C.ins === 'function' ? C.ins(q) : ''; }
  /* P7: a Writing lesson's task, mounted where its test screen would be (jg-writing.js, loaded only with WRITING on) */
  function write(host) {
    var id = ls.id, L = ls.view.lesson;
    if (!W.JG_WRITING) { host.innerHTML = ''; return; }
    host.innerHTML = '<div class="jg-rd jg-wr"></div>';
    W.JG_WRITING.mount(host.firstChild, { id: id, lang: lang(), next: L.next || null,
      back: function () { if (ls.id === id) { ls.step = 1; paintStep(); } },
      nextLesson: function () { if (ls.id === id && L.next) openLesson(L.next.id, null); },
      enough: function () { var b = $('ls-back'); if (b) b.click(); },
      done: function () { if (ls.id !== id) return; fetchLesson(id).then(function (v2) { if (ls.id !== id || !v2) return; ls.view = v2; paintRun(); }); var E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {} } });
  }
  /* P8: a Speaking lesson's practice, mounted where its test screen would be (jg-speaking.js, loaded only with SPEAKING on; nothing is recorded) */
  function speak(host) {
    var id = ls.id, L = ls.view.lesson;
    if (!W.JG_SPEAKING) { host.innerHTML = ''; return; }
    host.innerHTML = '<div class="jg-rd jg-sp"></div>';
    W.JG_SPEAKING.mount(host.firstChild, { id: id, lang: lang(), next: L.next || null,
      back: function () { if (ls.id === id) { ls.step = 1; paintStep(); } },
      nextLesson: function () { if (ls.id === id && L.next) openLesson(L.next.id, null); },
      enough: function () { var b = $('ls-back'); if (b) b.click(); },
      done: function () { if (ls.id !== id) return; fetchLesson(id).then(function (v2) { if (ls.id !== id || !v2) return; ls.view = v2; paintRun(); }); var E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {} } });
  }
  function resHtml(a) {
    var x = w();
    return '<div class="jd-res' + (a.ok ? '' : ' jg-bad') + '"><p><b>' + esc(a.ok ? x.right : x.rightIs(a.right.text)) + '</b></p>' + (a.why ? '<small>' + esc(x.why) + '</small><p>' + esc(a.why) + '</p>' : '') + '</div>';
  }
  function answer(n, body) {
    var p = qPieces()[n - 1]; if (!p || p.answered || p.busy) return;
    p.busy = true;
    [].forEach.call(rd().querySelectorAll('.dg-opt,[data-jg=dunno]'), function (b) { b.disabled = true; });
    fetch('/api/v1/lessons/' + encodeURIComponent(ls.id) + '/piece?lang=' + encodeURIComponent(lang()), { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid }, credentials: 'same-origin', body: JSON.stringify(body) })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) {
        p.busy = false;
        if (!j || !j.right) { paintStep(); return; }
        p.answered = { ok: !!j.ok, right: j.right, why: j.why || '', picked: body.token || null, text: body.text || '', script: j.script || '' };   // P15: her typed answer, the transcript
        ls.view.progress.answered++; if (touched(courseOf(ls.id), true)) paintContinue();   // P16 [p15#8]
        paintStep(); showRes(rd());
      });
  }
  /* P16 [p16#10] (a 390 px phone: after the tap the feedback and its next button sat below the fold): once an answer is graded, its result
   * and the button under it scroll into view, as much as fits, the result's top kept on screen. Only after an answer: nothing moves at rest */
  function showRes(root) {
    var a = root && root.querySelector ? root.querySelector('.jd-res') : null; if (!a || !a.getBoundingClientRect) return;
    var b = root.querySelector('[data-jg=next]') || a, sc = a.parentNode, hi = 0, lo = W.innerHeight || 0;
    while (sc && sc.nodeType === 1 && !(sc.scrollHeight > sc.clientHeight && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentNode;
    if (sc && sc.nodeType === 1) { var r = sc.getBoundingClientRect(); hi = Math.max(0, r.top); lo = Math.min(lo, r.bottom); } else sc = null;
    var top = a.getBoundingClientRect().top, bot = b.getBoundingClientRect().bottom, dy = Math.min(bot - lo + 16, top - hi - 16);
    if (bot <= lo || dy <= 0) return;
    var o = { top: dy, behavior: W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' };
    try { if (sc) sc.scrollBy(o); else W.scrollBy(o); } catch (e) { if (sc) sc.scrollTop += dy; }
  }
  function onReader(e) {
    var t = e.target.closest ? e.target.closest('[data-jg],.dg-opt[data-t],.jgli-send') : null;
    if (!t || !ls.view) return;
    var k = t.getAttribute('data-jg'), P = qPieces();
    if (t.classList.contains('jgli-send')) { var tx = !t.disabled && W.JG_LISTEN ? W.JG_LISTEN.text(t.parentNode) : ''; if (tx && ls.step >= 1 && ls.step <= P.length) answer(ls.step, { n: P[ls.step - 1].n, text: tx }); return; }   // P15: a typed gap sent
    if (t.classList.contains('dg-opt') && !k) { if (ls.step >= 1 && ls.step <= P.length) answer(ls.step, { n: P[ls.step - 1].n, token: t.getAttribute('data-t') }); return; }
    if (k === 'start') { ls.step = P.length ? 1 : P.length + 1; paintStep(); }
    else if (k === 'next') { if (ls.run && ls.step === P.length) return resume(); ls.step++; paintStep(); }
    else if (k === 'dunno') answer(ls.step, { n: P[ls.step - 1].n, dontknow: true });
    else if (k === 'testout') startTest('test_out');
    else if (k === 'test') startTest('test');
    else if (k === 'unittest') startUnitTest();                               // P7f
    else if (k === 'utnext' && ls.ut && ls.ut.next) openLesson(ls.ut.next.id, null);
    else if (k === 'back') { ls.step = 1; paintStep(); }
    else if (k === 'reopen') openLesson(ls.id, null);
    else if (k === 'nextlesson' && ls.view.lesson.next) openLesson(ls.view.lesson.next.id, null);
    else if (k === 'enough') { var b = $('ls-back'); if (b) b.click(); }
    else if (k === 'again') { ls.step = 1; ls.run = null; paintStep(); }
    var sc = $('ls-scroll'); if (sc && sc.scrollTo && k !== 'dunno') sc.scrollTo({ top: 0 });
  }

  /* ---------- 3. the test and the result card ---------- */
  function startTest(mode) {
    var v = ls.view, L = v && v.lesson, A = W.JG_API, E = W.JG_ENGINE, x = w();
    if (!L) return;
    /* today's scheduled lesson is today's task: the design's task sheet runs it, as before */
    if (mode === 'test' && L.test.task_id && A && typeof A.openTask === 'function' && E && E.cache && typeof E.tasks === 'function') {
      var list = E.tasks(E.cache.local_date) || [];
      for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === L.test.task_id) { A.openTask(i); return; }
    }
    var host = rd(); if (!host || !W.JG_CHECKS || typeof W.JG_CHECKS.quiz !== 'function') return;
    var c = courseOf(ls.id), lk = look(c ? c.id : L.course);
    host.innerHTML = '<div class="jg-rd jg-run">' + seg(qPieces().length + 1) + '<p class="jg-role">' + esc(x.test) + '</p><div class="jg-qbox"></div>' + (mode === 'test' ? '<button class="dg-link" type="button" data-jg="back">' + esc(x.back) + '</button>' : '') + '</div>';
    var run = host.firstChild, box = run.querySelector('.jg-qbox'), id = ls.id, before = ls.lvl;
    ls.run = mode === 'test' ? run : null; ls.step = 'run';
    var task = { id: 'lesson:' + id + ':' + mode, mode: mode, lesson: id, quiz: lk.quiz, verification: 'quiz', coins: 10, title: L.title };
    /* P7: the head in her words, "Test · 1/3" as the phone says it (it read "TEST · 1 OF 3": this reader is not the page dictionary's) */
    W.JG_CHECKS.quiz(task, box, { esc: esc, label: x.test, head: function (n, m) { return x.test + ' · ' + n + '/' + m; }, words: x.quiz, finish: function (proof, o) {
      var res = (o && o.res) || {}, pass = !!res.pass;
      if (pass) load(true);                                                    // P16 [p15#8]: the list read again (Continue: her next lesson, her latest course)
      fetchLesson(id).then(function (v2) {
        if (ls.id !== id) return;
        if (v2) { ls.view = v2; ls.lvl = v2.level || null; paintRun(); }
        result({ right: res.right | 0, of: res.of | 0, pass: pass, coins: pass ? (typeof res.pays === 'number' ? res.pays | 0 : 10) : 0, from: before, to: ls.lvl, mode: mode, homework: res.homework || null, fast: !!res.fast });   // P8c item 3: too fast is said   // P6b fix A: tomorrow's set, as the server sized it
      });
    } });
  }
  /* back to the lesson's pieces and on to the running test again, never ending it */
  function resume() { var host = rd(); if (host && ls.run) { host.innerHTML = ''; host.appendChild(ls.run); ls.step = 'run'; } }
  function levelLine(u, from, to) {
    var x = w();
    if (!to) return x.same;
    if (from === to) return x.kept(u, x.lv[to]);
    if (!from && to === 'started') return u + ': ' + x.lv.started;
    return x.moved(u, x.lv[from || 'started'], x.lv[to]);
  }
  function result(r) {
    var host = rd(), v = ls.view, x = w();
    if (!host || !v) return;
    // P7f: a C4 unit sets no set, except a B2 unit (its own C4-5 items): the result then carries tomorrow's set and the line names it
    // (the P7f integration: a set that holds none of this lesson's items, on_skill 0, is not "on this topic": a fifth pass of a day waits for a later set)
    // P16 (the P15 integrator's still open): "Ertaga: uy vazifasi" only when the server says a set is coming (r.homework); else the next lesson
    var L = v.lesson, third = r.pass ? (L.source === 'C4' && !(r.homework && r.homework.items) ? '' : L.next ? (!(r.homework && r.homework.items) ? x.utNext(L.next.title) : (r.homework.on_skill === 0 ? x.hw0 : x.hw) + ' · ' + x.upTo(r.homework.items) + ' · ~' + x.min(r.homework.minutes || r.homework.items)) : x.allDone) : x.again;   // P6b fix A: tomorrow's set, its true size (SPEC §5.3 line 3); P8d: said "up to" (the set is built tomorrow from what stands then: "10 savol" was promised and 8 came)
    ls.step = 'res'; ls.run = null;
    host.innerHTML = '<div class="jg-rd jg-res">'
      + '<p class="jg-res-l">' + esc(x.score(r.right, r.of, r.pass, r.coins, r.fast)) + '</p>'
      + '<p class="jg-res-l jg-why">' + esc(levelLine(L.unit.title, r.from || null, r.to || null)) + dots(r.to || '') + '</p>'
      + (third ? '<p class="jg-res-l">' + esc(third) + '</p>' : '')
      + (!r.pass ? '<button class="dg-go" type="button" data-jg="again">' + esc(r.mode === 'test_out' ? x.start : x.back) + '</button>'
        : L.next ? '<button class="dg-go" type="button" data-jg="nextlesson">' + esc(x.nextLesson) + '</button>' : '')
      + '<button class="dg-link" type="button" data-jg="enough">' + esc(x.enough) + '</button></div>';
  }

  /* ---------- start ---------- */
  function start() {
    var page = $('v-lessons'), detail = $('ls-detail'), list = $('ls-list'), cta = $('dash-cta');
    if (!page) return;
    load(false);
    new MutationObserver(function () { if (page.classList.contains('show')) load(true); }).observe(page, { attributes: true, attributeFilter: ['class'] });
    if (detail) {
      detail.addEventListener('click', function (e) { if (detail.classList.contains('jg-lx') && e.target.closest && e.target.closest('.jg-rd-host')) onReader(e); });
      /* a closed page leaves the reader mode, so the design's sample lessons open as drawn */
      /* P8c item 1 (the teen walk of 14 Oct): and the design's nodes this file wrote into are the dictionary's again, so a sample lesson opened
       * next reads in her language, not in the design's English */
      new MutationObserver(function () { if (detail.hidden && detail.classList.contains('jg-lx')) { detail.classList.remove('jg-lx'); unitMode(false); var h = player() && player().querySelector('.jg-rd-host'); if (h) h.remove(); ls.id = null; ls.view = null; ls.run = null;
        ['ls-lt', 'ls-course', 'ls-h3', 'ls-desc', 'ls-list'].forEach(function (k) { var el = $(k); if (el) el.removeAttribute('data-no-i18n'); }); } })
        .observe(detail, { attributes: true, attributeFilter: ['hidden'] });
    }
    if (list) list.addEventListener('click', function (e) { if (detail && detail.classList.contains('jg-lx')) onList(e); }, true);
    if (list) list.addEventListener('keydown', function (e) { if (detail && detail.classList.contains('jg-lx') && (e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.ls-item[data-jg-id],.ls-item[data-jg-unit]')) { e.preventDefault(); onList(e); } }, true);
    /* Home's "Continue" opens her real lesson (the design's opens its sample) */
    if (cta) cta.addEventListener('click', function (e) {
      var n = nextUp(); if (!n) return;
      e.stopImmediatePropagation(); e.preventDefault();
      if (W.JIA && W.JIA.go) W.JIA.go('lessons');
      setTimeout(function () { var c = D.querySelector('.jg-course [data-jg-id="' + n.id + '"]'); openLesson(n.id, c); }, 450);
    }, true);
  }
  W.JG_LESSONS_DESKTOP = { words: function (l) { return T[l || lang()] || T.en; }, state: function () { return { state: st.state, lang: st.lang, courses: st.courses.length, open: ls.id, step: ls.step }; },
    paint: paintTab, open: function (id) { openLesson(id, D.querySelector('.jg-course [data-jg-id="' + id + '"]')); }, result: result,
    list: function () { return st.courses; } };   // P8d: her real courses, for Ask Jamol (public/runtime/jg-jamol.js)
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
