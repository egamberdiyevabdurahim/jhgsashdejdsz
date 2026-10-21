/* Jamals Global: the parent app's people part (m1-parent, PARENT_M1; off by default). Loaded on a real family's parent page with the switch
 * on (src/server/pages.ts; never the demo, /preview or ENGINE_LIVE off), after the design's script. Not design code: it draws in the
 * design's own components and classes (#sheet and #scrim, .grab, .eyebrow, h3, .lead, .g-lbl, .g-chips, .g-in, .btn-block, .fine, the
 * pledge card .card.pledge, the account .row) and keeps its words from the design's translator (data-notr), in the parent's language.
 *  - Pledges (the design's section, PM:85; its sheet PM:588): the child's real pledges from the server (JG_BOOT.m1.pledges, GET/POST
 *    /api/v1/pledges): N study bricks, completed tasks or days in a row by the end of this month or the next, for a reward the parent gives;
 *    "Mark as given" on a reached one. Two parents per child each make their own; the other's shows with their name.
 *  - Congratulate (the design's "Congratulate {child}", PM:622): under the proud card of a medal that is a real event (JG_BOOT.m1.events),
 *    POST /api/v1/parent/notes; the child sees the note in her app. Once per event.
 *  - Children (the design's child chip PM:34 and Account's Children card PM:205): a parent of more than one switches child (the jg_child
 *    cookie, read by /parent); "Add another child" takes the code from that child's app (POST /api/v1/family/join). */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null, M = BOOT && BOOT.m1, C = BOOT && BOOT.child;
  if (!BOOT || BOOT.demo || BOOT.role !== 'parent' || !C || !M || M.role !== 'parent') return;
  var KID = (BOOT.children || [])[0] || { firstName: '' }, NAME = KID.firstName;
  var W = {
    en: { yours: 'Your pledge', theirs: '{p}’s pledge', bricks: '{n} study bricks', tasks: '{n} completed tasks', streak: '{n} days in a row', left: '{n} days left', lastDay: 'Last day', reached: 'Reached', given: 'Reward given', ended: 'Ended',
      by: 'By {d}', soFar: 'so far', reachedMsg: '{c} reached it. Time for the reward!', give: 'Mark as given', gave: 'Marked as given. {c} sees it in the app.', add: '+ Add a pledge', addSub: 'Promise a real reward for a goal. {c} sees it on the Home screen.',
      eyebrow: 'Parent pledge', title: 'Promise a reward for a goal', lead: 'Pick something {c} can reach by working for it. {c} sees your pledge on the Home screen, and it fills up with every study session.', what: 'What should {c} reach?',
      gBricks: 'Study bricks', gTasks: 'Completed tasks', gStreak: 'Days in a row', hBricks: '1 brick = 25 minutes of focused study in the Study Room. 100 bricks is about 42 hours.', hTasks: 'Tasks from the daily plan, counted from today.', hStreak: 'Days in a row with study.',
      target: 'Target', reward: 'Reward', rewardPh: 'For example, a new bike', when: 'By when', thisMonth: 'By the end of this month', nextMonth: 'By the end of next month', sees: '{c} will see', save: 'Save pledge', saving: 'Saving…',
      fine: 'You give the reward yourself. The app tells you here the moment {c} reaches the goal.', need: 'Please add a target and a reward', tooMany: 'You have three open pledges. Give or end one first.', failed: 'Could not save. Check your connection and try again.', saved: 'Saved. {c} sees it on the Home screen.',
      congrats: 'Congratulate {c}', sent: 'Sent. {c} sees your note in the app.', sentAlready: 'Congratulated ✓', kids: 'Your children', addKid: 'Add another child', addKidSub: 'Connect a brother or sister’s account', viewing: 'Shown now',
      addTitle: 'Add another child', addLead: 'Open Jamals Global on the other child’s phone: Settings → Parents shows the family code. Type it here.', code: 'Family code', connect: 'Connect', connecting: 'Connecting…',
      eInvalid: 'That code is not right. Check it on the child’s phone.', eExpired: 'That code has expired. Ask for a new one.', eFull: 'Two parents are already connected to this child.', eNet: 'Could not connect. Check your connection and try again.', months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
    uz: { yours: 'Sizning vaʼdangiz', theirs: '{p}ning vaʼdasi', bricks: '{n} ta oʻqish gʻishti', tasks: '{n} ta bajarilgan vazifa', streak: '{n} kun ketma-ket', left: '{n} kun qoldi', lastDay: 'Oxirgi kun', reached: 'Erishildi', given: 'Sovgʻa berildi', ended: 'Tugadi',
      by: '{d} gacha', soFar: 'hozircha', reachedMsg: '{c} maqsadga erishdi. Sovgʻa vaqti!', give: 'Berildi deb belgilash', gave: 'Berildi deb belgilandi. {c} buni ilovada koʻradi.', add: '+ Vaʼda qoʻshish', addSub: 'Maqsad uchun haqiqiy sovgʻa vaʼda qiling. {c} uni Bosh sahifada koʻradi.',
      eyebrow: 'Ota-ona vaʼdasi', title: 'Maqsad uchun sovgʻa vaʼda qiling', lead: '{c} mehnat qilib erisha oladigan narsani tanlang. {c} vaʼdangizni Bosh sahifada koʻradi, u har bir mashgʻulot bilan toʻlib boradi.', what: '{c} nimaga erishsin?',
      gBricks: 'Oʻqish gʻishtlari', gTasks: 'Bajarilgan vazifalar', gStreak: 'Ketma-ket kunlar', hBricks: '1 gʻisht = Oʻqish xonasida 25 daqiqa diqqat bilan oʻqish. 100 gʻisht taxminan 42 soat.', hTasks: 'Kundalik rejadagi vazifalar, bugundan boshlab sanaladi.', hStreak: 'Ketma-ket oʻqilgan kunlar.',
      target: 'Maqsad', reward: 'Sovgʻa', rewardPh: 'Masalan, yangi velosiped', when: 'Qachongacha', thisMonth: 'Shu oy oxirigacha', nextMonth: 'Keyingi oy oxirigacha', sees: '{c} koʻradi', save: 'Vaʼdani saqlash', saving: 'Saqlanmoqda…',
      fine: 'Sovgʻani oʻzingiz berasiz. {c} maqsadga erishgan zahoti ilova shu yerda aytadi.', need: 'Maqsad va sovgʻani kiriting', tooMany: 'Sizda uchta ochiq vaʼda bor. Avval bittasini bering yoki tugating.', failed: 'Saqlab boʻlmadi. Internetni tekshirib, qayta urinib koʻring.', saved: 'Saqlandi. {c} uni Bosh sahifada koʻradi.',
      congrats: '{c}ni tabriklash', sent: 'Yuborildi. {c} tabrigingizni ilovada koʻradi.', sentAlready: 'Tabriklandi ✓', kids: 'Farzandlaringiz', addKid: 'Yana bir farzand qoʻshish', addKidSub: 'Aka-uka yoki opa-singil akkauntini ulang', viewing: 'Hozir koʻrsatilmoqda',
      addTitle: 'Yana bir farzand qoʻshish', addLead: 'Ikkinchi farzandning telefonida Jamals Globalni oching: Sozlamalar → Ota-onalar boʻlimida oila kodi bor. Uni shu yerga yozing.', code: 'Oila kodi', connect: 'Ulash', connecting: 'Ulanmoqda…',
      eInvalid: 'Kod notoʻgʻri. Farzandning telefonida tekshiring.', eExpired: 'Kodning muddati tugagan. Yangisini soʻrang.', eFull: 'Bu farzandga allaqachon ikki ota-ona ulangan.', eNet: 'Ulab boʻlmadi. Internetni tekshirib, qayta urinib koʻring.', months: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'] },
    ru: { yours: 'Ваше обещание', theirs: 'Обещание: {p}', bricks: '{n} кирпичиков учёбы', tasks: '{n} выполненных заданий', streak: '{n} дней подряд', left: 'Осталось дней: {n}', lastDay: 'Последний день', reached: 'Достигнуто', given: 'Награда вручена', ended: 'Завершено',
      by: 'До {d}', soFar: 'пока', reachedMsg: '{c} достигает цели. Время для награды!', give: 'Отметить как вручено', gave: 'Отмечено. {c} увидит это в приложении.', add: '+ Добавить обещание', addSub: 'Пообещайте настоящую награду за цель. {c} увидит её на главном экране.',
      eyebrow: 'Обещание родителя', title: 'Пообещайте награду за цель', lead: 'Выберите то, чего {c} может добиться своим трудом. Обещание видно на главном экране и заполняется с каждым занятием.', what: 'Чего нужно достичь?',
      gBricks: 'Кирпичики учёбы', gTasks: 'Выполненные задания', gStreak: 'Дни подряд', hBricks: '1 кирпичик = 25 минут сосредоточенной учёбы в Учебной комнате. 100 кирпичиков — около 42 часов.', hTasks: 'Задания из плана на день, считаются с сегодняшнего дня.', hStreak: 'Дни подряд с занятиями.',
      target: 'Цель', reward: 'Награда', rewardPh: 'Например, новый велосипед', when: 'К какому сроку', thisMonth: 'До конца этого месяца', nextMonth: 'До конца следующего месяца', sees: 'Что увидит {c}', save: 'Сохранить обещание', saving: 'Сохраняем…',
      fine: 'Награду вы вручаете сами. Приложение сообщит здесь, как только цель будет достигнута.', need: 'Укажите цель и награду', tooMany: 'У вас три открытых обещания. Сначала вручите или завершите одно.', failed: 'Не удалось сохранить. Проверьте соединение и попробуйте ещё раз.', saved: 'Сохранено. {c} увидит его на главном экране.',
      congrats: 'Поздравить: {c}', sent: 'Отправлено. {c} увидит поздравление в приложении.', sentAlready: 'Поздравление отправлено ✓', kids: 'Ваши дети', addKid: 'Добавить ещё ребёнка', addKidSub: 'Подключите аккаунт брата или сестры', viewing: 'Показан сейчас',
      addTitle: 'Добавить ещё ребёнка', addLead: 'Откройте Jamals Global на телефоне второго ребёнка: в Настройках → Родители есть семейный код. Введите его здесь.', code: 'Семейный код', connect: 'Подключить', connecting: 'Подключаем…',
      eInvalid: 'Код неверный. Проверьте его на телефоне ребёнка.', eExpired: 'Срок кода истёк. Попросите новый.', eFull: 'К этому ребёнку уже подключены два родителя.', eNet: 'Не удалось подключить. Проверьте соединение и попробуйте ещё раз.', months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'] }
  };
  function lang() { var l = String(document.documentElement.getAttribute('lang') || '').slice(0, 2); return l === 'uz' || l === 'ru' ? l : 'en'; }
  function w(k, v) { var s = W[lang()][k]; v = v || {}; return String(s).replace(/\{(\w)\}/g, function (_, x) { return x === 'c' ? NAME : v[x] != null ? v[x] : ''; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function post(url, body) {
    return fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': BOOT.uid }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }
  var toastT = 0;
  function toast(s) { var t = document.getElementById('toast'); if (!t) return; t.textContent = s; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  var X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var GIFT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M2.5 9h19v-3h-19zM12 6v14M12 6c-1.5-3.5-6-3.5-5 0M12 6c1.5-3.5 6-3.5 5 0"/></svg>';
  function openSheet(html) {
    var sh = document.getElementById('sheet'), sc = document.getElementById('scrim'); if (!sh) return null;
    sh.className = 'sheet'; sh.innerHTML = '<button class="sheet-close" type="button" aria-label="Close">' + X + '</button>' + html; sh.scrollTop = 0; sh.setAttribute('data-notr', '');
    if (sc) sc.classList.add('on');
    requestAnimationFrame(function () { sh.classList.add('on'); });
    sh.querySelector('.sheet-close').addEventListener('click', closeSheet);
    return sh;
  }
  function closeSheet() { var sh = document.getElementById('sheet'), sc = document.getElementById('scrim'); if (sh) { sh.classList.remove('on'); sh.removeAttribute('data-notr'); } if (sc) sc.classList.remove('on'); }
  function dayMonth(d) { var p = String(d).split('-'), l = lang(), m = W[l].months[+p[1] - 1], n = +p[2]; return l === 'uz' ? n + '-' + m : n + ' ' + m; }
  function endOf(add) { var t = new Date(), last = new Date(Date.UTC(t.getFullYear(), t.getMonth() + 1 + add, 0)); return last.toISOString().slice(0, 10); }

  /* ---------- pledges ---------- */
  var PL = M.pledges || [];
  function goalTxt(g, n) { return w(g, { n: n }); }
  function renderPledges() {
    var el = document.getElementById('pledgeList'); if (!el) return;
    el.setAttribute('data-notr', '');
    el.innerHTML = PL.map(function (p) {
      var pct = Math.min(100, Math.round(p.progress / p.target * 100)) || 0, cls = p.status === 'given' ? 'claimed' : p.status;
      var chip = p.status === 'active' ? '<span class="chip grey">' + esc(p.days_left === 0 ? w('lastDay') : w('left', { n: p.days_left })) + '</span>' : p.status === 'ended' ? '<span class="chip grey">' + esc(w('ended')) + '</span>' : '<span class="chip ok">' + esc(w(p.status === 'reached' ? 'reached' : 'given')) + '</span>';
      return '<article class="card pledge ' + cls + '" data-jg-pledge="' + esc(p.id) + '"><div class="pl-top"><span class="pl-gift">' + GIFT + '</span><span class="row-t"><b>' + esc(p.from.you ? w('yours') : w('theirs', { p: p.from.first })) + '</b><small>' + esc(goalTxt(p.goal, p.target)) + '</small><small>' + esc(w('by', { d: dayMonth(p.due) })) + '</small></span>' + chip + '</div>' +
        '<p class="pl-reward">' + esc(p.reward) + '</p><div class="bar"><b data-w="' + pct + '" style="width:' + pct + '%"></b></div><p class="pl-n"><span>' + Math.min(p.progress, p.target) + ' / ' + p.target + '</span> <span>' + esc(w('soFar')) + '</span></p>' +
        (p.status === 'reached' ? '<p class="pl-msg">' + esc(w('reachedMsg')) + '</p>' + (p.from.you ? '<button class="btn btn-primary" type="button" data-jg-give="' + esc(p.id) + '">' + esc(w('give')) + '</button>' : '') : '') + '</article>';
    }).join('') + '<button class="card pl-add" type="button" data-jg-pledge-add="">' + esc(w('add')) + '<small>' + esc(w('addSub')) + '</small></button>';
  }
  var F = { goal: 'bricks', target: '150', reward: '', due: 'month' }, DEF = { bricks: '150', tasks: '60', streak: '30' };
  function paintForm(sh) {
    sh.querySelectorAll('[data-jg-g]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-jg-g') === F.goal)); });
    sh.querySelectorAll('[data-jg-d]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-jg-d') === F.due)); });
    sh.querySelector('#plHelp').textContent = w({ bricks: 'hBricks', tasks: 'hTasks', streak: 'hStreak' }[F.goal]);
    sh.querySelector('#plPrev').textContent = w('yours') + ': ' + (F.reward.trim() || '…') + ' · ' + goalTxt(F.goal, F.target || '…') + ' · ' + w('by', { d: dayMonth(endOf(F.due === 'next' ? 1 : 0)) });
  }
  function openPledge() {
    F = { goal: 'bricks', target: DEF.bricks, reward: '', due: 'month' };
    var giftImg = (document.querySelector('img[src*="giftbox"], .gift-hero img') || {}).src || '';
    var sh = openSheet('<div class="grab"></div>' + (giftImg ? '<div class="gift-hero"><img src="' + esc(giftImg) + '" alt=""></div>' : '') +
      '<p class="eyebrow">' + esc(w('eyebrow')) + '</p><h3 id="sheetTitle">' + esc(w('title')) + '</h3><p class="lead">' + esc(w('lead')) + '</p>' +
      '<p class="g-lbl">' + esc(w('what')) + '</p><div class="g-chips" role="group">' + [['bricks', 'gBricks'], ['tasks', 'gTasks'], ['streak', 'gStreak']].map(function (o) { return '<button type="button" data-jg-g="' + o[0] + '" aria-pressed="false">' + esc(w(o[1])) + '</button>'; }).join('') + '</div>' +
      '<p class="pl-help" id="plHelp"></p><p class="g-lbl">' + esc(w('target')) + '</p><input class="g-in" id="plTarget" inputmode="numeric" aria-label="' + esc(w('target')) + '" value="' + esc(F.target) + '">' +
      '<p class="g-lbl">' + esc(w('reward')) + '</p><input class="g-in" id="plReward" autocomplete="off" maxlength="80" aria-label="' + esc(w('reward')) + '" placeholder="' + esc(w('rewardPh')) + '">' +
      '<p class="g-lbl">' + esc(w('when')) + '</p><div class="g-chips" role="group">' + [['month', 'thisMonth'], ['next', 'nextMonth']].map(function (o) { return '<button type="button" data-jg-d="' + o[0] + '" aria-pressed="false">' + esc(w(o[1])) + '</button>'; }).join('') + '</div>' +
      '<div class="pl-preview"><small>' + esc(w('sees')) + '</small><p id="plPrev"></p></div><p class="g-err" id="plErr" role="alert"></p>' +
      '<button class="btn btn-primary btn-block" type="button" id="jgPlSave" style="margin-top:14px">' + esc(w('save')) + '</button><p class="fine">' + esc(w('fine')) + '</p>');
    if (!sh) return;
    paintForm(sh);
    sh.addEventListener('click', function (e) {
      var g = e.target.closest('[data-jg-g]'), d = e.target.closest('[data-jg-d]');
      if (g) { F.goal = g.getAttribute('data-jg-g'); F.target = DEF[F.goal]; sh.querySelector('#plTarget').value = F.target; }
      if (d) F.due = d.getAttribute('data-jg-d');
      if (g || d) paintForm(sh);
    });
    sh.querySelector('#plTarget').addEventListener('input', function (e) { F.target = e.target.value.replace(/[^0-9]/g, ''); paintForm(sh); });
    sh.querySelector('#plReward').addEventListener('input', function (e) { F.reward = e.target.value; sh.querySelector('#plErr').textContent = ''; paintForm(sh); });
    sh.querySelector('#jgPlSave').addEventListener('click', function () {
      var btn = this, n = parseInt(F.target, 10), err = sh.querySelector('#plErr');
      if (!(n >= 1) || !F.reward.trim()) { err.textContent = w('need'); return; }
      btn.disabled = true; btn.textContent = w('saving');
      post('/api/v1/pledges', { student_id: C.student_id, goal: F.goal, target: Math.min(n, 10000), reward: F.reward.trim().slice(0, 80), due: F.due }).then(function (r) {
        btn.disabled = false; btn.textContent = w('save');
        if (r.status === 201) { PL = r.body.pledges || PL; renderPledges(); closeSheet(); toast(w('saved')); return; }
        err.textContent = r.status === 409 ? w('tooMany') : w('failed');
      });
    });
  }
  function give(id, btn) {
    btn.disabled = true;
    post('/api/v1/pledges/' + encodeURIComponent(id), { action: 'give' }).then(function (r) {
      if (r.status !== 200) { btn.disabled = false; toast(w('failed')); return; }
      PL.forEach(function (p) { if (p.id === id) { p.status = 'given'; p.given_at = new Date().toISOString(); } }); renderPledges(); toast(w('gave'));
    });
  }

  /* ---------- congratulate, under the proud card of a medal that is an event ---------- */
  var EV = M.events || [], medalI = 0;
  function congratsRow() {
    var sh = document.getElementById('sheet'), card = sh && sh.querySelector('.proud-card'); if (!card || sh.querySelector('#jgCongrats')) return;
    var ev = EV.filter(function (e) { return e.medal === medalI; })[0]; if (!ev) return;
    var row = sh.querySelector('.share-row'), b = document.createElement('button');
    b.className = 'btn btn-primary btn-block'; b.type = 'button'; b.id = 'jgCongrats'; b.style.marginTop = '12px'; b.setAttribute('data-notr', '');
    b.textContent = ev.sent ? w('sentAlready') : w('congrats'); b.disabled = !!ev.sent;
    b.addEventListener('click', function () {
      b.disabled = true;
      post('/api/v1/parent/notes', { student_id: C.student_id, event: ev.key }).then(function (r) {
        if (r.status !== 200) { b.disabled = false; toast(w('failed')); return; }
        ev.sent = true; b.textContent = w('sentAlready'); toast(w('sent'));
      });
    });
    (row || card).insertAdjacentElement('afterend', b);
  }

  /* ---------- children: the switcher and Add another child ---------- */
  var KIDS = BOOT.children || [];
  function setChild(id) { document.cookie = 'jg_child=' + encodeURIComponent(id) + '; Path=/; Max-Age=31536000; SameSite=Lax'; location.reload(); }
  function kidRow(k, i) {
    return '<button class="row" type="button" data-jg-kid="' + esc(k.id) + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + esc(k.photoUrl || initials(k.fullName)) + '" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover"><span class="row-t"><b>' + esc(k.fullName) + '</b>' + (i === 0 ? '<small>' + esc(w('viewing')) + '</small>' : '') + '</span></button>';
  }
  function initials(n) { var i = String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x.charAt(0).toUpperCase(); }).join(''); return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#DFF2EF"/><text x="20" y="25" text-anchor="middle" font-family="Raleway,sans-serif" font-size="15" font-weight="700" fill="#1F7A71">' + esc(i) + '</text></svg>'); }
  function addKidRow() { return '<button class="row" type="button" data-jg-addkid=""><span class="jm-av" style="background:#EEF2EF"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="row-t"><b>' + esc(w('addKid')) + '</b><small>' + esc(w('addKidSub')) + '</small></span></button>'; }
  function openKids() { openSheet('<div class="grab"></div><h3 id="sheetTitle">' + esc(w('kids')) + '</h3><div class="card rows" style="margin-top:14px">' + KIDS.map(kidRow).join('') + addKidRow() + '</div>'); }
  function openAddKid() {
    var sh = openSheet('<div class="grab"></div><h3 id="sheetTitle">' + esc(w('addTitle')) + '</h3><p class="lead">' + esc(w('addLead')) + '</p><p class="g-lbl">' + esc(w('code')) + '</p>' +
      '<input class="g-in" id="jgKidCode" autocomplete="off" autocapitalize="characters" maxlength="12" aria-label="' + esc(w('code')) + '" style="text-transform:uppercase;letter-spacing:.12em"><p class="g-err" id="jgKidErr" role="alert"></p>' +
      '<button class="btn btn-primary btn-block" type="button" id="jgKidGo" style="margin-top:14px">' + esc(w('connect')) + '</button>');
    if (!sh) return;
    sh.querySelector('#jgKidGo').addEventListener('click', function () {
      var btn = this, code = sh.querySelector('#jgKidCode').value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(), err = sh.querySelector('#jgKidErr');
      if (code.length < 6) { err.textContent = w('eInvalid'); return; }
      btn.disabled = true; btn.textContent = w('connecting');
      post('/api/v1/family/join', { code: code }).then(function (r) {
        if (r.status === 200 && r.body.studentId) { setChild(r.body.studentId); return; }
        btn.disabled = false; btn.textContent = w('connect');
        err.textContent = r.status === 410 ? w('eExpired') : r.status === 409 ? w('eFull') : r.status === 400 ? w('eInvalid') : w('eNet');
      });
    });
  }
  function paintKids() {                                   // the Account's Children card: every child, as its first row draws one
    var row = document.querySelector('#p-account [data-jg-addkid]'), card = row && row.parentNode; if (!card) return;
    card.querySelectorAll('[data-jg-kid]').forEach(function (x) { x.remove(); });
    KIDS.slice(1).forEach(function (k, i) { row.insertAdjacentHTML('beforebegin', kidRow(k, i + 1)); });
    card.querySelectorAll('[data-jg-kid]').forEach(function (x) { x.setAttribute('data-notr', ''); });
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    var add = t.closest('[data-jg-pledge-add], [data-sheet="pledge"]'), gv = t.closest('[data-jg-give]'), pr = t.closest('[data-proud]'), kids = t.closest('[data-jg-kids]'), addKid = t.closest('[data-jg-addkid]'), kid = t.closest('[data-jg-kid]');
    if (pr) { medalI = +pr.getAttribute('data-proud') || 0; setTimeout(congratsRow, 0); return; }   // the design opens the sheet; the row goes under it
    if (add) { e.stopPropagation(); e.preventDefault(); openPledge(); return; }
    if (gv) { e.stopPropagation(); e.preventDefault(); give(gv.getAttribute('data-jg-give'), gv); return; }
    if (addKid) { e.stopPropagation(); e.preventDefault(); openAddKid(); return; }
    if (kids) { e.stopPropagation(); e.preventDefault(); openKids(); return; }
    if (kid) { e.stopPropagation(); e.preventDefault(); if (kid.getAttribute('data-jg-kid') !== KIDS[0].id) setChild(kid.getAttribute('data-jg-kid')); else closeSheet(); }
  }, true);

  window.JG_M1P = { pledges: renderPledges };              // the design's renderPledges, on a language switch too (PM:107, 836)
  renderPledges(); paintKids();
  document.addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('[data-lang-pick]')) setTimeout(paintKids, 0); });
})();
