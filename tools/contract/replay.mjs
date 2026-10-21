#!/usr/bin/env node
// tools/contract/replay.mjs — the REPLAYER: re-issues a recording's requests, in order, against any base URL (the TypeScript backend, or a
// FastAPI one) running over a fresh copy of the same seed (contract/seed/seed.sql, or `db.mjs copy`), under the recording's switch profile,
// and diffs every normalised answer (tools/contract/normalise.mjs) against the recorded one.
//
//   node tools/contract/replay.mjs <recording.jsonl> [more.jsonl ...] --base http://localhost:8000 [--db jg_ctr_rep_dev] [--out report.json]
//        [--only /api/v1/lessons] [--max-print 20] [--pace] [--no-pages | --pages-base <url> | --lenient-pages] [--clock none]
//
// Sessions: each request carries its alias's session cookie, minted here with the contract secret (CONTRACT_AUTH_SECRET, the same one the
// target must verify with) for the user id the alias has ON THE TARGET: a seeded account keeps its id; an account the walk registered gets
// the id the target answered /register with (learned by the id pairing). x-jg-uid and every recorded id in a path, query or body are
// rewritten the same way. {type:"sql"} lines (a walk's own database writes, tools/contract/sqltap.mjs) run against --db.
// Exit 0 when every exchange matches; 1 when any differs; the report (--out, default contract/.run/replay-<name>.json) lists each diff.
import { writeFileSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { ROOT, LEGACY, RUN, dbUrl, SESSION_COOKIE } from './env.mjs'
import { routes, routeOf, mintSession, readRecording, bodyRecord, pageRecord, pickHeaders, KEEP_RES } from './lib.mjs'
import { newContext, compareExchange, comparePage, substitute, substituteDeep, learnFromRequest, pair } from './normalise.mjs'

const argv = process.argv.slice(2)
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v }
const BASE = (opt('--base') || '').replace(/\/$/, '')
const DB = opt('--db'), OUT = opt('--out'), ONLY = opt('--only'), MAXP = Number(opt('--max-print', 15)), CLOCK = opt('--clock')
const PACE = argv.includes('--pace'), NO_PAGES = argv.includes('--no-pages'), STRICT_PAGES = !argv.includes('--lenient-pages'), PAGES_BASE = (opt('--pages-base') || '').replace(/\/$/, '') || null
const files = argv.filter(a => !a.startsWith('--'))
if (!BASE || !files.length) { console.error('usage: replay.mjs <recording.jsonl ...> --base <url> [--db <scratch db>] [--out <file>]'); process.exit(2) }

const require = createRequire(path.join(LEGACY, 'package.json'))
let sql = null
if (DB) { const postgres = require('postgres'); sql = postgres(dbUrl(DB), { max: 1, onnotice: () => undefined }) }
const R = routes()
const seedAccounts = JSON.parse(readFileSync(path.join(ROOT, 'contract/seed/accounts.json'), 'utf8'))
let exitCode = 0

