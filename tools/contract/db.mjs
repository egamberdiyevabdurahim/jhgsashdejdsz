#!/usr/bin/env node
// tools/contract/db.mjs — the contract's scratch databases on the local Postgres (names jg_ctr_*_dev only; anything else is refused).
//
//   node tools/contract/db.mjs seed            drop + create jg_ctr_seed_dev, migrate it (scripts/migrate.mjs), seed the demo family and
//                                              the ctr-* accounts; writes contract/seed/accounts.json and contract/seed/seed.sql (pg_dump)
//   node tools/contract/db.mjs copy <name>     drop + create <name> as a byte copy of jg_ctr_seed_dev (CREATE DATABASE ... TEMPLATE)
//   node tools/contract/db.mjs restore <name>  drop + create <name> and load contract/seed/seed.sql into it (a machine without the seed DB)
//   node tools/contract/db.mjs drop <name>
//
// Credentials come from .env.local's DATABASE_URL and are never printed.
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { ROOT, LEGACY, SEED_DB, DB_RE, dbUrl, CONTRACT_PASSWORD } from './env.mjs'

const require = createRequire(path.join(LEGACY, 'package.json'))
const postgres = require('postgres')
const PGBIN = process.env.PGBIN || 'C:/Program Files/PostgreSQL/18/bin'
const SEED_DIR = path.join(ROOT, 'contract', 'seed')

async function admin(fn) {
  const sql = postgres(dbUrl('postgres'), { max: 1, onnotice: () => undefined, connect_timeout: 10 })
  try { return await fn(sql) } finally { await sql.end() }
}
async function drop(name) {
  if (!DB_RE.test(name)) throw new Error(`refused: ${name}`)
  await admin(async sql => {
    await sql`select pg_terminate_backend(pid) from pg_stat_activity where datname = ${name} and pid <> pg_backend_pid()`
    await sql.unsafe(`drop database if exists "${name}"`)
  })
}
async function create(name, template) {
  if (!DB_RE.test(name) || (template && !DB_RE.test(template))) throw new Error(`refused: ${name} / ${template}`)
  await drop(name)
  await admin(async sql => {
    if (template) await sql`select pg_terminate_backend(pid) from pg_stat_activity where datname = ${template} and pid <> pg_backend_pid()`
    await sql.unsafe(`create database "${name}"${template ? ` template "${template}"` : ''}`)
  })
}
// migrate / seed run inside the legacy checkout (its scripts/, its tsconfig paths for @/…); seed-accounts.ts is this repo's file
const run = (cmd, args, env) => execFileSync(cmd, args, { cwd: LEGACY, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', shell: process.platform === 'win32' && cmd === 'npx' })

const [cmd, name] = process.argv.slice(2)
if (cmd === 'seed') {
  await create(SEED_DB)
  const env = { DATABASE_URL: dbUrl(SEED_DB), DEMO_PASSWORD: CONTRACT_PASSWORD, CONTRACT_PASSWORD, DEMO_STUDENT_EMAIL: 'oqil@demo.jamals.uz', DEMO_PARENT_EMAIL: 'rustam@demo.jamals.uz' }
  process.stdout.write(run('node', ['scripts/migrate.mjs'], env))
  process.stdout.write(run('npx', ['tsx', 'scripts/seed-demo.ts'], env))
  const out = run('npx', ['tsx', path.join(ROOT, 'tools/contract/seed-accounts.ts')], env)
  const line = out.split(/\r?\n/).find(l => l.startsWith('ACCOUNTS '))
  if (!line) throw new Error('seed-accounts printed no ACCOUNTS line')
  mkdirSync(SEED_DIR, { recursive: true })
  writeFileSync(path.join(SEED_DIR, 'accounts.json'), JSON.stringify(JSON.parse(line.slice(9)), null, 2) + '\n')
  // the seed as plain SQL, so a FastAPI lane can rebuild the very same rows (ids included) without this machine's seed DB
  const dump = execFileSync(path.join(PGBIN, 'pg_dump.exe'), ['--no-owner', '--no-privileges', '--format=plain', '-d', dbUrl(SEED_DB)], { maxBuffer: 1 << 30, encoding: 'utf8' })
  writeFileSync(path.join(SEED_DIR, 'seed.sql'), dump.replace(/^\\restrict .*$/mg, '').replace(/^\\unrestrict .*$/mg, ''))
  console.log(`seeded ${SEED_DB}; accounts ${Object.keys(JSON.parse(line.slice(9))).join(', ')}; seed.sql ${Math.round(dump.length / 1024)} KB`)
} else if (cmd === 'copy') {
  await create(name, SEED_DB); console.log(`${name} = copy of ${SEED_DB}`)
} else if (cmd === 'restore') {
  const f = path.join(SEED_DIR, 'seed.sql'); if (!existsSync(f)) throw new Error('no contract/seed/seed.sql')
  await create(name)
  execFileSync(path.join(PGBIN, 'psql.exe'), ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '-d', dbUrl(name), '-f', f], { stdio: ['ignore', 'ignore', 'inherit'] })
  console.log(`${name} = contract/seed/seed.sql`)
} else if (cmd === 'drop') {
  await drop(name); console.log(`dropped ${name}`)
} else {
  console.error('usage: db.mjs seed | copy <name> | restore <name> | drop <name>'); process.exit(2)
}
