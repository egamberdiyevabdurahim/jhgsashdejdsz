// tools/contract/env.mjs — the contract runs' fixed environment: scratch database names, the dev-only auth secret, the switch
// profiles, the ports. Shared by db.mjs, serve.mjs, proxy.mjs, sweep.mjs, replay.mjs.
//
// Nothing here is a production value. CONTRACT_AUTH_SECRET is a public dev-only constant: it signs session cookies on a
// localhost dev server over a scratch database (jg_ctr_*_dev) and nowhere else. Database credentials come from the
// .env.local (DATABASE_URL user/password/host/port: this repo's, else the legacy checkout's) and are never printed.
//
// The recorder, the drivers and prove.mjs run the CURRENT TypeScript app (next dev), which lives in the legacy repo, not here:
// LEGACY is that checkout (JG_LEGACY_DIR; default: a sibling folder named "Jamals Global"). Its node_modules provide postgres,
// @auth/core, next and tsx; its src/ is the backend being recorded. Recordings, the seed and reports stay in this repo (ROOT).
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const LEGACY = path.resolve(process.env.JG_LEGACY_DIR || path.join(ROOT, '..', 'Jamals Global'))
export const RUN = path.join(ROOT, 'contract', '.run')                       // gitignored: logs, pids, media scratch
export const REC = path.join(ROOT, 'contract', 'recordings')
mkdirSync(RUN, { recursive: true }); mkdirSync(REC, { recursive: true })

export const CONTRACT_AUTH_SECRET = process.env.CONTRACT_AUTH_SECRET || 'jg-contract-dev-only-0f3c9a7e51b24d6a-not-a-production-secret'
// seeded accounts (demo family, ctr-*): the same password tests/smoke/* register their own accounts with, so a walk that signs in a
// staff account (STAFF_EMAIL=ctr-staff@example.test) or the demo family finds it. Localhost scratch databases only.
export const CONTRACT_PASSWORD = 'correct horse battery'
export const WALK_PASSWORD = CONTRACT_PASSWORD
// The server's clock in every contract run (tools/contract/clock.cjs): it starts here and runs on. 09:00 in Tashkent, Wednesday 21 Oct 2026.
export const CONTRACT_CLOCK = process.env.CONTRACT_CLOCK || '2026-10-21T04:00:00.000Z'
// The seed of the server's Math.random and crypto.randomInt (tools/contract/clock.cjs): the same questions for the same requests.
export const CONTRACT_SEED = process.env.CONTRACT_SEED || 'jg-contract-1'
export const SESSION_COOKIE = 'authjs.session-token'                          // Auth.js v5 on http (no __Secure- prefix)

export const PROXY_PORT = Number(process.env.CONTRACT_PROXY_PORT || 3460)
export const UPSTREAM_PORT = Number(process.env.CONTRACT_UPSTREAM_PORT || 3461)
export const PROXY_URL = `http://localhost:${PROXY_PORT}`

// Every scratch database this lane may create or drop matches this. Anything else is refused.
export const DB_RE = /^jg_ctr_[a-z0-9_]+_dev$/
export const SEED_DB = 'jg_ctr_seed_dev'

function envLocal() {
  for (const dir of [ROOT, LEGACY]) { try { return readFileSync(path.join(dir, '.env.local'), 'utf8') } catch {} }
  return ''
}
const get = (txt, k) => (txt.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1] || '').trim().replace(/^"|"$/g, '')

/** postgres URL for database `name` on the .env.local server (credentials reused, never printed). */
export function dbUrl(name) {
  const base = process.env.CONTRACT_PG_URL || get(envLocal(), 'DATABASE_URL')
  if (!base) throw new Error('no DATABASE_URL in .env.local (or CONTRACT_PG_URL) to take the server credentials from')
  const u = new URL(base)
  if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(u.hostname)) throw new Error('refused: the contract runs use a local Postgres only')
  if (name !== 'postgres' && !DB_RE.test(name)) throw new Error(`refused: ${name} is not a jg_ctr_*_dev scratch database`)
  u.pathname = '/' + name
  return u.href
}

/** The switch profiles a recording runs under (the target must run under the same one when it is replayed). */
export const PROFILES = {
  // nothing on: most of the surface answers 404/401
  off: {},
  // production as deployed on 20 Oct 2026 (CURRENT_STATE: release c6b7372f)
  prod: { ENGINE_LIVE: '1', PHASE_D: '1', PHASE_X: '1', AI_LAYER: '1', LESSONS: '1', WRITING: '1', SPEAKING: '1', LESSONS_PARENT: '1' },
}
PROFILES.all = {
  ...PROFILES.prod,
  LISTENING: '1', AP_PHYSICS: '1', SAT_FULL: '1', SPEAKING_VOICE: '1', VIDEO_LESSONS: '1', JIA_CARD: '1',
  MESSENGER: '1', COMMUNITY: '1', GAMES_SERVER: '1', LEAGUE: '1', MODERATION: '1', CORE_M1: '1', PARENT_M1: '1',
  PAYMENTS: '1', PAYMENTS_SANDBOX: '1', PLAN_LIMITS: '1', AI_CONSENT: '1',
}
export const SWITCH_NAMES = [...new Set(Object.values(PROFILES).flatMap(p => Object.keys(p)))].sort()

