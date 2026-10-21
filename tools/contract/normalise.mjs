// tools/contract/normalise.mjs — compares a recorded exchange with a replayed one, field by field, after normalising what is
// legitimately different between two runs of the same requests on two copies of the same seed:
//
//   ids and tokens   any token-like string (uuid, nanoid, hex, base64url: [A-Za-z0-9_-]{6,} with a digit or mixed case; the two
//                    the same length) and any numeric *id/number field that differs is CORRELATED: recorded X <-> replayed Y, and the pair must
//                    hold for the whole session, both ways (a bijection). That is checked, not assumed: X once paired with Y and
//                    later with Z is a diff. The pairs also rewrite the later requests (a path /chats/X becomes /chats/Y).
//   timestamps       ISO date-times and epoch numbers in *At / *_at / time / ts / expires fields: equal, or both inside their own
//                    run's window ("made during the run"), or the same offset from their own request's local day (a due date
//                    "tomorrow 18:00" stays tomorrow 18:00). Dates (YYYY-MM-DD) compare as day offsets from the request's local date.
//   sets             arrays listed in contract/normalise.json "unordered" (by route) compare as multisets.
//   ignored          paths listed in contract/normalise.json "ignore" (by route), and headers outside COMPARE_HEADERS.
//
// The normalised forms (ids as <id:n>, times as <now> / <run> / <day+k Thh:mm>) are what the diff report prints.
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from './env.mjs'

const RULES_FILE = path.join(ROOT, 'contract/normalise.json')
export const RULES = existsSync(RULES_FILE) ? JSON.parse(readFileSync(RULES_FILE, 'utf8')) : { unordered: {}, ignore: {}, ignoreHeaders: [] }

export const COMPARE_HEADERS = ['content-type', 'cache-control', 'location', 'content-disposition', 'retry-after', 'content-range', 'accept-ranges', 'allow', 'www-authenticate', 'x-frame-options', 'x-content-type-options']

const TZ_OFFSET_MIN = 5 * 60                                       // Asia/Tashkent, UTC+5, no DST: the app's own day (engine tz)
const ISO_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:?\d{2})?$/
const ISO_D = /^\d{4}-\d{2}-\d{2}$/
const TIME_KEY = /(At|_at|Ms|_ms|^at$|^t$|time|Time|^ts$|expires|Expires|^exp$|^iat$|^now$|until|Until|since|Since|deadline|Deadline|due|Due|^date$)$/
const ID_KEY = /(^id$|Id$|_id$|^number$|Number$|^seq$|^no$)/
// a field named like a code or token holds a random value even when it reads like a word (a family code "MBHQPZPN")
const TOKEN_KEY = /(code|Code|token|Token|secret|Secret|^ref$|Ref$|slug|Slug|nonce|Nonce|invite|Invite)$/
export const tokenLike = s => typeof s === 'string' && s.length >= 6 && s.length <= 200 && /^[A-Za-z0-9_-]+$/.test(s) && (/\d/.test(s) || (/[a-z]/.test(s) && /[A-Z]/.test(s)))
const SEG = /([A-Za-z0-9_-]{6,})/g
// a request's path or query may carry an id percent-encoded ("dm%3A4Ip76XKhnrmu" is dm:4Ip76XKhnrmu): an escape is its own unit, never part of a token
const TOKSCAN = /%[0-9A-Fa-f]{2}|[A-Za-z0-9_-]{6,}/g

const localDay = ms => Math.floor((ms + TZ_OFFSET_MIN * 60000) / 86400000)
const relTime = (ms, at) => {                                       // "day+k Thh:mm" from the request's local day
  const k = localDay(ms) - localDay(at)
  const local = new Date(ms + TZ_OFFSET_MIN * 60000)
  return `day${k >= 0 ? '+' : ''}${k} T${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}:${String(local.getUTCSeconds()).padStart(2, '0')}`
}
const relDay = (d, at) => { const k = Math.round(Date.parse(d + 'T00:00:00Z') / 86400000) - localDay(at); return `day${k >= 0 ? '+' : ''}${k}` }

