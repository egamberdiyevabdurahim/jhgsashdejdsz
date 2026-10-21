/** Golden cases for the engine's leaf modules (no engine import of their own): the first the Python port takes over. */
import * as D from '@/engine/dates'
import * as U from '@/engine/util'
import * as M from '@/engine/admission/math'
import * as US from '@/engine/admission/us'
import * as IRT from '@/engine/cat/irt'
import * as ELO from '@/engine/learner/elo'
import * as COINS from '@/engine/coins'
import * as TF from '@/engine/too-fast'
import * as EN from '@/engine/endings'
import * as F from '@/engine/strategy/field'
import * as TY from '@/engine/content/typed'
import { Golden, rng, pick, int, real, type R } from './lib'

const pad = (n: number, w = 2) => String(n).padStart(w, '0')
function randDate(r: R, y0 = 1995, y1 = 2040) {
  const y = int(r, y0, y1), m = int(r, 1, 12), last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const d = r() < 0.2 ? last : int(r, 1, last)
  return `${y}-${pad(m)}-${pad(d)}`
}
const EDGE_DATES = ['2024-02-29', '2023-02-28', '2024-01-31', '2026-03-31', '2026-12-31', '2027-01-01', '2000-02-29', '2100-02-28', '2026-10-25', '2026-03-29', '1970-01-01', '2038-01-19']
const STRINGS = ['', 'a', 'abc', 'task:2026-09-24:english', 'Oʻzbekiston', 'gʻalaba', 'Привет мир', 'Türkiye Bursları', '😀 emoji', 'a😀b𝔘c', 'tab\tline\nend',
  'MIT', 'm_sat1|2026-11-01', '日本語のテキスト', 'x'.repeat(300), '\u0000\u0001', 'ﬁ ligature', 'é combining']
function randString(r: R) {
  const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_:|.ʻʼ’ёжшқғўҳ😀𝔘é'
  const chars = Array.from(alpha), n = int(r, 0, 40)
  let s = ''; for (let i = 0; i < n; i++) s += pick(r, chars)
  return s
}

