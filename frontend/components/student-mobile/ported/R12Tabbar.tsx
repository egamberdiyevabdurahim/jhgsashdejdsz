'use client'
/*
 * PORTED from gen/R12Tabbar.tsx + public/d/student-mobile/js/005.js (the tab bar: Today · Explore · Home · Lessons · Community).
 * The five buttons and the lens's magnified copy are rendered (005.js built them after load); the liquid-glass lens (a spring, stretched by
 * its own speed), tap and drag along the bar, and the switching of the four tab views stay the design's code, in an effect, on refs.
 *
 * The tab views are other regions (R07Tabview … R11TvCommunity), not ported yet, so showView() still finds them by id. When they are, the
 * active tab becomes shared state (a context the views read: hidden={tab !== key}), and this effect keeps only the lens.
 */
import { useEffect, useRef } from 'react'
import type { RegionProps } from '../props'

const TABS = [
  { key: 'today', label: 'Today', icon: `<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.7" fill="currentColor" stroke="none"/>` },
  { key: 'explore', label: 'Explore', icon: `<circle cx="12" cy="12" r="8.6"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>`,
    h: "Find what's next", p: 'Programs, scholarships and study guides picked for your goals.' },
  { key: 'home', label: 'Home', icon: `<path d="M4 10.3L12 4l8 6.3V19a1.6 1.6 0 0 1-1.6 1.6H15v-5.6H9v5.6H5.6A1.6 1.6 0 0 1 4 19z"/>` },
  { key: 'lessons', label: 'Lessons', icon: `<rect x="3.2" y="4.8" width="17.6" height="14.4" rx="3.4"/><path d="M10.2 9.2v5.6l4.8-2.8z"/>` },
  { key: 'community', label: 'Community', icon: `<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h7.8A2.6 2.6 0 0 1 17 6.6v4.8a2.6 2.6 0 0 1-2.6 2.6H9.2L5.6 17v-3.1A2.6 2.6 0 0 1 4 11.4z"/><path d="M17 8.4h.4A2.6 2.6 0 0 1 20 11v4.9a2.6 2.6 0 0 1-1.6 2.4V21l-3-2.4h-3.2a2.6 2.6 0 0 1-2.4-1.6"/>`,
    h: 'Talk it through', p: 'Chat with classmates and mentors who are on the same path.' },
] as { key: string; label: string; icon: string; h?: string; p?: string }[]
const HOME = TABS.findIndex(t => t.key === 'home'), N = TABS.length
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
/** the design's glyph: its icon's paths as the design wrote them (static markup of the design, not user data) */
const Glyph = ({ icon }: { icon: string }) => <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />

