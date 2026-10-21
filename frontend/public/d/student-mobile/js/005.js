
(() => {
  "use strict";

  /* ==========================================================
     TAB BAR — Today · Explore · Home · Lessons · Community
     Green glass. The active tab sits in a glowing tile; while it
     moves (tap another tab, or press and drag along the bar) the
     tile becomes a clear liquid-glass lens that magnifies what
     it passes over, then settles and turns green again.
     ========================================================== */
  const TABS = [
    { key: "today", label: "Today",
      icon: `<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.7" fill="currentColor" stroke="none"/>` },
    { key: "explore", label: "Explore",
      icon: `<circle cx="12" cy="12" r="8.6"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>`,
      h: "Find what's next", p: "Programs, scholarships and study guides picked for your goals." },
    { key: "home", label: "Home",
      icon: `<path d="M4 10.3L12 4l8 6.3V19a1.6 1.6 0 0 1-1.6 1.6H15v-5.6H9v5.6H5.6A1.6 1.6 0 0 1 4 19z"/>` },
    { key: "lessons", label: "Lessons",
      icon: `<rect x="3.2" y="4.8" width="17.6" height="14.4" rx="3.4"/><path d="M10.2 9.2v5.6l4.8-2.8z"/>` },
    { key: "community", label: "Community",
      icon: `<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h7.8A2.6 2.6 0 0 1 17 6.6v4.8a2.6 2.6 0 0 1-2.6 2.6H9.2L5.6 17v-3.1A2.6 2.6 0 0 1 4 11.4z"/><path d="M17 8.4h.4A2.6 2.6 0 0 1 20 11v4.9a2.6 2.6 0 0 1-1.6 2.4V21l-3-2.4h-3.2a2.6 2.6 0 0 1-2.4-1.6"/>`,
      h: "Talk it through", p: "Chat with classmates and mentors who are on the same path." },
  ];
  const HOME = TABS.findIndex(t => t.key === "home"), N = TABS.length;

  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const bar = $("tabbar"), track = $("tb-track"), lens = $("tb-lens"), mag = $("tb-mag"), view = $("tabview");
  const glyph = t => `<svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>`;

  track.insertAdjacentHTML("afterbegin", TABS.map((t, i) =>
    `<button class="tb-item" type="button" data-i="${i}"${i === HOME ? ' aria-current="page"' : ""}>${glyph(t)}<span>${t.label}</span></button>`).join(""));
  mag.innerHTML = TABS.map(t => `<div class="tb-item">${glyph(t)}<span>${t.label}</span></div>`).join("");
  const items = [...track.querySelectorAll("button.tb-item")];

  /* ---------- geometry ---------- */
  let W = 0, IW = 0, LW = 0;
  function measure() {
    W = track.clientWidth; IW = W / N; LW = IW - 4;
    lens.style.width = `${LW}px`;
    mag.style.width = `${W}px`; mag.style.height = `${track.clientHeight}px`;
  }
  const slotX = i => i * IW + (IW - LW) / 2;

  /* ---------- the lens: a spring, stretched by its own speed ---------- */
  let active = HOME, x = 0, v = 0, target = 0, dragging = false;
  let grow = 1, magS = 1, moving = false, stillFor = 0, raf = 0, last = 0;

  function paint() {
    const s = Math.min(.3, Math.abs(v) / 2600);
    lens.style.transform = `translateX(${x.toFixed(2)}px) scale(${((1 + s) * grow).toFixed(4)}, ${((1 - s * .45) * grow).toFixed(4)})`;
    mag.style.transformOrigin = `${(x + LW / 2).toFixed(2)}px 50%`;
    mag.style.transform = `translate(${(-x).toFixed(2)}px, 0) scale(${magS.toFixed(4)})`;
  }
  function setMoving(on) { if (on !== moving) { moving = on; bar.classList.toggle("moving", on); } }
  function tick(now) {
    const dt = last ? Math.min(.034, (now - last) / 1000) : 1 / 60;
    last = now;
    const K = dragging ? 900 : 420, C = dragging ? 56 : 26;          // tight while dragged, liquid when released
    const steps = Math.ceil(dt / .006), h = dt / steps;
    for (let k = 0; k < steps; k++) { const a = -K * (x - target) - C * v; v += a * h; x += v * h; }
    const busy = dragging || Math.abs(v) > 14 || Math.abs(x - target) > .6;
    stillFor = busy ? 0 : stillFor + dt;
    if (busy) setMoving(true); else if (stillFor > .06) setMoving(false);
    const f = 1 - Math.pow(.0005, dt);
    grow += ((moving ? 1.12 : 1) - grow) * f;
    magS += ((moving ? 1.3 : 1) - magS) * f;
    paint();
    const done = !moving && Math.abs(grow - 1) < .002 && Math.abs(magS - 1) < .002;
    if (done) { x = target; v = 0; grow = 1; magS = 1; paint(); raf = 0; last = 0; return; }
    raf = requestAnimationFrame(tick);
  }
  function run() { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }

  /* ---------- the other tabs ---------- */
  const todayView = $("tv-today"), exploreView = $("tv-explore"), lessonsView = $("tv-lessons"), communityView = $("tv-community"), viewTimers = new Map();
  function hideView(el) {
    if (el.hidden) return;
    el.classList.remove("show");
    clearTimeout(viewTimers.get(el));
    viewTimers.set(el, setTimeout(() => { el.hidden = true; }, reduce ? 0 : 300));
  }
  function revealView(el) {
    clearTimeout(viewTimers.get(el));
    el.hidden = false; void el.offsetWidth; el.classList.add("show");
  }
  function showView(i) {
    const t = TABS[i];
    const own = { today: todayView, explore: exploreView, lessons: lessonsView, community: communityView }[t.key];
    [todayView, exploreView, lessonsView, communityView].forEach(v => { if (v !== own) hideView(v); });
    if (t.key === "home") { hideView(view); return; }
    if (own) { hideView(view); own.scrollTop = 0; revealView(own); return; }
    const fill = () => {
      $("tv-title").textContent = t.label;
      $("tv-ic").innerHTML = glyph(t);
      $("tv-h").textContent = t.h; $("tv-p").textContent = t.p;
    };
    if (!view.hidden && view.classList.contains("show") && !reduce) {       // one placeholder to another: quick crossfade
      view.classList.remove("show");
      clearTimeout(viewTimers.get(view));
      viewTimers.set(view, setTimeout(() => { fill(); view.classList.add("show"); }, 160));
    } else { fill(); revealView(view); }
  }

  function select(i, instant) {
    const changed = i !== active;
    active = i;
    items.forEach((b, k) => { if (k === i) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    target = slotX(i);
    if (instant || reduce) { x = target; v = 0; paint(); }
    else run();
    if (changed || instant) showView(i);
    document.querySelector(".device").classList.toggle("alt-tab", i !== HOME);   // wallet switches to its solid style off Home
  }

  /* ---------- tap, or press and drag along the bar ---------- */
  let drag = null, eatClick = false;
  track.addEventListener("pointerdown", e => {
    if (e.button !== 0 || reduce) return;
    drag = { id: e.pointerId, x0: e.clientX, live: false };
  });
  track.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.live && Math.abs(e.clientX - drag.x0) > 6) {
      drag.live = true; dragging = true;
      track.setPointerCapture(e.pointerId);
    }
    if (drag.live) {
      const r = track.getBoundingClientRect();
      target = clamp(e.clientX - r.left - LW / 2, slotX(0) - 8, slotX(N - 1) + 8);
      run();
    }
  });
  const release = e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.live) {
      dragging = false; eatClick = true;
      select(clamp(Math.floor((x + LW / 2) / IW), 0, N - 1));
      setTimeout(() => { eatClick = false; }, 0);
    }
    drag = null;
  };
  track.addEventListener("pointerup", release);
  track.addEventListener("pointercancel", release);
  items.forEach((b, i) => b.addEventListener("click", e => { if (eatClick) { e.preventDefault(); return; } select(i); }));

  measure(); select(HOME, true);
  window.addEventListener("resize", () => { measure(); x = target = slotX(active); paint(); });
})();