/** Rate limits raised so a replay (faster than the walk it replays) meets the same answers; limits themselves are unit-tested. */
const RATES = Object.fromEntries([
  'RATE_REGISTER_PER_IP_HOUR', 'RATE_SIGNIN_PER_IP_15MIN', 'RATE_SIGNIN_FAILS_PER_EMAIL_15MIN', 'RATE_JOIN_PER_ACCOUNT_HOUR',
  'RATE_JOIN_PER_IP_HOUR', 'RATE_ENGINE_COMMIT_PER_HOUR', 'RATE_CHECKS_PER_HOUR', 'RATE_ENGINE_WRITE_PER_HOUR',
  'RATE_ENGINE_READ_PER_HOUR', 'RATE_GAME_CREDIT_PER_HOUR', 'RATE_FAMILY_CHECK_PER_HOUR', 'RATE_AI_PREPARE_PER_2MIN',
  'RATE_AI_REACT_PER_HOUR', 'RATE_PHOTO_WRITE_PER_HOUR', 'RATE_VOICE_WRITE_PER_HOUR', 'RATE_PHOTO_READ_PER_HOUR',
  'RATE_LISTEN_READ_PER_HOUR', 'RATE_PROOF_UPLOAD_PER_HOUR', 'RATE_OUTCOME_WRITE_PER_HOUR', 'RATE_VIDEO_PER_HOUR',
  'RATE_COMMUNITY_WRITES_PER_MIN', 'RATE_COMMUNITY_UPLOADS_PER_HOUR', 'RATE_COMMUNITY_READS_PER_MIN', 'RATE_COMMUNITY_FILES_PER_HOUR',
].map(k => [k, '100000']))

/**
 * The server environment for one run: database `db`, profile `profile`, staff ids from the seed. Every external sender is
 * blanked (no Google, Telegram, Anthropic, Whisper, R2): AI_FAKE / WHISPER_FAKE serve the fakes, so nothing leaves the machine.
 */
export function serverEnv({ db, profile, staffIds = '', runDir }) {
  const sw = PROFILES[profile]
  if (!sw) throw new Error(`unknown profile ${profile}`)
  const off = Object.fromEntries(SWITCH_NAMES.map(k => [k, '']))
  return {
    ...off, ...sw, ...RATES,
    NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1',
    DATABASE_URL: dbUrl(db), TEST_DATABASE_URL: '',
    AUTH_SECRET: CONTRACT_AUTH_SECRET, AUTH_URL: PROXY_URL, AUTH_TRUST_HOST: 'true',
    AUTH_GOOGLE_ID: '', AUTH_GOOGLE_SECRET: '', AUTH_TELEGRAM_BOT_TOKEN: '', AUTH_TELEGRAM_BOT_USERNAME: 'jg_contract_bot',
    ANTHROPIC_API_KEY: '', AI_FAKE: '1', AI_RESULT_WAIT_MS: '2000',
    WHISPER_FAKE: '1', WHISPER_URL: '', WHISPER_TOKEN: '',
    JIA_LEADS_TG_TOKEN: '', JIA_LEADS_TG_CHAT_ID: '', JIA_LEADS_TG_THREAD_ID: '',
    MEDIA_STORE: '', MEDIA_DIR: path.join(runDir, 'media'), VIDEO_DIR: path.join(runDir, 'video'), MEDIA_MIN_FREE_BYTES: '1',
    STAFF_USER_IDS: staffIds,
    DEMO_PASSWORD: CONTRACT_PASSWORD, DEMO_STUDENT_EMAIL: 'oqil@demo.jamals.uz', DEMO_PARENT_EMAIL: 'rustam@demo.jamals.uz',
    PUBLIC_APP_URL: PROXY_URL, OUTCOMES_SALT: 'jg-contract-outcomes-salt',
    CLIENT_IP_HEADER: '',
    JG_QUIZ_READ_MS: '0',                                                     // the walks answer a task quiz faster than a person reads (tests/smoke/p1.ts)
    // the server's clock starts at CONTRACT_CLOCK (tools/contract/clock.cjs), so a replay on another day sees the recording's day
    CONTRACT_CLOCK, CONTRACT_SEED, NODE_OPTIONS: `--require=${path.join(ROOT, 'tools/contract/clock.cjs').split(path.sep).join('/')}`,
  }
}

export const CHROME = 'D:/tools/chs/chrome-headless-shell/win64-154.0.8037.92/chrome-headless-shell-win64/chrome-headless-shell.exe'
