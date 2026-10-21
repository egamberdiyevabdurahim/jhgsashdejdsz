/* Jamals Global runtime: the IELTS Writing task inside a lesson (P7; SPEC-lessons §4.7, C-18, C-19; the owner's 12 Oct 2026 "lessons va lesson
 * h/w qism"). Not design code. Loaded by src/server/pages.ts for a live, non-demo student only with WRITING on (inside the lessons part),
 * before jg-lessons.js (the phone) and jg-lessons-desktop.js (the laptop), whose readers call JG_WRITING.mount(host, o) where a Writing
 * lesson's test would be. It speaks GET/POST /api/v1/lessons/<id>/writing (src/app/api/v1/lessons/[id]/writing/route.ts):
 *  1. THE TASK: what to write in her language; the question (and a Task 1 chart's numbers) in English, as on the exam; a box with a live
 *     word count; "Send".
 *  2. THE FEEDBACK on her first version: four criteria, each with what is good, one fix and one of her own sentences made better (Jamol's,
 *     the AI layer's); or, with no AI feedback, the lesson's four questions to check it herself. A line says it is practice feedback, not a
 *     score, and that Jamol can be wrong (C-18: no band, ever). Then her text again in the box, to improve and send.
 *  3. DONE (C-19): the revision sent (60+ words, changed, 4+ minutes after she opened the task) pays once; the server says why when it is
 *     not yet (too short, the same text, too soon with the seconds left). "Next lesson" and "Enough for today"; she may improve it again,
 *     unpaid.
 * Every word in en, uz (U+02BB, U+02BC) and ru, marked data-no-i18n. Keys and other students' texts never reach this page.
 * window.JG_WRITING: mount(host, o), words(lang), count(text). tests/unit/lessons-writing/page.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_WRITING) return;

  var T = {
    en: { head: 'Your paragraph', task: 'The task', data: 'The numbers', box: 'Write here in English',
      count: function (n, a, b) { return n + (n === 1 ? ' word' : ' words') + ' · needed: ' + a + '–' + b; }, send: 'Send', sending: 'Jamol is reading…',
      back: 'Back to the lesson', fbHead: 'Jamol’s feedback', selfHead: 'Check it yourself', good: 'Good:', fix: 'Fix:', yours: 'You wrote:', better: 'Better:',
      reviseHead: 'Now improve it', reviseNote: 'Change your paragraph using the feedback, then send it again.', sendRev: 'Send my new version',
      notScore: 'This is practice feedback, not a score. Jamol can be wrong: if you are not sure, ask your teacher.',
      short: function (n, m) { return 'You have ' + n + ' words. Write at least ' + m + '.'; }, long: function (m) { return 'Too long: keep it under about ' + m + ' words.'; },
      soon: function (s) { return 'Take your time: read the feedback once more. You can send it in ' + s + ' s.'; }, same: 'This is the same text as before. Change at least one sentence.',
      failed: 'It did not open. Check the internet and try again.', again: 'Try again', loading: 'Loading…',
      doneH: 'Well done!', doneL: function (c) { return 'Writing task done' + (c > 0 ? ' · +' + c + ' coins' : ''); }, final: 'Your new version', first: 'Your first version',
      more: 'Improve it again', moreNote: 'More versions are welcome. They do not add coins.', next: 'Next lesson', enough: 'Enough for today' },
    uz: { head: 'Sizning xatboshingiz', task: 'Topshiriq', data: 'Raqamlar', box: 'Shu yerga ingliz tilida yozing',
      count: function (n, a, b) { return n + ' soʻz · kerak: ' + a + '–' + b; }, send: 'Yuborish', sending: 'Jamol oʻqiyapti…',
      back: 'Darsga qaytish', fbHead: 'Jamolning fikri', selfHead: 'Oʻzingiz tekshiring', good: 'Yaxshi:', fix: 'Tuzating:', yours: 'Siz yozdingiz:', better: 'Yaxshiroq:',
      reviseHead: 'Endi yaxshilang', reviseNote: 'Maslahatlarga qarab xatboshingizni oʻzgartiring va yana yuboring.', sendRev: 'Yangi variantni yuborish',
      notScore: 'Bu mashq uchun maslahat, baho emas. Jamol xato qilishi mumkin: ishonchingiz komil boʻlmasa, oʻqituvchingizdan soʻrang.',
      short: function (n, m) { return 'Hozir ' + n + ' soʻz. Kamida ' + m + ' soʻz yozing.'; }, long: function (m) { return 'Juda uzun: taxminan ' + m + ' soʻzgacha qisqartiring.'; },
      soon: function (s) { return 'Shoshilmang: maslahatni yana bir oʻqing. ' + s + ' soniyadan keyin yuborish mumkin.'; }, same: 'Bu oldingi matn bilan bir xil. Kamida bitta gapni oʻzgartiring.',
      failed: 'Ochilmadi. Internetni tekshirib, qayta urinib koʻring.', again: 'Qayta urinish', loading: 'Yuklanmoqda…',
      doneH: 'Barakalla!', doneL: function (c) { return 'Yozish topshirigʻi bajarildi' + (c > 0 ? ' · +' + c + ' tanga' : ''); }, final: 'Yangi variantingiz', first: 'Birinchi variantingiz',
      more: 'Yana yaxshilash', moreNote: 'Yana variant yozsangiz boʻladi. Tanga qoʻshilmaydi.', next: 'Keyingi dars', enough: 'Bugunga yetarli' },
    ru: { head: 'Ваш абзац', task: 'Задание', data: 'Цифры', box: 'Пишите здесь по-английски',
      count: function (n, a, b) { return n + ' сл. · нужно: ' + a + '–' + b; }, send: 'Отправить', sending: 'Жамол читает…',
      back: 'Вернуться к уроку', fbHead: 'Отзыв Жамола', selfHead: 'Проверьте сами', good: 'Хорошо:', fix: 'Исправьте:', yours: 'Вы написали:', better: 'Лучше:',
      reviseHead: 'Теперь улучшите', reviseNote: 'Измените абзац по советам и отправьте ещё раз.', sendRev: 'Отправить новую версию',
      notScore: 'Это совет для практики, а не оценка. Жамол может ошибаться: если сомневаетесь, спросите учителя.',
      short: function (n, m) { return 'Сейчас ' + n + ' сл. Напишите не меньше ' + m + '.'; }, long: function (m) { return 'Слишком длинно: сократите примерно до ' + m + ' слов.'; },
      soon: function (s) { return 'Не спешите: перечитайте советы. Отправить можно через ' + s + ' с.'; }, same: 'Это тот же текст, что раньше. Измените хотя бы одно предложение.',
      failed: 'Не открылось. Проверьте интернет и попробуйте ещё раз.', again: 'Ещё раз', loading: 'Загрузка…',
      doneH: 'Отлично!', doneL: function (c) { return 'Письменное задание выполнено' + (c > 0 ? ' · +' + c + ' монет' : ''); }, final: 'Ваша новая версия', first: 'Ваша первая версия',
      more: 'Улучшить ещё', moreNote: 'Можно писать новые версии. Монет они не добавляют.', next: 'Следующий урок', enough: 'На сегодня хватит' }
  };
  function words(l) { return T[l] || T.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var WORD = /[\p{L}\p{N}]+(?:['’ʼ-][\p{L}\p{N}]+)*/gu;
  /* the server's count (src/server/lessons/writing.ts wordsOf) */
  function count(text) { var m = String(text || '').normalize('NFC').match(WORD); return m ? m.length : 0; }
  function req(method, url, body) {
    return fetch(url, { method: method, headers: method === 'POST' ? { 'content-type': 'application/json', 'x-jg-uid': B.uid } : { 'x-jg-uid': B.uid }, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }

  var cssDone = false;
  function css() {
    if (cssDone || D.getElementById('jw-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jw-css';
    s.textContent = [
      '.jw{display:grid;gap:12px;font-family:var(--font)}',
      '.jw .dg-go{width:100%}.jw .dg-link{justify-self:center;text-align:center}',
      '.jw-k{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2)}',
      '.jw-steer{font-size:14px;font-weight:700;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jw-q{padding:12px 14px;border-radius:14px;background:#f5f8f6;font-size:14.5px;line-height:1.5;color:var(--ink);white-space:pre-line;overflow-wrap:anywhere}',
      '.jw-q b{display:block;margin-bottom:4px;font-size:12px;font-weight:800;color:var(--muted)}',
      '.jw-data{margin-top:8px;font-variant-numeric:tabular-nums}',
      '.jw-box{width:100%;box-sizing:border-box;min-height:180px;padding:12px 14px;border:1.5px solid #dfe8e3;border-radius:14px;background:#fff;color:var(--ink);font:500 15px/1.55 var(--font);resize:vertical}',
      '.jw-box:focus{outline:none;border-color:var(--ink2)}',
      '.jw-n{font-size:12.5px;font-weight:700;color:var(--muted)}.jw-n.ok{color:var(--accent)}.jw-n.bad{color:#b4472f}',
      '.jw-msg{font-size:13.5px;font-weight:700;line-height:1.45;color:#b4472f}',
      '.jw-note{font-size:12.5px;font-weight:600;line-height:1.45;color:var(--muted)}',
      '.jw-cards{display:grid;gap:8px;margin:0;padding:0;list-style:none}',
      '.jw-card{padding:12px 14px;border-radius:14px;background:#f5f8f6;font-size:14px;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jw-card h4{margin:0 0 6px;font-size:13px;font-weight:800;color:var(--ink2)}',
      '.jw-card p{margin:4px 0 0}.jw-card i{font-style:normal;font-weight:800}',
      '.jw-card .jw-s{color:var(--muted)}.jw-card .jw-b{color:var(--ink)}',
      '.jw-mine{padding:12px 14px;border-radius:14px;border:1.5px dashed #dfe8e3;font-size:14px;line-height:1.5;color:var(--ink);white-space:pre-line;overflow-wrap:anywhere}',
      '.jw-win{font-size:22px;font-weight:800;color:var(--ink)}',
      '.jw-done{padding:12px 14px;border-radius:14px;background:linear-gradient(150deg,var(--g1,#fbeedf),var(--g2,#f5ddc2));font-size:14.5px;font-weight:800;color:var(--ink)}',
      '.jw-go{width:100%;height:52px;border:0;border-radius:999px;background:#14201a;color:#fff;font:800 16px var(--font);cursor:pointer}'
    ].join('\n');
    D.head.appendChild(s);
  }

  /* o: { id, lang, next: { id, title } | null, back(), nextLesson(), enough(), done(view, pays) } */
  function mount(host, o) {
    css();
    var S = { o: o, v: null, failed: false, busy: false, msg: '', text: null, more: false };
    host.setAttribute('data-no-i18n', ''); host.__jw = S;
    if (!host.__jwOn) {
      host.__jwOn = true;
      host.addEventListener('click', function (e) { var t = e.target.closest ? e.target.closest('[data-jw]') : null; if (t && host.__jw) act(host, host.__jw, t.getAttribute('data-jw')); });
      host.addEventListener('input', function (e) { if (e.target && e.target.classList && e.target.classList.contains('jw-box') && host.__jw) { host.__jw.text = e.target.value; counter(host, host.__jw); } });
    }
    paint(host, S); load(host, S);
  }
  function url(S) { return '/api/v1/lessons/' + encodeURIComponent(S.o.id) + '/writing?lang=' + encodeURIComponent(S.o.lang || 'en'); }
  function load(host, S) {
    req('GET', url(S)).then(function (r) {
      if (host.__jw !== S) return;
      if (r.status === 200 && r.body && r.body.writing) { S.v = r.body.writing; S.failed = false; } else S.failed = true;
      paint(host, S);
    });
  }
  function counter(host, S) {
    var el = host.querySelector('.jw-n'); if (!el || !S.v) return;
    /* what the box holds: after the first version it already holds her draft (lane p7f, 13 Oct 2026: it read 0 until she typed) */
    var box = host.querySelector('.jw-box'), n = count(box ? box.value : (S.text || '')), a = S.v.state === 'open' ? S.v.words.min : S.v.min_words, b = S.v.words.max;
    el.textContent = words(S.o.lang).count(n, a, b); el.className = 'jw-n ' + (n >= a && n <= b + 50 ? 'ok' : n > 0 ? 'bad' : '');
  }
  function act(host, S, k) {
    if (k === 'retry') { S.failed = false; paint(host, S); return load(host, S); }
    if (k === 'back') return S.o.back && S.o.back();
    if (k === 'next') return S.o.nextLesson && S.o.nextLesson();
    if (k === 'enough') return S.o.enough && S.o.enough();
    if (k === 'more') { S.more = true; S.text = S.v.revision || S.v.draft || ''; S.msg = ''; return paint(host, S); }
    if (k !== 'send' || S.busy || !S.v) return;
    var box = host.querySelector('.jw-box'), text = box ? box.value : (S.text || ''), x = words(S.o.lang);
    S.text = text; S.busy = true; S.msg = ''; paint(host, S);
    req('POST', url(S), { stage: S.v.state === 'open' ? 'draft' : 'revision', text: text }).then(function (r) {
      if (host.__jw !== S) return;
      S.busy = false;
      var b = r.body || {};
      if (r.status === 200 && b.writing) {
        var was = S.v.state; S.v = b.writing; S.text = null; S.more = false;
        if (S.v.state === 'complete' && (was !== 'complete' || (b.pays | 0) > 0) && S.o.done) try { S.o.done(S.v, b.pays | 0); } catch (e) {}
      } else if (b.error === 'too_short') S.msg = x.short(b.words | 0, b.min | 0);
      else if (b.error === 'too_long') S.msg = x.long(b.max | 0);
      else if (b.error === 'too_soon') S.msg = x.soon(b.wait_s | 0);
      else if (b.error === 'same') S.msg = x.same;
      else if (b.error === 'draft_sent' || b.error === 'no_draft') { S.text = null; return load(host, S); }
      else S.msg = x.failed;
      paint(host, S);
    });
  }
  function question(v, x) {
    return '<div class="jw-q"><b>' + esc(x.task) + '</b>' + esc(v.prompt) + (v.data ? '<div class="jw-data"><b>' + esc(x.data) + '</b>' + esc(v.data) + '</div>' : '') + '</div>';
  }
  function editor(S, x, label, value) {
    return '<label class="jw-k" for="jw-box-' + esc(S.o.id) + '">' + esc(label) + '</label>'
      + '<textarea class="jw-box" id="jw-box-' + esc(S.o.id) + '" lang="en" spellcheck="false" autocomplete="off" placeholder="' + esc(x.box) + '"' + (S.busy ? ' disabled' : '') + '>' + esc(value) + '</textarea>'
      + '<p class="jw-n" aria-live="polite"></p>' + (S.msg ? '<p class="jw-msg" role="status">' + esc(S.msg) + '</p>' : '');
  }
  function feedback(v, x) {
    var f = v.feedback; if (!f) return '';
    var name = {}; (v.criteria || []).forEach(function (c) { name[c.id] = c.name; });
    var cards = f.by === 'ai'
      ? f.criteria.map(function (c) {
        return '<li class="jw-card"><h4>' + esc(name[c.id] || c.id) + '</h4><p><i>' + esc(x.good) + '</i> ' + esc(c.strength) + '</p><p><i>' + esc(x.fix) + '</i> ' + esc(c.fix) + '</p>'
          + (c.sentence && c.better ? '<p class="jw-s" lang="en"><i>' + esc(x.yours) + '</i> ' + esc(c.sentence) + '</p><p class="jw-b" lang="en"><i>' + esc(x.better) + '</i> ' + esc(c.better) + '</p>' : '') + '</li>';
      })
      : f.criteria.map(function (c) { return '<li class="jw-card"><h4>' + esc(name[c.id] || c.id) + '</h4><p>' + esc(c.ask) + '</p></li>'; });
    return '<p class="jw-k">' + esc(f.by === 'ai' ? x.fbHead : x.selfHead) + '</p><ol class="jw-cards">' + cards.join('') + '</ol>'
      + '<p class="jw-steer">' + esc(f.revise) + '</p>' + (f.by === 'ai' ? '<p class="jw-note">' + esc(x.notScore) + '</p>' : '');
  }
  function paint(host, S) {
    var x = words(S.o.lang), v = S.v, h;
    if (!v) h = '<p class="jw-note">' + esc(S.failed ? x.failed : x.loading) + '</p>' + (S.failed ? '<button class="dg-go" type="button" data-jw="retry">' + esc(x.again) + '</button>' : '');
    else if (v.state === 'open') {
      h = '<p class="jw-k">' + esc(x.head) + '</p><p class="jw-steer">' + esc(v.steer) + '</p>' + question(v, x)
        + editor(S, x, x.box, S.text != null ? S.text : '')
        + '<button class="dg-go" type="button" data-jw="send"' + (S.busy ? ' disabled' : '') + '>' + esc(S.busy ? x.sending : x.send) + '</button>'
        + '<button class="dg-link" type="button" data-jw="back">' + esc(x.back) + '</button>';
    } else if (v.state === 'handed_in' || S.more) {
      h = question(v, x) + '<p class="jw-k">' + esc(x.first) + '</p><div class="jw-mine" lang="en">' + esc(v.draft) + '</div>' + feedback(v, x)
        + editor(S, x, x.reviseHead, S.text != null ? S.text : (v.revision || v.draft || '')) + '<p class="jw-note">' + esc(S.more ? x.moreNote : x.reviseNote) + '</p>'
        + '<button class="dg-go" type="button" data-jw="send"' + (S.busy ? ' disabled' : '') + '>' + esc(x.sendRev) + '</button>'
        + '<button class="dg-link" type="button" data-jw="back">' + esc(x.back) + '</button>';
    } else {
      h = '<p class="jw-win">' + esc(x.doneH) + '</p><p class="jw-done">' + esc(x.doneL(v.coins | 0)) + '</p>'
        + '<p class="jw-k">' + esc(x.final) + '</p><div class="jw-mine" lang="en">' + esc(v.revision) + '</div>'
        + (S.o.next ? '<button class="jw-go" type="button" data-jw="next">' + esc(x.next) + '</button>' : '')
        + '<button class="dg-link" type="button" data-jw="enough">' + esc(x.enough) + '</button>'
        + '<button class="dg-link" type="button" data-jw="more">' + esc(x.more) + '</button>';
    }
    host.innerHTML = '<div class="jw">' + h + '</div>';
    counter(host, S);
  }

  W.JG_WRITING = { mount: mount, words: words, count: count };
})();
