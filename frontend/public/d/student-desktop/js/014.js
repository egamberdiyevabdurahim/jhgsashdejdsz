
(() => {
  "use strict";
  // the phone's tab bar, answered by the desktop rail
  const JIA_TAB = i => ({ click: () => window.JIA.go(["today", "explore", "home", "lessons", "community"][i]),
    getAttribute: a => a === "aria-current" && (document.querySelector(`#dk-track button[data-i="${i}"]`) || { getAttribute: () => null }).getAttribute("aria-current") === "page" ? "page" : null });

  /* ==========================================================
     COMMUNITY — a spotlight of teachers, top scorers and top
     students that turns over by itself; then Messages (everyone),
     Direct (one person) and Events (with comments).
     ========================================================== */
  const AV = {"aziza": "/d/student-desktop/media/d9215f710c4aac64.webp", "javlon": "/d/student-desktop/media/6c4f17698806911b.webp", "kamila": "/d/student-desktop/media/477f0b1d5e3165e1.webp", "bekzod": "/d/student-desktop/media/dcd963e70f280a4b.webp", "dilnoza": "/d/student-desktop/media/4fa18afb46ee90b5.webp", "sardor": "/d/student-desktop/media/4c4422500ceb31dc.webp", "nilufar": "/d/student-desktop/media/3ec79444bf67f2d5.webp", "asadbek": "/d/student-desktop/media/c6096967d1b102e3.webp", "madina": "/d/student-desktop/media/705bee79908c8d37.webp", "timur": "/d/student-desktop/media/29223a39c02b8da5.webp", "laylo": "/d/student-desktop/media/db76f2fb8cd13682.webp", "jasur": "/d/student-desktop/media/3977b6c975f9a58a.webp"};
  const PEOPLE = {
    aziza:   { name: "Aziza Karimova",  kind: "teacher", tag: "SAT teacher" },
    javlon:  { name: "Javlon Tursunov", kind: "teacher", tag: "AP teacher" },
    kamila:  { name: "Kamila Saidova",  kind: "teacher", tag: "IELTS teacher" },
    bekzod:  { name: "Bekzod Aliev",    kind: "teacher", tag: "Psychology teacher" },
    dilnoza: { name: "Dilnoza R.",      kind: "scorer",  tag: "SAT 1580" },
    sardor:  { name: "Sardor M.",       kind: "scorer",  tag: "IELTS 8.5" },
    nilufar: { name: "Nilufar X.",      kind: "scorer",  tag: "AP 5 of 5" },
    asadbek: { name: "Asadbek Y.",      kind: "scorer",  tag: "SAT 1560" },
    madina:  { name: "Madina A.",       kind: "student", tag: "Top student" },
    timur:   { name: "Timur K.",        kind: "student", tag: "Top student" },
    laylo:   { name: "Laylo B.",        kind: "student", tag: "Top student" },
    jasur:   { name: "Jasur N.",        kind: "student", tag: "Top student" },
  };
  const KIND = { teacher: "Teacher", scorer: "Top scorer", student: "Top student" };
  const BLOCKED = new Set(); window.JIA_BLOCKED = BLOCKED;
  const ORDER = window.JG_ENGINE ? [] : ["aziza", "dilnoza", "madina", "javlon", "sardor", "timur", "kamila", "nilufar", "laylo", "bekzod", "asadbek", "jasur"];   /* JG-PROD: owner 4 Oct R13, a real student is offered none of the design's invented people (the search's People and "People you might know", a new group's picker, the share sheet's "Send to people"; PEOPLE stays for the League's chat): P6 brings real ones */
  window.JIA_people = { PEOPLE, AV, ORDER, KIND };   /* JG-PROD: owner 20 Oct 2026 (M1 messenger), KIND too: a real classmate in a chat reads "Student" (public/runtime/jg-chat.js adds its own kind), never the design's "Top student" */
  // Stories people have posted (sample). A sticker is one of the app's 3D objects.
  const STORIES = {
    aziza:   [{ bg: ["#dbe9fb", "#a9c8f0"], ink: "#214269", sticker: "sat", ago: "2h", text: "Tip of the day: read every SAT question twice before you choose." }],
    dilnoza: [{ bg: ["#fbeedf", "#f3d09e"], ink: "#694721", sticker: "trophy", ago: "5h", text: "SAT 1580! Thank you, JIA 🎉" },
              { bg: ["#e6f5eb", "#bee6d1"], ink: "#1e684a", sticker: "books", ago: "5h", text: "My plan: two practice sets a day, one full test every Sunday." }],
    madina:  [{ bg: ["#fbeedf", "#f5ddc2"], ink: "#694721", sticker: "robot", ago: "3h", text: "Robotics team: national final this weekend! 🤖" }],
    javlon:  [{ bg: ["#e8e2f8", "#cbbdf0"], ink: "#342169", sticker: "atom", ago: "6h", text: "Calculus quiz on Friday. Revise limits and derivatives." }],
    sardor:  [{ bg: ["#fae1e4", "#f2b9c3"], ink: "#69212b", sticker: "ielts", ago: "1h", text: "IELTS 8.5 ✓ Speaking was the hardest part." }],
    timur:   [{ bg: ["#e6f5eb", "#cee9d9"], ink: "#1e684a", sticker: "brain", ago: "1h", text: "Day 30 of my study streak 🔥" }],
    kamila:  [{ bg: ["#fbeedf", "#f5ddc2"], ink: "#694721", sticker: "ielts", ago: "8h", text: "Speaking club this Sunday at 16:00. Come and practise with us!" }],
    nilufar: [{ bg: ["#e8e2f8", "#d2c7ef"], ink: "#342169", sticker: "atom", ago: "4h", text: "Five 5s on AP ✓ Ask me anything about AP Chemistry." }],
    laylo:   [{ bg: ["#dbe9fb", "#c3daf4"], ink: "#214269", sticker: "microscope", ago: "7h", text: "Chemistry lab today: we made a rainbow in a tube 🌈" }],
    bekzod:  [{ bg: ["#fae1e4", "#f2c4cb"], ink: "#69212b", sticker: "brain", ago: "9h", text: "Study tip: sleep is when memories get saved. Protect it." }],
    asadbek: [{ bg: ["#fbeedf", "#f3d09e"], ink: "#694721", sticker: "trophy", ago: "2h", text: "Math olympiad: silver medal 🥈 Next year, gold." }],
    jasur:   [{ bg: ["#e5f5f3", "#cdeae6"], ink: "#21695f", sticker: "laptop", ago: "3h", text: "Coding the robot's arm tonight. Wish me luck!" }],
  };

  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = $("tv-community");
  const first = n => n.split(" ")[0];
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  let myPhoto = (getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo") || "").trim();   /* JG-PROD: owner 4 Oct P4g S4, his photo can change while the page is open (meImg, next line) */
  let meImg = `<span class="cm-av" style="background-image:${myPhoto.replace(/"/g, "'")}" aria-hidden="true"></span>`; if (window.JG_ENGINE) document.addEventListener("jg:photo", e => { myPhoto = `url("${e.detail.photo}")`; meImg = `<span class="cm-av" style="background-image:${myPhoto.replace(/"/g, "'")}" aria-hidden="true"></span>`; });   /* JG-PROD: owner 4 Oct P4g S4, a new or removed photo (public/runtime/jg-photo.js) is the one his next post, comment, story and profile show */

  /* ---------- the spotlight: everyone on one strip, drifting slowly left to right ---------- */
  const spot = $("cm-spot");
  const card = (id, copy) => {
    const p = PEOPLE[id];
    return `<button class="cm-sp k-${p.kind}" type="button" data-id="${id}"${copy ? ' aria-hidden="true" tabindex="-1"' : ` role="listitem" aria-label="${esc(p.name)}, ${KIND[p.kind]}. Send a message"`}>
        <span class="cm-ring"><span class="cm-coin"><img src="${AV[id]}" alt=""></span></span><b class="cm-nm">${esc(first(p.name))}</b><span class="cm-tag">${KIND[p.kind]}</span></button>`;
  };
  spot.innerHTML = `<div class="cm-track" id="cm-track">${ORDER.map(id => card(id, false)).join("")}${ORDER.map(id => card(id, true)).join("")}</div>`;
  spot.style.setProperty("--drift", `${ORDER.length * 3.4}s`);        // the same slow pace however many people there are
  let holdT = 0;                                                       // a finger on the strip holds it still
  spot.addEventListener("pointerdown", () => { clearTimeout(holdT); spot.classList.add("hold"); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(t => spot.addEventListener(t, () => { clearTimeout(holdT); holdT = setTimeout(() => spot.classList.remove("hold"), 1200); }));
  spot.addEventListener("focusin", () => spot.classList.add("hold"));
  spot.addEventListener("focusout", () => spot.classList.remove("hold"));


  /* ---------- Messages / Direct / Events ---------- */
  const tabs = [...document.querySelectorAll(".cm-seg [role=tab]")], ind = $("cm-ind");
  function select(p) {
    tabs.forEach((t, i) => {
      const on = t.dataset.p === p;
      t.setAttribute("aria-selected", String(on));
      if (on) ind.style.transform = `translateX(${i * 100}%)`;
      const panel = $(t.getAttribute("aria-controls"));
      if (on && panel.hidden) { panel.hidden = false; if (!reduce) { panel.classList.remove("enter"); void panel.offsetWidth; panel.classList.add("enter"); } }
      else if (!on) panel.hidden = true;
    });
    if (p !== "dm") closeThread(true);
  }
  tabs.forEach(t => t.addEventListener("click", () => select(t.dataset.p)));

  /* ---------- chat: global Messages, one-to-one Direct, and groups ----------
     Hold a message (or right-click it, or use its ⋯) to reply, copy, edit or delete your own. */
  let mid = 0;
  const M = (who, text, time, extra) => Object.assign({ id: ++mid, who, text, time }, extra || {});
  const nameOf = who => who === "me" ? "You" : PEOPLE[who].name;
  const quoteHTML = q => q ? `<span class="cm-quote"><b>${esc(nameOf(q.who))}</b>${q.deleted ? "Deleted message" : esc(q.text.length > 80 ? q.text.slice(0, 80) + "…" : q.text)}</span>` : "";
  function msgHTML(m, showName, fresh) {
    if (m.system) return `<p class="cm-day">${esc(m.text)}</p>`;
    if (m.who !== "me" && BLOCKED.has(m.who)) return "";
    if (m.sticker || m.poll || m.voice) return richHTML(m, showName, fresh);
    const mine = m.who === "me", body = m.deleted ? `<i class="cm-del">This message was deleted</i>` : m.image ? `<span class="jx-img"><img src="${m.image}" alt="Photo of a problem"><button type="button" class="jx-solve" data-solve="${m.id}">✏️ Solve together</button></span>${m.text ? esc(m.text) : ""}` : esc(m.text);
    const meta = `<span class="cm-time">${m.edited && !m.deleted ? "edited · " : ""}${m.time}</span>`;
    const more = m.deleted ? "" : `<button class="cm-more" type="button" aria-label="Message options">⋯</button>`;
    const q = m.deleted ? "" : quoteHTML(m.reply);
    const tip = mine && m.coachTip && window.JG_coachOn && window.JG_coachOn() ? `<span class="jx-tip" role="note">💡 More natural: ${esc(m.coachTip)} <button type="button" class="jx-coachoff">Turn off coach</button></span>` : "";
    if (m.who === "jamol") return `<div class="cm-msg k-bot" data-mid="${m.id}"><img class="cm-av" src="${window.JG_jamolAv || ""}" alt=""><div class="cm-bub" tabindex="0">${showName ? `<span class="cm-who">Jamol<span class="cm-role">AI study assistant</span></span>` : ""}${body}${meta}</div></div>`;
    if (mine) return `<div class="cm-msg me${fresh && !reduce ? " new" : ""}" data-mid="${m.id}">${more}<div class="cm-bub" tabindex="0">${q}${body}${rxHTML(m)}${meta}</div>${tip}</div>`;
    const p = PEOPLE[m.who];
    return `<div class="cm-msg k-${p.kind}${fresh && !reduce ? " new" : ""}" data-mid="${m.id}">
        <button class="cm-avbtn" type="button" data-who="${m.who}" aria-label="${esc(p.name)}, open profile"><img class="cm-av" src="${AV[m.who]}" alt=""></button>
        <div class="cm-bub" tabindex="0">${showName ? `<span class="cm-who">${esc(p.name)}<span class="cm-role">${KIND[p.kind] || ""}</span>${window.JG_flex ? window.JG_flex(m.who) : ""}</span>` : ""}${q}${body}${rxHTML(m)}${meta}</div>${more}</div>`;
  }
  function typing(feed, who) {
    const el = document.createElement("div");
    el.className = `cm-msg cm-typing k-${PEOPLE[who].kind}`;
    el.innerHTML = `<img class="cm-av" src="${AV[who]}" alt=""><div class="cm-bub" aria-label="${esc(first(PEOPLE[who].name))} is typing"><i></i><i></i><i></i></div>`;
    feed.appendChild(el);
    return el;
  }
  const toBottom = wrap => wrap.scrollTo({ top: wrap.scrollHeight, behavior: reduce ? "auto" : "smooth" });

  // every conversation lives here: the global room, one-to-one chats and groups
  const CHATS = {};
  CHATS.global = { id: "global", kind: "global", msgs: [M(null, "Today", "", { system: true }),
    M("aziza", "Good morning everyone! Today's live SAT sprint starts at 19:00.", "09:12"),
    M("dilnoza", "Can't wait. Last week's sprint helped me a lot.", "09:15"),
    M("timur", "Does anyone have tips for IELTS Writing Task 2?", "09:21")] };
  CHATS.global.msgs.push(M("kamila", "Timur, plan for two minutes before you write. The structure lesson is in Lessons.", "09:24", { reply: CHATS.global.msgs[3] }));
  CHATS.global.msgs.push(M("madina", "Thanks! See you all at the live admission Q&A 🙌", "09:30"));
  CHATS.global.msgs[1].rx = { "👍": ["dilnoza", "timur", "madina"], "🔥": ["sardor"] };
  CHATS.global.msgs[4].rx = { "❤️": ["timur", "laylo"] }; if (window.JG_ENGINE) CHATS.global.msgs = [];   /* JG-PROD: owner 4 Oct R13, a real student's Messages feed holds none of the design's invented people (Aziza's "Good morning everyone!", Dilnoza, Timur, Kamila, Madina); "No messages yet." is drawn while it is empty (rerender), so it never stays above what the student posts */
  const dm = (id, time, unread, msgs) => (CHATS[`dm:${id}`] = { id: `dm:${id}`, kind: "dm", with: id, time, unread, msgs });
  const group = (key, name, members, time, unread, msgs) => (CHATS[`g:${key}`] = { id: `g:${key}`, kind: "group", name, members, time, unread, msgs });
  dm("aziza", "10:02", 2, [M("aziza", `Hi ${JG_ME.firstName}! I checked your mock test.`, "10:01"), M("aziza", "Great progress! Math went from 690 to 740.", "10:02")]); /* JG-PROD: identity */
  group("sat", "SAT Squad", ["aziza", "dilnoza", "sardor", "timur"], "09:55", 1,
    [M("aziza", "Mock test on Saturday at 10:00. Who's in?", "09:48"), M("dilnoza", "Me!", "09:50"), M("timur", "Count me in 🙌", "09:55")]);
  dm("dilnoza", "09:40", 0, [M("me", "Hey, how did you prepare for reading?", "09:31"), M("dilnoza", "Want to practice reading together this weekend?", "09:40")]);
  group("ielts", "IELTS Speaking Club", ["kamila", "madina", "laylo"], "Yesterday", 0,
    [M("kamila", "This Sunday's topic: describe a place you love.", "18:10"), M("laylo", "Samarkand, easy 😄", "18:22")]);
  dm("javlon", "Yesterday", 0, [M("javlon", "Don't forget the calculus quiz on Friday.", "17:05")]);
  group("robo", "Robotics Team", ["javlon", "jasur", "asadbek", "madina"], "Mon", 0,
    [M("jasur", "The new motor arrived!", "16:40"), M("javlon", "Great. Let's test it on Saturday.", "16:52")]);
  dm("timur", "Mon", 0, [M("timur", "Thanks for the notes!", "14:12")]);
  const CHAT_REPLIES = [["sardor", "Agreed 👍"], ["laylo", "See you at the live session!"], ["asadbek", "Good luck everyone 💪"], ["javlon", "Great energy today. Keep it up!"], ["nilufar", "Thanks for sharing!"]];
  const DM_REPLIES = {
    teacher: ["Good question. Let's go over it in the next live lesson.", "Nice work, keep it up!", "Send me your answer and I'll check it."],
    scorer: ["Sure, happy to help!", "Let's study together this weekend?", "I'll share my notes with you 📚"],
    student: ["Haha, same!", "Sounds good!", "See you in the live lesson!"],
  };
  const GROUP_REPLIES = ["Nice 👍", "Agreed!", "See you there!", "Thanks for sharing!", "Let's do it 💪"];
  const findMsg = (chat, id) => chat.msgs.find(m => m.id === id);
  // reactions: one per person, like Telegram
  const EMO = ["❤️", "😂", "👍", "😮", "😢", "🔥"];
  function react(m, emo, who) {
    m.rx = m.rx || {};
    const had = (m.rx[emo] || []).includes(who);
    Object.keys(m.rx).forEach(k => { m.rx[k] = m.rx[k].filter(x => x !== who); if (!m.rx[k].length) delete m.rx[k]; });
    if (!had) (m.rx[emo] = m.rx[emo] || []).push(who);
  }
  function rxHTML(m) {
    const list = Object.entries(m.rx || {}).filter(([, w]) => w.length);
    return list.length ? `<span class="cm-rx">${list.map(([e, w]) => `<button type="button" class="rx${w.includes("me") ? " mine" : ""}" data-rx="${e}" aria-label="${e} ${w.length}${w.includes("me") ? ", including you" : ""}">${e}<b>${w.length}</b></button>`).join("")}</span>` : "";
  }

  // one composer per feed: sends, replies and edits
  function composer({ input, send, bar, wrap, feed, chat, onSent }) {
    let mode = null, target = null;
    const barTitle = bar.querySelector("b"), barText = bar.querySelector("span");
    const clear = () => { mode = null; target = null; bar.hidden = true; send.setAttribute("aria-label", "Send"); send.classList.remove("save"); };
    const api = {
      reply(m) { mode = "reply"; target = m; barTitle.textContent = `Replying to ${nameOf(m.who)}`; barText.textContent = m.text; bar.hidden = false; input.focus(); },
      edit(m) { mode = "edit"; target = m; barTitle.textContent = "Editing message"; barText.textContent = m.text; bar.hidden = false; input.value = m.text; send.disabled = false; send.classList.add("save"); send.setAttribute("aria-label", "Save"); input.focus(); },
      clear,
    };
    bar.querySelector("button").addEventListener("click", () => { if (mode === "edit") input.value = ""; clear(); send.disabled = !input.value.trim(); });
    input.addEventListener("input", () => { send.disabled = !input.value.trim(); });
    const go = () => {
      const raw = input.value.trim(), c = chat();
      if (!raw || !c) return;
      const sc = screen(raw), v = sc.clean;                            // the automatic filter runs first
      if (sc.blocked) { toast(SAFETY_NOTE); return; }
      if (sc.bad) toast("Some words were hidden");
      input.value = ""; send.disabled = true;
      if (mode === "edit" && target) {
        target.text = v; target.edited = true;
        rerender(feed, c);                                                // quotes of this message update too
        clear(); return;
      }
      const m = M("me", v, now(), mode === "reply" && target ? { reply: target } : null);
      clear();
      c.msgs.push(m); c.time = now();
      if (window.JG_ENGINE) feed.querySelectorAll("p.cm-day:only-child").forEach(el => el.remove()); feed.insertAdjacentHTML("beforeend", msgHTML(m, c.kind !== "dm", true)); toBottom(wrap);   /* JG-PROD: owner 4 Oct R13, a real student's first message takes the place of an empty feed's or thread's one line ("No messages yet.", "Say hello to the group"), as the design's sticker path does (sendRich) */
      onSent(c, m);
      setTimeout(() => {                                              // sometimes someone reacts to what you said
        if (window.JG_ENGINE || Math.random() > .55 || m.deleted) return;   /* JG-PROD: owner 4 Oct R11, no invented person reacts to a real student's message */
        const pool = (c.kind === "global" ? ["dilnoza", "timur", "sardor", "madina", "laylo"] : c.kind === "group" ? c.members : [c.with]).filter(w => PEOPLE[w] && !BLOCKED.has(w));
        if (!pool.length) return;
        react(m, ["👍", "❤️", "😂", "🔥"][Math.floor(Math.random() * 4)], pool[Math.floor(Math.random() * pool.length)]);
        if (c === chat()) rerender(feed, c);
      }, 2200 + Math.random() * 1500);
    };
    send.addEventListener("click", go);
    input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } if (e.key === "Escape" && mode) { e.stopPropagation(); clear(); } });
    return api;
  }
  function rerender(feed, chat, keepScroll) {
    const wrap = feed.parentElement, top = wrap.scrollTop;
    feed.innerHTML = chat.msgs.map(m => msgHTML(m, chat.kind !== "dm")).join("") || (window.JG_ENGINE && chat.kind === "global" ? `<p class="cm-day">No messages yet.</p>` : "");   /* JG-PROD: owner 4 Oct R13, a real student's empty Messages feed says so, in the design's day-line style, only while it is empty */
    if (keepScroll !== false) wrap.scrollTop = top;
  }

  /* Messages: everyone together */
  const feed = $("cm-feed"), feedWrap = $("cm-feed-wrap");
  rerender(feed, CHATS.global);
  let chatTurn = 0, chatTimers = [];
  const globalComposer = composer({ input: $("cm-in"), send: $("cm-send"), bar: $("cm-rbar"), wrap: feedWrap, feed, chat: () => CHATS.global,
    onSent: c => {
      if (window.JG_ENGINE) return; const [who, reply] = CHAT_REPLIES[chatTurn++ % CHAT_REPLIES.length];   /* JG-PROD: owner 4 Oct R11, no canned reply from an invented person in the Messages feed */
      chatTimers.push(setTimeout(() => {
        const t = typing(feed, who); toBottom(feedWrap);
        chatTimers.push(setTimeout(() => { t.remove(); const m = M(who, reply, now()); c.msgs.push(m); feed.insertAdjacentHTML("beforeend", msgHTML(m, true, true)); toBottom(feedWrap); }, 1400));
      }, 700));
    } });

  /* Direct: one person or a group at a time */
  const convs = $("cm-convs"), dmDot = $("cm-dm-dot"), thread = $("cm-thread"), thFeed = $("cm-th-feed"), thWrap = $("cm-th-wrap");
  let openId = null, dmTimers = [];
  const lastLine = c => {
    const m = [...c.msgs].reverse().find(x => !x.system);
    if (!m) return c.kind === "group" ? "Say hi to the group" : `Say hello to ${esc(first(PEOPLE[c.with].name))}`;
    const who = m.who === "me" ? "You: " : c.kind === "group" ? `${esc(first(PEOPLE[m.who].name))}: ` : "";
    return who + (m.deleted ? "<i>Deleted message</i>" : esc(m.text || (m.sticker ? "Sticker" : m.voice ? "🎤 Voice message" : m.poll ? "📊 " + m.poll.q : "")));
  };
  const faces = c => c.kind === "group"
    ? (!c.members.length && window.JG_ENGINE ? "" : `<span class="cm-gav"><img src="${AV[c.members[0]]}" alt=""><img src="${AV[c.members[1]]}" alt=""></span>`)   /* JG-PROD: owner 4 Oct R13, a real student's group with nobody else in it (a club's thread) shows no avatar row, never <img src="undefined"> */
    : `<span class="cm-ring"><span class="cm-coin"><img src="${AV[c.with]}" alt=""></span></span>`;
  function renderConvs() {
    const list = Object.values(CHATS).filter(c => c.kind !== "global" && !c.club && !(c.kind === "dm" && BLOCKED.has(c.with)));
    convs.innerHTML = list.map(c => {
      const kind = c.kind === "group" ? "group" : PEOPLE[c.with].kind, title = c.kind === "group" ? c.name : PEOPLE[c.with].name;
      return `<li><button class="cm-conv k-${kind}${c.unread ? " unread" : ""}" type="button" data-id="${c.id}">
          ${faces(c)}<span class="cm-ct"><b>${esc(title)}${c.kind === "group" ? ` <em>${c.members.length + 1}</em>` : ""}${c.kind === "dm" && window.JG_fstreak ? window.JG_fstreak(c.with) : ""}</b><span>${lastLine(c)}</span></span>
          <span class="cm-cr">${c.time}${c.unread ? `<span class="cm-dot">${c.unread}</span>` : ""}</span></button></li>`;
    }).join("") || (window.JG_ENGINE ? `<li class="pf-empty">No messages yet.</li>` : "");   /* JG-PROD: owner 4 Oct R11, a real student's empty Direct says so */
    const n = list.reduce((a, c) => a + c.unread, 0);
    dmDot.textContent = n; dmDot.hidden = !n;
  }
  function openThread(id) {
    if (!id.includes(":")) id = `dm:${id}`;
    if (!CHATS[id]) dm(id.slice(3), now(), 0, []);
    const c = CHATS[id];
    c.unread = 0; renderConvs();
    openId = id;
    const isG = c.kind === "group";
    $("cm-thead").className = `cm-thead k-${isG ? "group" : PEOPLE[c.with].kind}`;
    $("cm-th-avs").innerHTML = isG ? faces(c) : `<img class="cm-av" src="${AV[c.with]}" alt="">`;
    $("cm-th-name").textContent = isG ? c.name : PEOPLE[c.with].name;
    $("cm-th-tag").textContent = isG ? `You, ${c.members.map(w => first(PEOPLE[w].name)).join(", ")}` : PEOPLE[c.with].tag;
    $("cm-th-who").dataset.who = isG ? "" : c.with;
    $("cm-th-in").placeholder = isG ? `Message ${c.name}` : `Message ${first(PEOPLE[c.with].name)}`; document.dispatchEvent(new CustomEvent("jia:thread", { detail: { id, chat: c } }));
    thComposer.clear();
    rerender(thFeed, c, false); paintPin();
    if (!c.msgs.length) thFeed.innerHTML = `<p class="cm-day">Say hello to ${esc(isG ? "the group" : first(PEOPLE[c.with].name))}</p>`;
    thread.classList.add("open"); thread.setAttribute("aria-hidden", "false");
    thWrap.scrollTop = thWrap.scrollHeight;
    setTimeout(() => $("cm-th-in").focus({ preventScroll: true }), reduce ? 0 : 380);
  }
  function closeThread(quiet) {
    dmTimers.forEach(clearTimeout); dmTimers = [];
    thread.classList.remove("open"); thread.setAttribute("aria-hidden", "true");
    if (!quiet && openId) { const b = convs.querySelector(`[data-id="${openId}"]`); if (b) b.focus({ preventScroll: true }); }
    openId = null;
  }
  convs.addEventListener("click", e => { const b = e.target.closest(".cm-conv"); if (b) openThread(b.dataset.id); });
  $("cm-back").addEventListener("click", () => closeThread(false));
  $("cm-th-who").addEventListener("click", () => { const w = $("cm-th-who").dataset.who; if (w) openProfile(w); else openGroupInfo(); });
  const thComposer = composer({ input: $("cm-th-in"), send: $("cm-th-send"), bar: $("cm-th-rbar"), wrap: thWrap, feed: thFeed, chat: () => CHATS[openId],
    onSent: c => {
      renderConvs();
      if (window.JG_ENGINE) return; const id = c.id, who = c.kind === "group" ? c.members[Math.floor(Math.random() * c.members.length)] : c.with;   /* JG-PROD: owner 4 Oct R11, no canned reply ("Haha, same!") from an invented person in Direct or a group */
      const reply = c.kind === "group" ? GROUP_REPLIES[c.msgs.length % GROUP_REPLIES.length] : DM_REPLIES[PEOPLE[who].kind][c.msgs.length % 3];
      dmTimers.push(setTimeout(() => {
        if (openId !== id) return;
        const t = typing(thFeed, who); toBottom(thWrap);
        dmTimers.push(setTimeout(() => {
          t.remove(); const m = M(who, reply, now()); c.msgs.push(m); renderConvs();
          if (openId === id) { thFeed.insertAdjacentHTML("beforeend", msgHTML(m, c.kind !== "dm", true)); toBottom(thWrap); }
        }, 1500));
      }, 800));
    } });
  renderConvs();

  // the message menu: reply, copy, edit, delete
  const menu = $("cm-menu");
  let menuCtx = null, msgPressT = 0;
  function openMenu(msgEl, x, y) {
    const inThread = !!msgEl.closest("#cm-th-feed"), c = inThread ? CHATS[openId] : CHATS.global;
    const m = c && findMsg(c, +msgEl.dataset.mid);
    if (!m || m.deleted || m.system) return;
    menuCtx = { m, c, inThread, el: msgEl };
    const mine = m.who === "me";
    menu.querySelector('[data-act="edit"]').hidden = !mine;
    menu.querySelector('[data-act="delete"]').hidden = !mine;
    menu.querySelector('[data-act="report"]').hidden = mine;
    const rich = !!(m.sticker || m.poll || m.voice), pinB = menu.querySelector('[data-act="pin"]');
    menu.querySelector('[data-act="copy"]').hidden = rich; menu.querySelector('[data-act="edit"]').hidden = !mine || rich;
    pinB.hidden = !inThread || !canPin(c); pinB.lastChild.textContent = c.pinned === m ? "Unpin" : "Pin";
    menu.hidden = false;
    const mr = menu.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    menu.style.left = `${Math.max(8, Math.min(vw - mr.width - 8, x - mr.width / 2))}px`;
    menu.style.top = `${Math.max(8, Math.min(vh - mr.height - 8, y + 10))}px`;
    msgEl.classList.add("held");
    menu.querySelector("button:not([hidden])").focus({ preventScroll: true });
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    if (menuCtx) { menuCtx.el.classList.remove("held"); const b = menuCtx.el.querySelector(".cm-bub"); if (b) b.focus({ preventScroll: true }); }
    menuCtx = null;
  }
  const feeds = [feed, thFeed];
  feeds.forEach(f => {
    f.addEventListener("contextmenu", e => { const el = e.target.closest(".cm-msg[data-mid]"); if (!el) return; e.preventDefault(); openMenu(el, e.clientX, e.clientY); });
    f.addEventListener("pointerdown", e => {
      const el = e.target.closest(".cm-msg[data-mid]");
      if (!el || e.pointerType === "mouse" || e.target.closest("button")) return;
      const x = e.clientX, y = e.clientY;
      msgPressT = setTimeout(() => openMenu(el, x, y), 450);               // hold to open, like every chat app
    });
    ["pointerup", "pointercancel", "pointerleave", "pointermove"].forEach(t => f.addEventListener(t, e => { if (t !== "pointermove" || Math.abs(e.movementY) > 3) clearTimeout(msgPressT); }));
    let lastTap = { t: 0, id: 0 };
    f.addEventListener("click", e => {
      const chip = e.target.closest("[data-rx]"), el0 = e.target.closest(".cm-msg[data-mid]");
      const c0 = f === feed ? CHATS.global : CHATS[openId], m0 = el0 && c0 && findMsg(c0, +el0.dataset.mid);
      if (chip && m0) { react(m0, chip.dataset.rx, "me"); rerender(f, c0); return; }
      if (m0 && !m0.deleted && !e.target.closest("button")) {                  // double-tap: ❤️
        const t = Date.now();
        if (lastTap.id === m0.id && t - lastTap.t < 320) {
          lastTap = { t: 0, id: 0 }; react(m0, "❤️", "me"); rerender(f, c0);
          const b = f.querySelector(`[data-mid="${m0.id}"] .cm-bub`);
          if (b && !reduce) { const h = document.createElement("span"); h.className = "rx-pop"; h.textContent = "❤️"; b.appendChild(h); setTimeout(() => h.remove(), 800); }
          return;
        }
        lastTap = { t, id: m0.id };
      }
      const more = e.target.closest(".cm-more"), av = e.target.closest(".cm-avbtn");
      if (more) { const el = more.closest(".cm-msg"), r = more.getBoundingClientRect(); openMenu(el, r.left + r.width / 2, r.bottom); }
      else if (av) openProfile(av.dataset.who);
    });
    f.addEventListener("keydown", e => {
      const el = e.target.closest(".cm-msg[data-mid]");
      if (el && (e.key === "Enter" || e.key === "ContextMenu") && e.target.classList.contains("cm-bub")) { e.preventDefault(); const r = e.target.getBoundingClientRect(); openMenu(el, r.left + r.width / 2, r.bottom); }
    });
  });
  menu.addEventListener("click", e => {
    const emo = e.target.closest("[data-emo]");
    if (emo && menuCtx) { const { m, c, inThread } = menuCtx; closeMenu(); react(m, emo.dataset.emo, "me"); rerender(inThread ? thFeed : feed, c); return; }
    const b = e.target.closest("[data-act]");
    if (!b || !menuCtx) return;
    const { m, c, inThread } = menuCtx, comp = inThread ? thComposer : globalComposer, f = inThread ? thFeed : feed;
    const act = b.dataset.act;
    closeMenu();
    if (act === "reply") comp.reply(m);
    else if (act === "copy") { try { navigator.clipboard.writeText(m.text).catch(() => {}); } catch (err) {} toast("Message copied"); }
    else if (act === "edit") comp.edit(m);
    else if (act === "pin") { c.pinned = c.pinned === m ? null : m; paintPin(); toast(c.pinned ? "Message pinned" : "Unpinned"); }
    else if (act === "report") openReport({ what: "message", who: m.who, label: m.text.slice(0, 60) });
    else if (act === "delete") { m.deleted = true; rerender(f, c); if (inThread) { renderConvs(); paintPin(); } toast("Message deleted"); }
  });
  $("cm-menu-bg").addEventListener("click", closeMenu);
  menu.addEventListener("keydown", e => {
    const items = [...menu.querySelectorAll("button:not([hidden])")], i = items.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeMenu(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  });
  new MutationObserver(() => { $("cm-menu-bg").hidden = menu.hidden; }).observe(menu, { attributes: true, attributeFilter: ["hidden"] });

  // a new group: name it, pick people
  const grpSheet = $("grp-sheet"), grpName = $("grp-name"), grpList = $("grp-list"), grpGo = $("grp-go");
  const picked = new Set();
  grpList.innerHTML = ORDER.map(id => `<li><button class="grp-p" type="button" data-id="${id}" aria-pressed="false"><img src="${AV[id]}" alt=""><span><b>${esc(PEOPLE[id].name)}</b><small>${KIND[PEOPLE[id].kind]}</small></span><i aria-hidden="true"></i></button></li>`).join("");
  const grpReady = () => { grpGo.disabled = !grpName.value.trim() || picked.size < 2; grpGo.textContent = picked.size ? `Create group (${picked.size + 1})` : "Create group"; };
  $("cm-newgrp").addEventListener("click", () => {
    picked.clear(); grpName.value = ""; grpList.querySelectorAll(".grp-p").forEach(b => b.setAttribute("aria-pressed", "false")); grpReady();
    openLayer(grpSheet, grpName);
  });
  grpList.addEventListener("click", e => {
    const b = e.target.closest(".grp-p"); if (!b) return;
    const id = b.dataset.id; picked.has(id) ? picked.delete(id) : picked.add(id);
    b.setAttribute("aria-pressed", String(picked.has(id))); grpReady();
  });
  grpName.addEventListener("input", grpReady);
  grpGo.addEventListener("click", () => {
    const key = `n${Date.now()}`, name = grpName.value.trim();
    group(key, name, [...picked], now(), 0, [M(null, `You created "${name}"`, "", { system: true })]);
    CHATS[`g:${key}`].admins = ["me"];
    closeLayer(); renderConvs(); openThread(`g:${key}`);
  });

  /* Events: what's coming; comments (with replies) open in the comments sheet */
  const SHARE_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/></svg>';
  const BELL_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>';
  const CAL_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  const evStart = ev => { const d = day(ev.d), [h, mi] = ev.time.split(":").map(Number); d.setHours(h, mi, 0, 0); return d; };
  const CMT_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.2 8.2 0 0 1-12 7.3L4 20l1.2-4.1a8.2 8.2 0 1 1 15.3-4.3z"/></svg>';
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const C = (who, text, ago, replies) => ({ who, text, ago, replies: replies || [] });
  const EVENTS = [
    { title: "Live SAT course: Math sprint", d: 0, time: "19:00", place: "Online", host: "aziza", going: 86, g: ["#e0ecfa", "#c3daf4"], ink: "#214269",
      cmts: [C("dilnoza", "Will it be recorded?", "1h", [C("aziza", "Yes, the recording goes to Lessons afterwards.", "58m")]), C("timur", "See you there!", "20m")] },
    { title: "Live admission Q&A", d: 2, time: "18:00", place: "Online", host: "bekzod", going: 142, g: ["#e5f5ec", "#cee9d9"], ink: "#216940",
      cmts: [C("madina", "Can we ask about scholarships too?", "3h", [C("bekzod", "Of course, bring all your questions.", "2h")])] },
    { title: "Robotics club meetup", d: 4, time: "11:00", place: "JIA campus", host: "javlon", going: 24, g: ["#fbeedf", "#f5ddc2"], ink: "#694721",
      cmts: [C("jasur", "Should we bring our own laptops?", "5h")] },
    { title: "IELTS speaking club", d: 5, time: "16:00", place: "JIA campus, room 204", host: "kamila", going: 31, g: ["#e8e2f8", "#d2c7ef"], ink: "#342169", cmts: [] },
  ]; if (window.JG_ENGINE) EVENTS.forEach(e => { const byTeacher = c => (PEOPLE[c.who] || {}).kind === "teacher"; if (byTeacher({ who: e.host })) e.host = ""; e.cmts = e.cmts.filter(c => !byTeacher(c)).map(c => Object.assign(c, { replies: c.replies.filter(r => !byTeacher(r)) })); }); if (window.JG_ENGINE) { EVENTS.length = 0; ["cm-ev-btn", "tb-cal"].forEach(id => { const b = $(id); if (b) { b.setAttribute("aria-label", "Events"); const n = b.querySelector("span"); if (n) n.remove(); } }); }   /* JG-PROD: owner 4 Oct R6, until the owner's roster comes a real student's events name no invented teacher: no host, no teacher's reply (Lessons shows the same session without one); owner 4 Oct R13, then none of the design's events at all (invented classes, "86 going", the faces of invented students, their comments): the list says "No events yet." and the "4" badges (Community, the desktop's top bar) go */
  const FACES = ["madina", "sardor", "laylo", "asadbek", "nilufar", "jasur"];
  const evs = $("cm-evs");
  const countAll = list => list.reduce((a, c) => a + 1 + c.replies.length, 0);
  const miniCmt = c => `<div class="cm-cm">${c.who === "me" ? meImg : `<img class="cm-av" src="${AV[c.who]}" alt="">`}<div><p><b>${esc(nameOf(c.who))}</b>${esc(c.text)}</p><small>${c.ago}${c.replies.length ? ` · ${c.replies.length} ${c.replies.length > 1 ? "replies" : "reply"}` : ""}</small></div></div>`;
  function renderEvents() {
    evs.innerHTML = EVENTS.map((e, i) => {
      const d = day(e.d), n = countAll(e.cmts);
      return `<article class="cm-ev" data-e="${i}" style="--g1:${e.g[0]};--g2:${e.g[1]};--ink2:${e.ink}">
          <div class="cm-ev-top">
            <span class="cm-date"><i>${e.d === 0 ? "TODAY" : d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</i><b>${d.getDate()}</b></span>
            <div><h3>${esc(e.title)}</h3>
              <div class="cm-ev-meta"><span>${e.d === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" })}, ${e.time}</span><span>${esc(e.place)}</span>${e.host ? `<button class="cm-host" type="button" data-who="${e.host}">${esc(PEOPLE[e.host].name)}</button>` : "" /* JG-PROD: owner 4 Oct R6, no host chip without a confirmed host */}</div></div>
          </div>
          <div class="cm-ev-acts"><button type="button" data-remind="${i}" class="${e.remind ? "set" : ""}" aria-pressed="${!!e.remind}">${BELL_I}${e.remind ? "Reminder set" : "Remind me"}</button><button type="button" data-cal="${i}">${CAL_I}Add to calendar</button></div>
          <div class="cm-ev-mid">
            <span class="cm-faces" aria-hidden="true">${FACES.slice(i % 3, i % 3 + 3).map(f => `<img src="${AV[f]}" alt="">`).join("")}</span>
            <span class="cm-going">${e.going + (e.me ? 1 : 0)} going</span>
            <button class="cm-evshare" type="button" data-share="${i}" aria-label="Share ${esc(e.title)}">${SHARE_I}</button>
            <button class="cm-go${e.me ? " on" : ""}" type="button" data-go="${i}" aria-pressed="${!!e.me}">${e.me ? "✓ Going" : "I'm going"}</button>
          </div>
          <div class="cm-cmts">
            ${e.cmts.slice(-2).map(miniCmt).join("")}
            <button class="cm-more-c" type="button" data-cm="${i}">${n ? `View all ${n} comments` : "Be the first to comment"}</button>
            <button class="cm-add cm-add-btn" type="button" data-cm="${i}">${meImg}<span>Add a comment</span></button>
          </div>
        </article>`;
    }).join("") || (window.JG_ENGINE ? `<p class="pf-empty">No events yet.</p>` : "");   /* JG-PROD: owner 4 Oct R13, a real student's empty events list says so, in the empty-list style of Posts and Reels */
  }
  evs.addEventListener("click", e => {
    const rmd = e.target.closest("[data-remind]"), cal = e.target.closest("[data-cal]");
    if (rmd || cal) {
      const ev = EVENTS[+(rmd || cal).dataset[rmd ? "remind" : "cal"]];
      if (cal) { if (window.JIA_calendar) window.JIA_calendar({ title: ev.title, start: evStart(ev), mins: 90, place: ev.place }); return; }
      ev.remind = !ev.remind;
      if (ev.remind && window.JIA_remind) window.JIA_remind({ title: ev.title, start: evStart(ev), icon: AV[ev.host] || "" });   /* JG-PROD: owner 4 Oct R6, an event with no host has no host photo (no request for "undefined") */
      renderEvents(); return;
    }
    const go = e.target.closest("[data-go]"), cm = e.target.closest("[data-cm]"), sh = e.target.closest("[data-share]"), host = e.target.closest(".cm-host");
    if (go) {
      const ev = EVENTS[+go.dataset.go]; ev.me = !ev.me;
      go.classList.toggle("on", ev.me); go.textContent = ev.me ? "✓ Going" : "I'm going"; go.setAttribute("aria-pressed", String(ev.me));
      go.closest(".cm-ev").querySelector(".cm-going").textContent = `${ev.going + (ev.me ? 1 : 0)} going`;
      if (ev.me && !reduce) go.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 300 });
    } else if (cm) {
      const ev = EVENTS[+cm.dataset.cm];
      openComments(ev.cmts, ev.title, () => renderEvents());
    } else if (sh) {
      const ev = EVENTS[+sh.dataset.share];
      openShare({ what: "event", title: ev.title, url: `https://jia.app/events/${+sh.dataset.share + 1}` });
    } else if (host) openProfile(host.dataset.who);
  });

  renderEvents();

  /* ---------- stories: post your own, watch everyone's ---------- */
  const STK = window.JIA_IMG || {};
  const MY = [], SEEN = new Set();
  const meBtn = $("cm-me");
  $("cm-me-coin").style.backgroundImage = myPhoto.replace(/"/g, "'");
  $("po-new-av").innerHTML = meImg;
  const hasStory = id => !BLOCKED.has(id) && (id === "me" ? MY : STORIES[id] || []).length > 0;
  function paintRings() {
    spot.querySelectorAll(".cm-sp").forEach(b => b.classList.toggle("blocked", BLOCKED.has(b.dataset.id)));
    spot.querySelectorAll(".cm-sp").forEach(b => {
      const id = b.dataset.id;
      b.classList.toggle("has-story", hasStory(id));
      b.classList.toggle("seen", SEEN.has(id));
      if (!b.hasAttribute("aria-hidden")) b.setAttribute("aria-label", `${PEOPLE[id].name}, ${KIND[PEOPLE[id].kind]}. ${hasStory(id) ? "Watch story" : "Send a message"}`);
    });
    meBtn.classList.toggle("has-story", MY.length > 0);
    meBtn.classList.toggle("seen", SEEN.has("me"));
  }
  paintRings();

  const view = $("st-view"), bars = $("st-bars"), stCard = $("st-card");
  let queue = [], qi = 0, si = 0, stAnim = null, stFocus = null;
  const DUR = 5000;
  const listOf = id => id === "me" ? MY : STORIES[id] || [];
  function openStories(id) {
    queue = id === "me" ? ["me"] : ORDER.filter(p => hasStory(p));
    qi = Math.max(0, queue.indexOf(id)); si = 0;
    stFocus = document.activeElement;
    view.hidden = false; view.style.zIndex = String(++zTop);
    if (!reduce) { view.classList.remove("enter"); void view.offsetWidth; view.classList.add("enter"); }
    document.addEventListener("keydown", stKey);
    showStory();
    $("st-close").focus({ preventScroll: true });
  }
  function showStory() {
    const id = queue[qi], list = listOf(id), st = list[si];
    if (stAnim) stAnim.cancel();
    $("st-avwrap").innerHTML = id === "me" ? `<span class="st-meav" style="background-image:${myPhoto.replace(/"/g, "'")}"></span>` : `<img src="${AV[id]}" alt="">`;
    $("st-name").textContent = id === "me" ? "Your story" : PEOPLE[id].name;
    $("st-ago").textContent = st.ago || "now";
    bars.innerHTML = list.map((_, k) => `<i class="${k < si ? "done" : ""}"><b></b></i>`).join("");
    view.style.background = st.photo ? "#0c1510" : `linear-gradient(165deg, ${st.bg[0]}, ${st.bg[1]})`;
    view.classList.toggle("light", !st.photo);
    stCard.innerHTML = st.photo
      ? `<img class="st-photo" src="${st.photo}" alt="Story photo">`
      : `${st.sticker && STK[st.sticker] ? `<img class="st-stk" src="${STK[st.sticker]}" alt="">` : ""}<p style="color:${st.ink}">${esc(st.text)}</p>`;
    view.querySelector(".st-head").style.color = st.photo ? "#fff" : st.ink;
    view.querySelector(".st-x").style.cssText = st.photo ? "" : `background: rgba(255,255,255,.55); color: ${st.ink}`;
    bars.querySelectorAll("i").forEach(i => { i.style.background = st.photo ? "" : "rgba(0,0,0,.14)"; i.firstChild.style.background = st.photo ? "" : st.ink; });
    if (!reduce) { stCard.classList.remove("swap"); void stCard.offsetWidth; stCard.classList.add("swap"); }
    stAnim = bars.children[si].firstChild.animate([{ width: "0%" }, { width: "100%" }], { duration: DUR, fill: "forwards" });
    stAnim.onfinish = nextStory;
  }
  function nextStory() {
    const id = queue[qi];
    if (++si >= listOf(id).length) {
      SEEN.add(id); paintRings();
      si = 0;
      if (++qi >= queue.length) return closeStories();
    }
    showStory();
  }
  function prevStory() {
    if (si > 0) si--;
    else if (qi > 0) { qi--; si = 0; }
    showStory();
  }
  function closeStories() {
    if (stAnim) { stAnim.onfinish = null; stAnim.cancel(); stAnim = null; }
    const id = queue[qi]; if (id) SEEN.add(id);
    view.hidden = true; view.style.zIndex = ""; paintRings();
    document.removeEventListener("keydown", stKey);
    if (stFocus) stFocus.focus({ preventScroll: true });
  }
  function stKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closeStories(); }
    else if (e.key === "ArrowRight") nextStory();
    else if (e.key === "ArrowLeft") prevStory();
  }
  $("st-next").addEventListener("click", nextStory);
  $("st-prev").addEventListener("click", prevStory);
  $("st-close").addEventListener("click", closeStories);
  // hold to pause, like everywhere else
  let pressT = 0, held = false;
  view.addEventListener("pointerdown", e => {
    if (e.target.closest(".st-x")) return;
    pressT = setTimeout(() => { held = true; if (stAnim) stAnim.pause(); }, 180);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(t => view.addEventListener(t, () => {
    clearTimeout(pressT);
    if (held) { held = false; if (stAnim) stAnim.play(); }
  }));
  view.addEventListener("click", e => { if (held) e.stopPropagation(); }, true);

  // the strip: tap someone and their story opens (their profile, if they have none)
  spot.addEventListener("click", e => {
    const s = e.target.closest(".cm-sp");
    if (!s) return;
    if (hasStory(s.dataset.id)) openStories(s.dataset.id); else openProfile(s.dataset.id);
  });
  let myPending = null;
  meBtn.addEventListener("click", e => {
    const plus = !!e.target.closest(".cm-plus");
    if (!plus && MY.length) openStories("me");
    else if (!plus && myPending) toast("Your story is being checked by an admin");
    else openSheet("st");
  });
  $("st-who").addEventListener("click", () => openProfile(queue[qi]));

  /* ---------- bottom sheets ---------- */
  let sheetOpen = null, sheetFocus = null;
  function openSheet(which) {
    const el = $(which === "st" ? "st-sheet" : "po-sheet");
    sheetFocus = document.activeElement;
    if (which === "st") resetStory(); else resetPost();
    el.hidden = false; sheetOpen = el;
    document.addEventListener("keydown", sheetKey);
    setTimeout(() => (which === "st" ? $("st-text") : $("po-text")).focus({ preventScroll: true }), reduce ? 0 : 350);
  }
  function closeSheet() {
    if (!sheetOpen) return;
    sheetOpen.hidden = true; sheetOpen = null;
    document.removeEventListener("keydown", sheetKey);
    if (sheetFocus) sheetFocus.focus({ preventScroll: true });
  }
  function sheetKey(e) { if (e.key === "Escape") { e.preventDefault(); closeSheet(); } }
  document.querySelectorAll(".cm-sheet [data-close]").forEach(b => b.addEventListener("click", closeSheet));
  const readPhoto = (input, done) => {
    const f = input.files && input.files[0];
    if (!f) return;
    const r = new FileReader(); r.onload = () => done(r.result); r.readAsDataURL(f);
    input.value = "";
  };

  // your story: text on a colour, or a photo
  const SWATCH = [["#dbe9fb", "#a9c8f0", "#214269"], ["#fbeedf", "#f3d09e", "#694721"], ["#e6f5eb", "#bee6d1", "#1e684a"], ["#fae1e4", "#f2b9c3", "#69212b"], ["#e8e2f8", "#cbbdf0", "#342169"]];
  const comp = $("st-compose"), stText = $("st-text"), stShare = $("st-share");
  let sw = 0, stPhoto = null;
  $("st-tools").insertAdjacentHTML("afterbegin", SWATCH.map((c, k) => `<button class="st-sw" type="button" data-sw="${k}" aria-label="Colour ${k + 1}" aria-pressed="${k === 0}" style="--c1:${c[0]};--c2:${c[1]}"></button>`).join(""));
  function paintSwatch() {
    const c = SWATCH[sw];
    comp.style.cssText = `--c1:${c[0]};--c2:${c[1]};--c3:${c[2]}`;
    $("st-tools").querySelectorAll(".st-sw").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.sw === sw)));
  }
  function resetStory() {
    sw = 0; stPhoto = null; stText.value = ""; stText.hidden = false;
    comp.querySelectorAll("img").forEach(i => i.remove());
    paintSwatch(); stShare.disabled = true;
  }
  $("st-tools").addEventListener("click", e => { const b = e.target.closest(".st-sw"); if (b) { sw = +b.dataset.sw; paintSwatch(); } });
  stText.addEventListener("input", () => { stShare.disabled = !stText.value.trim() && !stPhoto; });
  $("st-file").addEventListener("change", e => readPhoto(e.target, url => {
    stPhoto = url; stText.hidden = true;
    comp.querySelectorAll("img").forEach(i => i.remove());
    comp.insertAdjacentHTML("beforeend", `<img src="${url}" alt="Your photo">`);
    stShare.disabled = false;
  }));
  stShare.addEventListener("click", () => { if (window.JG_ENGINE) { if (!window.JG_CM) { closeSheet(); toast("Community opens soon"); } else if (stPhoto || screenOrStop(stText.value.trim())) window.JG_CM.story({ photo: stPhoto, text: stText.value.trim(), bg: SWATCH[sw], done: closeSheet }); return; }   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): a real student's story is never "approved and live" after 6 s with nothing stored: with COMMUNITY off she is told "Community opens soon"; on, public/runtime/jg-community.js (window.JG_CM) sends it for review */
    if (!stPhoto && !screenOrStop(stText.value.trim())) return;
    const c = SWATCH[sw];
    const entry = stPhoto ? { photo: stPhoto, ago: "now" } : { bg: [c[0], c[1]], ink: c[2], text: stText.value.trim(), ago: "now" };
    myPending = entry; closeSheet();
    meBtn.classList.add("pending"); meBtn.querySelector(".cm-nm").textContent = "In review";
    toast("Checking… usually a few minutes. Your story goes live once it's approved."); document.dispatchEvent(new CustomEvent("jia:review", { detail: { type: "story", text: entry.text || "" } }));
    setTimeout(() => {                                         // an admin approves it (simulated here)
      MY.push(entry); myPending = null;
      meBtn.classList.remove("pending"); meBtn.querySelector(".cm-nm").textContent = "Your story";
      SEEN.delete("me"); paintRings(); toast("Your story was approved and is live");
      notify({ icon: STK.backpack, text: "<b>Your story was approved</b> and is live", go: () => openStories("me") });
    }, 6000);
  });

  /* ---------- posts: anyone can share, an admin approves first ---------- */
  const POSTS = [
    { who: "aziza", ago: "1h", likes: 48, stk: "sat", g: ["#e0ecfa", "#c3daf4"],
      text: "Three SAT math shortcuts that save time:\n1. Plug in simple numbers.\n2. Work backwards from the answers.\n3. Sketch every geometry question." },
    { who: "nilufar", ago: "3h", likes: 73, stk: "atom", g: ["#e8e2f8", "#d2c7ef"],
      text: "How I got 5s on five AP exams: one topic a day, past papers every weekend, and teaching each topic to a friend." },
    { who: "kamila", ago: "6h", likes: 31, text: "IELTS Writing Task 2: spend five minutes planning. It saves ten minutes of rewriting." },
    { who: "madina", ago: "1d", likes: 96, stk: "robot", g: ["#fbeedf", "#f5ddc2"],
      text: "Our robotics team made it to the national final! Thank you to everyone who helped us prepare 🤖" },
  ];
  POSTS.forEach((p, i) => { p.cmts = [[C("dilnoza", "Saving this, thank you!", "40m")], [C("sardor", "The teaching part really works.", "2h", [C("nilufar", "It's the best trick I know 😄", "1h")])], [], [C("javlon", "So proud of the team!", "20h")]][i] || []; });
  const feedEl = $("po-feed");
  const HEART = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.1 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>`;
  function postHTML(p, i, fresh) {
    if (BLOCKED.has(p.who)) return "";
    const me = p.who === "me", person = PEOPLE[p.who];
    const av = me ? meImg : `<img class="cm-av" src="${AV[p.who]}" alt="">`;
    const name = me ? "You" : esc(person.name);
    const role = me ? "" : `<span class="cm-role">${KIND[person.kind]}</span>`;
    const st = me && p.status ? `<span class="po-st ${p.status}${p.gone ? " gone" : ""}">${p.status === "wait" ? "Checking… usually a few minutes" : "Approved"}</span>` : "";
    const img = p.photo ? `<div class="po-img photo"><img src="${p.photo}" alt=""></div>`
      : p.stk && STK[p.stk] ? `<div class="po-img stk" style="--g1:${p.g[0]};--g2:${p.g[1]}"><img src="${STK[p.stk]}" alt=""></div>` : "";
    return `<article class="po${me ? "" : ` k-${person.kind}`}${fresh && !reduce ? " new" : ""}" data-i="${i}">
        <div class="po-head"><button class="po-au" type="button" data-who="${p.who}" aria-label="${name}, open profile">${av}</button><div><button class="po-name" type="button" data-who="${p.who}"><b>${name}${role}</b></button><small>${p.ago}</small></div>${st}<button class="po-more" type="button" data-pmore="${i}" aria-label="More options">⋯</button></div>
        ${me && p.status === "wait" ? `<p class="po-note">Only you can see this until an admin approves it.</p>` : ""}
        <p class="po-text">${esc(p.text)}</p>${img}${p.poll ? pollHTML(p.poll, "p" + i) : ""}
        ${me && p.status === "wait" ? "" : `<div class="po-foot"><button class="po-like${p.liked ? " on" : ""}" type="button" data-like="${i}" aria-pressed="${!!p.liked}">${HEART}<span>${p.likes + (p.liked ? 1 : 0)}</span></button><button class="po-act" type="button" data-pcm="${i}" aria-label="Comments">${CMT_I}<span>${countAll(p.cmts || [])}</span></button><button class="po-act" type="button" data-psh="${i}" aria-label="Share">${SHARE_I}</button></div>`}
      </article>`;
  }
  function renderPosts(freshIdx) { feedEl.innerHTML = POSTS.map((p, i) => postHTML(p, i, i === freshIdx)).join("") || (window.JG_ENGINE ? `<p class="pf-empty">No posts yet.</p>` : ""); }   /* JG-PROD: owner 4 Oct R13, a real student's empty Posts says so, in the profile's own words and class */
  renderPosts();
  function postClick(e) {
    const more = e.target.closest("[data-pmore]");
    if (more) {
      const p = POSTS[+more.dataset.pmore];
      openReport({ what: "post", who: p.who, label: p.text.slice(0, 60), onDelete: p.who === "me" ? () => { POSTS.splice(POSTS.indexOf(p), 1); renderPosts(); if (!pfView.hidden) paintProfile(); toast("Post deleted"); } : null });
      return;
    }
    const like = e.target.closest("[data-like]"), cm = e.target.closest("[data-pcm]"), sh = e.target.closest("[data-psh]"), au = e.target.closest("[data-who]");
    if (like) {
      const p = POSTS[+like.dataset.like]; p.liked = !p.liked;
      document.querySelectorAll(`[data-like="${like.dataset.like}"]`).forEach(b => { b.classList.toggle("on", p.liked); b.setAttribute("aria-pressed", String(p.liked)); b.querySelector("span").textContent = p.likes + (p.liked ? 1 : 0); });
    } else if (cm) {
      const i = +cm.dataset.pcm, p = POSTS[i];
      openComments(p.cmts, `${nameOf(p.who)}: ${p.text.slice(0, 60)}`, n => document.querySelectorAll(`[data-pcm="${i}"] span`).forEach(x => { x.textContent = n; }));
    } else if (sh) {
      const i = +sh.dataset.psh, p = POSTS[i];
      openShare(window.JG_ENGINE ? (window.JG_CM ? window.JG_CM.share("post", p) : { what: "post", title: "JIA", url: "https://app.jamals.uz" }) : { what: "post", title: `${nameOf(p.who)}: ${p.text.slice(0, 60)}`, url: `https://jia.app/p/${i + 1}` });   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): a real student's share link is the app's own address (with COMMUNITY on, the item's app.jamals.uz/c/ link from the server), never the design's made-up jia.app, and its text names nobody */
    } else if (au) openProfile(au.dataset.who);
  }
  feedEl.addEventListener("click", postClick);
  $("po-new").addEventListener("click", () => { if (window.JG_ENGINE && !(window.JG_CM ? window.JG_CM.open("post") : toast("Community opens soon"))) return; openSheet("po"); });   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): a real student's post was "approved and is now public" after 6 s with nothing stored, then a "First post" medal: with COMMUNITY off she is told plainly "Community opens soon" and no composer opens; on, window.JG_CM says whether it may (a username first) */
  const poText = $("po-text"), poSubmit = $("po-submit");
  let poPhoto = null;
  function resetPost() { poText.value = ""; poPhoto = null; $("po-prev").hidden = true; poSubmit.disabled = true; }
  poText.addEventListener("input", () => { poSubmit.disabled = !poText.value.trim(); });
  $("po-file").addEventListener("change", e => readPhoto(e.target, url => { poPhoto = url; $("po-prev-img").src = url; $("po-prev").hidden = false; }));
  $("po-prev-x").addEventListener("click", () => { poPhoto = null; $("po-prev").hidden = true; });
  poSubmit.addEventListener("click", () => { if (window.JG_ENGINE) { if (!window.JG_CM) { closeSheet(); toast("Community opens soon"); } else if (screenOrStop(poText.value.trim())) window.JG_CM.post({ text: poText.value.trim(), photo: poPhoto, poll: poPoll, done: () => { poPoll = null; $("po-poll-prev").hidden = true; closeSheet(); } }); return; }   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): no simulated approval, notification or "First post" unlock for a real student: COMMUNITY off, "Community opens soon"; on, the server keeps it waiting for an admin */
    if (!screenOrStop(poText.value.trim())) return;
    const post = { who: "me", ago: "now", likes: 0, text: poText.value.trim(), photo: poPhoto, status: "wait", cmts: [], poll: poPoll };
    poPoll = null; $("po-poll-prev").hidden = true;
    POSTS.unshift(post); renderPosts(0); closeSheet();
    toast("Checking… usually a few minutes."); document.dispatchEvent(new CustomEvent("jia:review", { detail: { type: "post", text: post.text || post.body || post.cap || "" } }));
    setTimeout(() => {                                         // an admin approves it (simulated here)
      post.status = "ok"; renderPosts();
      toast("Your post was approved and is now public");
      notify({ icon: STK.books, text: "<b>Your post was approved</b> and is now public", go: () => goCommunity(() => select("po")) }); unlock("post");
      setTimeout(() => { post.gone = true; const el = feedEl.querySelector(`[data-i="${POSTS.indexOf(post)}"] .po-st`); if (el) el.classList.add("gone"); }, 2600);
    }, 6000);
  });

  /* a small note at the top of Community */
  let toastT = 0;
  function toast(msg) {
    const t = $("cm-toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600);
  }


  /* ---------- Reels: full-screen vertical videos, like Instagram ----------
     The first reels are short animated lessons (captions timed to a voiceover); anyone can post
     a real video from their phone, and an admin approves it before it's public. */
  const REELS = [
    { who: "aziza", obj: "sat", b: ["#dbe9fb", "#a3c3ee"], ink: "#16345a", dur: 12, likes: 2410, cmts: 86,
      cap: "SAT math trick: stuck on an algebra question? Plug in a simple number and test the answers. #SAT #math",
      lines: ["SAT math trick 🧠", "Stuck on algebra?", "Plug in x = 2", "Test each answer", "Done in 20 seconds ✓"],
      voice: "SAT math trick. Stuck on an algebra question? Plug in a simple number, like two, then test each answer. Done in twenty seconds." },
    { who: "kamila", obj: "ielts", b: ["#fbeedf", "#f1cc97"], ink: "#5a3a14", dur: 13, likes: 1876, cmts: 64,
      cap: "IELTS Speaking: three phrases that buy you thinking time without sounding stuck. Save this for your exam!",
      lines: ["IELTS Speaking 🎧", "Need a moment to think?", "“That's an interesting question…”", "“Let me think about that…”", "“What comes to mind first is…”"],
      voice: "IELTS speaking. Need a moment to think? Try: that's an interesting question. Or: let me think about that. Or: what comes to mind first is." },
    { who: "nilufar", obj: "atom", b: ["#e8e2f8", "#c6b7ef"], ink: "#2f1f63", dur: 12, likes: 3120, cmts: 112,
      cap: "How I got five 5s on AP exams: the 25-5 method, four rounds, then I teach it to a friend. #AP #studytips",
      lines: ["My AP routine ⚛️", "25 minutes: focus", "5 minutes: break", "Repeat four times", "Then teach it to a friend"],
      voice: "My AP routine. Twenty five minutes of focus. Five minutes of break. Repeat four times. Then teach it to a friend." },
    { who: "timur", obj: "brain", b: ["#e5f5ec", "#b9e3cb"], ink: "#1b4d36", dur: 11, likes: 954, cmts: 41,
      cap: "Day 30 of my study streak. One hour a day, every day. Who's starting with me today? 🔥",
      lines: ["Day 30 🔥", "One hour a day", "Small steps", "Every single day", "Start yours today →"],
      voice: "Day thirty. One hour a day. Small steps, every single day. Start yours today." },
    { who: "javlon", obj: "robot", b: ["#13281e", "#21422f"], ink: "#e6f0eb", dark: true, dur: 12, likes: 2688, cmts: 97,
      cap: "Physics in 10 seconds: in a vacuum a ball and a feather land at the same time. Gravity accelerates everything equally.",
      lines: ["Physics in 10 seconds ⚡", "A ball and a feather…", "…in a vacuum", "land at the same time", "Gravity pulls everything equally"],
      voice: "Physics in ten seconds. A ball and a feather, in a vacuum, land at the same time. Gravity pulls everything equally." },
  ];
  const RL_SAY = [["dilnoza", "This saved me so much time 🙌", "3h"], ["madina", "Saving this for later!", "5h"], ["sardor", "More like this please", "6h"],
                  ["laylo", "Great tip, thank you!", "8h"], ["jasur", "Trying this today", "1d"]];
  REELS.forEach((r, i) => { const a = RL_SAY[i % 5], b = RL_SAY[(i + 2) % 5]; r.comments = [C(a[0], a[1], a[2]), C(b[0], b[1], b[2], i === 0 ? [C("aziza", "Glad it helps! More tips on Friday.", "2h")] : [])]; }); if (window.JG_ENGINE) REELS.length = 0;   /* JG-PROD: owner 4 Oct R13, a real student sees none of the design's reels by invented teachers and students (a reel they post themselves still shows) */
  const RI = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.4-4.5-9.1-9.3C1.7 7.5 4 4.4 7.3 4.4c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.1 9.3-9.1 9.3z"/></svg>',
    cmt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.2 8.2 0 0 1-12 7.3L4 20l1.2-4.1a8.2 8.2 0 1 1 15.3-4.3z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/></svg>',
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-6-4.2-6 4.2z"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5a2.8 2.8 0 1 1-2.8-2.8c.5 0 .9.1 1.3.3V5.5l11-2v11.4a2.8 2.8 0 1 1-1.6-2.5V7.3L9 8.7z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    on: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 10a3 3 0 0 1 0 4M18 7.5a6.5 6.5 0 0 1 0 9"/></svg>',
    off: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  };
  const fmtN = n => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n);
  const rlView = $("rl-view"), rlFeed = $("rl-feed");
  const rlItems = () => rlFeed.children;
  function reelHTML(r, i) {
    if (BLOCKED.has(r.who)) return `<article class="rl-item rl-blocked" data-i="${i}"><p>Content from an account you blocked</p></article>`;
    const me = r.who === "me", p = PEOPLE[r.who];
    const name = me ? "You" : p.name, av = me ? meImg : `<img src="${AV[r.who]}" alt="">`;
    const media = r.video
      ? `<video src="${r.video}" playsinline loop preload="auto"></video>`
      : `<div class="rl-scene${r.dark ? " dark" : ""}" style="--b1:${r.b[0]};--b2:${r.b[1]};--ink2:${r.ink}">
           ${STK[r.obj] ? `<img class="rl-obj" src="${STK[r.obj]}" alt="">` : ""}
           ${r.lines.map(l => `<p class="rl-line">${esc(l)}</p>`).join("")}
         </div>`;
    return `<article class="rl-item" data-i="${i}" aria-label="Reel by ${esc(name)}">
        <div class="rl-media">${media}</div>
        <div class="rl-shade-t"></div><div class="rl-shade-b"></div>
        <div class="rl-side">
          <button class="rl-act like${r.liked ? " on" : ""}" type="button" aria-pressed="${!!r.liked}" aria-label="Like">${RI.heart}<span>${fmtN(r.likes + (r.liked ? 1 : 0))}</span></button>
          <button class="rl-act cmt" type="button" aria-label="Comments">${RI.cmt}<span>${fmtN(r.cmts)}</span></button>
          <button class="rl-act share" type="button" aria-label="Share">${RI.share}<span>Share</span></button>
          <button class="rl-act save${r.saved ? " on" : ""}" type="button" aria-pressed="${!!r.saved}" aria-label="Save">${RI.save}</button>
          <button class="rl-act more" type="button" aria-label="More options"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/></svg></button>
        </div>
        <div class="rl-meta">
          <div class="rl-who"><button class="rl-au" type="button" data-who="${r.who}" aria-label="${esc(name)}, open profile">${av}<b>${esc(name)}</b></button>${me ? "" : `<span class="rl-role">${KIND[p.kind]}</span><button class="rl-follow${r.follow ? " on" : ""}" type="button">${r.follow ? "Following" : "Follow"}</button>`}</div>
          <p class="rl-cap">${esc(r.cap)}</p>
          <p class="rl-audio">${RI.note}<span>${esc(name)}, original audio</span></p>
        </div>
        <div class="rl-state" aria-hidden="true">${RI.play}</div>
        <div class="rl-prog" aria-hidden="true"><i></i></div>
      </article>`;
  }

  // playback: the reel on screen plays; captions follow the clock; the voiceover reads it; it loops
  let rlOn = -1, rlT0 = 0, rlPausedAt = 0, rlPaused = false, rlRaf = 0, rlMuted = false, rlLine = -1, rlLoop = -1, rlFocus = null;
  const synthOK = "speechSynthesis" in window;
  function say(r) {
    if (!synthOK || rlMuted || !r.voice || (window.JIA_SETTINGS && window.JIA_SETTINGS.voice === false)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(r.voice); u.lang = "en-US"; u.rate = 1.02; speechSynthesis.speak(u); } catch (e) {}
  }
  function showLine(item, k) {
    item.querySelectorAll(".rl-line").forEach((l, j) => {
      if (j === k) { l.classList.remove("gone"); l.classList.add("on"); }
      else if (l.classList.contains("on")) { l.classList.remove("on"); l.classList.add("gone"); setTimeout(() => l.classList.remove("gone"), 320); }
    });
  }
  function tick(now) {
    const r = REELS[rlOn], item = rlItems()[rlOn];
    if (!r || !item) return;
    const bar = item.querySelector(".rl-prog i");
    if (r.video) {
      const v = item.querySelector("video");
      if (v && v.duration) bar.style.width = `${(v.currentTime / v.duration) * 100}%`;
    } else if (!rlPaused) {
      const t = (now - rlT0) / 1000, loop = Math.floor(t / r.dur), within = t - loop * r.dur;
      bar.style.width = `${(within / r.dur) * 100}%`;
      const k = Math.min(r.lines.length - 1, Math.floor(within / (r.dur / r.lines.length)));
      if (k !== rlLine) { showLine(item, k); rlLine = k; }
      if (loop !== rlLoop) { rlLoop = loop; say(r); }
    }
    rlRaf = requestAnimationFrame(tick);
  }
  function stopReel() {
    if (rlOn < 0) return;
    const item = rlItems()[rlOn];
    if (item) {
      item.classList.remove("playing", "paused");
      item.querySelectorAll(".rl-line").forEach(l => l.classList.remove("on", "gone"));
      const v = item.querySelector("video"); if (v) v.pause();
    }
    if (synthOK) speechSynthesis.cancel();
    cancelAnimationFrame(rlRaf); rlOn = -1;
  }
  function playReel(i) {
    if (i === rlOn || i < 0 || i >= REELS.length) return;
    stopReel();
    rlOn = i; rlPaused = false; rlLine = -1; rlLoop = -1; rlT0 = performance.now();
    const item = rlItems()[i], r = REELS[i];
    item.classList.add("playing");
    if (r.video) {
      const v = item.querySelector("video"); v.currentTime = 0; v.muted = rlMuted;
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
    }
    rlRaf = requestAnimationFrame(tick);
  }
  function togglePause() {
    const item = rlItems()[rlOn], r = REELS[rlOn];
    if (!item) return;
    rlPaused = !rlPaused;
    item.classList.toggle("paused", rlPaused);
    if (r.video) { const v = item.querySelector("video"); rlPaused ? v.pause() : v.play().catch(() => {}); return; }
    if (rlPaused) { rlPausedAt = performance.now(); if (synthOK) speechSynthesis.pause(); }
    else { rlT0 += performance.now() - rlPausedAt; if (synthOK) speechSynthesis.resume(); }
  }
  function likeReel(i, fromTap, e) {
    const r = REELS[i], item = rlItems()[i], btn = item.querySelector(".rl-act.like");
    r.liked = fromTap ? true : !r.liked;
    btn.classList.toggle("on", r.liked); btn.setAttribute("aria-pressed", String(r.liked));
    btn.querySelector("span").textContent = fmtN(r.likes + (r.liked ? 1 : 0));
    if (fromTap && !reduce) {                                 // the big heart where you tapped
      const b = item.getBoundingClientRect(), h = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      h.setAttribute("viewBox", "0 0 24 24"); h.setAttribute("class", "rl-burst");
      h.innerHTML = '<path d="M12 20.3s-7.4-4.5-9.1-9.3C1.7 7.5 4 4.4 7.3 4.4c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.1 9.3-9.1 9.3z"/>';
      h.style.left = `${e.clientX - b.left}px`; h.style.top = `${e.clientY - b.top}px`;
      item.appendChild(h); setTimeout(() => h.remove(), 950);
    }
  }
  let rlToastT = 0;
  function rlToast(msg) {
    const t = $("rl-toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(rlToastT); rlToastT = setTimeout(() => t.classList.remove("on"), 2200);
  }
  let tapT = 0, lastTap = 0;
  rlFeed.addEventListener("click", e => {
    const item = e.target.closest(".rl-item");
    if (!item) return;
    const i = +item.dataset.i, r = REELS[i], act = e.target.closest(".rl-act, .rl-follow, .rl-cap, .rl-au");
    if (act) {
      if (act.classList.contains("more")) { if (!rlPaused) togglePause(); openReport({ what: "reel", who: r.who, label: r.cap.slice(0, 60) }); return; }
      if (act.classList.contains("like")) likeReel(i, false);
      else if (act.classList.contains("cmt")) openRlComments(i);
      else if (act.classList.contains("share")) openShare(window.JG_ENGINE ? (window.JG_CM ? window.JG_CM.share("reel", r) : { what: "reel", title: "JIA", url: "https://app.jamals.uz" }) : { what: "reel", title: `${nameOf(r.who)}: ${r.cap.slice(0, 60)}`, url: `https://jia.app/reels/${i + 1}` });   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): the app's own address, never jia.app, and no name */
      else if (act.classList.contains("rl-au")) { if (!rlPaused) togglePause(); openProfile(act.dataset.who); } else if (act.classList.contains("save")) {
        r.saved = !r.saved; act.classList.toggle("on", r.saved); act.setAttribute("aria-pressed", String(r.saved));
        rlToast(r.saved ? "Saved to your collection" : "Removed from saved");
      } else if (act.classList.contains("rl-follow")) {
        const now = !r.follow;
        REELS.forEach((x, k) => { if (x.who === r.who) { x.follow = now; const f = rlItems()[k].querySelector(".rl-follow"); if (f) { f.classList.toggle("on", now); f.textContent = now ? "Following" : "Follow"; } } });
      } else if (act.classList.contains("rl-cap")) act.classList.toggle("open");
      return;
    }
    const t = Date.now();                                    // one tap pauses, two taps like
    if (t - lastTap < 300) { clearTimeout(tapT); lastTap = 0; likeReel(i, true, e); }
    else { lastTap = t; tapT = setTimeout(togglePause, 300); }
  });
  let scrollT = 0;
  rlFeed.addEventListener("scroll", () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(() => playReel(Math.round(rlFeed.scrollTop / rlFeed.clientHeight)), 90);
  }, { passive: true });
  const rlGo = i => rlFeed.scrollTo({ top: Math.max(0, Math.min(REELS.length - 1, i)) * rlFeed.clientHeight, behavior: reduce ? "auto" : "smooth" });
  function openReels(start) {
    rlFocus = document.activeElement;
    rlFeed.innerHTML = REELS.map(reelHTML).join("");
    rlView.hidden = false;
    if (!reduce) { rlView.classList.remove("enter"); void rlView.offsetWidth; rlView.classList.add("enter"); }
    rlFeed.scrollTop = start * rlFeed.clientHeight;
    rlOn = -1; playReel(start);
    document.addEventListener("keydown", rlKey);
    $("rl-close").focus({ preventScroll: true });
  }
  function closeReels() {
    stopReel(); closeRlSheet();
    rlView.hidden = true; rlView.style.zIndex = "";
    document.removeEventListener("keydown", rlKey);
    if (rlFocus) rlFocus.focus({ preventScroll: true });
  }
  function rlKey(e) {
    if (rlSheet) { if (e.key === "Escape") { e.preventDefault(); closeRlSheet(); } return; }
    if (e.key === "Escape") { e.preventDefault(); closeReels(); }
    else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); rlGo(rlOn + 1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); rlGo(rlOn - 1); }
    else if (e.key === "k" || (e.key === " " && !e.target.closest("button, input, textarea"))) { e.preventDefault(); togglePause(); }
  }
  $("rl-close").addEventListener("click", closeReels);
  $("rl-mute").addEventListener("click", () => {
    rlMuted = !rlMuted;
    $("rl-mute").innerHTML = rlMuted ? RI.off : RI.on;
    $("rl-mute").setAttribute("aria-label", rlMuted ? "Unmute" : "Mute");
    [...rlFeed.querySelectorAll("video")].forEach(v => { v.muted = rlMuted; });
    if (rlMuted) { if (synthOK) speechSynthesis.cancel(); }
    else if (rlOn >= 0) say(REELS[rlOn]);
    rlToast(rlMuted ? "Sound off" : "Sound on");
  });

  // sheets over the reels: comments, and posting your own
  let rlSheet = null, rlCmIdx = -1;
  function openRlSheet(el, focusEl) { el.hidden = false; rlSheet = el; setTimeout(() => focusEl.focus({ preventScroll: true }), reduce ? 0 : 320); }
  function closeRlSheet() { if (rlSheet) { rlSheet.hidden = true; rlSheet = null; } }
  document.querySelectorAll("[data-rl-close]").forEach(b => b.addEventListener("click", closeRlSheet));
  function openRlComments(i) {
    const r = REELS[i];
    openComments(r.comments, `${nameOf(r.who)}: ${r.cap.slice(0, 60)}`, () => { r.cmts++; const c = rlItems()[i]; if (c) c.querySelector(".rl-act.cmt span").textContent = fmtN(r.cmts); });
  }
  let rlVideo = null;
  $("rl-new").addEventListener("click", () => { if (window.JG_ENGINE && !(window.JG_CM ? window.JG_CM.open("reel") : shToast("Community opens soon"))) return;   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): a real student's reel was "approved and is now public" after 6 s while the video stayed in the page: COMMUNITY off, "Community opens soon"; on, window.JG_CM */
    rlVideo = null;
    $("rl-vprev").textContent = "Choose a video to preview it here";
    $("rl-cap").value = ""; $("rl-submit").disabled = true;
    if (!rlPaused && rlOn >= 0) togglePause();
    openRlSheet($("rl-new-sheet"), $("rl-cap"));
  });
  $("rl-file").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    e.target.value = "";
    const show = url => {
      rlVideo = url;
      $("rl-vprev").innerHTML = `<video src="${url}" muted autoplay loop playsinline></video>`;
      $("rl-submit").disabled = false;
      return $("rl-vprev").querySelector("video");
    };
    const v = show(URL.createObjectURL(f));
    v.addEventListener("error", () => {                        // some hosts refuse blob links: embed the file instead
      const r = new FileReader(); r.onload = () => show(r.result); r.readAsDataURL(f);
    }, { once: true });
  });
  $("rl-submit").addEventListener("click", () => { if (window.JG_ENGINE) { if (!window.JG_CM) { closeRlSheet(); shToast("Community opens soon"); } else if (rlVideo && screenOrStop($("rl-cap").value.trim(), "reels")) window.JG_CM.reel({ cap: $("rl-cap").value.trim(), video: rlVideo, done: closeRlSheet }); return; }   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): no simulated approval, notification or "First reel" unlock for a real student */
    if (!rlVideo) return;
    if (!screenOrStop($("rl-cap").value.trim(), "reels")) return;
    const reel = { who: "me", video: rlVideo, cap: $("rl-cap").value.trim() || "My new reel", likes: 0, cmts: 0, comments: [] };
    closeRlSheet();
    rlToast("Checking… usually a few minutes."); document.dispatchEvent(new CustomEvent("jia:review", { detail: { type: "reel", text: reel.cap || "" } }));
    setTimeout(() => {                                        // an admin approves it (simulated here)
      REELS.unshift(reel); renderReelGrid();
      notify({ icon: STK.laptop, text: "<b>Your reel was approved</b> and is now public", go: () => openReels(0) }); unlock("reel");
      if (!rlView.hidden) { stopReel(); rlFeed.innerHTML = REELS.map(reelHTML).join(""); rlFeed.scrollTop = 0; playReel(0); rlToast("Your reel was approved and is now public"); }
      else toast("Your reel was approved and is now public");
    }, 6000);
  });


  /* ==========================================================
     SOCIAL LAYER: profiles, comments with replies, the share sheet,
     and overlays that stack on top of each other.
     ========================================================== */
  // overlays and sheets at the device level: open one on top of another, close back down
  const layers = [];
  let zTop = 70;                                              // desktop: above the rail and the wallet
  window.JIA_z = () => (zTop = Math.min(zTop + 1, 88));          // capped: pop-ups never cover the letter or the toasts
  function openLayer(el, focusEl) {
    el.hidden = false; el.style.zIndex = String(window.JIA_z());
    layers.push({ el, back: document.activeElement });
    if (focusEl) setTimeout(() => focusEl.focus({ preventScroll: true }), reduce ? 0 : 320);
  }
  function closeLayer(el) {
    const i = el ? layers.findIndex(l => l.el === el) : layers.length - 1;
    if (i < 0) return;
    const [l] = layers.splice(i, 1);
    l.el.hidden = true; l.el.style.zIndex = "";
    if (!layers.length) zTop = 70;
    if (l.back && document.contains(l.back)) l.back.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !layers.length || !menu.hidden) return;
    e.preventDefault(); e.stopImmediatePropagation(); closeLayer();
  }, true);
  document.querySelectorAll("[data-layer-close]").forEach(b => b.addEventListener("click", () => closeLayer(b.closest(".cm-sheet, .pf-view"))));

  /* ---------- comments, with replies ---------- */
  const cmSheet = $("cmt-sheet"), cmList = $("cmt-list"), cmIn = $("cmt-in"), cmPost = $("cmt-post"), cmBar = $("cmt-rbar");
  let cmData = null, cmChange = null, cmTo = null;
  const cmtBlock = (c, i, j) => BLOCKED.has(c.who) ? "" : `<div class="cmt${j != null ? " rep" : ""}">
      <button class="cm-avbtn" type="button" data-who="${c.who}" aria-label="${esc(nameOf(c.who))}, open profile">${c.who === "me" ? meImg : `<img class="cm-av" src="${AV[c.who]}" alt="">`}</button>
      <div class="cmt-b"><p><b>${esc(nameOf(c.who))}</b>${esc(c.text)}</p>
        <div class="cmt-meta"><span>${c.ago}</span><button type="button" data-reply="${i}" data-name="${esc(first(nameOf(c.who)))}">Reply</button>${c.who !== "me" ? `<button type="button" data-rep="${c.who}" data-txt="${esc(c.text.slice(0, 60))}">Report</button>` : ""}</div></div>
    </div>`;
  function paintComments(freshLast) {
    cmList.innerHTML = cmData.length ? cmData.map((c, i) => cmtBlock(c, i) + (c.replies.length ? `<div class="cmt-reps">${c.replies.map((r, j) => cmtBlock(r, i, j)).join("")}</div>` : "")).join("")
      : `<p class="cm-going cmt-empty">No comments yet. Start the conversation.</p>`;
    if (freshLast && !reduce) { const all = cmList.querySelectorAll(".cmt"); const el = all[freshLast === "reply" ? [...all].indexOf(cmList.querySelector(".cmt.just")) : all.length - 1]; if (el) el.classList.add("new"); }
  }
  function setReplyTo(i, name) {
    cmTo = i; cmBar.hidden = i == null;
    if (i != null) { cmBar.querySelector("b").textContent = `Replying to ${name}`; cmIn.value = `@${name} `; cmPost.disabled = false; cmIn.focus(); }
  }
  function openComments(list, title, onChange) {
    cmData = list; cmChange = onChange; cmTo = null; cmBar.hidden = true;
    $("cmt-title").textContent = "Comments"; $("cmt-sub").textContent = title;
    $("cmt-me").innerHTML = meImg; cmIn.value = ""; cmPost.disabled = true;
    paintComments();
    openLayer(cmSheet, cmIn);
  }
  cmList.addEventListener("click", e => {
    const r = e.target.closest("[data-reply]"), av = e.target.closest(".cm-avbtn"), rp = e.target.closest("[data-rep]");
    if (rp) openReport({ what: "comment", who: rp.dataset.rep, label: rp.dataset.txt });
    else if (r) setReplyTo(+r.dataset.reply, r.dataset.name);
    else if (av) openProfile(av.dataset.who);
  });
  cmBar.querySelector("button").addEventListener("click", () => { setReplyTo(null); cmIn.value = ""; cmPost.disabled = true; });
  cmIn.addEventListener("input", () => { cmPost.disabled = !cmIn.value.trim(); });
  const postCmt = () => {
    const raw = cmIn.value.trim(); if (!raw || !cmData) return;
    const sc = screen(raw); if (sc.blocked) { shToast(SAFETY_NOTE); return; }
    const v = sc.clean;
    if (cmTo != null) cmData[cmTo].replies.push(C("me", v, "now"));
    else cmData.push(C("me", v, "now"));
    const wasReply = cmTo != null;
    cmIn.value = ""; cmPost.disabled = true; setReplyTo(null);
    paintComments(wasReply ? null : "top");
    cmList.scrollTop = wasReply ? cmList.scrollTop : cmList.scrollHeight;
    if (cmChange) cmChange(countAll(cmData));
  };
  cmPost.addEventListener("click", postCmt);
  cmIn.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); postCmt(); } });

  /* ---------- share: to people in the app, to other apps, or copy the link ---------- */
  const shSheet = $("sh-sheet"), shPeople = $("sh-people"), shSend = $("sh-send");
  const sendTo = new Set();
  let shItem = null;
  shPeople.innerHTML = ORDER.map(id => `<button class="sh-p" type="button" data-id="${id}" aria-pressed="false"><span class="sh-av"><img src="${AV[id]}" alt=""><i aria-hidden="true">✓</i></span><small>${esc(first(PEOPLE[id].name))}</small></button>`).join("");
  const shReady = () => { shSend.hidden = !sendTo.size; shSend.textContent = sendTo.size > 1 ? `Send separately (${sendTo.size})` : "Send"; };
  function openShare(item) {
    shItem = item; sendTo.clear();
    shPeople.querySelectorAll(".sh-p").forEach(b => b.setAttribute("aria-pressed", "false"));
    $("sh-sub").textContent = item.title; shReady();
    openLayer(shSheet, shPeople.querySelector(".sh-p"));
  }
  shPeople.addEventListener("click", e => {
    const b = e.target.closest(".sh-p"); if (!b) return;
    const id = b.dataset.id; sendTo.has(id) ? sendTo.delete(id) : sendTo.add(id);
    b.setAttribute("aria-pressed", String(sendTo.has(id))); shReady();
  });
  shSend.addEventListener("click", () => {
    const n = sendTo.size, label = { reel: "Reel", post: "Post", event: "Event", profile: "Profile" }[shItem.what] || "Link";
    sendTo.forEach(id => {
      if (!CHATS[`dm:${id}`]) dm(id, now(), 0, []);
      const c = CHATS[`dm:${id}`]; c.msgs.push(M("me", `🔗 ${label}: ${shItem.title}\n${shItem.url}`, now())); c.time = now();
    });
    renderConvs(); closeLayer(shSheet);
    shToast(`Sent to ${n} ${n > 1 ? "people" : "person"}`);
  });
  $("sh-apps").addEventListener("click", e => {
    const b = e.target.closest("[data-app]"); if (!b || !shItem) return;
    const u = encodeURIComponent(shItem.url), t = encodeURIComponent(shItem.title);
    const app = b.dataset.app;
    if (app === "copy") { try { navigator.clipboard.writeText(shItem.url).catch(() => {}); } catch (err) {} closeLayer(shSheet); shToast("Link copied"); return; }
    if (app === "more") { if (navigator.share) navigator.share({ title: shItem.title, url: shItem.url }).catch(() => {}); return; }
    const url = { telegram: `https://t.me/share/url?url=${u}&text=${t}`, whatsapp: `https://wa.me/?text=${t}%20${u}`, x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
                  facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`, email: `mailto:?subject=${t}&body=${t}%0A${u}` }[app];
    if (url) window.open(url, "_blank", "noopener");
  });
  if (!navigator.share) { const m = $("sh-apps").querySelector('[data-app="more"]'); if (m) m.hidden = true; }
  const shToast = msg => (rlView.hidden ? toast(msg) : rlToast(msg));

  /* ---------- profiles: everyone has one ---------- */
  const BIO = {
    aziza: "SAT teacher at JIA. Eight years of helping students reach 1500+.", javlon: "AP Calculus and Physics. Leads the robotics club.",
    kamila: "IELTS teacher. Speaking club every Sunday.", bekzod: "Psychology teacher. How we learn, and how to learn better.",
    dilnoza: "SAT 1580. Aiming for MIT. Happy to help with reading.", sardor: "IELTS 8.5. Debate team captain.",
    nilufar: "Five 5s on AP exams. STEM all the way.", asadbek: "SAT 1560. Math olympiad team.",
    madina: "Grade 11. Robotics team. Future engineer.", timur: "30-day study streak and counting 🔥",
    laylo: "Grade 10. Chemistry and chess.", jasur: "Grade 11. Building robots, one bolt at a time.",
    me: "Grade 11 at JIA. Aiming for MIT.",
  };
  const FOLLOWERS = { aziza: 3120, javlon: 1840, kamila: 2210, bekzod: 1290, dilnoza: 986, sardor: 742, nilufar: 1105, asadbek: 689, madina: 412, timur: 530, laylo: 288, jasur: 351, me: window.JG_ENGINE ? 0 : 214 };   /* JG-PROD: owner 4 Oct R12, a real student's own follower count (nobody follows them yet), not the design's 214 */
  const FOLLOWING = new Set(window.JG_ENGINE ? [] : ["aziza", "kamila"]);   /* JG-PROD: owner 4 Oct R12, a real student follows nobody until they tap Follow */
  const pfView = $("pf-view");
  let pfWho = null, pfTab = "posts";
  function openProfile(who) {
    if (!who) return;
    if (!view.hidden) closeStories();
    pfWho = who; pfTab = "posts";
    paintProfile();
    if (pfView.hidden) openLayer(pfView, $("pf-back"));
    $("pf-scroll").scrollTop = 0;
  }
  function paintProfile() {
    const who = pfWho, me = who === "me", p = PEOPLE[who]; if (!who) return; ["pf-more", "pf-actions", "pf-body"].forEach(id => { $(id).style.display = ""; }); document.querySelector(".pf-tabs").style.display = $("pf-stats").style.gridTemplateColumns = "";   /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase, D19): a person's profile after a teacher card (line 1162) gets back its report button, actions, tabs, posts and four stats; under the card (pfWho null) a repaint leaves the card as it is */
    const posts = POSTS.filter(x => x.who === who && (!me || x.status !== "wait")), reels = REELS.filter(x => x.who === who);
    const followers = FOLLOWERS[who] + (FOLLOWING.has(who) ? 1 : 0);
    $("pf-top-name").textContent = me ? JG_ME.fullName : p.name; /* JG-PROD: identity */
    $("pf-av").innerHTML = me ? `<span class="pf-img" style="background-image:${myPhoto.replace(/"/g, "'")}"></span>` : `<img class="pf-img" src="${AV[who]}" alt="">`;
    $("pf-av").className = `pf-av${hasStory(who) ? " has-story" : ""}${SEEN.has(who) ? " seen" : ""}${me && window.JG_ENGINE && !hasStory(who) ? " jg-photo-edit" : ""}`;   /* JG-PROD: owner 4 Oct P4g S4, a real student taps his own photo to change it (public/runtime/jg-photo.js; there was no place to upload one); his story, when he has one, still plays */
    $("pf-av").setAttribute("aria-label", hasStory(who) ? "Watch story" : me && window.JG_ENGINE ? "Change your photo" : "Profile photo");   /* JG-PROD: owner 4 Oct P4g S4 */
    $("pf-name").textContent = me ? JG_ME.fullName : p.name; /* JG-PROD: identity */
    $("pf-role").textContent = me ? "Student" : KIND[p.kind];
    $("pf-role").className = `pf-role k-${me ? "student" : p.kind}`;
    $("pf-tag").textContent = me ? (window.JG_ENGINE ? [window.JG_ENGINE.meLine(", "), `Level ${ME.level}`].filter(Boolean).join(" · ") : `Grade 11, JIA · Level ${ME.level}`) : p.tag;   /* JG-PROD: owner 4 Oct R12, a real student's own grade and school type, never "Grade 11, JIA" (the league level stays) */
    $("pf-bio").textContent = me && window.JG_ENGINE ? window.JG_ENGINE.meBio() : BIO[who];   /* JG-PROD: owner 4 Oct R12, e.g. "Grade 9, public school. Aiming for Stanford.", never "Grade 11 at JIA. Aiming for MIT." */
    $("pf-stats").innerHTML = `<span><b>${posts.length}</b>posts</span><span><b>${reels.length}</b>reels</span><span><b>${fmtN(followers)}</b>followers</span><span><b>${me ? (window.JG_ENGINE ? FOLLOWING.size : 96) : 120 + (followers % 90)}</b>following</span>`;   /* JG-PROD: owner 4 Oct R12, a real student's own following count, not the design's 96 */
    $("pf-achs").innerHTML = achStrip(who);
    $("pf-actions").innerHTML = me
      ? `<button class="pf-btn" type="button" data-pf="settings">Edit profile</button><button class="pf-btn ghost" type="button" data-pf="share">Share profile</button>`
      : `<button class="pf-btn${FOLLOWING.has(who) ? " on" : ""}" type="button" data-pf="follow">${FOLLOWING.has(who) ? "Following" : "Follow"}</button><button class="pf-btn ghost" type="button" data-pf="message">Message</button><button class="pf-btn ghost icon" type="button" data-pf="share" aria-label="Share profile">${SHARE_I}</button>`;
    document.querySelectorAll(".pf-tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === pfTab)));
    const body = $("pf-body");
    if (pfTab === "posts") body.innerHTML = posts.length ? posts.map(x => postHTML(x, POSTS.indexOf(x))).join("") : `<p class="pf-empty">${me ? "You haven't posted yet." : "No posts yet."}</p>`;
    else body.innerHTML = reels.length ? `<div class="pf-grid">${reels.map(r => {
        const i = REELS.indexOf(r);
        return `<button class="pf-reel" type="button" data-reel="${i}" style="--b1:${(r.b || ["#1a2a22", "#0e1612"])[0]};--b2:${(r.b || ["#1a2a22", "#0e1612"])[1]};--ink2:${r.ink || "#fff"}" aria-label="Reel: ${esc(r.cap)}">
          ${r.video ? `<video src="${r.video}" muted playsinline preload="metadata"></video>` : `${STK[r.obj] ? `<img src="${STK[r.obj]}" alt="">` : ""}<b>${esc(r.lines[0])}</b>`}
          <span class="pf-views">▶ ${fmtN(r.views != null ? r.views : r.likes * 7 + 300)}</span></button>`;   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): a real reel's views are the server's count (COMMUNITY on), never likes × 7 + 300 (her own new reel read "▶ 300") */
      }).join("")}</div>` : `<p class="pf-empty">${me ? "Your reels will show up here." : "No reels yet."}</p>`;
  }
  $("pf-back").addEventListener("click", () => closeLayer(pfView));
  $("pf-av").addEventListener("click", () => { if (hasStory(pfWho)) openStories(pfWho); });
  document.querySelector(".pf-tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) { pfTab = b.dataset.tab; paintProfile(); } });
  $("pf-actions").addEventListener("click", e => {
    const b = e.target.closest("[data-pf]"); if (!b) return;
    const act = b.dataset.pf, who = pfWho;
    if (act === "follow") {
      FOLLOWING.has(who) ? FOLLOWING.delete(who) : FOLLOWING.add(who);
      REELS.forEach(r => { if (r.who === who) r.follow = FOLLOWING.has(who); });
      paintProfile();
    } else if (act === "message") { closeLayer(pfView); if (!rlView.hidden) closeReels(); select("dm"); openThread(who); }
    else if (act === "share") openShare(window.JG_ENGINE ? (window.JG_CM ? window.JG_CM.share("profile", who) : { what: "profile", title: "JIA", url: "https://app.jamals.uz" }) : { what: "profile", title: who === "me" ? `${JG_ME.fullName} on JIA` : `${PEOPLE[who].name} on JIA`, url: `https://jia.app/u/${who === "me" ? "oqil" : who}` }); /* JG-PROD: identity */ /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): a real student's own profile was always jia.app/u/oqil, with her full name as the text to X and Facebook: now the app's own address and no name (with COMMUNITY on, her handle's /c/u/ link) */
    else if (act === "settings") { if (window.JIA_openSettings) window.JIA_openSettings(); else window.JIA.toast("Settings isn't on desktop yet"); }
  });
  $("pf-body").addEventListener("click", e => {
    const r = e.target.closest("[data-reel]");
    if (r) { openReels(+r.dataset.reel); rlView.style.zIndex = String(++zTop); return; }
    postClick(e);
  });
  window.JIA_openProfile = openProfile; window.JIA_openTeacher = t => { if (!t || !t.w) return; const W = t.w; pfWho = null; $("pf-top-name").textContent = $("pf-name").textContent = t.name; $("pf-av").innerHTML = `<img class="pf-img" src="${AV[t.avatar] || initialsAV(t.name, "#2b9067")}" alt="">`; $("pf-av").className = "pf-av"; $("pf-av").setAttribute("aria-label", "Profile photo"); $("pf-role").textContent = W.role; $("pf-role").className = "pf-role k-teacher"; $("pf-tag").textContent = t.subject; $("pf-bio").textContent = t.bio; $("pf-stats").style.gridTemplateColumns = `repeat(${t.stats.length}, 1fr)`; $("pf-stats").innerHTML = t.stats.map(s => `<span><b>${s.n}</b>${esc(s.label)}</span>`).join(""); $("pf-achs").innerHTML = `<div class="pf-ach-h"><b>${esc(W.results_h)}</b><span>${t.results.length}</span></div><ol class="ls-list" style="padding:6px 0 0">${t.results.map((r, k) => `<li class="ls-item" style="cursor:default"><span class="ls-ino">${k + 1}</span><span class="ls-itt">${esc(r.text)} · ${esc(r.student)}</span><span class="ls-itd">${r.year}</span></li>`).join("")}</ol>${W.sample ? `<p class="pf-empty" style="padding:14px 0 0">${esc(W.sample)}</p>` : ""}`; ["pf-more", "pf-actions", "pf-body"].forEach(id => { $(id).style.display = "none"; }); document.querySelector(".pf-tabs").style.display = "none"; if (pfView.hidden) openLayer(pfView, $("pf-back")); $("pf-scroll").scrollTop = 0; };   /* JG-PROD: owner 4 Oct R6 placeholder teachers (test phase, D19): the teacher card a real student's lesson opens (M:009:150) is the design's own person page: the design's illustration of the teacher (an initials badge for one it did not draw, never a photograph), name, "Teacher", subject, bio, years / lessons / results and the past students' results, in the roadmap language, with the file's sample note; no follow, message, report or posts (there is no teacher account) */


  /* ==========================================================
     V3: Reels tab and Events icon, safety (report, block, message
     requests, automatic filter), achievements, levels and leagues,
     notifications, and search.
     ========================================================== */
  const goCommunity = fn => {                                   // chats live in Community: go there first
    const tab = JIA_TAB(4);
    if (tab.getAttribute("aria-current") === "page") fn();
    else { tab.click(); setTimeout(fn, 420); }
  };
  const initialsAV = (name, bg) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${bg}"/><text x="32" y="40" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="#fff">${name.split(" ").map(w => w[0]).join("").slice(0, 2)}</text></svg>`);

  /* ---------- Reels tab, and Events behind the calendar icon ---------- */
  const rlGrid = $("cm-rl-grid");
  function renderReelGrid() {
    rlGrid.innerHTML = REELS.map((r, i) => BLOCKED.has(r.who) ? "" : `<button class="rg" type="button" data-i="${i}" style="--b1:${(r.b || ["#1a2a22", "#0e1612"])[0]};--b2:${(r.b || ["#1a2a22", "#0e1612"])[1]};--ink2:${r.ink || "#fff"}" aria-label="Reel by ${esc(nameOf(r.who))}: ${esc(r.cap)}">
        ${r.video ? `<video src="${r.video}" muted playsinline preload="metadata"></video>` : `${STK[r.obj] ? `<img src="${STK[r.obj]}" alt="">` : ""}<b>${esc(r.lines[0])}</b>`}
        <span class="rg-who"><img src="${r.who === "me" ? ((window.JG_ENGINE && JG_ME.photoUrl) || initialsAV(JG_ME.fullName /* JG-PROD: identity */, "#2b9067")) : AV[r.who] /* JG-PROD: owner 4 Oct P4g S4, his own photo once he has one */}" alt="">${esc(first(nameOf(r.who)))}</span>
        <span class="rg-v">▶ ${fmtN(r.views != null ? r.views : r.likes * 7 + 300)}</span></button>`).join("") || (window.JG_ENGINE ? `<p class="pf-empty">No reels yet.</p>` : "");   /* JG-PROD: owner 4 Oct R13, a real student's empty Reels grid says so, in the profile's own words and class */   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): the server's views, never likes × 7 + 300 */
  }
  rlGrid.addEventListener("click", e => { const b = e.target.closest(".rg"); if (b) openReels(+b.dataset.i); });
  $("cm-rl-new").addEventListener("click", () => $("rl-new").click());
  renderReelGrid();
  const evView = $("ev-view");
  $("cm-ev-btn").addEventListener("click", () => { renderEvents(); openLayer(evView, $("ev-back")); });
  $("ev-back").addEventListener("click", () => closeLayer(evView));

  /* ---------- safety: the automatic filter ---------- */
  const BAD = ["fuck", "shit", "bitch", "bastard", "asshole", "dickhead", "сука", "бля", "хуй", "пизд", "ебат", "мудак", "jalab", "qanjiq", "itvachcha", "sikaman"];
  function screen(text) {
    const lower = text.toLowerCase(), noJia = text.replace(/https?:\/\/jia\.app\/\S*/gi, "");
    const phone = /\+?\d[\d\s().-]{7,}\d/.test(noJia);
    const known = new Set(Object.values(PEOPLE).map(p => first(p.name).toLowerCase()));   // @mentions of people here are fine
    const handle = (noJia.match(/(^|\s)@([a-z0-9_]{4,})/gi) || []).some(h => !known.has(h.trim().slice(1).toLowerCase()));
    const link = handle || /(https?:\/\/|www\.|t\.me\/|\b[a-z0-9-]+\.(com|uz|ru|org|net|io|me|app|ly|gg)\b)/i.test(noJia);
    const bad = BAD.some(w => lower.includes(w));
    const clean = BAD.reduce((acc, w) => acc.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), m => m[0] + "•".repeat(m.length - 1)), text);
    return { phone, link, bad, clean, blocked: phone || link };
  }
  window.JIA_screen = screen;
  const SAFETY_NOTE = "For your safety, phone numbers and outside links can't be shared. Keep it on JIA.";
  function screenOrStop(text, where) {                       // for things an admin reviews: stop anything unsafe before it's sent
    const s = screen(text);
    if (s.blocked || s.bad) { (where === "reels" ? rlToast : toast)(s.blocked ? SAFETY_NOTE : "Please remove the swear words before sending."); return false; }
    return true;
  }

  /* ---------- safety: report and block ---------- */
  const rpSheet = $("rp-sheet"), REASONS = ["Spam or scam", "Bullying or harassment", "Inappropriate content", "Not educational", "Someone may be in danger", "Something else"];
  let rpItem = null;
  function openReport(item) {
    rpItem = item;
    const who = item.who, isMe = who === "me", name = who && !isMe ? (PEOPLE[who] ? PEOPLE[who].name : who) : "";
    $("rp-title").textContent = isMe ? "Your " + item.what : `Report ${item.what}`;
    $("rp-sub").textContent = item.label || name;
    $("rp-reasons").hidden = isMe; $("rp-done").hidden = true;
    $("rp-reasons").innerHTML = REASONS.map(r => `<button type="button" data-r="${r}">${r}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`).join("");
    const blk = $("rp-block");
    blk.hidden = !who || isMe;
    blk.textContent = BLOCKED.has(who) ? `Unblock ${name}` : `Block ${name}`;
    blk.classList.toggle("undo", BLOCKED.has(who));
    $("rp-del").hidden = !(isMe && item.onDelete); $("rp-del").textContent = `Delete ${item.what}`;
    openLayer(rpSheet, $("rp-reasons").querySelector("button") || blk);
  }
  $("rp-reasons").addEventListener("click", e => {
    const b = e.target.closest("[data-r]"); if (!b) return;
    $("rp-reasons").hidden = true; $("rp-done").hidden = false; if (window.JG_MOD) window.JG_MOD.report(rpItem, b.dataset.r);   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast": honest before real families), a real student's report is stored on the server (POST /api/v1/reports, public/runtime/jg-moderation.js) */
    $("rp-done-t").textContent = b.dataset.r === "Someone may be in danger"
      ? (window.JG_MOD && window.JG_MOD.said ? window.JG_MOD.said.danger : "Thank you. A JIA moderator will look at this first. If someone is in immediate danger, tell a teacher or call 112 now.")   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast": honest before real families): until moderators work the queue (MODERATION), the report is saved for the JIA team, no moderator promised */
      : (window.JG_MOD && window.JG_MOD.said ? window.JG_MOD.said.other : "Thanks for telling us. A JIA moderator will review it within 24 hours. The person won't know who reported them.");   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast": honest before real families): no "24 hours" until moderators work the queue (MODERATION) */
  });
  $("rp-block").addEventListener("click", () => { const w = rpItem.who; closeLayer(rpSheet); BLOCKED.has(w) ? unblock(w) : block(w); });
  $("rp-del").addEventListener("click", () => { closeLayer(rpSheet); if (rpItem.onDelete) rpItem.onDelete(); });
  function refreshAll() {
    renderPosts(); renderReelGrid(); renderConvs(); rerender(feed, CHATS.global); paintRings();
    if (!pfView.hidden && pfWho) paintProfile();
    if (openId && CHATS[openId]) rerender(thFeed, CHATS[openId]);
  }
  function block(who) {
    BLOCKED.add(who); FOLLOWING.delete(who);
    if (openId === `dm:${who}`) closeThread(true);
    refreshAll(); toast(`${PEOPLE[who] ? PEOPLE[who].name : "They"} can't message you or see your posts now`);
  }
  function unblock(who) { BLOCKED.delete(who); refreshAll(); toast(`${PEOPLE[who] ? PEOPLE[who].name : "They"} is unblocked`); }
  const blSheet = $("bl-sheet");
  function paintBlocked() {
    $("bl-list").innerHTML = BLOCKED.size ? [...BLOCKED].map(w => `<li><img src="${AV[w]}" alt=""><b>${esc(PEOPLE[w].name)}</b><button type="button" data-unblock="${w}">Unblock</button></li>`).join("") : `<li class="pf-empty">You haven't blocked anyone.</li>`;
  }
  window.JIA_openBlocked = () => { paintBlocked(); openLayer(blSheet); };
  $("bl-list").addEventListener("click", e => { const b = e.target.closest("[data-unblock]"); if (b) { unblock(b.dataset.unblock); paintBlocked(); } });
  $("pf-more").addEventListener("click", () => { if (pfWho && pfWho !== "me") openReport({ what: "profile", who: pfWho, label: PEOPLE[pfWho].name }); });
  $("st-rep").addEventListener("click", () => { const w = queue[qi]; closeStories(); if (w !== "me") openReport({ what: "story", who: w, label: `${PEOPLE[w].name}'s story` }); });

  /* ---------- safety: message requests from people you don't know ---------- */
  PEOPLE.alex = { name: "Alex M.", kind: "guest", tag: "Not verified" };
  KIND.guest = "Not verified";
  AV.alex = initialsAV("Alex M.", "#8a9a92");
  const REQUESTS = window.JG_ENGINE ? [] : [{ who: "alex", time: "11:20", text: "Hi! I help students get into top universities. Message me on Telegram @alex_admissions and send your phone number." }];   /* JG-PROD: owner 4 Oct R11, no seeded message request to a real student */
  const rqSheet = $("rq-sheet");
  function paintRequests() {
    const n = REQUESTS.length, row = $("cm-reqs");
    row.hidden = !n; row.querySelector("em").textContent = n;
    $("rq-list").innerHTML = REQUESTS.map((r, i) => {
      const sc = screen(r.text);
      return `<li class="rq"><div class="rq-top"><img src="${AV[r.who]}" alt=""><div><b>${esc(PEOPLE[r.who].name)}</b><small>${KIND[PEOPLE[r.who].kind]} · you don't follow them</small></div><span>${r.time}</span></div>
        <p class="rq-text">${esc(sc.clean)}</p>
        ${sc.blocked ? `<p class="rq-flag">⚠ Contains contact details. JIA hid this from your inbox.</p>` : ""}
        <div class="rq-btns"><button type="button" data-rq="accept" data-i="${i}">Accept</button><button type="button" data-rq="delete" data-i="${i}">Delete</button><button type="button" class="danger" data-rq="block" data-i="${i}">Block and report</button></div></li>`;
    }).join("") || `<li class="pf-empty">No message requests.</li>`;
  }
  $("cm-reqs").addEventListener("click", () => { paintRequests(); openLayer(rqSheet); });
  $("rq-list").addEventListener("click", e => {
    const b = e.target.closest("[data-rq]"); if (!b) return;
    const r = REQUESTS.splice(+b.dataset.i, 1)[0];
    if (b.dataset.rq === "accept") { dm(r.who, r.time, 0, [M(r.who, screen(r.text).clean, r.time)]); renderConvs(); closeLayer(rqSheet); openThread(r.who); }
    else if (b.dataset.rq === "block") { BLOCKED.add(r.who); toast("Blocked and reported. Thank you for keeping JIA safe."); }
    paintRequests(); if (!REQUESTS.length) closeLayer(rqSheet);
  });
  paintRequests();

  /* ---------- achievements, collected like Telegram gifts ---------- */
  const RARE = { Common: ["#e5f5ec", "#bfe6cf", "#216940"], Rare: ["#e0ecfa", "#b9d3f4", "#214269"], Epic: ["#ece5fb", "#cfc2f3", "#342169"], Legendary: ["#fbeedf", "#f1cf98", "#694721"] };
  const ACH = [
    { id: "first", name: "First steps", obj: "backpack", rare: "Common", no: 4812, got: "Sep 1", desc: "Joined JIA and set MIT as your goal." },
    { id: "iq", name: "IQ battle winner", obj: "trophy", rare: "Rare", no: 1290, got: "Sep 14", desc: "Won your first IQ battle." },
    { id: "streak7", name: "7-day streak", obj: "brain", rare: "Rare", no: 2204, got: "Sep 8", desc: "Studied seven days in a row." },
    { id: "sat", name: "SAT 1500+", obj: "sat", rare: "Epic", no: 311, got: "Aug 30", desc: "Scored 1500 or more on the SAT." },
    { id: "ielts", name: "IELTS 7.5", obj: "ielts", rare: "Epic", no: 522, got: "Jul 19", desc: "Reached band 7.5 in IELTS Academic." },
    { id: "post", name: "First post", obj: "books", rare: "Common", need: "Get a post approved" },
    { id: "reel", name: "First reel", obj: "laptop", rare: "Rare", need: "Get a reel approved" },
    { id: "streak30", name: "30-day streak", obj: "summit", rare: "Epic", prog: [12, 30], need: "Study 30 days in a row" },
    { id: "volunteer", name: "Volunteer", obj: "globe", rare: "Rare", prog: [12, 40], need: "40 volunteering hours" },
    { id: "climber", name: "League climber", obj: "atom", rare: "Epic", need: "Move up a league" },
    { id: "mit", name: "MIT ready", obj: "microscope", rare: "Legendary", prog: [50, 100], need: "Reach 100% on the roadmap" },
  ]; if (window.JG_ENGINE) { const u = ((window.JG_ENGINE.cache.goal || {}).unis || [])[0]; for (let i = ACH.length - 1; i >= 0; i--) { const a = ACH[i]; if (["first", "iq", "sat", "ielts"].includes(a.id) || (a.id === "mit" && !u)) { ACH.splice(i, 1); continue; } delete a.got; delete a.no; if (a.prog) a.prog = [0, a.prog[1]]; if (a.id === "streak7") a.need = "Study 7 days in a row"; if (a.id === "mit") a.name = `${u.short} ready`; } }   /* JG-PROD: owner 4 Oct R12, a real student's profile claims nothing they have not earned: not the design's SAT 1500+, IELTS 7.5, chess win or "Joined JIA and set MIT as your goal", no invented progress; "MIT ready" names their own first university */
  const THEIRS = { aziza: ["first", "sat", "streak7", "post"], dilnoza: ["first", "sat", "streak7", "iq", "post"], nilufar: ["first", "streak7", "iq"], sardor: ["first", "ielts", "streak7"],
                   asadbek: ["first", "sat", "iq"], timur: ["first", "streak7", "post"], madina: ["first", "post"], kamila: ["first", "ielts", "post"] };
  const hasAch = (who, id) => who === "me" ? !!ACH.find(a => a.id === id && a.got) : (THEIRS[who] || ["first"]).includes(id);
  const achCard = (a, who, big) => {
    const [g1, g2, ink] = RARE[a.rare], owned = hasAch(who, a.id);
    return `<button class="ach${owned ? "" : " locked"}${big ? " big" : ""}" type="button" data-ach="${a.id}" data-who="${who}" style="--g1:${g1};--g2:${g2};--ink2:${ink}" aria-label="${a.name}, ${a.rare}${owned ? "" : ", locked"}">
        <span class="ach-shine" aria-hidden="true"></span>${STK[a.obj] ? `<img src="${STK[a.obj]}" alt="">` : ""}
        <b>${a.name}</b><small>${owned ? (who === "me" && a.no ? `#${a.no.toLocaleString("en-US")}` : a.rare) : a.prog ? `${a.prog[0]} / ${a.prog[1]}` : "Locked"}</small></button>`; /* JG-PROD: owner 4 Oct R12 + m1 league (20 Oct 2026), no invented serial or "of 5,000 students" for a real student: the server's serial when it issued the award (public/runtime/jg-league.js) */
  };
  function achStrip(who) {
    const mine = ACH.filter(a => hasAch(who, a.id)), rest = who === "me" ? ACH.filter(a => !hasAch(who, a.id)) : [];
    return `${who === "me" && window.JIA_medalStrip ? window.JIA_medalStrip() : ""}<div class="pf-ach-h"><b>Achievements</b><span>${mine.length} of ${ACH.length}</span></div><div class="pf-ach">${[...mine, ...rest].map(a => achCard(a, who)).join("")}</div>`;
  }
  const achSheet = $("ach-sheet");
  function openAch(id, who) {
    const a = ACH.find(x => x.id === id), owned = hasAch(who, id);
    $("ach-big").innerHTML = achCard(a, who, true);
    $("ach-name").textContent = a.name;
    $("ach-meta").textContent = owned ? `${a.rare}${who === "me" ? (a.no ? ` · #${a.no.toLocaleString("en-US")}${window.JG_ENGINE ? "" : " of 5,000"}` : "") + ` · earned ${a.got}` : ""}` : `${a.rare} · locked`; /* JG-PROD: owner 4 Oct R12 + m1 league (20 Oct 2026), no invented serial or "of 5,000 students" for a real student: the server's serial when it issued the award (public/runtime/jg-league.js) */
    $("ach-desc").textContent = owned ? (a.desc || a.need) : `How to get it: ${a.need}.`;
    $("ach-prog").hidden = !(a.prog && !owned);
    if (a.prog && !owned) $("ach-prog").querySelector("i").style.width = `${Math.round(a.prog[0] / a.prog[1] * 100)}%`;
    window.__achOpen = { id, who }; const shareBtn = $("ach-share"); if (shareBtn) shareBtn.hidden = !(owned && who === "me");
    openLayer(achSheet);
  }
  const bigCard = $("ach-big");
  bigCard.addEventListener("pointermove", e => {                // tilt the card toward the finger, like a gift
    if (reduce) return;
    const c = bigCard.firstElementChild; if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(700px) rotateY(${(x * 18).toFixed(1)}deg) rotateX(${(-y * 18).toFixed(1)}deg)`;
  });
  bigCard.addEventListener("pointerleave", () => { const c = bigCard.firstElementChild; if (c) c.style.transform = ""; });
  document.addEventListener("click", e => { const a = e.target.closest(".pf-ach .ach"); if (a) openAch(a.dataset.ach, a.dataset.who); });
  function unlock(id) {
    const a = ACH.find(x => x.id === id); if (!a || a.got) return;
    a.got = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }); a.no = window.JG_ENGINE ? 0 : 900 + Math.floor(Math.random() * 3000); /* JG-PROD: owner 4 Oct R12 + m1 league (20 Oct 2026), no invented serial or "of 5,000 students" for a real student: the server's serial when it issued the award (public/runtime/jg-league.js) */
    notify({ icon: STK[a.obj], text: `<b>Achievement unlocked:</b> ${a.name}`, go: () => openAch(id, "me") });
    if (window.JIA_celebrate) window.JIA_celebrate({ id, img: STK[a.obj] });
  }
  window.JIA_ach = { list: ACH, img: k => STK[k], unlock, open: openAch };

  /* ---------- levels, leagues and notifications: on desktop the League is a drawer and the bell has its own
     popover, so this part keeps only each league's group chat and hands the rest over ---------- */
  const ME = { level: 7, week: 712, streak: 12, get league() { return window.JIA.league.i; } }; if (window.JG_ENGINE) { Object.assign(ME, { week: window.JG_ENGINE.cache.league.week_xp, streak: window.JG_ENGINE.cache.streak.current }); Object.defineProperty(ME, "level", { get: () => window.JIA_league.ME.level }); }   /* JG-PROD: S22; owner 4 Oct R13, the profile tag's level is the League's, from the student's own XP */
  const leagueName = i => window.JIA.LEAGUES[i][0];
  const OTHERS = ["Aziz T.", "Malika S.", "Rustam K.", "Zarina O.", "Bobur A.", "Shahzoda N.", "Otabek R."];
  OTHERS.forEach((n, k) => { const id = `lg${k}`; PEOPLE[id] = { name: n, kind: "student", tag: "Student" }; AV[id] = initialsAV(n, ["#6fb0a5", "#9c90cc", "#d59199", "#7b9fcf", "#d8a261", "#78b692", "#8a9a92"][k]); });
  const COHORT = ["dilnoza", "asadbek", "sardor", "lg0", "nilufar", "lg1", "timur", "lg2", "madina", "lg3", "laylo", "lg4", "jasur", "lg5", "lg6"];
  function leagueChat(i, joined) {                           // the league's own group chat
    const id = `lg:${i}`;
    if (!CHATS[id]) {
      const members = COHORT.slice(0, 6);
      CHATS[id] = { id, kind: "group", league: i, name: `${leagueName(i)} League`, members, time: now(), unread: joined ? 1 : 0,
        msgs: [M(null, joined ? `You joined the ${leagueName(i)} League chat 🎉` : `${leagueName(i)} League: this week's group`, "", { system: true }),
               ...(window.JG_ENGINE ? [] : [M("dilnoza", i === ME.league && !joined ? "Who's aiming for the top 5 this week? 💪" : `Welcome to ${leagueName(i)}, ${JG_ME.firstName}!`, "10:40")])] }; /* JG-PROD: identity */ /* JG-PROD: owner 20 Oct 2026 (M1, "untrue to a child"), no invented "Dilnoza" writes in a real student's league chat: R11's clean-up drops the dm: and g: chats, never this lg: one; it opens with its own line only */
    }
    return CHATS[id];
  }
  if (!window.JG_LEAGUE) leagueChat(ME.league); /* JG-PROD: owner 4 Oct R11 + m1 league (20 Oct 2026), no league chat with invented members is made at load for a real student; hers opens on demand (the chat contract) */
  const openLeague = () => { if (window.JIA.openLeague) window.JIA.openLeague(); };
  window.JIA_openLeague = openLeague;
  window.JIA.openLeagueChat = i => { const c = leagueChat(i); goCommunity(() => { select("dm"); openThread(c.id); }); };
  window.JIA.leagueMoved = (from, to) => {                   // you leave the old league's chat and join the new one
    const old = CHATS[`lg:${from}`]; if (old) delete CHATS[old.id];
    leagueChat(to, true); renderConvs(); unlock("climber");
  };
  const notify = x => { if (window.JIA.notify) window.JIA.notify(x); };
  window.JIA_notify = notify;

  /* ---------- search everything, like Telegram ---------- */
  const srView = $("sr-view"), srIn = $("sr-in"), srOut = $("sr-out");
  let srKind = "all";
  const RECENT = ["SAT", "Aziza", "scholarship"];
  const hl = (t, q) => { const i = t.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<mark>${esc(t.slice(i, i + q.length))}</mark>${esc(t.slice(i + q.length))}`; };
  function srResults(q) {
    const has = t => t && t.toLowerCase().includes(q.toLowerCase()), D = window.JIA_DATA || {};
    const out = { people: [], chats: [], lessons: [], opps: [], posts: [], reels: [] };
    ORDER.forEach(id => { const p = PEOPLE[id]; if (!BLOCKED.has(id) && (has(p.name) || has(p.tag) || has(KIND[p.kind]))) out.people.push({ t: hl(p.name, q), s: `${KIND[p.kind]}, ${esc(p.tag)}`, img: AV[id], go: () => openProfile(id) }); });
    Object.values(CHATS).forEach(c => {
      if (c.kind === "global") return;
      const title = c.kind === "group" ? c.name : PEOPLE[c.with] ? PEOPLE[c.with].name : "";
      const hit = [...c.msgs].reverse().find(m => !m.system && !m.deleted && has(m.text));
      if (has(title) || hit) out.chats.push({ t: hl(title, q), s: hit ? hl(hit.text, q) : "Chat", img: c.kind === "group" ? AV[c.members[0]] : AV[c.with], go: () => { closeLayer(srView); JIA_TAB(4).click(); setTimeout(() => { select("dm"); openThread(c.id); }, 350); } });
    });
    (D.subjects || []).forEach((s, si) => s.lessons.forEach((l, li) => { if (has(l.t) || has(s.name) || has(l.about)) out.lessons.push({ t: hl(l.t, q), s: `${esc(s.name)}, lesson ${li + 1}, ${l.m} min`, img: D.img && D.img[s.img], go: () => { closeLayer(srView); if (window.JIA_openLesson) window.JIA_openLesson(si, li); } }); }));
    (D.opps || []).forEach((o, oi) => { if (has(o.title) || has(o.org) || has(o.about) || has((D.cats || {})[o.cat] && D.cats[o.cat].name)) out.opps.push({ t: hl(o.title, q), s: `${esc(o.org)}, ${esc(o.when)}`, img: D.img && D.img[o.img], go: () => { closeLayer(srView); if (window.JIA_openOpp) window.JIA_openOpp(oi); } }); });
    POSTS.forEach((p, i) => { if (!BLOCKED.has(p.who) && p.status !== "wait" && has(p.text)) out.posts.push({ t: esc(nameOf(p.who)), s: hl(p.text.slice(0, 90), q), img: p.who === "me" ? ((window.JG_ENGINE && JG_ME.photoUrl) || initialsAV(JG_ME.fullName, "#2b9067")) /* JG-PROD: owner 4 Oct P4g S4, his own photo once he has one */ : AV[p.who], go: () => { closeLayer(srView); JIA_TAB(4).click(); setTimeout(() => { select("po"); const el = feedEl.querySelector(`[data-i="${i}"]`); if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); } }, 380); } }); }); /* JG-PROD: identity */
    REELS.forEach((r, i) => { if (!BLOCKED.has(r.who) && (has(r.cap) || has(nameOf(r.who)))) out.reels.push({ t: esc(nameOf(r.who)), s: hl(r.cap.slice(0, 90), q), img: STK[r.obj] || AV[r.who], go: () => { closeLayer(srView); openReels(i); } }); });
    return out;
  }
  const SR_NAMES = { people: "People", chats: "Chats", lessons: "Lessons", opps: "Opportunities", posts: "Posts", reels: "Reels" };
  let srGo = [];
  function paintSearch() {
    const q = srIn.value.trim();
    srGo = [];
    if (!q) {
      srOut.innerHTML = window.JG_ENGINE ? "" /* JG-PROD: owner 4 Oct R13, a real student's empty search suggests nothing invented: no "Recent" searches they never made (the design's "Aziza"), no "People you might know" */ : `<p class="sr-h">Recent</p><div class="sr-recent">${RECENT.map(r => `<button type="button" data-q="${esc(r)}">${esc(r)}</button>`).join("")}</div>
        <p class="sr-h">People you might know</p><div class="sr-people">${ORDER.slice(0, 8).filter(id => !BLOCKED.has(id)).map(id => `<button type="button" data-p="${id}"><img src="${AV[id]}" alt=""><small>${esc(first(PEOPLE[id].name))}</small></button>`).join("")}</div>`;
      return;
    }
    const res = srResults(q), kinds = srKind === "all" ? Object.keys(SR_NAMES) : [srKind];
    const html = kinds.map(k => {
      const list = srKind === "all" ? res[k].slice(0, 3) : res[k];
      if (!list.length) return "";
      return `<p class="sr-h">${SR_NAMES[k]}${srKind === "all" && res[k].length > 3 ? `<button type="button" data-kind="${k}">Show all ${res[k].length}</button>` : ""}</p>` +
        list.map(r => { srGo.push(r.go); return `<button class="sr-row" type="button" data-go="${srGo.length - 1}">${r.img ? `<img src="${r.img}" alt="">` : "<i></i>"}<span><b>${r.t}</b><small>${r.s}</small></span></button>`; }).join("");
    }).join("");
    srOut.innerHTML = html || `<p class="pf-empty">Nothing found for "${esc(q)}".</p>`;
  }
  function openSearch() { srIn.value = ""; srKind = "all"; document.querySelectorAll(".sr-chips button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.k === "all"))); paintSearch(); openLayer(srView, srIn); }
  window.JIA_openSearch = openSearch;
  $("cm-search-btn").addEventListener("click", openSearch);
  srIn.addEventListener("input", paintSearch);
  $("sr-cancel").addEventListener("click", () => closeLayer(srView));
  document.querySelector(".sr-chips").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; srKind = b.dataset.k; document.querySelectorAll(".sr-chips button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); paintSearch(); });
  srOut.addEventListener("click", e => {
    const g = e.target.closest("[data-go]"), q = e.target.closest("[data-q]"), p = e.target.closest("[data-p]"), k = e.target.closest("[data-kind]");
    if (g) { const v = srIn.value.trim(); if (v && !RECENT.includes(v)) { RECENT.unshift(v); RECENT.length = Math.min(RECENT.length, 6); } srGo[+g.dataset.go](); }
    else if (q) { srIn.value = q.dataset.q; paintSearch(); }
    else if (p) openProfile(p.dataset.p);
    else if (k) { srKind = k.dataset.kind; document.querySelectorAll(".sr-chips button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.k === srKind))); paintSearch(); }
  });


  /* ==========================================================
     V4 CHAT EXTRAS: stickers, polls, voice messages, pinned
     messages and group admins.
     ========================================================== */
  window.JIA_PEOPLE = PEOPLE; window.JIA_AV = AV; window.JIA_cm = { POSTS, REELS, STORIES, MY, SEEN, FOLLOWERS, FOLLOWING, BIO, KIND, BLOCKED, renderPosts, renderReelGrid, paintRings, paintProfile, openProfile, openStories, openReels, closeReels, reelHTML, rlFeed, rlView, pfView, spot, card, meBtn, toast, rlToast, shToast, notify, select, goCommunity, initialsAV, hasStory, fmtN, closeLayer, pf: () => pfWho };   /* JG-PROD: owner 20 Oct 2026 (M1, "do them fast"): the design's community objects for public/runtime/jg-community.js (COMMUNITY on), which fills them from the server and sends back what she does with them; off, nothing reads it */
  // stickers: Jamol and Jamola, then the app's 3D objects
  const STICKERS = (() => {
    const out = [];
    // Jamol and Jamola from the character kit: their poses, then their moods
    const MKS = window.JIA_MASCOT || {}, pic = (src, cls) => `<img${cls ? ` class="${cls}"` : ""} src="${src}" alt="" draggable="false">`;
    const POSE = [["wave", "waving"], ["cele", "celebrating"], ["point", "pointing"], ["read", "reading"], ["think", "thinking"]];
    const MOODS = [["happy", "happy"], ["delighted", "laughing"], ["angry", "angry"], ["crying", "crying"], ["shocked", "shocked"], ["sleepy", "sleepy"], ["pleading", "pleading"]];
    [["jamol", "Jamol", "jm"], ["jamola", "Jamola", "jl"]].forEach(([w, N, p]) => {
      const k = MKS[w]; if (!k) return;
      POSE.forEach(([key, lb]) => { if (k[key]) out.push({ id: `${p}:${key}`, html: pic(k[key]), label: `${N} ${lb}` }); });
      MOODS.forEach(([key, lb]) => { if (k.face && k.face[key]) out.push({ id: `${p}:f-${key}`, html: pic(k.face[key], "stk-face"), label: `${N} ${lb}` }); });
    });
    ["trophy", "books", "brain", "atom", "sat", "ielts", "globe", "summit", "robot", "laptop", "backpack", "microscope"].forEach(k => { if (STK[k]) out.push({ id: `3d:${k}`, html: `<img src="${STK[k]}" alt="">`, label: k }); });
    return out;
  })();
  const STK_OLD = { "jl:win": "jl:cele", "jl:draw": "jl:think", "jl:lose": "jl:f-sad" };        // ids older messages used
  const stickerHTML = id => { const s = STICKERS.find(x => x.id === (STK_OLD[id] || id)); return s ? s.html : ""; }; window.JIA_STICKERS = STICKERS;
  const vcBars = n => Array.from({ length: 26 }, (_, k) => 5 + Math.round(Math.abs(Math.sin(k * 1.7 + n) * 13 + Math.sin(k * .6) * 5)));
  const fmtDur = s => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
  function pollHTML(poll, key) {
    const total = poll.opts.reduce((a, o) => a + o.v, 0);
    return `<div class="poll" data-poll="${key}"><b class="poll-q">${esc(poll.q)}</b><small>${poll.anon ? "Anonymous poll" : "Poll"} · ${total} vote${total === 1 ? "" : "s"}</small>
      ${poll.opts.map((o, k) => {
        const pct = total ? Math.round(o.v / total * 100) : 0;
        return poll.mine != null
          ? `<div class="poll-r${poll.mine === k ? " me" : ""}"><span class="poll-bar" style="width:${pct}%"></span><span class="poll-t">${poll.mine === k ? "✓ " : ""}${esc(o.t)}</span><b>${pct}%</b></div>`
          : `<button class="poll-o" type="button" data-vote="${k}">${esc(o.t)}</button>`;
      }).join("")}</div>`;
  }
  const voiceHTML = m => `<div class="vc" data-vc="${m.id}"><button class="vc-play" type="button" aria-label="Play voice message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg></button><span class="vc-bars" aria-hidden="true">${m.voice.bars.map(h => `<i style="height:${h}px"></i>`).join("")}</span><span class="vc-t">${fmtDur(m.voice.dur)}</span></div>`;
  function richHTML(m, showName, fresh) {
    const mine = m.who === "me", p = PEOPLE[m.who];
    const inner = m.deleted ? `<i class="cm-del">This message was deleted</i>` : m.sticker ? `<span class="cm-stk">${stickerHTML(m.sticker)}</span>` : m.voice ? voiceHTML(m) : pollHTML(m.poll, `m${m.id}`);
    const cls = m.sticker && !m.deleted ? "cm-bub bare" : "cm-bub";
    const meta = `<span class="cm-time">${m.time}</span>`, more = m.deleted ? "" : `<button class="cm-more" type="button" aria-label="Message options">⋯</button>`;
    if (mine) return `<div class="cm-msg me${fresh && !reduce ? " new" : ""}" data-mid="${m.id}">${more}<div class="${cls}" tabindex="0">${inner}${rxHTML(m)}${meta}</div></div>`;
    return `<div class="cm-msg k-${p.kind}${fresh && !reduce ? " new" : ""}" data-mid="${m.id}">
        <button class="cm-avbtn" type="button" data-who="${m.who}" aria-label="${esc(p.name)}, open profile"><img class="cm-av" src="${AV[m.who]}" alt=""></button>
        <div class="${cls}" tabindex="0">${showName ? `<span class="cm-who">${esc(p.name)}<span class="cm-role">${KIND[p.kind] || ""}</span>${window.JG_flex ? window.JG_flex(m.who) : ""}</span>` : ""}${inner}${rxHTML(m)}${meta}</div>${more}</div>`;
  }
  const richLabel = m => m.sticker ? "Sticker" : m.voice ? "Voice message" : m.poll ? `Poll: ${m.poll.q}` : m.text;

  // sample content: a pinned plan and a poll in SAT Squad, a voice note in the speaking club, admins everywhere
  CHATS["g:sat"].admins = ["aziza"]; CHATS["g:ielts"].admins = ["kamila"]; CHATS["g:robo"].admins = ["javlon"];
  CHATS["g:sat"].pinned = CHATS["g:sat"].msgs[0];
  CHATS["g:sat"].msgs.push(M("aziza", "", "09:58", { poll: { q: "Best time for Saturday's mock test?", anon: true, opts: [{ t: "10:00", v: 5 }, { t: "14:00", v: 2 }, { t: "16:00", v: 1 }] } }));
  CHATS["g:sat"].msgs.push(M("dilnoza", "", "09:59", { sticker: "jl:win" }));
  CHATS["g:ielts"].msgs.push(M("kamila", "", "18:30", { voice: { tts: "Hi everyone! This Sunday we'll practise describing a place you love. Prepare two minutes of notes, and bring one photo.", dur: 9, bars: vcBars(3) } }));
  POSTS.splice(1, 0, { who: "kamila", ago: "6h", likes: 58, text: "Quick question for my IELTS students:", cmts: [], poll: { q: "Which part of IELTS is hardest for you?", anon: true, opts: [{ t: "Listening", v: 12 }, { t: "Reading", v: 19 }, { t: "Writing", v: 41 }, { t: "Speaking", v: 33 }] } });
  if (window.JG_ENGINE) POSTS.length = 0; if (window.JG_ENGINE) Object.keys(CHATS).forEach(k => { if (/^(dm|g):/.test(k)) delete CHATS[k]; }); renderPosts(); renderConvs();   /* JG-PROD: owner 4 Oct R11, no seeded DM or group thread messages a real student (Aziza's "I checked your mock test", the SAT Squad, Javlon's quiz), dropped after the sample content above is attached; the League's own chat stays; owner 4 Oct R13, nor the design's posts by invented people (Kamila's poll, attached just above, included), and the Messages feed is emptied where it is seeded */

  // where a sticker, poll or voice note goes
  const CTX = {
    global: { chat: () => CHATS.global, feed, wrap: feedWrap },
    thread: { chat: () => CHATS[openId], feed: thFeed, wrap: thWrap },
  };
  let attCtx = "global";
  function sendRich(ctxName, extra) {
    const x = CTX[ctxName], c = x.chat(); if (!c) return;
    const m = M("me", "", now(), extra);
    c.msgs.push(m); c.time = now();
    x.feed.querySelectorAll("p.cm-day:only-child").forEach(el => el.remove());
    x.feed.insertAdjacentHTML("beforeend", msgHTML(m, c.kind !== "dm", true)); toBottom(x.wrap);
    if (ctxName === "thread") renderConvs();
    const who = c.kind === "global" ? CHAT_REPLIES[chatTurn++ % CHAT_REPLIES.length][0] : c.kind === "group" ? c.members[Math.floor(Math.random() * c.members.length)] : c.with;
    if (window.JG_ENGINE || !PEOPLE[who] || BLOCKED.has(who)) return;   /* JG-PROD: owner 4 Oct R11, no sticker or "Voted! 🙌" reply from an invented person */
    const back = extra.poll ? "Voted! 🙌" : extra.voice ? "Got your voice message 👍" : null;
    setTimeout(() => {
      if (ctxName === "thread" && openId !== c.id) return;
      const r = back ? M(who, back, now()) : M(who, "", now(), { sticker: ["jm:cele", "jl:win", "3d:trophy"][Math.floor(Math.random() * 3)] });
      c.msgs.push(r); x.feed.insertAdjacentHTML("beforeend", msgHTML(r, c.kind !== "dm", true)); toBottom(x.wrap);
      if (extra.poll) { extra.poll.opts[Math.floor(Math.random() * extra.poll.opts.length)].v++; rerender(x.feed, c); }
    }, 1500);
  }

  // the + button: stickers or a poll
  const attSheet = $("att-sheet"), stkSheet = $("stk-sheet"), pollSheet = $("poll-sheet");
  document.querySelectorAll("[data-att]").forEach(b => b.addEventListener("click", () => { attCtx = b.dataset.att; openLayer(attSheet); }));
  $("att-stk").addEventListener("click", () => { closeLayer(attSheet); openLayer(stkSheet); });
  $("att-poll").addEventListener("click", () => { closeLayer(attSheet); openPollSheet("chat"); });
  $("stk-grid").innerHTML = STICKERS.map(s => `<button type="button" data-stk="${s.id}" aria-label="${esc(s.label)} sticker">${s.html}</button>`).join("");
  $("stk-grid").addEventListener("click", e => { const b = e.target.closest("[data-stk]"); if (!b) return; closeLayer(stkSheet); sendRich(attCtx, { sticker: b.dataset.stk }); });

  // polls: in chats and in posts
  let pollMode = "chat", poPoll = null;
  function openPollSheet(mode) {
    pollMode = mode;
    $("poll-q").value = ""; $("poll-opts").innerHTML = ""; addOpt(); addOpt(); $("poll-anon").setAttribute("aria-checked", "true"); pollReady();
    openLayer(pollSheet, $("poll-q"));
  }
  function addOpt() {
    const n = $("poll-opts").children.length; if (n >= 4) return;
    $("poll-opts").insertAdjacentHTML("beforeend", `<input type="text" maxlength="60" placeholder="Option ${n + 1}" aria-label="Option ${n + 1}">`);
    $("poll-add").hidden = n + 1 >= 4;
  }
  const pollOpts = () => [...$("poll-opts").querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean);
  function pollReady() { $("poll-go").disabled = !$("poll-q").value.trim() || pollOpts().length < 2; }
  $("poll-add").addEventListener("click", () => { addOpt(); pollReady(); $("poll-opts").lastElementChild.focus(); });
  pollSheet.addEventListener("input", pollReady);
  $("poll-anon").addEventListener("click", e => { const t = e.currentTarget; t.setAttribute("aria-checked", String(t.getAttribute("aria-checked") !== "true")); });
  $("poll-go").addEventListener("click", () => {
    const q = $("poll-q").value.trim(), opts = pollOpts();
    const sc = screen(`${q} ${opts.join(" ")}`); if (sc.blocked || sc.bad) { toast(sc.blocked ? SAFETY_NOTE : "Please remove the swear words."); return; }
    const poll = { q, anon: $("poll-anon").getAttribute("aria-checked") === "true", opts: opts.map(t => ({ t, v: 0 })) };
    closeLayer(pollSheet);
    if (pollMode === "post") { poPoll = poll; $("po-poll-prev").hidden = false; $("po-poll-t").textContent = `Poll: ${q}`; }
    else sendRich(attCtx, { poll });
  });
  $("po-poll-btn").addEventListener("click", () => openPollSheet("post"));
  $("po-poll-x").addEventListener("click", () => { poPoll = null; $("po-poll-prev").hidden = true; });
  document.addEventListener("click", e => {                     // voting, anywhere a poll shows
    const v = e.target.closest("[data-vote]"); if (!v) return;
    const key = v.closest("[data-poll]").dataset.poll, k = +v.dataset.vote;
    if (key[0] === "p") {
      const p = POSTS[+key.slice(1)]; if (!p || !p.poll || p.poll.mine != null) return;
      p.poll.mine = k; p.poll.opts[k].v++; renderPosts(); if (!pfView.hidden) paintProfile();
    } else {
      const id = +key.slice(1);
      [CHATS.global, openId && CHATS[openId]].filter(Boolean).forEach(c => {
        const m = findMsg(c, id); if (!m || m.poll.mine != null) return;
        m.poll.mine = k; m.poll.opts[k].v++; rerender(c === CHATS.global ? feed : thFeed, c);
      });
    }
  });

  // voice messages: record with the microphone, play with a moving waveform
  let rec = null, recStream = null, recChunks = [], recT0 = 0, recTimer = 0, recCtx = null;
  const compOf = ctxName => document.querySelector(`[data-mic="${ctxName}"]`).closest(".cm-compose");
  async function startRec(ctxName) {
    if (rec) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { toast("Voice messages aren't supported in this browser"); return; }
    try { recStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { toast("Allow the microphone to record a voice message"); return; }
    recCtx = ctxName; recChunks = [];
    rec = new MediaRecorder(recStream);
    rec.ondataavailable = e => { if (e.data && e.data.size) recChunks.push(e.data); };
    rec.start(200); recT0 = Date.now();
    const comp = compOf(ctxName), t = comp.querySelector(".rec-t");
    comp.classList.add("rec"); t.textContent = "0:00";
    recTimer = setInterval(() => { const s = (Date.now() - recT0) / 1000; t.textContent = fmtDur(Math.floor(s)); if (s >= 60) stopRec(true); }, 250);
  }
  function stopRec(send) {
    if (!rec) return;
    const ctxName = recCtx, dur = Math.max(1, Math.round((Date.now() - recT0) / 1000)), r = rec;
    clearInterval(recTimer); compOf(ctxName).classList.remove("rec");
    r.onstop = () => {
      recStream.getTracks().forEach(t => t.stop()); recStream = null;
      if (send && recChunks.length) {
        const fr = new FileReader();
        fr.onload = () => sendRich(ctxName, { voice: { src: fr.result, dur, bars: vcBars(dur) } });
        fr.readAsDataURL(new Blob(recChunks, { type: r.mimeType || "audio/webm" }));
      }
    };
    rec = null; r.stop();
  }
  document.querySelectorAll("[data-mic]").forEach(b => b.addEventListener("click", () => rec ? stopRec(true) : startRec(b.dataset.mic)));
  document.querySelectorAll(".rec-x").forEach(b => b.addEventListener("click", () => stopRec(false)));
  document.querySelectorAll(".cm-compose input").forEach(inp => {                // the mic shows when there's nothing to send
    const comp = inp.closest(".cm-compose"), sync = () => comp.classList.toggle("empty", !inp.value.trim());
    inp.addEventListener("input", sync); sync();
    new MutationObserver(sync).observe(comp.querySelector(".cm-send"), { attributes: true, attributeFilter: ["disabled"] });
  });
  let vcNow = null;
  function stopVoice() {
    if (!vcNow) return;
    const { el, audio } = vcNow; vcNow = null;
    if (audio) audio.pause(); else if (window.speechSynthesis) speechSynthesis.cancel();
    el.classList.remove("playing"); el.querySelectorAll(".vc-bars i").forEach(b => b.classList.remove("on"));
  }
  function playVoice(el, m) {
    if (vcNow && vcNow.el === el) { stopVoice(); return; }
    stopVoice();
    const barsEl = el.querySelectorAll(".vc-bars i"), t = el.querySelector(".vc-t");
    let audio = null, t0 = performance.now(), total = m.voice.dur;
    if (m.voice.src) { audio = new Audio(m.voice.src); audio.play().catch(() => {}); }
    else if (m.voice.tts && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(m.voice.tts); u.lang = "en-US"; u.rate = 1; u.pitch = 1.15;
      u.onend = () => { if (vcNow && vcNow.el === el) stopVoice(); };
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
    vcNow = { el, audio }; el.classList.add("playing");
    const tick = () => {
      if (!vcNow || vcNow.el !== el) { t.textContent = fmtDur(total); return; }
      const played = audio && audio.duration && isFinite(audio.duration) ? audio.currentTime / audio.duration : (performance.now() - t0) / 1000 / total;
      const p = Math.min(1, played), n = Math.round(p * barsEl.length);
      barsEl.forEach((b, k) => b.classList.toggle("on", k < n));
      t.textContent = fmtDur(Math.max(0, total * (1 - p)));
      if (p >= 1 || (audio && audio.ended)) { stopVoice(); t.textContent = fmtDur(total); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  [feed, thFeed].forEach(f => f.addEventListener("click", e => {
    const b = e.target.closest(".vc-play"); if (!b) return;
    const el = b.closest(".vc"), id = +el.dataset.vc;
    const c = f === feed ? CHATS.global : CHATS[openId], m = c && findMsg(c, id);
    if (m) playVoice(el, m);
  }));

  // pinned messages and group admins
  const isAdmin = c => c && c.kind === "group" && (c.admins || []).includes("me");
  const canPin = c => c && (c.kind === "dm" || isAdmin(c));
  function paintPin() {
    const c = openId && CHATS[openId], bar = $("cm-pinbar"), m = c && c.pinned;
    bar.hidden = !m || m.deleted;
    if (!bar.hidden) { $("cm-pin-t").textContent = richLabel(m); $("cm-pin-x").hidden = !canPin(c); }
  }
  $("cm-pinbar").addEventListener("click", e => {
    const c = CHATS[openId]; if (!c || !c.pinned) return;
    if (e.target.closest("#cm-pin-x")) { c.pinned = null; paintPin(); toast("Unpinned"); return; }
    const el = thFeed.querySelector(`[data-mid="${c.pinned.id}"]`);
    if (el) { el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1400); }
  });
  const giSheet = $("gi-sheet");
  window.JIA_chat = { CHATS, M, open: id => { if (id.includes(":") && !id.startsWith("dm:") && !CHATS[id]) return; const t = document.getElementById("cm-t-dm"); if (t && t.getAttribute("aria-selected") !== "true") t.click(); openThread(id); }, renderConvs: () => renderConvs(), screen: t => screen(t),   // for Jamals Global engine parts
    rerenderOpen: () => { if (openId && CHATS[openId]) rerender(thFeed, CHATS[openId], true); }, openId: () => openId, now: () => now(),
    rerenderChat: id => { if (id === "global") rerender($("cm-feed"), CHATS.global, true); else if (openId === id) rerender(thFeed, CHATS[id], true); } };
  function openGroupInfo() {
    const c = CHATS[openId]; if (!c || c.kind !== "group") return;
    const admin = isAdmin(c), admins = c.admins || [];
    $("gi-av").innerHTML = !c.members.length && window.JG_ENGINE ? "" : `<span class="cm-gav"><img src="${AV[c.members[0]]}" alt=""><img src="${AV[c.members[1] || c.members[0]]}" alt=""></span>`;   /* JG-PROD: owner 4 Oct R13, no avatar row for a real student's group with nobody else in it */
    $("gi-name").textContent = c.name;
    $("gi-sub").textContent = c.league != null ? "League chat. Members change every week with the league." : `${c.members.length + 1} ${c.members.length || !window.JG_ENGINE ? "members" : "member"}${admin ? ". You're an admin" : ""}`;   /* JG-PROD: owner 4 Oct R13, a real student alone in a group (a club's thread) reads "1 member" */
    $("gi-list").innerHTML = [["me", admins.includes("me")], ...c.members.map(w => [w, admins.includes(w)])].map(([w, adm]) => `<li>
        <button type="button" class="gi-who" data-w="${w}">${w === "me" ? `<i class="gi-me" style="background-image:${myPhoto.replace(/"/g, "'")}"></i>` : `<img src="${AV[w]}" alt="">`}<span><b>${w === "me" ? "You" : esc(PEOPLE[w].name)}</b><small>${w === "me" ? (window.JG_ENGINE ? esc(window.JG_ENGINE.meLine(", ")) : "Grade 11") : KIND[PEOPLE[w].kind] /* JG-PROD: owner 4 Oct R12, a group's member list says the student's own grade and school, never the design's "Grade 11" */}</small></span></button>
        ${adm ? `<em>Admin</em>` : ""}${admin && w !== "me" ? `<button type="button" data-gi="admin" data-w="${w}">${adm ? "Remove admin" : "Make admin"}</button><button type="button" class="danger" data-gi="remove" data-w="${w}" aria-label="Remove ${w === "me" ? "you" : esc(PEOPLE[w].name)}">Remove</button>` : ""}</li>`).join("");
    $("gi-leave").hidden = c.league != null;
    openLayer(giSheet);
  }
  $("gi-list").addEventListener("click", e => {
    const who = e.target.closest(".gi-who");
    if (who) { closeLayer(giSheet); openProfile(who.dataset.w); return; }
    const b = e.target.closest("[data-gi]"); if (!b) return;
    const c = CHATS[openId], w = b.dataset.w;
    if (b.dataset.gi === "admin") { c.admins = c.admins || []; c.admins.includes(w) ? c.admins.splice(c.admins.indexOf(w), 1) : c.admins.push(w); }
    else { c.members = c.members.filter(x => x !== w); c.msgs.push(M(null, `You removed ${PEOPLE[w].name}`, "", { system: true })); rerender(thFeed, c); }
    closeLayer(giSheet); openGroupInfo(); renderConvs();
  });
  $("gi-leave").addEventListener("click", () => {
    const c = CHATS[openId]; closeLayer(giSheet); closeThread(true);
    delete CHATS[c.id]; renderConvs(); toast(`You left ${c.name}`);
  });

  // leaving Community closes a conversation, a story, a sheet or the reels
  let shown = false;
  new MutationObserver(() => {
    const on = page.classList.contains("show");
    if (on && !shown) feedWrap.scrollTop = feedWrap.scrollHeight;
    if (!on && shown) { closeThread(true); chatTimers.forEach(clearTimeout); chatTimers = []; if (!view.hidden) closeStories(); closeSheet(); if (!rlView.hidden) closeReels(); }
    shown = on;
  }).observe(page, { attributes: true, attributeFilter: ["class"] });

  // desktop: clicking the dimmed page beside a drawer closes it
  [["pf-view", "pf-back"], ["ev-view", "ev-back"], ["sr-view", "sr-cancel"]].forEach(([v, b]) => {
    const el = $(v), btn = $(b);
    if (el && btn) el.addEventListener("click", e => { if (e.target === el && e.clientX < el.getBoundingClientRect().left) btn.click(); });
  });
})();