export function dates(): Golden {
  const g = new Golden('dates', 101, 'src/engine/dates.ts + src/engine/util.ts: calendar arithmetic on UTC midnights, the zone helpers, hash and fnv1a')
  const r = rng(101)
  const ds = [...EDGE_DATES, ...Array.from({ length: 300 }, () => randDate(r))]
  ds.forEach((d, i) => {
    g.add('utcMs', `${i}`, { d }, () => D.utcMs(d))
    g.add('weekdayOf', `${i}`, { d }, () => D.weekdayOf(d))
    g.add('mondayOf', `${i}`, { d }, () => D.mondayOf(d))
    g.add('fmtMonth', `${i}`, { s: d }, () => D.fmtMonth(d))
    g.add('fmtDay', `${i}`, { s: d }, () => D.fmtDay(d))
    const n = i % 5 === 0 ? int(r, -3000, 3000) : int(r, -60, 60)
    g.add('addDays', `${i}`, { d, n }, () => D.addDays(d, n))
    const m = int(r, -50, 50)
    g.add('addMonths', `${i}`, { d, n: m }, () => D.addMonths(d, m))
    const b = randDate(r)
    g.add('daysBetween', `${i}`, { a: d, b }, () => D.daysBetween(d, b))
    g.add('monthsBetween', `${i}`, { a: d, b }, () => D.monthsBetween(d, b))
    if (i % 3 === 0) { const e = D.addDays(d, int(r, -2, 20)); g.add('datesFrom', `${i}`, { a: d, b: e }, () => D.datesFrom(d, e)) }
  })
  for (const s of [null, '', undefined, '2026-11-01T10:00:00Z', '2026-11-01T23:30:00+05:00', '2026-06']) {
    g.add('fmtMonth', `x${String(s)}`, { s: s ?? null }, () => D.fmtMonth(s as string))
  }
  for (const s of [null, '', '2026-11-01T10:00:00Z']) g.add('fmtDay', `x${String(s)}`, { s }, () => D.fmtDay(s as string))
  // instants around Tashkent's midnight and across DST zones
  const zones = ['Asia/Tashkent', 'Europe/Moscow', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'UTC', 'Australia/Lord_Howe']
  for (let i = 0; i < 400; i++) {
    const base = D.utcMs(randDate(r, 2000, 2035)), ms = base + int(r, 0, 86_399) * 1000 + (i % 4 === 0 ? 19 * 3_600_000 : 0)
    const tz = i < 200 ? 'Asia/Tashkent' : pick(r, zones)
    g.add('localDateOf', `${i}`, { ms, tz }, () => D.localDateOf(ms, tz))
    g.add('zoneOffsetMin', `${i}`, { ms, tz }, () => D.zoneOffsetMin(ms, tz))
    const d = randDate(r, 2000, 2035), hour = int(r, 0, 23)
    g.add('zonedInstant', `${i}`, { d, hour, tz }, () => D.zonedInstant(d, hour, tz).toISOString())
  }
  // DST transitions (hours that do not exist or exist twice)
  for (const [d, tz] of [['2026-03-08', 'America/New_York'], ['2026-11-01', 'America/New_York'], ['2026-03-29', 'Europe/London'], ['2026-10-25', 'Europe/London']] as const)
    for (let hour = 0; hour < 24; hour++) g.add('zonedInstant', `dst${d}${tz}${hour}`, { d, hour, tz }, () => D.zonedInstant(d, hour, tz).toISOString())
  const ss = [...STRINGS, ...Array.from({ length: 250 }, () => randString(r))]
  ss.forEach((s, i) => {
    const n = pick(r, [1, 2, 7, 10, 24, 100, 997, 4294967295])
    g.add('hash', `${i}`, { s, n }, () => U.hash(s, n))
    g.add('fnv1a', `${i}`, { s }, () => U.fnv1a(s))
  })
  return g
}

export function admissionMath(): Golden {
  const g = new Golden('admission_math', 202, 'src/engine/admission/math.ts: sig, logit, erfc, Phi, PhiInv, meanSig, bisect (on named test functions), mulberry32, Box-Muller, seedOf')
  const r = rng(202)
  const xs = [0, -0, 1, -1, 0.5, 1e-12, -1e-12, 30, -30, 700, -700, 745, -745, 1e308, ...Array.from({ length: 300 }, () => real(r, -12, 12))]
  xs.forEach((x, i) => {
    g.add('sig', `${i}`, { x }, () => M.sig(x))
    g.add('erfc', `${i}`, { x }, () => M.erfc(x))
    g.add('Phi', `${i}`, { z: x }, () => M.Phi(x))
  })
  const ps = [0, 1, 1e-300, 0.02425, 0.97575, 0.5, 1e-9, 1 - 1e-9, -0.1, 1.1, ...Array.from({ length: 300 }, () => r())]
  ps.forEach((p, i) => { g.add('logit', `${i}`, { p }, () => M.logit(p)); g.add('PhiInv', `${i}`, { p }, () => M.PhiInv(p)) })
  for (let i = 0; i < 300; i++) {
    const eta = real(r, -8, 8), tau = i % 10 === 0 ? 0 : real(r, 0, 3)
    g.add('meanSig', `${i}`, { eta, tau }, () => M.meanSig(eta, tau))
  }
  // bisect over named monotone functions: cubic x^3 + a x, sig(x + a), meanSig(x, a)
  for (let i = 0; i < 150; i++) {
    const kind = pick(r, ['cubic', 'sig', 'meanSig'] as const), a = real(r, 0.1, 3)
    const f = kind === 'cubic' ? (x: number) => x * x * x + a * x : kind === 'sig' ? (x: number) => M.sig(x + a) : (x: number) => M.meanSig(x, a)
    const target = kind === 'cubic' ? real(r, -50, 50) : real(r, 0.01, 0.99), it = pick(r, [200, 64, 30])
    g.add('bisect', `${i}`, { kind, a, lo: -30, hi: 30, target, it }, () => M.bisect(f, -30, 30, target, it))
  }
  for (let i = 0; i < 120; i++) {
    const seed = i < 20 ? [0, 1, 2, 42, 4294967295, -1, 2147483648, 123456789, 0x6d2b79f5][i % 9]! : int(r, 0, 4294967295)
    g.add('rng', `${i}`, { seed, n: 40 }, () => { const u = M.rng(seed); return Array.from({ length: 40 }, () => u()) })
    g.add('normals', `${i}`, { seed, n: 41 }, () => { const z = M.normals(M.rng(seed)); return Array.from({ length: 41 }, () => z()) })
  }
  ;[...STRINGS, ...Array.from({ length: 150 }, () => randString(r))].forEach((s, i) => g.add('seedOf', `${i}`, { s }, () => M.seedOf(s)))
  return g
}

