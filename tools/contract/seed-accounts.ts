/**
 * tools/contract/seed-accounts.ts — the contract seed's own accounts, made with the app's own createPasswordUser (the same
 * scrypt hash and profile rows /api/v1/register writes). Run by tools/contract/db.mjs seed with DATABASE_URL on the seed DB.
 * Prints one JSON line {alias: {email, id, role}} for db.mjs to keep in contract/seed/accounts.json.
 * Runs with the legacy checkout as cwd (db.mjs), so `@/…` resolves through its tsconfig paths to its src/.
 */
const { createPasswordUser, findUserByEmail } = await import('@/server/users')
const { sql } = await import('@/db/client')
const password = process.env.CONTRACT_PASSWORD ?? ''
if (password.length < 12) { console.error('CONTRACT_PASSWORD is required'); process.exit(2) }
const want = [
  { alias: 'ctr-student', email: 'ctr-student@example.test', role: 'student', firstName: 'Kamola', lastName: 'Rahimova' },
  { alias: 'ctr-student2', email: 'ctr-student2@example.test', role: 'student', firstName: 'Jasur', lastName: 'Toshmatov' },
  { alias: 'ctr-parent', email: 'ctr-parent@example.test', role: 'parent', firstName: 'Nodira', lastName: 'Rahimova' },
  { alias: 'ctr-staff', email: 'ctr-staff@example.test', role: 'parent', firstName: 'Staff', lastName: 'Contract' },
] as const
const out: Record<string, { email: string; id: string; role: string }> = {}
for (const w of want) {
  const had = await findUserByEmail(w.email)
  const id = had ? had.id : (await createPasswordUser({ email: w.email, password, role: w.role, firstName: w.firstName, lastName: w.lastName })).id
  out[w.alias] = { email: w.email, id, role: w.role }
}
for (const [alias, email] of [['demo-student', 'oqil@demo.jamals.uz'], ['demo-parent', 'rustam@demo.jamals.uz']] as const) {
  const u = await findUserByEmail(email)
  if (u) out[alias] = { email, id: u.id, role: alias === 'demo-student' ? 'student' : 'parent' }
}
console.log('ACCOUNTS ' + JSON.stringify(out))
await sql.end()
export {}
