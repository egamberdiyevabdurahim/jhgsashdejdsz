/* Jamals Global runtime: the AI privacy notice (owner 5 Oct 2026, 17:22: "ha" to Jamol answering with a real AI, Claude, in production).
 * Not design code. The one source of the notice's words (en, uz, ru) and its version: /signin's Create account tab links it ("How Jamals
 * Global uses AI", web/auth/signin.html) and, only while the AI path is live, Ask Jamol shows a line under its input that opens it.
 * The AI path is live when ANTHROPIC_API_KEY is set and ai_settings.notice_version is set (P4a spec §9, §12 Q19; src/server/ai-notice.ts):
 * the server then puts the version in JG_BOOT.aiNotice and loads this file on the student pages (src/server/pages.ts). Production switches
 * it on with `npx tsx scripts/ai-switch.ts --notice <the version below>`, which warns when the two differ.
 * The words are adapted from the vault draft "JG apps — AI privacy notice draft (3 Oct 2026)" with what Ask Jamol sends added. Everything
 * that goes through /api/v1/ai/sample is named: Ask Jamol (M:009:245), @Jamol in a chat (M:023:2027), the journal's essay seeds on a tap
 * (M:023:2529) and the Community caption check (M:023:2187). The diagnostic (AI layer) bullets stay as drafted although the layer stays off;
 * the draft's "ask us to delete your data" line is left out (kept "only if there is a process for it": there is none yet).
 * uz with U+02BB (oʻ, gʻ) and U+02BC (sunʼiy); uz and ru are the controller's drafts, for the owner's review.
 * The sheet is drawn in the design's own style (JIA Jade, Raleway, the design's sheet radius, scrim and shadow): a bottom sheet on the phone,
 * a centred card from 768 px, the design's dark theme (html.dark) and calm motion (html.calm, reduced motion) followed. */
