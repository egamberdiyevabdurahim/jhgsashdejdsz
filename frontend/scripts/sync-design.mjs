// Refreshes this app's design files from the legacy app (repo "Jamals Global"), the same bytes, during the transition.
//
// The files are COMMITTED in this repo (frontend/public/d, frontend/public/runtime, frontend/web: taken from the legacy repo at ddbf9d81),
// so `next build` / `next dev` never need the legacy repo. Until cutover the owner's designs are still edited there (its CLAUDE.md,
// JG-PROD rule); after such a change, run this to bring the bytes over and commit them here:
//
//   JG_LEGACY_DIR="C:/Users/PC/Jamals Global" node scripts/sync-design.mjs           (default: a sibling folder named "Jamals Global")
//   ... node scripts/sync-design.mjs --prune                                           also delete files the legacy repo no longer has
//
// legacy public/d -> public/d, public/runtime -> public/runtime, web -> web (the shells html2jsx reads, the auth pages the ports follow).
// public/media is not copied: it is content (listening audio etc.) served by the backend (next.config.ts sends /media/* there).
// At cutover the legacy copy stops being the source and this script goes.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url)), app = path.resolve(here, '..'), repo = path.resolve(app, '..')
const legacy = path.resolve(process.env.JG_LEGACY_DIR || path.join(repo, '..', 'Jamals Global'))
const prune = process.argv.includes('--prune')
if (!existsSync(path.join(legacy, 'public', 'd'))) {
  console.error(`sync-design: no legacy checkout at ${legacy} (set JG_LEGACY_DIR)`)
  process.exit(2)
}

const files = (dir) => {
  const out = []
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : out.push(path.relative(dir, p)) } }
  if (existsSync(dir)) walk(dir)
  return out
}

let copied = 0, same = 0, onlyHere = 0
for (const [fromRel, toRel] of [['public/d', 'public/d'], ['public/runtime', 'public/runtime'], ['web', 'web']]) {
  const from = path.join(legacy, fromRel), to = path.join(app, toRel)
  const theirs = new Set(files(from))
  for (const rel of theirs) {
    const src = path.join(from, rel), dst = path.join(to, rel)
    if (existsSync(dst) && statSync(src).size === statSync(dst).size && readFileSync(src).equals(readFileSync(dst))) { same++; continue }
    mkdirSync(path.dirname(dst), { recursive: true })
    copyFileSync(src, dst)
    copied++
  }
  for (const rel of files(to)) {
    if (theirs.has(rel)) continue
    onlyHere++
    if (prune) rmSync(path.join(to, rel))
    else console.log(`only here (not in the legacy repo): ${toRel}/${rel.split(path.sep).join('/')}`)
  }
}
console.log(`sync-design from ${legacy}: ${copied} file(s) copied, ${same} unchanged, ${onlyHere} only here${prune ? ' (deleted)' : ''}`)
