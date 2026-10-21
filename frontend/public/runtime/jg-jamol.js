/* Jamals Global runtime: Ask Jamol in Uzbek, Russian and English (owner 4 Oct 2026, P4g J: "Jamolimiz russian bn englishni ham chunsin").
 * Not design code. The design's Ask Jamol (student-mobile 009.js, student-desktop 013.js) asks the AI first ("sample", /api/v1/ai/sample)
 * and, without one (production has no key), matched the question's English words against the lessons, so "qalesan" got "I couldn't find
 * that in our lessons yet" (his screenshot 4). For a live student the design's localAnswer calls JG_JAMOL.answer instead: it tells the
 * language and the script (Uzbek in Latin, slang included, or Cyrillic; Russian in Cyrillic or Latin letters; English) and answers in it:
 * greetings and small talk, thanks, what Jamol can do, goodbye, the lesson a question is about (a uz/ru/en keyword lexicon in Latin and
 * Cyrillic over the design's own lessons, then, for English, the design's own word match without its stop words), the next lesson, or,
 * when nothing matches, real topics to ask about. Lesson facts are the design's own (subject, title, minutes, "about"); the uz and ru
 * "about" lines translate the design's English ones and the uz/ru copy is the controller's draft (no native review yet, BRIEF-P4g).
 * Uzbek in Cyrillic is the Latin copy transliterated. With an AI, tagLast tells the model the same language. Live students only (pages.ts).
 * P4g review: English section names ("reading", "Writing Task 2") never decide the language, the sentence around them does; "what should I
 * learn next" is understood in all three; lesson titles in a list are quoted; the uz/ru names (Psixologiya, Жамол) are the parent design's.
 * P4g review 2: SAT and AP take Uzbek endings (SATga, APdan, SATни), and an English or test word with one (writingga) is Uzbek; "help" in a
 * sentence leaves its language to the sentence; Uzbek in Cyrillic without ў қ ғ ҳ is Uzbek; Russian never declines a course name; a message
 * in no language falls back to the roadmap's language, else the AI layer's (the snapshot has no `lang` of its own).
 * P6 lane B4 (SPEC-lessons §4.6, §11.3; the owner's 12 Oct 2026 "lessons va lesson h/w qism"): "Ask Jamol about this lesson" on a REAL
 * lesson (the lessons part on: public/runtime/jg-lessons.js or jg-lessons-desktop.js holds it open) asks about that lesson. greet(), which
 * the design calls as the chat opens from the lesson screen, binds the chat to the lesson the reader holds open (its state().open, not the
 * design's title); tagLast() then marks the turns with its id and the page's language, and jg-runtime.js's sample() sends them as
 * `lesson_id` and `lang`: the server answers from that lesson's own pieces, never an item (src/server/lessons/jamol.ts), within the lesson
 * cap. Without an answer (the cap, no AI) a bound chat says so in her language and sends her back to the lesson, never to a sample lesson.
 * Opened from anywhere else, or with the lessons part off, nothing changes.
 */
