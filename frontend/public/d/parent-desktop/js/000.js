
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var device = $('device');
  var DESK = document.body.classList.contains('desk');
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IMG = {
    delighted: '/d/parent-desktop/media/087b5b5ecf061ec6.webp', cele: '/d/parent-desktop/media/4ec796143beb7714.webp', wave: '/d/parent-desktop/media/6fbe6993946ef647.webp', concern: '/d/parent-desktop/media/f8bf6b82ad7b8bb9.webp', pleading: '/d/parent-desktop/media/4f15767b3920e87d.webp',
    welcome: '/d/parent-desktop/media/c36f3fe51855e419.webp', point: '/d/parent-desktop/media/9a7173c7a002dc36.webp', think: '/d/parent-desktop/media/7b3e3ac7f3ea5167.webp', trophy: '/d/parent-desktop/media/f2ff3a69bdaede10.webp', giftbox: '/d/parent-desktop/media/ac952fe10b34ad9c.webp',
    kamila: '/d/parent-desktop/media/477f0b1d5e3165e1.webp', aziza: '/d/parent-desktop/media/d9215f710c4aac64.webp', javlon: '/d/parent-desktop/media/6c4f17698806911b.webp', bekzod: '/d/parent-desktop/media/dcd963e70f280a4b.webp',
    mit: '/d/parent-desktop/media/943c6acbf1356f68.webp', harvard: '/d/parent-desktop/media/fbb6fd0e9131f2c4.webp', purdue: '/d/parent-desktop/media/027b66086c49e7a2.webp', oqil: JG_CHILD.photo /* JG-PROD: identity */
  };
  Object.keys(IMG).forEach(function(k){ var i = new Image(); i.src = IMG[k]; });
  var S = { plan: 'premium', ends: 'Mon, 28 September', billing: 'annual', renewed: false };
  /* gift a membership: the price is one payment for the whole period */
  var GIFT_CENTS = window.JG_PLANS ? { pro: Math.round(window.JG_PLANS.pro.m * 100), premium: Math.round(window.JG_PLANS.premium.m * 100), vip: Math.round(window.JG_PLANS.vip.m * 100) } : { pro: 1290, premium: 2290, vip: 3990 };   /* JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): the gift prices are the served table's (src/server/pay/plans.ts, the same numbers); without it the drawn ones */
  var G = { plan: 'premium', months: 6, name: '', contact: '', rel: 'nephew', note: '' }, GIFTS = [];
  function giftTotal(){ return (Math.round(GIFT_CENTS[G.plan] * G.months * 105 / 100) / 100).toFixed(2); }
  var PLAN_NAME = { pro: 'Pro', premium: 'Premium', vip: 'VIP' };
  var REL = [['nephew', 'Nephew or niece'], ['child', 'My child'], ['friend', 'A friend\'s child'], ['other', 'Someone else']];
  function durTxt(m){ return m === 1 ? '1 month' : m + ' months'; }
  function renderGifts(){
    var el = document.getElementById('giftList'); if (!el) return;
    el.innerHTML = GIFTS.length ? GIFTS.map(function(g){
      return '<div class="row" style="cursor:default"><img src="' + IMG.giftbox + '" alt="" style="width:40px;height:40px;object-fit:contain;flex:none"><span class="row-t"><b>' + escH(g.name) + '</b><small>' + PLAN_NAME[g.plan] + ' · ' + durTxt(g.months) + '</small><small>Sent today · not opened yet</small></span><span style="font-weight:700;font-size:14px;white-space:nowrap">$' + g.total + '</span></div>'; }).join('')
      : '<div class="row" style="cursor:default"><span class="row-t"><small>You haven\'t sent any gifts yet.</small></span></div>';
  }
  function escH(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }


  /* ================= languages: O‘zbekcha, Русский, English ================= */
  var DICT = {"Home": {"uz": "Asosiy", "ru": "Главная"}, "Progress": {"uz": "Natijalar", "ru": "Прогресс"}, "Messages": {"uz": "Xabarlar", "ru": "Сообщения"}, "Account": {"uz": "Profil", "ru": "Профиль"}, "Main": {"uz": "Asosiy menyu", "ru": "Главное меню"}, "Close": {"uz": "Yopish", "ru": "Закрыть"}, "Details": {"uz": "Batafsil", "ru": "Подробнее"}, "See all": {"uz": "Hammasi", "ru": "Все"}, "Done": {"uz": "Tayyor", "ru": "Готово"}, "Back to progress": {"uz": "Natijalarga qaytish", "ru": "Назад к прогрессу"}, "Back to home": {"uz": "Asosiyga qaytish", "ru": "На главную"}, "Back to messages": {"uz": "Xabarlarga qaytish", "ru": "Назад к сообщениям"}, "Notifications, 2 new": {"uz": "Bildirishnomalar, 2 ta yangi", "ru": "Уведомления, 2 новых"}, "2 new: the weekly report and Kamila's essay review": {"uz": "2 ta yangi: haftalik hisobot va Kamilaning insho tekshiruvi", "ru": "2 новых: еженедельный отчёт и проверка эссе от Камилы"}, "You have one child connected. Add another in Account.": {"uz": "Sizda bitta farzand ulangan. Yana qo‘shish uchun Profil bo‘limiga o‘ting.", "ru": "Подключён один ребёнок. Добавить ещё можно в Профиле."}, "Oqil": {"uz": "Oqil", "ru": "Окил"}, "Oqil Odilov": {"uz": "Oqil Odilov", "ru": "Окил Одилов"}, "Rustam Odilov": {"uz": "Rustam Odilov", "ru": "Рустам Одилов"}, "Kamila Saidova": {"uz": "Kamila Saidova", "ru": "Камила Саидова"}, "Aziza Karimova": {"uz": "Aziza Karimova", "ru": "Азиза Каримова"}, "Javlon Tursunov": {"uz": "Javlon Tursunov", "ru": "Жавлон Турсунов"}, "Bekzod Aliev": {"uz": "Bekzod Aliev", "ru": "Бекзод Алиев"}, "Jamol": {"uz": "Jamol", "ru": "Жамол"}, "Jamol ·": {"uz": "Jamol ·", "ru": "Жамол ·"}, "Jamol:": {"uz": "Jamol:", "ru": "Жамол:"}, "Harvard": {"uz": "Harvard", "ru": "Гарвард"}, "Wednesday, 23 September": {"uz": "23-sentabr, chorshanba", "ru": "Среда, 23 сентября"}, "Good evening, Rustam": {"uz": "Xayrli kech, Rustam aka", "ru": "Добрый вечер, Рустам"}, "College applicant · aiming for MIT": {"uz": "Abituriyent · maqsadi MIT", "ru": "Абитуриент · цель: MIT"}, "On track": {"uz": "Yaxshi ketyapti", "ru": "Всё по плану"}, "Needs attention": {"uz": "E’tibor kerak", "ru": "Требует внимания"}, "Updated today, 21:10": {"uz": "Bugun 21:10 da yangilandi", "ru": "Обновлено сегодня в 21:10"}, "Oqil had a good week. He finished 88% of his tasks and studied 2 hours more than last week.": {"uz": "Oqil uchun hafta yaxshi o‘tdi. U vazifalarining 88 foizini bajardi va o‘tgan haftadagidan 2 soat ko‘proq o‘qidi.", "ru": "У Окила была хорошая неделя. Он выполнил 88% заданий и занимался на 2 часа больше, чем на прошлой неделе."}, "Ready for MIT": {"uz": "MITga tayyorgarlik", "ru": "Готовность к MIT"}, "Up 20% since June · Harvard: 70% of the way": {"uz": "Iyundan beri +20% · Harvard: yo‘lning 70 foizi", "ru": "С июня +20% · Гарвард: пройдено 70% пути"}, "Updates from Jamol": {"uz": "Jamoldan xabarlar", "ru": "Новости от Жамола"}, "today": {"uz": "bugun", "ru": "сегодня"}, "this afternoon": {"uz": "bugun kunduzi", "ru": "сегодня днём"}, "reminder": {"uz": "eslatma", "ru": "напоминание"}, "just now": {"uz": "hozirgina", "ru": "только что"}, "Oqil is doing well": {"uz": "Oqil yaxshi natija ko‘rsatyapti", "ru": "У Окила всё хорошо"}, "He is 70% of the way to Harvard and 20% closer to MIT than in June.": {"uz": "U Harvardgacha yo‘lning 70 foizini bosib o‘tdi, iyundan beri MITga 20 foiz yaqinlashdi.", "ru": "Он прошёл 70% пути к Гарварду и с июня стал на 20% ближе к MIT."}, "See progress": {"uz": "Natijalarni ko‘rish", "ru": "Смотреть прогресс"}, "He took part in an event today": {"uz": "Bugun u tadbirda qatnashdi", "ru": "Сегодня он участвовал в мероприятии"}, "Round one of the Tashkent Math Championship. Results on Friday.": {"uz": "Toshkent matematika chempionatining birinchi bosqichi. Natijalar juma kuni e’lon qilinadi.", "ru": "Первый тур Чемпионата Ташкента по математике. Результаты в пятницу."}, "View event": {"uz": "Tadbirni ko‘rish", "ru": "О мероприятии"}, "Congratulate": {"uz": "Tabriklash", "ru": "Поздравить"}, "His membership ends in 5 days": {"uz": "Obuna 5 kundan keyin tugaydi", "ru": "Подписка закончится через 5 дней"}, "On 28 September his live courses and essay reviews stop, in the middle of his MIT application.": {"uz": "28-sentabrdan jonli darslar va insho tekshiruvi to‘xtaydi, aynan MITga tayyorlanayotgan paytda.", "ru": "28 сентября остановятся живые курсы и проверка эссе, прямо в разгар подготовки к MIT."}, "Keep his plan": {"uz": "Obunani saqlab qolish", "ru": "Сохранить подписку"}, "See VIP": {"uz": "VIP haqida", "ru": "Узнать о VIP"}, "Welcome to VIP": {"uz": "VIPga xush kelibsiz", "ru": "Добро пожаловать в VIP"}, "Oqil's mentor will reach out within 24 hours. I'll add every session to your report.": {"uz": "Oqilning mentori 24 soat ichida u bilan bog‘lanadi. Har bir mashg‘ulotni hisobotingizga qo‘shib boraman.", "ru": "Ментор Окила свяжется с ним в течение 24 часов. Каждое занятие я добавлю в ваш отчёт."}, "Open account": {"uz": "Profilni ochish", "ru": "Открыть профиль"}, "Thank you for renewing": {"uz": "Obunani uzaytirganingiz uchun rahmat", "ru": "Спасибо, что продлили подписку"}, "Nothing pauses for Oqil. We keep going with MIT and the Harvard essay.": {"uz": "Oqil uchun hech narsa to‘xtamaydi. MIT va Harvard inshosi ustida ishlashda davom etamiz.", "ru": "Для Окила ничего не останавливается. Продолжаем работу над MIT и эссе для Гарварда."}, "Today": {"uz": "Bugun", "ru": "Сегодня"}, "4 of 5 tasks done": {"uz": "5 ta vazifadan 4 tasi bajarildi", "ru": "Выполнено 4 из 5 заданий"}, "SAT practice": {"uz": "SAT mashqi", "ru": "Практика SAT"}, "Reading set · done at 16:20": {"uz": "Reading to‘plami · 16:20 da bajarildi", "ru": "Чтение · выполнено в 16:20"}, "AP Calculus": {"uz": "AP Calculus", "ru": "AP Calculus"}, "Unit review · done at 17:05": {"uz": "Bo‘lim takrori · 17:05 da bajarildi", "ru": "Повторение раздела · выполнено в 17:05"}, "IELTS English": {"uz": "IELTS ingliz tili", "ru": "IELTS, английский"}, "Listening practice · done at 18:10": {"uz": "Listening mashqi · 18:10 da bajarildi", "ru": "Аудирование · выполнено в 18:10"}, "CAC course": {"uz": "CAC kursi", "ru": "Курс CAC"}, "Lesson 6 · watched in full": {"uz": "6-dars · to‘liq ko‘rildi", "ru": "Урок 6 · просмотрен полностью"}, "Harvard essay": {"uz": "Harvard inshosi", "ru": "Эссе для Гарварда"}, "Second draft · due tonight at 22:00": {"uz": "Ikkinchi qoralama · bugun 22:00 gacha", "ru": "Второй черновик · сдать сегодня до 22:00"}, "Not yet": {"uz": "Hali emas", "ru": "Ещё нет"}, "studied today": {"uz": "bugun o‘qidi", "ru": "занимался сегодня"}, "in a row": {"uz": "ketma-ket", "ru": "подряд"}, "12 days": {"uz": "12 kun", "ru": "12 дней"}, "2 things need your attention": {"uz": "2 ta masala e’tiboringizni talab qiladi", "ru": "2 вопроса требуют вашего внимания"}, "One homework is missing": {"uz": "Bitta uy vazifasi topshirilmagan", "ru": "Одно домашнее задание не сдано"}, "IELTS Listening test 2. His teacher Kamila has reopened it until Friday.": {"uz": "IELTS Listening 2-test. Ustozi Kamila uni juma kunigacha qayta ochib qo‘ydi.", "ru": "IELTS, аудирование, тест 2. Учитель Камила снова открыла его до пятницы."}, "Message Kamila": {"uz": "Kamilaga yozish", "ru": "Написать Камиле"}, "See homework": {"uz": "Uy vazifalari", "ru": "Домашние задания"}, "6 tasks missed this week": {"uz": "Bu hafta 6 ta vazifa bajarilmadi", "ru": "На этой неделе пропущено 6 заданий"}, "Five of them were on Saturday and Sunday.": {"uz": "Ulardan beshtasi shanba va yakshanbaga to‘g‘ri keldi.", "ru": "Пять из них пришлись на субботу и воскресенье."}, "See which tasks": {"uz": "Qaysi vazifalar", "ru": "Какие именно"}, "This week": {"uz": "Bu hafta", "ru": "Эта неделя"}, "All progress": {"uz": "Barcha natijalar", "ru": "Весь прогресс"}, "Tasks done": {"uz": "Bajarilgan vazifalar", "ru": "Выполнено заданий"}, "6 missed": {"uz": "6 tasi bajarilmadi", "ru": "6 пропущено"}, "Study time": {"uz": "O‘qish vaqti", "ru": "Время занятий"}, "2 h 10 min more than last week": {"uz": "o‘tgan haftadan 2 soat 10 daqiqa ko‘p", "ru": "на 2 ч 10 мин больше, чем на прошлой неделе"}, "Live lessons": {"uz": "Jonli darslar", "ru": "Живые уроки"}, "Attended all": {"uz": "Barchasida qatnashdi", "ru": "Посетил все"}, "Test average": {"uz": "Testlar o‘rtachasi", "ru": "Средний балл тестов"}, "Up 3% from August": {"uz": "Avgustdan beri +3%", "ru": "+3% с августа"}, "Upcoming dates": {"uz": "Yaqin sanalar", "ru": "Ближайшие даты"}, "Championship results": {"uz": "Chempionat natijalari", "ru": "Результаты чемпионата"}, "Tashkent Math Championship": {"uz": "Toshkent matematika chempionati", "ru": "Чемпионат Ташкента по математике"}, "In 2 days": {"uz": "2 kundan keyin", "ru": "Через 2 дня"}, "In 3 days": {"uz": "3 kundan keyin", "ru": "Через 3 дня"}, "IELTS practice test": {"uz": "IELTS sinov imtihoni", "ru": "Пробный тест IELTS"}, "IELTS mock test": {"uz": "IELTS sinov imtihoni", "ru": "Пробный тест IELTS"}, "Saturday 10:00, online": {"uz": "Shanba, 10:00, onlayn", "ru": "Суббота, 10:00, онлайн"}, "Saturday at 10:00, online": {"uz": "Shanba, 10:00, onlayn", "ru": "Суббота, 10:00, онлайн"}, "MIT application deadline": {"uz": "MITga hujjat topshirish muddati", "ru": "Срок подачи в MIT"}, "3 of 7 steps done": {"uz": "7 bosqichdan 3 tasi bajarildi", "ru": "Выполнено 3 из 7 шагов"}, "39 days": {"uz": "39 kun", "ru": "39 дней"}, "2 days": {"uz": "2 kun", "ru": "2 дня"}, "3 days": {"uz": "3 kun", "ru": "3 дня"}, "22 days": {"uz": "22 kun", "ru": "22 дня"}, "100 days": {"uz": "100 kun", "ru": "100 дней"}, "His universities": {"uz": "Universitetlari", "ru": "Его университеты"}, "Main goal": {"uz": "Asosiy maqsad", "ru": "Главная цель"}, "61% ready · deadline 1 November": {"uz": "61% tayyor · muddat 1-noyabr", "ru": "Готовность 61% · срок 1 ноября"}, "70% of the way · deadline 1 January": {"uz": "Yo‘lning 70 foizi · muddat 1-yanvar", "ru": "Пройдено 70% пути · срок 1 января"}, "Ready to apply · deadline 1 November": {"uz": "Topshirishga tayyor · muddat 1-noyabr", "ru": "Готов подавать · срок 1 ноября"}, "Recent achievements": {"uz": "So‘nggi yutuqlar", "ru": "Последние достижения"}, "See all 9": {"uz": "Barchasi (9)", "ru": "Все 9"}, "Achievements": {"uz": "Yutuqlar", "ru": "Достижения"}, "Took part in round 1 · today": {"uz": "1-bosqichda qatnashdi · bugun", "ru": "Участвовал в 1-м туре · сегодня"}, "SAT score 1570 of 1600": {"uz": "SAT natijasi: 1570 / 1600", "ru": "SAT: 1570 из 1600"}, "Top 1% of test takers · August": {"uz": "Eng yaxshi 1% ichida · avgust", "ru": "Лучшие 1% участников · август"}, "12 days in a row": {"uz": "Ketma-ket 12 kun", "ru": "12 дней подряд"}, "His best is 21 days": {"uz": "Rekordi: 21 kun", "ru": "Его рекорд: 21 день"}, "Essay praised by teacher": {"uz": "Inshosini ustoz maqtadi", "ru": "Эссе похвалил учитель"}, "Kamila Saidova · today": {"uz": "Kamila Saidova · bugun", "ru": "Камила Саидова · сегодня"}, "AP Calculus 5": {"uz": "AP Calculus 5", "ru": "AP Calculus 5"}, "IELTS 7.5": {"uz": "IELTS 7.5", "ru": "IELTS 7.5"}, "12 volunteer hours": {"uz": "12 soat ko‘ngillilik", "ru": "12 часов волонтёрства"}, "Weekend Tutoring": {"uz": "Dam olish kunlari repetitorlik", "ru": "Репетиторство по выходным"}, "3 weeks, no missed class": {"uz": "3 hafta dars qoldirmadi", "ru": "3 недели без пропусков"}, "First live admission": {"uz": "Birinchi jonli qabul sessiyasi", "ru": "Первая живая сессия по поступлению"}, "Next up": {"uz": "Keyingi maqsadlar", "ru": "Следующие цели"}, "30 days in a row": {"uz": "Ketma-ket 30 kun", "ru": "30 дней подряд"}, "12 of 30 days": {"uz": "30 kundan 12 tasi", "ru": "12 из 30 дней"}, "IELTS 8.0": {"uz": "IELTS 8.0", "ru": "IELTS 8.0"}, "Target by December": {"uz": "Maqsad: dekabrgacha", "ru": "Цель: к декабрю"}, "40 volunteer hours": {"uz": "40 soat ko‘ngillilik", "ru": "40 часов волонтёрства"}, "12 of 40 hours": {"uz": "40 soatdan 12 tasi", "ru": "12 из 40 часов"}, "Earned in the app and outside it": {"uz": "Ilovada va undan tashqarida qo‘lga kiritilgan", "ru": "Получены в приложении и за его пределами"}, "Three new this month": {"uz": "Bu oy uchta yangi", "ru": "Три новых в этом месяце"}, "Three exams": {"uz": "Uchta imtihon", "ru": "Три экзамена"}, "Everything about Oqil's studies, in one place": {"uz": "Oqilning o‘qishi haqida hamma narsa bir joyda", "ru": "Всё об учёбе Окила в одном месте"}, "Tasks done today, one left": {"uz": "Bugungi vazifalar, bittasi qoldi", "ru": "Задания на сегодня, осталось одно"}, "Days in a row": {"uz": "Ketma-ket kunlar", "ru": "Дней подряд"}, "Every task done, 12 days running": {"uz": "12 kundan beri barcha vazifalar bajarilyapti", "ru": "Все задания выполнены 12 дней подряд"}, "This week, 2 h 10 min more than last": {"uz": "Bu hafta, o‘tgan haftadan 2 soat 10 daqiqa ko‘p", "ru": "На этой неделе, на 2 ч 10 мин больше прошлой"}, "Test scores": {"uz": "Test natijalari", "ru": "Результаты тестов"}, "Average on practice tests, up 3%": {"uz": "Sinov testlaridagi o‘rtacha ball, +3%", "ru": "Средний балл пробных тестов, +3%"}, "Attended this month, one watched later": {"uz": "Bu oy qatnashdi, bittasini keyin ko‘rdi", "ru": "Посетил в этом месяце, один посмотрел позже"}, "Next: championship results on Friday": {"uz": "Keyingisi: juma kuni chempionat natijalari", "ru": "Далее: результаты чемпионата в пятницу"}, "Road to MIT": {"uz": "MIT sari yo‘l", "ru": "Путь к MIT"}, "Ready for MIT, up 20% since June": {"uz": "MITga tayyorgarlik, iyundan beri +20%", "ru": "Готовность к MIT, +20% с июня"}, "Tasks done and missed": {"uz": "Bajarilgan va qoldirilgan", "ru": "Выполнено и пропущено"}, "6 missed this week, mostly at the weekend": {"uz": "Bu hafta 6 tasi qoldirildi, asosan dam olish kunlari", "ru": "6 пропущено на этой неделе, в основном в выходные"}, "Homework": {"uz": "Uy vazifalari", "ru": "Домашние задания"}, "One IELTS homework is missing": {"uz": "Bitta IELTS uy vazifasi topshirilmagan", "ru": "Не сдано одно домашнее задание по IELTS"}, "You see Oqil's results, schedule and teacher feedback. His private chats stay private.": {"uz": "Siz Oqilning natijalari, jadvali va ustozlarning fikrlarini ko‘rasiz. Uning shaxsiy yozishmalari maxfiy qoladi.", "ru": "Вы видите результаты Окила, расписание и отзывы учителей. Его личные переписки остаются закрытыми."}, "Tasks": {"uz": "Vazifalar", "ru": "Задания"}, "Studied": {"uz": "O‘qidi", "ru": "Занимался"}, "Live lesson": {"uz": "Jonli dars", "ru": "Живой урок"}, "Today's tasks": {"uz": "Bugungi vazifalar", "ru": "Задания на сегодня"}, "SAT · Reading practice set": {"uz": "SAT · Reading mashqlari", "ru": "SAT · Практика чтения"}, "Done at 16:20 · 18 of 20 correct": {"uz": "16:20 da bajarildi · 20 tadan 18 tasi to‘g‘ri", "ru": "Выполнено в 16:20 · 18 из 20 верно"}, "AP · Calculus unit review": {"uz": "AP · Calculus bo‘lim takrori", "ru": "AP · Повторение раздела Calculus"}, "Done at 17:05": {"uz": "17:05 da bajarildi", "ru": "Выполнено в 17:05"}, "IELTS · Listening section 3": {"uz": "IELTS · Listening 3-bo‘lim", "ru": "IELTS · Аудирование, часть 3"}, "Done at 18:10 · 36 of 40": {"uz": "18:10 da bajarildi · 40 tadan 36 tasi", "ru": "Выполнено в 18:10 · 36 из 40"}, "CAC · Course lesson 6": {"uz": "CAC · 6-dars", "ru": "CAC · Урок 6"}, "Watched in full": {"uz": "To‘liq ko‘rildi", "ru": "Просмотрен полностью"}, "Harvard essay · second draft": {"uz": "Harvard inshosi · ikkinchi qoralama", "ru": "Эссе для Гарварда · второй черновик"}, "Due today at 22:00": {"uz": "Bugun 22:00 gacha", "ru": "Сдать сегодня до 22:00"}, "Left": {"uz": "Qoldi", "ru": "Осталось"}, "Four out of five before dinner is a strong day. The essay is the last one, and he usually writes best in the evening.": {"uz": "Kechki ovqatgacha beshtadan to‘rttasi bajarildi, bu yaxshi kun. Faqat insho qoldi, u odatda kechqurun yaxshi yozadi.", "ru": "Четыре задания из пяти до ужина: это сильный день. Осталось эссе, а пишет он обычно лучше всего вечером."}, "Days in a row when he finished every task": {"uz": "Barcha vazifalarni bajargan ketma-ket kunlar", "ru": "Дни подряд, когда он выполнил все задания"}, "Current": {"uz": "Hozir", "ru": "Сейчас"}, "Best · July": {"uz": "Rekord · iyul", "ru": "Рекорд · июль"}, "Days active": {"uz": "Faol kunlar", "ru": "Активных дней"}, "Last five weeks": {"uz": "So‘nggi besh hafta", "ru": "Последние пять недель"}, "All tasks done": {"uz": "Hamma vazifa bajarildi", "ru": "Все задания выполнены"}, "Missed a task": {"uz": "Vazifa qoldirildi", "ru": "Пропущено задание"}, "Nine more days and he beats his record from July.": {"uz": "Yana to‘qqiz kundan keyin u iyuldagi rekordini yangilaydi.", "ru": "Ещё девять дней, и он побьёт свой июльский рекорд."}, "Mo": {"uz": "Du", "ru": "Пн"}, "Tu": {"uz": "Se", "ru": "Вт"}, "We": {"uz": "Ch", "ru": "Ср"}, "Th": {"uz": "Pa", "ru": "Чт"}, "Fr": {"uz": "Ju", "ru": "Пт"}, "Sa": {"uz": "Sh", "ru": "Сб"}, "Su": {"uz": "Ya", "ru": "Вс"}, "Last 7 days": {"uz": "So‘nggi 7 kun", "ru": "Последние 7 дней"}, "Per day": {"uz": "Kuniga", "ru": "В день"}, "vs last week": {"uz": "o‘tgan haftaga nisbatan", "ru": "к прошлой неделе"}, "8-week avg": {"uz": "8 haftalik o‘rtacha", "ru": "Среднее за 8 недель"}, "Each day": {"uz": "Har kuni", "ru": "По дням"}, "Last 8 weeks": {"uz": "So‘nggi 8 hafta", "ru": "Последние 8 недель"}, "By subject": {"uz": "Fanlar bo‘yicha", "ru": "По предметам"}, "Mon": {"uz": "Du", "ru": "Пн"}, "Tue": {"uz": "Se", "ru": "Вт"}, "Wed": {"uz": "Ch", "ru": "Ср"}, "Thu": {"uz": "Pa", "ru": "Чт"}, "Fri": {"uz": "Ju", "ru": "Пт"}, "Sat": {"uz": "Sh", "ru": "Сб"}, "Sun": {"uz": "Ya", "ru": "Вс"}, "This week, 49 tasks in total": {"uz": "Bu hafta, jami 49 ta vazifa", "ru": "На этой неделе, всего 49 заданий"}, "Completed": {"uz": "Bajarildi", "ru": "Выполнено"}, "Missed · 6": {"uz": "Qoldirildi · 6", "ru": "Пропущено · 6"}, "What he missed": {"uz": "Nimalarni qoldirdi", "ru": "Что он пропустил"}, "IELTS · Listening test 2": {"uz": "IELTS · Listening 2-test", "ru": "IELTS · Аудирование, тест 2"}, "Saturday · also missing as homework": {"uz": "Shanba · uy vazifasi sifatida ham topshirilmagan", "ru": "Суббота · также не сдано как домашнее задание"}, "Missed": {"uz": "Qoldirildi", "ru": "Пропущено"}, "SAT · Vocabulary set": {"uz": "SAT · Lug‘at mashqi", "ru": "SAT · Словарный набор"}, "Saturday": {"uz": "Shanba", "ru": "Суббота"}, "Sunday": {"uz": "Yakshanba", "ru": "Воскресенье"}, "Monday": {"uz": "Dushanba", "ru": "Понедельник"}, "IELTS · Speaking practice": {"uz": "IELTS · Speaking mashqi", "ru": "IELTS · Практика говорения"}, "Psychology · Reading": {"uz": "Psixologiya · O‘qish", "ru": "Психология · Чтение"}, "SAT · Math drill": {"uz": "SAT · Matematika mashqi", "ru": "SAT · Тренировка по математике"}, "CAC · Quiz 5": {"uz": "CAC · 5-test", "ru": "CAC · Тест 5"}, "Redone": {"uz": "Qayta bajarildi", "ru": "Переделано"}, "Five of the six were on the weekend. A short plan for Saturday usually fixes this.": {"uz": "Oltitadan beshtasi dam olish kunlariga to‘g‘ri keldi. Odatda shanba uchun qisqa reja buni hal qiladi.", "ru": "Пять из шести пришлись на выходные. Обычно это решает короткий план на субботу."}, "Set by his teachers this week": {"uz": "Bu hafta ustozlari bergan", "ru": "Задано учителями на этой неделе"}, "Handed in": {"uz": "Topshirildi", "ru": "Сдано"}, "Graded": {"uz": "Baholandi", "ru": "Оценено"}, "Missing": {"uz": "Topshirilmagan", "ru": "Не сдано"}, "Listening test 2": {"uz": "Listening 2-test", "ru": "Аудирование, тест 2"}, "Kamila Saidova · was due Saturday": {"uz": "Kamila Saidova · muddati shanba edi", "ru": "Камила Саидова · срок был в субботу"}, "Harvard essay, second draft": {"uz": "Harvard inshosi, ikkinchi qoralama", "ru": "Эссе для Гарварда, второй черновик"}, "Kamila Saidova · due today 22:00": {"uz": "Kamila Saidova · bugun 22:00 gacha", "ru": "Камила Саидова · до 22:00 сегодня"}, "Due today": {"uz": "Bugun", "ru": "Сегодня"}, "Reading set 14": {"uz": "Reading, 14-to‘plam", "ru": "Чтение, набор 14"}, "Problem set: derivatives": {"uz": "Masalalar: hosilalar", "ru": "Задачи: производные"}, "Writing Task 2": {"uz": "Writing Task 2", "ru": "Writing Task 2"}, "Band 7.0": {"uz": "Ball 7.0", "ru": "Балл 7.0"}, "Math drill 9": {"uz": "Matematika mashqi 9", "ru": "Тренировка по математике 9"}, "Reflection: memory": {"uz": "Mulohaza: xotira", "ru": "Рефлексия: память"}, "Lesson 6 notes": {"uz": "6-dars konspekti", "ru": "Конспект урока 6"}, "Checked by the course": {"uz": "Kurs tomonidan tekshirildi", "ru": "Проверено курсом"}, "Kamila has reopened Listening test 2 until Friday, so he can still hand it in.": {"uz": "Kamila Listening 2-testni juma kunigacha qayta ochdi, u hali topshirishi mumkin.", "ru": "Камила снова открыла тест 2 по аудированию до пятницы, так что он ещё может его сдать."}, "Practice tests and graded work, September": {"uz": "Sinov testlari va baholangan ishlar, sentabr", "ru": "Пробные тесты и оценённые работы, сентябрь"}, "Average across all practice": {"uz": "Barcha mashqlar bo‘yicha o‘rtacha", "ru": "Среднее по всем тестам"}, "Average 1545 · best 1570 (real test)": {"uz": "O‘rtacha 1545 · eng yaxshisi 1570 (haqiqiy imtihon)", "ru": "В среднем 1545 · лучший 1570 (реальный экзамен)"}, "AP Calculus quizzes": {"uz": "AP Calculus testlari", "ru": "Тесты AP Calculus"}, "8 quizzes": {"uz": "8 ta test", "ru": "8 тестов"}, "IELTS mocks": {"uz": "IELTS sinov imtihonlari", "ru": "Пробные IELTS"}, "Average band 7.5 · target 8.0": {"uz": "O‘rtacha ball 7.5 · maqsad 8.0", "ru": "Средний балл 7.5 · цель 8.0"}, "Psychology": {"uz": "Psixologiya", "ru": "Психология"}, "3 graded pieces": {"uz": "3 ta baholangan ish", "ru": "3 оценённые работы"}, "Official results": {"uz": "Rasmiy natijalar", "ru": "Официальные результаты"}, "SAT 1570 of 1600": {"uz": "SAT: 1570 / 1600", "ru": "SAT: 1570 из 1600"}, "Inside Harvard's typical range (1500–1580)": {"uz": "Harvard uchun odatiy oraliqda (1500–1580)", "ru": "В типичном диапазоне Гарварда (1500–1580)"}, "Top 1%": {"uz": "Eng yaxshi 1%", "ru": "Лучшие 1%"}, "IELTS 7.5 of 9": {"uz": "IELTS: 7.5 / 9", "ru": "IELTS: 7.5 из 9"}, "June 2026": {"uz": "2026-yil iyun", "ru": "Июнь 2026"}, "Retake Dec": {"uz": "Dekabrda qayta", "ru": "Пересдача в дек."}, "AP average 5.0 of 5": {"uz": "AP o‘rtachasi: 5.0 / 5", "ru": "Средний AP: 5.0 из 5"}, "Top mark": {"uz": "Eng yuqori baho", "ru": "Высший балл"}, "Live lessons in September": {"uz": "Sentabrdagi jonli darslar", "ru": "Живые уроки в сентябре"}, "Attended": {"uz": "Qatnashdi", "ru": "Посетил"}, "Watched later": {"uz": "Keyin ko‘rdi", "ru": "Посмотрел позже"}, "Recent lessons": {"uz": "So‘nggi darslar", "ru": "Последние уроки"}, "Live SAT course · lesson 11": {"uz": "Jonli SAT kursi · 11-dars", "ru": "Живой курс SAT · урок 11"}, "Live SAT course · lesson 10": {"uz": "Jonli SAT kursi · 10-dars", "ru": "Живой курс SAT · урок 10"}, "Live SAT course · lesson 8": {"uz": "Jonli SAT kursi · 8-dars", "ru": "Живой курс SAT · урок 8"}, "Today 17:00 · Aziza Karimova": {"uz": "Bugun 17:00 · Aziza Karimova", "ru": "Сегодня 17:00 · Азиза Каримова"}, "IELTS speaking club": {"uz": "IELTS speaking klubi", "ru": "Разговорный клуб IELTS"}, "Monday 18:00 · Kamila Saidova": {"uz": "Dushanba 18:00 · Kamila Saidova", "ru": "Понедельник 18:00 · Камила Саидова"}, "Live admission: MIT essays": {"uz": "Jonli qabul sessiyasi: MIT inshollari", "ru": "Живая сессия: эссе для MIT"}, "Saturday 11:00 · Admissions team": {"uz": "Shanba 11:00 · Qabul jamoasi", "ru": "Суббота 11:00 · Команда по поступлению"}, "Last Wednesday": {"uz": "O‘tgan chorshanba", "ru": "В прошлую среду"}, "14 September · watched the recording": {"uz": "14-sentabr · yozuvini ko‘rdi", "ru": "14 сентября · посмотрел запись"}, "Recording": {"uz": "Yozuv", "ru": "Запись"}, "Tests, results and applications": {"uz": "Imtihonlar, natijalar va arizalar", "ru": "Экзамены, результаты и заявки"}, "Next weeks": {"uz": "Keyingi haftalar", "ru": "Следующие недели"}, "Later": {"uz": "Keyinroq", "ru": "Позже"}, "Ask for recommendations": {"uz": "Tavsiyanoma so‘rash", "ru": "Попросить рекомендации"}, "Two teachers, for MIT": {"uz": "Ikki ustozdan, MIT uchun", "ru": "У двух учителей, для MIT"}, "MIT Early Action": {"uz": "MIT Early Action", "ru": "MIT Early Action"}, "Purdue Early Action": {"uz": "Purdue Early Action", "ru": "Purdue Early Action"}, "4 of 6 steps done": {"uz": "6 bosqichdan 4 tasi bajarildi", "ru": "Выполнено 4 из 6 шагов"}, "Harvard Regular Decision": {"uz": "Harvard Regular Decision", "ru": "Гарвард, Regular Decision"}, "Essay in review with Kamila": {"uz": "Insho Kamilada tekshiruvda", "ru": "Эссе на проверке у Камилы"}, "Add all to my calendar": {"uz": "Hammasini taqvimga qo‘shish", "ru": "Добавить всё в календарь"}, "All deadlines added to your calendar": {"uz": "Barcha muddatlar taqvimingizga qo‘shildi", "ru": "Все сроки добавлены в ваш календарь"}, "Readiness for his main goal": {"uz": "Asosiy maqsadga tayyorgarlik", "ru": "Готовность к главной цели"}, "20% closer since June": {"uz": "Iyundan beri 20% yaqinlashdi", "ru": "С июня ближе на 20%"}, "MIT-ready": {"uz": "MITga tayyor", "ru": "Готов к MIT"}, "Universities on his road": {"uz": "Yo‘lidagi universitetlar", "ru": "Университеты на его пути"}, "Purdue · reached": {"uz": "Purdue · erishildi", "ru": "Purdue · достигнут"}, "Ready to apply · Early Action, 1 Nov": {"uz": "Topshirishga tayyor · Early Action, 1-noyabr", "ru": "Готов подавать · Early Action, 1 ноября"}, "Harvard · 70% of the way": {"uz": "Harvard · yo‘lning 70 foizi", "ru": "Гарвард · пройдено 70% пути"}, "Next milestone · Regular Decision, 1 Jan": {"uz": "Keyingi bosqich · Regular Decision, 1-yanvar", "ru": "Следующий этап · Regular Decision, 1 января"}, "MIT · 61% ready": {"uz": "MIT · 61% tayyor", "ru": "MIT · готовность 61%"}, "Main goal · Early Action, 1 Nov": {"uz": "Asosiy maqsad · Early Action, 1-noyabr", "ru": "Главная цель · Early Action, 1 ноября"}, "What moves him closer": {"uz": "Maqsadga nima yaqinlashtiradi", "ru": "Что приближает его к цели"}, "SAT 1570": {"uz": "SAT 1570", "ru": "SAT 1570"}, "Done in August": {"uz": "Avgustda bajarildi", "ru": "Сделано в августе"}, "Harvard essay draft": {"uz": "Harvard inshosi qoralamasi", "ru": "Черновик эссе для Гарварда"}, "Reviewed today": {"uz": "Bugun tekshirildi", "ru": "Проверено сегодня"}, "Retake in December": {"uz": "Dekabrda qayta topshiradi", "ru": "Пересдача в декабре"}, "Two teacher recommendations": {"uz": "Ikki ustozning tavsiyanomasi", "ru": "Две рекомендации учителей"}, "Ask by 15 October": {"uz": "15-oktabrgacha so‘rash kerak", "ru": "Попросить до 15 октября"}, "May": {"uz": "May", "ru": "Май"}, "Jun": {"uz": "Iyun", "ru": "Июн"}, "Jul": {"uz": "Iyul", "ru": "Июл"}, "Aug": {"uz": "Avg", "ru": "Авг"}, "Sep": {"uz": "Sen", "ru": "Сен"}, "Oct": {"uz": "Okt", "ru": "Окт"}, "Nov": {"uz": "Noy", "ru": "Ноя"}, "Jan": {"uz": "Yan", "ru": "Янв"}, "Now": {"uz": "Hozir", "ru": "Сейчас"}, "June": {"uz": "Iyun", "ru": "Июнь"}, "July": {"uz": "Iyul", "ru": "Июль"}, "August": {"uz": "Avgust", "ru": "Август"}, "September": {"uz": "Sentabr", "ru": "Сентябрь"}, "His teachers and the admissions team": {"uz": "Ustozlari va qabul jamoasi", "ru": "Учителя и команда по поступлению"}, "Book a parent meeting": {"uz": "Ota-onalar uchrashuviga yozilish", "ru": "Записаться на встречу для родителей"}, "15 minutes with the admissions team, online or in the office": {"uz": "Qabul jamoasi bilan 15 daqiqa, onlayn yoki ofisda", "ru": "15 минут с командой по поступлению, онлайн или в офисе"}, "Book": {"uz": "Yozilish", "ru": "Записаться"}, "Request sent. The team will confirm a time today.": {"uz": "So‘rov yuborildi. Jamoa bugun vaqtni tasdiqlaydi.", "ru": "Заявка отправлена. Команда подтвердит время сегодня."}, "Admissions team": {"uz": "Qabul jamoasi", "ru": "Команда по поступлению"}, "Your coordinator · Malika": {"uz": "Koordinatoringiz · Malika", "ru": "Ваш координатор · Малика"}, "Good evening, Rustam aka. Oqil's MIT checklist is on schedule: 3 of 7 steps are done. Next are the two teacher recommendations.": {"uz": "Xayrli kech, Rustam aka. Oqilning MIT bo‘yicha ro‘yxati reja asosida ketyapti: 7 bosqichdan 3 tasi bajarildi. Keyingisi ikki ustozning tavsiyanomalari.", "ru": "Добрый вечер, Рустам ака. Чек-лист Окила по MIT идёт по плану: выполнено 3 из 7 шагов. Дальше две рекомендации от учителей."}, "IELTS teacher": {"uz": "IELTS ustozi", "ru": "Учитель IELTS"}, "SAT teacher": {"uz": "SAT ustozi", "ru": "Учитель SAT"}, "I reviewed Oqil's Harvard essay. The opening is excellent. He now needs one real moment with his grandmother instead of a general statement. I've also reopened Listening test 2 until Friday.": {"uz": "Oqilning Harvard inshosini ko‘rib chiqdim. Kirish qismi a’lo. Endi umumiy fikr o‘rniga buvisi bilan bog‘liq bitta haqiqiy lahzani yozishi kerak. Listening 2-testni ham juma kunigacha qayta ochib qo‘ydim.", "ru": "Я проверила эссе Окила для Гарварда. Начало отличное. Теперь ему нужен один настоящий момент с бабушкой вместо общих слов. Тест 2 по аудированию я тоже снова открыла до пятницы."}, "Oqil scored 790 in math on this week's practice set. Reading is the part we keep polishing.": {"uz": "Oqil bu haftalik mashqda matematikadan 790 ball oldi. Reading ustida ishlashni davom ettiryapmiz.", "ru": "Окил набрал 790 по математике в пробном тесте на этой неделе. Над чтением продолжаем работать."}, "Thank you, Aziza opa. Is there anything we can do at home?": {"uz": "Rahmat, Aziza opa. Uyda biz nima qila olamiz?", "ru": "Спасибо, Азиза опа. Можем ли мы чем-то помочь дома?"}, "Twenty minutes of English reading before bed makes a real difference. Any book he enjoys.": {"uz": "Uxlashdan oldin 20 daqiqa inglizcha kitob o‘qish katta farq qiladi. O‘ziga yoqqan istalgan kitob bo‘laveradi.", "ru": "Двадцать минут чтения на английском перед сном дают заметный результат. Подойдёт любая книга, которая ему нравится."}, "Weekly reports": {"uz": "Haftalik hisobotlar", "ru": "Еженедельные отчёты"}, "Your weekly report is ready. Oqil studied 9 h 30 min, finished 41 of 47 tasks and attended every live lesson.": {"uz": "Haftalik hisobotingiz tayyor. Oqil 9 soat 30 daqiqa o‘qidi, 47 ta vazifadan 41 tasini bajardi va barcha jonli darslarda qatnashdi.", "ru": "Ваш еженедельный отчёт готов. Окил занимался 9 ч 30 мин, выполнил 41 из 47 заданий и посетил все живые уроки."}, "1 h": {"uz": "1 soat", "ru": "1 ч"}, "2 h": {"uz": "2 soat", "ru": "2 ч"}, "Write a message": {"uz": "Xabar yozing", "ru": "Напишите сообщение"}, "Message": {"uz": "Xabar", "ru": "Сообщение"}, "Send": {"uz": "Yuborish", "ru": "Отправить"}, "Conversation": {"uz": "Suhbat", "ru": "Переписка"}, "Parent · +998 90 123 45 67": {"uz": "Ota-ona · +998 90 123 45 67", "ru": "Родитель · +998 90 123 45 67"}, "Edit profile": {"uz": "Profilni tahrirlash", "ru": "Редактировать профиль"}, "Profile editing opens here": {"uz": "Profil shu yerda tahrirlanadi", "ru": "Здесь открывается редактирование профиля"}, "Current plan": {"uz": "Joriy tarif", "ru": "Текущий тариф"}, "a month": {"uz": "oyiga", "ru": "в месяц"}, "a month, billed yearly": {"uz": "oyiga, yiliga bir marta to‘lanadi", "ru": "в месяц, оплата раз в год"}, "Ends Mon, 28 September": {"uz": "28-sentabr, dushanba kuni tugaydi", "ru": "Заканчивается в пн, 28 сентября"}, "5 days left": {"uz": "5 kun qoldi", "ru": "Осталось 5 дней"}, "Renew": {"uz": "Uzaytirish", "ru": "Продлить"}, "Manage": {"uz": "Boshqarish", "ru": "Управление"}, "Receipt": {"uz": "Chek", "ru": "Чек"}, "Receipt sent to your Telegram": {"uz": "Chek Telegramingizga yuborildi", "ru": "Чек отправлен вам в Telegram"}, "Plan settings open here": {"uz": "Tarif sozlamalari shu yerda ochiladi", "ru": "Здесь открываются настройки тарифа"}, "Renews 23 September 2027": {"uz": "23.09.2027 da uzaytiriladi", "ru": "Продление 23.09.2027"}, "Renews 23 October": {"uz": "23-oktabrda uzaytiriladi", "ru": "Продление 23 октября"}, "Renews Wed, 28 October": {"uz": "28-oktabr, chorshanba kuni uzaytiriladi", "ru": "Продление в ср, 28 октября"}, "Paid": {"uz": "To‘langan", "ru": "Оплачено"}, "VIP · his own admissions team": {"uz": "VIP · shaxsiy qabul jamoasi", "ru": "VIP · своя команда по поступлению"}, "Weekly 1:1 mentor, unlimited essay reviews and mock interviews with alumni.": {"uz": "Har hafta mentor bilan yakkama-yakka, cheksiz insho tekshiruvi va bitiruvchilar bilan sinov suhbatlari.", "ru": "Ментор один на один каждую неделю, проверка эссе без ограничений и пробные собеседования с выпускниками."}, "Payment method": {"uz": "To‘lov usuli", "ru": "Способ оплаты"}, "Add": {"uz": "Qo‘shish", "ru": "Добавить"}, "Add Click, Payme, Humo or Visa": {"uz": "Click, Payme, Humo yoki Visa qo‘shing", "ru": "Добавьте Click, Payme, Humo или Visa"}, "Expires 08/28": {"uz": "Amal qilish muddati 08/28", "ru": "Действует до 08/28"}, "Default": {"uz": "Asosiy", "ru": "Основная"}, "Billing history": {"uz": "To‘lovlar tarixi", "ru": "История платежей"}, "Premium · month": {"uz": "Premium · 1 oy", "ru": "Premium · 1 месяц"}, "VIP · month": {"uz": "VIP · 1 oy", "ru": "VIP · 1 месяц"}, "VIP · year": {"uz": "VIP · 1 yil", "ru": "VIP · 1 год"}, "23 Sep 2026 · Paid": {"uz": "23.09.2026 · To‘langan", "ru": "23.09.2026 · Оплачено"}, "28 Aug 2026 · Paid": {"uz": "28.08.2026 · To‘langan", "ru": "28.08.2026 · Оплачено"}, "28 Jul 2026 · Paid": {"uz": "28.07.2026 · To‘langan", "ru": "28.07.2026 · Оплачено"}, "28 Jun 2026 · Paid": {"uz": "28.06.2026 · To‘langan", "ru": "28.06.2026 · Оплачено"}, "Download receipt": {"uz": "Chekni yuklab olish", "ru": "Скачать чек"}, "Receipt downloaded": {"uz": "Chek yuklab olindi", "ru": "Чек скачан"}, "Children": {"uz": "Farzandlar", "ru": "Дети"}, "Premium · College applicant": {"uz": "Premium · Abituriyent", "ru": "Premium · Абитуриент"}, "VIP · College applicant": {"uz": "VIP · Abituriyent", "ru": "VIP · Абитуриент"}, "Add another child": {"uz": "Yana farzand qo‘shish", "ru": "Добавить ещё ребёнка"}, "Connect a brother or sister's account": {"uz": "Aka-uka yoki opa-singilning hisobini ulang", "ru": "Подключите аккаунт брата или сестры"}, "Invite link copied. Send it to your child to connect their account.": {"uz": "Taklif havolasi nusxalandi. Hisobini ulash uchun uni farzandingizga yuboring.", "ru": "Ссылка-приглашение скопирована. Отправьте её ребёнку, чтобы подключить его аккаунт."}, "Notifications": {"uz": "Bildirishnomalar", "ru": "Уведомления"}, "Weekly report in Telegram": {"uz": "Telegramda haftalik hisobot", "ru": "Еженедельный отчёт в Telegram"}, "Every Sunday at 10:00": {"uz": "Har yakshanba soat 10:00 da", "ru": "Каждое воскресенье в 10:00"}, "Deadlines and test dates": {"uz": "Muddatlar va imtihon sanalari", "ru": "Сроки и даты экзаменов"}, "Three days before, and on the day": {"uz": "Uch kun oldin va o‘sha kuni", "ru": "За три дня и в сам день"}, "Needs attention alerts": {"uz": "E’tibor talab qiladigan holatlar", "ru": "Оповещения о проблемах"}, "Missed homework or a broken streak": {"uz": "Topshirilmagan uy vazifasi yoki uzilgan ketma-ketlik", "ru": "Несданное задание или прерванная серия"}, "Events and results": {"uz": "Tadbirlar va natijalar", "ru": "Мероприятия и результаты"}, "When Oqil takes part in something": {"uz": "Oqil biror tadbirda qatnashganda", "ru": "Когда Окил в чём-то участвует"}, "Daily note from Jamol": {"uz": "Jamoldan kunlik xabar", "ru": "Ежедневное сообщение от Жамола"}, "One short message each evening": {"uz": "Har kuni kechqurun bitta qisqa xabar", "ru": "Одно короткое сообщение каждый вечер"}, "Text size": {"uz": "Matn o‘lchami", "ru": "Размер текста"}, "Larger text on every screen": {"uz": "Barcha ekranlarda kattaroq matn", "ru": "Крупный текст на всех экранах"}, "Standard": {"uz": "Oddiy", "ru": "Обычный"}, "Large": {"uz": "Katta", "ru": "Крупный"}, "Language": {"uz": "Til", "ru": "Язык"}, "Choose the language of the app": {"uz": "Ilova tilini tanlang", "ru": "Выберите язык приложения"}, "Help and support": {"uz": "Yordam", "ru": "Помощь и поддержка"}, "Write to the admissions team": {"uz": "Qabul jamoasiga yozing", "ru": "Напишите команде по поступлению"}, "Log out": {"uz": "Chiqish", "ru": "Выйти"}, "Log out is disabled in the preview": {"uz": "Namunada chiqish o‘chirilgan", "ru": "В демо-версии выход отключён"}, "We are halfway through his MIT application. I would hate for Oqil to lose momentum now.": {"uz": "MITga hujjat tayyorlashning yarmiga yetdik. Oqil hozir sur’atini yo‘qotib qo‘yishini aslo istamayman.", "ru": "Мы на полпути к подаче в MIT. Мне бы очень не хотелось, чтобы Окил сейчас сбавил темп."}, "Oqil's Premium ends in 5 days": {"uz": "Oqilning Premium obunasi 5 kundan keyin tugaydi", "ru": "Premium Окила закончится через 5 дней"}, "On Monday, 28 September, these pause for him:": {"uz": "28-sentabr, dushanbadan boshlab quyidagilar to‘xtaydi:", "ru": "С понедельника, 28 сентября, для него приостановится:"}, "Live SAT and IELTS courses": {"uz": "Jonli SAT va IELTS kurslari", "ru": "Живые курсы SAT и IELTS"}, "His IELTS mock test is on Saturday": {"uz": "Shanba kuni IELTS sinov imtihoni bor", "ru": "В субботу у него пробный IELTS"}, "Essay reviews by teachers": {"uz": "Ustozlarning insho tekshiruvi", "ru": "Проверка эссе учителями"}, "Kamila is mid-way through his Harvard essay": {"uz": "Kamila uning Harvard inshosini tekshiryapti", "ru": "Камила сейчас проверяет его эссе для Гарварда"}, "Application tracker": {"uz": "Arizalar kuzatuvi", "ru": "Трекер заявок"}, "MIT, Harvard and Purdue checklists": {"uz": "MIT, Harvard va Purdue ro‘yxatlari", "ru": "Чек-листы MIT, Гарварда и Purdue"}, "Ask Jamol without limits": {"uz": "Jamolga cheksiz savol berish", "ru": "Вопросы Жамолу без ограничений"}, "Not included in the free plan": {"uz": "Bepul tarifda mavjud emas", "ru": "Нет в бесплатном тарифе"}, "Renew Premium · $22.90 a month": {"uz": "Premiumni uzaytirish · oyiga $22.90", "ru": "Продлить Premium · $22.90 в месяц"}, "See what VIP adds": {"uz": "VIP nima beradi?", "ru": "Что даёт VIP"}, "Uzcard •••• 4417. Cancel any time.": {"uz": "Uzcard •••• 4417. Istalgan vaqtda bekor qilish mumkin.", "ru": "Uzcard •••• 4417. Отменить можно в любой момент."}, "Today's championship is exactly the kind of story admissions officers remember. A mentor helps Oqil tell it well.": {"uz": "Bugungi chempionat aynan qabul komissiyasi eslab qoladigan voqea. Mentor Oqilga buni to‘g‘ri hikoya qilishga yordam beradi.", "ru": "Сегодняшний чемпионат как раз из тех историй, которые запоминает приёмная комиссия. Ментор поможет Окилу хорошо её рассказать."}, "For his application season": {"uz": "Hujjat topshirish mavsumi uchun", "ru": "На сезон подачи документов"}, "Give Oqil his own admissions team": {"uz": "Oqilga shaxsiy qabul jamoasini bering", "ru": "Дайте Окилу свою команду по поступлению"}, "Weekly 1:1 mentor sessions": {"uz": "Har hafta mentor bilan yakkama-yakka", "ru": "Еженедельные занятия с ментором один на один"}, "One mentor who knows his MIT and Harvard plans": {"uz": "Uning MIT va Harvard rejalarini biladigan bitta mentor", "ru": "Один ментор, который знает его планы на MIT и Гарвард"}, "Unlimited essay reviews": {"uz": "Cheksiz insho tekshiruvi", "ru": "Проверка эссе без ограничений"}, "Every draft, not two a month": {"uz": "Oyiga ikkitasi emas, har bir qoralama", "ru": "Каждый черновик, а не два в месяц"}, "Mock interviews with alumni": {"uz": "Bitiruvchilar bilan sinov suhbatlari", "ru": "Пробные собеседования с выпускниками"}, "Practice before the real interviews": {"uz": "Haqiqiy suhbatlardan oldin mashq", "ru": "Практика перед настоящими собеседованиями"}, "Priority support": {"uz": "Birinchi navbatdagi yordam", "ru": "Приоритетная поддержка"}, "Plus everything he has in Premium today": {"uz": "Hamda Premiumdagi barcha imkoniyatlar", "ru": "И всё, что есть у него в Premium сейчас"}, "Billing": {"uz": "To‘lov", "ru": "Оплата"}, "Monthly": {"uz": "Oylik", "ru": "Помесячно"}, "Yearly": {"uz": "Yillik", "ru": "На год"}, "/ month": {"uz": "/ oy", "ru": "/ мес."}, "Save 17%": {"uz": "17% tejash", "ru": "Экономия 17%"}, "Upgrade Oqil to VIP": {"uz": "Oqilni VIPga o‘tkazish", "ru": "Перевести Окила на VIP"}, "Just renew Premium": {"uz": "Faqat Premiumni uzaytirish", "ru": "Просто продлить Premium"}, "$399 billed once a year, $10.35 a month more than his Premium today. Uzcard, Humo, Click or Payme. Cancel any time.": {"uz": "Yiliga bir marta $399, hozirgi Premiumdan oyiga $10.35 ko‘proq. Uzcard, Humo, Click yoki Payme. Istalgan vaqtda bekor qilish mumkin.", "ru": "$399 раз в год, на $10.35 в месяц больше его текущего Premium. Uzcard, Humo, Click или Payme. Отменить можно в любой момент."}, "$17 a month more than his Premium today. Uzcard, Humo, Click or Payme. Cancel any time.": {"uz": "Hozirgi Premiumdan oyiga $17 ko‘proq. Uzcard, Humo, Click yoki Payme. Istalgan vaqtda bekor qilish mumkin.", "ru": "На $17 в месяц больше его текущего Premium. Uzcard, Humo, Click или Payme. Отменить можно в любой момент."}, "Payment received": {"uz": "To‘lov qabul qilindi", "ru": "Оплата получена"}, "Oqil's mentor will contact him within 24 hours. You will see every session in your weekly report.": {"uz": "Oqilning mentori 24 soat ichida u bilan bog‘lanadi. Har bir mashg‘ulotni haftalik hisobotda ko‘rasiz.", "ru": "Ментор Окила свяжется с ним в течение 24 часов. Каждое занятие вы увидите в еженедельном отчёте."}, "Premium renewed": {"uz": "Premium uzaytirildi", "ru": "Premium продлён"}, "Nothing pauses. Oqil keeps his courses, essay reviews and tracker until 28 October.": {"uz": "Hech narsa to‘xtamaydi. Oqilning kurslari, insho tekshiruvi va kuzatuvi 28-oktabrgacha saqlanadi.", "ru": "Ничего не остановится. Курсы, проверка эссе и трекер у Окила сохраняются до 28 октября."}, "Today · City Olympiad Center": {"uz": "Bugun · Shahar olimpiada markazi", "ru": "Сегодня · Городской олимпиадный центр"}, "A two-round olympiad for grades 9 to 11. The top ten finishers are invited to the national team camp.": {"uz": "9–11-sinflar uchun ikki bosqichli olimpiada. Eng yaxshi o‘nta ishtirokchi milliy terma jamoa yig‘iniga taklif qilinadi.", "ru": "Олимпиада в два тура для 9–11 классов. Десять лучших участников приглашаются на сборы национальной команды."}, "Round 1 done": {"uz": "1-bosqich yakunlandi", "ru": "1-й тур пройден"}, "Results": {"uz": "Natijalar", "ru": "Результаты"}, "Friday, 25 September": {"uz": "25-sentabr, juma", "ru": "Пятница, 25 сентября"}, "Prize fund": {"uz": "Mukofot jamg‘armasi", "ru": "Призовой фонд"}, "Round 2": {"uz": "2-bosqich", "ru": "2-й тур"}, "If he qualifies": {"uz": "Saralashdan o‘tsa", "ru": "Если пройдёт отбор"}, "Congratulate Oqil": {"uz": "Oqilni tabriklash", "ru": "Поздравить Окила"}, "Remind me about the results": {"uz": "Natijalar haqida eslatish", "ru": "Напомнить о результатах"}, "We will remind you on Friday": {"uz": "Juma kuni eslatamiz", "ru": "Напомним в пятницу"}, "Sent. Oqil will see your note in his app.": {"uz": "Yuborildi. Oqil xabaringizni ilovasida ko‘radi.", "ru": "Отправлено. Окил увидит ваше сообщение в приложении."}, "Gift a membership": {"uz": "Obuna sovg‘a qilish", "ru": "Подарить подписку"}, "For a nephew, a niece or a friend's child. They open it like a real present.": {"uz": "Jiyaningiz yoki do‘stingizning farzandi uchun. Uni haqiqiy sovg‘a kabi ochadi.", "ru": "Для племянника, племянницы или ребёнка друзей. Его открывают как настоящий подарок."}, "Choose a gift": {"uz": "Sovg‘a tanlash", "ru": "Выбрать подарок"}, "Give someone a head start": {"uz": "Yaqinlaringizga imkoniyat sovg‘a qiling", "ru": "Подарите близким возможность"}, "For a nephew, a niece or a friend's child. They open it like a real present and read your letter inside.": {"uz": "Jiyaningiz yoki do‘stingizning farzandi uchun. U sovg‘ani haqiqiy sovg‘a kabi ochadi va ichida sizning xatingizni o‘qiydi.", "ru": "Для племянника, племянницы или ребёнка друзей. Подарок открывают как настоящий, а внутри ждёт ваше письмо."}, "Who is it for?": {"uz": "Kimga?", "ru": "Кому?"}, "Nephew or niece": {"uz": "Jiyan", "ru": "Племянник или племянница"}, "My child": {"uz": "O‘z farzandim", "ru": "Мой ребёнок"}, "A friend's child": {"uz": "Do‘stimning farzandi", "ru": "Ребёнок друзей"}, "Someone else": {"uz": "Boshqa", "ru": "Другое"}, "Their name": {"uz": "Ismi", "ru": "Имя"}, "Phone or Telegram": {"uz": "Telefon yoki Telegram", "ru": "Телефон или Telegram"}, "Membership": {"uz": "Obuna", "ru": "Подписка"}, "Every lesson, at their own pace": {"uz": "Barcha darslar, o‘z sur’atida", "ru": "Все уроки в своём темпе"}, "The full JIA experience": {"uz": "JIA ning barcha imkoniyatlari", "ru": "Все возможности JIA"}, "Their own admissions team": {"uz": "Shaxsiy qabul jamoasi", "ru": "Своя команда по поступлению"}, "How long": {"uz": "Muddati", "ru": "Срок"}, "1 month": {"uz": "1 oy", "ru": "1 месяц"}, "3 months": {"uz": "3 oy", "ru": "3 месяца"}, "6 months": {"uz": "6 oy", "ru": "6 месяцев"}, "12 months": {"uz": "12 oy", "ru": "12 месяцев"}, "Your note": {"uz": "Sizning xatingiz", "ru": "Ваше послание"}, "A few words from you (optional)": {"uz": "Siz tomondan bir necha so‘z (ixtiyoriy)", "ru": "Пара слов от вас (необязательно)"}, "One payment, no auto-renewal": {"uz": "Bir martalik to‘lov, avtomatik uzaytirilmaydi", "ru": "Разовый платёж, без автопродления"}, "Paid with Uzcard •••• 4417.": {"uz": "Uzcard •••• 4417 orqali to‘lanadi.", "ru": "Оплата картой Uzcard •••• 4417."}, "Please enter their name": {"uz": "Iltimos, ismini kiriting", "ru": "Пожалуйста, укажите имя"}, "Gift sent": {"uz": "Sovg‘a yuborildi", "ru": "Подарок отправлен"}, "See how it opens": {"uz": "Qanday ochilishini ko‘rish", "ru": "Посмотреть, как он открывается"}, "Gifts you've sent": {"uz": "Yuborgan sovg‘alaringiz", "ru": "Отправленные подарки"}, "You haven't sent any gifts yet.": {"uz": "Hali sovg‘a yubormagansiz.", "ru": "Вы ещё не отправляли подарков."}, "Sent today · not opened yet": {"uz": "Bugun yuborildi · hali ochilmagan", "ru": "Отправлено сегодня · ещё не открыт"}, "Book a meeting": {"uz": "Uchrashuvga yozilish", "ru": "Записаться на встречу"}, "Search reports, teachers, dates…": {"uz": "Hisobot, ustoz yoki sanani qidiring…", "ru": "Поиск по отчётам, учителям, датам…"}, "Search": {"uz": "Qidiruv", "ru": "Поиск"}, "Search opens here": {"uz": "Qidiruv shu yerda ochiladi", "ru": "Здесь откроется поиск"}, "Parent": {"uz": "Ota-ona", "ru": "Родитель"}, "Sidebar": {"uz": "Yon panel", "ru": "Боковая панель"}, "Quick access": {"uz": "Tezkor o‘tish", "ru": "Быстрый доступ"}, "Weekly report": {"uz": "Haftalik hisobot", "ru": "Еженедельный отчёт"}, "Your weekly report is on its way to your Telegram": {"uz": "Haftalik hisobot Telegramingizga yuborilyapti", "ru": "Еженедельный отчёт уже отправляется вам в Telegram"}, "Settings": {"uz": "Sozlamalar", "ru": "Настройки"}, "Questions?": {"uz": "Savollar bormi?", "ru": "Есть вопросы?"}, "Write to Malika, your coordinator": {"uz": "Koordinatoringiz Malikaga yozing", "ru": "Напишите Малике, вашему координатору"}, "+20% since June": {"uz": "Iyundan beri +20%", "ru": "+20% с июня"}, "One task left": {"uz": "Bitta vazifa qoldi", "ru": "Осталось одно задание"}, "Best so far: 21 days": {"uz": "Rekord: 21 kun", "ru": "Рекорд: 21 день"}, "+2 h 10 min vs last week": {"uz": "O‘tgan haftadan +2 soat 10 daq", "ru": "+2 ч 10 мин к прошлой неделе"}, "Predicted path": {"uz": "Taxminiy yo‘l", "ru": "Прогноз"}, "His progress": {"uz": "Uning natijasi", "ru": "Его прогресс"}, "Harvard is next: 70% of the way. MIT is the main goal.": {"uz": "Keyingisi Harvard: yo‘lning 70 foizi o‘tildi. Asosiy maqsad MIT.", "ru": "Следующий Гарвард: пройдено 70% пути. Главная цель: MIT."}, "Open details": {"uz": "Batafsil ko‘rish", "ru": "Подробнее"}, "Oqil is here": {"uz": "Oqil shu yerda", "ru": "Окил здесь"}, "Oqil Odilov: 61% ready for MIT. Open progress": {"uz": "Oqil Odilov: MITga 61% tayyor. Natijalarni ochish", "ru": "Окил Одилов: готовность к MIT 61%. Открыть прогресс"}, "Readiness for MIT went from 41% in June to 61% now": {"uz": "MITga tayyorgarlik iyundagi 41% dan hozir 61% ga oshdi", "ru": "Готовность к MIT выросла с 41% в июне до 61% сейчас"}, "% MIT": {"uz": "% MIT", "ru": "% MIT"}, "He has studied every day for 12 days": {"uz": "12 kundan beri har kuni o‘qiyapti", "ru": "Занимается каждый день уже 12 дней"}, "Days in a row when he studied": {"uz": "U o‘qigan ketma-ket kunlar", "ru": "Дни подряд, когда он занимался"}, "No study that day": {"uz": "O‘sha kuni o‘qimagan", "ru": "В этот день не занимался"}, "One IELTS homework is missing, one is due tonight": {"uz": "Bitta IELTS vazifasi topshirilmagan, yana biri bugun kechgacha", "ru": "Одно задание IELTS не сдано, ещё одно нужно сдать сегодня"}, "Due tonight": {"uz": "Bugun kechgacha", "ru": "До вечера"}, "Volunteering this summer": {"uz": "Yozgi ko‘ngillilik", "ru": "Волонтёрство летом"}, "Perfect attendance": {"uz": "Bironta darsni qoldirmadi", "ru": "Без единого пропуска"}, "Up 20% since June · Harvard: 6% to go": {"uz": "Iyundan beri +20% · Harvardgacha 6% qoldi", "ru": "С июня +20% · до Гарварда 6%"}, "He is 79% ready for MIT, 20% more than in June. Harvard's level is only 6% away.": {"uz": "U MITga 79% tayyor, iyundagidan 20% ko‘proq. Harvard darajasigacha atigi 6% qoldi.", "ru": "Он готов к MIT на 79%, это на 20% больше, чем в июне. До уровня Гарварда осталось всего 6%."}, "79% ready · deadline 1 November": {"uz": "79% tayyor · muddat 1-noyabr", "ru": "Готовность 79% · срок 1 ноября"}, "6% to go · deadline 1 January": {"uz": "6% qoldi · muddat 1-yanvar", "ru": "Осталось 6% · срок 1 января"}, "Harvard · 6% to go": {"uz": "Harvard · 6% qoldi", "ru": "Гарвард · осталось 6%"}, "MIT · 79% ready": {"uz": "MIT · 79% tayyor", "ru": "MIT · готовность 79%"}, "Harvard is next: 6% to go. MIT is the main goal.": {"uz": "Keyingisi Harvard: 6% qoldi. Asosiy maqsad MIT.", "ru": "Следующий Гарвард: осталось 6%. Главная цель: MIT."}, "Readiness for MIT went from 59% in June to 79% now": {"uz": "MITga tayyorgarlik iyundagi 59% dan hozir 79% ga oshdi", "ru": "Готовность к MIT выросла с 59% в июне до 79% сейчас"}, "Oqil Odilov: 79% ready for MIT. Open progress": {"uz": "Oqil Odilov: MITga 79% tayyor. Natijalarni ochish", "ru": "Окил Одилов: готовность к MIT 79%. Открыть прогресс"}, "28 bricks · +2 h 10 min vs last week": {"uz": "28 g‘isht · o‘tgan haftadan +2 soat 10 daq", "ru": "28 кирпичиков · +2 ч 10 мин к прошлой неделе"}, "Mock Saturday: IELTS": {"uz": "Shanbalik sinov: IELTS", "ru": "Пробная суббота: IELTS"}, "SAT Season finale": {"uz": "SAT mavsumi finali", "ru": "Финал сезона SAT"}, "Live mock test and awards, 18:00": {"uz": "Jonli sinov imtihoni va taqdirlash, 18:00", "ru": "Пробный экзамен в прямом эфире и награждение, 18:00"}, "Bricks today": {"uz": "Bugungi g‘ishtlar", "ru": "Кирпичиков сегодня"}, "Bricks this week": {"uz": "Bu haftadagi g‘ishtlar", "ru": "Кирпичиков за неделю"}, "How it is counted.": {"uz": "Qanday hisoblanadi.", "ru": "Как это считается."}, "Oqil studies in the Study Room in 25 or 50-minute sessions. Every 25 minutes lays one brick of MIT. If he leaves the app during a session, it does not count.": {"uz": "Oqil O‘qish xonasida 25 yoki 50 daqiqalik mashg‘ulotlarda o‘qiydi. Har 25 daqiqa MITning bitta g‘ishtini qo‘yadi. Agar mashg‘ulot vaqtida ilovadan chiqib ketsa, hisoblanmaydi.", "ru": "Окил занимается в Учебной комнате сессиями по 25 или 50 минут. Каждые 25 минут кладут один кирпичик MIT. Если он выходит из приложения во время сессии, она не засчитывается."}, "His study group": {"uz": "O‘quv guruhi", "ru": "Его учебная группа"}, "96 of 120 bricks together this week": {"uz": "Bu hafta birgalikda 120 tadan 96 g‘isht", "ru": "96 из 120 кирпичиков вместе на этой неделе"}, "Four students with the same goal. They can only send each other cheers, never messages.": {"uz": "Maqsadi bir xil to‘rt o‘quvchi. Ular bir-biriga faqat qo‘llab-quvvatlash belgisi yubora oladi, xabar yozolmaydi.", "ru": "Четверо учеников с одной целью. Они могут только подбадривать друг друга, без переписки."}, "Mock Saturday": {"uz": "Shanbalik sinov", "ru": "Пробная суббота"}, "SAT mock · 19 September": {"uz": "SAT sinovi · 19-sentabr", "ru": "Пробный SAT · 19 сентября"}, "Weekly mock test for every student at once": {"uz": "Barcha o‘quvchilar uchun bir vaqtdagi haftalik sinov", "ru": "Еженедельный пробный тест для всех учеников одновременно"}, "Top 18%": {"uz": "Eng yaxshi 18%", "ru": "Лучшие 18%"}, "Verified on Help Desk": {"uz": "Help Deskda tasdiqlangan", "ru": "Подтверждено в Help Desk"}, "SAT Season finisher": {"uz": "SAT mavsumini yakunlovchi", "ru": "Финишёр сезона SAT"}, "19 of 40 SAT bricks · ends 1 November": {"uz": "40 tadan 19 SAT g‘ishti · 1-noyabrda tugaydi", "ru": "19 из 40 кирпичиков SAT · до 1 ноября"}, "Tap an achievement to share it as a proud parent.": {"uz": "Faxrlanib ulashish uchun yutuqni bosing.", "ru": "Нажмите на достижение, чтобы поделиться им с гордостью."}, "Share as a proud parent": {"uz": "Faxrlanib ulashish", "ru": "Поделиться с гордостью"}, "You see Oqil's results, schedule and teacher feedback. His private chats, his journal and his letters to himself stay private.": {"uz": "Siz Oqilning natijalari, jadvali va ustozlarning fikrlarini ko‘rasiz. Uning shaxsiy yozishmalari, kundaligi va o‘ziga yozgan xatlari maxfiy qoladi.", "ru": "Вы видите результаты Окила, расписание и отзывы учителей. Его личные переписки, дневник и письма самому себе остаются закрытыми."}, "Pledge updates": {"uz": "Va’dalar haqida", "ru": "Обещания"}, "When he gets close to your goal or reaches it": {"uz": "U maqsadingizga yaqinlashganda yoki erishganda", "ru": "Когда он близок к вашей цели или достиг её"}, "Pledges": {"uz": "Va’dalar", "ru": "Обещания"}, "Add a pledge": {"uz": "Va’da qo‘shish", "ru": "Добавить обещание"}, "+ Add a pledge": {"uz": "+ Va’da qo‘shish", "ru": "+ Добавить обещание"}, "Promise a real reward for a goal. Oqil sees it on his Home screen.": {"uz": "Maqsad uchun haqiqiy sovg‘a va’da qiling. Oqil uni asosiy ekranida ko‘radi.", "ru": "Пообещайте настоящую награду за цель. Окил увидит её на главном экране."}, "Mom's pledge": {"uz": "Onasining va’dasi", "ru": "Обещание мамы"}, "Your pledge": {"uz": "Sizning va’dangiz", "ru": "Ваше обещание"}, "Dad's pledge": {"uz": "Dadasining va’dasi", "ru": "Обещание папы"}, "By the end of this month": {"uz": "Shu oy oxirigacha", "ru": "До конца месяца"}, "By 31 October": {"uz": "31-oktabrgacha", "ru": "До 31 октября"}, "Reached": {"uz": "Erishdi", "ru": "Достигнуто"}, "Reward given": {"uz": "Sovg‘a berildi", "ru": "Награда вручена"}, "Latest: IELTS 7.5": {"uz": "Oxirgi natija: IELTS 7.5", "ru": "Последний результат: IELTS 7.5"}, "so far": {"uz": "hozircha", "ru": "пока"}, "Oqil reached it. Time for the reward!": {"uz": "Oqil maqsadga erishdi. Sovg‘a vaqti keldi!", "ru": "Окил достиг цели. Время для награды!"}, "Mark as given": {"uz": "Berildi deb belgilash", "ru": "Отметить как врученную"}, "Marked as given. Oqil will see a thank-you from you.": {"uz": "Belgilandi. Oqil sizdan minnatdorlik xabarini ko‘radi.", "ru": "Отмечено. Окил увидит от вас благодарность."}, "Oqil reached your pledge": {"uz": "Oqil va’dangizdagi maqsadga erishdi", "ru": "Окил выполнил ваше обещание"}, "Parent pledge": {"uz": "Ota-ona va’dasi", "ru": "Обещание родителя"}, "Promise a reward for a goal": {"uz": "Maqsad uchun sovg‘a va’da qiling", "ru": "Пообещайте награду за цель"}, "Pick something Oqil can reach by working for it. He sees your pledge on his Home screen, and it fills up as he studies.": {"uz": "Oqil mehnat qilib erisha oladigan maqsadni tanlang. U va’dangizni asosiy ekranida ko‘radi va o‘qigan sari u to‘lib boradi.", "ru": "Выберите цель, которой Окил может достичь своим трудом. Он увидит ваше обещание на главном экране, и шкала будет заполняться по мере учёбы."}, "What should he reach?": {"uz": "Nimaga erishishi kerak?", "ru": "Чего он должен достичь?"}, "Study bricks": {"uz": "O‘qish g‘ishtlari", "ru": "Кирпичики учёбы"}, "Completed tasks": {"uz": "Bajarilgan vazifalar", "ru": "Выполненные задания"}, "A test score": {"uz": "Imtihon natijasi", "ru": "Балл за экзамен"}, "1 brick = 25 minutes of focused study in the Study Room. 100 bricks is about 42 hours.": {"uz": "1 g‘isht = O‘qish xonasida 25 daqiqa diqqat bilan o‘qish. 100 g‘isht taxminan 42 soat.", "ru": "1 кирпичик = 25 минут сосредоточенной учёбы в Учебной комнате. 100 кирпичиков это примерно 42 часа."}, "Tasks from his daily plan.": {"uz": "Kunlik rejasidagi vazifalar.", "ru": "Задания из его ежедневного плана."}, "Days in a row when he studied.": {"uz": "U o‘qigan ketma-ket kunlar.", "ru": "Дни подряд, когда он занимался."}, "Type the test and the score, for example IELTS 8.0.": {"uz": "Imtihon va natijani yozing, masalan IELTS 8.0.", "ru": "Укажите экзамен и балл, например IELTS 8.0."}, "Target": {"uz": "Maqsad", "ru": "Цель"}, "Reward": {"uz": "Sovg‘a", "ru": "Награда"}, "For example, a new bike": {"uz": "Masalan, yangi velosiped", "ru": "Например, новый велосипед"}, "By when": {"uz": "Qachongacha", "ru": "К какому сроку"}, "Oqil will see": {"uz": "Oqil ko‘radi", "ru": "Окил увидит"}, "Save pledge": {"uz": "Va’dani saqlash", "ru": "Сохранить обещание"}, "You give the reward yourself. We let you know the moment he reaches the goal.": {"uz": "Sovg‘ani o‘zingiz berasiz. U maqsadga erishgan zahoti sizga xabar beramiz.", "ru": "Награду вы вручаете сами. Мы сообщим, как только он достигнет цели."}, "Please add a target and a reward": {"uz": "Iltimos, maqsad va sovg‘ani yozing", "ru": "Пожалуйста, укажите цель и награду"}, "Saved. Oqil will see it on his Home screen.": {"uz": "Saqlandi. Oqil uni asosiy ekranida ko‘radi.", "ru": "Сохранено. Окил увидит это на главном экране."}, "Family check": {"uz": "Oila so‘rovnomasi", "ru": "Семейная анкета"}, "Your answers for his plan": {"uz": "Uning rejasi uchun javoblaringiz", "ru": "Ваши ответы для его плана"}, "Answered on 12 September · budget, loans, study buddy": {"uz": "12-sentabrda javob berilgan · byudjet, kredit, o‘quv sherigi", "ru": "Заполнено 12 сентября · бюджет, кредит, напарник по учёбе"}, "Updated today · budget, loans, study buddy": {"uz": "Bugun yangilandi · byudjet, kredit, o‘quv sherigi", "ru": "Обновлено сегодня · бюджет, кредит, напарник по учёбе"}, "Five questions that shape Oqil's university plan. Only you and his counselor see these answers.": {"uz": "Oqilning universitet rejasini belgilaydigan beshta savol. Bu javoblarni faqat siz va uning maslahatchisi ko‘radi.", "ru": "Пять вопросов, от которых зависит план поступления Окила. Ответы видите только вы и его консультант."}, "Budget per year for university": {"uz": "Universitet uchun yillik byudjet", "ru": "Бюджет на университет в год"}, "Amount": {"uz": "Summa", "ru": "Сумма"}, "Currency": {"uz": "Valyuta", "ru": "Валюта"}, "Savings set aside for his education": {"uz": "Ta’limi uchun jamg‘arma", "ru": "Сбережения на его образование"}, "None": {"uz": "Yo‘q", "ru": "Нет"}, "Under $10,000": {"uz": "$10 000 dan kam", "ru": "Меньше $10 000"}, "$10,000 to $50,000": {"uz": "$10 000 – $50 000", "ru": "$10 000 – $50 000"}, "$50,000 to $150,000": {"uz": "$50 000 – $150 000", "ru": "$50 000 – $150 000"}, "Over $150,000": {"uz": "$150 000 dan ko‘p", "ru": "Больше $150 000"}, "Prefer not to say": {"uz": "Aytmayman", "ru": "Предпочитаю не говорить"}, "Can you document your income?": {"uz": "Daromadingizni hujjat bilan tasdiqlay olasizmi?", "ru": "Можете подтвердить доход документами?"}, "Yes": {"uz": "Ha", "ru": "Да"}, "Partly": {"uz": "Qisman", "ru": "Частично"}, "No": {"uz": "Yo‘q", "ru": "Нет"}, "Not sure": {"uz": "Bilmayman", "ru": "Не уверен"}, "Would you take an education loan?": {"uz": "Ta’lim krediti olarmidingiz?", "ru": "Возьмёте ли вы кредит на обучение?"}, "Maybe": {"uz": "Balki", "ru": "Возможно"}, "How do you feel about his plan?": {"uz": "Uning rejasiga qanday qaraysiz?", "ru": "Как вы относитесь к его плану?"}, "Fully supportive": {"uz": "To‘liq qo‘llab-quvvatlayman", "ru": "Полностью поддерживаю"}, "Supportive, with conditions": {"uz": "Shartlar bilan qo‘llab-quvvatlayman", "ru": "Поддерживаю, с условиями"}, "Hesitant": {"uz": "Ikkilanaman", "ru": "Сомневаюсь"}, "Against it": {"uz": "Qarshiman", "ru": "Против"}, "Study buddy": {"uz": "O‘quv sherigi", "ru": "Напарник по учёбе"}, "Anyone": {"uz": "Har kim", "ru": "Любой"}, "Same gender only": {"uz": "Faqat o‘z jinsidan", "ru": "Только того же пола"}, "Jamals Global matches Oqil with a study buddy and a small study group. The group can only send cheers, never messages.": {"uz": "Jamals Global Oqilga o‘quv sherigi va kichik o‘quv guruhini tanlab beradi. Guruh faqat qo‘llab-quvvatlash belgisi yubora oladi, xabar yozolmaydi.", "ru": "Jamals Global подбирает Окилу напарника и небольшую учебную группу. Группа может только подбадривать, без переписки."}, "Save answers": {"uz": "Javoblarni saqlash", "ru": "Сохранить ответы"}, "Never shown to other students or used to rank him.": {"uz": "Boshqa o‘quvchilarga ko‘rsatilmaydi va reyting uchun ishlatilmaydi.", "ru": "Никогда не показывается другим ученикам и не влияет на рейтинги."}, "Saved. Oqil's roadmap now uses your answers.": {"uz": "Saqlandi. Oqilning yo‘l xaritasi endi javoblaringizdan foydalanadi.", "ru": "Сохранено. План Окила теперь учитывает ваши ответы."}, "Proud parent card": {"uz": "Faxrli ota-ona kartasi", "ru": "Карточка гордого родителя"}, "Share Oqil's moment": {"uz": "Oqilning yutug‘ini ulashing", "ru": "Поделитесь успехом Окила"}, "Proud of Oqil": {"uz": "Oqil bilan faxrlanaman", "ru": "Горжусь Окилом"}, "Telegram": {"uz": "Telegram", "ru": "Telegram"}, "Instagram": {"uz": "Instagram", "ru": "Instagram"}, "Save image": {"uz": "Rasmni saqlash", "ru": "Сохранить картинку"}, "Opening Telegram": {"uz": "Telegram ochilyapti", "ru": "Открываем Telegram"}, "Opening Instagram": {"uz": "Instagram ochilyapti", "ru": "Открываем Instagram"}, "Image saved": {"uz": "Rasm saqlandi", "ru": "Картинка сохранена"}, "Only this achievement is shared, nothing else about Oqil.": {"uz": "Faqat shu yutuq ulashiladi, Oqil haqida boshqa hech narsa emas.", "ru": "Публикуется только это достижение, больше ничего об Окиле."}, "He is building MIT": {"uz": "U MITni qurmoqda", "ru": "Он строит MIT"}, "Every 25 minutes of focused study lays one brick": {"uz": "Har 25 daqiqalik diqqat bilan o‘qish bitta g‘isht qo‘yadi", "ru": "Каждые 25 минут сосредоточенной учёбы кладут один кирпичик"}, "bricks": {"uz": "g‘isht", "ru": "кирпичиков"}, "This week: 28 bricks": {"uz": "Bu hafta: 28 g‘isht", "ru": "За неделю: 28 кирпичиков"}, "Photo: Beyond My Ken, Wikimedia Commons": {"uz": "Surat: Beyond My Ken, Wikimedia Commons", "ru": "Фото: Beyond My Ken, Wikimedia Commons"}, "MIT: 143 of 600 bricks built": {"uz": "MIT: 600 tadan 143 g‘isht qo‘yildi", "ru": "MIT: построено 143 из 600 кирпичиков"}};
  var PATTERNS = [["^(\\+?)(\\d+) h (\\d+) min$", {"uz": "$1$2 soat $3 daq", "ru": "$1$2 ч $3 мин"}], ["^(\\d+) of (\\d+)$", {"uz": "$1 / $2", "ru": "$1 из $2"}], ["^of (\\d+)$", {"uz": "/ $1", "ru": "из $1"}], ["^Update (\\d+) of (\\d+)$", {"uz": "$2 ta xabardan $1-si", "ru": "Сообщение $1 из $2"}], ["^W(\\d+)$", {"uz": "H$1", "ru": "Н$1"}], ["^(\\d+) study bricks$", {"uz": "$1 ta o‘qish g‘ishti", "ru": "$1 кирпичиков учёбы"}], ["^(\\d+) completed tasks$", {"uz": "$1 ta bajarilgan vazifa", "ru": "$1 выполненных заданий"}], ["^(\\d+) days in a row$", {"uz": "Ketma-ket $1 kun", "ru": "$1 дней подряд"}], ["^A score of (.+)$", {"uz": "$1 natija", "ru": "Результат $1"}], ["^(\\d+) days left$", {"uz": "$1 kun qoldi", "ru": "Осталось $1 дн."}], ["^(Pro|Premium|VIP) · (1) month$", {"uz": "$1 · $2 oy", "ru": "$1 · $2 месяц"}], ["^(Pro|Premium|VIP) · (3) months$", {"uz": "$1 · $2 oy", "ru": "$1 · $2 месяца"}], ["^(Pro|Premium|VIP) · (6|12) months$", {"uz": "$1 · $2 oy", "ru": "$1 · $2 месяцев"}], ["^Pay \\$(\\S+) and send$", {"uz": "$$1 to‘lash va yuborish", "ru": "Оплатить $$1 и отправить"}], ["^Gift sent to (.+)$", {"uz": "$1 uchun sovg‘a yuborildi", "ru": "Подарок для $1 отправлен"}], ["^(.+) will get a message with the gift\\. They open it with three taps and read your letter inside\\.$", {"uz": "$1 sovg‘a haqida xabar oladi. Uni uch marta bosib ochadi va ichidagi xatingizni o‘qiydi.", "ru": "$1 получит сообщение с подарком. Его открывают тремя касаниями, а внутри ждёт ваше письмо."}]];
  var JGC = window.JG_BOOT && window.JG_BOOT.child || null; if (JGC){ DICT = JSON.parse(JSON.stringify(DICT).replace(/‘/g, 'ʻ')); PATTERNS = JSON.parse(JSON.stringify(PATTERNS).replace(/‘/g, 'ʻ')); } /* JG-PROD: the linked child's own figures (src/server/parent/view.ts); null on demo accounts, /preview and with ENGINE_LIVE off; owner 7 Oct P5int, the controller's ruling: a real family reads Uzbek oʻ/gʻ in U+02BB (ʻ), not the design's U+2018; the demo keeps the design's text, so it stays the artifact's (fidelity) */
  if (JGC && window.JG_BOOT.patterns) PATTERNS = window.JG_BOOT.patterns.concat(PATTERNS); /* JG-PROD: uz/ru for the sentences that carry live numbers (spec §5.3 D), tried before the design's own */
  var LANG = 'uz';
  try { var q = new URLSearchParams(location.search).get('lang'); var s0 = localStorage.getItem('jg.parent.lang'); LANG = q || s0 || 'uz'; } catch (e) {}
  if (!/^(uz|ru|en)$/.test(LANG)) LANG = 'uz';
  function trDesign(s){ /* JG-PROD: live names through the designed dictionary (was tr; tr below wraps it) */
    if (LANG === 'en' || s == null) return s;
    var m = String(s).match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2];
    if (!core) return s;
    var d = DICT[core];
    if (d && d[LANG] != null) return m[1] + d[LANG] + m[3];
    for (var i = 0; i < PATTERNS.length; i++){
      var p = PATTERNS[i], re = new RegExp(p[0]), mm = core.match(re);
      if (mm){ var out = p[1][LANG]; if (out == null) break; return m[1] + out.replace(/\$(\d)/g, function(_, n){ return mm[+n]; }) + m[3]; }
    }
    return s;
  }
  /* JG-PROD: live names through the designed dictionary. DICT and PATTERNS stay exactly as designed, and they are
     written about the design's own family (FAMILY: the child, then the parent, as DICT spells them in English and in
     Russian). tr() looks a text up with the linked child's and the signed-in parent's names turned back into the
     design's, then puts the live names into the translation, so every designed sentence stays, Uzbek suffixes
     included (-ning, -ga, -ni). A Russian case ending on the design's Cyrillic first name goes with it: it cannot
     attach to the live name. A name that is the design's own keeps the designed spelling, Russian included. */
  var FAMILY = [['Oqil Odilov', 'Окил Одилов', JG_CHILD], ['Rustam Odilov', 'Рустам Одилов', JG_ME]];
  var NAME_CH = '\\p{L}\\p{M}\\p{N}', TO_DESIGN = {}, LIVE = [], FWD = [];
  function reEsc(t){ return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function firstOf(n){ return n.split(' ')[0]; }
  function liveOr(live, design){ return live === design ? null : live; }   // null: leave the designed text
  FAMILY.forEach(function(f){ LIVE.push([f[2].firstName, firstOf(f[0])], [f[2].fullName, f[0]]); FWD.push([reEsc(f[0]) + '|' + reEsc(f[1]), liveOr(f[2].fullName, f[0])]); });   /* JG-PROD: the first name first, so a one-word name (fullName === firstName) maps to the design's first name, which every sentence about the person uses */
  FAMILY.forEach(function(f){ FWD.push([reEsc(firstOf(f[0])) + '|' + reEsc(firstOf(f[1])) + '(?:ом|а|у|е)?(?![' + NAME_CH + '])', liveOr(f[2].firstName, firstOf(f[0]))]); }); if (JGC && JGC.dictRu) Object.keys(JGC.dictRu).forEach(function(k){ var d = k.replace(/{child}/g, firstOf(FAMILY[0][0])); if (Object.prototype.hasOwnProperty.call(DICT, d)) DICT[d] = { uz: DICT[d].uz, ru: JGC.dictRu[k].replace(/{child}/g, firstOf(FAMILY[0][1])) }; }); /* JG-PROD: P8d (the re-check of 14 Oct 2026, «Вы видите результаты Артур»): the design's Russian declines its own child's name, which a live name cannot take; a real family reads these sentences built with the name in the nominative (src/server/parent/copy.ts RU_NAME_NOMINATIVE, the name as {child}, put back as the design child's first name from FAMILY, so this file names no one: tests/unit/identity.test.ts); the demo keeps the design's */
  LIVE = LIVE.filter(function(x){ if (!x[0] || Object.prototype.hasOwnProperty.call(TO_DESIGN, x[0])) return false; TO_DESIGN[x[0]] = x[1]; return true; })
    .sort(function(a, b){ return b[0].length - a[0].length; });   // longest first: a full name before its first name
  var LIVE_RE = new RegExp('(^|[^' + NAME_CH + '])(' + LIVE.map(function(x){ return reEsc(x[0]); }).join('|') + ')(?![' + NAME_CH + '])', 'gu');
  var DESIGN_RE = new RegExp('(^|[^' + NAME_CH + '])(?:' + FWD.map(function(x){ return '(' + x[0] + ')'; }).join('|') + ')', 'gu');
  function tr(s){
    if (LANG === 'en' || s == null) return s;
    var d = String(s).replace(LIVE_RE, function(_, pre, n){ return pre + TO_DESIGN[n]; }), out = trDesign(d);
    if (out === d) return trDesign(s);   // not one of the designed sentences about the family: as drawn
    return out.replace(DESIGN_RE, function(m, pre){ for (var k = 0; k < FWD.length; k++) if (arguments[k + 2] != null) return FWD[k][1] == null ? m : pre + FWD[k][1]; return m; });
  }
  var ORIG = new WeakMap(), ATTRS = ['aria-label', 'placeholder', 'title'];
  function skip(n){ var e = n.nodeType === 1 ? n : n.parentElement; return !e || !!e.closest('script,style,[data-notr]'); }
  function trNode(n){
    if (skip(n)) return;
    if (!ORIG.has(n)) ORIG.set(n, n.nodeValue);
    var v = tr(ORIG.get(n)); if (n.nodeValue !== v) n.nodeValue = v;
  }
  function trEl(el){
    if (skip(el)) return;
    ATTRS.forEach(function(a){ if (!el.hasAttribute(a)) return; var k = 'data-o-' + a;
      if (!el.hasAttribute(k)) el.setAttribute(k, el.getAttribute(a));
      el.setAttribute(a, tr(el.getAttribute(k))); });
  }
  function trTree(root){
    if (!root) return;
    if (root.nodeType === 3){ trNode(root); return; }
    if (root.nodeType !== 1) return;
    trEl(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n;
    while ((n = w.nextNode())){ if (n.nodeType === 3) trNode(n); else trEl(n); }
  }
  new MutationObserver(function(list){ list.forEach(function(m){ m.addedNodes.forEach(trTree); }); })
    .observe(document.getElementById('device'), { childList: true, subtree: true });
  var LANG_NAME = { uz: JGC ? 'Oʻzbekcha' : 'O‘zbekcha', ru: 'Русский', en: 'English' }; /* JG-PROD: owner 7 Oct P5int, the controller's ruling: Uzbek oʻ/gʻ written with U+02BB (ʻ), not U+2018, for a real family, as in the student apps; the demo keeps the design's */
  function applyLang(l, silent){
    LANG = l; document.documentElement.lang = l === 'uz' ? 'uz-Latn' : l;
    try { localStorage.setItem('jg.parent.lang', l); } catch (e) {}
    trTree(document.getElementById('device'));
    var ln = document.getElementById('langName'); if (ln) ln.textContent = LANG_NAME[l];
    document.querySelectorAll('.preview-ctl [data-lang-pick], .lang-seg [data-lang-pick]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.langPick === l)); });
    document.querySelectorAll('.lang-opt').forEach(function(b){ b.setAttribute('aria-checked', String(b.dataset.langPick === l)); });
    if (!silent && typeof renderBrief === 'function' && bi >= 0) renderBrief(bi);
    if (!silent && document.getElementById('gSum')) paintGift(document.getElementById('sheet'));
    if (!silent && typeof renderPledges === 'function') renderPledges();
    if (!silent && document.getElementById('plPrev')) paintPledgeForm(document.getElementById('sheet'));
  }

  /* ---------------- helpers ---------------- */
  var toastT = 0;
  function toast(msg){ var t = $('toast'); t.textContent = tr(msg); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove('on'); }, 2400); }
  function fillBars(root){
    var bs = (root || document).querySelectorAll('.bar b[data-w]'); bs.forEach(function(b){ b.style.width = '0'; });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ bs.forEach(function(b){ b.style.width = b.dataset.w + '%'; }); }); });
  }
  function fillH(root){ var bs = root.querySelectorAll('.hbar b[data-w]'); bs.forEach(function(b){ b.style.width = '0'; });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ bs.forEach(function(b){ b.style.width = b.dataset.w + '%'; }); }); }); }
  function countUp(el){ var to = +el.dataset.count, t0 = performance.now(), d = RM ? 1 : 1300;
    (function step(t){ var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); })(t0); }
  function ring(el, pct){ var c = +el.getAttribute('stroke-dasharray'); el.style.strokeDashoffset = c; requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.style.strokeDashoffset = (c * (1 - pct / 100)).toFixed(1); }); }); }
  function confetti(canvas, opts){
    opts = opts || {}; var r = canvas.getBoundingClientRect(); if (!r.width) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = r.width, H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr; var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = opts.colors || ['#D6A63C', '#EBD9A6', '#43AD80', '#207251', '#F3C6A5'], P = [], n = opts.n || 60;
    var ox = opts.x != null ? opts.x : W * .75, oy = opts.y != null ? opts.y : H * .45;
    for (var i = 0; i < n; i++){ var a = -Math.PI / 2 + (Math.random() - .5) * 2.2, s = 3 + Math.random() * 6;
      P.push({ x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: Math.random() * 6, vr: (Math.random() - .5) * .4, w: 4 + Math.random() * 4, h: 2.5 + Math.random() * 2.5, c: cols[i % cols.length], life: 0, max: 70 + Math.random() * 50 }); }
    (function loop(){ g.clearRect(0, 0, W, H); var alive = 0;
      P.forEach(function(p){ if (p.life > p.max) return; alive++; p.life++; p.vx *= .985; p.vy = p.vy * .985 + .16; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.globalAlpha = Math.max(0, 1 - p.life / p.max); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, Math.cos(p.life * .18)); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); });
      if (alive) requestAnimationFrame(loop); else g.clearRect(0, 0, W, H); })();
  }
  var I = {
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    dot: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="7"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7v10l8-5z"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------------- medals ---------------- */
  var MEDAL_ICON = {
    streak: '<path d="M32 16c2 6 9 9 9 17a9 9 0 0 1-18 0c0-4 2-6.5 4-8.4.5 3 2.2 4.7 3.7 4.7C28.9 24.4 30.7 19.4 32 16z" fill="currentColor"/>',
    sat: '<text x="32" y="38" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12.5" font-weight="600" fill="currentColor">1570</text>',
    trophy: '<path d="M24 20h16v5a8 8 0 0 1-16 0zM24 22h-4a4 4 0 0 0 4 6M40 22h4a4 4 0 0 1-4 6M32 33v5M27 41h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    pen: '<path d="M24 40l2-7 12-12 5 5-12 12zM36 23l5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    globe: '<circle cx="32" cy="30" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M22 30h20M32 20c3 3 4.5 6.5 4.5 10S35 37 32 40c-3-3-4.5-6.5-4.5-10S29 23 32 20z" fill="none" stroke="currentColor" stroke-width="2"/>',
    star: '<path d="M32 19l3.7 7.6 8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z" fill="currentColor"/>',
    heart: '<path d="M32 40s-10-6-10-12.5A5.5 5.5 0 0 1 32 24a5.5 5.5 0 0 1 10 3.5C42 34 32 40 32 40z" fill="currentColor"/>',
    ap: '<text x="32" y="36.5" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="15" font-weight="600" fill="currentColor">5</text>',
    cal: '<rect x="22" y="22" width="20" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M22 28h20M27 19v5M37 19v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
  };
  var TONES = { gold: ['#F6E3AE', '#C9A24A', '#8C6A1E', '#6B5314'], jade: ['#C7EEDB', '#43AD80', '#1C6A4A', '#12492F'], silver: ['#EEF1F3', '#A9B4BC', '#6C7780', '#48525A'] };
  function medalSVG(icon, tone){
    var t = TONES[tone], id = 'm' + Math.random().toString(36).slice(2, 7);
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + t[0] + '"/><stop offset=".55" stop-color="' + t[1] + '"/><stop offset="1" stop-color="' + t[2] + '"/></linearGradient></defs>' +
      '<circle cx="32" cy="32" r="29" fill="url(#' + id + ')"/><circle cx="32" cy="32" r="23" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>' +
      '<g transform="translate(0 2)" style="color:#fff">' + MEDAL_ICON[icon] + '</g></svg>';
  }
  var MEDALS = [
    { icon: 'trophy', tone: 'gold', t: 'Tashkent Math Championship', s: 'Took part in round 1 · today' },
    { icon: 'sat', tone: 'gold', t: 'SAT score 1570 of 1600', s: 'Top 1% of test takers · August' },
    { icon: 'streak', tone: 'jade', t: '12 days in a row', s: 'His best is 21 days' },
    { icon: 'pen', tone: 'silver', t: 'Essay praised by teacher', s: 'Kamila Saidova · today' },
    { icon: 'ap', tone: 'gold', t: 'AP Calculus 5', s: 'July' },
    { icon: 'globe', tone: 'jade', t: 'IELTS 7.5', s: 'June' },
    { icon: 'heart', tone: 'silver', t: '12 volunteer hours', s: 'Verified on Help Desk' },
    { icon: 'cal', tone: 'jade', t: 'Perfect attendance', s: 'August' },
    { icon: 'star', tone: 'silver', t: 'First live admission', s: 'August' }
  ];
  var NEXT = [ { icon: 'streak', t: '30 days in a row', p: 40, s: '12 of 30 days' }, { icon: 'globe', t: 'IELTS 8.0', p: 75, s: 'Target by December' }, { icon: 'heart', t: '40 volunteer hours', p: 30, s: '12 of 40 hours' }, { icon: 'star', t: 'SAT Season finisher', p: 48, s: '19 of 40 SAT bricks · ends 1 November' } ];
  function renderHomeAch(){ $('homeAch').innerHTML = MEDALS.slice(0, 3).map(function(m){ return '<div class="ach">' + medalSVG(m.icon, m.tone) + '<span class="row-t"><b>' + m.t + '</b><small>' + m.s + '</small></span><button class="icon-btn" type="button" data-proud="' + MEDALS.indexOf(m) + '" aria-label="Share as a proud parent"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/></svg></button></div>'; }).join(''); } renderHomeAch(); /* JG-PROD: a function, so the linked child's medals can be drawn again */

  /* ---------------- road path (home) ---------------- */
  function drawPath(el){
    var w = el.clientWidth || 320, h = 118;
    var P = function(x){ return 92 - 64 * Math.pow(x, 1.4); };      // y along the climb, x from 0 to 1
    var d = ''; for (var i = 0; i <= 40; i++){ var x = i / 40; d += (i ? 'L' : 'M') + (12 + x * (w - 44)).toFixed(1) + ' ' + P(x).toFixed(1); }
    var st = [{ k: 'purdue', at: .4, label: 'Purdue ✓' }, { k: 'harvard', at: .73, label: 'Harvard' }, { k: 'mit', at: 1, label: 'MIT', goal: true }];
    var you = .5, yx = 12 + you * (w - 44), yy = P(you);
    var done = ''; for (var j = 0; j <= 40 * you; j++){ var xx = j / 40; done += (j ? 'L' : 'M') + (12 + xx * (w - 44)).toFixed(1) + ' ' + P(xx).toFixed(1); }
    el.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><path d="' + d + '" fill="none" stroke="#DCE7E1" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>' +
      '<path d="' + done + '" fill="none" stroke="#43AD80" stroke-width="5" stroke-linecap="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.4s .3s cubic-bezier(.3,.7,.3,1) forwards"/></svg>' +
      st.map(function(s){ var x = 12 + s.at * (w - 44), y = P(s.at); return '<span class="stn' + (s.goal ? ' goal' : '') + '" style="left:' + x + 'px;top:' + (y + (s.goal ? 12 : 10)) + 'px"><img src="' + IMG[s.k] + '" alt=""><span>' + s.label + '</span></span>'; }).join('') +
      '<span class="you" style="left:' + yx + 'px;top:' + yy + 'px"></span><span class="you-tag" style="left:' + yx + 'px;top:' + yy + 'px">' + JG_CHILD.firstName + ' · 61%</span>'; /* JG-PROD: identity */
  }
  var st0 = document.createElement('style'); st0.textContent = '@keyframes draw{to{stroke-dashoffset:0}}@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}'; document.head.appendChild(st0);

  /* ---------------- Jamol ---------------- */
  var BRIEFS;
  function buildBriefs(){
    BRIEFS = [
      { mood: 'good', img: 'delighted', anim: 'hop', when: 'today', title: JG_CHILD.firstName + ' is doing well', /* JG-PROD: identity */
        text: "He is 79% ready for MIT, 20% more than in June. Harvard's level is only 6% away.", actions: [{ label: 'See progress', cls: 'btn-primary', go: 'progress' }] },
      { mood: 'event', img: 'cele', anim: 'jump', when: 'this afternoon', confetti: true, title: 'He took part in an event today',
        text: 'Round one of the Tashkent Math Championship. Results on Friday.', actions: [{ label: 'View event', cls: 'btn-primary', sheet: 'event' }, { label: 'Congratulate', cls: 'btn-ghost', toast: 'Sent. ' + JG_CHILD.firstName + ' will see your note in his app.' }] } /* JG-PROD: identity */
    ];
    if (S.plan === 'vip') BRIEFS.push({ mood: 'good', img: 'wave', anim: 'hop', when: 'just now', title: 'Welcome to VIP',
        text: JG_CHILD.firstName + "'s mentor will reach out within 24 hours. I'll add every session to your report.", actions: [{ label: 'Open account', cls: 'btn-primary', go: 'account' }] }); /* JG-PROD: identity */
    else if (S.renewed) BRIEFS.push({ mood: 'good', img: 'wave', anim: 'hop', when: 'just now', title: 'Thank you for renewing',
        text: 'Nothing pauses for ' + JG_CHILD.firstName + '. We keep going with MIT and the Harvard essay.', actions: [{ label: 'See progress', cls: 'btn-primary', go: 'progress' }] }); /* JG-PROD: identity */
    else BRIEFS.push({ mood: 'sad', img: 'concern', img2: 'pleading', anim: 'droop', when: 'reminder', title: 'His membership ends in 5 days',
        text: 'On 28 September his live courses and essay reviews stop, in the middle of his MIT application.', actions: [{ label: 'Keep his plan', cls: 'btn-amber', sheet: 'renew' }, { label: 'See VIP', cls: 'btn-ghost', sheet: 'vip' }] });
  }
  var bi = -1, auto = null, typing = 0, swapT = 0;
  function renderBrief(i){
    var b = BRIEFS[i], card = $('coach'), img = $('coachImg'), first = bi === -1;
    bi = i; card.className = 'coach ' + b.mood;
    $('coachWhen').textContent = b.when; $('coachTitle').textContent = b.title;
    var tx = $('coachText'); clearInterval(typing);
    tx.setAttribute('data-notr', ''); tx.innerHTML = tr(b.text).split(' ').map(function(w){ return '<span class="w">' + w + ' </span>'; }).join('');
    var spans = tx.querySelectorAll('.w'), k = 0;
    if (RM) spans.forEach(function(s){ s.classList.add('on'); });
    else typing = setInterval(function(){ if (k < spans.length) spans[k++].classList.add('on'); else clearInterval(typing); }, 55);
    var box = $('coachActions'); box.innerHTML = '';
    b.actions.forEach(function(a){ var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn ' + a.cls; bt.textContent = a.label;
      bt.addEventListener('click', function(){ stopAuto(); if (a.go) go(a.go); if (a.sheet) openSheet(a.sheet); if (a.toast) toast(a.toast); }); box.appendChild(bt); });
    if (!first) img.className = 'swap-out';
    clearTimeout(swapT);
    swapT = setTimeout(function(){
      img.src = IMG[b.img]; img.className = ''; void img.offsetWidth; img.className = b.anim;
      if (b.img2) swapT = setTimeout(function(){ img.src = IMG[b.img2]; }, 1500);
      if (b.confetti && !RM) setTimeout(function(){ confetti($('coachFx'), { x: card.clientWidth - 58, y: 90, n: 70 }); }, 350);
    }, first ? 0 : 220);
    var nav = $('coachNav'); nav.innerHTML = '';
    BRIEFS.forEach(function(_, j){ var d = document.createElement('button'); d.type = 'button'; d.className = j === i ? 'on' : ''; d.innerHTML = '<i></i>';
      d.setAttribute('aria-label', 'Update ' + (j + 1) + ' of ' + BRIEFS.length); if (j === i) d.setAttribute('aria-current', 'true');
      d.addEventListener('click', function(){ stopAuto(); renderBrief(j); }); nav.appendChild(d); });
  }
  function startAuto(){ stopAuto(); auto = setInterval(function(){ if (bi >= BRIEFS.length - 1) return stopAuto(); renderBrief(bi + 1); }, 7000); }
  function stopAuto(){ clearInterval(auto); auto = null; }
  (function(){ var card = $('coach'), x0 = null;
    card.addEventListener('pointerdown', function(e){ x0 = e.clientX; });
    card.addEventListener('pointerup', function(e){ if (x0 == null) return; var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40){ stopAuto(); renderBrief(Math.max(0, Math.min(BRIEFS.length - 1, bi + (dx < 0 ? 1 : -1)))); } }); })();

  /* ---------------- charts ---------------- */
  function bars(vals, labels, hi, colorHi, colorLo, h){
    var W = 320, H = h || 120, B = 18, T = 6, n = vals.length, max = (Math.max.apply(null, vals) * 1.12) || 1, gap = 8, bw = (W - gap * (n - 1)) / n, s = ''; /* JG-PROD: an all-zero week draws the empty track, not NaN (spec §5.3 E) */
    vals.forEach(function(v, i){ var hh = (H - B - T) * v / max, x = i * (bw + gap), y = H - B - hh, on = hi === i;
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(2, hh).toFixed(1) + '" rx="6" fill="' + (on ? colorHi : colorLo) + '" style="transform-origin:0 ' + (H - B) + 'px;animation:grow .7s ' + (i * .05) + 's cubic-bezier(.3,.7,.3,1) both"/>';
      s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle">' + labels[i] + '</text>'; });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>';
  }
  function line(vals, labels, color, goal, at, un){ at = goal ? at : 0; /* JG-PROD: owner 4 Oct P4g S2 M, "nobody above 70%": a real child's goal line and its label ("MIT-ready") stand at the readiness cap the server sends (at, 70), not at 100; the design's own charts pass none */ /* JG-PROD: owner 9 Oct, no % beside a withheld chance on the parent's charts (controller's call): un, the child's chance has no number (the server's JG_BOOT.child.unscaled), so this chart draws no % scale, as his own map draws none; the design's own charts pass none */
    if (vals.length < 2){ vals = [vals[0] || 0, vals[0] || 0]; labels = ['', labels[0] || '']; } /* JG-PROD: one point draws a flat line, not NaN (spec §5.3 E) */
    var W = 320, H = 130, L = 26, R = 8, T = 12, B = 20, n = vals.length, x = function(i){ return L + i * (W - L - R) / (n - 1); }, y = function(p){ return T + (100 - p) / 100 * (H - T - B); };
    var d = vals.map(function(p, i){ return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p).toFixed(1); }).join(' ');
    var s = '<defs><linearGradient id="la" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".26"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>';
    (un ? [] : at ? [25, 50, 100] : [25, 50, 75, 100]).forEach(function(p){ s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(p) + '" y2="' + y(p) + '" stroke="#E2EBE5"' + (p === 100 && !at ? ' stroke-dasharray="4 4"' : '') + '/><text x="0" y="' + (y(p) + 3) + '">' + p + '%</text>'; }); /* JG-PROD: owner 4 Oct P4g S2 M, with a cap the dashed goal line is the cap's (below), and no 75 % line crowds its label */ /* JG-PROD: owner 9 Oct, no % beside a withheld chance on the parent's charts (controller's call): with un no grid line and no "25%" beside it */
    s += '<path d="' + d + ' L' + x(n - 1) + ' ' + (H - B) + ' L' + L + ' ' + (H - B) + ' Z" fill="url(#la)"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.2s cubic-bezier(.3,.7,.3,1) forwards"/>';
    labels.forEach(function(l, i){ s += '<text x="' + x(i) + '" y="' + (H - 4) + '" text-anchor="middle">' + l + '</text>'; });
    s += '<circle cx="' + x(n - 1) + '" cy="' + y(vals[n - 1]) + '" r="5" fill="#fff" stroke="' + color + '" stroke-width="2.4"/>';
    if (goal) s += (at && !un ? '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(at) + '" y2="' + y(at) + '" stroke="#E2EBE5" stroke-dasharray="4 4"/><text x="0" y="' + (y(at) + 3) + '">' + at + '%</text>' : '') + '<text x="' + (W - R) + '" y="' + (y(at || 100) - 3) + '" text-anchor="end" style="fill:' + color + '">' + goal + '</text>'; /* JG-PROD: owner 4 Oct P4g S2 M, the dashed goal line, its tick and its label at the cap */ /* JG-PROD: owner 9 Oct, no % beside a withheld chance on the parent's charts (controller's call): with un no dashed line and no "70%" tick; the goal's name stands where the server puts it, over the flat line's end */
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>';
  }
  function donut(a, b, ca, cb){
    if (!(2 * Math.PI * 42 * a / (a + b) > 3)) return '<svg viewBox="0 0 100 100" width="112" height="112" style="transform:rotate(-90deg);flex:none"><circle cx="50" cy="50" r="42" fill="none" stroke="' + cb + '" stroke-width="12"/></svg>'; /* JG-PROD: no tasks, none done, or an arc shorter than the 3 the design trims draws the empty track; a NaN or negative dash is dropped by the browser and the ring is drawn full (spec §5.3 E) */
    var C = 2 * Math.PI * 42, pa = a / (a + b);
    return '<svg viewBox="0 0 100 100" width="112" height="112" style="transform:rotate(-90deg);flex:none"><circle cx="50" cy="50" r="42" fill="none" stroke="' + cb + '" stroke-width="12"/>' +
      '<circle cx="50" cy="50" r="42" fill="none" stroke="' + ca + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * pa - 3).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg>';
  }
  function li(ic, bg, fg, title, sub, right){ return '<div class="li"><span class="lic" style="background:' + bg + ';color:' + fg + '">' + ic + '</span><span class="t"><b>' + title + '</b><small>' + sub + '</small></span>' + (right || '') + '</div>'; }
  var OK = function(txt){ return '<span class="chip ok">' + txt + '</span>'; }, WARN = function(txt){ return '<span class="chip warn">' + txt + '</span>'; }, GREY = function(txt){ return '<span class="chip grey">' + txt + '</span>'; };
  function jnote(text, img){ return '<div class="jnote"><img src="' + IMG[img || 'welcome'] + '" alt=""><span><b style="color:var(--ink)">Jamol:</b> ' + text + '</span></div>'; }
  var sub = function(c){ return '<span class="lic" style="background:' + c[0] + ';color:' + c[1] + '">' + c[2] + '</span>'; };
  var SUBJ = { SAT: ['#E3EEF8', '#2F62A8', 'SAT'], AP: ['#ECE7F6', '#5B45A0', 'AP'], IELTS: ['#FBE9E5', '#A6412F', 'IE'], CAC: ['#DFF2EF', '#1F7A71', 'CAC'], ESS: ['#FBF1DC', '#8A5A0B', 'ESS'], PSY: ['#F3EEE4', '#7D6333', 'PSY'] };

  /* ---------------- folders ---------------- */
  var FOLDERS = [
    { k: 'today', t: 'Today', tint: '#DDF3E7', tint2: '#BFE7D1', ink: '#19553C', st: 'ok', val: '4<small>of 5</small>', cap: 'Tasks done today, one left',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4"/></svg>',
      sub: 'Wednesday, 23 September', big: '4 of 5 tasks',
      body: function(){ return '<div class="kv"><div><b>4 / 5</b><small>Tasks</small></div><div><b>1 h 40 min</b><small>Studied</small></div><div><b>4</b><small>Bricks today</small></div></div>' +
        '<div class="card fbox"><h3>Today\'s tasks</h3>' +
          li(I.check, '#D9F5E6', '#207251', 'SAT · Reading practice set', 'Done at 16:20 · 18 of 20 correct', OK('Done')) +
          li(I.check, '#D9F5E6', '#207251', 'AP · Calculus unit review', 'Done at 17:05', OK('Done')) +
          li(I.check, '#D9F5E6', '#207251', 'IELTS · Listening section 3', 'Done at 18:10 · 36 of 40', OK('Done')) +
          li(I.check, '#D9F5E6', '#207251', 'CAC · Course lesson 6', 'Watched in full', OK('Done')) +
          li(I.dot, '#FBF1DC', '#8A5A0B', 'Harvard essay · second draft', 'Due today at 22:00', WARN('Left')) + '</div>' +
        jnote('Four out of five before dinner is a strong day. The essay is the last one, and he usually writes best in the evening.', 'delighted'); } },
    { k: 'streak', t: 'Days in a row', tint: '#FBF0DD', tint2: '#F1DCB4', ink: '#7A4E0A', st: 'ok', val: '12<small>days</small>', cap: 'He has studied every day for 12 days',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.2 4 5.5 6 5.5 11.2A5.5 5.5 0 0 1 6.5 13.2c0-2.3 1.1-4 2.3-5.1.3 1.8 1.3 2.8 2.2 2.8C9.9 7.6 11 4.3 12 2z"/></svg>',
      sub: 'Days in a row when he studied', big: '12 days',
      body: function(){
        var start = new Date(2026, 7, 24), today = new Date(2026, 8, 23), cells = '';
        for (var c = 0; c < 35; c++){
          var d = new Date(start); d.setDate(start.getDate() + c);
          var ago = Math.round((today - d) / 864e5);
          if (ago < 0){ cells += '<span class="f">' + d.getDate() + '</span>'; continue; }
          var cls = ago < 12 ? 'd' : ((ago === 12 || ago === 19 || ago === 27) ? 'm' : 'd');
          cells += '<span class="' + cls + (ago === 0 ? ' t' : '') + '">' + d.getDate() + '</span>';
        }
        return '<div class="kv"><div><b>12</b><small>Current</small></div><div><b>21</b><small>Best · July</small></div><div><b>89%</b><small>Days active</small></div></div>' +
          '<div class="card fbox"><h3>Last five weeks</h3><div class="cal-h"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div><div class="cal">' +
          cells + '</div>' +
          '<p style="display:flex;gap:14px;margin-top:12px;font-size:12px;font-weight:700;color:var(--muted)"><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--jade-500);margin-right:5px"></i>Studied</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:#F6D9D2;margin-right:5px"></i>No study that day</span></p></div>' +
          jnote('Nine more days and he beats his record from July.', 'delighted'); } },
    { k: 'study', t: 'Study time', tint: '#E3EEF8', tint2: '#C6DAF0', ink: '#1F4C73', st: 'ok', val: '11 h 40 min', cap: 'This week, 2 h 10 min more than last',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
      sub: 'Last 7 days', big: '11 h 40 min',
      body: function(){ return '<div class="kv"><div><b>28</b><small>Bricks this week</small></div><div><b>+2 h 10 min</b><small>vs last week</small></div><div><b>1 h 40 min</b><small>Per day</small></div></div>' +
        '<div class="jnote" style="background:#F3EEE4"><span><b style="color:var(--ink)">How it is counted.</b> ' + JG_CHILD.firstName + ' studies in the Study Room in 25 or 50-minute sessions. Every 25 minutes lays one brick of MIT. If he leaves the app during a session, it does not count.</span></div>' + /* JG-PROD: identity */
        '<div class="card fbox"><h3>Each day</h3>' + bars([1.6, 1.9, 1.2, 2.0, 1.4, 2.1, 1.7], ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'], 6, '#3E76CC', '#C9DBF1') + '</div>' +
        '<div class="card fbox"><h3>Last 8 weeks</h3>' + bars([6.5, 7, 8.2, 7.5, 9.1, 8.8, 9.5, 11.7], ['W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38'], 7, '#3E76CC', '#C9DBF1') + '</div>' +
        '<div class="card fbox"><h3>By subject</h3>' +
          li(sub(SUBJ.SAT), '', '', 'SAT', '4 h 10 min', '<span class="num" style="font-size:15px">36%</span>') +
          li(sub(SUBJ.IELTS), '', '', 'IELTS', '3 h 20 min', '<span class="num" style="font-size:15px">29%</span>') +
          li(sub(SUBJ.AP), '', '', 'AP Calculus', '2 h 30 min', '<span class="num" style="font-size:15px">21%</span>') +
          li(sub(SUBJ.CAC), '', '', 'CAC course', '1 h 40 min', '<span class="num" style="font-size:15px">14%</span>') + '</div>' +
        '<div class="card fbox"><h3>His study group</h3>' + li(I.check, '#D9F5E6', '#207251', '96 of 120 bricks together this week', 'Four students with the same goal. They can only send each other cheers, never messages.', '') + '</div>'; } },
    { k: 'done', t: 'Tasks done and missed', tint: '#FBE9E5', tint2: '#F2CFC7', ink: '#7A2E24', st: 'warn', val: '43<small>of 49</small>', cap: '6 missed this week, mostly at the weekend',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l4.5 4.5L20 6"/></svg>',
      sub: 'This week, 49 tasks in total', big: '43 done · 6 missed',
      body: function(){ return '<div class="card fbox" style="display:flex;align-items:center;gap:16px">' + donut(43, 6, '#43AD80', '#F2B8AA') +
          '<div><p style="font-size:13px;font-weight:700;color:var(--muted)">Completed</p><p class="num" style="font-size:30px">43</p><p style="font-size:13px;font-weight:700;color:#A6412F;margin-top:6px">Missed · 6</p></div></div>' +
        '<div class="card fbox"><h3>What he missed</h3>' +
          li(I.x, '#FBE9E5', '#A6412F', 'IELTS · Listening test 2', 'Saturday · also missing as homework', WARN('Missed')) +
          li(I.x, '#FBE9E5', '#A6412F', 'SAT · Vocabulary set', 'Saturday', WARN('Missed')) +
          li(I.x, '#FBE9E5', '#A6412F', 'IELTS · Speaking practice', 'Saturday', WARN('Missed')) +
          li(I.x, '#FBE9E5', '#A6412F', 'Psychology · Reading', 'Sunday', WARN('Missed')) +
          li(I.x, '#FBE9E5', '#A6412F', 'SAT · Math drill', 'Sunday', WARN('Missed')) +
          li(I.x, '#FBE9E5', '#A6412F', 'CAC · Quiz 5', 'Monday', GREY('Redone')) + '</div>' +
        jnote('Five of the six were on the weekend. A short plan for Saturday usually fixes this.', 'think'); } },
    { k: 'homework', t: 'Homework', tint: '#ECE7F6', tint2: '#D4CAEC', ink: '#4A3A78', st: 'warn', val: '6<small>of 8</small>', cap: 'One IELTS homework is missing, one is due tonight',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/></svg>',
      sub: 'Set by his teachers this week', big: '6 of 8 handed in',
      body: function(){ return '<div class="kv"><div><b>6 / 8</b><small>Handed in</small></div><div><b>1</b><small>Due tonight</small></div><div><b>1</b><small>Missing</small></div></div>' +
        '<div class="card fbox"><h3>This week</h3>' +
          li(sub(SUBJ.IELTS), '', '', 'Listening test 2', 'Kamila Saidova · was due Saturday', WARN('Missing')) +
          li(sub(SUBJ.ESS), '', '', 'Harvard essay, second draft', 'Kamila Saidova · due today 22:00', GREY('Due today')) +
          li(sub(SUBJ.SAT), '', '', 'Reading set 14', 'Aziza Karimova', OK('92%')) +
          li(sub(SUBJ.AP), '', '', 'Problem set: derivatives', 'Javlon Tursunov', OK('100%')) +
          li(sub(SUBJ.IELTS), '', '', 'Writing Task 2', 'Kamila Saidova', OK('Band 7.0')) +
          li(sub(SUBJ.SAT), '', '', 'Math drill 9', 'Aziza Karimova', OK('95%')) +
          li(sub(SUBJ.PSY), '', '', 'Reflection: memory', 'Bekzod Aliev', OK('88%')) +
          li(sub(SUBJ.CAC), '', '', 'Lesson 6 notes', 'Checked by the course', GREY('Handed in')) + '</div>' +
        jnote('Kamila has reopened Listening test 2 until Friday, so he can still hand it in.', 'point'); } },
    { k: 'scores', t: 'Test scores', tint: '#DFF2EF', tint2: '#BFE3DE', ink: '#1D5C58', st: 'ok', val: '91%', cap: 'Average on practice tests, up 3%',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/></svg>',
      sub: 'Practice tests and graded work, September', big: '91% average',
      body: function(){ return '<div class="card fbox"><h3>Average across all practice</h3>' + line([80, 83, 85, 88, 91], ['May', 'Jun', 'Jul', 'Aug', 'Sep'], '#2A9D8F') + '</div>' +
        '<div class="card fbox"><h3>By subject</h3>' +
          li(sub(SUBJ.SAT), '', '', 'SAT practice', 'Average 1545 · best 1570 (real test)', '<span class="num" style="font-size:16px">96%</span>') +
          li(sub(SUBJ.AP), '', '', 'AP Calculus quizzes', '8 quizzes', '<span class="num" style="font-size:16px">97%</span>') +
          li(sub(SUBJ.IELTS), '', '', 'IELTS mocks', 'Average band 7.5 · target 8.0', '<span class="num" style="font-size:16px">83%</span>') +
          li(sub(SUBJ.PSY), '', '', 'Psychology', '3 graded pieces', '<span class="num" style="font-size:16px">88%</span>') + '</div>' +
        '<div class="card fbox"><h3>Mock Saturday</h3>' +
          li(sub(SUBJ.SAT), '', '', 'SAT mock · 19 September', 'Weekly mock test for every student at once', OK('Top 18%')) + '</div>' +
        '<div class="card fbox"><h3>Official results</h3>' +
          li(sub(SUBJ.SAT), '', '', 'SAT 1570 of 1600', 'Inside Harvard\'s typical range (1500–1580)', OK('Top 1%')) +
          li(sub(SUBJ.IELTS), '', '', 'IELTS 7.5 of 9', 'June 2026', GREY('Retake Dec')) +
          li(sub(SUBJ.AP), '', '', 'AP average 5.0 of 5', 'Three exams', OK('Top mark')) + '</div>'; } },
    { k: 'lessons', t: 'Live lessons', tint: '#F3EEE4', tint2: '#E3D7C0', ink: '#5E4B2B', st: 'ok', val: '12<small>of 13</small>', cap: 'Attended this month, one watched later',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="2.5"/><path d="M10 9.5v5l4-2.5z"/></svg>',
      sub: 'Live lessons in September', big: '12 of 13',
      body: function(){ return '<div class="kv"><div><b>12</b><small>Attended</small></div><div><b>1</b><small>Watched later</small></div><div><b>0</b><small>Missed</small></div></div>' +
        '<div class="card fbox"><h3>Recent lessons</h3>' +
          li(I.play, '#D9F5E6', '#207251', 'Live SAT course · lesson 11', 'Today 17:00 · Aziza Karimova', OK('Attended')) +
          li(I.play, '#D9F5E6', '#207251', 'IELTS speaking club', 'Monday 18:00 · Kamila Saidova', OK('Attended')) +
          li(I.play, '#D9F5E6', '#207251', 'Live admission: MIT essays', 'Saturday 11:00 · Admissions team', OK('Attended')) +
          li(I.play, '#D9F5E6', '#207251', 'Live SAT course · lesson 10', 'Last Wednesday', OK('Attended')) +
          li(I.play, '#FBF1DC', '#8A5A0B', 'Live SAT course · lesson 8', '14 September · watched the recording', GREY('Recording')) + '</div>'; } },
    { k: 'deadlines', t: 'Upcoming dates', tint: '#E9EDF1', tint2: '#CFD8E0', ink: '#2F3E4C', st: 'ok', val: '7', cap: 'Next: championship results on Friday',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
      sub: 'Tests, results and applications', big: '6 coming up',
      body: function(){ var db = function(d, m){ return '<span class="datebox" style="width:42px"><b>' + d + '</b><small>' + m + '</small></span>'; };
        var row = function(d, m, t, s, r){ return '<div class="li">' + db(d, m) + '<span class="t"><b>' + t + '</b><small>' + s + '</small></span>' + r + '</div>'; };
        return '<div class="card fbox"><h3>This week</h3>' + row(25, 'Sep', 'Championship results', 'Tashkent Math Championship', GREY('2 days')) + row(26, 'Sep', 'Mock Saturday: IELTS', 'Saturday 10:00, online', GREY('3 days')) + '</div>' +
          '<div class="card fbox"><h3>Next weeks</h3>' + row(15, 'Oct', 'Ask for recommendations', 'Two teachers, for MIT', WARN('22 days')) + row(1, 'Nov', 'MIT Early Action', '3 of 7 steps done', WARN('39 days')) + row(1, 'Nov', 'Purdue Early Action', '4 of 6 steps done', GREY('39 days')) + row(1, 'Nov', 'SAT Season finale', 'Live mock test and awards, 18:00', GREY('39 days')) + '</div>' +
          '<div class="card fbox"><h3>Later</h3>' + row(1, 'Jan', 'Harvard Regular Decision', 'Essay in review with Kamila', GREY('100 days')) + '</div>' +
          '<button class="btn btn-primary btn-block" type="button" data-toast="All deadlines added to your calendar" style="margin-top:12px">Add all to my calendar</button>'; } },
    { k: 'road', t: 'Road to MIT', tint: '#D8EFE3', tint2: '#B3DEC6', ink: '#123A29', st: 'ok', val: '79%', cap: 'Ready for MIT, up 20% since June',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/></svg>',
      sub: 'Readiness for his main goal', big: '61% ready',
      body: function(){ return '<div class="card fbox"><h3>20% closer since June</h3>' + line([59, 64, 71, 75, 79], ['Jun', 'Jul', 'Aug', 'Sep', 'Now'], '#207251', 'MIT-ready') + '</div>' +
        '<div class="card fbox"><h3>Universities on his road</h3>' +
          '<div class="li"><img src="' + IMG.purdue + '" alt="" style="width:40px;height:40px;border-radius:12px;object-fit:cover"><span class="t"><b>Purdue · reached</b><small>Ready to apply · Early Action, 1 Nov</small><span class="bar" style="display:block;height:5px;margin-top:6px"><b data-w="100"></b></span></span></div>' +
          '<div class="li"><img src="' + IMG.harvard + '" alt="" style="width:40px;height:40px;border-radius:12px;object-fit:cover"><span class="t"><b>Harvard · 6% to go</b><small>Next milestone · Regular Decision, 1 Jan</small><span class="bar" style="display:block;height:5px;margin-top:6px"><b data-w="93"></b></span></span></div>' +
          '<div class="li"><img src="' + IMG.mit + '" alt="" style="width:40px;height:40px;border-radius:12px;object-fit:cover"><span class="t"><b>MIT · 79% ready</b><small>Main goal · Early Action, 1 Nov</small><span class="bar" style="display:block;height:5px;margin-top:6px"><b data-w="79"></b></span></span></div></div>' +
        '<div class="card fbox"><h3>What moves him closer</h3>' +
          li(I.check, '#D9F5E6', '#207251', 'SAT 1570', 'Done in August', OK('+8%')) +
          li(I.check, '#D9F5E6', '#207251', 'Harvard essay draft', 'Reviewed today', OK('+3%')) +
          li(I.dot, '#FBF1DC', '#8A5A0B', 'IELTS 8.0', 'Retake in December', GREY('+5%')) +
          li(I.dot, '#FBF1DC', '#8A5A0B', 'Two teacher recommendations', 'Ask by 15 October', GREY('+6%')) + '</div>'; } },
    { k: 'achieve', t: 'Achievements', tint: '#F7EFD9', tint2: '#EADAAE', ink: '#6B5314', st: 'ok', val: '9', cap: 'Three new this month',
      ic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/></svg>',
      sub: 'Earned in the app and outside it', big: '9 earned',
      body: function(){ return '<div class="medal-grid">' + MEDALS.map(function(m){ return '<button class="card medal" type="button" data-proud="' + MEDALS.indexOf(m) + '" aria-label="Share as a proud parent">' + medalSVG(m.icon, m.tone) + '<b>' + m.t + '</b><small>' + m.s + '</small></button>'; }).join('') + '</div>' +
        '<p class="pl-help" style="text-align:center;margin-top:10px">Tap an achievement to share it as a proud parent.</p>' +
        '<div class="card fbox"><h3>Next up</h3>' + NEXT.map(function(n){ return '<div class="li"><span style="width:40px;flex:none">' + medalSVG(n.icon, 'silver').replace('<svg', '<svg style="width:36px;height:36px;opacity:.55;filter:grayscale(1)"') + '</span><span class="t"><b>' + n.t + '</b><small>' + n.s + '</small><span class="prog-mini"><b style="width:' + n.p + '%"></b></span></span></div>'; }).join('') + '</div>'; } }
  ];
  function prow(f){
    var plain = f.val.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return '<button class="prow" type="button" data-folder="' + f.k + '" style="--tint:' + f.tint + ';--ink-f:' + f.ink + '">' +
      '<span class="pic">' + f.ic + '</span><span class="t"><span class="top"><b>' + f.t + '</b><span class="val">' + plain + '</span></span><small>' + f.cap + '</small>' +
      '<span class="stl ' + f.st + '"><i></i>' + (f.st === 'warn' ? 'Needs attention' : f.st === 'idle' ? 'No activity yet' : 'On track') + '</span></span>' + /* JG-PROD: owner 4 Oct R13 (P4e G3 review), a folder of an idle week (the read model's st 'idle') says so, never "On track" */
      '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>';
  }
  function renderPlists(){ /* JG-PROD: a function, so the linked child's folders can be listed again */
  $('plistWarn').innerHTML = FOLDERS.filter(function(f){ return f.st === 'warn'; }).map(prow).join('');
  $('plistOk').innerHTML = FOLDERS.filter(function(f){ return f.st !== 'warn'; }).map(prow).join('');
  } renderPlists(); /* JG-PROD: as drawn */
  var openFolderEl = null;
  function openFolder(k, fromEl){
    var f = FOLDERS.filter(function(x){ return x.k === k; })[0]; if (!f) return;
    var fold = $('fold');
    fold.style.setProperty('--tint', f.tint);
    $('foldTitle').textContent = f.t; $('foldSub').textContent = f.sub; document.querySelector('#fold .crumb').textContent = current === 'home' ? 'Home' : 'Progress';
    $('foldBack').setAttribute('aria-label', tr(current === 'home' ? 'Back to home' : 'Back to progress'));
    $('foldStatus').innerHTML = f.st === 'warn' ? '<span class="chip warn"><i></i>Needs attention</span>' : f.st === 'idle' ? '<span class="chip grey"><i></i>No activity yet</span>' : '<span class="chip ok"><i></i>On track</span>'; /* JG-PROD: owner 4 Oct R13 (P4e G3 review), the folder sheet's chip follows it, in the design's grey */
    $('foldBody').innerHTML = f.body(); $('foldBody').scrollTop = 0;
    fold.classList.add('on'); openFolderEl = fromEl || null; $('statusbar').classList.add('light');
    fillBars(fold);
    var fr = fold.getBoundingClientRect();
    if (DESK){ var fs = $('foldScrim'); if (fs) fs.classList.add('on'); }
    if (fromEl && !RM && !DESK){
      var r = fromEl.getBoundingClientRect();
      var from = 'inset(' + Math.max(0, r.top - fr.top) + 'px ' + Math.max(0, fr.right - r.right) + 'px ' + Math.max(0, fr.bottom - r.bottom) + 'px ' + Math.max(0, r.left - fr.left) + 'px round 18px)';
      fold.animate([{ clipPath: from, opacity: .6 }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    setTimeout(function(){ $('foldBack').focus({ preventScroll: true }); }, 300);
  }
  function closeFolder(){
    var fold = $('fold'); if (!fold.classList.contains('on')) return;
    if (DESK){ fold.classList.remove('on'); var fs = $('foldScrim'); if (fs) fs.classList.remove('on'); if (openFolderEl && openFolderEl.focus) openFolderEl.focus({ preventScroll: true }); openFolderEl = null; return; }
    var el = openFolderEl && document.body.contains(openFolderEl) && openFolderEl.offsetParent ? openFolderEl : null;
    if (el && !RM){
      var fr = fold.getBoundingClientRect(), r = el.getBoundingClientRect();
      var to = 'inset(' + Math.max(0, r.top - fr.top) + 'px ' + Math.max(0, fr.right - r.right) + 'px ' + Math.max(0, fr.bottom - r.bottom) + 'px ' + Math.max(0, r.left - fr.left) + 'px round 18px)';
      var a = fold.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 }, { clipPath: to, opacity: .4 }], { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' });
      a.onfinish = function(){ fold.classList.remove('on'); syncBar(); };
      el.focus({ preventScroll: true });
    } else { fold.classList.remove('on'); syncBar(); }
    openFolderEl = null;
  }
  $('foldBack').addEventListener('click', closeFolder);

  /* ---------------- tabs ---------------- */
  var current = 'home';
  function go(tab){
    closeFolder(); closeChat();
    if (tab === current){ $('p-' + tab).scrollTo({ top: 0, behavior: 'smooth' }); return; }
    ['home', 'progress', 'messages', 'account'].forEach(function(t){ $('p-' + t).hidden = t !== tab; });
    document.querySelectorAll('.tab').forEach(function(b){ if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    var p = $('p-' + tab); p.scrollTop = 0; p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter');
    current = tab; $('statusbar').classList.toggle('light', tab !== 'home');
    if (tab === 'progress'){ fillH($('p-progress')); }
    if (tab === 'account') fillBars(p);
    if (tab === 'messages'){ $('msgBadge').hidden = true; if (DESK && !openThread) openChat(lastThread); }
  }
  document.querySelectorAll('.tab').forEach(function(b){ b.addEventListener('click', function(){ go(b.dataset.tab); }); });
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-go],[data-sheet],[data-toast],[data-folder],[data-thread-open]'); if (!el || el.closest('#coachActions')) return;
    if (el.dataset.threadOpen){ go('messages'); openChat(el.dataset.threadOpen); return; }
    if (el.dataset.folder){ if (current !== 'progress' && el.closest('#p-home')){ openFolder(el.dataset.folder, el); } else openFolder(el.dataset.folder, el); return; }
    if (el.dataset.go) go(el.dataset.go);
    if (el.dataset.sheet) openSheet(el.dataset.sheet);
    if (el.dataset.toast) toast(el.dataset.toast);
  });
  function syncBar(){ $('statusbar').classList.toggle('light', $('fold').classList.contains('on') || current !== 'home' || $('p-home').scrollTop > 260); }
  $('p-home').addEventListener('scroll', syncBar);

  /* ---------------- messages ---------------- */
  var THREADS = [
    { id: 'team', name: 'Admissions team', role: 'Your coordinator · Malika', av: 'team', unread: 1, when: '1 h',
      msgs: [['day', 'Today'], ['them', "Good evening, " + JG_ME.firstName + " aka. " + JG_CHILD.firstName + "'s MIT checklist is on schedule: 3 of 7 steps are done. Next are the two teacher recommendations.", '20:08']] }, /* JG-PROD: identity */
    { id: 'kamila', name: 'Kamila Saidova', role: 'IELTS teacher', av: 'kamila', unread: 1, when: '2 h',
      msgs: [['day', 'Today'], ['them', "I reviewed " + JG_CHILD.firstName + "'s Harvard essay. The opening is excellent. He now needs one real moment with his grandmother instead of a general statement. I've also reopened Listening test 2 until Friday.", '19:02']] }, /* JG-PROD: identity */
    { id: 'aziza', name: 'Aziza Karimova', role: 'SAT teacher', av: 'aziza', unread: 0, when: 'Mon',
      msgs: [['day', 'Monday'], ['them', JG_CHILD.firstName + " scored 790 in math on this week's practice set. Reading is the part we keep polishing.", '15:05'], ['me', 'Thank you, Aziza opa. Is there anything we can do at home?', '19:22'], ['them', 'Twenty minutes of English reading before bed makes a real difference. Any book he enjoys.', '19:40']] }, /* JG-PROD: identity */
    { id: 'jamol', name: 'Jamol', role: 'Weekly reports', av: 'jamolbot', unread: 0, when: 'Sun',
      msgs: [['day', 'Sunday'], ['them', 'Your weekly report is ready. ' + JG_CHILD.firstName + ' studied 9 h 30 min, finished 41 of 47 tasks and attended every live lesson.', '10:00']] } /* JG-PROD: identity */
  ];
  function avatar(t){ if (t.av === 'team') return '<span class="jm-av" style="background:#123A29;color:#fff;font-family:var(--serif);font-size:17px" aria-hidden="true">M</span>';
    if (t.av === 'jamol' || t.av === 'jamolbot') return '<span class="jm-av"><img src="' + IMG[t.av === 'jamol' ? 'welcome' : 'delighted'] + '" alt=""></span>'; return '<img src="' + IMG[t.av] + '" alt="">'; }
  function renderThreads(){
    $('threads').innerHTML = THREADS.map(function(t){ var last = t.msgs[t.msgs.length - 1][1];
      return '<button class="row thread" type="button" data-thread="' + t.id + '"' + (DESK && openThread && openThread.id === t.id ? ' aria-current="true"' : '') + '><span class="person">' + avatar(t) + '<div><b>' + t.name + '</b><small>' + last + '</small></div></span>' +
        '<span style="display:flex;flex-direction:column;align-items:flex-end;gap:5px"><span class="muted" style="font-size:12px">' + t.when + '</span>' + (t.unread ? '<span class="unread">' + t.unread + '</span>' : '') + '</span></button>'; }).join('');
    $('threads').querySelectorAll('[data-thread]').forEach(function(b){ b.addEventListener('click', function(){ openChat(b.dataset.thread); }); });
  }
  var openThread = null;
  function openChat(id){ var t = THREADS.filter(function(x){ return x.id === id; })[0]; if (!t) return;
    openThread = t; t.unread = 0; renderThreads();
    $('chatWho').innerHTML = avatar(t) + '<div><b>' + t.name + '</b><small>' + t.role + '</small></div>'; paintFeed(); $('chat').classList.add('on'); }
  function paintFeed(){ var f = $('chatFeed');
    f.innerHTML = openThread.msgs.map(function(m){ return m[0] === 'day' ? '<p class="day-sep">' + m[1] + '</p>' : '<div class="msg ' + m[0] + '">' + m[1].replace(/</g, '&lt;') + '<time>' + m[2] + '</time></div>'; }).join('');
    f.scrollTop = f.scrollHeight; }
  var lastThread = 'team';
  function closeChat(){ if (openThread) lastThread = openThread.id; $('chat').classList.remove('on'); openThread = null; }
  $('chatBack').addEventListener('click', closeChat);
  $('composer').addEventListener('submit', function(e){ e.preventDefault(); var v = $('chatInput').value.trim(); if (!v || !openThread) return;
    openThread.msgs.push(['me', v, '21:' + String(new Date().getMinutes()).padStart(2, '0')]); $('chatInput').value = ''; paintFeed(); renderThreads(); });

  /* ---------------- account ---------------- */
  function renderMember(){
    var c = $('memberCard'), vip = S.plan === 'vip';
    c.className = 'member' + (vip ? ' vip' : '');
    if (vip) c.innerHTML = '<div class="member-top"><div><small>Current plan</small><span class="num">VIP</span></div><div class="member-price"><b>$' + (S.billing === 'annual' ? '33.25' : '39.90') + '</b>a month' + (S.billing === 'annual' ? ', billed yearly' : '') + '</div></div>' +
        '<div class="days"><div class="days-top"><span>Renews ' + (S.billing === 'annual' ? '23 September 2027' : '23 October') + '</span><span>Paid</span></div><div class="bar"><b data-w="100"></b></div></div>' +
        '<div class="member-actions"><button class="btn btn-white" type="button" data-toast="Receipt sent to your Telegram">Receipt</button><button class="btn btn-line" type="button" data-toast="Plan settings open here">Manage</button></div>';
    else if (S.renewed) c.innerHTML = '<div class="member-top"><div><small>Current plan</small><span class="num">Premium</span></div><div class="member-price"><b>$22.90</b>a month</div></div>' +
        '<div class="days"><div class="days-top"><span>Renews Wed, 28 October</span><span>Paid</span></div><div class="bar"><b data-w="100"></b></div></div>' +
        '<div class="member-actions"><button class="btn btn-white" type="button" data-toast="Receipt sent to your Telegram">Receipt</button><button class="btn btn-line" type="button" data-sheet="vip">See VIP</button></div>';
    else c.innerHTML = '<div class="member-top"><div><small>Current plan</small><span class="num">Premium</span></div><div class="member-price"><b>$22.90</b>a month</div></div>' +
        '<div class="days"><div class="days-top"><span>Ends ' + S.ends + '</span><span>5 days left</span></div><div class="bar"><b data-w="17"></b></div></div>' +
        '<div class="member-actions"><button class="btn btn-white" type="button" data-sheet="renew">Renew</button><button class="btn btn-line" type="button" data-sheet="vip">See VIP</button></div>';
    $('vipTeaser').hidden = vip;
    $('childPlan').textContent = (vip ? 'VIP' : 'Premium') + ' · College applicant';
    var rec = [];
    if (vip) rec.push(['23 Sep 2026', 'VIP · ' + (S.billing === 'annual' ? 'year' : 'month'), S.billing === 'annual' ? '$399.00' : '$39.90']);
    if (S.renewed) rec.push(['23 Sep 2026', 'Premium · month', '$22.90']);
    rec = rec.concat([['28 Aug 2026', 'Premium · month', '$22.90'], ['28 Jul 2026', 'Premium · month', '$22.90'], ['28 Jun 2026', 'Premium · month', '$22.90']]);
    $('receipts').innerHTML = rec.map(function(r){ return '<div class="receipt"><span class="row-t"><b>' + r[1] + '</b><small>' + r[0] + ' · Paid</small></span><span style="font-weight:700;font-size:14px">' + r[2] + '</span>' +
      '<button class="icon-btn" type="button" aria-label="Download receipt" data-toast="Receipt downloaded"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button></div>'; }).join('');
    fillBars(c);
  }
  var TOG = [['Weekly report in Telegram', 'Every Sunday at 10:00', true], ['Deadlines and test dates', 'Three days before, and on the day', true],
             ['Needs attention alerts', 'Missed homework or a broken streak', true], ['Events and results', 'When ' + JG_CHILD.firstName + ' takes part in something', true], ['Pledge updates', 'When he gets close to your goal or reaches it', true], ['Daily note from Jamol', 'One short message each evening', true]]; /* JG-PROD: identity */
  $('toggles').innerHTML = TOG.map(function(t, i){ return '<div class="toggle-row"><span class="row-t"><b id="tg' + i + '">' + t[0] + '</b><small>' + t[1] + '</small></span><button class="switch" type="button" role="switch" aria-labelledby="tg' + i + '" aria-checked="' + t[2] + '"></button></div>'; }).join('');
  $('toggles').querySelectorAll('.switch').forEach(function(s){ s.addEventListener('click', function(){ s.setAttribute('aria-checked', String(s.getAttribute('aria-checked') !== 'true')); }); });

  /* ---------------- sheets ---------------- */
  var lastFocus = null;
  var IC = {
    live: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="2.5"/><path d="M10 9.5v5l4-2.5z"/></svg>',
    essay: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/></svg>',
    track: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/><path d="M16 16l2 2 4-4"/></svg>',
    ask: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14v10H10l-5 4z"/></svg>',
    mentor: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 11l2 2 4-4"/></svg>',
    mic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
    bolt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3L5 13h6l-1 8 8-10h-6z"/></svg>'
  };
  function sheetHTML(kind){
    if (kind === 'renew') return '<div class="grab"></div><div class="sheet-hero"><img class="jm droop" id="sheetJm" src="' + IMG.concern + '" alt=""></div>' +
      '<p class="say">We are halfway through his MIT application. I would hate for ' + JG_CHILD.firstName + ' to lose momentum now.</p>' + /* JG-PROD: identity */
      '<h3 id="sheetTitle">' + JG_CHILD.firstName + '\'s Premium ends in 5 days</h3><p class="lead">On Monday, 28 September, these pause for him:</p>' + /* JG-PROD: identity */
      '<div class="pause-list">' +
        '<div><span class="pi">' + IC.live + '</span><span><b>Live SAT and IELTS courses</b><small>His IELTS mock test is on Saturday</small></span></div>' +
        '<div><span class="pi">' + IC.essay + '</span><span><b>Essay reviews by teachers</b><small>Kamila is mid-way through his Harvard essay</small></span></div>' +
        '<div><span class="pi">' + IC.track + '</span><span><b>Application tracker</b><small>MIT, Harvard and Purdue checklists</small></span></div>' +
        '<div><span class="pi">' + IC.ask + '</span><span><b>Ask Jamol without limits</b><small>Not included in the free plan</small></span></div></div>' +
      '<button class="btn btn-primary btn-block" type="button" id="doRenew" style="margin-top:18px">Renew Premium · $22.90 a month</button>' +
      '<button class="btn btn-ghost btn-block" type="button" id="toVip">See what VIP adds</button><p class="fine">Uzcard •••• 4417. Cancel any time.</p>';
    if (kind === 'vip') return '<div class="grab"></div><div class="sheet-hero"><span class="glow"></span><img class="jm hop" id="sheetJm" src="' + IMG.point + '" alt="" style="width:118px"></div>' +
      '<p class="say">Today\'s championship is exactly the kind of story admissions officers remember. A mentor helps ' + JG_CHILD.firstName + ' tell it well.</p>' + /* JG-PROD: identity */
      '<p class="eyebrow">For his application season</p><h3 id="sheetTitle">Give ' + JG_CHILD.firstName + ' his own admissions team</h3>' + /* JG-PROD: identity */
      '<div class="perks">' +
        '<div class="perk"><span class="pk">' + IC.mentor + '</span><span><b>Weekly 1:1 mentor sessions</b><small>One mentor who knows his MIT and Harvard plans</small></span></div>' +
        '<div class="perk"><span class="pk">' + IC.essay + '</span><span><b>Unlimited essay reviews</b><small>Every draft, not two a month</small></span></div>' +
        '<div class="perk"><span class="pk">' + IC.mic + '</span><span><b>Mock interviews with alumni</b><small>Practice before the real interviews</small></span></div>' +
        '<div class="perk"><span class="pk">' + IC.bolt + '</span><span><b>Priority support</b><small>Plus everything he has in Premium today</small></span></div></div>' +
      '<div class="bill" role="group" aria-label="Billing">' +
        '<button type="button" data-bill="monthly" aria-pressed="' + (S.billing === 'monthly') + '"><small>Monthly</small><b>$39.90 <span>/ month</span></b></button>' +
        '<button type="button" data-bill="annual" aria-pressed="' + (S.billing === 'annual') + '"><em>Save 17%</em><small>Yearly</small><b>$33.25 <span>/ month</span></b></button></div>' +
      '<button class="btn btn-gold btn-block" type="button" id="doVip" style="margin-top:14px">Upgrade ' + JG_CHILD.firstName + ' to VIP</button>' + /* JG-PROD: identity */
      (S.plan === 'premium' && !S.renewed ? '<button class="btn btn-darkline btn-block" type="button" id="doRenew">Just renew Premium</button>' : '') + '<p class="fine" id="vipFine"></p>';
    if (kind === 'vipdone') return '<div class="grab"></div><div class="sheet-hero"><span class="glow"></span><img class="jm jump" id="sheetJm" src="' + IMG.cele + '" alt=""></div>' +
      '<p class="eyebrow">Payment received</p><h3 id="sheetTitle">Welcome to VIP</h3><p class="lead">' + JG_CHILD.firstName + '\'s mentor will contact him within 24 hours. You will see every session in your weekly report.</p>' + /* JG-PROD: identity */
      '<button class="btn btn-gold btn-block" type="button" id="doneBtn" style="margin-top:20px">Done</button>';
    if (kind === 'renewdone') return '<div class="grab"></div><div class="sheet-hero"><img class="jm hop" id="sheetJm" src="' + IMG.delighted + '" alt=""></div>' +
      '<p class="eyebrow">Payment received</p><h3 id="sheetTitle">Premium renewed</h3><p class="lead">Nothing pauses. ' + JG_CHILD.firstName + ' keeps his courses, essay reviews and tracker until 28 October.</p>' + /* JG-PROD: identity */
      '<button class="btn btn-primary btn-block" type="button" id="doneBtn" style="margin-top:20px">Done</button>';
    if (kind === 'gift') return '<div class="grab"></div><div class="gift-hero"><img src="' + IMG.giftbox + '" alt=""></div>' +
      '<p class="eyebrow">Gift a membership</p><h3 id="sheetTitle">Give someone a head start</h3>' +
      '<p class="lead">For a nephew, a niece or a friend\'s child. They open it like a real present and read your letter inside.</p>' +
      '<p class="g-lbl">Who is it for?</p>' +
      '<div class="g-chips" role="group" aria-label="Who is it for?">' + REL.map(function(r){ return '<button type="button" data-grel="' + r[0] + '" aria-pressed="' + (G.rel === r[0]) + '">' + r[1] + '</button>'; }).join('') + '</div>' +
      '<div class="g-fields"><label class="sr-only" for="gName">Their name</label><input id="gName" autocomplete="off" placeholder="Their name" value="' + escH(G.name) + '">' +
      '<label class="sr-only" for="gContact">Phone or Telegram</label><input id="gContact" autocomplete="off" placeholder="Phone or Telegram" value="' + escH(G.contact) + '"></div>' +
      '<p class="g-err" id="gErr" role="alert"></p>' +
      '<p class="g-lbl">Membership</p>' +
      '<div class="g-plans" role="group" aria-label="Membership">' + [['pro', 'Every lesson, at their own pace'], ['premium', 'The full JIA experience'], ['vip', 'Their own admissions team']].map(function(p){
        return '<button type="button" data-gplan="' + p[0] + '" aria-pressed="' + (G.plan === p[0]) + '"><b>' + PLAN_NAME[p[0]] + '</b><small>' + p[1] + '</small></button>'; }).join('') + '</div>' +
      '<p class="g-lbl">How long</p>' +
      '<div class="g-chips" role="group" aria-label="How long">' + [1, 3, 6, 12].map(function(m){ return '<button type="button" data-gmonths="' + m + '" aria-pressed="' + (G.months === m) + '">' + durTxt(m) + '</button>'; }).join('') + '</div>' +
      '<p class="g-lbl">Your note</p><label class="sr-only" for="gNote">A few words from you (optional)</label><textarea id="gNote" rows="2" placeholder="A few words from you (optional)">' + escH(G.note) + '</textarea>' +
      '<div class="g-total"><span><b id="gWhat" data-notr></b><small>One payment, no auto-renewal</small></span><span class="num" id="gSum" data-notr></span></div>' +
      '<button class="btn btn-primary btn-block" type="button" id="doGift" data-notr></button>' +
      '<p class="fine">Paid with Uzcard •••• 4417.</p>';
    if (kind === 'giftdone') return '<div class="grab"></div><div class="sheet-hero"><img class="jm jump" id="sheetJm" src="' + IMG.cele + '" alt=""></div>' +
      '<p class="eyebrow">Gift sent</p><h3 id="sheetTitle" data-notr>' + tr('Gift sent to ' + escH(GIFTS[0].name)) + '</h3>' +
      '<p class="lead" data-notr>' + tr(escH(GIFTS[0].name) + ' will get a message with the gift. They open it with three taps and read your letter inside.') + '</p>' +
      '<a class="btn btn-ghost btn-block" href="https://claude.ai/artifact/Day1X3MWKQGnZ7q8xHxrdZ" target="_blank" rel="noopener" style="margin-top:18px;text-decoration:none">See how it opens</a>' +
      '<button class="btn btn-primary btn-block" type="button" id="doneBtn">Done</button>';
    if (kind === 'pledge') return '<div class="grab"></div><div class="gift-hero"><img src="' + IMG.giftbox + '" alt=""></div>' +
      '<p class="eyebrow">Parent pledge</p><h3 id="sheetTitle">Promise a reward for a goal</h3>' +
      '<p class="lead">Pick something ' + JG_CHILD.firstName + ' can reach by working for it. He sees your pledge on his Home screen, and it fills up as he studies.</p>' + /* JG-PROD: identity */
      '<p class="g-lbl">What should he reach?</p><div class="g-chips" role="group" aria-label="What should he reach?">' +
      [['bricks', 'Study bricks'], ['tasks', 'Completed tasks'], ['streak', 'Days in a row'], ['score', 'A test score']].map(function(o){ return '<button type="button" data-plg="' + o[0] + '" aria-pressed="false">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<p class="pl-help" id="plHelp" data-notr></p>' +
      '<p class="g-lbl">Target</p><label class="sr-only" for="plTarget">Target</label><input class="g-in" id="plTarget" inputmode="decimal" value="' + escH(PL.target) + '">' +
      '<p class="g-lbl">Reward</p><label class="sr-only" for="plReward">Reward</label><input class="g-in" id="plReward" autocomplete="off" placeholder="For example, a new bike" value="' + escH(PL.reward) + '">' +
      '<p class="g-lbl">By when</p><div class="g-chips" role="group" aria-label="By when">' + [['month', 'By the end of this month'], ['oct', 'By 31 October']].map(function(o){ return '<button type="button" data-pld="' + o[0] + '" aria-pressed="false">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="pl-preview"><small>' + JG_CHILD.firstName + ' will see</small><p id="plPrev" data-notr></p></div>' + /* JG-PROD: identity */
      '<p class="g-err" id="plErr" role="alert"></p>' +
      '<button class="btn btn-primary btn-block" type="button" id="plSave" style="margin-top:14px">Save pledge</button>' +
      '<p class="fine">You give the reward yourself. We let you know the moment he reaches the goal.</p>';
    if (kind === 'family') return '<div class="grab"></div><p class="eyebrow">Family check</p><h3 id="sheetTitle">Your answers for his plan</h3>' +
      '<p class="lead">' + (JGC ? (function (N, L) { return L === 'uz' ? 'Bu 5 ta savol ' + N + 'ning universitet rejasini belgilaydi. Javoblaringizni faqat siz va ' + N + ' koʻrasiz.' : L === 'ru' ? 'Пять вопросов, от которых зависит, как будет поступать ' + N + '. Ответы видите только вы и ' + N + '.' : 'Five questions that shape ' + N + '\'s university plan. Only you and ' + N + ' see these answers.'; })(JG_CHILD.firstName, String(document.documentElement.lang || '').slice(0, 2)) : 'Five questions that shape ' + JG_CHILD.firstName + '\'s university plan. Only you and his counselor see these answers.') + '</p>' + /* JG-PROD: identity */ /* JG-PROD: owner 20 Oct 2026 (M1 core 2), a real family is promised no counselor (none exists): only the parent and the child see the answers, in the page's language; the demo keeps the design's */
      '<p class="g-lbl">Budget per year for university</p><div class="money"><label class="sr-only" for="famAmt">Amount</label><input class="g-in" id="famAmt" inputmode="numeric" value="' + escH(FAM.amount) + '">' +
      '<label class="sr-only" for="famCur">Currency</label><select class="g-in" id="famCur">' + ['USD', 'UZS', 'EUR'].map(function(c){ return '<option' + (FAM.cur === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
      FAM_Q.map(function(q){ return '<p class="g-lbl">' + q[1] + '</p><div class="g-chips" role="group" aria-label="' + q[1] + '">' + q[2].map(function(o){ return '<button type="button" data-fq="' + q[0] + '" data-fv="' + o[0] + '" aria-pressed="' + (FAM[q[0]] === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
        (q[0] === 'buddy' ? '<p class="pl-help">Jamals Global matches ' + JG_CHILD.firstName + ' with a study buddy and a small study group. The group can only send cheers, never messages.</p>' : ''); }).join('') + /* JG-PROD: identity */
      '<button class="btn btn-primary btn-block" type="button" id="famSave" style="margin-top:18px">Save answers</button>' +
      '<p class="fine">Never shown to other students or used to rank him.</p>';
    if (kind === 'proud'){ var pm = MEDALS[PROUD_I] || MEDALS[0];
      return '<div class="grab"></div><p class="eyebrow">Proud parent card</p><h3 id="sheetTitle">Share ' + JG_CHILD.firstName + '\'s moment</h3>' + /* JG-PROD: identity */
        '<div class="proud-card"><div class="pc-medal">' + medalSVG(pm.icon, pm.tone) + '</div><p class="pc-k">Proud of ' + JG_CHILD.firstName + '</p><p class="pc-t">' + pm.t + '</p><p class="pc-s">' + pm.s + '</p><p class="pc-w">Jamals Global</p></div>' + /* JG-PROD: identity */
        '<div class="share-row"><button class="btn btn-primary" type="button" data-toast="Opening Telegram">Telegram</button><button class="btn btn-ghost" type="button" data-toast="Opening Instagram">Instagram</button><button class="btn btn-ghost" type="button" data-toast="Image saved">Save image</button></div>' +
        '<p class="fine">Only this achievement is shared, nothing else about ' + JG_CHILD.firstName + '.</p>'; } /* JG-PROD: identity */
    if (kind === 'lang') return '<div class="grab"></div><h3 id="sheetTitle" style="text-align:left;margin-top:8px">Language</h3>' +
      '<p class="lead" style="text-align:left">Choose the language of the app</p><div style="margin-top:10px" data-notr>' +
      [['uz', JGC ? 'Oʻzbekcha' : 'O‘zbekcha', 'Uzbek'], ['ru', 'Русский', 'Russian'], ['en', 'English', 'English']].map(function(l){ /* JG-PROD: owner 7 Oct P5int, the controller's ruling: Uzbek oʻ/gʻ written with U+02BB (ʻ), not U+2018, for a real family, as in the student apps; the demo keeps the design's */
        return '<button class="lang-opt" type="button" role="radio" aria-checked="' + (LANG === l[0]) + '" data-lang-pick="' + l[0] + '"><span>' + l[1] + '<small>' + l[2] + '</small></span><span class="rd"></span></button>'; }).join('') + '</div>';
    if (kind === 'event') return '<div class="grab"></div><div class="event-art"><img src="' + IMG.trophy + '" alt=""></div>' +
      '<p class="eyebrow">Today · City Olympiad Center</p><h3 id="sheetTitle">Tashkent Math Championship</h3>' +
      '<p class="lead">A two-round olympiad for grades 9 to 11. The top ten finishers are invited to the national team camp.</p>' +
      '<div class="facts"><div><small>' + JG_CHILD.firstName + '</small><b>Round 1 done</b></div><div><small>Results</small><b>Friday, 25 September</b></div><div><small>Prize fund</small><b>$2,000</b></div><div><small>Round 2</small><b>If he qualifies</b></div></div>' + /* JG-PROD: identity */
      '<button class="btn btn-primary btn-block" type="button" id="congrats" style="margin-top:18px">Congratulate ' + JG_CHILD.firstName + '</button>' + /* JG-PROD: identity */
      '<button class="btn btn-ghost btn-block" type="button" id="calEv">Remind me about the results</button>';
    return '';
  }
  function openSheet(kind){
    var sh = $('sheet'); lastFocus = lastFocus || document.activeElement;
    sh.className = 'sheet' + (kind === 'vip' || kind === 'vipdone' ? ' dark' : '');
    sh.innerHTML = '<button class="sheet-close" type="button" aria-label="Close">' + I.close + '</button>' + sheetHTML(kind); sh.scrollTop = 0;
    $('scrim').classList.add('on'); requestAnimationFrame(function(){ sh.classList.add('on'); });
    sh.querySelector('.sheet-close').addEventListener('click', closeSheet);
    setTimeout(function(){ var f = sh.querySelector('.sheet-close'); if (f) f.focus({ preventScroll: true }); }, 350);
    var jm = $('sheetJm');
    if (kind === 'renew' && jm) setTimeout(function(){ jm.src = IMG.pleading; }, 1500);
    if (kind === 'vipdone' && !RM) setTimeout(function(){ confetti($('sheetFx'), { x: device.clientWidth / 2, y: device.clientHeight * .42, n: 110, colors: ['#EBD9A6', '#C9A24A', '#FFF6DA', '#43AD80', '#ffffff'] }); }, 300);
    if (kind === 'renewdone' && !RM) setTimeout(function(){ confetti($('sheetFx'), { x: device.clientWidth / 2, y: device.clientHeight * .5, n: 70 }); }, 300);
    var bind = function(id, fn){ var el = $(id); if (el) el.addEventListener('click', fn); };
    bind('toVip', function(){ openSheet('vip'); });
    bind('doRenew', function(){ S.renewed = true; S.ends = 'Wed, 28 October'; afterPlanChange(); openSheet('renewdone'); });
    bind('doVip', function(){ S.plan = 'vip'; afterPlanChange(); openSheet('vipdone'); });
    bind('doneBtn', closeSheet);
    bind('congrats', function(){ closeSheet(); toast('Sent. ' + JG_CHILD.firstName + ' will see your note in his app.'); }); /* JG-PROD: identity */
    bind('calEv', function(){ closeSheet(); toast('We will remind you on Friday'); });
    if (kind === 'gift') bindGift(sh);
    if (kind === 'pledge') bindPledge(sh);
    if (kind === 'family') bindFamily(sh);
    if (kind === 'giftdone' && !RM) setTimeout(function(){ confetti($('sheetFx'), { x: device.clientWidth / 2, y: device.clientHeight * .4, n: 90 }); }, 300);
    sh.querySelectorAll('[data-bill]').forEach(function(b){ b.addEventListener('click', function(){ S.billing = b.dataset.bill;
      sh.querySelectorAll('[data-bill]').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); vipFine(); }); });
    vipFine();
  }
  function vipFine(){ var f = $('vipFine'); if (!f) return;
    f.textContent = S.billing === 'annual' ? '$399 billed once a year, $10.35 a month more than his Premium today. Uzcard, Humo, Click or Payme. Cancel any time.' : '$17 a month more than his Premium today. Uzcard, Humo, Click or Payme. Cancel any time.'; }
  function paintGift(sh){
    var w = PLAN_NAME[G.plan] + ' · ' + durTxt(G.months);
    $('gWhat').textContent = tr(w); $('gSum').textContent = '$' + giftTotal();
    $('doGift').textContent = tr('Pay $' + giftTotal() + ' and send');
    sh.querySelectorAll('[data-gplan]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.gplan === G.plan)); });
    sh.querySelectorAll('[data-gmonths]').forEach(function(b){ b.setAttribute('aria-pressed', String(+b.dataset.gmonths === G.months)); });
    sh.querySelectorAll('[data-grel]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.grel === G.rel)); });
  }
  function bindGift(sh){
    paintGift(sh);
    sh.addEventListener('click', function(e){
      var p = e.target.closest('[data-gplan]'), m = e.target.closest('[data-gmonths]'), r = e.target.closest('[data-grel]');
      if (p) G.plan = p.dataset.gplan; if (m) G.months = +m.dataset.gmonths; if (r) G.rel = r.dataset.grel;
      if (p || m || r) paintGift(sh);
    });
    $('gName').addEventListener('input', function(e){ G.name = e.target.value; $('gErr').textContent = ''; });
    $('gContact').addEventListener('input', function(e){ G.contact = e.target.value; });
    $('gNote').addEventListener('input', function(e){ G.note = e.target.value; });
    $('doGift').addEventListener('click', function(){
      if (!G.name.trim()){ $('gErr').textContent = tr('Please enter their name'); $('gName').focus(); return; }
      GIFTS.unshift({ name: G.name.trim(), plan: G.plan, months: G.months, total: giftTotal(), rel: G.rel });
      renderGifts(); G.name = ''; G.contact = ''; G.note = '';
      openSheet('giftdone');
    });
  }
  function closeSheet(){ $('sheet').classList.remove('on'); $('scrim').classList.remove('on'); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); lastFocus = null; }
  $('scrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function(e){ if (e.key !== 'Escape') return;
    if ($('sheet').classList.contains('on')) closeSheet(); else if ($('fold').classList.contains('on')) closeFolder(); else if (!DESK && $('chat').classList.contains('on')) closeChat(); });
  function afterPlanChange(){ buildBriefs(); renderMember(); renderBrief(BRIEFS.length - 1); }

  document.querySelectorAll('[data-ts]').forEach(function(b){ b.addEventListener('click', function(){
    device.classList.toggle('large', b.dataset.ts === 'lg');
    document.querySelectorAll('[data-ts]').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); }); });

  /* ---------------- preview controls ---------------- */
  $('pvReplay').addEventListener('click', function(){ go('home'); $('p-home').scrollTo({ top: 0 }); renderBrief(0); startAuto(); });
  $('pvRenew').addEventListener('click', function(){ if (S.plan !== 'premium' || S.renewed) reset(); go('home'); renderBrief(BRIEFS.length - 1); setTimeout(function(){ openSheet('renew'); }, 900); });
  $('pvReset').addEventListener('click', reset);
  $('pvPledge').addEventListener('click', function(){ go('home'); PLEDGES[0].progress = 100; PLEDGES[0].status = 'reached'; renderPledges(); var pl = document.getElementById('pledgeList'); if (pl) pl.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast(JG_CHILD.firstName + ' reached your pledge'); }); /* JG-PROD: identity */
  function reset(){ closeSheet(); closeChat(); closeFolder(); S = { plan: 'premium', ends: 'Mon, 28 September', billing: 'annual', renewed: false }; GIFTS = []; renderGifts(); PLEDGES = PLEDGES.slice(0, 1); PLEDGES[0].progress = 62; PLEDGES[0].status = 'active'; renderPledges();
    buildBriefs(); renderMember(); go('home'); $('p-home').scrollTo({ top: 0 }); renderBrief(0); startAuto(); }

  document.addEventListener('click', function(e){ var b = e.target.closest('[data-lang-pick]'); if (!b) return;
    applyLang(b.dataset.langPick); if (b.classList.contains('lang-opt')) setTimeout(closeSheet, 250); });

  /* ---------------- desktop only: sparklines and the road chart ---------------- */
  function spark(el, vals, color){
    if (vals.length < 2) vals = [vals[0] || 0, vals[0] || 0]; /* JG-PROD: one point draws a flat line, not NaN (spec §5.3 E) */
    if (!el) return; var W = 120, H = 44, mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), n = vals.length;
    var pts = vals.map(function(v, i){ return [i * W / (n - 1), H - 6 - (v - mn) / ((mx - mn) || 1) * (H - 12)]; });
    var d = pts.map(function(p, i){ return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var id = 'sp' + Math.random().toString(36).slice(2, 6);
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".22"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + d + ' L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="url(#' + id + ')"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + pts[n - 1][0] + '" cy="' + pts[n - 1][1] + '" r="3.5" fill="#fff" stroke="' + color + '" stroke-width="2"/></svg>';
  }
  function roadChart(el){
    if (!el) return;
    var W = 640, H = 250, L = 40, R = 24, T = 26, B = 30;
    var X = function(i){ return L + i * (W - L - R) / 8; }, Y = function(p){ return T + (100 - p) / 100 * (H - T - B); };
    var act = JGC ? JGC.desk.act : [59, 64, 71, 75, 79], pred = JGC ? JGC.desk.pred : [[4, 79], [5, 85], [6, 90], [7, 95], [8, 100]], last = act.length - 1; /* JG-PROD: parent read model */
    var d1 = act.map(function(v, i){ return (i ? 'L' : 'M') + X(i) + ' ' + Y(v).toFixed(1); }).join(' ');
    var d2 = pred.map(function(p, i){ return (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1]).toFixed(1); }).join(' ');
    var s = '<defs><linearGradient id="rdA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43AD80" stop-opacity=".25"/><stop offset="1" stop-color="#43AD80" stop-opacity="0"/></linearGradient></defs>';
    (JGC && JGC.unscaled ? [] : [0, 50, 100]).forEach(function(p){ s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(p) + '" y2="' + Y(p) + '" stroke="#E2EBE5"' + (p ? ' stroke-dasharray="3 5"' : '') + '/><text x="' + (L - 10) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>'; }); /* JG-PROD: owner 9 Oct, no % beside a withheld chance on the parent's charts (controller's call): no 0 / 50 / 100 axis when the child's chance has no number (the server's JG_BOOT.child.unscaled), as his own map has no % scale */
    s += '<path d="' + d1 + ' L' + X(last) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + ' Z" fill="url(#rdA)"/>'; /* JG-PROD: parent read model */
    s += '<path d="' + d2 + '" fill="none" stroke="#43AD80" stroke-width="2.4" stroke-dasharray="6 6" stroke-linecap="round"/>';
    s += '<path d="' + d1 + '" fill="none" stroke="#123A29" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.3s cubic-bezier(.3,.7,.3,1) forwards"/>';
    act.forEach(function(v, i){ s += '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="4.5" fill="#fff" stroke="#123A29" stroke-width="2.4"/>'; });
    (JGC ? JGC.desk.labels : ['Jun', 'Jul', 'Aug', 'Sep', 'Now']).forEach(function(m, i){ s += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle"' + (i === last ? ' style="fill:#123A29;font-weight:800"' : '') + '>' + m + '</text>'; }); /* JG-PROD: parent read model */
    el.querySelector('svg').innerHTML = s;
    var px = function(x){ return (x / W * 100).toFixed(3) + '%'; }, py = function(y){ return (y / H * 100).toFixed(3) + '%'; };
    var st = JGC ? JGC.desk.stn : [{ k: 'harvard', x: 5, y: 85, label: 'Harvard' }, { k: 'mit', x: 8, y: 100, label: 'MIT', goal: true }]; /* JG-PROD: owner 4 Oct R14r, the child's own goal and universities (image URLs from the server), never the design's MIT, Harvard and Purdue */
    el.querySelectorAll('.rd-stn,.rd-you').forEach(function(n){ n.remove(); });
    st.forEach(function(p){ var d = document.createElement('span'); d.className = 'rd-stn' + (p.goal ? ' goal' : '') + (p.done ? ' done' : '');
      d.style.left = px(X(p.x)); d.style.top = py(Y(p.y));
      d.innerHTML = '<img src="' + (IMG[p.k] || p.k) + '" alt=""><b>' + p.label + '</b>'; el.appendChild(d); }); /* JG-PROD: owner 4 Oct R14r, the child's own goal and universities (image URLs from the server), never the design's MIT, Harvard and Purdue */
    var y = document.createElement('span'); y.className = 'rd-you'; y.style.left = px(X(last)); y.style.top = py(Y(act[last])); /* JG-PROD: parent read model */
    y.innerHTML = '<img src="' + IMG.oqil + '" alt=""><em><span>' + JG_CHILD.firstName + ' is here</span> ' + (JGC && JGC.unscaled ? '—' : act[last] + '%') + '</em>'; el.appendChild(y); /* JG-PROD: identity, parent read model */ /* JG-PROD: owner 9 Oct, no % beside a withheld chance on the parent's charts (controller's call): the tag reads the dash his own map's tag reads, never "0%" */
  }
  if (DESK){
    spark($('spRoad'), JGC ? JGC.desk.road : [59, 64, 71, 75, 79], '#207251'); /* JG-PROD: parent read model */
    spark($('spToday'), JGC ? JGC.desk.today : [3, 4, 5, 4, 5, 3, 4], '#3E76CC'); /* JG-PROD: parent read model */
    spark($('spStreak'), JGC ? JGC.desk.streak : [2, 5, 1, 4, 8, 10, 12], '#D2801E'); /* JG-PROD: parent read model */
    spark($('spStudy'), JGC ? JGC.desk.study : [6.5, 7, 8.2, 7.5, 9.1, 8.8, 9.5, 11.7], '#7A63C2'); /* JG-PROD: parent read model */
    requestAnimationFrame(function(){ roadChart($('roadChart')); ring($('sideRing'), JGC ? JGC.desk.ring : 79); }); /* JG-PROD: parent read model */
    window.addEventListener('resize', function(){ roadChart($('roadChart')); });
    var fs = $('foldScrim'); if (fs) fs.addEventListener('click', closeFolder);
    var srch = $('searchBox'); if (srch) srch.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); toast('Search opens here'); } });
  }


  /* ---------------- student-app sync: study room bricks, dream build, pledges, family check, proud card ---------------- */
  var DREAM = { done: 143, target: 600, cols: 30, rows: 20 };
  var imgDC = new Image(), imgDS = new Image(); imgDC.src = '/d/parent-desktop/media/3e9998f32b3543fa.webp'; imgDS.src = '/d/parent-desktop/media/80aa223a382d5fa1.webp';
  function drawDream(){
    var cv = document.getElementById('dreamCv'); if (!cv) return;
    if (!imgDC.complete || !imgDS.complete){ imgDC.onload = imgDS.onload = drawDream; return; }
    var g = cv.getContext('2d'), W = cv.width, H = cv.height, bw = W / DREAM.cols, bh = H / DREAM.rows;
    g.drawImage(imgDS, 0, 0, W, H);
    for (var i = 0; i < DREAM.done; i++){
      var x = i % DREAM.cols, y = DREAM.rows - 1 - Math.floor(i / DREAM.cols);
      g.drawImage(imgDC, x * bw, y * bh, bw, bh, x * bw, y * bh, bw, bh);
    }
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1;
    for (var r = 0; r <= DREAM.rows; r++){ g.beginPath(); g.moveTo(0, r * bh); g.lineTo(W, r * bh); g.stroke(); }
    for (var r2 = 0; r2 < DREAM.rows; r2++) for (var c = 0; c <= DREAM.cols; c++){ var off = (r2 % 2) ? bw / 2 : 0; g.beginPath(); g.moveTo(c * bw + off, r2 * bh); g.lineTo(c * bw + off, (r2 + 1) * bh); g.stroke(); }
  }

  var PLEDGES = [{ id: 'pl_1', from: 'mom', goalType: 'bricks', target: 100, progress: 62, reward: { en: 'New headphones', uz: 'Yangi quloqchinlar', ru: 'Новые наушники' }, deadline: 'month', status: 'active' }];
  var PL = { goalType: 'bricks', target: '150', reward: '', deadline: 'oct' };
  var PL_DEF = { bricks: '150', tasks: '60', streak: '30', score: 'IELTS 8.0' };
  var PL_HELP = { bricks: '1 brick = 25 minutes of focused study in the Study Room. 100 bricks is about 42 hours.', tasks: 'Tasks from his daily plan.', streak: 'Days in a row when he studied.', score: 'Type the test and the score, for example IELTS 8.0.' };
  function goalTxt(type, n){ return type === 'bricks' ? n + ' study bricks' : type === 'tasks' ? n + ' completed tasks' : type === 'streak' ? n + ' days in a row' : 'A score of ' + n; }
  function rewardTxt(p){ return typeof p.reward === 'object' ? (p.reward[LANG] || p.reward.en) : p.reward; }
  function renderPledges(){
    var el = document.getElementById('pledgeList'); if (!el) return;
    el.innerHTML = PLEDGES.map(function(p){
      var pct = Math.min(100, Math.round(p.progress / p.target * 100)) || 0;
      var state = p.status === 'active' ? '<span class="chip grey">' + (p.deadline === 'month' ? 7 : 38) + ' days left</span>' : p.status === 'reached' ? '<span class="chip ok">Reached</span>' : '<span class="chip ok">Reward given</span>';
      return '<article class="card pledge ' + p.status + '"><div class="pl-top"><span class="pl-gift">' + GIFTSVG + '</span><span class="row-t"><b>' + (p.from === 'mom' ? "Mom's pledge" : 'Your pledge') + '</b><small>' + goalTxt(p.goalType, p.target) + '</small><small>' + (p.deadline === 'month' ? 'By the end of this month' : 'By 31 October') + '</small></span>' + state + '</div>' +
        '<p class="pl-reward" data-notr>' + escH(rewardTxt(p)) + '</p>' +
        (p.goalType === 'score' ? '<p class="pl-n">Latest: IELTS 7.5</p>' : '<div class="bar"><b data-w="' + pct + '"></b></div><p class="pl-n"><span data-notr>' + Math.min(p.progress, p.target) + ' / ' + p.target + '</span> <span>so far</span></p>') +
        (p.status === 'reached' ? '<p class="pl-msg">' + JG_CHILD.firstName + ' reached it. Time for the reward!</p><button class="btn btn-primary" type="button" data-pl-give="' + p.id + '">Mark as given</button>' : '') + '</article>'; /* JG-PROD: identity */
    }).join('') + '<button class="card pl-add" type="button" data-sheet="pledge">+ Add a pledge<small>Promise a real reward for a goal. ' + JG_CHILD.firstName + ' sees it on his Home screen.</small></button>'; /* JG-PROD: identity */
    fillBars(el);
  }
  var GIFTSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M2.5 9h19v-3h-19zM12 6v14M12 6c-1.5-3.5-6-3.5-5 0M12 6c1.5-3.5 6-3.5 5 0"/></svg>';
  function paintPledgeForm(sh){
    sh.querySelectorAll('[data-plg]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.plg === PL.goalType)); });
    sh.querySelectorAll('[data-pld]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.pld === PL.deadline)); });
    document.getElementById('plHelp').textContent = tr(PL_HELP[PL.goalType]);
    var ti = document.getElementById('plTarget'); ti.type = PL.goalType === 'score' ? 'text' : 'number';
    var prev = tr("Dad's pledge") + ': ' + (PL.reward.trim() || '…') + ' · ' + tr(goalTxt(PL.goalType, PL.target || '…')) + ' · ' + tr(PL.deadline === 'month' ? 'By the end of this month' : 'By 31 October');
    document.getElementById('plPrev').textContent = prev;
  }
  function bindPledge(sh){
    paintPledgeForm(sh);
    sh.addEventListener('click', function(e){
      var g = e.target.closest('[data-plg]'), d = e.target.closest('[data-pld]');
      if (g){ PL.goalType = g.dataset.plg; PL.target = PL_DEF[PL.goalType]; document.getElementById('plTarget').value = PL.target; }
      if (d) PL.deadline = d.dataset.pld;
      if (g || d) paintPledgeForm(sh);
    });
    document.getElementById('plTarget').addEventListener('input', function(e){ PL.target = e.target.value; paintPledgeForm(sh); });
    document.getElementById('plReward').addEventListener('input', function(e){ PL.reward = e.target.value; document.getElementById('plErr').textContent = ''; paintPledgeForm(sh); });
    document.getElementById('plSave').addEventListener('click', function(){
      if (!String(PL.target).trim() || !PL.reward.trim()){ document.getElementById('plErr').textContent = tr('Please add a target and a reward'); return; }
      PLEDGES.push({ id: 'pl_' + Date.now(), from: 'dad', goalType: PL.goalType, target: PL.goalType === 'score' ? PL.target : +PL.target, progress: 0, reward: PL.reward.trim(), deadline: PL.deadline, status: 'active' });
      PL = { goalType: 'bricks', target: '150', reward: '', deadline: 'oct' };
      renderPledges(); closeSheet(); toast('Saved. ' + JG_CHILD.firstName + ' will see it on his Home screen.'); /* JG-PROD: identity */
    });
  }

  var FAM = { amount: '30000', cur: 'USD', savings: 'skip', income: 'yes', loan: 'maybe', attitude: 'full', buddy: 'any', updated: false };
  var FAM_Q = [
    ['savings', 'Savings set aside for his education', [['none', 'None'], ['under10', 'Under $10,000'], ['10to50', '$10,000 to $50,000'], ['50to150', '$50,000 to $150,000'], ['over150', 'Over $150,000'], ['skip', 'Prefer not to say']]],
    ['income', 'Can you document your income?', [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No'], ['unsure', 'Not sure']]],
    ['loan', 'Would you take an education loan?', [['yes', 'Yes'], ['maybe', 'Maybe'], ['no', 'No']]],
    ['attitude', 'How do you feel about his plan?', [['full', 'Fully supportive'], ['cond', 'Supportive, with conditions'], ['hes', 'Hesitant'], ['against', 'Against it']]],
    ['buddy', 'Study buddy', [['any', 'Anyone'], ['same', 'Same gender only']]]
  ];
  function bindFamily(sh){
    sh.addEventListener('click', function(e){
      var b = e.target.closest('[data-fq]'); if (!b) return;
      FAM[b.dataset.fq] = b.dataset.fv;
      sh.querySelectorAll('[data-fq="' + b.dataset.fq + '"]').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
    });
    document.getElementById('famAmt').addEventListener('input', function(e){ FAM.amount = e.target.value.replace(/[^0-9]/g, ''); });
    document.getElementById('famCur').addEventListener('change', function(e){ FAM.cur = e.target.value; });
    document.getElementById('famSave').addEventListener('click', function(){
      if (JGC){ jgSaveFamily(FAM).then(function(ok){ if (!ok){ toast(JGC.copy.saveFailed); return; } /* JG-PROD: the family form saves as the child's parent_flow_done (spec §5.3 C) */
        FAM.updated = true; var s = document.getElementById('famSub'); if (s) s.textContent = 'Updated today · budget, loans, study buddy';
        closeSheet(); toast("Saved. " + JG_CHILD.firstName + "'s roadmap now uses your answers."); }); return; } /* JG-PROD: identity; the toast only once the server has the answers */
      FAM.updated = true; var s = document.getElementById('famSub'); if (s) s.textContent = 'Updated today · budget, loans, study buddy';
      closeSheet(); toast("Saved. " + JG_CHILD.firstName + "'s roadmap now uses your answers."); /* JG-PROD: identity */
    });
  }
  var PROUD_I = 0;
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-proud]'); if (b){ PROUD_I = +b.dataset.proud; openSheet('proud'); return; }
    var gv = e.target.closest('[data-pl-give]'); if (gv){ PLEDGES.forEach(function(p){ if (p.id === gv.dataset.plGive) p.status = 'claimed'; }); renderPledges(); toast('Marked as given. ' + JG_CHILD.firstName + ' will see a thank-you from you.'); } /* JG-PROD: identity */
  });

  /* ---------------- JG-PROD: the linked child (spec §5.3 B) ----------------
     JG_BOOT.child is the server's read model of this child, already worded in the design's own sentences
     (src/server/parent/view.ts). It replaces the constants the design renders from, and the folders' contents are drawn
     with the design's own helpers. Without it (demo accounts, /preview, ENGINE_LIVE off) nothing here runs. */
  function jgSaveFamily(f){ /* JG-PROD: the family form → POST /api/v1/family/check, in the student's question ids (PN §O) */
    var a = {}, M = JGC.famMap;
    Object.keys(M).forEach(function(k){ var v = M[k][1][f[k]]; if (v) a[M[k][0]] = v; });
    var n = +f.amount; if (String(f.amount).trim() !== '' && isFinite(n) && JGC.famRate[f.cur]) a.m7_annual_budget = { amount: String(f.amount), currency: f.cur, usd: Math.round(n * JGC.famRate[f.cur]), confidence: 'high' };
    return fetch('/api/v1/family/check', { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': window.JG_BOOT.uid },
      body: JSON.stringify({ student_id: JGC.student_id, answers: a, consent: false, language: LANG, client_id: 'fam_' + Date.now() }) })   /* JG-PROD: this form asks for no agreement, so it records none; the under-14 consent waits for the owner's placement (final review parent I1) */
      .then(function(r){ return r.ok; }, function(){ return false; });
  }
  if (JGC){ /* JG-PROD: parent read model */
    var jgIc = { check: [I.check, '#D9F5E6', '#207251'], dot: [I.dot, '#FBF1DC', '#8A5A0B'], x: [I.x, '#FBE9E5', '#A6412F'] };
    var jgChip = function(c){ return !c ? '' : c[0] === 'ok' ? OK(c[1]) : c[0] === 'warn' ? WARN(c[1]) : GREY(c[1]); };
    var jgPart = function(p){
      if (p.t === 'kv') return '<div class="kv">' + p.items.map(function(x){ return '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join('') + '</div>';
      if (p.t === 'list') return '<div class="card fbox"><h3>' + p.h + '</h3>' + p.rows.map(function(r){
        return r.badge ? li(sub(r.badge), '', '', r.title, r.sub, r.chip ? jgChip(r.chip) : '<span class="num" style="font-size:15px">' + r.num + '</span>') : li(jgIc[r.ic][0], jgIc[r.ic][1], jgIc[r.ic][2], r.title, r.sub, jgChip(r.chip)); }).join('') + '</div>'; /* JG-PROD: owner 12 Oct 2026, a Homework row is the design's badge row with its state chip, as the design draws it (SPEC-lessons §8.1) */
      if (p.t === 'note') return jnote(p.text, p.img);
      if (p.t === 'how') return '<div class="jnote" style="background:#F3EEE4"><span><b style="color:var(--ink)">How it is counted.</b> ' + p.text + '</span></div>';
      if (p.t === 'bars') return '<div class="card fbox"><h3>' + p.h + '</h3>' + bars(p.vals, p.labels, p.hi, '#3E76CC', '#C9DBF1') + '</div>';
      if (p.t === 'donut') return '<div class="card fbox" style="display:flex;align-items:center;gap:16px">' + donut(p.a, p.b, '#43AD80', '#F2B8AA') +
        '<div><p style="font-size:13px;font-weight:700;color:var(--muted)">Completed</p><p class="num" style="font-size:30px">' + p.a + '</p><p style="font-size:13px;font-weight:700;color:#A6412F;margin-top:6px">Missed · ' + p.b + '</p></div></div>';
      if (p.t === 'line') return '<div class="card fbox"><h3>' + p.h + '</h3>' + line(p.vals, p.labels, '#207251', p.top, p.at, JGC.unscaled) + '</div>'; /* JG-PROD: owner 4 Oct R14r, the child's own goal and universities (image URLs from the server), never the design's MIT, Harvard and Purdue */   /* JG-PROD: owner 4 Oct P4g S2 M, "nobody above 70%": the goal label at the readiness cap (p.at) */ /* JG-PROD: owner 9 Oct, no % beside a withheld chance on the parent's charts (controller's call): the server's word (JG_BOOT.child.unscaled) to the folder's chart */
      if (p.t === 'cal') return '<div class="card fbox"><h3>Last five weeks</h3><div class="cal-h"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div><div class="cal">' +
        p.cells.map(function(c){ return '<span class="' + c[1] + '">' + c[0] + '</span>'; }).join('') + '</div>' +
        '<p style="display:flex;gap:14px;margin-top:12px;font-size:12px;font-weight:700;color:var(--muted)"><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--jade-500);margin-right:5px"></i>Studied</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:#F6D9D2;margin-right:5px"></i>No study that day</span></p></div>';
      if (p.t === 'dates') return '<div class="card fbox"><h3>' + p.h + '</h3>' + p.rows.map(function(r){ return '<div class="li"><span class="datebox" style="width:42px"><b>' + r[0] + '</b><small>' + r[1] + '</small></span><span class="t"><b>' + r[2] + '</b><small>' + r[3] + '</small></span>' + jgChip(r[4]) + '</div>'; }).join('') + '</div>';
      if (p.t === 'unis') return '<div class="card fbox"><h3>Universities on his road</h3>' + p.rows.map(function(r){ return '<div class="li"><img src="' + (IMG[r[0]] || r[0]) + '" alt="" style="width:40px;height:40px;border-radius:12px;object-fit:cover"><span class="t"><b>' + r[1] + '</b><small>' + r[2] + '</small><span class="bar" style="display:block;height:5px;margin-top:6px"><b data-w="' + r[3] + '"></b></span></span></div>'; }).join('') + '</div>';
      return '';
    };
    buildBriefs = function(){ BRIEFS = JGC.briefs.slice(); };
    FOLDERS = FOLDERS.filter(function(f){ return JGC.folders[f.k] !== null; });
    FOLDERS.forEach(function(f){ var v = JGC.folders[f.k]; if (!v) return;
      if (v.t) f.t = v.t; f.val = v.val; f.cap = v.cap; f.st = v.st; f.sub = v.sub; /* JG-PROD: owner 4 Oct R14r, the child's own goal and universities (image URLs from the server), never the design's MIT, Harvard and Purdue */
      if (v.parts) f.body = function(){ return v.parts.map(jgPart).join(''); }; });
    renderPlists();
    MEDALS = JGC.medals; NEXT = JGC.next;
    if (JGC.icons.sat) MEDAL_ICON.sat = MEDAL_ICON.sat.replace('>1570<', '>' + JGC.icons.sat + '<');
    if (JGC.icons.ap) MEDAL_ICON.ap = MEDAL_ICON.ap.replace('>5<', '>' + JGC.icons.ap + '<');
    renderHomeAch();
    DREAM.done = JGC.dream;
    PLEDGES = []; renderMember = function(){}; renderPledges = function(){ if (window.JG_M1P) window.JG_M1P.pledges(); };   /* JG-PROD: no membership, billing or plan fixtures for a real family until P2: the shell hides them and nothing re-shows them (final review parent C1) */ /* JG-PROD: m1-parent 20 Oct 2026, with PARENT_M1 on the pledges are drawn from the server by public/runtime/jg-parent-m1.js (window.JG_M1P); off, nothing is drawn, as before */
    THREADS = THREADS.filter(function(t){ return t.id === 'jamol'; }); if (JGC.alerts){ $('toggles').innerHTML = JGC.alerts.map(function(t, i){ return '<div class="toggle-row"><span class="row-t"><b id="tg' + i + '">' + t[1] + '</b><small>' + t[2] + '</small></span><button class="switch" type="button" role="switch" aria-labelledby="tg' + i + '" aria-checked="' + t[3] + '" data-alert="' + t[0] + '"></button></div>'; }).join(''); $('toggles').querySelectorAll('.switch').forEach(function(s){ s.addEventListener('click', function(){ var v = s.getAttribute('aria-checked') !== 'true', b = { student_id: JGC.student_id }; b[s.dataset.alert] = v; s.setAttribute('aria-checked', String(v)); fetch('/api/v1/parent/alerts', { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': window.JG_BOOT.uid }, body: JSON.stringify(b) }).then(function(r){ if (!r.ok) throw r; }).catch(function(){ s.setAttribute('aria-checked', String(!v)); toast(JGC.copy.saveFailed); }); }); }); } /* JG-PROD: owner 13 Oct 2026, the Notifications switches are the alert setting for a real family: the three in-app alerts in the design's own toggle rows, each tap saved (POST /api/v1/parent/alerts) or turned back with the design's toast (SPEC-lessons §12.5 item 7) */
    THREADS.forEach(function(t){ t.when = 'Mon'; t.unread = 0; t.msgs = [['day', 'Monday']].concat((JGC.reportLines || [JGC.report]).map(function(s){ return ['them', s, '09:00']; })).concat(JGC.daily ? [['day', JGC.daily[0]], ['them', JGC.daily[1], '18:00']] : []); }); /* JG-PROD: owner 13 Oct 2026, the weekly report in Jamol's thread as the design's own bubbles: the report, what he did, what is missing and one tip, written by code (SPEC-lessons §12.5 item 7, D14) */ /* JG-PROD: m1-parent 20 Oct 2026, with PARENT_M1 on Jamol's daily note, written by rule, after the weekly report (JGC.daily) */
    FAM = { amount: JGC.fam.amount, cur: JGC.fam.cur, savings: JGC.fam.savings, income: JGC.fam.income, loan: JGC.fam.loan, attitude: JGC.fam.attitude, buddy: JGC.fam.buddy, updated: false };
  }

  /* ---------------- start ---------------- */
  applyLang(LANG, true);
  buildBriefs(); renderMember(); renderThreads(); renderGifts(); renderPledges(); drawDream();
  document.querySelectorAll('[data-count]').forEach(countUp);
  fillBars($('p-home')); fillH($('p-home'));
  renderBrief(0);
  setTimeout(startAuto, 400);
})();
