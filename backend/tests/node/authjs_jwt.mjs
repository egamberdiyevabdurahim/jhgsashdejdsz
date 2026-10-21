// The TypeScript side of the session-cookie tests: @auth/core's own encode/decode (the code the Next.js app runs).
//   node authjs_jwt.mjs encode <salt> <json-token> [maxAge]   -> prints the JWE
//   node authjs_jwt.mjs decode <salt> <jwe>                   -> prints the payload JSON, or "null" when refused
// The secret comes from JG_TEST_AUTH_SECRET (tests use a throwaway one), never from argv, never printed.
// @auth/core is resolved from the working directory (test_jwe.py runs this in the legacy checkout, which has the node_modules).
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const require = createRequire(path.join(process.cwd(), 'package.json'))
const { encode, decode } = await import(pathToFileURL(require.resolve('@auth/core/jwt')).href)

const [cmd, salt, arg, maxAge] = process.argv.slice(2)
const secret = process.env.JG_TEST_AUTH_SECRET
if (!secret) throw new Error('JG_TEST_AUTH_SECRET is not set')
if (cmd === 'encode') {
  process.stdout.write(await encode({ token: JSON.parse(arg), secret, salt, ...(maxAge ? { maxAge: Number(maxAge) } : {}) }))
} else if (cmd === 'decode') {
  let out = null
  try { out = await decode({ token: arg, secret, salt }) } catch { out = null }
  process.stdout.write(JSON.stringify(out))
} else throw new Error('encode | decode')
