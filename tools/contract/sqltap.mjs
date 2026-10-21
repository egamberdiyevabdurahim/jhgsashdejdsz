// tools/contract/sqltap.mjs — preloaded into a smoke walk (tsx --import ./tools/contract/sqltap.mjs tests/smoke/x.ts) while it is recorded.
// Some walks set fixtures straight in the database (a check result, a back-dated profile, a plan time) between their HTTP steps; a replay
// on a fresh copy must make the same writes at the same point. src/db/client.ts takes its client from globalThis.__jgSql when one exists,
// so this puts one there first, with postgres.js's debug hook appending every write statement and its parameters, time-stamped, to
// CONTRACT_SQLTAP (a .jsonl file); tools/contract/record.mjs merges them into the session by time. Reads are not kept.
// A walk that opens its own postgres() client is not seen here: record.mjs flags it ("untracked database writes").
import { createRequire } from 'node:module'
import { appendFileSync } from 'node:fs'
import path from 'node:path'

const out = process.env.CONTRACT_SQLTAP
if (out && process.env.DATABASE_URL) {
  const require = createRequire(path.join(process.cwd(), 'package.json'))
  const postgres = require('postgres')
  const WRITE = /^\s*(insert|update|delete|truncate|with\b[\s\S]*\b(insert|update|delete)\b)/i
  const enc = v => (v instanceof Date ? v.toISOString() : typeof v === 'bigint' ? String(v) : Buffer.isBuffer(v) ? { b64: v.toString('base64') } : v)
  globalThis.__jgSql = postgres(process.env.DATABASE_URL, {
    max: 10,
    debug: (_conn, query, params) => { if (WRITE.test(query)) appendFileSync(out, JSON.stringify({ at: Date.now(), query, params: (params ?? []).map(enc) }) + '\n') },
  })
}
