/* DRAFT FOR LEGAL REVIEW (m1 lane "jamol", 20 Oct 2026). The words of /privacy and /terms (web/auth/legal.html), en, uz, ru.
 * The builder's draft until the owner's lawyer has read it; uz and ru are drafts for a native reader. A paragraph starting with "[" is a
 * gap a person must fill (the legal entity, the contact, the hosting region) or a practice not in place yet (account deletion); the page
 * draws it as a warning and must not be published while one is left. Facts as the code has them on 20 Oct 2026. Uzbek in Latin with
 * oʻ gʻ (U+02BB) and the tutuq belgisi ʼ (U+02BC). */
(function (W) {
  'use strict';
  W.JG_LEGAL = {
    en: {
      ui: { lang: 'Language', back: 'Back to the app' },
      draft: 'Draft for legal review. This text is not final and may change before it applies.',
      updated: 'Draft of 20 October 2026',
      privacy: {
        tab: 'Privacy', title: 'Privacy notice',
        intro: 'Jamals Global helps students aged 12 to 18 prepare for university, and lets their parents follow along. This notice says what we collect, why, where it is kept, who sees it and what you can ask us to do.',
        parts: [
          { h: 'Who we are', p: ['Jamals Global, Tashkent, Uzbekistan, runs the student app and the parent app.', '[Legal entity name, registration number and address: to be filled in.]', '[Contact for privacy questions (email or phone): to be filled in.]'] },
          { h: 'What we collect', ul: [
            'Your account: your name, your email or your Telegram sign-in, a password stored only as a secure hash, and a photo if you add one.',
            'Your diagnostic answers: for example your date of birth, school and grade, goals, the universities you choose and your test scores. Some answers are private (money, family, health, sleep): they shape your plan and are never sent to the AI.',
            'What you do in the app: your tasks, lessons, test and homework answers, streaks, coins and study time.',
            'For a parent: the parent account and its link to the child.'] },
          { h: 'What stays on your device', p: ['Your one-line journal stays on your phone or computer only. We never receive or keep it, so nobody at Jamals Global can read it. If you clear the browser or change device, it is gone.'] },
          { h: 'Where it is kept', p: ['Your data is kept in our own database on servers we rent from ServerCore. It travels encrypted (HTTPS).', '[Server location (country or region) and backup policy: to be confirmed.]'] },
          { h: 'The AI helper (Jamol)', p: ['Some features use Claude, an AI service made by Anthropic. The in-app AI notice says exactly what is sent; in short:'], ul: [
            'What you ask Jamol, a lesson\'s own text, the question behind a hint (without its answer), your IELTS Writing paragraph, and your journal only when you tap "Find my essay seeds".',
            'Never your name, phone, email or photo.',
            'We do not keep what you ask Jamol, only how many questions you asked and what they cost. We keep what the AI wrote about your plan or your writing for 180 days.',
            'A student\'s own written words go to the AI only from age 14, or with a parent\'s agreement.'] },
          { h: 'Who can see your data', ul: [
            'You.',
            'A parent who linked to your account sees your day, your week, your tasks, your readiness and your lesson results. A parent never sees your journal.',
            'Jamals Global staff who teach or support you can see your learning progress.',
            'Nobody else. We do not sell your data and we show no advertising.'] },
          { h: 'Other services the pages use', ul: [
            'Fonts load from Google Fonts, which sees your device\'s internet address.',
            'If you sign in with Telegram, Telegram confirms who you are.',
            'Payments are not available yet. When they open, a payment provider will handle card details; we will not see your full card number.'] },
          { h: 'How long we keep it', p: ['Your account data is kept while your account exists. What the AI wrote is deleted after 180 days.', '[Retention of usage counts, logs and backups after an account is closed: to be decided.]'] },
          { h: 'What you can ask us', p: ['You, or a parent for a student under 18, can ask to see your data, to correct it, or to delete your account and its data.', '[NOT IN PLACE YET: a deletion process. There is no self-service deletion today; until a written process exists, this section cannot be published.]'] },
          { h: 'Changes', p: ['If this notice changes in a way that matters, the app will tell you before the change applies.'] }
        ]
      },
      terms: {
        tab: 'Terms', title: 'Terms of use',
        intro: 'These terms are the rules for using the Jamals Global student and parent apps. By creating an account you agree to them; a student under 18 uses the app with a parent\'s knowledge.',
        parts: [
          { h: 'The service', p: ['The app builds a study plan towards the universities a student chooses, with daily tasks, lessons, checks and a helper called Jamol. The parent app shows how the student is doing.'] },
          { h: 'Your account', ul: [
            'Use your real name and keep your password to yourself. One account is for one person.',
            'Students under 14 need a parent\'s agreement for the features that send their own written words to the AI.',
            'Tell us if you think someone else is using your account.'] },
          { h: 'Plans, chances and the AI', ul: [
            'Your plan, readiness and chances are estimates from what you told us and what the app measured. They are not a promise of admission.',
            'Deadlines, scores and requirements come from our own records; check them with the university before you rely on them.',
            'Jamol\'s answers can be wrong. Check anything important with your teacher.'] },
          { h: 'What you write', p: ['What you write stays yours. You let us store and use it only to run the app for you. Do not post bullying, hate, sexual content, violence, personal contact details or outside links. We may remove content that breaks these rules.'] },
          { h: 'Coins and rewards', p: ['Coins are earned for right answers and steady work. They have no money value and cannot be exchanged for cash.', '[Rewards that cost coins (devices, tutoring, counselor sessions) must not be offered until they can be delivered: to be reviewed.]'] },
          { h: 'Paid plans', p: ['Payments are not available yet: the plans in the app are shown for information. Before anyone can pay, the price, what is included, how renewal works and how to cancel will be shown clearly.', '[Payment terms, refunds and the parent\'s role as the payer: to be written with the payment provider\'s rules.]'] },
          { h: 'Ending', p: ['You can stop using the app at any time. We may suspend an account that breaks these terms or puts others at risk.'] },
          { h: 'Law and contact', p: ['[Governing law (the Republic of Uzbekistan is assumed), limits of liability and the contact for questions: to be completed by a lawyer.]'] }
        ]
      }
    },
    uz: {
      ui: { lang: 'Til', back: 'Ilovaga qaytish' },
      draft: 'Yurist koʻrib chiqishi uchun qoralama. Bu matn yakuniy emas va kuchga kirishidan oldin oʻzgarishi mumkin.',
      updated: '2026-yil 20-oktyabrdagi qoralama',
      privacy: {
        tab: 'Maxfiylik', title: 'Maxfiylik toʻgʻrisida bildirishnoma',
        intro: 'Jamals Global 12–18 yoshli oʻquvchilarga universitetga tayyorlanishda yordam beradi, ota-onalar esa jarayonni kuzatib boradi. Bu bildirishnomada nimani toʻplashimiz, nima uchun, qayerda saqlashimiz, kim koʻrishi va bizdan nimani soʻrashingiz mumkinligi yozilgan.',
        parts: [
          { h: 'Biz kimmiz', p: ['Talaba va ota-ona ilovalarini Toshkentdagi Jamals Global yuritadi.', '[Yuridik shaxs nomi, roʻyxatdan oʻtish raqami va manzili: toʻldirilishi kerak.]', '[Maxfiylik boʻyicha savollar uchun aloqa (email yoki telefon): toʻldirilishi kerak.]'] },
          { h: 'Nimalarni toʻplaymiz', ul: [
            'Hisobingiz: ismingiz, emailingiz yoki Telegram orqali kirishingiz, faqat xavfsiz xesh koʻrinishida saqlanadigan parol va qoʻshsangiz rasmingiz.',
            'Diagnostika javoblaringiz: masalan, tugʻilgan sanangiz, maktabingiz va sinfingiz, maqsadlaringiz, tanlagan universitetlaringiz va test ballaringiz. Baʼzi javoblar shaxsiy (pul, oila, sogʻliq, uyqu): ular rejangizga taʼsir qiladi va sunʼiy intellektga hech qachon yuborilmaydi.',
            'Ilovadagi faoliyatingiz: vazifalar, darslar, test va uy vazifasi javoblari, ketma-ket kunlar, tangalar va oʻqish vaqti.',
            'Ota-ona uchun: ota-ona hisobi va uning farzand bilan bogʻlanishi.'] },
          { h: 'Qurilmangizda qoladigan narsa', p: ['Bir qatorli kundaligingiz faqat telefoningiz yoki kompyuteringizda saqlanadi. Biz uni hech qachon olmaymiz va saqlamaymiz, shuning uchun Jamals Global jamoasidan hech kim uni oʻqiy olmaydi. Brauzerni tozalasangiz yoki qurilmani almashtirsangiz, u yoʻqoladi.'] },
          { h: 'Qayerda saqlanadi', p: ['Maʼlumotlaringiz ServerCore kompaniyasidan ijaraga olingan serverlardagi oʻz maʼlumotlar bazamizda saqlanadi. Ular shifrlangan holda (HTTPS) uzatiladi.', '[Server joylashuvi (davlat yoki hudud) va zaxira nusxa siyosati: tasdiqlanishi kerak.]'] },
          { h: 'Sunʼiy intellekt yordamchisi (Jamol)', p: ['Baʼzi imkoniyatlar Anthropic kompaniyasining Claude sunʼiy intellekt xizmatidan foydalanadi. Nima yuborilishi ilovadagi sunʼiy intellekt bildirishnomasida aniq yozilgan; qisqasi:'], ul: [
            'Jamoldan soʻraganingiz, darsning oʻz matni, maslahat uchun savol (javobisiz), IELTS Writing paragrafingiz va faqat «Esse gʻoyalarimni topish» tugmasini bossangiz kundaligingiz.',
            'Ismingiz, telefoningiz, emailingiz va rasmingiz hech qachon yuborilmaydi.',
            'Jamoldan soʻraganlaringizni saqlamaymiz, faqat nechta savol berganingiz va ular qanchaga tushganini saqlaymiz. Sunʼiy intellekt rejangiz yoki yozganingiz haqida yozgan matnni 180 kun saqlaymiz.',
            'Oʻquvchining oʻzi yozgan matni sunʼiy intellektga faqat 14 yoshdan yoki ota-onaning roziligi bilan yuboriladi.'] },
          { h: 'Maʼlumotlaringizni kim koʻradi', ul: [
            'Siz.',
            'Hisobingizga bogʻlangan ota-ona kuningiz, haftangiz, vazifalaringiz, tayyorgarligingiz va dars natijalaringizni koʻradi. Ota-ona kundaligingizni hech qachon koʻrmaydi.',
            'Sizga dars beradigan yoki yordam beradigan Jamals Global xodimlari oʻqishdagi yutuqlaringizni koʻra oladi.',
            'Boshqa hech kim. Maʼlumotlaringizni sotmaymiz va reklama koʻrsatmaymiz.'] },
          { h: 'Sahifalar foydalanadigan boshqa xizmatlar', ul: [
            'Shriftlar Google Fonts xizmatidan yuklanadi, u qurilmangizning internet manzilini koʻradi.',
            'Telegram orqali kirsangiz, kimligingizni Telegram tasdiqlaydi.',
            'Toʻlovlar hali mavjud emas. Ular ochilganda karta maʼlumotlari bilan toʻlov xizmati ishlaydi; biz kartangizning toʻliq raqamini koʻrmaymiz.'] },
          { h: 'Qancha vaqt saqlaymiz', p: ['Hisob maʼlumotlari hisobingiz mavjud ekan saqlanadi. Sunʼiy intellekt yozgan matnlar 180 kundan keyin oʻchiriladi.', '[Hisob yopilgandan keyin foydalanish hisoblari, jurnallar va zaxira nusxalarni saqlash muddati: hal qilinishi kerak.]'] },
          { h: 'Bizdan nimani soʻrashingiz mumkin', p: ['Siz yoki 18 yoshga toʻlmagan oʻquvchining ota-onasi maʼlumotlarni koʻrishni, tuzatishni yoki hisob va uning maʼlumotlarini oʻchirishni soʻrashi mumkin.', '[HALI JORIY ETILMAGAN: oʻchirish tartibi. Bugun oʻzingiz oʻchirish imkoni yoʻq; yozma tartib boʻlmaguncha bu boʻlim eʼlon qilinmaydi.]'] },
          { h: 'Oʻzgarishlar', p: ['Agar bildirishnoma muhim tarzda oʻzgarsa, ilova oʻzgarish kuchga kirishidan oldin sizga xabar beradi.'] }
        ]
      },
      terms: {
        tab: 'Shartlar', title: 'Foydalanish shartlari',
        intro: 'Bu shartlar Jamals Global talaba va ota-ona ilovalaridan foydalanish qoidalaridir. Hisob ochish orqali siz ularga rozilik bildirasiz; 18 yoshga toʻlmagan oʻquvchi ilovadan ota-onasining xabari bilan foydalanadi.',
        parts: [
          { h: 'Xizmat', p: ['Ilova oʻquvchi tanlagan universitetlar sari oʻqish rejasini tuzadi: kundalik vazifalar, darslar, tekshiruvlar va Jamol ismli yordamchi bilan. Ota-ona ilovasi oʻquvchining ahvolini koʻrsatadi.'] },
          { h: 'Hisobingiz', ul: [
            'Haqiqiy ismingizdan foydalaning va parolingizni hech kimga bermang. Bitta hisob bitta odam uchun.',
            '14 yoshga toʻlmagan oʻquvchilar oʻzlari yozgan matnni sunʼiy intellektga yuboradigan imkoniyatlar uchun ota-onasining roziligiga muhtoj.',
            'Hisobingizdan boshqa kimdir foydalanayotgan deb oʻylasangiz, bizga xabar bering.'] },
          { h: 'Rejalar, imkoniyatlar va sunʼiy intellekt', ul: [
            'Rejangiz, tayyorgarligingiz va imkoniyatlaringiz siz aytgan va ilova oʻlchagan narsalarga asoslangan taxmindir. Ular qabul qilinishga vaʼda emas.',
            'Muddatlar, ballar va talablar bizning oʻz yozuvlarimizdan olinadi; ularga tayanishdan oldin universitet bilan tekshiring.',
            'Jamolning javoblari xato boʻlishi mumkin. Muhim narsalarni oʻqituvchingiz bilan tekshiring.'] },
          { h: 'Siz yozgan narsalar', p: ['Siz yozgan narsalar sizniki boʻlib qoladi. Ularni faqat ilovani siz uchun ishlatish maqsadida saqlash va ishlatishga ruxsat berasiz. Haqorat, nafrat, jinsiy mazmun, zoʻravonlik, shaxsiy aloqa maʼlumotlari yoki tashqi havolalarni joylamang. Bu qoidalarni buzgan narsalarni oʻchirib tashlashimiz mumkin.'] },
          { h: 'Tangalar va mukofotlar', p: ['Tangalar toʻgʻri javoblar va muntazam ish uchun beriladi. Ularning pul qiymati yoʻq va naqd pulga almashtirilmaydi.', '[Tangaga olinadigan mukofotlar (qurilmalar, repetitorlik, maslahatchi bilan suhbat) yetkazib berish imkoni boʻlmaguncha taklif qilinmasligi kerak: koʻrib chiqilishi kerak.]'] },
          { h: 'Pullik tariflar', p: ['Toʻlovlar hali mavjud emas: ilovadagi tariflar maʼlumot uchun koʻrsatilgan. Kimdir toʻlov qilishidan oldin narx, nima kirishi, avtomatik uzaytirish qanday ishlashi va qanday bekor qilish aniq koʻrsatiladi.', '[Toʻlov shartlari, pulni qaytarish va toʻlovchi sifatida ota-onaning roli: toʻlov xizmati qoidalari bilan yozilishi kerak.]'] },
          { h: 'Foydalanishni tugatish', p: ['Ilovadan istalgan vaqtda foydalanishni toʻxtatishingiz mumkin. Bu shartlarni buzgan yoki boshqalarga xavf tugʻdirgan hisobni toʻxtatib qoʻyishimiz mumkin.'] },
          { h: 'Qonun va aloqa', p: ['[Amaldagi qonun (Oʻzbekiston Respublikasi deb taxmin qilinadi), javobgarlik chegaralari va savollar uchun aloqa: yurist tomonidan toʻldirilishi kerak.]'] }
        ]
      }
    },
    ru: {
      ui: { lang: 'Язык', back: 'Вернуться в приложение' },
      draft: 'Черновик для проверки юристом. Текст не окончательный и может измениться до вступления в силу.',
      updated: 'Черновик от 20 октября 2026 года',
      privacy: {
        tab: 'Конфиденциальность', title: 'Уведомление о конфиденциальности',
        intro: 'Jamals Global помогает ученикам 12–18 лет готовиться к поступлению в университет, а родителям — следить за их успехами. Здесь написано, что мы собираем, зачем, где храним, кто это видит и о чём вы можете нас попросить.',
        parts: [
          { h: 'Кто мы', p: ['Приложения для учеников и родителей работают под управлением Jamals Global, Ташкент, Узбекистан.', '[Название юридического лица, регистрационный номер и адрес: заполнить.]', '[Контакт по вопросам конфиденциальности (email или телефон): заполнить.]'] },
          { h: 'Что мы собираем', ul: [
            'Ваш аккаунт: имя, email или вход через Telegram, пароль, который хранится только в виде защищённого хеша, и фото, если вы его добавите.',
            'Ответы диагностики: например, дата рождения, школа и класс, цели, выбранные университеты и баллы тестов. Некоторые ответы личные (деньги, семья, здоровье, сон): они влияют на ваш план и никогда не отправляются ИИ.',
            'Ваши действия в приложении: задания, уроки, ответы в тестах и домашних заданиях, серии дней, монеты и время учёбы.',
            'Для родителя: аккаунт родителя и его связь с ребёнком.'] },
          { h: 'Что остаётся на вашем устройстве', p: ['Ваш дневник в одну строку хранится только на вашем телефоне или компьютере. Мы его не получаем и не храним, поэтому никто в Jamals Global не может его прочитать. Если вы очистите браузер или смените устройство, он пропадёт.'] },
          { h: 'Где хранятся данные', p: ['Ваши данные хранятся в нашей собственной базе данных на серверах, которые мы арендуем у ServerCore. Они передаются в зашифрованном виде (HTTPS).', '[Расположение серверов (страна или регион) и политика резервного копирования: подтвердить.]'] },
          { h: 'ИИ-помощник (Жамол)', p: ['Некоторые функции используют Claude — сервис ИИ компании Anthropic. Что именно отправляется, написано в уведомлении об ИИ в приложении; коротко:'], ul: [
            'То, что вы спрашиваете у Жамола, текст самого урока, вопрос для подсказки (без ответа), ваш абзац IELTS Writing и ваш дневник — только когда вы нажмёте «Найти идеи для эссе».',
            'Никогда — ваше имя, телефон, email и фото.',
            'Мы не храним то, что вы спрашиваете у Жамола, — только сколько вопросов вы задали и сколько они стоили. То, что ИИ написал о вашем плане или вашем тексте, мы храним 180 дней.',
            'Собственные тексты ученика отправляются ИИ только с 14 лет или с согласия родителя.'] },
          { h: 'Кто видит ваши данные', ul: [
            'Вы.',
            'Родитель, связанный с вашим аккаунтом, видит ваш день, неделю, задания, готовность и результаты уроков. Ваш дневник родитель не видит никогда.',
            'Сотрудники Jamals Global, которые вас учат или поддерживают, видят ваши учебные успехи.',
            'Больше никто. Мы не продаём ваши данные и не показываем рекламу.'] },
          { h: 'Другие сервисы, которые используют страницы', ul: [
            'Шрифты загружаются из Google Fonts, который видит интернет-адрес вашего устройства.',
            'Если вы входите через Telegram, Telegram подтверждает, кто вы.',
            'Оплата пока недоступна. Когда она появится, данные карты будет обрабатывать платёжный сервис; полный номер вашей карты мы не увидим.'] },
          { h: 'Как долго мы храним данные', p: ['Данные аккаунта хранятся, пока существует аккаунт. Тексты, написанные ИИ, удаляются через 180 дней.', '[Срок хранения счётчиков использования, журналов и резервных копий после закрытия аккаунта: решить.]'] },
          { h: 'О чём вы можете нас попросить', p: ['Вы или родитель ученика младше 18 лет можете попросить показать данные, исправить их или удалить аккаунт и его данные.', '[ПОКА НЕ ВВЕДЕНО: порядок удаления. Сейчас удалить аккаунт самостоятельно нельзя; пока нет письменного порядка, этот раздел не публикуется.]'] },
          { h: 'Изменения', p: ['Если уведомление изменится существенно, приложение сообщит вам об этом до вступления изменений в силу.'] }
        ]
      },
      terms: {
        tab: 'Условия', title: 'Условия использования',
        intro: 'Эти условия — правила пользования приложениями Jamals Global для учеников и родителей. Создавая аккаунт, вы соглашаетесь с ними; ученик младше 18 лет пользуется приложением с ведома родителя.',
        parts: [
          { h: 'Сервис', p: ['Приложение строит учебный план к университетам, которые выбрал ученик: ежедневные задания, уроки, проверки и помощник по имени Жамол. Приложение для родителей показывает, как идут дела у ученика.'] },
          { h: 'Ваш аккаунт', ul: [
            'Используйте настоящее имя и никому не сообщайте пароль. Один аккаунт — для одного человека.',
            'Ученикам младше 14 лет нужно согласие родителя для функций, которые отправляют их собственные тексты ИИ.',
            'Сообщите нам, если думаете, что вашим аккаунтом пользуется кто-то другой.'] },
          { h: 'Планы, шансы и ИИ', ul: [
            'Ваш план, готовность и шансы — это оценки по тому, что вы рассказали и что измерило приложение. Это не обещание поступления.',
            'Сроки, баллы и требования берутся из наших собственных записей; проверяйте их в университете, прежде чем на них полагаться.',
            'Ответы Жамола могут быть неверными. Важное проверяйте у своего преподавателя.'] },
          { h: 'То, что вы пишете', p: ['То, что вы пишете, остаётся вашим. Вы разрешаете нам хранить и использовать это только для работы приложения для вас. Не публикуйте травлю, ненависть, сексуальный контент, насилие, личные контакты и внешние ссылки. Мы можем удалить то, что нарушает эти правила.'] },
          { h: 'Монеты и награды', p: ['Монеты начисляются за правильные ответы и регулярную работу. У них нет денежной стоимости, и их нельзя обменять на деньги.', '[Награды за монеты (устройства, занятия с репетитором, консультации) нельзя предлагать, пока их нельзя выдать: пересмотреть.]'] },
          { h: 'Платные тарифы', p: ['Оплата пока недоступна: тарифы в приложении показаны для информации. Прежде чем кто-то сможет заплатить, будут чётко показаны цена, что входит в тариф, как работает продление и как отменить подписку.', '[Условия оплаты, возвраты и роль родителя как плательщика: написать вместе с правилами платёжного сервиса.]'] },
          { h: 'Прекращение', p: ['Вы можете перестать пользоваться приложением в любое время. Мы можем приостановить аккаунт, который нарушает эти условия или создаёт угрозу для других.'] },
          { h: 'Право и контакты', p: ['[Применимое право (предполагается Республика Узбекистан), ограничение ответственности и контакт для вопросов: заполнить юристу.]'] }
        ]
      }
    }
  };
})(window);
