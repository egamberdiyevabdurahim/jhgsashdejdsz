/**
 * Golden cases for the CAT (src/engine/cat/session.ts + report.ts): whole checks taken by seeded simulees on two synthetic banks.
 *
 * A run: newSession(skill, {stage, mu, now: 0, random: E, guard, carried, testletAvailable, pretestAvailable, first}), then nextItem/record until
 * nextItem gives null or 60 items. Two streams, both mulberry32: the ENGINE's E = rng(seed) (randomesque choice, pretest slot) and the
 * SIMULEE's S = rng(seed + 1000003): x = S() < p3(theta, item.b, item.c, 1.25) ? 1 : 0 (a testlet: the number of its 4 items right),
 * ms = item.sec * (300 + floor(S() * 900)) (a rapid answer now and then), late = ms > item.sec * 1000. A port replays the same two streams
 * and must choose the same items, then write the same catResult. The banks are the `bank` cases (one per skill).
 */
import * as cat from '@/engine/cat'
import type { CatItem, CatState, CatSkill } from '@/engine/cat'
import { Golden, rng, pick, real, int } from './lib'

const AREAS_EN = ['grammar', 'vocab', 'reading'] as const
const AREAS_MATH = ['algebra', 'advanced_math', 'psda', 'geometry_trig', 'none'] as const

export function banks(): Record<CatSkill, CatItem[]> {
  const r = rng(808), en: CatItem[] = [], math: CatItem[] = []
  cat.CENTRES.english.forEach((b0, L) => {
    for (let i = 0; i < 30; i++) en.push({ id: `e${L}_${i}`, b: b0 + 0.6 * (r() - 0.5), c: 0.25, area: AREAS_EN[i % 5 < 2 ? 0 : i % 5 < 4 ? 1 : 2]!, exposure: `e${L}_${i}`, sec: pick(r, [10, 12, 15, 20]), format: 'choice' })
    for (let i = 0; i < 3; i++) { const bs = Array.from({ length: 4 }, () => b0 + 0.8 * (r() - 0.5)); en.push({ id: `t${L}_${i}`, b: bs.reduce((x, y) => x + y, 0) / 4, bs, c: 0.25, area: 'reading', exposure: `p${L}_${i}`, sec: 240, format: 'testlet', steps: null }) }
    for (let i = 0; i < 2; i++) en.push({ id: `pe${L}_${i}`, b: b0, c: 0.25, area: 'grammar', exposure: `pe${L}_${i}`, sec: 12, format: 'choice', pretest: true })
  })
  cat.CENTRES.math.forEach((b0, L) => {
    for (let i = 0; i < 30; i++) {
      const numeric = r() < 0.4, a4 = !numeric && r() < 0.15
      math.push({ id: `${a4 ? 'a4:' : ''}m${L}_${i}`, b: b0 + 0.6 * (r() - 0.5), c: numeric ? 0 : 0.25, area: AREAS_MATH[i % 5]!, exposure: `m${L}_${i}`, sec: pick(r, [30, 45, 60, 90]), format: numeric ? 'numeric' : 'choice' })
    }
    for (let i = 0; i < 2; i++) math.push({ id: `pm${L}_${i}`, b: b0, c: 0, area: 'algebra', exposure: `pm${L}_${i}`, sec: 45, format: 'numeric', pretest: true })
  })
  return { english: en, math }
}

type RunSpec = { skill: CatSkill; seed: number; theta: number; mu: number; guard: number | null; daily: number; first: boolean; testlets: boolean; pretests: boolean }

