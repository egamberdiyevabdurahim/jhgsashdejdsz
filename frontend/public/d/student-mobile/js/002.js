
(() => {
  "use strict";

  /* ==========================================================
     1. DATA — add, remove or edit metrics here.
        The arc adapts automatically to any number of items.
        value : text shown in the bubble
        max   : used for the progress ring (value / max)
     ========================================================== */
  const METRICS = [
    { label: "SAT",    value: "1570", max: 1600, sub: "of 1600" },
    { label: "IELTS",  value: "7.5",  max: 9,    sub: "of 9"    },
    { label: "GPA",    value: "3.9",  max: 4,    sub: "of 4.0"  },
    { label: "AP avg", value: "5",    max: 5,    sub: "of 5"    },
    // { label: "Class rank", value: "3", max: 120, sub: "of 120" },
  ];

  /* ==========================================================
     2. SETTINGS
     ========================================================== */
  const STEP  = 42;      // degrees between neighbouring bubbles on the arc
  const AUTO  = 0.22;    // automatic rotation speed, in bubbles per second (slow)
  const CY    = 168;     // arc centre y = photo centre y (px)
  const RY    = 94;      // vertical radius of the arc (px)
  const RX_K  = 0.45;    // horizontal radius as a fraction of the width

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mod  = (n, m) => ((n % m) + m) % m;
  const ease = x => 1 - Math.pow(1 - x, 3);

  /* ---------- Photo ---------- */
  document.querySelector(".avatar").style.setProperty("--photo", `url("${JG_ME.photo}")`); /* JG-PROD: identity */

  /* ---------- Build bubbles ---------- */
  const arc  = document.getElementById("arc");
  const dots = document.getElementById("dots");
  const sr   = document.getElementById("sr");
  const N = METRICS.length;

  // Need at least 4 slots for the arc to look full
  const S = Math.max(N, 4);
  const half = S / 2;
  const C = 2 * Math.PI * 48;

  const slots = Array.from({ length: S }, (_, i) => {
    const m = METRICS[i % N];
    const el = document.createElement("div");
    el.className = "bubble";
    el.setAttribute("aria-hidden", "true");
    const ratio = Math.min(parseFloat(m.value) / m.max, 1);
    el.style.setProperty("--off", (C * (1 - ratio)).toFixed(1));
    el.innerHTML = `
      <svg class="ring" viewBox="0 0 104 104">
        <circle class="track" cx="52" cy="52" r="48"/>
        <circle class="prog"  cx="52" cy="52" r="48"/>
      </svg>
      <div class="txt"><b>${m.value}</b><span data-k="${m.label}">${m.label}</span><i>${m.sub}</i></div>`;   /* JG-PROD: owner 6 Oct P4h H1 review: the label's key, the design's English, in data-k, so the translator can translate the label and Home still finds its value (syncHome) */
    arc.appendChild(el);
    return { el, idx: i % N };
  });

  METRICS.forEach((m, i) => {
    const d = document.createElement("span");
    dots.appendChild(d);
    const li = document.createElement("li"); li.dataset.k = m.label;   /* JG-PROD: owner 6 Oct P4h H1 review: the screen-reader line's key, so it can be translated too (syncHome) */
    li.textContent = `${m.label}: ${m.value} ${m.sub}`;
    sr.appendChild(li);
  });

  /* ---------- Layout on the ellipse ---------- */
  let t = 0;               // rotation position, in bubbles
  let activeDot = -1;

  function layout() {
    const W  = arc.clientWidth;
    const cx = W / 2;
    const Rx = W * RX_K;

    for (let i = 0; i < S; i++) {
      const pos = mod(i - t + half, S) - half;    // slot position around the arc
      const th  = pos * STEP;                     // angle, 0 = straight below the photo
      const a   = Math.abs(th);
      const rad = th * Math.PI / 180;

      const x  = cx + Rx * Math.sin(rad);
      const y  = CY + RY * Math.max(Math.cos(rad), -0.2);
      const sc = 1 - 0.42 * Math.pow(Math.min(a / 84, 1), 0.9);
      const op = a <= 58 ? 1 : Math.max(0, 1 - (a - 58) / 26);

      const s = slots[i].el.style;
      s.transform  = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      s.opacity    = op.toFixed(3);
      s.zIndex     = Math.round(100 - a);
      s.visibility = op === 0 ? "hidden" : "visible";
    }

    const centre = slots[mod(Math.round(t), S)].idx;
    if (centre !== activeDot) {
      [...dots.children].forEach((d, i) => d.classList.toggle("on", i === centre));
      activeDot = centre;
    }
  }

  /* ---------- Motion: auto-rotate, drag with inertia, keyboard ---------- */
  let v = 0;                 // current speed (bubbles / s)
  let hover = false;
  let drag = null;
  let tween = null;          // { from, to, start, dur }

  function goTo(target, dur = 700) {
    tween = { from: t, to: target, start: performance.now(), dur };
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (tween) {
      const k = Math.min((now - tween.start) / tween.dur, 1);
      t = tween.from + (tween.to - tween.from) * ease(k);
      if (k === 1) tween = null;
    } else if (!drag) {
      const target = (hover || reduce) ? 0 : AUTO;
      v += (target - v) * Math.min(1, dt * 2.2);   // glide back to the slow auto speed
      t += v * dt;
    }
    layout();
    requestAnimationFrame(frame);
  }

  const perItem = () => arc.clientWidth * 0.3;     // pixels of finger travel per bubble

  arc.addEventListener("pointerdown", e => {
    tween = null;
    drag = { x: e.clientX, vel: 0, t: performance.now() };
    arc.classList.add("dragging");
    arc.setPointerCapture(e.pointerId);
  });
  arc.addEventListener("pointermove", e => {
    if (!drag) return;
    const now = performance.now();
    const dx = e.clientX - drag.x;
    const dtt = Math.max((now - drag.t) / 1000, 0.001);
    t -= dx / perItem();
    drag.vel = 0.7 * drag.vel + 0.3 * (-dx / perItem() / dtt);
    drag.x = e.clientX; drag.t = now;
  });
  const endDrag = () => {
    if (!drag) return;
    v = Math.max(-3, Math.min(3, drag.vel));
    drag = null;
    arc.classList.remove("dragging");
  };
  arc.addEventListener("pointerup", endDrag);
  arc.addEventListener("pointercancel", endDrag);

  arc.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; });
  arc.addEventListener("pointerleave", () => { hover = false; });
  arc.addEventListener("focus", () => { hover = true; });
  arc.addEventListener("blur",  () => { hover = false; });

  arc.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.round(t) + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(Math.round(t) - 1); }
  });

  /* ---------- Start: bubbles sweep in, then rotate slowly ---------- */
  t = reduce ? 0 : -1.6;
  layout();
  const start = () => {
    document.body.classList.add("ready");
    if (!reduce) goTo(0, 1800);
    last = performance.now();
    requestAnimationFrame(frame);
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
