/* Jamals Global runtime: the IELTS Speaking practice inside a lesson (P8; SPEC-lessons §4.7 speaking, C-21; the owner's "continue man",
 * 14 Oct 2026). Not design code. Loaded by src/server/pages.ts for a live, non-demo student only with SPEAKING on (inside the lessons part),
 * before jg-lessons.js (the phone) and jg-lessons-desktop.js (the laptop), whose readers call JG_SPEAKING.mount(host, o) where a Speaking
 * lesson's test would be. NOTHING IS RECORDED: this file never asks for the microphone; she speaks aloud and the page keeps time. Her plan
 * notes stay in the page and are never sent. It speaks GET/POST /api/v1/lessons/<id>/speaking (step plan / talk / check):
 *  1. WARM-UP: the Part 1 questions, said aloud;
 *  2. THE CARD (English, as on the exam), then ONE MINUTE TO PLAN on its timer, with the plan template (a row per point);
 *  3. TWO MINUTES TO TALK on its timer;
 *  4. the model outline at her level, then THE SELF-CHECK (each line "yes" or "not yet");
 *  5. done (the self-report rate, once) or, with a timer cut short, not yet (run them again); the question after the talk and Part 3.
 * P8b: a card with its own preparation (C7-10, content PLAN §5) brings its plan rows in her language (v.plan.rows), its model outline in
 * English, labels too (v.outline.own) and its own self-check questions (v.checks); a card with no Part 1 questions opens on the card.
 * P15: with SPEAKING_VOICE on, a page also loads jg-speaking-voice.js (window.JG_SPEAKING_VOICE), and its record slots go on the warm-up
 * (Part 1) and the result screen (Part 2 again, Part 3); without it nothing here changes. This file itself still never records.
 * Every word in en, uz (U+02BB, U+02BC) and ru, marked data-no-i18n.
 * window.JG_SPEAKING: mount(host, o), words(lang), clock(s). tests/unit/lessons-speaking/page.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_SPEAKING) return;

  var T = {
    en: { warmHead: 'Warm-up: Part 1', warmNote: 'Answer each question aloud in two or three sentences. Nothing is recorded.', toCard: 'Show me the card',
      cardHead: 'Your cue card (Part 2)', tip: 'Tip', planGo: 'Start my planning minute', planHead: 'One minute to plan',
      planNote: 'Write one or two words for each row. Your notes stay on this device.', rowOpen: 'How you start', rowWhy: 'Why',
      talkGo: 'Start my two minutes', talkSkip: 'Start talking now', skipWarn: 'If a timer is cut short, the practice does not count and gives no coins.',
      talkHead: 'Two minutes: talk', talkNote: 'Speak aloud, as if an examiner were listening. Nothing is recorded or sent: this device only keeps time.', talkEnd: 'I have finished',
      outlineHead: function (l) { return 'A model outline (' + l + ')'; }, outlineNote: 'Each line starts one part of the talk: add a detail, an example or a feeling to fill the time shown. Then give your talk again.',
      sec: function (s) { return '~' + s + ' s'; }, checkHead: 'Check yourself', yes: 'Yes', notYet: 'Not yet', finish: 'Finish',
      finishNote: 'Answer every line honestly: “not yet” counts too.', doneH: 'Well done!',
      doneL: function (c) { return 'Speaking practice done' + (c > 0 ? ' · +' + c + ' coins' : ''); },
      skippedH: 'Not counted yet', skippedPlan: 'The planning minute was cut short.', skippedTalk: 'The two minutes were cut short.',
      skippedNote: 'Let both timers run to the end to finish this lesson.', again: 'Run the timers again', more: 'Practise this card again',
      moreNote: 'Extra practice is welcome, but it earns no more coins.', afterHead: 'Then the examiner asks', part3Head: 'Part 3: discussion',
      part3Note: 'Answer aloud: give a reason and an example each time.', focus: 'Next time, work on:', next: 'Next lesson', enough: 'Enough for today',
      back: 'Back to the lesson', failed: 'This did not load. Check your internet connection and try again.', retry: 'Try again', loading: 'Loading…' },
    uz: { warmHead: 'Qizib olish: Part 1', warmNote: 'Har bir savolga ovoz chiqarib, ikki-uch gap bilan javob bering. Hech narsa yozib olinmaydi.', toCard: 'Kartochkani koʻrsatish',
      cardHead: 'Kartochkangiz (Part 2)', tip: 'Maslahat', planGo: '1 daqiqalik tayyorgarlikni boshlash', planHead: 'Bir daqiqa: reja',
      planNote: 'Har bir qatorga bir-ikki soʻz yozing. Qaydlaringiz faqat shu qurilmada qoladi.', rowOpen: 'Qanday boshlaysiz', rowWhy: 'Nega',
      talkGo: '2 daqiqalik nutqni boshlash', talkSkip: 'Hoziroq gapirishni boshlash', skipWarn: 'Taymer oxirigacha ishlamasa, mashq hisoblanmaydi va tanga berilmaydi.',
      talkHead: 'Ikki daqiqa: gapiring', talkNote: 'Ovoz chiqarib gapiring. Hech narsa yozib olinmaydi va hech qayerga yuborilmaydi: sahifa faqat vaqtni hisoblaydi.', talkEnd: 'Gapirib boʻldim',
      outlineHead: function (l) { return 'Namunaviy javob rejasi (' + l + ')'; }, outlineNote: 'Har bir qator nutqning bir qismini boshlab beradi: koʻrsatilgan vaqtni toʻldirish uchun tafsilot, misol yoki hissiyot qoʻshing. Keyin nutqingizni yana bir bor ayting.',
      sec: function (s) { return '~' + s + ' soniya'; }, checkHead: 'Oʻzingizni tekshiring', yes: 'Ha', notYet: 'Hali emas', finish: 'Yakunlash',
      finishNote: 'Har bir qatorga rostini belgilang: «Hali emas» desangiz ham mashq hisoblanadi.', doneH: 'Barakalla!',
      doneL: function (c) { return 'Gapirish mashqi bajarildi' + (c > 0 ? ' · +' + c + ' tanga' : ''); },
      skippedH: 'Hali hisoblanmadi', skippedPlan: 'Tayyorgarlik taymeri vaqtidan oldin toʻxtatildi.', skippedTalk: 'Ikki daqiqalik taymer vaqtidan oldin toʻxtatildi.',
      skippedNote: 'Darsni yakunlash uchun ikkala taymer oxirigacha ishlashini kuting.', again: 'Taymerlarni qayta boshlash', more: 'Shu kartochkani yana mashq qilish',
      moreNote: 'Yana mashq qilsangiz boʻladi. Tanga qoʻshilmaydi.', afterHead: 'Keyin imtihon oluvchi soʻraydi', part3Head: 'Part 3: muhokama',
      part3Note: 'Ovoz chiqarib javob bering: har safar sabab va misol keltiring.', focus: 'Keyingi safar shularga eʼtibor bering:', next: 'Keyingi dars', enough: 'Bugunga yetarli',
      back: 'Darsga qaytish', failed: 'Ochilmadi. Internetni tekshirib, qayta urinib koʻring.', retry: 'Qayta urinish', loading: 'Yuklanmoqda…' },
    ru: { warmHead: 'Разминка: Part 1', warmNote: 'Ответьте на каждый вопрос вслух двумя-тремя предложениями. Ничего не записывается.', toCard: 'Показать карточку',
      cardHead: 'Ваша карточка (Part 2)', tip: 'Совет', planGo: 'Начать минуту подготовки', planHead: 'Одна минута: план',
      planNote: 'Запишите одно-два слова в каждую строку. Заметки остаются только на этом устройстве и никуда не отправляются.', rowOpen: 'С чего начнёте', rowWhy: 'Почему',
      talkGo: 'Начать говорить (2 минуты)', talkSkip: 'Начать говорить сейчас', skipWarn: 'Если остановить таймер раньше времени, практика не засчитается и монеты не начислятся.',
      talkHead: 'Две минуты: говорите', talkNote: 'Говорите вслух. Ничего не записывается и не отправляется: устройство только отсчитывает время.', talkEnd: 'Я закончил(а)',
      outlineHead: function (l) { return 'Образец плана ответа (' + l + ')'; }, outlineNote: 'Каждая строка начинает одну часть рассказа: добавьте деталь, пример или чувство, чтобы заполнить указанное время. Затем расскажите всё ещё раз.',
      sec: function (s) { return '~' + s + ' сек'; }, checkHead: 'Проверьте себя', yes: 'Да', notYet: 'Пока нет', finish: 'Завершить',
      finishNote: 'Честно отметьте каждый пункт: ответ «пока нет» тоже засчитывается.', doneH: 'Отлично!',
      doneL: function (c) { return 'Практика говорения выполнена' + (c > 0 ? ' · +' + c + ' ' + ruCoins(c) : ''); },
      skippedH: 'Пока не засчитано', skippedPlan: 'Вы начали говорить, не дождавшись конца минуты на подготовку.', skippedTalk: 'Вы закончили говорить раньше, чем прошли две минуты.',
      skippedNote: 'Чтобы завершить урок, дождитесь, пока оба таймера дойдут до конца.', again: 'Запустить таймеры снова', more: 'Потренироваться с этой карточкой ещё раз',
      moreNote: 'Тренироваться можно сколько угодно, но монеты за повтор не начисляются.', afterHead: 'Потом экзаменатор спросит', part3Head: 'Part 3: обсуждение',
      part3Note: 'Отвечайте вслух и каждый раз приводите причину и пример.', focus: 'В следующий раз обратите внимание:', next: 'Следующий урок', enough: 'На сегодня хватит',
      back: 'Вернуться к уроку', failed: 'Не удалось открыть. Проверьте подключение и попробуйте снова.', retry: 'Попробовать снова', loading: 'Загрузка…' }
  };
  /* 1 монета, 2-4 монеты, 5+ монет (11-14 монет) */
  function ruCoins(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'монета' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'монеты' : 'монет'; }
  function words(l) { return T[l] || T.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* 75 → "1:15" */
  function clock(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function req(method, url, body) {
    return fetch(url, { method: method, headers: method === 'POST' ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }

  var cssDone = false;
  function css() {
    if (cssDone || D.getElementById('jsp-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jsp-css';
    s.textContent = [
      '.jsp{display:grid;gap:12px;font-family:var(--font)}',
      '.jsp .dg-go{width:100%}.jsp .dg-link{justify-self:center;text-align:center}',
      '.jsp-k{margin:0;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2)}',
      '.jsp-note{margin:0;font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '.jsp-qs{display:grid;gap:8px;margin:0;padding:0;list-style:none;counter-reset:q}',
      '.jsp-qs li{position:relative;padding:10px 14px 10px 40px;border-radius:14px;background:#f5f8f6;font-size:14.5px;line-height:1.45;color:var(--ink);overflow-wrap:anywhere;counter-increment:q}',
      '.jsp-qs li::before{content:counter(q);position:absolute;left:12px;top:10px;width:20px;height:20px;border-radius:50%;background:#fff;font-size:11.5px;font-weight:800;line-height:20px;text-align:center;color:var(--ink2)}',
      '.jsp-card{padding:14px 16px;border-radius:16px;border:1.5px solid #dfe8e3;background:#fff;font-size:14.5px;line-height:1.5;color:var(--ink);overflow-wrap:anywhere}',
      '.jsp-card b{display:block;margin-bottom:6px;font-size:15.5px;font-weight:800}',
      '.jsp-card ul{margin:4px 0;padding-left:20px}.jsp-card p{margin:4px 0 0}',
      '.jsp-tip{padding:10px 14px;border-radius:14px;background:linear-gradient(150deg,var(--g1,#fbeedf),var(--g2,#f5ddc2));font-size:13.5px;font-weight:600;line-height:1.45;color:var(--ink)}',
      '.jsp-tip i{font-style:normal;font-weight:800}',
      '.jsp-timer{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;border-radius:18px;background:#14201a;color:#fff}',
      '.jsp-timer span{font:800 40px/1 var(--font);font-variant-numeric:tabular-nums;letter-spacing:.02em}',
      '.jsp-timer small{font-size:12.5px;font-weight:700;opacity:.75}',
      '.jsp-timer.end{background:var(--accent,#1e684a)}',
      '.jsp-rows{display:grid;gap:8px}',
      '.jsp-row{display:grid;gap:4px}.jsp-row label{font-size:12.5px;font-weight:800;color:var(--ink2);overflow-wrap:anywhere}',
      '.jsp-row input{box-sizing:border-box;width:100%;height:42px;padding:0 12px;border:1.5px solid #dfe8e3;border-radius:12px;background:#fff;color:var(--ink);font:500 15px var(--font)}',
      '.jsp-row input:focus{outline:none;border-color:var(--ink2)}',
      '.jsp-mine{margin:0;padding:10px 14px;border-radius:14px;border:1.5px dashed #dfe8e3;font-size:13.5px;line-height:1.5;color:var(--ink);overflow-wrap:anywhere}',
      '.jsp-out{display:grid;gap:6px;margin:0;padding:0;list-style:none}',
      '.jsp-out li{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:10px 14px;border-radius:14px;background:#f5f8f6;font-size:14px;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jsp-out .p{font-size:12px;font-weight:800;color:var(--ink2)}.jsp-out .s{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}.jsp-out .y{grid-column:1/-1}',
      '.jsp-ck{display:grid;gap:8px;margin:0;padding:0;list-style:none}',
      '.jsp-ck li{display:grid;gap:8px;padding:12px 14px;border-radius:14px;background:#f5f8f6;font-size:14px;font-weight:600;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jsp-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.jsp-two button{min-height:40px;border:1.5px solid #dfe8e3;border-radius:999px;background:#fff;color:var(--ink);font:800 14px var(--font);cursor:pointer}',
      '.jsp-two button[aria-pressed="true"]{border-color:#14201a;background:#14201a;color:#fff}',
      '.jsp-win{margin:0;font-size:22px;font-weight:800;color:var(--ink)}',
      '.jsp-done{margin:0;padding:12px 14px;border-radius:14px;background:linear-gradient(150deg,var(--g1,#fbeedf),var(--g2,#f5ddc2));font-size:14.5px;font-weight:800;color:var(--ink)}',
      '.jsp-warn{margin:0;font-size:13.5px;font-weight:700;line-height:1.45;color:#b4472f}',
      '.jsp-go{width:100%;height:52px;border:0;border-radius:999px;background:#14201a;color:#fff;font:800 16px var(--font);cursor:pointer}'
    ].join('\n');
    D.head.appendChild(s);
  }

  /* o: { id, lang, next: { id, title } | null, back(), nextLesson(), enough(), done(view, pays) } */
  function mount(host, o) {
    css();
    if (host.__jsp && host.__jsp.tick) clearInterval(host.__jsp.tick);
    var S = { o: o, v: null, failed: false, busy: false, screen: null, notes: {}, ticks: {}, end: 0, tick: 0 };   /* end: the running timer's end (Date.now() ms) */
    host.setAttribute('data-no-i18n', ''); host.__jsp = S;
    if (!host.__jspOn) {
      host.__jspOn = true;
      host.addEventListener('click', function (e) { var t = e.target.closest ? e.target.closest('[data-jsp]') : null; if (t && host.__jsp) act(host, host.__jsp, t.getAttribute('data-jsp'), t); });
      host.addEventListener('input', function (e) { var k = e.target && e.target.getAttribute && e.target.getAttribute('data-note'); if (k != null && host.__jsp) host.__jsp.notes[k] = e.target.value; });
    }
    paint(host, S); load(host, S);
  }
  function url(S) { return '/api/v1/lessons/' + encodeURIComponent(S.o.id) + '/speaking?lang=' + encodeURIComponent(S.o.lang || 'en'); }
  /* the screen her attempt is at, from the server's state (a reload resumes a running timer); P8b: a card with no Part 1 questions opens
   * on the card, never on an empty warm-up */
  function screenOf(v, was) {
    if (v.state === 'plan') return 'plan';
    if (v.state === 'talk') return v.talk_left_s > 0 ? 'talk' : 'check';
    if (v.state === 'ended') return 'check';
    if (v.state === 'checked') return 'result';
    return was === 'card' || !(v.part1 && v.part1.length) ? 'card' : 'warm';
  }
  function load(host, S) {
    req('GET', url(S)).then(function (r) {
      if (host.__jsp !== S) return;
      if (r.status === 200 && r.body && r.body.speaking) { got(S, r.body.speaking); S.failed = false; S.screen = screenOf(S.v, S.screen); } else S.failed = true;
      paint(host, S);
    });
  }
  /* a view from the server: a running timer's end, on this page's clock, from the seconds the server says are left (never restarted by a repaint) */
  function got(S, v) {
    S.v = v;
    S.end = v.state === 'plan' ? Date.now() + (v.plan_left_s == null ? v.timers.plan_s : v.plan_left_s) * 1000 : v.state === 'talk' ? Date.now() + (v.talk_left_s == null ? v.timers.talk_s : v.talk_left_s) * 1000 : 0;
  }
  function timer(host, S, then) {
    if (S.tick) clearInterval(S.tick);
    var show = function () {
      if (host.__jsp !== S) { clearInterval(S.tick); return; }
      var s = (S.end - Date.now()) / 1000, el = host.querySelector('.jsp-timer span'), box = host.querySelector('.jsp-timer');
      if (el) el.textContent = clock(s);
      if (s <= 0) { clearInterval(S.tick); S.tick = 0; if (box) box.className = 'jsp-timer end'; if (then) then(); }
    };
    S.tick = setInterval(show, 250); show();
  }
  function step(host, S, body, after) {
    if (S.busy) return; S.busy = true; paint(host, S);
    req('POST', url(S), body).then(function (r) {
      if (host.__jsp !== S) return;
      S.busy = false;
      var b = r.body || {};
      if (r.status === 200 && b.speaking) {
        var was = S.v; got(S, b.speaking);
        if (after) after(b);
        if (S.v.done && (!was.done || (b.pays | 0) > 0) && S.o.done) try { S.o.done(S.v, b.pays | 0); } catch (e) {}
      } else if (r.status === 409) { S.screen = null; return load(host, S); }
      else S.failed = true;
      paint(host, S);
    });
  }
  function act(host, S, k, el) {
    if (k === 'retry') { S.failed = false; paint(host, S); return load(host, S); }
    if (k === 'back') return S.o.back && S.o.back();
    if (k === 'next') return S.o.nextLesson && S.o.nextLesson();
    if (k === 'enough') return S.o.enough && S.o.enough();
    if (!S.v) return;
    if (k === 'card') { S.screen = 'card'; return paint(host, S); }
    if (k === 'plan') return step(host, S, { step: 'plan' }, function () { S.screen = 'plan'; S.ticks = {}; });
    if (k === 'talk') return step(host, S, { step: 'talk' }, function () { S.screen = 'talk'; });
    if (k === 'stop') { if (S.tick) clearInterval(S.tick); S.tick = 0; return step(host, S, { step: 'end' }, function () { S.screen = 'check'; }); }
    if (k === 'yes' || k === 'notyet') { S.ticks[el.getAttribute('data-id')] = k === 'yes'; return paint(host, S); }
    if (k === 'finish') {
      if (!S.v.checks.every(function (c) { return typeof S.ticks[c.id] === 'boolean'; })) return;
      return step(host, S, { step: 'check', ticks: S.ticks }, function () { S.screen = 'result'; });
    }
  }
  function list(items, cls) { return '<ol class="' + (cls || 'jsp-qs') + '" lang="en">' + items.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>'; }
  function card(v) {
    return '<div class="jsp-card" lang="en"><b>' + esc(v.card.topic) + '</b>You should say:<ul>' + v.card.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
      + (v.card.explain ? '<p>' + esc(v.card.explain) + '</p>' : '') + '</div>';
  }
  /* P8b: the plan's rows: the card's own (its preparation's plan in her language, v.plan.rows), else how you start, each point (English),
   * why */
  function planRows(v, lang) {
    var x = words(lang);
    if (v.plan && v.plan.rows && v.plan.rows.length) return v.plan.rows.map(function (l, i) { return { k: 'r' + i, l: l }; });
    return [{ k: 'open', l: x.rowOpen }].concat(v.card.points.map(function (p, i) { return { k: 'p' + i, l: p, en: true }; })).concat([{ k: 'why', l: x.rowWhy }]);
  }
  function plan(S, x) {
    var rows = planRows(S.v, S.o.lang);
    return '<div class="jsp-rows">' + rows.map(function (r) {
      var id = 'jsp-n-' + esc(S.o.id) + '-' + r.k;
      return '<div class="jsp-row"><label for="' + id + '"' + (r.en ? ' lang="en"' : '') + '>' + esc(r.l) + '</label><input id="' + id + '" data-note="' + r.k + '" lang="en" autocomplete="off" spellcheck="false" maxlength="60" value="' + esc(S.notes[r.k] || '') + '"></div>';
    }).join('') + '</div>';
  }
  function notes(S) {
    var have = Object.keys(S.notes).filter(function (k) { return S.notes[k] && S.notes[k].trim(); });
    return have.length ? '<p class="jsp-mine" lang="en">' + esc(have.map(function (k) { return S.notes[k].trim(); }).join(' · ')) + '</p>' : '';
  }
  function tm(S, label) { return '<div class="jsp-timer" role="timer"><span>' + clock((S.end - Date.now()) / 1000) + '</span><small>' + esc(label) + '</small></div>'; }
  /* the model outline; P8b: the card's own (v.outline.own) is English throughout, its labels too */
  function outline(v, x) {
    var own = !!v.outline.own;
    return '<p class="jsp-k">' + esc(x.outlineHead(v.outline.level)) + '</p><ol class="jsp-out">' + v.outline.lines.map(function (l) {
      return '<li><span class="p"' + (own ? ' lang="en"' : '') + '>' + esc(l.part) + '</span><span class="s">' + esc(x.sec(l.s)) + '</span><span class="y" lang="en">' + esc(l.say) + '</span></li>';
    }).join('') + '</ol><p class="jsp-note">' + esc(x.outlineNote) + '</p>';
  }
  function checks(S, x) {
    return '<p class="jsp-k">' + esc(x.checkHead) + '</p><ol class="jsp-ck">' + S.v.checks.map(function (c) {
      var t = S.ticks[c.id];
      return '<li><span>' + esc(c.text) + '</span><span class="jsp-two" role="group"><button type="button" data-jsp="yes" data-id="' + esc(c.id) + '" aria-pressed="' + (t === true) + '">' + esc(x.yes) + '</button>'
        + '<button type="button" data-jsp="notyet" data-id="' + esc(c.id) + '" aria-pressed="' + (t === false) + '">' + esc(x.notYet) + '</button></span></li>';
    }).join('') + '</ol>';
  }
  /* P15: V is jg-speaking-voice.js (only with SPEAKING_VOICE on): a voice slot under the Part 3 questions */
  function after(v, x, V) {
    return (v.after ? '<p class="jsp-k">' + esc(x.afterHead) + '</p>' + list([v.after]) : '')
      + (v.part3.length ? '<p class="jsp-k">' + esc(x.part3Head) + '</p><p class="jsp-note">' + esc(x.part3Note) + '</p>' + list(v.part3) + (V ? V.slot(3) : '') : '');
  }
  function paint(host, S) {
    /* P15: the voice feedback's page half, present only when a page with SPEAKING_VOICE on loaded it; this file itself never records */
    var V = W.JG_SPEAKING_VOICE || null;
    var x = words(S.o.lang), v = S.v, h, dis = S.busy ? ' disabled' : '';
    if (!v) h = '<p class="jsp-note">' + esc(S.failed ? x.failed : x.loading) + '</p>' + (S.failed ? '<button class="dg-go" type="button" data-jsp="retry">' + esc(x.retry) + '</button>' : '');
    else if (S.failed) h = '<p class="jsp-warn">' + esc(x.failed) + '</p><button class="dg-go" type="button" data-jsp="retry">' + esc(x.retry) + '</button>';
    else if (S.screen === 'warm') {
      h = '<p class="jsp-k">' + esc(x.warmHead) + '</p><p class="jsp-note">' + esc(V ? V.words(S.o.lang).warmNote : x.warmNote) + '</p>' + (v.part1.length ? list(v.part1) + (V ? V.slot(1) : '') : '')
        + '<button class="dg-go" type="button" data-jsp="card">' + esc(x.toCard) + '</button><button class="dg-link" type="button" data-jsp="back">' + esc(x.back) + '</button>';
    } else if (S.screen === 'card') {
      h = '<p class="jsp-k">' + esc(x.cardHead) + '</p>' + card(v) + (v.tip ? '<p class="jsp-tip"><i>' + esc(x.tip) + ':</i> ' + esc(v.tip) + '</p>' : '')
        + '<button class="dg-go" type="button" data-jsp="plan"' + dis + '>' + esc(x.planGo) + '</button><button class="dg-link" type="button" data-jsp="back">' + esc(x.back) + '</button>';
    } else if (S.screen === 'plan') {
      h = '<p class="jsp-k">' + esc(x.planHead) + '</p>' + tm(S, x.planHead) + card(v) + '<p class="jsp-note">' + esc(x.planNote) + '</p>' + plan(S, x)
        + '<button class="dg-go" type="button" data-jsp="talk"' + dis + '>' + esc(S.end > Date.now() ? x.talkSkip : x.talkGo) + '</button>' + (S.end > Date.now() ? '<p class="jsp-note jsp-skipw">' + esc(x.skipWarn) + '</p>' : '');
    } else if (S.screen === 'talk') {
      h = '<p class="jsp-k">' + esc(x.talkHead) + '</p>' + tm(S, x.talkHead) + '<p class="jsp-note">' + esc(x.talkNote) + '</p>' + card(v) + notes(S)
        + '<button class="dg-go" type="button" data-jsp="stop"' + dis + '>' + esc(x.talkEnd) + '</button><p class="jsp-note jsp-skipw">' + esc(x.skipWarn) + '</p>';
    } else if (S.screen === 'check') {
      var all = v.checks.every(function (c) { return typeof S.ticks[c.id] === 'boolean'; });
      h = outline(v, x) + checks(S, x) + '<p class="jsp-note">' + esc(x.finishNote) + '</p><button class="dg-go" type="button" data-jsp="finish"' + (all && !S.busy ? '' : ' disabled') + '>' + esc(x.finish) + '</button>';
    } else {
      var miss = v.checks.filter(function (c) { return v.ticks && v.ticks[c.id] === false; });
      if (v.skipped.length && !v.done) {
        h = '<p class="jsp-win">' + esc(x.skippedH) + '</p>' + v.skipped.map(function (s) { return '<p class="jsp-warn">' + esc(s === 'plan' ? x.skippedPlan : x.skippedTalk) + '</p>'; }).join('')
          + '<p class="jsp-note">' + esc(x.skippedNote) + '</p><button class="jsp-go" type="button" data-jsp="plan"' + dis + '>' + esc(x.again) + '</button>';
      } else {
        h = '<p class="jsp-win">' + esc(x.doneH) + '</p><p class="jsp-done">' + esc(x.doneL(v.coins | 0)) + '</p>'
          + (S.o.next ? '<button class="jsp-go" type="button" data-jsp="next">' + esc(x.next) + '</button>' : '');
      }
      h += (V ? V.slot(2) : '') + (miss.length ? '<p class="jsp-k">' + esc(x.focus) + '</p><ul class="jsp-ck">' + miss.map(function (c) { return '<li>' + esc(c.text) + '</li>'; }).join('') + '</ul>' : '')
        + after(v, x, V) + '<button class="dg-link" type="button" data-jsp="enough">' + esc(x.enough) + '</button>'
        + (v.done ? '<button class="dg-link" type="button" data-jsp="plan"' + dis + '>' + esc(x.more) + '</button><p class="jsp-note">' + esc(x.moreNote) + '</p>' : '');
    }
    host.innerHTML = '<div class="jsp">' + h + '</div>';
    if (V) V.attach(host, S.o.id, S.o.lang);
    if (v && !S.failed && S.screen === 'plan' && !S.busy) timer(host, S, function () {
      var b = host.querySelector('[data-jsp="talk"]'); if (b) b.textContent = x.talkGo;
      var w = host.querySelector('.jsp-skipw'); if (w) w.parentNode.removeChild(w);
    });
    else if (v && !S.failed && S.screen === 'talk' && !S.busy) timer(host, S, function () { if (host.__jsp === S && S.screen === 'talk' && !S.busy) step(host, S, { step: 'end' }, function () { S.screen = 'check'; }); });
    else if (S.tick) { clearInterval(S.tick); S.tick = 0; }
  }

  W.JG_SPEAKING = { mount: mount, words: words, clock: clock, planRows: planRows, screenOf: screenOf, outlineHtml: function (v, lang) { return outline(v, words(lang)); } };
})();
