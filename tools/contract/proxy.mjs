#!/usr/bin/env node
// tools/contract/proxy.mjs — the HTTP contract RECORDER: a reverse proxy in front of the dev server that logs every /api/v1 request and
// response, per session, to contract/recordings/<session>.jsonl. Everything else (pages, /api/auth, assets) passes through unrecorded.
//
//   node tools/contract/proxy.mjs [--port 3460] [--upstream http://localhost:3461]
//
// Control (from the driver, tools/contract/record.mjs):
//   POST /__contract/session {name, profile, note}   open contract/recordings/<name>.jsonl (overwritten) and record into it
//   POST /__contract/end                             close it; prints the count
//   GET  /__contract/stats
//
// Who is asking: the Auth.js session cookie is decoded with the contract secret (tools/contract/env.mjs) into the user id and email,
// and the line carries a stable alias instead of the cookie: the seed's own name (contract/seed/accounts.json: ctr-student, demo-parent,
// ...) or the email with its run-stamp digits folded ("smoke-s-N@example.test"). An {type:"alias"} line maps each alias to its email and
// the user id it had in this recording. Cookies are never written; nor is any request header outside KEEP_REQ.
import http from 'node:http'
import { createRequire } from 'node:module'
import { openSync, writeSync, closeSync, readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { ROOT, LEGACY, REC, PROXY_PORT, UPSTREAM_PORT, CONTRACT_AUTH_SECRET, SESSION_COOKIE, PROFILES, CONTRACT_CLOCK, CONTRACT_SEED } from './env.mjs'
import { bodyRecord, pageRecord, pickHeaders, KEEP_REQ, KEEP_RES } from './lib.mjs'

const require = createRequire(path.join(LEGACY, 'package.json'))
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d }
const PORT = Number(arg('--port', PROXY_PORT))
const UP = new URL(arg('--upstream', `http://localhost:${UPSTREAM_PORT}`))

let jwtDecode
async function decodeSession(token) {
  jwtDecode ??= (await import('file://' + require.resolve('@auth/core/jwt').replace(/\\/g, '/'))).decode
  try { return await jwtDecode({ token, secret: CONTRACT_AUTH_SECRET, salt: SESSION_COOKIE }) } catch { return null }
}

const AUTH_COOKIE = /^(__Secure-|__Host-)?authjs\.(session-token|csrf-token|callback-url)(\.\d+)?$/

const seedAccounts = existsSync(path.join(ROOT, 'contract/seed/accounts.json')) ? JSON.parse(readFileSync(path.join(ROOT, 'contract/seed/accounts.json'), 'utf8')) : {}
const seedByEmail = Object.fromEntries(Object.entries(seedAccounts).map(([a, v]) => [v.email, a]))

let S = null                                       // the open session
const tokenCache = new Map()                       // cookie value -> {uid, email} | null
function open(name, profile, note) {
  if (S) close()
  if (!/^[a-z0-9][a-z0-9._-]{0,80}$/i.test(name)) throw new Error('bad session name')
  const file = path.join(REC, `${name}.jsonl`)
  let head = ''; try { head = execFileSync('git', ['-C', LEGACY, 'rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8' }).trim() } catch {}
  S = { name, file, fd: openSync(file, 'w'), t0: Date.now(), seq: 0, n: 0, aliases: new Map(), aliasUsed: new Set() }
  write({ type: 'meta', name, profile, switches: PROFILES[profile] ?? null, note: note ?? '', seed: 'contract/seed/seed.sql', base: `http://localhost:${PORT}`, clock: CONTRACT_CLOCK, rng: CONTRACT_SEED, recordedAt: new Date(S.t0).toISOString(), code: head })
}
function close() { if (!S) return 0; const n = S.n; closeSync(S.fd); S = null; return n }
function write(o) { if (S) writeSync(S.fd, JSON.stringify(o) + '\n') }