/** One replay's correlation state: rec->rep and rep->rec token pairs, each side's run window. */
export function newContext() {
  return { fwd: new Map(), back: new Map(), n: new Map(), next: 1, rec: { t0: Infinity, t1: 0, clock: null }, rep: { t0: Infinity, t1: 0, clock: null } }
}
function idName(ctx, recVal) { if (!ctx.n.has(recVal)) ctx.n.set(recVal, ctx.next++); return `<id:${ctx.n.get(recVal)}>` }
/** Pair rec token X with rep token Y: true when consistent (new pair, or the same pair again). */
export function pair(ctx, x, y) {
  x = String(x); y = String(y)
  const f = ctx.fwd.get(x), b = ctx.back.get(y)
  if (f === undefined && b === undefined) {
    if (x === y) { ctx.fwd.set(x, y); ctx.back.set(y, x); return true }
    ctx.fwd.set(x, y); ctx.back.set(y, x); return true
  }
  return f === y && b === x
}
/** Rewrite a recorded request string with the pairs learned so far (recorded ids -> the replay's own). */
export function substitute(ctx, s) {
  if (typeof s !== 'string' || !ctx.fwd.size) return s
  return s.replace(TOKSCAN, m => (m[0] !== '%' && ctx.fwd.has(m) ? ctx.fwd.get(m) : m))
}
export function substituteDeep(ctx, v) {
  if (typeof v === 'string') return substitute(ctx, v)
  if (Array.isArray(v)) return v.map(x => substituteDeep(ctx, x))
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, substituteDeep(ctx, x)]))
  if (typeof v === 'number' && ctx.fwd.has(String(v))) { const r = Number(ctx.fwd.get(String(v))); return Number.isFinite(r) ? r : v }
  return v
}
/** Learn pairs from a recorded request against the request actually sent (ids that came from the seed pair with themselves). */
export function learnFromRequest(ctx, recStr, repStr) {
  const toks = x => (String(x ?? '').match(TOKSCAN) || []).filter(t => t[0] !== '%')
  const a = toks(recStr), b = toks(repStr)
  if (a.length === b.length) a.forEach((x, i) => { if (tokenLike(x)) pair(ctx, x, b[i]) })
}

// The time a side's server believed it was at a request: the contract clock (tools/contract/clock.cjs) started at meta.clock when the side's
// run started; without a clock, the request's own real time.
const ref = (ctx, side, at) => (ctx[side].clock ? Date.parse(ctx[side].clock) + (at - ctx[side].t0) : at)
function inRun(ctx, side, v) {
  const s = ctx[side]
  if (v >= s.t0 - 300000 && v <= s.t1 + 300000) return true                       // real time (Postgres now(), a real Date)
  if (!s.clock) return false
  const c = Date.parse(s.clock)
  return v >= c - 300000 && v <= c + (s.t1 - s.t0) + 600000                       // the contract clock's time
}
function timeEq(ctx, a, b, recAt, repAt) {
  if (a === b) return { ok: true }
  if (inRun(ctx, 'rec', a) && inRun(ctx, 'rep', b)) return { ok: true }
  const da = a - ref(ctx, 'rec', recAt), db = b - ref(ctx, 'rep', repAt)
  if (Math.abs(da - db) <= 180000) return { ok: true }                             // the same distance from "now" (now + 30 days)
  return { ok: false, norm: [relTime(a, ref(ctx, 'rec', recAt)), relTime(b, ref(ctx, 'rep', repAt))] }
}

/**
 * Compare two JSON values. Returns the diffs [{path, rec, rep}] and fills ctx pairs. `route` picks the per-route rules.
 */
