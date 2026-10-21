
(() => {
  "use strict";

  /* ==========================================================
     PRICING — four plans and a prize in a swipeable carousel (like a product
     showcase): a big 3D object per plan on its own colour, and a
     white card with the price and a "Get" button. Leaving without
     buying just closes it. JG-PROD: owner 4 Oct R2: the design's timed exit gift (VIP yearly at $29.90/mo, a 10-minute countdown) is removed.
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ART = {free: "/d/student-desktop/media/c659ce361c12d2c9.webp", pro: "/d/student-desktop/media/a1975df307d1ddf5.webp", premium: "/d/student-desktop/media/b404efed71ac5cc3.webp", vip: "/d/student-desktop/media/85ccbc764da2a059.webp", gift: "/d/student-desktop/media/3900591b955a4b06.webp"};
  ART.prize = (window.JIA_GIFT && window.JIA_GIFT.art.box) || ART.gift;                  // the same gift box the friend taps
  const PLANS = [
    { key: "free", name: "Free", m: 0, a: 0, bg: ["#3aa57a", "#1c6a4a"], desc: "Start your journey to MIT", tag: "Your plan",
      feats: ["Daily tasks and the roadmap", "3 lessons in every subject", "Community chat, stories and posts", "Mini games 3 times a day"] },
    { key: "pro", name: "Pro", m: 12.90, a: 10.75, bg: ["#3e76cc", "#1c3d73"], desc: "Every lesson, at your pace",
      feats: ["Everything in Free", "All recorded lessons", "Ask Jamol: 30 questions a day", "Unlimited mini games", "A streak freeze every week"] },
    { key: "premium", name: "Premium", m: 22.90, a: 19.08, bg: ["#1f8f5f", "#0b3f2a"], desc: "The full JIA experience", tag: "Most popular",
      feats: ["Everything in Pro", "Live SAT and IELTS courses", "Ask Jamol without limits", "2 essay reviews by teachers each month", "Application tracker for every university"] },
    { key: "vip", name: "VIP", m: 39.90, a: 33.25, bg: ["#34353d", "#0c0d11"], desc: "Your own admissions team", tag: "Personal mentor",
      feats: ["Everything in Premium", "Weekly 1:1 mentor sessions", "Unlimited essay reviews", "Mock interviews with alumni", "Priority support"] },
    { key: "prize", name: "Share prize", m: 22.90, a: 19.08, bg: ["#d3a24c", "#4b2d0c"], desc: "Gift Jamals Global mentorship to a friend", tag: "🎁 Prize", feats: [] },
  ].map(p => (window.JG_PLANS && window.JG_PLANS[p.key] ? Object.assign(p, window.JG_PLANS[p.key]) : p));   /* JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): the prices are the served table's (src/server/pay/plans.ts, the same numbers); without it the drawn ones */
  const GIFT = { plan: "vip", price: 29.90, minutes: 10, key: "jia.gift" };
  let cur = 2, annual = false, bought = false, giftShown = false, giftTimer = 0, busy = false;
  let plan = (window.JG_PAY && window.JG_PAY.plan()) || { key: "free", billing: "" };   /* JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): her plan is the server's (GET /api/v1/me/subscription), so the chip and the Settings card say what she has */
  const prize = { plan: "premium", months: 6, to: null, note: "" };        // the 4th option: a membership for a friend
  const planOf = k => PLANS.find(x => x.key === k);
  const durTxt = m => m === 1 ? "1 month" : `${m} months`;
  const prizeTotal = () => Math.round(Math.round(planOf(prize.plan).m * 100) * prize.months * 105 / 100) / 100;   // a prize costs 5% more; the price shown already includes it
  let lastPrize = null;
  const view = $("pr-view"), stage = $("pr-stage");
  const money = n => n.toFixed(2);
  const giftLeft = () => 0;   /* JG-PROD: owner 4 Oct R2: no exit gift and no countdown, for every account; a "jia.gift" deadline already stored is ignored, so no gift price, gift bar or chip timer is ever shown */
  const setGiftUntil = t => { try { localStorage.setItem(GIFT.key, String(t)); } catch (e) {} window.__giftUntil = t; };
  const mmss = ms => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  function sfx(f, d, v) {
    if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
    try { const C = window.__prCtx = window.__prCtx || new (window.AudioContext || window.webkitAudioContext)(); const o = C.createOscillator(), g = C.createGain(), t = C.currentTime;
      o.type = "triangle"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + d); } catch (e) {}
  }

  // build the stage: background layers, heroes, dots
  $("pr-bgs").innerHTML = PLANS.map((p, i) => `<i style="background:radial-gradient(90% 55% at 50% 30%, rgba(255,255,255,.22), transparent 70%), linear-gradient(180deg, ${p.bg[0]}, ${p.bg[1]})" data-i="${i}"></i>`).join("");
  stage.innerHTML = PLANS.map((p, i) => `<button class="pr-hero" type="button" data-i="${i}" aria-label="${p.name} plan"><img src="${ART[p.key]}" alt=""></button>`).join("");
  $("pr-dots").innerHTML = PLANS.map((p, i) => `<i data-i="${i}"></i>`).join("");
  $("pr-gift-img").src = ART.gift;
  const logo = $("pr-logo"); if (logo && window.JIA_JAMOL_FACE) logo.innerHTML = window.JIA_JAMOL_FACE;

  function layout(drag) {                                       // place each hero relative to the current one
    const w = Math.min(stage.clientWidth || 340, 560);           // on a wide screen the side plans stay close enough to click
    [...stage.children].forEach((h, i) => {
      const off = i - cur + (drag || 0) / (w * .62), a = Math.abs(off);
      const x = off * w * .62, s = a < 1 ? 1 - a * .5 : Math.max(.3, .5 - (a - 1) * .2), op = a > 1.6 ? 0 : a < 1 ? 1 - a * .42 : .58 - (a - 1) * .6;
      h.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${s})`;
      h.style.opacity = Math.max(0, op); h.style.zIndex = String(10 - Math.round(a * 3));
      h.style.filter = a > .5 ? `blur(${Math.min(2.5, a * 1.6).toFixed(1)}px) saturate(.85)` : "none";
      h.classList.toggle("on", i === cur && !drag); h.tabIndex = a > 1.6 ? -1 : 0;
    });
    [...$("pr-bgs").children].forEach((l, i) => { l.style.opacity = i === cur ? 1 : 0; });
    [...$("pr-dots").children].forEach((d, i) => d.classList.toggle("on", i === cur));
  }
  let shown = { amt: null };
  function paintCard(animate) {
    const p = PLANS[cur], isPrize = p.key === "prize", gift = !isPrize && p.key === GIFT.plan && annual && giftLeft() > 0;
    const price = isPrize ? prizeTotal() : p.m === 0 ? 0 : gift ? GIFT.price : annual ? p.a : p.m;
    const card = $("pr-card");
    if (animate && !reduce) { card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap"); }
    const from = shown.amt == null ? price : shown.amt, t0 = performance.now(), dur = animate && !reduce ? 420 : 0;
    const step = now => { const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3); $("pr-amt").textContent = price === 0 && k === 1 ? "0" : money(from + (price - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); shown.amt = price;
    $("pr-toggle").style.visibility = isPrize ? "hidden" : "";               // a prize is paid once: no monthly or annual
    $("pr-feats").hidden = isPrize; $("pr-prize").hidden = !isPrize;
    if (isPrize) { paintPrize(); return; }
    $("pr-per").textContent = p.m === 0 ? "forever" : "/month";
    $("pr-old").textContent = gift ? `$${money(p.m)}` : annual && p.m ? `$${money(p.m)}` : "";
    $("pr-pill").textContent = gift ? "🎁 Gift price" : p.tag || (annual ? "Annual" : "Monthly");
    $("pr-pill").className = `pr-pill${p.key === "premium" ? " hot" : ""}${gift ? " gift" : ""}`;
    $("pr-note").textContent = p.m === 0 ? "No card needed" : window.JG_ENGINE && !window.JG_PAY ? "Payments open soon" : gift ? `Billed $${money(GIFT.price * 12)} for the first year` : annual ? (window.JG_ENGINE ? `One payment of $${money(p.a * 12)} · save 17%` : `Billed $${money(p.a * 12)} yearly · save 17%`) : window.JG_ENGINE ? "One payment · no auto-renewal" : "Billed monthly · cancel anytime";   /* JG-PROD: owner 20 Oct 2026 (m1 pay, honesty): a real student never reads "cancel anytime" or "Billed … yearly" while nobody can pay (no JG_PAY: PAYMENTS off) nor a renewal that does not exist (one payment buys one period); the demo keeps the drawn notes */
    $("pr-name").textContent = p.name; $("pr-desc").textContent = p.desc;
    $("pr-feats").innerHTML = p.feats.map(f => `<li><i aria-hidden="true"></i>${f}</li>`).join("");
    const mine = plan.key === p.key && !(window.JG_PAY && window.JG_PAY.renewable());   /* JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): nothing renews by itself, so in her plan's last 5 days its button buys the next period */
    $("pr-cta").textContent = p.m === 0 ? (mine ? "Continue with Free" : "Switch to Free") : mine ? "Your current plan" : `Get ${p.name}`;
    $("pr-cta").disabled = mine && p.m > 0;
    const left = giftLeft();
    $("pr-giftbar").hidden = !(left > 0 && !bought);
    if (left > 0) $("pr-giftbar-t").textContent = mmss(left);
  }
  function paintPrize() {
    const name = planOf(prize.plan).name;
    $("pr-per").textContent = prize.months === 1 ? "/month" : `/${prize.months} months`;
    $("pr-old").textContent = "";
    $("pr-pill").textContent = "🎁 Prize"; $("pr-pill").className = "pr-pill prize";
    $("pr-note").textContent = "One payment · no auto-renewal";
    $("pr-name").textContent = "Share prize"; $("pr-desc").textContent = "Gift Jamals Global mentorship to a friend";
    $("pr-prize").querySelectorAll("[data-pp]").forEach(b => b.setAttribute("aria-checked", String(b.dataset.pp === prize.plan)));
    $("pr-prize").querySelectorAll("[data-pm]").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.pm === prize.months)));
    $("pz-sum").textContent = `${name} for ${durTxt(prize.months)}. They open it like a real present.`;
    $("pr-cta").textContent = "Choose a friend"; $("pr-cta").disabled = false;
  }
  $("pr-prize").addEventListener("click", e => {
    const a = e.target.closest("[data-pp]"), b = e.target.closest("[data-pm]"); if (!a && !b) return;
    if (a) prize.plan = a.dataset.pp; if (b) prize.months = +b.dataset.pm;
    sfx(640, .07); paintCard(true);
  });
  function go(i) { const n = Math.max(0, Math.min(PLANS.length - 1, i)); if (n === cur) { layout(); return; } cur = n; sfx(520 + n * 90, .08); layout(); paintCard(true); }
  // swipe the stage, like the product carousel
  let dx0 = null, dx = 0;
  stage.addEventListener("pointerdown", e => { dx0 = e.clientX; dx = 0; stage.setPointerCapture(e.pointerId); stage.classList.add("drag"); });
  stage.addEventListener("pointermove", e => { if (dx0 == null) return; dx = e.clientX - dx0; layout(dx); });
  const up = e => {
    if (dx0 == null) return; dx0 = null; stage.classList.remove("drag");
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    else { const hit = document.elementFromPoint(e.clientX, e.clientY), h = hit && hit.closest && hit.closest(".pr-hero"); if (h && Math.abs(dx) < 6) go(+h.dataset.i); else layout(); }
  };
  stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
  stage.addEventListener("click", e => { if (e.detail === 0) { const h = e.target.closest(".pr-hero"); if (h) go(+h.dataset.i); } });
  stage.addEventListener("keydown", e => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
  $("pr-dots").addEventListener("click", e => { const d = e.target.closest("[data-i]"); if (d) go(+d.dataset.i); });
  $("pr-toggle").addEventListener("click", e => {
    const b = e.target.closest("[data-b]"); if (!b) return;
    annual = b.dataset.b === "annual";
    $("pr-toggle").querySelectorAll("[data-b]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    paintCard(true);
  });

  // open, and the gift when someone tries to leave
  function setAnnual(v) { annual = v; $("pr-toggle").querySelectorAll("[data-b]").forEach(x => x.setAttribute("aria-pressed", String((x.dataset.b === "annual") === v))); }
  function openPricing(focusKey) {
    if (focusKey) cur = Math.max(0, PLANS.findIndex(p => p.key === focusKey));
    if (giftLeft() > 0 && !bought && focusKey === GIFT.plan) setAnnual(true);           // the gift is a yearly price
    view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 66); view.hidden = false;
    $("pr-pay").hidden = true; $("pr-done").hidden = true; $("pr-gift").hidden = true; $("pz-friend").hidden = true; $("pz-sent").hidden = true;
    requestAnimationFrame(() => { layout(); paintCard(false); });
    clearInterval(giftTimer);
    /* JG-PROD: owner 4 Oct R2: no gift countdown to tick */
    setTimeout(() => $("pr-close").focus({ preventScroll: true }), 60);
  }
  window.JIA_openPricing = openPricing;
  function reallyClose() { view.hidden = true; }
  function tryClose() {
    if (!$("pz-sent").hidden) { $("pz-sent").hidden = true; return; }
    if (!$("pz-friend").hidden) { $("pz-friend").hidden = true; return; }
    if (!$("pr-pay").hidden) { $("pr-pay").hidden = true; return; }
    if (!$("pr-gift").hidden) { closeGift(false); return; }
    /* JG-PROD: owner 4 Oct R2: closing the plans just closes them; no "Wait! A gift before you go" */
    reallyClose();
  }
  function showGift() {
    giftShown = true;
    if (giftLeft() <= 0) setGiftUntil(Date.now() + GIFT.minutes * 60000);
    const g = $("pr-gift"); g.hidden = false; g.classList.remove("open"); void g.offsetWidth; g.classList.add("open");
    $("pr-gift-t").textContent = mmss(giftLeft());
    [0, .12, .24].forEach((d, k) => setTimeout(() => sfx(660 + k * 220, .18, .07), d * 1000 + 500));
    setTimeout(() => $("pr-gift-claim").focus({ preventScroll: true }), 80);
  }
  function closeGift(expired) { $("pr-gift").hidden = true; if (expired) { setGiftUntil(0); paintCard(false); } else reallyClose(); }
  $("pr-close").addEventListener("click", tryClose);
  $("pr-gift-no").addEventListener("click", () => closeGift(false));
  $("pr-gift-claim").addEventListener("click", () => { $("pr-gift").hidden = true; cur = PLANS.findIndex(x => x.key === GIFT.plan); annual = true; $("pr-toggle").querySelectorAll("[data-b]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.b === "annual"))); layout(); paintCard(true); checkout(true); });
  $("pr-giftbar").addEventListener("click", () => { setAnnual(true); const gi = PLANS.findIndex(x => x.key === GIFT.plan); if (cur !== gi) go(gi); else paintCard(true); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !view.hidden) { e.preventDefault(); e.stopImmediatePropagation(); tryClose(); } }, true);

  // checkout (a demo: no money moves)
  let payFor = null;
  function checkout(gift) {
    const p = PLANS[cur], isGift = gift || (p.key === GIFT.plan && giftLeft() > 0 && annual);
    const price = isGift ? GIFT.price : annual ? p.a : p.m, yearly = isGift || annual;
    payFor = { p, price, yearly, gift: isGift };
    $("pr-pay-img").src = ART[p.key];
    $("pr-pay-name").textContent = `JIA ${p.name}${yearly ? ", yearly" : ", monthly"}`;
    $("pr-pay-sum").textContent = yearly ? `$${money(price)}/month · $${money(price * 12)} today` : `$${money(price)} today, then monthly`;
    $("pr-pay-go").textContent = `Pay $${money(yearly ? price * 12 : price)}`;
    $("pr-pay-go").disabled = false; if (window.JG_ENGINE && !window.JG_PAY) { $("pr-pay-name").textContent = "Payments are coming soon"; $("pr-pay-sum").textContent = `You can't buy ${p.key === "prize" ? "a prize for a friend" : `JIA ${p.name}`} in the app yet. Nothing is charged.`; $("pr-pay-go").textContent = "OK"; } [".pr-pay-h", "#pr-methods", ".pr-demo"].forEach(s => { $("pr-pay").querySelector(s).style.display = window.JG_ENGINE && !window.JG_PAY ? "none" : ""; }); $("pr-pay-go").style.marginTop = window.JG_ENGINE && !window.JG_PAY ? "16px" : ""; $("pr-pay").hidden = false; if (window.JG_PAY) window.JG_PAY.sheet(payFor);   /* JG-PROD: owner 4 Oct R13, a real student who taps a plan's button gets an honest sheet: the design's own checkout sheet says payments are coming soon (no payment methods, no "Pay", no demo note; the OK button keeps the gap the hidden "Pay with" gave); the demo family keeps the drawn checkout; JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): with payments open (JG_PAY) the drawn checkout takes a real payment through jg-pay.js */
  }
  $("pr-cta").addEventListener("click", () => { const p = PLANS[cur]; if (p.key === "prize" && (!window.JG_ENGINE || window.JG_PAY)) { openFriend(); return; } if (p.m === 0) { tryClose(); return; } checkout(false); });   /* JG-PROD: owner 4 Oct R13, a real student's prize opens the same "coming soon" sheet, not the friend picker of invented people; JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): with payments open the prize is bought for "Anyone, with a link" */
  $("pr-pay").addEventListener("click", e => { if (e.target.closest("[data-pay-close]")) $("pr-pay").hidden = true; });
  $("pr-methods").addEventListener("click", e => { const m = e.target.closest("[data-m]"); if (!m) return; $("pr-methods").querySelectorAll("[data-m]").forEach(x => x.setAttribute("aria-checked", String(x === m))); });
  $("pr-pay-go").addEventListener("click", () => {
    const b = $("pr-pay-go"); if (window.JG_PAY) { window.JG_PAY.pay(payFor, b); return; } if (window.JG_ENGINE) { $("pr-pay").hidden = true; return; } b.disabled = true; b.innerHTML = '<span class="pr-spin"></span>Processing…';   /* JG-PROD: owner 4 Oct R13, a real student's "OK" just closes the sheet: no "Processing…", no "Welcome to Pro!", no confetti, nothing bought; JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): with payments open the button pays through jg-pay.js (the provider's own page) */
    setTimeout(() => {
      if (payFor.prize) { prizeSent(payFor.prize); return; }
      bought = true; plan = { key: payFor.p.key, billing: payFor.yearly ? "yearly" : "monthly" };
      if (payFor.gift) setGiftUntil(0);
      $("pr-pay").hidden = true;
      $("pr-done-img").src = ART[payFor.p.key]; $("pr-done-t").textContent = `Welcome to ${payFor.p.name}!`;
      $("pr-done-s").textContent = payFor.gift ? "Your gift is active. Everything is unlocked for the year. 🎉" : "Everything in your plan is unlocked. Let's get you into MIT. 🎉";
      $("pr-done").hidden = false; confetti(); [523, 659, 784, 1046].forEach((f, k) => setTimeout(() => sfx(f, .25, .07), k * 110));
      paintChip(); paintCard(false);
      if (window.JIA_notify) window.JIA_notify({ icon: ART[payFor.p.key], text: `<b>JIA ${payFor.p.name}</b> is active. Enjoy everything in your plan!` });
    }, reduce ? 200 : 1300);
  });
  // the 4th option: pick a friend, pay once, send the prize
  const friends = () => {
    const P = !window.JG_ENGINE && window.JIA_people; if (!P) return [];   /* JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): a real student's prize goes to "Anyone, with a link", never to the design's invented classmates (R13) */
    const ids = [...P.ORDER.filter(id => P.PEOPLE[id] && P.PEOPLE[id].kind !== "teacher"), ...Object.keys(P.PEOPLE).filter(id => /^lg\d+$/.test(id))];
    return ids.map(id => ({ id, name: P.PEOPLE[id].name, tag: P.PEOPLE[id].tag, av: P.AV[id] || "" }));
  };
  function paintFriends() {
    const q = $("pz-search").value.trim().toLowerCase(), list = friends().filter(f => !q || f.name.toLowerCase().includes(q)), sel = prize.to && prize.to.id;
    $("pz-people").innerHTML = `<button type="button" role="radio" class="pz-p" data-f="link" aria-checked="${sel === "link"}"><i class="pz-link-ic" aria-hidden="true">🔗</i><span><b>Anyone, with a link</b><small>Send it on Telegram, Instagram or WhatsApp</small></span></button>`
      + list.map(f => `<button type="button" role="radio" class="pz-p" data-f="${f.id}" aria-checked="${sel === f.id}"><img src="${f.av}" alt=""><span><b>${f.name}</b><small>${f.tag || "Student"}</small></span></button>`).join("")
      + (list.length ? "" : `<p class="pz-empty">No one by that name here. Send it with a link instead.</p>`);
    $("pz-go").disabled = !prize.to;
    $("pz-go").textContent = prize.to ? `Continue · $${money(prizeTotal())}` : "Choose a friend";
  }
  function openFriend() {
    prize.to = null; $("pz-search").value = ""; $("pz-note").value = prize.note;
    $("pz-img").src = ART.prize; $("pz-what").textContent = `${planOf(prize.plan).name} · ${durTxt(prize.months)} · $${money(prizeTotal())}`;
    paintFriends(); $("pz-friend").hidden = false;
    setTimeout(() => { const f = $("pz-people").querySelector(".pz-p"); if (f) f.focus({ preventScroll: true }); }, 80);
  }
  $("pz-people").addEventListener("click", e => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    const id = b.dataset.f, f = friends().find(x => x.id === id);
    prize.to = id === "link" ? { id: "link", name: "" } : { id, name: f ? f.name : "" };
    sfx(700, .06); paintFriends();
    const again = $("pz-people").querySelector(`[data-f="${id}"]`); if (again) again.focus({ preventScroll: true });
  });
  $("pz-search").addEventListener("input", paintFriends);
  $("pz-note").addEventListener("input", () => { prize.note = $("pz-note").value; });
  $("pz-friend").addEventListener("click", e => { if (e.target.closest("[data-friend-close]")) $("pz-friend").hidden = true; });
  $("pz-go").addEventListener("click", () => {
    if (!prize.to) return;
    const total = prizeTotal(), name = planOf(prize.plan).name, to = prize.to;
    prize.note = $("pz-note").value.trim();
    payFor = { prize: { plan: prize.plan, months: prize.months, to, note: prize.note }, price: total };
    $("pz-friend").hidden = true;
    $("pr-pay-img").src = ART.prize;
    $("pr-pay-name").textContent = to.id === "link" ? `Prize: JIA ${name}, ${durTxt(prize.months)}` : `Prize for ${to.name}`;
    $("pr-pay-sum").textContent = `${name} · ${durTxt(prize.months)} · one payment, no renewal`;
    $("pr-pay-go").textContent = `Pay $${money(total)}`; $("pr-pay-go").disabled = false; $("pr-pay").hidden = false; if (window.JG_PAY) window.JG_PAY.sheet(payFor);   /* JG-PROD: owner 20 Oct 2026 (m1 pay, PAYMENTS on): the sheet shows the methods with a rail, the price in soum and that it is one payment */
  });
  const prizeCode = () => "JG-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  function prizeSent(z) {
    bought = true; $("pr-pay").hidden = true;
    const name = planOf(z.plan).name, who = z.to.id === "link" ? "" : z.to.name, fn = who.split(" ")[0];
    lastPrize = Object.assign({ code: prizeCode() }, z);
    $("pz-sent-img").src = ART.prize;
    $("pz-sent-t").textContent = who ? `Prize sent to ${fn}! 🎁` : "Your prize is ready! 🎁";
    $("pz-sent-s").textContent = who ? `${who} gets ${name} for ${durTxt(z.months)}. They open it like a real present, and the letter inside says how long it lasts.`
      : `${name} for ${durTxt(z.months)}. Send the link to your friend: they open it like a real present.`;
    $("pz-preview").textContent = who ? `See what ${fn} will see` : "See what they'll see";
    $("pz-share-note").textContent = "";
    $("pz-sent").hidden = false; confetti(); [523, 659, 784, 1046].forEach((f, k) => setTimeout(() => sfx(f, .25, .07), k * 110));
    paintCard(false);
    if (window.JIA_notify) window.JIA_notify({ icon: ART.prize, text: who ? `<b>Your prize is on its way</b> to ${who}: ${name}, ${durTxt(z.months)} 🎁` : `<b>Your prize link is ready:</b> ${name}, ${durTxt(z.months)} 🎁` });
    setTimeout(() => $("pz-preview").focus({ preventScroll: true }), 120);
  }
  const prizeLink = () => `${/^https?:/.test(location.href) ? location.href.split("#")[0] : "https://claude.ai"}#prize=${lastPrize.code}`;
  $("pz-share").addEventListener("click", async e => {
    const b = e.target.closest("[data-ps]"); if (!b || !lastPrize) return;
    const t = b.dataset.ps, url = prizeLink(), say = m => { $("pz-share-note").textContent = m; };
    const text = `🎁 I got you a prize on Jamals Global: ${planOf(lastPrize.plan).name} mentorship for ${durTxt(lastPrize.months)}! Open it and start your journey.`;
    if (t !== "copy" && navigator.share) { try { await navigator.share({ title: "A prize for you", text, url }); say("Sent! 🎉"); return; } catch (err) { if (err && err.name === "AbortError") return; } }
    if (t === "telegram") { try { window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank", "noopener"); } catch (err) {} say("Opening Telegram…"); return; }
    if (t === "whatsapp") { try { window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener"); } catch (err) {} say("Opening WhatsApp…"); return; }
    try { await navigator.clipboard.writeText(`${text} ${url}`); say(t === "instagram" ? "Copied! Paste it in an Instagram message or story." : "Link copied. 🎉"); }
    catch (err) { say(`Your prize code: ${lastPrize.code}`); }
  });
  $("pz-preview").addEventListener("click", () => { if (lastPrize && window.JIA_GIFT) window.JIA_GIFT.open({ from: JG_ME.fullName, plan: lastPrize.plan, months: lastPrize.months, note: lastPrize.note, preview: true, to: lastPrize.to.name }); }); /* JG-PROD: identity */
  $("pz-done").addEventListener("click", () => { $("pz-sent").hidden = true; });
  window.JIA_pricing = {                                                    // a prize you received: the membership starts now
    grant(key, months, from) {
      const G = window.JIA_GIFT, until = G ? G.untilOf(months) : null, p = planOf(key);
      bought = true; plan = { key, billing: "gift", until, from };
      paintChip(); if (!view.hidden) paintCard(false);
      if (window.JIA_notify) window.JIA_notify({ icon: ART[key], text: `<b>JIA ${p.name} is yours for ${durTxt(months)}</b>, a prize from ${from}. Active until ${until && G ? G.fmt(until) : ""}. 🎓` });
    },
  };
  $("pr-done-go").addEventListener("click", reallyClose);
  function confetti() {
    if (reduce) return;
    const cols = ["#f5c542", "#66c69a", "#ef6c9a", "#4f8fdf", "#fff"];
    for (let i = 0; i < 90; i++) { const c = document.createElement("i"); c.className = "gm-conf"; c.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 5]};--dx:${(Math.random() - .5) * 180}px;--r:${Math.random() * 800}deg;animation-delay:${Math.random() * .5}s;animation-duration:${2 + Math.random() * 1.4}s`; view.appendChild(c); setTimeout(() => c.remove(), 4000); }
  }

  // entry points: the chip under your name on Home, and the plan card in Settings
  function paintChip() {
    const chip = $("plan-chip"), p = PLANS.find(x => x.key === plan.key), left = giftLeft();
    if (chip) {
      chip.textContent = plan.key !== "free" ? `✦ ${p.name}` : left > 0 ? `🎁 Gift ${mmss(left)}` : "✦ Upgrade";
      chip.classList.toggle("paid", plan.key !== "free"); chip.classList.toggle("gift", plan.key === "free" && left > 0);
    }
    const sp = $("set-plan");
    if (sp) {
      $("set-plan-img").src = ART[plan.key === "free" ? "premium" : plan.key];
      $("set-plan-t").textContent = plan.key === "free" ? "Free plan" : plan.billing === "gift" ? `🎁 ${p.name} plan` : `${p.name} plan${plan.billing ? `, ${plan.billing}` : ""}`;
      $("set-plan-s").textContent = plan.key === "free" ? (left > 0 ? `Your gift ends in ${mmss(left)}` : "Unlock live courses, unlimited Jamol and more")
        : plan.until ? `A prize from ${plan.from} · until ${plan.until.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : "Thanks for supporting JIA";
      $("set-plan-b").textContent = plan.key === "free" ? "See plans" : "Manage";
    }
  }
  const chip = $("plan-chip"); if (chip) chip.addEventListener("click", e => { e.stopPropagation(); openPricing(giftLeft() > 0 ? GIFT.plan : null); });
  const sp = $("set-plan"); if (sp) sp.addEventListener("click", () => openPricing(plan.key === "free" ? (giftLeft() > 0 ? GIFT.plan : "premium") : plan.key));
  paintChip();   /* JG-PROD: owner 4 Oct R2: no countdown, so the chip is painted when the plan changes (after a purchase or a prize), not every second */
  window.addEventListener("resize", () => { if (!view.hidden) layout(); });
})();

