/**
 * React fidelity (mig-frontend-poc): the React page against today's page, pixel for pixel, by tests/smoke/fidelity.ts's method.
 *
 *   OLD = the current app (the legacy checkout JG_LEGACY_DIR: npm run dev there, ENGINE_LIVE=1, port 3234), NEW = this app (next start, port 3235)
 *   npx tsx tests/fidelity-react.ts            (FID_ONLY=signin or FID_ONLY=app for one half)
 *
 * Each case: today's page loaded twice (the pixels that differ between those two loads are time and motion, left out as noise, as
 * fidelity.ts does), the React page once, all settled the same way (network idle, fonts, 2.5 s, one repaint) with reduced motion; a
 * pixel differs when a channel is more than 24 apart. Cases: /signin and the student's /app (phone design, ?view=mobile) at 390x844
 * (a phone) and 1440x900 (a laptop), in Uzbek and Russian. Also compared: the DOM, every element of <body> as tag#id.class in order
 * (scripts left out), and the text of the page. The target is 0.000 %; a difference is a bug of the port, never a threshold.
 */
import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright-core'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const OLD = process.env.FID_OLD ?? 'http://localhost:3234', NEW = process.env.FID_NEW ?? 'http://localhost:3235'
const CHROME = process.env.SMOKE_CHROME ?? 'D:/tools/chs/chrome-headless-shell/win64-154.0.8037.92/chrome-headless-shell-win64/chrome-headless-shell.exe'
const OUT = path.resolve('tests/out/fidelity'); mkdirSync(OUT, { recursive: true })
const ONLY = process.env.FID_ONLY ?? ''
const PHONE: BrowserContextOptions = { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148', reducedMotion: 'reduce' }
const DESKTOP: BrowserContextOptions = { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }
const SIZES = [['390x844', PHONE], ['1440x900', DESKTOP]] as const
const LANGS = ['uz', 'ru'] as const
const LOCALE = { uz: 'uz-UZ', ru: 'ru-RU' } as const
const PASSWORD = 'correct horse battery', stamp = Date.now()

async function repaint(page: Page) {   // fidelity.ts repaint(): one full repaint of the settled page, no change of layout
  await page.evaluate(`(async () => {
    const root = document.documentElement, was = root.style.getPropertyValue('visibility'), pri = root.style.getPropertyPriority('visibility')
    const frames = n => new Promise(ok => { const go = m => (m ? requestAnimationFrame(() => go(m - 1)) : ok()); go(n) })
    root.style.setProperty('visibility', 'hidden', 'important'); await frames(3)
    if (was) root.style.setProperty('visibility', was, pri); else root.style.removeProperty('visibility')
    await frames(3)
  })()`)
  await page.waitForTimeout(200)
}
/**
 * The second measurement: every layer drawn again from nothing (the root out of the layout for three frames, then back), on both pages
 * alike. A composited layer (will-change: transform: the score bubbles, the roadmap's eye) keeps the sub-pixel phase of its first raster,
 * so its anti-aliasing depends on when it was first painted, not on what the page is: on today's page every element is there before the
 * first paint; with the bridge the design scripts still build part of the page after it. The first number is fidelity.ts's method as it
 * is; this one tells a difference of the page (it stays) from one of paint history (it goes).
 */
async function reraster(page: Page) {
  await page.evaluate(`(async () => {
    const root = document.documentElement, frames = n => new Promise(ok => { const go = m => (m ? requestAnimationFrame(() => go(m - 1)) : ok()); go(n) })
    const was = root.style.getPropertyValue('display'), pri = root.style.getPropertyPriority('display')
    root.style.setProperty('display', 'none', 'important'); await frames(3)
    if (was) root.style.setProperty('display', was, pri); else root.style.removeProperty('display')
    await frames(3)
  })()`)
  await page.waitForTimeout(300)
}
async function settle(page: Page, react: boolean) {
  await page.waitForLoadState('networkidle')
  if (react && new URL(page.url()).pathname === '/app') await page.waitForSelector('html[data-jg-legacy=ready]', { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await page.waitForTimeout(2500)
  await repaint(page)
}
/** The body's elements in order as tag#id.class (scripts and Next's own nodes left out), and the page's text */
async function dom(page: Page) {
  return page.evaluate(`(() => {
    // Next's own nodes: the route announcer, and the empty <div hidden> its streamed metadata uses at the top of <body> (Next 15.2+)
    const nextOwn = e => e.parentElement === document.body && e.localName === 'div' && e.hidden && e.attributes.length === 1 && !e.children.length && !e.textContent.trim()
    const skip = e => e.localName === 'script' || e.localName === 'next-route-announcer' || e.localName === 'template' || e.hasAttribute('data-nextjs-toast') || nextOwn(e)
    const out = []
    const walk = e => { for (const c of e.children) { if (skip(c)) continue; out.push(c.localName + (c.id ? '#' + c.id : '') + (c.classList.length ? '.' + [...c.classList].sort().join('.') : '') + (c.hidden ? '[hidden]' : '')); walk(c) } }
    walk(document.body)
    return { els: out, text: document.body.innerText, lang: document.documentElement.lang, title: document.title }
  })()`) as Promise<{ els: string[]; text: string; lang: string; title: string }>
}
type Act = (page: Page) => Promise<void>
async function shot(browser: Browser, ctx: BrowserContextOptions, url: string, react: boolean, act?: Act) {
  const c = await browser.newContext(ctx)
  await c.addInitScript('window.__name = window.__name || (f => f)')
  const page = await c.newPage()
  const errors: string[] = []
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)))
  await page.goto(url)
  if (act) { await page.waitForLoadState('networkidle'); await act(page) }
  await settle(page, react)
  const png = await page.screenshot(), d = await dom(page)
  await reraster(page)
  const png2 = await page.screenshot()
  await c.close()
  return { png, png2, d, errors }
}
async function compare(page: Page, design: Buffer, design2: Buffer, app: Buffer) {   // fidelity.ts compare(), unchanged
  return page.evaluate(async ([s1, s2, s3]) => {
    const load = (s: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = `data:image/png;base64,${s}` })
    const read = (i: HTMLImageElement) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d')!; g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height) }
    const [A, A2, B] = [read(await load(s1)), read(await load(s2)), read(await load(s3))]
    if (A.width !== B.width || A.height !== B.height) return { pct: 100, noisePct: 0, cells: [] as number[][], png: '' }
    const differs = (P: ImageData, Q: ImageData, i: number) => Math.max(Math.abs(P.data[i]! - Q.data[i]!), Math.abs(P.data[i + 1]! - Q.data[i + 1]!), Math.abs(P.data[i + 2]! - Q.data[i + 2]!)) > 24
    const out = document.createElement('canvas'); out.width = A.width; out.height = A.height
    const g = out.getContext('2d')!, img = g.createImageData(A.width, A.height), cells = new Map<string, number>()
    let px = 0, noise = 0
    for (let i = 0; i < A.data.length; i += 4) {
      img.data[i + 3] = 255
      if (differs(A, A2, i)) { noise++; img.data[i + 2] = 160; continue }
      if (!differs(A, B, i)) { img.data[i] = img.data[i + 1] = img.data[i + 2] = 235; continue }
      px++; img.data[i] = 220
      const p = i / 4, k = `${Math.floor((p % A.width) / 16) * 16},${Math.floor(p / A.width / 16) * 16}`
      cells.set(k, (cells.get(k) ?? 0) + 1)
    }
    g.putImageData(img, 0, 0)
    const total = A.width * A.height
    return { pct: (px / total) * 100, noisePct: (noise / total) * 100, cells: [...cells].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, n]) => [...k.split(',').map(Number), n]), png: out.toDataURL('image/png').split(',')[1]! }
  }, [design.toString('base64'), design2.toString('base64'), app.toString('base64')] as const)
}
function domDiff(a: string[], b: string[]) {
  const out: string[] = []
  for (let i = 0; i < Math.max(a.length, b.length) && out.length < 6; i++) if (a[i] !== b[i]) out.push(`#${i}: ${a[i]} | ${b[i]}`)
  return out
}