for (const file of files) {
  const { meta, aliases, entries, streamEnds } = readRecording(file)
  const open = new Map()                                                        // seq -> AbortController of a stream still open
  const ctx = newContext()
  const http = entries.filter(e => e.type === 'http')
  ctx.rec.t0 = Math.min(...http.map(e => e.at)); ctx.rec.t1 = Math.max(...http.map(e => e.at + (e.ms ?? 0)))
  ctx.rep.t0 = Date.now(); ctx.rep.t1 = Date.now()
  // the target runs under the recording's clock (CONTRACT_CLOCK=meta.clock) unless --clock says otherwise (--clock none: real time)
  ctx.rec.clock = meta?.clock ?? null; ctx.rep.clock = CLOCK === 'none' ? null : (CLOCK ?? meta?.clock ?? null)
  const cookieFor = new Map()
  const recBase = meta?.base ?? 'http://localhost:3460'
  // a seeded account is whoever has that alias in the seed the target runs on (contract/seed/accounts.json): its id there may differ
  for (const a of aliases.values()) if (a.seeded && seedAccounts[a.alias]) pair(ctx, a.uid, seedAccounts[a.alias].id)
  const results = [], perRoute = {}
  let sqlRun = 0, sqlSkipped = 0, unreplayable = 0, prevRec = null, prevRep = 0
  for (const e of entries) {
    // streams the recording had closed by now are closed here too (a stream with no recorded end stays open to the end of the session)
    for (const [s0, ac] of open) if ((streamEnds.get(s0) ?? Infinity) < e.seq) { ac.abort(); open.delete(s0) }
    if (e.type === 'sql') {
      if (!sql) { sqlSkipped++; continue }
      await sql.unsafe(e.query, substituteDeep(ctx, e.params ?? [])); sqlRun++; continue
    }
    const isPage = e.type === 'page'
    if (isPage && NO_PAGES) continue
    const route = isPage ? `page ${e.path.split('/').slice(0, 2).join('/') || '/'}` : routeOf(R, e.path) ?? '<no route>'
    if (ONLY && !isPage && !e.path.startsWith(ONLY)) continue
    const base = isPage && PAGES_BASE ? PAGES_BASE : BASE
    if (e.body?.bin) { unreplayable++; results.push({ seq: e.seq, route, method: e.method, path: e.path, skipped: 'binary body over 2 MB was not kept' }); continue }
    // the request, with the ids the target gave
    const p = substitute(ctx, e.path), q = substitute(ctx, e.query || '')
    learnFromRequest(ctx, e.path + e.query, p + q)
    const headers = {}
    for (const [k, v] of Object.entries(e.headers || {})) headers[k] = substitute(ctx, String(v).split('{BASE}').join(base))
    let cookie = Object.entries(e.cookies || {}).map(([k, v]) => `${k}=${v}`)
    if (e.alias && e.alias !== '<undecodable-session>') {
      const a = aliases.get(e.alias); const uid = ctx.fwd.get(a.uid) ?? a.uid
      if (!cookieFor.has(uid)) cookieFor.set(uid, await mintSession({ uid, email: a.email }))
      cookie = [`${SESSION_COOKIE}=${cookieFor.get(uid)}`, ...cookie]
    }
    if (cookie.length) headers.cookie = cookie.join('; ')
    let body
    if (e.body?.json !== undefined) body = JSON.stringify(substituteDeep(ctx, e.body.json))
    else if (e.body?.text !== undefined) body = substitute(ctx, e.body.text)
    else if (e.body?.b64) body = Buffer.from(e.body.b64, 'base64')
    if (e.body?.json !== undefined) learnFromRequest(ctx, JSON.stringify(e.body.json), body)
    // --pace: keep the recorded gap before this request (up to 5 s), so background work a request started (an AI job, a league
    // placement) is as far along as it was when the walk sent the next one
    if (PACE && prevRec !== null) { const gap = Math.min(5000, e.at - prevRec) - (Date.now() - prevRep); if (gap > 0) await new Promise(r => setTimeout(r, gap)) }
    prevRec = e.at; prevRep = Date.now()
    const at = Date.now(); ctx.rep.t1 = at
    const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 90_000)
    let rep
    try {
      const r = await fetch(base + p + q, { method: e.method, headers, body, redirect: 'manual', signal: ac.signal })
      const ct = r.headers.get('content-type') || ''
      const resHeaders = pickHeaders(Object.fromEntries(r.headers), KEEP_RES, base)
      if (/event-stream/.test(ct)) {
        clearTimeout(timer)
        if (streamEnds.has(e.seq) && streamEnds.get(e.seq) <= e.seq) ac.abort()             // closed before anything else happened
        else { open.set(e.seq, ac); r.body?.pipeTo(new WritableStream()).catch(() => {}) }  // keep reading so the server can write
        rep = { status: r.status, resHeaders, res: { stream: true }, at }
      }
      else {
        // the target's own origin in a body reads as the recording's (an absolute link the server built from the request)
        let buf = Buffer.from(await r.arrayBuffer())
        if (recBase !== base && /json|text/.test(ct)) buf = Buffer.from(buf.toString('utf8').split(base).join(recBase))
        rep = { status: r.status, resHeaders, res: isPage ? pageRecord(buf) : bodyRecord(buf, ct), at }
      }
    } catch (err) { rep = { status: 0, resHeaders: {}, res: { text: String(err.message || err) }, at } } finally { clearTimeout(timer) }
    ctx.rep.t1 = Date.now()
    const diffs = isPage ? comparePage(ctx, e, rep, route) : compareExchange(ctx, e, rep, route)
    const pr = (perRoute[`${e.method} ${route}`] ??= { calls: 0, pass: 0, fail: 0 }); pr.calls++
    if (diffs.length) { pr.fail++; if (!isPage || STRICT_PAGES) exitCode = 1 } else pr.pass++
    results.push({ seq: e.seq, page: isPage || undefined, alias: e.alias, route, method: e.method, path: e.path, status: [e.status, rep.status], ok: !diffs.length, diffs: diffs.slice(0, 30) })
  }
  for (const ac of open.values()) ac.abort()
  const fails = results.filter(r => r.ok === false)
  const pages = results.filter(r => r.page), apis = results.filter(r => !r.page && !r.skipped)
  const name = meta?.name ?? path.basename(file, '.jsonl')
  const report = { recording: path.relative(ROOT, file), profile: meta?.profile, base: BASE, replayedAt: new Date().toISOString(), exchanges: apis.length, pass: apis.filter(r => r.ok).length, fail: apis.filter(r => r.ok === false).length, pages: pages.length, pagesSame: pages.filter(r => r.ok).length, unreplayable, sqlRun, sqlSkipped, idPairs: ctx.fwd.size, perRoute, failures: fails }
  const out = OUT && files.length === 1 ? OUT : path.join(RUN, `replay-${name}.json`)
  writeFileSync(out, JSON.stringify(report, null, 1))
  console.log(`${name} [${meta?.profile}] -> ${BASE}: ${report.exchanges} exchanges, ${report.pass} same, ${report.fail} differ; pages ${report.pagesSame}/${report.pages} same; ${unreplayable} unreplayable, sql ${sqlRun} run / ${sqlSkipped} skipped; ${report.idPairs} id pairs; report ${path.relative(ROOT, out)}`)
  for (const f of fails.slice(0, MAXP)) console.log(`  ${f.page ? 'page ' : ''}#${f.seq} ${f.method} ${f.path} (${f.alias ?? 'anon'}) ${f.status.join('->')}: ` + f.diffs.slice(0, 3).map(d => `${d.path}: ${JSON.stringify(d.rec)?.slice(0, 80)} != ${JSON.stringify(d.rep)?.slice(0, 80)}`).join(' | '))
}
if (sql) await sql.end()
process.exit(exitCode)
