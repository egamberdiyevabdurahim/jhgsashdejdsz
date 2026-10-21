#!/usr/bin/env node
// tools/contract/flows.mjs — the API's happy paths, driven straight over HTTP through the recording proxy (no browser): a student and her
// parent register, the student finishes the diagnostic (the engine), takes the English and math checks (the CAT, answering the first
// option each time), opens her day, studies, links her parent; the parent reads her week, writes a note, sets alerts and a pledge.
// Valid bodies from each route's own schema; ids from the answers. Complements sweep.mjs (the refusals) and the page walks.
//
//   node tools/contract/flows.mjs <session-name> <profile>     (server + proxy from serve.mjs already up; record.mjs runs it as "flows")
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, PROXY_URL, WALK_PASSWORD } from './env.mjs'
import { mintSession, cookieHeader } from './lib.mjs'

const [name, profile] = process.argv.slice(2)
if (!name || !profile) { console.error('usage: flows.mjs <session-name> <profile>'); process.exit(2) }
const ctl = (p, b) => fetch(PROXY_URL + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b ?? {}) }).then(r => r.json())
const diagnostic = JSON.parse(readFileSync(path.join(ROOT, 'tools/contract/fixtures/diagnostic-done.json'), 'utf8'))

const who = {}
let n = 0, cid = 0
const clientId = tag => `flow-${tag}-${++cid}`
async function call(as, method, p, body, { raw } = {}) {
  const headers = { accept: 'application/json' }
  if (as) { headers.cookie = who[as].cookie; headers['x-jg-uid'] = who[as].uid }
  if (body !== undefined) headers['content-type'] = raw ? 'text/plain;charset=UTF-8' : 'application/json'
  const r = await fetch(PROXY_URL + p, { method, headers, body: body === undefined ? undefined : raw ? body : JSON.stringify(body), redirect: 'manual', signal: AbortSignal.timeout(90_000) })
  n++
  const t = await r.text(); let json = null; try { json = JSON.parse(t) } catch {}
  return { status: r.status, json }
}
async function account(as, role, firstName, lastName, lang) {
  const email = `${as}@example.test`
  const r = await call(null, 'POST', '/api/v1/register', { email, password: WALK_PASSWORD, firstName, lastName, role, lang })
  if (r.status !== 201) throw new Error(`register ${as}: ${r.status}`)
  who[as] = { uid: r.json.id, email, cookie: cookieHeader(await mintSession({ uid: r.json.id, email })) }
}
/** A check or quiz run to its end, answering the first option (or "Bilmayman" when there is none), at most `max` items. */
async function check(as, kind, start, max = 60) {
  let r = await call(as, 'POST', `/api/v1/checks/${kind}`, { op: 'start', ...start })
  const run = r.json?.run
  for (let i = 0; i < max && r.status === 200; i++) {
    const it = r.json?.next ?? r.json?.item
    if (!it?.id) break
    const tok = it.options?.[0]?.t ?? it.options?.[0]?.token
    r = await call(as, 'POST', `/api/v1/checks/${kind}`, tok ? { op: 'answer', item: it.id, token: tok, run } : { op: 'answer', item: it.id, dontknow: true, run })
  }
  return { run, last: r }
}

