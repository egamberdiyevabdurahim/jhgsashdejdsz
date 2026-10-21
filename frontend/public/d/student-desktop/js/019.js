
(() => {
  "use strict";
  /* ==========================================================
     COIN SHOP — spend the coins earned on Today. A featured
     carousel of coloured cards, a list, and an item screen that
     grows out of the card (like a product showcase).
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PEOPLE = () => window.JIA_PEOPLE || {}, AVS = () => window.JIA_AV || {};
  const A = {coupon: "/d/student-desktop/media/066a020a79f58418.webp", ticket: "/d/student-desktop/media/d0302ab22b0ada1b.webp", earbuds: "/d/student-desktop/media/33c3a0958af3ccdd.webp", tablet: "/d/student-desktop/media/dcd7fc305c79ba1f.webp", calc: "/d/student-desktop/media/dcbbd2b5ce6efd8f.webp", laptop: "/d/student-desktop/media/86162d4555d7fc12.webp", tutor: "/d/student-desktop/media/835373c00b050693.webp", freeze: "/d/student-desktop/media/4dde21894f860540.webp", hoodie: "/d/student-desktop/media/4244caec7e74274f.webp"};
  const CATS = [["all", "All"], ["style", "Style"], ["discount", "Discounts"], ["event", "Events"], ["device", "Devices"], ["tutor", "Tutoring"], ["other", "Other"]];
  const COL = { discount: "#1f8f5f", event: "#ef8a3a", device: "#3e76cc", tutor: "#7b5cd6", other: "#e0564f" };
  const ITEMS = [
    { id: "d1", cat: "discount", name: "30% off Premium", price: 900, img: A.coupon, desc: "Take 30% off your first year of JIA Premium: live courses, Jamol without limits and essay reviews by teachers.", opts: { label: "Use it on", list: ["Pro", "Premium", "VIP"], pick: 1 }, next: "Use this code at checkout within 30 days." },
    { id: "d2", cat: "discount", name: "20% off the SAT course", price: 600, img: A.coupon, desc: "20% off the live JIA SAT course with Aziza Karimova. Works for the next intake you pick.", opts: { label: "Intake", list: ["October", "November", "January"] }, next: "Use this code when you enrol." },
    { id: "d3", cat: "discount", name: "A free month of Pro", price: 1200, img: A.coupon, desc: "One month of JIA Pro on us: every recorded lesson, 30 questions to Jamol a day and unlimited mini games.", next: "Pro starts as soon as you activate the code." },
    { id: "e1", cat: "event", name: "Tashkent Hackathon", price: 1500, img: A.ticket, desc: "A 24-hour student hackathon with mentors from tech companies. Build something with your team and pitch it to the jury. It looks great on your activities list.", opts: { label: "Pick a date", list: ["Sat 12 Oct", "Sat 26 Oct"] }, next: "Show this ticket at the entrance. The details are in your notifications." },
    { id: "e2", cat: "event", name: "Model UN pass", price: 2000, img: A.ticket, desc: "Two days as a delegate at a Model UN conference in Tashkent. Debate, write resolutions and practise public speaking.", opts: { label: "Committee", list: ["UNSC", "UNHRC", "WHO"] }, next: "Show this pass at registration." },
    { id: "e3", cat: "event", name: "IELTS mock test", price: 800, img: A.ticket, desc: "A full IELTS test in real exam conditions, with band scores for all four skills and written feedback from a JIA examiner.", opts: { label: "Pick a date", list: ["Sat 5 Oct", "Sat 19 Oct", "Sat 2 Nov"] }, next: "Come 30 minutes early with your passport." },
    { id: "v1", cat: "device", name: "Wireless earbuds", price: 6500, img: A.earbuds, desc: "Noise-cancelling wireless earbuds for listening practice and lessons on the go. Delivered to your door anywhere in Uzbekistan.", opts: { label: "Colour", swatch: [["#f4f4f2", "White"], ["#2b2d33", "Black"], ["#1f8f5f", "Jade"]] }, next: "We'll call you within 2 days to arrange delivery." },
    { id: "v2", cat: "device", name: "Scientific calculator", price: 2200, img: A.calc, desc: "A calculator you're allowed to use on the SAT and on AP exams.", next: "We'll call you within 2 days to arrange delivery." },
    { id: "v3", cat: "device", name: "Tablet with a stylus", price: 25000, img: A.tablet, desc: "A 10-inch tablet with a stylus for notes, e-books and lessons.", opts: { label: "Colour", swatch: [["#6b6f78", "Space grey"], ["#d9dbe0", "Silver"], ["#1f8f5f", "Jade"]] }, next: "We'll call you within 2 days to arrange delivery." },
    { id: "v4", cat: "device", name: "Laptop", price: 60000, img: A.laptop, desc: "A 14-inch laptop for your applications, essays and university life. The big goal!", opts: { label: "Colour", swatch: [["#c9ccd2", "Silver"], ["#3a3d45", "Graphite"]] }, next: "We'll call you within 2 days to arrange delivery." },
    { id: "t1", cat: "tutor", name: "1:1 SAT Math session", price: 1500, img: A.tutor, desc: "60 minutes with a top SAT teacher, just you. Bring your hardest questions.", opts: { label: "Your tutor", tutors: ["aziza", "bekzod", "javlon"] }, next: "Your tutor will message you in Direct to pick a time." },
    { id: "t2", cat: "tutor", name: "Essay coaching", price: 1800, img: A.tutor, desc: "45 minutes with an admissions coach on your Common App essay: structure, story and voice.", opts: { label: "Your coach", tutors: ["kamila", "aziza"] }, next: "Your coach will message you in Direct to pick a time." },
    { id: "t3", cat: "tutor", name: "IELTS speaking practice", price: 1000, img: A.tutor, desc: "A 30-minute speaking test with feedback on fluency, vocabulary and pronunciation.", opts: { label: "Your examiner", tutors: ["kamila", "javlon"] }, next: "Your examiner will message you in Direct to pick a time." },
    { id: "o1", cat: "other", name: "Streak freeze", price: 100, img: A.freeze, desc: "Missed a day? A streak freeze keeps your streak alive for one day. It works on its own when you need it.", next: "Your streak is protected for one missed day." },
    { id: "o2", cat: "other", name: "JIA hoodie", price: 4000, img: A.hoodie, desc: "A soft jade hoodie with the JIA crest. Delivered anywhere in Uzbekistan.", opts: { label: "Select size", list: ["S", "M", "L", "XL"], pick: 1 }, next: "We'll call you within 2 days to arrange delivery." },
  ];
  const FEAT = ["v1", "e1", "d1", "t1", "o2", "v4"];
  const MINE = [];
  let cat = "all", q = "", open = null, choice = 0;
  const view = $("cs-view");
  const C = () => (window.JIA_coins ? window.JIA_coins.get() : 0);
  const fmt = n => n.toLocaleString("en-US");
  const coinI = '<i class="cs-coin" aria-hidden="true"></i>';
  const find = id => ITEMS.find(x => x.id === id);
  function paintBal(from) {
    const b = $("cs-bal-n"), to = C();
    if (from == null || reduce) { b.textContent = fmt(to); return; }
    const t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / 700); b.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  }
  function paint() {
    $("cs-chips").innerHTML = CATS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${k === cat}" data-c="${k}">${t}</button>`).join("");
    const match = x => (cat === "all" || x.cat === cat) && (!q || x.name.toLowerCase().includes(q));
    const feat = (cat === "all" && !q ? FEAT.map(find) : ITEMS.filter(match)).slice(0, 6);
    $("cs-feat").innerHTML = feat.map(x => `<button type="button" class="cs-card" data-id="${x.id}" style="--c:${COL[x.cat]}" aria-label="${esc(x.name)}, ${fmt(x.price)} coins">
        <b>${esc(x.name)}</b><span class="cs-price">${coinI}${fmt(x.price)}</span><img src="${x.img}" alt=""></button>`).join("") || `<p class="cs-empty">Nothing here yet</p>`;
    const list = ITEMS.filter(match);
    $("cs-count").textContent = `${list.length} ${list.length === 1 ? "REWARD" : "REWARDS"}`;
    $("cs-list").innerHTML = list.map(x => { const need = x.price - C();
      return `<li><button type="button" class="cs-row" data-id="${x.id}"><span class="cs-thumb" style="--c:${COL[x.cat]}"><img src="${x.img}" alt=""></span>
        <span class="cs-rt"><b>${esc(x.name)}</b><span class="cs-price">${coinI}${fmt(x.price)}</span></span>
        <span class="cs-need${need <= 0 ? " ok" : ""}">${window.JG_GAMES && !window.JG_GAMES.shopOk(x.id) ? "Coming soon" /* JG-PROD: owner 20 Oct M1 games: what JG cannot deliver yet is not sold */ : need <= 0 ? "Redeem" : `${fmt(need)} to go`}</span></button></li>`; }).join("");
    $("cs-mine-n").hidden = !MINE.length; $("cs-mine-n").textContent = MINE.length;
  }
  function openShop() { paint(); paintBal(); view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 66); view.hidden = false; $("cs-scroll").scrollTop = 0; $("cs-feat").scrollLeft = 0; setTimeout(() => $("cs-back").focus({ preventScroll: true }), 60); }
  window.JIA_openShop = openShop;
  const wal = $("wallet");
  if (wal) { wal.setAttribute("role", "button"); wal.tabIndex = 0; wal.addEventListener("click", openShop); wal.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openShop(); } }); }
  $("cs-back").addEventListener("click", () => { if (!$("cs-det").hidden) closeDet(); else view.hidden = true; });
  $("cs-chips").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; cat = b.dataset.c; paint(); $("cs-feat").scrollLeft = 0; });
  $("cs-search").addEventListener("click", () => { const f = $("cs-q"); f.hidden = !f.hidden; if (!f.hidden) f.focus(); else { f.value = ""; q = ""; paint(); } });
  $("cs-q").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); paint(); });
  view.addEventListener("click", e => { const t = e.target.closest(".cs-card, .cs-row"); if (t) openDet(t.dataset.id, t); });

  /* the item screen grows out of the card */
  function optsHTML(x) {
    const o = x.opts; if (!o) return "";
    choice = o.pick || 0;
    const body = o.swatch ? o.swatch.map(([c, n], i) => `<button type="button" class="cs-sw" data-o="${i}" aria-pressed="${i === choice}" aria-label="${n}" style="--sw:${c}"></button>`).join("")
      : o.tutors ? o.tutors.filter(w => PEOPLE()[w]).map((w, i) => `<button type="button" class="cs-tut" data-o="${i}" aria-pressed="${i === choice}"><img src="${AVS()[w]}" alt=""><span>${esc(PEOPLE()[w].name.split(" ")[0])}</span></button>`).join("")
      : o.list.map((t, i) => `<button type="button" class="cs-opt" data-o="${i}" aria-pressed="${i === choice}">${esc(t)}</button>`).join("");
    return `<p class="cs-olabel">${o.label}</p><div class="cs-opts">${body}</div>`;
  }
  function paintAction(x) {
    const have = C(), need = x.price - have, ok = need <= 0, btn = $("cs-go");
    $("cs-progress").hidden = ok;
    if (!ok) { $("cs-pbar").style.width = `${Math.max(3, Math.min(100, have / x.price * 100))}%`; $("cs-ptext").textContent = `You have ${fmt(have)} of ${fmt(x.price)} coins`; }
    const soon = !!window.JG_GAMES && !window.JG_GAMES.shopOk(x.id); btn.disabled = !ok || soon; btn.innerHTML = soon ? "Coming soon" /* JG-PROD: owner 20 Oct M1 games */ : ok ? `Redeem for ${coinI}${fmt(x.price)}` : `${fmt(need)} more coins needed`;
  }
  function openDet(id, from) {
    const x = find(id); if (!x) return; open = x;
    const d = $("cs-det"); d.style.setProperty("--c", COL[x.cat]);
    $("cs-det-img").src = x.img; $("cs-det-name").textContent = x.name; $("cs-det-price").innerHTML = `${coinI}${fmt(x.price)}`;
    $("cs-det-desc").textContent = x.desc; $("cs-det-desc").classList.remove("full"); $("cs-more").hidden = x.desc.length < 120;
    $("cs-det-opts").innerHTML = optsHTML(x); paintAction(x);
    d.hidden = false; $("cs-det-scroll").scrollTop = 0;
    if (!reduce && from) {                                                 // grow from the card, fly the object in
      const r0 = from.getBoundingClientRect(), bg = $("cs-det-bg"), rb = bg.getBoundingClientRect(), img = $("cs-det-img"), ri = img.getBoundingClientRect();
      const fi = from.querySelector("img"), rf = fi ? fi.getBoundingClientRect() : r0;
      bg.animate([{ clipPath: `inset(${r0.top - rb.top}px ${rb.right - r0.right}px ${rb.bottom - r0.bottom}px ${r0.left - rb.left}px round 26px)` }, { clipPath: "inset(0 0 0 0 round 0 0 44px 44px)" }], { duration: 480, easing: "cubic-bezier(.2,.8,.2,1)" });
      img.animate([{ transform: `translate(${rf.left + rf.width / 2 - (ri.left + ri.width / 2)}px, ${rf.top + rf.height / 2 - (ri.top + ri.height / 2)}px) scale(${rf.width / ri.width}) rotate(-8deg)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" });
      $("cs-det-body").animate([{ opacity: 0, transform: "translateY(30px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 120, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
    }
    setTimeout(() => $("cs-det-back").focus({ preventScroll: true }), 80);
  }
  function closeDet() {
    const d = $("cs-det");
    if (reduce) { d.hidden = true; return; }
    d.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.96)" }], { duration: 220, easing: "ease-in" }).onfinish = () => { d.hidden = true; };
  }
  $("cs-det-back").addEventListener("click", closeDet);
  $("cs-more").addEventListener("click", () => { $("cs-det-desc").classList.add("full"); $("cs-more").hidden = true; });
  $("cs-det-opts").addEventListener("click", e => { const b = e.target.closest("[data-o]"); if (!b) return; choice = +b.dataset.o; $("cs-det-opts").querySelectorAll("[data-o]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); });
  $("cs-earn").addEventListener("click", () => { view.hidden = true; window.JIA.go("today"); });
  $("cs-go").addEventListener("click", () => {
    const x = open; if (!x || !window.JIA_coins) return;
    const before = C();
    if ((window.JG_GAMES && !window.JG_GAMES.shopOk(x.id)) || !window.JIA_coins.spend(x.price, { reason: "shop", ref: x.id })) { paintAction(x); return; }   /* JG-PROD: owner 20 Oct M1 games: nothing "soon" is ever debited (the server refuses it too) */   /* JG-PROD: S26, the debit names the item (o1 is the streak freeze, which the server fulfils in P1) */
    paintBal(before);
    const o = x.opts, pick = o ? (o.swatch ? o.swatch[choice][1] : o.tutors ? PEOPLE()[o.tutors[choice]].name : o.list[choice]) : "";
    const code = window.JG_GAMES ? "" /* JG-PROD: owner 20 Oct M1 games: no code the page made up */ : "JIA-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    MINE.unshift({ x, pick, code, when: "Just now" });
    const dn = $("cs-done"); dn.style.setProperty("--c", COL[x.cat]);
    $("cs-done-img").src = x.img; $("cs-done-t").textContent = x.name; $("cs-done-pick").textContent = pick;
    $("cs-done-code").textContent = code; $("cs-done-code").parentElement.style.display = code ? "" : "none";   /* JG-PROD: owner 20 Oct M1 games */ $("cs-done-next").textContent = x.next || "";
    dn.hidden = false; paint();
    if (window.JIA_notify) window.JIA_notify({ icon: x.img, text: `<b>${esc(x.name)}</b> redeemed for ${fmt(x.price)} coins.${code ? ` Code ${code}` : "" /* JG-PROD: owner 20 Oct M1 games */}` });
    setTimeout(() => $("cs-done-ok").focus({ preventScroll: true }), 80);
  });
  $("cs-done-ok").addEventListener("click", () => { $("cs-done").hidden = true; closeDet(); });
  $("cs-done-copy").addEventListener("click", () => { try { navigator.clipboard.writeText($("cs-done-code").textContent); } catch (e) {} $("cs-done-copy").textContent = "Copied"; setTimeout(() => { $("cs-done-copy").textContent = "Copy"; }, 1400); });
  $("cs-mine").addEventListener("click", () => {
    const s = $("cs-mine-sheet");
    $("cs-mine-list").innerHTML = MINE.length ? MINE.map(m => `<li><span class="cs-thumb" style="--c:${COL[m.x.cat]}"><img src="${m.x.img}" alt=""></span><span class="cs-rt"><b>${esc(m.x.name)}</b><small>${esc(m.pick ? m.pick + " · " : "")}${m.when}</small></span><code>${m.code}</code></li>`).join("")
      : `<li class="cs-none">Nothing yet. Redeem your first reward!</li>`;
    s.hidden = false;
  });
  $("cs-mine-sheet").addEventListener("click", e => { if (e.target.closest("[data-close]")) $("cs-mine-sheet").hidden = true; });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || view.hidden) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!$("cs-done").hidden) $("cs-done-ok").click(); else if (!$("cs-mine-sheet").hidden) $("cs-mine-sheet").hidden = true; else if (!$("cs-det").hidden) closeDet(); else view.hidden = true;
  }, true);
  // desktop: clicking the dimmed page beside the shop closes it
  view.addEventListener("click", e => { const r = view.getBoundingClientRect(); if (e.target === view && (e.clientX < r.left || e.clientX > r.right)) $("cs-back").click(); });
})();

