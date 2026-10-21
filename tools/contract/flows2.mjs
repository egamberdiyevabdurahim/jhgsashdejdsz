#!/usr/bin/env node
// tools/contract/flows2.mjs — the second tier of happy paths, over HTTP through the recording proxy: lessons (a piece, writing/speaking
// state), the SAT mock score, coins, a study break, and with the "all" profile the M1 doors flows.mjs leaves out: community posts,
// likes, comments; blocks and reports; a group chat's pin, poll vote, edit, delete, members and clubs; pledges acted on; the staff
// console (duty, members, suspend); a parent unlinked. Valid bodies from each route's schema; ids from the answers.
//
//   node tools/contract/flows2.mjs <session-name> <profile>     (record.mjs runs it as "flows2")
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, PROXY_URL, WALK_PASSWORD } from './env.mjs'
import { mintSession, cookieHeader } from './lib.mjs'

const [name, profile] = process.argv.slice(2)
if (!name || !profile) { console.error('usage: flows2.mjs <session-name> <profile>'); process.exit(2) }
const ctl = (p, b) => fetch(PROXY_URL + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b ?? {}) }).then(r => r.json())
const diagnostic = JSON.parse(readFileSync(path.join(ROOT, 'tools/contract/fixtures/diagnostic-done.json'), 'utf8'))
const accounts = JSON.parse(readFileSync(path.join(ROOT, 'contract/seed/accounts.json'), 'utf8'))

