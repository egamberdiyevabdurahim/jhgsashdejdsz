/* Jamals Global runtime: JIA's recordings inside a lesson (P15; SPEC-lessons §9.5, C-14; the owner's D-1 "yes", 18 Oct 2026). Not design
 * code. Loaded by src/server/pages.ts for a live, non-demo student only with VIDEO_LESSONS on (inside the lessons part), before
 * jg-lessons.js (the phone) and jg-lessons-desktop.js (the laptop), whose readers call it:
 *   slot(v, lessonId)       where a clip goes (under its piece) or the full recording ("Toʻliq dars yozuvi", under the first screen)
 *   mount(host, L, lessonId) after each render: the clip's block, kept between renders, so a playing video keeps playing
 *   open(L)                 C-14: every clip of the lesson's pieces has played 80 % (the reader's test button waits for it)
 *   gate(L, lang)           the line under that button while it waits
 * NEVER AUTOPLAYED: nothing downloads until she taps "Videoni koʻrish" (the file's size is said before; a large file or a phone on
 * mobile data gets a Wi-Fi hint). THE LESSON ALWAYS READS WITHOUT THE VIDEO: the clip sits under the piece's text; a clip that fails
 * to load says so and the lesson goes on. What was played (HTMLMediaElement.played, never what was skipped) goes to
 * POST /api/v1/lessons/<id>/watch every 15 s of playing, on pause, at the end and when the page is hidden; the server counts it.
 * A recording she may not watch ({ locked }) is one quiet line, no button, no price. Every word in en, uz (U+02BB, U+02BC) and ru,
 * marked data-no-i18n. window.JG_VIDEO: slot, mount, open, gate, words(lang), mb(bytes, lang), clock(s), large(bytes).
 * tests/unit/video/page.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_VIDEO) return;

  var T = {
    en: { clip: 'Video', whole: 'Full lesson recording', watch: 'Watch the video', by: 'Teacher: ', mb: 'MB',
      wifi: function (m) { return 'A large file (about ' + m + ' MB): better on Wi‑Fi.'; }, cell: 'You seem to be on mobile data: the video uses it.',
      gate: function (p) { return 'The test opens once you have watched 80 % of the video · watched ' + p + ' %'; }, gateAll: 'The test opens once you have watched 80 % of each video in this lesson.',
      seen: 'Video watched ✓', optional: 'Optional: everything you need is in the lesson’s text.',
      locked: 'This lesson’s video is for JIA Online Premium students. The lesson works fully without it.',
      failed: 'The video did not load. The lesson works without it.', watchFirst: 'Watch the lesson’s videos first: the test opens after 80 % of each.' },
    uz: { clip: 'Video', whole: 'Toʻliq dars yozuvi', watch: 'Videoni koʻrish', by: 'Oʻqituvchi: ', mb: 'MB',
      wifi: function (m) { return 'Katta fayl (taxminan ' + m + ' MB): Wi‑Fi orqali koʻrgan maʼqul.'; }, cell: 'Mobil internetdasiz shekilli: video uni sarflaydi.',
      gate: function (p) { return 'Test videoning 80 foizi koʻrilgach ochiladi · koʻrildi: ' + p + ' %'; }, gateAll: 'Test bu darsdagi har bir videoning 80 foizi koʻrilgach ochiladi.',
      seen: 'Video koʻrildi ✓', optional: 'Ixtiyoriy: kerakli hamma narsa dars matnida bor.',
      locked: 'Bu dars videosi JIA Online Premium oʻquvchilari uchun. Dars videosiz ham toʻliq ishlaydi.',
      failed: 'Video yuklanmadi. Dars videosiz ham ishlaydi.', watchFirst: 'Avval dars videolarini koʻring: test har birining 80 foizi koʻrilgach ochiladi.' },
    ru: { clip: 'Видео', whole: 'Полная запись урока', watch: 'Смотреть видео', by: 'Преподаватель: ', mb: 'МБ',
      wifi: function (m) { return 'Большой файл (около ' + m + ' МБ): лучше смотреть по Wi‑Fi.'; }, cell: 'Похоже, у вас мобильный интернет: видео расходует трафик.',
      gate: function (p) { return 'Тест откроется, когда вы посмотрите 80 % видео · просмотрено ' + p + ' %'; }, gateAll: 'Тест откроется, когда вы посмотрите 80 % каждого видео этого урока.',
      seen: 'Видео просмотрено ✓', optional: 'Необязательно: всё нужное есть в тексте урока.',
      locked: 'Видео этого урока — для учеников JIA Online Premium. Урок полностью работает и без него.',
      failed: 'Видео не загрузилось. Урок работает и без него.', watchFirst: 'Сначала посмотрите видео урока: тест откроется после 80 % каждого.' }
  };
  /* a file this large (bytes) gets the Wi-Fi hint whatever the connection says */
  var LARGE = 4e6, SEND_MS = 15000;

  function lang() { var l = W.JG_I18N && W.JG_I18N.lang ? W.JG_I18N.lang() : (B.engine && B.engine.lang) || 'en'; return T[l] ? l : 'en'; }
  function words(l) { return T[l || lang()] || T.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mb(b, l) { var m = b / 1e6, s = m >= 10 ? String(Math.round(m)) : (Math.round(m * 10) / 10).toFixed(1); return l === 'en' ? s : s.replace('.', ','); }
  function clock(s) { s = Math.max(0, Math.round(+s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function cellular() { var c = W.navigator && W.navigator.connection; return !!c && (c.saveData === true || c.type === 'cellular' || /(^|-)(2g|3g)$/.test(String(c.effectiveType || ''))); }
  function large(b) { return (+b || 0) >= LARGE; }
  function pct(f) { return Math.floor(Math.min(1, +f || 0) * 100); }

  var C = {};                                                                // clip id -> { v, lesson, node, video, timer, sent, busy }
  function playable(v) { return !!v && !v.locked && !!v.url && !!v.id; }
  function watched(v) { var c = C[v.id]; return c ? c.v.watched : v.watched || 0; }
  function clips(L) { var out = []; ((L && L.pieces) || []).forEach(function (p) { if (playable(p.video) && p.video.kind === 'clip') out.push(p.video); }); return out; }
  function open(L) { return clips(L).every(function (v) { return watched(v) >= (v.need || 0.8); }); }
  function gate(L, l) { var x = words(l), cs = clips(L); if (!cs.length || open(L)) return ''; return cs.length === 1 ? x.gate(pct(watched(cs[0]))) : x.gateAll; }

  function slot(v, lessonId) {
    if (!v) return '';
    var x = words();
    if (v.locked) return '<p class="jgv-lock" data-no-i18n>' + esc(x.locked) + '</p>';
    if (!playable(v)) return '';
    return '<div class="jgv-slot" data-jgv="' + esc(v.id) + '" data-jgv-lesson="' + esc(lessonId) + '"></div>';
  }
  function head(v, x, l) {
    return '<div class="jgv-k"><b>' + esc(v.kind === 'whole' ? x.whole : x.clip) + '</b><span>' + esc(clock(v.duration_s) + ' · ' + mb(v.bytes, l) + ' ' + x.mb) + '</span></div>'
      + (v.teacher ? '<p class="jgv-by" translate="no">' + esc(x.by + v.teacher) + '</p>' : '');
  }
  function build(v, lessonId) {
    var l = lang(), x = words(l), n = D.createElement('div');
    n.className = 'jgv jgv-' + (v.kind === 'whole' ? 'whole' : 'clip'); n.setAttribute('data-no-i18n', '');
    var hint = large(v.bytes) ? x.wifi(mb(v.bytes, l)) : cellular() ? x.cell : '';
    n.innerHTML = head(v, x, l)
      + '<button class="jgv-go" type="button"' + (v.poster ? ' style="background-image:url(\'' + esc(v.poster) + '\')"' : '') + '><span class="jgv-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="jgv-gol">' + esc(x.watch) + '</span></button>'
      + (hint ? '<p class="jgv-hint">' + esc(hint) + '</p>' : '')
      + (v.kind === 'whole' ? '<p class="jgv-hint">' + esc(x.optional) + '</p>' : '<p class="jgv-gate" role="status"></p>');
    var c = C[v.id] = { v: v, lesson: lessonId, node: n, video: null, timer: 0, sent: 0, busy: false };
    n.querySelector('.jgv-go').addEventListener('click', function () { play(c); });
    paintGate(c);
    return c;
  }
  function play(c) {
    if (c.video) return;
    var v = c.v, l = lang(), btn = c.node.querySelector('.jgv-go'), el = D.createElement('video');
    el.controls = true; el.preload = 'metadata'; el.setAttribute('playsinline', ''); el.setAttribute('controlslist', 'nodownload'); el.className = 'jgv-v';
    if (v.poster) el.poster = v.poster;
    el.src = v.url;
    (v.captions || []).forEach(function (t) { var tr = D.createElement('track'); tr.kind = 'subtitles'; tr.srclang = t.lang; tr.label = t.label; tr.src = t.url; if (t.lang === l) tr.default = true; el.appendChild(tr); });
    el.addEventListener('timeupdate', function () { if (Date.now() - c.sent >= SEND_MS) send(c); });
    el.addEventListener('pause', function () { send(c); });
    el.addEventListener('ended', function () { send(c); });
    el.addEventListener('error', function () { var p = c.node.querySelector('.jgv-err'); if (!p) { p = D.createElement('p'); p.className = 'jgv-err'; p.textContent = words().failed; el.parentNode.insertBefore(p, el.nextSibling); } });
    btn.parentNode.replaceChild(el, btn);
    c.video = el;
    var pr = el.play(); if (pr && pr.catch) pr.catch(function () {});           // her own tap started it: never autoplay
  }
  function ranges(el) { var out = [], p = el.played; for (var i = 0; p && i < p.length; i++) out.push([Math.round(p.start(i) * 100) / 100, Math.round(p.end(i) * 100) / 100]); return out; }
  function send(c) {
    if (!c.video || c.busy) return;
    var played = ranges(c.video); if (!played.length) return;
    c.busy = true; c.sent = Date.now();
    var before = c.v.watched || 0;
    fetch('/api/v1/lessons/' + encodeURIComponent(c.lesson) + '/watch', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid || '' }, body: JSON.stringify({ clip: c.v.id, played: played.slice(0, 200) }) })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) {
        c.busy = false;
        if (!j || typeof j.watched !== 'number') return;
        c.v.watched = Math.max(before, j.watched);
        paintGate(c); refresh();
      });
  }
  function paintGate(c) {
    var g = c.node.querySelector('.jgv-gate'); if (!g) return;
    var x = words(), w = c.v.watched || 0;
    g.textContent = w >= (c.v.need || 0.8) ? x.seen : x.gate(pct(w)); g.classList.toggle('done', w >= (c.v.need || 0.8));
  }
  /* the reader's test buttons that wait for the clips, and their line */
  var LAST = { host: null, L: null };
  function refresh() {
    var h = LAST.host, L = LAST.L; if (!h || !L) return;
    var ok = open(L);
    [].forEach.call(h.querySelectorAll('[data-jgv-gate]'), function (b) { b.disabled = !ok; if (ok) b.removeAttribute('aria-disabled'); else b.setAttribute('aria-disabled', 'true'); });
    [].forEach.call(h.querySelectorAll('.jgv-wait'), function (p) { p.textContent = gate(L); p.hidden = ok; });
  }
  function mount(host, L, lessonId) {
    if (!host) return;
    css();
    [].forEach.call(host.querySelectorAll('.jgv-slot[data-jgv]'), function (s) {
      var id = s.getAttribute('data-jgv'), v = null;
      ((L && L.pieces) || []).forEach(function (p) { if (p.video && p.video.id === id) v = p.video; });
      if (!v && L && L.recording && L.recording.id === id) v = L.recording;
      if (!v) return;
      var c = C[id];
      if (c) { c.v.url = v.url; c.v.captions = v.captions; v.watched = Math.max(v.watched || 0, c.v.watched || 0); c.v = v; }   // fresh URLs from a new read keep what was played
      else c = build(v, lessonId || s.getAttribute('data-jgv-lesson'));
      s.appendChild(c.node); paintGate(c);
    });
    LAST.host = host; LAST.L = L; refresh();
  }
  D.addEventListener('visibilitychange', function () { if (D.visibilityState === 'hidden') Object.keys(C).forEach(function (k) { if (C[k].video && !C[k].video.paused) send(C[k]); }); });

  var cssDone = false;
  function css() {
    if (cssDone || D.getElementById('jgv-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jgv-css';
    s.textContent = [
      '.jgv{display:grid;gap:8px;padding:12px;border-radius:16px;background:#f5f8f6;font-family:var(--font)}',
      '.jgv-k{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.jgv-k b{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2)}.jgv-k span{font-size:12px;font-weight:700;color:var(--muted)}',
      '.jgv-by{font-size:13px;font-weight:700;color:var(--ink)}',
      '.jgv-go{position:relative;display:grid;place-items:center;gap:6px;width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#14201a center/cover no-repeat;color:#fff;cursor:pointer;overflow:hidden;font:inherit}',
      '.jgv-go:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,20,15,.05),rgba(10,20,15,.55))}',
      '.jgv-play{position:relative;z-index:1;display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.95);box-shadow:0 6px 18px rgba(0,0,0,.25)}.jgv-play svg{width:24px;height:24px;fill:#14201a;margin-left:3px}',
      '.jgv-gol{position:absolute;z-index:1;left:12px;bottom:10px;font-size:14px;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.4)}',
      '.jgv-go:focus-visible{outline:2px solid var(--accent);outline-offset:3px}',
      '.jgv-v{display:block;width:100%;aspect-ratio:16/9;border-radius:12px;background:#0b1510}',
      '.jgv-hint,.jgv-gate,.jgv-wait{font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '.jgv-gate.done{color:var(--accent);font-weight:800}',
      '.jgv-err{font-size:12.5px;font-weight:700;color:#b0402f}',
      '.jgv-lock{padding:10px 12px;border-radius:14px;background:#f5f8f6;font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '[data-jgv-gate][disabled]{opacity:.45;cursor:not-allowed}'
    ].join('\n');
    D.head.appendChild(s);
  }

  W.JG_VIDEO = { slot: slot, mount: mount, open: open, gate: gate, words: words, mb: mb, clock: clock, large: large, refresh: refresh };
})();
