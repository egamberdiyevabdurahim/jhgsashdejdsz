/* Jamals Global runtime: the student's homework list, her weekly summary and Jamol's one hint (P7; SPEC-lessons §4.6, §7, §10.2, §12.5
 * item 6; the owner's 12 Oct 2026 "lessons va lesson h/w qism"). Loaded by src/server/pages.ts for a live, non-demo student, on the phone
 * and on the laptop, only with the lessons part on (LESSONS and the scheduler's switch). Not design code: no design file is edited; it adds
 * to the design's Lessons tab and Home, in the design's own tokens (Raleway, --ink, --ink2, --muted, --accent, its 14-16 px radii). Every
 * word in en, uz (U+02BB, U+02BC) and ru, marked data-no-i18n; every number is the server's, from her own rows (nothing is estimated here).
 *  1. THE WEEK (GET /api/v1/lessons/week): four numbers in one short card: lessons finished, levels risen (P8d: and fallen, when any fell: "3↑ 2↓"), homework sets handed in, minutes.
 *     In the Lessons tab: this week so far, or last week on her week's first day. On Home: last week, only on her week's first day and only
 *     when last week holds something (a card of zeros on a Monday says nothing).
 *  2. THE HOMEWORK LIST (GET /api/v1/homework): every set, today's first, then the missed, then the done: the day, its lessons, its state
 *     in the parent design's words (Berilgan, Topshirildi, Bajarildi, Topshirilmagan), the first-try score and the corrections left. Four
 *     rows, then "Hammasi (N)". The list after the Learnbox Assignments pin (#080).
 *  3. JAMOL'S ONE HINT: hintBtn(run, item) is the button a quiz shows after a miss the server marked `hint` (public/runtime/jg-checks.js,
 *     public/runtime/jg-lessons.js); a tap asks POST /api/v1/lessons/hint once and shows the hint in place, kept for a redraw.
 * window.JG_HW: words(lang), weekHtml(week, which, lang), listHtml(rows, lang, open), hintBtn(run, item), fixes(task), ended(taskId, left).
 * tests/unit/jg-hw.test.ts, jg-hw-open.test.ts, jg-hw-fix.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_HW) return;
  function RU_N(n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; }

  var MON = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'], ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'] };
  var T = {
    en: { thisWeek: 'This week', lastWeek: 'Last week', lessons: function (n) { return n === 1 ? 'lesson' : 'lessons'; }, levels: 'levels up', levelsUD: 'levels up · down', hw: 'homework', min: 'minutes', zero: 'Finish a lesson and your week starts here.',
      hwH: 'Homework', today: 'Today', yday: 'Yesterday', st: { assigned: 'Set', handed_in: 'Handed in', complete: 'Done', missing: 'Not handed in' },
      first: function (r, o) { return 'First try ' + r + '/' + o; }, left: function (n) { return n + ' left to fix'; }, qs: function (n) { return n === 1 ? '1 question' : n + ' questions'; },
      all: function (n) { return 'All (' + n + ')'; }, less: 'Show less', empty: 'No homework yet. Pass a lesson and the first set comes the next day.',
      hint: 'A hint from Jamol', hintBusy: 'Jamol is thinking…', hintNo: 'No hint right now. Read the “why” once more.', hintCap: 'No more questions to Jamol today. Read the “why” once more.', hintH: 'Jamol:' },
    uz: { thisWeek: 'Bu hafta', lastWeek: 'Oʻtgan hafta', lessons: 'dars', levels: 'daraja oshdi', levelsUD: 'daraja oshdi · tushdi', hw: 'uy vazifasi', min: 'daqiqa', zero: 'Bitta darsni oʻting, haftangiz shu yerda boshlanadi.',
      hwH: 'Uy vazifalari', today: 'Bugun', yday: 'Kecha', st: { assigned: 'Berilgan', handed_in: 'Topshirildi', complete: 'Bajarildi', missing: 'Topshirilmagan' },
      first: function (r, o) { return 'Birinchi urinish ' + r + '/' + o; }, left: function (n) { return n + ' ta tuzatish qoldi'; }, qs: function (n) { return n + ' savol'; },
      all: function (n) { return 'Hammasi (' + n + ')'; }, less: 'Yigʻish', empty: 'Hali uy vazifasi yoʻq. Darsni oʻtsangiz, ertasi kuni birinchisi keladi.',
      hint: 'Jamoldan maslahat', hintBusy: 'Jamol oʻylayapti…', hintNo: 'Hozir maslahat yoʻq. Izohni yana bir oʻqing.', hintCap: 'Bugun Jamolga savollar tugadi. Izohni yana bir oʻqing.', hintH: 'Jamol:' },
    ru: { thisWeek: 'Эта неделя', lastWeek: 'Прошлая неделя', lessons: function (n) { return RU_N(n, 'урок', 'урока', 'уроков'); }, levels: function (n) { return RU_N(n, 'уровень', 'уровня', 'уровней') + ' выше'; }, levelsUD: 'уровни: выше · ниже', hw: 'ДЗ сдано', min: 'мин', zero: 'Пройдите урок, и неделя начнётся здесь.',
      hwH: 'Домашние задания', today: 'Сегодня', yday: 'Вчера', st: { assigned: 'Задано', handed_in: 'Сдано', complete: 'Выполнено', missing: 'Не сдано' },
      first: function (r, o) { return 'С первой попытки ' + r + '/' + o; }, left: function (n) { return 'Осталось исправить: ' + n; },
      qs: function (n) { var a = n % 10, b = n % 100; return n + (a === 1 && b !== 11 ? ' вопрос' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? ' вопроса' : ' вопросов'); },
      all: function (n) { return 'Все (' + n + ')'; }, less: 'Свернуть', empty: 'Домашних заданий пока нет. Пройдите урок, и на следующий день придёт первое.',
      hint: 'Подсказка от Жамола', hintBusy: 'Жамол думает…', hintNo: 'Подсказки сейчас нет. Перечитайте пояснение.', hintCap: 'На сегодня вопросы к Жамолу закончились. Перечитайте пояснение.', hintH: 'Жамол:' }   // P8c item 4: Жамол in Cyrillic, as the design's ru text names him
  };
  var SHOW = 4, st = { week: null, rows: null, today: null, open: false, hints: {}, lang: null };

  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function words(l) { return T[l || lang()] || T.en; }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dayText(d, l) { var p = String(d).split('-'); return (+p[2]) + ' ' + MON[l][+p[1] - 1]; }
  function addDays(d, k) { var t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + k); return t.toISOString().slice(0, 10); }
  function req(method, url, body) {
    return fetch(url, { method: method, credentials: 'same-origin', headers: body ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r; }, function () { return null; });
  }

  /* ---- 1. the week ---- */
  function empty(n) { return !n || !(n.lessons || n.levels_up || n.levels_down || n.homework_in || n.minutes); }
  function weekHtml(week, which, l) {
    var x = words(l), n = week && week[which === 'last' ? 'last_week' : 'this_week']; if (!n) return '';
    var word = function (v, k) { return typeof x[k] === 'function' ? x[k](v | 0) : x[k]; };   // P8d: the word agrees with its number («3 урока», "1 lesson")
    var tile = function (v, k) { return '<span class="jgw-t"><b>' + (v | 0) + '</b><small>' + esc(word(v, k)) + '</small></span>'; };
    /* P8d (the teen re-check of 14 Oct: homework can lower a level; the card read «3 уровни выше» while his mother read «Уровень снизился у 2
     * тем»): the levels tile shows the ups and the downs, as the parent sees them (the server's levels_down) */
    var down = n.levels_down | 0, levels = down > 0 ? '<span class="jgw-t jgw-ud"><b>' + (n.levels_up | 0) + '↑ ' + down + '↓</b><small>' + esc(x.levelsUD) + '</small></span>' : tile(n.levels_up, 'levels');
    return '<div class="jgw-card" data-no-i18n data-jgw="' + which + '"><p class="jgw-h"><b>' + esc(which === 'last' ? x.lastWeek : x.thisWeek) + '</b><span>' + esc(dayText(n.from, l) + ' – ' + dayText(n.to, l)) + '</span></p>'
      + '<div class="jgw-tiles">' + tile(n.lessons, 'lessons') + levels + tile(n.homework_in, 'hw') + tile(n.minutes, 'min') + '</div>'
      + (empty(n) ? '<p class="jgw-z">' + esc(x.zero) + '</p>' : '') + '</div>';
  }

  /* ---- 2. the homework list ---- */
  var ORDER = { today: 0, missed: 1, done: 2 };
  function sorted(rows) { return rows.slice().sort(function (a, b) { return (ORDER[a.group] - ORDER[b.group]) || (a.day < b.day ? 1 : a.day > b.day ? -1 : 0); }); }
  /* P16 [p15#7] (the P15 walk: the row looked like a card and a tap did nothing, so its open correction could not be reached from here):
   * today's set with something still to do or to correct, whose task is on her Today, is a button that opens that task as the Lessons rows
   * open theirs (jg-real.js openLesson: JG_API.openTask), by a tap or the keyboard, with the design's own row chevron (.dz-chev, its Dome
   * rows). A past or finished set stays a plain row. */
  function taskAt(id) { var E = W.JG_ENGINE, list = id && E && E.cache && typeof E.tasks === 'function' ? E.tasks(E.cache.local_date) || [] : []; for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return i; return -1; }
  function openable(r, today) { return r.day === today && !!r.task_id && (r.status === 'assigned' || r.status === 'handed_in') && !!W.JG_API && typeof W.JG_API.openTask === 'function' && taskAt(r.task_id) >= 0; }
  /* P16 final [p15#7] (the integrated re-check: the row and the Bugun tile of a set with "1 ta tuzatish qoldi" opened a sheet with only "✓
   * Bugun bajarildi": the corrections could not be started anywhere): `fixes` says the DONE task is a set handed in with corrections left,
   * so its sheet (M:023:892, D:022:894) starts them (JG_CHECKS.quiz; the server serves the corrections run, src/server/lessons/homework.ts
   * hwStart); `ended`, called by jg-checks.js when a homework run ends, puts its row right at once, then reads the rows again. */
  function fixes(task) { var id = task && task.id, rows = st.rows || []; for (var i = 0; i < rows.length; i++) if (id && rows[i].task_id === id && rows[i].status === 'handed_in' && (rows[i].corrections_left | 0) > 0) return true; return false; }
  function ended(id, left) { (st.rows || []).forEach(function (r) { if (id && r.task_id === id) { r.corrections_left = left | 0; r.status = (left | 0) > 0 ? 'handed_in' : 'complete'; } }); paintTab(); load(); }
  function rowHtml(r, l, today) {
    var x = words(l), when = r.day === today ? x.today : r.day === addDays(today, -1) ? x.yday : dayText(r.day, l);
    var sub = [when, x.qs(r.items | 0)];
    if (r.first) sub.push(x.first(r.first.right, r.first.of));
    if (r.corrections_left > 0) sub.push(x.left(r.corrections_left));
    var body = '<span class="jgw-rt"><b>' + esc((r.titles || []).join(', ')) + '</b><small>' + esc(sub.join(' · ')) + '</small></span>'
      + '<span class="jgw-chip">' + esc(x.st[r.status] || r.status) + '</span>';
    if (openable(r, today)) body = '<button class="jgw-go" type="button" data-task="' + esc(r.task_id) + '">' + body + '<i class="dz-chev" aria-hidden="true">›</i></button>';
    return '<li class="jgw-row jgw-' + esc(r.status) + '" data-day="' + esc(r.day) + '">' + body + '</li>';
  }
  function listHtml(rows, l, open, today) {
    var x = words(l), all = sorted(rows || []), shown = open ? all : all.slice(0, SHOW);
    return '<section class="jgw-hw" data-no-i18n><h2 class="jgw-hh">' + esc(x.hwH) + '</h2>'
      + (all.length ? '<ul class="jgw-list">' + shown.map(function (r) { return rowHtml(r, l, today); }).join('') + '</ul>' : '<p class="jgw-z">' + esc(x.empty) + '</p>')
      + (all.length > SHOW ? '<button class="jgw-more" type="button">' + esc(open ? x.less : x.all(all.length)) + '</button>' : '') + '</section>';
  }

  /* ---- where they go: the Lessons tab (phone #tv-lessons, laptop #v-lessons) above its Live row; Home (phone above the roadmap, laptop
   * under the greeting) ---- */
  function paintTab() {
    var page = $('tv-lessons') || $('v-lessons'), live = page && page.querySelector('.ls-live'); if (!page || !live) return;
    css();
    var host = $('jgw-tab'); if (!host) { host = D.createElement('div'); host.id = 'jgw-tab'; host.className = 'jgw-tab'; host.setAttribute('data-no-i18n', ''); live.parentNode.insertBefore(host, live); }
    var l = lang(), w = st.week ? weekHtml(st.week, st.week.first_day ? 'last' : 'this', l) : '';
    host.innerHTML = w + (st.rows ? listHtml(st.rows, l, st.open, st.today) : '');
  }
  function paintHome() {
    var old = $('jgw-home'); if (old) old.parentNode.removeChild(old);
    if (!st.week || !st.week.first_day || empty(st.week.last_week)) return;
    var rm = $('rm'), dash = D.querySelector('#v-home .dash-head'), at = rm || dash; if (!at) return;
    css();
    var host = D.createElement('div'); host.id = 'jgw-home'; host.className = 'jgw-home' + (rm ? ' jgw-phone' : ''); host.setAttribute('data-no-i18n', '');
    host.innerHTML = weekHtml(st.week, 'last', lang());
    if (rm) rm.parentNode.insertBefore(host, rm); else dash.parentNode.insertBefore(host, dash.nextSibling);
  }
  function paint() { paintTab(); paintHome(); }
  function load() {
    var l = lang(); st.lang = l;
    req('GET', '/api/v1/lessons/week').then(function (r) { return r && r.ok ? r.json() : null; }).then(function (j) { if (j && j.week) { st.week = j.week; st.today = st.today || j.week.today; paint(); } }, function () {});
    req('GET', '/api/v1/homework?lang=' + encodeURIComponent(l)).then(function (r) { return r && r.ok ? r.json() : null; }).then(function (j) { if (j && Array.isArray(j.homework)) { st.rows = j.homework; st.today = j.today || st.today; paintTab(); } }, function () {});
  }

  /* ---- 3. Jamol's one hint ---- */
  function hintBtn(run, item) {
    if (!run || !item) return '';
    var k = run + '|' + item, h = st.hints[k], x = words();
    if (h && h.text) return '<div class="jgw-hint" data-no-i18n role="status"><b>' + esc(x.hintH) + '</b> ' + esc(h.text) + '</div>';
    if (h && h.busy) return '<p class="jgw-hintp" data-no-i18n data-k="' + esc(k) + '">' + esc(x.hintBusy) + '</p>';
    if (h && h.no) return '<p class="jgw-hintp" data-no-i18n>' + esc(h.no) + '</p>';
    return '<button class="dg-link jgw-hintb" type="button" data-no-i18n data-run="' + esc(run) + '" data-item="' + esc(item) + '">' + esc(x.hint) + '</button>';
  }
  function askHint(btn) {
    var run = btn.getAttribute('data-run'), item = btn.getAttribute('data-item'), k = run + '|' + item, x = words();
    if (st.hints[k]) return;
    st.hints[k] = { busy: true };
    var put = function () { if (btn.isConnected !== false) btn.outerHTML = hintBtn(run, item); };
    put();
    req('POST', '/api/v1/lessons/hint?lang=' + encodeURIComponent(lang()), { run: run, item: item }).then(function (r) {
      if (!r) { st.hints[k] = { no: x.hintNo }; return finish(); }
      if (r.status === 429) { st.hints[k] = { no: x.hintCap }; return finish(); }
      if (!r.ok) { st.hints[k] = { no: x.hintNo }; return finish(); }
      return r.text().then(function (t) { t = String(t || '').trim(); st.hints[k] = t ? { text: t } : { no: x.hintNo }; finish(); }, function () { st.hints[k] = { no: x.hintNo }; finish(); });
    });
    function finish() { [].forEach.call(D.querySelectorAll('.jgw-hintp[data-k]'), function (p) { if (p.getAttribute('data-k') === k && p.parentNode) { var tmp = D.createElement('div'); tmp.innerHTML = hintBtn(run, item); p.parentNode.replaceChild(tmp.firstChild, p); } }); }
  }

  var cssDone = false;
  function css() {
    if (cssDone || $('jgw-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jgw-css';
    s.textContent = [
      '.jgw-tab{display:grid;gap:12px;margin:4px 22px 14px}',
      '#v-lessons .jgw-tab{margin:4px 0 18px;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);align-items:start}',
      '.jgw-home{margin:0 0 14px}.jgw-home.jgw-phone{margin:0 22px 14px}',
      '.jgw-card{padding:14px 16px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1.5px #e0eae5;font-family:var(--font)}',
      '.jgw-h{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:0 0 10px}',
      '.jgw-h b{font-size:15px;font-weight:800;color:var(--ink)}.jgw-h span{font-size:12px;font-weight:700;color:var(--muted)}',
      '.jgw-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}',
      '.jgw-t{display:grid;gap:2px;padding:10px 6px;border-radius:14px;background:#f5f8f6;text-align:center}',
      '.jgw-t b{font-size:20px;font-weight:800;line-height:1.1;color:var(--ink)}.jgw-t small{font-size:11px;font-weight:700;line-height:1.25;color:var(--muted);overflow-wrap:anywhere}',
      '.jgw-z{margin:10px 0 0;font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '.jgw-hw{padding:14px 16px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1.5px #e0eae5;font-family:var(--font)}',
      '.jgw-hh{margin:0 0 6px;font-size:15px;font-weight:800;color:var(--ink)}',
      '.jgw-list{display:grid;margin:0;padding:0;list-style:none}',
      '.jgw-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #edf2ef}.jgw-row:first-child{border-top:0}',
      '.jgw-rt{flex:1 1 auto;min-width:0;display:grid;gap:2px}.jgw-rt b{font-size:14px;font-weight:800;line-height:1.3;color:var(--ink);overflow-wrap:anywhere}',
      '.jgw-rt small{font-size:12px;font-weight:600;line-height:1.35;color:var(--muted)}',
      '.jgw-chip{flex:none;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:800;background:#edf2ef;color:var(--ink2)}',
      '.jgw-complete .jgw-chip{background:#dff2ef;color:#1f7a71}.jgw-handed_in .jgw-chip{background:#e8f0fb;color:#2f5f9e}.jgw-missing .jgw-chip{background:#fbeceb;color:#a63d36}',
      '.jgw-go{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:10px;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.jgw-go:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:12px}.jgw-go .dz-chev{margin-left:-4px;line-height:1}',
      '.jgw-more{display:block;margin:8px auto 0;padding:6px 10px;border:0;background:none;color:var(--accent);font:800 13px var(--font);cursor:pointer}',
      '.jgw-hintb{display:block;margin:8px auto 0}',
      '.jgw-hint{margin:8px 0 0;padding:10px 12px;border-radius:14px;background:#f5f8f6;font-size:14px;font-weight:600;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jgw-hint b{margin-right:4px;color:var(--ink2)}',
      '.jgw-hintp{margin:8px 0 0;font-size:13px;font-weight:600;line-height:1.45;color:var(--muted);text-align:center}',
      '@media (max-width:900px){#v-lessons .jgw-tab{grid-template-columns:minmax(0,1fr)}}'
    ].join('\n');
    D.head.appendChild(s);
  }

  D.addEventListener('click', function (e) {
    var t = e.target, b = t && t.closest ? t.closest('.jgw-hintb,.jgw-more,.jgw-go') : null; if (!b) return;
    if (b.classList.contains('jgw-more')) { st.open = !st.open; paintTab(); return; }
    if (b.classList.contains('jgw-go')) { var i = taskAt(b.getAttribute('data-task')); if (i >= 0 && W.JG_API && typeof W.JG_API.openTask === 'function') W.JG_API.openTask(i); return; }   // P16 [p15#7]
    e.preventDefault(); askHint(b);
  });

  W.JG_HW = { words: words, weekHtml: weekHtml, listHtml: listHtml, hintBtn: hintBtn, state: function () { return st; }, refresh: load, fixes: fixes, ended: ended };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', load); else load();
})();
