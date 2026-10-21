'use client'
/*
 * The legacy bridge (mig-frontend-poc). React renders the design's markup; the design's own scripts (public/d/<app>/js/*.js) and the
 * runtime patches (public/runtime/*.js) that are not ported yet then run on that DOM, once, in the order the old page ran them:
 *
 *   1. the head's scripts that were not deferred (jg-journal, jg-runtime, jg-checks, jg-i18n, …), window.JG_BOOT set where its inline script stood
 *   2. the body's design scripts (000.js … 023.js, the chess library), minus the ones a React component replaced
 *   3. the head's deferred scripts, in order
 *   4. DOMContentLoaded on document, load on window: the old scripts that wait for them run then
 *
 * While 1–3 run, document.readyState reads "loading", as it did while the old page was being parsed, so a script that asks
 * ("loading" ? wait for DOMContentLoaded : go now) takes the same branch it took before. The styles and links of the head are not
 * here: the server renders them in <head>, in their place, so the first paint already has them.
 *
 * React must not re-render what these scripts change: the generated regions are server components (no state), and a ported
 * client component writes the parts the scripts also write (the score bubbles) only once, then through refs.
 * Each screen ported removes its script from the list (PORTED in app/(student)/app/page.tsx); when the list is empty, this file goes.
 */
import { useEffect } from 'react'
import type { Boot, HeadTag } from './boot'

declare global { interface Window { JG_BOOT?: Boot; __jgLegacy?: boolean } }

function run(t: { src?: string; text?: string }, where: HTMLElement) {
  return new Promise<void>(ok => {
    const s = document.createElement('script')
    if (t.src) { s.src = t.src; s.async = false; s.onload = s.onerror = () => ok() } else s.text = t.text ?? ''
    where.appendChild(s)
    if (!t.src) ok()
  })
}

export default function LegacyRuntime({ boot, head, body }: { boot: Boot; head: HeadTag[]; body: string[] }) {
  useEffect(() => {
    if (window.__jgLegacy) return          // once per page load (a client re-render or a dev double effect must not run the design twice)
    window.__jgLegacy = true
    const d = document
    Object.defineProperty(d, 'readyState', { configurable: true, get: () => 'loading' })
    ;(async () => {
      const deferred: HeadTag[] = []
      try {
        for (const t of head) {
          if (t.tag === 'boot') window.JG_BOOT = boot
          else if (t.tag === 'script') { if (t.defer) deferred.push(t); else await run(t, d.head) }
        }
        for (const src of body) await run({ src }, d.body)
        for (const t of deferred) if (t.tag === 'script') await run(t, d.head)
      } finally {
        delete (d as unknown as { readyState?: string }).readyState   // the prototype's getter again: "complete"
        d.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }))
        window.dispatchEvent(new Event('load'))
        d.documentElement.setAttribute('data-jg-legacy', 'ready')       // for tests: every old script ran
      }
    })()
  }, [boot, head, body])
  return null
}
