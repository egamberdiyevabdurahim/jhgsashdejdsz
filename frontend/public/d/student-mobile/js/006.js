
(() => {
  "use strict";

  /* ==========================================================
     TODAY PAGE — recent tasks with their status, and all-time
     totals. Statuses follow today's progress on Home (done, in
     progress, waiting). Totals: data-total and data-completed on
     <section id="tv-today">; missed is what's left.
     ========================================================== */
  const TASKS = [
    { key: "sat", name: "SAT", detail: "Math practice set",
      icon: `<rect x="5" y="3.5" width="14" height="17" rx="2.6"/><path d="M8.6 8h6.8M8.6 11.6h6.8M8.6 15.2h4"/>` },
    { key: "ap", name: "AP", detail: "Calculus unit review",
      icon: `<path d="M12 6.6C10.3 5.2 7.9 4.6 4 4.6v13.2c3.9 0 6.3.6 8 2 1.7-1.4 4.1-2 8-2V4.6c-3.9 0-6.3.6-8 2z"/><path d="M12 6.6v13.2"/>` },
    { key: "cac", name: "CAC", detail: "Course lesson 6",
      icon: `<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.2 9.3v5.4l4.6-2.7z"/>` },
    { key: "ielts", name: "IELTS", detail: "Writing Task 2",
      icon: `<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.4 2.3 3.6 5.2 3.6 8.6s-1.2 6.3-3.6 8.6c-2.4-2.3-3.6-5.2-3.6-8.6S9.6 5.7 12 3.4z"/>` },
  ]; const DESIGN_ROWS = TASKS.slice(), jgRows = () => { if (!window.JG_ENGINE) return false; const JT = window.JG_ENGINE.tasks(window.JG_ENGINE.ymd(new Date())), ICON = { practice: 0, submit: 0, study: 1, reflect: 1, rest: 1, create: 2, upload: 2, book: 2, verify: 3, contact: 3 }, esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])), k = JT.map(t => [t.id, t.short, t.title_i18n].join("|")).join("|"); if (!JT.length) { TASKS.length = 0; jgRows.k = k; return true; }   /* JG-PROD: owner 14 Oct 2026, nothing invented looks real on a real account: a real student with no task today (before her first run) saw the design's sample rows (SAT, AP, CAC, IELTS "Waiting"); now no row, and the list says where her tasks come from */ if (k === jgRows.k) { JT.forEach((t, i) => { TASKS[i].jt = t; }); return false; } jgRows.k = k; TASKS.splice(0, TASKS.length, ...JT.map(t => Object.assign({}, DESIGN_ROWS[ICON[t.type] ?? 1], { name: esc(t.short), detail: esc(t.title_i18n), jt: t }))); return true; }; jgRows();   /* JG-PROD: S24, the rows are today's tasks, one list everywhere (spec §3.2); each keeps one of the design's four icons, picked by task type; P4d re-walk F1 (owner 4 Oct R1 R11), read again on each Today open, so the tasks the first run made in this page replace the design's sample rows at once */
  const STATUS = Object.assign({ done: "Done", prog: "In progress", wait: "Waiting" }, window.JG_ENGINE && window.JG_ENGINE.endWords ? window.JG_ENGINE.endWords() : null);   /* JG-PROD: owner 10 Oct (delegated call, teen walk), a task that was tried or skipped has its own word on its row ("Tried", "Skipped": the runtime's, in the student's language), never "Done"; the demo has neither state */
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chevron = cls => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;
  const page = $("tv-today");

  $("tvt-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  /* ---------- recent tasks ---------- */
  const list = $("rt-list");
  const paintRows = () => { /* JG-PROD: P4d re-walk F1 (owner 4 Oct R1 R11), the rows are drawn again when today's tasks arrive */ list.innerHTML = TASKS.map(t => `
        <li class="rt-row">
          <div class="rt-main">
            <span class="rt-ic ${t.key}" aria-hidden="true"><svg viewBox="0 0 24 24">${t.icon}</svg></span>
            <span class="rt-t"><p class="rt-name">${t.name}</p><p class="rt-sub">${t.detail}</p></span>
            <span class="rt-pill"></span>
            ${chevron("rt-go")}
          </div>
          <div class="rt-note" aria-hidden="true"><div class="rt-note-in"><div class="rt-note-box"><p class="rt-bubble"></p></div></div></div>
        </li>`).join("") || (window.JG_ENGINE && window.JG_ENGINE.noTasks ? `<li class="rt-none" data-no-i18n><p class="rt-sub" style="white-space:normal;padding:4px 2px 10px">${window.JG_ENGINE.noTasks()}</p></li>` : ""); }; paintRows();   /* JG-PROD: P4d re-walk F1; JG-PROD: owner 14 Oct 2026, a real student's empty list says where her tasks come from (public/runtime/jg-runtime.js noTasks), in the row's own muted line */
  const pills = [...list.querySelectorAll(".rt-pill")];
  const status = TASKS.map(() => "wait");
  function show(level) {
    const span = 100 / TASKS.length;
    pills.forEach((p, i) => {
      const f = clamp((level - i * span) / span, 0, 1);
      const st = TASKS[i].jt ? window.JG_ENGINE.state(TASKS[i].jt) : f >= .999 ? "done" : f > .001 ? "prog" : "wait";   /* JG-PROD: S24, each task's own state, not the Dome's level */
      status[i] = st;
      if (p.dataset.st !== st) { p.className = `rt-pill ${st}`; p.textContent = STATUS[st]; p.dataset.st = st; }
    });
  }
  const world = $("world");
  show(world ? +world.dataset.progress || 0 : 0);
  document.addEventListener("today:progress", e => { show(e.detail.level); if (window.JG_ENGINE && !busy && !page.hidden) settle(); });   /* JG-PROD: P4d re-walk F7, a task done while Today is open: Jamol says what is next now, not the task just done (a real student; not during his tour, which says it itself) */

  /* ---------- today's totals ---------- */
  const total = parseInt(page.dataset.total, 10) || 0;
  const completed = clamp(parseInt(page.dataset.completed, 10) || 0, 0, total);
  const NUMS = { total, done: completed, left: total - completed };
  const statEls = [...page.querySelectorAll("[data-stat]")];
  statEls.forEach(el => { el.textContent = reduce ? NUMS[el.dataset.stat] : 0; });

  /* ---------- the coach: goes to each task and acts it out, then comes home ----------
     done        → rides a rocket there, then throws a little party
     in progress → shouts it through a megaphone
     waiting     → punches at you until you start                                         */
  const NAME = JG_ME.firstName; /* JG-PROD: identity */
  const mcBtn = $("mc-btn"), mc = $("mc"), msgEl = $("coach-msg"), subEl = $("coach-sub"), live = $("coach-live"), coachEl = $("coach");
  const stage = $("mc-stage"), taskCard = page.querySelector(".rt");
  const mHop = mc.querySelector(".mc-hop");
  const rows = [...list.querySelectorAll(".rt-row")];
  const W = 110, H = 128, ROW_S = .57, NOTE_H = 62;
  let coachT = [], anims = [], seenOnce = false, spot = null, openNote = -1, busy = false;
  const later = (fn, ms) => coachT.push(setTimeout(fn, ms));
  const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };

  function stopCoach() {
    coachT.forEach(clearTimeout); coachT = [];
    anims.forEach(a => a.cancel()); anims = [];
    stage.querySelectorAll(".mc-puff, .mc-confetti, .mc-zoom").forEach(e => e.remove());
    dustLayer.textContent = "";
    document.querySelector(".device").classList.remove("loud");
    crackLayer.classList.remove("on"); device.classList.remove("shook");
    mc.classList.remove("punch", "pop"); taskCard.classList.remove("jolt");
    busy = false;
  }
  const setProp = p => { mc.dataset.prop = p; };
  function tell(text) { live.textContent = text; }
  function say(text, sub = "") {
    msgEl.textContent = text; subEl.textContent = sub; tell(text);
    restart(msgEl, "swap");
  }

  /* where things are, in page coordinates (they scroll with the page) */
  const at = el => {
    const r = el.getBoundingClientRect(), p = page.getBoundingClientRect();
    return { l: r.left - p.left + page.scrollLeft, t: r.top - p.top + page.scrollTop, w: r.width, h: r.height };
  };
  const centre = el => { const a = at(el); return { x: a.l + a.w / 2, y: a.t + a.h / 2 }; };
  const homeSpot = () => { const c = at(coachEl); return { x: c.l + c.w - 4 - W / 2, y: c.t + c.h, s: 1 }; };
  function taskSpot(i, noteAboveCloses, left) {                // standing in the note under task i (left end: rocket launch)
    const m = at(rows[i].querySelector(".rt-main")), r = at(rows[i]);
    const top = m.t - (noteAboveCloses ? NOTE_H : 0);
    const x = left ? r.l + 8 + W * ROW_S / 2 + 30 : r.l + r.w - 10 - W * ROW_S / 2;
    return { x, y: top + m.h + NOTE_H - 6, s: ROW_S };
  }
  const tf = (x, y, sx, sy, rot = 0) => `translate(${(x - W / 2).toFixed(1)}px, ${(y - H).toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
  function place(sp) { spot = sp; mcBtn.style.transform = tf(sp.x, sp.y, sp.s, sp.s); }
  function run(frames, ms, done) {
    const a = mcBtn.animate(frames, { duration: ms });
    anims.push(a);
    a.onfinish = () => { anims = anims.filter(x => x !== a); if (done) done(); };
  }

  // a real jump: crouch, fly on an arc (stretched), land (squashed), settle
  function jump(to, done) {
    const from = spot;
    if (reduce || !from) { place(to); if (done) done(); return; }
    const peak = Math.min(from.y, to.y) - 42 - Math.abs(to.x - from.x) * .08;
    const cy = 2 * peak - (from.y + to.y) / 2;
    const frames = [
      { offset: 0,   transform: tf(from.x, from.y, from.s, from.s) },
      { offset: .14, transform: tf(from.x, from.y, from.s * 1.1, from.s * .86), easing: "cubic-bezier(.3, .6, .4, 1)" },
    ];
    for (let i = 1, K = 14; i <= K; i++) {
      const u = i / K, s = from.s + (to.s - from.s) * u, air = Math.sin(Math.PI * u);
      const x = from.x + (to.x - from.x) * u, y = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * cy + u * u * to.y;
      frames.push({ offset: +(.14 + .72 * u).toFixed(3), transform: tf(x, y, s * (1 - .05 * air), s * (1 + .09 * air)) });
    }
    frames.push({ offset: .93, transform: tf(to.x, to.y, to.s * 1.12, to.s * .86), easing: "ease-out" });
    frames.push({ offset: 1, transform: tf(to.x, to.y, to.s, to.s) });
    busy = true; place(to); run(frames, 860, done);
  }

  /* smoke puffs and confetti */
  function puff(x, y, n = 3, drift = 0) {
    for (let k = 0; k < n; k++) {
      const p = document.createElement("span");
      p.className = "mc-puff"; stage.appendChild(p);
      const dx = (Math.random() - .5) * 16 + drift, dy = (Math.random() - .5) * 10, sc = .7 + Math.random() * .6;
      const a = p.animate([
        { transform: `translate(${x}px, ${y}px) scale(${sc * .4})`, opacity: .95 },
        { transform: `translate(${x + dx}px, ${y + dy - 6}px) scale(${sc * 1.7})`, opacity: 0 },
      ], { duration: 650 + Math.random() * 250, delay: k * 40, easing: "ease-out", fill: "both" });
      a.onfinish = () => p.remove();
    }
  }
  const CONFETTI = ["#5abd90", "#f2c14e", "#ff7b69", "#5aa9ff", "#a78bfa", "#ffd166"];
  function confetti(x, y) {
    for (let k = 0; k < 26; k++) {
      const c = document.createElement("span");
      c.className = "mc-confetti";
      const round = k % 3 === 0, w = round ? 6 : 5, h = round ? 6 : 9;
      Object.assign(c.style, { width: `${w}px`, height: `${h}px`, marginLeft: `${-w / 2}px`, marginTop: `${-h / 2}px`,
        background: CONFETTI[k % CONFETTI.length], borderRadius: round ? "50%" : "1.5px" });
      stage.appendChild(c);
      const ang = (-165 + Math.random() * 130) * Math.PI / 180, v = 150 + Math.random() * 170, g = 620, T = 1.15 + Math.random() * .35;
      const spin = (Math.random() - .5) * 900, frames = [];
      for (let i = 0; i <= 10; i++) {
        const t = T * i / 10;
        frames.push({ transform: `translate(${(x + Math.cos(ang) * v * t).toFixed(1)}px, ${(y + Math.sin(ang) * v * t + g * t * t / 2).toFixed(1)}px) rotate(${(spin * t).toFixed(0)}deg)`,
                      opacity: i < 7 ? 1 : 1 - (i - 7) / 3 });
      }
      const a = c.animate(frames, { duration: T * 1000, easing: "linear", fill: "both" });
      a.onfinish = () => c.remove();
    }
  }

  // blast away from the screen, then come back at the camera and land on the task
  function zoomLines(sp) {
    const el = document.createElement("div");
    el.className = "mc-zoom"; stage.appendChild(el);
    el.style.left = `${(sp.x - 105).toFixed(0)}px`; el.style.top = `${(sp.y - 140).toFixed(0)}px`;
    const a = el.animate([
      { transform: "scale(.22)", opacity: 0 },
      { transform: "scale(.9)", opacity: .95, offset: .35 },
      { transform: "scale(2.6)", opacity: 0 },
    ], { duration: 760, easing: "ease-out" });
    anims.push(a); a.onfinish = () => el.remove();
  }
  const dustLayer = document.createElement("div");
  dustLayer.className = "dust-layer";
  document.querySelector(".device").appendChild(dustLayer);
  function dustStorm() {                                      // lift-off kicks up dust along the bottom of the screen
    if (reduce) return;
    const r = dustLayer.getBoundingClientRect();
    for (let k = 0; k < 24; k++) {
      const d = document.createElement("span");
      d.className = "dust"; dustLayer.appendChild(d);
      const size = 90 + Math.random() * 130, x = Math.random() * r.width - size / 2, y = r.height - size * (.25 + Math.random() * .35);
      Object.assign(d.style, { width: `${size}px`, height: `${size}px` });
      const drift = (Math.random() - .5) * 60, rise = 30 + Math.random() * 70;
      const a = d.animate([
        { transform: `translate(${x}px, ${y + 40}px) scale(.25)`, opacity: 0 },
        { transform: `translate(${x + drift * .4}px, ${y}px) scale(.9)`, opacity: .95, offset: .25 },
        { transform: `translate(${x + drift}px, ${y - rise}px) scale(1.45)`, opacity: 0 },
      ], { duration: 1500 + Math.random() * 700, delay: k * 35, easing: "cubic-bezier(.2, .7, .3, 1)", fill: "both" });
      a.onfinish = () => d.remove();
    }
  }
  function rocketRide(i, launch, to, done) {
    // 1. hop to the left end of the task and climb onto the rocket (seen from the side, as before)
    jump(launch, () => {
      pose("neutral", null);
      setProp("rocket-side");
      puff(launch.x - 36, launch.y - 14, 4, -8);
      later(() => {
        // 2. blast across the row to the right, leaving smoke behind
        const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const ride = [];
        for (let k = 0, K = 12; k <= K; k++) {
          const u = k / K, x = launch.x + (to.x - launch.x) * ease(u), y = launch.y - Math.sin(Math.PI * u) * 8;
          ride.push({ transform: tf(x, y, to.s, to.s, -Math.sin(Math.PI * u) * 5) });
        }
        for (let k = 1; k <= 6; k++) {
          later(() => puff(launch.x + (to.x - launch.x) * ease(k / 7) - 40, launch.y - 12, 1, -10), k * 95);
        }
        place(to);
        run(ride, 720, () => {
          // 3. landed on the task: the rocket turns to face you...
          run([
            { transform: tf(to.x, to.y, to.s, to.s) },
            { transform: tf(to.x, to.y, to.s * .16, to.s * 1.05), offset: .5 },
            { transform: tf(to.x, to.y, to.s, to.s) },
          ], 280);
          later(() => setProp("rocket"), 140);
          later(() => {
            // 4. ...and flies straight at the screen, kicking up dust along the bottom
            dustStorm();
            zoomLines(to);
            const at = [
              { offset: 0, transform: tf(to.x, to.y, to.s, to.s) },
              { offset: .5, transform: tf(to.x, to.y + 34, to.s * 2.6, to.s * 2.6), easing: "cubic-bezier(.3, .6, .4, 1)" },
              { offset: .66, transform: tf(to.x, to.y + 30, to.s * 2.85, to.s * 2.85) },
              { offset: 1, transform: tf(to.x, to.y, to.s, to.s) },
            ];
            run(at, 980, () => { setProp(""); puff(to.x, to.y - 18, 5); done(); });
          }, 300);
        });
      }, 380);
    });
  }
  const device = document.querySelector(".device");
  const crackLayer = document.createElement("div");
  crackLayer.className = "crack-layer"; device.appendChild(crackLayer);
  function breakScreen(cx, cy) {                               // forked cracks spreading from the fist
    const r = device.getBoundingClientRect(), x = cx - r.left, y = cy - r.top, Wd = r.width, Hd = r.height;
    const rnd = (a, b) => a + Math.random() * (b - a), reach = Math.max(Wd, Hd) * .62;
    let d = "", chips = "";
    for (let i = 0, n = 9; i < n; i++) {
      let a = i / n * Math.PI * 2 + rnd(-.2, .2), px = x, py = y;
      const segs = 3 + Math.floor(Math.random() * 3), len = reach * rnd(.4, 1) / segs;
      let path = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      for (let sg = 0; sg < segs; sg++) {
        a += rnd(-.3, .3);
        px += Math.cos(a) * len * rnd(.7, 1.3); py += Math.sin(a) * len * rnd(.7, 1.3);
        path += `L${px.toFixed(1)} ${py.toFixed(1)}`;
        if (sg === 1 && Math.random() < .75) {                 // a branch splits off
          let ba = a + rnd(-1.1, 1.1), bx = px, by = py, bp = `M${px.toFixed(1)} ${py.toFixed(1)}`;
          for (let k = 0; k < 2; k++) { ba += rnd(-.35, .35); bx += Math.cos(ba) * len * rnd(.3, .7); by += Math.sin(ba) * len * rnd(.3, .7); bp += `L${bx.toFixed(1)} ${by.toFixed(1)}`; }
          d += bp;
        }
      }
      d += path;
      const ca = a - rnd(.2, .6), cr = rnd(14, 34);
      chips += `<path class="ck-chip" d="M${x + Math.cos(ca) * cr * .4} ${y + Math.sin(ca) * cr * .4}L${x + Math.cos(ca + .35) * cr} ${y + Math.sin(ca + .35) * cr}L${x + Math.cos(ca - .25) * cr * 1.2} ${y + Math.sin(ca - .25) * cr * 1.2}Z"/>`;
    }
    crackLayer.innerHTML = `<svg viewBox="0 0 ${Wd.toFixed(0)} ${Hd.toFixed(0)}" preserveAspectRatio="none">
        <defs><radialGradient id="ckFlash"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".4" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        <circle class="ck-flash" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(reach * .8).toFixed(0)}" fill="url(#ckFlash)"/>
        <path class="ck-dark" d="${d}"/><path class="ck-light" d="${d}"/>${chips}</svg>`;
    restart(crackLayer, "on");
    restart(device, "shook");
  }
  function punch() {
    restart(mc, "punch");
    later(() => {                                              // at the moment the glove lands
      const g = mc.querySelector(".p-glove").getBoundingClientRect();
      if (!reduce) breakScreen(g.left + g.width / 2, g.top + g.height / 2);
      restart(taskCard, "jolt");
    }, 155);
  }

  function pose(mood, row) {                                  // Jamol's official poses; he turns toward the list
    mc.dataset.mood = mood;
    rows.forEach(r => r.classList.remove("look-done", "look-prog", "look-wait"));
    if (!reduce) restart(mHop, "hop");
    mc.dataset.face = row == null && mood !== "point" ? "front" : "left";
    if (row != null) rows[row].classList.add(`look-${status[row]}`);
  }

  function closeNote() {
    if (openNote < 0) return;
    rows[openNote].classList.remove("visit", "said");
    openNote = -1;
  }
  function lineFor(i, doneSeen) {
    const n = TASKS[i].name, st = status[i];
    if (st === "done") return doneSeen ? `${n} is done too. Great work!` : `${n} is done. Well done!`;
    if (st === "prog") return `${n} is in progress. <strong>KEEP GOING!</strong>`;
    if ((st === "tried" || st === "skip") && window.JG_ENGINE && window.JG_ENGINE.endLine) return window.JG_ENGINE.endLine(st, n); return window.JG_ENGINE && JG_ENGINE.gentle && JG_ENGINE.gentle() ? `Ready for ${n}? Let's start.` : `Hey! ${n} is still waiting for you!`;   /* JG-PROD: owner 10 Oct (delegated call, teen walk), a tried or a skipped task is not "still waiting": the coach says what it is, kindly (the runtime's line); and (the same call, the shell lane) no reminder in a real student's first 24 hours after sign-up, and none before 18:00 Tashkent on later days: Jamol says his own line for what is next (settle's) */
  }
  const plain = html => html.replace(/<[^>]+>/g, "");

  function settle() {                                           // back home: point at what's next
    busy = false; setProp("");
    const p = status.indexOf("prog"), w = status.indexOf("wait");
    const again = "Tap me to go through today again.";
    if (p >= 0) { pose("point", p); say(`Let's finish ${TASKS[p].name} first.`, again); }
    else if (w >= 0) { pose("point", w); say(`Ready for ${TASKS[w].name}? Let's start.`, again); }
    else { pose("happy", null); say((window.JG_ENGINE && window.JG_ENGINE.dayLine && window.JG_ENGINE.dayLine()) || "Everything is done today. Amazing work!", again); }   /* JG-PROD: owner 10 Oct (delegated call, teen walk), "Amazing work!" only for a day whose bonus is earned (nothing open, at least half really done); else the coach says how many were done */
  }
  function appear() {
    if (reduce) return;
    restart(mcBtn, "in");
  }
  function goHome() {
    closeNote(); setProp("");
    pose("neutral", null);
    jump(homeSpot(), settle);
  }

  // act it out once the coach has landed at task i
  function act(i, doneSeen) {
    const st = status[i], next = () => visit(i + 1, doneSeen + (st === "done" ? 1 : 0));
    rows[i].classList.add("said");
    tell(plain(lineFor(i, doneSeen)));
    if (st === "done") {
      setProp("party"); pose("happy", i, true);
      later(() => { const m = at(mcBtn); confetti(m.l + m.w / 2, m.t + m.h * .22); }, 380);
      later(next, 2300);
    } else if (st === "prog") {
      setProp("mega"); pose("shout", i, true);
      later(() => restart(device, "loud"), 260);                // everything on screen trembles from the noise
      later(() => device.classList.remove("loud"), 2050);
      later(next, 2300);
    } else if (st === "tried" || st === "skip") { pose("neutral", i); later(next, 2100); } else {   /* JG-PROD: owner 10 Oct (delegated call, teen walk), no punch at a task that was tried or skipped: the coach says its line and goes on */
      if (window.JG_ENGINE && JG_ENGINE.gentle && JG_ENGINE.gentle()) { pose("point", i); later(next, 1700); return; } setProp("punch"); pose("angry", i, true);   /* JG-PROD: owner 10 Oct (delegated call, teen walk), no boxing glove and no cracked glass in a real student's first 24 hours after sign-up, and none before 18:00 Tashkent on later days: Jamol points at the task and goes on */
      later(punch, 450); later(punch, 1150);
      later(next, 2400);
    }
  }
  function visit(i, doneSeen) {
    if (i >= TASKS.length) return goHome();
    const closes = openNote >= 0 && openNote < i;
    const target = taskSpot(i, closes, false);
    closeNote(); setProp("");
    rows[i].classList.add("visit");
    openNote = i;
    const bubble = rows[i].querySelector(".rt-bubble");
    bubble.innerHTML = lineFor(i, doneSeen);
    bubble.dataset.tone = status[i];
    pose("neutral", null);
    if (status[i] === "done") rocketRide(i, taskSpot(i, closes, true), target, () => act(i, doneSeen));
    else jump(target, () => act(i, doneSeen));
  }
  function walkThrough() {
    stopCoach(); closeNote(); setProp("");
    place(homeSpot()); appear();
    pose("neutral", null);
    say(`Hi ${NAME}! Let's look at your day.`);
    busy = true;
    if (reduce) { later(settle, 1200); return; }
    later(() => { say("Let's go through your tasks."); visit(0, 0); }, 1500);
  }
  mcBtn.addEventListener("click", () => { if (!busy) walkThrough(); else { stopCoach(); closeNote(); place(homeSpot()); settle(); } }); list.addEventListener("click", e => { const i = rows.indexOf(e.target.closest(".rt-row")); if (i < 0 || !TASKS[i].jt || !window.JG_API || !JG_API.openTask) return; if (busy) { stopCoach(); closeNote(); place(homeSpot()); settle(); } JG_API.openTask(i); }); rows.forEach((r, i) => { if (TASKS[i].jt) r.style.cursor = "pointer"; });   /* JG-PROD: owner 4 Oct R1, taps work during Jamol's tour: a tap on him ends it (after it, a tap replays the day, as drawn), and a tap on one of today's tasks opens its sheet, the one its Home tile opens */
  window.addEventListener("resize", () => { if (!page.hidden && !busy) place(homeSpot()); });

  // the numbers count up each time the page opens
  function countUp() {
    if (reduce) return;
    const t0 = performance.now(), dur = 2000;                  // climbs from zero over a couple of seconds
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      statEls.forEach(el => { el.textContent = Math.round(NUMS[el.dataset.stat] * e); });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // opening the page: numbers count up; the coach walks through the day the first time, after that it just says what's next
  let wasShown = false;
  new MutationObserver(() => {
    const shown = page.classList.contains("show"); if (shown && !wasShown && window.JG_ENGINE && window.JG_ENGINE.cache.totals) { const T = window.JG_ENGINE.cache.totals; NUMS.total = T.tasks; NUMS.done = Math.min(T.completed, T.tasks); NUMS.left = NUMS.total - NUMS.done; if (reduce) statEls.forEach(el => { el.textContent = NUMS[el.dataset.stat]; }); } if (shown && !wasShown && jgRows()) { paintRows(); pills.splice(0, pills.length, ...list.querySelectorAll(".rt-pill")); rows.splice(0, rows.length, ...list.querySelectorAll(".rt-row")); status.splice(0, status.length, ...TASKS.map(() => "wait")); rows.forEach((r, i) => { if (TASKS[i].jt) r.style.cursor = "pointer"; }); } if (shown && !wasShown && window.JG_ENGINE && TASKS[0] && TASKS[0].jt) show(0);   /* JG-PROD: S24, opening the page re-reads each task's own state (a Study Room session may have started or ended since), so the pills and the coach follow; the level is unused for task rows; P4d re-walk F1 (owner 4 Oct R1 R11), and today's tasks themselves: the ones the first run made in this page replace the design's sample rows before the pills, the totals and Jamol read them; P4d re-walk F7, the totals too (the server's all-time required tasks, Q9) */
    if (shown && !wasShown) {
      const real = !window.JG_ENGINE || !!(TASKS[0] && TASKS[0].jt), fresh = !seenOnce && real && (!window.JG_MOTION || JG_MOTION.onceToday("today")); if (fresh || !window.JG_MOTION) countUp(); else statEls.forEach(el => { el.textContent = NUMS[el.dataset.stat]; });   /* JG-PROD: owner 4 Oct R1, the numbers count up and Jamol tours the day on the day's first Today open per account (jg.seen.v1); later opens show the numbers and what's next; P4d re-walk F1, a real student's tour waits for his own rows: it never spends the day's once on the design's sample rows */
      place(homeSpot());
      if (fresh) { seenOnce = true; later(walkThrough, 250); }   /* JG-PROD: owner 4 Oct R1, once a day */
      else { if (real) seenOnce = true; appear(); later(settle, 300); }   /* JG-PROD: owner 4 Oct R1, once a day; P4d re-walk F1, not before his own rows */
    }
    if (!shown && wasShown) { stopCoach(); closeNote(); }
    wasShown = shown;
  }).observe(page, { attributes: true, attributeFilter: ["class"] });
})();
