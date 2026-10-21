/**
 * Golden cases for homework planning and lesson levels: src/server/lessons/hw-plan.ts (planSet, firstTry, hwPass, hwCoins, toCorrect,
 * hwStatus, hwWords, hwCard, needsAttention; pure) and src/engine/lessons/levels.ts (applySitting chains over seeded sittings, skillLine,
 * courseLine), the DTM mock's score (lessons/dtm-mock.ts dtmScore, dtmSittingOf) and the SAT mock plan (lessons/mock.ts).
 */
import { planSet, firstTry, hwPass, hwCoins, toCorrect, hwStatus, hwWords, hwCard, needsAttention, type HwItem } from '@/server/lessons/hw-plan'
import { applySitting, skillLine, courseLine, levelDots, nextHint, NEW_SKILL, type Sitting, type SkillState } from '@/engine/lessons/levels'
import { dtmSittingOf, dtmScore } from '@/engine/lessons/dtm-mock'
import { mockSaturdays, mockKindOf, satMockResult } from '@/engine/lessons/mock'
import { addDays } from '@/engine/dates'
import { Golden, TODAY, rng, pick, int } from './lib'

export function homework(): Golden {
  const g = new Golden('homework', 1212, 'hw-plan (server, pure), lesson levels (applySitting chains), DTM mock score, SAT mock plan')
  const r = rng(1212), langs = ['en', 'uz', 'ru'] as const
  for (let i = 0; i < 300; i++) {
    const lessons = Array.from({ length: int(r, 0, 6) }, (_, k) => ({ id: `L${k}`, skill: `s${int(r, 0, 3)}`, ...(r() < 0.3 ? { testOut: true } : {}) }))
    const have = { recent: int(r, 0, 5), due: int(r, 0, 5), carried: int(r, 0, 12) }
    g.add('planSet', `${i}`, { lessons, have }, x => planSet(x.lessons, x.have))
    const items: HwItem[] = Array.from({ length: int(r, 0, 10) }, (_, k) => ({ id: `i${k}`, src: r() < 0.5 ? `C1-${k}` : null, skill: `s${int(r, 0, 3)}`, slot: pick(r, ['lesson', 'recent', 'due', 'carried'] as const),
      first_ok: pick(r, [true, false, null]), ...(r() < 0.2 ? { repeat: true as const } : {}), ...(r() < 0.2 ? { corrected_ok: pick(r, [true, false, null]) } : {}), ...(r() < 0.1 ? { review: true as const } : {}) }))
    g.add('firstTry', `${i}`, { items }, x => firstTry(x.items))
    const s = firstTry(items)
    g.add('hwPass', `${i}`, { s }, x => hwPass(x.s))
    g.add('hwCoins', `${i}`, { s, items: items.length }, x => hwCoins(x.s, x.items))
    g.add('toCorrect', `${i}`, { items }, x => toCorrect(x.items))
    const forDay = addDays(TODAY, int(r, -3, 3))
    g.add('hwStatus', `${i}`, { t: { status: 'assigned', items }, forDay, today: TODAY }, x => hwStatus(x.t, x.forDay, x.today))
    const n = int(r, 0, 25), lang = pick(r, langs)
    g.add('hwWords', `${i}`, { lang, n }, x => hwWords(x.lang, x.n))
    const rows = Array.from({ length: int(r, 0, 6) }, () => ({ status: pick(r, ['assigned', 'handed_in', 'complete', 'missing'] as const), forDay: addDays(TODAY, -int(r, 0, 9)) }))
    g.add('needsAttention', `${i}`, { rows, today: TODAY, weekAgo: addDays(TODAY, -7) }, x => needsAttention(x.rows, x.today, x.weekAgo))
  }
  // a skill's level over a run of sittings (the state carried from one to the next)
  for (let i = 0; i < 300; i++) {
    const sittings: Sitting[] = []
    let day = TODAY
    for (let k = int(r, 1, 10); k > 0; k--) {
      day = addDays(day, int(r, 0, 4))
      sittings.push({ day, kind: pick(r, ['test', 'test_out', 'homework', 'review', 'unit_test'] as const), answers: Array.from({ length: int(r, 0, 6) }, () => ({ ok: r() < 0.65, ...(r() < 0.1 ? { dontknow: true } : {}), ...(r() < 0.1 ? { repeat: true } : {}), ...(r() < 0.3 ? { mixed: true } : {}) })) })
    }
    g.add('applySittingChain', `${i}`, { sittings }, x => {
      let s: SkillState = NEW_SKILL; const out = []
      for (const st of x.sittings as Sitting[]) { const res = applySitting(s, st); out.push(res); s = res.state }
      return out
    })
  }
  for (let i = 0; i < 200; i++) {
    const res = { from: pick(r, [null, 'started', 'familiar', 'proficient', 'mastered'] as const), to: pick(r, [null, 'started', 'familiar', 'proficient', 'mastered'] as const), right: int(r, 0, 6), of: int(r, 0, 6),
      why: pick(r, ['pass', 'second_day', 'mixed', 'unit_test', 'fall', 'stay', 'start', 'none'] as const) }, lang = pick(r, langs)
    g.add('skillLine', `${i}`, { r: res, unit: 'Linear equations', lang }, x => skillLine(x.r, x.unit, x.lang))
    g.add('levelDots', `${i}`, { l: res.to }, x => levelDots(x.l))
    g.add('nextHint', `${i}`, { l: res.to, lang }, x => nextHint(x.l, x.lang))
    const c = { title: 'Algebra 1', done: int(r, 0, 20), of: int(r, 1, 20), section: r() < 0.5 ? { title: 'Equations', proficient: int(r, 0, 6), of: int(r, 1, 6) } : null }
    g.add('courseLine', `${i}`, { c, lang }, x => courseLine(x.c, x.lang))
    const moves = Array.from({ length: int(r, 0, 3) }, () => ({ ...res, unit: { en: 'Fractions', uz: 'Kasrlar', ru: 'Дроби' }, lesson: r() < 0.5 }))
    const card = { right: res.right, of: Math.max(res.of, res.right), pass: r() < 0.5, coins: pick(r, [0, 10, 20]), left: int(r, 0, 4), moves }
    g.add('hwCard', `${i}`, { i: card }, x => hwCard(x.i))
  }
  // the DTM mock and the SAT mock plan
  const tracks = ['dtm_math', 'dtm_physics', 'dtm_biology', 'dtm_chemistry', 'dtm_english', 'dtm_uz_lang_lit', 'dtm_history']
  for (let i = 0; i < 120; i++) {
    const ts = [pick(r, tracks), pick(r, tracks)], grp = pick(r, ['uz', 'ru'] as const)
    g.add('dtmSittingOf', `${i}`, { tracks: ts, group: grp }, x => dtmSittingOf(x.tracks, x.group))
    const sit = dtmSittingOf(ts, grp)
    if (sit) { const rights = sit.blocks.map(b => int(r, 0, b.questions)); g.add('dtmScore', `${i}`, { blocks: sit.blocks, rights }, x => dtmScore(x.blocks, x.rights)) }
  }
  for (let i = 0; i < 150; i++) {
    const from = addDays(TODAY, int(r, -10, 200)), due = r() < 0.2 ? null : addDays(from, int(r, -5, 120)), n = int(r, 1, 6)
    g.add('mockSaturdays', `${i}`, { from, due, n }, x => mockSaturdays(x.from, x.due, x.n))
    const inp = { today: from, sat: { bound: r() < 0.5, due }, dtm: { path: r() < 0.5, due: r() < 0.5 ? addDays(from, int(r, 0, 300)) : null, lastYear: r() < 0.3 } }
    g.add('mockKindOf', `${i}`, inp, x => mockKindOf(x))
    const sc = { rw: int(r, 20, 80) * 10, math: int(r, 20, 80) * 10 }, last = r() < 0.5 ? { rw: int(r, 20, 80) * 10, math: int(r, 20, 80) * 10 } : null
    g.add('satMockResult', `${i}`, { s: sc, last }, x => satMockResult(x.s, x.last))
  }
  return g
}
