import { cookies, headers } from 'next/headers'

/** The API this front end renders from: the current app during the transition, backend/ (FastAPI) after it. Same /api/v1 contract. */
export const BACKEND = process.env.JG_BACKEND ?? 'http://localhost:3234'

/**
 * A GET to the backend as the person viewing the page: their cookies (the Auth.js session, jg_lang, jg_view) and their language header go
 * with it, so the backend answers exactly what it would answer the browser.
 */
export async function backendGet<T>(path: string): Promise<{ status: number; body: T }> {
  const c = await cookies(), h = await headers()
  const r = await fetch(`${BACKEND}${path}`, {
    cache: 'no-store',
    headers: {
      cookie: c.getAll().map(x => `${x.name}=${x.value}`).join('; '),
      'accept-language': h.get('accept-language') ?? '',
      'user-agent': h.get('user-agent') ?? '',
    },
  })
  return { status: r.status, body: (await r.json().catch(() => null)) as T }
}
