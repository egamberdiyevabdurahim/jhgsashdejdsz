import { headers } from 'next/headers'
import mobile from '@/components/student-mobile/gen/scripts.json'
import desktop from '@/components/student-desktop/gen/scripts.json'

export type StudentApp = 'student-mobile' | 'student-desktop'
/** The app middleware.ts chose for this request (pickView) */
export async function studentApp(): Promise<StudentApp> {
  return (await headers()).get('x-jg-app') === 'student-desktop' ? 'student-desktop' : 'student-mobile'
}
/** Each shell's own head (its title, icons, fonts, stylesheet) and its design scripts, as the generator read them from web/<app>/shell.html */
export const SHELL: Record<StudentApp, { title: string; links: Record<string, string | undefined>[]; scripts: string[] }> = { 'student-mobile': mobile, 'student-desktop': desktop }
/** The design scripts a React component replaced, per app: the bridge does not run them (components/<app>/ported/*) */
export const PORTED: Record<StudentApp, ReadonlySet<string>> = {
  'student-mobile': new Set(['/d/student-mobile/js/001.js', '/d/student-mobile/js/002.js', '/d/student-mobile/js/005.js']),
  'student-desktop': new Set(),
}
