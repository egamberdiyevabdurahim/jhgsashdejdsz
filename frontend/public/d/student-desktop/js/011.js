
(() => {
  "use strict";

  /* ==========================================================
     EXPLORE — opportunities that build your profile. Discover
     filters by category; click a card and it grows into a ticket
     you can browse with the arrows, the keyboard or a drag.
     Edit CATS and OPPS to change it.
     ========================================================== */
  const IMG = {"trophy": "/d/student-desktop/media/9b284cd6a91d8e4b.webp", "robot": "/d/student-desktop/media/94e2a4917058ad89.webp", "books": "/d/student-desktop/media/849683f3fb76d281.webp", "globe": "/d/student-desktop/media/905d9d1329be3e3d.webp", "laptop": "/d/student-desktop/media/c6bb50349c7c54b7.webp", "summit": "/d/student-desktop/media/4521ec919a1f903c.webp", "backpack": "/d/student-desktop/media/956f6568e0298f98.webp", "microscope": "/d/student-desktop/media/b76b2fbd1f182b8c.webp"};
  window.JIA_IMG = Object.assign(window.JIA_IMG || {}, IMG);      // shared with Community (stories, posts)
  const CATS = {
    champ:    { name: "Championships",  g: ["#fbeedf", "#f5ddc2"], ink: "#694721", sh: "rgba(105, 71, 33, .14)", img: "trophy" },
    vol:      { name: "Volunteering",   g: ["#fae1e4", "#f2c4cb"], ink: "#69212b", sh: "rgba(105, 33, 43, .13)", img: "books" },
    intern:   { name: "Internships",    g: ["#e0ecfa", "#c3daf4"], ink: "#214269", sh: "rgba(33, 66, 105, .14)", img: "laptop" },
    lead:     { name: "Leadership",     g: ["#e8e2f8", "#d2c7ef"], ink: "#342169", sh: "rgba(52, 33, 105, .13)", img: "summit" },
    summer:   { name: "Summer schools", g: ["#e5f5f3", "#cdeae6"], ink: "#21695f", sh: "rgba(33, 105, 95, .14)", img: "backpack" },
    research: { name: "Research",       g: ["#e6f5eb", "#cde9da"], ink: "#1e684a", sh: "rgba(30, 104, 74, .14)", img: "microscope" },
    sch:      { name: "Scholarships",   g: ["#fbf3d9", "#f2dfa0"], ink: "#5f4a0e", sh: "rgba(95, 74, 14, .14)", img: "scholar" },
    uni:      { name: "Universities",   g: ["#e4ecf2", "#c6d6e3"], ink: "#23445e", sh: "rgba(35, 68, 94, .14)", img: "globe" },
  };
  IMG.scholar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E %3ClinearGradient id='p' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23fffaf0'/%3E%3Cstop offset='1' stop-color='%23e6d3ad'/%3E%3C/linearGradient%3E %3ClinearGradient id='e' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0' stop-color='%23cdb68a'/%3E%3Cstop offset='.5' stop-color='%23fff6e2'/%3E%3Cstop offset='1' stop-color='%23c2a674'/%3E%3C/linearGradient%3E %3CradialGradient id='g' cx='.35' cy='.3' r='.85'%3E%3Cstop offset='0' stop-color='%23fff1b8'/%3E%3Cstop offset='.5' stop-color='%23f0b43a'/%3E%3Cstop offset='1' stop-color='%23a86f0c'/%3E%3C/radialGradient%3E %3ClinearGradient id='r' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%2348b98b'/%3E%3Cstop offset='1' stop-color='%231c6a4a'/%3E%3C/linearGradient%3E%3C/defs%3E %3Cellipse cx='100' cy='178' rx='72' ry='10' fill='%23000' opacity='.13'/%3E %3Cg transform='rotate(-16 100 98)'%3E%3Crect x='26' y='66' width='148' height='60' rx='30' fill='url(%23p)'/%3E%3Cellipse cx='27' cy='96' rx='13' ry='30' fill='url(%23e)'/%3E%3Cellipse cx='173' cy='96' rx='13' ry='30' fill='url(%23e)'/%3E%3Cellipse cx='173' cy='96' rx='5' ry='14' fill='%23d8c39a'/%3E %3Cpath d='M52 82h86M52 96h70M52 110h80' stroke='%23d9c7a2' stroke-width='5' stroke-linecap='round'/%3E%3Crect x='92' y='66' width='18' height='60' fill='url(%23r)'/%3E%3C/g%3E %3Cpath d='M108 126l-12 46 14-8 11 11 5-46z' fill='url(%23r)'/%3E%3Cpath d='M130 126l8 44 6-13 14 3-10-42z' fill='%231c6a4a'/%3E %3Ccircle cx='122' cy='122' r='27' fill='url(%23g)'/%3E%3Ccircle cx='122' cy='122' r='19' fill='none' stroke='%23fff3c4' stroke-width='3' opacity='.85'/%3E %3Cpath d='M122 110l3.8 7.8 8.6 1.2-6.2 6 1.5 8.5-7.7-4-7.7 4 1.5-8.5-6.2-6 8.6-1.2z' fill='%23fff7d6'/%3E%3C/svg%3E";
  const U = window.JIA_UNI = Object.assign(window.JIA_UNI || {}, { mit: "/d/student-desktop/media/943c6acbf1356f68.webp", harvard: "/d/student-desktop/media/fbb6fd0e9131f2c4.webp", purdue: "/d/student-desktop/media/027b66086c49e7a2.webp" }), MICH = "/d/student-desktop/media/dfc8a0a543e1c53c.webp";
  const OPPS = [
    { id: 1, cat: "champ",    img: "trophy",     org: "City Olympiad Center",    title: "Tashkent Math Championship",  stat: "$2,000", statL: "prize fund",      when: "Closes Oct 15", where: "Tashkent",
      about: "A two-round olympiad for grades 9 to 11. The top ten finishers are invited to the national team camp." },
    { id: 2, cat: "vol",      img: "books",      org: "Bright Minds Foundation", title: "Weekend Tutoring for Kids",   stat: "40 h",   statL: "service hours",   when: "Starts Oct 4",  where: "Chilonzor",
      about: "Tutor primary school students in math and English every Saturday morning. A strong line for your activities list." },
    { id: 3, cat: "intern",   img: "laptop",     org: "TechHub Tashkent",        title: "Software Internship",         stat: "8 wk",   statL: "paid internship", when: "Closes Nov 1",  where: "Hybrid",
      about: "Work with a product team on a real app, with mentoring from senior engineers and a demo day at the end." },
    { id: 4, cat: "lead",     img: "summit",     org: "Future Leaders Forum",    title: "Youth Leadership Summit",     stat: "50",     statL: "seats left",      when: "Closes Oct 25", where: "Samarkand",
      about: "Three days of workshops, debates and a community project with students from across the region." },
    { id: 5, cat: "champ",    img: "robot",      org: "RoboLeague",              title: "National Robotics Cup",       stat: "$5,000", statL: "prize fund",      when: "Closes Nov 2",  where: "Online qualifier",
      about: "Build a robot with a team of three and compete in the national final. Beginners are welcome." },
    { id: 6, cat: "summer",   img: "backpack",   org: "Global Campus",           title: "Summer School in Engineering", stat: "4 wk",  statL: "on campus",       when: "Closes Jan 15", where: "Abroad",
      about: "Live on a university campus, take engineering classes and build a final project with mentors." },
    { id: 7, cat: "vol",      img: "globe",      org: "Green Steps",             title: "Green City Clean-up",         stat: "3 days", statL: "of action",       when: "Oct 18 to 20",  where: "City parks",
      about: "Join 300 volunteers planting trees and cleaning parks. Every volunteer gets a certificate." },
    { id: 8, cat: "research", img: "microscope", org: "Young Scientists Lab",    title: "Young Researchers Program",   stat: "12",     statL: "mentors",         when: "Closes Dec 1",  where: "Online",
      about: "Run a research project with a mentor and write up a short paper. Ideal for STEM applicants." },
    { id: 101, cat: "sch", img: "scholar", org: "JIA Foundation", title: "JIA Merit Scholarship", stat: "$5,000", statL: "per year", when: "Closes Dec 1", where: "JIA students",
      about: "For JIA students with strong grades and real community work. Renewed every year you keep your grades up. Sample listing." },
    { id: 102, cat: "sch", img: "scholar", org: "Future Leaders Fund", title: "Global Leaders Grant", stat: "Full", statL: "tuition", when: "Closes Jan 15", where: "Worldwide",
      about: "Covers full tuition for students who lead projects in their community. Two essays and one interview. Sample listing." },
    { id: 103, cat: "sch", img: "scholar", org: "STEM Futures Network", title: "STEM Futures Award", stat: "$10,000", statL: "one-time award", when: "Closes Feb 1", where: "Online",
      about: "For students planning to study science, technology, engineering or math. Share one project you built. Sample listing." },
    { id: 111, cat: "uni", key: "mit", img: "globe", photo: U.mit, org: "Massachusetts Institute of Technology", title: "MIT", stat: "~4%", statL: "acceptance rate", when: "EA Nov 1", where: "Cambridge, MA",
      about: "Your goal. Engineering, science and hands-on making. Early Action closes Nov 1. Photo: Beyond My Ken, CC BY-SA 4.0." },
    { id: 112, cat: "uni", key: "harvard", img: "globe", photo: U.harvard, org: "Harvard University", title: "Harvard", stat: "~4%", statL: "acceptance rate", when: "RD Jan 1", where: "Cambridge, MA",
      about: "A reach on your roadmap at 85% ready. Liberal arts with strong science. Photo: Kenneth C. Zirkel, CC BY 4.0." },
    { id: 113, cat: "uni", key: "purdue", img: "globe", photo: U.purdue, org: "Purdue University", title: "Purdue", stat: "~50%", statL: "acceptance rate", when: "EA Nov 1", where: "West Lafayette, IN",
      about: "In range for you right now. A top engineering school in the Midwest. Photo: Julian Herzog, CC BY 4.0." },
    { id: 114, cat: "uni", key: "michigan", img: "globe", photo: MICH, org: "University of Michigan", title: "Michigan", stat: "~18%", statL: "acceptance rate", when: "EA Nov 1", where: "Ann Arbor, MI",
      about: "A strong public university for engineering and business. Photo: w_lemay, CC BY-SA 2.0." }
  ];

  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = $("v-explore"), catsEl = $("ex-cats"), stack = $("ex-stack"), allBtn = $("ex-all");
  const detail = $("ex-detail"), clip = $("ex-clip"), pages = $("ex-pages"), morph = $("ex-morph"), dots = $("ex-dots"), backBtn = $("ex-back");
  const applied = new Set();
  let filter = null, list = OPPS.slice(), current = 0, busy = false;
  const vars = c => `--g1:${c.g[0]};--g2:${c.g[1]};--ink2:${c.ink};--sh:${c.sh}`;
  const grad = c => `linear-gradient(150deg, ${c.g[0]}, ${c.g[1]})`;

  $("ex-open").textContent = `${OPPS.length} open`;

  /* ---------- Discover ---------- */
  catsEl.innerHTML = Object.entries(CATS).map(([k, c]) => {
    const n = OPPS.filter(o => o.cat === k).length;
    return `<button class="ex-cat" type="button" data-cat="${k}" aria-pressed="false" style="${vars(c)}">
        <img src="${IMG[c.img]}" alt=""><b>${c.name}</b><span>${n} open</span></button>`;
  }).join("");
  catsEl.addEventListener("click", e => {
    const b = e.target.closest(".ex-cat");
    if (!b) return;
    setFilter(filter === b.dataset.cat ? null : b.dataset.cat);
  });
  allBtn.addEventListener("click", () => setFilter(null));
  function setFilter(cat) {
    filter = cat;
    [...catsEl.children].forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cat === cat)));
    renderStack(true);
  }

  /* ---------- the wallet ---------- */
  function renderStack(animate) {
    list = filter ? OPPS.filter(o => o.cat === filter) : OPPS.slice();
    stack.innerHTML = list.map((o, i) => {
      const c = CATS[o.cat], done = applied.has(o.id);
      return `<li class="ex-card${done ? " applied" : ""}${animate && !reduce ? " in" : ""}" style="${vars(c)};--i:${i}" data-i="${i}" tabindex="0" role="button"
          aria-label="${o.title}, ${o.org}. ${o.stat} ${o.statL}. ${done ? "Applied" : o.when}.">
          <p class="org">${o.org}</p><p class="ttl">${o.title}</p>
          <p class="stat"><b>${o.stat}</b><span>${o.statL}</span></p>
          <span class="when">${done ? "✓ Applied" : o.when}</span>
          <img src="${o.photo || IMG[o.img]}" alt=""${o.photo ? ' class="ex-uni-photo"' : ""}>
        </li>`;
    }).join("");
    $("ex-list-title").textContent = filter ? CATS[filter].name : "Open now";
    allBtn.hidden = !filter;
    depth();
  }
  stack.addEventListener("click", e => { const c = e.target.closest(".ex-card"); if (c) openDetail(+c.dataset.i); });
  stack.addEventListener("keydown", e => {
    const c = e.target.closest(".ex-card");
    if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openDetail(+c.dataset.i); }
  });
  const depth = () => {};                                        // desktop: the cards sit in a grid, nothing to tilt

  /* ---------- the ticket: open, swipe, close ---------- */
  function buildPages() {
    pages.innerHTML = list.map(o => {
      const c = CATS[o.cat], done = applied.has(o.id);
      return `<article class="ex-page" style="${vars(c)}" aria-label="${o.title}">
          <div class="ex-top">
            <span class="ex-logo"><img src="${o.photo || IMG[o.img]}" alt=""${o.photo ? ' class="ex-uni-photo"' : ""}></span>
            <p class="ex-org">${o.org}</p>
            <h2 class="ex-ttl">${o.title}</h2>
            <p class="ex-stat">${o.stat}</p>
            <p class="ex-statl">${o.statL}</p>
            <p class="ex-meta"><span>${o.when}</span><span>${o.where}</span></p>
          </div>
          <div class="ex-bot"><i class="perf"></i>
            <p class="ex-about">${o.about}</p>
            <button class="ex-apply${done ? " done" : ""}" type="button" data-id="${o.id}">${done ? (o.cat === "uni" ? "✓ In my applications" : "✓ Applied") : (o.cat === "uni" ? "Add to my applications" : "Apply now")}</button>
            <div class="ex-bigwrap"><div class="ex-jump"><img class="ex-big${o.photo ? " ex-uni-photo" : ""}" src="${o.photo || IMG[o.img]}" alt="${o.title}"></div></div>
          </div>
        </article>`;
    }).join("");
    dots.innerHTML = list.map(() => "<i></i>").join("");
  }
  // the ticket grows out of the card it came from, and shrinks back into it
  const scrim = $("ex-scrim");
  const fromCard = card => {
    const r = card.getBoundingClientRect(), d = clip.getBoundingClientRect();
    return `translate(${(r.left + r.width / 2 - (d.left + d.width / 2)).toFixed(1)}px, ${(r.top + r.height / 2 - (d.top + d.height / 2)).toFixed(1)}px) scale(${(r.width / d.width).toFixed(3)}, ${(r.height / d.height).toFixed(3)})`;
  };
  function openDetail(i) {
    if (busy) return;
    const card = stack.children[i];
    buildPages();
    detail.hidden = false;
    pages.style.scrollSnapType = "none";
    pages.scrollLeft = i * pages.clientWidth;
    pages.style.scrollSnapType = "";
    current = i; paint();
    document.addEventListener("keydown", onKey);
    backBtn.focus({ preventScroll: true });
    if (reduce || !card) return;
    busy = true;
    const pg = pages.children[i];
    morph.style.background = grad(CATS[list[i].cat]);
    scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: "ease-out" });
    clip.animate([{ transform: fromCard(card), borderRadius: "24px" }, { transform: "none", borderRadius: "30px" }], { duration: 480, easing: "cubic-bezier(.2, .8, .2, 1)" });
    morph.animate([{ opacity: 1 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: 540, easing: "ease-out" });
    pg.querySelector(".ex-top").animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
      { duration: 420, delay: 220, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" });
    pg.querySelector(".ex-bigwrap").animate([{ opacity: 0, transform: "translateY(40px) rotate(12deg) scale(.7)" }, { opacity: 1, transform: "none" }],
      { duration: 620, delay: 180, easing: "cubic-bezier(.3, 1.4, .5, 1)", fill: "backwards", composite: "add" });
    setTimeout(() => { busy = false; }, 540);
  }
  function closeDetail() {
    if (busy || detail.hidden) return;
    const card = stack.children[current];
    document.removeEventListener("keydown", onKey);
    const done = () => {
      detail.hidden = true; busy = false;
      [clip, morph, scrim].forEach(el => el.getAnimations().forEach(a => a.cancel()));
      if (card) card.focus({ preventScroll: true });
    };
    if (reduce || !card) return done();
    busy = true;
    const r = card.getBoundingClientRect();
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: "forwards" });
    if (r.bottom < 0 || r.top > innerHeight) {                   // that card is off screen: just fade away
      clip.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }], { duration: 240, fill: "forwards" }).onfinish = done;
      return;
    }
    morph.style.background = grad(CATS[list[current].cat]);
    clip.animate([{ transform: "none", borderRadius: "30px" }, { transform: fromCard(card), borderRadius: "24px" }], { duration: 400, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" }).onfinish = done;
    morph.animate([{ opacity: 0 }, { opacity: 1, offset: .6 }, { opacity: 1 }], { duration: 400, fill: "forwards" });
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closeDetail(); }
    else if (e.key === "ArrowRight") go(current + 1);
    else if (e.key === "ArrowLeft") go(current - 1);
  }
  function go(i) {
    i = Math.max(0, Math.min(list.length - 1, i));
    pages.scrollTo({ left: i * pages.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }
  backBtn.addEventListener("click", closeDetail);
  const prevBtn = $("ex-prev"), nextBtn = $("ex-next");               // on desktop the ticket has arrows beside it
  prevBtn.addEventListener("click", () => go(current - 1));
  nextBtn.addEventListener("click", () => go(current + 1));
  scrim.addEventListener("click", closeDetail);

  // swiping: the object and the numbers drift at their own pace
  function paint() {
    const w = pages.clientWidth || 1, x = pages.scrollLeft;
    current = Math.round(x / w);
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === current));
    prevBtn.disabled = current <= 0; nextBtn.disabled = current >= list.length - 1;
    [...pages.children].forEach((pg, k) => {
      const off = (k * w - x) / w;
      if (Math.abs(off) > 1.3) return;
      pg.querySelector(".ex-bigwrap").style.transform = `translateX(${(off * 110).toFixed(1)}px) rotate(${(off * 16).toFixed(1)}deg)`;
      pg.querySelector(".ex-stat").style.transform = `translateX(${(off * -46).toFixed(1)}px)`;
      pg.querySelector(".ex-top").style.opacity = (1 - Math.min(1, Math.abs(off)) * .55).toFixed(3);
    });
  }
  pages.addEventListener("scroll", () => requestAnimationFrame(paint), { passive: true });
  // drag with a mouse too (touch swipes natively)
  let drag = null;
  pages.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("button")) return;
    drag = { x: e.clientX, left: pages.scrollLeft, live: false, id: e.pointerId };   // a drag only starts once the mouse moves
  });
  pages.addEventListener("pointermove", e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.live) {
      if (Math.abs(dx) < 5) return;
      drag.live = true;
      pages.style.scrollSnapType = "none";
      pages.setPointerCapture(drag.id);
    }
    pages.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    if (!drag.live) { drag = null; return; }                 // it was a click, not a drag
    const w = pages.clientWidth, dx = pages.scrollLeft - drag.left;
    const target = Math.round(drag.left / w) + (Math.abs(dx) > w * .18 ? Math.sign(dx) : 0);
    drag = null;
    pages.scrollTo({ left: Math.max(0, Math.min(list.length - 1, target)) * w, behavior: "smooth" });
    setTimeout(() => { pages.style.scrollSnapType = ""; }, 420);
  };
  pages.addEventListener("pointerup", endDrag);
  pages.addEventListener("pointercancel", endDrag);

  // with a mouse, the object leans toward the pointer; click it and it jumps with a little burst
  let actx = null;
  function boing() {
    try {
      if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(620, t + .16);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .28);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .3);
    } catch (e) {}
  }
  pages.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || (drag && drag.live) || reduce) return;
    const img = pages.children[current] && pages.children[current].querySelector(".ex-big");
    if (!img) return;
    const r = img.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * .9)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * .9)));
    img.style.setProperty("--ry", `${(dx * 18).toFixed(1)}deg`);
    img.style.setProperty("--rx", `${(-dy * 14).toFixed(1)}deg`);
  });
  pages.addEventListener("pointerleave", () => {
    pages.querySelectorAll(".ex-big").forEach(img => { img.style.removeProperty("--rx"); img.style.removeProperty("--ry"); });
  });
  function burst(pg, img, ink) {
    const pr = pg.getBoundingClientRect(), r = img.getBoundingClientRect();
    const cx = r.left + r.width * .5 - pr.left, cy = r.top + r.height * .42 - pr.top;
    for (let k = 0; k < 12; k++) {
      const d = document.createElement("i");
      d.className = "ex-spark"; pg.appendChild(d);
      const a = (k / 12) * Math.PI * 2 + Math.random() * .4, dist = 70 + Math.random() * 60, size = 6 + Math.random() * 6;
      Object.assign(d.style, { left: `${cx}px`, top: `${cy}px`, width: `${size}px`, height: `${size}px`, background: k % 3 ? "#f5c542" : ink });
      d.animate([
        { transform: "translate(-50%, -50%) scale(.2)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(1) rotate(${Math.random() * 180}deg)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 250, easing: "cubic-bezier(.2, .8, .3, 1)" }).onfinish = () => d.remove();
    }
  }
  pages.addEventListener("click", e => {
    const img = e.target.closest(".ex-big");
    if (!img || reduce) return;
    const jump = img.parentElement, pg = img.closest(".ex-page");
    jump.getAnimations().forEach(a => a.cancel());
    jump.animate([
      { transform: "none" },
      { transform: "translateY(10px) scale(1.08, .88)", offset: .14 },
      { transform: "translateY(-54px) rotate(-14deg) scale(.95, 1.07)", offset: .45 },
      { transform: "translateY(0) rotate(5deg) scale(1.07, .92)", offset: .74 },
      { transform: "translateY(-6px) rotate(-2deg) scale(.99, 1.01)", offset: .88 },
      { transform: "none" },
    ], { duration: 820, easing: "cubic-bezier(.3, .7, .4, 1)" });
    burst(pg, img, getComputedStyle(pg).getPropertyValue("--ink2").trim());
    boing();
  });

  // applying marks the ticket and the card in the wallet
  pages.addEventListener("click", e => {
    const b = e.target.closest(".ex-apply");
    if (!b) return;
    const id = +b.dataset.id;
    if (applied.has(id)) applied.delete(id); else applied.add(id);
    const on = applied.has(id);
    const oo = OPPS.find(x => x.id === id), isUni = oo && oo.cat === "uni";
    b.classList.toggle("done", on); b.textContent = on ? (isUni ? "✓ In my applications" : "✓ Applied") : (isUni ? "Add to my applications" : "Apply now");
    if (on && isUni && window.JIA_addApp) { window.JIA_addApp(oo.key, { name: oo.title, full: oo.org, photo: oo.photo }); if (window.JIA_openApps) setTimeout(() => window.JIA_openApps(oo.key), 500); }
    if (on && !reduce) b.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
    const i = list.findIndex(o => o.id === id), card = stack.children[i];
    if (card) {
      card.classList.toggle("applied", on);
      card.querySelector(".when").textContent = on ? "✓ Applied" : list[i].when;
    }
  });

  // the cards deal in each time Explore opens
  renderStack(false);
  let shown = false;
  new MutationObserver(() => {
    const on = page.classList.contains("show");
    if (on && !shown) renderStack(true);
    if (!on && shown && !detail.hidden) { detail.hidden = true; busy = false; document.removeEventListener("keydown", onKey); }
    shown = on;
  }).observe(page, { attributes: true, attributeFilter: ["class"] });
  window.JIA_DATA = Object.assign(window.JIA_DATA || {}, { opps: OPPS, cats: CATS });
  window.JIA_DATA.img = Object.assign(window.JIA_DATA.img || {}, IMG);
  window.JIA_openOpp = i => {                                  // search opens an opportunity's ticket
    window.JIA.go("explore");
    setTimeout(() => { try { if (typeof setFilter === "function") setFilter(null); } catch (e) {} setTimeout(() => { try { openDetail(i); } catch (e) {} }, 380); }, 450);
  };
})();
