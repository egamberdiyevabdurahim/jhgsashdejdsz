/**
 * Golden cases for the content engine: family instances (content/family.ts instantiate: the practice and homework items a student sees),
 * the formula language (content/formula.ts evaluateAny) and the independent solver (content/solver.ts solve on a family's relation),
 * the text checks (content/text.ts) over real stems, and the content validator (content/validate.ts validate) per stream folder.
 * Items are named by file + id: the port reads the same JSON from src/engine/data/content.
 */
import { join } from 'node:path'
import { readCorpus } from '@/engine/content/read'
import { validate } from '@/engine/content/validate'
import { instantiate, valuesOf, drawValues, rngFor } from '@/engine/content/family'
import { fillRelation } from '@/engine/content/family-check'
import { evaluateAny, namesIn } from '@/engine/content/formula'
import { solve } from '@/engine/content/solver'
import * as T from '@/engine/content/text'
import { Golden, ROOT, rng, pick } from './lib'

const CONTENT = join(ROOT, 'src', 'engine', 'data', 'content')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any

function itemsOf(): { file: string; it: Item }[] {
  const out: { file: string; it: Item }[] = []
  for (const f of readCorpus(CONTENT).files) {
    const j = f.json as Item
    const items: Item[] = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : []
    for (const it of items) if (it && typeof it === 'object' && typeof it.id === 'string') out.push({ file: `${f.stream}/${f.name}`, it })
  }
  return out
}

