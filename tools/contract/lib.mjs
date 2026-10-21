// tools/contract/lib.mjs — shared by sweep.mjs, replay.mjs and coverage.mjs: the /api/v1 route inventory (from src/app/api/v1/**/route.ts),
// matching a recorded path to its route, minting an Auth.js session cookie for a user id, reading a recording.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'
import { LEGACY, CONTRACT_AUTH_SECRET, SESSION_COOKIE } from './env.mjs'

const require = createRequire(path.join(LEGACY, 'package.json'))
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

/** Every route file under src/app/api/v1: { route: '/api/v1/lessons/[id]', methods: ['GET'], re } */
export function routes(root = path.join(LEGACY, 'src/app/api/v1')) {
  const out = []
  const walk = d => {
    for (const n of readdirSync(d)) {
      const p = path.join(d, n)
      if (statSync(p).isDirectory()) walk(p)
      else if (n === 'route.ts') {
        const src = readFileSync(p, 'utf8')
        const m = new Set()
        for (const x of src.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE|HEAD)\b/g)) m.add(x[1])
        for (const x of src.matchAll(/export\s*\{([^}]*)\}/g)) for (const y of x[1].matchAll(/(?:\bas\s+|^|,\s*)(GET|POST|PUT|PATCH|DELETE|HEAD)\b/g)) m.add(y[1])
        for (const x of src.matchAll(/export\s+const\s*\{([^}]*)\}/g)) for (const y of x[1].matchAll(/\b(GET|POST|PUT|PATCH|DELETE|HEAD)\b/g)) m.add(y[1])
        const rel = '/api/v1/' + path.relative(root, path.dirname(p)).split(path.sep).join('/')
        const route = rel.replace(/\/$/, '')
        const re = new RegExp('^' + route.split('/').map(s => /^\[\.\.\..+\]$/.test(s) ? '.+' : /^\[.+\]$/.test(s) ? '[^/]+' : s.replace(/[.*+?^${}()|\\]/g, '\\$&')).join('/') + '/?$')
        out.push({ route, methods: METHODS.filter(x => m.has(x)), re, dyn: (route.match(/\[/g) || []).length })
      }
    }
  }
  walk(root)
  // static segments win over dynamic ones (Next's own precedence): fewer dynamic segments first, then longer
  return out.sort((a, b) => a.dyn - b.dyn || b.route.length - a.route.length)
}
export function routeOf(list, p) { return list.find(r => r.re.test(p))?.route ?? null }

let enc
/** The Auth.js v5 session cookie value for this user, signed with the contract secret (what a sign-in would have set). */
export async function mintSession({ uid, email = '', name = '' }) {
  enc ??= (await import('file://' + require.resolve('@auth/core/jwt').replace(/\\/g, '/'))).encode
  const now = Math.floor(Date.now() / 1000)
  return enc({ token: { name, email, sub: uid, uid, iat: now }, secret: CONTRACT_AUTH_SECRET, salt: SESSION_COOKIE, maxAge: 30 * 24 * 3600 })
}
export const cookieHeader = (sessionToken, rest = {}) =>
  [...(sessionToken ? [`${SESSION_COOKIE}=${sessionToken}`] : []), ...Object.entries(rest).map(([k, v]) => `${k}=${v}`)].join('; ')

/** A recording's lines: { meta, aliases: Map(alias -> {email, uid}), entries: [...http and sql in seq order] }. */
export function readRecording(file) {
  const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
  const meta = lines.find(l => l.type === 'meta')
  const aliases = new Map(lines.filter(l => l.type === 'alias').map(l => [l.alias, l]))
  const entries = lines.filter(l => l.type === 'http' || l.type === 'page' || l.type === 'sql').sort((a, b) => a.seq - b.seq)
  const streamEnds = new Map(lines.filter(l => l.type === 'stream-end').map(l => [l.ofSeq, l.afterSeq]))
  return { meta, aliases, entries, streamEnds }
}

const TEXT_MAX = 256 * 1024, B64_MAX = 2 * 1024 * 1024
/** How a body is kept in a recording (the proxy) and read back in a replay: {json} | {text} | {b64,len,sha256} | {bin:{len,sha256}} | null. */
export function bodyRecord(buf, ctype) {
  if (!buf.length) return null
  const ct = (ctype || '').toLowerCase()
  if (/json/.test(ct)) { try { return { json: JSON.parse(buf.toString('utf8')) } } catch { /* fall through */ } }
  if (/^text\/|xml|javascript|x-www-form-urlencoded/.test(ct) && buf.length <= TEXT_MAX) return { text: buf.toString('utf8') }
  const sha256 = createHash('sha256').update(buf).digest('hex')
  if (buf.length <= B64_MAX && !/^(audio|video)\//.test(ct)) return { b64: buf.toString('base64'), len: buf.length, sha256 }
  return { bin: { len: buf.length, sha256 } }
}
export const KEEP_REQ = /^(content-type|accept|accept-language|range|if-none-match|if-modified-since|origin|referer|x-.*)$/i
export const KEEP_RES = /^(content-type|cache-control|location|content-disposition|retry-after|content-range|accept-ranges|etag|vary|allow|www-authenticate|x-.*)$/i
export const pickHeaders = (h, re, base) => {
  const o = {}
  for (const [k, v] of Object.entries(h)) if (re.test(k) && v !== undefined) o[k.toLowerCase()] = typeof v === 'string' && base ? v.split(base).join('{BASE}') : v
  return o
}
/** A page as the contract keeps it: the JG_BOOT object it carries (src/server/pages.ts), its length and hash (the HTML itself is the design's). */
export function pageRecord(buf) {
  if (!buf.length) return null
  const html = buf.toString('utf8')
  const m = /<script>window\.JG_BOOT=([\s\S]*?)<\/script>/.exec(html)
  let boot = null; if (m) { try { boot = JSON.parse(m[1]) } catch { boot = { unparsed: true } } }
  return { boot, len: buf.length, sha256: createHash('sha256').update(buf).digest('hex') }
}
