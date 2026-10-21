/* Jamals Global runtime: the official page's address in a Phase X step's words is a link (P5 wave 3, the second walk's minor (h): "on a
 * phone he retypes or selects it").
 * Not design code, and no design line changes: the design's task sheet writes a task's instructions as escaped text into its own paragraph
 * (#jt-sheet .jr-why; student-mobile js/023.js:886, student-desktop js/022.js:888). When that sheet opens, this file reads the paragraph
 * once and draws as an anchor each address that
 *   - is https, with no name or password in it, and
 *   - is on a host of the SERVER's own link allow-list for that task (the snapshot task's `link_hosts`: the hosts its link proof must be
 *     on, verification ladder L4, src/engine/verify/link.ts; the host itself or a name under it, as the server checks a proof).
 * Nothing else in the paragraph is touched: the words before and after stay the text they were, and the address reads as it was written.
 * The anchor opens in a new tab (target=_blank, rel=noopener), takes the paragraph's own colour (the design has no colour for a link in a
 * sheet) and is underlined so that it reads as a link; it is marked data-no-i18n (the page's dictionary never rewrites an address).
 *
 * A task with no `link_hosts` (every task of today's engine and of Phase D, a Phase X task that asks for no link proof) keeps its paragraph
 * as the design wrote it. The page loads this file only when the boot says Phase X is on for this live student (JG_BOOT.phaseX,
 * src/server/pages.ts): the demo family, /preview and every page with PHASE_X off never load it.
 *
 * window.JG_LINKS: parts(text, hosts) (pure: the text cut at each such address), apply(p, hosts) (the pass over one paragraph; true when it
 * drew a link), hostsFor(text) (the allow-list of the task whose instructions these are). tests/unit/jg-links.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (W.JG_LINKS) return;
  var ADDR = /https:\/\/[^\s<>"'`«»“”‘’]+/g;

  function listed(host, hosts) {
    host = String(host || '').toLowerCase().replace(/\.$/, '');
    for (var i = 0; i < hosts.length; i++) {
      var h = String(hosts[i] || '').toLowerCase();
      if (h && (host === h || host.slice(-(h.length + 1)) === '.' + h)) return true;
    }
    return false;
  }
  /* The text in order, as { text } and { href, text } pieces; one { text } piece when no address qualifies. */
  function parts(text, hosts) {
    text = String(text == null ? '' : text);
    var out = [], at = 0, m;
    if (hosts && hosts.length) {
      ADDR.lastIndex = 0;
      while ((m = ADDR.exec(text))) {
        var raw = m[0].replace(/[.,;:!?)\]]+$/, ''), u = null;          // a full stop or a bracket after an address is the sentence's
        try { u = new URL(raw); } catch (e) { u = null; }
        if (!u || u.protocol !== 'https:' || u.username || u.password || !listed(u.hostname, hosts)) continue;
        if (m.index > at) out.push({ text: text.slice(at, m.index) });
        out.push({ href: u.href, text: raw });
        at = m.index + raw.length;
      }
    }
    if (at < text.length || !out.length) out.push({ text: text.slice(at) });
    return out;
  }
  /* The paragraph's own text nodes only (the design writes one); an element inside it is left as it is, so a second pass changes nothing. */
  function apply(p, hosts) {
    if (!p || !hosts || !hosts.length) return false;
    var nodes = [], n, drew = false;
    for (n = p.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) nodes.push(n);
    nodes.forEach(function (node) {
      var ps = parts(node.data, hosts);
      if (!ps.some(function (x) { return !!x.href; })) return;
      var frag = D.createDocumentFragment();
      ps.forEach(function (x) {
        if (!x.href) { frag.appendChild(D.createTextNode(x.text)); return; }
        var a = D.createElement('a');
        a.href = x.href; a.target = '_blank'; a.rel = 'noopener';
        a.setAttribute('data-no-i18n', ''); a.setAttribute('data-jg-link', '');
        a.style.color = 'inherit'; a.style.textDecoration = 'underline';
        a.appendChild(D.createTextNode(x.text));
        frag.appendChild(a);
      });
      p.replaceChild(frag, node); drew = true;
    });
    return drew;
  }
  var flat = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/^ | $/g, ''); };
  /* The allow-list of the task whose instructions these are, from the snapshot the page holds; null when no such task carries one. */
  function hostsFor(text) {
    var E = W.JG_ENGINE, days = E && E.cache && E.cache.tasks, want = flat(text);
    if (!days || !want) return null;
    for (var d in days) if (Object.prototype.hasOwnProperty.call(days, d)) {
      var list = days[d] || [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (t && Array.isArray(t.link_hosts) && t.link_hosts.length && flat(t.instructions_i18n) === want) return t.link_hosts;
      }
    }
    return null;
  }
  W.JG_LINKS = { parts: parts, apply: apply, hostsFor: hostsFor };

  if (!B || !B.phaseX || !B.engine) return;                              // inert without Phase X: only the three functions above exist
  var seen = null;
  function pass() {
    var sheet = D.getElementById('jt-sheet');
    if (!sheet) { seen = null; return; }
    if (sheet === seen) return;                                          // once a sheet: the design builds a new element each time it opens one
    seen = sheet;
    var p = sheet.querySelector('.jr-why');
    if (p) apply(p, hostsFor(p.textContent));
  }
  /* The roadmap's dated test steps (the teen walk, 10 Oct 2026) were drawn from here while the server dated them behind this switch only;
   * the server now dates the first SAT in every switch state, so that pass is public/runtime/jg-real.js's (every live student's file). */
  function start() {
    if (typeof W.MutationObserver !== 'function' || !D.body) return;
    new W.MutationObserver(pass).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    pass();
  }
  if (D.body) start(); else D.addEventListener('DOMContentLoaded', start);
})();
