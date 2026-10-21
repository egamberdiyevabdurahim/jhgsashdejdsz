#!/usr/bin/env node
// tools/contract/sweep.mjs — the route sweep: every /api/v1 route x method, once without a session and once as each seeded account
// (ctr-student, ctr-parent, ctr-staff, demo-student, demo-parent), through the recording proxy, into contract/recordings/<name>.jsonl.
// Bodies are {} (the refusal contract: 400 / 401 / 403 / 404 / 405 / 409), path parameters are ids that do not exist, then a second
// pass fills the parameters it can learn from the first pass's answers (lesson ids, chat ids, ...). The walks (record.mjs) record the
// happy paths; this records the edges and makes sure every route is in the corpus at least once.
//
//   node tools/contract/sweep.mjs <session-name> <profile>     (server + proxy from serve.mjs already up)
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, PROXY_URL } from './env.mjs'
import { routes, mintSession, cookieHeader } from './lib.mjs'

const [name, profile] = process.argv.slice(2)
if (!name || !profile) { console.error('usage: sweep.mjs <session-name> <profile>'); process.exit(2) }
const accounts = JSON.parse(readFileSync(path.join(ROOT, 'contract/seed/accounts.json'), 'utf8'))
const ctl = (p, b) => fetch(PROXY_URL + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b ?? {}) }).then(r => r.json())

const who = {}
for (const a of ['ctr-student', 'ctr-student2', 'ctr-parent', 'ctr-staff', 'demo-student', 'demo-parent']) {
  const u = accounts[a]; if (u) who[a] = { uid: u.id, cookie: cookieHeader(await mintSession({ uid: u.id, email: u.email })) }
}
let n = 0
async function call(alias, method, p, body) {
  const headers = { accept: 'application/json' }
  if (alias) { headers.cookie = who[alias].cookie; headers['x-jg-uid'] = who[alias].uid }
  if (body !== undefined) headers['content-type'] = 'application/json'
  const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 60_000)
  try {
    const r = await fetch(PROXY_URL + p, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ac.signal, redirect: 'manual' })
    n++
    if (/event-stream/.test(r.headers.get('content-type') || '')) { ac.abort(); return { status: r.status } }
    const t = await r.text(); let j = null; try { j = JSON.parse(t) } catch {}
    return { status: r.status, json: j }
  } catch (e) { return { status: 0, error: String(e.message || e) } } finally { clearTimeout(timer) }
}

const R = routes().filter(r => r.methods.length).sort((a, b) => a.route.localeCompare(b.route))
const fill = (route, params = {}) => route.replace(/\[\.\.\.([^\]]+)\]/g, (_, k) => params[k] ?? 'contract-missing/x').replace(/\[([^\]]+)\]/g, (_, k) => encodeURIComponent(params[k] ?? 'contract-missing'))
const callers = [null, 'ctr-student', 'ctr-parent', 'ctr-staff', 'demo-student', 'demo-parent'].filter(a => a === null || who[a])

await ctl('/__contract/session', { name, profile, note: 'tools/contract/sweep.mjs: every route x method, anonymous and as each seeded account; {} bodies; missing ids' })
try {
  // pass 1: every route x method x caller; HEAD is skipped (it mirrors GET)
  for (const r of R) for (const m of r.methods.filter(x => x !== 'HEAD')) for (const a of callers) {
    if (a === 'demo-parent' && m !== 'GET') continue                               // keep it shorter: the demo parent only reads
    await call(a, m, fill(r.route), m === 'GET' || m === 'DELETE' ? undefined : {})
  }
  // pass 2: parameters learned from answers, as the student (lessons, chats, pledges, milestones, orders) and the parent (children)
  const s = 'ctr-student'
  const lessons = await call(s, 'GET', '/api/v1/lessons')
  const ids = JSON.stringify(lessons.json ?? {}).match(/"id":"([A-Za-z0-9_.:-]{3,80})"/g)?.map(x => x.slice(6, -1)) ?? []
  for (const id of [...new Set(ids)].slice(0, 6)) {
    await call(s, 'GET', `/api/v1/lessons/${encodeURIComponent(id)}`)
    for (const sub of ['writing', 'speaking', 'speaking/voice']) await call(s, 'GET', `/api/v1/lessons/${encodeURIComponent(id)}/${sub}`)
  }
  await call(s, 'GET', '/api/v1/lessons/week')
  const fam = await call('ctr-parent', 'GET', '/api/v1/family')
  const kids = JSON.stringify(fam.json ?? {}).match(/"(?:studentId|childId|id)":"([0-9a-f-]{36})"/g)?.map(x => x.split('"')[3]) ?? []
  for (const k of [...new Set(kids)].slice(0, 3)) await call('ctr-parent', 'GET', `/api/v1/parent/children/${k}/week`)
  await call('ctr-parent', 'GET', `/api/v1/parent/children/${accounts['ctr-student'].id}/week`)
  await call(s, 'GET', `/api/v1/photo/${accounts['ctr-student'].id}`)
  await call('ctr-parent', 'GET', `/api/v1/photo/${accounts['ctr-student'].id}`)
  for (const k of ['jg.parent.lang', 'jg.theme', 'jg.state']) await call(s, 'PUT', `/api/v1/state/${encodeURIComponent(k)}`, { value: 'x' })
  for (const kind of ['english', 'math', 'sat', 'ielts']) await call(s, 'POST', `/api/v1/checks/${kind}`, { op: 'state' })
  const chats = await call(s, 'GET', '/api/v1/chats')
  const cids = JSON.stringify(chats.json ?? {}).match(/"id":"([A-Za-z0-9_-]{6,80})"/g)?.map(x => x.slice(6, -1)) ?? []
  for (const c of [...new Set(cids)].slice(0, 3)) { await call(s, 'GET', `/api/v1/chats/${c}`); await call(s, 'GET', `/api/v1/chats/${c}/messages`) }
  for (const p of ['/api/v1/me/subscription', '/api/v1/pay/billing', '/api/v1/pay/gifts', '/api/v1/pay/coupons', '/api/v1/plans', '/api/v1/engine/snapshot', '/api/v1/engine/unis', '/api/v1/homework', '/api/v1/checkpoints', '/api/v1/milestones/reports', '/api/v1/score-reports', '/api/v1/pledges', '/api/v1/motivation', '/api/v1/league', '/api/v1/games/me', '/api/v1/games/daily', '/api/v1/games/campus', '/api/v1/explore', '/api/v1/privacy', '/api/v1/mock', '/api/v1/mock/dtm', '/api/v1/mock/sat', '/api/v1/study/sessions/current', '/api/v1/blocks', '/api/v1/core/family', '/api/v1/community/feed', '/api/v1/chats/clubs', '/api/v1/chats/requests', '/api/v1/chats/presence'])
    await call('ctr-student2', 'GET', p).catch(() => null)
} finally {
  const r = await ctl('/__contract/end')
  console.log(`sweep ${name} (${profile}): ${n} calls, ${r.recorded} recorded`)
}
