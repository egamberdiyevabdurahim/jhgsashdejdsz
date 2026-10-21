/* Jamals Global: the JIA card's in-app lead form (D-3, owner 18 Oct 2026: "the JIA card opens an in-app lead form"). Loaded on a live
 * student's page only with the JIA card on (JIA_CARD, inside the lessons part; src/server/pages.ts). Not design code: the card's "Sign up"
 * (public/runtime/jg-lessons.js .jgl-jia-go on the phone, jg-lessons-desktop.js #jg-jia a on the laptop) opens this form instead of
 * leaving the app, drawn in the design's sheet (.cm-sheet, .cm-sheet-card, h3, .cm-note, .pf-btn) in the student's language: name,
 * phone, city or branch (Tashkent, Andijan, online), course (SAT, IELTS). POST /api/v1/leads/jia keeps it and passes it to JIA's team. */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null;
  if (!BOOT || BOOT.demo || BOOT.role !== 'student') return;
  var W = {
    en: { title: 'Sign up for JIA', lead: 'JIA’s admissions team will call this number to choose a time. If you are under 18, give a parent’s number.', name: 'Name', phone: 'Phone', city: 'Where', tashkent: 'Tashkent', andijan: 'Andijan', online: 'Online', course: 'Course',
      send: 'Send', sending: 'Sending…', cancel: 'Cancel', done: 'Thank you! JIA’s team will call you soon.', bad: 'Please write a name and a phone number.', many: 'You have sent this already. JIA’s team will call you.', failed: 'Could not send. Check your connection and try again.' },
    uz: { title: 'JIAga yozilish', lead: 'JIA qabul jamoasi vaqtni kelishish uchun shu raqamga qoʻngʻiroq qiladi. 18 yoshga toʻlmagan boʻlsangiz, ota-onangiz raqamini yozing.', name: 'Ism', phone: 'Telefon', city: 'Qayerda', tashkent: 'Toshkent', andijan: 'Andijon', online: 'Online', course: 'Kurs',
      send: 'Yuborish', sending: 'Yuborilmoqda…', cancel: 'Bekor qilish', done: 'Rahmat! JIA jamoasi tez orada qoʻngʻiroq qiladi.', bad: 'Ism va telefon raqamini yozing.', many: 'Siz buni allaqachon yuborgansiz. JIA jamoasi qoʻngʻiroq qiladi.', failed: 'Yuborib boʻlmadi. Internetni tekshirib, qayta urinib koʻring.' },
    ru: { title: 'Записаться в JIA', lead: 'Команда JIA по поступлению позвонит на этот номер, чтобы выбрать время. Если тебе меньше 18, укажи номер родителя.', name: 'Имя', phone: 'Телефон', city: 'Где', tashkent: 'Ташкент', andijan: 'Андижан', online: 'Онлайн', course: 'Курс',
      send: 'Отправить', sending: 'Отправляем…', cancel: 'Отмена', done: 'Спасибо! Команда JIA скоро позвонит.', bad: 'Напиши имя и номер телефона.', many: 'Ты уже отправил заявку. Команда JIA позвонит.', failed: 'Не удалось отправить. Проверь соединение и попробуй ещё раз.' }
  };
  function lang() { var l = window.JG_I18N && typeof window.JG_I18N.lang === 'function' ? window.JG_I18N.lang() : String(document.documentElement.getAttribute('lang') || '').slice(0, 2); return l === 'uz' || l === 'ru' ? l : 'en'; }
  function w(k) { return W[lang()][k]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var sheet = null, F = { city: 'tashkent', course: 'sat' };
  function topZ() { var z = 60; document.querySelectorAll('.set-view, .pf-view, .cm-sheet, .ly-view, .zq-view').forEach(function (x) { if (x !== sheet && !x.hidden) z = Math.max(z, +getComputedStyle(x).zIndex || 0); }); return z; }
  function chips(key, opts) { return '<div class="jg-jl-chips" role="group">' + opts.map(function (o) { return '<button type="button" class="pf-btn' + (F[key] === o[0] ? '' : ' ghost') + '" data-jl-' + key + '="' + o[0] + '" aria-pressed="' + (F[key] === o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>'; }
  function paint(note) {
    var name = sheet.querySelector('#jg-jl-name'), phone = sheet.querySelector('#jg-jl-phone'), keep = { n: name ? name.value : ((window.JG_ME && window.JG_ME.fullName) || ''), p: phone ? phone.value : '' };
    sheet.innerHTML = '<div class="cm-sheet-bg" data-jl-close=""></div><div class="cm-sheet-card"><h3 id="jg-jl-t">' + esc(w('title')) + '</h3><p class="cm-note">' + esc(w('lead')) + '</p>' +
      '<label class="jg-jl-l" for="jg-jl-name">' + esc(w('name')) + '</label><input class="jg-jl-in" id="jg-jl-name" autocomplete="name" maxlength="80" value="' + esc(keep.n) + '">' +
      '<label class="jg-jl-l" for="jg-jl-phone">' + esc(w('phone')) + '</label><input class="jg-jl-in" id="jg-jl-phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="+998 90 123 45 67" value="' + esc(keep.p) + '">' +
      '<p class="jg-jl-l">' + esc(w('city')) + '</p>' + chips('city', [['tashkent', w('tashkent')], ['andijan', w('andijan')], ['online', w('online')]]) +
      '<p class="jg-jl-l">' + esc(w('course')) + '</p>' + chips('course', [['sat', 'SAT'], ['ielts', 'IELTS']]) +
      '<p class="cm-note jg-jl-say" role="status">' + esc(note || '') + '</p><div class="jg-jl-acts"><button class="pf-btn" type="button" id="jg-jl-send">' + esc(w('send')) + '</button><button class="pf-btn ghost" type="button" data-jl-close="">' + esc(w('cancel')) + '</button></div></div>';
  }
  function open(course) {
    if (!sheet) {
      sheet = document.createElement('div'); sheet.className = 'cm-sheet'; sheet.id = 'jg-jl'; sheet.hidden = true; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'jg-jl-t'); sheet.setAttribute('data-no-i18n', '');
      document.body.appendChild(sheet);
      sheet.addEventListener('click', onClick);
      var css = document.createElement('style');
      css.textContent = '#jg-jl .cm-sheet-card{text-align:left}#jg-jl .jg-jl-l{display:block;margin:12px 0 6px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.65}' +
        '#jg-jl .jg-jl-in{width:100%;box-sizing:border-box;height:46px;padding:0 14px;border-radius:14px;border:1px solid rgba(0,0,0,.14);font-size:16px;font-weight:600;font-family:inherit;background:#fff}' +
        '#jg-jl .jg-jl-chips{display:flex;flex-wrap:wrap;gap:8px}#jg-jl .jg-jl-chips .pf-btn{width:auto;flex:1 1 auto;margin:0;padding:0 14px}#jg-jl .jg-jl-acts{display:grid;gap:8px;margin-top:10px}#jg-jl .jg-jl-say{min-height:1em;font-weight:700}';
      document.head.appendChild(css);
    }
    F = { city: 'tashkent', course: course || 'sat' }; sheet.innerHTML = ''; paint('');
    sheet.style.zIndex = String(topZ() + 1); sheet.hidden = false;
  }
  function onClick(e) {
    var t = e.target.closest('[data-jl-close],[data-jl-city],[data-jl-course],#jg-jl-send'); if (!t) return;
    if (t.hasAttribute('data-jl-close')) { sheet.hidden = true; return; }
    if (t.hasAttribute('data-jl-city')) { F.city = t.getAttribute('data-jl-city'); paint(''); return; }
    if (t.hasAttribute('data-jl-course')) { F.course = t.getAttribute('data-jl-course'); paint(''); return; }
    var name = sheet.querySelector('#jg-jl-name').value.trim(), phone = sheet.querySelector('#jg-jl-phone').value.trim(), say = sheet.querySelector('.jg-jl-say');
    if (name.length < 2 || phone.replace(/[^\d]/g, '').length < 7) { say.textContent = w('bad'); return; }
    t.disabled = true; t.textContent = w('sending');
    fetch('/api/v1/leads/jia', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid }, body: JSON.stringify({ name: name, phone: phone, city: F.city, course: F.course, lang: lang() }) })
      .then(function (r) { return r.status; }, function () { return 0; })
      .then(function (s) { t.disabled = false; t.textContent = w('send'); say.textContent = s === 201 ? w('done') : s === 429 ? w('many') : s === 400 ? w('bad') : w('failed'); if (s === 201) setTimeout(function () { sheet.hidden = true; }, 2200); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('.jgl-jia-go, #jg-jia a') : null; if (!a) return;
    e.preventDefault(); e.stopPropagation();
    var card = a.closest('.jgl-jia, #jg-jia'), txt = card ? card.textContent : '';
    open(/IELTS/.test(txt) ? 'ielts' : 'sat');
  }, true);
  window.JG_JIA_LEAD = { open: open };
})();
