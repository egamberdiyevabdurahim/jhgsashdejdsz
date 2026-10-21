// Not a client module: placeArc is shared by ScoreArc's frame loop and ArcPlacement, a server-rendered parse-time script (see ScoreArc.tsx).
/** 002.js layout(): every bubble on the ellipse at rotation t, and the centre's dot. Self-contained (it is also sent as a script). */
export function placeArc(arc: HTMLElement, dots: HTMLElement, t: number) {
  const STEP = 42, CY = 168, RY = 94, RX_K = 0.45, slots = arc.children, S = slots.length, half = S / 2, N = dots.children.length
  const mod = (n: number, m: number) => ((n % m) + m) % m
  const W = arc.clientWidth, cx = W / 2, Rx = W * RX_K
  for (let i = 0; i < S; i++) {
    const pos = mod(i - t + half, S) - half, th = pos * STEP, a = Math.abs(th), rad = th * Math.PI / 180
    const x = cx + Rx * Math.sin(rad), y = CY + RY * Math.max(Math.cos(rad), -0.2)
    const sc = 1 - 0.42 * Math.pow(Math.min(a / 84, 1), 0.9), op = a <= 58 ? 1 : Math.max(0, 1 - (a - 58) / 26)
    const s = (slots[i] as HTMLElement).style
    s.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`
    s.opacity = op.toFixed(3)
    s.zIndex = String(Math.round(100 - a))
    s.visibility = op === 0 ? 'hidden' : 'visible'
  }
  const centre = mod(Math.round(t), S) % N
  for (let i = 0; i < N; i++) dots.children[i]!.classList.toggle('on', i === centre)
}
/** The bubbles placed while the page is parsed, before its first paint, as 002.js placed them: render it after the shell. */
export function ArcPlacement() {
  const js = `(${placeArc.toString()})(document.getElementById('arc'), document.getElementById('dots'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : -1.6)`
  return <script dangerouslySetInnerHTML={{ __html: js }} />
}

