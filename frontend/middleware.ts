import { NextResponse, type NextRequest } from 'next/server'

/**
 * /app draws the phone app or the laptop app, chosen as src/server/pages.ts pickView chooses: ?view=, the jg_view cookie, the user
 * agent; a ?view= that names the view drawn is remembered in the cookie for a year, as GET /app does (htmlResponse). The choice goes to
 * the page as the request header x-jg-app (student-mobile | student-desktop).
 */
export function middleware(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('view')
  const view = q === 'mobile' || q === 'desktop' ? q
    : (req.cookies.get('jg_view')?.value as 'mobile' | 'desktop' | undefined) ?? (/Mobi|Android|iPhone|iPod/i.test(req.headers.get('user-agent') ?? '') ? 'mobile' : 'desktop')
  const headers = new Headers(req.headers)
  headers.set('x-jg-app', view === 'mobile' ? 'student-mobile' : 'student-desktop')
  const res = NextResponse.next({ request: { headers } })
  if (q === view) res.cookies.set('jg_view', view, { path: '/', maxAge: 31536000, sameSite: 'lax' })
  return res
}
export const config = { matcher: ['/app'] }
