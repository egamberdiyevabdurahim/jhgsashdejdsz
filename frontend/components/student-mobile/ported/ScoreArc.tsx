'use client'
/*
 * Home's photo and score arc: public/d/student-mobile/js/002.js, ported (mig-frontend-poc). The bubbles, the dots and the screen-reader
 * lines are rendered; the motion (auto-rotate, drag with inertia, the arrow keys, the sweep-in) stays the design's own code, in an effect,
 * on refs: a frame loop writes styles directly and never re-renders React.
 *
 * Where the bubbles stand before the first paint is the one thing a render cannot know (it needs the arc's width), and it matters to
 * the pixel: 002.js placed them while the page was parsed, and a bubble (will-change: transform) that is painted once somewhere else and
 * then moved keeps that first raster's sub-pixel phase (at 1440 px, x = 177.5: 0.010 % of the view apart; the old page with its bubbles
 * taken out and put back after a paint moved the same way). So <ArcPlacement/> is a parse-time script after the shell, as 002.js was:
 * the same placeArc() the frame loop runs, on the server-rendered bubbles, before the first paint.
 *
 * Two patches became props:
 *  - the photo (002.js wrote --photo from JG_ME.photo, jg-runtime.js face()): rendered in the style at once (`photo`).
 *  - jg-runtime.js section 9 (the teen walk of 10 Oct 2026): a live student's bubbles start as "—" with an empty ring and the lines say
 *    "not taken yet", never the design's demo numbers (`live`). 023.js syncHome then writes the student's own over them, as before.
 */
import { useEffect, useRef } from 'react'
import { placeArc } from './arc-place'

const METRICS = [
  { label: 'SAT', value: '1570', max: 1600, sub: 'of 1600' },
  { label: 'IELTS', value: '7.5', max: 9, sub: 'of 9' },
  { label: 'GPA', value: '3.9', max: 4, sub: 'of 4.0' },
  { label: 'AP avg', value: '5', max: 5, sub: 'of 5' },
]
const AUTO = 0.22
const N = METRICS.length, S = Math.max(N, 4), C = 2 * Math.PI * 48, EMPTY = C.toFixed(1)
const ease = (x: number) => 1 - Math.pow(1 - x, 3)

export default function ScoreArc({ live, photo, meFull }: { live: boolean; photo: string; meFull: string }) {
  const arcRef = useRef<HTMLDivElement>(null), dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const arc = arcRef.current!, dots = dotsRef.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let t = 0, v = 0, hover = false, raf = 0, alive = true
    let drag: { x: number; vel: number; t: number } | null = null, tween: { from: number; to: number; start: number; dur: number } | null = null

    const layout = () => placeArc(arc, dots, t)
    const goTo = (target: number, dur = 700) => { tween = { from: t, to: target, start: performance.now(), dur } }
    let last = performance.now()
    function frame(now: number) {
      if (!alive) return
      const dt = Math.min((now - last) / 1000, 0.05); last = now
      if (tween) { const k = Math.min((now - tween.start) / tween.dur, 1); t = tween.from + (tween.to - tween.from) * ease(k); if (k === 1) tween = null }
      else if (!drag) { const target = hover || reduce ? 0 : AUTO; v += (target - v) * Math.min(1, dt * 2.2); t += v * dt }
      layout()
      raf = requestAnimationFrame(frame)
    }
    const perItem = () => arc.clientWidth * 0.3
    const down = (e: PointerEvent) => { tween = null; drag = { x: e.clientX, vel: 0, t: performance.now() }; arc.classList.add('dragging'); arc.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const now = performance.now(), dx = e.clientX - drag.x, dtt = Math.max((now - drag.t) / 1000, 0.001)
      t -= dx / perItem(); drag.vel = 0.7 * drag.vel + 0.3 * (-dx / perItem() / dtt); drag.x = e.clientX; drag.t = now
    }
    const end = () => { if (!drag) return; v = Math.max(-3, Math.min(3, drag.vel)); drag = null; arc.classList.remove('dragging') }
    const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') hover = true }
    const off = () => { hover = false }, on = () => { hover = true }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.round(t) + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.round(t) - 1) }
    }
    const ev: [string, EventListener][] = [['pointerdown', down as EventListener], ['pointermove', move as EventListener], ['pointerup', end], ['pointercancel', end],
      ['pointerenter', enter as EventListener], ['pointerleave', off], ['focus', on], ['blur', off], ['keydown', key as EventListener]]
    ev.forEach(([n, f]) => arc.addEventListener(n, f))

    // start: the bubbles sweep in, then rotate slowly
    t = reduce ? 0 : -1.6
    layout()
    ;(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
      if (!alive) return
      document.body.classList.add('ready')
      if (!reduce) goTo(0, 1800)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    })
    return () => { alive = false; cancelAnimationFrame(raf); ev.forEach(([n, f]) => arc.removeEventListener(n, f)) }
  }, [])

  return (
    <>
      <div className="avatar" role="img" aria-label={`Photo of ${meFull}`} style={{ '--photo': `url("${photo}")` }}></div>
      {'\n\n    '}
      <div className="arc" id="arc" tabIndex={0} aria-label="Academic scores. Drag or use the left and right arrow keys to browse." ref={arcRef}>
        {Array.from({ length: S }, (_, i) => {
          const m = METRICS[i % N]!, ratio = Math.min(parseFloat(m.value) / m.max, 1)
          return (
            <div key={i} className="bubble" aria-hidden="true" suppressHydrationWarning style={{ '--off': live ? EMPTY : (C * (1 - ratio)).toFixed(1) }}>
              {'\n      '}
              <svg className="ring" viewBox="0 0 104 104">{'\n        '}<circle className="track" cx="52" cy="52" r="48"></circle>{'\n        '}<circle className="prog" cx="52" cy="52" r="48"></circle>{'\n      '}</svg>
              {'\n      '}
              <div className="txt"><b>{live ? '—' : m.value}</b><span data-k={m.label}>{m.label}</span><i>{m.sub}</i></div>
            </div>
          )
        })}
      </div>
      {'\n\n    '}
      <div className="dots" id="dots" aria-hidden="true" ref={dotsRef}>{METRICS.map(m => <span key={m.label} suppressHydrationWarning></span>)}</div>
      {'\n\n    '}
      <ul className="sr-only" id="sr">{METRICS.map(m => <li key={m.label} data-k={m.label}>{`${m.label}: ${live ? 'not taken yet' : m.value} ${m.sub}`}</li>)}</ul>
    </>
  )
}