const who = {}
let n = 0, cid = 0
const clientId = tag => `flow2-${tag}-${++cid}`
async function call(as, method, p, body) {
  const headers = { accept: 'application/json' }
  if (as) { headers.cookie = who[as].cookie; headers['x-jg-uid'] = who[as].uid }
  if (body !== undefined) headers['content-type'] = 'application/json'
  const r = await fetch(PROXY_URL + p, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual', signal: AbortSignal.timeout(90_000) })
  n++
  const t = await r.text(); let json = null; try { json = JSON.parse(t) } catch {}
  return { status: r.status, json }
}
async function account(as, role, firstName, lastName) {
  const email = `${as}@example.test`
  const r = await call(null, 'POST', '/api/v1/register', { email, password: WALK_PASSWORD, firstName, lastName, role, lang: 'uz' })
  if (r.status !== 201) throw new Error(`register ${as}: ${r.status}`)
  who[as] = { uid: r.json.id, email, cookie: cookieHeader(await mintSession({ uid: r.json.id, email })) }
}
const idsIn = (j, re = /"id":"([A-Za-z0-9_.:-]{3,80})"/g) => [...new Set([...JSON.stringify(j ?? {}).matchAll(re)].map(m => m[1]))]

await ctl('/__contract/session', { name, profile, note: 'tools/contract/flows2.mjs: lessons, mock, coins, study break; M1: community, blocks, reports, chat admin, clubs, pledges, staff console' })
try {
  await account('flow2-student', 'student', 'Nilufar', 'Saidova')
  await account('flow2-parent', 'parent', 'Gulnora', 'Saidova')
  await account('flow2-friend', 'student', 'Bekzod', 'Aliyev')
  const S = 'flow2-student', P = 'flow2-parent', F = 'flow2-friend', sid = who[S].uid
  let snap = await call(S, 'GET', '/api/v1/engine/snapshot')
  const c = await call(S, 'POST', '/api/v1/engine/commit', { kind: 'diagnostic_done', base_version: snap.json?.profile_version ?? 0, payload: diagnostic, client_id: clientId('diag') })
  await call(S, 'POST', '/api/v1/engine/commit', { kind: 'unlock', base_version: c.json?.snapshot?.profile_version ?? 1, payload: { parallel: ['KR', 'TR'] }, client_id: clientId('unlock') })
  // lessons: open the first ones, answer a piece, ask the writing / speaking state of each
  const lessons = await call(S, 'GET', '/api/v1/lessons')
  const lids = idsIn(lessons.json?.lessons ?? lessons.json).filter(x => /^C\d/.test(x)).slice(0, 3)
  for (const id of lids) {
    const v = await call(S, 'GET', `/api/v1/lessons/${encodeURIComponent(id)}`)
    const tok = JSON.stringify(v.json ?? {}).match(/"t":"([A-Za-z0-9_-]{6,64})"/)?.[1]
    await call(S, 'POST', `/api/v1/lessons/${encodeURIComponent(id)}/piece`, tok ? { n: 1, token: tok } : { n: 1, dontknow: true })
    await call(S, 'GET', `/api/v1/lessons/${encodeURIComponent(id)}/writing`)
    await call(S, 'GET', `/api/v1/lessons/${encodeURIComponent(id)}/speaking`)
  }
  await call(S, 'GET', '/api/v1/lessons/week')
  // the SAT mock score, coins, a study session broken off
  await call(S, 'POST', '/api/v1/mock', { rw: 520, math: 560 })
  await call(S, 'GET', '/api/v1/mock')
  await call(S, 'POST', '/api/v1/coins/spend', { amount: 1, reason: 'style', ref: 'flow2-style', client_id: clientId('spend') })
  const ss = await call(S, 'POST', '/api/v1/study/sessions', { client_id: clientId('study'), subject: 'SAT', task_id: null, minutes: 25 })
  const ssid = ss.json?.session?.id
  if (ssid) await call(S, 'POST', `/api/v1/study/sessions/${ssid}/break`, { reason: 'left_app' })
  // the family: link, then the student removes the parent
  const code = await call(S, 'POST', '/api/v1/family/code', {})
  await call(P, 'POST', '/api/v1/family/join', { code: code.json?.code ?? 'NOCODE' })
  if (profile === 'all') {
    await call(P, 'POST', '/api/v1/pledges', { student_id: sid, goal: 'streak', target: 5, reward: 'kino', due: 'next' })
    const pl = await call(S, 'GET', '/api/v1/pledges')
    for (const id of idsIn(pl.json?.pledges, /"id":"([0-9a-f-]{36})"/g).slice(0, 1)) { await call(S, 'POST', `/api/v1/pledges/${id}`, { action: 'seen' }); await call(P, 'POST', `/api/v1/pledges/${id}`, { action: 'end' }) }
    await call(P, 'POST', '/api/v1/parent/notes', { student_id: sid, event: 'homework_done' })
    // community: a post, liked, saved, commented, edited, unliked, deleted; the feed
    await call(S, 'PUT', '/api/v1/community/me', { bio: 'SAT 2027' })
    const post = await call(S, 'POST', '/api/v1/community/posts', { kind: 'post', text: 'Bugun 3 ta dars tugatdim!' })
    const pid = post.json?.post?.id ?? post.json?.id
    await call(F, 'GET', '/api/v1/community/feed')
    if (pid) {
      for (const [as, m, sub, b] of [[F, 'POST', 'like'], [F, 'POST', 'save'], [F, 'POST', 'comments', { text: 'Zoʻr!' }], [F, 'POST', 'view'], [S, 'PATCH', null, { text: 'Bugun 4 ta dars tugatdim!' }], [F, 'DELETE', 'like'], [F, 'GET', 'comments']])
        await call(as, m, `/api/v1/community/posts/${pid}${sub ? '/' + sub : ''}`, b)
      await call(S, 'DELETE', `/api/v1/community/posts/${pid}`)
    }
    await call(S, 'GET', '/api/v1/community/notifications')
    // safety: block and unblock, a report
    await call(S, 'POST', '/api/v1/blocks', { userId: who[F].uid })
    await call(S, 'GET', '/api/v1/blocks')
    await call(S, 'DELETE', '/api/v1/blocks', { userId: who[F].uid })
    await call(S, 'POST', '/api/v1/reports', { target: 'profile', reason: 'spam', targetUserId: who[F].uid, surface: 'profile' })
    // a group chat run by its owner: a poll voted, a message edited and deleted, a pin, members added, promoted, removed, a club
    const g = await call(S, 'POST', '/api/v1/chats', { kind: 'group', name: 'IELTS 7', members: [who[F].uid] })
    const gid = g.json?.chat?.id
    if (gid) {
      const m1 = await call(S, 'POST', `/api/v1/chats/${gid}/messages`, { text: 'Salom hammaga', clientId: 'flow2-m1' })
      const poll = await call(S, 'POST', `/api/v1/chats/${gid}/messages`, { poll: { question: 'Qachon?', options: ['Shanba', 'Yakshanba'] }, clientId: 'flow2-p1' })
      const mid = m1.json?.message?.id, pollId = poll.json?.message?.id
      if (pollId) await call(F, 'POST', `/api/v1/chats/${gid}/messages/${pollId}/vote`, { option: 1 })
      if (mid) { await call(S, 'PATCH', `/api/v1/chats/${gid}/messages/${mid}`, { text: 'Salom hammaga!' }); await call(S, 'POST', `/api/v1/chats/${gid}/pin`, { messageId: mid }); await call(S, 'DELETE', `/api/v1/chats/${gid}/messages/${mid}`) }
      await call(S, 'POST', `/api/v1/chats/${gid}/typing`, {})
      await call(S, 'POST', `/api/v1/chats/${gid}/members`, { add: [accounts['ctr-student'].id] })
      await call(S, 'PATCH', `/api/v1/chats/${gid}/members/${who[F].uid}`, { role: 'admin' })
      await call(S, 'DELETE', `/api/v1/chats/${gid}/members/${accounts['ctr-student'].id}`)
      await call(F, 'POST', `/api/v1/chats/${gid}/leave`, {})
      await call(S, 'GET', `/api/v1/chats/${gid}/messages`)
    }
    const club = await call(S, 'POST', '/api/v1/chats/clubs', { name: 'Shaxmat klubi', about: 'Har juma' })
    const clid = club.json?.club?.id ?? club.json?.chat?.id
    await call(F, 'GET', '/api/v1/chats/clubs')
    if (clid) { await call(F, 'POST', `/api/v1/chats/clubs/${clid}/join`, {}); await call(S, 'POST', `/api/v1/chats/clubs/${clid}/topics`, { name: 'Ochilishlar' }); await call(F, 'GET', `/api/v1/chats/clubs/${clid}/topics`); await call(F, 'POST', `/api/v1/chats/clubs/${clid}/leave`, {}) }
    // the staff console (ctr-staff is on STAFF_USER_IDS: the bootstrap admin)
    const st = accounts['ctr-staff']
    who.staff = { uid: st.id, email: st.email, cookie: cookieHeader(await mintSession({ uid: st.id, email: st.email })) }
    await call('staff', 'POST', '/api/v1/staff/duty', { on: true })
    await call('staff', 'POST', '/api/v1/staff/members', { email: 'flow2-friend@example.test', role: 'teacher' })
    await call('staff', 'DELETE', '/api/v1/staff/members', { userId: who[F].uid, role: 'teacher' })
    await call('staff', 'POST', '/api/v1/staff/suspend', { userId: who[F].uid, reason: 'contract flow' })
    await call('staff', 'POST', '/api/v1/staff/suspend', { userId: who[F].uid, lift: true })
    await call('staff', 'GET', '/api/v1/staff/chats/reported')
    await call('staff', 'GET', '/api/v1/staff/alarm')
    await call('staff', 'GET', '/api/v1/staff/checkpoints')
    await call('staff', 'POST', '/api/v1/staff/duty', { on: false })
    await call(S, 'POST', '/api/v1/games/result', { kind: 'chess', moves: ['e2e4', 'e7e5'], result: 'lose', why: 'resign', client_id: clientId('game') })
  }
  await call(S, 'DELETE', `/api/v1/family/parents/${who[P].uid}`)
  await call(S, 'GET', '/api/v1/family')
} finally {
  const r = await ctl('/__contract/end')
  console.log(`flows ${name} (${profile}): ${n} calls, ${r.recorded} recorded`)
}
