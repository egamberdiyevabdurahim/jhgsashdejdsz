/* Jamals Global runtime: IELTS Listening's player and typed answer (P15, the owner's 18 Oct 2026 "add"; .superpowers/p15/listening-format.md
 * §5). Loaded by src/server/pages.ts for a live, non-demo student, on the phone and on the laptop, only with LISTENING on. Not design code:
 * a new control the design does not draw, in the design's own tokens (Raleway, --ink, --accent, --track, --muted, its 14-16 px radii, the
 * near-black round button of its result card). Every word in en, uz (U+02BB) and ru, marked data-no-i18n.
 *  THE PLAYER  player(audio, key, lang): play / pause and a progress bar, NO seeking (no scrubber, no keys); `audio.plays` plays: 1 in a
 *              test ("plays once, as in the exam"), 2 in practice and homework ("1 replay left", then "no replays left"). A play counts when
 *              it starts from the beginning; pause and continue are the same play. preload="none": nothing is fetched before she presses
 *              play; the browser asks the server for byte ranges (the clip route answers 206), so it starts at once on a slow line. A play that
 *              fails before any sound is not counted ("the audio did not load"). One clip sounds at a time; a player that leaves the page stops.
 *              Its state is kept by `key` (the question's serving), so a redraw of the question keeps her plays and her place.
 *  THE ANSWER  typed(q, done, lang): a text field for a typed gap, its word limit in her language under it, "Answer" (the host page sends it:
 *              text(root)); over the limit it says so and does not send (the server marks an answer over the limit wrong, as IELTS does).
 *  THE REVIEW  script(s, lang): the transcript, only after her answer (the server sends it with the result, never before).
 * window.JG_LISTEN: player, typed, text, script, words, sync, state(key). tests/unit/listening/jg-listening.test.ts. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.JG_LISTEN) return;
  function RU_N(n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; }
  var T = {
    en: { play: 'Play', pause: 'Pause', resume: 'Continue', replay: 'Listen again', once: 'Plays once, as in the exam', left: '1 replay left', none: 'No replays left', played: 'Played',
      failed: 'The audio did not load. Check the internet and press play again.', loading: 'Loading…', transcript: 'Transcript', ph: 'Type your answer', send: 'Answer',
      lim: function (n, num) { return 'No more than ' + (n === 1 ? 'one word' : n + ' words') + (num ? ' and/or a number' : ''); }, over: 'Too many words for this gap', yours: 'Your answer:' },
    uz: { play: 'Tinglash', pause: 'Pauza', resume: 'Davom ettirish', replay: 'Qayta tinglash', once: 'Imtihondagidek bir marta eshittiriladi', left: 'Yana 1 marta tinglash mumkin', none: 'Qayta tinglash qolmadi', played: 'Tinglandi',
      failed: 'Audio yuklanmadi. Internetni tekshirib, yana bosing.', loading: 'Yuklanmoqda…', transcript: 'Yozuv matni', ph: 'Javobingizni yozing', send: 'Javob berish',
      lim: function (n, num) { return 'Koʻpi bilan ' + n + ' ta soʻz' + (num ? ' va/yoki raqam' : ''); }, over: 'Bu boʻshliq uchun soʻz koʻp', yours: 'Sizning javobingiz:' },
    ru: { play: 'Слушать', pause: 'Пауза', resume: 'Продолжить', replay: 'Прослушать ещё раз', once: 'Звучит один раз, как на экзамене', left: 'Можно прослушать ещё 1 раз', none: 'Повторов больше нет', played: 'Прослушано',
      failed: 'Аудио не загрузилось. Проверьте интернет и нажмите ещё раз.', loading: 'Загрузка…', transcript: 'Текст записи', ph: 'Введите ответ', send: 'Ответить',
      lim: function (n, num) { return 'Не больше ' + n + ' ' + RU_N(n, 'слова', 'слов', 'слов') + (num ? ' и/или числа' : ''); }, over: 'Слишком много слов для этого пропуска', yours: 'Ваш ответ:' }
  };
  function words(l) { var x = l || (W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : 'en'); return T[x] || T.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clock(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  /* ---- the player ---- */
  var S = {}, A = null, cur = null;                                        // state by key; the one audio element; the key it plays
  function audio() {
    if (A) return A;
    A = new Audio(); A.preload = 'none';
    A.addEventListener('timeupdate', function () { var s = cur && S[cur]; if (!s) return; s.t = A.currentTime; s.far = Math.max(s.far || 0, s.t || 0); if (!el(cur)) return stop(); paint(cur); });
    A.addEventListener('playing', function () { var s = cur && S[cur]; if (s) { s.wait = false; s.heard = true; paint(cur); } });
    A.addEventListener('waiting', function () { var s = cur && S[cur]; if (s) { s.wait = true; paint(cur); } });
    A.addEventListener('ended', function () { var s = cur && S[cur]; if (!s) return; s.far = Math.max(s.far || 0, s.t || 0, s.dur || 0, +A.duration || 0); s.playing = false; s.wait = false; s.t = 0; s.done = true; paint(cur); });
    A.addEventListener('error', function () {
      var s = cur && S[cur]; if (!s || !A.getAttribute('src')) return;
      if (!s.heard) s.used = Math.max(0, s.used - 1);                     // nothing was heard: the play is not counted
      s.playing = false; s.wait = false; s.err = true; paint(cur);
    });
    return A;
  }
  function el(key) { var all = D.querySelectorAll('.jgli[data-k]'); for (var i = 0; i < all.length; i++) if (all[i].getAttribute('data-k') === key) return all[i]; return null; }
  function stop() { if (A && cur) { try { A.pause(); } catch (e) {} var s = S[cur]; if (s) { s.playing = false; s.wait = false; } } cur = null; }
  function state(key, a) { return S[key] || (S[key] = { used: 0, t: 0, playing: false, done: false, err: false, heard: false, wait: false, plays: a ? Math.max(1, a.plays | 0) : 1, dur: a ? +a.dur || 0 : 0, src: a ? a.src : '' }); }
  function left(s) { return s.plays - s.used; }
  function label(s, x) {
    if (s.err) return x.failed;
    if (s.plays <= 1) return s.used >= 1 && s.done ? x.played : x.once;    // paused partway is still the one play: "plays once"
    var replays = s.used === 0 ? s.plays - 1 : s.plays - s.used;          // the replays after the play she is on (or about to start)
    return replays > 0 ? x.left : x.none;
  }
  function icon(s) {
    if (s.playing) return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>';
    if (s.used > 0 && s.done && left(s) > 0) return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4.6 4.5v5h5"fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (s.used > 0 && (s.done || (!s.playing && s.t === 0)) && left(s) <= 0) return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2 8.8-9.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z"/></svg>';
  }
  function canPress(s) { return s.playing || (s.t > 0 && !s.done) || left(s) > 0; }
  function btnLabel(s, x) { return s.playing ? x.pause : s.t > 0 && !s.done ? x.resume : s.used > 0 ? x.replay : x.play; }
  function inner(key) {
    var s = S[key], x = words(), d = s.dur || (A && cur === key && isFinite(A.duration) ? A.duration : 0), pct = d > 0 ? Math.min(100, s.t / d * 100) : 0, on = canPress(s);
    return '<button type="button" class="jgli-play' + (s.playing ? ' on' : '') + '" aria-label="' + esc(btnLabel(s, x)) + '"' + (on ? '' : ' disabled aria-disabled="true"') + '>' + icon(s) + '</button>'
      + '<div class="jgli-main"><div class="jgli-bar" role="progressbar" aria-label="' + esc(x.play) + '" aria-valuemin="0" aria-valuemax="' + Math.round(d) + '" aria-valuenow="' + Math.round(s.t) + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>'
      + '<div class="jgli-meta"><span class="jgli-t">' + (s.wait && s.playing ? esc(x.loading) : clock(s.t) + ' / ' + clock(d)) + '</span><span class="jgli-n' + (s.err ? ' err' : '') + '" role="status">' + esc(label(s, x)) + '</span></div></div>';
  }
  function paint(key) { var e = el(key); if (e) e.innerHTML = inner(key); }
  /** The player for a question's clip ({src, plays, dur}), kept by `key` (the question's serving): '' when there is none. */
  function player(a, key) {
    if (!a || !a.src || !key) return '';
    css(); state(key, a);
    return '<div class="jgli" data-k="' + esc(key) + '" data-no-i18n>' + inner(key) + '</div>';
  }
  function press(key) {
    var s = S[key]; if (!s) return;
    var au = audio();
    if (cur === key && s.playing) { au.pause(); s.playing = false; return paint(key); }
    if (cur && cur !== key) stop();
    if (s.t > 0 && !s.done && cur === key && au.getAttribute('src') === s.src) { s.playing = true; s.err = false; paint(key); return void au.play().catch(function () {}); }
    if (left(s) <= 0) return;
    s.used++; s.t = 0; s.done = false; s.err = false; s.heard = false; s.playing = true; s.wait = true; cur = key;
    if (au.getAttribute('src') !== s.src) au.setAttribute('src', s.src); else try { au.currentTime = 0; } catch (e) {}
    paint(key);
    var p = au.play(); if (p && p.catch) p.catch(function () { if (cur !== key) return; if (!s.heard) s.used = Math.max(0, s.used - 1); s.playing = false; s.wait = false; s.err = true; paint(key); });
  }

  /* ---- the typed answer ---- */
  var NUM = /^[£$€]?\d[\d.,:/]*[%£$€]?$/;                               // as src/engine/content/typed.ts (P16: a sign after the number too)
  function count(v, num) {
    var w = 0, n = 0;
    String(v || '').trim().split(/\s+/).forEach(function (t) { t = t.replace(/^[("'«“[]+|[)"'»”\].,;:!?]+$/g, ''); if (!t || /^[£$€]$/.test(t)) return; if (num && n === 0 && NUM.test(t)) n++; else w++; });
    return w;
  }
  /** A text field for a typed gap (q.typed: {words, number}); `done` ({text, ok}) once answered: her answer, read-only, right or wrong. */
  function typed(q, done) {
    if (!q || !q.typed) return '';
    css();
    var x = words(), w = q.typed.words | 0 || 1, num = !!q.typed.number, lim = '<p class="jgli-lim" data-no-i18n>' + esc(x.lim(w, num)) + '</p>';
    if (done) return '<div class="jgli-typed done" data-no-i18n><p class="jgli-yours ' + (done.ok ? 'ok' : 'bad') + '"><small>' + esc(x.yours) + '</small> ' + esc(done.text || '—') + '</p></div>';
    return '<div class="jgli-typed" data-w="' + w + '" data-num="' + (num ? 1 : 0) + '" data-no-i18n>'
      + '<input class="jgli-in" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="60" enterkeyhint="send" aria-label="' + esc(x.ph) + '" placeholder="' + esc(x.ph) + '">'
      + lim + '<p class="jgli-over" role="alert" hidden>' + esc(x.over) + '</p>'
      + '<button type="button" class="jgli-send dg-go" disabled>' + esc(x.send) + '</button></div>';
  }
  /** What she typed in the field under `root` ('' for none). */
  function text(root) { var i = root && root.querySelector ? root.querySelector('.jgli-in') : null; return i ? String(i.value || '').trim() : ''; }
  function check(input) {
    var box = input.closest ? input.closest('.jgli-typed') : null; if (!box) return;
    var v = String(input.value || '').trim(), over = !!v && count(v, box.getAttribute('data-num') === '1') > (+box.getAttribute('data-w') || 1);
    var b = box.querySelector('.jgli-send'), o = box.querySelector('.jgli-over');
    if (b) b.disabled = !v || over;
    if (o) o.hidden = !over;
    input.setAttribute('aria-invalid', over ? 'true' : 'false');
  }

  /* ---- the review ---- */
  /** The transcript after her answer, one turn a line ("WOMAN: …"); '' when there is none. */
  function script(s) {
    if (!s) return '';
    css();
    var x = words();
    return '<details class="jgli-tr" data-no-i18n><summary>' + esc(x.transcript) + '</summary><div>' + String(s).split('\n').map(function (l) {
      var m = /^([A-Z][A-Z .'-]{0,24}):\s*(.*)$/.exec(l); return '<p>' + (m ? '<b>' + esc(m[1]) + ':</b> ' + esc(m[2]) : esc(l)) + '</p>';
    }).join('') + '</div></details>';
  }

  D.addEventListener('click', function (e) { var b = e.target && e.target.closest ? e.target.closest('.jgli-play') : null; if (!b || b.disabled) return; var p = b.closest('.jgli'); if (p) press(p.getAttribute('data-k')); });
  D.addEventListener('input', function (e) { if (e.target && e.target.classList && e.target.classList.contains('jgli-in')) check(e.target); });
  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target || !e.target.classList || !e.target.classList.contains('jgli-in')) return;
    e.preventDefault(); check(e.target);
    var b = e.target.closest('.jgli-typed').querySelector('.jgli-send'); if (b && !b.disabled) b.click();
  });

  var cssDone = false;
  function css() {
    if (cssDone || D.getElementById('jgli-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jgli-css';
    s.textContent = [
      '.jgli{display:grid;grid-template-columns:48px 1fr;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:#f5f8f6;box-shadow:inset 0 0 0 1px var(--line,#e4ece7);font-family:var(--font)}',
      '.jgli-play{display:grid;place-items:center;width:48px;height:48px;border:0;border-radius:999px;background:#14201a;color:#fff;cursor:pointer;padding:0;touch-action:manipulation}',
      '.jgli-play svg{width:22px;height:22px;fill:currentColor}.jgli-play.on{background:var(--accent,#207251)}',
      '.jgli-play:disabled{background:var(--track,#e2ebe5);color:var(--muted,#587066);cursor:default}',
      '.jgli-play:focus-visible{outline:3px solid var(--focus,#2b9067);outline-offset:2px}',
      '.jgli-main{display:grid;gap:7px;min-width:0}',
      '.jgli-bar{height:6px;border-radius:3px;background:var(--track,#e2ebe5);overflow:hidden}.jgli-bar i{display:block;height:100%;border-radius:3px;background:var(--accent,#207251);transition:width .25s linear}',
      '.jgli-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 10px;font-size:12.5px;font-weight:700;line-height:1.3;color:var(--muted,#587066)}',
      '.jgli-t{font-variant-numeric:tabular-nums}.jgli-n{color:var(--ink,#10271e)}.jgli-n.err{color:var(--danger,#b0402f)}',
      '.jgli-typed{display:grid;gap:8px}',
      '.jgli-in{width:100%;box-sizing:border-box;height:52px;padding:0 16px;border:0;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--line,#e4ece7);font:700 17px var(--font);color:var(--ink,#10271e)}',
      '.jgli-in:focus{outline:none;box-shadow:inset 0 0 0 2px var(--accent,#207251)}.jgli-in[aria-invalid="true"]{box-shadow:inset 0 0 0 2px var(--danger,#b0402f)}',
      '.jgli-lim{margin:0;font-size:12.5px;font-weight:700;color:var(--muted,#587066)}.jgli-over{margin:0;font-size:13px;font-weight:800;color:var(--danger,#b0402f)}',
      '.jgli-yours{margin:0;padding:12px 14px;border-radius:14px;font-size:16px;font-weight:800;color:var(--ink,#10271e);background:#f5f8f6;overflow-wrap:anywhere}',
      '.jgli-yours small{display:block;font-size:12px;font-weight:700;color:var(--muted,#587066)}.jgli-yours.ok{background:var(--accent-soft,#d9f5e6)}.jgli-yours.bad{background:#fbecea}',
      '.jgli-tr{border-radius:14px;background:#f5f8f6;padding:10px 14px;font-family:var(--font)}',
      '.jgli-tr summary{cursor:pointer;font-size:13.5px;font-weight:800;color:var(--accent,#207251);list-style-position:inside}',
      '.jgli-tr div{display:grid;gap:6px;margin-top:8px;max-height:280px;overflow:auto}.jgli-tr p{margin:0;font-size:14px;line-height:1.5;color:var(--ink,#10271e);overflow-wrap:anywhere}'
    ].join('\n');
    D.head.appendChild(s);
  }

  W.JG_LISTEN = { player: player, typed: typed, text: text, script: script, words: words, sync: function () { if (cur && !el(cur)) stop(); },
    state: function (key) { var s = S[key]; return s ? { used: s.used, plays: s.plays, playing: s.playing, t: s.t } : null }, count: count,
    /* P16 [p15#10]: the seconds of the clip she heard (the furthest point her play reached; the whole clip once it ended), sent with her
     * answer so a guess without listening is "too fast" (src/engine/too-fast.ts LISTEN_MIN_MS); 0 before any play */
    heard: function (key) { var s = S[key]; return s ? Math.round((s.far || 0) * 10) / 10 : 0; } };
})();
