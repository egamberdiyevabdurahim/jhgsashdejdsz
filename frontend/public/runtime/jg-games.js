/* Jamals Global runtime: the games and the coin shop for a real student, phone and laptop (M1 games lane, 20 Oct 2026; the owner's
 * "our main features … gaming" of 19 Oct and his "they must be done before any real family joins"). Loaded by src/server/pages.ts for
 * a live, non-demo student only, in every switch state, NOT deferred: the design's game scripts read window.JG_GAMES while they load
 * (M:013 / D:005 the hub, chess and checkers; M:007 the IQ battle; M:014 / D:007 the team games; M:018 / D:019 the coin shop; each
 * line edited one for one, "JG-PROD: owner 20 Oct M1 games"). The demo family and /preview never load it and keep the design as drawn.
 *
 * WHAT IS HONEST WITH THE SWITCH OFF (production today):
 *  - every opponent that is a bot is "Computer" (JIA_PEOPLE.cpu, a drawn face, no flag, no rating); no invented rating for anybody;
 *    the student's own chess and checkers rating is not shown ("Practice"): nothing saves it;
 *  - a won or drawn board game pays what its card says (+20 / +5) on the phone too, through the server's capped game route, as the
 *    laptop always did (the phone said "+20 coins" and paid nothing);
 *  - the hub (hub()): no Girls-vs-Boys classic and no Math battle with its stereotype roulette, secret coin round and time inflation
 *    (the owner's decision 13 is open; their Halal versions stay, the Math battle's Halal version without those three); no Mafia (its
 *    players are bots shown as classmates, "N waiting", a room chat; the room server is not built); JG Daily opens here (go()), with
 *    no invented "% got this", no scripted discussion and no "+XP" nobody credits; CampusGuessr without the 1v1 against a bot, the
 *    squad mode and the invented leaderboard;
 *  - Today's "This weekend" movie-night tile (a made-up lineup shown "LIVE · N watching") is not drawn;
 *  - the coin shop sells only what the server's price list fulfils (shopOk): the rest reads "Coming soon" and takes no coin.
 * WHAT IS REAL WITH GAMES_SERVER ON (cfg.on): GET /api/v1/games/me (her ratings), POST /api/v1/games/result (the moves of a board game
 *  against the computer, replayed and judged by the server, which saves the result and her rating and pays only a result it checked),
 *  JG Daily from the server's bank (GET/POST /api/v1/games/daily: the answer checked there, real answer percentages), CampusGuessr's
 *  daily on the server's seed with server scoring and a real leaderboard (GET /api/v1/games/campus, POST /api/v1/games/campus/guess).
 * Not here (not this round): rooms against real players, Mafia.
 * window.JG_GAMES: on, me, bots, mode(kind), shopOk(id), hub(SECTIONS), go(g), done(G, res, why, rankChip), words(). */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_GAMES) return;
  var C = W.JG_GAMES_CFG || {}, ON = !!C.on, OK = C.ok || ['o1'];

  var T = {
    en: { daily: 'JG Daily', close: 'Close', correct: 'Correct', wrong: 'Not this time', first: 'You are among the first to answer today.',
      pct: function (p, n) { return p + '% of ' + n + ' students got this today'; }, again: 'A new question tomorrow.', soon: 'One tough question a day',
      done: function (ok) { return (ok ? '✅' : '❌') + ' Answered today'; }, note: 'Same question for everyone today.', copy: 'Copy result', copied: 'Copied ✓',
      board: "Today's daily · leaderboard", you: 'You', played: function (n) { return n + (n === 1 ? ' student' : ' students') + ' played today'; } },
    uz: { daily: 'JG Daily', close: 'Yopish', correct: 'Toʻgʻri', wrong: 'Bu safar emas', first: 'Bugun birinchilardan boʻlib javob berdingiz.',
      pct: function (p, n) { return 'Bugun ' + n + ' nafar oʻquvchining ' + p + '% i toʻgʻri topdi'; }, again: 'Ertaga yangi savol.', soon: 'Kuniga bitta qiyin savol',
      done: function (ok) { return (ok ? '✅' : '❌') + ' Bugun javob berildi'; }, note: 'Bugun hamma uchun bir xil savol.', copy: 'Natijani nusxalash', copied: 'Nusxalandi ✓',
      board: 'Bugungi kunlik · reyting', you: 'Siz', played: function (n) { return 'Bugun ' + n + ' nafar oʻquvchi oʻynadi'; } },
    ru: { daily: 'JG Daily', close: 'Закрыть', correct: 'Верно', wrong: 'В этот раз нет', first: 'Вы среди первых, кто ответил сегодня.',
      pct: function (p, n) { return p + '% из ' + n + ' учеников ответили верно сегодня'; }, again: 'Завтра новый вопрос.', soon: 'Один трудный вопрос в день',
      done: function (ok) { return (ok ? '✅' : '❌') + ' Ответ дан сегодня'; }, note: 'Сегодня у всех один и тот же вопрос.', copy: 'Скопировать результат', copied: 'Скопировано ✓',
      board: 'Задание дня · рейтинг', you: 'Вы', played: function (n) { var a = n % 10, b = n % 100; return 'Сегодня сыграли ' + n + ' ' + (a === 1 && b !== 11 ? 'ученик' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'ученика' : 'учеников'); } }
  };
  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function t() { return T[lang()]; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function api(method, url, body) {
    return fetch(url, { method: method, headers: method === 'POST' ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  var newId = function (p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  function ymd() { try { return W.JG_ENGINE && W.JG_ENGINE.ymd ? W.JG_ENGINE.ymd(new Date()) : new Date().toISOString().slice(0, 10); } catch (e) { return new Date().toISOString().slice(0, 10); } }

  /* ---------- the computer: one opponent, named for what it is ---------- */
  var CPU_FACE = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#1f8f5f"/><rect x="15" y="17" width="34" height="24" rx="5" fill="#fff"/><rect x="19" y="21" width="26" height="16" rx="3" fill="#176f4a"/><circle cx="27" cy="29" r="2.6" fill="#9fe3c2"/><circle cx="37" cy="29" r="2.6" fill="#9fe3c2"/><rect x="27" y="43" width="10" height="3" rx="1.5" fill="#fff"/><rect x="22" y="46" width="20" height="3.4" rx="1.7" fill="#fff"/></svg>');
  function ensureCpu() {
    var P = W.JIA_PEOPLE = W.JIA_PEOPLE || {}, A = W.JIA_AV = W.JIA_AV || {};
    if (!P.cpu) P.cpu = { name: 'Computer', kind: 'bot', tag: 'Computer' };
    if (!A.cpu) A.cpu = CPU_FACE;
  }
  D.addEventListener('DOMContentLoaded', ensureCpu);
  /* the IQ battle tells her a score, never an IQ (M:007:299-308 count her right answers): the result's label and the well's (SM:944, SM:197) */
  function iqWords() {
    var r = D.querySelector('#iq-result .iq-iq'); if (r && r.firstChild && r.firstChild.nodeType === 3) r.firstChild.textContent = 'Your score ';
    var w = D.querySelectorAll('#iq-well text'); for (var i = 0; i < w.length; i++) if (/BEST IQ/.test(w[i].textContent)) w[i].textContent = 'BEST SCORE';
  }
  D.addEventListener('DOMContentLoaded', iqWords);
  /* the hub's line under its title (SM:666, SD:427): with the switch off no rank is kept, so it does not promise ranks */
  /* a plan coupon (d1, d3: sold only while the m1-pay lane's PAYMENTS is on) is kept on her account and taken off at checkout: no code
   * to copy, so its voucher says that in place of the design's "Use this code at checkout" (M:018:17, 19) */
  var COUPON = { d1: 1, d3: 1 }, shopItem = '';
  D.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('#cs-view .cs-card, #cs-view .cs-row'); if (b) shopItem = b.getAttribute('data-id') || ''; }, true);
  D.addEventListener('DOMContentLoaded', function () {
    var dn = D.getElementById('cs-done'); if (!dn || !W.MutationObserver) return;
    new MutationObserver(function () { var nx = D.getElementById('cs-done-next'); if (!dn.hidden && nx && COUPON[shopItem]) nx.textContent = 'Saved to your account. It comes off at checkout.'; })
      .observe(dn, { attributes: true, attributeFilter: ['hidden'] });   // its own hidden only: the dictionary's pass on the text is no change of ours
  });
  /* Today's Mini games card (SM:165-166, SD:229-230) names Mafia, which is not in a real student's hub */
  D.addEventListener('DOMContentLoaded', function () { var c = D.getElementById('mg-card'), s = c && c.querySelector('small'); if (!c) return; c.setAttribute('aria-label', 'Mini games: JG Daily, CampusGuessr, chess, checkers and party games'); if (s && /Mafia/.test(s.textContent)) s.textContent = 'JG Daily, CampusGuessr, chess and more.'; });
  D.addEventListener('DOMContentLoaded', function () { var p = D.querySelector('#gh-title + p'); if (!ON && p && /climb the ranks/.test(p.textContent)) p.textContent = 'Play the computer, earn coins'; });

  var me = { chess: 0, checkers: 0, iq: 0, coins: 0 };              // the design's ME (M:013:49): 0 = not rated
  if (ON) api('GET', '/api/v1/games/me').then(function (r) { if (r && r.ratings) { me.chess = r.ratings.chess || 0; me.checkers = r.ratings.checkers || 0; } });

  function mode(kind) {
    var base = kind === 'chess' ? 'vs Computer · 10 min' : 'vs Computer · 5 min · Russian rules';
    return ON ? 'Rated ' + base : base;
  }
  function shopOk(id) { return OK.indexOf(id) !== -1; }

  /* ---------- the hub's shelves (M:013:66, D:005:66 call this after the design's JG_HUB) ---------- */
  var HIDE = { team: 1, math: 1, mafia: 1 };                          // the classic, the Math battle, Mafia: see the header
  function hub(SECTIONS) {
    ensureCpu();
    for (var i = SECTIONS.length - 1; i >= 0; i--) {
      var list = SECTIONS[i][1];
      for (var k = list.length - 1; k >= 0; k--) {
        var c = list[k];
        if (HIDE[c.k]) { list.splice(k, 1); continue; }
        if (c.k === 'mathh' || c.k === 'mathhalal') c.s = 'Luck picks the side · 10 questions';
        if (c.k === 'chess') c.s = ON ? 'Rated vs Computer · 10 min' : 'vs Computer · 10 min';
        if (c.k === 'checkers') c.s = ON ? 'Rated vs Computer · Russian rules' : 'vs Computer · Russian rules';
        if (c.k === 'jgdaily') {
          var a = dailyAnswer(), q = dailyQ();
          if (q) c.s = '#' + q.number + ' · ' + q.subject;
          c.foot = '<span class="gh-r" data-no-i18n>' + esc(a ? t().done(a.correct) : t().soon) + '</span>';
        }
      }
      if (!list.length) SECTIONS.splice(i, 1);
    }
  }
  function go(g) {
    if (g === 'jgdaily') { openDaily(); return true; }
    if (g === 'team' || g === 'math' || g === 'mafia') return true;     // never reached: hidden above
    return false;
  }

  /* ---------- a board game's end (M:013:153, D:005:154) ---------- */
  function done(G, res, why, rankChip) {
    if (!ON) {                                                         // off: the capped, page-claimed credit the laptop always posted
      if (res !== 'lose' && W.JIA_coins) W.JIA_coins.add(res === 'win' ? 20 : 5, { reason: 'game', ref: G.kind, outcome: res });
      return res === 'win' ? '+20 coins' : res === 'draw' ? '+5 coins' : '';
    }
    var kind = G.kind, moves = (G.moves || []).slice(0, 400);
    api('POST', '/api/v1/games/result', { kind: kind, moves: moves, result: res, why: String(why || '').slice(0, 40), client_id: newId('gr') }).then(function (r) {
      if (!r) return;
      var rt = r.rating, el = D.getElementById('gp-over-r'), cc = D.getElementById('gp-over-c');
      if (rt && el && typeof rankChip === 'function') { me[kind] = rt.after; el.innerHTML = '<span id="gp-over-n" hidden></span><span>' + rt.after + '</span> <b class="' + (rt.delta >= 0 ? 'up' : 'down') + '">' + (rt.delta >= 0 ? '+' : '') + rt.delta + '</b> ' + rankChip(rt.after); }
      if (cc) cc.textContent = r.credited > 0 ? '+' + r.credited + ' coins' : '';
      if (W.JIA_coins && typeof r.balance === 'number') { if (r.credited > 0) W.JIA_coins.add(r.credited, { reason: 'game_server' }); W.JIA_coins.set(r.balance); }
    });
    return '';
  }

  /* ---------- JG Daily ---------- */
  var DKEY = 'jg.games.daily.' + B.uid + '.';
  var daily = null;                                                   // on: the server's question of the day (and her answer)
  function dailyQ() {
    if (ON) return daily;
    try { return W.JG_API && W.JG_API.daily ? W.JG_API.daily() : null; } catch (e) { return null; }
  }
  function dailyAnswer() {
    if (ON) return daily && daily.answer;
    try { var v = W.localStorage.getItem(DKEY + ymd()); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  if (ON) api('GET', '/api/v1/games/daily').then(function (r) { if (r && r.question) daily = r; });

  var dT0 = 0, dTimer = 0;
  function dailyView() {
    var el = D.getElementById('jgd-view');
    if (!el) {
      el = D.createElement('div'); el.id = 'jgd-view'; el.className = 'zq-view'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('data-no-i18n', '');
      ((D.getElementById('dg-view') || {}).parentElement || D.body).appendChild(el);
      el.addEventListener('click', onDaily);
    }
    el.style.zIndex = String(W.JIA_z ? W.JIA_z() : 78);
    var H = D.getElementById('gh-view'); if (H && !H.hidden && +el.style.zIndex <= +H.style.zIndex) el.style.zIndex = String(+H.style.zIndex + 1);
    el.hidden = false; return el;
  }
  function openDaily() {
    var q = dailyQ(), a = dailyAnswer(), w = t(), el = dailyView();
    if (!q) { if (ON) api('GET', '/api/v1/games/daily').then(function (r) { if (r && r.question) { daily = r; openDaily(); } }); return; }
    el.setAttribute('aria-label', w.daily + ' #' + q.number);
    var opts = q.options.map(function (o, i) {
      var cls = a ? (i === a.correct_index ? ' ok' : i === a.choice ? ' bad' : '') : '';
      return '<button type="button" class="dg-opt' + cls + '" data-jgd="' + i + '"' + (a ? ' disabled' : '') + '><span>' + esc(o) + '</span></button>';
    }).join('');
    var res = '';
    if (a) {
      var share = 'JG Daily #' + q.number + ' ' + (a.correct ? '✅' : '❌');
      res = '<div class="jd-res ' + (a.correct ? 'ok' : 'bad') + '"><b>' + esc(a.correct ? w.correct : w.wrong) + '</b><p>' + esc(a.explanation) + '</p>'
        + (ON && typeof a.pct === 'number' && a.n >= 5 ? '<small>' + esc(w.pct(a.pct, a.n)) + '</small>' : ON ? '<small>' + esc(w.first) + '</small>' : '') + '</div>'
        + '<div class="jd-share"><code>' + esc(share) + '</code><button type="button" class="dg-link" data-jgd="copy">' + esc(w.copy) + '</button></div>'
        + '<p class="zq-note">' + esc(w.again) + '</p>';
    } else res = '<p class="zq-note">' + esc(w.note) + '</p>';
    el.innerHTML = '<div class="dg-top"><button class="dg-back" type="button" data-jgd="close" aria-label="' + esc(w.close) + '">‹</button><p class="dg-tt">' + esc(w.daily) + ' #' + q.number + '</p><span class="dg-timer" id="jgd-timer">' + (a ? '' : '0:00') + '</span></div>'
      + '<div class="zq-body"><p class="dg-mod">' + esc(q.subject) + '</p><h2 class="jd-q">' + esc(q.question) + '</h2><div class="dg-opts">' + opts + '</div>' + res + '</div>';
    clearInterval(dTimer);
    if (!a) {
      dT0 = Date.now();
      dTimer = setInterval(function () { var tm = D.getElementById('jgd-timer'); if (!tm || el.hidden) return clearInterval(dTimer); var s = Math.floor((Date.now() - dT0) / 1000); tm.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
    }
    var b0 = el.querySelector('.dg-back'); if (b0) setTimeout(function () { b0.focus({ preventScroll: true }); }, 60);
  }
  function answer(choice) {
    var secs = Math.max(1, Math.round((Date.now() - dT0) / 1000)), q = dailyQ(); if (!q) return;
    if (ON) {
      api('POST', '/api/v1/games/daily', { date: q.date, choice: choice, seconds: secs }).then(function (r) { if (r && r.answer) { daily = Object.assign({}, daily, { answer: r.answer }); openDaily(); repaintHub(); } });
      return;
    }
    var r; try { r = W.JG_API.answerDaily(q.date, choice, secs); } catch (e) { return; }
    var a = { choice: choice, correct: !!r.correct, correct_index: r.correct_index, explanation: r.explanation, seconds: secs };
    try { W.localStorage.setItem(DKEY + ymd(), JSON.stringify(a)); } catch (e) {}
    openDaily(); repaintHub();
  }
  function repaintHub() { var H = D.getElementById('gh-view'); if (H && !H.hidden && W.JIA_openGames) { var z = H.style.zIndex; W.JIA_openGames(); H.style.zIndex = z; } }
  function onDaily(e) {
    var b = e.target.closest('[data-jgd]'); if (!b || b.disabled) return;
    var act = b.getAttribute('data-jgd'), el = D.getElementById('jgd-view');
    if (act === 'close') { el.hidden = true; clearInterval(dTimer); }
    else if (/^\d$/.test(act)) answer(+act);
    else if (act === 'copy') { var c = el.querySelector('.jd-share code'); try { navigator.clipboard.writeText(c ? c.textContent : ''); b.textContent = t().copied; } catch (err) {} }
  }
  // any other way into the design's own JG Daily (the comeback plan's first step, M:023:2470) lands here instead: its "% got this",
  // scripted discussion and "+XP" are the design's demo
  function redirectDaily() {
    var host = (D.getElementById('dg-view') || {}).parentElement; if (!host || !W.MutationObserver) return;
    new MutationObserver(function () { var v = D.getElementById('jd-view'); if (v && !v.hidden) { v.hidden = true; openDaily(); } })
      .observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  }
  D.addEventListener('DOMContentLoaded', redirectDaily);
  D.addEventListener('keydown', function (e) { var el = D.getElementById('jgd-view'); if (e.key === 'Escape' && el && !el.hidden) { e.preventDefault(); e.stopImmediatePropagation(); el.hidden = true; clearInterval(dTimer); } }, true);

  /* ---------- CampusGuessr and Today's movie-night tile: what is invented is not drawn ---------- */
  var css = D.createElement('style'); css.setAttribute('data-jg-games', '');
  css.textContent = '#gn-row{display:none!important}'                                   // the "This weekend" movie-night tile (M:023:2879, D:022:2881)
    + '#cg-view .cg-mode[data-m="duel"],#cg-view .cg-mode[data-m="squad"]{display:none!important}'   // 1v1 against a bot; squads are cut (R11)
    + '#cg-view .cg-board:not(.jg-real){display:none!important}';                       // the invented daily leaderboard and its count
  (D.head || D.documentElement).appendChild(css);

  var cg = null, cgPlay = null;                                       // on: the server's daily (ids, her score, the board)
  function cgBoard() {
    if (!cg || !cg.board) return '';
    var w = t(), rows = cg.board.slice(0, 10).map(function (r, i) { return '<div class="cg-brow' + (r.me ? ' me' : '') + '"><span>' + (i + 1) + '</span><b>' + esc(r.me ? w.you : r.name) + '</b><em>' + Number(r.score).toLocaleString('en-US') + '</em></div>'; }).join('');
    return '<div class="cg-board jg-real" data-no-i18n><b class="jr-next-h">' + esc(w.board) + '</b>' + rows + '<p class="zq-note">' + esc(w.played(cg.players || 0)) + '</p></div>';
  }
  function cgSeam() {
    var A = W.JG_API; if (!A || !A.cgStart || A.cgStart.jg) return;
    var start = A.cgStart, guess = A.cgGuess;
    A.cgStart = function (m) {
      var r = start.apply(this, arguments);
      cgPlay = ON && m === 'daily' && cg && cg.ids && cg.ids.length === 5 ? { date: cg.date, round: 0 } : null;
      if (cgPlay && r && r.rounds) r.rounds.splice.apply(r.rounds, [0, r.rounds.length].concat(cg.ids));   // the server's seed (the design's CG.ids is this array)
      return r;
    };
    A.cgStart.jg = 1;
    A.cgGuess = function (gameId, round, lat, lon) {
      var r = guess.apply(this, arguments);
      if (cgPlay) api('POST', '/api/v1/games/campus/guess', { date: cgPlay.date, round: round, lat: lat, lon: lon }).then(function (x) { if (x && x.board) { cg = Object.assign({}, cg, x); paintCgBoard(); } });
      return r;
    };
  }
  function paintCgBoard() {
    var v = D.getElementById('cg-view'); if (!v || v.hidden || !cg || !cg.board || cg.score == null) return;
    var fin = v.querySelector('.cg-final'); if (!fin || v.querySelector('.cg-board.jg-real')) return;
    fin.insertAdjacentHTML('afterend', cgBoard());
  }
  if (ON) {
    api('GET', '/api/v1/games/campus').then(function (r) { if (r && r.ids) cg = r; });
    D.addEventListener('DOMContentLoaded', cgSeam);
    D.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#cg-view [data-cg]')) setTimeout(paintCgBoard, 0); });
  }

  W.JG_GAMES = { on: ON, me: me, bots: [['cpu', 1200]], mode: mode, shopOk: shopOk, hub: hub, go: go, done: done, ensureCpu: ensureCpu, words: function () { return T; } };
})();
