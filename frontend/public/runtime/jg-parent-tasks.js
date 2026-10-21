/* Jamals Global: the parent's own tasks during the child's Phase D (P5e; P5 spec §4.2 items 2 and 4, §4.8 items 1 and 4; C13 batch 2).
 *
 * Loaded on a real family's parent page while the child is in Phase D (JG_BOOT.child.phaseD; src/server/pages.ts); never the demo, /preview
 * or ENGINE_LIVE off. Not design code: it draws a card on the first screen (the phone's Home body, above Jamol's carousel; the desktop's Home,
 * under its heading) and its sheets in the design's own classes (.card, .card-head, .tile-ic, the family form's .g-lbl, .g-chips, .g-in,
 * .money, .btn-block, .fine) and the design's #sheet and #scrim. Each task is one of C13's parent-source questions; the under-14 consent
 * comes first ("on the parent app's first screen, inside the existing flow", DC11). Answers go to the family form's own route
 * (POST /api/v1/family/check: the child's parent_flow_done). Words come from the server in en/uz/ru (never AI, D14) and follow the parent
 * app's language switch; the card and sheets are data-notr (the design's translator leaves them alone). */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null, C = BOOT && BOOT.child, PD = C && C.phaseD, ST = C && C.study;
  /* Owner 10 Oct 2026 (delegated call): a student under 18 joins the Bluebook study only with a parent's consent. Once the child has asked,
   * JG_BOOT.child.study is one more row of this card, first, with PHASE_D on or off (off, the card holds that row alone, under the study's own
   * line). Its sheet is a task's sheet with Yes and No; the answer goes to POST /api/v1/family/study (its own stored fact, not Phase D's
   * consent). The row stays after the answer and says it, so a parent can change a yes or a no. */
  if (ST && ST.task) { PD = PD || { tasks: [], draft: null, heading: ST.heading, sub: ST.sub, words: ST.words }; PD.tasks = [ST.task].concat(PD.tasks); }
  if (!BOOT || BOOT.demo || BOOT.role !== 'parent' || !PD || (!PD.tasks.length && !PD.draft)) return;
  var NOEXTRA = ['no', 'none', 'no_preference', 'same_as_mine'];
  var css = document.createElement('style');
  css.textContent = '.jg-pt{padding:16px;margin:0 0 14px}.jg-pt .card-head small{display:block;font-size:12.5px;line-height:1.45;color:var(--muted);font-weight:600;margin-top:2px}' +
    '.jg-pt-draft{margin:12px 0 2px;padding:9px 12px;border-radius:12px;background:#FBF1DC;color:#6B4708;font-size:12.5px;font-weight:700;line-height:1.45}' +
    '.jg-pt-row{display:flex;align-items:center;gap:11px;width:100%;padding:12px 0;border:0;border-top:1px solid var(--line,#e6ece9);background:none;font:inherit;text-align:left;color:var(--ink);cursor:pointer}' +
    '.jg-pt-row:first-of-type{border-top:0}.jg-pt-row .t{flex:1;min-width:0}.jg-pt-row b{display:block;font-size:14.5px;font-weight:700;line-height:1.35}.jg-pt-row small{display:block;font-size:12.5px;color:var(--muted);margin-top:2px}' +
    '.jg-pt-row.consent b{color:var(--forest,#123a29)}.jg-pt-n{flex:none;min-width:22px;height:22px;border-radius:999px;background:var(--jade-soft);color:var(--forest,#123a29);font-size:12px;font-weight:800;display:grid;place-items:center}' +
    '#jg-pt-s .jg-pt-topics{margin:12px 0 0;padding:12px 14px 12px 30px;border-radius:14px;background:var(--mist,#f3f7f5);font-size:14px;line-height:1.6;color:var(--ink-2)}' +
    '#jg-pt-s .lead{text-align:left}#jg-pt-s h3{padding:0 34px}#jg-pt-s .g-in{margin-top:8px}#jg-pt-s .jg-pt-x[hidden]{display:none}';
  (document.head || document.documentElement).appendChild(css);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lang() { var l = String(document.documentElement.getAttribute('lang') || '').slice(0, 2); return l === 'uz' || l === 'ru' ? l : 'en'; }
  function t(tri) { return tri ? (tri[lang()] || tri.en || '') : ''; }
  function W() { return PD.words[lang()] || PD.words.en; }
  var X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var CHEV = '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  var ICON = '<svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>';

  var card = null;
  function render() {
    var home = document.getElementById('p-home');
    if (!home) return;
    if (!card) {
      card = document.createElement('section');
      card.className = 'card jg-pt'; card.id = 'jg-pt'; card.setAttribute('data-notr', ''); card.setAttribute('aria-labelledby', 'jg-pt-h');
      var body = home.querySelector('.home-body'), head = home.querySelector('.d-head');
      if (body) body.insertBefore(card, body.firstChild); else if (head && head.parentNode) head.parentNode.insertBefore(card, head.nextSibling); else home.insertBefore(card, home.firstChild);
      card.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-pt]'); if (b) open(b.getAttribute('data-pt')); });
    }
    var w = W(), todo = PD.tasks.filter(function (k) { return !(k.study && k.answer); }).length;   // an answered study row is no task left to do
    card.hidden = !PD.tasks.length && !PD.draft;
    card.innerHTML = '<div class="card-head"><span class="tile-ic">' + ICON + '</span><span class="t"><b id="jg-pt-h">' + esc(t(PD.heading)) + '</b><small>' + esc(t(PD.sub)) + '</small></span>' +
      (todo ? '<span class="jg-pt-n" aria-hidden="true">' + todo + '</span>' : '') + '</div>' +
      (PD.draft ? '<p class="jg-pt-draft" role="note">' + esc(t(PD.draft)) + '</p>' : '') +
      PD.tasks.map(function (k) {
        return '<button class="jg-pt-row' + (k.consent || k.study ? ' consent' : '') + '" type="button" data-pt="' + esc(k.id) + '"' + (k.study ? ' data-pt-answer="' + esc(k.answer || '') + '"' : '') + '><span class="t"><b>' + esc(t(k.title)) + '</b><small>' +
          (k.study ? esc(k.answer ? t(k.answered).replace('{{a}}', answerWord(k)) : t(k.sub)) : esc(w.minutes.replace('{{n}}', k.minutes)) + (k.why ? ' · ' + esc(t(k.why)) : '')) + '</small></span>' + CHEV + '</button>';
      }).join('');
  }

  /* the study row's answer in the page's language: the chosen option's own label */
  function answerWord(k) { var o = k.questions[0].options.filter(function (x) { return x.value === k.answer; })[0]; return o ? t(o.label) : ''; }

  /* ---------- a task's sheet ---------- */
  var cur = null, picked = {};
  function chips(q, opts, multi) {
    return '<div class="g-chips" role="group" aria-label="' + esc(t(q.text)) + '">' + opts.map(function (o) {
      return '<button type="button" data-q="' + esc(q.id) + '" data-v="' + esc(o.value) + '"' + (multi ? ' data-multi=""' : '') + ' aria-pressed="false">' + esc(t(o.label)) + '</button>';
    }).join('') + '</div>';
  }
  function partsOf(q) { var o = {}; (q.parts || []).forEach(function (p) { o[p.key] = p; }); return o; }
  function question(q) {
    var h = '<p class="g-lbl">' + esc(t(q.text)) + '</p>', P = partsOf(q);
    if (q.type === 'number_currency') {
      var cu = P.currency ? P.currency.options : [];
      return h + '<div class="money"><label class="sr-only" for="jg-pt-amt">' + esc(P.amount ? t(P.amount.label) : '') + '</label><input class="g-in" id="jg-pt-amt" inputmode="numeric" data-part="amount" data-q="' + esc(q.id) + '" placeholder="' + esc(P.amount ? t(P.amount.label) : '') + '">' +
        '<label class="sr-only" for="jg-pt-cur">' + esc(P.currency ? t(P.currency.label) : '') + '</label><select class="g-in" id="jg-pt-cur" data-part="currency" data-q="' + esc(q.id) + '">' +
        cu.map(function (o) { return '<option value="' + esc(o.value) + '">' + esc(t(o.label)) + '</option>'; }).join('') + '</select></div>';
    }
    if (q.type === 'contact') {
      return h + chips(q, P.channel ? P.channel.options : [], false) + '<input class="g-in" type="text" data-part="value" data-q="' + esc(q.id) + '" maxlength="' + ((P.value && P.value.max_chars) || 60) + '" placeholder="' + esc(P.value ? t(P.value.label) : '') + '" aria-label="' + esc(P.value ? t(P.value.label) : '') + '">';
    }
    if (q.type === 'select_plus_text') {
      var x = P.text;
      return h + chips(q, q.options, false) + (x ? '<input class="g-in jg-pt-x" type="text" hidden data-part="extra" data-q="' + esc(q.id) + '" maxlength="' + (x.max_chars || 60) + '" placeholder="' + esc(t(x.label)) + '" aria-label="' + esc(t(x.label)) + '">' : '');
    }
    return h + chips(q, q.options, q.type === 'multi');
  }
  function sheetHtml(k) {
    var w = W();
    return '<div id="jg-pt-s" data-notr><button class="sheet-close" type="button" data-pt-x aria-label="' + esc(w.close) + '">' + X + '</button><div class="grab"></div>' +
      '<p class="eyebrow">' + esc(t(PD.heading)) + '</p><h3 id="sheetTitle">' + esc(t(k.title)) + '</h3><p class="lead">' + esc(t(k.instructions)) + '</p>' +
      (k.topics && (k.topics[lang()] || k.topics.en || []).length ? '<ul class="jg-pt-topics">' + (k.topics[lang()] || k.topics.en).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      k.questions.map(question).join('') + '<p class="g-err" role="alert" id="jg-pt-err"></p>' +
      '<button class="btn btn-primary btn-block" type="button" data-pt-save style="margin-top:16px">' + esc(k.study ? t(k.saveLabel) : k.consent ? w.agree : w.save) + '</button></div>';
  }
  function paint(sh) {
    Array.prototype.forEach.call(sh.querySelectorAll('[data-q][data-v]'), function (b) {
      var v = picked[b.getAttribute('data-q')], on = Array.isArray(v) ? v.indexOf(b.getAttribute('data-v')) !== -1 : v === b.getAttribute('data-v');
      b.setAttribute('aria-pressed', String(!!on));
    });
    Array.prototype.forEach.call(sh.querySelectorAll('.jg-pt-x'), function (i) { var v = picked[i.getAttribute('data-q')]; i.hidden = !v || NOEXTRA.indexOf(v) !== -1; });
  }
  function open(id) {
    var k = PD.tasks.filter(function (x) { return x.id === id; })[0], sh = document.getElementById('sheet'), sc = document.getElementById('scrim');
    if (!k || !sh) return;
    cur = k; picked = {};
    if (k.study && k.answer) picked[k.questions[0].id] = k.answer;            // the family's answer so far, to change
    sh.className = 'sheet'; sh.innerHTML = sheetHtml(k); sh.scrollTop = 0; paint(sh);
    if (sc) sc.classList.add('on');
    requestAnimationFrame(function () { sh.classList.add('on'); });
    sh.querySelector('[data-pt-x]').addEventListener('click', close);
    sh.querySelector('#jg-pt-s').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-q][data-v]');
      if (b) {
        var q = b.getAttribute('data-q'), v = b.getAttribute('data-v'), qq = k.questions.filter(function (x) { return x.id === q; })[0], ex = (qq && qq.exclusive) || ['none', 'prefer_not_to_say'];
        if (b.hasAttribute('data-multi')) {
          var cur0 = Array.isArray(picked[q]) ? picked[q] : [], at = cur0.indexOf(v);
          picked[q] = at !== -1 ? cur0.filter(function (x) { return x !== v; }) : ex.indexOf(v) !== -1 ? [v] : cur0.filter(function (x) { return ex.indexOf(x) === -1; }).concat([v]);
        } else picked[q] = picked[q] === v ? null : v;
        paint(sh); say('');
        return;
      }
      if (e.target.closest && e.target.closest('[data-pt-save]')) save(sh);
    });
    setTimeout(function () { var f = sh.querySelector('.sheet-close'); if (f) f.focus({ preventScroll: true }); }, 350);
  }
  function close() { var sh = document.getElementById('sheet'), sc = document.getElementById('scrim'); if (sh) sh.classList.remove('on'); if (sc) sc.classList.remove('on'); cur = null; }
  function say(s) { var e = document.getElementById('jg-pt-err'); if (e) e.textContent = s || ''; }
  function valueOf(sh, q) {
    var P = partsOf(q), get = function (part) { var el = sh.querySelector('[data-q="' + q.id + '"][data-part="' + part + '"]'); return el ? String(el.value || '').trim() : ''; };
    if (q.type === 'number_currency') {
      var a = get('amount').replace(/[^0-9]/g, ''), c = get('currency') || 'UZS', rate = (C.famRate || {})[c];
      return a ? { amount: a, currency: c, usd: rate ? Math.round(+a * rate) : null, confidence: 'high' } : undefined;
    }
    if (q.type === 'contact') { var ch = picked[q.id], v = get('value'); return ch && v ? { channel: ch, value: v.slice(0, (P.value && P.value.max_chars) || 60) } : undefined; }
    if (q.type === 'select_plus_text') { var s = picked[q.id]; return s ? { choice: s, extra: NOEXTRA.indexOf(s) === -1 ? get('extra').slice(0, 60) : '' } : undefined; }
    var p = picked[q.id];
    return Array.isArray(p) ? (p.length ? p : undefined) : p || undefined;
  }
  /* owner 10 Oct 2026: the study's yes or no. A no is saved too (it is an answer, not "not now"); the row stays and says it. */
  function saveStudy(sh, k) {
    var w = W(), a = picked[k.questions[0].id];
    if (a !== 'yes' && a !== 'no') { say(w.pick); return; }
    var b = sh.querySelector('[data-pt-save]'); b.disabled = true;
    fetch('/api/v1/family/study', { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid }, body: JSON.stringify({ student_id: C.student_id, answer: a }) })
      .then(function (r) { return r.ok; }, function () { return false; })
      .then(function (ok) {
        b.disabled = false;
        if (!ok) { say(w.failed); return; }
        k.answer = a; close(); render();
        var tz = document.getElementById('toast'); if (tz) { tz.textContent = w.saved; tz.classList.add('on'); setTimeout(function () { tz.classList.remove('on'); }, 2200); }
      });
  }
  function save(sh) {
    var k = cur, w = W();
    if (!k) return;
    if (k.study) { saveStudy(sh, k); return; }
    var answers = {}, consent = false, missing = false;
    k.questions.forEach(function (q) {
      if (k.consent) { consent = picked[q.id] === 'yes'; if (!picked[q.id]) missing = true; return; }
      var v = valueOf(sh, q);
      if (v === undefined) { if (q.required) missing = true; return; }
      answers[q.id] = v;
    });
    if (missing || (!k.consent && !Object.keys(answers).length)) { say(w.pick); return; }
    if (k.consent && !consent) { close(); return; }                           // "Not now": nothing to save; the task stays
    var b = sh.querySelector('[data-pt-save]'); b.disabled = true;
    fetch('/api/v1/family/check', { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid },
      body: JSON.stringify({ student_id: C.student_id, answers: answers, consent: consent, language: lang(), client_id: 'pt_' + k.id + '_' + Date.now() }) })
      .then(function (r) { return r.ok; }, function () { return false; })
      .then(function (ok) {
        b.disabled = false;
        if (!ok) { say(w.failed); return; }
        PD.tasks = PD.tasks.filter(function (x) { return x.id !== k.id; });
        close(); render();
        var tz = document.getElementById('toast'); if (tz) { tz.textContent = w.saved; tz.classList.add('on'); setTimeout(function () { tz.classList.remove('on'); }, 2200); }
      });
  }

  function start() {
    render();
    new MutationObserver(function () { render(); var sh = document.getElementById('sheet'); if (cur && sh && sh.querySelector('#jg-pt-s')) open(cur.id); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.JG_PARENT_TASKS = { open: open, render: render };
})();
