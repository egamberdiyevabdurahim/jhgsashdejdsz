
/* ==========================================================
   DESKTOP SHELL — the top bar (search, coins, events,
   notifications and your menu), the sidebar's quick links,
   and Home as an overview: your numbers, what's coming up,
   your applications and this week's league.
   Anything with data-jia="…" opens that thing from anywhere;
   data-jgo="…" switches section.
   ========================================================== */
(() => {
  "use strict";
  const { $, PHOTO } = window.JIA;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- opening things from anywhere ---------- */
  const OPEN = {
    profile: () => window.JIA_openProfile && window.JIA_openProfile("me"),
    settings: () => window.JIA_openSettings && window.JIA_openSettings(),
    plans: () => window.JIA_openPricing && window.JIA_openPricing(null),
    apps: () => window.JIA_openApps && window.JIA_openApps(),
    shop: () => window.JIA_openShop && window.JIA_openShop(),
    league: () => window.JIA.openLeague && window.JIA.openLeague(),
    jamol: () => window.JIA_openJamol && window.JIA_openJamol(null),
    events: () => { const b = $("cm-ev-btn"); if (b) b.click(); },
    logout: () => {                                               // Settings owns the log-out question
      if (!window.JIA_openSettings) return;
      window.JIA_openSettings();
      setTimeout(() => { const o = $("set-out"); if (o) o.click(); }, 150);
    },
  };
  window.JIA.open = key => { if (OPEN[key]) OPEN[key](); };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-jia]");
    if (b) { closeMenu(); if (OPEN[b.dataset.jia]) OPEN[b.dataset.jia](); return; }
    const g = e.target.closest("[data-jgo]");
    if (g) window.JIA.go(g.dataset.jgo);
  });

  /* ---------- top bar: search opens the global search, with what you typed ---------- */
  const q = $("tb-q");
  function openSearch(text) {
    const b = $("cm-search-btn");
    if (!b) return;
    b.click();
    setTimeout(() => {
      const i = $("sr-in");
      if (!i) return;
      if (text) { i.value = text; i.dispatchEvent(new Event("input", { bubbles: true })); }
      i.focus({ preventScroll: true });
    }, 80);
  }
  q.addEventListener("focus", () => { const t = q.value; q.value = ""; q.blur(); openSearch(t); });
  document.addEventListener("keydown", e => {                     // "/" searches from anywhere
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    const a = document.activeElement;
    if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
    if (document.documentElement.classList.contains("gm-open")) return;
    e.preventDefault(); openSearch("");
  });

  /* ---------- top bar: your menu ---------- */
  const me = $("tb-me"), menu = $("tb-menu");
  $("tb-av").style.backgroundImage = `url("${PHOTO}")`;
  function openMenu() {
    menu.hidden = false; me.setAttribute("aria-expanded", "true");
    const f = menu.querySelector("button"); if (f) f.focus({ preventScroll: true });
  }
  function closeMenu(refocus) {
    if (!menu || menu.hidden) return;
    menu.hidden = true; me.setAttribute("aria-expanded", "false");
    if (refocus) me.focus({ preventScroll: true });
  }
  me.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
  document.addEventListener("pointerdown", e => { if (!menu.hidden && !menu.contains(e.target) && !me.contains(e.target)) closeMenu(); });
  menu.addEventListener("keydown", e => {
    const items = [...menu.querySelectorAll("button")], k = items.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(k + 1) % items.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(k - 1 + items.length) % items.length].focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === "Tab") closeMenu();
  });

  /* ---------- Home: the greeting and "continue" ---------- */
  const hr = new Date().getHours();
  $("dash-hi").firstChild.nodeValue = `${hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening"}, ${JG_ME.firstName} `; /* JG-PROD: identity */
  $("dash-cta").addEventListener("click", () => { if (window.JIA_openLesson) window.JIA_openLesson(0, 1); });

  /* ---------- Home: your numbers, each with a little trend line ---------- */
  const smooth = pts => pts.reduce((d, pt, i, a) => {
    if (!i) return `M${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
    const p0 = a[i - 2] || a[i - 1], p1 = a[i - 1], p3 = a[i + 1] || pt;
    const c1 = [p1[0] + (pt[0] - p0[0]) / 6, p1[1] + (pt[1] - p0[1]) / 6], c2 = [pt[0] - (p3[0] - p1[0]) / 6, pt[1] - (p3[1] - p1[1]) / 6];
    return `${d} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
  }, "");
  let spN = 0;
  function spark(svg, data, still) {
    const W = 118, H = 46, P = 4, lo = Math.min(...data), hi = Math.max(...data), n = data.length;
    const pts = data.map((v, i) => [P + (W - 2 * P) * i / (n - 1), H - P - (H - 2 * P - 8) * (v - lo) / ((hi - lo) || 1)]);
    const line = smooth(pts), last = pts[n - 1], id = `sp${++spN}`;
    svg.classList.toggle("still", !!still || reduce);
    svg.innerHTML = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".26"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
      <path class="sp-area" d="${line} L${last[0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z" fill="url(#${id})"/>
      <path class="sp-line" d="${line}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle class="sp-dot" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.4" fill="#fff" stroke="currentColor" stroke-width="2.2"/>`;
  }
  function countTo(el, to, fmt, dur) {
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / (dur || 1200)), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const L = () => window.JIA.league, KP = () => window.JG_ENGINE && window.JG_ENGINE.cache.kpi;   /* JG-PROD: S25, the student's own KPI numbers */
  const readyNow = () => { const t = $("rm-ready-n"); return t ? parseInt(t.textContent, 10) || 0 : 50; };
  let todayLevel = +($("world").dataset.progress || 0);
  const K = {
    ready: { n: readyNow, f: v => (C => C ? C.num : `${Math.round(v)}%`)(window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance()), d: () => (!(KP() ? window.JG_ENGINE.cache.ready : readyNow() > 1) ? ((window.JG_PHASED && window.JG_PHASED.homeLine && window.JG_PHASED.homeLine()) || "Take the diagnostic to begin") : KP() ? (window.JG_ENGINE.unscaled && window.JG_ENGINE.unscaled() ? "" : KP().readiness.month_delta == null ? "First reading this month" : `${KP().readiness.month_delta < 0 ? "▼" : "▲"} ${Math.abs(KP().readiness.month_delta)}% this month`) : "▲ 6% this month"), s: () => (!(KP() ? window.JG_ENGINE.cache.ready : readyNow() > 1) ? [0, 0, 0, 0, 0, 0, 1] : KP() ? (KP().readiness.series.length ? [...KP().readiness.series.slice(-7), readyNow()] : [readyNow(), readyNow()]) : [3, 8, 13, 21, 26, 37, 44, readyNow()]) },   /* JG-PROD: S25, readiness this month and its last snapshots; owner 4 Oct R14r, a real student with a result is past the diagnostic at any readiness (an honest 0 or 1 % is no "Take the diagnostic"), and with no v2 reading at the month's start (an account read v1 then) no change was measured: "First reading this month", never "▲ 0%" */   /* JG-PROD: owner 7 Oct P5d, the KPI shows his chance's number, as the ring does */   /* JG-PROD: owner 7 Oct P5 minors, no monthly change beneath a withheld chance: S1 read "▲ 0% this month" under "—" (her goal has no number, JG_ENGINE.unscaled()); the line is empty then, as the map has no % scale */   /* JG-PROD: owner 11 Oct 2026 (his ruling, the diagnostic as daily tasks), with Phase D on a student who has not finished the first run is told "A few quick questions, then your first tasks" here (JG_PHASED.homeLine), never "Diagnostic in progress · 1 of 22" or "Take the diagnostic to begin" */
    today: { n: () => todayLevel, f: v => `${Math.round(v)}%`, d: () => { const n = window.JIA_today && window.JIA_today.of ? window.JIA_today.of() : 4; return `${Math.min(n, Math.floor(todayLevel / (100 / n) + 1e-6))} of ${n} tasks done`; }, s: () => (KP() ? [...KP().today.series.slice(0, 6), todayLevel] : [40, 75, 100, 60, 90, 100, todayLevel]) },   /* JG-PROD: S25, the last six days' progress; P4d re-walk F2, of today's tasks (a rest day has 2) */
    streak: { n: () => L().streak, f: v => `${Math.round(v)} days`, d: () => (KP() ? `Best so far: ${KP().streak.best} days` : "Best so far: 21 days"), s: () => (KP() ? KP().streak.series : [60, 95, 80, 120, 105, 140, 130]) },   /* JG-PROD: S25, the best streak and minutes studied per day */
    league: { n: () => window.JG_LEAGUE ? window.JG_LEAGUE.kpiN(L()) : L().rank, f: v => window.JG_LEAGUE ? window.JG_LEAGUE.kpiF(v) : `#${Math.max(1, Math.round(v))}`, d: () => window.JG_LEAGUE ? window.JG_LEAGUE.kpiD(L()) : `${L().name} League · ${L().xp} XP this week`, s: () => (KP() ? KP().league.series : [420, 480, 510, 560, 600, 660, Math.max(L().xp, 1)]) },   /* JG-PROD: S25, XP per day */ /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), her XP and the honest line until her real league plays (public/runtime/jg-league.js) */
  };
  function paintKpi(k, first) {
    const c = document.querySelector(`.kpi[data-kpi="${k}"]`), def = K[k], n = c.querySelector(".kpi-n"), v = def.n();
    if (first && k !== "league") countTo(n, v, def.f); else n.textContent = def.f(v);
    c.querySelector(".kpi-d").textContent = def.d();
    spark(c.querySelector(".kpi-spark"), def.s(), !first);
    c.setAttribute("aria-label", `${c.querySelector(".kpi-l").textContent}: ${def.f(v)}. ${def.d()}`);
  }
  Object.keys(K).forEach(k => paintKpi(k, true));
  document.addEventListener("today:progress", e => {
    const lv = e.detail && (e.detail.level != null ? e.detail.level : e.detail.progress);
    if (lv == null || (Math.round(lv) === Math.round(todayLevel) && !e.detail.count)) return;   /* JG-PROD: P4d re-walk F2, a new task count repaints "N of M tasks done" (the first run made today's tasks in this page) */
    todayLevel = lv; paintKpi("today");
  });
  new MutationObserver(() => paintKpi("ready")).observe($("rm-ready-n"), { childList: true, characterData: true, subtree: true });
  document.querySelector(".kpis").addEventListener("click", e => {
    const c = e.target.closest(".kpi"); if (!c) return;
    ({ ready: () => $("rm").scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }),
       today: () => window.JIA.go("today"), streak: OPEN.league, league: OPEN.league })[c.dataset.kpi]();
  });

  /* ---------- Home: coming up ---------- */
  const IC = {
    live: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.6"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/></svg>',
    sat: '<svg viewBox="0 0 24 24"><path d="M5 19.5V9.5M10 19.5V5M15 19.5v-7M20 19.5v-10"/></svg>',
    essay: '<svg viewBox="0 0 24 24"><path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h4"/></svg>',
    cap: '<svg viewBox="0 0 24 24"><path d="M2.5 9.4L12 5l9.5 4.4L12 13.8z"/><path d="M6.4 11.3v4.4c0 1.6 2.5 2.9 5.6 2.9s5.6-1.3 5.6-2.9v-4.4"/></svg>',
  };
  const openLive = i => {
    window.JIA.go("lessons");
    setTimeout(() => { const c = document.querySelector(`#ls-live-row [data-live="${i}"]`); if (c) c.click(); }, 420);
  };
  const daysTo = iso => Math.max(0, Math.ceil((new Date(iso) - new Date()) / 864e5));
  const UP = [
    ...(window.JG_ENGINE ? [] : [{ t: "Live admission", s: "JIA Admissions team · 128 watching", pill: ["live", "Live now"], ic: "live", tone: ["#fdebe8", "#c93a2c"], go: () => openLive(0) }]),   /* JG-PROD: owner 4 Oct R13 (P4e G1), no invented live session or viewer count in a real student's "Coming up" */
    ...(window.JG_ENGINE ? [] : [{ t: "Live SAT course", s: "Aziza Karimova · Math sprint", pill: ["today", "Today, 19:00"], ic: "sat", tone: ["#e6effb", "#2f6fc0"], go: () => openLive(1) }]),   /* JG-PROD: owner 4 Oct R6, no invented teacher in a real student's "Coming up"; owner 4 Oct R13 (P4e G1), nor the invented session */
    ...(window.JG_ENGINE ? [] : [{ t: "Essays that stand out", s: "Live admission session", pill: ["soon", "Thu, 18:00"], ic: "essay", tone: ["#f0ecfd", "#6a4fcf"], go: () => openLive(0) }]),   /* JG-PROD: owner 4 Oct R13 (P4e G1), no invented live session or viewer count in a real student's "Coming up" */
    ...(window.JG_ENGINE ? [] : [{ t: "MIT Early Action", s: `Application deadline · ${daysTo("2026-11-01T23:59:00")} days left`, pill: ["due", "Nov 1"], ic: "cap", tone: ["#e3f5eb", "#207251"], go: () => window.JIA_openApps && window.JIA_openApps("mit") }]),   /* JG-PROD: owner 3 Oct R14, never the design's MIT row for a real student (upRow) */
  ]; const upRow = () => { const G = window.JG_ENGINE.cache && window.JG_ENGINE.cache.goal; return (G ? G.unis.filter(x => x.deadline) : []).sort((a, b) => (a.deadline < b.deadline ? -1 : 1)).slice(0, 4).map(u => { const at = `${u.deadline}T23:59:00`; return { t: `${u.short} ${u.deadline_name || "application"}`, s: `Application deadline · ${daysTo(at)} days left`, pill: ["due", new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" })], ic: "cap", tone: ["#e3f5eb", "#207251"], go: () => window.JIA_openApps && window.JIA_openApps(u.key) }; }); };   /* JG-PROD: owner 3 Oct R14, a real student's row is the first university they chose that has a dated deadline, or none */   /* JG-PROD: owner 4 Oct R13 (P4e G1), each university he chose that has a dated deadline, soonest first (at most 4) */
  /* JG-PROD: owner 3 Oct R14, drawn again when the goal changes; owner 4 Oct R13 (P4e G1), a real student's list is his own deadlines alone */ const paintUp = () => { if (window.JG_ENGINE) UP.splice(0, UP.length, ...upRow()); $("up-list").innerHTML = UP.map((u, i) => `<li><button class="up-item" type="button" data-u="${i}" style="--ut:${u.tone[0]};--uk:${u.tone[1]}">
      <span class="up-ic" aria-hidden="true">${IC[u.ic]}</span><span class="up-t"><b>${esc(u.t)}</b><small>${esc(u.s)}</small></span>
      <span class="up-pill ${u.pill[0]}">${esc(u.pill[1])}</span></button></li>`).join("") || (window.JG_ENGINE ? `<li class="pf-empty">Nothing coming up yet.</li>` : ""); }; paintUp(); document.addEventListener("jg:goal", paintUp);   /* JG-PROD: owner 3 Oct R14; owner 4 Oct R13 (P4e G1), "Nothing coming up yet." with no dated deadline */
  $("up-list").addEventListener("click", e => { const b = e.target.closest("[data-u]"); if (b) UP[+b.dataset.u].go(); });

  /* ---------- Home: my applications (the same progress as the tracker) ---------- */
  const fmtDate = d => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "date being confirmed");   /* JG-PROD: owner 3 Oct R14 */
  function paintApps() {
    const A = window.JIA_APPS || [], pct = window.JIA_appPct || (() => 0), UNI = window.JIA_UNI || {};
    const open = A.filter(a => !a.sent && a.dl).sort((a, b) => a.dl - b.dl), next = open[0];   /* JG-PROD: owner 3 Oct R14 */
    $("apl").innerHTML = A.slice(0, 4).map(a => `<button class="apl-row" type="button" data-k="${a.key}">
        <img src="${a.photo || UNI[a.key] || ""}" alt=""><b>${esc(a.name)}</b><em>${(C => C ? C.num : `${pct(a)}%`)(window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance(a.key))}</em>${"" /* JG-PROD: owner 7 Oct P5d, his chance's number, "—" where none is shown (owner decision 1) */}
        <small>${esc(a.plan)} · ${fmtDate(a.dl)}${a.sent ? " · Submitted ✓" : ""}</small><i class="apl-bar"><i style="width:${pct(a)}%"></i></i></button>`).join("")
      + (next ? `<p class="apl-next">Next deadline: <b>${esc(next.name)}, ${fmtDate(next.dl)}</b> · ${daysTo(next.dl)} days left</p>` : "");
  }
  paintApps(); window.JIA_paintApps = paintApps; if (window.JG_ENGINE) document.addEventListener("jg:snapshot", paintApps);   /* JG-PROD: owner 3 Oct R14, the tracker (018.js) draws this overview again when the goal changes */   /* JG-PROD: owner 4 Oct P4g S2 M, a newer snapshot repaints this card's "% ready" too (it read 3% beside the KPI's 9% after a new SAT score) */
  $("apl").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b && window.JIA_openApps) window.JIA_openApps(b.dataset.k); });
  const apView = $("ap-view");
  if (apView) new MutationObserver(() => { if (apView.hidden) paintApps(); }).observe(apView, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- Home: this week's league ---------- */
  function paintLeague() {
    const all = window.JIA.leagueTop ? window.JIA.leagueTop() : [];
    if (!all.length) return;
    const mine = all.findIndex(r => r.who === "me");
    const rows = all.slice(0, 5).map((r, k) => [r, k]);
    if (mine > 4) rows.splice(4, 1, [all[mine], mine]);
    const top = Math.max(1, all[0].xp);
    $("lgt").innerHTML = rows.map(([r, k]) => `<li class="${r.who === "me" ? "me" : ""}${(window.JG_LEAGUE ? window.JG_LEAGUE.zone(k, all.length) === " up" : k < 5) ? " up" : ""}${"" /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), no promotion colour unless her real league plays (public/runtime/jg-league.js) */}">
        <span class="n">${k + 1}</span><img src="${r.av}" alt=""><b>${esc(r.name)}</b><span class="xp">${r.xp} XP</span>
        <span class="bar"><i style="width:${Math.round(r.xp / top * 100)}%"></i></span></li>`).join("");
    paintKpi("league"); paintKpi("streak");
  }
  paintLeague();
  document.addEventListener("jia:league", paintLeague);
})();

