import type { Viewport } from 'next'
import type { ReactNode } from 'react'
import { bootPage, bootOrRedirect } from '@/lib/boot'
import { SHELL, studentApp } from './apps'

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

/**
 * The student app's document: <html lang> as GET /app writes it, then the head in the shell's order: the runtime's styles and links
 * (renderPage's <!--JG_BOOT--> slot, styles in place so the first paint has them; its scripts run in the legacy bridge), the shell's
 * title, then its own links (icons, the fonts, the design's one stylesheet: the same files).
 */
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const app = await studentApp(), shell = SHELL[app]
  const d = bootOrRedirect(await bootPage(app), '/app')
  return (
    <html lang={d.htmlLang}>
      <head>
        {d.head.map((t, i) =>
          t.tag === 'style' ? <style key={i} {...(t.id ? { id: t.id } : {})} dangerouslySetInnerHTML={{ __html: t.text }} />
            : t.tag === 'link' ? <link key={i} {...Object.fromEntries(Object.entries(t.attrs).map(([k, v]) => [k === 'crossorigin' ? 'crossOrigin' : k, v]))} />
              : null)}
        <title>{shell.title.replace('{{ME_FULL}}', d.boot.me.fullName)}</title>
        {shell.links.map((l, i) => <link key={`s${i}`} {...l} />)}
      </head>
      <body>{children}</body>
    </html>
  )
}
