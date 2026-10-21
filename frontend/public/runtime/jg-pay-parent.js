/*
 * m1 pay: the parent's membership for a real family, only with PAYMENTS on (src/server/pages.ts loads this file with window.JG_PAY_BOOT and
 * window.JG_PLANS; off, the shell keeps every payment section hidden, P_PAY_ATTR, as before). Drawn in the design's own parts (the member
 * card, the bill toggle, the sheet, the receipt rows), from real data:
 *
 *   the membership card   the child's plan, its last day and the days left (one payment, nothing renews by itself), Renew and See VIP
 *   Renew                 the plan and the billing as drawn ($22.90 a month, $19.08 a month billed yearly), paid on Payme's or Click's page
 *   VIP upgrade           the drawn perks and the drawn price-difference line ("$10.35 a month more than his Premium today"), honest
 *                         about renewal ("One payment, no auto-renewal" instead of "Cancel any time")
 *   Billing history       his paid and refunded orders (GET /api/v1/pay/billing), in dollars and soum
 *   Gift a membership     the design's own gift sheet, paid for real (its "Pay … and send" goes to the checkout); the code and link are
 *                         shown to the parent after payment to send himself (the "Phone or Telegram" field is hidden: nothing sends it)
 *   Gifts you've sent     his paid gift codes and whether each was opened
 *   Payment method        stays hidden: no card is kept (no tokens), so there is no saved card to show
 * The design's invented fixtures (a saved Uzcard, "Kamila is mid-way through his Harvard essay", receipts by Telegram) never show.
 */
