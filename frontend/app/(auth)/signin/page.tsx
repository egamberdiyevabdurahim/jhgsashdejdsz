import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { backendGet } from '@/lib/backend'
import { pickLang, safeNext } from '@/lib/auth-client'
import { STR } from './strings'
import SignIn from './SignIn'

type Sp = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

async function firstLang(role: string) {
  return pickLang((await cookies()).get('jg_lang')?.value, role, (await headers()).get('accept-language') ?? '')
}

export async function generateMetadata({ searchParams }: { searchParams: Sp }): Promise<Metadata> {
  const role = one((await searchParams).role) === 'parent' ? 'parent' : 'student'
  return { title: STR[await firstLang(role)].docTitle }
}

/**
 * The sign-in / create-account screen (web/auth/signin.html + public/runtime/auth.js), in React. Also served at /signin/telegram, where
 * Telegram sends the browser back with #tgAuthResult=… for the page to post. What GET /signin filled in ({{NEXT}}, {{ROLE}}, {{GOOGLE}},
 * {{TELEGRAM}}, {{TELEGRAM_URL}}) comes from GET /api/v1/boot/signin.
 */
export default async function SignInPage({ searchParams }: { searchParams: Sp }) {
  const sp = await searchParams
  const role = one(sp.role) === 'parent' ? 'parent' : 'student'
  const { body } = await backendGet<{ signedIn: boolean; next: string; google: boolean; telegramUrl: string }>(
    `/api/v1/boot/signin?next=${encodeURIComponent(one(sp.next) ?? '')}`)
  const next = safeNext(body?.next ?? one(sp.next))
  if (body?.signedIn) redirect(next)
  return <SignIn next={next} role={role} roleAsked={sp.role !== undefined} google={!!body?.google} telegramUrl={body?.telegramUrl ?? ''} firstLang={await firstLang(role)} />
}