export function admissionUs(): Golden {
  const g = new Golden('admission_us', 303, 'src/engine/admission/us.ts: the US holistic shape (poolRate, solveShift, cellP, softP, halfWidth, band): the chances model core')
  const r = rng(303)
  g.add('constants', '0', {}, () => ({ C_A: US.C_A, B_E: US.B_E, N_A: US.N_A, PI_A: US.PI_A, PI_E: US.PI_E }))
  for (let i = 0; i < 200; i++) { const s = real(r, -10, 10); g.add('poolRate', `${i}`, { s }, () => US.poolRate(s)) }
  const rates = [0.03, 0.04, 0.05, 0.1, 0.25, 0.5, 0.9, 0.0001, ...Array.from({ length: 150 }, () => (r() < 0.5 ? real(r, 0.01, 0.2) : r()))]
  rates.forEach((rt, i) => g.add('solveShift', `${i}`, { r: rt }, () => US.solveShift(rt)))
  for (let i = 0; i < 300; i++) {
    const a = int(r, 0, 3), e = int(r, 0, 3), s = real(r, -6, 4), extra = i % 3 ? real(r, -3, 3) : 0
    g.add('cellP', `${i}`, { a, e, s, extra }, () => US.cellP(a, e, s, extra))
  }
  const simplex = (n: number) => { const w = Array.from({ length: n }, () => (r() < 0.3 ? 0 : r())); const t = w.reduce((x, y) => x + y, 0) || 1; return w.map(x => x / t) }
  for (let i = 0; i < 300; i++) {
    const pA = simplex(4), pE = simplex(4), s = real(r, -6, 4), extra = real(r, -2, 2)
    g.add('softP', `${i}`, { pA, pE, s, extra }, () => US.softP(pA, pE, s, extra))
  }
  for (let i = 0; i < 200; i++) {
    const b: US.BandParts = { personal: real(r, 0, 1.5) }
    for (const k of ['misclass', 'transfer', 'drift', 'base', 'aid', 'score'] as const) if (r() < 0.5) b[k] = real(r, 0, 1)
    g.add('halfWidth', `${i}`, { b }, (x) => US.halfWidth(x.b))
  }
  for (let i = 0; i < 300; i++) {
    const p = i < 5 ? [0.5, 0.01, 0.99, 0.001, 0.2][i]! : real(r, 0.002, 0.98), half = i % 9 === 0 ? 0 : real(r, 0.05, 2.5)
    g.add('band', `${i}`, { p, half }, () => US.band(p, half))
  }
  return g
}

