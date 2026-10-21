
(() => {
  "use strict";

  /* ==========================================================
     ROADMAP — edit the goal, stages and curves here.
     ========================================================== */
  let GOAL = "MIT", YEAR = 2029;   /* JG-PROD: owner 3 Oct R14, a real student's goal replaces the design's MIT (syncGoal) */
  // Universities along the way: at each readiness level the student is in range for that one, and MIT stays the goal.
  // Levels are placeholders for the admissions team to set. Photos: Wikimedia Commons (credits below the chart).
  const STATIONS = [
    { at: 50,  key: "purdue",  short: "Purdue",  name: "Purdue University", img: "/d/student-mobile/media/027b66086c49e7a2.webp",
       credit: ["Purdue Bell Tower", "Julian Herzog", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Purdue_Bell_Tower_Purdue_University_2016_01.jpg"] },
    { at: 85,  key: "harvard", short: "Harvard", name: "Harvard University", img: "/d/student-mobile/media/fbb6fd0e9131f2c4.webp",
       credit: ["Widener Library, Harvard University", "Kenneth C. Zirkel", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Widener_Library,_Harvard_University.jpg"] },
    { at: 100, key: "mit",     short: "MIT",     name: "MIT", goal: true, img: "/d/student-mobile/media/943c6acbf1356f68.webp",
       credit: ["Maclaurin Buildings and Great Dome", "Beyond My Ken", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:2017_Maclaurin_Buildings_(MIT_Building_10)_and_Great_Dome.jpg"] },
  ]; function syncGoal() { if (!window.JG_ENGINE) return; const g = window.JG_ENGINE.cache && window.JG_ENGINE.cache.goal, img = k => (k.photo ? `/d/student-mobile/media/${k.photo}` : window.JG_RUNTIME && window.JG_RUNTIME.initialsSvg ? window.JG_RUNTIME.initialsSvg(k.short) : ""), U = window.JG_ENGINE.cache && window.JG_ENGINE.cache.unis_uz, mids = ((U && U.mid) || []).map((u, j, a) => ({ uz: true, at: 101, mid: a.length > 1 ? [.075, .267][j] : .15, key: u.key, short: u.short, name: u.name, img: img(u), credit: u.credit, ok: u.verdict === "ready", lab: u.lab || U.ui["station." + u.verdict], line: u.line, open: U.ui["station.open"], pct: typeof u.pct === "number" ? u.pct : null })); GOAL = g ? g.short : "University"; YEAR = g ? g.year : null; STATIONS.splice(0, STATIONS.length, ...mids, { at: 100, key: g ? g.key : "goal", short: GOAL, name: g ? g.name : "Your university", goal: true, img: img(g || { short: "University" }), credit: g ? g.credit : null }); Object.assign(STAGES[STAGES.length - 1], { short: GOAL, title: `Admission to ${g ? g.name : "your university"}`, target: YEAR ? `Your goal for ${YEAR}` : "Your goal" }); if (window.JG_ENGINE.stages) window.JG_ENGINE.stages(STAGES); const cl = $("rm-credits-list"); if (cl) cl.innerHTML = STATIONS.filter(st => st.credit).map(st => (Array.isArray(st.credit) ? `<a href="${st.credit[3]}" target="_blank" rel="noopener">${st.credit[0]}</a> by ${st.credit[1]}, ${st.credit[2]}` : `Photo: ${st.credit}`)).join("<br>") + (STATIONS.some(st => st.credit) ? "<br>Via Wikimedia Commons, cropped." : ""); }   /* JG-PROD: owner 3 Oct R14, the goal station, stage and photo credit from the student's own goal; the design's Purdue and Harvard stops are its placeholders (M003:10), so a real student has none */   /* JG-PROD: owner 4 Oct R4, the middle of the chart holds at most 2 Uzbek universities (engine snapshot unis_uz.mid) with an honest verdict, never a readiness level */   /* JG-PROD: owner 4 Oct P4g fix K6, the Uzbek stops within the first quarter of the axis (Inha stood at 58 %), 7.5 % and 27 % on the phone, 9 % and 25 % on the desktop, one stop at 15 % */ /* JG-PROD: owner 4 Oct P4g S2 M, "CAU, Inha … at the very start of the map": the Uzbek stops are the first after Start (0.3 and 0.58 of the way along), no longer in the middle */   /* JG-PROD: owner 7 Oct P5 fix map, each Uzbek stop carries its own chance (unis_uz.mid pct: the number its own page shows; null with none), where the map stands it */   /* JG-PROD: owner 10 Oct (delegated call, teen walk), the label over a home stop says what that university still asks of him (the server's words), not a bare "Not yet" */   /* JG-PROD: owner 20 Oct 2026 (M1 core 5): the stage dots between Start and the goal are her own stored steps with their dates (public/runtime/jg-core.js), not the design's samples "SAT 1500+", "IELTS 7.5+", "CAC", "AP 4 to 5" */

  // One entry per milestone, from stage 0 (start) to the goal.
  const STAGES = [
    { short: "Start",     title: "Take the diagnostic", target: "Find your starting point" },
    { short: "CAC",       title: "CAC",                 target: "Milestone details to be added" },
    { short: "SAT",       title: "SAT",                 target: "Suggested target: 1500+" },
    { short: "IELTS",     title: "IELTS Academic",      target: "Suggested target: 7.5+" },
    { short: "AP",        title: "AP exams",            target: "Suggested: 4 to 5 in Math and Science" },
    { short: "Olympiads", title: "Olympiads",           target: "Show depth in Math or Science" },
    { short: GOAL,        title: "Admission to MIT", target: "Your goal for 2029" },
  ];
  const LAST = STAGES.length - 1;

  // [stage, readiness %] — smoothed, never straight, only ever rising.
  const PRED = [[0,0],[.5,5],[1,10],[1.5,14],[2,24],[2.5,31],[3,40],[3.5,46],[4,57],[4.5,65],[5,78],[5.5,90],[6,100]];
  // Sample "after diagnostic" data: measured progress, then an updated forecast.
  const ACT  = [[0,0],[.4,3],[.9,8],[1.4,13],[2,26],[2.6,37],[3,44],[3.4,50]];
  const FCST = [[3.4,50],[4,59],[4.5,66],[5,78],[5.5,89],[6,100]];

  const GREEN = "#2b9067", FOREST = "#123a29";

  /* ---------- geometry ---------- */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const W = 300, H = 268;
  const X0 = 30, X1 = 266, Y0 = 228, Y1 = 78, LABEL_Y = 250;
  const sx = x => X0 + (X1 - X0) * x / LAST;
  const yTop = () => { const c = window.JG_ENGINE && window.JG_ENGINE.cache && window.JG_ENGINE.cache.ready; return window.JG_ENGINE && window.JG_ENGINE.mapTop ? window.JG_ENGINE.mapTop() : c && c.cap ? c.cap : 100; }, sy = v => Y0 - (Y0 - Y1) * v / yTop();   /* JG-PROD: owner 4 Oct P4g fix K6, a real student's chart is drawn to the readiness cap (70, "nobody above 70%"), so its top line is the cap; the demo and a student before a result keep 100 */   /* JG-PROD: owner 7 Oct P5 fix map, the axis's top from JG_ENGINE.mapTop: the cap, raised to the next ten above a stop whose chance passes it, so every stop stands at its own number */
  const $  = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* Monotone cubic spline: smooth through the points, never dips, never overshoots. */
  function spline(pts) {
    const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const dx = [], m = [], t = new Array(n);
    for (let i = 0; i < n - 1; i++) { dx[i] = xs[i+1] - xs[i]; m[i] = (ys[i+1] - ys[i]) / dx[i]; }
    t[0] = m[0]; t[n-1] = m[n-2];
    for (let i = 1; i < n - 1; i++) {
      if (m[i-1] * m[i] <= 0) t[i] = 0;
      else t[i] = 3 * (dx[i-1] + dx[i]) / ((2*dx[i] + dx[i-1]) / m[i-1] + (dx[i] + 2*dx[i-1]) / m[i]);
    }
    return x => {
      let i = 0;
      while (i < n - 2 && x > xs[i+1]) i++;
      const h = dx[i], s = clamp((x - xs[i]) / h, 0, 1), s2 = s*s, s3 = s2*s;
      return (2*s3 - 3*s2 + 1) * ys[i] + (s3 - 2*s2 + s) * h * t[i]
           + (-2*s3 + 3*s2) * ys[i+1] + (s3 - s2) * h * t[i+1];
    };
  }
  const pathOf = (f, a, b, n = 110) => {
    let d = "";
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(f(x)).toFixed(1)} `; }
    return d;
  };
  const areaOf = (f, a, b) => `${pathOf(f, a, b)}L${sx(b).toFixed(1)} ${Y0} L${sx(a).toFixed(1)} ${Y0}Z`;

  const fPred0 = spline(PRED), fPred = x => { if (window.JG_ENGINE && window.JG_ENGINE.unscaled && window.JG_ENGINE.unscaled()) return yTop() / 4; const c = window.JG_ENGINE && window.JG_ENGINE.cache.ready, r = c ? c.value : 0, t = c && c.plan != null ? c.plan : c && c.display === "chance" ? r : c && c.cap ? c.cap : 100; return r + (t - r) * fPred0(x) / 100; }, fAct = spline(ACT), fFc = spline(FCST);   /* JG-PROD: P4d re-walk F8, a real student's predicted path starts at his measured readiness, so the "You're here" pin at Start sits at the % it is labelled with; the design's curve, from there to 100 at the goal (before a result, and the demo: from 0, as drawn); owner 4 Oct R14r, that readiness is his "% ready" (the engine's v2: what his goal requires that he has in hand), no longer the card's overall */   /* JG-PROD: owner 4 Oct P4g S2 M, "nobody above 70%": a real student's path rises to the readiness cap (ready.cap, 70), never to 100 */   /* JG-PROD: owner 7 Oct P5d, v4: his path ends at his chance "if you complete the plan" (spec §3.8), not at the cap */   /* JG-PROD: owner 7 Oct P5 fix map, with no number for his goal (S1, whose chance is withheld; a chance not published) the path is flat, no forecast rising on a scale (spec §3.8: S1 shows no chance) */   /* JG-PROD: owner 10 Oct (delegated call, teen walk), a goal with a number and no plan figure: the path stays at his number, it no longer rises to the cap */

  /* ---------- chart skeleton ---------- */
  const svg = $("chart");
  const gridOf = () => [0, 25, 50, 75, 100].map(p => p * yTop() / 100).filter(() => !(window.JG_ENGINE && window.JG_ENGINE.unscaled && window.JG_ENGINE.unscaled())).map((v, k) =>   /* JG-PROD: owner 4 Oct P4g fix K6, the grid follows the top: its labels read 0/35/70 for a real student (they read 0/50/100 while everything stops at 70) */   /* JG-PROD: owner 4 Oct P4g fix K6 review, the grid is a function, drawn again when his "% ready" or its cap arrives in the page (regrid, M003:206), as the desktop's skeleton() is */   /* JG-PROD: owner 7 Oct P5 fix map, no grid and no 0/35/70 when his goal has no number: no % scale at all */
    `<line class="grid-line" x1="${X0}" x2="${X1 + 10}" y1="${sy(v)}" y2="${sy(v)}"/>` +
    (k % 2 === 0 ? `<text class="ylab" x="4" y="${sy(v) + 3}">${v}</text>` : "")).join(""), grid = gridOf();   /* JG-PROD: owner 4 Oct P4g fix K6, every other line labelled, as drawn */   /* JG-PROD: owner 4 Oct P4g fix K6 review, the grid drawn at load */

  svg.innerHTML = `
    <defs>
      <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GREEN}" stop-opacity=".22"/><stop offset="1" stop-color="${GREEN}" stop-opacity="0"/></linearGradient>
      <linearGradient id="gForest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${FOREST}" stop-opacity=".16"/><stop offset="1" stop-color="${FOREST}" stop-opacity="0"/></linearGradient>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d9f5"/><stop offset="1" stop-color="#f6f0e2"/></linearGradient>
      <linearGradient id="domeShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
      <filter id="sh" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#123a28" flood-opacity=".28"/></filter>
      <clipPath id="stClipS"><circle r="13"/></clipPath><clipPath id="stClipL"><circle r="21"/></clipPath>
      <clipPath id="youClip"><circle cx="0" cy="-27" r="10.4"/></clipPath>
      <clipPath id="cPred"><rect id="rPred" x="0" y="0" width="0" height="${H}"/></clipPath>
      <clipPath id="cAct"><rect id="rAct" x="0" y="0" width="0" height="${H}"/></clipPath>
    </defs>
    <text class="ylab" x="4" y="${Y1 - 22}">${window.JG_ENGINE && window.JG_ENGINE.unscaled && window.JG_ENGINE.unscaled() ? "" : ((window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance()) || {}).axis || "% ready"}${"" /* JG-PROD: owner 7 Oct P5 fix map, no "% chance" caption when his goal has no number (S1, a chance not published): the map has no % scale then */}${"" /* JG-PROD: owner 7 Oct P5d, the chart's unit is his chance (owner decision 1) */}</text>
    ${window.JG_ENGINE ? `<g id="ygrid">${grid}</g>` : grid}${"" /* JG-PROD: owner 4 Oct P4g fix K6 review, a real student's grid in its own group, so it can be drawn again; the demo's as drawn */}
    <g clip-path="url(#cPred)"><path id="predArea" fill="url(#gGreen)"/><path id="predLine" class="pred"/></g>
    <g clip-path="url(#cAct)"><path id="actArea" fill="url(#gForest)"/><path id="actLine" class="act"/></g>
    <line id="guide" x1="0" x2="0" y1="0" y2="0"/>
    <g id="nodes"></g>
    <g id="labels"></g>

    <g id="stations"></g>

    <circle id="head" r="4.5" cx="0" cy="0" fill="${GREEN}" style="color:${GREEN};opacity:0"/>
    <g id="you" class="you-pin" style="opacity:0;pointer-events:none">
      <ellipse cx="0" cy="0" rx="7" ry="2.4" fill="#123a28" opacity=".18"/>
      <circle class="ping" r="6" fill="${GREEN}"/>
      <g class="pin-body" filter="url(#sh)">
        <path d="M0 0C-3.4-5-13-11.5-13-27a13 13 0 0 1 26 0C13-11.5 3.4-5 0 0z" fill="${FOREST}"/>
        <circle cx="0" cy="-27" r="11.2" fill="#fff"/>
        <image id="youPhoto" x="-10.4" y="-37.4" width="20.8" height="20.8" clip-path="url(#youClip)" preserveAspectRatio="xMidYMid slice"/>
      </g>
    </g>
    <g id="tip" class="tip">
      <rect x="0" y="0" width="64" height="30" rx="10" fill="${FOREST}"/>
      <path d="M27 30h10l-5 6z" fill="${FOREST}"/>
      <text x="32" y="12.5" text-anchor="middle" font-size="8.6" font-weight="700" fill="#a8dcc1">You're here</text>
      <text id="tipA" x="32" y="24" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fff"></text>
    </g>
    <g id="callout" class="callout">
      <rect id="coBox" rx="10" height="38" fill="#fff" stroke="#dce6df" filter="url(#sh)"/>
      <text id="coA" font-size="10.5" font-weight="700" fill="#102a1e"></text>
      <text id="coB" font-size="9" font-weight="500" fill="#5c6d62"></text>
    </g>`;

  const photoUrl = (getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo") || "").trim().replace(/^url\((['"]?)(.*)\1\)$/, "$2");
  if (photoUrl) $("youPhoto").setAttribute("href", photoUrl);
  const nodesG = $("nodes"), labelsG = $("labels");
  // Time axis: the path runs from today to 2029. Milestone names live in the dots' callouts.
  let DATES = []; const yearTicks = () => (window.JG_ENGINE && YEAR ? [["Start", 0], ...[[YEAR - 2, LAST / 3], [YEAR - 1, LAST * 2 / 3], [YEAR, LAST]].filter(([y]) => y === YEAR || y > new Date().getFullYear()).map(([y, x]) => [String(y), x])] : [["Start", 0], ["2027", LAST / 3], ["2028", LAST * 2 / 3], ["2029", LAST]]);   /* JG-PROD: owner 3 Oct R14, the axis ends on the goal's year (YEAR - 2, YEAR - 1, YEAR; a year not after this one is left off, "Start" is today); the design's 2027-2029 without an engine or a goal */
  const paintDates = () => { labelsG.innerHTML = (DATES = yearTicks()).map(([t, x], k) =>   /* JG-PROD: owner 3 Oct R14, drawn again when the goal changes */
    `<line class="xtick" x1="${sx(x)}" x2="${sx(x)}" y1="${Y0}" y2="${Y0 + 5}"/>` +
    `<text class="lbl${k === DATES.length - 1 ? " goal" : ""}" x="${sx(x)}" y="${LABEL_Y}" text-anchor="middle">${t}</text>`).join(""); }; paintDates();   /* JG-PROD: owner 3 Oct R14 */
  const labels = [];

  /* ---------- state ---------- */
  const card = $("rm"), eye = $("eye");
  let mode = "new", youX = 0, f = fPred, selected = -1, revealed = -1, token = 0, nodeEls = [], isOpen = false;

  /* ---------- callout on tap ---------- */
  function clearSel() {
    selected = -1;
    nodeEls.forEach(g => g.classList.remove("sel"));
    labels.forEach(l => l.classList.remove("sel"));
    $("guide").classList.remove("on");
    $("callout").classList.remove("on");
  }

  function select(i) {
    if (selected === i) return clearSel();
    selected = i;
    nodeEls.forEach((g, k) => g.classList.toggle("sel", k === i));
    labels.forEach((l, k) => l.classList.toggle("sel", k === i));

    const nx = sx(i), ny = sy(f(i));
    const g = $("guide");
    g.setAttribute("x1", nx); g.setAttribute("x2", nx);
    g.setAttribute("y1", ny + 8); g.setAttribute("y2", Y0);
    g.classList.add("on");

    const s = STAGES[i];
    const a = $("coA"), b = $("coB");
    a.textContent = window.JG_I18N ? window.JG_I18N.text(s.title) : s.title; b.textContent = window.JG_I18N ? window.JG_I18N.text(s.target) : s.target;   /* JG-PROD: owner 6 Oct P4h fix W6: the callout is measured in the student's language (public/runtime/jg-i18n.js); the demo has no JG_I18N */
    const w = Math.ceil(Math.max(a.getComputedTextLength(), b.getComputedTextLength())) + 22, h = 38;

    let x = clamp(nx - w / 2, 4, W - 4 - w);
    let y = i === LAST ? ny + 16 : ny - h - 14;          // the goal has the picture above it, so go below
    if (y < 4) y = ny + 16;
    // stay clear of the "You're here" tag
    const tip = $("tip");
    if (tip.classList.contains("on")) {
      const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(tip.getAttribute("transform") || "");
      if (m) {
        const tx = +m[1], ty = +m[2];
        if (x < tx + 66 && x + w > tx - 2 && y < ty + 80 && y + h > ty - 2) y = ty - h - 4;
      }
    }
    $("coBox").setAttribute("x", x); $("coBox").setAttribute("y", y); $("coBox").setAttribute("width", w);
    a.setAttribute("x", x + 11); a.setAttribute("y", y + 16);
    b.setAttribute("x", x + 11); b.setAttribute("y", y + 29);
    $("callout").classList.add("on");
  }

  function buildNodes() {
    nodesG.innerHTML = "";
    nodeEls = STAGES.map((s, i) => {
      const g = document.createElementNS(NS, "g");
      const reached = mode === "diag" ? i <= youX + 1e-6 : i === 0;
      g.setAttribute("class", "node");
      g.setAttribute("transform", `translate(${sx(i)} ${sy(f(i)).toFixed(1)})`);
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.setAttribute("aria-label", `${s.short}: ${s.title}`);
      g.innerHTML = `<circle class="halo" r="11.5"/><circle class="dot${reached ? " done" : ""}${i === LAST ? " goal" : ""}" r="${i === LAST ? 6.5 : 5}"/><circle class="hit" r="16"/>`;
      g.addEventListener("click", () => select(i));
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); } });
      nodesG.appendChild(g);
      return g;
    });
  }

  /* ---------- stations: universities along the way, MIT at the end ---------- */
  const stationsG = $("stations");
  window.JIA_UNI = Object.fromEntries(STATIONS.map(st => [st.key, st.img]));
  $("rm-goal-txt").addEventListener("click", e => { const b = e.target.closest("[data-app]"); if (b && window.JIA_openApps) window.JIA_openApps(b.dataset.app); });
  if (window.JG_ENGINE) { syncGoal(); paintDates(); const regrid = () => { const g = $("ygrid"), ch = $("chart"), yc = ch && ch.querySelector && ch.querySelector(".ylab"); if (g) g.innerHTML = gridOf(); if (yc) yc.textContent = window.JG_ENGINE.unscaled && window.JG_ENGINE.unscaled() ? "" : ((window.JG_ENGINE.chance && window.JG_ENGINE.chance()) || {}).axis || "% ready"; }; document.addEventListener("jg:goal", () => { const g = window.JG_ENGINE.cache && window.JG_ENGINE.cache.goal, ch = $("chart"); syncGoal(); paintDates(); regrid(); if (ch) ch.setAttribute("aria-label", `Line chart of readiness rising from where you are to ${g ? g.short : "university"}${g ? ` by ${g.year}` : ""}`); prepare(mode); if (isOpen) play(); }); let rk = ""; const rKey = () => { const c = window.JG_ENGINE.cache || {}, U = c.unis_uz; return [c.ready ? c.ready.value : "", c.ready ? c.ready.cap : "", ...((U && U.mid) || []).map(u => u.key + u.verdict + u.pct)].join(); }; rk = rKey(); document.addEventListener("jg:snapshot", () => { const k = rKey(); if (k === rk) return; rk = k; const s = $("rm-sub"), t = s && s.textContent; regrid(); prepare(mode); if (s) s.textContent = t; if (isOpen) play(); }); } else $("rm-credits-list").innerHTML = STATIONS.map(st => `<a href="${st.credit[3]}" target="_blank" rel="noopener">${st.credit[0]}</a> by ${st.credit[1]}, ${st.credit[2]}`).join("<br>") + "<br>Via Wikimedia Commons, cropped.";   /* JG-PROD: owner 3 Oct R14, a real student's goal and its photo credit, and the axis at the goal's year; on "jg:goal" (paintHome, M023:643: a diagnostic finished in this page) the goal, the axis, the chart's label and the drawing follow */   /* JG-PROD: owner 4 Oct P4g S2 M, a newer snapshot with another "% ready" (or other Uzbek stops) draws the chart again: the owner's screenshot read "81% ready" on the tag and the KPI beside "You're 61% of the way there" and a pin at 61, the chart drawn before the value changed in the page; the line under the title stays what Home wrote (paintHome's "Stage S4 · 3 routes planned") */   /* JG-PROD: owner 4 Oct P4g fix K6 review, the y-axis grid follows a newer "% ready" too: drawn once at load, a student who finished his diagnostic on this page read a 35 % point on the line labelled "50" (0/50/100 under a cap of 70) until he reloaded */   /* JG-PROD: owner 7 Oct P5 fix map, the caption is drawn again with the grid (a goal with a number gets its "% chance", one without loses it); a stop whose chance moves (pct) draws the chart again too */
  const xAt = (fn, v) => {                                       // where the path reaches v%
    let lo = 0, hi = LAST;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; fn(m) < v ? lo = m : hi = m; }
    return (lo + hi) / 2;
  };
  function buildStations() { syncGoal(); const tipY = sy(f(youX)) - 80, upY = tipY - 21.4, up = !!window.JG_ENGINE && upY - 35 >= 2, capRows = up && upY > 34.2 && upY < 92.7, uzPx = new Map(), onAxis = !!(window.JG_ENGINE && window.JG_ENGINE.unscaled && !window.JG_ENGINE.unscaled() && window.JG_ENGINE.chance && window.JG_ENGINE.chance()), pinY = sy(f(youX)), capEnd = onAxis ? 4 + ((t => (t && t.getComputedTextLength ? t.getComputedTextLength() : 39))($("chart").querySelector(".ylab"))) : 0; STATIONS.filter(s => s.uz).reduce((p, s) => { const w = Math.max(31, String(s.short).length * 5.3, String(s.lab || "").length * 4.7), cy = onAxis ? (s.pct != null ? sy(s.pct) : Y1 - 40) : null, hit = (a, b) => cy - 37 < b && cy + 15.4 > a, px = Math.max(sx(s.mid * LAST), capRows && !onAxis ? 43 + w / 2 : 0, p ? p.px + (p.w + w) / 2 + 6 : 0, onAxis && hit(tipY - 2, pinY + 4) ? 84 + w / 2 : 0, onAxis && hit(Y1 - 32, Y1 - 18) ? capEnd + 4 + w / 2 : 0); uzPx.set(s, px); s.cy = cy; s.off = onAxis && s.pct == null; return { px, w }; }, null);   /* JG-PROD: owner 3 Oct R14, the goal as it is now (a diagnostic finished since the page loaded) */ /* JG-PROD: owner 4 Oct P4g fix K6, the Uzbek stops at the start stand in a row above the "You're here" tag (upY), never over it or the Start pin; when the tag stands too high for that (a high readiness), below the path, where there is room then; the first stop right of the "% ready" caption when their rows meet, and each next one clear of the one before (their names and verdicts measured by their length) */   /* JG-PROD: owner 7 Oct P5 fix map, on a % scale (his goal has a number) an Uzbek stop with a number stands at it (its badge's centre, cy = sy(pct)), one without stands above the plot, off the axis (Y1 - 40); either one moves right of the "You're here" tag and pin, and of the caption, when it meets them (the wave-2 walk: CAU 35 (9-70) was drawn near 60) */
    stationsG.innerHTML = STATIONS.map((st, i) => {
      const x = st.goal ? LAST : st.uz ? (uzPx.get(st) - X0) * LAST / (X1 - X0) : xAt(f, st.at),   /* JG-PROD: owner 4 Oct R4, an Uzbek stop sits at a fixed place; owner 4 Oct P4g S2 M, at the start of the map; owner 4 Oct P4g fix K6, where buildStations placed it (uzPx) */ px = sx(x), py = sy(f(x));
      const r = st.goal ? 21 : 13, bx = px, by = st.goal ? py - 36 : st.uz ? (st.cy != null ? st.cy : up ? Math.min(py - 27, upY) : py + 27) : py + 27;   // the goal stands above the end, stops sit just below the path   /* JG-PROD: owner 4 Oct P4g S2 M, an Uzbek stop at the start stands above the path (below it, at a low readiness, is the axis), its name and verdict over its badge */   /* JG-PROD: owner 4 Oct P4g fix K6, above the tag when there is room, else below the path */   /* JG-PROD: owner 7 Oct P5 fix map, where buildStations stood it on the scale (cy) */
      st.px = px; st.py = py; st.x = x;
      return `<g class="station${st.goal ? " goal" : ""}" data-i="${i}" tabindex="0" role="button" aria-label="${st.uz ? `${st.name}: ${st.line}` : st.goal && window.JG_ENGINE ? `${st.name}: your goal, ${chance() ? chance().label : `${readiness()}% ready`}` : `${st.name}: in range at ${st.at}% ready`}">${"" /* JG-PROD: owner 4 Oct R4, an Uzbek stop is read out with its verdict */}${"" /* JG-PROD: owner 4 Oct P4g fix K6, the goal is read out with his real "% ready", not "in range at 100% ready" */}${"" /* JG-PROD: owner 7 Oct P5d, read out with his chance (owner decision 1) */}
          <line class="st-stem" x1="${px}" y1="${st.cy != null ? (st.off ? st.cy + r : Y0) : py}" x2="${bx}" y2="${st.cy != null ? (st.off ? st.cy + r : Math.min(Y0, by + r)) : st.goal || (st.uz && by < py) ? by + r : by - r}"/>${"" /* JG-PROD: owner 7 Oct P5 fix map, a stop on the scale is read down to the axis; one off it has no stem */}${"" /* JG-PROD: owner 4 Oct P4g S2 M, an Uzbek stop's stem rises from the path */}${"" /* JG-PROD: owner 4 Oct P4g fix K6, the stem meets the badge on its path side */}
          <g class="st-badge" transform="translate(${bx} ${by})">
            <circle class="st-ring" r="${r + 2.4}"${st.off ? ' stroke-dasharray="3 2.4"' : ""}/>${"" /* JG-PROD: owner 7 Oct P5 fix map, a stop off the axis has a dashed ring: not on the scale */}
            <image href="${st.img}" x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" clip-path="url(#stClip${st.goal ? "L" : "S"})" preserveAspectRatio="xMidYMid slice"/>
            <g class="st-ok" transform="translate(${r * .72} ${-r * .72})"><circle r="5.2"/><path d="M-2.3 .1l1.5 1.5 3-3.1"/></g>
          </g>
          <text class="st-name" x="${bx}" y="${st.goal ? by - r - 7 : st.uz && (st.cy != null || by < py) ? by - r - 15 : by + r + 10}" text-anchor="middle">${st.short}</text>${"" /* JG-PROD: owner 4 Oct P4g S2 M, an Uzbek stop's name over its badge */}${"" /* JG-PROD: owner 4 Oct P4g fix K6, the name over the badge above the path, under it below */}${"" /* JG-PROD: owner 7 Oct P5 fix map, a stop on the scale has its name over its badge */}
          ${st.goal ? "" : `<text class="st-at" x="${bx}" y="${st.uz && (st.cy != null || by < py) ? by - r - 6 : by + r + 19}" text-anchor="middle">${st.uz ? st.lab : `${st.at}%`}</text>${"" /* JG-PROD: owner 4 Oct R4, an Uzbek stop reads its verdict, not a percentage; owner 4 Oct P4g S2 M, over its badge, under its name; P4g fix K6, the verdict under the name, on the badge's outer side */}`}${"" /* JG-PROD: owner 7 Oct P5 fix map, its verdict too */}
        </g>`;
    }).join("");
    stationsG.querySelectorAll(".station").forEach(g => {
      const open = e => { e.stopPropagation(); pickStation(+g.dataset.i); };
      g.addEventListener("click", open);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
    });
  }
  let stationT = 0;
  function pickStation(i) {                                       // tap a university: its details show in the message box
    const st = STATIONS[i], r = readiness();
    clearSel();
    stationsG.querySelectorAll(".station").forEach((g, k) => g.classList.toggle("picked", k === i));
    $("rm-goal-img").src = st.img;
    $("rm-goal-txt").innerHTML = st.goal
      ? `<b>${GOAL} is your goal${YEAR ? ` for ${YEAR}` : ""}.</b> ${chance() ? `${chance().said}.` : `You're ${r}% of the way there.`}`   /* JG-PROD: owner 3 Oct R14 */   /* JG-PROD: owner 7 Oct P5d, his chance, with its range (owner decision 1) */   /* JG-PROD: owner 7 Oct P5 fix map, the goal's sentence whole (JG_ENGINE.chance().said): "Chance for MIT: …" with a number, the reason alone without one, never "Шанс для : …" (the wave-2 walk, S1) */
      : st.uz ? `<b>${st.name}.</b> ${st.line} <button class="rm-applink" type="button" data-uz="${st.key}">${st.open}</button>` : r >= st.at   /* JG-PROD: owner 4 Oct R4, the verdict ("You can apply" / "Not yet: you still need X"), and the page of what they ask for */
        ? `<b>${st.name}: you're in range now (${st.at}%).</b> Keep going for MIT.`
        : `<b>${st.name}: in range at ${st.at}% ready.</b> You're at ${r}%. MIT stays the goal.`;
    clearTimeout(stationT);
    stationT = setTimeout(() => { stationsG.querySelectorAll(".station").forEach(g => g.classList.remove("picked")); goalLine(readiness()); }, st.uz ? 9000 : 4500);   /* JG-PROD: owner 4 Oct R4, time to read the verdict and tap its link */
  }
  function markStations(h) {                                      // stops appear as the line reaches them
    stationsG.querySelectorAll(".station").forEach((g, i) => g.classList.toggle("on", h >= STATIONS[i].x - .05 || !!(window.JG_ENGINE && STATIONS[i].goal)));   /* JG-PROD: owner 4 Oct P4g fix K6, a real student's goal stands from the start, with the rest (it drew 3-5 s late, when the line reached it) */
  }
  function paintReached() {
    const r = readiness();
    stationsG.querySelectorAll(".station").forEach((g, i) => g.classList.toggle("reached", STATIONS[i].uz ? !!STATIONS[i].ok : r >= STATIONS[i].at));   /* JG-PROD: owner 4 Oct R4, an Uzbek stop is ticked when he can apply */
  }
  const readiness = () => (window.JG_ENGINE ? (window.JG_ENGINE.cache.ready ? window.JG_ENGINE.cache.ready.value : Math.max(1, Math.round(f(youX)))) : window.JG_readiness ? window.JG_readiness() : Math.max(1, Math.round(f(youX)))), chance = () => (window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance() || null);   /* JG-PROD: P4d re-walk F8, a real student's readiness read when asked: the chart is drawn before the engine script installs JG_readiness, and again after a first run in this page ("You're 1% of the way there" beside "66% ready" was that stale render); owner 4 Oct R14r, it is his "% ready" (the engine's v2: what his goal requires that he has in hand, 0 when nothing is yet), no longer the card's overall */   // the scorecard is the one source   /* JG-PROD: owner 7 Oct P5d, v4: the words of his chance (JG_ENGINE.chance, public/runtime/jg-runtime.js) */
  const badge = { classList: { add: () => stationsG.querySelectorAll(".station").forEach(g => g.classList.add("on")), remove: () => {} } };
  svg.addEventListener("click", e => { if (!e.target.closest(".node, .lbl, .badge")) clearSel(); });

  function goalLine(r) {
    const reached = STATIONS.filter(st => !st.uz && r >= st.at && !st.goal).pop(), next = STATIONS.find(st => !st.uz && r < st.at);   /* JG-PROD: owner 4 Oct R4, the goal line reads readiness stops only */
    const mit = STATIONS[STATIONS.length - 1];
    let img, html;
    if (r >= 100) { img = mit.img; html = `<b>You're ready for ${GOAL}.</b> Apply with confidence.`; }   /* JG-PROD: owner 3 Oct R14 */
    else if (reached) { img = reached.img; html = `<b>At ${r}% you're already in range for ${reached.name}.</b> Don't stop: MIT is the goal.`; }
    else { img = next.img; html = next.goal && window.JG_ENGINE ? `<b>${next.name} is your goal${YEAR ? ` for ${YEAR}` : ""}.</b> ${chance() ? `${chance().said}.` : `You're ${r}% of the way there.`}` : `<b>Reach ${next.at}% and you'll be in range for ${next.name}.</b> Keep your eyes on MIT.`; }   /* JG-PROD: owner 3 Oct R14 */   /* JG-PROD: owner 7 Oct P5d, his chance, with its range (owner decision 1) */   /* JG-PROD: owner 7 Oct P5 fix map, the goal's sentence whole (said) */
    const nextUp = STATIONS.find(st => r < st.at && st !== next) || null;
    $("rm-goal-img").src = img;
    $("rm-goal-txt").innerHTML = html + (reached && next && !next.goal ? ` <span>Next: ${next.name} at ${next.at}%.</span>` : "") + ` <button class="rm-applink" type="button" data-app="${(reached || next || mit).key}">Open application</button>`;
  }

  function copy() {
    const diag = mode === "diag";
    $("rm-sub").textContent = isOpen
      ? `Stage ${diag ? Math.floor(youX) : 0} of ${LAST}`
      : (diag ? "Your personalised path" : "Your predicted path");
    $("lg-act").classList.toggle("off", !diag);
    const ready = readiness();                                     // never shows 0: you've started by opening the app
    goalLine(ready);
    $("tipA").textContent = chance() ? chance().tag : `${ready}% ready`;   /* JG-PROD: owner 7 Oct P5d, the tag reads his chance in his language (owner decision 1) */
    $("rm-ready-n").textContent = chance() ? chance().num : `${ready}%`;   /* JG-PROD: owner 7 Oct P5d, one number: the chance ("<1%" under 1 in 100, "—" with none) */
    $("rm-ready").setAttribute("aria-label", chance() ? chance().said : `${ready}% ready for university`);   /* JG-PROD: owner 7 Oct P5d, read out with its range */   /* JG-PROD: owner 7 Oct P5 fix map, read out whole (said) */
  }

  const markNodes = h => nodeEls.forEach((g, i) => g.classList.toggle("on", i <= h + 1e-6));

  function reset() {
    ["rPred", "rAct"].forEach(id => $(id).setAttribute("width", 0));
    $("head").style.opacity = 0;
    $("you").style.opacity = 0;
    $("tip").classList.remove("on");
    badge.classList.remove("on");
    revealed = -1; markNodes(-1); markStations(-1);
  }

  function prepare(m) {
    token++;
    mode = m; youX = m === "diag" ? ACT[ACT.length - 1][0] : 0;
    f = m === "diag" ? (x => x <= youX ? fAct(x) : fFc(x)) : fPred;

    if (m === "diag") {
      $("predLine").setAttribute("d", pathOf(fFc, youX, LAST));
      $("predArea").setAttribute("d", areaOf(fFc, youX, LAST));
      $("actLine").setAttribute("d", pathOf(fAct, 0, youX));
      $("actArea").setAttribute("d", areaOf(fAct, 0, youX));
    } else {
      $("predLine").setAttribute("d", pathOf(fPred, 0, LAST));
      $("predArea").setAttribute("d", areaOf(fPred, 0, LAST));
      $("actLine").setAttribute("d", ""); $("actArea").setAttribute("d", "");
    }
    buildNodes(); buildStations(); clearSel(); reset(); copy(); paintReached();
    document.querySelectorAll(".demo button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  }

  /* ---------- animation ---------- */
  const tween = (a, b, dur, fn, my) => new Promise(res => {
    if (reduce) { fn(b); return res(); }
    const t0 = performance.now();
    (function step(now) {
      if (my !== token) return res();
      const k = Math.min((now - t0) / dur, 1);
      fn(a + (b - a) * (0.5 - Math.cos(Math.PI * k) / 2));      // sine ease in-out
      k < 1 ? requestAnimationFrame(step) : res();
    })(t0);
  });

  function showYou() {
    const x = sx(youX), y = sy(f(youX));
    $("you").setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    $("you").style.opacity = 1;
    const you = $("you");
    you.classList.remove("drop"); void you.getBBox(); if (!reduce) you.classList.add("drop");
    const tx = clamp(x - 32, window.JG_ENGINE ? 16 : 4, W - 68);   /* JG-PROD: owner 4 Oct P4g fix K6, the "You're here" tag starts right of the y-axis labels, so it never hides one (it hid "50") */
    const tip = $("tip");
    tip.setAttribute("transform", `translate(${tx.toFixed(1)} ${(y - 80).toFixed(1)})`);
    tip.children[1].setAttribute("d", `M${(x - tx - 5).toFixed(1)} 30h10l-5 6z`);
    tip.classList.add("on");
  }

  const drive = (clipId, fn, color) => h => {
    $(clipId).setAttribute("width", sx(h).toFixed(1));
    const head = $("head");
    head.setAttribute("cx", sx(h).toFixed(1)); head.setAttribute("cy", sy(fn(h)).toFixed(1));
    head.style.color = color; head.setAttribute("fill", color); head.style.opacity = 1;
    revealed = Math.max(revealed, h); markNodes(revealed); markStations(revealed);
  };

  async function play() {
    const my = ++token;
    reset();
    if (mode === "diag") {
      await tween(0, youX, 1900, drive("rAct", fAct, FOREST), my);
      if (my !== token) return;
      $("head").style.opacity = 0; showYou();
      await tween(youX, LAST, 2600, drive("rPred", fFc, GREEN), my);
    } else {
      showYou();
      await tween(0, LAST, 5200, drive("rPred", fPred, GREEN), my);
    }
    if (my !== token) return;
    $("head").style.opacity = 0;
    badge.classList.add("on");
  }

  /* ---------- show / hide with the eye ---------- */
  function setOpen(v) {
    isOpen = v;
    card.classList.toggle("open", v);
    eye.setAttribute("aria-expanded", String(v));
    eye.setAttribute("aria-label", v ? "Hide roadmap" : "Show roadmap");
    if (v) {
      card.classList.add("seen");
      prepare(mode);
      setTimeout(() => { if (isOpen) play(); }, reduce ? 0 : 420);   // let the card open first
    } else {
      token++; clearSel(); copy();
    }
  }
  eye.addEventListener("click", () => setOpen(!isOpen));

  document.querySelectorAll(".demo button").forEach(b => b.addEventListener("click", () => {
    const m = b.dataset.mode;
    if (!isOpen) { mode = m; setOpen(true); }
    else { prepare(m); play(); }
    card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }));

  // Starts collapsed: the roadmap only appears when the student taps the eye. The student is already on the way.
  prepare(window.JG_ENGINE ? "new" : "diag");   /* JG-PROD: S21, a live student's chart stays in the design's own first-launch mode: "diag" draws the design's sample history (final review runtime C1) */
})();
