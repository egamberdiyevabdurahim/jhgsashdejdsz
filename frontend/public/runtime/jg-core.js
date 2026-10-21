/* Jamals Global runtime, M1 core (20 Oct 2026): diagnostics, roadmap and daily tasks, made true for a live student.
 * Loaded by src/server/pages.ts for a live, non-demo student with the engine (boot.core), NOT deferred, right after jg-runtime.js: the design
 * reads window.JG_ENGINE.stages and .reportLine while it renders. The demo family and /preview never load it and keep the design as drawn.
 *
 *  (5) HOME MAP. The design's middle stage dots are samples ("CAC · Milestone details to be added", "SAT · Suggested target: 1500+",
 *      "IELTS 7.5+", "AP 4 to 5", "Olympiads"). E.stages(STAGES) (called from syncGoal, M:003:18, D:001:207) puts the student's own stored
 *      steps there, five of them spread over her roadmap in date order, each with its date ("By 15 January 2027", "Date being confirmed").
 *      Before her roadmap exists the dots say only that her diagnostic sets them. The number of dots, the curve and the goal stay as drawn.
 *  (6) REPORT A WRONG DATE. E.reportLine(id) is what the milestone sheet says once she reported (M:023:796): saved, being checked (with the
 *      moderation queue on) or the outcome, from GET /api/v1/milestones/reports.
 *  (8) A STEP FOR THE COUNSELOR. With a counselor on staff (boot.core.staffed) a step she sent that waits shows the drawn waiting line in its
 *      sheet, and a returned one its reason above the proof box so she can send it again (GET /api/v1/checkpoints). With nobody on staff the
 *      server does not make her wait (src/server/core/checkpoint.ts) and the sheet promises no reviewer (M:023:903, :907).
 *  (9) REMINDERS. "Study reminders · 19:00" and "Push notifications" started ON and nothing sends either (D-2: never Telegram). They are
 *      shown off and disabled with a "soon" line until a sender exists.
 *  (4) THE CERTIFICATE DOOR (boot.core.m1 only). Under the update sheet's official score, "Send the certificate": a sheet in the design's own
 *      classes that uploads it (POST /api/v1/proofs?kind=score_report, then POST /api/v1/score-reports) and lists where each one stands.
 */
