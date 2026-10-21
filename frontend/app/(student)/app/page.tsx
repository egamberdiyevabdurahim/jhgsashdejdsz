import { bootPage, bootOrRedirect } from '@/lib/boot'
import { photoOf } from '@/lib/initials'
import LegacyRuntime from '@/lib/legacy'
import MobileShell from '@/components/student-mobile/gen/Shell'
import DesktopShell from '@/components/student-desktop/gen/Shell'
import { shellProps } from '@/components/student-mobile/props'
import { ArcPlacement } from '@/components/student-mobile/ported/arc-place'
import { PORTED, SHELL, studentApp } from '../apps'

/**
 * The student's app (web/student-<view>/shell.html + public/d/student-<view>), in React. The body is the shell's markup as components
 * (components/<app>/gen, ported/), filled from GET /api/v1/boot; the design's scripts not ported yet run after hydration through the
 * legacy bridge (lib/legacy.tsx). Which app: middleware.ts (pickView).
 */
export default async function StudentApp() {
  const app = await studentApp()
  const d = bootOrRedirect(await bootPage(app), '/app')
  const Shell = app === 'student-mobile' ? MobileShell : DesktopShell
  return (
    <>
      <Shell p={shellProps(d, photoOf(d.boot.me))} />
      {app === 'student-mobile' && <ArcPlacement />}{/* parse-time, where 002.js ran: the score bubbles placed before the first paint */}
      <LegacyRuntime boot={d.boot} head={d.head} body={SHELL[app].scripts.filter(s => !PORTED[app].has(s))} />
    </>
  )
}