function cookiesOf(h) {
  const out = {}
  for (const part of (h || '').split(/;\s*/)) { const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1) }
  return out
}
async function aliasOf(cookies) {
  const tok = cookies[SESSION_COOKIE] ?? cookies[`__Secure-${SESSION_COOKIE}`]
  if (!tok || !S) return null
  if (!tokenCache.has(tok)) {
    const p = await decodeSession(tok)
    tokenCache.set(tok, p ? { uid: String(p.uid ?? p.sub ?? ''), email: String(p.email ?? '') } : null)
  }
  const who = tokenCache.get(tok)
  if (!who) return '<undecodable-session>'
  let a = S.aliases.get(who.uid)
  if (!a) {
    a = seedByEmail[who.email] ?? (who.email ? who.email.replace(/\d{6,}/g, 'N') : `uid-${S.aliases.size + 1}`)
    for (let i = 2; S.aliasUsed.has(a); i++) a = a.replace(/#\d+$/, '') + '#' + i
    S.aliases.set(who.uid, a); S.aliasUsed.add(a)
    write({ type: 'alias', alias: a, email: who.email, uid: who.uid, seeded: !!seedByEmail[who.email] })
  }
  return a
}
const pick = pickHeaders
const STATIC = /^\/(_next|d|runtime|fonts|img|images|media|i18n|__nextjs|api\/auth|api\/health|favicon)(\/|$)|\.[a-z0-9]{2,5}$/i

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  if (url.pathname.startsWith('/__contract/')) return control(req, res, url)
  const chunks = []; for await (const c of req) chunks.push(c)
  const reqBuf = Buffer.concat(chunks)
  const api = url.pathname.startsWith('/api/v1/')
  // a page GET (/app, /parent, /join/<code>, /staff/...) is kept too, as its status and the JG_BOOT it carries: the boot data is what
  // the server tells the page (ids and codes a later /api/v1 request sends back), and opening a page can write (a league placement)
  const page = !!S && !api && req.method === 'GET' && !STATIC.test(url.pathname)
  const recordIt = !!S && (api || page)
  const sessionName = S?.name
  const seq = recordIt ? ++S.seq : 0, at = Date.now(), t = S ? at - S.t0 : 0
  const cookies = cookiesOf(req.headers.cookie)
  const alias = recordIt ? await aliasOf(cookies) : null
  const headers = { ...req.headers }; delete headers['accept-encoding']; headers['content-length'] = String(reqBuf.length)
  if (!reqBuf.length && !['POST', 'PUT', 'PATCH'].includes(req.method)) delete headers['content-length']
  const up = http.request({ hostname: UP.hostname, port: UP.port, method: req.method, path: req.url, headers }, upRes => {
    const ct = String(upRes.headers['content-type'] || '')
    const base = `http://${req.headers.host}`
    const entry = recordIt && (api || /text\/html/.test(ct) || (upRes.statusCode >= 300 && upRes.statusCode < 400)) && {
      type: api ? 'http' : 'page', seq, t, at, alias, method: req.method, path: url.pathname, query: url.search,
      headers: pick(req.headers, KEEP_REQ, base),
      cookies: Object.fromEntries(Object.entries(cookies).filter(([k]) => !AUTH_COOKIE.test(k))),
      body: bodyRecord(reqBuf, req.headers['content-type']),
    }
    if (/text\/event-stream/.test(ct)) {                                         // a stream: pass through, record the opening only
      res.writeHead(upRes.statusCode, upRes.headers); upRes.pipe(res)
      // the client hung up: so does the proxy (presence counts open streams), and the session notes after which request it did, so a
      // replay keeps its own stream open exactly as long (tools/contract/replay.mjs)
      res.on('close', () => { upRes.destroy(); up.destroy(); if (entry && S && S.name === sessionName) write({ type: 'stream-end', ofSeq: seq, afterSeq: S.seq, at: Date.now() }) })
      if (entry) { Object.assign(entry, { status: upRes.statusCode, resHeaders: pick(upRes.headers, KEEP_RES, base), setCookies: setCookieNames(upRes.headers), res: { stream: true }, ms: Date.now() - at }); write(entry); S && S.n++ }
      return
    }
    const out = []; upRes.on('data', c => out.push(c)); upRes.on('end', () => {
      const buf = Buffer.concat(out)
      res.writeHead(upRes.statusCode, upRes.headers); res.end(buf)
      if (entry && S) { Object.assign(entry, { status: upRes.statusCode, resHeaders: pick(upRes.headers, KEEP_RES, base), setCookies: setCookieNames(upRes.headers), res: api ? bodyRecord(buf, ct) : pageRecord(buf), ms: Date.now() - at }); write(entry); S.n++ }
    })
  })
  up.on('error', e => { if (!res.headersSent) { res.writeHead(502, { 'content-type': 'text/plain' }); res.end('contract proxy: upstream ' + e.message) } })
  up.end(reqBuf)
})
const setCookieNames = h => [].concat(h['set-cookie'] || []).map(c => c.split('=')[0]).sort()

async function control(req, res, url) {
  const chunks = []; for await (const c of req) chunks.push(c)
  let b = {}; try { b = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {} } catch {}
  const send = (code, o) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)) }
  try {
    if (url.pathname === '/__contract/session') { open(b.name, b.profile, b.note); return send(200, { file: S.file }) }
    if (url.pathname === '/__contract/end') return send(200, { recorded: close() })
    if (url.pathname === '/__contract/stats') return send(200, { session: S?.name ?? null, recorded: S?.n ?? 0 })
    return send(404, { error: 'unknown control' })
  } catch (e) { return send(400, { error: String(e.message || e) }) }
}

server.listen(PORT, '127.0.0.1', () => console.log(`contract proxy :${PORT} -> ${UP.href}`))
// localhost resolves to ::1 first on this machine for some clients: listen there too
http.createServer((q, s) => server.emit('request', q, s)).listen(PORT, '::1').on('error', () => {})
