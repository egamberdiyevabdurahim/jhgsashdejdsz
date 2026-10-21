/* Jamals Global runtime: what looks real is real (owner 10 Oct 2026, delegated call, the teen walk).
 * Three teenagers walked the real pages and said what would make them close the app. This file takes the design's SAMPLES off a real
 * student's Explore and Lessons and draws the week row's circles from the server's own day records. Not design code, and no design line
 * changes: it works on what the design's scripts drew (public/d/student-mobile/js/008.js, 009.js, 023.js; the desktop twins 011.js, 013.js,
 * 022.js) and on the two arrays they share (window.JIA_DATA.opps and .subjects).
 * Loaded by src/server/pages.ts for a live, non-demo student only (a boot with an engine snapshot), deferred, after the design scripts. The
 * demo family and /preview never load it and keep the design's cards, its player and its week row.
 *
 * 1. EXPLORE. The design's cards are samples ("Tashkent Math Championship · Closes Oct 15", "Apply now" answers "✓ Applied" with no form and
 *    no link). For a real student they are taken out at once and the cards are the repo's sourced records, in the design's own card
 *    (GET /api/v1/explore, src/server/explore.ts: catalog C9, each record with its official page; a date only when the record has a verified
 *    one). The action is a link, "Official page" (a new tab, rel=noopener): nothing pretends to apply. The count says how many there are,
 *    not that they are "open". When the records fill nothing, one line stands instead of the cards: "Opportunities are coming soon."
 *    The second walk ("real and less mine"): the server orders and filters the list for this student (his class, his gender, his
 *    country, the field he named) and gives a card one short line why it is here (`why`: "7-sinf uchun · Oʻzbekiston", "Keyinroq:
 *    9-sinfdan"); the card shows it in its own stat line, and the opened ticket keeps the record's grades.
 * 2. LESSONS. The design's player runs a clock over a still picture; no lesson has a video yet. A lesson with no video (`video` on its
 *    record; none has one today) never shows a running player: its play area says "Video soon", the big button and the clock are hidden and
 *    cannot start, and the cards and the course list say the same in place of "▶ 18 min", so the list shows which lessons can be watched.
 *    The tab opens on the lessons the app has (GET /api/v1/lessons: her maths units, each opening its page), drawn as one row ABOVE the
 *    design's cards (part 2b below). The design's cards and their teachers stay as the owner ruled (4 Oct, R6, D19: placeholder teachers,
 *    test phase: each lesson card of a real student names its own teacher, and the teacher card opens from the player). Round 3 hid them
 *    for a live student on the controller's decision; that went against the ruling and is taken back (11 Oct).
 * 3. THE WEEK ROW. The design draws a past day as full (a tick, at four tasks done) or empty; it has no drawing for a partly done day. A
 *    real student's circle is ticked when the day counted for the streak (the snapshot's streak.kept: the server's day records), so a day
 *    worked never looks like a day never opened.
 * 4. THE ROADMAP'S OPENING LIST (the second walk: the heading "Your next 3 actions" over an empty list on day 1; the 17-year-old: "I came
 *    for what to do THIS month"). The design writes the heading and a list of the narration's next actions (M:023:773, D:022:775). When the
 *    view opens, this file reads that list once: with no line the heading and the list are hidden, with one or two the heading says one or
 *    two. For a student the snapshot gives a `month` (the application year and the year before; the server writes it, see snapshot.ts) the list is
 *    the next 30 days instead, in the design's own list: each line with its date, and a line that can open something is a button: today's
 *    task opens the design's task sheet, a step opens the design's own step sheet.
 * 5. THE ROADMAP'S STEPS DATED FOR TODAY. A step the server dated from a record when the page read it (the first SAT: the sitting still
 *    open and the last day to register) shows that line in the design's own row and sheet, with the record's official page as a link.
 * 6. THE ROADMAP'S ROUTES ("finish Korea and Türkiye"). A route chip stays only for a route a step of her roadmap stands on, and a route's
 *    own step shows its official address as a link when it is on the host of the step's own record page.
 * 7. THE HARD THING, SAID ONCE and 8. THE CHANCE PICTURE (the third round): see the two parts below; the snapshot's `truth` in the
 *    roadmap's opening and in Home's goal line, and the goal's circle where its number is.
 * 9. A REQUIREMENT'S CARD (the teenagers' second walk). A "what is required" task shows its record's official page as a button in the
 *    design's task sheet (the snapshot task's `page`); nobody pastes a link.
 *
 * Every word below is in English, Uzbek (U+02BB, U+02BC) and Russian, and what this file writes is marked data-no-i18n (the page's
 * dictionary never rewrites a record's words or these). window.JG_REAL: words(lang), watchable(lesson), official(card), exploreState(),
 * paintWeek(). tests/unit/jg-real-explore.test.ts, jg-real-lessons.test.ts, jg-real-week.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_REAL) return;

  var T = {
    en: { official: 'Official page', soon: 'Opportunities are coming soon.', list: 'Olympiads and competitions', count: function (n) { return String(n); },
      video: 'Video soon', short: 'Video soon', kept: 'you worked this day', route: { possible: 'possible', realistic: 'realistic' },
      next: function (n) { return n === 1 ? 'Your next task' : 'Your next ' + n + ' tasks'; } },
    uz: { official: 'Rasmiy sahifa', soon: 'Imkoniyatlar tez orada.', list: 'Olimpiada va tanlovlar', count: function (n) { return n + ' ta'; },
      video: 'Video tez orada', short: 'Video tez orada', kept: 'shu kuni ishladingiz', route: { possible: 'imkon bor', realistic: 'real' },
      next: function (n) { return n === 1 ? 'Navbatdagi vazifangiz' : 'Navbatdagi ' + n + ' ta vazifangiz'; } },
    ru: { official: 'Официальная страница', soon: 'Возможности скоро появятся.', list: 'Олимпиады и конкурсы', count: function (n) { return String(n); },
      video: 'Видео скоро будет', short: 'Видео скоро', kept: 'в этот день ты занимался', route: { possible: 'шанс есть', realistic: 'реально' },
      next: function (n) { return n === 1 ? 'Ваше ближайшее задание' : 'Ваши ближайшие ' + n + ' задания'; } }
  };
  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function words(l) { return T[l || lang()] || T.en; }
  function $(id) { return D.getElementById(id); }
  function mark(el) { if (el) el.setAttribute('data-no-i18n', ''); return el; }
  /* the design gives some of these a display of their own, which beats the hidden attribute */
  function show(el, on) { if (!el) return; el.hidden = !on; el.style.display = on ? '' : 'none'; }

  var API = W.JG_REAL = { words: words }, starts = [];        // each part below adds what it offers, and its own start

  /* ---------- 1. Explore ---------- */
  var ex ={ state: 'loading', lang: null, cards: [], busy: false };
  /* The official page of a card: https with no name or password in it (the server already kept it to the record's own hosts). */
  function official(c) {
    var u = null;
    try { u = new URL(String((c && c.url) || '')); } catch (e) { u = null; }
    return u && u.protocol === 'https:' && !u.username && !u.password ? u.href : null;
  }
  function opps() { return W.JIA_DATA && Array.isArray(W.JIA_DATA.opps) ? W.JIA_DATA.opps : null; }
  /* The design's own array, in place (its scripts hold the same one), then its own render (its "Show all" button calls it). */
  function setCards(cards) {
    var O = opps(); if (!O) return;
    O.length = 0;
    cards.forEach(function (c, i) { if (official(c)) O.push({ id: 9000 + i, rec: c.id, cat: c.cat, img: c.img, org: c.org, title: c.title, stat: c.stat, statL: c.statL, when: c.when, where: c.where, about: c.about, url: official(c), why: typeof c.why === 'string' ? c.why : '' }); });
    var all = $('ex-all'); if (all) all.click();
    paintExplore();
  }
  function paintExplore() {
    var O = opps(), w = words(), stack = $('ex-stack'), n = O ? O.length : 0;
    if (!stack) return;
    mark(stack); mark($('ex-pages'));
    var open = $('ex-open'); if (open) { mark(open); open.textContent = n ? w.count(n) : ''; show(open, !!n); }
    /* the categories: only the ones that hold a record, and no filter row for one category alone */
    var cats = $('ex-cats');
    if (cats) {
      var live = 0;
      [].forEach.call(cats.children, function (b) {
        var k = O ? O.filter(function (o) { return o.cat === b.getAttribute('data-cat'); }).length : 0, s = b.querySelector('span');
        show(b, !!k); if (k) live++;
        if (s) { mark(s); s.textContent = w.count(k); }
      });
      show(cats, live > 1);
      var head = cats.previousElementSibling; if (head && head.tagName === 'H2') show(head, live > 1);   // its heading, "Discover", goes with it
    }
    var title = $('ex-list-title'), all = $('ex-all'), filtered = !!all && !all.hidden;   // the design shows "Show all" only while a category filters the list
    if (title) {
      if (!filtered) { mark(title); if (title.textContent !== w.list) title.textContent = w.list; } else title.removeAttribute('data-no-i18n');
      show(title, !!n);
    }
    /* a card with no date has no date chip */
    [].forEach.call(stack.querySelectorAll('.when'), function (el) { if (!el.textContent.replace(/\s/g, '')) show(el, false); });
    /* why this card is in HIS list (the server's `why`: his class inside the record's grades and whose olympiad it is, or "later: from
       grade 9"), in the card's own stat line; the opened ticket keeps the record's grades. A card without it is as the design drew it. */
    [].forEach.call(stack.querySelectorAll('.ex-card'), function (card) {
      var t = card.querySelector('.ttl'), s = card.querySelector('.stat'), o = null;
      if (!t || !s || s.hasAttribute('data-jg-why')) return;
      for (var i = 0; O && i < O.length; i++) if (O[i].title === t.textContent) { o = O[i]; break; }
      if (!o || !o.why) return;
      var b = s.querySelector('b'), sp = s.querySelector('span');
      if (!sp) return;
      s.setAttribute('data-jg-why', ''); if (b) show(b, false); sp.textContent = o.why;
    });
    var line = $('jg-explore-soon');
    if (ex.state === 'empty') {
      if (!line) { line = D.createElement('p'); line.id = 'jg-explore-soon'; line.className = 'pf-empty'; mark(line); stack.parentNode.insertBefore(line, stack.nextSibling); }
      line.textContent = w.soon; show(line, true);
    } else if (line) show(line, false);
  }
  /* The ticket: the design writes a button that toggles "✓ Applied"; a real card's action is its official page, as a link. */
  function paintTickets() {
    var pages = $('ex-pages'), O = opps(); if (!pages || !O) return;
    [].forEach.call(pages.querySelectorAll('.ex-apply'), function (b) {
      if (b.tagName === 'A') return;
      var o = null, id = +b.getAttribute('data-id');
      for (var i = 0; i < O.length; i++) if (O[i].id === id) o = O[i];
      var a = D.createElement('a');
      a.className = 'ex-apply'; a.setAttribute('data-jg-official', ''); mark(a);
      a.style.display = 'inline-flex'; a.style.alignItems = 'center'; a.style.textDecoration = 'none';
      if (o && o.url) { a.href = o.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = words().official + ' ↗'; }
      else show(a, false);
      a.addEventListener('click', function (e) { e.stopPropagation(); });          // the design's "applied" toggle never hears it
      b.parentNode.replaceChild(a, b);
    });
    [].forEach.call(pages.querySelectorAll('.ex-meta span, .ex-stat, .ex-statl'), function (el) { if (!el.textContent.replace(/\s/g, '')) el.style.display = 'none'; });
  }
  function loadExplore() {
    var l = lang();
    if (ex.busy || (ex.lang === l && ex.state !== 'failed')) return;
    ex.busy = true;
    fetch('/api/v1/explore?lang=' + encodeURIComponent(l), { headers: { 'x-jg-uid': B.uid }, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) {
        ex.busy = false;
        if (!j || !Array.isArray(j.cards)) { ex.state = 'failed'; paintExplore(); return; }   // nothing is shown, and the next opening asks again
        ex.lang = l; ex.cards = j.cards.filter(official); ex.state = ex.cards.length ? 'cards' : 'empty';
        setCards(ex.cards);
      });
  }
  function startExplore() {
    var O = opps(), stack = $('ex-stack'), pages = $('ex-pages'), page = $('tv-explore') || $('v-explore');   // the phone's tab, the laptop's view
    if (!O || !stack) return;
    setCards([]);                                              // the samples go before the tab can be opened
    new MutationObserver(function () { paintExplore(); }).observe(stack, { childList: true });
    if (pages) new MutationObserver(function () { paintTickets(); }).observe(pages, { childList: true });
    if (page) new MutationObserver(function () { if (page.classList.contains('show')) loadExplore(); }).observe(page, { attributes: true, attributeFilter: ['class'] });
    loadExplore();
  }
  API.official = official; API.paintExplore = paintExplore; API.exploreState = function () { return { state: ex.state, lang: ex.lang, cards: ex.cards.length }; };
  starts.push(startExplore);

  /* ---------- 2. Lessons ---------- */
  var ls = { s: null, i: 0 };
  function watchable(l) { return !!(l && typeof l.video === 'string' && l.video); }
  function lessonAt(s, i) { var S = W.JIA_DATA && W.JIA_DATA.subjects; return S && S[s] && S[s].lessons ? S[s].lessons[i] || null : null; }
  function paintCards() {
    var w = words();
    [].forEach.call(D.querySelectorAll('#ls-subjects .ls-card'), function (c) {
      var l = lessonAt(+c.getAttribute('data-s'), +c.getAttribute('data-i')), d = c.querySelector('.ls-dur');
      if (!l || watchable(l) || !d) return;
      mark(d); d.textContent = w.short; d.setAttribute('data-jg-novideo', '');
    });
  }
  function paintPlayer() {
    var player = $('ls-player'), big = $('ls-big'), ctrl = $('ls-ctrl'), list = $('ls-list'), w = words();
    if (!player) return;
    /* a real course's lesson (public/runtime/jg-lessons.js marks the screen data-jgl): its reader is in the player slot, not "Video soon" */
    var own = $('ls-detail') && $('ls-detail').hasAttribute('data-jgl');
    var live = ls.s === null || own, l = live ? null : lessonAt(ls.s, ls.i), off = !live && !watchable(l), pill = $('jg-novideo');
    if (off) {
      if (big && !big.hidden) big.hidden = true;
      if (ctrl && !ctrl.hidden) ctrl.hidden = true;
      if (player.classList.contains('playing')) { var pp = $('ls-pp'); if (pp) pp.click(); }   // never left running
      if (!pill) {
        pill = D.createElement('span'); pill.id = 'jg-novideo'; pill.className = 'ls-pill soon'; mark(pill);
        pill.style.left = '50%'; pill.style.top = 'auto'; pill.style.bottom = '14px'; pill.style.transform = 'translateX(-50%)'; pill.style.padding = '7px 14px'; pill.style.fontSize = '12.5px'; pill.style.whiteSpace = 'nowrap';
        player.appendChild(pill);
      }
      pill.textContent = w.video; show(pill, true);
    } else if (pill) show(pill, false);
    if (list && !live) [].forEach.call(list.querySelectorAll('.ls-item[data-k]'), function (li) {
      var x = lessonAt(ls.s, +li.getAttribute('data-k')), d = li.querySelector('.ls-itd');
      if (!x || watchable(x) || !d || d.textContent === w.short) return;
      mark(d); d.textContent = w.short;
    });
  }
  function startLessons() {
    var subs = $('ls-subjects'), liveRow = $('ls-live-row'), list = $('ls-list'), big = $('ls-big'), ctrl = $('ls-ctrl');
    /* P8c item 4 (the teen walk of 14 Oct): the design's "AI" badge on "Ask Jamol about any lesson" only while Jamol's AI can answer (the
     * AI notice live: its key and notice version, JG_BOOT.aiNotice); without it Ask Jamol is the page's own lesson finder, and says no "AI" */
    var ai = $('ls-ask') && $('ls-ask').querySelector('em'); if (ai && !B.aiNotice) ai.style.display = 'none';
    if (!subs || !$('ls-player')) return;
    paintCards();
    /* which lesson the player holds: the card or the list row that opened it (capture: before the design's own handler draws it) */
    subs.addEventListener('click', function (e) { var c = e.target.closest ? e.target.closest('.ls-card') : null; if (c) { ls.s = +c.getAttribute('data-s'); ls.i = +c.getAttribute('data-i'); } }, true);
    if (liveRow) liveRow.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.ls-lcard')) ls.s = null; }, true);
    if (list) {
      list.addEventListener('click', function (e) { var li = e.target.closest ? e.target.closest('.ls-item[data-k]') : null; if (li && ls.s !== null) ls.i = +li.getAttribute('data-k'); }, true);
      new MutationObserver(paintPlayer).observe(list, { childList: true, attributes: true, attributeFilter: ['class'], subtree: true });
    }
    /* a lesson with no video cannot start: the design shows its buttons again each time it opens one */
    [big, ctrl].forEach(function (el) { if (el) new MutationObserver(paintPlayer).observe(el, { attributes: true, attributeFilter: ['hidden'] }); });
    [big, $('ls-pp')].forEach(function (el) {
      if (el) el.addEventListener('click', function (e) { if (ls.s !== null && !watchable(lessonAt(ls.s, ls.i)) && !$('ls-player').classList.contains('playing')) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    });
  }
  API.watchable = watchable; API.paintPlayer = paintPlayer;
  starts.push(startLessons);

  /* ---------- 2b. The shelf: the lessons that exist, one row above the design's cards (the second walk) ----------
   * The tab opens on the lessons the app does have (GET /api/v1/lessons, src/server/lessons.ts: the maths units from where her
   * lessons start and the next ones), in the design's own row and card, drawn beside the design's list and never inside it (the design's
   * click handler opens its player). A lesson that is one of today's tasks opens the design's task sheet, where its three questions are; any
   * other opens the lesson itself to read (the idea, the worked example, the warning). With no lesson (the scheduler's switch off, no maths check yet)
   * the row is not drawn.
   * THE DESIGN'S CARDS ARE NEVER HIDDEN HERE. Round 3 hid every subject row with nothing to watch and put one "videos are not recorded yet"
   * line in their place; that took the placeholder teachers off a real student's lesson cards, against the owner's ruling of 4 Oct (R6,
   * D19), so both the hiding and its line are gone: each card says "Video soon" itself (part 2) and names its teacher (the runtime's
   * JG_ENGINE.teacher), and the teacher card opens from the player. tests/smoke/teachers.ts walks it. */
  var LW = {
    en: { n: function (n) { return n === 1 ? '1 lesson' : n + ' lessons'; }, min: function (m) { return m + ' min'; }, today: 'Today’s task', done: '✓ Done', read: 'Read the lesson',
      later: 'The three questions on this lesson come as a task on its day.', did: 'You have done this lesson. Read it again any time.', close: 'Close' },
    uz: { n: function (n) { return n + ' ta dars'; }, min: function (m) { return m + ' daq'; }, today: 'Bugungi vazifa', done: '✓ Bajarildi', read: 'Darsni oʻqish',
      later: 'Bu dars boʻyicha uchta savol oʻz kunida vazifa boʻlib keladi.', did: 'Bu darsni bajargansiz. Istagan payt qayta oʻqing.', close: 'Yopish' },
    ru: { n: function (n) { var a = n % 10, b = n % 100; return n + (a === 1 && b !== 11 ? ' урок' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? ' урока' : ' уроков'); },
      min: function (m) { return m + ' мин'; }, today: 'Задание на сегодня', done: '✓ Готово', read: 'Прочитать урок',
      later: 'Три вопроса по этому уроку придут заданием в свой день.', did: 'Этот урок вы уже прошли. Его можно перечитать в любое время.', close: 'Закрыть' }
  };
  var shelf = { state: 'loading', lang: null, list: [], busy: false, stale: false };
  function lw() { return LW[lang()] || LW.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* The lesson itself, to read: the design's own bottom sheet (.cm-sheet, as its Share sheet), the text with the record's own lines. */
  function readLesson(l) {
    var w = lw(), s = $('jg-lesson');
    if (!s) {
      s = D.createElement('div'); s.id = 'jg-lesson'; s.className = 'cm-sheet'; s.hidden = true; mark(s);
      s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true'); s.setAttribute('aria-labelledby', 'jg-lesson-t');
      var host = $('sh-sheet'); (host && host.parentNode ? host.parentNode : D.body).appendChild(s);
      s.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-jg-close]')) s.hidden = true; });
    }
    s.innerHTML = '<div class="cm-sheet-bg" data-jg-close></div><div class="cm-sheet-card" style="max-height:86%"><h3 id="jg-lesson-t">' + esc(l.title) + '</h3>'
      + '<p class="cm-note">' + esc((l.subject ? l.subject + ' · ' : '') + w.min(l.minutes)) + '</p>'
      + '<div id="jg-lesson-x" style="flex:1;min-height:0;overflow-y:auto;margin-top:12px;white-space:pre-line;font-size:14.5px;line-height:1.55;color:var(--ink)">' + esc(l.text) + '</div>'
      + '<p class="cm-note" style="margin-top:12px">' + esc(l.state === 'done' ? w.did : w.later) + '</p>'
      + '<button class="pf-btn ghost" type="button" data-jg-close style="margin-top:12px">' + esc(w.close) + '</button></div>';
    s.hidden = false;
  }
  function openLesson(l) {
    var A = W.JG_API, E = W.JG_ENGINE;
    if (l.state === 'today' && l.task_id && A && typeof A.openTask === 'function' && E && E.cache && typeof E.tasks === 'function') {
      var list = E.tasks(E.cache.local_date) || [];
      for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === l.task_id) { A.openTask(i); return; }
    }
    readLesson(l);
  }
  function paintShelf() {
    var subs = $('ls-subjects'), w = lw();
    if (!subs) return;
    /* the design's subject rows, their cards and their teachers are left as drawn (the owner's 4 Oct ruling, R6, D19) */
    /* The fifth walk (11 Oct 2026, the 15-year-old: "the English lessons, the best new thing, are not in the Lessons tab"): A ROW A SUBJECT,
     * each under its own heading with its own count and its own numbers, in the list's order (maths, then English): the first is
     * #jg-lessons as before, the next ones #jg-lessons-2, … right after it, all above the design's cards. A card's data-jg-lesson is
     * still its place in the whole list. */
    var L = shelf.list, G = [], at = {}, rid = function (g) { return g ? 'jg-lessons-' + (g + 1) : 'jg-lessons'; };
    L.forEach(function (l, i) { var k = 's:' + (l.subject || ''); if (!(k in at)) { at[k] = G.length; G.push({ subject: l.subject || '', items: [] }); } G[at[k]].items.push({ l: l, i: i }); });
    for (var x = G.length; $(rid(x)); x++) show($(rid(x)), false);            // a row whose subject has left the list
    if (!L.length) return;
    var img = (W.JIA_IMG && W.JIA_IMG.backpack) || '', prev = null;
    G.forEach(function (S, g) {
      var row = $(rid(g));
      if (!row) {
        row = D.createElement('section'); row.id = rid(g); row.className = 'ls-sub'; mark(row);
        row.setAttribute('style', '--g1:#e6f5eb;--g2:#cde9da;--ink2:#1e684a;--sh:rgba(30, 104, 74, .14)');
        var live = $('ls-live-row'), before = prev ? prev.nextSibling : (live && live.closest ? live.closest('section') : null) || subs;
        (prev ? prev.parentNode : (before || subs).parentNode).insertBefore(row, before);
        row.addEventListener('click', function (e) { var c = e.target.closest ? e.target.closest('[data-jg-lesson]') : null, l = c ? shelf.list[+c.getAttribute('data-jg-lesson')] : null; if (l) openLesson(l); });
      }
      row.innerHTML = '<div class="ls-head ls-pad"><span class="ls-ic" aria-hidden="true">' + (img ? '<img src="' + esc(img) + '" alt="">' : '') + '</span><h2>' + esc(S.subject) + '</h2><span class="ls-n">' + esc(w.n(S.items.length)) + '</span></div>'
        + '<div class="ls-row">' + S.items.map(function (it, n) {
          var l = it.l, st = l.state === 'done' ? w.done : l.state === 'today' ? w.today : w.read;
          return '<button class="ls-card" type="button" data-jg-lesson="' + it.i + '" aria-label="' + esc(l.title + ', ' + w.min(l.minutes) + ', ' + st) + '">'
            + '<span class="ls-cover"><span class="ls-num" aria-hidden="true">' + (n < 9 ? '0' : '') + (n + 1) + '</span>' + (img ? '<img src="' + esc(img) + '" alt="">' : '')
            + '<span class="ls-dur">' + esc(w.min(l.minutes)) + '</span></span>'
            + '<span class="ls-body"><span class="ls-ttl">' + esc(l.title) + '</span><span class="ls-meta' + (l.state === 'done' ? ' done' : '') + '">' + esc(st) + '</span></span></button>';
        }).join('') + '</div>';
      show(row, true); prev = row;
    });
  }
  function loadShelf() {
    var l = lang();
    if (shelf.busy || (shelf.lang === l && shelf.state !== 'failed' && !shelf.stale)) { paintShelf(); return; }
    shelf.busy = true;
    fetch('/api/v1/lessons?lang=' + encodeURIComponent(l), { headers: { 'x-jg-uid': B.uid }, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) {
        shelf.busy = false; shelf.stale = false;
        if (!j || !Array.isArray(j.lessons)) { shelf.state = 'failed'; shelf.list = []; paintShelf(); return; }   // no card; the next opening asks again
        shelf.lang = l; shelf.state = 'ready';
        /* P6 lane A5 (SPEC-lessons §10.1, the owner's 12 Oct 2026 "lessons va lesson h/w qism"): with the lessons part on the answer holds her
         * courses, and their rows replace this row a subject: public/runtime/jg-lessons.js on the phone (handed this answer here) and
         * jg-lessons-desktop.js on the laptop (it asks for its own), so the shelf draws no row of its own */
        if (Array.isArray(j.courses)) { shelf.list = []; paintShelf(); W.JG_LESSONS_DATA = j; if (W.JG_LESSONS && W.JG_LESSONS.courses) W.JG_LESSONS.courses(j); return; }
        shelf.list = j.lessons.filter(function (x) { return x && typeof x.title === 'string' && typeof x.text === 'string' && x.minutes > 0; });
        paintShelf();
      });
  }
  function startShelf() {
    var subs = $('ls-subjects'), page = $('tv-lessons') || $('v-lessons');   // the phone's tab, the laptop's view
    if (!subs) return;
    paintShelf();
    /* each opening asks again once a task was done since (a lesson done today says so) */
    if (page) new MutationObserver(function () { if (page.classList.contains('show')) { shelf.stale = shelf.state === 'ready'; loadShelf(); } }).observe(page, { attributes: true, attributeFilter: ['class'] });
    loadShelf();
  }
  API.paintShelf = paintShelf; API.shelfState = function () { return { state: shelf.state, lang: shelf.lang, lessons: shelf.list.length }; };
  starts.push(startShelf);

  /* ---------- 2c. The Today tab's list is today's (the second walk: "Последние задания" over the tasks of today) ----------
   * The design heads its sample list "Recent tasks". A real student's list is today's tasks (M:006:20), so its heading says so. */
  var TODAY_H = { en: 'Today’s tasks', uz: 'Bugungi vazifalar', ru: 'Задания на сегодня' };
  function paintTodayHead() { var h = $('rt-title'), t = TODAY_H[lang()] || TODAY_H.en; if (h && h.textContent !== t) { mark(h); h.textContent = t; } }
  function startTodayHead() {
    var h = $('rt-title'), page = $('tv-today') || $('v-today');
    if (!h) return;
    paintTodayHead();
    new MutationObserver(paintTodayHead).observe(h, { childList: true, characterData: true, subtree: true });   // the page's dictionary, a language change
    if (page) new MutationObserver(paintTodayHead).observe(page, { attributes: true, attributeFilter: ['class', 'hidden'] });
  }
  API.paintTodayHead = paintTodayHead;
  starts.push(startTodayHead);

  /* ---------- 3. The week row ---------- */
  /* The fourth walk (the 15-year-old: "What I earn disappears. Sunday was a full gold day; on Monday the week row is empty ... and there is no
   * streak number anywhere on Home on any day"; the 13-year-old: "a day that ended at 75% and never opened keeps the same tick as a gold
   * day"). Two things, both read from the day records the snapshot carries (streak.kept, streak.opened, streak.current; no rule here):
   *  - a day whose building OPENED is drawn gold in the row, a day only kept keeps the design's green tick, any other day is empty;
   *  - the streak's number stands by the row, in the design's own place for it (#jt-streak, M:023:867 = D:022:869: empty and hidden as
   *    drawn), written as the League card writes it ("🔥 3", M:010:1381). Grey at 0, gold when today or yesterday opened: on a Monday
   *    yesterday's gold is no circle of this week's row, so the number carries it. A tap says in one line what it counts.
   * The styles are the server's (src/server/pages.ts "jg-ends"). */
  var STREAK = {
    en: { label: function (n) { return 'Days in a row: ' + n; }, tip: function (n) { return 'Days in a row: ' + n + '. A day counts when you finish one task or really try it. A gold circle is a day you finished everything.'; },
      zero: 'No days in a row yet. Finish one task today, or really try it, and this becomes 1.', yest: ' Yesterday was a gold day.', gold: 'a gold day: every task done' },
    uz: { label: function (n) { return 'Ketma-ket kunlar: ' + n; }, tip: function (n) { return 'Ketma-ket kunlar: ' + n + '. Bitta vazifani bajarsangiz yoki chindan urinib koʻrsangiz, kun hisobga oʻtadi. Oltin doira: hamma vazifa bajarilgan kun.'; },
      zero: 'Hali ketma-ket kun yoʻq. Bugun bitta vazifani bajaring yoki chindan urinib koʻring: bu yerda 1 chiqadi.', yest: ' Kecha oltin kun edi.', gold: 'oltin kun: hamma vazifa bajarilgan' },
    ru: { label: function (n) { return 'Дней подряд: ' + n; }, tip: function (n) { return 'Дней подряд: ' + n + '. День считается, если вы сделали одно задание или честно попробовали. Золотой круг: день, когда сделано всё.'; },
      zero: 'Пока нет дней подряд. Сделайте сегодня одно задание или честно попробуйте: здесь появится 1.', yest: ' Вчера был золотой день.', gold: 'золотой день: сделаны все задания' }
  };
  function streakWords() { return STREAK[lang()] || STREAK.en; }
  function ymdBefore(key) { var p = String(key || '').split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] - 1); return isNaN(d) ? '' : d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  /** What the number by the week row says: { n, gold (today or yesterday opened), yesterday (yesterday opened) }, or null without a streak. */
  function streakNow() {
    var E = W.JG_ENGINE, s = E && E.cache && E.cache.streak;
    if (!s || typeof s.current !== 'number') return null;
    var o = Array.isArray(s.opened) ? s.opened : [], today = E.cache.local_date, y = ymdBefore(today);
    /* The fifth walk (11 Oct 2026, the 15-year-old: "'🔥 2' and a week tick beside '0% bajarildi' ... the flame is drawn gold even when the
     * day is not opened"; the controller's decision): the number is gold only on a day she OPENED (today's building open). A day kept by a
     * try, and a day not yet opened after a gold yesterday, show it plain (the server's style: a quiet chip, no gold, no orange);
     * yesterday's gold is still said in the tap's line. It was gold when today OR yesterday opened (the fourth walk). */
    return { n: Math.max(0, s.current | 0), gold: s.current > 0 && o.indexOf(today) !== -1, yesterday: o.indexOf(y) !== -1 };
  }
  function streakTip() { var s = streakNow(), w = streakWords(); return !s ? null : s.n === 0 ? w.zero : w.tip(s.n) + (s.yesterday ? w.yest : ''); }
  function paintStreak() {
    var el = $('jt-streak'), s = streakNow(), w = streakWords();
    if (!el || !s) return;
    var text = '🔥 ' + s.n;
    if (el.parentNode && el.parentNode.setAttribute) el.parentNode.setAttribute('data-jg-streak', '');   // the row makes room (the server's style)
    mark(el); el.hidden = false; el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', w.label(s.n));
    if (el.textContent !== text) el.textContent = text;
    if (s.n === 0) el.setAttribute('data-zero', ''); else el.removeAttribute('data-zero');
    if (s.gold) el.setAttribute('data-gold', ''); else el.removeAttribute('data-gold');
    if (!el._jgKey) { el._jgKey = true; el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var l = streakTip(); if (l) { e.preventDefault(); showTip(l); } } }); }
  }
  function paintWeek() {
    var row = $('jt-week'), E = W.JG_ENGINE, kept = E && E.cache && E.cache.streak && E.cache.streak.kept;
    if (!row || !Array.isArray(kept)) return 0;
    var opened = Array.isArray(E.cache.streak.opened) ? E.cache.streak.opened : [];
    var now = new Date(), mon = new Date(now), n = 0, k = 0;
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));                       // the row's own Monday (M:023:863), and each circle by its date
    [].forEach.call(row.children, function (el) {
      if (el.tagName !== 'SPAN') return;
      var day = new Date(mon); day.setDate(mon.getDate() + k++);
      var key = day.getFullYear() + '-' + ('0' + (day.getMonth() + 1)).slice(-2) + '-' + ('0' + day.getDate()).slice(-2), i = el.querySelector('i');
      if (!i || el.classList.contains('rest')) return;
      if (opened.indexOf(key) !== -1) { el.classList.add('full'); el.setAttribute('data-jg-gold', ''); i.textContent = '✓'; el.title = streakWords().gold; n++; return; }
      if (kept.indexOf(key) === -1 || el.classList.contains('full')) return;
      el.classList.add('full'); el.setAttribute('data-jg-kept', ''); i.textContent = '✓'; el.title = words().kept; n++;
    });
    paintStreak();
    return n;
  }
  function startWeek() {
    var tasks = $('wd-tasks');
    if (tasks && tasks.parentNode) new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) if (ms[i].addedNodes[j].id === 'jt-week') { paintWeek(); return; }
    }).observe(tasks.parentNode, { childList: true });
    D.addEventListener('jg:snapshot', function () { setTimeout(paintWeek, 0); });
    paintWeek();
  }
  API.paintWeek = paintWeek;
  starts.push(startWeek);

  /* ---------- 4. The roadmap's opening list ---------- */
  /* What a line opens: today's task (the design's own task sheet, JG_API.openTask) or the roadmap step (the design's own row, which opens
   * its sheet); null when the page holds neither (a task of another day with no step in the list shown). */
  function target(it) {
    var E = W.JG_ENGINE, view = $('jr-view'), A = W.JG_API;
    if (!it || !E || !E.cache) return null;
    if (it.task_id && it.date === E.cache.local_date && A && typeof A.openTask === 'function') {
      var list = E.tasks(E.cache.local_date) || [];
      for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === it.task_id) return (function (k) { return function () { A.openTask(k); }; })(i);
    }
    var row = it.milestone_id && view ? view.querySelector('.jr-m[data-m="' + String(it.milestone_id).replace(/[^\w-]/g, '') + '"]') : null;
    if (row) return function () { row.click(); };
    /* a home university he chose: its own page (public/runtime/jg-unis.js), where its requirements, dates and sources are */
    var U = W.JG_UNIS;
    return it.uni && U && typeof U.open === 'function' ? function () { U.open(String(it.uni)); } : null;
  }
  /* One line of the month: its words, what a tap opens, and (the third round) the official page its date is published on as a button
   * beside it: https with no name or password, a new tab, and a tap on it never opens the line's own sheet. */
  function monthLine(it) {
    var li = D.createElement('li'), go = target(it), s = D.createElement('span');
    s.textContent = String(it.text_i18n || ''); li.appendChild(s); mark(li); li.setAttribute('data-jg-kind', String(it.kind || ''));
    if (go) {
      li.setAttribute('role', 'button'); li.tabIndex = 0; li.style.cursor = 'pointer'; s.style.textDecoration = 'underline'; s.style.textUnderlineOffset = '3px';
      li.addEventListener('click', go);
      li.addEventListener('keydown', function (e) { if (e.target === li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(); } });
    }
    var href = official({ url: it.url });
    if (href) {
      var a = D.createElement('a');
      a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('data-jg-official', ''); a.textContent = words().official + ' ↗';
      a.style.display = 'inline-block'; a.style.margin = '2px 0 0 8px'; a.style.padding = '2px 10px'; a.style.borderRadius = '999px'; a.style.border = '1px solid currentColor';
      a.style.color = 'inherit'; a.style.textDecoration = 'none'; a.style.fontSize = '.86em'; a.style.fontWeight = '700'; a.style.whiteSpace = 'nowrap';
      a.addEventListener('click', function (e) { e.stopPropagation(); });
      li.appendChild(a);
    }
    return li;
  }
  /* `again`: draw the month once more from the snapshot the page holds now (a task was completed while the view is open: its line must
   * not stay). The design's own list is drawn once a render, so only a list this file wrote is drawn again. */
  function paintHero(again) {
    var view = $('jr-view'), hero = view && !view.hidden ? view.querySelector('.jr-hero') : null, h = hero && hero.querySelector('.jr-next-h'), ul = hero && hero.querySelector('ul');
    if (!h || !ul) return 0;
    var was = ul.getAttribute('data-jg-list');
    if (was !== null && !(again === true && was === 'month')) return 0;         // once a render: the design writes a new list each time the view opens
    var E = W.JG_ENGINE, M = E && E.cache && E.cache.month, items = M && Array.isArray(M.items) ? M.items : null;
    if (was === 'month' && !items) return 0;
    ul.setAttribute('data-jg-list', items ? 'month' : 'next');
    [].forEach.call(hero.querySelectorAll('[data-jg-next]'), function (el) { el.parentNode.removeChild(el); });
    if (items) {
      ul.textContent = '';
      items.forEach(function (it) { ul.appendChild(monthLine(it)); });
      mark(h).textContent = String(M.heading_i18n || '');
    }
    var n = ul.children.length;
    if (!items && n > 0 && n < 3) mark(h).textContent = words().next(n);        // the heading never promises three over one or two
    show(h, n > 0); show(ul, n > 0);                                            // and never stands over nothing
    /* a date beyond the 30 days is not under their heading: one line of its own, under its own words, in the design's own two elements */
    if (items && M.next && M.next.text_i18n) {
      var nh = h.cloneNode(false), nl = ul.cloneNode(false);
      nh.removeAttribute('id'); nl.removeAttribute('id'); nl.removeAttribute('data-jg-list');
      nh.setAttribute('data-jg-next', ''); nl.setAttribute('data-jg-next', ''); mark(nh); mark(nl);
      nh.textContent = String(M.next_heading_i18n || ''); nl.appendChild(monthLine(M.next));
      show(nh, true); show(nl, true);
      ul.parentNode.insertBefore(nh, ul.nextSibling); nh.parentNode.insertBefore(nl, nh.nextSibling);
    }
    return n;
  }
  /* ---------- 5. The roadmap's steps dated for today ---------- */
  /* Owner 10 Oct 2026 (delegated call, the teen walk: "SAT: first sitting · by Oct 2026 · Now", in its sheet "Planned date: 10 Oct 2026", the
   * day the account was made). The server dates the roadmap's test steps for today when the page reads it: a step may carry `when_i18n`
   * (its date line in the roadmap's language: the sitting's day and the last day to register, or "date on the official page"),
   * `source_i18n` (the sheet's source words) and `official_url` (the official page, from a record). No design line changes: the design
   * draws the roadmap's list (#jr-view .jr-m[data-m] small: the date, then " · " and the route when the step has one) and a step's sheet
   * (#jr-sheet: .jr-due, .jr-src p) as before, and this pass writes those three things into them, once per element. A step without the
   * fields is left as the design drew it. (The pass was jg-links.js's while the server dated the steps behind the scheduler's switch
   * only; the first SAT is now dated in every switch state, so it is here, for every live student.) */
  var lastStep = null;
  function stepOf(id) {
    var R = W.JG_ENGINE && W.JG_ENGINE.cache && W.JG_ENGINE.cache.roadmap, L = (R && R.milestones) || [];
    for (var i = 0; i < L.length; i++) if (L[i] && L[i].id === id) return L[i];
    return null;
  }
  function paintSteps() {
    var view = $('jr-view');
    if (!view || view.hidden) return;
    var rows = view.querySelectorAll('.jr-m[data-m]');
    for (var i = 0; i < rows.length; i++) {
      var m = stepOf(rows[i].getAttribute('data-m')), s = rows[i].querySelector('.jr-mt > small');
      if (!m || !m.when_i18n || !s || s.getAttribute('data-jg-when') === m.when_i18n) continue;
      var t = s.textContent, at = m.route !== 'all' ? t.lastIndexOf(' · ') : -1;   // the route part the design wrote stays
      s.textContent = m.when_i18n + (at >= 0 ? t.slice(at) : '');
      s.setAttribute('data-jg-when', m.when_i18n); mark(s);
    }
    var sheet = $('jr-sheet'), st = sheet && lastStep ? stepOf(lastStep) : null;
    if (!sheet || !st || sheet.getAttribute('data-jg-step') === st.id) return;
    sheet.setAttribute('data-jg-step', st.id);
    var due = sheet.querySelector('.jr-due'), src = sheet.querySelector('.jr-src p');
    if (st.when_i18n && due) { due.textContent = st.when_i18n.charAt(0).toUpperCase() + st.when_i18n.slice(1); mark(due); }
    if (st.source_i18n && src) {
      src.textContent = st.source_i18n; mark(src);
      var u = null; try { u = new URL(st.official_url); } catch (e) { u = null; }
      if (u && u.protocol === 'https:' && !u.username && !u.password) {
        var a = D.createElement('a');
        a.href = u.href; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-jg-link', '');
        a.style.color = 'inherit'; a.style.textDecoration = 'underline'; a.style.overflowWrap = 'anywhere';
        a.appendChild(D.createTextNode(u.host + (u.pathname === '/' ? '' : u.pathname)));
        src.appendChild(D.createTextNode(' ')); src.appendChild(a);
      }
    }
  }
  API.paintSteps = paintSteps;

  function startRoad() {
    if (typeof W.MutationObserver !== 'function' || !D.body) return;
    D.addEventListener('click', function (e) { var b = e.target && e.target.closest ? e.target.closest('#jr-view [data-m]') : null; if (b) lastStep = b.getAttribute('data-m'); }, true);
    var both = function () { paintHero(); paintSteps(); };
    new W.MutationObserver(both).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    /* round 2's leftover: a task completed while the roadmap is open leaves the month's list at once (the server's new snapshot) */
    D.addEventListener('jg:snapshot', function () { setTimeout(function () { paintHero(true); }, 0); });
    both();
  }
  API.paintHero = paintHero;
  starts.push(startRoad);

  /* ---------- 6. The roadmap: a chip only for a route she has; a route step's official address is a link ----------
   * Owner 10 Oct 2026 (delegated call, the teen walk, "finish Korea and Türkiye"). No design line changes.
   * (a) The design draws one filter chip a ticked country (#jr-view .jr-routes [data-route]). A student who ticked the US and named only
   *     Korean and Turkish universities has no US step on her roadmap (src/engine/plan.ts dropUS), and "AQSH · orzu" filtered to nothing. A
   *     chip whose route no step of the stored roadmap stands on is taken out; "All routes" always stays.
   * (b) A route's own step (kind route_*: the call, the language test, the documents, the application) ends its words with the official
   *     page's address as plain text (#jr-sheet .jr-why). It is drawn as a link when it is https, carries no name or password and is on the
   *     host of the step's own record page (the snapshot's `source_url`: that host or a name under it), the way public/runtime/jg-links.js
   *     draws a task's address. Any other address in the words stays text. */
  function roadmapSteps() { var E = W.JG_ENGINE, R = E && E.cache && E.cache.roadmap; return (R && R.milestones) || []; }
  function paintRoutes() {
    var view = $('jr-view'), L = roadmapSteps(), n = 0;
    if (!view || view.hidden || !L.length) return 0;
    var RW = (W.JG_ENGINE.cache && W.JG_ENGINE.cache.route_words) || {}, w = words();
    [].forEach.call(view.querySelectorAll('.jr-routes [data-route]'), function (b) {
      var id = b.getAttribute('data-route');
      if (id === 'all') return;
      if (!L.some(function (m) { return m && m.route === id; })) { b.parentNode.removeChild(b); n++; return; }
      /* (c) the third round: the chip's word follows the number. The design writes " · dream" on every route he chose; where the
         server's word for the route is another one (route_words: "possible", "realistic"), it stands after the design's own " · ". */
      var word = RW[id] && RW[id] !== 'dream' ? w.route[RW[id]] : null, t = b.lastChild;
      if (!word || !t || t.nodeType !== 3 || b.getAttribute('data-jg-word') === word) return;
      var at = t.nodeValue.lastIndexOf(' · ');
      if (at < 0) return;
      t.nodeValue = t.nodeValue.slice(0, at + 3) + word; b.setAttribute('data-jg-word', word); mark(b);
    });
    return n;
  }
  function siteOf(url) { try { var u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password ? u.hostname.toLowerCase().replace(/^www\./, '') : null; } catch (e) { return null; } }
  /* The text cut at each address on `host` (itself or a name under it): { text } and { href, text } pieces. */
  function addressParts(text, host) {
    var out = [], at = 0, m, re = /https:\/\/[^\s<>"'`«»“”‘’]+/g;
    text = String(text == null ? '' : text);
    while (host && (m = re.exec(text))) {
      var raw = m[0].replace(/[.,;:!?)\]]+$/, ''), h = siteOf(raw);
      if (!h || !(h === host || h.slice(-(host.length + 1)) === '.' + host)) continue;
      if (m.index > at) out.push({ text: text.slice(at, m.index) });
      out.push({ href: new URL(raw).href, text: raw });
      at = m.index + raw.length;
    }
    if (at < text.length || !out.length) out.push({ text: text.slice(at) });
    return out;
  }
  /* lastStep: the step whose row was tapped last, part 5's own variable (one tap, one step: both parts read the same row) */
  function paintStepLink() {
    var sheet = $('jr-sheet'), p = sheet && sheet.querySelector('.jr-why'), st = null;
    if (!p || p.getAttribute('data-jg-official') !== null) return false;
    roadmapSteps().forEach(function (m) { if (m && m.id === lastStep) st = m; });
    if (!st || String(st.kind).indexOf('route_') !== 0 || !st.source_url || p.textContent.indexOf(String(st.why || '\u0000')) === -1) return false;
    var parts = addressParts(p.textContent, siteOf(st.source_url));
    p.setAttribute('data-jg-official', '');
    if (!parts.some(function (x) { return !!x.href; })) return false;
    var frag = D.createDocumentFragment();
    parts.forEach(function (x) {
      if (!x.href) { frag.appendChild(D.createTextNode(x.text)); return; }
      var a = D.createElement('a');
      a.href = x.href; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('data-no-i18n', ''); a.setAttribute('data-jg-link', '');
      a.style.color = 'inherit'; a.style.textDecoration = 'underline'; a.style.overflowWrap = 'anywhere';
      a.appendChild(D.createTextNode(x.text));
      frag.appendChild(a);
    });
    p.textContent = ''; p.appendChild(frag); p.setAttribute('data-no-i18n', '');
    return true;
  }
  function startRoadmap() {
    D.addEventListener('click', function (e) { var b = e.target && e.target.closest ? e.target.closest('#jr-view [data-m]') : null; if (b) lastStep = b.getAttribute('data-m'); }, true);
    var seen = null, hook = function () {
      var view = $('jr-view');
      if (!view || view === seen) return;
      seen = view;
      new MutationObserver(function () { paintRoutes(); paintStepLink(); }).observe(view, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
      paintRoutes();
    };
    hook();
    if (!seen && D.body) new MutationObserver(hook).observe(D.body, { childList: true });
  }
  API.paintRoutes = paintRoutes; API.addressParts = addressParts; API.paintStepLink = paintStepLink;
  starts.push(startRoadmap);

  /* ---------- 7. The hard thing, said once (the third round) ----------
   * The 17-year-old: Home said "NYU is your goal for 2027" beside a plan whose English certificate was due in December 2027. When the
   * snapshot carries `truth` (the server writes it, see snapshot.ts: a test or a certificate his target needs falls after applications to it
   * close for his year), its one sentence, with the two honest ways, is said in two places, in the design's own elements:
   *   - the roadmap's opening: a paragraph of its own before the design's opening words (#jr-view .jr-hero p);
   *   - Home's goal line (#rm-goal-txt): in place of "<goal> is your goal for <year>." while the box speaks of the goal (a tapped
   *     Uzbek stop keeps its own words); the chance sentence and the button after it stay.
   * No design line changes; with no `truth` nothing here runs. */
  function truthOf() { var E = W.JG_ENGINE, t = E && E.cache && E.cache.truth; return t && typeof t.text_i18n === 'string' && t.text_i18n ? t.text_i18n : ''; }
  /* The round before the deploy (11 Oct 2026; the 17-year-old's fifth walk: "The verdict stops at a sentence. I cannot choose either").
   * Under the sentence stand its two ways as two buttons (the snapshot's truth.ways: "NYU in 2028", "This year: TUIT and WIUT"); a tap
   * stores his choice (the commit `way`, src/server/engine/commit.ts) and the plan is made again at once by the server. The page is then
   * loaded again and opens on the roadmap, so Home's goal, the chart, the letter and the list all read the new plan. Once he chose, the
   * same place holds one line that says his way (the snapshot's `way`) and a small button that opens the choice again. */
  var WAY_FLAG = 'jg-way-open', wayBusy = false;
  function wayOfSnap() { var E = W.JG_ENGINE, w = E && E.cache && E.cache.way; return w && typeof w.text_i18n === 'string' && w.text_i18n ? w : null; }
  /* the sixth round (p5w): a later year that no year within reach fits gives no "later" button; the home way's button stands alone */
  function waysOf() { var E = W.JG_ENGINE, t = E && E.cache && E.cache.truth, w = t && t.ways, ok = function (s) { return typeof s === 'string' && !!s; }; return truthOf() && w && (ok(w.later) || ok(w.home)) ? w : null; }
  function choose(pick) {
    var E = W.JG_ENGINE;
    if (wayBusy || !E || typeof E.commit !== 'function') return;
    wayBusy = true;
    [].forEach.call(D.querySelectorAll('[data-jg-way]'), function (b) { b.disabled = true; b.style.opacity = '.6'; });
    E.commit('way', { pick: pick }).then(function (r) {
      wayBusy = false;
      if (!r || r.error) { [].forEach.call(D.querySelectorAll('[data-jg-way]'), function (b) { b.disabled = false; b.style.opacity = ''; }); return; }
      try { W.sessionStorage.setItem(WAY_FLAG, '1'); } catch (e) { /* the roadmap is then one tap away, on Home */ }
      W.location.reload();
    }, function () { wayBusy = false; });
  }
  function wayButton(pick, label, small) {
    var b = D.createElement('button');
    b.type = 'button'; b.setAttribute('data-jg-way', pick === null ? 'change' : pick); mark(b); b.textContent = label;
    b.style.cssText = small
      ? 'display:inline-block;margin:0;padding:6px 14px;border-radius:999px;border:1px solid currentColor;background:none;color:inherit;font-family:inherit;font-weight:700;font-size:.86em;line-height:1.25;cursor:pointer;min-height:36px'
      : 'display:block;width:100%;margin:0;padding:12px 16px;border-radius:16px;border:0;background:#fff;color:var(--jade-800,#14532d);font-family:inherit;font-weight:800;font-size:1em;line-height:1.3;text-align:left;cursor:pointer;min-height:48px;overflow-wrap:anywhere';
    b.addEventListener('click', function (e) { e.stopPropagation(); choose(pick); });
    return b;
  }
  function paintWays(hero, after) {
    var box = hero.querySelector('[data-jg-ways]'), ways = waysOf(), way = ways ? null : wayOfSnap();
    var key = ways ? 'two|' + (ways.later || '') + '|' + (ways.home || '') : way ? 'one|' + way.change_i18n : '';
    if (!key) { if (box) box.parentNode.removeChild(box); return 0; }
    if (box && box.getAttribute('data-jg-ways') === key && box.previousSibling === after) return 1;
    if (box) box.parentNode.removeChild(box);
    box = D.createElement('div'); box.setAttribute('data-jg-ways', key); mark(box);
    box.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin:0 0 14px';
    if (ways) { if (ways.later) box.appendChild(wayButton('later', ways.later)); if (ways.home) box.appendChild(wayButton('home', ways.home)); }
    else { box.style.alignItems = 'flex-start'; box.appendChild(wayButton(null, way.change_i18n, true)); }
    after.parentNode.insertBefore(box, after.nextSibling);
    return 1;
  }
  function paintTruth() {
    var way = wayOfSnap(), text = truthOf() || (way ? way.text_i18n : ''), view = $('jr-view'), hero = view && !view.hidden ? view.querySelector('.jr-hero') : null, n = 0;
    var p = hero && hero.querySelector('p:not([data-jg-truth])'), mine = hero && hero.querySelector('p[data-jg-truth]');
    if (hero && p) {
      if (!text) { if (mine) mine.parentNode.removeChild(mine); var old = hero.querySelector('[data-jg-ways]'); if (old) old.parentNode.removeChild(old); }
      else {
        if (!mine) { mine = p.cloneNode(false); mine.removeAttribute('id'); mine.setAttribute('data-jg-truth', ''); mark(mine); mine.style.fontWeight = '700'; mine.style.marginBottom = '10px'; p.parentNode.insertBefore(mine, p); }
        if (mine.textContent !== text) mine.textContent = text;
        paintWays(hero, mine);
        n++;
      }
    }
    text = truthOf();                                                            // Home's goal line holds the verdict only: his way is said by the goal itself
    var box = $('rm-goal-txt'), b = box && box.querySelector('b');
    if (box && b && !box.querySelector('[data-uz]')) {
      if (text && b.textContent !== text) { b.textContent = text; b.setAttribute('data-jg-truth', ''); mark(b); }
      if (text) n++;
    }
    return n;
  }
  function startTruth() {
    if (typeof W.MutationObserver !== 'function' || !D.body) return;
    var box = $('rm-goal-txt');
    if (box) new W.MutationObserver(function () { paintTruth(); }).observe(box, { childList: true, characterData: true, subtree: true });
    new W.MutationObserver(function () { paintTruth(); }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    D.addEventListener('jg:snapshot', function () { setTimeout(paintTruth, 0); });
    paintTruth();
    /* after a choice the page was loaded again (choose): it opens on the roadmap, once, where he made it */
    var again = false;
    try { again = !!W.sessionStorage.getItem(WAY_FLAG); if (again) W.sessionStorage.removeItem(WAY_FLAG); } catch (e) { again = false; }
    if (again) {
      var tries = 0, t = setInterval(function () {
        var E = W.JG_ENGINE, ok = typeof W.JG_openRoadmap === 'function' && E && E.cache && E.cache.unlocked && E.cache.roadmap;
        if (ok) { clearInterval(t); var v = $('jr-view'); if (!v || v.hidden) W.JG_openRoadmap(); } else if (++tries > 40) clearInterval(t);
      }, 150);
    }
  }
  API.paintTruth = paintTruth; API.chooseWay = choose;
  starts.push(startTruth);

  /* ---------- 8. The chance picture: the goal's circle stands where its number is (the third round) ----------
   * The 17-year-old: "the NYU circle sits at about 30% of the «% chance» axis while its label says <1%". The design stands the goal's
   * badge a fixed step above the end of the path, on a stem (M:003, D:001: "the goal stands above the end"), which on an axis of
   * chances reads as a value. For a real student whose map is on that axis (JG_ENGINE.chance() with a number), the badge is centred on
   * the end of the path itself, the number the engine gives for the goal (his chance, or his chance "if you complete the plan" where
   * the forecast rises to it), as the Uzbek stops already stand at theirs; near the bottom it is lifted only as far as keeps the year
   * under the axis readable (its centre at most 0.6 of its radius above the axis). The stem goes, the name stays over the badge. No
   * design line changes; a map with no number (no axis) and the demo keep the design's badge. */
  function paintGoalBadge() {
    var E = W.JG_ENGINE, g = D.querySelector('#stations .station.goal'), C = E && typeof E.chance === 'function' ? E.chance() : null;
    if (!g || !C || !C.scaled) return false;
    var stem = g.querySelector('.st-stem'), badge = g.querySelector('.st-badge'), name = g.querySelector('.st-name'), img = badge && badge.querySelector('image'), tick = D.querySelector('#labels .xtick');
    var m = badge ? /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(badge.getAttribute('transform') || '') : null;
    if (!stem || !name || !img || !tick || !m) return false;
    var px = +m[1], by = +m[2], py = +stem.getAttribute('y1'), r = +img.getAttribute('width') / 2, y0 = +tick.getAttribute('y1');
    if (!isFinite(py) || !isFinite(r) || !isFinite(y0) || !(by < py)) return false;          // already on its number, or not the design's badge
    var cy = Math.min(py, y0 - 0.6 * (r + 2.4));
    badge.setAttribute('transform', 'translate(' + px + ' ' + cy.toFixed(1) + ')');
    stem.setAttribute('y2', stem.getAttribute('y1'));
    name.setAttribute('y', (+name.getAttribute('y') + (cy - by)).toFixed(1));
    g.setAttribute('data-jg-at', cy.toFixed(1));
    return true;
  }
  /* The third walk, the 17-year-old on a Russian page: the goal's circle was read aloud as "New York University: your goal, меньше 1 из
   * 100" (M:003:217 joins the design's English "your goal" to the engine's translated number). With the chance on, the circle is read as
   * the engine's own sentence in his language, the one the chip beside it already speaks (JG_ENGINE.chance().said: "Шанс для New York
   * University: меньше 1 из 100", or, with no number, the school's name and the reason). No design line. */
  function sayGoal() {
    var E = W.JG_ENGINE, g = D.querySelector('#stations .station.goal'), C = E && typeof E.chance === 'function' ? E.chance() : null;
    if (!g || !C || !C.said) return false;
    var name = g.querySelector('.st-name'), n = name ? String(name.textContent || '').replace(/\s+/g, ' ').replace(/^ | $/g, '') : '';
    var line = C.scaled || !n ? C.said : n + ': ' + C.said;
    if (g.getAttribute('aria-label') !== line) g.setAttribute('aria-label', line);
    return true;
  }
  function startGoalBadge() {
    var st = $('stations');
    if (!st || typeof W.MutationObserver !== 'function') return;
    new W.MutationObserver(function () { paintGoalBadge(); sayGoal(); }).observe(st, { childList: true });
    paintGoalBadge(); sayGoal();
  }
  API.paintGoalBadge = paintGoalBadge; API.sayGoal = sayGoal;
  starts.push(startGoalBadge);

  /* ---------- 9. A requirement's card: the official page is a button ----------
   * Owner 10 Oct 2026 (delegated call, the teenagers' second walk: "https://admission.tuit.uz/ is plain text, not a link"; "I pasted that
   * same link unopened: done"). A "what is required" task is a card: the record's lines, then one question (src/engine/schedule/steps.ts
   * card). Its words hold the record's official address alone on a line; the snapshot's task carries the same address as `page`. When the
   * design's task sheet opens (#jt-sheet .jr-why, written as escaped text), that line is drawn as a button that opens the page in a new tab
   * (rel=noopener), labelled with the site's name. Only an https address with no name or password in it, and only the task's own `page`:
   * any other address in any task stays the text it was. No design line changes. */
  function cardTask(text) {
    var E = W.JG_ENGINE, days = E && E.cache && E.cache.tasks, flat = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/^ | $/g, ''); }, want = flat(text), hit = null;
    if (!days || !want) return null;
    Object.keys(days).forEach(function (d) { (days[d] || []).forEach(function (t) { if (!hit && t && typeof t.page === 'string' && flat(t.instructions_i18n) === want) hit = t; }); });
    return hit;
  }
  function paintCard() {
    var sheet = $('jt-sheet'), p = sheet && sheet.querySelector('.jr-why');
    if (!p || p.getAttribute('data-jg-card') !== null) return false;
    p.setAttribute('data-jg-card', '');
    var text = p.textContent, t = cardTask(text), host = t ? siteOf(t.page) : null, at = t ? text.indexOf(t.page) : -1;
    if (!t || !host || at < 0) return false;
    var a = D.createElement('a');
    a.href = new URL(t.page).href; a.target = '_blank'; a.rel = 'noopener'; a.className = 'jg-official';
    a.setAttribute('data-no-i18n', ''); a.setAttribute('data-jg-link', '');
    a.style.cssText = 'display:inline-block;margin:6px 0 2px;padding:10px 16px;border-radius:14px;background:var(--accent-soft,#e8f5ee);color:var(--jade-800,#14532d);font-weight:800;text-decoration:none;overflow-wrap:anywhere';
    a.appendChild(D.createTextNode(host + ' ↗'));
    p.textContent = '';
    p.appendChild(D.createTextNode(text.slice(0, at))); p.appendChild(a); p.appendChild(D.createTextNode(text.slice(at + t.page.length)));
    p.setAttribute('data-no-i18n', '');
    return true;
  }
  function startCard() {
    if (typeof MutationObserver !== 'function' || !D.body) return;
    new MutationObserver(paintCard).observe(D.body, { childList: true, subtree: true });
    paintCard();
  }
  API.cardTask = cardTask; API.paintCard = paintCard;
  starts.push(startCard);

  /* ---------- 10. One line on tap: what nobody explains on Home (the third walk) ----------
   * All three teenagers: "5/390 Oʻqish kuni", "— imkoniyat", "SNU · 0 / 600 gʻisht", "AP oʻrtacha", "1% tayyor", "S2" are on the first screen
   * and nothing says what they are. Nothing is removed, hidden or moved (the circles, the chance and the league are the owner's): a tap on
   * each shows ONE line in the design's own toast (.cm-toast, as Community's), and that is all. Each line says only what the code does:
   *  - the study day: day N of the programme's days, counted from the day the roadmap opened (snapshot.ts `program`);
   *  - the "% ready" chip: with the chance on, the chip's own spoken sentence (JG_ENGINE.chance().said: the number with its range, or the
   *    reason there is none, from the records); otherwise what the 0 to 100 is counted from;
   *  - the bricks: they come from finished Study Room sessions (src/server/engine/study.ts), the target is the page's own;
   *  - the four circles: what SAT, IELTS, AP and GPA are, and the top of each scale as the circle itself says it;
   *  - the stage on the player card: the question bank's own definition of S1 to S4.
   * Not explained here: the league line (its card opens the design's League page, which says where XP comes from) and the "CAC" tile of
   * the first minutes (the design's own record says "Milestone details to be added": nobody has said what it is). */
  var TIP = {
    en: { day: function (d, n) { return 'Day ' + d + ' of ' + n + '. Your programme here is ' + n + ' days, counted from the day your roadmap opened.'; },
      day0: function (n) { return 'Your programme here is ' + n + ' days. The count starts on the day your roadmap opens.'; },
      ready: 'How ready you are for university, from 0 to 100. It is counted from your answers and results, and changes when they do.',
      bricks: function (u, n) { return 'Bricks come from the Study Room: every study session you finish there adds bricks. ' + n + ' bricks build ' + u + '.'; },
      SAT: 'SAT: an entrance exam for universities in the US and some other countries. The top score is 1600.',
      IELTS: 'IELTS: an English exam that many universities ask for. The top score is 9.',
      'AP avg': 'AP: exams in school subjects at university level, each marked from 1 to 5. This is the average of your AP marks. Not everyone needs AP.',
      GPA: 'GPA: your school marks as one average, on a scale up to 4.0.', Average: 'Your school average, on your own school’s scale.',
      S1: 'S1 is your stage: more than 4 years before you finish school.', S2: 'S2 is your stage: 2 to 4 years before you apply.',
      S3: 'S3 is your stage: the year you apply.', S4: 'S4 is your stage: you have finished school.',
      league: 'This is your place in this week’s league table, by the XP of this week. Every 25 minutes you finish in the Study Room adds 10 XP.' },
    uz: { day: function (d, n) { return n + ' kunning ' + d + '-kuni. Bu yerdagi dasturingiz ' + n + ' kun, u yoʻl xaritangiz ochilgan kundan sanaladi.'; },
      day0: function (n) { return 'Bu yerdagi dasturingiz ' + n + ' kun. Sanoq yoʻl xaritangiz ochilgan kundan boshlanadi.'; },
      ready: 'Universitetga qanchalik tayyorsiz: 0 dan 100 gacha. Javoblaringiz va natijalaringizdan hisoblanadi, ular oʻzgarsa, bu ham oʻzgaradi.',
      bricks: function (u, n) { return 'Gʻishtlar Oʻqish xonasidan keladi: u yerda tugatgan har bir mashgʻulotingiz gʻisht qoʻshadi. ' + n + ' ta gʻisht ' + u + ' binosini quradi.'; },
      SAT: 'SAT: AQSH va yana baʼzi davlatlar universitetlari uchun kirish imtihoni. Eng yuqori ball: 1600.',
      IELTS: 'IELTS: koʻp universitetlar soʻraydigan ingliz tili imtihoni. Eng yuqori ball: 9.',
      'AP avg': 'AP: maktab fanlaridan universitet darajasidagi imtihonlar, har biri 1 dan 5 gacha baholanadi. Bu AP baholaringizning oʻrtachasi. AP hammaga ham kerak emas.',
      GPA: 'GPA: maktab baholaringizning oʻrtachasi, 4.0 gacha boʻlgan shkalada.', Average: 'Maktabdagi oʻrtacha bahoyingiz, maktabingizning oʻz shkalasida.',
      S1: 'S1 — bosqichingiz: maktabni tugatishingizga 4 yildan koʻp bor.', S2: 'S2 — bosqichingiz: hujjat topshirishingizga 2–4 yil bor.',
      S3: 'S3 — bosqichingiz: hujjat topshiradigan yilingiz.', S4: 'S4 — bosqichingiz: maktabni tugatgansiz.',
      league: 'Bu shu haftadagi liga jadvalidagi oʻrningiz: shu hafta yigʻgan XP boʻyicha. Oʻqish xonasida tugatgan har 25 daqiqangiz 10 XP qoʻshadi.' },
    ru: { day: function (d, n) { return 'День ' + d + ' из ' + n + '. Ваша программа здесь длится ' + n + ' дней, счёт идёт со дня, когда открылась дорожная карта.'; },
      day0: function (n) { return 'Ваша программа здесь длится ' + n + ' дней. Счёт начнётся в день, когда откроется дорожная карта.'; },
      ready: 'Насколько вы готовы к университету: от 0 до 100. Считается по вашим ответам и результатам и меняется вместе с ними.',
      bricks: function (u, n) { return 'Кирпичи дают в Учебной комнате: каждое занятие, которое вы там закончили, добавляет кирпичи. Кирпичей нужно ' + n + ', чтобы построить ' + u + '.'; },
      SAT: 'SAT: вступительный экзамен для университетов США и некоторых других стран. Высший балл: 1600.',
      IELTS: 'IELTS: экзамен по английскому, который просят многие университеты. Высший балл: 9.',
      'AP avg': 'AP: экзамены по школьным предметам на уровне университета, каждый оценивается от 1 до 5. Здесь среднее ваших оценок AP. AP нужен не всем.',
      GPA: 'GPA: средний балл ваших школьных оценок по шкале до 4.0.', Average: 'Ваш средний балл в школе, по шкале вашей школы.',
      S1: 'S1 — ваш этап: до окончания школы больше 4 лет.', S2: 'S2 — ваш этап: до подачи документов 2–4 года.',
      S3: 'S3 — ваш этап: год подачи документов.', S4: 'S4 — ваш этап: вы уже окончили школу.',
      league: 'Это ваше место в таблице лиги за эту неделю, по XP этой недели. Каждые 25 минут, законченные в Учебной комнате, дают 10 XP.' }
  };
  var tipT = null;
  function tipWords() { return TIP[lang()] || TIP.en; }
  /** The one line for what was tapped, or null (nothing to say: the tap is left alone). */
  function tipFor(target) {
    var w = tipWords(), E = W.JG_ENGINE, hit = function (sel) { return target.closest ? target.closest(sel) : null; }, el;
    if (hit('.wd-day')) {
      var p = E && E.cache && E.cache.program, scr = D.querySelector('.screen'), n = (p && p.days) || (scr && parseInt(scr.getAttribute('data-program-days'), 10)) || 0;
      return !n ? null : p && p.day ? w.day(p.day, n) : w.day0(n);
    }
    if ((el = hit('#rm-ready'))) { var c = E && typeof E.chance === 'function' ? E.chance() : null; return c && c.said ? c.said : w.ready; }
    /* the bricks line says its rule itself and opens the Study Room (part 12 below; the fourth walk): no line on tap any more */
    if (hit('#jt-streak')) return streakTip();                                  // the streak's number by the week row (part 3)
    /* the league line on the Today tab (the fourth walk: "#16 / 16 · bu hafta 0 XP"; the place itself is the owner's and stays): the card
       opens the design's League page as before, and this one line says what the place is counted from (XP_PER_BRICK, BRICK_MINUTES:
       src/engine/study.ts; the League page's own sentence) */
    if (hit('#lg-card')) return (W.JG_LEAGUE && W.JG_LEAGUE.tip && W.JG_LEAGUE.tip(lang())) || w.league;   // m1 league (20 Oct 2026): no "place in the league table" while her league has not started (public/runtime/jg-league.js)
    if ((el = hit('#arc .bubble'))) { var k = el.querySelector('[data-k]'); return (k && (circleTip(k.getAttribute('data-k')) || w[k.getAttribute('data-k')])) || null; }   // part 16: a circle that holds a typed or a measured line says it whole
    if ((el = hit('.pc-ovr'))) { var s = el.querySelector('small'), key = s ? String(s.textContent || '').trim() : ''; return /^S[1-4]$/.test(key) ? w[key] : null; }
    return null;
  }
  function showTip(text) {
    var t = $('jg-tip');
    if (!t) {
      t = D.createElement('div'); t.id = 'jg-tip'; t.className = 'cm-toast'; mark(t);
      t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
      /* low on the screen, above the tab bar: at the design's own place (top 60 px) it lay for its six seconds over the line under the
         student's name, where the Upgrade chip is; nothing the owner ruled on is covered, even for a moment */
      t.style.cssText = 'position:fixed;left:16px;right:16px;top:auto;bottom:' + ($('tb-track') ? 104 : 32) + 'px;max-width:480px;margin:0 auto;z-index:400;line-height:1.45';
      D.body.appendChild(t);
    }
    t.textContent = text; t.classList.add('on');
    clearTimeout(tipT); tipT = setTimeout(function () { t.classList.remove('on'); }, 6500);   // a sentence, not a word: longer than the design's 2.6 s
  }
  function startTips() {
    if (!D.body) return;
    D.addEventListener('click', function (e) {
      var t = $('jg-tip'), line = e.target && e.target.nodeType === 1 ? tipFor(e.target) : null;
      if (line) showTip(line); else if (t) t.classList.remove('on');           // any other tap puts the line away
    }, true);   // on the way down: the League card's own handler redraws the card (M:010:1381), and what was tapped is then no part of the page
    /* a finger and a keyboard find them: the day, the chip and the bricks line can be tapped (the circles and the card are drawn for the eye only) */
    var ready = function () {
      ['.wd-day', '#rm-ready'].forEach(function (sel) {
        var el = D.querySelector(sel); if (!el || el.hasAttribute('data-jg-tip')) return;
        el.setAttribute('data-jg-tip', ''); el.setAttribute('tabindex', '0'); el.style.cursor = 'pointer';
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var l = tipFor(el); if (l) { e.preventDefault(); showTip(l); } } });
      });
      [].forEach.call(D.querySelectorAll('#arc .bubble, .pc-ovr'), function (el) { el.style.cursor = 'pointer'; });
    };
    ready(); setTimeout(ready, 1500);                                          // the bricks line is drawn after the Study Room's first paint
  }
  API.tipFor = tipFor; API.showTip = showTip;
  starts.push(startTips);

  /* ---------- 12. The bricks line says its rule and opens the Study Room (the fourth walk) ----------
   * The 13-year-old: "'🧱 MIT · 0 / 600 gʻisht · oʻqib, uni quring' stayed at 0 through four days, three finished days and 200 coins. Only
   * the Today tab says the rule. On Home it says 'study and build it', I studied, it built nothing." How a brick is earned is the owner's
   * design and is not changed (a finished 25-minute session in the Study Room: BRICK_MINUTES, src/engine/study.ts; the Study Room card's
   * own "1 brick = 25 minutes in the Study Room"). Home's line (#zr-domeline, written by M:023:1294 = D:022:1296) now says that rule in a
   * few words and IS the way in: a tap opens the design's Study Room (window.JG_openStudy, M:023:1318). At 0 its last words are "Lay your
   * first brick", so 0 reads as not started. No design line: the design writes its sentence, this writes the student's over it. */
  var BRICK = {
    en: { line: function (u, a, b) { return '🧱 ' + u + ' · ' + a + ' / ' + b + ' bricks · 25 min of study = 1 brick'; }, first: 'Lay your first brick', room: 'Study Room' },
    uz: { line: function (u, a, b) { return '🧱 ' + u + ' · ' + a + ' / ' + b + ' gʻisht · 25 daqiqa oʻqish = 1 gʻisht'; }, first: 'Birinchi gʻishtni qoʻying', room: 'Oʻqish xonasi' },
    ru: { line: function (u, a, b) { return '🧱 ' + u + ' · кирпичики: ' + a + ' / ' + b + ' · 25 минут учёбы = 1 кирпичик'; }, first: 'Положите первый кирпичик', room: 'Учебная комната' }
  };
  function brickLine() {
    var b = W.JG_API && typeof W.JG_API.dreamBuild === 'function' ? W.JG_API.dreamBuild() : null, w = BRICK[lang()] || BRICK.en;
    if (!b || !b.university || !b.bricks_target) return null;
    /* the teen walk 7 (12 Oct 2026, delegated call): where the roadmap names no university (homeNamesNone, part 15) the line names none either */
    var text = w.line(b.university, b.bricks_done | 0, b.bricks_target);
    if (homeNamesNone()) text = text.replace('🧱 ' + b.university + ' · ', '🧱 ');
    return { text: text, go: ((b.bricks_done | 0) > 0 ? w.room : w.first) + ' ›' };
  }
  function paintBricks() {
    var el = $('zr-domeline'), l = brickLine();
    if (!el || !l) return false;
    var go = el.querySelector('.jg-go');
    if (go && go.textContent === l.go && el.firstChild && el.firstChild.nodeValue === l.text + ' · ') return true;
    mark(el); el.textContent = l.text + ' · ';
    go = D.createElement('span'); go.className = 'jg-go'; go.textContent = l.go; el.appendChild(go);
    el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.style.cursor = 'pointer';
    return true;
  }
  function openRoom() { if (typeof W.JG_openStudy === 'function') try { W.JG_openStudy(); } catch (e) {} }
  function startBricks() {
    var host = $('world') || D.body, seen = null;
    if (!host) return;
    var hook = function () {
      var el = $('zr-domeline'); if (!el) return;
      paintBricks();
      if (el === seen) return;
      seen = el;
      el.addEventListener('click', openRoom);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRoom(); } });
      new MutationObserver(function () { paintBricks(); }).observe(el, { childList: true, characterData: true, subtree: true });   // the design writes its own sentence again after each session
    };
    new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length) { hook(); return; } }).observe(host, { childList: true });
    D.addEventListener('jg:snapshot', function () { setTimeout(hook, 0); });
    hook(); setTimeout(hook, 1500);                                            // the line is drawn after the Study Room's first paint
  }
  API.paintBricks = paintBricks; API.brickLine = brickLine;
  starts.push(startBricks);

  /* ---------- 11. "Study this in the Study Room" only where there is something to study (the third walk) ----------
   * The 13-year-old: "'Buni Oʻqish xonasida oʻrganing' still under tasks it does not fit (saying three words aloud, the bot task) and under
   * every quiz." The design puts the door under every task not yet done (M:023:888). For a real student it stays under a task that is
   * study by its own record (type "study": a page to read, a unit to learn, a review) and is not answered by a quiz in the same sheet;
   * under a self-report, a thing to make, send, book or check, a reflection and every quiz it is not shown. The Study Room itself is
   * untouched and one tap away in the tab bar. No design line. */
  function sheetTask() {
    var E = W.JG_ENGINE, days = E && E.cache && E.cache.tasks, h = $('jt-h'), flat = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/^ | $/g, ''); }, want = h ? flat(h.textContent) : '', hit = null;
    if (!days || !want) return null;
    var today = E.cache.local_date, order = [today].concat(Object.keys(days).filter(function (d) { return d !== today; }));
    order.forEach(function (d) { (days[d] || []).forEach(function (t) { if (!hit && t && flat(t.title_i18n) === want) hit = t; }); });
    return hit;
  }
  function studyFits(t) { return !!t && t.type === 'study' && t.verification !== 'quiz'; }
  function paintStudyDoor() {
    var sheet = $('jt-sheet'), b = sheet && sheet.querySelector('.jt-study');
    if (!b || b.getAttribute('data-jg-door') !== null) return false;
    b.setAttribute('data-jg-door', '');
    var t = sheetTask();
    if (t && !studyFits(t)) show(b, false);                       // a task the page cannot place keeps the design's door
    return true;
  }
  function startStudyDoor() {
    if (typeof MutationObserver !== 'function' || !D.body) return;
    new MutationObserver(paintStudyDoor).observe(D.body, { childList: true, subtree: true });
    paintStudyDoor();
  }
  API.studyFits = studyFits; API.paintStudyDoor = paintStudyDoor;
  starts.push(startStudyDoor);

  /* ---------- 12. The browser tab's title in the student's language (the third walk) ----------
   * The 17-year-old: "the browser tab title is 'Тестов Тимур · Student profile' on a Russian page". The translator reads the page's
   * body, not its <title> (the design's: "<name> · Student profile" on the phone, "<name> · Home" on the laptop). The words after the
   * name are said with the translator's own dictionary once it is in; the name is never touched. */
  function paintTitle() {
    var I = W.JG_I18N, at = D.title.lastIndexOf(' · ');
    if (!I || typeof I.text !== 'function' || lang() === 'en' || at < 0) return true;      // nothing to say in another language
    var was = D.title.slice(at + 3), now = I.text(was);
    if (now === was) return false;                                                         // the dictionary is not in yet (or has no word)
    D.title = D.title.slice(0, at + 3) + now;
    return true;
  }
  function startTitle() { var n = 0; (function again() { if (!paintTitle() && ++n < 20) setTimeout(again, 400); })(); }
  API.paintTitle = paintTitle;
  starts.push(startTitle);

  /* ---------- 13. One line under MIT (the last round before the deploy, 11 Oct 2026) ----------
   * Owner 10 Oct 2026 (delegated call, the teen walk; all three teenagers asked whose MIT it is: "MIT three times with nobody saying what
   * it is"). The owner's ruling of 11 Oct stands untouched: MIT is shown where she has named no university and no place. Under the
   * roadmap's title one line says what it is, in her language, from the snapshot (goal_note, src/engine/goal.ts standInNote): "MIT is
   * an example: choose your own". Before her first questions are answered it is a door to them (their fourth question is her
   * university); after them it only says it (no page asks that question again: a skipped answer stays skipped). With a goal of her own
   * the line is not there. No design line changes: the line is this runtime's own element under #rm-sub. */
  function paintStandIn() {
    var E = W.JG_ENGINE, c = E && E.cache, n = c && c.goal && c.goal.standin ? c.goal_note : null, sub = $('rm-sub'), el = $('jg-standin');
    if (!sub || !sub.parentNode || !n || !n.text_i18n) { if (el && el.parentNode) el.parentNode.removeChild(el); return; }
    var tag = n.open ? 'BUTTON' : 'P';
    if (el && el.tagName !== tag) { el.parentNode.removeChild(el); el = null; }
    if (!el) {
      el = D.createElement(tag.toLowerCase()); el.id = 'jg-standin'; mark(el);
      if (n.open) {
        el.type = 'button'; el.className = 'rm-applink';
        el.style.cssText = 'display:block;margin:6px 0 0;padding:6px 0;min-height:32px;text-align:left;white-space:normal';
        el.addEventListener('click', function (e) { e.stopPropagation(); if (typeof W.JG_openDiagnostic === 'function') W.JG_openDiagnostic(); });
      } else { el.className = 'rm-sub'; el.style.cssText = 'white-space:normal;overflow:visible'; }
      sub.parentNode.insertBefore(el, sub.nextSibling);
    }
    var text = n.text_i18n + (n.open ? ' ›' : '');
    if (el.textContent !== text) el.textContent = text;
  }
  function startStandIn() {
    paintStandIn();
    D.addEventListener('jg:snapshot', function () { setTimeout(paintStandIn, 0); });
    D.addEventListener('jg:goal', function () { setTimeout(paintStandIn, 0); });
  }
  API.paintStandIn = paintStandIn;
  starts.push(startStandIn);

  /* ---------- 14. Home counts only the routes the roadmap shows (the teen walk 6, 11 Oct 2026, delegated call) ----------
   * The 13-year-old (7th class) named Inha and MIT; Home read "Yoʻl xaritasi: Inha · 2 ta yoʻnalish" while his roadmap holds habits and no
   * university at all (the owner's standing rule: S1 gets nothing of a university, src/engine/plan.ts). The design's line under Home's
   * roadmap title counts his destinations and the parallel ones (M:023:644, D:022:646: "N routes planned"); part 6 above takes a chip out
   * of the roadmap when no step stands on its route. Here the line follows the roadmap: the routes its steps stand on, never more than the
   * design counted; with none, the roadmap's own name for its plan (its first phase: "Odatlar"). The title above ("Roadmap to Inha",
   * MIT where nothing is named: the owner's ruling) and the bricks line stay as they are. No design line changes: this writes over the
   * design's words only when they are its route count. */
  function routeCountLine() {
    var E = W.JG_ENGINE, c = E && E.cache, R = c && c.roadmap, L = (R && R.milestones) || [], dv = c && c.derived;
    if (!L.length || !dv) return null;
    var seen = {}, k = 0;
    L.forEach(function (m) { if (m && m.route && m.route !== 'all' && !seen[m.route]) { seen[m.route] = 1; k++; } });
    var all = {}, n = 0;
    ((dv.rules_set || []).concat(c.parallel || [])).forEach(function (r) { if (!all[r]) { all[r] = 1; n++; } });
    n = n || 1;
    if (k >= n) return null;
    var tr = function (s) { return W.JG_I18N && typeof W.JG_I18N.text === 'function' ? W.JG_I18N.text(s) : s; };
    var was = [n + ' ' + (n === 1 ? 'route' : 'routes') + ' planned'], now;
    was.push(tr(was[0]));
    if (k > 0) now = tr(k + ' ' + (k === 1 ? 'route' : 'routes') + ' planned');
    else if (dv.stage === 'S1') { var p0 = (R.phases || [])[0]; now = p0 && p0.title_i18n ? String(p0.title_i18n) : null; }   // the habits plan: no route at all
    else now = null;                                                          // an older student's steps not yet on a route: the design's line stands
    return now ? { was: was, now: now } : null;
  }
  function paintRouteCount() {
    var s = $('rm-sub'), l = routeCountLine();
    if (!s || !l) return;
    var t = (s.textContent || '').trim();
    if (t !== l.now && l.was.indexOf(t) >= 0) { s.textContent = l.now; s.setAttribute('data-jg-routes', ''); }
  }
  function startRouteCount() {
    paintRouteCount();
    var s = $('rm-sub');
    if (s && typeof W.MutationObserver === 'function') new W.MutationObserver(paintRouteCount).observe(s, { childList: true, characterData: true, subtree: true });
    D.addEventListener('jg:snapshot', function () { setTimeout(paintRouteCount, 0); });
  }
  API.paintRouteCount = paintRouteCount; API.routeCountLine = routeCountLine;
  starts.push(startRouteCount);

  /* ---------- 15. Home names what the roadmap names (the teen walk 7, 12 Oct 2026, delegated call) ----------
   * The 13-year-old (7th class) named Inha and MIT; his roadmap is habits with no university (S1 gets nothing of a university: the owner's
   * standing rule, src/engine/plan.ts), and Home still read "Yoʻl xaritasi: Inha" and "🧱 Inha · 0 / 600 gʻisht". For a student at S1
   * whose goal is one he named (not the MIT stand-in: the owner's ruling of 11 Oct stands, MIT where nothing is named, with its own line,
   * part 13), the title under Home's chart is the roadmap's own title ("Your roadmap") and the bricks line names no university (part 12).
   * From S2 on, when the roadmap has his university, both say it as the design does. No design line changes: this writes over the design's
   * own "Roadmap to {goal}" only. */
  function homeNamesNone() {
    var E = W.JG_ENGINE, c = E && E.cache, dv = c && c.derived, g = c && c.goal;
    return !!(dv && dv.stage === 'S1' && g && !g.standin);
  }
  function paintHomeTitle() {
    var t = $('rm-title'), c = W.JG_ENGINE && W.JG_ENGINE.cache, g = c && c.goal;
    if (!t || !g || !homeNamesNone()) return;
    var tr = function (s) { return W.JG_I18N && typeof W.JG_I18N.text === 'function' ? W.JG_I18N.text(s) : s; };
    var was = ['Roadmap to ' + g.short], now = tr('Your roadmap'), cur = (t.textContent || '').trim();
    was.push(tr(was[0]));
    if (cur !== now && was.indexOf(cur) >= 0) { t.textContent = now; t.setAttribute('data-jg-title', ''); }
  }
  function startHomeTitle() {
    paintHomeTitle();
    var t = $('rm-title');
    if (t && typeof W.MutationObserver === 'function') new W.MutationObserver(paintHomeTitle).observe(t, { childList: true, characterData: true, subtree: true });
    D.addEventListener('jg:snapshot', function () { setTimeout(paintHomeTitle, 0); });
    D.addEventListener('jg:goal', function () { setTimeout(paintHomeTitle, 0); });
  }
  API.paintHomeTitle = paintHomeTitle; API.homeNamesNone = homeNamesNone;
  starts.push(startHomeTitle);

  /* ---------- 16. Home's circles show what the plan holds (owner 12 Oct 2026, "do man, fix") ----------
   * The 13-year-old (7th class) rated his English A1, typed "IELTS 7.5" and confirmed it; his roadmap said it was built from his A1, and
   * Home drew a full "7.5 · IELTS / 9" circle (aria "IELTS: 7.5 / 9"). The 15-year-old's check measured B2 and Home's IELTS circle read
   * "— / 9 · IELTS: hali topshirilmagan". The circles are the owner's and stay; what they show must be true. The design's page computes
   * its card from the answers as stored (M:023:1473, D:022:1475), so here the card takes the plan's own values from the snapshot's
   * `circles` (src/engine/card.ts circlesOf: the held scores, answers.ts heldTests), and the design's syncHome draws them: a typed score
   * the plan has set aside is the circle's empty state ("—", an empty ring, "not taken yet" for a screen reader), never a number as if
   * measured. Its small line (the design's "of 9", one line for one line) then says what is true: the app's own check where it measured
   * ("Tekshiruv: B2 (taxminiy)"), else the score she typed, as hers ("Siz yozdingiz: 7.5"); a tap says it whole (part 10's toast), and
   * so does the screen-reader line. One rule for SAT, IELTS and AP; GPA is her own average, which the plan uses as she gave it. No
   * design line changes. */
  var CIRCLE_MAX = { SAT: 1600, IELTS: 9, 'AP avg': 5 };
  var CIRCLE = {
    en: { typed: function (v) { return 'You wrote ' + v; }, check: function (l) { return 'Check: ' + l + ' (estimate)'; },
      tipTyped: function (t, v) { return 'You wrote ' + t + ' ' + v + '. It goes in this circle once a certificate or our English check confirms it.'; },
      tipTypedCheck: function (t, v, l) { return 'You wrote ' + t + ' ' + v + '. Our English check showed about ' + l + '. Your score goes in this circle once a certificate confirms it.'; },
      tipCheck: function (l) { return 'Our English check showed about ' + l + '. An IELTS score goes in this circle once you have the certificate.'; } },
    uz: { typed: function (v) { return 'Siz yozdingiz: ' + v; }, check: function (l) { return 'Tekshiruv: ' + l + ' (taxminiy)'; },
      tipTyped: function (t, v) { return 'Siz ' + t + ' ' + v + ' deb yozdingiz. Sertifikat yoki ingliz tili tekshiruvimiz tasdiqlagach, u shu doirada chiqadi.'; },
      tipTypedCheck: function (t, v, l) { return 'Siz ' + t + ' ' + v + ' deb yozdingiz. Ingliz tili tekshiruvimiz taxminan ' + l + ' koʻrsatdi. Sertifikat tasdiqlagach, ballingiz shu doirada chiqadi.'; },
      tipCheck: function (l) { return 'Ingliz tili tekshiruvimiz taxminan ' + l + ' koʻrsatdi. IELTS sertifikatingiz boʻlganda, balli shu doirada chiqadi.'; } },
    ru: { typed: function (v) { return 'Вы указали: ' + v; }, check: function (l) { return 'Проверка: ' + l + ' (примерно)'; },
      tipTyped: function (t, v) { return 'Вы указали ' + t + ' ' + v + '. Балл появится в этом круге, когда его подтвердит сертификат или наша проверка английского.'; },
      tipTypedCheck: function (t, v, l) { return 'Вы указали ' + t + ' ' + v + '. Наша проверка английского показала примерно ' + l + '. Балл появится в этом круге, когда его подтвердит сертификат.'; },
      tipCheck: function (l) { return 'Наша проверка английского показала примерно ' + l + '. Балл IELTS появится в этом круге, когда у вас будет сертификат.'; } }
  };
  function circles() { var c = W.JG_ENGINE && W.JG_ENGINE.cache; return (c && c.circles) || null; }
  var testName = function (k) { return k === 'AP avg' ? 'AP' : k; };
  /** The circle's small line and its whole sentence, or null where the design's own stand (a score the plan holds, or nothing to say). */
  function circleSay(k) {
    var h = circles(), L = CIRCLE[lang()] || CIRCLE.en;
    if (!h || !Object.prototype.hasOwnProperty.call(CIRCLE_MAX, k) || h[k] != null) return null;
    var typed = h.typed && h.typed[k], check = k === 'IELTS' ? h.check : null;
    if (typed && check) return { line: L.check(check), tip: L.tipTypedCheck(testName(k), typed, check) };
    if (typed) return { line: L.typed(typed), tip: L.tipTyped(testName(k), typed) };
    if (check) return { line: L.check(check), tip: L.tipCheck(check) };
    return null;
  }
  /** The tap's line: what the circle is (part 10), then what is true of hers. */
  function circleTip(k) { var s = circleSay(k), base = tipWords()[k]; return s ? (base ? base + ' ' : '') + s.tip : null; }
  /** The design's card with the plan's own scores (its syncHome, the player card and the ghosts read it). */
  function holdCard() {
    var api = W.JG_API;
    if (!api || typeof api.playerCard !== 'function' || api.playerCard.jgHeld) return false;
    var orig = api.playerCard, held = function () {
      var c = orig.apply(api, arguments), h = circles();
      if (c && h) { c.sat = h.SAT; c.ielts = h.IELTS; c.ap = h['AP avg']; c.ielts_est = h.est; }
      // the player card on Home: while a score is set aside its "tests" stat is the plan's own, and the overall and tier follow it
      // (the design's own sums, M:023:1487-1488)
      var t = c && h && h.typed && Object.keys(h.typed).length && typeof h.tests === 'number' && c.back ? c.back.filter(function (s) { return s.key === 'tests'; })[0] : null;
      if (t && t.value !== h.tests) {
        t.value = h.tests;
        var sum = function (xs) { return xs.reduce(function (n, s) { return n + s.value; }, 0); };
        c.overall = Math.round((sum(c.back.slice(0, 6)) * 2 + sum(c.back.slice(6))) / 16);
        c.tier = c.overall >= 87 ? 'jade' : c.overall >= 75 ? 'gold' : c.overall >= 60 ? 'silver' : 'bronze';
      }
      return c;
    };
    held.jgHeld = true; api.playerCard = held;
    return true;
  }
  /** Whether every line of `i`'s text lies inside the circle `b` (both as drawn, the arc's scale included); true before layout. */
  function inCircle(b, i) {
    var r = b.getBoundingClientRect();
    if (!r.width || !D.createRange) return true;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2 * 1.06, g = D.createRange();   // 6 %: a line box's corner is not ink
    g.selectNodeContents(i);
    return [].every.call(g.getClientRects(), function (q) {
      return [[q.left, q.top], [q.right, q.top], [q.left, q.bottom], [q.right, q.bottom]].every(function (p) { var x = p[0] - cx, y = p[1] - cy; return x * x + y * y <= R * R; });
    });
  }
  function paintCircles() {
    var h = circles();
    if (!h) return;
    [].forEach.call(D.querySelectorAll('#arc .bubble'), function (b) {
      var l = b.querySelector('.txt span'), k = l ? l.getAttribute('data-k') || l.textContent : '', i = b.querySelector('.txt i'), v = b.querySelector('.txt b');
      if (!Object.prototype.hasOwnProperty.call(CIRCLE_MAX, k) || !i || !v) return;
      var n = h[k], off = (2 * Math.PI * 48 * (1 - Math.min((n || 0) / CIRCLE_MAX[k], 1))).toFixed(1), s = circleSay(k);
      if (v.textContent !== (n == null ? '—' : String(n))) v.textContent = n == null ? '—' : String(n);   // as syncHome draws it with the held card
      if (b.style.getPropertyValue('--off') !== off) b.style.setProperty('--off', off);
      var restore = function () { if (i.hasAttribute('data-jg-was')) { i.removeAttribute('data-no-i18n'); i.textContent = i.getAttribute('data-jg-was'); i.removeAttribute('data-jg-was'); } };
      // the line is written only where it fits inside the circle (the laptop's sidebar circles are half the phone's): elsewhere the
      // design's own line stands, and the tap and the screen-reader line still say it whole
      if (s && b.getAttribute('data-jg-nofit') !== s.line) {
        if (!i.hasAttribute('data-jg-was')) i.setAttribute('data-jg-was', i.textContent);
        mark(i); if (i.textContent !== s.line) i.textContent = s.line;
        if (!inCircle(b, i)) { b.setAttribute('data-jg-nofit', s.line); restore(); }
      } else restore();
    });
    var sr = $('sr');
    if (sr) [].forEach.call(sr.children, function (li) {
      var k = li.getAttribute('data-k') || '', s = Object.prototype.hasOwnProperty.call(CIRCLE_MAX, k) ? circleSay(k) : null, t;
      if (s) { mark(li); li.setAttribute('data-jg-circle', ''); t = k + ': ' + s.tip; if (li.textContent !== t) li.textContent = t; }
      else if (li.hasAttribute('data-jg-circle')) { li.removeAttribute('data-jg-circle'); li.removeAttribute('data-no-i18n'); li.textContent = k + ': ' + (h[k] == null ? 'not taken yet' : h[k]) + ' of ' + CIRCLE_MAX[k]; }   // syncHome's own words, which the page translates
    });
  }
  function startCircles() {
    holdCard(); paintCircles();
    var sr = $('sr'), arc = $('arc');
    if (typeof W.MutationObserver === 'function') [sr, arc].forEach(function (el) { if (el) new W.MutationObserver(paintCircles).observe(el, { childList: true, characterData: true, subtree: true }); });
    D.addEventListener('jg:snapshot', function () { holdCard(); setTimeout(paintCircles, 0); });
  }
  API.paintCircles = paintCircles; API.circleSay = circleSay; API.holdCard = holdCard;
  starts.push(startCircles);

  /* ---------- 17. The Uzbek stops: what they are for, and whose (owner 12 Oct 2026; its own part 16, renumbered at the teen walk 9's integration) ----------
   * The owner, 12 Oct 2026: the Uzbek universities stay on Home's chart for a student from Uzbekistan, "hozirham bu univerlarga kira
   * olasan, lekin yana harakat qilsang bularga kirasan deb ko'rsatish uchun" (to show: you can get into these now, and with more effort
   * you reach those). The server words each stop (src/engine/unis-uz.ts uzStopWords). Here: one line under the chart's legend says the
   * idea once (the snapshot's ui['station.legend']), only while the chart has an Uzbek stop; and a stop he did not choose carries the
   * app's word for a suggestion beside its name ("CAU · taklif"), so the chart and "My applications" do not disagree (the controller's
   * call). The stops are the first of the design's stations, in the snapshot's order (M:003:18, D:001:207: STATIONS = [...mids, goal]).
   * No design line changes: the line is this runtime's own element, and the name is written over the design's own text. */
  function paintUzStops() {
    var c = W.JG_ENGINE && W.JG_ENGINE.cache, U = c && c.unis_uz, mid = (U && U.mid) || [], words = U && U.ui && U.ui['station.legend'];
    var rm = $('rm'), lg = rm && rm.querySelector('.legend'), el = $('jg-uzlegend');
    if (!lg || !lg.parentNode || !mid.length || !words) { if (el && el.parentNode) el.parentNode.removeChild(el); }
    else {
      if (!el) {
        el = mark(D.createElement('p')); el.id = 'jg-uzlegend';
        el.style.cssText = 'margin:2px 2px 0;font-size:11.5px;font-weight:500;line-height:1.35;color:var(--muted);white-space:normal';
        lg.parentNode.insertBefore(el, lg.nextSibling);
      }
      if (el.textContent !== words) el.textContent = words;
    }
    var st = $('stations');
    if (!st) return;
    Array.prototype.forEach.call(st.querySelectorAll('.station:not(.goal)'), function (g) {
      var u = mid[+g.getAttribute('data-i')], n = g.querySelector('.st-name');
      if (!u || !n || String(n.textContent || '').indexOf(u.short) !== 0) return;
      var want = u.tip ? u.short + ' · ' + u.tip : u.short;
      if (n.textContent !== want) { n.textContent = want; mark(n); }
    });
  }
  function startUzStops() {
    paintUzStops();
    var st = $('stations');
    if (st && typeof W.MutationObserver === 'function') new W.MutationObserver(paintUzStops).observe(st, { childList: true });
    D.addEventListener('jg:snapshot', function () { setTimeout(paintUzStops, 0); });
    D.addEventListener('jg:goal', function () { setTimeout(paintUzStops, 0); });
  }
  API.paintUzStops = paintUzStops;
  starts.push(startUzStops);

  /* ---------- start ---------- */
  function start() { starts.forEach(function (f) { try { f(); } catch (e) {} }); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
