/* Jamals Global runtime: the lessons part on the phone (P6 lane A5; SPEC-lessons §4.1, §5.2-§5.4, §8.3, §9.3, §10; the owner's 12 Oct 2026
 * "lessons va lesson h/w qism. IELTS/SAT/AP/ETC... dunyodagi eng mashxur tizimlardan ilhomlanishimiz kerak").
 * Loaded by src/server/pages.ts for a live, non-demo student on the phone, only with the lessons part on (LESSONS and the scheduler's switch), after
 * jg-real.js, which fetches GET /api/v1/lessons and hands this file the answer's `courses` (JG_LESSONS.courses). Not design code, and the
 * design's lines stay as drawn except one (public/d/student-mobile/js/009.js line 210, JG-PROD: window.JIA_lsOpen opens the design's own
 * lesson screen out of a card). What it draws, every word in en, uz (U+02BB, U+02BC) and ru, marked data-no-i18n:
 *  1. THE COURSE ROWS. One row a course (SAT Math, Matematika, Ingliz tili, …) in the design's own row and card (.ls-sub, .ls-card: number
 *     cover, illustration, minutes chip with a page icon for a text lesson, title, state), its header with its countable progress ("1/3")
 *     and a thin bar; above the Live row, where jg-real.js part 2b drew its row a subject. The design's SAT sample row folds when a real SAT
 *     course stands for it (and IELTS's when an IELTS course does); AP and Psychology samples stay (D19, C-11). The tab's header names her
 *     current course and lesson ("Davom eting: SAT Math · 2. …"), and the non-affiliation line stands at the tab's foot (C-35, §9.3).
 *  2. THE JIA CARD (C-34, D-3): one line on a SAT row, a near-black button, "not now" as plain text, hidden 30 days after a dismiss (this
 *     browser only); only when the server says jia_card (JIA_CARD, off until the owner answers D-3). No price, no timer, no personal data.
 *  3. THE LESSON SCREEN. A card opens the design's #ls-detail (its own open, its own morph, its back, its teacher row: the subject's
 *     placeholder teacher, D19), and its player slot holds the READER (GET /api/v1/lessons/<id>): a first screen with "Darsni boshlash" and,
 *     as plain text under it, "Bilaman — testni hozir yechaman" when the server offers the test-out; then one piece a screen ("1/3"), its
 *     text and its one question, answered in place (POST …/piece: the right option green, "Izoh" under it; "Bilmayman" is an answer too);
 *     then the test. The design's course list becomes the run: each lesson ("Darslik") and its "Test" under it, the current one marked.
 *  4. THE TEST (the test-out and the lesson's test): server-graded under tokens, keys never here; "Bilmayman" on every question; "Darsga
 *     qaytish" reopens the pieces without ending the test. THE ADAPTER (QUIZ below) speaks POST /api/v1/checks/quiz as it is (op start /
 *     answer / run / reveal / result) plus what lane A4a adds to it (SPEC §11.3): `mode` ('test_out' | 'test'), `lesson` and `dontknow`. A
 *     lesson that is today's task starts with its `task`, as the task sheet does.
 *  5. THE RESULT CARD (§5.3): three lines, each with its reason: the score and the coins; the skill line, the level before and after in
 *     her language with four dots (●●○○); what comes next. Then "Keyingi dars" (near-black) and "Bugunga yetarli" (plain). A failed
 *     test-out pays nothing and the lesson starts at piece 1.
 * window.JG_LESSONS: courses(answer), words(lang), dots(level), levelText(level, lang), resultLines(…), state(). tests/unit/jg-lessons.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_LESSONS) return;

  var LEGAL = {
    en: 'SAT, AP and Bluebook are trademarks of College Board. IELTS is jointly owned by the British Council, IDP IELTS and Cambridge University Press & Assessment. Jamals Global is not affiliated with or endorsed by them.',
    uz: 'SAT, AP va Bluebook — College Board savdo belgilari. IELTS British Council, IDP IELTS va Cambridge University Press & Assessment tashkilotlariga tegishli. Jamals Global ular bilan bogʻliq emas va ular tomonidan tasdiqlanmagan.',
    ru: 'SAT, AP и Bluebook — товарные знаки College Board. IELTS совместно принадлежит British Council, IDP IELTS и Cambridge University Press & Assessment. Jamals Global не связан с ними и не одобрен ими.'
  };
  var T = {
    en: { min: function (m) { return m + ' min'; }, done: '✓ Done', current: 'Up next', start: 'Start the lesson', cont: 'Continue', reread: 'Read it again',
      out: 'I know this — take the test now', plan: function (p, n, m) { return p + ' parts · a ' + n + '-question test · ~' + m + ' min'; }, passed: 'You passed this lesson',
      role: { idea: 'The idea', example: 'Worked example', trap: 'The trap', words: 'Words', read: 'Read', model: 'Model paragraph', format: 'On the test' },
      toWrite: 'Write your paragraph', writeRow: 'Write', toWriteBack: 'Back to my paragraph', wplan: function (p, m) { return p + ' parts · your own paragraph · ~' + m + ' min'; },
      toSpeak: 'Start speaking practice', speakRow: 'Speak', toSpeakBack: 'Back to my practice', splan: function (m) { return 'The card · 1 min to plan · 2 min to talk · ~' + m + ' min'; },   // P8: a Speaking lesson
      right: 'Right!', wrong: 'Not this time', rightIs: function (t) { return 'The answer: ' + t + '.'; }, why: 'Why:', dunno: 'I don’t know', next: 'Next', toTest: 'Go to the test', result: 'See the result',
      testWord: 'Test', back: 'Back to the lesson', toTestBack: 'Back to the test', coins: 'coins',
      noCoins: function (k) { return 'no coins (' + k + ' needed) · streak kept'; }, fast: 'too fast: not counted', paid: 'coins for this lesson already paid',
      lv: { started: 'Started', familiar: 'Familiar', proficient: 'Proficient', mastered: 'Mastered' },
      stays: function (s) { return s + ', no change'; }, noChange: 'Skills did not change', why2: '(passed on a second day)',
      tomorrow: function (hw) { return 'Tomorrow: homework' + (hw && hw.items ? ' · up to ' + hw.items + ' questions · ~' + (hw.minutes || hw.items) + ' min' : ''); },
      toNext: function (k, m) { return k + '/' + m + ' on this topic makes it Proficient'; }, nextIs: function (t) { return 'Next lesson: ' + t; }, courseDone: 'That was the last lesson of the course.',
      outFail: 'No problem: no coins and no miss counted. The lesson starts at part 1.', easier: 'The next try is one step easier.', again: 'Read the lesson once more and try again.',
      winH: 'Well done!', tryH: 'Good try', go: 'Next lesson', enough: 'Enough for today', retry: 'Try again', restart: 'Read the lesson again',
      lessonN: function (n, t) { return 'Lesson ' + n + ': ' + t; }, runHead: 'Lessons', lessonRow: 'Lesson', testRow: 'Test', qn: function (n) { return n === 1 ? '1 question' : n + ' questions'; },
      skill: 'Skill', contHead: 'Continue', loading: 'Loading…', failed: 'The lesson did not open. Check the internet and try again.', again2: 'Try again',
      moment: 'One moment, then try again.', rereadWait: function (s) { return 'Read the lesson once more: the test opens in ' + s + ' s.'; }, lastGo: 'No more tries today. New questions come tomorrow.',
      outNote: 'Know it: the lesson is done. Don’t: no problem, the lesson starts.',
      jia: 'Learn SAT with a JIA teacher: in Tashkent, in Andijan, or online with Online Premium. The first lesson is free.', jiaGo: 'Sign up', jiaX: 'Not now',
      jiaIelts: 'IELTS preparation with a Jamals mentor is part of Jamals Admissions Full Support.', jiaIeltsGo: 'Learn more',
      /* P7f: the unit test (SPEC-lessons §5.2, §12.5 item 1) */
      utRow: 'Unit test', utHead: function (t) { return 'Unit test: ' + t; }, utStart: 'Start the test', utNot: 'This unit test is not open right now.',
      utPlan: function (n, k) { return n + ' questions · only the first try counts · pass at ' + k + '/' + n; }, utPaid: 'coins for this unit already paid',
      utNoCoins: function (k) { return 'no coins (' + k + ' needed)'; }, utAgain: 'You can try again tomorrow.',
      utWhy: { lessons: 'After the lessons', mastered: 'Mastered ✓', today: 'Again tomorrow', items: 'No new questions yet' }, utFrom: function (d) { return 'from ' + d; },
      secLine: function (t, k, n) { return t + ' · ' + k + ' of ' + n + (n === 1 ? ' topic' : ' topics') + ' at Proficient'; } },
    uz: { min: function (m) { return m + ' daq'; }, done: '✓ Bajarildi', current: 'Navbatdagi', start: 'Darsni boshlash', cont: 'Davom etish', reread: 'Qayta oʻqish',
      out: 'Bilaman — testni hozir yechaman', plan: function (p, n, m) { return p + ' qism · ' + n + ' savollik test · ~' + m + ' daqiqa'; }, passed: 'Bu darsni oʻtgansiz',
      role: { idea: 'Gʻoya', example: 'Misol', trap: 'Tuzoq', words: 'Soʻzlar', read: 'Matn', model: 'Namuna', format: 'Testda' },
      toWrite: 'Xatboshingizni yozing', writeRow: 'Yozish', toWriteBack: 'Xatboshimga qaytish', wplan: function (p, m) { return p + ' qism · oʻz xatboshingiz · ~' + m + ' daqiqa'; },
      toSpeak: 'Gapirish mashqini boshlash', speakRow: 'Gapirish', toSpeakBack: 'Mashqqa qaytish', splan: function (m) { return 'Kartochka · 1 daqiqa reja · 2 daqiqa gapirish · ~' + m + ' daqiqa'; },
      right: 'Toʻgʻri!', wrong: 'Bu safar emas', rightIs: function (t) { return 'Toʻgʻri javob: ' + t + '.'; }, why: 'Izoh:', dunno: 'Bilmayman', next: 'Keyingisi', toTest: 'Testga oʻtish', result: 'Natijani koʻrish',
      testWord: 'Test', back: 'Darsga qaytish', toTestBack: 'Testga qaytish', coins: 'tanga',
      noCoins: function (k) { return 'tanga yoʻq (' + k + ' ta kerak edi) · streak saqlandi'; }, fast: 'juda tez: hisoblanmadi', paid: 'bu dars uchun tanga avval berilgan',
      lv: { started: 'Boshlandi', familiar: 'Tanish', proficient: 'Bilaman', mastered: 'Puxta' },
      stays: function (s) { return s + ' qoldi'; }, noChange: 'Koʻnikmalar oʻzgarmadi', why2: '(ikkinchi kun ham oʻtdingiz)',
      tomorrow: function (hw) { return 'Ertaga: uy vazifasi' + (hw && hw.items ? ' · ' + hw.items + ' tagacha savol · ~' + (hw.minutes || hw.items) + ' daqiqa' : ''); },
      toNext: function (k, m) { return 'Shu mavzudan ' + k + '/' + m + ' boʻlsa — Bilaman'; }, nextIs: function (t) { return 'Keyingi dars: ' + t; }, courseDone: 'Bu kursning oxirgi darsi edi.',
      outFail: 'Hech gap yoʻq: tanga ham, xato ham hisoblanmaydi. Dars 1-qismdan boshlanadi.', easier: 'Keyingi urinishda savollar bir qadam osonroq.', again: 'Darsni yana bir oʻqing va qayta urinib koʻring.',
      winH: 'Barakalla!', tryH: 'Yaxshi urinish', go: 'Keyingi dars', enough: 'Bugunga yetarli', retry: 'Qayta urinish', restart: 'Darsni qayta oʻqish',
      lessonN: function (n, t) { return n + '-dars: ' + t; }, runHead: 'Darslar', lessonRow: 'Darslik', testRow: 'Test', qn: function (n) { return n + ' ta savol'; },
      skill: 'Koʻnikma', contHead: 'Davom eting', loading: 'Yuklanmoqda…', failed: 'Dars ochilmadi. Internetni tekshirib, qayta urinib koʻring.', again2: 'Qayta urinish',
      moment: 'Bir lahza, keyin qayta urinib koʻring.', rereadWait: function (s) { return 'Darsni yana bir oʻqing: test ' + s + ' soniyadan keyin ochiladi.'; }, lastGo: 'Bugun boshqa urinish yoʻq. Ertaga yangi savollar keladi.',
      outNote: 'Bilsangiz — dars bajariladi. Bilmasangiz — hech gap yoʻq, dars boshlanadi.',
      jia: 'SATni JIA oʻqituvchisi bilan oʻrganing: Toshkentda, Andijonda yoki Online Premium bilan onlayn. Birinchi dars bepul.', jiaGo: 'Yozilish', jiaX: 'Hozir emas',
      jiaIelts: 'Jamals mentori bilan IELTSga tayyorgarlik Jamals Admissions Full Support tarkibida.', jiaIeltsGo: 'Batafsil',
      utRow: 'Mavzu testi', utHead: function (t) { return 'Mavzu testi: ' + t; }, utStart: 'Testni boshlash', utNot: 'Bu mavzu testi hozir ochiq emas.',
      utPlan: function (n, k) { return n + ' ta savol · faqat birinchi urinish hisoblanadi · ' + k + '/' + n + ' dan oʻtiladi'; }, utPaid: 'bu mavzu uchun tanga avval berilgan',
      utNoCoins: function (k) { return 'tanga yoʻq (' + k + ' ta kerak edi)'; }, utAgain: 'Ertaga yana urinib koʻrishingiz mumkin.',
      utWhy: { lessons: 'Darslardan keyin', mastered: 'Puxta ✓', today: 'Ertaga yana', items: 'Hozircha yangi savol yoʻq' }, utFrom: function (d) { return d + 'dan'; },
      secLine: function (t, k, n) { return t + ' · ' + n + ' mavzudan ' + k + ' tasi Bilaman darajasida'; } },
    ru: { min: function (m) { return m + ' мин'; }, done: '✓ Пройден', current: 'Следующий', start: 'Начать урок', cont: 'Продолжить', reread: 'Перечитать',
      out: 'Я это знаю — сразу к тесту', plan: function (p, n, m) { return p + ' части · тест из ' + n + ' вопросов · ~' + m + ' мин'; }, passed: 'Этот урок пройден',
      role: { idea: 'Идея', example: 'Пример', trap: 'Ловушка', words: 'Слова', read: 'Текст', model: 'Образец', format: 'На тесте' },
      toWrite: 'Написать свой абзац', writeRow: 'Письмо', toWriteBack: 'Вернуться к абзацу', wplan: function (p, m) { return p + ' части · ваш собственный абзац · ~' + m + ' мин'; },
      toSpeak: 'Начать практику говорения', speakRow: 'Говорение', toSpeakBack: 'Вернуться к практике', splan: function (m) { return 'Карточка · 1 мин на подготовку · 2 мин речи · ~' + m + ' мин'; },
      right: 'Верно!', wrong: 'В этот раз нет', rightIs: function (t) { return 'Правильный ответ: ' + t + '.'; }, why: 'Пояснение:', dunno: 'Не знаю', next: 'Дальше', toTest: 'К тесту', result: 'Результат',
      testWord: 'Тест', back: 'Вернуться к уроку', toTestBack: 'Вернуться к тесту', coins: 'монет',
      noCoins: function (k) { return 'без монет (нужно ' + k + ') · серия сохранена'; }, fast: 'слишком быстро: не засчитано', paid: 'монеты за этот урок уже начислены',
      lv: { started: 'Начато', familiar: 'Знакомо', proficient: 'Умею', mastered: 'Освоено' },
      stays: function (s) { return s + ', без изменений'; }, noChange: 'Навыки не изменились', why2: '(сдано и во второй день)',
      tomorrow: function (hw) { return 'Завтра: домашнее задание' + (hw && hw.items ? ' · до ' + hw.items + ' вопр. · ~' + (hw.minutes || hw.items) + ' мин' : ''); },
      toNext: function (k, m) { return k + ' из ' + m + ' по этой теме — и будет «Умею»'; }, nextIs: function (t) { return 'Следующий урок: ' + t; }, courseDone: 'Это был последний урок курса.',
      outFail: 'Ничего страшного: ни монет, ни ошибки не засчитано. Урок начинается с первой части.', easier: 'В следующей попытке вопросы будут на шаг легче.', again: 'Прочитайте урок ещё раз и попробуйте снова.',
      winH: 'Отлично!', tryH: 'Хорошая попытка', go: 'Следующий урок', enough: 'На сегодня хватит', retry: 'Попробовать снова', restart: 'Перечитать урок',
      lessonN: function (n, t) { return 'Урок ' + n + ': ' + t; }, runHead: 'Уроки', lessonRow: 'Урок', testRow: 'Тест',
      qn: function (n) { var a = n % 10, b = n % 100; return n + (a === 1 && b !== 11 ? ' вопрос' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? ' вопроса' : ' вопросов'); },
      skill: 'Навык', contHead: 'Продолжить', loading: 'Загрузка…', failed: 'Урок не открылся. Проверьте интернет и попробуйте ещё раз.', again2: 'Ещё раз',
      moment: 'Секунду, потом попробуйте снова.', rereadWait: function (s) { return 'Прочитайте урок ещё раз: тест откроется через ' + s + ' с.'; }, lastGo: 'Сегодня попыток больше нет. Завтра будут новые вопросы.',
      outNote: 'Знаете — урок засчитан. Не знаете — ничего страшного, урок начнётся.',
      jia: 'Изучайте SAT с преподавателем JIA: в Ташкенте, в Андижане или онлайн в Online Premium. Первый урок бесплатный.', jiaGo: 'Записаться', jiaX: 'Не сейчас',
      jiaIelts: 'Подготовка к IELTS с ментором Jamals входит в Jamals Admissions Full Support.', jiaIeltsGo: 'Подробнее',
      utRow: 'Тест по теме', utHead: function (t) { return 'Тест по теме: ' + t; }, utStart: 'Начать тест', utNot: 'Тест по этой теме сейчас закрыт.',
      utPlan: function (n, k) { return T.ru.qn(n) + ' · засчитывается только первая попытка · проходной ' + k + '/' + n; }, utPaid: 'монеты за эту тему уже начислены',
      utNoCoins: function (k) { return 'без монет (нужно ' + k + ')'; }, utAgain: 'Завтра можно попробовать ещё раз.',
      utWhy: { lessons: 'После уроков', mastered: 'Освоено ✓', today: 'Завтра снова', items: 'Пока нет новых вопросов' }, utFrom: function (d) { return 'с ' + d; },
      secLine: function (t, k, n) { return t + ' · ' + k + ' из ' + n + (n % 10 === 1 && n % 100 !== 11 ? ' темы' : ' тем') + ' на уровне «Умею»'; } }
  };
  /* P7f: a day in the page's words (the unit test's 'from 16 October'): '16 October', '16-oktabr', '16 октября' */
  var MON = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'], ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'] };
  function dayText(d, l) { var m = +String(d).slice(5, 7), n = +String(d).slice(8, 10); if (!m || !n) return String(d); l = MON[l] ? l : 'en'; return l === 'uz' ? n + '-' + MON.uz[m - 1] : n + ' ' + MON[l][m - 1]; }
  /* where the JIA card leads is the owner's D-3; the card ships off (JIA_CARD) until he answers. No personal data in the link. */
  var JIA_URL = 'https://jamals.uz/', JIA_HIDE_KEY = 'jg-jia-card-hidden', JIA_HIDE_MS = 30 * 864e5;
  /* the design's colours and illustration for a course row (the design's SAT and IELTS rows; the shelf's green for the rest) */
  var LOOK = {
    sat_m: { img: 'sat', g: ['#e0ecfa', '#c3daf4'], ink: '#214269', sh: 'rgba(33, 66, 105, .14)' }, sat_rw: { img: 'sat', g: ['#e0ecfa', '#c3daf4'], ink: '#214269', sh: 'rgba(33, 66, 105, .14)' },
    ielts_r: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)' }, ielts_w: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)' }, ielts_s: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)' },
    ielts_l: { img: 'ielts', g: ['#fbeedf', '#f5ddc2'], ink: '#694721', sh: 'rgba(105, 71, 33, .14)' },   // P15: IELTS Listening
    other: { img: 'backpack', g: ['#e6f5eb', '#cde9da'], ink: '#1e684a', sh: 'rgba(30, 104, 74, .14)' }
  };
  /* the subject's placeholder teacher (owner 4 Oct R6, D19, test phase): the design's SUBJECTS key and a lesson of that teacher's */
  var TEACH = { sat_m: ['sat', 0], sat_rw: ['sat', 2], ielts_r: ['ielts', 3], ielts_w: ['ielts', 3], ielts_s: ['ielts', 3], ielts_l: ['ielts', 3] };
  var LEVELS = ['started', 'familiar', 'proficient', 'mastered'];
  var PAGE = '<svg class="jgl-page" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8.5L19 6.5V22H6z"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';

  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function words(l) { return T[l || lang()] || T.en; }
  function $(id) { return D.getElementById(id); }
  function mark(el) { if (el) el.setAttribute('data-no-i18n', ''); return el; }
  /* P8c item 1: the design's own nodes of #ls-detail that a lesson writes into (and marks). The design's sample lessons write there too once
   * the screen is closed, in the design's English, which the page's dictionary translates only where the mark is gone */
  var SHARED = ['ls-course', 'ls-lt', 'ls-desc', 'ls-h3', 'ls-list'];
  function unmark() { SHARED.forEach(function (k) { var el = $(k); if (el) el.removeAttribute('data-no-i18n'); }); }
  function show(el, on) { if (!el) return; el.hidden = !on; el.style.display = on ? '' : 'none'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function need(n) { return Math.ceil(2 * n / 3); }                     // one pass line: two-thirds, rounded up (SPEC §5.2)
  function dots(level) { var k = LEVELS.indexOf(level) + 1; return '●●●●'.slice(0, k) + '○○○○'.slice(0, 4 - k); }
  function levelText(level, l) { return words(l).lv[level] + ' ' + dots(level); }
  function store(k, v) { try { if (v === undefined) return W.localStorage.getItem(k); W.localStorage.setItem(k, v); } catch (e) { return null; } return null; }

  /**
   * The result card's three lines (SPEC §5.3), each with its reason. `r` the quiz result ({pass, right, of, coins?, fast?, retry?, next?,
   * homework?: {items, minutes, on_skill?}}), `before`/`after` the skill's level before the sitting and after it (null: no row), `o`: {mode:
   * 'test' | 'test_out', homework: the course sets homework (C4 did not in phase 1; a result carrying `homework`, a B2 unit's, says it too),
   * next: the next lesson's title or null}.
   */
  function resultLines(r, before, after, unit, l, o) {
    var x = words(l), right = r.right | 0, of = r.of | 0, coins = typeof r.coins === 'number' ? r.coins | 0 : typeof r.pays === 'number' ? r.pays | 0 : r.pass ? 10 : 0;
    var head = x.testWord + ': ' + right + '/' + of;
    var one = r.fast ? head + ' · ' + x.fast : r.pass ? head + ' ✓ · ' + (coins > 0 ? '+' + coins + ' ' + x.coins : x.paid) : head + ' · ' + x.noCoins(need(of));   // P8: a lesson pays once; never "+0"
    var two, b = LEVELS.indexOf(before), a = LEVELS.indexOf(after);
    if (a > Math.max(b, 0) || (a === 0 && b < 0)) two = unit + ': ' + (a > 0 ? levelText(b < 0 ? 'started' : before, l) + ' → ' : '') + levelText(after, l) + (after === 'proficient' ? ' ' + x.why2 : '');
    else if (b >= 0) two = unit + ': ' + x.stays(levelText(before, l));
    else two = x.noChange;
    var three;
    if (!r.pass) three = o.mode === 'test_out' ? x.outFail : (r.retry === 'easier' || r.next === 'easier') ? x.easier : x.again;
    /* P16 (the P15 integrator's still open: "Ertaga: uy vazifasi" with no count stood on a DTM day, when no set comes): the line promises a set
     * only when the server says one is coming (r.homework, src/server/lessons/homework.ts hwTomorrow); else the next lesson, as for English */
    else if (r.homework && r.homework.items > 0) {          // P7f: an English B2 unit sets its own homework (C4-5): the result names it
      var hw = r.homework || null;
      // P8d (the teen re-check: "10 savol" promised, 8 came): the server counts tomorrow's set as things stand now, and it is built tomorrow
      // (today's set handed in later carries nothing over), so the count is said as "up to"
      three = x.tomorrow(hw) + (after === 'familiar' && hw && hw.on_skill > 0 ? '. ' + x.toNext(need(hw.on_skill), hw.on_skill) : '');
    } else three = o.next ? x.nextIs(o.next) : x.courseDone;
    /* P8d (the teen re-check of 14 Oct: «Darsni yana bir oʻqing va qayta urinib koʻring» sat above «Bugun boshqa urinish yoʻq»): the miss that
     * used the day's last try has one honest line, the card's "No more tries today", and no "try again" here */
    if (!r.pass && r.last && o.mode !== 'test_out') return [one, two];
    return [one, two, three];
  }

  /* ---------- 1. the course rows ---------- */
  var st = { courses: [], jia: false, lang: null, open: null };
  function look(id) { return LOOK[id] || LOOK.other; }
  function imgOf(id) { var I = W.JIA_IMG || {}; return I[look(id).img] || I.backpack || I.sat || ''; }
  function vars(k) { return '--g1:' + k.g[0] + ';--g2:' + k.g[1] + ';--ink2:' + k.ink + ';--sh:' + k.sh; }
  function lessonsOf(c) { var out = []; (c.sections || []).forEach(function (s) { (s.units || []).forEach(function (u) { (u.lessons || []).forEach(function (l) { out.push({ l: l, u: u, s: s }); }); }); }); return out; }
  function courseOf(id) { for (var i = 0; i < st.courses.length; i++) if (lessonsOf(st.courses[i]).some(function (x) { return x.l.id === id; })) return st.courses[i]; return null; }
  function jiaHidden() { var t = +store(JIA_HIDE_KEY); return t > 0 && Date.now() - t < JIA_HIDE_MS; }
  function jiaCard(c, x) {
    if (!st.jia || jiaHidden() || (c.exam !== 'SAT' && c.exam !== 'IELTS')) return '';
    var ielts = c.exam === 'IELTS';
    return '<div class="jgl-jia" role="note"><p>' + esc(ielts ? x.jiaIelts : x.jia) + '</p><a class="jgl-jia-go" href="' + JIA_URL + '" target="_blank" rel="noopener">' + esc(ielts ? x.jiaIeltsGo : x.jiaGo) + '</a>'
      + '<button class="jgl-jia-x" type="button">' + esc(x.jiaX) + '</button></div>';
  }
  function card(c, it, x) {
    var l = it.l, done = l.state === 'done', cur = l.state === 'current', meta = done ? x.done : cur ? x.current : it.s.title;
    var dur = (l.format === 'video' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>' : PAGE) + esc(x.min(l.minutes));
    return '<button class="ls-card' + (cur ? ' jgl-cur' : '') + '" type="button" data-jgl="' + esc(l.id) + '" aria-label="' + esc(l.n + '. ' + l.title + ', ' + x.min(l.minutes) + ', ' + meta) + '">'
      + '<span class="ls-cover"><span class="ls-num" aria-hidden="true">' + (l.n < 10 ? '0' : '') + l.n + '</span><img src="' + esc(imgOf(c.id)) + '" alt=""><span class="ls-dur">' + dur + '</span></span>'
      + '<span class="ls-body"><span class="ls-ttl">' + esc(l.title) + '</span><span class="ls-meta' + (done ? ' done' : '') + '">' + esc(meta) + '</span></span></button>';
  }
  function paintRows() {
    var subs = $('ls-subjects'), page = $('tv-lessons'), x = words(st.lang);
    if (!subs || !page) return;
    css();
    [].forEach.call(D.querySelectorAll('.jgl-course'), function (s) { if (!st.courses.some(function (c) { return s.id === 'jgl-c-' + c.id; })) s.parentNode.removeChild(s); });
    var live = $('ls-live-row'), anchor = (live && live.closest ? live.closest('section') : null) || subs, prev = null;
    st.courses.forEach(function (c) {
      var id = 'jgl-c-' + c.id, row = $(id), k = look(c.id), all = lessonsOf(c), pc = c.of > 0 ? Math.round(100 * c.done / c.of) : 0;
      if (!row) {
        row = D.createElement('section'); row.id = id; row.className = 'ls-sub jgl-course'; mark(row); row.setAttribute('style', vars(k));
        row.addEventListener('click', function (e) {
          var t = e.target;
          if (t.closest && t.closest('.jgl-jia-x')) { store(JIA_HIDE_KEY, String(Date.now())); [].forEach.call(D.querySelectorAll('.jgl-jia'), function (j) { j.parentNode.removeChild(j); }); return; }
          var cd = t.closest ? t.closest('.ls-card[data-jgl]') : null; if (cd) openLesson(cd.getAttribute('data-jgl'), cd);
        });
      }
      anchor.parentNode.insertBefore(row, prev ? prev.nextSibling : anchor);
      row.innerHTML = '<div class="ls-head ls-pad"><span class="ls-ic" aria-hidden="true"><img src="' + esc(imgOf(c.id)) + '" alt=""></span><h2>' + esc(c.title) + '</h2><span class="ls-n">' + c.done + '/' + c.of + '</span></div>'
        + '<span class="ls-bar jgl-cbar" aria-hidden="true"><i style="width:' + pc + '%"></i></span>' + jiaCard(c, x)
        + '<div class="ls-row">' + all.map(function (it) { return card(c, it, x); }).join('') + '</div>';
      show(row, true); prev = row;
    });
    /* the design's sample row folds where a real course stands for its subject (C-11). P8d (the teen re-check of 14 Oct: their English
     * lesson lines on uz/ru pages): AP's and Psychology's samples are hidden for a real student, Psychology parked (C-23), AP's place taken
     * by her real AP course where she has one; the placeholder teachers stay on her real lessons (D19) */
    var exams = {}; st.courses.forEach(function (c) { if (c.exam) exams[c.exam] = true; });
    [['SAT', 'ls-h-sat'], ['IELTS', 'ls-h-ielts'], [null, 'ls-h-ap'], [null, 'ls-h-psy']].forEach(function (p) { var h = $(p[1]), s = h && h.closest ? h.closest('.ls-sub') : null; if (s) show(s, !!p[0] && !exams[p[0]]); });
    /* the header names her current course and lesson (SPEC §5.4) */
    var head = page.querySelector('header'), cont = $('jgl-cont'), first = null;
    st.courses.some(function (c) { if (c.current) { first = c; return true; } return false; });
    /* P16 [p15#8] (after Listening lesson 1 it named IELTS Reading lesson 1): the course she last worked in (the server's last_at), else the first */
    st.courses.forEach(function (c) { var t = c.current && c.last_at ? Date.parse(c.last_at) : NaN; if (t === t && !(first.last_at && Date.parse(first.last_at) >= t)) first = c; });
    if (head && first) {
      if (!cont) { cont = D.createElement('button'); cont.id = 'jgl-cont'; cont.type = 'button'; cont.className = 'jgl-cont'; mark(cont); var dt = head.querySelector('.tv-date'); head.insertBefore(cont, dt ? dt.nextSibling : null); cont.addEventListener('click', function () { var id = cont.getAttribute('data-jgl'), cd = D.querySelector('.jgl-course .ls-card[data-jgl="' + id + '"]'); if (id) openLesson(id, cd); }); }
      var n = 0; lessonsOf(first).forEach(function (it) { if (it.l.id === first.current.id) n = it.l.n; });
      cont.setAttribute('data-jgl', first.current.id); cont.textContent = '▸ ' + x.contHead + ': ' + first.title + ' · ' + n + '. ' + first.current.title; show(cont, true);
    } else if (cont) show(cont, false);
    /* the non-affiliation line at the tab's foot (C-35) */
    var lg = $('jgl-legal');
    if (!lg) { lg = D.createElement('p'); lg.id = 'jgl-legal'; lg.className = 'jgl-legal'; mark(lg); page.appendChild(lg); }
    lg.textContent = LEGAL[st.lang] || LEGAL.en; show(lg, st.courses.length > 0);
  }
  function courses(j) {
    if (!j || !Array.isArray(j.courses)) return;
    st.courses = j.courses.filter(function (c) { return c && typeof c.id === 'string' && Array.isArray(c.sections); });
    st.jia = j.jia_card === true; st.lang = T[j.lang] ? j.lang : lang();
    paintRows();
  }

  /* ---------- 2. the lesson screen and its reader ---------- */
  var R = null;   // the open lesson: { id, course, all, L (detail), P (progress), level0, level1, view, n, ans, pick, review, test }
  function teacherHook() {
    var E = W.JG_ENGINE; if (!E || typeof E.teacher !== 'function' || E.teacher._jl) return;
    var t0 = E.teacher; E.teacher = function (c, i) { if (typeof c === 'string' && c.indexOf('jgl:') === 0) { var k = TEACH[c.slice(4)]; return k ? t0.call(E, k[0], k[1]) : null; } return t0.call(E, c, i); };
    E.teacher._jl = true;
  }
  function designData(c) {
    var k = look(c.id);
    return { key: 'jgl:' + c.id, name: c.title, course: c.title, img: k.img, g: k.g, ink: k.ink, sh: k.sh, teacher: '', role: '',
      lessons: lessonsOf(c).map(function (it) { return { t: it.l.title, m: it.l.minutes, p: it.l.state === 'done' ? 1 : 0, about: '' }; }) };
  }
  function openLesson(id, cardEl) {
    var c = courseOf(id); if (!c || typeof W.JIA_lsOpen !== 'function') return;
    var all = lessonsOf(c), idx = 0; all.forEach(function (it, i) { if (it.l.id === id) idx = i; });
    teacherHook();
    var det = $('ls-detail'); if (!det) return;
    det.setAttribute('data-jgl', id);                                      // before the design draws: jg-real.js leaves the player to the reader
    W.JIA_lsOpen(cardEl || D.querySelector('.jgl-course .ls-card[data-jgl="' + id + '"]') || D.querySelector('.jgl-course .ls-card'), designData(c), idx);
    if (det.hidden) { det.removeAttribute('data-jgl'); return; }
    load(c, id);
  }
  function load(c, id, toTest) {
    var x = words(st.lang), det = $('ls-detail'), player = $('ls-player'), all = lessonsOf(c), it = null;
    all.forEach(function (a) { if (a.l.id === id) it = a; });
    if (!it || !det || !player) return;
    det.setAttribute('data-jgl', id); unitMode(false);
    R = { id: id, course: c, all: all, it: it, L: null, P: null, level0: null, level1: null, view: 'intro', n: 1, ans: {}, pick: {}, review: false, test: null, toTest: !!toTest };
    css();
    player.classList.add('jgl-on');
    var rd = $('jgl-rd'); if (!rd) { rd = D.createElement('div'); rd.id = 'jgl-rd'; rd.className = 'jgl-rd'; mark(rd); player.appendChild(rd); }
    var lt = $('ls-lt'); if (lt) { mark(lt); lt.textContent = x.lessonN(it.l.n, it.l.title); }
    var co = $('ls-course'); if (co) { mark(co); co.textContent = c.title; }
    var h3 = $('ls-h3'); if (h3) { mark(h3); h3.textContent = x.runHead + ' · ' + c.done + '/' + c.of; }
    var ds = $('ls-desc'); if (ds) { mark(ds); ds.textContent = ''; }
    paintRun();
    render();
    get('/api/v1/lessons/' + encodeURIComponent(id) + '?lang=' + encodeURIComponent(st.lang || lang())).then(function (r) {
      if (!R || R.id !== id) return;
      if (r.status !== 200 || !r.body || !r.body.lesson) { R.failed = true; render(); return; }
      R.L = r.body.lesson; R.P = r.body.progress || null; R.level0 = r.body.level || null;
      (R.L.pieces || []).forEach(function (p) { if (p.answered) R.ans[p.n] = p.answered; });
      if (touched(c, R.P && R.P.opened_at)) paintRows();                     // P16 [p15#8]: a lesson opened the first time is her latest
      paintDesc(); paintRun();
      if (R.toTest) { R.toTest = false; if (piecesDone() && !missed()) return startTest('test'); if (missed()) { R.view = 'piece'; R.n = 1; } }
      render();
    });
  }
  function paintDesc() {
    if (R && R.utOn) return paintUnitHead();                                // P8: a unit test open: the page is the unit's
    var ds = $('ls-desc'), x = words(st.lang); if (!ds || !R || !R.L) return;
    var lv = R.level1 || R.level0;
    ds.innerHTML = esc(R.L.unit.goal || '') + '<span class="jgl-skill">' + esc(x.skill + ': ' + R.L.unit.title + (lv ? ' · ' + levelText(lv, st.lang) : '')) + '</span>';
  }
  function paintRun() {
    var list = $('ls-list'), x = words(st.lang); if (!list || !R) return;
    mark(list);
    var html = '', sec = null;
    R.all.forEach(function (it, i) {
      var l = it.l, done = l.state === 'done' || (R.P && R.P.passed && l.id === R.id), open = l.id === R.id, on = open && !R.utOn;   // P8 item 4: a unit test open is its own row's
      if (it.s !== sec) { sec = it.s; html += '<li class="jgl-sec">' + esc(it.s.of ? x.secLine(it.s.title, it.s.proficient | 0, it.s.of | 0) : it.s.title) + '</li>'; }   // P8c item 3: a count of topics at that level, never "0/6 Bilaman" ("0 of 6, I know it")
      html += '<li class="ls-item jgl-l' + (done ? ' done' : '') + (on ? ' on' : '') + '" data-jgl="' + esc(l.id) + '" tabindex="0" role="button"><span class="ls-ino">' + (done ? CHECK : l.n) + '</span><span class="ls-itt">' + esc(l.title) + '</span><span class="ls-itd">' + esc(x.lessonRow + ' · ' + x.min(l.minutes)) + '</span></li>'
        + '<li class="ls-item jgl-t' + (done ? ' done' : '') + '" data-jglt="' + esc(l.id) + '" tabindex="0" role="button"><span class="ls-ino">' + (done ? CHECK : l.writing ? 'W' : l.speaking ? 'S' : 'T') + '</span><span class="ls-itt">' + esc(l.writing ? x.writeRow : l.speaking ? x.speakRow : x.testRow) + '</span><span class="ls-itd">' + (l.writing || l.speaking ? '' : open && R.L && R.L.test ? esc(x.qn(R.L.test.n)) : l.test_n ? esc(x.qn(l.test_n)) : '') + '</span></li>';   // P7: a Writing lesson's row is her paragraph; P8: a Speaking lesson's is her practice   // a count only where the server gave it (each card's test_n, its true size: P6b fix A)
      html += unitRow(it, R.all[i + 1], x);                                // P7f: the unit's test after its last lesson
    });
    list.innerHTML = html;
  }
  /* P7f (SPEC-lessons §5.2, §12.5 item 1): the unit test's row after the unit's last lesson, from GET /api/v1/lessons units[].unit_test:
   * offered, its true count (the server's n); not yet, why in her words (after the lessons, from <day>, again tomorrow, Puxta), not a button */
  var UT_IC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.5h6v3H9zM6.5 5h11v15.5h-11zM9.5 11h5M9.5 15h5"/></svg>';
  function unitRow(it, nx, x) {
    var u = it.u, o = u && u.unit_test; if (!o || (nx && nx.u === u)) return '';
    var done = !o.offer && o.why === 'mastered', meta = o.offer ? x.qn(o.n | 0) : o.why === 'wait' && o.on ? x.utFrom(dayText(o.on, st.lang)) : x.utWhy[o.why] || '';
    var on = R && R.utOn && R.ut && R.ut.id === u.id;                       // P8 item 4: the open unit test's row is the highlighted one
    return '<li class="ls-item jgl-u' + (done ? ' done' : '') + (o.offer ? '' : ' jgl-uoff') + (on ? ' on' : '') + '" data-jglu="' + esc(u.id) + '"' + (o.offer ? ' tabindex="0" role="button"' : ' aria-disabled="true"') + '><span class="ls-ino">' + (done ? CHECK : UT_IC) + '</span><span class="ls-itt">' + esc(x.utRow) + '</span><span class="ls-itd">' + esc(meta) + '</span></li>';
  }
  function unitOf(id) { for (var i = 0; i < R.all.length; i++) if (R.all[i].u && R.all[i].u.id === id) return R.all[i].u; return null; }
  /* the first lesson after the unit's last one (the result card's 'next lesson') */
  function afterUnit(id) { var seen = false; for (var i = 0; i < R.all.length; i++) { var it = R.all[i]; if (it.u && it.u.id === id) seen = true; else if (seen) return it.l; } return null; }
  function openUnit(id) {
    var u = unitOf(id), o = u && u.unit_test; if (!o || !o.offer) return;
    R.ut = { id: u.id, title: u.title, n: o.n | 0, next: afterUnit(u.id) }; R.review = false; R.test = null; R.view = 'uintro';
    R.utOn = true; unitMode(true); paintUnitHead(); paintRun(); render(); top();
  }
  /* P8 items 1 and 4: while a unit test's first screen, run or result is open the screen is the unit test's: its own title, the unit's goal
   * and level; no teacher row and no "Ask Jamol about this lesson" (they belong to the lesson); its row highlighted in the run list. The
   * lesson's screen comes back with the lesson (its rows in the run list, another lesson, the next lesson). */
  function unitMode(on) { var det = $('ls-detail'); if (det) det.classList.toggle('jgl-ut-on', !!on); }
  function paintUnitHead() {
    var u = R && R.ut && unitOf(R.ut.id), x = words(st.lang); if (!u) return;
    var lt = $('ls-lt'); if (lt) { mark(lt); lt.textContent = x.utHead(u.title); }
    var ds = $('ls-desc'); if (ds) { mark(ds); ds.innerHTML = esc(u.goal || '') + '<span class="jgl-skill">' + esc(x.skill + ': ' + u.title + (u.level ? ' · ' + levelText(u.level, st.lang) : '')) + '</span>'; }
  }
  function leaveUnit() {
    if (!R || !R.utOn) return;
    R.utOn = false; unitMode(false);
    var x = words(st.lang), lt = $('ls-lt'), ds = $('ls-desc');
    if (lt) lt.textContent = x.lessonN(R.it.l.n, R.it.l.title);
    if (ds && !R.L) ds.textContent = '';
    paintDesc(); paintRun();
  }
  /* P8d (the teen re-check of 14 Oct: the run list's "T Test" row opened the test with no reading, and a slow guesser passed on his third
   * try): after a miss (the server's progress.missed, or a miss in this visit) a fresh test from the Test row goes back to the lesson first;
   * its last part leads to the test as always. The test-out offer and the result card's own retry are as they were. */
  function missed() { var r = R && R.test && R.test.result; return !!R && ((!!R.P && R.P.missed === true) || (!!r && r.pass === false && !r.fast)); }
  function piecesDone() { return !!R && !!R.L && R.L.pieces.every(function (p) { return !p.question || R.ans[p.n]; }) && (!W.JG_VIDEO || W.JG_VIDEO.open(R.L)); }   // P15: and its clips played (C-14)
  function kindOf(L) { return L.course === 'eng' || L.course === 'sat_rw' || L.course === 'ielts_r' || L.course === 'ielts_l' ? 'english' : 'math'; }

  function req(method, url, body) {
    return fetch(url, { method: method, headers: method === 'POST' ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }
  function get(url) { return req('GET', url); }
  /* THE ADAPTER: POST /api/v1/checks/quiz as built (op start/answer, run, reveal, result) plus lane A4a's `mode`, `lesson` and `dontknow` */
  var QUIZ = {
    start: function (L, mode) { if (mode === 'unit_test') return req('POST', '/api/v1/checks/quiz', { op: 'start', quiz: kindOf({ course: R.course.id }), mode: mode, unit: R.ut.id });   // P7f: the unit's test, by its unit
      var b = { op: 'start', quiz: kindOf(L), mode: mode, lesson: L.id }; if (mode === 'test' && L.test && L.test.task_id) b.task = L.test.task_id; return req('POST', '/api/v1/checks/quiz', b); },
    /* P15: a typed answer (an IELTS Listening gap) goes as `text` */
    /* P16 [p15#10]: `played`, the seconds of the question's clip she heard (public/runtime/jg-listening.js heard) */
    answer: function (run, item, token, text, played) { var b = text != null ? { op: 'answer', run: run, item: item, token: null, text: text } : token == null ? { op: 'answer', run: run, item: item, token: null, dontknow: true } : { op: 'answer', run: run, item: item, token: token }; if (played != null) b.played = played; return req('POST', '/api/v1/checks/quiz', b); }
  };

  /* P7: a prompt's bulleted notes as a list, one line a bullet (public/runtime/jg-checks.js JG_CHECKS.prompt; the P6 walk's
   * malika-390-sat_rw-11-test ran them inline); a question on a passage drawn with it, the passage first, "Matnga qaytish" above the
   * question (JG_CHECKS.framed). Without that file, as before. */
  function prompt(t) { var C = W.JG_CHECKS; return C && typeof C.prompt === 'function' ? C.prompt(t, 'jgl-q') : '<p class="jgl-q">' + esc(t) + '</p>'; }
  function framed(v, h) { var C = W.JG_CHECKS; return C && typeof C.framed === 'function' ? C.framed(v, h) : h; }
  /* P14: a question's instruction just above it (a piece's question, the lesson test, test-out and unit test), in the diagnostic's hint
   * line (JG_CHECKS.ins); none when the server sends none. Without that file, as before. */
  function ins(q) { var C = W.JG_CHECKS; return C && typeof C.ins === 'function' ? C.ins(q) : ''; }
  /* P15 (IELTS Listening, public/runtime/jg-listening.js, loaded with LISTENING on): a clip's player above the question, a typed gap in
   * place of options (`done`: her answer, once graded), the transcript after the answer */
  function listen(a, key) { var Lz = W.JG_LISTEN; return a && Lz ? Lz.player(a, key) : ''; }
  function script(s) { var Lz = W.JG_LISTEN; return s && Lz ? Lz.script(s) : ''; }
  function opts(q, res, picked, done) {
    if (q.typed && W.JG_LISTEN) return ins(q) + prompt(q.prompt) + W.JG_LISTEN.typed(q, res ? done || { text: '', ok: false } : null);
    return ins(q) + prompt(q.prompt) + '<div class="dg-opts">' + q.options.map(function (o) {
      var cls = res ? (o.t === res.rightT ? ' ok' : o.t === picked ? ' bad' : '') : '';
      return '<button class="dg-opt' + cls + '" type="button" data-t="' + esc(o.t) + '"' + (res ? ' disabled' : '') + '><span>' + esc(o.text) + '</span></button>';
    }).join('') + '</div>';
  }
  function resBox(ok, rightText, why, x) {
    return '<div class="jd-res ' + (ok ? 'ok' : 'bad') + '" role="status"><b>' + esc(ok ? x.right : x.wrong) + '</b><p>' + (ok || !rightText ? '' : esc(x.rightIs(rightText)) + ' ')
      + (why ? '<span class="jgl-why"><b>' + esc(x.why) + '</b> ' + esc(why) + '</span>' : '') + '</p></div>';
  }
  function intro(L, x) {
    var answered = L.pieces.filter(function (p) { return R.ans[p.n]; }).length, passed = R.P && R.P.passed;
    return '<p class="jgl-plan">' + esc(L.writing ? x.wplan(L.pieces.length, L.minutes) : L.speaking ? x.splan(L.minutes) : x.plan(L.pieces.length, L.test.n, L.minutes)) + '</p>' + (passed ? '<p class="jgl-done">✓ ' + esc(x.passed) + '</p>' : '')
      + '<button class="jgl-start dg-go" type="button">' + esc(passed ? x.reread : answered ? x.cont : x.start) + '</button>'
      + (L.test.test_out ? '<button class="jgl-out dg-link" type="button">' + esc(x.out) + '</button>' : '')
      + (L.recording && W.JG_VIDEO ? W.JG_VIDEO.slot(L.recording, R.id) : '');   // P15: the full recording under the first screen, optional
  }
  function piece(L, n, x) {
    var p = L.pieces[n - 1], r = R.ans[n], last = n >= L.pieces.length;
    var h = '<div class="jgl-head"><span class="jgl-role">' + esc(x.role[p.role] || '') + '</span><span class="jgl-seg">' + n + '/' + L.pieces.length + '</span></div>'
      + '<div class="jgl-segs" aria-hidden="true">' + L.pieces.map(function (q, i) { return '<i' + (i < n ? ' class="on"' : '') + '></i>'; }).join('') + '</div>'
      + '<div class="jgl-body">' + esc(p.body) + '</div>' + (typeof p.figure === 'string' && /^(\/|https:)/.test(p.figure) ? '<img class="jgl-fig" src="' + esc(p.figure) + '" alt="">' : '')
      + (p.video && W.JG_VIDEO ? W.JG_VIDEO.slot(p.video, R.id) : '')   // P15 (VIDEO_LESSONS): the piece's clip under its text (jg-video.js); the text reads without it
      + listen(p.audio, 'p:' + R.id + ':' + n);                              // P15: the piece's clip, practice plays (one counted replay)
    if (p.question) h += opts(p.question, r ? { rightT: r.right && r.right.t } : null, R.pick[n], r ? { text: r.text || (R.typed && R.typed[n]) || '', ok: r.ok } : null) + (r ? resBox(r.ok, r.right && r.right.text, r.why, x) + script(r.script) : '<button class="jgl-dunno dg-link" type="button">' + esc(x.dunno) + '</button>');
    if (R.review) return h + (last ? '' : '<button class="jgl-next dg-go ghost" type="button">' + esc(x.next) + '</button>') + '<button class="jgl-totest dg-go" type="button">' + esc(L.writing ? x.toWriteBack : L.speaking ? x.toSpeakBack : x.toTestBack) + '</button>';
    // P15 (C-14): on a video lesson "Testga oʻtish" waits until 80 % of each clip has played (jg-video.js opens it), its line above it
    var vw = last && !L.writing && !L.speaking && W.JG_VIDEO && !W.JG_VIDEO.open(L);
    if (!p.question || r) h += (vw ? '<p class="jgv-wait" role="status">' + esc(W.JG_VIDEO.gate(L, st.lang)) + '</p>' : '') + '<button class="jgl-next dg-go" type="button"' + (last && !L.writing && !L.speaking && W.JG_VIDEO ? ' data-jgv-gate' : '') + (vw ? ' disabled aria-disabled="true"' : '') + '>' + esc(last ? (L.writing ? x.toWrite : L.speaking ? x.toSpeak : x.toTest) : x.next) + '</button>';
    return h;
  }
  function testView(x) {
    var t = R.test;
    if (t.err) return (t.errWait ? retryBtn(x) : '<p class="jgl-plan">' + esc(t.err) + '</p>' + (t.errRetry ? '<button class="jgl-retry dg-go" type="button">' + esc(x.retry) + '</button>' : '')) + (t.mode === 'unit_test' ? '<button class="jgl-enough dg-link" type="button">' + esc(x.enough) + '</button>' : '<button class="jgl-start dg-link" type="button">' + esc(x.restart) + '</button>');
    if (!t.cur) return '<p class="jgl-plan">' + esc(x.loading) + '</p>';
    var v = t.cur, a = t.after, rv = a && a.reveal;
    var ut = t.mode === 'unit_test';                                        // P7f: the unit test names itself and has no lesson to go back to
    return framed(v, '<p class="jgl-k">' + esc((ut ? x.utRow : x.testWord) + ' · ' + v.n + '/' + v.of) + '</p>' + (t.mode === 'test_out' && v.n === 1 && !rv ? '<p class="jgl-plan">' + esc(x.outNote) + '</p>' : '')
      + listen(v.audio, 't:' + (t.run || '') + ':' + v.id + ':' + v.n)              // P15: the question's clip, once in a test
      + opts(v, rv ? { rightT: rv.right } : null, t.picked, rv ? { text: t.typedText || '', ok: rv.ok } : null)
      + (rv ? resBox(rv.ok, rv.answer, rv.why, x) + script(rv.script) + (!rv.ok && a.hint && W.JG_HW ? W.JG_HW.hintBtn(t.run, v.id) : '') + '<button class="jgl-next dg-go" type="button">' + esc(a.result ? x.result : x.next) + '</button>' : '<button class="jgl-dunno dg-link" type="button">' + esc(x.dunno) + '</button>'))
      + (ut ? '' : '<button class="jgl-back dg-link" type="button">' + esc(x.back) + '</button>');
  }
  function resultView(x) {
    var t = R.test, r = t.result, L = R.L;
    if (t.mode === 'unit_test') return unitResult(r, x);
    var lines = resultLines(r, R.level0, R.level1, L.unit.title, st.lang, { mode: t.mode, homework: L.course !== 'eng', next: L.next ? L.next.title : null });
    var btns = r.pass ? (L.next ? '<button class="jgl-go" type="button">' + esc(x.go) + '</button>' : '') + '<button class="jgl-enough dg-link" type="button">' + esc(x.enough) + '</button>'
      : t.mode === 'test_out' ? '<button class="jgl-start dg-go" type="button">' + esc(x.start) + '</button>'
      /* the P8c integration: the miss that used the day's last try (r.last) says so, with no "Qayta urinish" the server would refuse */
      : r.last ? '<p class="jgl-plan jgl-last" role="status">' + esc(x.lastGo) + '</p><button class="jgl-start dg-link" type="button">' + esc(x.restart) + '</button>'
      : retryBtn(x) + '<button class="jgl-start dg-link" type="button">' + esc(x.restart) + '</button>';
    var jia = r.pass && R.course.exam && lastOfSection() && weekly() ? jiaCard(R.course, x) : '';
    return '<p class="jgl-win-h">' + esc(r.pass ? x.winH : x.tryH) + '</p><ol class="jgl-res">' + lines.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' + btns + jia;
  }
  /* P7f: the unit test's result card (SPEC-lessons §5.3): the score and the coins the server paid (none for a fail; a second pass, none
   * again), the skill line the server wrote with the level's dots, what comes next; a fail says when it opens again (once a day) */
  function unitLines(r, x) {
    var right = r.right | 0, of = r.of | 0, pays = typeof r.pays === 'number' ? r.pays | 0 : 0, head = x.utRow + ': ' + right + '/' + of;
    var one = r.fast ? head + ' · ' + x.fast : r.pass ? head + ' ✓ · ' + (pays > 0 ? '+' + pays + ' ' + x.coins : x.utPaid) : head + ' · ' + x.utNoCoins(need(of));
    var two = r.line ? r.line + (LEVELS.indexOf(r.level) >= 0 ? ' ' + dots(r.level) : '') : x.noChange;
    var three = !r.pass ? x.utAgain : R.ut && R.ut.next ? x.nextIs(R.ut.next.title) : x.courseDone;
    return [one, two, three];
  }
  function unitResult(r, x) {
    var btns = (r.pass && R.ut && R.ut.next ? '<button class="jgl-go" type="button">' + esc(x.go) + '</button>' : '') + '<button class="jgl-enough dg-link" type="button">' + esc(x.enough) + '</button>';
    return '<p class="jgl-win-h">' + esc(r.pass ? x.winH : x.tryH) + '</p><ol class="jgl-res">' + unitLines(r, x).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' + btns;
  }
  function lastOfSection() { var s = R.it.s, ls = []; R.all.forEach(function (a) { if (a.s === s) ls.push(a.l.id); }); return ls[ls.length - 1] === R.id; }
  function weekly() { var k = 'jg-jia-card-result', t = +store(k); if (t > 0 && Date.now() - t < 7 * 864e5) return false; if (st.jia) store(k, String(Date.now())); return true; }
  function render() {
    var rd = $('jgl-rd'), x = words(st.lang); if (!rd || !R) return;
    var L = R.L, h;
    if (!L) h = '<p class="jgl-plan">' + esc(R.failed ? x.failed : x.loading) + '</p>' + (R.failed ? '<button class="jgl-reload dg-go" type="button">' + esc(x.again2) + '</button>' : '');
    else if (R.view === 'piece') h = piece(L, R.n, x);
    else if (R.view === 'test') h = testView(x);
    else if (R.view === 'result') h = resultView(x);
    else if (R.view === 'uintro' && R.ut) h = '<p class="jgl-k">' + esc(x.utHead(R.ut.title)) + '</p><p class="jgl-plan">' + esc(x.utPlan(R.ut.n, need(R.ut.n))) + '</p><button class="jgl-ustart dg-go" type="button">' + esc(x.utStart) + '</button>';
    else if (R.view === 'write') return write(rd);
    else if (R.view === 'speak') return speak(rd);
    else h = intro(L, x);
    rd.innerHTML = h;
    if (W.JG_VIDEO && L) W.JG_VIDEO.mount(rd, L, R.id);                      // P15: the clips, kept playing between renders
    tickWait();
    if (W.JG_LISTEN) W.JG_LISTEN.sync();                                    // P15: a clip whose player left the screen stops
  }
  /* P8c item 7: after a second finished miss the next try opens REREAD_S later (src/server/checks.ts lessonRunStart). "Qayta urinish" waits
   * disabled under its countdown ("…test 12 soniyadan keyin ochiladi") and opens by itself at 0, never a live-looking tap that meets 409 */
  function waitLeft() { return R && R.waitUntil ? Math.max(0, Math.ceil((R.waitUntil - Date.now()) / 1000)) : 0; }
  function retryBtn(x) {
    var s = waitLeft();
    return (s > 0 ? '<p class="jgl-plan jgl-wait" role="status">' + esc(x.rereadWait(s)) + '</p>' : '') + '<button class="jgl-retry dg-go" type="button"' + (s > 0 ? ' disabled aria-disabled="true"' : '') + '>' + esc(x.retry) + '</button>';
  }
  function tickWait() {
    if (!R) return;
    clearTimeout(R.waitT);
    var rd = $('jgl-rd'), b = rd && rd.querySelector('.jgl-retry'), p = rd && rd.querySelector('.jgl-wait'), s = waitLeft(), r0 = R;
    if (!b) return;
    if (s <= 0) { if (p && p.parentNode) p.parentNode.removeChild(p); b.disabled = false; b.removeAttribute('aria-disabled'); return; }
    b.disabled = true; if (p) p.textContent = words(st.lang).rereadWait(s);
    R.waitT = setTimeout(function () { if (R === r0) tickWait(); }, 1000);
  }
  /* P7: a Writing lesson's test is her own paragraph (public/runtime/jg-writing.js, loaded only with WRITING on) */
  function write(rd) {
    var id = R.id, L = R.L;
    if (!W.JG_WRITING || !L) { rd.innerHTML = '<p class="jgl-plan">' + esc(words(st.lang).failed) + '</p>'; return; }
    rd.innerHTML = '<div class="jgl-wr"></div>';
    W.JG_WRITING.mount(rd.firstChild, { id: id, lang: st.lang || lang(), next: L.next || null,
      back: function () { if (R && R.id === id) { R.review = true; R.view = 'piece'; R.n = 1; render(); top(); } },
      nextLesson: function () { if (R && R.id === id && L.next) { load(R.course, L.next.id); top(); } },
      enough: function () { var bk = $('ls-back'); if (bk) bk.click(); },
      done: function () { if (!R || R.id !== id) return; R.P = R.P || {}; R.P.passed = true; markDone(id); paintRun(); var E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {} top(); } });
  }
  /* P8: a Speaking lesson's test is the speaking practice (public/runtime/jg-speaking.js, loaded only with SPEAKING on; nothing is recorded) */
  function speak(rd) {
    var id = R.id, L = R.L;
    if (!W.JG_SPEAKING || !L) { rd.innerHTML = '<p class="jgl-plan">' + esc(words(st.lang).failed) + '</p>'; return; }
    rd.innerHTML = '<div class="jgl-sp"></div>';
    W.JG_SPEAKING.mount(rd.firstChild, { id: id, lang: st.lang || lang(), next: L.next || null,
      back: function () { if (R && R.id === id) { R.review = true; R.view = 'piece'; R.n = 1; render(); top(); } },
      nextLesson: function () { if (R && R.id === id && L.next) { load(R.course, L.next.id); top(); } },
      enough: function () { var bk = $('ls-back'); if (bk) bk.click(); },
      done: function () { if (!R || R.id !== id) return; R.P = R.P || {}; R.P.passed = true; markDone(id); paintRun(); var E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {} } });
  }
  function top() { var s = $('ls-scroll'); if (s) try { s.scrollTo({ top: 0 }); } catch (e) { s.scrollTop = 0; } }
  function answerPiece(n, token, text) {
    if (!R || !R.L || R.ans[n] || R.busy) return;
    R.busy = true; R.pick[n] = token; R.typed = R.typed || {}; if (text != null) R.typed[n] = text;
    var id = R.id;
    req('POST', '/api/v1/lessons/' + encodeURIComponent(id) + '/piece?lang=' + encodeURIComponent(st.lang || lang()), text != null ? { n: n, text: text } : token == null ? { n: n, dontknow: true } : { n: n, token: token }).then(function (r) {
      if (!R || R.id !== id) return; R.busy = false;
      if (r.status === 200 && r.body && typeof r.body.ok === 'boolean') { R.ans[n] = r.body; if (touched(R.course, true)) paintRows(); }   // P16 [p15#8]
      render(); if (R.ans[n]) showRes($('jgl-rd'));
    });
  }
  /* P16 [p16#10] (a 390 px phone: after the tap the feedback and its next button sat below the fold): once an answer is graded, its result
   * and the button under it scroll into view, as much as fits, the result's top kept on screen. Only after an answer: nothing moves at rest */
  function showRes(root) {
    var a = root && root.querySelector ? root.querySelector('.jd-res') : null; if (!a || !a.getBoundingClientRect) return;
    var b = root.querySelector('.jgl-next,[data-jg=next]') || a, sc = a.parentNode, hi = 0, lo = W.innerHeight || 0;
    while (sc && sc.nodeType === 1 && !(sc.scrollHeight > sc.clientHeight && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentNode;
    if (sc && sc.nodeType === 1) { var r = sc.getBoundingClientRect(); hi = Math.max(0, r.top); lo = Math.min(lo, r.bottom); } else sc = null;
    var top = a.getBoundingClientRect().top, bot = b.getBoundingClientRect().bottom, dy = Math.min(bot - lo + 16, top - hi - 16);
    if (bot <= lo || dy <= 0) return;
    var o = { top: dy, behavior: W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' };
    try { if (sc) sc.scrollBy(o); else W.scrollBy(o); } catch (e) { if (sc) sc.scrollTop += dy; }
  }
  function startTest(mode) {
    if (!R || !R.L) return;
    if (R.L.writing) { R.review = false; R.view = 'write'; render(); return top(); }   // P7: no test: her paragraph
    if (R.L.speaking) { R.review = false; R.view = 'speak'; render(); return top(); }   // P8: no test: the speaking practice
    R.review = false; R.view = 'test'; R.test = { mode: mode, run: null, cur: null, after: null, picked: null, busy: true }; render(); top();
    var t = R.test, x = words(st.lang);
    QUIZ.start(R.L, mode).then(function (r) {
      if (!R || R.test !== t) return; t.busy = false;
      if (r.body && r.body.next) { t.run = r.body.run || null; t.cur = r.body.next; t.clock = r.body.clock === 'seen'; }
      else if (r.body && r.body.error === 'reread') { t.err = x.rereadWait(r.body.wait | 0); t.errRetry = true; t.errWait = true; R.waitUntil = Date.now() + (r.body.wait | 0) * 1000; }
      else if (r.body && r.body.error === 'again_used') t.err = x.lastGo;
      else if (r.body && r.body.error === 'watch' && W.JG_VIDEO) t.err = W.JG_VIDEO.words(st.lang).watchFirst;   // P15 (C-14): the clips first
      else if (mode === 'unit_test' && r.status === 409 && r.body && r.body.error !== 'busy' && r.body.error !== 'items') t.err = x.utNot;   // P7f: not offered now
      else { t.err = x.moment; t.errRetry = true; }
      render(); seen(t);
    });
  }
  /* P8c item 3: the question is on her screen now: its clock starts on the server (op seen), once a question, for a run whose start said so */
  function seen(t) {
    if (!t || !t.clock || !t.run || !t.cur || t.after || t.seenId === t.cur.id) return;
    t.seenId = t.cur.id; req('POST', '/api/v1/checks/quiz', { op: 'seen', item: t.cur.id, run: t.run });
  }
  function pickTest(token, text) {
    var t = R && R.test; if (!t || !t.cur || t.after || t.busy) return;
    t.busy = true; t.picked = token; t.typedText = text != null ? text : null;
    var v = t.cur;
    QUIZ.answer(t.run, v.id, token, text, v.audio && W.JG_LISTEN && W.JG_LISTEN.heard ? W.JG_LISTEN.heard('t:' + (t.run || '') + ':' + v.id + ':' + v.n) : null).then(function (r) {
      if (!R || R.test !== t || t.cur !== v) return; t.busy = false;
      if (r.body && r.body.reveal) t.after = r.body; else { t.picked = null; }
      render(); if (t.after) showRes($('jgl-rd'));                         // P16 [p16#10]
    });
  }
  function nextTest() {
    var t = R && R.test; if (!t || !t.after) return;
    var a = t.after; t.after = null; t.picked = null;
    if (a.result) return finish(a.result);
    t.cur = a.next || null; render(); seen(t);
  }
  function finish(res) {
    var t = R.test, id = R.id; t.result = res; t.cur = null;
    if (t.mode === 'unit_test') return unitDone(res);
    if (res.pass) { R.P = R.P || {}; R.P.passed = true; }
    else if ((res.reread | 0) > 0) R.waitUntil = Date.now() + (res.reread | 0) * 1000;   // P8c item 7: the server's wait before the next try
    var E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {}
    /* the level after the sitting is the server's (lane A4b writes lesson_skill): the lesson read again */
    get('/api/v1/lessons/' + encodeURIComponent(id) + '?lang=' + encodeURIComponent(st.lang || lang())).then(function (r) {
      if (!R || R.id !== id || R.test !== t) return;
      if (r.status === 200 && r.body) { R.level1 = r.body.level || null; if (r.body.progress) R.P = r.body.progress; }
      else R.level1 = R.level0;
      if (res.pass) markDone(id);
      R.view = 'result'; render(); paintDesc(); paintRun(); top();
    });
  }
  /* P7f: a unit test ended: the list read again (its row now says why it is not offered), the result card; the day refreshed */
  function unitDone() {
    var t = R.test, id = R.id, E = W.JG_ENGINE; if (E && typeof E.refresh === 'function') try { E.refresh(); } catch (e) {}
    get('/api/v1/lessons?lang=' + encodeURIComponent(st.lang || lang())).then(function (r) {
      if (!R || R.id !== id || R.test !== t) return;
      if (r.status === 200 && r.body && Array.isArray(r.body.courses)) {
        courses(r.body);
        var c = courseOf(id); if (c) { R.course = c; R.all = lessonsOf(c); R.all.forEach(function (a) { if (a.l.id === id) R.it = a; }); }
      }
      if (R.utOn) paintUnitHead();                                          // P8: the unit's level as it is now
      R.view = 'result'; render(); paintRun(); top();
    });
  }
  /* P16 [p15#8] (the integration's walk: right after a Listening lesson was opened and passed, "Davom eting" still named SAT Math lesson 1
   * until a reload): the server moves a course's last_at when she opens one of its lessons the first time (its opened_at), answers a piece
   * or first passes it (lesson_progress.updated_at); the page moves its copy the same way. `at` true: now, after every last_at it knows.
   * True when it moved (the caller repaints the header) */
  function touched(c, at) {
    var t = at === true ? Date.now() : at ? Date.parse(at) : NaN; if (!c || t !== t) return false;
    if (at === true) st.courses.forEach(function (o) { var u = o !== c && o.last_at ? Date.parse(o.last_at) : NaN; if (u === u && u >= t) t = u + 1; });
    if (c.last_at && Date.parse(c.last_at) >= t) return false;
    c.last_at = new Date(t).toISOString(); return true;
  }
  function markDone(id) {
    var c = R.course, all = lessonsOf(c); all.forEach(function (it) { if (it.l.id === id && it.l.state !== 'done') { it.l.state = 'done'; c.done = Math.min(c.of, (c.done | 0) + 1); touched(c, true); } });
    /* P8c item 2: the course's current lesson is its first one not done, as GET /api/v1/lessons says after a reload ("Davom eting" and the
     * "Navbatdagi" card move on at once, never naming the lesson just finished) */
    var nx = null; all.some(function (it) { if (it.l.state !== 'done') { nx = it.l; return true; } return false; });
    all.forEach(function (it) { if (it.l.state === 'current' && it.l !== nx) it.l.state = 'open'; });
    if (nx) nx.state = 'current';
    c.current = nx ? { id: nx.id, title: nx.title } : null;
    var h3 = $('ls-h3'); if (h3) h3.textContent = words(st.lang).runHead + ' · ' + c.done + '/' + c.of;
    paintRows();
  }
  function onReader(e) {
    if (!R) return;
    var t = e.target, b = function (s) { return t.closest ? t.closest(s) : null; };
    if (b('.jgl-reload')) return load(R.course, R.id);
    if (b('.jgl-start')) { R.review = false; R.test = null; R.view = 'piece'; R.n = 1; render(); return top(); }
    if (b('.jgl-out')) return startTest('test_out');
    if (b('.jgl-ustart')) return startTest('unit_test');                    // P7f
    if (b('.jgl-retry')) { if (waitLeft() > 0) return; return startTest(R.test ? R.test.mode : 'test'); }
    if (b('.jgl-go')) { var nx = R.test && R.test.mode === 'unit_test' ? R.ut && R.ut.next : R.L && R.L.next; if (nx) { load(R.course, nx.id); top(); } return; }
    if (b('.jgl-enough')) { var bk = $('ls-back'); if (bk) bk.click(); return; }
    if (b('.jgl-back')) { R.review = true; R.view = 'piece'; R.n = 1; render(); return top(); }
    if (b('.jgl-totest')) { R.review = false; R.view = R.L && R.L.writing ? 'write' : R.L && R.L.speaking ? 'speak' : 'test'; render(); return top(); }
    var ts = b('.jgli-send'), tx = ts && !ts.disabled && W.JG_LISTEN ? W.JG_LISTEN.text(ts.parentNode) : '';   // P15: a typed gap sent
    if (R.view === 'test') {
      if (tx) return pickTest(null, tx);
      var o = b('.dg-opt[data-t]'); if (o && !o.disabled) return pickTest(o.getAttribute('data-t'));
      if (b('.jgl-dunno')) return pickTest(null);
      if (b('.jgl-next')) return nextTest();
      return;
    }
    if (R.view === 'piece') {
      if (tx) return answerPiece(R.n, null, tx);
      var op = b('.dg-opt[data-t]'); if (op && !op.disabled) return answerPiece(R.n, op.getAttribute('data-t'));
      if (b('.jgl-dunno')) return answerPiece(R.n, null);
      if (b('.jgl-next')) { if (R.n < R.L.pieces.length) { R.n++; render(); return top(); } if (!R.review) return startTest('test'); }
    }
  }
  function onRun(e) {
    var det = $('ls-detail'); if (!R || !det || !det.hasAttribute('data-jgl')) return;
    var ur = e.target.closest ? e.target.closest('[data-jglu]') : null; if (ur) return openUnit(ur.getAttribute('data-jglu'));   // P7f: the unit test's row
    var li = e.target.closest ? e.target.closest('[data-jgl],[data-jglt]') : null; if (!li) return;
    var id = li.getAttribute('data-jgl') || li.getAttribute('data-jglt'), toTest = li.hasAttribute('data-jglt');
    if (id === R.id && R.L) { leaveUnit(); /* P8: the lesson's screen again */ if (toTest && piecesDone() && !missed()) startTest('test'); else { R.view = toTest ? 'piece' : 'intro'; R.n = 1; render(); } top(); return; }
    load(R.course, id, toTest); top();
  }
  function startDetail() {
    var det = $('ls-detail'), player = $('ls-player'), list = $('ls-list');
    if (!det || !player || det._jl) return; det._jl = true;
    player.addEventListener('click', function (e) { if (det.hasAttribute('data-jgl') && e.target.closest && e.target.closest('#jgl-rd')) onReader(e); });
    if (list) {
      list.addEventListener('click', onRun);
      list.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-jgl],[data-jglt],[data-jglu]') && det.hasAttribute('data-jgl')) { e.preventDefault(); onRun(e); } });
    }
    /* the screen closed (its back, Escape, "Bugunga yetarli", another tab): the player is the design's again */
    new MutationObserver(function () {
      if (!det.hidden) return;
      det.removeAttribute('data-jgl'); unitMode(false); player.classList.remove('jgl-on'); var rd = $('jgl-rd'); if (rd) rd.parentNode.removeChild(rd); if (W.JG_LISTEN) W.JG_LISTEN.sync(); if (R) clearTimeout(R.waitT); R = null;
      unmark();                                                             // P8c item 1: the design's sample lessons are translated again
    }).observe(det, { attributes: true, attributeFilter: ['hidden'] });
  }

  var cssDone = false;
  function css() {
    if (cssDone || $('jgl-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jgl-css';
    s.textContent = [
      '#ls-player.jgl-on{aspect-ratio:auto;overflow:visible;background:#fff;box-shadow:inset 0 0 0 1.5px #e0eae5;padding:16px 16px 18px}',
      '#ls-player.jgl-on>.obj,#ls-player.jgl-on>.ls-big,#ls-player.jgl-on>.ls-ctrl,#ls-player.jgl-on>.ls-pill,#ls-player.jgl-on>.ls-viewers,#ls-player.jgl-on>#jg-novideo{display:none!important}',
      '.jgl-rd{display:grid;gap:12px;font-family:var(--font)}',
      '.jgl-rd .dg-go{width:100%}.jgl-rd .dg-link{justify-self:center;text-align:center}.jgl-rd .dg-go.ghost{margin-top:0}',
      '.jgl-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.jgl-role{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2)}',
      '.jgl-seg{font-size:12px;font-weight:700;color:var(--muted)}',
      '.jgl-segs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px}.jgl-segs i{display:block;height:4px;border-radius:2px;background:#edf2ef}.jgl-segs i.on{background:var(--ink2)}',
      '.jgl-body{white-space:pre-line;overflow-wrap:anywhere;font-size:15px;line-height:1.55;color:var(--ink)}',
      '.jgl-fig{display:block;max-width:100%;height:auto;border-radius:12px}',
      '.jgl-q{font-size:18px;font-weight:800;line-height:1.35;color:var(--ink);overflow-wrap:anywhere}',
      '.jgl-plan{font-size:13px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '.jgl-done{font-size:14px;font-weight:800;color:var(--accent)}',
      '.jgl-why b{margin-right:2px}',
      '.jgl-k{font-size:12.5px;font-weight:800;color:var(--ink2)}',
      '.jgl-win-h{font-size:22px;font-weight:800;color:var(--ink)}',
      '.jgl-res{display:grid;gap:8px;margin:0;padding:0;list-style:none}',
      '.jgl-res li{padding:12px 14px;border-radius:14px;background:#f5f8f6;font-size:14.5px;font-weight:700;line-height:1.4;color:var(--ink);overflow-wrap:anywhere}',
      '.jgl-res li:first-child{background:linear-gradient(150deg,var(--g1),var(--g2))}',
      '.jgl-go{width:100%;height:52px;border:0;border-radius:999px;background:#14201a;color:#fff;font:800 16px var(--font);cursor:pointer}',
      '.jgl-jia{display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;margin:0 22px 10px;padding:10px 12px;border-radius:16px;background:#f5f8f6}',
      '.jgl-rd .jgl-jia{margin:4px 0 0}',
      '.jgl-jia p{flex:1 1 180px;font-size:12.5px;font-weight:600;line-height:1.4;color:var(--ink)}',
      '.jgl-jia-go{padding:8px 14px;border-radius:999px;background:#14201a;color:#fff;font:800 13px var(--font);text-decoration:none}',
      '.jgl-jia-x{padding:6px;border:0;background:none;color:var(--muted);font:700 12.5px var(--font);cursor:pointer}',
      '.jgl-cont{display:block;margin-top:6px;padding:0;border:0;background:none;color:var(--accent);font:800 13.5px var(--font);text-align:left;cursor:pointer}',
      '.jgl-legal{margin:6px 22px 28px;font-size:11px;line-height:1.45;color:var(--muted)}',
      '.jgl-cbar{margin:-4px 22px 10px}',
      '.ls-card.jgl-cur .ls-meta{color:var(--ink2);font-weight:800}',
      '.ls-dur .jgl-page{width:9px;height:9px}',
      '.jgl-sec{list-style:none;padding:12px 8px 4px;font-size:12px;font-weight:800;color:var(--muted)}',
      '.ls-item.jgl-t{padding-left:22px}.ls-item.jgl-t .ls-ino{width:26px;height:26px;font-size:11px}',
      '.jgl-skill{display:block;margin-top:6px;font-weight:700;color:var(--ink2)}',
      '.ls-item.jgl-uoff{cursor:default}.ls-item.jgl-uoff:not(.done) .ls-itt{color:var(--muted)}',   /* P7f: a unit test not offered yet */
      '#ls-detail.jgl-ut-on .ls-teacher,#ls-detail.jgl-ut-on #ls-askl{display:none!important}'   /* P8 item 1: a unit test has no lesson teacher and no "about this lesson" */
    ].join('\n');
    D.head.appendChild(s);
  }

  var API = W.JG_LESSONS = {
    courses: courses, words: words, dots: dots, levelText: levelText, resultLines: resultLines, need: need,
    list: function () { return st.courses; },   // P8d: her real courses, for Ask Jamol (public/runtime/jg-jamol.js)
    state: function () { return { courses: st.courses.length, open: R ? R.id : null, view: R ? R.view : null }; }
  };
  function start() {
    startDetail();
    if (W.JG_LESSONS_DATA) courses(W.JG_LESSONS_DATA);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
  return API;
})();
