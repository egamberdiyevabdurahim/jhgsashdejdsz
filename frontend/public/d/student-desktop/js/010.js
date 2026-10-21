
/* ==========================================================
   LEAGUE — levels, streaks and weekly leagues. Opens from the
   league card on Today (and its notification) as a drawer from
   the right: your level and XP, this week's standings, and the
   promotion and demotion zones. "End the week" is a demo that
   moves you up a league and into that league's group chat.
   ========================================================== */
(() => {
  "use strict";
  const { $, toast, shield, LEAGUES } = window.JIA;
  const ME = { level: 7, fromDiag: 6, xp: 2340, next: 2600, week: 712, streak: 12, league: 2, daysLeft: 3 }; if (window.JG_ENGINE) { Object.assign(ME, { streak: window.JG_ENGINE.cache.streak.current, xp: window.JG_ENGINE.cache.league.xp, week: window.JG_ENGINE.cache.league.week_xp }); Object.defineProperties(ME, { level: { get: () => window.JG_ENGINE.level(ME.xp).level }, next: { get: () => window.JG_ENGINE.level(ME.xp).next }, from: { get: () => window.JG_ENGINE.level(ME.xp).from } }); } if (window.JG_LEAGUE) window.JG_LEAGUE.me(ME); /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */   /* JG-PROD: S22, the student's own streak, XP and weekly XP; owner 4 Oct R13, and the level their own XP earns (JG_ENGINE.level, read again whenever the XP changes), never the design's "Level 7", and the XP that level starts at (the bar's 0 %); the league stays the design's until P5 (Q14) */
  const OTHERS = ["Aziz T.", "Malika S.", "Rustam K.", "Zarina O.", "Bobur A.", "Shahzoda N.", "Otabek R."];
  const TINTS = ["#6fb0a5", "#9c90cc", "#d59199", "#7b9fcf", "#d8a261", "#78b692", "#8a9a92"];
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initialsAV = (name, bg) => "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${bg}"/><text x="32" y="40.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#fff">${name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</text></svg>`);
  const PEOPLE = window.JIA_PEOPLE = window.JIA_PEOPLE || {}, AV = window.JIA_AV = window.JIA_AV || {};
  OTHERS.forEach((n, k) => { PEOPLE[`lg${k}`] = { name: n, kind: "student", tag: "Student" }; AV[`lg${k}`] = initialsAV(n, TINTS[k]); });
  let MY_AV = (window.JG_ENGINE && JG_ME.photoUrl) || initialsAV(JG_ME.fullName, "#2b9067"); if (window.JG_ENGINE) document.addEventListener("jg:photo", () => { MY_AV = JG_ME.photoUrl || initialsAV(JG_ME.fullName, "#2b9067"); }); /* JG-PROD: identity */ /* JG-PROD: owner 4 Oct P4g S4, a real student's own photo once he has one (his initials until then, as before); the demo keeps the design's initials */
  const COHORT = ["dilnoza", "asadbek", "sardor", "lg0", "nilufar", "lg1", "timur", "lg2", "madina", "lg3", "laylo", "lg4", "jasur", "lg5", "lg6"];
  const cohortXp = COHORT.map((_, k) => Math.round(820 - k * 38 - (k % 3) * 9));
  const standings = () => window.JG_LEAGUE ? window.JG_LEAGUE.standings(ME, PEOPLE, AV) : [...COHORT.map((w, k) => ({ who: w, xp: cohortXp[k] })), { who: "me", xp: ME.week }].sort((a, b) => b.xp - a.xp); /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */

  const layer = $("lg-layer"), card = $("lg-card");
  function paint() {
    queueMicrotask(() => document.dispatchEvent(new Event("jia:league")));   // the overview on Home follows the standings
    const st = standings(), myRank = st.findIndex(r => r.who === "me") + 1, L = LEAGUES[ME.league];
    Object.assign(window.JIA.league, { i: ME.league, name: L[0], color: L[1], n: ME.league + 1, rank: myRank, of: st.length, xp: ME.week, streak: ME.streak, level: ME.level });
    $("lg-head").innerHTML = `${shield(62, ME.league)}<div><h2>${window.JG_LEAGUE ? window.JG_LEAGUE.title(L) : `${L[0]} League`}</h2><p>${window.JG_LEAGUE ? window.JG_LEAGUE.line() : `Top 5 move up. ${ME.daysLeft} days left this week.`}</p></div>`; /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */
    $("lg-me").innerHTML = `<div class="lg-lv"><b>Level ${ME.level}</b><span>${ME.xp.toLocaleString("en-US")} / ${ME.next.toLocaleString("en-US")} XP</span></div>
      <div class="lg-bar" role="img" aria-label="${Math.round((ME.xp - (ME.from || 0)) / (ME.next - (ME.from || 0)) * 100)}% of the way to level ${ME.level + 1}"><i style="width:${Math.round((ME.xp - (ME.from || 0)) / (ME.next - (ME.from || 0)) * 100)}%"></i></div>${"" /* JG-PROD: owner 4 Oct R13, a real student's bar is the share of this level done, from where it starts (ME.from) to the next: 2,340 XP at level 7 (2,100 to 2,800) is 34 %, not 84 %; the demo has no ME.from, so it keeps the design's xp / next */}
      <p class="lg-note">${window.JG_ENGINE ? "Each 25 minutes you finish in the Study Room adds 10 XP." : `You started at level ${ME.fromDiag} from your AI diagnostic. Every task, lesson and battle adds XP.`}${"" /* JG-PROD: owner 4 Oct R13, no "You started at level 6 from your AI diagnostic" for a real student (no diagnostic sets a level, and the AI layer is off): their XP comes from finished Study Room bricks only (src/engine/study.ts) */}</p>
      <div class="lg-chips"><span>🔥 ${ME.streak}-day streak</span><span>${ME.week} XP this week</span>${window.JG_LEAGUE ? window.JG_LEAGUE.chip(myRank, L) : `<span>#${myRank} in ${L[0]}</span>`}</div>`; /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */
    $("lg-list").innerHTML = st.map((r, k) => {
      const zone = window.JG_LEAGUE ? window.JG_LEAGUE.zone(k, st.length) : k < 5 ? " up" : k >= st.length - 3 ? " down" : ""; /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */
      const name = r.who === "me" ? "You" : PEOPLE[r.who].name;
      return `<li class="lg-row${zone}${r.who === "me" ? " me" : ""}"><span class="lg-n">${k + 1}</span><img src="${r.who === "me" ? MY_AV : AV[r.who]}" alt=""><b>${esc(name)}</b><span class="lg-xp">${r.xp} XP</span></li>`
        + (window.JG_LEAGUE ? window.JG_LEAGUE.sep(k, st.length) : k === 4 ? `<li class="lg-zone up">Promotion zone above</li>` : k === st.length - 4 ? `<li class="lg-zone down">Demotion zone below</li>` : ""); /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */
    }).join("");
    card.innerHTML = `${shield(44, ME.league)}<span class="lg-c-t"><b>${window.JG_LEAGUE ? window.JG_LEAGUE.title(L) : `${L[0]} League`}</b><span>${window.JG_LEAGUE ? window.JG_LEAGUE.cardSub(myRank, st.length, ME.week) : `#${myRank} of ${st.length} · ${ME.week} XP this week`}</span></span>` + /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */
      `<span class="lg-c-r"><b>🔥 ${ME.streak}</b><span>Level ${ME.level}</span></span>`;
  }

  let back = null, closeT = 0;
  function open() {
    paint(); clearTimeout(closeT);
    back = document.activeElement;
    layer.hidden = false; void layer.offsetWidth; layer.classList.add("on");
    $("lg-scroll").scrollTop = 0;
    $("lg-back").focus({ preventScroll: true });
  }
  function close() {
    if (layer.hidden) return;
    layer.classList.remove("on");
    closeT = setTimeout(() => { layer.hidden = true; }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380);
    if (back && back.isConnected && back.offsetParent) back.focus({ preventScroll: true });
  }
  window.JIA.openLeague = open;
  card.addEventListener("click", open);
  $("lg-back").addEventListener("click", close);
  $("lg-scrim").addEventListener("click", close);
  document.addEventListener("keydown", e => {
    if (layer.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") {                                       // keep the keyboard inside the drawer
      const f = [...layer.querySelectorAll("button")].filter(b => b.offsetParent);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener("jia:tab", close);
  $("lg-chat").addEventListener("click", () => {                       // the league's group chat lives in Community, Direct
    if (!window.JIA.openLeagueChat) return toast("Chats aren't on desktop yet");
    close(); if (window.JG_LEAGUE) return window.JG_LEAGUE.openChat(); window.JIA.openLeagueChat(ME.league); /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), a real student is never ranked against invented students: window.JG_LEAGUE (public/runtime/jg-league.js) */
  });
  $("lg-end").addEventListener("click", () => {                     // demo: the week ends and you move up
    if (ME.league >= LEAGUES.length - 1) return;
    ME.league++; ME.week = 0; ME.xp += 180; ME.daysLeft = 7;
    if (window.JIA.leagueMoved) window.JIA.leagueMoved(ME.league - 1, ME.league);
    cohortXp.forEach((_, k) => { cohortXp[k] = 0; });
    paint();
    const name = LEAGUES[ME.league][0];
    if (window.JIA.notify) window.JIA.notify({ league: ME.league, text: `<b>You moved up to the ${name} League!</b> Say hi in the new league chat.`, go: () => { if (window.JIA.openLeagueChat) window.JIA.openLeagueChat(ME.league); else open(); } });
    toast(`Welcome to the ${name} League 🎉`);
  });
  paint();
  window.JIA.leagueTop = () => standings().map(r => ({ who: r.who, xp: r.xp, name: r.who === "me" ? "You" : PEOPLE[r.who].name, av: r.who === "me" ? MY_AV : AV[r.who] }));
  window.JIA_league = { ME, paint, standings };                               // the medals read and grow the streak
})();

