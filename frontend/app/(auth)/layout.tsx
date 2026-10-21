import type { Viewport } from 'next'
import type { ReactNode } from 'react'
import { cookies, headers } from 'next/headers'
import { htmlLang, pickLang } from '@/lib/auth-client'
import './auth.css'   // web/auth/*.html's shared <style>, byte for byte (signin, welcome, link, signout carry the same one)

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#123a29' }

/**
 * The root layout of the screens the design does not have (web/auth/*.html), drawn in its style. <html lang> starts from what the server
 * can know (the jg_lang cookie the page keeps, the browser's language), so the first paint is already in the page's language; the page then
 * reads this browser's stored choice, as auth.js did.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const lang = pickLang((await cookies()).get('jg_lang')?.value, 'student', (await headers()).get('accept-language') ?? '')
  return (
    <html lang={htmlLang(lang)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/runtime/jg-uz-marks.css?v=1" data-jg-uz-marks="" />
      </head>
      <body>{children}</body>
    </html>
  )
}
