/* Jamals Global: Phase D on the student pages (P5e; P5 spec §4.1-§4.3, owner ruling A6: the rest of the diagnostic as daily tasks).
 *
 * Loaded on a live student's page while Phase D is on (JG_BOOT.phaseD; src/server/pages.ts), before the design scripts. window.JG_PHASED is
 * what the design's own code calls, one line for one line (M:023 252, 552, 771, 772, 819, 851, 909, 930, 936 = D:022 +2):
 * - qids(deep): a chunk task's question ids (the server chose them: spec §4.2 item 3), or null for anything else (a Deep module of P1); the
 *   page still asks only the ones visible after the chunk's own earlier answers (review 5).
 * - flow(deep, QB, vis) / derived(D) / unanswered(deep, F, A) (the P5 fix, M:023 252, 317, 819, 909): the chunk's questions in the server's
 *   order, visible by the server's stage; Start opens its first; it ends only when each is answered or skipped.
 * - readingLater(): the first run leaves the reading check to Phase D's day-1 task, unless this student's Phase D is already complete (a
 *   restart after it; review 6).
 * - active(): today's tasks open before unlock while Phase D runs, and after it while today holds a task (the chunks left after
 *   "diagnostic complete" are optional tasks, spec §4.3; P1 writes nothing before unlock, so any task then is Phase D's).
 * - sheet(task, box, P): the task sheet's box for a Phase D task: a chunk (Start, or "Skip these questions": item 8; the skip warns first, and a
 *   set skipped today opens again to be answered: the fourth walk, 11 Oct 2026), a check set (P5c's
 *   JG_CHECKS.set, its own screen over today's tasks, since the P5 wave-2 integration; the development stub's button only without it), the reading check's stages (A4's reading check through the
 *   page's own frame). True when it drew the box; false leaves the box to the design (a practice quiz, the parent step's share row).
 * - badge() / draftLine(): the roadmap's "Draft" badge and its line while Phase D runs (spec §4.2 item 9, §6.1), in the student's language.
 * Every word comes from the server (the snapshot's phase_d.words and labels); nothing here is design copy. */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null;
  if (!BOOT || !BOOT.uid || !BOOT.phaseD || BOOT.demo) return;
  var css = document.createElement('style');
  /* The badge in the design's own tag style (the roadmap's .jr-tags em: Raleway, 999px radius, the jade family), drawn for the title bar. */
  css.textContent = '.jg-draft{display:inline-block;margin-left:8px;padding:2px 9px;border-radius:999px;background:#FBF1DC;color:#8A5A0B;font-size:11px;font-weight:800;letter-spacing:.02em;vertical-align:middle;font-style:normal}' +
    '.jg-draft-line{margin:0 0 12px;padding:10px 12px;border-radius:14px;background:#FBF1DC;color:#6B4708;font-size:12.5px;line-height:1.45;font-weight:600}';
  (document.head || document.documentElement).appendChild(css);
  function E() { return window.JG_ENGINE || null; }
  function pd() { var e = E(); return (e && e.cache && e.cache.phase_d) || null; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function taskByDeep(deep) {
    var e = E(), t = e && e.cache && e.cache.tasks;
    if (!t || typeof deep !== 'string' || deep.indexOf('chunk:') !== 0) return null;
    for (var d in t) for (var i = 0; i < t[d].length; i++) if (t[d][i].deep === deep) return t[d][i];
    return null;
  }
  function qids(deep) { var t = taskByDeep(deep); return t && t.qids && t.qids.length ? t.qids.slice() : null; }
  /* The P5 fix (owner 7 Oct; the wave-2 walk): a chunk asks exactly its own questions, in the server's order (its first is a §3.3 input or
   * S4's last-July blocks, wherever the design's bank keeps it), each visible by the server's derived facts: the page's own derive() can
   * read another stage (S2 for the walk's S3 student), and a stage-only question (m2_planned_round, M11's) would be dropped, then stored
   * "skipped". derived(D): the server's facts over the page's. flow(deep, QB, vis): the chunk's [{ q, m }] in its order, or null for
   * anything that is not a chunk. unanswered(deep, F, A): the chunk's first question with no answer yet (an explicit skip is one). */
  function derived(D) {
    var e = E(), s = e && e.cache && e.cache.derived, o = {}, k;
    if (!s) return D;
    for (k in D) o[k] = D[k];
    for (k in s) o[k] = s[k];
    return o;
  }
  function flow(deep, QB, vis) {
    var c = qids(deep), by = {}, out = [];
    if (!c) return null;
    QB.modules.forEach(function (m) { m.questions.forEach(function (q) { by[q.id] = { q: q, m: m }; }); });
    c.forEach(function (id) { var x = by[id]; if (x && vis(x.q)) out.push(x); });
    lastSet = { deep: deep, ids: out.map(function (x) { return x.q.id; }) };
    return out;
  }
  /* THE WORDS ON A DAILY QUESTION SCREEN ARE TRUE (the 13-year-old's fifth walk, 11 Oct 2026; the controller's decision on the owner's "think
   * like you're me, and about users think like you're 12-18"). The tile says "3 ta savol"; inside, question 2 of 3 opened under "Soʻnggisi:
   * qanday ishlash sizga qulay." (the last one) and a third followed under "Endi tillar."; every screen was headed "1-savol". Those are the
   * old long run's lines: the design opens each section of the profile with Jamol's sentence about it (M:023:288 MOD_LINES) and numbers a
   * question inside its section (M:023:287), and a daily set takes one question from each of three sections. Inside a daily set the
   * section's sentence is not shown and the heading counts the set: "<section> · 2 / 3". No design line changes: the pass runs when the
   * design has drawn a question (the observer below, before the frame is painted), only for a chunk (S.deep is one, kept in the design's own
   * draft), and only once a screen. The count is the set as she is asked it now (flow's last answer: the questions visible to her). */
  var lastSet = null;
  function setHead() {
    var v = document.getElementById('dg-view'), h = v && !v.hidden ? v.querySelector('.dg-body > .dg-mod') : null;
    if (!h || h.getAttribute('data-jg-set')) return false;
    var d = draftNow(), ids = d.deep && lastSet && lastSet.deep === d.deep && qids(d.deep) ? lastSet.ids : null, i = ids ? ids.indexOf(d.at) : -1;
    if (i < 0) return false;
    var say = v.querySelector('.dg-body > .dg-say'), t = String(h.textContent || ''), cut = t.lastIndexOf(' · ');
    if (say) say.remove();
    h.setAttribute('data-jg-set', (i + 1) + '/' + ids.length);
    h.textContent = (cut > 0 ? t.slice(0, cut) + ' · ' : '') + (i + 1) + ' / ' + ids.length;
    return true;
  }
  function unanswered(deep, F, A) {
    if (!qids(deep)) return null;
    for (var i = 0; i < F.length; i++) if (A[F[i].q.id] === undefined) return F[i];
    return null;
  }
  /* Owner 11 Oct 2026 ("Diagnostikani bunday bermasin, balkim daily taskga boʻlib boʻlib bersin": do not give the diagnostic like this, let
   * it come in pieces, as daily tasks). While Phase D is on, a student's FIRST run asks only what Home cannot be drawn without (FIRST: is she
   * at school, her class, where she wants to study; src/engine/phase-d.ts FIRST_RUN_MIN, held equal by tests/unit/engine/first-run-min.test.ts)
   * and gives no check: the server stores the checks as put off and they come as tasks of her first days, and every other question of the
   * old first run comes in the daily questions (at most three a day).
   * - firstRun(): her first run, that is no result yet. A restart ("redo") keeps its result and the design's whole run, as before.
   * - first(QB, vis): the first run's [{ q, m }], or null when this is not her first run (the design then builds its own flow). An account
   *   that began the old long run and stopped part-way keeps every answer in its draft: the page opens at the first of these three it has
   *   not answered, and the end commits the whole draft.
   * - On the two one-answer screens (is she at school, her class) the tap on an answer goes on by itself: one tap a screen, no second tap on
   *   "Continue". Only in the first run, only for a radio list under the question; "Back" stays.
   * - introKey(s): the first screen's paragraph described the old run ("About 8 minutes of questions and up to 2 short checks …"); in the
   *   first run it reads the new sentence (public/runtime/jg-diag.js holds its Uzbek and Russian). */
  /* Owner 11 Oct 2026 (delegated call, the teen walk 4). A fourth question, her university (the design's own screen; "Continue" with none
   * named is the one-tap skip, and MIT or her place stands). After the last question the page goes Home, to today's tasks: the design's
   * result card and roadmap stay behind Home's roadmap button (endHome: the commit of a first run closes the view once the design has
   * drawn the card; no coin animation, the short run pays nothing here, src/server/engine/commit.ts). A restart of a short run is short
   * again (firstRun: the snapshot's first_run 'min' while the diagnostic is in progress). */
  var FIRST = ['m1_status', 'm1_grade', 'm2_destinations', 'm2_dream_unis'];
  var INTRO = 'A few quick questions, then your first tasks. The rest comes a little each day.';
  function firstRun() { var e = E(), c = e && e.cache; return !!c && (!c.result || (c.first_run === 'min' && c.diagnostic === 'in_progress')); }
  /* The run's own commit says it was the short one: the answer first_run "min" beside the three (src/engine/branch.ts EXTRA_ANSWER_KEYS).
   * The server then stores the checks as put off and asks the other Core questions day by day; a commit without it (the old whole run, a
   * restart, a script) is read as before. The page's own answers are not touched: the commit carries a copy. */
  function markCommit() {
    var e = E();
    if (!e || typeof e.commit !== 'function' || e.commit.jgFirstRun) return;
    var send = e.commit;
    e.commit = function (kind, payload, opts) {
      var short = kind === 'diagnostic_done' && firstRun() && !!payload && !!payload.answers;
      if (short) {
        var a = {}, p = {}, k;
        for (k in payload.answers) a[k] = payload.answers[k];
        for (k in payload) p[k] = payload[k];
        a.first_run = 'min'; p.answers = a; payload = p;
      }
      var sent = send.call(this, kind, payload, opts);
      return short && sent && typeof sent.then === 'function' ? sent.then(endHome) : sent;
    };
    e.commit.jgFirstRun = true;
  }
  function endHome(r) {
    var v = document.getElementById('dg-view'), c = window.JIA_coins, add = c && c.add;
    if (!r || !r.snapshot || !v) return r;
    v.style.visibility = 'hidden';                                          // the design draws its card next (results); it is closed before a frame shows it
    if (c && add) c.add = function () {};
    window.setTimeout(function () {
      if (c && add) c.add = add;
      var x = !v.hidden && v.querySelector('[data-act=close]');
      if (x) x.click();
      v.style.visibility = '';
    }, 0);
    return r;
  }
  markCommit();
  function first(QB, vis) {
    markCommit();
    if (!firstRun()) return null;
    var by = {}, out = [];
    QB.modules.forEach(function (m) { m.questions.forEach(function (q) { by[q.id] = { q: q, m: m }; }); });
    FIRST.forEach(function (id) { var x = by[id]; if (x && vis(x.q)) out.push(x); });
    return out.length ? out : null;
  }
  /* Home before the three questions are answered (the design's M:023:646 = D:022:648 and the laptop's KPI hint, D:023:119): the line that read
   * "Diagnostic in progress · 1 of 22" / "Take the diagnostic to begin" reads HOME (an English key: public/runtime/i18n/uz.json and ru.json
   * hold its Uzbek and Russian), and the button that read "Continue my diagnostic" reads HOOK (jg-diag.js holds its words). '' when this
   * is not her first run: the design's own line stands. */
  var HOME = 'A few quick questions, then your first tasks', HOOK = 'Finish the quick questions';
  /* The button before the questions read "Build my real roadmap" and the result card's restart "Start the diagnostic again": for a short
   * first run they say what happens (BEGIN, AGAIN; jg-diag.js holds their Uzbek and Russian). */
  var BEGIN = 'Start: a few quick questions', AGAIN = 'Answer the first questions again';
  function shortRun() { var c = E() && E().cache; return !!c && c.first_run === 'min'; }
  /* homeLine('done') (M:023:645 = D:022:647): the three questions are answered and the roadmap is not opened yet. While Phase D runs the line
   * says what today holds, 'Tasks today: N' (her own tasks, not the optional ones), where it read 'Diagnostic done · one step to unlock';
   * and the button reads the roadmap's own 'Open my roadmap' (introKey), where it read 'Open my diagnostic'. */
  function todayCount() { var c = E() && E().cache, t = (c && c.tasks && c.local_date && c.tasks[c.local_date]) || [], n = 0; for (var i = 0; i < t.length; i++) if (t[i] && !t[i].optional) n++; return n; }
  function running() { var p = pd(); return !!(p && p.active); }
  function homeLine(state) {
    if (state === 'done') { var n = running() ? todayCount() : 0; return n ? 'Tasks today: ' + n : ''; }
    return firstRun() ? HOME : '';
  }
  function introKey(s) {
    if (typeof s !== 'string') return s;
    if (s === 'Open my diagnostic' && running()) return 'Open my roadmap';
    if (s === 'Start the diagnostic again' && shortRun()) return AGAIN;
    if (!firstRun()) return s;
    if (s === 'Build my real roadmap') return BEGIN;
    if (s === 'Continue my diagnostic') return HOOK;
    return s.indexOf('About ') === 0 && s.indexOf('short checks') > 0 ? INTRO : s;
  }
  function goOn(ev) {
    var t = ev && ev.target, b = t && t.closest ? t.closest('.dg-opt[role=radio]') : null, list = b && b.closest('.dg-opts[role=radiogroup][aria-labelledby=dg-q]');
    if (!list || !firstRun()) return;
    window.setTimeout(function () { var n = document.getElementById('dg-next'); if (n && !n.disabled && document.body.contains(b)) n.click(); }, 220);
  }
  if (document.addEventListener) document.addEventListener('click', goOn);
  function words() { var p = pd(); return (p && p.words) || { start: 'Start · {{n}} questions', go: 'Start', skip: 'Skip these questions', stub: '', stub_go: '' }; }
  /* review 7: the count the server sends (the passage's questions, the set's items); a plain Start when it sends none */
  function startOf(w, n) { return typeof n === 'number' && n > 0 ? w.start.replace('{{n}}', n) : (w.go || 'Start'); }
  function refresh() { var e = E(); return e && e.refresh ? Promise.resolve(e.refresh()) : Promise.resolve(); }

  function sheet(task, box, P) {
    if (!task || !box || !P) return false;
    var w = words();
    if (task.qids && task.deep) {                                           // a chunk: Start, or skip it as a whole (stored "skipped", counted)
      /* A SKIP IS NOT A TRAP (the three teenagers' fourth walk, 11 Oct 2026; the controller's call on the owner's "think like you're me, and
       * about users think like you're 12-18"): "Skip these questions" was one tap with no warning, and a skipped task keeps today's building
       * shut. The first tap now says what it costs (w.skip_warn) and the button becomes "Skip anyway"; only the second tap skips. A set
       * skipped today opens again: one line (w.skipped_line) and Start, no second skip; answered, it is done (the server's answerSkipped). */
      var e0 = E(), was = e0 && typeof e0.ending === 'function' ? e0.ending(task) : null;
      var go = '<button class="dg-go" type="button" data-t="pd-go">' + esc(startOf(w, task.qids.length)) + '</button>';
      if (was === 'skipped') {
        box.innerHTML = (w.skipped_line ? '<p class="dg-hint" data-no-i18n>' + esc(w.skipped_line) + '</p>' : '') + go;
        box.querySelector('[data-t=pd-go]').onclick = function () { P.start(); };
        return true;
      }
      box.innerHTML = go + '<button class="dg-link" type="button" data-t="pd-skip">' + esc(w.skip) + '</button>';
      box.querySelector('[data-t=pd-go]').onclick = function () { P.start(); };
      box.querySelector('[data-t=pd-skip]').onclick = function (ev) {
        var b = ev.currentTarget;
        if (w.skip_warn && !b._jgArmed) {                                   // the first tap: what a skip costs, and nothing done yet
          b._jgArmed = true;
          try {
            var p = document.createElement('p'); p.className = 'dg-hint'; p.setAttribute('role', 'status'); p.setAttribute('data-no-i18n', ''); p.setAttribute('data-t', 'pd-skip-warn');
            p.textContent = w.skip_warn; b.parentNode.insertBefore(p, b); b.textContent = w.skip_go || w.skip;
          } catch (err) {}
          return;
        }
        b.disabled = true;
        E().commit('deep_done', { module: task.deep, answers: {}, skip: true }).then(function () { P.close(); });
      };
      return true;
    }
    if (task.reading === 1) {                                               // stage 1: A4's reading check in the page's own frame (spec §2.5)
      box.innerHTML = '<button class="dg-go" type="button" data-t="pd-read">' + esc(startOf(w, task.items)) + '</button>';
      box.querySelector('[data-t=pd-read]').onclick = function () { var p = P.check(); window.JG_CHECKS.reading(p.readLang(), p); };
      return !!window.JG_CHECKS;
    }
    if (task.check || task.reading === 2) {
      var cat = window.JG_CHECKS && (task.check ? window.JG_CHECKS.set : window.JG_CHECKS.reading2);
      if (typeof cat === 'function') {                                      // P5c's continuation set (or its second reading stage), when in the build
        /* the fifth walk, 11 Oct 2026 (owner 10 Oct, delegated call): a check set's number is the most it asks ("Boshlash · 8 tagacha savol":
           the card said 9 and the set was five), and a set stopped partway says how many are left ("Davom etish · 3 ta qoldi": it said
           "Boshlash · 5 ta savol" again). The reading stage's count is exact and keeps "Start · N questions". */
        var label = task.check && typeof task.left === 'number' && task.left > 0 && w.go_left ? w.go_left.replace('{{n}}', task.left)
          : task.check && typeof task.items === 'number' && task.items > 0 && w.start_upto ? w.start_upto.replace('{{n}}', task.items) : startOf(w, task.items);
        box.innerHTML = '<button class="dg-go" type="button" data-t="pd-cat">' + esc(label) + '</button>';
        // a check set is P5c's own screen (#jc-set): the task sheet closes and the set opens over today's tasks; when it closes the snapshot is
        // read again and today's tasks painted with it (the set's end completed its task on the server). Not through P.check(): the diagnostic
        // view it opens, at a new z-index, would cover the set (the P5 wave-2 integration)
        box.querySelector('[data-t=pd-cat]').onclick = task.check
          ? function () { P.close(); cat(task.check, { close: function () { refresh().then(function () { P.close(); }); } }); }
          : function () { cat(2, P.check({ task: task.id })); };
        return true;
      }
      if (BOOT.phaseDStub) {                                                // development only: no CAT in this build (never in production)
        box.innerHTML = '<p class="dg-hint">' + esc(w.stub) + '</p><button class="dg-go" type="button" data-t="pd-stub">' + esc(w.stub_go) + '</button>';
        box.querySelector('[data-t=pd-stub]').onclick = function (ev) {
          ev.currentTarget.disabled = true;
          fetch('/api/v1/phase-d/stub', { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid }, body: JSON.stringify({ task: task.id }) })
            .then(function () { return refresh(); }).then(function () { P.close(); }, function () { P.close(); });
        };
        return true;
      }
      return false;
    }
    return false;
  }
  function badge() { var p = pd(); return p && p.draft ? '<em class="jg-draft" title="' + esc(p.line) + '">' + esc(p.label) + '</em>' : ''; }
  function draftLine() { var p = pd(); return p && p.draft ? '<p class="jg-draft-line" role="note">' + esc(p.line) + '</p>' : ''; }
  function active() {
    var p = pd(), c = E() && E().cache;
    if (!p) return false;
    if (p.active) return true;
    var today = p.complete_at && c && c.tasks && c.local_date ? c.tasks[c.local_date] : null;
    return !!(today && today.length);
  }
  function readingLater() { var p = pd(); return !(p && p.complete_at); }
  /* Owner 10 Oct (delegated call, the teen walk: "🧱 Buni Oʻqish xonasida oʻrganing" under a reflection, the profile questions and the
   * parent's questionnaire). The design's task sheet writes "Study this in the Study Room" under every task not yet done (M:023:888 =
   * D:022:890); no design line changes: when a sheet opens, the line is taken off the sheet of a task that cannot be studied.
   * studies(task): a lesson, a practice or a thing to make (type study, practice, create) that the student does himself; not a
   * reflection, the profile questions (a chunk), a parent's or a counselor's part, a link to check, and nothing that completes by an event
   * on its own screen (a check set, the reading check). studyLine(sheet): the pass over one sheet; true when it took the line off. The task
   * is today's task with the sheet's own title; a title no task of today has leaves the sheet as the design drew it. */
  var STUDY = { study: 1, practice: 1, create: 1 };
  function studies(task) { return !!task && STUDY[task.type] === 1 && task.verification !== 'auto_event' && !task.deep; }
  function flat(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/^ | $/g, ''); }
  function studyLine(sheet) {
    var h = sheet && sheet.querySelector('#jt-h'), b = sheet && sheet.querySelector('.jt-study'), c = E() && E().cache, list = (c && c.tasks && c.tasks[c.local_date]) || [], want = flat(h && h.textContent);
    if (!b || !want) return false;
    for (var i = 0; i < list.length; i++) if (list[i] && flat(list[i].title_i18n) === want) { if (studies(list[i])) return false; b.remove(); return true; }
    return false;
  }
  var seenSheet = null;
  function sheetPass() {
    var s = document.getElementById('jt-sheet');
    if (!s) { seenSheet = null; return; }
    if (s === seenSheet) return;                                            // once a sheet: the design builds a new element each time it opens one
    seenSheet = s; studyLine(s);
  }
  /* The fourth question's one-tap skip (owner 11 Oct 2026, delegated call, the teen walk 4). The design's university screen takes "Continue"
   * only with a university named (an S1 child may go on with none) and gives a Core question no "Skip for now". In a first run its foot gets
   * the design's own skip link, worded "I don't know yet": one tap stores the question as skipped (the design's next(true)), and MIT or her
   * place stands until she names one. No design line changes; the link is added when the screen is drawn. */
  var LATER = { en: "I don't know yet", uz: 'Hali bilmayman', ru: 'Пока не знаю' };
  function draftNow() { try { return JSON.parse(window.localStorage.getItem('jg.diag.v1') || '{}') || {}; } catch (e) { return {}; } }
  function skipUni() {
    var v = document.getElementById('dg-view'), n = v && !v.hidden ? v.querySelector('#dg-next') : null;
    if (!n || !firstRun() || v.querySelector('[data-act=skip]')) return;
    var d = draftNow(), c = E() && E().cache;
    if (d.at !== 'm2_dream_unis') return;
    var b = document.createElement('button');
    b.className = 'dg-link'; b.type = 'button'; b.setAttribute('data-act', 'skip'); b.setAttribute('data-jg', 'uni-later');
    b.textContent = LATER[(d.answers && d.answers.m0_roadmap_language) || (c && c.lang)] || LATER.en;
    n.parentNode.insertBefore(b, n.nextSibling);
  }
  function watchSheets() { if (typeof window.MutationObserver === 'function' && document.body) { new window.MutationObserver(function () { sheetPass(); skipUni(); setHead(); }).observe(document.body, { childList: true, subtree: true }); sheetPass(); } }
  if (document.body) watchSheets(); else if (document.addEventListener) document.addEventListener('DOMContentLoaded', watchSheets);
  window.JG_PHASED = { FIRST: FIRST, INTRO: INTRO, HOME: HOME, HOOK: HOOK, BEGIN: BEGIN, AGAIN: AGAIN, firstRun: firstRun, first: first, introKey: introKey, homeLine: homeLine, qids: qids, derived: derived, flow: flow, unanswered: unanswered, sheet: sheet, badge: badge, draftLine: draftLine, active: active, readingLater: readingLater, refresh: refresh, studies: studies, studyLine: studyLine, setHead: setHead };
})();
