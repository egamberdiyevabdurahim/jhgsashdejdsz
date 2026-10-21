/**
 * Golden cases for the recompute pipeline (src/engine/pipeline.ts runPipeline: derive → score → flags → feasibility → archetype → plan →
 * narrate, first tasks, the card) and the roadmap planner over every fixture profile and synthetic ones: the six personas, the three teen
 * projects, the four readiness personas and seeded random answer maps (tests/unit/engine/support/random-answers.ts), on several days and in
 * the three roadmap languages. Rules: the seed snapshot; bank: BANK (their versions are in each case's ctx).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runPipeline, seedSnapshot, BANK, ENGINE_VERSION, type Answers, type EngineCtx, type Lang } from '@/engine'
import { randomAnswers } from '@/../tests/unit/engine/support/random-answers'
import { READY_PERSONAS } from '@/../tests/unit/engine/support/readiness-personas'
import { Golden, ROOT, TODAY, NOW_ISO, TZ, rng, pick } from './lib'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const read = (f: string): any => JSON.parse(readFileSync(join(ROOT, f), 'utf8'))
export const RULES = seedSnapshot()
export const ctxOf = (today: string, lang: Lang): EngineCtx => ({ today, tz: TZ, nowIso: today === TODAY ? NOW_ISO : `${today}T07:00:00.000Z`, rules: RULES, bank: BANK, engineVersion: ENGINE_VERSION, lang })
/** The ctx as a fixture records it: the clock and the language; rules and bank are the seed snapshot and BANK. */
export const ctxIn = (c: EngineCtx) => ({ today: c.today, tz: c.tz, nowIso: c.nowIso, lang: c.lang, engineVersion: c.engineVersion, rules: 'seedSnapshot', rules_version: (c.rules as { version?: string }).version ?? null, bank: 'BANK' })

/** Every answer map the generators share: name -> answers. */
export function profiles(randomN = 120): [string, Answers][] {
  const out: [string, Answers][] = []
  for (const p of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) out.push([`persona:${p}`, read(`tests/fixtures/personas/${p}.json`).answers])
  for (const p of ['p13', 'p15', 'p17']) { const j = read(`tests/fixtures/personas/teen/${p}.json`); out.push([`teen:${p}`, j.answers ?? j]) }
  for (const [k, v] of Object.entries(READY_PERSONAS)) out.push([`ready:${k}`, v.answers])
  for (let s = 1; s <= randomN; s++) out.push([`random:${s}`, randomAnswers(s)])
  return out
}

export const DAYS = [TODAY, '2026-10-21', '2027-02-15', '2027-08-30', '2028-05-01']

export function pipeline(): Golden {
  const g = new Golden('pipeline', 707, 'runPipeline over personas, teen projects, readiness personas and seeded random answers; several days x en/uz/ru; rules = seedSnapshot(), bank = BANK')
  const r = rng(707), langs: Lang[] = ['en', 'uz', 'ru']
  for (const [name, A] of profiles()) {
    const runs: [string, Lang][] = name.startsWith('random:') ? [[pick(r, DAYS), pick(r, langs)]] : DAYS.slice(0, 3).flatMap(d => langs.map(l => [d, l] as [string, Lang]))
    for (const [today, lang] of runs) {
      const ctx = ctxOf(today, lang), parallel = name === 'persona:P1' ? ['KR', 'TR'] : name.startsWith('random:') && r() < 0.3 ? [pick(r, ['KR', 'TR', 'DE', 'GB'])] : []
      const input = { student: A, parent: {}, parallel, prev: null, changeLog: [], profileVersion: 1, createdOn: today, parentDone: false, weekTitles: null, ctx: ctxIn(ctx) }
      g.add('runPipeline', `${name}@${today}/${lang}`, input, i => runPipeline({ ...i, ctx: undefined }, ctx))
    }
  }
  // a re-plan: the previous roadmap carried into a later day (plan(prev) keeps ids, writes the change log)
  for (const [name, A] of profiles(30).filter(([n]) => !n.startsWith('ready:'))) {
    const c1 = ctxOf(TODAY, 'en'), c2 = ctxOf('2026-12-01', 'en')
    const first = runPipeline({ student: A, parent: {}, parallel: [], prev: null, changeLog: [], profileVersion: 1, createdOn: TODAY, parentDone: false, weekTitles: null }, c1)
    const changed = { ...A, m9_hours_per_week: String((+A.m9_hours_per_week || 5) + 4) }
    const input = { student: changed, parent: {}, parallel: [], prev: first.roadmap, changeLog: first.roadmap.change_log, profileVersion: 2, createdOn: TODAY, parentDone: true, weekTitles: null, ctx: ctxIn(c2) }
    g.add('replan', name, input, i => runPipeline({ ...i, ctx: undefined }, c2))
  }
  return g
}
