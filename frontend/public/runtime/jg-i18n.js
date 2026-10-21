/*
 * jg-i18n.js: the student app's UI in Uzbek and Russian (owner 6 Oct 2026, P4h H1: "ikkalasi ham", the rest of the app's English translated;
 * D20 L, 4 Oct: "some students don't understand English"). A runtime layer instead of thousands of design-line edits: the design keeps
 * writing its English and this file swaps it, on the page, for the student's language. Loaded by src/server/pages.ts for a live student only
 * (a boot with an engine snapshot), after jg-runtime.js and before the design scripts. The demo family and /preview never load it and keep
 * the design's English; an English student loads no dictionary and nothing on the page changes.
 *
 * THE LANGUAGE, one per account. While the diagnostic is not done: its first screen's choice (the draft answer m0_roadmap_language in
 * jg.diag.v1, P4g L) when there is one; otherwise the snapshot's `lang` (profile.roadmap_lang, English when none). The roadmap reads the same
 * (the page's rmL / JG_RMLANG, M:023:239), so the UI and the roadmap never disagree. <html lang> follows (src/server/pages.ts writes it too)
 * and so does Settings' App language switch (jia.settings.lang, set here before Settings reads it). JG_I18N.choose(l), called by that switch
 * (M:011:75, D:015:72): the commit `language` (the profile, the stored answer and the roadmap, re-rendered together, in
 * src/server/engine/commit.ts), the draft's choice too while the diagnostic is not done (its first screen then opens in it), then the page
 * reloads in the new language. The diagnostic's first-screen choice switches the page at once, without a reload.
 *
 * THE DICTIONARY: /runtime/i18n/uz.json and /runtime/i18n/ru.json (?v= this script's own v), fetched only when the language is uz or ru.
 *   { "version": 1,
 *     "exact":    { "<the design's English>": "<the translation>", ... },
 *     "patterns": [ { "re": "^(\\d+)% complete$", "to": "$1% bajarildi" }, ... ] }
 *   exact     The keys are the design's exact English as it reads once whitespace is collapsed: every run of spaces, tabs and line breaks is
 *             one space and the ends are trimmed (a no-break space stays). A text node keeps its own leading and trailing whitespace.
 *   patterns  Tried in order when no exact key matches. `re` is a JavaScript regular expression source, compiled with the u flag and anchored
 *             by its author (^...$), run on the same collapsed text; `to` is its replacement ($$ is a dollar sign), whose $1, $2 ... put
 *             back what was captured: translated when that part is itself an entry (an exact key, else a pattern whose own parts stay as
 *             written: one level), so "Gold League" reads «Oltin ligasi»; a number, a name or the engine's words stay as written.
 *   keep      Optional, on a pattern: the groups put back as written even when one is itself an entry, because they hold a person's name or
 *             what someone wrote ("Hi {name}!", "Poll: {question}", "Reel by {name}: {caption}"): { "re": "^Hi (.*?)! …$", "keep": [1] }.
 *             A pattern that does not compile, whose `to` names a group its `re` lacks, or whose `keep` is not a list of its groups, is dropped.
 *   Both apply to text nodes and to five attributes: placeholder, aria-label, title, alt, and the value of <input type=button|submit|reset>.
 *   A string with no entry stays English. Uzbek is Latin, with U+02BB in oʻ and gʻ and U+02BC for the tutuq belgisi.
 *
 * TEXT THE DESIGN READS BACK. Home's score bubbles' labels and the screen-reader score list (#sr) are keys into the design's own value and
 * maximum maps; since the P4h review each carries its key, the design's English, in data-k (set where they are built, M:002:58,66 and
 * D:001:84,90; read by syncHome, M:023:1497-1499 and D:022:1499-1501), so their text is translated like any other. Text the design
 * measures before it shows it goes through JG_I18N.text(s) first (the roadmap chart's callout, M:003:164 and D:001:340, fix W6).
 *
 * NEVER TRANSLATED (HARD, NOTEXT, USER and UI_IN_USER below):
 *   1. an element marked [data-no-i18n], and everything inside it;
 *   2. what is not the page's own words: script, style, noscript and template; and the text inside a textarea, code, pre and an editable
 *      element ([contenteditable]) (NOTEXT: their placeholder and labels are the design's, and are translated). An input's typed value is
 *      never read or written (only a button input's value attribute is translated);
 *   3. what is already in the student's language from its own source: the diagnostic (#dg-view: jg-diag.js's words; its English check stays
 *      English), the parent check (#jp-view: its own uz/ru/en switch), and every element that names its own language with a lang attribute
 *      (the diagnostic's language chips, the reading passage, the AI notice). The engine's strings arrive in the student's language already
 *      and so match no English key;
 *   4. what people wrote (USER): a chat or direct message with its sender and quote (.cm-bub, .cm-quote), a name in the chat list (.cm-nm),
 *      a post (.po-text) and its poll's question and options (.poll-q, .poll-o, .poll-t), a comment with its author (.cmt-b), a reel's
 *      caption (.rl-cap), Ask Jamol's questions and answers (.jm-bub: in the language asked), the journal (.jn-e p, .jn-seed blockquote,
 *      .jl-chat), a letter (.fy-letter p, .lt-body) and the student's own name (.who h1, .sb-name, .tb-mn b, .set-me b, .pc-name). Inside
 *      those, the design's own labels are translated (UI_IN_USER: a role tag .cm-role, a time .cm-time, "This message was deleted" .cm-del,
 *      "Solve together" .jx-solve, a lesson button .jm-go). A surface where people write that goes live later (a club a student founds,
 *      once a JG admin can approve it) adds its class here; where the design writes a name or what someone wrote into a sentence of its
 *      own ("Hi {name}!", "You: {message}", "Poll: {question}"), the pattern keeps that part as written (`keep`);
 *   5. its own output: a text node or attribute that still holds what this file wrote is never translated again (and no translation is
 *      itself an English key or a pattern's English: tests/unit/jg-i18n-dict.test.ts).
 *   6. the content of a served item (a stem, its options, the answer and its why, a passage), on every screen: the dictionary holds pieces
 *      of the design's sentences ("stay", "open") that are also an English item's option. The diagnostic's checks and the reading check are
 *      inside #dg-view; the task quiz and the CAT's own screens mark each item container [data-no-i18n] where they draw it
 *      (public/runtime/jg-checks.js; tests/unit/jg-i18n-items.test.ts).
 *
 * WHEN. Once the dictionary is in: one walk of the page, then a MutationObserver (nodes added, text changed, the five attributes changed)
 * whose records are batched and translated once per animation frame, before that frame is painted. A text alone (el.textContent = "…", a
 * text node's data) is translated at once, in the observer's own callback, which runs right after the script that wrote it: a text written
 * INSIDE an animation frame would otherwise be painted in English for that frame, and a counter that changes every frame mostly in English
 * (the Dome's "7% complete" while it counts up after a task: the P5 wave-3 walk, 10 Oct 2026). While a uz/ru dictionary loads, the body
 * is hidden (1.5 s at most) so English never flashes. JG_I18N.stats() is the cost: nodes visited, strings translated, ms per walk and batch.
 * public/runtime/jg-i18n.css is loaded with the dictionary (a uz/ru student) for overflow rules scoped to html[lang=uz|ru]: the QA pass
 * (7 Oct 2026) shortened in the dictionaries what did not fit; the owner-style walk the same night found five places still spilling at a
 * phone's width, fixed there (W1-W5, "owner 6 Oct P4h fix") and in shorter words (its own header says which).
 */
