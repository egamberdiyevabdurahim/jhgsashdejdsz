/*
 * m1 pay (the owner's 20 Oct 2026 "do them fast"): payments on a real student's page, only with PAYMENTS on (src/server/pages.ts loads
 * this file, not deferred, with window.JG_PAY_BOOT and window.JG_PLANS before the design scripts; off, nothing here exists and the price card
 * says "Payments open soon"). It replaces the design's demo checkout (017.js), keeping the design's own sheet:
 *
 *   JG_PAY.plan()       her plan from the server, in the design's shape ({ key, billing, until, from }), so the chip and the Settings card
 *                       read it (017.js:28)
 *   JG_PAY.renewable()  her plan ends within 5 days: its card's button buys the next period again (017.js:84)
 *   JG_PAY.pay(f, b)    the sheet's Pay button (017.js:182): POST /api/v1/pay/checkout, then the provider's own page (or the sandbox's)
 *   the sheet, each time it opens: the methods that have a rail (Uzcard or Humo on Payme's page, Payme, Click; Visa or Mastercard hidden:
 *   no rail takes them yet), the price in soum too, "one payment, no auto-renewal" instead of "then monthly" and the demo note; a coupon
 *   from the coin shop (30 % off Premium, a free month of Pro) applied when it fits
 *   the Settings card's line under the plan: until when, and that it does not renew by itself
 * Its words are its own, in uz/ru/en (the page's language, JG_PAY_BOOT.lang).
 */