export function catIrt(): Golden {
  const g = new Golden('cat_irt', 404, 'src/engine/cat/irt.ts: 3PL/PCM/testlet probabilities, information, EAP on the 181-point grid')
  const r = rng(404)
  g.add('grid', '0', {}, () => IRT.GRID)
  for (let i = 0; i < 300; i++) {
    const theta = real(r, -5, 5), b = real(r, -3, 3), c = pick(r, [0, 0.25, 1 / 3, 0.2, 0.5]), a = i % 4 ? IRT.SLOPE : real(r, 0.4, 2.5)
    g.add('p3', `${i}`, { theta, b, c, a }, () => IRT.p3(theta, b, c, a))
    g.add('info', `${i}`, { theta, b, c, a }, () => IRT.info(theta, b, c, a))
    g.add('maxInfo', `${i}`, { c, a }, () => IRT.maxInfo(c, a))
    const sdB = real(r, 0, 1.2)
    g.add('marginalSlope', `${i}`, { a, sdB }, () => IRT.marginalSlope(a, sdB))
  }
  for (let i = 0; i < 200; i++) {
    const theta = real(r, -4.5, 4.5), K = int(r, 1, 6), steps = Array.from({ length: K }, () => real(r, -3, 3)), a = i % 2 ? IRT.SLOPE : real(r, 0.5, 2)
    g.add('pcmProbs', `${i}`, { theta, steps, a }, () => IRT.pcmProbs(theta, steps, a))
    const b = Array.from({ length: int(r, 1, 5) }, () => real(r, -3, 3)), c = pick(r, [0, 0.25, 1 / 3])
    g.add('testletProbs', `${i}`, { theta, b, c, a, sd: IRT.TESTLET_SD }, () => IRT.testletProbs(theta, b, c, a, IRT.TESTLET_SD))
    const withSteps = r() < 0.5 ? b.map(() => real(r, -2, 2)) : null
    g.add('testletCat', `${i}`, { theta, b, c, steps: withSteps }, () => IRT.testletCat(theta, { b, c, steps: withSteps }))
  }
  const resp = (): IRT.Resp => {
    if (r() < 0.8) return { kind: 'item', b: real(r, -3, 3), c: pick(r, [0, 0.25, 1 / 3]), ...(r() < 0.3 ? { a: real(r, 0.6, 2) } : {}), x: r() < 0.5 ? 1 : 0 }
    const b = Array.from({ length: 4 }, () => real(r, -2, 2))
    return { kind: 'testlet', b, c: 0.25, x: int(r, 0, 4), steps: r() < 0.4 ? b.map(() => real(r, -2, 2)) : null }
  }
  for (let i = 0; i < 80; i++) { const rr = resp(); g.add('logLik', `${i}`, { r: rr }, () => IRT.logLik(rr)) }
  for (let i = 0; i < 40; i++) { const mu = real(r, -2, 2), sd = pick(r, [IRT.PRIOR_SD, 1, 0.8]); g.add('logPrior', `${i}`, { mu, sd }, () => IRT.logPrior(mu, sd)) }
  for (let i = 0; i < 300; i++) {
    const prior = { mu: real(r, -2, 2), sd: pick(r, [IRT.PRIOR_SD, 1]) }, rs = Array.from({ length: int(r, 0, 40) }, resp)
    // the weights in full on a third of the cases (the grid is 181 numbers); theta and se on all
    if (i % 3 === 0) g.add('posterior', `${i}`, { prior, rs }, () => IRT.posterior(prior, rs))
    else g.add('posteriorThetaSe', `${i}`, { prior, rs }, () => { const p = IRT.posterior(prior, rs); return { theta: p.theta, se: p.se } })
    const lo = real(r, -4, 2), hi = lo + real(r, 0, 3), q = r()
    g.add('massBetweenOf', `${i}`, { prior, rs, lo, hi }, () => IRT.massBetween(IRT.posterior(prior, rs).w, lo, hi))
    g.add('quantileOf', `${i}`, { prior, rs, q }, () => IRT.quantile(IRT.posterior(prior, rs).w, q))
  }
  return g
}

