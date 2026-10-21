/* Jamals Global runtime — loaded before any design script (D6).
 * 1. Hydrates the design's own localStorage keys from the server copy in window.JG_BOOT.state.
 * 2. Mirrors every later write of those keys to the server (debounced; one request per key at a time;
 *    retried; unsaved keys kept in jg.dirty; flushed on page hide; never for another account — I1, I2).
 * 3. Provides window.claude.use("sample" | "downloads") backed by this server (Task 7 adds sample).
 * 4. Exposes the signed-in identity as window.JG_ME (with .photo and .initials, Task 8) and, in the
 *    parent apps, the linked child as window.JG_CHILD (the same fields, Task 9).
 * 5. JG_RUNTIME.signOut() and [data-jg-signout]: the design's Log out (Ruling R12); <html data-jg-photo>
 *    for the hero photo framing (Ruling R13).
 * 6. For a live, non-demo student (JG_BOOT.engine, P1 spec §4.1), window.JG_ENGINE: the engine snapshot the designs read,
 *    the student's local day, awaited commits, an outbox for everything else, the wallet settled on the server's balance.
 * 7. For a student, JG_BOOT.familyCode kept current while the page stays open (I7: a code seats one parent, lives three days),
 *    and JG_RUNTIME.familyShare / sendFamilyLink: the parent link sent through Telegram or copied (owner 4 Oct R8).
 * 8. For a live student, the motion setting (owner 4 Oct R7: <html class="calm"> and the reduced-motion query) and
 *    window.JG_MOTION (R1: what plays once a day).
 * 9. For a live student, Home's score bubbles start empty (a dash), never as the design's demo numbers, until the page writes
 *    the student's own (the teen walk of 10 Oct 2026).
 * No design code is changed by this file. */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null;
  if (!BOOT) return;
  var ls; try { ls = window.localStorage; } catch (e) { ls = null; }
  var SYNCED = BOOT.syncedKeys || [];
  var isSynced = function (k) { return SYNCED.indexOf(k) !== -1; };
  var rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem, rawClear = Storage.prototype.clear;
  /* Saving (final review I1, I2). A write of a synced key is queued and sent after a short pause, at most one
   * request per key at a time: a newer value waits for the one before it, so two can never arrive out of order.
   * The key stays in `jg.dirty` (kept with the account it belongs to) from the write until the server has
   * confirmed that very value, and on the next load a dirty key's local copy wins over the server copy: an edit
   * made offline, or refused because the session ran out, is sent again instead of being overwritten. Network
   * errors and 5xx are retried with backoff. Every request names the account this page was rendered for
   * (x-jg-uid); the server answers 409 when another account is signed in now, and this page then stops saving
   * and reloads. The same happens before a write when this browser's jg.uid already names another account. */
  var pending = {}, inflight = {}, timer = null, fails = 0, holdUntil = 0, stopped = false, signedOut = false;
  var DIRTY = 'jg.dirty';
  var hooks = {};   // section 8: a synced key's new value, rewritten before it is stored and sent (key -> function (value) -> value)

  function readDirty() {
    try { var d = JSON.parse(ls.getItem(DIRTY) || 'null'); return d && d.uid === BOOT.uid && Array.isArray(d.keys) ? d.keys : []; } catch (e) { return []; }
  }
  function writeDirty(keys) {
    try { if (keys.length) rawSet.call(ls, DIRTY, JSON.stringify({ uid: BOOT.uid, keys: keys })); else rawRemove.call(ls, DIRTY); } catch (e) {}
  }
  function markDirty(k) { if (!ls) return; var keys = readDirty(); if (keys.indexOf(k) === -1) { keys.push(k); writeDirty(keys); } }
  function markClean(k, v) {
    if (!ls) return;
    try { if (ls.getItem(k) !== v) return; } catch (e) { return; }      // changed again since: still unsaved
    var keys = readDirty(), i = keys.indexOf(k);
    if (i !== -1) { keys.splice(i, 1); writeDirty(keys); }
  }
  function stale() { try { return ls.getItem('jg.uid') !== BOOT.uid; } catch (e) { return false; } }
  function takenOver() { if (stopped) return; stopped = true; pending = {}; clearTimeout(timer); timer = null; location.reload(); }

  function put(key, value, keepalive) {
    var url = '/api/v1/state/' + encodeURIComponent(key), headers = { 'x-jg-uid': BOOT.uid };
    var opts = value === null ? { method: 'DELETE', keepalive: !!keepalive, headers: headers } : { method: 'PUT', body: value, keepalive: !!keepalive && value.length < 60000, headers: headers };
    if (value !== null) headers['content-type'] = 'text/plain;charset=UTF-8';
    return fetch(url, opts).then(function (r) { return r.status; }, function () { return 0; });
  }
  function send(k, keepalive) {
    if (inflight[k]) return inflight[k].then(function () { return send(k, keepalive); });   // one at a time per key
    if (!(k in pending) || stopped || signedOut) return Promise.resolve();
    if (!keepalive && Date.now() < holdUntil) { schedule(holdUntil - Date.now()); return Promise.resolve(); }
    var v = pending[k]; delete pending[k];
    return (inflight[k] = put(k, v, keepalive).then(function (status) {
      delete inflight[k];
      if (status >= 200 && status < 300) { fails = 0; if (!(k in pending)) markClean(k, v); return; }
      if (status === 409) return takenOver();
      // Signed out (the session ran out): nothing more is sent from this page; unsaved values stay dirty
      // here and win when this account signs in again.
      if (status === 401) { signedOut = true; location.href = '/signin?next=' + encodeURIComponent(location.pathname); return; }
      if (status === 0 || status === 429 || status >= 500) { if (!(k in pending)) pending[k] = v; retryLater(); return; }
      // 400/413: the same value would be refused again. It stays dirty, so this browser keeps it over the older server copy.
    }));
  }
  function flush(keepalive) {
    clearTimeout(timer); timer = null;
    if (stopped || signedOut) return Promise.resolve();
    if (!keepalive && Date.now() < holdUntil) { schedule(holdUntil - Date.now()); return Promise.resolve(); }
    var keys = Object.keys(pending), jobs = [];
    for (var i = 0; i < keys.length; i++) jobs.push(send(keys[i], keepalive));
    return Promise.all(jobs);
  }
  function schedule(ms) { if (!timer && !stopped) timer = setTimeout(function () { timer = null; flush(false); }, ms == null ? 800 : ms); }
  function retryLater() { fails++; var ms = Math.min(60000, 1000 * Math.pow(2, fails - 1)); holdUntil = Date.now() + ms; schedule(ms); }
  function queue(key, value) { if (stopped) return; pending[key] = value; markDirty(key); schedule(); }

  /* P1 (spec §4.1 seam 2, §5.1): for a live student the server owns some fields of the two engine blobs (Plan A's
   * DIAG_SERVER_FIELDS / STUDY_SERVER_FIELDS, projected into JG_BOOT.state; the answers too once the diagnostic is done).
   * A dirty local blob is still re-sent, but with those fields taken from the server copy, so an old local done, day or
   * brick count never wins. parent_sent and reviewsUsed only ever turn on. */
  var OWNED = {
    'jg.diag.v1': ['done', 'result', 'parallel', 'unlocked', 'version', 'days', 'proofs', 'lessons', 'parent', 'parentAnswers', 'deepDone', 'changelog', 'diagBricks'],
    'jg.study.v1': ['uni', 'bricks', 'target', 'cracked', 'log', 'sessions', 'diagCredit']
  };
  function withServerFields(k, local, server) {
    var owned = BOOT.engine && OWNED[k], a, b;
    if (!owned || local === null || server === undefined) return local;
    try { a = JSON.parse(local); b = JSON.parse(server); } catch (e) { return server; }
    if (!a || typeof a !== 'object' || Array.isArray(a) || !b || typeof b !== 'object') return server;
    var f = owned.concat(k === 'jg.diag.v1' && BOOT.engine.diagnostic === 'done' ? ['answers'] : []);
    for (var i = 0; i < f.length; i++) { if (Object.prototype.hasOwnProperty.call(b, f[i])) a[f[i]] = b[f[i]]; else delete a[f[i]]; }
    if (k === 'jg.diag.v1') { if (b.parent_sent === true) a.parent_sent = true; if (b.reviewsUsed && !a.reviewsUsed) a.reviewsUsed = b.reviewsUsed; }
    return JSON.stringify(a);
  }

  if (ls) {
    try {
      var mine = readDirty();       // this account's own unsaved edits, if it was the last one here
      if (ls.getItem('jg.uid') !== BOOT.uid) {
        // another account, or a sign-out, since: its copies must not leak into this one (only this account's own unsaved edits stay)
        for (var i = 0; i < SYNCED.length; i++) if (mine.indexOf(SYNCED[i]) === -1) rawRemove.call(ls, SYNCED[i]);
        rawSet.call(ls, 'jg.uid', BOOT.uid);
      }
      writeDirty(mine);
      var st = BOOT.state || {};
      for (var j = 0; j < SYNCED.length; j++) {
        var k = SYNCED[j], local = ls.getItem(k);
        if (mine.indexOf(k) !== -1) {                                                     // unsaved: this copy wins and is sent again,
          var merged = Object.prototype.hasOwnProperty.call(st, k) ? withServerFields(k, local, st[k]) : local;   // with the server's own fields (P1)
          if (merged !== local) rawSet.call(ls, k, merged);
          queue(k, merged);
        }
        else if (Object.prototype.hasOwnProperty.call(st, k)) rawSet.call(ls, k, st[k]);   // the server copy wins
        else if (local !== null) queue(k, local);                                          // same account, not yet saved
      }
    } catch (e) { /* storage full or blocked: the design runs on its defaults */ }
    Storage.prototype.setItem = function (k, v) {
      if (this === ls && isSynced(k)) {
        if (stopped) return;
        if (stale()) return takenOver();     // another account signed in on this browser after this page loaded
        v = String(v); if (hooks[k]) v = hooks[k](v);
        rawSet.call(this, k, v); queue(k, v); return;
      }
      rawSet.call(this, k, v);
    };
    Storage.prototype.removeItem = function (k) {
      if (this === ls && isSynced(k)) {
        if (stopped) return;
        if (stale()) return takenOver();
        rawRemove.call(this, k); queue(k, null); return;
      }
      rawRemove.call(this, k);
    };
    // A same-account clear() only wipes this browser's local copies. It must never delete the
    // account's saved state on the server: that's what the "different account signed in on this
    // browser" branch above (keyed on jg.uid) already handles, entirely locally, without touching
    // the server. So clear() here queues nothing; jg.uid is only restored so the next load isn't
    // misread as an account switch.
    Storage.prototype.clear = function () { var mine = this === ls && !stale(); rawClear.call(this); if (mine) rawSet.call(ls, 'jg.uid', BOOT.uid); };
    window.addEventListener('pagehide', function () { flush(true); });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(true); });
  }

  /* Ruling R12: the design's Log out ends the session for real. What is still unsaved goes first (the account's
   * cookie is gone afterwards), then the same CSRF-checked POST to Auth.js that /signout's button makes
   * (public/runtime/auth.js); a GET never signs out. Lands on /signin. The parent designs' button carries
   * data-jg-signout; the student designs call JG_RUNTIME.signOut() from their confirm dialog. */
  function signOut() {
    var wait = new Promise(function (resolve) { setTimeout(resolve, 3000); });
    return Promise.race([flush(false), wait]).then(function () {
      return fetch('/api/auth/csrf', { credentials: 'same-origin' }).then(function (r) { return r.json(); });
    }).then(function (j) {
      if (!j || !j.csrfToken) throw new Error('no csrf token');
      signedOut = true;
      var f = document.createElement('form');
      f.method = 'post'; f.action = '/api/auth/signout'; f.hidden = true;
      [['csrfToken', j.csrfToken], ['callbackUrl', '/signin']].forEach(function (x) {
        var i = document.createElement('input'); i.type = 'hidden'; i.name = x[0]; i.value = x[1]; f.appendChild(i);
      });
      document.body.appendChild(f); f.submit();
    }).catch(function () { location.href = '/signout'; });   // its confirmation page signs out with the same POST
  }
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-jg-signout]') : null;
    if (el) { e.preventDefault(); signOut(); }
  });

  // The signed-in person's photo for the design: the account photo, or the same initials avatar
  // src/server/pages.ts initialsSvg() draws (keep the two in step).
  function initialsOf(fullName) {
    return String(fullName || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return Array.from(w)[0].toUpperCase(); }).join('');
  }
  function escHtml(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initialsSvg(fullName) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#2b9067"/><text x="60" y="60" dy=".35em" text-anchor="middle" font-family="Raleway,system-ui,sans-serif" font-weight="700" font-size="46" fill="#fff">' + escHtml(initialsOf(fullName)) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function face(p) { if (p) { p.initials = initialsOf(p.fullName); p.photo = p.photoUrl != null ? p.photoUrl : initialsSvg(p.fullName); } return p; }
  window.JG_ME = face(BOOT.me);
  window.JG_CHILD = face((BOOT.children || [])[0]);   // the parent apps' linked child (Task 9); undefined for a student
  // Owner 4 Oct R10 (P4d): the dream-university search (M:023:375, D:022:377). A real student's catalog rows (JG_BOOT.unis, src/engine/catalog.ts)
  // carry their search words as a fourth item: acronyms, the uz/ru names, the city as Tashkent, Toshkent or Ташкент. A query matches the name, those
  // words or the id, folding case, accents (Boğaziçi = Bogazici) and the Uzbek apostrophes (OʻzMU = OzMU); an exact word ranks first, then a
  // word that starts with the query, then (from three letters) a word that contains it; ties keep the catalog's order. Rows without words (the
  // design's own 20, the demo) keep the design's filter: the English name contains the query.
  function fold(s) { return String(s == null ? '' : s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\u02bb\u02bc\u2018\u2019`'\u00b4]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
  function uniRank(row, q) {
    var words = [row[1], row[0]].concat(Array.isArray(row[3]) ? row[3] : []).map(fold), best = -1;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], r = w === q ? 0 : (w.indexOf(q) === 0 || w.indexOf(' ' + q) !== -1) ? 1 : (q.length >= 3 && w.indexOf(q) !== -1) ? 2 : -1;
      if (r !== -1 && (best === -1 || r < best)) best = r;
    }
    return best;
  }
  // Owner 10 Oct 2026 (delegated call, the teen walk): "the default list is MIT, Harvard, Stanford ... it ignores the countries I chose on the
  // screen before", and a search that matches nothing drew an empty list with no word. Both read the first run's own draft (the design keeps it
  // in localStorage 'jg.diag.v1': answers.m2_destinations, where "own_country" is answers.m0_residence_country, and answers.m0_roadmap_language).
  function diagDraft() { try { var s = JSON.parse((ls && ls.getItem('jg.diag.v1')) || 'null'); return (s && s.answers) || {}; } catch (e) { return {}; } }
  // An empty search lists the universities of the countries he chose first, one from each country in turn in the order he chose them (the page
  // shows the first 7: with three countries chosen, each is on the screen, his own among them: "ours only come if I search"); inside a country
  // and for the rest the catalog's order stands.
  // The third walk (the 13-year-old, who had not said where: "the default list is six US/UK names: MIT, Harvard, Stanford, Penn, NYU,
  // Oxford"): with no country chosen (or "I don't know yet" alone) the list is mixed the same way from his own country first, then Türkiye,
  // South Korea and the United States, so the first screen holds a home university and three ways out, not one country's famous names.
  var UNI_MIX = ['TR', 'KR', 'US'];
  function chosenFirst(rows) {
    var A = diagDraft(), home = A.m0_residence_country || 'UZ', cc = [];
    (Array.isArray(A.m2_destinations) ? A.m2_destinations : []).forEach(function (d) { d = d === 'own_country' ? home : d; if (/^[A-Z]{2}$/.test(d) && cc.indexOf(d) === -1) cc.push(d); });
    if (!cc.length) [/^[A-Z]{2}$/.test(home) ? home : 'UZ'].concat(UNI_MIX).forEach(function (c) { if (cc.indexOf(c) === -1) cc.push(c); });
    var by = cc.map(function (c) { return rows.filter(function (r) { return r[2] === c; }); }), out = [], more = true;
    for (var k = 0; more; k++) { more = false; for (var g = 0; g < by.length; g++) if (k < by[g].length) { out.push(by[g][k]); more = true; } }
    return out.concat(rows.filter(function (r) { return cc.indexOf(r[2]) === -1; }));
  }
  var UNI_NONE = { en: 'Nothing found. Try the name in English, the city or the country.', uz: 'Hech narsa topilmadi. Nomini inglizcha yozib koʻring yoki shahar, davlat nomini yozing.', ru: 'Ничего не нашлось. Попробуйте название по-английски, город или страну.' };
  // The page writes the matches into its own list (#dg-sug) right after this call returns; when there are none it then holds nothing, and this
  // line goes into it, in the design's own hint style, in the language the first run is in. A later search replaces it as the page repaints.
  function sayNone() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    Promise.resolve().then(function () {
      var box = document.getElementById('dg-sug'); if (!box || box.firstChild) return;
      var l = diagDraft().m0_roadmap_language || (BOOT.engine && BOOT.engine.lang) || 'en', p = document.createElement('p');
      p.className = 'dg-hint'; p.setAttribute('data-no-i18n', ''); p.setAttribute('role', 'status'); p.textContent = UNI_NONE[l] || UNI_NONE.en; box.appendChild(p);
    });
  }
  function uniFind(rows, query) {
    var q = fold(query);
    if (!rows.some(function (r) { return Array.isArray(r[3]); })) return rows.filter(function (x) { return !query || x[1].toLowerCase().includes(query); });
    if (!q) return chosenFirst(rows);
    var out = rows.map(function (r, i) { return { r: r, i: i, k: uniRank(r, q) }; }).filter(function (x) { return x.k !== -1; })
      .sort(function (a, b) { return a.k - b.k || a.i - b.i; }).map(function (x) { return x.r; });
    if (!out.length) sayNone();
    return out;
  }
  window.JG_RUNTIME = { flush: function () { return flush(false); }, pending: function () { return Object.keys(pending).length; }, signOut: signOut, initialsSvg: initialsSvg, uniFind: uniFind };   // P4b R14: the badge for a university without a design photo; P4d R10: the search

  // Ruling R13: the student designs frame the hero photo (190% at 56.3% / 33.1%) for their own photo of Oqil. Any
  // other photo (the account's, or the initials avatar) is shown whole and centred by one CSS rule keyed on this.
  if (window.JG_ME && !/\/media\/7f94c733caf352e0\.jpg$/.test(window.JG_ME.photo || '')) document.documentElement.setAttribute('data-jg-photo', 'account');

  var downloads = {
    save: function (o) {
      return new Promise(function (resolve) {
        var a = document.createElement('a'), u = URL.createObjectURL(o.data);
        a.href = u; a.download = o.filename || 'download'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 5000); resolve();
      });
    }
  };
  var caps = { downloads: downloads };
  window.claude = {
    use: function (name) { return caps[name] ? Promise.resolve(caps[name]) : Promise.reject(new Error('capability unavailable: ' + name)); },
    _register: function (name, impl) { caps[name] = impl; }
  };

  function sample(messages, opts) {
    opts = opts || {};
    // P6 lane B4: Ask Jamol about a real lesson (public/runtime/jg-jamol.js tagLast marks the turns): its id and the page's language go too
    var lesson = messages && typeof messages.lessonId === 'string' ? messages.lessonId : null;
    return fetch('/api/v1/ai/sample', { method: 'POST', headers: { 'content-type': 'application/json' }, signal: opts.signal,
      body: JSON.stringify(lesson ? { messages: messages, modelTier: opts.modelTier, lesson_id: lesson, lang: messages.lang } : { messages: messages, modelTier: opts.modelTier }) })
      .then(function (r) {
        if (r.status === 428) { try { document.dispatchEvent(new Event('jg:ai-notice')); } catch (x) {} }   // m1 jamol (AI_CONSENT): the notice's "I agree" first (public/runtime/jg-ai-notice.js)
        if (!r.ok || !r.body) { var e = new Error('sample failed: ' + r.status); e.code = r.status === 429 ? 'rate_limited' : 'unavailable'; if (lesson) messages.failed = e.code; throw e; }
        var reader = r.body.getReader(), dec = new TextDecoder(), text = '';
        function pump() {
          return reader.read().then(function (x) {
            if (x.done) return { text: text };
            text += dec.decode(x.value, { stream: true });
            if (opts.onText) { try { opts.onText({ text: text }); } catch (e) {} }
            return pump();
          });
        }
        return pump();
      });
  }
  window.claude._register('sample', sample);

  /* 6. P1 (spec §4.1): window.JG_ENGINE, only for a live, non-demo student. The engine snapshot in the boot is the
   * in-memory cache the synchronous design reads at first paint (seam 1); the design's own call sites read it and fall
   * back to their mock when it is absent (seam 3), so the design's own account and /preview never change. */
  if (BOOT.engine) (function () {
    var E = { cache: BOOT.engine, v: 1 };
    var doneSeen = BOOT.engine.done || {}, localDone = {}, ended = {};
    var current = (BOOT.engine.study && BOOT.engine.study.running) || null;
    var fmt = null, fmtTz = null;
    /** The student's calendar date at an instant: @/engine localDateOf's rule (Intl in the snapshot's zone), not the UTC date. */
    E.ymd = function (d) {
      var tz = E.cache.tz || 'Asia/Tashkent';
      if (fmtTz !== tz) { fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }); fmtTz = tz; }
      return fmt.format(d);
    };
    /** Owner 10 Oct 2026 (delegated call, the second teen walk: "the bird nags in the first minute: a boxing glove and cracked glass over
     *  the whole Today page before I have done anything"): true while Jamol must not remind and must not crack the screen: the first 24
     *  hours after sign-up (BOOT.since), and on later days before 18:00 Tashkent time. The design asks it (M:006:302 and 339, D:003:319
     *  and 353); the demo family and /preview have no JG_ENGINE and keep the design's walk. */
    var hourFmt = null;
    E.gentle = function (now) {
      var t = now instanceof Date ? now : new Date(), since = Date.parse(BOOT.since || '');
      if (since && t.getTime() - since < 864e5) return true;
      if (typeof restToday === 'function' && restToday()) return true;       // the fifth walk: nothing is due on a rest day, so nothing is reminded
      try {
        if (!hourFmt) hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', hour: '2-digit', hourCycle: 'h23' });
        return parseInt(hourFmt.format(t), 10) < 18;
      } catch (e) { return true; }
    };
    E.result = function () { return E.cache.result; };
    E.narration = function () { return E.cache.narration; };
    /** A copy: the page appends its own ghost milestones to the roadmap it gets (M:023:751). */
    E.roadmap = function () { return E.cache.roadmap ? weekRows(JSON.parse(JSON.stringify(E.cache.roadmap))) : null; };
    /** Owner 10 Oct 2026 (delegated call, the teen walk, the fourth round; the 13-year-old, three walks running: "Roadmap step sheets say
     *  nothing"). The design's step sheet lists "This week and next" from the roadmap's weekly goals (M:023:795), and the server sends a
     *  goal only for the step that was active when the plan was made, so most sheets listed no task at all. Every step that the week's
     *  own tasks name (the rows the snapshot already carries, from today on) gets its row here, in the copy the page reads: those tasks'
     *  titles in the day's order, each once, three at most, with their own minutes as the hours. Nothing is added to the snapshot (it
     *  stays under 30 KB), nothing is stored, and a step with no task this week still lists nothing. */
    function weekRows(R) {
      var T = E.cache.tasks || {}, G = R.weekly_goals || (R.weekly_goals = []), have = {}, by = {}, order = [];
      for (var i = 0; i < G.length; i++) have[G[i].milestone_id] = 1;
      Object.keys(T).sort().forEach(function (d) {
        (T[d] || []).forEach(function (t) {
          if (!t || !t.milestone_id || have[t.milestone_id]) return;
          if (!by[t.milestone_id]) { by[t.milestone_id] = { titles: [], min: 0, from: d }; order.push(t.milestone_id); }
          var b = by[t.milestone_id];
          if (b.titles.indexOf(t.title_i18n) < 0) b.titles.push(t.title_i18n);
          b.min += t.est_minutes || 0;
        });
      });
      order.forEach(function (id) {
        var b = by[id];
        if (!(R.milestones || []).some(function (m) { return m.id === id; })) return;
        G.push({ id: 'wk_' + id, milestone_id: id, week_start: b.from, target_i18n: b.titles.slice(0, 3).join('; ') + (b.titles.length > 3 ? '…' : ''), hours_budget: Math.max(1, Math.round(b.min / 60)) });
      });
      return R;
    }
    E.tasks = function (date) { return (E.cache.tasks && E.cache.tasks[date]) || []; };
    /** Completions known at load and at the last refresh (another device, the parent's answer). The page's own are in its S.days. */
    E.done = function (date) { var d = doneSeen[date]; return d ? { ids: d.ids.slice(), proofs: Object.assign({}, d.proofs) } : { ids: [], proofs: {} }; };
    /** A task's state on the Today page: done (here, on the server or elsewhere), in progress (studied right now), or waiting. */
    E.state = function (t) {
      if (!t) return 'wait';
      var e = endOf(t);
      if (e) return e === 'skipped' ? 'skip' : e;   // 'done', 'tried', 'skip': the Today row's own word for each (M:006:21, D:003:27)
      if (current && current.task_id === t.id && !ended[current.id]) return 'prog';
      return t.optional && restToday() ? 'opt' : 'wait';
    };
    /* A REST DAY ON THE TODAY TAB (the 17- and the 13-year-old's fifth walk, 11 Oct 2026: "looks like unpaid debt": both optional rows carry
     * a red "Ожидает", the first row is outlined in red, the bird says "Готовы? Начнём: Повтор"; the controller's decision). On a rest day
     * (every task of today is optional: dayNumbers().rest, as Home reads it) an optional row that is not ended is 'opt': the design writes
     * the runtime's word for it ("Optional", endWords) in a quiet pill (the server's style, src/server/pages.ts "jg-ends"), nothing is
     * 'wait', so the design's own code outlines no row in red and Jamol's line is the day's (dayLine: "Today is a rest day. Nothing is
     * due."). And he never reminds or cracks the screen on a rest day (gentle). No design line changes. */
    function restToday() { try { return !!dayNumbers().rest; } catch (e) { return false; } }
    /* How a task ended (src/engine/endings.ts; the second walk of the 15- and the 17-year-old, 10 Oct 2026: "a skip gives a green tick and
     * gold on the building ... the coins stop meaning anything"): 'done' real work, 'tried' a genuine failed attempt, 'skipped' the student's
     * own skip, null still open. The server's status says it; `localEnd` holds what this page ended itself until the snapshot does. */
    var localEnd = {}, won = {};   // won: a tried quiz this page has just passed (won back), until the snapshot says "done"
    function endOf(t) {
      if (!t) return null;
      if (won[t.id]) return 'done';
      if (localEnd[t.id]) return localEnd[t.id];
      if (t.status === 'tried' || t.status === 'skipped') return t.status;
      if (localDone[t.id] || t.status === 'done' || (doneSeen[t.date] && doneSeen[t.date].ids.indexOf(t.id) !== -1)) return 'done';
      return null;
    }
    E.ending = endOf;
    /* A TRIED quiz can be won back the same day (src/engine/endings.ts; the third walk, 10 Oct 2026: the fail screen promises "Try again: the
     * questions are easier now", and after "This is too hard for me" the tile was shut: "You tried this one today · +5 · Close"). Its tile
     * and its row open the design's own sheet again; a pass there turns the task DONE and pays `again`: the task's coins less the tick
     * already paid (the snapshot's field; for a task tried on this page, what jg-checks.js kept). */
    /* the sixth walk, 11 Oct 2026: ONE more go (src/server/checks.ts winBackOpen); once it is used the server sends no `again`, and the sheet
     * that used it drops its own (jg-checks.js lastGo), so the tile opens the tried sheet, not the quiz */
    function canAgain(t) { return !!t && t.verification === 'quiz' && endOf(t) === 'tried' && t.date === E.cache.local_date && typeof t.again === 'number'; }
    function paidOf(t) { return typeof t.paid === 'number' ? t.paid : (t.coins | 0); }
    function openAgain(t) { if (typeof t.again !== 'number') return; if (typeof t.paid !== 'number') t.paid = t.coins | 0; t.coins = t.again; }
    E.canAgain = canAgain;
    /* A SKIP IS NOT A TRAP (the fourth walk, 11 Oct 2026; the controller's call): a set of questions skipped TODAY opens the design's own sheet
     * again (public/runtime/jg-phased.js draws one line and Start); answered, the server turns it DONE (src/server/engine/tasks.ts
     * answerSkipped) and pays its `again`. Its words no longer say "It comes back another day": these questions do not (they are stored
     * "skipped" and tomorrow brings the next ones); they say she can still answer today. */
    function canAnswer(t) { return !!t && !!t.qids && !!t.deep && endOf(t) === 'skipped' && t.date === E.cache.local_date; }
    E.canAnswer = canAnswer;
    /** The pass of a tried quiz (public/runtime/jg-checks.js, before the design's own finish): the task is done from here on. */
    E.wonBack = function (t) { if (!t || !t.id || endOf(t) !== 'tried') return; delete localEnd[t.id]; won[t.id] = true; paintDay(); };
    /** Owner 4 Oct R12: the student's own grade and school (the profile tag, the Settings header) and bio, from the snapshot's
     *  profile; what the student has not said is left out, so before a result both are empty (never the design's "Grade 11, JIA"). */
    E.meLine = function (sep) { var p = E.cache.profile || {}; return [p.grade, p.school].filter(Boolean).join(sep); };
    /** The teen walk of 10 Oct 2026 (the owner's delegated call; a 7th-grader: "My Home calls me an applicant"): the line under the name, the
     *  server's rule (src/engine/profile.ts roleLine): "College applicant" only in the application year or after school (stage S3 or S4), else
     *  the student's own class ("Grade 7 student"), and "Student" while no class is known. The design's snapshot handler still writes its fixed
     *  "College applicant · Grade N" on the laptop (D:022:1665), so this is written again after it; the phone's line has no handler of its own. */
    E.roleLine = function (sep) {
      var p = E.cache.profile || {}, st = (E.cache.derived || {}).stage, g = p.grade;
      if (st === 'S3' || st === 'S4') return ['College applicant', g].filter(Boolean).join(sep || ' · ');
      return g ? (/^Grade \d+$/.test(g) ? g + ' student' : g) : 'Student';
    };
    if (document.querySelector) document.addEventListener('DOMContentLoaded', function () {     // registered after the design's own listener, so it runs after it
      document.addEventListener('jg:snapshot', function () {
        var els = document.querySelectorAll('.sb-role, .who h1 + p'), t = E.roleLine(' · ');
        for (var i = 0; i < els.length; i++) if (els[i].textContent !== t) els[i].textContent = t;
      });
    });
    E.meBio = function () { return (E.cache.profile || {}).bio || ''; };
    /** Owner 4 Oct R13: the level the student's own XP earns (the League, the Today card, the profile tag), never the design's
     *  "Level 7": @/engine levelOf, here for the page (level 1 at 0 XP; level n starts at 50·n·(n−1) XP; parity in jg-engine.test.ts). */
    E.level = function (xp) {
      var x = Number(xp), start = function (k) { return 50 * k * (k - 1); }, n = 1;
      if (!isFinite(x) || x < 0) x = 0;
      while (start(n + 1) <= x) n++;
      return { level: n, from: start(n), next: start(n + 1) };
    };
    /** Owner 4 Oct 2026, test phase (D19, R6): the teacher of lesson i of a Lessons-tab course (the design's SUBJECTS key), from the snapshot's
     *  teachers (src/engine/teachers.ts: PLACEHOLDERS until the real roster), as a copy with the card's shared words in `w`; null when none. */
    E.teacher = function (course, i) {
      var T = E.cache.teachers, list = (T && T.list) || [];
      for (var k = 0; k < list.length; k++) {
        var idx = (list[k].lessons || {})[course];
        if (idx && idx.indexOf(i) !== -1) return JSON.parse(JSON.stringify(Object.assign({ w: T.words || {} }, list[k])));
      }
      return null;
    };
    /** P5d (spec §3.8, owner decision 1 of 7 Oct): the words a "% ready" place shows under readiness v4, in the student's language, for his
     *  goal (no key) or one of his own universities (a catalog id): `tag` the number alone (the map's 64-unit tag bubble: "<1%", "9%", "—"), `word` the fewest words, `label` one line ("about 9 in 100"),
     *  `long` the range where there is room, `num` the ring's number ("9%", "<1%", "—"), `axis` the chart's unit, `plan` the line "if you
     *  complete the plan". Null before a result, or when the display is the 4 Oct scale (the design's own "N% ready" then stands). */
    E.chance = function (key) {
      var R = E.cache && E.cache.ready;
      /* Owner 10 Oct 2026 (delegated call, the teen walk; the last round before the deploy, 11 Oct; all three teenagers: '1% tayyor' beside MIT
         on the first Home): before a first result nothing is computed for her, and the design drew its start value, Math.max(1, …), as her
         '1 % ready'. The snapshot then carries the words of that state (chance_start, src/engine/readiness.ts): every place that reads this
         shows a dash and one true line, as it does for a chance that has no number yet. No design line is edited. */
      if (!R) { var S0 = !key && E.cache && E.cache.chance_start; return S0 ? { tag: '—', word: S0.tag, label: S0.label, long: S0.label, num: '—', value: 0, state: 'none', axis: S0.axis, ring: S0.ring, chanceFor: S0.chanceFor, plan: null, list: null, moves: null, scaled: false, said: S0.label } : null; }
      if (R.display !== 'chance' || !R.ui) return null;
      var v = key ? (R.by_uni_view || {})[key] : R.chance;
      if (key && v && !v.moves && R.chance && R.chance.uni === key && R.chance.moves) v = Object.assign({}, v, { moves: R.chance.moves });   /* the goal's own driver is carried once, on `chance` */
      if (key && !v) return null;
      var scaled = !!(v && NUMBERED[v.state]), moves = scaled ? movesWords(v.moves, key || (R.chance && R.chance.uni)) : null;
      return { tag: v ? v.num : '—', word: v ? v.tag : R.ui.tag, label: v ? v.short : R.ui.label, long: v ? v.long : R.ui.label, num: v ? v.num : '—', value: v ? v.value : 0, state: v ? v.state : 'none', axis: R.ui.axis, ring: R.ui.ring,
        chanceFor: R.ui.chanceFor, plan: (v && v.plan) || null, list: (!key && R.list && R.list.text) || null,
        moves: moves,
        scaled: scaled, said: scaled ? R.ui.chanceFor + ': ' + v.long + (moves ? '. ' + moves : '') : v ? v.long : R.ui.label };
    };
    /** Owner 10 Oct 2026 (delegated call, the teen walk, the fourth round; the 17-year-old: "'Шанс для NYU: меньше 1 из 100.' Nothing on
     *  what moves it."). Under a university's number, the one thing that would raise this chance most: the admission model's own first
     *  driver and the lift it computed, which the snapshot carries as { k, n } (src/engine/admission/moves.ts; the words are here because
     *  the snapshot has no room for a sentence). Said after the number in `said` (Home's goal line, the ring's read-out), with no final
     *  full stop: the page's sentence adds it. n is whole points of 100; 0 is said as "less than +1 in 100 by itself". */
    var MOVES_W = {
      en: { sat: 'What would raise it most: an SAT score at this university’s level', english: 'What would raise it most: an English certificate at the level this university recommends',
        activities: 'What would raise it most: a stronger project, olympiad or other work of your own', by: ' (about +{n} in 100)', small: ' (less than +1 in 100 by itself)',
        blocked: 'What stands in the way this year: “{s}”' },
      uz: { sat: 'Imkoniyatni eng koʻp oshiradigan narsa: shu universitet darajasidagi SAT natijasi', english: 'Imkoniyatni eng koʻp oshiradigan narsa: shu universitet tavsiya qilgan darajadagi ingliz tili sertifikati',
        activities: 'Imkoniyatni eng koʻp oshiradigan narsa: kuchliroq shaxsiy loyiha, olimpiada yoki boshqa oʻz ishingiz', by: ' (100 tadan taxminan +{n})', small: ' (oʻzi 100 tadan +1 dan kam)',
        blocked: 'Bu yil yoʻlda turgan asosiy narsa: «{s}»' },
      ru: { sat: 'Сильнее всего шанс поднимет результат SAT на уровне этого университета', english: 'Сильнее всего шанс поднимет сертификат по английскому на уровне, который советует этот университет',
        activities: 'Сильнее всего шанс поднимет более сильный собственный проект, олимпиада или другое ваше дело', by: ' (примерно +{n} из 100)', small: ' (само по себе меньше +1 из 100)',
        blocked: 'В этом году главное препятствие — «{s}»' }
    };
    /* The teen walk's sixth round (11 Oct 2026, delegated call; the 17-year-old with no activities read "Сильнее всего шанс поднимет более
     * сильный собственный проект … (само по себе меньше +1 из 100)" right under the verdict that his English certificate comes too late):
     * a lever worth less than +1 in 100 is not said; and while the hard truth stands for this university (the snapshot's truth), the
     * step it names is said instead, as what blocks this year (its title from the roadmap the page shows). */
    function movesWords(m, uni) {
      var I = window.JG_I18N, l = (E.cache && E.cache.lang) || (I && I.lang && I.lang()) || 'en', W = MOVES_W[l] || MOVES_W.en;   /* the snapshot's own language first: the number's words beside it are the server's, in that language */
      var T = E.cache && E.cache.truth, RM = E.cache && E.cache.roadmap, st = T && uni && T.uni === uni && RM && RM.milestones ? RM.milestones.filter(function (x) { return x.id === T.step_id; })[0] : null;
      if (st && st.title_i18n) return W.blocked.replace('{s}', st.title_i18n);
      if (!m || !W[m.k] || m.k === 'by' || m.k === 'small' || m.k === 'blocked' || !(m.n >= 1)) return null;
      return W[m.k] + W.by.replace('{n}', String(m.n));
    }
    /** The P5 fix (owner 7 Oct; the wave-2 walk: an S1 student read "Шанс для : …" over a "% шанс" axis and a curve rising to 55 %): `scaled`, the
     *  goal's chance is a number (a chance, "fewer than 1 in 100", "very high"); `said`, the goal line's sentence ("Chance for MIT: about 9 in 100
     *  (between 2 and 21)", or, with no number, the reason alone: "A chance is shown closer to applying", the checklist, the gate). unscaled():
     *  his chance display is on and his goal has no number, so the map draws no % scale and no forecast (M:003, D:001). mapTop(): the map's
     *  y-axis top: the readiness cap, raised to the next ten above an Uzbek stop whose number passes it (each stop stands at its own chance);
     *  100 before a result, as the design. */
    var NUMBERED = { chance: 1, lt1: 1, very_high: 1 };
    E.unscaled = function () { var C = E.chance(); return !!C && !C.scaled; };
    E.mapTop = function () {
      var R = E.cache && E.cache.ready, t = R && R.cap ? R.cap : 100, C = E.chance(), U = E.cache && E.cache.unis_uz, top = t;
      if (!C || !C.scaled) return t;
      ((U && U.mid) || []).forEach(function (u) { if (typeof u.pct === 'number' && u.pct > top) top = u.pct; });
      return top > t ? Math.ceil(top / 10) * 10 : t;
    };
    /** A server session still running that this page has not ended: the Study Room resumes it (spec §3.3). */
    E.session = function () {
      if (!current || ended[current.id] || current.status !== 'running' || Date.parse(current.ends_at) + 600000 <= Date.now()) return null;
      return Object.assign({}, current);
    };

    /* Writes (spec §4.1 seam 4, §6). The design's sentences for a write that did not go through (src/engine/copy.ts). */
    var COMMIT_FAILED = "<b>Couldn't save that.</b> Check your connection and try again.";             // COPY.commitFailed
    var SPEND_REFUSED = "<b>Not enough coins for that.</b> Your balance is up to date again.";            // COPY.spendRefused
    var FREEZE_CAP = "<b>You already have 2 streak freezes.</b> Your coins are back.";                    // COPY.freezeCap
    var SESSION_NOT_COUNTED = "<b>That session didn't count.</b> We couldn't confirm it ran its full time, so no brick was laid. Check your connection and your device's clock.";   // COPY.sessionNotCounted
    function toast(text) { try { if (window.JIA_notify) window.JIA_notify({ text: text }); } catch (e) {} }
    var seqN = 0;
    function newId(p) { return p + '_' + Date.now().toString(36) + '_' + (++seqN).toString(36) + Math.random().toString(36).slice(2, 6); }
    /** One JSON request to the engine routes, naming this page's account (x-jg-uid, P0 I2). */
    function api(method, url, body) {
      var init = { method: method, headers: { 'x-jg-uid': BOOT.uid } };
      if (body !== undefined) { init.headers['content-type'] = 'application/json'; init.body = JSON.stringify(body); }
      return fetch(url, init).then(function (r) {
        return r.json().then(function (j) { return { status: r.status, body: j }; }, function () { return { status: r.status, body: null }; });
      }, function () { return { status: 0, body: null }; }).then(function (res) {
        if (res.status === 401 && !signedOut) { signedOut = true; location.href = '/signin?next=' + encodeURIComponent(location.pathname); }
        else if (res.status === 409 && res.body && res.body.error === 'wrong account') takenOver();
        return res;
      });
    }
    /** A newer snapshot replaces the cache (answers can cross; an older one is ignored). `seen` marks a refresh, which also
     *  brings other devices' completions, a session running elsewhere and the league's numbers (S22). */
    function take(s, seen) {
      if (!s || s.v !== 1 || s.computed_at < E.cache.computed_at) return;
      E.cache = s; E.v++;
      /* the teen walk, 10 Oct 2026: a commit's and a task's answer say what is done too (a skipped chunk, a check's task), not a refresh alone;
       * after the page's own continuation (a 0 ms timer, as announce()): a chunk's last answer still runs the design's markDone, its fill and its coins */
      if (!seen) setTimeout(function () { if (E.cache === s) doneSeen = s.done || {}; }, 0);
      if (seen) {
        doneSeen = s.done || {};
        if (!current || ended[current.id]) current = (s.study && s.study.running) || null;
        var L = window.JIA_league;
        if (L && L.ME) { L.ME.streak = s.streak.current; L.ME.xp = s.league.xp; L.ME.week = s.league.week_xp; try { L.paint(); } catch (e) {} }
      }
      settle(s.wallet && s.wallet.coins, !dayFull()); aiPending(!seen);
      newDay();
      announce();
      paintDay();
    }
    /* The teen walk, 10 Oct 2026 (all three: "Home lies until I reload"): a task the server completed without the page's own markDone (a chunk
     * skipped or answered, the reading check, a check set, the parent's answer) left the Dome's percentage, its tiles and the Today rows as
     * they were until a reload. Every newer snapshot now tells the Dome, through the design's own JIA_today (M:004:532): how many tasks today
     * has, each tile's own done flag, the share done (the Dome animates up to it and opens at 100 %, quietly: its coins are the server's), and
     * "today:progress" for the Today rows (M:006:55). Told again 2.4 s later, since the Dome ignores a level while it moves (its own 1.5 s
     * fill after a quiz or a tick). Only a Dome the design has given today's tasks to (its first tile is .jt-on, M:023:857), on the day the
     * page was drawn for. No design line changes. */
    /* The four endings on Home (src/engine/endings.ts dayCount, mirrored here; the second walk of the 15- and the 17-year-old, 10 Oct 2026).
     * dayTiles(): the day's own tiles, as the design draws them (an optional item after the day's own tasks is no tile, M:023:860).
     * dayNumbers(): of those, what is really DONE, TRIED, SKIPPED and still open; `of` is what the day started with (the third walk, 10 Oct
     * 2026: a skipped task no longer leaves the count, "one skip and the day opened"); `bonus` the day's +40 is earned ONLY AT 100 %, every
     * task really done; `percent` is done ÷ started, so it always adds up (25, 50, 75, 100 for four). A REST DAY is a rest day: its optional
     * tasks tick their own tiles and pay their 5, and the building stays as it is (percent 0: no chains to break, no bonus, no letter).
     * A tile's flag is true only for a task really done. */
    function dayTiles() {
      var l = E.tasks(E.cache.local_date), n = -1, i;
      for (i = 0; i < l.length; i++) if (l[i].optional) { n = i; break; }
      if (n > 0) { for (i = n; i < l.length; i++) if (!l[i].optional) return l; return l.slice(0, n); }
      return l;
    }
    function dayNumbers() {
      var l = dayTiles(), rest = l.length > 0 && l.every(function (t) { return t.optional; });
      var c = { done: 0, tried: 0, again: 0, skipped: 0, open: 0, started: 0, of: 0, flags: [], ends: [], list: l, rest: rest };
      l.forEach(function (t) {
        var e = endOf(t); c.ends.push(e); c.flags.push(e === 'done');
        if (!rest && t.optional) return;
        c.started++;
        if (e === 'done') c.done++; else if (e === 'tried') { c.tried++; if (canAgain(t)) c.again++; } else if (e === 'skipped') c.skipped++; else c.open++;
      });
      c.of = c.started;
      c.bonus = !rest && c.started > 0 && c.done === c.started;
      c.percent = rest || !c.started ? 0 : c.done * 100 / c.started;
      return c;
    }
    E.dayNumbers = dayNumbers;
    function dayFlags() { return dayNumbers().flags; }
    function dayFull() { var c = dayNumbers(); return c.list.length > 0 && c.bonus; }
    /* The design drives the Dome itself too (M:023:860 paintToday; M:023:875 after a task): its own numbers count every id in its "done"
     * list and step one tile a completion. A live student's Dome takes the endings' numbers whoever calls it: the flags and the level are
     * dayNumbers(), and "one more tile" (complete) runs only when a task was really done since the Dome was last told. No design line
     * changes; the demo family and /preview keep the design's own calls. */
    var toldDone = -1;
    function wrapDome(T) {
      if (!T || T._jgEnds || BOOT.demo || !T.done || !T.startAt) return T;
      T._jgEnds = true;
      var done0 = T.done, start0 = T.startAt, complete0 = T.complete;
      /* the Dome's "now" (its gold ring) is the first tile whose flag is false: a tried and a skipped tile have ended too, so their flag is
       * true and "now" lands on the first task still open; their look is their own class's (markTiles; the style outranks the tick's) */
      T.done = function (f) { if (!f || E.cache.local_date !== dayAtLoad) return done0.call(T, f); var c = dayNumbers(); toldDone = c.done; done0.call(T, c.ends.map(function (e) { return !!e; })); markTiles(c); };
      T.startAt = function (pct, force) { if (E.cache.local_date !== dayAtLoad) return start0.call(T, pct, force); return start0.call(T, dayNumbers().percent, force); };
      /* a rest day's optional task ticks its tile and never steps the building (two ticks reached 100 %, broke the chains and wrote the letter) */
      if (complete0) T.complete = function () { var c = dayNumbers(); if (c.rest || (toldDone >= 0 && c.done <= toldDone)) { toldDone = c.done; paintDay(); return; } toldDone = c.done; return complete0.apply(T, arguments); };
      return T;
    }
    if (!BOOT.demo && Object.defineProperty) try {
      var domeApi = wrapDome(window.JIA_today);
      Object.defineProperty(window, 'JIA_today', { configurable: true, get: function () { return domeApi; }, set: function (v) { domeApi = wrapDome(v); } });
    } catch (e) {}
    /* A tile says how its task ended: the design's tick for a task done; "tried" and "skipped" get their own mark, colour and word (the
     * style is the server's, src/server/pages.ts "jg-ends"), and the tile's label says the same. */
    function markTiles(c) {
      var T = window.JIA_today, W = endWords();
      if (!T || !T.tile) return;
      c.list.forEach(function (k, i) {
        var t = T.tile(i), e = c.ends[i], cls = e === 'tried' ? 'jg-tried' : e === 'skipped' ? 'jg-skip' : '';
        if (!t || !t.classList) return;
        if (t.classList.contains('jg-tried') !== (cls === 'jg-tried')) t.classList.toggle('jg-tried', cls === 'jg-tried');
        if (t.classList.contains('jg-skip') !== (cls === 'jg-skip')) t.classList.toggle('jg-skip', cls === 'jg-skip');
        var w = t.querySelector && t.querySelector('.jg-end');
        if (!cls) {   // a tried tile won back is a done tile: its mark goes, and what a screen reader hears is the design's ", done" again
          if (w) w.remove();
          var sr0 = t.querySelector && t.querySelector('.sr-only');
          if (sr0 && (sr0.textContent === ', ' + W.tried || sr0.textContent === ', ' + W.skip)) sr0.textContent = e === 'done' ? ', done' : ', not started';
          return;
        }
        var word = e === 'tried' ? W.tried : W.skip;
        if (!w) { w = document.createElement('em'); w.className = 'jg-end'; w.setAttribute('data-no-i18n', ''); t.appendChild(w); }
        if (w.textContent !== word) w.textContent = word;
        var sr = t.querySelector('.sr-only'), said = ', ' + word; if (sr && sr.textContent !== said) sr.textContent = said;
        var label = k.title_i18n + '. ' + (e === 'tried' ? W.triedLabel.replace('{n}', paidOf(k)) + (canAgain(k) ? ' ' + W.againLabel : '') : canAnswer(k) ? W.skipAskLabel : W.skipLabel);
        if (t.getAttribute('aria-label') !== label) t.setAttribute('aria-label', label);
      });
    }
    var dayT = [0, 0];
    function paintDayNow() {
      var T = window.JIA_today, c = dayNumbers(), f = c.flags, el = T && T.tile && T.tile(0), n = 0;
      if (!T || !T.startAt || !T.done || !f.length || E.cache.local_date !== dayAtLoad) return;
      /* The day's reward as the server pays it (the teen walk: "after the chains broke I had 110, next day 70"): a rest day pays no +40 (Q10:
       * a day whose tasks are all optional), and the page was drawn before today's tasks existed, so it showed and flew a +40 nobody kept. */
      if (T.rest) try { var wd = ((E.cache.week || {}).days || []).filter(function (x) { return x.date === E.cache.local_date; })[0]; if (wd) T.rest(!!wd.rest); } catch (e) {}
      if (!el || !el.classList || !el.classList.contains('jt-on')) return;
      var pct = c.percent;   // the share really done; 100 only when the day's bonus is earned (dayNumbers)
      try {
        if (T.count) T.count(f.length);
        T.done(f); T.startAt(pct);
        /* The gates of 10 Oct 2026: a tile's label says what the tile shows. The design writes the label once, from what it knew when it drew
         * the day (M:023:858); a tile told "done" here kept a label that did not say so (a screen reader's student heard a task still to do
         * under a ticked tile). The label is the design's own sentence, built from the same task, so the dictionaries translate it as before. */
        var l = c.list, I = window.JG_I18N;
        f.forEach(function (x, i) {
          var t = T.tile(i), k = l[i];
          if (!t || !k || !t.getAttribute || !t.setAttribute || !t.classList || !t.classList.contains('jt-on')) return;
          if (c.ends[i] === 'tried' || c.ends[i] === 'skipped') return;   // its own label, said by markTiles (never ", done")
          var want = k.title_i18n + ', ' + k.est_minutes + ' minutes, ' + k.coins + ' coins' + (x ? ', done' : ''), now = t.getAttribute('aria-label');
          if (now !== want && now !== (I && I.text ? I.text(want) : want)) t.setAttribute('aria-label', want);
        });
        if (typeof CustomEvent === 'function') document.dispatchEvent(new CustomEvent('today:progress', { detail: { level: pct, count: f.length } }));
        paintWords(c);
      } catch (e) {}
    }
    function paintDay() { clearTimeout(dayT[0]); clearTimeout(dayT[1]); dayT[0] = setTimeout(paintDayNow, 0); dayT[1] = setTimeout(paintDayNow, 2400); }
    /* Home's words at load too (a rest day reads "Rest day" from its first paint, a day with a tried task says what is left): after the
     * design's own draw of the day, and once more after the building's opening animation has written its percent. */
    if (!BOOT.demo && document.addEventListener) document.addEventListener('DOMContentLoaded', function () {
      [0, 700, 2600].forEach(function (ms) { setTimeout(function () { try { if (E.cache.local_date === dayAtLoad) paintWords(dayNumbers()); } catch (e) {} }, ms); });
    });
    /* The endings' words (new copy in en / uz / ru, in code, kept from the dictionary: every element they are written to is data-no-i18n
     * or already in the student's language). Short: a tile is about 75 px wide on a phone. */
    var END_W = {
      en: { tried: 'Tried', skip: 'Skipped', triedLabel: 'Tried. Coins come only for right answers.', skipLabel: 'Skipped. It comes back another day.', skipAskLabel: 'Skipped. You can still answer today.', skipAskLine: '{t} was skipped. You can still answer today.',
        triedLine: 'You tried {t}. A try counts.', skipLine: '{t} was skipped. It comes back another day.', dayLine: 'That is all for today: {a} of {b} done.',
        triedSheet: 'You tried this one today. Coins come only for right answers.', skipSheet: 'You skipped this one. It comes back another day.',
        againLabel: 'You can try it again today.', done: '{a} of {b} done', again: '{n} to try again', triedN: '{n} tried', todo: '{n} to do', skipped: '{n} skipped',
        noTasks: 'No tasks for today yet. They will appear here.', firstTasks: 'A few quick questions, then your first tasks.',
        rest: 'Rest day', restStake: 'Rest day. Nothing is due today.', restLine: 'Today is a rest day. Nothing is due.', restDone: 'Rest day, and you still did {a}. Nice.', restDay: 'Day', opt: 'Optional' },
      uz: { tried: 'Urinildi', skip: 'Oʻtkazildi', triedLabel: 'Urinib koʻrildi. Tangalar faqat toʻgʻri javoblar uchun.', skipLabel: 'Oʻtkazib yuborildi. Boshqa kuni qaytadi.', skipAskLabel: 'Oʻtkazib yuborildi. Bugun hali javob bersangiz boʻladi.', skipAskLine: '{t} oʻtkazib yuborildi. Bugun hali javob bersangiz boʻladi.',
        triedLine: '{t}: urinib koʻrdingiz. Urinish ham hisob.', skipLine: '{t} oʻtkazib yuborildi. U boshqa kuni qaytadi.', dayLine: 'Bugunga shu: {b} tadan {a} tasi bajarildi.',
        triedSheet: 'Bugun buni urinib koʻrdingiz. Tangalar faqat toʻgʻri javoblar uchun beriladi.', skipSheet: 'Buni oʻtkazib yubordingiz. U boshqa kuni qaytadi.',
        againLabel: 'Bugun yana urinib koʻrish mumkin.', done: '{b} tadan {a} tasi bajarildi', again: 'qayta urinish: {n}', triedN: 'urinildi: {n}', todo: 'qoldi: {n}', skipped: 'oʻtkazildi: {n}',
        noTasks: 'Bugun uchun hali vazifa yoʻq. Ular shu yerda chiqadi.', firstTasks: 'Bir nechta qisqa savol, keyin birinchi vazifalaringiz.',
        rest: 'Dam olish kuni', restStake: 'Dam olish kuni. Bugun majburiy vazifa yoʻq.', restLine: 'Bugun dam olish kuni. Majburiy vazifa yoʻq.', restDone: 'Dam olish kuni, lekin baribir {a} ta vazifa bajardingiz. Zoʻr!', restDay: 'Kun', opt: 'Ixtiyoriy' },
      ru: { tried: 'Попытка', skip: 'Пропуск', triedLabel: 'Попытка. Монеты только за верные ответы.', skipLabel: 'Пропущено. Вернётся в другой день.', skipAskLabel: 'Пропущено. Сегодня ещё можно ответить.', skipAskLine: '{t}: пропущено. Сегодня ещё можно ответить.',
        triedLine: '{t}: вы попробовали. Попытка тоже считается.', skipLine: '{t}: пропущено. Вернётся в другой день.', dayLine: 'На сегодня всё: сделано {a} из {b}.',
        triedSheet: 'Сегодня вы это попробовали. Монеты даются только за верные ответы.', skipSheet: 'Вы это пропустили. Оно вернётся в другой день.',
        againLabel: 'Сегодня можно попробовать ещё раз.', done: 'Сделано {a} из {b}', again: 'ещё попытка: {n}', triedN: 'попытка была: {n}', todo: 'осталось: {n}', skipped: 'пропущено: {n}',
        noTasks: 'На сегодня заданий пока нет. Они появятся здесь.', firstTasks: 'Несколько коротких вопросов, потом ваши первые задания.',
        rest: 'День отдыха', restStake: 'День отдыха. Сегодня обязательных заданий нет.', restLine: 'Сегодня день отдыха. Обязательных заданий нет.', restDone: 'День отдыха, а вы всё равно сделали заданий: {a}. Отлично!', restDay: 'День', opt: 'По желанию' }
    };
    function endWords() { var I = window.JG_I18N, l = (I && I.lang && I.lang()) || (E.cache && E.cache.lang) || 'en'; return END_W[l] || END_W.en; }
    /** The Today row's words for the two new states (M:006:21, D:003:27), in the student's language; none for the demo family. */
    E.endWords = function () { var W = endWords(); return BOOT.demo ? {} : { tried: W.tried, skip: W.skip, opt: W.opt }; };
    /** The coach's line at a tried or a skipped row (M:006:302, D:003:319); `name` is the row's own, already escaped. */
    E.endLine = function (st, name) {
      var W = endWords(), sk = E.tasks(E.cache.local_date).filter(function (t) { return endOf(t) === 'skipped'; }), ask = sk.length > 0 && sk.every(canAnswer);   // today's skipped rows are all sets she can still answer
      return (st === 'tried' ? W.triedLine : ask ? W.skipAskLine : W.skipLine).replace('{t}', function () { return name; });
    };
    /** The coach's last line when nothing waits (M:006:312, D:003:329): null while the day's bonus is earned (the design's "Everything is done
     *  today. Amazing work!" then stands), else how many were really done: no "Amazing work!" for a day of tries and skips. */
    E.dayLine = function () {
      var c = dayNumbers(), W = endWords(); if (BOOT.demo) return null;
      /* P8d (the teen re-check of 14 Oct: a new account's Today showed the design's sample tasks, SAT/AP/CAC/IELTS "Kutilmoqda"): a day with
       * no task of hers has no sample rows (M:006:20, D:003:26) and no "Amazing work!": the coach says where her tasks come from */
      if (!c.list.length) return E.noTasks();
      if (dayFull()) return null;
      if (c.rest) return c.done > 0 ? W.restDone.replace('{a}', c.done) : W.restLine;
      return leftWords(c);
    };
    /** P8d: the line for a Today with no task of hers: before her first run's result "a few quick questions, then your first tasks", else
     *  "no tasks for today yet"; the coach says it and the empty list shows it (M:006:20, D:003:26). */
    E.noTasks = function () { var W = endWords(), P = window.JG_PHASED; return P && typeof P.firstRun === 'function' && P.firstRun() ? W.firstTasks : W.noTasks; };
    /** What is left before the day opens, in plain words: "3 of 4 done · 1 to try again" (Home's line under the building, Today's last line). */
    function leftWords(c) {
      var W = endWords(), l = [W.done.replace('{a}', c.done).replace('{b}', c.started)];
      /* "to try again" only for what can be tried again today (canAgain: a quiz); a tried check set cannot (one attempt), so it is said as
       * tried (the teen walk 6, 11 Oct 2026: Home said "qayta urinish: 1" beside a check card "Bugun buni urinib koʻrdingiz · 🪙 +0") */
      if (c.again) l.push(W.again.replace('{n}', c.again));
      if (c.tried > c.again) l.push(W.triedN.replace('{n}', c.tried - c.again));
      if (c.open) l.push(W.todo.replace('{n}', c.open));
      if (c.skipped) l.push(W.skipped.replace('{n}', c.skipped));
      return l.join(' · ');
    }
    E.leftWords = function () { return leftWords(dayNumbers()); };
    /* Home says it in words (the third walk: the percent "never 75", "Bugun ochildi" above a tile that reads "Urinildi"; a rest day told only
     * by a moon on the week strip). The line under the building (#wd-stake-txt, the design's "Break the chains at 100%") reads what is left
     * once a task has ended and the day is not open; on a rest day it and the line under the name (#wd-sub) say "Rest day". Both are the
     * design's own elements, written after its own draw; the design writes them again only when the day opens or the percent moves. */
    function paintWords(c) {
      if (BOOT.demo) return;
      var stake = document.getElementById('wd-stake-txt'), sub = document.getElementById('wd-sub'), W = endWords();
      var set = function (el, t) { if (!el || el.textContent === t) return; el.setAttribute('data-no-i18n', ''); el.textContent = t; };
      /* The fourth walk, a rest day looks like rest (the 13-year-old: "the building is chained and locked ... next to '3/390 · Oʻqish kuni'.
       * I did both extra tiles and it stayed locked. It looks like a day I lost"): the card gets the class the server's style reads (no
       * chains, no lock, a moon by the line: src/server/pages.ts "jg-ends"), the counter's label says "Day", not "Study day", and once an
       * optional task is done the line under the building is the warm one ("Rest day, and you still did 2"). Nothing opens and nothing is
       * paid for the day (the owner's Q10). */
      var card = document.getElementById('world'), lab = card && card.querySelector ? card.querySelector('.wd-day-l') : null;
      if (card && card.classList && card.classList.contains('jg-rest') !== !!c.rest) card.classList.toggle('jg-rest', !!c.rest);
      if (c.rest) {
        set(sub, W.rest); set(stake, c.done > 0 ? W.restDone.replace('{a}', c.done) : W.restStake);
        var tn = lab && lab.firstChild;
        if (tn && tn.nodeType === 3 && tn.nodeValue !== W.restDay) { lab.setAttribute('data-no-i18n', ''); tn.nodeValue = W.restDay; }
        return;
      }
      /* The fourth walk, her language at the best moment (all three: "Chains broken today" in English on an Uzbek and a Russian Home until
       * a reload). The "what is left" line above marks the design's element data-no-i18n; the design then wrote its own "Chains broken
       * today" (M:004:455) into an element the dictionary no longer read. Once the day's bonus is earned the element is the design's
       * again: the mark comes off and the design's own sentence for its state stands, which the dictionary translates like any other. */
      if (c.bonus) {
        if (stake && stake.hasAttribute && stake.hasAttribute('data-no-i18n')) {
          stake.removeAttribute('data-no-i18n');
          stake.textContent = card && card.classList && card.classList.contains('open') ? 'Chains broken today' : 'Break the chains at 100%';
        }
        return;
      }
      if (c.done + c.tried + c.skipped > 0) set(stake, leftWords(c));
    }
    /** A task this page ends as TRIED (a quiz the server marked "enough": public/runtime/jg-checks.js): no tick, no step of the building,
     *  the tick's coins on the wallet, and the completion posted like any other (the server writes status `tried`). */
    E.endTask = function (task, ending, proof, answers) {
      if (!task || !task.id || ending !== 'tried') return;
      localEnd[task.id] = 'tried'; moved = true;
      if (window.JIA_coins && window.JIA_coins.add && (task.coins | 0) > 0) try { window.JIA_coins.add(task.coins | 0); } catch (e) {}
      var id = newId('t');
      post({ id: id, kind: 'task', ref: task.id, url: '/api/v1/tasks/' + encodeURIComponent(task.id) + '/complete', body: { proof: proofOf(task, proof, answers), client_id: id } });
      paintDay();
    };
    /* A tap on a task that has ended as tried or skipped opens its own small sheet (the design's sheet would offer the task again, or say
     * "Done today"): the title, one line that says what happened, Close. In the design's own sheet markup, so it looks and closes the same. */
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return '&#' + ch.charCodeAt(0) + ';'; }); }
    function endSheet(task, e) {
      var W = endWords(), old = document.getElementById('jt-sheet'), host = document.getElementById('dg-view'), el = document.createElement('div');
      if (old) old.remove();
      el.className = 'jr-sheet jt-sheet'; el.id = 'jt-sheet';
      el.innerHTML = '<div class="jr-sheet-bg" data-t="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jt-h"><h3 id="jt-h" data-no-i18n>' + esc(task.title_i18n) + '</h3>'
        + '<div class="jt-proof" id="jt-proof"><p class="' + (e === 'tried' ? 'jt-ok jg-tried-line' : 'jt-miss') + '" data-no-i18n>' + esc(e === 'tried' ? W.triedSheet.replace('{n}', paidOf(task)) : W.skipSheet) + '</p><button class="dg-link" type="button" data-t="shut">Close</button></div></div>';
      ((host && host.parentElement) || document.body).appendChild(el);
      try { el.style.zIndex = String(window.JIA_z ? window.JIA_z() : 80); } catch (err) {}
      el.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('[data-t=shut]')) el.remove(); });
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') el.remove(); });
      setTimeout(function () { var b = el.querySelector('button'); if (b && b.focus) try { b.focus({ preventScroll: true }); } catch (err) {} }, 60);
    }
    var lastTile = -1;
    function endedAt(i) { var l = E.tasks(E.cache.local_date), t = l[i], e = t ? endOf(t) : null; return e === 'tried' || e === 'skipped' ? { task: t, e: e } : null; }
    if (!BOOT.demo && document.addEventListener) {
      var onTile = function (ev) {
        var li = ev.target && ev.target.closest && ev.target.closest('#wd-tasks [data-jt]');
        if (!li || (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ')) return;
        lastTile = +li.dataset.jt;
        var x = endedAt(lastTile);
        if (x && (canAgain(x.task) || canAnswer(x.task))) { openAgain(x.task); return; }   // the design's own sheet opens: its quiz again, a step easier; a set of questions skipped today, to answer after all
        if (x) { ev.stopPropagation(); ev.preventDefault(); endSheet(x.task, x.e); }
      };
      document.addEventListener('click', onTile, true); document.addEventListener('keydown', onTile, true);
      document.addEventListener('DOMContentLoaded', function () {
        var A = window.JG_API, open0 = A && A.openTask;
        /* (12 Oct 2026: a sheet opened by openTask, the desktop's Today rows, gets its kind's words too: didSoon runs on a tap or a key, and
           this call is neither) */
        if (open0 && !A._jgEnds) { A._jgEnds = true; A.openTask = function (i) { lastTile = i; var x = endedAt(i); if (x && (canAgain(x.task) || canAnswer(x.task))) openAgain(x.task); else if (x) return endSheet(x.task, x.e); var r = open0.apply(A, arguments); if (didSoon) didSoon(); return r; }; }
      });
      /* A self-report is a TICK (the third walk, 10 Oct 2026: "'Bajardim' now wants writing, and it stops the honest boy more than the lazy
       * one"): round 3's gate on the box and its placeholder are gone; the design's sheet stands as drawn ("Optional: a line about what you
       * did", one tap), and the server takes the tap (src/server/engine/tasks.ts checkProof).
       * A TICK FOR ONE LINE, NOT FOR AN EMPTY BOX (owner 10 Oct 2026, delegated call, the teenagers' sixth walk, 11 Oct; the 13-year-old:
       * "Bajardim" with nothing written paid +5 and "Zoʻr!"; the 17-year-old: an empty «Сделано» paid +5 twice and made a gold day). Any
       * line counts, "ok" too (the third walk's honest boy types three words); an empty box pays nothing: the tap stays on the sheet, which
       * says why in one line, and the box asks for the line ("Optional" would not be true). The server refuses an empty one as well. */
      var DID_W = { en: { ph: 'One line: what did you do?', why: 'Write one line about what you did. Then it counts.' },
        uz: { ph: 'Bir qator: nima qildingiz?', why: 'Nima qilganingiz haqida bir qator yozing. Shunda hisobga olinadi.' },
        ru: { ph: 'Одна строка: что вы сделали?', why: 'Напишите одну строку о том, что вы сделали. Тогда засчитается.' } };
      var didWords = function () { var I = window.JG_I18N, l = (I && I.lang && I.lang()) || (E.cache && E.cache.lang) || 'en'; return DID_W[l] || DID_W.en; };
      var didBox = function (b) { var c = b && b.closest && b.closest('.jt-proof, #jt-proof, .jr-card'); return c && c.querySelector ? c.querySelector('textarea.dg-text') : null; };
      /* ONE RULE PER KIND, SAID ONCE, BEFORE THE TAP (the controller's decision of 12 Oct 2026, on the seventh walk's re-check; the 17-year-old:
       * the TUIT card said «Прочитайте и нажмите «Сделано»», then the empty tap got «Напишите одну строку о том, что вы сделали»).
       * - A READ task: a requirement's card with no question (the snapshot task's `page`, a self-report). It is done by reading it: the box is
       *   not asked for, and "Done" opens once the sheet has been open for its reading time (its lines at 8 words a second, 3 to 20 s; the
       *   seconds left stand on the button). Its own line says so (src/engine/schedule/facts.ts fact.card); the server takes the bare tap.
       * - A DO task: something done away from the app. Its line, "Write one line about what you did. Then it counts.", stands under the box
       *   from the start; an empty tap only marks that same line (no second rule). The server refuses an empty one (422 self_report_empty). */
      var readCard = function (sheet) {
        var h = sheet && sheet.querySelector && sheet.querySelector('#jt-h'), flat = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/^ | $/g, ''); };
        var want = h ? flat(h.textContent) : '', days = E.cache && E.cache.tasks, hit = null;
        if (!want || !days) return null;
        Object.keys(days).forEach(function (d) { (days[d] || []).forEach(function (t) { if (!hit && t && t.verification === 'self_report' && typeof t.page === 'string' && t.page && flat(t.title_i18n) === want) hit = t; }); });
        return hit;
      };
      var READ_WORD_MS = 125, READ_MIN_MS = 3000, READ_MAX_MS = 20000;
      var readHold = function (sheet, ta, b) {
        ta._jgRead = true; ta.style.display = 'none';
        if (!b) return;
        var why = sheet.querySelector('.jr-why'), words = why ? String(why.textContent || '').split(/\s+/).filter(function (w) { return /[0-9A-Za-zÀ-ɏЀ-ӿ]/.test(w); }).length : 0;
        var left = Math.ceil(Math.max(READ_MIN_MS, Math.min(READ_MAX_MS, words * READ_WORD_MS)) / 1000);
        if (!document.getElementById('jg-read-css')) { var st = document.createElement('style'); st.id = 'jg-read-css'; st.textContent = '#jt-sheet [data-t=did][data-left]::after{content:" \\00B7  " attr(data-left)}'; (document.head || document.body).appendChild(st); }
        b.disabled = true;
        (function tick() {
          if (!b.isConnected) return;
          if (left <= 0) { b.disabled = false; b.removeAttribute('data-left'); return; }
          b.setAttribute('data-left', String(left)); left--; setTimeout(tick, 1000);
        })();
      };
      document.addEventListener('click', function (ev) {
        var b = ev.target && ev.target.closest && ev.target.closest('#jt-sheet [data-t=did]'), ta = b ? didBox(b) : null;
        if (!b || !ta || ta._jgRead || ta.value.trim()) return;
        ev.stopImmediatePropagation(); ev.preventDefault();
        var p = b.parentNode && b.parentNode.querySelector('.jg-did-why');
        if (!p && b.insertAdjacentHTML) { b.insertAdjacentHTML('beforebegin', '<p class="jt-adv jg-did-why" data-no-i18n></p>'); p = b.parentNode.querySelector('.jg-did-why'); }
        if (p) { p.textContent = didWords().why; p.className = 'jt-miss jg-did-why'; p.setAttribute('role', 'status'); }
        try { ta.focus({ preventScroll: true }); } catch (err) {}
      }, true);
      /* the box's words, and the kind's one line: set once the sheet is drawn (a tap or a key on a row opens it; the design draws it in that same event) */
      var didPh = function () {
        var sheet = document.getElementById('jt-sheet'), ta = sheet && sheet.querySelector('textarea.dg-text');
        if (!ta || ta._jgDid) return;
        ta._jgDid = true;
        var b = sheet.querySelector('[data-t=did]');
        if (readCard(sheet)) return readHold(sheet, ta, b);
        ta.setAttribute('data-no-i18n', ''); ta.setAttribute('placeholder', didWords().ph);
        if (b && b.insertAdjacentHTML && !sheet.querySelector('.jg-did-why')) b.insertAdjacentHTML('beforebegin', '<p class="jt-adv jg-did-why" data-no-i18n></p>');
        var p = sheet.querySelector('.jg-did-why'); if (p) p.textContent = didWords().why;
      };
      var didSoon = function () { setTimeout(didPh, 0); setTimeout(didPh, 120); };
      document.addEventListener('click', didSoon, true); document.addEventListener('keydown', didSoon, true);
    }
    /* Owner 4 Oct R13 (P4e G5): the design paints some of what the snapshot holds only at load (the Study Room card's dream and bricks, Home's
     * average); "jg:snapshot" on the document tells it a newer one has arrived, once the commit or refresh has answered the page (a 0 ms
     * timer, so the page's own continuation runs first). A page without the event API simply hears nothing. */
    function announce() { setTimeout(function () { try { document.dispatchEvent(new Event('jg:snapshot')); } catch (e) {} }, 0); }
    /* A new local day with the page open (final review runtime I1, P1-B Task 14): the design paints the day once, at load
     * (the Today rows, the Dome, the totals), so the page reloads on the new day's snapshot. Only in view, once the outbox
     * has drained and no commit waits, never while a Study Room session runs (it settles on the day it began), and after
     * the saved-state queue is flushed (what it could not send stays in jg.dirty for the next load). */
    var dayAtLoad = BOOT.engine.local_date, reloading = false;
    function newDay() {
      if (reloading || stopped || signedOut || !E.cache || E.cache.local_date === dayAtLoad) return;
      if (document.visibilityState !== 'visible' || box.length || sending || commits || E.session()) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      reloading = true;
      flush(false).then(function () { location.reload(); }, function () { location.reload(); });
    }
    /* The wallet (S19): the page moves it at once (its own add, spend and +40 animations); the server's balance replaces
     * it 4 s after the last movement, once nothing is waiting to be sent, so an animation is never counted twice. */
    var bal = null, balT = 0, moved = false;   // moved: this page has moved the wallet itself (an add, a spend), so an animation of its own may be running
    function settle(n, soon) {
      if (typeof n === 'number') bal = n;
      if (bal === null) return;
      clearTimeout(balT);
      balT = setTimeout(function () {
        if (box.length || sending || commits) return settle();
        if (window.JIA_coins && window.JIA_coins.set && window.JIA_coins.get() !== bal) window.JIA_coins.set(bal);
      }, soon ? (moved ? 600 : 0) : 4000);   // the teen walk, 10 Oct 2026: a snapshot's balance shows within a second while today is not complete (the Dome's +40 flies only at 100 %); a complete day keeps the 4 s. The gates, 10 Oct: at once on a page that has not moved the wallet itself (nothing of its own is on screen to count twice)
    }
    function touch() { moved = true; if (bal !== null) settle(); }

    /* The outbox: writes that do not change the plan keep the design's instant local effect and are posted from here, in
     * order and one at a time, one client_id each (the server's idempotency key), kept per account in jg.outbox until the
     * server has answered, and retried with backoff when the network or the server fails. A refusal is final. */
    var BOX = 'jg.outbox', handlers = {}, sending = false, boxFails = 0, boxT = 0, wantRefresh = false;
    var box = (function () { try { var o = JSON.parse((ls && ls.getItem(BOX)) || 'null'); return o && o.uid === BOOT.uid && Array.isArray(o.items) ? o.items : []; } catch (e) { return []; } })();
    /* The gates of 10 Oct 2026: a completion an earlier page left in the outbox (a quiz result on the sheet as the page was left, a tick sent
     * as the phone lost its network) is done on this page from its first paint, as it was on the page that sent it: this page is drawn from
     * a snapshot the server may have written a moment before it had the completion. The Dome is told once the design has drawn the day; a
     * refusal takes it back (answered() below), the tile and its label with it. */
    var carried = 0;
    box.forEach(function (it) { if (it && it.kind === 'task' && it.ref) { localDone[it.ref] = true; carried++; } });
    if (carried) { if (document.readyState && document.readyState !== 'loading') paintDay(); else document.addEventListener('DOMContentLoaded', paintDay); }
    function saveBox() { if (!ls) return; try { if (box.length) rawSet.call(ls, BOX, JSON.stringify({ uid: BOOT.uid, items: box })); else rawRemove.call(ls, BOX); } catch (e) {} }
    function post(item, cb) { box.push(item); saveBox(); if (cb) handlers[item.id] = cb; pump(); }
    function pump() {
      if (sending || stopped || signedOut) return;
      if (!box.length) { if (wantRefresh && !commits) E.refresh(); else newDay(); return; }
      var it = box[0]; sending = true;
      api('POST', it.url, it.body).then(function (r) {
        sending = false;
        if (r.status === 0 || r.status === 429 || r.status >= 500) { boxFails++; clearTimeout(boxT); boxT = setTimeout(pump, Math.min(60000, 1000 * Math.pow(2, boxFails - 1))); return; }
        if (r.status === 401 || (r.body && r.body.error === 'wrong account')) return;         // api() has left the page; the write stays
        boxFails = 0;
        if (box[0] === it) { box.shift(); saveBox(); }
        answered(it, r);
        pump();
      });
    }
    /** What the server said, per kind (Plan A's HTTP contract). */
    function answered(it, r) {
      var b = r.body || {}, cb = handlers[it.id], ok = r.status >= 200 && r.status < 300;
      delete handlers[it.id];
      if (b.snapshot) take(b.snapshot);
      if (typeof b.balance === 'number') settle(b.balance, !moved && !dayFull());   // the gates, 10 Oct: an answer to what an earlier page sent finds no animation of this page's own to wait for
      if (it.kind === 'start' && b.session && (ok || b.error === 'running')) { current = b.session; if (cb) cb(b.session); return; }
      if (it.kind === 'complete' && ok && b.session && b.session.status !== 'completed') toast(SESSION_NOT_COUNTED);   // the page showed "Brick laid" on its own clock; the server's clock settled it otherwise (a late start, a fast device clock)
      if (ok && it.kind === 'task' && b.pending) { delete localDone[it.ref]; if (typeof b.pending_text === 'string' && b.pending_text) toast(plain(b.pending_text)); }   // P5h (spec §4.6 L7), PHASE_X on only: the task waits for the counselor; the server's sentence says so
      if (ok) { if (cb) cb(b); return; }
      if (it.kind === 'report' || it.kind === 'game') return;                                    // nothing on screen depends on them
      if (it.kind === 'spend' && (b.error === 'insufficient' || b.error === 'freeze_cap')) { toast(b.error === 'freeze_cap' ? FREEZE_CAP : SPEND_REFUSED); return; }
      if (it.kind === 'task') { delete localDone[it.ref]; delete won[it.ref]; wantRefresh = true; }
      toast((it.kind === 'task' && whyOf(b)) || COMMIT_FAILED);                                  // P5h: the server's reason for a refused proof, in the student's language (PHASE_X on only; off, no answer carries one)
    }
    /** P5h (spec §4.6): the first reason of a refused proof, as the server wrote it in code (en/uz/ru): plain text, escaped for the design's notification. */
    function plain(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
    function whyOf(b) {
      var r = b && b.reasons && b.reasons[0] && b.reasons[0].text;
      return typeof r === 'string' && r ? plain(r) : '';
    }
    /* P5h (spec §4.6 L5, §6.1 "Stored proof upload"), with PHASE_X on only (BOOT.phaseX): the design's upload control hands the page the
     * file's name alone (M:023:908, D:022:910 `finish(e.target.files[0].name)`), so the file itself is taken here as the control changes,
     * before the design's own handler runs (capture), and posted when the design then calls completeTask: no design line changes. A photo
     * is sized on the device first (1600 px, JPEG), as the profile photo is (jg-photo.js); the server checks the bytes again. The file is
     * not kept in the outbox (it cannot be): if it does not arrive, the task opens again and the student chooses it once more. */
    var pickedFile = null;
    if (BOOT.phaseX && document.addEventListener) document.addEventListener('change', function (e) {
      var t = e.target;
      if (t && t.type === 'file' && t.files && t.files[0] && t.closest && t.closest('#jt-proof')) pickedFile = t.files[0];
    }, true);
    function shrink(file) {
      return new Promise(function (done) {
        try {
          if (!/^image\//.test(file.type || '')) return done(file);
          var img = new Image(), url = URL.createObjectURL(file);
          img.onload = function () {
            try {
              var k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
              c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
              c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
              c.toBlob(function (blob) { done(blob || file); }, 'image/jpeg', 0.82);
            } catch (err) { done(file); }
          };
          img.onerror = function () { try { URL.revokeObjectURL(url); } catch (err) {} done(file); };
          img.src = url;
        } catch (err) { done(file); }
      });
    }
    function sendFile(task, file, proof, id) {
      var url = '/api/v1/tasks/' + encodeURIComponent(task.id);
      var failed = function (b) { delete localDone[task.id]; wantRefresh = true; toast(whyOf(b) || COMMIT_FAILED); pump(); };
      shrink(file).then(function (blob) {
        return fetch(url + '/proof', { method: 'POST', headers: { 'x-jg-uid': BOOT.uid, 'content-type': blob.type || file.type || 'application/octet-stream' }, body: blob })
          .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }, function () { return { status: r.status, body: null }; }); });
      }).then(function (r) {
        if (r.status !== 200 || !r.body || !r.body.id) return failed(r.body);
        post({ id: id, kind: 'task', ref: task.id, url: url + '/complete', body: { proof: { kind: 'upload', name: String(proof == null ? '' : proof).slice(0, 300), file: r.body.id }, client_id: id } });
      }, function () { failed(null); });
    }

    var SPEND = ['shop', 'style', 'review', 'game_wager'];
    function proofOf(t, proof, answers) {
      var p = String(proof == null ? '' : proof);
      if (t.verification === 'quiz') return { kind: 'quiz', run: String((answers && answers.run) || '').slice(0, 64) };   // owner 7 Oct A4: the attempt the server graded (jg-checks.js)
      if (t.verification === 'link') return { kind: 'link', url: p.slice(0, 2000) };
      if (t.verification === 'upload') return { kind: 'upload', name: p.slice(0, 300) };
      if (t.verification === 'artifact') return { kind: 'artifact', text: p.slice(0, 8000) };     // P5h (spec §4.6 L3): scheduler v2's text tasks, PHASE_X on only; the design's own text box is their control
      if (t.verification === 'checkpoint') return p && p !== 'self report' ? { kind: 'checkpoint', text: p.slice(0, 8000) } : { kind: 'checkpoint' };   // P5h (L7)
      return p && p !== 'self report' ? { kind: 'self_report', text: p.slice(0, 2000) } : { kind: 'self_report' };
    }
    /** markDone (M:023:870, S13): done here at once; the server checks the proof and pays the task's coins once. Deep-module
     *  and parent-check tasks complete through their commits (deep_done, parent_flow_done), so they are not posted. */
    E.completeTask = function (task, proof, answers) {
      if (!task || !task.id) return;
      /* a profile task the server has just ended as skipped (under half answered: its commit's snapshot says so before the design's
       * markDone runs, M:023:932) is not done here either: no tick, no step of the building (the Dome's own "complete" is held back too) */
      if (!won[task.id] && (task.status === 'skipped' || task.status === 'tried' || localEnd[task.id])) { moved = true; paintDay(); return; }
      localDone[task.id] = true; moved = true;   // the design puts the task's coins on screen itself, right after this call (M:023:874)
      if (task.deep || task.verification === 'auto_event') return;
      var id = newId('t');
      if (BOOT.phaseX && task.verification === 'upload' && pickedFile) { var file = pickedFile; pickedFile = null; return sendFile(task, file, proof, id); }   // P5h (spec §4.6 L5): the file first, then the completion that names it
      post({ id: id, kind: 'task', ref: task.id, url: '/api/v1/tasks/' + encodeURIComponent(task.id) + '/complete', body: { proof: proofOf(task, proof, answers), client_id: id } });
    };
    /** The Study Room (M:023:1142-1144, S14): the page's session is the server's (its id is the design's ss_<ms>); the server's
     *  started_at / ends_at come back to onServer, and a session already running on the other device is joined instead. */
    E.startSession = function (s, onServer) {
      current = { id: s.id, subject: s.subject, task_id: s.task_id || null, minutes_planned: s.minutes_planned, started_at: s.started_at, ends_at: s.ends_at, status: 'running' };
      post({ id: 'start:' + s.id, kind: 'start', url: '/api/v1/study/sessions', body: { client_id: String(s.id), subject: String(s.subject || 'Other').slice(0, 40), task_id: s.task_id || null, minutes: s.minutes_planned } }, onServer);
    };
    E.completeSession = function (id, onDone) {
      ended[id] = true;
      post({ id: 'complete:' + id, kind: 'complete', url: '/api/v1/study/sessions/' + encodeURIComponent(id) + '/complete', body: {} }, onDone);
    };
    E.breakSession = function (id, reason) {
      ended[id] = true;
      post({ id: 'break:' + id, kind: 'break', url: '/api/v1/study/sessions/' + encodeURIComponent(id) + '/break', body: { reason: String(reason || 'stopped').slice(0, 40) } });
    };
    /** JIA_coins.spend(n, { reason, ref }) (S19, S26): the page has already checked and moved its balance. */
    E.spend = function (n, meta) {
      touch();
      if (!meta || SPEND.indexOf(meta.reason) === -1 || !(n > 0)) return;
      var id = newId('s');
      post({ id: id, kind: 'spend', url: '/api/v1/coins/spend', body: { amount: Math.round(n), reason: meta.reason, ref: String(meta.ref || meta.reason).slice(0, 64), client_id: id } });
    };
    /** JIA_coins.add(n, meta) (S27): a game's claimed coins are posted and capped by the server (Q13); any other add is the
     *  design's animation of a credit the server makes on its own (diagnostic, task, day). */
    E.coinsAdded = function (n, meta) {
      touch();
      if (!meta || meta.reason !== 'game' || !(n > 0)) return;
      var id = newId('g');
      post({ id: id, kind: 'game', url: '/api/v1/coins/game', body: { game: String(meta.ref || 'game').slice(0, 40), result: { coins: Math.round(n), outcome: meta.outcome }, client_id: id } });
    };
    /** "Report a wrong date" (M:023:811, S10) goes to the review queue too. */
    E.report = function (milestoneId) {
      post({ id: 'report:' + milestoneId, kind: 'report', url: '/api/v1/milestones/' + encodeURIComponent(milestoneId) + '/report', body: {} });
    };
    E.pending = function () { return box.length; };
    /* Commits (spec §4.1 seam 4): where the student changes an engine input, the design awaits one round trip and renders
     * the answer. Resolves { snapshot, changes } | { error, detail } (a refusal) | null (no answer). A stale base_version
     * gets the fresh snapshot and one retry under the same client_id; any failure leaves the screen as it was, with the
     * design's toast, unless the caller handles that refusal itself (opts.quiet). */
    var commits = 0;
    /** "Is this right?" (see E.commit): one small sheet in the design's own tokens, two buttons; resolves true for yes. */
    function askScore(d) {
      return new Promise(function (done) {
        var o = document.createElement('div');
        o.setAttribute('data-t', 'score-ask'); o.setAttribute('data-no-i18n', ''); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
        o.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(10,30,26,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px;font-family:var(--font, Raleway, sans-serif)';
        var c = document.createElement('div');
        c.style.cssText = 'width:100%;max-width:420px;background:#fff;border-radius:20px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.18);color:var(--ink, #12332c)';
        var p = document.createElement('p'); p.textContent = d.ask; p.style.cssText = 'margin:0 0 16px;font-size:16px;line-height:1.45;font-weight:600';
        function btn(text, t, main) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.setAttribute('data-t', t);
          b.style.cssText = 'display:block;width:100%;min-height:48px;margin-top:8px;border-radius:14px;font:inherit;font-weight:700;font-size:15px;cursor:pointer;' +
            (main ? 'border:0;background:var(--jade-500, #1f8a70);color:#fff' : 'border:1.5px solid var(--jade-500, #1f8a70);background:#fff;color:var(--jade-800, #0f5c4a)');
          return b;
        }
        var no = btn(d.no || 'Change it', 'score-no', true), yes = btn(d.yes || 'Yes, it is right', 'score-yes', false);
        function end(v) { try { o.remove(); } catch (e) {} done(v); }
        no.onclick = function () { end(false); }; yes.onclick = function () { end(true); };
        c.appendChild(p); c.appendChild(no); c.appendChild(yes); o.appendChild(c); document.body.appendChild(o);
      });
    }
    E.commit = function (kind, payload, opts) {
      var id = newId('c'), quiet = (opts && opts.quiet) || [];
      commits++;
      function send(again) {
        return api('POST', '/api/v1/engine/commit', { kind: kind, base_version: E.cache.profile_version, payload: payload || {}, client_id: id }).then(function (r) {
          var b = r.body || {};
          if (r.status === 200 && b.snapshot) { take(b.snapshot); return { snapshot: b.snapshot, changes: b.changes || null }; }
          if (r.status === 409 && b.snapshot) { take(b.snapshot, true); if (!again) return send(true); }
          /* Owner 11 Oct 2026 (delegated call, the teen walk 5: "I typed IELTS 9, and nothing asked me to confirm"): a typed score far from
           * what the app measured is asked about once, in the server's words; "yes" sends the same answers again as confirmed, "change it"
           * leaves the questions open with nothing stored and no failure toast. */
          if (b.error === 'confirm_score' && b.detail && b.detail.ask) return askScore(b.detail).then(function (yes) {
            if (!yes) return { error: 'confirm_score' };
            /* the teen walk 7 (12 Oct 2026): her yes confirms the claim this question named, never every claim in the set: the server
             * names the claims confirmed so far (detail.confirm) and asks the next one on its own */
            payload = Object.assign({}, payload || {}, { confirm: Array.isArray(b.detail.confirm) ? b.detail.confirm : true });
            return send(again);
          });
          if (b.error && quiet.indexOf(b.error) !== -1) return { error: b.error, detail: b.detail };
          if (r.status !== 401 && b.error !== 'wrong account') toast(COMMIT_FAILED);
          return b.error ? { error: b.error, detail: b.detail } : null;
        });
      }
      return send(false).then(function (x) { commits--; if (!commits && wantRefresh && !box.length && !sending) E.refresh(); else newDay(); return x; });
    };

    /* Refresh (spec §4.1): on becoming visible after 5 minutes or on another date, at the student's local midnight (checked
     * each minute, once per date), and once the outbox has drained when a refusal asked for it. Never while a write is
     * waiting, whose answer would be newer than the snapshot. */
    var lastRefresh = Date.now(), refreshing = null, triedFor = null;
    E.refresh = function () {
      if (box.length || sending || commits) { wantRefresh = true; return Promise.resolve(); }
      if (refreshing) return refreshing;
      wantRefresh = false;
      refreshing = api('GET', '/api/v1/engine/snapshot').then(function (r) { refreshing = null; lastRefresh = Date.now(); if (r.status === 200 && r.body) take(r.body, true); });
      return refreshing;
    };
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && (Date.now() - lastRefresh > 300000 || E.ymd(new Date()) !== E.cache.local_date)) E.refresh();
      newDay();
    });
    setInterval(function () { var d = E.ymd(new Date()); if (d !== E.cache.local_date && d !== triedFor) { triedFor = d; E.refresh(); } newDay(); }, 60000);
    window.addEventListener('online', pump);
    pump();                                                                                    // what an earlier page left unsent

    /* P4a (spec §4.7, §5.2): the result draft and the AI refresh. Nothing is sent unless the server says the layer is on for
     * this student (cache.ai.on); every slot keeps the design's own text as its fallback. */
    var aiWaits = [4000, 8000, 16000, 32000, 64000], aiN = 0, aiT = null, drafted = null;
    function aiOn() { return !!(E.cache.ai && E.cache.ai.on); }
    /** While AI work is pending, refresh 4, 8, 16, 32 and 64 s after the last snapshot (a commit restarts the count); E.refresh never runs during a write. */
    function aiPending(restart) {
      if (restart) aiN = 0;
      clearTimeout(aiT); aiT = null;
      if (!aiOn() || !(E.cache.ai.pending || []).length) { aiN = 0; return; }
      if (aiN >= aiWaits.length) return;
      aiT = setTimeout(function () { aiT = null; aiN++; E.refresh(); }, aiWaits[aiN]);
    }
    /** Edit E3: on the way into the reading check the page hands its answers over, once per answer set; it never waits. */
    E.prepare = function (A) {
      if (!aiOn() || !A) return;
      var key = JSON.stringify(A); if (key === drafted) return; drafted = key;
      api('POST', '/api/v1/ai/prepare', { answers: A });
    };
    /* Jamol reacts (edits E1, E2; spec §5.5). render() asks for the next opener's line while the student answers a module's last
     * question; the opener's first draw pins its text (the line if it has arrived, else the design's), in memory and in the
     * local-only jg.jamol.v1, so Back, resume, reload and the return from a check redraw the same text; a later line is dropped.
     * Pins are keyed by core module id: a Deep run reuses those ids (M:252 builds F from m.id === S.deep), and a Deep opener
     * keeps the design's line (spec §5.5), so say(id, true) answers null and never reads or writes a pin.
     * Each line is pinned with the answers it was asked with (pins.from): once one of them changes (Back and a new answer, or
     * a redo on another device whose synced answers reach this one), the line no longer describes the student, and listen,
     * which runs before say in every render, retires it to the design's line (P4a final review, runtime I1). */
    var PINS = 'jg.jamol.v1', pins = { uid: BOOT.uid, lines: {}, from: {} }, asked = {}, heard = {}, sent = {}, cur = null;
    try { var savedPins = ls && JSON.parse(ls.getItem(PINS) || 'null'); if (savedPins && savedPins.uid === BOOT.uid && savedPins.lines) pins = savedPins; } catch (e) {}
    try { if (ls && (!savedPins || savedPins.uid !== BOOT.uid) && ls.getItem(PINS) !== null) rawRemove.call(ls, PINS); } catch (e) {}   // another account's pins hold its answers (pins.from): gone at load, not at its next save
    if (!pins.from || typeof pins.from !== 'object') pins.from = {};                                  // a pin saved without its answers is retired
    function savePins() { try { if (ls) rawSet.call(ls, PINS, JSON.stringify(pins)); } catch (e) {} }
    function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
    /** One answer as text, its object keys sorted: the server's jsonb copy of the answers keeps their values, not their key order. */
    function canon(v) {
      if (!v || typeof v !== 'object') return JSON.stringify(v);
      if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
      return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + canon(v[k]); }).join(',') + '}';
    }
    /** Every answer the line was asked with is still the student's (an answer given since is no change). */
    function stands(from, A) {
      if (!from || !A) return false;
      for (var k in from) if (own(from, k) && canon(A[k]) !== canon(from[k])) return false;
      return true;
    }
    function retire(A) {
      var n = 0;
      for (var id in pins.lines) if (own(pins.lines, id) && pins.lines[id] !== null && !stands(pins.from[id], A)) { pins.lines[id] = null; delete pins.from[id]; n++; }
      if (n) savePins();
    }
    E.listen = function (mods, i, A, deep) {
      if (!A || !Object.keys(A).length) { pins = { uid: BOOT.uid, lines: {}, from: {} }; asked = {}; heard = {}; sent = {}; savePins(); }       // a fresh run ("redo")
      else retire(A);
      cur = A;
      var next = mods && mods[i + 1];
      if (deep || !aiOn() || !next || next === mods[i] || next === 'M0' || own(pins.lines, next) || asked[next]) return;
      asked[next] = true;
      var posted = JSON.parse(JSON.stringify(A));
      api('POST', '/api/v1/ai/react', { module: next, answers: A }).then(function (r) { if (r.status === 200 && r.body && typeof r.body.line === 'string' && r.body.line) { heard[next] = r.body.line; sent[next] = posted; } });
    };
    E.say = function (id, deep) {
      if (deep) return null;                                                                          // a Deep opener: the design's MOD_LINES
      if (!aiOn()) return null;                       // the layer's kill switch (ai-switch off) reaches a pinned line too; a per-step switch or an ai-revoke does not (open, CURRENT_STATE)
      if (own(pins.lines, id)) return pins.lines[id];
      pins.lines[id] = heard[id] && stands(sent[id], cur) ? heard[id] : null;                          // a line asked with answers changed since is not drawn
      if (pins.lines[id]) pins.from[id] = sent[id];
      savePins();
      return pins.lines[id];
    };
    aiPending(true);

    window.JG_ENGINE = E;
  })();

  /* 7. The student's invite code (I7). A code seats one parent and lives three days, and the design's Send button reads
   * JG_BOOT.familyCode when it is tapped, so the code minted when the page loaded can be used up or out of date by then. The
   * page asks the server for the current one when it comes back into view (window focus, visibilitychange) and every five
   * minutes while it is in view, at most once a minute; a refusal, a failure or an answer that is not a code leaves the last
   * code as it was. The request names this page's account (x-jg-uid, P0 I2): another account signed in from another tab is
   * answered 409, never handed its code. Not for a parent, a demo student or a page booted without a code. */
  if (BOOT.role === 'student' && BOOT.familyCode && !BOOT.demo) (function () {
    var checked = Date.now(), asking = false;
    function renew() {
      if (asking || stopped || signedOut || Date.now() - checked < 60000) return;
      asking = true; checked = Date.now();
      fetch('/api/v1/family', { credentials: 'same-origin', headers: { 'x-jg-uid': BOOT.uid } })
        .then(function (r) { return r.status === 200 ? r.json() : null; })
        .then(function (b) { if (b && typeof b.code === 'string' && /^[A-Za-z0-9]+$/.test(b.code)) BOOT.familyCode = b.code; })
        .then(function () { asking = false; }, function () { asking = false; });
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') renew(); });
    window.addEventListener('focus', renew);
    setInterval(function () { if (document.visibilityState === 'visible') renew(); }, 300000);

    /* Owner 4 Oct R8 (P4d): the share row of "Send the link to my parent" and of the diagnostic's money question. familyShare(lang)
     * gives the real link (the current code), Telegram's share link (https://t.me/share/url?url=…&text=…; Telegram writes the URL
     * first, then the text) and the row's words in the roadmap language the page passes (English when it has none: the boot's
     * familyShare holds all three, since a student can choose a language mid-diagnostic), and asks for a fresher code (renew's
     * once-a-minute limit holds). sendFamilyLink(how, button, lang) opens Telegram's share in a new tab ('telegram'; called in the
     * tap, so no popup blocker stops it) or copies the link ('copy'), and answers true only once the link has left the page that
     * way: the page marks the parent check sent only then, never on a refused copy. A refused copy selects the link instead. */
    function share(lang) {
      var all = BOOT.familyShare, w = all && (all[lang] || all.en);
      if (!w || !BOOT.familyCode) return null;
      var url = location.origin + '/join/' + BOOT.familyCode;
      return { url: url, tg: 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(w.text), text: w.text, telegram: w.telegram, copy: w.copy, copied: w.copied, valid: w.valid };
    }
    function selectLink(btn) {
      try {
        var c = btn && btn.parentNode && btn.parentNode.querySelector('code'), r, s;
        if (!c) return;
        r = document.createRange(); r.selectNodeContents(c); s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      } catch (e) {}
    }
    window.JG_RUNTIME.familyShare = function (lang) { renew(); return share(lang); };
    window.JG_RUNTIME.sendFamilyLink = function (how, btn, lang) {
      var f = share(lang), nav = window.navigator;
      if (!f) return Promise.resolve(false);
      if (how === 'telegram') { window.open(f.tg, '_blank', 'noopener'); return Promise.resolve(true); }
      var copied = function () { if (btn) btn.textContent = f.copied; return true; }, refused = function () { selectLink(btn); return false; };
      try { return nav && nav.clipboard && nav.clipboard.writeText ? Promise.resolve(nav.clipboard.writeText(f.url)).then(copied, refused) : Promise.resolve(refused()); } catch (e) { return Promise.resolve(refused()); }
    };
  })();

  /* 8. Motion (the owner's 4 Oct 2026 rulings R1 and R7, P4d), for a live student only (as JG_ENGINE).
   * R7, "Reduce motion" is real. Every design script reads matchMedia('(prefers-reduced-motion: reduce)') once, at load, and has
   * its own reduced-motion branch (no coach tour, no count-up, an instant Dome with no wave, no confetti); the switch only set
   * <html class="calm">, which only CSS read. So <html class="calm"> is set here, in <head> before any design script, and while it
   * is set that one query answers true. It comes from the student's own choice, or, when they never chose, from the device: on
   * when the OS asks for reduced motion, the device has 2 GB of memory or less, or Data Saver is on (both Chromium only).
   * The choice is a flip of the switch, saved in jia.settings as calmSet; the design writes its whole settings object on every
   * change, so a calm equal to the device's default and never flipped is left out of the saved copy (a default must not follow
   * the student to another device). A saved calm: true without calmSet is a choice made before the switch had a default (it was
   * false then); a saved false without it is not. A flip reloads the page once the server has it, back into Settings, so the
   * scripts read the new setting (not while a Study Room session runs: its motion then follows from the next open).
   * R1, once a day: JG_MOTION.onceToday(name) is true on the first call of the student's local day (JG_ENGINE.ymd), per account
   * (jg.seen.v1 is a synced key, cleared when another account signs in on this browser). */
  if (BOOT.role === 'student' && BOOT.engine) (function () {
    var root = document.documentElement;
    if (!root || !root.classList) return;
    var SETTINGS = 'jia.settings', SEEN = 'jg.seen.v1', Q = /^\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)$/;
    function readJson(k) {
      try { var o = ls ? JSON.parse(ls.getItem(k) || 'null') : null; return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch (e) { return null; }
    }
    var realMM = typeof window.matchMedia === 'function' ? window.matchMedia : null;
    function deviceCalm() {
      var os = false, nav = typeof navigator !== 'undefined' ? navigator : null;
      try { os = !!(realMM && realMM.call(window, '(prefers-reduced-motion: reduce)').matches); } catch (e) {}
      return os || !!(nav && ((typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) || (nav.connection && nav.connection.saveData === true)));
    }
    function choiceOf(s) { return s && typeof s.calm === 'boolean' && (s.calmSet === true || s.calm === true) ? s.calm : null; }
    var s0 = readJson(SETTINGS), chosen = choiceOf(s0);
    if (s0 && chosen === null && ('calm' in s0 || 'calmSet' in s0)) {        // no choice: the design's switch starts from <html class="calm">
      delete s0.calm; delete s0.calmSet;
      try { rawSet.call(ls, SETTINGS, JSON.stringify(s0)); } catch (e) {}
    }
    root.classList.toggle('calm', chosen === null ? deviceCalm() : chosen);

    if (realMM) window.matchMedia = function (q) {
      if (root.classList.contains('calm') && Q.test(String(q).trim())) {
        var none = function () {};
        return { matches: true, media: String(q), onchange: null, addListener: none, removeListener: none, addEventListener: none, removeEventListener: none, dispatchEvent: function () { return false; } };
      }
      return realMM.call(window, q);
    };

    function reload() {
      var E = window.JG_ENGINE;
      if (E && E.session && E.session()) return;
      setTimeout(function () {
        try { window.sessionStorage.setItem('jg.reopen', 'settings'); } catch (e) {}
        flush(false).then(function () { location.reload(); }, function () { location.reload(); });
      }, 400);
    }
    hooks[SETTINGS] = function (v) {
      var o; try { o = JSON.parse(v); } catch (e) { return v; }
      if (!o || typeof o !== 'object' || Array.isArray(o) || typeof o.calm !== 'boolean') return v;
      var flipped = o.calm !== root.classList.contains('calm');                // the design's apply() follows this write
      if (flipped) chosen = o.calm;
      if (chosen === null) { delete o.calm; delete o.calmSet; } else o.calmSet = true;
      if (flipped) reload();
      return JSON.stringify(o);
    };
    var reopen = null;
    try { reopen = window.sessionStorage.getItem('jg.reopen'); if (reopen) window.sessionStorage.removeItem('jg.reopen'); } catch (e) {}
    if (reopen === 'settings') document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () { try { if (window.JIA_openSettings) window.JIA_openSettings(); } catch (e) {} }, 0);
    });

    function day() {
      var E = window.JG_ENGINE, d = new Date();
      if (E && E.ymd) return E.ymd(d);
      var p = function (n) { return (n < 10 ? '0' : '') + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    window.JG_MOTION = {
      reduced: function () { return root.classList.contains('calm'); },
      onceToday: function (name) {
        var today = day(), seen = readJson(SEEN) || {};
        if (seen[name] === today) return false;
        seen[name] = today;
        try { ls.setItem(SEEN, JSON.stringify(seen)); } catch (e) {}
        return true;
      }
    };
  })();

  /* 9. Home's score bubbles never show the design's demo numbers to a live student (the teen walk of 10 Oct 2026, the owner's delegated call: a
   * brand-new account's first Home read "3.9 GPA", "5 AP avg", "1570 SAT", "7.5 IELTS" for about 2.5 seconds). The design's Home script builds the
   * bubbles from its own demo METRICS (M:002:10, D:001) and the engine page writes the student's own over them only once its big script has arrived
   * (syncHome, M:023:1495), seconds later on a phone's network. Here each bubble, and its screen-reader line, starts as syncHome writes a score
   * nobody has yet: a dash, an empty ring, "not taken yet"; syncHome then writes the student's own. The observer's callback runs right after the
   * script that built the bubbles, before the page can paint them, and it stops at once. The demo family and /preview keep the design's numbers. */
  if (BOOT.engine && typeof MutationObserver === 'function' && document.getElementById) (function () {
    var EMPTY = (2 * Math.PI * 48).toFixed(1), narrowed = false;   // the ring's whole length, as syncHome's --off for no score
    var mo = new MutationObserver(look);
    function look() {
      var arc = document.getElementById('arc'), i;
      if (!arc) return;
      if (!narrowed) { narrowed = true; mo.disconnect(); mo.observe(arc, { childList: true }); }   // from here only the arc is watched
      var bs = arc.querySelectorAll('.bubble');
      if (!bs.length) return;
      mo.disconnect();
      for (i = 0; i < bs.length; i++) { var v = bs[i].querySelector('.txt b'); if (v) v.textContent = '—'; bs[i].style.setProperty('--off', EMPTY); }
      var sr = document.getElementById('sr'), lines = sr ? sr.children : [];
      for (i = 0; i < lines.length; i++) { var m = /^(.*?): .*? (of \S+)$/.exec(lines[i].textContent); if (m) lines[i].textContent = m[1] + ': not taken yet ' + m[2]; }
    }
    mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', function () { mo.disconnect(); });
  })();

  /* 10. The letter that opens at 100 % is the student's own (the teen walk of 10 Oct 2026, the owner's delegated call; the 13-year-old: "The
   * envelope is the best thing in the app and I cannot read the letter. It is in English, in curly handwriting, signed 'O.' (I am Sardor), from
   * a place I never chose"). The design writes the demo's letter into the page's two halves each time it opens (M:004:19-27 and 320-332: five
   * English texts by study day, an English date, signed "O." from "Cambridge, Massachusetts"; "O." is the demo student's own initial). For a
   * live student this rewrites what the design just wrote, in the observer's callback, before the page can paint it: the design's own five
   * texts in Uzbek or Russian (an English student keeps the design's words), the date in the student's language, the student's own initial,
   * and the first destination he named (the snapshot's goal.places, already in his language) or no place at all. The greeting and "Yours," are
   * the dictionaries' (jg-i18n.js). The letters a child can read are a stylesheet's (src/server/pages.ts). The demo and /preview keep theirs. */
  if (BOOT.engine && typeof MutationObserver === 'function' && document.getElementById) (function () {
    /* The teenagers' second walk (10 Oct 2026, the shell lane; the 17-year-old: "'…вернётся к вам здесь, под Куполом. Я знаю: я сейчас стою
     * под ним. С уважением, Т. · Узбекистан': my school is NYU, there is no dome in my plan, and 'Т.' is nobody"). The letter is from the
     * student's FUTURE SELF: signed with his own first name and the year his plan ends (the snapshot's goal.year), naming his own
     * first-choice school (goal.short in the text, goal.name under the signature: the catalog's names), and no building: no record holds a dome or a door. Each letter is two or three
     * short sentences; a sentence that needs the school or the year is left out when the snapshot has none (he named no university: the
     * place line is then his first destination, as before, or nothing). In Uzbek and Russian the future self says "sen" / "ты" to himself,
     * with a greeting and a closing to match; an English letter keeps the design's "Dear …," and "Yours,". */
    var LETTERS = {
      en: [['This is you, writing from {year}.', 'I remember today.', 'Each hour like this one takes you closer to {school}.'],
        ['Thank you for the task you almost skipped today.', 'The road to {school} is made of days like this.'],
        ['Some days feel slow.', 'Not one is wasted: from {year} I can see it.', 'Keep walking to {school}.'],
        ['One day does not feel like a change.', 'From {year} it does: {school} is no longer only a dream.'],
        ['Today you came one step closer to {school}.', 'I am proud of you.', 'See you in {year}.']],
      uz: [['Bu men: {year}-yildagi sen.', 'Bugunni eslayman.', 'Har bir shunday soat maqsadga yaqinlashtiradi: {school}.'],
        ['Tashlab ketishingga sal qolgan vazifa uchun rahmat.', '{school} sari yoʻl shunday kunlardan yigʻiladi.'],
        ['Baʼzi kunlar sekin oʻtadi.', 'Birortasi ham bekor ketmaydi: {year}-yildan bu koʻrinadi.', 'Maqsading: {school}.'],
        ['Bir kunda oʻzgarish sezilmaydi.', '{year}-yildan esa koʻrinadi: {school} endi shunchaki orzu emas.'],
        ['Bugun maqsadga bir qadam yaqinlashding: {school}.', 'Sen bilan faxrlanaman.', '{year}-yilda koʻrishamiz.']],
      ru: [['Это ты, только из {year} года.', 'Я помню этот день.', 'Каждый такой час ведёт тебя к цели: {school}.'],
        ['Спасибо за задание, которое хотелось пропустить.', 'Из таких дней и складывается путь к цели: {school}.'],
        ['Бывают медленные дни.', 'Ни один не проходит зря: из {year} года это видно.', 'Твоя цель — {school}.'],
        ['За один день перемену не заметить.', 'А из {year} года её видно: {school} — уже не просто мечта.'],
        ['Сегодня ты на шаг ближе к цели: {school}.', 'Я тобой горжусь.', 'До встречи в {year} году.']]
    };
    var HELLO = { uz: 'Salom, {first}!', ru: 'Привет, {first}!' }, YOURS = { uz: 'Mehr bilan,', ru: 'Обнимаю,' };
    var MONTHS = { uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],   // "10-oktabr, 2026"
      ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'] };            // "10 октября 2026"
    var mo = null;
    function lang() { var I = window.JG_I18N, E = window.JG_ENGINE; return (I && I.lang && I.lang()) || (E && E.cache && E.cache.lang) || 'en'; }
    function set(el, t) { if (el && el.textContent !== t) el.textContent = t; }
    function rewrite(layer) {
      var E = window.JG_ENGINE, c = (E && E.cache) || BOOT.engine, l = lang(), i, pages = layer.querySelectorAll('.lt-page');
      var day = (c.program && c.program.day) || 1, list = LETTERS[l] || LETTERS.en, g = c.goal || null;
      var first = String((BOOT.me && (BOOT.me.firstName || BOOT.me.fullName)) || '').trim(); first = first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
      // his first-choice school and the year his plan counts back from; a goal that is only a place names no school. The letter says the
      // school as he does (the catalog's short name: "NYU", "SNU"); the line under the signature holds its full name
      var school = g && g.key && g.key !== 'place' && g.name ? String(g.name) : '', year = g && g.year > 2000 ? String(g.year) : '';
      // The round before the deploy (11 Oct 2026; the 17-year-old's fifth walk: the letter "still hugs me from 'New York University'" on the
      // day the roadmap said NYU for his year does not work out). While that verdict stands for this school and he has not chosen a way
      // (the snapshot's `truth`, src/engine/strategy/truth.ts), the letter names no school and signs from no place: the sentences that
      // need the school are left out, as for a student who named none. Once he chose, the goal is his way's and the letter follows it.
      var late = !!(c.truth && g && c.truth.uni === g.key);
      if (late) school = '';
      var said = school ? String(g.short || school) : '';
      var fill = function (s) { return s.replace('{school}', said).replace('{year}', year).replace('{first}', first); };
      var text = list[(day - 1) % list.length].filter(function (s) { return (school || s.indexOf('{school}') < 0) && (year || s.indexOf('{year}') < 0); }).map(fill).join(' ');
      var sign = first ? first + (year ? ', ' + year : '') : '', place = late ? '' : school || (g && g.places && g.places[0]) || '', date = null;
      var hello = HELLO[l] && first ? fill(HELLO[l]) : null, yours = YOURS[l] || null;
      // today, as the design dates it (the device's own day), with the month's name from here: a browser without Uzbek month names writes "2026 M10 10"
      if (MONTHS[l]) { var now = new Date(); date = l === 'uz' ? now.getDate() + '-' + MONTHS.uz[now.getMonth()] + ', ' + now.getFullYear() : now.getDate() + ' ' + MONTHS.ru[now.getMonth()] + ' ' + now.getFullYear(); }
      for (i = 0; i < pages.length; i++) {
        var p = pages[i], body = p.querySelector('.lt-body'), src = p.querySelector('.lt-src');
        if (!body) continue;
        set(body, text);
        if (body.style) body.style.fontSize = text.length > 96 ? '6.1cqw' : '';   // a long school name stays on the paper (the design's own letters are 71 to 104 letters)
        if (date) set(p.querySelector('.lt-date'), date);
        if (hello) set(p.querySelector('.lt-hello'), hello);
        if (yours) set(p.querySelector('.lt-yours'), yours);
        set(p.querySelector('.lt-sign'), sign);
        if (src) { set(src, place); src.hidden = !place; }
      }
      var T = function (s) { var I = window.JG_I18N; return I && I.text ? I.text(s) : s; }, sr = document.getElementById('lt-sr');
      if (sr && text) set(sr, [hello || T('Dear ' + first + ','), text, yours || T('Yours,'), sign + (place ? ', ' + place : '')].join(' ') + (place ? '.' : ''));
      if (mo) mo.takeRecords();                                          // its own writes just now
    }
    document.addEventListener('DOMContentLoaded', function () {
      var layer = document.getElementById('lt-layer');
      if (!layer || !layer.querySelectorAll) return;
      mo = new MutationObserver(function () { rewrite(layer); });
      mo.observe(layer, { childList: true, subtree: true });
    });
  })();
})();
