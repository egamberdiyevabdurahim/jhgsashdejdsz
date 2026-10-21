/* Jamals Global: the student's side of her family (m1-parent, PARENT_M1; off by default). Loaded on a live, non-demo student's page with
 * the switch on (src/server/pages.ts). Not design code: it draws in the design's own components (Settings' .set-h, .set-card, .set-row
 * .set-link; the sheet .cm-sheet, .cm-sheet-card, h3, .cm-note, .pf-btn; Home's pledge card .dz-pledge, M:023:2370; the notification
 * centre, window.JIA_notify) and keeps its words from the page's translator (data-no-i18n), in the student's language.
 *  - Q24 (FEATURES people "S BLOCKER"): Settings → Parents lists the parents linked to her (GET /api/v1/family), each with Remove
 *    (DELETE /api/v1/family/parents/:id, which retires her codes too), and "New family code" (POST /api/v1/family/code) for a code she
 *    thinks reached the wrong person. The code is shown, to read out to a second parent or another child's parent app.
 *  - Her parents' pledges on Home (JG_BOOT.m1.pledges, the design's card), "Reached!" and "Reward given ✓" as they happen.
 *  - A parent's congratulation (JG_BOOT.m1.notes) through the notification centre, once (POST /api/v1/notes/seen). */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null, M = BOOT && BOOT.m1;
  if (!BOOT || BOOT.demo || BOOT.role !== 'student' || !M || M.role !== 'student') return;
  var W = {
    en: { h: 'Family', row: 'Parents', none: 'None yet', title: 'Your parents', lead: 'They see your progress in the parent app. Remove anyone you do not know.', remove: 'Remove', sure: 'Remove {p}? They will no longer see your progress.', yes: 'Yes, remove', no: 'Keep',
      removed: '{p} was removed. Your family code changed too.', code: 'Family code', codeSub: 'A parent types it in the parent app. It works once, for 3 days.', newCode: 'New family code', newDone: 'A new code is ready. The old one no longer works.', close: 'Close', failed: 'Could not do that. Check your connection and try again.', empty: 'No parent is linked yet.',
      kicker: '{p}’s pledge', left: '{n} days left', lastDay: 'Last day', reached: 'Reached! {p} knows', given: 'Reward given ✓', bricks: '{n} study bricks', tasks: '{n} completed tasks', streak: '{n} days in a row', for: 'for {g}', brick: ' · 1 brick = 25 minutes in the Study Room' },
    uz: { h: 'Oila', row: 'Ota-onalar', none: 'Hali yoʻq', title: 'Ota-onangiz', lead: 'Ular natijalaringizni ota-ona ilovasida koʻradi. Tanimagan odamni olib tashlang.', remove: 'Olib tashlash', sure: '{p} olib tashlansinmi? U endi natijalaringizni koʻrmaydi.', yes: 'Ha, olib tashlash', no: 'Qoldirish',
      removed: '{p} olib tashlandi. Oila kodingiz ham oʻzgardi.', code: 'Oila kodi', codeSub: 'Ota-ona uni ota-ona ilovasida yozadi. U bir marta, 3 kun ishlaydi.', newCode: 'Yangi oila kodi', newDone: 'Yangi kod tayyor. Eskisi endi ishlamaydi.', close: 'Yopish', failed: 'Bajarib boʻlmadi. Internetni tekshirib, qayta urinib koʻring.', empty: 'Hali hech bir ota-ona ulanmagan.',
      kicker: '{p}ning vaʼdasi', left: '{n} kun qoldi', lastDay: 'Oxirgi kun', reached: 'Erishildi! {p} biladi', given: 'Sovgʻa berildi ✓', bricks: '{n} ta oʻqish gʻishti', tasks: '{n} ta bajarilgan vazifa', streak: '{n} kun ketma-ket', for: '{g} uchun', brick: ' · 1 gʻisht = Oʻqish xonasida 25 daqiqa' },
    ru: { h: 'Семья', row: 'Родители', none: 'Пока нет', title: 'Твои родители', lead: 'Они видят твой прогресс в приложении для родителей. Удали того, кого не знаешь.', remove: 'Удалить', sure: 'Удалить: {p}? Этот человек больше не увидит твой прогресс.', yes: 'Да, удалить', no: 'Оставить',
      removed: 'Удалено: {p}. Семейный код тоже сменился.', code: 'Семейный код', codeSub: 'Родитель вводит его в приложении для родителей. Он действует один раз, 3 дня.', newCode: 'Новый семейный код', newDone: 'Новый код готов. Старый больше не работает.', close: 'Закрыть', failed: 'Не получилось. Проверь соединение и попробуй ещё раз.', empty: 'Пока ни один родитель не подключён.',
      kicker: 'Обещание: {p}', left: 'Осталось дней: {n}', lastDay: 'Последний день', reached: 'Достигнуто! {p} в курсе', given: 'Награда вручена ✓', bricks: '{n} кирпичиков учёбы', tasks: '{n} выполненных заданий', streak: '{n} дней подряд', for: 'за {g}', brick: ' · 1 кирпичик = 25 минут в Учебной комнате' }
  };
  function lang() { var l = window.JG_I18N && typeof window.JG_I18N.lang === 'function' ? window.JG_I18N.lang() : String(document.documentElement.getAttribute('lang') || '').slice(0, 2); return l === 'uz' || l === 'ru' ? l : 'en'; }
  function w(k, v) { v = v || {}; return String(W[lang()][k]).replace(/\{(\w)\}/g, function (_, x) { return v[x] != null ? v[x] : ''; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function call(method, url, body) {
    return fetch(url, { method: method, credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.status === 204 ? { status: 204, body: {} } : r.json().then(function (b) { return { status: r.status, body: b }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }

  /* ---------- Q24: Settings → Parents ---------- */
  var PARENTS = null, CODE = BOOT.familyCode || '';
  function load() { return call('GET', '/api/v1/family').then(function (r) { if (r.status === 200) { PARENTS = r.body.parents || []; CODE = r.body.code || CODE; if (typeof r.body.code === 'string') BOOT.familyCode = r.body.code; } paintRow(); return r.status === 200; }); }
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  function paintRow() {
    var scroll = document.getElementById('set-scroll'); if (!scroll) return;
    var sec = document.getElementById('jg-fam-sec');
    if (!sec) {
      var lang0 = [].slice.call(scroll.querySelectorAll('.set-h'))[3] || null;   // before "Sound and motion" (after Privacy and safety)
      sec = document.createElement('div'); sec.id = 'jg-fam-sec'; sec.setAttribute('data-no-i18n', '');
      if (lang0) scroll.insertBefore(sec, lang0); else scroll.appendChild(sec);
    }
    var n = PARENTS ? PARENTS.length : null;
    sec.innerHTML = '<p class="set-h">' + esc(w('h')) + '</p><div class="set-card"><button class="set-row set-link" type="button" id="jg-fam-row"><span class="t"><b>' + esc(w('row')) + '</b></span><span class="v">' + esc(n === null ? '' : n ? PARENTS.map(function (p) { return p.name; }).join(', ') : w('none')) + '</span>' + CHEV + '</button></div>';
  }
  var sheet = null;
  function topZ() { var z = 60; document.querySelectorAll('.set-view, .pf-view, .cm-sheet').forEach(function (x) { if (x !== sheet && !x.hidden) z = Math.max(z, +getComputedStyle(x).zIndex || 0); }); return z; }
  function openSheet() {
    if (!sheet) {
      sheet = document.createElement('div'); sheet.className = 'cm-sheet'; sheet.id = 'jg-fam'; sheet.hidden = true; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'jg-fam-t'); sheet.setAttribute('data-no-i18n', '');
      document.body.appendChild(sheet);
      sheet.addEventListener('click', onSheet);
    }
    sheet.style.zIndex = String(topZ() + 1); paintSheet(); sheet.hidden = false;
  }
  var confirmId = null, note = '';
  function paintSheet() {
    var rows = (PARENTS || []).map(function (p) {
      var sure = confirmId === p.id, photo = p.photoUrl && /^\/api\/v1\/photo\//.test(p.photoUrl) ? p.photoUrl : '';
      return '<div class="jg-fam-p"><span class="jg-fam-av"' + (photo ? ' style="background-image:url(&quot;' + esc(photo) + '&quot;)"' : '') + '>' + (photo ? '' : esc(String(p.name || '?').charAt(0).toUpperCase())) + '</span><span class="jg-fam-n"><b>' + esc(p.name) + '</b></span>' +
        (sure ? '' : '<button class="pf-btn ghost" type="button" data-fam-rm="' + esc(p.id) + '">' + esc(w('remove')) + '</button>') + '</div>' +
        (sure ? '<p class="cm-note">' + esc(w('sure', { p: p.name })) + '</p><div class="jg-fam-acts"><button class="pf-btn" type="button" data-fam-yes="' + esc(p.id) + '">' + esc(w('yes')) + '</button><button class="pf-btn ghost" type="button" data-fam-no="">' + esc(w('no')) + '</button></div>' : '');
    }).join('');
    sheet.innerHTML = '<div class="cm-sheet-bg" data-fam-close=""></div><div class="cm-sheet-card"><h3 id="jg-fam-t">' + esc(w('title')) + '</h3><p class="cm-note">' + esc(PARENTS && PARENTS.length ? w('lead') : w('empty')) + '</p>' + rows +
      '<p class="jg-fam-k">' + esc(w('code')) + '</p><p class="jg-fam-code" data-no-i18n>' + esc(CODE) + '</p><p class="cm-note">' + esc(w('codeSub')) + '</p>' +
      (note ? '<p class="cm-note jg-fam-say" role="status">' + esc(note) + '</p>' : '') +
      '<div class="jg-fam-acts"><button class="pf-btn" type="button" data-fam-new="">' + esc(w('newCode')) + '</button><button class="pf-btn ghost" type="button" data-fam-close="">' + esc(w('close')) + '</button></div></div>';
  }
  function onSheet(e) {
    var t = e.target.closest('[data-fam-rm],[data-fam-yes],[data-fam-no],[data-fam-new],[data-fam-close]'); if (!t) return;
    if (t.hasAttribute('data-fam-close')) { sheet.hidden = true; confirmId = null; note = ''; return; }
    if (t.hasAttribute('data-fam-no')) { confirmId = null; paintSheet(); return; }
    if (t.hasAttribute('data-fam-rm')) { confirmId = t.getAttribute('data-fam-rm'); note = ''; paintSheet(); return; }
    t.disabled = true;
    if (t.hasAttribute('data-fam-yes')) {
      var id = t.getAttribute('data-fam-yes'), who = (PARENTS.filter(function (p) { return p.id === id; })[0] || {}).name || '';
      call('DELETE', '/api/v1/family/parents/' + encodeURIComponent(id)).then(function (r) {
        confirmId = null; note = r.status === 204 ? w('removed', { p: who }) : w('failed');
        (r.status === 204 ? load() : Promise.resolve()).then(paintSheet);
      });
      return;
    }
    call('POST', '/api/v1/family/code').then(function (r) { if (r.status === 200 && r.body.code) { CODE = r.body.code; BOOT.familyCode = r.body.code; note = w('newDone'); } else note = w('failed'); paintSheet(); });
  }
  var css = document.createElement('style');
  css.textContent = '#jg-fam .cm-sheet-card{text-align:left}#jg-fam .jg-fam-p{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid rgba(0,0,0,.07)}#jg-fam .jg-fam-p:first-of-type{border-top:0}' +
    '#jg-fam .jg-fam-av{flex:none;width:40px;height:40px;border-radius:50%;background:#e6f2ec center/cover no-repeat;display:grid;place-items:center;font-weight:800;color:#1f6b4c}#jg-fam .jg-fam-n{flex:1;min-width:0}#jg-fam .jg-fam-n b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#jg-fam .jg-fam-p .pf-btn{flex:none;width:auto;padding:0 14px;margin:0}#jg-fam .jg-fam-k{margin-top:16px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.6}' +
    '#jg-pl-card{align-self:flex-start;height:auto;min-height:0}' +
    '#jg-fam .jg-fam-code{font:800 26px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;margin:4px 0}#jg-fam .jg-fam-acts{display:grid;gap:8px;margin-top:12px}#jg-fam .jg-fam-say{font-weight:700}';
  (document.head || document.documentElement).appendChild(css);
  document.addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('#jg-fam-row')) { if (PARENTS === null) load().then(openSheet); else openSheet(); } });

  /* ---------- her parents' pledges on Home ---------- */
  var PL = (M.pledges || []).filter(function (p) { return p.status !== 'ended'; });
  function goal(p) { return w(p.goal, { n: p.target }); }
  function paintPledge() {
    var host = document.getElementById('pc-home'), old = document.getElementById('jg-pl-card'), p = PL[0];
    if (!host || !p) { if (old) old.remove(); return; }
    var pct = Math.min(100, Math.round(p.progress / p.target * 100)) || 0, who = p.from.first;
    var state = p.status === 'active' ? (p.days_left === 0 ? w('lastDay') : w('left', { n: p.days_left })) : p.status === 'reached' ? w('reached', { p: who }) : w('given');
    var html = '<section class="dz-pledge ' + (p.status === 'given' ? 'claimed' : p.status) + '" id="jg-pl-card" data-no-i18n aria-label="' + esc(w('kicker', { p: who })) + '"><span class="dz-gift" aria-hidden="true">🎁</span>' +
      '<span class="dz-txt"><small class="dz-kicker">' + esc(w('kicker', { p: who })) + ' · ' + esc(state) + '</small><b>' + esc(p.reward) + '</b>' +
      '<span class="dz-sub">' + esc(w('for', { g: goal(p) })) + '</span><span class="dz-bar"><em style="width:' + pct + '%"></em></span>' +
      '<span class="dz-num"><b>' + Math.min(p.progress, p.target) + '</b> / ' + p.target + (p.goal === 'bricks' ? esc(w('brick')) : '') + '</span></span></section>';
    if (old) old.outerHTML = html; else host.insertAdjacentHTML('afterend', html);
  }

  /* ---------- notes and reached pledges, once, through the notification centre ---------- */
  function notify() {
    if (typeof window.JIA_notify !== 'function') return;
    var notes = M.notes || [];
    notes.slice().reverse().forEach(function (n) { window.JIA_notify({ text: '<b>' + esc(n.words[lang()] || n.words.en) + '</b>' }); });
    if (notes.length) call('POST', '/api/v1/notes/seen', { ids: notes.map(function (n) { return n.id; }) });
    PL.filter(function (p) { return !p.seen && (p.status === 'reached' || p.status === 'given'); }).forEach(function (p) {
      window.JIA_notify({ text: '<b>' + esc(w('kicker', { p: p.from.first })) + ': ' + esc(p.reward) + '</b> ' + esc(p.status === 'reached' ? w('reached', { p: p.from.first }) : w('given')) });
      call('POST', '/api/v1/pledges/' + encodeURIComponent(p.id), { action: 'seen' });
    });
  }
  function start() { paintRow(); load(); paintPledge(); notify(); }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  document.addEventListener('jg:snapshot', paintPledge);
})();
