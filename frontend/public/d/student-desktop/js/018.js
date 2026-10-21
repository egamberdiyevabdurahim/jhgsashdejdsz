
(() => {
  "use strict";

  /* ==========================================================
     APPLICATIONS — one tracker per university, tied to the roadmap,
     with essays you can send to a teacher. Opens from "My
     applications" on Home, the roadmap and Explore.
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const z = () => String(window.JIA_z ? window.JIA_z() : 62);
  const notify = x => { if (window.JIA_notify) window.JIA_notify(x); };
  const P = () => window.JIA_PEOPLE || {}, AVS = () => window.JIA_AV || {};
  const photo = k => (window.JIA_UNI || {})[k] || "";
  const date = s => new Date(s + "T23:59:00");
  const daysLeft = d => (d ? Math.max(0, Math.ceil((d - new Date()) / 864e5)) : null);   /* JG-PROD: owner 3 Oct R14, a chosen university may have no confirmed date */
  const fmtDate = d => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "date being confirmed");   /* JG-PROD: owner 3 Oct R14 */
  const words = t => (t.trim().match(/\S+/g) || []).length;
  const E = (t, limit, text, st, extra) => Object.assign({ t, limit, text: text || "", st: st || (text ? "draft" : "none") }, extra || {});
  const APPS = [
    { key: "mit", name: "MIT", full: "Massachusetts Institute of Technology", plan: "Early Action", dl: date("2026-11-01"), fit: "Your goal",
      check: [["Common App profile", true], ["MIT application portal", true], ["SAT scores sent", true], ["Teacher recommendations (2)", false], ["Counselor report", false], ["Transcript", false], ["Fee or fee waiver", false]],
      essays: [E("Short answer: the field of study that excites you most", 200, "Robots that help farmers fascinate me. Last summer I built a small soil sensor from a kit and watched my uncle use it in his orchard in Fergana. I want to study mechanical engineering to make tools like that cheaper and stronger."),
               E("Short answer: the world you come from", 250), E("Short answer: a challenge you faced", 250)] },
    { key: "harvard", name: "Harvard", full: "Harvard University", plan: "Regular Decision", dl: date("2027-01-01"), fit: "Reach",
      check: [["Common App profile", true], ["SAT scores sent", true], ["Teacher recommendations (2)", false], ["Counselor report", false], ["Transcript", false], ["Fee or fee waiver", false]],
      essays: [E("Common App personal essay", 650, "My grandmother never learned to read, but she could calculate the price of a whole market stall in her head. Every Sunday I sat next to her in the Chorsu bazaar and tried to beat her at it. I never won. Those Sundays taught me that numbers are a language, and that people learn it in many different ways.", "reviewed",
                 { teacher: "kamila", fb: [{ q: "My grandmother never learned to read, but she could calculate the price of a whole market stall in her head.", n: "A strong, specific opening. Keep it exactly like this." },
                                           { q: "Those Sundays taught me that numbers are a language", n: "Show one moment where you felt this instead of stating it. What exactly did she say?" },
                                           { q: "", n: "You have about 590 words left. Use them to show how this shapes what you want to study." }], overall: "A promising start with a real voice. Build it around one or two scenes." }),
               E("Harvard: an intellectual experience that mattered", 200)] },
    { key: "purdue", name: "Purdue", full: "Purdue University", plan: "Early Action", dl: date("2026-11-01"), fit: "In range",
      check: [["Common App profile", true], ["SAT scores sent", true], ["Transcript", false], ["Fee or fee waiver", false]],
      essays: [E("Why this major at Purdue?", 250)] },
  ]; const syncApps = () => { if (!window.JG_ENGINE) return; const g = window.JG_ENGINE.cache && window.JG_ENGINE.cache.goal, unis = (g && g.unis) || [], k = unis.map(u => u.key).join(); if (syncApps.k === k) return; const extra = syncApps.k == null ? [] : APPS.filter(a => !a.goal && !unis.some(u => u.key === a.key)); syncApps.k = k; APPS.splice(0, APPS.length, ...unis.map((u, i) => ({ key: u.key, name: u.short, full: u.name, plan: u.deadline_name || "Application", dl: u.deadline ? date(u.deadline) : null, fit: i ? "On your list" : "Your goal", check: [], essays: [], goal: true, sent: (window.JG_ENGINE.cache.apps_submitted || []).indexOf(u.key) !== -1, photo: u.photo ? `/d/student-desktop/media/${u.photo}` : window.JG_RUNTIME && window.JG_RUNTIME.initialsSvg ? window.JG_RUNTIME.initialsSvg(u.short) : "" })), ...extra); }; syncApps(); document.addEventListener("jg:goal", () => { syncApps(); if (window.JIA_paintApps) window.JIA_paintApps(); });   /* JG-PROD: owner 3 Oct R14, a real student's applications are the universities they chose, with nothing invented (no essays, no teacher notes, no sample deadlines); rows added later from the College Guide stay */   /* JG-PROD: owner 3 Oct R14, "jg:goal" (paintHome) lists them again, and the desktop overview with them, when a diagnostic finishes in this page */   /* JG-PROD: owner 7 Oct P5int, the P5i ↔ P5d port: an application he marked submitted stays "✓ Submitted" (snapshot apps_submitted) */
  const TEACHERS = ["kamila", "aziza", "bekzod"];
  const pct = a => { const R = window.JG_ENGINE && window.JG_ENGINE.cache.ready; if (R && R.by_uni && R.by_uni[a.key] != null) return R.by_uni[a.key]; const n = a.check.length + a.essays.length, d = a.check.filter(c => c[1]).length + a.essays.filter(e => e.st === "reviewed" || e.st === "final").length; return n ? Math.round(d / n * 100) : 0; };   /* JG-PROD: owner 3 Oct R14, a new application has nothing to count yet; owner 4 Oct R14r, a university a real student chose reads his "% ready" for it (the engine's v2, Home's number for his goal), not the checklist's ticks */
  const ST = { none: "Not started", draft: "Draft", sent: "With teacher", reviewed: "Reviewed", final: "Final" };
  const stLabel = e => e.st === "sent" ? `With ${esc(P()[e.teacher] ? P()[e.teacher].name.split(" ")[0] : "teacher")}` : ST[e.st];
  const fitCls = f => f === "Your goal" ? "goal" : f === "Reach" ? "reach" : "fit";

  const view = $("ap-view"), body = $("ap-body");
  window.JIA_APPS = APPS; window.JIA_appPct = pct;              // the overview on Home shows the same progress
  let cur = null;
  function paintList() {
    cur = null; syncApps(); $("ap-title").textContent = "Applications";   /* JG-PROD: owner 3 Oct R14 */
    const open = APPS.filter(a => !a.sent && a.dl).sort((a, b) => a.dl - b.dl), next = open[0];   /* JG-PROD: owner 3 Oct R14, the next deadline is a dated one */
    body.innerHTML = (next ? `<div class="ap-next"><span>Next deadline</span><b>${next.name}, ${next.plan}</b><em>${fmtDate(next.dl)} · ${daysLeft(next.dl)} days left</em></div>` : "")
      + APPS.map(a => `<button class="ap-card" type="button" data-k="${a.key}">
          <img src="${a.photo || photo(a.key)}" alt=""><span class="ap-ct"><b>${a.name}</b><small>${a.plan} · ${fmtDate(a.dl)}${a.sent ? " · Submitted ✓" : ""}</small><i class="ap-bar"><i style="width:${pct(a)}%"></i></i></span>
          <em class="ap-fit ${fitCls(a.fit)}">${a.fit}</em></button>`).join("")
      + ((C => C && C.list ? `<p class="ap-note"><b>${C.list}</b></p>` : "")(window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance())) + `<p class="ap-note">${window.JG_ENGINE ? "The universities you chose in the diagnostic. Deadlines come from our rules base and are being confirmed: always check each university's website." + (window.JG_UNIS ? ` <button class="rm-applink" type="button" data-uz="">${window.JG_UNIS.label()}</button>` : "") : "Your roadmap readiness decides the fit: MIT is your goal, Harvard a reach, Purdue in range. Sample deadlines: always check each university's website."}</p>`;   /* JG-PROD: owner 3 Oct R14 */   /* JG-PROD: owner 4 Oct R5, the way to "Universities in Uzbekistan" (public/runtime/jg-unis.js) */   /* JG-PROD: owner 7 Oct P5d, "at least one of your list", never independent (spec §3.8) */
  }
  function paintDetail(a) {
    cur = a; $("ap-title").textContent = a.name;
    const p = pct(a);
    body.innerHTML = `<div class="ap-hero"><img src="${a.photo || photo(a.key)}" alt=""><div><h3>${a.full}</h3><p>${a.plan} · ${fmtDate(a.dl)}${a.dl ? ` · <b>${daysLeft(a.dl)} days left</b>` : ""}${"" /* JG-PROD: owner 3 Oct R14, no countdown without a confirmed date */}</p><em class="ap-fit ${fitCls(a.fit)}">${a.fit}</em></div></div>
      <div class="ap-prog"><b>${(C => C ? C.long : `${p}% ready`)(window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance(a.key))}</b>${"" /* JG-PROD: owner 7 Oct P5d, his chance at this university, with its range or what opens it (owner decision 1) */}<i class="ap-bar"><i style="width:${p}%"></i></i></div>
      ${(CK => CK.length ? `<p class="ap-h">Checklist</p><div class="ap-list">${CK.join("")}</div>` : "")(a.goal && window.JG_ENGINE ? ((window.JG_ENGINE.cache.apps_check || {})[a.key] || []).map(c => `<div class="ap-ck" role="checkbox" aria-checked="${c.done}" aria-readonly="true" style="cursor:default;background:none"><i aria-hidden="true"></i>${esc(c.text)}</div>`) : a.check.map((c, k) => `<button class="ap-ck" type="button" role="checkbox" aria-checked="${c[1]}" data-ck="${k}"><i aria-hidden="true"></i>${esc(c[0])}</button>`))}${"" /* JG-PROD: owner 4 Oct R13 (P4e G4), a real student's chosen university lists what the engine knows it still needs (apps_check: its record's items, else his roadmap's milestones on its route), read-only; with none, no empty "Checklist" heading; P4e G4 review: they are not buttons (nothing to tap), and an undecided one says what he has */}
      ${a.essays.length || !window.JG_ENGINE ? `<p class="ap-h">Essays</p><div class="ap-list">${a.essays.map((e, k) => `<button class="ap-es" type="button" data-es="${k}"><span><b>${esc(e.t)}</b><small>${words(e.text)} / ${e.limit} words</small></span><em class="es-st ${e.st}">${stLabel(e)}</em></button>`).join("")}</div>` : ""}${"" /* JG-PROD: owner 4 Oct R13 (P4e G4), no empty "Essays" heading: a real student's university has no essay until he adds one */}
      <button class="cm-primary ap-submit" type="button" id="ap-submit"${a.sent ? " disabled" : ""}>${a.sent ? "✓ Submitted" : "Mark as submitted"}</button>`;
  }
  function openApps(key) {
    if (view.hidden) { view.style.zIndex = z(); view.hidden = false; }
    const a = key && APPS.find(x => x.key === key);
    a ? paintDetail(a) : paintList();
    $("ap-body").scrollTop = 0;
    setTimeout(() => $("ap-back").focus({ preventScroll: true }), 60);
  }
  window.JIA_openApps = openApps;
  window.JIA_addApp = (key, info) => {                         // from Explore: add a university to the tracker
    if (APPS.find(a => a.key === key)) return false;
    APPS.push(window.JG_ENGINE ? { key, name: info.name, full: info.full || info.name, plan: "Application", dl: null, fit: "On your list", photo: info.photo, check: [], essays: [] } : { key, name: info.name, full: info.full || info.name, plan: "Early Action", dl: date("2026-11-01"), fit: info.fit || "In range", photo: info.photo,   /* JG-PROD: owner 4 Oct R13 (P4e G4 review), a university a real student adds from Explore gets no invented plan, deadline, countdown, fit, ticked step or essay (the page hides the empty headings); the demo keeps the design's row */
      check: [["Common App profile", true], ["SAT scores sent", false], ["Teacher recommendations (2)", false], ["Transcript", false], ["Fee or fee waiver", false]],
      essays: [E(`Why ${info.name}?`, 250)] });
    notify({ icon: info.photo, text: `<b>${esc(info.name)}</b> was added to your applications`, go: () => openApps(key) });
    return true;
  };
  $("ap-back").addEventListener("click", () => { if (cur) paintList(); else view.hidden = true; });
  body.addEventListener("click", e => {
    const card = e.target.closest(".ap-card"), ck = e.target.closest(".ap-ck"), es = e.target.closest(".ap-es"), sub = e.target.closest("#ap-submit");
    if (card) paintDetail(APPS.find(a => a.key === card.dataset.k));
    else if (ck) { const c = cur.check[+ck.dataset.ck]; if (c) { c[1] = !c[1]; paintDetail(cur); } }   /* JG-PROD: owner 4 Oct R13 (P4e G4), the engine's rows (no data-ck) are read-only */
    else if (es) openEssay(cur, +es.dataset.es);
    else if (sub && !cur.sent) {
      cur.sent = true; paintDetail(cur); if (window.JG_ENGINE && window.JG_ENGINE.commit) window.JG_ENGINE.commit("app_submitted", { university_id: cur.key }, { quiet: ["university", "not_done"] });   /* JG-PROD: owner 7 Oct P5int, the P5i ↔ P5d port: a real student's "Mark as submitted" is saved (the commit app_submitted) and freezes the forecast he applied with (spec §3.10.3) */
      notify({ icon: cur.photo || photo(cur.key), text: `<b>${cur.name} application submitted</b>. Good luck! 🎉`, go: () => openApps(cur.key) });
    }
  });
  const rmBtn = $("rm-apps"); if (rmBtn) rmBtn.addEventListener("click", () => openApps());

  /* ---------- essays: write, then send to a teacher ---------- */
  const esView = $("es-view"), esText = $("es-text"), teach = $("es-teach");
  let esA = null, esK = -1;
  function paintEssay() {
    const e = esA.essays[esK];
    $("es-title").textContent = "Essay"; $("es-uni").textContent = esA.full; $("es-prompt").textContent = e.t;
    esText.value = e.text; esText.readOnly = e.st === "sent";
    $("es-status").innerHTML = `<em class="es-st ${e.st}">${stLabel(e)}</em>${e.st === "sent" ? `<span>${esc(P()[e.teacher].name)} is reading it. You'll get a notification.</span>` : ""}`;
    count();
    $("es-send").hidden = e.st === "sent";
    $("es-send").textContent = e.st === "reviewed" ? "Send the new version" : "Send to a teacher";
    const fb = $("es-fb");
    fb.hidden = !(e.fb && e.st === "reviewed");
    if (!fb.hidden) fb.innerHTML = `<p class="ap-h">Feedback from ${esc(P()[e.teacher].name)}</p>` + e.fb.map(f => `<div class="es-c">${f.q ? `<q>${esc(f.q)}</q>` : ""}<p>${esc(f.n)}</p></div>`).join("") + `<div class="es-c all"><p><b>Overall:</b> ${esc(e.overall)}</p></div>`;
  }
  function count() {
    const e = esA.essays[esK], n = words(esText.value);
    $("es-count").textContent = `${n} / ${e.limit} words`;
    $("es-count").classList.toggle("over", n > e.limit);
  }
  function openEssay(a, k) { esA = a; esK = k; paintEssay(); esView.style.zIndex = z(); esView.hidden = false; setTimeout(() => esText.focus({ preventScroll: true }), 300); }
  function saveEssay(quiet) {
    const e = esA.essays[esK];
    if (e.st === "sent") return;
    e.text = esText.value; if (e.st === "none" && e.text.trim()) e.st = "draft";
    if (!quiet) { $("es-save").textContent = "Saved ✓"; setTimeout(() => { $("es-save").textContent = "Save"; }, 1200); }
  }
  esText.addEventListener("input", count);
  $("es-save").addEventListener("click", () => saveEssay(false));
  $("es-back").addEventListener("click", () => { saveEssay(true); esView.hidden = true; if (cur) paintDetail(cur); });
  $("es-send").addEventListener("click", () => {
    if (!words(esText.value)) { esText.focus(); return; }
    const scr = window.JIA_screen ? window.JIA_screen(esText.value) : null;
    if (scr && scr.blocked) { $("es-count").textContent = "Remove phone numbers and links before sending."; return; }
    $("es-tlist").innerHTML = TEACHERS.map(w => `<button type="button" data-t="${w}"><img src="${AVS()[w]}" alt=""><span><b>${esc(P()[w].name)}</b><small>${esc(P()[w].tag)}</small></span></button>`).join("");
    teach.style.zIndex = z(); teach.hidden = false;
  });
  teach.addEventListener("click", e => {
    if (e.target.closest("[data-teach-close]")) { teach.hidden = true; return; }
    const b = e.target.closest("[data-t]"); if (!b) return;
    teach.hidden = true;
    saveEssay(true);
    const a = esA, k = esK, ess = a.essays[k], who = b.dataset.t;
    ess.st = "sent"; ess.teacher = who; paintEssay();
    setTimeout(() => {                                         // the teacher reviews it (simulated here)
      const sents = ess.text.split(/(?<=[.!?])\s+/).filter(Boolean), n = words(ess.text);
      ess.fb = [
        { q: sents[0] || "", n: "Good start. Can you open with one specific moment instead of a general statement?" },
        { q: sents[Math.min(sents.length - 1, 2)] || "", n: "Show, don't tell: add one concrete detail here, like a name, a number or a place." },
        { q: "", n: n > ess.limit ? `You're ${n - ess.limit} words over the limit. Cut repeated ideas first.` : `You have ${ess.limit - n} words left. Use them to show what you learned and why it matters for ${a.name}.` },
      ];
      ess.overall = "Nice draft with a real voice. Keep one clear story and end with what it means for your future.";
      ess.st = "reviewed";
      if (!esView.hidden && esA === a && esK === k) paintEssay();
      if (cur === a && !view.hidden) paintDetail(a);
      notify({ who, text: `<b>${esc(P()[who].name)}</b> reviewed your essay "${esc(ess.t)}"`, go: () => { openApps(a.key); openEssay(a, k); } });
    }, 7000);
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!teach.hidden) { teach.hidden = true; e.preventDefault(); }
    else if (!esView.hidden && +esView.style.zIndex >= +view.style.zIndex) { saveEssay(true); esView.hidden = true; if (cur) paintDetail(cur); e.preventDefault(); }
    else if (!view.hidden) { if (cur) paintList(); else view.hidden = true; e.preventDefault(); }
  });
  // reminders and "add to calendar" live with Lessons on desktop (REMINDERS AND "ADD TO CALENDAR")
  // desktop: clicking the dimmed page beside the tracker or the essay closes it
  [[view, () => { view.hidden = true; }], [esView, () => { const b = $("es-back"); if (b) b.click(); }]].forEach(([el, shut]) => {
    el.addEventListener("click", e => { if (e.target === el && e.clientX < el.getBoundingClientRect().left) shut(); });
  });
})();

