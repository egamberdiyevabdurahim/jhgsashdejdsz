'use client'
/*
 * web/auth/signin.html's markup and its page script, in React (mig-frontend-poc). The DOM is the page's own: the same elements, classes,
 * ids, attributes and order, so app/(auth)/auth.css (its <style>, byte for byte) draws it as before. What the script did by hand is state:
 * the language (auth.js i18n), the tab, the error line, the busy buttons and the two password eyes. The data-t / data-t-aria hooks the old
 * filler wrote through are gone: the words are rendered from STR.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'
import * as A from '@/lib/auth-client'
import { STR, type Key } from './strings'

type Props = { next: string; role: 'student' | 'parent'; roleAsked: boolean; google: boolean; telegramUrl: string; firstLang: A.Lang }
type Notice = { text: Record<string, { title: string }>; open: (lang: string, from: Element) => void }
const notice = () => (window as unknown as { JG_AI_NOTICE?: Notice }).JG_AI_NOTICE
const WEAK: Record<string, Key> = { 'too-short': 'short', 'is-email': 'isEmail', 'too-common': 'common' }

const EyeOn = () => <svg className="on" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
const EyeOff = () => <svg className="off" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.9 17.9A10.1 10.1 0 0 1 12 19C5.6 19 2 12 2 12a18.5 18.5 0 0 1 5.1-5.9M9.9 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2" /><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" /><path d="M2 2l20 20" /></svg>

export default function SignIn(p: Props) {
  const [lang, setLang] = useState<A.Lang>(p.firstLang)
  const [picked, setPicked] = useState(false)
  const [role, setRole] = useState(p.role)
  const [next, setNext] = useState(p.next)
  const [tab, setTab] = useState<0 | 1>(0)
  const [tabbed, setTabbed] = useState(false)            // select() ran once: both tabs then carry a tabindex, as the old script left them
  const [shown, setShown] = useState<Key | ''>('')
  const [busy, setBusy] = useState({ signin: false, register: false, google: false, telegram: false })
  const [eyes, setEyes] = useState([false, false])
  const [regRole, setRegRole] = useState(p.role)
  const [aiTitle, setAiTitle] = useState<string | null>(null)   // null: the notice script has not arrived; its English line stands
  const [aiGone, setAiGone] = useState(false)
  const tabRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)]
  const signinEmail = useRef<HTMLInputElement>(null), newPw = useRef<HTMLInputElement>(null), aiLink = useRef<HTMLButtonElement>(null)
  const pwInputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const t = (k: Key) => STR[lang][k] || STR.en[k] || ''
  const show = (k: Key | '') => setShown(k)
  const setBusyOf = (k: keyof typeof busy, on: boolean) => setBusy(b => ({ ...b, [k]: on }))

  // On load, as the page script: what a failed attempt or Telegram's return left in this tab, the stored language, the error in the address.
  useEffect(() => {
    const query = new URLSearchParams(location.search), tgReturn = /[#?&]tgAuthResult=/.test(location.hash)
    const kept = A.recall(), last = query.has('error') || tgReturn ? kept : {}
    const r = p.role === 'parent' || (!p.roleAsked && last.role === 'parent') ? 'parent' : 'student'
    const n = A.safeNext(query.has('next') || !last.next ? p.next : last.next)
    setRole(r); setRegRole(r); setNext(n); A.setContext({ role: r })
    try { localStorage.removeItem('jg.uid') } catch { /* private mode */ }   // whoever sees this page is signed out
    const stored = A.storedLang(r)
    setPicked(A.isLang(stored)); setLang(A.pickLang(stored, r, navigator.language))
    if (tgReturn) {
      const payload = A.decodeTgAuthResult(location.hash)
      history.replaceState(null, '', location.pathname + location.search)   // the payload leaves the address bar and this history entry
      if (payload) { setBusyOf('telegram', true); A.signInTelegram(payload, n).catch(() => { setBusyOf('telegram', false); show('failed') }) }
      else show('failed')
    }
    const error = query.get('error')
    if (error) {
      if (last.email && signinEmail.current) signinEmail.current.value = last.email
      show(error === 'CredentialsSignin' ? (query.get('code') === 'rate_limited' ? 'tooMany' : last.method === 'telegram' ? 'failed' : 'wrong') : error === 'OAuthAccountNotLinked' ? 'exists' : 'failed')
      const q = new URLSearchParams()
      if (n !== '/') q.set('next', n)
      if (r === 'parent') q.set('role', r)
      history.replaceState(null, '', location.pathname + (q.toString() ? `?${q}` : ''))
    }
    // back from the page a sign-in went to, restored from the back/forward cache: nothing is under way any more
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) setBusy({ signin: false, register: false, google: false, telegram: false }) }
    addEventListener('pageshow', onShow)
    return () => removeEventListener('pageshow', onShow)
  }, [p.next, p.role, p.roleAsked])

  // The language applied: <html lang>, the title, the jg_lang cookie, the AI line's words, the short-password sentence.
  useEffect(() => {
    document.documentElement.lang = A.htmlLang(lang)
    document.title = STR[lang].docTitle
    A.keepLang(lang, picked)
    const N = notice(); if (N) setAiTitle((N.text[lang] || N.text.en)!.title)
    const el = newPw.current; if (el) el.setCustomValidity([...el.value].length < 8 ? STR[lang].short : '')
  }, [lang, picked])

  function choose(l: A.Lang) { setLang(l); setPicked(true); A.storeLang(l, role) }
  function select(i: 0 | 1, focus?: boolean) { setTab(i); setTabbed(true); show(''); if (focus) tabRefs[i].current?.focus() }
  function eye(i: 0 | 1) {
    setEyes(e => { const n = [...e]; n[i] = !n[i]; return n })
    pwInputs[i].current?.focus()
  }

  function onSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    show(''); setBusyOf('signin', true)
    A.signInPassword(String(d.get('email')).trim(), String(d.get('password')), next).catch(() => { setBusyOf('signin', false); show('failed') })
  }
  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const fields: Record<string, string> = { firstName: String(d.get('firstName')).trim(), lastName: String(d.get('lastName')).trim(), role: String(d.get('role')), email: String(d.get('email')).trim(), password: String(d.get('password')) }
    if ([...fields.password!].length < 8) return show('short')
    const carried = picked || lang !== 'en' ? lang : null; if (carried) fields.lang = carried   // the account starts in this page's language
    show(''); setBusyOf('register', true)
    const r = await A.register(fields, next)
    if (r.ok) return
    setBusyOf('register', false)
    if (r.error === 'created') { select(0); if (signinEmail.current) signinEmail.current.value = fields.email!; return show('failed') }
    show(r.error === 'exists' ? 'exists' : r.error === 'weak' ? WEAK[r.reason ?? ''] || 'failed' : r.error === 'too many' ? 'tooMany'
      : r.error === 'invalid' && A.nameRefused(r.issues) ? 'badName' : 'failed')
  }

  const busyAttrs = (on: boolean) => (on ? { disabled: true, 'aria-busy': 'true' as const } : {})
  const tabAttrs = (i: 0 | 1) => ({ 'aria-selected': tab === i, ...(tabbed || i === 1 ? { tabIndex: tab === i ? 0 : -1 } : {}) })
  const eyeBtn = (i: 0 | 1) => (
    <button type="button" className="pw-eye" aria-pressed={eyes[i]} aria-label={t(eyes[i] ? 'hidePw' : 'showPw')} onClick={() => eye(i)}>
      <EyeOn /><EyeOff />
    </button>
  )
  const social = !!p.telegramUrl || p.google

  return (
    <>
      {/* outside .frame: the frame's rise animation would otherwise contain the fixed desktop switch */}
      <div className="langs" role="group" aria-label={t('lang')}>
        <button type="button" data-lang="uz" lang="uz-Latn" aria-label="Oʻzbekcha" aria-pressed={lang === 'uz'} onClick={() => choose('uz')}>UZ</button>
        <button type="button" data-lang="ru" lang="ru" aria-label="Русский" aria-pressed={lang === 'ru'} onClick={() => choose('ru')}>RU</button>
        <button type="button" data-lang="en" lang="en" aria-label="English" aria-pressed={lang === 'en'} onClick={() => choose('en')}>EN</button>
      </div>
      <main className="frame">
        <header className="hero">
          <svg className="bowl" viewBox="0 0 375 260" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0f3323" />
                <stop offset="1" stopColor="#19553c" />
              </linearGradient>
            </defs>
            <path d="M0 0H375V168Q187.5 336 0 168Z" fill="url(#g)" />
          </svg>
          <div className="mascot"><img src="/d/student-mobile/media/c5b64f4480cda475.webp" width={365} height={420} alt="" draggable={false} /></div>
          <h1>{t('title')}</h1>
        </header>

        <section className="card">
          {/* one plain sentence, a student's page only (the teen walk of 10 Oct 2026) */}
          <p className="pitch" id="pitch" hidden={role === 'parent'}>{t('pitch')}</p>
          <div className="tabs" role="tablist">
            <button ref={tabRefs[0]} type="button" role="tab" id="tab-signin" aria-controls="f-signin" {...tabAttrs(0)} onClick={() => select(0)}
              onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(1, true) } }}>{t('signIn')}</button>
            <button ref={tabRefs[1]} type="button" role="tab" id="tab-register" aria-controls="f-register" {...tabAttrs(1)} onClick={() => select(1)}
              onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(0, true) } }}>{t('createAccount')}</button>
          </div>

          <p className="err" id="err" role="alert" hidden={!shown}>{shown ? t(shown) : ''}</p>

          <div className="social" id="social" hidden={!social}>
            <a className="btn btn-social" id="btn-telegram" href={p.telegramUrl} hidden={!p.telegramUrl} {...busyAttrs(busy.telegram)}
              onClick={() => A.remember({ method: 'telegram', next })}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#27a6e5" /><path fill="#fff" d="M5.4 11.8l11.1-4.3c.5-.2 1 .1.8.9l-1.9 8.9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1l-6.6 4.1-2.8-.9c-.6-.2-.6-.6.1-.9z" /></svg>
              <span>{t('telegram')}</span>
            </a>
            <button type="button" className="btn btn-social" id="btn-google" hidden={!p.google} {...busyAttrs(busy.google)}
              onClick={() => { show(''); setBusyOf('google', true); A.signInGoogle(next).catch(() => { setBusyOf('google', false); show('failed') }) }}>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
              <span>{t('google')}</span>
            </button>
            <p className="or"><span>{t('orEmail')}</span></p>
          </div>

          {/* Ruling R4: the sign-in form comes first, and the create-account form is hidden while Sign in is active. */}
          <form id="f-signin" className="form" role="tabpanel" aria-labelledby="tab-signin" method="post" action="/api/auth/callback/password" hidden={tab !== 0} onSubmit={onSignIn}>
            <label className="field"><span>{t('email')}</span>
              <input ref={signinEmail} type="email" name="email" autoComplete="username" autoCapitalize="off" spellCheck={false} required maxLength={254} /></label>
            <label className="field"><span>{t('password')}</span>
              <span className="pw"><input ref={pwInputs[0]} type={eyes[0] ? 'text' : 'password'} name="password" autoComplete="current-password" required maxLength={128} />{eyeBtn(0)}</span></label>
            <button type="submit" className="btn btn-primary" {...busyAttrs(busy.signin)}>{t('signIn')}</button>
          </form>

          <form id="f-register" className="form" role="tabpanel" aria-labelledby="tab-register" method="post" action="/api/v1/register" hidden={tab !== 1} onSubmit={onRegister}>
            {/* the given name and the surname apart: the student designs write "Surname Given", the parent designs "Given Surname" */}
            <label className="field"><span>{t('firstName')}</span>
              <input type="text" name="firstName" autoComplete="given-name" required maxLength={40} /></label>
            <label className="field"><span>{t('lastName')}</span>
              <input type="text" name="lastName" autoComplete="family-name" required maxLength={40} /></label>
            <div className="roles">
              <label className="role"><input type="radio" name="role" value="student" checked={regRole === 'student'} onChange={() => setRegRole('student')} /><i></i><span>{t('student')}</span></label>
              <label className="role"><input type="radio" name="role" value="parent" checked={regRole === 'parent'} onChange={() => setRegRole('parent')} /><i></i><span>{t('parent')}</span></label>
            </div>
            <label className="field"><span>{t('email')}</span>
              <input type="email" name="email" autoComplete="email" autoCapitalize="off" spellCheck={false} required maxLength={254} /></label>
            {/* the password rule under the field before the button is pressed; the box knows it too (minlength), in this page's words */}
            <label className="field"><span>{t('password')}</span>
              <span className="pw"><input ref={el => { newPw.current = el; pwInputs[1].current = el }} type={eyes[1] ? 'text' : 'password'} name="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-describedby="pw-rule"
                onInput={e => e.currentTarget.setCustomValidity([...e.currentTarget.value].length < 8 ? STR[lang].short : '')} />{eyeBtn(1)}</span>
              <small className="hint" id="pw-rule">{t('rule')}</small></label>
            <button type="submit" className="btn btn-primary" {...busyAttrs(busy.register)}>{t('createAccount')}</button>
            {/* owner 5 Oct 2026: the AI privacy notice, its words in /runtime/jg-ai-notice.js, opened in this page's language */}
            <button ref={aiLink} type="button" className="ai-link" id="ai-notice" aria-haspopup="dialog" hidden={aiGone}
              onClick={() => { const N = notice(); if (N && aiLink.current) N.open(lang, aiLink.current) }}>{aiTitle ?? 'How Jamals Global uses AI'}</button>
          </form>
        </section>
      </main>
      <Script src="/runtime/jg-ai-notice.js?v=4" strategy="afterInteractive"
        onReady={() => { const N = notice(); if (N) setAiTitle((N.text[lang] || N.text.en)!.title); else setAiGone(true) }} />
    </>
  )
}