export function compareJson(ctx, rec, rep, { route, recAt, repAt }) {
  const diffs = []
  const unordered = new Set(RULES.unordered?.[route] ?? []), ignore = new Set([...(RULES.ignore?.[route] ?? []), ...(RULES.ignore?.['*'] ?? [])])
  const walk = (a, b, p, key) => {
    if (ignore.has(p) || ignore.has(p.replace(/\[\d+\]/g, '[]'))) return
    if (a === b) return
    const ta = Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a, tb = Array.isArray(b) ? 'array' : b === null ? 'null' : typeof b
    if (ta !== tb) return diffs.push({ path: p, rec: a, rep: b })
    if (ta === 'array') {
      if (a.length !== b.length) return diffs.push({ path: p, rec: `[${a.length} items]`, rep: `[${b.length} items]` })
      if (unordered.has(p.replace(/\[\d+\]/g, '[]'))) {
        const sk = x => JSON.stringify(x, Object.keys(x ?? {}).sort())
        const sa = [...a].sort((x, y) => sk(x).localeCompare(sk(y))), sb = [...b].sort((x, y) => sk(x).localeCompare(sk(y)))
        return sa.forEach((x, i) => walk(x, sb[i], `${p}[${i}]`, key))
      }
      return a.forEach((x, i) => walk(x, b[i], `${p}[${i}]`, key))
    }
    if (ta === 'object') {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)])
      for (const k of keys) {
        if (!(k in a)) diffs.push({ path: `${p}.${k}`, rec: '<absent>', rep: b[k] })
        else if (!(k in b)) diffs.push({ path: `${p}.${k}`, rec: a[k], rep: '<absent>' })
        else walk(a[k], b[k], `${p}.${k}`, k)
      }
      return
    }
    if (ta === 'string') {
      if (ISO_DT.test(a) && ISO_DT.test(b)) { const r = timeEq(ctx, Date.parse(a), Date.parse(b), recAt, repAt); if (!r.ok) diffs.push({ path: p, rec: `${a} (${r.norm[0]})`, rep: `${b} (${r.norm[1]})` }); return }
      if (ISO_D.test(a) && ISO_D.test(b)) { const x = relDay(a, ref(ctx, 'rec', recAt)), y = relDay(b, ref(ctx, 'rep', repAt)); if (x !== y) diffs.push({ path: p, rec: `${a} (${x})`, rep: `${b} (${y})` }); return }
      if ((tokenLike(a) && tokenLike(b) && a.length === b.length) || (key && TOKEN_KEY.test(key) && /^[A-Za-z0-9_-]{4,200}$/.test(a) && /^[A-Za-z0-9_-]{4,200}$/.test(b))) { if (!pair(ctx, a, b)) diffs.push({ path: p, rec: a, rep: b, why: 'id pairing broken' }); return }
      // strings that embed ids / times (urls, refs, keys): compare segment by segment
      const sa = a.split(SEG), sb = b.split(SEG)
      if (sa.length === sb.length && sa.every((x, i) => (i % 2 === 0 ? x === sb[i] : x === sb[i] || (tokenLike(x) && tokenLike(sb[i]) && x.length === sb[i].length && pair(ctx, x, sb[i]))))) return
      if (sameTimesInString(ctx, a, b, recAt, repAt)) return
      if (sameClockText(a, b)) return
      return diffs.push({ path: p, rec: a, rep: b })
    }
    if (ta === 'number') {
      if (key && TIME_KEY.test(key) && a > 1e12 && a < 4e12 && b > 1e12 && b < 4e12) { const r = timeEq(ctx, a, b, recAt, repAt); if (!r.ok) diffs.push({ path: p, rec: `${a} (${r.norm[0]})`, rep: `${b} (${r.norm[1]})` }); return }
      if (key && TIME_KEY.test(key) && a > 1e9 && a < 4e9 && b > 1e9 && b < 4e9) { const r = timeEq(ctx, a * 1000, b * 1000, recAt, repAt); if (!r.ok) diffs.push({ path: p, rec: a, rep: b }); return }
      if (key && ID_KEY.test(key) && Number.isInteger(a) && Number.isInteger(b)) { if (!pair(ctx, a, b)) diffs.push({ path: p, rec: a, rep: b, why: 'id pairing broken' }); return }
    }
    diffs.push({ path: p, rec: a, rep: b })
  }
  walk(rec, rep, '$', null)
  return diffs
}
// "Updated today, 09:01" against "Updated today, 09:00": the same words around times of day a few minutes apart (a page line that names
// "now"; the replay runs faster than the walk it replays). Everything but the HH:MM must be equal, and each pair within 3 minutes.
const HHMM = /\b([01]?\d|2[0-3]):([0-5]\d)\b/g
function sameClockText(a, b) {
  const ta = [...a.matchAll(HHMM)], tb = [...b.matchAll(HHMM)]
  if (!ta.length || ta.length !== tb.length || a.replace(HHMM, '#') !== b.replace(HHMM, '#')) return false
  return ta.every((m, i) => { const d = Math.abs((+m[1] * 60 + +m[2]) - (+tb[i][1] * 60 + +tb[i][2])); return Math.min(d, 1440 - d) <= 3 })
}
// "…2026-10-21T05:29:34.876Z…" inside a longer string: replace each ISO stamp/date with its relative form on both sides, then compare
function sameTimesInString(ctx, a, b, recAt, repAt) {
  const RE = /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:?\d{2})?)?/g
  if (!RE.test(a)) return false
  const norm = (s, side, at) => s.replace(RE, m => (m.length === 10 ? relDay(m, ref(ctx, side, at)) : (() => { const v = Date.parse(m); return inRun(ctx, side, v) ? '<run>' : relTime(v, ref(ctx, side, at)) })()))
  const x = norm(a, 'rec', recAt), y = norm(b, 'rep', repAt)
  if (x === y) return true
  const sa = x.split(SEG), sb = y.split(SEG)
  return sa.length === sb.length && sa.every((s, i) => (i % 2 === 0 ? s === sb[i] : s === sb[i] || (tokenLike(s) && tokenLike(sb[i]) && s.length === sb[i].length && pair(ctx, s, sb[i]))))
}