(function (W) {
  'use strict';
  var B = W.JG_PAY_BOOT; if (!B) return;
  var D = W.document, $ = function (id) { return D.getElementById(id); };
  var WORDS = {
    en: { soum: 'soʻm', once: 'One payment · no auto-renewal', monthFor: '{usd} today · {uzs} · for one month', yearFor: '{usd} today · {uzs} · for one year',
      prizeFor: '{plan} · {months} · {uzs} · one payment, no renewal', m1: '1 month', mN: '{n} months',
      where: 'You pay on Payme’s or Click’s own page. Card details never reach Jamals Global. One payment, no auto-renewal.',
      sandbox: 'Sandbox: no money moves.', coupon: 'Your coupon: 30% off', free: 'Use my free month of Pro', going: 'Opening the payment page…',
      off: 'Payments are not open right now. Nothing was charged.', failed: 'Something went wrong. Nothing was charged. Please try again.',
      until: 'Until {date} · no auto-renewal', paidBy: 'Paid by {name} · until {date}', giftFrom: 'A prize from {name} · until {date}', renew: 'Ends on {date}. Renew it in Plans.',
      welcome: 'Welcome to Pro!', freeDone: 'Your free month of Pro is on. 🎉' },
    uz: { soum: 'soʻm', once: 'Bir martalik toʻlov · avtomatik uzaytirilmaydi', monthFor: 'Bugun {usd} · {uzs} · bir oyga', yearFor: 'Bugun {usd} · {uzs} · bir yilga',
      prizeFor: '{plan} · {months} · {uzs} · bir martalik toʻlov, uzaytirilmaydi', m1: '1 oy', mN: '{n} oy',
      where: 'Toʻlov Payme yoki Click sahifasining oʻzida qilinadi. Karta maʼlumotlari Jamals Globalga kelmaydi. Bir martalik toʻlov, avtomatik uzaytirilmaydi.',
      sandbox: 'Sinov rejimi: pul yechilmaydi.', coupon: 'Kuponingiz: 30% chegirma', free: 'Bepul Pro oyimni ishlatish', going: 'Toʻlov sahifasi ochilmoqda…',
      off: 'Hozir toʻlov ochiq emas. Hech narsa yechilmadi.', failed: 'Nimadir xato ketdi. Hech narsa yechilmadi. Qaytadan urinib koʻring.',
      until: '{date} gacha · avtomatik uzaytirilmaydi', paidBy: '{name} toʻlagan · {date} gacha', giftFrom: '{name}dan sovgʻa · {date} gacha', renew: '{date} da tugaydi. Tariflar boʻlimida uzaytiring.',
      welcome: 'Pro tarifiga xush kelibsiz!', freeDone: 'Bepul Pro oyingiz yoqildi. 🎉' },
    ru: { soum: 'сум', once: 'Один платёж · без автопродления', monthFor: '{usd} сегодня · {uzs} · на месяц', yearFor: '{usd} сегодня · {uzs} · на год',
      prizeFor: '{plan} · {months} · {uzs} · один платёж, без продления', m1: '1 месяц', mN: '{n} месяцев',
      where: 'Оплата проходит на странице Payme или Click. Данные карты не попадают в Jamals Global. Один платёж, без автопродления.',
      sandbox: 'Песочница: деньги не списываются.', coupon: 'Ваш купон: скидка 30%', free: 'Взять бесплатный месяц Pro', going: 'Открываем страницу оплаты…',
      off: 'Оплата сейчас недоступна. Деньги не списаны.', failed: 'Что-то пошло не так. Деньги не списаны. Попробуйте ещё раз.',
      until: 'До {date} · без автопродления', paidBy: 'Оплатил(а) {name} · до {date}', giftFrom: 'Подарок от {name} · до {date}', renew: 'Заканчивается {date}. Продлите в разделе тарифов.',
      welcome: 'Добро пожаловать в Pro!', freeDone: 'Бесплатный месяц Pro включён. 🎉' },
  };
  var L = WORDS[B.lang] || WORDS.en;
  var fill = function (s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && k in v ? v[k] : m; }); };
  var soum = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + L.soum; };
  var usd = function (n) { return '$' + n.toFixed(2); };
  var toUzs = function (dollars) { return B.fx ? Math.max(1000, Math.round(Math.round(dollars * 100) * B.fx / 100 / 1000) * 1000) : null; };
  var UZM = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var day = function (d) { if (!d) return ''; var p = d.split('-').map(Number); if (B.lang === 'uz') return p[2] + '-' + UZM[p[1] - 1] + ', ' + p[0]; if (B.lang === 'ru') return new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }) + ' ' + p[0]; return new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString(B.lang === 'uz' ? 'uz-Latn-UZ' : B.lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); };
  var coupon = function (kind) { return (B.coupons || []).filter(function (c) { return c.kind === kind; })[0] || null; };
  var E = B.plan || { tier: 'free' };

  var api = {
    plan: function () {
      if (!E || E.tier === 'free') return null;
      var gift = E.source === 'gift' || E.paid_by_parent || E.source === 'coupon';
      return { key: E.tier, billing: gift ? 'gift' : '', until: E.last_day ? new Date(E.last_day + 'T12:00:00Z') : null, from: E.gifted_by ? E.gifted_by.name : '' };
    },
    renewable: function () { return !!(E && E.renew_soon); },
    pay: pay,
  };
  W.JG_PAY = api;

  function method() {
    var m = D.querySelector('#pr-methods [data-m][aria-checked="true"]'), k = m ? m.dataset.m : 'uzcard';
    return k === 'click' ? 'click' : 'payme';
  }
  function note(text) { var d = D.querySelector('#pr-pay .pr-demo'); if (d) { d.textContent = text; d.style.display = ''; } }
  var current = null;
  /* the sheet, as 017.js opens it (its checkout() and the prize's Continue call JG_PAY.sheet(payFor)): methods with a rail, the price in soum,
     the honest lines, a coupon when it fits */
  function sheet(payFor) {
    var sum = $('pr-pay-sum'), go = $('pr-pay-go'); if (!sum || !go || !payFor) return;
    var visa = D.querySelector('#pr-methods [data-m="visa"]');
    if (visa) { visa.style.display = 'none'; if (visa.getAttribute('aria-checked') === 'true') { visa.setAttribute('aria-checked', 'false'); var u = D.querySelector('#pr-methods [data-m="uzcard"]'); if (u) u.setAttribute('aria-checked', 'true'); } }
    note(L.where + (B.sandbox ? ' ' + L.sandbox : ''));
    var prize = !!payFor.prize, tier = prize ? payFor.prize.plan : payFor.p.key, dollars = prize ? payFor.price : payFor.yearly ? payFor.price * 12 : payFor.price;
    current = { prize: prize, tier: tier, dollars: dollars };
    if (!prize && tier === 'pro' && coupon('pro_month')) { current.free = coupon('pro_month').id; go.textContent = L.free; sum.textContent = L.once; return; }
    if (!prize && tier === 'premium' && coupon('premium_30')) { current.coupon = coupon('premium_30').id; dollars = Math.round(dollars * 70) / 100; current.dollars = dollars; go.textContent = 'Pay ' + usd(dollars); }
    var uzs = toUzs(dollars), plans = { pro: 'Pro', premium: 'Premium', vip: 'VIP' };
    sum.textContent = prize ? fill(L.prizeFor, { plan: plans[tier], months: payFor.prize.months === 1 ? L.m1 : payFor.prize.months === 3 && B.lang === 'ru' ? '3 месяца' : fill(L.mN, { n: payFor.prize.months }), uzs: uzs ? soum(uzs) : '' })
      : fill(payFor.yearly ? L.yearFor : L.monthFor, { usd: usd(dollars), uzs: uzs ? soum(uzs) : '' }) + (current.coupon ? ' · ' + L.coupon : '');
  }
  api.sheet = sheet;
  function headers() { return { 'content-type': 'application/json', 'x-jg-uid': (W.JG_BOOT && W.JG_BOOT.uid) || '' }; }
  function say(text) { var d = D.querySelector('#pr-pay .pr-demo'); if (d) { d.textContent = text; d.style.display = ''; } }
  function pay(payFor, btn) {
    if (!payFor) return;
    var body, label = btn.textContent;
    if (current && current.free) return redeem(current.free, btn);
    if (payFor.prize) body = { kind: 'gift', tier: payFor.prize.plan, months: payFor.prize.months, note: String(payFor.prize.note || '').slice(0, 200), provider: method(), lang: B.lang };
    else body = { kind: 'plan', tier: payFor.p.key, period: payFor.yearly ? 'annual' : 'monthly', provider: method(), coupon: current && current.coupon ? current.coupon : null, lang: B.lang };
    btn.disabled = true; btn.textContent = L.going;
    W.fetch('/api/v1/pay/checkout', { method: 'POST', credentials: 'same-origin', headers: headers(), body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (r) {
        if (r.s === 200 && r.j && r.j.redirect) { W.location.assign(r.j.redirect); return; }
        btn.disabled = false; btn.textContent = label; say(r.s === 503 ? L.off : L.failed);
      }, function () { btn.disabled = false; btn.textContent = label; say(L.failed); });
  }
  function redeem(id, btn) {
    btn.disabled = true;
    W.fetch('/api/v1/pay/coupons/' + encodeURIComponent(id) + '/redeem', { method: 'POST', credentials: 'same-origin', headers: headers() })
      .then(function (r) { if (r.status === 200) W.location.reload(); else { btn.disabled = false; say(L.failed); } }, function () { btn.disabled = false; say(L.failed); });
  }
  /* the Settings card's line under the plan, and the in-app renewal reminder (D-2: never Telegram) */
  function settingsLine() {
    var s = $('set-plan-s'); if (!s || !E || E.tier === 'free' || !E.last_day) return;
    var d = day(E.last_day);
    s.textContent = E.source === 'gift' && E.gifted_by ? fill(L.giftFrom, { name: E.gifted_by.name, date: d }) : E.paid_by_parent && E.gifted_by ? fill(L.paidBy, { name: E.gifted_by.name, date: d }) : fill(L.until, { date: d });
    s.setAttribute('data-jg-i18n-skip', '');
    if (E.renew_soon && W.JIA_notify) { try { if (W.sessionStorage.getItem('jg.pay.renew') !== E.last_day) { W.sessionStorage.setItem('jg.pay.renew', E.last_day); W.JIA_notify({ icon: '', text: '<b>JIA ' + ({ pro: 'Pro', premium: 'Premium', vip: 'VIP' })[E.tier] + '</b> · ' + fill(L.renew, { date: d }) }); } } catch (e) {} }
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { setTimeout(settingsLine, 0); });
  else setTimeout(settingsLine, 0);
})(window);
