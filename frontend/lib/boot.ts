import { cache } from 'react'
import { redirect } from 'next/navigation'
import { backendGet } from './backend'

/** GET /api/v1/boot's answer (src/app/api/v1/boot/route.ts in the current app). */
export type HeadTag =
  | { tag: 'boot' }
  | { tag: 'script'; src?: string; defer?: boolean; text?: string }
  | { tag: 'style'; id?: string; text: string }
  | { tag: 'link'; href: string; attrs: Record<string, string> }
export type Me = { fullName: string; firstName: string; lastName: string; photoUrl: string | null; locale: string }
export type Boot = { v: 1; uid: string; role: string; me: Me; demo?: boolean; engine?: Record<string, unknown> } & Record<string, unknown>
export type BootPage = {
  app: string; boot: Boot; start: Record<string, string>; uiLang: 'uz' | 'ru' | 'en'; htmlLang: string; head: HeadTag[]
}

/** One fetch per request: the layout (the head) and the page (the body) both read it (React cache dedupes server calls in a render). */
export const bootPage = cache(async (app: string) => backendGet<BootPage | { error: string; role?: string }>(`/api/v1/boot?app=${app}`))

/** Where GET /app sent an account its boot cannot draw (src/app/app/route.ts) */
export function bootOrRedirect(r: Awaited<ReturnType<typeof bootPage>>, path: string): BootPage {
  if (r.status === 401) redirect(`/signin?next=${encodeURIComponent(path)}`)
  if (r.status === 404) redirect(`/welcome?next=${encodeURIComponent(path)}`)
  if (r.status === 409) redirect('/parent')
  if (r.status !== 200 || !r.body || 'error' in r.body) throw new Error(`boot: ${r.status}`)
  return r.body
}
