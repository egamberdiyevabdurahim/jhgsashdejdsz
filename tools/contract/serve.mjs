#!/usr/bin/env node
// tools/contract/serve.mjs — the TypeScript backend (next dev) and the recording proxy, detached, PIDs in contract/.run/.
//
//   node tools/contract/serve.mjs start <profile> <db> [--no-proxy]   next dev on :3461 (env: tools/contract/env.mjs serverEnv), proxy :3460
//   node tools/contract/serve.mjs wait                                 until /api/health answers through the proxy (or 100 s)
//   node tools/contract/serve.mjs stop                                 kills both process trees by PID
//
// One dev server at a time (the machine runs other lanes): start refuses while a recorded PID is alive.
import { spawn, execFileSync } from 'node:child_process'
import { openSync, writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { ROOT, LEGACY, RUN, PROXY_PORT, UPSTREAM_PORT, PROXY_URL, serverEnv } from './env.mjs'

const PIDS = path.join(RUN, 'pids.json')
const alive = pid => { try { process.kill(pid, 0); return true } catch { return false } }
const readPids = () => (existsSync(PIDS) ? JSON.parse(readFileSync(PIDS, 'utf8')) : {})
const kill = pid => { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }) } catch {} }

const [cmd, profile, db] = process.argv.slice(2)
if (cmd === 'start') {
  const p = readPids()
  if ((p.next && alive(p.next)) || (p.proxy && alive(p.proxy))) { console.error('already running: stop first'); process.exit(3) }
  const accounts = JSON.parse(readFileSync(path.join(ROOT, 'contract/seed/accounts.json'), 'utf8'))
  const runDir = path.join(RUN, db); rmSync(runDir, { recursive: true, force: true }); mkdirSync(runDir, { recursive: true })
  const env = { ...process.env, ...serverEnv({ db, profile, staffIds: accounts['ctr-staff']?.id ?? '', runDir }) }
  const require = createRequire(path.join(LEGACY, 'package.json'))
  const nextBin = require.resolve('next/dist/bin/next')
  const log = openSync(path.join(RUN, `next-${profile}-${db}.log`), 'w')
  const next = spawn(process.execPath, [nextBin, 'dev', '-p', String(UPSTREAM_PORT)], { cwd: LEGACY, env, detached: true, stdio: ['ignore', log, log], windowsHide: true })
  next.unref()
  let proxy
  if (!process.argv.includes('--no-proxy')) {
    const plog = openSync(path.join(RUN, `proxy.log`), 'a')
    proxy = spawn(process.execPath, [path.join(ROOT, 'tools/contract/proxy.mjs')], { cwd: ROOT, detached: true, stdio: ['ignore', plog, plog], windowsHide: true })
    proxy.unref()
  }
  writeFileSync(PIDS, JSON.stringify({ next: next.pid, proxy: proxy?.pid, profile, db, startedAt: new Date().toISOString() }))
  console.log(`next dev pid ${next.pid} :${UPSTREAM_PORT} (${profile}, ${db}); proxy pid ${proxy?.pid ?? '-'} :${PROXY_PORT}`)
} else if (cmd === 'wait') {
  const until = Date.now() + 100_000, base = process.argv[3] || PROXY_URL
  for (;;) {
    try { const r = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(20_000) }); if (r.ok) { console.log('up', r.status); break } } catch {}
    if (Date.now() > until) { console.error('not up yet'); process.exit(4) }
    await new Promise(r => setTimeout(r, 2000))
  }
} else if (cmd === 'stop') {
  const p = readPids()
  for (const k of ['proxy', 'next']) if (p[k]) { kill(p[k]); console.log(`stopped ${k} ${p[k]}`) }
  rmSync(PIDS, { force: true })
} else { console.error('usage: serve.mjs start <profile> <db> | wait | stop'); process.exit(2) }
