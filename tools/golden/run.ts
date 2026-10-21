/**
 * Regenerate the engine's golden fixtures: `npx tsx tools/golden/run.ts [module ...]` (no argument: every module).
 * Writes golden/engine/<module>/*.jsonl + meta.json. Deterministic: the same head gives byte-identical files.
 */
import type { Golden } from './lib'

const MODULES: Record<string, () => Promise<Golden>> = {
  dates: async () => (await import('./leaf')).dates(),
  admission_math: async () => (await import('./leaf')).admissionMath(),
  admission_us: async () => (await import('./leaf')).admissionUs(),
  cat_irt: async () => (await import('./leaf')).catIrt(),
  learner_elo: async () => (await import('./leaf')).learnerElo(),
  small_rules: async () => (await import('./leaf')).smallRules(),
  pipeline: async () => (await import('./pipeline')).pipeline(),
  cat_session: async () => (await import('./cat')).catSession(),
  schedule: async () => (await import('./schedule')).schedule(),
  chances: async () => (await import('./chances')).chances(),
  content: async () => (await import('./content')).content(),
  homework: async () => (await import('./homework')).homework(),
}

const want = process.argv.slice(2)
const names = want.length ? want : Object.keys(MODULES)
let total = 0
for (const name of names) {
  const make = MODULES[name]
  if (!make) { console.error(`unknown module ${name}; known: ${Object.keys(MODULES).join(' ')}`); process.exit(2) }
  const t0 = Date.now(), g = await make(), n = g.write()
  total += n
  console.log(`${name}: ${n} cases (${Date.now() - t0} ms)`)
}
console.log(`total: ${total} cases`)
