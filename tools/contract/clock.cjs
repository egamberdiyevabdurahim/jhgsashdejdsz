// tools/contract/clock.cjs — the contract runs' clock, preloaded into the dev server (NODE_OPTIONS=--require=<this file>) by serve.mjs.
// The process's Date starts at CONTRACT_CLOCK (an ISO instant) and runs on from there in real time, so a recording and every replay of it
// see the same day, weekday and time of day, whatever day the replay happens on (the engine's plans, weeks, streaks and due dates are
// day-dependent). The same idea as the P6 lessons walk's clock (.superpowers/teen/p6-walk-clock.cjs), without the movable file.
// Postgres's own now() is NOT moved: values the database stamps are real time (the normaliser accepts both, tools/contract/normalise.mjs).
// A FastAPI target replays under the same clock: its "now" must start at CONTRACT_CLOCK too (e.g. time-machine travel at startup).
//
// It also seeds the server's randomness with CONTRACT_SEED: Math.random and crypto.randomInt (the CAT's and the quizzes' item choice,
// option shuffles, practice mixes) draw from a seeded generator (mulberry32) that belongs to the REQUEST being served: each incoming HTTP
// request gets its own generator, seeded from CONTRACT_SEED, its method, its path (ids folded to *) and how many requests with that same
// key came before it (AsyncLocalStorage carries it through the handler). So the same requests in the same order get the same questions,
// whatever else the process drew in between (compiles, timers, the AI worker). crypto.randomUUID / randomBytes stay random (ids and
// tokens: the normaliser pairs them). A FastAPI port that must replay a randomised route exactly reproduces this per-request stream.
const seed = process.env.CONTRACT_SEED
if (seed) {
  const mulberry = key => {
    let s = 0
    for (const ch of String(key)) s = (Math.imul(s ^ ch.charCodeAt(0), 2654435761) >>> 0)
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  }
  const { AsyncLocalStorage } = require('async_hooks')
  const als = new AsyncLocalStorage()
  const outside = mulberry(seed)
  const next = () => { const st = als.getStore(); return st ? st.rng() : outside() }
  const counts = new Map()
  const http = require('http')
  const emit = http.Server.prototype.emit
  http.Server.prototype.emit = function (ev, req) {
    if (ev !== 'request' || !req || typeof req.url !== 'string' || /^\/(_next|__nextjs)/.test(req.url)) return emit.apply(this, arguments)
    const p = req.url.split('?')[0].replace(/[A-Za-z0-9_-]{6,}/g, m => (/\d/.test(m) || (/[a-z]/.test(m) && /[A-Z]/.test(m)) ? '*' : m))
    const key = `${req.method} ${p}`, n = (counts.get(key) || 0) + 1
    counts.set(key, n)
    return als.run({ rng: mulberry(`${seed}|${key}|${n}`) }, () => emit.apply(this, arguments))
  }
  Math.random = next
  const crypto = require('crypto')
  const realRandomInt = crypto.randomInt
  crypto.randomInt = function randomInt(a, b, cb) {
    if (typeof b === 'function') { cb = b; b = undefined }
    const [min, max] = b === undefined ? [0, a] : [a, b]
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max <= min) return realRandomInt.apply(crypto, arguments)
    const v = min + Math.floor(next() * (max - min))
    if (cb) { process.nextTick(cb, null, v); return undefined }
    return v
  }
  // the item instances' seeds (content/bank.ts tok(), practice randomUUID()) come from randomBytes / randomUUID: those draw from the same
  // per-request stream, so a family's numbers are the same too (ids made with them are then equal in a replay; the pairing still holds)
  const bytes = n => { const b = Buffer.allocUnsafe(n); for (let i = 0; i < n; i++) b[i] = Math.floor(next() * 256); return b }
  const realRandomBytes = crypto.randomBytes
  crypto.randomBytes = function randomBytes(n, cb) {
    if (!Number.isSafeInteger(n) || n < 0) return realRandomBytes.apply(crypto, arguments)
    const b = bytes(n)
    if (typeof cb === 'function') { process.nextTick(cb, null, b); return undefined }
    return b
  }
  crypto.randomUUID = function randomUUID() {
    const b = bytes(16); b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80
    const h = b.toString('hex')
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
  }
  require('module').syncBuiltinESMExports()
}
const at = process.env.CONTRACT_CLOCK
if (at) {
  const Real = Date
  const base = Real.parse(at), realAt = Real.now()
  if (!Number.isFinite(base)) throw new Error('CONTRACT_CLOCK is not an ISO instant')
  const cur = () => base + (Real.now() - realAt)
  class ContractDate extends Real {
    constructor(...a) { if (a.length === 0) super(cur()); else super(...a) }
    static now() { return cur() }
  }
  ContractDate.parse = Real.parse; ContractDate.UTC = Real.UTC
  globalThis.Date = ContractDate
}
