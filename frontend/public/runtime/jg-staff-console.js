/*
 * The staff console's script (M1 lane mod; src/server/moderation/console-page.ts, served only with MODERATION on to staff).
 *   /staff             on/off duty (POST /api/v1/staff/duty), add a person by e-mail in a role (POST /api/v1/staff/members), remove a role
 *                      (DELETE /api/v1/staff/members).
 *   /staff/moderation  approve, reject or take down with a reason (POST /api/v1/staff/moderation/<id>), suspend an account with a reason
 *                      (POST /api/v1/staff/suspend). A decided card leaves the list; if a colleague was first, it says so.
 *   Both               the urgent alarm: GET /api/v1/staff/alarm every 30 s while the page is open; the red banner shows the count, and on an
 *                      on-duty moderator's page a new urgent report also sounds a short tone and marks the tab's title.
 * Every word shown is already in the page, in the page's language: this script only shows, hides and counts.
 */
(function () {
  'use strict';
  var B = document.body, uid = B.getAttribute('data-uid');
  if (!uid) return;
  function send(method, url, body) {
    return fetch(url, { method: method, credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': uid }, body: body ? JSON.stringify(body) : undefined });
  }
  function busy(b, on) { if (!b) return; if (on) { b.setAttribute('aria-busy', 'true'); b.disabled = true; } else { b.removeAttribute('aria-busy'); b.disabled = false; } }
  function show(root, sel, on) { var el = root.querySelector(sel); if (el) el.hidden = !on; }
  var afterDecide = function () {};   // the alarm's own check, once a decision is saved (set below when the page has the alarm)

  /* ---------- the queue ---------- */
  function decide(card, decision, reason, b) {
    show(card, '[data-err=save]', false); busy(b, true);
    send('POST', '/api/v1/staff/moderation/' + encodeURIComponent(card.getAttribute('data-id')), { decision: decision, reason: reason || null }).then(function (r) {
      if (r.ok) { card.remove(); afterDecide(); if (!document.querySelector('article.card')) location.reload(); return; }
      if (r.status === 409) { card.querySelectorAll('.acts, .more, [data-act]').forEach(function (x) { x.remove(); }); show(card, '[data-gone]', true); return; }
      throw new Error(String(r.status));
    }).catch(function () { busy(b, false); show(card, '[data-err=save]', true); });
  }
  function reasonOf(panel) {
    var t = panel.querySelector('[data-f=reason]'), v = t ? t.value.trim() : '';
    show(panel, '[data-err=reason]', !v); if (!v && t) t.focus();
    return v;
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-act'), card = b.closest('article.card');
    if (act === 'open' && card) {
      var p = card.querySelector('[data-panel-of="' + b.getAttribute('data-panel') + '"]'); if (!p) return;
      p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); if (!p.hidden) { var t = p.querySelector('textarea'); if (t) t.focus(); }
      return;
    }
    if (act === 'approve' && card) return decide(card, 'approve', null, b);
    if ((act === 'reject' || act === 'take_down') && card) { var why = reasonOf(b.closest('.more')); if (why) decide(card, act, why, b); return; }
    if (act === 'suspend' && card) {
      var panel = b.closest('.more'), r = reasonOf(panel); if (!r) return;
      busy(b, true); show(card, '[data-err=save]', false);
      send('POST', '/api/v1/staff/suspend', { userId: b.getAttribute('data-user'), reason: r }).then(function (x) {
        if (!x.ok) throw new Error(String(x.status));
        panel.hidden = true; var o = card.querySelector('[data-panel=suspend]'); if (o) o.remove(); show(card, '[data-suspended]', true);
      }).catch(function () { busy(b, false); show(card, '[data-err=save]', true); });
      return;
    }
    /* ---------- the console ---------- */
    if (act === 'duty') {
      busy(b, true);
      send('POST', '/api/v1/staff/duty', { on: b.getAttribute('data-on') === '1' }).then(function (x) { if (!x.ok) throw new Error(String(x.status)); location.reload(); })
        .catch(function () { busy(b, false); var s = b.parentNode.querySelector('[data-err]'); if (s) s.hidden = false; });
      return;
    }
    if (act === 'remove') {
      busy(b, true);
      send('DELETE', '/api/v1/staff/members', { userId: b.getAttribute('data-user'), role: b.getAttribute('data-role') }).then(function (x) { if (!x.ok) throw new Error(String(x.status)); location.reload(); })
        .catch(function () { busy(b, false); var c = b.closest('.card'); if (c) show(c, '[data-err=other]', true); });
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || f.getAttribute('data-form') !== 'add') return;
    e.preventDefault();
    var c = f.closest('.card'), b = f.querySelector('button[type=submit]'), email = f.elements.email.value.trim();
    c.querySelectorAll('[data-err]').forEach(function (x) { x.hidden = true; });
    if (!email) { f.elements.email.focus(); return; }
    busy(b, true);
    send('POST', '/api/v1/staff/members', { email: email, role: f.elements.role.value }).then(function (x) {
      if (x.ok) { location.reload(); return; }
      return x.json().catch(function () { return {}; }).then(function (j) { busy(b, false); show(c, '[data-err="' + (j && /^(no account|student|demo)$/.test(j.error) ? j.error : 'other') + '"]', true); });
    }).catch(function () { busy(b, false); show(c, '[data-err=other]', true); });
  });

  /* ---------- the urgent alarm ---------- */
  var alarm = document.querySelector('.alarm'), words = document.getElementById('alarm-words'), duty = B.getAttribute('data-duty') === '1';
  if (!alarm || !words) return;
  var last = +alarm.getAttribute('data-urgent') || 0, title = document.title;
  function tone() {
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ctx = new A(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.6); setTimeout(function () { ctx.close(); }, 900);
    } catch (err) { /* no sound: the banner and the title still show */ }
  }
  function paint(n) {
    alarm.hidden = !n; alarm.setAttribute('data-urgent', String(n));
    var t = alarm.querySelector('[data-alarm-n]'); if (t) t.textContent = words.textContent.replace('{n}', String(n));
    document.title = n ? '(' + n + ') ' + title : title;
  }
  function poll() {
    if (document.hidden && !duty) return;
    fetch('/api/v1/staff/alarm', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return;
      if (j.urgent > last && duty) tone();
      last = j.urgent; paint(j.urgent);
    }).catch(function () {});
  }
  afterDecide = poll;
  setInterval(poll, 30000);
})();
