/**
 * Golden parity fixtures for the engine port (mig-engine-golden, 21 Oct 2026).
 *
 * Every generator writes golden/engine/<module>/<fn>.jsonl: one case per line, {"id","fn","in","out"} in canonical JSON (keys sorted at
 * every depth, no spaces), and golden/engine/<module>/meta.json with the seed, the fixed clock, the head it was generated on and the count.
 * A port (backend/app/engine, Python) replays `in` through its own function and must produce `out`.
 *
 * Numbers JSON cannot hold are tagged: {"$num":"Infinity"|"-Infinity"|"NaN"|"-0"}. `undefined` is dropped from objects and written as null in
 * arrays (JSON.stringify's own rule, which the API's responses follow). A Map/Set never reaches a fixture (the generators project them first).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, resolve } from 'node:path'

/** The legacy checkout whose TypeScript engine is recorded (JG_LEGACY_DIR, else the cwd: run from there so its tsconfig maps @/ to its
 *  src/). The fixtures are written into THIS repo's golden/engine. */
export const ROOT = resolve(process.env.JG_LEGACY_DIR || process.cwd())
export const OUT = join(import.meta.dirname, '..', '..', 'golden', 'engine')
/** The fixed clock every generator runs on: the personas' day (spec 06), 12:00 Tashkent. */
export const TODAY = '2026-09-24'
export const NOW_ISO = '2026-09-24T07:00:00.000Z'
export const TZ = 'Asia/Tashkent'

/** mulberry32, the engine's own generator (src/engine/admission/math.ts rng). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
export type R = () => number
export const pick = <T>(r: R, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!
export const int = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
export const real = (r: R, lo: number, hi: number) => lo + r() * (hi - lo)

/** A value made JSON-safe with tags for the numbers JSON lacks. */
export function tag(v: unknown): unknown {
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return { $num: 'NaN' }
    if (v === Infinity) return { $num: 'Infinity' }
    if (v === -Infinity) return { $num: '-Infinity' }
    if (Object.is(v, -0)) return { $num: '-0' }
    return v
  }
  if (typeof v === 'function') return { $fn: v.name || 'anonymous' }
  if (Array.isArray(v)) return v.map(x => (x === undefined ? null : tag(x)))
  if (v && typeof v === 'object') {
    if (v instanceof Map || v instanceof Set) throw new Error('golden: project a Map/Set before writing it')
    const o: Record<string, unknown> = {}
    for (const k of Object.keys(v).sort()) { const x = (v as Record<string, unknown>)[k]; if (x !== undefined) o[k] = tag(x) }
    return o
  }
  return v
}
export const canon = (v: unknown) => JSON.stringify(tag(v))
/** The inverse of tag() for inputs: {"$num": …} back to the number, {"$undef": true} to undefined. */
export function untag(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(untag)
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>, keys = Object.keys(o)
    if (keys.length === 1 && keys[0] === '$num') return ({ NaN: NaN, Infinity: Infinity, '-Infinity': -Infinity, '-0': -0 } as Record<string, number>)[o.$num as string]
    if (keys.length === 1 && keys[0] === '$undef') return undefined
    return Object.fromEntries(keys.map(k => [k, untag(o[k])]))
  }
  return v
}

export type Case = { id: string; fn: string; in: unknown; out: unknown }
let head = ''
/** The last commit that changed what the fixtures depend on (the engine, its data, the pure server rules ported with it, the profiles):
 *  stable while those are unchanged, so regenerating on a later head leaves meta.json alone unless the engine moved. A dirty tree says so. */
export const headOf = () => (head ||= (() => {
  const paths = 'src/engine src/server/lessons/hw-plan.ts tests/unit/engine/support tests/fixtures/personas'
  const h = execSync(`git log -1 --format=%h --abbrev=8 -- ${paths}`, { cwd: ROOT }).toString().trim()
  const dirty = execSync(`git --no-optional-locks status --porcelain -- ${paths}`, { cwd: ROOT }).toString().trim()
  return dirty ? `${h}+dirty` : h
})())

/** A module's fixture set: add cases per function, then write. An exception is a case too (out = {"$throws": message}). */
export class Golden {
  private files = new Map<string, string[]>()
  constructor(public module: string, public seed: number, public note = '') {}
  /** `compute` gets the input as the port will read it (canonical JSON round trip: keys sorted, tags undone), so a function that iterates an
   *  object's keys sees the same order on both sides. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add(fn: string, id: string, input: unknown, compute: (inp: any) => unknown) {
    let out: unknown
    const inp = untag(JSON.parse(canon(input)))
    try { out = compute(inp) } catch (e) { out = { $throws: String((e as Error)?.message ?? e) } }
    const line = canon({ id, fn, in: input, out })
    const f = this.files.get(fn) ?? []; f.push(line); this.files.set(fn, f)
  }
  count() { let n = 0; for (const v of this.files.values()) n += v.length; return n }
  write() {
    const dir = join(OUT, this.module)
    mkdirSync(dir, { recursive: true })
    const counts: Record<string, number> = {}
    for (const [fn, lines] of this.files) { writeFileSync(join(dir, `${fn}.jsonl`), lines.join('\n') + '\n'); counts[fn] = lines.length }
    const meta = { module: this.module, seed: this.seed, today: TODAY, now_iso: NOW_ISO, tz: TZ, engine_head: headOf(), cases: this.count(), by_fn: counts, note: this.note,
      generator: `npx tsx tools/golden/run.ts ${this.module}` }
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(tag(meta), null, 1) + '\n')
    return this.count()
  }
}
