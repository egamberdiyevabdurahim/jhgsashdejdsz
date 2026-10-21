/**
 * P5h (spec §4.6 L7, §6.1 "Staff checkpoint queue"): the counselors' queue page's script (src/server/phase-x/staff-page.ts; served only
 * with PHASE_X on to an account on STAFF_USER_IDS). Approve, or return with one of the reasons written in code and an optional note:
 * POST /api/v1/staff/checkpoints/<id> as the account the page was rendered for (x-jg-uid). A decided card leaves the list.
 *
 * Owner 10 Oct (delegated call): a return needs its reason. The list has no ready answer, nothing is sent until one is picked, and once
 * it is the card shows the sentence the student will read, in the student's language (the option's data-reads, written by the server).
 * Every word this script shows is already in the page, in the page's language: it only shows and hides them.
 */
(function () {
  'use strict';
  var uid = document.body.getAttribute('data-uid');
  if (!uid) return;
  function show(card, sel, on) { var el = card.querySelector(sel); if (el) el.hidden = !on; }
  function decide(card, body, btn) {
    show(card, '.err-save', false);
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
    fetch('/api/v1/staff/checkpoints/' + encodeURIComponent(card.getAttribute('data-id')), {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': uid }, body: JSON.stringify(body)
    }).then(function (r) {
      if (r.ok) { card.remove(); if (!document.querySelector('.ck')) location.reload(); return; }
      if (r.status !== 409) throw new Error(String(r.status));
      return r.json().then(function (j) {
        if (!j || j.error !== 'decided') throw new Error('409');
        ['.acts', '.back', '.hint'].forEach(function (s) { var el = card.querySelector(s); if (el) el.remove(); });   // a colleague decided it first: say so, offer nothing
        show(card, '.gone', true);
      });
    }).catch(function () { btn.removeAttribute('aria-busy'); btn.disabled = false; show(card, '.err-save', true); });
  }
  /** The sentence the student will read for the reason picked (none picked: nothing is shown). */
  function preview(card) {
    var sel = card.querySelector('[data-f=reason]'), opt = sel && sel.value ? sel.options[sel.selectedIndex] : null, reads = card.querySelector('.reads');
    if (reads) reads.textContent = opt ? opt.getAttribute('data-reads') || '' : '';
    show(card, '.reads', !!opt); show(card, '.reads-l', !!opt);
    if (opt) show(card, '.err-reason', false);
  }
  document.addEventListener('change', function (e) {
    var s = e.target && e.target.closest ? e.target.closest('[data-f=reason]') : null;
    if (s) preview(s.closest('.ck'));
  });
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var card = b.closest('.ck'), act = b.getAttribute('data-act');
    if (!card) return;
    if (act === 'approve') return decide(card, { action: 'approve' }, b);
    if (act === 'open-return') { var back = card.querySelector('.back'), open = back.hidden; back.hidden = !open; b.setAttribute('aria-expanded', String(open)); if (open) back.querySelector('select').focus(); return; }
    if (act === 'return') {
      var reason = card.querySelector('[data-f=reason]').value;
      if (!reason) { show(card, '.err-reason', true); card.querySelector('[data-f=reason]').focus(); return; }
      var note = card.querySelector('[data-f=note]').value.trim(), body = { action: 'return', reason: reason };
      if (note) body.note = note.slice(0, 500);
      decide(card, body, b);
    }
  });
})();
