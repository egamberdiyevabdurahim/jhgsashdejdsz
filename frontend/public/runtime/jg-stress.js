/* P8b, 14 Oct 2026: a Russian stress mark on its vowel. In the DTM sitting a stressed о (stored о + U+0301) showed its mark over the
 * letter after it, so a word read as if spelt wrong (no item, option or key is named in this public file: the P8b integration's
 * no-content-leak run found one here): Raleway's Google cyrillic subset draws U+0301 as `acutecomb` (no advance, its
 * ink 50-148 units right of its origin) and anchors it only on а и у ы э г ж з к ч and their capitals, so after о е ё ю я the mark stood
 * over the next letter. Not the text: no normalising, spacing or transform touches it on the way.
 *
 * The page keeps the stored text (the same characters in the same order: the key, the token, a copy and textContent are as before) and,
 * in the student pages' text, draws each Cyrillic vowel + U+0301 as <span class="jg-acc">о<span class="jg-acc-m">&#x301;</span></span>:
 * the stored mark stays in line, unseen, and the mark is drawn by .jg-acc::after at the place Raleway's anchors give а (the vowel's
 * middle less the mark's anchor, 60 units; a capital's mark 191 units higher, cap height 710 less x-height 519), the same for every vowel. A Latin letter + U+0301 with a precomposed form is
 * drawn as that letter (to + U+0301 as tó: Raleway's latin subset has no U+0301 at all).
 *
 * window.JG_STRESS: parts(text) (the pure cut, tests/unit/jg-stress.test.ts), wrap(root), css. One MutationObserver on the body wraps what
 * any script draws (the DTM sitting, the checks and the task quizzes, the lessons, the homework); text in inputs, SVG and editable boxes
 * is left as it is. */
