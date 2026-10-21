/* Jamals Global runtime: the League (m1 lane "league", 20 Oct 2026). Not design code: the design's League (student-mobile js/010.js
 * 1344-1386, the laptop's js/010.js 12-88, its Home card js/023.js 183-193 and KPI 121) asks this file, through window.JG_LEAGUE, for
 * what it would otherwise draw from its fixture: the standings, the league's name and line, the zones and the rank. Loaded by
 * src/server/league/page.ts (src/server/pages.ts) for a live, non-demo student only, at once after jg-runtime.js, so the design's
 * first paint is already true. The demo family and /preview never load it and keep the design's "Gold League" as drawn.
 *
 * TWO STATES, chosen by the snapshot (JG_ENGINE.cache.league):
 *  - no `board` (the LEAGUE switch off, or a snapshot from before it): the HONEST state, live since this round. The owner kept the
 *    League (4 Oct R11, "liga, online qolsin"), but a real student is never ranked against invented students with fixed XP: the table
 *    holds her own row (her real weekly XP), the head says "Your league starts when classmates join.", no promotion or demotion zone,
 *    no rank, no "N days left" of a week nobody plays, and no league chat (the design's chat opens with an invented "Dilnoza").
 *  - a `board` (LEAGUE on, src/server/league/*): her real weekly cohort of real students (first name and initial, initials avatar,
 *    their real XP this week from the XP ledger), her tier's name, "Top 5 move up. N days left this week." with N real, the zones as
 *    drawn once the cohort is full enough to play (board.state "on"); while it fills, the honest line with how many are here.
 *    The league chat opens only when the board names one (the chat contract, src/server/league/chat.ts); else its button is hidden.
 */
