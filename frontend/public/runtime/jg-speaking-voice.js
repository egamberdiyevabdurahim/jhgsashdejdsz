/* Jamals Global runtime: voice feedback on IELTS Speaking (P15; SPEC-lessons §4.7 speaking phase 3, C-18, C-21; the owner's "add",
 * 18 Oct 2026). Not design code. Loaded by src/server/pages.ts for a live, non-demo student only with SPEAKING_VOICE on (inside SPEAKING,
 * with the AI layer deployed), before jg-speaking.js, whose screens place a slot (slot(part)) for Part 1 (the warm-up), Part 2 (the talk,
 * given again, on the result screen) and Part 3 (the discussion) and call attach(host, id, lang) after each paint.
 * In a slot she records 30 s to 2 min (MediaRecorder: opus in webm or ogg, AAC in mp4 on Safari) under a consent line that says where the
 * voice goes: only to Jamals' own server, where it becomes text and is deleted at once. The recording is sent once to
 * POST /api/v1/lessons/<id>/speaking/voice and dropped: nothing of it is kept on the device (no storage, no object URL, no player), the
 * microphone is let go the moment it stops, and a recording whose slot leaves the screen is stopped and thrown away unsent. Jamol's
 * feedback on the transcript comes back: three lines (flow, words, grammar), up to three of her phrases, a tip and a line to say again;
 * no band, no score, and an honest line that pronunciation is not checked yet. Every word in en, uz (U+02BB, U+02BC) and ru.
 * window.JG_SPEAKING_VOICE: slot(part), attach(host, id, lang), words(lang), clock(s), typeOf(MediaRecorder), marked(text, marks), limits.
 * tests/unit/lessons-speaking/voice-page.test.ts. */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT;
  if (!B || !B.engine || B.demo || W.JG_SPEAKING_VOICE) return;

  var MIN = 30, MAX = 120;
  var T = {
    en: { head: function (p) { return 'Record your answer · Part ' + p; },
      lead1: 'Answer the questions above aloud, one after another, for 30 seconds to 2 minutes. Jamol reads what you said and gives you tips. Nothing is recorded until you tap “Start recording”.',
      lead2: 'Give your talk once more, for at least 30 seconds and up to 2 minutes. Jamol reads what you said and gives you tips.',
      lead3: 'Answer the Part 3 questions above aloud, for 30 seconds to 2 minutes. Jamol reads what you said and gives you tips.',
      consent: 'Your recording goes only to Jamals’ own server, where it is turned into text and deleted at once. Jamol reads only the text.',
      rec: 'Start recording', again: 'Record again', stop: 'Stop and send', cancel: 'Cancel (nothing is sent)',
      recNote: 'Speak in English. You can send after 30 seconds; at 2 minutes it sends by itself.', asking: 'Allow the microphone to start.',
      sending: 'Jamol is reading what you said…', fbHead: 'Jamol’s feedback', marksHead: 'Fix these', said: 'You said:', better: 'Better:', tip: 'Tip',
      sayAgain: 'Now say it like this', heard: 'What Jamol read (your words as text)',
      pron: 'Pronunciation is not checked yet: we will add it only after testing it on Uzbek-accented English.',
      notScore: 'This is practice feedback, not a score. Jamol can be wrong: if you are not sure, ask your teacher.',
      left: function (n) { return n === 1 ? '1 recording left today' : n + ' recordings left today'; },
      none: 'That is all the voice feedback for today. Come back tomorrow.',
      warmNote: 'Answer each question aloud in two or three sentences.',
      noMic: 'The microphone is not allowed. Allow it for this site in your browser, or practise aloud without recording.',
      noRec: 'This browser cannot record here. Practise aloud without recording.',
      tooShort: 'That was under 30 seconds. Say a little more and try again.',
      tooLittle: function (n) { return 'Jamol heard too few English words for feedback: he needs at least ' + n + ' of your own (um and uh do not count). Speak a little louder, closer to the microphone, and try again.'; },
      noSpeech: 'Jamol heard no speech in this recording. Check that the microphone is on and not covered, and try again.',
      busy: 'Jamol is busy with other students. Try again in a minute.', unavail: 'Voice feedback is not available right now. Try again later.',
      noFb: 'Jamol could not give feedback this time. Use the self-check, and try again later.',
      failed: 'It did not go through. Check the internet and try again.', retry: 'Try again' },
    uz: { head: function (p) { return 'Javobingizni yozib oling · Part ' + p; },
      lead1: 'Yuqoridagi savollarga ketma-ket ovoz chiqarib javob bering: 30 soniyadan 2 daqiqagacha. Jamol aytganlaringizni oʻqib, maslahat beradi. «Yozishni boshlash» tugmasini bosmaguningizcha hech narsa yozib olinmaydi.',
      lead2: 'Nutqingizni yana bir bor ayting: kamida 30 soniya, koʻpi bilan 2 daqiqa. Jamol aytganlaringizni oʻqib, maslahat beradi.',
      lead3: 'Yuqoridagi Part 3 savollariga ovoz chiqarib javob bering: 30 soniyadan 2 daqiqagacha. Jamol aytganlaringizni oʻqib, maslahat beradi.',
      consent: 'Yozuvingiz faqat Jamalsning oʻz serveriga boradi: u yerda matnga aylantiriladi va darhol oʻchiriladi. Jamol faqat matnni oʻqiydi.',
      rec: 'Yozishni boshlash', again: 'Yana yozib olish', stop: 'Toʻxtatish va yuborish', cancel: 'Bekor qilish (hech narsa yuborilmaydi)',
      recNote: 'Ingliz tilida gapiring. 30 soniyadan keyin yuborish mumkin, 2 daqiqa toʻlganda oʻzi yuboriladi.', asking: 'Boshlash uchun mikrofonga ruxsat bering.',
      sending: 'Jamol aytganlaringizni oʻqiyapti…', fbHead: 'Jamolning fikri', marksHead: 'Shularni tuzating', said: 'Siz aytdingiz:', better: 'Yaxshiroq:', tip: 'Maslahat',
      sayAgain: 'Endi shunday aytib koʻring', heard: 'Jamol oʻqigan matn (soʻzlaringiz)',
      pron: 'Talaffuz hozircha tekshirilmaydi: uni oʻzbekcha talaffuzli ingliz tilida sinab koʻrganimizdan keyingina qoʻshamiz.',
      notScore: 'Bu mashq uchun maslahat, baho emas. Jamol xato qilishi mumkin: ishonchingiz komil boʻlmasa, oʻqituvchingizdan soʻrang.',
      left: function (n) { return 'Bugun yana ' + n + ' marta yozib olish mumkin'; },
      none: 'Bugungi ovozli mashqlar tugadi. Ertaga qayting.',
      warmNote: 'Har bir savolga ovoz chiqarib, ikki-uch gap bilan javob bering.',
      noMic: 'Mikrofonga ruxsat berilmagan. Brauzerda shu sayt uchun ruxsat bering yoki yozmasdan, ovoz chiqarib mashq qiling.',
      noRec: 'Bu brauzer bu yerda yozib ololmaydi. Yozmasdan, ovoz chiqarib mashq qiling.',
      tooShort: '30 soniyadan qisqa boʻldi. Biroz koʻproq gapirib, qayta urinib koʻring.',
      tooLittle: function (n) { return 'Fikr bildirish uchun Jamol juda kam inglizcha soʻz eshitdi: kamida ' + n + ' ta oʻz soʻzingiz kerak («um», «uh» hisoblanmaydi). Mikrofonga yaqinroq, balandroq gapirib, qayta urinib koʻring.'; },
      noSpeech: 'Jamol bu yozuvda nutq eshitmadi. Mikrofon yoqilgan va hech narsa bilan yopilmaganini tekshirib, qayta urinib koʻring.',
      busy: 'Jamol hozir boshqa oʻquvchilar bilan band. Bir daqiqadan keyin qayta urinib koʻring.', unavail: 'Ovozli fikr hozir ishlamayapti. Keyinroq qayta urinib koʻring.',
      noFb: 'Bu safar Jamol fikr bildira olmadi. Oʻzingizni tekshirish roʻyxatidan foydalaning va keyinroq qayta urinib koʻring.',
      failed: 'Yuborilmadi. Internetni tekshirib, qayta urinib koʻring.', retry: 'Qayta urinish' },
    ru: { head: function (p) { return 'Запишите свой ответ · Part ' + p; },
      lead1: 'Ответьте вслух на вопросы выше, один за другим: от 30 секунд до 2 минут. Жамол прочитает, что вы сказали, и даст советы. Ничего не записывается, пока вы не нажмёте «Начать запись».',
      lead2: 'Расскажите свой ответ ещё раз: не меньше 30 секунд и не больше 2 минут. Жамол прочитает, что вы сказали, и даст советы.',
      lead3: 'Ответьте вслух на вопросы Part 3 выше: от 30 секунд до 2 минут. Жамол прочитает, что вы сказали, и даст советы.',
      consent: 'Запись уходит только на собственный сервер Jamals: там она превращается в текст и сразу удаляется. Жамол читает только текст.',
      rec: 'Начать запись', again: 'Записать ещё раз', stop: 'Остановить и отправить', cancel: 'Отменить (ничего не отправится)',
      recNote: 'Говорите по-английски. Отправить можно через 30 секунд, а через 2 минуты запись отправится сама.', asking: 'Разрешите доступ к микрофону, чтобы начать.',
      sending: 'Жамол читает ваш ответ…', fbHead: 'Отзыв Жамола', marksHead: 'Исправьте это', said: 'Вы сказали:', better: 'Лучше:', tip: 'Совет',
      sayAgain: 'Теперь скажите так', heard: 'Что прочитал Жамол (ваши слова текстом)',
      pron: 'Произношение пока не проверяется: добавим его только после проверки на английской речи с узбекским акцентом.',
      notScore: 'Это совет для практики, а не оценка. Жамол может ошибаться: если сомневаетесь, спросите учителя.',
      left: function (n) { return 'Сегодня осталось записей: ' + n; },
      none: 'На сегодня отзывы на записи закончились. Возвращайтесь завтра.',
      warmNote: 'Ответьте на каждый вопрос вслух двумя-тремя предложениями.',
      noMic: 'Нет доступа к микрофону. Разрешите его для этого сайта в браузере или тренируйтесь вслух без записи.',
      noRec: 'Этот браузер не может записывать здесь. Тренируйтесь вслух без записи.',
      tooShort: 'Получилось меньше 30 секунд. Скажите чуть больше и попробуйте снова.',
      tooLittle: function (n) { return 'Жамол услышал слишком мало английских слов для отзыва: нужно хотя бы ' + n + ' ваших слов («um» и «uh» не считаются). Говорите чуть громче и ближе к микрофону и попробуйте снова.'; },
      noSpeech: 'Жамол не услышал речи в этой записи. Проверьте, что микрофон включён и ничем не закрыт, и попробуйте снова.',
      busy: 'Жамол сейчас занят другими учениками. Попробуйте через минуту.', unavail: 'Отзыв на запись сейчас недоступен. Попробуйте позже.',
      noFb: 'В этот раз Жамол не смог дать отзыв. Пройдите самопроверку и попробуйте позже.',
      failed: 'Не отправилось. Проверьте интернет и попробуйте снова.', retry: 'Попробовать снова' }
  };
  function words(l) { return T[l] || T.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* 75 → "1:15", counting up */
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  /* the first type this browser records that the server takes */
  function typeOf(R) {
    var c = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'];
    for (var i = 0; i < c.length; i++) { try { if (R && R.isTypeSupported && R.isTypeSupported(c[i])) return c[i]; } catch (e) {} }
    return '';
  }
  function supported() { var n = W.navigator; return !!(n && n.mediaDevices && n.mediaDevices.getUserMedia && W.MediaRecorder && typeOf(W.MediaRecorder)); }
  /* her transcript, escaped, with her marked phrases in <mark> (the first place each occurs, never overlapping) */
  function marked(text, marks) {
    var t = String(text || ''), low = t.toLowerCase(), r = [];
    (marks || []).forEach(function (m) {
      var p = String(m.phrase || '').toLowerCase(), at = p ? low.indexOf(p) : -1;
      if (at >= 0 && !r.some(function (x) { return at < x[1] && at + p.length > x[0]; })) r.push([at, at + p.length]);
    });
    r.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', from = 0;
    r.forEach(function (x) { out += esc(t.slice(from, x[0])) + '<mark>' + esc(t.slice(x[0], x[1])) + '</mark>'; from = x[1]; });
    return out + esc(t.slice(from));
  }

  var cssDone = false;
  function css() {
    if (cssDone || D.getElementById('jspv-css')) return; cssDone = true;
    var s = D.createElement('style'); s.id = 'jspv-css';
    s.textContent = [
      '.jspv{display:grid;gap:10px;padding:14px;border-radius:18px;border:1.5px solid #dfe8e3;background:#fff}',
      '.jspv:empty{display:none}',
      '.jspv .jsp-k,.jspv .jsp-note,.jspv .jsp-warn{margin:0}',
      '.jspv-consent{margin:0;padding:10px 12px;border-left:3px solid var(--accent,#1e684a);border-radius:4px 12px 12px 4px;background:#f5f8f6;font-size:12.5px;font-weight:700;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jspv-rec{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:50px;padding:0 16px;border:1.5px solid #14201a;border-radius:999px;background:#fff;color:#14201a;font:800 15.5px var(--font);cursor:pointer}',
      '.jspv-rec i{flex:none;width:12px;height:12px;border-radius:50%;background:#d6453d}',
      '.jspv-left{margin:0;text-align:center;font-size:12px;font-weight:700;color:var(--muted)}',
      '.jspv-timer i{flex:none;width:12px;height:12px;border-radius:50%;background:#ff5a4f;animation:jspv-p 1.2s ease-in-out infinite}',
      '@keyframes jspv-p{50%{opacity:.3}}',
      '.jspv-wait{margin:0;padding:12px 14px;border-radius:14px;background:#f5f8f6;font-size:14px;font-weight:700;color:var(--ink2);animation:jspv-p 1.6s ease-in-out infinite}',
      '@media (prefers-reduced-motion:reduce){.jspv-timer i,.jspv-wait{animation:none}}',
      '.jspv-crit,.jspv-marks{display:grid;gap:8px;margin:0;padding:0;list-style:none}',
      '.jspv-crit li{display:grid;gap:2px;padding:10px 14px;border-radius:14px;background:#f5f8f6;font-size:14px;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jspv-crit b{font-size:12px;font-weight:800;color:var(--ink2)}',
      '.jspv-marks li{display:grid;gap:4px;padding:10px 14px;border-radius:14px;border:1.5px dashed #dfe8e3;font-size:14px;line-height:1.45;color:var(--ink);overflow-wrap:anywhere}',
      '.jspv-marks .s{font-size:12.5px;font-weight:700;color:var(--muted)}.jspv-marks q{quotes:"\\201C" "\\201D";font-weight:800;color:var(--ink);background:#fdecc8;border-radius:4px;padding:0 3px}',
      '.jspv-marks .b i{font-style:normal;font-weight:800;color:var(--accent,#1e684a)}',
      '.jspv-line{margin:0;padding:12px 14px;border-radius:14px;background:#14201a;color:#fff;font-size:15px;font-weight:700;line-height:1.5;overflow-wrap:anywhere}',
      '.jspv-heard summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--ink2)}',
      '.jspv-heard p{margin:8px 0 0;font-size:13.5px;line-height:1.55;color:var(--ink);overflow-wrap:anywhere}',
      '.jspv-heard mark{background:#fdecc8;color:inherit;border-radius:4px;padding:0 2px}'
    ].join('\n');
    D.head.appendChild(s);
  }

  var ST = {}, INFO = {};     /* ST: a slot's state by "<lesson>:<part>"; INFO: GET .../speaking/voice by lesson */
  function state(id, part, lang) {
    var k = id + ':' + part, s = ST[k] || (ST[k] = { k: k, id: id, part: part, lang: lang, phase: 'idle', msg: '', res: null, rec: null, stream: null, chunks: null, t0: 0, tick: 0, type: '', secs: 0 });
    s.lang = lang; return s;
  }
  function el(s) { return D.querySelector('[data-jspv-key="' + s.k + '"]'); }
  function req(method, url, body, type) {
    var h = { 'x-jg-uid': B.uid }; if (type) h['content-type'] = type;
    return fetch(url, { method: method, headers: h, credentials: 'same-origin', body: body })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j || {} }; }, function () { return { status: r.status, body: {} }; }); }, function () { return { status: 0, body: {} }; });
  }
  function base(id) { return '/api/v1/lessons/' + encodeURIComponent(id) + '/speaking/voice'; }

  /* the microphone let go: every track stopped */
  function release(s) { if (s.stream) s.stream.getTracks().forEach(function (t) { t.stop(); }); s.stream = null; }
  /* a recording thrown away, unsent */
  function drop(s) {
    if (s.tick) { clearInterval(s.tick); s.tick = 0; }
    var r = s.rec; s.rec = null; s.chunks = null; s.phase = 'idle';
    if (r && r.state !== 'inactive') { try { r.stop(); } catch (e) {} }
    release(s);
  }
  function start(s) {
    if (!supported()) { s.phase = 'err'; s.msg = 'noRec'; return paint(s); }
    s.phase = 'ask'; s.res = null; paint(s);
    W.navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }).then(function (stream) {
      if (s.phase !== 'ask') { s.stream = stream; release(s); return; }                     /* cancelled while asking */
      var type = typeOf(W.MediaRecorder), rec;
      try { rec = new W.MediaRecorder(stream, { mimeType: type, audioBitsPerSecond: 32000 }); } catch (e) { s.stream = stream; release(s); s.phase = 'err'; s.msg = 'noRec'; return paint(s); }
      s.stream = stream; s.rec = rec; s.chunks = []; s.type = type;
      rec.ondataavailable = function (e) { if (e.data && e.data.size && s.chunks) s.chunks.push(e.data); };
      rec.onstop = function () { release(s); if (s.phase === 'stopping' && s.rec === rec) send(s); };
      rec.start(1000); s.t0 = Date.now(); s.phase = 'rec'; paint(s);
      s.tick = setInterval(function () { tick(s); }, 250);
    }, function (e) {
      if (s.phase !== 'ask') return;
      s.phase = 'err'; s.msg = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError' || e.name === 'PermissionDeniedError') ? 'noMic' : 'noRec'; paint(s);
    });
  }
  function tick(s) {
    var box = el(s);
    if (!box) return drop(s);                                                                   /* its slot left the screen */
    var t = (Date.now() - s.t0) / 1000, c = box.querySelector('.jspv-timer span'), b = box.querySelector('[data-jspv="stop"]');
    if (c) c.textContent = clock(t);
    if (b) b.disabled = t < MIN;
    if (t >= MAX) stop(s);
  }
  function stop(s) {
    if (s.phase !== 'rec' || !s.rec) return;
    var t = (Date.now() - s.t0) / 1000;
    if (t < MIN) return;
    if (s.tick) { clearInterval(s.tick); s.tick = 0; }
    s.secs = Math.min(MAX, Math.round(t)); s.phase = 'stopping'; paint(s);
    try { s.rec.stop(); } catch (e) { send(s); }
  }
  function send(s) {
    var parts = s.chunks || [], type = String(s.type || '').split(';')[0], body = new Blob(parts, { type: type });
    s.chunks = null; s.rec = null; s.phase = 'send'; paint(s);
    var url = base(s.id) + '?lang=' + encodeURIComponent(s.lang || 'en') + '&part=' + s.part + '&seconds=' + s.secs + '&consent=1';
    req('POST', url, body, type).then(function (r) {
      body = null;
      var b = r.body || {}, info = INFO[s.id];
      if (r.status === 200 && b.voice) { s.phase = 'done'; s.res = b.voice; if (info && info.v) info.v.left = b.voice.left; }
      else {
        s.phase = 'err';
        /* P16: nothing heard (silence, noise, mumbling: Whisper's transcript is empty) or too few of her own words, with the minimum */
        s.msg = b.error === 'too_short' ? 'tooShort' : b.error === 'too_little' && !b.words || b.error === 'bad_audio' ? 'noSpeech' : b.error === 'too_little' ? 'tooLittle' : b.error === 'busy' ? 'busy' : b.error === 'unavailable' ? 'unavail'
          : b.error === 'limit' ? 'none' : 'failed';
        s.need = b.need || 20;
        if (b.error === 'limit' && info && info.v) info.v.left = 0;
      }
      paint(s);
    });
  }

  function head(s, x) { return '<p class="jsp-k">' + esc(x.head(s.part)) + '</p>'; }
  function recBtn(x, again) { return '<button class="jspv-rec" type="button" data-jspv="rec"><i></i>' + esc(again ? x.again : x.rec) + '</button>'; }
  function feedback(s, x) {
    var v = s.res, f = v.feedback, h = '';
    if (f) {
      h += '<p class="jsp-k">' + esc(x.fbHead) + '</p><ul class="jspv-crit">' + f.criteria.map(function (c) { return '<li><b>' + esc(c.name) + '</b><span>' + esc(c.line) + '</span></li>'; }).join('') + '</ul>';
      if (f.marks.length) h += '<p class="jsp-k">' + esc(x.marksHead) + '</p><ol class="jspv-marks">' + f.marks.map(function (m) {
        return '<li><span class="s">' + esc(x.said) + ' <q lang="en">' + esc(m.phrase) + '</q></span><span>' + esc(m.note) + '</span><span class="b"><i>' + esc(x.better) + '</i> <span lang="en">' + esc(m.better) + '</span></span></li>';
      }).join('') + '</ol>';
      h += '<p class="jsp-tip"><i>' + esc(x.tip) + ':</i> ' + esc(f.tip) + '</p><p class="jsp-k">' + esc(x.sayAgain) + '</p><p class="jspv-line" lang="en">' + esc(f.again) + '</p>';
    } else h += '<p class="jsp-warn">' + esc(x.noFb) + '</p>';
    h += '<details class="jspv-heard"><summary>' + esc(x.heard) + '</summary><p lang="en">' + marked(v.transcript, f ? f.marks : []) + '</p></details>'
      + '<p class="jsp-note">' + esc(x.pron) + '</p>' + (f ? '<p class="jsp-note">' + esc(x.notScore) + '</p>' : '');
    return h;
  }
  function html(s) {
    var x = words(s.lang), info = INFO[s.id], v = info && info.v;
    if (!v || !v.on || (v.parts || []).indexOf(s.part) < 0) return '';
    if (!supported() && s.phase !== 'done') return head(s, x) + '<p class="jsp-note">' + esc(x.noRec) + '</p>';
    var left = '<p class="jspv-left">' + esc(x.left(v.left)) + '</p>';
    if (s.phase === 'ask') return head(s, x) + '<p class="jsp-note">' + esc(x.asking) + '</p><button class="dg-link" type="button" data-jspv="cancel">' + esc(x.cancel) + '</button>';
    if (s.phase === 'rec') {
      var t = (Date.now() - s.t0) / 1000;
      return head(s, x) + '<div class="jsp-timer jspv-timer" role="timer"><i></i><span>' + clock(t) + '</span><small>/ ' + clock(MAX) + '</small></div>'
        + '<p class="jsp-note">' + esc(x.recNote) + '</p><button class="dg-go" type="button" data-jspv="stop"' + (t < MIN ? ' disabled' : '') + '>' + esc(x.stop) + '</button>'
        + '<button class="dg-link" type="button" data-jspv="cancel">' + esc(x.cancel) + '</button>';
    }
    if (s.phase === 'stopping' || s.phase === 'send') return head(s, x) + '<p class="jspv-wait">' + esc(x.sending) + '</p>';
    if (s.phase === 'done') return head(s, x) + feedback(s, x) + (v.left > 0 ? recBtn(x, true) + left : '<p class="jsp-note">' + esc(x.none) + '</p>');
    var line = x[s.msg] || x.failed;
    if (s.phase === 'err') return head(s, x) + '<p class="jsp-warn">' + esc(typeof line === 'function' ? line(s.need) : line) + '</p>'
      + (s.msg === 'none' || s.msg === 'noRec' ? '' : '<button class="dg-link" type="button" data-jspv="retry">' + esc(x.retry) + '</button>');
    if (v.left <= 0) return head(s, x) + '<p class="jsp-note">' + esc(x.none) + '</p>';
    return head(s, x) + '<p class="jsp-note">' + esc(x['lead' + s.part]) + '</p><p class="jspv-consent">' + esc(x.consent) + '</p>' + recBtn(x, false) + left;
  }
  function paint(s) { var box = el(s); if (box) box.innerHTML = html(s); }
  function act(s, k) {
    if (k === 'rec') return start(s);
    if (k === 'stop') return stop(s);
    if (k === 'cancel') { drop(s); return paint(s); }
    if (k === 'retry') { s.phase = 'idle'; s.msg = ''; return paint(s); }
  }

  /* the slot jg-speaking.js places on a screen */
  function slot(part) { return '<div class="jspv" data-jspv-part="' + part + '"></div>'; }
  /* after each paint of the practice: key and paint its slots, stop any recording whose slot is gone, read whether she can record */
  function attach(host, id, lang) {
    css();
    var boxes = host.querySelectorAll('[data-jspv-part]');
    for (var i = 0; i < boxes.length; i++) { var p = +boxes[i].getAttribute('data-jspv-part'); boxes[i].setAttribute('data-jspv-key', id + ':' + p); state(id, p, lang); }
    Object.keys(ST).forEach(function (k) { var s = ST[k]; if ((s.phase === 'rec' || s.phase === 'ask') && !el(s)) drop(s); });
    for (var j = 0; j < boxes.length; j++) paint(ST[boxes[j].getAttribute('data-jspv-key')]);
    if (!host.__jspvOn) {
      host.__jspvOn = true;
      host.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-jspv]') : null, box = t && t.closest('[data-jspv-key]');
        if (box && ST[box.getAttribute('data-jspv-key')]) act(ST[box.getAttribute('data-jspv-key')], t.getAttribute('data-jspv'));
      });
    }
    if (boxes.length && !INFO[id]) {
      INFO[id] = { v: null };
      req('GET', base(id)).then(function (r) {
        if (r.status === 200 && r.body && r.body.voice) INFO[id].v = r.body.voice;                /* else the slots stay empty: the practice is as before */
        Object.keys(ST).forEach(function (k) { if (ST[k].id === id) paint(ST[k]); });
      });
    }
  }

  W.JG_SPEAKING_VOICE = { slot: slot, attach: attach, words: words, clock: clock, typeOf: typeOf, marked: marked, limits: { min: MIN, max: MAX } };
})();