export function learnerElo(): Golden {
  const g = new Golden('learner_elo', 505, 'src/engine/learner/elo.ts: Elo update, K decay, mastery states')
  const r = rng(505)
  for (let i = 0; i < 400; i++) {
    const answers = i % 7 === 0 ? -int(r, 0, 3) : int(r, 0, 200)
    g.add('kOf', `${i}`, { answers, rule: 'skill' }, () => ELO.kOf(answers))
    g.add('kOfItem', `${i}`, { answers, rule: 'item' }, () => ELO.kOf(answers, ELO.ELO_ITEM_K))
    const theta = real(r, -7, 7), b = real(r, -7, 7), guess = pick(r, [0, ELO.GUESS_MC, 1 / 3])
    g.add('pCorrect', `${i}`, { theta, b, guess }, () => ELO.pCorrect(theta, b, guess))
    const skill = { theta, answers: int(r, 0, 100) }, item = { b, answers: int(r, 0, 100) }, ok = r() < 0.5
    g.add('eloUpdate', `${i}`, { skill, item, ok, guess }, () => ELO.eloUpdate(skill, item, ok, guess))
    const ref = real(r, -3, 3), n = int(r, 0, 30)
    g.add('masteryOf', `${i}`, { theta, answers: n, ref }, () => ELO.masteryOf(theta, n, ref))
    g.add('credited', `${i}`, { theta, ref }, () => ELO.credited(theta, ref))
    const row: ELO.SkillRow = { theta: real(r, -3, 3), answers: int(r, 0, 25), mastery: pick(r, [null, ...ELO.MASTERY]), proficientAt: r() < 0.3 ? '2026-10-01T10:00:00.000Z' : null }
    const o = { answered: r() < 0.7, ref, at: '2026-10-21T08:00:00.000Z' }
    g.add('skillAt', `${i}`, { row, theta, o }, () => ELO.skillAt(row, theta, o))
  }
  // a run of updates (the order and the clamp carried through)
  for (let i = 0; i < 60; i++) {
    const oks = Array.from({ length: 50 }, () => r() < 0.6), guess = pick(r, [0, 0.25])
    g.add('eloRun', `${i}`, { oks, guess }, () => {
      let s = { theta: 0, answers: 0 }, it = { b: 0, answers: 0 }; const out: number[][] = []
      for (const ok of oks) { const u = ELO.eloUpdate(s, it, ok, guess); s = { theta: u.theta, answers: s.answers + 1 }; it = { b: u.b, answers: it.answers + 1 }; out.push([u.p, u.theta, u.b]) }
      return out
    })
  }
  return g
}

