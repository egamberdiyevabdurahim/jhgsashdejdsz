/**
 * Golden cases for scoring and chances: the admission model (admission/predict admissionFor via readiness.ts chanceViewOf for every
 * university in specs.json, admissionsOf, readinessOf), its inputs (inputsOf, softA, softE), the Uzbek cut model (forecast, placeChance,
 * gapOf), the list line (atLeastOne, seeded) and the scorecard / feasibility / card the pipeline also writes, on the shared profiles.
 */
import { derive, score, feasibility, playerCard, archetype, type Lang } from '@/engine'
import { chanceViewOf, admissionsOf, readinessOf } from '@/engine/readiness'
import { SPECS } from '@/engine/admission/predict'
import { inputsOf, softA, softE, eLevel } from '@/engine/admission/inputs'
import { forecast, placeChance, gapOf, programmeRows } from '@/engine/admission/uzcut'
import { atLeastOne } from '@/engine/admission/display'
import { Golden, TODAY, rng, pick, real, int } from './lib'
import { profiles, ctxOf, ctxIn, DAYS } from './pipeline'

export function chances(): Golden {
  const g = new Golden('chances', 1010, 'admission model + readiness over profiles x every specs.json university; inputs; Uzbek cut model; scorecard/feasibility/card')
  const r = rng(1010), langs: Lang[] = ['en', 'uz', 'ru'], unis = Object.keys(SPECS)
  for (const [name, A] of profiles(80)) {
    const named = !name.startsWith('random:'), today = named ? TODAY : pick(r, DAYS), lang = named ? 'en' : pick(r, langs)
    const ctx = ctxOf(today, lang), base = { answers: A, ctx: ctxIn(ctx) }
    g.add('inputsOf', name, base, i => { const D = derive(i.answers, ctx), inp = inputsOf(i.answers, D); return { inp, softA: softA(inp), softE: softE(inp), eLevel: eLevel(inp) } })
    g.add('score', name, base, i => { const D = derive(i.answers, ctx), sc = score(i.answers, D, ctx); return { derived: D, scorecard: sc, archetype: archetype(sc, i.answers), card: playerCard(i.answers, D, sc), feasibility: feasibility(i.answers, D, ctx) } })
    g.add('readinessOf', name, base, i => readinessOf(i.answers, derive(i.answers, ctx), ctx))
    g.add('admissionsOf', name, base, i => admissionsOf(i.answers, derive(i.answers, ctx), ctx))
    const some = named ? unis : unis.filter(() => r() < 0.1)
    for (const u of some) g.add('chanceViewOf', `${name}:${u}`, { ...base, uni: u }, i => chanceViewOf(i.answers, derive(i.answers, ctx), ctx, i.uni))
  }
  for (let i = 0; i < 300; i++) {
    const c = real(r, 40, 189), kind = pick(r, ['grant', 'contract'] as const), T = int(r, 0, 3)
    g.add('forecast', `${i}`, { c, kind, T }, x => forecast(x.c, x.kind, x.T))
    const mu = real(r, 30, 189), sigma = real(r, 1, 25), cut = real(r, 50, 189)
    g.add('gapOf', `${i}`, { mu, sigma, cut }, x => gapOf(x.mu, x.sigma, x.cut))
  }
  const rows = programmeRows()
  for (let i = 0; i < 300; i++) {
    const row = rows[int(r, 0, rows.length - 1)]!, mu = real(r, 40, 189), sigma = real(r, 2, 20), T = int(r, 0, 2)
    g.add('placeChance', `${i}`, { row, mu, sigma, T }, x => placeChance(x.row, x.mu, x.sigma, x.T))
  }
  for (let i = 0; i < 60; i++) {
    const ps = Array.from({ length: int(r, 1, 6) }, () => r()), seed = int(r, 0, 2 ** 31), draws = pick(r, [500, 2000])
    g.add('atLeastOne', `${i}`, { ps, seed, rho: 0.5, draws }, x => atLeastOne(x.ps, x.seed, x.rho, x.draws))
  }
  return g
}
