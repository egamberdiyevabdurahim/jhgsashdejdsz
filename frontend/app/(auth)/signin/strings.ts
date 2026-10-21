// The sign-in page's words, uz / ru / en, byte for byte from web/auth/signin.html's STR. Until cutover, a change there is made here too.
import type { Lang } from '@/lib/auth-client'
export type Key = keyof typeof STR.en
export const STR = {
  en: {
    docTitle: 'Sign in · Jamals Global', lang: 'Language', title: 'Welcome to Jamals Global',
    signIn: 'Sign in', createAccount: 'Create account', telegram: 'Continue with Telegram', google: 'Continue with Google',
    orEmail: 'or with email', email: 'Email', password: 'Password', firstName: 'First name', lastName: 'Last name', student: "I'm a student", parent: "I'm a parent",
    pitch: 'Your way to university: a short test, your own plan and small steps every day.', rule: 'At least 8 characters.', showPw: 'Show password', hidePw: 'Hide password',
    wrong: 'Wrong email or password.', exists: 'An account with this email already exists.', short: 'Password must be at least 8 characters.',
    isEmail: 'Choose something other than your email address.', common: 'That password is one of the first ones people try. Choose another.',
    failed: 'Something went wrong. Please try again.', tooMany: 'Too many attempts. Please wait a few minutes and try again.', badName: 'Use letters in your name: remove emoji and the symbols < > & ".',
  },
  uz: {
    docTitle: 'Kirish · Jamals Global', lang: 'Til', title: 'Jamals Globalga xush kelibsiz',
    signIn: 'Kirish', createAccount: 'Roʻyxatdan oʻtish', telegram: 'Telegram orqali davom etish', google: 'Google orqali davom etish',
    orEmail: 'yoki email bilan', email: 'Email', password: 'Parol', firstName: 'Ism', lastName: 'Familiya', student: 'Men oʻquvchiman', parent: 'Men ota-onaman',
    pitch: 'Universitetga yoʻlingiz: qisqa test, shaxsiy reja va har kuni kichik qadamlar.', rule: 'Kamida 8 ta belgi.', showPw: 'Parolni koʻrsatish', hidePw: 'Parolni yashirish',
    wrong: 'Email yoki parol notoʻgʻri.', exists: 'Bu email bilan hisob allaqachon bor.', short: 'Parol kamida 8 belgidan iborat boʻlsin.',
    isEmail: 'Parol email manzilingizdan farq qilsin.', common: 'Bu parol juda keng tarqalgan. Boshqasini tanlang.',
    failed: 'Nimadir xato ketdi. Qaytadan urinib koʻring.', tooMany: 'Urinishlar juda koʻp. Bir necha daqiqa kutib, qaytadan urinib koʻring.', badName: 'Ism va familiyada harflar boʻlsin: emoji va < > & " belgilarini olib tashlang.',
  },
  ru: {
    docTitle: 'Вход · Jamals Global', lang: 'Язык', title: 'Добро пожаловать в Jamals Global',
    signIn: 'Войти', createAccount: 'Регистрация', telegram: 'Продолжить через Telegram', google: 'Продолжить через Google',
    orEmail: 'или по email', email: 'Email', password: 'Пароль', firstName: 'Имя', lastName: 'Фамилия', student: 'Я ученик', parent: 'Я родитель',
    pitch: 'Ваш путь в университет: короткий тест, личный план и маленькие шаги каждый день.', rule: 'Не короче 8 символов.', showPw: 'Показать пароль', hidePw: 'Скрыть пароль',
    wrong: 'Неверный email или пароль.', exists: 'Аккаунт с этим email уже существует.', short: 'Пароль должен быть не короче 8 символов.',
    isEmail: 'Пароль не должен совпадать с email.', common: 'Этот пароль слишком распространён. Выберите другой.',
    failed: 'Что-то пошло не так. Попробуйте ещё раз.', tooMany: 'Слишком много попыток. Подождите несколько минут и попробуйте снова.', badName: 'В имени и фамилии используйте буквы: уберите эмодзи и символы < > & ".',
  },
} satisfies Record<Lang, Record<string, string>>
