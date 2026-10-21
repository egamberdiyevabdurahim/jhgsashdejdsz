#!/usr/bin/env node
// tools/contract/record.mjs — records contract sessions. Each session gets a FRESH copy of the seed (jg_ctr_rec_dev) and a FRESH dev server
// under its switch profile, so it can be replayed from the very same state:
//
//   node tools/contract/record.mjs <profile> <what> [<what> ...]     what = sweep | a smoke walk's name (tests/smoke/<name>.ts)
//
// Session name: <profile>-<what>. Output: contract/recordings/<profile>-<what>.jsonl, the walk's log in contract/.run/. A walk runs with
// SMOKE_BASE at the recording proxy, the headless shell, the scratch DATABASE_URL and tools/contract/sqltap.mjs preloaded (its own
// database writes are merged into the session as {type:"sql"} lines). Long: run it in the background and poll its log.
import { execFileSync, spawn } from 'node:child_process'
import { readFileSync, existsSync, rmSync, appendFileSync, writeFileSync, openSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT, LEGACY, RUN, REC, PROXY_URL, CHROME, CONTRACT_PASSWORD, dbUrl } from './env.mjs'

const [profile, ...whats] = process.argv.slice(2)
if (!profile || !whats.length) { console.error('usage: record.mjs <profile> <sweep|walk> ...'); process.exit(2) }
const DB = 'jg_ctr_rec_dev'
const node = (args, opts = {}) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit', ...opts })
const ctl = (p, b) => fetch(PROXY_URL + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b ?? {}) }).then(r => r.json())
const log = m => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`)

function runWalk(walk, env, logFile, timeoutMs) {
  return new Promise(resolve => {
    const fd = openSync(logFile, 'w')
    // the walks are the legacy checkout's tests/smoke/*.ts, run there; the SQL tap is this repo's
    const tsx = path.join(LEGACY, 'node_modules/tsx/dist/cli.mjs')
    const ch = spawn(process.execPath, [tsx, '--import', pathToFileURL(path.join(ROOT, 'tools/contract/sqltap.mjs')).href, `tests/smoke/${walk}.ts`], { cwd: LEGACY, env: { ...process.env, ...env }, stdio: ['ignore', fd, fd], windowsHide: true })
    const timer = setTimeout(() => { try { execFileSync('taskkill', ['/PID', String(ch.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {} }, timeoutMs)
    ch.on('exit', code => { clearTimeout(timer); resolve(code) })
  })
}

for (const what of whats) {
  const name = `${profile}-${what}`
  log(`== ${name}`)
  node(['tools/contract/serve.mjs', 'stop'])
  node(['tools/contract/db.mjs', 'copy', DB])
  node(['tools/contract/serve.mjs', 'start', profile, DB])
  node(['tools/contract/serve.mjs', 'wait'])
  try {
    if (what === 'sweep' || what === 'flows' || what === 'flows2') { node([`tools/contract/${what}.mjs`, name, profile]); continue }
    const src = path.join(LEGACY, 'tests/smoke', `${what}.ts`)
    if (!existsSync(src)) { log(`no walk ${what}`); continue }
    const untracked = /postgres\(/.test(readFileSync(src, 'utf8'))
    const tap = path.join(RUN, `sqltap-${name}.jsonl`); rmSync(tap, { force: true })
    await ctl('/__contract/session', { name, profile, note: `tests/smoke/${what}.ts through the proxy${untracked ? '; UNTRACKED database writes (the walk opens its own postgres client)' : ''}` })
    const t0 = Date.now()
    const code = await runWalk(what, {
      SMOKE_BASE: PROXY_URL, SMOKE_CHROME: CHROME, DATABASE_URL: dbUrl(DB), TEST_DATABASE_URL: '', CONTRACT_SQLTAP: tap,
      DEMO_PASSWORD: CONTRACT_PASSWORD, DEMO_STUDENT_EMAIL: 'oqil@demo.jamals.uz', DEMO_PARENT_EMAIL: 'rustam@demo.jamals.uz', ANTHROPIC_API_KEY: '',
      STAFF_EMAIL: 'ctr-staff@example.test',                                     // core-walk signs a staff member in (STAFF_USER_IDS has her)
      ...Object.fromEntries(['WALK_OUT', 'SMOKE_SHOTS', 'SHOTS', 'JG_SHOTS', 'VOICE_OUT', 'GLYPH_OUT'].map(k => [k, path.join(RUN, 'shots', name)])),
    }, path.join(RUN, `walk-${name}.log`), Number(process.env.CONTRACT_WALK_TIMEOUT_MS || 20 * 60_000))
    const r = await ctl('/__contract/end')
    // merge the walk's own database writes into the session by time, then renumber
    const file = path.join(REC, `${name}.jsonl`)
    const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
    const sqls = existsSync(tap) ? readFileSync(tap, 'utf8').split('\n').filter(Boolean).map(l => ({ type: 'sql', ...JSON.parse(l) })) : []
    const head = lines.filter(l => l.type === 'meta' || l.type === 'alias')
    const body = [...lines.filter(l => l.type === 'http' || l.type === 'page'), ...sqls].sort((a, b) => (a.at - b.at) || ((a.seq ?? 0) - (b.seq ?? 0)))
    const renum = new Map()
    body.forEach((l, i) => { if (l.type !== 'sql') renum.set(l.seq, i + 1); l.seq = i + 1 })
    const ends = lines.filter(l => l.type === 'stream-end').map(l => ({ ...l, ofSeq: renum.get(l.ofSeq) ?? l.ofSeq, afterSeq: renum.get(l.afterSeq) ?? l.afterSeq }))
    head.find(l => l.type === 'meta').walk = { name: what, exit: code, ms: Date.now() - t0, sqlWrites: sqls.length, untrackedDbWrites: untracked }
    writeFileSync(file, [...head, ...body, ...ends].map(l => JSON.stringify(l)).join('\n') + '\n')
    log(`${name}: walk exit ${code}, ${r.recorded} recorded, ${sqls.length} sql writes${untracked ? ', UNTRACKED db writes' : ''}`)
  } finally {
    node(['tools/contract/serve.mjs', 'stop'])
  }
}
