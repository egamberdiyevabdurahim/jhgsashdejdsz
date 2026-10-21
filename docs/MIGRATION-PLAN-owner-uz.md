# Jamals Global: yangi texnologiyaga oʻtish (bir sahifada)

21-oktabr 2026. Toʻliq texnik reja: `MIGRATION-PLAN.md`.

## Nima oʻzgaradi
- **Server qismi** Python tiliga (FastAPI) oʻtadi. Django REST emas, chunki FastAPI:
  - chat va AI javoblarini oqim bilan yuborishga qulay;
  - bazamizni buzmaydi;
  - serverimizda allaqachon ishlaydi (exam).
- **Ekran qismi** Next.js va React bilan qayta yoziladi.
- Natija: kod oddiy React va oddiy Python boʻladi, hujjatlari bilan. Yangi dasturchi uni tez tushunadi.

## Nima oʻzgarmaydi (bu qoidalar buzilmaydi)
- Toʻrtta dizayn (oʻquvchi va ota-ona; telefon va kompyuter) xuddi chizilgandek qoladi. Piksel farqi 0,000 %.
- Hech kim tizimdan chiqib ketmaydi. Hech kim maʼlumot yoʻqotmaydi.
- Coin, hamyon, vazifa va maxfiylik qoidalari, har bir switch hozirgidek ishlaydi.
- Shular ham oʻzgarmaydi: app.jamals.uz manzili, maʼlumotlar bazasi, Google va Telegram orqali kirish.
- Sayt hech qachon bir necha soniyadan koʻp toʻxtamaydi.

## Qanday qilamiz
- Eski va yangi tizim bir vaqtda, bitta baza bilan yonma-yon ishlaydi.
- Har bir qism avval sinovda eskisi bilan solishtiriladi: javoblar ham, piksellar ham bir xil boʻlishi shart. Shundan keyingina u 1 soniyada yangisiga oʻtkaziladi.
- Biror narsa notoʻgʻri ketsa, tizim oʻzi 1 soniyada eskisiga qaytadi.
- Oʻquvchilar maʼlumoti serverdan tashqariga chiqmaydi.

## Qancha vaqt
Taxminan **47 kun (7 hafta)**, oraligʻi 40–62 kun. Kunlar siz "ha" degan kundan sanaladi:

| Kun | Nima boʻladi |
|---|---|
| ~1 | M1b kodi hozirgi tizimda chiqariladi, hamma yangi switchlar oʻchiq |
| ~12 | Sahifalarni yangi Next.js serveri beradi (koʻrinish oʻzgarmaydi) |
| ~18 | Butun API Python tomonga oʻtadi |
| ~22 | Kirish (login) ham Python tomonga oʻtadi |
| ~29 | Eski Node server oʻchiriladi |
| ~31 | Oʻquvchi ilovasi toʻliq React bilan ishlaydi |
| ~38 | Hisob-kitob yadrosi (engine) toʻliq Python tilida ishlaydi |
| ~47 | Ish tugaydi, hujjatlar tayyor boʻladi |

## Rostini aytsam
- Foydalanuvchi uchun ilova tezligi deyarli oʻzgarmaydi. "Tezroq" degani: keyingi ishlarni jamoa tezroq va osonroq qiladi.
- Foydalanuvchi sezadigan eng katta tezlashtirish bu oʻtishga bogʻliq emas. Sovgʻa filmi fayli faqat ochilganda yuklanadi, shunda har bir sahifa 3 MB yengillashadi. Bu 1 kunlik ish, uni darhol qilamiz.
- Hozir foydalanuvchilar 4 ta (oxirgi sanoq). Oilalar kelishidan oldin oʻtish eng xavfsiz yoʻl.
- Oʻtish davomida (~31 kun) yangi funksiyalar toʻxtatib turiladi.

## Siz hal qilasiz: 6 ta savol
1. **M1b kodini hozir chiqaramizmi?** Hamma yangi switchlar oʻchiq boʻladi. Jamol (AI yordamchi) hozirgidek ishlashda davom etadi. *Tavsiyam: ha.*
2. **~31 kunlik toʻxtatish.** Bu vaqtda yangi funksiyalar qoʻshilmaydi. Kontent, matn tuzatish va shoshilinch tuzatishlar mumkin. Oʻyinlar, liga, toʻlov, chat va jamoa yangi tizimda ishga tushadi. *Tavsiyam: ha.*
3. **Serverda ishlashga doimiy ruxsat.** Ichiga kiradi:
   - faqat oʻqiydigan tekshiruvlar;
   - Caddy faylida bitta qatorni oʻzgartirish;
   - server ichidagi sinovlar;
   - muammo boʻlsa avtomatik orqaga qaytish;
   - AI ni haqiqiy Claude API bilan sinash (bir necha dollar).

   4 ta katta kunda (API, kirish, Node oʻchirish, oʻquvchi React) sizdan bir soʻz "ha" soʻraymiz. *Tavsiyam: ha.*
4. **Pul.**
   - (a) Agar serverda 3,6 GB dan kam boʻsh xotira chiqsa, ikki yoʻl bor: +4 GB RAM sotib olish yoki "tejamkor rejim". Tejamkor rejimda yangilanish paytida 2–5 soniya pauza boʻladi, lekin sayt toʻxtamaydi.
   - (b) Ixtiyoriy: sinovlar uchun alohida server (8 CPU, 16 GB). Shunda kompyuterimiz ishni sekinlatmaydi.

   *Tavsiyam: (a) xotirani oʻlchagandan keyin hal qilamiz; (b) imkon boʻlsa ha.*
5. **Kichik oʻzgarishlar:**
   - hamma uchun yashirilgan 16 ta funksiya hozir koʻchirilmaydi, dizayn ularning namunasi boʻlib qoladi;
   - uz/ru sahifalar tarjima uchun 1,5 soniya yashirinib turmaydi (oxirgi koʻrinish bir xil);
   - sovgʻa filmi faqat ochilganda yuklanadi.

   *Tavsiyam: hammasiga ha.*
6. **Toʻlovlar faqat yangi tizimda ishga tushadi**, Payme va Click sinovlaridan keyin. *Tavsiyam: ha.*

Qolgan texnik tanlovlarni men qilaman. Eng qisqa javob: **"1–6 ha"**.