await ctl('/__contract/session', { name, profile, note: 'tools/contract/flows.mjs: register, diagnostic, checks, day, study, family link, parent week/notes/alerts/pledge' })
try {
  await account('flow-student', 'student', 'Malika', 'Karimova', 'uz')
  await account('flow-parent', 'parent', 'Dilfuza', 'Karimova', 'uz')
  const S = 'flow-student', P = 'flow-parent', sid = who[S].uid
  // the student's first screens and the diagnostic (the engine)
  let snap = await call(S, 'GET', '/api/v1/engine/snapshot')
  await call(S, 'PUT', '/api/v1/state/jg.seen.v1', JSON.stringify({ intro: 1 }), { raw: true })
  await call(S, 'POST', '/api/v1/me/profile', { role: 'student', firstName: 'Malika', lastName: 'Karimova', locale: 'uz' })
  let c = await call(S, 'POST', '/api/v1/engine/commit', { kind: 'diagnostic_done', base_version: snap.json?.profile_version ?? 0, payload: diagnostic, client_id: clientId('diag') })
  snap = c.json?.snapshot ? { json: c.json.snapshot } : await call(S, 'GET', '/api/v1/engine/snapshot')
  c = await call(S, 'POST', '/api/v1/engine/commit', { kind: 'unlock', base_version: snap.json?.profile_version ?? 1, payload: { parallel: ['KR', 'TR'] }, client_id: clientId('unlock') })
  snap = await call(S, 'GET', '/api/v1/engine/snapshot')
  await call(S, 'GET', '/api/v1/engine/unis')
  // the checks (the CAT): English and math to their end, then the day's quiz when a task has one
  await check(S, 'english', { lang: 'uz' })
  await check(S, 'math', { lang: 'uz' })
  snap = await call(S, 'GET', '/api/v1/engine/snapshot')
  const today = snap.json?.local_date, tasks = (snap.json?.tasks?.[today] ?? []).filter(t => t && t.id)
  for (const t of tasks.slice(0, 3)) {
    if (t.quiz || t.type === 'quiz') { const q = await check(S, 'quiz', { task: t.id, quiz: 'math' }, 12); if (q.run) await call(S, 'POST', `/api/v1/tasks/${encodeURIComponent(t.id)}/complete`, { proof: { kind: 'quiz', run: q.run }, client_id: clientId('task') }) }
    else await call(S, 'POST', `/api/v1/tasks/${encodeURIComponent(t.id)}/complete`, { proof: { kind: 'self_report', text: 'done' }, client_id: clientId('task') })
  }
  // the day: lessons, homework, mock, games, league, achievements, notes
  for (const p of ['/api/v1/lessons', '/api/v1/lessons/week', '/api/v1/homework', '/api/v1/mock', '/api/v1/mock/dtm', '/api/v1/explore', '/api/v1/checkpoints', '/api/v1/milestones/reports', '/api/v1/motivation', '/api/v1/league', '/api/v1/games/me', '/api/v1/games/daily', '/api/v1/me/subscription', '/api/v1/plans', '/api/v1/score-reports'])
    await call(S, 'GET', p)
  const lessons = await call(S, 'GET', '/api/v1/lessons')
  const lids = [...new Set(JSON.stringify(lessons.json ?? {}).match(/"id":"([A-Za-z0-9_.:-]{3,80})"/g)?.map(x => x.slice(6, -1)) ?? [])].slice(0, 3)
  for (const id of lids) await call(S, 'GET', `/api/v1/lessons/${encodeURIComponent(id)}`)
  await call(S, 'POST', '/api/v1/achievements/seen', { ids: ['first'] })
  await call(S, 'POST', '/api/v1/notes/seen', { ids: [] })
  // a study session
  const ss = await call(S, 'POST', '/api/v1/study/sessions', { client_id: clientId('study'), subject: 'SAT', task_id: tasks[0]?.id ?? null, minutes: 25 })
  const ssid = ss.json?.session?.id ?? ss.json?.id
  await call(S, 'GET', '/api/v1/study/sessions/current')
  if (ssid) { await call(S, 'POST', `/api/v1/study/sessions/${ssid}/break`, {}); await call(S, 'POST', `/api/v1/study/sessions/${ssid}/complete`, {}) }
  // the family link: the student's code, the parent joins with it
  const code = await call(S, 'POST', '/api/v1/family/code', {})
  await call(P, 'POST', '/api/v1/family/join', { code: code.json?.code ?? 'NOCODE' })
  await call(P, 'GET', '/api/v1/family')
  await call(S, 'GET', '/api/v1/family')
  await call(P, 'GET', `/api/v1/parent/children/${sid}/week`)
  await call(P, 'POST', '/api/v1/parent/notes', { student_id: sid, event: 'flow note' })
  await call(P, 'POST', '/api/v1/parent/alerts', { student_id: sid, missed_homework: true, inactivity: false })
  const goal = (await call(P, 'GET', '/api/v1/pledges')).json
  await call(P, 'POST', '/api/v1/pledges', { student_id: sid, goal: 'tasks', target: 10, reward: 'a book', due: 'month' })
  await call(P, 'GET', '/api/v1/pledges')
  await call(S, 'GET', '/api/v1/pledges')
  await call(P, 'GET', `/api/v1/photo/${sid}`)
  await call(P, 'GET', '/api/v1/core/family')
  void goal
  if (profile === 'all') {
    // M1 surfaces (their switches on only in "all"): motivation, games, league, pledges acted on, notes, a DM and a group chat, pay
    await call(S, 'POST', '/api/v1/motivation', { op: 'why', text: 'I want to study abroad' })
    await call(S, 'GET', '/api/v1/motivation')
    const daily = await call(S, 'GET', '/api/v1/games/daily')
    await call(S, 'POST', '/api/v1/games/daily', { date: daily.json?.date ?? today, choice: 0, seconds: 12 })
    await call(S, 'GET', '/api/v1/games/me')
    await call(S, 'GET', '/api/v1/league')
    const pl = await call(S, 'GET', '/api/v1/pledges')
    const plId = JSON.stringify(pl.json ?? {}).match(/"id":"([A-Za-z0-9_-]{6,80})"/)?.[1]
    if (plId) await call(S, 'POST', `/api/v1/pledges/${plId}`, { op: 'seen' })
    await call(S, 'POST', '/api/v1/notes/seen', { ids: [] })
    await account('flow-friend', 'student', 'Aziza', 'Rasulova', 'uz')
    const dm = await call(S, 'POST', '/api/v1/chats', { kind: 'dm', with: who['flow-friend'].uid })
    const chatId = dm.json?.chat?.id ?? dm.json?.id ?? dm.json?.request?.chatId
    await call('flow-friend', 'GET', '/api/v1/chats/requests')
    const reqs = await call('flow-friend', 'GET', '/api/v1/chats/requests')
    const reqId = JSON.stringify(reqs.json ?? {}).match(/"id":"?([A-Za-z0-9_-]{1,80})"?/)?.[1]
    if (reqId) await call('flow-friend', 'POST', `/api/v1/chats/requests/${reqId}`, { accept: true })
    if (chatId) {
      const m = await call(S, 'POST', `/api/v1/chats/${chatId}/messages`, { text: 'Salom! Ertaga kutubxonada?', clientId: 'flow-m1' })
      await call('flow-friend', 'GET', `/api/v1/chats/${chatId}/messages`)
      const mid = m.json?.message?.id ?? m.json?.id
      if (mid) { await call('flow-friend', 'PUT', `/api/v1/chats/${chatId}/messages/${mid}/reaction`, { emoji: '👍' }); await call('flow-friend', 'POST', `/api/v1/chats/${chatId}/read`, { upTo: mid }) }
      await call(S, 'GET', `/api/v1/chats/${chatId}`)
    }
    const g = await call(S, 'POST', '/api/v1/chats', { kind: 'group', name: 'SAT study', members: [who['flow-friend'].uid] })
    const gid = g.json?.chat?.id ?? g.json?.id
    if (gid) { await call(S, 'PATCH', `/api/v1/chats/${gid}`, { about: 'Every evening' }); await call(S, 'POST', `/api/v1/chats/${gid}/messages`, { poll: { question: 'When?', options: ['18:00', '20:00'] }, clientId: 'flow-p1' }) }
    await call(S, 'GET', '/api/v1/chats')
    await call(S, 'GET', '/api/v1/chats/search?q=Aziza')
    await call(P, 'GET', '/api/v1/pay/billing')
    const co = await call(P, 'POST', '/api/v1/pay/checkout', { kind: 'plan', tier: 'pro', period: 'monthly', provider: 'payme', student: sid, lang: 'uz' })
    const num = co.json?.order?.number ?? co.json?.number
    if (num) { await call(P, 'GET', `/api/v1/pay/orders/${num}`); await call(P, 'POST', `/api/v1/pay/sandbox/${num}`, { outcome: 'paid' }); await call(P, 'GET', `/api/v1/pay/orders/${num}`) }
    await call(S, 'GET', '/api/v1/me/subscription')
    await call(P, 'GET', '/api/v1/core/family')
    await call(P, 'GET', '/api/v1/pledges')
  }
  // the state store round trip
  await call(S, 'POST', '/api/v1/state/jia.settings', JSON.stringify({ theme: 'light' }), { raw: true })
  await call(S, 'DELETE', '/api/v1/state/jia.settings')
  await call(S, 'GET', '/api/v1/engine/snapshot')
} finally {
  const r = await ctl('/__contract/end')
  console.log(`flows ${name} (${profile}): ${n} calls, ${r.recorded} recorded`)
}