/** One check: an onboarding run, then `daily` continuation sets carrying the earlier answers. */
export function runCheck(spec: RunSpec, bank: readonly CatItem[]) {
  const E = rng(spec.seed), S = rng(spec.seed + 1000003), sets: { trace: [string, number, number, boolean][]; result: unknown }[] = []
  let carried: cat.CatAnswer[] = []
  for (let k = 0; k <= spec.daily; k++) {
    const stage = k === 0 ? 'onboarding' : 'daily'
    const s: CatState = cat.newSession(spec.skill, { stage, mu: spec.mu, carried, now: 0, random: E, guard: spec.guard == null ? null : { expect: spec.guard }, testletAvailable: spec.testlets, pretestAvailable: spec.pretests, first: spec.first && k === 1 })
    const trace: [string, number, number, boolean][] = []
    let now = 0
    for (let n = 0; n < 60; n++) {
      const it = cat.nextItem(s, bank, now, E)
      if (!it) break
      let x: number
      if (it.format === 'testlet') { x = 0; for (const b of it.bs ?? []) if (S() < cat.p3(spec.theta, b, it.c, 1.25)) x++ }
      else x = S() < cat.p3(spec.theta, it.b, it.c, 1.25) ? 1 : 0
      const ms = it.sec * (300 + Math.floor(S() * 900)), late = ms > it.sec * 1000
      cat.record(s, it, x, ms, late, now)
      trace.push([it.id, x, ms, late])
      now += ms
    }
    s.over = true
    sets.push({ trace, result: cat.catResult(s) })
    carried = [...s.carried, ...s.log]
  }
  return sets
}

export function catSession(): Golden {
  const g = new Golden('cat_session', 808, 'whole CAT checks by seeded simulees on two synthetic banks (see tools/golden/cat.ts for the two random streams)')
  const B = banks()
  g.add('bank', 'english', {}, () => B.english)
  g.add('bank', 'math', {}, () => B.math)
  const r = rng(809)
  for (let i = 0; i < 260; i++) {
    const skill: CatSkill = i % 2 ? 'math' : 'english'
    const spec: RunSpec = { skill, seed: 1 + i * 7919, theta: real(r, -2.8, 2.8), mu: pick(r, [0, 0, real(r, -1.5, 1.5)]), guard: r() < 0.4 ? int(r, 0, cat.LEVELS[skill].length - 1) : null,
      daily: pick(r, [0, 0, 1, 2, 4]), first: r() < 0.3, testlets: skill === 'english' && r() < 0.7, pretests: r() < 0.5 }
    g.add('runCheck', `${i}`, spec, (s: RunSpec) => runCheck(s, B[s.skill]))
  }
  // the report on its own: posteriors from seeded responses, with and without SAT cells
  for (let i = 0; i < 200; i++) {
    const skill: CatSkill = i % 2 ? 'math' : 'english', rs = Array.from({ length: int(r, 0, 30) }, () => ({ kind: 'item' as const, b: real(r, -3, 3), c: pick(r, [0, 0.25]), x: r() < 0.5 ? 1 : 0 }))
    const prior = { mu: real(r, -1, 1) }, complete = r() < 0.5, cap = r() < 0.3 ? int(r, 0, 4) : null
    const satCells = skill === 'math' && r() < 0.5 ? Array.from({ length: 6 }, (_, k) => ({ domain: AREAS_MATH[k % 4]!, difficulty: pick(r, ['easy', 'medium', 'hard'] as const), b: real(r, -2, 2) })) : undefined
    g.add('reportOf', `${i}`, { skill, prior, rs, complete, cap, satCells: satCells ?? null }, inp => cat.reportOf(inp.skill, cat.posterior(inp.prior, inp.rs), { complete: inp.complete, cap: inp.cap, satCells: inp.satCells ?? undefined }))
  }
  // the scale
  for (const skill of ['english', 'math'] as CatSkill[]) for (let i = 0; i < 60; i++) {
    const o = { grade: pick(r, [null, 5, 6, 7, 8, 9, 10, 11, 12]), self: pick(r, [null, ...cat.LEVELS[skill]]), certificate: skill === 'english' ? pick(r, [null, 'B2', 'C1']) : null }
    g.add('priorMu', `${skill}${i}`, { skill, o }, inp => cat.priorMu(inp.skill, inp.o))
    g.add('practicePrior', `${skill}${i}`, { skill, o }, inp => cat.practicePrior(inp.skill, inp.o))
    g.add('expectedLevel', `${skill}${i}`, { skill, o }, inp => cat.expectedLevel(inp.skill, inp.o))
    const theta = real(r, -4, 4)
    g.add('levelIndex', `${skill}${i}`, { skill, theta }, inp => cat.levelIndex(inp.skill, inp.theta))
  }
  return g
}
