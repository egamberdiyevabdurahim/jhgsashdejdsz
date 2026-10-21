// src/server/initials.ts and jg-runtime.js face(), the same avatar: the account's photo, or its initials on forest #2b9067 (keep in step).
const escHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
export const initialsOf = (fullName: string) => fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0]!.toUpperCase()).join('')
export function initialsSvg(fullName: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#2b9067"/><text x="60" y="60" dy=".35em" text-anchor="middle" font-family="Raleway,system-ui,sans-serif" font-weight="700" font-size="46" fill="#fff">${escHtml(initialsOf(fullName))}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
export const photoOf = (me: { fullName: string; photoUrl: string | null }) => (me.photoUrl != null ? me.photoUrl : initialsSvg(me.fullName))