export function smallRules(): Golden {
  const g = new Golden('small_rules', 606, 'coins.ts, too-fast.ts, endings.ts, strategy/field.ts: pay, too-fast, endings, typed answers, field fit')
  const r = rng(606)
  // coins
  const evs: COINS.EarnEvent[] = [{ type: 'diagnostic_complete' }]
  for (let i = 0; i < 200; i++) {
    const k = pick(r, ['task_done', 'day_complete', 'game_result'] as const)
    evs.push(k === 'task_done' ? { type: k, coins: pick(r, [real(r, -10, 60), int(r, 0, 30), 2.5, 3.5, -2.5, -0.5]) } : k === 'day_complete' ? { type: k, rest: r() < 0.3 }
      : { type: k, claimed: pick(r, [real(r, -5, 80), 0.5, 1.5, 2.5, int(r, 0, 60)]), paidToday: int(r, 0, 60) })
  }
  evs.forEach((e, i) => g.add('coinsFor', `${i}`, { e }, () => COINS.coinsFor(e)))
  for (let i = 0; i < 200; i++) {
    const t = { verification: pick(r, ['self_report', 'quiz', 'link', 'upload', 'auto_event']), coins: int(r, 0, 40), deep: pick(r, [null, undefined, 'm2', '']), questions: pick(r, [null, undefined, 0, 3, 5, 6, 20]) }
    g.add('taskCoins', `${i}`, { t }, () => COINS.taskCoins(t))
  }
  const vals = [undefined, null, 'skipped', '', [], [1], 'x', 0, false, {}, { a: 1 }, ' ']
  for (let i = 0; i < 150; i++) {
    const a: Record<string, unknown> = {}; for (let k = int(r, 0, 4); k > 0; k--) a[`q${k}`] = pick(r, vals)
    g.add('answeredAny', `${i}`, { a }, () => COINS.answeredAny(a))
  }
  // too fast
  const timed = (): TF.Timed => {
    const x: TF.Timed = { ms: int(r, 0, 12000) }
    if (r() < 0.6) x.ok = r() < 0.5
    if (r() < 0.5) x.need = int(r, 800, 6000)
    if (r() < 0.15) x.dk = r() < 0.7
    if (r() < 0.15) x.heard = int(r, 0, 20000)
    return x
  }
  for (let i = 0; i < 300; i++) {
    const x = timed(), readMs = pick(r, [0, 2000, 3000, 1500]), strict = r() < 0.3
    g.add('wasRead', `${i}`, { x, readMs, strict }, () => TF.wasRead(x, readMs, strict))
    const log = Array.from({ length: int(r, 0, 12) }, timed)
    g.add('tooFast', `${i}`, { log, readMs, strict }, () => TF.tooFast(log, readMs, strict))
  }
  // endings
  const texts = ['', ' ', 'a', 'aa', 'ab', 'AaA', '...', '  a  b ', '12', '1', 'ok', 'Bajardim', 'ўз', 'ʻʻ', 'ab\n', '😀😀', '日本', 'é', 'é', 'ǅǆ', '٣٤', 'ⅫⅫ', 'Ⅻx', 'A A', ' a b', ' x y', 'x​y', '١٢']
  ;[...texts, ...Array.from({ length: 100 }, () => randString(r))].forEach((v, i) => g.add('realText', `${i}`, { v }, () => EN.realText(v)))
  g.add('realText', 'nonstring', { v: 5 }, () => EN.realText(5))
  const qs: (EN.AskedQ | null)[] = [null, { type: 'text' }, { type: 'text_or_voice' }, { type: 'select', options: [] }, { type: 'select', options: ['a'] }, { type: 'multi' }, { type: 'repeatable' }, { type: 'table' },
    { type: 'number' }, { type: 'select', options: ['a'], sensitive: true }, { type: 'text', text_en: 'Your grades by subject (optional)' }, { type: 'text', text_en: 'Name (OPTIONAL)' }, { type: 'repeatable_autocomplete' }]
  const answers: unknown[] = [undefined, null, 'skipped', '', [], ['a'], ['aa', 'b'], ['x'], 'aa', 'a', ' ', 'ok', {}, { k: 1 }, 0, 5, true, false, ['', '']]
  let n = 0
  for (const q of qs) for (const v of answers) {
    g.add('realAnswer', `${n}`, { v: v === undefined ? { $undef: true } : v, q }, () => EN.realAnswer(v, q))
    g.add('countsAnswered', `${n}`, { v: v === undefined ? { $undef: true } : v, q }, () => EN.countsAnswered(v, q)); n++
  }
  qs.forEach((q, i) => g.add('optionalQ', `${i}`, { q }, () => EN.optionalQ(q)))
  for (let i = 0; i < 200; i++) {
    const coins = pick(r, [0, 10, 15, 20, 30, 7, real(r, 0, 50)]), asked = pick(r, [0, 1, 2, 3, 4, 5, 6, real(r, 0, 9), -1]), answered = pick(r, [0, 1, 2, 3, 4, 5, real(r, -1, 8)])
    g.add('profilePay', `${i}`, { coins, answered, asked }, () => EN.profilePay(coins, answered, asked))
  }
  for (let i = 0; i < 200; i++) {
    const tasks = Array.from({ length: int(r, 0, 7) }, () => ({ optional: pick(r, [undefined, false, true]), status: pick(r, ['done', 'tried', 'skipped', 'scheduled', 'replaced', 'missed']) }))
    g.add('dayCount', `${i}`, { tasks }, () => EN.dayCount(tasks))
  }
  const typedIn = ['Part-Time ', 'part time', '£14', '£ 14', '14 €', '14.00', '14,00', '1,500', '8.45', '“Library”', 'the library', 'LIBRARY.', 'twenty-one', 'Owen’s', "owen's", 'ﬁsh', 'ＡＢＣ',
    '15 minutes', '14 pounds', '£14 pounds', 'Eastbrook', 'east brook', '50%', '3 / 4', '(river)', 'a b c', '', '   ', 'x'.repeat(130), 'in the north', 'Mr. Smith', '10:30', '£', '$5', '5$']
  typedIn.forEach((s, i) => g.add('normTyped', `${i}`, { s }, () => TY.normTyped(s)))
  const lims: TY.WordLimit[] = [{ words: 1, number: false }, { words: 2, number: true }, { words: 3, number: false }, { words: 1, number: true }]
  typedIn.forEach((s, i) => lims.forEach((lim, j) => g.add('withinLimit', `${i}_${j}`, { s, lim }, () => TY.withinLimit(s, lim))))
  const accepts = [['part time', 'part-time'], ['14'], ['library'], ['Eastbrook'], ['owen’s'], ['fish'], ['abc'], ['15'], ['1,500'], ['8.45'], ['50%'], ['twenty one']]
  typedIn.forEach((s, i) => accepts.forEach((acc, j) => { const lim = lims[(i + j) % 4]!; g.add('typedRight', `${i}_${j}`, { answer: s, accept: acc, lim }, () => TY.typedRight(s, acc, lim)) }))
  g.add('typedRight', 'null', { answer: null, accept: ['a'], lim: lims[0] }, () => TY.typedRight(null, ['a'], lims[0]!))
  const stems = ['Price: £______ per night', 'Exercise for ______ minutes every day', 'The ______ is closed', '______ % of the class', 'Name: ________\nAge: 14', 'Cost: ______ $', 'no gap here',
    'The guide is called ______ Brown', 'Meet at the ______ station']
  const pe: [string, string[]][] = [['14 pounds', ['14']], ['£14', ['14']], ['15 minutes', ['15']], ['minutes 15', ['15']], ['library', ['library']], ['50 percent', ['50']], ['5 dollars', ['5']], ['Mr Brown', ['Mr']], ['central station', ['central']], ['', ['x']], ['pounds', ['14']]]
  stems.forEach((stem, i) => pe.forEach(([answer, accept], j) => g.add('printedExtra', `${i}_${j}`, { answer, accept, stem }, () => TY.printedExtra(answer, accept, stem))))
  // field
  const fields = [...Object.keys(F.FIELD_CATEGORY), 'undecided', '', null, 5, 'toString', '__proto__', 'constructor', 'hasOwnProperty']
  const books = ['C8-codapp', 'C8-makerb', 'C8-artpfl', 'C8-tutorg', 'C8-resrch', 'nope', 'toString', '__proto__']
  g.add('PLAYBOOK_FIELDS', '0', {}, () => F.PLAYBOOK_FIELDS)
  books.forEach((b, i) => g.add('fieldsOf', `${i}`, { id: b }, () => F.fieldsOf(b)))
  fields.forEach((f, i) => g.add('knownField', `${i}`, { field: f }, () => F.knownField(f)))
  books.forEach((b, i) => fields.forEach((f, j) => g.add('fitsField', `${i}_${j}`, { id: b, field: f }, () => F.fitsField(b, f))))
  return g
}