(function () {
  'use strict';
  var W = window, D = document, BOOT = W.JG_BOOT;
  if (!BOOT || !BOOT.engine || W.JG_I18N) return;                 // a live student only: the demo and /preview keep the design's English
  var own = Object.prototype.hasOwnProperty, LANGS = ['en', 'uz', 'ru'];
  var ME = D.currentScript, V = ((ME && /[?&]v=([^&#]+)/.exec(ME.src || '')) || [])[1] || '1';
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var HARD = '[data-no-i18n], script, style, noscript, template, #dg-view, #jp-view, [lang]:not(html)';
  var NOTEXT = 'textarea, code, pre, [contenteditable]:not([contenteditable="false"])';
  var USER = '.cm-bub, .cm-quote, .cm-nm, .po-text, .poll-q, .poll-o, .poll-t, .cmt-b, .rl-cap, .jm-bub, .jn-e p, .jn-seed blockquote, .jl-chat, .fy-letter p, .lt-body, .who h1, .sb-name, .tb-mn b, .set-me b, .pc-name';
  var UI_IN_USER = '.cm-role, .cm-time, .cm-del, .jx-solve, .jm-go';
  var ANY = HARD + ', ' + NOTEXT + ', ' + USER + ', ' + UI_IN_USER;
  var WS = /[ \t\n\r\f]+/g, LATIN = /[A-Za-z]/, WAIT_MS = 1500;
  var lang = 'en', dict = null, memo = new Map(), texts = new WeakMap(), attrsOf = new WeakMap(), loads = {};
  var obs = null, q = [], qa = [], frame = 0, waitT = 0, switching = false;
  var stats = { lang: 'en', loadMs: 0, walks: 0, walkMs: 0, firstWalkMs: 0, batches: 0, batchMs: 0, maxBatchMs: 0, nodes: 0, translated: 0 };
  var now = function () { return W.performance && W.performance.now ? W.performance.now() : Date.now(); };
  var isWs = function (c) { return c === 32 || c === 9 || c === 10 || c === 13 || c === 12; };

  /* ---------- the dictionary ---------- */
  function norm(s) { return String(s).replace(WS, ' ').replace(/^ | $/g, ''); }
  function compile(j) {
    if (!j || j.version !== 1) return null;
    var exact = new Map(), pats = [], e = j.exact && typeof j.exact === 'object' ? j.exact : {}, ps = Array.isArray(j.patterns) ? j.patterns : [];
    for (var k in e) if (own.call(e, k) && typeof e[k] === 'string') { var nk = norm(k); if (nk && e[k] !== nk) exact.set(nk, e[k]); }
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (!p || typeof p.re !== 'string' || typeof p.to !== 'string') continue;
      try {
        var re = new RegExp(p.re, 'u'), groups = new RegExp(p.re + '|', 'u').exec('').length - 1, ok = true;
        p.to.replace(/\$(\d+)/g, function (m, n) { if (+n < 1 || +n > groups) ok = false; return m; });
        var keep = null;                                            // the groups put back as written: a name, what someone wrote
        if (p.keep !== undefined) {
          if (!Array.isArray(p.keep)) ok = false;
          else for (var j = 0; j < p.keep.length; j++) { var g = p.keep[j]; if (typeof g !== 'number' || g % 1 || g < 1 || g > groups) ok = false; else (keep = keep || {})[g] = true; }
        }
        if (ok) pats.push({ re: re, to: p.to, keep: keep });
      } catch (err) { /* a pattern that does not compile is dropped */ }
    }
    return { exact: exact, pats: pats };
  }
  /** p's replacement for the match m ($$ is a dollar sign); each captured part goes through `part`, or is put back as written (no `part`, or a
   *  group p keeps). */
  function fill(p, m, part) {
    return p.to.replace(/\$(\$|\d+)/g, function (x, n) { if (n === '$') return '$'; var g = m[+n] == null ? '' : m[+n]; return part && !(p.keep && p.keep[n]) ? part(g) : g; });
  }
  function match(k, part) {
    for (var i = 0; i < dict.pats.length; i++) { var p = dict.pats[i], m = p.re.exec(k); if (m) return fill(p, m, part); }
    return null;
  }
  /** A captured part, translated when it is itself an entry ("Gold" in "Gold League", "Friday" in "Friday, today", a lesson's title): exact,
   *  else a pattern whose own parts stay as written (one level). A name, a number or the engine's words match nothing and stay as written. */
  function part(g) {
    if (!LATIN.test(g)) return g;
    var k = norm(g);
    if (!k) return g;
    var out = dict.exact.has(k) ? dict.exact.get(k) : match(k, null);
    if (out === null || out === k) return g;
    var a = 0, b = g.length;
    while (a < b && isWs(g.charCodeAt(a))) a++;
    while (b > a && isWs(g.charCodeAt(b - 1))) b--;
    return g.slice(0, a) + out + g.slice(b);
  }
  function lookup(k) {
    if (memo.has(k)) return memo.get(k);
    var out = dict.exact.has(k) ? dict.exact.get(k) : match(k, part);
    if (out === k) out = null;
    if (memo.size > 20000) memo.clear();
    memo.set(k, out);
    return out;
  }
  /** v's translation with v's own leading and trailing whitespace, or null (no entry: it stays as it is). */
  function tr(v) {
    if (!LATIN.test(v)) return null;                                // no Latin letter, no English (numbers, emoji, the engine's Cyrillic)
    var k = norm(v);
    if (!k) return null;
    var out = lookup(k);
    if (out === null) return null;
    var a = 0, b = v.length;
    while (a < b && isWs(v.charCodeAt(a))) a++;
    while (b > a && isWs(v.charCodeAt(b - 1))) b--;
    return v.slice(0, a) + out + v.slice(b);
  }

  /* ---------- the page ---------- */
  /** A week strip's day letter (M:023:866, M:023:1355: <span><small>M</small>…</span> × 7, Monday first): T and S are two days each, so it
   *  is read by its place in the strip, from the entry "M T W T F S S" (seven words, one per day). Anything else: null. */
  function day(n, v) {
    var k = norm(v), sm = n.parentElement, cell = sm && sm.parentElement, row = cell && cell.parentElement;
    if (k.length !== 1 || 'MTWFS'.indexOf(k) === -1 || !row || sm.tagName !== 'SMALL' || !dict.exact.has('M T W T F S S')) return null;
    var cells = [], c, i;
    for (c = row.firstElementChild; c; c = c.nextElementSibling) { var s = c.firstElementChild; if (s && s.tagName === 'SMALL' && s.textContent.length) cells.push(c); }
    i = cells.indexOf(cell);
    if (cells.length !== 7 || i === -1) return null;
    for (var j = 0; j < 7; j++) { var w = cells[j].firstElementChild.firstChild, r = w && texts.get(w), l = norm(r && r.out === w.data ? r.src : cells[j].firstElementChild.textContent); if (l !== 'MTWTFSS'[j]) return null; }
    var out = dict.exact.get('M T W T F S S').split(' ')[i];
    return out ? v.replace(k, out) : null;
  }
  function text(n) {
    stats.nodes++;
    var v = n.data, r = texts.get(n);
    if (r && r.out === v) return;                                   // its own output: never translated again
    var t = tr(v);
    if (t === null && v.length < 4) t = day(n, v);
    if (t === null) { if (r) texts.delete(n); return; }
    texts.set(n, { src: v, out: t }); n.data = t; stats.translated++;
  }
  function attr(el, a) {
    var v = el.getAttribute(a);
    if (!v) return;
    var rs = attrsOf.get(el), r = rs && rs[a];
    if (r && r.out === v) return;
    var t = tr(v);
    if (t === null) { if (r) delete rs[a]; return; }
    if (!rs) attrsOf.set(el, rs = {});
    rs[a] = { src: v, out: t }; el.setAttribute(a, t); stats.translated++;
  }
  function attrs(el) {
    if (!el.hasAttributes()) return;
    for (var i = 0; i < ATTRS.length; i++) attr(el, ATTRS[i]);
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.getAttribute('type') || '')) attr(el, 'value');
  }
  /** -1: never (HARD); 2: its attributes only (NOTEXT: typed or editable text); 1: what people wrote (USER); 0: the design's own words. */
  function zone(el) {
    if (!el || el.nodeType !== 1 || el.closest(HARD)) return -1;
    var n = el.closest(NOTEXT);
    if (n) return n === el && zone(el.parentElement) === 0 ? 2 : -1;
    var u = el.closest(USER);
    if (!u) return 0;
    var a = el.closest(UI_IN_USER);
    return a && u.contains(a) ? 0 : 1;
  }
  function walk(node, z) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { if (!z) text(c); continue; }
      if (c.nodeType !== 1) continue;
      var cz = z;
      if (c.matches(ANY)) {
        if (c.matches(HARD)) continue;
        if (c.matches(NOTEXT)) { if (!z) attrs(c); continue; }        // its placeholder or label, never what is typed in it
        cz = c.matches(UI_IN_USER) ? 0 : c.matches(USER) ? 1 : z;
      }
      if (!cz) attrs(c);
      walk(c, cz);
    }
  }
  function translateTree(n) {
    if (n.nodeType === 3) { if (zone(n.parentElement) === 0) text(n); return; }
    if (n.nodeType !== 1) return;
    var z = zone(n);
    if (z === -1) return;
    if (z === 2 || !z) attrs(n);
    if (z !== 2) walk(n, z);
  }
  /** A text the design wrote by itself, translated now (see WHEN): before any paint, whichever frame its script ran in. */
  function soon(n) { if (dict && n.isConnected && zone(n.parentElement) === 0) text(n); }
  function onMutations(recs) {
    var wrote = false;
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.type === 'childList') for (var j = 0; j < r.addedNodes.length; j++) { var n = r.addedNodes[j]; if (n.nodeType === 3) { soon(n); wrote = true; } else q.push(n); }
      else if (r.type === 'characterData') { soon(r.target); wrote = true; }
      else qa.push(r.target);
    }
    if (wrote && obs) obs.takeRecords();                            // the records of its own writes just now
    if (!frame && (q.length || qa.length)) frame = W.requestAnimationFrame(flush);
  }
  /** One batch per animation frame: what the design added or changed since the last frame, translated before the frame is painted. */
  function flush() {
    frame = 0;
    var nodes = q, els = qa;
    q = []; qa = [];
    if (!dict) return;
    var t0 = now(), seen = new Set(), i, n;
    for (i = 0; i < nodes.length; i++) { n = nodes[i]; if (seen.has(n) || !n.isConnected) continue; seen.add(n); translateTree(n); }
    for (i = 0; i < els.length; i++) { n = els[i]; if (seen.has(n) || !n.isConnected) continue; seen.add(n); var z = zone(n); if (z === 0 || z === 2) attrs(n); }
    if (obs) obs.takeRecords();                                     // the records of its own writes in this batch
    var ms = now() - t0;
    stats.batches++; stats.batchMs += ms; if (ms > stats.maxBatchMs) stats.maxBatchMs = ms;
  }
  function start() {
    var t0 = now();
    translateTree(D.documentElement);
    var ms = now() - t0;
    stats.walks++; stats.walkMs += ms; if (stats.walks === 1) stats.firstWalkMs = ms;
    if (!obs) obs = new W.MutationObserver(onMutations);
    obs.observe(D.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat('value') });
    reveal();
  }
  /** Back to the design's English: every text and attribute that still holds this file's output gets its English again. */
  function restore() {
    if (obs) obs.disconnect();
    q = []; qa = [];
    var it = D.createTreeWalker(D.documentElement, 1 | 4), n, r, rs, a;   // NodeFilter.SHOW_ELEMENT | SHOW_TEXT
    while ((n = it.nextNode())) {
      if (n.nodeType === 3) { r = texts.get(n); if (r) { if (n.data === r.out) n.data = r.src; texts.delete(n); } continue; }
      rs = attrsOf.get(n);
      if (rs) { for (a in rs) if (n.getAttribute(a) === rs[a].out) n.setAttribute(a, rs[a].src); attrsOf.delete(n); }
    }
    memo = new Map();
  }

  /* ---------- the language ---------- */
  function cache() { return (W.JG_ENGINE && W.JG_ENGINE.cache) || BOOT.engine; }
  function draftLang() {
    try { var s = JSON.parse(W.localStorage.getItem('jg.diag.v1') || 'null'), l = s && s.answers && s.answers.m0_roadmap_language; return LANGS.indexOf(l) !== -1 ? l : null; }
    catch (e) { return null; }
  }
  function resolve() {
    var c = cache();
    if (c && c.diagnostic !== 'done') { var d = draftLang(); if (d) return d; }
    return c && LANGS.indexOf(c.lang) !== -1 ? c.lang : 'en';
  }
  /** Settings' App language shows the account's (the design reads jia.settings once, M:011:12-13; its live copy is JIA_SETTINGS). */
  function settings(l) {
    try {
      var raw = W.localStorage.getItem('jia.settings'), s = raw ? JSON.parse(raw) : {};
      if (s && typeof s === 'object' && !Array.isArray(s) && (s.lang || 'en') !== l) { s.lang = l; W.localStorage.setItem('jia.settings', JSON.stringify(s)); }
    } catch (e) { /* storage blocked: Settings shows the design's default */ }
    if (W.JIA_SETTINGS && typeof W.JIA_SETTINGS === 'object') W.JIA_SETTINGS.lang = l;
    var bs = D.querySelectorAll('.set-seg button[data-k="lang"]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-v') === l));
  }
  function draft(l) {
    try {
      var s = JSON.parse(W.localStorage.getItem('jg.diag.v1') || 'null');
      if (!s || typeof s !== 'object') s = { answers: {}, at: null, done: false };
      if (!s.answers || typeof s.answers !== 'object') s.answers = {};
      s.answers.m0_roadmap_language = l;
      W.localStorage.setItem('jg.diag.v1', JSON.stringify(s));
    } catch (e) {}
  }
  function hide() {
    if (!D.getElementById('jg-i18n-wait')) {
      var st = D.createElement('style'); st.id = 'jg-i18n-wait'; st.textContent = 'html.jg-i18n-wait body{visibility:hidden!important}';
      (D.head || D.documentElement).appendChild(st);
    }
    D.documentElement.classList.add('jg-i18n-wait');
    clearTimeout(waitT); waitT = setTimeout(reveal, WAIT_MS);
  }
  function reveal() { clearTimeout(waitT); D.documentElement.classList.remove('jg-i18n-wait'); }
  /* P15 fixes lane (18 Oct 2026): on an Uzbek page also the one declaration of "JG Uz Marks" (public/runtime/jg-uz-marks.css), which
     jg-i18n.css names first in the Uzbek stack; src/server/pages.ts links both when the page is served in Uzbek */
  function css(lg) {
    var h = D.head || D.documentElement;
    if (lg === 'uz' && !D.querySelector('link[data-jg-uz-marks]')) {
      var m = D.createElement('link'); m.rel = 'stylesheet'; m.href = '/runtime/jg-uz-marks.css?v=1'; m.setAttribute('data-jg-uz-marks', ''); h.appendChild(m);
    }
    if (D.querySelector('link[data-jg-i18n-css]')) return;
    var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = '/runtime/jg-i18n.css?v=' + V; l.setAttribute('data-jg-i18n-css', '');
    h.appendChild(l);
  }
  function load(l) {
    if (!loads[l]) {
      var t0 = now();
      loads[l] = W.fetch('/runtime/i18n/' + l + '.json?v=' + encodeURIComponent(V), { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { stats.loadMs = Math.round(now() - t0); return compile(j); }, function () { return null; })
        .then(function (d) { if (!d) delete loads[l]; return d; });
    }
    return loads[l];
  }
  /** The page in l now: <html lang>, Settings' switch, then the dictionary and one walk (English: the design's own words back). */
  function apply(l) {
    if (LANGS.indexOf(l) === -1) l = 'en';
    var was = lang;
    lang = l; stats.lang = l;
    D.documentElement.setAttribute('lang', l);
    settings(l);
    if (dict && was !== l) { restore(); dict = null; }
    if (l === 'en') { reveal(); return Promise.resolve(); }
    css(l);
    return load(l).then(function (d) {
      if (lang !== l) return;
      if (!d) { reveal(); return; }                                 // no dictionary (offline): the page stays in the design's English
      dict = d; memo = new Map(); start();
    });
  }
  function check() { if (!switching) { var l = resolve(); if (l !== lang) apply(l); } }
  /** Settings' App language (M:011:75, D:015:72): saved on the account with the roadmap's language, then the page reloads in it. */
  function choose(l) {
    var E = W.JG_ENGINE;
    if (LANGS.indexOf(l) === -1 || switching || !E || !E.commit) return Promise.resolve(false);
    if (l === lang && E.cache.lang === l) return Promise.resolve(true);
    switching = true;
    return E.commit('language', { lang: l }).then(function (r) {
      if (!r || r.error) { switching = false; settings(lang); return false; }   // not saved (the runtime said so): Settings shows the language in force
      if (E.cache.diagnostic !== 'done') draft(l);                 // its first screen opens in it
      var R = W.JG_RUNTIME, go = function () { api._reload(); return true; };
      return Promise.resolve(R && R.flush ? R.flush() : null).then(go, go);
    });
  }

  var api = W.JG_I18N = {
    lang: function () { return lang; },
    choose: choose,
    /** s in the student's language now (s itself with no entry or no dictionary), for design code that measures a text before it shows it:
     *  the roadmap chart's callout sizes its box to its two lines (M:003:164, D:001:340; owner 6 Oct P4h fix W6), and the observer would
     *  translate them only after that. A translation is never an English key, so the observer leaves what this wrote as it is. */
    text: function (s) { if (!dict || typeof s !== 'string') return s; var t = tr(s); return t === null ? s : t; },
    stats: function () { var s = {}; for (var k in stats) s[k] = stats[k]; s.memo = memo.size; return s; },
    _reload: function () { W.location.reload(); },
    /** For the QA's cost reading (tools/ui-strings/qa.mjs): el's words back to the design's English, then translated again with an empty
     *  memo, timed. Returns { ms, nodes, translated } (null before the dictionary is in). */
    _retime: function (el) {
      if (!dict || !el) return null;
      var it = D.createTreeWalker(el, 1 | 4), n = el, r, rs, a;
      do {
        if (n.nodeType === 3) { r = texts.get(n); if (r) { if (n.data === r.out) n.data = r.src; texts.delete(n); } }
        else if ((rs = attrsOf.get(n))) { for (a in rs) if (n.getAttribute(a) === rs[a].out) n.setAttribute(a, rs[a].src); attrsOf.delete(n); }
      } while ((n = it.nextNode()));
      if (obs) obs.takeRecords();
      memo = new Map();
      var n0 = stats.nodes, t0 = stats.translated, s = now();
      translateTree(el);
      var ms = now() - s;
      if (obs) obs.takeRecords();
      return { ms: Math.round(ms * 100) / 100, nodes: stats.nodes - n0, translated: stats.translated - t0 };
    },
    _core: { norm: norm, compile: compile, resolve: resolve, HARD: HARD, NOTEXT: NOTEXT, USER: USER, UI_IN_USER: UI_IN_USER },
  };
  // the diagnostic's first screen saves its choice (M:023:626), then the page follows; so does a newer snapshot (a finished diagnostic).
  // Read in the capture phase (owner 6 Oct P4h fix W7): the design's handler redraws the first screen (intro()), so by the time the click
  // bubbles to the document its button is no longer inside #dg-view and <html lang> stayed English for the whole diagnostic.
  D.addEventListener('click', function (e) { var t = e.target; if (t && t.closest && t.closest('#dg-view [data-act="lang"]')) setTimeout(check, 0); }, true);
  D.addEventListener('jg:snapshot', check);
  var first = resolve();
  if (first !== 'en') hide();
  apply(first);
})();