/** Compare one whole exchange: status, the compared headers, the body (json / text / binary hash / stream). */
export function compareExchange(ctx, recE, rep, route) {
  const diffs = []
  const opts = { route, recAt: recE.at, repAt: rep.at }
  if (recE.status !== rep.status) diffs.push({ path: 'status', rec: recE.status, rep: rep.status })
  const ignoreH = new Set(RULES.ignoreHeaders ?? [])
  for (const h of COMPARE_HEADERS) {
    if (ignoreH.has(h)) continue
    let a = recE.resHeaders?.[h], b = rep.resHeaders?.[h]
    if (h === 'content-type') { a = a?.split(';')[0].trim(); b = b?.split(';')[0].trim() }
    if (h === 'location' && a && b) { diffs.push(...compareJson(ctx, a, b, opts).map(d => ({ ...d, path: 'header:location' }))); continue }
    if ((a ?? null) !== (b ?? null)) diffs.push({ path: `header:${h}`, rec: a ?? '<absent>', rep: b ?? '<absent>' })
  }
  const ra = recE.res, rb = rep.res
  if (ra?.stream || rb?.stream) { if (!(ra?.stream && rb?.stream)) diffs.push({ path: 'body', rec: ra?.stream ? '<stream>' : 'body', rep: rb?.stream ? '<stream>' : 'body' }) }
  else if (ra?.json !== undefined || rb?.json !== undefined) {
    if (ra?.json === undefined || rb?.json === undefined) diffs.push({ path: 'body', rec: ra ? Object.keys(ra)[0] : null, rep: rb ? Object.keys(rb)[0] : null })
    else diffs.push(...compareJson(ctx, ra.json, rb.json, opts))
  } else if (ra?.text !== undefined || rb?.text !== undefined) {
    diffs.push(...compareJson(ctx, ra?.text ?? null, rb?.text ?? null, opts))
  } else {
    const ha = ra?.sha256 ?? ra?.bin?.sha256 ?? null, hb = rb?.sha256 ?? rb?.bin?.sha256 ?? null
    if (ha !== hb && !(RULES.binaryLenOnly?.includes(route) && (ra?.len ?? ra?.bin?.len) === (rb?.len ?? rb?.bin?.len))) diffs.push({ path: 'body:sha256', rec: ha, rep: hb })
  }
  return diffs
}

/** Compare one page GET: its status, its redirect, and the JG_BOOT it carries (the HTML around it is the design's and not compared). */
export function comparePage(ctx, recE, rep, route) {
  const diffs = []
  const opts = { route, recAt: recE.at, repAt: rep.at }
  if (recE.status !== rep.status) diffs.push({ path: 'status', rec: recE.status, rep: rep.status })
  const a = recE.resHeaders?.location, b = rep.resHeaders?.location
  if (a || b) { if (!a || !b) diffs.push({ path: 'header:location', rec: a ?? '<absent>', rep: b ?? '<absent>' }); else diffs.push(...compareJson(ctx, a, b, opts).map(d => ({ ...d, path: 'header:location' }))) }
  const ba = recE.res?.boot ?? null, bb = rep.res?.boot ?? null
  if ((ba === null) !== (bb === null)) diffs.push({ path: 'boot', rec: ba ? '<boot>' : null, rep: bb ? '<boot>' : null })
  else if (ba) diffs.push(...compareJson(ctx, ba, bb, opts).map(d => ({ ...d, path: d.path.replace(/^\$/, 'boot') })))
  return diffs
}
