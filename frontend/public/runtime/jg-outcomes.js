/* Jamals Global runtime: "Any news from your universities?" (P5i, spec §3.10.3 and §6.1; owner 7 Oct 2026 decision 4a: "students report
 * decisions in the app with optional proof"). Not design code: a sheet the design does not have, drawn with its own sheet markup and controls.
 * A student's: the design's .cm-sheet / .cm-sheet-card / h3 / .cm-note with the diagnostic's own .dg-chip choices, .dg-field selects and
 * .pf-btn buttons (a bottom sheet on the phone, a centred card on the desktop, as the design's own sheets are). A parent's: the parent
 * design's own #sheet and #scrim (.grab, h3, .lead, .btn-block, .sheet-close), with pills in its tokens.
 * Only when the boot carries a prompt (src/server/outcomes/store.ts promptFor: a live, non-demo account whose window is open and not yet
 * seen; December, March, April, May, and August for Uzbek places). Shown once per window (POST /api/v1/outcomes/prompt 'shown'); Save
 * sends the answers (POST /api/v1/outcomes with the window, which marks it answered); "Skip for now", the scrim and Escape skip it.
 * A decision letter may be added (POST /api/v1/proofs?kind=decision). Every word in en/uz/ru (Uzbek with U+02BB): new copy for the owner's
 * review, kept from the translators (the parent design's data-notr; the student's words are already in the student's language). */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT, P = BOOT && BOOT.outcomePrompt;
  if (!P || BOOT.demo || !P.targets || !P.targets.length) return;
  var PARENT = BOOT.role === 'parent';

  var T = {
    en: {
      title: 'Any news from your universities?', titleP: "Any news from {name}'s universities?",
      lead: 'Tell us what each university decided, if you know. This makes the chances in Jamals Global more accurate for every student. Staff use your answers only to check our estimates. You can skip this.',
      leadP: 'Tell us what each university decided for {name}, if you know. This makes the chances in Jamals Global more accurate for every student. Staff use your answers only to check our estimates. You can skip this.',
      admitted: 'Admitted', waitlisted: 'Waitlist', deferred: 'Deferred', rejected: 'Not admitted', pending: 'No answer yet', not_applied: 'Did not apply', not_appliedP: 'Did not apply',
      grant: 'Grant place', contract: 'Contract place', not_admitted: 'Not admitted',
      round: 'Round (optional)', rUnsure: 'Not sure', rEd: 'Early Decision (ED)', rEa: 'Early Action (EA)', rRd: 'Regular Decision (RD)', rRolling: 'Rolling',
      aid: 'Scholarship or aid', aUnknown: 'Not sure yet', aNone: 'None', aPartial: 'Partial', aFull: 'Full',
      score: 'Your test score (optional, out of 189)', letter: 'Add the decision letter (optional)', letterAdded: 'Letter added', letterBusy: 'Adding the letter…',
      letterBad: 'That file cannot be used. Choose a PDF or a photo under 4 MB.', decision: 'Decision',
      save: 'Save', saving: 'Saving…', skip: 'Skip for now', close: 'Close', saved: 'Thank you. Saved.',
      none: 'Choose an answer for at least one university, or skip.', errNet: 'Could not save. Check your connection and try again.', errLimit: 'Too many tries for now. Try again in an hour.',
    },
    uz: {
      title: 'Universitetlardan xabar bormi?', titleP: '{name}ning universitetlaridan xabar bormi?',
      lead: 'Agar bilsangiz, har bir universitet qanday qaror qilganini yozing. Bu Jamals Globaldagi imkoniyatlarni har bir oʻquvchi uchun aniqroq qiladi. Xodimlar javoblaringizdan faqat baholarimizni tekshirish uchun foydalanadi. Buni oʻtkazib yuborishingiz mumkin.',
      leadP: 'Agar bilsangiz, har bir universitet {name} uchun qanday qaror qilganini yozing. Bu Jamals Globaldagi imkoniyatlarni har bir oʻquvchi uchun aniqroq qiladi. Xodimlar javoblaringizdan faqat baholarimizni tekshirish uchun foydalanadi. Buni oʻtkazib yuborishingiz mumkin.',
      admitted: 'Qabul qilindi', waitlisted: 'Kutish roʻyxati', deferred: 'Keyinga qoldirildi', rejected: 'Qabul qilinmadi', pending: 'Hali javob yoʻq', not_applied: 'Hujjat topshirmadim', not_appliedP: 'Hujjat topshirmagan',
      grant: 'Grant asosida', contract: 'Kontrakt asosida', not_admitted: 'Qabul qilinmadi',
      round: 'Bosqich (ixtiyoriy)', rUnsure: 'Bilmayman', rEd: 'Early Decision (ED)', rEa: 'Early Action (EA)', rRd: 'Regular Decision (RD)', rRolling: 'Rolling (doimiy qabul)',
      aid: 'Grant yoki moliyaviy yordam', aUnknown: 'Hali bilmayman', aNone: 'Yoʻq', aPartial: 'Qisman', aFull: 'Toʻliq',
      score: 'Test ballingiz (ixtiyoriy, 189 dan)', letter: 'Qaror xatini qoʻshish (ixtiyoriy)', letterAdded: 'Xat qoʻshildi', letterBusy: 'Xat qoʻshilmoqda…',
      letterBad: 'Bu fayl yaroqsiz. 4 MB dan kichik PDF yoki rasm tanlang.', decision: 'Qaror',
      save: 'Saqlash', saving: 'Saqlanmoqda…', skip: 'Hozircha oʻtkazib yuborish', close: 'Yopish', saved: 'Rahmat. Saqlandi.',
      none: 'Kamida bitta universitet uchun javob tanlang yoki oʻtkazib yuboring.', errNet: 'Saqlab boʻlmadi. Internetni tekshirib, qaytadan urinib koʻring.', errLimit: 'Hozircha urinishlar juda koʻp. Bir soatdan keyin urinib koʻring.',
    },
    ru: {
      title: 'Есть новости от университетов?', titleP: 'Есть новости от университетов, куда поступает {name}?',
      lead: 'Если знаете, укажите, какое решение принял каждый университет. Так шансы в Jamals Global станут точнее для всех учеников. Сотрудники используют ваши ответы только для проверки наших оценок. Этот шаг можно пропустить.',
      leadP: 'Если знаете, укажите, что решил каждый университет, куда подавал(а) документы {name}. Так шансы в Jamals Global станут точнее для всех учеников. Сотрудники используют ваши ответы только для проверки наших оценок. Этот шаг можно пропустить.',
      admitted: 'Принят(а)', waitlisted: 'Лист ожидания', deferred: 'Отложено', rejected: 'Не принят(а)', pending: 'Ответа пока нет', not_applied: 'Не подавал(а)', not_appliedP: 'Не подавал(а)',
      grant: 'На грант', contract: 'На контракт', not_admitted: 'Не принят(а)',
      round: 'Этап (необязательно)', rUnsure: 'Не знаю', rEd: 'Early Decision (ED)', rEa: 'Early Action (EA)', rRd: 'Regular Decision (RD)', rRolling: 'Rolling (по мере подачи)',
      aid: 'Стипендия или финансовая помощь', aUnknown: 'Пока не знаю', aNone: 'Нет', aPartial: 'Частичная', aFull: 'Полная',
      score: 'Ваш балл (необязательно, из 189)', letter: 'Добавить письмо с решением (необязательно)', letterAdded: 'Письмо добавлено', letterBusy: 'Добавляем письмо…',
      letterBad: 'Этот файл не подходит. Выберите PDF или фото меньше 4 МБ.', decision: 'Решение',
      save: 'Сохранить', saving: 'Сохраняем…', skip: 'Пропустить пока', close: 'Закрыть', saved: 'Спасибо. Сохранено.',
      none: 'Выберите ответ хотя бы для одного университета или пропустите.', errNet: 'Не удалось сохранить. Проверьте подключение и попробуйте ещё раз.', errLimit: 'Слишком много попыток. Попробуйте через час.',
    },
  };
  function lang() {
    var l = '';
    if (!PARENT && window.JG_I18N && typeof window.JG_I18N.lang === 'function') l = window.JG_I18N.lang();
    if (!l) l = String(document.documentElement.getAttribute('lang') || '').slice(0, 2);
    return T[l] ? l : 'en';
  }
  /** The words of one language, a parent's naming the child. */
  function words(l, parent, name) {
    var w = T[l] || T.en, out = {}, k;
    for (k in w) out[k] = w[k];
    if (parent) { out.title = w.titleP.replace('{name}', name); out.lead = w.leadP.replace('{name}', name); out.not_applied = w.not_appliedP; }
    return out;
  }
  var STATE_CHOICES = ['grant', 'contract', 'not_admitted', 'pending', 'not_applied'];
  var CHOICES = ['admitted', 'waitlisted', 'deferred', 'rejected', 'pending', 'not_applied'];
  var ROUNDS = [['', 'rUnsure'], ['ed', 'rEd'], ['ea', 'rEa'], ['rd', 'rRd'], ['rolling', 'rRolling']];
  var AIDS = [['unknown', 'aUnknown'], ['none', 'aNone'], ['partial', 'aPartial'], ['full', 'aFull']];
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  /** The report the route takes, from what was chosen per university ({ d, round, aid, score, proof }); a university with no choice is left out. */
  function itemsOf(targets, picked) {
    var out = [];
    targets.forEach(function (t) {
      var p = picked[t.key];
      if (!p || !p.d) return;
      var it = { target: t.key };
      if (t.state) {
        it.decision = p.d === 'grant' || p.d === 'contract' ? 'admitted' : p.d === 'not_admitted' ? 'rejected' : p.d;
        if (p.d === 'grant' || p.d === 'contract' || p.d === 'not_admitted') {
          it.round = 'uz_state'; it.placement = p.d === 'not_admitted' ? 'none' : p.d;
          var s = Number(String(p.score || '').replace(',', '.'));
          if (String(p.score || '').trim() && isFinite(s) && s >= 0 && s <= 189) it.agencyScore = Math.round(s * 10) / 10;
        }
      } else {
        it.decision = p.d;
        if (p.round && p.round !== 'unsure') it.round = p.round;
        if (p.d === 'admitted' && p.aid) it.aid = p.aid;
      }
      if (p.proof && UUID.test(p.proof)) it.proof = p.proof;
      out.push(it);
    });
    return out;
  }

  var api = window.JG_OUTCOMES = { open: open, _items: itemsOf, _words: words, _T: T };

  /* ---------- the sheet ---------- */
  // the student's card: its list scrolls, the title, the note and the buttons stay in view (a flex column, as the design's own .rl-sheet card)
  var CSS = '#jg-oc .cm-sheet-card { display: flex; flex-direction: column; max-height: 88%; overflow: hidden; } #jg-oc .cm-sheet-card > * { flex: none; }'
    + ' #jg-oc .cm-sheet-card > .jg-oc-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }'
    + ' #jg-oc #jg-oc-t:focus { outline: none; } #jg-oc [hidden], #jg-oc-p [hidden] { display: none !important; }'
    + ' .jg-oc-list { display: grid; align-content: start; gap: 14px; margin: 14px 0 4px; text-align: left; }'
    + ' .jg-oc-uni { display: grid; gap: 8px; padding: 12px; border-radius: 16px; background: #f4f8f6; }'
    + ' .jg-oc-uni > b { font-size: 15px; font-weight: 800; color: var(--ink, #10271e); }'
    + ' .jg-oc-more { display: grid; gap: 8px; } .jg-oc-more label { display: grid; gap: 4px; font-size: 12.5px; font-weight: 700; color: var(--muted, #587066); }'
    + ' .jg-oc-letter { justify-self: start; min-height: 40px; padding: 0 2px; border: 0; background: none; color: var(--accent, #207251); font: 700 13.5px var(--font, inherit); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }'
    + ' .jg-oc-msg { min-height: 18px; margin: 8px 0 0; font-size: 13px; font-weight: 600; line-height: 1.4; color: var(--muted, #587066); } .jg-oc-msg.err { color: var(--danger, #b0402f); }'
    + ' #jg-oc .jg-oc-acts { display: grid; gap: 8px; margin-top: 10px; } #jg-oc .jg-oc-acts .pf-btn { flex: none; width: 100%; height: 44px; } #jg-oc .pf-btn:disabled { opacity: .6; }'
    + ' #jg-oc .dg-chips { gap: 6px; } #jg-oc .dg-chip { padding: 8px 12px; font-size: 13.5px; }'
    // the parent apps: pills in the parent design's tokens (it has no choice chip of its own), its selects as its fields
    + ' #jg-oc-p h3 { padding: 0 34px; }'                                                                          // clear of the design's close button
    // the design's #sheet scrolls as a whole, which left Save and Skip below a phone's fold (review fix, 7 Oct): while it holds the prompt,
    // its list scrolls and the title, the note and the buttons stay in view, as on the student's card
    + ' #sheet:has(> #jg-oc-p) { display: flex; flex-direction: column; overflow: hidden; }'
    + ' #jg-oc-p { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; } #jg-oc-p > * { flex: none; }'
    + ' #jg-oc-p > .jg-oc-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }'
    + ' #jg-oc-p .jg-oc-uni { background: var(--mist, #f3f7f5); } #jg-oc-p .jg-oc-pills { display: flex; flex-wrap: wrap; gap: 6px; }'
    + ' #jg-oc-p .jg-oc-pill { min-height: 40px; padding: 0 12px; border: 1.5px solid var(--line-2, #d7e2dc); border-radius: 999px; background: #fff; color: var(--ink, #10271e); font: 700 13.5px var(--sans, inherit); cursor: pointer; }'
    + ' #jg-oc-p .jg-oc-pill[aria-pressed="true"] { border-color: var(--forest, #123a29); background: var(--forest, #123a29); color: #fff; }'
    + ' #jg-oc-p select, #jg-oc-p input[type="number"] { width: 100%; height: 44px; padding: 0 12px; border: 1.5px solid var(--line-2, #d7e2dc); border-radius: 12px; background: #fff; color: var(--ink, #10271e); font: 600 15px var(--sans, inherit); }'
    + ' #jg-oc-p .jg-oc-acts { display: grid; gap: 0; margin-top: 14px; } #jg-oc-p .btn:disabled { opacity: .6; }';

  var sheet = null, picked = {}, busy = false, shown = false, W = null;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function chips(t) {
    var list = t.state ? STATE_CHOICES : CHOICES, cls = PARENT ? 'jg-oc-pill' : 'dg-chip';
    return '<div class="' + (PARENT ? 'jg-oc-pills' : 'dg-chips') + '" role="group" aria-label="' + esc(t.short + ': ' + W.decision) + '">'
      + list.map(function (d) { return '<button type="button" class="' + cls + '" aria-pressed="false" data-d="' + d + '">' + esc(W[d]) + '</button>'; }).join('') + '</div>';
  }
  function selectOf(name, opts) {
    return '<select class="dg-field" data-f="' + name + '">' + opts.map(function (o) { return '<option value="' + o[0] + '">' + esc(W[o[1]]) + '</option>'; }).join('') + '</select>';
  }
  function row(t) {
    var more = t.state
      ? '<label data-show="grant contract not_admitted" hidden>' + esc(W.score) + '<input class="dg-field" type="number" inputmode="decimal" min="0" max="189" step="0.1" data-f="score"></label>'
      : '<label data-show="admitted waitlisted deferred rejected" hidden>' + esc(W.round) + selectOf('round', ROUNDS) + '</label>'
        + '<label data-show="admitted" hidden>' + esc(W.aid) + selectOf('aid', AIDS) + '</label>';
    return '<section class="jg-oc-uni" data-key="' + esc(t.key) + '"><b>' + esc(t.short || t.name) + '</b>' + chips(t)
      + '<div class="jg-oc-more">' + more
      + '<button type="button" class="jg-oc-letter" data-show="admitted waitlisted deferred rejected grant contract not_admitted" hidden>' + esc(W.letter) + '</button>'
      + '<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" hidden></div></section>';
  }
  function body() { return '<div class="jg-oc-list">' + P.targets.map(row).join('') + '</div><p class="jg-oc-msg" role="status" aria-live="polite"></p>'; }
  var X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function build() {
    W = words(lang(), PARENT, (P.child && P.child.firstName) || '');
    var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
    if (PARENT) {
      var sh = document.getElementById('sheet');
      if (!sh) return false;
      sh.className = 'sheet';
      sh.innerHTML = '<div id="jg-oc-p" data-notr><button class="sheet-close" type="button" data-jg-oc="skip" aria-label="' + esc(W.close) + '">' + X + '</button><div class="grab"></div>'
        + '<h3 id="sheetTitle">' + esc(W.title) + '</h3><p class="lead">' + esc(W.lead) + '</p>' + body()
        + '<div class="jg-oc-acts"><button class="btn btn-primary btn-block" type="button" data-jg-oc="save">' + esc(W.save) + '</button>'
        + '<button class="btn btn-ghost btn-block" type="button" data-jg-oc="skip">' + esc(W.skip) + '</button></div></div>';
      sheet = sh.querySelector('#jg-oc-p');
    } else {
      sheet = document.createElement('div');
      sheet.className = 'cm-sheet'; sheet.id = 'jg-oc'; sheet.hidden = true;
      sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'jg-oc-t');
      sheet.innerHTML = '<div class="cm-sheet-bg" data-jg-oc="skip"></div><div class="cm-sheet-card"><h3 id="jg-oc-t">' + esc(W.title) + '</h3><p class="cm-note">' + esc(W.lead) + '</p>' + body()
        + '<div class="jg-oc-acts"><button class="pf-btn" type="button" data-jg-oc="save">' + esc(W.save) + '</button><button class="pf-btn ghost" type="button" data-jg-oc="skip">' + esc(W.skip) + '</button></div></div>';
      var host = document.getElementById('sh-sheet');
      (host && host.parentNode ? host.parentNode : document.body).appendChild(sheet);
    }
    wire();
    return true;
  }
  function say(text, err) { var m = sheet.querySelector('.jg-oc-msg'); m.textContent = text || ''; m.classList.toggle('err', !!err); }
  function sync(sec) {
    var p = picked[sec.getAttribute('data-key')] || {};
    Array.prototype.forEach.call(sec.querySelectorAll('[data-d]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-d') === p.d)); });
    Array.prototype.forEach.call(sec.querySelectorAll('[data-show]'), function (el) { el.hidden = !p.d || el.getAttribute('data-show').split(' ').indexOf(p.d) === -1; });
    var l = sec.querySelector('.jg-oc-letter'); if (l && p.proof) l.textContent = W.letterAdded;
  }
  function wire() {
    sheet.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : e.target.parentNode, b = t.closest('[data-d], [data-jg-oc], .jg-oc-letter');
      if (!b || busy) return;
      var sec = b.closest('.jg-oc-uni');
      if (b.hasAttribute('data-d')) { var k = sec.getAttribute('data-key'), p = picked[k] || (picked[k] = {}), d = b.getAttribute('data-d'); p.d = p.d === d ? null : d; sync(sec); say(''); return; }
      if (b.classList.contains('jg-oc-letter')) { sec.querySelector('input[type="file"]').click(); return; }
      var a = b.getAttribute('data-jg-oc');
      if (a === 'save') save(); else if (a === 'skip') skip();
    });
    sheet.addEventListener('change', function (e) {
      var el = e.target, sec = el.closest && el.closest('.jg-oc-uni');
      if (!sec) return;
      var k = sec.getAttribute('data-key'), p = picked[k] || (picked[k] = {});
      if (el.type === 'file') { var f = el.files && el.files[0]; el.value = ''; if (f) letter(sec, p, f); return; }
      p[el.getAttribute('data-f')] = el.value;
    });
    sheet.addEventListener('input', function (e) { var el = e.target, sec = el.closest && el.closest('.jg-oc-uni'); if (sec && el.getAttribute('data-f') === 'score') (picked[sec.getAttribute('data-key')] || (picked[sec.getAttribute('data-key')] = {})).score = el.value; });
    sheet.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (!busy) skip(); } });
  }
  function post(url, body, type) {
    var h = { 'x-jg-uid': BOOT.uid || '' }; h['content-type'] = type || 'application/json';
    return fetch(url, { method: 'POST', credentials: 'same-origin', headers: h, body: type ? body : JSON.stringify(body) }).then(function (r) { return r.status; }, function () { return 0; });
  }
  function letter(sec, p, f) {
    var l = sec.querySelector('.jg-oc-letter');
    if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(f.type || '') || f.size > 4 * 1024 * 1024) { say(W.letterBad, true); return; }
    l.textContent = W.letterBusy;
    var url = '/api/v1/proofs?kind=decision' + (PARENT ? '&student=' + encodeURIComponent(P.student) : '');
    fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'x-jg-uid': BOOT.uid || '', 'content-type': f.type }, body: f })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) { if (j && j.id) { p.proof = j.id; l.textContent = W.letterAdded; say(''); } else { l.textContent = W.letter; say(W.letterBad, true); } });
  }
  function save() {
    var items = itemsOf(P.targets, picked);
    if (!items.length) { say(W.none, true); return; }
    busy = true; var b = sheet.querySelector('[data-jg-oc="save"]'); b.disabled = true; b.textContent = W.saving; say('');
    var body = { cycle: P.cycle, window: P.window, items: items };
    if (PARENT) body.student = P.student;
    post('/api/v1/outcomes', body).then(function (s) {
      busy = false; b.disabled = false; b.textContent = W.save;
      if (s === 200) { say(W.saved); setTimeout(hide, 1200); return; }
      if (s === 409) { location.reload(); return; }
      say(s === 429 ? W.errLimit : W.errNet, true);
    });
  }
  function skip() { post('/api/v1/outcomes/prompt', { window: P.window, state: 'skipped' }); hide(); }
  function hide() {
    if (!shown) return; shown = false;
    if (PARENT) { var sh = document.getElementById('sheet'), sc = document.getElementById('scrim'); if (sh) sh.classList.remove('on'); if (sc) sc.classList.remove('on'); }
    else sheet.hidden = true;
  }
  function topZ() {
    var z = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.set-view, .pf-view, .cm-sheet, .ly-view, .zq-view'), function (x) { if (x !== sheet && !x.hidden) z = Math.max(z, +getComputedStyle(x).zIndex || 0); });
    return z;
  }
  /** Opens the sheet (once a page load) and tells the server it was shown, so this window never asks again. */
  function open() {
    if (shown || !build()) return;
    shown = true;
    post('/api/v1/outcomes/prompt', { window: P.window, state: 'shown' });
    if (PARENT) {
      var sh = document.getElementById('sheet'), sc = document.getElementById('scrim');
      sh.scrollTop = 0; if (sc) sc.classList.add('on');
      requestAnimationFrame(function () { sh.classList.add('on'); });
      if (sc) sc.addEventListener('click', function once() { sc.removeEventListener('click', once); if (shown) skip(); });
    } else {
      sheet.style.zIndex = String(Math.max(window.JIA_z ? window.JIA_z() : 0, topZ() + 1, 90));
      sheet.hidden = false;
      setTimeout(function () { var h = sheet.querySelector('#jg-oc-t'); h.tabIndex = -1; h.focus({ preventScroll: true }); }, 60);   // the title, so no choice looks picked
    }
  }
  /* After the page has settled; never over the diagnostic (a student still answering it has no prompt anyway, the boot holds none). */
  window.addEventListener('load', function () {
    setTimeout(function () {
      var dg = document.getElementById('dg-view');
      if (dg && !dg.hidden && dg.offsetParent !== null) return;
      api.open();
    }, 1200);
  });
})();
