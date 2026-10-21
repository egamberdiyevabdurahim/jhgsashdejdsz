// node --test tools/contract/normalise.test.mjs — the normaliser's own rules, on hand-made exchanges.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newContext, compareJson, compareExchange, substitute, pair, tokenLike } from './normalise.mjs'

const at = Date.parse('2026-10-21T06:00:00Z')
const ctx0 = () => { const c = newContext(); c.rec.t0 = at; c.rec.t1 = at + 60000; c.rep.t0 = at + 3600000; c.rep.t1 = at + 3660000; return c }
const opts = { route: '/api/v1/x', recAt: at + 1000, repAt: at + 3601000 }

test('ids pair one to one for the whole session, and rewrite later requests', () => {
  const c = ctx0()
  assert.deepEqual(compareJson(c, { id: 'a1b2c3d4-0000-4000-8000-000000000001' }, { id: 'ffffffff-0000-4000-8000-000000000009' }, opts), [])
  assert.equal(substitute(c, '/api/v1/chats/a1b2c3d4-0000-4000-8000-000000000001/read'), '/api/v1/chats/ffffffff-0000-4000-8000-000000000009/read')
  // the same recorded id answered as another one is a diff
  const d = compareJson(c, { id: 'a1b2c3d4-0000-4000-8000-000000000001' }, { id: 'eeeeeeee-0000-4000-8000-000000000002' }, opts)
  assert.equal(d.length, 1); assert.equal(d[0].why, 'id pairing broken')
  // and two recorded ids may not become one
  assert.equal(pair(c, 'zzzzzzzz-0000-4000-8000-000000000003', 'ffffffff-0000-4000-8000-000000000009'), false)
})
test('a percent-encoded id in a path is rewritten too', () => {
  const c = ctx0()
  pair(c, '4Ip76XKhnrmu', 'Zq9x2LmPa0Rt')
  assert.equal(substitute(c, '/api/v1/chats/dm%3A4Ip76XKhnrmu/messages'), '/api/v1/chats/dm%3AZq9x2LmPa0Rt/messages')
})
test('a code field pairs even when it reads like a word; a plain word does not', () => {
  const c = ctx0()
  assert.deepEqual(compareJson(c, { code: 'MBHQPZPN' }, { code: '37952C5K' }, opts), [])
  assert.equal(compareJson(c, { status: 'pending' }, { status: 'started' }, opts).length, 1)
  assert.equal(tokenLike('not_started'), false); assert.equal(tokenLike('9ytzg1eb53Tb'), true)
})
test('times: made during the run, or the same distance from now; dates as day offsets', () => {
  const c = ctx0()
  assert.deepEqual(compareJson(c, { createdAt: '2026-10-21T06:00:30.000Z' }, { createdAt: '2026-10-21T07:00:40.000Z' }, opts), [])
  assert.deepEqual(compareJson(c, { expires: at + 1000 + 30 * 86400000 }, { expires: at + 3601000 + 30 * 86400000 }, opts), [])
  assert.deepEqual(compareJson(c, { due: '2026-10-22' }, { due: '2026-10-22' }, opts), [])
  assert.equal(compareJson(c, { due: '2026-10-22T13:00:00Z' }, { due: '2026-10-25T13:00:00Z' }, opts).length, 1)
})
test('a line naming "now" may be a few minutes off; other words may not', () => {
  const c = ctx0()
  assert.deepEqual(compareJson(c, { t: 'Updated today, 09:01' }, { t: 'Updated today, 09:00' }, opts), [])
  assert.equal(compareJson(c, { t: 'Updated today, 09:01' }, { t: 'Updated today, 09:30' }, opts).length, 1)
  assert.equal(compareJson(c, { t: 'Updated today, 09:01' }, { t: 'Updated yesterday, 09:01' }, opts).length, 1)
})
test('an exchange: status, compared headers, body', () => {
  const c = ctx0()
  const rec = { status: 200, at: opts.recAt, resHeaders: { 'content-type': 'application/json', vary: 'rsc' }, res: { json: { ok: true } } }
  const rep = { status: 200, at: opts.repAt, resHeaders: { 'content-type': 'application/json; charset=utf-8' }, res: { json: { ok: true } } }
  assert.deepEqual(compareExchange(c, rec, rep, '/api/v1/x'), [])
  assert.equal(compareExchange(c, rec, { ...rep, status: 201 }, '/api/v1/x').length, 1)
  assert.equal(compareExchange(c, rec, { ...rep, res: { json: { ok: false } } }, '/api/v1/x').length, 1)
})