(function () {
  'use strict';
  var W = window, D = typeof document !== 'undefined' ? document : null;
  var MARK = '\u0301', UP = '\u0410\u0415\u0401\u0418\u041e\u0423\u042b\u042d\u042e\u042f';
  var VOWEL = /([\u0430\u0435\u0451\u0438\u043e\u0443\u044b\u044d\u044e\u044f\u0410\u0415\u0401\u0418\u041e\u0423\u042b\u042d\u042e\u042f])\u0301/g;
  var LATIN = /[A-Za-z]\u0301/g;
  /* .jg-acc-m: the stored mark, in line in its own run (no width, no ink), so the text, a copy, innerText and the name a screen reader
   * reads stay as stored; ::after: the mark drawn, generated (no text of its own, its alternative text empty; the first content for a
   * browser without that syntax), out of the line, at Raleway's anchor. Every rule waits for html.jg-acc-on (Raleway's cyrillic face
   * loaded): before it, and in another font, the wrapper is inert and the font anchors the mark itself, as it did */
  var ON = 'jg-acc-on', P = 'html.' + ON + ' ';
  var css = P + '.jg-acc{position:relative}'
    + P + '.jg-acc-m{font-size:0;color:transparent}'
    + P + '.jg-acc::after{content:"' + MARK + '";content:"' + MARK + '" / "";position:absolute;top:0;left:50%;width:0;margin-left:-.06em;line-height:normal;white-space:nowrap;pointer-events:none}'
    + P + '.jg-acc-u::after{top:-.191em}';
  /* text set in Raleway: the first family of its computed font-family; on an Uzbek page "JG Uz Marks" stands before it, a face for
   * U+02BB/U+02BC alone (P14, public/runtime/jg-i18n.css), so every other letter, a Cyrillic vowel and its U+0301 too, is still Raleway's */
  function raleway(family) { return /^\s*(["']?JG Uz Marks["']?\s*,\s*)?["']?raleway["']?\s*(,|$)/i.test(String(family || '')); }
  /* Raleway's cyrillic face (the one whose U+0301 has no anchor on о е ё ю я) is loaded */
  function cyrillicOn(faces) {
    var on = false;
    (faces || []).forEach(function (f) { if (raleway(f.family) && f.status === 'loaded' && /U\+0?400-0?45F/i.test(String(f.unicodeRange || ''))) on = true; });
    return on;
  }

  /* the text cut into plain runs (strings) and stressed vowels ({ v, up }); joined back (v + U+0301) it is the text as given */
  function parts(s) {
    s = String(s == null ? '' : s);
    if (!s) return [];
    if (s.indexOf(MARK) < 0) return [s];
    s = s.replace(LATIN, function (m) { var c = m.normalize('NFC'); return c.length === 1 ? c : m; });
    var out = [], last = 0, m;
    VOWEL.lastIndex = 0;
    while ((m = VOWEL.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      out.push({ v: m[1], up: UP.indexOf(m[1]) >= 0 });
      last = m.index + 2;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }
  W.JG_STRESS = { parts: parts, css: css, raleway: raleway, cyrillicOn: cyrillicOn };
  if (!D) return;

  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, SELECT: 1, NOSCRIPT: 1, TITLE: 1 };
  function skip(n) {
    for (var e = n.parentNode; e && e.nodeType === 1; e = e.parentNode) {
      if (SKIP[e.nodeName] || e.namespaceURI === 'http://www.w3.org/2000/svg' || e.isContentEditable) return true;
      if (e.classList && (e.classList.contains('jg-acc') || e.classList.contains('jg-acc-m'))) return true;
    }
    return false;
  }
  function one(t) {
    var ps = parts(t.data);
    if (ps.length === 1 && typeof ps[0] === 'string') { if (ps[0] !== t.data) t.data = ps[0]; return; }
    // text in another font (a system-font button, a Cormorant heading): that font anchors the mark itself; only a Latin letter is composed
    if (!raleway(W.getComputedStyle(t.parentNode).fontFamily)) {
      var j = ps.map(function (p) { return typeof p === 'string' ? p : p.v + MARK; }).join('');
      if (j !== t.data) t.data = j;
      return;
    }
    var f = D.createDocumentFragment();
    ps.forEach(function (p) {
      if (typeof p === 'string') { f.appendChild(D.createTextNode(p)); return; }
      var s = D.createElement('span'), mk = D.createElement('span');
      s.className = p.up ? 'jg-acc jg-acc-u' : 'jg-acc';
      s.appendChild(D.createTextNode(p.v));
      mk.className = 'jg-acc-m'; mk.textContent = MARK;
      s.appendChild(mk); f.appendChild(s);
    });
    t.parentNode.replaceChild(f, t);
  }
  function wrap(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (root.data.indexOf(MARK) >= 0 && root.parentNode && !skip(root)) one(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    if ((root.textContent || '').indexOf(MARK) < 0) return;
    var w = D.createTreeWalker(root, 4, null), list = [], n;
    while ((n = w.nextNode())) if (n.data.indexOf(MARK) >= 0) list.push(n);
    list.forEach(function (t) { if (t.parentNode && !skip(t)) one(t); });
  }
  W.JG_STRESS.wrap = wrap;

  function start() {
    if (!D.getElementById('jg-stress-css')) { var st = D.createElement('style'); st.id = 'jg-stress-css'; st.textContent = css; (D.head || D.documentElement).appendChild(st); }
    // nothing is wrapped before Raleway's cyrillic face is loaded: a vowel and its mark laid out together once stay one cluster in Chrome
    // when the mark's own run gets its size later (seen 14 Oct 2026: the mark on its vowel and on the next letter), so the rules come
    // first and the wrapper after; until then (and if the face never loads) the text is as it was
    var F = D.fonts, html = D.documentElement, on = false;
    var go = function () {
      if (on || !F || !cyrillicOn(F)) return;
      on = true; html.classList.add(ON);
      wrap(D.body);
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          if (m.type === 'characterData') wrap(m.target);
          else for (var i = 0; i < m.addedNodes.length; i++) wrap(m.addedNodes[i]);
        });
      }).observe(D.body, { childList: true, subtree: true, characterData: true });
    };
    go();
    if (F && !on) { if (F.addEventListener) F.addEventListener('loadingdone', go); if (F.ready) F.ready.then(go); }
  }
  if (D.body) start(); else D.addEventListener('DOMContentLoaded', start);
})();
