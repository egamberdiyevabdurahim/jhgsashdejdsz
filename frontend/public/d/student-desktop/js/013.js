
(() => {
  "use strict";

  /* ==========================================================
     LESSONS — Live at the top, then one row per subject. Click a
     lesson and it opens out of its card: the player and teacher on
     the left, the rest of the course beside them.
     Edit SUBJECTS and LIVE to change it.
     ========================================================== */
  const IMG = {"sat": "/d/student-desktop/media/a23be1f07f4068ba.webp", "atom": "/d/student-desktop/media/d422bc9be63339fb.webp", "ielts": "/d/student-desktop/media/cbcd80723b6f25f6.webp", "brain": "/d/student-desktop/media/ec6fee9e3b68749e.webp", "backpack": "/d/student-desktop/media/956f6568e0298f98.webp"};
  window.JIA_IMG = Object.assign(window.JIA_IMG || {}, IMG);      // shared with Community (stories, posts)

  const SUBJECTS = [
    { key: "sat", name: "SAT", course: "SAT preparation", img: "sat", g: ["#e0ecfa", "#c3daf4"], ink: "#214269", sh: "rgba(33, 66, 105, .14)",
      teacher: "Aziza Karimova", role: "SAT teacher",
      lessons: [
        { t: "Linear equations", m: 18, p: 1, about: "Solve one-variable equations quickly and spot the patterns the SAT repeats." },
        { t: "Systems of equations", m: 22, p: .6, about: "Substitution, elimination, and when to skip the algebra and test the answers." },
        { t: "Main idea and purpose", m: 15, p: 0, about: "Read for the author's point first, then prove every answer with a line from the text." },
        { t: "Punctuation: commas", m: 12, p: 0, about: "The four comma rules that cover almost every SAT writing question." },
        { t: "Word problems", m: 20, p: 0, about: "Turn long stories into short equations without losing time." },
      ] },
    { key: "ap", name: "AP", course: "AP courses", img: "atom", g: ["#e8e2f8", "#d2c7ef"], ink: "#342169", sh: "rgba(52, 33, 105, .13)",
      teacher: "Javlon Tursunov", role: "AP teacher",
      lessons: [
        { t: "Limits and continuity", m: 24, p: .3, about: "What a limit really means, and how to read it from graphs, tables and formulas." },
        { t: "Derivatives", m: 26, p: 0, about: "The rules you need and how to use them on free-response questions." },
        { t: "Kinematics", m: 21, p: 0, about: "Motion in one and two dimensions, step by step." },
        { t: "Stoichiometry", m: 19, p: 0, about: "Moles, ratios and limiting reagents without memorising tricks." },
      ] },
    { key: "ielts", name: "IELTS", course: "IELTS Academic", img: "ielts", g: ["#fbeedf", "#f5ddc2"], ink: "#694721", sh: "rgba(105, 71, 33, .14)",
      teacher: "Kamila Saidova", role: "IELTS teacher",
      lessons: [
        { t: "Writing Task 2: structure", m: 17, p: .8, about: "A clear four-paragraph plan that keeps your essay on task." },
        { t: "Speaking Part 2: cue cards", m: 14, p: 0, about: "Plan in one minute, then speak for two without running out of ideas." },
        { t: "Listening: maps", m: 16, p: 0, about: "Follow directions on a map and catch the answers as they come." },
        { t: "Reading: True, False, Not Given", m: 18, p: 0, about: "The difference between False and Not Given, with practice passages." },
      ] },
    { key: "psy", name: "Psychology", course: "Psychology", img: "brain", g: ["#fae1e4", "#f2c4cb"], ink: "#69212b", sh: "rgba(105, 33, 43, .13)",
      teacher: "Bekzod Aliev", role: "Psychology teacher",
      lessons: [
        { t: "What is psychology?", m: 12, p: 0, about: "The main questions psychologists ask and how they study them." },
        { t: "Memory and forgetting", m: 16, p: 0, about: "How memories form, why we forget, and how to study so it sticks." },
        { t: "Cognitive biases", m: 15, p: 0, about: "The shortcuts our minds take, and how they shape everyday decisions." },
      ] },
  ]; if (window.JG_ENGINE) SUBJECTS.forEach(s => { s.teacher = ""; s.role = ""; s.lessons.forEach(l => { l.p = 0; }); });   /* JG-PROD: owner 4 Oct R6, the design's course teacher is not a real student's: each lesson names its own teacher from the placeholder file instead (JG-PROD: owner 4 Oct R6 placeholder teachers, test phase, D19: line 63); P4d re-walk F3 (owner 4 Oct R11), and no invented progress: a real student has watched none of them (no "Done", no part-watched bar, the player starts at 0:00) */
  const LIVE = [
    { key: "adm", title: "Live admission", img: "backpack", g: ["#e6f5eb", "#cde9da"], ink: "#1e684a", sh: "rgba(30, 104, 74, .14)",
      host: "JIA Admissions team", role: "Live now", live: true, viewers: 128,
      about: "Ask anything about applications, essays and deadlines. The admissions team answers questions live.",
      next: [{ t: "Essays that stand out", when: "Thu, 18:00" }, { t: "Choosing your universities", when: "Sat, 17:00" }] },
    { key: "satlive", title: "Live SAT course", img: "sat", g: ["#e0ecfa", "#c3daf4"], ink: "#214269", sh: "rgba(33, 66, 105, .14)",
      host: "Aziza Karimova", role: "Starts today at 19:00", live: false, when: "Today, 19:00",
      about: "A live SAT math sprint: hard questions worked through together, with practice as you go.",
      next: [{ t: "Reading sprint", when: "Wed, 19:00" }, { t: "Full practice test review", when: "Sun, 11:00" }] },
  ]; if (window.JG_ENGINE) LIVE.splice(0);   /* JG-PROD: owner 4 Oct R13 (P4e G1 review), no invented live session or viewer count for a real student ("Live admission · 128 watching", "Live SAT course · Today, 19:00"): the list is empty until real sessions exist (P3 People, P7); it also covers owner 4 Oct R6 (no invented host) */

  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = $("v-lessons"), subsEl = $("ls-subjects"), liveRow = $("ls-live-row");
  const detail = $("ls-detail"), clip = $("ls-clip"), morph = $("ls-morph"), player = $("ls-player"), list = $("ls-list");
  const vars = c => `--g1:${c.g[0]};--g2:${c.g[1]};--ink2:${c.ink};--sh:${c.sh}`;
  const initials = n => n.split(" ").map(w => w[0]).join("").slice(0, 2); const tchOf = (key, i) => (window.JG_ENGINE && window.JG_ENGINE.teacher ? window.JG_ENGINE.teacher(key, i) : null), tchName = (s, i) => (window.JG_ENGINE ? (tchOf(s.key, i) || {}).name || "" : s.teacher); let tch = null; function paintWho(kind, data, i) { tch = kind === "lesson" && window.JG_ENGINE ? tchOf(data.key, i) : null; const who = kind === "live" ? data.host : window.JG_ENGINE ? (tch ? tch.name : "") : data.teacher, row = $("ls-av").parentElement; $("ls-av").textContent = who ? initials(who) : ""; $("ls-av").style.display = $("ls-tname").parentElement.style.display = who ? "" : "none"; row.style.display = who || kind === "live" ? "" : "none"; $("ls-join").style.marginLeft = who ? "" : "0"; $("ls-tname").textContent = who || ""; $("ls-trole").textContent = kind === "live" || !window.JG_ENGINE ? data.role : tch ? tch.role : ""; row.style.cursor = tch ? "pointer" : ""; if (tch) { row.setAttribute("role", "button"); row.tabIndex = 0; row.setAttribute("aria-label", tch.open); } else ["role", "tabindex", "aria-label"].forEach(a => row.removeAttribute(a)); }   /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase, D19): a real student's lesson names its own teacher, from src/engine/data/teachers.placeholder.json through the snapshot (JG_ENGINE.teacher), and the player's teacher row is the button that opens the teacher card (M:010:1162); P4d's interim (no teacher: the row hidden, a live session's Join and Add to calendar at the row's start) stays for an engine that serves none; the demo keeps the design's course teacher */
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const PLAY = `<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>`, PAUSE = `<svg viewBox="0 0 24 24"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg>`;
  const CHECK = `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

  /* ---------- the page ---------- */
  subsEl.innerHTML = SUBJECTS.map((s, si) => `
      <section class="ls-sub" style="${vars(s)}" aria-labelledby="ls-h-${s.key}">
        <div class="ls-head ls-pad"><span class="ls-ic" aria-hidden="true"><img src="${IMG[s.img]}" alt=""></span><h2 id="ls-h-${s.key}">${s.name}</h2><span class="ls-n">${s.lessons.length} lessons</span></div>
        <div class="ls-row">${s.lessons.map((l, i) => `
          <button class="ls-card" type="button" data-s="${si}" data-i="${i}" aria-label="${s.name}, lesson ${i + 1}: ${l.t}, ${l.m} minutes${l.p >= 1 ? ", done" : ""}">
            <span class="ls-cover"><span class="ls-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><img src="${IMG[s.img]}" alt="">
              <span class="ls-dur">${PLAY}${l.m} min</span></span>
            <span class="ls-body"><span class="ls-ttl">${l.t}</span>
              ${l.p >= 1 ? `<span class="ls-meta done">Done</span>` : tchName(s, i) ? `<span class="ls-meta">${tchName(s, i)}</span>` : "" /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase, D19): each lesson's own teacher for a real student, the course's for the demo; no line without one */}
              ${l.p > 0 && l.p < 1 ? `<span class="ls-bar"><i style="width:${Math.round(l.p * 100)}%"></i></span>` : ""}</span>
          </button>`).join("")}
        </div>
      </section>`).join("");
  liveRow.innerHTML = LIVE.map((v, i) => `
      <button class="ls-lcard" type="button" data-live="${i}" style="${vars(v)}" aria-label="${v.title}, ${v.live ? "live now" : v.when}">
        <span class="ls-pill ${v.live ? "live" : "soon"}">${v.live ? "LIVE" : v.when}</span>
        <span class="ls-lt2">${v.title}</span>${v.host ? `<span class="ls-host">${v.host}</span>` : "" /* JG-PROD: owner 4 Oct R6, no host line without a confirmed host */}
        <span class="ls-watch">${v.live ? `${v.viewers} watching` : "Set a reminder"}</span>
        <img src="${IMG[v.img]}" alt="">
      </button>`).join("") || (window.JG_ENGINE ? `<p class="pf-empty" style="flex:1;grid-column:1/-1">No live sessions yet.</p>` : ""); if (window.JG_ENGINE && !LIVE.length) liveRow.parentElement.querySelector(".ls-dot").hidden = true;   /* JG-PROD: owner 4 Oct R13 (P4e G1 review), an empty live row says so (the profile's own .pf-empty, across the row) and the pulsing red dot goes: nothing is live */

  /* ---------- inside a lesson ---------- */
  let cur = null, lessonIdx = 0, playing = false, t = 0, tick = 0, fromCard = null, busy = false, reminders = new Set();
  function setPlaying(on) {
    playing = on;
    player.classList.toggle("playing", on);
    $("ls-pp").innerHTML = on ? PAUSE : PLAY;
    $("ls-pp").setAttribute("aria-label", on ? "Pause" : "Play");
    clearInterval(tick);
    if (on) tick = setInterval(() => { t = Math.min(t + 1, total()); paintTime(); if (t >= total()) setPlaying(false); }, 1000);
  }
  const total = () => cur && !cur.live && cur.lessons ? cur.lessons[lessonIdx].m * 60 : 3600;
  function paintTime() {
    $("ls-t").textContent = mmss(t);
    $("ls-total").textContent = cur && cur.lessons ? mmss(total()) : "LIVE";
    $("ls-progbar").style.width = `${(t / total() * 100).toFixed(2)}%`;
  }
  function showLesson(i) {                                   // switch to another lesson of this course
    lessonIdx = i;
    const l = cur.lessons[i];
    $("ls-lt").textContent = `Lesson ${i + 1}: ${l.t}`;
    $("ls-desc").textContent = l.about;
    t = Math.round(l.p * l.m * 60) % (l.m * 60);
    setPlaying(false); paintTime();
    [...list.children].forEach((li, k) => li.classList.toggle("on", k === i)); if (window.JG_ENGINE) paintWho("lesson", cur, i);   /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase): another lesson of the course can have another teacher (the SAT course's math and its reading and writing) */
  }
  function fill(kind, data) {
    cur = data;
    detail.setAttribute("style", vars(data));
    $("ls-obj").src = IMG[data.img];
    paintWho(kind, data, lessonIdx);   /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase, D19): the teacher row (initials, name, role, and the card's button for a real student) is paintWho's (line 63), as P4d's hiding was here; showLesson paints a lesson's own teacher again (line 113) */
    if (!window.JG_ENGINE) $("ls-tname").textContent = kind === "live" ? data.host : data.teacher;   /* JG-PROD: owner 4 Oct R6 placeholder teachers: a real student's is paintWho's (line 63) */
    if (!window.JG_ENGINE) $("ls-trole").textContent = kind === "live" ? data.role : data.role;   /* JG-PROD: owner 4 Oct R6 placeholder teachers: a real student's is paintWho's (line 63) */
    const pill = $("ls-livepill");
    pill.hidden = kind !== "live";
    pill.className = `ls-pill ${data.live ? "live" : "soon"}`;
    pill.textContent = data.live ? "LIVE" : data.when || "";
    $("ls-viewers").hidden = !(kind === "live" && data.live);
    $("ls-viewers").textContent = data.viewers ? `${data.viewers} watching` : "";
    $("ls-ctrl").hidden = kind === "live" && !data.live;
    $("ls-big").hidden = kind === "live" && !data.live;
    const join = $("ls-join");
    join.hidden = kind !== "live";
    $("ls-cal").hidden = kind !== "live" || !!data.live;
    if (kind === "live") {
      $("ls-course").textContent = "Live";
      $("ls-lt").textContent = data.title;
      $("ls-desc").textContent = data.about;
      join.textContent = data.live ? "Join" : reminders.has(data.key) ? "Reminder set" : "Remind me";
      join.classList.toggle("set", !data.live && reminders.has(data.key));
      $("ls-h3").textContent = "Coming up";
      list.innerHTML = data.next.map((n, k) => `<li class="ls-item"><span class="ls-ino">${k + 1}</span><span class="ls-itt">${n.t}</span><span class="ls-itd">${n.when}</span></li>`).join("");
      t = 0; setPlaying(false); paintTime();
    } else {
      $("ls-course").textContent = data.course;
      $("ls-h3").textContent = "Lessons";
      list.innerHTML = data.lessons.map((l, k) => `<li class="ls-item${l.p >= 1 ? " done" : ""}" data-k="${k}" tabindex="0" role="button">
          <span class="ls-ino">${l.p >= 1 ? CHECK : k + 1}</span><span class="ls-itt">${l.t}</span><span class="ls-itd">${l.m} min</span></li>`).join("");
    }
  }
  list.addEventListener("click", e => { const li = e.target.closest(".ls-item[data-k]"); if (li && cur.lessons) { showLesson(+li.dataset.k); $("ls-scroll").scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); } });
  list.addEventListener("keydown", e => { const li = e.target.closest(".ls-item[data-k]"); if (li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); li.click(); } }); const tRow = $("ls-av").parentElement; tRow.addEventListener("click", e => { if (tch && !e.target.closest("button") && window.JIA_openTeacher) window.JIA_openTeacher(tch); }); tRow.addEventListener("keydown", e => { if (tch && e.target === tRow && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tRow.click(); } });   /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase, D19): a tap, Enter or Space on a real student's teacher row opens the teacher card (M:010:1162) above the lesson; Escape closes the card first (the layers' capture handler) */
  $("ls-big").addEventListener("click", () => setPlaying(true));
  $("ls-pp").addEventListener("click", () => setPlaying(!playing));
  $("ls-cal").addEventListener("click", () => { if (cur && window.JIA_calendar && window.JIA_parseWhen) window.JIA_calendar({ title: cur.title, start: window.JIA_parseWhen((cur.next && cur.next[0] && cur.next[0].when) || cur.when || ""), mins: 60, place: "Online, in the JIA app" }); });
  $("ls-join").addEventListener("click", () => {
    if (!cur || !cur.key) return;
    if (cur.live) { setPlaying(true); return; }
    const j = $("ls-join");
    if (reminders.has(cur.key)) reminders.delete(cur.key); else reminders.add(cur.key);
    const on = reminders.has(cur.key);
    const whenOf = c => (c.next && c.next[0] && c.next[0].when) || c.when || "";
    if (on && window.JIA_remind && window.JIA_parseWhen) window.JIA_remind({ title: cur.title, start: window.JIA_parseWhen(whenOf(cur)), icon: IMG[cur.img] });
    j.textContent = on ? "Reminder set" : "Remind me"; j.classList.toggle("set", on);
    const card = liveRow.children[LIVE.indexOf(cur)];
    if (card) card.querySelector(".ls-watch").textContent = on ? "Reminder set" : "Set a reminder";
  });

  // it opens out of the card you tapped, and folds back into it
  const insetOf = el => {
    const d = detail.getBoundingClientRect(), r = el.getBoundingClientRect();
    return `inset(${(r.top - d.top).toFixed(1)}px ${(d.right - r.right).toFixed(1)}px ${(d.bottom - r.bottom).toFixed(1)}px ${(r.left - d.left).toFixed(1)}px round 20px)`;
  };
  function open(card, kind, data, idx) {
    if (busy) return;
    fromCard = card;
    fill(kind, data);
    if (kind === "lesson") showLesson(idx);
    detail.hidden = false;
    $("ls-scroll").scrollTop = 0;
    document.addEventListener("keydown", onKey);
    $("ls-back").focus({ preventScroll: true });
    if (reduce) return;
    busy = true;
    morph.style.background = `linear-gradient(150deg, ${data.g[0]}, ${data.g[1]})`;
    clip.animate([{ clipPath: insetOf(card) }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], { duration: 480, easing: "cubic-bezier(.2, .8, .2, 1)" });
    morph.animate([{ opacity: 1 }, { opacity: 1, offset: .2 }, { opacity: 0 }], { duration: 480, easing: "ease-out" });
    const from = card.querySelector("img").getBoundingClientRect(), to = $("ls-obj").getBoundingClientRect();
    $("ls-obj").animate([
      { transform: `translate(${(from.left + from.width / 2 - to.left - to.width / 2).toFixed(1)}px, ${(from.top + from.height / 2 - to.top - to.height / 2).toFixed(1)}px) translate(-50%, -50%) scale(${(from.width / to.width).toFixed(3)}) rotate(6deg)` },
      { transform: "translate(-50%, -50%) rotate(4deg)" },
    ], { duration: 600, easing: "cubic-bezier(.2, .9, .25, 1)" });
    document.querySelector("#ls-scroll .ls-info").animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 150, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" });
    setTimeout(() => { busy = false; }, 500);
  }
  function close() {
    if (busy || detail.hidden) return;
    setPlaying(false);
    document.removeEventListener("keydown", onKey);
    const done = () => { detail.hidden = true; busy = false; [clip, morph].forEach(el => el.getAnimations().forEach(a => a.cancel())); if (fromCard) fromCard.focus({ preventScroll: true }); };
    if (reduce || !fromCard) return done();
    const r = fromCard.getBoundingClientRect(), d = detail.getBoundingClientRect();
    busy = true;
    if (r.bottom < d.top + 10 || r.top > d.bottom - 10 || r.right < d.left + 10 || r.left > d.right - 10) {
      clip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }).onfinish = done;
      return;
    }
    morph.style.background = `linear-gradient(150deg, ${cur.g[0]}, ${cur.g[1]})`;
    clip.animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: insetOf(fromCard) }], { duration: 400, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" }).onfinish = done;
    morph.animate([{ opacity: 0 }, { opacity: 1, offset: .7 }, { opacity: 1 }], { duration: 400, fill: "forwards" });
  }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
  $("ls-back").addEventListener("click", close); window.JIA_openDetail = (card, data, i) => open(card, "lesson", data, i);   /* JG-PROD: owner 12 Oct 2026, the lessons part (SPEC-lessons §10.1): a real course's lesson opens in this same page, out of its own card (public/runtime/jg-lessons-desktop.js fills the player's place with the lesson's reader) */
  subsEl.addEventListener("click", e => {
    const c = e.target.closest(".ls-card");
    if (c) open(c, "lesson", SUBJECTS[+c.dataset.s], +c.dataset.i);
  });
  liveRow.addEventListener("click", e => {
    const c = e.target.closest(".ls-lcard");
    if (c) open(c, "live", LIVE[+c.dataset.live], 0);
  });

  // leaving the tab closes a lesson that was open
  let shown = false;
  new MutationObserver(() => {
    const on = page.classList.contains("show");
    if (!on && shown && !detail.hidden) { setPlaying(false); detail.hidden = true; busy = false; document.removeEventListener("keydown", onKey); }
    shown = on;
  }).observe(page, { attributes: true, attributeFilter: ["class"] });

  /* ---------- Ask Jamol: an AI helper that answers from the lesson materials ----------
     In the published app Jamol asks Claude (the page's "sample" capability) with the lessons as
     his only source; anywhere that isn't available he finds the matching lesson himself. */
  window.JIA_DATA = Object.assign(window.JIA_DATA || {}, { subjects: SUBJECTS });
  window.JIA_DATA.img = Object.assign(window.JIA_DATA.img || {}, IMG);
  window.JIA_openLesson = (si, li) => {
    window.JIA.go("lessons");
    setTimeout(() => { const c = document.querySelector(`.ls-card[data-s="${si}"][data-i="${li}"]`); if (c) { c.scrollIntoView({ block: "nearest", inline: "center" }); setTimeout(() => c.click(), 260); } }, 450);
  };
  const EXTRA = {
    sat: "The SAT has two sections, Reading and Writing, and Math, each scored 200 to 800. Linear equations: isolate x by doing the same operation on both sides. Systems: solve by substitution or elimination. Always check an answer by plugging it back in.",
    ap: "AP exams are scored 1 to 5. Limits describe what a function approaches; a derivative is the instantaneous rate of change (the slope of the tangent). Kinematics links position, velocity and acceleration. Stoichiometry uses mole ratios from a balanced equation.",
    ielts: "IELTS Academic has Listening, Reading, Writing and Speaking, scored in bands 0 to 9. Writing Task 2: introduction with a clear position, two body paragraphs each with one main idea and an example, and a conclusion. Speaking Part 2: one minute to prepare, then speak for up to two minutes.",
    psy: "Memory improves with spaced repetition and sleep. Cognitive biases are shortcuts in thinking, like confirmation bias (noticing only what agrees with us).",
  };
  const materials = () => SUBJECTS.map(s => `${s.name} (${s.course}, teacher ${s.teacher}):\n` + s.lessons.map((l, i) => `- Lesson ${i + 1}: ${l.t} (${l.m} min). ${l.about}`).join("\n") + (EXTRA[s.key] ? `\nNotes: ${EXTRA[s.key]}` : "")).join("\n\n");
  const RULES = `You are Jamol, the friendly study-coach mascot of the JIA student app (Jamal's International Academy, Tashkent). A student is asking you a question.
Rules:
- Answer from the lesson materials below. If they don't cover it, say so in one short sentence and point to the closest lesson or suggest asking their teacher.
- Keep it short and clear: at most 110 words, simple sentences, one small example if it helps.
- For homework or test questions, guide step by step instead of only giving the final answer.
- Reply in the same language the student writes in (Uzbek, Russian or English).
- Be warm and encouraging, like a good older friend. At most one emoji.

Lesson materials:
`;
  const samplePromise = window.claude && window.claude.use ? window.claude.use("sample").catch(() => null) : Promise.resolve(null);
  const jmView = $("jm-view"), jmFeed = $("jm-feed"), jmIn = $("jm-in"), jmSend = $("jm-send");
  let jmCtx = null, jmHist = [], jmBusy = false, jmAbort = null;
  // Jamol's face, borrowed from the coach on the Today page
  // Jamol's face, from the character kit
  const faceSrc = () => (window.JIA_MASCOT && window.JIA_MASCOT.jamol.face.warm) || "";
  const jamolFace = () => (faceSrc() ? `<img src="${faceSrc()}" alt="" draggable="false">` : "");
  document.querySelectorAll(".jm-face").forEach(el => { el.innerHTML = jamolFace(); });
  const ask = $("ls-ask");
  function jmBubble(role, html) {
    const el = document.createElement("div");
    el.className = `jm-msg ${role}`;
    el.innerHTML = role === "bot" ? `<span class="jm-face" aria-hidden="true">${jamolFace()}</span><div class="jm-bub">${html}</div>` : `<div class="jm-bub">${html}</div>`;
    jmFeed.appendChild(el); jmFeed.parentElement.scrollTop = jmFeed.parentElement.scrollHeight;
    return el.querySelector(".jm-bub");
  }
  const escH = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function localAnswer(q) { if (window.JG_JAMOL) return window.JG_JAMOL.answer(q, SUBJECTS, jmCtx, EXTRA);   /* JG-PROD: owner 4 Oct P4g S3 J (Jamol understands Uzbek, Russian and English): a live student's question goes to public/runtime/jg-jamol.js, which answers in the language and script it was asked in (small talk, thanks, what Jamol can do, the lesson it is about, real topics when nothing matches); the demo keeps the design's English matcher below */
    const words = (q.toLowerCase().match(/[\p{L}]{3,}/gu) || []);
    let best = null, top = 0;
    SUBJECTS.forEach((s, si) => s.lessons.forEach((l, li) => {
      const hay = `${s.name} ${s.course} ${l.t} ${l.about} ${EXTRA[s.key] || ""}`.toLowerCase();
      const score = words.reduce((a, w) => a + (hay.includes(w) ? 1 : 0), 0) + (jmCtx && jmCtx.si === si && jmCtx.li === li ? 1.5 : 0);
      if (score > top) { top = score; best = { s, l, si, li }; }
    }));
    if (!best) return { html: "I couldn't find that in our lessons yet. Try asking your teacher in Direct, or pick one of the ideas below." };
    return { html: `Here's what <b>${escH(best.s.name)}</b>, lesson ${best.li + 1} "<b>${escH(best.l.t)}</b>" says: ${escH(best.l.about)}`, lesson: best };
  }
  const lessonBtn = b => `<button class="jm-go" type="button" data-si="${b.si}" data-li="${b.li}">▶ Watch "${escH(b.l.t)}" (${b.l.m} min)</button>`;
  async function answer(q) {
    if (jmBusy) return;
    jmBusy = true; jmSend.disabled = true;
    jmBubble("me", escH(q));
    const out = jmBubble("bot", `<span class="jm-dots"><i></i><i></i><i></i></span>`);
    const sample = await Promise.race([samplePromise, new Promise(r => setTimeout(() => r(null), 1200))]);
    const ctx = jmCtx ? `The student opened you from ${jmCtx.s.name}, lesson ${jmCtx.li + 1}: "${jmCtx.l.t}".\n\n` : "";
    let text = "";
    if (sample) {
      try {
        const turns = jmHist.length ? [{ role: "user", content: RULES + materials() + "\n\n" + ctx + "Student: " + jmHist[0].q }, { role: "assistant", content: jmHist[0].a }]
          .concat(jmHist.slice(1).flatMap(h => [{ role: "user", content: h.q }, { role: "assistant", content: h.a }])).concat([{ role: "user", content: q }])
          : [{ role: "user", content: RULES + materials() + "\n\n" + ctx + "Student: " + q }];
        jmAbort = new AbortController(); if (window.JG_JAMOL) window.JG_JAMOL.tagLast(turns, q);   /* JG-PROD: owner 4 Oct P4g S3 J: with an AI, the question being asked carries the language and script the student wrote in, and small talk is answered in it (public/runtime/jg-jamol.js); live students only */
        const res = await sample(turns, { modelTier: "quick", cache: false, signal: jmAbort.signal, onText: ({ text: t }) => { out.textContent = t; jmFeed.parentElement.scrollTop = jmFeed.parentElement.scrollHeight; } });
        text = res.text; out.textContent = text;
      } catch (e) { text = ""; }
    }
    if (!text) {                                               // no AI here: find the right lesson instead
      const a = localAnswer(q); out.innerHTML = a.html + (a.lesson ? lessonBtn(a.lesson) : ""); text = out.textContent;
    }
    jmHist.push({ q, a: text }); if (jmHist.length > 6) jmHist.shift();
    jmBusy = false; jmSend.disabled = !jmIn.value.trim();
  }
  function openJamol(ctx) {
    jmCtx = ctx || null; jmHist = []; jmFeed.innerHTML = "";
    jmBubble("bot", window.JG_JAMOL && window.JG_JAMOL.greet ? window.JG_JAMOL.greet(JG_ME.firstName, ctx ? ctx.l.t : null) : ctx ? `Hi ${JG_ME.firstName}! Ask me anything about <b>${escH(ctx.l.t)}</b>, or any other lesson.` : `Hi ${JG_ME.firstName}! I'm Jamol. Ask me about any lesson: SAT, AP, IELTS or Psychology.`); /* JG-PROD: identity */ /* JG-PROD: owner 4 Oct P4g fix K2, Jamol greets a live student in the roadmap's language (public/runtime/jg-jamol.js; the owner: "some students don't understand English"); the demo keeps the design's English */
    const ideas = window.JG_JAMOL && window.JG_JAMOL.ideas ? window.JG_JAMOL.ideas(ctx ? ctx.l.t : null) : ctx ? [`Explain ${ctx.l.t} simply`, "Give me a practice question", "What should I learn next?"] : ["How do I solve a system of equations?", "How should I plan IELTS Task 2?", "What is a cognitive bias?"];   /* JG-PROD: owner 4 Oct P4g fix K2, and offers its three ideas in it */
    $("jm-ideas").innerHTML = ideas.map(t => `<button type="button">${escH(t)}</button>`).join("");
    jmView.style.zIndex = "66";
    jmView.hidden = false; jmIn.value = ""; jmSend.disabled = true;
    setTimeout(() => jmIn.focus({ preventScroll: true }), 300);
  }
  function closeJamol() { if (jmAbort) jmAbort.abort(); jmView.hidden = true; }
  window.JIA_openJamol = openJamol;
  if (ask) ask.addEventListener("click", () => openJamol(null));
  $("ls-askl").addEventListener("click", () => { if (cur && cur.lessons) openJamol({ s: cur, l: cur.lessons[lessonIdx], si: SUBJECTS.indexOf(cur), li: lessonIdx }); });
  $("jm-back").addEventListener("click", closeJamol);
  jmIn.addEventListener("input", () => { jmSend.disabled = jmBusy || !jmIn.value.trim(); });
  const send = () => { const q = jmIn.value.trim(); if (!q) return; jmIn.value = ""; answer(q); };
  jmSend.addEventListener("click", send);
  jmIn.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); send(); } if (e.key === "Escape") closeJamol(); });
  $("jm-ideas").addEventListener("click", e => { const b = e.target.closest("button"); if (b) answer(b.textContent); });
  jmFeed.addEventListener("click", e => { const b = e.target.closest(".jm-go"); if (b) { closeJamol(); if (!detail.hidden) close(); setTimeout(() => window.JIA_openLesson(+b.dataset.si, +b.dataset.li), 200); } });

})();
