
/* ==========================================================
   TODAY — ported from the phone, unchanged in spirit
   ========================================================== */
(() => {
  "use strict";

  /* ==========================================================
     TODAY: THE CHAINED MIT DOME
     MIT's Great Dome, in its own limestone, fills with golden light
     from the ground up as today's tasks are done:
       SAT → lower floors   AP → upper floors and colonnade
       CAC → the MIT attic and the drum   IELTS → the dome
     It stays chained until 100%. Then the lock opens, the chains
     fall, the Dome shines, pays out coins, and a sealed letter comes
     out through its doors and opens as an old letter.
     Start state: data-progress, data-coins and data-reward on
     <section id="world">; study day and program length on <main>.
     ========================================================== */
  const TASKS = ["SAT", "AP", "CAC", "IELTS"];                 // fill order, ground to dome

  const LETTERS = [                                             // one opens when the Dome is unlocked, by study day
    "Every hour you give today comes back to you here, under the Dome. I know, because I'm standing in it.",
    "The practice set you almost skipped is the one I'm most grateful for. Keep showing up.",
    "Your essays will only sound like you if you keep rewriting them. One more draft.",
    "Some days will feel slow. None of them are wasted. Trust the climb.",
    "One day you'll walk through these doors. Today you walked a little closer.",
  ];
  const GREETING_NAME = JG_ME.firstName; /* JG-PROD: identity */
  const SIGNATURE = "O.", SIGNED_FROM = "Cambridge, Massachusetts";   // the sender stays a mystery

  const { $ } = window.JIA;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seeded = s => () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const card = $("world"), svg = $("wd-svg");
  const N = TASKS.length, SPAN = 100 / N; let TN = N, TS = SPAN;   /* JG-PROD: P4d re-walk F2, a real student's Dome has today's tasks as its tiles (4 on a study day, 2 on a rest day; JIA_today.count); the light still climbs the four floors by the share done */
  const INIT = {
    progress: clamp(+card.dataset.progress || 0, 0, 100),
    coins: parseInt(card.dataset.coins, 10) || 0,
    reward: card.dataset.reward === "0" ? 0 : parseInt(card.dataset.reward, 10) || 40,   /* JG-PROD: P4d re-walk F2, a rest day pays no day reward (the server's day_complete is 0 on a rest day) */
  };
  let REWARD = INIT.reward;   /* JG-PROD: owner 10 Oct (delegated call, teen walk), the day's reward can be told again (JIA_today.rest below): the 13-year-old's first day was drawn before today's tasks existed, showed +40, flew it at 100 % and the server, for whom that day was a rest day, never paid it */

  /* ---------- the building: a 3D model of the Great Dome (generated for JIA, same style as the app's
     3D objects), asleep in stone; it turns to gold from the pedestal up ---------- */
  const STONE = "/d/student-desktop/media/b2574f9dcd06d49f.webp";
  const GOLD = "/d/student-desktop/media/90a3444923c66d38.webp";
  const photo = src => `<image href="${src}" x="44" y="14" width="252" height="200" preserveAspectRatio="xMidYMax meet"/>`;

  /* ---------- chains: links laid along a curve ---------- */
  const LOCK = [170, 171], DOOR = [170, 180];
  const CHAINS = [
    { p0: [20, 127], c: [170, 178], p1: [320, 203], s: 7 },
    { p0: [320, 127], c: [170, 178], p1: [20, 203], s: 7 },
    { p0: [124, 86.5], c: [170, 97.5], p1: [216, 86.5], s: 5.2 },
  ];
  const chainLinks = (ch, seed) => {
    const rnd = seeded(seed), q = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
    const pts = []; let L = 0, prev = null;
    for (let i = 0; i <= 300; i++) {
      const t = i / 300, p = [q(ch.p0[0], ch.c[0], ch.p1[0], t), q(ch.p0[1], ch.c[1], ch.p1[1], t)];
      if (prev) L += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      pts.push([L, p]); prev = p;
    }
    const step = ch.s * .78; let out = "", k = 0;
    for (let d = step / 2; d < L; d += step, k++) {
      const j = Math.max(1, Math.min(pts.length - 2, pts.findIndex(p => p[0] >= d)));
      const [x, y] = pts[j][1], a = pts[j - 1][1], b = pts[j + 1][1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      const face = k % 2 === 0, w = ch.s, h = face ? ch.s * .62 : ch.s * .24;
      const shape = face
        ? `<rect x="${(-w / 2).toFixed(2)}" y="${(-h / 2).toFixed(2)}" width="${w}" height="${h.toFixed(2)}" rx="${(h / 2).toFixed(2)}" fill="none" stroke="url(#ch-steel)" stroke-width="${(ch.s * .19).toFixed(2)}"/>`
        : `<rect x="${(-w / 2).toFixed(2)}" y="${(-h / 2).toFixed(2)}" width="${w}" height="${h.toFixed(2)}" rx="${(h / 2).toFixed(2)}" fill="url(#ch-steel2)"/>`;
      const dist = Math.hypot(x - LOCK[0], y - LOCK[1]);
      out += `<g class="ch-link" style="--dx:${((x - LOCK[0]) * .16 + (rnd() - .5) * 26).toFixed(1)}px;--dy:${(40 + rnd() * 45).toFixed(1)}px;--rot:${((rnd() - .5) * 320).toFixed(0)}deg;--d:${(dist * 1.5 + rnd() * 70).toFixed(0)}ms">` +
             `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(1)})">${shape}</g></g>`;
    }
    return out;
  };
  const SIL = `<rect x="58" y="99" width="224" height="108"/><rect x="88" y="62" width="163" height="38"/>
        <path d="M92 66C92 36 130 20 170 20C210 20 247 36 247 66Z"/><rect x="164" y="13" width="12" height="9"/>`;

  svg.innerHTML = `
    <defs>
      <radialGradient id="wd-bg" cx="170" cy="120" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbf8f1"/><stop offset="1" stop-color="#ffffff"/></radialGradient>
      <radialGradient id="wd-haloG"><stop offset="0" stop-color="#f3c35c" stop-opacity=".55"/><stop offset=".45" stop-color="#f3c35c" stop-opacity=".16"/><stop offset="1" stop-color="#f3c35c" stop-opacity="0"/></radialGradient>
      <linearGradient id="wd-beamG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f0bf52" stop-opacity=".7"/><stop offset="1" stop-color="#f0bf52" stop-opacity="0"/></linearGradient>
      <radialGradient id="wd-shadowG"><stop offset="0" stop-color="#3a3325" stop-opacity=".22"/><stop offset="1" stop-color="#3a3325" stop-opacity="0"/></radialGradient>
      <linearGradient id="wd-fac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1ede4"/><stop offset="1" stop-color="#ddd6c7"/></linearGradient>
      <linearGradient id="wdL-fac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c49347"/><stop offset=".55" stop-color="#dcb066"/><stop offset="1" stop-color="#eecb88"/></linearGradient>
      <linearGradient id="wd-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fcfbf7"/><stop offset=".45" stop-color="#e4ded1"/><stop offset="1" stop-color="#b6ad9a"/></linearGradient>
      <linearGradient id="wd-colLit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff4d2"/><stop offset=".42" stop-color="#f0c465"/><stop offset="1" stop-color="#9c6d22"/></linearGradient>
      <radialGradient id="wd-dome" cx=".36" cy=".3" r=".82"><stop offset="0" stop-color="#f7f8f6"/><stop offset=".55" stop-color="#d5d9d6"/><stop offset="1" stop-color="#a8adaa"/></radialGradient>
      <radialGradient id="wd-domeLit" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff5d8"/><stop offset=".5" stop-color="#efc46c"/><stop offset="1" stop-color="#a97a2c"/></radialGradient>
      <radialGradient id="wd-doorG"><stop offset="0" stop-color="#fff3cf" stop-opacity=".95"/><stop offset=".5" stop-color="#f3c35c" stop-opacity=".45"/><stop offset="1" stop-color="#f3c35c" stop-opacity="0"/></radialGradient>
      <radialGradient id="wd-shineG" cx="170" cy="120" r="170" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6de" stop-opacity=".6"/><stop offset="1" stop-color="#fff6de" stop-opacity="0"/></radialGradient>
      <linearGradient id="wd-sweepG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d6" stop-opacity="0"/><stop offset=".5" stop-color="#fff4d6" stop-opacity=".75"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></linearGradient>
      <linearGradient id="ch-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9edf1"/><stop offset=".35" stop-color="#a9b3be"/><stop offset=".7" stop-color="#5f6a76"/><stop offset="1" stop-color="#343c46"/></linearGradient>
      <linearGradient id="ch-steel2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdd4db"/><stop offset="1" stop-color="#4c5661"/></linearGradient>
      <linearGradient id="lk-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe697"/><stop offset=".5" stop-color="#e2a832"/><stop offset="1" stop-color="#976214"/></linearGradient>
      <linearGradient id="wd-fadeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".7" stop-color="#ffffff" stop-opacity=".92"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
      <clipPath id="wd-cBld">${SIL}</clipPath>
      <mask id="wd-mBld" maskUnits="userSpaceOnUse" x="0" y="0" width="340" height="226" style="mask-type:alpha">${photo(STONE)}</mask>
      <clipPath id="wd-cFill"><path id="wd-fillP" d="M0 0Z"/></clipPath>
    </defs>


    <circle id="wd-halo" cx="170" cy="96" r="150" fill="url(#wd-haloG)" opacity="0"/>
    <path id="wd-beam" d="M168.4 19L171.6 19L178 -2L162 -2Z" fill="url(#wd-beamG)"/>
    <ellipse cx="170" cy="215" rx="176" ry="9" fill="url(#wd-shadowG)"/>


    <g id="wd-dark">${photo(STONE)}</g>
    <g id="wd-lit" class="wdL" clip-path="url(#wd-cFill)">${photo(GOLD)}</g>
    <g class="wd-motes" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<circle class="wd-mote" cx="${36 + (i * 97) % 268}" cy="${70 + (i * 53) % 130}" r="${(.7 + (i % 3) * .45).toFixed(2)}" style="animation-delay:${(-i * .83).toFixed(2)}s;animation-duration:${6 + (i % 5)}s"/>`).join("")}</g>
    <rect id="wd-doorGlow" x="146" y="146" width="48" height="62" fill="url(#wd-doorG)"/>

    <g mask="url(#wd-mBld)">
      <rect class="wd-breath" x="0" y="0" width="340" height="216" fill="url(#wd-shineG)"/>
      <path id="wd-surfG" fill="none" stroke="#f3c35c" stroke-width="4.5" opacity=".35"/>
      <path id="wd-surf" fill="none" stroke="#fff3cf" stroke-width="1.2" opacity=".95"/>
      <rect id="wd-shine" x="0" y="0" width="340" height="216" fill="url(#wd-shineG)"/>
      <rect class="wd-sweep" x="0" y="60" width="340" height="80" fill="url(#wd-sweepG)"/>
    </g>

    <g id="wd-chains">${CHAINS.map((c, i) => chainLinks(c, 11 + i * 7)).join("")}</g>
    <g id="wd-lock" transform="translate(${LOCK[0]} ${LOCK[1]})">
      <g class="lk">
        <path class="lk-shackle" d="M-5.4 0V-6.2a5.4 5.4 0 0 1 10.8 0V0" fill="none" stroke="url(#ch-steel)" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="-9" y="-1" width="18" height="14.5" rx="3" fill="url(#lk-brass)" stroke="#5e3f0c" stroke-width=".6"/>
        <rect x="-8" y="0" width="16" height="2.6" rx="1.3" fill="#fff" opacity=".26"/>
        <circle cx="0" cy="5" r="1.9" fill="#3a2608"/>
        <path d="M0 5.5V9.6" stroke="#3a2608" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    </g>`;

  /* ---------- filling the Dome with light ---------- */
  const fillP = $("wd-fillP"), surf = $("wd-surf"), surfG = $("wd-surfG"), halo = $("wd-halo");
  const ANCH = [214, 164, 104, 64, 12];                              // pedestal, colonnade, attic and drum, dome                         // where each task's light reaches
  const levelY = lv => {
    if (lv >= 100) return -40;
    const s = clamp(lv, 0, 100) / SPAN, i = Math.min(N - 1, Math.floor(s));
    return ANCH[i] + (ANCH[i + 1] - ANCH[i]) * (s - i);
  };
  let level = 0, slosh = 0, clock = 0, running = false, lastT = 0, isOpen = false;

  function drawFill(t) {
    const lv = clamp(level, 0, 100), y = levelY(lv);
    const amp = reduce ? 0 : .8 + slosh * 2;
    const pts = [];
    for (let x = -4; x <= 344; x += 8) pts.push([x, y + (Math.sin(x * .05 + t * 1.6) * .9 + Math.sin(x * .13 - t * 2.3) * .4) * amp]);
    const line = "M" + pts.map(p => `${p[0]} ${p[1].toFixed(2)}`).join("L");
    fillP.setAttribute("d", lv <= .1 ? "M0 0Z" : `${line}L344 240L-4 240Z`);
    const showLine = lv > .1 && lv < 99.9;
    surf.style.display = surfG.style.display = showLine ? "" : "none";
    if (showLine) { surf.setAttribute("d", line); surfG.setAttribute("d", line); }
  }
  function frame(now) {
    if (!running) { lastT = 0; return; }
    const dt = lastT ? Math.min(.05, (now - lastT) / 1000) : 0;
    lastT = now; clock += dt; slosh *= Math.pow(.3, dt);
    drawFill(clock);
    requestAnimationFrame(frame);
  }
  function setRunning(on) {
    if (reduce) { drawFill(0); return; }
    if (on && !running) { running = true; requestAnimationFrame(frame); }
    else if (!on) running = false;
  }

  /* ---------- task tiles + text ---------- */
  const tasksEl = $("wd-tasks");
  tasksEl.innerHTML = TASKS.map(t => `
        <li class="wd-t">
          <span class="wd-t-top"><span class="wd-t-ic" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2.6 6.2l2.2 2.2 4.6-4.8"/></svg></span><span class="wd-t-name">${t}</span></span>
          <span class="wd-t-bar" aria-hidden="true"><i></i></span><span class="sr-only"></span>
        </li>`).join("");
  const tiles = [...tasksEl.children].map(el => ({ el, bar: el.querySelector("i"), sr: el.querySelector(".sr-only"), st: "", txt: "" }));
  const subEl = $("wd-sub");
  let shownPct = -1;

  function render() {
    const lv = clamp(level, 0, 100), done = Math.min(TN, Math.floor(lv / TS + 1e-6));   /* JG-PROD: P4d re-walk F2 */
    tiles.forEach((t, i) => {
      const df = render.df, f = df ? +!!df[i] : clamp((lv - i * TS) / TS, 0, 1);   /* JG-PROD: P4d re-walk F2 */   /* JG-PROD: owner 10 Oct (delegated call), a tile ticks when its own task is done: with the day's done flags (JIA_today.done) a tile's bar is full or empty by its own task; without them (the demo) it fills with the light, as drawn */
      const st = df ? (df[i] ? "done" : i === df.indexOf(false) ? "now" : "todo") : i < done ? "done" : i === done ? "now" : "todo";   /* JG-PROD: owner 10 Oct (delegated call), a tile ticks when its own task is done, in whatever order (it ticked left to right by how many were done, so the third task done first ticked the first tile); "now" is the first task not done; without flags (the demo) as drawn */
      if (st !== t.st) { t.el.classList.remove("done", "now", "todo"); t.el.classList.add(st); t.st = st; }
      t.bar.style.width = `${(f * 100).toFixed(1)}%`;
      const txt = st === "done" ? ", done" : f > .005 ? `, ${Math.round(f * 100)}% done` : ", not started";
      if (txt !== t.txt) { t.sr.textContent = txt; t.txt = txt; }
    });
    const pct = Math.round(lv);
    if (pct !== shownPct) {
      shownPct = pct;
      subEl.textContent = isOpen ? "Unlocked today" : `${pct}% complete`;
      svg.setAttribute("aria-label", `${window.JG_ENGINE ? "The dome" : "MIT's Great Dome"}, ${pct}% filled with light` + (isOpen ? ", chains broken." : ", held by chains until 100%."));   /* JG-PROD: owner 3 Oct R14, P4b final review I3: a real student's Dome never names MIT; the design's own label without an engine */
    }
    halo.setAttribute("opacity", (lv / 100 * .25 + (card.classList.contains("shining") ? .75 : 0)).toFixed(3));
    if (!running) drawFill(clock);
  }

  let tween = 0;
  function animateTo(target, dur, done) {
    cancelAnimationFrame(tween);
    document.dispatchEvent(new CustomEvent("today:progress", { detail: { level: target } }));   // Today's task list follows the Dome
    if (reduce || !dur) { level = target; render(); drawFill(clock); if (done) done(); return; }
    const from = level, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      level = from + (target - from) * ease(k);
      slosh = Math.min(1, slosh + .035);
      render();
      if (k < 1) tween = requestAnimationFrame(step);
      else { tween = 0; if (done) done(); }
    };
    tween = requestAnimationFrame(step);
  }

  /* ---------- wallet (top right) + coins flying into it ---------- */
  const wallet = $("wallet"), coinsEl = $("wallet-num"), wcoin = $("wallet-coin"), live = $("wallet-live");
  $("wallet-plus").textContent = `+${REWARD}`;
  $("wd-prize").textContent = `+${REWARD}`; if (!REWARD) $("wd-prize").parentElement.style.display = "none";   /* JG-PROD: P4d re-walk F2, no prize shown on a day that pays none */
  const flyLayer = document.createElement("div");
  flyLayer.className = "coin-fly"; flyLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(flyLayer);
  let flyGen = 0, plusT = 0, coins = INIT.coins;

  function setCoins(n) { coinsEl.textContent = n.toLocaleString("en-US"); wallet.setAttribute("aria-label", `${n} coins. Open the coin shop`); }
  setCoins(coins);                                                    // the balance shows from the start
  window.JIA_coins = {                                                // the coin shop spends through here
    get: () => coins,
    spend(n, meta) { if (n > coins) return false; coins -= n; setCoins(coins); wallet.classList.remove("bump"); void wallet.offsetWidth; wallet.classList.add("bump"); if (window.JG_ENGINE) window.JG_ENGINE.spend(n, meta); return true; },   /* JG-PROD: S19, every debit is posted with its reason and item; a refused one is corrected and told */
    add(n, meta) { coins += n; setCoins(coins); if (window.JG_ENGINE) window.JG_ENGINE.coinsAdded(n, meta); }, set(n) { coins = n; setCoins(coins); },   /* JG-PROD: S19, S27, game credits are posted; set() takes the server's balance */
  };
  function bump() { wallet.classList.remove("bump"); void wallet.offsetWidth; wallet.classList.add("bump"); }
  function gain(total) {
    setCoins(total);
    wallet.classList.remove("gain"); void wallet.offsetWidth; wallet.classList.add("gain");
    clearTimeout(plusT); plusT = setTimeout(() => wallet.classList.remove("gain"), 2600);
    live.textContent = `${REWARD} coins added. You now have ${total} coins.`;
  }
  const bez = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
  const toScreen = (x, y) => { const m = svg.getScreenCTM(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f, m.a]; };
  function flyCoins(sx, sy, n, onLand, onDone) {
    const gen = ++flyGen;
    const w = wcoin.getBoundingClientRect(), tx = w.left + w.width / 2, ty = w.top + w.height / 2;
    let landed = 0;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("span");
      c.className = "coin coin-flyer"; c.style.opacity = "0";
      flyLayer.appendChild(c);
      const burst = (Math.random() - .5) * 2;
      const p1 = [sx + burst * 90, sy - 50 - Math.random() * 60];
      const p2 = [tx - 26 + (Math.random() - .5) * 70, ty + 90 + Math.random() * 70];
      const spin = 2 + Math.floor(Math.random() * 2), K = 26, frames = [];
      for (let k = 0; k <= K; k++) {
        const t = k / K, x = bez(sx, p1[0], p2[0], tx, t), y = bez(sy, p1[1], p2[1], ty, t);
        const sc = t < .22 ? .6 + (t / .22) * .6 : 1.2 - ((t - .22) / .78) * .12;
        const flip = Math.max(.16, Math.abs(Math.cos(t * Math.PI * spin)));
        frames.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(sc * flip).toFixed(3)}, ${sc.toFixed(3)})`,
                      opacity: t < .05 ? t / .05 : t > .95 ? (1 - t) / .05 : 1 });
      }
      const a = c.animate(frames, { duration: 950 + Math.random() * 250, delay: i * 65, easing: "cubic-bezier(.42, .05, .32, 1)", fill: "both" });
      a.onfinish = () => {
        c.remove();
        if (gen !== flyGen) return;
        landed++; onLand(landed); bump();
        if (landed === n) onDone();
      };
    }
  }
  function payCoins() {
    const start = coins; if (!REWARD) return; coins += REWARD;   /* JG-PROD: P4d re-walk F2, no coins fly on a rest day */
    if (reduce) { gain(coins); return; }
    const [sx, sy] = toScreen(LOCK[0], LOCK[1]), n = 14;
    flyCoins(sx, sy, n, k => setCoins(start + Math.round(REWARD * k / n)), () => gain(start + REWARD));
  }

  /* ---------- the letter: comes out of the Dome, opens as an old letter ---------- */
  const layer = $("lt-layer"), stage = $("lt-stage"), closeBtn = $("lt-close");
  const STUDY_DAY = parseInt($("main").dataset.day, 10) || 1;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const starD = (cx, cy, R1, R2) => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R2 : R1;
      d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(2) + " " + (cy + r * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  };
  // wax seal: an uneven blob pressed with a gold star, drawn twice so it can crack in two
  const blobD = (() => {
    const n = 20, pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, r = 26.4 + Math.sin(i * 2.7) * 1.3 + (i % 4 === 0 ? 1.4 : 0);
      pts.push([30 + r * Math.cos(a), 30 + r * Math.sin(a)]);
    }
    const m = (p, q) => `${((p[0] + q[0]) / 2).toFixed(2)} ${((p[1] + q[1]) / 2).toFixed(2)}`;
    let d = `M${m(pts[n - 1], pts[0])}`;
    for (let i = 0; i < n; i++) d += `Q${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)} ${m(pts[i], pts[(i + 1) % n])}`;
    return d + "Z";
  })();
  const sealSVG = cls => `
        <svg class="${cls}" viewBox="0 0 60 60">
          <path d="${blobD}" fill="url(#lt-wax)"/>
          <circle cx="30" cy="30" r="18" fill="url(#lt-wax2)" stroke="#092418" stroke-opacity=".55" stroke-width="1.4"/>
          <circle cx="30.5" cy="30.8" r="18" fill="none" stroke="#6abf97" stroke-opacity=".28" stroke-width=".7"/>
          <path d="${starD(30, 30.6, 9.6, 4)}" fill="#d8ae47" stroke="#86610f" stroke-width=".6"/>
          <ellipse cx="21" cy="17" rx="8" ry="3.4" fill="#fff" opacity=".16" transform="rotate(-28 21 17)"/>
        </svg>`;
  $("lt-seal").innerHTML = sealSVG("sl") + sealSVG("sr");
  const crest = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.6" fill="none" stroke="#b28430" stroke-width=".9"/><path d="${starD(12, 12.4, 6.2, 2.6)}" fill="#c4952f"/></svg>`;

  function fillLetter() {
    const text = LETTERS[(STUDY_DAY - 1) % LETTERS.length];
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const html = `
          <div class="lt-row"><span class="lt-crest">${crest}</span><span class="lt-date">${date}</span></div>
          <p class="lt-hello">Dear ${esc(GREETING_NAME)},</p>
          <p class="lt-body">${esc(text)}</p>
          <p class="lt-yours">Yours,</p>
          <p class="lt-sign">${esc(SIGNATURE)}</p>
          <p class="lt-src">${esc(SIGNED_FROM)}</p>`;
    layer.querySelectorAll(".lt-page").forEach(p => { p.innerHTML = html; });
    $("lt-sr").textContent = `Dear ${GREETING_NAME}, ${text} Yours, ${SIGNATURE}, ${SIGNED_FROM}.`;
  }

  // seal cracks, flap opens, letter rises, envelope falls away, letter unfolds
  const STEPS = [["s-in", 20], ["s-crack", 480], ["s-flap", 760], ["s-flapback", 1030], ["s-rise", 1220],
                 ["s-drop", 1780], ["s-out", 2120], ["s-unfold", 2420], ["s-done", 3250]];
  const ALL = STEPS.map(s => s[0]);
  let ltTimers = [], lastFocus = null, closingT = 0, envGen = 0;
  const clearSteps = () => { ltTimers.forEach(clearTimeout); ltTimers = []; };

  function prepareLayer() {
    clearTimeout(closingT); clearSteps();
    fillLetter();
    layer.classList.remove("closing", "s-bg", ...ALL);
    lastFocus = document.activeElement;
    layer.hidden = false;
    document.addEventListener("keydown", onKey);
  }
  function showLetter() {                                 // reopen: the envelope rises in on its own
    prepareLayer();
    closeBtn.focus({ preventScroll: true });
    if (reduce) { layer.classList.add("s-bg", ...ALL); return; }
    void layer.offsetWidth;
    STEPS.forEach(([c, t]) => ltTimers.push(setTimeout(() => layer.classList.add(c), t)));
  }
  function handoff() {                                   // the envelope from the Dome is already in place
    layer.classList.add("instant", "s-in");
    void layer.offsetWidth;
    requestAnimationFrame(() => layer.classList.remove("instant"));
    closeBtn.focus({ preventScroll: true });
    STEPS.slice(1).forEach(([c, t]) => ltTimers.push(setTimeout(() => layer.classList.add(c), t - 300)));
  }
  function stageTarget() {                               // where the envelope sits once the stage is in
    const r = stage.getBoundingClientRect(), w = stage.offsetWidth;
    return [r.left + r.width / 2, r.top + r.height / 2 - 28, w];
  }
  function skipToLetter() {                              // tap during the animation
    if (layer.classList.contains("s-done") || !layer.classList.contains("s-in")) return;
    clearSteps();
    layer.classList.add("instant", ...ALL);
    void layer.offsetWidth;
    requestAnimationFrame(() => layer.classList.remove("instant"));
  }
  function closeLetter(silent) {
    envGen++;
    flyLayer.querySelectorAll(".env-flyer").forEach(e => e.remove());
    if (layer.hidden) return;
    clearSteps();
    document.removeEventListener("keydown", onKey);
    const done = () => { layer.hidden = true; layer.classList.remove("closing", "s-bg", ...ALL); };
    if (reduce || silent) done();
    else { layer.classList.add("closing"); closingT = setTimeout(done, 280); }
    if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closeLetter(); }
    else if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }   // the letter has one control
  }
  stage.addEventListener("click", skipToLetter);
  closeBtn.addEventListener("click", () => closeLetter());
  $("lt-backdrop").addEventListener("click", () => closeLetter());

  /* ---------- the envelope comes out through the Dome's doors ---------- */
  const ENVELOPE = `<svg viewBox="0 0 36 26" aria-hidden="true">
      <defs><radialGradient id="env-wax" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#38916b"/><stop offset=".5" stop-color="#1b5c41"/><stop offset="1" stop-color="#0c2c1e"/></radialGradient></defs>
      <rect x=".5" y=".5" width="35" height="25" rx="1.2" fill="#f1e4c5" stroke="#c9b387" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      <path d="M1 25L14 12.8M35 25L22 12.8" fill="none" stroke="#dcc9a2" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M1 1.2L18 15L35 1.2" fill="none" stroke="#c4ad80" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
      <circle cx="18" cy="14" r="3.2" fill="url(#env-wax)"/>
      <path d="${starD(18, 14.1, 1.8, .75)}" fill="#d8ae47"/>
    </svg>`;
  function deliverLetter(done) {
    const gen = ++envGen;
    card.classList.add("door");
    if (reduce) { card.classList.remove("door"); showLetter(); done(); return; }
    const [sx, sy, k] = toScreen(DOOR[0], DOOR[1]);
    const hx = sx, hy = sy - 29 * k;                            // hovers in front of the columns, below the MIT attic
    // built at the size it will have in the letter view, then scaled down: sharp at every size
    const W = Math.min(360, document.documentElement.clientWidth - 56), H = W * 26 / 36, f = 36 / W;
    const env = document.createElement("div");
    env.className = "env-flyer"; env.innerHTML = ENVELOPE;
    Object.assign(env.style, { width: `${W}px`, height: `${H}px`, marginLeft: `${-W / 2}px`, marginTop: `${-H / 2}px` });
    flyLayer.appendChild(env);
    const glow = `drop-shadow(0 0 ${Math.round(10 / (1.55 * f))}px rgba(240, 190, 80, .9))`, calm = "drop-shadow(0 0 0 rgba(240, 190, 80, 0))";
    const emerge = env.animate([
      { offset: 0,   transform: `translate(${sx}px, ${sy}px) scale(${.18 * f})`, opacity: 0, filter: calm, easing: "ease-out" },
      { offset: .25, transform: `translate(${sx}px, ${sy - 8 * k}px) scale(${.55 * f})`, opacity: 1, filter: glow, easing: "cubic-bezier(.2, .8, .3, 1)" },
      { offset: .75, transform: `translate(${hx}px, ${hy}px) scale(${1.55 * f})`, opacity: 1, filter: glow, easing: "ease-in-out" },
      { offset: 1,   transform: `translate(${hx}px, ${hy - 4}px) scale(${1.55 * f}) rotate(-2deg)`, opacity: 1, filter: glow },
    ], { duration: 1400, fill: "forwards" });
    emerge.onfinish = () => {
      if (gen !== envGen) { env.remove(); return; }
      card.classList.remove("door");
      prepareLayer();
      void layer.offsetWidth;
      layer.classList.add("s-bg");                              // the screen dims while it comes forward
      requestAnimationFrame(() => {
        if (gen !== envGen) { env.remove(); return; }
        const [cx, cy, w] = stageTarget(), s = w / W;
        const c1 = [hx, hy - 70], c2 = [cx, cy + 50], frames = [];
        for (let i = 0; i <= 18; i++) {
          const u = i / 18, e = ease(u);
          frames.push({
            transform: `translate(${bez(hx, c1[0], c2[0], cx, e).toFixed(1)}px, ${bez(hy - 4, c1[1], c2[1], cy, e).toFixed(1)}px) scale(${(1.55 * f + (s - 1.55 * f) * e).toFixed(4)}) rotate(${(-2 + 2 * e).toFixed(2)}deg)`,
            filter: u < .55 ? glow : calm,
          });
        }
        const fly = env.animate(frames, { duration: 900, fill: "forwards" });
        fly.onfinish = () => {
          if (gen !== envGen) { env.remove(); return; }
          handoff();
          requestAnimationFrame(() => env.remove());
          done();
        };
      });
    };
  }

  /* ---------- the day: fill, break the chains, reward ---------- */
  const stake = $("wd-stake"), stakeTxt = $("wd-stake-txt");
  let busy = false, started = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const pvTask = document.querySelector('.pv [data-act="task"]'), pvOpen = document.querySelector('.pv [data-act="open"]');
  function refreshPv() { if (pvTask) pvTask.disabled = level >= 100 - 1e-6; }
  function setOpenText(open) { stakeTxt.textContent = open ? "Chains broken today" : "Break the chains at 100%"; }

  function breakChains(quiet) {
    isOpen = true;
    if (!quiet && REWARD) document.dispatchEvent(new CustomEvent("jia:daydone"));   /* JG-PROD: P4d re-walk F2, a rest day is neutral (the server's streak rule): no day-done event */   // a study day is complete: the streak grows
    if (quiet || reduce) {
      card.classList.add("opening", "freeing", "shining", "open");
      setOpenText(true); shownPct = -1; render();
      if (quiet) return;
      payCoins(); showLetter(); busy = false; refreshPv();
      return;
    }
    card.classList.add("shake");
    later(() => card.classList.add("opening"), 450);
    later(() => card.classList.add("freeing"), 720);
    later(() => { card.classList.add("shining", "sweep"); render(); }, 1350);
    later(payCoins, 1700);
    later(() => { card.classList.add("open"); setOpenText(true); shownPct = -1; render(); }, 2300);
    later(() => deliverLetter(() => { busy = false; refreshPv(); }), 2650);
  }
  function tapDome() {
    if (isOpen) { if (!busy) showLetter(); return; }
    if (busy) return;
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    stake.classList.remove("flash"); void stake.offsetWidth; stake.classList.add("flash");
    setTimeout(() => { if (!isOpen) card.classList.remove("shake"); }, 500);
  }
  svg.addEventListener("click", tapDome);
  $("wd-read").addEventListener("click", () => { if (!busy) showLetter(); });

  function completeTask() {
    if (busy || level >= 100 - 1e-6) return;
    const i = Math.min(TN - 1, Math.floor(level / TS + 1e-6));   /* JG-PROD: P4d re-walk F2 */
    busy = true;
    animateTo((i + 1) * TS, 1500, () => {   /* JG-PROD: P4d re-walk F2 */
      refreshPv();
      if (i === TN - 1) breakChains(false); else busy = false;   /* JG-PROD: P4d re-walk F2 */
    });
  }
  function openApp(instant) {
    started = true;
    timers.forEach(clearTimeout); timers = [];
    flyGen++; flyLayer.textContent = ""; clearTimeout(plusT); wallet.classList.remove("gain", "bump");
    closeLetter(true);
    if (!window.JG_ENGINE) coins = INIT.coins; setCoins(coins); live.textContent = "";   /* JG-PROD: S20, replaying the Dome never resets a real balance */
    isOpen = false;
    card.classList.remove("shake", "opening", "freeing", "shining", "sweep", "open", "door");
    setOpenText(false);
    busy = true;
    if (!instant) { level = 0; }
    shownPct = -1; render();
    animateTo(INIT.progress, instant ? 0 : 2000, () => {
      busy = false;
      if (level >= 100 - 1e-6) breakChains(true);
      refreshPv();
    });
  }

  // first look: the Dome fills to today's level
  render(); drawFill(0); refreshPv();
  const io = new IntersectionObserver(es => {
    const vis = es.some(e => e.isIntersecting);
    setRunning(vis && !document.hidden);
    if (vis && !started) openApp(reduce || (!!window.JG_MOTION && !JG_MOTION.onceToday("dome")));   /* JG-PROD: owner 4 Oct R1, the Dome fills from empty on the day's first open per account (jg.seen.v1); later opens draw today's level at once, the design's own instant path */
  }, { threshold: .3 });
  io.observe(card);
  document.addEventListener("visibilitychange", () => { if (document.hidden) setRunning(false); });

  /* ---------- design preview buttons (bottom right, not part of the app) ---------- */
  function reveal(fn) {
    const r = card.getBoundingClientRect(), vh = window.innerHeight;
    const inView = r.top >= 0 && r.bottom <= vh;
    if (!inView) card.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    setTimeout(fn, inView || reduce ? 0 : 450);
  }
  if (pvOpen) pvOpen.addEventListener("click", () => reveal(() => openApp(false)));
  if (pvTask) pvTask.addEventListener("click", () => reveal(() => { if (!started) openApp(true); completeTask(); }));
  window.JIA_today = {                                                     // the roadmap engine drives the day through this
    complete: () => reveal(() => { if (!started) openApp(true); completeTask(); }),
    startAt: (pct, force) => { INIT.progress = clamp(pct, 0, 100); if (!started || busy) return;
      if (force && !isOpen) { level = INIT.progress; shownPct = -1; render(); drawFill(clock); refreshPv(); return; }   // switching to the roadmap's day
      if (level < INIT.progress - .5) { busy = true; animateTo(INIT.progress, 600, () => { busy = false; if (level >= 100 - 1e-6 && !isOpen) breakChains(true); refreshPv(); }); } },
    name: (i, text) => { const t = tiles[i], n = t && t.el.querySelector(".wd-t-name"); if (n) n.textContent = text; },
    tile: i => (tiles[i] ? tiles[i].el : null), count: n => { n = Math.min(N, Math.max(1, n | 0)); if (n === TN) return; TN = n; TS = 100 / n; tiles.forEach((t, i) => { t.el.style.display = i < n ? "" : "none"; }); tasksEl.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`; shownPct = -1; render(); document.dispatchEvent(new CustomEvent("today:progress", { detail: { level, count: n } })); }, of: () => TN, done: f => { render.df = f ? tiles.map((t, i) => !!f[i]) : null; render(); }, rest: r => { REWARD = r ? 0 : parseInt(card.dataset.reward, 10) || 40; $("wallet-plus").textContent = `+${REWARD}`; $("wd-prize").textContent = `+${REWARD}`; $("wd-prize").parentElement.style.display = REWARD ? "" : "none"; },   /* JG-PROD: P4d re-walk F2, the engine sets the day's task count; a tile past it is hidden */   /* JG-PROD: owner 10 Oct (delegated call), a tile ticks when its own task is done: the engine says which of the day's tasks are done, one flag a tile in the tiles' order (null: the design's own draw); the light and the percentage still follow the share done */   /* JG-PROD: owner 10 Oct (delegated call, teen walk), the engine says whether today is a rest day once today's tasks are known: no +40 is shown or flown on a day the server pays none (a study day: the card's own reward, 40 as drawn) */
  };
})();
/* The coin wallet sits in the top bar and opens the coin shop (COIN SHOP, further down). */

/* ==========================================================
   THE RAIL — Today · Explore · Home · Lessons · Community
   The mobile tab bar, stood on its side: green glass on the left
   edge with Home in the middle. The active section sits in a
   glowing tile; while it moves (click another, or press and drag
   along the rail) the tile turns into a clear liquid-glass lens
   that magnifies what it passes over. Below 760px wide it lies
   back down along the bottom, like the phone.
   ========================================================== */
(() => {
  "use strict";
  const { $, relayout } = window.JIA;
  const TABS = [
    { key: "today", label: "Today",
      icon: `<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.7" fill="currentColor" stroke="none"/>`,
      h: "Plan your study day", p: "Today's tasks, mini games and your league." },
    { key: "explore", label: "Explore",
      icon: `<circle cx="12" cy="12" r="8.6"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>`,
      h: "Find what's next", p: "Programs, scholarships and study guides picked for your goals." },
    { key: "home", label: "Home",
      icon: `<path d="M4 10.3L12 4l8 6.3V19a1.6 1.6 0 0 1-1.6 1.6H15v-5.6H9v5.6H5.6A1.6 1.6 0 0 1 4 19z"/>` },
    { key: "lessons", label: "Lessons",
      icon: `<rect x="3.2" y="4.8" width="17.6" height="14.4" rx="3.4"/><path d="M10.2 9.2v5.6l4.8-2.8z"/>`,
      h: "Learn by subject", p: "SAT, AP, IELTS and more, with live lessons at the top." },
    { key: "community", label: "Community",
      icon: `<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h7.8A2.6 2.6 0 0 1 17 6.6v4.8a2.6 2.6 0 0 1-2.6 2.6H9.2L5.6 17v-3.1A2.6 2.6 0 0 1 4 11.4z"/><path d="M17 8.4h.4A2.6 2.6 0 0 1 20 11v4.9a2.6 2.6 0 0 1-1.6 2.4V21l-3-2.4h-3.2a2.6 2.6 0 0 1-2.4-1.6"/>`,
      h: "Talk it through", p: "Chat with classmates and mentors who are on the same path." },
  ];
  const HOME = TABS.findIndex(t => t.key === "home"), N = TABS.length;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const dock = $("dock"), track = $("dk-track"), lens = $("dk-lens"), mag = $("dk-mag"), app = $("app");
  const home = $("v-home"), view = $("v-tab"), title = $("tv-title");
  const glyph = t => `<svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>`;

  track.insertAdjacentHTML("afterbegin", TABS.map((t, i) =>
    `<button class="dk-item" type="button" data-i="${i}"${i === HOME ? ' aria-current="page"' : ""}>${glyph(t)}<span>${t.label}</span></button>`).join(""));
  mag.innerHTML = TABS.map(t => `<div class="dk-item">${glyph(t)}<span>${t.label}</span></div>`).join("");
  const items = [...track.querySelectorAll("button.dk-item")];
  title.tabIndex = -1;

  /* ---------- geometry: works along either axis ---------- */
  let vertical = true, IS = 0, LS = 0;                                // item size and lens size along the rail
  function measure() {
    vertical = getComputedStyle(track).flexDirection === "column";
    const W = track.clientWidth, H = track.clientHeight;
    IS = (vertical ? H : W) / N; LS = IS - 4;
    lens.style.width = `${vertical ? W : LS}px`;
    lens.style.height = `${vertical ? LS : H}px`;
    mag.style.width = `${W}px`; mag.style.height = `${H}px`;
  }
  const slot = i => i * IS + (IS - LS) / 2;

  /* ---------- the lens: a spring, stretched along the rail by its own speed ---------- */
  let active = HOME, x = 0, v = 0, target = 0, dragging = false;
  let grow = 1, magS = 1, moving = false, stillFor = 0, raf = 0, last = 0;

  function paint() {
    const s = Math.min(.3, Math.abs(v) / 2600);
    const along = ((1 + s) * grow).toFixed(4), across = ((1 - s * .45) * grow).toFixed(4);
    const at = x.toFixed(2), back = (-x).toFixed(2), mid = (x + LS / 2).toFixed(2), m = magS.toFixed(4);
    if (vertical) {
      lens.style.transform = `translateY(${at}px) scale(${across}, ${along})`;
      mag.style.transformOrigin = `50% ${mid}px`;
      mag.style.transform = `translate(0, ${back}px) scale(${m})`;
    } else {
      lens.style.transform = `translateX(${at}px) scale(${along}, ${across})`;
      mag.style.transformOrigin = `${mid}px 50%`;
      mag.style.transform = `translate(${back}px, 0) scale(${m})`;
    }
  }
  function setMoving(on) { if (on !== moving) { moving = on; dock.classList.toggle("moving", on); } }
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

  /* ---------- sections: every section has its own page; the others hold their place until they're designed ---------- */
  const OWN = { today: $("v-today"), explore: $("v-explore"), lessons: $("v-lessons"), community: $("tv-community") };                                 // sections with their own page
  let viewT = 0;
  const hideView = el => { el.classList.remove("show"); el.hidden = true; };
  const revealView = el => { el.hidden = false; void el.offsetWidth; el.classList.add("show"); };
  function showView(i) {
    const t = TABS[i], own = OWN[t.key] || null;
    clearTimeout(viewT);
    app.dataset.tab = t.key;
    Object.values(OWN).forEach(el => { if (el !== own) hideView(el); });
    window.scrollTo(0, 0);
    if (t.key === "home") {
      hideView(view);
      home.hidden = false; app.classList.remove("alt");
      relayout();
    } else {
      home.hidden = true; app.classList.add("alt");
      if (own) { hideView(view); revealView(own); }
      else {
        const fill = () => {
          title.textContent = t.label;
          $("tv-ic").innerHTML = glyph(t);
          $("tv-h").textContent = t.h; $("tv-p").textContent = t.p;
        };
        if (!view.hidden && !reduce) {                                   // one placeholder to another: a quick crossfade
          view.classList.remove("show");
          viewT = setTimeout(() => { fill(); view.classList.add("show"); }, 160);
        } else { fill(); revealView(view); }
      }
    }
    document.dispatchEvent(new CustomEvent("jia:tab", { detail: { key: t.key } }));
  }

  function select(i, instant) {
    const changed = i !== active;
    active = i;
    items.forEach((b, k) => { if (k === i) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    target = slot(i);
    if (instant || reduce) { x = target; v = 0; paint(); }
    else run();
    if (changed) showView(i);
  }
  window.JIA.go = key => {                                             // other parts of the page can open a section
    const i = TABS.findIndex(t => t.key === key);
    if (i < 0) return;
    select(i);
    if (i !== HOME) { const h = (OWN[key] || view).querySelector("h1"); if (h) h.focus({ preventScroll: true }); }
  };

  /* ---------- click, or press and drag along the rail ---------- */
  let drag = null, eatClick = false;
  const along = e => vertical ? e.clientY : e.clientX;
  track.addEventListener("pointerdown", e => {
    if (e.button !== 0 || reduce) return;
    drag = { id: e.pointerId, p0: along(e), live: false };
  });
  track.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.live && Math.abs(along(e) - drag.p0) > 6) {
      drag.live = true; dragging = true;
      track.setPointerCapture(e.pointerId);
    }
    if (drag.live) {
      const r = track.getBoundingClientRect();
      target = clamp(along(e) - (vertical ? r.top : r.left) - LS / 2, slot(0) - 8, slot(N - 1) + 8);
      run();
    }
  });
  const release = e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.live) {
      dragging = false; eatClick = true;
      select(clamp(Math.floor((x + LS / 2) / IS), 0, N - 1));
      setTimeout(() => { eatClick = false; }, 0);
    }
    drag = null;
  };
  track.addEventListener("pointerup", release);
  track.addEventListener("pointercancel", release);
  items.forEach((b, i) => b.addEventListener("click", e => { if (eatClick) { e.preventDefault(); return; } select(i); }));
  track.addEventListener("keydown", e => {                             // arrow keys move along the rail
    const k = items.indexOf(document.activeElement);
    if (k < 0) return;
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft", fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
    if (!back && !fwd) return;
    e.preventDefault();
    items[clamp(k + (fwd ? 1 : -1), 0, N - 1)].focus();
  });

  // the design preview works on Home, so its buttons bring you back there first
  const pv = document.querySelector(".pv");
  if (pv) pv.addEventListener("click", e => { if (active !== HOME && e.target.closest("button")) select(HOME, true); }, true);

  measure(); select(HOME, true);
  window.addEventListener("resize", () => { measure(); x = target = slot(active); v = 0; paint(); });
})();