(function (W) {
  'use strict';
  var D = typeof document !== 'undefined' ? document : W.document;
  /* m1 lane "jamol" (20 Oct 2026): version 2026-10-20 names everything live or about to be: the hint after a wrong answer and the IELTS
   * Writing feedback (both live since 14-15 Oct, missing from 2026-10-09), Speaking voice feedback and @Jamol in a chat "when they open", the
   * journal that stays on the device, Community's check "when it opens", what we keep (counts and cost, never the text) and the daily limit.
   * With AI_CONSENT (JG_BOOT.aiConsent) the sheet also states the age rule, asks for "I agree" when the version in force is not accepted
   * yet (POST /api/v1/ai/consent), and Ask Jamol's line says when a parent's OK is needed. uz and ru are the controller's drafts. */
  var NOTICE = { version: '2026-10-20' };

  var TEXT = {
    en: {
      title: 'How Jamals Global uses AI',
      lead: 'Jamals Global uses an AI service: Claude, made by Anthropic. This is what it gets, and what it never gets.',
      sections: [
        { h: 'Ask Jamol', items: [
          'What you type to Jamol, and the lesson you ask about, is sent to Claude so it can answer you. With @Jamol in a chat (when chats open), the chat\'s last few messages, with their senders\' first names, go with your question.',
          'After a wrong answer in a lesson test or homework, Jamol\'s hint sends the question without its answer, the answer you chose and that lesson\'s own text.',
          'In IELTS Writing, the paragraph you write is sent to Claude for feedback. In IELTS Speaking voice feedback (when it opens), your recording is turned into text on our own server and deleted at once; only that text goes to Claude.',
          'Your journal stays on your device: we never keep it. It goes to Claude only when you tap “Find my essay seeds”: Jamol picks essay ideas from it, and also checks whether you seem to be having a hard time, so it can suggest talking to someone.',
          'When Community opens, the text of what you post will be checked by Claude for safety before an admin approves it.',
          'We do not keep what you ask Jamol: only how many questions you asked that day and what they cost.',
          'Jamol answers a limited number of questions a day. His answers can be wrong. Check anything important with your teacher.'
        ] },
        { h: 'Your results and roadmap', items: [
          'To make your results, your roadmap and your daily tasks personal, we send some of your diagnostic answers: your answers to the diagnostic\'s choice questions, your stage and your goals. Your private answers (money, family, health, sleep) are never sent.',
          'To plan your roadmap, we also send what the app has measured and counted, never what you wrote yourself: your stage, grade and age, the routes and universities you chose, your English, math and reading levels from the checks, your test scores, your activities as a category with hours and years (not their names or descriptions), which requirements stand between you and each university, and how much time each week can hold. The AI chooses the order of the work from our own lists. It never sets a date, a score or a requirement, and it never tells you your chances.',
          'Your own written answers are sent only if you are 14 or older, or a parent has agreed.',
          'We keep what the AI wrote for 180 days, then delete it.'
        ] },
        { h: 'Always', items: [
          'Your name, phone, email and photo are never sent.',
          'The AI only explains and words things for you. Dates, deadlines, scores and university requirements always come from our own rules, never from the AI.'
        ] }
      ],
      version: 'Version {v}', close: 'Got it', closeAria: 'Close',
      agree: 'I agree', ageRule: 'What you type goes to Claude only if you are 14 or older, or a parent has agreed in the app.',
      ageNote: 'Jamol answers with AI once a parent agrees in the app. Until then he answers from your lessons.',
      note: 'Jamol uses AI (Claude by Anthropic). What you type is sent to it.', more: 'More', moreAria: 'How Jamals Global uses AI'
    },
    uz: {
      title: 'Jamals Global sunʼiy intellektdan qanday foydalanadi',
      lead: 'Jamals Global sunʼiy intellekt xizmatidan foydalanadi: bu Anthropic kompaniyasining Claude xizmati. Quyida unga nima yuborilishi va nima hech qachon yuborilmasligi yozilgan.',
      sections: [
        { h: 'Jamoldan soʻrash', items: [
          'Jamolga yozganingiz va soʻrayotgan darsingiz sizga javob berishi uchun Claudega yuboriladi. Chatda @Jamol deb yozsangiz (chatlar ochilganda), savolingiz bilan birga chatning oxirgi bir nechta xabari yozganlarning ismlari bilan birga yuboriladi.',
          'Dars testi yoki uy vazifasida xato javob bersangiz, Jamolning maslahati uchun savol (toʻgʻri javobisiz), siz tanlagan javob va oʻsha darsning oʻz matni yuboriladi.',
          'IELTS Writing boʻlimida yozgan paragrafingiz fikr-mulohaza olish uchun Claudega yuboriladi. IELTS Speaking ovozli fikr-mulohazasida (u ochilganda) yozib olingan ovozingiz bizning oʻz serverimizda matnga aylantiriladi va darhol oʻchiriladi; Claudega faqat oʻsha matn yuboriladi.',
          'Kundaligingiz faqat qurilmangizda saqlanadi: biz uni saqlamaymiz. U Claudega faqat «Find my essay seeds» tugmasini bossangiz yuboriladi: Jamol undan esse uchun gʻoyalar topadi, qiynalayotganga oʻxshasangiz, kimdir bilan gaplashishni maslahat berish uchun buni ham tekshiradi.',
          'Community boʻlimi ochilganda, joylagan postingiz matni admin tasdiqlashidan oldin xavfsizlik uchun Claude tomonidan tekshiriladi.',
          'Jamolga yozganlaringizni biz saqlamaymiz: faqat oʻsha kuni nechta savol berganingiz va ular qanchaga tushganini saqlaymiz.',
          'Jamol kuniga cheklangan miqdordagi savollarga javob beradi. Uning javoblari xato boʻlishi mumkin. Muhim narsalarni oʻqituvchingiz bilan tekshiring.'
        ] },
        { h: 'Natijalaringiz va yoʻl xaritangiz', items: [
          'Natijalaringiz, yoʻl xaritangiz va kundalik vazifalaringiz aynan siz uchun boʻlishi uchun diagnostikadagi baʼzi javoblaringizni yuboramiz: tanlovli savollarga javoblaringiz, bosqichingiz va maqsadlaringiz. Shaxsiy javoblaringiz (pul, oila, sogʻliq, uyqu) hech qachon yuborilmaydi.',
          'Yoʻl xaritangizni rejalashtirish uchun ilova oʻlchagan va sanagan maʼlumotlarni ham yuboramiz, oʻzingiz yozgan matnlarni esa hech qachon yubormaymiz: bosqichingiz, sinfingiz va yoshingiz, tanlagan yoʻnalishlaringiz va universitetlaringiz, tekshiruvlardagi ingliz tili, matematika va oʻqish darajalaringiz, test ballaringiz, mashgʻulotlaringizning toifasi, soatlari va yillari (nomi va tavsifi emas), siz bilan har bir universitet orasida qaysi talablar turgani va har bir haftaga qancha vaqt sigʻishi. Sunʼiy intellekt ishlar tartibini bizning roʻyxatlarimizdan tanlaydi. U hech qachon sana, ball yoki talabni belgilamaydi va imkoniyatingiz qanchaligini aytmaydi.',
          'Oʻzingiz yozgan javoblar faqat 14 yosh va undan katta boʻlsangiz yoki ota-onangiz rozilik bergan boʻlsa yuboriladi.',
          'Sunʼiy intellekt yozgan matnlarni 180 kun saqlaymiz, keyin oʻchiramiz.'
        ] },
        { h: 'Har doim', items: [
          'Ismingiz, telefoningiz, emailingiz va rasmingiz hech qachon yuborilmaydi.',
          'Sunʼiy intellekt faqat tushuntiradi va matnni siz uchun yozadi. Sanalar, muddatlar, ballar va universitet talablari har doim bizning qoidalarimizdan olinadi, hech qachon sunʼiy intellektdan emas.'
        ] }
      ],
      version: 'Versiya {v}', close: 'Tushunarli', closeAria: 'Yopish',
      agree: 'Roziman', ageRule: 'Yozganingiz Claudega faqat 14 yosh va undan katta boʻlsangiz yoki ota-onangiz ilovada rozilik bergan boʻlsa yuboriladi.',
      ageNote: 'Ota-onangiz ilovada rozilik bergach, Jamol sunʼiy intellekt bilan javob beradi. Hozircha u darslaringizdan javob beradi.',
      note: 'Jamol sunʼiy intellektdan foydalanadi (Claude, Anthropic). Yozganingiz unga yuboriladi.', more: 'Batafsil', moreAria: 'Jamals Global sunʼiy intellektdan qanday foydalanadi'
    },
    ru: {
      title: 'Как Jamals Global использует ИИ',
      lead: 'Jamals Global использует сервис искусственного интеллекта Claude компании Anthropic. Здесь написано, что ему отправляется и что не отправляется никогда.',
      sections: [
        { h: 'Вопросы Жамолу', items: [
          'То, что вы пишете Жамолу, и урок, о котором вы спрашиваете, отправляются в Claude, чтобы он мог вам ответить. Если вы пишете @Jamol в чате (когда чаты откроются), вместе с вопросом отправляются последние несколько сообщений чата с именами их авторов.',
          'После неверного ответа в тесте урока или в домашнем задании подсказка Жамола отправляет вопрос без правильного ответа, выбранный вами ответ и текст этого урока.',
          'В IELTS Writing написанный вами абзац отправляется в Claude, чтобы получить отзыв. В голосовом отзыве IELTS Speaking (когда он откроется) ваша запись превращается в текст на нашем собственном сервере и сразу удаляется; в Claude отправляется только этот текст.',
          'Ваш дневник хранится только на вашем устройстве: мы его не храним. Он отправляется в Claude, только если вы нажмёте «Find my essay seeds»: Жамол ищет в нём идеи для эссе, а также смотрит, не тяжело ли вам сейчас, чтобы предложить поговорить с кем-нибудь.',
          'Когда откроется Community, текст ваших постов будет проверяться Claude на безопасность, прежде чем их одобрит администратор.',
          'Мы не храним то, что вы спрашиваете у Жамола: только сколько вопросов вы задали за день и сколько они стоили.',
          'Жамол отвечает на ограниченное число вопросов в день. Его ответы могут быть неверными. Важное проверяйте у своего преподавателя.'
        ] },
        { h: 'Ваши результаты и дорожная карта', items: [
          'Чтобы результаты, дорожная карта и ежедневные задания были именно вашими, мы отправляем часть ваших ответов диагностики: ответы на вопросы с выбором вариантов, ваш этап и ваши цели. Личные ответы (деньги, семья, здоровье, сон) никогда не отправляются.',
          'Чтобы спланировать вашу дорожную карту, мы также отправляем то, что приложение измерило и посчитало, но никогда то, что вы писали сами: ваш этап, класс и возраст, выбранные направления и университеты, ваши уровни английского, математики и чтения по проверкам, ваши баллы тестов, ваши занятия в виде категории с часами и годами (без названий и описаний), какие требования стоят между вами и каждым университетом и сколько времени вмещает каждая неделя. ИИ выбирает порядок работы из наших собственных списков. Он никогда не назначает дату, балл или требование и никогда не говорит, каковы ваши шансы.',
          'Ответы, которые вы пишете сами, отправляются, только если вам 14 лет или больше или если родитель дал согласие.',
          'Тексты, написанные ИИ, мы храним 180 дней, затем удаляем.'
        ] },
        { h: 'Всегда', items: [
          'Ваше имя, телефон, email и фото никогда не отправляются.',
          'ИИ только объясняет и формулирует. Даты, сроки, баллы и требования университетов всегда берутся из наших собственных правил, а не от ИИ.'
        ] }
      ],
      version: 'Версия {v}', close: 'Понятно', closeAria: 'Закрыть',
      agree: 'Принимаю', ageRule: 'То, что вы пишете, отправляется в Claude, только если вам 14 лет или больше или если родитель дал согласие в приложении.',
      ageNote: 'Когда родитель даст согласие в приложении, Жамол будет отвечать с помощью ИИ. Пока он отвечает по вашим урокам.',
      note: 'Жамол использует ИИ (Claude от Anthropic). То, что вы пишете, отправляется ему.', more: 'Подробнее', moreAria: 'Как Jamals Global использует ИИ'
    }
  };
  Object.keys(TEXT).forEach(function (l) { TEXT[l].version = TEXT[l].version.replace('{v}', NOTICE.version); });

  /* P5g (P5 spec §4.4 "Switch state" (3)), in force since 12 Oct 2026 (owner, "2 ha" to switching the roadmap's plan step on):
   * version 2026-10-09 (was 2026-10-05) adds the second bullet of "Your results and roadmap" in en, uz and ru: the roadmap is planned by
   * the AI from what the app measured and counted. It was written on 9 Oct as the next version and shown nowhere until now; uz and ru are
   * the builder's drafts for a native reader and the owner's review. Production sets it with `npx tsx scripts/ai-switch.ts --notice 2026-10-09`. */

  var LANG_ATTR = { en: 'en', uz: 'uz-Latn', ru: 'ru' };
  function pick(lang) { return TEXT[lang] ? lang : 'en'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- the sheet ---------- */
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>';
  var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  /** The sheet's markup in one language (English for any other), every line escaped. */
  function consent() { return W.JG_BOOT && W.JG_BOOT.aiConsent ? W.JG_BOOT.aiConsent : null; }   // m1 jamol: 'ok' | 'notice' | 'age', only with AI_CONSENT
  function html(lang, o) {
    var l = pick(lang), t = TEXT[l], agree = !!(o && o.agree);
    if (consent()) t = { title: t.title, lead: t.lead, version: t.version, close: agree ? t.agree : t.close, closeAria: t.closeAria,
      sections: t.sections.map(function (s, i) { return i === 0 ? { h: s.h, items: s.items.concat([t.ageRule]) } : s; }) };
    return '<div class="jgn" id="jgn" role="dialog" aria-modal="true" aria-labelledby="jgn-t" lang="' + LANG_ATTR[l] + '">' +
      '<div class="jgn-bg" data-jgn-close></div>' +
      '<div class="jgn-card" tabindex="-1">' +
        '<div class="jgn-head"><span class="jgn-badge">' + ICON + '</span><h3 id="jgn-t">' + esc(t.title) + '</h3>' +
          '<button type="button" class="jgn-x" data-jgn-close aria-label="' + esc(t.closeAria) + '">' + X + '</button></div>' +
        '<div class="jgn-body"><p class="jgn-lead">' + esc(t.lead) + '</p>' +
          t.sections.map(function (s) { return '<section class="jgn-sec"><h4>' + esc(s.h) + '</h4><ul>' + s.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></section>'; }).join('') +
          '<p class="jgn-ver">' + esc(t.version) + '</p></div>' +
        '<div class="jgn-foot"><button type="button" class="jgn-ok" ' + (agree ? 'data-jgn-agree' : 'data-jgn-close') + '>' + esc(t.close) + '</button></div>' +
      '</div></div>';
  }

  var CSS = [
    '.jgn{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;justify-content:flex-end;font-family:"Raleway",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;font-variant-numeric:lining-nums}',
    '.jgn-bg{position:absolute;inset:0;background:rgba(11,24,16,.45);animation:jgnBg .3s ease}',
    '.jgn-card{position:relative;display:flex;flex-direction:column;max-height:88%;max-height:88dvh;padding:10px 0 calc(16px + env(safe-area-inset-bottom,0px));border-radius:26px 26px 0 0;background:#fff;color:#10271e;box-shadow:0 -12px 40px rgba(0,0,0,.18);animation:jgnUp .38s cubic-bezier(.2,.8,.2,1);outline:none}',
    '.jgn-card::before{content:"";display:block;flex:none;width:40px;height:5px;margin:0 auto 10px;border-radius:3px;background:#dce3de}',
    '.jgn-head{flex:none;display:flex;align-items:center;gap:12px;padding:0 10px 12px 20px}',
    '.jgn-badge{flex:none;width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:#e8f7ee;color:#207251}',
    '.jgn-badge svg{width:22px;height:22px;fill:currentColor}',
    '.jgn h3{flex:1;min-width:0;margin:0;font-size:17px;font-weight:700;line-height:1.3;color:#10271e;text-wrap:balance}',
    '.jgn-x{flex:none;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:none;display:grid;place-items:center;color:#4b6559;cursor:pointer;transition:background-color .2s}',
    '.jgn-x:hover{background:#eef4f1}',
    '.jgn-x svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}',
    '.jgn-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 20px 4px}',
    '.jgn-lead{margin:0 0 14px;font-size:14.5px;font-weight:500;line-height:1.5;color:#4b6559}',
    '.jgn-sec{margin:0 0 10px;padding:14px 16px;border-radius:18px;background:#f6f9f8;box-shadow:inset 0 0 0 1px #e4ece7}',
    '.jgn h4{margin:0 0 8px;font-size:14px;font-weight:700;line-height:1.3;color:#123a29}',
    '.jgn ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}',
    '.jgn li{position:relative;padding-left:16px;font-size:14px;font-weight:500;line-height:1.5;color:#10271e}',
    '.jgn li::before{content:"";position:absolute;left:2px;top:.6em;width:6px;height:6px;border-radius:50%;background:#2b9067}',
    '.jgn-ver{margin:6px 0 2px;font-size:12px;font-weight:600;color:#587066}',
    '.jgn-foot{flex:none;padding:12px 20px 0}',
    '.jgn-ok{display:block;width:100%;height:52px;padding:0 18px;border:0;border-radius:15px;background:#123a29;color:#fff;font:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:background-color .2s,transform .12s}',
    '.jgn-ok:hover{background:#19553c}.jgn-ok:active{transform:scale(.985)}',
    '.jgn :focus-visible{outline:2px solid #2b9067;outline-offset:3px}',
    '@keyframes jgnBg{from{opacity:0}}@keyframes jgnUp{from{transform:translateY(100%)}}@keyframes jgnPop{from{opacity:0;transform:scale(.94)}}',
    '@media (min-width:768px){.jgn{justify-content:center;align-items:center;padding:24px}',
    '.jgn-card{width:min(520px,100%);max-height:calc(100vh - 48px);max-height:calc(100dvh - 48px);padding:22px 0;border-radius:26px;box-shadow:0 24px 60px rgba(9,29,20,.28);animation:jgnPop .32s cubic-bezier(.3,1.4,.5,1)}',
    '.jgn-card::before{display:none}.jgn-head{padding:0 14px 14px 24px}.jgn-body{padding:0 24px 4px}.jgn-foot{padding:14px 24px 0}}',
    'html.dark .jgn-card{background:#121915;color:#e6f0eb}html.dark .jgn-card::before{background:#2a3a31}',
    'html.dark .jgn h3,html.dark .jgn li{color:#e6f0eb}html.dark .jgn-lead{color:#a8bcb2}html.dark .jgn-ver{color:#8fa69b}',
    'html.dark .jgn-sec{background:#18221d;box-shadow:inset 0 0 0 1px #26352d}html.dark .jgn h4{color:#91dab6}',
    'html.dark .jgn-badge{background:#1c2e24;color:#91dab6}html.dark .jgn-x{color:#a8bcb2}html.dark .jgn-x:hover{background:#1c2a22}',
    'html.dark .jgn li::before{background:#66c69a}html.dark .jgn-ok{background:#66c69a;color:#0b1f15}html.dark .jgn-ok:hover{background:#91dab6}',
    'html.calm .jgn-bg,html.calm .jgn-card{animation:none}',
    '@media (prefers-reduced-motion:reduce){.jgn-bg,.jgn-card{animation:none}.jgn-ok,.jgn-x{transition:none}}',
    /* Ask Jamol's line under its input: the design's composer keeps its look, only its bottom gap moves under the line */
    '.jgn-note{flex:none;margin:0;padding:2px 20px calc(12px + env(safe-area-inset-bottom,0px));font-family:inherit;font-size:11.5px;font-weight:500;line-height:1.45;color:var(--ink-3,#587066);text-align:center;text-wrap:balance}',
    '.jgn-more{display:inline;margin:-12px -6px;padding:12px 6px;border:0;background:none;font:inherit;font-weight:700;color:var(--accent,#207251);text-decoration:underline;text-underline-offset:2px;cursor:pointer}',
    '.jm-view .cm-compose.jgn-noted{margin-bottom:6px}',
    '.jm-compose.jgn-noted{padding-bottom:6px}',
    /* P15 fixes lane (18 Oct 2026; P14's open item): in Uzbek the sheet and the line draw U+02BB/U+02BC («Sunʼiy intellekt», «soʻrash»)
       with "JG Uz Marks" (public/runtime/jg-uz-marks.css: Raleway's own turned comma and apostrophe; Raleway's U+02BC is its acute), first
       in the sheet's own stack, word for word after it; English and Russian keep the stack as it was */
    '.jgn[lang="uz-Latn"],.jgn-note[lang="uz-Latn"]{font-family:"JG Uz Marks","Raleway",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'
  ].join('\n');
  var styled = false;
  function style() {
    if (styled) return; styled = true;
    var s = D.createElement('style'); s.setAttribute('data-jg', 'ai-notice'); s.textContent = CSS; D.head.appendChild(s);
  }
  /** In Uzbek, the one declaration of "JG Uz Marks" on this page (a student's Uzbek page has it already; /signin links it too). */
  var MARKS = '/runtime/jg-uz-marks.css?v=1';
  function marks(lang) {
    if (pick(lang) !== 'uz' || D.querySelector('link[data-jg-uz-marks]')) return;
    var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = MARKS; l.setAttribute('data-jg-uz-marks', ''); D.head.appendChild(l);
  }

  var open_ = null;
  function close() {
    if (!open_) return;
    var o = open_; open_ = null;
    W.removeEventListener('keydown', o.onKey, true);
    if (o.el.parentNode) o.el.parentNode.removeChild(o.el);
    D.documentElement.style.overflow = o.overflow;
    if (o.opener && o.opener.focus) { try { o.opener.focus({ preventScroll: true }); } catch (e) {} }
  }
  /** Opens the sheet in a language (the page's or the roadmap's); the opener gets the focus back on close. */
  function open(lang, opener, mode) {
    close(); style(); marks(lang);
    var agree = !!(mode && mode.agree) || consent() === 'notice';   // m1 jamol (AI_CONSENT): "I agree" while the version in force is not accepted
    D.body.insertAdjacentHTML('beforeend', html(lang, { agree: agree }));
    var el = D.getElementById('jgn'), card = el.querySelector('.jgn-card');
    var o = { el: el, opener: opener || D.activeElement, overflow: D.documentElement.style.overflow };
    o.onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); return; }   // before the design's own Escape (capture) closes Ask Jamol
      if (e.key !== 'Tab') return;
      var f = Array.prototype.slice.call(el.querySelectorAll('button')), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (D.activeElement === first || D.activeElement === card)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('click', function (e) {
      if (e.target.closest('[data-jgn-close]')) { close(); return; }
      var ok = e.target.closest('[data-jgn-agree]');
      if (ok && !ok.disabled) { ok.disabled = true; agreeNow().then(function (done) { if (done) { close(); paint(); } else ok.disabled = false; }); }
    });
    W.addEventListener('keydown', o.onKey, true);
    D.documentElement.style.overflow = 'hidden';
    open_ = o;
    try { card.focus({ preventScroll: true }); } catch (e) { card.focus(); }
    return el;
  }

  /* ---------- Ask Jamol: one line under the input, only while the AI path is live ---------- */
  /** The roadmap's language, through Jamol's own resolver (jg-jamol.js, live students); English without one (the demo). */
  function lang() {
    var J = W.JG_JAMOL, l = J && typeof J.lang === 'function' ? J.lang() : 'en';
    return TEXT[l] ? l : 'en';
  }
  var note = null;
  function paint() {
    if (!note) return;
    var l = lang(), t = TEXT[l];
    marks(l);
    note.setAttribute('lang', LANG_ATTR[l]);
    note.textContent = (consent() === 'age' ? t.ageNote : t.note) + ' ';   // m1 jamol (AI_CONSENT): under 14 without a parent's OK, she is told why
    var more = D.createElement('button');
    more.type = 'button'; more.className = 'jgn-more'; more.textContent = t.more;
    more.setAttribute('aria-label', t.more + ': ' + t.moreAria); more.setAttribute('aria-haspopup', 'dialog');
    more.addEventListener('click', function () { open(lang(), more); });
    note.appendChild(more);
  }
  function mountJamol() {
    if (note) return note;
    if (!(W.JG_BOOT && W.JG_BOOT.aiNotice)) return null;
    var input = D.getElementById('jm-in'), box = input && input.closest('.cm-compose, .jm-compose');
    if (!box) return null;
    style();
    note = D.createElement('p'); note.className = 'jgn-note';
    box.classList.add('jgn-noted');
    box.insertAdjacentElement('afterend', note);
    paint();
    var view = D.getElementById('jm-view');                                   // the roadmap's language can change (the diagnostic's first question): repaint on open
    if (view && typeof MutationObserver === 'function') new MutationObserver(function () { if (!view.hasAttribute('hidden')) paint(); }).observe(view, { attributes: true, attributeFilter: ['hidden'] });
    return note;
  }

  /* m1 jamol (AI_CONSENT): her "I agree" for the version in force, recorded on the server; then Jamol answers with the AI */
  function agreeNow() {
    var B = W.JG_BOOT || {};
    if (typeof W.fetch !== 'function') return Promise.resolve(false);
    return W.fetch('/api/v1/ai/consent', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid || '' }, body: JSON.stringify({ version: B.aiNotice || NOTICE.version }) })
      .then(function (r) { if (r.ok) { B.aiConsent = 'ok'; return true; } return false; }, function () { return false; });
  }
  /* A question refused for the notice (428; jg-runtime.js sample() says so with "jg:ai-notice") opens the notice with its "I agree"; the
   * design's Ask Jamol answers that one question from her lessons */
  if (D && D.addEventListener) D.addEventListener('jg:ai-notice', function () { if (consent() && !open_) open(lang(), null, { agree: true }); });

  W.JG_AI_NOTICE = { version: NOTICE.version, text: TEXT, html: html, open: open, close: close, lang: lang, mountJamol: mountJamol, agree: agreeNow };
  mountJamol();
})(window);