/** A live student in `lang`, past the diagnostic and the unlock (fidelity.ts realFamily), signed in: the storage state to open /app with */
async function student(browser: Browser, lang: 'uz' | 'ru') {
  const email = `mig-fe-${lang}-${stamp}@example.test`
  const r = await fetch(`${OLD}/api/v1/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PASSWORD, firstName: lang === 'uz' ? 'Madina' : 'Мадина', lastName: lang === 'uz' ? 'Karimova' : 'Каримова', role: 'student', lang }) })
  if (r.status !== 201) throw new Error(`register ${lang}: ${r.status}`)
  const c = await browser.newContext(PHONE)
  await c.addInitScript('window.__name = window.__name || (f => f)')
  const page = await c.newPage()
  await page.goto(`${OLD}/signin?next=/app`)
  await page.fill('#f-signin input[type=email]', email); await page.fill('#f-signin input[type=password]', PASSWORD)
  await Promise.all([page.waitForURL(u => u.pathname === '/app', { timeout: 90000 }), page.click('#f-signin button[type=submit]')])
  await page.goto(`${OLD}/app?view=mobile`, { waitUntil: 'load', timeout: 120000 })   // (the dev server may still be compiling /app at the redirect)
  await page.waitForFunction('!!window.JG_BOOT', null, { timeout: 120000 })
  const answers = JSON.parse(readFileSync(path.join(path.resolve(process.env.JG_LEGACY_DIR ?? '../../Jamals Global'), 'tests/fixtures/engine/design-mock/design-mock.json'), 'utf8')).answers.demo
  await page.evaluate(async a => {
    const B = (window as unknown as { JG_BOOT: { uid: string; engine: { profile_version: number } } }).JG_BOOT
    const post = (body: unknown) => fetch('/api/v1/engine/commit', { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid }, body: JSON.stringify(body) }).then(r => r.json())
    const d = await post({ kind: 'diagnostic_done', base_version: B.engine.profile_version, payload: { answers: a }, client_id: `mig-diag-${Date.now()}` })
    await post({ kind: 'unlock', base_version: d.snapshot.profile_version, payload: { parallel: ['KR', 'TR'] }, client_id: `mig-unlock-${Date.now()}` })
  }, answers)
  // two warm-up loads, so what the page shows once a day (and saves) has been shown before the loads that are compared
  for (const view of ['mobile', 'desktop']) for (let i = 0; i < 2; i++) { await page.goto(`${OLD}/app?view=${view}`); await settle(page, false) }
  const state = await c.storageState()
  await c.close()
  return { email, state }
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const report: Record<string, unknown> = {}
let failed = false
try {
  const cc = await browser.newContext(); await cc.addInitScript('window.__name = window.__name || (f => f)')
  const cmp = await cc.newPage()
  const cases: { name: string; ctx: BrowserContextOptions; old: string; neu: string; act?: Act }[] = []
  if (ONLY !== 'app') for (const lang of LANGS) for (const [size, base] of SIZES) cases.push({ name: `signin-${lang}-${size}`, ctx: { ...base, locale: LOCALE[lang] }, old: `${OLD}/signin?next=/app`, neu: `${NEW}/signin?next=/app` })
  // the page's states: the Create account tab (its role cards, the password rule, the AI line), a failed sign-in's error, an eye pressed
  const register: Act = async page => { await page.click('#tab-register') }
  const eye: Act = async page => { await page.fill('#f-signin input[name=password]', 'secret12'); await page.click('#f-signin .pw-eye'); await page.locator('#f-signin input[name=password]').blur() }
  if (ONLY !== 'app') for (const lang of LANGS) for (const [size, base] of SIZES) {
    const ctx = { ...base, locale: LOCALE[lang] }
    cases.push({ name: `signin-register-${lang}-${size}`, ctx, old: `${OLD}/signin?next=/app`, neu: `${NEW}/signin?next=/app`, act: register })
    cases.push({ name: `signin-error-${lang}-${size}`, ctx, old: `${OLD}/signin?error=CredentialsSignin&next=/app`, neu: `${NEW}/signin?error=CredentialsSignin&next=/app` })
    cases.push({ name: `signin-eye-${lang}-${size}`, ctx, old: `${OLD}/signin?next=/app`, neu: `${NEW}/signin?next=/app`, act: eye })
  }
  if (ONLY !== 'signin') for (const lang of LANGS) {
    const s = await student(browser, lang)
    // the laptop app (student-desktop): the generated shell and the bridge only, nothing ported yet: the baseline every app starts from
    cases.push({ name: `app-desktop-${lang}-1440x900`, ctx: { ...DESKTOP, locale: LOCALE[lang], storageState: s.state }, old: `${OLD}/app?view=desktop`, neu: `${NEW}/app?view=desktop` })
    for (const [size, base] of SIZES) {
      const ctx = { ...base, locale: LOCALE[lang], storageState: s.state }, old = `${OLD}/app?view=mobile`, neu = `${NEW}/app?view=mobile`
      cases.push({ name: `app-${lang}-${size}`, ctx, old, neu })
      // the tab bar (005.js, ported): Today, then Explore, opened by a tap as a student does; the bar's lens and the views it shows
      if (!process.env.FID_HOME_ONLY) for (const [tab, i] of [['today', 0], ['explore', 1]] as const)
        cases.push({ name: `app-${tab}-${lang}-${size}`, ctx, old, neu, act: async page => {
          if (new URL(page.url()).port === new URL(NEW).port) await page.waitForSelector('html[data-jg-legacy=ready]', { timeout: 60000 })
          await page.waitForTimeout(1500); await page.click(`#tb-track button.tb-item[data-i="${i}"]`)
        } })
    }
  }
  for (const k of cases) {
    const o1 = await shot(browser, k.ctx, k.old, false, k.act), o2 = await shot(browser, k.ctx, k.old, false, k.act), n = await shot(browser, k.ctx, k.neu, true, k.act)
    const d = await compare(cmp, o1.png, o2.png, n.png), r = await compare(cmp, o1.png2, o2.png2, n.png2)
    writeFileSync(`${OUT}/${k.name}-old.png`, o1.png); writeFileSync(`${OUT}/${k.name}-react.png`, n.png)
    if (d.png) writeFileSync(`${OUT}/${k.name}-diff.png`, Buffer.from(d.png, 'base64'))
    if (r.png && r.pct) writeFileSync(`${OUT}/${k.name}-diff-reraster.png`, Buffer.from(r.png, 'base64'))
    const dd = domDiff(o1.d.els, n.d.els), textSame = o1.d.text === n.d.text
    const ok = (d.pct === 0 || r.pct === 0) && !dd.length && textSame && o1.d.lang === n.d.lang && o1.d.title === n.d.title
    if (!ok) failed = true
    report[k.name] = { diffPct: +d.pct.toFixed(3), noisePct: +d.noisePct.toFixed(3), rerasterDiffPct: +r.pct.toFixed(3), rerasterNoisePct: +r.noisePct.toFixed(3), cells: d.cells.slice(0, 5), elements: [o1.d.els.length, n.d.els.length], domDiff: dd, textSame, lang: [o1.d.lang, n.d.lang], title: [o1.d.title, n.d.title], errors: { old: o1.errors, react: n.errors } }
    console.log(`${k.name}: ${d.pct.toFixed(3)} % differs (noise ${d.noisePct.toFixed(3)} %), re-rastered ${r.pct.toFixed(3)} % (noise ${r.noisePct.toFixed(3)} %), elements ${o1.d.els.length}/${n.d.els.length}${dd.length ? ` DOM DIFF ${dd[0]}` : ''}, text ${textSame ? 'same' : 'DIFFERS'}, lang ${o1.d.lang}/${n.d.lang}${n.errors.length ? `, react errors: ${n.errors.join(' | ')}` : ''}${o1.errors.length ? `, old errors: ${o1.errors.length}` : ''}`)
  }
} finally { await browser.close() }
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1))
console.log(failed ? 'REACT FIDELITY: DIFFERS (tests/out/fidelity)' : 'REACT FIDELITY: OK (0.000 % in every case, by the method or after a re-raster of both pages; DOM and text equal)')
process.exitCode = failed ? 1 : 0
