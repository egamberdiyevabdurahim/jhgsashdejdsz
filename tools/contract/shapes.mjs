#!/usr/bin/env node
// tools/contract/shapes.mjs — the response and request SHAPES per route x method x status, inferred from every recording (a starting point
// for the FastAPI lanes' Pydantic models; the recordings stay the authority). Writes contract/shapes.json:
//   { "GET /api/v1/lessons": { "200": { "res": <shape>, "req": <shape>, "n": 3 }, "401": {...} } }
// A shape: "string" | "number" | "boolean" | "null" | ["array", <item shape>] | {key: shape} (a key seen in only some samples ends in "?"),
// alternatives joined as {"oneOf": [...]}.
import { readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, REC } from './env.mjs'
import { routes, routeOf, readRecording } from './lib.mjs'

const R = routes()
const kind = v => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
function shapeOf(v) {
  const k = kind(v)
  if (k === 'array') return ['array', v.reduce((s, x) => merge(s, shapeOf(x)), undefined) ?? 'unknown']
  if (k === 'object') return Object.fromEntries(Object.entries(v).map(([a, b]) => [a, shapeOf(b)]))
  return k
}
const skind = s => (s === undefined ? 'none' : typeof s === 'string' ? s : Array.isArray(s) ? 'array' : s.oneOf ? 'oneOf' : 'object')
function merge(a, b) {
  if (a === undefined) return b
  if (b === undefined) return a
  const ka = skind(a), kb = skind(b)
  if (ka === 'oneOf') { const i = a.oneOf.findIndex(x => skind(x) === kb); if (i < 0) return { oneOf: [...a.oneOf, b] }; const o = [...a.oneOf]; o[i] = merge(o[i], b); return { oneOf: o } }
  if (ka !== kb) return { oneOf: [a, b] }
  if (ka === 'array') return ['array', merge(a[1], b[1])]
  if (ka === 'object') {
    const out = {}
    const strip = k => k.replace(/\?$/, '')
    const keys = new Set([...Object.keys(a).map(strip), ...Object.keys(b).map(strip)])
    for (const k of keys) {
      const va = a[k] ?? a[k + '?'], vb = b[k] ?? b[k + '?']
      const optional = !(k in a) || !(k in b)
      out[optional ? k + '?' : k] = merge(va, vb)
    }
    return out
  }
  return a
}
const out = {}
for (const f of readdirSync(REC).filter(x => x.endsWith('.jsonl')).sort()) {
  for (const e of readRecording(path.join(REC, f)).entries.filter(x => x.type === 'http')) {
    const route = routeOf(R, e.path); if (!route) continue
    const k = `${e.method} ${route}`, s = String(e.status)
    const slot = ((out[k] ??= {})[s] ??= { n: 0 })
    slot.n++
    if (e.res?.json !== undefined) slot.res = merge(slot.res, shapeOf(e.res.json))
    else if (e.res) slot.resKind = Object.keys(e.res)[0]
    if (e.body?.json !== undefined) slot.req = merge(slot.req, shapeOf(e.body.json))
    if (e.query) slot.query = [...new Set([...(slot.query ?? []), ...new URLSearchParams(e.query).keys()])]
  }
}
const sorted = Object.fromEntries(Object.keys(out).sort((a, b) => a.split(' ')[1].localeCompare(b.split(' ')[1]) || a.localeCompare(b)).map(k => [k, out[k]]))
writeFileSync(path.join(ROOT, 'contract/shapes.json'), JSON.stringify(sorted, null, 1) + '\n')
console.log(`shapes for ${Object.keys(sorted).length} route x method pairs -> contract/shapes.json`)