export function content(): Golden {
  const g = new Golden('content', 1111, 'family instances, formula evaluation, the solver, text checks over real stems, validate() per stream; items named by file + id')
  const r = rng(1111), all = itemsOf(), fams = all.filter(x => x.it.family)
  // instances: every family item, two seeds each
  for (const { file, it } of fams) for (const seed of ['g1', `g:${it.id}`]) g.add('instantiate', `${it.id}@${seed}`, { file, id: it.id, seed }, () => instantiate(it, seed))
  // the formula language and the solver on drawn values
  for (const { file, it } of fams) {
    const f = it.family
    let v: Record<string, unknown>
    try { v = valuesOf(f, drawValues(f, rngFor(`golden:${it.id}`))) } catch { continue }
    const exprs: string[] = [f.answer, ...(f.distractors ?? []), ...(f.constraints ?? []), ...Object.values(f.derived ?? {})].filter((x: unknown) => typeof x === 'string')
    exprs.forEach((e, k) => g.add('evaluateAny', `${it.id}#${k}`, { file, id: it.id, src: e, env: v }, i => evaluateAny(i.src, i.env)))
    exprs.slice(0, 2).forEach((e, k) => g.add('namesIn', `${it.id}#${k}`, { src: e }, i => namesIn(i.src)))
    if (typeof f.relation === 'string') {
      const rel = fillRelation(f.relation, v as never)
      g.add('fillRelation', it.id, { rel: f.relation, values: v }, i => fillRelation(i.rel, i.values))
      g.add('solve', it.id, { relation: rel }, i => solve(i.relation))
    }
  }
  // the formula language's edges (JS number semantics a port must keep)
  const EDGE = ['-7 % 3', '7 % -3', '-7.5 % 2', '7 // -2', '-7 // 2', '1 / 0', '-1 / 0', '0 / 0', '5 % 0', 'fact(25)', 'fact(171)', 'fact(-1)', 'fact(2.5)', 'comb(30, 15)',
    'perm(20, 10)', 'sqrt(-1)', 'asin(2)', 'acosd(0.5)', 'atand(1)', 'sind(30)', 'cosd(60)', 'tand(45)', 'round(2.5)', 'round(-2.5)', 'round(1.005, 2)', 'round(-1.005, 2)',
    'round(0.5)', 'round(-0.5)', 'round(1234.5678, -2)', 'log(8, 2)', 'log(100)', 'log10(0)', 'ln(-1)', 'log2(1024)', 'gcd(12.4, 8)', 'gcd(0, 0)', 'lcm(4, 6)', 'lcm(0, 0)',
    '!0', '!5', '!(1/0)', '0 < a < 5', '0 < a < 2', '1 == 1 + 1e-12', '1 != 1.000001', "'a' == 'a'", "'a' == 1", "['1', 'i', '-1', '-i'][n % 4]", '[1, 2][2]', '[1, 2][0.5]',
    'a ^ 0.5', '(-8) ^ (1/3)', '2 ** 10', '-2 ^ 2', '2 ^ -1', '0 ^ 0', '1 ^ (1/0)', 'min()', 'max()', 'min(a, 0/0)', 'hypot(3, 4)', 'hypot()', 'abs(-0)', '-0', '-(0)', 'sign(-0)',
    'floor(-0.5)', 'ceil(-0.5)', 'floor(1/0)', 'cbrt(-27)', 'exp(710)', 'exp(-750)', '1e308 * 10', '0.1 + 0.2', '0.1 + 0.2 == 0.3', 'a && b', 'a || 0/0', '0 && unknown',
    'pi * 2', 'e ^ 2', 'x', 'foo(1)', '(1 + 2', '1 +', '1 2', '3 @ 4', "'unclosed", 'sqrt()', 'round()', 'v[1] + v[2]', 'v', 'v[5]']
  const ENV = { a: 3, b: 0, n: 7, v: [3, 4, 5] }
  EDGE.forEach((src, k) => g.add('evaluateAny', `edge${k}`, { src, env: ENV }, i => evaluateAny(i.src, i.env)))
  // text checks over real stems (en / uz / ru)
  const stems: string[] = []
  for (const { it } of all) for (const l of ['en', 'uz', 'ru']) { const s = it.stem?.[l]; if (typeof s === 'string' && s.trim()) stems.push(s) }
  const sample = Array.from({ length: 1200 }, () => pick(r, stems))
  sample.forEach((s, k) => {
    g.add('normalise', `${k}`, { s }, i => T.normalise(i.s))
    g.add('wordCount', `${k}`, { s }, i => T.wordCount(i.s))
    if (k % 3 === 0) g.add('grams', `${k}`, { s, n: 4 }, i => [...T.grams(i.s, i.n)].sort())
    g.add('uzApostrophes', `${k}`, { s }, i => T.uzApostrophes(i.s))
    g.add('englishWithUzbekMark', `${k}`, { s }, i => T.englishWithUzbekMark(i.s))
    g.add('strayUzQuoteMarks', `${k}`, { s }, i => T.strayUzQuoteMarks(i.s))
    g.add('uzStrayMarks', `${k}`, { s }, i => T.uzStrayMarks(i.s))
    g.add('mixedScriptWords', `${k}`, { s }, i => T.mixedScriptWords(i.s))
  })
  for (let k = 0; k < 300; k++) {
    const a = pick(r, sample), b = r() < 0.3 ? a.replace(/\w/, 'x') : pick(r, sample)
    g.add('jaccard', `${k}`, { a, b }, i => T.jaccard(T.grams(i.a), T.grams(i.b)))
  }
  for (let k = 0; k < 20; k++) { const texts = Array.from({ length: 40 }, () => pick(r, sample)); g.add('similarPairs', `${k}`, { texts, threshold: 0.7 }, i => T.similarPairs(i.texts, i.threshold)) }
  // the validator, one stream folder at a time (the corpus = that folder's files, read as readCorpus reads them)
  const corpus = readCorpus(CONTENT), streams = [...new Set(corpus.files.map(f => f.stream))]
  for (const s of streams) {
    const sub = { root: 'src/engine/data/content', files: corpus.files.filter(f => f.stream === s) }
    g.add('validate', s, { root: 'src/engine/data/content', stream: s }, () => { const rep = validate(sub); return { ...rep, findings: rep.findings, blocked: rep.blocked } })
  }
  return g
}