/* ==========================================================
   NOTIFICATIONS — the bell opens them in a popover under it.
   Add items to NOTES; unread ones count on the bell.
   ========================================================== */
(() => {
  "use strict";
  const { $, toast } = window.JIA;
  const { league: LEAGUE, shield } = window.JIA;                     // the student's league, shared with Today
  const NOTES = window.JG_ENGINE ? [] : [   /* JG-PROD: C3, the bell's sample notes are another student's: a live student starts with none (final review runtime C3, owner to decide) */
    { img: "/d/student-desktop/media/d9215f710c4aac64.webp", text: "<b>Aziza Karimova</b> replied to your comment: \"Yes, the recording goes to Lessons afterwards.\"", time: "58m", unread: true,
      go: () => { const b = $("cm-ev-btn"); if (b) b.click(); } },                    // her reply is on the live SAT event
    { img: "/d/student-desktop/media/4fa18afb46ee90b5.webp", text: "<b>Dilnoza R.</b> started following you", time: "2h", unread: true,
      go: () => { if (window.JIA_openProfile) window.JIA_openProfile("dilnoza"); } },
    { league: LEAGUE.i, text: `You're <b>#${LEAGUE.rank} in the ${LEAGUE.name} League</b>, inside the promotion zone. Keep it up!`, time: "3h", unread: true,
      go: () => { if (window.JIA.openLeague) window.JIA.openLeague(); } },
    { icon: "/d/student-desktop/media/a23be1f07f4068ba.webp", text: "<b>Live SAT course</b> starts today at 19:00", time: "5h",
      go: () => window.JIA.go && window.JIA.go("lessons") },
    { icon: "/d/student-desktop/media/9b284cd6a91d8e4b.webp", text: "<b>Achievement unlocked:</b> IQ battle winner", time: "Sep 14",
      go: () => { if (window.JIA_ach) window.JIA_ach.open("iq", "me"); } },
  ];

  const pop = $("nt-pop"), bell = $("bell-btn"), list = $("nt-list"), all = $("nt-all"), badge = $("bell-n");
  function paint() {
    const n = NOTES.filter(x => x.unread).length;
    badge.textContent = n; badge.hidden = !n;
    bell.setAttribute("aria-label", n ? `Notifications, ${n} new` : "Notifications");
    all.disabled = !n;
    const row = x => `<li><button class="nt${x.unread ? " unread" : ""}" type="button" data-n="${NOTES.indexOf(x)}">
        ${x.img || x.who ? `<img src="${x.img || (window.JIA_AV || {})[x.who] || ""}" alt="">` : x.league != null ? `<span class="nt-ic">${shield(30, x.league)}</span>` : x.icon ? `<span class="nt-ic"><img src="${x.icon}" alt=""></span>` : `<span class="nt-ic">${shield(30)}</span>`}
        <span class="nt-t">${x.text}<small>${x.time}</small></span>${x.unread ? `<span class="nt-dot" aria-hidden="true"></span>` : ""}</button></li>`;
    const fresh = NOTES.filter(x => x.unread), old = NOTES.filter(x => !x.unread);
    list.innerHTML = (fresh.length ? `<li class="nt-h">New</li>${fresh.map(row).join("")}` : "") +
                     (old.length ? `<li class="nt-h">Earlier</li>${old.map(row).join("")}` : "");
  }
  window.JIA.notify = x => { NOTES.unshift(Object.assign({ time: "now", unread: true }, x)); paint(); };

  let openY = 0;
  function open() {
    paint();
    pop.hidden = false;
    bell.setAttribute("aria-expanded", "true");
    openY = window.scrollY;
    (list.querySelector(".nt") || all).focus({ preventScroll: true });
  }
  function close(refocus) {
    if (pop.hidden) return;
    pop.hidden = true;
    bell.setAttribute("aria-expanded", "false");
    if (refocus) bell.focus({ preventScroll: true });
  }
  bell.addEventListener("click", () => { if (pop.hidden) open(); else close(); });
  document.addEventListener("pointerdown", e => { if (!pop.hidden && !pop.contains(e.target) && !bell.contains(e.target)) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { e.preventDefault(); close(true); } });
  pop.addEventListener("focusout", e => { if (e.relatedTarget && !pop.contains(e.relatedTarget) && !bell.contains(e.relatedTarget)) close(); });
  window.addEventListener("scroll", () => { if (!pop.hidden && Math.abs(window.scrollY - openY) > 60) close(); }, { passive: true });
  document.addEventListener("jia:tab", () => close());
  all.addEventListener("click", () => {
    NOTES.forEach(x => { x.unread = false; });
    paint();
    const first = list.querySelector(".nt");
    if (first) first.focus({ preventScroll: true });
  });
  list.addEventListener("click", e => {
    const b = e.target.closest("[data-n]");
    if (!b) return;
    const x = NOTES[+b.dataset.n];
    x.unread = false; paint();
    close(true);
    if (x.go) x.go();
  });
  paint();
})();