(function (W) {
  'use strict';
  var B = W.JG_PAY_BOOT, D = W.document; if (!B) return;
  var $ = function (id) { return D.getElementById(id); };
  var WORDS = {
    en: { current: 'Current plan', free: 'Free', aMonth: 'a month', billedYearly: ', billed yearly', ends: 'Ends {date}', left: '{n} days left', leftOne: '1 day left', paid: 'Paid',
      renew: 'Renew', choose: 'Choose a plan', seeVip: 'See VIP', renewTitle: 'Keep {name}’s {plan} going', chooseTitle: 'Choose {name}’s plan', renewLead: 'One payment buys one period. Nothing renews by itself.',
      monthly: 'Monthly', yearly: 'Yearly', save: 'Save 17%', perMonth: '/ month', payme: 'Pay with Payme', click: 'Pay with Click', going: 'Opening the payment page…',
      fine: 'Uzcard, Humo, Click or Payme, on the provider’s own page. One payment, no auto-renewal.', vipEyebrow: 'For his application season', vipTitle: 'Give {name} his own admissions team',
      perks: [['Weekly 1:1 mentor sessions', 'One mentor for his plans'], ['Unlimited essay reviews', 'Every draft, not two a month'], ['Mock interviews with alumni', 'Practice before the real interviews'], ['Priority support', 'Plus everything in Premium']],
      vipYear: '${total} billed once for the year, ${diff} a month more than his {plan} today. Uzcard, Humo, Click or Payme. One payment, no auto-renewal.',
      vipMonth: '${diff} a month more than his {plan} today. Uzcard, Humo, Click or Payme. One payment, no auto-renewal.', vipFree: '${total} today. Uzcard, Humo, Click or Payme. One payment, no auto-renewal.',
      upgrade: 'Upgrade {name} to VIP', none: 'No payments yet.', refunded: 'Refunded', year: 'year', month: 'month', months: '{n} months', gift: 'Gift',
      noGifts: 'You haven’t sent any gifts yet.', opened: 'Opened', notOpened: 'Not opened yet · {code}', off: 'Payments are not open right now. Nothing was charged.', failed: 'Something went wrong. Nothing was charged.',
      needName: 'Please enter their name', soum: 'soʻm' },
    uz: { current: 'Joriy tarif', free: 'Bepul', aMonth: 'oyiga', billedYearly: ', yillik toʻlov', ends: 'Tugash sanasi: {date}', left: '{n} kun qoldi', leftOne: '1 kun qoldi', paid: 'Toʻlangan',
      renew: 'Uzaytirish', choose: 'Tarif tanlash', seeVip: 'VIP ni koʻrish', renewTitle: '{name}ning {plan} tarifini davom ettiring', chooseTitle: '{name} uchun tarif tanlang', renewLead: 'Bir toʻlov bir davrni sotib oladi. Hech narsa oʻzi uzaytirilmaydi.',
      monthly: 'Oylik', yearly: 'Yillik', save: '17% tejang', perMonth: '/ oy', payme: 'Payme orqali toʻlash', click: 'Click orqali toʻlash', going: 'Toʻlov sahifasi ochilmoqda…',
      fine: 'Uzcard, Humo, Click yoki Payme, toʻlov tizimining oʻz sahifasida. Bir martalik toʻlov, avtomatik uzaytirilmaydi.', vipEyebrow: 'Hujjat topshirish mavsumi uchun', vipTitle: '{name}ga shaxsiy qabul jamoasini bering',
      perks: [['Haftalik 1:1 mentor mashgʻulotlari', 'Uning rejalari uchun bitta mentor'], ['Cheksiz esse tekshiruvi', 'Oyiga ikkita emas, har bir qoralama'], ['Bitiruvchilar bilan sinov intervyulari', 'Haqiqiy intervyulardan oldin mashq'], ['Ustuvor yordam', 'Premiumdagi hamma narsa ham']],
      vipYear: 'Yil uchun bir marta ${total}, hozirgi {plan} tarifidan oyiga ${diff} koʻproq. Uzcard, Humo, Click yoki Payme. Bir martalik toʻlov, avtomatik uzaytirilmaydi.',
      vipMonth: 'Hozirgi {plan} tarifidan oyiga ${diff} koʻproq. Uzcard, Humo, Click yoki Payme. Bir martalik toʻlov, avtomatik uzaytirilmaydi.', vipFree: 'Bugun ${total}. Uzcard, Humo, Click yoki Payme. Bir martalik toʻlov, avtomatik uzaytirilmaydi.',
      upgrade: '{name}ni VIP ga oʻtkazish', none: 'Hali toʻlovlar yoʻq.', refunded: 'Qaytarilgan', year: 'yil', month: 'oy', months: '{n} oy', gift: 'Sovgʻa',
      noGifts: 'Siz hali sovgʻa yubormagansiz.', opened: 'Ochilgan', notOpened: 'Hali ochilmagan · {code}', off: 'Hozir toʻlov ochiq emas. Hech narsa yechilmadi.', failed: 'Nimadir xato ketdi. Hech narsa yechilmadi.',
      needName: 'Iltimos, ismini kiriting', soum: 'soʻm' },
    ru: { current: 'Текущий тариф', free: 'Бесплатный', aMonth: 'в месяц', billedYearly: ', оплата за год', ends: 'Заканчивается {date}', left: 'Осталось дней: {n}', leftOne: 'Остался 1 день', paid: 'Оплачено',
      renew: 'Продлить', choose: 'Выбрать тариф', seeVip: 'Посмотреть VIP', renewTitle: 'Продлите {plan} для {name}', chooseTitle: 'Выберите тариф для {name}', renewLead: 'Один платёж — один период. Ничего не продлевается само.',
      monthly: 'Месяц', yearly: 'Год', save: 'Экономия 17%', perMonth: '/ мес.', payme: 'Оплатить через Payme', click: 'Оплатить через Click', going: 'Открываем страницу оплаты…',
      fine: 'Uzcard, Humo, Click или Payme, на странице платёжной системы. Один платёж, без автопродления.', vipEyebrow: 'Для сезона поступления', vipTitle: 'Дайте {name} свою команду по поступлению',
      perks: [['Еженедельные занятия 1:1 с ментором', 'Один ментор для его планов'], ['Безлимитная проверка эссе', 'Каждый черновик, а не два в месяц'], ['Пробные интервью с выпускниками', 'Практика перед настоящими интервью'], ['Приоритетная поддержка', 'И всё, что есть в Premium']],
      vipYear: '${total} один раз за год, на ${diff} в месяц больше, чем его {plan} сейчас. Uzcard, Humo, Click или Payme. Один платёж, без автопродления.',
      vipMonth: 'На ${diff} в месяц больше, чем его {plan} сейчас. Uzcard, Humo, Click или Payme. Один платёж, без автопродления.', vipFree: '${total} сегодня. Uzcard, Humo, Click или Payme. Один платёж, без автопродления.',
      upgrade: 'Перевести {name} на VIP', none: 'Платежей пока нет.', refunded: 'Возвращён', year: 'год', month: 'месяц', months: '{n} месяцев', gift: 'Подарок',
      noGifts: 'Вы ещё не отправляли подарков.', opened: 'Открыт', notOpened: 'Ещё не открыт · {code}', off: 'Оплата сейчас недоступна. Деньги не списаны.', failed: 'Что-то пошло не так. Деньги не списаны.',
      needName: 'Введите имя', soum: 'сум' },
  };
  var UZM = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var lang = function () { var l = (D.documentElement.lang || 'uz').slice(0, 2); return WORDS[l] ? l : 'en'; };
  var L = function () { return WORDS[lang()]; };
  var fill = function (s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && k in v ? v[k] : m; }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var day = function (d) { if (!d) return ''; var p = d.split('-').map(Number); if (lang() === 'uz') return p[2] + '-' + UZM[p[1] - 1] + ', ' + p[0]; return new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString(lang() === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }) + ' ' + p[0]; };
  var soum = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + L().soum; };
  var toUzs = function (d) { return B.fx ? Math.max(1000, Math.round(Math.round(d * 100) * B.fx / 100 / 1000) * 1000) : null; };
  var ICONS = ['<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 11l2 2 4-4"/></svg>', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/></svg>', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3L5 13h6l-1 8 8-10h-6z"/></svg>'];   // the design's own perk icons (000.js IC.mentor, essay, mic, bolt)
  var mo = function (n) { var g = lang(); return n === 1 ? (g === 'ru' ? '1 месяц' : g === 'uz' ? '1 oy' : '1 month') : g === 'ru' && n === 3 ? '3 месяца' : fill(L().months, { n: n }); };
  var PLAN = { pro: 'Pro', premium: 'Premium', vip: 'VIP' };
  var P = W.JG_PLANS || { pro: { m: 12.9, a: 10.75 }, premium: { m: 22.9, a: 19.08 }, vip: { m: 39.9, a: 33.25 } };
  var E = B.plan || { tier: 'free' };
  var child = function () { return (W.JG_CHILD && W.JG_CHILD.firstName) || ''; };
  var uid = function () { return (W.JG_BOOT && W.JG_BOOT.uid) || ''; };
  var sel = { tier: E.tier === 'free' ? 'premium' : E.tier, billing: 'monthly' };

  function card() {
    var c = $('memberCard'); if (!c) return; var l = L(), paid = E.tier !== 'free';
    c.hidden = false; c.className = 'member' + (E.tier === 'vip' ? ' vip' : '');
    var top = '<div class="member-top"><div><small>' + esc(l.current) + '</small><span class="num">' + esc(paid ? PLAN[E.tier] : l.free) + '</span></div>' +
      (paid ? '<div class="member-price"><b>$' + (E.period === 'annual' ? P[E.tier].a : P[E.tier].m).toFixed(2) + '</b>' + esc(l.aMonth + (E.period === 'annual' ? l.billedYearly : '')) + '</div>' : '') + '</div>';
    var total = E.starts_on && E.ends_on ? Math.max(1, (Date.parse(E.ends_on) - Date.parse(E.starts_on)) / 864e5) : 1, left = E.days_left || 0;
    var days = paid ? '<div class="days"><div class="days-top"><span>' + esc(fill(l.ends, { date: day(E.last_day) })) + '</span><span>' + esc(left === 1 ? l.leftOne : fill(l.left, { n: left })) + '</span></div><div class="bar"><b style="width:' + Math.max(4, Math.min(100, Math.round(left / total * 100))) + '%"></b></div></div>' : '';
    c.innerHTML = top + days + '<div class="member-actions"><button class="btn btn-white" type="button" data-pay="renew">' + esc(paid ? l.renew : l.choose) + '</button>' +
      (E.tier !== 'vip' ? '<button class="btn btn-line" type="button" data-pay="vip">' + esc(l.seeVip) + '</button>' : '') + '</div>';
    var t = $('vipTeaser'); if (t) t.hidden = E.tier === 'vip';
    var pm = D.querySelector('[data-toast="Add Click, Payme, Humo or Visa"]'); if (pm && pm.closest('section')) pm.closest('section').hidden = true;
  }
  function api(url, body) {
    return W.fetch(url, { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: Object.assign({ 'x-jg-uid': uid() }, body ? { 'content-type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (j) { return { s: r.status, j: j }; }); }, function () { return { s: 0, j: null }; });
  }
  function receipts() {
    var el = $('receipts'); if (!el) return;
    api('/api/v1/pay/billing?student=' + encodeURIComponent(B.student)).then(function (r) {
      var l = L(), rows = (r.j && r.j.rows) || [];
      el.innerHTML = rows.length ? rows.map(function (x) {
        var what = x.kind === 'gift' ? l.gift + ' · ' + PLAN[x.tier] + ' · ' + mo(x.months) : PLAN[x.tier] + ' · ' + (x.period === 'annual' ? l.year : l.month);
        return '<div class="receipt"><span class="row-t"><b>' + esc(what) + '</b><small>' + esc(day(x.paid_on)) + ' · ' + esc(x.refunded ? l.refunded : l.paid) + '</small></span><span style="font-weight:700;font-size:14px;text-align:right">$' + (x.usd_cents / 100).toFixed(2) + '<br><small style="font-weight:600;opacity:.7">' + esc(soum(x.uzs)) + '</small></span></div>';
      }).join('') : '<div class="row" style="cursor:default"><span class="row-t"><small>' + esc(l.none) + '</small></span></div>';
    });
  }
  function gifts() {
    var el = $('giftList'); if (!el) return;
    api('/api/v1/pay/gifts').then(function (r) {
      var l = L(), rows = (r.j && r.j.gifts) || [];
      el.innerHTML = rows.length ? rows.map(function (g) {
        return '<div class="row" style="cursor:default"><span class="row-t"><b>' + esc(g.for_name || PLAN[g.tier]) + '</b><small>' + esc(PLAN[g.tier] + ' · ' + mo(g.months)) + '</small><small>' + esc(g.opened ? l.opened : fill(l.notOpened, { code: g.code || '' })) + '</small></span><span style="font-weight:700;font-size:14px;white-space:nowrap">$' + (g.usd_cents / 100).toFixed(2) + '</span></div>';
      }).join('') : '<div class="row" style="cursor:default"><span class="row-t"><small>' + esc(l.noGifts) + '</small></span></div>';
    });
  }
  /* a sheet in the design's own sheet element: its close button, scrim and focus as openSheet() has them */
  function sheet(html, dark) {
    var sh = $('sheet'); if (!sh) return null;
    sh.className = 'sheet' + (dark ? ' dark' : '');
    sh.innerHTML = '<button class="sheet-close" type="button" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' + html; sh.scrollTop = 0;
    $('scrim').classList.add('on'); W.requestAnimationFrame(function () { sh.classList.add('on'); });
    sh.querySelector('.sheet-close').addEventListener('click', close);
    return sh;
  }
  function close() { var sh = $('sheet'); if (sh) sh.classList.remove('on'); var s = $('scrim'); if (s) s.classList.remove('on'); }
  var bill = function (tier) { var l = L(); return '<div class="bill" role="group"><button type="button" data-pbill="monthly" aria-pressed="' + (sel.billing === 'monthly') + '"><small>' + esc(l.monthly) + '</small><b>$' + P[tier].m.toFixed(2) + ' <span>' + esc(l.perMonth) + '</span></b></button>' +
    '<button type="button" data-pbill="annual" aria-pressed="' + (sel.billing === 'annual') + '"><em>' + esc(l.save) + '</em><small>' + esc(l.yearly) + '</small><b>$' + P[tier].a.toFixed(2) + ' <span>' + esc(l.perMonth) + '</span></b></button></div>'; };
  var chips = function (tier) { var l = L(); return '<p class="g-lbl">' + esc(l.monthly + " / " + l.yearly) + '</p><div class="g-chips" role="group"><button type="button" data-pbill="monthly" aria-pressed="' + (sel.billing === "monthly") + '">' + esc(l.monthly) + " · $" + P[tier].m.toFixed(2) + '</button><button type="button" data-pbill="annual" aria-pressed="' + (sel.billing === "annual") + '">' + esc(l.yearly) + " · $" + P[tier].a.toFixed(2) + " " + esc(l.perMonth) + " · " + esc(l.save) + '</button></div>'; };
  var payBtns = function (main) { var l = L(); return '<button class="btn ' + (main || 'btn-primary') + ' btn-block" type="button" data-ppay="payme" style="margin-top:14px">' + esc(l.payme) + '</button><button class="btn ' + (main === 'btn-gold' ? 'btn-darkline' : 'btn-ghost') + ' btn-block" type="button" data-ppay="click">' + esc(l.click) + '</button><p class="fine" id="payFine"></p>'; };
  function amount(tier) { return sel.billing === 'annual' ? P[tier].a * 12 : P[tier].m; }
  function renewSheet() {
    var l = L(), paid = E.tier !== 'free';
    var plans = '<div class="g-plans" role="group">' + ['pro', 'premium', 'vip'].map(function (t) { return '<button type="button" data-ptier="' + t + '" aria-pressed="' + (sel.tier === t) + '"><b>' + PLAN[t] + '</b><small>$' + P[t].m.toFixed(2) + ' ' + esc(l.aMonth) + '</small></button>'; }).join('') + '</div>';
    var sh = sheet('<div class="grab"></div><h3 id="sheetTitle">' + esc(fill(paid ? l.renewTitle : l.chooseTitle, { name: child(), plan: PLAN[E.tier] || '' })) + '</h3><p class="lead">' + esc(l.renewLead) + '</p>' + plans + chips(sel.tier) + payBtns(), false);
    if (sh) bind(sh, renewSheet, function () { return sel.tier; });
  }
  function vipSheet() {
    var l = L(), cur = E.tier === 'free' ? null : E.tier;
    var diff = cur ? ((sel.billing === 'annual' ? P.vip.a : P.vip.m) - P[cur].m).toFixed(2) : null, total = (P.vip.a * 12).toFixed(2);
    var fine = !cur ? fill(l.vipFree, { total: sel.billing === 'annual' ? total : P.vip.m.toFixed(2) }) : fill(sel.billing === 'annual' ? l.vipYear : l.vipMonth, { total: total, diff: diff, plan: PLAN[cur] });
    var perks = '<div class="perks">' + l.perks.map(function (p, i) { return '<div class="perk"><span class="pk">' + ICONS[i] + '</span><span><b>' + esc(p[0]) + '</b><small>' + esc(p[1]) + '</small></span></div>'; }).join('') + '</div>';
    var sh = sheet('<div class="grab"></div><p class="eyebrow">' + esc(l.vipEyebrow) + '</p><h3 id="sheetTitle">' + esc(fill(l.vipTitle, { name: child() })) + '</h3>' + perks + bill('vip') + payBtns('btn-gold'), true);
    if (sh) { bind(sh, vipSheet, function () { return 'vip'; }); var f = $('payFine'); if (f) f.textContent = fine; }
  }
  function bind(sh, again, tierOf) {
    var l = L(), f = $('payFine'); if (f && !f.textContent) f.textContent = l.fine + (B.sandbox ? ' · Sandbox' : '');
    var u = toUzs(amount(tierOf())); if (u && f) f.textContent += ' · ' + soum(u);
    sh.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pbill]'), t = e.target.closest('[data-ptier]'), p = e.target.closest('[data-ppay]');
      if (b) { sel.billing = b.dataset.pbill; again(); }
      if (t) { sel.tier = t.dataset.ptier; again(); }
      if (p) checkout({ kind: 'plan', tier: tierOf(), period: sel.billing, provider: p.dataset.ppay, student: B.student }, p);
    });
  }
  function checkout(body, btn) {
    var label = btn.textContent, l = L(); btn.disabled = true; btn.textContent = l.going; body.lang = lang();
    api('/api/v1/pay/checkout', body).then(function (r) {
      if (r.s === 200 && r.j && r.j.redirect) { W.location.assign(r.j.redirect); return; }
      btn.disabled = false; btn.textContent = label; var f = $('payFine') || $('gErr'); if (f) f.textContent = r.s === 503 ? l.off : l.failed;
    });
  }
  /* the design's gift sheet, paid for real: its own fields, the checkout instead of the demo */
  function giftPay(e) {
    var go = e.target.closest('#doGift'); if (!go) return;
    e.stopPropagation(); e.preventDefault();
    var name = ($('gName') && $('gName').value || '').trim(); if (!name) { var er = $('gErr'); if (er) er.textContent = L().needName; return; }
    var pick = function (s, k) { var x = D.querySelector('#sheet [' + s + '][aria-pressed="true"]'); return x ? x.getAttribute(s) : k; };
    checkout({ kind: 'gift', tier: pick('data-gplan', 'premium'), months: Number(pick('data-gmonths', '6')), note: ($('gNote') && $('gNote').value || '').slice(0, 200), for_name: name.slice(0, 80), provider: 'payme' }, go);
  }
  D.addEventListener('click', function (e) {
    var r = e.target.closest('[data-pay="renew"]'), v = e.target.closest('[data-pay="vip"], #vipTeaser');
    if (r) { e.stopPropagation(); sel.tier = E.tier === 'free' ? 'premium' : E.tier; renewSheet(); return; }
    if (v) { e.stopPropagation(); e.preventDefault(); sel.tier = 'vip'; vipSheet(); return; }
    giftPay(e);
  }, true);
  /* the gift sheet as it opens: no "Phone or Telegram" (nothing sends it; the parent sends the code himself) */
  var shEl = null;
  function watchGift() {
    shEl = $('sheet'); if (!shEl) return;
    new MutationObserver(function () { var c = $('gContact'); if (c) { c.style.display = 'none'; var lb = D.querySelector('label[for="gContact"]'); if (lb) lb.style.display = 'none'; } }).observe(shEl, { childList: true });
  }
  function all() { card(); receipts(); gifts(); }
  W.JG_PAY_PARENT = { render: all };
  var start = function () { all(); watchGift(); new MutationObserver(function () { card(); receipts(); gifts(); }).observe(D.documentElement, { attributes: true, attributeFilter: ['lang'] }); };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})(window);

