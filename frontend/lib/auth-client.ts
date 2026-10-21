/*
 * public/runtime/auth.js as a module (mig-frontend-poc): the same rules, the same storage keys, the same form posts to Auth.js. Sign-ins
 * stay real form posts (a full navigation), so Auth.js sets its own cookie and redirects the browser itself; only registration uses fetch.
 * Section names and order follow auth.js, so a change there is easy to carry here until auth.js goes at cutover.
 */
export type Lang = 'uz' | 'ru' | 'en'
export const LANGS: readonly Lang[] = ['uz', 'ru', 'en']
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v)

// ── where to go afterwards ──
/** The server's rule (src/lib/redirect.ts): one leading slash, not `//` or `/\`, no control characters. */
export function safeNext(v: unknown): string {
  if (typeof v !== 'string' || v.length === 0 || v[0] !== '/') return '/'
  if (v[1] === '/' || v[1] === '\\') return '/'
  return /[\u0000-\u001F\u007F]/.test(v) ? '/' : v
}

const LAST = 'jg.auth.last'
let context: Record<string, string> = {}
export type Last = { role?: string; next?: string; email?: string; method?: string }
export function setContext(v: Record<string, string>) { context = v || {} }
export function remember(v: Last) {
  try { sessionStorage.setItem(LAST, JSON.stringify({ ...context, ...v })) } catch { /* private mode */ }
}
export function recall(): Last {
  try { const v = JSON.parse(sessionStorage.getItem(LAST) || 'null'); sessionStorage.removeItem(LAST); return v || {} } catch { return {} }
}

// ── Auth.js ──
async function csrf(): Promise<string> {
  const j = await fetch('/api/auth/csrf', { credentials: 'same-origin' }).then(r => r.json())
  if (!j || !j.csrfToken) throw new Error('no csrf token')
  return j.csrfToken
}
/** Builds a hidden <form method="post"> and submits it: a full navigation. */
function postForm(action: string, fields: Record<string, string>) {
  const f = document.createElement('form')
  f.method = 'post'; f.action = action; f.hidden = true
  for (const k of Object.keys(fields)) { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = fields[k]!; f.appendChild(i) }
  document.body.appendChild(f)
  f.submit()
}
export async function signInPassword(email: string, password: string, next: string) {
  remember({ method: 'password', next, email })
  const t = await csrf(); postForm('/api/auth/callback/password', { csrfToken: t, email, password, callbackUrl: next })
}
export async function signInGoogle(next: string) {
  remember({ method: 'google', next })
  const t = await csrf(); postForm('/api/auth/signin/google', { csrfToken: t, callbackUrl: next })
}
export async function signInTelegram(payload: Record<string, unknown>, next: string) {
  remember({ method: 'telegram', next })
  const t = await csrf(); postForm('/api/auth/callback/telegram', { csrfToken: t, payload: JSON.stringify(payload), callbackUrl: next })
}

async function postJson(url: string, body: unknown): Promise<{ status: number; body: Record<string, unknown> | null }> {
  try {
    const r = await fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    return { status: r.status, body: await r.json().catch(() => null) }
  } catch { return { status: 0, body: null } }
}
export type RegisterResult = { ok: true } | { ok: false; error: string; reason?: string; issues?: string[] }
/** POST /api/v1/register, then sign in with the same email and password (auth.js register()). */
export async function register(fields: Record<string, string>, next: string): Promise<RegisterResult> {
  const r = await postJson('/api/v1/register', fields)
  if (r.status === 201) {
    try { await signInPassword(fields.email!, fields.password!, next); return { ok: true } } catch { return { ok: false, error: 'created' } }
  }
  const b = r.body ?? {}
  return { ok: false, error: (b.error as string) || 'failed', reason: b.reason as string | undefined, issues: (b.issues as string[]) || [] }
}
/** Whether a 400's issues name the name fields (final review I5). */
export const nameRefused = (issues?: unknown) => Array.isArray(issues) && issues.some(i => i === 'firstName' || i === 'lastName' || i === 'fullName')

// ── Telegram's return: #tgAuthResult=<base64url JSON> ──
function telegramFields(raw: unknown): Record<string, string | number> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const keys = Object.keys(raw)
  if (keys.length === 0 || keys.length > 16) return null
  const out: Record<string, string | number> = {}
  for (const k of keys) {
    const v = (raw as Record<string, unknown>)[k]
    if (!/^[a-z_]{1,32}$/.test(k)) return null
    if (typeof v === 'number' && isFinite(v)) out[k] = v
    else if (typeof v === 'string' && v.length <= 512 && !/[\r\n]/.test(v)) out[k] = v
    else return null
  }
  if (out.id === undefined || out.hash === undefined || out.auth_date === undefined) return null
  return out
}
export function decodeTgAuthResult(fragment: string) {
  const m = /(?:^|[#?&])tgAuthResult=([A-Za-z0-9\-_=]*)$/.exec(fragment) || /^([A-Za-z0-9\-_=]+)$/.exec(fragment)
  if (!m || !m[1]) return null
  try {
    let b64 = m[1].replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/')
    if (b64.length % 4 === 1) return null
    while (b64.length % 4) b64 += '='
    const bin = atob(b64), bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return telegramFields(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)))
  } catch { return null }
}

// ── language ──
/** A stored choice first; Uzbek for parents and uz browsers; Russian for ru browsers; else English. */
export function pickLang(stored: unknown, role: string, navLang: string): Lang {
  if (isLang(stored)) return stored
  const nav = String(navLang || '').toLowerCase()
  if (role === 'parent' || nav.indexOf('uz') === 0) return 'uz'
  if (nav.indexOf('ru') === 0) return 'ru'
  return 'en'
}
/** The stored choice of this browser (auth.js i18n): jg.auth.lang, or a parent's jg.parent.lang. */
export function storedLang(role: string): string | null {
  try { return localStorage.getItem('jg.auth.lang') || (role === 'parent' ? localStorage.getItem('jg.parent.lang') : null) } catch { return null }
}
export function storeLang(lang: Lang, role: string) {
  try { localStorage.setItem('jg.auth.lang', lang); if (role === 'parent') localStorage.setItem('jg.parent.lang', lang) } catch { /* private mode */ }
}
/** carry(): the language this page hands to the account, kept in the cookie jg_lang (a year, this site only) that GET /app reads. */
export function keepLang(lang: Lang, picked: boolean) {
  const l = picked || lang !== 'en' ? lang : null
  try { if (l) document.cookie = `jg_lang=${l}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}` } catch { /* no cookies */ }
  return l
}
export const htmlLang = (l: Lang) => (l === 'uz' ? 'uz-Latn' : l)