(function () {
  var BOOT = window.JG_BOOT || {}, CORE = BOOT.core || {}, E = window.JG_ENGINE;
  if (!E || BOOT.demo || !BOOT.engine) return;
  function lang() { var l = (E.cache && E.cache.lang) || ''; return l === 'uz' || l === 'ru' ? l : 'en'; }
  var W = {
    stageWait: { en: 'Your next step', uz: 'Keyingi qadamingiz', ru: 'Ваш следующий шаг' },
    stageWaitT: { en: 'Your diagnostic sets it', uz: 'Uni diagnostikangiz belgilaydi', ru: 'Его определит ваша диагностика' },
    by: { en: 'By {d}', uz: '{d}gacha', ru: 'До {d}' },
    noDate: { en: 'No fixed date', uz: 'Aniq sanasi yoʻq', ru: 'Без точной даты' },
    confirming: { en: 'Date being confirmed', uz: 'Sana aniqlashtirilmoqda', ru: 'Дата уточняется' },
    done: { en: 'Done ✓', uz: 'Bajarildi ✓', ru: 'Готово ✓' },
    reportChecking: { en: 'Reported. A reviewer is checking the official source.', uz: 'Xabar berildi. Mutaxassis rasmiy manbani tekshiryapti.', ru: 'Отправлено. Специалист проверяет официальный источник.' },
    reportSaved: { en: 'Reported. Thank you, we saved it.', uz: 'Xabar berildi. Rahmat, saqlab qoʻydik.', ru: 'Отправлено. Спасибо, мы это сохранили.' },
    dailyNote: { en: 'Your daily plan follows the hours you gave in your diagnostic.', uz: 'Kunlik rejangiz diagnostikada aytgan soatlaringizga qarab tuziladi.', ru: 'Дневной план строится по часам, которые вы указали в диагностике.' },
    remSoon: { en: 'Coming soon. No reminder is sent yet.', uz: 'Tez orada. Hozircha eslatma yuborilmaydi.', ru: 'Скоро. Пока напоминания не отправляются.' },
    pushSoon: { en: 'Coming soon. Nothing is sent to your phone yet.', uz: 'Tez orada. Hozircha telefoningizga hech narsa yuborilmaydi.', ru: 'Скоро. Пока на телефон ничего не приходит.' },
    waiting: { en: '⏳ Waiting for your counselor. Sent {d}.', uz: '⏳ Maslahatchingiz koʻrib chiqishini kutyapti. {d} yuborilgan.', ru: '⏳ Ждёт вашего консультанта. Отправлено {d}.' },
    kidPreview: { en: 'This was a preview. Your parent says OK in their own app, from the link you send them.', uz: 'Bu namuna edi. Ota-onangiz rozilikni oʻz ilovasida, siz yuborgan havola orqali beradi.', ru: 'Это был предпросмотр. Родитель даёт согласие в своём приложении, по ссылке, которую вы ему отправите.' },
    certBtn: { en: '📎 Send the certificate too', uz: '📎 Sertifikatni ham yuborish', ru: '📎 Отправить и сертификат' },
    certH: { en: 'Send your certificate', uz: 'Sertifikatingizni yuboring', ru: 'Отправьте сертификат' },
    certMod: { en: 'Official score', uz: 'Rasmiy ball', ru: 'Официальный балл' },
    certWhy: { en: 'A photo or PDF of the official score report. A person at Jamals checks it; then your score counts as verified.', uz: 'Rasmiy natija varaqasining surati yoki PDF fayli. Jamals xodimi uni tekshiradi, keyin balingiz tasdiqlangan hisoblanadi.', ru: 'Фото или PDF официального результата. Сотрудник Jamals проверит его, и балл будет считаться подтверждённым.' },
    score: { en: 'Score', uz: 'Ball', ru: 'Балл' }, date: { en: 'Test date', uz: 'Imtihon sanasi', ru: 'Дата экзамена' },
    pick: { en: 'Take a photo or choose a file', uz: 'Suratga oling yoki fayl tanlang', ru: 'Сфотографируйте или выберите файл' },
    pickS: { en: 'PDF, JPG, PNG or WebP, up to 4 MB. Location data is removed.', uz: 'PDF, JPG, PNG yoki WebP, 4 MB gacha. Joylashuv maʼlumoti olib tashlanadi.', ru: 'PDF, JPG, PNG или WebP, до 4 МБ. Данные о местоположении удаляются.' },
    send: { en: 'Send for a check', uz: 'Tekshiruvga yuborish', ru: 'Отправить на проверку' }, close: { en: 'Close', uz: 'Yopish', ru: 'Закрыть' },
    sent: { en: 'Sent. We will tell you here when it is checked.', uz: 'Yuborildi. Tekshirilgach, shu yerda aytamiz.', ru: 'Отправлено. Когда проверим, сообщим здесь.' },
    failed: { en: 'Could not send it. Check the file and try again.', uz: 'Yuborilmadi. Faylni tekshirib, qayta urinib koʻring.', ru: 'Не отправилось. Проверьте файл и попробуйте ещё раз.' },
    pending: { en: 'Waiting for a check', uz: 'Tekshiruv kutilmoqda', ru: 'Ждёт проверки' }, verified: { en: 'Verified ✓', uz: 'Tasdiqlandi ✓', ru: 'Подтверждено ✓' },
    rejected: { en: 'Not accepted', uz: 'Qabul qilinmadi', ru: 'Не принят' }, yours: { en: 'Your certificates', uz: 'Sertifikatlaringiz', ru: 'Ваши сертификаты' },
  };
  function w(k, v) { var s = (W[k] && (W[k][lang()] || W[k].en)) || ''; return v ? s.replace(/\{(\w+)\}/g, function (_, x) { return v[x] == null ? '' : String(v[x]); }) : s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  var MONTHS = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'] };
  function day(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); if (!m) return '';
    var y = +m[1], mo = MONTHS[lang()][+m[2] - 1], d = +m[3];
    return lang() === 'uz' ? y + '-yil ' + d + '-' + mo : d + ' ' + mo + ' ' + y;
  }
  function api(method, url, body, raw) {
    var init = { method: method, headers: { 'x-jg-uid': BOOT.uid } };
    if (raw) { init.headers['content-type'] = raw.type; init.body = raw; } else if (body !== undefined) { init.headers['content-type'] = 'application/json'; init.body = JSON.stringify(body); }
    return fetch(url, init).then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }, function () { return { status: r.status, body: null }; }); }, function () { return { status: 0, body: null }; });
  }

  /* ---- (5) the Home map's stage dots ---- */
  /* a dot's short name, as the design's are ("SAT", "IELTS"): the part before a colon, else the title, cut at a word */
  function shortOf(t) { var c = t.indexOf(':'); if (c > 0 && c <= 18) return t.slice(0, c); if (t.length <= 18) return t; var k = t.lastIndexOf(' ', 17); return (k > 6 ? t.slice(0, k) : t.slice(0, 17)) + '…'; }
  E.stages = function (STAGES) {
    try {
      if (!STAGES || STAGES.length < 3) return;
      var n = STAGES.length - 2, R = E.cache && E.cache.roadmap, G = E.cache && E.cache.goal, ms = R && R.milestones ? R.milestones.filter(function (m) { return !(G && m.title_i18n === G.short); }) : [];   /* the goal's own row is the last dot already */
      var dated = ms.filter(function (m) { return m.due; }).sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
      var list = dated.concat(ms.filter(function (m) { return !m.due; }));
      for (var i = 0; i < n; i++) {
        var m = list.length ? list[list.length <= n ? Math.min(i, list.length - 1) : Math.round(i * (list.length - 1) / (n - 1))] : null;
        if (m && list.length < n && i >= list.length) m = null;                       // fewer steps than dots: the rest wait for her plan
        var t = m ? String(m.title_i18n || '') : w('stageWait');
        STAGES[i + 1] = { short: shortOf(t), title: t,
          target: !m ? w('stageWaitT') : m.status === 'done' ? w('done') : m.due ? (m.needs_verification ? w('confirming') : w('by', { d: day(m.due) })) : w('noDate') };
      }
    } catch (e) {}
  };

  /* ---- (6) "Report a wrong date" ---- */
  var reports = {};
  function loadReports() { return api('GET', '/api/v1/milestones/reports').then(function (r) { if (r.status === 200 && r.body && r.body.reports) { r.body.reports.forEach(function (x) { reports[x.milestone_id] = x.text; }); tellOutcomes(r.body.reports); } }); }
  /* an outcome is told once, through the design's own notification centre (as jg-roadmap-ready.js does); a tap opens her roadmap */
  var SEEN = 'jg.core.reports.v1';
  function tellOutcomes(rows) {
    if (typeof window.JIA_notify !== 'function') return;
    var seen = []; try { var o = JSON.parse(localStorage.getItem(SEEN) || 'null'); if (o && o.uid === BOOT.uid && Array.isArray(o.ids)) seen = o.ids; } catch (e) {}
    rows.filter(function (x) { return x.state !== 'open' && seen.indexOf(x.milestone_id + ':' + x.state) === -1; }).forEach(function (x) {
      var L = window.JIA_league && window.JIA_league.ME, note = { text: '<b>' + esc(x.text) + '</b>', go: function () { if (typeof window.JG_openRoadmap === 'function') window.JG_openRoadmap(); } };
      if (L && typeof L.league === 'number') note.league = L.league;
      try { window.JIA_notify(note); } catch (e) {}
      seen.push(x.milestone_id + ':' + x.state);
    });
    try { localStorage.setItem(SEEN, JSON.stringify({ uid: BOOT.uid, ids: seen })); } catch (e) {}
  }
  E.reportLine = function (id) { return reports[id] || w(CORE.moderation ? 'reportChecking' : 'reportSaved'); };
  var report0 = E.report;
  if (typeof report0 === 'function') E.report = function (id) { reports[id] = reports[id] || w(CORE.moderation ? 'reportChecking' : 'reportSaved'); report0.apply(this, arguments); setTimeout(loadReports, 2500); };
  if (document.readyState === 'complete') loadReports(); else window.addEventListener('load', loadReports);   /* after the design has made its notification centre */

  /* ---- (9) the reminder switches nothing sends ---- */
  function quietSwitches() {
    var S = window.JIA_SETTINGS; if (S) { S.reminders = false; S.push = false; try { var o = JSON.parse(localStorage.getItem('jia.settings') || '{}'); o.reminders = false; o.push = false; localStorage.setItem('jia.settings', JSON.stringify(o)); } catch (e) {} }
    /* "Daily study goal" is saved and read by nothing: the plan follows the diagnostic's hours, so the choice is shown, not offered */
    document.querySelectorAll('.set-seg button[data-k="daily"]').forEach(function (b) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); });
    var seg = document.querySelector('.set-seg button[data-k="daily"]'), drow = seg && seg.closest('.set-row');
    if (drow && !drow.querySelector('.jg-daily-note')) { var dn = document.createElement('small'); dn.className = 'jg-daily-note'; dn.setAttribute('data-notr', ''); dn.textContent = w('dailyNote'); dn.style.cssText = 'display:block;margin-top:6px;color:var(--muted, #587066);font-size:12px;line-height:1.4'; drow.appendChild(dn); }
    [['reminders', 'remSoon'], ['push', 'pushSoon']].forEach(function (p) {
      document.querySelectorAll('.set-sw[data-k="' + p[0] + '"]').forEach(function (sw) {
        sw.setAttribute('aria-checked', 'false'); sw.disabled = true; sw.setAttribute('aria-disabled', 'true'); sw.classList.add('jg-soon');
        var row = sw.closest('.set-row'), sm = row && row.querySelector('.t small');
        if (row && !sm) { sm = document.createElement('small'); row.querySelector('.t').appendChild(sm); }
        if (sm) { sm.textContent = w(p[1]); sm.setAttribute('data-notr', ''); }
      });
    });
  }

  /* ---- (8) a step that waits for the counselor, or came back ---- */
  var cps = null;
  function loadCheckpoints(then) { if (!CORE.staffed) return; api('GET', '/api/v1/checkpoints').then(function (r) { if (r.status === 200 && r.body) { cps = {}; (r.body.checkpoints || []).forEach(function (c) { if (c.task_id && !cps[c.task_id]) cps[c.task_id] = c; }); } if (then) then(); }); }
  function taskOf(title) { var T = (E.cache && E.cache.tasks) || {}, hit = null; Object.keys(T).forEach(function (d) { (T[d] || []).forEach(function (t) { if (!hit && cps && cps[t.id] && (t.title_i18n === title || (window.JG_I18N && window.JG_I18N.text && window.JG_I18N.text(t.title_i18n) === title))) hit = t; }); }); return hit; }
  function markSheet(sheet) {
    if (!cps || sheet.getAttribute('data-jg-cp')) return; sheet.setAttribute('data-jg-cp', '1');
    var h = sheet.querySelector('#jt-h'), box = sheet.querySelector('#jt-proof'); if (!h || !box) return;
    var t = taskOf(String(h.textContent || '').trim()), c = t && cps[t.id]; if (!c || t.status !== 'scheduled') return;
    var p = document.createElement('div');
    if (c.status === 'open') { p.innerHTML = '<p class="jt-wait">' + esc(w('waiting', { d: day(c.at) })) + '</p>'; box.parentNode.insertBefore(p, box); box.hidden = true; }
    else if (c.status === 'returned') { p.innerHTML = '<p class="jt-gate">↩ ' + esc(c.text) + (c.note ? '<br><i>“' + esc(c.note) + '”</i>' : '') + '</p>'; /* the server's sentence already says it came back (src/engine/verify/words.ts) */ box.parentNode.insertBefore(p, box); }
  }

  /* ---- (1) under 14: the parent check on her own phone is a preview (src/server/core/consent.ts records no consent from it) ---- */
  function kidPreview(done) {
    var D = E.cache && E.cache.derived; if (!D || D.age == null || D.age >= 14 || done.querySelector('.jg-kid-preview')) return;
    var on = document.querySelector('#jp-view [data-lang][aria-pressed="true"]'), l = on ? on.getAttribute('data-lang') : lang();
    var p = document.createElement('p'); p.className = 'jp-lead jg-kid-preview'; p.textContent = W.kidPreview[l] || W.kidPreview.en; done.appendChild(p);
  }

  /* ---- (4) the certificate door ---- */
  var TESTS = [['ielts', 'IELTS'], ['toefl', 'TOEFL'], ['sat', 'SAT'], ['det', 'Duolingo'], ['act', 'ACT'], ['cefr', 'CEFR'], ['milliy', 'Milliy sertifikat'], ['agency', 'DTM']];
  function door(form) {
    if (!CORE.m1 || !CORE.reviewers || form.querySelector('.jg-cert-open')) return;   /* nobody to check it: no door (src/server/core/reviewers.ts) */
    var b = document.createElement('button'); b.type = 'button'; b.className = 'dg-link jg-cert-open'; b.textContent = w('certBtn');
    b.onclick = function () { certSheet(); }; form.appendChild(b);
  }
  function certSheet() {
    var old = document.getElementById('jg-cert'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'jr-sheet'; el.id = 'jg-cert';
    el.innerHTML = '<div class="jr-sheet-bg" data-c="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jg-cert-h"><p class="dg-mod">' + esc(w('certMod')) + '</p><h3 id="jg-cert-h">' + esc(w('certH')) + '</h3><p class="jr-why">' + esc(w('certWhy')) + '</p>'
      + '<div class="dg-money"><select class="dg-field" id="jg-cert-t" aria-label="Test">' + TESTS.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select><input class="dg-field" type="number" step="any" id="jg-cert-s" placeholder="' + esc(w('score')) + '" aria-label="' + esc(w('score')) + '"></div>'
      + '<label class="dg-lab">' + esc(w('date')) + '<input class="dg-field" type="date" id="jg-cert-d"></label>'
      + '<label class="dg-drop"><input type="file" id="jg-cert-f" accept="application/pdf,image/jpeg,image/png,image/webp"><span class="dg-drop-i">📄</span><b id="jg-cert-n">' + esc(w('pick')) + '</b><small>' + esc(w('pickS')) + '</small></label>'
      + '<p class="dg-hint" id="jg-cert-said" role="status"></p><div class="jr-acts"><button class="dg-go" type="button" id="jg-cert-go" disabled>' + esc(w('send')) + '</button><button class="dg-link" type="button" data-c="shut">' + esc(w('close')) + '</button></div><div id="jg-cert-list"></div></div>';
    var host = document.getElementById('jr-sheet'); el.style.zIndex = String(host ? +host.style.zIndex + 1 : (window.JIA_z ? window.JIA_z() : 90));
    (host ? host.parentNode : document.body).appendChild(el);
    var f = el.querySelector('#jg-cert-f'), s = el.querySelector('#jg-cert-s'), go = el.querySelector('#jg-cert-go'), said = el.querySelector('#jg-cert-said');
    function ready() { go.disabled = !(f.files && f.files[0] && s.value); }
    f.onchange = function () { el.querySelector('#jg-cert-n').textContent = f.files[0] ? f.files[0].name : w('pick'); ready(); }; s.oninput = ready;
    go.onclick = function () {
      go.disabled = true; said.textContent = '';
      api('POST', '/api/v1/proofs?kind=score_report', undefined, f.files[0]).then(function (r) {
        if (r.status !== 200 || !r.body || !r.body.id) return r;
        var d = el.querySelector('#jg-cert-d').value, body = { test: el.querySelector('#jg-cert-t').value, scores: { total: +s.value }, proof: r.body.id };
        if (d) body.testDate = d;
        return api('POST', '/api/v1/score-reports', body);
      }).then(function (r) { var ok = r && r.status === 200; said.textContent = ok ? w('sent') : w('failed'); if (!ok) go.disabled = false; else list(); });
    };
    el.addEventListener('click', function (e) { if (e.target.closest('[data-c=shut]')) el.remove(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') el.remove(); });
    function list() {
      api('GET', '/api/v1/score-reports').then(function (r) {
        var rows = (r.body && r.body.reports) || [], L = el.querySelector('#jg-cert-list'); if (!rows.length) { L.innerHTML = ''; return; }
        L.innerHTML = '<b class="jr-next-h">' + esc(w('yours')) + '</b><ul class="jr-goals">' + rows.map(function (x) { var sc = x.scores || {}; return '<li><span>' + esc(String(x.test).toUpperCase()) + ' ' + esc(sc.total != null ? sc.total : sc.level || '') + '</span>' + esc(w(x.status === 'verified' ? 'verified' : x.status === 'rejected' ? 'rejected' : 'pending')) + '</li>'; }).join('') + '</ul>';
      });
    }
    list(); setTimeout(function () { s.focus({ preventScroll: true }); }, 60);
  }

  /* ---- one observer for what the design draws later: a task sheet, the update sheet's score form, the Settings rows ---- */
  function seen(n) {
    if (n.id === 'jt-sheet') { if (CORE.staffed) { loadCheckpoints(function () { markSheet(n); }); } return; }
    if (n.classList && n.classList.contains('jp-done') && n.closest('#jp-view')) { kidPreview(n); return; }
    if (n.id === 'ju-ok' && n.parentNode && n.parentNode.id === 'ju-form' && document.getElementById('ju-t')) { door(n.parentNode); return; }
    if ((n.classList && n.classList.contains('set-row')) || (n.querySelector && n.querySelector('.set-sw[data-k="reminders"], .set-sw[data-k="push"]'))) quietSwitches();
  }
  function start() {
    quietSwitches();
    if (typeof MutationObserver === 'function') new MutationObserver(function (ms) { ms.forEach(function (m) { for (var i = 0; i < m.addedNodes.length; i++) if (m.addedNodes[i].nodeType === 1) seen(m.addedNodes[i]); }); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.JG_CORE = { reload: function () { loadReports(); loadCheckpoints(); }, stages: E.stages };
})();