export default function R12Tabbar(_: RegionProps) {
  const barRef = useRef<HTMLElement>(null), trackRef = useRef<HTMLDivElement>(null), lensRef = useRef<HTMLDivElement>(null), magRef = useRef<HTMLDivElement>(null)

  useEffect(() => {   // 005.js from "geometry" on, as the design wrote it
    const $ = (id: string) => document.getElementById(id)!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const bar = barRef.current!, track = trackRef.current!, lens = lensRef.current!, mag = magRef.current!, view = $('tabview')
    const glyph = (t: (typeof TABS)[number]) => `<svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>`
    const items = [...track.querySelectorAll<HTMLButtonElement>('button.tb-item')]
    let W = 0, IW = 0, LW = 0
    function measure() { W = track.clientWidth; IW = W / N; LW = IW - 4; lens.style.width = `${LW}px`; mag.style.width = `${W}px`; mag.style.height = `${track.clientHeight}px` }
    const slotX = (i: number) => i * IW + (IW - LW) / 2
    let active = HOME, x = 0, v = 0, target = 0, dragging = false, grow = 1, magS = 1, moving = false, stillFor = 0, raf = 0, last = 0
    function paint() {
      const s = Math.min(0.3, Math.abs(v) / 2600)
      lens.style.transform = `translateX(${x.toFixed(2)}px) scale(${((1 + s) * grow).toFixed(4)}, ${((1 - s * 0.45) * grow).toFixed(4)})`
      mag.style.transformOrigin = `${(x + LW / 2).toFixed(2)}px 50%`
      mag.style.transform = `translate(${(-x).toFixed(2)}px, 0) scale(${magS.toFixed(4)})`
    }
    function setMoving(on: boolean) { if (on !== moving) { moving = on; bar.classList.toggle('moving', on) } }
    function tick(now: number) {
      const dt = last ? Math.min(0.034, (now - last) / 1000) : 1 / 60
      last = now
      const K = dragging ? 900 : 420, C = dragging ? 56 : 26
      const steps = Math.ceil(dt / 0.006), h = dt / steps
      for (let k = 0; k < steps; k++) { const a = -K * (x - target) - C * v; v += a * h; x += v * h }
      const busy = dragging || Math.abs(v) > 14 || Math.abs(x - target) > 0.6
      stillFor = busy ? 0 : stillFor + dt
      if (busy) setMoving(true); else if (stillFor > 0.06) setMoving(false)
      const f = 1 - Math.pow(0.0005, dt)
      grow += ((moving ? 1.12 : 1) - grow) * f
      magS += ((moving ? 1.3 : 1) - magS) * f
      paint()
      const done = !moving && Math.abs(grow - 1) < 0.002 && Math.abs(magS - 1) < 0.002
      if (done) { x = target; v = 0; grow = 1; magS = 1; paint(); raf = 0; last = 0; return }
      raf = requestAnimationFrame(tick)
    }
    function run() { if (!raf) { last = 0; raf = requestAnimationFrame(tick) } }
    const todayView = $('tv-today'), exploreView = $('tv-explore'), lessonsView = $('tv-lessons'), communityView = $('tv-community'), viewTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()
    function hideView(el: HTMLElement) {
      if (el.hidden) return
      el.classList.remove('show'); clearTimeout(viewTimers.get(el))
      viewTimers.set(el, setTimeout(() => { el.hidden = true }, reduce ? 0 : 300))
    }
    function revealView(el: HTMLElement) { clearTimeout(viewTimers.get(el)); el.hidden = false; void el.offsetWidth; el.classList.add('show') }
    function showView(i: number) {
      const t = TABS[i]!
      const own = ({ today: todayView, explore: exploreView, lessons: lessonsView, community: communityView } as Record<string, HTMLElement>)[t.key]
      ;[todayView, exploreView, lessonsView, communityView].forEach(el => { if (el !== own) hideView(el) })
      if (t.key === 'home') { hideView(view); return }
      if (own) { hideView(view); own.scrollTop = 0; revealView(own); return }
      const fill = () => { $('tv-title').textContent = t.label; $('tv-ic').innerHTML = glyph(t); $('tv-h').textContent = t.h ?? ''; $('tv-p').textContent = t.p ?? '' }
      if (!view.hidden && view.classList.contains('show') && !reduce) {
        view.classList.remove('show'); clearTimeout(viewTimers.get(view))
        viewTimers.set(view, setTimeout(() => { fill(); view.classList.add('show') }, 160))
      } else { fill(); revealView(view) }
    }
    function select(i: number, instant?: boolean) {
      const changed = i !== active
      active = i
      items.forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current') })
      target = slotX(i)
      if (instant || reduce) { x = target; v = 0; paint() } else run()
      if (changed || instant) showView(i)
      document.querySelector('.device')!.classList.toggle('alt-tab', i !== HOME)
    }
    let drag: { id: number; x0: number; live: boolean } | null = null, eatClick = false
    const down = (e: PointerEvent) => { if (e.button !== 0 || reduce) return; drag = { id: e.pointerId, x0: e.clientX, live: false } }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (!drag.live && Math.abs(e.clientX - drag.x0) > 6) { drag.live = true; dragging = true; track.setPointerCapture(e.pointerId) }
      if (drag.live) { const r = track.getBoundingClientRect(); target = clamp(e.clientX - r.left - LW / 2, slotX(0) - 8, slotX(N - 1) + 8); run() }
    }
    const release = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.live) { dragging = false; eatClick = true; select(clamp(Math.floor((x + LW / 2) / IW), 0, N - 1)); setTimeout(() => { eatClick = false }, 0) }
      drag = null
    }
    track.addEventListener('pointerdown', down); track.addEventListener('pointermove', move)
    track.addEventListener('pointerup', release); track.addEventListener('pointercancel', release)
    const clicks = items.map((b, i) => { const f = (e: Event) => { if (eatClick) { e.preventDefault(); return } select(i) }; b.addEventListener('click', f); return f })
    const onResize = () => { measure(); x = target = slotX(active); paint() }
    measure(); select(HOME, true)
    addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf); removeEventListener('resize', onResize)
      track.removeEventListener('pointerdown', down); track.removeEventListener('pointermove', move)
      track.removeEventListener('pointerup', release); track.removeEventListener('pointercancel', release)
      items.forEach((b, i) => b.removeEventListener('click', clicks[i]!))
    }
  }, [])

  return (
    <nav className="tabbar" id="tabbar" aria-label="Main" ref={barRef}>
      {"\n    "}
      <div className="tb-glass"></div>
      {"\n    "}
      <div className="tb-track" id="tb-track" ref={trackRef}>
        {TABS.map((t, i) => <button key={t.key} className="tb-item" type="button" data-i={i} aria-current={i === HOME ? 'page' : undefined}><Glyph icon={t.icon} /><span>{t.label}</span></button>)}
        {"\n      "}
        <div className="tb-lens" id="tb-lens" aria-hidden="true" ref={lensRef}>
          {"\n        "}
          <div className="tb-fill"></div>
          {"\n        "}
          <div className="tb-mag" id="tb-mag" ref={magRef}>{TABS.map(t => <div key={t.key} className="tb-item"><Glyph icon={t.icon} /><span>{t.label}</span></div>)}</div>
          {"\n        "}
          <div className="tb-spec"></div>
          {"\n        "}
          <div className="tb-rim"></div>
          {"\n      "}
        </div>
        {"\n    "}
      </div>
      {"\n  "}
    </nav>
  )
}
