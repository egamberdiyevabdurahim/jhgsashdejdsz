/**
 * Golden cases for the scheduler: the Phase X simulation (src/engine/schedule simulate: weekly allocation + daily composition over N weeks
 * on the code fallback strategy, the student doing every required task), the P1 week writer (tasks.ts generateWeek, two weeks), the cadence
 * (rest days, daily cap) and the DTM plan, over the shared profiles (pipeline.ts profiles) on several days and languages.
 * Each case's input is the answer map + the day + the language; the port runs the same chain (derive → score → feasibility → capacity → plan →
 * strategyInputOf → fallbackStrategy → simulate) and must give the same days.
 */
import { derive, score, archetype, capacityCheck, consistencyFlags, feasibility, plan, generateWeek, cadence, mondayOf, addDays, type Answers, type DailyTask, type EngineCtx, type Lang } from '@/engine'
import { fallbackStrategy, strategyInputOf, weekZero } from '@/engine/strategy'
import { simulate, type XTask } from '@/engine/schedule'
import { dtmPlanOf } from '@/engine/schedule/dtm'
import { Golden, TODAY, rng, pick } from './lib'
import { profiles, ctxOf, ctxIn, DAYS } from './pipeline'

function planned(a: Answers, parallel: string[], ctx: EngineCtx) {
  const D = derive(a, ctx), sc = score(a, D, ctx), fe = feasibility(a, D, ctx), cap = capacityCheck(a, D, [...D.rules_set, ...parallel], ctx)
  const { roadmap } = plan({ answers: a, derived: D, feasibility: fe, parallel, archetype: archetype(sc, a), capacity: cap, profileVersion: 1, createdOn: ctx.today, changeLog: [] }, null, ctx)
  return { answers: a, derived: D, roadmap, flags: consistencyFlags(a, {}, D, cap, ctx), feasibility: fe }
}
const task = (t: XTask) => t

export function schedule(): Golden {
  const g = new Golden('schedule', 909, 'Phase X simulate (fallback strategy, every required task done), P1 generateWeek x2, cadence, DTM plan; profiles from pipeline.ts')
  const r = rng(909), langs: Lang[] = ['en', 'uz', 'ru']
  for (const [name, A0] of profiles(60)) {
    const named = !name.startsWith('random:')
    const runs: [string, Lang][] = named ? [[TODAY, 'en'], ['2026-10-21', 'uz'], ['2027-02-15', 'ru']] : [[pick(r, DAYS), pick(r, langs)]]
    for (const [today, lang] of runs) {
      const ctx = ctxOf(today, lang), parallel = name === 'persona:P1' ? ['KR', 'TR'] : []
      const weeks = named ? 4 : 2
      g.add('simulate', `${name}@${today}/${lang}`, { answers: A0, parallel, weeks, ctx: ctxIn(ctx) }, inp => {
        const pl = planned(inp.answers, inp.parallel, ctx), si = strategyInputOf(pl.answers, pl.derived, pl.roadmap, ctx)
        const strategy = fallbackStrategy(si)
        const res = simulate({ answers: si.answers, derived: pl.derived, skeleton: pl.roadmap, strategy, week0: weekZero(ctx.today), start: ctx.today, weeks: inp.weeks, ctx })
        return { strategy, days: res.days.map(d => ({ date: d.date, done: d.done, tasks: d.tasks.map(task) })), state: res.state, fixedDone: res.fixedDone, signals: res.signals, checkpoints: res.checkpoints }
      })
      g.add('generateWeek', `${name}@${today}/${lang}`, { answers: A0, parallel, ctx: ctxIn(ctx) }, inp => {
        const pl = planned(inp.answers, inp.parallel, ctx), st = { lessons: 0, parentSent: false, parentDone: false, deepDone: [], proofs: {} }, mon = mondayOf(ctx.today)
        const w1 = generateWeek({ answers: pl.answers, derived: pl.derived, roadmap: pl.roadmap, flags: pl.flags, state: st, history: [], counters: {}, from: ctx.today, weekStart: mon }, ctx)
        const counters: Record<string, number> = {}; for (const t of w1) counters[t.template] = Math.max(counters[t.template] || 0, t.seq)
        const w2 = generateWeek({ answers: pl.answers, derived: pl.derived, roadmap: pl.roadmap, flags: pl.flags, state: st, history: w1.map((t: DailyTask) => ({ date: t.date, template: t.template })), counters, from: addDays(mon, 7), weekStart: addDays(mon, 7) }, ctx)
        return { w1, w2 }
      })
      g.add('cadence', `${name}@${today}/${lang}`, { answers: A0, parallel, ctx: ctxIn(ctx) }, inp => {
        const pl = planned(inp.answers, inp.parallel, ctx), mon = mondayOf(ctx.today)
        return [0, 7, 14, 28].map(k => cadence(pl.derived, pl.answers, addDays(mon, k), pl.roadmap))
      })
      g.add('dtmPlanOf', `${name}@${today}/${lang}`, { answers: A0, ctx: ctxIn(ctx) }, inp => dtmPlanOf(inp.answers, derive(inp.answers, ctx), ctx, lang))
    }
  }
  return g
}