(function (W) {
  'use strict';
  if (!W.JG_ENGINE) return;

  /* ---------- text ---------- */
  var APOS = /[‘’ʻʼʹʿ`´]/g;
  function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(APOS, "'").replace(/ё/g, 'е'); }
  function toks(s) {
    var m = norm(s).match(/[\p{L}\p{N}']+/gu) || [], out = [];
    for (var i = 0; i < m.length; i++) { var t = m[i].replace(/^'+|'+$/g, ''); if (t) out.push(t); }
    return out;
  }
  /** The Uzbek case and possessive endings a short name takes, written on (SATga, SATni, APdan, SATning, SATimni, APchi; SATни, САТга), an apostrophe allowed before them;
   *  a bare "-ing" only before a case ending (SATingni), so the English "aping" is not AP. */
  var UZ_TAIL = /^'?(?:(?:lar)?(?:imiz|ingiz|im|ing(?=gacha|dagi|ning|dan|chi|ga|ni|da))?(?:gacha|dagi|ning|dan|chi|ga|ni|da)?|(?:лар)?(?:имиз|ингиз|им|инг(?=гача|даги|нинг|дан|чи|га|ни|да))?(?:гача|даги|нинг|дан|чи|га|ни|да)?)$/;
  /** A stem matches a token: from its start when it has 4 letters or more, whole otherwise; "x=" is always whole; "x~" is whole or takes an Uzbek ending. */
  function hit(tok, stem) {
    var e = stem.charAt(stem.length - 1), b = stem.slice(0, -1);
    if (e === '=') return tok === b;
    if (e === '~') return tok === b || (tok.indexOf(b) === 0 && UZ_TAIL.test(tok.slice(b.length)));
    return stem.length >= 4 ? tok.indexOf(stem) === 0 : tok === stem;
  }
  /** A phrase ("main idea", "task 2") matches its words in order, next to each other. */
  function has(tk, phrase) {
    var w = phrase.split(' ');
    for (var i = 0; i + w.length <= tk.length; i++) {
      var ok = true;
      for (var j = 0; j < w.length && ok; j++) ok = hit(tk[i + j], w[j]);
      if (ok) return true;
    }
    return false;
  }
  /** Exact phrases (intents): whole words only. */
  function says(tk, phrase) { return has(tk, phrase.split(' ').map(function (w) { return w + '='; }).join(' ')); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- what the student means (intents), each phrase in the language it belongs to ---------- */
  var INTENTS = {
    caps: {
      en: ['what can you do', 'what can u do', 'what do you do', 'who are you', 'what are you', 'how can you help', 'help me', 'help'],
      uz: ['nima qila olasan', 'nima qila olasiz', 'nima qilolasan', 'nima qilolasiz', 'nimalar qila olasan', 'nimalar qila olasiz', 'nima qilasan', 'nima qilasiz',
        'nma qila olasan', 'nma qilasan', 'kimsan', 'kimsiz', 'sen kimsan', 'siz kimsiz', 'nima bilasan', 'nima bilasiz', 'yordam ber', 'yordam bering', 'yordam',
        'нима қила оласан', 'нима қила оласиз', 'нима қилоласан', 'нима қиласан', 'нима қиласиз', 'нима кила оласан', 'кимсан', 'кимсиз', 'нима биласан', 'ёрдам'],
      ru: ['что ты умеешь', 'что умеешь', 'что вы умеете', 'что ты можешь', 'что можешь', 'кто ты', 'ты кто', 'кто вы', 'чем поможешь', 'чем можешь помочь', 'помоги', 'помогите',
        'chto ty umeesh', 'cho umeesh', 'chto umeesh', 'kto ty', 'ty kto', 'pomogi']
    },
    how: {
      en: ['how are you', 'how are u', 'how r u', "how's it going", 'hows it going', 'how is it going', "what's up", 'whats up', 'wassup', 'sup', 'how you doing', 'how do you do'],
      uz: ['qalesan', 'qalesiz', 'qalaysan', 'qalaysiz', 'qalesizmi', 'qalaysizmi', 'qale', 'qalay', 'ishlar qalay', 'nima gap', 'nima gaplar', 'nma gap', 'nma gaplar',
        'yaxshimisan', 'yaxshimisiz', 'yaxshimisizmi', 'tinchmi', 'tinchlikmi',
        'қалесан', 'қалесиз', 'қалайсан', 'қалайсиз', 'калесан', 'калесиз', 'калайсан', 'калайсиз', 'қале', 'қалай', 'ишлар қалай', 'нима гап', 'яхшимисан', 'яхшимисиз', 'тинчми'],
      ru: ['как дела', 'как ты', 'как вы', 'как жизнь', 'как поживаешь', 'как поживаете', 'что нового', 'как сам', 'kak dela', 'kak ty', 'kak zhizn', 'kak jizn', 'kak sam']
    },
    bye: {
      en: ['bye', 'goodbye', 'bye bye', 'see you', 'see ya', 'cya'],
      uz: ['xayr', 'hayr', "ko'rishguncha", 'korishguncha', "salomat bo'ling", "sog' bo'ling", 'хайр', 'кўришгунча'],
      ru: ['пока', 'до свидания', 'до встречи', 'poka', 'do svidaniya']
    },
    thanks: {
      en: ['thanks', 'thank you', 'thank u', 'thx', 'tnx', 'thanks a lot'],
      uz: ['rahmat', 'raxmat', 'rahmad', 'raxmad', 'rakhmat', 'tashakkur', 'рахмат', 'раҳмат', 'ташаккур'],
      ru: ['спасибо', 'спасибки', 'спс', 'благодарю', 'spasibo', 'spasiba', 'spasib', 'sps']
    },
    greet: {
      en: ['hi', 'hello', 'hey', 'hiya', 'heya', 'good morning', 'good afternoon', 'good evening'],
      uz: ['salom', 'salem', 'slm', 'salam', 'assalomu', 'assalom', 'asalomu', 'alaykum', 'aleykum', 'xayrli tong', 'xayrli kun', 'xayrli kech',
        'салом', 'ассалому', 'ассалом', 'алайкум', 'хайрли тонг', 'хайрли кун'],
      ru: ['привет', 'приветик', 'прив', 'здравствуй', 'здравствуйте', 'здрасте', 'здрасьте', 'добрый день', 'доброе утро', 'добрый вечер', 'салам',
        'privet', 'privetik', 'zdravstvuy', 'zdravstvuyte', 'zdrasti']
    },
    next: {
      en: ['next', 'what should i learn'],
      uz: ['keyingi', 'keyingisi', "nimani o'rganay", "nimani o'rganaman", "nimani o'rganishim kerak", "nima o'rganay", "nima o'rganaman", "nima o'rganishim kerak",
        "nimani o'qiy", "nimani o'qiyman", "nima o'qiy", "nima o'qiyman", "nimani o'qishim kerak", "nima o'qishim kerak", 'nimani organay', 'nimani organishim kerak', 'nima oqiyman',
        'кейинги', 'кейингиси', 'нимани ўрганай', 'нимани ўрганаман', 'нимани ўрганишим керак', 'нима ўрганай', 'нима ўқийман', 'нимани ўқийман', 'нима ўқишим керак'],
      ru: ['следующий', 'следующая', 'следующее', 'дальше', 'что учить', 'что мне учить', 'что изучать', 'что дальше', 'sleduyushiy', 'sleduyushchiy', 'dalshe',
        'chto uchit', 'cho uchit', 'chto izuchat']
    }
  };
  /* ---------- the words that tell the languages apart (whole words) ---------- */
  var WORDS = {
    en: ('the is are am was were be been what whats how why when where who which do does did can could would should will you your i im me my it its this that these to of in on for with ' +
      'and or not a an please explain help solve give tell about learn study question practice lesson lessons good simply simple plan know need want more there have has get').split(' ').concat(["what's", "i'm", "it's", "don't"]),
    uz: ('men sen siz bu shu va ham uchun bilan kerak haqida nima nma nimaga nega qanday qanaqa qandoq qayer qayerda qachon kim qila qilish qilaman qilasan qilasiz olasan olasiz olaman ' +
      'beraman bering ber aytib ayting ayt gapir gapirib tushuntir tushuntiring tushuntirib tushunmadim dars darslar darsni darsi mavzu mavzuni savol javob misol menga senga sizga ' +
      'mening sening sizning bormi yoq ha xop zor yaxshi juda endi keyin keyingi qaysi nimani qilib boladi emas ekan edi aka opa shuni buni ' +
      'ni ga dan ning esa qiyin oson bor nimalar').split(' ').concat(["yo'q", "xo'p", "zo'r", "bo'ladi", "bo'lsa", "o'zi"]),   // ni/ga/dan/ning: the case endings students write apart after an English name ("reading ni")
    ruL: ('privet kak dela spasibo spasiba chto shto cho umeesh mozhesh mojesh pomogi pomoch pomosh urok uroki uroka obyasni objasni rasskazhi rasskaji pochemu poka horosho khorosho ' +
      'normalno ty tebya menya mne ya eto kto gde kogda pozhaluysta pojaluysta reshit reshat zadacha zadachu kakoy kakie mozhno nado nuzhno davay ne ponimayu ponimaju ponyal dlya uchit').split(' '),
    uzC: ('салом ассалому алайкум рахмат раҳмат нима нега қандай кандай қанақа қалай калай ким мен сен сиз бу шу ва ҳам учун билан керак ҳақида хакида дарс дарслар мавзу ' +
      'тушунтир тушунтиринг тушунтириб ёрдам беринг менга сизга яхши жуда бўлади эмас қила кила оласан оласиз ака опа ' +
      // P4g review 2: Uzbek typed on a Russian keyboard, without ў қ ғ ҳ, and the endings written apart ("ИЕЛТС га"); not "да"/"ни"/"дан" (Russian words)
      'га нинг даги гача тайёр кайси качон йук хоп зур булади хам экан эди нимани нималар бор борми кейин кейинги энди шуни буни савол жавоб мисол айтинг айтиб ' +
      'тушунмадим менинг сизнинг').split(' '),
    ruC: ('привет как дела спасибо что ты вы умеешь можешь помоги урок уроки объясни расскажи почему пока хорошо нормально тебя меня мне я это кто где когда пожалуйста ' +
      'решить решать задача какой какие можно надо нужно давай не и в на с по про такое такой есть мой моя у о об').split(' ')
  };

  /* ---------- lessons: the design's own, found by these words (k: the lesson's own, g: near it) ---------- */
  var SUBJ = {
    sat: ['sat~', 'сат~'], ap: ['ap~', 'ап~', 'advanced placement'], ielts: ['ielts', 'айелтс', 'иелтс', 'айлтс', 'aylts'],
    psy: ['psychology', 'psixolog', 'psiholog', 'psikholog', 'психолог']
  };
  var EQ = ['equation', 'tenglama', 'тенглама', 'уравнен', 'uravnen', 'math', 'matematika', 'математик', 'algebra', 'алгебр', 'solve', 'yech', 'ечи', 'реши', 'реша', 'reshi', 'resha'];
  var CALC = ['calculus', 'matematik analiz', 'математический анализ', 'матанализ', 'matanaliz'];
  var TOPICS = [
    { s: 'sat', t: 'Linear equations', g: EQ,
      k: ['linear', 'lineyn', 'chiziqli', 'чизиқли', 'чизикли', 'линейн', 'one variable', "bir noma'lum", 'bir nomalum', 'одной переменн', 'одним неизвестн'] },
    { s: 'sat', t: 'Systems of equations', g: EQ,
      k: ['system', 'sistema', 'tizim', 'систем', 'тизим', 'substitution', 'elimination', "o'rniga qo'y", 'orniga qoy', 'подстановк', 'podstanovk', 'two equations', 'ikki tenglama',
        'два уравнения', 'two variables', "ikki noma'lum", 'ikki nomalum', 'две переменн'] },
    { s: 'sat', t: 'Main idea and purpose', g: ['passage', 'matn=', 'текст='],
      k: ['main idea', 'central idea', "asosiy g'oya", 'asosiy goya', 'asosiy fikr', 'асосий ғоя', 'асосий фикр', 'главная мысль', 'главную мысль', 'основная мысль', 'основная идея',
        'основную идею', 'glavnaya mysl', 'author', 'purpose', 'muallif', 'муаллиф', 'цель автора', 'sat~ reading', 'reading and writing'] },
    { s: 'sat', t: 'Punctuation: commas', g: ['grammar', 'grammatika', 'грамматик', 'sat~ writing'],
      k: ['comma', 'punctuation', 'vergul', 'вергул', 'запят', 'zapyat', 'пунктуац', 'punktuats', 'tinish belgi', 'тиниш белги', 'знаки препинания'] },
    { s: 'sat', t: 'Word problems', g: ['problem', 'masala', 'масала', 'задач', 'zadach'],
      k: ['word problem', 'matnli masala', 'матнли масала', 'текстовая задача', 'текстовые задачи', 'текстовых задач', 'tekstovye zadachi', 'story problem'] },
    { s: 'ap', t: 'Limits and continuity', g: CALC.concat(['function', 'funksiya', 'функци', 'graph', 'grafik', 'график']),
      k: ['limit', 'лимит', 'предел', 'predel', 'continuity', 'continuous', 'uzluksiz', 'узлуксиз', 'непрерывн', 'nepreryvn'] },
    { s: 'ap', t: 'Derivatives', g: CALC.concat(['slope', 'tangent', 'urinma', 'уринма', 'касательн', 'free response']),
      k: ['derivative', 'differentiat', 'hosila', 'ҳосила', 'хосила', 'производн', 'proizvodn', 'differensial', 'дифференц'] },
    { s: 'ap', t: 'Kinematics', g: ['motion', 'harakat', 'ҳаракат', 'харакат', 'движен', 'dvizhen', 'physics', 'fizika', 'физик', 'speed'],
      k: ['kinemati', 'кинемати', 'velocity', 'tezlik', 'тезлик', 'скорост', 'skorost', 'acceleration', 'tezlanish', 'тезланиш', 'ускорен', 'uskoren', 'displacement', 'перемещен'] },
    { s: 'ap', t: 'Stoichiometry', g: ['chemistry', 'kimyo', 'кимё', 'хими', 'himiya', 'ximiya', 'reaction', 'reaksiya', 'реакци'],
      k: ['stoichiometr', 'stexiometr', 'stoxiometr', 'stexometr', 'stehiometr', 'стехиометр', 'mole', 'mol=', 'моль', 'molar', 'reagent', 'реагент'] },
    { s: 'ielts', t: 'Writing Task 2: structure', g: ['ielts writing', 'yozish', 'ёзиш', 'письм', 'structure', 'tuzilish', 'структур'],
      k: ['writing', 'task 2', 'essay', 'esse=', 'essesi', 'insho', 'иншо', 'эссе', 'сочинени', 'sochineni', 'paragraph', 'xatboshi', 'абзац'] },
    { s: 'ielts', t: 'Speaking Part 2: cue cards', g: ['speak', 'nutq', 'нутқ', 'речь', 'monolog', 'монолог'],
      k: ['speaking', 'cue card', 'cue=', 'spiking', 'спикинг', 'gapirish', 'гапириш', "so'zlashuv", 'sozlashuv', 'сўзлашув', 'говорени', 'govoren', 'part 2', 'разговорн'] },
    { s: 'ielts', t: 'Listening: maps', g: ['listen', 'eshit', 'эшит', 'слуша', 'slusha', 'directions'],
      k: ['listening', 'lisening', 'лисенинг', 'tinglash', 'тинглаш', 'аудирован', 'audirovan', 'map=', 'maps=', 'xarita', 'харита', 'карта=', 'карте=', 'карту=', 'карты=', 'karta='] },
    { s: 'ielts', t: 'Reading: True, False, Not Given', g: ['ielts reading', 'чтение', 'chtenie'],
      k: ['true false', 'not given', 'tfng', 'reading', 'ридинг', "o'qib tushun", 'oqib tushun', 'чтени', 'chteni'] },
    { s: 'psy', t: 'What is psychology?', g: [],
      k: ['what is psychology', 'psixologiya nima', 'psixologiya bu', 'психология нима', 'что такое психолог', 'chto takoe psiholog', 'psychologist', 'psixolog=', 'психолог='] },
    { s: 'psy', t: 'Memory and forgetting', g: ['repetition', 'takrorla', 'такрорла', 'повторени', 'sleep', 'uyqu', 'уйқу', 'сон='],
      k: ['memory', 'memoriz', 'memoris', 'remember', 'forget', 'xotira', 'хотира', 'eslab qol', 'эслаб қол', 'esda saqla', 'unut', 'унут', 'yodla', 'ёдла', 'yod ol', 'ёд ол',
        'памят', 'pamyat', 'запомин', 'запомн', 'zapomin', 'zapomn', 'забыва', 'забыть', 'забуд', 'zabyv', 'spaced repetition'] },
    { s: 'psy', t: 'Cognitive biases', g: ['decision', 'qaror', 'қарор', 'thinking', 'fikrlash', 'фикрлаш', 'мышлени'],
      k: ['bias', 'cognitive', 'kognitiv', 'когнитив', 'искажени', 'iskazhen', 'iskajen', 'confirmation', 'tarafkash', 'тарафкаш', 'shortcut', 'evristik', 'эвристик', 'heuristic'] }
  ];
  /** The language a lexicon word belongs to, where it says (Cyrillic Uzbek letters, Uzbek-only spellings, English words, Russian stems). */
  function stemLang(stem) {
    if (/[ўқғҳ]/.test(stem) || /^(тенглама|чизи|тизим|асосий|муаллиф|вергул|тиниш|матнли|масала|узлуксиз|хосила|тезлик|тезланиш|харакат|кимё|иншо|ёзиш|гапириш|тинглаш|харита|хотира|эслаб|унут|ёдла|ёд|такрорла|тарафкаш|фикрлаш|уринма|эшит|ечи)/.test(stem)) return 'uz';
    if (/^(уравнен|линейн|одной|одним|подстановк|два|две|главн|основн|цель|запят|пунктуац|знаки|текстов|задач|предел|непрерывн|математический|матанализ|касательн|производн|дифференц|движен|скорост|ускорен|перемещен|хими|реакци|письм|структур|сочинени|абзац|речь|говорени|разговорн|слуша|аудирован|карт|чтени|что|повторени|сон|памят|запомин|запомн|забыва|забыть|забуд|искажени|мышлени|реши|реша)/.test(stem)) return 'ru';
    if (/[а-я]/.test(stem)) return null;                                      // shared Cyrillic (система, эссе, моль): the function words decide
    if (/'|^(tenglama|chiziqli|sistema|tizim|asosiy|muallif|vergul|tinish|matnli|masala|uzluksiz|hosila|tezlik|tezlanish|harakat|kimyo|insho|yozish|gapirish|sozlashuv|tinglash|xarita|xotira|eslab|esda|unut|yodla|yod|takrorla|uyqu|tarafkash|fikrlash|qaror|psixolog|matematika|matematik|funksiya|grafik|fizika|ikki|bir|stexiometr|stoxiometr|differensial|reaksiya|kognitiv|evristik|urinma|yech|nutq|eshit|xatboshi|tuzilish|essesi|oqib)/.test(stem)) return 'uz';
    if (/^(uravnen|lineyn|podstanovk|glavnaya|zapyat|punktuats|zadach|tekstovye|predel|nepreryvn|proizvodn|dvizhen|skorost|uskoren|himiya|sochineni|govoren|audirovan|karta|chteni|chtenie|pamyat|zapomin|zapomn|zabyv|iskazhen|iskajen|chto|matanaliz|resha|reshi|slusha|spiking|lisening|aylts|stehiometr|ximiya)/.test(stem)) return 'ru';
    return 'en';
  }

  /* ---------- the language and the script ---------- */
  /** Uzbek verb and case endings no English or Russian word of 6 letters or more has (tushunmayapman, tuziladi, yozaman, oʻrganishim). */
  var UZ_END = /(?:yap(?:man|san|siz|ti|miz)|moqchi(?:man|san|miz|siz)|madim|madingiz|mayman|maydi|ladi|lamoq|aman|asan|asiz|ishim|ingizni|dingiz|ganman)$/;
  /** The same in Cyrillic, with or without қ (тайёрланяпман, тушунмадим, тайёрмисиз): Uzbek on a Russian keyboard is still Uzbek. */
  var UZ_END_C = /(?:яп(?:ман|сан|сиз|ти|миз)|мо[қк]чи(?:ман|сан|миз|сиз)|мадим|мадингиз|майман|майди|лади|ламо[қк]|аман|асан|асиз|ишим|ингизни|дингиз|ганман|мисиз|мисан)$/;
  /** An English or test word with an Uzbek ending written on (SATga, APdan, ieltsdan, writingga, readingni, SATни) is Uzbek. */
  var TESTS = ['sat', 'ap', 'act', 'ielts', 'toefl', 'gmat', 'gre', 'dtm', 'duolingo', 'сат', 'ап', 'иелтс', 'айелтс', 'айлтс'];
  var ENDS = ['gacha', 'dagi', 'ning', 'dan', 'chi', 'ga', 'ni', 'da', 'imiz', 'ingiz', 'imni', 'imga', 'imda', 'imdan', 'im', 'гача', 'даги', 'нинг', 'дан', 'чи', 'га', 'ни', 'да'];
  var EN_STEMS = [];
  TOPICS.forEach(function (tp) { tp.k.concat(tp.g).forEach(function (s) { if (s.indexOf(' ') < 0 && stemLang(s) === 'en') EN_STEMS.push(s); }); });
  EN_STEMS.push('psychology');
  function uzOnEnglish(t) {
    for (var i = 0; i < ENDS.length; i++) {
      var e = ENDS[i]; if (t.length <= e.length || t.slice(-e.length) !== e) continue;
      var b = t.slice(0, -e.length).replace(/'$/, '');
      if (TESTS.indexOf(b) >= 0 || EN_STEMS.some(function (s) { return hit(b, s); })) return true;
    }
    return false;
  }
  /** English intents students drop into Uzbek and Russian sentences ("menga help kerak"): still understood, but the sentence decides the language. */
  var NOVOTE = ['help'];
  function detect(q) {
    var tk = toks(q), raw = String(q == null ? '' : q);
    var cy = (raw.match(/[Ѐ-ӿ]/g) || []).length, la = (raw.match(/[A-Za-z]/g) || []).length;
    var script = cy > la ? 'cyrl' : 'latn', sc = { en: 0, uz: 0, ru: 0 }, first = null;
    function add(l, n) { if (!first) first = l; sc[l] += n; }
    for (var name in INTENTS) for (var l in INTENTS[name]) INTENTS[name][l].forEach(function (p) {
      var cyr = /[Ѐ-ӿ]/.test(p);
      if ((script === 'cyrl') === cyr && NOVOTE.indexOf(p) < 0 && says(tk, norm(p))) add(l, 3);
    });
    tk.forEach(function (t) {
      if (script === 'cyrl') {
        if (/[ўқғҳ]/.test(t)) add('uz', 2);
        if (/[ыщ]/.test(t)) add('ru', 1);
        if (WORDS.uzC.indexOf(t) >= 0) add('uz', 2);
        if (WORDS.ruC.indexOf(t) >= 0) add('ru', 2);
        if (t.length >= 6 && UZ_END_C.test(t)) add('uz', 2);
      } else {
        if (/[og]'/.test(t)) add('uz', 2);
        if (WORDS.uz.indexOf(t) >= 0) add('uz', 2);
        if (t.length >= 6 && UZ_END.test(t)) add('uz', 2);
        if (WORDS.en.indexOf(t) >= 0) add('en', 2);
        if (WORDS.ruL.indexOf(t) >= 0) add('ru', 2);
      }
      if (uzOnEnglish(t)) add('uz', 2);
    });
    // a topic word votes for its language, except an English one: students name IELTS and SAT sections in English whatever they write in
    // ("reading ni tushunmayapman", "IELTS Writing Task 2 rejasi qanday tuziladi?"), so only the sentence around it tells English apart
    TOPICS.forEach(function (tp) { tp.k.concat(tp.g).forEach(function (s) { var l = stemLang(s); if (l && l !== 'en' && has(tk, norm(s))) add(l, 1); }); });
    var best = null, top = 0;
    ['uz', 'ru', 'en'].forEach(function (l) { if (sc[l] > top || (sc[l] === top && top > 0 && l === first)) { top = sc[l]; best = l; } });
    if (script === 'cyrl' && cy) best = sc.uz > sc.ru ? 'uz' : 'ru';           // Cyrillic is Uzbek or Russian, Russian unless Uzbek shows
    return { lang: best, script: script };
  }
  /** The roadmap's language: the page's own resolver (RT's rmL, M:023:239; P4g fix K2 review: one resolver, so Jamol and the roadmap never disagree),
   *  else unis_uz (after a result), else the AI layer's (the roadmap's when it is on, English when off). */
  function fallbackLang() {
    var c = W.JG_ENGINE && W.JG_ENGINE.cache, l = typeof W.JG_RMLANG === 'function' ? W.JG_RMLANG() : c && ((c.unis_uz && c.unis_uz.lang) || (c.ai && c.ai.lang));
    return l === 'uz' || l === 'ru' ? l : 'en';
  }

  /* ---------- copy (uz with U+02BB oʻ gʻ and U+02BC; [[…]] is kept as written in Cyrillic) ---------- */
  var COPY = {
    en: {
      hi: 'Hi {name}!', greet: 'Hi {name}! What shall we study today? Ask me about a lesson, for example "{ex1}" or "{ex2}".',
      how: "I'm great, thanks for asking! Ready to study? Ask me about a lesson, for example \"{ex1}\".",
      thanks: "You're welcome! Ask me anything else about your lessons.", bye: 'Bye, {name}! Come back any time.',
      caps: "I'm Jamol, your study coach. Ask me about a topic and I'll find the lesson that covers it and tell you what's in it: {subjects}, {n} lessons in all. You can write in English, Uzbek or Russian.",
      lesson: 'Here\'s what <b>{subject}</b>, lesson {i} "<b>{title}</b>" says: {about}', watch: '▶ Watch "{title}" ({m} min)',
      subject: '<b>{subject}</b> has {n} lessons: {titles}. Which one shall we look at?',
      none: "I couldn't find that in our lessons yet. Here are some of the topics we have: {topics}. Ask about one of them, for example \"{ex1}\", or pick one of the ideas below.",
      bound: "I can't answer right now. Read the lesson again, or ask me a bit later.",
      boundCap: "That's all your questions for today. Ask me again tomorrow. For now, read the lesson again.",
      and: ' and '
    },
    uz: {
      hi: 'Salom, {name}!', greet: 'Assalomu alaykum, {name}! Bugun nimani oʻrganamiz? Biror dars haqida soʻrang, masalan: “{ex1}” yoki “{ex2}”.',
      how: 'Yaxshi, rahmat! Oʻqishga tayyormisiz? Biror dars haqida soʻrang, masalan: “{ex1}”.',
      thanks: 'Arzimaydi! Darslar boʻyicha yana savolingiz boʻlsa, bemalol soʻrang.', bye: 'Xayr, {name}! Istalgan vaqtda qayting.',
      caps: 'Men Jamolman, oʻqishda yordamchingiz. Mavzuni soʻrasangiz, uni oʻtadigan darsni topib, unda nima borligini aytaman: {subjects}, jami {n} ta dars. Oʻzbekcha, ruscha yoki inglizcha yozishingiz mumkin.',
      lesson: 'Bu mavzu <b>{subject}</b> kursining {i}-darsida: “<b>{title}</b>” ({m} daqiqa). Unda: {about}', watch: '▶ “{title}” darsini koʻrish ({m} daqiqa)',
      subject: '<b>{subject}</b> boʻyicha {n} ta dars bor: {titles}. Qaysi birini koʻramiz?',
      none: 'Buni darslarimizda hali topa olmadim. Mana bor mavzulardan bir nechtasi: {topics}. Shulardan biri haqida soʻrang, masalan: “{ex1}”, yoki pastdagi gʻoyalardan birini tanlang.',
      bound: 'Hozir javob bera olmayman. Darsni qayta oʻqing yoki birozdan keyin yana soʻrang.',
      boundCap: 'Bugungi savollaringiz tugadi. Ertaga yana soʻrang. Hozircha darsni qayta oʻqing.',
      and: ' va '
    },
    ru: {
      hi: 'Привет, {name}!', greet: 'Привет, {name}! Что изучим сегодня? Спросите об уроке, например: «{ex1}» или «{ex2}».',
      how: 'Отлично, спасибо, что спросили! Готовы заниматься? Спросите об уроке, например: «{ex1}».',
      thanks: 'Пожалуйста! Если появятся ещё вопросы по урокам, спрашивайте.', bye: 'Пока, {name}! Возвращайтесь в любое время.',
      caps: 'Я Жамол, ваш помощник в учёбе. Спросите о теме, и я найду урок, где её разбирают, и расскажу, что в нём: {subjects}, всего {n} {lessons}. Можно писать по-русски, по-узбекски или по-английски.',
      lesson: 'Эта тема — в курсе «<b>{subject}</b>», урок {i}: «<b>{title}</b>» ({m} мин). В нём: {about}', watch: '▶ Смотреть «{title}» ({m} мин)',
      subject: 'В курсе «<b>{subject}</b>» {n} {lessons}: {titles}. Какой посмотрим?',   // the course named, never declined ("По Психология")
      none: 'Я пока не нашёл этого в наших уроках. Вот некоторые темы, которые у нас есть: {topics}. Спросите об одной из них, например: «{ex1}», или выберите идею ниже.',
      bound: 'Сейчас не могу ответить. Перечитайте урок или спросите чуть позже.',
      boundCap: 'Вопросы на сегодня закончились. Спросите завтра, а пока перечитайте урок.',
      and: ' и '
    }
  };
  var EXAMPLES = {
    en: ['How do I solve a system of equations?', 'What is a cognitive bias?', 'What is a derivative?'],
    uz: ['Tenglamalar sistemasi qanday yechiladi?', '[[IELTS Writing Task 2]] rejasi qanday tuziladi?', 'Hosila nima?'],
    ru: ['Как решать системы уравнений?', 'Как построить эссе для IELTS Writing Task 2?', 'Что такое производная?']
  };
  var NAMES = { psy: { uz: 'Psixologiya', ru: 'Психология' } };   // the parent design's own dictionary (design/artifacts/parent-*.html), as is "Жамол"
  /** The design's 16 lessons' "about" lines in Uzbek and Russian, by English title (translations of the design's text, nothing added). */
  var ABOUT = {
    'Linear equations': { uz: 'Bir nomaʼlumli tenglamalarni tez yechish va [[SAT]]da takrorlanadigan qoliplarni payqash.', ru: 'Быстро решать уравнения с одной переменной и замечать закономерности, которые повторяются в SAT.' },
    'Systems of equations': { uz: 'Oʻrniga qoʻyish, qoʻshish usuli va qachon algebrani chetga surib, javob variantlarini tekshirib koʻrish kerakligi.', ru: 'Подстановка, исключение и когда пропустить алгебру и проверить варианты ответов.' },
    'Main idea and purpose': { uz: 'Avval muallifning asosiy fikrini toping, soʻng har bir javobni matndagi satr bilan isbotlang.', ru: 'Сначала найдите главную мысль автора, затем подтверждайте каждый ответ строкой из текста.' },
    'Punctuation: commas': { uz: '[[SAT]] yozma qismidagi deyarli har bir savolni qamrab oladigan vergulning toʻrtta qoidasi.', ru: 'Четыре правила запятой, которые покрывают почти все вопросы SAT по письму.' },
    'Word problems': { uz: 'Uzun matnli masalalarni vaqt yoʻqotmasdan qisqa tenglamalarga aylantirish.', ru: 'Превращать длинные условия в короткие уравнения, не теряя времени.' },
    'Limits and continuity': { uz: 'Limit aslida nimani anglatadi va uni grafik, jadval va formulalardan qanday aniqlash mumkin.', ru: 'Что на самом деле означает предел и как находить его по графикам, таблицам и формулам.' },
    'Derivatives': { uz: 'Kerakli qoidalar va ularni ochiq javobli ([[free-response]]) savollarda qoʻllash.', ru: 'Нужные правила и как применять их в заданиях с развёрнутым ответом (free-response).' },
    'Kinematics': { uz: 'Bir va ikki oʻlchamdagi harakat, qadamma-qadam.', ru: 'Движение в одном и двух измерениях, шаг за шагом.' },
    'Stoichiometry': { uz: 'Mollar, nisbatlar va cheklovchi reagentlar, hiylalarni yodlamasdan.', ru: 'Моли, соотношения и лимитирующие реагенты без заучивания трюков.' },
    'Writing Task 2: structure': { uz: 'Inshoni mavzudan chetga chiqarmaydigan aniq toʻrt xatboshili reja.', ru: 'Чёткий план из четырёх абзацев, который удерживает эссе в рамках задания.' },
    'Speaking Part 2: cue cards': { uz: 'Bir daqiqada reja tuzing, keyin fikrlaringiz tugab qolmasdan ikki daqiqa gapiring.', ru: 'Минута на план, затем две минуты речи, и идеи не заканчиваются.' },
    'Listening: maps': { uz: 'Xaritadagi yoʻnalishlarni kuzatib boring va javoblarni eshitilishi bilan ilib oling.', ru: 'Следите за направлениями на карте и ловите ответы по ходу записи.' },
    'Reading: True, False, Not Given': { uz: '[[False]] va [[Not Given]] oʻrtasidagi farq, mashq matnlari bilan.', ru: 'Разница между False и Not Given, с текстами для практики.' },
    'What is psychology?': { uz: 'Psixologlar beradigan asosiy savollar va ular bularni qanday oʻrganishi.', ru: 'Главные вопросы, которые задают психологи, и как они их изучают.' },
    'Memory and forgetting': { uz: 'Xotira qanday shakllanadi, nega unutamiz va oʻrganganingiz esda qolishi uchun qanday oʻqish kerak.', ru: 'Как формируются воспоминания, почему мы забываем и как учиться, чтобы запомнилось.' },
    'Cognitive biases': { uz: 'Ongimiz tanlaydigan qisqa yoʻllar va ular kundalik qarorlarimizga qanday taʼsir qiladi.', ru: 'Короткие пути, которыми идёт наш разум, и как они влияют на повседневные решения.' }
  };

  /* ---------- Uzbek Latin → Cyrillic (the copy only: names, tests, {placeholders}, <tags> and [[literals]] stay) ---------- */
  var CYR = { a: 'а', b: 'б', c: 'с', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'х', y: 'й', z: 'з' };
  function cyrWord(w) {
    var lw = w.toLowerCase(), out = '', i = 0;
    while (i < lw.length) {
      var c = lw.charAt(i), n = lw.charAt(i + 1), r, k = 1;
      if ((c === 'o' || c === 'g') && n === 'ʻ') { r = c === 'o' ? 'ў' : 'ғ'; k = 2; }
      else if (c === 's' && n === 'h') { r = 'ш'; k = 2; }
      else if (c === 'c' && n === 'h') { r = 'ч'; k = 2; }
      else if (c === 'y' && n === 'o' && lw.charAt(i + 2) !== 'ʻ') { r = 'ё'; k = 2; }
      else if (c === 'y' && n === 'u') { r = 'ю'; k = 2; }
      else if (c === 'y' && n === 'a') { r = 'я'; k = 2; }
      else if (c === 'y' && n === 'e') { r = 'е'; k = 2; }
      else if (c === 'e' && i === 0) r = 'э';
      else if (c === 'ʼ') r = 'ъ';
      else r = CYR[c] || c;
      if (w.charAt(i) !== lw.charAt(i)) r = r.toUpperCase();
      out += r; i += k;
    }
    return out;
  }
  function cyr(s) {
    return String(s).replace(/\[\[[\s\S]*?\]\]|\{[^}]*\}|<[^>]*>|[A-Za-zʻʼ]+/g, function (m) {
      var c = m.charAt(0);
      if (c === '[') return m.slice(2, -2);
      if (c === '{' || c === '<') return m;
      if (m.length > 1 && m === m.toUpperCase()) return m;                   // SAT, AP, IELTS
      return cyrWord(m);
    });
  }
  function lit(s) { return String(s).replace(/\[\[([\s\S]*?)\]\]/g, '$1'); }
  /** One copy line in the answer's language and script, its {fields} filled (each already escaped HTML). */
  function say(L, key, f) {
    var t = COPY[L.lang][key];
    if (!f || !f.name) t = t.replace(/,? \{name\}/g, '');
    if (L.lang === 'uz' && L.script === 'cyrl') t = cyr(t);
    return lit(t.replace(/\{(\w+)\}/g, function (m, k) { return f && f[k] != null ? f[k] : m; }));
  }
  function inScript(L, s) { return lit(L.lang === 'uz' && L.script === 'cyrl' ? cyr(s) : s); }
  function ruLessons(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'урок' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'урока' : 'уроков'; }
  function list(L, items) { return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + inScript(L, COPY[L.lang].and) + items[items.length - 1]; }
  function subjName(L, s) { return esc(inScript(L, (NAMES[s.key] && NAMES[s.key][L.lang]) || s.name)); }
  /** A lesson title in a list, quoted as each language's copy quotes it: a title can hold a comma ("Reading: True, False, Not Given") or end in "?". */
  var QUOTES = { en: ['"', '"'], uz: ['“', '”'], ru: ['«', '»'] };
  function quote(L, t) { return QUOTES[L.lang][0] + esc(t) + QUOTES[L.lang][1]; }

  /* ---------- the answer ---------- */
  var STOP = ('what whats how why when where who which that this these those with from have does about your there their they them then than into also just like want need know tell give explain please ' +
    'help could would should will cant dont simply simple more some much many very really thing things lesson lessons learn study question questions practice next make done good great thanks thank ' +
    'hello mean means here the and for are you can') .split(' ');
  function find(tk, subjects) {
    var best = null, top = 0, subj = null;
    subjects.forEach(function (s, si) { if ((SUBJ[s.key] || []).some(function (w) { return has(tk, norm(w)); }) && subj === null) subj = si; });
    TOPICS.forEach(function (tp) {
      var si = -1, li = -1;
      subjects.forEach(function (s, i) { if (s.key === tp.s) s.lessons.forEach(function (l, j) { if (l.t === tp.t) { si = i; li = j; } }); });
      if (si < 0) return;
      var sc = 0;
      tp.k.forEach(function (w) { if (has(tk, norm(w))) sc += 3; });
      tp.g.forEach(function (w) { if (has(tk, norm(w))) sc += 1; });
      if (!sc) return;
      if (subj === si) sc += 1;
      if (sc > top) { top = sc; best = { si: si, li: li }; }
    });
    return { lesson: best, subject: subj };
  }
  /** English only: the design's own match (each word of the question found in a lesson's text), its stop words left out. */
  function designMatch(q, subjects, ctx, extra) {
    var words = (norm(q).match(/[\p{L}]{4,}/gu) || []).filter(function (w) { return STOP.indexOf(w) < 0; }), best = null, top = 0;
    if (!words.length) return null;
    subjects.forEach(function (s, si) { s.lessons.forEach(function (l, li) {
      var hay = norm(s.name + ' ' + s.course + ' ' + l.t + ' ' + l.about + ' ' + ((extra && extra[s.key]) || ''));
      var sc = words.reduce(function (a, w) { return a + (hay.indexOf(w) >= 0 ? 1 : 0); }, 0);
      if (!sc) return;
      if (ctx && ctx.si === si && ctx.li === li) sc += 1.5;
      if (sc > top) { top = sc; best = { si: si, li: li }; }
    }); });
    return best;
  }
  function firstOpen(subjects) {
    for (var si = 0; si < subjects.length; si++) for (var li = 0; li < subjects[si].lessons.length; li++) if (!(subjects[si].lessons[li].p >= 100)) return { si: si, li: li };
    return null;
  }
  function lessonHtml(L, subjects, at, name) {
    var s = subjects[at.si], l = s.lessons[at.li], tr = ABOUT[l.t] && ABOUT[l.t][L.lang];
    var about = L.lang === 'en' || !tr ? esc(l.about) : esc(inScript(L, tr));
    var f = { name: name, subject: subjName(L, s), i: String(at.li + 1), title: esc(l.t), m: String(l.m), about: about };
    return say(L, 'lesson', f) + '<button class="jm-go" type="button" data-si="' + at.si + '" data-li="' + at.li + '">' + say(L, 'watch', f) + '</button>';
  }
  /* ---------- P8d (the teen re-check of 14 Oct 2026): her REAL lessons ----------
   * With the lessons part on (public/runtime/jg-lessons.js or jg-lessons-desktop.js loaded) Jamol knows only the courses she can see (C19,
   * C2, C4: GET /api/v1/lessons, in the page's language): a question is matched against their lesson titles, the answer names her course and
   * lesson and opens THAT lesson; nothing sends her to a sample lesson or to a video that does not exist («Linear equations (18 мин) ▶
   * Смотреть» for a DTM percent question), and the greeting and the ideas list only her courses. The lessons part off: as before. */
  var RCOPY = {
    en: { lesson: 'This is in your course <b>{subject}</b>, lesson {i}: "<b>{title}</b>" ({m} min).', open: 'Open "{title}"',
      none: "I couldn't find that in your lessons yet. Your courses: {topics}. Ask about one of them, for example \"{ex1}\".",
      empty: 'Your lessons are not open yet. When they are, ask me about any of them.',
      hi: "Hi {name}! I'm Jamol. Ask me about your lessons: {subjects}.", hi0: "Hi {name}! I'm Jamol. Ask me about your lessons.",
      idea: 'What is in "{t}"?', next: 'What should I learn next?' },
    uz: { lesson: 'Bu mavzu <b>{subject}</b> kursingizning {i}-darsida: “<b>{title}</b>” ({m} daqiqa).', open: '“{title}” darsini ochish',
      none: 'Buni darslaringizda hali topa olmadim. Kurslaringiz: {topics}. Shulardan biri haqida soʻrang, masalan: “{ex1}”.',
      empty: 'Darslaringiz hali ochilmagan. Ochilganda, istalgan dars haqida soʻrang.',
      hi: 'Salom, {name}! Men Jamolman. Darslaringiz haqida soʻrang: {subjects}.', hi0: 'Salom, {name}! Men Jamolman. Darslaringiz haqida soʻrang.',
      idea: '“{t}” darsida nima bor?', next: 'Keyin nimani oʻrganishim kerak?' },
    ru: { lesson: 'Эта тема — в вашем курсе «<b>{subject}</b>», урок {i}: «<b>{title}</b>» ({m} мин).', open: 'Открыть «{title}»',
      none: 'Я пока не нашёл этого в ваших уроках. Ваши курсы: {topics}. Спросите об одном из них, например: «{ex1}».',
      empty: 'Ваши уроки ещё не открыты. Когда откроются, спрашивайте о любом из них.',
      hi: 'Привет, {name}! Я Жамол. Спрашивайте о своих уроках: {subjects}.', hi0: 'Привет, {name}! Я Жамол. Спрашивайте о своих уроках.',
      idea: 'Что в уроке «{t}»?', next: 'Что мне изучить дальше?' }
  };
  function rsay(L, key, f) { var t = RCOPY[L.lang][key]; return lit(t.replace(/\{(\w+)\}/g, function (m, k) { return f && f[k] != null ? f[k] : m; })); }
  var fetched = null, fetching = false;
  function lessonsPart() { return !!(W.JG_LESSONS || W.JG_LESSONS_DESKTOP); }
  /** Her courses as the lessons part holds them (the phone's, the laptop's, or the answer jg-real.js handed on), else the ones fetched here. */
  function realCourses() {
    var M = W.JG_LESSONS, Dk = W.JG_LESSONS_DESKTOP, a = (M && typeof M.list === 'function' && M.list()) || [];
    if (!a.length && Dk && typeof Dk.list === 'function') a = Dk.list() || [];
    if (!a.length && W.JG_LESSONS_DATA && Array.isArray(W.JG_LESSONS_DATA.courses)) a = W.JG_LESSONS_DATA.courses;
    return a.length ? a : fetched || [];
  }
  function ensureCourses() {
    if (!lessonsPart() || realCourses().length || fetching || typeof W.fetch !== 'function') return;
    var B = W.JG_BOOT; fetching = true;
    W.fetch('/api/v1/lessons?lang=' + encodeURIComponent(pageLang()), { headers: B && B.uid ? { 'x-jg-uid': B.uid } : {}, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; }, function () { return null; })
      .then(function (j) { fetching = false; if (j && Array.isArray(j.courses)) fetched = j.courses; });
  }
  /** Her courses in the shape the answers read: { key, name, real, lessons: [{ id, n, t, m, p }] }; null with the lessons part off. */
  function realSubjects() {
    if (!lessonsPart()) return null;
    return realCourses().map(function (c) {
      var ls = [];
      (c.sections || []).forEach(function (s) { (s.units || []).forEach(function (u) { (u.lessons || []).forEach(function (l) { if (l && l.id && l.title) ls.push({ id: String(l.id), n: l.n | 0, t: String(l.title), m: l.minutes | 0, p: l.state === 'done' ? 100 : 0 }); }); }); });
      return { key: 'real:' + c.id, name: String(c.title || ''), exam: c.exam || null, real: true, lessons: ls };
    }).filter(function (s) { return s.lessons.length; });
  }
  /** Two stems match when one starts with the other's first letters (Uzbek and Russian endings: "foizlarni" ~ "Foiz", "проценты" ~ "Проценты"). */
  function stemHit(a, b) { if (a.length < 4 || b.length < 4) return a === b; var k = Math.max(4, Math.min(a.length, b.length) - 2); return a.slice(0, k) === b.slice(0, k); }
  function words4(s) { return toks(s).filter(function (w, i, a) { return w.length >= 4 && STOP.indexOf(w) < 0 && a.indexOf(w) === i; }); }   // each word once: a title that says "chiziqli" twice is not a better match
  function realFind(tk, subjects) {
    var q = tk.filter(function (w) { return STOP.indexOf(w) < 0; }), best = null, top = 0, subj = null;
    subjects.forEach(function (s, si) {
      var ex = s.exam ? String(s.exam).toLowerCase() : '';
      if (subj === null && ((ex && tk.some(function (t) { return hit(t, ex + '~') || hit(t, cyr(ex) + '~'); })) || words4(s.name).some(function (w) { return q.some(function (t) { return stemHit(t, w); }); }))) subj = si;
      s.lessons.forEach(function (l, li) {
        var sc = words4(l.t).reduce(function (n, w) { return n + (q.some(function (t) { return stemHit(t, w); }) ? 1 : 0); }, 0);
        if (sc > 0 && subj === si) sc += 0.5;
        if (sc > top) { top = sc; best = { si: si, li: li }; }
      });
    });
    return { lesson: best, subject: subj };
  }
  function realLessonHtml(L, subjects, at) {
    var s = subjects[at.si], l = s.lessons[at.li], f = { subject: esc(s.name), i: String(l.n || at.li + 1), title: esc(l.t), m: String(l.m) };
    return rsay(L, 'lesson', f) + '<button class="jm-go" type="button" data-jgl="' + esc(l.id) + '">' + rsay(L, 'open', f) + '</button>';
  }
  function realOpen(subjects) { for (var si = 0; si < subjects.length; si++) for (var li = 0; li < subjects[si].lessons.length; li++) if (!(subjects[si].lessons[li].p >= 100)) return { si: si, li: li }; return subjects.length ? { si: 0, li: 0 } : null; }
  function realAfter(subjects, id) {
    for (var si = 0; si < subjects.length; si++) for (var li = 0; li < subjects[si].lessons.length; li++) if (subjects[si].lessons[li].id === id)
      return li + 1 < subjects[si].lessons.length ? { si: si, li: li + 1 } : si + 1 < subjects.length ? { si: si + 1, li: 0 } : null;
    return realOpen(subjects);
  }
  function realExamples(subjects) {
    var t = []; subjects.forEach(function (s) { s.lessons.forEach(function (l) { if (t.length < 2 && !(l.p >= 100)) t.push(l.t); }); });
    if (!t.length) subjects.forEach(function (s) { s.lessons.forEach(function (l) { if (t.length < 2) t.push(l.t); }); });
    return t;
  }
  /* "Open «…»": the real lesson, in the Lessons tab (the phone's card, the laptop's open), never the design's sample player */
  function goReal(id) {
    var Dk = W.JG_LESSONS_DESKTOP, doc = W.document;
    if (Dk && typeof Dk.open === 'function') { if (W.JIA && typeof W.JIA.go === 'function') W.JIA.go('lessons'); W.setTimeout(function () { Dk.open(id); }, 300); return; }
    var tb = doc.querySelector('#tb-track button[data-i="3"]'); if (tb) tb.click();
    W.setTimeout(function () {
      var c = doc.querySelector('.jgl-course .ls-card[data-jgl="' + id.replace(/["\\]/g, '') + '"]');
      if (c) { if (c.scrollIntoView) c.scrollIntoView({ block: 'nearest', inline: 'center' }); W.setTimeout(function () { c.click(); }, 260); }
    }, 450);
  }
  if (W.document && W.document.addEventListener) W.document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.jm-go[data-jgl]') : null; if (!b) return;
    e.stopPropagation(); e.preventDefault();
    var back = W.document.getElementById('jm-back'); if (back) back.click();   // the design's own close of the chat
    goReal(b.getAttribute('data-jgl'));
  }, true);

  function answer(q, subjects, ctx, extra) {
    subjects = subjects || [];
    var d = detect(q), L = { lang: d.lang || fallbackLang(), script: d.lang === 'uz' ? d.script : 'latn' };
    var tk = toks(q), name = esc((W.JG_ME && W.JG_ME.firstName) || ''), f = { name: name };
    function said(intent) { var x = INTENTS[intent], ok = false; for (var l in x) x[l].forEach(function (p) { if (says(tk, norm(p))) ok = true; }); return ok; }
    var greeted = said('greet'), hi = greeted ? say(L, 'hi', f) + ' ' : '';
    function out(kind, html, at) { var o = { html: html, lang: L.lang, kind: kind }; if (at) o.at = at; return o; }   // never "lesson": the design adds its own button for that
    var ex = EXAMPLES[L.lang].map(function (e) { return esc(inScript(L, e)); });
    // P6 lane B4: a chat about a real lesson had no answer (the lesson cap, no AI): say so and send her back to that lesson, never to a sample one
    if (bound && openLesson() === bound) return out('none', hi + say(L, asked && asked.failed === 'rate_limited' ? 'boundCap' : 'bound', f));
    var RS = realSubjects();
    if (RS) {   // P8d: her real lessons only (see above)
      ensureCourses();
      if (!RS.length) {   // no course of hers yet (or not read yet): small talk as ever, and no topic that is not hers
        var e0 = ['bye', 'thanks', 'how', 'greet', 'caps'].filter(said)[0];
        return e0 === 'bye' || e0 === 'thanks' ? out(e0, hi + say(L, e0, f)) : out(e0 || 'none', hi + rsay(L, 'empty', f));
      }
      var rx = realExamples(RS).map(function (t) { return esc(t); }); ex = [rx[0] || '', rx[1] || rx[0] || '', rx[0] || ''];
      var rm = realFind(tk, RS);
      if (rm.lesson) return out('lesson', hi + realLessonHtml(L, RS, rm.lesson));
      if (said('next')) { var nx = realAfter(RS, bound); if (nx) return out('lesson', hi + realLessonHtml(L, RS, nx)); }
      if (rm.subject !== null) {
        var rs = RS[rm.subject], rn = rs.lessons.length;
        return out('subject', hi + say(L, 'subject', { name: name, subject: esc(rs.name), n: String(rn), lessons: ruLessons(rn), titles: rs.lessons.map(function (l) { return quote(L, l.t); }).join(', ') })
          + '<button class="jm-go" type="button" data-jgl="' + esc(rs.lessons[0].id) + '">' + rsay(L, 'open', { title: esc(rs.lessons[0].t) }) + '</button>');
      }
      var rorder = ['caps', 'how', 'bye', 'thanks', 'greet'];
      for (var ri = 0; ri < rorder.length; ri++) if (said(rorder[ri])) {
        var rtotal = RS.reduce(function (a, s2) { return a + s2.lessons.length; }, 0);
        return out(rorder[ri], (rorder[ri] === 'greet' ? '' : hi) + say(L, rorder[ri], { name: name, ex1: ex[0], ex2: ex[1], n: String(rtotal), lessons: ruLessons(rtotal), subjects: list(L, RS.map(function (s2) { return esc(s2.name); })) }));
      }
      var rtopics = RS.map(function (s2) { return esc(s2.name) + ' (' + s2.lessons.slice(0, 2).map(function (l) { return quote(L, l.t); }).join(', ') + ')'; }).join('; ');
      return out('none', hi + rsay(L, 'none', { topics: rtopics, ex1: ex[0] }));
    }
    var m = find(tk, subjects);
    if (m.lesson) return out('lesson', hi + lessonHtml(L, subjects, m.lesson, name), m.lesson);
    if (m.subject !== null) {
      var s = subjects[m.subject], n = s.lessons.length;
      var html = say(L, 'subject', { name: name, subject: subjName(L, s), n: String(n), lessons: ruLessons(n), titles: s.lessons.map(function (l) { return quote(L, l.t); }).join(', ') });
      var f0 = { title: esc(s.lessons[0].t), m: String(s.lessons[0].m) };
      return out('subject', hi + html + '<button class="jm-go" type="button" data-si="' + m.subject + '" data-li="0">' + say(L, 'watch', f0) + '</button>', { si: m.subject, li: 0 });
    }
    if (said('next')) {   // from a lesson: the one after it; from the Lessons tab: the first one not finished (a real student's p is 0 until watched)
      var at = ctx && ctx.s ? (ctx.li + 1 < ctx.s.lessons.length ? { si: ctx.si, li: ctx.li + 1 } : ctx.si + 1 < subjects.length ? { si: ctx.si + 1, li: 0 } : null) : firstOpen(subjects);
      if (at) return out('lesson', hi + lessonHtml(L, subjects, at, name), at);
    }
    var order = ['caps', 'how', 'bye', 'thanks', 'greet'];
    for (var i = 0; i < order.length; i++) if (said(order[i])) {
      var total = subjects.reduce(function (a, s2) { return a + s2.lessons.length; }, 0);
      var body = say(L, order[i], { name: name, ex1: ex[0], ex2: ex[1], n: String(total), lessons: ruLessons(total), subjects: list(L, subjects.map(function (s2) { return subjName(L, s2); })) });
      return out(order[i], (order[i] === 'greet' ? '' : hi) + body);
    }
    if (L.lang === 'en') { var dm = designMatch(q, subjects, ctx, extra); if (dm) return out('lesson', lessonHtml(L, subjects, dm, name), dm); }
    if (ctx && ctx.s && ctx.si >= 0) return out('lesson', hi + lessonHtml(L, subjects, { si: ctx.si, li: ctx.li }, name), { si: ctx.si, li: ctx.li });
    var topics = subjects.map(function (s2) { return subjName(L, s2) + ' (' + s2.lessons.slice(0, 2).map(function (l) { return quote(L, l.t); }).join(', ') + ')'; }).join('; ');
    return out('none', hi + say(L, 'none', { name: name, topics: topics, ex1: ex[2] }));
  }

  /* ---------- with an AI: the language, said once more on the question being asked ---------- */
  var SMALL = ' If the message is a greeting, thanks or small talk, answer it briefly and warmly in that language, then offer help with a lesson.)';
  var HINT = {
    en: '(Note for Jamol: the student wrote in English. Reply in English.' + SMALL,
    'uz-latn': '(Note for Jamol: the student wrote in Uzbek, in the Latin script; casual spellings such as "qalesan" (how are you), "nma" (what) or "raxmat" (thanks) are Uzbek. ' +
      'Reply in Uzbek in the Latin script, with oʻ and gʻ, and keep lesson titles as the app names them.' + SMALL,
    'uz-cyrl': '(Note for Jamol: the student wrote in Uzbek, in the Cyrillic script. Reply in Uzbek in the Cyrillic script, and keep lesson titles as the app names them.' + SMALL,
    'ru-cyrl': '(Note for Jamol: the student wrote in Russian. Reply in Russian, and keep lesson titles as the app names them.' + SMALL,
    'ru-latn': '(Note for Jamol: the student wrote in Russian, in Latin letters. Reply in Russian in the Cyrillic script, and keep lesson titles as the app names them.' + SMALL
  };
  /* ---------- P6 lane B4: the real lesson the chat is about (see the header) ---------- */
  var bound = null, asked = null;
  /** The real lesson the reader holds open on the lesson screen (phone or laptop), else null (no lessons part, a sample lesson, closed). */
  function openLesson() {
    var R = [W.JG_LESSONS, W.JG_LESSONS_DESKTOP];
    for (var i = 0; i < R.length; i++) {
      var s = R[i] && typeof R[i].state === 'function' ? R[i].state() : null;
      if (s && typeof s.open === 'string' && s.open) return s.open;
    }
    return null;
  }
  /** The page's language, as the lesson reader asks for its lesson (?lang=), else the roadmap's. */
  function pageLang() { var l = W.JG_I18N && typeof W.JG_I18N.lang === 'function' ? W.JG_I18N.lang() : null; return l === 'uz' || l === 'ru' || l === 'en' ? l : fallbackLang(); }
  function tagLast(turns, q) {
    if (turns && bound && openLesson() === bound) { turns.lessonId = bound; turns.lang = pageLang(); asked = turns; }   // read by jg-runtime.js sample()
    var d = detect(q), last = turns && turns[turns.length - 1];
    if (!d.lang || !last || last.role !== 'user') return turns;
    last.content += '\n\n' + HINT[d.lang === 'en' ? 'en' : d.lang + '-' + d.script];
    return turns;
  }

  /* ---------- P4g fix K2 (the owner: "some students don't understand English"): Jamol's greeting and its three ideas in the roadmap's language ---------- */
  var GREET = {
    en: { hi: "Hi {name}! I'm Jamol. Ask me about any lesson: SAT, AP, IELTS or Psychology.", lesson: 'Hi {name}! Ask me anything about <b>{lesson}</b>, or any other lesson.',
      ideas: ['How do I solve a system of equations?', 'How should I plan IELTS Task 2?', 'What is a cognitive bias?'], lessonIdeas: ['Explain {lesson} simply', 'Give me a practice question', 'What should I learn next?'] },
    uz: { hi: 'Salom, {name}! Men Jamolman. Istalgan dars haqida soʻrang: SAT, AP, IELTS yoki Psixologiya.', lesson: 'Salom, {name}! «<b>{lesson}</b>» yoki boshqa istalgan dars boʻyicha soʻrang.',
      ideas: EXAMPLES.uz, lessonIdeas: ['«{lesson}»ni sodda qilib tushuntiring', 'Menga mashq uchun savol bering', 'Keyin nimani oʻrganishim kerak?'] },
    ru: { hi: 'Привет, {name}! Я Жамол. Спрашивайте о любом уроке: SAT, AP, IELTS или психология.', lesson: 'Привет, {name}! Спрашивайте что угодно по теме «<b>{lesson}</b>» или по любому другому уроку.',
      ideas: EXAMPLES.ru, lessonIdeas: ['Объясни «{lesson}» простыми словами', 'Дай мне тренировочный вопрос', 'Что мне изучить дальше?'] }
  };
  /** The first bubble (HTML, the name and lesson escaped), as the design words it in English. */
  function greet(name, lesson) {
    bound = lesson ? openLesson() : null; asked = null;   // P6 lane B4: opened from a lesson screen holding a real lesson, the chat is about it
    var RS = !lesson ? realSubjects() : null;   // P8d: the greeting lists only her own courses ("SAT, AP, IELTS or Psychology" were the design's)
    if (RS) { ensureCourses(); var L = { lang: fallbackLang(), script: 'latn' }; return rsay(L, RS.length ? 'hi' : 'hi0', { name: esc(name), subjects: list(L, RS.map(function (s2) { return esc(s2.name); })) }); }
    var g = GREET[fallbackLang()], s = lesson ? g.lesson : g.hi
    return s.replace('{name}', esc(name)).replace('{lesson}', esc(lesson))
  }
  /** The three idea chips (plain text; the design escapes them). */
  function ideas(lesson) {
    var RS = !lesson ? realSubjects() : null;   // P8d: her own lessons' ideas, never the design's sample topics
    if (RS) { var c = RCOPY[fallbackLang()]; return realExamples(RS).map(function (t) { return lit(c.idea).replace('{t}', t); }).concat([c.next]); }
    var g = GREET[fallbackLang()]
    return (lesson ? g.lessonIdeas : g.ideas).map(function (s) { return lit(s).replace('{lesson}', lesson || '') })
  }

  W.JG_JAMOL = { detect: detect, answer: answer, tagLast: tagLast, greet: greet, ideas: ideas, lang: fallbackLang, lesson: function () { return bound; },
    _t: { COPY: COPY, ABOUT: ABOUT, EXAMPLES: EXAMPLES, cyr: cyr, TOPICS: TOPICS } };
})(window);