(function () {
  'use strict';
  var W = window, D = document, BOOT = W.JG_BOOT;
  if (!BOOT || !BOOT.engine || BOOT.demo || W.JG_LEAGUE) return;

  var cache = function () { return (W.JG_ENGINE && W.JG_ENGINE.cache) || BOOT.engine; };
  var board = function () { var c = cache(), l = c && c.league, b = l && l.board; return b && Array.isArray(b.members) ? b : null; };
  var ranked = function () { var b = board(); return !!b && b.state === 'on'; };
  var tier = function () { var b = board(); return b ? Math.max(0, Math.min(9, b.tier | 0)) : 0; };
  var TINTS = ['#6fb0a5', '#9c90cc', '#d59199', '#7b9fcf', '#d8a261', '#78b692', '#8a9a92'];
  var initials = function (name, bg) {
    var ini = String(name || '').split(' ').filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase().replace(/[<&>"]/g, '');
    return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="' + bg + '"/><text x="32" y="40.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#fff">' + ini + '</text></svg>');
  };
  var noop = function () {};
  var TIP = {
    en: 'Your league starts when classmates join. Until then this is your own XP this week: every 25 minutes you finish in the Study Room adds 10 XP.',
    uz: 'Sinfdoshlaringiz qoʻshilganda ligangiz boshlanadi. Hozircha bu shu haftadagi oʻz XPingiz: Oʻqish xonasida tugatgan har 25 daqiqangiz 10 XP qoʻshadi.',
    ru: 'Ваша лига начнётся, когда присоединятся одноклассники. Пока это ваш собственный XP за неделю: каждые 25 минут, законченные в Учебной комнате, дают 10 XP.',
  };

  var api = {
    /** The league as the page reads it: 'off' (no board), 'filling' or 'on'. */
    state: function () { var b = board(); return b ? (b.state === 'on' ? 'on' : 'filling') : 'off'; },
    ranked: ranked,
    /** The design's ME (M:010:1344): her tier and the real days left, read again on every paint (a new snapshot moves them). */
    me: function (ME) {
      Object.defineProperties(ME, {
        league: { get: tier, set: noop, configurable: true },
        daysLeft: { get: function () { var b = board(); return b ? b.days_left : 0; }, set: noop, configurable: true },
      });
    },
    /** Her cohort, highest weekly XP first; each other member under an opaque key (lm0, lm1 …) in the design's PEOPLE and AV. */
    standings: function (ME, PEOPLE, AV) {
      var b = board(), mine = { who: 'me', xp: ME.week | 0 };
      if (!b) return [mine];
      var rows = [], k = 0;
      b.members.forEach(function (m) {
        if (m.me) { mine.xp = Math.max(mine.xp, m.xp | 0); return; }
        var id = 'lm' + k;
        if (PEOPLE) PEOPLE[id] = { name: String(m.name || ''), kind: 'student', tag: 'Student' };
        if (AV) AV[id] = initials(m.name, TINTS[k % TINTS.length]);
        rows.push({ who: id, xp: m.xp | 0 }); k++;
      });
      rows.push(mine);
      return rows.map(function (r, i) { return [r, i]; }).sort(function (a, c) { return c[0].xp - a[0].xp || a[1] - c[1]; }).map(function (x) { return x[0]; });   // ties keep the server's order, hers last (as the design sorts)
    },
    /** The head's title: her tier's name once she is in a league, else "Your league". */
    title: function (L) { return board() ? L[0] + ' League' : 'Your league'; },
    /** The head's line. */
    line: function () {
      var b = board();
      if (!b) return 'Your league starts when classmates join.';
      if (b.state !== 'on') return 'Your league starts when classmates join. ' + b.size + ' of ' + b.min + ' here so far.';
      return 'Top ' + b.up + ' move up. ' + b.days_left + ' days left this week.';
    },
    /** The "#3 in Bronze" chip, only in a league that plays. */
    chip: function (rank, L) { return ranked() ? '<span>#' + rank + ' in ' + L[0] + '</span>' : ''; },
    /** A row's zone class, as drawn (top up, bottom down), only in a league that plays; nobody moves down from the first tier. */
    zone: function (k, n) {
      var b = board(); if (!ranked()) return '';
      return k < b.up ? ' up' : b.tier > 0 && k >= n - b.down ? ' down' : '';
    },
    /** The zone lines between the rows, as drawn. */
    sep: function (k, n) {
      var b = board(); if (!ranked()) return '';
      return k === b.up - 1 && n > b.up ? '<li class="lg-zone up">Promotion zone above</li>' : b.tier > 0 && k === n - b.down - 1 ? '<li class="lg-zone down">Demotion zone below</li>' : '';
    },
    /** The card's second line (Today, M:010:1381, D:010:41). */
    cardSub: function (rank, n, week) { return ranked() ? '#' + rank + ' of ' + n + ' · ' + week + ' XP this week' : week + ' XP this week'; },
    /** The laptop's KPI (D:023:121): her rank in a league that plays, else her XP this week and the honest line. */
    kpiN: function (L) { return ranked() ? L.rank : L.xp; },
    kpiF: function (v) { return ranked() ? '#' + Math.max(1, Math.round(v)) : Math.round(v) + ' XP'; },
    kpiD: function (L) { return ranked() ? L.name + ' League · ' + L.xp + ' XP this week' : 'Starts when classmates join'; },
    /** The one line jg-real.js shows on a tap of the card (its own line says "your place in this week's league table"): until her league
     *  plays, what the number really is, in her language; null once it plays (jg-real.js's own line is then true). */
    tip: function (lang) { return ranked() ? null : (TIP[lang] || TIP.en); },
    /** The comeback plan's away count (M:023:2433) skips her REAL rest days, not every Sunday: with LEAGUE on, the server's list of her
     *  past rest and freeze days (src/server/league/rest.ts); this week, the snapshot's own days; before it, the weekdays this week's
     *  plan rests on (the server's cadence); Sunday only when nothing is known. */
    restDay: function (ymd) {
      var c = cache(), L = c && c.league, days = (c && c.week && Array.isArray(c.week.days)) ? c.week.days : [], i;
      for (i = 0; i < days.length; i++) if (days[i].date === ymd) return !!days[i].rest;
      if (L && Array.isArray(L.rest)) return L.rest.indexOf(ymd) !== -1;
      var wd = function (d) { return new Date(d + 'T12:00:00Z').getUTCDay(); }, off = [];
      days.forEach(function (d) { if (d.rest) off.push(wd(d.date)); });
      return days.length ? off.indexOf(wd(ymd)) !== -1 : wd(ymd) === 0;
    },
    /** The league chat named by the board (the chat contract), or null. */
    chat: function () { var b = board(); return (b && b.chat) || null; },
    /** "Open league chat": the real chat through the chat client when there is one (a hook for the chat lane); never the design's invented one. */
    openChat: function () {
      var id = api.chat();
      if (id && W.JG_CHAT && typeof W.JG_CHAT.open === 'function') { try { W.JG_CHAT.open(id); } catch (e) {} }
    },
  };
  W.JG_LEAGUE = api;

  /* MEDALS (LEAGUE on: the snapshot's league.medals, issued by the server, src/server/achievements/store.ts). The design keeps which
   * ceremony played in its own jia.medals blob (M:021:55) and lets the page unlock an achievement with a made-up serial (M:010 unlock).
   * Here the server's word wins: (1) before the design reads its blob, every ceremony the server says played (on any of her devices) is
   * written into it, so none plays twice; (2) when the design records a ceremony it played, the server is told (POST
   * /api/v1/achievements/seen), so her other devices skip it; (3) her achievements show the server's date and serial, and one the
   * server issued with no ceremony yet ("League climber" at the weekly rollover; "7-day streak" earned elsewhere) plays once now.
   * Without medals in the snapshot (LEAGUE off) none of this runs and the design's own memory works as before. */
  var MEDAL_KEY = 'jia.medals';
  var medals = function () { var c = cache(), l = c && c.league; return l && Array.isArray(l.medals) ? l.medals : null; };
  var keyOf = function (id) { return /^s\d+$/.test(id) ? id : 'a:' + id; };
  var idOf = function (key) { return /^s\d+$/.test(key) ? key : key.indexOf('a:') === 0 ? key.slice(2) : null; };
  var store = null; try { store = W.localStorage; } catch (e) { store = null; }
  var readSaved = function () { var s = {}; try { s = JSON.parse((store && store.getItem(MEDAL_KEY)) || '{}') || {}; } catch (e) { s = {}; } s.seen = s.seen || {}; return s; };
  var told = {};
  function report(raw) {
    var m = medals(); if (!m) return;
    var s; try { s = JSON.parse(raw) || {}; } catch (e) { return; }
    var ids = [];
    Object.keys(s.seen || {}).forEach(function (k) { var id = idOf(k); if (!id || told[id]) return; m.forEach(function (a) { if (a.id === id && !a.seen) { ids.push(id); a.seen = true; } }); });
    if (!ids.length) return;
    ids.forEach(function (id) { told[id] = 1; });
    try { fetch('/api/v1/achievements/seen', { method: 'POST', headers: { 'x-jg-uid': BOOT.uid, 'content-type': 'application/json' }, body: JSON.stringify({ ids: ids }) }).catch(function () {}); } catch (e) {}
  }
  function seedSeen() {
    var m = medals(); if (!m || !store) return;
    var s = readSaved(), changed = false;
    m.forEach(function (a) { if (a.seen && !s.seen[keyOf(a.id)]) { s.seen[keyOf(a.id)] = 1; changed = true; } });
    if (changed) try { store.setItem(MEDAL_KEY, JSON.stringify(s)); } catch (e) {}
  }
  var fmt = function (ymd) { var p = String(ymd || '').split('-'); try { return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); } catch (e) { return ymd; } };
  function applyAch(play) {
    var A = W.JIA_ach, m = medals(); if (!A || !A.list || !m) return;
    m.forEach(function (a) {
      if (/^s\d+$/.test(a.id)) return;                                              // a streak medal's ceremony comes with the day (M:021 jia:daydone)
      var x = null; A.list.forEach(function (y) { if (y.id === a.id) x = y; }); if (!x) return;
      x.got = fmt(a.date); x.no = a.serial; if (x.prog) x.prog = [x.prog[1], x.prog[1]];
      if (play && !a.seen && !readSaved().seen[keyOf(a.id)] && W.JIA_celebrate) { try { W.JIA_celebrate({ id: a.id }); } catch (e) {} }
    });
  }
  /* MOTIVATION (LEAGUE on; src/server/motivation/*). The server writes her why, sealed letter (no text while sealed), comeback plan and
   * worn looks into jg.diag.v1 at boot and keeps none of them from the page's own saves. So each change the design makes to those fields
   * (M:023: setWhy, the letter's "Seal it" and P.S., cbCheck and completeComebackStep, buyStyle and setStyle) is sent here as one op,
   * in order; the server decides (a plan only when her real days away say so, a session step only for a session she finished today,
   * a look only if the ledger shows she bought it), and the next boot shows what it kept. */
  var DIAG = 'jg.diag.v1', ops = Promise.resolve();
  var parseDiag = function (raw) { try { var s = JSON.parse(raw); return s && typeof s === 'object' ? s : null; } catch (e) { return null; } };
  var lastDiag = store ? parseDiag(store.getItem(DIAG)) : null;
  var send = function (body) {
    ops = ops.then(function () {
      return fetch('/api/v1/motivation', { method: 'POST', headers: { 'x-jg-uid': BOOT.uid, 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(function () {});
    });
  };
  var J = function (x) { return JSON.stringify(x === undefined ? null : x); };
  function diffMotivation(raw) {
    var S = parseDiag(raw), L = lastDiag || {}; if (!S) return;
    lastDiag = S;
    if ((S.why || '') !== (L.why || '') && S.why) send({ op: 'why', text: String(S.why) });
    if (S.letter && typeof S.letter.text === 'string') {
      if (!L.letter && S.letter.text) send({ op: 'seal', text: S.letter.text });
      var ps = S.letter.ps || [], was = (L.letter && L.letter.ps) || [];
      if (L.letter && ps.length > was.length && ps[ps.length - 1] && ps[ps.length - 1].text) send({ op: 'ps', text: String(ps[ps.length - 1].text) });
    }
    if (S.comeback && S.comeback.days) {
      var old = L.comeback && L.comeback.id === S.comeback.id ? L.comeback : null;
      if (!old) send({ op: 'comeback' });
      S.comeback.days.forEach(function (d, i) {
        ['session', 'task'].forEach(function (k) { if (d && d[k] && !(old && old.days && old.days[i] && old.days[i][k])) send({ op: 'comeback_step', day: i + 1, kind: k }); });
      });
    }
    var act = S.style && S.style.active, wasAct = L.style && L.style.active;
    if (act && J(act) !== J(wasAct)) send({ op: 'style', active: act });
  }

  if (medals()) {
    seedSeen();
    if (store) {
      var prevSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        prevSet.call(this, k, v);
        if (this !== store) return;
        if (k === MEDAL_KEY) report(String(v));
        else if (k === DIAG) diffMotivation(String(v));
      };
    }
    var ready = function () { applyAch(true); };
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', ready); else ready();
    D.addEventListener('jg:snapshot', function () { applyAch(false); });
  }
  api.medals = medals;

  // The league chat's button is shown only when the board names a chat.
  var css = D.createElement('style'); css.id = 'jg-league-css';
  css.textContent = 'html.jg-lg-nochat #lg-chat{display:none!important}';
  (D.head || D.documentElement).appendChild(css);
  // Shown only when the board names a chat AND the messenger's client is on the page and running (public/runtime/jg-chat.js, lane chatcli,
  // MESSENGER on): a button that opened nothing would be one more promise the app does not keep.
  var chatButton = function () { D.documentElement.classList.toggle('jg-lg-nochat', !(api.chat() && W.JG_CHAT && W.JG_CHAT.on && typeof W.JG_CHAT.open === 'function')); };
  chatButton();
  D.addEventListener('jg:snapshot', chatButton);
  W.addEventListener('load', chatButton);
  D.addEventListener('click', function (e) { var t = e.target; if (t && t.closest && t.closest('#lg-card, [data-jia="league"]')) chatButton(); }, true);   // read again as the League opens
})();
