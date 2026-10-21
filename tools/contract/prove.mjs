#!/usr/bin/env node
// tools/contract/prove.mjs — replays recordings against the TypeScript backend itself, each on a FRESH copy of the seed (jg_ctr_rep_dev) and
// a FRESH dev server under the recording's own profile and clock: the proof that the recorder + normaliser + replayer are sound (0 diffs).
// A FastAPI lane does the same with its own server in place of serve.mjs (see contract/README.md).
//
//   node tools/contract/prove.mjs contract/recordings/all-sweep.jsonl [...]     (long: run in the background, poll contract/.run/prove.log)
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { ROOT, PROXY_URL } from './env.mjs'
import { readRecording } from './lib.mjs'

const files = process.argv.slice(2).filter(a => !a.startsWith('--')), pass = process.argv.slice(2).filter(a => a.startsWith('--'))   // --pace etc. go to replay.mjs
const node = (args, opts = {}) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit', ...opts })
const DB = 'jg_ctr_rep_dev'
let bad = 0
for (const f of files) {
  if (!existsSync(f)) { console.log(`== ${f}: no such recording, skipped`); continue }
  const { meta } = readRecording(f)
  console.log(`== ${path.basename(f)} (${meta.profile})`)
  node(['tools/contract/serve.mjs', 'stop'])
  node(['tools/contract/db.mjs', 'copy', DB])
  node(['tools/contract/serve.mjs', 'start', meta.profile, DB])            // through the proxy (no session open: nothing recorded), so Host is as recorded
  try {
    node(['tools/contract/serve.mjs', 'wait'])
    try { node(['tools/contract/replay.mjs', f, '--base', PROXY_URL, '--db', DB, ...pass]) } catch { bad++ }
  } finally { node(['tools/contract/serve.mjs', 'stop']) }
}
console.log(bad ? `${bad} of ${files.length} recordings differ` : `all ${files.length} recordings replay with 0 diffs`)
process.exit(bad ? 1 : 0)
